// bench/grid-curve.mjs: THE SECOND ATTEMPT AND THE CLOCK CURVE OF THE ARC GRID SEARCH, NO MODEL.
//
// Board 33, item arc-lock-in (docs/VISION.md order 4, the ARC-AGI-1 row). What was printed before
// it: bench/verdicts/grid-local-evaluation.json, 85 of 400 evaluation tasks at 3000 ms, ONE
// attempt per task (ARC grades two), and of the 315 unsolved 288 ran out of clock, 26 found a
// program that fit every train pair and missed a test output, 1 exhausted the vocabulary. So this
// bench measures the two things that are not knowledge: the second attempt and the clock. The
// vocabulary (capability/grid-dsl.mjs, 196 words and learners) and the depth (4) do not move here.
//
//   THE SECOND ATTEMPT, same clock as the one attempt run (writes bench/verdicts/grid-attempts.json):
//   node bench/grid-curve.mjs --out attempts --split evaluation --budget-ms 3000 --attempts 2 --workers 12 --resume
//        --base bench/verdicts/grid-local-evaluation.json --control bench/verdicts/grid-split-evaluation-control.json
//
//   THE CLOCK CURVE, THE BAR (writes bench/verdicts/grid-curve.json):
//   node bench/grid-curve.mjs --split evaluation --budget-ms 30000 --attempts 2 --workers 12 --resume
//        --base bench/verdicts/grid-local-evaluation.json,bench/verdicts/grid-attempts.json
//
//   THE NEXT POINT, on the tasks the 30000 ms point left timed out (the orchestrator's run):
//   node bench/grid-curve.mjs --split evaluation --budget-ms 300000 --attempts 2 --workers 12 --resume
//        --base bench/verdicts/grid-local-evaluation.json,bench/verdicts/grid-attempts.json
//        --only-timed-out-of bench/verdicts/grid-curve-evaluation-30000ms.jsonl
//
//   THE CONTROL, the training split the vocabulary was written against, a fixed seed draw of 100
//   (writes bench/verdicts/grid-curve-partial.json):
//   node bench/grid-curve.mjs --split training --budget-ms 3000,30000 --attempts 2 --workers 12 --resume
//        --limit 100 --seed 33 --base bench/verdicts/grid-local-training.json
//
// Every run appends ONE JSON LINE PER TASK to a journal (bench/verdicts/grid-curve-<split>-<ms>ms
// [-n<N>-seed<S>|-timedout].jsonl, or grid-attempts-<split>-<ms>ms.jsonl), so a killed run
// continues with --resume where it stopped; a journal whose header names another split, clock,
// attempts, depth or task list is refused, and an existing journal without --resume is refused.
// A run whose journal is complete runs nothing and writes the verdict again from the journal.
//
// Before any task runs it prints THE PRICE: every task that ran to the clock at the previous point
// (or stopped at fewer answers than this run wants) is priced at the whole new clock, every other
// task at its wall there; the sum over the workers is the wall to expect.
//
// A --base file is a point measured before (a bench/verdicts/grid-*.json with rows): its numbers
// are recomputed from its rows for the tasks this run selects, and it keeps its own stamp. Every
// point is paired by task id with the one before it: gainedIds, lostIds. --limit N is a fixed seed
// draw (mulberry32, --seed, default 33, a Fisher Yates shuffle of the sorted ids, the first N,
// sorted again) and writes the -partial file. At most 12 workers (the machine is shared).
import { Worker } from 'node:worker_threads';
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadSplit, overlapOf, splitFor, frontierBar } from './grid.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERDICTS = path.join(ROOT, 'bench', 'verdicts');
export const MAX_WORKERS = 12;
export const DEPTH = 4;
export const GRACE_MS = 4000;
export const DEFAULT_SEED = 33;
export const ORDER_RULE = 'Two attempts per task, ARC\'s own rule: a task is right when every test input is answered right by either attempt. The search takes programs that fit every train pair (checked through grid.dsl.match cells) in the order it finds them and stops at two; a program counts as a new attempt only when its test outputs differ from every earlier attempt on at least one test input. So the two attempts are the first two programs found whose test outputs differ, and when only one such answer is found before the clock ends attempt 2 is empty. The two are listed by program length (base words, a learned last step counted as one, a macro as the words it stands for), then by discovery order (capability/grid-search.mjs orderAttempts); solvedFirst stays the program found first, which is the answer a one attempt run gives, so no task a one attempt run solves can be lost by the order.';

const r2 = (x) => Math.round(x * 100) / 100;
const sha = (x) => createHash('sha256').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex');
const rel = (abs) => path.relative(ROOT, abs).replace(/\\/g, '/');

// ---------------------------------------------------------------- arguments
export function parseCurveArgs(argv) {
  const a = { split: 'evaluation', budgets: [30000], attempts: 2, workers: MAX_WORKERS, limit: null, seed: DEFAULT_SEED, ids: null, resume: false, base: [], control: null, out: 'curve', onlyTimedOutOf: null, journal: null, verdicts: null, heapMb: 2048, admitMb: 3000, preemptMb: 4400, respawnHeapMb: 96, rampMs: 1500, priceOnly: false, quiet: false };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], v = argv[i + 1];
    if (k === '--split') { a.split = v; i++; }
    else if (k === '--budget-ms') { a.budgets = String(v).split(',').filter(Boolean).map(Number); i++; }
    else if (k === '--attempts') { a.attempts = Number(v); i++; }
    else if (k === '--workers') { a.workers = Number(v); i++; }
    else if (k === '--limit') { a.limit = Number(v); i++; }
    else if (k === '--seed') { a.seed = Number(v); i++; }
    else if (k === '--ids') { a.ids = String(v).split(',').filter(Boolean); i++; }
    else if (k === '--resume') a.resume = true;
    else if (k === '--base') { a.base = String(v).split(',').filter(Boolean); i++; }
    else if (k === '--control') { a.control = String(v); i++; }
    else if (k === '--out') { a.out = String(v); i++; }
    else if (k === '--only-timed-out-of') { a.onlyTimedOutOf = String(v); i++; }
    else if (k === '--journal') { a.journal = String(v); i++; }
    else if (k === '--verdicts') { a.verdicts = String(v); i++; }
    else if (k === '--heap-mb') { a.heapMb = Number(v); i++; }
    else if (k === '--admit-mb') { a.admitMb = Number(v); i++; }
    else if (k === '--preempt-mb') { a.preemptMb = Number(v); i++; }
    else if (k === '--respawn-heap-mb') { a.respawnHeapMb = Number(v); i++; }
    else if (k === '--ramp-ms') { a.rampMs = Number(v); i++; }
    else if (k === '--price-only') a.priceOnly = true;
    else if (k === '--quiet') a.quiet = true;
    else throw new Error('bench/grid-curve.mjs: unknown argument ' + k);
  }
  if (a.split !== 'training' && a.split !== 'evaluation') throw new Error('bench/grid-curve.mjs: --split is training or evaluation');
  if (!a.budgets.length || a.budgets.some((b) => !(Number.isInteger(b) && b > 0))) throw new Error('bench/grid-curve.mjs: --budget-ms is one or more whole numbers of ms, comma separated');
  for (let i = 1; i < a.budgets.length; i++) if (!(a.budgets[i] > a.budgets[i - 1])) throw new Error('bench/grid-curve.mjs: --budget-ms points rise');
  if (!(a.attempts === 1 || a.attempts === 2)) throw new Error('bench/grid-curve.mjs: --attempts is 1 or 2 (ARC grades two tries per test input)');
  if (!(Number.isInteger(a.workers) && a.workers >= 1 && a.workers <= MAX_WORKERS)) throw new Error('bench/grid-curve.mjs: --workers is 1 to ' + MAX_WORKERS + ' (the machine is shared)');
  if (a.limit !== null && !(Number.isInteger(a.limit) && a.limit >= 1)) throw new Error('bench/grid-curve.mjs: --limit is a whole number');
  if (!Number.isInteger(a.seed)) throw new Error('bench/grid-curve.mjs: --seed is a whole number');
  if (a.out !== 'curve' && a.out !== 'attempts') throw new Error('bench/grid-curve.mjs: --out is curve or attempts');
  if (a.out === 'attempts' && a.budgets.length !== 1) throw new Error('bench/grid-curve.mjs: --out attempts runs one clock');
  if (a.out === 'attempts' && a.base.length !== 1) throw new Error('bench/grid-curve.mjs: --out attempts pairs with one --base (the one attempt run at the same clock)');
  if (a.onlyTimedOutOf && (a.budgets.length !== 1 || a.limit || a.ids)) throw new Error('bench/grid-curve.mjs: --only-timed-out-of runs one clock on the tasks the journal left timed out');
  if (a.journal && a.budgets.length !== 1) throw new Error('bench/grid-curve.mjs: --journal names one journal, so one clock');
  if (!(a.heapMb >= 128) || !(a.admitMb >= 256) || !(a.preemptMb > a.admitMb) || !(a.respawnHeapMb >= 64) || !(a.rampMs >= 0)) throw new Error('bench/grid-curve.mjs: bad --heap-mb, --admit-mb, --preempt-mb (above --admit-mb) or --respawn-heap-mb');
  return a;
}

// ---------------------------------------------------------------- the selection
/** mulberry32: a 32 bit seeded generator, uniform in [0, 1). */
export function mulberry32(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** A fixed seed draw of n ids: a Fisher Yates shuffle of the sorted ids under mulberry32(seed), the first n, sorted. */
export function drawIds(ids, n, seed) {
  const a = ids.slice().sort();
  const rnd = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a.slice(0, Math.min(n, a.length)).sort();
}

// ---------------------------------------------------------------- rows, points, pairs
const isFoundWrong = (r) => r.status === 'found' && r.solved !== true;
/** One point of the curve from its rows (one per task). */
export function pointOf(rows, meta = {}) {
  const n = rows.length;
  const count = (f) => rows.filter(f).length;
  const solved = count((r) => r.solved === true);
  const p = {
    budgetMs: meta.budgetMs ?? null, attempts: meta.attempts ?? null, workers: meta.workers ?? null,
    solved, of: n, pct: n ? r2((100 * solved) / n) : null,
    timedOut: count((r) => r.status === 'timeout'), foundButWrong: count(isFoundWrong), exhausted: count((r) => r.status === 'exhausted'),
    errors: count((r) => r.status === 'error'), killed: count((r) => r.killed === true),
    solvedAtFirstFound: count((r) => r.solvedFirst === true),
    secondFound: count((r) => Array.isArray(r.attempts) && r.attempts.length >= 2),
    rescuedBySecond: count((r) => r.solved === true && r.solvedFirst !== true),
    meanMs: n ? r2(rows.reduce((s, r) => s + (Number(r.wallMs) || 0), 0) / n) : null,
    wallSeconds: meta.wallSeconds ?? null,
  };
  return p;
}
/** Two row sets of the same tasks paired by id: gained (solved here, not there) and lost (solved there, not here). */
export function pairById(rows, before) {
  const mine = new Map(rows.map((r) => [r.id, r]));
  const theirs = new Map(before.map((r) => [r.id, r]));
  if (mine.size !== theirs.size || [...mine.keys()].some((id) => !theirs.has(id))) throw new Error('bench/grid-curve.mjs: the paired rows graded different tasks (' + mine.size + ' against ' + theirs.size + ')');
  const gained = [...mine.values()].filter((r) => r.solved === true && theirs.get(r.id).solved !== true).map((r) => r.id).sort();
  const lost = [...mine.values()].filter((r) => r.solved !== true && theirs.get(r.id).solved === true).map((r) => r.id).sort();
  return { gained, lost };
}
/** The found but wrong tasks of a run the second attempt turned right. */
export function convertedFoundButWrong(rows, before) {
  const now = new Map(rows.map((r) => [r.id, r]));
  const wrong = before.filter(isFoundWrong).map((r) => r.id).sort();
  const ids = wrong.filter((id) => now.has(id) && now.get(id).solved === true);
  return { converted: ids.length, of: wrong.length, ids, stillWrong: wrong.filter((id) => now.has(id) && isFoundWrong(now.get(id))).length };
}
/** Solved per tenfold of clock between two points of the same attempts. */
export function marginalOf(a, b, pair) {
  const tenfolds = Math.log10(b.budgetMs / a.budgetMs);
  const net = b.solved - a.solved;
  return { fromMs: a.budgetMs, toMs: b.budgetMs, attempts: b.attempts, tenfolds: r2(tenfolds), gained: pair.gained.length, lost: pair.lost.length, net, solvedPerTenfold: tenfolds > 0 ? r2(net / tenfolds) : null };
}

// ---------------------------------------------------------------- the price
/**
 * The price of a run at budgetMs from the rows of the point before it (prevBudgetMs): a task that
 * ran to that clock, or stopped with fewer answers than this run wants without exhausting the
 * vocabulary, is priced at the whole new clock; any other task at its wall there.
 */
export function priceOf(prevRows, o) {
  const cut = 0.9 * o.prevBudgetMs;
  let full = 0, early = 0, taskMs = 0;
  for (const r of prevRows) {
    const answers = Array.isArray(r.attempts) ? r.attempts.length : r.status === 'found' ? 1 : 0;
    const finished = (Number(r.wallMs) || 0) < cut && (r.status === 'exhausted' || answers >= o.attempts);
    if (finished) { early++; taskMs += Number(r.wallMs) || 0; } else { full++; taskMs += o.budgetMs; }
  }
  const taskSeconds = r2(taskMs / 1000);
  const wallSeconds = r2(taskMs / 1000 / Math.max(1, Math.min(o.workers, prevRows.length || 1)));
  const line = 'PRICE: ' + prevRows.length + ' tasks at ' + o.budgetMs + ' ms, ' + o.attempts + ' attempt' + (o.attempts > 1 ? 's' : '') + ', ' + o.workers + ' workers: '
    + full + ' priced at the whole ' + o.budgetMs + ' ms clock (at the ' + o.prevBudgetMs + ' ms point they ran to the clock or stopped with fewer than ' + o.attempts + ' answer' + (o.attempts > 1 ? 's' : '') + '), '
    + early + ' at their wall there (they finished early and will again); ' + taskSeconds + ' task seconds, about ' + r2(wallSeconds / 60) + ' minutes of wall over ' + o.workers + ' workers (plus up to ' + GRACE_MS + ' ms grace on a task killed at the hard deadline); a CPU price: lanes the memory rule holds idle are not in it';
  return { tasks: prevRows.length, full, early, taskSeconds, wallSeconds, minutes: r2(wallSeconds / 60), line };
}

// ---------------------------------------------------------------- the journal
/** A journal read back: its header, its rows by id, its sessions; a torn last line is reported, a torn middle line throws. */
export function readJournal(file) {
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  let header = null, tornTail = false;
  const rows = new Map(), sessions = [], ends = [];
  lines.forEach((ln, i) => {
    let x;
    try { x = JSON.parse(ln); } catch {
      if (i === lines.length - 1) { tornTail = true; return; }
      throw new Error('bench/grid-curve.mjs: journal ' + file + ' line ' + (i + 1) + ' does not parse');
    }
    if (x.type === 'header') header = x;
    else if (x.type === 'session') sessions.push(x);
    else if (x.type === 'sessionEnd') ends.push(x);
    else if (x.type === 'row') rows.set(x.id, x);
  });
  if (!header) throw new Error('bench/grid-curve.mjs: journal ' + file + ' has no header line');
  return { header, rows, sessions, ends, tornTail, goodLines: tornTail ? lines.slice(0, -1) : lines };
}
const HEADER_KEYS = ['split', 'budgetMs', 'attempts', 'maxDepth', 'idsSha', 'onlyTimedOutOf'];
/** Open a journal for a run: new with its header, or (resume) checked against it; a torn last line is cut. */
export function openJournal(file, header, { resume, log = () => {} } = {}) {
  if (!existsSync(file)) {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify({ type: 'header', ...header }) + '\n');
    return { header, rows: new Map(), sessions: [] };
  }
  if (!resume) throw new Error('bench/grid-curve.mjs: journal ' + file + ' exists; pass --resume to continue it (or move it away to start over)');
  const j = readJournal(file);
  for (const k of HEADER_KEYS) if (JSON.stringify(j.header[k] ?? null) !== JSON.stringify(header[k] ?? null)) throw new Error('bench/grid-curve.mjs: journal ' + file + ' was written for ' + k + ' ' + JSON.stringify(j.header[k] ?? null) + ', this run is ' + JSON.stringify(header[k] ?? null));
  if (j.tornTail) { writeFileSync(file, j.goodLines.join('\n') + '\n'); log('journal: cut a torn last line (a run killed mid write); that task runs again'); }
  return j;
}
/** The wall of a point from its journal: per session, its last row's end minus its start, summed. */
export function wallOfJournal(rows, sessions) {
  let ms = 0;
  for (const s of sessions) {
    let last = null;
    for (const r of rows) if (r.session === s.n && (last === null || r.endedAt > last)) last = r.endedAt;
    if (last !== null) ms += last - s.startedAt;
  }
  return r2(ms / 1000);
}

// ---------------------------------------------------------------- the workers
const WORKER_SRC = [
  "const { parentPort, workerData } = require('node:worker_threads');",
  "const v8 = require('node:v8');",
  'let solveArcTask = null;',
  'import(workerData.searchUrl).then((m) => { solveArcTask = m.solveArcTask; parentPort.postMessage({ type: "ready" }); }, (e) => parentPort.postMessage({ type: "bootFailed", error: String(e && e.stack || e) }));',
  'parentPort.on("message", (msg) => {',
  '  const t0 = performance.now();',
  '  try {',
  '    const r = solveArcTask(msg.task, { budgetMs: workerData.budgetMs, maxDepth: workerData.maxDepth, attempts: workerData.attempts });',
  '    const heapMb = Math.round(v8.getHeapStatistics().total_heap_size / 1048576);',
  '    parentPort.postMessage({ type: "done", id: msg.id, wallMs: performance.now() - t0, r: { status: r.status, solved: r.solved, solvedFirst: r.solvedFirst, names: r.names, depth: r.depth, attempts: r.attempts, attemptRight: r.attemptRight, firstMs: r.firstMs, searched: r.searched, states: r.states, rejected: r.rejected, popped: r.popped, phases: r.phases, ms: r.ms, cells: r.cells, vocabulary: r.vocabulary, heapMb } });',
  '  } catch (e) {',
  '    parentPort.postMessage({ type: "done", id: msg.id, wallMs: performance.now() - t0, r: { status: "error", solved: false, error: String(e && e.message || e) } });',
  '  }',
  '});',
].join('\n');

function spawnWorker(budgetMs, cfg) {
  return new Worker(WORKER_SRC, {
    eval: true,
    workerData: { searchUrl: pathToFileURL(path.join(ROOT, 'capability', 'grid-search.mjs')).href, budgetMs, maxDepth: DEPTH, attempts: cfg.attempts },
    resourceLimits: { maxOldGenerationSizeMb: cfg.heapMb, maxYoungGenerationSizeMb: 64, stackSizeMb: 8 },
  });
}
function ready(w) {
  return new Promise((resolve) => {
    const on = (m) => { if (m && (m.type === 'ready' || m.type === 'bootFailed')) { w.off('message', on); resolve(m); } };
    w.on('message', on);
  });
}
function runOne(w, id, task, hardMs, slot) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (done) return; done = true; clearTimeout(t); w.off('message', onMsg); w.off('error', onErr); slot.abort = null; resolve(v); };
    const onMsg = (m) => { if (m && m.type === 'done' && m.id === id) finish({ killed: false, wallMs: m.wallMs, r: m.r }); };
    const onErr = (e) => finish({ killed: true, wallMs: hardMs, r: { status: 'error', solved: false, error: String(e && (e.code || e.message) || e) } });
    const t = setTimeout(() => finish({ killed: true, wallMs: hardMs, r: { status: 'timeout', solved: false, error: 'killed at the hard deadline' } }), hardMs);
    slot.abort = () => finish({ preempted: true });
    w.on('message', onMsg);
    w.on('error', onErr);
    w.postMessage({ id, task });
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rssMb = () => Math.round(process.memoryUsage.rss() / 1048576);

// THE MEMORY RULE, measured before it was written: three of the heaviest evaluation tasks at
// 30000 ms took the process to 5188.2 MB (budget.mjs peak), heap sizes 935, 1371 and 1579 MB after
// the task, and twelve of them passed 6000 MB in 9 s (BUDGET KILLED ram 7205.4MB over 6000MB); a
// first scheduler that admitted all twelve at once and preempted one every 1.5 s over 4600 MB was
// killed the same way at 6325.9MB (it freed the youngest, smallest task too slowly). The search
// keeps its frontier (up to maxStates states, each holding a grid per train and test input), so
// memory grows with the clock. So twelve lanes share the cap by measurement, not by count: a lane
// starts a task only while the process is under --admit-mb and at least --ramp-ms after the last
// start (or when nothing runs), and while the process is over --preempt-mb the task started LAST is
// stopped every 700 ms, put back at the head of the queue and run again from its start later (a
// task is preempted at most MAX_PREEMPTS times, then it is left to finish). A preempted run writes
// no row: every row in a journal is one whole run at the whole clock. A worker whose heap passed
// --respawn-heap-mb is replaced after its task, so a finished task's heap is not carried: V8 keeps a
// finished task's heap (after 3000 ms tasks the heap read 130 MB at the 10th percentile, 204 MB at the
// median, 334 MB at the 90th, 609 MB at most, over 320 rows), a full collection gave back only half
// of it in a probe (288 MB to 142 MB), while a fresh worker boots in 153 to 185 ms at 28 to 29 MB. With
// the first default of 512 MB twelve idle workers held about 2500 MB, the admission rule then held most
// lanes idle, and 320 tasks at 3000 ms took 693.6 s (400 took 103.84 s after this fix and the ramp fix). So the default is 96 MB.
export const MAX_PREEMPTS = 3;
/** The pause between two task starts at one clock: --ramp-ms, but never more than a twentieth of the clock. */
export const rampFor = (budgetMs, rampMs) => Math.min(rampMs, Math.round(budgetMs / 20));
/** The running task to stop under memory pressure: the one started last among those preempted fewer than MAX_PREEMPTS times; none when fewer than two run. */
export function choosePreempt(running) {
  if (!Array.isArray(running) || running.length < 2) return null;
  const c = running.filter((r) => (r.preempts || 0) < MAX_PREEMPTS).sort((a, b) => b.startedAt - a.startedAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return c.length ? c[0] : null;
}

/** Run the tasks not yet in the journal at one clock, appending one row per task. */
async function runPoint(list, budgetMs, cfg, journalFile, session, log) {
  const hardMs = budgetMs + GRACE_MS;
  // the ramp is a twentieth of the clock at most: 1500 ms at 30000 ms, 150 ms at 3000 ms (a whole
  // 1500 ms ramp at 3000 ms held the first attempts run to about two lanes busy, measured on its wall)
  const rampMs = rampFor(budgetMs, cfg.rampMs);
  const queue = list.map((t) => ({ t, preempts: 0 }));
  const running = new Set();
  let finished = 0, preempted = 0, preemptedMs = 0, waitedMs = 0, respawned = 0, lastPreempt = 0, lastStart = 0;
  let peakRssMb = rssMb();
  const sampler = setInterval(() => {
    const m = rssMb();
    if (m > peakRssMb) peakRssMb = m;
    if (m > cfg.preemptMb && Date.now() - lastPreempt > 700) {
      const victim = choosePreempt([...running]);
      if (victim && victim.abort) { lastPreempt = Date.now(); victim.rssAt = m; victim.abort(); }
    }
  }, 250);
  const t0 = Date.now();
  const lane = async () => {
    let w = spawnWorker(budgetMs, cfg);
    let boot = await ready(w);
    if (boot.type !== 'ready') throw new Error('grid worker did not boot: ' + boot.error);
    const fresh = async () => {
      try { await w.terminate(); } catch { /* already gone */ }
      w = spawnWorker(budgetMs, cfg);
      boot = await ready(w);
      if (boot.type !== 'ready') throw new Error('grid worker did not reboot: ' + boot.error);
    };
    for (;;) {
      while (queue.length && running.size > 0 && (rssMb() > cfg.admitMb || Date.now() - lastStart < rampMs)) { waitedMs += 100; await sleep(100); }
      if (!queue.length) break;
      lastStart = Date.now();
      const item = queue.shift();
      const json = JSON.parse(readFileSync(item.t.file, 'utf8'));
      const slot = { id: item.t.id, startedAt: Date.now(), preempts: item.preempts, abort: null };
      running.add(slot);
      const res = await runOne(w, item.t.id, json, hardMs, slot);
      running.delete(slot);
      if (res.preempted) {
        preempted++; preemptedMs += Date.now() - slot.startedAt; item.preempts++;
        queue.unshift(item);
        if (!cfg.quiet) log('  preempted ' + item.t.id + ' after ' + r2((Date.now() - slot.startedAt) / 1000) + ' s at rss ' + slot.rssAt + ' MB (over ' + cfg.preemptMb + '), preempt ' + item.preempts + ' of ' + MAX_PREEMPTS + '; it runs again from its start');
        await fresh();
        continue;
      }
      const row = { type: 'row', id: item.t.id, session, endedAt: Date.now(), killed: res.killed, wallMs: r2(res.wallMs), ...(item.preempts ? { preemptsBefore: item.preempts } : {}), ...res.r };
      appendFileSync(journalFile, JSON.stringify(row) + '\n');
      finished++;
      if (!cfg.quiet && (finished % 25 === 0 || finished === list.length)) log('  ' + budgetMs + ' ms: ' + finished + ' of ' + list.length + ' run this session, ' + Math.round((Date.now() - t0) / 1000) + ' s, rss peak ' + peakRssMb + ' MB, preempted ' + preempted);
      if (res.killed || (res.r && res.r.heapMb > cfg.respawnHeapMb)) { if (!res.killed) respawned++; await fresh(); }
    }
    await w.terminate();
  };
  try { await Promise.all(Array.from({ length: Math.min(cfg.workers, list.length) }, lane)); } finally { clearInterval(sampler); }
  return { ran: finished, wallSeconds: r2((Date.now() - t0) / 1000), peakRssMb, preempted, preemptedSeconds: r2(preemptedMs / 1000), admissionWaitSeconds: r2(waitedMs / 1000), respawned };
}

// ---------------------------------------------------------------- base files
/** A --base verdict as a point: its rows for the selected ids, its own stamp. */
export function basePoint(file, cfg, ids) {
  const abs = path.resolve(ROOT, file);
  if (!existsSync(abs)) throw new Error('bench/grid-curve.mjs: --base ' + file + ' is not on disk');
  const v = JSON.parse(readFileSync(abs, 'utf8'));
  const arc = typeof v.split === 'string' ? v.split : v.arcSplit;
  if (arc !== cfg.split) throw new Error('bench/grid-curve.mjs: --base ' + file + ' graded the ' + arc + ' split, not ' + cfg.split);
  if (v.maxDepth !== DEPTH) throw new Error('bench/grid-curve.mjs: --base ' + file + ' ran at depth ' + v.maxDepth + ', not ' + DEPTH);
  const byId = new Map((v.rows || []).map((r) => [r.id, r]));
  const missing = ids.filter((id) => !byId.has(id));
  if (missing.length) throw new Error('bench/grid-curve.mjs: --base ' + file + ' has no row for ' + missing.length + ' selected tasks (' + missing.slice(0, 3).join(', ') + ')');
  const rows = ids.map((id) => byId.get(id));
  const attempts = v.attemptsPerTask ?? v.attempts ?? 1;
  const meta = { budgetMs: v.budgetMs, attempts, workers: v.workers ?? null, wallSeconds: ids.length === (v.rows || []).length ? v.wallSeconds ?? null : null };
  return { rows, meta, source: { file: rel(abs), at: v.at || null, command: v.command || null, node: v.node || null }, verdict: v };
}

// ---------------------------------------------------------------- the run
function publishedArc() {
  try { const j = JSON.parse(readFileSync(path.join(VERDICTS, 'public-arc.json'), 'utf8')); return Array.isArray(j.published) ? j.published : []; } catch { return []; }
}
function journalName(cfg, budgetMs, selectionTag) {
  const stem = cfg.out === 'attempts' ? 'grid-attempts' : 'grid-curve';
  return stem + '-' + cfg.split + '-' + budgetMs + 'ms' + (selectionTag ? '-' + selectionTag : '') + '.jsonl';
}
const compactRow = (r) => ({ id: r.id, status: r.status, solved: r.solved === true, solvedFirst: r.solvedFirst === true, wallMs: r.wallMs, attempts: Array.isArray(r.attempts) ? r.attempts.map((a) => ({ names: a.names, found: a.found ?? null, ms: a.ms ?? null, phase: a.phase ?? null })) : [], attemptRight: r.attemptRight ?? null, killed: r.killed === true, ...(r.carried ? { carried: true } : {}), ...(r.error ? { error: r.error } : {}) });

export async function runCurve(cfg, { argv = process.argv.slice(2), log = console.log } = {}) {
  const vdir = cfg.verdicts ? path.resolve(ROOT, cfg.verdicts) : VERDICTS;
  const all = loadSplit(cfg.split);
  const of = all.length;
  let list = all;
  let selection = { what: 'every task of the ARC-AGI-1 ' + cfg.split + ' split', n: of, of };
  let selectionTag = '';
  let source = null; // --only-timed-out-of: the journal whose timed out tasks this run takes
  if (cfg.ids) { list = all.filter((t) => cfg.ids.includes(t.id)); selection = { what: 'the tasks named by --ids', n: list.length, of, ids: list.map((t) => t.id) }; selectionTag = 'ids' + list.length + '-' + sha(list.map((t) => t.id).join(',')).slice(0, 8); }
  if (cfg.limit) {
    const keep = new Set(drawIds((cfg.ids ? list : all).map((t) => t.id), cfg.limit, cfg.seed));
    list = list.filter((t) => keep.has(t.id));
    selection = { what: 'a fixed seed draw of ' + list.length + ' tasks: mulberry32 seed ' + cfg.seed + ', a Fisher Yates shuffle of the sorted ids, the first ' + cfg.limit + ', sorted', n: list.length, of, seed: cfg.seed, limit: cfg.limit, ids: list.map((t) => t.id) };
    selectionTag = 'n' + list.length + '-seed' + cfg.seed;
  }
  const allIds = list.map((t) => t.id);
  let runList = list;
  if (cfg.onlyTimedOutOf) {
    const sabs = path.resolve(ROOT, cfg.onlyTimedOutOf);
    const sj = readJournal(sabs);
    if (sj.header.split !== cfg.split || sj.header.attempts !== cfg.attempts || sj.header.maxDepth !== DEPTH) throw new Error('bench/grid-curve.mjs: --only-timed-out-of ' + cfg.onlyTimedOutOf + ' was run on split ' + sj.header.split + ', attempts ' + sj.header.attempts + ', depth ' + sj.header.maxDepth);
    if (!(cfg.budgets[0] > sj.header.budgetMs)) throw new Error('bench/grid-curve.mjs: --only-timed-out-of takes a longer clock than its journal (' + sj.header.budgetMs + ' ms)');
    const missing = (sj.header.ids || []).filter((id) => !sj.rows.has(id));
    if (missing.length) throw new Error('bench/grid-curve.mjs: --only-timed-out-of ' + cfg.onlyTimedOutOf + ' is not complete (' + missing.length + ' tasks have no row); finish it with --resume first');
    const srcIds = sj.header.ids.slice();
    const keepAll = new Set(srcIds);
    list = all.filter((t) => keepAll.has(t.id));
    const timedOut = new Set(srcIds.filter((id) => sj.rows.get(id).status === 'timeout'));
    runList = list.filter((t) => timedOut.has(t.id));
    source = { file: rel(sabs), journal: sj, budgetMs: sj.header.budgetMs, workers: sj.header.workers ?? null, timedOut: runList.length };
    selection = { what: 'the ' + list.length + ' tasks of ' + rel(sabs) + '; the ' + runList.length + ' it left timed out run at the longer clock, the others carry their row from it', n: list.length, of, ran: runList.length, carried: list.length - runList.length, onlyTimedOutOf: rel(sabs) };
    selectionTag = 'timedout';
  }
  const ids = list.map((t) => t.id);
  const complete = ids.length === of && !cfg.ids && !cfg.limit;
  const evaluation = cfg.split === 'evaluation';

  log('ARC-AGI-1 ' + cfg.split + ', ' + selection.n + ' of ' + of + ' tasks' + (cfg.limit ? ' (' + selection.what + ')' : '') + (source ? ' (' + source.timedOut + ' timed out at ' + source.budgetMs + ' ms run again, the rest carried)' : '') + ', clock ' + cfg.budgets.join(' then ') + ' ms per task, ' + cfg.attempts + ' attempt' + (cfg.attempts > 1 ? 's' : '') + ', depth ' + DEPTH + ', ' + cfg.workers + ' workers. NO MODEL.');
  log('capability/grid-search.mjs over capability/grid-dsl.mjs (vocabulary unchanged on this board), answers run as grid.dsl cells and graded by grid.dsl.match cells.');

  // the points measured before: --base files, then the source journal of --only-timed-out-of
  const points = [];
  for (const f of cfg.base) {
    const b = basePoint(f, cfg, ids);
    points.push({ kind: 'base', rows: b.rows, meta: b.meta, source: b.source, verdict: b.verdict });
  }
  if (source) {
    const rows = ids.map((id) => source.journal.rows.get(id));
    points.push({ kind: 'journal', rows, meta: { budgetMs: source.budgetMs, attempts: cfg.attempts, workers: source.workers, wallSeconds: wallOfJournal(rows, source.journal.sessions) }, source: { journal: source.file, at: new Date(Math.max(...rows.map((r) => r.endedAt))).toISOString(), command: source.journal.header.command || null } });
  }
  if (cfg.out === 'attempts') {
    const b = points[0];
    if (b.meta.budgetMs !== cfg.budgets[0]) throw new Error('bench/grid-curve.mjs: --out attempts pairs with a one attempt run at the same clock; ' + b.source.file + ' ran at ' + b.meta.budgetMs + ' ms');
    if (b.meta.attempts !== 1) throw new Error('bench/grid-curve.mjs: --out attempts pairs with a ONE attempt run; ' + b.source.file + ' took ' + b.meta.attempts);
  }

  // the price, before anything runs: each clock from the point before it (the last measured one for all)
  const prior = points.length ? points[points.length - 1] : null;
  const prices = [];
  if (prior) {
    for (const budgetMs of cfg.budgets) {
      const p = priceOf(prior.rows.filter((r) => runList.some((t) => t.id === r.id)), { budgetMs, prevBudgetMs: prior.meta.budgetMs, attempts: cfg.attempts, workers: cfg.workers });
      prices.push({ budgetMs, from: prior.source.file || prior.source.journal, ...p });
      log(p.line + ' (priced from ' + (prior.source.file || prior.source.journal) + ')');
    }
  } else log('PRICE: no point before this one to price from (no --base); ' + runList.length + ' tasks at up to ' + cfg.budgets.join(' then ') + ' ms each over ' + cfg.workers + ' workers is at most ' + r2(runList.length * cfg.budgets.reduce((s, b) => s + b, 0) / 1000 / cfg.workers / 60) + ' minutes');
  if (cfg.priceOnly) { log('--price-only: nothing run, no verdict written'); return { priced: prices }; }

  // run each clock through its journal
  const idsSha = sha(runList.map((t) => t.id).join(','));
  const runs = [];
  for (let bi = 0; bi < cfg.budgets.length; bi++) {
    const budgetMs = cfg.budgets[bi];
    const jfile = cfg.journal ? path.resolve(ROOT, cfg.journal) : path.join(vdir, journalName(cfg, budgetMs, selectionTag));
    const header = { split: cfg.split, budgetMs, attempts: cfg.attempts, maxDepth: DEPTH, workers: cfg.workers, idsSha, ids: runList.map((t) => t.id), onlyTimedOutOf: source ? source.file : null, selection: selection.what, createdAt: new Date().toISOString(), command: ('node bench/grid-curve.mjs ' + argv.join(' ')).trim(), node: process.version, memory: { heapMb: cfg.heapMb, admitMb: cfg.admitMb, preemptMb: cfg.preemptMb, rampMs: rampFor(budgetMs, cfg.rampMs), respawnHeapMb: cfg.respawnHeapMb } };
    const j = openJournal(jfile, header, { resume: cfg.resume, log });
    const todo = runList.filter((t) => !j.rows.has(t.id));
    log('journal ' + rel(jfile) + ': ' + j.rows.size + ' of ' + runList.length + ' tasks already there, ' + todo.length + ' to run');
    let session = null;
    if (todo.length) {
      const before = points.length ? points[points.length - 1] : null;
      // the price again when it differs from the one printed first: part of the journal is done, or the point before is the one just run
      if (before && (j.rows.size || bi > 0)) log(priceOf(before.rows.filter((r) => todo.some((t) => t.id === r.id)), { budgetMs, prevBudgetMs: before.meta.budgetMs, attempts: cfg.attempts, workers: cfg.workers }).line + (j.rows.size ? ' (what is left of the journal)' : ' (priced again from the ' + before.meta.budgetMs + ' ms point just run)'));
      const n = (j.sessions.length ? Math.max(...j.sessions.map((s) => s.n)) : 0) + 1;
      appendFileSync(jfile, JSON.stringify({ type: 'session', n, startedAt: Date.now(), workers: cfg.workers, command: header.command }) + '\n');
      session = await runPoint(todo, budgetMs, cfg, jfile, n, log);
      log(budgetMs + ' ms: ran ' + session.ran + ' tasks in ' + session.wallSeconds + ' s this session, peak rss ' + session.peakRssMb + ' MB, preempted ' + session.preempted + ' (' + session.preemptedSeconds + ' task seconds run again), admission waits ' + session.admissionWaitSeconds + ' lane seconds, workers replaced for heap ' + session.respawned);
      appendFileSync(jfile, JSON.stringify({ type: 'sessionEnd', n, endedAt: Date.now(), ...session }) + '\n');
    }
    const back = readJournal(jfile);
    const ranRows = runList.map((t) => back.rows.get(t.id));
    if (ranRows.some((r) => !r)) throw new Error('bench/grid-curve.mjs: journal ' + rel(jfile) + ' is missing rows after the run');
    const byId = new Map(ranRows.map((r) => [r.id, r]));
    const rows = ids.map((id) => byId.get(id) || { ...source.journal.rows.get(id), carried: true });
    const wallSeconds = wallOfJournal(ranRows, back.sessions);
    const at = new Date(Math.max(...ranRows.map((r) => r.endedAt))).toISOString();
    const ends = back.ends || [];
    const memory = { peakRssMb: ends.length ? Math.max(...ends.map((e) => e.peakRssMb || 0)) : null, preempted: ends.reduce((a, e) => a + (e.preempted || 0), 0), preemptedSeconds: r2(ends.reduce((a, e) => a + (e.preemptedSeconds || 0), 0)), admissionWaitSeconds: r2(ends.reduce((a, e) => a + (e.admissionWaitSeconds || 0), 0)), sessionsEnded: ends.length, sessions: back.sessions.length, maxHeapMbAfterTask: Math.max(0, ...ranRows.map((r) => r.heapMb || 0)), outOfMemory: ranRows.filter((r) => /OUT_OF_MEMORY/i.test(r.error || '')).map((r) => r.id) };
    if (!cfg.quiet) log(budgetMs + ' ms journal: peak rss ' + memory.peakRssMb + ' MB over ' + memory.sessionsEnded + ' of ' + memory.sessions + ' sessions ended, preempted ' + memory.preempted + ', largest heap after a task ' + memory.maxHeapMbAfterTask + ' MB, workers out of memory ' + memory.outOfMemory.length);
    const pt = { kind: 'run', rows, meta: { budgetMs, attempts: cfg.attempts, workers: cfg.workers, wallSeconds }, source: { journal: rel(jfile), at, command: header.command, sessions: back.sessions.length }, memory, ran: runList.length, carried: ids.length - runList.length };
    points.push(pt);
    runs.push(pt);
  }

  // the points, paired by id with the one before each
  const dirty = new Set();
  let split, overlap = null;
  const devList = loadSplit('training');
  if (evaluation) {
    overlap = overlapOf(list, devList);
    for (const d of overlap.duplicates) dirty.add(d.id);
    split = splitFor({ arcSplit: 'evaluation', developmentIds: devList.map((t) => t.id), heldOutIds: ids, duplicates: overlap.duplicates, pairsCompared: overlap.pairsCompared });
  } else split = splitFor({ arcSplit: 'training', developmentIds: devList.map((t) => t.id) });
  const reason = typeof split.contaminated === 'string' ? split.contaminated : null;
  const out = points.map((p, i) => {
    const pt = pointOf(p.rows, p.meta);
    const cleanRows = p.rows.filter((r) => !dirty.has(r.id));
    const clean = evaluation ? { n: cleanRows.length, solved: cleanRows.filter((r) => r.solved === true).length, pct: cleanRows.length ? r2((100 * cleanRows.filter((r) => r.solved === true).length) / cleanRows.length) : null } : null;
    const pair = i ? pairById(p.rows, points[i - 1].rows) : null;
    return { ...pt, clean, gainedIds: pair ? pair.gained : null, lostIds: pair ? pair.lost : null, pairedWith: i ? (points[i - 1].meta.budgetMs + ' ms, ' + points[i - 1].meta.attempts + ' attempt' + (points[i - 1].meta.attempts > 1 ? 's' : '')) : null, source: p.source, ...(p.kind === 'run' ? { ran: p.ran, carried: p.carried, memory: p.memory } : {}) };
  });
  for (const p of out) log('POINT ' + p.budgetMs + ' ms, ' + p.attempts + ' attempt' + (p.attempts > 1 ? 's' : '') + ': solved ' + p.solved + ' of ' + p.of + ' = ' + p.pct + ' percent' + (p.clean ? ' (clean ' + p.clean.solved + ' of ' + p.clean.n + ')' : '') + ', timed out ' + p.timedOut + ', found but wrong ' + p.foundButWrong + ', exhausted ' + p.exhausted + ', errors ' + p.errors + ', mean ms ' + p.meanMs + ', wall s ' + p.wallSeconds + (p.gainedIds ? '; against ' + p.pairedWith + ': gained ' + p.gainedIds.length + ', lost ' + p.lostIds.length + (p.lostIds.length ? ' (' + p.lostIds.join(', ') + ')' : '') : '') + ' [' + (p.source.file || p.source.journal) + ', ' + p.source.at + ']');
  const marginal = [];
  for (let i = 1; i < out.length; i++) if (out[i].attempts === out[i - 1].attempts && out[i].budgetMs > out[i - 1].budgetMs) marginal.push(marginalOf(out[i - 1], out[i], { gained: out[i].gainedIds, lost: out[i].lostIds }));
  for (const m of marginal) log('MARGINAL ' + m.fromMs + ' to ' + m.toMs + ' ms (' + m.tenfolds + ' tenfolds), ' + m.attempts + ' attempts: gained ' + m.gained + ', lost ' + m.lost + ', net ' + m.net + ', solved per 10x clock ' + m.solvedPerTenfold);

  const bar = evaluation ? frontierBar(publishedArc()) : null;
  const ice = publishedArc().find((r) => /icecuber/i.test(r.system)) || null;
  const last = out[out.length - 1];
  const vocabulary = runs.flatMap((p) => p.rows).find((r) => r.vocabulary)?.vocabulary ?? null;
  const common = { node: process.version, split, ...(reason ? { contaminated: true } : {}), arcSplit: cfg.split, heldOut: evaluation, selection, maxDepth: DEPTH, vocabulary, heldFixed: 'the depth (' + DEPTH + ') and the vocabulary (' + vocabulary + ' words and learners, capability/grid-dsl.mjs unchanged) are held fixed on this board; only the clock and the attempts move', model: null, attemptsAllowedByArc: 2, secondAttemptRule: ORDER_RULE, price: prices.map((p) => p.line), memoryRule: { heapMb: cfg.heapMb, admitMb: cfg.admitMb, preemptMb: cfg.preemptMb, rampMs: cfg.rampMs, respawnHeapMb: cfg.respawnHeapMb, maxPreempts: MAX_PREEMPTS, what: 'a lane starts a task only under admitMb of process memory and rampMs (at most a twentieth of the clock) after the last start (or when nothing runs); over preemptMb the task started last is stopped and run again from its start later (at most maxPreempts times); a preempted run writes no row, so every row is one whole run at the whole clock; each worker has a heapMb old generation limit' } };
  const command = ('node bench/grid-curve.mjs ' + argv.join(' ')).trim();
  mkdirSync(vdir, { recursive: true });

  if (cfg.out === 'attempts') return writeAttempts({ cfg, vdir, command, common, out, points, runs, complete, evaluation, bar, ice, reason, log });

  // THE CURVE
  const notTheBarBecause = [];
  if (!complete) notTheBarBecause.push('a --limit or --ids run grades part of the split');
  if (!evaluation) notTheBarBecause.push('the training split is in sample (the vocabulary was written against it): the CONTROL of the curve, not the bar');
  if (evaluation && !bar) notTheBarBecause.push('no frontier row in bench/verdicts/public-arc.json to hold it to');
  const isTheBar = notTheBarBecause.length === 0;
  const barMet = isTheBar && !!bar && last.pct >= bar.score && (!last.clean || (last.clean.pct !== null && last.clean.pct >= bar.score));
  const name = complete ? 'grid-curve' : 'grid-curve-partial';
  const fileRel = rel(path.join(vdir, name + '.json'));
  let control = null;
  if (isTheBar) {
    const cf = path.join(vdir, 'grid-curve-partial.json');
    if (existsSync(cf)) {
      const c = JSON.parse(readFileSync(cf, 'utf8'));
      if (c.arcSplit === 'training') control = { file: rel(cf), at: c.at, command: c.command, what: 'the same bench on the TRAINING split (in sample: the vocabulary was written against it), ' + (c.selection ? c.selection.what : ''), points: (c.points || []).map((p) => ({ budgetMs: p.budgetMs, attempts: p.attempts, solved: p.solved, of: p.of, pct: p.pct, timedOut: p.timedOut, foundButWrong: p.foundButWrong, gained: p.gainedIds ? p.gainedIds.length : null, lost: p.lostIds ? p.lostIds.length : null })), marginal: c.marginal || [] };
    }
    if (control) log('CONTROL ' + control.file + ' (training, in sample, ' + control.at + '): ' + control.points.map((p) => p.budgetMs + ' ms ' + p.attempts + 'a ' + p.solved + ' of ' + p.of + (p.gained !== null ? ' (+' + p.gained + ' -' + p.lost + ')' : '')).join(', '));
    else log('CONTROL: no training control file (grid-curve-partial.json of the training split) on disk yet');
  }
  // the next point, run on the tasks this curve's last full run left timed out (only after a run over every task)
  const lastRun = runs.length ? runs[runs.length - 1] : null;
  const nextCommand = evaluation && complete && !source && lastRun && last.budgetMs < 300000
    ? 'node tools/budget.mjs --ram-mb 6000 --disk-mb 300 --dir bench/verdicts -- node bench/grid-curve.mjs --split evaluation --budget-ms ' + (last.budgetMs * 10) + ' --attempts ' + cfg.attempts + ' --workers ' + cfg.workers + ' --resume' + (cfg.base.length ? ' --base ' + cfg.base.join(',') : '') + ' --only-timed-out-of ' + lastRun.source.journal
    : null;
  const tail = last;
  const statement = 'On the ARC-AGI-1 ' + cfg.split + ' split (' + selection.n + ' of ' + of + ' tasks' + (cfg.limit ? ', ' + selection.what : '') + ') the grid program search, no model, depth ' + DEPTH + ' and the same ' + vocabulary + ' word vocabulary throughout, solved: '
    + out.map((p) => p.solved + ' of ' + p.of + ' (' + p.pct + ' percent) at ' + p.budgetMs + ' ms with ' + p.attempts + ' attempt' + (p.attempts > 1 ? 's' : '')).join(', then ') + '. '
    + 'At the longest clock ' + tail.timedOut + ' tasks still ran out of clock, ' + tail.foundButWrong + ' found programs that fit every train pair and missed a test output, ' + tail.exhausted + ' exhausted the vocabulary. '
    + out.slice(1).map((p) => 'Paired by task id with ' + p.pairedWith + ', the ' + p.budgetMs + ' ms point with ' + p.attempts + ' attempts gained ' + p.gainedIds.length + ' and lost ' + p.lostIds.length).join('; ') + (out.length > 1 ? '. ' : '')
    + (marginal.length ? 'The clock bought ' + marginal.map((m) => m.solvedPerTenfold + ' solved tasks per tenfold of clock from ' + m.fromMs + ' to ' + m.toMs + ' ms').join(' and ') + '. ' : '')
    + (evaluation ? (reason ? 'Contaminated, decided from data: ' + reason + '; on the ' + tail.clean.n + ' clean tasks the longest clock solved ' + tail.clean.solved + ' (' + tail.clean.pct + ' percent). ' : 'Not contaminated, decided from data. ') : 'This is the TRAINING split, in sample (the vocabulary was written against it), run as the control of the evaluation curve. ')
    + (ice && evaluation ? 'The published no-model row is ' + ice.system + ' at ' + ice.score + ' percent. ' : '')
    + (control ? 'The control, the same clocks on a fixed seed draw of the training split, printed ' + control.points.map((p) => p.solved + ' of ' + p.of + ' at ' + p.budgetMs + ' ms with ' + p.attempts + ' attempt' + (p.attempts > 1 ? 's' : '')).join(', ') + '. ' : '')
    + (isTheBar ? 'The bar is ' + bar.system + ' at ' + bar.score + ' percent (copied from bench/verdicts/public-arc.json), and it is ' + (barMet ? 'MET' : 'NOT MET') + '.' : 'This file is not the bar: ' + notTheBarBecause.join('; ') + '.')
    + ' Latencies were measured on a machine shared with other builders.';
  const verdict = {
    at: new Date().toISOString(), command, file: fileRel, isTheBar, barMet,
    bar: bar ? { ...bar, copiedFrom: 'bench/verdicts/public-arc.json', rule: 'the best frontier row held to one answer (bench/ladder.mjs frontierRowOf); met when the longest clock\'s solved percent reaches its score on every scored task and on the clean ones' } : null,
    notTheBarBecause, ...common,
    points: out, marginal, control,
    nextCommand, nextCommandNote: nextCommand ? 'the next point is the orchestrator\'s: it runs only the tasks the ' + last.budgetMs + ' ms point left timed out, carries the rest, and writes this file again with every point' : null,
    published: ice ? [{ ...ice, copiedFrom: 'bench/verdicts/public-arc.json' }] : [],
    journals: runs.map((p) => ({ file: p.source.journal, budgetMs: p.meta.budgetMs, rows: p.ran, sessions: p.source.sessions })),
    statement,
    rows: ids.map((id) => ({ id, byPoint: out.map((p, k) => { const r = points[k].rows.find((x) => x.id === id); return { budgetMs: p.budgetMs, attempts: p.attempts, status: r.status, solved: r.solved === true, wallMs: r.wallMs, ...(r.carried ? { carried: true } : {}) }; }), lastAnswers: compactRow(points[points.length - 1].rows.find((x) => x.id === id)).attempts })),
  };
  writeFileSync(path.join(vdir, name + '.json'), JSON.stringify(verdict, null, 1) + '\n');
  log('isTheBar ' + isTheBar + (isTheBar ? '' : ' (' + notTheBarBecause.join('; ') + ')') + ', barMet ' + barMet + (bar && isTheBar ? ' (' + last.pct + (barMet ? ' >= ' : ' < ') + bar.score + ')' : ''));
  if (nextCommand) log('next: ' + nextCommand);
  log('wrote ' + fileRel);
  return verdict;
}

function writeAttempts({ cfg, vdir, command, common, out, points, runs, complete, evaluation, bar, ice, reason, log }) {
  const base = points[0], run = points[points.length - 1], bp = out[0], rp = out[out.length - 1];
  const conv = convertedFoundButWrong(run.rows, base.rows);
  const lost = rp.lostIds;
  let control = null;
  if (cfg.control) {
    const c = basePoint(cfg.control, { split: cfg.split }, run.rows.map((r) => r.id));
    if (c.verdict.controlArm !== true) throw new Error('bench/grid-curve.mjs: --control ' + cfg.control + ' is not a control arm (no controlArm true)');
    if (c.meta.budgetMs !== cfg.budgets[0]) throw new Error('bench/grid-curve.mjs: --control ' + cfg.control + ' ran at ' + c.meta.budgetMs + ' ms');
    const p = pairById(run.rows, c.rows);
    control = { file: c.source.file, at: c.source.at, command: c.source.command, arm: 'the search without the fallback phase (--fixed-vocab), one attempt', solved: c.rows.filter((r) => r.solved === true).length, thisRun: rp.solved, gained: p.gained, lost: p.lost };
  }
  const notTheBarBecause = ['the 3000 ms point of the clock curve: the bar file is bench/verdicts/grid-curve.json, which copies this point with its stamp'];
  if (!complete) notTheBarBecause.push('a --limit or --ids run grades part of the split');
  const name = complete && evaluation ? 'grid-attempts' : 'grid-attempts-partial';
  const fileRel = rel(path.join(vdir, name + '.json'));
  log('SECOND ATTEMPT: solved ' + rp.solved + ' of ' + rp.of + ' = ' + rp.pct + ' percent with 2 attempts at ' + rp.budgetMs + ' ms (' + rp.solvedAtFirstFound + ' by the program found first, ' + rp.rescuedBySecond + ' only by the second, ' + rp.secondFound + ' tasks had a second answer)');
  log('against ' + base.source.file + ' (1 attempt, ' + bp.solved + ' solved): gained ' + rp.gainedIds.length + ', lost ' + lost.length + (lost.length ? ' (' + lost.join(', ') + ')' : '') + '; found but wrong there turned right ' + conv.converted + ' of ' + conv.of + (conv.ids.length ? ' (' + conv.ids.join(', ') + ')' : ''));
  if (control) log('control ' + control.file + ': this run ' + control.thisRun + ', control ' + control.solved + ', gained ' + control.gained.length + ', lost ' + control.lost.length);
  const statement = 'On the ARC-AGI-1 ' + cfg.split + ' split (' + rp.of + ' tasks) the grid program search, no model, at the same ' + rp.budgetMs + ' ms clock, depth ' + DEPTH + ' and vocabulary as the one attempt run, answered with TWO attempts (ARC\'s own rule) and solved ' + rp.solved + ' (' + rp.pct + ' percent), against ' + bp.solved + ' (' + bp.pct + ' percent) with one attempt in ' + base.source.file + ' (' + base.source.at + ', ' + (base.meta.workers ?? '?') + ' workers; this run ' + cfg.workers + ' workers). '
    + 'Paired by task id it gained ' + rp.gainedIds.length + ' and lost ' + lost.length + '. Of the ' + conv.of + ' tasks where the one attempt run found a program that fit every train pair and missed the test, the second attempt turned ' + conv.converted + ' right. '
    + rp.secondFound + ' tasks had a second, different answer; ' + rp.timedOut + ' ran out of clock with no answer, ' + rp.foundButWrong + ' answered wrong with every attempt, ' + rp.exhausted + ' exhausted the vocabulary. '
    + (control ? 'Against the control ' + control.file + ' (the search without the fallback phase, ' + control.solved + ' solved) it gained ' + control.gained.length + ' and lost ' + control.lost.length + '. ' : '')
    + (evaluation ? (reason ? 'Contaminated, decided from data: ' + reason + '; on the ' + rp.clean.n + ' clean tasks it solved ' + rp.clean.solved + ' (' + rp.clean.pct + ' percent). ' : 'Not contaminated, decided from data. ') : '')
    + 'Not the bar file: ' + notTheBarBecause.join('; ') + '. Latencies were measured on a machine shared with other builders.';
  const runRows = run.rows;
  const verdict = {
    at: new Date().toISOString(), command, file: fileRel, isTheBar: false, barMet: false,
    bar: bar ? { ...bar, copiedFrom: 'bench/verdicts/public-arc.json' } : null, notTheBarBecause, ...common,
    attempts: cfg.attempts, budgetMs: rp.budgetMs, workers: cfg.workers,
    solved: rp.solved, of: rp.of, pct: rp.pct, clean: rp.clean,
    timedOut: rp.timedOut, foundButWrong: rp.foundButWrong, exhausted: rp.exhausted, errors: rp.errors, killedAtHardDeadline: rp.killed,
    solvedAtFirstFound: rp.solvedAtFirstFound, secondFound: rp.secondFound, rescuedBySecond: rp.rescuedBySecond,
    meanMs: rp.meanMs, wallSeconds: rp.wallSeconds, memory: runs[0].memory,
    base: { file: base.source.file, at: base.source.at, command: base.source.command, attemptsPerTask: base.meta.attempts, workers: base.meta.workers, solved: bp.solved, timedOut: bp.timedOut, foundButWrong: bp.foundButWrong, exhausted: bp.exhausted },
    convertedFoundButWrong: conv,
    lost, lostCount: lost.length,
    paired: { against: base.source.file, at: base.source.at, gained: rp.gainedIds, lost },
    control, attemptsPerTask: cfg.attempts,
    journal: runs[0].source.journal,
    published: ice ? [{ ...ice, copiedFrom: 'bench/verdicts/public-arc.json' }] : [],
    statement,
    rows: runRows.map(compactRow),
  };
  writeFileSync(path.join(vdir, name + '.json'), JSON.stringify(verdict, null, 1) + '\n');
  log('wrote ' + fileRel + ' (isTheBar false: the bar file is bench/verdicts/grid-curve.json)');
  return verdict;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let cfg;
  try { cfg = parseCurveArgs(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exit(2); }
  runCurve(cfg).catch((e) => { console.error(e && e.stack || e); process.exitCode = 1; });
}
