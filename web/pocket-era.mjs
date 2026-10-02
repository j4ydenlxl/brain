// web/pocket-era.mjs: THE POCKET BODY. The phone itself burns eras: a module Web Worker grows NEO cells for the tasks
// the organism has not mastered, with THE SAME search the cloud runs (grow/neo-core.mjs and grow/neo-kernel.mjs, which
// web/pocket.mjs copies byte for byte to /organism/grow/ beside this file's copy at /organism/web/pocket-era.mjs).
//
// His words (grow/NEO.md head): "All native btw, its ai data center in ur pocket, none of that ollama crap" and "The
// whole point is a new way of ai, an ai datacenter in the cloud and in the pocket that works exactly like fronteir ai".
//
// THE WORKER (startWorker; it starts by itself when this module is a worker's script):
// - It fetches /organism/era/tasks.json and a task's dev rows /organism/era/tasks/<task>.json, each ONCE (the service
//   worker holds them); it fetches nothing else. A held-out row never reaches the phone: web/pocket.mjs ships dev rows.
// - It picks the tasks the organism has not mastered, in turn, and SPLITS each task's dev rows itself into FIT rows and
//   CHECK rows (a hash of the prompt and the round, so each round holds out other rows). It spawns cells on the fit rows
//   and keeps a cell only when it passes EVERY check row; it keeps the kept cells in IndexedDB; it counts its iterations
//   and the candidates it tried. A task whose kept cells answer every dev row right is mastered on this device.
// - THE DUTY CYCLE, so the phone never suffers: a slice works at most SLICE_MS (the search gets SEARCH_SHARE of it, and
//   the candidates it may try adapt to what the last slice took), then rests at least as long as that slice took and
//   never less than SLICE_MS. It pauses while the page is hidden, while save-data is on, while the battery is under 20
//   percent and not charging, and while the switch is off.
// - THE STORE: at most STORE_CAP bytes; over it, the oldest record of a task not mastered on this device is dropped
//   first. A record that is not the shape this file writes (a corrupt store) is deleted and counted, never trusted.
// THE PAGE (startBody, bodyLine, deviceAnswer, gateFits):
// - startBody starts the worker, tells it the page's state (visibility, save-data, the battery) and keeps THE SWITCH
//   (one localStorage key, SWITCH_KEY, written only when it is used). bodyLine is the ONE dim line the page prints from
//   the worker's own counters: "this device: <n> cells kept for <m> tasks, <k> tried, running|paused (<why>)".
// - deviceAnswer answers a prompt in the tab with a cell grown on THIS device only when the cell passed ALL its check
//   rows and the prompt fits its task's template exactly (grow/neo-core.mjs fitsTemplates); its route line is ROUTE_LINE.
// - gateFits is THE GATE's template test for the cells the cloud grew (act/cells-tab.mjs asks a NEO row only on a fit).
//
// Browser safe: no static import and nothing of node; the core, the kernel, the network, the store and the clocks are
// loaded or injected. Text a task file or the store holds is DATA: never evaluated, never followed.

export const SLICE_MS = 50;
export const SEARCH_SHARE = 0.5;
export const BATTERY_FLOOR = 0.2;
export const STORE_CAP = 5 * 1024 * 1024;
export const DB_NAME = 'dilation-pocket-era';
export const DB_STORE = 'kv';
export const SWITCH_KEY = 'dilation.body';
export const ROUTE_LINE = 'grown on this device, no server';
export const NO_CORE = 'the search core is not published yet';
export const MIN_FIT = 2;
export const MIN_CHECK = 2;
export const MAX_FIT = 16;
export const MAX_CELLS = 64;
export const MAX_NEGATIVES = 256;
export const GEN = Object.freeze({ start: 200, min: 20, max: 20000 });
export const WHY = Object.freeze({
  waiting: 'waiting for the page',
  stopped: 'stopped by you',
  hidden: 'page hidden',
  saveData: 'save-data is on',
  battery: 'battery under 20 percent and not charging',
  core: NO_CORE,
  storage: 'no storage on this device',
  tasks: 'the task list did not load',
  done: 'no unmastered task left',
  worker: 'this browser runs no module worker',
  failed: 'the worker stopped on an error',
});
const HERE = import.meta.url;
export const CORE_URL = new URL('../grow/neo-core.mjs', HERE).href;
export const KERNEL_URL = new URL('../grow/neo-kernel.mjs', HERE).href;
export const TASKS_URL = new URL('../era/tasks.json', HERE).href;
const TASK_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const FILE_RE = /^tasks\/[a-z0-9][a-z0-9-]{0,63}\.json$/;

const isObj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
const isCount = (n) => Number.isFinite(n) && n >= 0;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const msNow = () => (globalThis.performance && typeof globalThis.performance.now === 'function' ? globalThis.performance.now() : Date.now());
const utf8Len = (s) => (typeof TextEncoder === 'function' ? new TextEncoder().encode(s).length : s.length);
/** The bytes a record takes in the store, as JSON text. */
export const sizeOf = (v) => utf8Len(JSON.stringify(v));
/** FNV-1a over a string: the split's hash. */
function fnv(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

// ---------------------------------------------------------------- the core

/**
 * The search core and its kernel, imported from beside this file's copy, or null when either does not load or is not
 * the core (the worker then reports NO_CORE).
 * @param {(url: string) => Promise<object>} importer
 * @returns {Promise<{ core: object, kernel: object } | null>}
 */
export async function loadCore(importer = (u) => import(u)) {
  try {
    const [core, kernel] = await Promise.all([importer(CORE_URL), importer(KERNEL_URL)]);
    if (!core || !kernel) return null;
    for (const f of ['spawn', 'passesRow', 'deriveTemplates', 'fitsTemplates']) if (typeof core[f] !== 'function') return null;
    for (const f of ['runCell', 'makeColony', 'checkCell']) if (typeof kernel[f] !== 'function') return null;
    return { core, kernel };
  } catch {
    return null;
  }
}
let PAGE_CORE = null;
/** The core for the page, loaded once (a page without it fits no template and answers from no device cell). */
export function pageCore() {
  if (!PAGE_CORE) PAGE_CORE = loadCore();
  return PAGE_CORE;
}

/**
 * THE GATE's template test (grow/neo-core.mjs fitsTemplates) for act/cells-tab.mjs: false when the core is missing.
 * @returns {Promise<boolean>}
 */
export async function gateFits(templates, q, { load = pageCore } = {}) {
  try {
    const C = await load();
    return !!C && C.core.fitsTemplates(templates, q) === true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- rows, the split, the task files

/** A task file's rows, or null when it is not a table of rows for this task (a task file that is not a table). */
export function taskRows(json, task) {
  if (!isObj(json) || json.task !== task || !Array.isArray(json.rows)) return null;
  const rows = [];
  for (const r of json.rows) {
    if (!isObj(r) || typeof r.q !== 'string' || !r.q.trim() || r.q.length > 2000 || !isObj(r.expect)) continue;
    rows.push(typeof r.answer === 'string' && r.answer.trim() ? { q: r.q, expect: r.expect, answer: r.answer } : { q: r.q, expect: r.expect });
  }
  return rows.length >= MIN_FIT + MIN_CHECK ? rows : null;
}

/** The task list of tasks.json: the tasks with a file and not mastered by the cloud, or null when it is not a list. */
export function taskList(json) {
  if (!isObj(json) || !Array.isArray(json.tasks)) return null;
  const out = [];
  for (const t of json.tasks) {
    if (!isObj(t) || typeof t.task !== 'string' || !TASK_RE.test(t.task) || t.mastered === true) continue;
    if (typeof t.file !== 'string' || !FILE_RE.test(t.file) || t.file !== 'tasks/' + t.task + '.json') continue;
    out.push({ task: t.task, file: t.file });
  }
  return out;
}

/**
 * The split of a round: CHECK rows (a quarter, at least MIN_CHECK) by a hash of the round and the prompt, FIT rows the
 * rest (at least MIN_FIT); null for a task too small to split.
 */
export function splitRows(rows, round = 0) {
  const n = Array.isArray(rows) ? rows.length : 0;
  if (n < MIN_FIT + MIN_CHECK) return null;
  const k = Math.min(n - MIN_FIT, Math.max(MIN_CHECK, Math.ceil(n / 4)));
  const order = rows.map((r, i) => ({ i, h: fnv(round + '\u0000' + r.q) })).sort((a, b) => a.h - b.h || a.i - b.i);
  const check = new Set(order.slice(0, k).map((x) => x.i));
  return { fit: rows.filter((_, i) => !check.has(i)), check: rows.filter((_, i) => check.has(i)) };
}

/** At most MAX_FIT fit rows for one slice, a window that moves with the round. */
export function fitWindow(fit, round = 0) {
  if (fit.length <= MAX_FIT) return fit;
  const at = (round * MAX_FIT) % fit.length;
  return Array.from({ length: MAX_FIT }, (_, i) => fit[(at + i) % fit.length]);
}

// ---------------------------------------------------------------- the store

/**
 * IndexedDB as { get, put, del, all }, or null when there is none or it does not open. all() is [[key, value]] in key
 * order.
 * @returns {Promise<{ get: Function, put: Function, del: Function, all: Function } | null>}
 */
export function idbStore(idb, name = DB_NAME) {
  if (!idb || typeof idb.open !== 'function') return Promise.resolve(null);
  return new Promise((resolve) => {
    let req;
    try { req = idb.open(name, 1); } catch { resolve(null); return; }
    req.onupgradeneeded = () => { try { const db = req.result; if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE); } catch { /* the open fails below */ } };
    req.onerror = () => resolve(null);
    req.onsuccess = () => {
      const db = req.result;
      const run = (mode, fn) => new Promise((ok, no) => {
        try {
          const tx = db.transaction(DB_STORE, mode);
          const read = fn(tx.objectStore(DB_STORE));
          tx.oncomplete = () => { try { ok(read()); } catch (e) { no(e); } };
          tx.onerror = () => no(tx.error || new Error('indexedDB: the transaction failed'));
          tx.onabort = () => no(tx.error || new Error('indexedDB: the transaction was aborted'));
        } catch (e) { no(e); }
      });
      resolve({
        get: (k) => run('readonly', (os) => { const r = os.get(k); return () => r.result; }),
        put: (k, v) => run('readwrite', (os) => { os.put(v, k); return () => undefined; }),
        del: (k) => run('readwrite', (os) => { os.delete(k); return () => undefined; }),
        all: () => run('readonly', (os) => { const k = os.getAllKeys(), v = os.getAll(); return () => k.result.map((key, i) => [key, v.result[i]]); }),
      });
    };
  });
}

/** The counters record, or null when it is not one (a corrupt store). */
export function cleanMeta(v) {
  if (!isObj(v)) return null;
  for (const k of ['iterations', 'tried', 'maxSliceMs', 'corrupt', 'cursor']) if (!isCount(v[k])) return null;
  return { iterations: v.iterations, tried: v.tried, maxSliceMs: v.maxSliceMs, corrupt: v.corrupt, cursor: v.cursor };
}
export const zeroMeta = () => ({ iterations: 0, tried: 0, maxSliceMs: 0, corrupt: 0, cursor: 0 });

/**
 * A task record, or null when it is not the shape this file writes: its key, task, templates, rounds, and cells that
 * each carry a check { ok, n } and pass the kernel's checkCell (kernel optional for a count).
 */
export function cleanTask(key, v, kernel = null) {
  if (!isObj(v) || typeof v.task !== 'string' || !TASK_RE.test(v.task) || key !== 'task:' + v.task) return null;
  if (!Array.isArray(v.templates) || !v.templates.every((t) => typeof t === 'string')) return null;
  if (!Array.isArray(v.cells) || !Number.isInteger(v.rounds) || v.rounds < 0) return null;
  for (const k of v.cells) {
    if (!isObj(k) || !isObj(k.check) || !Number.isInteger(k.check.ok) || !Number.isInteger(k.check.n) || !isObj(k.cell)) return null;
    if (kernel && !kernel.checkCell(k.cell).ok) return null;
  }
  return { task: v.task, templates: v.templates, cells: v.cells, rounds: v.rounds, at: isCount(v.at) ? v.at : 0, mastered: v.mastered === true };
}

/**
 * The keys to drop so the records fit the cap: the oldest record of a task not mastered on this device first, then
 * (only when those are gone) the oldest mastered one.
 * @param {{ key: string, bytes: number, at: number, mastered: boolean }[]} recs
 */
export function overCap(recs, cap = STORE_CAP) {
  let total = recs.reduce((s, r) => s + r.bytes, 0);
  const drop = [];
  const order = [...recs].sort((a, b) => Number(a.mastered) - Number(b.mastered) || a.at - b.at || cmp(a.key, b.key));
  for (const r of order) {
    if (total <= cap) break;
    drop.push(r.key);
    total -= r.bytes;
  }
  return drop;
}

/** What the store holds, cleaned: { meta, recs: Map(task -> record), corrupt: [keys] }. */
export async function readStore(store, kernel = null) {
  const out = { meta: zeroMeta(), recs: new Map(), corrupt: [] };
  for (const [key, v] of await store.all()) {
    if (key === 'meta') { const m = cleanMeta(v); if (m) out.meta = m; else out.corrupt.push(key); continue; }
    const rec = typeof key === 'string' ? cleanTask(key, v, kernel) : null;
    if (rec) out.recs.set(rec.task, rec);
    else out.corrupt.push(key);
  }
  return out;
}

/** The counts the body line prints, from the records. */
export function countsOf(recs) {
  let cells = 0, tasks = 0;
  for (const r of recs.values()) if (r.cells.length) { cells += r.cells.length; tasks++; }
  return { cells, tasks };
}

/** THE LINE the page prints, dim, from the worker's own counters. */
export function bodyLine({ cells = 0, tasks = 0, tried = 0, why = null } = {}) {
  return 'this device: ' + cells + ' cells kept for ' + tasks + ' tasks, ' + tried + ' tried, ' + (why ? 'paused (' + why + ')' : 'running');
}

// ---------------------------------------------------------------- THE WORKER

/**
 * The candidates a task may try next slice, from what this slice took: the search core checks its clock only now and
 * then and induces every candidate's guard after it, so the count of candidates is what bounds a slice. Over the
 * search's share of the slice it shrinks in proportion; under half that share it grows by a quarter.
 */
export function nextBudget(b, ms) {
  const goal = SLICE_MS * SEARCH_SHARE;
  const n = Number.isFinite(b) && b > 0 ? b : GEN.start;
  if (!Number.isFinite(ms) || ms < 0) return n;
  if (ms > goal) return Math.max(GEN.min, Math.floor((n * goal * 0.8) / ms));
  if (ms < goal / 2) return Math.min(GEN.max, Math.ceil(n * 1.25));
  return n;
}

/** The pause the page's state asks for, or null: the switch, then visibility, save-data and the battery. */
export function envWhy(env) {
  if (!isObj(env)) return WHY.waiting;
  if (env.stopped === true) return WHY.stopped;
  if (env.hidden === true) return WHY.hidden;
  if (env.saveData === true) return WHY.saveData;
  const b = env.battery;
  if (isObj(b) && b.charging === false && typeof b.level === 'number' && b.level < BATTERY_FLOOR) return WHY.battery;
  return null;
}

/**
 * The body's loop on a worker scope ({ postMessage, addEventListener }). Every outside thing is injectable: now (the
 * slice clock, ms), clock (the wall clock of a record), setTimeout, fetch, load (the core), openStore and cap. It does
 * nothing until the page's first { type: 'env' } message, and posts { type: 'status', status } after every tick.
 * @returns {{ tick: Function, state: object, status: Function, onMessage: Function }}
 */
export function startWorker(scope, o = {}) {
  const now = o.now || msNow;
  const clock = o.clock || (() => Date.now());
  const later = o.setTimeout || ((f, ms) => setTimeout(f, ms));
  const get = o.fetch || ((u) => scope.fetch(u));
  const load = o.load || (() => loadCore());
  const openStore = o.openStore || (() => idbStore(scope.indexedDB));
  const tasksUrl = o.tasksUrl || TASKS_URL;
  const S = {
    env: null, timer: null, busy: false, restUntil: 0, budget: GEN.start, budgets: new Map(), why: WHY.waiting, error: null, lastMs: 0, lastRest: 0,
    core: undefined, store: undefined, list: undefined, meta: zeroMeta(), recs: new Map(), files: new Map(), bad: new Set(), fetched: [],
  };
  const post = (m) => { try { scope.postMessage(m); } catch { /* a page that is gone */ } };

  async function fetchJson(url) {
    S.fetched.push(url);
    const res = await get(url);
    if (!res || !res.ok) throw new Error(url + ' answered ' + (res ? res.status : 'nothing'));
    return res.json();
  }
  /** One task's rows, fetched once (a failed or non-table file is null, and the task is skipped from then on). */
  function rowsOf(t) {
    if (!S.files.has(t.task)) S.files.set(t.task, fetchJson(new URL(t.file, tasksUrl).href).then((j) => taskRows(j, t.task), () => null));
    return S.files.get(t.task);
  }
  async function openAll() {
    let store = null;
    try { store = await openStore(); } catch { store = null; }
    if (!store) return null;
    const got = await readStore(store, S.core.kernel);
    S.meta = got.meta;
    S.recs = got.recs;
    for (const key of got.corrupt) { await store.del(key); S.meta.corrupt++; }
    await capStore(store);
    return store;
  }
  async function capStore(store) {
    const recs = [...S.recs.values()].map((r) => ({ key: 'task:' + r.task, task: r.task, bytes: sizeOf(r), at: r.at, mastered: r.mastered }));
    for (const key of overCap(recs, o.cap || STORE_CAP)) { await store.del(key); S.recs.delete(key.slice(5)); }
  }
  /** The next task to grow: the list's order from the cursor, past a bad task or one mastered on this device. */
  function pick() {
    const L = S.list || [];
    for (let i = 0; i < L.length; i++) {
      const at = (S.meta.cursor + i) % L.length;
      const t = L[at], r = S.recs.get(t.task);
      if (S.bad.has(t.task) || (r && r.mastered)) continue;
      return { t, at };
    }
    return null;
  }
  async function pauseWhy() {
    const e = envWhy(S.env);
    if (e) return e;
    if (S.core === undefined) { try { S.core = await load(); } catch { S.core = null; } }
    if (!S.core) return WHY.core;
    if (S.store === undefined) S.store = await openAll().catch(() => null);
    if (!S.store) return WHY.storage;
    if (S.list === undefined) S.list = await fetchJson(tasksUrl).then(taskList, () => null);
    if (!S.list) return WHY.tasks;
    if (!pick()) return WHY.done;
    return null;
  }
  /** Negatives: the built-in prompts and the prompts of the other tasks this worker has read. */
  async function negatives(task) {
    const out = [...(S.core.core.BUILTIN_LIST || [])];
    for (const [name, p] of S.files) {
      if (name === task || out.length >= MAX_NEGATIVES) continue;
      const rows = await p;
      if (rows) for (const r of rows) if (out.length < MAX_NEGATIVES) out.push(r.q);
    }
    return out;
  }
  /** One slice: spawn on the fit rows, keep what passes every check row, store it. Returns the ms it worked. */
  async function slice() {
    const { t, at } = pick();
    S.meta.cursor = (at + 1) % S.list.length;
    const rows = await rowsOf(t);
    if (!rows) { S.bad.add(t.task); return 0; }
    const negs = await negatives(t.task);
    const t0 = now();
    const { core, kernel } = S.core;
    const prev = S.recs.get(t.task);
    const rec = prev ? { ...prev } : { task: t.task, templates: core.deriveTemplates(rows.map((r) => r.q)), cells: [], rounds: 0, at: 0, mastered: false };
    const sp = splitRows(rows, rec.rounds);
    const budget = S.budgets.get(t.task) || GEN.start;
    S.budget = budget;
    const out = core.spawn({
      task: t.task, rows: fitWindow(sp.fit, rec.rounds), negatives: negs, gen: rec.rounds + 1,
      parents: rec.cells.map((k) => k.cell), budget: { maxGenerated: budget, maxMs: Math.max(1, Math.floor((SLICE_MS * SEARCH_SHARE) / 2)) },
    });
    const have = new Set(rec.cells.map((k) => k.cell.id));
    const kept = [];
    for (const cell of out && Array.isArray(out.cells) ? out.cells : []) {
      if (!cell || have.has(cell.id) || rec.cells.length + kept.length >= MAX_CELLS) continue;
      if (sp.check.every((r) => core.passesRow(kernel.runCell(cell, r.q), r))) { kept.push({ cell, check: { ok: sp.check.length, n: sp.check.length }, round: rec.rounds }); have.add(cell.id); }
    }
    const cells = rec.cells.concat(kept);
    const colony = kept.length ? kernel.makeColony(cells.map((k) => k.cell)) : null;
    const mastered = rec.mastered || (!!colony && rows.every((r) => core.passesRow(colony.answer(r.q), r)));
    const ms = now() - t0;
    S.budgets.set(t.task, nextBudget(budget, ms));
    const next = { ...rec, cells, rounds: rec.rounds + 1, at: clock(), mastered };
    S.recs.set(t.task, next);
    S.meta.iterations++;
    S.meta.tried += out && out.stats && isCount(out.stats.generated) ? out.stats.generated : 0;
    S.meta.maxSliceMs = Math.max(S.meta.maxSliceMs, ms);
    if (kept.length || mastered !== rec.mastered || !prev || next.rounds % 20 === 0) {
      await S.store.put('task:' + t.task, next);
      await capStore(S.store);
    }
    await S.store.put('meta', S.meta);
    return ms;
  }
  function status() {
    const c = countsOf(S.recs);
    return {
      cells: c.cells, tasks: c.tasks, tried: S.meta.tried, iterations: S.meta.iterations, corrupt: S.meta.corrupt,
      maxSliceMs: S.meta.maxSliceMs, lastSliceMs: S.lastMs, lastRestMs: S.lastRest, budget: S.budget, running: !S.why, why: S.why, error: S.error,
      line: bodyLine({ cells: c.cells, tasks: c.tasks, tried: S.meta.tried, why: S.why }),
    };
  }
  function kick() {
    if (S.timer !== null || S.busy) return;
    S.timer = later(tick, Math.max(0, S.restUntil - now()));
  }
  async function tick() {
    S.timer = null;
    if (S.busy) return;
    S.busy = true;
    let rest = null;
    try {
      const why = await pauseWhy();
      if (why) S.why = why;
      else {
        S.why = null;
        const ms = await slice();
        rest = Math.max(SLICE_MS, ms);
        S.lastMs = ms;
        S.lastRest = rest;
        S.restUntil = now() + rest;
        S.why = envWhy(S.env);
      }
    } catch (err) {
      S.why = WHY.failed;
      S.error = String((err && err.message) || err).slice(0, 200);
      rest = null;
    } finally {
      S.busy = false;
    }
    post({ type: 'status', status: status() });
    if (rest !== null && !S.why && S.timer === null) S.timer = later(tick, rest);
  }
  function onMessage(d) {
    if (!isObj(d) || d.type !== 'env') return;
    S.env = { stopped: d.stopped === true, hidden: d.hidden === true, saveData: d.saveData === true, battery: isObj(d.battery) ? { level: Number(d.battery.level), charging: d.battery.charging === true } : null };
    if (S.why === WHY.failed) return;
    kick();
  }
  if (scope && typeof scope.addEventListener === 'function') scope.addEventListener('message', (e) => onMessage(e && e.data));
  return { tick, state: S, status, onMessage };
}

const inWorker = typeof WorkerGlobalScope !== 'undefined' && typeof self !== 'undefined' && self instanceof WorkerGlobalScope; // eslint-disable-line no-undef
if (inWorker) startWorker(self); // eslint-disable-line no-undef

// ---------------------------------------------------------------- THE PAGE

let PAGE_STORE = null;
/** The page's own handle on the store, opened once (null when the device has none). */
export function pageStore(idb = globalThis.indexedDB) {
  if (!PAGE_STORE) PAGE_STORE = idbStore(idb);
  return PAGE_STORE;
}

/**
 * A prompt answered by a cell grown on THIS device, or null. A record answers only when its task's templates fit the
 * prompt exactly, and only with the cells that passed ALL their check rows (ok === n, n at least MIN_CHECK).
 * @returns {Promise<{ text: string, task: string, cells: number, route: string } | null>}
 */
export async function deviceAnswer(q, { load = pageCore, store = null, openStore = pageStore } = {}) {
  try {
    if (typeof q !== 'string' || !q.trim()) return null;
    const C = await load();
    if (!C) return null;
    const st = store || await openStore();
    if (!st) return null;
    const { recs } = await readStore(st, C.kernel);
    for (const rec of [...recs.values()].sort((a, b) => cmp(a.task, b.task))) {
      if (!rec.templates.length || C.core.fitsTemplates(rec.templates, q) !== true) continue;
      const cells = rec.cells.filter((k) => k.check.n >= MIN_CHECK && k.check.ok === k.check.n).map((k) => k.cell);
      if (!cells.length) continue;
      const a = C.kernel.makeColony(cells).answer(q);
      if (typeof a === 'string' && a.trim()) return { text: a, task: rec.task, cells: cells.length, route: ROUTE_LINE };
    }
    return null;
  } catch {
    return null;
  }
}

/** The page's state for the worker: visibility, save-data and the battery, as one { type: 'env' } message. */
export function envOf({ document: doc, navigator: nav, battery = null, stopped = false }) {
  const c = nav && nav.connection;
  return {
    type: 'env', stopped: stopped === true,
    hidden: !!doc && doc.visibilityState === 'hidden',
    saveData: !!c && c.saveData === true,
    battery: battery && typeof battery.level === 'number' ? { level: battery.level, charging: battery.charging === true } : null,
  };
}

/**
 * THE BODY on the page: THE SWITCH (localStorage SWITCH_KEY, '0' is off; written only when it is used), the worker
 * (a module worker on this file's own URL), and the ONE dim line in lineEl. Every outside thing is injected.
 * @returns {{ on: () => boolean, line: () => string, toggle: () => Promise<boolean>, send: () => void, worker: () => object|null, ready: Promise<void> }}
 */
export function startBody({
  document: doc = globalThis.document, navigator: nav = globalThis.navigator, Worker: W = globalThis.Worker,
  storage = null, url = HERE, lineEl = null, switchEl = null, openStore = pageStore,
} = {}) {
  let on = true;
  try { on = !storage || storage.getItem(SWITCH_KEY) !== '0'; } catch { on = true; }
  let worker = null, battery = null, text = '', seq = 0;
  const show = (s) => { text = s; if (lineEl) lineEl.textContent = s; };
  const label = () => { if (switchEl) { switchEl.textContent = on ? 'stop the body' : 'start the body'; switchEl.setAttribute('aria-pressed', on ? 'true' : 'false'); } };
  const send = () => { if (worker) { try { worker.postMessage(envOf({ document: doc, navigator: nav, battery })); } catch { /* gone */ } } };
  /** The line from the store when no worker runs: what this device kept, paused for why. */
  async function still(why) {
    const mine = ++seq;
    let c = { cells: 0, tasks: 0 }, tried = 0;
    try {
      const st = await openStore();
      if (st) { const got = await readStore(st); c = countsOf(got.recs); tried = got.meta.tried; }
    } catch { /* an empty line below */ }
    if (mine === seq) show(bodyLine({ cells: c.cells, tasks: c.tasks, tried, why }));
  }
  function start() {
    if (typeof W !== 'function') return still(WHY.worker);
    try { worker = new W(url, { type: 'module', name: 'pocket-era' }); } catch { worker = null; return still(WHY.worker); }
    seq++;
    worker.onmessage = (e) => { const d = e && e.data; if (isObj(d) && d.type === 'status' && isObj(d.status) && typeof d.status.line === 'string') show(d.status.line); };
    worker.onerror = () => { stop(); still(WHY.failed); };
    send();
    return Promise.resolve();
  }
  function stop() { if (worker) { try { worker.terminate(); } catch { /* gone */ } worker = null; } }
  if (doc && typeof doc.addEventListener === 'function') doc.addEventListener('visibilitychange', send);
  const c = nav && nav.connection;
  if (c && typeof c.addEventListener === 'function') c.addEventListener('change', send);
  const bat = nav && typeof nav.getBattery === 'function'
    ? Promise.resolve().then(() => nav.getBattery()).then((b) => {
      battery = b || null;
      if (b && typeof b.addEventListener === 'function') { b.addEventListener('levelchange', send); b.addEventListener('chargingchange', send); }
    }, () => { battery = null; })
    : Promise.resolve();
  label();
  const ready = bat.then(() => (on ? start() : still(WHY.stopped)));
  async function toggle() {
    await ready;
    on = !on;
    try { if (storage) storage.setItem(SWITCH_KEY, on ? '1' : '0'); } catch { /* the switch still works for this page */ }
    label();
    if (on) await start();
    else { stop(); await still(WHY.stopped); }
    return on;
  }
  if (switchEl && typeof switchEl.addEventListener === 'function') switchEl.addEventListener('click', () => { toggle(); });
  return { on: () => on, line: () => text, toggle, send, worker: () => worker, ready };
}
