// test/synth.test.mjs: the code region (reason/synth.mjs) and its bench's pure parts.
// Every model call here goes to a MOCKED cell: no socket is opened, Ollama is never asked.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  synthesize, extractAssertions, parseLiteral, parseArgs, toSource, stopSafe, codeFrom,
  buildHarness, testCandidate, pick, entryOf, JS_STOP_TOKENS,
} from '../reason/synth.mjs';
import { runTests } from '../act/run.mjs';
import { synthInput, taskPrompt, deriveArms, barRule, mcnemar, heRange } from '../bench/synth.mjs';
import { wilson as publicWilson, cutAtStopTokens } from '../bench/public.mjs';
import { probedBases } from '../act/llm.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');

const fence = (code) => 'Here it is.\n```javascript\n' + code + '\n```\n';
/** A model cell that answers from a script and records every request it saw. */
function mockCell(answers) {
  const seen = [];
  let i = 0;
  const cell = async (req) => {
    seen.push(req);
    const a = answers[Math.min(i++, answers.length - 1)];
    if (a && a.down) return { ok: false, text: '', reason: 'no ollama at mock', ms: 1 };
    return { ok: true, text: typeof a === 'function' ? a(req) : a, ms: 2, tokens: 7 };
  };
  return { cell, seen };
}

const ADD_PROMPT = [
  '//Return the sum of a and b.',
  '// >>> add(1, 2)',
  '// 3',
  '// >>> add(-1, 1)',
  '// 0',
  'function add(a, b){',
].join('\n');

test('extraction reads the doctest shape: >>> call over a value line, Python words and tuples included', () => {
  const p = [
    '//Split into pairs.',
    '// >>> pairs([1, 2, 3, 4])',
    '// [[1, 2], [3, 4]]',
    '// >>> pairs([])',
    '// []',
    '// >>> is_ok("x")',
    '// True',
    'function is_ok(s){',
  ].join('\n');
  const ex = extractAssertions(p);
  assert.equal(ex.entry, 'is_ok');
  // only calls to the ENTRY count: pairs() is another function
  assert.equal(ex.assertions.length, 1);
  assert.deepEqual(ex.assertions[0].args, ['x']);
  assert.equal(ex.assertions[0].expected, true);
  assert.equal(ex.assertions[0].shape, 'doctest');
  const ex2 = extractAssertions(ADD_PROMPT);
  assert.deepEqual(ex2.assertions.map((a) => [a.call, a.want, a.shape]), [['add(1, 2)', '3', 'doctest'], ['add(-1, 1)', '0', 'doctest']]);
  const tup = extractAssertions('// >>> mm([3, 1])\n// (1, 3)\n// >>> mm([])\n// None\nfunction mm(xs){');
  assert.deepEqual(tup.assertions.map((a) => a.expected), [[1, 3], undefined]);
});

test('extraction reads the Example: shape: ==, ==>, ->, the arrow characters and Input/Output', () => {
  const p = [
    '// Given a list, return the sum of its odd elements in even positions.',
    '// Examples',
    '// solution([5, 8, 7, 1]) ==> 12',
    '// solution([3, 3, 3, 3, 3]) == 9',
    "// solution([30, 13, 24, 321]) -> 0",
    '// solution([1]) ➞ 1',
    '// Example 2:',
    '// Input: lst = [2, 4], k = 1',
    '// Output: 0',
    'function solution(lst, k){',
  ].join('\n');
  const ex = extractAssertions(p);
  const got = ex.assertions.map((a) => [a.call, a.want, a.shape]);
  assert.deepEqual(got, [
    ['solution([5, 8, 7, 1])', '12', 'example'],
    ['solution([3, 3, 3, 3, 3])', '9', 'example'],
    ['solution([30, 13, 24, 321])', '0', 'example'],
    ['solution([1])', '1', 'example'],
    ['solution([2, 4], 1)', '0', 'example'],
  ]);
  assert.equal(ex.shapes.example, 5);
});

test('extraction reads the returns shape: returns, should return, and For x = v the output should be', () => {
  const p = [
    "// For example, x_or_y(7, 34, 12) returns 34, and x_or_y(15, 8, 5) should return 5.",
    "// reverse_words('hi there') should be 'there hi'",
    'function x_or_y(n, x, y){',
  ].join('\n');
  const ex = extractAssertions(p);
  assert.deepEqual(ex.assertions.map((a) => [a.call, a.want, a.shape]), [
    ['x_or_y(7, 34, 12)', '34', 'returns'],
    ['x_or_y(15, 8, 5)', '5', 'returns'],
  ]);
  const q = extractAssertions('// For lst = [1, 2, 3] the output should be 14\n// For lst = [] the output should be 0\nfunction sum_squares(lst){');
  assert.deepEqual(q.assertions.map((a) => [a.call, a.want, a.shape]), [['sum_squares([1, 2, 3])', '14', 'returns'], ['sum_squares([])', '0', 'returns']]);
});

test('extraction never turns prompt text into code: calls, arithmetic and formulas are not examples', () => {
  const p = [
    '// f(process.exit()) == 1',
    '// f(1) == 1 + 2',
    '// f(x) = x * 2 for every x',
    '// f(2) is the second value',
    '// f(require("fs")) returns 1',
    '// f(3) == 6',
    'function f(x){',
  ].join('\n');
  const ex = extractAssertions(p);
  assert.deepEqual(ex.assertions.map((a) => a.call + ' => ' + a.want), ['f(3) => 6']);
  // the literal parser refuses names that are not literals
  assert.equal(parseLiteral('process').ok, false);
  assert.equal(parseArgs('1, [2, "a"], {b: null}').ok, true);
  assert.equal(parseArgs('1, x').ok, false);
  // and the source generator writes only literals
  assert.equal(toSource([1, 'a', undefined, NaN, -0, { k: [true] }, 12n]), '[1, "a", undefined, NaN, -0, ({"k": [true]}), 12n]');
});

test('stopSafe makes a helper after the entry and a column-zero comment survive the MultiPL-E cut', async () => {
  const code = 'function add(a, b){\n  return plus(a, b);\n}\n// a helper\nfunction plus(x, y){ return x + y; }\nconsole.log(add(1, 2));';
  // the raw cut loses the helper: that is the failure stopSafe exists for
  const raw = cutAtStopTokens(code, JS_STOP_TOKENS).text;
  const rawRun = await runTests(raw, 'if (add(1, 2) !== 3) throw new Error("bad");', { limitMs: 3000 });
  assert.equal(rawRun.passed, false);
  const s = stopSafe(code);
  assert.equal(s.changed, true);
  assert.equal(s.safe, true);
  assert.equal(cutAtStopTokens(s.code, JS_STOP_TOKENS).text, s.code);
  const run = await runTests(s.code, 'if (add(1, 2) !== 3) throw new Error("bad");', { limitMs: 3000 });
  assert.equal(run.passed, true, String(run.error));
  // the code out of an answer: reasoning dropped, the fence that defines the entry wins
  assert.equal(codeFrom('<think>```js\nfunction add(){}\n```</think>' + fence('function add(a, b){ return a + b; }') + '```js\nadd(1, 2)\n```', 'add'), 'function add(a, b){ return a + b; }');
});

test('a candidate that passes, one that throws and one that loops: the clock ends the loop and the tally is exact', async () => {
  const ex = extractAssertions(ADD_PROMPT);
  const pass = await testCandidate('function add(a, b){ return a + b; }', 'add', ex.assertions, { timeoutMs: 3000 });
  assert.deepEqual([pass.passed, pass.of, pass.loaded, pass.timedOut], [2, 2, true, false]);
  const half = await testCandidate('function add(a, b){ if (a < 0) throw new Error("negative"); return a + b; }', 'add', ex.assertions, { timeoutMs: 3000 });
  assert.deepEqual([half.passed, half.of, half.loaded], [1, 2, true]);
  assert.match(half.results[1].err, /Error: negative/);
  const syntax = await testCandidate('function add(a, b){ return a + ; }', 'add', ex.assertions, { timeoutMs: 3000 });
  assert.deepEqual([syntax.passed, syntax.loaded], [0, false]);
  const t0 = Date.now();
  const loop = await testCandidate('function add(a, b){ for (;;) {} }', 'add', ex.assertions, { timeoutMs: 400 });
  assert.equal(loop.timedOut, true);
  assert.equal(loop.passed, 0);
  assert.ok(Date.now() - t0 < 5000, 'the wall clock ended the loop');
  // a harness with no assertions still demands the function exists
  const none = await testCandidate('var x = 1;', 'add', [], { timeoutMs: 3000 });
  assert.equal(none.loaded, false);
  assert.throws(() => buildHarness('a-b', []), /not an identifier/);
});

test('synthesize: sampling stops at the first candidate the examples confirm, provenance model+exact', async () => {
  const { cell, seen } = mockCell([
    fence('function add(a, b){ throw new Error("todo"); }'),
    fence('function add(a, b){ for(;;){} }'),
    fence('function add(a, b){ return a + b; }'),
    fence('function add(a, b){ return 0; }'),
  ]);
  const r = await synthesize({ prompt: ADD_PROMPT, model: 'mock', k: 5, timeoutMs: 500, repair: true, cell });
  assert.equal(r.provenance, 'model+exact');
  assert.equal(r.calls, 3);
  assert.equal(r.keptIndex, 2);
  assert.equal(r.sampledKeptIndex, 2);
  assert.equal(r.extractedCount, 2);
  assert.equal(r.passedExtracted, 2);
  assert.match(r.completion, /return a \+ b/);
  assert.equal(r.candidates[1].test.timedOut, true);
  // every draw had its own seed, and the same prompt gives the same seeds again
  assert.equal(new Set(seen.map((q) => q.seed)).size, 3);
  const again = mockCell([fence('function add(a, b){ return a + b; }')]);
  await synthesize({ prompt: ADD_PROMPT, model: 'mock', k: 1, cell: again.cell });
  assert.equal(again.seen[0].seed, seen[0].seed);
  assert.ok(typeof r.ms === 'number' && r.ms > 0);
});

test('synthesize: the repair round shows the failing example and the error, then keeps the repaired candidate', async () => {
  const wrong = fence('function add(a, b){ if (a < 0) throw new Error("no negatives"); return a + b; }');
  const { cell, seen } = mockCell([wrong, wrong, fence('function add(a, b){ return a + b; }')]);
  const r = await synthesize({ prompt: ADD_PROMPT, model: 'mock', k: 2, timeoutMs: 3000, repair: true, cell });
  assert.equal(r.calls, 3);
  assert.equal(r.candidates[2].phase, 'repair');
  assert.equal(r.keptIndex, 2);
  assert.equal(r.sampledKeptIndex, 0);
  assert.equal(r.provenance, 'model+exact');
  const rp = seen[2].prompt;
  assert.match(rp, /YOUR PREVIOUS ANSWER WAS RUN AND IT IS WRONG/);
  assert.match(rp, /add\(-1, 1\) it should return 0, but it threw Error: no negatives/);
  // repair off: the best failing candidate is kept, provenance model (not confirmed)
  const off = mockCell([wrong, wrong]);
  const r2 = await synthesize({ prompt: ADD_PROMPT, model: 'mock', k: 2, repair: false, cell: off.cell });
  assert.equal(r2.calls, 2);
  assert.equal(r2.provenance, 'model');
  assert.equal(r2.passedExtracted, 1);
  // a repair that also fails keeps the most passes, earliest first
  const a = { reached: true, test: { loaded: true, passed: 1, of: 2 } };
  const b = { reached: true, test: { loaded: true, passed: 1, of: 2 } };
  const c = { reached: true, test: { loaded: false, passed: 0, of: 2 } };
  assert.equal(pick([c, a, b]), a);
  assert.equal(pick([{ reached: false }]), null);
});

test('synthesize: no examples means provenance model; the null floor and a down model are named, not faked', async () => {
  const bare = '// Return the answer.\nfunction answer(){';
  const { cell } = mockCell(['no code at all', fence('function answer(){ return 42; }')]);
  const r = await synthesize({ prompt: bare, model: 'mock', k: 5, cell });
  assert.equal(r.extractedCount, 0);
  assert.equal(r.provenance, 'model');
  assert.equal(r.calls, 2, 'a candidate that defines no function is not kept; the first that loads is');
  const nul = await synthesize({ prompt: ADD_PROMPT, provider: 'null' });
  assert.equal(nul.provenance, 'null');
  assert.equal(nul.calls, 0);
  assert.equal(nul.passedExtracted, 0);
  const down = mockCell([{ down: true }]);
  const d = await synthesize({ prompt: ADD_PROMPT, model: 'mock', k: 5, cell: down.cell });
  assert.equal(d.provenance, 'absent');
  assert.equal(d.completion, '');
  assert.equal(d.calls, 1);
  assert.match(d.reason, /no ollama/);
  assert.equal(probedBases().length, 0, 'no test in this file opened a socket');
});

test('no hidden test string reaches synthesize(): the bench builds its input from the prompt alone', async () => {
  const records = readFileSync(path.join(ROOT, 'bench/fixtures/public/humaneval/humaneval-js.jsonl'), 'utf8').split(/\r?\n/).filter(Boolean).slice(0, 3).map((l) => JSON.parse(l));
  for (const rec of records) {
    const input = synthInput(rec, { model: 'mock', k: 5, repair: true, timeoutMs: 3000, maxTokens: 10 });
    const flat = JSON.stringify(input);
    assert.ok(!flat.includes(rec.tests.trim().slice(0, 60)), 'the tests string is not in the input');
    assert.ok(!('tests' in input) && !('doctests' in input) && !('original' in input));
    const { cell, seen } = mockCell([fence('function x(){ return 1; }')]);
    await synthesize({ ...input, k: 1, cell });
    for (const q of seen) {
      const needle = /assert\.deepEqual\(candidate/;
      assert.ok(!needle.test(q.prompt), 'no prompt the model saw holds the hidden suite');
    }
  }
  // and the region itself never reads a tests field of anything
  const src = readFileSync(path.join(ROOT, 'reason/synth.mjs'), 'utf8');
  assert.equal(/\.tests\b|\[['"]tests['"]\]/.test(src), false);
});

test('the bench: dev range, internal prompts, nested arms, interval arithmetic and the bar rule', async () => {
  assert.deepEqual(heRange(), { from: 0, to: 39 });
  const task = { entry: 'romanToInt', signature: 'romanToInt(s)', spec: 'Return the value of a Roman numeral.', visible: [{ args: ['III'], expected: 3 }, { args: ['IV'], expected: 4 }] };
  const p = taskPrompt(task);
  assert.equal(entryOf(p), 'romanToInt');
  assert.deepEqual(extractAssertions(p).assertions.map((a) => a.call + ' => ' + a.want), ['romanToInt("III") => 3', 'romanToInt("IV") => 4']);
  // nested arms: k=1 is the first draw, k=5 the sampled pick, k=5+repair the final pick
  const r = {
    calls: 3, ms: 30, keptIndex: 2, sampledKeptIndex: 1, extractedCount: 2,
    candidates: [
      { phase: 'sample', reached: true, code: 'a', endMs: 10, test: { loaded: true, passed: 0, of: 2 } },
      { phase: 'sample', reached: true, code: 'b', endMs: 20, test: { loaded: true, passed: 1, of: 2 } },
      { phase: 'repair', reached: true, code: 'c', endMs: 30, test: { loaded: true, passed: 2, of: 2 } },
    ],
  };
  const d = deriveArms(r);
  assert.deepEqual([d.k1.code, d.k1.calls, d.k1.ms], ['a', 1, 10]);
  assert.deepEqual([d.k5.code, d.k5.calls, d.k5.ms, d.k5.provenance], ['b', 2, 20, 'model']);
  assert.deepEqual([d.k5r.code, d.k5r.calls, d.k5r.ms, d.k5r.provenance], ['c', 3, 30, 'model+exact']);
  // the interval is public.mjs's own arithmetic
  const { wilson } = await import('../bench/synth.mjs');
  assert.deepEqual(wilson(30, 40), publicWilson(30, 40));
  // bar: the gap must exceed the overlap of the two intervals
  const met = barRule({ correct: 36, n: 40 }, { correct: 24, n: 40 });
  assert.equal(met.met, true);
  const missed = barRule({ correct: 30, n: 40 }, { correct: 27, n: 40 });
  assert.equal(missed.met, false);
  assert.ok(missed.overlap > missed.gap);
  assert.equal(mcnemar(0, 0), 1);
  assert.ok(mcnemar(10, 0) < 0.01);
});
