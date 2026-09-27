// test/grid.test.mjs: the grid vocabulary (capability/grid-dsl.mjs), its search
// (capability/grid-search.mjs) and the grid branch of act/solve.mjs.
//
// Why the first test exists: the first bench run of this vocabulary had dedupeCols and
// dedupeBoth throwing on every grid whose columns had nothing to collapse, and the search
// swallowed the throw as a refusal, so two primitives were dead code nobody could see. Every
// primitive now runs on a bank of tiny grids, must not throw, must return its declared type,
// and must fire on at least one grid: a primitive that never fires is not a capability.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRIMS, LEARNERS, VOCABULARY_SIZE, fromRows, toRows, isGrid, isAnswerGrid, applyStep, byName, P, MAX_SIDE,
  learnCellRule, applyCellRule, FALLBACK_LEARNERS,
} from '../capability/grid-dsl.mjs';
import { searchGrid, gradeInCells, buildSearchBrain, runInCells, taskFromArc, fallbackOn } from '../capability/grid-search.mjs';
import { solve, METHODS } from '../act/solve.mjs';

const BANK = [
  [[1, 1, 1], [1, 0, 1], [1, 1, 1]],
  [[0, 0, 0, 0, 0], [0, 2, 2, 0, 0], [0, 2, 2, 0, 3], [0, 0, 0, 0, 0], [4, 0, 0, 0, 0]],
  [[1, 0], [0, 2]],
  [[1, 0, 5, 0, 1], [0, 1, 5, 1, 1]],
  [[1, 0, 5, 1, 0], [0, 1, 5, 0, 1], [5, 5, 5, 5, 5], [1, 1, 5, 1, 0], [0, 0, 5, 0, 1]],
  [[0, 0, 0, 0, 0], [0, 3, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 3, 0], [0, 0, 0, 0, 0]],
  [[2, 2, 3, 3], [2, 2, 3, 3], [4, 4, 0, 0], [4, 4, 0, 0]],
  [[1, 2, 2, 1], [3, 0, 4, 3], [3, 4, 4, 3], [1, 2, 2, 1]],
  [[1, 2, 2, 1], [3, 8, 8, 3], [3, 8, 8, 3], [1, 2, 2, 1]],
  [[6, 6, 6], [6, 1, 6], [6, 6, 6]],
  [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
  [[0, 0, 0, 0], [1, 0, 0, 1], [0, 0, 0, 0], [0, 2, 0, 0]],
  [[1, 1, 1, 2, 2, 2], [1, 1, 1, 2, 2, 2], [1, 1, 1, 2, 2, 2], [3, 3, 3, 0, 0, 0], [3, 3, 3, 0, 0, 0], [3, 3, 3, 0, 0, 0]],
  [[1, 2, 5, 1, 1], [3, 4, 5, 1, 1]],
  [[1, 2, 1, 2, 1, 2], [2, 1, 2, 1, 0, 0], [1, 2, 1, 2, 0, 0], [2, 1, 2, 1, 2, 1]],
  [[1, 2, 1, 2], [2, 1, 2, 1]],
];
const grids = () => BANK.map(fromRows);

function typeOk(v, type) {
  if (type === 'grid') return isGrid(v) && v.w <= MAX_SIDE && v.h <= MAX_SIDE;
  if (type === 'objects') return v.t === 'objects' && Array.isArray(v.list) && v.list.length > 0 && isGrid(v.src);
  if (type === 'color') return v.t === 'color' && Number.isInteger(v.c);
  return false;
}
function inputsFor(p) {
  if (p.from === 'grid') return grids();
  if (p.from === 'color') return [{ t: 'color', c: 3 }];
  const makers = PRIMS.filter((q) => q.from === 'grid' && q.to === 'objects');
  return grids().flatMap((g) => makers.map((m) => m.apply(g)).filter(Boolean));
}

test('every primitive runs on tiny grids, never throws, returns its declared type, and fires at least once', () => {
  assert.ok(PRIMS.length >= 60, 'at least 60 primitives, got ' + PRIMS.length);
  assert.equal(VOCABULARY_SIZE, PRIMS.length + LEARNERS.length);
  const dead = [];
  for (const p of PRIMS) {
    let fired = 0;
    for (const v of inputsFor(p)) {
      let out;
      assert.doesNotThrow(() => { out = p.apply(v); }, p.name + ' threw');
      if (!out) continue;
      assert.ok(typeOk(out, p.to), p.name + ' returned something that is not a ' + p.to);
      fired++;
    }
    if (!fired) dead.push(p.name);
  }
  assert.deepEqual(dead, [], 'primitives that never fired on the bank: ' + dead.join(' '));
  const types = new Set(PRIMS.map((p) => p.from + '>' + p.to));
  for (const t of ['grid>grid', 'grid>objects', 'objects>objects', 'objects>grid', 'grid>color', 'color>grid']) assert.ok(types.has(t), 'the vocabulary has a ' + t + ' primitive');
});

test('primitives compute the grids they claim', () => {
  const run = (name, rows) => toRows(applyStep({ op: name }, fromRows(rows)));
  assert.deepEqual(run('rot90', [[1, 2], [3, 4]]), [[3, 1], [4, 2]]);
  assert.deepEqual(run('rot270', [[1, 2], [3, 4]]), [[2, 4], [1, 3]]);
  assert.deepEqual(run('flipH', [[1, 2, 3]]), [[3, 2, 1]]);
  assert.deepEqual(run('transpose', [[1, 2, 3]]), [[1], [2], [3]]);
  assert.deepEqual(run('cropBBox', [[0, 0, 0], [0, 5, 6], [0, 0, 7]]), [[5, 6], [0, 7]]);
  assert.deepEqual(run('gravityDown', [[1, 0], [0, 0], [0, 2]]), [[0, 0], [0, 0], [1, 2]]);
  assert.deepEqual(run('fillEnclosed', [[1, 1, 1], [1, 0, 1], [1, 1, 1]]), [[1, 1, 1], [1, P, 1], [1, 1, 1]]);
  assert.deepEqual(run('kron', [[1, 0], [0, 0]]), [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  assert.deepEqual(run('connectH', [[3, 0, 0, 3], [3, 0, 0, 4]]), [[3, 3, 3, 3], [3, 0, 0, 4]]);
  assert.deepEqual(run('up2', [[1, 2]]), [[1, 1, 2, 2], [1, 1, 2, 2]]);
  assert.deepEqual(run('periodicFill', [[1, 2, 1, 2], [2, 1, 0, 1], [1, 2, 1, 2]]), [[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 1, 2]]);
  assert.deepEqual(run('dedupeCols', [[1, 1, 2], [3, 3, 4]]), [[1, 2], [3, 4]]);
  assert.deepEqual(run('dedupeBoth', [[1, 2], [1, 2], [3, 4]]), [[1, 2], [3, 4]]);
  // a typed chain: grid to objects, objects to objects, objects to grid
  let v = fromRows([[0, 0, 0, 0], [0, 4, 4, 0], [0, 4, 4, 0], [2, 0, 0, 0]]);
  for (const op of ['objectsC8', 'largest', 'crop']) v = applyStep({ op }, v);
  assert.deepEqual(toRows(v), [[4, 4], [4, 4]]);
  // a no-op on one grid passes it through; it does not kill the program for every other pair
  assert.deepEqual(run('connectH', [[3, 0, 4]]), [[3, 0, 4]]);
});

test('every learner reads its parameters off synthetic pairs and reproduces them', () => {
  const g = (rows) => fromRows(rows);
  const cases = {
    colormap: [[g([[1, 2]]), g([[3, 4]])], [g([[2, 1]]), g([[4, 3]])]],
    constant: [[g([[1, 2]]), g([[7]])], [g([[2, 2]]), g([[7]])]],
    tileSym: [[g([[1, 2]]), g([[1, 2, 2, 1]])], [g([[3, 0]]), g([[3, 0, 0, 3]])]],
    fixedCrop: [[g([[1, 2, 3], [4, 5, 6]]), g([[2, 3]])], [g([[7, 8, 9], [1, 1, 2]]), g([[8, 9]])]],
    localRule: [[g([[1, 0, 1], [0, 0, 0]]), g([[1, 2, 1], [0, 0, 0]])], [g([[0, 0, 0], [1, 0, 1]]), g([[0, 0, 0], [1, 2, 1]])]],
    objectRecolor: [[g([[1, 1, 0, 1], [0, 0, 0, 0]]), g([[2, 2, 0, 1], [0, 0, 0, 0]])], [g([[1, 0, 0, 0], [0, 0, 1, 1]]), g([[1, 0, 0, 0], [0, 0, 2, 2]])]],
    kronLearned: [[g([[1, 0], [0, 1]]), g([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]])], [g([[0, 1], [0, 0]]), g([[0, 0, 0, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]])]],
    extendTo: [[g([[1, 2, 1, 2]]), g([[1, 2, 1, 2, 1, 2]])], [g([[3, 4, 3, 4]]), g([[3, 4, 3, 4, 3, 4]])]],
    // every 2 gets a 4 on its left and its right; a 3 paints nothing
    stamp: [[g([[0, 0, 0, 0, 0, 0], [0, 0, 2, 0, 0, 3], [0, 0, 0, 0, 0, 0]]), g([[0, 0, 0, 0, 0, 0], [0, 4, 2, 4, 0, 3], [0, 0, 0, 0, 0, 0]])],
      [g([[0, 0, 0, 0, 0, 0], [3, 0, 0, 0, 0, 0], [0, 0, 0, 2, 0, 0]]), g([[0, 0, 0, 0, 0, 0], [3, 0, 0, 0, 0, 0], [0, 0, 4, 2, 4, 0]])]],
    // a lone 5 shoots a ray of 5 downward to the border
    rayLearned: [[g([[0, 5, 0], [0, 0, 0], [0, 0, 0]]), g([[0, 5, 0], [0, 5, 0], [0, 5, 0]])], [g([[5, 0, 0], [0, 0, 0]]), g([[5, 0, 0], [5, 0, 0]])]],
  };
  assert.deepEqual(Object.keys(cases).sort(), LEARNERS.map((l) => l.name).sort(), 'every learner has a case');
  for (const L of LEARNERS) {
    const pairs = cases[L.name];
    const states = pairs.map((p) => p[0]), wanted = pairs.map((p) => p[1]);
    const params = L.learn(states, wanted, states);
    assert.ok(params, L.name + ' learned nothing');
    for (let i = 0; i < pairs.length; i++) {
      const out = applyStep({ op: L.name, learned: params }, states[i]);
      assert.ok(out, L.name + ' made nothing on pair ' + i);
      assert.deepEqual(toRows(out), toRows(wanted[i]), L.name + ' pair ' + i);
    }
  }
  // the colour map refuses a test colour it never saw, rather than passing it through
  assert.equal(byName('colormap').learn([g([[1, 2]])], [g([[3, 4]])], [g([[5, 1]])]), null);
  // the stamp refuses a test colour it never saw when the pairs showed fewer than two inert colours
  const st = cases.stamp;
  assert.equal(byName('stamp').learn(st.map((p) => p[0]), st.map((p) => p[1]), [g([[0, 0, 0], [0, 7, 0], [0, 0, 0]])]), null);
});

test('a composed program is found on synthetic pairs, graded by cells, and answers the test', () => {
  // hidden program: rotate a quarter turn, fill every enclosed hole, paint the fill colour 4
  const hidden = (rows) => {
    let v = applyStep({ op: 'rot90' }, fromRows(rows));
    v = applyStep({ op: 'fillEnclosed' }, v);
    return toRows(v).map((r) => r.map((c) => (c === P ? 4 : c)));
  };
  const ins = [
    [[1, 1, 1, 0, 0], [1, 0, 1, 0, 2], [1, 1, 1, 0, 0], [0, 0, 0, 0, 0]],
    [[0, 3, 3, 3, 3], [0, 3, 0, 0, 3], [0, 3, 3, 3, 3], [5, 0, 0, 0, 0]],
    [[6, 6, 6, 0, 0], [6, 0, 6, 0, 0], [6, 0, 6, 0, 1], [6, 6, 6, 0, 1]],
    [[0, 0, 7, 7, 7], [0, 0, 7, 0, 7], [2, 0, 7, 7, 7], [0, 0, 0, 0, 0]],
  ];
  const json = { train: ins.slice(0, 3).map((r) => ({ input: r, output: hidden(r) })), test: [{ input: ins[3], output: hidden(ins[3]) }] };
  const r = searchGrid(taskFromArc(json), { budgetMs: 20000 });
  assert.equal(r.status, 'found');
  assert.ok(r.depth >= 2, 'a composition, not one step: ' + r.names.join(' > '));
  assert.deepEqual(toRows(r.outputs[0]), json.test[0].output);
  assert.ok(r.cells > 0, 'the answer came through cells');
});

test('the budget is respected and a hopeless task ends in a refusal, not a guess', () => {
  let seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const noise = () => Array.from({ length: 30 }, () => Array.from({ length: 30 }, () => Math.floor(rnd() * 10)));
  const json = { train: [0, 1, 2].map(() => ({ input: noise(), output: noise() })), test: [{ input: noise() }] };
  const budgetMs = 300;
  const t0 = performance.now();
  const r = searchGrid(taskFromArc(json), { budgetMs });
  const wall = performance.now() - t0;
  assert.ok(r.status === 'timeout' || r.status === 'exhausted', r.status);
  assert.equal(r.outputs, null);
  assert.ok(wall < budgetMs + 1500, 'wall ' + wall.toFixed(1) + ' ms for a ' + budgetMs + ' ms budget');
});

test('grading is done by grid.dsl.match cells, and a wrong program is refused by them', () => {
  const pair = { input: fromRows([[1, 2]]), output: fromRows([[2, 1]]) };
  const good = gradeInCells([{ op: 'flipH' }], [pair], [fromRows([[3, 4]])]);
  assert.equal(good.ok, true);
  assert.deepEqual(toRows(good.outputs[0]), [[4, 3]]);
  assert.ok(good.runs > 0, 'cells ran');
  const bad = gradeInCells([{ op: 'rot180' }, { op: 'transpose' }], [pair], [fromRows([[3, 4]])]);
  assert.equal(bad.ok, false);
  const m = runInCells(buildSearchBrain(), [{ op: 'flipV' }], fromRows([[1], [2]]), fromRows([[1], [2]]));
  assert.equal(m.match.equal, false);
  assert.equal(m.match.diff, 2);
  assert.equal(isAnswerGrid(fromRows([[P]])), false, 'a placeholder is never an answer');
});

test('act/solve falls through from the depth 3 search to the wide vocabulary, with provenance exact', () => {
  const prompt = [
    'Each grid below is written as rows separated by |.',
    '100|010|000 -> 000|000|110',
    '020|000|002 -> 000|000|022',
    '300|300|030 -> 000|300|330',
    'Apply that same transformation to this input: 010|100|001',
  ].join('\n');
  const got = solve(prompt);
  assert.ok(got, 'solve refused a gravity task');
  assert.ok(METHODS.includes(got.method));
  assert.equal(got.method, 'exact.grid');
  assert.equal(got.answer, '000|000|111');
  assert.ok(got.steps.some((s) => s.includes('depth 4')), got.steps.join(' / '));
});

// Board 23, item ladder-arc: the cell rule and the fallback phase. The rule below (a cell whose
// right neighbour has another colour turns 5) is not reachable by the search in 1200 ms, and the
// test input uses colours no train pair shows, so only a colour-abstract description answers it.
function cellRuleTask() {
  let seed = 11;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const grid = (w, h, cols) => Array.from({ length: h }, () => Array.from({ length: w }, () => cols[Math.floor(rnd() * cols.length)]));
  const rule = (g) => g.map((r) => r.map((c, x) => (x + 1 < r.length && r[x + 1] !== c ? 5 : c)));
  const ins = [grid(6, 5, [1, 2, 3]), grid(5, 6, [1, 2, 3]), grid(6, 6, [1, 2, 3]), grid(5, 5, [4, 6, 7])];
  return { train: ins.slice(0, 3).map((r) => ({ input: r, output: rule(r) })), test: [{ input: ins[3], output: rule(ins[3]) }] };
}

test('the cell rule reads a colour-abstract description off the train pairs, answers unseen colours, and refuses noise', () => {
  const json = cellRuleTask();
  const p = learnCellRule(json.train.map((t) => fromRows(t.input)), json.train.map((t) => fromRows(t.output)), [fromRows(json.test[0].input)]);
  assert.ok(p, 'no rule learned');
  assert.deepEqual(p.S, ['nR?']);
  assert.deepEqual(toRows(applyCellRule(fromRows(json.test[0].input), p)), json.test[0].output);
  let seed = 5;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const noise = () => fromRows(Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => Math.floor(rnd() * 10))));
  assert.equal(learnCellRule([noise(), noise()], [noise(), noise()], [noise()]), null, 'a rule for noise is a guess');
  assert.ok(byName('cellRule'), 'the fallback learner is addressable by name');
  assert.ok(FALLBACK_LEARNERS.some((L) => L.name === 'cellRule'));
  assert.ok(!LEARNERS.some((L) => L.name === 'cellRule'), 'the fallback learner is not in the main vocabulary');
});

test('the fallback phase answers what the search cannot, and GRID_FIXED_VOCAB=1 is the control that turns it off', () => {
  const json = cellRuleTask();
  const on = searchGrid(taskFromArc(json), { budgetMs: 1200 });
  assert.equal(on.status, 'found');
  assert.deepEqual(on.names, ['cellRule']);
  assert.deepEqual(toRows(on.outputs[0]), json.test[0].output);
  assert.ok(on.phases.search >= 1200 * 0.75 - 50, 'the search kept its share of the clock: ' + JSON.stringify(on.phases));
  assert.ok(on.cells > 0, 'the answer came through cells');
  const off = searchGrid(taskFromArc(json), { budgetMs: 1200, fallback: false });
  assert.equal(off.outputs, null);
  assert.equal(off.phases, undefined);
  const before = process.env.GRID_FIXED_VOCAB;
  process.env.GRID_FIXED_VOCAB = '1';
  try {
    assert.equal(fallbackOn({}), false);
    const ctl = searchGrid(taskFromArc(json), { budgetMs: 1200 });
    assert.equal(ctl.outputs, null, 'the control must not see the cell rule');
  } finally {
    if (before === undefined) delete process.env.GRID_FIXED_VOCAB; else process.env.GRID_FIXED_VOCAB = before;
  }
  assert.equal(fallbackOn({}), true);
  // an answer the search finds early is never preempted by the fallback
  const easy = { train: [{ input: [[1, 2, 3]], output: [[3, 2, 1]] }, { input: [[4, 0], [5, 6]], output: [[0, 4], [6, 5]] }], test: [{ input: [[7, 8]] }] };
  const e = searchGrid(taskFromArc(easy), { budgetMs: 1200 });
  assert.equal(e.status, 'found');
  assert.equal(e.phases.fallback, 0);
  assert.ok(!e.names.includes('cellRule'), e.names.join(' > '));
});

// Board 23 fix pass: the cell rule's header comment said "out of 58" while CELL_FEATURES held 73,
// so a reader of the code got a number no command prints. The counts in that comment are now read
// against the arrays themselves; the test fails if the comment or the arrays move alone.
test('the cell rule header comment names the feature counts the arrays hold', async () => {
  const { readFileSync } = await import('node:fs');
  const { CELL_FEATURES, CELL_COLOR_FEATURES, CELL_OTHER_FEATURES } = await import('../capability/grid-dsl.mjs');
  const src = readFileSync(new URL('../capability/grid-dsl.mjs', import.meta.url), 'utf8');
  const all = src.match(/descriptions out of (\d+), CELL_FEATURES \((\d+) colour valued/);
  const other = src.match(/enclosed hole; (\d+) others:/);
  assert.ok(all, 'the comment naming the total and the colour valued count is missing');
  assert.ok(other, 'the comment naming the other count is missing');
  assert.equal(Number(all[1]), CELL_FEATURES.length, 'total in the comment');
  assert.equal(Number(all[2]), CELL_COLOR_FEATURES.length, 'colour valued count in the comment');
  assert.equal(Number(other[1]), CELL_OTHER_FEATURES.length, 'other count in the comment');
  assert.equal(CELL_COLOR_FEATURES.length + CELL_OTHER_FEATURES.length, CELL_FEATURES.length);
  assert.ok(!/descriptions out of 58\b/.test(src), 'the stale count is back');
});

// ---------------------------------------------------------------- Board 26, item grid-split
// The gate's CONTAMINATION row and the ladder-arc verify plane: a grid verdict names its split as an
// object (development: the training ids, heldOut: the evaluation ids scored, contaminated decided
// from data), carries barMet as a top-level boolean against the bar it names, and its command field
// writes the file it sits in again. One bar, one isTheBar: the repeat and the controls are not the
// bar. Each claim below has a control that must fail it. No model, no socket; nothing is written in
// the real tree (temp directories only).
const G26 = () => import('../bench/grid.mjs');
const GATE26 = () => import('../bench/gate.mjs');
const VERDICTS26 = new URL('../bench/verdicts/', import.meta.url);
const FIX26 = new URL('../bench/fixtures/public/arc-agi-1/', import.meta.url);
async function read26(name) {
  const { readFileSync } = await import('node:fs');
  return JSON.parse(readFileSync(new URL(name, VERDICTS26), 'utf8'));
}
/** The plain-path grid verdicts this item wrote or re-ran: the population the checks below grade. */
const PLAIN26 = ['grid.json', 'grid-local-evaluation.json', 'grid-local-evaluation-repeat.json', 'grid-local-training.json', 'grid-split-evaluation-control.json', 'grid-split-training-control.json'];
/** What is wrong with one plain-path grid verdict, as sentences (empty when nothing is). */
async function problems26(name, v) {
  const G = await G26();
  const { splitShapeOf } = await GATE26();
  const out = [];
  if (typeof v.barMet !== 'boolean') out.push('barMet is not a boolean');
  if (typeof v.isTheBar !== 'boolean') out.push('isTheBar is not a boolean');
  if (splitShapeOf(v) !== 'object') out.push('split is not an object (' + splitShapeOf(v) + ')');
  if (typeof v.command !== 'string' || !v.command.startsWith('node bench/grid.mjs ')) out.push('command is not a bench/grid.mjs command');
  else {
    const cfg = G.parseArgs(v.command.slice('node bench/grid.mjs '.length).split(' ').filter(Boolean));
    const complete = !cfg.limit && !cfg.ids;
    if (G.verdictNameFor(cfg, complete) + '.json' !== name) out.push('the command writes ' + G.verdictNameFor(cfg, complete) + '.json, not ' + name);
  }
  if (v.file !== 'bench/verdicts/' + name) out.push('file field ' + v.file);
  if (v.isTheBar === false && v.barMet !== false) out.push('a file that is not the bar claims barMet');
  if (v.split && typeof v.split.contaminated === 'string' && (v.contaminated !== true || !/contaminat/i.test(v.statement || ''))) out.push('a contamination reason with no top-level mark or no word in the statement');
  return out;
}

test('Board 26: the evaluation bar verdict carries barMet as a boolean and a split object accepted by splitShapeOf, and its command writes it', async () => {
  const { splitShapeOf, contaminationRecords, contaminationRow } = await GATE26();
  const { mkdtempSync, writeFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const path = await import('node:path');
  const v = await read26('grid-local-evaluation.json');
  assert.equal(typeof v.barMet, 'boolean');
  assert.equal(v.isTheBar, true);
  assert.equal(splitShapeOf(v), 'object');
  assert.deepEqual(await problems26('grid-local-evaluation.json', v), []);
  // the gate's own row over this file alone is GREEN; the CONTROL (the split as the string a dataset
  // name used to be) is RED and names the file
  const dir = mkdtempSync(path.join(tmpdir(), 'grid26-'));
  try {
    writeFileSync(path.join(dir, 'grid-local-evaluation.json'), JSON.stringify(v));
    const green = contaminationRow(contaminationRecords(dir));
    assert.equal(green.ok, true, green.line);
    assert.equal(green.counts.withSplit, 1);
    writeFileSync(path.join(dir, 'grid-local-evaluation.json'), JSON.stringify({ ...v, split: 'evaluation' }));
    const red = contaminationRow(contaminationRecords(dir));
    assert.equal(red.ok, false);
    assert.match(red.line, /grid-local-evaluation\.json \(string "evaluation"\)/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
  // the two sides: every scored id is held out, every development id is a training id, none in both
  assert.equal(v.split.heldOut.ids.length, v.n);
  assert.deepEqual([...v.split.heldOut.ids].sort(), v.rows.map((r) => r.id).sort());
  assert.equal(v.split.development.ids.length, 400);
  const dev = new Set(v.split.development.ids);
  assert.equal(v.split.heldOut.ids.filter((id) => dev.has(id)).length, 0, 'an id on both sides');
  // barMet recomputed from the file's own fields: the bar, the percent and the clean percent
  assert.ok(v.bar && typeof v.bar.score === 'number', 'the bar is named');
  assert.equal(v.barMet, v.isTheBar && v.pct >= v.bar.score && v.clean.pct >= v.bar.score);
  const dirty = new Set(v.split.decidedFrom.duplicates.map((d) => d.id));
  const cleanRows = v.rows.filter((r) => !dirty.has(r.id));
  assert.equal(v.clean.n, cleanRows.length);
  assert.equal(v.clean.solved, cleanRows.filter((r) => r.solved).length);
  // a CONTROL for the problems check: the file with barMet taken out, and with the command it carried before
  const { barMet, ...noBar } = v;
  assert.equal(typeof barMet, 'boolean');
  assert.ok((await problems26('grid-local-evaluation.json', noBar)).includes('barMet is not a boolean'));
  assert.ok((await problems26('grid-local-evaluation.json', { ...v, command: 'node bench/grid.mjs --split evaluation --budget-ms 3000 --workers 4' })).some((p) => /writes grid-evaluation\.json/.test(p)), 'the old command wrote grid-evaluation.json');
});

test('Board 26: the bar is the frontier row bench/ladder.mjs holds the ARC set to, read from the same published rows', async () => {
  const G = await G26();
  const { frontierRowOf, publishedRowsOf } = await import('../bench/ladder.mjs');
  const pub = await read26('public-arc.json');
  const mine = G.frontierBar(pub.published);
  const ladder = frontierRowOf(publishedRowsOf([{ file: 'bench/verdicts/public-arc.json', v: pub }]));
  assert.ok(mine && ladder);
  assert.equal(mine.system, ladder.system);
  assert.equal(mine.score, ladder.score);
  const v = await read26('grid-local-evaluation.json');
  assert.equal(v.bar.system, mine.system);
  assert.equal(v.bar.score, mine.score);
  // control: a human row or a pass@2 row above it is never the bar
  const planted = G.frontierBar([...pub.published, { system: 'people', score: 100, class: 'human' }, { system: 'two tries', score: 99.9, class: 'frontier reasoning', metric: 'pass@2' }]);
  assert.equal(planted.system, mine.system);
});

test('Board 26: one bar, one isTheBar; the repeat names the bar file, the controls are control arms, and every plain grid verdict names its own file', async () => {
  const { existsSync } = await import('node:fs');
  const G = await G26();
  const all = [];
  for (const name of PLAIN26) {
    assert.ok(existsSync(new URL(name, VERDICTS26)), name + ' is on disk');
    const v = await read26(name);
    assert.deepEqual(await problems26(name, v), [], name);
    all.push({ name, v });
  }
  const evalBars = all.filter((x) => x.v.arcSplit === 'evaluation' && x.v.isTheBar === true).map((x) => x.name);
  assert.deepEqual(evalBars, ['grid-local-evaluation.json'], 'one isTheBar for the evaluation bar');
  for (const x of all.filter((y) => y.v.arcSplit === 'training')) assert.equal(x.v.isTheBar, false, x.name + ': the training split names no bar');
  const bar = all.find((x) => x.name === 'grid-local-evaluation.json').v;
  const rep = all.find((x) => x.name === 'grid-local-evaluation-repeat.json').v;
  assert.equal(rep.repeatOf, 'bench/verdicts/grid-local-evaluation.json');
  assert.equal(rep.repeat.barRunSolved, bar.solved);
  const again = G.pairRows(rep.rows, bar);
  assert.deepEqual([again.gained, again.lost], [rep.repeat.gained, rep.repeat.lost], 'the repeat pairing is recomputed from the rows');
  for (const name of ['grid-split-evaluation-control.json', 'grid-split-training-control.json']) {
    const c = all.find((x) => x.name === name).v;
    assert.equal(c.controlArm, true, name);
    assert.equal(c.isTheBar, false, name);
  }
  // the bar and the training run name their control, and the pairing is what their rows give
  for (const [treat, ctl] of [['grid-local-evaluation.json', 'grid-split-evaluation-control.json'], ['grid-local-training.json', 'grid-split-training-control.json']]) {
    const t = all.find((x) => x.name === treat).v, c = all.find((x) => x.name === ctl).v;
    assert.equal(t.control.file, 'bench/verdicts/' + ctl);
    assert.equal(t.control.solved, c.solved);
    const p = G.pairRows(t.rows, c);
    assert.deepEqual([p.gained, p.lost], [t.control.gained, t.control.lost], treat);
  }
  // control for the uniqueness check: the repeat as it was before this item (isTheBar true) makes two
  const before = all.map((x) => (x.name === 'grid-local-evaluation-repeat.json' ? { ...x, v: { ...x.v, isTheBar: true } } : x));
  assert.equal(before.filter((x) => x.v.arcSplit === 'evaluation' && x.v.isTheBar === true).length, 2);
});

test('Board 26: contamination is decided from data: the overlap finds a planted duplicate and passes a clean set', async () => {
  const G = await G26();
  const grid = (n) => [[n, n], [n, 0]];
  const dev = [
    { id: 'd1', json: { train: [{ input: grid(1), output: grid(2) }], test: [{ input: grid(3), output: grid(4) }] } },
    { id: 'd2', json: { train: [{ input: grid(5), output: grid(6) }], test: [{ input: grid(7), output: grid(8) }] } },
  ];
  const scored = [
    { id: 'same', json: JSON.parse(JSON.stringify(dev[0].json)) },
    { id: 'onepair', json: { train: [{ input: grid(5), output: grid(6) }], test: [{ input: grid(9), output: grid(9) }] } },
    { id: 'clean', json: { train: [{ input: grid(1), output: grid(3) }], test: [{ input: grid(2), output: grid(4) }] } },
  ];
  const o = G.overlapOf(scored, dev);
  assert.deepEqual(o.duplicates, [{ id: 'same', of: ['d1'], pairs: 2, ofPairs: 2, whole: true }, { id: 'onepair', of: ['d2'], pairs: 1, ofPairs: 2, whole: false }]);
  assert.deepEqual(o.pairsCompared, { scored: 6, development: 4 });
  const s = G.splitFor({ arcSplit: 'evaluation', developmentIds: ['d1', 'd2'], heldOutIds: scored.map((t) => t.id), duplicates: o.duplicates, pairsCompared: o.pairsCompared });
  assert.equal(typeof s.contaminated, 'string');
  assert.match(s.contaminated, /same is pair for pair identical to training d1/);
  assert.match(s.contaminated, /onepair shares 1 of its 2 pairs with training d2/);
  // control: the clean task alone gives contaminated false, with the data it was decided from
  const c = G.overlapOf([scored[2]], dev);
  const sc = G.splitFor({ arcSplit: 'evaluation', developmentIds: ['d1', 'd2'], heldOutIds: ['clean'], duplicates: c.duplicates, pairsCompared: c.pairsCompared });
  assert.equal(sc.contaminated, false);
  assert.equal(sc.decidedFrom.scoredTasksSharingAPair, 0);
  // the real split: recomputed from the fixtures when they are on disk (never committed)
  const { existsSync } = await import('node:fs');
  if (!existsSync(FIX26)) return;
  const v = await read26('grid-local-evaluation.json');
  const real = G.overlapOf(G.loadSplit('evaluation'), G.loadSplit('training'));
  assert.deepEqual(real.duplicates, v.split.decidedFrom.duplicates);
  assert.deepEqual(real.pairsCompared, v.split.decidedFrom.pairsCompared);
});

test('Board 26: a tag names the file, a control or a repeat needs one, and GRID_FIXED_VOCAB without --fixed-vocab is refused', async () => {
  const G = await G26();
  assert.equal(G.verdictNameFor(G.parseArgs(['--split', 'evaluation', '--tag', 'local-evaluation']), true), 'grid-local-evaluation');
  assert.equal(G.verdictNameFor(G.parseArgs(['--split', 'evaluation']), true), 'grid-evaluation');
  assert.equal(G.verdictNameFor(G.parseArgs(['--split', 'training']), true), 'grid');
  assert.equal(G.verdictNameFor(G.parseArgs(['--split', 'training', '--tag', 'x']), false), 'grid-x-partial');
  assert.throws(() => G.parseArgs(['--fixed-vocab']), /need --tag/);
  assert.throws(() => G.parseArgs(['--repeat-of', 'bench/verdicts/grid-local-evaluation.json']), /need --tag/);
  assert.throws(() => G.parseArgs(['--tag', 'Bad_Tag']), /--tag is lower case/);
  assert.throws(() => G.parseArgs(['--library', '--fixed-vocab', '--tag', 'x']), /belong to the plain run/);
  // the paired files are checked before a single task runs
  assert.throws(() => G.checkPairedFiles(G.parseArgs(['--split', 'evaluation', '--tag', 'x', '--control', 'bench/verdicts/grid-local-evaluation.json'])), /not a control arm/);
  assert.throws(() => G.checkPairedFiles(G.parseArgs(['--split', 'evaluation', '--tag', 'x', '--repeat-of', 'bench/verdicts/grid-split-evaluation-control.json'])), /not a bar file/);
  assert.throws(() => G.checkPairedFiles(G.parseArgs(['--split', 'training', '--tag', 'x', '--control', 'bench/verdicts/grid-split-evaluation-control.json'])), /graded split evaluation/);
  assert.throws(() => G.checkPairedFiles(G.parseArgs(['--split', 'evaluation', '--tag', 'local-evaluation', '--repeat-of', 'bench/verdicts/grid-local-evaluation.json'])), /cannot write over the bar file/);
  G.checkPairedFiles(G.parseArgs(['--split', 'evaluation', '--tag', 'x', '--control', 'bench/verdicts/grid-split-evaluation-control.json', '--repeat-of', 'bench/verdicts/grid-local-evaluation.json']));
  const before = process.env.GRID_FIXED_VOCAB;
  process.env.GRID_FIXED_VOCAB = '1';
  try {
    await assert.rejects(G.runGridBench({ ...G.parseArgs(['--split', 'evaluation', '--tag', 'x']), quiet: true }), /does not carry it/);
  } finally {
    if (before === undefined) delete process.env.GRID_FIXED_VOCAB; else process.env.GRID_FIXED_VOCAB = before;
  }
});

test('Board 26: a training verdict with a split object still feeds the library, and an evaluation one is still refused', async () => {
  const G = await G26();
  const { corpusFromVerdict } = await import('../capability/grid-library.mjs');
  const v = await read26('grid.json');
  assert.equal(typeof v.split, 'object');
  assert.throws(() => corpusFromVerdict(v), /TRAINING split only/, 'the library alone refuses the object split (why corpusShape exists)');
  const rows = corpusFromVerdict(G.corpusShape(v));
  assert.equal(rows.length, v.rows.filter((r) => r.solved).length);
  const e = await read26('grid-local-evaluation.json');
  assert.throws(() => corpusFromVerdict(G.corpusShape(e)), /TRAINING split only/, 'control: the held out split never reaches a library');
  const old = { split: 'training', rows: [] };
  assert.equal(G.corpusShape(old), old);
});

test('Board 26: the fallback comment in capability/grid-search.mjs quotes only the line its named command printed', async () => {
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('../capability/grid-search.mjs', import.meta.url), 'utf8');
  const i = src.indexOf('THE FALLBACK PHASE (searchWithFallback)');
  assert.ok(i >= 0);
  const block = src.slice(i, src.indexOf('\n    let tried', i));
  assert.ok(!/\b169\b|\b171\b/.test(block), 'the variants no command reproduces are back: ' + block);
  const m = block.match(/solved (\d+) of (\d+) = ([\d.]+) percent[\s\S]*?(bench\/verdicts\/[\w.-]+\.json)/);
  assert.ok(m, 'the comment names a printed line and its verdict file: ' + block);
  const v = await read26(m[4].slice('bench/verdicts/'.length));
  assert.deepEqual([Number(m[1]), Number(m[2]), Number(m[3])], [v.solved, v.n, v.pct]);
});
