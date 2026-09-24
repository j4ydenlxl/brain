// runtime/protocol.mjs : the wire between the coordinator and its shards.
//
// A parallel brain is still ONE brain. The partition is an implementation detail that
// must not be visible in the answer: a cell runs at the same tick, consumes the same
// signals and grows the same edges whether it sits in shard 0 of one or shard 11 of
// sixteen. Everything in this file exists to make that true.
//
// Three things travel between threads every tick:
//   1. signal payloads   (big: an hv is 8192 bytes) -> SharedArrayBuffer arenas, no clone
//   2. delivery records  (small, fixed width)       -> SharedArrayBuffer descriptor slabs
//   3. control + rare    (grow, prune, overflow)    -> postMessage, structured clone
// The main thread never touches 1 or 2. It sees a tick command and a tick reply.
import { Brain } from '../core/brain.mjs';
import { KINDS } from '../core/signal.mjs';

// ---------------------------------------------------------------- control block
// One Int32Array shared by every thread. Per shard slots are written by that shard only
// (Atomics.store, single writer); ARRIVED is the barrier invariant and is the one field
// every shard writes (Atomics.add), so the coordinator can prove that exactly S shards
// finished tick t before it sends tick t + 1.
export const CTL = Object.freeze({
  TICK: 0, ARRIVED: 1, RUNS: 2, SIGNALS: 3, DELIVERED: 4,
  CROSS_OUT: 5, CROSS_IN: 6, CLONED: 7, OVERFLOW: 8, GROWN: 9, PRUNED: 10,
  BASE: 16, PER: 12,
});
// BUSY_US is the microseconds a shard spent inside its own step (drain, tick, flush): the
// wall time of a tick minus the LARGEST of these is what the fence itself costs, which is
// the number that says whether the next speedup is in the partition or in the barrier.
export const SH = Object.freeze({ RUNS: 0, SIGNALS: 1, DELIVERED: 2, CROSS_OUT: 3, CROSS_IN: 4, CELLS: 5, EDGES: 6, TICK: 7, REFUSED: 8, ERRORS: 9, BUSY_US: 10, DRAIN_US: 11 });
// A port's accepted signal kinds as a bitmask, so a shard can apply core's emit-time
// refusal to an edge whose destination cell lives in another thread.
export function kindMask(kinds) { let m = 0; for (const k of kinds) { const i = KINDS.indexOf(k); if (i >= 0) m |= 1 << i; } return m; }
export function kindBit(kind) { const i = KINDS.indexOf(kind); return i < 0 ? 0 : 1 << i; }
export const CTL_WORDS = 16 + 64 * CTL.PER; // room for 64 shards
export function shardSlot(s, field) { return CTL.BASE + s * CTL.PER + field; }

// ---------------------------------------------------------------- descriptor record
// One record is one delivery: which cell, which port, when it lands, on which edge, and
// where its payload bytes are in the source shard's arena.
export const REC = 16; // int32 words per record
export const R = Object.freeze({
  OFF: 0, LEN: 1, KIND: 2, DST: 3, DSTPORT: 4, EDGE: 5, ARRIVE: 6, W: 7,
  T: 8, GEN: 9, SRC: 10, PORT: 11, SEQ: 12, ORDHI: 13, ORDLO: 14, SKIND: 15,
});
export const KIND_CODE = Object.freeze({ hv: 0, vec: 1 });
export const CODE_KIND = Object.freeze(['hv', 'vec']);
export const VIEW_OF = Object.freeze([Int8Array, Float32Array]);
// A signal whose payload is not a typed array (num, sym, event, sdr) used to leave the
// shared arena entirely and travel as a structured clone through the coordinator, which
// put the main thread back in the middle of every tick. Measured on the organism at 2
// shards: 22119 of 23094 cross messages took that path, and 2 shards ran SLOWER than 1.
// Those payloads now go through the same arena as UTF-8 JSON, using core's own
// dataToJSON/dataFromJSON (the pair Brain.snapshot already trusts for in flight signals).
// The signal's own kind rides in R.SKIND, since the payload code no longer names it.
export const JSON_CODE = 2;
export function kindIndex(kind) { return KINDS.indexOf(kind); }

// ---------------------------------------------------------------- payloads that cross by clone
// Structured clone copies a typed array view TOGETHER WITH ITS WHOLE BUFFER. Every
// hypervector core makes is an 8192 byte window on core/simd.mjs's wasm heap (514.7 MB in
// the main thread, measured), so posting ONE hv to a worker copied the whole heap: the
// 64 injections of test/runtime.test.mjs cost 3 x 514.7 MB at 3 shards, and in clone mode
// every tick reply copied the shard's heap to the coordinator, which forwarded it again,
// past 12 GB in 7 seconds. ownBytes returns x with every view that is a window on a larger,
// non-shared buffer replaced by a copy that owns exactly its bytes. Copy on write: an
// object with nothing to copy comes back as itself. memo keeps identity, so a payload
// referenced N times in one message is still one object on the other side, as before.
export function ownBytes(x, memo = new Map(), depth = 0) {
  if (x === null || typeof x !== 'object') return x;
  const hit = memo.get(x);
  if (hit !== undefined) return hit;
  let out = x;
  if (ArrayBuffer.isView(x)) {
    const buf = x.buffer;
    if (!(buf instanceof SharedArrayBuffer) && x.byteLength !== buf.byteLength) {
      if (x instanceof DataView) out = new DataView(buf.slice(x.byteOffset, x.byteOffset + x.byteLength));
      else if (Buffer.isBuffer(x)) out = new Uint8Array(x); // a Buffer arrives as a Uint8Array anyway
      else out = x.slice();
    }
  } else if (depth < 8 && (Array.isArray(x) || Object.getPrototypeOf(x) === Object.prototype || Object.getPrototypeOf(x) === null)) {
    memo.set(x, x); // a cycle meets itself instead of recursing
    const arr = Array.isArray(x);
    const keys = arr ? null : Object.keys(x);
    const n = arr ? x.length : keys.length;
    for (let i = 0; i < n; i++) {
      const k = arr ? i : keys[i];
      const v = x[k], w = ownBytes(v, memo, depth + 1);
      if (w !== v) {
        if (out === x) out = arr ? x.slice() : { ...x };
        out[k] = w;
      }
    }
  }
  memo.set(x, out);
  return out;
}

// ---------------------------------------------------------------- canonical order
// core/clock.mjs returns due cells as: every numeric period in ascending order, cells
// within a period in registration (index) order, then the event cells in index order.
// This key reproduces that order from the spec alone, which is what lets the coordinator
// rebuild the exact single process fired list out of what the shards report.
const EVENT_KEY = 2 ** 28;
export function periodKey(period) { return period === 'event' ? EVENT_KEY : period; }
export function canonicalKey(cell, idx) { return periodKey(cell?.policy?.period ?? 1) * 16777216 + idx; }

// The delivery order key. Buckets in Brain.inflight are drained in insertion order, which
// in one process is emission order: the order the emitting cells ran, which is the due list
// of that tick regrouped by region by Scheduler.allocate. A shard cannot watch the other
// threads emit, so a bucket that received from another thread is sorted by
// (emit tick, source rank, source port, global edge) instead, where the source rank is
// exactly that run order, precomputed in runtime/shard.mjs from (region, canonicalKey).
// Ranking by raw global cell index instead, which is what this did first, reorders an
// event cell ahead of a period 1 cell and interleaves regions, and a cell that reads only
// its first input then sees a different input. The rank is a pure function of the spec, so
// 1, 2, 4 and 16 shards all deliver a cell's mail in the one process order.
export function ordKey(srcRank, port, edgeGlobal) {
  return ((srcRank + 1) * 64 + port) * 8388608 + (edgeGlobal + 1);
}

// ---------------------------------------------------------------- spec
// A spec is plain JSON plus typed arrays: it crosses a worker boundary untouched.
//   { name, seed, ledger, pruneEvery, hebbian, growth, modules,
//     regions: [{ name, budget }], cells: [{ id, kind, region, circuit, params, policy }],
//     edges:  [{ src, srcPort, dst, dstPort, w, delay, conf }] }
// Cells are addressed by their index in spec.cells, which is the index Brain.addCell
// hands out, so a spec edge list is replayed into the identical global connectome.
export function normalizeSpec(spec) {
  if (!spec || !Array.isArray(spec.cells) || !spec.cells.length) throw new Error('spec: cells required');
  const regions = [];
  const seen = new Map();
  for (const r of spec.regions || []) { seen.set(r.name, r); regions.push({ name: r.name, budget: r.budget ?? null }); }
  for (const c of spec.cells) {
    const name = c.region || 'default';
    if (!seen.has(name)) { const r = { name, budget: null }; seen.set(name, r); regions.push(r); }
  }
  return {
    name: spec.name || 'cluster',
    seed: spec.seed ?? spec.name ?? 'cluster',
    ledger: spec.ledger || 'off',
    pruneEvery: spec.pruneEvery ?? 0,
    hebbian: spec.hebbian || { eta: 1e-2, alpha: 1e-4 },
    growth: spec.growth || {},
    gate: spec.gate || {},
    modules: spec.modules || [],
    maxPayloadBytes: spec.maxPayloadBytes ?? 8192,
    // runtime/kernels.mjs is installed inside every shard when this is set, so a sharded
    // arm and a single process arm are running the same compute functions.
    kernels: spec.kernels === true,
    regions,
    cells: spec.cells,
    edges: spec.edges || [],
  };
}

// Build a single process Brain from a spec. The reference implementation: the cluster is
// correct exactly when it agrees with this.
export function buildBrain(spec, over = {}) {
  const s = normalizeSpec(spec);
  const b = new Brain({
    name: s.name, seed: s.seed, ledger: s.ledger, pruneEvery: s.pruneEvery,
    hebbian: s.hebbian, growth: s.growth, gate: s.gate, ...over,
  });
  for (const r of s.regions) b.addRegion(r.name, { budget: r.budget == null ? Infinity : r.budget });
  for (const c of s.cells) b.addCell(c);
  for (const e of s.edges) b.connect(e.src, e.srcPort | 0, e.dst, e.dstPort | 0, { w: e.w, delay: e.delay | 0, conf: e.conf });
  return b;
}

// ---------------------------------------------------------------- partition
// The unit of partition is a region (his design: a region owns a budget and a bus, and
// splitting one would split its attention economy). When more shards are asked for than
// there are regions, the unit drops to region/circuit, which is the next structural
// boundary down; a region split that way keeps its cells' order but its per tick budget
// would be enforced once per shard, so splitting is only done for infinite budgets.
export function assignPartition(spec, shards, partition = null) {
  const s = normalizeSpec(spec);
  const n = s.cells.length;
  const of = new Int32Array(n);
  if (typeof partition === 'function') {
    for (let i = 0; i < n; i++) of[i] = partition(s.cells[i], i) % shards;
  } else if (Array.isArray(partition) || ArrayBuffer.isView(partition)) {
    if (partition.length !== n) throw new Error('partition array must have one entry per cell');
    for (let i = 0; i < n; i++) of[i] = partition[i] % shards;
  } else if (partition && typeof partition === 'object') {
    for (let i = 0; i < n; i++) {
      const r = s.cells[i].region || 'default';
      if (!(r in partition)) throw new Error('partition: no shard for region ' + r);
      of[i] = partition[r] % shards;
    }
  } else {
    const byRegion = s.regions.length >= shards;
    const groups = new Map();
    for (let i = 0; i < n; i++) {
      const c = s.cells[i];
      const key = byRegion ? (c.region || 'default') : (c.region || 'default') + '/' + (c.circuit || 'default');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(i);
    }
    let g = 0;
    for (const list of groups.values()) { const sh = g++ % shards; for (const i of list) of[i] = sh; }
  }
  return of;
}

// ---------------------------------------------------------------- arena sizing
export function planArenas({ cellsPerShard, crossPairs, crossInto, shards, maxPayloadBytes }) {
  const payloadSlab = new Array(shards), descOffsets = new Array(shards), descCap = new Array(shards);
  const payloadBytes = new Array(shards), descWords = new Array(shards);
  for (let s = 0; s < shards; s++) {
    let outgoing = 0;
    for (let d = 0; d < shards; d++) outgoing += crossPairs[s * shards + d];
    // One payload copy per distinct emitted signal per tick, at most one per cell per port.
    payloadSlab[s] = outgoing === 0 ? 1024 : Math.max(4096, cellsPerShard[s] * maxPayloadBytes);
    payloadBytes[s] = payloadSlab[s] * 2; // two slabs, written on alternating ticks
    const caps = new Int32Array(shards), offs = new Int32Array(shards * 2);
    let w = 0;
    for (let d = 0; d < shards; d++) caps[d] = d === s ? 0 : crossPairs[s * shards + d] * 4 + 256;
    for (let slab = 0; slab < 2; slab++) for (let d = 0; d < shards; d++) { offs[slab * shards + d] = w; w += caps[d] * REC; }
    descCap[s] = caps; descOffsets[s] = offs;
    descWords[s] = Math.max(REC, w) + 2 * shards + 16; // counts header lives at the end
  }
  const wbCap = new Array(shards);
  for (let s = 0; s < shards; s++) wbCap[s] = crossInto[s] + 64;
  return { payloadSlab, payloadBytes, descOffsets, descCap, descWords, wbCap };
}
