// test/gate-slow-autopilot-bar.mjs: the bar of gap gate-slow:test/autopilot.test.mjs (board 17, the
// organism's own board). Author: board 17 builder (the organism's item), 2026-09-26.
//
// The gap (state/self/gaps.jsonl line 36, quoted in docs/boards/proposed/board-17.md): the gate row
// of test/autopilot.test.mjs measured 36209 ms against a bar of 15000 (lower is better). This script
// runs the gap's trial command on the file as it is now, TWICE, in the tree:
//   node tools/budget.mjs --ram-mb 4000 --disk-mb 2048 --dir <tmp> --record <tmp>/budget-record.json
//     -- node --max-old-space-size=4000 --test test/autopilot.test.mjs
// (4000 MB here, not the proposal's 6000: this cloud host has 16 GB shared by several builders; the
// --record path keeps the run record out of state/; TMPDIR points under <tmp> as the gate does, so
// a killed run leaves nothing behind), and the same command form on two CONTROLS, both the file as
// committed (git HEAD, read with git show) placed in a temp dir with its imports made absolute:
//   control-host  HEAD plus the host fixture alone (free RAM reads at least WAIT_FREE_RAM_MB for the
//                 whole file), so it finishes here: every speed change off, twice
//   control-head  HEAD exactly, once, stopped at 150 s: on this host its planted soak waits for
//                 16384 MB free and the first soak test times out at 120 s
// Arms alternate (bar, control-host, bar, control-host), then control-head. Prints each run's wall
// time, the runner's duration_ms, the tallies and the budget line, the run-to-run noise of each arm
// and the gap; writes bench/verdicts/gate-slow-autopilot.json ONCE (isTheBar true, barMet when both
// bar runs are under 15000 ms of wall time with every test passing).
//   PATH=$HOME/node24/bin:$PATH node test/gate-slow-autopilot-bar.mjs [--out <path>] [--smoke]
// --smoke runs one bar run and nothing else and writes <out> with isTheBar false (a check of this
// script). Not a node:test file (no .test.mjs suffix): the gate does not run it. No model, no network.
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = 'test/autopilot.test.mjs';
const BAR_MS = 15000;
const LEDGER_MS = 36209; // the gap line (state/self/gaps.jsonl line 36, quoted in docs/boards/proposed/board-17.md)
const HEAD_CAP_MS = 150_000;
const argOut = process.argv.indexOf('--out');
const SMOKE = process.argv.includes('--smoke');
const OUT = argOut > 0 ? path.resolve(process.argv[argOut + 1]) : path.join(ROOT, 'bench', 'verdicts', SMOKE ? 'gate-slow-autopilot-partial.json' : 'gate-slow-autopilot.json');
const say = (l) => process.stdout.write(l + '\n');

const trialArgs = (tmp, file) => ['tools/budget.mjs', '--ram-mb', '4000', '--disk-mb', '2048', '--dir', tmp, '--record', path.join(tmp, 'budget-record.json'),
  '--', 'node', '--max-old-space-size=4000', '--test', file];
const trialText = (file) => 'node tools/budget.mjs --ram-mb 4000 --disk-mb 2048 --dir <tmp> --record <tmp>/budget-record.json -- node --max-old-space-size=4000 --test ' + file;

/** One run of the trial command: wall ms from spawn to close, the runner's tallies, the budget line. */
function runTrial(arm, file, capMs = null) {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'brain-gsa-' + arm + '-'));
  const tdir = path.join(tmp, 't');
  mkdirSync(tdir);
  const env = { ...process.env, TMPDIR: tdir, TMP: tdir, TEMP: tdir };
  return new Promise((resolve) => {
    const t0 = performance.now();
    const c = spawn(process.execPath, trialArgs(tmp, file), { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    c.stdout.setEncoding('utf8').on('data', (d) => { out += d; });
    c.stderr.setEncoding('utf8').on('data', (d) => { out += d; });
    let capped = false;
    const timer = capMs ? setTimeout(() => { capped = true; c.kill('SIGTERM'); }, capMs) : null;
    c.on('close', (code) => {
      const wallMs = Math.round(performance.now() - t0);
      if (timer) clearTimeout(timer);
      const num = (label) => { const m = out.match(new RegExp('^ℹ ' + label + ' ([0-9.]+)$', 'm')); return m ? Number(m[1]) : null; };
      let rec = null;
      try { rec = JSON.parse(readFileSync(path.join(tmp, 'budget-record.json'), 'utf8')); } catch { rec = null; }
      const lines = out.split('\n');
      const r = {
        arm, file, exit: code, wallMs, capped, capMs,
        tests: num('tests'), pass: num('pass'), fail: num('fail'), cancelled: num('cancelled'), durationMs: num('duration_ms'),
        budgetDone: lines.find((l) => l.startsWith('BUDGET done')) || null,
        peakRamMb: rec && Number.isFinite(rec.peakRssMb) ? rec.peakRssMb : null,
        failed: lines.filter((l) => /^\s*✖ /.test(l)).map((l) => l.trim().slice(0, 160)).filter((l, i, a) => a.indexOf(l) === i).slice(0, 12),
      };
      try { rmSync(tmp, { recursive: true, force: true }); } catch { /* the OS will get it */ }
      resolve(r);
    });
  });
}

/** git HEAD's copy of the file, imports made absolute, optionally with the host fixture, in a temp dir. */
function headCopy(dir, { hostFixture }) {
  const g = spawnSync('git', ['show', 'HEAD:' + FILE], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (g.status !== 0) throw new Error('git show HEAD:' + FILE + ' failed: ' + g.stderr);
  const rootUrl = pathToFileURL(ROOT).href;
  let lastImport = -1;
  const lines = g.stdout.split('\n').map((l, i) => {
    if (/^(import |\} from )/.test(l)) { lastImport = i; return l.replace(/'\.\.\//g, "'" + rootUrl + '/').replace(/'\.\//g, "'" + rootUrl + '/test/'); }
    return l.replace(/await import\('\.\.\//g, "await import('" + rootUrl + '/');
  });
  if (hostFixture) {
    lines.splice(lastImport + 1, 0,
      "import hostOs from 'node:os';",
      "import { syncBuiltinESMExports as hostSync } from 'node:module';",
      "import { WAIT_FREE_RAM_MB as HOST_WAIT } from '" + rootUrl + "/self/improve.mjs';",
      '{ const real = hostOs.freemem; hostOs.freemem = () => Math.max(real(), (HOST_WAIT + 1) * 1024 * 1024); hostSync(); }');
  }
  const f = path.join(dir, (hostFixture ? 'control-host' : 'control-head') + '-autopilot.test.mjs');
  writeFileSync(f, lines.join('\n'));
  return f;
}

const spread = (xs) => (xs.length ? Math.max(...xs) - Math.min(...xs) : null);
const show = (r) => say('  ' + r.arm.padEnd(13) + ' wall ' + String(r.wallMs).padStart(7) + ' ms' + (r.capped ? ' (stopped at the ' + r.capMs + ' ms cap)' : '')
  + '  exit ' + r.exit + '  tests ' + r.tests + ' pass ' + r.pass + ' fail ' + r.fail + ' cancelled ' + r.cancelled + '  duration_ms ' + r.durationMs
  + (r.budgetDone ? '\n' + ' '.repeat(16) + r.budgetDone.slice(0, 150) : ''));

const at = new Date().toISOString();
const host = { cpus: os.cpus().length, totalMemMb: Math.round(os.totalmem() / 1048576), freeMemMbAtStart: Math.round(os.freemem() / 1048576), loadavgAtStart: os.loadavg().map((x) => Math.round(x * 100) / 100) };
const head = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).stdout.trim();
say('GATE-SLOW AUTOPILOT ' + at + ' node ' + process.version + ' host ' + host.cpus + ' cpus ' + host.totalMemMb + ' MB, ' + host.freeMemMbAtStart + ' MB free, load ' + host.loadavgAtStart.join(' ') + '; HEAD ' + head);
const cdir = mkdtempSync(path.join(os.tmpdir(), 'brain-gsa-controls-'));
const runs = [];
try {
  const controlHost = SMOKE ? null : headCopy(cdir, { hostFixture: true });
  const controlHead = SMOKE ? null : headCopy(cdir, { hostFixture: false });
  const plan = SMOKE ? [['bar', FILE]] : [['bar', FILE], ['control-host', controlHost], ['bar', FILE], ['control-host', controlHost], ['control-head', controlHead, HEAD_CAP_MS]];
  for (const [arm, file, cap] of plan) {
    const r = await runTrial(arm, file, cap || null);
    show(r);
    runs.push(r);
  }
} finally {
  try { rmSync(cdir, { recursive: true, force: true }); } catch { /* the OS will get it */ }
}

const bar = runs.filter((r) => r.arm === 'bar');
const ctl = runs.filter((r) => r.arm === 'control-host');
const hd = runs.find((r) => r.arm === 'control-head') || null;
const green = (r) => r.exit === 0 && r.fail === 0 && r.tests > 0 && r.pass === r.tests;
const isTheBar = !SMOKE && bar.length === 2;
const barMet = isTheBar && bar.every((r) => green(r) && r.wallMs < BAR_MS);
const worst = bar.length ? Math.max(...bar.map((r) => r.wallMs)) : null;
const ctlMean = ctl.length ? Math.round(ctl.reduce((s, r) => s + r.wallMs, 0) / ctl.length) : null;
const barMean = bar.length ? Math.round(bar.reduce((s, r) => s + r.wallMs, 0) / bar.length) : null;
const noise = { barSpreadMs: spread(bar.map((r) => r.wallMs)), controlHostSpreadMs: spread(ctl.map((r) => r.wallMs)) };
say('  noise: bar runs spread ' + noise.barSpreadMs + ' ms, control-host runs spread ' + noise.controlHostSpreadMs + ' ms');
if (ctlMean !== null) say('  gap: bar mean ' + barMean + ' ms against control-host mean ' + ctlMean + ' ms (' + (ctlMean - barMean) + ' ms, noise ' + Math.max(noise.barSpreadMs, noise.controlHostSpreadMs) + ' ms)');
say((barMet ? 'BAR MET' : isTheBar ? 'BAR MISSED' : 'NOT THE BAR (smoke)') + ': worst bar run ' + worst + ' ms against ' + BAR_MS + ' (the ledger measured ' + LEDGER_MS + ' in the gate)');

const peak = Math.max(0, ...runs.map((r) => Number(r.peakRamMb) || 0));
const statement = (isTheBar
  ? 'The trial command of gap gate-slow:test/autopilot.test.mjs ran twice on the file as it is now: '
    + bar.map((r) => r.wallMs + ' ms (' + r.pass + ' of ' + r.tests + ' tests passed, exit ' + r.exit + ')').join(' and ')
    + ', against a bar of ' + BAR_MS + ' ms where the gate ledger measured ' + LEDGER_MS + ' ms, so the bar is ' + (barMet ? 'MET' : 'MISSED') + '. '
  : 'A smoke run of this script (one bar run, no controls), not the bar: ' + bar.map((r) => r.wallMs + ' ms').join(', ') + '. ')
  + (ctl.length ? 'The control with every speed change off (git HEAD ' + head + ' with only the host fixture, so it can finish on this 16 GB host) took '
    + ctl.map((r) => r.wallMs + ' ms (' + r.pass + ' of ' + r.tests + ' passed)').join(' and ') + '; the run-to-run spread was ' + noise.barSpreadMs + ' ms for the bar arm and '
    + noise.controlHostSpreadMs + ' ms for the control. ' : '')
  + (hd ? 'The file exactly as committed ' + (hd.capped ? 'was stopped at the ' + hd.capMs + ' ms cap still running' : 'ended on its own in ' + hd.wallMs + ' ms, exit ' + hd.exit)
    + (hd.tests === null ? ' (the runner printed no tallies' : ' (' + hd.pass + ' of ' + hd.tests + ' passed')
    + (hd.failed.length ? '; the first failure it printed: ' + hd.failed[0] : '') + '): on this host its planted soak waits for 16384 MB of free RAM. ' : '')
  + 'Budget caps were 4000 MB, not the proposal\'s 6000, on a 16 GB host shared with other builders; peak RAM of any run ' + peak + ' MB.';
const v = {
  at, command: 'PATH=$HOME/node24/bin:$PATH node test/gate-slow-autopilot-bar.mjs' + (SMOKE ? ' --smoke' : ''), trialCommand: trialText(FILE), node: process.version,
  item: 'gate-slow:test/autopilot.test.mjs', board: 'BOARD 17 (the organism\'s own board)', author: 'board 17 builder (the organism\'s item)',
  isTheBar, barMet,
  bar: { metric: 'wall ms of the trial command, spawn to close', lowerIsBetter: true, mustBeUnder: BAR_MS, ledgerMeasured: LEDGER_MS, ledgerFrom: 'bench/verdicts/gate.json by node bench/gate.mjs --quiet (state/self/gaps.jsonl line 36)', runs: 2, everyTestMustPass: true },
  measured: { barRunsMs: bar.map((r) => r.wallMs), worstBarRunMs: worst, barMeanMs: barMean, controlHostRunsMs: ctl.map((r) => r.wallMs), controlHostMeanMs: ctlMean,
    controlHead: hd ? { wallMs: hd.wallMs, capped: hd.capped, capMs: hd.capMs, pass: hd.pass, fail: hd.fail, failed: hd.failed } : null },
  noise, runs, host, head, peakRamMb: peak,
  split: { development: FILE + ' (the file whose wall time is the metric) and its planted fixtures', heldOut: 'none', contaminated: false, reason: 'a test file has no held-out set: the metric is the wall time of the file itself, measured by the gap\'s own trial command' },
  controls: {
    'control-host': 'git HEAD ' + head + ' of ' + FILE + ' with its imports made absolute and the host fixture alone (os.freemem reads at least WAIT_FREE_RAM_MB for the whole file): every speed change of this item off',
    'control-head': 'git HEAD ' + head + ' of ' + FILE + ' with its imports made absolute and nothing else, stopped at ' + HEAD_CAP_MS + ' ms',
  },
  statement,
};
mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(v, null, 2) + '\n');
say('wrote ' + path.relative(ROOT, OUT));
