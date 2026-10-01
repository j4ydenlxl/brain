// test/grow-measure.test.mjs: THE MEASURE (grow/measure.mjs, grow/NEO.md "Order 7: always burning", MEASURE) against stub roots.
// His words it serves (2026-10-01, NEO.md): "orthogonally automatically measure, iterate, and improve itself, over
// consistent measures always on in the background ... and visible constant improvement test".
// Every test builds a temporary root: locked class NAMES in judge/dev/ (contents that are not JSON, never to be read),
// sentinel held-out sets, a sentinel control set, a sentinel state/ and a sentinel task held-out file, grown/index.json with
// hand cells and tier "neo" colonies, neo/LEDGER.json, neo/ABSORB.json, bench/verdicts/ladder.json, and stub children for
// judge/baseline.mjs, grow/neo.mjs and grow/teach.mjs that log each call to calls.log. The measure runs with --root <tmp>,
// so nothing here touches the real grown/, state/ or a held-out set, and nothing reaches a network (the measure has none).
// What it holds the measure to, one test or more per rule of the contract: the row's keys and values part by part, append
// only, classes by NAME, one baseline child per class with its --out outside state/, never opening a held-out set, the
// control set, state/ or a task's held-out file (refused, not merely avoided), every temporary directory removed, a part
// that cannot be read is null with a blocked line and the row still appended, the mean taken only over every class,
// neo from its three sources, ladder copied not recomputed, the parts orthogonal, series last minus first, usage exits,
// and no model, socket or fetch anywhere in the module.
// MEASURE_MODULE (an environment variable) points the suite at another copy of the module: the mutant run uses it.
// Author: Opus 5.5 builder (MEASURE) for the Fable 5.1 orchestrator, 2026-10-01, his Order 7.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const BRAIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MEASURE = process.env.MEASURE_MODULE ? path.resolve(process.env.MEASURE_MODULE) : path.join(BRAIN, 'grow', 'measure.mjs');
const M = await import(pathToFileURL(MEASURE).href);

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-measure-test-'));
process.on('exit', () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* the OS cleans tmp */ } });
const ROW_KEYS = ['at', 'era', 'generation', 'locked', 'neo', 'generated', 'absorbed', 'syllabus', 'ladder', 'ms', 'blocked'];
const PARTS = ['locked', 'neo', 'generated', 'absorbed', 'syllabus', 'ladder'];
const CLASSES = ['alpha', 'beta', 'gamma'];
const SCORES = { alpha: 0.25, beta: 0.5, gamma: 1 };
const HELD_N = { alpha: 3, beta: 4, gamma: 5 };
// never to be read by the measure (the test's own list: a mutant of the module's list does not weaken it)
const FORBIDDEN = [/^judge\/heldout(?:\/|$)/, /^judge\/control\.jsonl$/, /^state(?:\/|$)/, /^neo\/tasks\/[^/]+\/heldout\.jsonl$/, /^judge\/dev\/.+/];
const SENTINELS = ['HELDOUT-SENTINEL', 'CONTROL-SENTINEL', 'STATE-SENTINEL', 'TASK-HELDOUT-SENTINEL', 'DEV-SENTINEL'];
const LADDER_AT = '2026-10-01T08:02:04.463Z';

const INDEX = {
  generation: 3,
  cells: [
    { id: 'hand-direct-g1', class: 'alpha', generation: 1, lane: 'direct', file: 'cells/hand-direct-g1.mjs', heldout: { score: 1, n: 12 } },
    { id: 't-one-neo-g1', class: 't-one', task: 't-one', generation: 1, lane: 'neo', tier: 'neo', file: 'cells/t-one-neo-g1.mjs', heldout: { score: 0.4, n: 10, ok: 4 } },
    { id: 't-two-neo-g2', class: 't-two', task: 't-two', generation: 2, lane: 'neo', tier: 'neo', file: 'cells/t-two-neo-g2.mjs', heldout: { score: 0.5, n: 12, ok: 6 } },
    { id: 't-one-neo-g3', class: 't-one', task: 't-one', generation: 3, lane: 'neo', tier: 'neo', file: 'cells/t-one-neo-g3.mjs', heldout: { score: 1, n: 10, ok: 10 } },
  ],
};
const LEDGER = { tasks: [{ task: 't-one', generation: 1 }, { task: 't-two', generation: 2 }, { task: 't-three', generation: 3 }, 'not a row'], generated: 4242 };
const ABSORB = { cursor: 3, pulled: [{ id: 's-one', at: '2026-10-01T00:00:00Z', bytes: 500, rows: 30 }, { id: 's-two', at: '2026-10-01T00:01:00Z', bytes: 277, rows: 25 }, { id: 's-one', at: '2026-10-01T00:02:00Z', bytes: 0, rows: 0 }], bytes: 777, rows: 55 };
const col = (s) => ({ score: s });
const LADDER = {
  at: LADDER_AT,
  days: [
    { date: '2026-09-30', at: '2026-09-30T08:00:00.000Z', columns: { answer: col(1), code: col(1), capability: col(1), health: col(1) }, composite: 0.5 },
    { date: '2026-10-01', at: '2026-10-01T08:02:04.227Z', columns: { answer: col(1), code: col(0), capability: col(1), health: col(1) }, composite: 0.687507 },
  ],
  latest: { date: '2026-10-01', file: 'bench/verdicts/ladder/2026-10-01.json' },
};
/** The row's parts on the default stub root. */
const EXPECT = {
  locked: { classes: 3, mean: 0.5833, byClass: { alpha: 0.25, beta: 0.5, gamma: 1 }, knowledge: ['stub-pack'] },
  neo: { tasks: 3, colonies: 2, cells: 1234, mastered: 1, heldout: { ok: 16, n: 22, score: 0.7273 } },
  generated: 4242,
  absorbed: { bytes: 777, rows: 55, sources: 2 },
  syllabus: { skills: 386, opened: 3, pending: 380 },
  ladder: { composite: 0.687507, at: LADDER_AT },
};

const PRELUDE = `import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const log = (name) => fs.appendFileSync(path.join(ROOT, 'calls.log'), JSON.stringify([name, ...process.argv.slice(2)]) + '\\n');
const has = (v, x) => String(v || '').split(',').includes(x);
`;
const STUBS = {
  // the real baseline reads the class's held-out set and writes state/grow/baseline/<cls>.json unless --out says otherwise
  'judge/baseline.mjs': `log('baseline');
const cls = process.argv[2];
const scores = Object.assign(${JSON.stringify(SCORES)}, JSON.parse(process.env.STUB_SCORES || '{}'));
if (has(process.env.STUB_FAIL, cls)) { console.log('baseline failed: stub ' + cls); process.exit(1); }
if (has(process.env.STUB_HANG, cls)) setInterval(() => {}, 1000);
else {
  const n = fs.readFileSync(path.join(ROOT, 'judge', 'heldout', cls + '.jsonl'), 'utf8').trim().split('\\n').length;
  const i = process.argv.indexOf('--out');
  const out = i > 0 ? process.argv[i + 1] : path.join(ROOT, 'state', 'grow', 'baseline', cls + '.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ class: cls, rows: [{ q: 'HELDOUT-SENTINEL' }] }));
  console.log('a line before the result');
  console.log(JSON.stringify({ class: cls, n, ok: Math.round(scores[cls] * n), score: scores[cls], knowledge: process.env.STUB_KNOWLEDGE || 'stub-pack', out }));
}`,
  'grow/neo.mjs': `log('neo');
if (process.env.STUB_NEO_FAIL) { console.error('neo status failed: stub'); process.exit(1); }
console.log(JSON.stringify(Object.assign({ tasks: 77, colonies: 2, cells: 1234, generated: 99999, byFamily: { sense: 1 }, at: '2026-10-01T00:00:00.000Z' }, JSON.parse(process.env.STUB_NEO || '{}'))));`,
  'grow/teach.mjs': `log('teach');
if (process.env.STUB_TEACH_FAIL) { console.error('teach status failed: stub'); process.exit(1); }
console.log(JSON.stringify({ syllabus: 386, opened: 3, pending: 380, tasks: ['t-one', 't-two', 't-three'], answered: 3 }));`,
};

const jsonl = (rows) => rows.map((r) => (typeof r === 'string' ? r : JSON.stringify(r))).join('\n') + '\n';
const put = (root, rel, text) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, typeof text === 'string' ? text : JSON.stringify(text, null, 2) + '\n'); return f; };
const read = (f) => fs.readFileSync(f, 'utf8');
let seq = 0;
/** A fresh stub root (see the head of this file). */
function makeRoot() {
  const root = path.join(TMP, 'root-' + ++seq);
  for (const c of CLASSES) {
    put(root, 'judge/dev/' + c + '.jsonl', 'DEV-SENTINEL not JSON: the measure reads this directory by NAME only\n');
    put(root, 'judge/heldout/' + c + '.jsonl', jsonl(Array.from({ length: HELD_N[c] }, (_, i) => ({ q: 'HELDOUT-SENTINEL-' + c + '-' + i, expect: { minWords: 1 } }))));
  }
  put(root, 'judge/dev/notes.txt', 'not a class\n');
  put(root, 'judge/dev/Bad_Name.jsonl', 'not a class name\n');
  put(root, 'judge/control.jsonl', jsonl([{ q: 'CONTROL-SENTINEL-1' }]));
  put(root, 'state/keep.txt', 'STATE-SENTINEL\n');
  put(root, 'neo/tasks/t-one/heldout.jsonl', jsonl([{ q: 'TASK-HELDOUT-SENTINEL', expect: { minWords: 1 }, answer: 'x' }]));
  put(root, 'neo/tasks/t-one/dev.jsonl', jsonl([{ q: 'a dev prompt', expect: { minWords: 1 }, answer: 'x' }]));
  put(root, 'grown/index.json', INDEX);
  put(root, 'neo/LEDGER.json', LEDGER);
  put(root, 'neo/ABSORB.json', ABSORB);
  put(root, 'bench/verdicts/ladder.json', LADDER);
  for (const [rel, body] of Object.entries(STUBS)) put(root, rel, PRELUDE + body + '\n');
  return root;
}
const clean = (root) => fs.rmSync(root, { recursive: true, force: true });
/** The child environment: no test runner context, no stub switch but `extra`, and its own temporary directory. */
function envOf(extra = {}, tmpDir = null) {
  const env = { ...process.env };
  for (const k of ['NODE_TEST_CONTEXT', 'NODE_OPTIONS']) delete env[k];
  for (const k of Object.keys(env)) if (k.startsWith('STUB_') || k === 'MEASURE_MODULE') delete env[k];
  if (tmpDir) Object.assign(env, { TEMP: tmpDir, TMP: tmpDir, TMPDIR: tmpDir });
  return { ...env, ...extra };
}
/** The CLI with --root <root> last; json is its last stdout line parsed. */
function cli(root, args, extra = {}, { tmpDir = null, rootArg = true } = {}) {
  const r = spawnSync(process.execPath, [MEASURE, ...args, ...(rootArg ? ['--root', root] : [])], { cwd: root, env: envOf(extra, tmpDir), encoding: 'utf8', timeout: 120000, windowsHide: true });
  const lines = String(r.stdout || '').split(/\r?\n/).filter((l) => l.trim());
  let json = null;
  try { json = JSON.parse(lines[lines.length - 1]); } catch { json = null; }
  return { code: r.status, json, lines, stdout: r.stdout || '', stderr: r.stderr || '' };
}
const calls = (root) => { try { return read(path.join(root, 'calls.log')).split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l)); } catch { return []; } };
const rowsOf = (root) => { try { return read(path.join(root, 'grown', 'measure.jsonl')).split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l)); } catch { return []; } };
const partsOf = (row) => Object.fromEntries(PARTS.map((p) => [p, row[p]]));
const relTo = (root, p) => path.relative(root, path.resolve(root, String(p))).split(path.sep).join('/').toLowerCase();

// ---- run: the row
test('run: one JSON line, the row printed is the row appended, every part from its own source', () => {
  const root = makeRoot();
  try {
    const r = cli(root, ['run', '--era', '7', '--gen', '4']);
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.lines.length, 1, 'one line on stdout: ' + r.stdout);
    assert.equal(r.stderr, '');
    assert.deepEqual(Object.keys(r.json), ROW_KEYS);
    assert.equal(r.json.era, 7);
    assert.equal(r.json.generation, 4);
    assert.deepEqual(partsOf(r.json), EXPECT);
    assert.deepEqual(r.json.blocked, []);
    assert.ok(Number.isInteger(r.json.ms) && r.json.ms >= 0, 'ms ' + r.json.ms);
    assert.ok(!Number.isNaN(Date.parse(r.json.at)) && r.json.at.endsWith('Z'), 'at ' + r.json.at);
    const text = read(path.join(root, 'grown', 'measure.jsonl'));
    assert.equal(text, r.lines[0] + '\n', 'the file holds exactly the printed row');
  } finally { clean(root); }
});

test('run: era and generation are null unless given; --era 0 is an era', () => {
  const root = makeRoot();
  try {
    const a = cli(root, ['run']);
    assert.equal(a.code, 0, a.stderr);
    assert.equal(a.json.era, null);
    assert.equal(a.json.generation, null);
    const b = cli(root, ['run', '--era', '0']);
    assert.equal(b.code, 0, b.stderr);
    assert.equal(b.json.era, 0);
    assert.equal(b.json.generation, null);
  } finally { clean(root); }
});

test('append only: the bytes before a run are never rewritten; a last line without a newline gets one first', () => {
  const root = makeRoot();
  try {
    const before = '{"at":"2026-01-01T00:00:00.000Z","old":1}\n{"at":"2026-01-02T00:00:00.000Z","old":2}';
    put(root, 'grown/measure.jsonl', before);
    const a = cli(root, ['run', '--era', '1']);
    assert.equal(a.code, 0, a.stderr);
    const t1 = read(path.join(root, 'grown', 'measure.jsonl'));
    assert.ok(t1.startsWith(before + '\n'), 'the earlier bytes stand, a newline added');
    assert.equal(t1, before + '\n' + a.lines[0] + '\n');
    const b = cli(root, ['run', '--era', '2']);
    assert.equal(b.code, 0, b.stderr);
    const t2 = read(path.join(root, 'grown', 'measure.jsonl'));
    assert.equal(t2, t1 + b.lines[0] + '\n', 'the second run appends after the first, nothing rewritten');
    const rows = rowsOf(root);
    assert.equal(rows.length, 4);
    assert.deepEqual(rows.map((x) => x.era ?? x.old), [1, 2, 1, 2]);
    assert.deepEqual(Object.keys(rows[2]), Object.keys(rows[3]), 'the same measures every time');
  } finally { clean(root); }
});

// ---- locked
test('locked: classes by NAME (*.jsonl with a class name), one baseline child per class, its --out outside the root', () => {
  const root = makeRoot();
  try {
    const r = cli(root, ['run', '--jobs', '2']);
    assert.equal(r.code, 0, r.stderr);
    const base = calls(root).filter((c) => c[0] === 'baseline').sort((x, y) => (x[1] < y[1] ? -1 : 1));
    assert.deepEqual(base.map((c) => c[1]), CLASSES, 'notes.txt and Bad_Name.jsonl are not classes');
    for (const c of base) {
      assert.equal(c.length, 4, 'baseline <cls> --out <file>: ' + JSON.stringify(c));
      assert.equal(c[2], '--out');
      assert.equal(path.basename(c[3]), c[1] + '.json');
      assert.ok(relTo(root, c[3]).startsWith('..'), 'the --out file is outside the root: ' + c[3]);
    }
    assert.deepEqual(Object.keys(r.json.locked.byClass), CLASSES);
    assert.equal(r.json.locked.classes, 3);
  } finally { clean(root); }
});

test('locked: a class that does not measure has a null score, the mean is not taken, a blocked line, the row still appended', () => {
  const root = makeRoot();
  try {
    const r = cli(root, ['run'], { STUB_FAIL: 'beta' });
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(r.json.locked, { classes: 3, mean: null, byClass: { alpha: 0.25, beta: null, gamma: 1 }, knowledge: ['stub-pack'] });
    assert.ok(r.json.blocked.includes('locked: beta: node judge/baseline.mjs beta exited 1: baseline failed: stub beta'), r.json.blocked.join(' | '));
    assert.ok(r.json.blocked.includes('locked: mean not taken: 1 of 3 classes did not measure'), r.json.blocked.join(' | '));
    for (const p of PARTS.filter((x) => x !== 'locked')) assert.deepEqual(r.json[p], EXPECT[p], p + ' is untouched');
    assert.equal(rowsOf(root).length, 1);
  } finally { clean(root); }
});

test('locked: a baseline that hangs is killed at --timeout-ms and blocked', () => {
  const root = makeRoot();
  try {
    const t0 = Date.now();
    const r = cli(root, ['run', '--timeout-ms', '1500'], { STUB_HANG: 'gamma' });
    assert.equal(r.code, 0, r.stderr);
    assert.ok(Date.now() - t0 < 60000, 'the hang did not hold the run');
    assert.equal(r.json.locked.byClass.gamma, null);
    assert.ok(r.json.blocked.includes('locked: gamma: node judge/baseline.mjs gamma exited 1: timed out after 1500 ms'), r.json.blocked.join(' | '));
  } finally { clean(root); }
});

test('locked: knowledge carries what each child said it used (a ruler that changed is visible)', () => {
  const root = makeRoot();
  try {
    const r = cli(root, ['run'], { STUB_KNOWLEDGE: 'bench/fixtures/wiki/pack-200' });
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(r.json.locked.knowledge, ['bench/fixtures/wiki/pack-200']);
  } finally { clean(root); }
});

// ---- never opened, never written
/** Run fn while every read-side fs call records its path; the spies are removed after. */
async function spyReads(fn) {
  const seen = [];
  const note = (p) => { if (typeof p === 'string' || Buffer.isBuffer(p)) seen.push(String(p)); else if (p instanceof URL) seen.push(fileURLToPath(p)); };
  const names = ['readFileSync', 'openSync', 'readdirSync', 'existsSync', 'statSync', 'lstatSync', 'accessSync', 'createReadStream', 'readFile', 'open', 'readdir', 'opendirSync'];
  const saved = {}, psaved = {};
  for (const n of names) if (typeof fs[n] === 'function') { saved[n] = fs[n]; fs[n] = function (p, ...rest) { note(p); return saved[n].call(this, p, ...rest); }; }
  for (const n of ['readFile', 'open', 'readdir', 'opendir']) if (typeof fs.promises[n] === 'function') { psaved[n] = fs.promises[n]; fs.promises[n] = function (p, ...rest) { note(p); return psaved[n].call(this, p, ...rest); }; }
  try { return { value: await fn(), seen }; } finally {
    for (const [n, f] of Object.entries(saved)) fs[n] = f;
    for (const [n, f] of Object.entries(psaved)) fs.promises[n] = f;
  }
}

test('the measure never opens a held-out set, the control set, state/, a task held-out file or a dev file: refused, not merely avoided', async () => {
  const root = makeRoot();
  try {
    const { value: row, seen } = await spyReads(() => M.measure(root, { env: envOf(), jobs: 2 }));
    assert.deepEqual(partsOf(row), EXPECT);
    const inRoot = seen.map((p) => relTo(root, p)).filter((p) => !p.startsWith('..'));
    assert.ok(inRoot.length > 0, 'the spy saw the measure read its sources');
    const bad = inRoot.filter((p) => FORBIDDEN.some((re) => re.test(p)));
    assert.deepEqual(bad, [], 'opened: ' + bad.join(', '));
    const text = JSON.stringify(row);
    for (const s of SENTINELS) assert.ok(!text.includes(s), 'the row carries ' + s);
    // the guard itself: each forbidden path is a throw, an allowed one is read
    for (const p of ['judge/heldout/alpha.jsonl', 'judge/heldout', 'judge/control.jsonl', 'state/keep.txt', 'state', 'neo/tasks/t-one/heldout.jsonl', 'Judge/HeldOut/alpha.jsonl', 'neo/../judge/heldout/alpha.jsonl', path.join(root, 'state', 'keep.txt')]) {
      assert.throws(() => M.readGuarded(root, p), /refused/, p);
    }
    assert.equal(M.readGuarded(root, 'neo/LEDGER.json'), read(path.join(root, 'neo', 'LEDGER.json')));
    assert.equal(M.readGuarded(root, 'neo/tasks/t-one/dev.jsonl').includes('a dev prompt'), true, 'a task dev file is not refused');
  } finally { clean(root); }
});

test('state/ is never written and every temporary directory is removed', () => {
  const root = makeRoot();
  const tmpDir = path.join(TMP, 'tmpenv-' + seq);
  fs.mkdirSync(tmpDir, { recursive: true });
  try {
    const snap = () => fs.readdirSync(path.join(root, 'state'), { recursive: true }).map(String).sort();
    const before = snap();
    const r = cli(root, ['run'], {}, { tmpDir });
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(snap(), before, 'state/ holds what it held');
    assert.equal(read(path.join(root, 'state', 'keep.txt')), 'STATE-SENTINEL\n');
    const outs = calls(root).filter((c) => c[0] === 'baseline').map((c) => c[3]);
    assert.equal(outs.length, 3);
    for (const o of outs) assert.ok(relTo(tmpDir, o).split('/').length === 2, 'the --out file lies in a directory of the temporary directory: ' + o);
    assert.deepEqual(fs.readdirSync(tmpDir), [], 'the temporary directory is removed');
  } finally { clean(root); fs.rmSync(tmpDir, { recursive: true, force: true }); }
});

// ---- neo and generated
test('neo: null with a blocked line when grow/neo.mjs is not on disk or fails; generated is still read from the ledger', () => {
  const root = makeRoot();
  try {
    fs.rmSync(path.join(root, 'grow', 'neo.mjs'));
    const a = cli(root, ['run']);
    assert.equal(a.code, 0, a.stderr);
    assert.equal(a.json.neo, null);
    assert.deepEqual(a.json.blocked, ['neo: grow/neo.mjs is not on disk: node grow/neo.mjs status cannot run']);
    assert.equal(a.json.generated, 4242, 'the ledger count, not the status line');
    put(root, 'grow/neo.mjs', PRELUDE + STUBS['grow/neo.mjs'] + '\n');
    const b = cli(root, ['run'], { STUB_NEO_FAIL: '1' });
    assert.equal(b.code, 0, b.stderr);
    assert.equal(b.json.neo, null);
    assert.deepEqual(b.json.blocked, ['neo: node grow/neo.mjs status exited 1: neo status failed: stub']);
    const c = cli(root, ['run'], { STUB_NEO: JSON.stringify({ cells: 'many' }) });
    assert.equal(c.json.neo, null, 'a status line without a count is not read as one');
    assert.ok(c.json.blocked[0].startsWith('neo: node grow/neo.mjs status printed no { colonies, cells } line'), c.json.blocked.join(' | '));
    assert.equal(rowsOf(root).length, 3, 'every row appended');
    const neo = calls(root).filter((x) => x[0] === 'neo');
    assert.ok(neo.length >= 2 && neo.every((x) => x[1] === 'status' && x[2] === '--root' && path.resolve(x[3]) === path.resolve(root)), JSON.stringify(neo));
  } finally { clean(root); }
});

test('neo: tasks from the ledger, colonies and cells from the status line, mastered and heldout from tier "neo" rows only', async () => {
  const root = makeRoot();
  try {
    const run = async () => (await M.measure(root, { env: envOf() })).neo;
    assert.deepEqual(await run(), EXPECT.neo);
    // a row with score and n but no ok: ok is score times n; it answers every row, so it is mastered
    put(root, 'grown/index.json', { generation: 3, cells: [...INDEX.cells, { id: 't-four-neo-g3', class: 't-four', tier: 'neo', heldout: { score: 1, n: 8 } }] });
    assert.deepEqual(await run(), { ...EXPECT.neo, mastered: 2, heldout: { ok: 24, n: 30, score: 0.8 } });
    // no colony yet: zero of zero is no score, not a score of zero
    put(root, 'grown/index.json', { generation: 3, cells: [INDEX.cells[0]] });
    assert.deepEqual(await run(), { ...EXPECT.neo, mastered: 0, heldout: { ok: 0, n: 0, score: null } });
    // a tier "neo" row that cannot be read voids the part (a sum over fewer colonies is another ruler)
    put(root, 'grown/index.json', { generation: 3, cells: [...INDEX.cells, { id: 'broken-neo-g3', tier: 'neo', heldout: { score: 'high' } }] });
    const row = await M.measure(root, { env: envOf() });
    assert.equal(row.neo, null);
    assert.deepEqual(row.blocked, ['neo: grown/index.json has 1 tier "neo" row without a readable heldout { score, n, ok }']);
    // a ledger that is not JSON voids neo and generated, and nothing else
    put(root, 'grown/index.json', INDEX);
    put(root, 'neo/LEDGER.json', '{ not json');
    const l = await M.measure(root, { env: envOf() });
    assert.equal(l.neo, null);
    assert.equal(l.generated, null);
    assert.ok(l.blocked.some((x) => x.startsWith('neo: neo/LEDGER.json is not JSON')) && l.blocked.some((x) => x.startsWith('generated: neo/LEDGER.json is not JSON')), l.blocked.join(' | '));
  } finally { clean(root); }
});

test('generated: the ledger count; a ledger without one is null with a blocked line', () => {
  const root = makeRoot();
  try {
    put(root, 'neo/LEDGER.json', { tasks: LEDGER.tasks });
    assert.deepEqual(M.generatedPart(root), { value: null, blocked: ['generated: neo/LEDGER.json generated is not a count'] });
    put(root, 'neo/LEDGER.json', { ...LEDGER, generated: 0 });
    assert.deepEqual(M.generatedPart(root), { value: 0, blocked: [] });
  } finally { clean(root); }
});

// ---- absorbed, syllabus, ladder
test('absorbed: neo/ABSORB.json bytes and rows and its distinct sources; null with a blocked line when missing or malformed', () => {
  const root = makeRoot();
  try {
    assert.deepEqual(M.absorbedPart(root), { value: EXPECT.absorbed, blocked: [] });
    fs.rmSync(path.join(root, 'neo', 'ABSORB.json'));
    assert.deepEqual(M.absorbedPart(root), { value: null, blocked: ['absorbed: neo/ABSORB.json is not there'] });
    put(root, 'neo/ABSORB.json', { cursor: 0, pulled: [] });
    assert.deepEqual(M.absorbedPart(root), { value: null, blocked: ['absorbed: neo/ABSORB.json is not { cursor, pulled: [..], bytes, rows }'] });
    put(root, 'neo/ABSORB.json', { cursor: 0, pulled: [], bytes: 0, rows: 0 });
    assert.deepEqual(M.absorbedPart(root), { value: { bytes: 0, rows: 0, sources: 0 }, blocked: [] });
  } finally { clean(root); }
});

test('syllabus: node grow/teach.mjs status --root <root>; a failure or a missing teacher is null with a blocked line', () => {
  const root = makeRoot();
  try {
    const a = cli(root, ['run'], { STUB_TEACH_FAIL: '1' });
    assert.equal(a.code, 0, a.stderr);
    assert.equal(a.json.syllabus, null);
    assert.deepEqual(a.json.blocked, ['syllabus: node grow/teach.mjs status exited 1: teach status failed: stub']);
    const t = calls(root).filter((x) => x[0] === 'teach');
    assert.equal(t.length, 1);
    assert.deepEqual(t[0].slice(1, 3), ['status', '--root']);
    assert.equal(path.resolve(t[0][3]), path.resolve(root));
    fs.rmSync(path.join(root, 'grow', 'teach.mjs'));
    const b = cli(root, ['run']);
    assert.equal(b.json.syllabus, null);
    assert.deepEqual(b.json.blocked, ['syllabus: grow/teach.mjs is not on disk']);
  } finally { clean(root); }
});

test('ladder: composite and at copied, never recomputed from the columns; null with a blocked line when the file is not there', () => {
  const root = makeRoot();
  try {
    assert.deepEqual(M.ladderPart(root), { value: EXPECT.ladder, blocked: [] }, 'the latest day, not the mean of its columns (0.75)');
    put(root, 'bench/verdicts/ladder.json', { ...LADDER, composite: 0.42 });
    assert.deepEqual(M.ladderPart(root).value, { composite: 0.42, at: LADDER_AT }, 'a top-level composite is copied first');
    put(root, 'bench/verdicts/ladder.json', { ...LADDER, latest: { date: '2026-09-30' } });
    assert.deepEqual(M.ladderPart(root).value, { composite: 0.5, at: LADDER_AT }, 'the day latest names');
    put(root, 'bench/verdicts/ladder.json', { ...LADDER, days: [{ ...LADDER.days[0], composite: null }], latest: { date: '2026-09-30' } });
    assert.deepEqual(M.ladderPart(root).value, { composite: null, at: LADDER_AT }, 'a null composite is copied as null');
    put(root, 'bench/verdicts/ladder.json', { at: LADDER_AT, days: [] });
    assert.deepEqual(M.ladderPart(root), { value: null, blocked: ['ladder: bench/verdicts/ladder.json carries no composite'] });
    fs.rmSync(path.join(root, 'bench', 'verdicts', 'ladder.json'));
    assert.deepEqual(M.ladderPart(root), { value: null, blocked: ['ladder: bench/verdicts/ladder.json is not there'] });
  } finally { clean(root); }
});

// ---- orthogonal parts, nothing readable
test('orthogonal: breaking one source changes its own part and no other', async () => {
  const base = makeRoot();
  let ref;
  try { ref = partsOf(await M.measure(base, { env: envOf() })); } finally { clean(base); }
  assert.deepEqual(ref, EXPECT);
  const cases = [
    ['judge/baseline.mjs gone', (r) => fs.rmSync(path.join(r, 'judge', 'baseline.mjs')), ['locked']],
    ['grow/neo.mjs gone', (r) => fs.rmSync(path.join(r, 'grow', 'neo.mjs')), ['neo']],
    ['grown/index.json not JSON', (r) => put(r, 'grown/index.json', '{'), ['neo']],
    ['neo/LEDGER.json not JSON', (r) => put(r, 'neo/LEDGER.json', '{'), ['neo', 'generated']],
    ['neo/ABSORB.json not JSON', (r) => put(r, 'neo/ABSORB.json', '{'), ['absorbed']],
    ['grow/teach.mjs gone', (r) => fs.rmSync(path.join(r, 'grow', 'teach.mjs')), ['syllabus']],
    ['bench/verdicts/ladder.json not JSON', (r) => put(r, 'bench/verdicts/ladder.json', '{'), ['ladder']],
  ];
  for (const [what, breakIt, hit] of cases) {
    const root = makeRoot();
    try {
      breakIt(root);
      const row = await M.measure(root, { env: envOf() });
      for (const p of PARTS) {
        if (hit.includes(p)) assert.equal(row[p], null, what + ': ' + p + ' is null');
        else assert.deepEqual(row[p], ref[p], what + ': ' + p + ' is untouched');
      }
      assert.deepEqual([...new Set(row.blocked.map((b) => b.split(':')[0]))].sort(), [...hit].sort(), what + ': ' + row.blocked.join(' | '));
    } finally { clean(root); }
  }
});

test('a root where nothing can be read: every part null, a blocked line for each, the row still appended with the same keys', () => {
  const root = path.join(TMP, 'empty-' + ++seq);
  fs.mkdirSync(root, { recursive: true });
  try {
    const r = cli(root, ['run', '--gen', '2']);
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(Object.keys(r.json), ROW_KEYS);
    for (const p of PARTS) assert.equal(r.json[p], null, p);
    assert.deepEqual([...new Set(r.json.blocked.map((b) => b.split(':')[0]))].sort(), [...PARTS].sort());
    assert.deepEqual(rowsOf(root), [r.json]);
  } finally { clean(root); }
});

// ---- series
test('series: last minus first over the window, null where an end has no number, bad lines skipped', () => {
  const root = path.join(TMP, 'series-' + ++seq);
  try {
    fs.mkdirSync(root, { recursive: true });
    const none = cli(root, ['series']);
    assert.equal(none.code, 0, none.stderr);
    assert.deepEqual(none.json, { rows: 0, first: null, last: null, delta: { lockedMean: null, neoTasks: null, neoMastered: null, cells: null, generated: null }, skipped: 0 });
    const r1 = { at: '2026-10-01T01:00:00.000Z', era: 1, generation: null, locked: { classes: 12, mean: 0.5, byClass: {} }, neo: { tasks: 1, colonies: 1, cells: 10, mastered: 0, heldout: { ok: 1, n: 2, score: 0.5 } }, generated: 100 };
    const r2 = { at: '2026-10-01T02:00:00.000Z', era: 2, generation: null, locked: { classes: 12, mean: 0.6, byClass: {} }, neo: null, generated: 150 };
    const r3 = { at: '2026-10-01T03:00:00.000Z', era: 3, generation: 5, locked: { classes: 12, mean: 0.75, byClass: {} }, neo: { tasks: 4, colonies: 3, cells: 30, mastered: 2, heldout: { ok: 9, n: 12, score: 0.75 } }, generated: 400 };
    put(root, 'grown/measure.jsonl', jsonl([r1, 'not json', r2, { no: 'at' }, r3]));
    const all = cli(root, ['series']);
    assert.equal(all.code, 0, all.stderr);
    assert.deepEqual(all.json, {
      rows: 3,
      first: { at: r1.at, era: 1, generation: null, lockedMean: 0.5, neoTasks: 1, neoMastered: 0, cells: 10, generated: 100 },
      last: { at: r3.at, era: 3, generation: 5, lockedMean: 0.75, neoTasks: 4, neoMastered: 2, cells: 30, generated: 400 },
      delta: { lockedMean: 0.25, neoTasks: 3, neoMastered: 2, cells: 20, generated: 300 },
      skipped: 2,
    });
    const two = cli(root, ['series', '--last', '2']);
    assert.equal(two.json.rows, 2);
    assert.equal(two.json.first.at, r2.at);
    assert.deepEqual(two.json.delta, { lockedMean: 0.15, neoTasks: null, neoMastered: null, cells: null, generated: 250 }, 'null is not zero; 0.75 - 0.6 printed as 0.15');
    const one = cli(root, ['series', '--last', '1']);
    assert.deepEqual(one.json.delta, { lockedMean: 0, neoTasks: 0, neoMastered: 0, cells: 0, generated: 0 });
  } finally { clean(root); }
});

test('series over two real runs: the delta is what the two rows printed', () => {
  const root = makeRoot();
  try {
    const a = cli(root, ['run', '--era', '1']);
    const b = cli(root, ['run', '--era', '2'], { STUB_SCORES: JSON.stringify({ alpha: 1, beta: 1, gamma: 1 }), STUB_NEO: JSON.stringify({ cells: 2000 }) });
    assert.equal(a.code, 0, a.stderr);
    assert.equal(b.code, 0, b.stderr);
    assert.equal(b.json.locked.mean, 1);
    const s = cli(root, ['series']);
    assert.equal(s.code, 0, s.stderr);
    assert.equal(s.json.rows, 2);
    assert.deepEqual(s.json.delta, { lockedMean: 0.4167, neoTasks: 0, neoMastered: 0, cells: 766, generated: 0 });
    assert.equal(rowsOf(root).length, 2, 'series appends nothing');
  } finally { clean(root); }
});

// ---- usage, native
test('usage: exit 2 and one stderr line for a bad verb, flag or value; --help prints the usage; nothing is written', () => {
  const root = makeRoot();
  try {
    for (const args of [[], ['--help'], ['help']]) {
      const r = cli(root, args);
      assert.equal(r.code, 0, args.join(' '));
      assert.ok(r.stdout.startsWith('usage: node grow/measure.mjs'), r.stdout);
    }
    const bad = [['bogus'], ['toString'], ['run', 'extra'], ['run', '--last', '3'], ['series', '--era', '1'], ['run', '--era', '-1'], ['run', '--era', '1.5'], ['run', '--gen', '0'],
      ['run', '--jobs', '0'], ['run', '--timeout-ms', '10'], ['series', '--last', '0'], ['run', '--nope', '1'], ['run', '--gen']];
    for (const args of bad) {
      const r = cli(root, args);
      assert.equal(r.code, 2, args.join(' ') + ': ' + r.stderr);
      assert.equal(r.stdout, '', args.join(' '));
      assert.equal(r.stderr.trim().split(/\r?\n/).length, 1, args.join(' ') + ': ' + r.stderr);
    }
    const nowhere = cli(root, ['run', '--root', path.join(root, 'no-such-dir')], {}, { rootArg: false });
    assert.equal(nowhere.code, 2, nowhere.stderr);
    assert.ok(!fs.existsSync(path.join(root, 'grown', 'measure.jsonl')), 'no usage error wrote a row');
    assert.deepEqual(calls(root), [], 'no usage error ran a child');
  } finally { clean(root); }
});

test('native: the module imports only node: builtins and names no model, no socket, no fetch', () => {
  const src = read(MEASURE);
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1'); // his words in the comments name what is refused
  const specs = [...src.matchAll(/^\s*import\s+(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]/gm)].map((m) => m[1]);
  assert.ok(specs.length > 0);
  const allowed = ['node:fs', 'node:os', 'node:path', 'node:child_process', 'node:url'];
  assert.deepEqual(specs.filter((s) => !allowed.includes(s)), [], 'imports: ' + specs.join(', '));
  for (const re of [/\bfetch\s*\(/, /\bimport\s*\(/, /\brequire\s*\(/, /ollama|11434|anthropic|openai|claude-|node:https?\b|node:net\b|node:dgram\b|node:tls\b|XMLHttpRequest|WebSocket/i]) {
    assert.ok(!re.test(code), 'the code matches ' + re);
  }
  assert.ok(!src.includes(String.fromCharCode(0x2014)), 'no em-dash');
});
