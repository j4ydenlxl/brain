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
} from '../capability/grid-dsl.mjs';
import { searchGrid, gradeInCells, buildSearchBrain, runInCells, taskFromArc } from '../capability/grid-search.mjs';
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
