// test/neo-kernel.test.mjs: the NEO kernel (grow/neo-kernel.mjs, grow/NEO.md "The kernel" and "A NEO cell: a pyramid").
// His words: "The cells should be extremely poweful, like little orthogonal pyramids in itself." Every family, the
// totality of every primitive under hostile input, the typed manifests, pyramids of height 1 to 4, null propagation,
// every guard feature, norm at every level, a 10000-cell colony that touches only what a prompt's words reach,
// determinism, contract safety of the text, and the marked region evaluated alone.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FORBIDDEN, MAX_SOURCE_BYTES, importsOf, validateCell } from '../grow/contract.mjs';
import {
  KERNEL_VERSION, TYPES, FAMILIES, PRIMS, argTypes, listPrims, evalNode, wellTyped, heightOf, sizeOf, guardOk, featureOk,
  runCell, norm, makeColony, makeCell, cellId, checkCell, sha256Hex, fmtNum,
} from '../grow/neo-kernel.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const KERNEL_FILE = path.join(HERE, '..', 'grow', 'neo-kernel.mjs');
const L = (v) => ({ lit: v });
const R = (node, q = '', mem = null) => evalNode(node, q, mem);
const P = (name, args, q = '', mem = {}) => PRIMS[name].fn(args, { q, mem });
const IS = {
  text: (v) => typeof v === 'string', str: (v) => typeof v === 'string', bool: (v) => typeof v === 'boolean',
  num: (v) => (typeof v === 'number' && Number.isFinite(v) && !Object.is(v, -0)) || typeof v === 'bigint',
  nums: (v) => Array.isArray(v) && v.every((x) => IS.num(x)), strs: (v) => Array.isArray(v) && v.every((x) => typeof x === 'string'),
  kv: (v) => v !== null && typeof v === 'object' && !Array.isArray(v),
  tpl: (v) => Array.isArray(v) && v.every((p) => typeof p === 'string' || (p && Number.isInteger(p.slot))),
};
const HOSTILE = [null, undefined, NaN, Infinity, 1e308, 2n ** 300n, -0, '', '\u0000 zz?! "q" :', [], [NaN, 'x', null], { k: { j: 1 } }];
const GOOD = { num: 12, nums: [3, 1, 2], str: 'hello world', strs: ['b', 'a'], bool: true, kv: { y: 2024, m: 3, d: 5 }, tpl: ['Day ', { slot: 0 }] };
const arity = (name) => argTypes(name).length + (PRIMS[name].rest ? 1 : 0);
const goodArgs = (name) => [...argTypes(name), ...(PRIMS[name].rest ? [PRIMS[name].rest] : [])].map((t) => GOOD[t]);

// ---------------------------------------------------------------- manifests
test('manifests: at least 100 primitives over the nine families, each typed and named family.name', () => {
  const names = Object.keys(PRIMS);
  assert.ok(names.length >= 100, 'count ' + names.length);
  assert.equal(KERNEL_VERSION, 1);
  assert.deepEqual([...FAMILIES], ['sense', 'transform', 'aggregate', 'compare', 'compute', 'memory', 'route', 'iterate', 'render']);
  for (const fam of FAMILIES) assert.ok(names.filter((n) => PRIMS[n].family === fam).length >= 3, fam + ' has fewer than 3');
  for (const [name, p] of Object.entries(PRIMS)) {
    assert.equal(name.split('.')[0], p.family, name);
    assert.ok(FAMILIES.includes(p.family), name);
    assert.ok(Array.isArray(p.in) && p.in.every((t) => TYPES.includes(t)), name + ' in');
    assert.ok(TYPES.includes(p.out) && p.out !== 'text', name + ' out');
    assert.ok(Array.isArray(p.words) && p.words.length >= 1 && p.words.every((w) => typeof w === 'string' && w.trim()), name + ' words');
    assert.equal(typeof p.fn, 'function', name);
    assert.ok(Object.isFrozen(p), name + ' is frozen');
    if (p.family === 'sense') assert.equal(p.in[0], 'text', name + ' reads the prompt');
    if (p.family === 'render') assert.equal(p.out, 'str', name + ' renders text');
  }
});

test('manifests: listPrims carries every manifest without fn, and argTypes drops the implicit text', () => {
  const list = listPrims();
  assert.equal(list.length, Object.keys(PRIMS).length);
  for (const m of list) {
    assert.equal(m.fn, undefined);
    assert.deepEqual(Object.keys(m).filter((k) => !['name', 'family', 'in', 'out', 'words', 'lazy', 'rest'].includes(k)), []);
    assert.deepEqual(m.in, [...PRIMS[m.name].in]);
  }
  assert.deepEqual(argTypes('sense.after'), ['str']);
  assert.deepEqual(argTypes('sense.numbers'), []);
  assert.deepEqual(argTypes('compute.convert'), ['num', 'str', 'str']);
  assert.equal(argTypes('nope.nothing'), null);
  assert.equal(PRIMS['route.first'].lazy, true);
  assert.equal(PRIMS['render.template'].rest, 'str');
});

test('manifests: honest words, the ones a person uses for each operation', () => {
  assert.ok(PRIMS['aggregate.mean'].words.includes('average') && PRIMS['aggregate.mean'].words.includes('mean'));
  assert.ok(PRIMS['compute.gcd'].words.includes('greatest common divisor'));
  assert.ok(PRIMS['transform.reverse'].words.includes('backwards'));
  assert.ok(PRIMS['compare.isPrime'].words.includes('prime'));
  assert.ok(PRIMS['iterate.mapTemplate'].words.includes('plan'));
});

// ---------------------------------------------------------------- totality
test('totality: every primitive under 12 hostile inputs gives a value of its out type or null, never a throw', () => {
  const bad = [];
  const ok = (name, r) => {
    const p = PRIMS[name];
    if (r === null) return;
    if (!IS[p.out](r)) bad.push(name + ' gave ' + String(r));
    if (p.out === 'str' && p.family === 'render' && /NaN|Infinity/.test(r)) bad.push(name + ' rendered ' + r);
    if (Array.isArray(r) && r.some((x) => typeof x === 'number' && (!Number.isFinite(x) || Object.is(x, -0)))) bad.push(name + ' list ' + r);
  };
  let calls = 0;
  for (const name of Object.keys(PRIMS)) {
    const fn = PRIMS[name].fn, n = arity(name);
    for (const h of HOSTILE) {
      try {
        ok(name, fn(Array(n).fill(h), { q: h, mem: h })); calls++;
        ok(name, fn(h, h)); calls++;
        for (let i = 0; i < n; i++) { const a = goodArgs(name); a[i] = h; ok(name, fn(a, { q: 'add 3 and 4 on March 5, 2024', mem: { table: { a: 'b' } } })); calls++; }
        ok(name, evalNode([name, ...Array(n).fill(L(h))], h, h)); calls++;
      } catch (e) { bad.push(name + ' threw ' + e.message); }
    }
  }
  assert.deepEqual(bad, []);
  assert.ok(calls > Object.keys(PRIMS).length * HOSTILE.length * 3);
});

test('totality: hostile nodes, prompts and mems through evalNode, runCell and guardOk are null or false', () => {
  for (const h of HOSTILE) {
    assert.equal(evalNode(h, h, h), null);
    assert.equal(runCell(h, 'add 1 and 2'), null);
    assert.equal(runCell(makeCell({ task: 't', pyramid: ['render.number', ['sense.first']] }), h), null);
    if (!(Array.isArray(h) && h.length === 0)) assert.equal(guardOk(h, 'x'), false, 'guard ' + String(h));
    assert.equal(typeof guardOk([], h), 'boolean');
  }
  const throwing = { get lit() { throw new Error('boom'); } };
  assert.equal(evalNode(['render.number', throwing], ''), null, 'a throw is a null');
});

// ---------------------------------------------------------------- sense
test('sense: numbers (commas, negatives, decimals, BigInt past 2^53), first, second, last, nth, how many', () => {
  const q = 'Add 1,000 and -2.5 to 3';
  assert.deepEqual(R(['sense.numbers'], q), [1000, -2.5, 3]);
  assert.equal(R(['sense.first'], q), 1000);
  assert.equal(R(['sense.second'], q), -2.5);
  assert.equal(R(['sense.last'], q), 3);
  assert.equal(R(['sense.nth', L(-2)], q), -2.5);
  assert.equal(R(['sense.howMany'], q), 3);
  assert.equal(R(['sense.first'], '12345678901234567890 plus 1'), 12345678901234567890n);
  assert.equal(R(['sense.numbers'], 'no digits here'), null);
  assert.deepEqual(R(['sense.numbers'], 'from 3-5 then x2'), [3, 5]);
});

test('sense: the list after a colon, quoted text, after, before, between keywords', () => {
  assert.deepEqual(R(['sense.list'], 'Sort these: pear, apple and fig.'), ['pear', 'apple', 'fig']);
  assert.deepEqual(R(['sense.listNums'], 'Day 3 data: 4, 8, 15'), [4, 8, 15]);
  assert.equal(R(['sense.quoted'], 'reverse the word "hello" please'), 'hello');
  assert.deepEqual(R(['sense.quotedAll'], "are 'listen' and “silent” anagrams"), ['listen', 'silent']);
  assert.equal(R(['sense.quoted'], "don't and won't"), null);
  assert.equal(R(['sense.after', L('about')], 'Tell me about black holes?'), 'black holes');
  assert.equal(R(['sense.before', L('is')], 'Paris is the capital'), 'Paris');
  assert.equal(R(['sense.between', L('from'), L('to')], 'fly from Boston to Chicago'), 'Boston');
  assert.equal(R(['sense.after', L('about')], 'nothing here'), null);
});

test('sense: words, content words, nth and last word, subject, word count, has', () => {
  assert.deepEqual(R(['sense.words'], 'Hello, World!'), ['hello', 'world']);
  assert.deepEqual(R(['sense.content'], 'What is the capital of France?'), ['capital', 'france']);
  assert.equal(R(['sense.wordAt', L(2)], 'Hello there friend'), 'there');
  assert.equal(R(['sense.wordAt', L(-1)], 'Hello there friend'), 'friend');
  assert.equal(R(['sense.lastWord'], 'spell it: banana!'), 'banana');
  assert.equal(R(['sense.subject'], 'spell backwards: banana'), 'banana');
  assert.equal(R(['sense.subject'], "reverse 'abc' now"), 'abc');
  assert.equal(R(['sense.subject'], 'reverse hello'), 'hello');
  assert.equal(R(['sense.wordCount'], 'one, two three'), 3);
  assert.equal(R(['sense.has', L('black holes')], 'tell me about Black Holes'), true);
  assert.equal(R(['sense.has', L('hole')], 'tell me about black holes'), false);
});

test('sense: a count with its unit, the units named, key=value pairs', () => {
  assert.deepEqual(R(['sense.quantity'], 'I have 3 apples and 2 pears'), { n: 3, unit: 'apples' });
  assert.deepEqual(R(['sense.quantity'], 'run 5 kilometers'), { n: 5, unit: 'km' });
  assert.deepEqual(R(['sense.units'], 'convert 5 km to miles'), ['km', 'mi']);
  assert.equal(R(['sense.unit'], 'convert 100 degrees fahrenheit to celsius'), 'f');
  assert.equal(R(['sense.unitTo'], 'convert 100 degrees fahrenheit to celsius'), 'c');
  assert.equal(R(['sense.unit'], 'how many feet in 3 miles'), 'mi');
  assert.equal(R(['sense.unitTo'], 'how many feet in 3 miles'), 'ft');
  assert.equal(R(['sense.units'], "what's in it"), null);
  assert.deepEqual(R(['sense.pairs'], 'set a=1, name="Bo" and x=2.5'), { a: 1, name: 'Bo', x: 2.5 });
});

test('sense: written dates in four shapes, the nth date, roman numerals, bases, a numeral token', () => {
  const want = { y: 2024, m: 3, d: 5 };
  for (const q of ['on March 5, 2024', 'the 5th of March 2024', 'due 3/5/2024', 'at 2024-03-05', 'Mar. 5th 2024']) assert.deepEqual(R(['sense.date'], q), want, q);
  assert.deepEqual(R(['sense.dateAt', L(2)], 'from 2024-01-01 to Feb 2, 2025'), { y: 2025, m: 2, d: 2 });
  assert.equal(R(['sense.date'], 'February 30, 2023'), null);
  assert.equal(R(['sense.roman'], 'what is XIV plus I'), 'XIV');
  assert.equal(R(['sense.roman'], 'convert xiv to a number'), 'xiv');
  assert.deepEqual(R(['sense.bases'], 'convert 1010 from binary to hex'), [2, 16]);
  assert.deepEqual(R(['sense.bases'], 'write 9 in base 3'), [3]);
  assert.equal(R(['sense.numeral'], 'convert 0x1F to decimal'), '0x1F');
  assert.equal(R(['sense.text'], '  hi  '), 'hi');
});

// ---------------------------------------------------------------- transform
test('transform: arithmetic exact on integers, BigInt past 2^53, float elsewhere, null on a zero divisor', () => {
  assert.equal(P('transform.add', [2, 3]), 5);
  assert.equal(P('transform.add', [12345678901234567890n, 1]), 12345678901234567891n);
  assert.equal(P('transform.sub', [2, 3]), -1);
  assert.equal(P('transform.mul', [2n ** 40n, 2n ** 40n]), 2n ** 80n);
  assert.equal(P('transform.div', [10, 4]), 2.5);
  assert.equal(P('transform.div', [10, 5]), 2);
  assert.equal(P('transform.div', [1, 0]), null);
  assert.equal(P('transform.idiv', [-7, 2]), -4);
  assert.equal(P('transform.mod', [-7, 3]), 2);
  assert.equal(P('transform.neg', [0]), 0);
  assert.ok(!Object.is(P('transform.neg', [0]), -0));
  assert.equal(P('transform.abs', [-(2n ** 60n)]), 2n ** 60n);
  assert.equal(P('transform.round', [2.5]), 3);
  assert.equal(P('transform.roundTo', [3.14159, 2]), 3.14);
  assert.equal(P('transform.roundTo', [1.005, 2]), 1.01);
  assert.equal(P('transform.roundTo', [1234.5, -2]), 1200);
  assert.equal(P('transform.floor', [-1.5]), -2);
  assert.equal(P('transform.ceil', [1.2]), 2);
  assert.equal(P('transform.square', [12]), 144);
  assert.equal(P('transform.cube', [3]), 27);
  assert.equal(P('transform.half', [7]), 3.5);
  assert.equal(P('transform.reciprocal', [4]), 0.25);
  assert.equal(P('transform.reverseDigits', [1200]), 21);
  assert.equal(P('transform.reverseDigits', [-123]), -321);
});

test('transform: lists (sort, reverse, unique, slice, take, nth, map, evens, odds, above, below)', () => {
  assert.deepEqual(P('transform.sortUp', [[3, 1, 2]]), [1, 2, 3]);
  assert.deepEqual(P('transform.sortDown', [[3, 1, 2]]), [3, 2, 1]);
  assert.deepEqual(P('transform.sortStrs', [['pear', 'Apple', 'fig']]), ['Apple', 'fig', 'pear']);
  assert.deepEqual(P('transform.reverseNums', [[1, 2, 3]]), [3, 2, 1]);
  assert.deepEqual(P('transform.uniqueNums', [[1, 2, 1, 3]]), [1, 2, 3]);
  assert.deepEqual(P('transform.uniqueStrs', [['a', 'b', 'a']]), ['a', 'b']);
  assert.deepEqual(P('transform.sliceNums', [[10, 20, 30, 40], 2, 3]), [20, 30]);
  assert.deepEqual(P('transform.takeNums', [[10, 20, 30], 2]), [10, 20]);
  assert.equal(P('transform.nthNum', [[10, 20, 40], -1]), 40);
  assert.equal(P('transform.nthStr', [['a', 'b'], 3]), null);
  assert.deepEqual(P('transform.mapMul', [[1, 2], 3]), [3, 6]);
  assert.deepEqual(P('transform.evens', [[1, 2, 3, 4]]), [2, 4]);
  assert.deepEqual(P('transform.odds', [[1, 2, 3, 4]]), [1, 3]);
  assert.deepEqual(P('transform.above', [[1, 5, 10], 4]), [5, 10]);
  assert.deepEqual(P('transform.below', [[1, 5, 10], 4]), [1]);
  assert.deepEqual(P('transform.asText', [[1, 2.5]]), ['1', '2.5']);
});

test('transform: text (case, reverse, initials, acronym, replace, split, join, letters, repeat, norm)', () => {
  assert.equal(P('transform.upper', ['abc']), 'ABC');
  assert.equal(P('transform.lower', ['ABC']), 'abc');
  assert.equal(P('transform.title', ['hello big world']), 'Hello Big World');
  assert.equal(P('transform.swapCase', ['aB']), 'Ab');
  assert.equal(P('transform.reverse', ['hello']), 'olleh');
  assert.equal(P('transform.reverseWords', ['one two three']), 'three two one');
  assert.equal(P('transform.sortLetters', ['cab']), 'abc');
  assert.equal(P('transform.noVowels', ['banana']), 'bnn');
  assert.equal(P('transform.initials', ['John Ronald Tolkien']), 'J.R.T.');
  assert.equal(P('transform.acronym', ['portable network graphics']), 'PNG');
  assert.equal(P('transform.acronym', ['Federal Bureau of Investigation']), 'FBI');
  assert.equal(P('transform.replace', ['a-b-c', '-', '+']), 'a+b+c');
  assert.equal(P('transform.remove', ['a-b-c', '-']), 'abc');
  assert.deepEqual(P('transform.split', ['a, b,c', ',']), ['a', 'b', 'c']);
  assert.equal(P('transform.join', [['a', 'b'], '-']), 'a-b');
  assert.deepEqual(P('transform.letters', ['ab c']), ['a', 'b', 'c']);
  assert.equal(P('transform.repeat', ['ab', 3]), 'ababab');
  assert.equal(P('transform.repeat', ['ab', 1e9]), null);
  assert.equal(P('transform.norm', ['Hi There!', 1]), 'hi there');
  assert.equal(P('transform.concat', ['ab', 'cd']), 'abcd');
});

// ---------------------------------------------------------------- aggregate
test('aggregate: sum, mean, median, mode, min, max, range, count, product, sum of squares', () => {
  assert.equal(P('aggregate.sum', [[1, 2, 3.5]]), 6.5);
  assert.equal(P('aggregate.sum', [[2n ** 60n, 2n ** 60n]]), 2n ** 61n);
  assert.equal(P('aggregate.mean', [[2, 4, 9]]), 5);
  assert.equal(P('aggregate.mean', [[]]), null);
  assert.equal(P('aggregate.median', [[5, 1, 3]]), 3);
  assert.equal(P('aggregate.median', [[1, 2, 3, 4]]), 2.5);
  assert.equal(P('aggregate.mode', [[1, 2, 2, 3]]), 2);
  assert.equal(P('aggregate.mode', [[1, 2, 3]]), null);
  assert.equal(P('aggregate.min', [[4, -1, 7]]), -1);
  assert.equal(P('aggregate.max', [[4, -1, 7]]), 7);
  assert.equal(P('aggregate.range', [[4, -1, 7]]), 8);
  assert.equal(P('aggregate.count', [[4, -1, 7]]), 3);
  assert.equal(P('aggregate.product', [[2, 3, 4]]), 24);
  assert.equal(P('aggregate.sumSquares', [[1, 2, 3]]), 14);
});

test('aggregate: variance and standard deviation (population and sample), text counts, occurrences', () => {
  const xs = [2, 4, 4, 4, 5, 5, 7, 9];
  assert.equal(P('aggregate.variance', [xs]), 4);
  assert.equal(P('aggregate.stdev', [xs]), 2);
  assert.equal(fmtNum(P('aggregate.sampleStdev', [xs])), '2.1');
  assert.equal(P('aggregate.countStrs', [['a', 'b']]), 2);
  assert.equal(P('aggregate.longest', [['a', 'abc', 'ab']]), 'abc');
  assert.equal(P('aggregate.shortest', [['abc', 'a', 'ab']]), 'a');
  assert.equal(P('aggregate.digitSum', [1234]), 10);
  assert.equal(P('aggregate.digitCount', [-1234]), 4);
  assert.equal(P('aggregate.digitCount', [1e21]), 22);
  assert.equal(P('aggregate.letters', ['Hello, World 42']), 10);
  assert.equal(P('aggregate.vowels', ['Education']), 5);
  assert.equal(P('aggregate.consonants', ['Hello']), 3);
  assert.equal(P('aggregate.words', ['It is a dog.']), 4);
  assert.equal(P('aggregate.chars', ['héllo']), 5);
  assert.equal(P('aggregate.occurrences', ['banana', 'an']), 2);
  assert.equal(P('aggregate.countIn', [['a', 'b', 'A'], 'a']), 2);
});

// ---------------------------------------------------------------- compare
test('compare: order, equality, range, divisibility', () => {
  assert.equal(P('compare.greater', [3, 2]), true);
  assert.equal(P('compare.less', [3, 2]), false);
  assert.equal(P('compare.equal', [2, 2.0]), true);
  assert.equal(P('compare.equal', [2n ** 70n, 2n ** 70n]), true);
  assert.equal(P('compare.atLeast', [2, 2]), true);
  assert.equal(P('compare.atMost', [3, 2]), false);
  assert.equal(P('compare.between', [5, 10, 1]), true);
  assert.equal(P('compare.divisible', [12, 4]), true);
  assert.equal(P('compare.divisible', [12, 5]), false);
  assert.equal(P('compare.divisible', [12, 0]), null);
  assert.equal(P('compare.coprime', [8, 15]), true);
  assert.equal(P('compare.isPositive', [-1]), false);
  assert.equal(P('compare.isWhole', [2.5]), false);
});

test('compare: number kinds (prime past 2^53, even, odd, square, perfect, leap year)', () => {
  assert.equal(P('compare.isPrime', [97]), true);
  assert.equal(P('compare.isPrime', [1]), false);
  assert.equal(P('compare.isPrime', [561]), false);
  assert.equal(P('compare.isPrime', [2n ** 61n - 1n]), true);
  assert.equal(P('compare.isPrime', [2n ** 127n - 1n]), null, 'past the deterministic bound it says it does not know');
  assert.equal(P('compare.isEven', [10]), true);
  assert.equal(P('compare.isOdd', [10]), false);
  assert.equal(P('compare.isSquare', [144]), true);
  assert.equal(P('compare.isSquare', [145]), false);
  assert.equal(P('compare.isPerfect', [28]), true);
  assert.equal(P('compare.isPerfect', [12]), false);
  assert.equal(P('compare.isLeap', [2000]), true);
  assert.equal(P('compare.isLeap', [1900]), false);
  assert.equal(P('compare.isLeap', [2024]), true);
});

test('compare: text (palindrome, anagram, contains, starts, ends, same, member, sorted)', () => {
  assert.equal(P('compare.isPalindrome', ['A man, a plan, a canal: Panama']), true);
  assert.equal(P('compare.isPalindrome', ['hello']), false);
  assert.equal(P('compare.isAnagram', ['listen', 'Silent']), true);
  assert.equal(P('compare.isAnagram', ['listen', 'lists']), false);
  assert.equal(P('compare.contains', ['Hello World', 'world']), true);
  assert.equal(P('compare.startsWith', ['Hello', 'he']), true);
  assert.equal(P('compare.endsWith', ['Hello', 'LO']), true);
  assert.equal(P('compare.sameText', ['Hello!', 'hello']), true);
  assert.equal(P('compare.member', [['Red', 'blue'], 'red']), true);
  assert.equal(P('compare.memberNum', [[1, 2], 3]), false);
  assert.equal(P('compare.isSorted', [[1, 2, 2, 3]]), true);
  assert.equal(P('compare.isSorted', [[2, 1]]), false);
});

// ---------------------------------------------------------------- compute
test('compute: number theory exact past 2^53 (25 factorial prints all its digits)', () => {
  assert.equal(R(['render.number', ['compute.factorial', L(25)]]), '15511210043330985984000000');
  assert.equal(P('compute.factorial', [0]), 1);
  assert.equal(P('compute.factorial', [-1]), null);
  assert.equal(P('compute.gcd', [48, 18]), 6);
  assert.equal(P('compute.lcm', [4, 6]), 12);
  assert.equal(P('compute.gcdAll', [[12, 18, 24]]), 6);
  assert.equal(P('compute.lcmAll', [[2, 3, 4]]), 12);
  assert.equal(P('compute.fibonacci', [10]), 55);
  assert.equal(P('compute.fibonacci', [100]), 354224848179261915075n);
  assert.deepEqual(P('compute.divisors', [12]), [1, 2, 3, 4, 6, 12]);
  assert.equal(P('compute.divisorCount', [12]), 6);
  assert.equal(P('compute.divisorSum', [12]), 28);
  assert.deepEqual(P('compute.primeFactors', [360]), [2, 2, 2, 3, 3, 5]);
  assert.equal(P('compute.nthPrime', [10]), 29);
  assert.deepEqual(P('compute.primesUpTo', [20]), [2, 3, 5, 7, 11, 13, 17, 19]);
  assert.equal(P('compute.nextPrime', [13]), 17);
  assert.equal(P('compute.choose', [52, 5]), 2598960);
  assert.equal(P('compute.permutations', [5, 2]), 20);
  assert.equal(P('compute.sumTo', [100]), 5050);
  assert.equal(P('compute.fraction', [6, 8]), '3/4');
  assert.equal(P('compute.fraction', [10, 5]), '2');
  assert.equal(P('compute.fraction', [3, -9]), '-1/3');
});

test('compute: powers, roots, logs, percent, interest, geometry', () => {
  assert.equal(P('compute.power', [2, 10]), 1024);
  assert.equal(P('compute.power', [2, 100]), 1267650600228229401496703205376n);
  assert.equal(P('compute.power', [2, -1]), 0.5);
  assert.equal(P('compute.power', [10, 1e9]), null);
  assert.equal(P('compute.sqrt', [144]), 12);
  assert.equal(P('compute.sqrt', [-4]), null);
  assert.equal(fmtNum(P('compute.sqrt', [2])), '1.4');
  assert.equal(P('compute.root', [27, 3]), 3);
  assert.equal(P('compute.root', [-8, 3]), -2);
  assert.equal(P('compute.log', [8, 2]), 3);
  assert.equal(P('compute.log', [1000, 10]), 3);
  assert.equal(P('compute.percentOf', [15, 80]), 12);
  assert.equal(P('compute.asPercent', [1, 4]), 25);
  assert.equal(P('compute.percentChange', [50, 75]), 50);
  assert.equal(P('compute.discount', [80, 15]), 68);
  assert.equal(P('compute.increase', [100, 8]), 108);
  assert.equal(P('compute.interest', [1000, 5, 3]), 150);
  assert.equal(fmtNum(P('compute.compound', [1000, 10, 2])), '1210');
  assert.equal(P('compute.hypot', [3, 4]), 5);
  assert.equal(fmtNum(P('compute.circleArea', [1])), '3.1');
  assert.equal(fmtNum(P('compute.circumference', [1])), '6.3');
  assert.equal(P('compute.triangleArea', [10, 5]), 25);
});

test('compute: unit conversion (length, mass, temperature, time) and refusal across dimensions', () => {
  assert.equal(P('compute.convert', [1, 'mile', 'km']), 1.609344);
  assert.equal(P('compute.convert', [5, 'ft', 'inches']), 60);
  assert.equal(P('compute.convert', [2, 'kg', 'g']), 2000);
  assert.equal(P('compute.convert', [1, 'lb', 'oz']), 16);
  assert.equal(P('compute.convert', [0, 'celsius', 'fahrenheit']), 32);
  assert.equal(P('compute.convert', [212, 'f', 'c']), 100);
  assert.equal(P('compute.convert', [0, 'c', 'k']), 273.15);
  assert.equal(P('compute.convert', [2, 'hours', 'minutes']), 120);
  assert.equal(P('compute.convert', [3, 'weeks', 'days']), 21);
  assert.equal(P('compute.convert', [1, 'kg', 'km']), null);
  assert.equal(P('compute.convert', [1, 'parsec', 'km']), null);
  const q = 'convert 5 km to miles';
  assert.equal(R(['render.number', ['compute.convert', ['sense.first'], ['sense.unit'], ['sense.unitTo']]], q), '3.1');
});

test('compute: base conversion and roman numerals both ways', () => {
  assert.equal(P('compute.toBase', [255, 16]), 'ff');
  assert.equal(P('compute.toBase', [-10, 2]), '-1010');
  assert.equal(P('compute.toBase', [10, 1]), null);
  assert.equal(P('compute.fromBase', ['ff', 16]), 255);
  assert.equal(P('compute.fromBase', ['0b101', 2]), 5);
  assert.equal(P('compute.fromBase', ['12', 2]), null);
  assert.equal(P('compute.fromBase', ['1'.repeat(70), 2]), 2n ** 70n - 1n);
  assert.equal(P('compute.toRoman', [2024]), 'MMXXIV');
  assert.equal(P('compute.toRoman', [4000]), null);
  assert.equal(P('compute.fromRoman', ['MMXXIV']), 2024);
  assert.equal(P('compute.fromRoman', ['IIII']), null);
  assert.equal(R(['render.number', ['compute.fromRoman', ['sense.roman']]], 'what is MCMXCIV'), '1994');
});

test('compute: dates by pure arithmetic (weekday, day of year, days between, add days, month length, parts)', () => {
  assert.equal(P('compute.weekday', [{ y: 2000, m: 1, d: 1 }]), 'Saturday');
  assert.equal(P('compute.weekday', [{ y: 2024, m: 2, d: 29 }]), 'Thursday');
  assert.equal(P('compute.weekday', [{ y: 2023, m: 2, d: 29 }]), null);
  assert.equal(R(['render.str', ['compute.weekday', ['sense.date']]], 'What day of the week was July 4, 1776?'), 'Thursday');
  assert.equal(P('compute.dayOfYear', [{ y: 2024, m: 3, d: 1 }]), 61);
  assert.equal(P('compute.daysBetween', [{ y: 2024, m: 1, d: 1 }, { y: 2024, m: 3, d: 1 }]), 60);
  assert.deepEqual(P('compute.addDays', [{ y: 2024, m: 2, d: 28 }, 2]), { y: 2024, m: 3, d: 1 });
  assert.equal(P('compute.daysInMonth', [2023, 2]), 28);
  assert.equal(P('compute.monthName', [12]), 'December');
  assert.equal(P('compute.year', [{ y: 2024, m: 3, d: 5 }]), 2024);
  assert.equal(P('compute.month', [{ y: 2024, m: 3, d: 5 }]), 3);
  assert.equal(P('compute.day', [{ y: 2024, m: 3, d: 5 }]), 5);
});

// ---------------------------------------------------------------- memory
const MEM = {
  table: { 'What is the capital of France?': 'Paris', 'speed of light in m/s': 299792458, 'boiling point of water': '100 C' },
  consts: { pi: 3.14159, g: '9.81' }, texts: { motto: 'Measure, then speak.' }, lists: { planets: ['Mercury', 'Venus'], bad: [1, 2] },
  tpl: ['The answer is ', { slot: 0 }, '.'], tpls: { day: ['Day ', { slot: 0 }] }, answer: 'forty two',
};
test('memory: table lookup at norm levels 1, 2 and 3, numbers from a table, has', () => {
  assert.equal(P('memory.lookup', ['what is the capital of france'], '', MEM), 'Paris', 'level 1');
  assert.equal(P('memory.lookup', ['the capital of France'], '', MEM), 'Paris', 'level 2 drops stop words');
  assert.equal(P('memory.lookup', ['France capital'], '', MEM), 'Paris', 'level 3 ignores order');
  assert.equal(P('memory.lookup', ['capital of Spain'], '', MEM), null);
  assert.equal(P('memory.lookup', ['speed of light in m/s'], '', MEM), '299792458');
  assert.equal(P('memory.lookupNum', ['speed of light in m/s'], '', MEM), 299792458);
  assert.equal(P('memory.lookupNum', ['boiling point of water'], '', MEM), null);
  assert.equal(P('memory.has', ['capital of france'], '', MEM), true);
  assert.equal(P('memory.has', ['capital of peru'], '', MEM), false);
  assert.equal(P('memory.has', ['x'], '', {}), null);
  assert.equal(R(['render.str', ['memory.lookup', ['sense.after', L('is')]]], 'what is the capital of France?', MEM), 'Paris');
});

test('memory: nearest by word overlap, consts, texts, lists, templates, the stored answer, the table', () => {
  assert.equal(P('memory.nearest', ['capital city of france'], '', MEM), 'Paris');
  assert.equal(P('memory.nearest', ['zebra'], '', MEM), null);
  assert.equal(P('memory.num', ['pi'], '', MEM), 3.14159);
  assert.equal(P('memory.num', ['g'], '', MEM), 9.81);
  assert.equal(P('memory.num', ['toString'], '', MEM), null, 'own keys only');
  assert.equal(P('memory.text', ['motto'], '', MEM), 'Measure, then speak.');
  assert.deepEqual(P('memory.list', ['planets'], '', MEM), ['Mercury', 'Venus']);
  assert.equal(P('memory.list', ['bad'], '', MEM), null);
  assert.deepEqual(P('memory.tpl', [], '', MEM), MEM.tpl);
  assert.deepEqual(P('memory.tplNamed', ['day'], '', MEM), MEM.tpls.day);
  assert.equal(P('memory.answer', [], '', MEM), 'forty two');
  assert.equal(P('memory.table', [], '', MEM), MEM.table);
  assert.equal(R(['render.template', ['memory.tpl'], ['memory.answer']], '', MEM), 'The answer is forty two.');
  assert.equal(R(['memory.answer'], '', null), null);
});

// ---------------------------------------------------------------- route
test('route: lazy if and first take a null branch, when and unless, case tables', () => {
  assert.equal(R(['route.if', L(true), L('a'), ['sense.quoted']], 'no quotes'), 'a', 'the unused branch may be null');
  assert.equal(R(['route.if', L(false), L('a'), ['sense.quoted']], 'no quotes'), null);
  assert.equal(R(['route.if', ['compare.isPrime', ['sense.first']], L('prime'), L('composite')], 'is 91 prime'), 'composite');
  assert.equal(R(['route.if', ['sense.has', ['sense.quoted']], L('a'), L('b')], 'x'), null, 'a null condition is a null');
  assert.equal(R(['route.ifNum', L(true), L(1), L(2)]), 1);
  assert.deepEqual(R(['route.ifStrs', L(false), L(['a']), L(['b'])]), ['b']);
  assert.equal(R(['route.first', ['sense.quoted'], ['sense.lastWord']], 'reverse banana'), 'banana');
  assert.equal(R(['route.first', ['sense.quoted'], ['sense.lastWord']], 'reverse "kiwi" now'), 'kiwi');
  assert.equal(R(['route.firstNum', ['sense.second'], ['sense.first']], 'only 7'), 7);
  assert.deepEqual(R(['route.firstStrs', ['sense.list'], ['sense.words']], 'a b'), ['a', 'b']);
  assert.equal(R(['route.when', L(true), L('x')]), 'x');
  assert.equal(R(['route.when', L(false), L('x')]), null);
  assert.equal(R(['route.unless', L(false), L('x')]), 'x');
  assert.equal(R(['route.whenNum', L(true), L(5)]), 5);
  const table = { red: 'stop', green: 'go', 'yellow light': 'slow' };
  assert.equal(R(['route.case', ['sense.lastWord'], L(table)], 'the light is GREEN'), 'go');
  assert.equal(R(['route.case', L('light yellow'), L(table)]), 'slow');
  assert.equal(R(['route.case', L('blue'), L(table)]), null);
  assert.equal(R(['route.caseNum', L('small'), L({ small: 1, large: '3' })]), 1);
  assert.equal(R(['route.caseNum', L('large'), L({ small: 1, large: '3' })]), 3);
});

// ---------------------------------------------------------------- iterate
test('iterate: ranges, steps, multiples, squares, powers, fibs, countdown, cumsum, diffs, growth, collatz, digits, repeat', () => {
  assert.deepEqual(P('iterate.range', [3]), [1, 2, 3]);
  assert.equal(P('iterate.range', [0]), null);
  assert.equal(P('iterate.range', [1e9]), null);
  assert.deepEqual(P('iterate.rangeFrom', [5, 2]), [5, 4, 3, 2]);
  assert.deepEqual(P('iterate.steps', [1, 0.5, 3]), [1, 1.5, 2]);
  assert.deepEqual(P('iterate.multiples', [7, 3]), [7, 14, 21]);
  assert.deepEqual(P('iterate.squares', [4]), [1, 4, 9, 16]);
  assert.deepEqual(P('iterate.powers', [2, 4]), [2, 4, 8, 16]);
  assert.equal(P('iterate.powers', [2, 70]).at(-1), 2n ** 70n);
  assert.deepEqual(P('iterate.fibs', [7]), [0, 1, 1, 2, 3, 5, 8]);
  assert.deepEqual(P('iterate.countdown', [3]), [3, 2, 1]);
  assert.deepEqual(P('iterate.cumsum', [[1, 2, 3]]), [1, 3, 6]);
  assert.deepEqual(P('iterate.diffs', [[1, 4, 9]]), [3, 5]);
  assert.deepEqual(P('iterate.growth', [100, 10, 2]).map(fmtNum), ['110', '121']);
  assert.deepEqual(P('iterate.collatz', [6]), [6, 3, 10, 5, 16, 8, 4, 2, 1]);
  assert.equal(P('iterate.collatz', [0]), null);
  assert.deepEqual(P('iterate.digits', [907]), [9, 0, 7]);
  assert.deepEqual(P('iterate.repeat', ['hi', 2]), ['hi', 'hi']);
});

test('iterate: mapTemplate gives one line per item (slot 0 the item, slot 1 the position, slot 2 the count)', () => {
  const tpl = ['Day ', { slot: 0 }, ' of ', { slot: 2 }, ': study'];
  assert.equal(R(['render.lines', ['iterate.mapTemplate', L(tpl), ['iterate.range', ['sense.first']]]], 'a 3 day plan'),
    'Day 1 of 3: study\nDay 2 of 3: study\nDay 3 of 3: study');
  assert.deepEqual(P('iterate.mapTemplateStrs', [[{ slot: 1 }, '. ', { slot: 0 }], ['eggs', 'milk']]), ['1. eggs', '2. milk']);
  assert.deepEqual(P('iterate.mapTemplate', [['x'], []]), []);
  assert.equal(P('iterate.mapTemplate', [[{ slot: 5 }], [1]]), null, 'a slot with no value is a null');
  assert.equal(P('iterate.mapTemplate', [['a', { nope: 1 }], [1]]), null, 'not a template');
});

// ---------------------------------------------------------------- render
test('render.number: plain digits, one decimal only when not whole, a BigInt in full', () => {
  assert.equal(P('render.number', [12]), '12');
  assert.equal(P('render.number', [12.25]), '12.3');
  assert.equal(P('render.number', [4.2]), '4.2');
  assert.equal(P('render.number', [2.0]), '2');
  assert.equal(P('render.number', [-0.04]), '0');
  assert.equal(P('render.number', [2n ** 64n]), '18446744073709551616');
  assert.equal(P('render.number', [1e21]), '1000000000000000000000');
  assert.equal(P('render.number', [1234567]), '1234567');
  assert.equal(P('render.number', [NaN]), null);
  assert.equal(P('render.number', ['12']), null);
});

test('render: decimals, percent, money, ordinal, unit, pair, date, str, code, sentence, json, kvLines', () => {
  assert.equal(P('render.decimals', [3.14159, 2]), '3.14');
  assert.equal(P('render.decimals', [2n ** 64n, 1]), '18446744073709551616.0');
  assert.equal(P('render.decimals', [1, 20]), null);
  assert.equal(P('render.percent', [12.5]), '12.5%');
  assert.equal(P('render.money', [68]), '$68.00');
  assert.equal(P('render.money', [-3.5]), '-$3.50');
  for (const [n, s] of [[1, '1st'], [2, '2nd'], [3, '3rd'], [4, '4th'], [11, '11th'], [12, '12th'], [13, '13th'], [22, '22nd'], [101, '101st'], [111, '111th']]) assert.equal(P('render.ordinal', [n]), s);
  assert.equal(P('render.ordinal', [1.5]), null);
  assert.equal(P('render.unit', [3.1, 'mi']), '3.1 mi');
  assert.equal(P('render.pair', ['Total', 7]), 'Total: 7');
  assert.equal(P('render.date', [{ y: 1776, m: 7, d: 4 }]), 'July 4, 1776');
  assert.equal(P('render.date', [{ y: 2023, m: 2, d: 29 }]), null);
  assert.equal(P('render.str', ['as is']), 'as is');
  assert.equal(P('render.code', ['x = 1']), '`x = 1`');
  assert.equal(P('render.code', ['a`b']), '`` a`b ``');
  assert.equal(P('render.sentence', ['hello there']), 'Hello there.');
  assert.equal(P('render.sentence', ['Done!']), 'Done!');
  assert.equal(P('render.sentence', ['   ']), null);
  assert.equal(P('render.json', [{ b: 2n ** 70n, a: [1] }]), '{"b":"1180591620717411303424","a":[1]}');
  assert.equal(P('render.kvLines', [{ a: 1, b: 'x', c: [1, 2] }]), 'a: 1\nb: x\nc: 1, 2');
});

test('render: lists (list, and, listNums, lines, numbered, bullets), yesNo, bool, template with rest slots', () => {
  assert.equal(P('render.list', [['a', 'b', 'c']]), 'a, b, c');
  assert.equal(P('render.and', [['a', 'b', 'c']]), 'a, b and c');
  assert.equal(P('render.and', [['a']]), 'a');
  assert.equal(P('render.listNums', [[1, 2.25, 2n ** 60n]]), '1, 2.3, 1152921504606846976');
  assert.equal(P('render.lines', [['a', 'b']]), 'a\nb');
  assert.equal(P('render.numbered', [['a', 'b']]), '1. a\n2. b');
  assert.equal(P('render.bullets', [['a', 'b']]), '- a\n- b');
  assert.equal(P('render.yesNo', [true, 'Yes', 'No']), 'Yes');
  assert.equal(P('render.yesNo', [false, 'Yes', 'No']), 'No');
  assert.equal(P('render.bool', [false]), 'No');
  assert.equal(R(['render.template', L(['From ', { slot: 0 }, ' to ', { slot: 1 }]), L('A'), L('B')]), 'From A to B');
  assert.equal(R(['render.templateNum', L([{ slot: 0 }, ' + ', { slot: 1 }, ' = ', { slot: 2 }]), L(2), L(3), L(5)]), '2 + 3 = 5');
  assert.equal(R(['render.template', L(['x ', { slot: 1 }]), L('A')]), null, 'a missing slot is a null');
  assert.ok(wellTyped(['render.template', L(['a']), L('x'), L('y'), L('z')], 'str'), 'rest slots are typed');
  assert.ok(!wellTyped(['render.template', L(['a']), L('x'), L(3)], 'str'), 'a rest slot of the wrong type');
});

// ---------------------------------------------------------------- pyramids
const H = {
  1: ['render.str', L('hello')],
  2: ['render.number', ['sense.first']],
  3: ['render.number', ['transform.add', ['sense.first'], ['sense.second']]],
  4: ['render.number', ['transform.square', ['transform.add', ['sense.first'], ['sense.second']]]],
};
test('pyramids: heights 1 to 4 evaluate, are well typed, and measure their own height and size', () => {
  const want = { 1: ['hello', 2], 2: ['3', 2], 3: ['7', 4], 4: ['49', 5] };
  for (const h of [1, 2, 3, 4]) {
    assert.equal(heightOf(H[h]), h, 'height ' + h);
    assert.equal(sizeOf(H[h]), want[h][1], 'size ' + h);
    assert.ok(wellTyped(H[h], 'str'), 'typed ' + h);
    assert.equal(R(H[h], 'add 3 and 4'), want[h][0], 'value ' + h);
  }
  assert.equal(heightOf(L(1)), 0);
  assert.equal(sizeOf(L(1)), 1);
  const wide = ['render.yesNo', ['compare.isPrime', ['aggregate.sum', ['sense.numbers']]], L('prime'), L('not prime')];
  assert.equal(heightOf(wide), 4);
  assert.equal(sizeOf(wide), 6);
  assert.equal(R(wide, 'is 3 + 4 prime'), 'prime');
  assert.equal(R(wide, 'is 4 + 4 prime'), 'not prime');
});

test('pyramids: as cells of height 1 to 4 they pass checkCell and answer through runCell', () => {
  for (const h of [1, 2, 3, 4]) {
    const cell = makeCell({ task: 'add', gen: 1, guard: [['nums>=', 2]], pyramid: H[h] });
    assert.deepEqual(checkCell(cell), { ok: true, errors: [] }, 'cell ' + h);
    assert.equal(cell.height, h);
    assert.equal(runCell(cell, 'add 3 and 4'), { 1: 'hello', 2: '3', 3: '7', 4: '49' }[h]);
    assert.equal(runCell(cell, 'add 3'), null, 'the guard holds the cell back');
  }
});

test('pyramids: wellTyped refuses a wrong type, a wrong count, an unknown name, a text literal', () => {
  assert.ok(!wellTyped(['render.number', L('3')], 'str'));
  assert.ok(!wellTyped(['render.number', ['sense.words']], 'str'));
  assert.ok(!wellTyped(['render.number'], 'str'));
  assert.ok(!wellTyped(['render.number', L(1), L(2)], 'str'));
  assert.ok(!wellTyped(['render.nope', L(1)], 'str'));
  assert.ok(!wellTyped(['aggregate.sum', ['sense.numbers']], 'str'));
  assert.ok(wellTyped(['aggregate.sum', ['sense.numbers']], 'num'));
  assert.ok(!wellTyped(L('x'), 'text'));
  assert.ok(wellTyped(L(2n ** 70n), 'num'));
  assert.ok(!wellTyped(L(NaN), 'num'));
});

// ---------------------------------------------------------------- null propagation
test('null propagation: a null leaf, a wrong count, an unknown primitive, a runtime type mismatch', () => {
  assert.equal(R(H[2], 'no digits here'), null);
  assert.equal(R(H[3], 'only 5'), null, 'a null deep in the pyramid reaches the apex');
  assert.equal(R(['render.number']), null);
  assert.equal(R(['render.number', L(1), L(2)]), null);
  assert.equal(R(['transform.add', L(1)]), null);
  for (const name of ['nope.x', '__proto__', 'constructor', 'toString', 'hasOwnProperty', '']) assert.equal(R([name, L(1)]), null, name);
  assert.equal(R(['render.number', L('12')]), null);
  assert.equal(R(['render.str', L(null)]), null);
  assert.equal(R({ lit: NaN }), null);
  assert.equal(R({ lit: -0 }), 0);
  assert.equal(runCell(makeCell({ task: 't', pyramid: ['render.str', L('  ')] }), 'x'), null, 'a blank answer is no answer');
});

test('null propagation: depth past MAX_DEPTH is a null, depth at it still evaluates', () => {
  const wrap = (k) => { let n = L(1); for (let i = 0; i < k; i++) n = ['transform.neg', n]; return n; };
  assert.equal(R(wrap(64)), 1);
  assert.equal(R(wrap(65)), null);
  assert.ok(wellTyped(wrap(64), 'num'));
  assert.ok(!wellTyped(wrap(65), 'num'));
  const deep = wrap(5000);
  assert.equal(R(deep), null);
  assert.equal(typeof heightOf(deep), 'number');
});

// ---------------------------------------------------------------- guard features, one by one
test('guard has: a whole phrase at norm level 1, not a substring of a word', () => {
  assert.equal(guardOk([['has', 'black holes']], 'Tell me about Black Holes!'), true);
  assert.equal(guardOk([['has', 'hole']], 'Tell me about black holes'), false);
  assert.equal(guardOk([['has', 'whats']], "What's up"), true);
});
test('guard hasAny: any one phrase of the list', () => {
  assert.equal(guardOk([['hasAny', ['total', 'sum']]], 'what is the total'), true);
  assert.equal(guardOk([['hasAny', ['total', 'sum']]], 'what is the average'), false);
});
test('guard starts: the lower-cased trimmed prompt begins with the text', () => {
  assert.equal(guardOk([['starts', 'What is']], '  what is 2+2'), true);
  assert.equal(guardOk([['starts', 'how']], 'what is 2+2'), false);
});
test('guard ends: the lower-cased trimmed prompt ends with the text', () => {
  assert.equal(guardOk([['ends', '?']], 'is it prime?  '), true);
  assert.equal(guardOk([['ends', '?']], 'it is prime.'), false);
});
test('guard nums>=: at least that many numbers', () => {
  assert.equal(guardOk([['nums>=', 2]], 'add 3 and 4'), true);
  assert.equal(guardOk([['nums>=', 2]], 'add 3'), false);
});
test('guard nums==: exactly that many numbers', () => {
  assert.equal(guardOk([['nums==', 1]], 'square 9'), true);
  assert.equal(guardOk([['nums==', 1]], 'add 9 and 1'), false);
  assert.equal(guardOk([['nums==', 0]], 'hello'), true);
});
test('guard words<=: at most that many words', () => {
  assert.equal(guardOk([['words<=', 3]], 'hi there!'), true);
  assert.equal(guardOk([['words<=', 3]], 'one two three four'), false);
});
test('guard words>=: at least that many words', () => {
  assert.equal(guardOk([['words>=', 3]], 'one two three'), true);
  assert.equal(guardOk([['words>=', 3]], 'one two'), false);
});
test('guard colon: the prompt carries a colon', () => {
  assert.equal(guardOk([['colon']], 'sort: b, a'), true);
  assert.equal(guardOk([['colon']], 'sort b a'), false);
});
test('guard quoted: the prompt carries quoted text', () => {
  assert.equal(guardOk([['quoted']], 'reverse "abc"'), true);
  assert.equal(guardOk([['quoted']], "don't reverse abc"), false);
});
test('guard not: the inverse of one feature, and a not of an unknown is not true', () => {
  assert.equal(guardOk([['not', ['has', 'weather']]], 'add 3 and 4'), true);
  assert.equal(guardOk([['not', ['has', 'weather']]], 'the weather today'), false);
  assert.equal(guardOk([['not', ['bogus']]], 'x'), false);
  assert.equal(guardOk([['not', ['not', ['colon']]]], 'a: b'), true);
});
test('guards: every feature must hold, an empty guard holds, unknown and malformed features never hold', () => {
  assert.equal(guardOk([['has', 'add'], ['nums>=', 2], ['words<=', 6]], 'add 3 and 4'), true);
  assert.equal(guardOk([['has', 'add'], ['nums>=', 3]], 'add 3 and 4'), false);
  assert.equal(guardOk([], 'anything'), true);
  assert.equal(guardOk([], ''), true);
  assert.equal(guardOk('has', 'has'), false);
  for (const ft of [['bogus'], ['has'], ['has', ''], ['has', 3], ['hasAny', []], ['nums>=', 'two'], ['nums>=', -1], ['colon', 1], ['not'], 'has', null]) {
    assert.equal(featureOk(ft), false, JSON.stringify(ft));
    assert.equal(guardOk([ft], 'has 3 colon: "q"'), false, JSON.stringify(ft));
  }
  for (const ft of [['has', 'a b'], ['hasAny', ['a']], ['starts', 'x'], ['ends', 'x'], ['nums>=', 0], ['nums==', 2], ['words<=', 9], ['words>=', 1], ['colon'], ['quoted'], ['not', ['colon']]]) {
    assert.equal(featureOk(ft), true, JSON.stringify(ft));
  }
});

// ---------------------------------------------------------------- norm
test('norm: level 1 lower case, only letters digits and spaces, runs collapsed, trimmed', () => {
  assert.equal(norm('  What is the CAPITAL\tof France?! ', 1), 'what is the capital of france');
  assert.equal(norm("It's 3.5 o'clock -- now", 1), 'its 35 oclock now');
  assert.equal(norm('Ça va, Zoë? 東京', 1), 'ça va zoë 東京');
  assert.equal(norm('...', 1), '');
  assert.equal(norm('Hello'), 'hello', 'level 1 is the default');
});
test('norm: level 2 drops the fixed stop words, level 3 sorts the unique rest', () => {
  assert.equal(norm('What is the capital of France?', 2), 'capital france');
  assert.equal(norm('Tell me the the capital of FRANCE', 2), 'capital france');
  assert.equal(norm('France capital, the capital', 3), 'capital france');
  assert.equal(norm('is it the', 2), '');
  assert.equal(norm('  Keep CASE?  ', 0), 'keep case?');
});
test('norm: an unknown level is null, a non-string is empty', () => {
  for (const lv of [4, -1, 1.5, '1', null]) assert.equal(norm('x', lv), null, String(lv));
  for (const q of [null, undefined, 3, {}, []]) assert.equal(norm(q, 2), '');
});

// ---------------------------------------------------------------- colony
test('makeColony: 10000 cells behind the index; a prompt touches only the cells its words reach, in cell order', () => {
  const quiet = (i) => makeCell({ task: 'always', guard: i ? [['not', ['colon']]] : [], pyramid: ['render.str', ['sense.quoted']] });
  const cells = [quiet(0), quiet(1)];
  for (let i = 0; i < 10000; i++) cells.push(makeCell({ task: 'w', gen: 1, guard: [['has', 'w' + i]], pyramid: ['render.str', L('cell ' + i)] }));
  const t0 = Date.now();
  const colony = makeColony(cells);
  assert.equal(colony.size, 10002);
  assert.deepEqual({ ...colony.stats }, { indexed: 10000, always: 2, words: 10000 });
  const step = (q) => { const before = colony.touched; const a = colony.answer(q); return [a, colony.touched - before]; };
  assert.deepEqual(step('w5000 and w7'), ['cell 7', 3], 'the lower cell index wins, whatever the word order');
  assert.deepEqual(step('nothing here'), [null, 2]);
  assert.deepEqual(step('w9999'), ['cell 9999', 3]);
  assert.deepEqual(step('W42!'), ['cell 42', 3]);
  assert.deepEqual(step(''), [null, 0]);
  assert.equal(colony.explain('w12').id, cells[14].id);
  assert.equal(colony.explain('w12').index, 14);
  assert.equal(colony.can('say "hi"'), true, 'an always cell answers when its pyramid does');
  assert.equal(colony.explain('say "hi"').index, 0);
  assert.ok(Date.now() - t0 < 10000);
});
test('makeColony: same-word cells run in cell order, a null passes to the next, hasAny indexes every phrase', () => {
  const cells = [
    makeCell({ task: 'a', guard: [['has', 'apple'], ['quoted']], pyramid: ['render.str', ['sense.quoted']] }),
    makeCell({ task: 'b', guard: [['hasAny', ['apple', 'pear tree']]], pyramid: ['render.str', L('fruit')] }),
    makeCell({ task: 'c', guard: [['has', 'apple']], pyramid: ['render.str', L('never reached')] }),
    { guard: 'not a list', pyramid: ['render.str', L('broken')] }, null, 7,
  ];
  const colony = makeColony(cells);
  assert.equal(colony.size, 4, 'only objects become cells');
  assert.deepEqual({ ...colony.stats }, { indexed: 3, always: 1, words: 3 });
  assert.equal(colony.answer('an "apple" pie'), 'apple');
  assert.equal(colony.answer('an apple pie'), 'fruit');
  assert.equal(colony.answer('a pear tree'), 'fruit');
  assert.equal(colony.answer('a pear'), null);
  assert.equal(colony.explain('a pear tree').index, 1);
  assert.equal(makeColony(null).answer('x'), null);
  assert.equal(makeColony([]).size, 0);
});

// ---------------------------------------------------------------- determinism and identity
test('determinism: the same pyramid, prompt and memory give the same value every time; ids ignore key order', () => {
  const prompts = ['add 3 and 4', 'what is 25 factorial', 'sort these: b, a', 'March 5, 2024', ''];
  const nodes = [H[3], H[4], ['render.list', ['transform.sortStrs', ['sense.list']]], ['render.date', ['sense.date']], ['render.number', ['compute.factorial', L(25)]]];
  const run = () => nodes.flatMap((n) => prompts.map((q) => R(n, q, MEM)));
  assert.deepEqual(run(), run());
  assert.equal(JSON.stringify(listPrims()), JSON.stringify(listPrims()));
  const spec = { task: 't', gen: 2, guard: [['has', 'x']], pyramid: H[2], mem: { b: 1, a: [2, 3n] } };
  assert.equal(makeCell(spec).id, makeCell({ ...spec, mem: { a: [2, 3n], b: 1 } }).id);
  assert.notEqual(makeCell(spec).id, makeCell({ ...spec, guard: [['has', 'y']] }).id);
  assert.equal(makeCell(spec).id, makeCell({ ...spec, task: 'other', gen: 9 }).id, 'the id is guard, pyramid and mem only');
  assert.equal(cellId([], null, null), cellId(undefined, undefined, undefined));
});
test('sha256: the pure kernel hash equals node:crypto on every block boundary and on unicode', () => {
  const ref = (s) => createHash('sha256').update(s, 'utf8').digest('hex');
  for (const n of [0, 1, 3, 55, 56, 57, 63, 64, 65, 119, 120, 1000]) assert.equal(sha256Hex('a'.repeat(n)), ref('a'.repeat(n)), 'length ' + n);
  for (const s of ['abc', 'é漢😀', '\u0000\n', JSON.stringify(H)]) assert.equal(sha256Hex(s), ref(s));
});

// ---------------------------------------------------------------- the cell shape
test('makeCell and checkCell: the NEO cell shape, and every corruption named', () => {
  const cell = makeCell({ task: 'mean', gen: 3, parents: ['n-00000000', 4], guard: [['has', 'average']], pyramid: ['render.number', ['aggregate.mean', ['sense.numbers']]], mem: null });
  assert.deepEqual(Object.keys(cell), ['id', 'task', 'gen', 'parents', 'guard', 'pyramid', 'mem', 'height', 'size', 'fit']);
  assert.match(cell.id, /^n-[0-9a-f]{8}$/);
  assert.equal(cell.id, 'n-' + createHash('sha256').update(JSON.stringify({ guard: cell.guard, mem: null, pyramid: cell.pyramid })).digest('hex').slice(0, 8));
  assert.deepEqual(cell.parents, ['n-00000000']);
  assert.deepEqual(cell.fit, { ok: 0, fired: 0, rows: 0 });
  assert.deepEqual(checkCell(cell), { ok: true, errors: [] });
  assert.equal(runCell(cell, 'the average of 3, 4 and 5'), '4');
  const bad = (patch) => checkCell({ ...cell, ...patch }).errors;
  assert.deepEqual(bad({ id: 'n-zzzzzzzz' }), ['id is not n- and 8 hex']);
  assert.deepEqual(bad({ id: 'n-00000000' }), ['id is not the hash of guard, pyramid and mem']);
  assert.deepEqual(bad({ task: '' }), ['task is not a word']);
  assert.deepEqual(bad({ gen: -1 }), ['gen is not an integer from 0']);
  assert.deepEqual(bad({ parents: [1] }), ['parents is not a list of ids']);
  assert.deepEqual(bad({ height: 9 }), ['height is not the pyramid height']);
  assert.deepEqual(bad({ size: 9 }), ['size is not the pyramid size']);
  assert.deepEqual(bad({ fit: null }), ['fit is not an object']);
  const remade = (spec) => checkCell(makeCell({ task: 't', ...spec })).errors;
  assert.deepEqual(remade({ guard: [['bogus']], pyramid: H[2] }), ['guard is not a list of known features']);
  assert.deepEqual(remade({ pyramid: ['aggregate.sum', ['sense.numbers']] }), ['pyramid is not a well typed node to str']);
  assert.deepEqual(remade({ pyramid: ['transform.upper', ['sense.subject']] }), ['the apex is not a render primitive']);
  assert.deepEqual(remade({ pyramid: null }), ['pyramid is not a well typed node to str']);
  assert.deepEqual(checkCell(null), { ok: false, errors: ['the cell is not an object'] });
  assert.deepEqual(checkCell(makeCell({ task: 'm', pyramid: ['render.str', ['memory.lookup', ['sense.subject']]], mem: { table: { a: 'b' } } })), { ok: true, errors: [] });
});

// ---------------------------------------------------------------- contract safety and the marked region
const SRC = fs.readFileSync(KERNEL_FILE, 'utf8');
const lines = SRC.split(/\r?\n/);
const OPEN = lines.indexOf('// <KERNEL>'), CLOSE = lines.indexOf('// </KERNEL>');
const REGION = lines.slice(OPEN + 1, CLOSE).join('\n');
test('contract safety: the whole kernel text passes every FORBIDDEN pattern and imports nothing', () => {
  for (const [re, what] of FORBIDDEN) assert.ok(!re.test(SRC), 'the kernel uses ' + what);
  assert.deepEqual(importsOf(SRC), []);
  assert.ok(!/—/.test(SRC), 'no em-dash');
  assert.ok(!/\bMath\.random\b|\bDate\.now\b|\bnew Date\b|\bperformance\b/.test(SRC), 'nothing that varies between runs');
});
test('contract safety: the markers appear once as whole lines, the region holds no import or export, the exports follow it', () => {
  assert.ok(OPEN > 0 && CLOSE > OPEN);
  assert.equal(lines.filter((l) => l === '// <KERNEL>').length, 1);
  assert.equal(lines.filter((l) => l === '// </KERNEL>').length, 1);
  assert.ok(!/^\s*(import|export)\b/m.test(REGION));
  assert.ok(/^export\s*\{/m.test(lines.slice(CLOSE + 1).join('\n')));
  assert.ok(!/^\s*export\b/m.test(lines.slice(0, OPEN).join('\n')));
  assert.ok(Buffer.byteLength(REGION) < MAX_SOURCE_BYTES, 'the region fits inside one cell source');
});
test('the marked region alone: evaluated with nothing around it, it answers, and a cell module built on it passes validateCell', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'neo-kernel-'));
  try {
    const alone = path.join(dir, 'alone.mjs');
    fs.writeFileSync(alone, REGION + '\nexport { evalNode, makeColony, makeCell, listPrims, PRIMS };\n');
    const K = await import(pathToFileURL(alone).href);
    assert.equal(K.listPrims().length, Object.keys(PRIMS).length);
    assert.equal(K.evalNode(H[4], 'add 3 and 4'), '49');
    assert.equal(K.evalNode(['render.number', ['compute.factorial', L(25)]], ''), '15511210043330985984000000');
    const cell = K.makeCell({ task: 'add', gen: 1, guard: [['has', 'add'], ['nums>=', 2]], pyramid: H[3] });
    const src = REGION + '\n' +
      'const COLONY = makeColony([' + JSON.stringify(cell) + ']);\n' +
      "export const meta = { id: 'neo-kernel-probe', class: 'arithmetic', generation: 1, lane: 'neo', grownFrom: ['add 3 and 4'], version: 1 };\n" +
      'export function can(q) { return COLONY.can(q); }\n' +
      'export function answer(q) { return COLONY.answer(q); }\n' +
      "export const examples = [{ q: 'add 3 and 4', expect: { equals: '7' } }];\n";
    const file = path.join(dir, 'cell.mjs');
    fs.writeFileSync(file, src);
    const mod = await import(pathToFileURL(file).href);
    assert.deepEqual(validateCell(src, mod), { ok: true, errors: [] });
    assert.equal(mod.answer('add 3 and 4'), '7');
    assert.equal(mod.can('subtract 3 from 4'), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
