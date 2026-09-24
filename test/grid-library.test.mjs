// test/grid-library.test.mjs: library learning for the grid search (capability/grid-library.mjs),
// the macros it registers in capability/grid-dsl.mjs, and the two options it gave
// capability/grid-search.mjs (a library, and two attempts).
//
// What these tests hold the code to: a macro is extracted only when it recurs and compresses; a
// macro runs exactly as its composition, in the pure function AND in a grid.dsl cell; the learned
// order follows a known frequency and returns to the hand costs as the prior grows; the search
// with a library still solves every fixture task the search without one solved; the library
// refuses to learn from the evaluation split; and two attempts give two different answers.
// No model is called and nothing listens: every test is pure computation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRIMS, LEARNERS, fromRows, toRows, applyStep, byName, defineMacro, isMacro, expandName, P, sameGrid } from '../capability/grid-dsl.mjs';
import { searchGrid, solveArcTask, taskFromArc, runInCells, buildSearchBrain } from '../capability/grid-search.mjs';
import { learnLibrary, buildSearchLibrary, corpusFromVerdict, mergeCorpora, segment, splitProgram, macrosUsed } from '../capability/grid-library.mjs';

const G = fromRows;

test('macro extraction on three toy programs: the recurring chain is kept, a one-off chain is not', () => {
  const corpus = [
    { id: 't1', programs: [['rot90', 'fillEnclosed', 'flipH', 'colormap']] },
    { id: 't2', programs: [['rot90', 'fillEnclosed', 'flipH']] },
    { id: 't3', programs: [['cropBBox', 'rot90', 'fillEnclosed', 'flipH', 'localRule'], ['transpose', 'dedupeRows', 'localRule']] },
  ];
  const lib = learnLibrary(corpus, { topN: 8 });
  assert.equal(lib.macros.length, 1, 'one macro: ' + lib.macros.map((m) => m.name).join(', '));
  const m = lib.macros[0];
  assert.deepEqual(m.ops, ['rot90', 'fillEnclosed', 'flipH']);
  assert.equal(m.name, 'rot90+fillEnclosed+flipH');
  assert.equal(m.tasks, 2, 'task 3 has a shorter program (3 steps) that the macro does not shorten below');
  assert.equal(m.gross, 4, 'two steps saved on each of tasks 1 and 2');
  assert.equal(m.net, 1, 'four saved minus three to write the macro down');
  assert.equal(lib.stats.stepsBefore, 4 + 3 + 3);
  assert.equal(lib.stats.stepsAfter, 2 + 1 + 3);
  // the one-off chains (cropBBox then rot90, transpose then dedupeRows) recur nowhere
  assert.ok(!lib.macros.some((x) => x.ops.includes('cropBBox') || x.ops.includes('transpose')));
  // with the net floor lowered and the task floor raised the extraction obeys both
  assert.equal(learnLibrary(corpus, { minTasks: 3 }).macros.length, 0);
  // learners are never frozen into a macro, and learner counts order the learners
  assert.ok(lib.macros.every((x) => x.ops.every((op) => !LEARNERS.some((l) => l.name === op))));
  assert.deepEqual(lib.learnerOrder.slice(0, 2), ['colormap', 'localRule'].sort((a, b) => (lib.learnerCounts[b] || 0) - (lib.learnerCounts[a] || 0) || LEARNERS.findIndex((l) => l.name === a) - LEARNERS.findIndex((l) => l.name === b)));
});

test('segmentation takes the shortest cover, and names expand back to base words', () => {
  const macros = [{ name: 'rot90+fillEnclosed', ops: ['rot90', 'fillEnclosed'] }, { name: 'fillEnclosed+flipH', ops: ['fillEnclosed', 'flipH'] }];
  const s = segment(['rot90', 'fillEnclosed', 'flipH'], macros);
  assert.equal(s.len, 2, 'two covers of length 2 exist; either is shortest');
  assert.deepEqual(s.tokens.flatMap(expandName), ['rot90', 'fillEnclosed', 'flipH'], 'the cover expands back to the chain');
  assert.deepEqual(segment(['rot90', 'fillEnclosed', 'flipH', 'rot90', 'fillEnclosed'], macros).len, 3);
  assert.equal(segment(['cropBBox'], macros).len, 1);
  assert.deepEqual(splitProgram(['rot90+fillEnclosed', 'flipH', 'colormap']), { chain: ['rot90', 'fillEnclosed', 'flipH'], learner: 'colormap' });
  assert.equal(splitProgram(['colormap', 'flipH']), null, 'a learner is only ever the last step');
  assert.equal(splitProgram(['noSuchWord']), null);
  assert.deepEqual(expandName('keepRareColor+cropBBox'), ['keepRareColor', 'cropBBox']);
  assert.deepEqual(macrosUsed(['keepRareColor+cropBBox', 'colormap']), ['keepRareColor+cropBBox']);
});

test('a macro executes as its composition, as a pure function and as a grid.dsl cell', () => {
  const m = defineMacro(['rot90', 'fillEnclosed']);
  assert.equal(m.name, 'rot90+fillEnclosed');
  assert.ok(isMacro(m.name));
  assert.equal(byName(m.name), m);
  assert.equal(defineMacro(['rot90', 'fillEnclosed']), m, 'registering the same composition twice is one macro');
  assert.equal(m.from, 'grid');
  assert.equal(m.to, 'grid');
  assert.ok(!PRIMS.includes(m), 'a macro is not pushed onto the base vocabulary');
  const inputs = [
    G([[1, 1, 1, 0], [1, 0, 1, 0], [1, 1, 1, 2]]),
    G([[0, 3, 3, 3], [0, 3, 0, 3], [0, 3, 3, 3], [5, 0, 0, 0]]),
    G([[2, 0], [0, 2]]),
  ];
  for (const g of inputs) {
    const composed = applyStep({ op: 'fillEnclosed' }, applyStep({ op: 'rot90' }, g));
    const viaMacro = applyStep({ op: m.name }, g);
    assert.ok(sameGrid(viaMacro, composed), 'pure function');
    const cell = runInCells(buildSearchBrain(), [{ op: m.name }], g);
    assert.equal(cell.cells, 1, 'one grid.dsl cell');
    assert.ok(sameGrid(cell.value, composed), 'the grid.dsl cell emits the composition');
  }
  // an objects to grid macro types through
  const o = defineMacro(['objectsC4', 'largest', 'crop']);
  assert.equal(o.from, 'grid');
  assert.equal(o.to, 'grid');
  const g = G([[1, 1, 0, 0], [1, 1, 0, 2], [0, 0, 0, 0]]);
  assert.deepEqual(toRows(applyStep({ op: o.name }, g)), [[1, 1], [1, 1]]);
  assert.throws(() => defineMacro(['rot90', 'colormap']), /not a base primitive/);
  assert.throws(() => defineMacro(['largest', 'rot90']), /type check/);
  assert.throws(() => defineMacro(['rot90']), /two or more/);
});

test('the prior orders a known frequency, and returns to the hand costs as it grows', () => {
  const corpus = [];
  for (let i = 0; i < 5; i++) corpus.push({ id: 'f' + i, programs: [['flipH', 'localRule']] });
  corpus.push({ id: 'g0', programs: [['transpose', 'tileSym']] });
  corpus.push({ id: 'g1', programs: [['transpose', 'colormap']] });
  const lib = learnLibrary(corpus);
  // flipH, transpose and flipV all have hand cost 1; the data used flipH 5 times, transpose twice, flipV never
  assert.ok(lib.bits.flipH < lib.bits.transpose, 'flipH ' + lib.bits.flipH + ' transpose ' + lib.bits.transpose);
  assert.ok(lib.bits.transpose < lib.bits.flipV, 'transpose ' + lib.bits.transpose + ' flipV ' + lib.bits.flipV);
  assert.ok(lib.bits.flipV > byName('flipV').cost, 'an unused word pays for the data that never used it');
  const sl = buildSearchLibrary(lib);
  const at = (n) => sl.vocab.findIndex((e) => e.name === n);
  assert.ok(at('flipH') < at('transpose') && at('transpose') < at('flipV'), 'the search tries the likely words first');
  assert.equal(sl.slow[0].name, 'localRule', 'the most used learner is tried first');
  assert.equal(sl.fast[0].name, 'colormap');
  // with a huge prior strength the learned costs are the hand costs, quantised
  const flat = learnLibrary(corpus, { alpha: 1e12 });
  for (const p of PRIMS) assert.equal(flat.costs[p.name], p.cost * flat.params.scale, p.name);
});

test('the library refuses the evaluation split, and reads training verdicts of both shapes', () => {
  assert.throws(() => corpusFromVerdict({ split: 'evaluation', heldOut: true, rows: [] }), /TRAINING split only/);
  assert.throws(() => corpusFromVerdict({ split: 'training', heldOut: true, rows: [] }), /TRAINING split only/);
  const plain = corpusFromVerdict({ split: 'training', rows: [{ id: 'a', solved: true, names: ['flipH'] }, { id: 'b', solved: false, names: ['rot90'] }] });
  assert.deepEqual(plain, [{ id: 'a', programs: [['flipH']] }]);
  const arms = corpusFromVerdict({ split: 'training', rows: [{ id: 'a', arms: { x: { attempts: [{ names: ['rot90'] }, { names: ['flipH'] }], attemptRight: [false, true] } } }] });
  assert.deepEqual(arms, [{ id: 'a', programs: [['flipH']] }]);
  assert.deepEqual(mergeCorpora(plain, arms), [{ id: 'a', programs: [['flipH']] }]);
  const kept = corpusFromVerdict({ split: 'training', rows: [{ id: 'a', solved: true, names: ['flipH'] }, { id: 'c', solved: true, names: ['flipV'] }] }, { keep: (id) => id === 'c' });
  assert.deepEqual(kept, [{ id: 'c', programs: [['flipV']] }]);
});

// The fixture tasks of test/: the composed program of test/grid.test.mjs, and small tasks each
// solved by the search without a library. The search with a library must solve every one.
function composedTask() {
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
  return { train: ins.slice(0, 3).map((r) => ({ input: r, output: hidden(r) })), test: [{ input: ins[3], output: hidden(ins[3]) }] };
}
function oneStepTask(op, ins) {
  const f = (rows) => toRows(applyStep({ op }, fromRows(rows)));
  return { train: ins.slice(0, -1).map((r) => ({ input: r, output: f(r) })), test: [{ input: ins[ins.length - 1], output: f(ins[ins.length - 1]) }] };
}
const FIXTURES = [
  ['composed rot90, fillEnclosed, colour 4', composedTask()],
  ['gravity down (act/solve fixture)', { train: [
    { input: [[1, 0, 0], [0, 1, 0], [0, 0, 0]], output: [[0, 0, 0], [0, 0, 0], [1, 1, 0]] },
    { input: [[0, 2, 0], [0, 0, 0], [0, 0, 2]], output: [[0, 0, 0], [0, 0, 0], [0, 2, 2]] },
    { input: [[3, 0, 0], [3, 0, 0], [0, 3, 0]], output: [[0, 0, 0], [3, 0, 0], [3, 3, 0]] },
  ], test: [{ input: [[0, 1, 0], [1, 0, 0], [0, 0, 1]], output: [[0, 0, 0], [0, 0, 0], [1, 1, 1]] }] }],
  ['crop to the coloured cells', oneStepTask('cropBBox', [
    [[0, 0, 0, 0], [0, 1, 2, 0], [0, 3, 1, 0], [0, 0, 0, 0]],
    [[0, 0, 0], [0, 0, 5], [0, 6, 5]],
    [[7, 7, 0], [0, 7, 0], [0, 0, 0]],
    [[0, 0, 0, 0, 0], [0, 0, 4, 4, 0], [0, 0, 4, 1, 0], [0, 0, 0, 0, 0]],
  ])],
  ['mirror left to right', oneStepTask('flipH', [
    [[1, 2, 3], [4, 5, 6]],
    [[0, 7], [8, 0]],
    [[3, 3, 1], [2, 0, 0], [1, 1, 1]],
    [[5, 6, 7, 8], [0, 1, 2, 3]],
  ])],
];

test('the search with a library reproduces every previously solved fixture task in test/', () => {
  // a library learned from toy programs: one macro that is exactly the composed fixture's chain,
  // one that no fixture needs, and a prior that makes neither fixture word cheap
  const corpus = [
    { id: 'a', programs: [['rot90', 'fillEnclosed', 'colormap']] },
    { id: 'b', programs: [['rot90', 'fillEnclosed', 'localRule']] },
    { id: 'c', programs: [['rot90', 'fillEnclosed']] },
    { id: 'd', programs: [['keepRareColor', 'cropBBox']] },
    { id: 'e', programs: [['keepRareColor', 'cropBBox', 'colormap']] },
    { id: 'f', programs: [['keepRareColor', 'cropBBox', 'tileSym']] },
  ];
  const lib = learnLibrary(corpus);
  assert.deepEqual(lib.macros.map((m) => m.name).sort(), ['keepRareColor+cropBBox', 'rot90+fillEnclosed']);
  const library = buildSearchLibrary(lib);
  assert.equal(library.vocab.length, PRIMS.length + 2);
  for (const [name, json] of FIXTURES) {
    const base = solveArcTask(json, { budgetMs: 20000 });
    assert.equal(base.solved, true, name + ': the search without a library solves it');
    const withLib = solveArcTask(json, { budgetMs: 20000, library });
    assert.equal(withLib.solved, true, name + ': the search with the library solves it too, ' + (withLib.names || []).join(' > '));
    assert.deepEqual(withLib.outputs, base.outputs, name + ': the same answer');
  }
  // the portfolio clock (hand ordered search first, then the learned one) solves them all too
  const portfolio = { ...library, share: 0.5 };
  for (const [name, json] of FIXTURES) {
    const r = solveArcTask(json, { budgetMs: 4000, library: portfolio, attempts: 2 });
    assert.equal(r.solved, true, name + ': the portfolio solves it');
    assert.equal(r.attempts[0].phase, 'hand', name + ': the first answer comes from the hand ordered phase');
  }
  // and the composed fixture is found through the macro, as grid.dsl cells, one step shorter
  // (the learned phase alone, share 0: the portfolio's hand phase would answer first without it)
  const r = searchGrid(taskFromArc(composedTask()), { budgetMs: 20000, library: { ...library, share: 0 } });
  assert.equal(r.status, 'found');
  assert.ok(r.names.includes('rot90+fillEnclosed'), r.names.join(' > '));
  assert.equal(r.depth, 2);
  assert.ok(r.cells > 0);
});

test('the portfolio hands its search over: an identity library reproduces the base program, and no state is expanded twice', () => {
  // an identity library: the hand costs times four (the learned costs' quanta), no macros, the
  // learners in the base order, and a hand phase of 100 ms, about a third of what the base search needs
  const identity = {
    vocab: PRIMS.map((p) => ({ ...p, cost: p.cost * 4 })),
    fast: LEARNERS.filter((l) => l.name === 'colormap'),
    slow: LEARNERS.filter((l) => l.name !== 'colormap'),
    macros: [],
    share: 0.995,
  };
  const task = taskFromArc(composedTask());
  const base = searchGrid(task, { budgetMs: 20000 });
  const port = searchGrid(task, { budgetMs: 20000, library: identity });
  assert.equal(base.status, 'found');
  assert.equal(port.status, 'found');
  assert.ok(port.phases && port.phases.learned > 0, 'the learned phase ran');
  assert.equal(port.attempts[0].phase, 'learned');
  assert.deepEqual(port.names, base.names, 'the same program, in the same order of search');
  const pops = (arr, d) => (arr && arr[d]) || 0;
  assert.equal(pops(port.poppedHand, 0), 1, 'the hand phase expanded the root and handed it over');
  assert.equal(pops(port.popped, 0), 0, 'the learned phase did not start over from the root');
  for (let d = 0; d < Math.max(base.popped.length, port.popped.length); d++) {
    assert.equal(pops(port.poppedHand, d) + pops(port.popped, d), pops(base.popped, d), 'depth ' + d + ': the two phases expand exactly the states the base search expands');
  }
  assert.equal(port.poppedMacrosOnly, 0, 'no macros, so nothing is re-expanded for macro children');
  assert.equal(port.handoff, undefined, 'the handoff never leaves the search');
  // with a macro, the expanded states come back for their macro children only
  const lib = learnLibrary([
    { id: 'a', programs: [['rot90', 'fillEnclosed', 'colormap']] },
    { id: 'b', programs: [['rot90', 'fillEnclosed', 'localRule']] },
    { id: 'c', programs: [['rot90', 'fillEnclosed', 'flipH']] },
  ], { topN: 4 });
  const withMacro = { ...buildSearchLibrary(lib), share: 0.995 };
  assert.ok(withMacro.macros.includes('rot90+fillEnclosed'));
  const m = searchGrid(task, { budgetMs: 20000, library: withMacro });
  assert.equal(m.status, 'found');
  assert.ok(m.poppedMacrosOnly >= 1, 'the states the hand phase expanded came back for their macro children');
});

test('two attempts: a second, different answer is found on the same clock, and ARC scoring counts either', () => {
  // one train pair a mirror and a half turn both explain; the test output is the mirror
  const json = {
    train: [{ input: [[1, 2]], output: [[2, 1]] }, { input: [[3, 5]], output: [[5, 3]] }],
    test: [{ input: [[1, 2], [3, 5]], output: [[2, 1], [5, 3]] }],
  };
  const one = solveArcTask(json, { budgetMs: 5000 });
  const two = solveArcTask(json, { budgetMs: 5000, attempts: 2 });
  assert.equal(one.attempts.length, 1);
  assert.equal(two.attempts.length, 2, 'a second attempt was found');
  assert.deepEqual(two.attempts[0].names, one.attempts[0].names, 'attempt 1 is the one attempt search');
  const s = searchGrid(taskFromArc(json), { budgetMs: 5000, attempts: 2 });
  assert.ok(!sameGrid(s.attempts[0].outputs[0], s.attempts[1].outputs[0]), 'the two attempts answer differently');
  assert.equal(two.solvedFirst, one.solved, 'solvedFirst is the one attempt score');
  assert.equal(two.solved, two.attemptRight.some(Boolean), 'solved within two attempts when either attempt is right');
  assert.ok(two.solved, 'the mirror is one of the two answers: ' + two.attempts.map((a) => a.names.join(' > ')).join(' | '));
  // without the option the search is the one that was measured: one attempt, same program
  const plain = searchGrid(taskFromArc(json), { budgetMs: 5000 });
  assert.deepEqual(plain.names, s.names);
  assert.equal(plain.attempts.length, 1);
});
