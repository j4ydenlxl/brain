// bench/autopilot-flake.mjs: THE BAR OF THE AUTOPILOT FLAKE (board 26 builder, item autopilot-flake).
//
// Board 23 (item census-loop, commit b7e3610) saw `node --test test/autopilot.test.mjs` print 33 of 34
// on one run and 34 of 34 on the next. A race is not graded by re-running once: this runner re-runs
// the file N times, one after another, and keeps every failing case's name and diagnostic, so the
// cause is read from the failure itself and the fix is graded on N runs, not one.
//
//   node tools/budget.mjs --ram-mb 4000 --disk-mb 2000 --dir <tmp> -- node --max-old-space-size=4000 bench/autopilot-flake.mjs --n 10 --tmp <tmp>
//
// EACH RUN HAS A TEMP DIR OF ITS OWN (the verify plane, 2026-09-27): the first version counted the
// brain-autopilot-* and brain-census-* entries of the SHARED os.tmpdir() before and after each run,
// so another process on this machine that made one of those names during a run was charged to the
// test file (a re-run read "runs that left a temp entry: 2" where this file had left none). Now each
// run's TEMP, TMP and TMPDIR name a fresh directory (afk-XXXXXX under --tmp, or under os.tmpdir()),
// nothing else on the machine writes there, every entry left in it after the run is the test file's
// own, and the runner removes it. The verdict's "command" names --tmp and --log-dir by placeholder
// when they are absolute paths, so it never records a scratch path that is deleted after the run.
//
// Options:
//   --n N          runs, default 10
//   --file PATH    the test file, default test/autopilot.test.mjs
//   --tmp DIR      the parent of each run's own temp dir (so the budget wrapper can watch the bytes
//                  the test writes); default: the inherited temp dir. A long one breaks the test: the
//                  soak's copies nest five levels under it and Windows refuses a directory path
//                  over 248 characters (ENOENT from mkdtemp), measured on 2026-09-27
//   --log-dir DIR  keep each run's raw TAP stream there (run-<i>.tap); default: not kept
//   --timeout-ms N one run's timeout, default 300000
//   --label TEXT   stored in the verdict (for example before-fix, after-fix)
//   --no-write     print only
// Each run: `node --test --test-reporter=tap <file>`, its exit, wall, the tally lines (tests, pass,
// fail, cancelled, skipped, todo, duration_ms) and every `not ok` with its suite path, its YAML
// diagnostic block and the stderr tail. MODEL OFF: the file asks no model (a fake author stands in).
//
// bench/verdicts/autopilot-flake.json: isTheBar true, barMet only when every run exits 0 with
// fail 0, cancelled 0, pass equal to tests, tests above 0 and the same count in every run. The
// newest verdict of this runner that missed the bar (the run before the fix) is THE CONTROL, kept
// whole under "control" and carried forward; "replaced" summarises the file each run overwrites.
// Each run also counts the temp entries the test file names that it left behind in the temp dir.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERDICT_REL = 'bench/verdicts/autopilot-flake.json';

export function parseArgs(argv) {
  const o = { n: 10, file: 'test/autopilot.test.mjs', tmp: null, logDir: null, timeoutMs: 300000, label: null, write: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--n') o.n = Number(argv[++i]);
    else if (a === '--file') o.file = argv[++i];
    else if (a === '--tmp') o.tmp = argv[++i];
    else if (a === '--log-dir') o.logDir = argv[++i];
    else if (a === '--timeout-ms') o.timeoutMs = Number(argv[++i]);
    else if (a === '--label') o.label = argv[++i];
    else if (a === '--no-write') o.write = false;
    else throw new Error('unknown option ' + a);
  }
  if (!Number.isInteger(o.n) || o.n < 1) throw new Error('--n must be a positive integer');
  return o;
}

// The TAP stream of node --test: tally lines at the end, and a `not ok` per failing test, nested by
// indent (4 spaces per suite level), each followed by an indented YAML block between --- and ...
export function parseTap(text) {
  const lines = String(text).split(/\r?\n/);
  const tally = {};
  const failures = [];
  const stack = []; // [{ indent, name }] from the "# Subtest:" lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = /^# (tests|suites|pass|fail|cancelled|skipped|todo|duration_ms) ([\d.]+)$/.exec(line);
    if (t) { tally[t[1]] = Number(t[2]); continue; }
    const s = /^(\s*)# Subtest: (.*)$/.exec(line);
    if (s) {
      const indent = s[1].length;
      while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
      stack.push({ indent, name: s[2] });
      continue;
    }
    const m = /^(\s*)(not ok|ok) (\d+) - (.*)$/.exec(line);
    if (!m) continue;
    const indent = m[1].length;
    while (stack.length && stack[stack.length - 1].indent > indent) stack.pop();
    const parents = stack.filter((e) => e.indent < indent).map((e) => e.name);
    if (m[2] === 'not ok') {
      const yaml = [];
      if (lines[i + 1] !== undefined && lines[i + 1].trim() === '---') {
        let j = i + 2;
        for (; j < lines.length && !(lines[j].trim() === '...' && lines[j].length - lines[j].trimStart().length === indent + 2); j++) yaml.push(lines[j].slice(indent + 2));
        i = j;
      }
      const ft = yaml.map((l) => /^failureType: '?([^']*)'?$/.exec(l)).find(Boolean);
      failures.push({
        name: m[4].replace(/\s+#\s+(SKIP|TODO).*$/, ''),
        path: [...parents, m[4]].join(' > '),
        depth: indent / 4,
        failureType: ft ? ft[1] : null,
        diagnostic: yaml.join('\n').slice(0, 6000),
      });
    }
    if (stack.length && stack[stack.length - 1].indent === indent) stack.pop();
  }
  return { tally, failures };
}

export function runPassed(r, expectTests) {
  const t = r.tally || {};
  return r.exit === 0 && t.fail === 0 && (t.cancelled || 0) === 0 && t.tests > 0 && t.pass === t.tests
    && (expectTests == null || t.tests === expectTests);
}

// The command as the verdict records it: an absolute --tmp or --log-dir is a machine path (a scratch
// dir deleted after the run), so it is named by placeholder; a relative one is kept as typed.
export function commandLine(argv) {
  const out = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    out.push(a);
    if ((a === '--tmp' || a === '--log-dir') && i + 1 < argv.length) {
      const v = argv[++i];
      out.push(path.isAbsolute(v) || path.win32.isAbsolute(v) || path.posix.isAbsolute(v) ? '<' + a.slice(2) + '>' : v);
    }
  }
  return 'node bench/autopilot-flake.mjs' + (out.length ? ' ' + out.join(' ') : '');
}

// One run of the file with a temp dir of its own: every entry left in it afterwards was made by the
// test file or a process it started (nothing else on the machine is told that path), so the count
// is the file's, and the dir is removed after it is counted.
export function oneRun(o, i) {
  const parent = o.tmp || os.tmpdir();
  mkdirSync(parent, { recursive: true });
  const priv = mkdtempSync(path.join(parent, 'afk-'));
  const env = { ...process.env, TEMP: priv, TMP: priv, TMPDIR: priv };
  // under a node --test parent the child would report to it in v8 serialization, not TAP
  delete env.NODE_TEST_CONTEXT;
  const t0 = Date.now();
  const r = spawnSync(process.execPath, ['--test', '--test-reporter=tap', o.file], { cwd: ROOT, env, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: o.timeoutMs });
  const wallMs = Date.now() - t0;
  const { tally, failures } = parseTap(r.stdout || '');
  let left = [];
  try { left = readdirSync(priv).sort(); } catch { left = []; }
  let removed = false;
  try { rmSync(priv, { recursive: true, force: true, maxRetries: 3 }); removed = !existsSync(priv); } catch { removed = false; }
  const leftInTmp = left.length + (removed ? 0 : 1);
  if (o.logDir) { mkdirSync(o.logDir, { recursive: true }); writeFileSync(path.join(o.logDir, 'run-' + i + '.tap'), String(r.stdout || '') + '\n--- stderr ---\n' + String(r.stderr || '')); }
  return {
    run: i, exit: r.status, signal: r.signal || null, wallMs, tally,
    failures: failures.filter((f) => f.failureType !== 'subtestsFailed'),
    parentsFailed: failures.filter((f) => f.failureType === 'subtestsFailed').map((f) => f.path),
    stderrTail: r.status === 0 ? '' : String(r.stderr || '').slice(-3000),
    spawnError: r.error ? String(r.error.message || r.error) : null,
    leftInTmp,
    leftNames: left.slice(0, 20),
    tmpChars: priv.length,
    tmpRemoved: removed,
  };
}

function tallyLine(t) {
  return 'tests ' + t.tests + ', pass ' + t.pass + ', fail ' + t.fail + ', cancelled ' + t.cancelled + ', duration_ms ' + t.duration_ms;
}

// THE CONTROL is the newest verdict of this runner that missed the bar (the file before the fix),
// kept whole and carried forward by every later run; "replaced" is a summary of the file this run
// overwrites. A verdict never nests more than those two. A carried command goes through
// commandLine again, so a machine path an older runner recorded is not carried forward.
const RUNNER = 'node bench/autopilot-flake.mjs';
const recommand = (cmd) => (typeof cmd === 'string' && cmd.startsWith(RUNNER) ? commandLine(cmd.slice(RUNNER.length).trim().split(/\s+/).filter(Boolean)) : cmd);
export function carryForward(prev) {
  if (!prev || typeof prev !== 'object') return { control: null, replaced: null };
  const strip = (v) => { const c = { ...v }; delete c.control; delete c.replaced; if ('command' in c) c.command = recommand(c.command); return c; };
  const control = prev.barMet === false ? strip(prev)
    : prev.control && typeof prev.control === 'object' ? strip(prev.control)
      : prev.replaced && prev.replaced.barMet === false && Array.isArray(prev.replaced.runs) ? strip(prev.replaced) : null;
  const replaced = { at: prev.at, label: prev.label ?? null, barMet: prev.barMet, line: prev.line ?? null };
  return { control, replaced };
}

export function main(argv = process.argv.slice(2)) {
  const o = parseArgs(argv);
  const command = commandLine(argv);
  const runs = [];
  for (let i = 1; i <= o.n; i++) {
    const r = oneRun(o, i);
    runs.push(r);
    console.log('RUN ' + i + '/' + o.n + ': exit ' + r.exit + ', ' + tallyLine(r.tally) + ', wall ' + r.wallMs + ' ms' + (r.leftInTmp != null ? ', new temp entries left ' + r.leftInTmp : ''));
    for (const f of r.failures) console.log('  FAIL ' + f.path + '\n' + f.diagnostic.split('\n').map((l) => '    ' + l).join('\n'));
  }
  const counts = runs.map((r) => r.tally.tests);
  const expect = counts.every((c) => c === counts[0]) ? counts[0] : null;
  const passed = runs.filter((r) => runPassed(r, expect)).length;
  const barMet = passed === o.n && expect != null && expect > 0;
  const byName = {};
  for (const r of runs) for (const f of r.failures) byName[f.path] = (byName[f.path] || 0) + 1;
  const line = 'AUTOPILOT-FLAKE N=' + o.n + ': ' + passed + ' of ' + o.n + ' runs passed'
    + (expect != null ? ' (' + expect + ' tests each)' : ' (test counts differ: ' + counts.join(',') + ')')
    + (Object.keys(byName).length ? '; failing: ' + Object.entries(byName).map(([k, v]) => k + ' x' + v).join('; ') : '; failing: none')
    + '; runs that left a temp entry: ' + runs.filter((r) => r.leftInTmp > 0).length;
  console.log(line);
  const verdictPath = path.join(ROOT, ...VERDICT_REL.split('/'));
  let prev = null;
  if (existsSync(verdictPath)) { try { prev = JSON.parse(readFileSync(verdictPath, 'utf8')); } catch { prev = null; } }
  const { control, replaced } = carryForward(prev);
  const verdict = {
    at: new Date().toISOString(),
    command,
    node: process.version,
    isTheBar: true,
    barMet,
    label: o.label,
    file: o.file,
    tmp: 'a fresh temp dir per run (afk-XXXXXX), its TEMP, TMP and TMPDIR, under ' + (o.tmp ? 'the dir given by --tmp' : 'the inherited temp dir (os.tmpdir())') + '; every entry left in it was made by the test file, then it is removed',
    n: o.n,
    passedRuns: passed,
    testsPerRun: expect,
    line,
    failingCases: byName,
    split: {
      development: 'the runs of ' + o.file + ' themselves: the bar is that every one of N sequential runs passes every test',
      heldOut: 'none',
      why: 'a flake bar has no held-out data: every run is the same file on the same tree, and the deterministic case in the file (the condition the flake needs) is the part that does not depend on timing',
      contaminated: false,
    },
    controlLine: control ? 'the same runner on the same file before the fix (' + (control.label || 'unlabelled') + ', ' + control.at + '): ' + control.line : 'none on disk: no earlier run of this runner missed the bar',
    statement: (barMet
      ? 'Every one of ' + o.n + ' back to back runs of ' + o.file + ' passed all ' + expect + ' tests. '
      : passed + ' of ' + o.n + ' back to back runs of ' + o.file + ' passed every test; the failing cases and their diagnostics are in runs[].failures. ')
      + 'Each run is a fresh node --test process on the same tree with no model and no network, so a failure here is the test file or the code it calls depending on timing or shared state, not on the input. '
      + 'Each run also has a temp dir of its own that nothing else on the machine writes to, so the count of runs that left a temp entry (' + runs.filter((r) => r.leftInTmp > 0).length + ' of ' + o.n + ') is made by the test file and not by a neighbour process. '
      + (control ? 'The control, the same runner before the fix, printed: ' + control.line + '. ' : '')
      + (replaced ? 'The file this run replaced printed: ' + (replaced.line || 'no line') + '.' : ''),
    runs,
    replaced,
    control,
  };
  if (o.write) { mkdirSync(path.dirname(verdictPath), { recursive: true }); writeFileSync(verdictPath, JSON.stringify(verdict, null, 2) + '\n'); console.log('wrote ' + VERDICT_REL + ' (isTheBar true, barMet ' + barMet + ')'); }
  return barMet ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main();
