// test/budget.test.mjs: tools/budget.mjs kills at the cap, passes exit codes through, and leaves
// no process of a killed tree alive. The planted children are the ones bench/budget.mjs uses
// (node bench/budget.mjs --plant <kind>); each ends itself after its --life-s, so a failing
// assertion cannot leave one running for long. Every temp dir is removed in an after() hook,
// not on the last line. No server, no network: node --test test/budget.test.mjs exits on its own.
//
// Faster, same claims (board 17 builder (the organism's item), gap gate-slow:test/budget.test.mjs,
// 2026-09-26): the file took 30574 ms in the gate. What it waited on: the wrapper's default 2000 ms
// sample period (every kill waited for a sample), caps high enough to need about 2 s of planted
// allocation, and two fixed sleeps (3500 ms per reaper arm, run one after the other, and 2500 ms
// before the abort). Now: every wrapper samples every 100 ms (--interval-ms / intervalMs, flags
// tools/budget.mjs already had), the RAM cap is 200 MB, the disk cap 10 MB and the CPU cap 0.5 s
// (each still crossed by the planted child's own allocation, writing or burning), the fixed sleeps
// are replaced by the event they stood for (a sample or status line that lists the grandchild, a
// listing where the tree is gone, bounded by the old wait), the two reaper arms run side by side
// and are judged in ONE listing, and the independent CLI runs of the exit-code test run at once.
// No assertion was dropped or loosened; the reaper control's expected survivors are exact per
// platform (Windows' kill-on-close job takes the direct child, Linux takes nothing down).
//
// The Linux reaper (board 17 builder (the organism's item), gap budget-linux, 2026-09-26): one
// case added, nothing else changed. A detached great-grandchild two levels below the child, born
// after the wrapper's last report, dies with a wrapper killed outright (the reaper's /proc walk,
// tools/budget.mjs reapTree), and two controls at the same shape leave the detached descendants
// alive: the same CLI with its walker absent, and the library reap with no readable /proc.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, existsSync, writeFileSync, appendFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  budget, listProcesses, aliveOf, killPids, ProcessTree, DirMeter, parseProcStat, parseProcStatus,
  parseWinSample, parseCli, KILL_EXIT_CODE, reapTree,
} from '../tools/budget.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const TOOL = path.join(ROOT, 'tools', 'budget.mjs');
const PLANT = path.join(ROOT, 'bench', 'budget.mjs');
const MB = 1048576;
const TMP = mkdtempSync(path.join(os.tmpdir(), 'brain-budget-test-'));
after(() => rmSync(TMP, { recursive: true, force: true }));
let seq = 0;
const fresh = (name) => { const d = path.join(TMP, name + '-' + (++seq)); mkdirSync(d, { recursive: true }); return d; };
const plantArgs = (kind, extra = []) => ['--max-old-space-size=512', PLANT, '--plant', kind, ...extra];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const KILLED_RE = (which, cap) => new RegExp('^BUDGET KILLED ' + which + ' \\d+(\\.\\d+)?' + (which === 'cpu' ? 's' : 'MB') + ' over ' + String(cap).replace('.', '\\.') + (which === 'cpu' ? 's' : 'MB') + '$');
// the caps and the sample period every kill below runs under (see the header)
const RAM_CAP_MB = 200;
const DISK_CAP_MB = 10;
const CPU_CAP_S = 0.5;
const INTERVAL_MS = 100;
// a bounded wait that clears its own timer, so a passing test leaves nothing keeping the file alive
async function within(promise, ms, what) {
  let t;
  const late = new Promise((_, reject) => { t = setTimeout(() => reject(new Error(what + ': not within ' + ms + ' ms')), ms); });
  try { return await Promise.race([promise, late]); } finally { clearTimeout(t); }
}
// poll fn until it returns a truthy value or ms have passed; returns the last value
async function until(fn, ms, stepMs = 50) {
  const end = Date.now() + ms;
  for (;;) { const v = await fn(); if (v || Date.now() >= end) return v; await sleep(stepMs); }
}

function runCli(argv) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['--max-old-space-size=256', TOOL, ...argv], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let out = '', err = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('exit', (code) => resolve({ code, out, err, lines: err.split(/\r?\n/).filter(Boolean) }));
  });
}

test('kill on RAM: a child allocating past a 200 MB cap is killed, exit 137, within 5 s of crossing', async () => {
  const d = fresh('ram');
  const lines = [];
  const rec = await budget('node', plantArgs('ram', ['--cap-mb', String(RAM_CAP_MB), '--marker', path.join(d, 'm.json')]),
    { ramMb: RAM_CAP_MB, intervalMs: INTERVAL_MS, record: path.join(d, 'rec.json'), stdio: 'ignore', log: (l) => lines.push(l) });
  assert.equal(rec.outcome, 'killed');
  assert.equal(rec.exitCode, KILL_EXIT_CODE);
  assert.equal(rec.killed.which, 'ram');
  assert.ok(rec.killed.valueMb > RAM_CAP_MB, 'killed above the cap: ' + rec.killed.valueMb);
  assert.ok(rec.killed.timeToKillBoundMs < 5000, 'bound ' + rec.killed.timeToKillBoundMs + ' ms');
  assert.deepEqual(rec.killed.survivors, []);
  const killedLine = lines.find((l) => l.startsWith('BUDGET KILLED'));
  assert.match(killedLine, KILLED_RE('ram', RAM_CAP_MB));
  const onDisk = JSON.parse(readFileSync(path.join(d, 'rec.json'), 'utf8'));
  assert.equal(onDisk.outcome, 'killed');
  assert.equal(onDisk.peakRssMb, rec.peakRssMb);
  for (const k of ['peakRssMb', 'cpuSeconds', 'wallS', 'outcome']) assert.ok(k in onDisk, 'record carries ' + k);
  console.log(killedLine + ' | bound ' + rec.killed.timeToKillBoundMs + ' ms, tree ' + rec.killed.tree.length);
});

test('kill on disk: the CLI kills a child writing past a 10 MB cap into the watched dir, exit 137', async () => {
  const d = fresh('disk');
  const watched = path.join(d, 'watched');
  mkdirSync(watched);
  const record = path.join(d, 'rec.json');
  const r = await runCli(['--disk-mb', String(DISK_CAP_MB), '--dir', watched, '--interval-ms', String(INTERVAL_MS), '--record', record, '--',
    'node', ...plantArgs('disk', ['--cap-mb', String(DISK_CAP_MB), '--marker', path.join(d, 'm.json'), '--dir', watched])]);
  assert.equal(r.code, 137, r.err);
  assert.match(r.lines.find((l) => l.startsWith('BUDGET KILLED')) || '', KILLED_RE('disk', DISK_CAP_MB));
  const rec = JSON.parse(readFileSync(record, 'utf8'));
  assert.equal(rec.killed.which, 'disk');
  assert.ok(rec.peakDirMb > DISK_CAP_MB, 'peak dir ' + rec.peakDirMb);
  assert.ok(rec.killed.timeToKillBoundMs < 5000, 'bound ' + rec.killed.timeToKillBoundMs);
  console.log(r.lines.find((l) => l.startsWith('BUDGET KILLED')) + ' | peak dir ' + rec.peakDirMb + ' MB');
});

test('pass-through exit code: 42 and 0 come back unchanged, a missing command is 127', async () => {
  const d = fresh('exit');
  // four independent runs (their own records, no shared state), started at once
  const [r42, r0, missing, bad] = await Promise.all([
    runCli(['--ram-mb', '300', '--record', path.join(d, 'r42.json'), '--', 'node', ...plantArgs('exit', ['--code', '42'])]),
    runCli(['--cpu-s', '30', '--record', path.join(d, 'r0.json'), '--', 'node', ...plantArgs('exit', ['--code', '0'])]),
    budget('brain-budget-no-such-command-' + process.pid, [], { record: false, stdio: 'ignore', log: () => {} }),
    runCli(['--ram-mb', '300']),
  ]);
  assert.equal(r42.code, 42, r42.err);
  const rec42 = JSON.parse(readFileSync(path.join(d, 'r42.json'), 'utf8'));
  assert.equal(rec42.outcome, 'exit');
  assert.equal(rec42.exitCode, 42);
  assert.equal(rec42.killed, null);
  assert.equal(r0.code, 0, r0.err);
  assert.equal(missing.outcome, 'error');
  assert.equal(missing.exitCode, 127);
  assert.equal(bad.code, 2, 'no command after -- is a usage error');
});

test('no orphan processes after a kill, proved by listing the pid tree (with a control that CAN see an orphan)', async () => {
  // control: kill only the root of a planted tree; the grandchild must still be listed alive,
  // or the listing below could not see an orphan even if one existed
  const d = fresh('orphan');
  const marker = path.join(d, 'tree.json');
  const root = spawn(process.execPath, plantArgs('tree', ['--marker', marker, '--life-s', '60']), { stdio: 'ignore', windowsHide: true });
  for (let i = 0; i < 100 && !existsSync(marker); i++) await sleep(50);
  const gpid = JSON.parse(readFileSync(marker, 'utf8')).grandchild;
  let procs = await listProcesses();
  const g = procs.get(gpid);
  assert.ok(g && g.ppid === root.pid, 'the grandchild is listed with the root as its parent');
  const gid = { pid: g.pid, created: g.created };
  root.kill('SIGKILL');
  await new Promise((r) => root.once('exit', r));
  procs = await listProcesses();
  assert.equal(aliveOf([gid], procs).length, 1, 'CONTROL: killing only the root leaves the grandchild alive and the listing sees it');
  killPids([gid.pid]);
  // the old fixed 300 ms wait, now a listing every 50 ms until the grandchild is gone (same bound)
  await until(async () => { procs = await listProcesses(); return aliveOf([gid], procs).length === 0; }, 300);
  assert.equal(aliveOf([gid], procs).length, 0, 'control cleanup');

  // the wrapper: the same shape of tree under a RAM cap, killed whole
  const m2 = path.join(d, 'ram.json');
  const rec = await budget('node', plantArgs('ram', ['--cap-mb', String(RAM_CAP_MB), '--marker', m2]), { ramMb: RAM_CAP_MB, intervalMs: INTERVAL_MS, record: false, stdio: 'ignore', log: () => {} });
  assert.equal(rec.outcome, 'killed');
  const grand = JSON.parse(readFileSync(m2, 'utf8')).grandchild;
  assert.ok(rec.killed.tree.length >= 2, 'the killed tree has depth: ' + JSON.stringify(rec.killed.tree));
  assert.ok(rec.killed.tree.some((p) => p.pid === grand), 'the grandchild is in the killed tree');
  assert.ok(rec.killed.tree.some((p) => p.pid === rec.pid), 'the root is in the killed tree');
  procs = await listProcesses();
  const alive = aliveOf(rec.killed.tree, procs);
  assert.deepEqual(alive, [], 'no pid of the killed tree is alive in a fresh listing of ' + procs.size + ' processes');
  console.log('killed tree ' + rec.killed.tree.map((p) => p.pid + '<-' + p.ppid).join(' ') + ', alive after: ' + alive.length + ' of ' + procs.size + ' listed');
});

test('a wrapper killed outright: its reaper takes the tree down (control: --no-reaper leaves the detached grandchild alive)', async () => {
  const d = fresh('reaper');
  // Both arms run side by side, are killed together and are judged in ONE listing, so the wait
  // after the kill is the same for both by construction. A wrapper is killed only after one of its
  // status lines lists the grandchild: the reaper is told the tree after every sample and before
  // the status line, so the reaper arm is judged on a tree its reaper was told about (on Linux an
  // orphan is re-parented, so a grandchild the wrapper never sampled has no link left to it).
  const arm = async (extra) => {
    const marker = path.join(d, 'm' + (++seq) + '.json');
    const w = spawn(process.execPath, ['--max-old-space-size=256', TOOL, '--ram-mb', '300', '--interval-ms', String(INTERVAL_MS), '--status-s', '0.1', '--no-record', ...extra, '--',
      'node', ...plantArgs('tree', ['--marker', marker, '--life-s', '60'])], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
    const exited = new Promise((r) => w.once('exit', r));
    let err = '';
    const sawTree = new Promise((resolve, reject) => {
      w.stderr.on('data', (c) => { err += c; if (/^BUDGET status .*, procs ([2-9]|\d\d+)$/m.test(err)) resolve(); });
      exited.then(() => reject(new Error('the wrapper ended before it sampled the tree: ' + err)));
    });
    await within(sawTree, 10000, 'a status line listing child and grandchild');
    await until(() => existsSync(marker), 10000);
    const m = JSON.parse(readFileSync(marker, 'utf8'));
    const procs = await listProcesses();
    const ids = [m.pid, m.grandchild].map((pid) => ({ pid, created: procs.get(pid) && procs.get(pid).created }));
    assert.equal(aliveOf(ids, procs).length, 2, 'child and grandchild both run before the wrapper is killed');
    return { w, exited, m, ids };
  };
  const arms = await Promise.all([arm(['--no-reaper']), arm([])]);
  for (const a of arms) a.w.kill('SIGKILL');
  await Promise.all(arms.map((a) => a.exited));
  // the old fixed 3500 ms wait is now the bound: list every 100 ms until the reaper arm's tree is gone
  let procs;
  await until(async () => { procs = await listProcesses(); return aliveOf(arms[1].ids, procs).length === 0; }, 3500, 100);
  const left = arms.map((a) => aliveOf(a.ids, procs));
  killPids(left.flat().map((p) => p.pid)); // clean up whatever an arm left, pass or fail
  const [control, withReaper] = arms.map((a, i) => left[i].map((p) => (p.pid === a.m.grandchild ? 'grandchild' : 'child')));
  // Windows: libuv's kill-on-close job takes the wrapper's direct child down with it, so the
  // detached grandchild alone survives; Linux: nothing takes anything down, both survive.
  const controlLeft = process.platform === 'win32' ? ['grandchild'] : ['child', 'grandchild'];
  assert.deepEqual(control, controlLeft, 'CONTROL: with no reaper the detached grandchild outlives the killed wrapper');
  assert.deepEqual(withReaper, [], 'with the reaper nothing of the tree outlives the killed wrapper');
  console.log('wrapper killed outright: no reaper left ' + JSON.stringify(control) + ', reaper left ' + JSON.stringify(withReaper));
});

// board 17 builder (the organism's item), gap budget-linux, 2026-09-26: the Linux reaper walks
// /proc (tools/budget.mjs reapTree over act/shell.mjs killPosixTree). A chain written into the
// temp dir: the child (level 2) spawns a DETACHED grandchild (level 1) after DELAY ms, which
// spawns a DETACHED great-grandchild (level 0) after DELAY ms more, each in a group and a session
// of its own; every level writes its pid to <prefix>.<level>. Nothing of it is in bench/budget.mjs.
const CHAIN_SRC = [
  "import { spawn } from 'node:child_process';",
  "import { writeFileSync, renameSync } from 'node:fs';",
  'const [prefix, levels, delayMs, lifeS] = process.argv.slice(2);',
  'const n = Number(levels);',
  "const put = (f, v) => { writeFileSync(f + '.tmp', JSON.stringify(v)); renameSync(f + '.tmp', f); };",
  "put(prefix + '.' + n, { pid: process.pid, ppid: process.ppid, level: n });",
  "if (n > 0) setTimeout(() => { spawn(process.execPath, ['--max-old-space-size=64', process.argv[1], prefix, String(n - 1), delayMs, lifeS], { stdio: 'ignore', detached: true }).unref(); }, Number(delayMs));",
  'setTimeout(() => process.exit(0), Number(lifeS) * 1000);',
].join('\n') + '\n';
const CHAIN_DELAY_MS = 300;
const LEVEL_NAME = ['great-grandchild', 'grandchild', 'child'];

test('the Linux reaper walks /proc: a detached great-grandchild two levels below the child, born after the last report, dies with the killed wrapper (controls: the walker absent, and no readable /proc, the group kill alone, leave the detached descendants alive)', {
  skip: process.platform === 'win32' ? 'the /proc walk is the Linux reaper; the Windows reaper is unchanged and tested above' : false,
}, async () => {
  const d = fresh('walk');
  const chain = path.join(d, 'chain.mjs');
  writeFileSync(chain, CHAIN_SRC);
  const chainArgs = (prefix) => ['--max-old-space-size=64', chain, prefix, '2', String(CHAIN_DELAY_MS), '60'];
  const readLevel = (prefix, n) => { try { return JSON.parse(readFileSync(prefix + '.' + n, 'utf8')); } catch { return null; } };
  // every level running, as identities {pid, created, level} from one listing
  const wholeChain = async (prefix) => {
    await until(() => readLevel(prefix, 0), 10000);
    const lv = [0, 1, 2].map((n) => readLevel(prefix, n));
    assert.ok(lv.every(Boolean), 'all three levels wrote their pid: ' + JSON.stringify(lv));
    const procs = await listProcesses();
    const ids = lv.map((x) => ({ pid: x.pid, created: procs.get(x.pid) && procs.get(x.pid).created, level: x.level }));
    assert.equal(aliveOf(ids, procs).length, 3, 'child, grandchild and great-grandchild all run before the reap');
    assert.equal(procs.get(lv[0].pid).ppid, lv[1].pid, 'the great-grandchild hangs off the grandchild');
    assert.equal(procs.get(lv[1].pid).ppid, lv[2].pid, 'the grandchild hangs off the child');
    assert.notEqual(procs.get(lv[0].pid).pgrp, procs.get(lv[2].pid).pgrp, 'the great-grandchild is out of the child group (detached)');
    return ids;
  };
  const names = (ids, procs) => aliveOf(ids, procs).map((p) => LEVEL_NAME[ids.find((x) => x.pid === p.pid).level]);

  // (a) the real path: a wrapper killed outright. Its only sample is the one at spawn (the next is
  // 60 s away), so the reaper's last report holds the child at most: the grandchild and the
  // great-grandchild are born after it and only the /proc walk can find them.
  // CONTROL at the same command: a copy of tools/budget.mjs with no act/shell.mjs beside it, so its
  // reaper cannot load the walker and falls back to the report-based reap (the walk off).
  const bare = path.join(d, 'tools', 'budget.mjs');
  mkdirSync(path.dirname(bare), { recursive: true });
  writeFileSync(bare, readFileSync(TOOL));
  const cli = async (tool, tag) => {
    const prefix = path.join(d, tag);
    const w = spawn(process.execPath, ['--max-old-space-size=256', tool, '--ram-mb', '300', '--interval-ms', '60000', '--no-record', '--',
      'node', ...chainArgs(prefix)], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
    const exited = new Promise((r) => w.once('exit', r));
    let err = '';
    w.stderr.on('data', (c) => { err += c; });
    const ids = await wholeChain(prefix);
    assert.equal(w.exitCode, null, 'the wrapper still runs when it is killed: ' + err);
    w.kill('SIGKILL');
    await exited;
    return ids;
  };
  // (b) the same walk as a library call, on a chain spawned the way the wrapper spawns its child
  // (detached), with the report a wrapper makes at its first sample: the child alone.
  // (c) CONTROL, the walk off: the same chain and report, reaped with no readable /proc.
  const lib = async (tag, opts) => {
    const prefix = path.join(d, tag);
    const c = spawn(process.execPath, chainArgs(prefix), { stdio: 'ignore', detached: true, windowsHide: true });
    const ids = await wholeChain(prefix);
    const root = ids.find((x) => x.level === 2);
    const rep = await reapTree(c.pid, { ids: [[root.pid, root.created]], pgrp: c.pid }, opts);
    return { ids, rep };
  };
  const [cliIds, bareIds, walked, control] = await Promise.all([cli(TOOL, 'cli'), cli(bare, 'bare'), lib('lib', {}), lib('ctl', { procRoot: path.join(d, 'no-proc') })]);
  // the old fixed 3500 ms reaper bound: list every 100 ms until the walked chains are gone and the
  // walker-absent control's reaper has killed its child (what it can reach), so all four are judged in ONE listing
  const bareChild = bareIds.filter((x) => x.level === 2);
  let procs;
  await until(async () => { procs = await listProcesses(); return aliveOf([...cliIds, ...walked.ids, ...bareChild], procs).length === 0; }, 3500, 100);
  const left = { cli: names(cliIds, procs), bare: names(bareIds, procs), lib: names(walked.ids, procs), control: names(control.ids, procs) };
  killPids([...cliIds, ...bareIds, ...walked.ids, ...control.ids].map((x) => x.pid)); // clean up whatever an arm left, pass or fail
  console.log('the /proc walk: wrapper killed outright left ' + JSON.stringify(left.cli) + ' (control, walker absent: ' + JSON.stringify(left.bare)
    + '), library reap left ' + JSON.stringify(left.lib) + ' (control, no /proc: ' + JSON.stringify(left.control) + ')');
  console.log(walked.rep.line);
  console.log(control.rep.line);
  assert.deepEqual(left.bare, ['great-grandchild', 'grandchild'], 'CONTROL: a reaper with no walker leaves the detached descendants alive');
  assert.deepEqual(left.control, ['great-grandchild', 'grandchild'], 'CONTROL: the group kill alone leaves the detached descendants alive');
  assert.equal(control.rep.by, 'group');
  assert.equal(control.rep.proc, false);
  assert.match(control.rep.line, /^BUDGET reaper: no readable .* on this platform: the process group kill and the reported pids alone/);
  assert.equal(walked.rep.by, 'walk');
  assert.equal(walked.rep.walker, 'act/shell.mjs killPosixTree');
  assert.ok(walked.rep.found >= 2, 'the walk found the grandchild and the great-grandchild: ' + walked.rep.line);
  assert.match(walked.rep.line, /^BUDGET reaper: the \/proc walk \(act\/shell\.mjs killPosixTree\) from 1 root found \d+ descendants? and killed \d+ deepest first/);
  assert.deepEqual(left.lib, [], 'the library walk leaves nothing of the chain alive');
  assert.deepEqual(left.cli, [], 'the killed wrapper reaper leaves nothing of the chain alive, the great-grandchild included');
});

test('kill on CPU seconds, and a status line at the status period', async () => {
  const lines = [];
  const rec = await budget('node', plantArgs('cpu', ['--life-s', '30']), { cpuS: CPU_CAP_S, intervalMs: INTERVAL_MS, statusMs: 100, record: false, stdio: 'ignore', log: (l) => lines.push(l) });
  assert.equal(rec.outcome, 'killed');
  assert.equal(rec.killed.which, 'cpu');
  assert.match(lines.find((l) => l.startsWith('BUDGET KILLED')), KILLED_RE('cpu', CPU_CAP_S));
  const status = lines.filter((l) => l.startsWith('BUDGET status'));
  assert.ok(status.length >= 1, 'at least one status line: ' + lines.join(' | '));
  assert.match(status[0], new RegExp('^BUDGET status \\d+ s: ram \\d+\\.\\dMB \\(peak \\d+\\.\\dMB, cap none\\), cpu \\d+\\.\\d\\ds \\(cap ' + String(CPU_CAP_S).replace('.', '\\.') + 's\\), procs \\d+$'));
});

test('library abort: an AbortSignal stops the whole tree, outcome aborted, exit 130', async () => {
  const d = fresh('abort');
  const marker = path.join(d, 'm.json');
  const ac = new AbortController();
  let sampledTree;
  const sawTree = new Promise((resolve) => { sampledTree = resolve; });
  const run = budget('node', plantArgs('tree', ['--marker', marker, '--life-s', '60']), {
    ramMb: 300, intervalMs: INTERVAL_MS, record: false, stdio: 'ignore', log: () => {}, signal: ac.signal,
    onSample: (row) => { if (row.procs >= 2) sampledTree(); },
  });
  await until(() => existsSync(marker), 10000);
  // the old fixed 2500 ms wait stood for "one more sample": now the sample that lists the grandchild
  await within(sawTree, 10000, 'a sample listing child and grandchild');
  ac.abort();
  const rec = await run;
  assert.equal(rec.outcome, 'aborted');
  assert.equal(rec.exitCode, 130);
  assert.equal(rec.killed.timeToKillBoundMs, null, 'an abort crossed no cap');
  const grand = JSON.parse(readFileSync(marker, 'utf8')).grandchild;
  assert.ok(rec.killed.tree.some((p) => p.pid === grand), 'the grandchild was in the stopped tree');
  const procs = await listProcesses();
  assert.deepEqual(aliveOf(rec.killed.tree, procs), [], 'nothing of the aborted tree is alive');
});

test('ProcessTree: membership by identity, a reused pid is not the tree, an orphan still is', () => {
  const P = (pid, ppid, created, ws = MB, cpuS = 1) => [pid, { pid, ppid, created: String(created), ws, priv: ws, cpuS, state: 'R', pgrp: 0 }];
  const t = new ProcessTree(10);
  let live = t.update(new Map([P(10, 1, 100), P(11, 10, 105), P(12, 10, 50), P(20, 1, 90)]));
  assert.deepEqual(live.map((p) => p.pid).sort(), [10, 11], 'pid 12 names 10 as parent but is older than it: not the tree');
  // the root dies, pid 10 is reused by a stranger (created 200) that has a child 13
  live = t.update(new Map([P(10, 1, 200), P(11, 10, 105, MB, 2), P(13, 10, 210)]));
  assert.deepEqual(live.map((p) => p.pid), [11], 'the orphan 11 is still the tree; the stranger and its child are not');
  assert.equal(t.cpuTotal(), 1 + 2, 'CPU is summed per identity at its latest reading');
});

test('DirMeter: new files, grown files and removed files, readdir only when a dir mtime moves', async () => {
  const d = fresh('dirmeter');
  mkdirSync(path.join(d, 'a', 'b'), { recursive: true });
  writeFileSync(path.join(d, 'a', 'b', 'one.bin'), Buffer.alloc(1000));
  const m = new DirMeter(d, { fullEvery: 0 });
  assert.equal(m.measure().bytes, 1000);
  const quiet = m.measure();
  assert.equal(quiet.readdirs, 0, 'a quiet tree is stat only');
  appendFileSync(path.join(d, 'a', 'b', 'one.bin'), Buffer.alloc(500));
  assert.equal(m.measure().bytes, 1500, 'an append is seen although the dir mtime did not move');
  await sleep(20);
  writeFileSync(path.join(d, 'a', 'two.bin'), Buffer.alloc(250));
  assert.equal(m.measure().bytes, 1750);
  rmSync(path.join(d, 'a', 'b'), { recursive: true });
  assert.equal(m.measure().bytes, 250);
});

test('parsers: /proc stat and status (the Linux container path), the Windows sample line, the CLI', () => {
  const stat = '4242 (node worker (x)) S 4200 4242 4200 0 -1 4194560 100 0 0 0 250 50 0 0 20 0 11 0 987654 123456789 5000 18446744073709551615';
  const s = parseProcStat(stat);
  assert.deepEqual([s.pid, s.state, s.ppid, s.pgrp, s.utime, s.stime, s.starttime, s.rssPages], [4242, 'S', 4200, 4242, 250, 50, '987654', 5000]);
  const st = parseProcStatus('Name:\tnode\nVmRSS:\t  204800 kB\nRssAnon:\t  150000 kB\n');
  assert.equal(st.vmRss, 204800 * 1024);
  assert.equal(st.rssAnon, 150000 * 1024);
  const w = parseWinSample('4,0,1000,500,0,0;77,4,2048,1024,12345678,134346890463971940;');
  assert.equal(w.get(77).ppid, 4);
  assert.equal(w.get(77).created, '134346890463971940', 'a FileTime past 2^53 stays an exact string');
  assert.equal(w.get(77).cpuS, 1.2345678);
  const c = parseCli(['--ram-mb', '300', '--status-s=5', '--no-record', '--', 'node', 'x.mjs', '--ram-mb', '9']);
  assert.equal(c.cmd, 'node');
  assert.deepEqual(c.args, ['x.mjs', '--ram-mb', '9'], 'everything after -- belongs to the command');
  assert.equal(c.caps.statusMs, 5000);
  assert.equal(c.caps.record, false);
  assert.throws(() => parseCli(['--ram-mb', '300', '--bogus', '1', '--', 'node']), /unknown option/);
});
