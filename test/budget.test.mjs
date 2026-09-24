// test/budget.test.mjs: tools/budget.mjs kills at the cap, passes exit codes through, and leaves
// no process of a killed tree alive. The planted children are the ones bench/budget.mjs uses
// (node bench/budget.mjs --plant <kind>); each ends itself after its --life-s, so a failing
// assertion cannot leave one running for long. Every temp dir is removed in an after() hook,
// not on the last line. No server, no network: node --test test/budget.test.mjs exits on its own.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, existsSync, writeFileSync, appendFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  budget, listProcesses, aliveOf, killPids, ProcessTree, DirMeter, parseProcStat, parseProcStatus,
  parseWinSample, parseCli, KILL_EXIT_CODE,
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
const KILLED_RE = (which, cap) => new RegExp('^BUDGET KILLED ' + which + ' \\d+(\\.\\d+)?' + (which === 'cpu' ? 's' : 'MB') + ' over ' + cap + (which === 'cpu' ? 's' : 'MB') + '$');

function runCli(argv) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['--max-old-space-size=256', TOOL, ...argv], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let out = '', err = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('exit', (code) => resolve({ code, out, err, lines: err.split(/\r?\n/).filter(Boolean) }));
  });
}

test('kill on RAM: a child allocating past a 300 MB cap is killed, exit 137, within 5 s of crossing', async () => {
  const d = fresh('ram');
  const lines = [];
  const rec = await budget('node', plantArgs('ram', ['--cap-mb', '300', '--marker', path.join(d, 'm.json')]),
    { ramMb: 300, record: path.join(d, 'rec.json'), stdio: 'ignore', log: (l) => lines.push(l) });
  assert.equal(rec.outcome, 'killed');
  assert.equal(rec.exitCode, KILL_EXIT_CODE);
  assert.equal(rec.killed.which, 'ram');
  assert.ok(rec.killed.valueMb > 300, 'killed above the cap: ' + rec.killed.valueMb);
  assert.ok(rec.killed.timeToKillBoundMs < 5000, 'bound ' + rec.killed.timeToKillBoundMs + ' ms');
  assert.deepEqual(rec.killed.survivors, []);
  const killedLine = lines.find((l) => l.startsWith('BUDGET KILLED'));
  assert.match(killedLine, KILLED_RE('ram', 300));
  const onDisk = JSON.parse(readFileSync(path.join(d, 'rec.json'), 'utf8'));
  assert.equal(onDisk.outcome, 'killed');
  assert.equal(onDisk.peakRssMb, rec.peakRssMb);
  for (const k of ['peakRssMb', 'cpuSeconds', 'wallS', 'outcome']) assert.ok(k in onDisk, 'record carries ' + k);
  console.log(killedLine + ' | bound ' + rec.killed.timeToKillBoundMs + ' ms, tree ' + rec.killed.tree.length);
});

test('kill on disk: the CLI kills a child writing past a 50 MB cap into the watched dir, exit 137', async () => {
  const d = fresh('disk');
  const watched = path.join(d, 'watched');
  mkdirSync(watched);
  const record = path.join(d, 'rec.json');
  const r = await runCli(['--disk-mb', '50', '--dir', watched, '--record', record, '--',
    'node', ...plantArgs('disk', ['--cap-mb', '50', '--marker', path.join(d, 'm.json'), '--dir', watched])]);
  assert.equal(r.code, 137, r.err);
  assert.match(r.lines.find((l) => l.startsWith('BUDGET KILLED')) || '', KILLED_RE('disk', 50));
  const rec = JSON.parse(readFileSync(record, 'utf8'));
  assert.equal(rec.killed.which, 'disk');
  assert.ok(rec.peakDirMb > 50, 'peak dir ' + rec.peakDirMb);
  assert.ok(rec.killed.timeToKillBoundMs < 5000, 'bound ' + rec.killed.timeToKillBoundMs);
  console.log(r.lines.find((l) => l.startsWith('BUDGET KILLED')) + ' | peak dir ' + rec.peakDirMb + ' MB');
});

test('pass-through exit code: 42 and 0 come back unchanged, a missing command is 127', async () => {
  const d = fresh('exit');
  const r42 = await runCli(['--ram-mb', '300', '--record', path.join(d, 'r42.json'), '--', 'node', ...plantArgs('exit', ['--code', '42'])]);
  assert.equal(r42.code, 42, r42.err);
  const rec42 = JSON.parse(readFileSync(path.join(d, 'r42.json'), 'utf8'));
  assert.equal(rec42.outcome, 'exit');
  assert.equal(rec42.exitCode, 42);
  assert.equal(rec42.killed, null);
  const r0 = await runCli(['--cpu-s', '30', '--record', path.join(d, 'r0.json'), '--', 'node', ...plantArgs('exit', ['--code', '0'])]);
  assert.equal(r0.code, 0, r0.err);
  const missing = await budget('brain-budget-no-such-command-' + process.pid, [], { record: false, stdio: 'ignore', log: () => {} });
  assert.equal(missing.outcome, 'error');
  assert.equal(missing.exitCode, 127);
  const bad = await runCli(['--ram-mb', '300']);
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
  await sleep(300);
  procs = await listProcesses();
  assert.equal(aliveOf([gid], procs).length, 0, 'control cleanup');

  // the wrapper: the same shape of tree under a RAM cap, killed whole
  const m2 = path.join(d, 'ram.json');
  const rec = await budget('node', plantArgs('ram', ['--cap-mb', '300', '--marker', m2]), { ramMb: 300, record: false, stdio: 'ignore', log: () => {} });
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
  const arm = async (extra) => {
    const marker = path.join(d, 'm' + (++seq) + '.json');
    const w = spawn(process.execPath, ['--max-old-space-size=256', TOOL, '--ram-mb', '300', '--no-record', ...extra, '--',
      'node', ...plantArgs('tree', ['--marker', marker, '--life-s', '60'])], { stdio: 'ignore', windowsHide: true });
    for (let i = 0; i < 200 && !existsSync(marker); i++) await sleep(50);
    const m = JSON.parse(readFileSync(marker, 'utf8'));
    let procs = await listProcesses();
    const ids = [m.pid, m.grandchild].map((pid) => ({ pid, created: procs.get(pid) && procs.get(pid).created }));
    assert.equal(aliveOf(ids, procs).length, 2, 'child and grandchild both run before the wrapper is killed');
    w.kill('SIGKILL');
    await new Promise((r) => w.once('exit', r));
    await sleep(3500); // the same wait in both arms: the reaper needs 300 ms, one listing, one kill
    procs = await listProcesses();
    const alive = aliveOf(ids, procs);
    killPids(alive.map((p) => p.pid)); // clean up whatever an arm left, pass or fail
    return alive.map((p) => (p.pid === m.grandchild ? 'grandchild' : 'child'));
  };
  const control = await arm(['--no-reaper']);
  assert.deepEqual(control, ['grandchild'], 'CONTROL: with no reaper the detached grandchild outlives the killed wrapper');
  const withReaper = await arm([]);
  assert.deepEqual(withReaper, [], 'with the reaper nothing of the tree outlives the killed wrapper');
  console.log('wrapper killed outright: no reaper left ' + JSON.stringify(control) + ', reaper left ' + JSON.stringify(withReaper));
});

test('kill on CPU seconds, and a status line at the status period', async () => {
  const lines = [];
  const rec = await budget('node', plantArgs('cpu', ['--life-s', '30']), { cpuS: 1, intervalMs: 500, statusMs: 400, record: false, stdio: 'ignore', log: (l) => lines.push(l) });
  assert.equal(rec.outcome, 'killed');
  assert.equal(rec.killed.which, 'cpu');
  assert.match(lines.find((l) => l.startsWith('BUDGET KILLED')), KILLED_RE('cpu', 1));
  const status = lines.filter((l) => l.startsWith('BUDGET status'));
  assert.ok(status.length >= 1, 'at least one status line: ' + lines.join(' | '));
  assert.match(status[0], /^BUDGET status \d+ s: ram \d+\.\dMB \(peak \d+\.\dMB, cap none\), cpu \d+\.\d\ds \(cap 1s\), procs \d+$/);
});

test('library abort: an AbortSignal stops the whole tree, outcome aborted, exit 130', async () => {
  const d = fresh('abort');
  const marker = path.join(d, 'm.json');
  const ac = new AbortController();
  const run = budget('node', plantArgs('tree', ['--marker', marker, '--life-s', '60']), { ramMb: 300, record: false, stdio: 'ignore', log: () => {}, signal: ac.signal });
  for (let i = 0; i < 200 && !existsSync(marker); i++) await sleep(50);
  await sleep(2500); // one more sample, so the grandchild is a known member when the abort lands
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
