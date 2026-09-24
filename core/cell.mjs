// core/cell.mjs: THE CELL. A persistent computational object with inputs, outputs,
// internal state, parameters, memory, connections and an execution policy. A kind may
// wrap a neural network, a state machine, a retrieval mechanism, a math operation, or
// an algorithm; all speak Signals through declared ports.
import { isKind } from './signal.mjs';

const KINDS = new Map();

// def = {
//   ports: { in: [{ name, kinds: ['hv', ...] }], out: [{ name, kinds: [...] }] },
//   init(params, cell) -> state,           // serializable state
//   compute(ins, cell, ctx) -> outs,       // ins[portIdx] = [{ sig, w, edge, from }], outs[portIdx] = { kind, data, own? } | null
//     own: true says this kind made `data` fresh in THIS run and keeps no reference to it, so
//     the signal that carries it owns the vector and core/brain.mjs releases its heap slot
//     when the last mailbox it was delivered to consumes it (the payload contract in
//     core/signal.mjs). A kind that also stores `data`, or that passes an incoming payload
//     through, leaves own unset. A receiver that keeps a payload past its tick copies it.
//   learn?(ins, outs, cell, ctx),          // optional local learning hook
//   predict?(cell, ctx) -> { kind, data }, // optional hypothesis about the next input
//   serialize?(state) / deserialize?(json) // optional custom state (de)serialization
//   dispose?(state, cell)                  // optional: return the heap slots this state owns
//     Only a kind whose state holds vectors NOTHING ELSE references may define it. It is
//     called on the state init() built when deserialize() is about to replace that state
//     wholesale (deserializeCell below), which is the one moment a cell's own vectors are
//     orphaned with nobody left to release them: MEASURED on this tree, the level codebook
//     of cells/perception.mjs encode.number was 48 of the 51 garbage slots a 12 major row
//     left behind, all of them made by the init() of a cell the restore then overwrote.
//   cost?: number                          // default budget cost per run
//   doc?: string
// }
export function defineKind(name, def) {
  if (KINDS.has(name)) throw new Error('cell kind already defined: ' + name);
  if (!def.ports || !Array.isArray(def.ports.in) || !Array.isArray(def.ports.out)) throw new Error('kind ' + name + ': ports.in/out required');
  for (const p of [...def.ports.in, ...def.ports.out]) {
    if (!p.name || !Array.isArray(p.kinds) || p.kinds.length === 0) throw new Error('kind ' + name + ': every port needs name + kinds');
    for (const k of p.kinds) if (!isKind(k)) throw new Error('kind ' + name + ': port ' + p.name + ' has unknown signal kind ' + k);
  }
  if (typeof def.compute !== 'function') throw new Error('kind ' + name + ': compute(ins, cell, ctx) required');
  KINDS.set(name, { name, cost: 1, ...def });
  return KINDS.get(name);
}
export function getKind(name) {
  const k = KINDS.get(name);
  if (!k) throw new Error('unknown cell kind: ' + name);
  return k;
}
export function hasKind(name) { return KINDS.has(name); }
export function listKinds() { return [...KINDS.keys()]; }
export function portIndex(kindName, dir, portName) {
  const ports = getKind(kindName).ports[dir];
  const i = ports.findIndex(p => p.name === portName);
  if (i < 0) throw new Error('kind ' + kindName + ' has no ' + dir + ' port ' + portName);
  return i;
}

export const DEFAULT_POLICY = Object.freeze({ period: 1, priority: 1, budget: 1, backend: 'cpu', learn: null });

export function createCell(spec) {
  if (!spec.id) throw new Error('cell needs an id');
  const kind = getKind(spec.kind);
  const policy = { ...DEFAULT_POLICY, ...(spec.policy || {}) };
  if (policy.period !== 'event' && !(Number.isInteger(policy.period) && policy.period >= 1)) throw new Error('cell ' + spec.id + ': period must be a positive integer or "event"');
  // mailCap: the most items one in port may hold (core/brain.mjs _deliver drops the oldest
  // past it). Absent means unbounded, which is the default for every cell that sets none.
  if (policy.mailCap !== undefined && policy.mailCap !== null && !(Number.isInteger(policy.mailCap) && policy.mailCap >= 0)) throw new Error('cell ' + spec.id + ': mailCap must be a non-negative integer or absent, got ' + JSON.stringify(policy.mailCap));
  const params = { ...(kind.defaults || {}), ...(spec.params || {}) };
  const cell = {
    id: spec.id, idx: -1, kind: kind.name,
    region: spec.region || 'default', circuit: spec.circuit || 'default',
    ports: kind.ports, params, policy,
    state: null,
    memory: { working: [], refs: {} },
    stats: { runs: 0, skips: 0, cost: 0, lastT: -1, surprise: 0, errors: 0, fired: 0 },
    mailbox: kind.ports.in.map(() => []),
    prediction: null,
  };
  cell.state = kind.init ? kind.init(params, cell) : {};
  return cell;
}

// Run one cell on the signals delivered to its mailbox. Returns outs (array per out port).
export function runCell(cell, ins, ctx) {
  const kind = getKind(cell.kind);
  let outs;
  try {
    outs = kind.compute(ins, cell, ctx) || [];
  } catch (err) {
    cell.stats.errors++;
    const msg = String(err && err.message || err);
    ctx.ledger?.append({ type: 'cell.error', cell: cell.id, t: ctx.t, gen: ctx.gen, error: msg });
    // A throwing cell must be visible outside the ledger too: the brain keeps a count and the last error.
    if (ctx.brain && ctx.brain.stats) { ctx.brain.stats.errors = (ctx.brain.stats.errors || 0) + 1; ctx.brain.lastError = { cell: cell.id, t: ctx.t, error: msg }; }
    return [];
  }
  if (!Array.isArray(outs)) throw new Error('cell ' + cell.id + ': compute must return an array per out port');
  for (let p = 0; p < outs.length; p++) {
    const o = outs[p];
    if (o == null) continue;
    const allowed = kind.ports.out[p]?.kinds;
    if (!allowed) throw new Error('cell ' + cell.id + ': emitted on undeclared out port ' + p);
    if (!allowed.includes(o.kind)) throw new Error('cell ' + cell.id + ': out port ' + kind.ports.out[p].name + ' declares ' + allowed.join('|') + ', got ' + o.kind);
  }
  cell.stats.runs++;
  cell.stats.lastT = ctx.t;
  cell.stats.cost += kind.cost * cell.policy.budget;
  if (outs.some(o => o != null)) cell.stats.fired++;
  if (kind.learn && cell.policy.learn !== false) {
    try { kind.learn(ins, outs, cell, ctx); } catch (err) { cell.stats.errors++; ctx.ledger?.append({ type: 'cell.learn.error', cell: cell.id, t: ctx.t, error: String(err && err.message || err) }); }
  }
  return outs;
}

export function serializeCell(cell) {
  const kind = getKind(cell.kind);
  return {
    id: cell.id, idx: cell.idx, kind: cell.kind, region: cell.region, circuit: cell.circuit,
    params: cell.params, policy: cell.policy,
    state: kind.serialize ? kind.serialize(cell.state, cell) : cell.state,
    stats: cell.stats, refs: cell.memory.refs,
    working: toSafe(cell.memory.working),
  };
}
// Snapshot-safe encoding for arbitrary working memory: typed arrays become base64 with
// their constructor name, BigInt becomes a tagged string, everything else is plain JSON.
// The result shares nothing with the live cell (structuredClone), so clones cannot alias.
export function toSafe(v) {
  if (v === null || typeof v !== 'object') return typeof v === 'bigint' ? { __big: v.toString() } : v;
  if (ArrayBuffer.isView(v)) return { __ta: v.constructor.name, b64: Buffer.from(v.buffer, v.byteOffset, v.byteLength).toString('base64') };
  if (Array.isArray(v)) return v.map(toSafe);
  const o = {}; for (const k of Object.keys(v)) o[k] = toSafe(v[k]); return o;
}
const TA = { Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array };
export function fromSafe(v) {
  if (v === null || typeof v !== 'object') return v;
  if (v.__big !== undefined) return BigInt(v.__big);
  if (v.__ta) { const b = Buffer.from(v.b64, 'base64'); const Ctor = TA[v.__ta] || Uint8Array; return new Ctor(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); }
  if (Array.isArray(v)) return v.map(fromSafe);
  const o = {}; for (const k of Object.keys(v)) o[k] = fromSafe(v[k]); return o;
}
export function deserializeCell(j) {
  const kind = getKind(j.kind);
  const cell = createCell({ id: j.id, kind: j.kind, region: j.region, circuit: j.circuit, params: j.params, policy: j.policy });
  cell.idx = j.idx;
  // createCell just ran init(), and the next line throws that state away. A kind whose init
  // state owns heap vectors says so with dispose(), and they go back here: the restored state
  // is built first, so a dispose that somehow released a vector the new state shares would
  // still be reading a live slot, never a freed one.
  if (kind.deserialize) {
    const restored = kind.deserialize(j.state, cell);
    if (kind.dispose) kind.dispose(cell.state, cell);
    cell.state = restored;
  } else {
    cell.state = j.state;
  }
  cell.stats = { ...cell.stats, ...j.stats };
  cell.memory.refs = j.refs || {};
  if (j.working) cell.memory.working = fromSafe(j.working);
  return cell;
}
