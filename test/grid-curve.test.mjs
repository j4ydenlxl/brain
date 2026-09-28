// test/grid-curve.test.mjs: the second attempt rule, the paired gain and loss, the journal, the
// price line and the memory rule of bench/grid-curve.mjs, and the shapes of the verdicts it wrote
// (bench/verdicts/grid-attempts.json after the 3000 ms attempts run, bench/verdicts/grid-curve.json
// after the 30000 ms point). No test here runs a bench point: the 30000 ms point is never re-run.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { programLength, orderAttempts, solveArcTask, searchGrid, taskFromArc } from '../capability/grid-search.mjs';
import { sameGrid } from '../capability/grid-dsl.mjs';
import {
  parseCurveArgs, mulberry32, drawIds, pointOf, pairById, convertedFoundButWrong, marginalOf, priceOf,
  readJournal, openJournal, wallOfJournal, choosePreempt, rampFor, MAX_PREEMPTS, MAX_WORKERS, DEPTH, ORDER_RULE,
} from '../bench/grid-curve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERDICTS = path.join(ROOT, 'bench', 'verdicts');
const readVerdict = (name) => JSON.parse(readFileSync(path.join(VERDICTS, name), 'utf8'));

// ------------------------------------------------------------------ the second attempt rule
test('program length counts base words: a macro as the words it stands for, a learned step as one', () => {
  assert.equal(programLength({ names: ['flipH'] }), 1);
  assert.equal(programLength({ names: ['flipH', 'rot90'] }), 2);
  assert.equal(programLength({ names: ['flipH+rot90', 'transpose'] }), 3, 'a joined macro name is the words it joins');
  assert.equal(programLength({ steps: [{ op: 'a' }, { op: 'b' }, { op: 'c' }] }), 3);
  assert.equal(programLength({}), 0);
  assert.equal(programLength(null), 0);
});

test('attempts are listed by program length, then by discovery order, and keep their discovery number', () => {
  const hits = [{ names: ['flipH', 'rot90'] }, { names: ['flipV'] }, { names: ['transpose'] }];
  const o = orderAttempts(hits);
  assert.deepEqual(o.map((a) => a.names.join(' > ')), ['flipV', 'transpose', 'flipH > rot90']);
  assert.deepEqual(o.map((a) => a.found), [2, 3, 1]);
  const tie = orderAttempts([{ names: ['b'] }, { names: ['a'] }]);
  assert.deepEqual(tie.map((a) => a.names[0]), ['b', 'a'], 'equal lengths keep the order found');
  assert.deepEqual(orderAttempts(undefined), []);
  assert.equal(hits[0].found, undefined, 'the hits given are not changed');
});

test('two fitting programs with different test outputs: both are emitted, ordered, and either one right solves', () => {
  // one train pair a mirror and a half turn both explain; the test output is the mirror
  const json = {
    train: [{ input: [[1, 2]], output: [[2, 1]] }, { input: [[3, 5]], output: [[5, 3]] }],
    test: [{ input: [[1, 2], [3, 5]], output: [[2, 1], [5, 3]] }],
  };
  const two = solveArcTask(json, { budgetMs: 5000, attempts: 2 });
  assert.equal(two.attempts.length, 2, 'a second answer was found');
  assert.deepEqual(two.attempts.map((a) => a.found).slice().sort(), [1, 2], 'each attempt keeps its discovery number');
  const [a, b] = two.attempts;
  assert.ok(programLength(a) < programLength(b) || (programLength(a) === programLength(b) && a.found < b.found), 'length first, then discovery: ' + two.attempts.map((x) => x.names.join(' > ') + ' #' + x.found).join(' | '));
  const s = searchGrid(taskFromArc(json), { budgetMs: 5000, attempts: 2 });
  assert.ok(!sameGrid(s.attempts[0].outputs[0], s.attempts[1].outputs[0]), 'the two attempts answer the test input differently');
  assert.equal(two.attemptRight.filter(Boolean).length, 1, 'one attempt is right, one wrong');
  assert.equal(two.solved, true, 'ARC scoring: right when either attempt is right');
  const one = solveArcTask(json, { budgetMs: 5000 });
  assert.equal(two.solvedFirst, one.solved, 'solvedFirst is the program found first, the one attempt answer');
});

test('one fitting answer: when every fitting program gives the same test output, attempt 2 is empty', () => {
  // the test input IS the train input, so every program that fits the train pair answers the test the same
  const json = {
    train: [{ input: [[1, 2], [3, 4]], output: [[4, 3], [2, 1]] }],
    test: [{ input: [[1, 2], [3, 4]], output: [[4, 3], [2, 1]] }],
  };
  const r = solveArcTask(json, { budgetMs: 1000, attempts: 2 });
  assert.equal(r.attempts.length, 1, 'no second different answer exists: ' + r.attempts.map((x) => x.names.join(' > ')).join(' | '));
  assert.equal(r.attempts[0].found, 1);
  assert.deepEqual(r.attemptRight, [true]);
  assert.equal(r.solved, true);
});

test('the order rule is stated in the bench and in the notes', () => {
  assert.match(ORDER_RULE, /program length/);
  assert.match(ORDER_RULE, /discovery order/);
  assert.match(ORDER_RULE, /attempt 2 is empty/);
  const notes = readFileSync(path.join(ROOT, 'notes', 'grid-curve.md'), 'utf8');
  assert.match(notes, /program length/);
  assert.match(notes, /discovery order/);
  assert.doesNotMatch(notes, /\u2014/, 'no em-dash in the notes');
});

// ------------------------------------------------------------------ paired gain and loss
const ROWS_NOW = [
  { id: 'a', status: 'found', solved: true, solvedFirst: false, attempts: [{}, {}], wallMs: 10 },
  { id: 'b', status: 'timeout', solved: false, wallMs: 3000 },
  { id: 'c', status: 'found', solved: true, solvedFirst: true, attempts: [{}], wallMs: 20 },
  { id: 'd', status: 'found', solved: false, attempts: [{}, {}], wallMs: 30 },
  { id: 'e', status: 'exhausted', solved: false, wallMs: 40 },
];
const ROWS_BEFORE = [
  { id: 'a', status: 'found', solved: false },
  { id: 'b', status: 'found', solved: true },
  { id: 'c', status: 'found', solved: true },
  { id: 'd', status: 'found', solved: false },
  { id: 'e', status: 'timeout', solved: false },
];

test('paired by task id: gained is solved here only, lost is solved before only', () => {
  const p = pairById(ROWS_NOW, ROWS_BEFORE);
  assert.deepEqual(p, { gained: ['a'], lost: ['b'] });
  assert.deepEqual(pairById(ROWS_BEFORE, ROWS_NOW), { gained: ['b'], lost: ['a'] }, 'the pairing is antisymmetric');
  assert.deepEqual(pairById(ROWS_NOW, ROWS_NOW), { gained: [], lost: [] });
  assert.throws(() => pairById(ROWS_NOW, ROWS_BEFORE.slice(1)), /different tasks/);
  assert.throws(() => pairById(ROWS_NOW, [...ROWS_BEFORE.slice(1), { id: 'z', solved: true }]), /different tasks/);
});

test('found but wrong converted: counted over the found but wrong rows of the run before', () => {
  const c = convertedFoundButWrong(ROWS_NOW, ROWS_BEFORE);
  assert.deepEqual(c, { converted: 1, of: 2, ids: ['a'], stillWrong: 1 });
});

test('a point from its rows, and the marginal per tenfold of clock', () => {
  const p = pointOf(ROWS_NOW, { budgetMs: 30000, attempts: 2, workers: 12, wallSeconds: 9 });
  assert.equal(p.solved, 2);
  assert.equal(p.of, 5);
  assert.equal(p.pct, 40);
  assert.equal(p.timedOut, 1);
  assert.equal(p.foundButWrong, 1);
  assert.equal(p.exhausted, 1);
  assert.equal(p.solvedAtFirstFound, 1);
  assert.equal(p.rescuedBySecond, 1);
  assert.equal(p.secondFound, 2);
  assert.equal(p.meanMs, 620);
  assert.equal(p.solvedAtFirstFound + p.rescuedBySecond, p.solved);
  const m = marginalOf({ budgetMs: 3000, solved: 86 }, { budgetMs: 30000, solved: 100, attempts: 2 }, { gained: new Array(15).fill('x'), lost: ['y'] });
  assert.deepEqual(m, { fromMs: 3000, toMs: 30000, attempts: 2, tenfolds: 1, gained: 15, lost: 1, net: 14, solvedPerTenfold: 14 });
  assert.equal(marginalOf({ budgetMs: 3000, solved: 1 }, { budgetMs: 300000, solved: 5, attempts: 2 }, { gained: [], lost: [] }).solvedPerTenfold, 2);
});

// ------------------------------------------------------------------ the fixed seed draw
test('the fixed seed draw is the same every time, sorted, a subset, and moves with the seed', () => {
  const ids = Array.from({ length: 400 }, (_, i) => 'id' + String(i).padStart(3, '0'));
  const a = drawIds(ids, 100, 33);
  const b = drawIds(ids.slice().reverse(), 100, 33);
  assert.deepEqual(a, b, 'the input order does not move the draw');
  assert.equal(a.length, 100);
  assert.equal(new Set(a).size, 100);
  assert.deepEqual(a, a.slice().sort());
  assert.ok(a.every((x) => ids.includes(x)));
  assert.notDeepEqual(drawIds(ids, 100, 34), a);
  assert.equal(drawIds(ids, 1000, 33).length, 400);
  const r = mulberry32(33);
  const xs = Array.from({ length: 1000 }, r);
  assert.ok(xs.every((x) => x >= 0 && x < 1));
  assert.deepEqual(Array.from({ length: 5 }, mulberry32(33)), xs.slice(0, 5));
});

// ------------------------------------------------------------------ the journal
test('journal: a new one gets its header, a resume keeps its rows and cuts a torn last line', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'brain-grid-curve-'));
  try {
    const file = path.join(dir, 'grid-curve-evaluation-30000ms.jsonl');
    const header = { split: 'evaluation', budgetMs: 30000, attempts: 2, maxDepth: 4, idsSha: 'abc', onlyTimedOutOf: null, ids: ['a', 'b', 'c'] };
    const fresh = openJournal(file, header, { resume: false });
    assert.equal(fresh.rows.size, 0);
    assert.equal(JSON.parse(readFileSync(file, 'utf8').trim()).type, 'header');
    appendFileSync(file, JSON.stringify({ type: 'session', n: 1, startedAt: 1000 }) + '\n');
    appendFileSync(file, JSON.stringify({ type: 'row', id: 'a', session: 1, endedAt: 4000, status: 'found', solved: true }) + '\n');
    appendFileSync(file, JSON.stringify({ type: 'row', id: 'b', session: 1, endedAt: 6000, status: 'timeout', solved: false }) + '\n');
    appendFileSync(file, JSON.stringify({ type: 'sessionEnd', n: 1, peakRssMb: 100 }) + '\n');
    appendFileSync(file, '{"type":"row","id":"c","sess');
    assert.equal(readJournal(file).tornTail, true);
    const logs = [];
    const back = openJournal(file, header, { resume: true, log: (m) => logs.push(m) });
    assert.deepEqual([...back.rows.keys()], ['a', 'b'], 'the torn row is not a row: that task runs again');
    assert.equal(back.sessions.length, 1);
    assert.equal(back.ends.length, 1);
    assert.match(logs.join('\n'), /torn last line/);
    const after = readJournal(file);
    assert.equal(after.tornTail, false, 'the torn line was cut from the file');
    assert.equal(after.rows.size, 2);
    assert.equal(wallOfJournal([...after.rows.values()], after.sessions), 5, 'a session is its last row end minus its start');
    assert.throws(() => openJournal(file, header, { resume: false }), /--resume/);
    assert.throws(() => openJournal(file, { ...header, budgetMs: 300000 }, { resume: true }), /budgetMs/);
    assert.throws(() => openJournal(file, { ...header, attempts: 1 }, { resume: true }), /attempts/);
    assert.throws(() => openJournal(file, { ...header, idsSha: 'other' }, { resume: true }), /idsSha/);
    const mid = path.join(dir, 'torn-middle.jsonl');
    writeFileSync(mid, JSON.stringify({ type: 'header', ...header }) + '\n{"type":"row"\n' + JSON.stringify({ type: 'row', id: 'a' }) + '\n');
    assert.throws(() => readJournal(mid), /does not parse/);
    const headless = path.join(dir, 'headless.jsonl');
    writeFileSync(headless, JSON.stringify({ type: 'row', id: 'a' }) + '\n');
    assert.throws(() => readJournal(headless), /no header/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ------------------------------------------------------------------ the price line
test('the price line: a task that ran to the clock or answered fewer times than wanted is priced at the whole new clock', () => {
  const prev = [
    { id: 'a', status: 'timeout', wallMs: 3000.2 },
    { id: 'b', status: 'found', wallMs: 12, attempts: [{}, {}] },
    { id: 'c', status: 'found', wallMs: 12, attempts: [{}] },
    { id: 'd', status: 'exhausted', wallMs: 50 },
    { id: 'e', status: 'found', wallMs: 2950, attempts: [{}, {}] },
  ];
  const p = priceOf(prev, { budgetMs: 30000, prevBudgetMs: 3000, attempts: 2, workers: 2 });
  assert.equal(p.tasks, 5);
  assert.equal(p.full, 3, 'a (clock), c (one answer of two), e (past nine tenths of the clock)');
  assert.equal(p.early, 2, 'b (two answers early), d (exhausted early)');
  assert.equal(p.taskSeconds, 90.06);
  assert.equal(p.wallSeconds, 45.03);
  assert.equal(p.minutes, 0.75);
  assert.ok(p.line.startsWith('PRICE: 5 tasks at 30000 ms, 2 attempts, 2 workers: 3 priced at the whole 30000 ms clock'), p.line);
  assert.match(p.line, /2 at their wall there/);
  assert.match(p.line, /90\.06 task seconds, about 0\.75 minutes of wall over 2 workers/);
  assert.match(p.line, /a CPU price: lanes the memory rule holds idle are not in it/);
  const one = priceOf(prev, { budgetMs: 30000, prevBudgetMs: 3000, attempts: 1, workers: 12 });
  assert.equal(one.full, 2, 'with one attempt wanted, one early answer is enough');
  assert.equal(one.taskSeconds, 60.07);
  assert.equal(one.wallSeconds, 12.01, 'never more lanes than tasks: five tasks over five lanes, not twelve');
});

// ------------------------------------------------------------------ the memory rule and the arguments
test('the memory rule: the task started last is preempted, never one at its limit, never the only one', () => {
  assert.equal(choosePreempt([]), null);
  assert.equal(choosePreempt([{ id: 'a', startedAt: 1, preempts: 0 }]), null);
  const run = [{ id: 'a', startedAt: 1, preempts: 0 }, { id: 'b', startedAt: 5, preempts: 0 }, { id: 'c', startedAt: 9, preempts: MAX_PREEMPTS }];
  assert.equal(choosePreempt(run).id, 'b');
  assert.equal(choosePreempt(run.map((r) => ({ ...r, preempts: MAX_PREEMPTS }))), null);
  assert.equal(rampFor(30000, 1500), 1500);
  assert.equal(rampFor(3000, 1500), 150);
  assert.equal(rampFor(300000, 1500), 1500);
  assert.equal(rampFor(30000, 0), 0);
});

test('arguments: rising clocks, at most 12 workers, depth held at 4', () => {
  const d = parseCurveArgs([]);
  assert.deepEqual(d.budgets, [30000]);
  assert.equal(d.attempts, 2);
  assert.equal(d.workers, MAX_WORKERS);
  assert.equal(MAX_WORKERS, 12);
  assert.equal(DEPTH, 4);
  assert.equal(d.seed, 33);
  assert.deepEqual(parseCurveArgs(['--budget-ms', '3000,30000']).budgets, [3000, 30000]);
  assert.throws(() => parseCurveArgs(['--budget-ms', '30000,3000']));
  assert.throws(() => parseCurveArgs(['--workers', '13']));
  assert.throws(() => parseCurveArgs(['--admit-mb', '5000', '--preempt-mb', '4000']));
  assert.equal(parseCurveArgs(['--limit', '100', '--seed', '7']).limit, 100);
});

// ------------------------------------------------------------------ the verdicts on disk
function commonShape(v, name) {
  assert.match(v.at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, name + ': an ISO at');
  assert.match(v.command, /^node bench\/grid-curve\.mjs /, name + ': the command');
  assert.match(v.node, /^v\d+/);
  assert.equal(typeof v.isTheBar, 'boolean', name + ': a top level boolean isTheBar');
  assert.equal(typeof v.barMet, 'boolean', name + ': a top level boolean barMet');
  assert.equal(typeof v.split, 'object');
  assert.ok(v.split.development && v.split.heldOut, name + ': the split object names development and heldOut');
  assert.equal(v.maxDepth, 4, name + ': depth held at 4');
  assert.equal(v.vocabulary, 196, name + ': vocabulary held at 196');
  assert.equal(v.model, null, name + ': MODEL OFF');
  assert.equal(v.attemptsAllowedByArc, 2);
  assert.equal(v.secondAttemptRule, ORDER_RULE);
  assert.equal(typeof v.statement, 'string');
  assert.ok(v.statement.length > 200);
  assert.doesNotMatch(JSON.stringify(v), /\u2014/, name + ': no em-dash');
}

test('grid-attempts.json after the 3000 ms attempts run: shape, the paired loss, the order of every emitted pair', () => {
  const v = readVerdict('grid-attempts.json');
  commonShape(v, 'grid-attempts.json');
  assert.equal(v.isTheBar, false, 'the bar file is grid-curve.json');
  assert.equal(v.barMet, false);
  assert.equal(v.arcSplit, 'evaluation');
  assert.equal(v.contaminated, true, '070dd51e duplicates a training task');
  assert.match(v.statement, /ontaminat/);
  assert.equal(v.attempts, 2);
  assert.equal(v.budgetMs, 3000);
  assert.equal(v.workers, 12);
  assert.equal(v.of, 400);
  assert.equal(v.rows.length, v.of);
  assert.equal(v.pct, Math.round((10000 * v.solved) / v.of) / 100);
  assert.equal(v.solved, v.rows.filter((r) => r.solved).length);
  assert.equal(v.solvedAtFirstFound + v.rescuedBySecond, v.solved);
  assert.equal(v.timedOut + v.foundButWrong + v.exhausted + v.errors + v.solved, v.of, "every task is exactly one of solved, found but wrong, timed out, exhausted, error");
  assert.ok(Array.isArray(v.lost));
  assert.equal(v.lostCount, v.lost.length);
  assert.deepEqual(v.paired.lost, v.lost);
  assert.ok(Array.isArray(v.paired.gained));
  assert.equal(v.base.file, 'bench/verdicts/grid-local-evaluation.json');
  assert.equal(v.convertedFoundButWrong.of, v.base.foundButWrong, 'k of the found but wrong rows of the one attempt run');
  assert.equal(v.convertedFoundButWrong.converted, v.convertedFoundButWrong.ids.length);
  assert.equal(v.control.file, 'bench/verdicts/grid-split-evaluation-control.json', 'the control is named');
  const base = readVerdict('grid-local-evaluation.json');
  const recomputed = pairById(v.rows, base.rows);
  assert.deepEqual(recomputed.gained, v.paired.gained, 'the gain recomputes from the rows');
  assert.deepEqual(recomputed.lost, v.lost, 'the loss recomputes from the rows');
  assert.equal(convertedFoundButWrong(v.rows, base.rows).converted, v.convertedFoundButWrong.converted);
  for (const r of v.rows) {
    assert.ok(r.attempts.length <= 2, r.id + ': at most two attempts');
    if (r.attempts.length === 2) {
      const [a, b] = r.attempts;
      assert.ok(programLength(a) < programLength(b) || (programLength(a) === programLength(b) && a.found < b.found), r.id + ': length first, then discovery');
    }
    if (r.attemptRight) assert.equal(r.solved, r.attemptRight.some(Boolean), r.id + ': solved when either attempt is right');
  }
  assert.ok(existsSync(path.join(ROOT, v.journal)), 'the journal is on disk');
});

test('grid-curve.json after the 30000 ms point: the bar file, its points, the 3000 ms point with its stamp, the next command', () => {
  const v = readVerdict('grid-curve.json');
  const att = readVerdict('grid-attempts.json');
  commonShape(v, 'grid-curve.json');
  assert.equal(v.isTheBar, true, 'the evaluation curve over every task is the bar file');
  assert.equal(v.arcSplit, 'evaluation');
  assert.equal(v.contaminated, true);
  assert.match(v.statement, /ontaminat/);
  assert.equal(v.bar.score, 98);
  assert.equal(v.barMet, v.points[v.points.length - 1].pct >= v.bar.score);
  const keys = ['budgetMs', 'attempts', 'workers', 'solved', 'of', 'pct', 'timedOut', 'foundButWrong', 'exhausted', 'meanMs', 'wallSeconds', 'gainedIds', 'lostIds'];
  for (const p of v.points) for (const k of keys) assert.ok(k in p, 'point ' + p.budgetMs + ' ms has ' + k);
  const at3 = v.points.find((p) => p.budgetMs === 3000 && p.attempts === 2);
  assert.ok(at3, 'the 3000 ms two attempt point');
  assert.equal(at3.solved, att.solved, 'copied from grid-attempts.json');
  assert.equal(at3.source.at, att.at, 'with its stamp');
  const at30 = v.points.find((p) => p.budgetMs === 30000);
  assert.ok(at30, 'the 30000 ms point');
  assert.equal(at30.attempts, 2);
  assert.equal(at30.of, 400);
  assert.equal(at30.ran + at30.carried, 400);
  assert.ok(Array.isArray(at30.gainedIds) && Array.isArray(at30.lostIds));
  assert.equal(at30.pairedWith, '3000 ms, 2 attempts');
  const m = v.marginal.find((x) => x.fromMs === 3000 && x.toMs === 30000);
  assert.ok(m, 'the marginal from 3000 to 30000 ms');
  assert.equal(m.net, at30.solved - at3.solved);
  assert.equal(m.gained - m.lost, m.net, 'the net is the paired gain less the paired loss');
  assert.match(v.nextCommand, /--budget-ms 300000/);
  assert.match(v.nextCommand, /--only-timed-out-of bench\/verdicts\/grid-curve-evaluation-30000ms\.jsonl/);
  assert.ok(v.control && /grid-curve-partial\.json$/.test(v.control.file), 'the training control is named');
  assert.equal(v.rows.length, 400);
  for (const j of v.journals) assert.ok(existsSync(path.join(ROOT, j.file)), j.file + ' on disk');
});

test('grid-curve-partial.json, the control: the training split, a fixed seed draw of 100, not the bar', () => {
  const v = readVerdict('grid-curve-partial.json');
  commonShape(v, 'grid-curve-partial.json');
  assert.equal(v.arcSplit, 'training');
  assert.equal(v.isTheBar, false);
  assert.equal(v.barMet, false);
  assert.equal(v.selection.n, 100);
  assert.match(v.selection.what, /seed 33/);
  assert.deepEqual(v.rows.map((r) => r.id), drawIds(v.split.development.ids, 100, 33), 'the draw recomputes from seed 33');
  const at30 = v.points.find((p) => p.budgetMs === 30000);
  assert.ok(at30 && Array.isArray(at30.gainedIds) && Array.isArray(at30.lostIds), 'the 30000 ms point paired');
});
