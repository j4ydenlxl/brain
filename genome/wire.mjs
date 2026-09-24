// genome/wire.mjs: the machinery the organism shares with its own emitted source.
//
// THE ORGANISM IS SOURCE. seeds/organism.mjs grows a brain, genome/emit.mjs writes that
// brain out as .mjs files (one call per cell, one call per edge), genome/load.mjs reads
// them back. Both the grower and the loader need the same three things, so they live here:
//
//   1. legality. Every edge is checked with the rule core/brain.mjs uses in compatiblePorts:
//      the source port's kinds must be a subset of the destination port's kinds. A subset
//      is stricter than Brain.connect's "some kind can meet", so an organism wired here can
//      never have a signal refused at emit time for a kind mismatch.
//   2. a bulk wiring path. Core now keeps a key map, so Brain.connect is linear rather than
//      quadratic and either route finishes. Measured on this machine, adding the same
//      distinct edges into the same brain: 20,000 edges Brain.connect 14.1 ms, Wiring
//      9.4 ms; 200,000 edges 106.3 ms against 73.8 ms; 432,836 edges 278.8 ms against
//      230.7 ms. Wiring is kept because it is 1.21x to 1.50x faster over that range and
//      because it enforces the stricter subset rule below, which Brain.connect does not.
//   3. exact float32 text. Connectome.w and .conf are Float32Array. f32() prints the
//      shortest decimal that reads back to the identical float32, so the emitted source
//      round trips bit for bit.
//
// notes/genome.md carries the three core changes this file once worked around. All three
// are in core now and the workarounds are gone. The local reindex was retired after being
// measured at a median 2.82 ms against core's own 2.85 ms on the 432,836 edge connectome,
// which is the same number, so core indexes lazily on its own and nothing here reaches
// into its internals any more.
import { createHash } from 'node:crypto';
import { makePolicy } from '../core/gate.mjs';

// ---------------------------------------------------------------- exact float32 text
/**
 * Shortest decimal string that Math.fround reads back to exactly this float32.
 * @param {number} x
 * @returns {string}
 */
export function f32(x) {
  const v = Math.fround(x);
  if (Number.isInteger(v) && Math.abs(v) < 1e9) return String(v);
  for (let p = 1; p <= 9; p++) {
    const s = Number(v.toPrecision(p));
    if (Math.fround(s) === v) return String(s);
  }
  return String(v);
}

// ---------------------------------------------------------------- canonical JSON
/**
 * JSON with object keys in sorted order, so two structurally equal params hash the same.
 * @param {*} v
 * @returns {string}
 */
export function stable(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? 'null';
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  const keys = Object.keys(v).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
}

// ---------------------------------------------------------------- port legality
/**
 * The key that identifies what an out port emits: its kinds, sorted and joined.
 * @param {{kinds: string[]}} port
 * @returns {string}
 */
export function portKey(port) { return [...port.kinds].sort().join('|'); }

/**
 * Does this in port accept everything the out port can emit?
 * @param {{kinds: string[]}} outPort
 * @param {{kinds: string[]}} inPort
 * @returns {boolean}
 */
export function accepts(outPort, inPort) { return outPort.kinds.every(k => inPort.kinds.includes(k)); }

/**
 * Every legal [srcPort, dstPort] pair between two cells, in port order.
 * Brain.compatiblePorts returns the first of these; this returns all of them.
 * @param {object} a source cell
 * @param {object} b destination cell
 * @returns {Array<[number, number]>}
 */
export function portPairs(a, b) {
  const out = [];
  for (let sp = 0; sp < a.ports.out.length; sp++) {
    for (let dp = 0; dp < b.ports.in.length; dp++) if (accepts(a.ports.out[sp], b.ports.in[dp])) out.push([sp, dp]);
  }
  return out;
}

/**
 * Check one edge against the same rule, with a reason when it fails.
 * @returns {string|null} null when legal, otherwise the reason
 */
export function edgeFault(a, b, sp, dp) {
  if (!a) return 'no source cell';
  if (!b) return 'no destination cell';
  if (!(sp >= 0 && sp < a.ports.out.length)) return a.id + ' has no out port ' + sp;
  if (!(dp >= 0 && dp < b.ports.in.length)) return b.id + ' has no in port ' + dp;
  if (!accepts(a.ports.out[sp], b.ports.in[dp])) {
    return a.id + '.' + a.ports.out[sp].name + ' emits ' + a.ports.out[sp].kinds.join('|') +
      ', ' + b.id + '.' + b.ports.in[dp].name + ' accepts ' + b.ports.in[dp].kinds.join('|');
  }
  return null;
}

// ---------------------------------------------------------------- bulk wiring
/**
 * A wiring session over one brain: legality, dedupe, append, index once at the end.
 */
export class Wiring {
  /**
   * @param {object} brain
   * @param {object} [opts] { reserve: expected edge count, strict: throw on an illegal edge }
   */
  constructor(brain, { reserve = 0, strict = true } = {}) {
    this.brain = brain;
    this.strict = strict;
    this.seen = new Set();
    this.added = 0; this.duplicates = 0; this.illegal = 0;
    if (reserve > brain.connectome.cap) brain.connectome._alloc(nextPow2(reserve));
  }
  /**
   * @param {number} srcIdx @param {number} dstIdx @param {number} sp @param {number} dp
   * @param {object} [opts] { w, delay, conf }
   * @returns {number} the edge id, or -1 when refused or already present
   */
  add(srcIdx, dstIdx, sp, dp, { w = 1, delay = 0, conf = 0.5 } = {}) {
    const cells = this.brain.cells;
    const a = cells[srcIdx], b = cells[dstIdx];
    const fault = edgeFault(a, b, sp, dp);
    if (fault) {
      this.illegal++;
      if (this.strict) throw new Error('wire: ' + fault);
      return -1;
    }
    const key = ((srcIdx * 2097152 + dstIdx) * 16 + sp) * 16 + dp;
    if (this.seen.has(key)) { this.duplicates++; return -1; }
    this.seen.add(key);
    const e = this.brain.connectome.add(srcIdx, dstIdx, { srcPort: sp, dstPort: dp, w, delay, conf });
    this.added++;
    return e;
  }
  /**
   * Warm core's edge index through its own public read, so the first tick after a build
   * is not paying for it. Core builds the index itself on first use either way.
   */
  finish() { this.brain.connectome.outOf(0); return this; }
}

function nextPow2(n) { let c = 1024; while (c < n) c *= 2; return c; }

// ---------------------------------------------------------------- content hash
/**
 * A sha256 over everything the emitted source carries: every cell in index order and
 * every edge in index order, floats as the exact text that is written to disk. The hash
 * does not cover runtime state, ledger, clock or statistics, because the genome is the
 * structure, not the run.
 * @param {object} brain
 * @returns {string} 64 hex characters
 */
export function contentHash(brain) {
  const h = createHash('sha256');
  h.update('brain.genome.v1\n');
  h.update('cells ' + brain.cells.length + '\n');
  // Rows are JSON arrays, so the framing is printable, unambiguous, and cannot be forged
  // by a cell id that happens to contain the separator.
  for (const c of brain.cells) {
    h.update(JSON.stringify([c.id, c.kind, c.region, c.circuit, stable(c.params), stable(c.policy)]) + '\n');
  }
  const k = brain.connectome;
  h.update('edges ' + k.n + '\n');
  for (let e = 0; e < k.n; e++) {
    h.update(JSON.stringify([brain.cells[k.src[e]].id, brain.cells[k.dst[e]].id, k.srcPort[e], k.dstPort[e], f32(k.w[e]), k.delay[e], f32(k.conf[e])]) + '\n');
  }
  return h.digest('hex');
}

/**
 * The acceptor index: for every distinct out-port kind set in the brain, the cells that
 * have an in port accepting all of it, in ascending cell index, with the in port to use.
 * Wiring picks a destination from a slice of one of these arrays, so choosing a legal
 * edge is a binary search and not a scan over 40,000 cells.
 * @param {object} brain
 * @returns {Map<string, {idx: Uint32Array, port: Uint8Array}>}
 */
export function acceptorIndex(brain) {
  const keys = new Map(); // key -> representative out port
  for (const c of brain.cells) for (const p of c.ports.out) if (!keys.has(portKey(p))) keys.set(portKey(p), p);
  const out = new Map();
  for (const [key, outPort] of keys) {
    const idx = [], port = [];
    for (let i = 0; i < brain.cells.length; i++) {
      const ins = brain.cells[i].ports.in;
      for (let dp = 0; dp < ins.length; dp++) if (accepts(outPort, ins[dp])) { idx.push(i); port.push(dp); break; }
    }
    out.set(key, { idx: Uint32Array.from(idx), port: Uint8Array.from(port) });
  }
  return out;
}

// ---------------------------------------------------------------- growth policy
/**
 * What an in port is claimed by once an afferent lands on it. A port whose source emits
 * exactly one kind is claimed by that kind. A polymorphic out port (predict.next.prediction
 * re-emits whatever it observed, so it is vec, hv or num depending on its own afferent) is
 * claimed by that specific source cell, because two such ports agree on paper and still
 * deliver different kinds at run time.
 * @param {object} cell source cell
 * @param {number} sp source port index
 * @returns {string}
 */
export function claimKey(cell, sp) {
  const out = cell.ports.out[sp];
  const key = portKey(out);
  return out.kinds.length > 1 ? key + '#' + cell.idx : key;
}

/**
 * The gate policy this organism runs under: core's policy, plus one rule about structural
 * growth.
 *
 * WHY: a cell's in port is monomorphic in practice even when its declared kinds are not.
 * A cell that has been fed `num` keeps `num` state, and the next tick's `vec` on the same
 * port makes it read a field that is not there ("num: cannot convert undefined"). Wiring
 * enforces that at build time by claiming each in port for the first afferent's kind.
 * Growth has no such memory: Brain.compatiblePorts compares declared kind sets, so a
 * co-activation edge can legally land a second kind on a port that is already speaking a
 * first one. MEASURED at majors 40 over fifty ticks: growth on with core's own policy grew
 * 3230 edges, produced 22 clashing in ports, and the organism threw 211 times. With this
 * rule the organism still grows and throws nothing.
 *
 * The claim table is built from the connectome the first time growth proposes, and then
 * kept up to date as proposals are approved. A pruned edge does not release its claim,
 * which is the conservative direction: the destination cell's state is still whatever the
 * pruned afferent made it.
 *
 * @param {object} [gateOpts] thresholds forwarded to core's makePolicy
 * @returns {Function} a policy(proposal, ctx)
 */
export function monomorphicGrowth(gateOpts = {}) {
  const base = makePolicy(gateOpts);
  let claims = null;
  return function policy(p, ctx) {
    const verdict = base(p, ctx);
    const brain = ctx && ctx.brain;
    if (verdict !== 'approve' || p.kind !== 'edge.grow' || !brain) return verdict;
    if (claims === null) {
      claims = new Map();
      const k = brain.connectome;
      for (let e = 0; e < k.n; e++) {
        const key = k.dst[e] + ':' + k.dstPort[e];
        if (!claims.has(key)) claims.set(key, claimKey(brain.cells[k.src[e]], k.srcPort[e]));
      }
    }
    const src = brain.byId.get(p.what.src), dst = brain.byId.get(p.what.dst);
    if (!src || !dst) return verdict;
    const key = dst.idx + ':' + p.what.dstPort;
    const mine = claimKey(src, p.what.srcPort);
    const owner = claims.get(key);
    if (owner !== undefined && owner !== mine) return 'reject';
    claims.set(key, mine);
    return 'approve';
  };
}

/** First position in a sorted Uint32Array whose value is >= v. */
export function lowerBound(a, v) {
  let lo = 0, hi = a.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] < v) lo = m + 1; else hi = m; }
  return lo;
}
