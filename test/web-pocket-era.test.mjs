// test/web-pocket-era.test.mjs: THE POCKET BODY (web/pocket-era.mjs), the phone burning eras. Offline: the worker
// runs on a PLANTED scope with a planted clock, setTimeout, fetch, IndexedDB and core; the integration at the end
// runs the REAL search core (grow/neo-core.mjs and grow/neo-kernel.mjs, the files web/pocket.mjs ships) on fixture
// rows written here. Nothing here reads the tree's grown/ or neo/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SLICE_MS, SEARCH_SHARE, BATTERY_FLOOR, STORE_CAP, DB_NAME, DB_STORE, SWITCH_KEY, ROUTE_LINE, NO_CORE, MIN_FIT, MIN_CHECK, MAX_FIT, MAX_CELLS,
  GEN, WHY, CORE_URL, KERNEL_URL, TASKS_URL, sizeOf, loadCore, gateFits, taskRows, taskList, splitRows, fitWindow, idbStore, cleanMeta, zeroMeta,
  cleanTask, overCap, readStore, countsOf, bodyLine, nextBudget, envWhy, startWorker, deviceAnswer, envOf, startBody, pageStore,
} from '../web/pocket-era.mjs';
import * as CORE from '../grow/neo-core.mjs';
import * as KERNEL from '../grow/neo-kernel.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(path.join(HERE, '..', 'web', 'pocket-era.mjs'), 'utf8');
const BASE = 'https://pocket.test/organism/era/';
const W8 = ['apple', 'river', 'stone', 'cloud', 'tiger', 'lemon', 'piano', 'candle'];
const rowsOf = (f) => W8.map((w) => { const [q, a] = f(w); return { q, expect: { equals: a }, answer: a }; });
const UPPER = rowsOf((w) => ['upper ' + w, w.toUpperCase()]);
const LOWER = rowsOf((w) => ['lower ' + w.toUpperCase(), w]);
const REVERSE = rowsOf((w) => ['reverse the word ' + w, w.split('').reverse().join('')]);
const LETTERS = rowsOf((w) => ['how many letters in ' + w, String(w.length)]);

/** A store over a Map, as idbStore gives it; all() in key order, every call recorded. */
function memStore(init = []) {
  const m = new Map(init);
  const log = [];
  return {
    m, log,
    get: async (k) => { log.push(['get', k]); return m.get(k); },
    put: async (k, v) => { log.push(['put', k]); m.set(k, JSON.parse(JSON.stringify(v))); },
    del: async (k) => { log.push(['del', k]); m.delete(k); },
    all: async () => [...m.entries()].sort((a, b) => (String(a[0]) < String(b[0]) ? -1 : String(a[0]) > String(b[0]) ? 1 : 0)),
  };
}

/** A cell the fake kernel runs: a table from prompt to answer. */
const cell = (id, map, extra = {}) => ({ id, map, ...extra });
const tableOf = (rows, wrong = []) => Object.fromEntries(rows.map((r) => [r.q, wrong.includes(r.q) ? 'wrong' : r.expect.equals]));

/**
 * A fake search core on a planted clock: spawn advances the clock by cost ms per candidate it may try and returns
 * what make(args) gives. The kernel runs a cell by its table.
 */
function fakeCore(clk, { cost = 0.1, make = () => [], throws = null } = {}) {
  const calls = [];
  const core = {
    BUILTIN_LIST: ['hello', 'what time is it'],
    spawn(args) {
      calls.push(args);
      if (throws) throw new Error(throws);
      clk.t += typeof cost === 'function' ? cost(args) : args.budget.maxGenerated * cost;
      return { cells: make(args), stats: { generated: args.budget.maxGenerated } };
    },
    passesRow: (a, r) => a === r.expect.equals,
    deriveTemplates: (qs) => CORE.deriveTemplates(qs),
    fitsTemplates: (t, q) => CORE.fitsTemplates(t, q),
  };
  const kernel = {
    runCell: (c, q) => (c.map && Object.hasOwn(c.map, q) ? c.map[q] : null),
    makeColony: (cs) => ({ answer: (q) => { for (const c of cs) if (c.map && Object.hasOwn(c.map, q)) return c.map[q]; return null; } }),
    checkCell: (c) => ({ ok: !c.bad }),
  };
  return { core, kernel, calls };
}

/**
 * The worker on a planted scope: clock, timers (run by hand), fetch over a table of JSON, the store and the core.
 * files maps a URL to a JSON value, or to a number (that status, no body).
 */
function rig({ files = {}, store = memStore(), core = undefined, cost = 0.1, make, throws, cap, load, openStore, scopeExtra = {} } = {}) {
  const clk = { t: 1000 };
  const C = core === undefined ? fakeCore(clk, { cost, make, throws }) : core;
  const posts = [], timers = [], fetched = [];
  let listener = null;
  const scope = { postMessage: (m) => posts.push(m), addEventListener: (t, f) => { if (t === 'message') listener = f; }, ...scopeExtra };
  const fetch = async (u) => {
    fetched.push(String(u));
    const v = files[String(u)];
    if (v === undefined) return { ok: false, status: 404, json: async () => { throw new Error('no body'); } };
    if (typeof v === 'number') return { ok: v >= 200 && v < 300, status: v, json: async () => null };
    return { ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(v)) };
  };
  let wall = 0;
  const w = startWorker(scope, {
    now: () => clk.t, clock: () => ++wall, setTimeout: (f, ms) => { timers.push({ f, ms }); return timers.length; },
    fetch, load: load || (async () => (C ? { core: C.core, kernel: C.kernel } : null)), openStore: openStore || (async () => store), tasksUrl: BASE + 'tasks.json', cap,
  });
  const env = (e = {}) => listener({ data: { type: 'env', ...e } });
  /** Run the next timer, after the planted clock reaches it. */
  const run = async () => { const x = timers.shift(); assert.ok(x, 'a tick was scheduled'); clk.t += x.ms; await x.f(); };
  const last = () => posts.at(-1).status;
  return { w, clk, C, posts, timers, fetched, env, run, last, store };
}
const list = (...tasks) => ({ tasks: tasks.map((t) => (typeof t === 'string' ? { task: t, file: 'tasks/' + t + '.json' } : t)) });
const taskFile = (task, rows) => ({ task, rows });
const filesFor = (tasks) => {
  const out = { [BASE + 'tasks.json']: list(...Object.keys(tasks)) };
  for (const [t, rows] of Object.entries(tasks)) out[BASE + 'tasks/' + t + '.json'] = taskFile(t, rows);
  return out;
};

// ---------------------------------------------------------------- THE DUTY CYCLE

test('the constants of the body: a 50 ms slice, half of it for the search, a 20 percent battery floor, a 5 MB store, the route line', () => {
  assert.equal(SLICE_MS, 50);
  assert.equal(SEARCH_SHARE, 0.5);
  assert.equal(BATTERY_FLOOR, 0.2);
  assert.equal(STORE_CAP, 5 * 1024 * 1024);
  assert.equal(ROUTE_LINE, 'grown on this device, no server');
  assert.equal(WHY.core, NO_CORE);
  assert.deepEqual([DB_NAME, DB_STORE, SWITCH_KEY], ['dilation-pocket-era', 'kv', 'dilation.body']);
  assert.ok(CORE_URL.endsWith('/grow/neo-core.mjs') && KERNEL_URL.endsWith('/grow/neo-kernel.mjs') && TASKS_URL.endsWith('/era/tasks.json'));
  assert.equal(bodyLine({ cells: 3, tasks: 2, tried: 900 }), 'this device: 3 cells kept for 2 tasks, 900 tried, running');
  assert.equal(bodyLine({ why: WHY.hidden }), 'this device: 0 cells kept for 0 tasks, 0 tried, paused (page hidden)');
  assert.equal(bodyLine(), 'this device: 0 cells kept for 0 tasks, 0 tried, running');
});

test('nothing runs before the page speaks; a slice then rests at least SLICE_MS and at least as long as it worked', async () => {
  const r = rig({ files: filesFor({ upper: UPPER }), cost: 0.1 });
  assert.equal(r.timers.length, 0, 'a worker scheduled work before the page said anything');
  assert.equal(r.posts.length, 0);
  r.env();
  assert.deepEqual(r.timers.map((x) => x.ms), [0]);
  r.env();
  assert.equal(r.timers.length, 1, 'a second message does not schedule a second tick');
  await r.run();
  // 200 candidates at 0.1 ms each: a 20 ms slice rests the floor, 50 ms
  let s = r.last();
  assert.deepEqual([s.lastSliceMs, s.lastRestMs, s.running, s.why, s.iterations, s.tried], [20, 50, true, null, 1, 200]);
  assert.equal(s.line, 'this device: 0 cells kept for 0 tasks, 200 tried, running');
  assert.deepEqual(r.timers.map((x) => x.ms), [50]);
  r.env();
  assert.equal(r.timers.length, 1, 'a message while a tick waits does not add one');
  // a slow slice: 200 candidates at 0.4 ms is 80 ms, so it rests 80 ms, and the next slice tries fewer
  const slow = rig({ files: filesFor({ upper: UPPER }), cost: 0.4 });
  slow.env();
  await slow.run();
  s = slow.last();
  assert.deepEqual([s.lastSliceMs, s.lastRestMs], [80, 80]);
  assert.deepEqual(slow.timers.map((x) => x.ms), [80]);
  for (let i = 0; i < 4; i++) await slow.run();
  const tries = slow.C.calls.map((c) => c.budget.maxGenerated);
  assert.deepEqual(tries, [200, 50, 50, 50, 50]);
  for (const c of slow.C.calls) assert.equal(c.budget.maxMs, Math.floor((SLICE_MS * SEARCH_SHARE) / 2));
  s = slow.last();
  assert.ok(s.lastSliceMs <= SLICE_MS * SEARCH_SHARE && s.lastRestMs === SLICE_MS, JSON.stringify(s));
  assert.equal(s.maxSliceMs, 80);
  // every rest the worker asked for is at least the slice before it and at least SLICE_MS
  for (const x of slow.timers) assert.ok(x.ms >= SLICE_MS);
});

test('nextBudget: over the search share it shrinks in proportion, under half of it it grows by a quarter, within GEN', () => {
  const goal = SLICE_MS * SEARCH_SHARE;
  assert.equal(goal, 25);
  assert.equal(nextBudget(200, 50), 80);
  assert.equal(nextBudget(200, 80), 50);
  assert.equal(nextBudget(200, 10), 250);
  assert.equal(nextBudget(200, 20), 200);
  assert.equal(nextBudget(200, 25), 200);
  assert.equal(nextBudget(200, 12.5), 200);
  assert.equal(nextBudget(25, 1000), GEN.min);
  assert.equal(nextBudget(19000, 1), GEN.max);
  assert.equal(nextBudget(NaN, 10), 250);
  assert.equal(nextBudget(-1, 20), GEN.start);
  assert.equal(nextBudget(100, NaN), 100);
  assert.equal(nextBudget(100, -5), 100);
  assert.deepEqual(GEN, { start: 200, min: 20, max: 20000 });
});

test('the budget belongs to its task: a slow task tries fewer candidates without starving a fast one', async () => {
  const r = rig({ files: filesFor({ upper: UPPER, lower: LOWER }), cost: (a) => a.budget.maxGenerated * (a.task === 'upper' ? 0.5 : 0.01) });
  r.env();
  for (let i = 0; i < 6; i++) await r.run();
  const by = (t) => r.C.calls.filter((c) => c.task === t).map((c) => c.budget.maxGenerated);
  assert.deepEqual(by('upper'), [200, 40, 40]);
  assert.deepEqual(by('lower'), [200, 250, 313]);
});

test('every pause reason stops the slices and says why on the line; the next message from the page resumes', async () => {
  const cases = [
    [{ hidden: true }, WHY.hidden],
    [{ saveData: true }, WHY.saveData],
    [{ battery: { level: 0.19, charging: false } }, WHY.battery],
    [{ battery: { level: 0.05, charging: false } }, WHY.battery],
    [{ stopped: true }, WHY.stopped],
    [{ stopped: true, hidden: true, saveData: true }, WHY.stopped],
    [{ hidden: true, saveData: true }, WHY.hidden],
  ];
  for (const [e, why] of cases) {
    const r = rig({ files: filesFor({ upper: UPPER }) });
    r.env(e);
    await r.run();
    assert.equal(r.C.calls.length, 0, JSON.stringify(e) + ' sliced');
    assert.equal(r.last().why, why);
    assert.equal(r.last().running, false);
    assert.equal(r.last().line, 'this device: 0 cells kept for 0 tasks, 0 tried, paused (' + why + ')');
    assert.equal(r.timers.length, 0, 'a paused body schedules nothing');
    assert.deepEqual(r.fetched, [], 'a paused body fetches nothing');
    r.env();
    await r.run();
    assert.equal(r.C.calls.length, 1, 'the page said go and nothing ran');
    assert.equal(r.last().running, true);
  }
  // charging, or at the floor, or no battery reading: it runs
  for (const battery of [{ level: 0.19, charging: true }, { level: 0.2, charging: false }, null, { charging: false }]) {
    const r = rig({ files: filesFor({ upper: UPPER }) });
    r.env({ battery });
    await r.run();
    assert.equal(r.C.calls.length, 1, JSON.stringify(battery));
  }
  // a pause that arrives while a tick waits: that tick pauses, nothing more is scheduled
  const r = rig({ files: filesFor({ upper: UPPER }) });
  r.env();
  await r.run();
  r.env({ hidden: true });
  await r.run();
  assert.equal(r.C.calls.length, 1);
  assert.equal(r.last().why, WHY.hidden);
  assert.equal(r.timers.length, 0);
});

test('envWhy reads the switch first, then visibility, save-data and the battery; anything that is not a message waits', () => {
  assert.equal(envWhy(null), WHY.waiting);
  assert.equal(envWhy('hidden'), WHY.waiting);
  assert.equal(envWhy([]), WHY.waiting);
  assert.equal(envWhy({}), null);
  assert.equal(envWhy({ stopped: true, hidden: true }), WHY.stopped);
  assert.equal(envWhy({ hidden: true, saveData: true }), WHY.hidden);
  assert.equal(envWhy({ saveData: true, battery: { level: 0, charging: false } }), WHY.saveData);
  assert.equal(envWhy({ battery: { level: 0.19, charging: false } }), WHY.battery);
  assert.equal(envWhy({ battery: { level: 0.2, charging: false } }), null);
  assert.equal(envWhy({ battery: { level: 0.19, charging: true } }), null);
  assert.equal(envWhy({ battery: { level: 0.19 } }), null, 'unknown charging is not "not charging"');
  assert.equal(envWhy({ battery: { level: '0.1', charging: false } }), null);
  assert.equal(envWhy({ hidden: 'yes' }), null, 'only true pauses');
  // the worker cleans what the page sends: a battery level that is not a number is no reading
  const r = rig({ files: filesFor({ upper: UPPER }) });
  r.w.onMessage({ type: 'env', battery: { level: 'low', charging: 'no' }, hidden: 1 });
  assert.deepEqual(r.w.state.env, { stopped: false, hidden: false, saveData: false, battery: { level: NaN, charging: false } });
  r.w.onMessage({ type: 'other', hidden: true });
  r.w.onMessage(null);
  assert.equal(r.w.state.env.hidden, false);
});

test('no core, no storage, no task list, nothing left to grow: each pauses with its own reason, and an error stops the worker for good', async () => {
  const go = async (o) => { const r = rig({ files: filesFor({ upper: UPPER }), ...o }); r.env(); await r.run(); return r; };
  let r = await go({ load: async () => null });
  assert.equal(r.last().why, NO_CORE);
  assert.equal(r.last().line, 'this device: 0 cells kept for 0 tasks, 0 tried, paused (' + NO_CORE + ')');
  assert.deepEqual(r.fetched, [], 'with no core nothing is fetched');
  r = await go({ load: async () => { throw new Error('no such module'); } });
  assert.equal(r.last().why, NO_CORE);
  r = await go({ openStore: async () => null });
  assert.equal(r.last().why, WHY.storage);
  r = await go({ openStore: async () => { throw new Error('quota'); } });
  assert.equal(r.last().why, WHY.storage);
  r = await go({ files: {} });
  assert.equal(r.last().why, WHY.tasks);
  r = await go({ files: { [BASE + 'tasks.json']: { tasks: 'none' } } });
  assert.equal(r.last().why, WHY.tasks);
  r = await go({ files: { [BASE + 'tasks.json']: list({ task: 'upper', file: 'tasks/upper.json', mastered: true }) } });
  assert.equal(r.last().why, WHY.done, 'a task the cloud mastered is not grown here');
  // a slice that throws: the worker stops, says so, keeps the error, and a later message does not restart it
  r = await go({ throws: 'the search broke' });
  assert.equal(r.last().why, WHY.failed);
  assert.equal(r.last().error, 'the search broke');
  assert.equal(r.timers.length, 0);
  r.env();
  assert.equal(r.timers.length, 0, 'a failed worker was restarted');
});

test('the static task files are fetched once each, and nothing else: tasks.json, then each task file on its first slice', async () => {
  const r = rig({ files: filesFor({ upper: UPPER, lower: LOWER }) });
  r.env();
  for (let i = 0; i < 12; i++) await r.run();
  assert.equal(r.C.calls.length, 12);
  assert.deepEqual(r.fetched, [BASE + 'tasks.json', BASE + 'tasks/upper.json', BASE + 'tasks/lower.json']);
  // the tasks alternate, and the other task's prompts are negatives for each
  assert.deepEqual(r.C.calls.slice(0, 4).map((c) => c.task), ['upper', 'lower', 'upper', 'lower']);
  assert.ok(r.C.calls[2].negatives.includes(LOWER[0].q) && !r.C.calls[2].negatives.includes(UPPER[0].q));
  assert.ok(r.C.calls[0].negatives.includes('hello'), 'the core built-in prompts are negatives');
  // the default fetch is the worker scope's own
  const seen = [];
  const store = memStore();
  const C = fakeCore({ t: 0 });
  const scope = { postMessage() {}, addEventListener() {}, fetch: async (u) => { seen.push(String(u)); return { ok: false, status: 404 }; } };
  const timers = [];
  const w = startWorker(scope, { now: () => 0, setTimeout: (f) => { timers.push(f); return 1; }, load: async () => C, openStore: async () => store, tasksUrl: BASE + 'tasks.json' });
  w.onMessage({ type: 'env' });
  await timers.shift()();
  assert.deepEqual(seen, [BASE + 'tasks.json']);
  assert.equal(w.status().why, WHY.tasks);
});

// ---------------------------------------------------------------- what is kept, the store

test('a cell is kept only when it passes EVERY check row of its round; a task is mastered only when its kept cells answer every dev row', async () => {
  const { check, fit } = splitRows(UPPER, 0);
  assert.equal(check.length, 2);
  assert.equal(fit.length, 6);
  const all = cell('all', tableOf(UPPER));
  const missOneCheck = cell('miss-check', tableOf(UPPER, [check[1].q]));
  // right on every check row, silent on one fit row (a colony falls through it to the next cell)
  const missOneFit = cell('miss-fit', Object.fromEntries(Object.entries(tableOf(UPPER)).filter(([q]) => q !== fit[0].q)));
  const r = rig({ files: filesFor({ upper: UPPER }), make: () => [missOneCheck, missOneFit] });
  r.env();
  await r.run();
  let rec = r.store.m.get('task:upper');
  assert.deepEqual(rec.cells.map((k) => k.cell.id), ['miss-fit'], 'a cell that failed a check row was kept, or one that passed them all was not');
  assert.deepEqual(rec.cells[0].check, { ok: 2, n: 2 });
  assert.equal(rec.cells[0].round, 0);
  assert.equal(rec.mastered, false, 'a colony wrong on a fit row is not mastered');
  assert.equal(rec.rounds, 1);
  assert.deepEqual(rec.templates, CORE.deriveTemplates(UPPER.map((x) => x.q)));
  assert.equal(r.last().line, 'this device: 1 cells kept for 1 tasks, 200 tried, running');
  // the spawn saw only fit rows of this round, and the kept cells as parents next round
  assert.ok(r.C.calls[0].rows.every((x) => fit.some((f) => f.q === x.q)), 'a check row reached the search');
  assert.equal(r.C.calls[0].gen, 1);
  // the next round: the perfect cell is kept and the colony masters every dev row
  r.C.core.spawn = (a) => { r.C.calls.push(a); return { cells: [all, missOneFit], stats: { generated: 7 } }; };
  await r.run();
  rec = r.store.m.get('task:upper');
  assert.equal(rec.mastered, true);
  assert.deepEqual(rec.cells.map((k) => k.cell.id), ['miss-fit', 'all'], 'a cell already kept is not kept twice');
  assert.deepEqual(r.C.calls[1].parents.map((c) => c.id), ['miss-fit']);
  assert.equal(r.C.calls[1].gen, 2);
  assert.equal(r.last().tried, 207);
  // mastered on this device: never grown again, and with nothing left the body says so
  await r.run();
  assert.equal(r.last().why, WHY.done);
  assert.equal(r.C.calls.length, 2);
  assert.equal(r.last().line, 'this device: 2 cells kept for 1 tasks, 207 tried, paused (' + WHY.done + ')');
});

test('the split holds out a quarter (at least MIN_CHECK) by a hash of the round and the prompt, and moves with the round; the fit window is at most MAX_FIT', () => {
  assert.deepEqual([MIN_FIT, MIN_CHECK, MAX_FIT, MAX_CELLS], [2, 2, 16, 64]);
  const s0 = splitRows(UPPER, 0);
  assert.equal(s0.check.length + s0.fit.length, UPPER.length);
  assert.ok(s0.check.every((c) => !s0.fit.includes(c)), 'a row is both fit and check');
  assert.deepEqual(splitRows(UPPER, 0), s0, 'the split of a round is the same every time');
  const rounds = new Set(Array.from({ length: 12 }, (_, i) => splitRows(UPPER, i).check.map((x) => x.q).join('|')));
  assert.ok(rounds.size > 1, 'every round holds out the same rows');
  assert.equal(splitRows(UPPER.slice(0, 3), 0), null);
  assert.equal(splitRows(null), null);
  assert.deepEqual([4, 5, 8, 9, 40].map((n) => splitRows(Array.from({ length: n }, (_, i) => ({ q: 'q' + i })), 0).check.length), [2, 2, 2, 3, 10]);
  const many = Array.from({ length: 40 }, (_, i) => ({ q: 'q' + i }));
  assert.equal(fitWindow(many, 0).length, MAX_FIT);
  assert.deepEqual(fitWindow(many, 1).map((x) => x.q)[0], 'q16');
  assert.deepEqual(fitWindow(many, 2).map((x) => x.q).slice(-1), ['q7'], 'the window wraps');
  assert.equal(fitWindow(UPPER, 5), UPPER);
});

test('a task file that is not a table is skipped for good (fetched once), and the other tasks go on', async () => {
  for (const bad of [[1, 2], 'rows', { task: 'upper', rows: 'nope' }, { task: 'other', rows: UPPER }, { task: 'upper', rows: UPPER.slice(0, 3) }, { task: 'upper', rows: [null, 7, { q: 5, expect: {} }, { q: 'x' }, { q: ' ', expect: {} }, { q: 'a'.repeat(2001), expect: {} }] }, 404]) {
    const files = filesFor({ upper: UPPER, lower: LOWER });
    files[BASE + 'tasks/upper.json'] = bad;
    const r = rig({ files });
    r.env();
    for (let i = 0; i < 5; i++) await r.run();
    assert.deepEqual(r.C.calls.map((c) => c.task), ['lower', 'lower', 'lower', 'lower'], JSON.stringify(bad).slice(0, 60));
    assert.equal(r.fetched.filter((u) => u.endsWith('/upper.json')).length, 1);
    assert.equal(r.store.m.has('task:upper'), false);
  }
  // taskRows: only { task, rows[] } with at least four usable rows; an answer is carried only when it is text
  assert.equal(taskRows(null, 'upper'), null);
  assert.equal(taskRows({ task: 'upper', rows: {} }, 'upper'), null);
  const rows = taskRows({ task: 'upper', rows: [...UPPER.slice(0, 4), { q: 'no answer', expect: { equals: 'x' }, answer: 7 }] }, 'upper');
  assert.equal(rows.length, 5);
  assert.deepEqual(rows[4], { q: 'no answer', expect: { equals: 'x' } });
  // taskList: names and files must agree, mastered tasks are left out, anything else is dropped
  assert.equal(taskList(null), null);
  assert.equal(taskList({ tasks: {} }), null);
  assert.deepEqual(taskList({ tasks: [
    { task: 'upper', file: 'tasks/upper.json' }, { task: 'done', file: 'tasks/done.json', mastered: true }, { task: 'Bad Name', file: 'tasks/Bad Name.json' },
    { task: 'swap', file: 'tasks/other.json' }, { task: 'up', file: '../tasks/up.json' }, { task: 'web', file: 'https://x.test/tasks/web.json' }, null, { task: 'nofile' },
  ] }), [{ task: 'upper', file: 'tasks/upper.json' }]);
});

const rec = (task, o = {}) => ({ task, templates: ['t {1-2}'], cells: [{ cell: cell(task + '-c', {}), check: { ok: 2, n: 2 }, round: 0 }], rounds: 1, at: 1, mastered: false, ...o });

test('a corrupt store: every record that is not the shape this file writes is deleted and counted, never trusted', async () => {
  const good = rec('upper', { at: 5 });
  const store = memStore([
    ['meta', { iterations: 'many' }],
    ['task:a', rec('b')],
    ['task:c', { ...rec('c'), templates: [1] }],
    ['task:d', { ...rec('d'), cells: [{ cell: cell('x', {}, { bad: true }), check: { ok: 2, n: 2 } }] }],
    ['task:e', { ...rec('e'), cells: [{ cell: cell('x', {}), check: { ok: '2', n: 2 } }] }],
    ['task:f', 'text'],
    [7, rec('upper')],
    ['task:upper', good],
  ]);
  const r = rig({ files: filesFor({ upper: UPPER }), store });
  r.env();
  await r.run();
  assert.deepEqual([...store.m.keys()].sort(), ['meta', 'task:upper']);
  assert.equal(r.last().corrupt, 7);
  assert.equal(store.m.get('meta').corrupt, 7);
  assert.deepEqual(store.m.get('task:upper').cells.map((k) => k.cell.id), ['upper-c'], 'the good record was kept and grown on');
  assert.equal(r.C.calls[0].gen, 2);
  // the readers: cleanMeta, cleanTask, readStore
  assert.deepEqual(cleanMeta(zeroMeta()), zeroMeta());
  assert.equal(cleanMeta({ ...zeroMeta(), tried: -1 }), null);
  assert.equal(cleanMeta(null), null);
  assert.equal(cleanTask('task:upper', good).task, 'upper');
  assert.equal(cleanTask('task:other', good), null);
  assert.equal(cleanTask('task:upper', { ...good, rounds: 1.5 }), null);
  assert.equal(cleanTask('task:upper', { ...good, cells: [{ cell: {}, check: { ok: 1 } }] }), null);
  assert.equal(cleanTask('task:upper', { ...good, mastered: 'yes' }).mastered, false);
  assert.equal(cleanTask('task:upper', { ...good, at: -4 }).at, 0);
  const got = await readStore(memStore([['meta', { ...zeroMeta(), tried: 9 }], ['task:upper', good], ['junk', 1]]));
  assert.deepEqual([got.meta.tried, [...got.recs.keys()], got.corrupt], [9, ['upper'], ['junk']]);
  assert.deepEqual(countsOf(got.recs), { cells: 1, tasks: 1 });
  assert.deepEqual(countsOf(new Map([['a', rec('a', { cells: [] })]])), { cells: 0, tasks: 0 }, 'a task with no kept cell is not counted');
});

test('THE STORE CAP: over 5 MB the oldest record of a task not mastered on this device is dropped first, a mastered one only after', async () => {
  const MB = 1024 * 1024;
  assert.deepEqual(overCap([{ key: 'a', bytes: 3 * MB, at: 2, mastered: false }, { key: 'b', bytes: 3 * MB, at: 0, mastered: true }]), ['a']);
  assert.deepEqual(overCap([{ key: 'a', bytes: 2.5 * MB, at: 2, mastered: false }, { key: 'b', bytes: 2.5 * MB, at: 0, mastered: true }]), [], 'exactly 5 MB fits');
  assert.deepEqual(overCap([
    { key: 'new', bytes: 2 * MB, at: 9, mastered: false }, { key: 'old', bytes: 2 * MB, at: 1, mastered: false },
    { key: 'm-old', bytes: 2 * MB, at: 0, mastered: true }, { key: 'm-new', bytes: 2 * MB, at: 5, mastered: true },
  ]), ['old', 'new'], 'the unmastered ones go first, oldest first, and only until the rest fits');
  assert.deepEqual(overCap([
    { key: 'u', bytes: 1 * MB, at: 9, mastered: false }, { key: 'm-old', bytes: 3 * MB, at: 0, mastered: true }, { key: 'm-new', bytes: 3 * MB, at: 5, mastered: true },
  ]), ['u', 'm-old'], 'the mastered ones go only after every unmastered one, oldest first');
  assert.deepEqual(overCap([{ key: 'b', bytes: 6 * MB, at: 1, mastered: false }, { key: 'a', bytes: 6 * MB, at: 1, mastered: false }]), ['a', 'b'], 'a tie is broken by the key');
  // the worker holds its store under the cap at open and after every write
  const pad = 'x'.repeat(4000);
  const older = rec('older', { at: 1, templates: [pad] });
  const mastered = rec('mastered', { at: 0, mastered: true, templates: [pad] });
  const newer = rec('newer', { at: 9, templates: [pad] });
  const cap = sizeOf(mastered) + sizeOf(newer) + 100;
  const store = memStore([['task:older', older], ['task:mastered', mastered], ['task:newer', newer]]);
  const r = rig({ files: filesFor({ upper: UPPER }), store, cap, make: (a) => [cell('c' + a.gen, tableOf(UPPER))] });
  r.env();
  await r.run();
  assert.deepEqual(store.log.filter((x) => x[0] === 'del').map((x) => x[1]), ['task:older', 'task:newer'], 'the oldest unmastered first; then the next, to fit the new record');
  assert.deepEqual([...store.m.keys()].sort(), ['meta', 'task:mastered', 'task:upper']);
  let total = 0;
  for (const [k, v] of store.m) if (k !== 'meta') total += sizeOf(v);
  assert.ok(total <= cap, total + ' over ' + cap);
  // the 5 MB default
  const big = rig({ files: filesFor({ upper: UPPER }), store: memStore([['task:huge', rec('huge', { templates: ['y'.repeat(STORE_CAP + 10)] })]]) });
  big.env();
  await big.run();
  assert.equal(big.store.m.has('task:huge'), false);
});

// ---------------------------------------------------------------- THE GATE of a device cell, the page side

const REV_TEMPLATES = CORE.deriveTemplates(REVERSE.map((r) => r.q));

test('a device cell answers only when it passed ALL its check rows (n at least MIN_CHECK) AND the prompt fits its task template exactly', async () => {
  assert.deepEqual(REV_TEMPLATES, ['reverse the word {1-3}']);
  const C = fakeCore({ t: 0 });
  const load = async () => C;
  const table = { 'reverse the word mango': 'ognam', 'please reverse the word mango': 'ognam', 'reverse the word a b c d': 'd c b a' };
  const withCells = (cells) => memStore([['task:reverse-word', rec('reverse-word', { templates: REV_TEMPLATES, cells })]]);
  const good = { cell: cell('good', table), check: { ok: 2, n: 2 }, round: 0 };
  const d = await deviceAnswer('reverse the word mango', { load, store: withCells([good]) });
  assert.deepEqual(d, { text: 'ognam', task: 'reverse-word', cells: 1, route: ROUTE_LINE });
  // a cell short of its check rows, or checked on fewer than MIN_CHECK rows, never answers
  assert.equal(await deviceAnswer('reverse the word mango', { load, store: withCells([{ ...good, check: { ok: 1, n: 2 } }]) }), null);
  assert.equal(await deviceAnswer('reverse the word mango', { load, store: withCells([{ ...good, check: { ok: 1, n: 1 } }]) }), null);
  assert.equal(await deviceAnswer('reverse the word mango', { load, store: withCells([{ ...good, check: { ok: 3, n: 2 } }]) }), null);
  // only the cells that passed are in the colony: a failed cell's answer is never given
  const liar = { cell: cell('liar', { 'reverse the word mango': 'lie' }), check: { ok: 1, n: 2 }, round: 0 };
  assert.equal((await deviceAnswer('reverse the word mango', { load, store: withCells([liar, good]) })).text, 'ognam');
  // the template, exactly: a prompt the cell would answer but that does not fit is not asked
  for (const q of ['please reverse the word mango', 'reverse the word a b c d', 'reverse the words mango', 'mango']) assert.equal(await deviceAnswer(q, { load, store: withCells([good]) }), null, q);
  assert.equal(await deviceAnswer('Reverse the word: Mango!', { load, store: withCells([{ ...good, cell: cell('g', { 'Reverse the word: Mango!': 'ognam' }) }]) }).then((x) => x && x.text), 'ognam', 'the fit is the core fit, case and punctuation as it reads them');
  // a record with no template, a colony that answers nothing, no core, no store, an empty prompt, a store that throws
  assert.equal(await deviceAnswer('reverse the word mango', { load, store: memStore([['task:reverse-word', rec('reverse-word', { templates: [], cells: [good] })]]) }), null);
  assert.equal(await deviceAnswer('reverse the word kiwi', { load, store: withCells([good]) }), null);
  assert.equal(await deviceAnswer('reverse the word mango', { load: async () => null, store: withCells([good]) }), null);
  assert.equal(await deviceAnswer('reverse the word mango', { load, openStore: async () => null }), null);
  assert.equal(await deviceAnswer('', { load, store: withCells([good]) }), null);
  assert.equal(await deviceAnswer(7, { load, store: withCells([good]) }), null);
  assert.equal(await deviceAnswer('reverse the word mango', { load, store: { all: async () => { throw new Error('gone'); } } }), null);
  // a corrupt record is never asked
  assert.equal(await deviceAnswer('reverse the word mango', { load, store: memStore([['task:reverse-word', { ...rec('reverse-word', { templates: REV_TEMPLATES, cells: [good] }), task: 'other' }]]) }), null);
  // the page default: no IndexedDB in node, so no store and no answer
  assert.equal(await pageStore(null), null);
});

test('gateFits is the core fitsTemplates, exactly true or false; with no core it is false', async () => {
  const real = async () => ({ core: CORE, kernel: KERNEL });
  assert.equal(await gateFits(REV_TEMPLATES, 'reverse the word apple', { load: real }), true);
  assert.equal(await gateFits(REV_TEMPLATES, 'reverse the words apple', { load: real }), false);
  assert.equal(await gateFits([], 'reverse the word apple', { load: real }), false);
  assert.equal(await gateFits(REV_TEMPLATES, 'reverse the word apple', { load: async () => null }), false);
  assert.equal(await gateFits(REV_TEMPLATES, 'reverse the word apple', { load: async () => { throw new Error('x'); } }), false);
  assert.equal(await gateFits(REV_TEMPLATES, 'reverse the word apple', { load: async () => ({ core: { fitsTemplates: () => 'true' } }) }), false);
  // loadCore: both files, and the functions the body uses, or null
  const C = await loadCore();
  assert.ok(C && C.core.spawn === CORE.spawn && C.kernel.runCell === KERNEL.runCell, 'the core beside the body is the tree core');
  assert.equal(await loadCore(async (u) => (u === CORE_URL ? CORE : null)), null);
  assert.equal(await loadCore(async () => { throw new Error('404'); }), null);
  assert.equal(await loadCore(async (u) => (u === CORE_URL ? { ...CORE, spawn: undefined } : KERNEL)), null);
  assert.equal(await loadCore(async (u) => (u === CORE_URL ? CORE : { ...KERNEL, makeColony: 1 })), null);
});

// ---------------------------------------------------------------- IndexedDB, planted

/** IndexedDB as the browser gives it, over Maps: async requests, upgrades, transactions that complete later. */
function fakeIDB({ failOpen = false, throwOpen = false } = {}) {
  const dbs = new Map();
  const opens = [];
  return {
    dbs, opens,
    open(name, version) {
      opens.push([name, version]);
      if (throwOpen) throw new Error('SecurityError');
      const req = { result: null, onupgradeneeded: null, onsuccess: null, onerror: null };
      setTimeout(() => {
        if (failOpen) { req.onerror && req.onerror(); return; }
        const fresh = !dbs.has(name);
        if (fresh) dbs.set(name, new Map());
        const stores = dbs.get(name);
        req.result = {
          objectStoreNames: { contains: (s) => stores.has(s) },
          createObjectStore: (s) => { stores.set(s, new Map()); },
          transaction: (s, mode) => {
            const m = stores.get(s);
            if (!m) throw new Error('NotFoundError');
            const tx = { oncomplete: null, onerror: null, onabort: null, error: null };
            const done = (v) => ({ result: v });
            const write = () => { if (mode !== 'readwrite') throw new Error('ReadOnlyError'); };
            const keys = () => [...m.keys()].sort();
            tx.objectStore = () => ({
              get: (k) => done(m.has(k) ? structuredClone(m.get(k)) : undefined),
              put: (v, k) => { write(); m.set(k, structuredClone(v)); return done(k); },
              delete: (k) => { write(); m.delete(k); return done(undefined); },
              getAllKeys: () => done(keys()),
              getAll: () => done(keys().map((k) => structuredClone(m.get(k)))),
            });
            setTimeout(() => tx.oncomplete && tx.oncomplete(), 0);
            return tx;
          },
        };
        if (fresh) req.onupgradeneeded && req.onupgradeneeded();
        req.onsuccess && req.onsuccess();
      }, 0);
      return req;
    },
  };
}

test('idbStore over a planted IndexedDB: get, put, del and all in key order; no IndexedDB or a refused open is no store', async () => {
  const idb = fakeIDB();
  const s = await idbStore(idb);
  assert.deepEqual(idb.opens, [[DB_NAME, 1]]);
  assert.ok(idb.dbs.get(DB_NAME).has(DB_STORE), 'the upgrade made the kv store');
  await s.put('task:b', { x: 1 });
  await s.put('meta', zeroMeta());
  await s.put('task:a', { y: [1, 2] });
  assert.deepEqual(await s.get('task:a'), { y: [1, 2] });
  assert.equal(await s.get('none'), undefined);
  assert.deepEqual((await s.all()).map((e) => e[0]), ['meta', 'task:a', 'task:b']);
  await s.del('task:b');
  assert.deepEqual(await s.all(), [['meta', zeroMeta()], ['task:a', { y: [1, 2] }]]);
  const again = await idbStore(idb);
  assert.deepEqual((await again.all()).map((e) => e[0]), ['meta', 'task:a'], 'a second open reads the same store');
  assert.equal(await idbStore(null), null);
  assert.equal(await idbStore({}), null);
  assert.equal(await idbStore(fakeIDB({ failOpen: true })), null);
  assert.equal(await idbStore(fakeIDB({ throwOpen: true })), null);
  // the worker on a scope with IndexedDB and fetch of its own: it keeps what it grew there
  const files = filesFor({ upper: UPPER });
  const scopeIdb = fakeIDB();
  const C = fakeCore({ t: 0 }, { make: () => [cell('all', tableOf(UPPER))] });
  const timers = [];
  const scope = { postMessage() {}, addEventListener() {}, indexedDB: scopeIdb, fetch: async (u) => ({ ok: true, status: 200, json: async () => structuredClone(files[u]) }) };
  const w = startWorker(scope, { now: () => 0, setTimeout: (f) => { timers.push(f); return 1; }, load: async () => C, tasksUrl: BASE + 'tasks.json' });
  w.onMessage({ type: 'env' });
  await timers.shift()();
  const kept = scopeIdb.dbs.get(DB_NAME).get(DB_STORE);
  assert.deepEqual([...kept.keys()].sort(), ['meta', 'task:upper']);
  assert.equal(kept.get('task:upper').mastered, true);
  assert.equal(w.status().line, 'this device: 1 cells kept for 1 tasks, 200 tried, running');
  // and the page reads it back through the same store
  const d = await deviceAnswer('upper apple', { load: async () => C, store: await idbStore(scopeIdb) });
  assert.deepEqual(d && [d.text, d.task, d.route], ['APPLE', 'upper', ROUTE_LINE]);
});

// ---------------------------------------------------------------- THE BODY on the page

const until = async (f, ms = 3000) => { const t0 = Date.now(); while (!f()) { assert.ok(Date.now() - t0 < ms, 'timed out waiting'); await new Promise((r) => setTimeout(r, 2)); } };
function pageRig({ stored = null, worker = 'ok', battery = null, connection = null, hidden = false, storeThrows = false, recs = [] } = {}) {
  const map = new Map(stored == null ? [] : [[SWITCH_KEY, stored]]);
  const storage = {
    map,
    getItem: (k) => { if (storeThrows) throw new Error('blocked'); return map.has(k) ? map.get(k) : null; },
    setItem: (k, v) => { if (storeThrows) throw new Error('blocked'); map.set(k, String(v)); },
  };
  const made = [];
  class FakeWorker {
    constructor(url, opts) { if (worker === 'throws') throw new Error('no module workers'); this.url = String(url); this.opts = opts; this.sent = []; this.ended = false; made.push(this); }
    postMessage(m) { this.sent.push(m); }
    terminate() { this.ended = true; }
  }
  const on = {};
  const listen = (o) => { o.addEventListener = (t, f) => { (on[t] ||= []).push(f); }; return o; };
  const document = listen({ visibilityState: hidden ? 'hidden' : 'visible' });
  const nav = {};
  if (connection) nav.connection = listen({ ...connection });
  if (battery) nav.getBattery = async () => listen(battery);
  const line = { textContent: '' };
  const sw = listen({ textContent: '', attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } });
  const store = memStore(recs);
  const body = startBody({ document, navigator: nav, Worker: worker ? FakeWorker : undefined, storage, url: 'https://pocket.test/organism/web/pocket-era.mjs', lineEl: line, switchEl: sw, openStore: async () => store });
  const fire = (t) => { for (const f of on[t] || []) f(); };
  return { body, made, line, sw, storage, document, nav, fire };
}

test('startBody: a module worker on the body URL, told the page state at once and on every change; its status line printed', async () => {
  const p = pageRig({ battery: { level: 0.1, charging: false }, connection: { saveData: true } });
  await p.body.ready;
  assert.equal(p.made.length, 1);
  assert.equal(p.made[0].url, 'https://pocket.test/organism/web/pocket-era.mjs');
  assert.deepEqual(p.made[0].opts, { type: 'module', name: 'pocket-era' });
  assert.deepEqual(p.made[0].sent, [{ type: 'env', stopped: false, hidden: false, saveData: true, battery: { level: 0.1, charging: false } }]);
  p.document.visibilityState = 'hidden';
  p.fire('visibilitychange');
  assert.equal(p.made[0].sent.at(-1).hidden, true);
  p.nav.connection.saveData = false;
  p.fire('change');
  assert.equal(p.made[0].sent.at(-1).saveData, false);
  p.fire('levelchange');
  p.fire('chargingchange');
  assert.equal(p.made[0].sent.length, 5);
  p.made[0].onmessage({ data: { type: 'status', status: { line: bodyLine({ cells: 1, tasks: 1, tried: 5, why: WHY.battery }) } } });
  assert.equal(p.line.textContent, 'this device: 1 cells kept for 1 tasks, 5 tried, paused (battery under 20 percent and not charging)');
  assert.equal(p.body.line(), p.line.textContent);
  assert.equal(p.sw.textContent, 'stop the body');
  assert.equal(p.sw.attrs['aria-pressed'], 'true');
  assert.deepEqual([...p.storage.map.keys()], [], 'the switch is written only when it is used');
  // envOf, alone
  assert.deepEqual(envOf({ document: { visibilityState: 'hidden' }, navigator: { connection: { saveData: true } }, battery: { level: 0.5, charging: 1 }, stopped: true }), { type: 'env', stopped: true, hidden: true, saveData: true, battery: { level: 0.5, charging: false } });
  assert.deepEqual(envOf({ document: null, navigator: null }), { type: 'env', stopped: false, hidden: false, saveData: false, battery: null });
  assert.deepEqual(envOf({ document: {}, navigator: {}, battery: { level: 'x' } }).battery, null);
  // a battery the browser will not give: no reading, the body runs
  const nb = pageRig();
  nb.nav.getBattery = undefined;
  await nb.body.ready;
  assert.equal(nb.made[0].sent[0].battery, null);
});

test('THE SWITCH stops the worker and is remembered; the line then comes from the store, paused for the reason', async () => {
  const recs = [['task:upper', rec('upper', { cells: [rec('x').cells[0], rec('y').cells[0]] })], ['meta', { ...zeroMeta(), tried: 40 }]];
  const p = pageRig({ recs });
  await p.body.ready;
  assert.equal(await p.body.toggle(), false);
  assert.equal(p.made[0].ended, true);
  assert.equal(p.storage.map.get(SWITCH_KEY), '0');
  assert.equal(p.line.textContent, 'this device: 2 cells kept for 1 tasks, 40 tried, paused (stopped by you)');
  assert.equal(p.sw.textContent, 'start the body');
  assert.equal(p.sw.attrs['aria-pressed'], 'false');
  assert.equal(p.body.worker(), null);
  // the next page load: stopped, no worker
  const q = pageRig({ stored: '0', recs });
  await q.body.ready;
  assert.equal(q.made.length, 0);
  assert.equal(q.body.on(), false);
  assert.equal(q.line.textContent, 'this device: 2 cells kept for 1 tasks, 40 tried, paused (stopped by you)');
  // the switch on the page (a click) starts it again and remembers that
  q.fire('click');
  await until(() => q.made.length === 1);
  assert.equal(q.storage.map.get(SWITCH_KEY), '1');
  assert.equal(q.body.on(), true);
  // a storage that throws: the switch still works for this page and the body starts on
  const t = pageRig({ storeThrows: true });
  await t.body.ready;
  assert.equal(t.made.length, 1);
  assert.equal(await t.body.toggle(), false);
  assert.equal(t.made[0].ended, true);
  assert.equal(pageRig({ stored: '1' }).body.on(), true);
  assert.equal(pageRig({ stored: 'no' }).body.on(), true, 'only "0" is off');
});

test('no module worker, or one that fails: the line says so and the page goes on', async () => {
  const none = pageRig({ worker: null, recs: [['task:upper', rec('upper')]] });
  await none.body.ready;
  await until(() => none.line.textContent !== '');
  assert.equal(none.line.textContent, 'this device: 1 cells kept for 1 tasks, 0 tried, paused (' + WHY.worker + ')');
  const t = pageRig({ worker: 'throws' });
  await t.body.ready;
  await until(() => t.line.textContent !== '');
  assert.equal(t.line.textContent, bodyLine({ why: WHY.worker }));
  const f = pageRig();
  await f.body.ready;
  f.made[0].onerror(new Error('boom'));
  await until(() => f.line.textContent.endsWith('(' + WHY.failed + ')'));
  assert.equal(f.made[0].ended, true);
  assert.equal(f.body.worker(), null);
  // a status that is not one is never printed
  const g = pageRig();
  await g.body.ready;
  for (const data of [null, 'line', { type: 'status' }, { type: 'status', status: { line: 7 } }, { type: 'other', status: { line: 'x' } }]) g.made[0].onmessage({ data });
  assert.equal(g.line.textContent, '');
});

// ---------------------------------------------------------------- the real search core, on the phone

test('the REAL core in the worker masters fixture tasks from dev rows alone, and the page then answers a novel prompt with no server', { timeout: 120000 }, async (t) => {
  const files = filesFor({ 'reverse-word': REVERSE, 'count-letters': LETTERS });
  const store = memStore();
  const timers = [];
  const got = [];
  const scope = { postMessage() {}, addEventListener() {}, fetch: async (u) => { got.push(String(u)); return files[u] ? { ok: true, status: 200, json: async () => structuredClone(files[u]) } : { ok: false, status: 404 }; } };
  const w = startWorker(scope, { setTimeout: (f) => { timers.push(f); return 1; }, openStore: async () => store, tasksUrl: BASE + 'tasks.json' });
  w.onMessage({ type: 'env' });
  let ticks = 0;
  while (timers.length && ticks < 60) { ticks++; await timers.shift()(); }
  const s = w.status();
  assert.equal(s.why, WHY.done, JSON.stringify(s));
  assert.ok(store.m.get('task:reverse-word').mastered && store.m.get('task:count-letters').mastered);
  for (const [k, v] of store.m) if (k !== 'meta') for (const c of v.cells) assert.ok(c.check.n >= MIN_CHECK && c.check.ok === c.check.n, k);
  const real = () => loadCore();
  const d = await deviceAnswer('reverse the word mango', { store, load: real });
  assert.deepEqual(d && [d.text, d.task, d.route], ['ognam', 'reverse-word', ROUTE_LINE]);
  assert.equal((await deviceAnswer('how many letters in elephant', { store, load: real })).text, '8');
  assert.equal(await deviceAnswer('please reverse the word mango', { store, load: real }), null, 'a misfit is not asked');
  assert.equal(await deviceAnswer('what is the capital of france', { store, load: real }), null);
  assert.deepEqual(got, [BASE + 'tasks.json', BASE + 'tasks/reverse-word.json', BASE + 'tasks/count-letters.json'], 'each static file once, nothing else');
  t.diagnostic('real core on the planted scope: ' + ticks + ' ticks, ' + s.iterations + ' slices, ' + s.cells + ' cells kept for ' + s.tasks + ' tasks, ' + s.tried + ' tried, longest slice ' + Math.round(s.maxSliceMs * 10) / 10 + ' ms');
});

test('browser safe: no static import, nothing of node, no eval; the worker starts itself only inside a worker scope', () => {
  assert.doesNotMatch(SRC, /^\s*import\s[^(]/m, 'a static import');
  assert.doesNotMatch(SRC, /\bfrom\s*['"]node:|\brequire\(|\bprocess\.|\bBuffer\b|\beval\(|new Function|importScripts/);
  assert.match(SRC, /const inWorker = typeof WorkerGlobalScope !== 'undefined' && typeof self !== 'undefined' && self instanceof WorkerGlobalScope;/);
  assert.match(SRC, /if \(inWorker\) startWorker\(self\);/);
  assert.doesNotMatch(SRC, /\u2014/, 'no em-dash');
});
