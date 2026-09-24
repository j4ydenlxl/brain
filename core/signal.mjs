// core/signal.mjs: THE QUANTUM. Tokens to quanta.
// A Signal is a typed, composable, exact-where-exactness-matters unit of information.
// kinds: hv (hypervector), sdr (sparse indices), num (exact rational), sym (expression),
// vec (dense float), event (structured). Cells declare which kinds each port accepts.
import { RNG, hash32, hashBytes } from './rng.mjs';
import * as SIMD from './simd.mjs';

export const D = 8192; // hypervector dimension
// phv (phasor hypervector, Float32Array of phases) is appended last on purpose: runtime/protocol.mjs
// turns this order into a bitmask, so every existing kind keeps its bit. Its algebra lives in cells/fhrr.mjs.
export const KINDS = Object.freeze(['hv', 'sdr', 'num', 'sym', 'vec', 'event', 'phv']);

export function isKind(k) { return KINDS.includes(k); }

export function signal(kind, data, meta = {}) {
  if (!isKind(kind)) throw new Error('signal: unknown kind ' + kind);
  // the census column, not a lifetime: a slot that leaves its allocation site as a payload is
  // the router's to release, and heapOwnership() splits a site's garbage on it. Off by default.
  if (kind === 'hv' && SIMD.sitesEnabled) SIMD.notePayload(data);
  return {
    kind, data,
    t: meta.t ?? 0, gen: meta.gen ?? 0,
    src: meta.src ?? -1, port: meta.port ?? 0, seq: meta.seq ?? -1,
  };
}

// ---------------------------------------------------------------- the payload contract
// A PAYLOAD VECTOR BELONGS TO THE SIGNAL THAT CARRIES IT.
//
// The heap only ever gets a slot back from an owner that returns it (a synchronous run never
// reaches the event loop turn the finalizer needs: finalizerCalls reads 0). Until 2026-09-18
// the four largest garbage owners in a 12 major organism were cells that make a vector and
// hand it out as a signal payload (cells/basic.mjs hv.bind, hv.bundle, hv.permute and
// cells/perception.mjs encode.number), so nobody could release at the site: the vector was
// still travelling. This is the rule that gives those vectors an owner.
//
//   The PRODUCER marks the emission { kind: 'hv', data, own: true } when it made the vector
//   fresh this run and keeps no reference to it.
//   The ROUTER (core/brain.mjs _emit) takes ownership for as many mailboxes as the signal was
//   scheduled to, and releases the slot when the LAST of those copies leaves a mailbox:
//   consumed by the cell on its tick, dropped by a mailCap, or dropped on restore.
//   A RECEIVER that needs the payload past the tick it arrives in COPIES it (Int8Array.from,
//   which is what a memory row already does) or takes it over with take(sig), after which the
//   router will not release it.
//
// A signal sitting in inflight or in a mailbox at snapshot time keeps its payload: serializing
// copies the lanes, and the restored brain's payloads are fresh vectors it owns in turn.
const PAYLOAD = new WeakMap(); // sig -> how many mailbox copies are still to come off, absent when nobody owns it
/**
 * The router's claim on a payload: refs is how many mailboxes the signal was scheduled to.
 * Only an hv that lives on a heap slot can be owned; anything else is left alone.
 * @returns {boolean} whether the claim was taken
 */
export function ownPayload(sig, refs = 1) {
  if (!sig || sig.kind !== 'hv' || refs <= 0 || !sig.data || SIMD.slotOf(sig.data) < 0) return false;
  PAYLOAD.set(sig, refs);
  return true;
}
/**
 * Take a payload over: the vector is yours to keep (and to release), and the router will not
 * release it when the mail it arrived on is consumed. For a receiver that would otherwise copy.
 * @returns {*} the signal's data, whether or not anybody owned it
 */
export function take(sig) {
  PAYLOAD.delete(sig);
  return sig.data;
}
/** True while the signal still owns its payload. */
export function ownsPayload(sig) { return PAYLOAD.has(sig); }
/**
 * One mailbox copy of this signal has left. On the last one the slot goes back.
 * @returns {boolean} whether the slot was returned by this call
 */
export function dropPayload(sig) {
  const refs = PAYLOAD.get(sig);
  if (refs === undefined) return false;
  if (refs > 1) { PAYLOAD.set(sig, refs - 1); return false; }
  PAYLOAD.delete(sig);
  return SIMD.release(sig.data);
}
/** A receiver's copy of a payload it means to keep: a plain array, off the heap. */
export function hvCopy(v) { return Int8Array.from(v); }

// ---------------------------------------------------------------- hv (VSA / HDC)
// Bipolar Int8Array of +1/-1. bind = elementwise product (self-inverse),
// bundle = majority of sum (superposition), permute = roll (sequence/role),
// sim = normalized dot in [-1, 1]. Random hvs are quasi-orthogonal (sim ~ 0 ± 1/sqrt(D)).
// Every hypervector this module makes is an Int8Array view on the SIMD module's heap when a
// slot is free (core/simd.mjs: a slot allocator with a free list over a fixed wasm memory),
// so the kernels read it where it is and copy nothing. When the heap is full or absent, a
// plain Int8Array, counted as a fallback in heapStats(). The lanes of a fresh slot hold
// whatever the slot held before: every producer below writes all of them.
export function hvAlloc(d = D) { return SIMD.alloc(d) || new Int8Array(d); }
/** Return a heap slot now: for an intermediate nobody else holds. A plain array is a no-op. */
export const release = SIMD.release;
/**
 * Return the slots of a whole list of intermediates, skipping any vector in `keep`.
 *
 * This is the shape every fold in this codebase has: build a list of derived vectors, fold
 * them into one, drop the list. Measured on this machine, the reason the heap fills is that
 * the owners of those lists do not release them: a 12 major buildWhole made 299364 allocation
 * attempts, of which 289990 (96.87%) came from ONE such fold, and 0 slots came back inside the
 * run, because a slot can only come back through a release() or an event loop turn.
 * @param {ArrayLike<Int8Array>} list
 * @param {Int8Array|null} [keep] one vector the caller is keeping (the fold's result)
 * @returns {number} how many slots came back
 */
export function releaseAll(list, keep = null) {
  let n = 0;
  for (let i = 0; i < list.length; i++) { const v = list[i]; if (v !== keep && SIMD.release(v)) n++; }
  return n;
}
export const heapStats = SIMD.heapStats;
export const heapPlan = SIMD.heapPlan;
export const plan = SIMD.plan;
export function hvRandom(rng, d = D) {
  const v = hvAlloc(d);
  for (let i = 0; i < d; i++) v[i] = (rng.u32() & 1) ? 1 : -1;
  // not marked bipolar here: a fresh random vector is the one kind a caller may still edit
  // lane by lane (tests write a zero lane to reach the scalar bind); it is scanned once.
  return v;
}
// Marked at birth: a seeded vector is only ever read.
export function hvFromSeed(label, d = D) { const v = hvRandom(new RNG('hv:' + label), d); BIPOLAR.add(v); return v; }
export function hvZero(d = D) { return new Int8Array(d); }
export function bind(a, b) {
  const n = a.length;
  // The result of two bipolar vectors is bipolar, so it is marked here: a chained bind
  // (bindMany, permute then bind) used to rescan 8192 lanes of every intermediate.
  if (SIMD.fits(n) && b.length === n && bipolar(a) && bipolar(b)) { const r = SIMD.bindSimd(a, b); BIPOLAR.add(r); return r; }
  const out = hvAlloc(n);
  for (let i = 0; i < n; i++) out[i] = a[i] * b[i];
  return out;
}
// The 16-lane kernels assume every lane is +1 or -1 (a zero lane would make the equality
// trick wrong). Vectors carry a cached flag after one scalar pass; fresh vectors are checked.
const BIPOLAR = new WeakSet(); // vectors are immutable once made into signals, so the mark holds
export function bipolar(v) {
  if (BIPOLAR.has(v)) return true;
  for (let i = 0; i < v.length; i++) if (v[i] !== 1 && v[i] !== -1) return false;
  BIPOLAR.add(v);
  return true;
}
/** The mark without the scan: true only for a vector this module (or a kernel) made bipolar. */
export const isBipolar = (v) => BIPOLAR.has(v);
/** For a producer that wrote +1/-1 into every lane itself (runtime/kernels.mjs). */
export function markBipolar(v) { BIPOLAR.add(v); return v; }
export function bindMany(list) {
  let out = list[0];
  for (let i = 1; i < list.length; i++) {
    const next = bind(out, list[i]);
    if (i > 1) SIMD.release(out); // an intermediate this fold made and nobody else holds
    out = next;
  }
  return out;
}
// weighted superposition. Ties (even counts) are broken by the first member bound with a
// fixed random tie vector T: uncorrelated with every member (E[a_i * a_i * T_i] = 0) and
// uncorrelated between bundles whose first members differ. A shift-based tie (f_i * f_{i+1})
// was tried first and correlated with permuted sequences at exactly 1/4; this does not.
let TIE = null;
export function bundle(list, weights = null) {
  if (list.length === 0) return hvZero();
  const n = list[0].length, f = list[0];
  if (!TIE || TIE.length !== n) TIE = hvRandom(new RNG('bundle:tie'), n);
  if (SIMD.fits(n) && list.length <= SIMD.MAX_MEMBERS && list.every(v => v.length === n)) {
    if (!weights && list.length < 128 && list.every(bipolar)) {
      const r = SIMD.bundleSimd(list, TIE);
      if (r) { BIPOLAR.add(r); return r; }
    } else if (weights) {
      // f64x2 lanes, the same adds in the same member order as the loop below: bit for bit
      // the same double per lane, so the same sign and the same ties. Any Int8 lanes.
      const r = SIMD.wbundleSimd(list, weights, TIE);
      if (r) { if (bipolar(f)) BIPOLAR.add(r); return r; }
    }
  }
  // integer accumulation when unweighted (69 us vs 90 us per 8-way bundle at D=8192, measured)
  const acc = weights ? new Float64Array(n) : new Int32Array(n);
  for (let k = 0; k < list.length; k++) {
    const v = list[k];
    if (weights) { const w = weights[k]; for (let i = 0; i < n; i++) acc[i] += v[i] * w; }
    else for (let i = 0; i < n; i++) acc[i] += v[i];
  }
  const out = hvAlloc(n);
  for (let i = 0; i < n; i++) out[i] = acc[i] > 0 ? 1 : acc[i] < 0 ? -1 : (f[i] * TIE[i] || 1);
  if (!weights || bipolar(f)) BIPOLAR.add(out);
  return out;
}
// The sign of a lane accumulator with bundle()'s tie rule, for accumulations made outside
// this module (the semantic tier's resident arena): the same output as bundle(list, weights)
// when acc is that weighted sum and f is list[0].
export function bundleFromAcc(acc, f) {
  const n = acc.length;
  if (!TIE || TIE.length !== n) TIE = hvRandom(new RNG('bundle:tie'), n);
  const out = hvAlloc(n);
  for (let i = 0; i < n; i++) out[i] = acc[i] > 0 ? 1 : acc[i] < 0 ? -1 : (f[i] * TIE[i] || 1);
  BIPOLAR.add(out);
  return out;
}
// out[(i + s) % n] = a[i]: the last s lanes move to the front, the rest shift up by s, as
// two block copies (the lane loop was 3.81% of the live profile, 2026-09-17).
export function permute(a, k = 1) {
  const n = a.length, out = hvAlloc(n), s = ((k % n) + n) % n;
  out.set(a.subarray(0, n - s), s);
  out.set(a.subarray(n - s), 0);
  if (BIPOLAR.has(a)) BIPOLAR.add(out); // a permutation of a bipolar vector is bipolar
  return out;
}
export function unpermute(a, k = 1) { return permute(a, -k); }
export function sim(a, b) {
  const n = a.length;
  if (SIMD.fits(n) && b.length === n) return SIMD.dotSimd(a, b) / n;
  let dot = 0;
  for (let i = 0; i < n; i++) dot += a[i] * b[i];
  return dot / n;
}
export function hamming(a, b) {
  const n = a.length;
  if (SIMD.fits(n) && b.length === n) return n - SIMD.equalSimd(a, b);
  let h = 0;
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) h++;
  return h;
}
// Scalar references, kept exported so the kernels can be graded against them.
export const scalar = {
  bind(a, b) { const n = a.length, out = new Int8Array(n); for (let i = 0; i < n; i++) out[i] = a[i] * b[i]; return out; },
  sim(a, b) { const n = a.length; let d = 0; for (let i = 0; i < n; i++) d += a[i] * b[i]; return d / n; },
  hamming(a, b) { const n = a.length; let h = 0; for (let i = 0; i < n; i++) if (a[i] !== b[i]) h++; return h; },
  bundle(list) {
    const n = list[0].length, f = list[0], acc = new Int32Array(n), out = new Int8Array(n);
    if (!TIE || TIE.length !== n) TIE = hvRandom(new RNG('bundle:tie'), n);
    for (const v of list) for (let i = 0; i < n; i++) acc[i] += v[i];
    for (let i = 0; i < n; i++) out[i] = acc[i] > 0 ? 1 : acc[i] < 0 ? -1 : (f[i] * TIE[i] || 1);
    return out;
  },
};
// Encode a sequence as sum of permuted items: seq(a,b,c) = p^2(a) + p(b) + c
// Every permuted member is made here and read only by the bundle below, so this fold owns
// them and returns their slots: without this the heap paid n slots per sequence and got none
// of them back until an event loop turn that a synchronous run never reaches.
export function hvSequence(items) {
  const n = items.length, list = new Array(n);
  for (let i = 0; i < n; i++) list[i] = permute(items[i], n - 1 - i);
  const out = bundle(list);
  releaseAll(list, out);
  return out;
}
// Item memory: named hypervectors with nearest-neighbour cleanup (the "codebook").
// The items also live bit-packed in a SIMD arena (one bit per lane, 128 lanes per
// instruction), so a scan copies only the query. The scan was the cost that grew with
// everything a brain had seen: at 5509 items it took 38 of every 240 seconds (2026-09-17
// profile). A vector with a zero lane cannot pack; one such item turns the arena off for
// that memory and the scan falls back to sim() over the map.
export class ItemMemory {
  constructor(d = D) { this.d = d; this.items = new Map(); this.names = []; this.slots = new Map(); this.arena = null; this.packed = SIMD.fitsPacked(d); }
  get(name) {
    let v = this.items.get(name);
    if (!v) { v = hvFromSeed(name, this.d); this.set(name, v); }
    return v;
  }
  has(name) { return this.items.has(name); }
  set(name, v) {
    this.items.set(name, v);
    if (!this.packed) return;
    if (v.length !== this.d || !bipolar(v)) { this.packed = false; this.arena = null; this.names = []; this.slots = new Map(); return; }
    let slot = this.slots.get(name);
    if (slot === undefined) { slot = this.names.length; this.names.push(name); this.slots.set(name, slot); }
    if (!this.arena) this.arena = new SIMD.Arena(this.d);
    this.arena.set(slot, v);
  }
  delete(name) {
    const had = this.items.delete(name);
    if (had && this.packed && this.arena) {
      // the last slot moves into the hole, so the arena stays dense
      const slot = this.slots.get(name), last = this.names.length - 1;
      if (slot !== last) { const moved = this.names[last]; this.arena.move(last, slot); this.names[slot] = moved; this.slots.set(moved, slot); }
      this.names.pop(); this.slots.delete(name); this.arena.truncate(this.names.length);
    }
    return had;
  }
  get size() { return this.items.size; }
  // [name, sim] of the nearest item (k = 1) or the k nearest in descending order. Ties go
  // to the earlier item: insertion order, or slot order once items have been deleted.
  nearest(v, k = 1) {
    if (this.items.size === 0) return k === 1 ? null : [];
    if (this.packed && this.arena && v.length === this.d && bipolar(v)) {
      const n = this.d, count = this.names.length;
      if (k === 1) { const b = this.arena.best(v, count); return [this.names[b[0]], b[1] / n]; }
      const dots = this.arena.dots(v, new Float64Array(count), count);
      const order = Array.from({ length: count }, (_, i) => i).sort((a, b) => dots[b] - dots[a] || a - b);
      return order.slice(0, k).map((i) => [this.names[i], dots[i] / n]);
    }
    if (k === 1) {
      let best = null, bs = -Infinity;
      for (const [name, u] of this.items) { const s = sim(u, v); if (s > bs) { bs = s; best = name; } }
      return [best, bs];
    }
    const scored = [];
    for (const [name, u] of this.items) scored.push([name, sim(u, v)]);
    scored.sort((a, b) => b[1] - a[1]);
    return scored.slice(0, k);
  }
  serialize() { return { d: this.d, items: [...this.items].map(([n, v]) => [n, Buffer.from(v.buffer, v.byteOffset, v.byteLength).toString('base64')]) }; }
  static from(o) {
    const m = new ItemMemory(o.d);
    for (const [n, b] of o.items) { const buf = Buffer.from(b, 'base64'); const v = hvAlloc(buf.byteLength); v.set(new Int8Array(buf.buffer, buf.byteOffset, buf.byteLength)); m.set(n, v); }
    return m;
  }
}

// ---------------------------------------------------------------- sdr
// { n, idx: Uint32Array sorted ascending }
export function sdr(n, indices) {
  const idx = Uint32Array.from(indices).sort();
  return { n, idx };
}
export function sdrOverlap(a, b) {
  let i = 0, j = 0, c = 0;
  while (i < a.idx.length && j < b.idx.length) {
    if (a.idx[i] === b.idx[j]) { c++; i++; j++; }
    else if (a.idx[i] < b.idx[j]) i++; else j++;
  }
  return c;
}
export function sdrUnion(a, b) {
  const s = new Set(a.idx); for (const x of b.idx) s.add(x);
  return sdr(a.n, s);
}
export function sdrFromVec(vec, k) {
  const order = Array.from(vec.keys()).sort((i, j) => vec[j] - vec[i]);
  return sdr(vec.length, order.slice(0, k));
}
export function sdrFromHv(hv, k) {
  // top-k positions of a bundle-count is not available on a bipolar hv, so hash-select:
  // positive positions whose index hashes below a threshold. Deterministic and sparse.
  const out = [];
  const thr = Math.floor((k / hv.length) * 2 * 4294967296);
  for (let i = 0; i < hv.length && out.length < k; i++) if (hv[i] > 0 && hash32('s' + i) < thr) out.push(i);
  return sdr(hv.length, out);
}
export function sdrToVec(s) { const v = new Float32Array(s.n); for (const i of s.idx) v[i] = 1; return v; }

// ---------------------------------------------------------------- num (exact)
// { type: 'rat', n: BigInt, d: BigInt } normalized, d > 0. Also 'float' and 'int' (BigInt).
export function gcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a; }
export function rat(n, d = 1n) {
  n = BigInt(n); d = BigInt(d);
  if (d === 0n) throw new Error('num: division by zero');
  if (d < 0n) { n = -n; d = -d; }
  const g = gcd(n, d) || 1n;
  return { type: 'rat', n: n / g, d: d / g };
}
export function int(n) { return { type: 'int', n: BigInt(n) }; }
export function flt(x) { return { type: 'float', x: Number(x) }; }
export function toRat(v) {
  if (v.type === 'rat') return v;
  if (v.type === 'int') return rat(v.n, 1n);
  if (v.type === 'float') return ratFromDecimal(String(v.x));
  throw new Error('num: cannot convert ' + v.type);
}
// "9.11" -> 911/100 exactly; "-3" -> -3/1; "1e3" -> 1000/1; "2/3" -> 2/3
export function ratFromDecimal(s) {
  s = String(s).trim();
  if (s.includes('/')) { const [a, b] = s.split('/'); return ratDiv(ratFromDecimal(a), ratFromDecimal(b)); }
  const m = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(s);
  if (!m || (m[2] === '' && (m[3] ?? '') === '')) throw new Error('num: not a decimal: ' + s);
  const sign = m[1] === '-' ? -1n : 1n;
  const ip = m[2] || '0', fp = m[3] || '';
  let n = BigInt(ip + fp) * sign, d = 10n ** BigInt(fp.length);
  const e = m[4] ? parseInt(m[4], 10) : 0;
  if (e > 0) n *= 10n ** BigInt(e); else if (e < 0) d *= 10n ** BigInt(-e);
  return rat(n, d);
}
export function ratAdd(a, b) { a = toRat(a); b = toRat(b); return rat(a.n * b.d + b.n * a.d, a.d * b.d); }
export function ratSub(a, b) { a = toRat(a); b = toRat(b); return rat(a.n * b.d - b.n * a.d, a.d * b.d); }
export function ratMul(a, b) { a = toRat(a); b = toRat(b); return rat(a.n * b.n, a.d * b.d); }
export function ratDiv(a, b) { a = toRat(a); b = toRat(b); return rat(a.n * b.d, a.d * b.n); }
export function ratCmp(a, b) { a = toRat(a); b = toRat(b); const l = a.n * b.d, r = b.n * a.d; return l < r ? -1 : l > r ? 1 : 0; }
export function ratEq(a, b) { return ratCmp(a, b) === 0; }
export function ratToNumber(a) { a = toRat(a); return Number(a.n) / Number(a.d); }
export function ratToString(a) { a = toRat(a); return a.d === 1n ? a.n.toString() : a.n.toString() + '/' + a.d.toString(); }
export function ratPow(a, k) { a = toRat(a); k = BigInt(k); if (k < 0n) return rat(a.d ** -k, a.n ** -k); return rat(a.n ** k, a.d ** k); }
export function numToJSON(v) {
  if (v.type === 'rat') return { type: 'rat', n: v.n.toString(), d: v.d.toString() };
  if (v.type === 'int') return { type: 'int', n: v.n.toString() };
  return v;
}
export function numFromJSON(o) {
  if (o.type === 'rat') return rat(BigInt(o.n), BigInt(o.d));
  if (o.type === 'int') return int(BigInt(o.n));
  return o;
}

// ---------------------------------------------------------------- sym (expressions)
// { op: 'num'|'var'|'+'|'-'|'*'|'/'|'^'|'neg'|'=' , args: [...] , value?: num , name?: string }
export const S = {
  num: (v) => ({ op: 'num', value: typeof v === 'object' ? v : ratFromDecimal(String(v)) }),
  v: (name) => ({ op: 'var', name }),
  add: (...a) => ({ op: '+', args: a }),
  sub: (a, b) => ({ op: '-', args: [a, b] }),
  mul: (...a) => ({ op: '*', args: a }),
  div: (a, b) => ({ op: '/', args: [a, b] }),
  pow: (a, b) => ({ op: '^', args: [a, b] }),
  neg: (a) => ({ op: 'neg', args: [a] }),
  eq: (a, b) => ({ op: '=', args: [a, b] }),
  ne: (a, b) => ({ op: '!=', args: [a, b] }),
  lt: (a, b) => ({ op: '<', args: [a, b] }),
  le: (a, b) => ({ op: '<=', args: [a, b] }),
  gt: (a, b) => ({ op: '>', args: [a, b] }),
  ge: (a, b) => ({ op: '>=', args: [a, b] }),
  and: (...a) => ({ op: 'and', args: a }),
  or: (...a) => ({ op: 'or', args: a }),
  not: (a) => ({ op: 'not', args: [a] }),
  floor: (a) => ({ op: 'floor', args: [a] }),
  mod: (a, b) => ({ op: 'mod', args: [a, b] }),
  abs: (a) => ({ op: 'abs', args: [a] }),
  if: (c, a, b) => ({ op: 'if', args: [c, a, b] }),
  let: (name, value, body) => ({ op: 'let', name, value, body }),
  fn: (params, body) => ({ op: 'fn', params, body }),
  call: (fn, ...args) => ({ op: 'call', fn: typeof fn === 'string' ? { op: 'var', name: fn } : fn, args }),
  // rec(name, params, fbody, body): binds name to a function that can call itself, then evaluates body
  rec: (name, params, fbody, body) => ({ op: 'rec', name, params, fbody, body }),
};
export function symToString(e) {
  switch (e.op) {
    case 'num': return ratToString(e.value);
    case 'var': return e.name;
    case 'neg': return '-(' + symToString(e.args[0]) + ')';
    case '=': return symToString(e.args[0]) + ' = ' + symToString(e.args[1]);
    case 'floor': case 'abs': case 'not': return e.op + '(' + symToString(e.args[0]) + ')';
    case 'mod': return 'mod(' + symToString(e.args[0]) + ', ' + symToString(e.args[1]) + ')';
    case 'if': return 'if ' + symToString(e.args[0]) + ' then ' + symToString(e.args[1]) + ' else ' + symToString(e.args[2]);
    case 'let': return 'let ' + e.name + ' = ' + symToString(e.value) + ' in ' + symToString(e.body);
    case 'fn': return 'fn(' + e.params.join(', ') + ') ' + symToString(e.body);
    case 'rec': return 'rec ' + e.name + '(' + e.params.join(', ') + ') = ' + symToString(e.fbody) + ' in ' + symToString(e.body);
    case 'call': return symToString(e.fn) + '(' + e.args.map(symToString).join(', ') + ')';
    case 'closure': return '<fn(' + e.params.join(', ') + ')>';
    default: return '(' + e.args.map(symToString).join(' ' + e.op + ' ') + ')';
  }
}

// ---------------------------------------------------------------- vec
export function vec(arr) { return arr instanceof Float32Array ? arr : Float32Array.from(arr); }
export function vecMean(list) {
  // Vectors of different widths: each dimension is the mean over the vectors that carry it.
  let n = 0; for (const v of list) if (v.length > n) n = v.length;
  const out = new Float32Array(n), count = new Uint32Array(n);
  for (const v of list) for (let i = 0; i < v.length; i++) { out[i] += v[i]; count[i]++; }
  for (let i = 0; i < n; i++) out[i] /= Math.max(1, count[i]);
  return out;
}
export function vecNorm(v) { let s = 0; for (let i = 0; i < v.length; i++) s += v[i] * v[i]; return Math.sqrt(s); }
export function vecCos(a, b) { let d = 0; for (let i = 0; i < a.length; i++) d += a[i] * b[i]; const n = vecNorm(a) * vecNorm(b); return n === 0 ? 0 : d / n; }

// ---------------------------------------------------------------- activity + hashing
// Scalar activity of a signal, used by local learning rules and attention bids.
export function activity(sig) {
  switch (sig.kind) {
    case 'vec': { const v = sig.data; let s = 0; for (let i = 0; i < v.length; i++) s += Math.abs(v[i]); return v.length ? s / v.length : 0; }
    case 'sdr': return sig.data.idx.length / Math.max(1, sig.data.n);
    default: return 1;
  }
}
function stableJSON(o) {
  if (o === null || typeof o !== 'object') return JSON.stringify(typeof o === 'bigint' ? o.toString() : o);
  if (Array.isArray(o)) return '[' + o.map(stableJSON).join(',') + ']';
  if (ArrayBuffer.isView(o)) return '"' + hashBytes(new Uint8Array(o.buffer, o.byteOffset, o.byteLength)).toString(16) + '"';
  return '{' + Object.keys(o).sort().map(k => JSON.stringify(k) + ':' + stableJSON(o[k])).join(',') + '}';
}
export function hashData(kind, data) {
  switch (kind) {
    case 'hv': case 'vec': case 'phv': return hashBytes(new Uint8Array(data.buffer, data.byteOffset, data.byteLength)).toString(16);
    case 'sdr': return hashBytes(new Uint8Array(data.idx.buffer, data.idx.byteOffset, data.idx.byteLength), data.n).toString(16);
    case 'num': return hash32(JSON.stringify(numToJSON(data))).toString(16);
    default: return hash32(stableJSON(data)).toString(16);
  }
}
export function hashSignal(sig) { return hashData(sig.kind, sig.data); }

// ---------------------------------------------------------------- (de)serialization for snapshots
// An hv whose every lane is +1 or -1 goes on the wire as one bit per lane: 8192 lanes are
// 1024 bytes, 1368 base64 characters, where the Int8 form is 10924. The soak's t=4000
// checkpoint held 176238 episodic keys and 28066 in-flight hvs in the Int8 form, most of
// a 2641524189 byte file (2026-09-17). The packed form is marked 'b<lanes>:'; base64 has
// no ':' so an unmarked string is still read as Int8, and a vector with a 0 lane stays Int8.
export function packHV(v) {
  const d = v.length, bytes = new Uint8Array((d + 7) >>> 3);
  for (let i = 0; i < d; i++) if (v[i] > 0) bytes[i >>> 3] |= 1 << (i & 7);
  return 'b' + d + ':' + Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');
}
export function unpackHV(s) {
  const colon = s.indexOf(':');
  const d = Number(s.slice(1, colon));
  const bytes = Buffer.from(s.slice(colon + 1), 'base64');
  if (bytes.length !== (d + 7) >>> 3) throw new Error('packed hv: ' + bytes.length + ' bytes for ' + d + ' lanes');
  const v = hvAlloc(d);
  for (let i = 0; i < d; i++) v[i] = (bytes[i >>> 3] >>> (i & 7)) & 1 ? 1 : -1;
  BIPOLAR.add(v);
  return v;
}
export function dataToJSON(kind, data) {
  switch (kind) {
    case 'hv': return bipolar(data) ? packHV(data) : Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString('base64');
    case 'vec': case 'phv': return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString('base64');
    case 'sdr': return { n: data.n, idx: Array.from(data.idx) };
    case 'num': return numToJSON(data);
    default: return data;
  }
}
export function dataFromJSON(kind, j) {
  switch (kind) {
    case 'hv': {
      if (j.charCodeAt(0) === 98 && j.indexOf(':') > 0) return unpackHV(j);
      const b = Buffer.from(j, 'base64'); return new Int8Array(b.buffer, b.byteOffset, b.byteLength);
    }
    case 'vec': case 'phv': { const b = Buffer.from(j, 'base64'); return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); }
    case 'sdr': return sdr(j.n, j.idx);
    case 'num': return numFromJSON(j);
    default: return j;
  }
}
export function signalToJSON(s) { return { ...s, data: dataToJSON(s.kind, s.data) }; }
export function signalFromJSON(j) { return { ...j, data: dataFromJSON(j.kind, j.data) }; }
