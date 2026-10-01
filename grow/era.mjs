#!/usr/bin/env node
// grow/era.mjs: THE ERA (grow/NEO.md, "Order 7: always burning", ERA). His words (2026-10-01, verbatim at the head of
// NEO.md): "in a sandboxed simulated environment to go all the way to the Ai age the next, and then more and more ... not
// in the way humans evolve", "always on in the background", "All native btw, its ai data center in ur pocket, none of that
// ollama crap". An ERA is one full round the organism runs BY ITSELF with no model call: ABSORB (grow/absorb.mjs pull),
// OPEN (grow/teach.mjs intake), GROW (grow/neo.mjs grow, every ledger task, the least recently grown first, a mastered
// task skipped, until the era's share of the clock is spent, at least one task an era), MEASURE (grow/measure.mjs run),
// SHIP (with --commit: neo/ and grown/ in one commit as jayden with the cortex trailer, then pushHead). Every step is a
// child process of this tree's own verbs: a step that fails is a blocked line and the era goes on. A cloud run burns eras
// back to back until its clock (--max-ms) is spent, its cap (--max-eras) is reached, or an era found nothing to do.
// neo/ERA.json keeps the last 200 eras (the count `era` never resets) and lastGrown, the era each task was last grown in.
// It refuses to run on a PC exactly as grow/sandbox.mjs does for --backend here (exit 4 unless CLAUDE_CODE_REMOTE,
// GITHUB_ACTIONS, VERCEL or CI is set; both backends: an era's steps are children of THIS machine whatever the backend),
// so nothing an absorbed byte produces runs on his PC. It takes work/grow/era.lock (pid and time; older than 30 minutes is
// stale) and never runs while a generation's finish is in flight in this checkout (seen in /proc on a Linux VM; finish is
// not asked to know). --dry lists what it would run and runs nothing, anywhere. It never opens state/, judge/heldout/,
// judge/control.jsonl or any neo/tasks/*/heldout.jsonl, never edits judge/ or grow/contract.mjs, and calls no model.
// Success prints ONE JSON line; a failure one stderr line and a non-zero exit (1 failure, 2 usage, 4 refused on a PC).
//   node grow/era.mjs run [--max-ms 480000] [--max-eras 0] [--commit [--no-push]] [--backend here|vercel] [--dry]
//   node grow/era.mjs status                                     [--root <dir>] on both verbs
// Author: Opus 5.5 builder (ERA) for the Fable 5.1 orchestrator, 2026-10-01, his Order 7.
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nextGeneration, pushHead, TRAILER, redact, DEFAULT_ROOT, CLOUD_ENV, runNode, lastJson, lastLine, why1 } from './generation.mjs';
import { readLedger, TASK_RE } from './teach.mjs';

export const ERA_FILE = 'neo/ERA.json';
export const LOCK = 'work/grow/era.lock';
export const MEASURE_FILE = 'grown/measure.jsonl';
/** What SHIP adds and commits (the measure file lives in grown/; a path not on disk is left out of the git call). */
export const SHIP_PATHS = Object.freeze(['neo/', 'grown/', MEASURE_FILE]);
/** The eras neo/ERA.json keeps; the count `era` never resets. */
export const KEEP = 200;
export const STALE_MS = 30 * 60000;
export const DEFAULTS = Object.freeze({ maxMs: 480000, maxEras: 0, backend: 'here' });
export const BACKENDS = Object.freeze(['here', 'vercel']);
/** MEASURE and SHIP keep the last part of the budget: min(ms, maxMs / share). GROW starts no task past it but the first. */
export const RESERVE = Object.freeze({ ms: 60000, share: 4 });
/** A child's timeout: what is left of the budget, never under this floor. */
export const CHILD_FLOOR_MS = 120000;
/** The four children, by step: this tree's own verbs. */
export const STEPS = Object.freeze({ absorb: 'grow/absorb.mjs', open: 'grow/teach.mjs', grow: 'grow/neo.mjs', measure: 'grow/measure.mjs' });
export const PC_REFUSAL = 'an era never runs on his PC: its steps run what absorbed bytes produce as children of this machine (grow/sandbox.mjs --backend here rule); allowed only when ' + CLOUD_ENV.slice(0, -1).join(', ') + ' or ' + CLOUD_ENV[CLOUD_ENV.length - 1] + ' is set';
export const FALLBACK_EMAIL = 'j4ydenlxl@users.noreply.github.com';
export const USAGE = [
  'usage: node grow/era.mjs <verb> [flags]   (--root <dir>: another tree root)',
  '  run [--max-ms ' + DEFAULTS.maxMs + '] [--max-eras 0 (no cap)] [--commit [--no-push]] [--backend here|vercel] [--dry]',
  '      one era after another: absorb, open, grow, measure, ship (with --commit); refused on a PC (exit 4)',
  '  status                                     the head of ' + ERA_FILE,
].join('\n');

class Fail extends Error { constructor(line, code = 1) { super(line); this.code = code; } }

// ---- helpers
const isObj = (o) => Boolean(o) && typeof o === 'object' && !Array.isArray(o);
const first = (e) => String((e && e.message) || e).split('\n')[0];
const numOr = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const writeJson = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n'); };
const iso = (ms) => new Date(ms).toISOString();
const show = (v) => (v === null || v === undefined ? '?' : String(v));
const scoreOf = (h) => (isObj(h) ? { ok: numOr(h.ok), n: numOr(h.n), score: numOr(h.score) } : null);

/** The commit message of one era: `era <e>: <tasks> tasks, <cells> cells, <mastered> mastered` (an unmeasured count is ?). */
export const commitMessage = (era, tasks, cells, mastered) => 'era ' + era + ': ' + show(tasks) + ' tasks, ' + show(cells) + ' cells, ' + show(mastered) + ' mastered';

/** The argv of one step's child (after the script). */
export function stepArgs(step, { root, g, e, task }) {
  if (step === 'absorb') return ['pull', '--gen', String(g), '--root', root];
  if (step === 'open') return ['intake', '--gen', String(g), '--root', root];
  if (step === 'grow') return ['grow', '--task', String(task), '--gen', String(g), '--root', root];
  if (step === 'measure') return ['run', '--era', String(e), '--root', root];
  throw new Error('no step ' + step);
}

/** May an era run here? Only on a cloud VM: one of CLOUD_ENV (grow/sandbox.mjs's names) set. */
export function allowedHere(env = process.env) {
  const c = CLOUD_ENV.find((k) => env[k]);
  return c ? { ok: true, why: c + ' is set: this VM runs the era' } : { ok: false, why: PC_REFUSAL };
}

// ---- neo/ERA.json, the ledger's tasks, the colonies
/**
 * neo/ERA.json as { era, eras, lastGrown } (every other key kept for the write back). A missing file is era 0; a file that
 * is not that shape fails (a rewrite would erase the eras it holds): a human session repairs it.
 */
export function readEra(root) {
  const f = path.join(root, ERA_FILE);
  let text;
  try { text = fs.readFileSync(f, 'utf8'); } catch (e) {
    if (e && e.code === 'ENOENT') return { era: 0, eras: [], lastGrown: {} };
    throw new Fail(ERA_FILE + ' cannot be read (' + first(e) + ')', 1);
  }
  let doc;
  try { doc = JSON.parse(text); } catch (e) { throw new Fail(ERA_FILE + ' is not JSON (' + first(e) + '): a human session repairs it', 1); }
  if (!isObj(doc) || !Number.isInteger(doc.era) || doc.era < 0 || !Array.isArray(doc.eras)) throw new Fail(ERA_FILE + ' is not { era, eras: [..], lastGrown }: a human session repairs it', 1);
  const top = doc.eras.reduce((m, r) => (isObj(r) && Number.isInteger(r.era) && r.era > m ? r.era : m), doc.era);
  return { ...doc, era: top, lastGrown: isObj(doc.lastGrown) ? { ...doc.lastGrown } : {} };
}

/** The document after one more era: the row appended, the last KEEP rows kept, lastGrown replaced. */
export function appendEra(doc, row, lastGrown) {
  return { ...doc, era: row.era, eras: [...doc.eras, row].slice(-KEEP), lastGrown };
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
  const m = /^(.+)-neo-g\d+$/.exec(String(c.id ?? ''));
  return m ? m[1] : null;
}

/**
 * The NEO colonies grown/index.json holds: Map task -> { ok, n, score } of its held-out rows (rows with tier "neo" only;
 * the hand-grown cells are never a task's colony). No index is no colony; an index that is not JSON is null (unknown).
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
    if (t) out.set(t, scoreOf(c.heldout));
  }
  return out;
}
const isMastered = (cols, t) => Boolean(cols && cols.has(t) && cols.get(t) && cols.get(t).score === 1);

/** The grow order: the least recently grown first (never grown before all), ties in ledger order. */
export function growOrder(tasks, lastGrown) {
  const at = (t) => (Object.hasOwn(lastGrown, t) && Number.isInteger(lastGrown[t]) ? lastGrown[t] : -1);
  return tasks.map((t, i) => ({ t, i, at: at(t) })).sort((a, b) => (a.at - b.at) || (a.i - b.i)).map((x) => x.t);
}

// ---- the lock (work/grow/era.lock: pid and time) and a finish in flight
/** { state: free | held | stale, pid, at, ageMs }: the time is the lock's `at`, else the file's mtime (a lock that is not JSON). */
export function lockState(root, nowMs = Date.now()) {
  const f = path.join(root, LOCK);
  let st;
  try { st = fs.statSync(f); } catch { return { state: 'free', pid: null, at: null, ageMs: null }; }
  const j = readJson(f);
  const t = isObj(j) && typeof j.at === 'string' && Number.isFinite(Date.parse(j.at)) ? Date.parse(j.at) : st.mtimeMs;
  const ageMs = Math.round(nowMs - t);
  return { state: ageMs > STALE_MS ? 'stale' : 'held', pid: isObj(j) && Number.isInteger(j.pid) ? j.pid : null, at: iso(t), ageMs, token: isObj(j) ? j.token ?? null : null };
}

/**
 * Take the lock: created exclusively; a held one refuses (exit 1), a stale one is replaced and named.
 * @returns {{ token: string, pid: number, replaced: null | { pid, at } }}
 */
export function takeLock(root, { now = Date.now, pid = process.pid } = {}) {
  const f = path.join(root, LOCK);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const token = randomBytes(8).toString('hex');
  let replaced = null;
  for (let i = 0; i < 2; i++) {
    try {
      fs.writeFileSync(f, JSON.stringify({ pid, at: iso(now()), token }) + '\n', { flag: 'wx' });
      return { token, pid, replaced };
    } catch (e) {
      if (!e || e.code !== 'EEXIST') throw e;
      const s = lockState(root, now());
      if (s.state !== 'stale') throw new Fail(LOCK + ' is held by pid ' + show(s.pid) + ' since ' + s.at + ': another era runs in this checkout (a lock older than ' + STALE_MS / 60000 + ' minutes is stale)', 1);
      replaced = { pid: s.pid, at: s.at };
      fs.rmSync(f, { force: true });
    }
  }
  throw new Fail(LOCK + ' was taken by another run while this one replaced a stale lock', 1);
}
const ownLock = (root, lock) => { const j = readJson(path.join(root, LOCK)); return isObj(j) && j.token === lock.token; };
/** A new time on our own lock (a run longer than the stale limit stays held). */
export function refreshLock(root, lock, now = Date.now) {
  if (ownLock(root, lock)) fs.writeFileSync(path.join(root, LOCK), JSON.stringify({ pid: lock.pid, at: iso(now()), token: lock.token }) + '\n');
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

// ---- SHIP: neo/ and grown/ (the measure file with them), one commit as jayden with the cortex trailer, then pushHead
/** The ship paths that are on disk (git add refuses a pathspec that matches nothing). */
export const shipPaths = (root) => SHIP_PATHS.filter((p) => fs.existsSync(path.join(root, p)));

/**
 * One era's commit. Nothing to commit is not an error; a failed add, commit or push is a blocked line (a pushed commit
 * that failed to push stays).
 * @returns {{ committed: true | false | 'nothing to commit', pushed: true | false | string, blocked: string[] }}
 */
export function ship(root, { era, cells = null, mastered = null, noPush = false, env = process.env } = {}) {
  const blocked = [];
  const git = (args) => {
    const r = spawnSync('git', args, { cwd: root, env, encoding: 'utf8', windowsHide: true, timeout: 120000 });
    return { code: typeof r.status === 'number' ? r.status : 1, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error || null };
  };
  const nothing = { committed: 'nothing to commit', pushed: 'skipped: nothing committed', blocked };
  const paths = shipPaths(root);
  if (!paths.length) return nothing;
  const add = git(['add', '--', ...paths]);
  if (add.code !== 0) { blocked.push('ship: git add exited ' + add.code + ': ' + why1(add)); return { committed: false, pushed: 'skipped: nothing committed', blocked }; }
  if (git(['diff', '--cached', '--quiet', '--', ...paths]).code === 0) return nothing;
  let tasks = null;
  try { tasks = ledgerTasks(root).tasks.length; } catch { tasks = null; }
  const email = lastLine(git(['config', 'user.email']).stdout) || FALLBACK_EMAIL;
  const cm = git(['-c', 'user.name=jayden', '-c', 'user.email=' + email, 'commit', '-m', commitMessage(era, tasks, cells, mastered), '-m', TRAILER, '--', ...paths]);
  if (cm.code !== 0) { blocked.push('ship: git commit exited ' + cm.code + ': ' + why1(cm)); return { committed: false, pushed: 'skipped: nothing committed', blocked }; }
  if (noPush) return { committed: true, pushed: 'skipped (--no-push)', blocked };
  const ps = pushHead(root, { env });
  if (!ps.ok) blocked.push('ship: push: ' + redact(ps.why) + ' (the commit stays)');
  return { committed: true, pushed: ps.ok, blocked };
}

// ---- the run: eras back to back
/** An era that absorbed no row, opened no task and grew none: the next one would do the same, so the run stops. */
export const isIdle = (r) => (!r.absorbed || (!r.absorbed.rows && !r.absorbed.tasks)) && !(r.opened && r.opened.length) && !r.grown.length;
/** The sum of the numbers among vals; null when there is none (a step that never answered is not a zero). */
const total = (vals) => { const v = vals.filter((x) => typeof x === 'number' && Number.isFinite(x)); return v.length ? v.reduce((s, x) => s + x, 0) : null; };

/**
 * Burn eras until the budget is spent, the cap is reached, an era was idle or a finish started in this checkout.
 * @param {string} root the tree root
 * @param {{ maxMs?: number, maxEras?: number, commit?: boolean, noPush?: boolean, backend?: string, dry?: boolean,
 *   env?: object, now?: () => number, exec?: (script: string, args: string[], o: { env, timeout }) => { code, stdout, stderr, error },
 *   procs?: () => { pid, argv, cwd }[], pid?: number }} opts exec, now and procs replace the children, the clock and /proc (a test's)
 * @returns {object} the run line { eras, era, ms, absorbed, opened, grown, cells, mastered, committed, pushed, blocked, stop, lock }
 */
export function runEras(root, opts = {}) {
  const { maxMs = DEFAULTS.maxMs, maxEras = DEFAULTS.maxEras, commit = false, noPush = false, backend = DEFAULTS.backend, dry = false,
    env = process.env, now = Date.now, exec = null, procs = listProcs, pid = process.pid } = opts;
  if (!BACKENDS.includes(backend)) throw new Fail('--backend is ' + BACKENDS.join(' or ') + ', not ' + backend, 2);
  if (!Number.isInteger(maxMs) || maxMs < 1) throw new Fail('--max-ms is an integer from 1, not ' + maxMs, 2);
  if (!Number.isInteger(maxEras) || maxEras < 0) throw new Fail('--max-eras is an integer from 0 (no cap), not ' + maxEras, 2);
  if (noPush && !commit) throw new Fail('--no-push needs --commit', 2);
  const here = allowedHere(env);
  if (dry) return dryRun(root, { maxMs, maxEras, commit, noPush, backend, here, now, procs, pid });
  if (!here.ok) throw new Fail(PC_REFUSAL + ' (--backend ' + backend + ')', 4);
  const inFlight = finishesInFlight(root, procs, pid);
  if (inFlight.length) throw new Fail('a generation finish is in flight in this checkout (pid ' + inFlight.join(', ') + '): no era runs beside it', 1);
  const doc = readEra(root); // a malformed file fails before the lock is taken
  const lock = takeLock(root, { now, pid });
  try {
    return burn(root, { doc, maxMs, maxEras, commit, noPush, env, now, exec, procs, pid, lock });
  } finally { releaseLock(root, lock); }
}

function burn(root, o) {
  const { maxMs, maxEras, commit, noPush, env, now, procs, pid, lock } = o;
  let doc = o.doc;
  const exec = o.exec || ((script, args, x) => runNode(root, script, args, x));
  const t0 = now(), deadline = t0 + maxMs;
  const growEnd = deadline - Math.min(RESERVE.ms, Math.floor(maxMs / RESERVE.share));
  const step = (label, script, args) => {
    if (!fs.existsSync(path.join(root, script))) return { ok: false, why: label + ': ' + script + ' is not on disk' };
    const r = exec(script, args, { env, timeout: Math.max(CHILD_FLOOR_MS, deadline - now()) });
    const cmd = 'node ' + script + ' ' + args[0];
    if (r.code !== 0) return { ok: false, why: label + ': ' + cmd + ' exited ' + r.code + ': ' + why1(r) };
    const j = lastJson(r.stdout);
    if (!isObj(j)) return { ok: false, why: label + ': ' + cmd + ' printed no JSON line' };
    return { ok: true, j };
  };
  const rows = [], tail = [];
  let committed = commit ? 0 : 'skipped (no --commit)';
  let pushed = !commit ? 'skipped (no --commit)' : noPush ? 'skipped (--no-push)' : 0;
  let stop = null;
  for (;;) {
    if (maxEras && rows.length >= maxEras) { stop = 'max-eras'; break; }
    if (rows.length) {
      if (now() >= growEnd) { stop = 'budget'; break; }
      const f = finishesInFlight(root, procs, pid);
      if (f.length) { stop = 'finish'; tail.push('a generation finish is in flight in this checkout (pid ' + f.join(', ') + '): no further era'); break; }
      refreshLock(root, lock, now);
    }
    const e = doc.era + 1, g = nextGeneration(root), started = now(), blocked = [];
    // 1. ABSORB
    let absorbed = null;
    const a = step('absorb', STEPS.absorb, stepArgs('absorb', { root, g }));
    if (a.ok) {
      absorbed = { bytes: numOr(a.j.bytes), tasks: numOr(a.j.tasks), rows: numOr(a.j.rows) };
      for (const b of Array.isArray(a.j.blocked) ? a.j.blocked : []) blocked.push('absorb: ' + redact(typeof b === 'string' ? b : JSON.stringify(b)));
    } else blocked.push(a.why);
    // 2. OPEN
    let opened = null;
    const op = step('open', STEPS.open, stepArgs('open', { root, g }));
    if (op.ok && Array.isArray(op.j.opened)) opened = op.j.opened.map(String);
    else blocked.push(op.ok ? 'open: node ' + STEPS.open + ' intake printed no opened list' : op.why);
    // 3. GROW: the least recently grown first, a mastered task skipped, until the era's share of the clock is spent
    const grown = [], lastGrown = { ...doc.lastGrown };
    let led = null;
    try { led = ledgerTasks(root); } catch (err) { blocked.push('grow: ' + redact(first(err))); }
    if (led) {
      for (const t of led.bad) blocked.push('grow: the ledger task ' + JSON.stringify(t) + ' is not a task name: not grown');
      const cols = colonies(root);
      if (cols === null) blocked.push('grow: grown/index.json is not JSON: no task is skipped as mastered');
      const order = growOrder(led.tasks.filter((t) => !isMastered(cols, t)), lastGrown);
      for (const [i, t] of order.entries()) {
        if (i > 0 && now() >= growEnd) break; // at least one task an era
        lastGrown[t] = e; // tried counts as grown: a task that always fails never starves the ring
        const r = step('grow: ' + t, STEPS.grow, stepArgs('grow', { root, g, task: t }));
        if (!r.ok) { blocked.push(r.why); continue; }
        grown.push({ task: t, generated: numOr(r.j.generated), kept: numOr(r.j.kept), promoted: typeof r.j.promoted === 'boolean' ? r.j.promoted : null, heldout: scoreOf(r.j.heldout), baseline: scoreOf(r.j.baseline) });
      }
    }
    // 4. MEASURE
    let cells = null;
    const m = step('measure', STEPS.measure, stepArgs('measure', { root, e }));
    if (m.ok) { cells = isObj(m.j.neo) ? numOr(m.j.neo.cells) : null; if (cells === null) blocked.push('measure: its line holds no neo.cells'); }
    else blocked.push(m.why);
    const cols = colonies(root);
    const mastered = cols === null ? null : [...cols.keys()].filter((t) => isMastered(cols, t)).length;
    const row = { era: e, at: iso(started), ms: now() - started, absorbed, opened, grown, cells, mastered, blocked };
    doc = appendEra(doc, row, lastGrown);
    writeJson(path.join(root, ERA_FILE), doc); // before SHIP: the commit carries this era
    // 5. SHIP
    if (commit) {
      const s = ship(root, { era: e, cells, mastered, noPush, env });
      if (s.committed === true) committed++;
      if (s.pushed === true) pushed++;
      if (s.blocked.length) { row.blocked.push(...s.blocked); writeJson(path.join(root, ERA_FILE), doc); }
    }
    rows.push(row);
    if (isIdle(row)) { stop = 'idle'; break; }
  }
  const last = rows[rows.length - 1];
  const abs = rows.map((r) => r.absorbed).filter(Boolean);
  const ops = rows.map((r) => r.opened).filter(Boolean);
  return {
    eras: rows.length, era: doc.era, ms: now() - t0,
    absorbed: abs.length ? { bytes: total(abs.map((x) => x.bytes)), tasks: total(abs.map((x) => x.tasks)), rows: total(abs.map((x) => x.rows)) } : null,
    opened: ops.length ? ops.reduce((n, x) => n + x.length, 0) : null,
    grown: rows.reduce((n, r) => n + r.grown.length, 0),
    cells: last.cells, mastered: last.mastered, committed, pushed,
    blocked: [...rows.flatMap((r) => r.blocked.map((b) => 'era ' + r.era + ': ' + b)), ...tail],
    stop, lock: lock.replaced ? 'took over a stale lock (pid ' + show(lock.replaced.pid) + ', ' + lock.replaced.at + ')' : 'taken',
  };
}

/** --dry: what one era would run, in order, and nothing run, nothing written (on a PC too: it runs nothing). */
function dryRun(root, { maxMs, maxEras, commit, noPush, backend, here, now, procs, pid }) {
  const doc = readEra(root);
  const e = doc.era + 1, g = nextGeneration(root), notes = [];
  let order = [], mastered = [];
  try {
    const led = ledgerTasks(root), cols = colonies(root);
    mastered = led.tasks.filter((t) => isMastered(cols, t));
    order = growOrder(led.tasks.filter((t) => !isMastered(cols, t)), doc.lastGrown);
  } catch (err) { notes.push('grow: ' + redact(first(err))); }
  const cmd = (s, a = {}) => 'node ' + STEPS[s] + ' ' + stepArgs(s, { root, g, e, ...a }).join(' ');
  const would = [cmd('absorb'), cmd('open'), ...order.map((t) => cmd('grow', { task: t })), cmd('measure')];
  if (commit) {
    const ps = SHIP_PATHS.join(' ');
    would.push('git add -- ' + ps, 'git commit -m "' + commitMessage(e, '<tasks>', '<cells>', '<mastered>') + '" -m "' + TRAILER + '" -- ' + ps, ...(noPush ? [] : ['git push (pushHead)']));
  }
  return {
    dry: true, era: e, generation: g, backend, allowed: here.ok, why: here.why, lock: lockState(root, now()).state,
    inFlight: finishesInFlight(root, procs, pid), maxMs, maxEras, would, mastered, blocked: notes, at: iso(now()),
  };
}

/** status: the head of neo/ERA.json and the lock. */
export function status(root, { now = Date.now } = {}) {
  const doc = readEra(root);
  const l = lockState(root, now());
  return {
    era: doc.era, eras: doc.eras.length, last: doc.eras.length ? doc.eras[doc.eras.length - 1] : null, lastGrown: doc.lastGrown,
    lock: l.state === 'free' ? 'free' : l.state + ' (pid ' + show(l.pid) + ', ' + l.at + ')',
  };
}

// ---- arguments and main
const VALUE = new Set(['max-ms', 'max-eras', 'backend', 'root']);
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
    return runEras(root, {
      maxMs: intOf(flags, 'max-ms', 1, DEFAULTS.maxMs), maxEras: intOf(flags, 'max-eras', 0, DEFAULTS.maxEras),
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
