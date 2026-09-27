// bench/shell-windows.mjs: THE BAR OF BOARD 23 ITEM shell-windows, measured and written once.
// board 23 builder, shell-windows
//
// The bar: `node --test test/act-shell.test.mjs` prints fail 0 on this Windows host. This script
// runs exactly that command TWICE, one after the other, and records both tallies from the
// reporter's own summary lines, both wall times, and the diagnostics the win32 cases print (the
// grandchild's pid alive during the run and dead after it; the control, where a plain kill
// leaves the same grandchild alive). Then it runs the same test file once more with ONE
// in-memory mutation of act/shell.mjs (the forced-exit record switched off, served by a module
// load hook from a data: URL, nothing on disk touched) and records that tally too: the bar must
// see the defect when the fix is gone, or the fix is graded by nothing.
//
//   node bench/shell-windows.mjs [--out PATH]
//
// Writes bench/verdicts/shell-windows.json (isTheBar true) when it ran on win32 with both bar runs
// and the mutant run complete; anywhere else, or when a run could not be read, it writes
// shell-windows-partial.json with isTheBar false. MODEL OFF: no model, no socket, no network.
// Writes nothing but the verdict file (the test file's own tmp dirs live under os.tmpdir()).
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const NODE = process.execPath;
const TEST_FILE = 'test/act-shell.test.mjs';
const BAR_ARGS = ['--test', TEST_FILE];
const BAR_COMMAND = 'node ' + BAR_ARGS.join(' ');
const COMMAND = 'node bench/shell-windows.mjs';
const r3 = (x) => Math.round(x * 1000) / 1000;
const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : dflt; };

/** The reporter's summary lines (spec prints "ℹ tests 28", tap prints "# tests 28"). */
export function parseTally(text) {
  const t = {};
  for (const m of String(text).matchAll(/^(?:ℹ|#) (tests|suites|pass|fail|cancelled|skipped|todo|duration_ms) ([\d.]+)\s*$/gm)) t[m[1]] = Number(m[2]);
  return t;
}
/** Failing test names, from either reporter. */
export function parseFailing(text) {
  const s = String(text);
  const spec = [...s.matchAll(/^✖ (.+?) \([\d.]+ms\)$/gm)].map((m) => m[1]);
  const tap = [...s.matchAll(/^not ok \d+ - (.+)$/gm)].map((m) => m[1].trim());
  return [...new Set([...spec, ...tap])];
}
const val = (v) => (v === 'true' ? true : v === 'false' ? false : v === 'null' ? null : v === 'undefined' ? undefined : (/^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v));
/** The t.diagnostic lines the win32 cases and the great-grandchild case print. */
export function parseDiagnostics(text) {
  const s = String(text);
  const k = /win32 tree kill: grandchild alive during (\S+), alive after (\S+), bytes (\d+) then (\d+), killedBy (\S+), code (\S+), signal (\S+), forcedStatus (\S+), taskkill ended (\S+) of (\S+) descendants/.exec(s);
  const c = /win32 control: plain kill, code (\S+), signal (\S+), grandchild alive after (\S+), bytes (\d+) then (\d+)/.exec(s);
  const g = /great-grandchild bytes (\d+) then (\d+), grandchild bytes (\d+) then (\d+)/.exec(s);
  return {
    treeKill: k ? { aliveDuring: val(k[1]), aliveAfter: val(k[2]), bytesBefore: Number(k[3]), bytesAfter: Number(k[4]), killedBy: val(k[5]), code: val(k[6]), signal: val(k[7]), forcedStatus: val(k[8]), taskkillEnded: val(k[9]), descendantsNamed: val(k[10]) } : null,
    control: c ? { code: val(c[1]), signal: val(c[2]), aliveAfter: val(c[3]), bytesBefore: Number(c[4]), bytesAfter: Number(c[5]) } : null,
    greatGrandchild: g ? { before: Number(g[1]), after: Number(g[2]), grandchildBefore: Number(g[3]), grandchildAfter: Number(g[4]) } : null,
  };
}

function run(label, args, env = {}) {
  const e = { ...process.env, ...env };
  delete e.NODE_TEST_CONTEXT;
  const t0 = process.hrtime.bigint();
  const r = spawnSync(NODE, args, { cwd: ROOT, env: e, encoding: 'utf8', timeout: 180_000, maxBuffer: 64 * 1024 * 1024, windowsHide: true });
  const wallMs = r3(Number(process.hrtime.bigint() - t0) / 1e6);
  const out = (r.stdout || '') + '\n' + (r.stderr || '');
  const res = { label, exitCode: r.status, signal: r.signal || null, wallMs, tally: parseTally(out), failing: parseFailing(out), diagnostics: parseDiagnostics(out) };
  if (r.error) res.error = String(r.error.code || r.error.message);
  const t = res.tally;
  console.log(label + ': exit ' + r.status + ', tests ' + t.tests + ', pass ' + t.pass + ', fail ' + t.fail + ', cancelled ' + t.cancelled + ', skipped ' + t.skipped + ', todo ' + t.todo + ', wall ' + wallMs + ' ms');
  const d = res.diagnostics;
  if (d.treeKill) console.log('  tree kill: grandchild alive during ' + d.treeKill.aliveDuring + ', alive after ' + d.treeKill.aliveAfter + ', bytes ' + d.treeKill.bytesBefore + ' then ' + d.treeKill.bytesAfter + ', code ' + d.treeKill.code + ', signal ' + d.treeKill.signal + ', forcedStatus ' + d.treeKill.forcedStatus);
  if (d.control) console.log('  control (plain kill): grandchild alive after ' + d.control.aliveAfter + ', bytes ' + d.control.bytesBefore + ' then ' + d.control.bytesAfter);
  for (const f of res.failing) console.log('  FAILING: ' + f);
  return { res, out };
}

// The mutant: act/shell.mjs served with the forced-exit record switched off. A module load hook,
// registered from a data: URL, so no file is written and the tree on disk is what it was.
const MUTANT_FROM = 'const forced = WIN && rawSignal == null && FORCED.has(child);';
const MUTANT_TO = 'const forced = false;';
const HOOK = [
  "import { registerHooks } from 'node:module';",
  'registerHooks({ load(url, context, nextLoad) {',
  '  const r = nextLoad(url, context);',
  "  if (url.endsWith('/act/shell.mjs')) {",
  '    const src = String(r.source);',
  '    if (!src.includes(' + JSON.stringify(MUTANT_FROM) + ")) throw new Error('mutant anchor not found');",
  '    r.source = src.replace(' + JSON.stringify(MUTANT_FROM) + ', ' + JSON.stringify(MUTANT_TO) + ');',
  "    process.stdout.write('# MUTANT forced-record-off applied\\n');",
  '  }',
  '  return r;',
  '} });',
].join('\n');

async function main() {
  const startedAt = new Date().toISOString();
  const win = process.platform === 'win32';
  const bars = [];
  for (let i = 1; i <= 2; i++) { const { res } = run('bar run ' + i, BAR_ARGS); res.run = i; bars.push(res); }
  const m = run('mutant run (forced-exit record off)', ['--import', 'data:text/javascript,' + encodeURIComponent(HOOK), TEST_FILE]);
  const mutant = { ...m.res, applied: /# MUTANT forced-record-off applied/.test(m.out), mutation: MUTANT_FROM + '  ->  ' + MUTANT_TO };

  const barOk = (r) => r.exitCode === 0 && r.tally.tests > 0 && r.tally.fail === 0 && r.tally.cancelled === 0 && r.tally.pass > 0 && r.tally.pass + r.tally.skipped === r.tally.tests;
  const barMet = bars.length === 2 && bars.every(barOk);
  const mutantKilled = mutant.applied && mutant.tally.fail > 0;
  const complete = win && bars.every((r) => Number.isFinite(r.tally.tests)) && Number.isFinite(mutant.tally.tests);
  const tk = bars[0].diagnostics.treeKill, ctl = bars[0].diagnostics.control;

  const statement = !complete
    ? 'This run could not grade the Windows bar: it ran on ' + process.platform + ' or a run printed no tally, so it is recorded as partial and claims nothing.'
    : 'On this Windows PC the shell hand that runs a command must kill the command and everything it started when its time is up, and say honestly that it did. Before this change the hand did kill the whole tree, but it wrote the kill down as if the program had finished on its own with exit code 1, so one of its tests failed. The fix records a kill it performed as a kill. The test file ran twice: ' + bars.map((r) => r.tally.pass + ' passed, ' + r.tally.fail + ' failed, ' + r.tally.skipped + ' skipped of ' + r.tally.tests).join(', then ') + '. In the added case a grandchild process that detached itself was ' + (tk && tk.aliveDuring ? 'alive' : 'not seen alive') + ' while the command ran and ' + (tk && tk.aliveAfter === false ? 'gone' : 'still alive') + ' after the kill; in the control, where only the parent is killed the ordinary way, the same kind of grandchild was ' + (ctl && ctl.aliveAfter ? 'still alive and still writing' : 'not alive') + ', which is why the whole tree kill exists. With the fix switched off in memory the same tests showed ' + mutant.tally.fail + ' failures, so the bar can see the defect. There is no held-out data: this is a behaviour test of one machine, not a model.';

  const verdict = {
    at: new Date().toISOString(),
    startedAt,
    command: COMMAND,
    barCommand: BAR_COMMAND,
    node: process.version,
    platform: process.platform,
    release: os.release(),
    cpus: os.cpus().length,
    isTheBar: complete,
    barMet: complete && barMet,
    bar: 'node --test test/act-shell.test.mjs prints fail 0 (exit 0, nothing cancelled, every test passed or skipped), on both runs',
    model: 'off: no model, no socket, no network',
    runs: bars,
    mutant: { ...mutant, killed: mutantKilled },
    control: {
      name: 'win32 control: a plain child.kill, the kill without /T, leaves the same detached grandchild alive',
      what: 'the same parent and detached grandchild as the tree kill case, killed with node child.kill alone (TerminateProcess on the parent only); node records that kill as code null and SIGKILL, the record the taskkill path now matches',
      measured: ctl,
    },
    split: {
      development: 'test/act-shell.test.mjs: 23 cases that existed before this item (one of them the failing case) plus 5 added by it; the fix was written against the failing case and the added cases',
      heldOut: 'none',
      why: 'a behaviour test of process kills on one host, with no data to hold out: every case spawns real processes and asserts what the operating system reports',
      contaminated: false,
    },
    statement,
  };
  const out = arg('--out', path.join(ROOT, 'bench', 'verdicts', complete ? 'shell-windows.json' : 'shell-windows-partial.json'));
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(verdict, null, 2) + '\n');
  console.log('isTheBar ' + verdict.isTheBar + ', barMet ' + verdict.barMet + ', mutant applied ' + mutant.applied + ' killed ' + mutantKilled + ' (fail ' + mutant.tally.fail + ')');
  console.log('wrote ' + path.relative(ROOT, out));
  process.exitCode = verdict.barMet ? 0 : 1;
}

main().catch((err) => { console.error(err && err.stack || err); process.exitCode = 2; });
