// test/grow-era.test.mjs: THE ERA (grow/era.mjs; grow/NEO.md, "Order 7: always burning", ERA; contract c1) against a
// FAKE step set. Every test builds a temporary root holding STUB children for the eight steps of c1 (grow/absorb.mjs,
// grow/frontier.mjs, grow/know.mjs, grow/teach.mjs, grow/swarm.mjs, grow/neo.mjs for regate and the serial grow,
// grow/evolve.mjs, grow/measure.mjs: each logs its call to calls.log and prints the line its contract names), a ledger,
// grown/index.json, and sentinel files where no era may look (state/, judge/heldout/, judge/control.jsonl,
// neo/tasks/*/heldout.jsonl). The era runs with --root <tmp> (the CLI) or in process with an injected clock, children
// runner and process list, so nothing here reaches the network, a model, a token, the tree's neo/ or grown/ or the tree's
// git (the commit tests make their own repositories and bare remote under a temporary directory, with a hermetic git
// config). Every temporary directory is removed.
// Author: Opus 5.5 builder (ERA) for the Fable 5.1 orchestrator, 2026-10-01, his Order 7.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { syncBuiltinESMExports } from 'node:module';
import {
  runEras, ship, status, readEra, growOrder, colonies, lockState, takeLock, refreshLock, releaseLock, finishesInFlight, commitMessage,
  allowedHere, bodyOf, planEra, toldMs, argsOf, mergeEraDocs, fingerprint, changedPaths, recordPatterns, masteredRow, pidAlive, pushEra,
  KEEP, STALE_MS, HARD_STALE_MS, LOCK, ERA_FILE, SHIP_PATHS, PC_REFUSAL, USAGE, STEPS, IDLE_STOP, MIN_CHILD_MS, MIN_ERA_MS, RECORDS,
} from '../grow/era.mjs';
import { CLOUD_ENV, TOKEN_NAMES, TRAILER, runNode } from '../grow/generation.mjs';
import { CLOUD_ENV as SANDBOX_CLOUD_ENV } from '../grow/sandbox.mjs';
import { importsOf } from '../grow/contract.mjs';

const BRAIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ERA = path.join(BRAIN, 'grow', 'era.mjs');
const SWARM = path.join(BRAIN, 'grow', 'swarm.mjs');
const T0 = Date.parse('2026-10-01T12:00:00.000Z');

const PRELUDE = `import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const log = (name) => fs.appendFileSync(path.join(ROOT, 'calls.log'), JSON.stringify([name, ...process.argv.slice(2)]) + '\\n');
const arg = (n) => { const a = process.argv.slice(2), i = a.indexOf(n); return i >= 0 ? a[i + 1] : null; };
const readJ = (rel, dflt) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); } catch { return dflt; } };
const writeJ = (rel, o) => { const f = path.join(ROOT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\\n'); };
// a grandchild that outlives its parent unless the whole tree is killed (on Windows detached: out of the parent's job object)
const hang = () => { const c = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore', detached: process.platform === 'win32' }); fs.appendFileSync(path.join(ROOT, 'grandchild.pid'), c.pid + '\\n'); setInterval(() => {}, 1000); };
const growRow = (task, g, score) => ({ id: task + '-neo-g' + g, class: task, generation: g, lane: 'neo', tier: 'neo', heldout: { score, n: 10, ok: Math.round(score * 10) }, cells: 10 });
const churn = (task) => { if (process.env.STUB_GROW_CHURN) writeJ('grown/cells/' + task + '-' + Date.now() + '-' + process.pid + '.json', { churn: true }); };
`;
const STUBS = {
  // ABSORB: its line (one progress line first: the era reads the LAST JSON line); neo/ABSORB.json is a record
  absorb: ['grow/absorb.mjs', `log('absorb');
if (process.env.STUB_ABSORB_FAIL) { console.error('absorb failed: stub'); process.exit(1); }
const rows = Number(process.env.STUB_ABSORB_ROWS ?? 60);
writeJ('neo/ABSORB.json', { cursor: Date.now() + '-' + process.pid });
console.log('absorbing: a progress line');
console.log(JSON.stringify({ generation: Number(arg('--gen')), bytes: rows ? 4096 : 0, tasks: rows ? 2 : 0, rows, blocked: process.env.STUB_ABSORB_BLOCKED ? ['src-9: fetch failed: stub'] : [] }));`],
  // FRONTIER: STUB_FRONTIER_USAGE=opt answers usage while it gets an optional flag, =all always
  frontier: ['grow/frontier.mjs', `log('frontier');
const mode = process.env.STUB_FRONTIER_USAGE;
if (mode === 'all' || (mode === 'opt' && process.argv.includes('--max-ms'))) { console.error('usage: unknown flag --max-ms'); process.exit(2); }
console.log(JSON.stringify({ era: Number(arg('--era')), seeds: 0 }));`],
  // KNOW: STUB_KNOW_HANG never ends (and starts a grandchild that never ends either)
  know: ['grow/know.mjs', `log('know');
if (process.env.STUB_KNOW_HANG) hang(); else console.log(JSON.stringify({ shelved: 0 }));`],
  // TEACH: intake opens the names in open.json (once), appending the ledger and writing neo/tasks/<t>/task.json
  teach: ['grow/teach.mjs', `log('teach');
if (process.env.STUB_OPEN_FAIL) { console.error('intake failed: stub'); process.exit(1); }
if (process.env.STUB_TEACH_USAGE) { console.error('usage: one verb of intake'); process.exit(2); }
const names = readJ('open.json', []);
writeJ('open.json', []);
const led = readJ('neo/LEDGER.json', { tasks: [], generated: 0 });
for (const t of names) { led.tasks.push({ task: t, generation: Number(arg('--gen')), devSha: 'd', heldoutSha: 'h', dev: 20, heldout: 10, by: 'stub', at: '2026-10-01T00:00:00.000Z' }); writeJ('neo/tasks/' + t + '/task.json', { task: t }); }
writeJ('neo/LEDGER.json', led);
console.log(JSON.stringify({ generation: Number(arg('--gen')), opened: names, refused: [] }));`],
  // SWARM: grows every ledger task (neo-plan.json: { fail } or { score }); STUB_SWARM_HANG never ends
  swarm: ['grow/swarm.mjs', `log('swarm');
if (process.env.STUB_SWARM_HANG) hang();
else {
  const g = Number(arg('--gen')), plan = readJ('neo-plan.json', {});
  const ix = readJ('grown/index.json', { generation: 0, cells: [] });
  const results = [], refused = [];
  for (const { task } of readJ('neo/LEDGER.json', { tasks: [] }).tasks) {
    if (results.some((r) => r.task === task) || refused.some((r) => r.task === task)) continue;
    const p = plan[task] || {};
    if (p.fail) { refused.push({ task, why: 'node grow/neo.mjs grow exited 1: stub' }); continue; }
    const score = p.score ?? 0.5;
    ix.cells = ix.cells.filter((c) => !(c.tier === 'neo' && c.class === task));
    ix.cells.push(growRow(task, g, score));
    churn(task);
    results.push({ task, generated: 1000, kept: 10, cells: 10, promoted: true, heldout: { ok: Math.round(score * 10), n: 10, score }, baseline: { ok: 0, n: 10, score: 0 }, ms: 3 });
  }
  writeJ('grown/index.json', ix);
  console.log(JSON.stringify({ tasks: results.length + refused.length, workers: Number(arg('--workers') ?? 4), grown: results.length, cells: results.length * 1000, mastered: 0, ms: 5, cellsPerSecond: 1, refused, fallback: null, results, blocked: [] }));
}`],
  // NEO: grow (the serial fallback: neo-plan.json { fail } or { score }), regate, status
  neo: ['grow/neo.mjs', `log('neo');
const verb = process.argv[2];
if (verb === 'regate') {
  if (process.env.STUB_REGATE_FAIL) { console.error('regate failed: stub'); process.exit(1); }
  console.log(JSON.stringify({ regated: 0 }));
} else if (verb === 'status') console.log(JSON.stringify({ features: [] }));
else if (verb === 'grow') {
  const task = arg('--task'), g = Number(arg('--gen'));
  const plan = readJ('neo-plan.json', {})[task] || {};
  if (plan.fail) { console.error('neo grow failed: stub ' + task); process.exit(1); }
  const score = plan.score ?? 0.5;
  const ix = readJ('grown/index.json', { generation: 0, cells: [] });
  ix.cells = ix.cells.filter((c) => !(c.tier === 'neo' && c.class === task));
  ix.cells.push(growRow(task, g, score));
  writeJ('grown/index.json', ix);
  churn(task);
  console.log(JSON.stringify({ task, generated: 1000, kept: 10, cells: 10, heldout: { ok: Math.round(score * 10), n: 10, score }, baseline: { ok: 0, n: 10, score: 0 }, promoted: true, why: [], ms: 3 }));
} else { console.error('usage: one verb of spawn, grow, status'); process.exit(2); }`],
  evolve: ['grow/evolve.mjs', `log('evolve');
if (process.env.STUB_EVOLVE_FAIL) { console.error('evolve failed: stub'); process.exit(1); }
console.log(JSON.stringify({ trials: 0 }));`],
  // MEASURE: appends its row (a record) to grown/measure.jsonl and prints it
  measure: ['grow/measure.mjs', `log('measure');
if (process.env.STUB_MEASURE_FAIL) { console.error('measure failed: stub'); process.exit(1); }
const neo = readJ('grown/index.json', { cells: [] }).cells.filter((c) => c.tier === 'neo');
const row = { at: new Date().toISOString(), nonce: process.pid + '-' + Math.random(), era: Number(arg('--era')), neo: { tasks: readJ('neo/LEDGER.json', { tasks: [] }).tasks.length, colonies: neo.length, cells: neo.reduce((s, c) => s + c.cells, 0), mastered: neo.filter((c) => c.heldout.score === 1).length } };
fs.appendFileSync(path.join(ROOT, 'grown/measure.jsonl'), JSON.stringify(row) + '\\n');
console.log(JSON.stringify(row));`],
};
const ALL = Object.keys(STUBS);
/** Where no era may look: each holds a sentinel. */
const FORBIDDEN_FILES = ['state/SENTINEL.json', 'judge/heldout/fragment.jsonl', 'judge/control.jsonl', 'neo/tasks/alpha/heldout.jsonl'];

const put = (root, rel, text) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); return f; };
const TEMPS = new Set();
process.on('exit', () => { for (const d of TEMPS) { try { fs.rmSync(d, { recursive: true, force: true }); } catch { /* best effort */ } } });
const tmp = (prefix) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), prefix)); TEMPS.add(d); return d; };
const clean = (...ds) => { for (const d of ds) { fs.rmSync(d, { recursive: true, force: true }); TEMPS.delete(d); } };
const ledgerRow = (task) => ({ task, generation: 3, devSha: 'd', heldoutSha: 'h', dev: 20, heldout: 10, by: 'stub', at: '2026-10-01T00:00:00.000Z' });
const neoRow = (task, score, extra = {}) => ({ id: task + '-neo-g3', class: task, generation: 3, lane: 'neo', tier: 'neo', heldout: { score, n: 10, ok: Math.round(score * 10) }, cells: 10, ...extra });
/** A hand-grown locked-class cell: held-out score 1 but no tier, so never a task's colony. */
const HAND = { id: 'capital-of-direct-g1', class: 'capital-of', generation: 1, lane: 'direct', file: 'cells/capital-of-direct-g1.mjs', heldout: { score: 1, n: 14 } };

/** A fresh stub tree: grown/index.json at generation 3 (so g is 4), the ledger, the names intake opens, the grow plan, the steps on disk. */
function makeRoot({ ledger = [], open = ['alpha', 'beta'], plan = {}, cells = [], era = null, steps = ALL } = {}) {
  const root = tmp('grow-era-');
  for (const s of steps) put(root, STUBS[s][0], PRELUDE + STUBS[s][1] + '\n');
  put(root, 'grown/index.json', JSON.stringify({ generation: 3, cells }));
  put(root, 'neo/LEDGER.json', JSON.stringify({ tasks: ledger.map(ledgerRow), generated: 0 }));
  put(root, 'open.json', JSON.stringify(open));
  put(root, 'neo-plan.json', JSON.stringify(plan));
  if (era !== null) put(root, ERA_FILE, typeof era === 'string' ? era : JSON.stringify(era));
  for (const rel of FORBIDDEN_FILES) put(root, rel, JSON.stringify({ q: 'HELDOUT-SENTINEL', expect: { minWords: 1 } }) + '\n');
  return root;
}
/** The child environment: no token, no cloud variable, no test runner context, no stub switch; extra on top. */
function envOf(extra = {}) {
  const env = { ...process.env };
  for (const k of [...TOKEN_NAMES, ...CLOUD_ENV, 'NODE_TEST_CONTEXT', 'NODE_OPTIONS', 'GROW_BRANCH']) delete env[k];
  for (const k of Object.keys(env)) if (k.startsWith('STUB_')) delete env[k];
  return { ...env, ...extra };
}
function drive(root, args, extra = {}) {
  const r = spawnSync(process.execPath, [ERA, ...args, '--root', root], { cwd: root, env: envOf(extra), encoding: 'utf8', timeout: 240000, windowsHide: true });
  const lines = String(r.stdout || '').trim().split(/\r?\n/).filter(Boolean);
  let json = null;
  try { json = JSON.parse(lines[lines.length - 1]); } catch { json = null; }
  return { code: r.status, json, lines, stdout: r.stdout || '', stderr: r.stderr || '' };
}
const calls = (root) => { try { return fs.readFileSync(path.join(root, 'calls.log'), 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } };
/** Each call as one string, without its trailing --root <root>, every --max-ms value as N. */
const seq = (root) => calls(root).map((c) => {
  const a = c.slice(1);
  const i = a.indexOf('--root');
  const b = i >= 0 ? a.slice(0, i) : a;
  return [c[0], ...b.map((x, k) => (b[k - 1] === '--max-ms' ? 'N' : x))].join(' ');
});
const reset = (root) => fs.rmSync(path.join(root, 'calls.log'), { force: true });
const eraDoc = (root) => JSON.parse(fs.readFileSync(path.join(root, ERA_FILE), 'utf8'));
/** An injected clock: every child moves it stepMs; the children are the real stub processes. */
function clocked(root, stepMs = 10000, start = T0) {
  let t = start;
  return { now: () => t, exec: (script, args, o) => { t += stepMs; return runNode(root, script, args, o); }, set: (v) => { t = v; } };
}
/** runEras in this process on a cloud VM (CI set) with no process seen; o on top. */
const inproc = (root, o = {}) => runEras(root, { env: envOf({ CI: '1' }), procs: () => [], ...o });
/** The era of one step set, in c1 order, as seq prints it (e the era, g the generation). */
const ERA_SEQ = (e, g = 4, workers = null) => [
  'absorb pull --gen ' + g + ' --max-ms N', 'frontier step --max-ms N --era ' + e, 'know shelve --max-ms N --era ' + e, 'teach intake --gen ' + g,
  'swarm grow --gen ' + g + ' --max-ms N --era ' + e + (workers ? ' --workers ' + workers : ''), 'neo regate', 'evolve step --max-ms N --era ' + e, 'measure run --era ' + e + ' --max-ms N',
];
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
/** Kill every grandchild a stub recorded (a test that failed leaves none running). */
const reap = (root) => { let t = ''; try { t = fs.readFileSync(path.join(root, 'grandchild.pid'), 'utf8'); } catch { return; } for (const p of t.split(/\r?\n/).filter(Boolean).map(Number)) { try { process.kill(p, 'SIGKILL'); } catch { /* gone */ } } };

test('c1: one era runs absorb, frontier, know, teach, swarm grow, neo regate, evolve, measure in that order, each a child of the tree with --root; one JSON line; the row; the lock released', () => {
  const root = makeRoot();
  try {
    const r = drive(root, ['run', '--max-eras', '1', '--workers', '3'], { CI: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.lines.length, 1);
    assert.deepEqual(seq(root), ERA_SEQ(1, 4, 3));
    for (const c of calls(root)) assert.deepEqual(c.slice(-2), ['--root', path.resolve(root)]);
    for (const c of calls(root)) { const i = c.indexOf('--max-ms'); if (i >= 0) { const v = Number(c[i + 1]); assert.ok(Number.isInteger(v) && v >= 1000 && v < 480000, c.join(' ')); } }
    const j = r.json;
    assert.deepEqual(Object.keys(j), ['eras', 'era', 'ms', 'body', 'workers', 'absorbed', 'opened', 'grown', 'cells', 'mastered', 'idle', 'committed', 'pushed', 'velocity', 'skipped', 'blocked', 'stop', 'lock']);
    assert.equal(j.eras, 1);
    assert.equal(j.era, 1);
    assert.equal(j.body, 'ci');
    assert.equal(j.workers, 3);
    assert.deepEqual(j.absorbed, { bytes: 4096, tasks: 2, rows: 60 });
    assert.equal(j.opened, 2);
    assert.equal(j.grown, 2);
    assert.equal(j.cells, 20);
    assert.equal(j.mastered, 0);
    assert.equal(j.idle, 0);
    assert.equal(j.committed, 'skipped (no --commit)');
    assert.deepEqual(j.skipped, []);
    assert.deepEqual(j.blocked, []);
    assert.equal(j.stop, 'max-eras');
    assert.equal(j.lock, 'taken');
    assert.deepEqual(Object.keys(j.velocity), ['cellsPerSecond', 'tasksPerMinute', 'masteredPerEra', 'eraMs', 'workers']);
    assert.equal(j.velocity.workers, 3);
    assert.equal(j.velocity.masteredPerEra, 0);
    const doc = eraDoc(root);
    const row = doc.eras[0];
    assert.deepEqual(Object.keys(row), ['era', 'at', 'ms', 'body', 'workers', 'absorbed', 'opened', 'grown', 'cells', 'mastered', 'velocity', 'changed', 'idle', 'steps', 'skipped', 'blocked']);
    assert.deepEqual(Object.keys(row.steps), STEPS.map((s) => s.name));
    assert.deepEqual(Object.keys(row.velocity), ['cellsPerSecond', 'tasksPerMinute', 'masteredPerEra', 'eraMs', 'workers', 'generated', 'tasks', 'growMs']);
    assert.equal(row.velocity.generated, 2000);
    assert.equal(row.velocity.tasks, 2);
    assert.deepEqual(row.grown, ['alpha', 'beta'].map((task) => ({ task, generated: 1000, kept: 10, promoted: true, heldout: { ok: 5, n: 10, score: 0.5 }, baseline: { ok: 0, n: 10, score: 0 } })));
    assert.equal(row.idle, false);
    assert.ok(row.changed > 0);
    assert.deepEqual(doc.lastGrown, { alpha: 1, beta: 1 });
    assert.equal(doc.idle, 0);
    assert.ok(!fs.existsSync(path.join(root, LOCK)), 'the lock is released');
    assert.deepEqual(STEPS.map((s) => s.name + ' ' + s.script + ' ' + s.verb), ['absorb grow/absorb.mjs pull', 'frontier grow/frontier.mjs step', 'know grow/know.mjs shelve', 'teach grow/teach.mjs intake', 'grow grow/swarm.mjs grow', 'regate grow/neo.mjs regate', 'evolve grow/evolve.mjs step', 'measure grow/measure.mjs run']);
  } finally { clean(root); }
});

test('feature-detected: a step whose file is not on disk is skipped and named, and without grow/swarm.mjs the era grows task by task through grow/neo.mjs grow (one worker)', () => {
  const root = makeRoot({ steps: ['teach', 'neo', 'measure'] });
  try {
    const r = drive(root, ['run', '--max-eras', '1'], { CI: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(seq(root), ['teach intake --gen 4', 'neo grow --task alpha --gen 4', 'neo grow --task beta --gen 4', 'neo regate', 'measure run --era 1 --max-ms N']);
    assert.deepEqual(r.json.skipped, [
      'absorb: grow/absorb.mjs is not on disk', 'frontier: grow/frontier.mjs is not on disk', 'know: grow/know.mjs is not on disk',
      'grow: grow/swarm.mjs is not on disk: the era grew task by task (node grow/neo.mjs grow)', 'evolve: grow/evolve.mjs is not on disk',
    ]);
    assert.equal(r.json.workers, 1);
    assert.equal(r.json.absorbed, null);
    assert.equal(r.json.grown, 2);
    assert.equal(r.json.cells, 20);
    assert.deepEqual(r.json.blocked, []);
    assert.deepEqual(Object.keys(eraDoc(root).eras[0].steps), ['teach', 'grow', 'regate', 'measure']);
    // measure gone too: cells is null (unmeasured, never a zero)
    fs.rmSync(path.join(root, 'grow', 'measure.mjs'));
    reset(root);
    const b = drive(root, ['run', '--max-eras', '1'], { CI: '1' });
    assert.equal(b.json.cells, null);
    assert.ok(b.json.skipped.includes('measure: grow/measure.mjs is not on disk'));
  } finally { clean(root); }
});

test('a verb that answers usage (exit 2) is tried once more without its optional flags, then skipped as not landed; a step that fails is a blocked line and the era goes on', () => {
  const root = makeRoot({ plan: { beta: { fail: true } } });
  try {
    const a = drive(root, ['run', '--max-eras', '1'], { CI: '1', STUB_FRONTIER_USAGE: 'opt' });
    assert.equal(a.code, 0, a.stderr);
    assert.deepEqual(seq(root).filter((s) => s.startsWith('frontier')), ['frontier step --max-ms N --era 1', 'frontier step']);
    assert.deepEqual(a.json.skipped, []);
    reset(root);
    const b = drive(root, ['run', '--max-eras', '1'], { CI: '1', STUB_FRONTIER_USAGE: 'all', STUB_TEACH_USAGE: '1' });
    assert.deepEqual(seq(root).filter((s) => s.startsWith('frontier') || s.startsWith('teach')), ['frontier step --max-ms N --era 2', 'frontier step', 'teach intake --gen 4']);
    assert.deepEqual(b.json.skipped, [
      'frontier: node grow/frontier.mjs step answered usage (exit 2: usage: unknown flag --max-ms): that verb has not landed',
      'teach: node grow/teach.mjs intake answered usage (exit 2: usage: one verb of intake): that verb has not landed',
    ]);
    assert.equal(b.json.opened, null);
    // failures: each a blocked line, every later step still runs
    reset(root);
    const c = drive(root, ['run', '--max-eras', '1'], { CI: '1', STUB_ABSORB_BLOCKED: '1', STUB_REGATE_FAIL: '1', STUB_EVOLVE_FAIL: '1', STUB_MEASURE_FAIL: '1' });
    assert.equal(c.code, 0, c.stderr);
    assert.deepEqual(seq(root), ERA_SEQ(3));
    assert.deepEqual(c.json.blocked, [
      'era 3: absorb: src-9: fetch failed: stub', 'era 3: grow: beta: node grow/neo.mjs grow exited 1: stub',
      'era 3: regate: node grow/neo.mjs regate exited 1: regate failed: stub', 'era 3: evolve: node grow/evolve.mjs step exited 1: evolve failed: stub',
      'era 3: measure: node grow/measure.mjs run exited 1: measure failed: stub',
    ]);
    assert.equal(c.json.cells, null);
    assert.deepEqual(eraDoc(root).lastGrown, { alpha: 3, beta: 3 }, 'a refused task counts as tried');
    reset(root);
    const d = drive(root, ['run', '--max-eras', '1'], { CI: '1', STUB_ABSORB_FAIL: '1' });
    assert.equal(d.json.absorbed, null);
    assert.ok(d.json.blocked.includes('era 4: absorb: node grow/absorb.mjs pull exited 1: absorb failed: stub'));
    assert.equal(seq(root).length, 8);
  } finally { clean(root); }
});

test('planEra, toldMs and argsOf: the slots of contract c1 (a share each, capped; grow the rest), what follows each step, the --max-ms a child is told', () => {
  const p = planEra(480000);
  assert.deepEqual(p.slots, { absorb: 48000, frontier: 14400, know: 14400, teach: 24000, regate: 9600, evolve: 28800, measure: 48000, ship: 19200, grow: 273600 });
  assert.deepEqual(p.after, { ship: 0, measure: 19200, evolve: 67200, regate: 96000, grow: 105600, teach: 379200, know: 403200, frontier: 417600, absorb: 432000 });
  assert.equal(Object.values(p.slots).reduce((a, b) => a + b, 0), 480000, 'the slots add up to the budget');
  const big = planEra(3600000);
  assert.deepEqual(big.slots, { absorb: 90000, frontier: 30000, know: 30000, teach: 60000, regate: 20000, evolve: 60000, measure: 60000, ship: 30000, grow: 3220000 }, 'the caps bind');
  assert.deepEqual(planEra(-5).slots.grow, 0);
  assert.equal(toldMs(48000), 43200);
  assert.equal(toldMs(374400), 369400);
  assert.equal(toldMs(500), 1000);
  const grow = STEPS.find((s) => s.name === 'grow');
  assert.deepEqual(argsOf(grow, { g: 4, e: 2, maxMs: 9000, workers: 3 }, '/r'), ['grow', '--gen', '4', '--max-ms', '9000', '--era', '2', '--workers', '3', '--root', '/r']);
  assert.deepEqual(argsOf(grow, { g: 4, e: 2, maxMs: 9000, workers: null }, '/r'), ['grow', '--gen', '4', '--max-ms', '9000', '--era', '2', '--root', '/r']);
  assert.deepEqual(argsOf(grow, { g: 4, e: 2, maxMs: 9000, workers: 3 }, '/r', false), ['grow', '--gen', '4', '--root', '/r']);
  assert.deepEqual(argsOf(STEPS.find((s) => s.name === 'measure'), { g: 4, e: 2, maxMs: 9000 }, '/r'), ['run', '--era', '2', '--max-ms', '9000', '--root', '/r']);
});

/** A children runner that runs nothing: it logs [script, timeout, the --max-ms it was told], moves the clock by adv[script], prints lines[script]. */
function fakeExec(clock, { adv = {}, lines = {}, codes = {} } = {}) {
  const log = [];
  const exec = async (script, args, o) => {
    const i = args.indexOf('--max-ms');
    log.push([script, o.timeout, i >= 0 ? Number(args[i + 1]) : null]);
    clock.t += adv[script] ?? 0;
    return { code: codes[script] ?? 0, stdout: JSON.stringify(lines[script] ?? { ok: true }) + '\n', stderr: '', timedOut: false };
  };
  return { exec, log };
}
const LINES = {
  'grow/absorb.mjs': { bytes: 1, tasks: 0, rows: 0, blocked: [] }, 'grow/teach.mjs': { opened: [] },
  'grow/swarm.mjs': { workers: 4, cells: 3000, results: [{ task: 'alpha', generated: 2000 }, { task: 'beta', generated: 1000 }], refused: [], blocked: [] },
  'grow/measure.mjs': { neo: { cells: 20 } },
};

test('deadline arithmetic (an injected clock): each child is killed at min(its slot, the deadline less what follows); grow gets what the others leave; a step with under 2 s left is skipped; velocity inputs', async () => {
  const root = makeRoot();
  try {
    const clock = { t: T0 };
    const f = fakeExec(clock, { adv: { 'grow/swarm.mjs': 10000 }, lines: LINES });
    const j = await inproc(root, { maxEras: 1, maxMs: 480000, now: () => clock.t, exec: f.exec });
    assert.deepEqual(f.log, [
      ['grow/absorb.mjs', 48000, 43200], ['grow/frontier.mjs', 14400, 12960], ['grow/know.mjs', 14400, 12960], ['grow/teach.mjs', 24000, null],
      ['grow/swarm.mjs', 374400, 369400], ['grow/neo.mjs', 9600, null], ['grow/evolve.mjs', 28800, 25920], ['grow/measure.mjs', 48000, 43200],
    ]);
    const row = eraDoc(root).eras[0];
    assert.deepEqual(row.velocity, { cellsPerSecond: 300, tasksPerMinute: 12, masteredPerEra: 0, eraMs: 10000, workers: 4, generated: 3000, tasks: 2, growMs: 10000 });
    assert.deepEqual(j.velocity, { cellsPerSecond: 300, tasksPerMinute: 12, masteredPerEra: 0, eraMs: 10000, workers: 4 });
    assert.equal(row.cells, 20);
    // absorb ate the window of every later step: each still gets MIN_CHILD_MS, never past the deadline
    const c2 = { t: T0 };
    const g = fakeExec(c2, { adv: { 'grow/absorb.mjs': 470000 }, lines: LINES });
    fs.rmSync(path.join(root, ERA_FILE));
    await inproc(root, { maxEras: 1, maxMs: 480000, now: () => c2.t, exec: g.exec });
    assert.deepEqual(g.log.map((x) => x[1]), [48000, ...Array(7).fill(MIN_CHILD_MS)]);
    // under MIN_CHILD_MS before the deadline: every later step is skipped and named, the era still writes its row
    const c3 = { t: T0 };
    const h = fakeExec(c3, { adv: { 'grow/absorb.mjs': 479000 }, lines: LINES });
    fs.rmSync(path.join(root, ERA_FILE));
    const k = await inproc(root, { maxEras: 1, maxMs: 480000, now: () => c3.t, exec: h.exec });
    assert.deepEqual(h.log.map((x) => x[0]), ['grow/absorb.mjs']);
    assert.deepEqual(k.skipped, ['frontier', 'know', 'teach', 'grow', 'regate', 'evolve', 'measure'].map((s) => s + ': no time left in the era (1000 ms)'));
    assert.equal(eraDoc(root).eras.length, 1);
  } finally { clean(root); }
});

test('a hanging step is killed with its whole process tree at the end of its slot (a real clock); a hanging grow at the deadline less what follows; measure still runs; the run ends inside --max-ms', () => {
  const root = makeRoot();
  try {
    const r = drive(root, ['run', '--max-ms', '12000'], { CI: '1', STUB_KNOW_HANG: '1', STUB_SWARM_HANG: '1' });
    assert.equal(r.code, 0, r.stderr);
    const j = r.json;
    assert.equal(j.eras, 1);
    assert.equal(j.stop, 'budget', 'no second era with under MIN_ERA_MS left');
    assert.ok(j.ms < 12000, 'the run took ' + j.ms + ' ms');
    assert.ok(j.blocked.includes('era 1: know: node grow/know.mjs shelve was killed at the end of its slot (' + MIN_CHILD_MS + ' ms)'), j.blocked.join(' | '));
    assert.ok(j.blocked.some((b) => /^era 1: grow: node grow\/swarm\.mjs grow was killed at the end of its slot \(\d+ ms\)$/.test(b)), j.blocked.join(' | '));
    assert.deepEqual(seq(root).slice(-3), ['neo regate', 'evolve step --max-ms N --era 1', 'measure run --era 1 --max-ms N']);
    const row = eraDoc(root).eras[0];
    assert.ok(row.steps.know >= MIN_CHILD_MS - 100 && row.steps.know < 8000, 'know ran ' + row.steps.know + ' ms');
    const pids = fs.readFileSync(path.join(root, 'grandchild.pid'), 'utf8').split(/\r?\n/).filter(Boolean).map(Number);
    assert.equal(pids.length, 2);
    const until = Date.now() + 5000;
    while (pids.some(alive) && Date.now() < until) { /* the kill lands */ }
    assert.deepEqual(pids.filter(alive), [], 'every grandchild was killed with its step');
    assert.equal(MIN_ERA_MS, 20000);
  } finally { reap(root); clean(root); }
});

test('body: github when GITHUB_ACTIONS, claude-routine when CLAUDE_CODE_REMOTE, vercel, else ci; the era row carries it', () => {
  assert.equal(bodyOf({ GITHUB_ACTIONS: 'true', CLAUDE_CODE_REMOTE: '1' }), 'github');
  assert.equal(bodyOf({ CLAUDE_CODE_REMOTE: '1', VERCEL: '1' }), 'claude-routine');
  assert.equal(bodyOf({ VERCEL: '1', CI: '1' }), 'vercel');
  assert.equal(bodyOf({ CI: '1' }), 'ci');
  assert.equal(bodyOf({}), 'ci');
  const root = makeRoot();
  try {
    const r = drive(root, ['run', '--max-eras', '1'], { GITHUB_ACTIONS: 'true' });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.body, 'github');
    assert.equal(eraDoc(root).eras[0].body, 'github');
    const c = drive(root, ['run', '--max-eras', '1'], { CLAUDE_CODE_REMOTE: 'true' });
    assert.equal(c.json.body, 'claude-routine');
  } finally { clean(root); }
});

test('PLATEAU: an era that changes nothing under neo/ and grown/ but its records is idle; neo/ERA.json counts idle eras in a row; two in a row stop the run ("stop":"idle"); a change resets the count', () => {
  const root = makeRoot();
  try {
    assert.equal(IDLE_STOP, 2);
    const a = drive(root, ['run', '--max-eras', '6'], { CI: '1' });
    assert.equal(a.code, 0, a.stderr);
    assert.equal(a.json.eras, 3);
    assert.equal(a.json.stop, 'idle');
    assert.equal(a.json.idle, 2);
    const doc = eraDoc(root);
    assert.deepEqual(doc.eras.map((r) => [r.era, r.idle]), [[1, false], [2, true], [3, true]]);
    assert.equal(doc.eras[1].changed, 0);
    assert.equal(doc.idle, 2);
    // the next run: its first era is idle again, the count goes on, the run stops at once
    const b = drive(root, ['run', '--max-eras', '6'], { CI: '1' });
    assert.equal(b.json.eras, 1);
    assert.equal(b.json.stop, 'idle');
    assert.equal(b.json.idle, 3);
    // a change (a new file under grown/) resets the count and the run burns on to its cap
    const c = drive(root, ['run', '--max-eras', '2'], { CI: '1', STUB_GROW_CHURN: '1' });
    assert.equal(c.json.eras, 2);
    assert.equal(c.json.stop, 'max-eras');
    assert.equal(c.json.idle, 0);
    assert.equal(eraDoc(root).idle, 0);
    assert.deepEqual(eraDoc(root).eras.slice(-2).map((r) => r.idle), [false, false]);
  } finally { clean(root); }
});

test('the records (neo/ERA.json, grown/measure.jsonl, neo/ABSORB.json, neo/LEDGER.json, neo/TRIALS.jsonl, every colony.json) never count as a change; neo/RECORDS.json may add patterns under neo/ or grown/ only; a held-out file is never in the fingerprint', () => {
  assert.deepEqual([...RECORDS], ['neo/ERA.json', 'grown/measure.jsonl', 'neo/ABSORB.json', 'neo/LEDGER.json', 'neo/TRIALS.jsonl', 'neo/tasks/*/colony.json']);
  const root = makeRoot();
  try {
    put(root, 'neo/tasks/alpha/dev.jsonl', '{}\n');
    const fp0 = fingerprint(root);
    assert.ok(!fp0.has('neo/tasks/alpha/heldout.jsonl'));
    assert.ok(fp0.has('neo/tasks/alpha/dev.jsonl') && fp0.has('grown/index.json'));
    for (const rel of ['neo/ERA.json', 'grown/measure.jsonl', 'neo/ABSORB.json', 'neo/LEDGER.json', 'neo/TRIALS.jsonl', 'neo/tasks/alpha/colony.json', 'neo/tasks/alpha/heldout.jsonl']) {
      put(root, rel, 'changed ' + rel);
      assert.deepEqual(changedPaths(fp0, fingerprint(root)), [], rel);
    }
    put(root, 'grown/notes/a.json', '1');
    assert.deepEqual(changedPaths(fp0, fingerprint(root)), ['grown/notes/a.json']);
    put(root, 'neo/tasks/alpha/dev.jsonl', '{"q":"x"}\n');
    fs.rmSync(path.join(root, 'grown', 'index.json'));
    assert.deepEqual(changedPaths(fp0, fingerprint(root)), ['grown/index.json', 'grown/notes/a.json', 'neo/tasks/alpha/dev.jsonl'], 'added, changed and removed');
    put(root, 'neo/RECORDS.json', JSON.stringify({ records: ['grown/notes/*.json', '../etc/*', 'state/x', 7] }));
    assert.deepEqual(recordPatterns(root), [...RECORDS, 'grown/notes/*.json']);
    const fp1 = fingerprint(root);
    put(root, 'grown/notes/b.json', '2');
    assert.deepEqual(changedPaths(fp1, fingerprint(root)), []);
    // the cache: a file whose size and time did not move keeps its hash
    const cache = new Map();
    const f1 = fingerprint(root, { cache });
    cache.set('grown/notes/b.json', { ...cache.get('grown/notes/b.json'), hash: 'kept' });
    assert.equal(f1.get('grown/notes/b.json'), undefined, 'a record is not even hashed');
    const key = 'neo/tasks/alpha/dev.jsonl';
    cache.set(key, { ...cache.get(key), hash: 'from-cache' });
    assert.equal(fingerprint(root, { cache }).get(key), 'from-cache');
  } finally { clean(root); }
});

function gitEnvOf(base) {
  const cfg = path.join(base, 'gitconfig');
  fs.writeFileSync(cfg, '[user]\n\tname = grow-test\n\temail = grow-test@example.invalid\n[init]\n\tdefaultBranch = master\n[core]\n\tautocrlf = false\n');
  const env = { ...process.env, GIT_CONFIG_GLOBAL: cfg, GIT_CONFIG_NOSYSTEM: '1', GIT_TERMINAL_PROMPT: '0' };
  for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GROW_BRANCH', 'NODE_TEST_CONTEXT', 'NODE_OPTIONS']) delete env[k];
  return env;
}
const gitIn = (env) => (cwd, args) => {
  const r = spawnSync('git', args, { cwd, env, encoding: 'utf8', windowsHide: true, timeout: 60000 });
  if (r.status !== 0) throw new Error('git ' + args.join(' ') + ' exited ' + r.status + ': ' + (r.stderr || r.stdout));
  return String(r.stdout || '').trim();
};
const gitEnvVars = (env) => ({ GIT_CONFIG_GLOBAL: env.GIT_CONFIG_GLOBAL, GIT_CONFIG_NOSYSTEM: '1', GIT_TERMINAL_PROMPT: '0' });
const inShip = (p) => p.startsWith('neo/') || p.startsWith('grown/');

test('SHIP (--commit): neo/ and grown/ only, as jayden with the cortex trailer, message era <e>: <tasks> tasks, <cells> cells, <mastered> mastered; the first idle era of a streak is committed, the next is not; a change outside neo/ and grown/ is never committed; a failed push is a blocked line and the commit stays', () => {
  const base = tmp('grow-era-git-');
  const root = makeRoot();
  try {
    assert.deepEqual([...SHIP_PATHS], ['neo/', 'grown/']);
    const env = gitEnvOf(base), git = gitIn(env), gv = gitEnvVars(env);
    git(root, ['init', '-q', '-b', 'master']);
    git(root, ['add', '-A']);
    git(root, ['commit', '-q', '-m', 'stub tree']);
    put(root, 'notes.txt', 'staged outside\n');
    git(root, ['add', 'notes.txt']);
    const a = drive(root, ['run', '--max-eras', '6', '--commit', '--no-push'], { CI: '1', ...gv });
    assert.equal(a.code, 0, a.stderr);
    assert.equal(a.json.eras, 3);
    assert.equal(a.json.stop, 'idle');
    assert.equal(a.json.committed, 2, 'era 1 (it grew) and era 2 (the first idle era) only');
    assert.equal(a.json.pushed, 'skipped (--no-push)');
    assert.deepEqual(a.json.blocked, []);
    assert.deepEqual(git(root, ['log', '--format=%s', '-3']).split(/\r?\n/), ['era 2: 2 tasks, 20 cells, 0 mastered', 'era 1: 2 tasks, 20 cells, 0 mastered', 'stub tree']);
    assert.equal(git(root, ['log', '-1', '--format=%an']), 'jayden');
    assert.ok(git(root, ['log', '-1', '--format=%B']).includes(TRAILER));
    for (const rev of ['HEAD', 'HEAD~1']) {
      const files = git(root, ['show', '--name-only', '--format=', rev]).split(/\r?\n/).filter(Boolean);
      assert.ok(files.length && files.every(inShip), rev + ': ' + files.join(' '));
    }
    assert.ok(git(root, ['show', '--name-only', '--format=', 'HEAD~1']).includes('neo/ERA.json'), 'the commit carries the era it ends');
    assert.equal(git(root, ['diff', '--cached', '--name-only']), 'notes.txt', 'the staged file outside stays staged, uncommitted');
    assert.match(git(root, ['status', '--porcelain', '--', 'open.json']), /^ ?M open\.json$/, 'a change outside stays uncommitted');
    assert.equal(eraDoc(root).eras[2].shipped, 'skipped: idle 2 eras in a row');
    // nothing to commit: not an error, no commit
    git(root, ['add', '--', 'neo/', 'grown/']);
    git(root, ['commit', '-q', '-m', 'level', '--', 'neo/', 'grown/']);
    const head = git(root, ['rev-parse', 'HEAD']);
    assert.deepEqual(ship(root, { era: 9, env }), { committed: 'nothing to commit', pushed: 'skipped: nothing committed', blocked: [], renumbered: [] });
    assert.equal(git(root, ['rev-parse', 'HEAD']), head);
    // to a remote: pushed; the remote gone: the sync and the push are blocked lines and the commit stays
    const remote = path.join(base, 'remote.git');
    git(base, ['init', '-q', '--bare', '-b', 'master', remote]);
    git(root, ['remote', 'add', 'origin', remote]);
    const b = drive(root, ['run', '--max-eras', '1', '--commit'], { CI: '1', STUB_GROW_CHURN: '1', ...gv });
    assert.equal(b.code, 0, b.stderr);
    assert.equal(b.json.committed, 1);
    assert.equal(b.json.pushed, 1, b.json.blocked.join(' | '));
    assert.equal(git(remote, ['log', '-1', '--format=%s', 'master']), 'era 4: 2 tasks, 20 cells, 0 mastered');
    git(root, ['remote', 'set-url', 'origin', path.join(base, 'gone.git')]);
    const c = drive(root, ['run', '--max-eras', '1', '--commit'], { CI: '1', STUB_GROW_CHURN: '1', ...gv });
    assert.equal(c.code, 0, c.stderr);
    assert.equal(c.json.committed, 1);
    assert.equal(c.json.pushed, 0);
    assert.ok(c.json.blocked.some((l) => l.startsWith('era 5: sync: git fetch origin master exited ')), c.json.blocked.join(' | '));
    const line = c.json.blocked.find((l) => l.startsWith('era 5: ship: push: '));
    assert.ok(line && line.endsWith('(the commit stays)'), c.json.blocked.join(' | '));
    assert.equal(git(root, ['log', '-1', '--format=%s']), 'era 5: 2 tasks, 20 cells, 0 mastered');
    assert.ok(eraDoc(root).eras.at(-1).blocked.includes(line.slice('era 5: '.length)));
  } finally { clean(root, base); }
});

test('two bodies beat at once: the rejected push is rebased and pushed again, the two neo/ERA.json records merge, this body\'s era is renumbered after the remote\'s (its commit message and its measure row too), and two eras never share a number', () => {
  const base = tmp('grow-era-race-');
  const seed = makeRoot();
  try {
    const env = gitEnvOf(base), git = gitIn(env), gv = gitEnvVars(env);
    const remote = path.join(base, 'remote.git');
    git(base, ['init', '-q', '--bare', '-b', 'master', remote]);
    git(seed, ['init', '-q', '-b', 'master']);
    git(seed, ['add', '-A']);
    git(seed, ['commit', '-q', '-m', 'stub tree']);
    git(seed, ['remote', 'add', 'origin', remote]);
    git(seed, ['push', '-q', 'origin', 'master']);
    const [A, B, C] = ['a', 'b', 'c'].map((k) => { const d = path.join(base, k); git(base, ['clone', '-q', remote, d]); return d; });
    const a = drive(A, ['run', '--max-eras', '1', '--commit'], { CI: '1', ...gv });
    assert.equal(a.code, 0, a.stderr);
    assert.equal(a.json.pushed, 1, a.json.blocked.join(' | '));
    // B grew from the same start (its neo/ is not clean, so it does not sync first) and pushes second
    put(B, 'neo/notes-b.json', '{}\n');
    const b = drive(B, ['run', '--max-eras', '2', '--commit'], { CI: '1', ...gv });
    assert.equal(b.code, 0, b.stderr);
    assert.equal(b.json.committed, 2);
    assert.equal(b.json.pushed, 2, b.json.blocked.join(' | '));
    assert.equal(b.json.era, 3);
    assert.ok(!b.json.blocked.some((l) => / push: /.test(l)), b.json.blocked.join(' | '));
    assert.deepEqual(git(remote, ['log', '--format=%s', '-4', 'master']).split(/\r?\n/), ['era 3: 2 tasks, 20 cells, 0 mastered', 'era 2: 2 tasks, 20 cells, 0 mastered', 'era 1: 2 tasks, 20 cells, 0 mastered', 'stub tree']);
    assert.equal(git(remote, ['log', '-1', '--format=%an', 'master~1']), 'jayden');
    assert.ok(git(remote, ['log', '-1', '--format=%B', 'master~1']).includes(TRAILER));
    const doc = JSON.parse(git(remote, ['show', 'master:neo/ERA.json']));
    assert.deepEqual(doc.eras.map((r) => r.era), [1, 2, 3]);
    assert.equal(doc.eras[1].renumberedFrom, 1);
    assert.equal(doc.eras[0].at, eraDoc(A).eras[0].at, 'the remote\'s era 1 is A\'s');
    assert.equal(doc.era, 3);
    const measure = git(remote, ['show', 'master:grown/measure.jsonl']).split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l).era);
    assert.deepEqual(measure, [1, 2, 3], 'the measure rows joined, B\'s renumbered');
    // C (clean, behind) is brought level before its era: it takes the next free number without a race
    const c = drive(C, ['run', '--max-eras', '1', '--commit'], { CI: '1', STUB_GROW_CHURN: '1', ...gv });
    assert.equal(c.code, 0, c.stderr);
    assert.equal(c.json.era, 4);
    assert.equal(c.json.pushed, 1, c.json.blocked.join(' | '));
    assert.equal(git(remote, ['log', '-1', '--format=%s', 'master']), 'era 4: 2 tasks, 20 cells, 0 mastered');
    assert.deepEqual(JSON.parse(git(remote, ['show', 'master:neo/ERA.json'])).eras.map((r) => r.era), [1, 2, 3, 4]);
  } finally { clean(seed, base); }
});

test('mergeEraDocs: the remote\'s eras whole, this body\'s new ones renumbered after them, lastGrown the later per task by the new numbers, idle this body\'s', () => {
  const at = (k) => '2026-10-01T0' + k + ':00:00.000Z';
  const base = { era: 4, eras: [{ era: 4, at: at(0) }], lastGrown: { a: 4 }, idle: 0 };
  const up = { era: 6, eras: [{ era: 4, at: at(0) }, { era: 5, at: at(1) }, { era: 6, at: at(2) }], lastGrown: { a: 6, b: 5 }, idle: 0 };
  const mine = { era: 6, eras: [{ era: 4, at: at(0) }, { era: 5, at: at(3) }, { era: 6, at: at(4) }], lastGrown: { a: 5, c: 6 }, idle: 1 };
  const { doc, map } = mergeEraDocs(up, mine, base);
  assert.deepEqual(map, { 5: 7, 6: 8 });
  assert.deepEqual(doc.eras.map((r) => [r.era, r.at, r.renumberedFrom ?? null]), [[4, at(0), null], [5, at(1), null], [6, at(2), null], [7, at(3), 5], [8, at(4), 6]]);
  assert.equal(doc.era, 8);
  assert.deepEqual(doc.lastGrown, { a: 7, b: 5, c: 8 });
  assert.equal(doc.idle, 1);
  // no base: every era of mine the remote does not hold (same number and time) is new
  assert.deepEqual(mergeEraDocs(up, mine).doc.eras.map((r) => r.era), [4, 5, 6, 7, 8]);
  assert.deepEqual(mergeEraDocs(up, up).doc.eras.map((r) => r.era), [4, 5, 6], 'the same record merges to itself');
});

test('the lock work/grow/era.lock: held refuses (exit 1, nothing run); stale past 30 minutes unless its pid lives on this host; never held past 6 hours; not JSON ages by its mtime; a stale lock is moved aside by rename and named; only our own lock is renewed or removed', () => {
  const root = makeRoot();
  const H = os.hostname(), lockFile = path.join(root, LOCK);
  const ago = (ms) => new Date(T0 - ms).toISOString();
  const write = (o) => put(root, LOCK, typeof o === 'string' ? o : JSON.stringify(o) + '\n');
  try {
    assert.equal(STALE_MS, 30 * 60000);
    assert.equal(HARD_STALE_MS, 6 * 60 * 60000);
    const held = JSON.stringify({ pid: 99999, host: H, at: new Date(Date.now() - 29 * 60000).toISOString(), token: 'other' }) + '\n';
    write(held);
    const r = drive(root, ['run', '--max-eras', '1'], { CI: '1' });
    assert.equal(r.code, 1);
    assert.match(r.stderr, /^era: work\/grow\/era\.lock is held by pid 99999 since /);
    assert.deepEqual(calls(root), [], 'nothing ran');
    assert.ok(!fs.existsSync(path.join(root, ERA_FILE)));
    assert.equal(fs.readFileSync(lockFile, 'utf8'), held, 'the other run\'s lock is untouched');
    write({ pid: 77, host: H, at: ago(STALE_MS + 1000), token: 'a' });
    assert.equal(lockState(root, T0, { alive: () => true }).state, 'held', 'past 30 minutes with its pid alive on this host');
    assert.equal(lockState(root, T0, { alive: () => true, host: 'another-host' }).state, 'stale', 'a pid seen on another host is not that run');
    assert.equal(lockState(root, T0, { alive: () => false }).state, 'stale');
    assert.equal(lockState(root, T0 - 2000, { alive: () => false }).state, 'held', '30 minutes is the line');
    write({ pid: 77, host: H, at: ago(HARD_STALE_MS + 1000), token: 'a' });
    assert.equal(lockState(root, T0, { alive: () => true }).state, 'stale', 'never held past 6 hours');
    assert.equal(lockState(root, T0 - 2000, { alive: () => true }).state, 'held');
    write({ pid: 77, host: H, at: ago(STALE_MS + 1000), token: 'a' });
    const l = takeLock(root, { now: () => T0, pid: 5, alive: () => false });
    assert.deepEqual(l.replaced, { pid: 77, at: ago(STALE_MS + 1000) });
    const mine = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
    assert.deepEqual(mine, { pid: 5, host: H, at: ago(0), token: l.token });
    assert.deepEqual(fs.readdirSync(path.dirname(lockFile)), ['era.lock'], 'nothing left aside');
    refreshLock(root, l, () => T0 + 5000);
    assert.equal(JSON.parse(fs.readFileSync(lockFile, 'utf8')).at, new Date(T0 + 5000).toISOString());
    write({ pid: 9, host: H, at: ago(0), token: 'theirs' });
    refreshLock(root, l, () => T0 + 9000);
    releaseLock(root, l);
    assert.deepEqual(JSON.parse(fs.readFileSync(lockFile, 'utf8')), { pid: 9, host: H, at: ago(0), token: 'theirs' }, 'another run\'s lock is never renewed or removed');
    // not JSON: its mtime is its time
    write('garbage');
    const old = new Date(Date.now() - STALE_MS - 60000);
    assert.equal(lockState(root).state, 'held');
    fs.utimesSync(lockFile, old, old);
    assert.equal(lockState(root).state, 'stale');
    const s = drive(root, ['run', '--max-eras', '1'], { CI: '1' });
    assert.equal(s.code, 0, s.stderr);
    assert.match(s.json.lock, /^took over a stale lock \(pid \?, /);
    assert.equal(lockState(root).state, 'free');
    assert.equal(pidAlive(process.pid), true);
    assert.equal(pidAlive(-1), false);
    assert.equal(pidAlive(0), false);
  } finally { clean(root); }
});

test('the lock is ours while the era runs and renewed before every step', async () => {
  const root = makeRoot();
  try {
    const seen = [];
    const c = clocked(root, 1000);
    const exec = (script, args, o) => { if (script === 'grow/teach.mjs' || script === 'grow/measure.mjs') seen.push(lockState(root, c.now())); return c.exec(script, args, o); };
    const j = await inproc(root, { maxMs: 10 * 60000, maxEras: 1, now: c.now, exec, pid: 4242 });
    assert.equal(j.eras, 1);
    assert.deepEqual(seen.map((s) => [s.state, s.pid]), [['held', 4242], ['held', 4242]]);
    assert.equal(seen[0].at, new Date(T0 + 3000).toISOString(), 'renewed before teach (three children ran)');
    assert.equal(seen[1].at, new Date(T0 + 7000).toISOString(), 'renewed before measure');
    assert.ok(!fs.existsSync(path.join(root, LOCK)));
  } finally { clean(root); }
});

test('refused on a PC exactly as grow/sandbox.mjs --backend here: exit 4 with the reason, nothing run or written, both backends; any one of the four cloud names allows it', async () => {
  assert.deepEqual([...CLOUD_ENV], [...SANDBOX_CLOUD_ENV], 'the same environment names as the sandbox runner');
  const root = makeRoot();
  try {
    for (const backend of ['here', 'vercel']) {
      const r = drive(root, ['run', '--max-eras', '1', '--backend', backend]);
      assert.equal(r.code, 4, r.stderr);
      assert.equal(r.stderr.trim(), 'era: ' + PC_REFUSAL + ' (--backend ' + backend + ')');
      assert.match(r.stderr, /CLAUDE_CODE_REMOTE, GITHUB_ACTIONS, VERCEL or CI/);
      assert.equal(r.stdout, '');
    }
    assert.deepEqual(calls(root), [], 'nothing ran');
    assert.ok(!fs.existsSync(path.join(root, ERA_FILE)) && !fs.existsSync(path.join(root, LOCK)), 'nothing written');
    await assert.rejects(runEras(root, { env: envOf(), procs: () => [] }), (e) => e.code === 4);
    assert.equal(allowedHere(envOf()).ok, false);
    for (const k of CLOUD_ENV) {
      assert.equal(allowedHere(envOf({ [k]: '1' })).ok, true, k);
      reset(root);
      const r = drive(root, ['run', '--max-eras', '1'], { [k]: 'true' });
      assert.equal(r.code, 0, k + ': ' + r.stderr);
      assert.equal(calls(root).length, 8, k);
    }
  } finally { clean(root); }
});

test('--dry lists what one era would run, in c1 order, and runs nothing, writes nothing, takes no lock, on a PC too', () => {
  const era = { era: 2, eras: [], lastGrown: { alpha: 2 } };
  const root = makeRoot({ ledger: ['alpha', 'beta', 'gamma'], open: [], cells: [neoRow('beta', 1)], era });
  try {
    const R = path.resolve(root);
    const before = fs.readFileSync(path.join(root, ERA_FILE), 'utf8');
    const r = drive(root, ['run', '--dry', '--workers', '2']);
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.dry, true);
    assert.equal(r.json.allowed, false);
    assert.equal(r.json.why, PC_REFUSAL);
    assert.equal(r.json.era, 3);
    assert.equal(r.json.generation, 4);
    assert.equal(r.json.lock, 'free');
    assert.deepEqual(r.json.mastered, ['beta']);
    const sub = (s) => s.replace(/--max-ms \d+/, '--max-ms N');
    assert.deepEqual(r.json.would.map(sub), [
      'node grow/absorb.mjs pull --gen 4 --max-ms N --root ' + R, 'node grow/frontier.mjs step --max-ms N --era 3 --root ' + R,
      'node grow/know.mjs shelve --max-ms N --era 3 --root ' + R, 'node grow/teach.mjs intake --gen 4 --root ' + R,
      'node grow/swarm.mjs grow --gen 4 --max-ms N --era 3 --workers 2 --root ' + R, 'node grow/neo.mjs regate --root ' + R,
      'node grow/evolve.mjs step --max-ms N --era 3 --root ' + R, 'node grow/measure.mjs run --era 3 --max-ms N --root ' + R,
    ]);
    const c = drive(root, ['run', '--dry', '--commit'], { CI: '1' });
    assert.equal(c.json.allowed, true);
    const ps = SHIP_PATHS.join(' ');
    assert.deepEqual(c.json.would.slice(8, 10), ['git add -- ' + ps, 'git commit -m "era 3: <tasks> tasks, <cells> cells, <mastered> mastered" -m "' + TRAILER + '" -- ' + ps]);
    assert.match(c.json.would[10], /^git push \(a rebase onto the remote and again when it moved, at most 3 pushes\)$/);
    assert.equal(drive(root, ['run', '--dry', '--commit', '--no-push']).json.would.length, 10);
    // without grow/swarm.mjs: the serial grows, the gamma (never grown) before alpha, beta mastered
    fs.rmSync(path.join(root, 'grow', 'swarm.mjs'));
    const s = drive(root, ['run', '--dry']);
    assert.deepEqual(s.json.would.slice(4, 6), ['node grow/neo.mjs grow --task gamma --gen 4 --root ' + R, 'node grow/neo.mjs grow --task alpha --gen 4 --root ' + R]);
    assert.deepEqual(s.json.skipped, ['grow: grow/swarm.mjs is not on disk: the era grows task by task']);
    put(root, LOCK, JSON.stringify({ pid: 5, at: new Date().toISOString() }));
    assert.equal(drive(root, ['run', '--dry']).json.lock, 'held');
    assert.deepEqual(calls(root), [], 'no child ran');
    assert.equal(fs.readFileSync(path.join(root, ERA_FILE), 'utf8'), before, 'neo/ERA.json untouched');
  } finally { clean(root); }
});

test('MASTERED by the engine\'s rule: serve when the gate judged the row (serve false is not mastered whatever it scores), else held-out score 1; a hand-grown cell is no colony; growOrder', () => {
  assert.equal(masteredRow(neoRow('a', 1)), true);
  assert.equal(masteredRow(neoRow('a', 1, { serve: false })), false);
  assert.equal(masteredRow(neoRow('a', 0.5, { serve: true })), true);
  assert.equal(masteredRow(neoRow('a', 0.9)), false);
  const root = makeRoot({ cells: [neoRow('alpha', 1, { serve: false }), neoRow('beta', 1), HAND, { ...neoRow('x', 1), id: 'gamma-neo-g3', class: undefined }] });
  try {
    const cols = colonies(root);
    assert.deepEqual([...cols.keys()].sort(), ['alpha', 'beta', 'gamma']);
    assert.deepEqual([...cols.entries()].filter(([, c]) => c.mastered).map(([t]) => t).sort(), ['beta', 'gamma']);
    put(root, 'grown/index.json', '{ not json');
    assert.equal(colonies(root), null);
  } finally { clean(root); }
  assert.deepEqual(growOrder(['a', 'b', 'c', 'd'], { a: 3, b: 1, d: 1 }), ['c', 'b', 'd', 'a']);
});

test('neo/ERA.json keeps the last 200 eras and the count era never resets; one that is not its shape fails before anything runs and is never rewritten', () => {
  assert.equal(KEEP, 200);
  const rows = Array.from({ length: 200 }, (_, i) => ({ era: 51 + i, at: '2026-10-01T00:00:00.000Z', ms: 1, grown: [], cells: null, mastered: 0, blocked: [] }));
  const root = makeRoot({ era: { era: 250, eras: rows, lastGrown: { omega: 250 } } });
  try {
    const r = drive(root, ['run', '--max-eras', '1'], { CI: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.era, 251);
    const doc = eraDoc(root);
    assert.equal(doc.eras.length, 200);
    assert.equal(doc.eras[0].era, 52);
    assert.equal(doc.eras[199].era, 251);
    assert.deepEqual(doc.lastGrown, { omega: 250, alpha: 251, beta: 251 });
    fs.writeFileSync(path.join(root, ERA_FILE), JSON.stringify({ era: 5, eras: [{ era: 7 }], lastGrown: {} }));
    assert.equal(readEra(root).era, 7, 'a count behind its own rows never goes back');
  } finally { clean(root); }
  for (const [text, why] of [['{ not json', /^era: neo\/ERA\.json is not JSON/], ['{"era":"x","eras":[]}', /^era: neo\/ERA\.json is not \{ era, eras: \[\.\.\], lastGrown \}/]]) {
    const bad = makeRoot({ era: text });
    try {
      const r = drive(bad, ['run', '--max-eras', '1'], { CI: '1' });
      assert.equal(r.code, 1);
      assert.match(r.stderr, why);
      assert.deepEqual(calls(bad), []);
      assert.equal(fs.readFileSync(path.join(bad, ERA_FILE), 'utf8'), text);
      assert.ok(!fs.existsSync(path.join(bad, LOCK)));
      assert.equal(drive(bad, ['status']).code, 1);
    } finally { clean(bad); }
  }
});

test('status prints the head of neo/ERA.json, the idle count and the lock', () => {
  const root = makeRoot();
  try {
    assert.deepEqual(status(root), { era: 0, eras: 0, idle: 0, last: null, lastGrown: {}, lock: 'free' });
    assert.equal(drive(root, ['run', '--max-eras', '2'], { CI: '1' }).code, 0);
    const s = drive(root, ['status']);
    assert.equal(s.code, 0, s.stderr);
    assert.equal(s.lines.length, 1);
    assert.equal(s.json.era, 2);
    assert.equal(s.json.eras, 2);
    assert.equal(s.json.idle, 1);
    assert.equal(s.json.last.era, 2);
    assert.deepEqual(s.json.lastGrown, { alpha: 2, beta: 2 });
    assert.equal(s.json.lock, 'free');
    put(root, LOCK, JSON.stringify({ pid: 77, at: new Date().toISOString() }));
    assert.match(drive(root, ['status']).json.lock, /^held \(pid 77, /);
  } finally { clean(root); }
});

test('a generation finish in flight in this checkout: no era starts beside it, and a run in progress stops between eras', async () => {
  const root = makeRoot();
  const other = tmp('grow-era-other-');
  try {
    const R = path.resolve(root);
    const fin = (argv, cwd = R, pid = 10) => () => [{ pid, argv, cwd }];
    const script = path.join(R, 'grow', 'generation.mjs');
    assert.deepEqual(finishesInFlight(R, fin(['node', script, 'finish', '--gen', '5'])), [10]);
    assert.deepEqual(finishesInFlight(R, fin(['node', 'grow/generation.mjs', 'finish'])), [10], 'relative to its cwd');
    assert.deepEqual(finishesInFlight(R, fin(['node', path.join(BRAIN, 'grow', 'generation.mjs'), 'finish', '--root', R], '/')), [10], 'its --root names the tree');
    assert.deepEqual(finishesInFlight(R, fin(['node', path.join(BRAIN, 'grow', 'generation.mjs'), 'finish', '--root=' + R], '/')), [10]);
    assert.deepEqual(finishesInFlight(R, fin(['node', script, 'status'])), [], 'not a finish');
    assert.deepEqual(finishesInFlight(R, fin(['node', path.join(other, 'grow', 'generation.mjs'), 'finish'])), [], 'another checkout');
    assert.deepEqual(finishesInFlight(R, fin(['node', script, 'finish']), 10), [], 'never its own pid');
    assert.deepEqual(finishesInFlight(R, () => { throw new Error('no /proc'); }), []);
    await assert.rejects(inproc(root, { procs: fin(['node', script, 'finish']) }), (e) => e.code === 1 && /^a generation finish is in flight in this checkout \(pid 10\): no era runs beside it$/.test(e.message));
    assert.deepEqual(calls(root), []);
    assert.ok(!fs.existsSync(path.join(root, ERA_FILE)) && !fs.existsSync(path.join(root, LOCK)));
    let n = 0;
    const later = () => (n++ === 0 ? [] : [{ pid: 11, argv: ['node', script, 'finish'], cwd: R }]);
    const c = clocked(root, 1000);
    const j = await inproc(root, { maxEras: 5, procs: later, now: c.now, exec: c.exec });
    assert.equal(j.eras, 1);
    assert.equal(j.stop, 'finish');
    assert.deepEqual(j.blocked, ['a generation finish is in flight in this checkout (pid 11): no further era']);
    assert.equal(eraDoc(root).era, 1);
    assert.ok(!fs.existsSync(path.join(root, LOCK)));
  } finally { clean(root, other); }
});

test('it never opens state/, judge/heldout/, judge/control.jsonl or any neo/tasks/*/heldout.jsonl (every fs read in this process watched)', async () => {
  const root = makeRoot({ ledger: ['alpha'], cells: [neoRow('alpha', 0.5)] });
  put(root, 'neo/tasks/beta/heldout.jsonl', '{"q":"HELDOUT-SENTINEL"}\n');
  const R = path.resolve(root).split(path.sep).join('/').toLowerCase();
  const bad = (p) => {
    if (typeof p !== 'string' && !(p instanceof URL) && !Buffer.isBuffer(p)) return false;
    const s = path.resolve(String(p instanceof URL ? fileURLToPath(p) : p)).split(path.sep).join('/').toLowerCase();
    if (!s.startsWith(R + '/')) return false;
    const rel = s.slice(R.length + 1);
    return rel === 'state' || rel.startsWith('state/') || rel === 'judge/heldout' || rel.startsWith('judge/heldout/') || rel === 'judge/control.jsonl' || /^neo\/tasks\/[^/]+\/heldout\.jsonl$/.test(rel);
  };
  const names = ['readFileSync', 'openSync', 'readdirSync', 'statSync', 'lstatSync', 'existsSync', 'createReadStream', 'readFile', 'open', 'opendirSync', 'accessSync', 'realpathSync'];
  const orig = {}, hits = [];
  for (const k of names) {
    orig[k] = fs[k];
    fs[k] = Object.assign(function watched(p, ...rest) { if (bad(p)) hits.push(k + ' ' + String(p)); return orig[k].call(this, p, ...rest); }, orig[k]);
  }
  syncBuiltinESMExports();
  try {
    const c = clocked(root);
    const j = await inproc(root, { maxEras: 2, now: c.now, exec: c.exec });
    assert.equal(j.eras, 2);
    await inproc(root, { dry: true, commit: true });
    status(root);
    readEra(root);
    colonies(root);
    fingerprint(root);
    assert.deepEqual(hits, []);
    fs.readFileSync(path.join(root, 'judge', 'control.jsonl'), 'utf8');
    assert.equal(hits.length, 1, 'the watch itself sees a read there (a guard that never fires proves nothing)');
  } finally {
    for (const k of names) fs[k] = orig[k];
    syncBuiltinESMExports();
    clean(root);
  }
});

test('all native: grow/era.mjs imports node builtins and its two siblings only; no network, model, eval or dynamic import in its code; no em-dash in it or this file', () => {
  const src = fs.readFileSync(ERA, 'utf8');
  const specs = importsOf(src);
  assert.deepEqual(specs.filter((s) => !s.startsWith('node:')).sort(), ['./generation.mjs', './teach.mjs'], 'never ./swarm.mjs: the swarm is a child');
  assert.ok(specs.filter((s) => s.startsWith('node:')).every((s) => ['node:fs', 'node:os', 'node:path', 'node:crypto', 'node:child_process', 'node:url'].includes(s)), specs.join(' '));
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
  for (const re of [/\bfetch\s*\(/, /https?:/i, /ollama/i, /anthropic/i, /openai/i, /11434/, /\beval\s*\(/, /new\s+Function/, /\bimport\s*\(/, /\brequire\s*\(/, /net\.connect|node:https?|node:net|WebSocket/]) {
    assert.ok(!re.test(code), 'grow/era.mjs code matches ' + re);
  }
  for (const f of [ERA, fileURLToPath(import.meta.url)]) assert.ok(!fs.readFileSync(f, 'utf8').includes(String.fromCharCode(0x2014)), path.basename(f) + ' holds an em-dash');
  for (const name of TOKEN_NAMES) assert.ok(!code.includes(name), 'grow/era.mjs names the token ' + name);
});

test('usage: a bad flag, value or verb is exit 2 with one line and nothing run; --help prints the usage', () => {
  const root = makeRoot();
  try {
    const cases = [
      [['run', '--max-ms', '0'], /^era: --max-ms is an integer from 1, not 0$/],
      [['run', '--max-ms', 'soon'], /^era: --max-ms is an integer from 1, not soon$/],
      [['run', '--max-eras', '-1'], /^era: --max-eras is an integer from 0, not -1$/],
      [['run', '--workers', '0'], /^era: --workers is an integer from 1 to 64, not 0$/],
      [['run', '--workers', '65'], /^era: --workers is an integer from 1 to 64, not 65$/],
      [['run', '--workers', 'all'], /^era: --workers is an integer from 1 to 64, not all$/],
      [['run', '--backend', 'cloud'], /^era: --backend is here or vercel, not cloud$/],
      [['run', '--no-push'], /^era: --no-push needs --commit$/],
      [['run', '--commit=yes'], /^era: --commit takes no value$/],
      [['run', '--bogus'], /^era: unknown flag --bogus \(see --help\)$/],
      [['run', 'now'], /^era: unexpected argument now \(see --help\)$/],
      [['status', '--dry'], /^era: status takes only --root, not --dry$/],
      [['dance'], /^era: unknown verb dance: run or status \(--help\)$/],
    ];
    for (const [args, re] of cases) {
      const r = drive(root, args, { CI: '1' });
      assert.equal(r.code, 2, args.join(' ') + ': ' + r.stderr);
      assert.match(r.stderr.trim(), re);
      assert.equal(r.stderr.trim().split(/\r?\n/).length, 1);
      assert.equal(r.stdout, '');
    }
    assert.deepEqual(calls(root), []);
    assert.ok(!fs.existsSync(path.join(root, ERA_FILE)));
    for (const args of [['--help'], ['run', '-h'], []]) {
      const h = drive(root, args);
      assert.equal(h.code, 0);
      assert.equal(h.stdout.trim(), USAGE);
    }
  } finally { clean(root); }
});

test('the era with the real grow/swarm.mjs (a shim in the stub tree runs it): the engine stub lacks "stage", so the swarm grows task by task and says so; the era records its workers and results', (t) => {
  const root = makeRoot({ open: ['alpha', 'beta', 'gamma'], plan: { beta: { score: 1 }, gamma: { fail: true } } });
  try {
    put(root, 'grow/swarm.mjs', 'const m = await import(' + JSON.stringify(pathToFileURL(SWARM).href) + ');\nconst r = await m.main(process.argv.slice(2));\nconsole.log(JSON.stringify(r));\n');
    const r = drive(root, ['run', '--max-eras', '2', '--workers', '4'], { CI: '1' });
    assert.equal(r.code, 0, r.stderr);
    t.diagnostic(r.lines[r.lines.length - 1]);
    const doc = eraDoc(root);
    assert.deepEqual(seq(root).slice(4, 9), ['neo status', 'neo grow --task alpha --gen 4 --max-ms N', 'neo grow --task beta --gen 4 --max-ms N', 'neo grow --task gamma --gen 4 --max-ms N', 'neo regate']);
    assert.deepEqual(doc.eras[0].grown.map((g) => g.task), ['alpha', 'beta']);
    assert.equal(doc.eras[0].workers, 1, 'the serial fallback is one worker');
    assert.ok(doc.eras[0].blocked.some((b) => /^grow: gamma: node grow\/neo\.mjs grow exited 1: neo grow failed: stub gamma$/.test(b)), doc.eras[0].blocked.join(' | '));
    assert.equal(doc.eras[0].mastered, 1);
    assert.deepEqual(seq(root).filter((s) => s.startsWith('neo grow')).slice(3), ['neo grow --task gamma --gen 4 --max-ms N', 'neo grow --task alpha --gen 4 --max-ms N'], 'era 2: beta mastered and skipped; gamma (no colony) before alpha (0.5), both grown in era 1');
    assert.deepEqual(doc.lastGrown, { alpha: 2, beta: 1, gamma: 2 });
  } finally { clean(root); }
});

test('the lock: a stale lock another run replaced between the look and the rename is put back, and this run refuses (the token is checked after the rename)', () => {
  const root = makeRoot();
  const lockFile = path.join(root, LOCK);
  try {
    put(root, LOCK, JSON.stringify({ pid: 4242, host: 'h1', at: new Date(T0 - STALE_MS - 60000).toISOString(), token: 'old' }) + '\n');
    const fresh = JSON.stringify({ pid: 999, host: 'h1', at: new Date(T0).toISOString(), token: 'fresh' }) + '\n';
    let looked = 0;
    // the other run lands its fresh lock while this one is still judging the old one stale
    const alive = () => { looked++; fs.writeFileSync(lockFile, fresh); return false; };
    assert.throws(() => takeLock(root, { now: () => T0, pid: 5, host: 'h1', alive }), (e) => e.code === 1 && /is held by pid 999 since /.test(e.message));
    assert.ok(looked >= 1);
    assert.equal(fs.readFileSync(lockFile, 'utf8'), fresh, 'the other run\'s fresh lock is back in place');
    assert.deepEqual(fs.readdirSync(path.dirname(lockFile)), ['era.lock'], 'nothing left aside');
  } finally { clean(root); }
});

test('a rebase conflict outside neo/ and grown/ (an unpushed human commit the remote also changed) aborts the rebase: the push fails naming the path, nothing is lost, no rebase is left in progress', () => {
  const base = tmp('grow-era-outside-');
  const seed = makeRoot();
  try {
    const env = gitEnvOf(base), git = gitIn(env);
    const remote = path.join(base, 'remote.git');
    git(base, ['init', '-q', '--bare', '-b', 'master', remote]);
    put(seed, 'README.md', 'one\n');
    git(seed, ['init', '-q', '-b', 'master']);
    git(seed, ['add', '-A']);
    git(seed, ['commit', '-q', '-m', 'stub tree']);
    git(seed, ['remote', 'add', 'origin', remote]);
    git(seed, ['push', '-q', 'origin', 'master']);
    const [A, B] = ['a', 'b'].map((k) => { const d = path.join(base, k); git(base, ['clone', '-q', remote, d]); return d; });
    put(B, 'README.md', 'two from B\n');
    git(B, ['commit', '-q', '-am', 'B edits the readme']);
    git(B, ['push', '-q', 'origin', 'master']);
    put(A, 'README.md', 'two from A\n');
    git(A, ['commit', '-q', '-am', 'a human edits the readme and does not push']);
    put(A, 'neo/notes-a.json', '{}\n');
    git(A, ['add', 'neo/notes-a.json']);
    git(A, ['commit', '-q', '-m', 'era 1: 2 tasks, 20 cells, 0 mastered']);
    const head = git(A, ['rev-parse', 'HEAD']);
    const p = pushEra(A, { env });
    assert.equal(p.ok, false);
    assert.equal(p.why, 'the rebase onto origin/master failed: a conflict outside neo/ and grown/ (README.md): not the era\'s to resolve');
    assert.equal(git(A, ['rev-parse', 'HEAD']), head, 'the rebase was aborted: both commits stay as they were');
    assert.equal(fs.readFileSync(path.join(A, 'README.md'), 'utf8'), 'two from A\n');
    assert.ok(!fs.existsSync(path.join(A, '.git', 'rebase-merge')) && !fs.existsSync(path.join(A, '.git', 'rebase-apply')), 'no rebase in progress');
    assert.equal(git(remote, ['log', '-1', '--format=%s', 'master']), 'B edits the readme', 'nothing was pushed');
  } finally { clean(seed, base); }
});
