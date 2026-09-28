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
import { RNG } from '../core/rng.mjs';
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

// ---------------------------------------------------------------- board 24a: the bar from the rows, and the library arm
test('the bar is met only when the mean lead over three or more seeds is above the seed to seed band', () => {
  const rows = (arm, control) => arm.map((a, i) => ({ seed: 's' + i, arm: a, control: control[i] }));
  // the seed to seed rule alone: one run per seed allowed here (board 28 needs two, asserted below)
  const bar1 = (r) => BENCH.barOf(r, BENCH.MIN_SEEDS, 1);
  // leads 3, 4, 2: mean 3; the counts move 1 and 1, the lead moves 2, so the band is 2
  const met = bar1(rows([5, 6, 5], [2, 2, 3]));
  assert.deepEqual(met.lead, [3, 4, 2]);
  assert.deepEqual(met.ranges, { arm: 1, control: 1, lead: 2 });
  assert.equal(met.band, 2);
  assert.equal(met.meanLead, 3);
  assert.equal(met.met, true);
  assert.deepEqual(met.seeds, ['s0', 's1', 's2']);
  // the same two seeds that led are not enough: the bar needs three
  const two = bar1(rows([5, 6], [2, 2]));
  assert.equal(two.met, false);
  assert.match(two.why, /2 seeds, the bar needs 3/);
  // a mean lead EQUAL to the band is not above it (leads 1, 2, 3: mean 2, band 2)
  const equal = bar1(rows([1, 2, 3], [0, 0, 0]));
  assert.equal(equal.meanLead, 2);
  assert.equal(equal.band, 2);
  assert.equal(equal.met, false);
  // the band is the largest of the three ranges: a lead of 5 in every seed (its own range 0) is
  // still not met when the counts themselves move 6 between seeds
  const moving = bar1(rows([10, 16, 10], [5, 11, 5]));
  assert.deepEqual(moving.lead, [5, 5, 5]);
  assert.equal(moving.ranges.lead, 0);
  assert.equal(moving.band, 6);
  assert.equal(moving.met, false);
  assert.equal(bar1(rows([10, 14, 10], [5, 9, 5])).met, true, 'band 4 under a lead of 5');
  // the arm behind the control never meets it, however steady
  const behind = bar1(rows([1, 1, 1], [4, 4, 4]));
  assert.equal(behind.meanLead, -3);
  assert.equal(behind.band, 0);
  assert.equal(behind.met, false);
  // a row that is not a number is not a seed; nothing at all is not met
  assert.equal(bar1([{ arm: NaN, control: 1 }, ...rows([5, 6], [2, 2])]).seeds.length, 2);
  const none = BENCH.barOf([]);
  assert.deepEqual([none.met, none.band, none.meanLead], [false, null, null]);
  // the bench runs at least the seeds the bar needs, all distinct
  const d = BENCH.parseArgs([]);
  assert.deepEqual(d.seeds, [...BENCH.BAR_SEEDS]);
  assert.ok(d.seeds.length >= BENCH.MIN_SEEDS);
  assert.equal(d.library, true);
  assert.throws(() => BENCH.parseArgs(['--seeds', 'a,a,b']), /distinct/);
  // board 28: the same rows under the bar's own rule are not met, one run is not enough
  const oneRun = BENCH.barOf(rows([5, 6, 5], [2, 2, 3]));
  assert.equal(oneRun.met, false);
  assert.equal(oneRun.runBand, null);
  assert.match(oneRun.why, /1 run at a seed, the bar needs 2/);
  assert.equal(d.runs, BENCH.MIN_RUNS);
  assert.ok(BENCH.MIN_RUNS >= 2);
});

test('a task votes once over the seeds', () => {
  // x: a in 2 seeds, b in 0 (ahead); y: a 1, b 2 (behind); z: a 0, b 2 (behind); w: 1 and 1 (no vote)
  const v = BENCH.taskVotes([{ a: ['x', 'y', 'w'], b: ['y', 'w'] }, { a: ['x'], b: ['z'] }, { a: [], b: ['z', 'y'] }]);
  assert.deepEqual([v.ahead, v.behind], [1, 2]);
  assert.equal(v.p, BENCH.signTest(1, 2));
  assert.deepEqual(BENCH.taskVotes([]), { ahead: 0, behind: 0, p: BENCH.signTest(0, 0) });
});

test('the sleep keeps a routine only when it shortens the corpus, and a routine can hold an earlier one', () => {
  const p = (id, ops) => ({ id, steps: G.programSteps(ops) });
  // a fragment of two base words used twice gains 2 x 1 - 2 = 0: not kept
  const twice = G.compressLibrary([p('a', ['flipH', 'rot90']), p('b', ['flipH', 'rot90'])]);
  assert.equal(twice.routines.length, 0);
  assert.equal(twice.after, twice.before);
  // used three times it gains 3 x 1 - 2 = 1, and the corpus shrinks by exactly the gain
  const thrice = G.compressLibrary([p('a', ['flipH', 'rot90']), p('b', ['flipH', 'rot90']), p('c', ['flipH', 'rot90', 'transpose'])]);
  assert.equal(thrice.routines.length, 1);
  assert.deepEqual(thrice.routines[0].spec, G.chainSpec(['flipH', 'rot90']));
  assert.deepEqual([thrice.routines[0].uses, thrice.routines[0].dl, thrice.routines[0].gain], [3, 2, 1]);
  assert.deepEqual(thrice.routines[0].from, ['a', 'b', 'c']);
  assert.equal(thrice.before - thrice.after, 1);
  // seven uses of flipH rot90 (gain 5) beat three of flipH rot90 transpose (gain 3); after the
  // rewrite the routine plus transpose is two steps used three times (gain 1): a routine inside a routine
  const nest = G.compressLibrary([
    ...['p1', 'p2', 'p3'].map((id) => p(id, ['flipH', 'rot90', 'transpose'])),
    ...['p4', 'p5', 'p6', 'p7'].map((id) => p(id, ['flipH', 'rot90'])),
  ]);
  assert.deepEqual(nest.routines.map((r) => [r.key, r.uses, r.dl, r.gain]), [['chain(flipH,rot90)', 7, 2, 5], ['chain(flipH,rot90,transpose)', 3, 2, 1]]);
  assert.deepEqual(nest.routines[1].from, ['p1', 'p2', 'p3']);
  assert.deepEqual([nest.before, nest.after], [17, 11]);
  assert.equal(nest.before - nest.after, nest.routines.reduce((a, r) => a + r.gain, 0));
  // one added word of three tokens used twice gains 2 x 2 - 3 = 1: an invented word the library keeps
  const inv = { key: G.specKey(FLIP), spec: FLIP, invented: true, operator: 'lift.object' };
  const one = G.compressLibrary([{ id: 'a', steps: [inv] }, { id: 'b', steps: [inv, { key: 'rot90', spec: { k: 'op', op: 'rot90' } }] }]);
  assert.deepEqual(one.routines.map((r) => [r.key, r.uses, r.dl, r.gain]), [[G.specKey(FLIP), 2, 3, 1]]);
  // lambda prices the library: at 2 the same corpus keeps nothing
  assert.equal(G.compressLibrary([p('a', ['flipH', 'rot90']), p('b', ['flipH', 'rot90']), p('c', ['flipH', 'rot90'])], { lambda: 2 }).routines.length, 0);
});

test('a solved program is read into steps, and a run of steps into one word', () => {
  // the learned last step is not part of the program
  assert.deepEqual(G.programSteps(['flipH', 'rot90', 'localRule']).map((s) => [s.key, s.invented]), [['flipH', false], ['rot90', false]]);
  const byKey = new Map([[G.specKey(FLIP), { key: G.specKey(FLIP), spec: FLIP, operator: 'lift.object' }]]);
  const read = G.programSteps(['inv:' + G.specKey(FLIP), 'rot90'], byKey);
  assert.deepEqual(read.map((s) => [s.key, s.invented, s.operator]), [[G.specKey(FLIP), true, 'lift.object'], ['rot90', false, null]]);
  assert.equal(G.programSteps(['inv:not-a-word', 'rot90'], byKey), null, 'an added word it cannot look up');
  assert.equal(G.programSteps(['notAWord'], byKey), null, 'a name that is neither a base word nor an added one');
  // base words merge into a chain; anything else makes a seq; a nested seq flattens
  assert.deepEqual(G.seqSpec([{ k: 'op', op: 'flipH' }, { k: 'op', op: 'rot90' }]), G.chainSpec(['flipH', 'rot90']));
  const mixed = G.seqSpec([{ k: 'op', op: 'flipH' }, FLIP]);
  assert.deepEqual(mixed, { k: 'seq', fs: [{ k: 'op', op: 'flipH' }, FLIP] });
  assert.deepEqual(G.seqSpec([mixed, { k: 'op', op: 'rot90' }]), { k: 'seq', fs: [{ k: 'op', op: 'flipH' }, FLIP, { k: 'op', op: 'rot90' }] });
  assert.equal(G.seqSpec([]), null);
  assert.equal(G.seqSpec([{ k: 'op', op: 'flipH' }, null]), null);
  assert.ok(G.isGridWord(mixed));
});

test('the refit draw favours what solved, and without a prior the draw is the uniform one', () => {
  const prior = G.libraryPrior([{ steps: [{ spec: { k: 'op', op: 'flipH' } }, { spec: FLIP, invented: true, operator: 'lift.object' }] }], [], 1);
  assert.deepEqual(prior.words, { flipH: 2 }, 'flipH alone and inside the added word');
  assert.deepEqual(prior.ops, { 'lift.object': 1 });
  assert.equal(G.operatorSlots(prior, 'lift.object'), 2);
  assert.equal(G.operatorSlots(prior, 'lift.cell'), 1);
  const plain = G.dslSpace();
  const names = plain.operators.map((o) => o.name);
  assert.equal(new Set(names).size, names.length, 'each operator once without a prior');
  const refit = G.dslSpace({ prior });
  assert.equal(refit.operators.length, names.length + 1);
  assert.equal(refit.operators.filter((o) => o.name === 'lift.object').length, 2);
  // the inner word a lift draws: 1000 uses of flipH against alpha 1 for every other word
  const share = (space, rngSeed, is) => {
    const op = space.operators.find((o) => o.name === 'lift.cell');
    const rng = new RNG(rngSeed);
    let n = 0, hit = 0;
    for (let i = 0; i < 400; i++) { const c = op.make(null, rng); if (!c) continue; n++; if (is(c.spec.f)) hit++; }
    assert.ok(n >= 100, 'enough draws came back to measure a share: ' + n);
    return hit / n;
  };
  const isFlip = (f) => f && f.k === 'op' && f.op === 'flipH';
  const heavy = G.dslSpace({ prior: { alpha: 1, words: { flipH: 1000 }, ops: {}, routines: [] } });
  assert.ok(share(heavy, 'refit', isFlip) > 0.5, 'the heavy word is drawn more than half the time');
  assert.ok(share(plain, 'refit', isFlip) < 0.2, 'the uniform draw does not favour it');
  // a routine is drawn by its uses
  const R = G.chainSpec(['flipH', 'rot90']);
  const withRoutine = G.dslSpace({ prior: { alpha: 1, words: {}, ops: {}, routines: [{ key: G.specKey(R), spec: R, uses: 1000 }] } });
  assert.ok(share(withRoutine, 'refit', (f) => f && G.specKey(f) === G.specKey(R)) > 0.5);
});

test('the library arm never offers a task a word its own program shaped', () => {
  const base = [{ spec: FLIP, key: G.specKey(FLIP), source: 'collapse', sources: ['t1'] }];
  const R = G.chainSpec(['flipH', 'rot90']);
  const routines = [{ key: G.specKey(R), spec: R, uses: 3, gain: 1, from: ['t2', 't3'] }];
  const lib = G.libraryWords({ memory: G.vocabularyMemory(), base, routines, prior: G.libraryPrior([], routines, 1), fedBy: ['t5', 't4', 't4'], budget: 40, rounds: 1, seed: 'library-test' });
  assert.equal(lib.words[0].key, G.specKey(FLIP), 'the base words come first');
  const routine = lib.words.find((w) => w.key === G.specKey(R));
  assert.deepEqual([routine.source, routine.sources], ['library.routine', ['t2', 't3']]);
  assert.equal(lib.routinesNew, 1);
  const imagined = lib.words.filter((w) => w.source === 'imagine');
  assert.ok(imagined.length > 0, 'the prior imagined words');
  assert.equal(imagined.length, lib.imagined);
  for (const w of imagined) assert.deepEqual(w.sources, ['t4', 't5']);
  // offerable drops every word whose sources hold the task
  const extra = [{ spec: { k: 'fix', f: { k: 'op', op: 'flipH' } }, key: 'fix(flipH)', source: 'imagine', sources: ['t9'] }];
  const keys = (id) => G.offerable(lib.words, extra, id).map((w) => w.key);
  assert.ok(!keys('t1').includes(G.specKey(FLIP)));
  assert.ok(!keys('t2').includes(G.specKey(R)));
  assert.equal(keys('t4').length, lib.words.length + 1 - imagined.length);
  assert.ok(!keys('t9').includes('fix(flipH)'));
  assert.equal(keys('t0').length, lib.words.length + 1, 'a task that fed nothing is offered everything');
  // the cap holds the library at the size it is given
  const capped = G.libraryWords({ memory: G.vocabularyMemory(), base, routines, fedBy: [], budget: 40, rounds: 1, seed: 'library-test', cap: 2 });
  assert.deepEqual([capped.words.length, capped.imagined], [2, 0]);
});

test('a fold is slept only on the solved programs of the other fold', () => {
  const ids = Array.from({ length: 40 }, (_, i) => 'task' + i);
  const folds = ids.map((id) => G.foldOf(id));
  assert.deepEqual(folds, ids.map((id) => G.foldOf(id)), 'the fold of an id never changes');
  const f0 = ids.filter((id) => G.foldOf(id) === 0), f1 = ids.filter((id) => G.foldOf(id) === 1);
  assert.ok(f0.length > 0 && f1.length > 4, 'both folds hold tasks: ' + f0.length + ' and ' + f1.length);
  assert.ok(ids.every((id) => [0, 1, 2].includes(G.foldOf(id, 3))));
  const row = (id, solved, names = ['flipH', 'rot90']) => ({ id, invented: { solved, names } });
  const rows = [row(f0[0], true), row(f1[0], true), row(f1[1], false), row(f1[2], 'found'), row(f1[3], true, ['inv:missing']), row(f1[4], true)];
  const dev = [{ id: 'dev', steps: G.programSteps(['transpose']) }];
  const c = BENCH.sleepCorpus({ rows, fold: 0, folds: 2, devPrograms: dev });
  assert.deepEqual(c.fed, [f1[0], f1[4]].sort(), 'only solved programs of the other fold that can be read');
  assert.deepEqual(c.programs.map((p) => p.id), ['dev', f1[0], f1[4]]);
  const other = BENCH.sleepCorpus({ rows, fold: 1, folds: 2, devPrograms: dev });
  assert.deepEqual(other.fed, [f0[0]]);
  assert.ok(!other.fed.some((id) => G.foldOf(id) === 1));
});

test('the bar command is not a variant, and its split names what fed the invention', () => {
  assert.equal(BENCH.variantOf(BENCH.parseArgs([])), '');
  assert.equal(BENCH.variantOf(BENCH.parseArgs(['--seeds', 'imagine-bench,s2,s3'])), '');
  assert.match(BENCH.variantOf(BENCH.parseArgs(['--seed', 's2'])), /seeds-s2/);
  assert.match(BENCH.variantOf(BENCH.parseArgs(['--no-library'])), /library-false/);
  for (const arcSplit of ['training', 'evaluation']) {
    const s = BENCH.splitFor({ arcSplit, n: 10, library: true, folds: 2 });
    assert.equal(typeof s.contaminated, 'string', 'mining feeds the invention, so never false');
    assert.ok(s.contaminated.length > 0);
    assert.equal(s.heldOut.n, 10);
    assert.equal(s.heldOut.folds, 2);
    assert.match(s.heldOut.what, /cross fitted/);
    assert.equal(s.development.arcSplit, 'training');
  }
  assert.doesNotMatch(BENCH.splitFor({ arcSplit: 'training' }).heldOut.what, /cross fitted/);
  // board 31: the split names the development ids, the held out ids and the seeds, and says why it is contaminated
  const named = BENCH.splitFor({ arcSplit: 'training', n: 2, development: 3, developmentIds: ['d1', 'd2', 'd3'], heldOutIds: ['h1', 'h2'], seeds: ['imagine-bench', 's2', 's3'], runs: 2 });
  assert.deepEqual([named.development.ids, named.heldOut.ids, named.seeds, named.runs], [['d1', 'd2', 'd3'], ['h1', 'h2'], ['imagine-bench', 's2', 's3'], 2]);
  assert.ok(!named.development.ids.some((id) => named.heldOut.ids.includes(id)), 'no development id is scored');
  assert.match(named.contaminated, /written against/);
  assert.match(named.contaminated, /never to itself/);
  assert.deepEqual([BENCH.splitFor({}).development.ids, BENCH.splitFor({}).heldOut.ids, BENCH.splitFor({}).seeds], [null, null, null]);
});

test('the bench refuses a cfg without seeds or runs instead of defaulting them', async () => {
  const d = BENCH.parseArgs([]);
  await assert.rejects(BENCH.runImagineBench({ ...d, seeds: undefined }), /needs cfg.seeds/);
  await assert.rejects(BENCH.runImagineBench({ ...d, seeds: [] }), /needs cfg.seeds/);
  await assert.rejects(BENCH.runImagineBench({ ...d, runs: 0 }), /needs cfg.seeds and cfg.runs/);
});

// ---------------------------------------------------------------- board 28: one seed, one draw
test('the band is the larger of the seed to seed and the run to run band, and one run never meets the bar', () => {
  const at = (run, arm, control) => arm.map((a, i) => ({ seed: 's' + i, run, arm: a, control: control[i] }));
  // run 1 alone: leads 3, 4, 2, mean 3 above a seed to seed band of 2; the seed to seed rule met it
  const run1 = at(1, [9, 10, 9], [6, 6, 7]);
  assert.equal(BENCH.barOf(run1, BENCH.MIN_SEEDS, 1).met, true);
  // run 2 of the same seeds: every count moved 4, the leads did not. The run to run band is 4
  // and binds; the mean lead 3 is not above it
  const moved = BENCH.barOf(run1.concat(at(2, [5, 6, 5], [2, 2, 3])));
  assert.deepEqual(moved.runs, [1, 2]);
  assert.deepEqual(moved.rowRuns, [1, 1, 1, 2, 2, 2]);
  assert.deepEqual(moved.ranges, { arm: 1, control: 1, lead: 2 });
  assert.deepEqual(moved.runRanges, { arm: 4, control: 4, lead: 0 });
  assert.deepEqual([moved.seedBand, moved.runBand, moved.band], [2, 4, 4]);
  assert.equal(moved.meanLead, 3);
  assert.equal(moved.bound, 'the run to run band');
  assert.equal(moved.met, false);
  assert.match(moved.why, /not above the band 4, set by the run to run band/);
  // the same run twice: the run to run band is 0, the seed to seed band binds, and it is met
  const same = BENCH.barOf(run1.concat(at(2, [9, 10, 9], [6, 6, 7])));
  assert.deepEqual([same.seedBand, same.runBand, same.band, same.bound, same.met], [2, 0, 2, 'the seed to seed band', true]);
  // a run to run move of the lead binds too (at s0 the control moved 3, the lead 3)
  const lead = BENCH.barOf(run1.concat(at(2, [9, 10, 9], [3, 6, 7])));
  assert.equal(lead.runRanges.lead, 3);
  assert.equal(lead.runRanges.control, 3);
  assert.equal(lead.band, Math.max(lead.seedBand, 3));
  // equal bands are named as equal
  assert.equal(BENCH.barOf(at(1, [5, 6, 5], [2, 2, 3]).concat(at(2, [7, 8, 7], [2, 2, 3]))).bound, 'both bands (equal)');
  // one run: not met however large the lead; a run number repeated is still one run
  const one = BENCH.barOf(at(1, [20, 20, 20], [0, 0, 0]));
  assert.equal(one.met, false);
  assert.equal(one.runsPerSeed, 1);
  assert.equal(BENCH.barOf(at(1, [20, 20, 20], [0, 0, 0]).concat(at(1, [20, 20, 20], [0, 0, 0]))).met, false);
  // a seed missing from run 2 has one run: not met
  const missing = BENCH.barOf(at(1, [20, 20, 20], [0, 0, 0]).concat(at(2, [20, 20], [0, 0])));
  assert.equal(missing.runsPerSeed, 1);
  assert.equal(missing.met, false);
  // two runs of three seeds with a steady lead above both bands: met
  assert.equal(BENCH.barOf(at(1, [20, 20, 20], [0, 0, 0]).concat(at(2, [20, 20, 20], [0, 0, 0]))).met, true);
});

test('results are applied in job order, and a job is offered only the words of the jobs LAG before it', async () => {
  // inOrder: finished 2, 0, 1 is applied 0, 1, 2
  const applied = [];
  const o = BENCH.inOrder((j, x) => applied.push([j, x]));
  o.done(2, 'c');
  assert.deepEqual(applied, []);
  let reached = false;
  const two = o.until(2).then(() => { reached = true; });
  o.done(0, 'a');
  await Promise.resolve();
  assert.equal(reached, false, 'one of two applied');
  o.done(1, 'b');
  await two;
  assert.deepEqual(applied, [[0, 'a'], [1, 'b'], [2, 'c']]);
  assert.equal(o.applied, 3);
  // visibleAt: job 5 sees what jobs up to 5 - LAG brought in, every earlier stage, and a carried word
  const L = BENCH.LAG;
  assert.ok(L >= 1);
  assert.equal(BENCH.visibleAt({ stage: 0, job: 5 - L }, 0, 5), true);
  assert.equal(BENCH.visibleAt({ stage: 0, job: 6 - L }, 0, 5), false);
  assert.equal(BENCH.visibleAt({ stage: 0, job: 9 }, 1, 0), true);
  assert.equal(BENCH.visibleAt({ stage: -1, job: 0 }, 0, 0), true);
  assert.equal(BENCH.visibleAt(null, 0, 0), true);
  assert.equal(BENCH.visibleAt({ stage: 1, job: 0 }, 0, 9), false);
  // a stage on two workers whose jobs finish in a random order, the bench's way: job j waits for
  // the jobs up to j - LAG, and every third job brings in a word. What each job is offered does
  // not depend on the order; offering every word applied so far (the board 24a way) does.
  const stage = async (seed, filtered) => {
    let s = seed;
    const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
    const entered = new Map(), offered = [];
    const order = BENCH.inOrder((j) => { if (j % 3 === 0) entered.set('w' + j, { stage: 0, job: j }); });
    let next = 0;
    const lane = async () => {
      for (;;) {
        if (next >= 30) return;
        const j = next++;
        await order.until(j - L + 1);
        offered[j] = [...entered.keys()].filter((k) => !filtered || BENCH.visibleAt(entered.get(k), 0, j)).join(' ');
        const ticks = Math.floor(rnd() * 12);
        for (let t = 0; t < ticks; t++) await new Promise((r) => setImmediate(r));
        order.done(j, null);
      }
    };
    await Promise.all([lane(), lane()]);
    return offered;
  };
  const a = await stage(1, true), b = await stage(987654321, true);
  assert.equal(a.length, 30);
  assert.deepEqual(a, b);
  assert.equal(a[L], 'w0', 'job LAG sees job 0');
  let differs = 0;
  for (const s of [1, 7, 42, 99, 12345]) if (JSON.stringify(await stage(s, false)) !== JSON.stringify(await stage(s + 1000, false))) differs++;
  assert.ok(differs > 0, 'the unfiltered stage depends on the finishing order');
});

test('a search under a work budget draws the same library and the same solves on any clock', () => {
  // a small planted set: the planted scene, the same scenes mirrored top to bottom inside each
  // object's box, and a noise task nothing solves
  let x = 12345;
  const rnd = () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
  const noise = () => Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => Math.floor(rnd() * 10)));
  const eachV = (parts) => {
    const g = Array.from({ length: 10 }, () => new Array(10).fill(0));
    for (const [shape, color, r, c] of parts) shape.slice().reverse().forEach((row, y) => row.forEach((v, xx) => { if (v) g[r + y][c + xx] = color; }));
    return { input: scene(parts, false), output: g };
  };
  const TASKS = {
    planted: PLANTED,
    plantedV: { train: [eachV([[A, 1, 1, 1], [B, 2, 5, 4]]), eachV([[B, 3, 0, 6], [A, 4, 6, 1]]), eachV([[C, 6, 2, 3], [A, 7, 6, 6]])], test: [eachV([[C, 8, 1, 1], [B, 9, 6, 5]])] },
    hard: { train: [0, 1, 2].map(() => ({ input: noise(), output: noise() })), test: [{ input: noise(), output: noise() }] },
  };
  // a word that burns the wall clock and does nothing: invented, so the search does not count it,
  // and it refuses every grid, so it adds no state
  const spin = (ms) => { const e = performance.now() + ms; while (performance.now() < e); };
  const slow = { name: 'inv:slow', key: 'slow', from: 'grid', to: 'grid', cost: 1, invented: true, spec: { k: 'op', op: 'identity' }, apply: () => { spin(4); return null; } };
  const WORK = 400, MINE = 200;
  const draw = (extra) => {
    const minedRows = Object.entries(TASKS).map(([id, t]) => { const m = G.searchWith(G.arcTask(t), extra, { work: MINE, mine: 8 }); return { id, mined: m.mined || [], status: m.status, searched: m.searched, work: m.work, byWork: m.byWork }; });
    const fromTimeouts = G.fromTimeouts(minedRows);
    const imagined = G.imagineWords({ memory: G.vocabularyMemory().concat(fromTimeouts), budget: 400, seed: 'test-work' });
    const library = fromTimeouts.concat(imagined.words);
    const solves = Object.entries(TASKS).map(([id, t]) => {
      const adm = G.admitFor(library, G.arcTask(t), 16, Infinity, WORK * 0.4);
      const r = G.solveWith(t, adm.admitted.map((w) => G.asPrimitive(w)).filter(Boolean).concat(extra), { work: WORK - adm.work });
      return { id, admitted: adm.admitted.map((w) => w.key), admitWork: adm.work, status: r.status, solved: r.solved, names: r.names, searched: r.searched, states: r.states, work: r.work, byWork: r.byWork };
    });
    // an admission the work cuts short: it stops at the same word every time
    const c = G.admitFor(library, G.arcTask(TASKS.planted), 16, Infinity, 5);
    const cutShort = { cut: c.cut, screened: c.screened, work: c.work, admitted: c.admitted.map((w) => w.key) };
    return { mined: minedRows, library: library.map((w) => w.key), solves, cutShort };
  };
  const one = draw([]), two = draw([]), slowed = draw([slow]);
  assert.ok(one.mined.every((m) => m.byWork && m.work > MINE && m.work < MINE + 50), 'mining stops on work: ' + one.mined.map((m) => m.work).join(', '));
  assert.ok(one.mined.some((m) => m.mined.length > 0), 'mining kept a partial program');
  assert.ok(one.library.length > 100, 'library ' + one.library.length);
  // the same draw twice, and the same draw with the wall clock slowed: identical libraries and solves
  assert.deepEqual(two, one);
  assert.deepEqual(slowed.library, one.library);
  assert.deepEqual(slowed.solves, one.solves);
  assert.deepEqual(slowed.mined.map((m) => [m.id, m.status, m.searched, m.work, m.mined]), one.mined.map((m) => [m.id, m.status, m.searched, m.work, m.mined]));
  assert.equal(one.cutShort.cut, true, 'the admission was cut by work');
  assert.ok(one.cutShort.screened > 0 && one.cutShort.screened < one.library.length, 'screened ' + one.cutShort.screened);
  assert.ok(one.cutShort.work > 5, 'work ' + one.cutShort.work);
  const solved = one.solves.filter((s) => s.solved).map((s) => s.id);
  assert.ok(solved.includes('plantedV'), 'solved: ' + solved.join(', '));
  const hard = one.solves.find((s) => s.id === 'hard');
  assert.deepEqual([hard.status, hard.byWork], ['timeout', true]);
  // the control: under a WALL budget the same slowed word cuts the same search short
  const wall = (extra) => G.solveWith(TASKS.hard, extra, { budgetMs: 300 });
  wall([]);
  const plain = wall([]), cut = wall([slow]);
  assert.equal(plain.byWork, false);
  assert.ok(cut.searched < plain.searched * 0.8, 'wall budget: slowed ' + cut.searched + ' against ' + plain.searched);
});

test('a grid verdict ran the whole split by its own counts, not by its isTheBar', () => {
  const rows = Array.from({ length: 4 }, (_, i) => ({ id: 't' + i, status: i ? 'timeout' : 'found' }));
  const whole = { isTheBar: false, n: 4, of: 4, rows, controlArm: false, repeatOf: null };
  assert.equal(BENCH.gridWhole(whole), true, 'board 26: training is in sample, still the whole split');
  assert.equal(BENCH.gridWhole({ ...whole, rows: rows.slice(1) }), false, 'a row missing');
  assert.equal(BENCH.gridWhole({ ...whole, n: 3 }), false, 'fewer tasks than the split');
  assert.equal(BENCH.gridWhole({ ...whole, controlArm: true }), false, 'a control arm is not the grid run');
  assert.equal(BENCH.gridWhole({ ...whole, repeatOf: 'bench/verdicts/grid.json' }), false, 'a repeat is not the grid run');
  assert.equal(BENCH.gridWhole({ ...whole, isTheBar: true, n: 3 }), true, 'a grid bar is whole by its own word');
  assert.equal(BENCH.gridWhole(null), false);
  assert.equal(BENCH.gridWhole({ n: 0, of: 0, rows: [] }), false, 'nothing ran');
  // the bar command is the defaults: the work budgets and two runs
  const d = BENCH.parseArgs(['--split', 'training', '--budget-work', String(BENCH.BAR_WORK), '--workers', '2']);
  assert.equal(BENCH.variantOf(d), '');
  assert.deepEqual([d.budgetWork, d.mineWork, d.runs], [BENCH.BAR_WORK, BENCH.BAR_MINE_WORK, 2]);
  assert.match(BENCH.variantOf(BENCH.parseArgs(['--runs', '1'])), /runs-1/);
  assert.throws(() => BENCH.parseArgs(['--runs', '0']), /--runs/);
});
