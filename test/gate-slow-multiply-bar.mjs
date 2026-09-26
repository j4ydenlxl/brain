// test/gate-slow-multiply-bar.mjs: the bar of gap gate-slow:test/multiply.test.mjs (board 17, the
// organism's own board). Author: board 17 builder (the organism's item), 2026-09-26.
//
// Runs the trial command of the gap TWICE in the tree:
//   node tools/budget.mjs --ram-mb 4000 --disk-mb 2048 --dir <tmp> --record <tmp>/budget-record.json
//     -- node --max-old-space-size=4000 --test test/multiply.test.mjs
// (4000 MB here, not the proposal's 6000: this cloud host has 16 GB shared by several builders;
// the --record path only keeps the run record out of state/), and the same command TWICE as the
// CONTROL with every change of this item off: test/multiply.test.mjs and daemon/multiply.mjs as
// committed at git HEAD, copied into a temp dir with their relative imports pointed at this tree
// (the copy of daemon/multiply.mjs is the instance script its population spawns, as SELF), every
// other module the tree's own. Arms alternate (bar, control, bar, control); before each run the
// script waits while the host has under 4000 MB available. Prints each run's wall time, the
// runner's duration_ms, the tallies and per-test durations, the run-to-run noise of each arm, then
// the gap; writes bench/verdicts/gate-slow-multiply.json ONCE (isTheBar true, barMet when both bar
// runs are under 15000 ms of wall time with every test passing).
//   PATH=$HOME/node24/bin:$PATH node test/gate-slow-multiply-bar.mjs [--out <verdict path>]
// Not a node:test file (no .test.mjs suffix): the gate does not run it. No model, no network.
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = 'test/multiply.test.mjs';
const DAEMON = 'daemon/multiply.mjs';
const BAR_MS = 15000;
const LEDGER_MS = 28924; // the gap line (state/self/gaps.jsonl line 41, quoted in docs/boards/proposed/board-17.md)
const FREE_MB = 4000;
const argOut = process.argv.indexOf('--out');
const OUT = argOut > 0 ? path.resolve(process.argv[argOut + 1]) : path.join(ROOT, 'bench', 'verdicts', 'gate-slow-multiply.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function trialArgs(tmp, file) {
  return ['tools/budget.mjs', '--ram-mb', '4000', '--disk-mb', '2048', '--dir', tmp, '--record', path.join(tmp, 'budget-record.json'),
    '--', 'node', '--max-old-space-size=4000', '--test', file];
}

// MemAvailable on Linux (os.freemem elsewhere), in MB
function availableMb() {
  try { const m = /^MemAvailable:\s+(\d+) kB/m.exec(readFileSync('/proc/meminfo', 'utf8')); if (m) return Math.round(Number(m[1]) / 1024); } catch { /* not Linux */ }
  return Math.round(os.freemem() / 1048576);
}
async function waitForRam(label) {
  for (let i = 0; availableMb() < FREE_MB && i < 300; i++) { if (i % 15 === 0) console.log(label + ': waiting, ' + availableMb() + ' MB available (need ' + FREE_MB + ')'); await sleep(2000); }
}

// one run of the trial in the tree; TEMP/TMP/TMPDIR point at the watched dir, as bench/gate.mjs does
function runTrial(label, file) {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'gate-slow-multiply-' + label + '-'));
  const env = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== 'NODE_TEST_CONTEXT')), TEMP: tmp, TMP: tmp, TMPDIR: tmp };
  return new Promise((resolve) => {
    const t0 = performance.now();
    const child = spawn(process.execPath, trialArgs(tmp, file), { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('exit', (code) => {
      const wallMs = Math.round(performance.now() - t0);
      let rec = null;
      try { rec = JSON.parse(readFileSync(path.join(tmp, 'budget-record.json'), 'utf8')); } catch { /* no record */ }
      rmSync(tmp, { recursive: true, force: true });
      resolve({ label, file, exit: code, wallMs, ...parseRunner(out + '\n' + err), peakRamMb: rec ? rec.peakRssMb : null, budgetOutcome: rec ? rec.outcome : null, budgetDone: ((out + '\n' + err).match(/^BUDGET done.*$/m) || [null])[0] });
    });
  });
}

// the tallies and per-test durations from the runner's output (TAP when not a TTY, or spec)
function parseRunner(text) {
  const num = (re) => { const m = text.match(re); return m ? Number(m[1]) : null; };
  const tests = [];
  const tap = /^(not ok|ok) \d+ - (.+)\n(?:[\s\S]*?)duration_ms: ([\d.]+)/gm;
  let m;
  while ((m = tap.exec(text))) tests.push({ name: m[2].trim(), ok: m[1] === 'ok', ms: Math.round(Number(m[3])) });
  if (!tests.length) {
    // the spec reporter repeats every failing test under "failing tests:"; count each once
    const body = text.split(/^✖ failing tests:$/m)[0];
    const spec = /^([✔✖]) (.+) \(([\d.]+)ms\)$/gm;
    while ((m = spec.exec(body))) tests.push({ name: m[2].trim(), ok: m[1] === '✔', ms: Math.round(Number(m[3])) });
  }
  const dur = num(/^[#ℹ] duration_ms ([\d.]+)/m);
  return { tests: num(/^[#ℹ] tests (\d+)/m), pass: num(/^[#ℹ] pass (\d+)/m), fail: num(/^[#ℹ] fail (\d+)/m), durationMs: dur === null ? null : Math.round(dur), perTest: tests };
}

// point a module's relative import specifiers (static and dynamic) at the tree, except the ones kept
function absolutize(src, fromRel, keep = new Set()) {
  const dir = path.dirname(path.join(ROOT, fromRel));
  const fix = (spec) => (keep.has(spec) ? spec : pathToFileURL(path.resolve(dir, spec)).href);
  return src
    .replace(/(\bfrom\s*')(\.\.?\/[^']+)(')/g, (_, a, spec, b) => a + fix(spec) + b)
    .replace(/(\bimport\(\s*')(\.\.?\/[^']+)(')/g, (_, a, spec, b) => a + fix(spec) + b);
}

// the control copy: HEAD's test file and HEAD's daemon/multiply.mjs, everything else the tree's
function controlCopy() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'gate-slow-multiply-control-'));
  const show = (f) => { const r = spawnSync('git', ['show', 'HEAD:' + f], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }); if (r.status !== 0) throw new Error('git show HEAD:' + f + ' failed: ' + r.stderr); return r.stdout; };
  for (const [f, keep] of [[FILE, new Set(['../daemon/multiply.mjs'])], [DAEMON, new Set()]]) {
    mkdirSync(path.join(dir, path.dirname(f)), { recursive: true });
    writeFileSync(path.join(dir, f), absolutize(show(f), f, keep));
  }
  const sha = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).stdout.trim();
  return { dir, file: path.join(dir, FILE), sha };
}

function gateRow() {
  try {
    const g = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'gate.json'), 'utf8'));
    const r = (g.tests || []).find((x) => x.file === FILE);
    return r ? { at: g.at, node: g.node, ms: r.ms, pass: r.pass, fail: r.fail, total: r.total } : null;
  } catch { return null; }
}

const line = (r) => r.label + ': wall ' + r.wallMs + ' ms, runner duration_ms ' + r.durationMs + ', tests ' + r.tests + ' pass ' + r.pass + ' fail ' + r.fail + ', exit ' + r.exit + ', peak ram ' + r.peakRamMb + ' MB';

const host = { platform: process.platform, cpus: os.cpus().length, totalMemMb: Math.round(os.totalmem() / 1048576), availableMbAtStart: availableMb(), loadavgAtStart: os.loadavg().map((x) => Math.round(x * 100) / 100) };
const ctl = controlCopy();
const runs = [];
try {
  for (let i = 1; i <= 2; i++) {
    for (const [label, file] of [['bar' + i, FILE], ['control' + i, ctl.file]]) {
      await waitForRam(label);
      const r = await runTrial(label, file);
      runs.push(r);
      console.log(line(r));
      console.log('  ' + r.budgetDone);
      for (const t of r.perTest) console.log('  ' + (t.ok ? 'ok   ' : 'FAIL ') + String(t.ms).padStart(6) + ' ms  ' + t.name);
    }
  }
} finally { rmSync(ctl.dir, { recursive: true, force: true }); }

const bar = runs.filter((r) => r.label.startsWith('bar'));
const control = runs.filter((r) => r.label.startsWith('control'));
const noiseBar = Math.abs(bar[0].wallMs - bar[1].wallMs);
const noiseControl = Math.abs(control[0].wallMs - control[1].wallMs);
const meanBar = Math.round((bar[0].wallMs + bar[1].wallMs) / 2);
const meanControl = Math.round((control[0].wallMs + control[1].wallMs) / 2);
const gap = meanControl - meanBar;
const noise = Math.max(noiseBar, noiseControl);
const barMet = bar.every((r) => r.wallMs < BAR_MS && r.exit === 0 && r.fail === 0 && r.pass === r.tests && r.tests > 0);
const peakRamMb = Math.max(...runs.map((r) => r.peakRamMb || 0));
const gate = gateRow();
console.log('noise (run to run, wall): bar arm ' + noiseBar + ' ms, control arm ' + noiseControl + ' ms');
console.log('gap: control mean ' + meanControl + ' ms minus bar mean ' + meanBar + ' ms = ' + gap + ' ms (' + (gap > noise ? 'above' : 'NOT above') + ' the larger noise ' + noise + ' ms)');
if (gate) console.log('gate.json row for ' + FILE + ' on this host (' + gate.at + ', ' + gate.node + '): ' + gate.ms + ' ms, ' + gate.pass + ' of ' + gate.total + ' pass');
console.log('peak ram of any run ' + peakRamMb + ' MB');
console.log('BAR ' + (barMet ? 'MET' : 'MISSED') + ': bar runs ' + bar.map((r) => r.wallMs).join(' and ') + ' ms against ' + BAR_MS + ' ms (the ledger measured ' + LEDGER_MS + ' ms)');

const pick = ({ label, wallMs, durationMs, tests, pass, fail, exit, peakRamMb: p, budgetDone, perTest }) => ({ label, wallMs, durationMs, tests, pass, fail, exit, peakRamMb: p, budgetDone, perTest });
const verdict = {
  at: new Date().toISOString(),
  command: 'PATH=$HOME/node24/bin:$PATH node test/gate-slow-multiply-bar.mjs',
  trialCommand: 'node ' + trialArgs('<tmp>', FILE).join(' '),
  node: process.version,
  gap: 'gate-slow:test/multiply.test.mjs',
  board: 'BOARD 17 (the organism\'s own board)',
  author: 'board 17 builder (the organism\'s item)',
  host,
  head: ctl.sha,
  isTheBar: true,
  barMet,
  bar: { ms: BAR_MS, rule: 'lower is better: both runs of the trial under ' + BAR_MS + ' ms of wall time (spawn to exit), every test passing', ledgerMs: LEDGER_MS, ledgerFrom: 'bench/verdicts/gate.json by node bench/gate.mjs --quiet (state/self/gaps.jsonl line 41)' },
  runs: bar.map(pick),
  control: {
    what: FILE + ' and ' + DAEMON + ' as committed at ' + ctl.sha + ' (every change of this item off), copied into a temp dir with their relative imports pointed at this tree; the same trial command, run in the tree',
    runs: control.map(pick),
  },
  noiseMs: { bar: noiseBar, control: noiseControl },
  meansMs: { bar: meanBar, control: meanControl },
  gapMs: gap,
  gapAboveNoise: gap > noise,
  peakRamMb,
  gateRowThisHost: gate,
  split: {
    development: { what: FILE + ' (its fixtures, schedule and planted instance) and the two pass-through options of ' + DAEMON + ' (organism.mindBytes, instance --heartbeat-ms), changed and timed on this host', files: [FILE, DAEMON] },
    heldOut: { what: 'none: the bar re-times the same test file on the same host it was tuned on; his PC (where the ledger measured ' + LEDGER_MS + ' ms) is the unseen host, measured at the next gate there', n: 0 },
    contaminated: false,
    reason: 'a test file has no held-out set: the metric is the wall time of the file itself, measured by the gap\'s own trial command',
  },
  statement: '',
};
verdict.statement = 'The trial command of gap gate-slow:test/multiply.test.mjs ran twice in the tree on ' + process.platform + ' with ' + process.version
  + ' and took ' + bar[0].wallMs + ' ms and ' + bar[1].wallMs + ' ms of wall time (' + bar.map((r) => r.pass + ' of ' + r.tests + ' tests passing').join(' and ')
  + '), against a bar of ' + BAR_MS + ' ms where the ledger measured ' + LEDGER_MS + ' ms, so barMet is ' + barMet + '. '
  + 'The control, the same command on ' + FILE + ' and ' + DAEMON + ' as committed at ' + ctl.sha + ', took ' + control[0].wallMs + ' ms and ' + control[1].wallMs + ' ms ('
  + control.map((r) => r.pass + ' of ' + r.tests + ' passing').join(' and ') + '). Run-to-run noise was ' + noiseBar + ' ms in the bar arm and ' + noiseControl
  + ' ms in the control arm; the gap between the arm means is ' + gap + ' ms, ' + (gap > noise ? 'above' : 'not above') + ' the larger noise. Budget caps were 4000 MB, not the proposal\'s 6000, on a '
  + host.totalMemMb + ' MB host shared with other builders; the peak RAM of any run was ' + peakRamMb + ' MB. Nothing was held out: the same file on the same host was both tuned and timed, so the unseen host is his PC at its next gate.';
if (existsSync(OUT)) { console.log('verdict ' + path.relative(ROOT, OUT) + ' already exists: not overwritten (a bar file is written once)'); process.exitCode = 3; }
else { writeFileSync(OUT, JSON.stringify(verdict, null, 2) + '\n'); console.log('wrote ' + path.relative(ROOT, OUT)); }
