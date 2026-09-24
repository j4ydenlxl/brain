// bench/budget.mjs: THE BUDGET WRAPPER MUST KILL AT THE CAP, AND ONLY AT THE CAP.
//
// tools/budget.mjs exists because a census took 62 GB and a ledger took 1 TB on 2026-09-23. This
// bench runs three planted children through the real CLI (node tools/budget.mjs ... -- node
// bench/budget.mjs --plant <kind>), every one under BOTH caps, RAM 300 MB and disk 50 MB, sampled
// every 2 s:
//
//   ram   allocates 16 MB of touched buffers every 100 ms (capped by itself at 900 MB) and spawns
//         a sleeping grandchild, so the kill has a tree of depth two to take down
//   disk  writes 1 MB every 20 ms into a fresh temp dir (capped by itself at 300 MB), also with
//         a sleeping grandchild
//   pass  touches 48 MB, writes 5 MB into the dir, holds 4.5 s so at least two samples see it,
//         and exits 0 under both caps
//
// For each it prints the cap, the peak, the outcome and the time to kill after the cap was crossed,
// as an interval: the LOW end is the planted child's own clock (the moment its own RSS, or the
// bytes it wrote, passed the cap; for RAM the tree crosses no later than the child alone does, so
// this end can only understate), the HIGH end is the wrapper's bound (dead at the end of the
// verifying sample, minus the start of the last sample that read the tree under the cap; this end
// can only overstate). The bar is the high end under 5 s. After the three runs the bench lists
// every process on the machine ITSELF and checks that no pid of any killed tree is alive, by pid
// and creation time, so the "no orphans" line is not the wrapper grading its own kill.
//
//   node bench/budget.mjs                  the bar: writes bench/verdicts/budget.json once
//   node bench/budget.mjs --only ram,pass  a narrow run: writes budget-partial.json, isTheBar false
//   node bench/budget.mjs --interval-ms N  any period but 2000 is also partial
//
// Planted children (used by this bench and by test/budget.test.mjs; each ends itself after
// --life-s seconds, so a wrapper that failed to kill cannot leave one running for long):
//   node bench/budget.mjs --plant ram|disk|pass|tree|sleeper|cpu|exit [--cap-mb N] [--marker F]
//                         [--dir D] [--code N] [--life-s S] [--max-mb N]
import { spawn } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync, mkdtempSync, rmSync, existsSync, openSync, writeSync, closeSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SELF = fileURLToPath(import.meta.url);
const TOOL = path.join(ROOT, 'tools', 'budget.mjs');
const MB = 1048576;
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

export const RAM_CAP_MB = 300;
export const DISK_CAP_MB = 50;
export const KILL_BAR_MS = 5000;
export const BAR_INTERVAL_MS = 2000;
export const PLANT = SELF;

// ================================================================== planted children
// The grandchild is spawned DETACHED on purpose. On Windows libuv puts every non-detached child
// of a node process into a kill-on-close job object, so a plain node grandchild dies with its
// parent whether or not anyone kills the tree, and an orphan check on it proves nothing (the
// control in test/budget.test.mjs failed exactly that way on 2026-09-23). A detached grandchild
// escapes that job, as a python child or any non-node descendant would, so a root-only kill
// really does leave it running and only a whole-tree kill takes it down.
function spawnSleeper() {
  return spawn(process.execPath, ['--max-old-space-size=64', SELF, '--plant', 'sleeper', '--life-s', '120'], { stdio: 'ignore', windowsHide: true, detached: true });
}

function plant(kind) {
  const capMb = Number(opt('cap-mb', 0));
  const marker = opt('marker', null);
  const dir = opt('dir', null);
  const life = setTimeout(() => process.exit(99), Number(opt('life-s', 60)) * 1000);
  const mark = (obj) => { if (marker) writeFileSync(marker, JSON.stringify({ ...obj, at: Date.now(), pid: process.pid })); };
  if (kind === 'sleeper') return; // the life timer keeps it alive until it is killed or ends itself
  if (kind === 'exit') { clearTimeout(life); setTimeout(() => process.exit(Number(opt('code', 0))), 300); return; }
  if (kind === 'tree') { const kid = spawnSleeper(); mark({ phase: 'start', grandchild: kid.pid }); return; }
  if (kind === 'cpu') {
    const burn = () => { const end = Date.now() + 50; let x = 0; while (Date.now() < end) x += Math.sqrt(x + 1); setImmediate(burn); };
    burn();
    return;
  }
  if (kind === 'ram') {
    const kid = spawnSleeper();
    mark({ phase: 'start', grandchild: kid.pid });
    const hold = [];
    const chunk = 16 * MB;
    const max = Number(opt('max-mb', 900)) * MB;
    let crossed = false;
    setInterval(() => {
      if (hold.length * chunk < max) { const b = Buffer.allocUnsafe(chunk); b.fill((hold.length & 255) | 1); hold.push(b); }
      const rss = process.memoryUsage.rss();
      if (!crossed && capMb && rss > capMb * MB) { crossed = true; mark({ phase: 'crossed', ownRss: rss, grandchild: kid.pid }); }
    }, 100);
    return;
  }
  if (kind === 'disk') {
    const kid = spawnSleeper();
    mark({ phase: 'start', grandchild: kid.pid });
    const fd = openSync(path.join(dir, 'fill.bin'), 'w');
    const chunk = Buffer.alloc(MB, 7);
    const max = Number(opt('max-mb', 300)) * MB;
    let written = 0, crossed = false;
    setInterval(() => {
      if (written < max) { writeSync(fd, chunk); written += chunk.length; }
      if (!crossed && capMb && written > capMb * MB) { crossed = true; mark({ phase: 'crossed', written, grandchild: kid.pid }); }
    }, 20);
    return;
  }
  if (kind === 'pass') {
    const held = Buffer.allocUnsafe(48 * MB);
    held.fill(3);
    if (dir) {
      const fd = openSync(path.join(dir, 'small.bin'), 'w');
      const chunk = Buffer.alloc(MB, 5);
      for (let i = 0; i < 5; i++) writeSync(fd, chunk);
      closeSync(fd);
    }
    mark({ phase: 'start', held: held.length });
    clearTimeout(life);
    setTimeout(() => { held[0] = 1; process.exit(0); }, Number(opt('hold-ms', 4500)));
    return;
  }
  throw new Error('unknown plant ' + kind);
}

// ================================================================== the bench
// One case: the real CLI, both caps, its stderr streamed through with a prefix and kept.
export function runCase(name, { tmp, intervalMs = BAR_INTERVAL_MS, echo = true, extra = [] } = {}) {
  const dir = path.join(tmp, name);
  const watched = path.join(dir, 'watched');
  mkdirSync(watched, { recursive: true });
  const record = path.join(dir, 'record.json');
  const marker = path.join(dir, 'marker.json');
  const capMb = name === 'ram' ? RAM_CAP_MB : name === 'disk' ? DISK_CAP_MB : 0;
  const argv = ['--max-old-space-size=256', TOOL,
    '--ram-mb', String(RAM_CAP_MB), '--disk-mb', String(DISK_CAP_MB), '--dir', watched,
    '--record', record, '--interval-ms', String(intervalMs), ...extra,
    '--', 'node', '--max-old-space-size=512', SELF, '--plant', name, '--cap-mb', String(capMb), '--marker', marker, '--dir', watched];
  return new Promise((resolve) => {
    const t0 = Date.now();
    const child = spawn(process.execPath, argv, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    const lines = [];
    let buf = '';
    const onData = (d) => {
      buf += d;
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).replace(/\r$/, '');
        buf = buf.slice(i + 1);
        lines.push(line);
        if (echo) console.log('  | ' + line);
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('exit', (code, signal) => {
      if (buf) { lines.push(buf); if (echo) console.log('  | ' + buf); }
      const rec = existsSync(record) ? JSON.parse(readFileSync(record, 'utf8')) : null;
      const mk = existsSync(marker) ? JSON.parse(readFileSync(marker, 'utf8')) : null;
      resolve({ name, exitStatus: code, exitSignal: signal, wallMs: Date.now() - t0, lines, record: rec, marker: mk });
    });
  });
}

function childClockMs(c) {
  const k = c.record && c.record.killed;
  if (!k || !k.deadAtEpochMs || !c.marker || c.marker.phase !== 'crossed') return null;
  return k.deadAtEpochMs - c.marker.at;
}

export async function rootOnlyControl(tmp, listProcesses, aliveOf) {
  const { killPids } = await import('../tools/budget.mjs');
  const marker = path.join(tmp, 'control-tree.json');
  const root = spawn(process.execPath, ['--max-old-space-size=64', SELF, '--plant', 'tree', '--marker', marker, '--life-s', '60'], { stdio: 'ignore', windowsHide: true });
  for (let i = 0; i < 200 && !existsSync(marker); i++) await new Promise((r) => setTimeout(r, 50));
  const gpid = JSON.parse(readFileSync(marker, 'utf8')).grandchild;
  let procs = await listProcesses();
  const g = procs.get(gpid);
  const gid = g ? { pid: g.pid, created: g.created } : { pid: gpid, created: 'unknown' };
  const exited = new Promise((r) => root.once('exit', r));
  root.kill('SIGKILL');
  await exited;
  await new Promise((r) => setTimeout(r, 300));
  procs = await listProcesses();
  const aliveAfterRootKill = aliveOf([gid], procs).length;
  killPids([gid.pid]);
  await new Promise((r) => setTimeout(r, 300));
  const after = await listProcesses();
  return { grandchildParentWasRoot: !!g && g.ppid === root.pid, aliveAfterRootKill, aliveAfterCleanup: aliveOf([gid], after).length, listed: procs.size };
}

async function waitForFreeRam(minGb) {
  const until = Date.now() + 30 * 60 * 1000;
  while (os.freemem() / 1073741824 < minGb) {
    if (Date.now() > until) return false;
    console.log('free RAM ' + (os.freemem() / 1073741824).toFixed(1) + ' GB is under ' + minGb + ' GB: waiting (the BUDGETS rule)');
    await new Promise((r) => setTimeout(r, 15000));
  }
  return true;
}

async function main() {
  const { listProcesses, aliveOf } = await import('../tools/budget.mjs');
  const only = opt('only', null);
  const names = only ? only.split(',').map((s) => s.trim()).filter(Boolean) : ['ram', 'disk', 'pass'];
  const intervalMs = Number(opt('interval-ms', BAR_INTERVAL_MS));
  const narrow = !!only || intervalMs !== BAR_INTERVAL_MS;
  const command = 'node ' + ['bench/budget.mjs', ...args].join(' ');
  const freeGb = os.freemem() / 1073741824;
  console.log('budget bench: ' + names.join(', ') + ' under ram ' + RAM_CAP_MB + ' MB and disk ' + DISK_CAP_MB + ' MB, sampled every ' + intervalMs + ' ms; free RAM ' + freeGb.toFixed(1) + ' GB of ' + (os.totalmem() / 1073741824).toFixed(1));
  if (!(await waitForFreeRam(16))) { console.log('free RAM stayed under 16 GB for 30 minutes: not running'); process.exitCode = 1; return; }

  const tmp = mkdtempSync(path.join(os.tmpdir(), 'brain-budget-bench-'));
  const cases = [];
  let orphanCheck = null;
  let control = null;
  try {
    for (const name of names) {
      console.log('\n[' + name + ']');
      cases.push(await runCase(name, { tmp, intervalMs }));
    }
    // the CONTROL: the same kind of tree killed at its root only must leave its grandchild alive
    // in the bench's own listing, or "alive 0" below could not have seen an orphan at all
    control = await rootOnlyControl(tmp, listProcesses, aliveOf);
    console.log('\n[control] a root-only kill of a planted tree left ' + control.aliveAfterRootKill + ' of 1 grandchild alive in a listing of ' + control.listed + ' processes (then killed it: alive ' + control.aliveAfterCleanup + ')');
    // the bench's own listing of every process on the machine, after every run has ended
    const procs = await listProcesses();
    const killedTrees = cases.filter((c) => c.record && c.record.killed).map((c) => ({ name: c.name, tree: c.record.killed.tree }));
    const alive = [];
    for (const t of killedTrees) for (const p of aliveOf(t.tree, procs)) alive.push({ case: t.name, ...p });
    orphanCheck = { processesListed: procs.size, treesChecked: killedTrees.length, pidsChecked: killedTrees.reduce((s, t) => s + t.tree.length, 0), alive };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  // ------------------------------------------------------------ the table
  console.log('\n' + 'case'.padEnd(6) + 'cap'.padEnd(10) + 'peak'.padEnd(12) + 'outcome'.padEnd(22) + 'time to kill after the cap was crossed');
  const rows = [];
  for (const c of cases) {
    const r = c.record || {};
    const k = r.killed || null;
    const which = c.name === 'disk' ? 'disk' : 'ram';
    const capMb = which === 'disk' ? DISK_CAP_MB : RAM_CAP_MB;
    const peakMb = which === 'disk' ? r.peakDirMb : r.peakRssMb;
    const lo = childClockMs(c);
    const hi = k ? k.timeToKillBoundMs : null;
    const killedLine = c.lines.find((l) => l.startsWith('BUDGET KILLED')) || null;
    const grandchild = c.marker && c.marker.grandchild ? c.marker.grandchild : null;
    const row = {
      name: c.name, capMb, peakMb, exitStatus: c.exitStatus, outcome: r.outcome ?? null, which: k ? k.which : null,
      killedLine, childClockMs: lo, boundMs: hi, detectToDeadMs: k ? k.detectToDeadMs : null,
      treeSize: k ? k.tree.length : null, grandchildInTree: grandchild && k ? k.tree.some((p) => p.pid === grandchild) : null,
      survivors: k ? k.survivors.length : null,
      peakRssMb: r.peakRssMb ?? null, peakDirMb: r.peakDirMb ?? null, cpuSeconds: r.cpuSeconds ?? null, wallS: r.wallS ?? null,
      samples: r.samples ?? null, sampleMsMean: r.sampleMsMean ?? null, sampleMsMax: r.sampleMsMax ?? null,
      samplerPeakWsMb: r.samplerPeakWsMb ?? null, reaperPeakWsMb: r.reaperPeakWsMb ?? null, wrapperMaxRssMb: r.hostMaxRssMb ?? null, walkMsMax: r.walkMsMax ?? null,
      leftovers: r.leftovers ? r.leftovers.length : null, overCapAtExit: r.overCapAtExit || [],
    };
    if (c.name === 'pass') {
      row.pass = row.outcome === 'exit' && c.exitStatus === 0 && row.peakRssMb !== null && row.peakRssMb < RAM_CAP_MB && row.peakDirMb !== null && row.peakDirMb < DISK_CAP_MB && row.samples >= 1 && !k;
    } else {
      const pattern = new RegExp('^BUDGET KILLED ' + which + ' \\d+(\\.\\d+)?MB over ' + capMb + 'MB$');
      row.pass = row.outcome === 'killed' && row.which === which && c.exitStatus === 137 && !!killedLine && pattern.test(killedLine)
        && hi !== null && hi < KILL_BAR_MS && row.survivors === 0 && row.grandchildInTree === true;
    }
    rows.push(row);
    const peakTxt = (peakMb === null || peakMb === undefined ? 'n/a' : peakMb.toFixed(1) + ' MB');
    const capTxt = c.name === 'pass' ? RAM_CAP_MB + '/' + DISK_CAP_MB + ' MB' : capMb + ' MB';
    const peakCol = c.name === 'pass' ? (row.peakRssMb ?? 0).toFixed(1) + '/' + (row.peakDirMb ?? 0).toFixed(1) + ' MB' : peakTxt;
    const outcome = (row.outcome || 'none') + ' (exit ' + c.exitStatus + ')';
    const ttk = c.name === 'pass' ? 'not killed: finished under both caps'
      : (lo === null ? 'n/a' : (lo / 1000).toFixed(2) + ' s') + ' by the child own clock, at most ' + (hi === null ? 'n/a' : (hi / 1000).toFixed(2) + ' s') + ' by the wrapper bound';
    console.log(c.name.padEnd(6) + capTxt.padEnd(10) + peakCol.padEnd(12) + outcome.padEnd(22) + ttk + (row.pass ? '' : '  FAIL'));
  }
  const orphansOk = orphanCheck && orphanCheck.alive.length === 0;
  const controlOk = !!control && control.grandchildParentWasRoot && control.aliveAfterRootKill === 1 && control.aliveAfterCleanup === 0;
  console.log('orphans: listed ' + orphanCheck.processesListed + ' processes after the runs, checked ' + orphanCheck.pidsChecked + ' pids of ' + orphanCheck.treesChecked + ' killed trees, alive ' + orphanCheck.alive.length);
  const maxOwn = Math.max(...rows.map((r) => r.peakRssMb || 0));
  console.log('own processes: planted tree peak ' + maxOwn.toFixed(1) + ' MB, wrapper max RSS ' + Math.max(...rows.map((r) => r.wrapperMaxRssMb || 0)).toFixed(1) + ' MB, sampler peak working set ' + Math.max(...rows.map((r) => r.samplerPeakWsMb || 0)).toFixed(1) + ' MB, reaper peak working set ' + Math.max(...rows.map((r) => r.reaperPeakWsMb || 0)).toFixed(1) + ' MB, sample mean ' + (rows.reduce((s, r) => s + (r.sampleMsMean || 0), 0) / Math.max(1, rows.length)).toFixed(1) + ' ms');

  const barMet = rows.length > 0 && rows.every((r) => r.pass) && orphansOk && controlOk;
  const byName = Object.fromEntries(rows.map((r) => [r.name, r]));
  const say = (n) => {
    const r = byName[n];
    if (!r) return '';
    if (n === 'pass') return 'The pass child finished with exit ' + r.exitStatus + ' and outcome ' + r.outcome + ', peak RSS ' + r.peakRssMb + ' MB under the ' + RAM_CAP_MB + ' MB cap and peak dir ' + r.peakDirMb + ' MB under the ' + DISK_CAP_MB + ' MB cap over ' + r.samples + ' samples. ';
    return 'The ' + n + ' child (cap ' + r.capMb + ' MB) peaked at ' + r.peakMb + ' MB and was ' + r.outcome + ' with exit ' + r.exitStatus + ' and the line "' + r.killedLine + '"; its tree of ' + r.treeSize + ' processes '
      + (r.grandchildInTree ? 'included the grandchild ' : 'did NOT include the grandchild ') + 'and was dead ' + (r.childClockMs === null ? 'n/a' : r.childClockMs) + ' ms after the child own crossing clock and at most ' + r.boundMs + ' ms after the last under-cap sample (bar ' + KILL_BAR_MS + ' ms), ' + r.survivors + ' survivors. ';
  };
  const statement = 'Three planted children ran through node tools/budget.mjs under both caps (RAM ' + RAM_CAP_MB + ' MB, disk ' + DISK_CAP_MB + ' MB), sampled every ' + intervalMs + ' ms. '
    + names.map(say).join('')
    + 'Control: a planted tree killed at its root only left ' + control.aliveAfterRootKill + ' of 1 detached grandchild alive in the bench own listing, so that listing can see an orphan. '
    + 'After the runs the bench listed ' + orphanCheck.processesListed + ' processes itself and found ' + orphanCheck.alive.length + ' of the ' + orphanCheck.pidsChecked + ' killed pids alive (matched by pid and creation time). '
    + (barMet ? 'Every row met its bar.' : 'At least one row MISSED its bar: ' + rows.filter((r) => !r.pass).map((r) => r.name).join(', ') + (orphansOk ? '' : ', orphans') + (controlOk ? '' : ', control') + '.');
  const verdict = {
    at: new Date().toISOString(),
    command,
    node: process.version,
    isTheBar: !narrow,
    barMet,
    statement,
    config: { ramCapMb: RAM_CAP_MB, diskCapMb: DISK_CAP_MB, intervalMs, killBarMs: KILL_BAR_MS, cases: names, freeRamGbAtStart: Number(freeGb.toFixed(1)), platform: process.platform, cpus: os.cpus().length },
    rows,
    orphans: orphanCheck,
    control,
    ownPeaks: { plantedTreePeakMb: maxOwn, wrapperMaxRssMb: Math.max(...rows.map((r) => r.wrapperMaxRssMb || 0)), samplerPeakWsMb: Math.max(...rows.map((r) => r.samplerPeakWsMb || 0)), reaperPeakWsMb: Math.max(...rows.map((r) => r.reaperPeakWsMb || 0)) },
    records: Object.fromEntries(cases.map((c) => [c.name, c.record])),
  };
  const out = path.join(ROOT, 'bench', 'verdicts', narrow ? 'budget-partial.json' : 'budget.json');
  writeFileSync(out, JSON.stringify(verdict, null, 2) + '\n');
  console.log('\nBUDGET BAR ' + (barMet ? 'MET' : 'MISSED') + ' (isTheBar ' + verdict.isTheBar + '), wrote ' + path.relative(ROOT, out).replace(/\\/g, '/'));
  process.exitCode = barMet ? 0 : 1;
}

if (isMain) {
  const kind = opt('plant', null);
  if (kind) plant(kind);
  else main().catch((e) => { console.error(e); process.exitCode = 1; });
}
