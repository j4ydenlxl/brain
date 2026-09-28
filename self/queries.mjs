// self/queries.mjs: QUESTIONS THE ORGANISM ASKS ITSELF, EACH CARRYING ITS OWN TRUTH.
//
// His words, 2026-09-28: "simulating and stimulating itself by so many automatic queries and self iteration"
// (docs/VISION.md orders 5, 6 and 53). Until this file the organism was graded only on hand-written sets (291 census
// prompts, 1319 GSM8K, 161 HumanEval, 400 ARC tasks), so a gap between two phrasings of the same question was never
// seen. This is a seeded generator of questions in eight kinds, each row with the truth computed HERE, by code that
// never imports anything under act/ or reason/ (the test reads this module's import lines and asserts it): the reader
// that answers a question and the code that knows its answer are two programs. Author: board 34 builder (item
// self-queries). MODEL OFF: nothing here opens a socket or reads a file.
//
// THE RANDOMNESS: mulberry32 (Tommy Ettinger's 32 bit generator) over a per row seed mixed from (seed, index) by the
// murmur3 finalizer, so row i at seed s is the same row whether 40 or 5000 rows are drawn, and no Math.random runs.
// THE KINDS, round robin by index (index mod 8), each with 8 to 33 phrasing templates drawn from the census wording
// (bench/conceive-prompts.json, the development set) and from ordinary speech ("what's", "how many", "tell me",
// trailing instructions like "just the number"), so the same truth appears under different words:
//   arithmetic   integers, decimals, fractions, mixed operators with precedence, percent of, the sum from a to b,
//                remainders; truth by BigInt rationals written below (Q, qAdd, ...), never a float
//   sequence     arithmetic, geometric, squares, Fibonacci like; the next term, and the nth term of a named rule
//   units        metric length, mass, volume, and time; exact rational factors; a value is drawn until the answer
//                is a terminating decimal
//   calendar     days in a month, leap years, the weekday of a date by Zeller's congruence, days between two dates
//                by a civil day count, a weekday shifted by k days
//   counting     letters, vowels (words without y), one letter's occurrences, words in a generated sentence
//   spelling     a word backwards, the nth letter
//   comparison   integers, decimals (the 9.9 against 9.11 trap), fractions, a fraction against a decimal; which is
//                larger or smaller, a yes or no, the smallest of three
//   probability  coins (all alike, exactly k heads), dice (a face, a class of faces, greater than k, the sum of two),
//                a bag, a jar, numbered cards, a letter of a word; fractions in lowest terms
// EVERY ROW: {seed, index, id, kind, template, sub, prompt, truth, gradeRule, args}. truth is the display string;
// gradeRule is what grade() below reads:
//   rational  the LAST number on the answer's last line (after its last colon when that part holds a number; a
//             mixed number "7 3/4" read whole) equals value exactly, as a BigInt rational (31/4 meets 7.75; 0.3333
//             does not meet 1/3); lowest: true (the prompt asked for lowest terms) also refuses 2/4 for 1/2
//   choice    of the options named on the last line, the one the question asks for (larger or smaller); with two
//             options both named, the comparative word between them ("0.7 is larger than 0.65", "0.65 is smaller than
//             0.7"); a restatement ("of 0.7 and 0.65, the larger is 0.7"); anything else naming two options is wrong
//   yesno     the first word (yes, no and their kin); else a yes word with no negation reads yes, a negation (not,
//             no, n't) with no yes word reads no; else the rule's affirm phrase reads yes; anything else is wrong
//   oneOf     the whole candidate or its last word is an accepted spelling; with a family (the weekday names), the
//             family members named on the line are all accepted ones
// A REFUSAL is graded before any rule: an empty text, or a text that starts with one of REFUSAL_HEADS (a copy of
// bench/conceive.mjs MISS_HEADS; the test asserts the two lists are equal). grade() returns correct, wrong or refused.
//
// THE CONTROLS the bench runs on every row (they check the rules, not the organism): oracleText(row, style) states the
// truth in one of three styles and must grade correct; perturbedText(row) states a nearby wrong answer and must grade
// wrong; the empty text must grade refused.
//
//   import { generate, rowAt, grade, KINDS, TEMPLATES } from './queries.mjs';
//   generate({ seed: 34, n: 5000 })   rows 0..4999 at seed 34

export const GENERATOR_VERSION = 1;
export const KINDS = Object.freeze(['arithmetic', 'sequence', 'units', 'calendar', 'counting', 'spelling', 'comparison', 'probability']);
/** The miss heads, copied from bench/conceive.mjs MISS_HEADS (the test asserts equality): a text starting with one is a refusal. */
export const REFUSAL_HEADS = Object.freeze([
  'I do not carry that yet',
  'nothing in memory matches',
  'the math region produced no number',
  'the code region produced no candidate',
]);

// ---------------------------------------------------------------- the randomness
/** mulberry32: a 32 bit state, one uint32 per call. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  };
}
/** murmur3's 32 bit finalizer. */
export function fmix32(h) {
  h >>>= 0;
  h ^= h >>> 16; h = Math.imul(h, 0x85EBCA6B) >>> 0;
  h ^= h >>> 13; h = Math.imul(h, 0xC2B2AE35) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}
/** The seed of one row: (seed, index) mixed, so a row never depends on how many rows were drawn. */
export const rowSeed = (seed, index) => fmix32((Math.imul(seed >>> 0, 0x9E3779B1) ^ fmix32((index >>> 0) + 0x632BE5AB)) >>> 0);

function rng(seed) {
  const next = mulberry32(seed);
  const r = {
    u32: next,
    /** an integer in [lo, hi], both inclusive */
    int: (lo, hi) => lo + (next() % (hi - lo + 1)),
    pick: (a) => a[next() % a.length],
    chance: (p) => next() / 4294967296 < p,
  };
  return r;
}

// ---------------------------------------------------------------- exact rationals on BigInt
const gcdB = (a, b) => { if (a < 0n) a = -a; if (b < 0n) b = -b; while (b) { const t = a % b; a = b; b = t; } return a; };
/** A rational in lowest terms, the denominator positive. */
export function Q(n, d = 1n) {
  let N = BigInt(n), D = BigInt(d);
  if (D === 0n) throw new RangeError('a rational with denominator 0');
  if (D < 0n) { N = -N; D = -D; }
  const g = gcdB(N, D) || 1n;
  return Object.freeze({ n: N / g, d: D / g });
}
export const qAdd = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d);
export const qSub = (a, b) => Q(a.n * b.d - b.n * a.d, a.d * b.d);
export const qMul = (a, b) => Q(a.n * b.n, a.d * b.d);
export const qDiv = (a, b) => { if (b.n === 0n) throw new RangeError('division by zero'); return Q(a.n * b.d, a.d * b.n); };
export const qCmp = (a, b) => { const x = a.n * b.d - b.n * a.d; return x > 0n ? 1 : x < 0n ? -1 : 0; };
export const qEq = (a, b) => a.n === b.n && a.d === b.d;
/** "p/q", or "p" for an integer. */
export const qStr = (a) => (a.d === 1n ? String(a.n) : a.n + '/' + a.d);
/** The exact decimal of a rational whose denominator has no prime but 2 and 5, else null. */
export function qDecimal(a) {
  let d = a.d, k2 = 0, k5 = 0;
  while (d % 2n === 0n) { d /= 2n; k2++; }
  while (d % 5n === 0n) { d /= 5n; k5++; }
  if (d !== 1n) return null;
  const k = Math.max(k2, k5);
  const scaled = (a.n * 10n ** BigInt(k)) / a.d;
  const neg = scaled < 0n;
  let s = (neg ? -scaled : scaled).toString();
  if (k > 0) { s = s.padStart(k + 1, '0'); s = s.slice(0, s.length - k) + '.' + s.slice(s.length - k); }
  return (neg ? '-' : '') + s;
}
/** The display of a truth: an integer as is; 'decimal' prefers the exact decimal where one exists; else p/q. */
export const qShow = (a, prefer = 'decimal') => (a.d === 1n ? String(a.n) : prefer === 'decimal' ? (qDecimal(a) ?? qStr(a)) : qStr(a));
/** A rational from text: "-3", "3.25", "1,234", ".5", "31/4", "3.5/2". Null when it is not one. */
export function qParse(s) {
  const t = String(s ?? '').replace(/−/g, '-').replace(/,/g, '').replace(/\s+/g, '');
  const m = /^(-?)(\d*)(?:\.(\d+))?(?:\/(-?)(\d*)(?:\.(\d+))?)?$/.exec(t);
  if (!m || (!m[2] && !m[3])) return null;
  const dec = (sign, int, frac) => Q(BigInt(sign + ((int || '0') + (frac || ''))), 10n ** BigInt((frac || '').length));
  const num = dec(m[1], m[2], m[3]);
  if (m[5] === undefined && m[6] === undefined) return num;
  if (!m[5] && !m[6]) return null;
  const den = dec(m[4], m[5], m[6]);
  if (den.n === 0n) return null;
  return qDiv(num, den);
}

// ---------------------------------------------------------------- words
const ORD_WORDS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
/** 1st, 2nd, 3rd, 4th, 11th, 12th, 13th, 21st, 111th. */
export function ordinal(n) {
  const h = n % 100, t = n % 10;
  const suf = h >= 11 && h <= 13 ? 'th' : t === 1 ? 'st' : t === 2 ? 'nd' : t === 3 ? 'rd' : 'th';
  return n + suf;
}
const NUM_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const MONTHS = Object.freeze(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']);
/** Weekday names in Zeller's order: h = 0 is Saturday. */
export const ZELLER_DAYS = Object.freeze(['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
/** Monday first, for the shift questions. */
export const WEEK = Object.freeze(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
const WEEKDAY_FAMILY = Object.freeze([...WEEK.map((d) => d.toLowerCase()), ...WEEK.map((d) => d.slice(0, 3).toLowerCase())]);
const weekdayAccept = (name) => [name.toLowerCase(), name.slice(0, 3).toLowerCase()];

/** The word bank: common English words, lower case letters only. */
export const WORDS = Object.freeze(('apple banana cherry garden window planet orange rocket bridge castle dragon forest guitar island jungle '
  + 'kitten ladder marble needle octopus pencil rabbit silver tomato umbrella violin walnut zebra anchor basket candle desert '
  + 'engine feather giraffe hammer jacket kettle lemon magnet napkin orchid pepper quilt ribbon saddle turtle valley wagon '
  + 'yellow elephant mississippi strawberry stressed tomorrow library computer mountain river ocean camera picture morning '
  + 'evening teacher student chicken pumpkin blanket popcorn sandwich hospital chocolate butterfly telephone dinosaur '
  + 'pineapple triangle rectangle kangaroo alligator avocado broccoli calendar squirrel penguin lantern compass diamond '
  + 'emerald harbor meadow orchard puzzle tunnel volcano whistle cabbage carrot noodle pickle waffle biscuit muffin pretzel '
  + 'lobster dolphin panther parrot peacock sparrow beaver badger ferret hamster lizard spider beetle cricket mirror pillow '
  + 'bottle button cotton kitchen letter bubble coffee balloon committee bookkeeper success cat dog sun moon tree house '
  + 'water bread cloud storm light music paper glass stone horse mouse snake eagle tiger lion bear wolf fox owl frog '
  + 'shark whale honey sugar salt spoon fork plate table chair door floor roof wall street city country family friend '
  + 'banana racecar level kayak rotor civic radar refer noon madam').split(/\s+/));
/** Words with no y, for the vowel questions (so a, e, i, o, u is the whole answer). */
const NO_Y_WORDS = Object.freeze(WORDS.filter((w) => !w.includes('y')));
const SENTENCE_WORDS = Object.freeze(('the a my your our their this that big small red blue green happy quick slow old new tall short '
  + 'little bright dark warm cold loud quiet brave kind clever runs jumps sings reads writes sleeps walks swims flies eats '
  + 'drinks paints builds finds sees hears likes and with under over near beside behind before after today again always '
  + 'never slowly quickly softly gladly').split(/\s+/).concat(WORDS.slice(0, 80)));
const VOWELS = 'aeiou';

// ---------------------------------------------------------------- the calendar, computed here
export const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
export const daysInMonth = (y, m) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
/** Zeller's congruence, Gregorian: 0 Saturday, 1 Sunday, ... 6 Friday (-2J written as +5J so the sum stays positive). */
export function zeller(y, m, d) {
  if (m < 3) { m += 12; y -= 1; }
  const K = y % 100, J = Math.floor(y / 100);
  return (d + Math.floor((13 * (m + 1)) / 5) + K + Math.floor(K / 4) + Math.floor(J / 4) + 5 * J) % 7;
}
/** The civil day count (days since 0000-03-01 of the proleptic Gregorian calendar); a difference is days between. */
export function dayNumber(y, m, d) {
  const yy = m <= 2 ? y - 1 : y;
  const mm = (m + 9) % 12; // March 0 ... February 11
  return 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) + Math.floor((153 * mm + 2) / 5) + d - 1;
}
const iso = (y, m, d) => String(y).padStart(4, '0') + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
function randomDate(r, y0, y1) {
  const y = r.int(y0, y1), m = r.int(1, 12), d = r.int(1, daysInMonth(y, m));
  return { y, m, d };
}

// ---------------------------------------------------------------- the rows' truths and rules
const rational = (value, extra = {}) => ({ type: 'rational', value: qStr(value), ...extra });
/** A row's args as plain JSON: the computed value (key v) dropped, so args carry only what the prompt states. */
function plainArgs(args) {
  const out = {};
  for (const [k, v] of Object.entries(args || {})) {
    if (k === 'v') continue;
    out[k] = typeof v === 'bigint' ? String(v) : v && typeof v === 'object' && typeof v.n === 'bigint' ? qStr(v) : v;
  }
  return out;
}
function numRow(prompt, value, prefer, args, extra = {}) {
  return { prompt, truth: qShow(value, prefer), gradeRule: rational(value, extra), args: plainArgs(args) };
}
/** A small decimal with 1 or 2 places, as {q, s}. */
function smallDecimal(r, maxInt = 99) {
  const places = r.int(1, 2);
  const scale = 10 ** places;
  let n = r.int(1, maxInt * scale);
  if (n % 10 === 0 && places === 2) n += r.int(1, 9); // keep the second place real
  if (n % scale === 0) n += 1;
  const q = Q(n, scale);
  return { q, s: qDecimal(q) };
}
function properFraction(r, maxDen = 12) {
  const d = r.int(2, maxDen), n = r.int(1, d - 1);
  const q = Q(n, d);
  return { q, s: qStr(q) };
}

// ---------------------------------------------------------------- arithmetic
const A = {
  add(r) { const a = r.int(2, 9999), b = r.int(2, 9999); return { a, b, v: Q(a + b) }; },
  sub(r) { const a = r.int(10, 9999); const b = r.chance(0.2) ? r.int(a + 1, a + 5000) : r.int(1, a - 1); return { a, b, v: Q(a - b) }; },
  mul(r) { const a = r.int(2, 999), b = r.int(2, 99); return { a, b, v: Q(a * b) }; },
  div(r) { const b = r.int(2, 50); const a = r.chance(0.7) ? b * r.int(2, 500) : r.int(10, 9999); return { a, b, v: Q(a, b) }; },
  dec(r, op) {
    const x = smallDecimal(r), y = smallDecimal(r, op === 'mul' ? 20 : 99);
    const v = op === 'add' ? qAdd(x.q, y.q) : op === 'sub' ? qSub(x.q, y.q) : qMul(x.q, y.q);
    return { a: x.s, b: y.s, v };
  },
  frac(r, op) {
    const x = properFraction(r), y = properFraction(r);
    const v = op === 'add' ? qAdd(x.q, y.q) : op === 'sub' ? qSub(x.q, y.q) : op === 'mul' ? qMul(x.q, y.q) : qDiv(x.q, y.q);
    return { a: x.s, b: y.s, v };
  },
  pct(r) { const p = r.pick([1, 2, 5, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 60, 65, 75, 80, 90, 110, 120, 125, 150, 200]); const x = r.int(2, 2000); return { p, x, v: qMul(Q(p, 100), Q(x)) }; },
  range(r) { const a = r.int(1, 200), b = a + r.int(1, 300); return { a, b, v: Q(((a + b) * (b - a + 1)) / 2) }; },
  mod(r) { const b = r.int(2, 60), a = r.int(b + 1, 9999); return { a, b, v: Q(a % b) }; },
};
function precedence(r, shape) {
  const a = r.int(2, 99), b = r.int(2, 30), c = r.int(2, 30), d = r.int(2, 30);
  if (shape === 'add-mul') return { a, b, c, v: Q(a + b * c) };
  if (shape === 'sub-mul') return { a, b, c, v: Q(a - b * c) };
  if (shape === 'parens') return { a, b, c, v: Q((a + b) * c) };
  return { a, b, c, d, v: Q(a * b - c * d) }; // 'four'
}
const ARITH_T = [
  ['add.what-plus', 'int.add', (r) => { const x = A.add(r); return numRow(`What is ${x.a} plus ${x.b}?`, x.v, 'decimal', x); }],
  ['add.whats-symbol', 'int.add', (r) => { const x = A.add(r); return numRow(`what's ${x.a} + ${x.b}`, x.v, 'decimal', x); }],
  ['add.tell-me-sum', 'int.add', (r) => { const x = A.add(r); return numRow(`Tell me the sum of ${x.a} and ${x.b}.`, x.v, 'decimal', x); }],
  ['add.imperative', 'int.add', (r) => { const x = A.add(r); return numRow(`Add ${x.a} and ${x.b}.`, x.v, 'decimal', x); }],
  ['sub.compute-minus', 'int.sub', (r) => { const x = A.sub(r); return numRow(`Compute ${x.a} minus ${x.b}.`, x.v, 'decimal', x); }],
  ['sub.subtract-from', 'int.sub', (r) => { const x = A.sub(r); return numRow(`Subtract ${x.b} from ${x.a}.`, x.v, 'decimal', x); }],
  ['sub.how-much-just-number', 'int.sub', (r) => { const x = A.sub(r); return numRow(`How much is ${x.a} - ${x.b}? Just the number.`, x.v, 'decimal', x); }],
  ['mul.what-times', 'int.mul', (r) => { const x = A.mul(r); return numRow(`What is ${x.a} times ${x.b}?`, x.v, 'decimal', x); }],
  ['mul.multiply-by', 'int.mul', (r) => { const x = A.mul(r); return numRow(`Multiply ${x.a} by ${x.b}.`, x.v, 'decimal', x); }],
  ['mul.whats-product', 'int.mul', (r) => { const x = A.mul(r); return numRow(`What's the product of ${x.a} and ${x.b}?`, x.v, 'decimal', x); }],
  ['div.what-divided-by', 'int.div', (r) => { const x = A.div(r); return numRow(`What is ${x.a} divided by ${x.b}?`, x.v, 'decimal', x); }],
  ['div.divide-imperative', 'int.div', (r) => { const x = A.div(r); return numRow(`Divide ${x.a} by ${x.b}.`, x.v, 'decimal', x); }],
  ['div.whats-slash-just-number', 'int.div', (r) => { const x = A.div(r); return numRow(`what's ${x.a} / ${x.b}, just the number`, x.v, 'decimal', x); }],
  ['dec.what-plus', 'dec.add', (r) => { const x = A.dec(r, 'add'); return numRow(`What is ${x.a} + ${x.b}?`, x.v, 'decimal', { a: x.a, b: x.b, op: 'add' }); }],
  ['dec.add-imperative', 'dec.add', (r) => { const x = A.dec(r, 'add'); return numRow(`Add ${x.a} and ${x.b}.`, x.v, 'decimal', { a: x.a, b: x.b, op: 'add' }); }],
  ['dec.whats-times', 'dec.mul', (r) => { const x = A.dec(r, 'mul'); return numRow(`What's ${x.a} times ${x.b}?`, x.v, 'decimal', { a: x.a, b: x.b, op: 'mul' }); }],
  ['dec.subtract-just-number', 'dec.sub', (r) => { const x = A.dec(r, 'sub'); return numRow(`Subtract ${x.b} from ${x.a}. Give just the number.`, x.v, 'decimal', { a: x.a, b: x.b, op: 'sub' }); }],
  ['frac.what-plus', 'frac.add', (r) => { const x = A.frac(r, 'add'); return numRow(`What is ${x.a} plus ${x.b}?`, x.v, 'fraction', { a: x.a, b: x.b, op: 'add' }); }],
  ['frac.whats-minus-as-fraction', 'frac.sub', (r) => { const x = A.frac(r, 'sub'); return numRow(`What's ${x.a} - ${x.b}? Give the answer as a fraction.`, x.v, 'fraction', { a: x.a, b: x.b, op: 'sub' }); }],
  ['frac.multiply-by', 'frac.mul', (r) => { const x = A.frac(r, 'mul'); return numRow(`Multiply ${x.a} by ${x.b}.`, x.v, 'fraction', { a: x.a, b: x.b, op: 'mul' }); }],
  ['frac.what-divided-by', 'frac.div', (r) => { const x = A.frac(r, 'div'); return numRow(`What is ${x.a} divided by ${x.b}?`, x.v, 'fraction', { a: x.a, b: x.b, op: 'div' }); }],
  ['prec.symbolic', 'prec.add-mul', (r) => { const x = precedence(r, 'add-mul'); return numRow(`What is ${x.a} + ${x.b} * ${x.c}?`, x.v, 'decimal', { ...x, shape: 'add-mul' }); }],
  ['prec.spoken', 'prec.add-mul', (r) => { const x = precedence(r, 'add-mul'); return numRow(`What is ${x.a} plus ${x.b} times ${x.c}?`, x.v, 'decimal', { ...x, shape: 'add-mul' }); }],
  ['prec.subtract-symbolic', 'prec.sub-mul', (r) => { const x = precedence(r, 'sub-mul'); return numRow(`Compute ${x.a} - ${x.b} * ${x.c}.`, x.v, 'decimal', { ...x, shape: 'sub-mul' }); }],
  ['prec.parens', 'prec.parens', (r) => { const x = precedence(r, 'parens'); return numRow(`Compute (${x.a} + ${x.b}) * ${x.c}.`, x.v, 'decimal', { ...x, shape: 'parens' }); }],
  ['prec.four-terms', 'prec.four', (r) => { const x = precedence(r, 'four'); return numRow(`Evaluate ${x.a} * ${x.b} - ${x.c} * ${x.d}.`, x.v, 'decimal', { ...x, shape: 'four' }); }],
  ['pct.what-percent-of', 'pct', (r) => { const x = A.pct(r); return numRow(`What is ${x.p} percent of ${x.x}?`, x.v, 'decimal', x); }],
  ['pct.whats-sign', 'pct', (r) => { const x = A.pct(r); return numRow(`what's ${x.p}% of ${x.x}`, x.v, 'decimal', x); }],
  ['pct.find-just-number', 'pct', (r) => { const x = A.pct(r); return numRow(`Find ${x.p}% of ${x.x}, just the number.`, x.v, 'decimal', x); }],
  ['range.sum-of-integers', 'range', (r) => { const x = A.range(r); return numRow(`What is the sum of the integers from ${x.a} to ${x.b}?`, x.v, 'decimal', x); }],
  ['range.add-up-whole-numbers', 'range', (r) => { const x = A.range(r); return numRow(`Add up all the whole numbers from ${x.a} to ${x.b}.`, x.v, 'decimal', x); }],
  ['range.add-every-number', 'range', (r) => { const x = A.range(r); return numRow(`If you add every number from ${x.a} to ${x.b}, what do you get?`, x.v, 'decimal', x); }],
  ['mod.remainder-when', 'mod', (r) => { const x = A.mod(r); return numRow(`What is the remainder when ${x.a} is divided by ${x.b}?`, x.v, 'decimal', x); }],
  ['mod.what-mod', 'mod', (r) => { const x = A.mod(r); return numRow(`What is ${x.a} mod ${x.b}?`, x.v, 'decimal', x); }],
  ['mod.left-over', 'mod', (r) => { const x = A.mod(r); return numRow(`What's left over when you divide ${x.a} by ${x.b}?`, x.v, 'decimal', x); }],
];

// ---------------------------------------------------------------- sequence
/** The terms of a rule, shown count terms, and the next one. */
function seqRule(r) {
  const rule = r.pick(['arith', 'geom', 'square', 'fib']);
  const terms = [];
  if (rule === 'arith') {
    const a = r.int(-20, 100); let d = r.int(-15, 15); if (d === 0) d = 7;
    const count = r.int(4, 6);
    for (let i = 0; i <= count; i++) terms.push(BigInt(a + i * d));
    return { rule, terms, count, params: { a, d } };
  }
  if (rule === 'geom') {
    const a = r.int(1, 9), q = r.int(2, 5), count = r.int(4, 5);
    let t = BigInt(a);
    for (let i = 0; i <= count; i++) { terms.push(t); t *= BigInt(q); }
    return { rule, terms, count, params: { a, q } };
  }
  if (rule === 'square') {
    const k = r.int(1, 20), count = r.int(4, 5);
    for (let i = 0; i <= count; i++) terms.push(BigInt((k + i) * (k + i)));
    return { rule, terms, count, params: { k } };
  }
  const a = r.int(1, 9), b = r.int(1, 9), count = 6;
  terms.push(BigInt(a), BigInt(b));
  while (terms.length <= count) terms.push(terms[terms.length - 1] + terms[terms.length - 2]);
  return { rule, terms, count, params: { a, b } };
}
function nextRow(r, render) {
  const s = seqRule(r);
  const shown = s.terms.slice(0, s.count).map(String).join(', ');
  const v = Q(s.terms[s.count]);
  return { ...numRow(render(shown), v, 'decimal', { rule: s.rule, ...s.params, shown: s.terms.slice(0, s.count).map(String) }), sub: 'next.' + s.rule };
}
const SEQ_T = [
  ['next.next-number-in', null, (r) => nextRow(r, (l) => `What is the next number in the sequence ${l}?`)],
  ['next.what-comes-next', null, (r) => nextRow(r, (l) => `What comes next: ${l}?`)],
  ['next.continue-pattern', null, (r) => nextRow(r, (l) => `Continue the pattern ${l}. What is next?`)],
  ['next.what-number-comes-next', null, (r) => nextRow(r, (l) => `What number comes next: ${l}?`)],
  ['next.next-term', null, (r) => nextRow(r, (l) => `What is the next term: ${l}?`)],
  ['next.casual-just-number', null, (r) => nextRow(r, (l) => `${l}, ... what's next? just the number`)],
  ['next.tell-me-follows', null, (r) => nextRow(r, (l) => `Tell me the number that follows ${l}.`)],
  ['nth.arithmetic-term', 'nth.arith', (r) => {
    const a = r.int(-20, 60); let d = r.int(-9, 12); if (d === 0) d = 3;
    const n = r.int(5, 60);
    return numRow(`What is the ${ordinal(n)} term of the arithmetic sequence ${a}, ${a + d}, ${a + 2 * d}, ...?`, Q(a + (n - 1) * d), 'decimal', { rule: 'arith', a, d, n });
  }],
  ['nth.term-number-same-amount', 'nth.arith', (r) => {
    const a = r.int(1, 50), d = r.int(1, 12), n = r.int(5, 60);
    return numRow(`In the sequence ${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, where each term adds the same amount, what is term number ${n}?`, Q(a + (n - 1) * d), 'decimal', { rule: 'arith', a, d, n });
  }],
  ['nth.geometric-term', 'nth.geom', (r) => {
    const a = r.int(1, 5), q = r.int(2, 4), n = r.int(4, 12);
    return numRow(`What is the ${ordinal(n)} term of the geometric sequence ${a}, ${a * q}, ${a * q * q}, ...?`, Q(BigInt(a) * BigInt(q) ** BigInt(n - 1)), 'decimal', { rule: 'geom', a, q, n });
  }],
  ['nth.square-number', 'nth.square', (r) => {
    const n = r.int(2, 40);
    return numRow(`What is the ${ordinal(n)} square number?`, Q(n * n), 'decimal', { rule: 'square', n });
  }],
  ['nth.fibonacci-term', 'nth.fib', (r) => {
    const n = r.int(3, 40);
    let a = 1n, b = 1n; for (let i = 3; i <= n; i++) { const t = a + b; a = b; b = t; }
    return numRow(`The Fibonacci sequence starts 1, 1, 2, 3, 5. What is its ${ordinal(n)} term?`, Q(n <= 2 ? 1n : b), 'decimal', { rule: 'fib', n });
  }],
];

// ---------------------------------------------------------------- units
const UNITS = Object.freeze({
  length: [['millimeter', 'millimeters', 'mm', Q(1, 1000)], ['centimeter', 'centimeters', 'cm', Q(1, 100)], ['meter', 'meters', 'm', Q(1)], ['kilometer', 'kilometers', 'km', Q(1000)]],
  mass: [['milligram', 'milligrams', 'mg', Q(1, 1000)], ['gram', 'grams', 'g', Q(1)], ['kilogram', 'kilograms', 'kg', Q(1000)]],
  volume: [['milliliter', 'milliliters', 'mL', Q(1, 1000)], ['centiliter', 'centiliters', 'cL', Q(1, 100)], ['liter', 'liters', 'L', Q(1)]],
  time: [['second', 'seconds', 's', Q(1)], ['minute', 'minutes', 'min', Q(60)], ['hour', 'hours', 'h', Q(3600)], ['day', 'days', null, Q(86400)], ['week', 'weeks', null, Q(604800)]],
});
export const UNIT_TABLE = UNITS;
/** A conversion whose answer is a terminating decimal: {cat, from, to, v, value, result}. */
function conversion(r, { abbrev = false, one = false } = {}) {
  for (let tries = 0; tries < 200; tries++) {
    const cat = r.pick(Object.keys(UNITS));
    const list = UNITS[cat].filter((u) => !abbrev || u[2]);
    const from = r.pick(list); let to = r.pick(list);
    if (to === from) continue;
    let v;
    if (one) v = Q(1);
    else {
      const k = r.int(0, 9);
      v = k < 5 ? Q(r.int(1, 999)) : k < 8 ? Q(r.int(1, 999), 10) : Q(r.int(1, 99) * 4 + r.int(1, 3), 4);
    }
    const result = qDiv(qMul(v, from[3]), to[3]);
    if (qDecimal(result) === null) continue;
    return { cat, from, to, v, vs: qDecimal(v), result };
  }
  throw new Error('no terminating conversion in 200 draws');
}
const unitName = (u, v) => (qEq(v, Q(1)) ? u[0] : u[1]);
function unitRow(r, render, opts) {
  const c = conversion(r, opts);
  return { ...numRow(render(c), c.result, 'decimal', { cat: c.cat, from: c.from[0], to: c.to[0], value: c.vs }), sub: c.cat };
}
const UNIT_T = [
  ['how-many-are-in', null, (r) => unitRow(r, (c) => `How many ${c.to[1]} are in ${c.vs} ${unitName(c.from, c.v)}?`)],
  ['convert-to', null, (r) => unitRow(r, (c) => `Convert ${c.vs} ${unitName(c.from, c.v)} to ${c.to[1]}.`)],
  ['what-is-in', null, (r) => unitRow(r, (c) => `What is ${c.vs} ${unitName(c.from, c.v)} in ${c.to[1]}?`)],
  ['is-how-many', null, (r) => unitRow(r, (c) => `${c.vs} ${unitName(c.from, c.v)} is how many ${c.to[1]}?`)],
  ['tell-me-how-many', null, (r) => unitRow(r, (c) => `Tell me how many ${c.to[1]} there are in ${c.vs} ${unitName(c.from, c.v)}.`)],
  ['change-into-just-number', null, (r) => unitRow(r, (c) => `Change ${c.vs} ${unitName(c.from, c.v)} into ${c.to[1]}, just the number.`)],
  ['whats-abbreviated', null, (r) => unitRow(r, (c) => `what's ${c.vs} ${c.from[2]} in ${c.to[2]}`, { abbrev: true })],
  ['how-many-in-a', null, (r) => unitRow(r, (c) => `How many ${c.to[1]} are in a ${c.from[0]}?`, { one: true })],
];

// ---------------------------------------------------------------- calendar
function monthRow(r, render) {
  const y = r.int(1600, 2400), m = r.int(1, 12);
  return { ...numRow(render(MONTHS[m - 1], y), Q(daysInMonth(y, m)), 'decimal', { y, m }), sub: 'days-in-month' };
}
function leapYear(r) {
  // a century year a quarter of the time, a multiple of 4 half the rest, so both answers and the 100/400 rule are drawn
  const k = r.int(0, 3);
  if (k === 0) return r.int(16, 24) * 100;
  if (k === 1) return r.int(400, 600) * 4;
  return r.int(1600, 2400);
}
function leapRow(r, render) {
  const y = leapYear(r), leap = isLeap(y);
  return { prompt: render(y), truth: leap ? 'yes' : 'no', gradeRule: { type: 'yesno', value: leap ? 'yes' : 'no', affirm: 'leap year' }, args: { y }, sub: 'leap' };
}
function weekdayRow(r, render, y0, y1) {
  const { y, m, d } = randomDate(r, y0, y1);
  const name = ZELLER_DAYS[zeller(y, m, d)];
  return { prompt: render({ y, m, d }), truth: name, gradeRule: { type: 'oneOf', accept: weekdayAccept(name), family: WEEKDAY_FAMILY }, args: { y, m, d }, sub: 'weekday' };
}
function betweenRow(r, render) {
  let a = randomDate(r, 1900, 2100);
  let b = { y: a.y + r.int(0, 2), m: 0, d: 0 };
  b.m = r.int(1, 12); b.d = r.int(1, daysInMonth(b.y, b.m));
  let da = dayNumber(a.y, a.m, a.d), db = dayNumber(b.y, b.m, b.d);
  if (db === da) { b = { y: b.y + 1, m: b.m, d: Math.min(b.d, daysInMonth(b.y + 1, b.m)) }; db = dayNumber(b.y, b.m, b.d); }
  if (db < da) { const t = a; a = b; b = t; const u = da; da = db; db = u; }
  return { ...numRow(render(a, b), Q(db - da), 'decimal', { from: iso(a.y, a.m, a.d), to: iso(b.y, b.m, b.d) }), sub: 'between' };
}
function shiftRow(r, render, k0, k1) {
  const w = r.int(0, 6), k = r.int(k0, k1);
  const name = WEEK[(w + k) % 7];
  return { prompt: render(WEEK[w], k), truth: name, gradeRule: { type: 'oneOf', accept: weekdayAccept(name), family: WEEKDAY_FAMILY }, args: { today: WEEK[w], k }, sub: 'shift' };
}
const CAL_T = [
  ['days-in-month.how-many-are-in', null, (r) => monthRow(r, (m, y) => `How many days are in ${m} ${y}?`)],
  ['days-in-month.does-have', null, (r) => monthRow(r, (m, y) => `How many days does ${m} have in ${y}?`)],
  ['days-in-month.tell-me-just-number', null, (r) => monthRow(r, (m, y) => `Tell me the number of days in ${m} of ${y}, just the number.`)],
  ['leap.is', null, (r) => leapRow(r, (y) => `Is ${y} a leap year?`)],
  ['leap.was-yes-or-no', null, (r) => leapRow(r, (y) => `Was ${y} a leap year? Answer yes or no.`)],
  ['leap.days-in-year', 'days-in-year', (r) => { const y = leapYear(r); return numRow(`How many days are in the year ${y}?`, Q(isLeap(y) ? 366 : 365), 'decimal', { y }); }],
  ['weekday.what-day-was', null, (r) => weekdayRow(r, (t) => `What day of the week was ${t.d} ${MONTHS[t.m - 1]} ${t.y}?`, 1600, 2025)],
  ['weekday.iso', null, (r) => weekdayRow(r, (t) => `What weekday is ${iso(t.y, t.m, t.d)}?`, 1600, 2400)],
  ['weekday.did-fall-on', null, (r) => weekdayRow(r, (t) => `On what day of the week did ${MONTHS[t.m - 1]} ${t.d}, ${t.y} fall?`, 1600, 2025)],
  ['weekday.tell-me', null, (r) => weekdayRow(r, (t) => `Tell me the weekday of ${MONTHS[t.m - 1]} ${t.d}, ${t.y}.`, 1600, 2400)],
  ['between.from-to', null, (r) => betweenRow(r, (a, b) => `How many days are there from ${MONTHS[a.m - 1]} ${a.d}, ${a.y} to ${MONTHS[b.m - 1]} ${b.d}, ${b.y}?`)],
  ['between.iso', null, (r) => betweenRow(r, (a, b) => `How many days from ${iso(a.y, a.m, a.d)} to ${iso(b.y, b.m, b.d)}?`)],
  ['between.days-after', null, (r) => betweenRow(r, (a, b) => `How many days after ${a.d} ${MONTHS[a.m - 1]} ${a.y} is ${b.d} ${MONTHS[b.m - 1]} ${b.y}?`)],
  ['shift.today-is', null, (r) => shiftRow(r, (w, k) => `If today is ${w}, what day will it be in ${k} days?`, 2, 100)],
  ['shift.days-after', null, (r) => shiftRow(r, (w, k) => `What day comes ${k} days after ${w}?`, 2, 100)],
  ['shift.day-after', null, (r) => shiftRow(r, (w) => `What day comes after ${w}?`, 1, 1)],
];

// ---------------------------------------------------------------- counting
const countIn = (w, c) => { let n = 0; for (const ch of w) if (ch === c) n++; return n; };
const vowelsIn = (w) => { let n = 0; for (const ch of w) if (VOWELS.includes(ch)) n++; return n; };
function sentence(r) {
  const n = r.int(4, 12), out = [];
  for (let i = 0; i < n; i++) out.push(r.pick(SENTENCE_WORDS));
  out[0] = cap(out[0]);
  return { s: out.join(' '), n };
}
function occurRow(r, render) {
  const w = r.pick(WORDS);
  const c = r.chance(0.8) ? w[r.int(0, w.length - 1)] : r.pick('abcdefghijklmnopqrstuvwxyz'.split(''));
  return { ...numRow(render(c, w), Q(countIn(w, c)), 'decimal', { word: w, letter: c }), sub: 'occurrences' };
}
const COUNT_T = [
  ['letters.how-many-in-the-word', 'letters', (r) => { const w = r.pick(WORDS); return numRow(`How many letters are in the word '${w}'?`, Q(w.length), 'decimal', { word: w }); }],
  ['letters.does-have', 'letters', (r) => { const w = r.pick(WORDS); return numRow(`How many letters does '${w}' have?`, Q(w.length), 'decimal', { word: w }); }],
  ['letters.count-imperative', 'letters', (r) => { const w = r.pick(WORDS); return numRow(`Count the letters in "${w}".`, Q(w.length), 'decimal', { word: w }); }],
  ['vowels.how-many-in-the-word', 'vowels', (r) => { const w = r.pick(NO_Y_WORDS); return numRow(`How many vowels are in the word '${w}'?`, Q(vowelsIn(w)), 'decimal', { word: w }); }],
  ['vowels.count-just-number', 'vowels', (r) => { const w = r.pick(NO_Y_WORDS); return numRow(`Count the vowels in "${w}", just the number.`, Q(vowelsIn(w)), 'decimal', { word: w }); }],
  ['occurrences.times-does-appear', null, (r) => occurRow(r, (c, w) => `How many times does the letter ${c} appear in '${w}'?`)],
  ['occurrences.casual-how-many', null, (r) => occurRow(r, (c, w) => `how many ${c}'s are in ${w}`)],
  ['words.how-many-in-this-sentence', 'words', (r) => { const x = sentence(r); return numRow(`How many words are in this sentence: '${x.s}'?`, Q(x.n), 'decimal', { sentence: x.s }); }],
  ['words.count-the-words-in', 'words', (r) => { const x = sentence(r); return numRow(`Count the words in: "${x.s}"`, Q(x.n), 'decimal', { sentence: x.s }); }],
  ['words.tell-me-how-many', 'words', (r) => { const x = sentence(r); return numRow(`Tell me how many words the sentence "${x.s}" has.`, Q(x.n), 'decimal', { sentence: x.s }); }],
];

// ---------------------------------------------------------------- spelling
const reverse = (w) => { let s = ''; for (let i = w.length - 1; i >= 0; i--) s += w[i]; return s; };
function backRow(r, render) {
  const w = r.pick(WORDS), rev = reverse(w);
  return { prompt: render(w), truth: rev, gradeRule: { type: 'oneOf', accept: [rev, rev.split('').join('-'), rev.split('').join(' ')] }, args: { word: w }, sub: 'backwards' };
}
function nthRow(r, render, which) {
  const w = r.pick(WORDS.filter((x) => x.length >= 3));
  const n = which === 'first' ? 1 : which === 'last' ? w.length : which === 'word' ? r.int(2, Math.min(w.length, ORD_WORDS.length)) : r.int(2, w.length);
  const c = w[n - 1];
  return { prompt: render(w, n), truth: c, gradeRule: { type: 'oneOf', accept: [c] }, args: { word: w, n }, sub: 'nth-letter' };
}
const SPELL_T = [
  ['backwards.spell-the-word', null, (r) => backRow(r, (w) => `Spell the word '${w}' backwards.`)],
  ['backwards.spell-short', null, (r) => backRow(r, (w) => `Spell '${w}' backwards.`)],
  ['backwards.what-is-spelled-backwards', null, (r) => backRow(r, (w) => `What is '${w}' spelled backwards?`)],
  ['backwards.reverse-the-letters', null, (r) => backRow(r, (w) => `reverse the letters of ${w}`)],
  ['backwards.write-in-reverse-just-word', null, (r) => backRow(r, (w) => `Write "${w}" in reverse, just the word.`)],
  ['nth.first-letter', null, (r) => nthRow(r, (w) => `What is the first letter of the word '${w}'?`, 'first')],
  ['nth.ordinal-letter', null, (r) => nthRow(r, (w, n) => `What is the ${ordinal(n)} letter of '${w}'?`, 'any')],
  ['nth.which-letter-comes', null, (r) => nthRow(r, (w, n) => `Which letter comes ${ORD_WORDS[n - 1]} in '${w}'?`, 'word')],
  ['nth.last-letter', null, (r) => nthRow(r, (w) => `What's the last letter of "${w}"?`, 'last')],
  ['nth.tell-me-letter-number', null, (r) => nthRow(r, (w, n) => `Tell me letter number ${n} of the word '${w}'.`, 'any')],
];

// ---------------------------------------------------------------- comparison
/** Two or three distinct numbers of one shape, as {q, s}. */
function comparands(r, count) {
  const shape = r.pick(['int', 'decimal', 'fraction', 'mixed']);
  for (let tries = 0; tries < 200; tries++) {
    const out = [];
    if (shape === 'int') {
      const base = r.int(10, 99999);
      out.push(base);
      while (out.length < count) out.push(Math.max(1, base + r.int(-99, 99)));
      const xs = out.map((n) => ({ q: Q(n), s: String(n) }));
      if (distinct(xs)) return { shape, xs };
      continue;
    }
    if (shape === 'decimal') {
      // the trap: the same whole part, one or two decimal places, so a longer tail can be the smaller number
      const w = r.int(0, 20);
      const xs = [];
      while (xs.length < count) {
        const places = r.int(1, 2), scale = 10 ** places;
        const f = r.int(1, scale - 1);
        const q = qAdd(Q(w), Q(f, scale));
        xs.push({ q, s: qDecimal(q) });
      }
      if (distinct(xs)) return { shape, xs };
      continue;
    }
    if (shape === 'fraction') {
      const xs = [];
      while (xs.length < count) { const f = properFraction(r); xs.push(f); }
      if (distinct(xs)) return { shape, xs };
      continue;
    }
    const xs = [properFraction(r)];
    while (xs.length < count) { const n = r.int(1, 99); const q = Q(n, 100); xs.push({ q, s: qDecimal(q) }); }
    if (distinct(xs)) return { shape, xs };
  }
  throw new Error('no distinct comparands in 200 draws');
}
function distinct(xs) {
  for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) if (qEq(xs[i].q, xs[j].q) || xs[i].s === xs[j].s) return false;
  return true;
}
function choiceRow(r, render, direction, count = 2) {
  const c = comparands(r, count);
  let best = 0;
  for (let i = 1; i < c.xs.length; i++) if ((direction === 'max' ? qCmp(c.xs[i].q, c.xs[best].q) : qCmp(c.xs[best].q, c.xs[i].q)) > 0) best = i;
  const options = c.xs.map((x) => x.s);
  return { prompt: render(options), truth: options[best], gradeRule: { type: 'choice', options, answer: best, direction }, args: { options, shape: c.shape }, sub: c.shape };
}
function yesnoCompare(r, render, relation) {
  const c = comparands(r, 2);
  const [a, b] = c.xs;
  const holds = relation === 'greater' ? qCmp(a.q, b.q) > 0 : qCmp(a.q, b.q) < 0;
  const affirm = relation === 'greater' ? 'bigger' : 'less';
  return { prompt: render(a.s, b.s), truth: holds ? 'yes' : 'no', gradeRule: { type: 'yesno', value: holds ? 'yes' : 'no', affirm }, args: { options: [a.s, b.s], shape: c.shape, relation }, sub: c.shape };
}
const CMP_T = [
  ['which-is-larger', null, (r) => choiceRow(r, ([a, b]) => `Which is larger, ${a} or ${b}?`, 'max')],
  ['which-is-bigger-colon', null, (r) => choiceRow(r, ([a, b]) => `Which is bigger: ${a} or ${b}?`, 'max')],
  ['which-number-is-greater', null, (r) => choiceRow(r, ([a, b]) => `Which number is greater, ${a} or ${b}?`, 'max')],
  ['which-is-smaller', null, (r) => choiceRow(r, ([a, b]) => `Which is smaller, ${a} or ${b}?`, 'min')],
  ['whats-the-larger-just-number', null, (r) => choiceRow(r, ([a, b]) => `What's the larger of ${a} and ${b}? just the number`, 'max')],
  ['smallest-of-three', null, (r) => choiceRow(r, ([a, b, c]) => `Which is the smallest of ${a}, ${b} and ${c}?`, 'min', 3)],
  ['is-bigger-than', null, (r) => yesnoCompare(r, (a, b) => `Is ${a} bigger than ${b}?`, 'greater')],
  ['is-less-than-yes-or-no', null, (r) => yesnoCompare(r, (a, b) => `Is ${a} less than ${b}? Answer yes or no.`, 'less')],
];

// ---------------------------------------------------------------- probability
function binom(n, k) { let c = 1n; for (let i = 0; i < k; i++) c = (c * BigInt(n - i)) / BigInt(i + 1); return c; }
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19];
const DIE_SIDES = [4, 6, 8, 10, 12, 20];
const DIE_CLASSES = Object.freeze({
  'an even number': (f) => f % 2 === 0,
  'an odd number': (f) => f % 2 === 1,
  'a multiple of 3': (f) => f % 3 === 0,
  'a prime number': (f) => PRIMES.includes(f),
});
const probRow = (prompt, v, args, sub, extra = {}, prefer = 'fraction') => ({ ...numRow(prompt, v, prefer, args, extra), sub });
const PROB_T = [
  ['coin.one-flip-fraction', null, (r) => { const side = r.pick(['heads', 'tails']); return probRow(`If you flip a fair coin, what is the probability of ${side}? Give a fraction.`, Q(1, 2), { side }, 'coin'); }],
  ['coin.all-alike-fraction', null, (r) => {
    const n = r.int(2, 6), side = r.pick(['heads', 'tails']);
    return probRow(`${cap(NUM_WORDS[n])} fair coins are flipped. What is the probability they all land ${side}? Give a fraction.`, Q(1n, 2n ** BigInt(n)), { n, side }, 'coin');
  }],
  ['coin.exactly-k-heads', null, (r) => {
    const n = r.int(2, 6), k = r.int(0, n);
    return probRow(`If you flip ${n} fair coins, what's the chance of getting exactly ${k} heads?`, Q(binom(n, k), 2n ** BigInt(n)), { n, k }, 'coin');
  }],
  ['die.one-face', null, (r) => { const s = r.pick(DIE_SIDES), f = r.int(1, s); return probRow(`What is the probability of rolling a ${f} on a fair ${s}-sided die? Give a fraction.`, Q(1, s), { s, f }, 'die'); }],
  ['die.class-of-faces', null, (r) => {
    const s = r.pick(DIE_SIDES), cls = r.pick(Object.keys(DIE_CLASSES));
    let hit = 0; for (let f = 1; f <= s; f++) if (DIE_CLASSES[cls](f)) hit++;
    return probRow(`What is the probability of rolling ${cls} on a fair ${s}-sided die?`, Q(hit, s), { s, cls }, 'die');
  }],
  ['die.greater-than', null, (r) => { const s = r.pick(DIE_SIDES), k = r.int(1, s - 1); return probRow(`You roll a fair ${s}-sided die. What's the probability the number is greater than ${k}?`, Q(s - k, s), { s, k }, 'die'); }],
  ['dice.sum-of-two', null, (r) => { const S = r.int(2, 12); return probRow(`Two fair six-sided dice are rolled. What is the probability that the sum is ${S}?`, Q(6 - Math.abs(S - 7), 36), { S }, 'dice'); }],
  ['bag.lowest-terms', null, (r) => {
    const R = r.int(1, 20), B = r.int(1, 20);
    return probRow(`A bag has ${R} red ball${R === 1 ? '' : 's'} and ${B} blue ball${B === 1 ? '' : 's'}. What is the probability of drawing a red ball? Give a fraction in lowest terms.`, Q(R, R + B), { red: R, blue: B, color: 'red' }, 'bag', { lowest: true });
  }],
  ['bag.decimal', null, (r) => {
    const T = r.pick([2, 4, 5, 8, 10, 16, 20, 25, 40, 50]), R = r.int(1, T - 1), color = r.pick(['red', 'blue']);
    const v = Q(color === 'red' ? R : T - R, T);
    return probRow(`A bag has ${R} red ball${R === 1 ? '' : 's'} and ${T - R} blue ball${T - R === 1 ? '' : 's'}. What is the probability of drawing a ${color} ball? Give a decimal.`, v, { red: R, blue: T - R, color }, 'bag', {}, 'decimal');
  }],
  ['jar.three-colors', null, (r) => {
    const n = { red: r.int(1, 12), green: r.int(1, 12), blue: r.int(1, 12) }, color = r.pick(['red', 'green', 'blue']);
    return probRow(`A jar holds ${n.red} red, ${n.green} green and ${n.blue} blue marbles. If you pick one at random, what's the chance it's ${color}?`, Q(n[color], n.red + n.green + n.blue), { ...n, color }, 'jar');
  }],
  ['cards.multiple-of', null, (r) => {
    const N = r.int(10, 100), K = r.int(2, 12);
    return probRow(`Cards numbered 1 to ${N} are shuffled and one is drawn. What is the probability it is a multiple of ${K}?`, Q(Math.floor(N / K), N), { N, K }, 'cards');
  }],
  ['letters.letter-of-a-word', null, (r) => {
    const w = r.pick(WORDS), c = w[r.int(0, w.length - 1)];
    return probRow(`A letter is picked at random from the word '${w}'. What is the probability it is the letter ${c}?`, Q(countIn(w, c), w.length), { word: w, letter: c }, 'letters');
  }],
];

// ---------------------------------------------------------------- the templates
const BY_KIND = { arithmetic: ARITH_T, sequence: SEQ_T, units: UNIT_T, calendar: CAL_T, counting: COUNT_T, spelling: SPELL_T, comparison: CMP_T, probability: PROB_T };
/** Every template: {id, kind, sub, make}; id is kind.name. */
export const TEMPLATES = Object.freeze(KINDS.flatMap((kind) => BY_KIND[kind].map(([name, sub, make]) => Object.freeze({ id: kind + '.' + name, kind, sub, make }))));
export const TEMPLATE_IDS = Object.freeze(TEMPLATES.map((t) => t.id));
const TEMPLATES_OF = Object.fromEntries(KINDS.map((k) => [k, TEMPLATES.filter((t) => t.kind === k)]));

/** Row index of seed: kind by index mod 8, the template and the numbers from the row's own generator. */
export function rowAt(seed, index) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xFFFFFFFF) throw new RangeError('seed must be an integer in [0, 2^32)');
  if (!Number.isInteger(index) || index < 0) throw new RangeError('index must be a non-negative integer');
  const kind = KINDS[index % KINDS.length];
  const r = rng(rowSeed(seed, index));
  const t = r.pick(TEMPLATES_OF[kind]);
  const made = t.make(r);
  return {
    seed, index, id: 'q' + seed + '-' + index, kind, template: t.id, sub: made.sub || t.sub || null,
    prompt: made.prompt, truth: made.truth, gradeRule: made.gradeRule, args: made.args,
  };
}
/** n rows from index start at seed. */
export function generate({ seed, n, start = 0 } = {}) {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('n must be a non-negative integer');
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = rowAt(seed, start + i);
  return out;
}

// ---------------------------------------------------------------- the reader of an answer
const ALNUM = /[\p{L}\p{N}]/u;
/** The answer's last meaningful line (a letter or a digit on it), trimmed, markdown and quotes stripped. */
export function lastLine(text) {
  const ls = String(text ?? '').split(/\r?\n/).map((s) => s.trim()).filter((s) => ALNUM.test(s));
  return ls.length ? ls[ls.length - 1].replace(/[*_`]/g, '').trim() : '';
}
/** Is this text a refusal: empty, or starting with a refusal head. */
export function isRefusal(text, heads = REFUSAL_HEADS) {
  const t = String(text ?? '').trim();
  if (!t) return true;
  return heads.some((h) => t.startsWith(h));
}
const NUM_RE = /-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:\s*\/\s*-?\d+(?:\.\d+)?)?|-?\.\d+/g;
/** Every number on a line with its position and value (a fraction whole, a mixed number "7 3/4" whole). */
export function numbersOn(line) {
  const s = String(line ?? '').replace(/−/g, '-');
  const out = [];
  for (const m of s.matchAll(NUM_RE)) {
    const v = qParse(m[0]);
    if (!v) continue;
    out.push({ at: m.index, end: m.index + m[0].length, text: m[0], value: v });
  }
  // a mixed number: an integer, a space, then a proper fraction with no sign
  const merged = [];
  for (const x of out) {
    const prev = merged[merged.length - 1];
    if (prev && /^-?\d+$/.test(prev.text) && /^\d+\s*\/\s*\d+$/.test(x.text) && /^\s+$/.test(s.slice(prev.end, x.at)) && x.value.n < x.value.d) {
      const whole = qParse(prev.text);
      const v = whole.n < 0n ? qSub(whole, x.value) : qAdd(whole, x.value);
      merged[merged.length - 1] = { at: prev.at, end: x.end, text: s.slice(prev.at, x.end), value: v, mixed: true };
      continue;
    }
    merged.push(x);
  }
  return merged;
}
const stripEdges = (s) => String(s ?? '').replace(/^[\s'"‘’“”(\[]+|[\s'"‘’“”)\].,!?;:]+$/g, '');
const words = (s) => String(s ?? '').toLowerCase().split(/[^\p{L}\p{N}'’-]+/u).map((w) => stripEdges(w)).filter(Boolean);
const MAX_WORDS = /\b(larger|largest|bigger|biggest|greater|greatest|more|higher|highest|heavier|longer)\b/i;
const MIN_WORDS = /\b(smaller|smallest|less|lesser|least|lower|lowest|fewer|lighter|shorter)\b/i;
const YES = new Set(['yes', 'yeah', 'yep', 'true', 'correct', 'indeed']);
const NO = new Set(['no', 'nope', 'false', 'incorrect']);
const NEGATION = /\b(not|no|never)\b|n['’]t\b/i;

/** The rational rule on a line: the last number (after the last colon when that part holds one). */
function readRational(line, rule) {
  const colon = line.lastIndexOf(':');
  let seg = line;
  if (colon >= 0 && /\d/.test(line.slice(colon + 1))) seg = line.slice(colon + 1);
  const nums = numbersOn(seg);
  if (!nums.length) return { ok: false, why: 'no number on the last line' };
  const last = nums[nums.length - 1];
  const want = qParse(rule.value);
  if (!qEq(last.value, want)) return { ok: false, why: 'last number ' + last.text + ' is not ' + rule.value, read: last.text };
  if (rule.lowest && /\//.test(last.text) && !last.mixed) {
    const [p, q] = last.text.replace(/\s+/g, '').split('/');
    if (!/^-?\d+$/.test(p) || !/^\d+$/.test(q) || gcdB(BigInt(p), BigInt(q)) !== 1n) return { ok: false, why: 'the fraction ' + last.text + ' is not in lowest terms', read: last.text };
  }
  return { ok: true, read: last.text };
}
/** The choice rule: which option the line names. */
function readChoice(line, rule) {
  const colon = line.lastIndexOf(':');
  let seg = line;
  const opts = rule.options.map((o) => qParse(o));
  const namesOption = (s) => numbersOn(s).some((x) => opts.some((o) => o && qEq(o, x.value)));
  if (colon >= 0 && namesOption(line.slice(colon + 1))) seg = line.slice(colon + 1);
  const hits = [];
  for (const x of numbersOn(seg)) { const i = opts.findIndex((o) => o && qEq(o, x.value)); if (i >= 0) hits.push({ i, at: x.at, end: x.end }); }
  if (!hits.length) return { ok: false, why: 'no option named on the last line' };
  const named = new Set(hits.map((h) => h.i));
  if (named.size === 1) { const i = hits[0].i; return i === rule.answer ? { ok: true, read: rule.options[i] } : { ok: false, why: 'named ' + rule.options[i], read: rule.options[i] }; }
  const asked = rule.direction === 'max' ? MAX_WORDS : MIN_WORDS;
  const other = rule.direction === 'max' ? MIN_WORDS : MAX_WORDS;
  const first = hits[0], second = hits.find((h) => h.i !== first.i);
  const between = seg.slice(first.end, second.at);
  // a relation between two options settles the question only when there are two options and the line names only them
  const pair = rule.options.length === 2 && named.size === 2 && hits.length === 2;
  if (pair && first.i === rule.answer && asked.test(between) && !other.test(between)) return { ok: true, read: rule.options[first.i] };
  if (pair && second.i === rule.answer && other.test(between) && !asked.test(between)) return { ok: true, read: rule.options[second.i] };
  // a restatement: the options listed, then the asked word and the answer again ("of 0.7 and 0.65, the larger is 0.7")
  const last = hits[hits.length - 1];
  const prevEnd = hits[hits.length - 2].end;
  const lead = seg.slice(prevEnd, last.at);
  if (hits.length > named.size && last.i === rule.answer && asked.test(lead) && !other.test(lead)) return { ok: true, read: rule.options[last.i] };
  return { ok: false, why: 'names ' + named.size + ' options and the comparative does not single out ' + rule.options[rule.answer] };
}
function readYesNo(line, rule) {
  const ws = words(line);
  const hasYes = ws.some((w) => YES.has(w));
  const hasNo = ws.some((w) => NO.has(w)) || NEGATION.test(line);
  let said = null;
  if (ws.length && YES.has(ws[0])) said = 'yes';
  else if (ws.length && NO.has(ws[0])) said = 'no';
  else if (hasYes && !hasNo) said = 'yes';
  else if (hasNo && !hasYes) said = 'no';
  else if (!hasYes && !hasNo && rule.affirm && line.toLowerCase().includes(String(rule.affirm).toLowerCase())) said = 'yes';
  if (said === null) return { ok: false, why: hasYes && hasNo ? 'both a yes and a no on the last line' : 'no yes, no, negation or affirmation on the last line' };
  return said === rule.value ? { ok: true, read: said } : { ok: false, why: 'said ' + said, read: said };
}
function readOneOf(line, rule) {
  const accept = rule.accept.map((a) => String(a).toLowerCase());
  if (rule.family) {
    const ws = words(line);
    const named = [...new Set(ws.filter((w) => rule.family.includes(w)))];
    if (!named.length) return { ok: false, why: 'names none of the accepted family' };
    return named.every((w) => accept.includes(w)) ? { ok: true, read: named.join(',') } : { ok: false, why: 'names ' + named.join(','), read: named.join(',') };
  }
  const cand = stripEdges(line.toLowerCase().replace(/[*_`]/g, '').trim());
  if (accept.includes(cand)) return { ok: true, read: cand };
  const toks = cand.split(/\s+/).map(stripEdges).filter(Boolean);
  const lastTok = toks[toks.length - 1] || '';
  if (accept.includes(lastTok)) return { ok: true, read: lastTok };
  return { ok: false, why: 'the last line is neither an accepted spelling nor ends in one', read: lastTok };
}
/**
 * One answer graded by its row's rule: {state: 'correct' | 'wrong' | 'refused', candidate, read, why}.
 * @param {string} text the whole answer
 * @param {object} rule the row's gradeRule
 * @param {object} [opts] { refusal: (text) => boolean } (default isRefusal on REFUSAL_HEADS)
 */
export function grade(text, rule, opts = {}) {
  const refusal = typeof opts.refusal === 'function' ? opts.refusal : (t) => isRefusal(t);
  if (refusal(text) || !String(text ?? '').trim()) return { state: 'refused', candidate: '', read: null, why: 'a refusal' };
  const line = lastLine(text);
  if (!line) return { state: 'wrong', candidate: '', read: null, why: 'no meaningful line' };
  let r;
  switch (rule && rule.type) {
    case 'rational': r = readRational(line, rule); break;
    case 'choice': r = readChoice(line, rule); break;
    case 'yesno': r = readYesNo(line, rule); break;
    case 'oneOf': r = readOneOf(line, rule); break;
    default: throw new Error('unknown grade rule ' + (rule && rule.type));
  }
  return { state: r.ok ? 'correct' : 'wrong', candidate: line, read: r.read ?? null, why: r.ok ? null : r.why };
}

// ---------------------------------------------------------------- the controls
/** The truth as an answer, in one of three styles: 0 the bare truth, 1 a sentence, 2 the organism's shape (steps, then the answer alone). */
export function oracleText(row, style = 0) {
  const t = row.gradeRule.type === 'yesno' ? cap(row.gradeRule.value) : row.gradeRule.type === 'oneOf' ? (row.gradeRule.family ? cap(row.gradeRule.accept[0]) : row.gradeRule.accept[0]) : row.truth;
  if (style === 1) return 'The answer is ' + t + '.';
  if (style === 2) return 'answered by the oracle control, with no model and no network.\n- read "' + row.prompt.replace(/\n/g, ' ') + '"\n- the truth stated by self/queries.mjs\n' + t;
  return t;
}
/** A nearby wrong answer: a rational plus one, the other option, the other polarity, the next weekday, a changed spelling. */
export function perturbedText(row) {
  const g = row.gradeRule;
  if (g.type === 'rational') return qShow(qAdd(qParse(g.value), Q(1)), 'decimal');
  if (g.type === 'choice') return g.options[(g.answer + 1) % g.options.length];
  if (g.type === 'yesno') return g.value === 'yes' ? 'No' : 'Yes';
  if (g.family) { const i = WEEK.findIndex((d) => d.toLowerCase() === g.accept[0]); return WEEK[(i + 1) % 7]; }
  const a = g.accept[0];
  if (a.length === 1) return a === 'z' ? 'a' : String.fromCharCode(a.charCodeAt(0) + 1);
  const swapped = a[1] + a[0] + a.slice(2);
  return swapped !== a ? swapped : a + 'x';
}
