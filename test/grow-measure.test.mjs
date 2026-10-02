// test/grow-measure.test.mjs: THE MEASURE (grow/measure.mjs, grow/NEO.md "Order 7: always burning", MEASURE) against stub roots.
// His words it serves (2026-10-01, NEO.md): "orthogonally automatically measure, iterate, and improve itself, over
// consistent measures always on in the background ... and visible constant improvement test", "always finds ways to
// emasure itself and get better, and to make iteration velocity", "everything it generates should be effective, self
// assessing".
// Every test builds a temporary root: locked class NAMES in judge/dev/ (contents that are not JSON, never to be read),
// sentinel held-out sets, a sentinel control set, a sentinel state/ and a sentinel task held-out file, grown/index.json with
// hand cells and tier "neo" colonies, neo/LEDGER.json, neo/ABSORB.json, neo/ERA.json, neo/TRIALS.jsonl, neo/sources.json,
// neo/frontier-seeds.json, neo/frontier.json, neo/MEASURE.json (the last snapshot), neo/know/ (a knowledge index and packs),
// bench/verdicts/ladder.json, and stub children for judge/baseline.mjs, grow/neo.mjs and grow/teach.mjs that log each call
// to calls.log. The measure runs with --root <tmp>, so nothing here touches the real grown/, neo/, state/ or a held-out set,
// and nothing reaches a network (the measure has none). No test depends on what the tree's grown/ or neo/ hold today.
// What it holds the measure to, one test or more per rule: the row's keys and values part by part, append only, classes by
// NAME, one baseline child per class with its --out outside state/, the --out rows counted by who answered and never
// copied, never opening a held-out set, the control set, state/ or a task's held-out file (refused, not merely avoided),
// every temporary directory removed, a part that cannot be read is null with a blocked line and the row still appended,
// an absent input null with no blocked line, the mean taken only over every class, neo from its three sources, ladder
// copied not recomputed, the parts orthogonal, velocity, plateau, regressions, knowledge, trials, sources, frontier,
// bodies, the self-made probes, --max-ms, the bounded readers (a torn line, a missing file, a huge series, a clock that
// went backwards), series last minus first, usage exits, the files it writes, and no model, socket or fetch anywhere.
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
const ROW_KEYS = ['at', 'era', 'generation', 'locked', 'neo', 'generated', 'absorbed', 'syllabus', 'ladder',
  'velocity', 'plateau', 'regressions', 'knowledge', 'trials', 'sources', 'frontier', 'bodies', 'probes', 'ms', 'partMs', 'blocked'];
const PARTS = ['locked', 'neo', 'generated', 'absorbed', 'syllabus', 'ladder', 'velocity', 'plateau', 'regressions', 'knowledge', 'trials', 'sources', 'frontier', 'bodies', 'probes'];
const OLD_PARTS = ['locked', 'neo', 'generated', 'absorbed', 'syllabus', 'ladder'];
const CLASSES = ['alpha', 'beta', 'gamma'];
const SCORES = { alpha: 0.25, beta: 0.5, gamma: 1 };
const HELD_N = { alpha: 3, beta: 4, gamma: 5 };
// never to be read by the measure (the test's own list: a mutant of the module's list does not weaken it)
const FORBIDDEN = [/^judge\/heldout(?:\/|$)/, /^judge\/control\.jsonl$/, /^state(?:\/|$)/, /^neo\/tasks\/[^/]+\/heldout\.jsonl$/, /^judge\/dev\/.+/];
const SENTINELS = ['HELDOUT-SENTINEL', 'CONTROL-SENTINEL', 'STATE-SENTINEL', 'TASK-HELDOUT-SENTINEL', 'DEV-SENTINEL', 'GOT-SENTINEL', 'PACK-CELL-SENTINEL'];
const LADDER_AT = '2026-10-01T08:02:04.463Z';
const HOUR = 3600 * 1000;
const ago = (ms) => new Date(Date.now() - ms).toISOString();

const INDEX = {
  generation: 3,
  cells: [
    { id: 'hand-direct-g1', class: 'alpha', generation: 1, lane: 'direct', file: 'cells/hand-direct-g1.mjs', heldout: { score: 1, n: 12 } },
    { id: 't-one-neo-g1', class: 't-one', task: 't-one', generation: 1, lane: 'neo', tier: 'neo', file: 'cells/t-one-neo-g1.mjs', heldout: { score: 0.4, n: 10, ok: 4 } },
    { id: 't-two-neo-g2', class: 't-two', task: 't-two', generation: 2, lane: 'neo', tier: 'neo', file: 'cells/t-two-neo-g2.mjs', heldout: { score: 0.5, n: 12, ok: 6 } },
    { id: 't-one-neo-g3', class: 't-one', task: 't-one', generation: 3, lane: 'neo', tier: 'neo', file: 'cells/t-one-neo-g3.mjs', heldout: { score: 1, n: 10, ok: 10 }, know: true },
  ],
};
const PROBED_TASK = 'countries-country-to-capital'; // opened already: its pair is not proposed
const LEDGER = { tasks: [{ task: 't-one', generation: 1 }, { task: 't-two', generation: 2 }, { task: 't-three', generation: 3 }, { task: PROBED_TASK, generation: 3 }, 'not a row'], generated: 4242 };
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
/** neo/ERA.json: era 4 is three days old (outside the 24 hours), eras 5 and 6 inside; era 6 is the newest. */
const eraDoc = () => ({
  era: 6,
  eras: [
    { era: 4, at: ago(72 * HOUR), ms: 30000, grown: [{ task: 't-one' }], body: 'github' },
    { era: 5, at: ago(2 * HOUR), ms: 60000, grown: [{ task: 't-one' }, { task: 't-two' }, { task: 't-three' }], workers: 4, body: 'github' },
    { era: 6, at: ago(1 * HOUR), ms: 120000, grown: [{ task: 't-one' }, { task: 't-two' }], body: 'phone' },
  ],
  lastGrown: {},
});
const TRIALS = [
  { at: '2026-10-01T00:00:00Z', era: 1, kind: 'genome', change: 'x', before: 0.1, after: 0.2, kept: true },
  { at: '2026-10-01T00:01:00Z', era: 1, kind: 'genome', change: 'y', before: 0.2, after: 0.1, kept: false },
  { at: '2026-10-01T00:02:00Z', era: 2, kind: 'macro', change: 'z', kept: true },
  { at: '2026-10-01T00:03:00Z', era: 2, kind: 'BAD KIND', kept: false },
  'not json',
  { at: '2026-10-01T00:04:00Z', era: 2, kind: 'genome' },
];
const SOURCES_DOC = { about: 'x', sources: [{ id: 'a', domain: 'geo' }, { id: 'b', domain: 'Geo' }, { id: 'c', domain: 'time' }, { id: 'a', domain: 'geo' }, 'x'] };
const FRONTIER = { about: 'x', seeds: [{ url: 'u1' }, { url: 'u2' }, { url: 'u3' }] };
const FRONTIER_STATE = { v: 1, queue: [{ u: 'a' }, { u: 'b' }], seen: ['0123456789abcdef'], repos: { 'o/r': {}, 'o/s': {} }, added: [], counts: {} };
/** The last snapshot: t-one held, t-two fell from 8 of 12, t-gone's colony is gone. */
const SNAPSHOT = { at: '2026-10-01T00:00:00.000Z', era: 6, tasks: { 't-one': [10, 10], 't-two': [8, 12], 't-gone': [3, 5], 't-zero': [0, 4] } };
/** A knowledge pack: country and capital unique over 40 rows, code only three values (an ambiguous key). */
const PACK = {
  id: 'countries', from: 'test', sha: 'pack-sha', columns: ['country', 'capital', 'code'],
  rows: Array.from({ length: 40 }, (_, i) => ['Country ' + i + ' PACK-CELL-SENTINEL', 'Capital ' + i, 'C' + (i % 3)]), at: '2026-10-01T00:00:00Z',
};
const KNOW_INDEX = { packs: [{ id: 'countries', columns: PACK.columns, rows: 40, sha: 'pack-sha' }, { id: 'tiny', columns: ['a', 'b'], rows: 5, sha: 't' }] };

/** The row's parts on the default stub root, measured as era 7. */
const EXPECT = {
  locked: {
    classes: 3, mean: 0.5833, byClass: { alpha: 0.25, beta: 0.5, gamma: 1 }, knowledge: ['stub-pack'], ruler: 'organism',
    via: {
      alpha: { own: [1, 1], other: [0, 1], ask: [0, 1], by: ['other-direct-g2'] },
      beta: { own: [2, 2], other: [0, 1], ask: [0, 1], by: ['other-direct-g2'] },
      gamma: { own: [5, 5], other: [0, 0], ask: [0, 0], by: [] },
    },
  },
  neo: { tasks: 4, colonies: 2, cells: 1234, mastered: 1, serving: null, heldout: { ok: 16, n: 22, score: 0.7273 }, ruler: 'colony' },
  generated: 4242,
  absorbed: { bytes: 777, rows: 55, sources: 2 },
  syllabus: { skills: 386, opened: 3, pending: 380 },
  ladder: { composite: 0.687507, at: LADDER_AT },
  velocity: { cellsPerSecond: null, tasksPerMinute: 1, masteredPerEra: null, eraMs: 120000, workers: null, era: 6 },
  plateau: 0,
  regressions: { count: 2, tasks: [{ task: 't-gone', before: [3, 5], after: null }, { task: 't-two', before: [8, 12], after: [6, 12] }] },
  knowledge: { mastered: { backed: 1, plain: 0 }, colonies: { backed: 1, plain: 1 } },
  trials: { rows: 4, kept: 2, reverted: 2, byKind: { genome: { kept: 1, reverted: 1 }, macro: { kept: 1, reverted: 0 }, other: { kept: 0, reverted: 1 } }, skipped: 2, truncated: false },
  sources: { registry: 3, domains: 2 },
  frontier: { seeds: 3, queue: 2, seen: 1, repos: 2, added: 0 },
  bodies: { eras: 2, by: { github: 1, phone: 1 } },
  probes: { proposed: 3, total: 3, opened: 0 },
};

const PRELUDE = `import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const log = (name) => fs.appendFileSync(path.join(ROOT, 'calls.log'), JSON.stringify([name, ...process.argv.slice(2)]) + '\\n');
const has = (v, x) => String(v || '').split(',').includes(x);
`;
const STUBS = {
  // the real baseline reads the class's held-out set and writes state/grow/baseline/<cls>.json unless --out says otherwise;
  // its document's rows: the right ones answered by the class's own cell, then one by another cell, the rest by ask()
  'judge/baseline.mjs': `log('baseline');
const cls = process.argv[2];
const scores = Object.assign(${JSON.stringify(SCORES)}, JSON.parse(process.env.STUB_SCORES || '{}'));
if (has(process.env.STUB_FAIL, cls)) { console.log('baseline failed: stub ' + cls); process.exit(1); }
if (has(process.env.STUB_HANG, cls)) setInterval(() => {}, 1000);
else {
  const n = fs.readFileSync(path.join(ROOT, 'judge', 'heldout', cls + '.jsonl'), 'utf8').trim().split('\\n').length;
  const ok = Math.round(scores[cls] * n);
  const i = process.argv.indexOf('--out');
  const out = i > 0 ? process.argv[i + 1] : path.join(ROOT, 'state', 'grow', 'baseline', cls + '.json');
  const rows = Array.from({ length: n }, (_, k) => ({ q: 'HELDOUT-SENTINEL-' + k, got: 'GOT-SENTINEL', ok: k < ok, route: 'direct', via: k < ok ? 'grown:' + cls + '-direct-g1' : k === ok ? 'grown:other-direct-g2' : 'ask' }));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(has(process.env.STUB_VIA_BAD, cls) ? { class: cls } : { class: cls, rows }));
  console.log('a line before the result');
  console.log(JSON.stringify({ class: cls, n, ok, score: scores[cls], knowledge: process.env.STUB_KNOWLEDGE || 'stub-pack', out }));
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
  put(root, 'neo/ERA.json', eraDoc());
  put(root, 'neo/TRIALS.jsonl', jsonl(TRIALS));
  put(root, 'neo/sources.json', SOURCES_DOC);
  put(root, 'neo/frontier-seeds.json', FRONTIER);
  put(root, 'neo/frontier.json', FRONTIER_STATE);
  put(root, 'neo/MEASURE.json', SNAPSHOT);
  put(root, 'neo/know/INDEX.json', KNOW_INDEX);
  put(root, 'neo/know/countries.json', PACK);
  put(root, 'neo/know/tiny.json', { id: 'tiny', columns: ['a', 'b'], rows: [['x', 'y']] });
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
const probesOf = (root) => { try { return read(path.join(root, 'neo', 'probes.jsonl')).split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l)); } catch { return []; } };
const partsOf = (row) => Object.fromEntries(PARTS.map((p) => [p, row[p]]));
const relTo = (root, p) => path.relative(root, path.resolve(root, String(p))).split(path.sep).join('/').toLowerCase();
const measureAt = (root, o = {}) => M.measure(root, { env: envOf(), era: 7, ...o });
const NULL_VELOCITY = { cellsPerSecond: null, tasksPerMinute: null, masteredPerEra: null, eraMs: null, workers: null, era: null };

// ---- run: the row
test('run: one JSON line, the row printed is the row appended, every part from its own source', () => {
  const root = makeRoot();
  try {
    const r = cli(root, ['run', '--era', '7', '--gen', '4']);
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.lines.length, 1, 'one line on stdout: ' + r.stdout);
    assert.equal(r.stderr, '');
    assert.deepEqual(Object.keys(r.json), ROW_KEYS);
    assert.deepEqual([...M.ROW_KEYS], ROW_KEYS);
    assert.deepEqual([...M.PARTS], PARTS);
    assert.equal(r.json.era, 7);
    assert.equal(r.json.generation, 4);
    assert.deepEqual(partsOf(r.json), EXPECT);
    assert.deepEqual(r.json.blocked, []);
    assert.ok(Number.isInteger(r.json.ms) && r.json.ms >= 0, 'ms ' + r.json.ms);
    assert.deepEqual(Object.keys(r.json.partMs), PARTS);
    for (const p of PARTS) assert.ok(Number.isInteger(r.json.partMs[p]) && r.json.partMs[p] >= 0 && r.json.partMs[p] <= r.json.ms, p + ' ' + r.json.partMs[p]);
    assert.ok(!Number.isNaN(Date.parse(r.json.at)) && r.json.at.endsWith('Z'), 'at ' + r.json.at);
    const text = read(path.join(root, 'grown', 'measure.jsonl'));
    assert.equal(text, r.lines[0] + '\n', 'the file holds exactly the printed row');
    for (const s of SENTINELS) assert.ok(!r.stdout.includes(s), 'the row carries ' + s);
  } finally { clean(root); }
});

test('run: era and generation are null unless given; --era 0 is an era; plateau needs an era', () => {
  const root = makeRoot();
  try {
    const a = cli(root, ['run']);
    assert.equal(a.code, 0, a.stderr);
    assert.equal(a.json.era, null);
    assert.equal(a.json.generation, null);
    assert.equal(a.json.plateau, null, 'no era: no eras since');
    assert.equal(a.json.velocity.era, 6, 'no era: the newest era row');
    const b = cli(root, ['run', '--era', '0']);
    assert.equal(b.code, 0, b.stderr);
    assert.equal(b.json.era, 0);
    assert.equal(b.json.generation, null);
    assert.equal(b.json.plateau, 0);
  } finally { clean(root); }
});

test('append only: the bytes before a run are never rewritten; a torn last line gets a newline first and stays skipped', () => {
  const root = makeRoot();
  try {
    const before = '{"at":"2026-01-01T00:00:00.000Z","old":1}\n{"at":"2026-01-02T00:00:00.000Z","old":2}\n{"at":"2026-01-03T00:0';
    put(root, 'grown/measure.jsonl', before);
    const a = cli(root, ['run', '--era', '1']);
    assert.equal(a.code, 0, a.stderr);
    assert.deepEqual(a.json.blocked, [], 'a torn line of the series is not a blocked part');
    const t1 = read(path.join(root, 'grown', 'measure.jsonl'));
    assert.equal(t1, before + '\n' + a.lines[0] + '\n', 'the earlier bytes stand, a newline added');
    const b = cli(root, ['run', '--era', '2']);
    assert.equal(b.code, 0, b.stderr);
    const t2 = read(path.join(root, 'grown', 'measure.jsonl'));
    assert.equal(t2, t1 + b.lines[0] + '\n', 'the second run appends after the first, nothing rewritten');
    const rr = M.readRows(root);
    assert.equal(rr.skipped, 1, 'the torn line is skipped, not read');
    assert.deepEqual(rr.rows.map((x) => x.era ?? x.old), [1, 2, 1, 2]);
    assert.deepEqual(Object.keys(rr.rows[2]), Object.keys(rr.rows[3]), 'the same measures every time');
    const s = cli(root, ['series']);
    assert.equal(s.json.rows, 4);
    assert.equal(s.json.skipped, 1);
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

test('locked: a class that does not measure has a null score and no via, the mean is not taken, a blocked line, the row still appended', () => {
  const root = makeRoot();
  try {
    const r = cli(root, ['run', '--era', '7'], { STUB_FAIL: 'beta' });
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(r.json.locked, { ...EXPECT.locked, mean: null, byClass: { alpha: 0.25, beta: null, gamma: 1 }, via: { ...EXPECT.locked.via, beta: null } });
    assert.deepEqual(r.json.blocked, ['locked: beta: node judge/baseline.mjs beta exited 1: baseline failed: stub beta', 'locked: mean not taken: 1 of 3 classes did not measure']);
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

test('--max-ms: every child timeout is cut to what is left of it (never under the floor); the flag is bounded', () => {
  const root = makeRoot();
  try {
    const t0 = Date.now();
    const r = cli(root, ['run', '--max-ms', '2500'], { STUB_HANG: 'gamma' });
    assert.equal(r.code, 0, r.stderr);
    assert.ok(Date.now() - t0 < 60000, 'the default 900000 ms timeout did not hold the run');
    const line = r.json.blocked.find((b) => b.startsWith('locked: gamma: '));
    const m = /timed out after (\d+) ms$/.exec(line || '');
    assert.ok(m, r.json.blocked.join(' | '));
    assert.ok(Number(m[1]) >= M.BOUNDS.CHILD_FLOOR_MS && Number(m[1]) <= 2500, 'the child was given ' + m[1] + ' ms');
    for (const v of ['999', String(M.LIMITS.timeoutMs + 1), 'soon']) {
      const bad = cli(root, ['run', '--max-ms', v]);
      assert.equal(bad.code, 2, v + ': ' + bad.stderr);
    }
    assert.equal(cli(root, ['series', '--max-ms', '5000']).code, 2, 'series takes no --max-ms');
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

// ---- the two rulers and locked.via (the disagreement of 2026-10-01)
test('rulers: locked is the organism end to end, neo the colony alone, each named in the row and in RULERS', () => {
  assert.deepEqual(Object.keys(M.RULERS).sort(), ['colony', 'organism']);
  for (const k of Object.keys(M.RULERS)) assert.ok(typeof M.RULERS[k] === 'string' && M.RULERS[k].length > 40, k);
  assert.match(M.RULERS.organism, /ask\(\)/);
  assert.match(M.RULERS.colony, /alone/);
  assert.equal(EXPECT.locked.ruler, 'organism');
  assert.equal(EXPECT.neo.ruler, 'colony');
});

test('locked.via: the --out rows counted by who answered (own cell, another cell named, ask), never a prompt or an answer copied', () => {
  const root = makeRoot();
  try {
    const r = cli(root, ['run', '--era', '7'], { STUB_VIA_BAD: 'alpha' });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.locked.byClass.alpha, 0.25, 'the score stands');
    assert.equal(r.json.locked.mean, EXPECT.locked.mean, 'the mean is the scores, not the counts');
    assert.equal(r.json.locked.via.alpha, null);
    assert.deepEqual(r.json.locked.via.beta, EXPECT.locked.via.beta);
    assert.deepEqual(r.json.blocked, ['locked: alpha: the baseline --out document holds no { rows: [{ ok, via }] }: its rows are not counted']);
    for (const s of SENTINELS) assert.ok(!r.stdout.includes(s), 'the row carries ' + s);
  } finally { clean(root); }
  const doc = { rows: [
    { q: 'HELDOUT-SENTINEL', got: 'GOT-SENTINEL', ok: true, via: 'grown:math-direct-g1' },
    { ok: false, via: 'grown:math-direct-g2-3' },
    { ok: true, via: 'grown:data-direct-g2' },
    { ok: false, via: 'grown:math-extra-direct-g1' },
    { ok: true, via: 'ask' },
    { ok: false },
    { ok: false, via: 'grown:NOT AN ID' },
  ] };
  const v = M.viaOf('math', doc);
  assert.deepEqual(v, { own: [1, 2], other: [1, 3], ask: [1, 2], by: ['data-direct-g2', 'math-extra-direct-g1'] }, 'math-extra-direct-g1 is another class; a bad id is counted, not named');
  assert.ok(!JSON.stringify(v).includes('SENTINEL'));
  assert.equal(M.viaOf('math', { rows: [{ ok: 'yes', via: 'ask' }] }), null, 'ok must be a boolean');
  assert.equal(M.viaOf('math', { class: 'math' }), null);
  assert.equal(M.viaOf('math', null), null);
  assert.deepEqual(M.viaOf('math', { rows: [] }), { own: [0, 0], other: [0, 0], ask: [0, 0], by: [] });
  const many = { rows: Array.from({ length: 14 }, (_, i) => ({ ok: false, via: 'grown:c' + String(i).padStart(2, '0') + '-direct-g1' })) };
  const mv = M.viaOf('math', many);
  assert.deepEqual(mv.other, [0, 14]);
  assert.equal(mv.by.length, M.BOUNDS.VIA_BY);
  assert.deepEqual(mv.by, many.rows.slice(0, M.BOUNDS.VIA_BY).map((r) => r.via.slice(6)), 'sorted, the first VIA_BY');
  assert.equal(M.ownCell('math', 'math-direct-g12'), true);
  assert.equal(M.ownCell('math', 'math-neo-g3-2'), true);
  assert.equal(M.ownCell('math', 'math-direct-g'), false);
  assert.equal(M.ownCell('math', 'mathx-direct-g1'), false);
  assert.equal(M.ownCell('math', 'xmath-direct-g1'), false);
  assert.equal(M.ownCell('Bad.Class', 'Bad.Class-direct-g1'), false, 'a name that is not a class is never a pattern');
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
    const { value: row, seen } = await spyReads(() => measureAt(root, { jobs: 2 }));
    assert.deepEqual(partsOf(row), EXPECT);
    const inRoot = seen.map((p) => relTo(root, p)).filter((p) => !p.startsWith('..'));
    assert.ok(inRoot.length > 0, 'the spy saw the measure read its sources');
    for (const want of ['neo/know/index.json', 'neo/know/countries.json', 'neo/trials.jsonl', 'neo/era.json', 'neo/measure.json']) assert.ok(inRoot.includes(want), 'read ' + want);
    const bad = inRoot.filter((p) => FORBIDDEN.some((re) => re.test(p)));
    assert.deepEqual(bad, [], 'opened: ' + bad.join(', '));
    const text = JSON.stringify(row) + read(path.join(root, 'neo', 'probes.jsonl')) + read(path.join(root, 'neo', 'MEASURE.json'));
    for (const s of SENTINELS) assert.ok(!text.includes(s), 'a written file carries ' + s);
    // the guard itself: each forbidden path is a throw, an allowed one is read
    for (const p of ['judge/heldout/alpha.jsonl', 'judge/heldout', 'judge/control.jsonl', 'state/keep.txt', 'state', 'neo/tasks/t-one/heldout.jsonl', 'Judge/HeldOut/alpha.jsonl', 'neo/../judge/heldout/alpha.jsonl', path.join(root, 'state', 'keep.txt')]) {
      assert.throws(() => M.readGuarded(root, p), /refused/, p);
      assert.throws(() => M.scanLines(root, p, () => {}), /refused/, 'scanLines ' + p);
      assert.match(M.readJsonPart(root, p).why, /^refused/, 'readJsonPart ' + p);
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

/** Every file under a root with its bytes, by posix path (calls.log left out: the stubs write it). */
function filesOf(root) {
  const out = new Map();
  for (const f of fs.readdirSync(root, { recursive: true }).map(String)) {
    const abs = path.join(root, f);
    if (fs.statSync(abs).isFile()) out.set(f.split(path.sep).join('/'), fs.readFileSync(abs, 'utf8'));
  }
  out.delete('calls.log');
  return out;
}

test('writes: grown/measure.jsonl appended, neo/MEASURE.json replaced whole, neo/probes.jsonl appended, and nothing else', () => {
  const root = makeRoot();
  try {
    put(root, 'neo/probes.jsonl', '{"pack":"other","key":"a","value":"b","task":"other-a-to-b"}\n');
    const before = filesOf(root);
    const r = cli(root, ['run', '--era', '7']);
    assert.equal(r.code, 0, r.stderr);
    const after = filesOf(root);
    const changed = [...after.keys()].filter((k) => before.get(k) !== after.get(k)).sort();
    assert.deepEqual(changed, ['grown/measure.jsonl', 'neo/MEASURE.json', 'neo/probes.jsonl']);
    assert.deepEqual([...before.keys()].filter((k) => !after.has(k)), [], 'nothing removed');
    assert.ok(after.get('neo/probes.jsonl').startsWith(before.get('neo/probes.jsonl')), 'probes appended, never rewritten');
    assert.deepEqual(JSON.parse(after.get('neo/MEASURE.json')), { at: r.json.at, era: 7, tasks: { 't-one': [10, 10], 't-two': [6, 12] } });
    assert.deepEqual(fs.readdirSync(path.join(root, 'neo')).filter((f) => f.endsWith('.tmp')), [], 'no temporary file left beside the snapshot');
    assert.equal(r.json.probes.total, 4, 'the probe already there is counted');
  } finally { clean(root); }
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

test('neo: tasks from the ledger, colonies and cells from the status line, mastered, serving and heldout from tier "neo" rows only', async () => {
  const root = makeRoot();
  try {
    const run = async () => (await measureAt(root)).neo;
    assert.deepEqual(await run(), EXPECT.neo);
    // a row with score and n but no ok: ok is score times n; it answers every row, so it is mastered
    put(root, 'grown/index.json', { generation: 3, cells: [...INDEX.cells, { id: 't-four-neo-g3', class: 't-four', tier: 'neo', heldout: { score: 1, n: 8 } }] });
    assert.deepEqual(await run(), { ...EXPECT.neo, mastered: 2, heldout: { ok: 24, n: 30, score: 0.8 } });
    // serving: the colonies the gate lets answer, once any row carries serve (c2); a later row of a task replaces it
    put(root, 'grown/index.json', { generation: 3, cells: [...INDEX.cells, { id: 't-four-neo-g3', task: 't-four', tier: 'neo', heldout: { ok: 1, n: 2 }, serve: true }, { id: 't-five-neo-g3', task: 't-five', tier: 'neo', heldout: { ok: 1, n: 2 }, serve: false }] });
    assert.deepEqual(await run(), { ...EXPECT.neo, serving: 1, heldout: { ok: 18, n: 26, score: 0.6923 } });
    // no colony yet: zero of zero is no score, not a score of zero
    put(root, 'grown/index.json', { generation: 3, cells: [INDEX.cells[0]] });
    assert.deepEqual(await run(), { ...EXPECT.neo, mastered: 0, heldout: { ok: 0, n: 0, score: null } });
    // a tier "neo" row that cannot be read voids the part (a sum over fewer colonies is another ruler)
    put(root, 'grown/index.json', { generation: 3, cells: [...INDEX.cells, { id: 'broken-neo-g3', tier: 'neo', heldout: { score: 'high' } }] });
    const row = await measureAt(root);
    assert.equal(row.neo, null);
    assert.deepEqual(row.blocked, ['neo: grown/index.json has 1 tier "neo" row without a readable heldout { score, n, ok }']);
    for (const p of ['plateau', 'regressions', 'knowledge']) assert.equal(row[p], null, p + ' reads the same colonies');
    // a ledger that is not JSON voids neo and generated, and nothing else
    put(root, 'grown/index.json', INDEX);
    put(root, 'neo/LEDGER.json', '{ not json');
    const l = await measureAt(root);
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
    put(root, 'neo/LEDGER.json', { generated: 5 });
    assert.deepEqual(M.generatedPart(root), { value: null, blocked: ['generated: neo/LEDGER.json is not { tasks: [..], generated }'] });
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
    put(root, 'bench/verdicts/ladder.json', { ...LADDER, at: 5 });
    assert.deepEqual(M.ladderPart(root), { value: { composite: 0.687507, at: null }, blocked: ['ladder: bench/verdicts/ladder.json carries no at'] });
    put(root, 'bench/verdicts/ladder.json', { at: LADDER_AT, days: [] });
    assert.deepEqual(M.ladderPart(root), { value: null, blocked: ['ladder: bench/verdicts/ladder.json carries no composite'] });
    fs.rmSync(path.join(root, 'bench', 'verdicts', 'ladder.json'));
    assert.deepEqual(M.ladderPart(root), { value: null, blocked: ['ladder: bench/verdicts/ladder.json is not there'] });
  } finally { clean(root); }
});

// ---- orthogonal parts, nothing readable
test('orthogonal: breaking one source changes its own parts and no other; an absent optional input is null with no blocked line', async () => {
  const base = makeRoot();
  let ref;
  try { ref = partsOf(await measureAt(base)); } finally { clean(base); }
  assert.deepEqual(ref, EXPECT);
  const gone = (rel) => (r) => fs.rmSync(path.join(r, rel), { recursive: true, force: true });
  const notJson = (rel) => (r) => put(r, rel, '{');
  // [what, break it, the parts it changes (null unless given), the parts its blocked lines name]
  const cases = [
    ['judge/baseline.mjs gone', gone('judge/baseline.mjs'), { locked: null }, ['locked']],
    ['grow/neo.mjs gone', gone('grow/neo.mjs'), { neo: null }, ['neo']],
    ['grown/index.json not JSON', notJson('grown/index.json'), { neo: null, plateau: null, regressions: null, knowledge: null }, ['neo']],
    ['neo/LEDGER.json not JSON', notJson('neo/LEDGER.json'), { neo: null, generated: null, probes: null }, ['neo', 'generated', 'probes']],
    ['neo/ABSORB.json not JSON', notJson('neo/ABSORB.json'), { absorbed: null }, ['absorbed']],
    ['grow/teach.mjs gone', gone('grow/teach.mjs'), { syllabus: null }, ['syllabus']],
    ['bench/verdicts/ladder.json not JSON', notJson('bench/verdicts/ladder.json'), { ladder: null }, ['ladder']],
    ['neo/ERA.json not JSON', notJson('neo/ERA.json'), { velocity: NULL_VELOCITY, bodies: null }, ['velocity', 'bodies']],
    ['neo/ERA.json gone', gone('neo/ERA.json'), { velocity: NULL_VELOCITY, bodies: null }, []],
    ['neo/MEASURE.json not JSON', notJson('neo/MEASURE.json'), { regressions: null }, ['regressions']],
    ['neo/MEASURE.json gone', gone('neo/MEASURE.json'), { regressions: null }, []],
    ['neo/TRIALS.jsonl gone', gone('neo/TRIALS.jsonl'), { trials: null }, []],
    ['neo/sources.json not JSON', notJson('neo/sources.json'), { sources: null }, ['sources']],
    ['neo/sources.json gone', gone('neo/sources.json'), { sources: null }, []],
    ['neo/frontier-seeds.json not JSON', notJson('neo/frontier-seeds.json'), { frontier: { ...EXPECT.frontier, seeds: null } }, ['frontier']],
    ['the frontier files gone', (r) => { gone('neo/frontier-seeds.json')(r); gone('neo/frontier.json')(r); }, { frontier: null }, []],
    ['neo/know/INDEX.json not JSON', notJson('neo/know/INDEX.json'), { probes: null }, ['probes']],
    ['neo/know/ gone', gone('neo/know'), { probes: null }, []],
  ];
  for (const [what, breakIt, hit, named] of cases) {
    const root = makeRoot();
    try {
      breakIt(root);
      const row = await measureAt(root);
      for (const p of PARTS) {
        if (Object.hasOwn(hit, p)) assert.deepEqual(row[p], hit[p], what + ': ' + p);
        else assert.deepEqual(row[p], ref[p], what + ': ' + p + ' is untouched');
      }
      assert.deepEqual([...new Set(row.blocked.map((b) => b.split(':')[0]))].sort(), [...named].sort(), what + ': ' + row.blocked.join(' | '));
    } finally { clean(root); }
  }
});

test('a root where nothing can be read: every part null (velocity all null), a blocked line for each required part, the row still appended', () => {
  const root = path.join(TMP, 'empty-' + ++seq);
  fs.mkdirSync(root, { recursive: true });
  try {
    const r = cli(root, ['run', '--gen', '2', '--era', '3']);
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(Object.keys(r.json), ROW_KEYS);
    for (const p of PARTS) assert.deepEqual(r.json[p], p === 'velocity' ? NULL_VELOCITY : null, p);
    assert.deepEqual([...new Set(r.json.blocked.map((b) => b.split(':')[0]))].sort(), [...OLD_PARTS].sort(), r.json.blocked.join(' | '));
    assert.deepEqual(rowsOf(root), [r.json]);
    assert.deepEqual(fs.readdirSync(root, { recursive: true }).map((f) => String(f).split(path.sep).join('/')).sort(), ['grown', 'grown/measure.jsonl'], 'no snapshot without colonies, no probes without packs');
  } finally { clean(root); }
});

test('a part that throws is null with a blocked line and every other part still runs', async () => {
  const root = makeRoot();
  const saved = fs.mkdtempSync;
  try {
    fs.mkdtempSync = () => { throw new Error('mkdtemp refused by the test'); };
    const row = await measureAt(root);
    fs.mkdtempSync = saved;
    assert.equal(row.locked, null);
    assert.deepEqual(row.blocked, ['locked: the part failed (mkdtemp refused by the test)']);
    for (const p of PARTS.filter((x) => x !== 'locked')) assert.deepEqual(row[p], EXPECT[p], p);
    assert.equal(M.readRows(root).rows.length, 1);
  } finally { fs.mkdtempSync = saved; clean(root); }
});

// ---- velocity (c7)
test('velocity: the era row (this era, else the newest) gives eraMs, tasksPerMinute and workers; an absent ERA.json is all null', () => {
  const root = makeRoot();
  try {
    const at = new Date().toISOString();
    const v = (era, tail) => M.velocityPart(M.readsOf(root), { at, era, tail });
    assert.deepEqual(v(5), { value: { cellsPerSecond: null, tasksPerMinute: 3, masteredPerEra: null, eraMs: 60000, workers: 4, era: 5 }, blocked: [] });
    assert.deepEqual(v(9).value, { ...NULL_VELOCITY, tasksPerMinute: 1, eraMs: 120000, era: 6 }, 'no row of era 9: the newest');
    assert.deepEqual(v(null).value, { ...NULL_VELOCITY, tasksPerMinute: 1, eraMs: 120000, era: 6 });
    assert.deepEqual(v(4).value, { ...NULL_VELOCITY, tasksPerMinute: 2, eraMs: 30000, era: 4 });
    const doc = eraDoc();
    doc.eras.push({ era: 8, at: ago(0), ms: 0, grown: [{ task: 'x' }], workers: 0 }, { era: 7, at: ago(0), ms: 90000, grown: 'many', workers: -1 }, { era: 'nine', ms: 1 });
    put(root, 'neo/ERA.json', doc);
    assert.deepEqual(v(8).value, { ...NULL_VELOCITY, eraMs: 0, workers: 0, era: 8 }, 'ms 0: no rate, never a division by zero');
    assert.deepEqual(v(7).value, { ...NULL_VELOCITY, eraMs: 90000, era: 7 }, 'grown not a list, workers not a count: null');
    assert.equal(v(null).value.era, 8, 'the newest by era, not by position; a row without an integer era is not a row');
    fs.rmSync(path.join(root, 'neo', 'ERA.json'));
    assert.deepEqual(v(5), { value: NULL_VELOCITY, blocked: [] });
    put(root, 'neo/ERA.json', { era: 3 });
    assert.deepEqual(v(5), { value: NULL_VELOCITY, blocked: ['velocity: neo/ERA.json is not { era, eras: [..] }'] });
  } finally { clean(root); }
});

test('velocity: cellsPerSecond from the ledger delta over the wall seconds since the last row; a clock that went backwards or a count that fell is blocked', () => {
  const root = makeRoot();
  try {
    const T0 = Date.parse('2026-10-01T12:00:00.000Z');
    const iso = (ms) => new Date(T0 + ms).toISOString();
    const v = (at, tail, era = null) => M.velocityPart(M.readsOf(root), { at, era, tail: { rows: tail } });
    assert.equal(v(iso(10000), [{ at: iso(0), generated: 4000 }]).value.cellsPerSecond, 24.2, '(4242 - 4000) / 10 s');
    assert.equal(v(iso(10000), [{ at: iso(0), generated: 4000 }, { at: iso(5000), generated: null }, { at: 'not a time', generated: 1 }]).value.cellsPerSecond, 24.2, 'the last row that holds a count and a time');
    assert.equal(v(iso(3000), [{ at: iso(0), generated: 4242 }]).value.cellsPerSecond, 0, 'nothing generated is 0, not null');
    const back = v(iso(-1000), [{ at: iso(0), generated: 4000 }]);
    assert.equal(back.value.cellsPerSecond, null);
    assert.deepEqual(back.blocked, ['velocity: the clock did not move forward: this row at ' + iso(-1000) + ', the last row at ' + iso(0) + ': no cells per second']);
    const still = v(iso(0), [{ at: iso(0), generated: 4000 }]);
    assert.equal(still.value.cellsPerSecond, null);
    assert.equal(still.blocked.length, 1, 'no time passed: no rate');
    const fell = v(iso(1000), [{ at: iso(0), generated: 5000 }]);
    assert.equal(fell.value.cellsPerSecond, null);
    assert.deepEqual(fell.blocked, ['velocity: the ledger generated count fell from 5000 to 4242: no cells per second']);
    assert.deepEqual(v(iso(1000), []).blocked, [], 'the first row has no delta');
    put(root, 'neo/LEDGER.json', { tasks: [] });
    assert.equal(v(iso(10000), [{ at: iso(0), generated: 4000 }]).value.cellsPerSecond, null, 'a ledger without a count');
  } finally { clean(root); }
});

test('velocity: masteredPerEra over the eras since the last row that holds mastered; an era that went backwards is blocked', () => {
  const root = makeRoot();
  try {
    const at = new Date().toISOString();
    const v = (era, tail) => M.velocityPart(M.readsOf(root), { at, era, tail: { rows: tail } });
    const row = (era, mastered) => ({ at: '2026-01-01T00:00:00.000Z', era, neo: { mastered } });
    assert.equal(v(7, [row(5, 0)]).value.masteredPerEra, 0.5, '(1 - 0) / 2');
    assert.equal(v(7, [row(4, 0), row(6, 3), { at: 'x', era: 6, neo: null }]).value.masteredPerEra, -2, 'a fall is a negative rate, from the last row that holds the count');
    assert.equal(v(8, [row(5, 0)]).value.masteredPerEra, 0.3333);
    const same = v(7, [row(7, 0)]);
    assert.equal(same.value.masteredPerEra, null);
    assert.deepEqual(same.blocked, [], 'the same era twice: no rate, nothing wrong');
    const back = v(7, [row(9, 0)]);
    assert.equal(back.value.masteredPerEra, null);
    assert.deepEqual(back.blocked, ['velocity: the era went backwards: this row is era 7, the last row era 9']);
    assert.equal(v(null, [row(5, 0)]).value.masteredPerEra, null, 'no era: no rate');
  } finally { clean(root); }
});

test('velocity, plateau and regressions over real runs: the second row reads the first', () => {
  const root = makeRoot();
  try {
    const a = cli(root, ['run', '--era', '7']);
    assert.equal(a.code, 0, a.stderr);
    put(root, 'neo/LEDGER.json', { ...LEDGER, generated: 5242 });
    put(root, 'grown/index.json', { ...INDEX, cells: [...INDEX.cells, { id: 't-two-neo-g4', task: 't-two', tier: 'neo', heldout: { ok: 12, n: 12 } }] });
    const b = cli(root, ['run', '--era', '8']);
    assert.equal(b.code, 0, b.stderr);
    assert.deepEqual(b.json.blocked, []);
    const dt = (Date.parse(b.json.at) - Date.parse(a.json.at)) / 1000;
    assert.equal(b.json.velocity.cellsPerSecond, Math.round((1000 / dt) * 1e4) / 1e4);
    assert.equal(b.json.velocity.masteredPerEra, 1);
    assert.equal(b.json.plateau, 0, 'the held-out total rose in this row');
    assert.deepEqual(b.json.regressions, { count: 0, tasks: [] }, 'read against the first run, not the seeded snapshot');
    const c = cli(root, ['run', '--era', '10']);
    assert.equal(c.json.plateau, 2, 'last rose at era 8');
    assert.equal(c.json.velocity.masteredPerEra, 0);
    assert.equal(c.json.velocity.cellsPerSecond, 0);
  } finally { clean(root); }
});

// ---- plateau (c7)
test('plateau: eras since the held-out total last rose; carried from the last row when the tail holds no rise; null when it cannot be known', () => {
  const root = makeRoot();
  try {
    const p = (era, rows, truncated = false) => M.plateauPart(M.readsOf(root), { era, tail: { rows, truncated } });
    const row = (era, ok, plateau) => ({ at: 'x', era, neo: { heldout: { ok } }, ...(plateau === undefined ? {} : { plateau }) });
    // this root's colonies hold 16 ok
    assert.deepEqual(p(7, [row(3, 10), row(5, 12)]), { value: 0, blocked: [] }, 'rose in this row');
    assert.equal(p(7, [row(3, 10), row(5, 16)]).value, 2, 'rose at era 5');
    assert.equal(p(7, [row(3, 20)]).value, 4, 'a fall is not a rise: since the first row');
    assert.equal(p(7, [row(3, 16), row(5, 16)]).value, 4, 'never rose in the whole series: since its first row');
    assert.equal(p(7, [row(3, 16, 10), row(5, 16)]).value, 14, 'carried: 10 at era 3, four eras on');
    assert.equal(p(7, [row(3, 16), row(5, 16)], true).value, null, 'a cut tail and nothing carried: unknown, never a guess');
    assert.equal(p(7, [row(3, 16, 2), row(5, 16)], true).value, 6, 'a cut tail with a carried plateau');
    assert.equal(p(7, [{ at: 'x', era: 5, neo: null }, { at: 'y', era: null, neo: { heldout: { ok: 99 } } }]).value, 0, 'rows without an era or a total are not points');
    assert.equal(p(7, []).value, 0, 'the first row');
    assert.deepEqual(p(null, [row(3, 10)]), { value: null, blocked: [] });
    assert.deepEqual(p(7, [row(3, 10), row(9, 16)]), { value: null, blocked: ['plateau: the era went backwards: this row is era 7, an earlier row a later era'] });
    put(root, 'grown/index.json', '{');
    assert.deepEqual(p(7, [row(3, 10)]), { value: null, blocked: [] }, 'the colonies cannot be read: neo says why');
  } finally { clean(root); }
});

// ---- regressions, knowledge, the snapshot
test('regressions: the tasks whose held-out fell since the last snapshot, named, the largest fall first, a vanished colony a fall to null', () => {
  const root = makeRoot();
  try {
    const r = () => M.regressionsPart(M.readsOf(root));
    assert.deepEqual(r(), { value: EXPECT.regressions, blocked: [] });
    put(root, 'neo/MEASURE.json', { at: 'x', era: 1, tasks: { 't-one': [9, 10], 't-two': [5, 12] } });
    assert.deepEqual(r().value, { count: 0, tasks: [] }, 'a rise is not a regression');
    put(root, 'neo/MEASURE.json', { at: 'x', era: 1, tasks: { 't-two': [3, 6], 't-one': [10, 10] } });
    assert.deepEqual(r().value, { count: 0, tasks: [] }, 'the same score over another n is not a fall');
    put(root, 'neo/MEASURE.json', { at: 'x', era: 1, tasks: { 'b-gone': [1, 2], 'a-gone': [1, 2], 't-two': [7, 12], bad: [3, 2], worse: 'x' } });
    assert.deepEqual(r().value.tasks.map((t) => t.task), ['a-gone', 'b-gone', 't-two'], 'ties by name; malformed entries are not tasks');
    const many = { at: 'x', era: 1, tasks: Object.fromEntries(Array.from({ length: 60 }, (_, i) => ['g' + String(i).padStart(2, '0'), [1, 1]])) };
    put(root, 'neo/MEASURE.json', many);
    const big = r().value;
    assert.equal(big.count, 60);
    assert.equal(big.tasks.length, M.BOUNDS.REGRESSIONS_NAMED);
    fs.rmSync(path.join(root, 'neo', 'MEASURE.json'));
    assert.deepEqual(r(), { value: null, blocked: [] }, 'the first run has nothing to fall from');
    put(root, 'neo/MEASURE.json', '{');
    assert.equal(r().value, null);
    assert.match(r().blocked[0], /^regressions: neo\/MEASURE\.json is not JSON/);
    put(root, 'neo/MEASURE.json', { tasks: [] });
    assert.deepEqual(r(), { value: null, blocked: ['regressions: neo/MEASURE.json is not { at, era, tasks: { <task>: [ok, n] } }'] });
    put(root, 'grown/index.json', { generation: 1, cells: [{ id: 't-two-neo-g1', task: 't-two', tier: 'neo', heldout: { ok: 0, n: 0 } }] });
    put(root, 'neo/MEASURE.json', { at: 'x', era: 1, tasks: { 't-two': [1, 12] } });
    assert.deepEqual(r().value, { count: 1, tasks: [{ task: 't-two', before: [1, 12], after: [0, 0] }] }, 'no rows left is a fall');
  } finally { clean(root); }
});

test('knowledge: mastered and all colonies split into knowledge-backed (know: true) and plain', () => {
  const root = makeRoot();
  try {
    const k = () => M.knowledgePart(M.readsOf(root));
    assert.deepEqual(k(), { value: EXPECT.knowledge, blocked: [] });
    put(root, 'grown/index.json', { generation: 1, cells: [
      { id: 'a', task: 'a', tier: 'neo', heldout: { ok: 2, n: 2 } },
      { id: 'b', task: 'b', tier: 'neo', heldout: { ok: 2, n: 2 }, know: 'yes' },
      { id: 'c', task: 'c', tier: 'neo', heldout: { ok: 1, n: 2 }, know: true },
      { id: 'd', task: 'd', tier: 'neo', heldout: { ok: 0, n: 0 }, know: true },
      { id: 'e', class: 'e', heldout: { ok: 1, n: 1 }, know: true },
    ] });
    assert.deepEqual(k().value, { mastered: { backed: 0, plain: 2 }, colonies: { backed: 2, plain: 2 } }, 'know must be true; 0 of 0 is not mastered; a hand cell is not a colony');
    put(root, 'grown/index.json', '{');
    assert.deepEqual(k(), { value: null, blocked: [] });
  } finally { clean(root); }
});

// ---- trials, sources, frontier, bodies
test('trials: neo/TRIALS.jsonl counted kept and reverted, by kind; lines that are not a trial skipped; bounded and marked truncated', () => {
  const root = makeRoot();
  try {
    assert.deepEqual(M.trialsPart(root), { value: EXPECT.trials, blocked: [] });
    const rows = Array.from({ length: 50 }, (_, i) => ({ at: 'x', era: 10 + i, kind: 'genome', change: i % 2 === 0 ? 'abc' : 'ab', kept: i % 2 === 0 })); // every line the same length
    put(root, 'neo/TRIALS.jsonl', jsonl(rows));
    const all = M.trialsPart(root).value;
    assert.deepEqual(all, { rows: 50, kept: 25, reverted: 25, byKind: { genome: { kept: 25, reverted: 25 } }, skipped: 0, truncated: false });
    const lineBytes = Buffer.byteLength(JSON.stringify(rows[0]) + '\n');
    const cut = M.trialsPart(root, { maxBytes: lineBytes * 10 + 5 }).value;
    assert.equal(cut.truncated, true);
    assert.equal(cut.rows, 10, 'the newest ten whole lines; the partial first line of the window dropped');
    assert.equal(cut.skipped, 0, 'a partial line is dropped, not counted as skipped');
    put(root, 'neo/TRIALS.jsonl', '');
    assert.deepEqual(M.trialsPart(root).value, { rows: 0, kept: 0, reverted: 0, byKind: {}, skipped: 0, truncated: false });
    put(root, 'neo/TRIALS.jsonl', jsonl([{ kind: 'macro', kept: true }]) + '{"kind":"genome","ke');
    assert.deepEqual(M.trialsPart(root).value, { rows: 1, kept: 1, reverted: 0, byKind: { macro: { kept: 1, reverted: 0 } }, skipped: 1, truncated: false }, 'a torn last line is skipped');
    fs.rmSync(path.join(root, 'neo', 'TRIALS.jsonl'));
    assert.deepEqual(M.trialsPart(root), { value: null, blocked: [] }, 'not there yet: null, not zero');
  } finally { clean(root); }
});

test('sources: the registry distinct ids and distinct domains (case folded); null while absent, blocked when malformed', () => {
  const root = makeRoot();
  try {
    assert.deepEqual(M.sourcesPart(root), { value: EXPECT.sources, blocked: [] });
    put(root, 'neo/sources.json', { sources: [] });
    assert.deepEqual(M.sourcesPart(root).value, { registry: 0, domains: 0 });
    put(root, 'neo/sources.json', [{ id: 'a' }]);
    assert.deepEqual(M.sourcesPart(root), { value: null, blocked: ['sources: neo/sources.json is not { sources: [..] }'] });
    fs.rmSync(path.join(root, 'neo', 'sources.json'));
    assert.deepEqual(M.sourcesPart(root), { value: null, blocked: [] });
  } finally { clean(root); }
});

test('frontier: seeds from neo/frontier-seeds.json, queue, seen, repos and added from neo/frontier.json; a count not there is null', () => {
  const root = makeRoot();
  try {
    const f = () => M.frontierPart(root);
    assert.deepEqual(f(), { value: EXPECT.frontier, blocked: [] });
    put(root, 'neo/frontier-seeds.json', [{ url: 'a' }, { url: 'b' }]);
    assert.equal(f().value.seeds, 2, 'a seed file that is a list');
    fs.rmSync(path.join(root, 'neo', 'frontier.json'));
    assert.deepEqual(f(), { value: { seeds: 2, queue: null, seen: null, repos: null, added: null }, blocked: [] }, 'the state not there yet');
    put(root, 'neo/frontier.json', { queue: 'x', repos: [1] });
    assert.deepEqual(f(), { value: { seeds: 2, queue: null, seen: null, repos: null, added: null }, blocked: [] }, 'a field of another shape is null');
    put(root, 'neo/frontier.json', [1, 2]);
    assert.deepEqual(f(), { value: { seeds: 2, queue: null, seen: null, repos: null, added: null }, blocked: ['frontier: neo/frontier.json is not { queue, seen, repos, added }'] });
    fs.rmSync(path.join(root, 'neo', 'frontier-seeds.json'));
    assert.deepEqual(f(), { value: null, blocked: ['frontier: neo/frontier.json is not { queue, seen, repos, added }'] }, 'no count at all: null');
    put(root, 'neo/frontier.json', { v: 1 });
    assert.deepEqual(f(), { value: null, blocked: ['frontier: neither neo/frontier-seeds.json nor neo/frontier.json holds a count'] });
    put(root, 'neo/frontier-seeds.json', { about: 'x' });
    assert.deepEqual(f().blocked, ['frontier: neo/frontier-seeds.json is not { seeds: [..] }']);
    fs.rmSync(path.join(root, 'neo', 'frontier.json'));
    fs.rmSync(path.join(root, 'neo', 'frontier-seeds.json'));
    assert.deepEqual(f(), { value: null, blocked: [] });
  } finally { clean(root); }
});

test('bodies: the bodies that ran the eras of the last 24 hours, from each era row body; a row later than this row is the clock gone backwards', () => {
  const root = makeRoot();
  try {
    const b = (at) => M.bodiesPart(M.readsOf(root), { at });
    assert.deepEqual(b(new Date().toISOString()), { value: EXPECT.bodies, blocked: [] });
    const at = '2026-10-01T12:00:00.000Z';
    put(root, 'neo/ERA.json', { era: 9, eras: [
      { era: 1, at: '2026-09-30T11:59:59.999Z', body: 'github' },
      { era: 2, at: '2026-09-30T12:00:00.000Z', body: 'github' },
      { era: 3, at: '2026-10-01T06:00:00.000Z', body: 'claude-routine' },
      { era: 4, at: '2026-10-01T07:00:00.000Z' },
      { era: 5, at: '2026-10-01T08:00:00.000Z', body: 'not a body!' },
      { era: 6, at: 'not a time', body: 'github' },
      { era: 7, at: '2026-10-01T12:00:00.000Z', body: 'phone' },
      { era: 8, at: '2026-10-01T13:00:00.000Z', body: 'github' },
      { at: '2026-10-01T09:00:00.000Z', body: 'github' },
    ] });
    assert.deepEqual(b(at), {
      value: { eras: 6, by: { 'claude-routine': 1, github: 2, phone: 1 } },
      blocked: ['bodies: 1 era row is later than this row at ' + at + ' (the clock went backwards)'],
    }, 'the window starts at exactly 24 hours; a row without a body or with a bad one counts as an era of no body');
    assert.deepEqual(b('2026-10-01T05:00:00.000Z').blocked, ['bodies: 5 era rows are later than this row at 2026-10-01T05:00:00.000Z (the clock went backwards)']);
    assert.deepEqual(b('yesterday'), { value: null, blocked: ['bodies: this row has no readable at'] });
    fs.rmSync(path.join(root, 'neo', 'ERA.json'));
    assert.deepEqual(b(at), { value: null, blocked: [] });
  } finally { clean(root); }
});

test('a clock that went backwards: ms stays a count (monotonic), velocity and bodies name it, the row is still appended', async () => {
  const root = makeRoot();
  try {
    const a = await measureAt(root);
    const back = await measureAt(root, { era: 8, now: () => '2020-01-01T00:00:00.000Z' });
    assert.equal(back.at, '2020-01-01T00:00:00.000Z');
    assert.ok(Number.isInteger(back.ms) && back.ms >= 0, 'ms ' + back.ms);
    for (const p of PARTS) assert.ok(Number.isInteger(back.partMs[p]) && back.partMs[p] >= 0, p);
    assert.equal(back.velocity.cellsPerSecond, null);
    assert.deepEqual(back.blocked, [
      'velocity: the clock did not move forward: this row at 2020-01-01T00:00:00.000Z, the last row at ' + a.at + ': no cells per second',
      'bodies: 3 era rows are later than this row at 2020-01-01T00:00:00.000Z (the clock went backwards)',
    ]);
    assert.deepEqual(back.bodies, { eras: 3, by: { github: 2, phone: 1 } });
    assert.equal(M.readRows(root).rows.length, 2);
  } finally { clean(root); }
});

// ---- SELF-MADE MEASURES: probes
const AT = '2026-10-01T12:00:00.000Z';
const probe = (root, o = {}) => M.probesPart(root, M.readsOf(root), { at: AT, era: 3, ...o });
/** A pack of n rows over the given columns, every cell distinct (`dup` rows repeat the first key). */
function packOf(id, columns, n, dup = 0) {
  const rows = Array.from({ length: n }, (_, i) => columns.map((c, k) => (k === 0 && i < dup ? 'same key' : c + ' value ' + i)));
  return { id, from: 'test', sha: id + '-sha', columns, rows, at: AT };
}
const onlyPacks = (root, packs, index = packs.map((p) => ({ id: p.id, columns: p.columns, rows: p.rows.length, sha: p.sha }))) => {
  fs.rmSync(path.join(root, 'neo', 'know'), { recursive: true, force: true });
  for (const p of packs) put(root, 'neo/know/' + p.id + '.json', p);
  put(root, 'neo/know/INDEX.json', { packs: index });
};

test('probes: one line per knowledge-pack column pair with no task yet, the template from the column names, no cell copied', () => {
  const root = makeRoot();
  try {
    assert.deepEqual(probe(root), { value: { proposed: 3, total: 3, opened: 0 }, blocked: [] });
    const lines = probesOf(root);
    assert.deepEqual(lines.map((l) => [l.key, l.value]), [['country', 'code'], ['capital', 'country'], ['capital', 'code']], 'column order; country to capital is opened already; code holds three keys');
    assert.deepEqual(lines[0], { at: AT, era: 3, task: 'countries-country-to-code', pack: 'countries', sha: 'pack-sha', key: 'country', value: 'code', template: 'what is the code of {country}', rows: 40, keys: 40, by: 'measure' });
    for (const l of lines) assert.ok(M.TASK_RE.test(l.task), l.task);
    assert.ok(!read(path.join(root, 'neo', 'probes.jsonl')).includes('SENTINEL'), 'no cell of a pack is copied');
    // deduplicated across runs; opened once the ledger holds the task
    assert.deepEqual(probe(root).value, { proposed: 0, total: 3, opened: 0 });
    put(root, 'neo/LEDGER.json', { ...LEDGER, tasks: [...LEDGER.tasks, { task: 'countries-capital-to-code' }] });
    assert.deepEqual(probe(root).value, { proposed: 0, total: 3, opened: 1 });
    assert.equal(probesOf(root).length, 3, 'nothing appended twice');
    // write: false proposes and writes nothing
    fs.rmSync(path.join(root, 'neo', 'probes.jsonl'));
    assert.deepEqual(probe(root, { write: false }).value, { proposed: 2, total: 2, opened: 0 });
    assert.equal(fs.existsSync(path.join(root, 'neo', 'probes.jsonl')), false);
    // a torn last line of probes.jsonl: the next probes start on a line of their own
    put(root, 'neo/probes.jsonl', '{"pack":"countries","key":"country","value":"code"}\n{"pack":"countr');
    assert.deepEqual(probe(root).value, { proposed: 1, total: 2, opened: 0 });
    const text = read(path.join(root, 'neo', 'probes.jsonl'));
    assert.ok(text.startsWith('{"pack":"countries","key":"country","value":"code"}\n{"pack":"countr\n{'), 'the torn line kept, a newline added');
  } finally { clean(root); }
});

test('probes: at most PROBES_PER_RUN a run, the rest the next runs; packs in id order', () => {
  const root = makeRoot();
  try {
    const cols = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];
    onlyPacks(root, [packOf('zeta', ['k', 'v'], 40), packOf('wide', cols, 40)]);
    const runs = [];
    for (let i = 0; i < 4; i++) runs.push(probe(root).value);
    assert.deepEqual(runs, [
      { proposed: 20, total: 20, opened: 0 }, { proposed: 20, total: 40, opened: 0 }, { proposed: 18, total: 58, opened: 0 }, { proposed: 0, total: 58, opened: 0 },
    ], '56 pairs of wide, then 2 of zeta');
    const lines = probesOf(root);
    assert.equal(M.BOUNDS.PROBES_PER_RUN, 20);
    assert.equal(new Set(lines.map((l) => JSON.stringify([l.pack, l.key, l.value]))).size, 58, 'no pair twice');
    assert.equal(new Set(lines.map((l) => l.task)).size, 58, 'no task name twice');
    assert.deepEqual(lines.slice(-2).map((l) => l.pack), ['zeta', 'zeta']);
  } finally { clean(root); }
});

test('probes: a key column needs PROBE_MIN_KEYS unambiguous keys; a small, missing or oversized pack is not read; no index, no probe', () => {
  const root = makeRoot();
  try {
    assert.equal(M.BOUNDS.PROBE_MIN_KEYS, 30);
    // 41 rows, the first 12 sharing one key: 29 unambiguous keys; 42 rows with 12 shared: 30
    onlyPacks(root, [packOf('short', ['k', 'v'], 41, 12)]);
    assert.deepEqual(probesOf(root).length, 0);
    assert.deepEqual(probe(root).value, { proposed: 1, total: 1, opened: 0 }, 'v to k only: v holds 41 keys, k holds 29');
    assert.equal(probesOf(root)[0].key, 'v');
    fs.rmSync(path.join(root, 'neo', 'probes.jsonl'));
    onlyPacks(root, [packOf('enough', ['k', 'v'], 42, 12)]);
    assert.deepEqual(probe(root).value, { proposed: 2, total: 2, opened: 0 });
    fs.rmSync(path.join(root, 'neo', 'probes.jsonl'));
    // the index says fewer rows than PROBE_MIN_KEYS: the pack is not opened at all
    const small = packOf('small', ['k', 'v'], 40);
    onlyPacks(root, [small], [{ id: 'small', columns: ['k', 'v'], rows: 29, sha: 's' }]);
    assert.deepEqual(probe(root), { value: { proposed: 0, total: 0, opened: 0 }, blocked: [] });
    // a pack over 2 MB is never loaded; a pack the index names but the disk lacks is named
    const big = packOf('big', ['k', 'v'], 40);
    big.pad = 'x'.repeat(M.BOUNDS.PACK_MAX_BYTES);
    onlyPacks(root, [big]);
    const size = fs.statSync(path.join(root, 'neo', 'know', 'big.json')).size;
    assert.deepEqual(probe(root), { value: { proposed: 0, total: 0, opened: 0 }, blocked: ['probes: neo/know/big.json is ' + size + ' bytes, over the ' + M.BOUNDS.PACK_MAX_BYTES + ' a pack may be: not loaded'] });
    onlyPacks(root, [], [{ id: 'ghost', columns: ['k', 'v'], rows: 40 }, { id: '../state/x', columns: ['k', 'v'], rows: 40 }, { id: 'nocols' }, 'junk']);
    assert.deepEqual(probe(root), { value: { proposed: 0, total: 0, opened: 0 }, blocked: ['probes: neo/know/ghost.json is not there'] }, 'an id that is not a pack id is never a path');
    onlyPacks(root, [{ id: 'flat', columns: ['k', 'v'], rows: 'not rows' }], [{ id: 'flat', columns: ['k', 'v'], rows: 40 }]);
    assert.deepEqual(probe(root).blocked, ['probes: neo/know/flat.json is not { id, columns: [..], rows: [[..]] }']);
    // equal labels and empty labels are not a pair
    onlyPacks(root, [packOf('labels', ['Name', 'name', '!!!'], 40)]);
    assert.deepEqual(probe(root).value, { proposed: 0, total: 0, opened: 0 });
    // no index: null, nothing written; an index that is not one: blocked; no ledger: blocked
    fs.rmSync(path.join(root, 'neo', 'know'), { recursive: true, force: true });
    assert.deepEqual(probe(root), { value: null, blocked: [] });
    put(root, 'neo/know/INDEX.json', { packs: 'none' });
    assert.deepEqual(probe(root), { value: null, blocked: ['probes: neo/know/INDEX.json is not { packs: [..] }'] });
    put(root, 'neo/know/INDEX.json', { packs: [] });
    fs.rmSync(path.join(root, 'neo', 'LEDGER.json'));
    assert.deepEqual(probe(root), { value: null, blocked: ['probes: neo/LEDGER.json is not there: no task can be told from a probe'] });
    assert.equal(fs.existsSync(path.join(root, 'neo', 'probes.jsonl')), false, 'no probe written by any of these');
  } finally { clean(root); }
});

test('probes: task names fit the teacher (TASK_RE), long ones get 6 hex of their pair; templates and labels from column names; pairFit', () => {
  assert.equal(M.labelOf('Country_Name'), 'country name');
  assert.equal(M.labelOf('  GDP (USD) '), 'gdp usd');
  assert.equal(M.probeTemplate('Country_Name', 'Capital City'), 'what is the capital city of {country name}');
  assert.equal(M.probeTask('countries', 'Country_Name', 'Capital City'), 'countries-country-name-to-capital-city');
  const long = M.probeTask('a-very-long-pack-name-here', 'an extremely long key column name', 'another very long value column');
  assert.ok(M.TASK_RE.test(long), long);
  assert.match(long, /^a-very-long-pack-name-here-an-extr-[0-9a-f]{6}$/);
  assert.equal(long.length, 41);
  assert.equal(M.probeTask('a-very-long-pack-name-here', 'an extremely long key column name', 'another very long value column'), long, 'the same pair, the same name');
  assert.notEqual(M.probeTask('a-very-long-pack-name-here', 'an extremely long key column name', 'another very long value column 2'), long);
  const odd = M.probeTask('x', '?', '?');
  assert.ok(M.TASK_RE.test(odd), odd);
  assert.deepEqual(M.pairFit([['a', '1'], ['A!', '2'], ['b', 'b'], ['c', ''], [null, 'x'], ['d', 4], 'junk', ['e']], 0, 1), { rows: 4, keys: 1 }, 'a and A! are one key twice; b answers itself; d to 4 counts; an empty or missing cell is no row');
  assert.deepEqual(M.pairFit(null, 0, 1), { rows: 0, keys: 0 });
});

// ---- bounded readers
test('scanLines: the newest maxBytes in chunks, the partial first line dropped, a last line without a newline kept, UTF-8 across chunks', () => {
  const root = path.join(TMP, 'scan-' + ++seq);
  try {
    put(root, 'f.jsonl', 'a\nbb\nccc\n');
    const lines = (o) => { const out = []; const r = M.scanLines(root, 'f.jsonl', (l) => out.push(l), o); return { out, ...r }; };
    assert.deepEqual(lines(), { out: ['a', 'bb', 'ccc'], truncated: false, bytes: 9, lines: 3 });
    assert.deepEqual(lines({ maxBytes: 4 }), { out: ['ccc'], truncated: true, bytes: 4, lines: 1 }, 'a window that starts on a line start keeps that line');
    assert.deepEqual(lines({ maxBytes: 5 }), { out: ['ccc'], truncated: true, bytes: 5, lines: 1 });
    assert.deepEqual(lines({ maxBytes: 6 }), { out: ['ccc'], truncated: true, bytes: 6, lines: 1 }, 'the partial b of bb is dropped');
    assert.deepEqual(lines({ maxBytes: 7 }), { out: ['bb', 'ccc'], truncated: true, bytes: 7, lines: 2 });
    assert.deepEqual(lines({ maxBytes: 2, chunk: 1 }), { out: [], truncated: true, bytes: 2, lines: 0 }, 'cc of ccc is partial');
    assert.deepEqual(lines({ chunk: 1 }).out, ['a', 'bb', 'ccc']);
    put(root, 'f.jsonl', 'éé\nàb\n€');
    assert.deepEqual(lines({ chunk: 1 }).out, ['éé', 'àb', '€']);
    assert.deepEqual(lines({ chunk: 2 }).out, ['éé', 'àb', '€']);
    put(root, 'f.jsonl', '');
    assert.deepEqual(lines(), { out: [], truncated: false, bytes: 0, lines: 0 });
    assert.throws(() => M.scanLines(root, 'missing.jsonl', () => {}), (e) => e.code === 'ENOENT');
  } finally { clean(root); }
});

test('readJsonPart: absent, not JSON, over the bound, and a value', () => {
  const root = path.join(TMP, 'json-' + ++seq);
  try {
    put(root, 'a.json', { x: 1 });
    assert.deepEqual(M.readJsonPart(root, 'a.json'), { value: { x: 1 } });
    const size = fs.statSync(path.join(root, 'a.json')).size;
    assert.deepEqual(M.readJsonPart(root, 'a.json', { maxBytes: size - 1 }), { why: 'a.json is ' + size + ' bytes, over the ' + (size - 1) + ' a JSON file may be' });
    assert.deepEqual(M.readJsonPart(root, 'a.json', { maxBytes: size }), { value: { x: 1 } });
    assert.deepEqual(M.readJsonPart(root, 'b.json'), { why: 'b.json is not there', absent: true });
    put(root, 'c.json', '{');
    assert.match(M.readJsonPart(root, 'c.json').why, /^c\.json is not JSON \(/);
    assert.equal(M.readJsonPart(root, 'c.json').absent, undefined);
  } finally { clean(root); }
});

test('a huge series: the reader holds only the newest TAIL_BYTES, marks it truncated, and plateau will not guess across the cut', () => {
  const root = makeRoot();
  try {
    const pad = 'p'.repeat(100);
    const n = Math.ceil((M.BOUNDS.TAIL_BYTES * 1.25) / 200);
    const text = Array.from({ length: n }, (_, i) => JSON.stringify({ at: '2026-09-01T00:00:00.000Z', era: i, neo: { mastered: 1, heldout: { ok: 16, n: 22 } }, generated: 4242, pad })).join('\n') + '\n';
    put(root, 'grown/measure.jsonl', text);
    assert.ok(Buffer.byteLength(text) > M.BOUNDS.TAIL_BYTES, 'the file is larger than the tail');
    const s = cli(root, ['series', '--last', String(M.LIMITS.last)]);
    assert.equal(s.code, 0, s.stderr);
    assert.equal(s.json.truncated, true);
    assert.ok(s.json.rows > 0 && s.json.rows < n, 'rows ' + s.json.rows + ' of ' + n);
    assert.equal(s.json.last.era, n - 1, 'the newest row is in the tail');
    assert.equal(s.json.first.era, n - s.json.rows, 'the tail is a contiguous run of the newest rows');
    assert.equal(s.json.skipped, 0, 'the cut line is dropped, not counted as skipped');
    const small = M.series(root, { maxBytes: 1000 });
    assert.equal(small.truncated, true);
    assert.ok(small.rows >= 1 && small.rows <= 5 && small.last.era === n - 1, 'rows ' + small.rows);
    const r = cli(root, ['run', '--era', String(n)]);
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.plateau, null, 'never rose inside the cut tail and no row carries a plateau');
    assert.equal(r.json.velocity.masteredPerEra, 0);
  } finally { clean(root); }
});

// ---- series
test('series: last minus first over the window, null where an end has no number, bad lines skipped', () => {
  const root = path.join(TMP, 'series-' + ++seq);
  try {
    fs.mkdirSync(root, { recursive: true });
    const none = cli(root, ['series']);
    assert.equal(none.code, 0, none.stderr);
    assert.deepEqual(none.json, { rows: 0, first: null, last: null, delta: { lockedMean: null, neoTasks: null, neoMastered: null, cells: null, generated: null }, skipped: 0, truncated: false });
    const r1 = { at: '2026-10-01T01:00:00.000Z', era: 1, generation: null, locked: { classes: 12, mean: 0.5, byClass: {} }, neo: { tasks: 1, colonies: 1, cells: 10, mastered: 0, heldout: { ok: 1, n: 2, score: 0.5 } }, generated: 100 };
    const r2 = { at: '2026-10-01T02:00:00.000Z', era: 2, generation: null, locked: { classes: 12, mean: 0.6, byClass: {} }, neo: null, generated: 150 };
    const r3 = { at: '2026-10-01T03:00:00.000Z', era: 3, generation: 5, locked: { classes: 12, mean: 0.75, byClass: {} }, neo: { tasks: 4, colonies: 3, cells: 30, mastered: 2, heldout: { ok: 9, n: 12, score: 0.75 } }, generated: 400 };
    put(root, 'grown/measure.jsonl', jsonl([r1, 'not json', r2, { no: 'at' }, r3]) + '{"at":"2026-10-01T04:0');
    const all = cli(root, ['series']);
    assert.equal(all.code, 0, all.stderr);
    assert.deepEqual(all.json, {
      rows: 3,
      first: { at: r1.at, era: 1, generation: null, lockedMean: 0.5, neoTasks: 1, neoMastered: 0, cells: 10, generated: 100 },
      last: { at: r3.at, era: 3, generation: 5, lockedMean: 0.75, neoTasks: 4, neoMastered: 2, cells: 30, generated: 400 },
      delta: { lockedMean: 0.25, neoTasks: 3, neoMastered: 2, cells: 20, generated: 300 },
      skipped: 3,
      truncated: false,
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
      assert.match(r.stdout, /--max-ms/);
    }
    const bad = [['bogus'], ['toString'], ['run', 'extra'], ['run', '--last', '3'], ['series', '--era', '1'], ['run', '--era', '-1'], ['run', '--era', '1.5'], ['run', '--gen', '0'],
      ['run', '--jobs', '0'], ['run', '--timeout-ms', '10'], ['series', '--last', '0'], ['run', '--nope', '1'], ['run', '--gen'], ['run', '--max-ms', '999'], ['run', '--max-ms=']];
    for (const args of bad) {
      const r = cli(root, args);
      assert.equal(r.code, 2, args.join(' ') + ': ' + r.stderr);
      assert.equal(r.stdout, '', args.join(' '));
      assert.equal(r.stderr.trim().split(/\r?\n/).length, 1, args.join(' ') + ': ' + r.stderr);
    }
    const nowhere = cli(root, ['run', '--root', path.join(root, 'no-such-dir')], {}, { rootArg: false });
    assert.equal(nowhere.code, 2, nowhere.stderr);
    assert.ok(!fs.existsSync(path.join(root, 'grown', 'measure.jsonl')), 'no usage error wrote a row');
    assert.ok(!fs.existsSync(path.join(root, 'neo', 'probes.jsonl')), 'no usage error wrote a probe');
    assert.deepEqual(calls(root), [], 'no usage error ran a child');
  } finally { clean(root); }
});

test('native: the module imports only node: builtins and names no model, no socket, no fetch', () => {
  const src = read(MEASURE);
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1'); // his words in the comments name what is refused
  const specs = [...src.matchAll(/^\s*import\s+(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]/gm)].map((m) => m[1]);
  assert.ok(specs.length > 0);
  const allowed = ['node:fs', 'node:os', 'node:path', 'node:crypto', 'node:child_process', 'node:url'];
  assert.deepEqual(specs.filter((s) => !allowed.includes(s)), [], 'imports: ' + specs.join(', '));
  for (const re of [/\bfetch\s*\(/, /\bimport\s*\(/, /\brequire\s*\(/, /ollama|11434|anthropic|openai|claude-|node:https?\b|node:net\b|node:dgram\b|node:tls\b|XMLHttpRequest|WebSocket/i]) {
    assert.ok(!re.test(code), 'the code matches ' + re);
  }
  assert.ok(!src.includes(String.fromCharCode(0x2014)), 'no em-dash');
  assert.ok(!read(fileURLToPath(import.meta.url)).includes(String.fromCharCode(0x2014)), 'no em-dash in the suite');
});
