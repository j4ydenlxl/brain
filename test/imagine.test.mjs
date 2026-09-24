// test/imagine.test.mjs: mind/imagine.mjs and capability/grid-invent.mjs, the five things the
// imagine item must show: a candidate inside memory is not novel, a recombination the null
// reaches is not imagination, a planted timeout is solved by an invented primitive, an objective
// carries a suite, a bar and a control, and nothing enters the vocabulary without a held out pass.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { propose, keep, noveltyOf, memoryIndex, objectiveSpace, rulerComplete, IMAGINE_KIND } from '../mind/imagine.mjs';
import * as G from '../capability/grid-invent.mjs';
import { Gate } from '../core/gate.mjs';
import { Ledger } from '../core/ledger.mjs';
import * as BENCH from '../bench/imagine.mjs';
import { LEARNERS } from '../capability/grid-dsl.mjs';
const { objectiveTemplates } = BENCH;

const newGate = () => new Gate({ ledger: new Ledger({ ring: 256 }) });
const FLIP = { k: 'each', mode: 'c8', f: { k: 'op', op: 'flipH' } };

// a planted task: every object is mirrored left to right inside its own box. No base word does
// this (the base vocabulary flips whole grids and selects objects, it never maps over them).
const A = [[1, 0], [1, 0], [1, 1]];
const B = [[1, 1, 1], [1, 0, 0]];
const C = [[1, 1], [0, 1], [0, 1]];
const flip = (s) => s.map((row) => row.slice().reverse());
function scene(parts, mirrored) {
  const g = Array.from({ length: 10 }, () => new Array(10).fill(0));
  for (const [shape, color, r, c] of parts) {
    const s = mirrored ? flip(shape) : shape;
    s.forEach((row, y) => row.forEach((v, x) => { if (v) g[r + y][c + x] = color; }));
  }
  return g;
}
const pair = (parts) => ({ input: scene(parts, false), output: scene(parts, true) });
const PLANTED = {
  train: [
    pair([[A, 1, 1, 1], [B, 2, 5, 4]]),
    pair([[B, 3, 0, 6], [A, 4, 6, 1]]),
    pair([[C, 6, 2, 3], [A, 7, 6, 6]]),
  ],
  test: [pair([[C, 8, 1, 1], [B, 9, 6, 5]])],
};

test('a candidate inside memory is rejected as not novel', () => {
  const memory = G.vocabularyMemory().concat([{ spec: { k: 'chain', ops: ['rot90', 'flipH'] } }]);
  const space = G.dslSpace();
  const mem = memoryIndex(space, memory);
  const inside = noveltyOf(space, { spec: { k: 'chain', ops: ['rot90', 'flipH'] } }, mem);
  assert.equal(inside.inMemory, true);
  assert.equal(inside.distance, 0);
  const outside = noveltyOf(space, { spec: FLIP }, mem);
  assert.equal(outside.inMemory, false);
  assert.ok(outside.distance > 0.15, 'a lifted word sits away from every stored word, distance ' + outside.distance);

  // through propose(): an operator that hands back a stored word is counted and dropped; the
  // control operator in the same call proves the path can return something
  const probe = { ...G.dslSpace(), operators: [
    { name: 'copy', make: () => ({ spec: { k: 'chain', ops: ['rot90', 'flipH'] } }) },
    { name: 'lift', make: () => ({ spec: FLIP }) },
  ] };
  const r = propose({ space: probe, memory, seed: 'test-memory' }, 2);
  assert.equal(r.rejected.inMemory, 1);
  assert.deepEqual(r.candidates.map((c) => c.key), ['each.c8(flipH)']);
  assert.ok(r.candidates[0].novelty >= r.floor);

  // an exact title in the knowledge store is memory too, when a store is present
  const knowledge = { titleLookup: (t) => (t === G.specTitle(FLIP) ? [7] : []) };
  const k = propose({ space: probe, memory, seed: 'test-memory', knowledge }, 2);
  assert.equal(k.rejected.inKnowledge, 1);
  assert.equal(k.candidates.length, 0);
  assert.equal(k.knowledgeChecked, true);

  // and a word within the floor of memory is not far enough to count
  const near = propose({ space: probe, memory, seed: 'test-memory', floor: 0.99 }, 2);
  assert.equal(near.rejected.nearMemory, 1);
  assert.equal(near.candidates.length, 0);
});

test('a recombination the null reaches is rejected', () => {
  const memory = [{ s: 'p' }];
  const space = {
    type: 'primitive',
    key: (c) => c.s,
    words: (c) => c.s.split(/[|.]/),
    title: (c) => c.s,
    valid: (c) => !!c && typeof c.s === 'string',
    random: () => null,
    recombine: (a, b) => ({ s: a.s + '|' + b.s }),
    operators: [
      { name: 'splice', make: () => ({ s: 'p|p' }) },          // exactly what recombining memory makes
      { name: 'invent', make: () => ({ s: 'quartz.lattice' }) }, // the control: nothing reaches it
    ],
  };
  const r = propose({ space, memory, seed: 'test-null' }, 4);
  assert.ok(r.null.reached >= 1, 'the null reached ' + r.null.reached);
  assert.equal(r.null.draws, 8, 'the null makes as many random draws AND as many recombinations as the imagination draws');
  assert.ok(r.rejected.inNull >= 1, 'inNull ' + r.rejected.inNull);
  assert.deepEqual(r.candidates.map((c) => c.key), ['quartz.lattice']);

  // the grid null: random compositions and recombinations of memory are plain chains, distinct,
  // never a single base word, and as many as asked for
  const lib = G.nullLibrary(40, G.vocabularyMemory().concat([{ spec: { k: 'chain', ops: ['rot90', 'flipH', 'transpose'] } }]), 'test-null');
  assert.equal(lib.length, 40);
  assert.equal(new Set(lib.map((w) => w.key)).size, 40);
  assert.ok(lib.every((w) => w.spec.k === 'chain' && w.spec.ops.length >= 2 && G.isGridWord(w.spec)));
});

test('a planted timeout task is solved by an invented primitive', () => {
  // the fixed vocabulary runs out of clock on it
  const base = G.solveWith(PLANTED, [], { budgetMs: 400 });
  assert.equal(base.solved, false);
  assert.equal(base.status, 'timeout');

  // the imagination, from the base vocabulary alone, invents a library; the screen admits
  // from it on the train pairs and test inputs; the search solves with an invented word
  const { words, report } = G.imagineWords({ memory: G.vocabularyMemory(), budget: 800, seed: 'test-planted' });
  assert.ok(words.length > 100, 'imagined ' + words.length);
  assert.equal(report.rejected.inMemory + report.rejected.inNull + report.rejected.nearMemory + report.rejected.invalid + report.rejected.duplicate + words.length, report.draws);
  const task = G.arcTask(PLANTED);
  const adm = G.admitFor(words, task, 16);
  assert.equal(adm.admitted.length, 16);
  const r = G.solveWith(PLANTED, adm.admitted.map((w) => G.asPrimitive(w)), { budgetMs: 3000 });
  assert.equal(r.solved, true, 'status ' + r.status + ' names ' + JSON.stringify(r.names));
  assert.ok(r.used.length >= 1, 'the program uses an invented word: ' + JSON.stringify(r.names));
  const byKey = new Map(words.map((w) => [w.key, w]));
  for (const key of r.used) assert.ok(byKey.has(key), key + ' came from the imagination');

  // and it is kept: a held out solve with its novelty, through the gate
  const vocab = new G.InventedVocabulary({ gate: newGate() });
  const w = byKey.get(r.used[0]);
  const [scored] = G.noveltyAgainst([{ ...w }], []);
  const p = vocab.submit(w, { solved: ['planted'], novelty: scored.novelty0 });
  assert.equal(p.status, 'approved');
  assert.equal(vocab.size, 1);
  assert.deepEqual(vocab.list()[0].solved, ['planted']);
  assert.ok(vocab.list()[0].novelty > 0);
});

test('an objective carries a suite, a bar and a control', () => {
  const cfg = { budgetMs: 3000 };
  const facts = {
    templates: objectiveTemplates(cfg),
    items: [
      { kind: 'arms', n: 236, invented: 3, null: 1, budgetMs: 3000 },
      { kind: 'screen', admit: 32, invented: 3, null: 1 },
      { kind: 'kept', key: 'each.c8(flipH)' },
      { kind: 'operator', name: 'lift.object', words: 200, solved: 2 },
      { kind: 'shape', name: 'smaller', n: 50, invented: 0, null: 0 },
    ],
    memory: [],
  };
  const r = propose({ space: objectiveSpace(facts), memory: [], seed: 'test-objectives', floor: 0.02 }, 12);
  assert.ok(r.candidates.length >= 6, 'proposed ' + r.candidates.length);
  assert.equal(new Set(r.candidates.map((c) => c.template)).size, 6, 'every template spoke');
  const gate = newGate();
  for (const c of r.candidates) {
    assert.equal(c.type, 'objective');
    assert.ok(c.hypothesis.length > 20);
    assert.ok(c.ruler.suite.startsWith('node bench/'), c.ruler.suite);
    assert.ok(c.ruler.bar.metric && c.ruler.bar.op && c.ruler.bar.value !== undefined, JSON.stringify(c.ruler.bar));
    assert.ok(/null arm/.test(c.ruler.control), c.ruler.control);
    assert.equal(rulerComplete(c.ruler), true);
    assert.equal(keep(c, {}, { gate }).status, 'approved');
  }
  // the screen objective states the lead and bars the lead, as the budget one does
  const sc = r.candidates.find((c) => c.template === 'screen');
  assert.match(sc.hypothesis, /ahead of the null by more than the 2 it leads by at 32/);
  assert.deepEqual(sc.ruler.bar, { metric: 'solved with invented primitives minus solved by the null arm', op: '>', value: 2 });
  // a wish without a control, or without a suite, is not an objective
  const noControl = { type: 'objective', key: 'o1', hypothesis: 'more is better', ruler: { suite: 'node bench/imagine.mjs', bar: { metric: 'solved', op: '>', value: 0 } } };
  const noSuite = { type: 'objective', key: 'o2', hypothesis: 'more is better', ruler: { bar: { metric: 'solved', op: '>', value: 0 }, control: 'the null arm' } };
  assert.equal(keep(noControl, {}, { gate }).status, 'rejected');
  assert.equal(keep(noSuite, {}, { gate }).status, 'rejected');
  // an objective already stored is memory: proposing again from the same facts writes nothing new
  const again = propose({ space: objectiveSpace({ ...facts, memory: r.candidates }), memory: r.candidates, seed: 'test-objectives', floor: 0.02 }, 12);
  assert.equal(again.candidates.length, 0);
  assert.equal(again.rejected.inMemory, 12 - again.rejected.invalid - again.rejected.duplicate);
});

test('the combinators compute what their keys say', () => {
  const g = G.arcTask({ train: [{ input: [[1, 1, 0, 0, 0], [1, 0, 0, 2, 0], [0, 0, 0, 2, 2], [3, 0, 0, 0, 0]], output: [[0]] }], test: [] }).train[0].input;
  const rows = (x) => (x ? Array.from({ length: x.h }, (_, y) => Array.from(x.cells.subarray(y * x.w, y * x.w + x.w)).join('')).join('/') : null);
  // every object mirrored in its own box; the grid mirrored whole would move them
  assert.equal(rows(G.runSpec(FLIP, g)), '11000/01002/00022/30000');
  // under: the input's own cells win, the inner word only paints background
  assert.equal(rows(G.runSpec({ k: 'both', how: 'under', f: null, g: { k: 'op', op: 'rot180' } }, g)), '11003/12020/02022/30011');
  // overlay: the inner word's cells win
  assert.equal(rows(G.runSpec({ k: 'both', how: 'overlay', f: null, g: { k: 'op', op: 'rot180' } }, g)), '11003/22020/02021/30011');
  // select then transform: only the objects the base selector picks change, the rest stay put
  assert.equal(rows(G.runSpec({ k: 'sel', mode: 'c8', pick: 'smallest', f: { k: 'op', op: 'flipH' } }, g)), rows(g), 'a one cell object mirrored in its own box is itself');
  assert.equal(rows(G.runSpec({ k: 'sel', mode: 'c8', pick: 'smallest', f: { k: 'op', op: 'invert' } }, g)), '11000/10020/00022/00000', 'inverted, the one cell object becomes background and is gone');
  assert.equal(rows(G.runSpec({ k: 'sel', mode: 'c8', pick: 'topmost', f: { k: 'op', op: 'flipH' } }, g)), '11000/01020/00022/30000');
  assert.equal(G.runSpec({ k: 'sel', mode: 'c8', pick: 'largest', f: { k: 'op', op: 'flipH' } }, g), null, 'two objects tie for largest: the base selector refuses, so does the word');
  assert.equal(G.specKey({ k: 'sel', mode: 'c4', pick: 'withHole', f: { k: 'fix', f: { k: 'op', op: 'flipH' } } }), 'sel.c4.withHole(fix(flipH))');
  assert.equal(G.isGridWord({ k: 'sel', mode: 'c8', pick: 'render', f: { k: 'op', op: 'flipH' } }), false, 'a selector must map objects to objects');
  // a fixed point stops where the word stops changing the grid
  const drop = G.runSpec({ k: 'fix', f: { k: 'op', op: 'gravityDown' } }, g);
  assert.ok(drop && G.runSpec({ k: 'op', op: 'gravityDown' }, drop) && rows(G.runSpec({ k: 'op', op: 'gravityDown' }, drop)) === rows(drop));
  // the second round of imagination only returns words that nest a first round word
  const { words, report } = G.imagineWords({ memory: G.vocabularyMemory(), budget: 120, seed: 'test-rounds', rounds: 2 });
  assert.equal(report.rounds.length, 2);
  const first = new Set(words.filter((w) => w.round === 1).map((w) => w.key));
  const second = words.filter((w) => w.round === 2);
  assert.ok(second.length > 0, 'round 2 returned ' + second.length);
  assert.ok(second.every((w) => !first.has(w.key)), 'round 2 is outside round 1');
  assert.ok(second.some((w) => [...first].some((k) => w.key.includes(k))), 'round 2 nests round 1 words');
});

test('nothing enters the vocabulary without a held out pass', () => {
  const gate = newGate();
  const vocab = new G.InventedVocabulary({ gate });
  const w = { key: G.specKey(FLIP), spec: FLIP, source: 'timeout', sources: ['taskA'] };
  assert.equal(vocab.submit(w, { solved: [], novelty: 0.3 }).status, 'rejected', 'solved nothing');
  assert.equal(vocab.submit(w, { solved: ['taskA'], novelty: 0.3 }).status, 'rejected', 'solved only the task it came from');
  assert.equal(vocab.submit(w, { solved: ['taskB'], novelty: 0 }).status, 'rejected', 'no novelty distance');
  assert.equal(vocab.size, 0);
  assert.equal(vocab.refused, 3);
  assert.equal(vocab.has(w.key), false);
  assert.equal(vocab.primitives().length, 0, 'the search is offered nothing that was refused');
  const p = vocab.submit(w, { solved: ['taskB', 'taskA'], novelty: 0.3 });
  assert.equal(p.status, 'approved');
  assert.equal(p.kind, IMAGINE_KIND);
  assert.equal(vocab.size, 1);
  assert.deepEqual(vocab.list()[0].solved, ['taskB'], 'the source task is never recorded as solved');
  assert.equal(vocab.list()[0].novelty, 0.3);
  assert.equal(vocab.primitives().length, 1);

  // a proposal that did not come from the imagination is refused whatever it claims
  const forged = gate.propose({ kind: IMAGINE_KIND, what: { key: 'x' }, evidence: { provenance: 'elsewhere', type: 'primitive', novelty: 0.5, solved: ['t'] }, by: 'test' });
  assert.equal(forged.status, 'rejected');
  // a code patch waits for the autopilot's verification
  const patch = G.patchFor({ key: 'chain(rot90,flipH)', spec: { k: 'chain', ops: ['rot90', 'flipH'] }, solved: ['taskB'] });
  assert.equal(patch.target, 'capability/grid-dsl.mjs');
  const held = keep({ type: 'patch', key: patch.key }, { ...patch, verified: false }, { gate });
  assert.equal(held.status, 'pending');
  assert.equal(G.patchFor({ key: 'each.c8(flipH)', spec: FLIP, solved: ['taskB'] }), null, 'only chains become patches');
});

test('an objective is graded only by a later run of its own suite', () => {
  const bar = 'node --max-old-space-size=4000 bench/imagine.mjs --split training --budget-ms 3000 --workers 2';
  const lead = { at: '2026-01-01T00:10:00.000Z', template: 'lead', hypothesis: 'imagined primitives solve more', ruler: { suite: 'node bench/imagine.mjs --split training --budget-ms 3000 --workers 2', bar: { metric: 'invented minus null', op: '>', value: 1 }, control: 'the null arm' } };
  const run = (startedAt, command, inv, nul, extra = {}) => ({ startedAt, at: startedAt, command, invented: { solved: inv, ids: [] }, null: { solved: nul, ids: [] }, ...extra });
  const before = run('2026-01-01T00:00:00.000Z', bar, 9, 0);         // the run the objective was read off
  const later = run('2026-01-01T00:20:00.000Z', bar, 5, 3);          // a lead of 2: met
  const seeded = run('2026-01-01T00:30:00.000Z', bar + ' --seed s2', 4, 4); // a repeat with another seed: not met
  const other = run('2026-01-01T00:40:00.000Z', bar.replace('3000', '6000'), 9, 0); // another suite
  const [g] = BENCH.gradeObjectives([lead], [before, later, seeded, other]);
  assert.equal(g.runs, 2, 'only the two later runs of the same suite grade it');
  assert.deepEqual(g.values, [2, 0]);
  assert.equal(g.met, 1);
  assert.equal(g.status, 'mixed');
  assert.equal(BENCH.gradeObjectives([lead], [before])[0].status, 'untested', 'the run it came from never grades it');
  assert.equal(BENCH.suiteMatches(lead.ruler.suite, bar + ' --admit 64'), false, 'a changed option is another suite');
  // a transfer objective needs a run that carried the word, and counts the tasks it solved
  const transfer = { at: lead.at, template: 'transfer', hypothesis: 'the kept word fix(chain(rot90,gravityUp)) solves a held out evaluation task', ruler: { suite: 'node bench/imagine.mjs --split evaluation --budget-ms 3000 --workers 2', bar: { metric: 'tasks', op: '>=', value: 1 }, control: 'the null arm' } };
  const evalCmd = 'node bench/imagine.mjs --split evaluation --budget-ms 3000 --workers 2';
  const noCarry = run('2026-01-01T01:00:00.000Z', evalCmd, 1, 0);
  const carried = run('2026-01-01T02:00:00.000Z', evalCmd + ' --carry', 1, 0, { carry: true, transfer: { byWord: { 'fix(chain(rot90,gravityUp))': ['e1', 'e2'] } } });
  const [t] = BENCH.gradeObjectives([transfer], [noCarry, carried]);
  assert.equal(t.runs, 1, 'a run that did not carry the word does not test it');
  assert.deepEqual(t.values, [2]);
  assert.equal(t.status, 'met');
  // a shape bar counts the invented arm alone, so the grade carries the null arm beside it
  const shape = { at: lead.at, template: 'shape', hypothesis: 'a combinator built for mult shape tasks solves at least one of the 10 mult timeouts nothing solved', ruler: { suite: bar + ' --shape mult', bar: { metric: 'mult timeouts solved with invented primitives', op: '>=', value: 1 }, control: 'the null arm' } };
  const tied = run('2026-01-01T03:00:00.000Z', bar + ' --shape mult', 1, 1, { shapes: { mult: { n: 10, invented: 1, null: 1 } } });
  const [sh] = BENCH.gradeObjectives([shape], [tied]);
  assert.deepEqual([sh.status, sh.values, sh.controls, sh.beyond], ['met', [1], [1], 0], 'met on its bar, and the null did as well');
  const ahead = run('2026-01-01T04:00:00.000Z', bar + ' --shape mult', 1, 0, { shapes: { mult: { n: 10, invented: 1, null: 0 } } });
  assert.equal(BENCH.gradeObjectives([shape], [tied, ahead])[0].beyond, 1, 'a tie is not beyond the null');
  const carriedNull = run('2026-01-01T02:30:00.000Z', evalCmd + ' --carry', 1, 0, { carry: true, transfer: { byWord: { 'fix(chain(rot90,gravityUp))': ['e1'] }, null: ['n1', 'n2'] } });
  assert.deepEqual(BENCH.gradeObjectives([transfer], [carriedNull])[0].controls, [], 'a transfer counts one word, the null carries eight: no same metric control');
  // a screen objective written with the invented arm's count keeps that bar; one written on the lead reads a level run as level
  const screenOld = { at: lead.at, template: 'screen', hypothesis: 'admitting 64 words per task instead of 32 solves more timeouts in the invented arm without losing the lead over the null', ruler: { suite: bar + ' --admit 64', bar: { metric: 'solved with invented primitives', op: '>', value: 4 }, control: 'the null arm' } };
  const screenNew = { ...screenOld, hypothesis: 'admitting 64 words per task instead of 32 keeps the invented arm ahead of the null by more than the 1 it leads by at 32', ruler: { ...screenOld.ruler, bar: { metric: 'solved with invented primitives minus solved by the null arm', op: '>', value: 1 } } };
  const level = run('2026-01-01T05:00:00.000Z', bar + ' --admit 64', 5, 5);
  const [so] = BENCH.gradeObjectives([screenOld], [level]), [sn] = BENCH.gradeObjectives([screenNew], [level]);
  assert.deepEqual([so.status, so.values, so.controls, so.beyond], ['met', [5], [5], 0], 'the written bar counts the invented arm alone');
  assert.deepEqual([sn.status, sn.values, sn.controls], ['not met', [0], []], 'the lead bar reads level as level');
  assert.deepEqual(g.controls, [], 'a lead bar already subtracts the null');
  // the runs table: the sign test and the merge of kept words
  assert.equal(BENCH.signTest(5, 0), 0.0625);
  assert.equal(BENCH.signTest(0, 0), 1);
  const [s] = BENCH.runsSummary([later, seeded, { ...later, partial: true }]);
  assert.equal(s.runs, 2, 'a partial run is not pooled');
  assert.deepEqual([s.wins, s.ties, s.losses], [1, 1, 0]);
  const merged = BENCH.mergeWords([{ key: 'w', solved: ['t1'], runs: ['r1'] }], [{ key: 'w', solved: ['t2'] }], 'r2');
  assert.deepEqual(merged, [{ key: 'w', solved: ['t1', 't2'], runs: ['r1', 'r2'] }]);
});

test('a memorised program is doubted, and still answers when nothing better is found', () => {
  const L = LEARNERS.find((l) => l.name === 'localRule');
  const cm = LEARNERS.find((l) => l.name === 'colormap');
  const g = (rows) => G.arcTask({ train: [{ input: rows, output: rows }], test: [] }).train[0].input;
  // [[1,0]] to [[2,0]] and [[1,1]] to [[5,5]]: refit on one pair, localRule predicts neither other
  const memo = { tr: [g([[1, 0]]), g([[1, 1]])], want: [g([[2, 0]]), g([[5, 5]])] };
  assert.equal(G.memorised(L, memo.tr, memo.want), true);
  // [[1,0]] to [[2,0]] and [[0,1]] to [[0,2]]: refit on one pair, it predicts the other
  const general = { tr: [g([[1, 0]]), g([[0, 1]])], want: [g([[2, 0]]), g([[0, 2]])] };
  assert.equal(G.memorised(L, general.tr, general.want), false);
  assert.equal(G.memorised(cm, memo.tr, memo.want), false, 'a colour map is never asked');
  assert.equal(G.memorised(L, [memo.tr[0]], [memo.want[0]]), false, 'one train pair cannot be left out');
  // the search, with maxStates 0 so only the root's learners are tried
  const search = (train, doubt) => G.searchWith(G.arcTask({ train, test: [{ input: [[1, 0]] }] }), [], { budgetMs: 2000, maxStates: 0, doubt });
  // a doubted fit yields to one that is not memorised: recolour by object size explains both pairs
  const sized = [{ input: [[1, 0]], output: [[2, 0]] }, { input: [[1, 1]], output: [[5, 5]] }];
  assert.deepEqual(search(sized, false).names, ['localRule']);
  const yields = search(sized, true);
  assert.equal(yields.doubted, 1, 'the memorised fit was doubted');
  assert.deepEqual(yields.names, ['objectRecolor']);
  assert.equal(yields.fromFallback, false);
  // with nothing better at the root, the doubted fit still answers: no solve is lost to doubt
  const placed = [{ input: [[1, 0]], output: [[2, 0]] }, { input: [[0, 1]], output: [[0, 5]] }];
  const plain = search(placed, false);
  assert.deepEqual([plain.status, plain.names, plain.fromFallback], ['found', ['localRule'], false]);
  const falls = search(placed, true);
  assert.equal(falls.doubted, 1);
  assert.equal(falls.status, 'found', 'the search ended with nothing better');
  assert.deepEqual(falls.names, ['localRule']);
  assert.equal(falls.fromFallback, true);
  assert.equal(G.INVENT_DEFAULTS.doubt, false, 'off by default until measured');
});

test('the arms are paired by task, and a task votes once across runs', () => {
  const q = BENCH.pairedOf(['a', 'b', 'c'], ['b', 'd']);
  assert.deepEqual(q.invented, ['a', 'c'], 'the tasks the invented arm alone solved');
  assert.deepEqual(q.null, ['d'], 'the tasks the null arm alone solved');
  assert.equal(q.both, 1);
  assert.equal(q.p, BENCH.signTest(2, 1));
  // two runs over the same tasks: a solved by invented alone twice, d by null alone once, b by both
  const cmd = 'node bench/imagine.mjs --split training --budget-ms 3000 --workers 2';
  const r = (at, inv, nul) => ({ at, startedAt: at, command: cmd, split: 'training', budgetMs: 3000, admit: 32, invented: { solved: inv.length, ids: inv }, null: { solved: nul.length, ids: nul } });
  const [s] = BENCH.runsSummary([r('2026-01-01T00:00:00.000Z', ['a', 'b'], ['b', 'd']), r('2026-01-01T01:00:00.000Z', ['a', 'b'], ['b'])]);
  assert.equal(s.pairing.invOnly, 2, 'per run, task a counts in each run');
  assert.equal(s.pairing.nullOnly, 1);
  assert.equal(s.pairing.taskAhead, 1, 'per task, task a votes once');
  assert.equal(s.pairing.taskBehind, 1);
  assert.equal(s.pairing.pTasks, 1);
});
