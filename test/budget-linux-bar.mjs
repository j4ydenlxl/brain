// test/budget-linux-bar.mjs: the bar of item budget-linux (board 17, the organism's own board).
// Author: board 17 builder (the organism's item), 2026-09-26.
//
// The gap: bench/verdicts/gate.json on this Linux host read test/budget.test.mjs at 9 of 10. The
// item: the reaper of tools/budget.mjs walks /proc on Linux (reapTree over act/shell.mjs
// killPosixTree), and the test file gains a case with a detached great-grandchild two levels deep.
// This script runs the bar command and writes bench/verdicts/budget-linux.json ONCE from the
// runs' own tallies and wall times:
//   BAR, direct  : node --test test/budget.test.mjs                                    (twice)
//   BAR, wrapped : node tools/budget.mjs --ram-mb 4000 --disk-mb 2048 --dir <tmp> --record <tmp>/r.json
//                    -- node --max-old-space-size=4000 --test test/budget.test.mjs     (twice)
//                  with TEMP, TMP and TMPDIR pointed at <tmp>, as bench/gate.mjs runs a file (4000 MB
//                  here, not the gate's 6000: this cloud host has 16 GB shared by several builders)
//   CONTROL walk off : the wrapped command on a minimal copy holding tools/budget.mjs,
//                  bench/budget.mjs and test/budget.test.mjs as they are now but NO act/shell.mjs,
//                  so the reaper cannot load its walker (the intervention off)
//   CONTROL before   : the wrapped command on a minimal copy holding git HEAD's tools/budget.mjs,
//                  bench/budget.mjs and test/budget.test.mjs (what the gate measured)
// barMet: every bar run exits 0 with every test passing (none failed, none skipped) and every
// bar run is under the file's 15000 ms gate row. Prints each run, the run-to-run noise, the bar.
//   PATH=$HOME/node24/bin:$PATH node test/budget-linux-bar.mjs [--out <verdict path>]
// Not a node:test file (no .test.mjs suffix): the gate does not run it. No model, no network.
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync, copyFileSync, renameSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = 'test/budget.test.mjs';
const ROW_MS = 15000;
const FREE_MB = 4000;
const argOut = process.argv.indexOf('--out');
const OUT = argOut > 0 ? path.resolve(process.argv[argOut + 1]) : path.join(ROOT, 'bench', 'verdicts', 'budget-linux.json');
const MB = 1048576;

const directArgs = () => ['--test', FILE];
const wrappedArgs = (tmp) => ['tools/budget.mjs', '--ram-mb', '4000', '--disk-mb', '2048', '--dir', tmp, '--record', path.join(tmp, 'r.json'),
  '--', 'node', '--max-old-space-size=4000', '--test', FILE];

// the BUDGETS rule of the brief: wait while under 4000 MB free before a run (bounded)
async function waitFreeRam() {
  const end = Date.now() + 600000;
  while (os.freemem() / MB < FREE_MB && Date.now() < end) await new Promise((r) => setTimeout(r, 2000));
  return Math.round(os.freemem() / MB);
}

function parseRunner(text) {
  const num = (re) => { const m = text.match(re); return m ? Number(m[1]) : null; };
  const per = [];
  const body = text.split(/^✖ failing tests:$/m)[0];
  const spec = /^([✔✖﹣]) (.+?) \(([\d.]+)ms\)(?: # .*)?$/gm;
  let m;
  while ((m = spec.exec(body))) per.push({ name: m[2].trim(), ok: m[1] === '✔', ms: Math.round(Number(m[3])) });
  if (!per.length) {
    const tap = /^(not ok|ok) \d+ - (.+)\n(?:[\s\S]*?)duration_ms: ([\d.]+)/gm;
    while ((m = tap.exec(text))) per.push({ name: m[2].trim(), ok: m[1] === 'ok', ms: Math.round(Number(m[3])) });
  }
  const d = num(/^[#ℹ] duration_ms ([\d.]+)/m);
  return {
    tests: num(/^[#ℹ] tests (\d+)/m), pass: num(/^[#ℹ] pass (\d+)/m), fail: num(/^[#ℹ] fail (\d+)/m),
    skipped: num(/^[#ℹ] skipped (\d+)/m), durationMs: d === null ? null : Math.round(d), perTest: per,
    walkLine: (text.match(/^the \/proc walk: .*$/m) || [null])[0],
    reaperLines: text.match(/^BUDGET reaper: .*$/gm) || [],
  };
}

async function run(label, kind, cwd) {
  const freeMb = await waitFreeRam();
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'budget-linux-' + label + '-'));
  const env = kind === 'wrapped' ? { ...process.env, TEMP: tmp, TMP: tmp, TMPDIR: tmp } : { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const argv = kind === 'wrapped' ? wrappedArgs(tmp) : directArgs();
  return new Promise((resolve) => {
    const t0 = performance.now();
    const child = spawn(process.execPath, argv, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('exit', (code) => {
      const wallMs = Math.round(performance.now() - t0);
      let rec = null;
      try { rec = JSON.parse(readFileSync(path.join(tmp, 'r.json'), 'utf8')); } catch { /* the direct run writes no record */ }
      rmSync(tmp, { recursive: true, force: true });
      resolve({ label, kind, exit: code, wallMs, freeMbBefore: freeMb, ...parseRunner(out + '\n' + err),
        peakRssMb: rec ? rec.peakRssMb : null, budgetOutcome: rec ? rec.outcome : null, doneLine: (err.match(/^BUDGET done.*$/m) || [null])[0] });
    });
  });
}

// a minimal copy: the three files the test file needs, from the working tree or from git HEAD
function copy(tag, fromHead) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'budget-linux-' + tag + '-'));
  for (const f of ['tools/budget.mjs', 'bench/budget.mjs', FILE]) {
    mkdirSync(path.join(dir, path.dirname(f)), { recursive: true });
    if (!fromHead) { copyFileSync(path.join(ROOT, f), path.join(dir, f)); continue; }
    const r = spawnSync('git', ['show', 'HEAD:' + f], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * MB });
    if (r.status !== 0) throw new Error('git show HEAD:' + f + ' failed: ' + r.stderr);
    writeFileSync(path.join(dir, f), r.stdout);
  }
  return dir;
}

function gateRow() {
  try {
    const g = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'gate.json'), 'utf8'));
    const r = (g.tests || []).find((x) => x.file === FILE);
    return r ? { at: g.at, node: g.node, ms: r.ms, pass: r.pass, fail: r.fail, total: r.total } : null;
  } catch { return null; }
}

const say = (r) => r.label + ': exit ' + r.exit + ', wall ' + r.wallMs + ' ms, runner duration_ms ' + r.durationMs + ', tests ' + r.tests + ' pass ' + r.pass + ' fail ' + r.fail
  + ' skipped ' + r.skipped + (r.kind === 'wrapped' ? ', peak ram ' + r.peakRssMb + ' MB, budget ' + r.budgetOutcome : '') + ', free RAM before ' + r.freeMbBefore + ' MB';
const pick = ({ label, kind, exit, wallMs, durationMs, tests, pass, fail, skipped, peakRssMb, budgetOutcome, walkLine, reaperLines, perTest }) =>
  ({ label, kind, exit, wallMs, durationMs, tests, pass, fail, skipped, peakRssMb, budgetOutcome, walkLine, reaperLines, failed: perTest.filter((t) => !t.ok).map((t) => t.name) });

const sha = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).stdout.trim();
const startedAt = new Date().toISOString();
const runs = [];
const bareDir = copy('bare', false);
const headDir = copy('head', true);
try {
  for (const [label, kind, cwd] of [
    ['direct1', 'direct', ROOT], ['wrapped1', 'wrapped', ROOT], ['direct2', 'direct', ROOT], ['wrapped2', 'wrapped', ROOT],
    ['control-walk-off', 'wrapped', bareDir], ['control-head', 'wrapped', headDir],
  ]) {
    const r = await run(label, kind, cwd);
    runs.push(r);
    console.log(say(r));
    if (r.walkLine) console.log('  ' + r.walkLine);
    for (const l of r.reaperLines) console.log('  ' + l);
    const bad = r.perTest.filter((t) => !t.ok);
    if (bad.length) console.log('  failed: ' + bad.map((t) => t.name.slice(0, 90)).join(' | '));
  }
} finally {
  rmSync(bareDir, { recursive: true, force: true });
  rmSync(headDir, { recursive: true, force: true });
}

const bar = runs.filter((r) => r.label.startsWith('direct') || r.label.startsWith('wrapped'));
const byKind = (k) => bar.filter((r) => r.kind === k);
const noise = (a) => Math.abs(a[0].wallMs - a[1].wallMs);
const noiseDirect = noise(byKind('direct'));
const noiseWrapped = noise(byKind('wrapped'));
const green = (r) => r.exit === 0 && r.fail === 0 && r.skipped === 0 && r.tests !== null && r.pass === r.tests;
const barMet = bar.every((r) => green(r) && r.wallMs < ROW_MS);
const walkOff = runs.find((r) => r.label === 'control-walk-off');
const before = runs.find((r) => r.label === 'control-head');
const gate = gateRow();
console.log('noise (run to run, wall): direct ' + noiseDirect + ' ms, wrapped ' + noiseWrapped + ' ms');
if (gate) console.log('gate.json row for ' + FILE + ' on this host (' + gate.at + ', ' + gate.node + '): ' + gate.pass + ' of ' + gate.total + ' pass, ' + gate.ms + ' ms');
console.log('BAR ' + (barMet ? 'MET' : 'MISSED') + ': direct ' + byKind('direct').map((r) => r.pass + '/' + r.tests + ' in ' + r.wallMs + ' ms').join(' and ')
  + ', wrapped ' + byKind('wrapped').map((r) => r.pass + '/' + r.tests + ' in ' + r.wallMs + ' ms').join(' and ') + ' (row ' + ROW_MS + ' ms)'
  + '; controls: walk off ' + walkOff.pass + '/' + walkOff.tests + ', HEAD ' + before.pass + '/' + before.tests);

const verdict = {
  at: new Date().toISOString(),
  startedAt,
  command: 'node test/budget-linux-bar.mjs (bar runs: node ' + directArgs().join(' ') + ' and node ' + wrappedArgs('<tmp>').join(' ') + ' with TEMP, TMP and TMPDIR at <tmp>)',
  node: process.version,
  host: { platform: process.platform, cpus: os.cpus().length, totalMemMb: Math.round(os.totalmem() / MB) },
  item: 'budget-linux (board 17): the reaper of tools/budget.mjs walks /proc on Linux',
  isTheBar: true,
  barMet,
  bar: { rule: 'every bar run (direct twice, wrapped as the gate runs it twice) exits 0 with every test passing, none failed or skipped, each under the ' + ROW_MS + ' ms gate row', rowMs: ROW_MS },
  runs: bar.map(pick),
  noiseMs: { direct: noiseDirect, wrapped: noiseWrapped },
  control: {
    walkOff: { what: 'the wrapped command on a minimal copy of tools/budget.mjs, bench/budget.mjs and ' + FILE + ' as they are now with no act/shell.mjs, so the reaper cannot load its walker', run: pick(walkOff) },
    head: { what: 'the wrapped command on a minimal copy of the same three files at git HEAD ' + sha + ' (before board 17 touched them)', run: pick(before) },
  },
  gateRowThisHost: gate,
  split: {
    development: FILE,
    heldOut: 'none',
    contaminated: false,
    reason: 'no held-out set exists for a test tally: the bar runs the same test file the reaper was developed against, on the same host; the claim is the file green here, not a generalisation',
  },
  statement: '',
};
const d1 = byKind('direct'), w1 = byKind('wrapped');
verdict.statement = 'On ' + process.platform + ' with ' + process.version + ', ' + FILE + ' ran twice directly (' + d1.map((r) => r.pass + ' of ' + r.tests + ' passing, exit ' + r.exit + ', ' + r.wallMs + ' ms').join('; ')
  + ') and twice through tools/budget.mjs as the gate runs it (' + w1.map((r) => r.pass + ' of ' + r.tests + ' passing, exit ' + r.exit + ', ' + r.wallMs + ' ms').join('; ')
  + '), against the file\'s ' + ROW_MS + ' ms gate row, with run to run noise of ' + noiseDirect + ' ms direct and ' + noiseWrapped + ' ms wrapped, so the bar is ' + (barMet ? 'met' : 'missed')
  + '. With the walk off (the same files, no act/shell.mjs beside them) the same wrapped command passed ' + walkOff.pass + ' of ' + walkOff.tests
  + (walkOff.perTest.some((t) => !t.ok) ? ' (failed: ' + walkOff.perTest.filter((t) => !t.ok).map((t) => t.name.slice(0, 60)).join('; ') + ')' : '')
  + ', and the files at git HEAD ' + sha + ' passed ' + before.pass + ' of ' + before.tests + (gate ? ', where the gate on this host read ' + gate.pass + ' of ' + gate.total : '') + '.';
mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT + '.tmp', JSON.stringify(verdict, null, 2) + '\n');
renameSync(OUT + '.tmp', OUT);
console.log('wrote ' + path.relative(ROOT, OUT).replace(/\\/g, '/') + ' barMet ' + barMet);
