// test/grid-vocab.test.mjs: Board 34, item arc-vocab (docs/VISION.md order 4, the ARC-AGI-1 row).
// The words notes/grid-vocab.md added to capability/grid-dsl.mjs: thirteen late primitives (registered
// by name in LATE_PRIMS, kept out of PRIMS) and ten learners appended to FALLBACK_LEARNERS after
// cellRule (nine families and lateWord, the late words as a last step). Each one is run here on a
// hand-made grid (or hand-made train pairs) with the answer written out by hand; their types, arity and
// costs are checked against the tables below; the added learners answer on the task's input only and
// inside the clock; and bench/verdicts/grid-vocab.json must equal what test/grid-vocab-verdict.mjs
// computes from the journals it names.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import {
  PRIMS, LEARNERS, FALLBACK_LEARNERS, LATE_PRIMS, VOCABULARY_SIZE, byName, fromRows, toRows, applyStep, P,
} from '../capability/grid-dsl.mjs';
import { searchGrid, taskFromArc, solveArcTask } from '../capability/grid-search.mjs';
import { vocabularyMemory } from '../capability/grid-invent.mjs';
import { buildVerdict, BAR, solvedInClock } from './grid-vocab-verdict.mjs';

// the tables: name -> cost, as grid-dsl.mjs declares them
const LATE = {
  cropPeriod: 2, monochrome: 2, outlineDiag: 2, fillColorBoxes: 3, downAny2: 2, downAny3: 2, cropFrame: 2,
  cropCorners: 2, cropCornersPaint: 2, kronHalves: 3, pullToTop: 3, pullToRare: 3, padEdge: 3,
};
const ADDED_LEARNERS = {
  solidColor: 2, countOut: 2, extendPeriod: 2, pickObject: 2, partsPick: 2, partsOverlay: 2, cellsMap: 2, regionRecolor: 2, symComplete: 3, lateWord: 2,
};
const BEFORE = 196; // the vocabulary bench/verdicts/grid-attempts.json and grid-curve*.json were measured with (Board 33)

test('the counted vocabulary stays 196; the thirteen late words are by name, not in PRIMS; the learners come after cellRule', () => {
  const names = Object.keys(LATE);
  assert.deepEqual(LATE_PRIMS.map((p) => p.name), names, 'the late words in this order');
  for (const n of names) {
    assert.ok(byName(n), n + ' is registered by name');
    assert.ok(!PRIMS.some((p) => p.name === n), n + ' is not in PRIMS');
  }
  assert.ok(!PRIMS.some((p) => p.late), 'no late word in PRIMS');
  assert.equal(PRIMS.length + LEARNERS.length, BEFORE, 'nothing older moved or went away');
  assert.equal(VOCABULARY_SIZE, BEFORE);
  // capability/grid-invent.mjs mines and imagines over PRIMS: its memory is the base words, none late
  const mem = vocabularyMemory().map((m) => m.spec.op);
  assert.equal(mem.length, PRIMS.length);
  assert.ok(!mem.some((n) => n in LATE), 'the imagination memory holds no late word');
  assert.equal(FALLBACK_LEARNERS.length, 1 + Object.keys(ADDED_LEARNERS).length);
  assert.equal(FALLBACK_LEARNERS[0].name, 'cellRule', 'cellRule stays first');
  assert.deepEqual(FALLBACK_LEARNERS.slice(1).map((l) => l.name), Object.keys(ADDED_LEARNERS));
  for (const n of Object.keys(ADDED_LEARNERS)) assert.ok(!LEARNERS.some((L) => L.name === n), n + ' is not in LEARNERS');
});

test('type, arity and cost of every added word, as the tables state them', () => {
  for (const [n, cost] of Object.entries(LATE)) {
    const p = byName(n);
    assert.ok(p, n);
    assert.equal(p.from, 'grid', n); assert.equal(p.to, 'grid', n);
    assert.equal(p.cost, cost, n);
    assert.equal(p.apply.length, 1, n + ' takes one grid');
    assert.equal(p.learned, false, n);
    assert.equal(p.late, true, n);
    assert.equal(typeof p.doc, 'string', n);
    assert.ok(Object.isFrozen(p), n);
  }
  for (const [n, cost] of Object.entries(ADDED_LEARNERS)) {
    const l = byName(n);
    assert.ok(l, n);
    assert.equal(l.from, 'grid', n); assert.equal(l.to, 'grid', n);
    assert.equal(l.cost, cost, n);
    assert.equal(l.learn.length, 4, n + ' learns from states, wanted, tests, opts');
    assert.equal(l.apply.length, 2, n + ' applies to one grid with its learned parameters');
    assert.equal(l.learned, true, n); assert.equal(l.fallback, true, n); assert.equal(l.inputOnly, true, n);
    assert.equal(l.deferred, undefined, n + ' is not held back past the clock');
    assert.ok(Object.isFrozen(l), n);
  }
  assert.equal(byName('cellRule').inputOnly, undefined, 'cellRule still runs on every prefix');
});

const PRIM_CASES = [
  ['cropPeriod', [[1, 2, 1, 2, 1, 2], [3, 4, 3, 4, 3, 4], [1, 2, 1, 2, 1, 2], [3, 4, 3, 4, 3, 4]], [[1, 2], [3, 4]]],
  ['monochrome', [[1, 1, 2], [0, 3, 1]], [[1, 1, 1], [0, 1, 1]]],
  ['outlineDiag', [[0, 0, 0], [0, 1, 0], [0, 0, 0]], [[P, 0, P], [0, 1, 0], [P, 0, P]]],
  ['fillColorBoxes', [[2, 0, 2, 0], [0, 0, 0, 0], [2, 0, 0, 0], [0, 0, 0, 3]], [[2, 2, 2, 0], [2, 2, 2, 0], [2, 2, 2, 0], [0, 0, 0, 3]]],
  ['downAny2', [[1, 0, 0, 0], [0, 0, 0, 2], [0, 0, 0, 0], [0, 0, 3, 3]], [[1, 2], [0, 3]]],
  ['downAny3', [[0, 0, 0, 0, 0, 0], [0, 4, 0, 0, 0, 0], [0, 0, 0, 0, 0, 5], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [6, 0, 0, 0, 0, 0]], [[4, 5], [6, 0]]],
  ['cropFrame', [[0, 0, 0, 0, 0], [0, 5, 5, 5, 5], [0, 5, 1, 2, 5], [0, 5, 5, 5, 5]], [[1, 2]]],
  ['cropCorners', [[8, 0, 0, 8, 0], [0, 1, 2, 0, 0], [0, 3, 0, 0, 0], [8, 0, 0, 8, 0]], [[1, 2], [3, 0]]],
  ['cropCornersPaint', [[8, 0, 0, 8, 0], [0, 1, 2, 0, 0], [0, 3, 0, 0, 0], [8, 0, 0, 8, 0]], [[8, 8], [8, 0]]],
  ['kronHalves', [[8, 0, 1, 2], [0, 8, 0, 3]], [[1, 0, 2, 0], [0, 1, 0, 2], [0, 0, 3, 0], [0, 0, 0, 3]]],
  ['kronHalves', [[8, 0], [0, 8], [1, 2], [0, 3]], [[1, 0, 2, 0], [0, 1, 0, 2], [0, 0, 3, 0], [0, 0, 0, 3]]],
  ['pullToTop', [[2, 2, 0, 0, 0, 8]], [[2, 2, 8, 0, 0, 0]]],
  ['pullToRare', [[2, 2, 0, 0, 0, 8]], [[0, 0, 0, 2, 2, 8]]],
  ['padEdge', [[1, 2], [3, 4]], [[0, 1, 2, 0], [1, 1, 2, 2], [3, 3, 4, 4], [0, 3, 4, 0]]],
];
// grids each word must refuse (null), so a word that answers everything is caught
const PRIM_REFUSALS = [
  ['cropPeriod', [[1, 2], [3, 4]]],
  ['monochrome', [[1, 2], [0, 0]]],
  ['fillColorBoxes', [[1, 0, 2], [0, 0, 0], [2, 0, 1]]],
  ['downAny2', [[1, 2], [0, 0]]],
  ['downAny3', [[1, 0], [0, 0]]],
  ['cropFrame', [[1, 1], [1, 1]]],
  ['cropCorners', [[8, 8], [8, 8]]],
  ['kronHalves', [[1, 2, 3, 4], [5, 6, 7, 8]]],
  ['pullToRare', [[1, 1, 2, 2]]],
];

test('every late primitive on a hand-made grid', () => {
  for (const n of Object.keys(LATE)) assert.ok(PRIM_CASES.some(([m]) => m === n), n + ' has a case');
  for (const [n, input, want] of PRIM_CASES) {
    const out = byName(n).apply(fromRows(input));
    assert.ok(out, n + ' answered');
    assert.deepEqual(toRows(out), want, n);
    assert.deepEqual(toRows(applyStep({ op: n }, fromRows(input))), want, n + ' by name');
  }
  for (const [n, input] of PRIM_REFUSALS) assert.equal(byName(n).apply(fromRows(input)), null, n + ' refuses ' + JSON.stringify(input));
});

// each learner: hand-made train pairs, one test input, its answer; the learner must learn from the
// train pairs alone, answer the test exactly, and refuse the fallback's repeat pass (opts.maxK 3)
const LEARNER_CASES = {
  solidColor: {
    train: [[[[1, 1, 2], [3, 1, 4], [1, 5, 6]], [[1, 1, 1], [1, 1, 1], [1, 1, 1]]], [[[2, 2, 3], [2, 4, 5], [6, 2, 7]], [[2, 2, 2], [2, 2, 2], [2, 2, 2]]]],
    test: [[[4, 4, 4], [1, 2, 3], [4, 5, 6]], [[4, 4, 4], [4, 4, 4], [4, 4, 4]]],
  },
  countOut: {
    train: [[[[8, 0, 0, 0], [0, 0, 0, 0], [0, 0, 8, 8]], [[8, 0], [0, 8]]], [[[8, 0, 8, 0], [0, 0, 0, 0], [8, 0, 0, 0]], [[8, 0, 0], [0, 8, 0], [0, 0, 8]]]],
    test: [[[8, 0, 8, 0, 8], [0, 0, 0, 0, 0], [8, 0, 0, 0, 0]], [[8, 0, 0, 0], [0, 8, 0, 0], [0, 0, 8, 0], [0, 0, 0, 8]]],
  },
  extendPeriod: {
    train: [[[[1, 0], [0, 1], [1, 0], [0, 1]], [[2, 0], [0, 2], [2, 0], [0, 2], [2, 0], [0, 2]]], [[[0, 1], [1, 1], [0, 1], [1, 1]], [[0, 2], [2, 2], [0, 2], [2, 2], [0, 2], [2, 2]]]],
    test: [[[1, 1], [0, 0], [1, 1], [0, 0]], [[2, 2], [0, 0], [2, 2], [0, 0], [2, 2], [0, 0]]],
  },
  pickObject: {
    train: [[[[1, 0, 0, 0], [0, 0, 2, 2], [0, 0, 2, 2]], [[2, 2], [2, 2]]], [[[3, 3, 3], [0, 0, 0], [0, 4, 0]], [[3, 3, 3]]]],
    test: [[[5, 0, 6], [5, 0, 0], [5, 0, 0]], [[5], [5], [5]]],
  },
  partsPick: {
    train: [[[[1, 1, 5, 0, 2], [1, 0, 5, 0, 0]], [[1, 1], [1, 0]]], [[[0, 0, 5, 3, 3], [4, 0, 5, 3, 3]], [[3, 3], [3, 3]]]],
    test: [[[6, 6, 5, 7, 0], [6, 0, 5, 0, 0]], [[6, 6], [6, 0]]],
  },
  partsOverlay: {
    train: [[[[1, 0, 5, 2, 2], [0, 0, 5, 2, 0]], [[1, 2], [2, 0]]], [[[0, 3, 5, 4, 4], [3, 0, 5, 0, 4]], [[4, 3], [3, 4]]]],
    test: [[[6, 0, 5, 0, 7], [0, 0, 5, 7, 7]], [[6, 7], [7, 7]]],
  },
  cellsMap: {
    train: [
      [[[1, 0, 1, 5, 1, 0, 0], [0, 1, 0, 5, 0, 0, 1], [1, 0, 1, 5, 0, 1, 0]], [[2, 0]]],
      [[[1, 0, 0, 5, 1, 0, 1], [0, 0, 1, 5, 0, 1, 0], [0, 1, 0, 5, 1, 0, 1]], [[0, 2]]],
    ],
    test: [[[1, 0, 0, 5, 1, 0, 1, 5, 1, 0, 0], [0, 0, 1, 5, 0, 1, 0, 5, 0, 0, 1], [0, 1, 0, 5, 1, 0, 1, 5, 0, 1, 0]], [[0, 2, 0]]],
  },
  regionRecolor: {
    train: [
      [[[1, 1, 1, 1, 1, 1], [1, 0, 0, 1, 0, 1], [1, 0, 0, 1, 0, 1], [1, 1, 1, 1, 1, 1]], [[1, 1, 1, 1, 1, 1], [1, 2, 2, 1, 0, 1], [1, 2, 2, 1, 0, 1], [1, 1, 1, 1, 1, 1]]],
      [[[1, 1, 1, 1, 1], [1, 0, 1, 0, 1], [1, 1, 1, 0, 1], [1, 1, 1, 1, 1]], [[1, 1, 1, 1, 1], [1, 2, 1, 0, 1], [1, 1, 1, 0, 1], [1, 1, 1, 1, 1]]],
    ],
    test: [
      [[1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 1, 0, 1], [1, 0, 0, 0, 1, 1, 1], [1, 0, 0, 0, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1]],
      [[1, 1, 1, 1, 1, 1, 1], [1, 2, 2, 2, 1, 2, 1], [1, 2, 2, 2, 1, 1, 1], [1, 2, 2, 2, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1]],
    ],
  },
  symComplete: {
    train: [
      [[[1, 0, 0, 0, 1], [2, 0, 0, 0, 0], [0, 3, 0, 0, 0]], [[1, 0, 0, 0, 1], [2, 0, 0, 0, 2], [0, 3, 0, 3, 0]]],
      [[[0, 4, 0, 0, 0, 0, 0], [5, 0, 0, 0, 0, 0, 5], [0, 0, 6, 0, 0, 0, 0]], [[0, 4, 0, 0, 0, 4, 0], [5, 0, 0, 0, 0, 0, 5], [0, 0, 6, 0, 6, 0, 0]]],
    ],
    test: [[[7, 0, 0, 0, 7], [0, 8, 0, 0, 0]], [[7, 0, 0, 0, 7], [0, 8, 0, 8, 0]]],
  },
  // a late word alone: padEdge
  lateWord: {
    train: [[[[1, 2], [3, 4]], [[0, 1, 2, 0], [1, 1, 2, 2], [3, 3, 4, 4], [0, 3, 4, 0]]], [[[5, 0, 6]], [[0, 5, 0, 6, 0], [5, 5, 0, 6, 6], [0, 5, 0, 6, 0]]]],
    test: [[[7], [8]], [[0, 7, 0], [7, 7, 7], [8, 8, 8], [0, 8, 0]]],
    word: 'padEdge',
  },
};
// lateWord's other two forms: a late word then a colour map (the placeholder outlineDiag paints made
// colour 4), and a late word then one base word (downAny2 then flipH)
const LATE_FORMS = [
  {
    name: 'a late word then a colour map',
    train: [[[[0, 0, 0], [0, 1, 0], [0, 0, 0]], [[4, 0, 4], [0, 1, 0], [4, 0, 4]]], [[[0, 0, 0, 0], [0, 0, 2, 0], [0, 0, 0, 0]], [[0, 4, 0, 4], [0, 0, 2, 0], [0, 4, 0, 4]]]],
    test: [[[3, 0, 0], [0, 0, 0], [0, 0, 0]], [[3, 0, 0], [0, 4, 0], [0, 0, 0]]],
    want: (p) => p.word === 'outlineDiag' && p.map && !p.then,
  },
  {
    name: 'a late word then a base word',
    train: [[[[1, 0, 0, 0], [0, 0, 0, 2], [0, 0, 0, 0], [0, 0, 3, 0]], [[2, 1], [3, 0]]], [[[0, 4, 0, 0, 5, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 6, 0, 0], [0, 0, 0, 0, 0, 7]], [[5, 0, 4], [7, 6, 0]]]],
    test: [[[0, 0, 9, 0], [0, 8, 0, 0], [0, 0, 0, 0], [6, 0, 0, 0]], [[9, 8], [0, 6]]],
    want: (p) => p.word === 'downAny2' && p.then === 'flipH' && !p.map,
  },
];

const caseOf = (c) => ({ states: c.train.map(([i]) => fromRows(i)), wanted: c.train.map(([, o]) => fromRows(o)), tests: [fromRows(c.test[0])] });

test('every added fallback learner on hand-made train pairs', () => {
  for (const n of Object.keys(ADDED_LEARNERS)) {
    const c = LEARNER_CASES[n];
    assert.ok(c, n + ' has a case');
    const L = byName(n);
    const { states, wanted, tests } = caseOf(c);
    const params = L.learn(states, wanted, tests, { maxK: 2, deadline: performance.now() + 3000 });
    assert.ok(params, n + ' learned');
    if (c.word) assert.equal(params.word, c.word, n + ' learned the word');
    for (let d = 0; d < states.length; d++) assert.deepEqual(toRows(L.apply(states[d], params)), c.train[d][1], n + ' fits train pair ' + d);
    assert.deepEqual(toRows(L.apply(tests[0], params)), c.test[1], n + ' answers the test');
    assert.deepEqual(toRows(applyStep({ op: n, learned: params }, tests[0])), c.test[1], n + ' by name');
    assert.equal(L.learn(states, wanted, tests, { maxK: 3 }), null, n + ' refuses the repeat pass');
    // a task of another shape: the identity on the inputs of this case, which no added learner is for
    assert.equal(L.learn(states, states, tests, { maxK: 2 }), null, n + ' refuses the identity');
  }
});

test('lateWord: a late word then a colour map, and a late word then a base word', () => {
  const L = byName('lateWord');
  for (const f of LATE_FORMS) {
    const { states, wanted, tests } = caseOf(f);
    const params = L.learn(states, wanted, tests, { maxK: 2 });
    assert.ok(params && f.want(params), f.name + ': ' + JSON.stringify(params));
    for (let d = 0; d < states.length; d++) assert.deepEqual(toRows(applyStep({ op: 'lateWord', learned: params }, states[d])), f.train[d][1], f.name + ' train pair ' + d);
    assert.deepEqual(toRows(applyStep({ op: 'lateWord', learned: params }, tests[0])), f.test[1], f.name + ' answers the test');
  }
  // its apply runs late words only, and a base word only as the second step
  const g = fromRows([[1, 2], [3, 4]]);
  assert.equal(L.apply(g, { word: 'flipH' }), null, 'a base word is not a late word');
  assert.equal(L.apply(g, { word: 'padEdge', then: 'cropFrame' }), null, 'a late word is not a second step');
});

test('an added learner answers on the task\'s input only: other states for the same wanted outputs are refused', () => {
  for (const n of Object.keys(ADDED_LEARNERS)) {
    const L = byName(n);
    const { states, wanted, tests } = caseOf(LEARNER_CASES[n]);
    assert.ok(L.learn(states, wanted, tests, { maxK: 2 }), n + ' answers the first states it meets');
    assert.equal(L.learn(states.slice(), wanted, tests, { maxK: 2 }), null, n + ' refuses a second states array (a depth 1 prefix) for the same wanted');
    assert.ok(L.learn(states, wanted, tests, { maxK: 2 }), n + ' still answers the first states');
  }
  // cellRule is untouched: it answers any states array
  const cr = byName('cellRule');
  const inp = [fromRows([[1, 0], [0, 1]]), fromRows([[0, 1], [1, 0]])], out = [fromRows([[2, 0], [0, 2]]), fromRows([[0, 2], [2, 0]])];
  const te = [fromRows([[1, 1], [0, 0]])];
  assert.ok(cr.learn(inp, out, te, { maxK: 2 }));
  assert.ok(cr.learn(inp.slice(), out, te, { maxK: 2 }), 'cellRule answers a second states array');
});

test('through the search: an added learner answers in the fallback phase, on the input, inside the clock', () => {
  const budgetMs = 1200;
  for (const n of ['countOut', 'lateWord']) {
    const c = LEARNER_CASES[n];
    const json = { train: c.train.map(([input, output]) => ({ input, output })), test: [{ input: c.test[0] }] };
    const r = searchGrid(taskFromArc(json), { budgetMs, attempts: 2 });
    const hit = r.attempts.find((a) => a.names.join('>') === n);
    assert.ok(hit, n + ': ' + JSON.stringify(r.attempts.map((a) => a.names)));
    assert.equal(hit.phase, 'fallback', n);
    assert.deepEqual(hit.names, [n], n + ' on the input: no prefix before it');
    assert.deepEqual(toRows(hit.outputs[0]), c.test[1], n);
    assert.ok(hit.ms <= budgetMs, n + ' taken inside the clock: ' + hit.ms + ' ms');
    for (const a of r.attempts) assert.ok(a.ms <= budgetMs, 'every attempt inside the clock: ' + a.ms + ' ms');
  }
  // an answer the search finds early is taken before any added learner, and the fallback never runs
  const easy = { train: [{ input: [[1, 2, 3]], output: [[3, 2, 1]] }, { input: [[4, 0], [5, 6]], output: [[0, 4], [6, 5]] }], test: [{ input: [[7, 8]] }] };
  const e = searchGrid(taskFromArc(easy), { budgetMs: 1200, attempts: 1 });
  assert.equal(e.phases.fallback, 0);
  assert.ok(!e.names.some((n) => n in ADDED_LEARNERS), e.names.join(' > '));
});

test('through the search: a late word then a base word, graded by cells, answers the test', () => {
  const f = LATE_FORMS[1];
  const task = { train: f.train.map(([input, output]) => ({ input, output })), test: [{ input: f.test[0], output: f.test[1] }] };
  const r = solveArcTask(task, { budgetMs: 1500, maxDepth: 4, attempts: 2 });
  assert.equal(r.solved, true, JSON.stringify(r.attempts && r.attempts.map((a) => a.names)));
  const k = r.attemptRight.indexOf(true);
  assert.ok(r.attempts[k].ms <= 1500, 'inside the clock: ' + r.attempts[k].ms);
});

const VERDICT = new URL('../bench/verdicts/grid-vocab.json', import.meta.url);
test('bench/verdicts/grid-vocab.json is what test/grid-vocab-verdict.mjs computes from its journals, and its bar is computed as stated', () => {
  assert.ok(existsSync(VERDICT), 'bench/verdicts/grid-vocab.json exists');
  const v = JSON.parse(readFileSync(VERDICT, 'utf8'));
  for (const k of ['at', 'command', 'node', 'isTheBar', 'barMet', 'split', 'vocabulary', 'families', 'control', 'evaluation', 'controlArm', 'statement']) assert.ok(k in v, k);
  assert.equal(typeof v.isTheBar, 'boolean'); assert.equal(typeof v.barMet, 'boolean');
  assert.ok(!Number.isNaN(Date.parse(v.at)));
  assert.equal(v.command, 'node test/grid-vocab-verdict.mjs');
  assert.equal(typeof v.split, 'object');
  assert.equal(typeof v.split.heldOutFile.sha256, 'string');
  // recomputed from the same journals: every number the verdict carries
  const re = buildVerdict();
  for (const k of ['isTheBar', 'barMet', 'contaminated', 'vocabulary', 'families', 'control', 'evaluation', 'controlArm', 'statement', 'notTheBarBecause']) assert.deepEqual(v[k], re[k], k);
  assert.equal(v.vocabulary.before, BEFORE);
  assert.equal(v.vocabulary.after, VOCABULARY_SIZE);
  assert.deepEqual(v.vocabulary.latePrimitives.added, Object.keys(LATE));
  assert.equal(v.vocabulary.latePrimitives.inPrims, 0);
  assert.deepEqual(v.vocabulary.fallbackLearners.added, Object.keys(ADDED_LEARNERS));
  const words = new Set([...Object.keys(LATE), ...Object.keys(ADDED_LEARNERS)]);
  const used = new Set(['lateWord']); // lateWord is the path to the late words, not a family of its own
  assert.ok(Array.isArray(v.families) && v.families.length >= 10);
  for (const f of v.families) {
    assert.equal(typeof f.name, 'string');
    assert.ok(f.taskIds.length && f.taskIds.every((id) => /^[0-9a-f]{8}$/.test(id)), f.name);
    assert.ok(f.words.length && f.words.every((p) => words.has(p)), f.name);
    f.words.forEach((p) => used.add(p));
  }
  assert.equal(used.size, words.size, 'every added word belongs to a family');
  const pairSide = (s, before, n) => {
    assert.equal(s.before, before);
    assert.equal(s.n, n);
    assert.ok(Number.isInteger(s.after) && s.after >= 0 && s.after <= s.afterBench, 'in clock is at most the bench count');
    assert.ok(Array.isArray(s.gained) && Array.isArray(s.lost));
    assert.equal(s.after - s.before, s.gained.length - s.lost.length, 'the paired ids account for the change');
  };
  pairSide(v.control, BAR.controlBefore, 100);
  assert.equal(v.control.split, 'training');
  pairSide(v.evaluation, BAR.evaluationBefore, 400);
  for (const k of ['timedOut', 'foundButWrong', 'exhausted', 'meanMs', 'wallSeconds']) assert.equal(typeof v.evaluation[k], 'number', k);
  assert.equal(v.evaluation.afterBench + v.evaluation.timedOut + v.evaluation.foundButWrong + v.evaluation.exhausted + (v.evaluation.errors || 0), 400);
  const met = v.isTheBar && v.evaluation.after >= BAR.minSolved && v.evaluation.lost.length <= BAR.maxLost && v.control.lost.length <= BAR.maxControlLost;
  assert.equal(v.barMet, met);
  if (v.contaminated) assert.match(v.statement, /contaminat/i);
});

test('solvedInClock: a right attempt stamped past the clock does not count', () => {
  assert.equal(solvedInClock({ solved: true, attempts: [{ ms: 2999 }], attemptRight: [true] }, 3000), true);
  assert.equal(solvedInClock({ solved: true, attempts: [{ ms: 3001.54 }], attemptRight: [true] }, 3000), false);
  assert.equal(solvedInClock({ solved: true, attempts: [{ ms: 10 }, { ms: 3008 }], attemptRight: [false, true] }, 3000), false);
  assert.equal(solvedInClock({ solved: false, attempts: [{ ms: 10 }], attemptRight: [false] }, 3000), false);
});

test('the clock binds the take: with a 0 ms budget an answer the search finds at once is refused, never stamped past the clock', () => {
  const easy = { train: [{ input: [[1, 2, 3]], output: [[3, 2, 1]] }, { input: [[4, 0], [5, 6]], output: [[0, 4], [6, 5]] }], test: [{ input: [[7, 8]] }] };
  const late = searchGrid(taskFromArc(easy), { budgetMs: 0 });
  assert.notEqual(late.status, 'found', 'nothing is taken after the clock: ' + late.status);
  assert.deepEqual(late.attempts, [], 'no attempt is stamped past a 0 ms clock');
  const ok = searchGrid(taskFromArc(easy), { budgetMs: 1200 });
  assert.equal(ok.status, 'found');
  for (const a of ok.attempts) assert.ok(a.ms <= 1200, 'taken inside the clock: ' + a.ms + ' ms');
});
