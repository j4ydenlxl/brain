// genome/spawn.mjs: THE GENOME READ AT ASK TIME. The organism's roster used to be fixed
// the moment seeds/organism.mjs (or genome/load.mjs) finished: every cell it would ever have
// was placed before the first question arrived. This file is the other half of his P7, "the
// number of cells and what the cells do should not be rigid ... cells must spawn when
// prompted": a question is read for its FEATURES, the features select GENES, a gene
// expresses a small CIRCUIT of registered cell kinds, and the circuit is grown into the live
// brain through the same two calls every builder uses (Brain.addCell and Brain.connect), so
// the connectome, the ledger, the scheduler and any viewer see it like any other structure.
//
//   detect(prompt)        the features (number, algebra, sequence, grid, text, code) and the
//                         typed payloads the genes read. Features are a cheap surface guess
//                         and deliberately over-inclusive; a gene still needs its payload.
//   GENES                 the spawn genome, in priority order: which kinds serve which
//                         feature and how one question becomes the signals they are fed.
//   plan(prompt)          every gene that expresses for this prompt, as circuit specs.
//   grow(brain, circuits) ONE cell.add proposal through brain.gate for the cells and edges
//                         the brain does not already hold; only an approved proposal grows.
//   retract(brain, ids)   ONE cell.remove proposal through brain.gate, then the cells leave
//                         the roster for real: their edges are pruned, the survivors behind
//                         them are renumbered, the clock and the circuits forget them.
//
// COMPUTATION IS NOT AUTHORITY (core/gate.mjs). Growth and removal are the built in kinds
// cell.add and cell.remove, judged by whatever policy the brain's gate carries; core's own
// policy approves them only when the evidence says the checks passed, and a gate that holds
// cell.add for a human holds every spawn. Nothing here writes a cell or an edge around it.
//
// WHY REMOVAL IS TAIL ONLY. A cell's index is its address in the connectome's typed arrays,
// in the clock wheel, in the circuit sets and in any observer that keeps per index counts.
// Renumbering a cell some other subsystem placed would move its address under that
// subsystem's feet. retract() therefore removes only when every cell from the first one it
// removes to the end of the roster lives in the spawn region: the cells a question grew are
// appended at the tail, so the common case (prune what this question grew) always qualifies,
// and anything else is refused with the reason rather than attempted.
import * as E from '../tasks/exact.mjs';
import * as S from '../core/signal.mjs';
import { ACTIVE, PRUNED } from '../core/connectome.mjs';
import { getKind, hasKind, portIndex } from '../core/cell.mjs';
import '../cells/index.mjs';
import { G } from '../cells/grid.mjs';
import { searchProgram } from '../tasks/grid.mjs';
import '../tasks/sequence.mjs'; // registers seq.fit
import '../tasks/host.mjs';     // registers task.tap, the read head a chain ends in
import { canonNum } from '../tasks/algebra.mjs';
import { tokenize, parseWhole } from '../act/solve.mjs';
import { sealRegion } from '../mind/index.mjs';
import { edgeFault } from './wire.mjs';

const L = S.S;

/** The region every spawned cell lives in. Its presence is also what turns spawning on by default. */
export const SPAWN_REGION = 'spawn';
/** The features a question is read for, in the order they are reported. */
export const FEATURES = Object.freeze(['number', 'algebra', 'sequence', 'grid', 'text', 'code']);
/** Bounds. cellsPerAsk caps one growth; keptCells caps what the region may hold between asks. */
export const CAPS = Object.freeze({
  chars: 20_000,     // the longest prompt read at all, as act/solve.mjs reads
  cellsPerAsk: 16,   // one proposal never grows more than this
  keptCells: 512,    // past this the region keeps nothing new: an ask still answers, then retracts what it grew
  terms: 64,         // the most terms a sequence may list
  demos: 16,         // the most demonstrations a grid prompt may list
  gridCells: 4_096,  // one grid, as tasks/grid.mjs caps its own search
  depth: 3,          // the grid program depth tasks/grid.mjs was measured at
  exponent: 512,     // |k| in a literal a^k
});
/** Every spawned cell runs on mail only: between questions the region costs no tick at all. */
export const SPAWN_POLICY = Object.freeze({ period: 'event', priority: 2, budget: 1, backend: 'cpu', learn: null });

// ---------------------------------------------------------------- reading the question
// The prompt shapes act/solve.mjs answers, read with the same precedence it reads them
// (grid, then comparison, then sequence, then arithmetic), so a spawned circuit is fed
// exactly the question the exact path would have answered and never a different reading.
const COMPARE_RE = /^Compare two numbers\..*?First\s+(-?[\d.]+)\s*,\s*second\s+(-?[\d.]+)\s*\./is;
const COMPUTE_PREFIX_RE = /^[^:]*\b(?:compute|evaluate|solve|simplify)\b[^:]*:\s*/i;
const SEQUENCE_RE = /first terms of an exact sequence\s*:\s*(.+?)\s*\.\s*What is the next term/is;
const SEQUENCE_QMARK_RE = /^\s*([-\d][-\d.,/\s]*?),\s*\?\s*$/;
const GRID_HEAD_RE = /rows separated by \|/i;
const GRID_DEMO_RE = /^([0-9|]+)\s*->\s*([0-9|]+)$/;
const GRID_TEST_RE = /Apply that same transformation to this input:\s*([0-9|]+)/i;

function readCompare(text) {
  const m = COMPARE_RE.exec(text);
  if (!m) return null;
  try { S.ratFromDecimal(m[1]); S.ratFromDecimal(m[2]); } catch { return null; }
  return { a: m[1], b: m[2] };
}

function readTerms(text) {
  const m = SEQUENCE_RE.exec(text) || SEQUENCE_QMARK_RE.exec(text);
  if (!m) return null;
  const terms = String(m[1]).split(',').map((t) => t.trim()).filter(Boolean);
  if (terms.length < 3 || terms.length > CAPS.terms) return null;
  for (const t of terms) { try { E.qFromString(t); } catch { return null; } }
  return terms;
}

function parseGrid(line) {
  const rows = String(line).split('|').filter((r) => r.length);
  if (!rows.length) return null;
  const w = rows[0].length;
  if (!w || w * rows.length > CAPS.gridCells) return null;
  const cells = [];
  for (const r of rows) {
    if (r.length !== w) return null;
    for (const ch of r) { if (ch < '0' || ch > '9') return null; cells.push(Number(ch)); }
  }
  return { w, h: rows.length, cells };
}

function readGrid(text) {
  const test = GRID_TEST_RE.exec(text);
  if (!test) return null;
  const input = parseGrid(test[1]);
  if (!input) return null;
  const demos = [];
  for (const raw of text.split('\n')) {
    const m = GRID_DEMO_RE.exec(raw.trim());
    if (!m) continue;
    const a = parseGrid(m[1]), b = parseGrid(m[2]);
    if (!a || !b) return null;
    demos.push({ input: a, output: b });
    if (demos.length > CAPS.demos) return null;
  }
  return demos.length >= 2 ? { demos, input } : null;
}

const isEq = (t) => t.t === 'op' && t.v === '=';
function hasUnknown(node) { return !!node && (node.op === 'x' || (Array.isArray(node.args) && node.args.some(hasUnknown))); }

// One equation in x, or one expression with no unknown, from the whole prompt or from what
// follows a prefix that says it asks for a computation.
function readMath(text) {
  const stripped = COMPUTE_PREFIX_RE.exec(text);
  for (const body of [text, stripped ? text.slice(stripped[0].length) : null]) {
    if (body === null) continue;
    const ts = tokenize(body);
    if (!ts) continue;
    const at = ts.findIndex(isEq);
    if (at >= 0) {
      if (ts.slice(at + 1).some(isEq)) continue;
      const left = parseWhole(ts.slice(0, at)), right = parseWhole(ts.slice(at + 1));
      if (left && right && (hasUnknown(left) || hasUnknown(right))) return { eq: { left, right } };
      continue;
    }
    const expr = parseWhole(ts);
    if (expr && !hasUnknown(expr)) return { expr };
  }
  return null;
}

// The AST of act/solve.mjs as a sym tree, spelled the way act/solve.mjs spells it for its
// own sym.solve cell: a rational literal becomes a division of its two integers.
function toSym(node) {
  switch (node.op) {
    case 'q': return node.value.d === 1n ? L.num(node.value.n.toString()) : L.div(L.num(node.value.n.toString()), L.num(node.value.d.toString()));
    case 'x': return L.v('x');
    case 'neg': return L.sub(L.num('0'), toSym(node.args[0]));
    case '%': return L.div(toSym(node.args[0]), L.num('100'));
    case '+': return L.add(toSym(node.args[0]), toSym(node.args[1]));
    case '-': return L.sub(toSym(node.args[0]), toSym(node.args[1]));
    case '*': return L.mul(toSym(node.args[0]), toSym(node.args[1]));
    case '/': return L.div(toSym(node.args[0]), toSym(node.args[1]));
    case '^': return L.pow(toSym(node.args[0]), toSym(node.args[1]));
    default: throw new Error('spawn: unknown node ' + node.op);
  }
}

// A literal, or the negation of one, as an exact rational; anything else is null.
function literal(node) {
  if (!node) return null;
  if (node.op === 'q') return node.value;
  if (node.op === 'neg') { const v = literal(node.args[0]); return v === null ? null : E.qNeg(v); }
  return null;
}

// What a cell would throw on, refused before it is fed: a literal zero divisor, and a literal
// exponent that is not an integer, is past the cap, or raises zero to a negative power. A
// zero reached only by arithmetic (1/(1-1)) still reaches the cell, which throws, and the
// throw is counted in brain.stats.errors like any other.
function evalSafe(node) {
  if (!node || typeof node.op !== 'string') return false;
  if (node.op === 'q' || node.op === 'x') return true;
  if (!Array.isArray(node.args) || !node.args.every(evalSafe)) return false;
  if (node.op === '/') { const d = literal(node.args[1]); if (d !== null && d.n === 0n) return false; }
  if (node.op === '^') {
    const k = literal(node.args[1]);
    if (k !== null) {
      if (k.d !== 1n) return false;
      if ((k.n < 0n ? -k.n : k.n) > BigInt(CAPS.exponent)) return false;
      const b = literal(node.args[0]);
      if (k.n < 0n && b !== null && b.n === 0n) return false;
    }
  }
  return ['neg', '%', '+', '-', '*', '/', '^'].includes(node.op);
}

// One binary operation on two literals, which one num.arith cell computes on its own.
function binop(node) {
  if (!node || !['+', '-', '*', '/', '^'].includes(node.op)) return null;
  const a = literal(node.args[0]), b = literal(node.args[1]);
  if (a === null || b === null) return null;
  if (node.op === '/' && b.n === 0n) return null;
  if (node.op === '^') {
    if (b.d !== 1n || (b.n < 0n ? -b.n : b.n) > BigInt(CAPS.exponent)) return null;
    if (b.n < 0n && a.n === 0n) return null;
  }
  return { op: node.op, a, b };
}

/**
 * The features of one question and the typed payloads the genes read.
 * @param {string} prompt
 * @returns {{features: Record<string, boolean>, list: string[], reads: object}}
 */
export function detect(prompt) {
  const text = String(prompt ?? '');
  const reads = { compare: null, terms: null, math: null, grid: null };
  if (text.trim() && text.length <= CAPS.chars) {
    if (GRID_HEAD_RE.test(text)) reads.grid = readGrid(text);
    else if (!(reads.compare = readCompare(text)) && !(reads.terms = readTerms(text))) reads.math = readMath(text);
  }
  const words = text.match(/[A-Za-z]{2,}/g) || [];
  const features = {
    number: /\d/.test(text),
    algebra: !!(reads.compare || reads.math) || /\d\s*[-+*/^=]\s*[-(\d.x]/.test(text),
    sequence: !!reads.terms || /-?\d[\d./]*\s*,\s*-?\d[\d./]*\s*,\s*-?\d/.test(text),
    grid: !!reads.grid || /\b\d+(?:\|\d+)+\b/.test(text),
    text: words.length >= 3,
    code: /```|\bfunction\b|=>|\bdef\s+\w+\s*\(|\breturn\b|[;{}]\s*$/m.test(text),
  };
  return { features, list: FEATURES.filter((f) => features[f]), reads };
}

// ---------------------------------------------------------------- the genes
// A circuit spec is plain data:
//   gene, method        which gene expressed it, and the method an answer names
//   cells               [{ id, kind, params, circuit }], the whole circuit including cells the
//                       brain may already hold (grow() adds only the missing ones)
//   edges               [{ src, srcPort, dst, dstPort }] by cell id and port NAME
//   exit, depth         the cell whose out port is read, and the ticks from injection to its
//                       emission (0 for a single cell)
//   lanes               [{ inject: [{ id, port, kind, data }], expect? }], one lane per tick;
//                       a lane with expect is a demonstration the circuit must reproduce, and
//                       the last lane is the question
//   read(sig)           the emitted signal as an answer string, or null
//   same(sig, expect)   whether a demonstration lane reproduced its expected output
//   steps               the working, for the answer text
const canonQ = (v) => { try { return E.qToString(E.qFromString(String(v))); } catch { return null; } };
const one = (gene, method, id, kind, params, inject, read, steps) => ({
  gene, method, cells: [{ id, kind, params, circuit: gene }], edges: [], exit: id, depth: 0,
  lanes: [{ inject }], read, same: null, steps,
});
const numRead = (sig) => (sig && sig.kind === 'num' ? canonQ(canonNum(sig.data)) : null);

function gridProgram(reads) {
  const g = reads.grid;
  const found = searchProgram(g.demos, { maxDepth: CAPS.depth });
  if (!found.program) return null;
  const cells = [], edges = [], path = [];
  let prev = null;
  for (const op of found.program) {
    path.push(op.name);
    const id = 'spawn.grid/' + path.join('/');
    cells.push({ id, kind: op.kind, params: op.params, circuit: 'grid' });
    if (prev) edges.push({ src: prev, srcPort: 'out', dst: id, dstPort: 'in' });
    prev = id;
  }
  // The read head: a chain end may later grow children of its own (a longer program that
  // starts with this one), and then nothing it emits reaches the outbox without a tap.
  const tap = (prev || 'spawn.grid/identity') + '#tap';
  cells.push({ id: tap, kind: 'task.tap', params: {}, circuit: 'grid' });
  if (prev) edges.push({ src: prev, srcPort: 'out', dst: tap, dstPort: 'in' });
  const entry = cells[0].id;
  const lanes = g.demos.map((d) => ({ inject: [{ id: entry, port: 'in', kind: 'event', data: d.input }], expect: d.output }));
  lanes.push({ inject: [{ id: entry, port: 'in', kind: 'event', data: g.input }] });
  const names = found.names.length ? found.names.join(' then ') : 'identity';
  return {
    gene: 'program', method: 'spawn.program', cells, edges, exit: tap, depth: found.program.length, lanes,
    read: (sig) => (sig && sig.kind === 'event' && G.valid(sig.data) ? G.toString(sig.data).replace(/\n/g, '|') : null),
    same: (sig, want) => !!sig && sig.kind === 'event' && G.valid(sig.data) && G.equal(sig.data, want),
    steps: [
      g.demos.length + ' demonstrations; the genome searched ' + found.searched + ' candidate programs to depth ' + CAPS.depth,
      'program ' + names + ', grown as live cells in region ' + SPAWN_REGION + ', reproduced every demonstration before it answered',
    ],
  };
}

/**
 * The spawn genome, in priority order: when two genes answer the same question and agree,
 * the earlier one carries the answer and the later one is pruned. Each gene names the kinds
 * it may grow, so plan() can refuse a gene whose kinds are not registered in this process.
 */
export const GENES = Object.freeze([
  {
    name: 'cmp', feature: 'algebra', kinds: ['num.compare'],
    express: (r) => (r.compare ? one('cmp', 'spawn.cmp', 'spawn.cmp', 'num.compare', {},
      [{ id: 'spawn.cmp', port: 'a', kind: 'num', data: S.ratFromDecimal(r.compare.a) }, { id: 'spawn.cmp', port: 'b', kind: 'num', data: S.ratFromDecimal(r.compare.b) }],
      (sig) => (sig && sig.kind === 'event' && [-1, 0, 1].includes(sig.data.cmp) ? String(sig.data.cmp) : null),
      [r.compare.a + ' against ' + r.compare.b + ', compared as exact rationals by a num.compare cell']) : null),
  },
  {
    name: 'solve', feature: 'algebra', kinds: ['sym.solve'],
    express: (r) => {
      if (!r.math || !r.math.eq || !evalSafe(r.math.eq.left) || !evalSafe(r.math.eq.right)) return null;
      let eq;
      try { eq = L.eq(toSym(r.math.eq.left), toSym(r.math.eq.right)); } catch { return null; }
      return one('solve', 'spawn.solve', 'spawn.solve.x', 'sym.solve', { variable: 'x' },
        [{ id: 'spawn.solve.x', port: 'eq', kind: 'sym', data: eq }],
        (sig) => (sig && sig.kind === 'event' && sig.data && sig.data.value !== undefined ? canonQ(sig.data.value) : null),
        ['one linear equation in x, solved exactly by a sym.solve cell']);
    },
  },
  {
    name: 'arith', feature: 'number', kinds: ['num.arith'],
    express: (r) => {
      const b = r.math && r.math.expr ? binop(r.math.expr) : null;
      if (!b) return null;
      const id = 'spawn.arith.' + b.op;
      return one('arith', 'spawn.arith', id, 'num.arith', { op: b.op },
        [{ id, port: 'a', kind: 'num', data: S.rat(b.a.n, b.a.d) }, { id, port: 'b', kind: 'num', data: S.rat(b.b.n, b.b.d) }],
        numRead, ['one operation ' + b.op + ' on two exact rationals, computed by a num.arith cell']);
    },
  },
  {
    name: 'eval', feature: 'number', kinds: ['sym.eval'],
    express: (r) => {
      if (!r.math || !r.math.expr || !evalSafe(r.math.expr)) return null;
      let tree;
      try { tree = toSym(r.math.expr); } catch { return null; }
      return one('eval', 'spawn.eval', 'spawn.eval', 'sym.eval', {},
        [{ id: 'spawn.eval', port: 'expr', kind: 'sym', data: tree }],
        numRead, ['the whole expression evaluated exactly by a sym.eval cell']);
    },
  },
  {
    name: 'fit', feature: 'sequence', kinds: ['seq.fit'],
    express: (r) => (r.terms ? one('fit', 'spawn.fit', 'spawn.fit', 'seq.fit', {},
      [{ id: 'spawn.fit', port: 'terms', kind: 'event', data: { terms: r.terms } }],
      (sig) => (sig && sig.kind === 'event' && sig.data && sig.data.next !== null && sig.data.next !== undefined ? canonQ(sig.data.next) : null),
      [r.terms.length + ' terms given; a seq.fit cell wrote one sym program per hypothesis, verified it at every index given, and evaluated the survivor one index further']) : null),
  },
  {
    name: 'program', feature: 'grid', kinds: ['grid.rotate', 'grid.flip', 'grid.transpose', 'grid.crop', 'grid.translate', 'grid.tile', 'grid.colormap', 'task.tap'],
    express: (r) => (r.grid ? gridProgram(r) : null),
  },
]);

/**
 * Every gene that expresses for this prompt, in genome order.
 * @param {string} prompt
 * @returns {{features: string[], reads: object, circuits: object[], unserved: string[], unregistered: string[]}}
 *   unserved names the detected features no gene serves at all, so a caller can say what the
 *   genome cannot yet grow for instead of pretending the question was not asked.
 */
export function plan(prompt) {
  const d = detect(prompt);
  const circuits = [], unregistered = [];
  for (const g of GENES) {
    if (!d.features[g.feature]) continue;
    if (!g.kinds.every(hasKind)) { unregistered.push(g.name); continue; }
    const c = g.express(d.reads);
    if (c) circuits.push(c);
  }
  const unserved = d.list.filter((f) => !GENES.some((g) => g.feature === f));
  return { features: d.list, reads: d.reads, circuits, unserved, unregistered };
}

// ---------------------------------------------------------------- growth, through the gate
/** How many cells the spawn region holds right now. */
export function regionCells(brain) { const r = brain && brain.regions ? brain.regions.get(SPAWN_REGION) : null; return r ? r.cells.size : 0; }

/** The spawn region's roster, grouped by circuit: what questions have grown and kept. */
export function roster(brain) {
  const out = {};
  const r = brain && brain.regions ? brain.regions.get(SPAWN_REGION) : null;
  if (!r) return { cells: 0, circuits: out };
  for (const idx of [...r.cells].sort((a, b) => a - b)) { const c = brain.cells[idx]; (out[c.circuit] || (out[c.circuit] = [])).push(c.id); }
  return { cells: r.cells.size, circuits: out };
}

/**
 * Grow what the circuits need and the brain does not hold, as ONE cell.add proposal.
 * @param {object} brain
 * @param {object[]} circuits specs from plan()
 * @param {object} [opts] { by, why, maxCells }
 * @returns {{ok: boolean, status: string, proposal: number|null, start?: number, cells: string[], edges: number[], reason?: string}}
 */
export function grow(brain, circuits, { by = 'spawn', why = null, maxCells = CAPS.cellsPerAsk } = {}) {
  const spec = new Map();
  for (const c of circuits) for (const cell of c.cells) if (!brain.byId.has(cell.id) && !spec.has(cell.id)) spec.set(cell.id, cell);
  const kindOf = (id) => (brain.byId.has(id) ? brain.byId.get(id).kind : spec.has(id) ? spec.get(id).kind : null);
  let fault = null;
  for (const [id, c] of spec) if (!hasKind(c.kind)) { fault = fault || id + ': kind ' + c.kind + ' is not registered'; }
  const edges = [], seen = new Set();
  for (const c of circuits) for (const e of c.edges) {
    const ka = kindOf(e.src), kb = kindOf(e.dst);
    if (!ka || !kb || !hasKind(ka) || !hasKind(kb)) { fault = fault || 'edge ' + e.src + ' -> ' + e.dst + ' names a cell with no kind'; continue; }
    const sp = portIndex(ka, 'out', e.srcPort), dp = portIndex(kb, 'in', e.dstPort);
    const key = e.src + '\u0000' + e.dst + '\u0000' + sp + '\u0000' + dp;
    if (seen.has(key)) continue;
    seen.add(key);
    if (brain.byId.has(e.src) && brain.byId.has(e.dst) && brain.connectome.find(brain.byId.get(e.src).idx, brain.byId.get(e.dst).idx, sp, dp) >= 0) continue;
    const f = edgeFault({ id: e.src, ports: getKind(ka).ports }, { id: e.dst, ports: getKind(kb).ports }, sp, dp);
    if (f) fault = fault || f;
    edges.push({ src: e.src, dst: e.dst, sp, dp });
  }
  if (spec.size === 0 && edges.length === 0) return { ok: true, status: 'none', proposal: null, cells: [], edges: [] };
  if (spec.size > maxCells) fault = fault || spec.size + ' cells asked for, the cap is ' + maxCells;
  const genes = [...new Set(circuits.map((c) => c.gene))];
  const p = brain.gate.propose({
    kind: 'cell.add', by,
    what: { region: SPAWN_REGION, cells: [...spec.keys()], edges: edges.length },
    why: why || 'spawn: a question expressed ' + genes.join(', '),
    evidence: {
      testsPassed: fault === null,
      test: 'every kind registered, every edge legal by genome/wire.mjs edgeFault, at most ' + maxCells + ' cells in one growth',
      fault, cells: spec.size, edges: edges.length, genes,
    },
  }, brain.ctx);
  if (p.status !== 'approved') {
    return { ok: false, status: p.status, proposal: p.id, cells: [], edges: [], reason: fault || (p.status === 'pending' ? 'the gate held cell.add for a human' : 'the gate rejected cell.add') };
  }
  const start = brain.cells.length;
  for (const [id, c] of spec) brain.addCell({ id, kind: c.kind, region: SPAWN_REGION, circuit: c.circuit, params: c.params, policy: { ...SPAWN_POLICY } });
  const made = edges.map((e) => brain.connect(e.src, e.sp, e.dst, e.dp, { w: 1, delay: 0, conf: 1, by }));
  // Engineered structure, like the ask route and the language region: co-activation growth
  // may not wire the rest of the organism into a question's circuit (mind/index.mjs).
  if (spec.size) sealRegion(brain, [...spec.keys()]);
  return { ok: true, status: 'approved', proposal: p.id, start, cells: [...spec.keys()], edges: made };
}

// ---------------------------------------------------------------- removal, through the gate
/**
 * Remove spawned cells as ONE cell.remove proposal. Tail only (see the header).
 * @param {object} brain
 * @param {string[]} ids
 * @param {object} [opts] { by, why, evidence } evidence.testsPassed must be true for core's policy
 * @returns {{ok: boolean, status: string, proposal: number|null, removed: string[], edgesPruned: number, reason?: string}}
 */
export function retract(brain, ids, { by = 'spawn', why = 'did not carry the answer', evidence = {} } = {}) {
  const list = [...new Set(ids)].filter((id) => brain.byId.has(id));
  if (!list.length) return { ok: true, status: 'none', proposal: null, removed: [], edgesPruned: 0 };
  const idxs = new Set(list.map((id) => brain.byId.get(id).idx));
  let start = Infinity;
  for (const i of idxs) if (i < start) start = i;
  for (let i = start; i < brain.cells.length; i++) {
    const c = brain.cells[i];
    if (c.region !== SPAWN_REGION) {
      return { ok: false, status: 'refused', proposal: null, removed: [], edgesPruned: 0, reason: 'cell ' + c.id + ' of region ' + c.region + ' sits behind ' + brain.cells[start].id + ', and removal would renumber a cell spawn did not grow' };
    }
  }
  const p = brain.gate.propose({
    kind: 'cell.remove', by,
    what: { region: SPAWN_REGION, cells: list },
    why,
    evidence: { ...evidence, testsPassed: evidence.testsPassed === true, cells: list.length },
  }, brain.ctx);
  if (p.status !== 'approved') {
    return { ok: false, status: p.status, proposal: p.id, removed: [], edgesPruned: 0, reason: p.status === 'pending' ? 'the gate held cell.remove for a human' : 'the gate rejected cell.remove' };
  }
  const edgesPruned = compactTail(brain, start, idxs);
  brain.log({ type: 'cell.remove', region: SPAWN_REGION, cells: list, edgesPruned, proposal: p.id, by });
  return { ok: true, status: 'approved', proposal: p.id, removed: list, edgesPruned };
}

// Every cell at or behind `start` is a spawn cell (retract checked). The cells in `gone`
// leave; the rest keep their objects, state and mailboxes and move down to close the gap.
function compactTail(brain, start, gone) {
  const cells = brain.cells, n0 = cells.length, cx = brain.connectome;
  const map = new Int32Array(n0 - start).fill(-1);
  let next = start;
  for (let i = start; i < n0; i++) if (!gone.has(i)) map[i - start] = next++;
  const to = (i) => (i < start ? i : map[i - start]);
  // 1. forget every tail cell under its old address
  for (let i = start; i < n0; i++) {
    const c = cells[i];
    brain.clock.unregister(c);
    const circ = brain.circuits.get(c.region + '/' + c.circuit);
    if (circ) circ.cells.delete(i);
    const reg = brain.regions.get(c.region);
    if (reg) reg.cells.delete(i);
  }
  // 2. edges: a live edge touching a removed cell is pruned; a live edge touching a moved one
  // is renumbered and rekeyed. An edge pruned before this call keeps the address it had,
  // which is how core leaves every pruned edge: never delivered, never found.
  let pruned = 0;
  const keyOf = (e) => cx.src[e] + ',' + cx.dst[e] + ',' + cx.srcPort[e] + ',' + cx.dstPort[e];
  for (let e = 0; e < cx.n; e++) {
    const s = cx.src[e], d = cx.dst[e];
    if ((s < start && d < start) || (cx.flags[e] & PRUNED)) continue;
    const oldKey = keyOf(e);
    const ns = to(s), nd = to(d);
    if (ns < 0 || nd < 0) {
      if (cx._key.get(oldKey) === e) cx._key.delete(oldKey);
      cx.prune(e);
      pruned++;
      continue;
    }
    if (ns === s && nd === d) continue;
    if (cx._key.get(oldKey) === e) cx._key.delete(oldKey);
    cx.src[e] = ns; cx.dst[e] = nd;
    cx._key.set(keyOf(e), e);
  }
  cx._dirty = true;
  // 3. the roster itself
  const kept = [];
  const sealed = brain.gate.policy && brain.gate.policy.__mindSealed;
  for (let i = start; i < n0; i++) {
    const c = cells[i];
    if (!gone.has(i)) { kept.push(c); continue; }
    brain.byId.delete(c.id);
    if (sealed) sealed.delete(c.id);
    for (const q of c.mailbox) for (const it of q) S.dropPayload(it.sig);
    const k = getKind(c.kind);
    if (typeof k.dispose === 'function') { try { k.dispose(c.state, c); } catch { /* a dispose that throws leaks one state, it does not stop the removal */ } }
  }
  cells.length = start;
  for (const c of kept) {
    c.idx = cells.length;
    cells.push(c);
    brain.clock.register(c);
    brain.addCircuit(c.region, c.circuit).cells.add(c.idx);
    brain.regions.get(c.region).cells.add(c.idx);
    for (const q of c.mailbox) for (const it of q) if (it.from >= start) it.from = to(it.from);
  }
  // circuits the removal emptied go with it; the region stays, because its presence is what
  // keeps spawning on for the next question
  const region = brain.regions.get(SPAWN_REGION);
  for (const key of [...(region ? region.circuits : [])]) {
    const circ = brain.circuits.get(key);
    if (circ && circ.cells.size === 0) { brain.circuits.delete(key); region.circuits.delete(key); }
  }
  // 4. signals in flight, the outbox, the growth counters and the last fired list
  for (const [at, l] of brain.inflight) {
    const keep = [];
    for (const it of l) {
      if (it.dst >= start) { const nd = to(it.dst); if (nd < 0) { S.dropPayload(it.sig); continue; } it.dst = nd; }
      if (it.from >= start) it.from = to(it.from);
      keep.push(it);
    }
    if (keep.length) brain.inflight.set(at, keep); else brain.inflight.delete(at);
  }
  for (const sig of brain.outbox) if (sig.src >= start) sig.src = to(sig.src);
  for (const k of [...brain.coact.counts.keys()]) {
    const a = Math.floor(k / 2097152), b = k % 2097152;
    if (a >= start || b >= start) brain.coact.counts.delete(k);
  }
  if (Array.isArray(brain.lastFired)) brain.lastFired = brain.lastFired.filter((i) => i < start);
  return pruned;
}

/** True when an edge is live, for counting what a growth left standing. */
export function edgeLive(brain, e) { return e >= 0 && e < brain.connectome.n && (brain.connectome.flags[e] & ACTIVE) !== 0; }

/**
 * Whether the brain already holds a whole circuit: every cell by id and kind, and every edge
 * live. A held circuit is an incumbent: it runs without a proposal.
 * @param {object} brain @param {object} c a spec from plan()
 * @returns {boolean}
 */
export function holds(brain, c) {
  for (const cell of c.cells) { const have = brain.byId.get(cell.id); if (!have || have.kind !== cell.kind) return false; }
  for (const e of c.edges) {
    const a = brain.byId.get(e.src), b = brain.byId.get(e.dst);
    if (brain.connectome.find(a.idx, b.idx, portIndex(a.kind, 'out', e.srcPort), portIndex(b.kind, 'in', e.dstPort)) < 0) return false;
  }
  return true;
}
