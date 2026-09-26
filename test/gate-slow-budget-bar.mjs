// test/gate-slow-budget-bar.mjs: the bar of gap gate-slow:test/budget.test.mjs (board 17, the
// organism's own board). Author: board 17 builder (the organism's item), 2026-09-26.
//
// Runs the trial command of the gap TWICE in the tree:
//   node tools/budget.mjs --ram-mb 4000 --disk-mb 2048 --dir <tmp> --record <tmp>/budget-record.json
//     -- node --max-old-space-size=4000 --test test/budget.test.mjs
// (4000 MB here, not the proposal's 6000: this cloud host has 16 GB shared by several builders;
// the --record path only keeps the run record out of state/), and the same command TWICE as the
// CONTROL on the file as committed (git HEAD, the intervention off) in a minimal copy holding
// tools/budget.mjs and bench/budget.mjs unchanged. Arms alternate (bar, control, bar, control).
// Prints each run's wall time, the runner's duration_ms, the tallies and per-test durations, the
// run-to-run noise of each arm, then the gap; writes bench/verdicts/gate-slow-budget.json ONCE
// (isTheBar true, barMet when both bar runs are under 15000 ms of wall time).
//   PATH=$HOME/node24/bin:$PATH node test/gate-slow-budget-bar.mjs [--out <verdict path>]
// Not a node:test file (no .test.mjs suffix): the gate does not run it. No model, no network.
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = 'test/budget.test.mjs';
const BAR_MS = 15000;
const LEDGER_MS = 30574; // the gap line (state/self/gaps.jsonl line 37, quoted in docs/boards/proposed/board-17.md)
const argOut = process.argv.indexOf('--out');
const OUT = argOut > 0 ? path.resolve(process.argv[argOut + 1]) : path.join(ROOT, 'bench', 'verdicts', 'gate-slow-budget.json');

function trialArgs(tmp) {
  return ['tools/budget.mjs', '--ram-mb', '4000', '--disk-mb', '2048', '--dir', tmp, '--record', path.join(tmp, 'budget-record.json'),
    '--', 'node', '--max-old-space-size=4000', '--test', FILE];
}

// one run of the trial in cwd; TEMP/TMP/TMPDIR point at the watched dir, as bench/gate.mjs does
function runTrial(cwd, label) {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'gate-slow-budget-' + label + '-'));
  const env = { ...process.env, TEMP: tmp, TMP: tmp, TMPDIR: tmp };
  return new Promise((resolve) => {
    const t0 = performance.now();
    const child = spawn(process.execPath, trialArgs(tmp), { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('exit', (code) => {
      const wallMs = Math.round(performance.now() - t0);
      let rec = null;
      try { rec = JSON.parse(readFileSync(path.join(tmp, 'budget-record.json'), 'utf8')); } catch { /* no record */ }
      rmSync(tmp, { recursive: true, force: true });
      resolve({ label, exit: code, wallMs, ...parseRunner(out), peakRssMb: rec ? rec.peakRssMb : null, budgetOutcome: rec ? rec.outcome : null, doneLine: (err.match(/^BUDGET done.*$/m) || [null])[0] });
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
  return {
    tests: num(/^[#ℹ] tests (\d+)/m), pass: num(/^[#ℹ] pass (\d+)/m), fail: num(/^[#ℹ] fail (\d+)/m),
    durationMs: num(/^[#ℹ] duration_ms ([\d.]+)/m) !== null ? Math.round(num(/^[#ℹ] duration_ms ([\d.]+)/m)) : null,
    perTest: tests,
  };
}

// the control copy: the committed test file beside the unchanged wrapper and planted children
function controlCopy() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'gate-slow-budget-control-'));
  for (const f of ['tools/budget.mjs', 'bench/budget.mjs']) { mkdirSync(path.join(dir, path.dirname(f)), { recursive: true }); copyFileSync(path.join(ROOT, f), path.join(dir, f)); }
  const head = spawnSync('git', ['show', 'HEAD:' + FILE], { cwd: ROOT, encoding: 'utf8' });
  if (head.status !== 0) throw new Error('git show HEAD:' + FILE + ' failed: ' + head.stderr);
  mkdirSync(path.join(dir, 'test'), { recursive: true });
  writeFileSync(path.join(dir, FILE), head.stdout);
  const sha = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).stdout.trim();
  return { dir, sha };
}

function gateRow() {
  try {
    const g = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'gate.json'), 'utf8'));
    const r = (g.tests || []).find((x) => x.file === FILE);
    return r ? { at: g.at, node: g.node, ms: r.ms, pass: r.pass, fail: r.fail, total: r.total } : null;
  } catch { return null; }
}

const line = (r) => r.label + ': wall ' + r.wallMs + ' ms, runner duration_ms ' + r.durationMs + ', tests ' + r.tests + ' pass ' + r.pass + ' fail ' + r.fail + ', exit ' + r.exit + ', peak ram ' + r.peakRssMb + ' MB';

const ctl = controlCopy();
const runs = [];
try {
  for (let i = 1; i <= 2; i++) {
    for (const [label, cwd] of [['bar' + i, ROOT], ['control' + i, ctl.dir]]) {
      const r = await runTrial(cwd, label);
      runs.push(r);
      console.log(line(r));
      console.log('  per test: ' + r.perTest.map((t) => (t.ok ? '' : 'FAIL ') + t.ms + ' ms ' + t.name.slice(0, 40)).join(' | '));
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
const barMet = bar.every((r) => r.wallMs < BAR_MS && r.exit === 0 && r.fail === 0);
const gate = gateRow();
console.log('noise (run to run, wall): bar arm ' + noiseBar + ' ms, control arm ' + noiseControl + ' ms');
console.log('gap: control mean ' + meanControl + ' ms minus bar mean ' + meanBar + ' ms = ' + gap + ' ms (' + (gap > noise ? 'above' : 'NOT above') + ' the larger noise ' + noise + ' ms)');
if (gate) console.log('gate.json row for ' + FILE + ' on this host (' + gate.at + ', ' + gate.node + '): ' + gate.ms + ' ms, ' + gate.pass + ' of ' + gate.total + ' pass');
console.log('BAR ' + (barMet ? 'MET' : 'MISSED') + ': bar runs ' + bar.map((r) => r.wallMs).join(' and ') + ' ms against ' + BAR_MS + ' ms (the ledger measured ' + LEDGER_MS + ' ms)');

const verdict = {
  at: new Date().toISOString(),
  command: 'node test/gate-slow-budget-bar.mjs (each run: node ' + trialArgs('<tmp>').join(' ') + ')',
  node: process.version,
  host: { platform: process.platform, cpus: os.cpus().length, totalMemMb: Math.round(os.totalmem() / 1048576) },
  gap: 'gate-slow:test/budget.test.mjs',
  isTheBar: true,
  barMet,
  bar: { ms: BAR_MS, rule: 'lower is better: both runs of the trial under ' + BAR_MS + ' ms of wall time, every test passing', ledgerMs: LEDGER_MS },
  runs: bar.map(({ label, wallMs, durationMs, tests, pass, fail, exit, peakRssMb, perTest }) => ({ label, wallMs, durationMs, tests, pass, fail, exit, peakRssMb, perTest })),
  control: {
    what: 'the same trial command on ' + FILE + ' as committed at ' + ctl.sha + ' (the intervention off), in a minimal copy holding tools/budget.mjs and bench/budget.mjs unchanged',
    runs: control.map(({ label, wallMs, durationMs, tests, pass, fail, exit, peakRssMb, perTest }) => ({ label, wallMs, durationMs, tests, pass, fail, exit, peakRssMb, perTest })),
  },
  noiseMs: { bar: noiseBar, control: noiseControl },
  gapMs: gap,
  gapAboveNoise: gap > noise,
  gateRowThisHost: gate,
  split: {
    development: { what: FILE + ' itself: its fixtures, caps, sample periods and waits were changed and timed against the same planted children (bench/budget.mjs --plant) and the same wrapper (tools/budget.mjs, unchanged)', files: [FILE] },
    heldOut: { what: 'none: the bar re-times the same test file on the same host it was tuned on; his Windows PC (where the ledger measured ' + LEDGER_MS + ' ms) is the unseen host, measured at the next gate there', n: 0 },
    contaminated: 'no held-out set: the bar times the same file the changes were developed against, on the same host',
  },
  statement: '',
};
verdict.statement = 'The trial command of gap gate-slow:test/budget.test.mjs ran twice in the tree on ' + process.platform + ' with ' + process.version
  + ' and took ' + bar[0].wallMs + ' ms and ' + bar[1].wallMs + ' ms of wall time (' + bar.map((r) => r.pass + ' of ' + r.tests + ' tests passing').join(' and ')
  + '), against a bar of ' + BAR_MS + ' ms where the ledger measured ' + LEDGER_MS + ' ms on his PC, so barMet is ' + barMet + '. '
  + 'The control, the same command on the file as committed at ' + ctl.sha + ', took ' + control[0].wallMs + ' ms and ' + control[1].wallMs + ' ms ('
  + control.map((r) => r.pass + ' of ' + r.tests + ' passing').join(' and ') + ')'
  + (control.some((r) => r.fail > 0) ? ', and a failing test stops at its failed assertion, so the control times are a lower bound for that file run whole' : '')
  + '. Run-to-run noise was ' + noiseBar + ' ms in the bar arm and ' + noiseControl
  + ' ms in the control arm; the gap between the arm means is ' + gap + ' ms. Nothing was held out: the same file on the same host was both tuned and timed, so the unseen host is his Windows PC at its next gate.';
if (existsSync(OUT)) { console.log('verdict ' + path.relative(ROOT, OUT) + ' already exists: not overwritten (a bar file is written once)'); process.exitCode = 3; }
else { writeFileSync(OUT, JSON.stringify(verdict, null, 2) + '\n'); console.log('wrote ' + path.relative(ROOT, OUT)); }
