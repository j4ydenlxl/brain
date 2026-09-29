#!/usr/bin/env node
// self/loop.mjs: ONE TICK OF THE ORGANISM FILLING ITS OWN GAPS. Author: board 35 builder (item self-loop).
//
// His words: "Its gotta work without me... EVERY GAP should be able to be filled by itself". Before this file the
// pieces ran apart: self/queries.mjs generated questions (bench/self-queries.mjs), self/mistakes.mjs ledgered every
// graded-wrong row and re-asked it (bench/mistakes.mjs --reask), self/gaps.mjs turned a missed bar into a gap row with
// a trial (state/self/gaps.jsonl), and self/autopilot.mjs picked candidates. One tick, in order:
//   1. QUERIES   bench/self-queries.mjs run() at a fresh seed (default: the day number since 2026-01-01, so every
//                morning asks new questions), --n 2000, model off, the generator's self test and every control
//                first; the misses go to state/self/loop/<date>-misses.jsonl (group rows, then wrong rows), never
//                to bench/verdicts. The self-queries held-out seeds (34, 35) are refused: this loop feeds learning.
//   2. LEDGER    the mistake ledger (self/mistakes.mjs buildLedger over the five sources) re-asked, model off, in
//                self/mistakes.mjs's own worker (reaskAll, a 2000 ms wall per row); then, when self/learn.mjs
//                exists, learn({ root, dry, limit }) and the ledger re-asked again in a FRESH worker (a new module
//                graph, so what learn() wrote is read), so the record shows learned before and after. Absent, a
//                skip line is printed and after is before (nothing ran between them).
//   3. DIFF      against the previous record (the newest state/self/loop/<date>.json dated before this tick), per
//                miss group (a group is a template id, as bench/self-queries.mjs groupMisses groups them):
//                closed  open before, DRAWN now and no row missed now (answered right now)
//                opened  missed now, not open before
//                stayed  open before and missed now
//                undrawn open before and not drawn at this seed (neither closed nor stayed; counted apart)
//   4. GAPS      every group open now becomes one gap row (kind 'self-query group', subsystem 'act', measured wrong
//                plus refused with each apart, bar 0 and 0, trial = FORMS 'self-query-group' of self/gaps.mjs with
//                '--seed S --group G' appended, so trialOf() resolves it and the trial asks exactly the rows this
//                tick asked of that group). They are written into state/self/gaps.jsonl beside a FRESH rebuild of
//                the rest of the ledger (self/gaps.mjs buildLedger of this tree), so a loop write never makes stale
//                verdict lines look fresh. The record state/self/loop/<date>.json holds every count.
//   5. LINE      ONE line: LOOP <date>: asked N answered N correct N wrong N refused N; groups open N closed N
//                opened N; ledger learned before N after N; gaps written N
//                followed on the same line by "  PROBLEMS: ..." and exit 1 when wrong is not 0, the counts do not
//                partition (asked = correct + wrong + refused, answered = correct + wrong), a socket was counted, a
//                self-queries control failed or the second opinion disagreed; the record and gap rows are still written.
// Dry mode computes all of it and writes nothing (no record, no misses file, no ledger line; learn() runs dry).
// WHO RUNS IT: the 05:00 BrainAutopilot task runs a soak (tools/schedule-autopilot.mjs tickArgv: self-code --auto
// --soak 90), and the soak runs this tick once a day before it reads the gap ledger (self/autopilot.mjs loopTickPlan
// and runLoopTick), so every open group of the morning is a row of the queue the soak works on.
//
// MODEL OFF, COUNTED WHERE THE PRELOAD RUNS: the CLI re-executes itself once under a preload (GUARD_SOURCE, a data: URL
// passed to --import) that refuses and counts every net.Socket connect and fetch in the main thread and in every worker
// started from a FILE that inherits the process's execArgv (the --import rides on it; no Worker in this tree passes its
// own execArgv), measured at depth one and two (the re-ask worker of self/mistakes.mjs is one); a worker's attempt reaches the main
// thread's count over a BroadcastChannel and is also written synchronously to stderr as a line starting "LOOP SOCKET
// REFUSED", so a caller can count it without trusting this file. NOT COVERED (NOT_COVERED, in the record as
// sockets.notCovered): an eval:true worker (a Worker built from a source string) at any depth starts WITHOUT the preload
// under this file-main shape (measured by board 36, test/self-loop.test.mjs and bench/self-loop.mjs grade it), so the
// program and test workers act/run.mjs starts (near lines 155 and 386), nested inside the re-ask worker through
// self/mistakes.mjs runTests on a humaneval row, can connect uncounted (a skeptic measured one print ECONNREFUSED
// 127.0.0.1:9 with the count unchanged, as docs/boards/board-36.js item pins (P4) records); and every child process the
// tick spawns (the generator's self test).
//
//   node self/loop.mjs [--dry] [--n 2000] [--seed <s>] [--json]
//     [--date YYYY-MM-DD] [--state-dir DIR] [--gaps-root DIR] [--plant-closed <group>]
//     [--learn on|dry|off] [--learn-limit N] [--no-reask] [--no-selftest]
//   --date        the tick's day (default: today, local time); the default seed is its day number
//   --state-dir   where records and misses files live (default state/self/loop); the bar uses a scratch copy
//   --gaps-root   the root whose state/self/gaps.jsonl receives the gap rows (default this tree)
//   --plant-closed G   a control: group G, open in the previous record, is treated as answered now; the diff must
//                 then print closed 1 for G (refused when G was not open in the previous record); needs --dry, and
//                 without it the CLI prints the refusal and exits 2 (a planted closure in a real record is a lie)
//   --learn       on (default), dry (learn({dry:true}); --dry implies it) or off (skipped with a line)
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, renameSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
const SELF_FILE = fileURLToPath(import.meta.url);

export const LOOP_REL = 'state/self/loop';
export const EPOCH = '2026-01-01';
export const DEFAULT_N = 2000;
export const GAP_KIND = 'self-query group';
export const GAP_SUBSYSTEM = 'act';
export const FORM_KEY = 'self-query-group';
export const GAP_ID_PREFIX = 'self-query-group:';
export const RECORD_KIND = 'self.loop';
export const LEARN_MODES = Object.freeze(['on', 'dry', 'off']);
/** The self-queries held-out seeds: 34 and 35 (bench/self-queries.mjs DEFAULT_SEEDS, now marked development by its split) and 40 and 41 (the first clean bar run, 2026-09-29, after seeds 36 to 39 were contaminated by board 35): the loop feeds learning, so it never asks them. */
export const REFUSED_SEEDS = Object.freeze([34, 35, 40, 41]);
/** The readers a group's fix would change, per kind (only the ones on disk are named in a gap row). */
export const KIND_FILES = Object.freeze({
  arithmetic: ['act/exact-read.mjs', 'act/solve.mjs', 'act/word.mjs'],
  sequence: ['act/exact-kinds.mjs'], units: ['act/exact-kinds.mjs'], calendar: ['act/exact-kinds.mjs'],
  counting: ['act/exact-kinds.mjs'], spelling: ['act/exact-kinds.mjs'], comparison: ['act/exact-kinds.mjs'],
  probability: ['act/exact-kinds.mjs'],
});
export const SOCKET_LINE = 'LOOP SOCKET REFUSED';
/** What the preload does not reach (record.sockets.notCovered): graded against the code by the test and the bench. */
export const NOT_COVERED = 'eval:true workers at any depth (the program and test workers act/run.mjs starts, nested inside the re-ask worker, start without the preload) and child processes (the generator self test)';
/** What an in-process tick with no preload (a test's) does not reach: its guard is the main thread's only. */
export const NOT_COVERED_IN_PROCESS = 'every worker thread (an in-process tick with no preload guards the main thread only) and child processes';
export const PLANT_NEEDS_DRY = '--plant-closed needs --dry: a planted closure written into a real record is a lie';
const DAY_MS = 86_400_000;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const RECORD_RE = /^(\d{4}-\d{2}-\d{2})\.json$/;

const rel = (root, abs) => path.relative(root, abs).split(path.sep).join('/');
const sha256 = (s) => createHash('sha256').update(s).digest('hex');
const byName = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const firstLine = (e) => String((e && e.message) || e).split('\n')[0].slice(0, 300);

// ---------------------------------------------------------------- the model-off guard (the main thread and file workers)
/** The preload: refuse and count every socket connect and fetch in the thread it runs in. */
export const GUARD_SOURCE = [
  "import net from 'node:net';",
  "import { writeSync } from 'node:fs';",
  "import { BroadcastChannel, isMainThread, threadId } from 'node:worker_threads';",
  "const g = globalThis.__BRAIN_LOOP_GUARD = { preload: true, main: 0, workers: 0, thread: threadId };",
  "const ch = new BroadcastChannel('brain-loop-sockets');",
  "if (isMainThread) { ch.onmessage = () => { g.workers++; }; }",
  "ch.unref();",
  "const hit = (what) => { if (isMainThread) g.main++; else { try { ch.postMessage({ hit: true }); } catch {} }",
  "  try { writeSync(2, '" + SOCKET_LINE + " ' + what + ' thread ' + threadId + '\\n'); } catch {} };",
  "net.Socket.prototype.connect = function refusedByLoop() { hit('net.Socket.connect'); throw new Error('self/loop.mjs runs model off: a socket was refused'); };",
  "if (typeof globalThis.fetch === 'function') globalThis.fetch = async () => { hit('fetch'); throw new Error('self/loop.mjs runs model off: a fetch was refused'); };",
].join('\n');
export const GUARD_URL = 'data:text/javascript,' + encodeURIComponent(GUARD_SOURCE);

/** A main-thread guard for an in-process tick with no preload (a test's): the same refusal, this thread only. */
function mainGuard() {
  const pre = globalThis.__BRAIN_LOOP_GUARD;
  if (pre && pre.preload) return { how: 'preload in the main thread and every file worker of this process that inherits its execArgv (not eval:true workers, not child processes)', notCovered: NOT_COVERED, read: () => ({ main: pre.main, workers: pre.workers }), remove: () => {} };
  const g = { main: 0 };
  let net = null, connect = null, fetch0 = null;
  return {
    how: 'main thread only (no preload: the re-ask worker is not covered)', notCovered: NOT_COVERED_IN_PROCESS,
    async install() {
      net = (await import('node:net')).default;
      connect = net.Socket.prototype.connect;
      net.Socket.prototype.connect = function refusedByLoop() { g.main++; throw new Error('self/loop.mjs runs model off: a socket was refused'); };
      if (typeof globalThis.fetch === 'function') { fetch0 = globalThis.fetch; globalThis.fetch = async () => { g.main++; throw new Error('self/loop.mjs runs model off: a fetch was refused'); }; }
    },
    read: () => ({ main: g.main, workers: null }),
    remove() { if (net && connect) net.Socket.prototype.connect = connect; if (fetch0) globalThis.fetch = fetch0; },
  };
}

// ---------------------------------------------------------------- dates and seeds
const pad = (x) => String(x).padStart(2, '0');
/** Today as YYYY-MM-DD in local time (the 05:00 tick is local). */
export function todayOf(d = new Date()) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
/** The day number of a YYYY-MM-DD date since 2026-01-01 (that day is 0). Throws on a malformed or earlier date. */
export function seedOfDay(date) {
  const m = DATE_RE.exec(String(date));
  if (!m) throw new Error('a date is YYYY-MM-DD, not ' + date);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = Date.UTC(y, mo - 1, d);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) throw new Error('no such day: ' + date);
  const e = DATE_RE.exec(EPOCH);
  const days = (t - Date.UTC(Number(e[1]), Number(e[2]) - 1, Number(e[3]))) / DAY_MS;
  if (!Number.isInteger(days) || days < 0) throw new Error(date + ' is before ' + EPOCH);
  return days;
}

// ---------------------------------------------------------------- args
export function parseArgs(argv) {
  const a = { dry: false, n: DEFAULT_N, seed: null, json: false, date: null, stateDir: null, gapsRoot: null, plantClosed: null, learn: null, learnLimit: null, reask: true, selfTest: true };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const val = () => { const v = argv[++i]; if (v === undefined) throw new Error(k + ' needs a value'); return v; };
    if (k === '--dry') a.dry = true;
    else if (k === '--n') a.n = Number(val());
    else if (k === '--seed') a.seed = Number(val());
    else if (k === '--json') a.json = true;
    else if (k === '--date') a.date = val();
    else if (k === '--state-dir') a.stateDir = val();
    else if (k === '--gaps-root') a.gapsRoot = val();
    else if (k === '--plant-closed') a.plantClosed = val();
    else if (k === '--learn') a.learn = val();
    else if (k === '--learn-limit') a.learnLimit = Number(val());
    else if (k === '--no-reask') a.reask = false;
    else if (k === '--no-selftest') a.selfTest = false;
    else throw new Error('unknown flag ' + k);
  }
  if (!Number.isInteger(a.n) || a.n < 1) throw new Error('--n must be a positive integer');
  if (a.seed !== null && (!Number.isInteger(a.seed) || a.seed < 0 || a.seed > 0xFFFFFFFF)) throw new Error('--seed must be an integer in [0, 2^32)');
  if (a.learn !== null && !LEARN_MODES.includes(a.learn)) throw new Error('--learn is one of ' + LEARN_MODES.join(', '));
  if (a.learnLimit !== null && !(Number.isInteger(a.learnLimit) && a.learnLimit > 0)) throw new Error('--learn-limit must be a positive integer');
  if (a.date !== null) seedOfDay(a.date);
  if (a.plantClosed !== null && !a.dry) throw new Error(PLANT_NEEDS_DRY);
  return a;
}

// ---------------------------------------------------------------- groups, misses files, the diff
/** From a self-queries verdict's byTemplate: the templates drawn (asked > 0) and the open groups (a miss), ranked. */
export function groupsOf(byTemplate) {
  const drawn = [], open = [];
  for (const [group, c] of Object.entries(byTemplate || {})) {
    if (!(c && c.asked > 0)) continue;
    drawn.push(group);
    const count = (c.wrong || 0) + (c.refused || 0);
    if (count > 0) open.push({ group, kind: c.kind, asked: c.asked, count, wrong: c.wrong || 0, refused: c.refused || 0 });
  }
  open.sort((a, b) => b.count - a.count || byName(a.group, b.group));
  return { drawn: drawn.sort(byName), open };
}

/** The misses file: one row per open group (ranked), then every wrong row. */
export function missesLines({ open, wrongRows = [], seed, n }) {
  const lines = open.map((g, i) => JSON.stringify({ group: g.group, rank: i + 1, kind: g.kind, count: g.count, wrong: g.wrong, refused: g.refused, asked: g.asked, seed, n }));
  for (const r of wrongRows) lines.push(JSON.stringify({ template: r.template, id: r.id, state: 'wrong', prompt: r.prompt, truth: r.truth, candidate: r.candidate, why: r.why, given: r.given, route: r.route }));
  return lines;
}

/** A misses file read back: the group rows (by group) and the wrong rows. */
export function readMisses(text) {
  const groups = new Map(), wrong = [];
  for (const l of String(text).split(/\r?\n/)) {
    if (!l.trim()) continue;
    const o = JSON.parse(l);
    if (typeof o.group === 'string') groups.set(o.group, o);
    else if (o.state === 'wrong') wrong.push(o);
  }
  return { groups, wrong };
}

/**
 * The diff of two ticks by group. prevOpen: the groups open in the previous record; curOpen: the groups open now;
 * drawn: every template asked now. closed = open before, drawn now, no miss now; opened = missed now, not open
 * before; stayed = open before and missed now; undrawn = open before and not asked now.
 */
export function diffGroups(prevOpen, curOpen, drawn) {
  const P = new Set(prevOpen), C = new Set(curOpen), D = new Set(drawn);
  const closed = [...P].filter((g) => D.has(g) && !C.has(g)).sort(byName);
  const opened = [...C].filter((g) => !P.has(g)).sort(byName);
  const stayed = [...C].filter((g) => P.has(g)).sort(byName);
  const undrawn = [...P].filter((g) => !D.has(g)).sort(byName);
  return { closed, opened, stayed, undrawn, counts: { closed: closed.length, opened: opened.length, stayed: stayed.length, undrawn: undrawn.length } };
}

/** Every record in a state dir, oldest first, by its date name. */
export function listRecords(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((n) => RECORD_RE.test(n)).sort(byName);
}
/** The newest record dated before `date`, read, or null. */
export function previousRecord(dir, date) {
  const names = listRecords(dir).filter((n) => n.slice(0, 10) < date);
  for (let i = names.length - 1; i >= 0; i--) {
    try { const j = JSON.parse(readFileSync(path.join(dir, names[i]), 'utf8')); if (j && j.kind === RECORD_KIND) return { name: names[i], record: j }; } catch { /* an unreadable record is skipped, the next older one read */ }
  }
  return null;
}

// ---------------------------------------------------------------- gap rows
/** The trial of one group: FORMS 'self-query-group' with the tick's n, seed and the group, resolved by trialOf(). */
export async function trialOfGroup(group, { seed, n }) {
  const G = await import('./gaps.mjs');
  const form = G.FORMS[FORM_KEY];
  if (!form) throw new Error('self/gaps.mjs FORMS has no ' + FORM_KEY + ' entry');
  const argv = form.argv.slice();
  const at = argv.indexOf('--n');
  if (at >= 0) argv[at + 1] = String(n); else argv.push('--n', String(n));
  argv.push('--seed', String(seed), '--group', group);
  return G.trialOf(FORM_KEY, { ...form, argv });
}

/** One open group as a gap line of state/self/gaps.jsonl. */
export async function gapRowOf(g, { date, seed, n, recordRel, root = ROOT }) {
  const files = (KIND_FILES[g.kind] || []).filter((f) => existsSync(path.join(root, f)));
  return {
    id: GAP_ID_PREFIX + g.group, kind: GAP_KIND, subsystem: GAP_SUBSYSTEM,
    measured: g.count, bar: 0, unit: 'wrong plus refused rows of the group (' + g.asked + ' asked at seed ' + seed + ' of n ' + n + ')',
    distance: g.count, measuredWrong: g.wrong, measuredRefused: g.refused, barWrong: 0, barRefused: 0, asked: g.asked,
    verdictFile: recordRel, benchCommand: 'node self/loop.mjs', trial: await trialOfGroup(g.group, { seed, n }), files,
    since: date, better: 'lower', group: g.group, groupKind: g.kind, seed, n,
    why: 'self/loop.mjs ' + date + ': group ' + g.group + ' (' + g.kind + ') missed ' + g.count + ' of ' + g.asked + ' at seed ' + seed + ' (' + g.wrong + ' wrong, ' + g.refused + ' refused); a wrong exact answer is worse than a refusal',
  };
}

/** The ledger to write: the rest rebuilt fresh, every earlier loop line dropped, this tick's rows appended. */
export function mergeGapLines(fresh, rows) {
  const rest = (fresh || []).filter((l) => !(l && l.kind === GAP_KIND));
  return { lines: [...rest, ...rows], dropped: (fresh || []).length - rest.length };
}

// ---------------------------------------------------------------- the ledger re-ask
async function reaskPass() {
  const M = await import('./mistakes.mjs');
  const t0 = Date.now();
  const b = await M.buildLedger({ root: ROOT });
  const r = await M.reaskAll(b.rows, b.ctx, { wallMs: M.WALL_MS });
  const s = M.summarizeReask(r.rows);
  return { ledgerRows: b.rows.length, asked: s.rows, fixed: s.fixed, still: s.still, refused: s.refused, wrongNow: s.wrongNow, learned: s.learned, timedOut: s.timedOut, skippedArc: r.skipped.arc, workerStarts: r.workerStarts, wallMs: Date.now() - t0 };
}

/** What learn() returned, as counts: kept, tried and shapes when it names them (the item's contract), and the
 *  programs, patterns, mistakes, rows, before/after and sockets self/learn.mjs actually returns. */
export function learnSummary(r) {
  const cnt = (x) => (Array.isArray(x) ? x.length : x instanceof Map || x instanceof Set ? x.size : Number.isFinite(x) ? x : x && typeof x === 'object' ? Object.keys(x).length : null);
  if (!r || typeof r !== 'object') return { kept: null, tried: null, shapes: null };
  const pick = (o) => (o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).filter(([, v]) => Number.isFinite(v))) : null);
  return {
    kept: 'kept' in r ? cnt(r.kept) : Number.isFinite(r.programs) ? r.programs : null,
    tried: 'tried' in r ? cnt(r.tried) : r.tally && Number.isFinite(r.tally.judged) ? r.tally.judged : null,
    shapes: 'shapes' in r ? cnt(r.shapes) : r.byLesson ? Object.keys(r.byLesson).length : null,
    programs: Number.isFinite(r.programs) ? r.programs : null, patterns: Number.isFinite(r.patterns) ? r.patterns : null,
    rows: Number.isFinite(r.rows) ? r.rows : null, mistakes: Number.isFinite(r.mistakes) ? r.mistakes : null,
    before: pick(r.before), after: pick(r.after), outcomes: pick(r.outcomes), sockets: Number.isFinite(r.sockets) ? r.sockets : null,
    file: r.file ?? null,
  };
}

// ---------------------------------------------------------------- the tick
/**
 * One tick. opts: root, stateDir, gapsRoot, date, seed, n, dry, plantClosed, learn ('on'|'dry'|'off'), learnLimit,
 * reask, selfTest, log (a line printer), and two seams for a test: runQueries({seed, n, selfTest}) -> a self-queries
 * verdict (totals, byTemplate, wrongRows, sockets, controls, secondOpinion, selfTest), reaskFn() -> a pass summary.
 * @returns {Promise<object>} the record (written unless dry), with .line and .exitCode
 */
export async function tick(opts = {}) {
  const root = opts.root ? path.resolve(opts.root) : ROOT;
  const stateDir = path.resolve(opts.stateDir || path.join(root, ...LOOP_REL.split('/')));
  const gapsRoot = path.resolve(opts.gapsRoot || root);
  const date = opts.date || todayOf();
  const seed = opts.seed ?? seedOfDay(date);
  const n = opts.n ?? DEFAULT_N;
  const dry = opts.dry === true;
  const learnMode = dry && opts.learn === 'on' ? 'dry' : opts.learn || (dry ? 'dry' : 'on'); // dry writes nothing, learn() included
  const log = typeof opts.log === 'function' ? opts.log : () => {};
  if (opts.plantClosed && !dry) throw new Error(PLANT_NEEDS_DRY);
  if (REFUSED_SEEDS.includes(seed)) throw new Error('seed ' + seed + ' is a self-queries held-out seed (' + REFUSED_SEEDS.join(', ') + '); the loop feeds learning, so it never asks one');
  const at = new Date().toISOString();
  const t0 = Date.now();
  const recordAbs = path.join(stateDir, date + '.json');
  const missesAbs = path.join(stateDir, date + '-misses.jsonl');
  const guard = mainGuard();
  if (guard.install) await guard.install();
  const record = {
    kind: RECORD_KIND, at, date, seed, n, dry, root: rel(process.cwd(), root) || '.', stateDir: rel(root, stateDir), gapsFile: rel(root, path.join(gapsRoot, 'state', 'self', 'gaps.jsonl')),
    command: 'node self/loop.mjs' + (opts.command ? ' ' + opts.command : ''), previous: null, previousSeed: null, previousAt: null,
  };
  try {
    // 1. the queries
    let v;
    if (typeof opts.runQueries === 'function') v = await opts.runQueries({ seed, n, selfTest: opts.selfTest !== false });
    else {
      const SQ = await import(pathToFileURL(path.join(ROOT, 'bench', 'self-queries.mjs')).href);
      v = await SQ.run({ n, seeds: [seed], write: false, selfTest: opts.selfTest !== false, log: () => {}, command: 'self/loop.mjs: bench/self-queries.mjs run({ n: ' + n + ', seeds: [' + seed + '], write: false })' });
    }
    const T = v.totals;
    const { drawn, open: open0 } = groupsOf(v.byTemplate);
    record.queries = {
      asked: T.asked, answered: T.answered, correct: T.correct, wrong: T.wrong, refused: T.refused,
      controls: v.controls ? { checks: v.controls.checks, failed: v.controls.failed } : null,
      secondOpinion: v.secondOpinion ? { agree: v.secondOpinion.agree, disagree: v.secondOpinion.disagree, none: v.secondOpinion.none } : null,
      selfTest: v.selfTest ? (v.selfTest.skipped ? 'skipped' : v.selfTest.tally + (v.selfTest.ok ? '' : ' (FAILED)')) : null,
      sockets: v.sockets ?? null, drawnTemplates: drawn.length,
    };
    // 2. the ledger, learn, the ledger again
    const reask = typeof opts.reaskFn === 'function' ? opts.reaskFn : reaskPass;
    const ledger = { before: null, learn: null, after: null };
    if (opts.reask === false) { ledger.before = { skipped: '--no-reask' }; ledger.after = { skipped: '--no-reask' }; ledger.learn = { ran: false, reason: '--no-reask' }; }
    else {
      try { ledger.before = await reask(); } catch (e) { ledger.before = { error: firstLine(e) }; }
      const learnFile = path.join(ROOT, 'self', 'learn.mjs');
      if (learnMode === 'off') { ledger.learn = { ran: false, reason: '--learn off' }; log('LOOP learn: off (--learn off); after is before'); }
      else if (!existsSync(learnFile)) { ledger.learn = { ran: false, reason: 'self/learn.mjs is absent' }; log('LOOP learn: self/learn.mjs is absent, skipped; the ledger was re-asked once, so after is before'); }
      else {
        const t1 = Date.now();
        try {
          const L = await import(pathToFileURL(learnFile).href);
          if (typeof L.learn !== 'function') { ledger.learn = { ran: false, reason: 'self/learn.mjs exports no learn()' }; log('LOOP learn: self/learn.mjs exports no learn(), skipped; after is before'); }
          else {
            const r = await L.learn({ root: ROOT, dry: learnMode !== 'on', limit: opts.learnLimit ?? undefined });
            ledger.learn = { ran: true, ...learnSummary(r), dry: learnMode !== 'on', ms: Date.now() - t1 };
          }
        } catch (e) { ledger.learn = { ran: false, reason: 'learn() threw: ' + firstLine(e), ms: Date.now() - t1 }; log('LOOP learn: learn() threw (' + firstLine(e) + '); after is before'); }
        if (ledger.learn.ran) { try { ledger.after = await reask(); } catch (e) { ledger.after = { error: firstLine(e) }; } }
      }
      if (!ledger.after) ledger.after = { ...ledger.before, sameAsBefore: true };
    }
    record.ledger = ledger;
    // 3. the diff
    const prev = previousRecord(stateDir, date);
    const prevOpen = prev ? (prev.record.groups && Array.isArray(prev.record.groups.open) ? prev.record.groups.open : []) : [];
    let open = open0;
    const drawnNow = drawn.slice();
    if (opts.plantClosed) {
      const G = opts.plantClosed;
      const was = prevOpen.find((g) => g.group === G);
      if (!prev) throw new Error('--plant-closed ' + G + ': there is no previous record in ' + rel(root, stateDir) + ' before ' + date);
      if (!was) throw new Error('--plant-closed ' + G + ': the group is not open in the previous record ' + prev.name);
      const now = open0.find((g) => g.group === G) || null;
      open = open0.filter((g) => g.group !== G);
      if (!drawnNow.includes(G)) drawnNow.push(G);
      record.plant = { group: G, previousCount: was.count, countNowBeforePlant: now ? now.count : 0, drawnNowBeforePlant: drawn.includes(G) };
    }
    const diff = prev ? diffGroups(prevOpen.map((g) => g.group), open.map((g) => g.group), drawnNow) : { closed: [], opened: open.map((g) => g.group).sort(byName), stayed: [], undrawn: [], counts: { closed: 0, opened: open.length, stayed: 0, undrawn: 0 } };
    if (prev) { record.previous = prev.name; record.previousSeed = prev.record.seed ?? null; record.previousAt = prev.record.at ?? null; }
    if (record.plant) {
      record.plant.closedForGroup = diff.closed.includes(record.plant.group) ? 1 : 0;
      log('LOOP plant: group ' + record.plant.group + ' open in ' + prev.name + ' (count ' + record.plant.previousCount + '), planted answered now: closed ' + record.plant.closedForGroup + ' for ' + record.plant.group);
    }
    record.groups = { drawn: drawnNow.length, open, closed: diff.closed, opened: diff.opened, stayed: diff.stayed, undrawn: diff.undrawn, counts: { open: open.length, ...diff.counts } };
    record.misses = { file: rel(root, missesAbs), groups: open.length, rows: open.reduce((s, g) => s + g.count, 0), wrongRows: (v.wrongRows || []).length };
    // 4. the gap rows
    const recordRel = rel(root, recordAbs);
    const rows = [];
    for (const g of open) rows.push(await gapRowOf(g, { date, seed, n, recordRel, root }));
    record.gaps = { rows: rows.length, written: 0, file: record.gapsFile, ids: rows.map((r) => r.id) };
    record.gapRows = rows;
    // sockets: this process's guard (the threads it reaches: guard.how, guard.notCovered) and the self-queries run's own count
    await new Promise((r) => setTimeout(r, 50)); // a worker's BroadcastChannel message is delivered before the count is read
    const s = guard.read();
    const learnSockets = ledger.learn && Number.isFinite(ledger.learn.sockets) ? ledger.learn.sockets : 0;
    record.sockets = { total: (s.main || 0) + (s.workers || 0) + (v.sockets || 0) + learnSockets, main: s.main, workers: s.workers, selfQueries: v.sockets ?? null, learn: ledger.learn && ledger.learn.ran ? learnSockets : null, guard: guard.how, notCovered: guard.notCovered };
    record.wallMs = Date.now() - t0;
    const lb = ledger.before && Number.isFinite(ledger.before.learned) ? ledger.before.learned : 'n/a';
    const la = ledger.after && Number.isFinite(ledger.after.learned) ? ledger.after.learned : 'n/a';
    record.line = 'LOOP ' + date + ': asked ' + T.asked + ' answered ' + T.answered + ' correct ' + T.correct + ' wrong ' + T.wrong + ' refused ' + T.refused
      + '; groups open ' + open.length + ' closed ' + diff.counts.closed + ' opened ' + diff.counts.opened + '; ledger learned before ' + lb + ' after ' + la + '; gaps written ' + (dry ? 0 : rows.length);
    const bad = [];
    // a wrong exact answer is worse than a refusal: the tick still writes its record and the group's gap row (that is the
    // gap to fill), and exits 1 so the morning log and the bar both see it
    if (T.wrong !== 0) bad.push('wrong ' + T.wrong);
    // the counts are one partition: every asked row is correct, wrong or refused, and answered is correct plus wrong
    if (!(T.asked === T.correct + T.wrong + T.refused && T.answered === T.correct + T.wrong)) bad.push('totals do not add up (asked ' + T.asked + ', answered ' + T.answered + ', correct ' + T.correct + ', wrong ' + T.wrong + ', refused ' + T.refused + ')');
    if (record.sockets.total !== 0) bad.push('sockets ' + record.sockets.total);
    if (record.queries.controls && record.queries.controls.failed !== 0) bad.push('controls failed ' + record.queries.controls.failed);
    if (record.queries.secondOpinion && record.queries.secondOpinion.disagree !== 0) bad.push('second opinion disagreed ' + record.queries.secondOpinion.disagree);
    record.problems = bad;
    record.exitCode = bad.length ? 1 : 0;
    // 5. the writes (none in dry mode)
    if (!dry) {
      mkdirSync(stateDir, { recursive: true });
      const ml = missesLines({ open, wrongRows: v.wrongRows || [], seed, n });
      writeFileSync(missesAbs, ml.join('\n') + (ml.length ? '\n' : ''));
      const G = await import('./gaps.mjs');
      const fresh = await G.buildLedger({ root: ROOT });
      const merged = mergeGapLines(fresh.lines, rows);
      const w = G.writeLedger(merged.lines, { root: gapsRoot, boards: gapsRoot === ROOT });
      record.gaps.written = rows.length;
      record.gaps.ledgerLines = w.lines;
      record.gaps.previousLedger = w.previous;
      record.gaps.freshLines = fresh.lines.length;
      record.gaps.droppedLoopLines = merged.dropped;
      record.misses.sha256 = sha256(ml.join('\n'));
      const tmp = recordAbs + '.' + process.pid + '.tmp';
      writeFileSync(tmp, JSON.stringify(record, null, 1) + '\n');
      renameSync(tmp, recordAbs);
    }
    return record;
  } finally {
    guard.remove();
  }
}

// ---------------------------------------------------------------- CLI
const isMain = process.argv[1] && path.resolve(process.argv[1]) === SELF_FILE;
if (isMain) {
  const argv = process.argv.slice(2);
  if (!(globalThis.__BRAIN_LOOP_GUARD && globalThis.__BRAIN_LOOP_GUARD.preload)) {
    // once, under the preload that refuses and counts sockets in the main thread and every file worker (the re-ask
    // worker included; not eval:true workers, not child processes: NOT_COVERED)
    const r = spawnSync(process.execPath, [...process.execArgv, '--import', GUARD_URL, SELF_FILE, ...argv], { stdio: 'inherit', windowsHide: true });
    process.exit(r.status ?? 1);
  }
  let a;
  try { a = parseArgs(argv); } catch (e) { console.error('self/loop.mjs: ' + firstLine(e)); process.exit(2); }
  try {
    const r = await tick({ ...a, command: argv.join(' '), log: a.json ? () => {} : (s) => console.log(s) });
    if (a.json) console.log(JSON.stringify(r, null, 1));
    else console.log(r.line + (r.problems.length ? '  PROBLEMS: ' + r.problems.join('; ') : ''));
    process.exitCode = r.exitCode;
  } catch (e) {
    console.error('self/loop.mjs: ' + firstLine(e));
    process.exitCode = 1;
  }
}
