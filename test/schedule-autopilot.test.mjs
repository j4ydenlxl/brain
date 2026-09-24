// test/schedule-autopilot.test.mjs: the daily 05:00 gap loop as a Windows task (Board 14, item
// schedule). NO TEST HERE REGISTERS, RUNS OR REMOVES A TASK: schtasks is only ever asked to
// /query a task name that does not exist. What is tested is the printed command, the guards, the
// tick on planted trees (a fake tools/budget.mjs stands in for the loop, so no model is asked and
// the real tree is never written), the bar's verdict shape on a planted tree, and the one flag
// bin/brain.mjs had to learn (--no-author).
//
//   1. no flag: the schtasks line at 05:00 daily, the budget-wrapped loop command, the STOP guard,
//      his order quoted, and nothing registered
//   2. --status on a task name that does not exist prints "not registered" and exits 0
//   3. the guards, each on its own planted tree: STOP, a live bench flag (a dry tick goes on), a
//      dead pid's flag, --soak not landed, low free RAM
//   4. a tick with state/self/STOP prints ONE line, exits 0, appends that line to the dated log and
//      starts nothing
//   5. a dry tick runs the command through the planted wrapper, tees the transcript to the dated
//      log, reads the peak line and returns the wrapper's exit code
//   6. the bar on a planted tree: barMet false while the task is absent, the dated log and the
//      share checks pass, the control refuses, and the verdict carries its fields
//   7. bin/brain.mjs: --no-author is a boolean and never swallows the next word (control: a value
//      flag does)
//   8. parseStatus reads Status and Next Run Time from schtasks /FO LIST output
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as S from '../tools/schedule-autopilot.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOOL = path.join(ROOT, 'tools', 'schedule-autopilot.mjs');
const ABSENT = 'BrainAutopilotTestAbsent' + process.pid + 'x' + Date.now().toString(36);
const NOW = new Date('2026-09-24T18:00:00.000Z');
const BIG_RAM = () => 1_000_000;

function cleanEnv() {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (!k.startsWith('NODE_TEST') && k !== 'NODE_OPTIONS') env[k] = v;
  return env;
}
const run = (args, opts = {}) => spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', timeout: 60_000, env: cleanEnv(), windowsHide: true, ...opts });

const planted = [];
function plant(files = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'sched-auto-'));
  planted.push(dir);
  for (const [rel, body] of Object.entries(files)) {
    const f = path.join(dir, ...rel.split('/'));
    mkdirSync(path.dirname(f), { recursive: true });
    writeFileSync(f, body);
  }
  return dir;
}
test.after(() => { for (const d of planted) rmSync(d, { recursive: true, force: true }); });

// A stand-in for tools/budget.mjs: records its argv, prints a JSON object the way the loop does,
// prints the budget wrapper's closing line, and exits with the code in exit-code.txt (default 0).
const FAKE_BUDGET = [
  "import { writeFileSync, readFileSync, existsSync } from 'node:fs';",
  "writeFileSync('started.txt', JSON.stringify(process.argv.slice(2)));",
  "console.log('fake budget argv ' + JSON.stringify(process.argv.slice(2)));",
  "console.log(JSON.stringify({ ok: true, dry: true, counts: { candidates: 2, kept: 0 }, bySource: { notes: { candidates: 2 } }, author: { on: false } }, null, 2));",
  "console.error('BUDGET done exit 0: wall 0.01 s, peak ram 12.5MB, peak dir 0.0MB');",
  "process.exitCode = existsSync('exit-code.txt') ? Number(readFileSync('exit-code.txt', 'utf8')) : 0;",
  '',
].join('\n');
const SOAK_READER = 'export function runFromCli(opts) { const soak = Number(opts.soak); return soak; }\n';
const lineCount = (f) => (existsSync(f) ? readFileSync(f, 'utf8').split('\n').filter(Boolean).length : 0);

test('1. no flag: the schtasks line at 05:00 daily, the budget-wrapped loop, the STOP guard, his order, nothing registered', () => {
  const r = run([TOOL]);
  assert.equal(r.status, 0, r.stderr);
  const out = r.stdout;
  assert.ok(out.includes('schtasks /create /tn BrainAutopilot '), out);
  assert.ok(out.includes('/sc daily /st 05:00 /f'), 'the 05:00 daily time is in the printed schtasks line');
  assert.ok(out.includes('cmd /c cd /d ' + ROOT + ' && node tools\\schedule-autopilot.mjs --tick'), 'the task runs the tick from this tree');
  assert.ok(out.includes('node tools/budget.mjs --ram-mb 6000 --disk-mb 2000 --dir state/self -- node --max-old-space-size=6000 bin/brain.mjs self-code --auto --soak 90 --author on --json'), 'the exact loop command inside the budget wrapper');
  assert.ok(out.includes('state/self/STOP exists'), 'the STOP guard is printed');
  assert.ok(out.includes('a bench flag is live'), 'the bench-flag guard is printed');
  assert.ok(out.includes('Its gotta work without me'), 'his order is quoted as the authorisation');
  assert.ok(out.includes('NOTHING WAS REGISTERED'), out);
  assert.ok(out.includes('one hour after BrainLadder (04:00)'), out);

  assert.deepEqual(S.tickArgv(), ['tools/budget.mjs', '--ram-mb', '6000', '--disk-mb', '2000', '--dir', 'state/self', '--', 'node', '--max-old-space-size=6000', 'bin/brain.mjs', 'self-code', '--auto', '--soak', '90', '--author', 'on', '--json']);
  const dry = S.tickArgv({ dry: true });
  assert.ok(dry.includes('--dry') && !dry.includes('--soak'), 'the dry form replaces --soak 90 with --dry');
  assert.deepEqual(dry.slice(dry.indexOf('--author'), dry.indexOf('--author') + 2), ['--author', 'off'], 'the dry form asks no model');
  const argv = S.createArgv();
  assert.deepEqual(argv.slice(argv.indexOf('/st'), argv.indexOf('/st') + 2), ['/st', '05:00']);
  assert.ok(S.trValue().length <= S.TR_MAX, 'the /tr value fits the 261 characters schtasks accepts');
  assert.deepEqual(S.statusArgv({ taskName: 'X' }), ['/query', '/tn', 'X', '/fo', 'LIST']);
  assert.deepEqual(S.runArgv({ taskName: 'X' }), ['/run', '/tn', 'X']);
  assert.deepEqual(S.removeArgv({ taskName: 'X' }), ['/delete', '/tn', 'X', '/f']);
  const header = readFileSync(TOOL, 'utf8').split('\nimport ')[0];
  assert.ok(header.includes('it is his call') && header.includes('HIS ORDER OF 2026-09-24 12:02') && header.includes('Its gotta work without me'), 'the header keeps the ladder rule and quotes his order beside it');
});

test('2. --status on a task name that does not exist prints "not registered" and exits 0', () => {
  const r = run([TOOL, '--status', '--task-name', ABSENT]);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes('schtasks /query /tn ' + ABSENT + ' /fo LIST'), 'it queries that one name');
  assert.match(r.stdout, /not registered/);
  const q = S.queryTask({ taskName: ABSENT });
  assert.equal(q.registered, false);
  assert.equal(q.status, null);
});

test('3. the guards: STOP, a live bench flag, a dead flag, --soak not landed, low free RAM', () => {
  // --soak not landed: no file reads a soak option, and a comment that says "soak" is not a read
  const bare = plant({ 'self/autopilot.mjs': '// the soak runs for 90 minutes\nexport const x = 1;\n' });
  let g = S.guard({ root: bare, dry: false, freeMb: 999_999 });
  assert.deepEqual([g.ok, g.why], [false, 'soak']);
  assert.match(g.line, /^autopilot tick refused: --soak is not landed yet/);
  assert.equal(S.guard({ root: bare, dry: true, freeMb: 999_999 }).ok, true, 'a dry tick does not need --soak');

  const soaked = plant({ 'self/autopilot.mjs': SOAK_READER });
  assert.deepEqual(S.soakLanded(soaked), { landed: true, files: ['self/autopilot.mjs'] });
  assert.equal(S.guard({ root: soaked, dry: false, freeMb: 999_999 }).ok, true, 'every guard passes');

  // low free RAM
  g = S.guard({ root: soaked, dry: false, freeMb: 1000 });
  assert.deepEqual([g.ok, g.why], [false, 'ram']);
  assert.match(g.line, /free RAM 1000 MB under 16384 MB/);

  // a live bench flag: this test process holds it, and the guard is asked as some other pid
  mkdirSync(path.join(soaked, 'state', 'bench-flags'), { recursive: true });
  const flag = path.join(soaked, 'state', 'bench-flags', process.pid + '.json');
  writeFileSync(flag, JSON.stringify({ pid: process.pid, command: 'node bench/something.mjs', at: NOW.toISOString() }) + '\n');
  g = S.guard({ root: soaked, dry: false, freeMb: 999_999, selfPid: -1 });
  assert.deepEqual([g.ok, g.why], [false, 'bench-flag']);
  assert.match(g.line, /a bench flag is live \(state\/bench-flags\/\d+\.json, pid \d+: node bench\/something\.mjs\)/);
  g = S.guard({ root: soaked, dry: true, freeMb: 999_999, selfPid: -1 });
  assert.equal(g.ok, true, 'a dry tick writes no source file, so it goes on');
  assert.match(g.notes[0], /bench flag live/);
  assert.equal(S.guard({ root: soaked, dry: false, freeMb: 999_999 }).ok, true, 'a flag held by the asking pid itself is not a bench beside it');

  // a dead pid's flag is not live
  const dead = spawnSync(process.execPath, ['-e', ''], { windowsHide: true }).pid;
  writeFileSync(flag, JSON.stringify({ pid: dead, command: 'gone' }) + '\n');
  assert.equal(S.liveBenchFlag(soaked, -1), null, 'pid ' + dead + ' exited, so its flag is stale');

  // STOP wins over everything, in both forms
  writeFileSync(path.join(soaked, 'state', 'self-STOP-not-it'), '');
  mkdirSync(path.join(soaked, 'state', 'self'), { recursive: true });
  writeFileSync(path.join(soaked, 'state', 'self', 'STOP'), '');
  for (const dry of [false, true]) {
    g = S.guard({ root: soaked, dry, freeMb: 1 });
    assert.deepEqual([g.ok, g.why], [false, 'stop']);
    assert.equal(g.line, 'autopilot tick refused: state/self/STOP exists (delete it to let the loop run); nothing started');
  }
});

test('4. a tick with state/self/STOP prints one line, exits 0, appends it to the dated log and starts nothing', () => {
  const root = plant({ 'state/self/STOP': '', 'tools/budget.mjs': FAKE_BUDGET, 'self/autopilot.mjs': SOAK_READER });
  const r = run([TOOL, '--tick', '--root', root]);
  assert.equal(r.status, 0, r.stderr);
  const printed = r.stdout.split('\n').filter(Boolean);
  assert.equal(printed.length, 1, r.stdout);
  assert.match(printed[0], /^autopilot tick refused: state\/self\/STOP exists/);
  const day = S.dayFiles(root, new Date());
  assert.equal(lineCount(day.log), 1);
  assert.ok(readFileSync(day.log, 'utf8').includes(printed[0]));
  assert.equal(existsSync(path.join(root, 'started.txt')), false, 'the wrapper was never started');
});

test('5. a dry tick runs the command through the wrapper, tees its transcript to the dated log and returns its exit', async () => {
  const root = plant({ 'tools/budget.mjs': FAKE_BUDGET });
  const day = S.dayFiles(root, NOW);
  assert.equal(path.basename(day.log), '2026-09-24.log');
  const t = await S.tick({ root, dry: true, now: NOW, echo: false, ramProbe: BIG_RAM });
  assert.deepEqual([t.refused, t.exit, t.peakRamMb], [false, 0, 12.5]);
  assert.equal(t.command, 'node ' + S.tickArgv({ dry: true }).join(' '));
  const argv = JSON.parse(readFileSync(path.join(root, 'started.txt'), 'utf8'));
  assert.deepEqual(argv.slice(0, 7), ['--ram-mb', '6000', '--disk-mb', '2000', '--dir', 'state/self', '--']);
  assert.equal(argv[7], process.execPath, 'the inner node is this node binary');
  assert.deepEqual(argv.slice(8), ['--max-old-space-size=6000', 'bin/brain.mjs', 'self-code', '--auto', '--dry', '--author', 'off', '--json']);
  const log = readFileSync(day.log, 'utf8');
  assert.match(log, /autopilot tick start \(dry\): node tools\/budget\.mjs /);
  assert.ok(log.includes('"candidates": 2'), 'the transcript is in the log');
  assert.ok(log.includes('BUDGET done exit 0'), 'stderr is in the log too');
  assert.match(log, /autopilot tick end: exit 0, wall \d+ ms, peak ram 12\.5 MB/);

  writeFileSync(path.join(root, 'exit-code.txt'), '3');
  const before = lineCount(day.log);
  const t3 = await S.tick({ root, dry: true, now: NOW, echo: false, ramProbe: BIG_RAM });
  assert.equal(t3.exit, 3, "the wrapper's exit code is the tick's");
  assert.ok(lineCount(day.log) > before, 'the log grows on every run');

  const live = await S.tick({ root, dry: false, now: NOW, echo: false, ramProbe: BIG_RAM });
  assert.deepEqual([live.refused, live.why, live.exit], [true, 'soak', 0], 'a live tick with no --soak reader refuses and exits 0');
});

test('6. the bar on a planted tree: not met while the task is absent, with the log, share and control checks passing', async () => {
  const boards = [8, 9, 10, 11, 12].map((n, i) => ({ board: n, at: '2026-09-2' + (3 + (i > 1 ? 1 : 0)) + 'T1' + i + ':00:00Z', files: ['f' + n + '.mjs'] }));
  boards.push({ board: 13, at: null, launched: false, files: [] });
  const root = plant({ 'tools/budget.mjs': FAKE_BUDGET, 'docs/BOARDS.json': JSON.stringify(boards) });
  const v = await S.bar({ root, taskName: ABSENT, now: NOW, quiet: true, ramProbe: BIG_RAM });
  assert.deepEqual([v.isTheBar, v.barMet], [true, false]);
  const ok = Object.fromEntries(v.checks.map((c) => [c.name, c.ok]));
  assert.deepEqual(ok, { registered: false, ready: false, 'dated log from a direct run': true, 'share over boards 8 to 12': true, 'control: the off switch refuses': true });
  assert.deepEqual([v.control.refused, v.control.why, v.control.exit, v.control.logLinesBefore, v.control.logLinesAfter, v.control.deleted], [true, 'stop', 0, 0, 1, true]);
  assert.equal(v.liveToday.guard, 'soak', 'with no soak reader the 05:00 run today would refuse');
  assert.equal(v.register.ranByThisRun, false);
  assert.ok(v.directRun.log.linesAfter > v.directRun.log.linesBefore);
  assert.deepEqual(v.authorship.launchedBoards, [8, 9, 10, 11, 12]);
  assert.equal(v.authorship.denominator, 5);
  assert.equal(typeof v.split.development, 'string');
  assert.equal(typeof v.split.heldOut, 'string');
  assert.match(v.statement, /Nobody has run --register yet/);
  assert.match(v.statement, /2 to 3 lines|0 to 1 lines/);
  assert.ok(Number.isFinite(Date.parse(v.at)) && v.command.startsWith('node tools/schedule-autopilot.mjs --bar') && v.node === process.version);
  const onDisk = JSON.parse(readFileSync(path.join(root, 'bench', 'verdicts', 'schedule-autopilot.json'), 'utf8'));
  assert.equal(onDisk.barMet, false);
  assert.ok(existsSync(path.join(root, 'bench', 'verdicts', 'authorship.json')), 'the share was written beside it');
  assert.equal(readFileSync(path.join(ROOT, 'tools', 'schedule-autopilot.mjs'), 'utf8').includes(String.fromCharCode(0x2014)), false);
});

test('7. bin/brain.mjs: --no-author is a boolean and never swallows the next word (a value flag does)', () => {
  const brain = path.join(ROOT, 'bin', 'brain.mjs');
  const boolean = run([brain, '--no-author', 'zzz-not-a-command']);
  assert.equal(boolean.status, 1, boolean.stdout);
  assert.match(boolean.stderr, /unknown command "zzz-not-a-command"/, 'the word after --no-author stays a word');
  const control = run([brain, '--author', 'zzz-not-a-command']);
  assert.equal(control.status, 0, control.stderr);
  assert.doesNotMatch(control.stderr, /unknown command/, 'a value flag takes the next word, which is the swallow --no-author used to do');
});

test('8. parseStatus reads Status and Next Run Time from schtasks /FO LIST output', () => {
  const out = ['', 'Folder: \\', 'HostName:      DESKTOP', 'TaskName:      \\BrainAutopilot', 'Next Run Time: 9/25/2026 5:00:00 AM', 'Status:        Ready', 'Logon Mode:    Interactive only', ''].join('\r\n');
  assert.deepEqual(S.parseStatus(out), { status: 'Ready', nextRun: '9/25/2026 5:00:00 AM', taskName: '\\BrainAutopilot' });
  assert.deepEqual(S.parseStatus(''), { status: null, nextRun: null, taskName: null });
});
