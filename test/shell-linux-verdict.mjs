// test/shell-linux-verdict.mjs: THE BAR OF BOARD 17 ITEM shell-linux, measured and written once.
// board 17 builder (the organism's item)
//
// The bar: `node --test test/act-shell.test.mjs` exits 0 with every test passing. This script
// runs exactly that command TWICE and records both tallies (from the reporter's own summary
// lines) and both wall times, then measures test 9's scenario directly, alternating two arms:
//   walk     act/shell.mjs as shipped: the /proc walk kills the whole descendant tree,
//   control  the same run with the walk switched off (opts.procRoot pointed at a directory that
//            is not there), which is the old posix path: the process group kill alone.
// In each arm a detached grandchild appends one byte every 100 ms; the bytes are read 400 ms
// after the run returns and again 900 ms later. A grandchild that died does not grow.
//
//   node test/shell-linux-verdict.mjs [--out PATH] [--probes N]
//
// Writes bench/verdicts/shell-linux.json (isTheBar true) when both bar runs and every probe
// completed; a run that threw or ran fewer than 2 bar runs writes shell-linux-partial.json with
// isTheBar false. Not a test file: under node --test it does nothing. Never calls a model,
// never reaches the network, never writes the tree except the verdict file it exists to write.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeShellPolicy, runArgv } from '../act/shell.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const NODE = process.execPath;
const BAR_ARGS = ['--test', 'test/act-shell.test.mjs'];
const BAR_COMMAND = 'node ' + BAR_ARGS.join(' ');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const r3 = (x) => Math.round(x * 1000) / 1000;

function arg(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : dflt;
}

/** The reporter's summary lines (spec prints "ℹ tests 23", tap prints "# tests 23"). */
export function parseTally(text) {
  const t = {};
  for (const m of String(text).matchAll(/^(?:ℹ|#) (tests|suites|pass|fail|cancelled|skipped|todo|duration_ms) ([\d.]+)\s*$/gm)) t[m[1]] = Number(m[2]);
  return t;
}
/** The t.diagnostic lines the added cases print. */
export function parseDiagnostics(text) {
  const s = String(text);
  const g = /great-grandchild bytes (\d+) then (\d+), grandchild bytes (\d+) then (\d+)/.exec(s);
  const c = /control grandchild bytes (\d+) then (\d+)/.exec(s);
  return {
    greatGrandchild: g ? { before: Number(g[1]), after: Number(g[2]) } : null,
    grandchildOfThree: g ? { before: Number(g[3]), after: Number(g[4]) } : null,
    controlGrandchild: c ? { before: Number(c[1]), after: Number(c[2]) } : null,
  };
}

function barRun(i) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  const t0 = process.hrtime.bigint();
  const r = spawnSync(NODE, BAR_ARGS, { cwd: ROOT, env, encoding: 'utf8', timeout: 120_000, maxBuffer: 64 * 1024 * 1024 });
  const wallMs = r3(Number(process.hrtime.bigint() - t0) / 1e6);
  const out = (r.stdout || '') + '\n' + (r.stderr || '');
  const tally = parseTally(out);
  const failing = [...out.matchAll(/^✖ (.+?) \([\d.]+ms\)$/gm)].map((m) => m[1]);
  const run = { run: i, exitCode: r.status, signal: r.signal || null, wallMs, tally, failing: [...new Set(failing)], diagnostics: parseDiagnostics(out) };
  console.log('bar run ' + i + ': exit ' + r.status + ', tests ' + tally.tests + ', pass ' + tally.pass + ', fail ' + tally.fail + ', cancelled ' + tally.cancelled + ', skipped ' + tally.skipped + ', todo ' + tally.todo + ', wall ' + wallMs + ' ms, reporter duration_ms ' + tally.duration_ms);
  const d = run.diagnostics;
  if (d.greatGrandchild) console.log('  great-grandchild bytes ' + d.greatGrandchild.before + ' then ' + d.greatGrandchild.after + ', grandchild ' + d.grandchildOfThree.before + ' then ' + d.grandchildOfThree.after);
  if (d.controlGrandchild) console.log('  control grandchild bytes ' + d.controlGrandchild.before + ' then ' + d.controlGrandchild.after);
  for (const f of run.failing) console.log('  FAILING: ' + f);
  return run;
}

// Test 9's scenario, byte for byte, with the walk on or off.
async function probe(arm, i) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'brain-shell-linux-'));
  const marker = path.join(dir, 'grandchild.log');
  const grand = 'const fs=require("fs");setInterval(()=>{try{fs.appendFileSync(' + JSON.stringify(marker) + ',"x")}catch(e){}},100);';
  const parent = 'const cp=require("child_process");const c=cp.spawn(process.execPath,["-e",' + JSON.stringify(grand) + '],{stdio:"ignore",detached:true});c.unref();process.stdout.write("pid "+c.pid+"\\n");setInterval(()=>{},1000);';
  const policy = normalizeShellPolicy({ argv: [NODE], roots: [dir], maxBytes: 262144, timeoutMs: 15000 });
  const opts = { cwd: dir, policy, timeoutMs: 1000 };
  if (arm === 'control') opts.procRoot = path.join(dir, 'no-proc-here');
  let pid = 0;
  try {
    const t0 = Date.now();
    const res = await runArgv([NODE, '-e', parent], opts);
    const ms = Date.now() - t0;
    pid = Number((res.stdout.match(/pid (\d+)/) || [])[1]) || 0;
    await wait(400);
    const a = existsSync(marker) ? statSync(marker).size : 0;
    await wait(900);
    const b = existsSync(marker) ? statSync(marker).size : 0;
    const row = { arm, i, timedOut: res.timedOut, killedBy: res.killedBy, tree: res.tree, runMs: ms, before: a, after: b, grew: b - a, reason: res.reason };
    console.log('probe ' + arm + ' ' + i + ': killedBy ' + res.killedBy + ', found ' + (res.tree ? res.tree.found : null) + ', grandchild bytes ' + a + ' then ' + b + ' (grew ' + (b - a) + ')');
    return row;
  } finally {
    if (pid > 1) { try { process.kill(pid, 'SIGKILL'); } catch { /* the walk already took it */ } }
    await wait(50);
    rmSync(dir, { recursive: true, force: true });
  }
}

const spread = (xs) => (xs.length ? { min: Math.min(...xs), max: Math.max(...xs), n: xs.length } : null);

async function main() {
  if (process.env.NODE_TEST_CONTEXT) { console.log('test/shell-linux-verdict.mjs is a bench, not a test: nothing to do under node --test'); return; }
  const out = path.resolve(ROOT, arg('--out', 'bench/verdicts/shell-linux.json'));
  const probes = Math.max(1, Number(arg('--probes', '3')) || 3);
  const at0 = new Date().toISOString();
  const runs = [], rows = [];
  let error = null;
  try {
    for (let i = 1; i <= 2; i++) runs.push(barRun(i));
    for (let i = 1; i <= probes; i++) { rows.push(await probe('walk', i)); rows.push(await probe('control', i)); }
  } catch (e) { error = String(e && e.stack || e); console.log('ERROR ' + error); }

  const passed = (r) => r.exitCode === 0 && r.tally.tests > 0 && r.tally.pass === r.tally.tests && r.tally.fail === 0 && r.tally.cancelled === 0 && r.tally.skipped === 0 && r.tally.todo === 0;
  const complete = !error && runs.length === 2 && rows.length === 2 * probes;
  const barMet = complete && runs.every(passed);
  const walk = rows.filter((r) => r.arm === 'walk'), control = rows.filter((r) => r.arm === 'control');
  const walkGrew = spread(walk.map((r) => r.grew)), controlGrew = spread(control.map((r) => r.grew));
  const walkStill = walk.filter((r) => r.before > 0 && r.grew === 0).length;
  const controlGrewN = control.filter((r) => r.grew > 0).length;
  const at = new Date().toISOString();
  const t = runs.map((r) => r.tally);
  const statement = runs.length === 2
    ? 'The bar command ' + BAR_COMMAND + ' ran twice on ' + process.platform + ' ' + os.release() + ' under node ' + process.version + ': run 1 exited ' + runs[0].exitCode + ' with ' + t[0].pass + ' of ' + t[0].tests + ' tests passing (' + t[0].fail + ' failing) in ' + runs[0].wallMs + ' ms, run 2 exited ' + runs[1].exitCode + ' with ' + t[1].pass + ' of ' + t[1].tests + ' passing (' + t[1].fail + ' failing) in ' + runs[1].wallMs + ' ms, so barMet is ' + barMet + '. '
      + 'Test 9\'s scenario was then measured directly in ' + probes + ' alternating pairs: with the /proc walk on, the detached grandchild grew between ' + (walkGrew ? walkGrew.min + ' and ' + walkGrew.max : 'no') + ' bytes over the 900 ms read window after the kill (in ' + walkStill + ' of ' + walk.length + ' runs it had written before the kill and wrote nothing after); with the walk off (the control, the process group kill alone) it grew between ' + (controlGrew ? controlGrew.min + ' and ' + controlGrew.max : 'no') + ' bytes (' + controlGrewN + ' of ' + control.length + ' runs kept writing), so a group kill alone misses a detached grandchild and the walk is what takes it down.'
      + (error ? ' The run threw before it finished: ' + error.split('\n')[0] : '')
    : 'The run threw before both bar runs finished: ' + String(error).split('\n')[0];
  const verdict = {
    at, startedAt: at0,
    command: 'node test/shell-linux-verdict.mjs' + (process.argv.slice(2).length ? ' ' + process.argv.slice(2).join(' ') : ''),
    barCommand: BAR_COMMAND,
    node: process.version, platform: process.platform, release: os.release(), cpus: os.cpus().length,
    isTheBar: complete, barMet,
    bar: 'node --test test/act-shell.test.mjs exits 0 with every test passing, on both runs',
    runs,
    probe: { scenario: 'test 9: a 1000 ms timeout on a parent whose detached grandchild appends 1 byte per 100 ms; bytes read 400 ms after the run returns and 900 ms later', walk, control, walkGrew, controlGrew, walkStill, controlGrewN },
    split: {
      development: 'test/act-shell.test.mjs (every case, the four added by this item included) and test 9\'s scenario replayed by this script',
      heldOut: 'none',
      contaminated: false,
      reason: 'no scored set exists to leak: the claim is behavioural (a process on this host is alive or dead, its file grows or not), measured fresh on every run, and nothing was tuned against a held-out answer',
    },
    statement,
    error,
    author: 'board 17 builder (the organism\'s item)',
  };
  const file = complete ? out : out.replace(/\.json$/, '-partial.json');
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
  console.log('walk grew ' + JSON.stringify(walkGrew) + ', control grew ' + JSON.stringify(controlGrew));
  console.log('isTheBar ' + verdict.isTheBar + ' barMet ' + barMet + ' -> ' + path.relative(ROOT, file).replaceAll('\\', '/'));
  const ru = process.resourceUsage();
  console.log('this process maxRSS ' + r3(ru.maxRSS / 1024) + ' MB');
}

main();
