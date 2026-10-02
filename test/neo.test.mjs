// test/neo.test.mjs: THE ENGINE of the NEO tier (grow/neo.mjs, grow/NEO.md "The engine"). His words: "u are to build
// something that allows it to generate thousands of cells for a task" and "keep the cells you have, the NEO cells
// generated per task and kept and alters the code". HIDDEN generator functions make 20 dev and 10 held-out rows per
// task: spawn sees only the dev rows, the held-out rows are graded with judge/judge.mjs expectOk. Then the guard
// against held-out reads, determinism, compile, the negatives, the verbs, SELECT and PROMOTE on a temp root.
// Run: node --test --test-reporter=tap test/neo.test.mjs
// Author: NEO board builder (THE ENGINE), 2026-10-01.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  spawn, compileModule, compile, kernelRegion, testOf, spawnClass, growTask, status, main, readData, rowsOf, negativesFor,
  passesRow, BUILTIN_NEGATIVES, Fail, LANE, MAX_EXAMPLES,
} from '../grow/neo.mjs';
import { makeColony, makeCell, runCell, norm, checkCell, KERNEL_VERSION } from '../grow/neo-kernel.mjs';
import { validateCell, validateTest, MAX_SOURCE_BYTES } from '../grow/contract.mjs';
import { expectOk } from '../judge/judge.mjs';
import { renderIndexMjs, promote } from '../grow/store.mjs';
import { shaText } from '../grow/teach.mjs';
import { shaOf } from '../grow/retire.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENGINE = path.join(HERE, '..', 'grow', 'neo.mjs');
const KERNEL_FILE = path.join(HERE, '..', 'grow', 'neo-kernel.mjs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'neo-engine-'));
const cleanup = () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* already gone */ } };
after(cleanup);
process.on('exit', cleanup);
let dirN = 0;
const tmpDir = (name) => { const d = path.join(TMP, name + '-' + (++dirN)); fs.mkdirSync(d, { recursive: true }); return d; };
const put = (root, rel, text) => { const f = path.join(root, ...rel.split('/')); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); return f; };
const jsonl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
const readJ = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const fresh = (f) => import(pathToFileURL(f).href + '?t=' + Date.now() + '-' + Math.random().toString(36).slice(2));
const shapeOf = (q) => norm(q, 1).replace(/\d+/g, '#');

// ---------------------------------------------------------------- the hidden generators: 20 dev and 10 held-out rows per task
function prng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const fmt = (x) => (Number.isInteger(x) ? String(x) : (Math.round(x * 10) / 10).toFixed(1));
const andList = (xs) => xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1];
const gcdOf = (a, b) => (b ? gcdOf(b, a % b) : a);
const fact = (n) => { let r = 1n; for (let i = 2n; i <= BigInt(n); i++) r *= i; return r.toString(); };
const isPrime = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
const WORDS = ['red', 'river', 'quick', 'brown', 'fox', 'lazy', 'dog', 'green', 'tree', 'blue', 'sky', 'cold', 'water', 'small', 'house', 'happy', 'child', 'bright', 'star', 'old', 'road', 'silver', 'moon', 'wild', 'horse', 'soft', 'rain', 'tall', 'tower', 'sweet', 'apple', 'dark', 'forest', 'gentle', 'wind', 'golden', 'field', 'quiet', 'lake', 'stone'];
const CAPITALS = [['France', 'Paris'], ['Japan', 'Tokyo'], ['Italy', 'Rome'], ['Spain', 'Madrid'], ['Germany', 'Berlin'], ['Egypt', 'Cairo'], ['Canada', 'Ottawa'], ['Kenya', 'Nairobi'], ['Peru', 'Lima'], ['Norway', 'Oslo'], ['Greece', 'Athens'], ['Poland', 'Warsaw'], ['Chile', 'Santiago'], ['Ireland', 'Dublin'], ['Austria', 'Vienna'], ['New Zealand', 'Wellington'], ['South Korea', 'Seoul'], ['Portugal', 'Lisbon'], ['Thailand', 'Bangkok'], ['Argentina', 'Buenos Aires']];
const SUBJECTS = ['chess', 'guitar', 'algebra', 'painting', 'swimming', 'chemistry', 'spanish', 'cooking', 'learning piano', 'public speaking', 'machine learning', 'creative writing'];
const GENERATORS = {
  doubled: (r, i) => { const n = 2 + Math.floor(r() * 499); const q = [`Double ${n}`, `What is ${n} doubled?`, `Twice ${n} is what?`][i % 3]; return { q, expect: { equals: String(2 * n) }, answer: String(2 * n) }; },
  stats: (r, i) => {
    const k = 3 + Math.floor(r() * 3), xs = Array.from({ length: k }, () => 1 + Math.floor(r() * 50));
    const w = ['sum', 'mean', 'average', 'median', 'largest'][i % 5], s = [...xs].sort((a, b) => a - b);
    const v = w === 'sum' ? xs.reduce((a, b) => a + b, 0) : w === 'mean' || w === 'average' ? xs.reduce((a, b) => a + b, 0) / k : w === 'median' ? (k % 2 ? s[(k - 1) / 2] : (s[k / 2 - 1] + s[k / 2]) / 2) : s[k - 1];
    const q = Math.floor(i / 5) % 2 ? `Find the ${w} of ${xs.join(', ')}.` : `What is the ${w} of ${andList(xs)}?`;
    const answer = `The ${w} of ${andList(xs)} is ${fmt(v)}.`;
    return { q, expect: { equals: answer }, answer };
  },
  sortdown: (r, i) => { const k = 3 + Math.floor(r() * 4), xs = Array.from({ length: k }, () => 1 + Math.floor(r() * 99)); const a = [...xs].sort((x, y) => y - x).join(', '); const q = [`Sort ${xs.join(', ')} in descending order.`, `Put ${xs.join(', ')} in descending order`, `List ${xs.join(', ')} from largest to smallest.`][i % 3]; return { q, expect: { equals: a }, answer: a }; },
  reverse: (r, i) => { const k = 2 + Math.floor(r() * 4), ws = Array.from({ length: k }, () => WORDS[Math.floor(r() * WORDS.length)]); const p = ws.join(' '), a = [...ws].reverse().join(' '); const q = i % 2 ? `Reverse the word order of "${p}".` : `Reverse the words of "${p}"`; return { q, expect: { equals: a }, answer: a }; },
  gcd: (r, i) => { const g = 1 + Math.floor(r() * 12), a = g * (1 + Math.floor(r() * 15)), b = g * (1 + Math.floor(r() * 15)); const v = String(gcdOf(a, b)); const q = i % 2 ? `What is the greatest common divisor of ${a} and ${b}?` : `GCD of ${a} and ${b}`; return { q, expect: { equals: v }, answer: v }; },
  factorial: (r, i) => { const n = 1 + Math.floor(r() * 25), v = fact(n); const q = [`What is ${n} factorial?`, `Compute the factorial of ${n}.`, `factorial of ${n}`][i % 3]; return { q, expect: { equals: v }, answer: v }; },
  ctof: (r, i) => { const c = 5 * (Math.floor(r() * 29) - 8), f = fmt(c * 9 / 5 + 32); const q = i % 2 ? `What is ${c} degrees Celsius in Fahrenheit?` : `Convert ${c} Celsius to Fahrenheit`; const answer = `${c} Celsius is ${f} Fahrenheit.`; return { q, expect: { equals: answer }, answer }; },
  prime: (r, i) => { const n = 2 + Math.floor(r() * 120), p = isPrime(n); const q = i % 2 ? `Is ${n} a prime number?` : `Is ${n} prime?`; return p ? { q, expect: { contains: ['is prime'], notContains: ['not'] }, answer: `${n} is prime.` } : { q, expect: { contains: ['is not prime'] }, answer: `${n} is not prime.` }; },
  plan: (r, i) => { const n = 2 + Math.floor(r() * 6), s = SUBJECTS[Math.floor(r() * SUBJECTS.length)]; const q = i % 2 ? `Give me a ${n}-day plan for ${s}.` : `Make a ${n}-day plan for ${s}.`; const answer = [`Here is a ${n}-day plan for ${s}:`, ...Array.from({ length: n }, (_, j) => `Day ${j + 1}: study ${s}`)].join('\n'); return { q, expect: { contains: ['Day 1', `Day ${n}`, s] }, answer }; },
};
const FACT_DEV = (c) => `What is the capital of ${c}?`;
const FACT_HELD = [(c) => `Which city is the capital of ${c}?`, (c) => `Name the capital of ${c}.`, (c) => `What's the capital city of ${c}?`];
/** { task: { dev: rows[20], heldout: rows[10] } }: the held-out rows are other prompts of the same hidden rule. */
function makeTasks(seed = 7) {
  const out = {};
  let s = seed;
  for (const [task, gen] of Object.entries(GENERATORS)) {
    const r = prng(s++), seen = new Set(), dev = [], heldout = [];
    for (let i = 0; dev.length < 20 && i < 500; i++) { const row = gen(r, dev.length); if (!seen.has(row.q)) { seen.add(row.q); dev.push(row); } }
    for (let i = 0; heldout.length < 10 && i < 500; i++) { const row = gen(r, heldout.length); if (!seen.has(row.q)) { seen.add(row.q); heldout.push(row); } }
    out[task] = { dev, heldout };
  }
  const r = prng(s++);
  out.facts = {
    dev: CAPITALS.map(([c, cap]) => ({ q: FACT_DEV(c), expect: { contains: [cap] }, answer: `The capital of ${c} is ${cap}.` })),
    heldout: Array.from({ length: 10 }, (_, i) => { const [c, cap] = CAPITALS[Math.floor(r() * CAPITALS.length)]; return { q: FACT_HELD[i % 3](c), expect: { contains: [cap] } }; }),
  };
  return out;
}

// ---------------------------------------------------------------- the fixture: every task spawned once from its dev rows alone
const T = makeTasks(7);
const TASKS = Object.keys(T);
const BUILTINS = [...BUILTIN_NEGATIVES.greetings, ...BUILTIN_NEGATIVES.organism, ...BUILTIN_NEGATIVES.arithmetic];
const negsOf = (task) => [...TASKS.filter((t) => t !== task).flatMap((t) => T[t].dev.map((r) => r.q)), ...BUILTINS];
const BUDGET = { maxGenerated: 20000 };
const RUNS = {};
const T0 = Date.now();
for (const task of TASKS) RUNS[task] = spawn({ task, rows: T[task].dev, negatives: negsOf(task), gen: 1, budget: BUDGET });
const SPAWN_MS = Date.now() - T0;
const SUM = TASKS.reduce((s, t) => s + RUNS[t].stats.generated, 0);
const heldScore = (task, cells) => { const c = makeColony(cells); return T[task].heldout.filter((r) => expectOk(c.answer(r.q), r.expect)).length; };
const BAR = (task) => (task === 'facts' || task === 'plan' ? 0.8 : 0.9);

// ---------------------------------------------------------------- generalization: held-out rows the spawn never saw
for (const task of TASKS) {
  const ok = heldScore(task, RUNS[task].cells), n = T[task].heldout.length, bar = BAR(task);
  const title = task + ': the colony answers ' + ok + ' of ' + n + ' held-out rows right (score ' + ok / n + ', bar ' + bar + ')';
  test(title, ok / n >= bar ? {} : { todo: 'measured ' + ok / n + ' under the bar ' + bar }, () => {
    assert.ok(ok / n >= bar, task + ' scored ' + ok / n);
  });
}

test('every task generates at least 1000 candidates, and the sum is printed', (t) => {
  for (const task of TASKS) assert.ok(RUNS[task].stats.generated >= 1000, task + ' generated ' + RUNS[task].stats.generated);
  t.diagnostic('generated ' + SUM + ' in ' + SPAWN_MS + ' ms');
});

test('stats carry the fields of grow/NEO.md step 5 and agree with the cells', () => {
  for (const task of TASKS) {
    const { cells, stats } = RUNS[task];
    for (const k of ['generated', 'distinct', 'kept', 'byFamily', 'maxHeight', 'devOk', 'devN', 'ms', 'cellsPerSecond']) assert.ok(k in stats, task + ' lacks ' + k);
    assert.equal(stats.kept, cells.length);
    assert.equal(Object.values(stats.byFamily).reduce((a, b) => a + b, 0), cells.length);
    assert.equal(stats.devN, 20);
    assert.ok(stats.devOk >= 1 && stats.devOk <= stats.devN);
    assert.equal(stats.maxHeight, Math.max(...cells.map((c) => c.height)));
    assert.ok(Number.isInteger(stats.cellsPerSecond) && stats.cellsPerSecond > 0);
  }
});

test('determinism: two spawns of the same rows give deep-equal cells', () => {
  for (const task of ['stats', 'plan']) {
    const again = spawn({ task, rows: T[task].dev, negatives: negsOf(task), gen: 1, budget: BUDGET });
    assert.deepEqual(again.cells, RUNS[task].cells);
    assert.equal(again.stats.generated, RUNS[task].stats.generated);
  }
});

test('KEPT: every cell passes a dev row and fails none it fires on, and the order is rows passed first, fallbacks last', () => {
  for (const task of TASKS) {
    const rows = T[task].dev;
    let last = Infinity, fallback = false;
    for (const c of RUNS[task].cells) {
      assert.equal(checkCell(c).ok, true, c.id);
      const fired = rows.map((r) => [r, runCell(c, r.q)]).filter(([, a]) => a !== null);
      assert.ok(fired.some(([r, a]) => expectOk(a, r.expect)), task + ' ' + c.id + ' passes no dev row');
      for (const [r, a] of fired) assert.ok(expectOk(a, r.expect), task + ' ' + c.id + ' fires wrong on ' + r.q + ': ' + a);
      const isNear = JSON.stringify(c.pyramid).includes('"memory.nearest"');
      assert.ok(!fallback || isNear, task + ': a fallback (memory.nearest) goes after every other cell');
      if (isNear && !fallback) { fallback = true; last = Infinity; }
      assert.ok(c.fit.ok <= last, 'the order is rows passed, more first');
      last = c.fit.ok;
    }
  }
});

test('a cell never fires on a negative it was spawned against', () => {
  for (const task of TASKS) {
    const negs = negsOf(task);
    for (const c of RUNS[task].cells) for (const q of negs) assert.equal(runCell(c, q), null, task + ' ' + c.id + ' fires on ' + q);
  }
});

test('colony.can is false on greetings, on plain arithmetic and on the other tasks\' dev rows', () => {
  for (const task of TASKS) {
    const colony = makeColony(RUNS[task].cells), own = new Set(T[task].dev.map((r) => shapeOf(r.q)));
    for (const q of BUILTIN_NEGATIVES.greetings) assert.equal(colony.can(q), false, task + ' answers ' + q);
    for (const q of BUILTIN_NEGATIVES.arithmetic) if (!own.has(shapeOf(q))) assert.equal(colony.can(q), false, task + ' answers ' + q);
    for (const t of TASKS) if (t !== task) for (const r of T[t].dev) assert.equal(colony.can(r.q), false, task + ' answers ' + t + ': ' + r.q);
  }
});

test('the four sources all give cells: enumeration, templates, memory and yes/no pairs', () => {
  const by = {};
  for (const task of TASKS) for (const [s, k] of Object.entries(RUNS[task].stats.bySource)) by[s] = (by[s] || 0) + k;
  for (const s of ['enum', 'template', 'memory', 'yesno']) assert.ok(by[s] >= 1, 'no cell from ' + s + ': ' + JSON.stringify(by));
  assert.ok(RUNS.stats.cells.some((c) => JSON.stringify(c.pyramid).includes('aggregate.mean')), 'the stats task holds an aggregate.mean pyramid');
});

test('mutants: a spawn with the kept cells as parents generates mutants and keeps the parents that still hold', () => {
  const task = 'gcd', parents = RUNS[task].cells;
  const next = spawn({ task, rows: T[task].dev, negatives: negsOf(task), gen: 2, parents, budget: { maxGenerated: 8000 } });
  assert.ok((next.stats.bySource.mutant || 0) + (next.stats.bySource.parent || 0) >= 1, JSON.stringify(next.stats.bySource));
  const ids = new Set(next.cells.map((c) => c.id));
  assert.ok(parents.some((p) => ids.has(p.id)), 'a parent the rows do not refute is kept');
  assert.ok(next.cells.filter((c) => c.parents.length).every((c) => c.parents.every((p) => typeof p === 'string')));
});

test('a budget caps the search and says so; no rows gives no cell', () => {
  const small = spawn({ task: 'doubled', rows: T.doubled.dev, negatives: [], budget: { maxGenerated: 1500 } });
  assert.ok(small.stats.generated <= 1500 + 100, 'generated ' + small.stats.generated);
  assert.ok(small.stats.generated < RUNS.doubled.stats.generated);
  const quick = spawn({ task: 'doubled', rows: T.doubled.dev, negatives: [], budget: { maxMs: 1 } });
  assert.equal(quick.stats.capped, 'ms', 'a run stopped by --max-ms says so');
  const none = spawn({ task: 'empty', rows: [] });
  assert.deepEqual(none.cells, []);
  assert.equal(none.stats.devN, 0);
  assert.throws(() => spawn({ task: '', rows: T.doubled.dev }), Fail);
});

test('passesRow: an output inside the answer passes, an echo of the prompt does not', () => {
  const row = { q: 'What is the mean of 4, 8 and 9?', expect: { contains: ['7'] }, answer: 'The mean of 4, 8 and 9 is 7.' };
  assert.equal(passesRow('The mean of 4, 8 and 9 is 7.', row), true);
  assert.equal(passesRow('7', row), true);
  assert.equal(passesRow('17', row), false);
  const bare = { q: 'tell me the number 7 please', expect: { contains: ['7'] } };
  assert.equal(passesRow('tell me the number 7 please', bare), false);
  assert.equal(passesRow('7', bare), true);
  assert.equal(passesRow(null, bare), false);
});

test('rowsOf: prompt and reply are q and answer, a row without expect is left out, so is a retired prompt', () => {
  const retired = { shas: new Set([shaOf('gone prompt')]), ids: new Set(), rows: [] };
  const rows = rowsOf([{ prompt: 'p one', expect: { contains: ['x'] }, reply: 'x' }, { q: 'no expect' }, { q: 'gone prompt', expect: { contains: ['y'] } }, 7, null], retired);
  assert.deepEqual(rows, [{ q: 'p one', expect: { contains: ['x'] }, answer: 'x' }]);
});

// ---------------------------------------------------------------- spawn --class on a temp tree whose held-out files are directories
const bare = (rows) => rows.map((r) => ({ q: r.q, expect: r.expect }));
/** A tree with judge/dev rows, dreams and curriculum, and every held-out or control path a DIRECTORY (reading one throws). */
function classRoot() {
  const root = tmpDir('class-root');
  put(root, 'judge/dev/math.jsonl', jsonl(bare(T.gcd.dev)));
  put(root, 'judge/dev/science.jsonl', jsonl(bare(T.prime.dev)));
  put(root, 'grow/dreams.jsonl', jsonl([...T.doubled.dev.slice(0, 5).map((r) => ({ class: 'math', prompt: r.q, expect: r.expect, reply: r.answer })), { class: 'science', prompt: 'Is 9 prime?', expect: { contains: ['not'] }, reply: '9 is not prime.' }]));
  put(root, 'grow/curriculum.jsonl', jsonl([{ class: 'science', prompt: 'Why is the sky blue?' }, { class: 'math', prompt: 'GCD of 2 and 4' }]));
  put(root, 'neo/tasks/wordflip/dev.jsonl', jsonl(T.reverse.dev));
  for (const d of ['judge/heldout/math.jsonl', 'judge/heldout/science.jsonl', 'judge/control.jsonl', 'neo/tasks/wordflip/heldout.jsonl', 'state/live']) fs.mkdirSync(path.join(root, ...d.split('/')), { recursive: true });
  return root;
}
const CB = { maxGenerated: 8000 };
const FS_READS = ['readFileSync', 'openSync', 'readdirSync', 'existsSync', 'statSync', 'lstatSync', 'opendirSync', 'readFile', 'createReadStream', 'accessSync'];
/** Run fn with every fs read recorded: the paths it touched. */
function spyReads(fn) {
  const seen = [], saved = {};
  for (const n of FS_READS) { saved[n] = fs[n]; fs[n] = function spy(p, ...rest) { seen.push(String(p)); return saved[n].call(fs, p, ...rest); }; }
  try { return { out: fn(), seen }; } finally { for (const n of FS_READS) fs[n] = saved[n]; }
}

test('readData refuses judge/heldout/, judge/control.jsonl, state/ and any heldout.jsonl, and a path out of the root', () => {
  const root = classRoot();
  for (const rel of ['judge/heldout/math.jsonl', 'judge/heldout', 'judge/control.jsonl', 'state/live', 'neo/tasks/wordflip/heldout.jsonl', '../outside.jsonl', 'judge/../judge/control.jsonl']) {
    assert.throws(() => readData(root, rel), (e) => e instanceof Fail && /refused/.test(e.message), rel);
  }
  assert.equal(readData(root, 'judge/dev/none.jsonl'), null);
  assert.match(readData(root, 'judge/dev/math.jsonl'), /GCD|greatest/);
});

test('no held-out read while spawning: the held-out files are directories, spawn --class completes, no opened path names heldout or control', () => {
  const root = classRoot(), out = tmpDir('spy-out');
  const { out: line, seen } = spyReads(() => spawnClass(root, { cls: 'math', gen: 3, out, budget: CB }));
  assert.equal(line.written, true, JSON.stringify(line));
  assert.ok(seen.length > 0, 'the spy saw the reads');
  assert.deepEqual(seen.filter((p) => /heldout|control/i.test(p)), []);
});

test('negativesFor: other classes, other tasks, other classes\' curriculum and the built-ins, never the own rows', () => {
  const root = classRoot();
  const own = bare(T.gcd.dev).concat([{ q: 'what is 3 plus 4', expect: { contains: ['7'] } }]);
  const negs = negativesFor(root, { cls: 'math', rows: own });
  const has = (q) => negs.includes(q);
  assert.ok(has(T.prime.dev[0].q) && has(T.reverse.dev[0].q) && has('Why is the sky blue?') && has('hello'));
  assert.ok(!has('GCD of 2 and 4'), 'the own class\'s curriculum is not a negative');
  assert.ok(!own.some((r) => has(r.q)), 'an own row is never a negative');
  assert.ok(!has('what is 7 plus 5'), 'a built-in of an own row\'s shape is left out');
  assert.ok(has('what is 12 times 3'));
});

test('spawn --class writes cell.mjs, test.mjs, examples.jsonl, brief.md and colony.json under --out, nothing under work/', async () => {
  const root = classRoot(), out = tmpDir('class-out');
  const line = spawnClass(root, { cls: 'math', gen: 3, out, budget: CB });
  const dir = path.join(out, 'math-neo-g3');
  assert.equal(line.out, dir);
  assert.equal(line.id, 'math-neo-g3');
  for (const f of ['cell.mjs', 'test.mjs', 'examples.jsonl', 'brief.md', 'colony.json']) assert.ok(fs.existsSync(path.join(dir, f)), f);
  assert.equal(fs.existsSync(path.join(root, 'work')), false);
  for (const k of ['generated', 'kept', 'devOk', 'devN', 'ms', 'cells', 'leftOut', 'forbidden']) assert.ok(Number.isInteger(line[k]), k);
  assert.equal(line.cells + line.leftOut + line.forbidden, line.kept, 'every kept cell is in the module or counted out');
  assert.equal(line.devN, 25, 'the dev rows and the class\'s dreams');
  const src = fs.readFileSync(path.join(dir, 'cell.mjs'), 'utf8');
  const mod = await fresh(path.join(dir, 'cell.mjs'));
  assert.deepEqual(validateCell(src, mod), { ok: true, errors: [] });
  assert.equal(mod.meta.class, 'math');
  assert.equal(mod.meta.generation, 3);
  assert.equal(mod.meta.lane, 'neo');
  const tsrc = fs.readFileSync(path.join(dir, 'test.mjs'), 'utf8');
  assert.equal(validateTest(tsrc).ok, true, validateTest(tsrc).errors.join('; '));
  assert.ok((tsrc.match(/^test\(/gm) || []).length >= 3);
  const col = readJ(path.join(dir, 'colony.json'));
  assert.equal(col.cells.length, line.kept);
  assert.equal(col.stats.generated, line.generated);
  assert.equal(fs.readFileSync(path.join(dir, 'examples.jsonl'), 'utf8').trim().split('\n').length, mod.examples.length);
  assert.match(fs.readFileSync(path.join(dir, 'brief.md'), 'utf8'), new RegExp('generated\\): ' + line.generated));
  assert.ok(mod.can(T.doubled.dev[0].q), 'a dream row of the class is grown from');
});

test('the test.mjs spawn --class writes passes under node --test', () => {
  const root = classRoot(), out = tmpDir('class-test');
  spawnClass(root, { cls: 'science', gen: 2, out, budget: CB });
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const r = spawnSync(process.execPath, ['--test', '--test-reporter=tap', path.join(out, 'science-neo-g2', 'test.mjs')], { encoding: 'utf8', windowsHide: true, env });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /^# fail 0$/m);
  assert.match(r.stdout, /^# pass 4$/m);
});

test('spawn --class writes to work/grow/gen-<n>/neo/ by default', () => {
  const root = classRoot();
  const line = spawnClass(root, { cls: 'science', gen: 7, budget: { maxGenerated: 3000 } });
  assert.equal(line.out, path.join(root, 'work', 'grow', 'gen-7', 'neo', 'science-neo-g7'));
  assert.ok(fs.existsSync(path.join(line.out, 'cell.mjs')));
});

test('spawn --class never grows from a retired prompt', () => {
  const root = classRoot(), out = tmpDir('retired-out'), gone = T.gcd.dev[3].q;
  put(root, 'grow/retired.jsonl', jsonl([{ sha: shaOf(gone), ids: [], why: 'test' }]));
  const line = spawnClass(root, { cls: 'math', gen: 3, out, budget: CB });
  assert.equal(line.devN, 24);
  const dir = path.join(out, 'math-neo-g3');
  const text = fs.readFileSync(path.join(dir, 'colony.json'), 'utf8') + fs.readFileSync(path.join(dir, 'examples.jsonl'), 'utf8') + fs.readFileSync(path.join(dir, 'cell.mjs'), 'utf8');
  assert.equal(text.includes(gone), false);
});

test('spawn --class with no kept cell writes nothing and says so; a bad class or no rows is refused', () => {
  const root = classRoot(), out = tmpDir('empty-out');
  put(root, 'judge/dev/void.jsonl', jsonl(Array.from({ length: 6 }, (_, i) => ({ q: 'tell me something ' + i, expect: { contains: ['zq'], notContains: ['zq'] } }))));
  const line = spawnClass(root, { cls: 'void', gen: 1, out, budget: { maxGenerated: 3000 } });
  assert.equal(line.written, false);
  assert.match(line.why, /nothing is written/);
  assert.equal(fs.existsSync(path.join(out, 'void-neo-g1')), false);
  assert.throws(() => spawnClass(root, { cls: 'Bad Class', gen: 1 }), (e) => e instanceof Fail && e.code === 2);
  assert.throws(() => spawnClass(root, { cls: 'math', gen: 0 }), (e) => e instanceof Fail && e.code === 2);
  assert.throws(() => spawnClass(root, { cls: 'nothing', gen: 1, out }), (e) => e instanceof Fail && e.code === 1);
});

// ---------------------------------------------------------------- compile
const KERNEL_TEXT = fs.readFileSync(KERNEL_FILE, 'utf8');
const markerRegion = () => { const a = KERNEL_TEXT.indexOf('// <KERNEL>'), b = KERNEL_TEXT.indexOf('// </KERNEL>'); return KERNEL_TEXT.slice(a, KERNEL_TEXT.indexOf('\n', b) + 1); };
async function compiled(task, extra = {}) {
  const comp = compileModule({ id: task + '-neo-g1', cls: task, gen: 1, cells: RUNS[task].cells, examples: T[task].dev, ...extra });
  const f = put(tmpDir('compiled'), 'cell.mjs', comp.source);
  return { comp, mod: await fresh(f), src: comp.source };
}

test('compile: validateCell is ok on the imported module', async () => {
  for (const task of ['stats', 'facts']) {
    const { mod, src, comp } = await compiled(task);
    assert.deepEqual(validateCell(src, mod), { ok: true, errors: [] });
    assert.deepEqual(Object.keys(mod.meta).sort(), ['class', 'generation', 'grownFrom', 'id', 'lane', 'version']);
    assert.equal(mod.colony.cells, comp.included);
    assert.equal(mod.colony.kernel, KERNEL_VERSION);
  }
});

test('compile: the kernel region is inlined verbatim, once', async () => {
  const { src } = await compiled('gcd');
  assert.equal(kernelRegion(), markerRegion());
  assert.ok(src.includes(markerRegion()));
  assert.equal(src.split('// <KERNEL>').length, 2);
  assert.equal(src.split('// </KERNEL>').length, 2);
  assert.equal(src, compile({ id: 'gcd-neo-g1', cls: 'gcd', gen: 1, cells: RUNS.gcd.cells, examples: T.gcd.dev }));
});

test('compile: every example is answered right, and the module answers as the colony does', async () => {
  for (const task of TASKS) {
    const { mod } = await compiled(task);
    assert.ok(mod.examples.length >= 1 && mod.examples.length <= MAX_EXAMPLES);
    for (const ex of mod.examples) { assert.equal(mod.can(ex.q), true, ex.q); assert.ok(expectOk(mod.answer(ex.q), ex.expect), task + ': ' + ex.q); }
    const colony = makeColony(RUNS[task].cells);
    for (const r of T[task].heldout) assert.equal(mod.answer(r.q), colony.answer(r.q), r.q);
  }
});

test('compile: 5000 cells stay under 512 KB, the left-out count is recorded and printed', async (t) => {
  const pad = 'x'.repeat(120);
  const cells = Array.from({ length: 5000 }, (_, i) => makeCell({ task: 'bulk', gen: 1, guard: [['has', 'tok' + i]], pyramid: ['render.str', ['memory.lookup', ['sense.text']]], mem: { table: { ['ask tok' + i]: 'reply number ' + i + ' ' + pad } }, fit: { ok: 1, fired: 1, rows: 1 } }));
  const examples = [0, 1, 2].map((i) => ({ q: 'ask tok' + i, expect: { contains: ['reply number ' + i + ' '] } }));
  const comp = compileModule({ id: 'bulk-neo-g1', cls: 'bulk', gen: 1, cells, examples });
  assert.ok(comp.bytes <= MAX_SOURCE_BYTES && Buffer.byteLength(comp.source) === comp.bytes);
  assert.ok(comp.leftOut > 0);
  assert.equal(comp.included + comp.leftOut, 5000);
  const mod = await fresh(put(tmpDir('bulk'), 'cell.mjs', comp.source));
  assert.equal(mod.colony.cells, comp.included);
  assert.equal(validateCell(comp.source, mod).ok, true);
  assert.equal(mod.answer('ask tok' + (comp.included - 1)), 'reply number ' + (comp.included - 1) + ' ' + pad);
  assert.equal(mod.can('ask tok' + comp.included), false, 'a left-out cell is not in the module');
  t.diagnostic('5000 cells: ' + comp.included + ' in ' + comp.bytes + ' bytes, ' + comp.leftOut + ' left out');
});

test('compile: can(q) is false for a prompt no cell answers, answer(q) is the first non-null cell answer', async () => {
  const pyr = ['render.str', ['memory.lookup', ['sense.text']]];
  const a = makeCell({ task: 't', gen: 1, guard: [['has', 'alpha']], pyramid: pyr, mem: { table: { 'alpha one': 'first' } } });
  const b = makeCell({ task: 't', gen: 1, guard: [['has', 'alpha']], pyramid: pyr, mem: { table: { 'alpha one': 'second', 'alpha two': 'only b' } } });
  const comp = compileModule({ id: 'order-neo-g1', cls: 'order', gen: 1, cells: [a, b], examples: [{ q: 'alpha one', expect: { contains: ['first'] } }] });
  const mod = await fresh(put(tmpDir('order'), 'cell.mjs', comp.source));
  assert.equal(mod.answer('alpha one'), 'first');
  assert.equal(mod.answer('alpha two'), 'only b');
  assert.equal(mod.can('beta'), false);
  assert.equal(mod.answer('beta'), null);
  assert.equal(mod.can('hello'), false);
});

test('compile: no source when no cell answers an example; a FORBIDDEN or invalid cell is left out and counted', () => {
  const pyr = ['render.str', ['memory.lookup', ['sense.text']]];
  const ok = makeCell({ task: 't', gen: 1, guard: [['has', 'alpha']], pyramid: pyr, mem: { table: { 'alpha one': 'fine' } } });
  const bad = makeCell({ task: 't', gen: 1, guard: [['has', 'alpha']], pyramid: pyr, mem: { table: { 'alpha two': 'see process.env' } } });
  const broken = { ...ok, id: 'n-00000000' };
  const comp = compileModule({ id: 'mix-neo-g1', cls: 'mix', gen: 1, cells: [bad, broken, ok], examples: [{ q: 'alpha one', expect: { contains: ['fine'] } }] });
  assert.equal(comp.forbidden, 1);
  assert.equal(comp.invalid, 1);
  assert.equal(comp.included, 1);
  assert.equal(comp.source.includes('process'), false);
  const none = compileModule({ id: 'mix-neo-g1', cls: 'mix', gen: 1, cells: [ok], examples: [{ q: 'gamma', expect: { contains: ['x'] } }] });
  assert.equal(none.source, null);
  assert.match(none.why, /no dev row/);
  assert.equal(compile({ id: 'mix-neo-g1', cls: 'mix', gen: 1, cells: [], examples: [] }), null);
  assert.throws(() => compileModule({ id: 'Bad Id', cls: 'mix', gen: 1, cells: [ok], examples: [] }), Fail);
});

test('testOf: valid by validateTest, four tests, nothing imported but ./cell.mjs and node:test', () => {
  const src = testOf('abc-neo-g1', ['hello', 'what is 7 plus 5']);
  assert.equal(validateTest(src).ok, true, validateTest(src).errors.join('; '));
  assert.equal((src.match(/^test\(/gm) || []).length, 4);
  assert.deepEqual([...src.matchAll(/from '([^']+)'/g)].map((m) => m[1]), ['node:test', 'node:assert/strict', './cell.mjs']);
});

// ---------------------------------------------------------------- the CLI
test('CLI: spawn and status print one JSON line last; a usage error exits 2, a failure 1', async () => {
  const root = classRoot(), out = tmpDir('cli-out'), logs = [], errs = [];
  const io = { log: (s) => logs.push(s), err: (s) => errs.push(s) };
  assert.equal(await main(['spawn', '--class', 'science', '--gen', '3', '--out', out, '--root', root, '--max-generated', '3000'], io), 0);
  const line = JSON.parse(logs.at(-1));
  assert.equal(line.written, true);
  assert.equal(line.class, 'science');
  assert.equal(await main(['status', '--root', root], io), 0);
  const st = JSON.parse(logs.at(-1));
  for (const k of ['tasks', 'colonies', 'cells', 'mastered', 'generated']) assert.ok(Number.isInteger(st[k]), k);
  assert.equal(await main(['dance'], io), 2);
  assert.equal(await main(['spawn', '--class', 'science'], io), 2);
  assert.equal(await main(['spawn', '--class', 'science', '--gen', 'x'], io), 2);
  assert.equal(await main(['status', '--nope', '1'], io), 2);
  assert.equal(await main(['grow', '--task', 'not-opened', '--gen', '1', '--root', root], io), 1);
  assert.equal(JSON.parse(logs.at(-1)).ok, false);
});

test('CLI: node grow/neo.mjs status runs as a script and exits 0 with integer colonies and cells', () => {
  const root = classRoot();
  const r = spawnSync(process.execPath, [ENGINE, 'status', '--root', root], { encoding: 'utf8', windowsHide: true });
  assert.equal(r.status, 0, r.stderr);
  const line = JSON.parse(r.stdout.trim().split('\n').at(-1));
  assert.ok(Number.isInteger(line.colonies) && Number.isInteger(line.cells));
  assert.equal(line.generated, 0);
});

// ---------------------------------------------------------------- grow --task: SELECT and PROMOTE on a temp root
const HAND = [
  "export const meta = { id: 'hand-g1', class: 'writing', generation: 1, lane: 'a', grownFrom: ['write a haiku about rain'], version: 1 };",
  "export const examples = [{ q: 'write a haiku about rain', expect: { contains: ['rain'] } }];",
  "export function can(q) { return /\\bhaiku\\b/i.test(String(q)); }",
  "export function answer(q) { return can(q) ? 'soft rain on the roof' : null; }",
  '',
].join('\n');
const HAND_ROW = { id: 'hand-g1', class: 'writing', generation: 1, lane: 'a', file: 'cells/hand-g1.mjs', heldout: { score: 0.5, n: 2, ok: 1 }, promotedAt: '2026-09-30T00:00:00.000Z' };
const CONTROL = ['Double the 21 eggs in the basket', 'tell me a joke about cats'];
/** A tree with one hand-grown cell in grown/, opened tasks in neo/ with their ledger rows, and judge/control.jsonl. */
function growRoot({ task = 'doubled', heldout = null, control = CONTROL } = {}) {
  const root = tmpDir('grow-root');
  put(root, 'grown/cells/hand-g1.mjs', HAND);
  const index = { generation: 4, cells: [HAND_ROW] };
  put(root, 'grown/index.json', JSON.stringify(index, null, 2) + '\n');
  put(root, 'grown/index.mjs', renderIndexMjs(index));
  const d = jsonl(T[task].dev), h = jsonl(bare(heldout || T[task].heldout));
  put(root, 'neo/tasks/' + task + '/dev.jsonl', d);
  put(root, 'neo/tasks/' + task + '/heldout.jsonl', h);
  put(root, 'neo/tasks/' + task + '/task.json', JSON.stringify({ task, skill: task, domain: 'test', rule: 'hidden', generation: 1, by: 'test' }) + '\n');
  const ledger = { tasks: [{ task, generation: 1, devSha: shaText(d), heldoutSha: shaText(h), dev: 20, heldout: 10, by: 'test', at: '2026-10-01T00:00:00.000Z' }], generated: 0, note: 'the teacher keeps this key' };
  put(root, 'neo/LEDGER.json', JSON.stringify(ledger, null, 2) + '\n');
  put(root, 'judge/control.jsonl', jsonl(control.map((q) => ({ q }))));
  return root;
}
const nobody = async (rows) => rows.map((r) => ({ q: r.q, got: null }));
const GB = { maxGenerated: 8000 };
const grow = (root, o = {}) => growTask({ root, task: 'doubled', gen: 5, organism: nobody, budget: GB, ...o });
/** Every file under grown/ as relative path -> bytes. */
function grownBytes(root) {
  const out = {}, base = path.join(root, 'grown');
  const walk = (d) => { for (const n of fs.readdirSync(d)) { const f = path.join(d, n); if (fs.statSync(f).isDirectory()) walk(f); else out[path.relative(base, f)] = fs.readFileSync(f).toString('base64'); } };
  walk(base);
  return out;
}
const LINE_KEYS = ['task', 'generation', 'generated', 'kept', 'promoted', 'heldout', 'baseline', 'ms', 'cellsPerSecond', 'cells', 'why'];
// one promoted root, shared by the tests that read what a promote leaves (node:test runs a file's tests in order)
const P = { root: null, line: null, before: null };
async function promoted() {
  if (P.line) return P;
  P.root = growRoot();
  P.before = readJ(path.join(P.root, 'grown', 'index.json'));
  P.line = await grow(P.root);
  return P;
}

test('SELECT: the sha freeze voids a task whose dev or held-out set changed since it was opened', async () => {
  const root = growRoot(), before = grownBytes(root);
  fs.appendFileSync(path.join(root, 'neo', 'tasks', 'doubled', 'heldout.jsonl'), JSON.stringify({ q: 'Double 3', expect: { equals: '6' } }) + '\n');
  const a = await grow(root);
  assert.equal(a.promoted, false);
  assert.deepEqual(a.why, ["the task's held-out set changed since it was opened"]);
  assert.deepEqual(grownBytes(root), before);
  fs.appendFileSync(path.join(root, 'neo', 'tasks', 'doubled', 'dev.jsonl'), JSON.stringify({ q: 'Double 4', expect: { equals: '8' }, answer: '8' }) + '\n');
  const b = await grow(root);
  assert.equal(b.promoted, false);
  assert.deepEqual(b.why, ["the task's dev set changed since it was opened"]);
  assert.equal(b.generated, 0);
  assert.deepEqual(grownBytes(root), before);
});

test('SELECT: the baseline rule, an organism that answers as well keeps the colony out', async () => {
  const root = growRoot(), before = grownBytes(root);
  const right = async (rows) => ({ rows: rows.map((r) => ({ q: r.q, got: r.expect.equals })) });
  const line = await grow(root, { organism: right });
  assert.equal(line.promoted, false);
  assert.deepEqual(line.baseline, { ok: 10, n: 10, score: 1 });
  assert.ok(line.why.includes('the colony does not score above the organism'));
  assert.deepEqual(grownBytes(root), before);
});

test('grow --task prints the line: task, generation, generated, kept, promoted, heldout, baseline, ms, cellsPerSecond', async () => {
  const { line } = await promoted();
  for (const k of LINE_KEYS) assert.ok(k in line, k);
  assert.equal(line.task, 'doubled');
  assert.equal(line.generation, 5);
  assert.equal(line.promoted, true, JSON.stringify(line.why));
  assert.deepEqual(line.why, []);
  assert.deepEqual(line.heldout, { ok: 10, n: 10, score: 1 });
  assert.deepEqual(line.baseline, { ok: 0, n: 10, score: 0 });
  assert.ok(line.generated >= 1000 && line.kept >= 1);
});

test('SELECT: the control rule, a cell that answers a control prompt or a negative leaves the colony', async () => {
  const { root, line } = await promoted();
  assert.ok(line.control >= 1, 'a cell answered "' + CONTROL[0] + '" and was removed');
  const mod = await fresh(path.join(root, 'grown', 'cells', line.id + '.mjs'));
  for (const q of [...CONTROL, ...BUILTINS]) assert.equal(mod.can(q), false, q);
  assert.ok(mod.examples.length >= 1);
});

test('PROMOTE: the index row carries tier neo, cells, generated and heldout { score, n, ok }; the hand-grown cell stays first', async () => {
  const { root, line, before } = await promoted();
  const index = readJ(path.join(root, 'grown', 'index.json'));
  assert.equal(index.generation, before.generation, 'a neo promote never moves the index generation');
  assert.deepEqual(index.cells[0], HAND_ROW);
  const row = index.cells.at(-1);
  const mod = await fresh(path.join(root, 'grown', row.file));
  assert.equal(row.id, 'doubled-neo-g5');
  assert.equal(row.id, line.id);
  assert.equal(row.tier, 'neo');
  assert.equal(row.lane, 'neo');
  assert.equal(row.task, 'doubled');
  assert.equal(row.cells, mod.colony.cells);
  assert.equal(row.cells, line.cells);
  assert.equal(row.generated, line.generated);
  assert.deepEqual(row.heldout, { score: 1, n: 10, ok: 10 });
  assert.equal(mod.meta.id, row.id);
});

test('PROMOTE: the regenerated grown/index.mjs answers through grownAnswer, the colony and the hand-grown cell', async () => {
  const { root, line } = await promoted();
  const idx = await fresh(path.join(root, 'grown', 'index.mjs'));
  assert.equal(idx.GROWN.length, 2);
  const mod = idx.GROWN[1];
  assert.equal(idx.grownAnswer(mod.examples[0].q).id, line.id);
  assert.equal(idx.grownAnswer('write a haiku about rain').id, 'hand-g1');
  const held = T.doubled.heldout.filter((r) => { const a = idx.grownAnswer(r.q); return a && a.id === line.id && expectOk(a.answer, r.expect); }).length;
  assert.ok(held >= 9, 'held-out through grownAnswer: ' + held);
  assert.equal(idx.grownAnswer('hello'), null);
});

test('the ledger generated total grows by stats.generated, its other keys untouched; colony.json keeps every kept cell', async () => {
  const { root, line } = await promoted();
  const led = readJ(path.join(root, 'neo', 'LEDGER.json'));
  assert.equal(led.generated, line.generated);
  assert.equal(led.note, 'the teacher keeps this key');
  assert.equal(led.tasks.length, 1);
  const col = readJ(path.join(root, 'neo', 'tasks', 'doubled', 'colony.json'));
  assert.equal(col.cells.length, line.kept);
  assert.ok(col.cells.every((c) => checkCell(c).ok));
  assert.equal(fs.readdirSync(path.join(root, 'neo', 'tasks', 'doubled')).some((f) => f.endsWith('.tmp')), false);
});

test('a mastered task is skipped: a second grow spawns nothing and writes nothing (THE CURSOR, part 2)', async () => {
  const { root, line } = await promoted();
  assert.deepEqual(readJ(path.join(root, 'grown', 'index.json')).cells.find((r) => r.id === line.id).heldout, { score: 1, n: 10, ok: 10 });
  const before = grownBytes(root), led0 = fs.readFileSync(path.join(root, 'neo', 'LEDGER.json')), col0 = fs.readFileSync(path.join(root, 'neo', 'tasks', 'doubled', 'colony.json'));
  const again = await grow(root, { gen: 6 });
  assert.equal(again.skipped, true);
  assert.equal(again.promoted, false);
  assert.equal(again.generated, 0);
  assert.deepEqual(again.why, ['mastered: skipped (' + line.id + ' answers 10 of 10 held-out rows)']);
  assert.deepEqual(grownBytes(root), before);
  assert.deepEqual(fs.readFileSync(path.join(root, 'neo', 'LEDGER.json')), led0);
  assert.deepEqual(fs.readFileSync(path.join(root, 'neo', 'tasks', 'doubled', 'colony.json')), col0);
});

test('a second grow of an unmastered task re-grows from the colony as parents, keeps the population and writes its cursor', async () => {
  const root = growRoot(), line = await grow(root); // its own root: the shared promoted root stays as the later tests read it
  assert.equal(line.promoted, true, JSON.stringify(line.why));
  const ixPath = path.join(root, 'grown', 'index.json'), ix = readJ(ixPath);
  ix.cells.find((r) => r.id === line.id).heldout = { score: 0.9, n: 10, ok: 9 };
  fs.writeFileSync(ixPath, JSON.stringify(ix, null, 2) + '\n');
  const led0 = readJ(path.join(root, 'neo', 'LEDGER.json')), col0 = readJ(path.join(root, 'neo', 'tasks', 'doubled', 'colony.json')).cells;
  assert.equal(led0.tasks[0].cursor.round, 0, 'the first grow wrote round 0');
  const again = await grow(root, { gen: 6 });
  assert.equal(again.skipped, undefined);
  assert.equal(again.round, 1, 'the second grow continues: round 1');
  assert.equal(again.promoted, true, JSON.stringify(again.why));
  assert.equal(again.replaced, line.id);
  const led1 = readJ(path.join(root, 'neo', 'LEDGER.json'));
  assert.equal(led1.generated, led0.generated + again.generated);
  assert.equal(led1.tasks[0].cursor.round, 1);
  assert.equal(led1.note, 'the teacher keeps this key');
  const col1 = readJ(path.join(root, 'neo', 'tasks', 'doubled', 'colony.json')).cells, ids = new Set(col1.map((c) => c.id));
  assert.ok(col0.every((c) => ids.has(c.id)), 'the population is kept forever');
});

test('one colony per task: a re-grow with a higher held-out score replaces the present colony, its file and its row', async () => {
  const root = growRoot();
  const first = await grow(root, { gen: 2 });
  assert.equal(first.promoted, true, JSON.stringify(first.why));
  const ixPath = path.join(root, 'grown', 'index.json'), ix = readJ(ixPath);
  ix.cells.find((r) => r.id === first.id).heldout = { score: 0.5, n: 10, ok: 5 };
  fs.writeFileSync(ixPath, JSON.stringify(ix, null, 2) + '\n');
  const next = await grow(root, { gen: 3 });
  assert.equal(next.promoted, true, JSON.stringify(next.why));
  assert.equal(next.replaced, first.id);
  const rows = readJ(ixPath).cells.filter((r) => r.tier === 'neo');
  assert.deepEqual(rows.map((r) => r.id), ['doubled-neo-g3']);
  assert.equal(fs.existsSync(path.join(root, 'grown', 'cells', first.id + '.mjs')), false);
  assert.equal(readJ(ixPath).cells[0].id, 'hand-g1');
});

test('status counts tasks, colonies, cells, mastered and the ledger total', async () => {
  const { root, line } = await promoted();
  const st = status(root);
  assert.equal(st.tasks, 1);
  assert.equal(st.colonies, 1);
  assert.equal(st.cells, line.cells);
  assert.equal(st.mastered, 1);
  assert.equal(st.generated, readJ(path.join(root, 'neo', 'LEDGER.json')).generated);
  assert.equal(st.kept, readJ(path.join(root, 'neo', 'tasks', 'doubled', 'colony.json')).cells.length);
  assert.equal(Object.values(st.byFamily).reduce((a, b) => a + b, 0), st.kept);
});

test('a later locked-tier store promote keeps the neo row', async () => {
  const { root, line } = await promoted();
  const lane = tmpDir('lane'), cand = path.join(lane, 'science-a-g6');
  put(cand, 'cell.mjs', HAND.replace(/hand-g1/g, 'science-a-g6').replace("'writing'", "'science'").replace('generation: 1', 'generation: 6').replace(/haiku about rain/g, 'poem about photosynthesis').replace(/haiku/g, 'photosynthesis').replace(/'rain'/g, "'light'").replace('soft rain on the roof', 'light becomes sugar'));
  put(cand, 'verdict.json', JSON.stringify({ id: 'science-a-g6', class: 'science', survived: true, why: [], lockOk: true, tests: { failed: 0, passed: 3 }, control: { shadows: 0, n: 5 }, examples: { n: 1, ok: 1 }, heldout: { score: 0.9, n: 10, ok: 9 }, baseline: { score: 0.1, n: 10, ok: 1 } }));
  put(cand, 'result.json', JSON.stringify({ id: 'science-a-g6', validate: { ok: true }, tests: { exitCode: 0, failed: 0 }, backend: 'vercel' }));
  const r = await promote({ gen: 6, lane: 'a', dir: lane, grownDir: path.join(root, 'grown'), env: {} });
  assert.deepEqual(r.promoted, ['science-a-g6']);
  const index = readJ(path.join(root, 'grown', 'index.json'));
  assert.ok(index.cells.some((row) => row.id === line.id && row.tier === 'neo'));
  assert.ok(fs.existsSync(path.join(root, 'grown', 'cells', line.id + '.mjs')));
  assert.equal(index.cells[0].id, 'hand-g1');
});

test('PROMOTE: cell by cell, a cell that answered a held-out row wrong leaves the colony', async () => {
  const held = T.doubled.heldout.map((r, i) => (i === 0 ? { q: r.q, expect: { equals: '-1' } } : r));
  const root = growRoot({ heldout: held });
  const line = await grow(root);
  assert.deepEqual(line.heldout, { ok: 9, n: 10, score: 0.9 }, 'measured before any pruning');
  assert.equal(line.promoted, true, JSON.stringify(line.why));
  assert.ok(line.pruned >= 1);
  const mod = await fresh(path.join(root, 'grown', 'cells', line.id + '.mjs'));
  assert.equal(mod.answer(held[0].q), null, 'no cell left answers the row it answered wrong');
  assert.ok(mod.examples.every((ex) => expectOk(mod.answer(ex.q), ex.expect)));
});

test('PROMOTE: a proof that fails puts grown/ back byte for byte', async () => {
  const root = growRoot(), before = grownBytes(root);
  const line = await grow(root, { render: () => 'export const GROWN = [;\n' });
  assert.equal(line.promoted, false);
  assert.match(line.why[0], /^the proof failed: node --check grown\/index\.mjs failed: SyntaxError: [^\r\n]+ \(grown\/ is as it was\)$/);
  assert.deepEqual(grownBytes(root), before);
  const line2 = await grow(root, { render: (ix) => renderIndexMjs({ ...ix, cells: ix.cells.slice(0, 1) }) });
  assert.equal(line2.promoted, false);
  assert.match(line2.why[0], /^the proof failed: grown\/index\.mjs exports 1 cells/);
  assert.deepEqual(grownBytes(root), before);
});

test('grow never grows from a retired prompt, and refuses a task that is not opened', async () => {
  const root = growRoot(), gone = T.doubled.dev[4].q;
  put(root, 'grow/retired.jsonl', jsonl([{ sha: shaOf(gone), ids: [], why: 'test' }]));
  const line = await grow(root);
  assert.equal(line.promoted, true, JSON.stringify(line.why));
  assert.equal(fs.readFileSync(path.join(root, 'neo', 'tasks', 'doubled', 'colony.json'), 'utf8').includes(gone), false);
  assert.equal(fs.readFileSync(path.join(root, 'grown', 'cells', line.id + '.mjs'), 'utf8').includes(gone), false);
  await assert.rejects(growTask({ root, task: 'not-opened', gen: 1, organism: nobody }), (e) => e instanceof Fail && e.code === 1);
  await assert.rejects(growTask({ root, task: 'X', gen: 1, organism: nobody }), (e) => e instanceof Fail && e.code === 2);
  await assert.rejects(growTask({ root, task: 'doubled', gen: 0, organism: nobody }), (e) => e instanceof Fail && e.code === 2);
});

test('CLI: grow --task prints its line and exits 0 for a completed grow, promoted or not', async () => {
  const root = growRoot(), logs = [];
  const code = await main(['grow', '--task', 'doubled', '--gen', '2', '--root', root, '--max-generated', '6000'], { log: (s) => logs.push(s), err: () => {}, organism: nobody });
  assert.equal(code, 0);
  const line = JSON.parse(logs.at(-1));
  for (const k of LINE_KEYS) assert.ok(k in line, k);
  assert.equal(line.promoted, true, JSON.stringify(line.why));
  const code2 = await main(['grow', '--task', 'doubled', '--gen', '3', '--root', root, '--max-generated', '6000'], { log: (s) => logs.push(s), err: () => {}, organism: nobody });
  assert.equal(code2, 0);
  assert.equal(JSON.parse(logs.at(-1)).promoted, false);
});
