// cells/learning.mjs : the cells that carry learning signals through the connectome.
//
// A learning rule is not allowed to call another learning rule, and no rule reaches into
// a cell to fetch a reward or an error. Everything a rule needs from the rest of the brain
// arrives one of two ways: as a Signal on a wire, or as an event in the ledger. These
// cells are what puts it there. Reward, aggregated error and neuromodulator gain are
// ordinary cells with ordinary ports, so they are wired, scheduled, budgeted, traced and
// snapshotted exactly like every other cell in BRAIN.
//
//   reward.source    emits a num reward and appends learn.reward
//   error.aggregate  bundles the num errors of a circuit and appends learn.error
//   modulator        emits a num gain and appends learn.modulator, which rules read via ctx
//   learn.apply      runs a NAMED rule from the registry over a target set each period
//   learn.explore    samples one of its out ports from the weights of its own out edges,
//                    which is what makes a policy something the connectome holds
import { defineKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';
import { ACTIVE } from '../core/connectome.mjs';
import { getRule } from '../learning/index.mjs';

const last = (m) => (m.length ? m[m.length - 1].sig : null);
const asNumber = (sig) => {
  if (!sig) return null;
  if (sig.kind === 'num') return S.ratToNumber(sig.data);
  if (sig.kind === 'event') {
    const d = sig.data;
    if (typeof d.reward === 'number') return d.reward;
    if (typeof d.value === 'number') return d.value;
    if (typeof d.error === 'number') return d.error;
    if (typeof d.gain === 'number') return d.gain;
    return 1;
  }
  return 1;
};
const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);

// ---------------------------------------------------------------- reward
defineKind('reward.source', {
  doc: 'Emits a num reward when triggered, and appends a learn.reward ledger event naming the region the reward credits. params.from: "param" uses params.value, "signal" reads the trigger.',
  ports: { in: [{ name: 'trigger', kinds: ['num', 'event', 'hv'] }], out: [{ name: 'reward', kinds: ['num'] }] },
  defaults: { value: 1, region: null, from: 'param', scale: 1, always: false },
  init: () => ({ emitted: 0, total: 0, last: null }),
  compute: (ins, cell, ctx) => {
    const sig = last(ins[0]);
    let r = null;
    if (sig) r = cell.params.from === 'signal' ? (asNumber(sig) ?? 0) * cell.params.scale : cell.params.value;
    else if (cell.params.always) r = cell.params.value;
    if (r == null || !Number.isFinite(r)) return [null];
    const region = cell.params.region ?? cell.region;
    cell.state.emitted++; cell.state.total += r; cell.state.last = r;
    ctx.ledger.append({ type: 'learn.reward', t: ctx.t, gen: ctx.gen, cell: cell.id, region, value: r });
    return [{ kind: 'num', data: S.flt(r) }];
  },
  serialize: (s) => ({ emitted: s.emitted, total: s.total, last: s.last }),
});

// ---------------------------------------------------------------- error
defineKind('error.aggregate', {
  doc: 'Bundles the num error signals arriving from a circuit into one number (mean, sum or max), keeps a moving average, and appends a learn.error ledger event.',
  ports: { in: [{ name: 'error', kinds: ['num'] }], out: [{ name: 'total', kinds: ['num'] }] },
  defaults: { mode: 'mean', tau: 8, circuit: null },
  init: () => ({ ema: 0, seen: 0, last: 0 }),
  compute: (ins, cell, ctx) => {
    const m = ins[0];
    if (!m.length) return [null];
    let sum = 0, max = 0;
    for (const it of m) { const x = Math.abs(asNumber(it.sig) ?? 0); sum += x; if (x > max) max = x; }
    const n = m.length;
    const v = cell.params.mode === 'sum' ? sum : cell.params.mode === 'max' ? max : sum / n;
    const a = 1 / Math.max(1, cell.params.tau);
    cell.state.ema += a * (v - cell.state.ema);
    cell.state.seen += n; cell.state.last = v;
    cell.stats.surprise = cell.state.ema;
    const circuit = cell.params.circuit ?? (cell.region + '/' + cell.circuit);
    ctx.ledger.append({ type: 'learn.error', t: ctx.t, gen: ctx.gen, cell: cell.id, circuit, region: cell.region, error: v, ema: cell.state.ema, n });
    return [{ kind: 'num', data: S.flt(v) }];
  },
  serialize: (s) => ({ ema: s.ema, seen: s.seen, last: s.last }),
});

// ---------------------------------------------------------------- modulator
defineKind('modulator', {
  doc: 'Emits a num gain for a region and appends a learn.modulator ledger event. Edge rules multiply their update by it through ctx.learning.gainForCell, so one cell can turn the learning rate of a whole region up or down.',
  ports: { in: [{ name: 'in', kinds: ['num', 'event'] }], out: [{ name: 'gain', kinds: ['num'] }] },
  defaults: { base: 1, scale: 1, min: 0, max: 8, region: null, always: false },
  init: () => ({ gain: 1, emitted: 0 }),
  compute: (ins, cell, ctx) => {
    const sig = last(ins[0]);
    if (!sig && !cell.params.always) return [null];
    const x = sig ? (asNumber(sig) ?? 0) : 0;
    const gain = clamp(cell.params.base + cell.params.scale * x, cell.params.min, cell.params.max);
    const region = cell.params.region ?? cell.region;
    cell.state.gain = gain; cell.state.emitted++;
    ctx.ledger.append({ type: 'learn.modulator', t: ctx.t, gen: ctx.gen, cell: cell.id, region, gain });
    return [{ kind: 'num', data: S.flt(gain) }];
  },
  serialize: (s) => ({ gain: s.gain, emitted: s.emitted }),
});

// ---------------------------------------------------------------- run a named rule
defineKind('learn.apply', {
  doc: 'Runs a named learning rule from learning/registry over a target set each period. The modulator value arrives as a signal on the in port; the targets come from params region, circuit, cells or edges.',
  ports: { in: [{ name: 'signal', kinds: ['num', 'event'] }], out: [{ name: 'report', kinds: ['event'] }] },
  defaults: { rule: 'homeostatic', region: null, circuit: null, cells: null, edges: null, config: null, value: null, requireSignal: false },
  init: () => ({ applied: 0, sum: 0, runs: 0 }),
  compute: (ins, cell, ctx) => {
    const p = cell.params;
    const sig = last(ins[0]);
    if (p.requireSignal && !sig) return [null];
    const rule = getRule(p.rule);
    const value = sig ? asNumber(sig) : p.value;
    const cfg = p.config ? { ...rule.defaults, ...p.config } : undefined;
    const targets = resolveTargets(ctx.brain, rule, p);
    const ev = {};
    if (cfg) ev.cfg = cfg;
    if (value != null) { ev.value = value; ev.reward = value; ev.error = value; ev.gain = 1; }
    let applied = 0, sum = 0;
    for (const target of targets) {
      const r = rule.apply(ctx.brain, target, ev, ctx);
      const n = typeof r === 'number' ? r : 0;
      if (n !== 0) { sum += n; applied++; }
    }
    cell.state.runs++; cell.state.applied += applied; cell.state.sum += sum;
    ctx.ledger.append({ type: 'learn.apply', t: ctx.t, gen: ctx.gen, cell: cell.id, rule: rule.name, scope: rule.scope, targets: targets.length, applied, sum });
    return [{ kind: 'event', data: { rule: rule.name, scope: rule.scope, targets: targets.length, applied, sum, value, t: ctx.t } }];
  },
  serialize: (s) => ({ applied: s.applied, sum: s.sum, runs: s.runs }),
});

function resolveTargets(brain, rule, p) {
  if (rule.scope === 'structure') return [null];
  const c = brain.connectome;
  const cells = [];
  if (p.cells && p.cells.length) { for (const id of p.cells) cells.push(brain.cell(id).idx); }
  else for (const cell of brain.cells) {
    if (p.region && cell.region !== p.region) continue;
    if (p.circuit && cell.circuit !== p.circuit) continue;
    cells.push(cell.idx);
  }
  if (rule.scope === 'cell') return cells.map(i => brain.cells[i]);
  if (p.edges && p.edges.length) return p.edges.filter(e => c.flags[e] & ACTIVE);
  const out = [], seen = new Set();
  for (const i of cells) for (const e of c.into(i)) {
    if (!(c.flags[e] & ACTIVE) || seen.has(e)) continue;
    seen.add(e); out.push(e);
  }
  return out;
}

// ---------------------------------------------------------------- policy in the connectome
defineKind('learn.explore', {
  doc: 'Routes an incoming hv to exactly one out port, sampled from softmax(beta * mean weight of that port live out edges). The policy IS the connectome, so whatever changes those weights changes the behaviour.',
  ports: {
    in: [{ name: 'in', kinds: ['hv'] }],
    out: [{ name: 'a', kinds: ['hv'] }, { name: 'b', kinds: ['hv'] }, { name: 'c', kinds: ['hv'] }, { name: 'd', kinds: ['hv'] }],
  },
  defaults: { beta: 4, epsilon: 0 },
  init: () => ({ counts: [0, 0, 0, 0], lastPort: -1, lastP: 0, chosen: 0 }),
  compute: (ins, cell, ctx) => {
    const sig = last(ins[0]);
    const out = [null, null, null, null];
    if (!sig) return out;
    const c = ctx.brain.connectome;
    const sum = [0, 0, 0, 0], n = [0, 0, 0, 0];
    for (const e of c.outOf(cell.idx)) {
      if (!(c.flags[e] & ACTIVE)) continue;
      const p = c.srcPort[e];
      if (p > 3) continue;
      sum[p] += c.w[e]; n[p]++;
    }
    const live = [];
    for (let p = 0; p < 4; p++) if (n[p] > 0) live.push(p);
    if (live.length === 0) return out;
    const beta = cell.params.beta;
    let best = -Infinity;
    const score = live.map(p => { const s = beta * (sum[p] / n[p]); if (s > best) best = s; return s; });
    let total = 0;
    const w = score.map(s => { const x = Math.exp(s - best); total += x; return x; });
    let port = live[live.length - 1], acc = 0, p0 = 1;
    const u = ctx.rng.next();
    if (cell.params.epsilon > 0 && ctx.rng.next() < cell.params.epsilon) {
      port = live[ctx.rng.int(live.length)];
      p0 = 1 / live.length;
    } else {
      for (let i = 0; i < live.length; i++) { acc += w[i] / total; if (u <= acc) { port = live[i]; p0 = w[i] / total; break; } }
    }
    cell.state.counts[port]++; cell.state.lastPort = port; cell.state.lastP = p0; cell.state.chosen++;
    ctx.ledger.append({ type: 'learn.choice', t: ctx.t, gen: ctx.gen, cell: cell.id, port, p: p0 });
    out[port] = { kind: 'hv', data: sig.data };
    return out;
  },
  serialize: (s) => ({ counts: s.counts.slice(), lastPort: s.lastPort, lastP: s.lastP, chosen: s.chosen }),
  deserialize: (j) => ({ counts: j.counts || [0, 0, 0, 0], lastPort: j.lastPort ?? -1, lastP: j.lastP ?? 0, chosen: j.chosen ?? 0 }),
});
