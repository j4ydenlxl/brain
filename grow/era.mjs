#!/usr/bin/env node
// grow/era.mjs: THE ERA (grow/NEO.md, "Order 7: always burning", ERA; the step list of contract c1). His words
// (2026-10-01, verbatim at the head of NEO.md): "in a sandboxed simulated environment to go all the way to the Ai age the
// next, and then more and more", "the organisms need to heartbeat itself ... the organism operates and iterates itself",
// "It should be able to become a god by itself. you jsut gotta build how it can". An ERA is one full round the organism
// runs BY ITSELF with no model call (a GitHub runner through body/heartbeat.yml, or a cloud session through GROW.md step
// 9), every step a child process of this tree's own verbs, in the order of contract c1 (STEPS):
//   absorb pull, frontier step, know shelve, teach intake, swarm grow (the parallel workers of grow/swarm.mjs; task by
//   task through grow/neo.mjs grow when grow/swarm.mjs is not on disk), neo regate, evolve step, measure run; then SHIP.
// FEATURE-DETECTED: a step whose file is not on disk is `skipped` and named; a verb that answers usage (exit 2) is tried
// once more without its optional flags, then `skipped` (its part has not landed that verb); a step that fails is a
// `blocked` line and the era goes on. BOUNDED (planEra): every step has a slot; its child is killed with its whole process
// tree at the end of the slot, and the steps after it keep theirs, so the era ends inside --max-ms with room to measure
// and ship. PLATEAU: an era that changed nothing under neo/ and grown/ but its own record (RECORDS) is idle; neo/ERA.json
// counts idle eras in a row (`idle`); only the first idle era of a streak is committed, and the run stops ("stop":"idle")
// at two in a row. SHIP (--commit) commits neo/ and grown/ only, as jayden with the cortex trailer, message
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
// Success prints ONE JSON line; a failure one stderr line and a non-zero exit (1 failure, 2 usage, 4 refused on a PC).
//   node grow/era.mjs run [--max-ms 480000] [--max-eras 0] [--workers <w>] [--commit [--no-push]] [--backend here|vercel] [--dry]
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
  stepOf('absorb', 'grow/absorb.mjs', 'pull', ['gen'], ['max-ms'], { share: 0.10, cap: 90000 }),
  stepOf('frontier', 'grow/frontier.mjs', 'step', [], ['max-ms', 'era'], { share: 0.03, cap: 30000 }),
  stepOf('know', 'grow/know.mjs', 'shelve', [], ['max-ms', 'era'], { share: 0.03, cap: 30000 }),
  stepOf('teach', 'grow/teach.mjs', 'intake', ['gen'], [], { share: 0.05, cap: 60000 }),
  stepOf('grow', 'grow/swarm.mjs', 'grow', ['gen'], ['max-ms', 'era', 'workers'], null),
  stepOf('regate', 'grow/neo.mjs', 'regate', [], [], { share: 0.02, cap: 20000 }),
  stepOf('evolve', 'grow/evolve.mjs', 'step', [], ['max-ms', 'era'], { share: 0.06, cap: 60000 }),
  stepOf('measure', 'grow/measure.mjs', 'run', ['era'], ['max-ms'], { share: 0.10, cap: 60000 }),
]);
/** SHIP's slot (git add, commit, push, a rebase): kept at the end of every era. */
export const SHIP_SLOT = Object.freeze({ share: 0.04, cap: 30000 });
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
  '  run [--max-ms ' + DEFAULTS.maxMs + '] [--max-eras 0 (no cap)] [--workers <w>] [--commit [--no-push]] [--backend here|vercel] [--dry]',
  '      one era after another: ' + STEPS.map((s) => s.name).join(', ') + ', ship (with --commit); refused on a PC (exit 4)',
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
  return { doc: { ...U, era: Math.max(topOf(U), ...renumbered.map((r) => r.era)), eras, lastGrown, idle: M.idle }, map };
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
 * failed to push stays). The commit holds neo/ and grown/ and nothing else, whatever else the index holds.
 * @returns {{ committed: true | false | 'nothing to commit', pushed: true | false | string, blocked: string[], renumbered: object[] }}
 */
export function ship(root, { era, cells = null, mastered = null, noPush = false, env = process.env, git = gitOf(root, env) } = {}) {
  const blocked = [];
  const nothing = { committed: 'nothing to commit', pushed: 'skipped: nothing committed', blocked, renumbered: [] };
  const paths = shipPaths(root);
  if (!paths.length) return nothing;
  const add = git(['add', '--', ...paths]);
  if (add.code !== 0) { blocked.push('ship: git add exited ' + add.code + ': ' + why1(add)); return { committed: false, pushed: 'skipped: nothing committed', blocked, renumbered: [] }; }
  if (git(['diff', '--cached', '--quiet', '--', ...paths]).code === 0) return nothing;
  let tasks = null;
  try { tasks = ledgerTasks(root).tasks.length; } catch { tasks = null; }
  const id = identity(git);
  const cm = git([...id.args, 'commit', '-q', '-m', commitMessage(era, tasks, cells, mastered), '-m', TRAILER, '--', ...paths]);
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
 * grow ends at deadline - after.grow, so the time a step before it does not use goes to growing.
 */
export function planEra(left) {
  const L = Math.max(0, Math.floor(Number(left) || 0));
  const slots = {};
  for (const s of STEPS) if (s.slot) slots[s.name] = Math.min(s.slot.cap, Math.floor(L * s.slot.share));
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
  const val = { gen: ctx.g, era: ctx.e, 'max-ms': ctx.maxMs, workers: ctx.workers };
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
  if (!BACKENDS.includes(backend)) throw new Fail('--backend is ' + BACKENDS.join(' or ') + ', not ' + backend, 2);
  if (!Number.isInteger(maxMs) || maxMs < 1) throw new Fail('--max-ms is an integer from 1, not ' + maxMs, 2);
  if (!Number.isInteger(maxEras) || maxEras < 0) throw new Fail('--max-eras is an integer from 0 (no cap), not ' + maxEras, 2);
  if (workers !== null && (!Number.isInteger(workers) || workers < WORKERS.min || workers > WORKERS.max)) throw new Fail('--workers is an integer from ' + WORKERS.min + ' to ' + WORKERS.max + ', not ' + workers, 2);
  if (noPush && !commit) throw new Fail('--no-push needs --commit', 2);
  const here = allowedHere(env);
  if (dry) return dryRun(root, { maxMs, maxEras, workers, commit, noPush, backend, here, now, procs, pid, env });
  if (!here.ok) throw new Fail(PC_REFUSAL + ' (--backend ' + backend + ')', 4);
  const inFlight = finishesInFlight(root, procs, pid);
  if (inFlight.length) throw new Fail('a generation finish is in flight in this checkout (pid ' + inFlight.join(', ') + '): no era runs beside it', 1);
  const doc = readEra(root); // a malformed file fails before the lock is taken
  const lock = takeLock(root, { now, pid });
  const beat = setInterval(() => refreshLock(root, lock, now), 60000);
  if (typeof beat.unref === 'function') beat.unref();
  try {
    return await burn(root, { doc, maxMs, maxEras, workers, commit, noPush, env, now, exec, procs, pid, lock, git: git || gitOf(root, env) });
  } finally { clearInterval(beat); releaseLock(root, lock); }
}

async function burn(root, o) {
  const { maxMs, maxEras, workers, commit, noPush, env, now, procs, pid, lock, git } = o;
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
    const r = await oneEra(root, { doc, deadline, workers, env, now, exec, lock, cache, body });
    const row = r.row;
    row.blocked.unshift(...pre);
    // SHIP: an idle era is committed only when it starts a streak (the record of the plateau), never again and again
    const idleSkip = commit && row.idle && r.idle > 1;
    if (idleSkip) row.shipped = 'skipped: idle ' + r.idle + ' eras in a row';
    doc = appendEra(doc, row, r.lastGrown, r.idle);
    writeJson(path.join(root, ERA_FILE), doc); // before SHIP: the commit carries this era
    if (commit && !idleSkip) {
      const s = ship(root, { era: row.era, cells: row.cells, mastered: row.mastered, noPush, env, git });
      row.shipped = s.committed === true ? (s.pushed === true ? 'pushed' : 'committed') : s.committed === false ? 'failed' : 'nothing to commit';
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
    }
    rows.push(row);
    if (doc.idle >= IDLE_STOP) { stop = 'idle'; break; }
  }
  const last = rows[rows.length - 1];
  const abs = rows.map((r) => r.absorbed).filter(Boolean);
  const ops = rows.map((r) => r.opened).filter(Boolean);
  const gen = total(rows.map((r) => r.velocity.generated)), growMs = total(rows.map((r) => r.velocity.growMs));
  const grownN = rows.reduce((n, r) => n + r.grown.length, 0);
  const mpe = rows.map((r) => r.velocity.masteredPerEra).filter((x) => typeof x === 'number');
  return {
    eras: rows.length, era: doc.era, ms: now() - t0, body, workers: last.workers,
    absorbed: abs.length ? { bytes: total(abs.map((x) => x.bytes)), tasks: total(abs.map((x) => x.tasks)), rows: total(abs.map((x) => x.rows)) } : null,
    opened: ops.length ? ops.reduce((n, x) => n + x.length, 0) : null,
    grown: grownN, cells: last.cells, mastered: last.mastered, idle: doc.idle, committed, pushed,
    velocity: {
      cellsPerSecond: gen !== null && growMs ? Math.round(gen / (growMs / 1000)) : null,
      tasksPerMinute: growMs ? round2(grownN / (growMs / 60000)) : null,
      masteredPerEra: mpe.length ? round2(mpe.reduce((a, b) => a + b, 0) / mpe.length) : null,
      eraMs: Math.round(rows.reduce((n, r) => n + r.ms, 0) / rows.length), workers: last.workers,
    },
    skipped: [...new Set(rows.flatMap((r) => r.skipped))],
    blocked: [...rows.flatMap((r) => r.blocked.map((b) => 'era ' + r.era + ': ' + b)), ...tail],
    stop, lock: lock.replaced ? 'took over a stale lock (pid ' + show(lock.replaced.pid) + ', ' + lock.replaced.at + ')' : 'taken',
  };
}

/** One era: the steps of STEPS in order, each bounded; the row (not yet written), lastGrown and the idle count. */
async function oneEra(root, o) {
  const { doc, deadline, workers, env, now, exec, lock, cache, body } = o;
  const e = doc.era + 1, g = nextGeneration(root), started = now(), plan = planEra(deadline - started);
  const blocked = [], skipped = [], steps = {};
  const records = recordPatterns(root);
  const before = fingerprint(root, { cache, records });
  const colsBefore = colonies(root);
  const masteredBefore = masteredCount(colsBefore);
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
  // 1. ABSORB
  let absorbed = null;
  const a = note(await runStep(S.absorb));
  if (a) {
    absorbed = { bytes: numOr(a.bytes), tasks: numOr(a.tasks), rows: numOr(a.rows) };
    for (const b of Array.isArray(a.blocked) ? a.blocked : []) blocked.push('absorb: ' + redact(typeof b === 'string' ? b : JSON.stringify(b)));
  }
  // 2. FRONTIER, 3. KNOW (their lines are their own record; the era names only what failed)
  note(await runStep(S.frontier));
  note(await runStep(S.know));
  // 4. TEACH: intake opens what absorb and the teacher arms wrote
  let opened = null;
  const op = note(await runStep(S.teach));
  if (op && Array.isArray(op.opened)) opened = op.opened.map(String);
  else if (op) blocked.push('teach: node ' + S.teach.script + ' intake printed no opened list');
  // 5. GROW: the swarm's parallel workers; the era's own task-by-task loop when grow/swarm.mjs is not on disk
  const grown = [], lastGrown = { ...doc.lastGrown };
  let nWorkers = null, generated = null;
  const tGrow = now();
  if (fs.existsSync(path.join(root, S.grow.script))) {
    const sw = note(await runStep(S.grow));
    if (sw) {
      nWorkers = Number.isInteger(sw.workers) ? sw.workers : null;
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
      const order = growOrder(led.tasks.filter((t) => !isMastered(colsBefore, t)), lastGrown);
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
  const growMs = steps.grow ?? (now() - tGrow);
  // 6. REGATE, 7. EVOLVE
  note(await runStep(S.regate));
  note(await runStep(S.evolve));
  // 8. MEASURE
  let cells = null;
  const m = note(await runStep(S.measure));
  if (m) { cells = isObj(m.neo) ? numOr(m.neo.cells) : null; if (cells === null) blocked.push('measure: its line holds no neo.cells'); }
  const mastered = masteredCount(colonies(root));
  // PLATEAU: what changed under neo/ and grown/ but the records
  const changed = changedPaths(before, fingerprint(root, { cache, records }));
  const idle = changed.length === 0;
  const idleCount = idle ? doc.idle + 1 : 0;
  const ms = now() - started;
  const row = {
    era: e, at: iso(started), ms, body, workers: nWorkers, absorbed, opened, grown, cells, mastered,
    velocity: {
      cellsPerSecond: generated !== null && growMs > 0 ? Math.round(generated / (growMs / 1000)) : null,
      tasksPerMinute: growMs > 0 ? round2(grown.length / (growMs / 60000)) : null,
      masteredPerEra: mastered !== null && masteredBefore !== null ? mastered - masteredBefore : null,
      eraMs: ms, workers: nWorkers, generated, tasks: grown.length, growMs,
    },
    changed: changed.length, idle, steps, skipped, blocked,
  };
  return { row, lastGrown, idle: idleCount };
}

/** --dry: what one era would run, in order, and nothing run, nothing written (on a PC too: it runs nothing). */
function dryRun(root, { maxMs, maxEras, workers, commit, noPush, backend, here, now, procs, pid, env }) {
  const doc = readEra(root);
  const e = doc.era + 1, g = nextGeneration(root), notes = [], plan = planEra(maxMs);
  let order = [], mastered = [];
  try {
    const led = ledgerTasks(root), cols = colonies(root);
    mastered = led.tasks.filter((t) => isMastered(cols, t));
    order = growOrder(led.tasks.filter((t) => !isMastered(cols, t)), doc.lastGrown);
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
    would.push('node ' + s.script + ' ' + argsOf(s, { g, e, maxMs: toldMs(slot), workers: s.name === 'grow' ? workers : null }, root, true).join(' '));
  }
  if (commit) {
    const ps = SHIP_PATHS.join(' ');
    would.push('git add -- ' + ps, 'git commit -m "' + commitMessage(e, '<tasks>', '<cells>', '<mastered>') + '" -m "' + TRAILER + '" -- ' + ps, ...(noPush ? [] : ['git push (a rebase onto the remote and again when it moved, at most ' + PUSH_TRIES + ' pushes)']));
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
const VALUE = new Set(['max-ms', 'max-eras', 'workers', 'backend', 'root']);
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
      maxMs: intOf(flags, 'max-ms', 1, DEFAULTS.maxMs), maxEras: intOf(flags, 'max-eras', 0, DEFAULTS.maxEras), workers,
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
