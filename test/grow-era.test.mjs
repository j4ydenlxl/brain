// test/grow-era.test.mjs: THE ERA (grow/era.mjs; grow/NEO.md, "Order 7: always burning", ERA) against a stub tree.
// Every test builds a temporary root: STUB children for grow/absorb.mjs, grow/teach.mjs, grow/neo.mjs and
// grow/measure.mjs (the other parts of the board; the pattern of test/grow-generation.test.mjs: PRELUDE, STUBS,
// calls.log) that log each call and print the line their contract names, a ledger, grown/index.json, and sentinel files
// where no era may look (state/, judge/heldout/, judge/control.jsonl, neo/tasks/*/heldout.jsonl). The era runs with
// --root <tmp> (the CLI) or in process with an injected clock, children runner and process list, so nothing here reaches
// the network, a model, a token, the real grown/ or the tree's git (the commit tests make their own repository and bare
// remote under a temporary directory, with a hermetic git config). Every temporary directory is removed.
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
  runEras, ship, status, readEra, growOrder, colonies, lockState, takeLock, releaseLock, finishesInFlight, commitMessage,
  allowedHere, isIdle, KEEP, STALE_MS, LOCK, ERA_FILE, SHIP_PATHS, PC_REFUSAL, USAGE,
} from '../grow/era.mjs';
import { CLOUD_ENV, TOKEN_NAMES, TRAILER, runNode } from '../grow/generation.mjs';
import { CLOUD_ENV as SANDBOX_CLOUD_ENV } from '../grow/sandbox.mjs';
import { importsOf } from '../grow/contract.mjs';

const BRAIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ERA = path.join(BRAIN, 'grow', 'era.mjs');
const T0 = Date.parse('2026-10-01T12:00:00.000Z');

const PRELUDE = `import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const log = (name) => fs.appendFileSync(path.join(ROOT, 'calls.log'), JSON.stringify([name, ...process.argv.slice(2)]) + '\\n');
const arg = (n) => { const a = process.argv.slice(2), i = a.indexOf(n); return i >= 0 ? a[i + 1] : null; };
const readJ = (rel, dflt) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); } catch { return dflt; } };
const writeJ = (rel, o) => { const f = path.join(ROOT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\\n'); };
`;
const STUBS = {
  // ABSORB: the line of NEO.md (one progress line first: the era reads the LAST JSON line)
  'grow/absorb.mjs': `log('absorb');
if (process.env.STUB_ABSORB_FAIL) { console.error('absorb failed: stub'); process.exit(1); }
const rows = Number(process.env.STUB_ABSORB_ROWS ?? 60);
console.log('absorbing: a progress line');
console.log(JSON.stringify({ generation: Number(arg('--gen')), sources: 4, fetched: 3, bytes: rows ? 4096 : 0, tasks: rows ? 2 : 0, rows, ms: 7, bytesPerSecond: 585142, blocked: process.env.STUB_ABSORB_BLOCKED ? ['src-9: fetch failed: stub'] : [], cursor: 4 }));`,
  // OPEN: intake opens the names in open.json (once), appending the ledger as the real intake does
  'grow/teach.mjs': `log('teach');
if (process.env.STUB_OPEN_FAIL) { console.error('intake failed: stub'); process.exit(1); }
const names = readJ('open.json', []);
writeJ('open.json', []);
const led = readJ('neo/LEDGER.json', { tasks: [], generated: 0 });
for (const t of names) led.tasks.push({ task: t, generation: Number(arg('--gen')), devSha: 'd', heldoutSha: 'h', dev: 20, heldout: 10, by: 'stub', at: '2026-10-01T00:00:00.000Z' });
writeJ('neo/LEDGER.json', led);
console.log(JSON.stringify({ generation: Number(arg('--gen')), opened: names, refused: [], already: 0, syllabus: 9, added: 0, baseline: 'nothing to ask', at: '2026-10-01T00:00:00.000Z' }));`,
  // GROW: neo-plan.json says per task { fail } or { score }; a grown colony is promoted into grown/index.json (tier neo)
  'grow/neo.mjs': `log('neo');
const task = arg('--task'), g = Number(arg('--gen'));
const plan = readJ('neo-plan.json', {})[task] || {};
if (plan.fail) { console.error('neo grow failed: stub ' + task); process.exit(1); }
const score = plan.score ?? 0.5;
const ix = readJ('grown/index.json', { generation: 0, cells: [] });
ix.cells = ix.cells.filter((c) => !(c.tier === 'neo' && c.class === task));
ix.cells.push({ id: task + '-neo-g' + g, class: task, generation: g, lane: 'neo', tier: 'neo', heldout: { score, n: 10, ok: Math.round(score * 10) }, cells: 10 });
writeJ('grown/index.json', ix);
console.log(JSON.stringify({ task, generated: 1000, kept: 10, cells: 10, heldout: { ok: Math.round(score * 10), n: 10, score }, baseline: { ok: 0, n: 10, score: 0 }, promoted: true, why: [], ms: 3 }));`,
  // MEASURE: appends its row to grown/measure.jsonl and prints it
  'grow/measure.mjs': `log('measure');
if (process.env.STUB_MEASURE_FAIL) { console.error('measure failed: stub'); process.exit(1); }
const neo = readJ('grown/index.json', { cells: [] }).cells.filter((c) => c.tier === 'neo');
const row = { at: '2026-10-01T00:00:00.000Z', era: Number(arg('--era')), generation: null, locked: null, neo: { tasks: readJ('neo/LEDGER.json', { tasks: [] }).tasks.length, colonies: neo.length, cells: neo.reduce((s, c) => s + c.cells, 0), mastered: neo.filter((c) => c.heldout.score === 1).length, heldout: null }, generated: 0, absorbed: null, syllabus: null, ladder: null, ms: 1 };
fs.appendFileSync(path.join(ROOT, 'grown/measure.jsonl'), JSON.stringify(row) + '\\n');
console.log(JSON.stringify(row));`,
};
/** Where no era may look: each holds a sentinel. */
const FORBIDDEN_FILES = ['state/SENTINEL.json', 'judge/heldout/fragment.jsonl', 'judge/control.jsonl', 'neo/tasks/alpha/heldout.jsonl'];

const put = (root, rel, text) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); return f; };
const TEMPS = new Set();
process.on('exit', () => { for (const d of TEMPS) { try { fs.rmSync(d, { recursive: true, force: true }); } catch { /* best effort */ } } });
const tmp = (prefix) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), prefix)); TEMPS.add(d); return d; };
const clean = (d) => { fs.rmSync(d, { recursive: true, force: true }); TEMPS.delete(d); };
const ledgerRow = (task) => ({ task, generation: 3, devSha: 'd', heldoutSha: 'h', dev: 20, heldout: 10, by: 'stub', at: '2026-10-01T00:00:00.000Z' });
const neoRow = (task, score) => ({ id: task + '-neo-g3', class: task, generation: 3, lane: 'neo', tier: 'neo', heldout: { score, n: 10, ok: Math.round(score * 10) }, cells: 10 });
/** A hand-grown locked-class cell: held-out score 1 but no tier, so never a task's colony. */
const HAND = { id: 'capital-of-direct-g1', class: 'capital-of', generation: 1, lane: 'direct', file: 'cells/capital-of-direct-g1.mjs', heldout: { score: 1, n: 14 } };

/** A fresh stub tree: grown/index.json at generation 3 (so g is 4), the ledger, the names intake opens, the grow plan. */
function makeRoot({ ledger = [], open = ['alpha', 'beta'], plan = {}, cells = [], era = null } = {}) {
  const root = tmp('grow-era-');
  for (const [rel, body] of Object.entries(STUBS)) put(root, rel, PRELUDE + body + '\n');
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
  const r = spawnSync(process.execPath, [ERA, ...args, '--root', root], { cwd: root, env: envOf(extra), encoding: 'utf8', timeout: 180000, windowsHide: true });
  const lines = String(r.stdout || '').trim().split(/\r?\n/).filter(Boolean);
  let json = null;
  try { json = JSON.parse(lines[lines.length - 1]); } catch { json = null; }
  return { code: r.status, json, lines, stdout: r.stdout || '', stderr: r.stderr || '' };
}
const calls = (root) => { try { return fs.readFileSync(path.join(root, 'calls.log'), 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } };
/** Each call as one string, without its trailing --root <root> (asserted whole in the first test). */
const seq = (root) => calls(root).map((c) => { const a = c.slice(1); const i = a.indexOf('--root'); return [c[0], ...(i >= 0 ? a.slice(0, i) : a)].join(' '); });
const reset = (root) => fs.rmSync(path.join(root, 'calls.log'), { force: true });
const eraDoc = (root) => JSON.parse(fs.readFileSync(path.join(root, ERA_FILE), 'utf8'));
/** An injected clock: every child moves it stepMs; the children are the real stub processes. */
function clocked(root, stepMs = 10000, start = T0) {
  let t = start;
  return { now: () => t, exec: (script, args, o) => { t += stepMs; return runNode(root, script, args, o); }, set: (v) => { t = v; } };
}
/** runEras in this process on a cloud VM (CI set) with no process seen; o on top. */
const inproc = (root, o = {}) => runEras(root, { env: envOf({ CI: '1' }), procs: () => [], ...o });

test('one era: ABSORB, OPEN, GROW every ledger task, MEASURE, in that order, each a child of the tree with --root; one JSON line; neo/ERA.json; the lock released', () => {
  const root = makeRoot();
  try {
    const r = drive(root, ['run', '--max-eras', '1'], { CI: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.lines.length, 1, 'one line: ' + r.stdout);
    const R = path.resolve(root);
    assert.deepEqual(calls(root), [
      ['absorb', 'pull', '--gen', '4', '--root', R],
      ['teach', 'intake', '--gen', '4', '--root', R],
      ['neo', 'grow', '--task', 'alpha', '--gen', '4', '--root', R],
      ['neo', 'grow', '--task', 'beta', '--gen', '4', '--root', R],
      ['measure', 'run', '--era', '1', '--root', R],
    ]);
    const j = r.json;
    assert.deepEqual(Object.keys(j).sort(), ['absorbed', 'blocked', 'cells', 'committed', 'era', 'eras', 'grown', 'lock', 'mastered', 'ms', 'opened', 'pushed', 'stop'].sort());
    assert.equal(j.eras, 1);
    assert.equal(j.era, 1);
    assert.deepEqual(j.absorbed, { bytes: 4096, tasks: 2, rows: 60 });
    assert.equal(j.opened, 2);
    assert.equal(j.grown, 2);
    assert.equal(j.cells, 20);
    assert.equal(j.mastered, 0);
    assert.equal(j.committed, 'skipped (no --commit)');
    assert.equal(j.pushed, 'skipped (no --commit)');
    assert.deepEqual(j.blocked, []);
    assert.equal(j.stop, 'max-eras');
    assert.equal(j.lock, 'taken');
    assert.ok(Number.isInteger(j.ms) && j.ms >= 0);
    const doc = eraDoc(root);
    assert.equal(doc.era, 1);
    assert.equal(doc.eras.length, 1);
    const row = doc.eras[0];
    assert.deepEqual(Object.keys(row), ['era', 'at', 'ms', 'absorbed', 'opened', 'grown', 'cells', 'mastered', 'blocked']);
    assert.deepEqual(row.opened, ['alpha', 'beta']);
    assert.deepEqual(row.grown[0], { task: 'alpha', generated: 1000, kept: 10, promoted: true, heldout: { ok: 5, n: 10, score: 0.5 }, baseline: { ok: 0, n: 10, score: 0 } });
    assert.deepEqual(row.grown.map((x) => x.task), ['alpha', 'beta']);
    assert.deepEqual(doc.lastGrown, { alpha: 1, beta: 1 });
    assert.ok(!fs.existsSync(path.join(root, LOCK)), 'the lock is gone after the run');
  } finally { clean(root); }
});

test('the time budget (an injected clock): GROW stops at the era\'s share, MEASURE still runs, no era starts past the share, ms is the clock\'s', () => {
  const tasks = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta'];
  const root = makeRoot({ open: tasks });
  try {
    // 100000 ms: MEASURE and SHIP keep min(60000, 100000 / 4) = 25000, so GROW starts no task (but the first) from t0 + 75000
    const c = clocked(root);
    const j = inproc(root, { maxMs: 100000, now: c.now, exec: c.exec });
    // absorb 10k, intake 20k, alpha 30k, beta 40k, gamma 50k, delta 60k, epsilon 70k, zeta 80k: eta would start at 80k >= 75k
    assert.deepEqual(seq(root), ['absorb pull --gen 4', 'teach intake --gen 4', ...tasks.slice(0, 6).map((t) => 'neo grow --task ' + t + ' --gen 4'), 'measure run --era 1']);
    assert.equal(j.eras, 1, 'era 2 would start at 90k, past the share');
    assert.equal(j.stop, 'budget');
    assert.equal(j.grown, 6);
    assert.equal(j.ms, 90000);
    const row = eraDoc(root).eras[0];
    assert.equal(row.ms, 90000);
    assert.equal(row.at, '2026-10-01T12:00:00.000Z');
    // the next run starts with the two left out: never grown is least recently grown
    reset(root);
    const c2 = clocked(root);
    const j2 = inproc(root, { maxMs: 100000, now: c2.now, exec: c2.exec });
    assert.deepEqual(seq(root).filter((s) => s.startsWith('neo')).map((s) => s.split(' ')[3]), ['eta', 'theta', 'alpha', 'beta', 'gamma', 'delta']);
    assert.equal(j2.era, 2);
    assert.deepEqual(eraDoc(root).lastGrown, { alpha: 2, beta: 2, gamma: 2, delta: 2, epsilon: 1, zeta: 1, eta: 2, theta: 2 });
  } finally { clean(root); }
});

test('at least one task an era: with the share already spent the first task still grows, the second does not', () => {
  const root = makeRoot();
  try {
    const c = clocked(root);
    const j = inproc(root, { maxMs: 1000, now: c.now, exec: c.exec });
    assert.deepEqual(seq(root), ['absorb pull --gen 4', 'teach intake --gen 4', 'neo grow --task alpha --gen 4', 'measure run --era 1']);
    assert.equal(j.grown, 1);
    assert.equal(j.eras, 1);
    assert.equal(j.stop, 'budget');
    assert.deepEqual(eraDoc(root).lastGrown, { alpha: 1 });
  } finally { clean(root); }
});

test('the least recently grown first: never grown before all, then the oldest era, ties in ledger order; neo/ERA.json remembers across runs', () => {
  assert.deepEqual(growOrder(['a1x', 'b2x', 'c3x', 'd4x'], { a1x: 7, b2x: 3, d4x: 3 }), ['c3x', 'b2x', 'd4x', 'a1x']);
  assert.deepEqual(growOrder(['zed', 'abc'], {}), ['zed', 'abc'], 'ties keep the ledger order, not the name order');
  assert.deepEqual(growOrder(['abc'], { abc: 'x' }), ['abc']);
  const root = makeRoot({ ledger: ['alpha', 'beta', 'gamma'], open: [], era: { era: 7, eras: [], lastGrown: { alpha: 7, beta: 3 } } });
  try {
    const r = drive(root, ['run', '--max-eras', '1'], { CI: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(seq(root).filter((s) => s.startsWith('neo')), ['neo grow --task gamma --gen 4', 'neo grow --task beta --gen 4', 'neo grow --task alpha --gen 4']);
    assert.equal(r.json.era, 8);
    assert.deepEqual(eraDoc(root).lastGrown, { alpha: 8, beta: 8, gamma: 8 });
  } finally { clean(root); }
});

test('a task whose colony already scores 1 on its held-out rows is skipped; a hand-grown cell is no colony; mastered counts the colonies at 1', () => {
  const root = makeRoot({ ledger: ['alpha', 'beta', 'gamma'], open: [], cells: [HAND, neoRow('beta', 1), neoRow('gamma', 0.9)] });
  try {
    const cols = colonies(root);
    assert.deepEqual([...cols.keys()], ['beta', 'gamma']);
    const r = drive(root, ['run', '--max-eras', '1'], { CI: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(seq(root).filter((s) => s.startsWith('neo')), ['neo grow --task alpha --gen 4', 'neo grow --task gamma --gen 4']);
    assert.equal(r.json.mastered, 1);
    assert.ok(!('beta' in eraDoc(root).lastGrown), 'a skipped task is not marked grown');
    // gamma reaches 1 this era (the stub grows it to the plan's score): the next era skips it too
    fs.writeFileSync(path.join(root, 'neo-plan.json'), JSON.stringify({ gamma: { score: 1 } }));
    reset(root);
    const r2 = drive(root, ['run', '--max-eras', '2'], { CI: '1' });
    assert.equal(r2.code, 0, r2.stderr);
    assert.deepEqual(seq(root).filter((s) => s.startsWith('neo')), ['neo grow --task alpha --gen 4', 'neo grow --task gamma --gen 4', 'neo grow --task alpha --gen 4']);
    assert.equal(r2.json.mastered, 2);
    // an index that is not JSON: unknown, so nothing is skipped and mastered is null (not 0)
    fs.writeFileSync(path.join(root, 'grown/index.json'), '{ not json');
    assert.equal(colonies(root), null);
    fs.rmSync(path.join(root, 'grown/index.json'));
    assert.deepEqual([...colonies(root)], [], 'no index: no colony');
  } finally { clean(root); }
});

test('a failing child is a blocked line and the era goes on: every later step still runs; a failed step is null, never a zero', () => {
  const root = makeRoot({ plan: { alpha: { fail: true } } });
  try {
    const r = drive(root, ['run', '--max-eras', '1'], { CI: '1', STUB_ABSORB_FAIL: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(seq(root), ['absorb pull --gen 4', 'teach intake --gen 4', 'neo grow --task alpha --gen 4', 'neo grow --task beta --gen 4', 'measure run --era 1']);
    assert.deepEqual(r.json.blocked, [
      'era 1: absorb: node grow/absorb.mjs pull exited 1: absorb failed: stub',
      'era 1: grow: alpha: node grow/neo.mjs grow exited 1: neo grow failed: stub alpha',
    ]);
    assert.equal(r.json.absorbed, null);
    assert.equal(r.json.grown, 1);
    const row = eraDoc(root).eras[0];
    assert.equal(row.absorbed, null);
    assert.deepEqual(row.grown.map((g) => g.task), ['beta']);
    assert.equal(row.blocked.length, 2);
    assert.deepEqual(eraDoc(root).lastGrown, { alpha: 1, beta: 1 }, 'a task tried counts as grown: a broken one never starves the ring');
    // intake and measure fail: opened and cells are null; absorb's own blocked sources are the era's blocked lines
    reset(root);
    const r2 = drive(root, ['run', '--max-eras', '1'], { CI: '1', STUB_OPEN_FAIL: '1', STUB_MEASURE_FAIL: '1', STUB_ABSORB_BLOCKED: '1' });
    assert.equal(r2.code, 0, r2.stderr);
    assert.deepEqual(seq(root), ['absorb pull --gen 4', 'teach intake --gen 4', 'neo grow --task alpha --gen 4', 'neo grow --task beta --gen 4', 'measure run --era 2']);
    assert.deepEqual(r2.json.blocked, [
      'era 2: absorb: src-9: fetch failed: stub',
      'era 2: open: node grow/teach.mjs intake exited 1: intake failed: stub',
      'era 2: grow: alpha: node grow/neo.mjs grow exited 1: neo grow failed: stub alpha',
      'era 2: measure: node grow/measure.mjs run exited 1: measure failed: stub',
    ]);
    assert.equal(r2.json.opened, null);
    assert.equal(r2.json.cells, null);
    assert.deepEqual(r2.json.absorbed, { bytes: 4096, tasks: 2, rows: 60 });
    // a child not on disk (another board has not landed it yet): a blocked line, the rest still runs
    fs.rmSync(path.join(root, 'grow/absorb.mjs'));
    fs.writeFileSync(path.join(root, 'grow/measure.mjs'), PRELUDE + "log('measure');\nconsole.log('measured, but no JSON line');\n");
    reset(root);
    const r3 = drive(root, ['run', '--max-eras', '1'], { CI: '1' });
    assert.equal(r3.code, 0, r3.stderr);
    assert.deepEqual(seq(root), ['teach intake --gen 4', 'neo grow --task alpha --gen 4', 'neo grow --task beta --gen 4', 'measure run --era 3']);
    assert.ok(r3.json.blocked.includes('era 3: absorb: grow/absorb.mjs is not on disk'), r3.json.blocked.join(' | '));
    assert.ok(r3.json.blocked.includes('era 3: measure: node grow/measure.mjs run printed no JSON line'), r3.json.blocked.join(' | '));
  } finally { clean(root); }
});

test('the lock work/grow/era.lock: a held one refuses (exit 1) and nothing runs; a stale one (over 30 minutes) is replaced and named; a lock that is not JSON ages by its mtime', () => {
  const root = makeRoot();
  try {
    assert.equal(STALE_MS, 30 * 60000);
    const lockFile = path.join(root, LOCK);
    const held = JSON.stringify({ pid: 99999, at: new Date(Date.now() - 29 * 60000).toISOString(), token: 'other' }) + '\n';
    put(root, LOCK, held);
    const r = drive(root, ['run', '--max-eras', '1'], { CI: '1' });
    assert.equal(r.code, 1);
    assert.match(r.stderr, /^era: work\/grow\/era\.lock is held by pid 99999 since /);
    assert.equal(r.stdout, '');
    assert.deepEqual(calls(root), [], 'nothing ran');
    assert.ok(!fs.existsSync(path.join(root, ERA_FILE)), 'nothing written');
    assert.equal(fs.readFileSync(lockFile, 'utf8'), held, 'the other run\'s lock is untouched');
    // 31 minutes old: stale, replaced, named in the line, removed at the end
    const staleAt = new Date(Date.now() - 31 * 60000).toISOString();
    put(root, LOCK, JSON.stringify({ pid: 99999, at: staleAt, token: 'other' }) + '\n');
    const s = drive(root, ['run', '--max-eras', '1'], { CI: '1' });
    assert.equal(s.code, 0, s.stderr);
    assert.equal(s.json.lock, 'took over a stale lock (pid 99999, ' + staleAt + ')');
    assert.ok(!fs.existsSync(lockFile));
    // not JSON: its mtime is its time
    put(root, LOCK, 'garbage');
    assert.equal(lockState(root).state, 'held');
    reset(root);
    assert.equal(drive(root, ['run', '--max-eras', '1'], { CI: '1' }).code, 1);
    assert.deepEqual(calls(root), []);
    const old = new Date(Date.now() - 31 * 60000);
    fs.utimesSync(lockFile, old, old);
    assert.equal(lockState(root).state, 'stale');
    assert.equal(drive(root, ['run', '--max-eras', '1'], { CI: '1' }).code, 0);
    assert.equal(lockState(root).state, 'free');
  } finally { clean(root); }
});

test('the lock is ours while the era runs, its time is renewed at every era, and only our own lock is removed', () => {
  const root = makeRoot();
  try {
    const seen = [];
    const c = clocked(root, 1000);
    const exec = (script, args, o) => { if (script === 'grow/absorb.mjs') seen.push(lockState(root, c.now())); return c.exec(script, args, o); };
    const j = inproc(root, { maxMs: 10 * 60000, maxEras: 2, now: c.now, exec, pid: 4242 });
    assert.equal(j.eras, 2);
    assert.deepEqual(seen.map((s) => [s.state, s.pid]), [['held', 4242], ['held', 4242]]);
    assert.equal(seen[0].at, '2026-10-01T12:00:00.000Z');
    assert.equal(seen[1].at, new Date(T0 + 5000).toISOString(), 'era 2 renews the time (five children of era 1 ran)');
    assert.ok(!fs.existsSync(path.join(root, LOCK)));
    // another run's lock that replaced ours is not removed by our release
    const mine = takeLock(root, { now: () => Date.now(), pid: 1 });
    put(root, LOCK, JSON.stringify({ pid: 2, at: new Date().toISOString(), token: 'theirs' }) + '\n');
    releaseLock(root, mine);
    assert.equal(lockState(root).pid, 2);
  } finally { clean(root); }
});

test('refused on a PC exactly as grow/sandbox.mjs --backend here: exit 4 with the reason, nothing run or written, both backends; any one of the four cloud names allows it', () => {
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
    assert.throws(() => runEras(root, { env: envOf(), procs: () => [] }), (e) => e.code === 4);
    assert.equal(allowedHere(envOf()).ok, false);
    for (const k of CLOUD_ENV) {
      assert.equal(allowedHere(envOf({ [k]: '1' })).ok, true, k);
      reset(root);
      const r = drive(root, ['run', '--max-eras', '1'], { [k]: 'true' });
      assert.equal(r.code, 0, k + ': ' + r.stderr);
      assert.equal(calls(root).length, 5, k);
    }
  } finally { clean(root); }
});

test('--dry lists what one era would run, in order, and runs nothing, writes nothing, takes no lock, on a PC too', () => {
  const era = { era: 2, eras: [], lastGrown: { alpha: 2 } };
  const root = makeRoot({ ledger: ['alpha', 'beta', 'gamma'], open: [], cells: [neoRow('beta', 1)], era });
  try {
    const R = path.resolve(root);
    const before = fs.readFileSync(path.join(root, ERA_FILE), 'utf8');
    const r = drive(root, ['run', '--dry']);
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.dry, true);
    assert.equal(r.json.allowed, false);
    assert.equal(r.json.why, PC_REFUSAL);
    assert.equal(r.json.era, 3);
    assert.equal(r.json.generation, 4);
    assert.equal(r.json.lock, 'free');
    assert.deepEqual(r.json.mastered, ['beta']);
    assert.deepEqual(r.json.would, [
      'node grow/absorb.mjs pull --gen 4 --root ' + R,
      'node grow/teach.mjs intake --gen 4 --root ' + R,
      'node grow/neo.mjs grow --task gamma --gen 4 --root ' + R,
      'node grow/neo.mjs grow --task alpha --gen 4 --root ' + R,
      'node grow/measure.mjs run --era 3 --root ' + R,
    ]);
    const c = drive(root, ['run', '--dry', '--commit'], { CI: '1' });
    assert.equal(c.json.allowed, true);
    const ps = SHIP_PATHS.join(' ');
    assert.deepEqual(c.json.would.slice(5), ['git add -- ' + ps, 'git commit -m "era 3: <tasks> tasks, <cells> cells, <mastered> mastered" -m "' + TRAILER + '" -- ' + ps, 'git push (pushHead)']);
    assert.equal(drive(root, ['run', '--dry', '--commit', '--no-push']).json.would.length, 7);
    put(root, LOCK, JSON.stringify({ pid: 5, at: new Date().toISOString() }));
    assert.equal(drive(root, ['run', '--dry']).json.lock, 'held');
    assert.deepEqual(calls(root), [], 'no child ran');
    assert.equal(fs.readFileSync(path.join(root, ERA_FILE), 'utf8'), before, 'neo/ERA.json untouched');
    assert.equal(fs.readFileSync(path.join(root, 'open.json'), 'utf8'), '[]');
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

test('SHIP (--commit): one commit an era as jayden with the cortex trailer, message era <e>: <tasks> tasks, <cells> cells, <mastered> mastered, neo/ and grown/ only; nothing to commit is no error; pushHead to a remote; a failed push is a blocked line and the commit stays', () => {
  const base = tmp('grow-era-git-');
  const root = makeRoot();
  try {
    assert.deepEqual([...SHIP_PATHS], ['neo/', 'grown/', 'grown/measure.jsonl']);
    const env = gitEnvOf(base), git = gitIn(env);
    const gitEnv = { GIT_CONFIG_GLOBAL: env.GIT_CONFIG_GLOBAL, GIT_CONFIG_NOSYSTEM: '1', GIT_TERMINAL_PROMPT: '0' };
    git(root, ['init', '-q', '-b', 'master']);
    git(root, ['add', '-A']);
    git(root, ['commit', '-q', '-m', 'stub tree']);
    const a = drive(root, ['run', '--max-eras', '1', '--commit', '--no-push'], { CI: '1', ...gitEnv });
    assert.equal(a.code, 0, a.stderr);
    assert.equal(a.json.committed, 1, a.json.blocked.join(' | '));
    assert.equal(a.json.pushed, 'skipped (--no-push)');
    assert.deepEqual(a.json.blocked, [], '--no-push tries no push');
    assert.equal(git(root, ['log', '-1', '--format=%s']), 'era 1: 2 tasks, 20 cells, 0 mastered');
    assert.equal(git(root, ['log', '-1', '--format=%an']), 'jayden');
    assert.ok(git(root, ['log', '-1', '--format=%B']).includes(TRAILER));
    assert.deepEqual(git(root, ['show', '--name-only', '--format=', 'HEAD']).split(/\r?\n/).sort(), ['grown/index.json', 'grown/measure.jsonl', 'neo/ERA.json', 'neo/LEDGER.json']);
    assert.equal(JSON.parse(git(root, ['show', 'HEAD:neo/ERA.json'])).era, 1, 'the commit carries the era it ends');
    // nothing to commit: not an error, no commit
    const head = git(root, ['rev-parse', 'HEAD']);
    assert.deepEqual(ship(root, { era: 9, env }), { committed: 'nothing to commit', pushed: 'skipped: nothing committed', blocked: [] });
    assert.equal(git(root, ['rev-parse', 'HEAD']), head);
    // pushHead: no upstream, so origin HEAD:refs/heads/master
    const remote = path.join(base, 'remote.git');
    git(base, ['init', '-q', '--bare', '-b', 'master', remote]);
    git(root, ['remote', 'add', 'origin', remote]);
    const b = drive(root, ['run', '--max-eras', '1', '--commit'], { CI: '1', ...gitEnv });
    assert.equal(b.code, 0, b.stderr);
    assert.equal(b.json.committed, 1);
    assert.equal(b.json.pushed, 1, b.json.blocked.join(' | '));
    assert.equal(git(remote, ['log', '-1', '--format=%s', 'master']), 'era 2: 2 tasks, 20 cells, 0 mastered');
    // the remote is gone: the commit stays, the push is a blocked line in the run line and in the era's row
    git(root, ['remote', 'set-url', 'origin', path.join(base, 'gone.git')]);
    const c = drive(root, ['run', '--max-eras', '1', '--commit'], { CI: '1', ...gitEnv });
    assert.equal(c.code, 0, c.stderr);
    assert.equal(c.json.committed, 1);
    assert.equal(c.json.pushed, 0);
    const line = c.json.blocked.find((l) => l.startsWith('era 3: ship: push: '));
    assert.ok(line && line.endsWith('(the commit stays)'), c.json.blocked.join(' | '));
    assert.equal(git(root, ['log', '-1', '--format=%s']), 'era 3: 2 tasks, 20 cells, 0 mastered');
    assert.ok(eraDoc(root).eras.at(-1).blocked.includes(line.slice('era 3: '.length)));
  } finally { clean(root); clean(base); }
});

test('commitMessage: an unmeasured count is ?', () => {
  assert.equal(commitMessage(3, 5, 120, 2), 'era 3: 5 tasks, 120 cells, 2 mastered');
  assert.equal(commitMessage(4, 2, null, null), 'era 4: 2 tasks, ? cells, ? mastered');
});

test('neo/ERA.json keeps the last 200 eras and the count era never resets', () => {
  assert.equal(KEEP, 200);
  const rows = Array.from({ length: 200 }, (_, i) => ({ era: 51 + i, at: '2026-10-01T00:00:00.000Z', ms: 1, absorbed: null, opened: [], grown: [], cells: null, mastered: 0, blocked: [] }));
  const root = makeRoot({ era: { era: 250, eras: rows, lastGrown: { omega: 250 } } });
  try {
    const r = drive(root, ['run', '--max-eras', '1'], { CI: '1' });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.era, 251);
    const doc = eraDoc(root);
    assert.equal(doc.era, 251);
    assert.equal(doc.eras.length, 200);
    assert.equal(doc.eras[0].era, 52);
    assert.equal(doc.eras[199].era, 251);
    assert.deepEqual(doc.lastGrown, { omega: 250, alpha: 251, beta: 251 });
    // a count behind its own rows never goes back
    fs.writeFileSync(path.join(root, ERA_FILE), JSON.stringify({ era: 5, eras: [{ era: 7 }], lastGrown: {} }));
    assert.equal(readEra(root).era, 7);
  } finally { clean(root); }
});

test('a neo/ERA.json that is not its shape fails before anything runs and is never rewritten', () => {
  for (const [text, why] of [['{ not json', /^era: neo\/ERA\.json is not JSON/], ['{"era":"x","eras":[]}', /^era: neo\/ERA\.json is not \{ era, eras: \[\.\.\], lastGrown \}/]]) {
    const root = makeRoot({ era: text });
    try {
      const r = drive(root, ['run', '--max-eras', '1'], { CI: '1' });
      assert.equal(r.code, 1);
      assert.match(r.stderr, why);
      assert.deepEqual(calls(root), []);
      assert.equal(fs.readFileSync(path.join(root, ERA_FILE), 'utf8'), text);
      assert.ok(!fs.existsSync(path.join(root, LOCK)));
      assert.equal(drive(root, ['status']).code, 1);
    } finally { clean(root); }
  }
});

test('status prints the head of neo/ERA.json and the lock', () => {
  const root = makeRoot();
  try {
    assert.deepEqual(status(root), { era: 0, eras: 0, last: null, lastGrown: {}, lock: 'free' });
    assert.equal(drive(root, ['run', '--max-eras', '2'], { CI: '1' }).code, 0);
    const s = drive(root, ['status']);
    assert.equal(s.code, 0, s.stderr);
    assert.equal(s.lines.length, 1);
    assert.equal(s.json.era, 2);
    assert.equal(s.json.eras, 2);
    assert.equal(s.json.last.era, 2);
    assert.deepEqual(s.json.lastGrown, { alpha: 2, beta: 2 });
    assert.equal(s.json.lock, 'free');
    put(root, LOCK, JSON.stringify({ pid: 77, at: new Date().toISOString() }));
    assert.match(drive(root, ['status']).json.lock, /^held \(pid 77, /);
  } finally { clean(root); }
});

test('an idle era (no row absorbed, no task opened, none grown) stops the run; any one of the three keeps it burning', () => {
  const all = [neoRow('alpha', 1), neoRow('beta', 1)];
  const root = makeRoot({ ledger: ['alpha', 'beta'], open: [], cells: all });
  try {
    const r = drive(root, ['run', '--max-eras', '5'], { CI: '1', STUB_ABSORB_ROWS: '0' });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.eras, 1);
    assert.equal(r.json.stop, 'idle');
    assert.deepEqual(seq(root), ['absorb pull --gen 4', 'teach intake --gen 4', 'measure run --era 1']);
    assert.equal(r.json.mastered, 2);
    assert.ok(isIdle(eraDoc(root).eras[0]));
    // rows absorbed: not idle
    reset(root);
    const a = drive(root, ['run', '--max-eras', '3'], { CI: '1' });
    assert.equal(a.json.eras, 3);
    assert.equal(a.json.stop, 'max-eras');
    // a task to grow: not idle
    fs.writeFileSync(path.join(root, 'grown/index.json'), JSON.stringify({ generation: 3, cells: [neoRow('alpha', 1), neoRow('beta', 0.5)] }));
    const b = drive(root, ['run', '--max-eras', '3'], { CI: '1', STUB_ABSORB_ROWS: '0' });
    assert.equal(b.json.eras, 3);
    assert.equal(b.json.stop, 'max-eras');
    assert.equal(isIdle({ absorbed: { bytes: 0, tasks: 0, rows: 0 }, opened: ['x'], grown: [] }), false, 'a task opened: not idle');
  } finally { clean(root); }
});

test('a generation finish in flight in this checkout: no era starts beside it, and a run in progress stops between eras', () => {
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
    // at the start: refused, nothing run, nothing written, no lock
    assert.throws(() => inproc(root, { procs: fin(['node', script, 'finish']) }), (e) => e.code === 1 && /^a generation finish is in flight in this checkout \(pid 10\): no era runs beside it$/.test(e.message));
    assert.deepEqual(calls(root), []);
    assert.ok(!fs.existsSync(path.join(root, ERA_FILE)) && !fs.existsSync(path.join(root, LOCK)));
    // between eras: the run stops, names it, keeps the era it ended
    let n = 0;
    const later = () => (n++ === 0 ? [] : [{ pid: 11, argv: ['node', script, 'finish'], cwd: R }]);
    const j = inproc(root, { maxEras: 5, procs: later });
    assert.equal(j.eras, 1);
    assert.equal(j.stop, 'finish');
    assert.deepEqual(j.blocked, ['a generation finish is in flight in this checkout (pid 11): no further era']);
    assert.equal(eraDoc(root).era, 1);
    assert.ok(!fs.existsSync(path.join(root, LOCK)));
  } finally { clean(root); clean(other); }
});

test('it never opens state/, judge/heldout/, judge/control.jsonl or any neo/tasks/*/heldout.jsonl (every fs read in this process watched)', () => {
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
    const j = inproc(root, { maxEras: 2, now: c.now, exec: c.exec });
    assert.equal(j.eras, 2);
    inproc(root, { dry: true, commit: true });
    status(root);
    readEra(root);
    colonies(root);
    assert.deepEqual(hits, []);
    // the watch itself sees a read there (a control: a guard that never fires proves nothing)
    fs.readFileSync(path.join(root, 'judge', 'control.jsonl'), 'utf8');
    assert.equal(hits.length, 1);
  } finally {
    for (const k of names) fs[k] = orig[k];
    syncBuiltinESMExports();
    clean(root);
  }
});

test('all native: grow/era.mjs imports node builtins and its two siblings only; no network, model, eval or dynamic import in its code; no em-dash in either file', () => {
  const src = fs.readFileSync(ERA, 'utf8');
  const specs = importsOf(src);
  assert.deepEqual(specs.filter((s) => !s.startsWith('node:')).sort(), ['./generation.mjs', './teach.mjs']);
  assert.ok(specs.filter((s) => s.startsWith('node:')).every((s) => ['node:fs', 'node:path', 'node:crypto', 'node:child_process', 'node:url'].includes(s)), specs.join(' '));
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
  for (const re of [/\bfetch\s*\(/, /https?:/i, /ollama/i, /anthropic/i, /openai/i, /11434/, /\beval\s*\(/, /new\s+Function/, /\bimport\s*\(/, /\brequire\s*\(/, /net\.connect|node:https?|node:net|WebSocket/]) {
    assert.ok(!re.test(code), 'grow/era.mjs code matches ' + re);
  }
  for (const f of [ERA, fileURLToPath(import.meta.url)]) assert.ok(!fs.readFileSync(f, 'utf8').includes(String.fromCharCode(0x2014)), path.basename(f) + ' holds an em-dash');
});

test('usage: a bad flag, value or verb is exit 2 with one line and nothing run; --help prints the usage', () => {
  const root = makeRoot();
  try {
    const cases = [
      [['run', '--max-ms', '0'], /^era: --max-ms is an integer from 1, not 0$/],
      [['run', '--max-ms', 'soon'], /^era: --max-ms is an integer from 1, not soon$/],
      [['run', '--max-eras', '-1'], /^era: --max-eras is an integer from 0, not -1$/],
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

test('three eras back to back (a stub tree on a cloud VM): the run line', (t) => {
  const root = makeRoot({ open: ['alpha', 'beta', 'gamma'], plan: { beta: { score: 1 } } });
  try {
    const r = drive(root, ['run', '--max-eras', '3'], { CI: '1' });
    assert.equal(r.code, 0, r.stderr);
    t.diagnostic(r.lines[r.lines.length - 1]);
    assert.deepEqual(seq(root), [
      'absorb pull --gen 4', 'teach intake --gen 4', 'neo grow --task alpha --gen 4', 'neo grow --task beta --gen 4', 'neo grow --task gamma --gen 4', 'measure run --era 1',
      'absorb pull --gen 4', 'teach intake --gen 4', 'neo grow --task alpha --gen 4', 'neo grow --task gamma --gen 4', 'measure run --era 2',
      'absorb pull --gen 4', 'teach intake --gen 4', 'neo grow --task alpha --gen 4', 'neo grow --task gamma --gen 4', 'measure run --era 3',
    ]);
    const j = r.json;
    assert.equal(j.eras, 3);
    assert.equal(j.era, 3);
    assert.deepEqual(j.absorbed, { bytes: 12288, tasks: 6, rows: 180 });
    assert.equal(j.opened, 3);
    assert.equal(j.grown, 7);
    assert.equal(j.cells, 30);
    assert.equal(j.mastered, 1);
    assert.equal(j.stop, 'max-eras');
    assert.deepEqual(j.blocked, []);
    const doc = eraDoc(root);
    assert.deepEqual(doc.eras.map((x) => [x.era, x.grown.length, x.cells, x.mastered]), [[1, 3, 30, 1], [2, 2, 30, 1], [3, 2, 30, 1]]);
    assert.deepEqual(doc.lastGrown, { alpha: 3, beta: 1, gamma: 3 });
    assert.equal(fs.readFileSync(path.join(root, 'grown/measure.jsonl'), 'utf8').trim().split('\n').length, 3);
  } finally { clean(root); }
});
