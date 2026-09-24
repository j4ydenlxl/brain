// simulate/clone.mjs : COPY ON WRITE SUB-BRAINS. Before committing to an external action,
// a region must be able to construct a hypothetical state and run it forward without the
// real organism feeling any of it. A clone is a whole Brain holding a chosen set of cells,
// their internal edges, their state, their pending mail and their in-flight signals, at the
// parent's clock. Nothing is shared: every typed array is reallocated, so a rollout that
// writes weights, memories or working memory cannot reach back into the parent.
//
// The route is serializeCell -> deep copy -> deserializeCell (core/cell.mjs) and a fresh
// Connectome (core/connectome.mjs). A kind that keeps a class instance in state MUST define
// serialize/deserialize; a plain deep copy would hand the clone a lifeless object literal.
// See notes/simulate.md.
import { Brain } from '../core/brain.mjs';
import { serializeCell, deserializeCell } from '../core/cell.mjs';
import { PRUNED } from '../core/connectome.mjs';
import { Clock } from '../core/clock.mjs';

// ---------------------------------------------------------------- deep copy
// Structural copy that reallocates every typed array and ArrayBuffer. Functions and
// primitives pass through by reference (code and immutables cannot be mutated apart).
export function deepCopy(v) {
  if (v === null || typeof v !== 'object') return v;
  if (ArrayBuffer.isView(v)) {
    const buf = v.buffer.slice(v.byteOffset, v.byteOffset + v.byteLength);
    if (v instanceof DataView) return new DataView(buf);
    return new v.constructor(buf);
  }
  if (v instanceof ArrayBuffer) return v.slice(0);
  if (Array.isArray(v)) { const out = new Array(v.length); for (let i = 0; i < v.length; i++) out[i] = deepCopy(v[i]); return out; }
  if (v instanceof Map) { const out = new Map(); for (const [k, x] of v) out.set(deepCopy(k), deepCopy(x)); return out; }
  if (v instanceof Set) { const out = new Set(); for (const x of v) out.add(deepCopy(x)); return out; }
  if (v instanceof Date) return new Date(v.getTime());
  const out = {};
  for (const k of Object.keys(v)) out[k] = deepCopy(v[k]);
  return out;
}

// ---------------------------------------------------------------- which cells
// cells: explicit ids or indices. region: one name or a list. circuit: 'region/name'.
// exclude: ids removed after resolution (a planner cell must never clone itself).
// The result is ordered by the parent's cell index so a clone is byte-stable.
export function resolveIds(brain, opts = {}) {
  const picked = new Set();
  const take = (idx) => picked.add(idx);
  if (opts.cells) for (const c of opts.cells) take(brain.cell(c).idx);
  if (opts.region) for (const name of [].concat(opts.region)) {
    const r = brain.regions.get(name);
    if (!r) throw new Error('clone: no region ' + name);
    for (const idx of r.cells) take(idx);
  }
  if (opts.circuit) for (const key of [].concat(opts.circuit)) {
    const c = brain.circuits.get(key);
    if (!c) throw new Error('clone: no circuit ' + key);
    for (const idx of c.cells) take(idx);
  }
  if (!opts.cells && !opts.region && !opts.circuit) for (const c of brain.cells) take(c.idx);
  if (opts.exclude) for (const c of [].concat(opts.exclude)) { const cell = brain.byId.get(typeof c === 'number' ? brain.cells[c]?.id : c); if (cell) picked.delete(cell.idx); }
  if (opts.excludeKinds) { const bad = new Set([].concat(opts.excludeKinds)); for (const idx of [...picked]) if (bad.has(brain.cells[idx].kind)) picked.delete(idx); }
  return [...picked].sort((a, b) => a - b).map(idx => brain.cells[idx].id);
}

// ---------------------------------------------------------------- the clone
// Returns a Brain. clone.origin records what it came from and how long it took.
// Defaults: no ledger, no structural growth, no pruning, so a rollout changes nothing
// structural and costs nothing to observe. Pass evolve:true to let a clone grow.
export function cloneSub(brain, opts = {}) {
  const t0 = process.hrtime.bigint();
  const ids = resolveIds(brain, opts);
  const seed = opts.seed ?? (brain.name + ':clone:' + brain.clock.t);
  const clone = new Brain({
    name: opts.name ?? (brain.name + '.clone'),
    seed,
    ledger: 'off',
    policy: opts.policy ?? null,
    hebbian: { ...brain.hebbian },
    pruneEvery: opts.evolve ? brain.pruneEvery : 0,
    growth: opts.evolve ? {} : { threshold: Number.MAX_SAFE_INTEGER },
  });
  clone.clock = new Clock({ t: brain.clock.t, gen: brain.clock.gen });

  // regions and circuits that the chosen cells live in
  const wantRegions = new Set(), wantCircuits = new Set();
  for (const id of ids) { const c = brain.byId.get(id); wantRegions.add(c.region); wantCircuits.add(c.region + '/' + c.circuit); }
  for (const name of wantRegions) {
    const r = brain.regions.get(name);
    clone.addRegion(name, { budget: r.budget, doc: r.doc });
  }
  for (const key of wantCircuits) {
    const c = brain.circuits.get(key);
    const cc = clone.addCircuit(c.region, c.name, { period: c.period, doc: c.doc });
    cc.working = deepCopy(c.working);
  }

  // cells: serialize, deep copy, deserialize. Nothing is shared with the parent.
  const idxMap = new Map();
  for (const id of ids) {
    const src = brain.byId.get(id);
    const cell = deserializeCell(deepCopy(serializeCell(src)));
    cell.idx = clone.cells.length;
    idxMap.set(src.idx, cell.idx);
    cell.memory.working = deepCopy(src.memory.working);
    clone.cells.push(cell);
    clone.byId.set(cell.id, cell);
    clone.circuits.get(cell.region + '/' + cell.circuit).cells.add(cell.idx);
    clone.regions.get(cell.region).cells.add(cell.idx);
    clone.clock.register(cell);
  }

  // internal edges only: an edge whose other end was left behind is not part of this state
  const cx = brain.connectome, edgeMap = new Map();
  for (const id of ids) {
    const a = brain.byId.get(id);
    for (const e of cx.outOf(a.idx)) {
      if (cx.flags[e] & PRUNED) continue;
      const dst = idxMap.get(cx.dst[e]);
      if (dst === undefined) continue;
      const ne = clone.connectome.add(idxMap.get(a.idx), dst, {
        srcPort: cx.srcPort[e], dstPort: cx.dstPort[e], w: cx.w[e], delay: cx.delay[e], conf: cx.conf[e],
      });
      clone.connectome.usage[ne] = cx.usage[e];
      clone.connectome.lastT[ne] = cx.lastT[e];
      clone.connectome.flags[ne] = cx.flags[e];
      edgeMap.set(e, ne);
    }
  }

  // mail already delivered but not yet consumed (a cell the scheduler did not fund)
  for (const id of ids) {
    const src = brain.byId.get(id), dstCell = clone.byId.get(id);
    dstCell.mailbox = src.mailbox.map(m => m.map(it => remap(it, idxMap, edgeMap)));
  }
  // signals in flight on the wire, kept at their arrival tick
  for (const [at, list] of brain.inflight) {
    for (const it of list) {
      const dst = idxMap.get(it.dst);
      if (dst === undefined) continue;
      const r = remap(it, idxMap, edgeMap);
      clone._schedule(at, { ...r, dst, dstPort: it.dstPort });
    }
  }
  // The outbox is a queue to the outside world, not internal state. A rollout wants an
  // empty one so takeOutbox() returns only what the rollout itself produced.
  if (opts.copyOutbox) clone.outbox = brain.outbox.map(s => ({ ...s, data: deepCopy(s.data) }));

  // THE OPERATOR GENES (Board 14, item spread). When the genome grows the field (genome.meta.operators,
  // generations/operators-gene.mjs) a clone carries it, and only it: the rest of the genome is the
  // parent's to keep. The copy is deep, so a rollout that changes how the clone improves itself cannot
  // reach back into how the parent does.
  const genes = brain.operatorGenes ?? (brain.organismGenome && brain.organismGenome.meta ? brain.organismGenome.meta.operators : null) ?? null;
  if (genes) clone.operatorGenes = freezeDeep(deepCopy(genes));
  clone.ledgerLevel = opts.ledger ?? 'off';
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  clone.origin = { of: brain.name, t: brain.clock.t, gen: brain.clock.gen, ids, cells: ids.length, edges: clone.connectome.size(), ms, seed, idxMap, edgeMap };
  return clone;
}

// frozen all the way down: the genes are data a clone reads, never a place it writes
function freezeDeep(v) { if (v && typeof v === 'object' && !Object.isFrozen(v)) { for (const k of Object.keys(v)) freezeDeep(v[k]); Object.freeze(v); } return v; }

function remap(it, idxMap, edgeMap) {
  const from = idxMap.has(it.from) ? idxMap.get(it.from) : -1;
  const e = edgeMap.has(it.e) ? edgeMap.get(it.e) : -1;
  return { sig: { ...it.sig, data: deepCopy(it.sig.data), src: from }, w: it.w, e, from };
}

// ---------------------------------------------------------------- proofs of isolation
// stable(): JSON with sorted keys, BigInt as "<n>n", typed arrays as base64. Two brains
// with the same fingerprint hold the same cells, the same state and the same connectome.
export function stable(v) {
  if (typeof v === 'bigint') return '"' + v.toString() + 'n"';
  if (typeof v === 'function' || v === undefined) return 'null';
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (ArrayBuffer.isView(v)) return '"' + Buffer.from(v.buffer, v.byteOffset, v.byteLength).toString('base64') + '"';
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
  if (v instanceof Map) return '{' + [...v].map(([k, x]) => stable(String(k)) + ':' + stable(x)).join(',') + '}';
  if (v instanceof Set) return '[' + [...v].map(stable).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
}

export function fingerprint(brain) {
  return stable({
    name: brain.name,
    clock: brain.clock.serialize(),
    cells: brain.cells.map(serializeCell),
    working: brain.cells.map(c => c.memory.working),
    mailboxes: brain.cells.map(c => c.mailbox.map(m => m.map(it => ({ kind: it.sig.kind, data: it.sig.data, w: it.w, e: it.e, from: it.from })))),
    connectome: brain.connectome.serialize(),
    regions: [...brain.regions.values()].map(r => ({ name: r.name, budget: Number.isFinite(r.budget) ? r.budget : null, cells: [...r.cells], bus: r.bus.length })),
  });
}

// Every (buffer, offset, length) window reachable from a brain's cells. Two brains share
// memory only if one window overlaps another in the same ArrayBuffer.
export function buffers(brain) {
  const out = [];
  const walk = (v, depth) => {
    if (v === null || typeof v !== 'object' || depth > 12) return;
    if (ArrayBuffer.isView(v)) { out.push({ buf: v.buffer, from: v.byteOffset, to: v.byteOffset + v.byteLength }); return; }
    if (Array.isArray(v)) { for (const x of v) walk(x, depth + 1); return; }
    if (v instanceof Map) { for (const x of v.values()) walk(x, depth + 1); return; }
    if (v instanceof Set) { for (const x of v) walk(x, depth + 1); return; }
    for (const k of Object.keys(v)) walk(v[k], depth + 1);
  };
  for (const c of brain.cells) { walk(c.state, 0); walk(c.params, 0); walk(c.memory, 0); walk(c.mailbox, 0); }
  const cx = brain.connectome;
  for (const a of [cx.src, cx.dst, cx.w, cx.delay, cx.usage, cx.lastT, cx.conf, cx.flags, cx.srcPort, cx.dstPort]) out.push({ buf: a.buffer, from: a.byteOffset, to: a.byteOffset + a.byteLength });
  return out;
}

// Windows present in both brains that actually overlap. Empty means no shared memory.
export function sharedBuffers(a, b) {
  const A = buffers(a), B = buffers(b), hits = [];
  const byBuf = new Map();
  for (const w of A) { let l = byBuf.get(w.buf); if (!l) { l = []; byBuf.set(w.buf, l); } l.push(w); }
  for (const w of B) {
    const l = byBuf.get(w.buf);
    if (!l) continue;
    for (const u of l) if (u.from < w.to && w.from < u.to) hits.push({ buf: u.buf, a: [u.from, u.to], b: [w.from, w.to] });
  }
  return hits;
}
