#!/usr/bin/env node
// grow/swarm.mjs: THE SWARM (grow/NEO.md, ERA; contract c1 "swarm grow", contract c3 STAGE). The grow step of an era,
// many tasks at once: the tasks of neo/LEDGER.json in the order that needs growing most (a mastered task skipped, the
// least recently grown first, the lowest held-out score next, then ledger order), W worker processes at a time (default
// every core, at least 1, at most 8), each `node grow/neo.mjs grow --task <t> --gen <g> --stage <dir>` with its own
// deadline and its whole process tree killed when it runs over. The workers only READ the tree; each writes one file
// <dir>/<task>.json into a stage directory outside the tree. A VERIFIER checks every staged file before anything lands
// (it parses, it names its own task, its colony module text passes `node --check` in a child), and only then
// `node grow/neo.mjs merge --stage <dir>` applies what passed, serially, one child a file (each timed and named on its
// own; none starts while the time left is under the guard, so no merge is killed while it writes grown/). ROUNDS: the
// serial merge is the throughput limit, so a round admits no more tasks than its merges have time for (MERGE_FILE_MS a
// file until the run measures its own), and the time a round leaves goes to the next. A worker that dies, hangs or
// stages a bad file costs only its own task (named in `refused`); the others land.
// FEATURE-DETECTED: when `node grow/neo.mjs status` features lack "stage" (the engine has not landed contract c3), the
// swarm grows task by task in the tree, one child at a time, exactly as the era did before it ("fallback":"serial").
// It never opens state/, judge/ or any neo/tasks/*/heldout.jsonl (the engine's children score them), calls no model and
// writes nothing itself under the tree: the stage and the verifier's scratch live under the OS temp dir and are removed.
// Success prints ONE JSON line (tasks, workers, grown, cells, mastered, ms, cellsPerSecond, refused, fallback, rounds,
// merge { files, ms, slowest } and the per-task results); a failure one stderr line and a non-zero exit (1 failure, 2 usage).
//   node grow/swarm.mjs grow [--max-ms 300000] [--workers <w>] [--gen <g>] [--era <e>] [--root <dir>]
// Author: Opus 5.5 builder (ERA) for the Fable 5.1 orchestrator, 2026-10-01, his Order 7.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nextGeneration, redact, DEFAULT_ROOT, lastJson } from './generation.mjs';
import { runChild, runProc, readEra, ledgerTasks, colonies, isMastered, masteredCount, isObj, scoreOf, whyOf, Fail } from './era.mjs';

export const ENGINE = 'grow/neo.mjs';
export const DEFAULT_MS = 300000;
/** --workers: an integer in this range; the default is every core, at least 1, at most DEFAULT_MAX. */
export const WORKERS = Object.freeze({ min: 1, max: 64 });
export const DEFAULT_MAX = 8;
/** One worker's own deadline is at most this (a hung task never holds a worker for the whole era). */
export const PER_TASK_CAP_MS = 240000;
/** No worker starts with less than this before the grow ends (the first task of a run always starts). */
export const MIN_TASK_MS = 2000;
/** The engine's spawn budget when it is told none (grow/neo.mjs BUDGET.maxMs); a worker with less time is told less. */
export const SPAWN_DEFAULT_MS = 60000;
/** The share of a worker's time its spawn search is told (the rest selects, compiles, stages). */
export const SPAWN_SHARE = 0.6;
/** The most of a round's budget its merges may hold: a round admits no more tasks than that can merge. */
export const MERGE_SHARE = 0.5;
/**
 * The planned cost of merging one staged file (one child each) until this run measured its own mean (20 real one-file
 * merges on a copy of the tree printed a mean of 4829 ms wall, 19 of them under 12000 ms, the slowest 30226 ms).
 */
export const MERGE_FILE_MS = 5000;
/** No file's merge starts with less time left than this, or 1.5 times the slowest merge of the run when that is more. */
export const MERGE_GUARD_MS = 12000;
/** A measured mean cost per file is never taken below this. */
export const MIN_FILE_MS = 500;
export const STATUS_MS = 30000;
export const CHECK_MS = 30000;
/** Where a staged file may carry its colony's module text (the first present wins): itself, its colony, its result. */
export const MODULE_KEYS = Object.freeze(['module', 'moduleText', 'source']);
export const USAGE = [
  'usage: node grow/swarm.mjs grow [flags]   (--root <dir>: another tree root)',
  '  grow [--max-ms ' + DEFAULT_MS + '] [--workers <w> (default every core, at most ' + DEFAULT_MAX + ')] [--gen <g> (default the next generation)] [--era <e>]',
  '      the unmastered tasks of neo/LEDGER.json, W at a time through ' + ENGINE + ' grow --stage, verified, then ' + ENGINE + ' merge one child a file,',
  '      in rounds that admit no more tasks than the merges have time for;',
  '      task by task in the tree when ' + ENGINE + ' status features lack "stage" ("fallback":"serial")',
].join('\n');

const numOr = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const first = (e) => String((e && e.message) || e).split('\n')[0];
const sum = (xs) => xs.reduce((s, x) => s + (typeof x === 'number' && Number.isFinite(x) ? x : 0), 0);

/** The default pool: every core this process may use, at least 1, at most DEFAULT_MAX. */
export function defaultWorkers(n = typeof os.availableParallelism === 'function' ? os.availableParallelism() : os.cpus().length) {
  const k = Number.isInteger(n) ? n : 1;
  return Math.max(WORKERS.min, Math.min(DEFAULT_MAX, k));
}

/**
 * The swarm's order: mastered tasks (the engine's rule, era.mjs masteredRow) left out; the least recently grown first
 * (never grown before all), then the lowest held-out score (no colony before any), then ledger order.
 * @returns {{ order: string[], mastered: string[] }}
 */
export function swarmOrder(tasks, lastGrown = {}, cols = new Map()) {
  const mastered = tasks.filter((t) => isMastered(cols, t));
  const at = (t) => (Object.hasOwn(lastGrown, t) && Number.isInteger(lastGrown[t]) ? lastGrown[t] : -1);
  const sc = (t) => { const c = cols && cols.get(t); return c && typeof c.score === 'number' ? c.score : -1; };
  const order = tasks.filter((t) => !isMastered(cols, t)).map((t, i) => ({ t, i, at: at(t), s: sc(t) }))
    .sort((a, b) => (a.at - b.at) || (a.s - b.s) || (a.i - b.i)).map((x) => x.t);
  return { order, mastered };
}

/**
 * The module text a staged file carries: { has, text } (has false: the stage holds no module, nothing to check). A
 * module may be the text itself or an object that holds it (grow/neo.mjs stages `module: { id, source }`, or null).
 */
export function moduleOf(j) {
  for (const o of [j, isObj(j) && isObj(j.colony) ? j.colony : null, isObj(j) && isObj(j.result) ? j.result : null]) {
    if (!isObj(o)) continue;
    for (const k of MODULE_KEYS) {
      const v = o[k];
      if (v === undefined || v === null) continue;
      if (!isObj(v)) return { has: true, text: v };
      const inner = MODULE_KEYS.find((x) => v[x] !== undefined && v[x] !== null);
      return { has: true, text: inner ? v[inner] : null };
    }
  }
  return { has: false, text: null };
}
/** The task a staged file names: its own task, else its result's. */
export const stagedTask = (j) => (isObj(j) && typeof j.task === 'string' ? j.task : isObj(j) && isObj(j.result) && typeof j.result.task === 'string' ? j.result.task : null);

/**
 * THE VERIFIER of one staged file: it parses as a JSON object, names its task, and its module text (when it carries one)
 * passes `node --check` in a child (written under checkDir, never under the tree). Nothing in it is ever run.
 * @returns {Promise<{ ok: boolean, why?: string, j?: object }>}
 */
export async function verifyStaged(file, task, { checkDir, env = process.env, timeout = CHECK_MS } = {}) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return { ok: false, why: 'the worker staged no file ' + path.basename(file) }; }
  let j;
  try { j = JSON.parse(text); } catch (e) { return { ok: false, why: 'the staged file is not JSON (' + first(e) + ')' }; }
  if (!isObj(j)) return { ok: false, why: 'the staged file is not a JSON object' };
  const named = stagedTask(j);
  if (named !== task) return { ok: false, why: 'the staged file names ' + (named === null ? 'no task' : 'the task ' + JSON.stringify(named)) + ', not ' + task };
  const m = moduleOf(j);
  if (m.has) {
    if (typeof m.text !== 'string' || !m.text.trim()) return { ok: false, why: 'the staged module is not text' };
    fs.mkdirSync(checkDir, { recursive: true });
    const f = path.join(checkDir, task + '.mjs');
    fs.writeFileSync(f, m.text);
    const r = await runProc(process.execPath, ['--check', f], { cwd: checkDir, env, timeoutMs: timeout });
    if (r.code !== 0) return { ok: false, why: 'the staged module fails node --check: ' + (r.timedOut ? 'killed after ' + timeout + ' ms' : whyOf(r)) };
  }
  return { ok: true, j, text };
}

/** The result of one task as the era records it, from the engine's line (a stage's result, a merge's row, a serial grow). */
export function resultOf(task, j, ms) {
  const o = isObj(j) ? j : {};
  return {
    task, generated: numOr(o.generated), kept: numOr(o.kept), cells: numOr(o.cells), promoted: typeof o.promoted === 'boolean' ? o.promoted : null,
    heldout: scoreOf(o.heldout), baseline: scoreOf(o.baseline), ms,
  };
}
/** The per-task rows a merge line carries (results, merged, applied or grown: objects that name a task), by task. */
export function mergeRows(line) {
  const out = new Map();
  if (!isObj(line)) return out;
  for (const k of ['results', 'merged', 'applied', 'grown']) {
    if (!Array.isArray(line[k])) continue;
    for (const r of line[k]) if (isObj(r) && typeof r.task === 'string') out.set(r.task, { ...(out.get(r.task) || {}), ...r });
  }
  return out;
}
/** The task a merge line's entry names: a task name, a file name <task>.json, or an object with a task or a file. */
export const taskOfEntry = (x) => {
  const s = typeof x === 'string' ? x : isObj(x) && typeof x.task === 'string' && x.task ? x.task : isObj(x) && typeof x.file === 'string' ? x.file : null;
  return s === null ? null : s.replace(/\.json$/, '');
};
const tasksIn = (xs) => new Set((Array.isArray(xs) ? xs : []).map(taskOfEntry).filter(Boolean));

/**
 * What one merge line says of each staged task: { refused: Map task -> why, merged: Set|null (null: the line names no
 * merged list, so every staged task it does not refuse landed), skipped, left, promoted: Set of ids or tasks|null }.
 * grow/neo.mjs prints { merged: [task], promoted: [id], refused: [{ file, task, why }], skipped: [file], left: [file] }.
 */
export function mergeVerdict(line) {
  const refused = new Map();
  for (const x of isObj(line) && Array.isArray(line.refused) ? line.refused : []) {
    const t = taskOfEntry(x);
    if (t) refused.set(t, String((isObj(x) && x.why) ?? 'refused by the merge'));
  }
  const ok = isObj(line);
  return {
    refused, merged: ok && Array.isArray(line.merged) ? tasksIn(line.merged) : null, skipped: tasksIn(ok ? line.skipped : null),
    left: tasksIn(ok ? line.left : null), promoted: ok && Array.isArray(line.promoted) ? new Set(line.promoted.filter((x) => typeof x === 'string')) : null,
  };
}

/**
 * One round's plan: at most `planned` tasks (at least 1), so the merge of every one of them fits the reserve (the guard
 * plus planned * fileMs, never over MERGE_SHARE of the budget but for the one task).
 */
export function roundPlan(budget, remaining, fileMs, guard) {
  const cap = Math.max(1, Math.floor((Math.floor(budget * MERGE_SHARE) - guard) / fileMs));
  const planned = Math.max(0, Math.min(cap, remaining));
  return { planned, reserve: guard + planned * fileMs };
}
/** The guard of the next file's merge: MERGE_GUARD_MS, or 1.5 times the slowest merge of the run when that is more. */
export const mergeGuard = (slowest, floor = MERGE_GUARD_MS) => Math.max(floor, Math.ceil(1.5 * slowest));

/** Run fn over items with at most n at once; fn returns false to leave the rest unstarted. */
async function pool(items, n, fn) {
  let next = 0, stop = false;
  const lane = async () => {
    for (;;) {
      if (stop) return;
      const k = next++;
      if (k >= items.length) return;
      if ((await fn(items[k], k)) === false) stop = true;
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(n, items.length)) }, lane));
}

/**
 * One swarm grow.
 * @param {string} root the tree
 * @param {{ maxMs?: number, workers?: number|null, gen?: number|null, era?: number|null, env?: object, now?: () => number,
 *   exec?: Function, tmp?: string, mergeFileMs?: number, mergeGuardMs?: number }} opts exec (script, args, { env, timeout })
 *   -> Promise<{ code, stdout, stderr, timedOut }> replaces the children (a test's), tmp the parent of the stage (the OS
 *   temp dir), mergeFileMs and mergeGuardMs the plan's first cost of a file and its guard floor (MERGE_FILE_MS, MERGE_GUARD_MS)
 * @returns {Promise<object>} the line
 */
export async function swarmGrow(root, opts = {}) {
  const { maxMs = DEFAULT_MS, workers = null, gen = null, era = null, env = process.env, now = Date.now, tmp = os.tmpdir(), mergeFileMs = MERGE_FILE_MS, mergeGuardMs = MERGE_GUARD_MS } = opts;
  if (!Number.isInteger(maxMs) || maxMs < 1) throw new Fail('--max-ms is an integer from 1, not ' + maxMs, 2);
  if (workers !== null && (!Number.isInteger(workers) || workers < WORKERS.min || workers > WORKERS.max)) throw new Fail('--workers is an integer from ' + WORKERS.min + ' to ' + WORKERS.max + ', not ' + workers, 2);
  if (gen !== null && (!Number.isInteger(gen) || gen < 1)) throw new Fail('--gen is an integer from 1, not ' + gen, 2);
  if (era !== null && (!Number.isInteger(era) || era < 1)) throw new Fail('--era is an integer from 1, not ' + era, 2);
  const exec = opts.exec || ((script, args, x) => runChild(root, script, args, x));
  const t0 = now(), deadline = t0 + maxMs;
  const g = gen ?? nextGeneration(root);
  const blocked = [], refused = [], results = [];
  const led = ledgerTasks(root); // a ledger that is not JSON fails the run (exit 1)
  for (const t of led.bad) blocked.push('the ledger task ' + JSON.stringify(t) + ' is not a task name: not grown');
  const cols = colonies(root);
  if (cols === null) blocked.push('grown/index.json is not JSON: no task is skipped as mastered');
  let lastGrown = {};
  try { lastGrown = readEra(root).lastGrown; } catch (e) { blocked.push('neo/ERA.json: ' + redact(first(e)) + ' (ledger order)'); }
  const { order, mastered } = swarmOrder(led.tasks, lastGrown, cols);
  const W = workers ?? defaultWorkers();
  // FEATURES: the engine's status says whether it stages (contract c3)
  let stage = false;
  if (order.length) {
    const st = await exec(ENGINE, ['status', '--root', root], { env, timeout: Math.max(1000, Math.min(STATUS_MS, deadline - now())) });
    const sj = st.code === 0 ? lastJson(st.stdout) : null;
    if (st.code !== 0 || !isObj(sj)) blocked.push('node ' + ENGINE + ' status ' + (st.code !== 0 ? 'exited ' + st.code + ': ' + whyOf(st) : 'printed no JSON line') + ': grown task by task');
    else stage = Array.isArray(sj.features) && sj.features.includes('stage');
  }
  let started = 0, rounds = 0;
  const merged = []; // the wall ms of every file's merge child, in order
  // one task's clock: its own deadline (at most PER_TASK_CAP_MS, never past the grow's end but for the run's first task)
  const clock = (growEnd) => {
    const at = now();
    if (started > 0 && growEnd - at < MIN_TASK_MS) return null;
    const timeout = Math.max(MIN_TASK_MS, Math.min(PER_TASK_CAP_MS, growEnd - at));
    return { timeout, told: Math.max(1000, Math.min(SPAWN_DEFAULT_MS, Math.floor(timeout * SPAWN_SHARE))) };
  };
  const failed = (t, r, timeout) => refused.push({ task: t, why: 'node ' + ENGINE + ' grow ' + (r.timedOut ? 'was killed at its deadline (' + timeout + ' ms)' : r.code !== 0 ? 'exited ' + r.code + ': ' + whyOf(r) : 'printed no JSON line') });
  let poolSize = 1;
  if (!stage) {
    // SERIAL: one child at a time, in the tree (the engine's own grow, as the era ran it before the swarm), no reserve
    for (const t of order) {
      const c = clock(deadline);
      if (!c) break;
      started++;
      const t1 = now();
      const r = await exec(ENGINE, ['grow', '--task', t, '--gen', String(g), '--max-ms', String(c.told), '--root', root], { env, timeout: c.timeout });
      const j = r.code === 0 ? lastJson(r.stdout) : null;
      if (r.code !== 0 || !isObj(j)) { failed(t, r, c.timeout); continue; }
      results.push(resultOf(t, j, now() - t1));
    }
  } else {
    poolSize = Math.max(1, Math.min(W, order.length));
    const base = fs.mkdtempSync(path.join(tmp, 'swarm-'));
    const dir = path.join(base, 'stage'), one = path.join(base, 'merge'), checkDir = path.join(base, 'check');
    fs.mkdirSync(dir, { recursive: true });
    const tried = new Set();
    // the merge's cost of one file: MERGE_FILE_MS until this run merged one, then the mean of its own merges
    const fileMs = () => (merged.length ? Math.max(MIN_FILE_MS, Math.ceil(sum(merged) / merged.length)) : mergeFileMs);
    const guard = () => mergeGuard(merged.length ? Math.max(...merged) : 0, mergeGuardMs);
    let broken = null; // why a merge child failed: nothing more is merged and no further round grows
    try {
      // ROUNDS: each admits no more tasks than its merges can apply (roundPlan), grows them W at a time into the stage,
      // verifies them, then merges them one child a file; the time a round leaves goes to the next round's tasks
      for (;;) {
        const rest = order.filter((t) => !tried.has(t));
        if (!rest.length) break;
        const { planned, reserve } = roundPlan(deadline - now(), rest.length, fileMs(), guard());
        const growEnd = deadline - reserve;
        const staged = new Map(); // task -> { j, text (as the verifier read it), ms }
        const before = started;
        await pool(rest.slice(0, planned), poolSize, async (t) => {
          const c = clock(growEnd);
          if (!c) return false;
          started++;
          tried.add(t);
          const t1 = now();
          const r = await exec(ENGINE, ['grow', '--task', t, '--gen', String(g), '--stage', dir, '--max-ms', String(c.told), '--root', root], { env, timeout: c.timeout });
          const file = path.join(dir, t + '.json');
          if (r.code !== 0 || r.timedOut) { failed(t, r, c.timeout); return true; }
          const v = await verifyStaged(file, t, { checkDir, env });
          if (!v.ok) { refused.push({ task: t, why: 'verifier: ' + v.why }); return true; }
          staged.set(t, { j: v.j, text: v.text, ms: now() - t1 });
          return true;
        });
        if (started === before) break; // no time left for one more task: the swarm is done
        rounds++;
        // MERGE: one child a file (the fastest grown first), so each file's merge is timed and named on its own, and none
        // starts while the time left is under the guard (a merge killed while it writes grown/ is the one thing to avoid).
        // Each merge stage holds the one file as the verifier read it: nothing else in the stage (a refused file, a killed
        // worker's late write, a stray name) ever reaches a merge
        const queue = [...staged.keys()].sort((a, b) => (staged.get(a).ms - staged.get(b).ms) || (order.indexOf(a) - order.indexOf(b)));
        for (const t of queue) {
          const s = staged.get(t);
          const left = deadline - now(), gd = guard();
          if (broken || left < gd) { refused.push({ task: t, why: 'not merged: ' + (broken || left + ' ms left, under the merge guard of ' + gd + ' ms') }); continue; }
          fs.rmSync(one, { recursive: true, force: true });
          fs.mkdirSync(one);
          fs.writeFileSync(path.join(one, t + '.json'), s.text);
          const tm = now();
          const m = await exec(ENGINE, ['merge', '--stage', one, '--root', root], { env, timeout: left });
          merged.push(now() - tm);
          const mj = m.code === 0 ? lastJson(m.stdout) : null;
          if (m.code !== 0 || !isObj(mj)) {
            const why = 'node ' + ENGINE + ' merge ' + (m.timedOut ? 'was killed at its deadline (' + left + ' ms)' : m.code !== 0 ? 'exited ' + m.code + ': ' + whyOf(m) : 'printed no JSON line');
            blocked.push(why + ' (merging ' + t + ')');
            refused.push({ task: t, why: 'not merged: ' + why });
            broken = 'an earlier merge failed (' + why + ')';
            continue;
          }
          const v = mergeVerdict(mj);
          if (v.refused.has(t)) { refused.push({ task: t, why: 'merge: ' + redact(v.refused.get(t)) }); continue; }
          if (v.merged && !v.merged.has(t)) {
            refused.push({ task: t, why: 'not merged: ' + (v.left.has(t) ? 'the merge left it' : v.skipped.has(t) ? 'the merge skipped it (that stage was merged before)' : 'the merge line does not name it') });
            continue;
          }
          const res = isObj(s.j.result) ? s.j.result : s.j;
          const row = mergeRows(mj).get(t) || {};
          // promoted: the merge's own row, else its promoted list (the staged module id, or the task), else the stage's
          const id = isObj(s.j.module) && typeof s.j.module.id === 'string' ? s.j.module.id : typeof res.id === 'string' ? res.id : null;
          const promoted = typeof row.promoted === 'boolean' ? row.promoted : v.promoted ? v.promoted.has(t) || (id !== null && v.promoted.has(id)) : res.promoted;
          results.push(resultOf(t, { ...res, ...row, promoted }, s.ms));
        }
        if (broken) break; // a merge that fails ends the swarm: no further round grows what could not be applied
      }
    } finally { fs.rmSync(base, { recursive: true, force: true }); }
  }
  const ms = now() - t0;
  const cells = sum(results.map((r) => r.generated));
  const after = colonies(root);
  return {
    tasks: started, workers: !order.length ? 0 : stage ? poolSize : 1, grown: results.length, cells, kept: sum(results.map((r) => r.kept)),
    mastered: masteredCount(after), promoted: results.filter((r) => r.promoted === true).length, ms,
    cellsPerSecond: ms > 0 ? Math.round(cells / (ms / 1000)) : null, refused, fallback: order.length && !stage ? 'serial' : null,
    rounds, merge: { files: merged.length, ms: sum(merged), slowest: merged.length ? Math.max(...merged) : 0 }, generation: g, era, queued: order.length - started, masteredSkipped: mastered.length, results, blocked,
  };
}

// ---- arguments and main
const VALUE = new Set(['max-ms', 'workers', 'gen', 'era', 'root']);
export function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { flags.help = true; continue; }
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq > 0 ? a.slice(2, eq) : a.slice(2);
    if (!VALUE.has(name)) throw new Fail('unknown flag --' + name + ' (see --help)', 2);
    const v = eq > 0 ? a.slice(eq + 1) : argv[++i];
    if (v === undefined || v === '') throw new Fail('--' + name + ' needs a value', 2);
    flags[name] = v;
  }
  return { verb: pos[0], pos: pos.slice(1), flags };
}
const intFlag = (flags, name, lo, hi = Infinity) => {
  if (flags[name] === undefined) return null;
  const v = Number(flags[name]);
  if (!Number.isInteger(v) || v < lo || v > hi) throw new Fail('--' + name + ' is an integer from ' + lo + (hi < Infinity ? ' to ' + hi : '') + ', not ' + flags[name], 2);
  return v;
};

/** The CLI as a function: the printed object, or { usage: true }. */
export async function main(argv, env = process.env) {
  const { verb, pos, flags } = parseArgs(argv);
  if (flags.help || !verb || verb === 'help') return { usage: true };
  if (pos.length) throw new Fail('unexpected argument ' + pos[0] + ' (see --help)', 2);
  if (verb !== 'grow') throw new Fail('unknown verb ' + verb + ': grow (--help)', 2);
  const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
  return swarmGrow(root, {
    maxMs: intFlag(flags, 'max-ms', 1) ?? DEFAULT_MS, workers: intFlag(flags, 'workers', WORKERS.min, WORKERS.max),
    gen: intFlag(flags, 'gen', 1), era: intFlag(flags, 'era', 1), env,
  });
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  const done = (code) => process.stdout.write('', () => process.exit(code));
  main(process.argv.slice(2)).then((r) => { process.stdout.write((r.usage ? USAGE : JSON.stringify(r)) + '\n'); done(0); }, (e) => {
    const coded = e instanceof Error && Number.isInteger(e.code);
    process.stderr.write(redact('swarm: ' + (coded ? e.message : 'failed: ' + ((e && e.stack) || e))).split('\n')[0] + '\n');
    done(coded ? e.code : 1);
  });
}
