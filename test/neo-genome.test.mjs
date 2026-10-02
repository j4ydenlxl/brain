// test/neo-genome.test.mjs: THE GENOME, THE MACROS (contract c6), THE SPEED and THE DEADLINE of the NEO engine, on temp
// roots only. The genome: every tunable of the search read through the genome in force, its defaults today's constants,
// its bounds those of grow/genome.mjs GENES, every gene read (an allele of it changes a search). The macros: a macro of
// neo/MACROS.json is type-checked, total, placed by the spawner like a primitive, carried by a compiled module and by a
// stage. The speed: the batched, memoised search keeps exactly the cells the plain search keeps. The deadline: grow
// --max-ms keeps what it has and exits 0, and every file of grown/ is written whole (a temporary sibling renamed over it).
// No test reads the tree's grown/ or neo/.
// Run: node --test --test-reporter=tap test/neo-genome.test.mjs
// Author: NEO board builder (THE ENGINE, part 3), 2026-10-02.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as CORE from '../grow/neo-core.mjs';
import { evalNode, expandMacros, makeColony, makeCell, checkCell } from '../grow/neo-kernel.mjs';
import {
  growTask, mergeStage, regate, status, main, featuresOf, engineOf, compileModule, macrosOfCells, stageErrors,
  GROW_SPAWN_SHARE, DEADLINE_WHY, MACROS_FILE, MAX_EXAMPLES,
} from '../grow/neo.mjs';
import { GENES, DEFAULTS, GENOME_FILE, validate, mutate } from '../grow/genome.mjs';
import { validateCell } from '../grow/contract.mjs';
import { renderIndexMjs, answersOf } from '../grow/store.mjs';
import { expectOk } from '../judge/judge.mjs';
import { shaText } from '../grow/teach.mjs';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'neo-genome-'));
const cleanup = () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* already gone */ } };
after(cleanup);
after(() => { CORE.applyGenome(null); CORE.macroCells([]); CORE.setSpeed(true); });
process.on('exit', cleanup);
let dirN = 0;
const tmpDir = (name) => { const d = path.join(TMP, name + '-' + (++dirN)); fs.mkdirSync(d, { recursive: true }); return d; };
const put = (root, rel, text) => { const f = path.join(root, ...rel.split('/')); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); return f; };
const jsonl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
const readJ = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const fresh = (f) => import(pathToFileURL(f).href + '?t=' + Date.now() + '-' + Math.random().toString(36).slice(2));
/** Every file under the given dirs of root as relative path -> base64 bytes. */
function bytesOf(root, dirs) {
  const out = {};
  const walk = (d) => { if (!fs.existsSync(d)) return; for (const n of fs.readdirSync(d).sort()) { const f = path.join(d, n); if (fs.statSync(f).isDirectory()) walk(f); else out[path.relative(root, f)] = fs.readFileSync(f).toString('base64'); } };
  for (const d of dirs) walk(path.join(root, d));
  return out;
}
/** Run fn with the genome and macros of the process put back afterwards (each test starts from today's constants). */
function clean(fn) {
  CORE.applyGenome(null); CORE.macroCells([]);
  try { return fn(); } finally { CORE.applyGenome(null); CORE.macroCells([]); CORE.setSpeed(true); }
}
async function cleanAsync(fn) {
  CORE.applyGenome(null); CORE.macroCells([]);
  try { return await fn(); } finally { CORE.applyGenome(null); CORE.macroCells([]); CORE.setSpeed(true); }
}

// ---------------------------------------------------------------- fixtures: small searches that end before their budget
const sumRows = (from, k) => Array.from({ length: k }, (_, i) => { const a = from + 3 * i, b = 2 * from + 7 * i + 1; return { q: `what is ${a} plus ${b}: about the total`, expect: { contains: [String(a + b)] }, answer: `${a} plus ${b} is ${a + b}.` }; });
const EVEN = Array.from({ length: 12 }, (_, i) => { const n = 4 + 3 * i; return { q: `is ${n} even`, expect: { equals: n % 2 ? 'no' : 'yes' }, answer: n % 2 ? 'no' : 'yes' }; });
const LINES = Array.from({ length: 6 }, (_, i) => { const n = 2 + (i % 3), w = ['apple', 'river', 'stone', 'cloud', 'tiger', 'maple'][i]; const ans = Array.from({ length: n }, (_, j) => `${j + 1}. ${w}`).join('\n'); return { q: `list ${w} ${n} times`, expect: { equals: ans }, answer: ans }; });
const DBL = [5, 8, 13, 21, 34, 55].flatMap((n) => [{ q: `what is ${n} doubled`, expect: { equals: String(2 * n) }, answer: String(2 * n) }, { q: `what is ${n} doubled minus one`, expect: { equals: String(2 * n - 1) }, answer: String(2 * n - 1) }]);
const LW = ['amber', 'birch', 'cedar', 'delta', 'ember', 'fjord', 'grove', 'heron'];
const LONG = LW.map((w, i) => { const s = `${w} ` + Array.from({ length: 22 }, (_, j) => LW[(i + j) % 8]).join(' ') + ' end'; return { q: `say back: ${s}`, expect: { equals: s }, answer: s }; });
const RULE_N = [3, 7, 12, 19, 26, 40, 57, 81, 99, 130];
const RULE = RULE_N.map((n) => ({ q: `apply the rule to ${n}`, expect: { equals: String(2 * n + 1) }, answer: String(2 * n + 1) }));
const RULE_HELD = [5, 9, 44, 71, 200].map((n) => ({ q: `apply the rule to ${n}`, expect: { equals: String(2 * n + 1) } }));
const NEGS6 = ['hello there', 'what is the capital of france', 'tell me a joke', 'is the sky blue today', 'what is 3 times 4', 'about the moon of saturn'];
const NEGS2 = ['hello there', 'tell me a joke'];
const BIG = { maxGenerated: 400000, maxMs: 600000 };
/** A macro: twice its argument plus one (a body of cost 7 the enumeration of cost 4 never reaches by itself). */
const TWICE1 = Object.freeze({ name: 'macro.twice-plus-one-a1b2c3', body: ['transform.add', ['transform.mul', { param: 0 }, { lit: 2 }], { lit: 1 }], params: 1, in: ['num'], out: 'num', size: 5, from: ['test'], at: '2026-10-02T00:00:00.000Z', era: 1 });
const UPPER = Object.freeze({ name: 'macro.shout-d4e5f6', body: ['transform.upper', { param: 0 }], params: 1, in: ['str'], out: 'str' });
const PLACES = [['France', 'Paris'], ['Japan', 'Tokyo'], ['Peru', 'Lima'], ['Chile', 'Santiago'], ['Kenya', 'Nairobi'], ['Egypt', 'Cairo'], ['Spain', 'Madrid'], ['Italy', 'Rome'], ['Greece', 'Athens'], ['Norway', 'Oslo'], ['Sweden', 'Stockholm'], ['Finland', 'Helsinki'], ['Poland', 'Warsaw'], ['Austria', 'Vienna']];
const CAPS = { id: 'caps', from: 'test', sha: 'a'.repeat(64), columns: ['country', 'capital'], rows: PLACES.map(([c, k]) => [c, k]), at: '2026-10-02T00:00:00.000Z' };
const CAPITAL = PLACES.slice(0, 10).map(([c, k], i) => ({ q: i % 2 ? `which city is the capital of ${c}` : `what is the capital of ${c}`, expect: { contains: [k] }, answer: `The capital of ${c} is ${k}.` }));
const base = (task, rows, negatives, extra = {}) => ({ task, rows, negatives, gen: 1, budget: BIG, expectOk, ...extra });
/** What a search did, ms aside: its trace, its count, its kept cells with their guards. */
const fingerprint = (r) => JSON.stringify([r.stats.trace ?? null, r.stats.generated, r.cells.map((c) => [c.id, c.guard, c.pyramid])]);

// ---------------------------------------------------------------- THE GENOME: the tunables, their defaults and bounds
test('TUNABLES are grow/genome.mjs GENES: the same names in the same order, kinds, defaults and bounds; the defaults are the constants', () => {
  assert.deepEqual(Object.keys(CORE.TUNABLES), GENES.map((g) => g.name));
  for (const g of GENES) {
    const [kind, def, a, b, lo, hi] = CORE.TUNABLES[g.name];
    assert.equal(kind, g.kind, g.name);
    assert.deepEqual(def, g.def, g.name);
    if (kind === 'int' || kind === 'real') assert.deepEqual([a, b], [g.min, g.max], g.name);
    if (kind === 'ints') assert.deepEqual([a, b, lo, hi], [g.minLen, g.maxLen, g.lo, g.hi], g.name);
    if (kind === 'words') assert.deepEqual([a, b], [g.minLen, g.maxLen], g.name);
  }
  assert.deepEqual(CORE.GENOME_DEFAULTS, DEFAULTS);
  assert.equal(CORE.GENOME_DEFAULTS.maxGenerated, CORE.BUDGET.maxGenerated);
  assert.equal(CORE.GENOME_DEFAULTS.maxMs, CORE.BUDGET.maxMs);
  assert.equal(CORE.GENOME_DEFAULTS.maxCost, CORE.MAX_COST);
  assert.equal(CORE.GENOME_DEFAULTS.enumShare, CORE.ENUM_SHARE);
  assert.equal(CORE.GENOME_DEFAULTS.maxExamples, MAX_EXAMPLES);
  assert.ok(Object.isFrozen(CORE.GENOME_DEFAULTS) && Object.isFrozen(CORE.GENOME_DEFAULTS.numPool));
});

/** Values at and past every bound of a gene, valid or not. */
function probesOf(g) {
  switch (g.kind) {
    case 'int': return [g.min, g.max, g.min - 1, g.max + 1, g.min + 0.5, String(g.min), null, NaN, Infinity];
    case 'real': return [g.min, g.max, g.min - 0.01, g.max + 0.01, NaN, Infinity, '0.5', null];
    case 'perm': return [g.def.slice().reverse(), g.def.slice(1), [...g.def.slice(1), g.def[1]], [...g.def, 'other'], g.def.map((x) => x.toUpperCase()), 'x'];
    case 'ints': return [[], Array.from({ length: g.maxLen }, (_, i) => i), Array.from({ length: g.maxLen + 1 }, (_, i) => i), [g.lo, g.hi], [g.lo - 1], [g.hi + 1], [1, 1], [1.5], ['1'], 5];
    case 'words': return [[], ['plus'], Array.from({ length: g.maxLen }, (_, i) => 'w' + String.fromCharCode(97 + (i % 26)) + String.fromCharCode(97 + Math.floor(i / 26))), Array.from({ length: g.maxLen + 1 }, (_, i) => 'w' + String.fromCharCode(97 + (i % 26)) + String.fromCharCode(97 + Math.floor(i / 26))), ['Plus'], ['a1'], ['plus', 'plus'], ['x'.repeat(17)], [7], 'plus'];
    default: return [];
  }
}

test('applyGenome takes a value only inside its bounds (exactly grow/genome.mjs validate); any other keeps the default and is named', () => clean(() => {
  let n = 0;
  for (const g of GENES) {
    for (const v of probesOf(g)) {
      const valid = validate({ [g.name]: v }, { partial: true }).ok;
      const { genome, rejected } = CORE.applyGenome({ [g.name]: v });
      assert.equal(rejected.includes(g.name), !valid, g.name + ' ' + JSON.stringify(v));
      assert.deepEqual(genome[g.name], valid ? v : g.def, g.name + ' ' + JSON.stringify(v));
      assert.strictEqual(CORE.genomeInForce(), genome);
      for (const other of GENES) if (other.name !== g.name) assert.deepEqual(genome[other.name], other.def);
      n++;
    }
  }
  assert.ok(n > 250, 'every bound of every gene probed: ' + n);
  // ten mutants of grow/genome.mjs are each taken whole, as a flat genome and as a GENOME.json
  for (let s = 0; s < 10; s++) {
    const m = mutate(DEFAULTS, 'probe-' + s).genome;
    assert.deepEqual(CORE.applyGenome(m), { genome: { ...m }, rejected: [] });
    assert.deepEqual(CORE.applyGenome({ version: 1, genes: m }).genome, { ...m });
  }
  // a name that is no gene is ignored; null, {} and a list are today's constants
  assert.deepEqual(CORE.applyGenome({ noSuchGene: 3, maxCost: 5 }), { genome: { ...DEFAULTS, maxCost: 5 }, rejected: [] });
  for (const g of [null, {}, [], 'maxCost', { genes: null }]) assert.deepEqual(CORE.applyGenome(g).genome, { ...DEFAULTS }, JSON.stringify(g));
  // an allele in force is a copy: changing the given list afterwards changes nothing
  const mine = [9, 8, 7];
  CORE.applyGenome({ numPool: mine });
  mine.push(6);
  assert.deepEqual(CORE.genomeInForce().numPool, [9, 8, 7]);
  assert.ok(Object.isFrozen(CORE.genomeInForce()) && Object.isFrozen(CORE.genomeInForce().numPool));
}));

test('the default genome searches exactly as no genome: the same cells, the same count', () => clean(() => {
  const spec = { ...base('mix', [...sumRows(11, 14), ...EVEN], NEGS6), budget: { maxGenerated: 20000, maxMs: 600000 }, trace: true };
  const none = fingerprint(CORE.spawn(spec));
  assert.equal(fingerprint(CORE.spawn({ ...spec, genome: DEFAULTS })), none);
  assert.equal(fingerprint(CORE.spawn({ ...spec, genome: { version: 1, genes: DEFAULTS } })), none);
  CORE.applyGenome(DEFAULTS);
  assert.equal(fingerprint(CORE.spawn(spec)), none);
}));

// ---------------------------------------------------------------- every gene is read: an allele of it changes a search
const FIXTURES = {
  mix: { rows: [...sumRows(11, 14), ...EVEN], negatives: NEGS6, parents: 12, maxGenerated: 400000 },
  capped: { rows: [...sumRows(11, 14), ...EVEN], negatives: NEGS6, parents: 12, maxGenerated: 1500 },
  lines: { rows: LINES, negatives: NEGS6, parents: 12, maxGenerated: 400000 },
  dbl: { rows: DBL, negatives: NEGS2, parents: 0, maxGenerated: 400000 },
  long: { rows: LONG, negatives: NEGS2, parents: 0, maxGenerated: 400000 },
};
/** The search gene, its allele, and the fixture whose search it changes (every one off its default). */
const READ = {
  maxCost: [4, 'mix'], enumShare: [0.5, 'capped'], mutantCap: [5, 'lines'], mutantSwaps: [0, 'lines'], maxExtra: [0, 'dbl'],
  notFeatures: [0, 'dbl'], offWords: [0, 'dbl'], spanPool: [100, 'mix'], spanMaxCost: [1, 'mix'], templateSlots: [1, 'mix'],
  templateAlts: [0, 'mix'], lineNums: [1, 'lines'], lineSubjects: [0, 'lines'], poolNums: [0, 'mix'], poolExpect: [0, 'mix'],
  poolWords: [0, 'mix'], poolContent: [0, 'mix'], namedCost: [3, 'mix'], costAggregate: [1, 'mix'], costCompare: [1, 'mix'],
  costCompute: [1, 'mix'], costIterate: [1, 'mix'], costTransform: [1, 'mix'],
  familyOrder: [['transform', 'iterate', 'compute', 'compare', 'aggregate'], 'mix'], sourceOrder: [['mutant', 'yesno', 'memory', 'template', 'parent'], 'mix'],
  decimals: [0, 'mix'], numPool: [[7], 'mix'], keyWords: [['plus'], 'mix'], nthPool: [[4], 'mix'], wordAtPool: [[5], 'mix'],
  bigList: [10, 'mix'], bigText: [100, 'long'],
};
const RUN_GENES = ['maxGenerated', 'maxMs', 'maxExamples'];

test('every search gene is read: its allele changes the search of a fixture (trace, count or kept cells), its default does not', () => clean(() => {
  assert.deepEqual([...Object.keys(READ), ...RUN_GENES].sort(), Object.keys(CORE.TUNABLES).sort(), 'every tunable has a row here');
  const runs = {};
  for (const [name, fx] of Object.entries(FIXTURES)) {
    const spec = { ...base(name, fx.rows, fx.negatives), budget: { maxGenerated: fx.maxGenerated, maxMs: 600000 }, trace: true };
    const parents = fx.parents ? CORE.spawn({ ...spec, genome: { maxCost: 3 } }).cells.slice(0, fx.parents) : [];
    const go = (g) => fingerprint(CORE.spawn({ ...spec, parents, genome: { maxCost: 3, ...g } }));
    runs[name] = { go, def: go({}) };
  }
  const blind = [];
  for (const [gene, [allele, fx]] of Object.entries(READ)) {
    assert.equal(validate({ [gene]: allele }, { partial: true }).ok, true, gene + ' allele in bounds');
    const r = runs[fx];
    if (gene !== 'maxCost') assert.equal(r.go({ [gene]: DEFAULTS[gene] }), r.def, gene + ' at its default');
    if (r.go({ [gene]: allele }) === r.def) blind.push(gene);
  }
  assert.deepEqual(blind, [], 'genes the search does not read');
}));

test('the run genes: maxGenerated and maxMs are the budget a spawn without one runs with, maxExamples the examples a module carries', () => clean(() => {
  const rows = sumRows(11, 14);
  const few = CORE.spawn({ task: 'm', rows, negatives: NEGS2, gen: 1, expectOk, genome: { maxGenerated: 1000 } });
  assert.ok(few.stats.generated >= 1000 && few.stats.generated < 1500, 'maxGenerated 1000: ' + few.stats.generated);
  const told = CORE.spawn({ task: 'm', rows, negatives: NEGS2, gen: 1, expectOk, genome: { maxGenerated: 1000 }, budget: { maxGenerated: 3000 } });
  assert.ok(told.stats.generated >= 3000, 'a budget given wins over the gene: ' + told.stats.generated);
  const t0 = Date.now();
  const short = CORE.spawn({ task: 'm', rows, negatives: NEGS2, gen: 1, expectOk, genome: { maxGenerated: 5000000, maxMs: 1000 } });
  assert.equal(short.stats.capped, 'ms');
  assert.ok(Date.now() - t0 < 4000, 'maxMs 1000 stops the search: ' + (Date.now() - t0) + ' ms');
  const cells = CORE.spawn({ task: 'm', rows, negatives: NEGS2, gen: 1, expectOk, budget: { maxGenerated: 20000 } }).cells;
  const spec = { id: 'sum-neo-g1', cls: 'sum', gen: 1, cells, examples: rows };
  assert.equal(compileModule(spec).examples.length, rows.length);
  CORE.applyGenome({ maxExamples: 3 });
  assert.equal(compileModule(spec).examples.length, 3);
}));

test('a spawn carrying its own genome uses it for that spawn only; the genome in force afterwards is the one before it', () => clean(() => {
  const spec = { ...base('dbl', DBL, NEGS2), trace: true };
  const at3 = fingerprint(CORE.spawn({ ...spec, genome: { maxCost: 3 } }));
  const before = CORE.applyGenome({ maxCost: 4, mutantCap: 7 }).genome;
  assert.equal(fingerprint(CORE.spawn({ ...spec, genome: { maxCost: 3 } })), at3, 'the spawn genome replaces the process genome whole');
  assert.strictEqual(CORE.genomeInForce(), before);
  const at4 = fingerprint(CORE.spawn(spec));
  assert.notEqual(at4, at3);
  CORE.applyGenome(null);
  assert.equal(fingerprint(CORE.spawn({ ...spec, genome: { maxCost: 4, mutantCap: 7 } })), at4);
  assert.deepEqual(CORE.genomeInForce(), DEFAULTS);
}));

test('THE CURSOR basis: unchanged at the defaults and by a run gene; changed by a search gene and by a macro in force', () => clean(() => {
  const b0 = CORE.cursorBasis(DBL);
  CORE.applyGenome(DEFAULTS);
  assert.equal(CORE.cursorBasis(DBL), b0);
  CORE.applyGenome({ maxGenerated: 5000, maxMs: 2000, maxExamples: 5 });
  assert.equal(CORE.cursorBasis(DBL), b0, 'a run gene changes nothing a search tries');
  CORE.applyGenome({ maxCost: 6 });
  const b1 = CORE.cursorBasis(DBL);
  assert.notEqual(b1, b0);
  CORE.applyGenome({ maxCost: 6, maxGenerated: 5000 });
  assert.equal(CORE.cursorBasis(DBL), b1);
  CORE.applyGenome({ keyWords: ['of'] });
  assert.notEqual(CORE.cursorBasis(DBL), b0);
  assert.notEqual(CORE.cursorBasis(DBL), b1);
  CORE.applyGenome(null);
  CORE.macroCells([TWICE1]);
  const bm = CORE.cursorBasis(DBL);
  assert.notEqual(bm, b0);
  CORE.macroCells([]);
  assert.equal(CORE.cursorBasis(DBL), b0);
  // a cursor written under one genome starts a search under another again at round 0, at that genome's maxCost
  const first = CORE.spawn({ ...base('dbl', DBL, NEGS2), genome: { maxCost: 3 } });
  assert.equal(CORE.resumeCursor(first.stats.cursor, CORE.cursorBasis(DBL)).round, 0);
  CORE.applyGenome({ maxCost: 3 });
  assert.equal(CORE.resumeCursor(first.stats.cursor, CORE.cursorBasis(DBL)).round, 1);
  CORE.applyGenome({ maxCost: 5 });
  assert.deepEqual(CORE.resumeCursor(null, CORE.cursorBasis(DBL)), { round: 0, replay: 0, maxCost: 5, window: 0 });
}));

// ---------------------------------------------------------------- THE MACROS: type-checked, total, placed, carried
test('macroCells loads only macros the kernel type-checks; the first of a name wins; a list, a MACROS.json or null', () => clean(() => {
  const m = (o) => ({ name: 'macro.case-abc123', params: 1, body: ['transform.upper', { param: 0 }], ...o });
  const bad = {
    'a name outside macro.<slug>': m({ name: 'Macro.case' }),
    'the name of a primitive': m({ name: 'transform.upper' }),
    'an empty slug': m({ name: 'macro.' }),
    'a body naming a macro': m({ name: 'macro.wrap-000001', body: [TWICE1.name, { param: 0 }], in: ['num'] }),
    'a parameter never used': m({ params: 2 }),
    'a parameter at two types': m({ body: ['transform.add', ['aggregate.chars', { param: 0 }], { param: 0 }] }),
    'a parameter past params': m({ body: ['transform.upper', { param: 1 }] }),
    'an in that is not the place types': m({ in: ['num'] }),
    'an out that is not the apex out': m({ out: 'num' }),
    'more than eight parameters': m({ params: 9 }),
    'a body that is a leaf': m({ params: 0, body: { lit: 3 } }),
    'a nullary primitive outside sense and memory': m({ params: 0, body: ['transform.upper'] }),
    'a literal of the wrong type': m({ params: 0, body: ['transform.upper', { lit: 3 }] }),
    'a parameter in a text place': m({ params: 1, body: ['transform.add', { param: 0 }, { lit: 1 }], in: ['text'] }),
  };
  for (const [why, x] of Object.entries(bad)) assert.deepEqual(CORE.macroCells([x]), { loaded: [], rejected: 1 }, why);
  for (const x of [null, 7, 'macro.x', { name: 'macro.x-1' }]) assert.deepEqual(CORE.macroCells([x]), { loaded: [], rejected: 1 }, JSON.stringify(x));
  assert.deepEqual(CORE.macroCells([TWICE1, UPPER]), { loaded: [TWICE1.name, UPPER.name], rejected: 0 });
  assert.deepEqual(CORE.macroCells({ macros: [UPPER, { ...UPPER, body: ['transform.lower', { param: 0 }] }] }), { loaded: [UPPER.name], rejected: 1 });
  assert.deepEqual(CORE.macrosOf(['render.str', [UPPER.name, ['sense.text']]])[0].body, ['transform.upper', { param: 0 }], 'the first of a name wins');
  assert.deepEqual(CORE.macroCells(null), { loaded: [], rejected: 0 });
  assert.deepEqual(CORE.macrosOf(['render.str', [UPPER.name, ['sense.text']]]), [], 'null clears them');
  // in and out may be left out: the kernel derives them
  CORE.macroCells([{ name: TWICE1.name, params: 1, body: TWICE1.body }]);
  assert.deepEqual(CORE.macrosOf(['render.number', [TWICE1.name, ['sense.first']]]), [{ name: TWICE1.name, params: 1, in: ['num'], out: 'num', body: TWICE1.body }]);
}));

test('a macro node is total and answers what its expansion answers; a cell naming one is checked only while it is loaded', () => clean(() => {
  CORE.macroCells([TWICE1, UPPER]);
  const nodes = [
    ['render.number', [TWICE1.name, ['sense.first']]],
    ['render.str', [UPPER.name, ['sense.text']]],
    ['render.number', ['transform.add', [TWICE1.name, ['sense.first']], [TWICE1.name, ['sense.last']]]],
    ['render.number', [TWICE1.name, [TWICE1.name, ['sense.first']]]],
  ];
  const qs = ['apply the rule to 4', 'apply the rule to 4 and 10', 'no number here', '', 'x'.repeat(5000), 'apply the rule to 1e400', 'to -3.5 and 2'];
  for (const n of nodes) {
    const flat = expandMacros(n);
    assert.ok(!JSON.stringify(flat).includes('macro.'), 'the expansion names primitives only');
    for (const q of qs) assert.deepEqual(evalNode(n, q, null), evalNode(flat, q, null), JSON.stringify(n) + ' on ' + q.slice(0, 30));
  }
  assert.equal(evalNode(nodes[0], 'apply the rule to 4', null), '9');
  assert.equal(evalNode(nodes[3], 'apply the rule to 4', null), '19');
  assert.equal(evalNode(nodes[0], 'no number here', null), null, 'a null argument is a null');
  assert.equal(evalNode([TWICE1.name], 'apply the rule to 4', null), null, 'a node of the wrong arity is a null, never a throw');
  assert.equal(evalNode([TWICE1.name, ['sense.first'], ['sense.first']], 'apply the rule to 4', null), null);
  const cell = makeCell({ task: 't', gen: 1, guard: [['has', 'rule']], pyramid: nodes[0], fit: { ok: 1, n: 1 } });
  assert.equal(checkCell(cell).ok, true, JSON.stringify(checkCell(cell).errors));
  assert.equal(makeColony([cell]).answer('apply the rule to 4'), '9');
  CORE.macroCells([]);
  assert.equal(checkCell(cell).ok, false, 'a macro no longer loaded is an unknown name');
  assert.equal(evalNode(nodes[0], 'apply the rule to 4', null), null);
}));

test('the spawner places a macro like a primitive: a rule out of reach at cost 4 is mastered through it, and its cells name it', () => clean(() => {
  const spec = { ...base('rule', RULE, ['hello there', 'what is 3 plus 4']), genome: { maxCost: 4 } };
  const heldOk = (cells) => { const col = makeColony(cells); return RULE_HELD.filter((h) => expectOk(col.answer(h.q), h.expect)).length; };
  const without = CORE.spawn(spec);
  assert.equal(heldOk(without.cells), 0, 'without the macro no kept cell computes 2n+1 at cost 4');
  assert.ok(!without.cells.some((c) => JSON.stringify(c.pyramid).includes('macro.')));
  CORE.macroCells([TWICE1, UPPER]);
  const withM = CORE.spawn(spec);
  assert.equal(heldOk(withM.cells), RULE_HELD.length, 'with it every held-out row');
  const named = withM.cells.filter((c) => JSON.stringify(c.pyramid).includes(TWICE1.name));
  assert.ok(named.length >= 1);
  for (const c of named) { assert.equal(checkCell(c).ok, true); assert.equal(CORE.familyOf(c), 'transform'); }
  assert.ok(!withM.cells.some((c) => JSON.stringify(c.pyramid).includes(UPPER.name)), 'a macro of no use to the rows is placed in no kept cell');
  assert.notEqual(withM.stats.generated, without.stats.generated, 'the macro is an operator of the enumeration');
  assert.equal(JSON.stringify(CORE.spawn(spec).cells), JSON.stringify(withM.cells), 'the same macros give the same cells');
}));

test('a compiled module carries exactly the macros its cells name and answers through them with no registry outside it', async () => cleanAsync(async () => {
  CORE.macroCells([TWICE1, UPPER]);
  const { cells } = CORE.spawn({ ...base('rule', RULE, ['hello there']), genome: { maxCost: 4 } });
  const comp = compileModule({ id: 'rule-neo-g1', cls: 'rule', gen: 1, cells, examples: RULE });
  assert.ok(comp.source);
  assert.deepEqual(comp.macros.map((m) => m.name), [TWICE1.name]);
  assert.deepEqual(macrosOfCells(cells).map((m) => m.name), [TWICE1.name]);
  assert.ok(comp.source.includes('// the macros the cells name (neo/MACROS.json, contract c6)\nmacroLoad(' + JSON.stringify(comp.macros) + ');'));
  assert.ok(!comp.source.includes(UPPER.name));
  const f = put(tmpDir('module'), 'rule-neo-g1.mjs', comp.source);
  CORE.macroCells([]); // the module holds its own kernel and its own macros
  const mod = await fresh(f);
  assert.equal(validateCell(comp.source, mod).ok, true);
  for (const h of RULE_HELD) assert.ok(expectOk(mod.answer(h.q), h.expect), h.q + ' -> ' + mod.answer(h.q));
  assert.equal(mod.answer('hello there'), null);
  // no macro named: no macroLoad call in the module
  const plain = compileModule({ id: 'dbl-neo-g1', cls: 'dbl', gen: 1, cells: CORE.spawn({ ...base('dbl', DBL, NEGS2), genome: { maxCost: 3 } }).cells, examples: DBL });
  assert.deepEqual(plain.macros, []);
  assert.ok(!plain.source.includes('// the macros the cells name'));
}));

test('familyOf, usesKnow and isFallback see through a macro to the primitives of its body', () => clean(() => {
  const KNOWM = { name: 'macro.fact-num-0a0b0c', params: 1, body: ['know.num', { param: 0 }] };
  const NEAR = { name: 'macro.nearest-0d0e0f', params: 1, body: ['memory.nearest', { param: 0 }] };
  assert.deepEqual(CORE.macroCells([KNOWM, NEAR, UPPER]).loaded, [KNOWM.name, NEAR.name, UPPER.name]);
  const cell = (pyramid) => makeCell({ task: 't', gen: 1, guard: [['has', 'x']], pyramid, fit: { ok: 1, n: 1 } });
  const k = cell(['render.number', [KNOWM.name, ['sense.text']]]), n = cell(['render.str', [NEAR.name, ['sense.text']]]), u = cell(['render.str', [UPPER.name, ['sense.text']]]);
  for (const c of [k, n, u]) assert.equal(checkCell(c).ok, true, JSON.stringify(checkCell(c).errors));
  assert.deepEqual([k, n, u].map(CORE.familyOf), ['know', 'memory', 'transform']);
  assert.deepEqual([k, n, u].map(CORE.usesKnow), [true, false, false]);
  assert.deepEqual([k, n, u].map(CORE.isFallback), [false, true, false]);
}));

test('engineOf puts neo/GENOME.json and neo/MACROS.json in force (a bad gene or macro left out, a stage macro after the tree)', () => clean(() => {
  const root = tmpDir('engine');
  assert.deepEqual(engineOf(root), { rejected: [], macros: [] }, 'no file: the defaults and no macro');
  assert.deepEqual(CORE.genomeInForce(), DEFAULTS);
  put(root, GENOME_FILE, JSON.stringify({ version: 1, genes: { maxCost: 3, mutantCap: 99999999, keyWords: ['of', 'Of'] } }));
  put(root, MACROS_FILE, JSON.stringify({ macros: [TWICE1, { name: 'macro.bad-000000', params: 1, body: ['transform.upper', { param: 1 }] }] }));
  assert.deepEqual(engineOf(root, [UPPER, { ...TWICE1, body: ['transform.mul', { param: 0 }, { lit: 3 }] }]), { rejected: [], macros: [TWICE1.name, UPPER.name] });
  assert.equal(CORE.genomeInForce().maxCost, 3);
  assert.equal(CORE.genomeInForce().mutantCap, DEFAULTS.mutantCap, 'out of bounds: the default');
  assert.deepEqual(CORE.genomeInForce().keyWords, DEFAULTS.keyWords);
  assert.deepEqual(CORE.macrosOf(['render.number', [TWICE1.name, ['sense.first']]])[0].body, TWICE1.body, "the tree's macro wins over a stage's of its name");
  put(root, MACROS_FILE, '{ not json');
  put(root, GENOME_FILE, '[1, 2]');
  assert.deepEqual(engineOf(root), { rejected: [], macros: [] });
  assert.deepEqual(CORE.genomeInForce(), DEFAULTS);
  assert.ok(featuresOf().includes('genome') && featuresOf().includes('macros'));
}));

// ---------------------------------------------------------------- THE SPEED: the batched search keeps what the plain one keeps
test('the batched, memoised search (setSpeed on) keeps exactly the cells the plain search keeps, on every fixture, a pack and a macro', () => clean(() => {
  const what = (r) => JSON.stringify([r.cells, r.stats.generated, r.stats.distinct, r.stats.kept, r.stats.byFamily, r.stats.bySource, r.stats.devOk, r.stats.know, r.stats.cursor]);
  const parents = CORE.spawn({ ...base('mix', [...sumRows(11, 14), ...EVEN], NEGS6), genome: { maxCost: 3 } }).cells.slice(0, 12);
  // parents that fail some rows: the batched keep must drop a candidate at its first failing row, never skip the row
  const dblParents = CORE.spawn({ ...base('dbl', DBL, NEGS2), genome: { maxCost: 3 } }).cells;
  // a parent whose lazy primitive (route.first) takes a null argument on half the rows: the batched evaluation must not call it a miss
  const PICK = ['red', 'blue', 'green', 'amber', 'olive', 'coral', 'ivory', 'slate'].map((w, i) => ({ q: i % 2 ? `pick ${w} please` : `choose one or ${w}`, expect: { equals: w }, answer: w }));
  const picker = makeCell({ task: 'pick', gen: 1, guard: [], pyramid: ['render.str', ['route.first', ['sense.after', { lit: 'pick' }], ['sense.after', { lit: 'or' }]]], fit: { ok: 1, n: 1 } });
  assert.equal(PICK.filter((r) => evalNode(['sense.after', { lit: 'pick' }], r.q, null) === null).length, 4, 'the first branch is null on half the rows');
  const specs = [
    { ...base('mix', [...sumRows(11, 14), ...EVEN], NEGS6), parents, budget: { maxGenerated: 30000, maxMs: 600000 } },
    { ...base('lines', LINES, NEGS6), genome: { maxCost: 4 } },
    { ...base('dbl', DBL, NEGS2), genome: { maxCost: 4 } },
    { ...base('dbl', DBL, NEGS2), parents: dblParents, genome: { maxCost: 3 } },
    { ...base('pick', PICK, NEGS2), parents: [picker], genome: { maxCost: 3 }, lazy: true },
    { ...base('long', LONG, NEGS2), genome: { maxCost: 4 } },
    { ...base('capital', CAPITAL, NEGS6), packs: [CAPS], source: 'caps', budget: { maxGenerated: 20000, maxMs: 600000 } },
    { ...base('rule', RULE, NEGS6), genome: { maxCost: 4 }, macros: true },
  ];
  assert.equal(CORE.setSpeed(true), true, 'on by default');
  for (const { macros, lazy, ...s } of specs) {
    CORE.macroCells(macros ? [TWICE1, UPPER] : []);
    CORE.setSpeed(true);
    const fast = CORE.spawn(s);
    assert.equal(CORE.setSpeed(false), true);
    const slow = CORE.spawn(s);
    CORE.setSpeed(true);
    assert.ok(fast.cells.length > 0, s.task);
    if (lazy) assert.ok(slow.cells.some((c) => JSON.stringify(c.pyramid).includes('route.first')), 'the plain search keeps a child of the lazy parent');
    assert.equal(what(fast), what(slow), s.task + ': the same kept cells, the same counts');
    assert.equal(what(CORE.spawn(s)), what(fast), s.task + ': the memo of one search is not the next one\'s');
  }
}));

// ---------------------------------------------------------------- THE DEADLINE and the atomic writes, on temp roots
const HAND = Object.freeze({ id: 'hand-g1', class: 'writing', generation: 1, lane: 'a', file: 'cells/hand-g1.mjs', heldout: { score: 0.5, n: 2, ok: 1 }, promotedAt: '2026-09-30T00:00:00.000Z' });
const HAND_TEXT = [
  '// a locked (hand-grown) cell for test/neo-genome.test.mjs',
  'export const meta = Object.freeze(' + JSON.stringify({ id: 'hand-g1', class: 'writing', generation: 1, lane: 'a', version: 1 }) + ');',
  'export const examples = ' + JSON.stringify([{ q: 'write a haiku about rain', expect: { contains: ['soft'] } }]) + ';',
  "export function can(q) { return (' ' + String(q ?? '').toLowerCase() + ' ').includes(' haiku '); }",
  "export function answer(q) { return can(q) ? 'soft rain on the roof' : null; }", '',
].join('\n');
const DOUBLED = (() => {
  const rows = [];
  for (let n = 3; rows.length < 30; n += 7) { const q = [`Double ${n}`, `What is ${n} doubled?`, `Twice ${n} is what?`][rows.length % 3]; rows.push({ q, expect: { equals: String(2 * n) }, answer: String(2 * n) }); }
  return { dev: rows.slice(0, 20), heldout: rows.slice(20).map((r) => ({ q: r.q, expect: r.expect })) };
})();
const TASKS = { doubled: DOUBLED, rule: { dev: RULE, heldout: RULE_HELD } };
const STUB_BASELINE = ['// stand-in judge/baseline.mjs of a temp root: an organism that answers nothing', 'export const PACK = null;', 'export async function runOrganism(rows) { return rows.map((r) => ({ q: r.q, got: null })); }', ''].join('\n');
/** A tree with one hand-grown cell in grown/, the given tasks opened in neo/, judge/control.jsonl and a stand-in organism. */
function growRoot(tasks = ['doubled'], { genome = null, macros = null } = {}) {
  const root = tmpDir('grow-root');
  put(root, 'grown/' + HAND.file, HAND_TEXT);
  const index = { generation: 4, cells: [HAND] };
  put(root, 'grown/index.json', JSON.stringify(index, null, 2) + '\n');
  put(root, 'grown/index.mjs', renderIndexMjs(index));
  const ledger = { tasks: [], generated: 0, note: 'the teacher keeps this key' };
  for (const task of tasks) {
    const d = jsonl(TASKS[task].dev), h = jsonl(TASKS[task].heldout);
    put(root, 'neo/tasks/' + task + '/dev.jsonl', d);
    put(root, 'neo/tasks/' + task + '/heldout.jsonl', h);
    ledger.tasks.push({ task, generation: 1, devSha: shaText(d), heldoutSha: shaText(h), dev: TASKS[task].dev.length, heldout: TASKS[task].heldout.length, by: 'test', at: '2026-10-01T00:00:00.000Z' });
  }
  put(root, 'neo/LEDGER.json', JSON.stringify(ledger, null, 2) + '\n');
  if (genome) put(root, GENOME_FILE, JSON.stringify({ version: 1, genes: genome }) + '\n');
  if (macros) put(root, MACROS_FILE, JSON.stringify({ macros }) + '\n');
  put(root, 'judge/control.jsonl', jsonl(['Double the 21 eggs in the basket', 'tell me a joke about cats'].map((q) => ({ q }))));
  put(root, 'judge/baseline.mjs', STUB_BASELINE);
  return root;
}
const nobody = async (rows) => rows.map((r) => ({ q: r.q, got: null }));
const NOW = () => new Date('2026-10-02T12:00:00.000Z');
/** main with the output lines captured: { code, last } (last: the JSON line it printed last). */
async function cli(args) {
  const lines = [], errs = [];
  const code = await main(args, { log: (l) => lines.push(l), err: (l) => errs.push(l), organism: nobody });
  return { code, last: JSON.parse(lines.at(-1)), errs };
}

test('grow --max-ms past its deadline keeps what it has and exits 0: colony.json and the ledger (direct), the stage file (--stage)', async () => cleanAsync(async () => {
  const root = growRoot(), grown0 = bytesOf(root, ['grown']);
  const d = await cli(['grow', '--task', 'doubled', '--gen', '5', '--max-ms', '1', '--root', root]);
  assert.equal(d.code, 0, JSON.stringify(d));
  assert.equal(d.last.deadline, true);
  assert.equal(d.last.promoted, false);
  assert.equal(d.last.why[0], DEADLINE_WHY + ' (after the search)', 'the grow itself stops after the search');
  assert.deepEqual(bytesOf(root, ['grown']), grown0, 'grown/ untouched');
  const col = readJ(path.join(root, 'neo', 'tasks', 'doubled', 'colony.json'));
  assert.equal(col.cells.length, d.last.kept);
  assert.equal(readJ(path.join(root, 'neo', 'LEDGER.json')).generated, d.last.generated, 'the generated count is in the ledger');
  const sdir = tmpDir('stage-late'), before = bytesOf(root, ['grown', 'neo']);
  const s = await cli(['grow', '--task', 'doubled', '--gen', '6', '--max-ms', '1', '--stage', sdir, '--root', root]);
  assert.equal(s.code, 0, JSON.stringify(s));
  assert.equal(s.last.deadline, true);
  assert.equal(s.last.staged, path.join(sdir, 'doubled.json'));
  assert.deepEqual(bytesOf(root, ['grown', 'neo']), before, 'a stage changes nothing in the tree');
  const doc = readJ(s.last.staged);
  assert.equal(stageErrors(doc, 'doubled.json'), null);
  assert.equal(doc.result.deadline, true);
  assert.equal(doc.result.why[0], DEADLINE_WHY + ' (after the search)');
  assert.equal(doc.result.heldout, null, 'stopped before the held-out measure: no score claimed');
  const m = await mergeStage({ root, dir: sdir, organism: nobody, now: NOW });
  assert.deepEqual(m.refused, []);
  assert.deepEqual(m.merged, ['doubled']);
}));

test('without --max-ms there is no deadline: the line has no deadline key and the grow runs to its end', async () => cleanAsync(async () => {
  const root = growRoot(), sdir = tmpDir('stage-free');
  const s = await cli(['grow', '--task', 'doubled', '--gen', '5', '--max-generated', '8000', '--stage', sdir, '--root', root]);
  assert.equal(s.code, 0);
  assert.equal('deadline' in s.last, false);
  assert.equal(s.last.promotable, true, JSON.stringify(s.last.why));
  const g = await cli(['grow', '--task', 'doubled', '--gen', '5', '--max-generated', '8000', '--max-ms', '600000', '--root', root]);
  assert.equal(g.code, 0);
  assert.equal('deadline' in g.last, false, 'a deadline not reached is not named');
  assert.equal(g.last.promoted, true, JSON.stringify(g.last.why));
}));

test('grow --max-ms tells its search GROW_SPAWN_SHARE of the time and reads the budget genes of neo/GENOME.json', async () => cleanAsync(async () => {
  assert.equal(GROW_SPAWN_SHARE, 0.7);
  const root = growRoot(['doubled'], { genome: { maxGenerated: 5000000 } }), sdir = tmpDir('stage-share');
  const t0 = Date.now();
  const s = await cli(['grow', '--task', 'doubled', '--gen', '5', '--max-ms', '3000', '--stage', sdir, '--root', root]);
  const took = Date.now() - t0;
  assert.equal(s.code, 0, JSON.stringify(s));
  const st = readJ(path.join(sdir, 'doubled.json')).stats;
  assert.equal(st.capped, 'ms', 'the genome lifted the count bar, so time stopped the search');
  assert.ok(st.ms >= 1000 && st.ms <= 3000 * GROW_SPAWN_SHARE, 'the search ran inside 0.7 of 3000 ms: ' + st.ms);
  assert.ok(took < 3000 + 4000, 'the grow ends near its deadline: ' + took);
}));

test('a SELECT the deadline overtakes stops where it is: the organism outlasts --max-ms, the stage is not promotable and says before the prune', async () => cleanAsync(async () => {
  const root = growRoot(), sdir = tmpDir('stage-slow');
  const slow = async (rows) => { await new Promise((r) => setTimeout(r, 2600)); return rows.map((r) => ({ q: r.q, got: null })); };
  const out = await growTask({ root, task: 'doubled', gen: 5, organism: slow, budget: { maxGenerated: 8000, maxMs: 2500 }, now: NOW, stage: sdir });
  assert.equal(out.deadline, true, JSON.stringify(out.why));
  assert.equal(out.promotable, false);
  assert.deepEqual(out.why, [DEADLINE_WHY + ' (before the prune)']);
  const doc = readJ(path.join(sdir, 'doubled.json'));
  assert.deepEqual(doc.result.heldout, { ok: 10, n: 10, score: 1 }, 'measured before the deadline: a claim the merge checks');
  assert.equal(doc.module, null);
  const m = await mergeStage({ root, dir: sdir, organism: nobody, now: NOW });
  assert.deepEqual(m.refused, []);
  assert.deepEqual(m.merged, ['doubled']);
}));

test('a stage its deadline stopped claims no held-out score: the merge measures it; a stage that claims one must match it', async () => cleanAsync(async () => {
  const root = growRoot(), sdir = tmpDir('stage-claim');
  await growTask({ root, task: 'doubled', gen: 5, organism: nobody, budget: { maxGenerated: 8000 }, now: NOW, stage: sdir });
  const f = path.join(sdir, 'doubled.json'), doc = readJ(f);
  assert.deepEqual(doc.result.heldout, { ok: 10, n: 10, score: 1 });
  const wrong = { ...doc, result: { ...doc.result, heldout: { ok: 9, n: 10, score: 0.9 } } };
  fs.writeFileSync(f, JSON.stringify(wrong) + '\n');
  const r1 = await mergeStage({ root, dir: sdir, organism: nobody, now: NOW });
  assert.equal(r1.refused.length, 1);
  assert.match(r1.refused[0].why, /^the staged held-out score is not what its cells score/);
  const late = { ...doc, result: { ...doc.result, heldout: null, deadline: true, why: [DEADLINE_WHY + ' (after the search)'] } };
  fs.writeFileSync(f, JSON.stringify(late) + '\n');
  const r2 = await mergeStage({ root, dir: sdir, organism: nobody, now: NOW });
  assert.deepEqual(r2.refused, []);
  assert.equal(r2.promoted.length, 1, 'the merge measured it and it won');
  const notLate = { ...late, result: { ...late.result, deadline: false } };
  const root2 = growRoot(), sdir2 = tmpDir('stage-claim2');
  fs.writeFileSync(path.join(sdir2, 'doubled.json'), JSON.stringify(notLate) + '\n');
  const r3 = await mergeStage({ root: root2, dir: sdir2, organism: nobody, now: NOW });
  assert.equal(r3.refused.length, 1, 'a null score without the deadline is a claim that must match');
}));

test('a macro of neo/MACROS.json grows a colony end to end: grow --stage carries its definition, merge promotes it with the tree file gone', async () => cleanAsync(async () => {
  const root = growRoot(['rule'], { genome: { maxCost: 4 }, macros: [TWICE1, UPPER] }), sdir = tmpDir('stage-macro');
  const s = await cli(['grow', '--task', 'rule', '--gen', '2', '--max-generated', '400000', '--stage', sdir, '--root', root]);
  assert.equal(s.code, 0, JSON.stringify(s));
  assert.equal(s.last.promotable, true, JSON.stringify(s.last.why));
  assert.deepEqual(s.last.heldout, { ok: RULE_HELD.length, n: RULE_HELD.length, score: 1 });
  const f = path.join(sdir, 'rule.json'), doc = readJ(f);
  assert.deepEqual(doc.macros.map((m) => m.name), [TWICE1.name], 'only the macros its cells name');
  assert.ok(doc.cells.some((c) => JSON.stringify(c.pyramid).includes(TWICE1.name)));
  const st = status(root);
  assert.ok(st.features.includes('genome') && st.features.includes('macros'), JSON.stringify(st.features));
  // the tree loses its MACROS.json: a stage without its own definitions is refused, with them it merges and promotes
  fs.rmSync(path.join(root, ...MACROS_FILE.split('/')));
  const bare = { ...doc };
  delete bare.macros;
  const sdir2 = tmpDir('stage-macro-bare');
  fs.writeFileSync(path.join(sdir2, 'rule.json'), JSON.stringify(bare) + '\n');
  const r0 = await mergeStage({ root, dir: sdir2, organism: nobody, now: NOW });
  assert.equal(r0.refused.length, 1);
  assert.match(r0.refused[0].why, /^a staged cell is not a valid cell of rule/);
  const r = await mergeStage({ root, dir: sdir, organism: nobody, now: NOW });
  assert.deepEqual(r.refused, []);
  assert.equal(r.promoted.length, 1);
  const row = readJ(path.join(root, 'grown', 'index.json')).cells.find((x) => x.task === 'rule');
  assert.equal(row.serve, true, JSON.stringify(row));
  CORE.macroCells([]);
  const mod = await fresh(path.join(root, 'grown', ...row.file.split('/')));
  for (const h of RULE_HELD) assert.ok(expectOk(mod.answer(h.q), h.expect), h.q);
  const { answers } = await answersOf(path.join(root, 'grown', 'index.mjs'));
  assert.ok(answers.every((a) => a.ok), JSON.stringify(answers));
}));

test('promote, merge and regate write every file of grown/ whole: a temporary sibling renamed over it, never written in place', async (t) => cleanAsync(async () => {
  const realWrite = fs.writeFileSync, realRename = fs.renameSync, writes = [], renames = [];
  const root = growRoot(['doubled', 'rule'], { genome: { maxCost: 4 }, macros: [TWICE1] }), grown = path.join(root, 'grown') + path.sep;
  const sdir = tmpDir('stage-atomic');
  await growTask({ root, task: 'rule', gen: 2, organism: nobody, budget: { maxGenerated: 400000 }, now: NOW, stage: sdir });
  t.mock.method(fs, 'writeFileSync', function (f, ...rest) { writes.push(String(f)); return realWrite.call(fs, f, ...rest); });
  t.mock.method(fs, 'renameSync', function (a, b) { renames.push([String(a), String(b)]); return realRename.call(fs, a, b); });
  const g = await growTask({ root, task: 'doubled', gen: 5, organism: nobody, budget: { maxGenerated: 8000 }, now: NOW });
  assert.equal(g.promoted, true, JSON.stringify(g.why));
  const m = await mergeStage({ root, dir: sdir, organism: nobody, now: NOW });
  assert.equal(m.promoted.length, 1, JSON.stringify(m));
  const idx = path.join(root, 'grown', 'index.json');
  const doc = readJ(idx);
  doc.cells = doc.cells.map((r) => (r.task === 'doubled' ? { ...r, serve: false, gate: 'stale' } : r));
  realWrite.call(fs, idx, JSON.stringify(doc, null, 2) + '\n');
  const rg = await regate({ root });
  assert.equal(rg.changed, true);
  const inGrown = writes.filter((f) => f.startsWith(grown));
  assert.ok(inGrown.length >= 7, 'two promotes and a regate wrote grown/: ' + inGrown.length);
  for (const f of inGrown) assert.match(f, /\.tmp$/, 'written in place: ' + f);
  const targets = renames.map(([, b]) => b);
  for (const name of ['index.json', 'index.mjs']) assert.ok(targets.filter((b) => b === path.join(root, 'grown', name)).length >= 3, name);
  for (const id of [g.id, m.promoted[0]]) assert.ok(targets.includes(path.join(root, 'grown', 'cells', id + '.mjs')), id);
  for (const [a, b] of renames.filter(([, b2]) => b2.startsWith(grown))) assert.ok(a.startsWith(b + '.') && a.endsWith('.tmp'), a + ' -> ' + b);
  assert.deepEqual(fs.readdirSync(path.join(root, 'grown')).filter((n) => n.endsWith('.tmp')), [], 'no temporary file is left behind');
}));

test('a module already on disk is never overwritten by a promote: the proof fails and grown/ is as it was', async () => cleanAsync(async () => {
  const root = growRoot();
  const id = 'doubled-neo-g5';
  const sdir = tmpDir('stage-exists');
  await growTask({ root, task: 'doubled', gen: 5, organism: nobody, budget: { maxGenerated: 8000 }, now: NOW, stage: sdir });
  const doc = readJ(path.join(sdir, 'doubled.json'));
  assert.equal(doc.module.id, id);
  // a file of that id appears between the SELECT that named it and the promote (another process): the merge refuses
  const grown0 = bytesOf(root, ['grown']);
  const real = fs.existsSync;
  let armed = true;
  const f = path.join(root, 'grown', 'cells', id + '.mjs');
  fs.existsSync = (p) => { if (armed && String(p) === f) { armed = false; return false; } return real.call(fs, p); };
  try {
    realWriteLater(f);
    const r = await mergeStage({ root, dir: sdir, organism: nobody, now: NOW });
    assert.equal(r.refused.length, 1, JSON.stringify(r));
    assert.match(r.refused[0].why, /already on disk/);
  } finally { fs.existsSync = real; }
  const after = bytesOf(root, ['grown']);
  assert.equal(after['grown' + path.sep + 'cells' + path.sep + id + '.mjs'], Buffer.from('// another process\n').toString('base64'));
  delete after['grown' + path.sep + 'cells' + path.sep + id + '.mjs'];
  assert.deepEqual(after, grown0);
}));
/** Put a module file on disk the way another process would. */
function realWriteLater(f) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, '// another process\n'); }
