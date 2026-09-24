// learning/structural.mjs : the topology is part of the computational state, and changing
// it is never a thing a learning rule may simply do.
//
// This rule accumulates two kinds of evidence over a window:
//   co-activation  pairs of cells that fired on the same tick with no edge between them
//   disuse         live edges that are weak and have carried nothing for staleTicks
// When the evidence crosses the rule's own threshold it writes a Proposal to brain.gate
// and prints it. The gate decides. core/gate.mjs defaultPolicy wants coActivations >= 8
// for a grow and staleTicks >= 1000 with |w| < 0.05 for a prune, and every proposal and
// decision is a ledger event. The rule touches the connectome ONLY after an approval:
// there is no path in this file from evidence to structure that does not pass the gate.
import { defineRule, mergeConfig } from './registry.mjs';
import { ACTIVE } from '../core/connectome.mjs';

const KEY = (a, b) => (a < b ? a * 2097152 + b : b * 2097152 + a);

export const structural = defineRule({
  name: 'structural',
  scope: 'structure',
  doc: 'Accumulates co-activation and disuse evidence and submits edge.grow and edge.prune proposals to brain.gate with printed evidence. Never writes structure without an approval.',
  defaults: {
    every: 8,               // ticks between grow sweeps
    growThreshold: 8,       // co-activations before a grow proposal is written
    decayEvery: 64,         // ticks between co-activation decays
    pruneSweepEvery: 512,   // ticks between disuse sweeps
    staleTicks: 1000,       // how long an edge must be silent to count as disused
    wFloor: 0.05,           // and how weak
    maxProposalsPerTick: 4,
    maxPairs: 200000,
    w0: 0.1,                // weight a grown edge starts at
    delay0: 1,              // and its delay. core delivers nothing on a delay of 0
    conf0: 0.2,
    print: false,
  },

  // target is a proposal descriptor built by tick(): { kind, src, dst, srcPort, dstPort, e }.
  // evidence is what the gate will see. Returns 1 when structure actually changed.
  apply(brain, target, evidence, ctx) {
    const cfg = mergeConfig(structural, evidence, ctx);
    const ev = { ...evidence };
    delete ev.cfg;
    if (target.kind === 'edge.grow') {
      const src = brain.cells[target.src], dst = brain.cells[target.dst];
      const p = brain.gate.propose({
        kind: 'edge.grow',
        what: { src: src.id, dst: dst.id, srcPort: target.srcPort, dstPort: target.dstPort },
        why: 'co-activation without a path',
        evidence: ev, by: 'learning.structural',
      }, ctx);
      if (cfg.print) print(cfg, 'edge.grow ' + src.id + ' -> ' + dst.id + ' ' + fmt(ev) + ' => ' + p.status);
      if (p.status !== 'approved') return 0;
      brain.connect(src.id, target.srcPort, dst.id, target.dstPort, { w: cfg.w0, delay: cfg.delay0, conf: cfg.conf0, by: 'learning.structural' });
      return 1;
    }
    if (target.kind === 'edge.prune') {
      const e = target.e, c = brain.connectome;
      if (!(c.flags[e] & ACTIVE)) return 0;
      const p = brain.gate.propose({
        kind: 'edge.prune',
        what: { e, src: brain.cells[c.src[e]].id, dst: brain.cells[c.dst[e]].id },
        why: 'disuse', evidence: ev, by: 'learning.structural',
      }, ctx);
      if (cfg.print) print(cfg, 'edge.prune e' + e + ' ' + fmt(ev) + ' => ' + p.status);
      if (p.status !== 'approved') return 0;
      c.prune(e);
      brain.stats.pruned++;
      brain.ledger.append({ type: 'edge.prune', t: ctx.t, gen: ctx.gen, e, by: 'learning.structural' });
      return 1;
    }
    throw new Error('structural: unknown target kind ' + target.kind);
  },

  init() { return { co: new Map(), since: new Map(), proposed: 0, grown: 0, pruned: 0, rejected: 0 }; },

  tick(eng, ctx) {
    const b = eng.brain, c = b.connectome, t = ctx.t;
    const cfg = eng.cfg('structural'), st = eng.st('structural');
    const own = eng.targetSet('structural');
    const fired = [...eng.firedNow].filter(i => own.has(i));
    let applied = 0;

    // evidence 1: co-activation with no path in either direction
    for (let i = 0; i < fired.length; i++) for (let j = i + 1; j < fired.length; j++) {
      const a = fired[i], d = fired[j];
      if (c.find(a, d) >= 0 || c.find(d, a) >= 0) continue;
      const k = KEY(a, d);
      const n = (st.co.get(k) || 0) + 1;
      if (st.co.size < cfg.maxPairs || st.co.has(k)) st.co.set(k, n);
      if (!st.since.has(k)) st.since.set(k, t);
    }
    if (cfg.decayEvery && t > 0 && t % cfg.decayEvery === 0) {
      for (const [k, v] of st.co) { if (v <= 1) { st.co.delete(k); st.since.delete(k); } else st.co.set(k, v - 1); }
    }

    // evidence 2 -> proposals, on the rule's own period
    if (cfg.every && t % cfg.every === 0) {
      let made = 0;
      for (const [k, n] of st.co) {
        if (n < cfg.growThreshold) continue;
        if (made >= cfg.maxProposalsPerTick) break;
        const a = Math.floor(k / 2097152), d = k % 2097152;
        const A = b.cells[a], D = b.cells[d];
        if (!A || !D) { st.co.delete(k); continue; }
        let src = a, dst = d, ports = b.compatiblePorts(A, D);
        if (!ports) { ports = b.compatiblePorts(D, A); src = d; dst = a; }
        st.co.delete(k);
        const since = st.since.get(k) ?? t; st.since.delete(k);
        if (!ports) continue;
        if (!eng.spend(1)) break;
        made++; st.proposed++;
        const ok = structural.apply(b, { kind: 'edge.grow', src, dst, srcPort: ports[0], dstPort: ports[1] },
          { coActivations: n, window: t - since, sinceT: since, t, cfg }, ctx);
        if (ok) st.grown++; else st.rejected++;
        applied++;
      }
    }

    // disuse sweep
    if (cfg.pruneSweepEvery && t > 0 && t % cfg.pruneSweepEvery === 0) {
      let made = 0;
      for (let e = 0; e < c.n && made < cfg.maxProposalsPerTick; e++) {
        if (!(c.flags[e] & ACTIVE)) continue;
        if (!own.has(c.dst[e])) continue;
        if (Math.abs(c.w[e]) >= cfg.wFloor) continue;
        const last = c.lastT[e] < 0 ? 0 : c.lastT[e];
        const stale = t - last;
        if (stale < cfg.staleTicks) continue;
        if (!eng.spend(1)) break;
        made++; st.proposed++;
        const ok = structural.apply(b, { kind: 'edge.prune', e },
          { staleTicks: stale, w: c.w[e], usage: c.usage[e], t, cfg }, ctx);
        if (ok) st.pruned++; else st.rejected++;
        applied++;
      }
    }
    return applied;
  },
});

function fmt(ev) {
  return Object.entries(ev).map(([k, v]) => k + '=' + (typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(4)) : v)).join(' ');
}
function print(cfg, line) {
  const out = typeof cfg.print === 'function' ? cfg.print : console.log;
  out('[learning.structural] ' + line);
}
