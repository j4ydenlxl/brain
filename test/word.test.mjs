// test/word.test.mjs: act/word.mjs, the word problem reader (board 18 builder, queue item 1).
//
// Every sentence here is planted in this file; no fixture is read, no model is called, no socket is
// opened, nothing is written. The expected values are built from the operands with this file's own
// BigInt rationals, so the reader never supplies its own answer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Brain } from '../core/brain.mjs';
import { attachMemory } from '../memory/index.mjs';
import { ask } from '../act/prompt.mjs';
import { readWord, wordRefusal, WORD_METHOD } from '../act/word.mjs';
import { tokenize, parseWhole, evalExact, readExact } from '../act/exact-read.mjs';

// ---------------------------------------------------------------- this file's own rationals
function gcd(a, b) { if (a < 0n) a = -a; if (b < 0n) b = -b; while (b) { const t = a % b; a = b; b = t; } return a; }
function Q(n, d = 1n) { n = BigInt(n); d = BigInt(d); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; return { n: n / g, d: d / g }; }
const add = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d);
const mul = (a, b) => Q(a.n * b.n, a.d * b.d);
const sub = (a, b) => add(a, Q(-b.n, b.d));
const str = (a) => (a.d === 1n ? a.n.toString() : a.n.toString() + '/' + a.d.toString());
/** The value the reader's expression string evaluates to, through the exact reader's own BigInt parser. */
const exprValue = (e) => evalExact(parseWhole(tokenize(e)));

const NATALIA = 'Natalia sold clips to 48 of her friends in April, and then she sold half as many clips in May. How many clips did Natalia sell altogether in April and May?';

test('Natalia is 72, method exact.word, and the expression is the reading', () => {
  const r = readWord(NATALIA);
  assert.ok(r, 'the reader answered: ' + wordRefusal(NATALIA));
  assert.equal(r.method, 'exact.word');
  assert.equal(WORD_METHOD, 'exact.word');
  const want = add(Q(48n), mul(Q(48n), Q(1n, 2n)));
  assert.equal(r.answer, str(want));
  assert.equal(r.answer, '72');
  const v = exprValue(r.expression);
  assert.ok(v && v.n === want.n && v.d === want.d, 'the expression ' + r.expression + ' evaluates to the answer');
  assert.match(r.expression, /48/);
  // the benches append an instruction; the reader reads it as no quantity
  assert.equal(readWord(NATALIA + '\n\nAnswer with the final number.').answer, '72');
  // the browser path: readExact with the reader passed in gives the same answer and method
  const b = readExact(NATALIA, { word: readWord });
  assert.equal(b.answer, '72');
  assert.equal(b.method, 'exact.word');
});

test('Natalia through ask() with provider null: provenance exact, method exact.word, no socket', async () => {
  const brain = new Brain({ name: 'word-natalia', ledger: 'full' });
  attachMemory(brain, { name: 'word-natalia:' + Math.random().toString(36).slice(2) });
  const real = globalThis.fetch;
  let fetches = 0;
  globalThis.fetch = (...args) => { fetches++; return real(...args); };
  try {
    const a = await ask(brain, NATALIA, { provider: 'null' });
    assert.equal(a.provenance.answer, 'exact');
    assert.equal(a.provenance.method, 'exact.word');
    assert.equal(a.route, 'direct');
    assert.equal(a.exact.answer, '72');
    assert.equal(a.text.split('\n').pop(), '72');
    assert.equal(typeof a.exact.ns, 'number');
    assert.equal(fetches, 0);
  } finally { globalThis.fetch = real; }
});

test('one word the grammar does not know makes the whole record null, and wordRefusal names it', () => {
  const t = NATALIA.replace('she sold half', 'she zorbled half');
  assert.equal(readWord(t), null);
  const why = wordRefusal(t);
  assert.match(why, /zorbled/);
  assert.equal(wordRefusal(NATALIA), null, 'a record read whole has no refusal');
});

test('the planted shapes: twice as many, half as many, each, per, left, in total, how many more', () => {
  const cases = [
    ['Jada makes twice as many cakes as Rory. Rory makes 15 cakes. How many cakes do Jada and Rory make together?', add(Q(15n), mul(Q(2n), Q(15n)))],
    ['Leo read 30 pages on Monday, and then he read half as many pages on Tuesday. How many pages did Leo read altogether on Monday and Tuesday?', add(Q(30n), mul(Q(30n), Q(1n, 2n)))],
    ['Dan buys 4 boxes. Each box has 6 crayons. How many crayons are there in total?', mul(Q(4n), Q(6n))],
    ['Ivy earns $12 per hour. She worked 3 hours on Monday and 5 hours on Friday. How much money did Ivy earn?', mul(Q(12n), add(Q(3n), Q(5n)))],
    ['Omar had 50 stickers. He gave 12 stickers to his sister and lost 5 stickers. How many stickers does Omar have left?', sub(sub(Q(50n), Q(12n)), Q(5n))],
    ['Kim has 7 red pens, 5 blue pens, and 3 green pens. How many pens does Kim have in total?', add(add(Q(7n), Q(5n)), Q(3n))],
    ['Ava scored 18 points. Ben scored 7 fewer points than Ava. How many more points did Ava score than Ben?', sub(Q(18n), sub(Q(18n), Q(7n)))],
  ];
  for (const [text, want] of cases) {
    const r = readWord(text);
    assert.ok(r, 'read: ' + text + ' (stopped at ' + wordRefusal(text) + ')');
    assert.equal(r.answer, str(want), text);
    const v = exprValue(r.expression);
    assert.ok(v && v.n === want.n && v.d === want.d, 'expression ' + r.expression + ' for ' + text);
  }
});

test('money with a dollar sign and cents stays exact: a rational printed in decimal, never a float', () => {
  const r = readWord('Ann buys 1 pencil for $0.10 and 1 eraser for $0.20. How much money does Ann spend?');
  assert.ok(r, wordRefusal('Ann buys 1 pencil for $0.10 and 1 eraser for $0.20. How much money does Ann spend?'));
  // 0.1 + 0.2 in binary floating point is 0.30000000000000004; the reader's answer is three tenths
  assert.equal(r.answer, '0.3');
  assert.notEqual(r.answer, String(0.1 + 0.2));
  const v = exprValue(r.expression);
  assert.equal(typeof v.n, 'bigint');
  assert.equal(typeof v.d, 'bigint');
  assert.ok(v.n === 3n && v.d === 10n, 'the BigInt path gives 3/10, got ' + v.n + '/' + v.d);
  assert.doesNotMatch(r.expression, /e-|0000000/, 'no float spelling in ' + r.expression);
  const m = readWord('Zoe buys 3 notebooks for $2.25 each and a pen for $0.80. How much money does Zoe spend?');
  const want = add(mul(Q(3n), Q(225n, 100n)), Q(80n, 100n));
  assert.equal(m.answer, '7.55');
  const mv = exprValue(m.expression);
  assert.ok(mv.n === want.n && mv.d === want.d);
});

test('a sentence the grammar reads only in part is null, never a partial answer', () => {
  // "for 5 days" is not read, so 30 - 3 = 27 would be a wrong exact answer; the record is refused
  assert.equal(readWord('Sam has 30 marbles. He loses 3 marbles every day for 5 days. How many marbles does Sam have left?'), null);
  // "threw away the rotten ones" changes the count by an amount no number gives; 20 - 3 would be wrong
  assert.equal(readWord('Tom had 20 apples. He ate 3 apples and threw away the rotten ones. How many apples does Tom have left?'), null);
  // a number the answer does not use is a quantity read but not understood
  assert.equal(readWord('Tom had 20 apples and 7 pears. He ate 3 apples. How many apples does Tom have left?'), null);
  // prose and bare arithmetic are not word problems
  assert.equal(readWord('The gate holds a proposal. What does it hold?'), null);
  assert.equal(readWord('what is 17 times 23'), null);
  assert.equal(readWord(''), null);
});

test('readWord is pure and deterministic: the module imports only the exact reader and the ruler', () => {
  const src = readFileSync(new URL('../act/word.mjs', import.meta.url), 'utf8');
  const imports = [...src.matchAll(/^\s*import\s[^'"]*?from\s*['"]([^'"]+)['"]/gm)].map((m) => m[1]);
  assert.deepEqual(imports.sort(), ['../tasks/exact.mjs', './exact-read.mjs']);
  assert.doesNotMatch(src, /from\s*['"]node:/);
  assert.doesNotMatch(src, /\bprocess\./);
  assert.doesNotMatch(src, /\bfetch\(/);
  assert.doesNotMatch(src, /\brequire\(/);
  assert.doesNotMatch(src, /Math\.random|Date\.now/);
  const a = readWord(NATALIA), b = readWord(NATALIA);
  assert.deepEqual(a, b);
});

// The split of the ns bar (board 18 builder, the fix stage): a journal written by a model-off grading run
// (bench/public.mjs --provider null) holds the sub-token answers themselves, so bench/ns.mjs must not count the ids it
// names as development; a model journal still counts. Planted headers, no file read.
test('ns split: a model-off grading journal is not development, a model journal is', async () => {
  const { modelOffJournal } = await import('../bench/ns.mjs');
  const head = (command) => JSON.stringify({ type: 'header', command }) + '\n' + JSON.stringify({ type: 'result', id: 'gsm8k.7' }) + '\n';
  assert.equal(modelOffJournal(head('node bench/public.mjs --set gsm8k --provider null --tag native --limit 0')), true);
  assert.equal(modelOffJournal(head('node bench/public.mjs --set gsm8k --provider=null --tag native')), true);
  assert.equal(modelOffJournal(head('node bench/public.mjs --set gsm8k --limit 30 --name smoke')), false);
  assert.equal(modelOffJournal(head('node bench/public.mjs --set gsm8k --provider nullish')), false);
  assert.equal(modelOffJournal('{"at":"x"}\n'), false);
  assert.equal(modelOffJournal('not json\n'), false);
});
