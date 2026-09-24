// test/code.test.mjs: the sandbox, the loop and the fixture.
//
// Every claim here is graded against a control that differs in ONE thing: the escaping
// candidate is checked beside a candidate of the same shape that does not escape, the
// endless candidate beside a fast one under the same limit, and the null provider beside
// the probe cache, which records every base a socket was opened to.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCases, renderValue, sameValue, SANDBOX_GLOBALS } from '../act/run.mjs';
import { solveCode, entryName, extractCode, firstPrompt } from '../act/code.mjs';
import {
  buildTasks, DEFAULT_SEED, loadFixture, refEvalExpr, planArms, wilson, nFor95,
  args, shapeOf, VERDICTS, ARMS, run, verdictPathFor,
} from '../bench/code.mjs';
import { resetProbeCache, probedBases } from '../act/llm.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const FIXTURE = path.join(ROOT, 'bench', 'fixtures', 'code-tasks.json');

// ---------------------------------------------------------------- the sandbox
test('the sandbox runs a correct function and grades it passed, and a wrong one failed', async () => {
  const right = await runCases('function add(a, b) { return a + b; }', [
    { args: [1, 2], expected: 3 },
    { args: [-4, 4], expected: 0 },
    { args: [0.5, 0.25], expected: 0.75 },
  ], { entry: 'add' });
  assert.equal(right.passed, 3);
  assert.equal(right.failed, 0);
  assert.equal(right.error, null);
  assert.ok(right.cases.every((c) => c.ok && c.error === null));
  // The control: the same three cases, one character different in the candidate.
  const wrong = await runCases('function add(a, b) { return a - b; }', [
    { args: [1, 2], expected: 3 },
    { args: [-4, 4], expected: 0 },
    { args: [0.5, 0.25], expected: 0.75 },
  ], { entry: 'add' });
  assert.equal(wrong.passed, 0);
  assert.equal(wrong.failed, 3);
  assert.equal(wrong.cases[0].got, -1);
});

test('a candidate that never returns is terminated at the deadline and counted failed', async () => {
  const limitMs = 600;
  const endless = await runCases('function spin() { while (true) {} }', [{ args: [], expected: 1 }], { entry: 'spin', limitMs });
  assert.equal(endless.passed, 0);
  assert.equal(endless.failed, 1);
  const row = endless.cases[0];
  assert.ok(row.ms >= limitMs, 'the case ran at least the limit: ' + row.ms + ' ms against ' + limitMs);
  assert.match(row.error, /timeout/);
  assert.match(row.error, /terminated/);
  // The control, same limit, same runner: a candidate that returns costs a fraction of it.
  const quick = await runCases('function spin() { return 1; }', [{ args: [], expected: 1 }], { entry: 'spin', limitMs });
  assert.equal(quick.passed, 1);
  assert.ok(quick.cases[0].ms < limitMs, 'the control returned well inside the limit: ' + quick.cases[0].ms + ' ms');
});

test('a candidate that reaches for process, require, fetch or the filesystem fails, and this process is untouched', async () => {
  const mark = path.join(tmpdir(), 'brain-sandbox-escape-' + process.pid + '.txt').split('\\').join('/');
  const reaches = [
    ['process', 'function f() { return process.pid; }'],
    ['require', 'function f() { return require("node:os").hostname(); }'],
    ['fetch', 'function f() { return fetch("http://127.0.0.1:1/"); }'],
    ['filesystem', 'function f() { return require("node:fs").writeFileSync("' + mark + '", "escaped"); }'],
    ['globalThis.process', 'function f() { return globalThis.process.version; }'],
    ['Function constructor', 'function f() { return (function () {}).constructor("return 1")(); }'],
  ];
  for (const [what, code] of reaches) {
    const r = await runCases(code, [{ args: [], expected: 'anything' }], { entry: 'f' });
    assert.equal(r.failed, 1, what + ' must not pass');
    assert.ok(typeof r.cases[0].error === 'string' && r.cases[0].error.length > 0, what + ' must record an error');
    assert.match(r.cases[0].error, /Error/, what + ': ' + r.cases[0].error);
  }
  // The four the contract names get a ReferenceError, because the name is simply not there.
  for (const [what, code] of reaches.slice(0, 4)) {
    const r = await runCases(code, [{ args: [], expected: 'anything' }], { entry: 'f' });
    assert.match(r.cases[0].error, /^ReferenceError: /, what + ': ' + r.cases[0].error);
  }
  assert.equal(existsSync(mark), false, 'the candidate wrote nothing to the filesystem');
  // The control: this process still has everything the candidate could not reach.
  assert.equal(typeof process.pid, 'number');
  const ok = await runCases('function f() { return Math.max(1, 2); }', [{ args: [], expected: 2 }], { entry: 'f' });
  assert.equal(ok.passed, 1, 'the runner still runs a candidate that stays inside the sandbox');
});

test('the sandbox global holds the allowed names and none of the forbidden ones', async () => {
  const code = 'function names() { return Object.getOwnPropertyNames(globalThis).sort(); }';
  const r = await runCases(code, [{ args: [], expected: null }], { entry: 'names' });
  const got = r.cases[0].got;
  assert.ok(Array.isArray(got));
  for (const name of SANDBOX_GLOBALS) assert.ok(got.includes(name), name + ' is on the sandbox global');
  for (const gone of ['process', 'require', 'fetch', 'WebAssembly', 'Atomics', 'SharedArrayBuffer', 'setTimeout', 'console', 'Date', 'Promise', 'Function', 'eval']) {
    assert.equal(got.includes(gone), false, gone + ' is not on the sandbox global');
  }
});

test('a candidate that throws is a failed case and not a crash', async () => {
  const r = await runCases('function f(x) { if (x < 0) throw new Error("negative"); return x; }', [
    { args: [2], expected: 2 },
    { args: [-1], expected: -1 },
    { args: [5], expected: 5 },
  ], { entry: 'f' });
  assert.equal(r.passed, 2);
  assert.equal(r.failed, 1);
  assert.equal(r.cases[1].error, 'Error: negative');
  // The case after the throw still ran, which is what "not a crash" means here.
  assert.equal(r.cases[2].ok, true);
});

test('a candidate that is not code at all fails every case with the syntax error recorded', async () => {
  const r = await runCases('Here is the function you asked for.', [{ args: [], expected: 1 }], { entry: 'f' });
  assert.equal(r.failed, 1);
  assert.match(r.cases[0].error, /SyntaxError/);
  assert.match(String(r.error), /SyntaxError/);
});

// ---------------------------------------------------------------- the one comparison rule
test('a BigInt result compares equal to the fixture string, by one rule for both sides', async () => {
  assert.equal(renderValue(10n ** 30n), '1000000000000000000000000000000');
  assert.equal(sameValue(12345678901234567890n, '12345678901234567890'), true);
  assert.equal(sameValue(12345678901234567890n, '12345678901234567891'), false);
  const r = await runCases('function m(a, b) { return BigInt(a) * BigInt(b); }', [
    { args: ['123456789012345678901234567890', '987654321'], expected: '121932631124828532112482853211126352690' },
  ], { entry: 'm' });
  assert.equal(r.passed, 1, JSON.stringify(r.cases[0]));
  // The control: a double cannot hold that product, so the arithmetic a small model reaches
  // for first is wrong, and the same ruler says so.
  const asNumber = await runCases('function m(a, b) { return String(Number(a) * Number(b)); }', [
    { args: ['123456789012345678901234567890', '987654321'], expected: '121932631124828532112482853211126352690' },
  ], { entry: 'm' });
  assert.equal(asNumber.failed, 1);
});

test('renderValue normalises the values JSON cannot carry, the same way on both sides', () => {
  assert.equal(renderValue(-0), 0);
  assert.equal(renderValue(NaN), '@NaN');
  assert.equal(renderValue(Infinity), '@Infinity');
  assert.equal(renderValue(undefined), '@undefined');
  assert.deepEqual(renderValue({ b: 1n, a: [2, -0] }), { a: [2, 0], b: '1' });
  assert.equal(sameValue({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
});

// ---------------------------------------------------------------- the loop
test('solveCode with provider null is graded, spends 0 rounds, and opens no socket', async () => {
  resetProbeCache();
  const before = probedBases().length;
  const task = {
    id: 'unit.null', kind: 'unit', entry: 'add', signature: 'add(a, b)', spec: 'add two numbers',
    visible: [{ args: [1, 1], expected: 2 }],
    hidden: [{ args: [2, 2], expected: 4 }, { args: [3, 3], expected: 6 }],
  };
  const r = await solveCode(task, { provider: 'null' });
  assert.equal(r.absent, false);
  assert.equal(r.rounds, 0);
  assert.equal(r.candidates, 0);
  assert.equal(r.ok, false);
  assert.equal(r.hidden.all, 2);
  assert.equal(r.hidden.passed, 0);
  assert.equal(r.cases[0].got, '@undefined');
  assert.equal(probedBases().length, before, 'no base was probed, so no socket was opened');
  // The control: a hidden case whose answer IS undefined would pass, which is what makes
  // this a floor and not a zero by construction.
  const trivial = await solveCode({ ...task, hidden: [{ args: [1], expected: undefined }] }, { provider: 'null' });
  assert.equal(trivial.hidden.passed, 1);
  assert.equal(trivial.ok, true);
  assert.equal(probedBases().length, before);
});

test('the hidden cases are not in any prompt the loop builds', () => {
  const task = {
    id: 'unit.prompt', entry: 'f', signature: 'f(x)', spec: 'double x',
    visible: [{ args: [1], expected: 2 }],
    hidden: [{ args: [77], expected: 154 }],
  };
  const p = firstPrompt(task, 'f');
  assert.ok(p.includes('f(1) returns 2'), p);
  assert.equal(p.includes('77'), false, 'a hidden argument is not in the prompt');
  assert.equal(p.includes('154'), false, 'a hidden answer is not in the prompt');
});

test('entryName and extractCode read the model back', () => {
  assert.equal(entryName({ entry: 'foo' }), 'foo');
  assert.equal(entryName({ signature: 'daysBetween(a, b)' }), 'daysBetween');
  assert.equal(entryName({ signature: 'function fib(n)' }), 'fib');
  assert.equal(entryName({ signature: 'no function here' }), null);
  const fenced = 'sure.\n```js\nfunction a() { return 1; }\n```\nand a better one:\n```javascript\nfunction a() { return 2; }\n```\n';
  assert.equal(extractCode(fenced), 'function a() { return 2; }');
  assert.equal(extractCode('<think>let me think</think>\n```\nfunction b() {}\n```'), 'function b() {}');
  assert.equal(extractCode('```js\nexport function c() { return 3; }\n```'), 'function c() { return 3; }');
  assert.equal(extractCode('just words'), 'just words');
});

// ---------------------------------------------------------------- the fixture
test('the generator on the fixture seed reproduces every expected value in the fixture', () => {
  const fx = JSON.parse(readFileSync(FIXTURE, 'utf8'));
  assert.equal(fx.seed, DEFAULT_SEED);
  const built = buildTasks({ seed: fx.seed });
  assert.equal(built.length, fx.tasks.length);
  assert.ok(built.length >= 40, 'at least 40 tasks: ' + built.length);
  for (let i = 0; i < built.length; i++) {
    assert.deepEqual(built[i], fx.tasks[i], 'task ' + i + ' (' + fx.tasks[i].id + ') is reproduced exactly');
  }
  // Built twice from one seed, the same again: the generator has no hidden clock.
  assert.deepEqual(buildTasks({ seed: fx.seed }), built);
  // The control: a different seed moves the expected values, so the equality above is the
  // seed doing the work and not the generator ignoring it.
  const other = buildTasks({ seed: DEFAULT_SEED + '-other' });
  assert.notDeepEqual(other, built);
});

test('the fixture says where every expected value came from, and thirty are generated and ten typed', () => {
  const fx = loadFixture();
  const byFrom = {};
  for (const t of fx.tasks) byFrom[t.expectedFrom] = (byFrom[t.expectedFrom] || 0) + 1;
  assert.equal(byFrom['a reference implementation in bench/code.mjs'], 30);
  assert.equal(byFrom['typed by hand into this fixture'], 10);
  for (const t of fx.tasks) {
    assert.ok(t.id && t.kind && t.spec && t.signature, t.id);
    assert.ok(t.visible.length >= 3, t.id + ' shows the model at least three cases');
    assert.ok(t.hidden.length >= 3, t.id + ' hides at least three cases');
    assert.ok(entryName(t), t.id + ' names a function');
  }
  const kinds = new Set(fx.tasks.map((t) => t.kind));
  for (const k of ['bigint', 'string', 'array', 'date', 'parser', 'hand']) assert.ok(kinds.has(k), k);
  // An empty string and a character outside the basic plane are among the string inputs,
  // because those are the two a candidate written against .length gets wrong.
  const strings = fx.tasks.filter((t) => t.kind === 'string');
  const args = strings.flatMap((t) => [...t.visible, ...t.hidden]).map((c) => c.args[0]);
  assert.ok(args.includes(''), 'the empty string is an input');
  assert.ok(args.some((s) => typeof s === 'string' && [...s].length < s.length), 'a non-BMP character is an input');
});

test('the reference expression language is what the spec says it is', () => {
  assert.equal(refEvalExpr('1 + 2 * 3'), 7);
  assert.equal(refEvalExpr('(1 + 2) * 3'), 9);
  assert.equal(refEvalExpr('7 / 2'), 3);
  assert.equal(refEvalExpr('-7 / 2'), -3);
  assert.equal(refEvalExpr('10 - 2 - 3'), 5);
  assert.equal(refEvalExpr('2 * -3'), -6);
});

test('the arms rotate task by task and the interval arithmetic is the answer bench arithmetic', () => {
  const plan = planArms(4);
  assert.equal(plan.length, 4);
  for (const p of plan) assert.equal(new Set(p).size, 3);
  assert.equal(plan[0][0], 'organism');
  assert.equal(plan[1][0], 'alone');
  assert.equal(plan[2][0], 'null');
  assert.equal(plan[3][0], 'organism');
  assert.equal(wilson(0, 40).lo < 0.0001, true);
  assert.equal(wilson(40, 40).hi, 1);
  assert.equal(nFor95(0.5, 0.5), null);
  assert.equal(nFor95(1, 0), 1);
  assert.equal(typeof nFor95(0.3, 0.1), 'number');
});

// ---------------------------------------------------------------- the bar file
// These four grade the fix for the defect that cost the 40 task bar: any run of this bench,
// of any shape, used to write bench/verdicts/code.json after every single task, and the CLI
// used to accept any word beginning with two dashes as a flag. So `--help` spent 44 minutes
// running the bar and a 3 task smoke overwrote it. Each test below puts the new behaviour
// beside the control it replaced.

test('an unknown flag is rejected, and the known flag of the same shape beside it is not', () => {
  const bad = args(['--limit', '3', '--bogus']);
  assert.deepEqual(bad.opts, { limit: 3 });
  assert.equal(bad.bad.length, 1);
  assert.match(bad.bad[0], /unknown flag --bogus/);
  // --help is the exact word that ran the bar: it is a KNOWN flag now, so it parses clean
  // and the CLI answers it with usage instead of a run.
  const help = args(['--help']);
  assert.deepEqual(help.opts, { help: true });
  assert.deepEqual(help.bad, []);
  // The control for "unknown is rejected": the same parser on only known flags complains
  // about nothing at all.
  const good = args(['--limit', '3', '--arms', 'null', '--nowrite']);
  assert.deepEqual(good.opts, { limit: 3, arms: 'null', nowrite: true });
  assert.deepEqual(good.bad, []);
});

test('a flag given the wrong kind of value is rejected, not coerced', () => {
  assert.match(args(['--limit', 'three']).bad[0], /--limit needs a number/);
  assert.match(args(['--rounds']).bad[0], /--rounds needs a value/);
  assert.match(args(['--quiet', 'yes']).bad[0], /--quiet takes no value/);
  assert.match(args(['nowrite']).bad[0], /stray argument/);
  // The control: the same three flags with values of the right kind pass.
  assert.deepEqual(args(['--limit', '3', '--rounds', '2', '--quiet']).bad, []);
});

test('only a run of the whole fixture with every arm has the bar\'s shape', () => {
  const full = shapeOf({ tasksRun: 40, tasksInFixture: 40, armsRun: [...ARMS] });
  assert.equal(full.full, true);
  assert.equal(full.why, null);
  // Two ways to be narrow, and each says which one it was.
  const fewTasks = shapeOf({ tasksRun: 3, tasksInFixture: 40, armsRun: [...ARMS] });
  assert.equal(fewTasks.full, false);
  assert.match(fewTasks.why, /3 of the fixture's 40 tasks/);
  const fewArms = shapeOf({ tasksRun: 40, tasksInFixture: 40, armsRun: ['null'] });
  assert.equal(fewArms.full, false);
  assert.match(fewArms.why, /arms null/);
});

test('a narrow run writes the partial file and leaves the bar file byte for byte alone', async () => {
  const bar = path.join(ROOT, VERDICTS.bar);
  const before = existsSync(bar) ? readFileSync(bar) : null;
  // Two tasks, the null arm only: the exact shape of the smoke run that overwrote the bar.
  const v = await run({ limit: 2, arms: 'null', quiet: true });
  assert.equal(v.wroteTo, VERDICTS.partial);
  assert.equal(v.isTheBar, false);
  assert.equal(v.verdict, 'NARROW', 'a narrow run may not print GREEN, because GREEN is what gets quoted');
  assert.match(v.notTheBarBecause, /not the bar's shape/);
  assert.ok(existsSync(path.join(ROOT, VERDICTS.partial)), 'the narrow result landed somewhere');
  const after = existsSync(bar) ? readFileSync(bar) : null;
  assert.equal(after === null ? null : after.toString('hex'), before === null ? null : before.toString('hex'),
    'the bar file is untouched by a run that is not the bar');
  // The control that this test can fail at all: the same run asked not to write reaches the
  // same decision and touches nothing, so the decision is the file's, not the disk's.
  const dry = await run({ limit: 2, arms: 'null', quiet: true, write: false });
  assert.equal(dry.wroteTo, VERDICTS.partial);
  assert.equal(dry.isTheBar, false);
});

test('no unfinished snapshot of any shape is addressed to the bar file', () => {
  // The in flight write after every task is what overwrote the bar. There are four
  // (complete, barShaped) cases in all and only ONE of them may name code.json.
  assert.equal(verdictPathFor({ complete: false, barShaped: true }), VERDICTS.progress);
  assert.equal(verdictPathFor({ complete: false, barShaped: false }), VERDICTS.partial);
  assert.equal(verdictPathFor({ complete: true, barShaped: false }), VERDICTS.partial);
  assert.equal(verdictPathFor({ complete: true, barShaped: true }), VERDICTS.bar);
  const toTheBar = [[false, true], [false, false], [true, false], [true, true]]
    .filter(([complete, barShaped]) => verdictPathFor({ complete, barShaped }) === VERDICTS.bar);
  assert.equal(toTheBar.length, 1, 'exactly one of the four cases writes the bar');
  assert.deepEqual(toTheBar[0], [true, true], 'and it is the finished run of the bar\'s shape');
  // The two shapes also never write each other's landing, which is how a narrow run used to
  // destroy a bar run's progress file while it was still working.
  assert.notEqual(verdictPathFor({ complete: false, barShaped: false }), VERDICTS.progress);
});
