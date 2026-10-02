// test/grow-swarm.test.mjs: THE SWARM (grow/swarm.mjs; contract c1 "swarm grow", contract c3 STAGE) against a FAKE
// engine. Every test builds a temporary root holding a fake grow/neo.mjs (status prints the features swarm-plan.json
// names; grow --stage writes the staged file the plan names, good or bad, after the plan's sleep, or dies, or hangs with a
// grandchild, or leaves a detached child that rewrites its staged file later; grow without --stage writes into the tree as
// the serial engine does; merge reads its stage, logs the files and the module texts it saw and applies them), a ledger, grown/index.json and sentinel files where no swarm may look (state/,
// judge/heldout/, judge/control.jsonl, neo/tasks/*/heldout.jsonl). Each call of the fake engine is an event in
// events.log with its time, so the tests read the order, the overlap and what the merge saw. Nothing here reaches the
// network, a model, a token or the tree's neo/ or grown/; every temporary directory is removed.
// Author: Opus 5.5 builder (ERA) for the Fable 5.1 orchestrator, 2026-10-01, his Order 7.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { syncBuiltinESMExports } from 'node:module';
import {
  swarmGrow, swarmOrder, defaultWorkers, verifyStaged, moduleOf, stagedTask, mergeRows, mergeVerdict, taskOfEntry, resultOf, USAGE, ENGINE,
  PER_TASK_CAP_MS, MIN_TASK_MS, SPAWN_DEFAULT_MS, MERGE_SHARE, MERGE_FILE_MS, MERGE_GUARD_MS, MIN_FILE_MS, DEFAULT_MAX, WORKERS, roundPlan, mergeGuard,
  shardOf, parseShard, MAX_SHARDS, swarmMerge, stageDirOf,
} from '../grow/swarm.mjs';
import { colonies, taskSig, STALE_AFTER } from '../grow/era.mjs';
import { createHash } from 'node:crypto';
import { TOKEN_NAMES, CLOUD_ENV } from '../grow/generation.mjs';
import { importsOf } from '../grow/contract.mjs';

const BRAIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SWARM = path.join(BRAIN, 'grow', 'swarm.mjs');
const T0 = Date.parse('2026-10-01T12:00:00.000Z');

const FAKE_NEO = `import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n) => { const a = process.argv.slice(2), i = a.indexOf(n); return i >= 0 ? a[i + 1] : null; };
const readJ = (rel, dflt) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); } catch { return dflt; } };
const writeJ = (rel, o) => { const f = path.join(ROOT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\\n'); };
const ev = (o) => fs.appendFileSync(path.join(ROOT, 'events.log'), JSON.stringify({ ...o, t: Date.now(), pid: process.pid }) + '\\n');
const hang = () => { const c = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore', detached: process.platform === 'win32' }); fs.appendFileSync(path.join(ROOT, 'grandchild.pid'), c.pid + '\\n'); setInterval(() => {}, 1000); };
const colony = (task, g, score) => ({ id: task + '-neo-g' + g, class: task, task, generation: g, lane: 'neo', tier: 'neo', heldout: { score, n: 10, ok: Math.round(score * 10) }, cells: 5 });
const plan = readJ('swarm-plan.json', {});
const verb = process.argv[2];
if (verb === 'status') {
  ev({ verb });
  if (plan.statusFail) { console.error('status failed: stub'); process.exit(1); }
  console.log(JSON.stringify({ tasks: 0, features: plan.features ?? [] }));
} else if (verb === 'grow') {
  const task = arg('--task'), stage = arg('--stage'), g = Number(arg('--gen')), p = (plan.tasks || {})[task] || {};
  ev({ verb, task, stage, gen: arg('--gen'), maxMs: arg('--max-ms'), phase: 'start' });
  const finish = () => {
    if (p.die) { console.error('neo grow failed: stub ' + task); process.exit(1); }
    const result = { task, generation: g, generated: p.generated ?? 100, kept: 5, cells: 5, heldout: { ok: 5, n: 10, score: p.score ?? 0.5 }, baseline: { ok: 0, n: 10, score: 0 }, promoted: true, why: [] };
    if (stage) {
      const f = path.join(stage, task + '.json');
      const doc = { task, result, module: 'export const id = ' + JSON.stringify(task) + ';\\n', ledger: { generated: result.generated } };
      const k = p.staged ?? 'ok';
      if (k === 'badjson') fs.writeFileSync(f, '{ "task": ');
      else if (k === 'array') fs.writeFileSync(f, '[1, 2]');
      else if (k === 'wrongtask') fs.writeFileSync(f, JSON.stringify({ ...doc, task: 'other-task', result: { ...result, task: 'other-task' } }));
      else if (k === 'notask') fs.writeFileSync(f, JSON.stringify({ result: { ...result, task: undefined }, module: doc.module }));
      else if (k === 'badmodule') fs.writeFileSync(f, JSON.stringify({ ...doc, module: 'export const = ;' }));
      else if (k === 'nonstring') fs.writeFileSync(f, JSON.stringify({ ...doc, module: 42 }));
      else if (k === 'nomodule') fs.writeFileSync(f, JSON.stringify({ task, result }));
      else if (k === 'colonymodule') fs.writeFileSync(f, JSON.stringify({ task, result, colony: { source: 'export default ;;; =' } }));
      else if (k === 'engine' || k === 'enginebad' || k === 'enginenull' || k === 'enginenosrc') {
        const id = task + '-neo-g' + g;
        const src = k === 'enginebad' ? 'export const = ;' : 'export const id = ' + JSON.stringify(id) + ';\\n';
        const module = k === 'enginenull' ? null : k === 'enginenosrc' ? { id } : { id, source: src };
        fs.writeFileSync(f, JSON.stringify({ kind: 'neo-stage', version: 1, task, generation: g, ledger: { generated: result.generated }, stats: {}, result: { ...result, promoted: false, ...(module ? { id } : {}) }, module, cells: [] }) + '\\n');
      }
      else if (k !== 'nofile') fs.writeFileSync(f, JSON.stringify(doc));
      if (p.extra) fs.writeFileSync(path.join(stage, p.extra), JSON.stringify(doc));
      if (p.rewrite) spawn(process.execPath, [fileURLToPath(import.meta.url), 'rewrite', f, String(p.rewrite)], { stdio: 'ignore', detached: true, windowsHide: true }).unref();
    } else {
      const ix = readJ('grown/index.json', { generation: 0, cells: [] });
      ix.cells = ix.cells.filter((c) => !(c.tier === 'neo' && c.task === task));
      ix.cells.push(colony(task, g, result.heldout.score));
      writeJ('grown/index.json', ix);
    }
    ev({ verb, task, phase: 'end' });
    console.log(JSON.stringify(result));
  };
  if (p.hang) { if (p.late && stage) fs.writeFileSync(path.join(stage, task + '.json'), JSON.stringify({ task, result: { task } })); hang(); }
  else setTimeout(finish, p.sleep ?? 0);
} else if (verb === 'merge') {
  const stage = arg('--stage');
  const files = fs.readdirSync(stage).sort();
  const mods = files.map((f) => { try { return JSON.parse(fs.readFileSync(path.join(stage, f), 'utf8')).module ?? null; } catch { return null; } });
  ev({ verb, files, mods, maxMs: arg('--max-ms') });
  if (plan.mergeFail) { console.error('merge failed: stub'); process.exit(1); }
  if (plan.mergeEngine) {
    const out = { files: files.length, merged: [], promoted: [], refused: [], skipped: [], left: [] };
    for (const f of files) {
      const j = JSON.parse(fs.readFileSync(path.join(stage, f), 'utf8'));
      if ((plan.mergeLeft || []).includes(j.task)) { out.left.push(f); continue; }
      if ((plan.mergeSkip || []).includes(j.task)) { out.skipped.push(f); continue; }
      if ((plan.mergeRefuse || []).includes(j.task)) { out.refused.push({ file: f, task: null, why: 'stub refused ' + f }); continue; }
      out.merged.push(j.task);
      if (j.module && !(plan.mergeNoPromote || []).includes(j.task)) out.promoted.push(j.module.id);
    }
    console.log(JSON.stringify(out));
  } else {
  const merged = [], refused = [];
  const ix = readJ('grown/index.json', { generation: 0, cells: [] });
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(stage, f), 'utf8'));
    if ((plan.mergeRefuse || []).includes(j.task)) { refused.push({ task: j.task, why: 'stub refused at merge' }); continue; }
    ix.cells = ix.cells.filter((c) => !(c.tier === 'neo' && c.task === j.task));
    ix.cells.push(colony(j.task, j.result.generation, j.result.heldout.score));
    merged.push({ task: j.task, ...((plan.mergeRows || {})[j.task] || {}) });
  }
  if (!plan.mergeNoop) writeJ('grown/index.json', ix);
  console.log(JSON.stringify({ merged, refused }));
  }
} else if (verb === 'rewrite') {
  // a worker's detached child that overwrites the file it staged after the verifier read it
  const f = process.argv[3], task = path.basename(f, '.json');
  setTimeout(() => {
    fs.writeFileSync(f, JSON.stringify({ task, result: { task, generation: 1, generated: 1, heldout: { ok: 0, n: 10, score: 0 } }, module: 'export const id = "LATE";\\n' }));
    ev({ verb, task });
  }, Number(process.argv[4]));
} else { console.error('usage: one verb of spawn, grow, status, merge'); process.exit(2); }
`;
const FORBIDDEN_FILES = ['state/SENTINEL.json', 'judge/heldout/fragment.jsonl', 'judge/control.jsonl', 'neo/tasks/task-a/heldout.jsonl'];
const put = (root, rel, text) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); return f; };
const TEMPS = new Set();
process.on('exit', () => { for (const d of TEMPS) { try { fs.rmSync(d, { recursive: true, force: true }); } catch { /* best effort */ } } });
const tmp = (prefix) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), prefix)); TEMPS.add(d); return d; };
const clean = (...ds) => { for (const d of ds) { fs.rmSync(d, { recursive: true, force: true }); TEMPS.delete(d); } };
const ledgerRow = (task) => ({ task, generation: 3, devSha: 'd', heldoutSha: 'h', dev: 20, heldout: 10, by: 'stub', at: '2026-10-01T00:00:00.000Z' });
const neoRow = (task, score, extra = {}) => ({ id: task + '-neo-g3', class: task, task, generation: 3, lane: 'neo', tier: 'neo', heldout: { score, n: 10, ok: Math.round(score * 10) }, cells: 5, ...extra });

/** A fresh root: the fake engine, the ledger, grown/index.json at generation 3, the plan, the sentinels, neo/ERA.json when given. */
function makeRoot({ tasks = [], cells = [], plan = {}, era = null } = {}) {
  const root = tmp('grow-swarm-');
  put(root, ENGINE, FAKE_NEO);
  put(root, 'neo/LEDGER.json', JSON.stringify({ tasks: tasks.map(ledgerRow), generated: 0 }));
  put(root, 'grown/index.json', JSON.stringify({ generation: 3, cells }));
  put(root, 'swarm-plan.json', JSON.stringify(plan));
  if (era) put(root, 'neo/ERA.json', JSON.stringify(era));
  for (const rel of FORBIDDEN_FILES) put(root, rel, JSON.stringify({ q: 'HELDOUT-SENTINEL' }) + '\n');
  return root;
}
function envOf(extra = {}) {
  const env = { ...process.env };
  for (const k of [...TOKEN_NAMES, ...CLOUD_ENV, 'NODE_TEST_CONTEXT', 'NODE_OPTIONS']) delete env[k];
  return { ...env, ...extra };
}
function drive(root, args) {
  const r = spawnSync(process.execPath, [SWARM, ...args, '--root', root], { cwd: root, env: envOf(), encoding: 'utf8', timeout: 180000, windowsHide: true });
  const lines = String(r.stdout || '').trim().split(/\r?\n/).filter(Boolean);
  let json = null;
  try { json = JSON.parse(lines[lines.length - 1]); } catch { json = null; }
  return { code: r.status, json, lines, stdout: r.stdout || '', stderr: r.stderr || '' };
}
const events = (root) => { try { return fs.readFileSync(path.join(root, 'events.log'), 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } };
/** The most grows that ran at the same time (from their start and end events). */
function overlap(evs) {
  const marks = evs.filter((e) => e.verb === 'grow' && (e.phase === 'start' || e.phase === 'end')).map((e) => [e.t, e.phase === 'start' ? 1 : -1]).sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
  let n = 0, top = 0;
  for (const [, d] of marks) { n += d; top = Math.max(top, n); }
  return top;
}
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
/** Kill every grandchild the fake engine recorded (a test that failed leaves none running). */
const reap = (root) => { let t = ''; try { t = fs.readFileSync(path.join(root, 'grandchild.pid'), 'utf8'); } catch { return; } for (const p of t.split(/\r?\n/).filter(Boolean).map(Number)) { try { process.kill(p, 'SIGKILL'); } catch { /* gone */ } } };
const byTask = (a, b) => (a.task < b.task ? -1 : a.task > b.task ? 1 : 0);

test('the order: a mastered task (the engine\'s rule: serve when judged, else held-out 1) is skipped; the least recently grown first, then the lowest held-out score (no colony before any), then ledger order', () => {
  const cols = new Map([
    ['a', { score: 0.5, mastered: false }], ['c', { score: 0.2, mastered: false }], ['d', { score: 1, mastered: true }],
    ['e', { score: 1, mastered: false }], ['g', { score: 0.9, mastered: false }],
  ]);
  const { order, mastered } = swarmOrder(['a', 'b', 'c', 'd', 'e', 'f', 'g'], { b: 2, c: 1, g: 1 }, cols);
  assert.deepEqual(mastered, ['d']);
  assert.deepEqual(order, ['f', 'a', 'e', 'c', 'g', 'b']);
  assert.deepEqual(swarmOrder(['x', 'y'], {}, null).order, ['x', 'y'], 'an unreadable index: nothing mastered, ledger order');
  const root = makeRoot({ cells: [neoRow('task-a', 1, { serve: false }), neoRow('task-b', 1), neoRow('task-c', 0.4, { serve: true })] });
  try {
    const cl = colonies(root);
    assert.deepEqual(swarmOrder(['task-a', 'task-b', 'task-c', 'task-d'], {}, cl), { order: ['task-d', 'task-a'], mastered: ['task-b', 'task-c'] });
  } finally { clean(root); }
});

test('the pool: every core this process may use, at least 1, at most 8', () => {
  assert.equal(DEFAULT_MAX, 8);
  assert.deepEqual([defaultWorkers(1), defaultWorkers(0), defaultWorkers(4), defaultWorkers(16), defaultWorkers('x')], [1, 1, 4, 8, 1]);
  const d = defaultWorkers();
  assert.ok(Number.isInteger(d) && d >= 1 && d <= 8);
  assert.deepEqual(WORKERS, { min: 1, max: 64 });
});

test('STAGE: W workers at once, each grow --stage into one directory outside the tree; a round admits what its merges have time for (3 of 6 at 60 s); each staged file merged by its own child after its round\'s grows; the line', () => {
  const tasks = ['task-a', 'task-b', 'task-c', 'task-d', 'task-e', 'task-f'];
  const root = makeRoot({ tasks, plan: { features: ['gate', 'stage'], tasks: Object.fromEntries(tasks.map((t) => [t, { sleep: 1500 }])) } });
  try {
    const r = drive(root, ['grow', '--workers', '3', '--max-ms', '60000', '--gen', '7', '--era', '12']);
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.lines.length, 1);
    const j = r.json;
    assert.deepEqual(Object.keys(j), ['tasks', 'workers', 'grown', 'cells', 'kept', 'mastered', 'promoted', 'ms', 'cellsPerSecond', 'refused', 'fallback', 'rounds', 'merge', 'generation', 'era', 'queued', 'masteredSkipped', 'stale', 'shard', 'stage', 'results', 'blocked']);
    assert.deepEqual([j.tasks, j.workers, j.grown, j.cells, j.kept, j.mastered, j.promoted, j.rounds, j.generation, j.era, j.queued, j.masteredSkipped], [6, 3, 6, 600, 30, 0, 6, 2, 7, 12, 0, 0]);
    assert.deepEqual([j.stale, j.shard, j.stage], [[], null, null]);
    assert.deepEqual(Object.keys(j.merge), ['files', 'ms', 'slowest']);
    assert.equal(j.merge.files, 6);
    assert.ok(Number.isInteger(j.merge.ms) && j.merge.slowest > 0 && j.merge.slowest <= j.merge.ms, JSON.stringify(j.merge));
    assert.deepEqual(j.refused, []);
    assert.equal(j.fallback, null);
    assert.deepEqual(j.blocked, []);
    assert.equal(j.cellsPerSecond, Math.round(600 / (j.ms / 1000)));
    assert.deepEqual(Object.keys(j.results[0]), ['task', 'generated', 'kept', 'cells', 'promoted', 'heldout', 'baseline', 'ms']);
    assert.deepEqual(j.results.map((x) => x.task).sort(), tasks);
    const evs = events(root);
    assert.equal(evs[0].verb, 'status');
    const grows = evs.filter((e) => e.verb === 'grow' && e.phase === 'start');
    assert.deepEqual(grows.map((e) => e.task).sort(), tasks);
    assert.deepEqual(grows.slice(0, 3).map((e) => e.task).sort(), tasks.slice(0, 3), 'the first three in the swarm order start first');
    const stage = grows[0].stage;
    assert.ok(grows.every((e) => e.stage === stage && e.gen === '7'));
    assert.ok(!path.resolve(stage).toLowerCase().startsWith(path.resolve(root).toLowerCase() + path.sep), 'the stage is outside the tree');
    assert.ok(grows.every((e) => Number.isInteger(Number(e.maxMs)) && Number(e.maxMs) >= 1000 && Number(e.maxMs) <= SPAWN_DEFAULT_MS));
    assert.equal(overlap(evs), 3, 'three at once, never more');
    const merges = evs.filter((e) => e.verb === 'merge');
    assert.ok(merges.every((m) => m.files.length === 1 && m.maxMs === null), 'one file a merge child, told no --max-ms');
    assert.deepEqual(merges.flatMap((m) => m.files).sort(), tasks.map((t) => t + '.json'));
    const run = (verb, n) => Array(n).fill(verb);
    assert.deepEqual(evs.map((e) => e.verb), ['status', ...run('grow', 6), ...run('merge', 3), ...run('grow', 6), ...run('merge', 3)], 'two rounds of three: each round merges after its own grows end');
    assert.ok(!fs.existsSync(stage), 'the stage is removed');
    assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'grown', 'index.json'), 'utf8')).cells.length, 6);
    // one worker: one at a time
    fs.rmSync(path.join(root, 'events.log'));
    const one = drive(root, ['grow', '--workers', '1', '--max-ms', '60000']);
    assert.equal(one.json.workers, 1);
    assert.equal(overlap(events(root)), 1);
    assert.equal(one.json.generation, 4, 'the next generation by default');
  } finally { clean(root); }
});

test('THE VERIFIER: a staged file that is not JSON, not an object, names another task or none, or carries module text that fails node --check (or is not text) never reaches the merge; a worker that dies or stages nothing costs only its own task', () => {
  const plan = { features: ['stage'], tasks: {
    'task-ok': { extra: 'zz-stray.json' }, 'task-nomod': { staged: 'nomodule' }, 'task-badjson': { staged: 'badjson' }, 'task-array': { staged: 'array' },
    'task-wrong': { staged: 'wrongtask' }, 'task-notask': { staged: 'notask' }, 'task-badmod': { staged: 'badmodule' },
    'task-nonstr': { staged: 'nonstring' }, 'task-colmod': { staged: 'colonymodule' }, 'task-nofile': { staged: 'nofile' }, 'task-die': { die: true },
  } };
  const root = makeRoot({ tasks: Object.keys(plan.tasks), plan });
  try {
    const r = drive(root, ['grow', '--workers', '4', '--max-ms', '90000']);
    assert.equal(r.code, 0, r.stderr);
    const j = r.json;
    assert.deepEqual(j.results.map((x) => x.task).sort(), ['task-nomod', 'task-ok']);
    assert.equal(j.grown, 2);
    const merges = events(root).filter((e) => e.verb === 'merge');
    assert.ok(merges.every((m) => m.files.length === 1), 'one file a merge child (the stray file staged beside task-ok never reaches one)');
    assert.deepEqual(merges.flatMap((m) => m.files).sort(), ['task-nomod.json', 'task-ok.json'], 'the merges see only what passed');
    assert.equal(j.rounds, 2, 'six admitted at 90 s, then the five left');
    const why = Object.fromEntries(j.refused.map((x) => [x.task, x.why]));
    assert.deepEqual(Object.keys(why).sort(), ['task-array', 'task-badjson', 'task-badmod', 'task-colmod', 'task-die', 'task-nofile', 'task-nonstr', 'task-notask', 'task-wrong']);
    assert.match(why['task-badjson'], /^verifier: the staged file is not JSON \(/);
    assert.equal(why['task-array'], 'verifier: the staged file is not a JSON object');
    assert.equal(why['task-wrong'], 'verifier: the staged file names the task "other-task", not task-wrong');
    assert.equal(why['task-notask'], 'verifier: the staged file names no task, not task-notask');
    assert.match(why['task-badmod'], /^verifier: the staged module fails node --check: .*SyntaxError/);
    assert.match(why['task-colmod'], /^verifier: the staged module fails node --check: /);
    assert.equal(why['task-nonstr'], 'verifier: the staged module is not text');
    assert.equal(why['task-nofile'], 'verifier: the worker staged no file task-nofile.json');
    assert.equal(why['task-die'], 'node grow/neo.mjs grow exited 1: neo grow failed: stub task-die');
    assert.equal(j.tasks, 11);
  } finally { clean(root); }
});

test('verifyStaged, moduleOf, stagedTask, mergeRows, resultOf (units)', async () => {
  const dir = tmp('grow-swarm-unit-');
  try {
    assert.deepEqual(moduleOf({ module: 'a' }), { has: true, text: 'a' });
    assert.deepEqual(moduleOf({ colony: { source: 'b' } }), { has: true, text: 'b' });
    assert.deepEqual(moduleOf({ result: { moduleText: 'c' } }), { has: true, text: 'c' });
    assert.deepEqual(moduleOf({ module: null, result: {} }), { has: false, text: null });
    assert.equal(stagedTask({ result: { task: 'x' } }), 'x');
    assert.equal(stagedTask({ task: 7 }), null);
    const f = put(dir, 'stage/task-a.json', JSON.stringify({ task: 'task-a', module: 'export const ok = 1;\n' }));
    const v = await verifyStaged(f, 'task-a', { checkDir: path.join(dir, 'check') });
    assert.equal(v.ok, true);
    assert.equal(v.text, fs.readFileSync(f, 'utf8'), 'the text the verifier read is the text that is merged');
    // byte for byte, never a re-serialization (that would drop the layout, and a number past 2^53 would change)
    const raw = '{\n  "task": "task-a",\n  "result": { "generated": 9007199254740993 },\n  "module": "export const ok = 1;\\n"\n}\n';
    put(dir, 'stage/task-a.json', raw);
    assert.equal((await verifyStaged(f, 'task-a', { checkDir: path.join(dir, 'check') })).text, raw);
    assert.ok(fs.existsSync(path.join(dir, 'check', 'task-a.mjs')), 'the module text is checked under checkDir');
    put(dir, 'stage/task-a.json', JSON.stringify({ task: 'task-a', module: '   ' }));
    assert.deepEqual(await verifyStaged(f, 'task-a', { checkDir: path.join(dir, 'check') }), { ok: false, why: 'the staged module is not text' });
    put(dir, 'stage/task-a.json', JSON.stringify({ task: 'task-a', module: 'while (true) {}\n' }));
    assert.equal((await verifyStaged(f, 'task-a', { checkDir: path.join(dir, 'check') })).ok, true, 'node --check parses, it never runs the text');
    assert.deepEqual([...mergeRows({ merged: [{ task: 'a', promoted: false }, 'x', { no: 1 }], results: [{ task: 'b' }] }).keys()].sort(), ['a', 'b']);
    assert.equal(mergeRows(null).size, 0);
    assert.deepEqual(resultOf('t', { generated: 5, kept: 'x', promoted: 1, heldout: { ok: 1, n: 2, score: 0.5 } }, 9), { task: 't', generated: 5, kept: null, cells: null, promoted: null, heldout: { ok: 1, n: 2, score: 0.5 }, baseline: null, ms: 9 });
  } finally { clean(dir); }
});

test('a worker that hangs is killed with its whole process tree at its own deadline; a file it staged before it hung never reaches a merge; the others land; the swarm ends inside its --max-ms', async () => {
  const plan = { features: ['stage'], tasks: { 'task-a': {}, 'task-hang': { hang: true }, 'task-late': { hang: true, late: true }, 'task-b': { sleep: 300 } } };
  const root = makeRoot({ tasks: ['task-a', 'task-hang', 'task-late', 'task-b'], plan });
  try {
    // the real children, in process, with a smaller plan (1000 ms a file, a 2000 ms guard): one round of the four at 16 s,
    // the hung two killed when the grow ends (16 s less the reserve of 2000 + 4 x 1000 ms)
    const j = await swarmGrow(root, { maxMs: 16000, workers: 4, env: envOf(), mergeFileMs: 1000, mergeGuardMs: 2000 });
    assert.ok(j.ms < 16000, 'the swarm took ' + j.ms + ' ms');
    assert.equal(j.rounds, 1);
    assert.deepEqual(j.results.map((x) => x.task), ['task-a', 'task-b'], 'the fastest grown merged first');
    assert.deepEqual(j.refused.map((x) => x.task).sort(), ['task-hang', 'task-late']);
    for (const x of j.refused) assert.match(x.why, /^node grow\/neo\.mjs grow was killed at its deadline \(\d+ ms\)$/);
    const told = j.refused.map((x) => Number(x.why.match(/\((\d+) ms\)/)[1]));
    assert.ok(told.every((n) => n <= 16000 - 6000), 'killed at the grow\'s end, before the merge reserve: ' + told.join(' '));
    assert.deepEqual(events(root).filter((e) => e.verb === 'merge').map((m) => m.files), [['task-a.json'], ['task-b.json']]);
    assert.equal(j.merge.files, 2);
    const pids = fs.readFileSync(path.join(root, 'grandchild.pid'), 'utf8').split(/\r?\n/).filter(Boolean).map(Number);
    assert.equal(pids.length, 2);
    const until = Date.now() + 5000;
    while (pids.some(alive) && Date.now() < until) { /* the kill lands */ }
    assert.deepEqual(pids.filter(alive), [], 'every grandchild died with its worker (on Windows a detached one: only a tree kill reaches it)');
  } finally { reap(root); clean(root); }
});

test('SERIAL: when the engine\'s status features lack "stage" the swarm grows task by task in the tree, one child at a time, no stage and no merge ("fallback":"serial"); a status that fails is a blocked line and serial too', () => {
  const root = makeRoot({ tasks: ['task-a', 'task-b', 'task-c'], cells: [neoRow('task-c', 1)], plan: { features: ['gate'], tasks: { 'task-a': { sleep: 200 }, 'task-b': { sleep: 200 } } } });
  try {
    const r = drive(root, ['grow', '--workers', '8', '--max-ms', '60000']);
    assert.equal(r.code, 0, r.stderr);
    const j = r.json;
    assert.equal(j.fallback, 'serial');
    assert.equal(j.workers, 1);
    assert.equal(j.masteredSkipped, 1);
    assert.deepEqual(j.results.map((x) => x.task), ['task-a', 'task-b']);
    assert.equal(j.rounds, 0, 'serial: no round, no merge');
    const evs = events(root);
    assert.deepEqual(evs.filter((e) => e.phase !== 'end').map((e) => e.verb + (e.task ? ' ' + e.task : '') + (e.stage ? ' staged' : '')), ['status', 'grow task-a', 'grow task-b']);
    assert.equal(overlap(evs), 1);
    assert.deepEqual(colonies(root).get('task-a'), { ok: 5, n: 10, score: 0.5, mastered: false }, 'the serial engine wrote into the tree');
    put(root, 'swarm-plan.json', JSON.stringify({ statusFail: true }));
    fs.rmSync(path.join(root, 'events.log'));
    const b = drive(root, ['grow', '--max-ms', '60000']);
    assert.equal(b.json.fallback, 'serial');
    assert.deepEqual(b.json.blocked, ['node grow/neo.mjs status exited 1: status failed: stub: grown task by task']);
    assert.equal(b.json.grown, 2);
    // nothing to grow: no child at all, no fallback, no worker
    const c = makeRoot({ tasks: ['task-c'], cells: [neoRow('task-c', 1)] });
    try {
      const k = drive(c, ['grow']);
      assert.deepEqual([k.json.tasks, k.json.workers, k.json.fallback, k.json.masteredSkipped], [0, 0, null, 1]);
      assert.deepEqual(events(c), []);
    } finally { clean(c); }
  } finally { clean(root); }
});

/**
 * The children of an in-process swarm with a moved clock: status names the features; grow stages a good file and moves
 * the clock adv (a number, or a function of the task), or, when adv is over its timeout, moves it the timeout and is
 * killed (exit killCode, timedOut; with killStages its good file already staged); merge logs its timeout and what it
 * saw, moves the clock mergeAdv a file (or mergeAdv(seen)), exits mergeCode, prints mergeLine (an object or a function
 * of the staged task names; by default every staged task merged).
 */
function fakeEngine(clock, { features = ['stage'], adv = 0, mergeLine = null, mergeAdv = 0, mergeCode = 0, killCode = 137, killStages = false } = {}) {
  const log = [], files = [], margs = [];
  const exec = async (script, args, o) => {
    const verb = args[0];
    const at = (n) => args[args.indexOf(n) + 1];
    if (verb === 'status') return { code: 0, stdout: JSON.stringify({ features }) + '\n', stderr: '' };
    if (verb === 'grow') {
      log.push(['grow', at('--task'), o.timeout, Number(at('--max-ms'))]);
      const ms = typeof adv === 'function' ? adv(at('--task')) : adv;
      const result = { task: at('--task'), generated: 10, kept: 1 };
      const stage = () => { if (args.includes('--stage')) fs.writeFileSync(path.join(at('--stage'), at('--task') + '.json'), JSON.stringify({ task: at('--task'), result })); };
      if (ms > o.timeout) { clock.t += o.timeout; if (killStages) stage(); return { code: killCode, stdout: '', stderr: '', timedOut: true }; }
      clock.t += ms;
      stage();
      return { code: 0, stdout: JSON.stringify(result) + '\n', stderr: '' };
    }
    log.push(['merge', o.timeout]);
    margs.push(args);
    const seen = fs.readdirSync(at('--stage')).sort().map((f) => f.replace(/\.json$/, ''));
    files.push(seen);
    clock.t += typeof mergeAdv === 'function' ? mergeAdv(seen) : mergeAdv * seen.length;
    if (mergeCode) return { code: mergeCode, stdout: '', stderr: 'merge failed: stub\n' };
    const line = typeof mergeLine === 'function' ? mergeLine(seen) : mergeLine || { merged: seen };
    return { code: 0, stdout: JSON.stringify(line) + '\n', stderr: '' };
  };
  return { exec, log, files, margs };
}

test('the clock (an injected one): a worker\'s deadline is min(240 s, the grow\'s end), its spawn told 0.6 of it (at most 60 s); a round keeps the reserve its merges need; a file\'s merge starts only over the guard and may run all that is left; at least one task runs; the rest wait', async () => {
  const tasks = ['task-a', 'task-b', 'task-c', 'task-d'];
  const root = makeRoot({ tasks });
  try {
    assert.equal(PER_TASK_CAP_MS, 240000);
    assert.equal(MIN_TASK_MS, 2000);
    assert.deepEqual([MERGE_SHARE, MERGE_FILE_MS, MERGE_GUARD_MS, MIN_FILE_MS], [0.5, 5000, 12000, 500]);
    // 100 s, one worker, 40 s a grow: four planned (reserve 12000 + 4 x 5000 = 32000 ms, under half), the grow ends at
    // 68 s; task-b is killed at its 28 s; task-a merges with 32 s left; round 2 prices a file at MIN_FILE_MS (the merge
    // took no time) and plans 2 (reserve 13000), so task-c gets the 19 s to 87 s and is killed; task-d never starts
    const c1 = { t: T0 };
    const f = fakeEngine(c1, { adv: 40000 });
    const a = await swarmGrow(root, { maxMs: 100000, workers: 1, now: () => c1.t, exec: f.exec, env: envOf() });
    assert.deepEqual(f.log, [['grow', 'task-a', 68000, 40800], ['grow', 'task-b', 28000, 16800], ['merge', 32000], ['grow', 'task-c', 19000, 11400]]);
    assert.deepEqual([a.tasks, a.queued, a.grown, a.rounds], [3, 1, 1, 2]);
    assert.deepEqual(a.refused, [
      { task: 'task-b', why: 'node grow/neo.mjs grow was killed at its deadline (28000 ms)' },
      { task: 'task-c', why: 'node grow/neo.mjs grow was killed at its deadline (19000 ms)' },
    ]);
    assert.ok(f.margs.every((x) => !x.includes('--max-ms')), 'a merge is told no --max-ms: it is never stopped between files');
    // a worker killed at its deadline is refused whatever its exit code, and a file it staged before the kill never merges
    const c0 = { t: T0 };
    const z = fakeEngine(c0, { adv: 40000, killCode: 0, killStages: true });
    const y = await swarmGrow(root, { maxMs: 100000, workers: 1, now: () => c0.t, exec: z.exec, env: envOf() });
    assert.deepEqual([y.grown, y.refused.map((x) => x.task), z.files], [1, ['task-b', 'task-c'], [['task-a']]]);
    // 1 ms: the first task still runs (2000 ms, told 1200), but its merge does not start under the guard
    const c2 = { t: T0 };
    const g = fakeEngine(c2);
    const b = await swarmGrow(root, { maxMs: 1, workers: 2, now: () => c2.t, exec: g.exec, env: envOf() });
    assert.deepEqual(g.log, [['grow', 'task-a', MIN_TASK_MS, 1200]], 'the first task runs whatever is left');
    assert.deepEqual([b.tasks, b.queued, b.rounds, b.grown], [1, 3, 1, 0]);
    assert.deepEqual(b.refused, [{ task: 'task-a', why: 'not merged: 1 ms left, under the merge guard of 12000 ms' }]);
    assert.deepEqual(b.merge, { files: 0, ms: 0, slowest: 0 });
    // an hour: every worker at its own cap; every merge may run all that is left
    const c3 = { t: T0 };
    const h = fakeEngine(c3);
    await swarmGrow(root, { maxMs: 3600000, workers: 4, now: () => c3.t, exec: h.exec, env: envOf() });
    assert.deepEqual(h.log.filter((x) => x[0] === 'grow').map((x) => [x[2], x[3]]), Array(4).fill([PER_TASK_CAP_MS, SPAWN_DEFAULT_MS]));
    assert.deepEqual(h.log.filter((x) => x[0] === 'merge'), Array(4).fill(['merge', 3600000]));
    // serial: no merge reserve, the same clock
    const c4 = { t: T0 };
    const k = fakeEngine(c4, { features: [] });
    await swarmGrow(root, { maxMs: 100000, workers: 4, now: () => c4.t, exec: k.exec, env: envOf() });
    assert.deepEqual(k.log[0], ['grow', 'task-a', 100000, 60000]);
  } finally { clean(root); }
});

test('ROUNDS: a round admits no more tasks than its merges have time for; each file merged by its own child, the fastest grown first; the next round plans with the mean a file cost; the guard rises to 1.5 times the slowest merge; a merge that fails ends the swarm', async () => {
  const tasks = ['task-a', 'task-b', 'task-c', 'task-d', 'task-e', 'task-f'];
  const root = makeRoot({ tasks });
  try {
    // the plan and the guard, as units
    assert.deepEqual(roundPlan(60000, 6, 5000, 12000), { planned: 3, reserve: 27000 }, '(30000 - 12000) / 5000 = 3 files');
    assert.deepEqual(roundPlan(60000, 2, 5000, 12000), { planned: 2, reserve: 22000 }, 'never more than remain');
    assert.deepEqual(roundPlan(1, 6, 5000, 12000), { planned: 1, reserve: 17000 }, 'at least one');
    assert.deepEqual(roundPlan(40000, 6, 1000, 2000), { planned: 6, reserve: 8000 });
    assert.deepEqual(roundPlan(60000, 0, 5000, 12000), { planned: 0, reserve: 12000 });
    assert.deepEqual([mergeGuard(0), mergeGuard(8000), mergeGuard(8001), mergeGuard(10000), mergeGuard(100, 2000), mergeGuard(3000, 2000)], [12000, 12000, 12002, 15000, 2000, 4500]);
    const small = { mergeFileMs: 3000, mergeGuardMs: 3000 };
    // 30 s, one worker, 2 s a grow, 1 s a merge: round 1 admits 4 ((15000 - 3000) / 3000; the grow ends at 15 s) and
    // merges them one child each from 8 s; 1000 ms a file then, so round 2 plans 2 with a 5000 ms reserve (grow end 25 s)
    const c1 = { t: T0 };
    const f = fakeEngine(c1, { adv: 2000, mergeAdv: 1000 });
    const a = await swarmGrow(root, { maxMs: 30000, workers: 1, now: () => c1.t, exec: f.exec, env: envOf(), ...small });
    assert.deepEqual(f.log, [
      ['grow', 'task-a', 15000, 9000], ['grow', 'task-b', 13000, 7800], ['grow', 'task-c', 11000, 6600], ['grow', 'task-d', 9000, 5400],
      ['merge', 22000], ['merge', 21000], ['merge', 20000], ['merge', 19000],
      ['grow', 'task-e', 13000, 7800], ['grow', 'task-f', 11000, 6600], ['merge', 14000], ['merge', 13000],
    ]);
    assert.deepEqual(f.files, tasks.map((t) => [t]), 'one file a merge child');
    assert.deepEqual([a.tasks, a.grown, a.rounds, a.queued, a.ms, a.refused, a.blocked, a.merge], [6, 6, 2, 0, 18000, [], [], { files: 6, ms: 6000, slowest: 1000 }]);
    // the fastest grown merges first (ties in the swarm order)
    const c5 = { t: T0 };
    const e = fakeEngine(c5, { adv: (t) => ({ 'task-a': 3000, 'task-b': 1000 })[t] ?? 2000 });
    await swarmGrow(root, { maxMs: 30000, workers: 1, now: () => c5.t, exec: e.exec, env: envOf(), ...small });
    assert.deepEqual(e.files.slice(0, 4), [['task-b'], ['task-c'], ['task-d'], ['task-a']]);
    // the guard: task-a's merge took 6 s, so no merge starts with under 9000 ms left; task-d is not merged, and no
    // further round starts (the next plan's reserve is past the time left)
    const c2 = { t: T0 };
    const g = fakeEngine(c2, { adv: 2000, mergeAdv: (seen) => ({ 'task-a': 6000, 'task-b': 4000, 'task-c': 4000 })[seen[0]] ?? 1000 });
    const b = await swarmGrow(root, { maxMs: 30000, workers: 1, now: () => c2.t, exec: g.exec, env: envOf(), ...small });
    assert.deepEqual(g.log.slice(4), [['merge', 22000], ['merge', 16000], ['merge', 12000]]);
    assert.deepEqual([b.tasks, b.grown, b.rounds, b.queued, b.ms, b.merge], [4, 3, 1, 2, 22000, { files: 3, ms: 14000, slowest: 6000 }]);
    assert.deepEqual(b.refused, [{ task: 'task-d', why: 'not merged: 8000 ms left, under the merge guard of 9000 ms' }]);
    // a merge that fails: a blocked line naming the file, every file after it not merged, no further round
    const c3 = { t: T0 };
    const h = fakeEngine(c3, { adv: 2000, mergeCode: 1 });
    const c = await swarmGrow(root, { maxMs: 30000, workers: 1, now: () => c3.t, exec: h.exec, env: envOf(), ...small });
    assert.deepEqual(h.log.map((x) => x[0]), ['grow', 'grow', 'grow', 'grow', 'merge']);
    assert.deepEqual([c.tasks, c.grown, c.rounds, c.queued], [4, 0, 1, 2]);
    assert.deepEqual(c.blocked, ['node grow/neo.mjs merge exited 1: merge failed: stub (merging task-a)']);
    const after = 'not merged: an earlier merge failed (node grow/neo.mjs merge exited 1: merge failed: stub)';
    assert.deepEqual(c.refused, [{ task: 'task-a', why: 'not merged: node grow/neo.mjs merge exited 1: merge failed: stub' }, ...['task-b', 'task-c', 'task-d'].map((task) => ({ task, why: after }))]);
    // a merge that took no time is priced at MIN_FILE_MS a file, never at zero (round 2: 3000 + 2 x 500 reserve, grow end 26 s)
    const c4 = { t: T0 };
    const m = fakeEngine(c4, { adv: 2000 });
    await swarmGrow(root, { maxMs: 30000, workers: 1, now: () => c4.t, exec: m.exec, env: envOf(), ...small });
    assert.deepEqual(m.log.slice(8), [['grow', 'task-e', 18000, 10800], ['grow', 'task-f', 16000, 9600], ['merge', 18000], ['merge', 18000]]);
  } finally { clean(root); }
});

test('a worker\'s detached child that rewrites its staged file after the verifier read it changes nothing: the merge gets the text the verifier passed', () => {
  const root = makeRoot({ tasks: ['task-a', 'task-slow'], plan: { features: ['stage'], tasks: { 'task-a': { rewrite: 400 }, 'task-slow': { sleep: 3000 } } } });
  try {
    const r = drive(root, ['grow', '--workers', '2', '--max-ms', '60000']);
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(r.json.results.map((x) => x.task), ['task-a', 'task-slow']);
    const evs = events(root);
    const rw = evs.findIndex((e) => e.verb === 'rewrite');
    const ma = evs.findIndex((e) => e.verb === 'merge' && e.files[0] === 'task-a.json');
    assert.ok(rw >= 0 && rw < ma, 'the rewrite landed before task-a was merged (a rewrite that never lands proves nothing)');
    assert.deepEqual(evs[ma].mods, ['export const id = "task-a";\n']);
  } finally { clean(root); }
});

test('the merge: one that fails is a blocked line naming its file, and every staged task is named as not merged (no merge after it); one it refuses is named; its own rows win over the staged result', () => {
  const tasks = ['task-a', 'task-b'];
  const root = makeRoot({ tasks, plan: { features: ['stage'], mergeFail: true } });
  try {
    const a = drive(root, ['grow', '--max-ms', '60000']);
    assert.equal(a.code, 0, a.stderr);
    assert.equal(a.json.blocked.length, 1);
    const hit = a.json.blocked[0].match(/^node grow\/neo\.mjs merge exited 1: merge failed: stub \(merging (task-[ab])\)$/);
    assert.ok(hit, a.json.blocked[0]);
    const other = hit[1] === 'task-a' ? 'task-b' : 'task-a';
    assert.deepEqual(a.json.refused.sort(byTask), [
      { task: hit[1], why: 'not merged: node grow/neo.mjs merge exited 1: merge failed: stub' },
      { task: other, why: 'not merged: an earlier merge failed (node grow/neo.mjs merge exited 1: merge failed: stub)' },
    ].sort(byTask));
    assert.equal(events(root).filter((e) => e.verb === 'merge').length, 1, 'no merge after one that failed');
    assert.equal(a.json.grown, 0);
    put(root, 'swarm-plan.json', JSON.stringify({ features: ['stage'], mergeRefuse: ['task-b'], mergeRows: { 'task-a': { promoted: false, generated: 77 } } }));
    const b = drive(root, ['grow', '--max-ms', '60000']);
    assert.deepEqual(b.json.refused, [{ task: 'task-b', why: 'merge: stub refused at merge' }]);
    assert.deepEqual(b.json.results.map((x) => [x.task, x.promoted, x.generated]), [['task-a', false, 77]]);
    assert.equal(b.json.cells, 77);
  } finally { clean(root); }
});

test('it never opens state/, judge/, or any neo/tasks/*/heldout.jsonl, and writes nothing under the tree itself: the stage and the checks live under the temp dir and are removed', async () => {
  const tasks = ['task-a', 'task-b'];
  const root = makeRoot({ tasks, plan: { features: ['stage'], mergeNoop: true }, era: { era: 3, eras: [], lastGrown: { 'task-a': 3 } } });
  const parent = tmp('grow-swarm-tmp-');
  const R = path.resolve(root).split(path.sep).join('/').toLowerCase();
  const bad = (p) => {
    if (typeof p !== 'string' && !(p instanceof URL) && !Buffer.isBuffer(p)) return false;
    const s = path.resolve(String(p instanceof URL ? fileURLToPath(p) : p)).split(path.sep).join('/').toLowerCase();
    if (!s.startsWith(R + '/')) return false;
    const rel = s.slice(R.length + 1);
    return rel === 'state' || rel.startsWith('state/') || rel === 'judge' || rel.startsWith('judge/') || /^neo\/tasks\/[^/]+\/heldout\.jsonl$/.test(rel);
  };
  const snap = () => {
    const out = {};
    const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else if (e.name !== 'events.log') out[path.relative(root, f)] = fs.readFileSync(f, 'utf8'); } };
    walk(root);
    return out;
  };
  const before = snap();
  const names = ['readFileSync', 'openSync', 'readdirSync', 'statSync', 'lstatSync', 'existsSync', 'createReadStream', 'readFile', 'open', 'opendirSync', 'accessSync', 'realpathSync', 'writeFileSync', 'appendFileSync', 'mkdirSync', 'rmSync'];
  const orig = {}, hits = [], writes = [];
  for (const k of names) {
    orig[k] = fs[k];
    fs[k] = Object.assign(function watched(p, ...rest) {
      if (bad(p)) hits.push(k + ' ' + String(p));
      if (['writeFileSync', 'appendFileSync', 'mkdirSync', 'rmSync'].includes(k) && typeof p === 'string' && path.resolve(p).toLowerCase().startsWith(path.resolve(root).toLowerCase() + path.sep)) writes.push(k + ' ' + p);
      return orig[k].call(this, p, ...rest);
    }, orig[k]);
  }
  syncBuiltinESMExports();
  let j, mine = 0;
  try {
    j = await swarmGrow(root, { maxMs: 60000, workers: 1, env: envOf(), tmp: parent });
    mine = hits.length;
    fs.readFileSync(path.join(root, 'judge', 'control.jsonl'), 'utf8');
  } finally {
    for (const k of names) fs[k] = orig[k];
    syncBuiltinESMExports();
  }
  try {
    assert.deepEqual(hits.slice(0, mine), [], hits.join(' | '));
    assert.ok(hits.length > mine, 'the watch itself sees a read there (a guard that never fires proves nothing)');
    assert.deepEqual(writes, []);
    assert.equal(j.grown, 2);
    assert.deepEqual(events(root).filter((e) => e.verb === 'grow' && e.phase === 'start').map((e) => e.task), ['task-b', 'task-a'], 'task-a grew in era 3, task-b never');
    assert.ok(events(root).every((e) => !e.stage || e.stage.toLowerCase().startsWith(path.resolve(parent).toLowerCase())));
    assert.deepEqual(fs.readdirSync(parent), [], 'the stage and the checks are removed');
    assert.deepEqual(snap(), before, 'nothing under the tree changed (the merge was a no-op)');
  } finally { clean(root, parent); }
});

test('usage: a bad flag, value or verb is exit 2 with one line and nothing run; --help prints the usage; a ledger that is not JSON is exit 1', () => {
  const root = makeRoot({ tasks: ['task-a'] });
  try {
    const cases = [
      [['grow', '--max-ms', '0'], /^swarm: --max-ms is an integer from 1, not 0$/],
      [['grow', '--max-ms='], /^swarm: --max-ms needs a value$/],
      [['grow', '--workers', '0'], /^swarm: --workers is an integer from 1 to 64, not 0$/],
      [['grow', '--workers', '65'], /^swarm: --workers is an integer from 1 to 64, not 65$/],
      [['grow', '--gen', '0'], /^swarm: --gen is an integer from 1, not 0$/],
      [['grow', '--era', 'x'], /^swarm: --era is an integer from 1, not x$/],
      [['grow', '--bogus', '1'], /^swarm: unknown flag --bogus \(see --help\)$/],
      [['grow', 'now'], /^swarm: unexpected argument now \(see --help\)$/],
      [['dance'], /^swarm: unknown verb dance: grow or merge \(--help\)$/],
      [['grow', '--shard', '3/3'], /^swarm: --shard is <i>\/<n> with 0 <= i < n <= 1024, not 3\/3$/],
      [['grow', '--shard', '0/0'], /^swarm: --shard is <i>\/<n> with 0 <= i < n <= 1024, not 0\/0$/],
      [['grow', '--shard', '1'], /^swarm: --shard is <i>\/<n> with 0 <= i < n <= 1024, not 1$/],
      [['grow', '--shard', '0/1025'], /^swarm: --shard is <i>\/<n> with 0 <= i < n <= 1024, not 0\/1025$/],
      [['grow', '--no-merge'], /^swarm: --no-merge needs --stage <dir> \(where the verified files wait for merge\)$/],
      [['grow', '--stage', path.join(root, '..', 'elsewhere-' + path.basename(root))], /^swarm: --stage needs --no-merge \(grow stages, then merge --stage <dir> merges\)$/],
      [['grow', '--no-merge=1', '--stage', 'x'], /^swarm: --no-merge takes no value$/],
      [['grow', '--no-merge', '--stage', path.join(root, 'neo', 'stage')], /^swarm: --stage .* is under the tree's neo\/: a stage lives outside neo\/ and grown\/$/],
      [['grow', '--no-merge', '--stage', path.join(root, 'grown')], /^swarm: --stage .* is under the tree's grown\/: a stage lives outside neo\/ and grown\/$/],
      [['merge'], /^swarm: merge needs --stage <dir>$/],
      [['merge', '--stage', path.join(root, 'no-such-stage')], /^swarm: --stage .*no-such-stage is not a directory$/],
      [['merge', '--workers', '2', '--stage', 'x'], /^swarm: --workers is not a flag of merge \(see --help\)$/],
      [['merge', '--no-merge'], /^swarm: --no-merge is not a flag of merge \(see --help\)$/],
    ];
    for (const [args, re] of cases) {
      const r = drive(root, args);
      assert.equal(r.code, 2, args.join(' ') + ': ' + r.stderr);
      assert.match(r.stderr.trim(), re);
      assert.equal(r.stderr.trim().split(/\r?\n/).length, 1);
      assert.equal(r.stdout, '');
    }
    assert.deepEqual(events(root), [], 'nothing ran');
    assert.ok(!fs.existsSync(path.join(root, 'neo', 'stage')) && !fs.existsSync(path.join(root, '..', 'elsewhere-' + path.basename(root))), 'a refused --stage is never made');
    for (const args of [['--help'], ['grow', '-h'], ['merge', '--help'], []]) {
      const h = drive(root, args);
      assert.equal(h.code, 0);
      assert.equal(h.stdout.trim(), USAGE);
    }
    put(root, 'neo/LEDGER.json', '{ not json');
    const b = drive(root, ['grow']);
    assert.equal(b.code, 1);
    assert.match(b.stderr.trim(), /^swarm: neo\/LEDGER\.json is not JSON/);
  } finally { clean(root); }
});

test('all native: grow/swarm.mjs imports node builtins, ./generation.mjs and ./era.mjs only; no network, model, eval or dynamic import in its code; no token named; no em-dash in it or this file', () => {
  const src = fs.readFileSync(SWARM, 'utf8');
  const specs = importsOf(src);
  assert.deepEqual(specs.filter((s) => !s.startsWith('node:')).sort(), ['./era.mjs', './generation.mjs']);
  assert.ok(specs.filter((s) => s.startsWith('node:')).every((s) => ['node:fs', 'node:os', 'node:path', 'node:url', 'node:crypto'].includes(s)), specs.join(' '));
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
  for (const re of [/\bfetch\s*\(/, /https?:/i, /ollama/i, /anthropic/i, /openai/i, /11434/, /\beval\s*\(/, /new\s+Function/, /\bimport\s*\(/, /\brequire\s*\(/, /net\.connect|node:https?|node:net|WebSocket/]) {
    assert.ok(!re.test(code), 'grow/swarm.mjs code matches ' + re);
  }
  for (const name of TOKEN_NAMES) assert.ok(!code.includes(name), 'grow/swarm.mjs names the token ' + name);
  for (const f of [SWARM, fileURLToPath(import.meta.url)]) assert.ok(!fs.readFileSync(f, 'utf8').includes(String.fromCharCode(0x2014)), path.basename(f) + ' holds an em-dash');
});

test('THE ENGINE\'S OWN SHAPES (grow/neo.mjs c3): a stage { kind, task, result, module: { id, source } | null } is checked by its source; the merge line { merged: [task], promoted: [id], refused: [{ file, task, why }], skipped, left } decides what landed and what was promoted; each file is merged by its own child, told no --max-ms', () => {
  const tasks = ['task-a', 'task-b', 'task-c', 'task-d', 'task-e', 'task-f', 'task-g', 'task-h'];
  const plan = {
    features: ['gate', 'stage', 'core'], mergeEngine: true, mergeNoPromote: ['task-b'], mergeRefuse: ['task-e'], mergeLeft: ['task-f'], mergeSkip: ['task-g'],
    tasks: { 'task-a': { staged: 'engine' }, 'task-b': { staged: 'engine' }, 'task-c': { staged: 'enginebad' }, 'task-d': { staged: 'enginenull' }, 'task-e': { staged: 'engine' }, 'task-f': { staged: 'engine' }, 'task-g': { staged: 'engine' }, 'task-h': { staged: 'enginenosrc' } },
  };
  const root = makeRoot({ tasks, plan });
  try {
    const r = drive(root, ['grow', '--workers', '4', '--max-ms', '60000']);
    assert.equal(r.code, 0, r.stderr);
    const j = r.json;
    assert.deepEqual(j.results.map((x) => [x.task, x.promoted, x.generated]).sort(), [['task-a', true, 100], ['task-b', false, 100], ['task-d', false, 100]]);
    assert.deepEqual([j.grown, j.promoted, j.cells], [3, 1, 300]);
    const why = Object.fromEntries(j.refused.map((x) => [x.task, x.why]));
    assert.deepEqual(Object.keys(why).sort(), ['task-c', 'task-e', 'task-f', 'task-g', 'task-h']);
    assert.match(why['task-c'], /^verifier: the staged module fails node --check: .*SyntaxError/);
    assert.equal(why['task-h'], 'verifier: the staged module is not text');
    assert.equal(why['task-e'], 'merge: stub refused task-e.json');
    assert.equal(why['task-f'], 'not merged: the merge left it');
    assert.equal(why['task-g'], 'not merged: the merge skipped it (that stage was merged before)');
    const merges = events(root).filter((e) => e.verb === 'merge');
    assert.ok(merges.every((m) => m.files.length === 1 && m.maxMs === null), JSON.stringify(merges.map((m) => [m.files, m.maxMs])));
    assert.deepEqual(merges.flatMap((m) => m.files).sort(), ['task-a.json', 'task-b.json', 'task-d.json', 'task-e.json', 'task-f.json', 'task-g.json']);
    assert.deepEqual(merges.find((m) => m.files[0] === 'task-a.json').mods, [{ id: 'task-a-neo-g4', source: 'export const id = "task-a-neo-g4";\n' }], 'the merge reads the module the verifier passed');
  } finally { clean(root); }
  // the units
  assert.deepEqual(moduleOf({ module: { id: 'x', source: 'export {};' } }), { has: true, text: 'export {};' });
  assert.deepEqual(moduleOf({ module: { id: 'x' } }), { has: true, text: null });
  assert.deepEqual(moduleOf({ module: null, result: { id: 'x' } }), { has: false, text: null });
  assert.deepEqual([taskOfEntry('task-a'), taskOfEntry('task-a.json'), taskOfEntry({ file: 'task-b.json', task: null }), taskOfEntry({ task: 'task-c' }), taskOfEntry(7)], ['task-a', 'task-a', 'task-b', 'task-c', null]);
  const v = mergeVerdict({ merged: ['t1'], promoted: ['t1-neo-g4', 3], refused: [{ file: 't2.json', task: null, why: 'no' }, { task: 't3' }], skipped: ['t4.json'], left: ['t5.json'] });
  assert.deepEqual([...v.merged], ['t1']);
  assert.deepEqual([...v.promoted], ['t1-neo-g4']);
  assert.deepEqual([...v.refused], [['t2', 'no'], ['t3', 'refused by the merge']]);
  assert.deepEqual([[...v.skipped], [...v.left]], [['t4'], ['t5']]);
  const u = mergeVerdict({ refused: [] });
  assert.deepEqual([u.merged, u.promoted], [null, null], 'a line with no merged list: every staged task it does not refuse landed');
  assert.deepEqual(mergeVerdict(null).refused.size, 0);
});

test('SHARDS (c8): the shard of a task is the first 8 hex of sha256(name) mod n, the same every call; <i>/<n> parsed; spread over 300 names every shard of 3 holds at least 60', () => {
  const h = (t) => parseInt(createHash('sha256').update(t).digest('hex').slice(0, 8), 16);
  for (const t of ['task-a', 'task-b', 'x', 'a much longer task name']) for (const n of [1, 2, 3, 7, 1024]) assert.equal(shardOf(t, n), h(t) % n);
  assert.equal(shardOf('task-a', 1), 0);
  const counts = [0, 0, 0];
  for (let k = 0; k < 300; k++) counts[shardOf('t' + k, 3)]++;
  assert.ok(counts.every((c) => c >= 60), counts.join(' '));
  assert.deepEqual([parseShard('0/1'), parseShard('2/3'), parseShard('1023/1024')], [{ i: 0, n: 1 }, { i: 2, n: 3 }, { i: 1023, n: 1024 }]);
  assert.equal(MAX_SHARDS, 1024);
  for (const bad of ['3/3', '0/0', '-1/3', '1', '1/2/3', 'a/b', '0/1025', ' 0/2']) assert.throws(() => parseShard(bad), (e) => e.code === 2, bad);
});

test('SHARDS (c8): n shards grow disjoint sets whose union is every task, each --no-merge into one --stage merging nothing; merge --stage of all of them gives grown/index.json byte for byte as one unsharded staged run, and the colonies of a normal grow', () => {
  const tasks = ['task-a', 'task-b', 'task-c', 'task-d', 'task-e', 'task-f', 'task-g'];
  const plan = { features: ['stage'], tasks: Object.fromEntries(tasks.map((t, k) => [t, { score: 0.1 * (k + 1), generated: 10 + k }])) };
  const roots = [makeRoot({ tasks, plan }), makeRoot({ tasks, plan }), makeRoot({ tasks, plan })];
  const [A, B, C] = roots;
  const SA = tmp('grow-swarm-shards-'), SB = tmp('grow-swarm-one-');
  const ix = (root) => fs.readFileSync(path.join(root, 'grown', 'index.json'), 'utf8');
  try {
    const before = ix(A);
    const seen = [];
    for (let i = 0; i < 3; i++) {
      fs.rmSync(path.join(A, 'events.log'), { force: true });
      const r = drive(A, ['grow', '--gen', '5', '--shard', i + '/3', '--stage', SA, '--no-merge', '--max-ms', '60000']);
      assert.equal(r.code, 0, r.stderr);
      const mine = tasks.filter((t) => shardOf(t, 3) === i);
      const grew = events(A).filter((e) => e.verb === 'grow' && e.phase === 'start').map((e) => e.task);
      assert.deepEqual(grew.slice().sort(), mine, 'shard ' + i + ' grows only its own tasks');
      assert.ok(mine.length > 0, 'every shard holds a task in this fixture');
      assert.deepEqual(events(A).filter((e) => e.verb === 'merge'), [], 'a --no-merge grow merges nothing');
      assert.equal(ix(A), before, 'nothing lands in the tree before the merge');
      const j = r.json;
      assert.deepEqual(j.shard, { i, n: 3, tasks: mine.length, others: tasks.length - mine.length });
      assert.deepEqual([j.grown, j.merge, j.fallback, j.stage, j.rounds], [mine.length, null, null, path.resolve(SA), 1]);
      assert.deepEqual(j.results.map((x) => x.task).sort(), mine);
      seen.push(...grew);
    }
    assert.deepEqual(seen.slice().sort(), tasks, 'the union is every task, none twice');
    assert.equal(new Set(seen).size, seen.length);
    assert.deepEqual(fs.readdirSync(SA).sort(), tasks.map((t) => t + '.json'), 'only the verified files, whole (no temporary name left)');
    const m = drive(A, ['merge', '--stage', SA, '--max-ms', '60000']);
    assert.equal(m.code, 0, m.stderr);
    assert.deepEqual(Object.keys(m.json), ['stage', 'files', 'grown', 'cells', 'kept', 'mastered', 'promoted', 'ms', 'merge', 'left', 'refused', 'results', 'blocked']);
    assert.deepEqual([m.json.files, m.json.grown, m.json.cells, m.json.merge.files, m.json.left, m.json.refused, m.json.blocked], [7, 7, 7 * 10 + 21, 7, [], [], []]);
    assert.ok(events(A).filter((e) => e.verb === 'merge').every((e) => e.files.length === 1), 'one child a file');
    assert.deepEqual(fs.readdirSync(SA), [], 'a merged file leaves the stage');
    // one unsharded staged run
    const g = drive(B, ['grow', '--gen', '5', '--stage', SB, '--no-merge', '--max-ms', '60000']);
    assert.equal(g.code, 0, g.stderr);
    assert.equal(g.json.shard, null);
    assert.equal(drive(B, ['merge', '--stage', SB, '--max-ms', '60000']).code, 0);
    assert.equal(ix(A), ix(B), 'a merge of all the shards is one unsharded run');
    // a normal grow lands the same colonies
    assert.equal(drive(C, ['grow', '--gen', '5', '--max-ms', '60000']).code, 0);
    const cells = (root) => JSON.parse(ix(root)).cells.slice().sort(byTask);
    assert.deepEqual(cells(A), cells(C));
    assert.equal(cells(A).length, 7);
  } finally { clean(...roots, SA, SB); }
});

test('a --no-merge grow: the verifier refuses a bad file before it reaches the --stage directory; an engine without "stage" grows nothing there and nothing in the tree ("fallback":"none")', () => {
  const tasks = ['task-a', 'task-b'];
  const root = makeRoot({ tasks, plan: { features: ['stage'], tasks: { 'task-b': { staged: 'badjson' } } } });
  const S = tmp('grow-swarm-nm-');
  try {
    const r = drive(root, ['grow', '--gen', '5', '--stage', S, '--no-merge', '--max-ms', '60000']);
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(fs.readdirSync(S), ['task-a.json']);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(S, 'task-a.json'), 'utf8')).task, 'task-a');
    assert.deepEqual(r.json.refused.map((x) => x.task), ['task-b']);
    assert.match(r.json.refused[0].why, /^verifier: the staged file is not JSON/);
    fs.rmSync(path.join(S, 'task-a.json'));
    put(root, 'swarm-plan.json', JSON.stringify({ features: ['gate'] }));
    fs.rmSync(path.join(root, 'events.log'), { force: true });
    const before = fs.readFileSync(path.join(root, 'grown', 'index.json'), 'utf8');
    const n = drive(root, ['grow', '--stage', S, '--no-merge', '--max-ms', '60000']);
    assert.equal(n.code, 0, n.stderr);
    assert.deepEqual([n.json.tasks, n.json.grown, n.json.workers, n.json.fallback, n.json.queued], [0, 0, 0, 'none', 2]);
    assert.deepEqual(n.json.blocked, ['node grow/neo.mjs status features lack "stage": a --no-merge grow stages nothing (it never grows into the tree)']);
    assert.deepEqual(events(root).map((e) => e.verb), ['status']);
    assert.equal(fs.readFileSync(path.join(root, 'grown', 'index.json'), 'utf8'), before);
    assert.deepEqual(fs.readdirSync(S), []);
  } finally { clean(root, S); }
});

test('merge --stage: in the swarm order at merge time; each file verified again; a file merged, refused or skipped leaves the stage; one the merge left, one naming no ledger task, one under the guard or after a failed merge stays; an engine without "stage" merges nothing', () => {
  const tasks = ['task-a', 'task-b', 'task-c', 'task-d', 'task-e'];
  const root = makeRoot({ tasks, plan: { features: ['stage'], mergeEngine: true, mergeLeft: ['task-c'], mergeRefuse: ['task-d'], mergeSkip: ['task-e'] }, era: { era: 5, eras: [], lastGrown: { 'task-a': 5 } } });
  const S = tmp('grow-swarm-merge-');
  const doc = (t) => JSON.stringify({ task: t, result: { task: t, generation: 6, generated: 10, kept: 1, heldout: { ok: 5, n: 10, score: 0.5 } }, module: { id: t + '-neo-g6', source: 'export const id = ' + JSON.stringify(t) + ';\n' } });
  const stageAll = () => { for (const t of ['task-a', 'task-c', 'task-d', 'task-e']) put(S, t + '.json', doc(t)); put(S, 'task-b.json', '{ "task": '); put(S, 'stray.json', doc('stray')); };
  const merges = () => events(root).filter((e) => e.verb === 'merge').flatMap((e) => e.files);
  try {
    stageAll();
    const r = drive(root, ['merge', '--stage', S, '--max-ms', '60000']);
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(merges(), ['task-c.json', 'task-d.json', 'task-e.json', 'task-a.json'], 'the swarm order: task-a grew in era 5, the rest never');
    assert.deepEqual(r.json.results.map((x) => [x.task, x.promoted, x.generated]), [['task-a', true, 10]]);
    const why = Object.fromEntries(r.json.refused.map((x) => [x.task, x.why]));
    assert.deepEqual(why, {
      stray: 'the ledger holds no task "stray": not merged (left in the stage)',
      'task-b': why['task-b'],
      'task-c': 'not merged: the merge left it (left in the stage)',
      'task-d': 'merge: stub refused task-d.json',
      'task-e': 'not merged: the merge skipped it (that stage was merged before)',
    });
    assert.match(why['task-b'], /^verifier: the staged file is not JSON/);
    assert.deepEqual(r.json.left, ['stray', 'task-c']);
    assert.deepEqual(fs.readdirSync(S).sort(), ['stray.json', 'task-c.json']);
    assert.deepEqual([r.json.files, r.json.grown, r.json.promoted, r.json.merge.files], [6, 1, 1, 4]);
    // the guard: no merge starts under it, every file stays
    fs.rmSync(path.join(root, 'events.log'), { force: true });
    stageAll();
    const g = drive(root, ['merge', '--stage', S, '--max-ms', '5000']);
    assert.equal(g.code, 0, g.stderr);
    assert.deepEqual(merges(), []);
    assert.deepEqual(g.json.left, ['stray', 'task-a', 'task-b', 'task-c', 'task-d', 'task-e']);
    assert.ok(g.json.refused.filter((x) => x.task !== 'stray').every((x) => /^not merged: \d+ ms left, under the merge guard of 12000 ms \(left in the stage\)$/.test(x.why)), JSON.stringify(g.json.refused));
    assert.equal(fs.readdirSync(S).length, 6);
    // a merge that fails: named, it stays, and nothing after it merges
    put(root, 'swarm-plan.json', JSON.stringify({ features: ['stage'], mergeFail: true }));
    fs.rmSync(path.join(S, 'task-b.json'));
    fs.rmSync(path.join(root, 'events.log'), { force: true });
    const f = drive(root, ['merge', '--stage', S, '--max-ms', '60000']);
    assert.equal(f.code, 0, f.stderr);
    assert.deepEqual(merges(), ['task-c.json']);
    assert.equal(f.json.blocked.length, 1);
    assert.match(f.json.blocked[0], /^node grow\/neo\.mjs merge exited 1: .*merge failed: stub.* \(merging task-c\)$/);
    assert.deepEqual(f.json.left, ['stray', 'task-a', 'task-c', 'task-d', 'task-e']);
    assert.ok(['task-a', 'task-d', 'task-e'].every((t) => f.json.refused.find((x) => x.task === t).why.startsWith('not merged: an earlier merge failed')));
    // an engine without "stage": nothing merged, every file stays
    put(root, 'swarm-plan.json', JSON.stringify({ features: ['gate'] }));
    fs.rmSync(path.join(root, 'events.log'), { force: true });
    const n = drive(root, ['merge', '--stage', S]);
    assert.equal(n.code, 0, n.stderr);
    assert.deepEqual(events(root).map((e) => e.verb), ['status']);
    assert.deepEqual(n.json.blocked, ['node grow/neo.mjs status features lack "stage": nothing merged (contract c3)']);
    assert.deepEqual(n.json.left, ['stray', 'task-a', 'task-c', 'task-d', 'task-e']);
    assert.equal(fs.readdirSync(S).length, 5);
  } finally { clean(root, S); }
});

test('STALE: a task grown ' + STALE_AFTER + ' times without a gain on the same inputs is skipped and named; once less, or after its inputs change, it grows', () => {
  const tasks = ['task-a', 'task-b'];
  const root = makeRoot({ tasks, plan: { features: ['stage'] } });
  try {
    const era = (n) => ({ era: 2, eras: [], lastGrown: {}, stale: { 'task-a': { sig: taskSig(root, 'task-a'), n, era: 2 } } });
    put(root, 'neo/ERA.json', JSON.stringify(era(STALE_AFTER)));
    const grew = () => events(root).filter((e) => e.verb === 'grow' && e.phase === 'start').map((e) => e.task).sort();
    const r = drive(root, ['grow', '--max-ms', '60000']);
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual([grew(), r.json.stale, r.json.tasks], [['task-b'], ['task-a'], 1]);
    fs.rmSync(path.join(root, 'events.log'));
    put(root, 'neo/ERA.json', JSON.stringify(era(STALE_AFTER - 1)));
    const once = drive(root, ['grow', '--max-ms', '60000']);
    assert.deepEqual([grew(), once.json.stale], [tasks, []]);
    fs.rmSync(path.join(root, 'events.log'));
    put(root, 'neo/ERA.json', JSON.stringify(era(STALE_AFTER)));
    put(root, 'neo/GENOME.json', JSON.stringify({ v: 2 }));
    const changed = drive(root, ['grow', '--max-ms', '60000']);
    assert.deepEqual([grew(), changed.json.stale], [tasks, []], 'a new genome is a new input');
    fs.rmSync(path.join(root, 'events.log'));
    put(root, 'neo/ERA.json', '{ not json');
    const broken = drive(root, ['grow', '--max-ms', '60000']);
    assert.equal(broken.code, 0, broken.stderr);
    assert.deepEqual([grew(), broken.json.stale], [tasks, []]);
    assert.ok(broken.json.blocked.some((b) => /^neo\/ERA\.json: .* \(ledger order, no task skipped as stale\)$/.test(b)), JSON.stringify(broken.json.blocked));
  } finally { clean(root); }
});

test('stageDirOf: a stage under the tree\'s neo/ or grown/ is refused; outside it is made (or must exist, for a merge)', () => {
  const root = tmp('grow-swarm-sd-');
  try {
    for (const rel of ['neo', 'grown', 'neo/x', 'grown/a/b']) assert.throws(() => stageDirOf(root, path.join(root, rel)), (e) => e.code === 2, rel);
    const ok = path.join(root, 'stage-here');
    assert.equal(stageDirOf(root, ok), path.resolve(ok));
    assert.ok(fs.statSync(ok).isDirectory());
    assert.equal(stageDirOf(root, path.join(root, 'neon')), path.resolve(root, 'neon'), 'a sibling that only starts with neo is not under neo/');
    assert.throws(() => stageDirOf(root, path.join(root, 'absent'), false), (e) => e.code === 2);
    assert.ok(!fs.existsSync(path.join(root, 'absent')));
  } finally { clean(root); }
});
