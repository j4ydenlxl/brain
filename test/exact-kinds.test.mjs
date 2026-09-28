// test/exact-kinds.test.mjs: act/exact-kinds.mjs, nine kinds read exactly or refused (board 34, item exact-kinds).
//
// Every reader is asked at least three phrasings and at least one question it must refuse. Where a second
// implementation exists outside the reader it grades the reader: the weekday and the date arithmetic against the
// JavaScript Date (proleptic Gregorian, UTC), the dice against an enumeration written here, the sequence against the
// generator that built it. A refusal is asserted as null: a wrong exact answer is worse than no answer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { exactKinds, READ, KINDS, KIND_METHODS, KIND_CAPS } from '../act/exact-kinds.mjs';
import { solve, METHODS } from '../act/solve.mjs';

const ans = (t) => { const r = exactKinds(t); return r ? r.answer : null; };
function reads(kind, rows) {
  for (const [q, want] of rows) {
    const r = exactKinds(q);
    assert.ok(r, kind + ' read nothing: ' + q);
    assert.equal(r.answer, want, q);
    assert.equal(r.method, 'exact.' + kind, q);
    assert.ok(Array.isArray(r.steps) && r.steps.length > 0, q);
    const own = READ[kind](q);
    assert.ok(own && own.answer === want, 'the ' + kind + ' reader itself: ' + q);
  }
}
function refuses(rows) { for (const q of rows) assert.equal(exactKinds(q), null, 'must refuse: ' + q); }

test('the module: nine kinds, their methods, the caps, and nothing read from outside the text', () => {
  assert.deepEqual([...KINDS], ['units', 'sequence', 'counting', 'spelling', 'calendar', 'comparison', 'probability', 'geometry', 'logic']);
  assert.deepEqual([...KIND_METHODS], KINDS.map((k) => 'exact.' + k));
  for (const m of KIND_METHODS) assert.ok(METHODS.includes(m), 'solve METHODS lists ' + m);
  assert.deepEqual(Object.keys(READ), [...KINDS]);
  const src = readFileSync(new URL('../act/exact-kinds.mjs', import.meta.url), 'utf8');
  for (const bad of ['eval(', 'new Function', 'node:fs', 'node:child_process', 'node:vm', 'node:net', 'fetch(', 'process.env', 'Math.random', 'parseFloat(', 'Number.parseFloat']) assert.ok(!src.includes(bad), 'act/exact-kinds.mjs does not use ' + bad);
  assert.equal(exactKinds(''), null);
  assert.equal(exactKinds(null), null);
  assert.equal(exactKinds('x'.repeat(KIND_CAPS.chars + 1)), null);
  assert.equal(exactKinds('How many centimeters are in 3.5 meters? ' + ' '.repeat(KIND_CAPS.chars)), null, 'the cap is on the raw text');
});

test('units: exact factors, compound quantities, a stated fact checked, and a unit that depends on the country refused', () => {
  reads('units', [
    ['How many centimeters are in 3.5 meters?', '350'],
    ['Convert 5 kilometers to meters.', '5000'],
    ['What is 100 degrees Celsius in Fahrenheit?', '212'],
    ['How many seconds are in 3 hours and 15 minutes?', '11700'],
    ['A trail is 3 miles long. How many feet is that?', '15840'],
    ['There are 12 inches in a foot. How many feet are in 72 inches?', '6'],
    ['How many grams are in 2 pounds?', '907.18474'],
  ]);
  for (let n = 1; n <= 20; n++) assert.equal(ans('How many inches are in ' + n + ' feet?'), String(12 * n));
  refuses([
    'How many cups are in a gallon?',
    'How many weeks are in a year?',
    'There are 10 inches in a foot. How many inches are in 2 feet?',
    'How many meters are in 5 kilograms?',
    'How many tons are in 3000 pounds?',
  ]);
});

test('sequence: every surviving rule agrees, checked twice beyond its parameters, or nothing', () => {
  reads('sequence', [
    ['What is the next number in the sequence 2, 4, 8, 16?', '32'],
    ['What comes next: 3, 6, 9, 12, 15?', '18'],
    ['What is the next number: 1, 1, 2, 3, 5, 8?', '13'],
    ['What letter comes next: A, C, E, G?', 'I'],
    ['What number comes next: 1, 4, 9, 16, 25?', '36'],
  ]);
  // graded against the generator: arithmetic and geometric runs built here
  for (const [a, d] of [[4, 3], [-7, 5], [100, -9], [0, 11]]) {
    const ts = [0, 1, 2, 3, 4].map((i) => a + i * d);
    assert.equal(ans('What comes next: ' + ts.join(', ') + '?'), String(a + 5 * d));
  }
  for (const [a, r] of [[3, 2], [5, 3], [-2, 4]]) {
    const ts = [0, 1, 2, 3].map((i) => a * r ** i);
    assert.equal(ans('What is the next number in the sequence ' + ts.join(', ') + '?'), String(a * r ** 4));
  }
  refuses([
    'What comes next: 1, 2, 4?',
    'What comes next: 1, 2, 4, 7, 12?',
    'What is the next number: 3, 1, 4, 1, 5?',
    'What letter comes next: A, c, E, g?',
  ]);
});

test('counting: letters, vowels, words and a letter in quoted text; a y, an unquoted sentence and the world refused', () => {
  reads('counting', [
    ["How many letters are in the word 'elephant'?", '8'],
    ["How many vowels are in the word 'banana'?", '3'],
    ["How many words are in this sentence: 'The quick brown fox jumps high'?", '6'],
    ["How many times does the letter s appear in 'mississippi'?", '4'],
    ['How many sides does a hexagon have?', '6'],
    ['How many letters are in the word connectome?', '10'],
  ]);
  refuses([
    'How many legs do three spiders have in total?',
    "How many vowels are in the word 'rhythm'?",
    'How many words are in the sentence: the gate holds a proposal.',
    'How many sides does a circle have?',
  ]);
});

test('spelling: reverse, a letter by position, case, alphabetical order and a number in words; the ambiguous refused', () => {
  reads('spelling', [
    ["Spell the word 'stressed' backwards.", 'desserts'],
    ["What is the first letter of the word 'zebra'?", 'z'],
    ["Write the word 'hello' in all capital letters.", 'HELLO'],
    ['Put these letters in alphabetical order: d, a, c, b.', 'a, b, c, d'],
    ['How do you spell the number 7 as a word?', 'seven'],
    ["What is the last letter of the word 'ledger'?", 'r'],
  ]);
  refuses([
    'Write the word brain with its letters in reverse order.',
    'How do you spell the number 121 as a word?',
    "Capitalize 'hello'.",
    "What is the tenth letter of the word 'cat'?",
  ]);
});

test('calendar: weekdays graded against the JavaScript Date on 200 dates from 1753 to 9999', () => {
  reads('calendar', [
    ['If today is Monday, what day will it be in three days?', 'Thursday'],
    ['What day of the week was July 4, 1776?', 'Thursday'],
    ['How many days are in February 2024?', '29'],
    ['What date is 10 days after 2026-02-25?', '2026-03-07'],
    ['How many days are in a leap year?', '366'],
    ['What month comes before March?', 'February'],
  ]);
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let seed = 34n;
  const next = (n) => { seed = (seed * 6364136223846793005n + 1442695040888963407n) % (2n ** 64n); return Number((seed >> 33n) % BigInt(n)); };
  for (let i = 0; i < 200; i++) {
    const y = 1753 + next(8247), m = 1 + next(12), d = 1 + next(28);
    const js = new Date(Date.UTC(2000, m - 1, d)); js.setUTCFullYear(y);
    assert.equal(ans('What day of the week was ' + MONTHS[m - 1] + ' ' + d + ', ' + y + '?'), DAYS[js.getUTCDay()], y + '-' + m + '-' + d);
    const k = next(5000);
    const later = new Date(js.getTime() + k * 86400000);
    if (later.getUTCFullYear() <= 9999) {
      const iso = (x) => String(x.getUTCFullYear()).padStart(4, '0') + '-' + String(x.getUTCMonth() + 1).padStart(2, '0') + '-' + String(x.getUTCDate()).padStart(2, '0');
      assert.equal(ans('What date is ' + k + ' days after ' + iso(js) + '?'), iso(later));
    }
  }
  refuses([
    'How many days are in February?',
    'What day of the week was January 1, 1700?',
    "In which month is New Year's Day?",
    '2026-03-01 is a Monday. What weekday is 2026-03-15?',
    'What date is 3 days after 2026-02-30?',
  ]);
});

test('comparison: exact rationals and quantities; a thing that is not a number or a table unit refused', () => {
  reads('comparison', [
    ['Which is larger, 0.7 or 0.65?', '0.7'],
    ['Which is heavier, a kilogram of feathers or a kilogram of iron?', 'neither: they are the same'],
    ['Which is longer, a meter or a yard?', 'a meter'],
    ['Order these numbers from least to greatest: 0.5, 1/3, 0.45, 2/5.', '1/3, 2/5, 0.45, 0.5'],
    ['Is 2^10 greater than 1000?', 'yes'],
    ['What is the largest of these numbers: 17, 71, 7, 70?', '71'],
  ]);
  refuses([
    'Which is bigger, the Sun or the Moon?',
    'Which is heavier, 1 kilogram or 1 meter?',
    'Which is faster, sound or light?',
    'Which has more legs, a spider or an ant?',
    'Order these numbers from least to greatest: 0.5, 1/2, 3.',
  ]);
});

test('probability: fair coins, dice, urns and a deck; the dice graded against an enumeration written here', () => {
  reads('probability', [
    ['If you flip a fair coin, what is the probability of heads? Give a fraction.', '1/2'],
    ['A bag has 3 red balls and 7 blue balls. What is the probability of drawing a red ball? Give a decimal.', '0.3'],
    ['Two fair dice are rolled. What is the probability that the total is 7?', '1/6'],
    ['What is the probability of rolling an even number on a fair six-sided die?', '1/2'],
    ['Two fair coins are flipped. What is the probability both land heads? Give a fraction.', '1/4'],
  ]);
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  for (let t = 2; t <= 12; t++) {
    let n = 0; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === t) n++;
    const g = gcd(n, 36);
    assert.equal(ans('Two fair dice are rolled. What is the probability that the total is ' + t + '?'), (n / g) + '/' + (36 / g), 'total ' + t);
  }
  refuses([
    'If you flip a coin, what is the probability of heads?',
    'What are the odds of rolling a 6 on a fair die?',
    'A bag has 2 red balls and 3 blue balls. Two balls are drawn. What is the probability both are red?',
    'What is the probability of rolling a 1 on a fair six-sided die? Give a decimal.',
  ]);
});

test('geometry: areas, perimeters, pi kept as a symbol, a rational hypotenuse; an irrational length refused', () => {
  reads('geometry', [
    ['What is the area of a rectangle that is 6 by 4?', '24'],
    ['What is the perimeter of a square with sides of 9?', '36'],
    ['What is the area of a circle with radius 5? Leave your answer in terms of pi.', '25π'],
    ['A right triangle has legs of 6 and 8. How long is the hypotenuse?', '10'],
    ['How many degrees are in a right angle?', '90'],
    ['What is the area of a triangle with base 10 and height 6?', '30'],
  ]);
  refuses([
    'A right triangle has legs of 1 and 1. How long is the hypotenuse?',
    'What is the area of a rectangle that is 6 cm by 4 m?',
    'What is the area of a hexagon with sides of 2?',
  ]);
});

test('logic: syllogisms, conditionals and orders read to yes, no or a name; an undetermined conclusion refused', () => {
  reads('logic', [
    ['If all bloops are razzies and all razzies are lazzies, are all bloops lazzies? Answer yes or no.', 'yes'],
    ['Answer yes or no: if it is raining the ground is wet, and the ground is dry, is it raining?', 'no'],
    ['Anna is taller than Ben, and Ben is taller than Cara. Who is the shortest?', 'Cara'],
    ['If no cats are dogs and Tom is a cat, is Tom a dog? Answer with one word.', 'no'],
    ['All blickets are daxes. Kip is a blicket. Is Kip a dax?', 'yes'],
    ['Jo is taller than Kim. Is Kim shorter than Jo?', 'yes'],
  ]);
  refuses([
    'Which number is the odd one out: 2, 4, 7, 8?',
    'All cats are animals. Is every animal a cat?',
    'Anna is taller than Ben. Cara is taller than Ben. Who is the tallest?',
    'If it rains the grass is wet. The grass is wet. Is it raining?',
  ]);
});

test('the three gaps are closed in solve(), and the nine kinds reach it with their own method', () => {
  assert.equal(solve('What is the sum of all the whole numbers from 1 to 100?').answer, '5050');
  assert.equal(solve('What is the remainder when 100 is divided by 7?').answer, '2');
  assert.equal(solve('What is 0.1 + 0.2 exactly?').answer, '0.3');
  for (const q of ['What is the sum of all the whole numbers from 1 to 100?', 'What is the remainder when 100 is divided by 7?', 'What is 0.1 + 0.2 exactly?']) assert.equal(solve(q).method, 'exact.arith', q);
  assert.equal(solve('100 % 7'), null);
  assert.equal(solve('How many days are in a leap year?').method, 'exact.calendar');
  assert.equal(solve('Which is larger, 0.7 or 0.65?').method, 'exact.comparison');
});

test('the verdict: its shape, and the held-out row count and sha256 it states are the file on disk', () => {
  const v = JSON.parse(readFileSync(new URL('../bench/verdicts/exact-kinds.json', import.meta.url), 'utf8'));
  for (const k of ['at', 'command', 'node', 'isTheBar', 'barMet', 'split', 'development', 'heldOut', 'control', 'wrongRows', 'ns', 'statement']) assert.ok(k in v, 'verdict has ' + k);
  assert.equal(typeof v.isTheBar, 'boolean');
  assert.equal(typeof v.barMet, 'boolean');
  assert.ok(v.split.contaminated === false || (typeof v.split.contaminated === 'string' && v.split.contaminated.length > 0), 'contaminated is false or the reason');
  assert.ok(Array.isArray(v.wrongRows));
  for (const w of v.wrongRows) for (const f of ['id', 'given', 'wanted']) assert.ok(f in w, 'a wrong row has ' + f);
  for (const pop of ['development', 'heldOut']) {
    for (const k of KINDS) {
      const b = v[pop].byKind[k];
      assert.ok(b, pop + ' ' + k);
      assert.equal(b.answered, b.correct + b.wrong, pop + ' ' + k + ' answered = correct + wrong');
      assert.equal(b.asked, b.answered + b.refused, pop + ' ' + k + ' asked = answered + refused');
    }
  }
  const buf = readFileSync(new URL('../bench/exact-kinds-heldout.jsonl', import.meta.url));
  const rows = buf.toString('utf8').split(/\r?\n/).filter((l) => l.trim());
  assert.equal(rows.length, v.split.heldOut.rows, 'the held-out row count the verdict states');
  assert.equal(createHash('sha256').update(buf).digest('hex'), v.split.heldOut.sha256, 'the held-out sha256 the verdict states');
  assert.equal(KINDS.reduce((s, k) => s + v.heldOut.byKind[k].asked, 0), rows.length, 'every held-out row was asked');
});
