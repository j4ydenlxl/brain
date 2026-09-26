// act/shell.mjs: THE HAND THAT RUNS A COMMAND. An argv array, never a shell string.
//
// This is the OpenClaw remote-code flaw designed out rather than patched. The flaw is not
// that an agent runs commands: it is that the command is a STRING, assembled from text the
// agent read somewhere, handed to a shell that re-parses it. Every quoting bug, every
// "; rm -rf", every backtick in a web page becomes a second command. Here there is no
// string and no shell:
//
//   1. the request is an ARRAY. argv[0] is the program, argv[1..] are arguments. spawn is
//      called with shell false, so an ampersand, a pipe, a backtick or a newline inside an
//      argument is a literal character the program receives and nothing else parses.
//   2. argv[0] must match an allowed prefix from the policy EXACTLY. The shipped policy
//      allows nothing, so a fresh install runs no commands at all.
//   3. cwd must resolve (symlinks included) to a path under a policy root.
//   4. stdout and stderr are capped in bytes and the result says so with `truncated`.
//   5. a timeout kills the PROCESS TREE, with taskkill /T on win32 and, on Linux, a walk of
//      /proc that closes every ppid chain rooted at the child (detached grandchildren in
//      their own group and session included), so a child that spawned its own children
//      leaves nothing behind. A platform without /proc falls back to the process group kill
//      and says so in res.reason, because a group kill alone misses a detached grandchild.
//      (the /proc walk: board 17 builder (the organism's item), shell-linux)
//   6. every run is one ledger event carrying argv, the exit code and the milliseconds.
//   7. the environment is a small base plus only the variable NAMES the caller asked for.
//      A value is never read into a log, and opts.env with values in it is refused: this
//      code never handles a credential.
//
// The actuator adds a second, independent authority on top of all of that: a motor signal
// { kind: 'shell.run', argv } becomes a 'world.act' proposal to core/gate.mjs, judged by
// world/policy.mjs, and the process is spawned only if the gate answers 'approved'. Two
// allowlists, written by different hands, must both say yes.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineKind, hasKind } from '../core/cell.mjs';
import { closeWorldCell, outcome, propose, push, release, retain } from '../world/actuators.mjs';

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const POLICY_FILE = path.join(HERE, 'policy.json');
/** The cell kind this module registers in the world region. */
export const SHELL_CELL_KIND = 'act.shell';
/** The motor signal this actuator answers to: { kind: 'shell.run', argv: [...] }. */
export const SHELL_SIGNAL_KIND = 'shell.run';
/**
 * The gate proposal kind and op. core/gate.mjs freezes its nine kinds and world/policy.mjs
 * freezes WORLD_OPS, and neither list has a 'shell.run' of its own, so a shell run travels
 * as the kind the world actuators already use for an external action: 'world.act' with op
 * 'proc.spawn'. That is deliberate, not a workaround: one door, one pending queue, one
 * refusal event. notes/act.md records the request for a registrable op.
 */
export const PROPOSAL_KIND = 'world.act';
export const PROPOSAL_OP = 'proc.spawn';

const WIN = process.platform === 'win32';
const SEP = /[\\/]/;

// The variables a child gets when the caller names none. Enough for a program to start
// and find its own runtime, and nothing that carries a secret in normal use.
export const BASE_ENV_NAMES = Object.freeze([
  'PATH', 'PATHEXT', 'SystemRoot', 'windir', 'COMSPEC', 'TEMP', 'TMP', 'TMPDIR',
  'HOME', 'USERPROFILE', 'HOMEDRIVE', 'HOMEPATH', 'LANG', 'LC_ALL', 'TZ',
  'NUMBER_OF_PROCESSORS', 'PROCESSOR_ARCHITECTURE', 'OS',
]);

// ---------------------------------------------------------------- the policy
export const DEFAULTS = Object.freeze({
  argv: [],            // allowed prefixes: a string matches argv[0], an array matches argv[0..n-1]
  roots: [ROOT],       // cwd must resolve to a path under one of these
  maxBytes: 262144,    // per stream
  timeoutMs: 10000,
  maxArgs: 64,
  maxArgLength: 4096,
});

const strings = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : []);
const num = (v, dflt, min = 1) => { const n = Number(v); return Number.isFinite(n) && n >= min ? n : dflt; };

/**
 * Fill in every field of a shell policy. An absent list of prefixes denies everything;
 * an absent list of roots means ROOT, which is what act/policy.json ships.
 * @param {object} raw a policy object, or the shell block of one
 */
export function normalizeShellPolicy(raw = {}) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const s = r.shell && typeof r.shell === 'object' ? r.shell : r;
  const prefixes = [];
  const declared = Array.isArray(s.argv) ? s.argv : (Array.isArray(s.argvPrefixes) ? s.argvPrefixes : (Array.isArray(s.prefixes) ? s.prefixes : []));
  for (const entry of declared) {
    if (typeof entry === 'string' && entry.trim()) prefixes.push([entry.trim()]);
    else if (Array.isArray(entry)) { const a = strings(entry); if (a.length) prefixes.push(a); }
  }
  const rootSrc = Array.isArray(s.roots) ? s.roots : (r.fs && Array.isArray(r.fs.roots) ? r.fs.roots : null);
  const roots = rootSrc === null ? [...DEFAULTS.roots] : strings(rootSrc);
  return {
    __normalized: true,
    argv: prefixes,
    roots,
    maxBytes: num(s.maxBytes, DEFAULTS.maxBytes),
    timeoutMs: num(s.timeoutMs, DEFAULTS.timeoutMs),
    maxArgs: num(s.maxArgs, DEFAULTS.maxArgs),
    maxArgLength: num(s.maxArgLength, DEFAULTS.maxArgLength),
  };
}

/** What an unconfigured install gets: no prefix allowed, so no command runs. */
export function denyAll() { return normalizeShellPolicy({ argv: [] }); }

/**
 * @param {object|string|null} src a policy object, a path to a json file, or null for
 *   act/policy.json when it exists and the deny-all default when it does not.
 */
export function loadShellPolicy(src = null) {
  if (src && typeof src === 'object') return src.__normalized ? src : normalizeShellPolicy(src);
  const file = typeof src === 'string' && src ? src : POLICY_FILE;
  if (!existsSync(file)) return denyAll();
  try { return normalizeShellPolicy(JSON.parse(readFileSync(file, 'utf8'))); }
  catch (err) { const p = denyAll(); p.loadError = String(err && err.message || err); return p; }
}

// ---------------------------------------------------------------- paths
function resolveReal(p) {
  const abs = path.resolve(String(p));
  try { return realpathSync.native ? realpathSync.native(abs) : realpathSync(abs); }
  catch { return abs; }
}
function sameOrInside(root, target) {
  const a = WIN ? root.toLowerCase() : root, b = WIN ? target.toLowerCase() : target;
  if (a === b) return true;
  return b.startsWith(a.endsWith(path.sep) ? a : a + path.sep);
}
// argv[0] against one prefix entry's first element. A path is compared by its real path
// (so a symlink cannot smuggle a different program in), a bare name by its exact spelling,
// case-insensitively on win32 only. A name never matches a path entry or the reverse.
function sameProgram(want, entry) {
  const wIsPath = SEP.test(want), eIsPath = SEP.test(entry);
  if (wIsPath !== eIsPath) return false;
  const a = wIsPath ? resolveReal(want) : want, b = eIsPath ? resolveReal(entry) : entry;
  return WIN ? a.toLowerCase() === b.toLowerCase() : a === b;
}

/**
 * Is this argv inside the declared reach? Pure over (argv, policy): the actuator runs it,
 * the runner runs it again, and they must agree.
 * @param {string[]} argv
 * @param {object|string|null} policySrc
 * @returns {{ok: boolean, reason: string|null, entry?: string[], program?: string}}
 */
export function allowArgv(argv, policySrc = null) {
  const policy = loadShellPolicy(policySrc);
  if (typeof argv === 'string') return { ok: false, reason: 'argv must be an array of strings, never a shell string: a string would have to be parsed by a shell, and there is no shell here' };
  if (!Array.isArray(argv)) return { ok: false, reason: 'argv must be an array of strings' };
  if (argv.length === 0) return { ok: false, reason: 'argv is empty' };
  if (argv.length > policy.maxArgs) return { ok: false, reason: argv.length + ' argv elements is over the cap ' + policy.maxArgs };
  for (const a of argv) {
    if (typeof a !== 'string') return { ok: false, reason: 'every argv element must be a string, got ' + typeof a };
    if (a.length > policy.maxArgLength) return { ok: false, reason: 'an argv element of ' + a.length + ' chars is over the cap ' + policy.maxArgLength };
    if (a.includes('\0')) return { ok: false, reason: 'an argv element contains a null byte' };
  }
  for (const entry of policy.argv) {
    if (entry.length > argv.length) continue;
    if (!sameProgram(argv[0], entry[0])) continue;
    let all = true;
    for (let i = 1; i < entry.length; i++) if (argv[i] !== entry[i]) { all = false; break; }
    if (all) return { ok: true, reason: null, entry, program: argv[0] };
  }
  return { ok: false, reason: 'argv[0] ' + argv[0] + ' matches no allowed prefix (' + (policy.argv.length || 'no') + ' entries)' };
}

/**
 * Is this cwd under a policy root? An absent cwd means the first root.
 * @returns {{ok: boolean, reason: string|null, cwd?: string, root?: string}}
 */
export function allowCwd(cwd, policySrc = null) {
  const policy = loadShellPolicy(policySrc);
  if (!policy.roots.length) return { ok: false, reason: 'the policy declares no root, so there is nowhere to run' };
  const want = cwd == null || cwd === '' ? policy.roots[0] : String(cwd);
  if (want.includes('\0')) return { ok: false, reason: 'cwd contains a null byte' };
  const resolved = resolveReal(want);
  for (const root of policy.roots) {
    const real = resolveReal(root);
    if (sameOrInside(real, resolved)) return { ok: true, reason: null, cwd: resolved, root: real };
  }
  return { ok: false, reason: 'cwd is outside every allowed root (' + policy.roots.length + ' roots)', cwd: resolved };
}

// ---------------------------------------------------------------- the environment
/**
 * The environment a child gets: the base names above, plus exactly the names the caller
 * asked for. The VALUES are copied from process.env into the child and are never returned,
 * logged or stored by this module. A caller that tries to hand over values is refused.
 */
export function childEnv(envNames = null) {
  const out = {};
  for (const name of BASE_ENV_NAMES) if (process.env[name] !== undefined) out[name] = process.env[name];
  const names = strings(envNames);
  for (const name of names) if (process.env[name] !== undefined) out[name] = process.env[name];
  return { env: out, names };
}

// ---------------------------------------------------------------- the runner
// `seen` counts every byte the child actually produced, kept apart from the `bytes` that
// were retained. Without it "5 MB was capped to 64 KB" is an assumption about a number
// nothing measured.
function take(acc, chunk, max) {
  acc.seen += chunk.length;
  if (acc.bytes >= max) { acc.truncated = true; return; }
  const room = max - acc.bytes;
  if (chunk.length > room) { acc.parts.push(chunk.subarray(0, room)); acc.bytes = max; acc.truncated = true; }
  else { acc.parts.push(chunk); acc.bytes += chunk.length; }
}
const textOf = (acc) => Buffer.concat(acc.parts, acc.bytes).toString('utf8');

// ------------------------------------------------ the descendant walk (board 17 builder (the organism's item))
// On Linux the child is spawned detached, so it leads its own group and session, and a
// negative pid signals that group. That is NOT the whole tree: a grandchild the child spawned
// with detached true called setsid, sits in a group and a session of its own, and survives a
// group kill (measured on this host: test/act-shell.test.mjs test 9 read 13 then 22 bytes from
// such a grandchild after the group kill). /proc is the source of truth for the tree: every
// /proc/<pid>/stat names its ppid, pgrp and session, read in process, no ps, no pkill, no shell.
export const PROC_ROOT = '/proc';
const WALK_ROUNDS = 32;

/**
 * One /proc/<pid>/stat line. The command name sits in parentheses and may itself hold spaces
 * and parentheses, so the fields are read after the LAST ')': state ppid pgrp session ...
 * starttime is field 22 of the line (index 19 after the name).
 * @returns {{pid:number, state:string, ppid:number, pgrp:number, session:number, start:string|null}|null}
 */
export function parseProcStat(text) {
  const t = String(text || '');
  const open = t.indexOf('('), close = t.lastIndexOf(')');
  if (open < 0 || close < open) return null;
  const pid = Number(t.slice(0, open).trim());
  const f = t.slice(close + 2).trim().split(/\s+/);
  const ppid = Number(f[1]), pgrp = Number(f[2]), session = Number(f[3]);
  if (!Number.isInteger(pid) || pid <= 0 || !Number.isInteger(ppid)) return null;
  return { pid, state: f[0] || '?', ppid, pgrp: Number.isInteger(pgrp) ? pgrp : -1, session: Number.isInteger(session) ? session : -1, start: f[19] ?? null };
}

/** Every process /proc lists, by pid. Throws when procRoot cannot be read. */
function readProcTable(procRoot) {
  const table = new Map();
  for (const n of readdirSync(procRoot)) {
    const c = n.charCodeAt(0);
    if (c < 48 || c > 57) continue;
    let s;
    try { s = parseProcStat(readFileSync(path.join(procRoot, n, 'stat'), 'utf8')); } catch { continue; /* exited between the list and the read */ }
    if (s) table.set(s.pid, s);
  }
  return table;
}

/**
 * Every descendant of rootPid, DEEPEST FIRST, closed over the ppid chains rooted at it. A
 * process whose parent already died was reparented and lost its ppid link, but it keeps the
 * session and the group it was born in: anything whose session or group id is rootPid (the
 * child leads both, it was spawned detached) is a seed of the walk too. A pid still in use as
 * a session or group id is never handed to a new process, so that match is never a stranger.
 * Never lists rootPid itself, this process, or pid 1.
 * @param {number} rootPid
 * @param {string} [procRoot] where /proc is (tests plant a fake one)
 * @returns {{pid:number, depth:number, ppid:number, start:string|null}[]|null} null when procRoot cannot be read
 */
export function descendants(rootPid, procRoot = PROC_ROOT) {
  let table;
  try { table = readProcTable(procRoot); } catch { return null; }
  const kids = new Map();
  for (const p of table.values()) {
    if (!kids.has(p.ppid)) kids.set(p.ppid, []);
    kids.get(p.ppid).push(p.pid);
  }
  const depth = new Map();
  const queue = [];
  for (const k of kids.get(rootPid) || []) queue.push([k, 1]);
  for (const p of table.values()) if (p.session === rootPid || p.pgrp === rootPid) queue.push([p.pid, 1]);
  while (queue.length) {
    const [pid, d] = queue.shift();
    if (pid === rootPid || pid === process.pid || pid <= 1) continue;
    if (depth.has(pid) && depth.get(pid) >= d) continue;
    depth.set(pid, d);
    for (const k of kids.get(pid) || []) queue.push([k, d + 1]);
  }
  return [...depth.entries()]
    .map(([pid, d]) => ({ pid, depth: d, ppid: table.get(pid).ppid, start: table.get(pid).start }))
    .sort((a, b) => b.depth - a.depth || a.pid - b.pid);
}

const signal = (pid, sig) => { try { process.kill(pid, sig); return true; } catch { return false; } };

/**
 * The posix tree kill. FREEZE, then KILL: SIGSTOP the child so it forks no more, walk /proc,
 * SIGSTOP every descendant the walk found, and walk again until a walk finds nothing new (a
 * stopped process cannot fork, so the set closes). Then SIGKILL every descendant deepest
 * first, the child, and the child's group for anything the walk could not see. Without a
 * readable /proc: the group kill alone, and the note says what it misses.
 * @returns {{by:string, proc:boolean, found:number, killed:number, rounds:number, note:string|null}}
 */
export function killPosixTree(rootPid, procRoot = PROC_ROOT) {
  const report = { by: 'tree', proc: true, found: 0, killed: 0, rounds: 0, note: null };
  const first = descendants(rootPid, procRoot);
  if (first === null) {
    report.proc = false;
    report.note = 'no readable ' + procRoot + ' on this platform: the process group kill alone, which misses a detached grandchild';
    try { process.kill(-rootPid, 'SIGKILL'); report.by = 'group'; }
    catch { report.by = signal(rootPid, 'SIGKILL') ? 'child' : 'gone'; }
    return report;
  }
  signal(rootPid, 'SIGSTOP');
  const seen = new Map();
  let walk = first;
  for (let round = 0; round < WALK_ROUNDS; round++) {
    report.rounds++;
    let fresh = 0;
    for (const x of walk || []) {
      const had = seen.get(x.pid);
      if (!had) { seen.set(x.pid, x); signal(x.pid, 'SIGSTOP'); fresh++; }
      else if (x.depth > had.depth) had.depth = x.depth;
    }
    if (!fresh && round > 0) break;
    walk = descendants(rootPid, procRoot);
  }
  report.found = seen.size;
  for (const x of [...seen.values()].sort((a, b) => b.depth - a.depth)) if (signal(x.pid, 'SIGKILL')) report.killed++;
  const root = signal(rootPid, 'SIGKILL');
  try { process.kill(-rootPid, 'SIGKILL'); } catch { /* the group went down with its members */ }
  if (!root && !report.killed) report.by = 'gone';
  return report;
}

/**
 * Kill a child and everything it spawned. On win32 the only reliable way to reach a
 * grandchild is taskkill with /T, because a windows process has no process group the
 * parent can signal. On posix the /proc walk above takes the whole descendant tree down,
 * detached grandchildren included; without /proc, the process group.
 * @param {object} child  a ChildProcess
 * @param {{procRoot?: string, report?: object}} [opts] report is filled with the posix walk's counts
 * @returns {string} how it was killed
 */
export function killTree(child, opts = {}) {
  if (!child || child.pid == null) return 'none';
  if (WIN) {
    const r = spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, encoding: 'utf8' });
    if (r.status === 0) return 'taskkill';
    try { child.kill('SIGKILL'); } catch { /* already gone */ }
    return 'taskkill-failed';
  }
  const t = killPosixTree(child.pid, (opts && opts.procRoot) || PROC_ROOT);
  if (opts && opts.report && typeof opts.report === 'object') Object.assign(opts.report, t);
  return t.by;
}

/**
 * Run an argv array. No shell, ever.
 * @param {string[]} argv
 * @param {object} [opts]
 * @param {string} [opts.cwd]        must resolve under a policy root
 * @param {number} [opts.timeoutMs]  may only tighten the policy's timeout
 * @param {number} [opts.maxBytes]   may only tighten the policy's cap, per stream
 * @param {object|string} [opts.policy]
 * @param {string[]} [opts.envNames] variable NAMES to forward, never values
 * @param {string} [opts.stdin]
 * @param {object} [opts.brain]      when given, one ledger event per run
 * @param {boolean} [opts.checked]   the caller already ran allowArgv and allowCwd
 * @param {string} [opts.procRoot]   where /proc is, for the posix tree kill (tests only; a
 *                                   root that cannot be read falls back to the group kill)
 * @returns {Promise<{ok, code, stdout, stderr, ms, truncated, argv, cwd}>}
 */
export function runArgv(argv, opts = {}) {
  const policy = loadShellPolicy(opts.policy || null);
  const started = Date.now();
  const list = Array.isArray(argv) ? argv : [];
  const refuse = (reason) => {
    const res = { ok: false, code: null, stdout: '', stderr: '', ms: Date.now() - started, truncated: false, argv: list, cwd: null, signal: null, timedOut: false, refused: true, reason };
    logShell(opts.brain, res, [], 'act.shell.refused');
    return Promise.resolve(res);
  };
  if (opts.env !== undefined && opts.env !== null) return refuse('opts.env is refused: this code never handles a credential value, name the variables with opts.envNames instead');
  if (!opts.checked) {
    const a = allowArgv(list, policy);
    if (!a.ok) return refuse(a.reason);
  }
  const c = allowCwd(opts.cwd, policy);
  if (!opts.checked && !c.ok) return refuse(c.reason);
  const cwd = c.ok ? c.cwd : resolveReal(opts.cwd == null ? (policy.roots[0] || ROOT) : opts.cwd);
  const maxBytes = tightenTo(policy.maxBytes, opts.maxBytes);
  const timeoutMs = tightenTo(policy.timeoutMs, opts.timeoutMs);
  const { env, names } = childEnv(opts.envNames);

  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(list[0], list.slice(1), {
        cwd, env, shell: false, windowsHide: true, detached: !WIN, stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (err) {
      const res = { ok: false, code: null, stdout: '', stderr: '', ms: Date.now() - started, truncated: false, argv: list, cwd, signal: null, timedOut: false, refused: false, reason: 'spawn threw: ' + String(err && err.message || err) };
      logShell(opts.brain, res, names, 'act.shell');
      return resolve(res);
    }
    const out = { parts: [], bytes: 0, seen: 0, truncated: false }, err = { parts: [], bytes: 0, seen: 0, truncated: false };
    let settled = false, timedOut = false, killedBy = null, hardTimer = null;
    const tree = {};
    const killOpts = { procRoot: opts.procRoot || PROC_ROOT, report: tree };
    const cell = opts.cell || null;
    const closer = cell ? retain(cell, () => { killTree(child, killOpts); }) : null;
    const settle = (code, signal, thrown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer); if (hardTimer) clearTimeout(hardTimer);
      if (cell && closer) release(cell, closer);
      const res = {
        ok: thrown == null && !timedOut && code === 0,
        code: code ?? null,
        stdout: textOf(out), stderr: textOf(err),
        ms: Date.now() - started,
        truncated: out.truncated || err.truncated,
        seen: out.seen + err.seen, kept: out.bytes + err.bytes, maxBytes,
        argv: list, cwd,
        signal: signal ?? null, timedOut, killedBy, refused: false,
        tree: tree.by ? { by: tree.by, proc: tree.proc, found: tree.found, killed: tree.killed, rounds: tree.rounds } : null,
        reason: thrown != null ? thrown : (timedOut ? 'killed by the ' + timeoutMs + 'ms timeout' + (tree.note ? '; ' + tree.note : '') : (code === 0 ? null : 'exit ' + code)),
      };
      logShell(opts.brain, res, names, 'act.shell');
      resolve(res);
    };
    const timer = setTimeout(() => {
      timedOut = true;
      killedBy = killTree(child, killOpts);
      // A tree that does not go down still has to answer: the run is over either way.
      hardTimer = setTimeout(() => settle(null, 'SIGKILL', null), 2000);
    }, timeoutMs);
    child.stdout.on('data', (chunk) => take(out, chunk, maxBytes));
    child.stderr.on('data', (chunk) => take(err, chunk, maxBytes));
    child.on('error', (e) => settle(null, null, String(e && e.message || e)));
    child.on('close', (code, signal) => settle(code, signal, null));
    try { child.stdin.end(opts.stdin == null ? undefined : String(opts.stdin)); } catch { /* the child closed it */ }
  });
}

/** A caller may tighten a cap, never widen it. The authority is the policy. */
export function tightenTo(limit, want) {
  const n = Number(want);
  return Number.isFinite(n) && n > 0 && n < limit ? n : limit;
}

// One event per run. argv, the exit code and the milliseconds, exactly as the contract
// says, plus the NAMES of the forwarded variables. No stdout, no stderr, no value of
// anything: a ledger is read by people and shipped in a snapshot.
function logShell(brain, res, names, type) {
  if (!brain || typeof brain.log !== 'function') return null;
  return brain.log({
    type, argv: res.argv, code: res.code, ms: res.ms, ok: res.ok,
    cwd: res.cwd, truncated: res.truncated, timedOut: res.timedOut || false,
    bytes: res.stdout.length + res.stderr.length,
    env: names, reason: res.reason || null,
  });
}

// ---------------------------------------------------------------- the actuator
/**
 * Register the cell kind. Idempotent: a second call in the same process is a no-op, which
 * matters because several act/ modules may attach to the same brain.
 */
export function registerShellKind() {
  if (hasKind(SHELL_CELL_KIND)) return SHELL_CELL_KIND;
  defineKind(SHELL_CELL_KIND, {
    doc: 'Turns a motor signal { kind: shell.run, argv } into a world.act proposal and spawns the argv array only if the gate approves. No shell, ever: argv is passed as an array. Evidence that came only from the web is refused before the gate sees it.',
    ports: {
      in: [{ name: 'motor', kinds: ['event'] }],
      out: [{ name: 'out', kinds: ['event'] }, { name: 'error', kinds: ['event'] }],
    },
    defaults: { policy: null, cwd: null, timeoutMs: null, maxBytes: null, envNames: null, queueMax: 16 },
    init: () => ({ queue: [], running: 0, ran: 0, refused: 0, dropped: 0, lastTrace: null }),
    compute: (ins, cell, ctx) => {
      const p = cell.params, st = cell.state;
      const policy = loadShellPolicy(p.policy || null);
      for (const item of ins[0]) {
        const sig = item.sig;
        const r = (sig && sig.data) || {};
        if (r.kind !== undefined && r.kind !== SHELL_SIGNAL_KIND) continue; // not addressed to this hand
        const argv = Array.isArray(r.argv) ? r.argv.map(String) : r.argv;
        const deny = (reason, extra = {}) => {
          st.refused++;
          if (ctx.brain) ctx.brain.log({ type: 'act.shell.refused', cell: cell.id, argv: Array.isArray(argv) ? argv : null, reason, ...extra });
          push(st, { error: true, argv: Array.isArray(argv) ? argv : null, reason, ...extra }, p.queueMax);
        };
        // The provenance rule. Text fetched from the web is memory and evidence, never an
        // instruction: a motor signal whose evidence is web origin only never reaches the
        // gate, and the refusal names the url.
        const prov = webOnly(r);
        if (prov) { deny('the evidence for this run came only from web origin text, which is never an instruction', { url: prov.url || null, origin: 'web' }); continue; }
        const a = allowArgv(argv, policy);
        if (!a.ok) { deny(a.reason); continue; }
        const c = allowCwd(r.cwd || p.cwd, policy);
        if (!c.ok) { deny(c.reason); continue; }
        const what = { op: PROPOSAL_OP, exec: argv[0], args: argv.slice(1), cwd: c.cwd };
        const why = 'run ' + argv[0] + ' with ' + (argv.length - 1) + ' arguments in ' + c.cwd + ', asked for by ' + cell.id;
        const g = propose(cell, ctx, sig, what, why);
        if (!g.approved) {
          st.refused++;
          push(st, { error: true, argv, reason: g.reason, status: g.status, act: g.seq }, p.queueMax);
          continue;
        }
        st.running++;
        runArgv(argv, {
          cwd: c.cwd, policy, checked: true, cell,
          timeoutMs: r.timeoutMs ?? p.timeoutMs, maxBytes: r.maxBytes ?? p.maxBytes,
          envNames: r.envNames ?? p.envNames, stdin: r.stdin ?? null,
          brain: ctx.brain || null,
        }).then((res) => {
          st.running--; st.ran++;
          const outSeq = outcome(ctx, g.seq, { cell: cell.id, op: PROPOSAL_OP, ok: res.ok, exec: argv[0], args: argv.length - 1, code: res.code, ms: res.ms, truncated: res.truncated, reason: res.reason });
          // A command that ran and exited non zero is an ANSWER, not a refusal: its stdout,
          // its code and its reason all cross on the out port. The error port carries only
          // what never ran.
          push(st, {
            error: false,
            argv, reason: res.reason,
            out: { kind: 'event', data: { kind: SHELL_SIGNAL_KIND, argv, code: res.code, stdout: res.stdout, stderr: res.stderr, ms: res.ms, truncated: res.truncated, cwd: res.cwd, ok: res.ok, trace: { act: g.seq, outcome: outSeq } } },
            act: g.seq, outcome: outSeq,
          }, p.queueMax);
        });
      }
      return drainShell(cell, st);
    },
    serialize: (s) => ({ ...s, queue: [], queuedAtSnapshot: s.queue.length }),
    cost: 4,
  });
  return SHELL_CELL_KIND;
}

// One queued answer per run, on the out port when the run succeeded and on the error port
// when it did not. world/actuators.mjs has a drain of its own, and it builds an error event
// out of a url: this one names the argv instead, which is what a reader of a refused shell
// run needs to see.
function drainShell(cell, st) {
  if (!st.queue.length) return [null, null];
  const item = st.queue.shift();
  if (item.error) {
    return [null, { kind: 'event', data: {
      kind: SHELL_SIGNAL_KIND, error: true, argv: item.argv || null, reason: item.reason || null,
      status: item.status ?? null,
      url: item.url ?? null, origin: item.origin ?? null,
      act: item.act ?? null, outcome: item.outcome ?? null,
    } }];
  }
  st.lastTrace = { act: item.act ?? null, outcome: item.outcome ?? null };
  return [item.out, null];
}

// Evidence that is web origin and nothing else. A request carrying no evidence at all is
// not web evidence: it is a request from inside the organism, which the gate then judges.
function webOnly(r) {
  const ev = [];
  if (r.origin) ev.push({ origin: r.origin, url: r.url || null });
  const list = Array.isArray(r.evidence) ? r.evidence : (r.evidence ? [r.evidence] : []);
  for (const e of list) if (e && typeof e === 'object') ev.push({ origin: e.origin || null, url: e.url || null });
  const p = r.provenance;
  if (p && typeof p === 'object') {
    if (Array.isArray(p.sources)) for (const e of p.sources) { if (e && typeof e === 'object') ev.push({ origin: e.origin || null, url: e.url || null }); }
    else ev.push({ origin: p.origin || null, url: p.url || null });
  }
  if (!ev.length) return null;
  if (!ev.every((e) => e.origin === 'web')) return null;
  return ev.find((e) => e.url) || ev[0];
}

/**
 * Register the actuator in the world region and wire it to the border.
 *
 * The gate must already know 'world.act' (attachWorld or armWorld did that): a cell with no
 * authority never acts, and this function does not grant any.
 *
 * @param {import('../core/brain.mjs').Brain} brain
 * @param {object|string|null} policy the act policy (act/policy.json when null)
 * @param {object} [opts] { prefix = 'w', id, period = 1, cwd, region = 'world', circuit = 'actuators' }
 * @returns {{id: string, cell: object, kind: string, wired: string[], policy: object}}
 */
export function shellActuator(brain, policy = null, opts = {}) {
  registerShellKind();
  const pol = loadShellPolicy(policy);
  const prefix = opts.prefix || 'w';
  const id = opts.id || (prefix + '.shell');
  const region = opts.region || 'world', circuit = opts.circuit || 'actuators';
  brain.addRegion(region, { doc: 'the border with everything outside this process' });
  brain.addCircuit(region, circuit, { doc: 'the organism reaching out' });
  const cell = brain.addCell({
    id, kind: SHELL_CELL_KIND, region, circuit,
    params: { policy: pol, cwd: opts.cwd || null, timeoutMs: opts.timeoutMs || null, maxBytes: opts.maxBytes || null, envNames: opts.envNames || null },
    policy: { period: opts.period || 1 },
  });
  const wired = [];
  const has = (cid) => { try { brain.cell(cid); return true; } catch { return false; } };
  const wire = (a, ap, b, bp) => { brain.connect(a, ap, b, bp); wired.push(a + '.' + ap + ' -> ' + b + '.' + bp); };
  const motor = opts.motor || (prefix + '.motor'), percept = opts.percept || (prefix + '.percept');
  if (has(motor)) wire(motor, 'out', id, 'motor');
  if (has(percept)) { wire(id, 'out', percept, 'in'); wire(id, 'error', percept, 'in'); }
  brain.log({ type: 'act.shell.attach', cell: id, region, circuit, prefixes: pol.argv.length, roots: pol.roots.length, wired: wired.length });
  return { id, cell, kind: SHELL_CELL_KIND, wired, policy: pol };
}

/**
 * Kill every process this brain's shell cells are still holding.
 *
 * world/index.mjs closeWorld() walks WORLD_KINDS, and WORLD_KINDS is a frozen export of a
 * file this surface does not own, so it cannot learn 'act.shell'. A process in flight would
 * therefore outlive a closeWorld by as long as its timeout allows. This is the missing half:
 * anything that calls closeWorld(brain) should call closeShell(brain) beside it.
 * @returns {number} how many cells were closed
 */
export function closeShell(brain) {
  let n = 0;
  for (const cell of brain.cells) if (cell.kind === SHELL_CELL_KIND) n += closeWorldCell(cell);
  return n;
}
