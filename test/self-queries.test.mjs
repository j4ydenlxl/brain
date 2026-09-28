// test/self-queries.test.mjs: the generator of self asked questions (self/queries.mjs) and its bench
// (bench/self-queries.mjs). Board 34, item self-queries.
//
// Covered: determinism for a seed (and a row independent of how many rows were drawn); 50 truths at dev seed 7 that
// were verified BY HAND (the arithmetic done on paper, the weekdays by the Doomsday rule, not by the generator's
// Zeller), so a change that moves a truth fails here; import isolation (the generator imports nothing, and never
// anything under act/ or reason/; no Math.random); the four grade rules on right, wrong and refused answers; miss
// grouping and ranking; Zeller and the civil day count against JS Date; the controls on 3000 dev rows; the verdict's
// shape on a --n 40 run at two dev seeds (model off, nothing written, no self test so the bench does not recurse).
// Seeds 34 and 35 are the held out set and never appear in this file.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  generate, rowAt, grade, oracleText, perturbedText, KINDS, TEMPLATES, REFUSAL_HEADS, isRefusal, lastLine,
  zeller, dayNumber, isLeap, daysInMonth, ZELLER_DAYS, Q, qStr, qParse, qDecimal, mulberry32, ordinal,
} from '../self/queries.mjs';
import { MISS_HEADS } from '../bench/conceive.mjs';
import { run, groupMisses, controlsOf, crossCheck, parseArgs, refusalOf, BAR } from '../bench/self-queries.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEV = 7;

// ---------------------------------------------------------------- 50 truths verified by hand at dev seed 7
// Each prompt was read and its answer worked out by hand before this list was written: sums and products on paper,
// day counts month by month (Feb 1936, 1964 and 2076 have 29 days), weekdays by the Doomsday rule (2028 Jan 1 is a
// Saturday, Apr 1 is 91 days on; 1671's doomsday is Saturday and Dec 12 is a doomsday), fractions reduced by hand.
const HAND = [
  [0, 'Subtract 7.1 from 38.15. Give just the number.', '31.05'],
  [1, 'In the sequence 24, 28, 32, 36, where each term adds the same amount, what is term number 54?', '236'],
  [2, 'Tell me how many minutes there are in 40.8 days.', '58752'],
  [3, 'Tell me the weekday of April 17, 2028.', 'Monday'],
  [4, 'Count the vowels in "dog", just the number.', '1'],
  [5, "Spell the word 'cricket' backwards.", 'tekcirc'],
  [6, 'Is 1/2 bigger than 2/3?', 'no'],
  [7, 'What is the probability of rolling a 5 on a fair 20-sided die? Give a fraction.', '1/20'],
  [8, 'What is 240 times 52?', '12480'],
  [9, 'Tell me the number that follows 80, 75, 70, 65.', '60'],
  [10, 'How many milligrams are in a gram?', '1000'],
  [11, 'How many days after 22 October 1934 is 26 April 1936?', '552'],
  [12, "How many times does the letter e appear in 'level'?", '2'],
  [13, "Tell me letter number 8 of the word 'triangle'.", 'e'],
  [14, 'Which is bigger: 66999 or 66948?', '66999'],
  [15, 'A bag has 1 red ball and 9 blue balls. What is the probability of drawing a red ball? Give a decimal.', '0.1'],
  [16, "What's 55.49 times 7.25?", '402.3025'],
  [17, 'What is the next term: 18, 8, -2, -12, -22, -32?', '-42'],
  [18, 'Tell me how many milliliters there are in 688 centiliters.', '6880'],
  [19, 'How many days after 31 July 1963 is 6 November 1965?', '829'],
  [20, "How many times does the letter h appear in 'snake'?", '0'],
  [21, "Tell me letter number 7 of the word 'hamster'.", 'r'],
  [22, 'Which number is greater, 2/5 or 7/8?', '7/8'],
  [23, "A jar holds 6 red, 4 green and 3 blue marbles. If you pick one at random, what's the chance it's red?", '6/13'],
  [24, 'Add 69.03 and 63.5.', '132.53'],
  [25, 'What is the 29th square number?', '841'],
  [26, '719 kilograms is how many grams?', '719000'],
  [27, 'How many days are in the year 2309?', '365'],
  [28, "how many e's are in bear", '1'],
  [29, "Which letter comes second in 'cat'?", 'a'],
  [30, 'Which is larger, 5/7 or 3/5?', '5/7'],
  [31, "A letter is picked at random from the word 'student'. What is the probability it is the letter d?", '1/7'],
  [32, 'What is 552 divided by 23?', '24'],
  [33, "28, 40, 52, 64, 76, 88, ... what's next? just the number", '100'],
  [34, 'How many liters are in 770 milliliters?', '0.77'],
  [35, 'Is 1980 a leap year?', 'yes'],
  [36, "How many times does the letter a appear in 'kayak'?", '2'],
  [37, "Spell 'street' backwards.", 'teerts'],
  [38, 'Which is the smallest of 63559, 63648 and 63531?', '63531'],
  [39, "A jar holds 10 red, 6 green and 6 blue marbles. If you pick one at random, what's the chance it's red?", '5/11'],
  [40, 'What is 926 times 31?', '28706'],
  [41, 'The Fibonacci sequence starts 1, 1, 2, 3, 5. What is its 5th term?', '5'],
  [48, 'What is 6172 mod 47?', '15'],
  [56, "what's 8545 / 28, just the number", '8545/28'],
  [57, 'What comes next: 8, 5, 13, 18, 31, 49?', '80'],
  [58, 'Change 68.5 milligrams into kilograms, just the number.', '0.0000685'],
  [59, 'How many days after 24 November 2075 is 6 June 2076?', '195'],
  [64, 'If you add every number from 106 to 136, what do you get?', '3751'],
  [67, 'If today is Thursday, what day will it be in 57 days?', 'Friday'],
  [75, 'On what day of the week did December 26, 1671 fall?', 'Saturday'],
];

test('50 truths verified by hand at dev seed 7, across every kind', () => {
  assert.equal(HAND.length, 50);
  const kinds = new Set();
  for (const [index, prompt, truth] of HAND) {
    const r = rowAt(DEV, index);
    assert.equal(r.prompt, prompt, 'prompt of row ' + index);
    assert.equal(r.truth, truth, 'truth of row ' + index);
    assert.equal(grade(truth, r.gradeRule).state, 'correct', 'the hand truth grades correct on row ' + index);
    kinds.add(r.kind);
  }
  assert.deepEqual([...kinds].sort(), [...KINDS].sort());
});

// ---------------------------------------------------------------- determinism
test('a seed gives the same rows every time, and row i does not depend on n or start', () => {
  const a = generate({ seed: 9, n: 300 }), b = generate({ seed: 9, n: 300 });
  assert.deepEqual(a, b);
  assert.deepEqual(rowAt(9, 217), a[217]);
  assert.deepEqual(generate({ seed: 9, n: 20, start: 100 }), a.slice(100, 120));
  assert.deepEqual(generate({ seed: 9, n: 40 }), a.slice(0, 40));
  const c = generate({ seed: 8, n: 300 });
  const same = a.filter((r, i) => r.prompt === c[i].prompt).length;
  assert.ok(same < 30, 'seeds 8 and 9 share ' + same + ' of 300 prompts');
  for (const r of a) assert.equal(r.kind, KINDS[r.index % KINDS.length]);
  for (const r of a) for (const f of ['seed', 'index', 'id', 'kind', 'template', 'prompt', 'truth', 'gradeRule']) assert.ok(r[f] !== undefined && r[f] !== '', f + ' on ' + r.id);
  JSON.stringify(a); // every row is plain JSON (no BigInt)
});

test('mulberry32 repeats for a seed, yields uint32, and generation never calls Math.random', () => {
  const g = mulberry32(0);
  const first = [g(), g(), g()];
  const again = mulberry32(0);
  assert.deepEqual(first, [again(), again(), again()]);
  assert.ok(first.every((x) => Number.isInteger(x) && x >= 0 && x < 2 ** 32));
  const saved = Math.random;
  Math.random = () => { throw new Error('Math.random was called'); };
  try { generate({ seed: 7, n: 400 }); } finally { Math.random = saved; }
});

test('every kind has at least 6 templates and 8000 dev rows draw every template', () => {
  for (const k of KINDS) assert.ok(TEMPLATES.filter((t) => t.kind === k).length >= 6, k);
  const seen = new Set(generate({ seed: DEV, n: 8000 }).map((r) => r.template));
  assert.equal(seen.size, TEMPLATES.length);
});

// ---------------------------------------------------------------- import isolation
// The import scanner and the act/ or reason/ filter, as functions, so the same code that reads the real generator is
// first shown catching planted imports of every form (a scanner that has only ever seen a clean file is not a check).
const uncommented = (src) => src.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
const importSpecsOf = (code) => [...code.matchAll(/\bimport\b[^;]*?\bfrom\s*['"]([^'"]+)['"]|\bimport\s*\(\s*['"`]([^'"`]+)['"`]\s*\)|^\s*import\s*['"]([^'"]+)['"]|\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/gm)].map((m) => m[1] ?? m[2] ?? m[3] ?? m[4]);
const isActOrReason = (spec) => /(^|\/)(act|reason)\//.test(spec);
const PLANTED = [
  ["import { ask } from '../act/prompt.mjs';", '../act/prompt.mjs', true],
  ['import * as S from "../act/solve.mjs";', '../act/solve.mjs', true],
  ["const R = await import('../reason/chain.mjs');", '../reason/chain.mjs', true],
  ["import '../reason/side.mjs';", '../reason/side.mjs', true],
  ["const E = require('../act/exact.mjs');", '../act/exact.mjs', true],
  ["import {\n  a,\n  b,\n} from '../act/multi.mjs';", '../act/multi.mjs', true],
  ["import { readFileSync } from 'node:fs';", 'node:fs', false],
  ["import { gaps } from './gaps.mjs';", './gaps.mjs', false],
  ["import x from '../contract/react.mjs';", '../contract/react.mjs', false],
];

test('the import scanner catches every planted import form, and the filter flags exactly the act/ and reason/ ones', () => {
  for (const [line, spec, flagged] of PLANTED) {
    const found = importSpecsOf(uncommented('export const k = 1;\n' + line + '\nexport const j = 2;\n'));
    assert.deepEqual(found, [spec], 'planted: ' + line);
    assert.equal(isActOrReason(found[0]), flagged, 'filter on ' + spec);
  }
  assert.deepEqual(importSpecsOf(uncommented("// import { ask } from '../act/prompt.mjs';\nexport const k = 1;\n")), [], 'a commented import is not an import');
  const all = importSpecsOf(uncommented(PLANTED.map(([l]) => l).join('\n')));
  assert.equal(all.length, PLANTED.length);
  assert.equal(all.filter(isActOrReason).length, PLANTED.filter(([, , f]) => f).length);
});

test('the generator imports nothing (never act/ or reason/) and does not read files or the clock', () => {
  const src = readFileSync(path.join(ROOT, 'self/queries.mjs'), 'utf8');
  const code = uncommented(src);
  assert.ok(code.length > 10000, 'the generator source was read (' + code.length + ' characters)');
  const specs = importSpecsOf(code);
  assert.deepEqual(specs, [], 'imports found: ' + specs.join(', '));
  assert.deepEqual(specs.filter(isActOrReason), [], 'act/ or reason/ imports found');
  assert.ok(!/\bimport\s*\(/.test(code), 'no dynamic import');
  assert.ok(!/\brequire\s*\(/.test(code), 'no require');
  assert.ok(!/Math\.random|Date\.now|new Date|process\./.test(code), 'no randomness, clock or process reads');
});

test('REFUSAL_HEADS is the same list as bench/conceive.mjs MISS_HEADS', () => {
  assert.deepEqual([...REFUSAL_HEADS], [...MISS_HEADS]);
});

// ---------------------------------------------------------------- the rational helpers
test('rationals: parse, reduce, decimals', () => {
  assert.equal(qStr(Q(6, 28)), '3/14');
  assert.equal(qStr(Q(-4, -8)), '1/2');
  assert.equal(qStr(qParse('7.75')), '31/4');
  assert.equal(qStr(qParse('1,234')), '1234');
  assert.equal(qStr(qParse('3.5/2')), '7/4');
  assert.equal(qParse('abc'), null);
  assert.equal(qParse('4/0'), null);
  assert.equal(qDecimal(Q(137, 2000000)), '0.0000685');
  assert.equal(qDecimal(Q(-3, 8)), '-0.375');
  assert.equal(qDecimal(Q(1, 3)), null);
  assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 111].map(ordinal), ['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '111th']);
});

// ---------------------------------------------------------------- the grade rules
const R = (value, extra = {}) => ({ type: 'rational', value, ...extra });
test('rational rule: right, wrong and refused answers', () => {
  const g = (t, rule) => grade(t, rule).state;
  assert.equal(g('31/4', R('31/4')), 'correct');
  assert.equal(g('7.75', R('31/4')), 'correct');
  assert.equal(g('7 3/4', R('31/4')), 'correct');
  assert.equal(g('The answer is 7.75.', R('31/4')), 'correct');
  assert.equal(g('answered exactly by exact.arith\n- the same value in decimal is 7.75\n31/4', R('31/4')), 'correct');
  assert.equal(g('Result: 1,234', R('1234')), 'correct');
  assert.equal(g('-42', R('-42')), 'correct');
  assert.equal(g('0.3333', R('1/3')), 'wrong');
  assert.equal(g('7.76', R('31/4')), 'wrong');
  assert.equal(g('586', R('41328')), 'wrong');
  assert.equal(g('1/2 of the balls, so 3', R('1/2')), 'wrong');
  assert.equal(g('no number here', R('5')), 'wrong');
  assert.equal(g('2/4', R('1/2', { lowest: true })), 'wrong');
  assert.equal(g('1/2', R('1/2', { lowest: true })), 'correct');
  assert.equal(g('2/4', R('1/2')), 'correct');
  assert.equal(g('', R('5')), 'refused');
  assert.equal(g('   \n ', R('5')), 'refused');
  for (const h of MISS_HEADS) assert.equal(grade(h + ': what is 2 plus 3?\n5', R('5'), { refusal: refusalOf }).state, 'refused', h);
});

test('choice rule: the option named, and the comparative between two', () => {
  const rule = { type: 'choice', options: ['0.7', '0.65'], answer: 0, direction: 'max' };
  const g = (t) => grade(t, rule).state;
  assert.equal(g('0.7'), 'correct');
  assert.equal(g('0.70'), 'correct');
  assert.equal(g('0.7 is larger than 0.65'), 'correct');
  assert.equal(g('0.65 is smaller than 0.7'), 'correct');
  assert.equal(g('Between 0.7 and 0.65, the larger is 0.7'), 'correct');
  assert.equal(g('0.65'), 'wrong');
  assert.equal(g('0.65 is larger than 0.7'), 'wrong');
  assert.equal(g('0.7 or 0.65'), 'wrong');
  assert.equal(g('5'), 'wrong');
  assert.equal(g(''), 'refused');
  const min3 = { type: 'choice', options: ['4/5', '1/12', '5/11'], answer: 1, direction: 'min' };
  assert.equal(grade('1/12', min3).state, 'correct');
  assert.equal(grade('The smallest is 1/12.', min3).state, 'correct');
  assert.equal(grade('4/5', min3).state, 'wrong');
  assert.equal(grade('1/12 is smaller than 4/5', min3).state, 'wrong', 'two of three options compared settles nothing');
  assert.equal(grade('Of 4/5, 1/12 and 5/11, the smallest is 1/12', min3).state, 'correct');
  assert.equal(grade('Of 4/5, 1/12 and 5/11, the smallest is 4/5', min3).state, 'wrong');
});

test('yes or no rule: first word, negation, affirmation', () => {
  const yes = { type: 'yesno', value: 'yes', affirm: 'leap year' }, no = { type: 'yesno', value: 'no', affirm: 'leap year' };
  assert.equal(grade('Yes', yes).state, 'correct');
  assert.equal(grade('The answer is yes.', yes).state, 'correct');
  assert.equal(grade('1980 is a leap year.', yes).state, 'correct');
  assert.equal(grade('No', yes).state, 'wrong');
  assert.equal(grade('1980 is not a leap year.', yes).state, 'wrong');
  assert.equal(grade("No, it isn't.", no).state, 'correct');
  assert.equal(grade('2100 is not a leap year', no).state, 'correct');
  assert.equal(grade('Yes, it is not', no).state, 'wrong');
  assert.equal(grade('365', no).state, 'wrong');
  assert.equal(grade('', no).state, 'refused');
});

test('one of rule: weekday family and spellings', () => {
  const mon = { type: 'oneOf', accept: ['monday', 'mon'], family: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] };
  assert.equal(grade('Monday', mon).state, 'correct');
  assert.equal(grade('It was a Monday.', mon).state, 'correct');
  assert.equal(grade('mon', mon).state, 'correct');
  assert.equal(grade('Tuesday', mon).state, 'wrong');
  assert.equal(grade('Monday or Tuesday', mon).state, 'wrong');
  assert.equal(grade('1646', mon).state, 'wrong');
  assert.equal(grade('', mon).state, 'refused');
  const back = { type: 'oneOf', accept: ['tekcirc', 't-e-k-c-i-r-c', 't e k c i r c'] };
  assert.equal(grade('tekcirc', back).state, 'correct');
  assert.equal(grade("'tekcirc'", back).state, 'correct');
  assert.equal(grade('Backwards it is tekcirc.', back).state, 'correct');
  assert.equal(grade('t-e-k-c-i-r-c', back).state, 'correct');
  assert.equal(grade('cricket', back).state, 'wrong');
  assert.equal(grade('tekcirc is not it', back).state, 'wrong');
  assert.equal(lastLine('steps\n\n**tekcirc**\n'), 'tekcirc');
  assert.equal(isRefusal('I do not carry that yet: x'), true);
  assert.equal(isRefusal('I do carry that'), false);
});

test('controls hold and a second computation agrees on 3000 dev rows', () => {
  let failed = 0, checks = 0;
  const cross = { agree: 0, disagree: 0, none: 0 };
  for (const r of generate({ seed: 8, n: 3000 })) {
    for (const [, ok] of controlsOf(r)) { checks++; if (!ok) failed++; }
    cross[crossCheck(r)]++;
  }
  assert.ok(checks >= 3000 * 9);
  assert.equal(failed, 0);
  assert.deepEqual(cross, { agree: 3000, disagree: 0, none: 0 });
  // the controls can fail: a truth that is off by one is not correct, a perturbed text is not the truth
  const r = rowAt(8, 0);
  assert.notEqual(grade(perturbedText(r), r.gradeRule).state, 'correct');
  assert.equal(grade(oracleText(r, 2), r.gradeRule).state, 'correct');
});

// ---------------------------------------------------------------- the calendar against JS Date
test('Zeller and the civil day count agree with JS Date from 1600 to 2400', () => {
  const SUN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let n = 0;
  for (let t = Date.UTC(1600, 0, 1); t < Date.UTC(2401, 0, 1); t += 86400000 * 13) {
    const d = new Date(t);
    const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, day = d.getUTCDate();
    assert.equal(ZELLER_DAYS[zeller(y, m, day)], SUN[d.getUTCDay()], y + '-' + m + '-' + day);
    assert.equal(dayNumber(y, m, day) - dayNumber(1600, 1, 1), Math.round((t - Date.UTC(1600, 0, 1)) / 86400000));
    n++;
  }
  assert.ok(n > 22000);
  assert.deepEqual([1900, 2000, 2024, 2100, 2023].map(isLeap), [false, true, true, false, false]);
  assert.equal(daysInMonth(2000, 2), 29);
  assert.equal(daysInMonth(1900, 2), 28);
});

// ---------------------------------------------------------------- miss grouping
test('misses group by template, ranked by count then by template id, correct rows excluded', () => {
  const rows = [
    { template: 'b.t', kind: 'b', state: 'refused' }, { template: 'a.t', kind: 'a', state: 'wrong' },
    { template: 'b.t', kind: 'b', state: 'wrong' }, { template: 'c.t', kind: 'c', state: 'correct' },
    { template: 'a.t', kind: 'a', state: 'refused' }, { template: 'd.t', kind: 'd', state: 'refused' },
    { template: 'b.t', kind: 'b', state: 'refused' },
  ];
  const g = groupMisses(rows);
  assert.deepEqual(g.map((x) => [x.template, x.count, x.wrong, x.refused]), [['b.t', 3, 1, 2], ['a.t', 2, 1, 1], ['d.t', 1, 0, 1]]);
  assert.equal(g.reduce((s, x) => s + x.rows.length, 0), 6);
});

test('the bench flags: defaults are the bar, a repeated seed is refused', () => {
  assert.deepEqual(parseArgs([]), { n: BAR.n, seeds: [34, 35], write: true, json: false, quiet: false, selfTest: true });
  assert.deepEqual(parseArgs(['--n', '40', '--seed', '7', '--seed', '8', '--nowrite']).seeds, [7, 8]);
  assert.throws(() => parseArgs(['--seed', '7', '--seed', '7']));
  assert.throws(() => parseArgs(['--n', '0']));
  assert.throws(() => parseArgs(['--bogus']));
});

// ---------------------------------------------------------------- the verdict shape on a --n 40 run
test('verdict shape on a --n 40 run at two dev seeds (model off, nothing written)', async () => {
  const v = await run({ n: 40, seeds: [7, 8], write: false, selfTest: false });
  for (const k of ['at', 'command', 'node', 'isTheBar', 'barMet', 'split', 'byKind', 'byTemplate', 'wrongRows', 'ns', 'qps', 'statement', 'paired', 'controls', 'secondOpinion']) assert.ok(k in v, k);
  assert.ok(!Number.isNaN(Date.parse(v.at)));
  assert.equal(v.isTheBar, false);
  assert.equal(v.barMet, false);
  assert.match(v.notTheBarBecause, /barSize/);
  assert.match(v.notTheBarBecause, /selfTestPassed/);
  assert.equal(v.split.contaminated, true, 'dev seeds are not held out');
  assert.deepEqual(Object.keys(v.split.heldOut.rowsSha256).sort(), ['7', '8']);
  assert.match(v.split.heldOut.rowsSha256['7'], /^[0-9a-f]{64}$/);
  assert.equal(v.totals.asked, 80);
  assert.equal(v.totals.correct + v.totals.wrong + v.totals.refused, 80);
  assert.equal(v.totals.answered, v.totals.correct + v.totals.wrong);
  for (const k of KINDS) {
    assert.equal(v.byKind[k].asked, 10, k);
    assert.equal(v.byKind[k].bySeed['7'].asked, 5);
    assert.ok(Number.isFinite(v.byKind[k].medianNs) && v.byKind[k].medianNs > 0);
    assert.ok(Number.isFinite(v.byKind[k].p95Ns));
  }
  assert.equal(Object.keys(v.byTemplate).length, TEMPLATES.length);
  const drawn = Object.values(v.byTemplate).reduce((s, t) => s + t.asked, 0);
  assert.equal(drawn, 80);
  for (const t of Object.values(v.byTemplate)) for (const f of ['asked', 'correct', 'wrong', 'refused']) assert.ok(Number.isInteger(t[f]));
  assert.equal(v.wrongRows.length, v.totals.wrong);
  for (const w of v.wrongRows) for (const f of ['id', 'prompt', 'given', 'truth']) assert.ok(typeof w[f] === 'string', f);
  assert.equal(v.controls.failed, 0);
  assert.equal(v.secondOpinion.disagree, 0);
  assert.equal(v.sockets, 0);
  assert.equal(v.checks.modelOff, true);
  assert.ok(v.qps > 0 && v.ns.median > 0);
  assert.deepEqual(v.paired.seeds, [7, 8]);
  assert.equal(v.paired.rows.length, TEMPLATES.length);
  assert.equal(typeof v.statement, 'string');
  assert.ok(!v.statement.includes(String.fromCharCode(0x2014)) && !v.statement.includes('\n'));
  assert.equal(v.wroteTo, null);
});
