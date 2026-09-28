// test/mistakes.test.mjs: the mistake ledger (self/mistakes.mjs) and its bar (bench/mistakes.mjs).
// Author: board 34 builder (item mistakes). Every reader on every shape it accepts and one it must reject, the dedup
// rule, lesson grouping on a fixed set, the re-ask grader on a right, a wrong and a refused answer for each source,
// the --since diff, and the verdict shape. MODEL OFF: the one real ask() here is provider 'null' in a worker.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import * as M from '../self/mistakes.mjs';
import * as B from '../bench/mistakes.mjs';

const jl = (...rows) => rows.map((r) => (typeof r === 'string' ? r : JSON.stringify(r))).join('\n') + '\n';
const MISS = 'I do not carry that yet: a test refusal';
const NO_ROOT = path.join(M.ROOT, 'bench', 'no-such-root-for-the-mistakes-test');

// ---------------------------------------------------------------- the public journals
const HEADER = { type: 'header', at: 't', node: 'v24', fingerprint: {}, command: 'c' };
const g = (id, over) => ({ type: 'arm', id, arm: 'organism', ok: false, got: null, provenance: 'model', route: 'math', native: false, ms: 1, at: 't', ...over });
const h = (id, over) => ({ type: 'arm', id, arm: 'organism', ok: false, error: null, timedOut: false, provenance: 'model', route: 'code', native: false, codeChars: 40, ms: 1, testMs: 3, cutAt: null, ...over });

test('gsm8k reader: every accepted shape, and the why each carries', () => {
  const text = jl(
    HEADER,
    g('gsm8k.0', { ok: true, got: '5', provenance: 'exact', route: 'direct', native: true }),
    g('gsm8k.1', { got: null, region: { allFailed: true, k: 5 } }),
    g('gsm8k.2', { got: '7', provenance: 'model+exact', region: { allFailed: false, k: 5, vote: { count: 3, valid: 5 }, verdict: 'ok' } }),
    g('gsm8k.3', { got: '8', provenance: 'exact', route: 'direct', native: true }),
    g('gsm8k.4', { got: '9', provenance: 'something new' }),
    g('gsm8k.5', { got: null }),
    { type: 'arm', id: 'gsm8k.1', arm: 'alone', ok: true, anything: 'other arms are not read' },
  );
  const r = M.readPublic('gsm8k', text, 'f.jsonl');
  assert.equal(r.rows, 6);
  assert.equal(r.otherArms, 1);
  assert.equal(r.headers, 1);
  const why = Object.fromEntries(r.mistakes.map((m) => [m.id, m.why]));
  assert.deepEqual(why, { 'gsm8k.1': 'refused', 'gsm8k.2': 'wrong-model', 'gsm8k.3': 'wrong-exact', 'gsm8k.4': 'unknown', 'gsm8k.5': 'unknown' });
  const m2 = r.mistakes.find((m) => m.id === 'gsm8k.2');
  assert.equal(m2.prompt, null, 'a public test prompt is a pointer, never text');
  assert.equal(m2.wanted, null, 'a public test answer is never in the ledger');
  assert.match(m2.promptRef.key, /^line 3: question$/);
  assert.match(m2.wantedRef.key, /####/);
});

test('gsm8k reader rejects a shape it has not seen, a row type and an arm', () => {
  assert.throws(() => M.readPublic('gsm8k', jl(HEADER, g('gsm8k.0', { surprise: 1 }))), M.ShapeError);
  assert.throws(() => M.readPublic('gsm8k', jl(HEADER, { type: 'footer' })), /a row of type "footer"/);
  assert.throws(() => M.readPublic('gsm8k', jl(HEADER, g('gsm8k.0', { arm: 'robot' }))), /an arm this reader has not seen/);
  assert.throws(() => M.readPublic('gsm8k', jl(HEADER, g('x.0'))), /gsm8k.<index>/);
  const noGot = g('gsm8k.0'); delete noGot.got;
  assert.throws(() => M.readPublic('gsm8k', jl(HEADER, noGot)), /without got/);
});

test('jsonl: a torn LAST line is counted, a bad line anywhere else throws', () => {
  const r = M.readPublic('gsm8k', jl(HEADER, g('gsm8k.0', { ok: true, got: '1', provenance: 'exact' }), '{"type":"arm","id'));
  assert.equal(r.torn, 1);
  assert.equal(r.rows, 1);
  assert.throws(() => M.readPublic('gsm8k', jl(HEADER, '{not json', g('gsm8k.0'))), /not JSON/);
});

test('humaneval reader: timeout, the no-candidate refusal, a wrong value, and a rejected shape', () => {
  const text = jl(
    HEADER,
    h('HumanEval_1_a', { ok: true, provenance: 'exact' }),
    h('HumanEval_2_b', { timedOut: true, error: 'timed out' }),
    h('HumanEval_3_c', { error: "SyntaxError: Unexpected identifier 'code'", codeChars: 54 }),
    h('HumanEval_4_d', { error: 'AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal' }),
    h('HumanEval_5_e', { error: 'SyntaxError: Invalid or unexpected token' }),
  );
  const r = M.readPublic('humaneval', text);
  const why = Object.fromEntries(r.mistakes.map((m) => [m.id, m.why]));
  assert.deepEqual(why, { HumanEval_2_b: 'timeout', HumanEval_3_c: 'refused', HumanEval_4_d: 'wrong-model', HumanEval_5_e: 'wrong-model' });
  const noCode = h('HumanEval_9_z'); delete noCode.codeChars;
  assert.throws(() => M.readPublic('humaneval', jl(HEADER, noCode)), /without codeChars/);
});

// ---------------------------------------------------------------- the census
const c = (id, over) => ({ id, kind: 'fact', arm: 'organism', gradeType: 'exact', ns: 1, chars: 10, route: 'direct', from: 'memory', provenance: 'memory', absent: false, native: false, refused: true, graded: false, gradedLoose: false, firstLine: MISS, ...over });
const PROMPTS = { prompts: [{ id: 'f1', kind: 'fact', prompt: 'Who wrote Hamlet?', grade: { type: 'exact', answer: 'Shakespeare' } }] };

test('census reader: refused, program, memory, the model arm skipped, grade none not counted', () => {
  const v = { rows: [
    c('f1'),
    c('a1', { kind: 'algebra', native: true, refused: false, provenance: 'program', route: 'program', from: 'program', text: '151' }),
    c('d1', { kind: 'definition', native: true, refused: false, provenance: 'memory', route: 'knowledge', from: 'knowledge' }),
    c('ok', { native: true, refused: false, graded: true, provenance: 'exact' }),
    c('n1', { gradeType: 'none', graded: null, gradedLoose: null }),
    c('f1', { arm: 'model', llm: {}, graded: true }),
    c('f1', { arm: 'organism-site' }),
  ] };
  const r = M.readConceive(v, PROMPTS);
  assert.equal(r.rows, 4, 'gradeable organism rows');
  assert.equal(r.otherArms, 2);
  const why = Object.fromEntries(r.mistakes.map((m) => [m.id, m.why]));
  assert.deepEqual(why, { f1: 'refused', a1: 'wrong-program', d1: 'wrong-memory' });
  const f1 = r.mistakes.find((m) => m.id === 'f1');
  assert.equal(f1.prompt, 'Who wrote Hamlet?', 'the census prompt file is committed, so its text is carried');
  assert.deepEqual(f1.wanted, { type: 'exact', answer: 'Shakespeare' });
});

test('census reader rejects an unseen arm, grade type, key and an absent organism row', () => {
  assert.throws(() => M.readConceive({ rows: [c('x', { arm: 'robot' })] }), /arm this reader has not seen/);
  assert.throws(() => M.readConceive({ rows: [c('x', { gradeType: 'fuzzy' })] }), /grade type/);
  assert.throws(() => M.readConceive({ rows: [c('x', { mood: 'bad' })] }), /key this reader has not seen: mood/);
  assert.throws(() => M.readConceive({ rows: [c('x', { absent: true })] }), /ABSENT organism row/);
  assert.throws(() => M.readConceive({}), /no rows array/);
});

// ---------------------------------------------------------------- the answer bench
const arow = (id, arms, over) => ({ arms, expected: '504', grade: 'number', i: 0, id, order: 0, source: 'fixture', ...over });

test('answer reader: organism and null read, alone skipped, memory and refusal whys', () => {
  const v = { rows: [
    arow('fixture.9', { organism: { ok: true, loose: true, candidate: '504', ms: 1, provenance: 'memory' }, alone: { ok: false, candidate: '1', ms: 1, provenance: 'model' }, null: { ok: false, loose: false, candidate: '391', ms: 1, provenance: 'memory' } }),
    arow('fixture.10', { null: { ok: false, candidate: '', ms: 1, provenance: null } }),
  ] };
  const r = M.readAnswer(v);
  assert.equal(r.rows, 3);
  const why = Object.fromEntries(r.mistakes.map((m) => [m.id, m.why]));
  assert.deepEqual(why, { 'fixture.9@null': 'wrong-memory', 'fixture.10@null': 'refused' });
  assert.equal(r.mistakes[0].wanted, '504');
  assert.throws(() => M.readAnswer({ rows: [arow('x', { plan: { ok: true } })] }), /arm this reader has not seen: plan/);
  assert.throws(() => M.readAnswer({ rows: [arow('x', { null: { ok: false, vibe: 1 } })] }), /key this reader has not seen: vibe/);
  assert.throws(() => M.readAnswer({ rows: [arow('x', {}, { extra: 1 })] }), /key this reader has not seen: extra/);
});

// ---------------------------------------------------------------- ARC
const arcHeader = (budgetMs) => ({ type: 'header', split: 'evaluation', budgetMs, attempts: 2, ids: ['a', 'b', 'c', 'd', 'e'], maxDepth: 4, workers: 2, command: 'c', node: 'v24' });
const arc = (id, over) => ({ type: 'row', id, status: 'timeout', solved: false, names: null, attempts: [], attemptRight: null, killed: false, session: 1, ms: 1, ...over });

test('ARC reader: header, sessions, solved skipped, timeout, found-but-wrong, exhausted, the 3 s status', () => {
  const t30 = jl(arcHeader(30000), { type: 'session', n: 5, startedAt: 't' },
    arc('a', { status: 'found', solved: true, names: ['rot90'] }),
    arc('b', { status: 'timeout', killed: true }),
    arc('c', { status: 'found', names: ['crop', 'cellRule'], attempts: [{}, {}] }),
    arc('d', { status: 'exhausted' }),
    arc('e', { status: 'mystery' }),
    { type: 'sessionEnd', n: 5, ran: 5 });
  const t3 = jl(arcHeader(3000), arc('b', { status: 'found', names: ['x'] }), arc('c', { status: 'found', solved: true, names: ['y'] }));
  const r = M.readArc(t30, t3);
  assert.equal(r.rows, 5);
  const why = Object.fromEntries(r.mistakes.map((m) => [m.id, m.why]));
  assert.deepEqual(why, { b: 'timeout', c: 'found-but-wrong', d: 'refused', e: 'unknown' });
  const cRow = r.mistakes.find((m) => m.id === 'c');
  assert.equal(cRow.given, 'crop > cellRule');
  assert.match(cRow.detail, /at 3000 ms: solved/);
  assert.equal(cRow.wanted, null, 'an ARC test output is a pointer, never in the ledger');
  assert.throws(() => M.readArc(jl(arcHeader(3000))), /budgetMs 3000, expected 30000/);
  assert.throws(() => M.readArc(jl(arcHeader(30000), { type: 'weird' })), /a row of type "weird"/);
  assert.throws(() => M.readArc(jl(arc('a'))), /no header/);
});

test('a source absent on disk is reported absent, never skipped', async () => {
  for (const n of M.SOURCE_NAMES) {
    const s = M.readSource(n, NO_ROOT);
    assert.equal(s.absent, true, n);
    assert.equal(s.name, n);
  }
  const v = await B.run({ root: NO_ROOT, write: false });
  assert.equal(v.sources.length, 5);
  assert.ok(v.sources.every((s) => s.absent === true));
  assert.equal(v.isTheBar, false);
  assert.equal(v.barMet, false);
});

// ---------------------------------------------------------------- dedup
test('dedup: the last row per (source, id) wins, and only then is it asked whether it is a mistake', () => {
  const d = M.dedup([{ source: 's', id: '1', v: 1 }, { source: 's', id: '1', v: 2 }, { source: 't', id: '1', v: 3 }]);
  assert.equal(d.dropped, 1);
  assert.deepEqual(d.rows.map((r) => r.v).sort(), [2, 3]);
  const fixedLater = M.readPublic('gsm8k', jl(HEADER, g('gsm8k.0', { got: '1', provenance: 'exact' }), g('gsm8k.0', { ok: true, got: '2', provenance: 'exact' })));
  assert.equal(fixedLater.duplicates, 1);
  assert.equal(fixedLater.mistakes.length, 0, 'right on its last reading: not a mistake');
  const brokeLater = M.readPublic('gsm8k', jl(HEADER, g('gsm8k.0', { ok: true, got: '2', provenance: 'exact' }), g('gsm8k.0', { got: '1', provenance: 'exact' })));
  assert.equal(brokeLater.mistakes.length, 1);
});

// ---------------------------------------------------------------- lessons
test('the vocabulary reads a fixed set of prompts, first match wins, unmatched is unshaped', () => {
  const want = {
    'What is 15% of 80?': 'percent', 'Write a haiku about rain.': 'compose verse', 'Translate "good morning" into Spanish.': 'translate',
    'Who wrote Hamlet?': 'fact', 'Convert 3 feet to inches.': 'unit conversion', 'A shirt costs $12 and a hat costs $8. What do they cost?': 'money',
    'Sam is 4 years older than Ann, who is 9. How old is Sam?': 'age',
  };
  for (const [p, op] of Object.entries(want)) assert.equal(M.opOf(p).op, op, p);
  assert.equal(M.opOf('Which element has the atomic number 1?'), null);
  assert.equal(M.opOf(''), null);
  for (const [, , owner] of M.OPS) assert.ok(owner, 'every shape names an owner');
});

test('code and grid shapes', () => {
  assert.equal(M.codeShape({ why: 'wrong-model', given: 'AssertionError [ERR_ASSERTION]: x' }).shape, 'code test: wrong value (an assertion failed)');
  assert.equal(M.codeShape({ why: 'wrong-model', given: 'ReferenceError: eval is not defined' }).shape, 'code test: unbound name');
  assert.equal(M.codeShape({ why: 'refused', given: "SyntaxError: Unexpected identifier 'code'" }).shape, 'code test: no candidate (the region refused)');
  assert.equal(M.codeShape({ why: 'timeout', given: null }).shape, 'code test: timeout');
  assert.equal(M.codeShape({ why: 'wrong-model', given: 'no class here' }), null);
  const grid = (hi, wi, ho, wo) => ({ input: Array.from({ length: hi }, () => Array(wi).fill(0)), output: Array.from({ length: ho }, () => Array(wo).fill(0)) });
  assert.equal(M.gridGeometry({ train: [grid(3, 3, 3, 3), grid(4, 4, 4, 4)] }), 'same size (paint in place)');
  assert.equal(M.gridGeometry({ train: [grid(6, 6, 2, 2)] }), 'smaller output (crop or summarize)');
  assert.equal(M.gridGeometry({ train: [grid(2, 2, 6, 6)] }), 'larger output (tile or scale)');
  assert.equal(M.gridGeometry({ train: [grid(2, 2, 6, 6), grid(3, 3, 3, 3)] }), 'mixed sizes');
  assert.equal(M.gridGeometry(null), null);
  assert.equal(M.gridShape({ why: 'found-but-wrong', given: 'crop > cellRule' }, null).shape, 'grid program fit the train pairs, missed the test: last step cellRule');
  assert.equal(M.gridShape({ why: 'timeout', given: null }, { train: [grid(3, 3, 3, 3)] }).shape, 'grid no program in the clock: same size (paint in place)');
  assert.equal(M.gridShape({ why: 'refused', given: null }, { train: [grid(3, 3, 1, 1)] }).shape, 'grid vocabulary exhausted: smaller output (crop or summarize)');
  assert.equal(M.gridShape({ why: 'timeout', given: null }, null), null, 'no task on disk: unshaped');
});

test('lessons on a fixed set: ranked by count then name, three examples, unshaped carried by none', () => {
  const rows = [
    ...['1', '2', '3', '4'].map((id) => ({ source: 'gsm8k', id, why: 'wrong-model', shape: 'percent', ownerHint: 'act/word.mjs' })),
    { source: 'conceive', id: 'p1', why: 'refused', shape: 'percent', ownerHint: 'act/word.mjs' },
    { source: 'conceive', id: 'v1', why: 'refused', shape: 'compose verse', ownerHint: 'x' },
    { source: 'conceive', id: 'a1', why: 'refused', shape: 'age', ownerHint: 'y' },
    { source: 'conceive', id: 'u1', why: 'refused', shape: M.UNSHAPED, ownerHint: null },
  ];
  const ls = M.lessonsOf(rows);
  assert.deepEqual(ls.map((l) => [l.shape, l.count]), [['percent', 5], ['age', 1], ['compose verse', 1]]);
  assert.deepEqual(ls[0].examples, ['gsm8k:1', 'gsm8k:2', 'gsm8k:3']);
  assert.deepEqual(ls[0].bySource, { gsm8k: 4, conceive: 1 });
  assert.equal(ls[0].ownerHint, 'act/word.mjs');
  assert.deepEqual(M.carriedShare(rows), { carried: 7, of: 8, share: 0.875 });
  assert.equal(M.lessonsOf(rows, 1).length, 1);
});

test('census control counts agreement with the census own kind', () => {
  const k = M.censusKindControl([
    { source: 'conceive', id: 'a', kind: 'algebra', shape: 'algebra' },
    { source: 'conceive', id: 'b', kind: 'fact', shape: 'percent' },
    { source: 'conceive', id: 'c', kind: 'newkind', shape: 'fact' },
    { source: 'gsm8k', id: 'd', kind: 'word-problem', shape: 'fact' },
  ]);
  assert.equal(k.of, 2);
  assert.equal(k.agree, 1);
  assert.deepEqual(k.kindsWithoutAMapping, ['newkind']);
});

// ---------------------------------------------------------------- the re-ask grader
const CTX = {
  gsm8k: [{ question: 'Q zero', answer: 'steps\n#### 42' }],
  humaneval: new Map([['t_double', {
    name: 't_double', prompt: '// double it\nfunction t_double(x){\n', stop_tokens: ['\nfunction ', '\n/*', '\n//', '\nconsole.log'],
    tests: "const assert = require('node:assert');\n\n\nfunction test() {\n  let candidate = t_double;\n  assert.deepEqual(candidate(2),4);\n  assert.deepEqual(candidate(5),10);\n}\n\ntest();",
  }]]),
  conceive: new Map([['f1', { id: 'f1', kind: 'arithmetic', prompt: 'What is 2 plus 2?', grade: { type: 'exact', answer: '4' } }]]),
  answer: new Map([['fixture.9', { id: 'fixture.9', q: 'What is 21 times 24?', a: '504', grade: 'number' }]]),
  arcDir: null, arcTasks: new Map(),
};

test('re-ask grader, gsm8k: right, wrong, refused', async () => {
  const row = { source: 'gsm8k', id: 'gsm8k.0', why: 'wrong-model' };
  const right = await M.gradeReask(row, 'So the answer is 42.', CTX);
  const wrong = await M.gradeReask(row, 'So the answer is 41.', CTX);
  const refused = await M.gradeReask(row, MISS, CTX);
  assert.deepEqual([right.ok, wrong.ok, refused.answered], [true, false, false]);
  assert.equal(M.nowOf('wrong-model', right), 'fixed');
  assert.equal(M.nowOf('wrong-model', wrong), 'still');
  assert.equal(M.nowOf('wrong-model', refused), 'refused');
  assert.equal(M.nowOf('refused', wrong), 'wrong-now', 'wrong where it refused before: a regression');
  assert.equal((await M.gradeReask(row, '', CTX)).answered, false, 'an empty answer is a refusal');
});

test('re-ask grader, humaneval: right, wrong, refused, run in the sandbox', async () => {
  const row = { source: 'humaneval', id: 't_double', why: 'wrong-model' };
  const right = await M.gradeReask(row, '```js\nfunction t_double(x){ return x * 2; }\n```', CTX);
  const wrong = await M.gradeReask(row, 'function t_double(x){ return x + 2; }', CTX);
  const refused = await M.gradeReask(row, 'the code region produced no candidate: none passed', CTX);
  assert.equal(right.ok, true, JSON.stringify(right));
  assert.equal(wrong.ok, false);
  assert.equal(wrong.answered, true);
  assert.equal(refused.answered, false, 'the miss text is a refusal here, not code');
});

test('re-ask grader, census and answer bench: right, wrong, refused', async () => {
  const cr = { source: 'conceive', id: 'f1', why: 'refused' };
  assert.equal((await M.gradeReask(cr, 'The answer is 4.', CTX)).ok, true);
  assert.equal((await M.gradeReask(cr, 'The answer is 5.', CTX)).ok, false);
  assert.equal((await M.gradeReask(cr, MISS, CTX)).answered, false);
  const ar = { source: 'answer', id: 'fixture.9@null', why: 'wrong-memory' };
  assert.equal((await M.gradeReask(ar, '504', CTX)).ok, true);
  assert.equal((await M.gradeReask(ar, '391', CTX)).ok, false);
  assert.equal((await M.gradeReask(ar, MISS, CTX)).answered, false);
  assert.equal((await M.gradeReask({ source: 'answer', id: 'fixture.77@null' }, '504', CTX)).ok, null, 'no question on disk: ungraded');
});

test('reaskAll: learned, still, wrong-now, a cut at the wall, ARC skipped and said so, no prompt skipped', async () => {
  const rows = [
    { source: 'gsm8k', id: 'gsm8k.0', why: 'refused' },
    { source: 'conceive', id: 'f1', why: 'wrong-program', prompt: 'What is 2 plus 2?' },
    { source: 'answer', id: 'fixture.9@null', why: 'refused' },
    { source: 'answer', id: 'fixture.9@organism', why: 'wrong-memory' },
    { source: 'arc', id: 'abc', why: 'timeout' },
    { source: 'answer', id: 'fixture.77@null', why: 'refused' },
  ];
  const answers = { 'Q zero': 'It is 42.', 'What is 2 plus 2?': '5', 'What is 21 times 24?': 'It is 391.' };
  let n = 0;
  const askFn = async (p) => {
    n++;
    if (n === 4) return { text: '', timedOut: true };
    const key = Object.keys(answers).find((k) => p.startsWith(k));
    return { text: answers[key], ns: 1e6 * n, route: 'r', provenance: 'program' };
  };
  const res = await M.reaskAll(rows, CTX, { askFn, wallMs: 2000 });
  assert.equal(res.skipped.arc, 1);
  assert.equal(res.skipped.noPrompt, 1);
  assert.deepEqual(res.rows.map((r) => [r.id, r.before, r.now, r.learned]), [
    ['gsm8k.0', 'refused', 'fixed', true],
    ['f1', 'wrong-program', 'still', false],
    ['fixture.9@null', 'refused', 'wrong-now', false],
    ['fixture.9@organism', 'wrong-memory', 'refused', false],
  ]);
  assert.equal(res.rows[3].timedOut, true);
  assert.equal(res.rows[3].ms, 2000);
  const s = M.summarizeReask(res.rows);
  assert.deepEqual([s.rows, s.fixed, s.still, s.refused, s.wrongNow, s.learned, s.timedOut], [4, 1, 1, 1, 1, 1, 1]);
  assert.equal(s.medianMs, 2);
  assert.equal(s.bySource.answer.rows, 2);
});

test('the Asker: ask() model off in a worker, cut at the wall, a fresh worker after the cut', async () => {
  const a = new M.Asker({ wallMs: 2000 });
  try {
    const r1 = await a.ask('what is 17 times 23');
    assert.equal(r1.timedOut, false);
    assert.match(r1.text, /391/);
    a.wallMs = 1;
    // the worker holds 200 ms before it asks: without the hold the organism answers in 0.6 to 1.5 ms and the 1 ms wall is a race (board 34b measured 2 cuts missed in 50 runs)
    const r2 = await a.ask('What is the capital of France?', { holdMs: 200 });
    assert.equal(r2.timedOut, true);
    assert.equal(a.worker, null, 'the cut worker is gone');
    a.wallMs = 2000;
    const r3 = await a.ask('what is 6 times 7');
    assert.match(r3.text, /42/);
    assert.equal(a.starts, 2);
  } finally { await a.close(); }
});

test('the Asker: a worker that fails to boot posts fatal, start() rejects with its text, nothing is asked', async () => {
  const a = new M.Asker({ wallMs: 2000, fault: 'boot' });
  try {
    await assert.rejects(a.start(), /the re-ask worker failed to start: Error: planted boot fault/);
    assert.equal(a.worker, null);
    assert.equal(a.starts, 0);
    await assert.rejects(a.ask('what is 2 times 3'), /failed to start/, 'ask() starts the worker and meets the same fault');
  } finally { await a.close(); }
});

// ---------------------------------------------------------------- --since
test('--since: learned and regressed per source, paired by id', () => {
  const prev = { ledgerIds: { gsm8k: ['a', 'b', 'c'], conceive: ['x'] }, reaskFixedIds: { gsm8k: ['c'], conceive: [] } };
  const cur = { ledgerIds: { gsm8k: ['b', 'c', 'd'], conceive: ['x'] }, reaskFixedIds: { gsm8k: ['b'], conceive: ['x'] } };
  const d = M.sinceDiff(prev, cur);
  assert.deepEqual([d.gsm8k.learned, d.gsm8k.regressed], [2, 2], 'a left and b newly fixed; d entered and c lost its fix');
  assert.deepEqual([d.gsm8k.leftLedger, d.gsm8k.enteredLedger, d.gsm8k.reaskNewlyFixed, d.gsm8k.reaskLostFix], [1, 1, 1, 1]);
  assert.deepEqual([d.conceive.learned, d.conceive.regressed], [1, 0]);
  assert.deepEqual([d.arc.before, d.arc.now, d.arc.learned], [0, 0, 0]);
  assert.deepEqual(B.args(['--reask', '--since', 'p.json', '--json']).since, 'p.json');
  assert.throws(() => B.args(['--since']), /needs a path/);
  assert.throws(() => B.args(['--bogus']), /unknown flag/);
});

// ---------------------------------------------------------------- the verdict
test('the verdict shape, on the real sources, with an injected asker (never the bar)', async () => {
  const askFn = async () => ({ text: MISS, ns: 5e5 });
  const prev = { file: 'prev.json', verdict: { at: 'then', ledgerIds: {}, reaskFixedIds: {} } };
  const v = await B.run({ reask: true, write: false, askFn, since: prev });
  for (const k of ['at', 'command', 'node', 'isTheBar', 'barMet', 'split', 'sources', 'bySource', 'byWhy', 'lessons', 'reask', 'statement', 'controls', 'ledgerIds', 'reaskFixedIds', 'since']) assert.ok(k in v, k);
  assert.match(v.at, /^\d{4}-\d\d-\d\dT/);
  assert.equal(v.node, process.version);
  assert.equal(typeof v.isTheBar, 'boolean');
  assert.equal(v.barMet, false, 'an injected asker is never the bar');
  assert.equal(v.sources.length, 5);
  for (const s of v.sources) for (const k of ['name', 'file', 'rows', 'mistakes', 'absent', 'own', 'match']) assert.ok(k in s, s.name + ' ' + k);
  assert.deepEqual(Object.keys(v.byWhy), [...M.WHY]);
  assert.ok(v.lessons.length <= 20);
  for (const l of v.lessons) { assert.ok(l.examples.length <= 3); assert.ok(l.count > 0); assert.ok('ownerHint' in l); }
  for (const k of ['rows', 'fixed', 'still', 'refused', 'wrongNow', 'medianMs']) assert.ok(k in v.reask, k);
  assert.equal(v.reask.refused, v.reask.rows, 'every stub answer is a refusal');
  assert.equal(v.reask.asker, 'injected');
  assert.ok('heldOut' in v.split);
  assert.equal(typeof v.statement, 'string');
  assert.ok(!/\u2014/.test(v.statement), 'no em-dash');
  assert.equal(Object.keys(v.since.bySource).length, 5);
  const printed = B.lines(v);
  assert.ok('contaminated' in v.split, 'board rule 1: the split names contaminated, false or the reason');
  assert.ok(v.split.contaminated === false || (typeof v.split.contaminated === 'string' && v.split.contaminated.length > 0));
  assert.equal(v.split.heldOut.idsSha256Holds, true, 'the held-out ids hash to what the file recorded');
  assert.ok(printed.some((l) => l.startsWith('SPLIT heldOut ') && / holds (true|false), /.test(l) && / contaminated (false|YES)/.test(l)), 'the split check is printed');
  assert.equal(typeof v.split.code.mtimeLaterThanHeldOutAt, 'boolean');
  assert.ok(printed.some((l) => l.startsWith('SPLIT heldOut ') && l.includes('code mtime ' + v.split.code.mtime + ' later than heldOut at ' + v.split.code.heldOutAt + ': ' + v.split.code.mtimeLaterThanHeldOutAt + ' (necessary, not sufficient')), 'the order check is printed as what it is');
  assert.ok(!/vocabulary was written after/.test(v.statement), 'the statement claims no more than the mtime check shows');
  if (v.split.contaminated === false) assert.match(v.statement, /that last check is necessary and not sufficient/, 'the statement carries the qualifier, in these words');
  assert.match(v.statement, /a wall of \d+ ms per row/, 'the wall is named as a wall, never as a duration per row');
  const c = v.controls;
  assert.equal(c.empty.calls, 1, 'the empty reply is ONE call, never a per-row count');
  assert.equal(c.gold.of + c.gold.none, c.askable);
  assert.equal(c.wrong.of + c.wrong.none, c.askable);
  assert.ok(printed.includes('CONTROL empty 1 call (' + c.empty.row + '): reads ' + c.empty.now + '; regrade ' + c.regrade.wrong + '/' + c.regrade.of + ' wrong; controls hold ' + c.holds));
  assert.ok(printed.some((l) => l.startsWith('CONTROL per re-askable row (' + c.askable + '): gold ' + c.gold.fixed + '/' + c.gold.of + ' fixed') && l.includes('; wrong ' + c.wrong.wrong + '/' + c.wrong.of + ' graded wrong (still ' + c.wrong.still + ', wrong-now ' + c.wrong.wrongNow)));
  assert.ok(printed.some((l) => l.startsWith('REASK all: ') && l.includes('wall ms per row ' + v.reask.wallMsPerRow) && l.includes('timed out ' + v.reask.timedOut)));
  const all = printed.join('\n');
  for (const n of new Set(v.statement.match(/\d+(?:\.\d+)?/g))) {
    assert.ok(new RegExp('(^|[^\\d.])' + n.replace('.', '\\.') + '(?!\\d)').test(all), 'the statement quotes ' + n + ' and the bar never prints it');
  }
  assert.ok(printed.some((l) => l.startsWith('REASK arc: skipped')));
  assert.ok(printed.some((l) => l.startsWith('SINCE gsm8k: learned 0, regressed ')));
  assert.match(printed[printed.length - 1], /^MISTAKES bar: isTheBar (true|false), barMet false/);
});

// ---------------------------------------------------------------- the held-out split and the bar's parts
test('held-out split: the ids hash the way the file wrote them; a re-encoded or tampered hash, a short n, a ledger overlap, an absent file and old code are contamination', () => {
  const at = '2026-01-01T00:00:00.000Z';
  const ids = ['gsm8k.6', 'gsm8k.12', 'gsm8k.18'];
  const good = JSON.stringify({ at, n: 3, ids, idsSha256: M.sha256(ids.join('\n')) });
  const h = B.heldOutOf(good, {}, []);
  assert.deepEqual([h.idsSha256Holds, h.countHolds, h.ids, h.n, h.ledgerOverlap, h.of, h.at], [true, true, 3, 3, 0, 0, at]);
  assert.equal(h.idsSha256, B.heldOutIdsHash(ids));
  assert.equal(B.contaminationOf(h, true), false);
  const stringified = B.heldOutOf(JSON.stringify({ at, n: 3, ids, idsSha256: M.sha256(JSON.stringify(ids)) }), {}, []);
  assert.equal(stringified.idsSha256Holds, false, 'a hash of JSON.stringify(ids) is not the hash the writer recorded');
  const tampered = B.heldOutOf(JSON.stringify({ at, n: 3, ids: ['gsm8k.6', 'gsm8k.12', 'gsm8k.19'], idsSha256: M.sha256(ids.join('\n')) }), {}, []);
  assert.equal(tampered.idsSha256Holds, false);
  assert.match(B.contaminationOf(tampered, true), /do not hash to the idsSha256/);
  const short = B.heldOutOf(JSON.stringify({ at, n: 4, ids, idsSha256: M.sha256(ids.join('\n')) }), {}, []);
  assert.equal(short.countHolds, false);
  assert.match(B.contaminationOf(short, true), /names 3 ids where its n says 4/);
  const noIds = B.heldOutOf(JSON.stringify({ at, n: 0 }), {}, []);
  assert.equal(noIds.idsSha256Holds, false, 'a file with no ids and no hash holds nothing');
  assert.notEqual(B.contaminationOf(noIds, true), false);
  const o = B.heldOutOf(good, {}, [{ source: 'gsm8k', id: 'gsm8k.12' }, { source: 'conceive', id: 'gsm8k.6' }]);
  assert.equal(o.ledgerOverlap, 1, 'only a gsm8k ledger row overlaps a gsm8k held-out id');
  assert.match(B.contaminationOf(o, true), /^1 of its ids are ledger rows \(gsm8k\.12\)$/);
  assert.match(B.contaminationOf(h, false), /^the mtime of self\/mistakes\.mjs is not later than the held-out file's at field$/);
  assert.match(B.contaminationOf(h, null), /^the mtime of self\/mistakes\.mjs is not later than the held-out file's at field$/);
  assert.match(B.contaminationOf({ absent: true, file: 'f.json' }, true), /f\.json is not on disk/);
  // A planted question the vocabulary reads, and one it cannot: shaped 1 and 0, and the lesson each row makes.
  const Q_SHAPES = 'A coat costs $80 and is sold at 25% off. What is the sale price?';
  const Q_NONE = 'Which element has the atomic number 1?';
  const shaped = B.heldOutOf(good, { gsm8k: { 6: { question: Q_SHAPES } } }, []);
  assert.deepEqual([shaped.of, shaped.shaped, shaped.share, shaped.byOp, shaped.unshapedExamples], [1, 1, 1, { percent: 1 }, []], 'only the id whose question is in the fixture is measured, and it shapes');
  const unshaped = B.heldOutOf(good, { gsm8k: { 6: { question: Q_NONE } } }, []);
  assert.deepEqual([unshaped.of, unshaped.shaped, unshaped.share, unshaped.byOp, unshaped.unshapedExamples], [1, 0, 0, {}, ['gsm8k.6']]);
  const lessonOf = (q) => {
    const row = { source: 'gsm8k', id: 'gsm8k.6', why: 'refused', prompt: null };
    Object.assign(row, M.shapeRow(row, { gsm8k: { 6: { question: q } } }));
    return M.lessonsOf([row]).map((l) => [l.shape, l.count, l.examples, l.ownerHint]);
  };
  assert.deepEqual(lessonOf(Q_SHAPES), [['percent', 1, ['gsm8k:gsm8k.6'], 'act/word.mjs (the word problem reader: one exact expression per problem)']]);
  assert.deepEqual(lessonOf(Q_NONE), [], 'an unshaped row makes no lesson');
  const order = B.codeOrderOf('2026-01-01T00:00:01.000Z', at);
  assert.deepEqual([order.mtimeLaterThanHeldOutAt, order.mtime, order.heldOutAt], [true, '2026-01-01T00:00:01.000Z', at]);
  assert.equal(B.codeOrderOf(at, at).mtimeLaterThanHeldOutAt, false, 'an mtime equal to the at is not later');
  assert.equal(B.codeOrderOf(null, at).mtimeLaterThanHeldOutAt, null);
  assert.match(order.check, /necessary, not sufficient/);
  const real = B.heldOutCoverage(M.ROOT, {}, []);
  assert.equal(real.absent, undefined, 'the held-out file is on disk');
  assert.equal(real.idsSha256Holds, true, 'the real held-out file: its ids hash to what it recorded');
  assert.equal(real.countHolds, true);
  assert.equal(real.ids, real.n);
  assert.equal(B.heldOutCoverage(NO_ROOT, {}, []).absent, true);
});

test('the bar needs every part; a contaminated split alone keeps it unmet', () => {
  const ok = { isTheBar: true, reask: { ranOnEvery: true }, limit: 0, injected: false, carries: true, matchAll: true, controlsHold: true, contaminated: false };
  assert.equal(B.barMetOf(ok), true);
  const bad = [['isTheBar', false], ['reask', null], ['limit', 5], ['injected', true], ['carries', false], ['matchAll', false], ['controlsHold', false], ['contaminated', 'a reason'], ['contaminated', undefined], ['contaminated', null]];
  for (const [k, x] of bad) assert.equal(B.barMetOf({ ...ok, [k]: x }), false, k + ' ' + x);
  assert.equal(B.barMetOf({ ...ok, reask: { ranOnEvery: false } }), false);
});

// ---------------------------------------------------------------- the control replies and the per-row controls
const HE = (name, lines) => ({ name, prompt: '// ' + name + '\nfunction ' + name + '(x){\n', stop_tokens: ['\nfunction ', '\n/*', '\n//', '\nconsole.log'], tests: "const assert = require('node:assert');\n\n\nfunction test() {\n  let candidate = " + name + ';\n' + lines + '\n}\n\ntest();' });
const BROKEN = '  assert.deepEqual(candidate("a\nb"),"ab");';

test('control builders: off by one, a regex example, a length text, HumanEval pairs, a compile check, colliding args', () => {
  assert.deepEqual(['504', '12:35', '3/4', 'mice', '99', '12345678901234567890'].map(B.offByOne), ['505', '12:36', '3/5', 'micex', '100', '12345678901234567891']);
  const ex = [
    ['The Old Man [Aa]nd [Tt]he Sea', '', 'The Old Man and The Sea'],
    ['^(yes|no)$', '', 'yes'],
    ['\\d{3}-\\d{4}', '', '000-0000'],
    ['a+b*c?', '', 'a'],
    ['(?=f)\\bfoo', '', 'foo'],
    ['x$\\ny', 'm', 'x\ny'],
    ['^a\\n^b$', 'm', 'a\nb'],
    ['^\\s*[-*+]\\s+red\\s*$[\\s\\S]*^\\s*[-*+]\\s+green\\s*$', 'im', '- red\n- green'],
  ];
  for (const [p, f, want] of ex) {
    assert.equal(B.regexExample(p, f), want, p);
    assert.ok(new RegExp(p, f).test(want), p + ' matches its example');
  }
  assert.equal(B.regexExample('(a)\\1'), null, 'a back reference is not built');
  assert.equal(B.regexExample('x$\\ny'), null, 'text after $ without the m flag is not built');
  assert.equal(B.regexExample('x$y', 'm'), null, 'text after $ that is not a line end never matches, so it is not built');
  assert.equal(B.regexExample('a^b', 'm'), null, '^ after text that is not a line end never matches, so it is not built');
  assert.equal(B.regexExample('[ab'), null, 'an unclosed class');
  assert.equal(B.lengthText({ words: { min: 3, max: 5 } }, 'low'), 'Word word word.');
  assert.equal(B.lengthText({ words: { min: 3, max: 5 } }, 'over'), 'Word word word word word word.');
  assert.equal(B.lengthText({ items: { min: 3, numbered: true } }, 'low'), '1. item 1\n2. item 2\n3. item 3');
  assert.equal(B.lengthText({ lines: { min: 2, max: 2 } }, 'over'), 'Line 1.\nLine 2.\nLine 3.');
  assert.equal(B.lengthText({ items: { min: 1 }, words: { min: 3 } }, 'low'), null);
  assert.equal(B.lengthText({ words: { min: 1 } }, 'over'), null, 'no max and a min under 2: nothing is over');
  assert.equal(B.lengthText({}, 'low'), null);
  const t = CTX.humaneval.get('t_double').tests;
  assert.deepEqual(B.humanEvalPairs(t), { entry: 't_double', pairs: [{ args: '[2]', want: '4' }, { args: '[5]', want: '10' }] });
  assert.equal(B.humanEvalPairs(t.replace('assert.deepEqual(candidate(5),10);', 'assert.ok(candidate(5) === 10);')).pairs, null, 'a line of another shape: no pairs');
  assert.equal(B.testsCompile(t), true);
  assert.equal(B.testsCompile(HE('t_broken', BROKEN).tests), false, 'a raw newline inside a double-quoted string does not compile');
  assert.equal(B.argsCollide([{ args: '[3]' }, { args: '[3.0]' }]), true, '3 and 3.0 are one number');
  assert.equal(B.argsCollide([{ args: '[2]' }, { args: '[5]' }]), false);
  assert.equal(B.argsCollide([{ args: '[nope(' }]), null);
  assert.match(B.goldFunction('t_int', [{ args: '[3]', want: 'true' }, { args: '[3.0]', want: 'false' }]).how, /in call order/);
  assert.match(B.goldFunction('t_double', [{ args: '[2]', want: '4' }]).how, /for its arguments/);
});

const CTX2 = {
  ...CTX,
  humaneval: new Map([
    ['t_double', CTX.humaneval.get('t_double')],
    ['t_int', HE('t_int', '  assert.deepEqual(candidate(3),true);\n  assert.deepEqual(candidate(3.0),false);')],
    ['t_broken', HE('t_broken', BROKEN)],
  ]),
  conceive: new Map([
    ['f1', CTX.conceive.get('f1')],
    ['c_contains', { id: 'c_contains', kind: 'fact', prompt: 'Name two colours.', grade: { type: 'contains', all: ['red', 'blue'] } }],
    ['c_regex', { id: 'c_regex', kind: 'fact', prompt: 'Name the book.', grade: { type: 'regex', pattern: 'The Old Man [Aa]nd [Tt]he Sea', flags: '' } }],
    ['c_length', { id: 'c_length', kind: 'write', prompt: 'Write three to five words.', grade: { type: 'length', words: { min: 3, max: 5 } } }],
    ['c_code', { id: 'c_code', kind: 'code', prompt: 'Write add(a, b).', grade: { type: 'code', entry: 'add', tests: [{ args: [1, 2], want: 3 }, { args: [2, 2], want: 4 }] } }],
  ]),
};
const R2 = (source, id, why, given = null) => ({ source, id, why, given });
const ROWS2 = [
  R2('gsm8k', 'gsm8k.0', 'wrong-model', '41'),
  R2('humaneval', 't_double', 'refused'), R2('humaneval', 't_int', 'wrong-model'), R2('humaneval', 't_broken', 'refused'),
  R2('conceive', 'f1', 'refused'), R2('conceive', 'c_contains', 'refused'), R2('conceive', 'c_regex', 'refused'), R2('conceive', 'c_length', 'refused'), R2('conceive', 'c_code', 'refused'),
  R2('answer', 'fixture.9@null', 'wrong-memory', '391'),
  R2('arc', 'a1', 'timeout'),
];
const memo = new Map();
const real = (r, t, ctx) => { const k = r.source + ':' + r.id + '\u0000' + t; if (!memo.has(k)) memo.set(k, M.gradeReask(r, t, ctx)); return memo.get(k); };
const controls = (gradeFn, rows = ROWS2, ctx = CTX2) => B.graderControls(rows, ctx, NO_ROOT, { gradeFn });

test('grader controls hold with the real grader: gold per row, wrong per row, the empty reply once, an unpassable row apart', async () => {
  const c = await controls(real);
  assert.equal(c.askable, 10, 'every row but ARC is re-askable');
  assert.deepEqual([c.gold.of, c.gold.fixed, c.gold.onDisk, c.gold.built, c.gold.unpassable, c.gold.unpassableIds, c.gold.none, c.gold.disagree], [10, 9, 3, 7, 1, ['humaneval:t_broken'], 0, []]);
  assert.deepEqual(c.gold.bySource.humaneval, { of: 3, fixed: 2, onDisk: 0, built: 3, unpassable: 1, none: 0 });
  assert.deepEqual([c.wrong.of, c.wrong.wrong, c.wrong.still, c.wrong.wrongNow, c.wrong.none, c.wrong.disagree], [10, 10, 3, 7, 0, []]);
  assert.deepEqual([c.regrade.of, c.regrade.wrong], [2, 2]);
  assert.deepEqual(c.empty, { calls: 1, row: 'gsm8k:gsm8k.0', answered: false, now: 'refused' });
  assert.equal(c.holds, true);
});

test('each grader control can fail, per row', async () => {
  const right = await controls(async () => ({ answered: true, ok: true, got: 'x' }));
  assert.deepEqual([right.wrong.wrong, right.wrong.disagree.length, right.regrade.wrong, right.empty.now, right.holds], [0, 10, 0, 'fixed', false], 'a grader that passes everything fails the wrong control on every row');
  assert.ok(right.gold.disagree.includes('humaneval:t_broken (read fixed though its tests do not compile)'));
  const refuse = await controls(async () => ({ answered: false, ok: false, got: null }));
  assert.deepEqual([refuse.gold.fixed, refuse.gold.disagree.length, refuse.wrong.wrong, refuse.holds], [0, 9, 0, false], 'a grader that refuses everything fails the gold control on every passable row');
  assert.equal(B.regexExample('The Old Man [Aa]nd [Tt]he Sea'), 'The Old Man and The Sea');
  const flipGold = await controls((r, t, ctx) => (r.id === 'c_regex' && t === 'The Old Man and The Sea' ? { answered: true, ok: false, got: t } : real(r, t, ctx)));
  assert.deepEqual([flipGold.gold.fixed, flipGold.gold.disagree, flipGold.wrong.wrong, flipGold.holds], [8, ['conceive:c_regex (read wrong-now)'], 10, false], 'one row whose gold reads wrong: exactly one disagreement');
  const flipWrong = await controls((r, t, ctx) => (r.id === 'gsm8k.0' && t === 'The answer is 43.' ? { answered: true, ok: true, got: '43' } : real(r, t, ctx)));
  assert.deepEqual([flipWrong.wrong.wrong, flipWrong.wrong.disagree, flipWrong.gold.fixed, flipWrong.holds], [9, ['gsm8k:gsm8k.0 (read fixed)'], 9, false], 'one row whose wrong reply reads fixed: exactly one disagreement');
  const answersEmpty = await controls((r, t, ctx) => (t === '' ? { answered: true, ok: false, got: '' } : real(r, t, ctx)));
  assert.deepEqual([answersEmpty.empty.calls, answersEmpty.empty.now, answersEmpty.gold.fixed, answersEmpty.wrong.wrong, answersEmpty.holds], [1, 'still', 9, 10, false], 'a grader that answers the empty reply fails the empty control alone');
  const passesBroken = await controls((r, t, ctx) => (r.id === 't_broken' && t.includes('function t_broken(...args)') ? { answered: true, ok: true, got: 'passed' } : real(r, t, ctx)));
  assert.deepEqual([passesBroken.gold.unpassable, passesBroken.gold.disagree, passesBroken.holds], [0, ['humaneval:t_broken (read fixed though its tests do not compile)'], false], 'a row whose tests do not compile may never read fixed');
  const ctx3 = { ...CTX2, conceive: new Map([...CTX2.conceive, ['c_backref', { id: 'c_backref', kind: 'fact', prompt: 'Say aa.', grade: { type: 'regex', pattern: '(a)\\1', flags: '' } }]]) };
  const noGold = await controls(real, [...ROWS2, R2('conceive', 'c_backref', 'refused')], ctx3);
  assert.deepEqual([noGold.gold.none, noGold.gold.noneIds, noGold.holds], [1, ['conceive:c_backref (no gold built for a regex rubric)'], false], 'a row with no gold built keeps the controls unmet');
  const noRegrade = await controls(real, ROWS2.map((r) => ({ ...r, given: null })));
  assert.deepEqual([noRegrade.regrade.of, noRegrade.holds], [0, false], 'no regrade row at all is not a held control');
});
