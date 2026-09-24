#!/usr/bin/env node
// tools/schedule-autopilot.mjs: the daily 05:00 gap loop, as a Windows scheduled task, one hour
// after the 04:00 BrainLadder task (tools/schedule-ladder.mjs), so the gaps the ladder names each
// morning are the gaps the loop works on an hour later.
//
// WITH NO FLAG IT REGISTERS NOTHING. It prints the exact schtasks command and the exact command
// the task runs, and stops there. The ladder tool's rule stands beside this one: registering a
// task is a change to the machine, not a computation, so it is his call. For THIS ONE task his
// call was made in words, and the authorisation is quoted here so nobody has to look for it:
//
//   HIS ORDER OF 2026-09-24 12:02 (MANUAL.md section A): "Its gotta work without me. Thats the
//   most important part. EVERY GAP should be able to be filled by itself, ur just the engineer
//   to author it".
//
// That order authorises the BrainAutopilot task and nothing wider: this file registers, queries,
// runs and deletes that one task name, never another.
//
//   node tools/schedule-autopilot.mjs              print both commands, register nothing
//   node tools/schedule-autopilot.mjs --register   run the printed schtasks line, then --status
//   node tools/schedule-autopilot.mjs --status     query THIS ONE task (schtasks /Query /TN
//                                                  BrainAutopilot /FO LIST); "not registered",
//                                                  exit 0, when it is absent
//   node tools/schedule-autopilot.mjs --remove     delete it
//   node tools/schedule-autopilot.mjs --run-now    schtasks /Run it once, then wait up to 3
//                                                  minutes for today's log to appear or grow
//   node tools/schedule-autopilot.mjs --tick       what the task runs: the guards, then the loop
//   node tools/schedule-autopilot.mjs --tick --dry the same command with --soak 90 replaced by
//                                                  --dry and the author off (asks no model)
//   node tools/schedule-autopilot.mjs --bar        the bar: --status, a --tick --dry run with the
//                                                  log and ledger line counts before and after,
//                                                  the authored share, and
//                                                  bench/verdicts/schedule-autopilot.json
//   --task-name NAME                               another task name (the tests query a name that
//                                                  does not exist; nothing here ever registers one)
//   --root DIR                                     --tick and --bar on a planted tree (the tests)
//
// WHY A TICK. schtasks refuses a /TR longer than 261 characters, and the loop's command inside
// its budget wrapper plus a dated log does not fit in 261 characters of cmd. So the task runs
// `node tools\schedule-autopilot.mjs --tick` from this tree, and the tick runs, EXACTLY, the
// command tickArgv() returns (the one the no-flag run prints):
//
//   node tools/budget.mjs --ram-mb 6000 --disk-mb 2000 --dir state/self --
//     node --max-old-space-size=6000 bin/brain.mjs self-code --auto --soak 90 --author on --json
//
// with its whole transcript (stdout, stderr, the budget wrapper's lines) appended to
// bench/verdicts/autopilot/<date>.log beside the autopilot's own <date>.jsonl, the date in UTC
// as the autopilot names its ledger. cmd has no portable way to format a date; node does.
//
// THE GUARDS. Before it starts anything the tick refuses, with exit 0 and ONE printed line that
// is also appended to the day's log, while:
//   state/self/STOP exists                          his switch; a dry tick honours it too
//   a bench flag is live                            state/bench-flags/<pid>.json held by a live
//                                                   pid (the rule daemon/run.mjs keeps for its
//                                                   self-code step); a dry tick, which writes no
//                                                   source file, prints the flag and goes on
//   --soak is not landed                            neither self/autopilot.mjs nor self/daemon.mjs
//                                                   reads a soak option yet (the loop item adds it
//                                                   in Board 14 wave 2): a live tick without it
//                                                   would be a one-pass wet run, not the soak
//   free RAM stays under 16384 MB for 30 minutes    the BUDGETS rule (wait under 16 GB free)
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TASK_NAME as LADDER_TASK, AT as LADDER_AT } from './schedule-ladder.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const TREE = path.resolve(HERE, '..');
export const TASK_NAME = 'BrainAutopilot';
export const AT = '05:00';
export const LOG_DIR = 'bench/verdicts/autopilot';
export const STOP_REL = 'state/self/STOP';
export const FLAG_DIR_REL = 'state/bench-flags';
export const FREE_RAM_MB = 16384;
export const RAM_WAIT_MS = 30 * 60_000;
export const TR_MAX = 261;
export const RUN_NOW_WAIT_MS = 3 * 60_000;
export const VERDICT_REL = 'bench/verdicts/schedule-autopilot.json';
export const HIS_ORDER = 'HIS ORDER OF 2026-09-24 12:02: "Its gotta work without me. Thats the most important part. EVERY GAP should be able to be filled by itself, ur just the engineer to author it"';
/** The files that would read a soak option once the loop item lands it. */
export const SOAK_READERS = ['self/autopilot.mjs', 'self/daemon.mjs'];

/**
 * The command the task runs, as argv after `node`. One place: the no-flag print, the tick and
 * the bar all read it, so what is printed and what runs cannot drift apart. dry replaces
 * --soak 90 with --dry and the author on with off (a dry run with the author on asks the model,
 * self/autopilot.mjs header), which is the form a model-off check may run.
 * @param {{dry?: boolean}} o
 * @returns {string[]}
 */
export function tickArgv({ dry = false } = {}) {
  return [
    'tools/budget.mjs', '--ram-mb', '6000', '--disk-mb', '2000', '--dir', 'state/self', '--',
    'node', '--max-old-space-size=6000', 'bin/brain.mjs', 'self-code', '--auto',
    ...(dry ? ['--dry'] : ['--soak', '90']), '--author', dry ? 'off' : 'on', '--json',
  ];
}

/** The /TR value: cd into the tree and run the tick. Backslashes, because cmd runs it. */
export const trValue = (tree = TREE) => 'cmd /c cd /d ' + tree + ' && node ' + path.win32.join('tools', 'schedule-autopilot.mjs') + ' --tick';

export function createArgv({ taskName = TASK_NAME, tree = TREE } = {}) {
  return ['/create', '/tn', taskName, '/tr', trValue(tree), '/sc', 'daily', '/st', AT, '/f'];
}
export const removeArgv = ({ taskName = TASK_NAME } = {}) => ['/delete', '/tn', taskName, '/f'];
export const statusArgv = ({ taskName = TASK_NAME } = {}) => ['/query', '/tn', taskName, '/fo', 'LIST'];
export const runArgv = ({ taskName = TASK_NAME } = {}) => ['/run', '/tn', taskName];

/** One argv as a line a person can paste, with the values that hold a space quoted. */
export const quoteArg = (a) => (/[ &]/.test(a) ? '"' + a + '"' : a);
export const asLine = (argv, exe = 'schtasks') => exe + ' ' + argv.map(quoteArg).join(' ');

/** Today's log and ledger, named by the UTC date the autopilot names its ledger with. */
export function dayFiles(root = TREE, now = new Date()) {
  const date = now.toISOString().slice(0, 10);
  return {
    date,
    log: path.join(root, ...LOG_DIR.split('/'), date + '.log'),
    ledger: path.join(root, ...LOG_DIR.split('/'), date + '.jsonl'),
  };
}

/** Lines and bytes of a file; 0 and 0 when it does not exist. */
export function countLines(file) {
  try {
    const buf = readFileSync(file);
    let n = 0;
    for (const b of buf) if (b === 10) n++;
    if (buf.length && buf[buf.length - 1] !== 10) n++;
    return { exists: true, lines: n, bytes: buf.length };
  } catch { return { exists: false, lines: 0, bytes: 0 }; }
}

function pidAlive(pid) { try { process.kill(pid, 0); return true; } catch (e) { return !!(e && e.code === 'EPERM'); } }

/**
 * The first bench flag held by a live pid other than selfPid, or null. The same file format and
 * the same liveness rule as daemon/run.mjs benchFlag(); read only here (a stale flag is left for
 * the daemon to sweep), and read without importing the daemon's module tree.
 */
export function liveBenchFlag(root = TREE, selfPid = process.pid) {
  const dir = path.join(root, ...FLAG_DIR_REL.split('/'));
  let names;
  try { names = readdirSync(dir); } catch { return null; }
  for (const n of names.sort()) {
    if (!n.endsWith('.json')) continue;
    let j;
    try { j = JSON.parse(readFileSync(path.join(dir, n), 'utf8')); } catch { continue; }
    const pid = Number(j && j.pid);
    if (!Number.isInteger(pid) || pid <= 0 || pid === selfPid || !pidAlive(pid)) continue;
    return { pid, command: j.command || null, at: j.at || null, file: FLAG_DIR_REL + '/' + n };
  }
  return null;
}

/**
 * Does any file that would carry the loop's soak read a soak option? A read, not a mention: the
 * word "soak" already sits in comments of self/, so the test is for code that takes the option
 * (opts.soak, a soak: key or assignment, ['soak']).
 */
export function soakLanded(root = TREE) {
  const read = /\bsoak\b\s*[:=]|\.soak\b|\[['"]soak['"]\]/;
  const hits = [];
  for (const rel of SOAK_READERS) {
    try { if (read.test(readFileSync(path.join(root, ...rel.split('/')), 'utf8'))) hits.push(rel); } catch { /* absent */ }
  }
  return { landed: hits.length > 0, files: hits };
}

/**
 * The guards, in order, as one decision: {ok, line, notes}. Pure over its inputs so a test can
 * plant a tree; freeMb is sampled by the caller (the tick waits on it, the test passes a number).
 */
export function guard({ root = TREE, dry = false, freeMb = Math.round(os.freemem() / 1048576), selfPid = process.pid } = {}) {
  const notes = [];
  if (existsSync(path.join(root, ...STOP_REL.split('/')))) return { ok: false, why: 'stop', line: 'autopilot tick refused: ' + STOP_REL + ' exists (delete it to let the loop run); nothing started', notes };
  const flag = liveBenchFlag(root, selfPid);
  if (flag) {
    if (!dry) return { ok: false, why: 'bench-flag', line: 'autopilot tick refused: a bench flag is live (' + flag.file + ', pid ' + flag.pid + (flag.command ? ': ' + String(flag.command).slice(0, 120) : '') + '); nothing started', notes };
    notes.push('bench flag live (' + flag.file + ', pid ' + flag.pid + '): a dry tick writes no source file, so it goes on');
  }
  if (!dry) {
    const s = soakLanded(root);
    if (!s.landed) return { ok: false, why: 'soak', line: 'autopilot tick refused: --soak is not landed yet (' + SOAK_READERS.join(' and ') + ' read no soak option; Board 14 wave 2 adds it); nothing started', notes };
  }
  if (!(freeMb >= FREE_RAM_MB)) return { ok: false, why: 'ram', line: 'autopilot tick refused: free RAM ' + freeMb + ' MB under ' + FREE_RAM_MB + ' MB (the BUDGETS rule); nothing started', notes };
  return { ok: true, why: null, line: null, notes };
}

const stamp = () => new Date().toISOString();
function logLine(file, line) {
  mkdirSync(path.dirname(file), { recursive: true });
  appendFileSync(file, stamp() + ' ' + line + '\n');
}

/**
 * The tick: guards, then the command under the budget wrapper with its transcript teed to the
 * day's log. Resolves {refused, line, exit, wallMs, peakRamMb, log, command}.
 */
export async function tick({ root = TREE, dry = false, now = new Date(), echo = true, ramWaitMs = RAM_WAIT_MS, ramProbe = () => Math.round(os.freemem() / 1048576) } = {}) {
  const { log } = dayFiles(root, now);
  const argv = tickArgv({ dry });
  const command = 'node ' + argv.map(quoteArg).join(' ');
  let g = guard({ root, dry, freeMb: ramProbe() });
  const waitUntil = Date.now() + ramWaitMs;
  while (!g.ok && g.why === 'ram' && Date.now() < waitUntil) {
    await new Promise((r) => setTimeout(r, 30_000));
    g = guard({ root, dry, freeMb: ramProbe() });
  }
  const say = (s) => { if (echo) console.log(s); logLine(log, s); };
  if (!g.ok) { say(g.line); return { refused: true, why: g.why, line: g.line, exit: 0, log, command }; }
  for (const n of g.notes) say('autopilot tick: ' + n);
  say('autopilot tick start' + (dry ? ' (dry)' : '') + ': ' + command);
  const t0 = Date.now();
  const outer = [...argv];
  outer[outer.indexOf('node')] = process.execPath; // the inner node is the same binary as this one
  let tail = '';
  const exit = await new Promise((resolve) => {
    const child = spawn(process.execPath, outer, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    const sink = (stream) => (chunk) => {
      mkdirSync(path.dirname(log), { recursive: true });
      appendFileSync(log, chunk);
      if (echo) stream.write(chunk);
      tail = (tail + chunk.toString('utf8')).slice(-4000);
    };
    child.stdout.on('data', sink(process.stdout));
    child.stderr.on('data', sink(process.stderr));
    child.on('error', (e) => { say('autopilot tick error: ' + e.message); resolve(127); });
    child.on('close', (code) => resolve(code ?? 1));
  });
  const wallMs = Date.now() - t0;
  const m = /BUDGET done[^\n]*peak ram ([0-9.]+)\s*MB/.exec(tail);
  const peakRamMb = m ? Number(m[1]) : null;
  say('autopilot tick end: exit ' + exit + ', wall ' + wallMs + ' ms' + (peakRamMb !== null ? ', peak ram ' + peakRamMb + ' MB (the budget wrapper\'s line)' : ''));
  return { refused: false, why: null, line: null, exit, wallMs, peakRamMb, log, command };
}

function runSchtasks(argv) {
  const r = spawnSync('schtasks', argv, { encoding: 'utf8', windowsHide: true });
  if (r.error) return { status: -1, out: '', err: String(r.error.message) };
  return { status: r.status, out: String(r.stdout || '').trim(), err: String(r.stderr || '').trim() };
}

/** The fields of schtasks /Query /FO LIST: Status and Next Run Time, or null when absent. */
export function parseStatus(out) {
  const field = (name) => { const m = new RegExp('^' + name + ':\\s*(.+)$', 'mi').exec(String(out || '')); return m ? m[1].trim() : null; };
  return { status: field('Status'), nextRun: field('Next Run Time'), taskName: field('TaskName') };
}

/** Query one task name. {registered, status, nextRun, raw, line}. */
export function queryTask({ taskName = TASK_NAME } = {}) {
  const r = runSchtasks(statusArgv({ taskName }));
  if (r.status !== 0) return { registered: false, status: null, nextRun: null, raw: r.err || r.out, line: 'not registered (schtasks exited ' + r.status + (r.err ? ': ' + r.err.split('\n')[0] : '') + ')' };
  const p = parseStatus(r.out);
  return { registered: true, status: p.status, nextRun: p.nextRun, raw: r.out, line: 'registered: status ' + p.status + ', next run ' + p.nextRun };
}

/** The no-flag print. */
export function renderPlan({ taskName = TASK_NAME, tree = TREE } = {}) {
  const tr = trValue(tree);
  const L = [];
  L.push('THE DAILY GAP LOOP, ' + AT + ', one hour after ' + LADDER_TASK + ' (' + LADDER_AT + ').');
  L.push('');
  L.push('This would register it:');
  L.push('  ' + asLine(createArgv({ taskName, tree })));
  L.push('');
  L.push('  task    ' + taskName + '   (the only task name this file touches)');
  L.push('  tree    ' + tree);
  L.push('  /tr     ' + tr.length + ' of ' + TR_MAX + ' characters schtasks accepts');
  L.push('  daily   at ' + AT);
  L.push('  runs    node ' + tickArgv().map(quoteArg).join(' '));
  L.push('  log     ' + LOG_DIR + '/<date>.log (UTC date; every guard line, the whole transcript, the exit), beside ' + LOG_DIR + '/<date>.jsonl');
  L.push('  guards  refuses with exit 0 and one printed line (also appended to the log) while:');
  L.push('            ' + STOP_REL + ' exists');
  L.push('            a bench flag is live (' + FLAG_DIR_REL + '/<pid>.json held by a live pid)');
  L.push('            --soak is not landed (' + SOAK_READERS.join(' and ') + ' read no soak option)');
  L.push('            free RAM stays under ' + FREE_RAM_MB + ' MB for ' + RAM_WAIT_MS / 60000 + ' minutes');
  L.push('  dry     --tick --dry runs: node ' + tickArgv({ dry: true }).map(quoteArg).join(' '));
  L.push('');
  L.push('Authorised by ' + HIS_ORDER + '.');
  L.push('NOTHING WAS REGISTERED. node tools/schedule-autopilot.mjs --register runs the schtasks line above,');
  L.push('--status queries that one task name, --run-now runs it once, and --remove deletes it.');
  return L.join('\n');
}

// ================================================================ the bar
/**
 * The bar, measured: the task's status (queried, never registered here), one direct dry tick
 * through the same budget wrapper with the log and ledger counted before and after, and the
 * authored share over docs/BOARDS.json. Writes bench/verdicts/schedule-autopilot.json once.
 */
export async function bar({ root = TREE, taskName = TASK_NAME, now = new Date(), write = true } = {}) {
  const lines = [];
  const say = (s) => { lines.push(s); console.log(s); };
  const q = queryTask({ taskName });
  say(asLine(statusArgv({ taskName })));
  say('  ' + q.line);
  const day = dayFiles(root, now);
  const rel = (p) => path.relative(root, p).replaceAll('\\', '/');
  const logBefore = countLines(day.log), ledgerBefore = countLines(day.ledger);
  say('before: ' + rel(day.log) + ' ' + logBefore.lines + ' lines (' + logBefore.bytes + ' bytes), ' + rel(day.ledger) + ' ' + ledgerBefore.lines + ' lines');
  const t = await tick({ root, dry: true, now, echo: false });
  const logAfter = countLines(day.log), ledgerAfter = countLines(day.ledger);
  say('direct run: ' + t.command + (t.refused ? '  REFUSED: ' + t.line : '  exit ' + t.exit + ', wall ' + t.wallMs + ' ms' + (t.peakRamMb !== null ? ', peak ram ' + t.peakRamMb + ' MB' : '')));
  say('after:  ' + rel(day.log) + ' ' + logAfter.lines + ' lines (' + logAfter.bytes + ' bytes), ' + rel(day.ledger) + ' ' + ledgerAfter.lines + ' lines');
  let summary = null;
  if (!t.refused) {
    // The dry run's JSON is the last object in the log: read its counts back for the verdict.
    const text = readFileSync(day.log, 'utf8');
    const start = text.lastIndexOf('autopilot tick start (dry)');
    const seg = start >= 0 ? text.slice(start) : '';
    const open = seg.indexOf('\n{');
    if (open >= 0) {
      let depth = 0, end = -1;
      for (let i = open + 1; i < seg.length; i++) { const c = seg[i]; if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) { end = i + 1; break; } } else if (c === '"') { for (i++; i < seg.length && seg[i] !== '"'; i++) if (seg[i] === '\\') i++; } }
      try { const j = JSON.parse(seg.slice(open + 1, end)); summary = { ok: j.ok, dry: j.dry, counts: j.counts, author: j.author ? { on: j.author.on } : null, candidatesBySource: Object.fromEntries(Object.entries(j.bySource || {}).map(([k, v]) => [k, v.candidates])) }; } catch { summary = null; }
    }
    if (summary) say('  the run: ' + JSON.stringify(summary.counts) + ' candidates by source ' + JSON.stringify(summary.candidatesBySource) + ', author ' + (summary.author && summary.author.on ? 'ON' : 'off'));
  }
  const { main: authorship } = await import('./authorship.mjs');
  const a = authorship(['--root', root], now);
  const shareLine = a.text.split('\n').find((l) => l.startsWith('SHARE')) || '';
  say(shareLine);
  const launched = a.verdict.boards.filter((b) => b.launched !== false).map((b) => b.board);
  const named = [8, 9, 10, 11, 12].every((n) => launched.includes(n));
  const checks = [
    { name: 'registered', ok: q.registered, detail: q.line },
    { name: 'ready', ok: q.registered && q.status === 'Ready', detail: q.status ? 'status ' + q.status + ', next run ' + q.nextRun : 'no status: ' + q.line },
    { name: 'dated log from a direct run', ok: !t.refused && logAfter.exists && logAfter.lines > logBefore.lines, detail: rel(day.log) + ' ' + logBefore.lines + ' -> ' + logAfter.lines + ' lines, run ' + (t.refused ? 'refused' : 'exit ' + t.exit) },
    { name: 'share over boards 8 to 12', ok: named, detail: 'launched boards in the denominator: ' + launched.join(', ') + '; ' + shareLine },
  ];
  const barMet = checks.every((c) => c.ok);
  for (const c of checks) say('  ' + (c.ok ? 'PASS ' : 'FAIL ') + c.name + ': ' + c.detail);
  say('BAR ' + (barMet ? 'MET' : 'NOT MET') + ': ' + checks.filter((c) => c.ok).length + ' of ' + checks.length + ' checks');
  const verdict = {
    at: new Date().toISOString(), command: 'node tools/schedule-autopilot.mjs --bar' + (taskName !== TASK_NAME ? ' --task-name ' + taskName : ''), node: process.version,
    isTheBar: true, barMet,
    bar: 'the BrainAutopilot task is registered and Ready, a direct run of its command (with --soak 90 replaced by --dry and the author off, the flags that exist today, through the same budget wrapper) produced a dated log, and the authored share prints over a denominator naming boards 8 to 12',
    split: {
      development: 'test/schedule-autopilot.test.mjs on planted temp trees: the printed command, the four guards, the status of a task name that does not exist, docs/BOARDS.json against the commits it names',
      heldOut: 'the real tree and the real Task Scheduler: this run queries ' + taskName + ', runs the dry tick on the real tree and reads the real docs/BOARDS.json',
    },
    statement: 'Task ' + taskName + ': ' + q.line + '. ' + (t.refused ? 'The direct dry run was REFUSED by its guard: ' + t.line + '. ' : 'The direct run of ' + t.command + ' exited ' + t.exit + ' after ' + t.wallMs + ' ms' + (t.peakRamMb !== null ? ' with a peak of ' + t.peakRamMb + ' MB by the budget wrapper\'s own line' : '') + '. ')
      + 'The day log ' + rel(day.log) + ' went from ' + logBefore.lines + ' to ' + logAfter.lines + ' lines and the ledger ' + rel(day.ledger) + ' from ' + ledgerBefore.lines + ' to ' + ledgerAfter.lines + ' lines (a dry autopilot run writes no ledger line by design, self/autopilot.mjs). '
      + 'The authored share is ' + shareLine.replace(/^SHARE \(cumulative\): /, '') + ', over launched boards ' + launched.join(', ') + '. ' + checks.filter((c) => c.ok).length + ' of ' + checks.length + ' checks pass, so the bar is ' + (barMet ? 'MET' : 'NOT MET') + (barMet ? '.' : ': ' + checks.filter((c) => !c.ok).map((c) => c.name).join(', ') + '.'),
    task: { name: taskName, registered: q.registered, status: q.status, nextRun: q.nextRun, query: asLine(statusArgv({ taskName })) },
    printed: { schtasks: asLine(createArgv({ taskName })), runs: 'node ' + tickArgv().map(quoteArg).join(' '), trChars: trValue().length, trMax: TR_MAX },
    directRun: {
      command: t.command, refused: t.refused, refusal: t.line, exit: t.exit, wallMs: t.wallMs ?? null, peakRamMb: t.peakRamMb ?? null,
      log: { file: rel(day.log), linesBefore: logBefore.lines, linesAfter: logAfter.lines, bytesBefore: logBefore.bytes, bytesAfter: logAfter.bytes },
      ledger: { file: rel(day.ledger), linesBefore: ledgerBefore.lines, linesAfter: ledgerAfter.lines },
      summary,
    },
    authorship: { numerator: a.verdict.numerator, denominator: a.verdict.denominator, share: a.verdict.share, launchedBoards: launched, line: shareLine, verdictFile: 'bench/verdicts/authorship.json' },
    checks, printedLines: lines,
  };
  if (write) { const f = path.join(root, ...VERDICT_REL.split('/')); mkdirSync(path.dirname(f), { recursive: true }); writeFileSync(f, JSON.stringify(verdict, null, 2) + '\n'); say('wrote ' + VERDICT_REL); }
  return verdict;
}

// ================================================================ the CLI
export function parseFlags(argv) {
  const o = { flags: new Set(), taskName: TASK_NAME, root: TREE };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--task-name') { o.taskName = String(argv[++i] || TASK_NAME); continue; }
    if (argv[i] === '--root') { o.root = path.resolve(String(argv[++i] || TREE)); continue; }
    if (argv[i].startsWith('--')) o.flags.add(argv[i]);
  }
  return o;
}

async function cli(argv) {
  const { flags, taskName, root } = parseFlags(argv);
  if (flags.has('--tick')) {
    // --root is for a planted tree (the tests); the task itself runs from this tree.
    const r = await tick({ root, dry: flags.has('--dry') });
    process.exitCode = r.refused ? 0 : r.exit;
  } else if (flags.has('--bar')) {
    const v = await bar({ root, taskName });
    process.exitCode = v.barMet ? 0 : 1;
  } else if (flags.has('--register')) {
    const r = runSchtasks(createArgv({ taskName }));
    console.log(asLine(createArgv({ taskName })));
    console.log(r.out || r.err);
    console.log('schtasks exited ' + r.status);
    const q = queryTask({ taskName });
    console.log(asLine(statusArgv({ taskName })));
    console.log(q.registered ? q.raw : q.line);
    if (r.status !== 0) process.exitCode = 1;
  } else if (flags.has('--remove')) {
    const r = runSchtasks(removeArgv({ taskName }));
    console.log(asLine(removeArgv({ taskName })));
    console.log(r.out || r.err);
    console.log('schtasks exited ' + r.status);
    if (r.status !== 0) process.exitCode = 1;
  } else if (flags.has('--status')) {
    // One task name, never a dump of every task on the machine; absent is an answer, exit 0.
    const q = queryTask({ taskName });
    console.log(asLine(statusArgv({ taskName })));
    console.log(q.registered ? q.raw + '\n' + q.line : q.line);
  } else if (flags.has('--run-now')) {
    const { log } = dayFiles();
    const before = countLines(log);
    const r = runSchtasks(runArgv({ taskName }));
    console.log(asLine(runArgv({ taskName })));
    console.log(r.out || r.err);
    console.log('schtasks exited ' + r.status);
    if (r.status !== 0) { process.exitCode = 1; return; }
    const until = Date.now() + RUN_NOW_WAIT_MS;
    let after = before;
    while (Date.now() < until) {
      await new Promise((res) => setTimeout(res, 5000));
      after = countLines(log);
      if (after.bytes > before.bytes) break;
    }
    const grew = after.bytes > before.bytes;
    console.log(path.relative(TREE, log).replaceAll('\\', '/') + ': ' + before.lines + ' -> ' + after.lines + ' lines' + (grew ? '' : ' (did not appear or grow within ' + RUN_NOW_WAIT_MS / 1000 + ' s)'));
    if (!grew) process.exitCode = 1;
  } else {
    console.log(renderPlan({ taskName }));
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) cli(process.argv.slice(2)).catch((e) => { console.error('schedule-autopilot: ' + String(e && e.message || e)); process.exitCode = 1; });
