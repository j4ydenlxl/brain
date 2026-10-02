#!/usr/bin/env node
// grow/era.mjs: THE ERA (grow/NEO.md, "Order 7: always burning", ERA; the step list of contract c1). His words
// (2026-10-01, verbatim at the head of NEO.md): "in a sandboxed simulated environment to go all the way to the Ai age the
// next, and then more and more", "the organisms need to heartbeat itself ... the organism operates and iterates itself",
// "It should be able to become a god by itself. you jsut gotta build how it can". An ERA is one full round the organism
// runs BY ITSELF with no model call (a GitHub runner through body/heartbeat.yml, or a cloud session through GROW.md step
// 9), every step a child process of this tree's own verbs, in the order of contract c1 (STEPS):
//   pipeline snapshot (first), absorb pull, frontier step, know shelve, teach intake (the absorbed packs), intake step,
//   swarm grow (the parallel workers of grow/swarm.mjs; task by task through grow/neo.mjs grow when grow/swarm.mjs is not
//   on disk), neo regate, evolve step, pipeline promote, measure run; then SHIP.
// THE PIPELINE (c9, grow/pipeline.mjs): the snapshot is the state before the era; promote decides after evolve. Promoted:
// ONE commit of everything. Not promoted: the generated files are back at the snapshot (the cursors and counters kept)
// and nothing is committed but, at most once every 6 hours, one record commit of the counters (RECORD_PATHS). A promote
// that does not answer is followed by `pipeline restore`; a tree that could not be restored is never committed. With no
// snapshot the era generates nothing (nothing could judge it). grow/pipeline.mjs not on disk: every era is shipped whole.
// The era's row is written to neo/ERA.json BEFORE measure runs (measure reads the velocity of the era it measures).
// FLAT: each row carries `plateau`, the eras since the held-out rows right in total last rose. Rising (0): the steps keep
// their shares and grow gets the rest. Flat: frontier, know, intake and evolve get FLAT_SLOTS (more of the era), and a
// task re-grown STALE_AFTER times without a gain is skipped until its inputs change (its task files, a knowledge pack,
// neo/GENOME.json, neo/MACROS.json, the kernel's version: inputsSig). An era with nothing to do (nothing to grow, and
// either no step that opens or evolves is on disk or the era before it in this run did nothing on the same inputs)
// is not run: the run prints "stop":"idle" at once.
// FEATURE-DETECTED: a step whose file is not on disk is `skipped` and named; a verb that answers usage (exit 2) is tried
// once more without its optional flags, then `skipped` (its part has not landed that verb); a step that fails is a
// `blocked` line and the era goes on. BOUNDED (planEra): every step has a slot; its child is killed with its whole process
// tree at the end of the slot, and the steps after it keep theirs, so the era ends inside --max-ms with room to measure
// and ship. PLATEAU: an era that changed nothing under neo/ and grown/ but its own record (RECORDS) is idle (with the
// pipeline: promoted, opened and grew nothing); neo/ERA.json counts idle eras in a row (`idle`); without the pipeline only
// the first idle era of a streak is committed; the run stops ("stop":"idle") at two in a row. SHIP (--commit) commits
// neo/ and grown/ only, as jayden with the cortex trailer, message
// `era <e>: <tasks> tasks, <cells> cells, <mastered> mastered`; a push the remote rejects (two bodies beat at the same
// hour) is rebased and tried again: the two neo/ERA.json records merge, this body's eras are renumbered after the remote's
// (the commit message with them), and the run re-reads neo/ERA.json, so two eras never share a number. Before an era a
// clean checkout is brought level with the remote, so an era starts from what the other body already grew.
// It refuses to run on a PC exactly as grow/sandbox.mjs does for --backend here (exit 4 unless CLAUDE_CODE_REMOTE,
// GITHUB_ACTIONS, VERCEL or CI is set), so nothing an absorbed byte produces runs on his PC. It takes work/grow/era.lock
// (pid, host, time, token; renewed before every step and every minute; stale past 30 minutes unless its pid is alive on
// this host, and past 6 hours whatever it is) and never runs while a generation finish is in flight in this checkout.
// --dry lists what it would run and runs nothing, anywhere. It never opens state/, judge/heldout/, judge/control.jsonl
// or any neo/tasks/*/heldout.jsonl, never edits judge/ or grow/contract.mjs, and calls no model.
// STAGED (c8): --staged <dir> (the stages the shards of a beat grew with grow/swarm.mjs grow --shard i/n --no-merge)
// makes the FIRST era's grow step `grow/swarm.mjs merge --stage <dir>`: the verified files merge one at a time in the
// swarm's order, and the same snapshot and promote judge them; the eras after it grow. A swarm that answers usage for
// merge (its verb has not landed) is skipped and named, and that era grows instead.
// Success prints ONE JSON line; a failure one stderr line and a non-zero exit (1 failure, 2 usage, 4 refused on a PC).
//   node grow/era.mjs run [--max-ms 480000] [--max-eras 0] [--workers <w>] [--staged <dir>] [--commit [--no-push]] [--backend here|vercel] [--dry]
//   node grow/era.mjs status                                     [--root <dir>] on both verbs
// Author: Opus 5.5 builder (ERA) for the Fable 5.1 orchestrator, 2026-10-01, his Order 7 and his heartbeat order.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomBytes, createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nextGeneration, TRAILER, redact, DEFAULT_ROOT, CLOUD_ENV, lastJson, lastLine, why1 } from './generation.mjs';
import { readLedger, TASK_RE } from './teach.mjs';

export const ERA_FILE = 'neo/ERA.json';
export const LOCK = 'work/grow/era.lock';
export const MEASURE_FILE = 'grown/measure.jsonl';
/** What SHIP adds and commits: neo/ and grown/, nothing else (a path not on disk is left out of the git call). */
export const SHIP_PATHS = Object.freeze(['neo/', 'grown/']);
/** The eras neo/ERA.json keeps; the count `era` never resets. */
export const KEEP = 200;
/** A lock older than this is stale unless its pid is alive on this host; older than HARD_STALE_MS it is stale whatever it is. */
export const STALE_MS = 30 * 60000;
export const HARD_STALE_MS = 6 * 60 * 60000;
export const DEFAULTS = Object.freeze({ maxMs: 480000, maxEras: 0, backend: 'here' });
export const BACKENDS = Object.freeze(['here', 'vercel']);
/** No child is started with less than this; a step with less than this left before the deadline is skipped. */
export const MIN_CHILD_MS = 2000;
/** A second era starts only with this much of the budget left (the first era always starts). */
export const MIN_ERA_MS = 20000;
/** Idle eras in a row that stop the run. */
export const IDLE_STOP = 2;
/** Pushes an era tries (a rebase onto the remote between two). */
export const PUSH_TRIES = 3;
/** --workers, passed to the swarm: an integer in this range (the swarm's own default is every core, at most 8). */
export const WORKERS = Object.freeze({ min: 1, max: 64 });

const stepOf = (name, script, verb, flags, optional, slot) => Object.freeze({ name, script, verb, flags: Object.freeze(flags), optional: Object.freeze(optional), slot: slot ? Object.freeze(slot) : null });
/**
 * The steps of one era, in the order of contract c1: name, the script (this tree's own verb), its verb, the flags it
 * always gets, the optional flags (dropped when the verb answers usage), and its slot (a share of the era's time, capped);
 * grow has no slot: it gets what the others leave. A row added here is a new step of every era.
 */
export const STEPS = Object.freeze([
  stepOf('snapshot', 'grow/pipeline.mjs', 'snapshot', ['era'], ['max-ms'], { share: 0.06, cap: 90000 }),
  stepOf('absorb', 'grow/absorb.mjs', 'pull', ['gen'], ['max-ms'], { share: 0.10, cap: 90000 }),
  stepOf('frontier', 'grow/frontier.mjs', 'step', [], ['max-ms', 'era'], { share: 0.03, cap: 30000 }),
  stepOf('know', 'grow/know.mjs', 'shelve', [], ['max-ms', 'era'], { share: 0.03, cap: 30000 }),
  stepOf('teach', 'grow/teach.mjs', 'intake', ['gen'], [], { share: 0.05, cap: 60000 }),
  stepOf('intake', 'grow/intake.mjs', 'step', [], ['max-ms', 'era'], { share: 0.05, cap: 60000 }),
  stepOf('grow', 'grow/swarm.mjs', 'grow', ['gen'], ['max-ms', 'era', 'workers'], null),
  stepOf('regate', 'grow/neo.mjs', 'regate', [], [], { share: 0.02, cap: 20000 }),
  stepOf('evolve', 'grow/evolve.mjs', 'step', [], ['max-ms', 'era'], { share: 0.06, cap: 60000 }),
  stepOf('promote', 'grow/pipeline.mjs', 'promote', ['era'], ['max-ms'], { share: 0.06, cap: 90000 }),
  stepOf('measure', 'grow/measure.mjs', 'run', ['era'], ['max-ms'], { share: 0.10, cap: 60000 }),
]);
/** The grow step of an era given --staged <dir>: the swarm merges the shards' stages (its slot is grow's). */
export const MERGE_STEP = stepOf('grow', 'grow/swarm.mjs', 'merge', ['stage'], ['max-ms'], null);
/** SHIP's slot (git add, commit, push, a rebase): kept at the end of every era. */
export const SHIP_SLOT = Object.freeze({ share: 0.04, cap: 30000 });
/** The pipeline (c9): its file, the restore after a promote that did not answer, and the record commit's paths and clock. */
export const PIPELINE = 'grow/pipeline.mjs';
export const RESTORE_MS = 120000;
export const RECORD_PATHS = Object.freeze(['neo/ERA.json', 'neo/LEDGER.json', 'grown/measure.jsonl']);
export const RECORD_MS = 6 * 3600 * 1000;
/**
 * A flat era (plateau >= FLAT_AFTER): these steps get these slots, grow what is left. Evolve's flat slot holds one
 * confirmed trial (two runs of both arms): on a copy of the tree one run of a 3-task sample took 46497 ms and the
 * second did not fit in a step told 52600 ms; a quarter of a 480000 ms era tells it 115000 ms.
 */
export const FLAT_AFTER = 1;
export const FLAT_SLOTS = Object.freeze({
  frontier: Object.freeze({ share: 0.08, cap: 60000 }), know: Object.freeze({ share: 0.06, cap: 45000 }),
  intake: Object.freeze({ share: 0.10, cap: 90000 }), evolve: Object.freeze({ share: 0.25, cap: 150000 }),
});
/** A task grown this many times in a row without a gain on the same inputs is skipped until they change. */
export const STALE_AFTER = 2;
/** The steps that can open something new (or change what grows): with none on disk and nothing to grow, an era has nothing to do. */
export const OPENERS = Object.freeze(['absorb', 'frontier', 'know', 'teach', 'intake']);
export const KERNEL_FILE = 'grow/neo-kernel.mjs';
export const INPUT_FILES = Object.freeze(['neo/GENOME.json', 'neo/MACROS.json']);
export const PACKS_DIR = 'neo/know';
/** The grow of one task when grow/swarm.mjs is not on disk (the era's own serial loop). */
export const SERIAL_GROW = 'grow/neo.mjs';
/**
 * The era's own record and the steps' logs: a change to these alone is not a change in what the organism is (eras 14,
 * 15 and 16 committed nothing else). `*` is one path segment. neo/RECORDS.json ({ "records": [..] }) may add more.
 */
export const RECORDS = Object.freeze(['neo/ERA.json', 'grown/measure.jsonl', 'neo/ABSORB.json', 'neo/LEDGER.json', 'neo/TRIALS.jsonl', 'neo/tasks/*/colony.json']);
export const RECORDS_FILE = 'neo/RECORDS.json';
/** Never opened, never even listed for a fingerprint (a new task shows through its task.json and dev.jsonl). */
export const UNREAD = Object.freeze(['neo/tasks/*/heldout.jsonl']);
export const PC_REFUSAL = 'an era never runs on his PC: its steps run what absorbed bytes produce as children of this machine (grow/sandbox.mjs --backend here rule); allowed only when ' + CLOUD_ENV.slice(0, -1).join(', ') + ' or ' + CLOUD_ENV[CLOUD_ENV.length - 1] + ' is set';
export const FALLBACK_EMAIL = 'j4ydenlxl@users.noreply.github.com';
export const USAGE = [
  'usage: node grow/era.mjs <verb> [flags]   (--root <dir>: another tree root)',
  '  run [--max-ms ' + DEFAULTS.maxMs + '] [--max-eras 0 (no cap)] [--workers <w>] [--staged <dir>] [--commit [--no-push]] [--backend here|vercel] [--dry]',
  '      one era after another: ' + STEPS.map((s) => s.name).join(', ') + ', ship (with --commit); refused on a PC (exit 4)',
  '      --staged <dir>: the first era merges the shards\' stages (node ' + MERGE_STEP.script + ' merge --stage <dir>) in place of its grow',
  '  status                                     the head of ' + ERA_FILE,
].join('\n');

export class Fail extends Error { constructor(line, code = 1) { super(line); this.code = code; } }

// ---- helpers
export const isObj = (o) => Boolean(o) && typeof o === 'object' && !Array.isArray(o);
const first = (e) => String((e && e.message) || e).split('\n')[0];
const numOr = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const writeJson = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n'); };
const iso = (ms) => new Date(ms).toISOString();
const show = (v) => (v === null || v === undefined ? '?' : String(v));
const posix = (p) => p.split(path.sep).join('/');
export const scoreOf = (h) => (isObj(h) ? { ok: numOr(h.ok), n: numOr(h.n), score: numOr(h.score) } : null);
/** The sum of the numbers among vals; null when there is none (a step that never answered is not a zero). */
const total = (vals) => { const v = vals.filter((x) => typeof x === 'number' && Number.isFinite(x)); return v.length ? v.reduce((s, x) => s + x, 0) : null; };
const round2 = (x) => Math.round(x * 100) / 100;

/** The commit message of one era: `era <e>: <tasks> tasks, <cells> cells, <mastered> mastered` (an unmeasured count is ?). */
export const commitMessage = (era, tasks, cells, mastered) => 'era ' + era + ': ' + show(tasks) + ' tasks, ' + show(cells) + ' cells, ' + show(mastered) + ' mastered';
export const ERA_SUBJECT = /^era (\d+): (.*)$/;

/** May an era run here? Only on a cloud VM: one of CLOUD_ENV (grow/sandbox.mjs's names) set. */
export function allowedHere(env = process.env) {
  const c = CLOUD_ENV.find((k) => env[k]);
  return c ? { ok: true, why: c + ' is set: this VM runs the era' } : { ok: false, why: PC_REFUSAL };
}

/** Which body runs the era: the GitHub runner, the Claude routine, Vercel, else a CI. */
export function bodyOf(env = process.env) {
  if (env.GITHUB_ACTIONS) return 'github';
  if (env.CLAUDE_CODE_REMOTE) return 'claude-routine';
  if (env.VERCEL) return 'vercel';
  return 'ci';
}

// ---- children: async, bounded, killed with their whole process tree at their deadline
const LIVE = new Set();
/** Kill a child and every process it started (a process group on POSIX, taskkill /T on Windows). Never throws. */
export function killTree(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return;
  if (process.platform === 'win32') {
    try { spawnSync('taskkill', ['/pid', String(pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore', timeout: 15000 }); } catch { /* gone */ }
    return;
  }
  try { process.kill(-pid, 'SIGKILL'); } catch { try { process.kill(pid, 'SIGKILL'); } catch { /* gone */ } }
}
let reaperSet = false;
function reaper() {
  if (reaperSet) return;
  reaperSet = true;
  process.on('exit', () => { for (const pid of LIVE) killTree(pid); });
}
/** At most this much of a child's stdout is kept (its tail: the step's line is its LAST line). */
export const MAX_OUT = 16 * 1024 * 1024;
/**
 * Run bin with args, at most timeoutMs: on overrun the whole tree is killed and timedOut is true.
 * @returns {Promise<{ code: number, stdout: string, stderr: string, error: Error|null, timedOut: boolean, ms: number }>}
 */
export function runProc(bin, args, { cwd, env = process.env, timeoutMs = 60000 } = {}) {
  reaper();
  return new Promise((resolve) => {
    const t0 = Date.now();
    let out = '', err = '', timedOut = false, done = false, child;
    const finish = (code, error = null) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (child && child.pid) LIVE.delete(child.pid);
      resolve({ code: timedOut ? 137 : code, stdout: out, stderr: err, error, timedOut, ms: Date.now() - t0 });
    };
    try {
      child = spawn(bin, args, { cwd, env, windowsHide: true, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) { resolve({ code: 1, stdout: '', stderr: '', error: e, timedOut: false, ms: 0 }); return; }
    if (child.pid) LIVE.add(child.pid);
    const timer = setTimeout(() => { timedOut = true; killTree(child.pid); }, Math.max(1, Math.floor(timeoutMs)));
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (d) => { out += d; if (out.length > MAX_OUT) out = out.slice(-MAX_OUT); });
    child.stderr.on('data', (d) => { err += d; if (err.length > MAX_OUT / 16) err = err.slice(-MAX_OUT / 16); });
    child.on('error', (e) => finish(1, e));
    child.on('close', (code) => finish(typeof code === 'number' ? code : 1));
  });
}
/** A script of the tree as a child (node <root>/<script> ...args, cwd root): the era's and the swarm's runner. */
export const runChild = (root, script, args = [], { env = process.env, timeout = 60000 } = {}) => runProc(process.execPath, [path.join(root, script), ...args], { cwd: root, env, timeoutMs: timeout });
/** The one line that says why a child failed (its own line, or that it was killed at its deadline). */
export const whyOf = (r) => (r && r.timedOut ? 'killed at its deadline' + (Number.isFinite(r.ms) ? ' after ' + r.ms + ' ms' : '') : why1(r));

// ---- neo/ERA.json, the ledger's tasks, the colonies
/** The highest era a document names: its count or any of its rows. */
const topOf = (doc) => (isObj(doc) && Array.isArray(doc.eras) ? doc.eras.reduce((m, r) => (isObj(r) && Number.isInteger(r.era) && r.era > m ? r.era : m), Number.isInteger(doc.era) ? doc.era : 0) : 0);
/** A parsed neo/ERA.json in the shape the era keeps, or null when it is not that shape. */
export function eraShape(doc) {
  if (!isObj(doc) || !Number.isInteger(doc.era) || doc.era < 0 || !Array.isArray(doc.eras)) return null;
  const idle = Number.isInteger(doc.idle) && doc.idle >= 0 ? doc.idle : 0;
  return { ...doc, era: topOf(doc), lastGrown: isObj(doc.lastGrown) ? { ...doc.lastGrown } : {}, idle };
}
/**
 * neo/ERA.json as { era, eras, lastGrown, idle } (every other key kept for the write back). A missing file is era 0; a
 * file that is not that shape fails (a rewrite would erase the eras it holds): a human session repairs it.
 */
export function readEra(root) {
  const f = path.join(root, ERA_FILE);
  let text;
  try { text = fs.readFileSync(f, 'utf8'); } catch (e) {
    if (e && e.code === 'ENOENT') return { era: 0, eras: [], lastGrown: {}, idle: 0 };
    throw new Fail(ERA_FILE + ' cannot be read (' + first(e) + ')', 1);
  }
  let doc;
  try { doc = JSON.parse(text); } catch (e) { throw new Fail(ERA_FILE + ' is not JSON (' + first(e) + '): a human session repairs it', 1); }
  const s = eraShape(doc);
  if (!s) throw new Fail(ERA_FILE + ' is not { era, eras: [..], lastGrown }: a human session repairs it', 1);
  return s;
}

/** The document after one more era: the row appended, the last KEEP rows kept, lastGrown and the idle count replaced. */
export function appendEra(doc, row, lastGrown, idle = 0) {
  return { ...doc, era: row.era, eras: [...doc.eras, row].slice(-KEEP), lastGrown, idle };
}

/**
 * Two neo/ERA.json documents after two bodies each ran eras from base: the remote's (up) whole, then this body's eras
 * that the remote does not hold, renumbered after the remote's highest (the count never shared, never going back);
 * lastGrown the later of the two per task (this body's eras by their new numbers), idle this body's.
 * @returns {{ doc: object, map: Object<string, number> }} map: an old era number of this body to its new one
 */
export function mergeEraDocs(up, mine, base = null) {
  const U = eraShape(up) || { era: 0, eras: [], lastGrown: {}, idle: 0 };
  const M = eraShape(mine) || { era: 0, eras: [], lastGrown: {}, idle: 0 };
  const B = eraShape(base);
  const baseTop = B ? topOf(B) : 0;
  const held = new Set(U.eras.filter(isObj).map((r) => r.era + '@' + r.at));
  const ours = M.eras.filter((r) => isObj(r) && Number.isInteger(r.era) && r.era > baseTop && !held.has(r.era + '@' + r.at));
  let next = topOf(U) + 1;
  const map = {};
  const renumbered = ours.map((r) => { const to = next++; if (to !== r.era) map[r.era] = to; return to === r.era ? r : { ...r, era: to, renumberedFrom: r.era }; });
  const lastGrown = { ...U.lastGrown };
  for (const [t, v] of Object.entries(M.lastGrown)) {
    const w = Number.isInteger(v) && Object.hasOwn(map, v) ? map[v] : v;
    if (Number.isInteger(w) && (!Number.isInteger(lastGrown[t]) || w > lastGrown[t])) lastGrown[t] = w;
  }
  const eras = [...U.eras, ...renumbered].slice(-KEEP);
  // the stale memory is this body's (it grew those tasks); the record clock the later of the two commits
  const at = (d) => (typeof d.recordAt === 'string' && Number.isFinite(Date.parse(d.recordAt)) ? Date.parse(d.recordAt) : -Infinity);
  const extra = { ...(isObj(M.stale) ? { stale: M.stale } : {}), ...(at(M) > at(U) ? { recordAt: M.recordAt } : {}) };
  return { doc: { ...U, ...extra, era: Math.max(topOf(U), ...renumbered.map((r) => r.era)), eras, lastGrown, idle: M.idle }, map };
}

/** The ledger's task names in ledger order, each once (a name that is not a task name is left out and named). */
export function ledgerTasks(root) {
  const { tasks } = readLedger(root);
  const seen = new Set(), bad = [];
  const out = [];
  for (const r of tasks) {
    if (seen.has(r.task)) continue;
    seen.add(r.task);
    if (TASK_RE.test(r.task)) out.push(r.task); else bad.push(r.task);
  }
  return { tasks: out, bad };
}

/** The task a grown/index.json NEO row is the colony of: its task, else its class, else its id without -neo-g<n>. */
export function taskOfRow(c) {
  if (typeof c.task === 'string' && c.task) return c.task;
  if (typeof c.class === 'string' && c.class) return c.class;
  const m = /^(.+)-neo-g\d+(?:-\d+)?$/.exec(String(c.id ?? ''));
  return m ? m[1] : null;
}

/**
 * MASTERED by the engine's own rule: a colony row the gate has judged carries `serve` (contract c2: true only while its
 * task is mastered), and that is the answer; a row the gate has not judged yet is mastered when it scores 1 on its
 * held-out rows (the engine's rule before the gate).
 */
export const masteredRow = (c) => (isObj(c) && typeof c.serve === 'boolean' ? c.serve : Boolean(isObj(c) && isObj(c.heldout) && c.heldout.score === 1));

/**
 * The NEO colonies grown/index.json holds: Map task -> { ok, n, score, mastered } (rows with tier "neo" only; the
 * hand-grown cells are never a task's colony). No index is no colony; an index that is not JSON is null (unknown).
 */
export function colonies(root) {
  const f = path.join(root, 'grown', 'index.json');
  if (!fs.existsSync(f)) return new Map();
  const ix = readJson(f);
  if (!isObj(ix)) return null;
  const out = new Map();
  for (const c of Array.isArray(ix.cells) ? ix.cells : []) {
    if (!isObj(c) || c.tier !== 'neo') continue;
    const t = taskOfRow(c);
    if (t) out.set(t, { ...(scoreOf(c.heldout) || { ok: null, n: null, score: null }), mastered: masteredRow(c) });
  }
  return out;
}
export const isMastered = (cols, t) => Boolean(cols && cols.has(t) && cols.get(t) && cols.get(t).mastered);
export const masteredCount = (cols) => (cols === null ? null : [...cols.keys()].filter((t) => isMastered(cols, t)).length);

/** The grow order: the least recently grown first (never grown before all), ties in ledger order. */
export function growOrder(tasks, lastGrown) {
  const at = (t) => (Object.hasOwn(lastGrown, t) && Number.isInteger(lastGrown[t]) ? lastGrown[t] : -1);
  return tasks.map((t, i) => ({ t, i, at: at(t) })).sort((a, b) => (a.at - b.at) || (a.i - b.i)).map((x) => x.t);
}

// ---- FLAT: the inputs a grow depends on, the stale memory, the held-out total
const sha1 = (s) => createHash('sha1').update(s).digest('hex');
const bytesOr = (f) => { try { return fs.readFileSync(f); } catch { return Buffer.alloc(0); } };
/** The kernel's version (grow/neo-kernel.mjs `KERNEL_VERSION`, read as text, never run), else a hash of the file. */
export function kernelVersion(root) {
  const text = bytesOr(path.join(root, ...KERNEL_FILE.split('/'))).toString('utf8');
  const m = /\bKERNEL_VERSION\s*=\s*(\d+)/.exec(text);
  return m ? 'v' + m[1] : 'sha:' + sha1(text).slice(0, 12);
}
/** The knowledge packs on the shelf: every file under neo/know/ by its path and size (a new pack is a new file). */
function packsOf(root) {
  const out = [];
  const walk = (rel) => {
    let ents;
    try { ents = fs.readdirSync(path.join(root, ...rel.split('/')), { withFileTypes: true }); } catch { return; }
    for (const d of ents.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      const r = rel + '/' + d.name;
      if (d.isDirectory()) walk(r);
      else if (d.isFile()) { try { out.push(r + ':' + fs.statSync(path.join(root, ...r.split('/'))).size); } catch { /* gone */ } }
    }
  };
  walk(PACKS_DIR);
  return out.join('\n');
}
/** The inputs every task's grow shares: neo/GENOME.json, neo/MACROS.json (their bytes), the kernel's version, the packs. */
export function inputsSig(root) {
  const parts = INPUT_FILES.map((f) => f + ':' + sha1(bytesOr(path.join(root, ...f.split('/')))));
  return sha1([...parts, 'kernel:' + kernelVersion(root), 'packs:' + sha1(packsOf(root))].join('\n')).slice(0, 16);
}
/** One task's inputs: the shared ones and its own task.json and dev.jsonl (never its heldout.jsonl). */
export function taskSig(root, task, shared = inputsSig(root)) {
  const dir = path.join(root, 'neo', 'tasks', task);
  return sha1([shared, sha1(bytesOr(path.join(dir, 'task.json'))), sha1(bytesOr(path.join(dir, 'dev.jsonl')))].join('\n')).slice(0, 16);
}
/** The stale memory of neo/ERA.json: task -> { sig, n, era } (anything else left out). */
export const staleOf = (doc) => Object.fromEntries(Object.entries(isObj(doc) && isObj(doc.stale) ? doc.stale : {}).filter(([, v]) => isObj(v) && typeof v.sig === 'string' && Number.isInteger(v.n)));
/** The tasks among `tasks` to skip: grown STALE_AFTER times in a row without a gain, their inputs unchanged since. */
export function staleSkip(root, doc, tasks) {
  const st = staleOf(doc), out = new Set();
  let shared = null;
  for (const t of tasks) {
    const s = st[t];
    if (!s || s.n < STALE_AFTER) continue;
    if (shared === null) shared = inputsSig(root);
    if (taskSig(root, t, shared) === s.sig) out.add(t);
  }
  return out;
}
/**
 * The stale memory after an era: a task that gained is forgotten; a task grown without a gain counts one more on the
 * same inputs (one on new inputs); a mastered task is forgotten.
 */
export function nextStale(root, doc, grownTasks, gained, era, cols = null) {
  const st = staleOf(doc), shared = inputsSig(root);
  for (const t of grownTasks) {
    if (gained.has(t)) { delete st[t]; continue; }
    const sig = taskSig(root, t, shared), prev = st[t];
    st[t] = { sig, n: prev && prev.sig === sig ? prev.n + 1 : 1, era };
  }
  if (cols) for (const t of Object.keys(st)) if (isMastered(cols, t)) delete st[t];
  return st;
}
/** The held-out rows right over every NEO colony, or null when grown/index.json is not JSON. */
export const heldoutTotal = (cols) => (cols === null ? null : [...cols.values()].reduce((s, c) => s + (Number.isFinite(c.ok) ? c.ok : 0), 0));
/**
 * Why the next era has nothing to do, or null: no task left to grow (mastered, or stale on the same inputs), and either
 * no step that opens something new (OPENERS, or evolve while a task is not mastered) is on disk, or `prev` (the era
 * before it in this run) was idle on the same inputs.
 */
export function nothingToDo(root, doc, prev = null) {
  let led;
  try { led = ledgerTasks(root).tasks; } catch { return null; }
  const cols = colonies(root);
  if (cols === null) return null;
  const open = led.filter((t) => !isMastered(cols, t));
  const skip = staleSkip(root, doc, open);
  if (open.some((t) => !skip.has(t))) return null;
  const on = (n) => { const s = STEPS.find((x) => x.name === n); return Boolean(s) && fs.existsSync(path.join(root, s.script)); };
  const what = 'nothing to grow (' + led.length + ' tasks: ' + (led.length - open.length) + ' mastered, ' + skip.size + ' grown ' + STALE_AFTER + ' times without a gain on the same inputs)';
  if (!OPENERS.some(on) && !(open.length && on('evolve'))) return what + ' and no step that opens or evolves is on disk';
  if (isObj(prev) && prev.idle === true && typeof prev.inputs === 'string' && prev.inputs === inputsSig(root)) return what + ' and era ' + prev.era + ' before it opened, grew and promoted nothing on the same inputs';
  return null;
}

// ---- the lock (work/grow/era.lock: pid, host, time, token) and a finish in flight
/** Is pid a live process on this machine? (EPERM: alive, not ours.) */
export function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (e) { return Boolean(e && e.code === 'EPERM'); }
}
/**
 * { state: free | held | stale, pid, host, at, ageMs, token }: the time is the lock's `at`, else the file's mtime (a lock
 * that is not JSON). Held up to STALE_MS; past it held only while its pid is alive on this very host, and never past
 * HARD_STALE_MS (a pid that was reused is not an era).
 */
export function lockState(root, nowMs = Date.now(), { alive = pidAlive, host = os.hostname() } = {}) {
  const f = path.join(root, LOCK);
  let st;
  try { st = fs.statSync(f); } catch { return { state: 'free', pid: null, host: null, at: null, ageMs: null, token: null }; }
  const j = readJson(f);
  const t = isObj(j) && typeof j.at === 'string' && Number.isFinite(Date.parse(j.at)) ? Date.parse(j.at) : st.mtimeMs;
  const ageMs = Math.round(nowMs - t);
  const pid = isObj(j) && Number.isInteger(j.pid) ? j.pid : null;
  const lockHost = isObj(j) && typeof j.host === 'string' ? j.host : null;
  const living = pid !== null && lockHost !== null && lockHost === host && alive(pid);
  const state = ageMs <= STALE_MS ? 'held' : ageMs <= HARD_STALE_MS && living ? 'held' : 'stale';
  return { state, pid, host: lockHost, at: iso(t), ageMs, token: isObj(j) ? j.token ?? null : null };
}

const lockText = (lock, at) => JSON.stringify({ pid: lock.pid, host: lock.host, at, token: lock.token }) + '\n';
/**
 * Take the lock: created exclusively; a held one refuses (exit 1); a stale one is moved aside (an atomic rename: of two
 * runs that judge it stale, one moves it, the other finds the winner's fresh lock) and named.
 * @returns {{ token: string, pid: number, host: string, replaced: null | { pid, at } }}
 */
export function takeLock(root, { now = Date.now, pid = process.pid, host = os.hostname(), alive = pidAlive } = {}) {
  const f = path.join(root, LOCK);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const lock = { token: randomBytes(8).toString('hex'), pid, host, replaced: null };
  for (let i = 0; i < 4; i++) {
    try {
      fs.writeFileSync(f, lockText(lock, iso(now())), { flag: 'wx' });
      return lock;
    } catch (e) {
      if (!e || e.code !== 'EEXIST') throw e;
      const s = lockState(root, now(), { alive, host });
      if (s.state !== 'stale') throw new Fail(LOCK + ' is held by pid ' + show(s.pid) + ' since ' + s.at + ': another era runs in this checkout (a lock older than ' + STALE_MS / 60000 + ' minutes is stale unless its pid lives)', 1);
      const aside = f + '.stale-' + lock.token;
      try { fs.renameSync(f, aside); } catch (err) { if (err && err.code === 'ENOENT') continue; throw err; }
      const moved = readJson(aside);
      if ((isObj(moved) ? moved.token ?? null : null) !== s.token) { try { fs.renameSync(aside, f); } catch { /* the other run's lock is back or gone */ } continue; }
      fs.rmSync(aside, { force: true });
      lock.replaced = { pid: s.pid, at: s.at };
    }
  }
  throw new Fail(LOCK + ' was taken by another run while this one replaced a stale lock', 1);
}
const ownLock = (root, lock) => { const j = readJson(path.join(root, LOCK)); return isObj(j) && j.token === lock.token; };
/** A new time on our own lock (a run longer than the stale limit stays held). */
export function refreshLock(root, lock, now = Date.now) {
  try { if (ownLock(root, lock)) fs.writeFileSync(path.join(root, LOCK), lockText(lock, iso(now()))); } catch { /* the next refresh tries again */ }
}
/** Remove the lock when it is still ours. */
export function releaseLock(root, lock) {
  try { if (ownLock(root, lock)) fs.rmSync(path.join(root, LOCK), { force: true }); } catch { /* the next run sees it stale */ }
}

/** The processes of this machine as { pid, argv, cwd }: /proc on Linux (the cloud VM); elsewhere none are seen. */
export function listProcs() {
  if (process.platform !== 'linux') return [];
  let ids = [];
  try { ids = fs.readdirSync('/proc').filter((d) => /^\d+$/.test(d)); } catch { return []; }
  const out = [];
  for (const id of ids) {
    let argv;
    try { argv = fs.readFileSync('/proc/' + id + '/cmdline', 'utf8').split('\0').filter(Boolean); } catch { continue; }
    let cwd = null;
    try { cwd = fs.readlinkSync('/proc/' + id + '/cwd'); } catch { cwd = null; }
    out.push({ pid: Number(id), argv, cwd });
  }
  return out;
}

const samePath = (a, b) => {
  const r = (p) => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };
  const x = r(a), y = r(b);
  return process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y;
};
/**
 * The generation finishes in flight in THIS checkout: a process running grow/generation.mjs with the verb finish whose
 * tree (its --root, else the script's own tree) is root. The era's own pid is never one.
 */
export function finishesInFlight(root, procs = listProcs, self = process.pid) {
  let list = [];
  try { list = procs(); } catch { list = []; }
  const out = [];
  for (const p of Array.isArray(list) ? list : []) {
    if (!p || p.pid === self || !Array.isArray(p.argv)) continue;
    const i = p.argv.findIndex((a) => /(^|[\\/])generation\.mjs$/.test(String(a)));
    if (i < 0) continue;
    const rest = p.argv.slice(i + 1).map(String);
    if (!rest.includes('finish')) continue;
    const base = p.cwd || '/';
    const script = path.resolve(base, p.argv[i]);
    let tree = path.resolve(path.dirname(script), '..');
    const k = rest.findIndex((a) => a === '--root' || a.startsWith('--root='));
    if (k >= 0) tree = path.resolve(base, rest[k].includes('=') ? rest[k].slice(7) : rest[k + 1] ?? '');
    if (samePath(tree, root)) out.push(p.pid);
  }
  return out;
}

// ---- the fingerprint: what the organism IS under neo/ and grown/, its records left out
const escapeRe = (s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
/** A path pattern ("*" is one segment) as a RegExp over posix paths relative to the root. */
export const patternRe = (p) => new RegExp('^' + p.split('*').map(escapeRe).join('[^/]*') + '$');
const PATTERN_OK = /^(neo|grown)\/[A-Za-z0-9._*/-]+$/;
/** RECORDS, and the patterns neo/RECORDS.json adds (strings under neo/ or grown/ only; anything else is ignored). */
export function recordPatterns(root) {
  const extra = readJson(path.join(root, RECORDS_FILE));
  const more = isObj(extra) && Array.isArray(extra.records) ? extra.records.filter((p) => typeof p === 'string' && PATTERN_OK.test(p) && !p.includes('..')) : [];
  return [...RECORDS, ...more];
}
/**
 * The fingerprint of neo/ and grown/: Map relative path -> sha1 of its bytes, every record (recordPatterns) and every
 * UNREAD file left out before it is even stat'ed. cache (path -> { size, mtimeMs, hash }) skips the bytes of a file
 * whose size and time did not move.
 */
export function fingerprint(root, { cache = new Map(), records = recordPatterns(root) } = {}) {
  const skipRe = [...UNREAD, ...records].map(patternRe);
  const out = new Map();
  const walk = (rel) => {
    let ents;
    try { ents = fs.readdirSync(path.join(root, rel), { withFileTypes: true }); } catch { return; }
    for (const d of ents) {
      const r = rel + '/' + d.name;
      if (d.isSymbolicLink()) continue;
      if (d.isDirectory()) { walk(r); continue; }
      if (!d.isFile() || skipRe.some((re) => re.test(r))) continue;
      let st;
      try { st = fs.statSync(path.join(root, r)); } catch { continue; }
      const c = cache.get(r);
      if (c && c.size === st.size && c.mtimeMs === st.mtimeMs) { out.set(r, c.hash); continue; }
      let hash;
      try { hash = createHash('sha1').update(fs.readFileSync(path.join(root, r))).digest('hex'); } catch { continue; }
      cache.set(r, { size: st.size, mtimeMs: st.mtimeMs, hash });
      out.set(r, hash);
    }
  };
  for (const top of ['neo', 'grown']) walk(top);
  return out;
}
/** The paths whose bytes differ between two fingerprints (added, removed or changed), sorted. */
export function changedPaths(a, b) {
  const out = new Set();
  for (const [k, v] of a) if (b.get(k) !== v) out.add(k);
  for (const k of b.keys()) if (!a.has(k)) out.add(k);
  return [...out].sort();
}

// ---- SHIP: neo/ and grown/ only, one commit as jayden with the cortex trailer, then a push that survives a rebase
/** The ship paths that are on disk (git add refuses a pathspec that matches nothing). */
export const shipPaths = (root) => SHIP_PATHS.filter((p) => fs.existsSync(path.join(root, p)));
const inShip = (p) => SHIP_PATHS.some((s) => String(p).startsWith(s));
/** A git runner for root: (args, { timeout }) -> { code, stdout, stderr, error } (never a prompt, never an editor). */
export function gitOf(root, env = process.env) {
  const genv = { ...env, GIT_EDITOR: 'true', GIT_TERMINAL_PROMPT: '0', GIT_MERGE_AUTOEDIT: 'no' };
  return (args, { timeout = 120000 } = {}) => {
    const r = spawnSync('git', args, { cwd: root, env: genv, encoding: 'utf8', windowsHide: true, timeout, maxBuffer: 64 * 1024 * 1024 });
    return { code: typeof r.status === 'number' ? r.status : 1, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error || null };
  };
}
/** The identity of an era commit: jayden, the checkout's own email (else the fallback). */
const identity = (git) => { const email = lastLine(git(['config', 'user.email']).stdout) || FALLBACK_EMAIL; return { email, args: ['-c', 'user.name=jayden', '-c', 'user.email=' + email] }; };
/** Where an era pushes: the branch's upstream when it has one, else origin and GROW_BRANCH (default master). */
export function pushTarget(git, env = process.env) {
  const up = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
  const u = up.code === 0 ? lastLine(up.stdout) : '';
  const k = u.indexOf('/');
  if (k > 0) return { remote: u.slice(0, k), branch: u.slice(k + 1), upstream: true };
  return { remote: 'origin', branch: env.GROW_BRANCH || 'master', upstream: false };
}
/** A push the remote refused because it moved (another body landed first): the one failure a rebase cures. */
export const REJECTED = /\[rejected\]|non-fast-forward|fetch first|\[remote rejected\][^\n]*(?:cannot lock ref|incorrect old value)|stale info/i;

const stageText = (git, n, p) => { const r = git(['show', ':' + n + ':' + p]); return r.code === 0 ? r.stdout : null; };
const parseOr = (t) => { try { return t === null ? null : JSON.parse(t); } catch { return null; } };
/**
 * One conflicted path of a rebase (stage 2 is the remote's side, stage 3 this body's commit): neo/ERA.json merges
 * (mergeEraDocs), grown/measure.jsonl is the remote's rows then this body's (their era renumbered), any other path under
 * neo/ or grown/ is the remote's (the body that landed first keeps that file; the next era grows it again).
 * @returns {{ ok: boolean, how: string, map?: object }}
 */
export function resolveConflict(root, git, p) {
  const f = path.join(root, ...p.split('/'));
  if (p === ERA_FILE) {
    const up = parseOr(stageText(git, 2, p)), mine = parseOr(stageText(git, 3, p)), base = parseOr(stageText(git, 1, p));
    if (!eraShape(up) || !eraShape(mine)) return { ok: false, how: p + ': a side is not an era record' };
    const { doc, map } = mergeEraDocs(up, mine, base);
    writeJson(f, doc);
    return { ok: true, how: 'merged', map };
  }
  if (p === MEASURE_FILE) {
    const lines = (t) => String(t ?? '').split(/\r?\n/).filter((l) => l.trim());
    const up = lines(stageText(git, 2, p)), have = new Set(up);
    const mine = lines(stageText(git, 3, p)).filter((l) => !have.has(l));
    fs.writeFileSync(f, [...up, ...mine].join('\n') + '\n');
    return { ok: true, how: 'joined', rows: mine };
  }
  const co = git(['checkout', '--ours', '--', p]);
  if (co.code === 0) return { ok: true, how: 'remote' };
  const rm = git(['rm', '-q', '-f', '--', p]);
  return rm.code === 0 ? { ok: true, how: 'remote (deleted there)' } : { ok: false, how: p + ': ' + why1(rm) };
}
/** Renumber the era field of this body's measure rows that the merge moved (a row that is not JSON stays as it is). */
function renumberMeasure(root, rows, map) {
  if (!rows || !rows.length || !Object.keys(map).length) return;
  const f = path.join(root, ...MEASURE_FILE.split('/'));
  const text = fs.readFileSync(f, 'utf8');
  const mine = new Set(rows);
  const out = text.split(/\r?\n/).filter((l) => l.trim()).map((l) => {
    if (!mine.has(l)) return l;
    try { const j = JSON.parse(l); if (isObj(j) && Number.isInteger(j.era) && Object.hasOwn(map, j.era)) return JSON.stringify({ ...j, era: map[j.era] }); } catch { /* kept */ }
    return l;
  });
  fs.writeFileSync(f, out.join('\n') + '\n');
}
/**
 * Rebase this body's commits onto `onto` (the remote's head), resolving conflicts under neo/ and grown/ (resolveConflict)
 * and committing each resolved era as jayden with its number renumbered in its message. A conflict anywhere else, or a
 * failure git does not explain by a conflict, aborts the rebase: nothing is lost, the push is a blocked line.
 * @returns {{ ok: boolean, why?: string, renumbered: { from: number, to: number }[], remote: string[] }}
 */
export function rebaseOnto(root, git, onto) {
  const renumbered = [], remote = [];
  let r = git(['rebase', '--autostash', onto]);
  for (let guard = 0; r.code !== 0; guard++) {
    const abort = (why) => { git(['rebase', '--abort']); return { ok: false, why, renumbered, remote }; };
    if (guard > 64) return abort('the rebase stopped more than 64 times');
    const conflicted = git(['diff', '--name-only', '--diff-filter=U']).stdout.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    if (!conflicted.length) return abort('git rebase exited ' + r.code + ': ' + why1(r));
    const outside = conflicted.find((p) => !inShip(p));
    if (outside) return abort('a conflict outside neo/ and grown/ (' + outside + '): not the era\'s to resolve');
    let map = {}, rows = null;
    for (const p of conflicted) {
      const res = resolveConflict(root, git, p);
      if (!res.ok) return abort('cannot resolve ' + res.how);
      if (res.map) map = res.map;
      if (res.rows) rows = res.rows;
      if (res.how === 'remote') remote.push(p);
    }
    renumberMeasure(root, rows, map);
    const resolved = conflicted.filter((p) => fs.existsSync(path.join(root, ...p.split('/'))));
    if (resolved.length) {
      const add = git(['add', '--', ...resolved]);
      if (add.code !== 0) return abort('git add exited ' + add.code + ': ' + why1(add));
    }
    const subject = lastLine(git(['log', '-1', '--format=%s', 'REBASE_HEAD']).stdout);
    const m = ERA_SUBJECT.exec(subject);
    if (m && Object.hasOwn(map, Number(m[1]))) {
      const id = identity(git);
      const to = map[Number(m[1])];
      const cm = git([...id.args, 'commit', '-q', '--no-verify', '--author', 'jayden <' + id.email + '>', '-m', 'era ' + to + ': ' + m[2], '-m', TRAILER]);
      if (cm.code !== 0) return abort('git commit of the renumbered era exited ' + cm.code + ': ' + why1(cm));
      renumbered.push({ from: Number(m[1]), to });
    }
    r = git(['rebase', '--continue']);
  }
  return { ok: true, renumbered, remote };
}
/**
 * The push of an era: to the target; when the remote moved, fetch, rebase onto it (rebaseOnto) and push again, at most
 * PUSH_TRIES pushes. Any other refusal (no remote, no right) is not retried. The commit stays either way.
 * @returns {{ ok: boolean, how?: string, why?: string, renumbered: object[], remote: string[] }}
 */
export function pushEra(root, { env = process.env, git = gitOf(root, env), tries = PUSH_TRIES } = {}) {
  const t = pushTarget(git, env);
  const ref = 'HEAD:refs/heads/' + t.branch;
  const renumbered = [], remote = [];
  for (let i = 1; ; i++) {
    const p = git(['push', t.remote, ref]);
    if (p.code === 0) return { ok: true, how: 'git push ' + t.remote + ' ' + ref + (i > 1 ? ' after ' + (i - 1) + (i === 2 ? ' rebase' : ' rebases') + ' onto ' + t.remote + '/' + t.branch : ''), renumbered, remote };
    const said = 'git push ' + t.remote + ' ' + ref + ' exited ' + p.code + ': ' + why1(p);
    if (!REJECTED.test(p.stderr + '\n' + p.stdout)) return { ok: false, why: said, renumbered, remote };
    if (i >= tries) return { ok: false, why: said + ' (the remote moved again after ' + (i - 1) + (i - 1 === 1 ? ' rebase)' : ' rebases)'), renumbered, remote };
    const f = git(['fetch', t.remote, t.branch]);
    if (f.code !== 0) return { ok: false, why: 'git fetch ' + t.remote + ' ' + t.branch + ' exited ' + f.code + ': ' + why1(f), renumbered, remote };
    const rb = rebaseOnto(root, git, 'FETCH_HEAD');
    renumbered.push(...rb.renumbered);
    remote.push(...rb.remote);
    if (!rb.ok) return { ok: false, why: 'the rebase onto ' + t.remote + '/' + t.branch + ' failed: ' + rb.why, renumbered, remote };
  }
}
/**
 * Before an era: a checkout whose neo/ and grown/ are clean is brought level with the remote (fetch, then a rebase of
 * this body's unpushed commits), so the era starts from what the other body grew and takes the next free number. A
 * checkout with changes there (an idle era's uncommitted record) is left as it is: the push after the next commit merges.
 * @returns {{ ok: boolean, moved: boolean, why?: string }}
 */
export function syncRemote(root, { env = process.env, git = gitOf(root, env) } = {}) {
  const dirty = git(['status', '--porcelain', '--', ...shipPaths(root)]);
  if (dirty.code !== 0) return { ok: false, moved: false, why: 'git status exited ' + dirty.code + ': ' + why1(dirty) };
  if (dirty.stdout.trim()) return { ok: true, moved: false, why: 'neo/ or grown/ has uncommitted changes: not synced' };
  const t = pushTarget(git, env);
  const f = git(['fetch', t.remote, t.branch]);
  if (f.code !== 0) return { ok: false, moved: false, why: 'git fetch ' + t.remote + ' ' + t.branch + ' exited ' + f.code + ': ' + why1(f) };
  if (git(['merge-base', '--is-ancestor', 'FETCH_HEAD', 'HEAD']).code === 0) return { ok: true, moved: false };
  const before = lastLine(git(['rev-parse', 'HEAD']).stdout);
  const rb = rebaseOnto(root, git, 'FETCH_HEAD');
  if (!rb.ok) return { ok: false, moved: false, why: 'the rebase onto ' + t.remote + '/' + t.branch + ' failed: ' + rb.why };
  return { ok: true, moved: lastLine(git(['rev-parse', 'HEAD']).stdout) !== before };
}

/**
 * One era's commit. Nothing to commit is not an error; a failed add, commit or push is a blocked line (a commit that
 * failed to push stays). The commit holds neo/ and grown/ and nothing else, whatever else the index holds. `only`: a
 * record commit of those files alone (those on disk), its message marked "(record)".
 * @returns {{ committed: true | false | 'nothing to commit', pushed: true | false | string, blocked: string[], renumbered: object[] }}
 */
export function ship(root, { era, cells = null, mastered = null, noPush = false, env = process.env, git = gitOf(root, env), only = null } = {}) {
  const blocked = [];
  const nothing = { committed: 'nothing to commit', pushed: 'skipped: nothing committed', blocked, renumbered: [] };
  const paths = only ? only.filter((p) => inShip(p) && fs.existsSync(path.join(root, ...p.split('/')))) : shipPaths(root);
  if (!paths.length) return nothing;
  const add = git(['add', '--', ...paths]);
  if (add.code !== 0) { blocked.push('ship: git add exited ' + add.code + ': ' + why1(add)); return { committed: false, pushed: 'skipped: nothing committed', blocked, renumbered: [] }; }
  if (git(['diff', '--cached', '--quiet', '--', ...paths]).code === 0) return nothing;
  let tasks = null;
  try { tasks = ledgerTasks(root).tasks.length; } catch { tasks = null; }
  const id = identity(git);
  const cm = git([...id.args, 'commit', '-q', '-m', commitMessage(era, tasks, cells, mastered) + (only ? ' (record)' : ''), '-m', TRAILER, '--', ...paths]);
  if (cm.code !== 0) { blocked.push('ship: git commit exited ' + cm.code + ': ' + why1(cm)); return { committed: false, pushed: 'skipped: nothing committed', blocked, renumbered: [] }; }
  if (noPush) return { committed: true, pushed: 'skipped (--no-push)', blocked, renumbered: [] };
  const ps = pushEra(root, { env, git });
  if (!ps.ok) blocked.push('ship: push: ' + redact(ps.why) + ' (the commit stays)');
  if (ps.remote.length) blocked.push('ship: the rebase kept the remote\'s ' + ps.remote.length + (ps.remote.length === 1 ? ' file' : ' files') + ' another body changed (' + ps.remote.slice(0, 3).join(', ') + (ps.remote.length > 3 ? ', ..' : '') + ')');
  return { committed: true, pushed: ps.ok, blocked, renumbered: ps.renumbered };
}

// ---- the clock of one era
/**
 * The slots of one era with `left` ms: every step but grow min(cap, left * share), SHIP likewise, grow what they leave;
 * after[s]: the ms the steps after s (SHIP included) keep. A step's child ends at min(start + slot, deadline - after);
 * grow ends at deadline - after.grow, so the time a step before it does not use goes to growing. A flat era gives the
 * steps of FLAT_SLOTS their flat slot (the steps that find something new get more of it, grow less). `present` (the
 * names of the steps on disk): a step that is not on disk keeps no slot, its time goes to growing.
 */
export function planEra(left, { flat = false, present = null } = {}) {
  const L = Math.max(0, Math.floor(Number(left) || 0));
  const slots = {};
  for (const s of STEPS) {
    const slot = flat && Object.hasOwn(FLAT_SLOTS, s.name) ? FLAT_SLOTS[s.name] : s.slot;
    if (slot) slots[s.name] = present && !present.includes(s.name) ? 0 : Math.min(slot.cap, Math.floor(L * slot.share));
  }
  slots.ship = Math.min(SHIP_SLOT.cap, Math.floor(L * SHIP_SLOT.share));
  slots.grow = Math.max(0, L - Object.values(slots).reduce((a, b) => a + b, 0));
  const names = [...STEPS.map((s) => s.name), 'ship'];
  const after = {};
  let acc = 0;
  for (let i = names.length - 1; i >= 0; i--) { after[names[i]] = acc; acc += slots[names[i]]; }
  return { left: L, slots, after };
}
/** The --max-ms a child is told: its kill time less a grace (a tenth, at most 5 s), never under 1000. */
export const toldMs = (timeout) => Math.max(1000, Math.floor(timeout) - Math.min(5000, Math.floor(timeout / 10)));

/** The argv of one step's child (after the script): verb, its flags, the optional ones when `optional`, --root last. */
export function argsOf(step, ctx, root, optional = true) {
  const val = { gen: ctx.g, era: ctx.e, 'max-ms': ctx.maxMs, workers: ctx.workers, stage: ctx.stage };
  const out = [step.verb];
  for (const k of step.flags) out.push('--' + k, String(val[k]));
  if (optional) for (const k of step.optional) if (val[k] !== null && val[k] !== undefined) out.push('--' + k, String(val[k]));
  out.push('--root', root);
  return out;
}

// ---- the run: eras back to back
/**
 * Burn eras until the budget is spent, the cap is reached, two eras in a row were idle or a finish started here.
 * @param {string} root the tree root
 * @param {{ maxMs?: number, maxEras?: number, workers?: number|null, commit?: boolean, noPush?: boolean, backend?: string,
 *   dry?: boolean, env?: object, now?: () => number, exec?: Function, procs?: Function, pid?: number, git?: Function }} opts
 *   exec (script, args, { env, timeout }) -> { code, stdout, stderr, timedOut } or its promise, now, procs and git
 *   replace the children, the clock, /proc and git (a test's)
 * @returns {Promise<object>} the run line
 */
export async function runEras(root, opts = {}) {
  const { maxMs = DEFAULTS.maxMs, maxEras = DEFAULTS.maxEras, workers = null, commit = false, noPush = false, backend = DEFAULTS.backend, dry = false,
    env = process.env, now = Date.now, exec = null, procs = listProcs, pid = process.pid, git = null } = opts;
  const staged = opts.staged === undefined || opts.staged === null ? null : path.resolve(String(opts.staged));
  if (!BACKENDS.includes(backend)) throw new Fail('--backend is ' + BACKENDS.join(' or ') + ', not ' + backend, 2);
  if (staged !== null) {
    let st = null;
    try { st = fs.statSync(staged); } catch { st = null; }
    if (!st || !st.isDirectory()) throw new Fail('--staged ' + staged + ' is not a directory', 2);
  }
  if (!Number.isInteger(maxMs) || maxMs < 1) throw new Fail('--max-ms is an integer from 1, not ' + maxMs, 2);
  if (!Number.isInteger(maxEras) || maxEras < 0) throw new Fail('--max-eras is an integer from 0 (no cap), not ' + maxEras, 2);
  if (workers !== null && (!Number.isInteger(workers) || workers < WORKERS.min || workers > WORKERS.max)) throw new Fail('--workers is an integer from ' + WORKERS.min + ' to ' + WORKERS.max + ', not ' + workers, 2);
  if (noPush && !commit) throw new Fail('--no-push needs --commit', 2);
  const here = allowedHere(env);
  if (dry) return dryRun(root, { maxMs, maxEras, workers, staged, commit, noPush, backend, here, now, procs, pid, env });
  if (!here.ok) throw new Fail(PC_REFUSAL + ' (--backend ' + backend + ')', 4);
  const inFlight = finishesInFlight(root, procs, pid);
  if (inFlight.length) throw new Fail('a generation finish is in flight in this checkout (pid ' + inFlight.join(', ') + '): no era runs beside it', 1);
  const doc = readEra(root); // a malformed file fails before the lock is taken
  const lock = takeLock(root, { now, pid });
  const beat = setInterval(() => refreshLock(root, lock, now), 60000);
  if (typeof beat.unref === 'function') beat.unref();
  try {
    return await burn(root, { doc, maxMs, maxEras, workers, staged, commit, noPush, env, now, exec, procs, pid, lock, git: git || gitOf(root, env) });
  } finally { clearInterval(beat); releaseLock(root, lock); }
}

async function burn(root, o) {
  const { maxMs, maxEras, workers, commit, noPush, env, now, procs, pid, lock, git } = o;
  const staged = o.staged || null;
  let doc = o.doc;
  const exec = o.exec || ((script, args, x) => runChild(root, script, args, x));
  const t0 = now(), deadline = t0 + maxMs, body = bodyOf(env), cache = new Map();
  const rows = [], tail = [];
  let committed = commit ? 0 : 'skipped (no --commit)';
  let pushed = !commit ? 'skipped (no --commit)' : noPush ? 'skipped (--no-push)' : 0;
  let stop = null;
  for (;;) {
    if (maxEras && rows.length >= maxEras) { stop = 'max-eras'; break; }
    if (rows.length) {
      if (deadline - now() < MIN_ERA_MS) { stop = 'budget'; break; }
      const f = finishesInFlight(root, procs, pid);
      if (f.length) { stop = 'finish'; tail.push('a generation finish is in flight in this checkout (pid ' + f.join(', ') + '): no further era'); break; }
    }
    refreshLock(root, lock, now);
    const pre = [];
    if (commit && !noPush) {
      const s = syncRemote(root, { env, git });
      if (!s.ok) pre.push('sync: ' + redact(s.why));
      if (s.moved) doc = readEra(root); // the remote's eras first: this era takes the next free number
    }
    // NOTHING TO DO: the era is not run, the run stops at once (the first era of a --staged run always has its stages)
    const stage = rows.length ? null : staged;
    const none = stage ? null : nothingToDo(root, doc, rows.length ? rows[rows.length - 1] : null);
    if (none) { stop = 'idle'; tail.push('idle: ' + none + ': no era run'); break; }
    const r = await oneEra(root, { doc, deadline, workers, env, now, exec, lock, cache, body, pre, staged: stage });
    const row = r.row;
    doc = r.doc; // neo/ERA.json already holds this era (written before measure, again after it)
    if (commit) {
      // SHIP. With the pipeline: promoted, ONE commit of everything; not promoted, at most one record commit of the
      // counters every RECORD_MS; a tree that could not be put back at its snapshot is never committed. Without it: every
      // era, an idle era only when it starts a streak (the record of the plateau), never again and again.
      const recordAt = typeof doc.recordAt === 'string' ? Date.parse(doc.recordAt) : NaN;
      let only;
      if (r.pipe === 'absent') {
        if (row.idle && r.idle > 1) row.shipped = 'skipped: idle ' + r.idle + ' eras in a row'; else only = null;
      } else if (r.promoted) only = null;
      else if (r.unrestored) row.shipped = 'skipped: the tree is not at its snapshot (the restore did not answer): nothing committed';
      else if (!Number.isFinite(recordAt) || now() - recordAt >= RECORD_MS) only = RECORD_PATHS;
      else row.shipped = 'skipped: not promoted, and the counters were committed at ' + doc.recordAt + ' (one record commit every ' + (RECORD_MS / 3600000) + ' h)';
      if (only !== undefined) {
        const had = Object.hasOwn(doc, 'recordAt'), prevAt = doc.recordAt;
        doc.recordAt = iso(now()); // every commit carries the counters: the record clock starts again
        writeJson(path.join(root, ERA_FILE), doc); // before SHIP: the commit carries this era
        const s = ship(root, { era: row.era, cells: row.cells, mastered: row.mastered, noPush, env, git, only });
        row.shipped = (only ? 'record ' : '') + (s.committed === true ? (s.pushed === true ? 'pushed' : 'committed') : s.committed === false ? 'failed' : 'nothing to commit');
        if (s.committed !== true) { if (had) doc.recordAt = prevAt; else delete doc.recordAt; writeJson(path.join(root, ERA_FILE), doc); }
        if (s.committed === true) committed++;
        if (s.pushed === true) pushed++;
        if (s.renumbered.length) row.renumbered = s.renumbered;
        if (s.blocked.length) row.blocked.push(...s.blocked);
        // a rebase may have merged neo/ERA.json: re-read it (the eras of the other body, this one's new number), then
        // record what SHIP said on this era's row by its new number (an uncommitted note, carried by the next commit)
        try { doc = readEra(root); } catch { /* the in-memory record stays */ }
        const mine = doc.eras.find((x) => isObj(x) && x.at === row.at && (x.era === row.era || x.renumberedFrom === row.era));
        if (mine && s.blocked.length) { mine.blocked = [...(Array.isArray(mine.blocked) ? mine.blocked : []), ...s.blocked.filter((b) => !(mine.blocked || []).includes(b))]; writeJson(path.join(root, ERA_FILE), doc); }
        if (mine) row.era = mine.era;
      } else writeJson(path.join(root, ERA_FILE), doc); // why nothing was shipped, on the era's row
    }
    rows.push(row);
    if (doc.idle >= IDLE_STOP) { stop = 'idle'; break; }
  }
  const last = rows.length ? rows[rows.length - 1] : null;
  const abs = rows.map((r) => r.absorbed).filter(Boolean);
  const ops = rows.map((r) => r.opened).filter(Boolean);
  const gen = total(rows.map((r) => r.velocity.generated)), growMs = total(rows.map((r) => r.velocity.growMs));
  const grownN = rows.reduce((n, r) => n + r.grown.length, 0);
  const mpe = rows.map((r) => r.velocity.masteredPerEra).filter((x) => typeof x === 'number');
  const piped = rows.filter((r) => isObj(r.promoted));
  return {
    eras: rows.length, era: doc.era, ms: now() - t0, body, workers: last ? last.workers : null,
    absorbed: abs.length ? { bytes: total(abs.map((x) => x.bytes)), tasks: total(abs.map((x) => x.tasks)), rows: total(abs.map((x) => x.rows)) } : null,
    opened: ops.length ? ops.reduce((n, x) => n + x.length, 0) : null,
    grown: grownN, cells: last ? last.cells : null, mastered: last ? last.mastered : null, idle: doc.idle,
    promoted: piped.length ? piped.filter((r) => r.promoted.promoted === true).length : null, plateau: last ? last.plateau : null, committed, pushed,
    velocity: {
      cellsPerSecond: gen !== null && growMs ? Math.round(gen / (growMs / 1000)) : null,
      tasksPerMinute: growMs ? round2(grownN / (growMs / 60000)) : null,
      masteredPerEra: mpe.length ? round2(mpe.reduce((a, b) => a + b, 0) / mpe.length) : null,
      eraMs: rows.length ? Math.round(rows.reduce((n, r) => n + r.ms, 0) / rows.length) : null, workers: last ? last.workers : null,
    },
    skipped: [...new Set(rows.flatMap((r) => r.skipped))],
    blocked: [...rows.flatMap((r) => r.blocked.map((b) => 'era ' + r.era + ': ' + b)), ...tail],
    stop, lock: lock.replaced ? 'took over a stale lock (pid ' + show(lock.replaced.pid) + ', ' + lock.replaced.at + ')' : 'taken',
  };
}

const okOf = (b) => (isObj(b) && isObj(b.heldout) && Number.isFinite(b.heldout.ok) ? b.heldout.ok : null);
/**
 * One era: the steps of STEPS in order, each bounded. Its row is appended to neo/ERA.json BEFORE measure runs and
 * written again with measure's numbers. Returns { row, doc, idle, pipe, promoted, unrestored }; pipe: absent (no
 * grow/pipeline.mjs), snapshot (taken, then promote), none (the snapshot failed: nothing generated).
 */
async function oneEra(root, o) {
  const { deadline, workers, env, now, exec, lock, cache, body, pre = [], staged = null } = o;
  const doc = o.doc;
  const e = doc.era + 1, g = nextGeneration(root), started = now();
  const prevRow = doc.eras.length ? doc.eras[doc.eras.length - 1] : null;
  const plateauBefore = isObj(prevRow) && Number.isInteger(prevRow.plateau) && prevRow.plateau >= 0 ? prevRow.plateau : 0;
  const flat = plateauBefore >= FLAT_AFTER;
  const present = STEPS.filter((s) => fs.existsSync(path.join(root, s.script))).map((s) => s.name);
  const plan = planEra(deadline - started, { flat, present });
  const blocked = [...pre], skipped = [], steps = {};
  const records = recordPatterns(root);
  const before = fingerprint(root, { cache, records });
  const colsBefore = colonies(root);
  const masteredBefore = masteredCount(colsBefore);
  const heldBefore = heldoutTotal(colsBefore);
  const S = Object.fromEntries(STEPS.map((s) => [s.name, s]));
  const endOf = (name, t) => (name === 'grow' ? deadline - plan.after.grow : Math.min(t + plan.slots[name], deadline - plan.after[name]));
  // one step: feature-detected, bounded, its last JSON line; { state: ok | skipped | blocked, j, why }
  const runStep = async (s, extra = {}) => {
    refreshLock(root, lock, now);
    if (!fs.existsSync(path.join(root, s.script))) return { state: 'skipped', why: s.name + ': ' + s.script + ' is not on disk' };
    const t = now();
    if (deadline - t < MIN_CHILD_MS) return { state: 'skipped', why: s.name + ': no time left in the era (' + Math.max(0, deadline - t) + ' ms)' };
    const timeout = Math.min(deadline - t, Math.max(MIN_CHILD_MS, endOf(s.name, t) - t));
    const ctx = { g, e, maxMs: toldMs(timeout), workers: s.name === 'grow' ? workers : null, ...extra };
    const hasOptional = s.optional.some((k) => ({ gen: g, era: e, 'max-ms': ctx.maxMs, workers: ctx.workers })[k] != null);
    let r = await exec(s.script, argsOf(s, ctx, root, true), { env, timeout });
    if (r.code === 2 && hasOptional && !r.timedOut) r = await exec(s.script, argsOf(s, ctx, root, false), { env, timeout: Math.max(MIN_CHILD_MS, Math.min(deadline - now(), endOf(s.name, now()) - now())) });
    steps[s.name] = now() - t;
    const cmd = 'node ' + s.script + ' ' + s.verb;
    if (r.timedOut) return { state: 'blocked', why: s.name + ': ' + cmd + ' was killed at the end of its slot (' + timeout + ' ms)' };
    if (r.code === 2) return { state: 'skipped', why: s.name + ': ' + cmd + ' answered usage (exit 2: ' + whyOf(r) + '): that verb has not landed' };
    if (r.code !== 0) return { state: 'blocked', why: s.name + ': ' + cmd + ' exited ' + r.code + ': ' + whyOf(r) };
    const j = lastJson(r.stdout);
    if (!isObj(j)) return { state: 'blocked', why: s.name + ': ' + cmd + ' printed no JSON line' };
    return { state: 'ok', j };
  };
  const note = (r) => { if (r.state === 'skipped') skipped.push(r.why); else if (r.state === 'blocked') blocked.push(r.why); return r.state === 'ok' ? r.j : null; };
  // 0. SNAPSHOT: the state before the era (grow/pipeline.mjs, c9); without one nothing is generated
  let pipe = fs.existsSync(path.join(root, PIPELINE)) ? 'snapshot' : 'absent';
  if (pipe === 'snapshot') {
    const sn = await runStep(S.snapshot);
    if (sn.state !== 'ok') { note(sn); pipe = 'none'; blocked.push('snapshot: no snapshot of the tree: the era generated nothing (nothing could judge it)'); }
  } else skipped.push('snapshot: ' + PIPELINE + ' is not on disk');
  let absorbed = null, opened = null, nWorkers = null, generated = null, staleSkipped = null, stagedRow = null;
  const grown = [], lastGrown = { ...doc.lastGrown };
  const tGrow0 = now();
  let growMs = 0;
  if (pipe !== 'none') {
    // 1. ABSORB
    const a = note(await runStep(S.absorb));
    if (a) {
      absorbed = { bytes: numOr(a.bytes), tasks: numOr(a.tasks), rows: numOr(a.rows) };
      for (const b of Array.isArray(a.blocked) ? a.blocked : []) blocked.push('absorb: ' + redact(typeof b === 'string' ? b : JSON.stringify(b)));
    }
    // 2. FRONTIER, 3. KNOW (their lines are their own record; the era names only what failed)
    note(await runStep(S.frontier));
    note(await runStep(S.know));
    // 4. TEACH: intake opens what absorb and the teacher arms wrote; 5. INTAKE: the intake step
    const op = note(await runStep(S.teach));
    if (op && Array.isArray(op.opened)) opened = op.opened.map(String);
    else if (op) blocked.push('teach: node ' + S.teach.script + ' intake printed no opened list');
    const ik = note(await runStep(S.intake));
    if (ik && Array.isArray(ik.opened)) opened = [...(opened || []), ...ik.opened.map(String)];
    // 6. GROW: the swarm's parallel workers; the era's own task-by-task loop when grow/swarm.mjs is not on disk. With
    // --staged (the first era of the run): the swarm merges the shards' stages instead; a merge verb that has not
    // landed is skipped and named, and the era grows
    const tGrow = now();
    if (fs.existsSync(path.join(root, S.grow.script))) {
      let mr = null;
      if (staged) {
        mr = await runStep(MERGE_STEP, { stage: staged });
        if (mr.state === 'skipped') { skipped.push(mr.why + ': the era grew instead of merging ' + staged); mr = null; }
        else stagedRow = mr.state === 'ok' ? { files: numOr(mr.j.files), merged: Array.isArray(mr.j.results) ? mr.j.results.length : null, left: Array.isArray(mr.j.left) ? mr.j.left.length : null } : { files: null, merged: null, left: null };
      }
      const sw = note(mr || await runStep(S.grow));
      if (sw) {
        nWorkers = Number.isInteger(sw.workers) ? sw.workers : null;
        staleSkipped = Array.isArray(sw.stale) ? sw.stale.length : numOr(sw.stale);
        const results = Array.isArray(sw.results) ? sw.results : [];
        for (const x of results) {
          if (!isObj(x) || typeof x.task !== 'string') continue;
          lastGrown[x.task] = e;
          grown.push({ task: x.task, generated: numOr(x.generated), kept: numOr(x.kept), promoted: typeof x.promoted === 'boolean' ? x.promoted : null, heldout: scoreOf(x.heldout), baseline: scoreOf(x.baseline) });
        }
        for (const x of Array.isArray(sw.refused) ? sw.refused : []) {
          if (!isObj(x) || typeof x.task !== 'string') continue;
          lastGrown[x.task] = e; // tried counts as grown: a task that always fails never starves the ring
          blocked.push('grow: ' + x.task + ': ' + redact(String(x.why ?? 'refused')));
        }
        for (const b of Array.isArray(sw.blocked) ? sw.blocked : []) blocked.push('grow: ' + redact(typeof b === 'string' ? b : JSON.stringify(b)));
        generated = numOr(sw.cells);
      }
    } else {
      skipped.push('grow: ' + S.grow.script + ' is not on disk: the era grew task by task (node ' + SERIAL_GROW + ' grow)');
      nWorkers = 1;
      const growEnd = deadline - plan.after.grow;
      let led = null;
      try { led = ledgerTasks(root); } catch (err) { blocked.push('grow: ' + redact(first(err))); }
      if (led) {
        for (const t of led.bad) blocked.push('grow: the ledger task ' + JSON.stringify(t) + ' is not a task name: not grown');
        if (colsBefore === null) blocked.push('grow: grown/index.json is not JSON: no task is skipped as mastered');
        const open = led.tasks.filter((t) => !isMastered(colsBefore, t));
        const stale = staleSkip(root, doc, open);
        staleSkipped = stale.size;
        const order = growOrder(open.filter((t) => !stale.has(t)), lastGrown);
        for (const [i, t] of order.entries()) {
          const at = now();
          if (i > 0 && at >= growEnd) break; // at least one task an era
          if (deadline - at < MIN_CHILD_MS) { skipped.push('grow: no time left in the era for ' + t); break; }
          refreshLock(root, lock, now);
          lastGrown[t] = e; // tried counts as grown
          const timeout = Math.min(deadline - at, Math.max(MIN_CHILD_MS, growEnd - at));
          const r = await exec(SERIAL_GROW, ['grow', '--task', t, '--gen', String(g), '--root', root], { env, timeout });
          const j = r.code === 0 ? lastJson(r.stdout) : null;
          if (r.code !== 0 || !isObj(j)) { blocked.push('grow: ' + t + ': node ' + SERIAL_GROW + ' grow ' + (r.timedOut ? 'was killed at the end of its slot (' + timeout + ' ms)' : r.code !== 0 ? 'exited ' + r.code + ': ' + whyOf(r) : 'printed no JSON line')); continue; }
          grown.push({ task: t, generated: numOr(j.generated), kept: numOr(j.kept), promoted: typeof j.promoted === 'boolean' ? j.promoted : null, heldout: scoreOf(j.heldout), baseline: scoreOf(j.baseline) });
        }
        steps.grow = now() - tGrow;
      }
      generated = total(grown.map((x) => x.generated));
    }
    growMs = steps.grow ?? (now() - tGrow);
    // 7. REGATE, 8. EVOLVE
    note(await runStep(S.regate));
    note(await runStep(S.evolve));
  } else growMs = now() - tGrow0;
  // 9. PROMOTE: promoted, or the generated files back at the snapshot; a promote that did not answer is a restore
  let promotion = null, unrestored = false, gainedAll = null;
  if (pipe === 'snapshot') {
    const pr = await runStep(S.promote);
    if (pr.state === 'ok' && typeof pr.j.promoted === 'boolean') {
      const list = (x) => (Array.isArray(x) ? x.map((v) => redact(String(v))) : []);
      gainedAll = list(pr.j.gained);
      promotion = { promoted: pr.j.promoted, why: redact(String(pr.j.why ?? '')), raised: list(pr.j.raised).slice(0, 20), fell: list(pr.j.fell).slice(0, 20), gained: gainedAll.slice(0, 20), before: okOf(pr.j.before), after: okOf(pr.j.after) };
    } else {
      if (pr.state === 'ok') blocked.push('promote: node ' + PIPELINE + ' promote printed no promoted');
      else note(pr);
      const rs = await exec(PIPELINE, ['restore', '--era', String(e), '--root', root], { env, timeout: Math.max(5 * MIN_CHILD_MS, Math.min(RESTORE_MS, deadline - now())) });
      unrestored = !(rs.code === 0 && isObj(lastJson(rs.stdout)));
      if (unrestored) blocked.push('promote: node ' + PIPELINE + ' restore ' + (rs.timedOut ? 'was killed at its deadline' : 'exited ' + rs.code + ': ' + whyOf(rs)) + ': the tree is not at its snapshot');
      promotion = { promoted: false, why: 'promote did not answer: ' + (unrestored ? 'the restore failed too' : 'the tree was restored to its snapshot'), raised: [], fell: [], gained: [] };
    }
  } else if (pipe === 'absent') skipped.push('promote: ' + PIPELINE + ' is not on disk');
  // FLAT: the plateau, the gains, the stale memory, the inputs
  const colsAfter = colonies(root);
  const heldAfter = heldoutTotal(colsAfter);
  const rose = heldBefore !== null && heldAfter !== null && heldAfter > heldBefore;
  const plateau = rose ? 0 : plateauBefore + 1;
  const gained = new Set(gainedAll !== null ? gainedAll : colsAfter && colsBefore ? [...colsAfter].filter(([t, c]) => (c.ok ?? 0) > ((colsBefore.get(t) || {}).ok ?? 0)).map(([t]) => t) : []);
  const stale = nextStale(root, doc, grown.map((x) => x.task), gained, e, colsAfter);
  const inputs = inputsSig(root);
  const mastered = masteredCount(colsAfter);
  // PLATEAU (idle): with the pipeline, nothing promoted, opened or grown; without it, nothing changed but the records
  const changed = changedPaths(before, fingerprint(root, { cache, records }));
  const idle = pipe === 'absent' ? changed.length === 0 : !(promotion && promotion.promoted) && !(opened && opened.length) && grown.length === 0;
  const idleCount = idle ? doc.idle + 1 : 0;
  const ms = now() - started;
  const row = {
    era: e, at: iso(started), ms, body, workers: nWorkers, absorbed, opened, grown, cells: null, mastered,
    velocity: {
      cellsPerSecond: generated !== null && growMs > 0 ? Math.round(generated / (growMs / 1000)) : null,
      tasksPerMinute: growMs > 0 ? round2(grown.length / (growMs / 60000)) : null,
      masteredPerEra: mastered !== null && masteredBefore !== null ? mastered - masteredBefore : null,
      eraMs: ms, workers: nWorkers, generated, tasks: grown.length, growMs,
    },
    pipeline: pipe, ...(promotion ? { promoted: promotion } : {}), ...(stagedRow ? { staged: stagedRow } : {}),
    heldout: { before: heldBefore, after: heldAfter }, plateau, flat, inputs, stale: { skipped: staleSkipped, held: Object.keys(stale).length },
    changed: changed.length, idle, steps, skipped, blocked,
  };
  const next = { ...appendEra(doc, row, lastGrown, idleCount), stale };
  writeJson(path.join(root, ERA_FILE), next); // BEFORE measure: it reads the velocity of the era it measures
  // 10. MEASURE
  const m = note(await runStep(S.measure));
  if (m) { row.cells = isObj(m.neo) ? numOr(m.neo.cells) : null; if (row.cells === null) blocked.push('measure: its line holds no neo.cells'); }
  row.ms = now() - started;
  row.velocity.eraMs = row.ms;
  writeJson(path.join(root, ERA_FILE), next);
  return { row, doc: next, idle: idleCount, pipe, promoted: Boolean(promotion && promotion.promoted), unrestored };
}

/** --dry: what one era would run, in order, and nothing run, nothing written (on a PC too: it runs nothing). */
function dryRun(root, { maxMs, maxEras, workers, staged = null, commit, noPush, backend, here, now, procs, pid, env }) {
  const doc = readEra(root);
  const lastRow = doc.eras.length ? doc.eras[doc.eras.length - 1] : null;
  const flat = isObj(lastRow) && Number.isInteger(lastRow.plateau) && lastRow.plateau >= FLAT_AFTER;
  const present = STEPS.filter((s) => fs.existsSync(path.join(root, s.script))).map((s) => s.name);
  const e = doc.era + 1, g = nextGeneration(root), notes = [], plan = planEra(maxMs, { flat, present });
  let order = [], mastered = [];
  try {
    const led = ledgerTasks(root), cols = colonies(root);
    mastered = led.tasks.filter((t) => isMastered(cols, t));
    const open = led.tasks.filter((t) => !isMastered(cols, t)), stale = staleSkip(root, doc, open);
    if (stale.size) notes.push('grow: ' + stale.size + ' tasks grown ' + STALE_AFTER + ' times without a gain on the same inputs are skipped');
    order = growOrder(open.filter((t) => !stale.has(t)), doc.lastGrown);
  } catch (err) { notes.push('grow: ' + redact(first(err))); }
  const would = [], skipped = [];
  for (const s of STEPS) {
    const slot = s.name === 'grow' ? plan.left - plan.after.grow : plan.slots[s.name];
    if (s.name === 'grow' && !fs.existsSync(path.join(root, s.script))) {
      skipped.push('grow: ' + s.script + ' is not on disk: the era grows task by task');
      for (const t of order) would.push('node ' + SERIAL_GROW + ' grow --task ' + t + ' --gen ' + g + ' --root ' + root);
      continue;
    }
    if (!fs.existsSync(path.join(root, s.script))) { skipped.push(s.name + ': ' + s.script + ' is not on disk'); continue; }
    if (s.name === 'grow' && staged) { would.push('node ' + MERGE_STEP.script + ' ' + argsOf(MERGE_STEP, { maxMs: toldMs(slot), stage: staged }, root, true).join(' ')); continue; }
    would.push('node ' + s.script + ' ' + argsOf(s, { g, e, maxMs: toldMs(slot), workers: s.name === 'grow' ? workers : null }, root, true).join(' '));
  }
  if (commit) {
    const ps = SHIP_PATHS.join(' ');
    would.push('git add -- ' + ps, 'git commit -m "' + commitMessage(e, '<tasks>', '<cells>', '<mastered>') + '" -m "' + TRAILER + '" -- ' + ps, ...(noPush ? [] : ['git push (a rebase onto the remote and again when it moved, at most ' + PUSH_TRIES + ' pushes)']));
    if (present.includes('promote')) would.push('(the commit only when node ' + PIPELINE + ' promote prints "promoted":true; else at most one record commit of ' + RECORD_PATHS.join(' ') + ' every ' + (RECORD_MS / 3600000) + ' h)');
  }
  return {
    dry: true, era: e, generation: g, backend, body: bodyOf(env), allowed: here.ok, why: here.why, lock: lockState(root, now()).state,
    inFlight: finishesInFlight(root, procs, pid), maxMs, maxEras, idle: doc.idle, plan: plan.slots, would, skipped, mastered, blocked: notes, at: iso(now()),
  };
}

/** status: the head of neo/ERA.json, the idle count and the lock. */
export function status(root, { now = Date.now } = {}) {
  const doc = readEra(root);
  const l = lockState(root, now());
  return {
    era: doc.era, eras: doc.eras.length, idle: doc.idle, last: doc.eras.length ? doc.eras[doc.eras.length - 1] : null, lastGrown: doc.lastGrown,
    lock: l.state === 'free' ? 'free' : l.state + ' (pid ' + show(l.pid) + ', ' + l.at + ')',
  };
}

// ---- arguments and main
const VALUE = new Set(['max-ms', 'max-eras', 'workers', 'backend', 'root', 'staged']);
const BOOL = new Set(['commit', 'no-push', 'dry']);
export function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { flags.help = true; continue; }
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq > 0 ? a.slice(2, eq) : a.slice(2);
    if (BOOL.has(name)) { if (eq > 0) throw new Fail('--' + name + ' takes no value', 2); flags[name] = true; continue; }
    if (!VALUE.has(name)) throw new Fail('unknown flag --' + name + ' (see --help)', 2);
    const v = eq > 0 ? a.slice(eq + 1) : argv[++i];
    if (v === undefined || v === '') throw new Fail('--' + name + ' needs a value', 2);
    flags[name] = v;
  }
  return { verb: pos[0], pos: pos.slice(1), flags };
}
function intOf(flags, name, lo, dflt) {
  if (flags[name] === undefined) return dflt;
  const v = Number(flags[name]);
  if (!Number.isInteger(v) || v < lo) throw new Fail('--' + name + ' is an integer from ' + lo + ', not ' + flags[name], 2);
  return v;
}

/** The CLI as a function: the printed object, or { usage: true }. */
export async function main(argv, env = process.env) {
  const { verb, pos, flags } = parseArgs(argv);
  if (flags.help || !verb || verb === 'help') return { usage: true };
  if (pos.length) throw new Fail('unexpected argument ' + pos[0] + ' (see --help)', 2);
  const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
  if (verb === 'status') {
    const extra = Object.keys(flags).filter((k) => k !== 'root');
    if (extra.length) throw new Fail('status takes only --root, not --' + extra[0], 2);
    return status(root);
  }
  if (verb === 'run') {
    let workers = null;
    if (flags.workers !== undefined) {
      workers = Number(flags.workers);
      if (!Number.isInteger(workers) || workers < WORKERS.min || workers > WORKERS.max) throw new Fail('--workers is an integer from ' + WORKERS.min + ' to ' + WORKERS.max + ', not ' + flags.workers, 2);
    }
    return runEras(root, {
      maxMs: intOf(flags, 'max-ms', 1, DEFAULTS.maxMs), maxEras: intOf(flags, 'max-eras', 0, DEFAULTS.maxEras), workers, staged: flags.staged ?? null,
      commit: Boolean(flags.commit), noPush: Boolean(flags['no-push']), backend: flags.backend ?? DEFAULTS.backend, dry: Boolean(flags.dry), env,
    });
  }
  throw new Fail('unknown verb ' + verb + ': run or status (--help)', 2);
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  const done = (code) => process.stdout.write('', () => process.exit(code));
  main(process.argv.slice(2)).then((r) => { process.stdout.write((r.usage ? USAGE : JSON.stringify(r)) + '\n'); done(0); }, (e) => {
    const coded = e instanceof Error && Number.isInteger(e.code);
    process.stderr.write(redact('era: ' + (coded ? e.message : 'failed: ' + ((e && e.stack) || e))).split('\n')[0] + '\n');
    done(coded ? e.code : 1);
  });
}
