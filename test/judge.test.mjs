// test/judge.test.mjs: THE LOCKED JUDGE (judge/). expectOk on every clause, score with a missing row, the selector
// on hand-written result.json fixtures in temp candidate dirs (one survives, four die, each for its own clause), the
// lock drifting under an edited held-out row, a baseline made stale by a promotion or a code edit, a sloppy result
// failing closed, the held-out quote tripwire, the baseline harness able to print a non-zero score, and the real
// Day 1 sets (counts, no held-out q in dev, the control untouched). No network: nothing here opens a socket.
// Author: board 37 builder, item judge, 2026-09-30.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expectOk, expectFailures, expectErrors, score, wordCount } from '../judge/judge.mjs';
import { parseJsonl } from '../grow/contract.mjs';
import { organismPrint } from '../judge/select.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'judge-test-'));
process.on('exit', () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* best effort */ } });
const node = (args, cwd = ROOT) => spawnSync(process.execPath, args, { cwd, encoding: 'utf8', timeout: 120000 });
const jsonl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
const REFUSAL = 'I do not carry that yet: I answer greetings and questions about myself natively.';

// ------------------------------------------------------------------ expectOk, clause by clause
test('notRefusal fails on each refusal head and on null, and only on a head', () => {
  const e = { notRefusal: true };
  assert.equal(expectOk('nothing in memory matches solve.', e), false);
  assert.equal(expectOk('  Nothing in memory matches h', e), false, 'trimmed, case-insensitive');
  assert.equal(expectOk(REFUSAL, e), false);
  assert.equal(expectOk('I am growing a cell for this.', e), false);
  assert.equal(expectOk(null, e), false);
  assert.equal(expectOk(undefined, e), false);
  assert.equal(expectOk('He said nothing in memory matches, then answered.', e), true, 'a refusal phrase after the head is not a refusal');
  assert.equal(expectOk('Hello there.', e), true);
  assert.deepEqual(expectFailures(REFUSAL, e), ['the answer is a refusal']);
  assert.deepEqual(expectFailures(null, e), ['the answer is null']);
});

test('minWords and maxWords count runs of non-space', () => {
  assert.equal(wordCount('  one  two\nthree\t'), 3);
  assert.equal(expectOk('one two three', { minWords: 3 }), true);
  assert.equal(expectOk('one two three', { minWords: 4 }), false);
  assert.equal(expectOk('one two three', { maxWords: 3 }), true);
  assert.equal(expectOk('one two three', { maxWords: 2 }), false);
  assert.deepEqual(expectFailures('one two', { minWords: 6 }), ['the answer has 2 words, under 6']);
});

test('contains all, containsAny one, notContains none, equals whole: trimmed and case-insensitive', () => {
  const got = '  Paris is the CAPITAL of France. ';
  assert.equal(expectOk(got, { contains: ['paris', 'capital'] }), true);
  assert.equal(expectOk(got, { contains: ['paris', 'rome'] }), false);
  assert.deepEqual(expectFailures(got, { contains: ['paris', 'rome'] }), ['the answer does not contain "rome"']);
  assert.equal(expectOk(got, { containsAny: ['rome', 'PARIS'] }), true);
  assert.equal(expectOk(got, { containsAny: ['rome', 'berlin'] }), false);
  assert.equal(expectOk(got, { notContains: ['rome'] }), true);
  assert.equal(expectOk(got, { notContains: ['rome', 'france'] }), false);
  assert.equal(expectOk('  PARIS ', { equals: 'paris' }), true);
  assert.equal(expectOk('Paris is', { equals: 'paris' }), false);
  // every clause together, as the essay class uses them
  const essay = { minWords: 5, notRefusal: true, contains: ['salt'], containsAny: ['river', 'rock'] };
  assert.equal(expectOk('Salt comes from rivers wearing rock down.', essay), true);
  assert.equal(expectOk('Salt comes from somewhere, nobody knows.', essay), false);
});

test('an expect that asserts nothing, an unknown clause and a malformed clause fail closed; a null fails any expect', () => {
  assert.equal(expectOk('anything', {}), false);
  assert.deepEqual(expectFailures('anything', {}), ['expect has no clause']);
  assert.deepEqual(expectErrors({ contains: ['a'], notRefusal: true }), []);
  assert.equal(expectOk('anything', null), false);
  assert.deepEqual(expectFailures('anything', { contain: ['a'] }), ['unknown clause contain']);
  assert.deepEqual(expectFailures('anything', { contains: 'a' }), ['contains is not a list of words']);
  assert.deepEqual(expectFailures('anything', { contains: [] }), ['contains is not a list of words']);
  assert.deepEqual(expectFailures('anything', { minWords: 1.5 }), ['minWords is not a whole number']);
  assert.deepEqual(expectFailures('anything', { notRefusal: false }), ['notRefusal is not true']);
  assert.equal(expectOk(null, { maxWords: 5 }), false, 'a miss never passes, even an expect it would meet as empty text');
});

// ------------------------------------------------------------------ score
test('score matches rows to results by q, a missing row and a can-false row are not ok, rounded to 4 places', () => {
  const rows = [
    { q: 'a', expect: { contains: ['x'] } }, { q: 'b', expect: { contains: ['x'] } },
    { q: 'c', expect: { contains: ['x'] } }, { q: 'd', expect: { contains: ['x'] } },
  ];
  const s = score(rows, [{ q: ' A ', got: 'x' }, { q: 'b', got: 'x' }, { q: 'd', got: 'x', can: false }]);
  assert.equal(s.n, 4);
  assert.equal(s.ok, 2);
  assert.equal(s.score, 0.5);
  assert.deepEqual(s.rows.map((r) => r.ok), [true, true, false, false]);
  assert.deepEqual(s.rows[2].why, ['no result for this row']);
  assert.deepEqual(s.rows[3].why, ['the cell said it cannot answer']);
  const t = score(rows.slice(0, 3), [{ q: 'a', got: 'x' }, { q: 'b', got: 'x' }]);
  assert.equal(t.score, 0.6667);
  assert.deepEqual(score([], []), { n: 0, ok: 0, score: 0, rows: [] });
});

// ------------------------------------------------------------------ the selector, on a temp root
const CLS = 'probe-class';
const HELD = ['alpha one', 'beta two', 'gamma three', 'delta four'];
const DEV = ['dev one', 'dev two'];
const CONTROL = ['hi', 'what is 17 times 23', 'What is the capital of France?'];
const good = (q) => 'I read "' + q + '" and here is the answer.';
const EXPECT = (q) => ({ notRefusal: true, contains: ['"' + q + '"'] });

function makeRoot(name) {
  const root = path.join(TMP, name);
  fs.mkdirSync(path.join(root, 'judge', 'heldout'), { recursive: true });
  fs.mkdirSync(path.join(root, 'judge', 'dev'), { recursive: true });
  fs.mkdirSync(path.join(root, 'grow'), { recursive: true });
  for (const f of ['judge.mjs', 'select.mjs', 'verify.mjs', 'baseline.mjs', 'lock.mjs']) fs.copyFileSync(path.join(ROOT, 'judge', f), path.join(root, 'judge', f));
  fs.copyFileSync(path.join(ROOT, 'grow', 'contract.mjs'), path.join(root, 'grow', 'contract.mjs'));
  fs.writeFileSync(path.join(root, 'judge', 'heldout', CLS + '.jsonl'), jsonl(HELD.map((q) => ({ q, expect: EXPECT(q) }))));
  fs.writeFileSync(path.join(root, 'judge', 'dev', CLS + '.jsonl'), jsonl(DEV.map((q) => ({ q, expect: EXPECT(q) }))));
  fs.writeFileSync(path.join(root, 'judge', 'control.jsonl'), jsonl(CONTROL.map((q) => ({ q }))));
  const r = node([path.join(root, 'judge', 'lock.mjs'), '--by', 'judge test', '--root', root]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(JSON.parse(r.stdout.trim()).files, 7);
  return root;
}

function result(over = {}) {
  return {
    candidate: 'gen-1/a/probe-cell', id: 'probe-cell', class: CLS, backend: 'here', session: null, node: process.version,
    startedAt: '2026-09-30T20:00:00.000Z', wallMs: 10, cpuMs: 5,
    validate: { ok: true, errors: [] }, tests: { exitCode: 0, passed: 2, failed: 0, tail: '# pass 2' },
    examples: DEV.map((q) => ({ q, can: true, got: good(q) })),
    // 3 of 4 held-out rows right, the fourth a null
    heldout: HELD.map((q, i) => ({ q, can: i < 3, got: i < 3 ? good(q) : null, ms: 1 })),
    control: CONTROL.map((q) => ({ q, can: false })),
    exitCode: 0, error: null, ...over,
  };
}

// the cell an arm wrote: it quotes its DEV prompts (allowed) and no held-out prompt (the tripwire's control)
const CELL = "export const meta = { id: 'probe-cell', class: '" + CLS + "', generation: 1, lane: 'a', grownFrom: ['dev one', 'dev two'], version: 1 };\n"
  + "export function can(q) { return typeof q === 'string' && q.length > 0; }\n"
  + "export function answer(q) { return 'I read \"' + q + '\" and here is the answer.'; }\n"
  + "export const examples = [{ q: 'dev one', expect: { contains: ['\"dev one\"'] } }, { q: \"dev two\", expect: { contains: ['\"dev two\"'] } }];\n";
const TEST = "import { test } from 'node:test';\nimport { answer } from './cell.mjs';\ntest('dev one', () => { if (!answer('dev one').includes('\"dev one\"')) throw new Error('no echo'); });\n";

function writeBaseline(root, bFile, base) {
  fs.mkdirSync(path.dirname(bFile), { recursive: true });
  fs.writeFileSync(bFile, JSON.stringify({ class: CLS, at: '2026-09-30T20:00:00.000Z', n: HELD.length, organismPrint: organismPrint(root), ...base }));
}

function candidate(root, name, res, base = { rows: HELD.map((q) => ({ q, got: REFUSAL, ok: false })), score: 0 }, files = {}) {
  const dir = path.join(root, 'cands', name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(res));
  fs.writeFileSync(path.join(dir, 'examples.jsonl'), jsonl(DEV.map((q) => ({ q, expect: EXPECT(q) }))));
  for (const [f, text] of Object.entries({ 'cell.mjs': CELL, 'test.mjs': TEST, ...files })) fs.writeFileSync(path.join(dir, f), text);
  const bFile = path.join(root, 'baselines', name + '.json');
  if (base) writeBaseline(root, bFile, base);
  return { dir, bFile };
}

function runSelect(root, dir, bFile) {
  const r = node([path.join(root, 'judge', 'select.mjs'), dir, '--baseline', bFile, '--root', root]);
  const file = path.join(dir, 'verdict.json');
  return { r, v: fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null };
}

const KEYS = ['candidate', 'id', 'class', 'survived', 'why', 'lockOk', 'judgeSha', 'examples', 'heldout', 'baseline', 'control', 'tests', 'at'];

test('select (a): every clause holds, held-out 3/4 against a baseline of 0/4: survives, why empty', () => {
  const root = makeRoot('a');
  const { dir, bFile } = candidate(root, 'a', result());
  const { r, v } = runSelect(root, dir, bFile);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const line = JSON.parse(r.stdout.trim());
  assert.equal(line.survived, true);
  assert.equal(v.survived, true);
  assert.deepEqual(v.why, []);
  for (const k of KEYS) assert.ok(k in v, 'verdict key ' + k);
  assert.equal(v.lockOk, true);
  assert.match(v.judgeSha, /^[0-9a-f]{64}$/);
  assert.deepEqual(v.heldout, { n: 4, ok: 3, score: 0.75 });
  assert.equal(v.baseline.score, 0);
  assert.equal(v.baseline.ok, 0);
  assert.equal(v.baseline.n, 4);
  assert.deepEqual(v.control, { n: 3, shadows: 0 });
  assert.deepEqual(v.examples, { n: 2, ok: 2 });
  assert.deepEqual(v.tests, { passed: 2, failed: 0 });
  assert.equal(v.id, 'probe-cell');
  assert.equal(v.class, CLS);
});

test('select (b): one control row answered by can(q): dies on the shadow alone', () => {
  const root = makeRoot('b');
  const res = result({ control: CONTROL.map((q) => ({ q, can: q === 'hi' })) });
  const { dir, bFile } = candidate(root, 'b', res);
  const { r, v } = runSelect(root, dir, bFile);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(v.survived, false);
  assert.deepEqual(v.why, ['the cell shadows a right answer: "hi"']);
  assert.deepEqual(v.control, { n: 3, shadows: 1 });
  assert.deepEqual(v.heldout, { n: 4, ok: 3, score: 0.75 }, 'the other clauses still graded');
});

test('select (c): held-out 3/4 equal to a baseline of 3/4: dies, a tie is not better', () => {
  const root = makeRoot('c');
  const base = { rows: HELD.map((q, i) => ({ q, got: i < 3 ? good(q) : REFUSAL })), score: 0.75 };
  const { dir, bFile } = candidate(root, 'c', result(), base);
  const { v } = runSelect(root, dir, bFile);
  assert.equal(v.survived, false);
  assert.deepEqual(v.why, ["held-out score 0.75 (3/4) is not above the baseline's 0.75 (3/4)"]);
  assert.equal(v.baseline.score, 0.75);
});

test('select (d): one of the cell\'s own tests failed: dies on the tests alone', () => {
  const root = makeRoot('d');
  const { dir, bFile } = candidate(root, 'd', result({ tests: { exitCode: 1, passed: 1, failed: 1, tail: '# fail 1' } }));
  const { v } = runSelect(root, dir, bFile);
  assert.equal(v.survived, false);
  assert.deepEqual(v.why, ["the cell's tests failed: 1 failed, exit code 1"]);
  assert.deepEqual(v.tests, { passed: 1, failed: 1 });
});

test('select (e): one held-out row edited after the lock: verify prints LOCK DRIFT, select refuses with lockOk false', () => {
  const root = makeRoot('e');
  const { dir, bFile } = candidate(root, 'e', result());
  // the same candidate survives on the untouched root (so the refusal below is the drift and nothing else)
  assert.equal(runSelect(root, dir, bFile).v.survived, true);
  const ok = node([path.join(root, 'judge', 'verify.mjs'), '--root', root]);
  assert.equal(ok.status, 0);
  assert.equal(ok.stdout.trim(), 'LOCK OK 7 files');
  const f = path.join(root, 'judge', 'heldout', CLS + '.jsonl');
  const rows = parseJsonl(fs.readFileSync(f, 'utf8'));
  rows[3].expect = { notRefusal: true }; // one clause dropped from one row: the organism grading itself up
  fs.writeFileSync(f, jsonl(rows));
  const bad = node([path.join(root, 'judge', 'verify.mjs'), '--root', root]);
  assert.equal(bad.status, 1);
  assert.equal(bad.stdout.trim(), 'LOCK DRIFT judge/heldout/' + CLS + '.jsonl');
  const { r, v } = runSelect(root, dir, bFile);
  assert.equal(r.status, 1);
  assert.match(r.stdout.trim(), /^LOCK DRIFT judge\/heldout\/probe-class\.jsonl: the judge refused, survived false/);
  assert.equal(v.survived, false);
  assert.equal(v.lockOk, false);
  assert.deepEqual(v.why, ['the judge drifted: judge/heldout/' + CLS + '.jsonl']);
});

test('the lock also drifts on an edited grader, a deleted LOCK.json and an unlocked held-out set', () => {
  const root = makeRoot('drift');
  const verify = () => node([path.join(root, 'judge', 'verify.mjs'), '--root', root]).stdout.trim();
  assert.equal(verify(), 'LOCK OK 7 files');
  fs.writeFileSync(path.join(root, 'judge', 'heldout', 'new-class.jsonl'), jsonl([{ q: 'x', expect: { contains: ['x'] } }]));
  assert.equal(verify(), 'LOCK DRIFT judge/heldout/new-class.jsonl');
  fs.rmSync(path.join(root, 'judge', 'heldout', 'new-class.jsonl'));
  const j = path.join(root, 'judge', 'judge.mjs');
  const src = fs.readFileSync(j, 'utf8');
  fs.writeFileSync(j, src.replace("return ['expect has no clause']", 'return []'));
  assert.equal(verify(), 'LOCK DRIFT judge/judge.mjs');
  fs.writeFileSync(j, src.replace(/\n/g, '\r\n'));
  assert.equal(verify(), 'LOCK OK 7 files', 'a CRLF checkout of the same text is not drift');
  fs.rmSync(path.join(root, 'judge', 'LOCK.json'));
  assert.equal(verify(), 'LOCK DRIFT judge/LOCK.json');
});

test('select lists every failed clause at once, and refuses a held-out leak, a tampered baseline and an unprobed control', () => {
  const root = makeRoot('all');
  const res = result({
    validate: { ok: false, errors: ['no export named can'] },
    tests: { exitCode: 0, passed: 0, failed: 0, tail: '' },
    examples: [{ q: 'dev one', can: true, got: REFUSAL }, { q: 'alpha one', can: true, got: good('alpha one') }],
    heldout: [],
    control: [{ q: 'hi', can: true }],
    error: 'sandbox timed out', exitCode: 124,
  });
  const base = { rows: HELD.map((q, i) => ({ q, got: i === 0 ? good(q) : REFUSAL })), score: 0 };
  const { dir, bFile } = candidate(root, 'all', res, base);
  const { v } = runSelect(root, dir, bFile);
  assert.equal(v.survived, false);
  assert.deepEqual(v.why, [
    'the baseline file says score 0 but its rows grade 0.25',
    'the sandbox run failed: sandbox timed out',
    'the sandbox run exited 124',
    'the cell is not a valid cell: no export named can',
    "the cell's tests ran no test",
    'the cell shadows a right answer: "hi"',
    'control rows not probed to a false can(q): "what is 17 times 23", "What is the capital of France?"',
    'an example failed: "dev one" (the answer is a refusal; the answer does not contain ""dev one"")',
    'an example failed: "alpha one" (no expect in the dev set or examples.jsonl)',
    'the cell was grown on held-out rows: "alpha one"',
    'held-out rows missing from result.json: "alpha one", "beta two", "gamma three", "delta four"',
    "held-out score 0 (0/4) is not above the baseline's 0.25 (1/4)",
  ]);
});

test('select with no baseline fails with the line that says how to make one; --help prints usage', () => {
  const root = makeRoot('nob');
  const { dir } = candidate(root, 'nob', result(), null);
  const r = node([path.join(root, 'judge', 'select.mjs'), dir, '--root', root]);
  assert.equal(r.status, 1);
  assert.equal(r.stdout.trim(), 'no baseline for ' + CLS + ': run node judge/baseline.mjs ' + CLS);
  assert.equal(fs.existsSync(path.join(dir, 'verdict.json')), false);
  const h = node([path.join(ROOT, 'judge', 'select.mjs'), '--help']);
  assert.equal(h.status, 0);
  assert.match(h.stdout, /^usage: node judge\/select\.mjs <candidateDir>/);
  const none = node([path.join(root, 'judge', 'select.mjs'), path.join(root, 'nowhere'), '--root', root]);
  assert.equal(none.status, 1);
  assert.match(none.stdout, /^no readable result\.json in /);
});

test('select (f): a baseline taken before a promotion, or before an edit to the organism code, is refused; re-measured, it passes', () => {
  const root = makeRoot('f');
  const { dir, bFile } = candidate(root, 'f', result());
  assert.equal(runSelect(root, dir, bFile).v.survived, true, 'the control: the same candidate on the same organism survives');
  // a promotion lands: grown/ now holds generation 1 with one cell, and the baseline file is the old one
  fs.mkdirSync(path.join(root, 'grown', 'cells'), { recursive: true });
  fs.writeFileSync(path.join(root, 'grown', 'index.json'), JSON.stringify({ generation: 1, cells: [{ id: 'old-cell', class: CLS, generation: 1, lane: 'a', file: 'cells/old-cell.mjs' }] }));
  fs.writeFileSync(path.join(root, 'grown', 'cells', 'old-cell.mjs'), CELL);
  let { v } = runSelect(root, dir, bFile);
  assert.equal(v.survived, false);
  assert.deepEqual(v.why, ['the baseline was measured before grown/ changed (generation null, 0 cells; now generation 1, 1 cells): run node judge/baseline.mjs ' + CLS]);
  // re-measured on the organism as it is now, the same candidate is graded again
  writeBaseline(root, bFile, { rows: HELD.map((q) => ({ q, got: REFUSAL })), score: 0 });
  assert.equal(runSelect(root, dir, bFile).v.survived, true);
  // an edit to the organism's answer path (and to a module it imports) makes the baseline stale again
  fs.mkdirSync(path.join(root, 'act'), { recursive: true });
  fs.writeFileSync(path.join(root, 'act', 'prompt.mjs'), "import { x } from './helper.mjs';\nexport const ask = () => x;\n");
  fs.writeFileSync(path.join(root, 'act', 'helper.mjs'), 'export const x = 1;\n');
  ({ v } = runSelect(root, dir, bFile));
  assert.equal(v.survived, false);
  assert.deepEqual(v.why, ['the baseline was measured on other organism code (the import closure of act/prompt.mjs and seeds/basic.mjs changed): run node judge/baseline.mjs ' + CLS]);
  writeBaseline(root, bFile, { rows: HELD.map((q) => ({ q, got: REFUSAL })), score: 0 });
  assert.equal(runSelect(root, dir, bFile).v.survived, true);
  assert.equal(organismPrint(root).files, 3, 'act/prompt.mjs, the helper it imports, and the missing seeds/basic.mjs');
  fs.writeFileSync(path.join(root, 'act', 'helper.mjs'), 'export const x = 2;\n');
  assert.equal(runSelect(root, dir, bFile).v.survived, false, 'an imported module is part of the organism');
  // a baseline with no fingerprint at all is refused
  writeBaseline(root, bFile, { rows: HELD.map((q) => ({ q, got: REFUSAL })), score: 0, organismPrint: undefined });
  ({ v } = runSelect(root, dir, bFile));
  assert.equal(v.survived, false);
  assert.deepEqual(v.why, ['the baseline records no organism fingerprint: run node judge/baseline.mjs ' + CLS]);
});

test('select (g): a sloppy result fails closed: ok with errors, no error list, held-out rows without can, no exitCode or error', () => {
  const root = makeRoot('g');
  const cases = [
    ['valerr', result({ validate: { ok: true, errors: ['meta.id does not match'] } }), ['the validation says ok but lists errors: meta.id does not match']],
    ['nolist', result({ validate: { ok: true } }), ['the validation records no error list']],
    ['cannull', result({ heldout: HELD.map((q, i) => ({ q, got: i < 3 ? good(q) : null, ms: 1 })) }),
      ['held-out rows with no can(q) recorded: ' + HELD.map((q) => '"' + q + '"').join(', '), "held-out score 0 (0/4) is not above the baseline's 0 (0/4)"]],
    ['noexit', (() => { const r = result(); delete r.exitCode; delete r.error; return r; })(), ['the result records no sandbox error field', 'the result records no sandbox exit code']],
    ['nullexit', result({ exitCode: null }), ['the result records no sandbox exit code']],
  ];
  for (const [name, res, why] of cases) {
    const { dir, bFile } = candidate(root, name, res);
    const { r, v } = runSelect(root, dir, bFile);
    assert.equal(r.status, 0, name + ': ' + r.stdout + r.stderr);
    assert.equal(v.survived, false, name);
    assert.deepEqual(v.why, why, name);
  }
  // one row without can among three graded ones: the row does not count and the run fails, the others still grade
  const mixed = result({ heldout: HELD.map((q, i) => (i === 0 ? { q, got: good(q), ms: 1 } : { q, can: i < 3, got: i < 3 ? good(q) : null, ms: 1 })) });
  const { dir, bFile } = candidate(root, 'mixed', mixed);
  const { v } = runSelect(root, dir, bFile);
  assert.equal(v.survived, false);
  assert.deepEqual(v.heldout, { n: 4, ok: 2, score: 0.5 });
  assert.deepEqual(v.why, ['held-out rows with no can(q) recorded: "alpha one"']);
});

test('select (g2): a held-out row the result does not carry at all is named and kills the run; the rows it carries still grade', () => {
  const root = makeRoot('g2');
  // one of four held-out rows in result.json, right: a partial result scores 1/4 above a baseline of 0 and still dies
  const partial = result({ heldout: [{ q: HELD[0], can: true, got: good(HELD[0]), ms: 1 }] });
  const { dir, bFile } = candidate(root, 'partial', partial);
  const { r, v } = runSelect(root, dir, bFile);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(v.survived, false);
  assert.deepEqual(v.heldout, { n: 4, ok: 1, score: 0.25 });
  assert.deepEqual(v.why, ['held-out rows missing from result.json: ' + HELD.slice(1).map((q) => '"' + q + '"').join(', ')]);
  // the control: the same rows all carried survive (select (a) in one line)
  const whole = candidate(root, 'whole', result({ heldout: HELD.map((q, i) => ({ q, can: i < 3, got: i < 3 ? good(q) : null, ms: 1 })) }));
  assert.equal(runSelect(root, whole.dir, whole.bFile).v.survived, true);
});

test('select (h): a held-out prompt quoted in the cell\'s own files kills it; dev quotes and a result.json do not', () => {
  const root = makeRoot('h');
  const cheat = CELL + "const SEEN = { 'beta two': 'I read \"beta two\" and here is the answer.' };\n";
  const { dir, bFile } = candidate(root, 'h', result(), undefined, { 'cell.mjs': cheat, 'notes.md': 'tried it on `GAMMA THREE` too\n' });
  const { v } = runSelect(root, dir, bFile);
  assert.equal(v.survived, false);
  assert.deepEqual(v.why, ['the cell\'s files quote held-out prompts: "beta two", "gamma three"']);
  // the control: result.json carries every held-out q (the runner wrote it) and the clean cell quotes dev rows only
  const clean = candidate(root, 'h-clean', result());
  assert.match(fs.readFileSync(path.join(clean.dir, 'result.json'), 'utf8'), /beta two/);
  assert.match(fs.readFileSync(path.join(clean.dir, 'cell.mjs'), 'utf8'), /'dev one'/);
  assert.equal(runSelect(root, clean.dir, clean.bFile).v.survived, true);
});

// ------------------------------------------------------------------ the baseline harness can print a non-zero score
test('the baseline harness grades a row the organism answers as ok and a row it refuses as not (its control)', async () => {
  const { runOrganism } = await import('../judge/baseline.mjs');
  const rows = [
    { q: 'what is 17 times 23', expect: { contains: ['391'], notRefusal: true } },
    { q: 'h', expect: { notRefusal: true, minWords: 6, contains: ['"h"'] } },
  ];
  const run = await runOrganism(rows, { knowledge: false });
  const s = score(rows, run.rows);
  assert.equal(s.n, 2);
  assert.equal(s.ok, 1);
  assert.deepEqual(s.rows.map((r) => r.ok), [true, false]);
  assert.match(run.rows[1].got, /^(?:nothing in memory matches|I do not carry that yet)/);
});

// ------------------------------------------------------------------ the real Day 1 sets and the real lock
const CLASSES = ['fragment', 'mash', 'capital-of', 'essay-ocean-salt'];
const read = (rel) => parseJsonl(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

test('the four classes carry 6 to 10 dev rows and 10 to 16 held-out rows, and no held-out q is in dev', () => {
  let overlap = 0;
  for (const c of CLASSES) {
    const dev = read('judge/dev/' + c + '.jsonl');
    const held = read('judge/heldout/' + c + '.jsonl');
    assert.ok(dev.length >= 6 && dev.length <= 10, c + ' dev ' + dev.length);
    assert.ok(held.length >= 10 && held.length <= 16, c + ' heldout ' + held.length);
    const devQ = new Set(dev.map((r) => r.q.trim().toLowerCase()));
    overlap += held.filter((r) => devQ.has(r.q.trim().toLowerCase())).length;
    assert.equal(new Set(held.map((r) => r.q.trim().toLowerCase())).size, held.length, c + ' held-out rows are distinct');
    for (const r of [...dev, ...held]) assert.deepEqual(expectErrors(r.expect), [], c + ' expect is well formed: ' + r.q);
  }
  assert.equal(overlap, 0);
});

test('each class expect is the one the board wrote: echo for fragment and mash, the capital, the salt essay', () => {
  for (const c of ['fragment', 'mash']) {
    for (const r of [...read('judge/dev/' + c + '.jsonl'), ...read('judge/heldout/' + c + '.jsonl')]) {
      assert.deepEqual(r.expect, { notRefusal: true, minWords: 6, contains: ['"' + r.q + '"'] });
      // the echo is a real test: the bare letters without the quotes do not pass it
      assert.equal(expectOk('you typed ' + r.q + ' and nothing more, say more', r.expect), false);
      assert.equal(expectOk('You typed "' + r.q + '". Tell me more, please.', r.expect), true);
    }
  }
  for (const r of read('judge/heldout/capital-of.jsonl')) {
    assert.equal(r.expect.notRefusal, true);
    assert.equal(r.expect.contains.length, 1);
    assert.doesNotMatch(r.q, /\?$|^what/i, 'the bare shape, not the question the tier answers: ' + r.q);
  }
  for (const r of read('judge/heldout/essay-ocean-salt.jsonl')) {
    assert.deepEqual(r.expect, { minWords: 150, notRefusal: true, contains: ['salt'], containsAny: ['river', 'rivers', 'rock', 'rocks', 'mineral', 'minerals', 'evaporat'] });
  }
});

test('the control is the 12 prompts the board named, and no dev or held-out q is a control q', () => {
  const control = read('judge/control.jsonl');
  assert.deepEqual(control.map((r) => r.q), ['hi', 'hello', 'who are you', 'what can you do', 'thanks', 'bye', 'what is 17 times 23', '2+2', 'solve 3x+2=11', 'What is the capital of France?', 'What is Paris?', 'define ocean']);
  const cq = new Set(control.map((r) => r.q.trim().toLowerCase()));
  for (const c of CLASSES) for (const kind of ['dev', 'heldout']) for (const r of read('judge/' + kind + '/' + c + '.jsonl')) assert.equal(cq.has(r.q.trim().toLowerCase()), false, r.q);
});

test('the real judge verifies: judge/verify.mjs prints LOCK OK over every held-out set and grow/contract.mjs', () => {
  const r = node([path.join(ROOT, 'judge', 'verify.mjs')]);
  assert.equal(r.stdout.trim(), 'LOCK OK 10 files');
  assert.equal(r.status, 0);
  const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'judge', 'LOCK.json'), 'utf8'));
  assert.deepEqual(Object.keys(lock.files).sort(), ['grow/contract.mjs', 'judge/baseline.mjs', 'judge/control.jsonl', ...CLASSES.map((c) => 'judge/heldout/' + c + '.jsonl'), 'judge/judge.mjs', 'judge/select.mjs', 'judge/verify.mjs'].sort());
  assert.ok(lock.by && lock.lockedAt && /re-locks nothing/.test(lock.rule));
});
