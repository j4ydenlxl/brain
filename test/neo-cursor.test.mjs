// test/neo-cursor.test.mjs: THE CURSOR of the NEO engine (THE ENGINE part 2, contract c3 "cursor"): every grow of a task
// continues where the last one stopped. resumeCursor reads the cursor a grow wrote in the ledger (another version or
// basis starts again at round 0); two consecutive grows of an unmastered task generate disjoint candidates, and a third
// is disjoint from both; the cursor travels through the ledger in direct mode and through a stage file and its merge;
// a mastered task is skipped and stages nothing. Temp roots only, offline: no test reads the tree's grown/ or neo/.
// Author: THE ENGINE builder, part 2 (knowledge-backed cells, THE CURSOR), 2026-10-01.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, resumeCursor, cursorBasis, CURSOR_VERSION, MAX_COST, MAX_COST_CEIL } from '../grow/neo-core.mjs';
import { growTask, mergeStage, stageErrors, featuresOf, status, main } from '../grow/neo.mjs';
import { renderIndexMjs } from '../grow/store.mjs';
import { expectOk } from '../judge/judge.mjs';
import { shaText } from '../grow/teach.mjs';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'neo-cursor-'));
const cleanup = () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* already gone */ } };
after(cleanup);
process.on('exit', cleanup);
let dirN = 0;
const tmpDir = (name) => { const d = path.join(TMP, name + '-' + (++dirN)); fs.mkdirSync(d, { recursive: true }); return d; };
const put = (root, rel, text) => { const f = path.join(root, ...rel.split('/')); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); return f; };
const jsonl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
const readJ = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

// ---------------------------------------------------------------- fixtures
/** Rows of a hidden rule over two numbers: a sentence with the two numbers and their sum. */
const sumRows = (from, k) => Array.from({ length: k }, (_, i) => { const a = from + 3 * i, b = 2 * from + 7 * i + 1; return { q: `what is ${a} plus ${b}`, expect: { contains: [String(a + b)] }, answer: `${a} plus ${b} is ${a + b}.` }; });
const SUM_DEV = sumRows(11, 16);
const doubledRows = (from, k) => Array.from({ length: k }, (_, i) => { const n = from + 7 * i; return { q: [`Double ${n}`, `What is ${n} doubled?`, `Twice ${n} is what?`][i % 3], expect: { equals: String(2 * n) }, answer: String(2 * n) }; });
const DEV = doubledRows(5, 20), HELD = doubledRows(400, 10).map((r) => ({ q: r.q, expect: r.expect }));
const SMALL = { maxGenerated: 4000, maxMs: 600000 }; // a count budget: the same rows give the same search, so the rounds can be compared

/** A tree with the task doubled opened in neo/, an empty grown/ and judge/control.jsonl. */
function cursorRoot(task = 'doubled') {
  const root = tmpDir('cursor-root');
  const index = { generation: 1, cells: [] };
  put(root, 'grown/index.json', JSON.stringify(index, null, 2) + '\n');
  put(root, 'grown/index.mjs', renderIndexMjs(index));
  const d = jsonl(DEV), h = jsonl(HELD);
  put(root, 'neo/tasks/' + task + '/dev.jsonl', d);
  put(root, 'neo/tasks/' + task + '/heldout.jsonl', h);
  put(root, 'neo/tasks/' + task + '/task.json', JSON.stringify({ task, skill: task, domain: 'test', rule: 'hidden', generation: 1, by: 'test' }) + '\n');
  put(root, 'neo/LEDGER.json', JSON.stringify({ tasks: [{ task, generation: 1, devSha: shaText(d), heldoutSha: shaText(h), dev: 20, heldout: 10, by: 'test', at: '2026-10-01T00:00:00.000Z' }], generated: 0, note: 'kept' }, null, 2) + '\n');
  put(root, 'judge/control.jsonl', jsonl([{ q: 'tell me a joke about cats' }]));
  return root;
}
const nobody = async (rows) => rows.map((r) => ({ q: r.q, got: null }));
/** Set the task's present colony row to a held-out score below 1 (unmastered), as a regate of a harder set would. */
function unmaster(root, id) {
  const f = path.join(root, 'grown', 'index.json'), ix = readJ(f);
  ix.cells.find((r) => r.id === id).heldout = { score: 0.9, n: 10, ok: 9 };
  fs.writeFileSync(f, JSON.stringify(ix, null, 2) + '\n');
}

// ---------------------------------------------------------------- resumeCursor and the basis
const BASIS = cursorBasis(SUM_DEV);
const C0 = { v: CURSOR_VERSION, basis: BASIS, round: 0, at: 1234, maxCost: MAX_COST, done: false, cost: 5, prim: 'transform.add', tpl: 64 };

test('resumeCursor: no cursor is round 0, the whole search', () => {
  const zero = { round: 0, replay: 0, maxCost: MAX_COST, window: 0 };
  assert.deepEqual(resumeCursor(null, BASIS), zero);
  assert.deepEqual(resumeCursor(undefined, BASIS), zero);
  assert.deepEqual(resumeCursor('round 3', BASIS), zero);
});

test('resumeCursor: a cursor continues one round on, past its combos and template window, at the same cost while not done', () => {
  assert.deepEqual(resumeCursor(C0, BASIS), { round: 1, replay: 1234, maxCost: MAX_COST, window: 64 });
  assert.deepEqual(resumeCursor({ ...C0, round: 4 }, BASIS), { round: 5, replay: 1234, maxCost: MAX_COST, window: 64 });
  assert.deepEqual(resumeCursor({ ...C0, tpl: undefined }, BASIS), { round: 1, replay: 1234, maxCost: MAX_COST, window: 0 });
});

test('resumeCursor: a done enumeration goes one cost deeper, never past MAX_COST_CEIL', () => {
  assert.equal(resumeCursor({ ...C0, done: true }, BASIS).maxCost, MAX_COST + 1);
  assert.equal(resumeCursor({ ...C0, done: true, maxCost: MAX_COST_CEIL - 1 }, BASIS).maxCost, MAX_COST_CEIL);
  assert.equal(resumeCursor({ ...C0, done: true, maxCost: MAX_COST_CEIL }, BASIS).maxCost, MAX_COST_CEIL);
  assert.equal(resumeCursor({ ...C0, done: 'yes' }, BASIS).maxCost, MAX_COST, 'done means true');
});

test('resumeCursor: a cursor of another version or basis, or with a field out of shape, starts again at round 0', () => {
  const zero = { round: 0, replay: 0, maxCost: MAX_COST, window: 0 };
  assert.deepEqual(resumeCursor({ ...C0, v: CURSOR_VERSION + 1 }, BASIS), zero);
  assert.deepEqual(resumeCursor(C0, cursorBasis(sumRows(12, 16))), zero);
  assert.deepEqual(resumeCursor(C0, null), zero);
  for (const bad of [{ round: -1 }, { round: 1.5 }, { at: -3 }, { at: '9' }, { maxCost: 1 }, { maxCost: MAX_COST_CEIL + 1 }, { tpl: -1 }, { tpl: 2.5 }]) {
    assert.deepEqual(resumeCursor({ ...C0, ...bad }, BASIS), zero, JSON.stringify(bad));
  }
});

test('cursorBasis: the rows (prompt, answer, expect) and the packs the search starts from; the same inputs, the same basis', () => {
  assert.equal(cursorBasis(SUM_DEV), cursorBasis(SUM_DEV.map((r) => ({ ...r }))));
  assert.match(cursorBasis(SUM_DEV), /^[0-9a-f]{64}$/);
  const other = [
    cursorBasis(SUM_DEV.slice(1)),
    cursorBasis(SUM_DEV.map((r, i) => (i ? r : { ...r, answer: r.answer + ' ' }))),
    cursorBasis(SUM_DEV.map((r, i) => (i ? r : { ...r, expect: { contains: ['x'] } }))),
    cursorBasis(SUM_DEV, [{ id: 'p', sha: 'a'.repeat(64), columns: ['k'], rows: [] }]),
    cursorBasis(SUM_DEV, [{ id: 'p', sha: 'b'.repeat(64), columns: ['k'], rows: [] }]),
  ];
  assert.equal(new Set([BASIS, ...other]).size, other.length + 1);
});

// ---------------------------------------------------------------- consecutive spawns: disjoint candidates
const R0 = spawn({ task: 'sum', rows: SUM_DEV, budget: SMALL, trace: true, expectOk });
const R1 = spawn({ task: 'sum', rows: SUM_DEV, budget: SMALL, trace: true, expectOk, cursor: R0.stats.cursor, parents: R0.cells });
const R2 = spawn({ task: 'sum', rows: SUM_DEV, budget: SMALL, trace: true, expectOk, cursor: R1.stats.cursor, parents: [...R0.cells, ...R1.cells] });

test('two consecutive spawns of an unmastered task generate disjoint candidates, and a third is disjoint from both', () => {
  const [a, b, c] = [R0, R1, R2].map((r) => new Set(r.stats.trace));
  assert.ok(a.size >= 1000 && b.size >= 1000 && c.size >= 100, 'each round offers candidates: ' + [a.size, b.size, c.size]);
  assert.ok([...b].some((t) => t.startsWith('template ')), 'round 1 offers the templates of the next window');
  const both = (x, y) => [...x].filter((t) => y.has(t));
  assert.deepEqual(both(a, b), []);
  assert.deepEqual(both(a, c), []);
  assert.deepEqual(both(b, c), []);
  assert.deepEqual([R0, R1, R2].map((r) => r.stats.cursor.round), [0, 1, 2]);
});

test('the cursor moves on: the combos and the template window grow round by round, on the same basis', () => {
  const [c0, c1, c2] = [R0, R1, R2].map((r) => r.stats.cursor);
  assert.equal(c0.done, false, 'the budget stopped round 0 before the deepest cost');
  assert.ok(c0.at > 0 && c1.at > c0.at && c2.at > c1.at, [c0.at, c1.at, c2.at].join(' '));
  assert.ok(c0.tpl > 0 && c1.tpl > c0.tpl && c2.tpl >= c1.tpl, 'the window moves past the entries it took, and waits when none is new: ' + [c0.tpl, c1.tpl, c2.tpl].join(' '));
  assert.ok(c0.basis === c1.basis && c1.basis === c2.basis && c0.basis === cursorBasis(SUM_DEV));
  assert.equal(c0.v, CURSOR_VERSION);
});

test('a later round keeps its parents: every cell of the rounds before it is in its population', () => {
  const ids = new Set(R2.cells.map((c) => c.id));
  assert.ok(R0.cells.filter((c) => !ids.has(c.id)).length <= R0.cells.length - 1, 'round 2 holds cells of round 0');
  assert.ok(R1.stats.bySource.parent >= 1 && R2.stats.bySource.parent >= 1);
});

test('no cursor, or a cursor of other rows, reproduces round 0 exactly', () => {
  const again = spawn({ task: 'sum', rows: SUM_DEV, budget: SMALL, trace: true, expectOk });
  assert.deepEqual(again.stats.trace, R0.stats.trace);
  assert.deepEqual(again.cells, R0.cells);
  const foreign = spawn({ task: 'sum', rows: SUM_DEV, budget: SMALL, trace: true, expectOk, cursor: { ...R1.stats.cursor, basis: cursorBasis(sumRows(12, 16)) } });
  assert.equal(foreign.stats.cursor.round, 0);
  assert.deepEqual(foreign.stats.trace, R0.stats.trace);
});

test('the same cursor gives the same round: a round is a function of its rows, packs, parents and cursor', () => {
  const again = spawn({ task: 'sum', rows: SUM_DEV, budget: SMALL, trace: true, expectOk, cursor: R0.stats.cursor, parents: R0.cells });
  assert.deepEqual(again.stats.trace, R1.stats.trace);
  assert.deepEqual(again.stats.cursor, R1.stats.cursor);
});

test('a done enumeration: the next round goes one cost deeper and offers what the deeper cost adds', () => {
  const rows = [{ q: 'say 3', expect: { equals: '3' }, answer: '3' }, { q: 'say 8', expect: { equals: '8' }, answer: '8' }];
  const a = spawn({ task: 'say', rows, budget: { maxGenerated: 5000000, maxMs: 600000 }, trace: true, expectOk });
  assert.equal(a.stats.cursor.done, true);
  assert.equal(a.stats.cursor.maxCost, MAX_COST);
  const b = spawn({ task: 'say', rows, budget: { maxGenerated: 5000000, maxMs: 600000 }, trace: true, expectOk, cursor: a.stats.cursor });
  assert.equal(b.stats.cursor.maxCost, MAX_COST + 1);
  assert.equal(b.stats.cursor.round, 1);
  const seen = new Set(a.stats.trace);
  assert.deepEqual(b.stats.trace.filter((t) => seen.has(t)), []);
});

// ---------------------------------------------------------------- the cursor in the ledger: direct, stage and merge
test('direct mode: each grow writes its cursor on the task ledger row; the next grow continues from it', async () => {
  const root = cursorRoot();
  const first = await growTask({ root, task: 'doubled', gen: 2, organism: nobody, budget: SMALL });
  assert.equal(first.round, 0);
  const c0 = readJ(path.join(root, 'neo', 'LEDGER.json')).tasks[0].cursor;
  assert.equal(c0.round, 0);
  assert.equal(c0.basis.length, 64);
  if (first.promoted) unmaster(root, first.id);
  const second = await growTask({ root, task: 'doubled', gen: 3, organism: nobody, budget: SMALL });
  assert.equal(second.round, 1);
  const led = readJ(path.join(root, 'neo', 'LEDGER.json'));
  assert.equal(led.tasks[0].cursor.round, 1);
  assert.ok(led.tasks[0].cursor.at > c0.at);
  assert.equal(led.note, 'kept', 'every other ledger key is kept');
  assert.equal(led.tasks[0].devSha, shaText(jsonl(DEV)));
});

test('stage mode: the stage file carries the cursor, the ledger waits for the merge, and the merge writes it', async () => {
  const root = cursorRoot(), stage = tmpDir('stage');
  const ledPath = path.join(root, 'neo', 'LEDGER.json'), led0 = fs.readFileSync(ledPath, 'utf8');
  const line = await growTask({ root, task: 'doubled', gen: 2, organism: nobody, budget: SMALL, stage });
  const doc = readJ(path.join(stage, 'doubled.json'));
  assert.equal(stageErrors(doc, 'doubled.json'), null);
  assert.equal(doc.ledger.cursor.round, 0);
  assert.deepEqual(doc.ledger.cursor, doc.stats.cursor);
  assert.equal(line.round, 0);
  assert.equal(fs.readFileSync(ledPath, 'utf8'), led0, 'a stage writes nothing in the tree');
  const m = await mergeStage({ root, dir: stage, organism: nobody });
  assert.deepEqual(m.refused, []);
  assert.deepEqual(m.merged, ['doubled']);
  assert.deepEqual(readJ(ledPath).tasks[0].cursor, doc.ledger.cursor);
  if (m.promoted.length) unmaster(root, m.promoted[0]);
  const stage2 = tmpDir('stage');
  await growTask({ root, task: 'doubled', gen: 3, organism: nobody, budget: SMALL, stage: stage2 });
  assert.equal(readJ(path.join(stage2, 'doubled.json')).ledger.cursor.round, 1, 'the second stage continues from the merged cursor');
});

test('stageErrors refuses a ledger cursor that is not a cursor { round, .. }, and takes a stage without one', async () => {
  const root = cursorRoot(), stage = tmpDir('stage');
  await growTask({ root, task: 'doubled', gen: 2, organism: nobody, budget: SMALL, stage });
  const doc = readJ(path.join(stage, 'doubled.json'));
  const why = 'the ledger cursor is not a cursor { round, .. }';
  for (const bad of [null, 'x', 3, { at: 5 }, { round: -1 }, { round: 1.5 }, { round: '1' }]) {
    assert.equal(stageErrors({ ...doc, ledger: { ...doc.ledger, cursor: bad } }, 'doubled.json'), why, JSON.stringify(bad));
  }
  const { cursor, ...noCursor } = doc.ledger;
  assert.equal(cursor.round, 0);
  assert.equal(stageErrors({ ...doc, ledger: noCursor }, 'doubled.json'), null);
  put(stage, 'doubled.json', JSON.stringify({ ...doc, ledger: { ...doc.ledger, cursor: { round: -2 } } }) + '\n');
  const m = await mergeStage({ root, dir: stage, organism: nobody });
  assert.deepEqual(m.refused.map((r) => r.why), [why]);
  assert.equal(readJ(path.join(root, 'neo', 'LEDGER.json')).tasks[0].cursor, undefined, 'a refused stage writes no cursor');
});

test('a mastered task is skipped in stage mode too: no stage file, nothing spawned', async () => {
  const root = cursorRoot(), stage = tmpDir('stage');
  const first = await growTask({ root, task: 'doubled', gen: 2, organism: nobody, budget: { maxGenerated: 20000 } });
  assert.equal(first.promoted, true, JSON.stringify(first.why));
  assert.deepEqual(first.heldout, { ok: 10, n: 10, score: 1 });
  const again = await growTask({ root, task: 'doubled', gen: 3, organism: nobody, budget: SMALL, stage });
  assert.equal(again.skipped, true);
  assert.equal(again.generated, 0);
  assert.deepEqual(fs.readdirSync(stage), []);
});

test('contract c3: the features name "know" and "cursor", in featuresOf, in status and in the status CLI line', async () => {
  for (const f of ['gate', 'stage', 'core', 'know', 'cursor']) assert.ok(featuresOf().includes(f), f);
  const root = cursorRoot();
  assert.ok(status(root).features.includes('know') && status(root).features.includes('cursor'));
  const logs = [];
  assert.equal(await main(['status', '--root', root], { log: (s) => logs.push(s), err: () => {} }), 0);
  const line = JSON.parse(logs.at(-1));
  assert.ok(line.features.includes('know') && line.features.includes('cursor'));
});
