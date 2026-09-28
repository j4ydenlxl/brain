// act/exact-kinds.mjs: NINE KINDS OF QUESTION, ANSWERED EXACTLY OR NOT AT ALL.
//
// Board 34, item exact-kinds. bench/verdicts/conceive.json (at 2026-09-28T12:18:03.618Z) printed the organism
// native 0 on units, sequence, counting, spelling, calendar, comparison, probability, geometry and logic, 58
// census rows, while the model arm answered most of them. Every one of those kinds holds questions a reader can
// answer completely with no model: a unit table, a weekday formula, a count of letters, an enumeration of the
// outcomes of a die. This file is those readers.
//
// THE CONTRACT, the same one act/solve.mjs keeps:
//
//   exactKinds(text) returns { answer, method: 'exact.<kind>', steps } when ONE rule below read EVERY word of the
//   text, and null otherwise. A text read in part is null: a partial reading that answers arrives wearing the
//   provenance 'exact', and a wrong exact answer is worse than a refusal.
//
//   Every printed number is a BigInt rational from tasks/exact.mjs: no float is ever printed, and a value that is
//   not exact in the form asked for (a decimal that does not terminate, an irrational side) is a refusal.
//
//   No model, no file, no network, no environment variable, no evaluation of the text. A prompt is text and it
//   stays text.
//
// What each reader refuses on purpose (the refusals are the rules, not gaps):
//   units        a unit whose size depends on where you are (a gallon, a ton, a cup), weeks in a year, a mixed
//                dimension, any word the frame does not read
//   sequence     fewer than four terms, a hypothesis verified by fewer than two terms beyond its own parameters,
//                and any disagreement between the hypotheses that survive (1, 2, 4 could go on 7 or 8)
//   counting     vowels or consonants in a word with a y, words with a hyphen, a sentence that is not quoted,
//                legs, wheels and anything else that needs knowledge of the world
//   spelling     a word that is not quoted (or not "the word X" alone), "capitalize X" (all or first?), a number
//                over 99 that is not round (with or without "and" is a dialect)
//   calendar     a date before 1753 (Britain changed calendars in 1752; before it a date names two days), the
//                days in February without a year, holidays, the first day of the week
//   comparison   anything that is not a number or a quantity in the unit table (the Sun and the Moon, sound and
//                light), two quantities of different dimensions, an order with a tie of different spellings
//   probability  a coin or die not said to be fair, "odds", two draws without saying whether they are replaced
//   geometry     an irrational length (a diagonal of a square), a shape the table does not hold
//   logic        a conclusion that does not follow either way ("unknown" is not yes or no), a contradiction,
//                an odd one out (there is always a reason for another one)
//
// solve() in act/solve.mjs calls exactKinds after every older reader has returned null, so no answer those
// readers gave before this file existed can move. See notes/exact-kinds.md.

import * as E from '../tasks/exact.mjs';

export const KINDS = Object.freeze(['units', 'sequence', 'counting', 'spelling', 'calendar', 'comparison', 'probability', 'geometry', 'logic']);
export const KIND_METHODS = Object.freeze(KINDS.map((k) => 'exact.' + k));
export const KIND_CAPS = Object.freeze({
  chars: 1000,          // the longest text any reader looks at
  listItems: 64,        // the most items a list may hold
  sequenceIndex: 10000, // the furthest term a sequence question may ask for
  geometricIndex: 512,  // the furthest term of a geometric sequence (the exponent cap of act/exact-read.mjs)
  coins: 20,            // the most coins one experiment may toss
  sides: 100,           // the most sides one die may have
  stringChars: 200,     // the longest quoted text a counting or spelling rule reads
  yearMin: 1753,        // the first year every reader of a date agrees on (the British change of September 1752)
  yearMax: 9999,
});

const out = (kind, answer, steps) => ({ answer: String(answer), method: 'exact.' + kind, steps });

// ---------------------------------------------------------------- shared text
function tidy(text) {
  return String(text ?? '')
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/−/g, '-')
    .replace(/…/g, '...')
    .replace(/[ \t\r\n]+/g, ' ')
    .replace(/ {2,}/g, ' ')
    .trim();
}
const bare = (s) => String(s).replace(/\s*[?.!]+\s*$/, '').trim();
// a sentence ends at . ? or ! followed by a space; a decimal point has no space after it
const sentencesOf = (t) => t.split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter(Boolean);
const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// A quoted operand is masked as §<index> so a frame can name it without reading inside it. A quote opens
// after a start, a space, a colon, a comma or a bracket and closes before an end, a space or punctuation, so the
// apostrophe of "o's" or "New Year's" is never a quote.
const QMARK = '§';
function maskQuotes(t) {
  const quotes = [];
  const masked = t.replace(/(^|[\s:(,])(['"])([^'"]+)\2(?=$|[\s?.!,;:)])/g, (m, pre, q, body) => { quotes.push(body); return pre + QMARK + (quotes.length - 1); });
  return { masked, quotes };
}

// ---------------------------------------------------------------- shared numbers
const SMALL = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const WORD_NUM = new Map();
SMALL.forEach((w, i) => WORD_NUM.set(w, i));
TENS.forEach((w, i) => { if (!w) return; WORD_NUM.set(w, i * 10); for (let j = 1; j < 10; j++) WORD_NUM.set(w + '-' + SMALL[j], i * 10 + j); });
const DIGITS_RE = /^-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/;

/** A number as written (digits with or without thousands commas, a decimal, a/b, or a word to ninety-nine) as an exact rational, or null. */
function numQ(s) {
  const w = String(s).trim().toLowerCase();
  if (DIGITS_RE.test(w)) return E.qFromString(w.replace(/,/g, ''));
  const m = /^(-?\d+)\/(\d+)$/.exec(w);
  if (m) return /^0+$/.test(m[2]) ? null : E.qDiv(E.qFromString(m[1]), E.qFromString(m[2]));
  if (WORD_NUM.has(w)) return E.Q(BigInt(WORD_NUM.get(w)));
  return null;
}
/** A whole count: digits, a word, a / an / one / once / twice. */
function countOf(s) {
  const w = String(s).trim().toLowerCase();
  if (w === 'a' || w === 'an' || w === 'once') return 1n;
  if (w === 'twice') return 2n;
  const q = numQ(w);
  return q && q.d === 1n && q.n >= 0n ? q.n : null;
}
function fmtNum(q) { if (q.d === 1n) return q.n.toString(); const d = E.qToDecimal(q); return d === null ? E.qToString(q) : d; }
const qInt = (n) => E.Q(BigInt(n));

function isqrt(n) { if (n < 0n) return null; if (n < 2n) return n; let x = n, y = (x + 1n) >> 1n; while (y < x) { x = y; y = (x + n / x) >> 1n; } return x; }
function iroot(n, k) { if (n < 0n) return null; let lo = 0n, hi = 1n; while (hi ** k <= n) hi *= 2n; while (lo < hi) { const mid = (lo + hi + 1n) >> 1n; if (mid ** k <= n) lo = mid; else hi = mid - 1n; } return lo; }
function sqrtQ(q) { if (q.n < 0n) return null; const a = isqrt(q.n), b = isqrt(q.d); return a * a === q.n && b * b === q.d ? E.Q(a, b) : null; }

const ORD_WORDS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
/** An ordinal (first, 3rd, 12th) as a number; the suffix has to be the right one. */
function ordN(s) {
  const w = String(s).toLowerCase();
  const i = ORD_WORDS.indexOf(w);
  if (i >= 0) return i + 1;
  const m = /^(\d+)(st|nd|rd|th)$/.exec(w);
  if (!m) return null;
  const n = Number(m[1]);
  if (!(n >= 1 && n <= KIND_CAPS.sequenceIndex)) return null;
  const suf = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
  return suf === m[2] ? n : null;
}
const ORD_SRC = '(?:' + ORD_WORDS.join('|') + '|\\d+(?:st|nd|rd|th))';

/** "a, b, c and d", "a, b, and c", "a, b, c": the items, or null for an empty one or too many. */
function splitList(s) {
  const parts = String(s).split(/\s*,\s*(?:and\s+)?|\s+and\s+/).map((x) => x.trim());
  if (parts.length < 2 || parts.length > KIND_CAPS.listItems || parts.some((p) => !p)) return null;
  return parts;
}

// ================================================================ UNITS
// Every factor is exact by definition: the inch is 2.54 cm (1959), the pound 0.45359237 kg, the ounce a
// sixteenth of it, the mile 5280 feet. Units whose size depends on the country (gallon, pint, cup, ton, fluid
// ounce) are not in the table, so a question about them has a word no rule reads and is null.
const UNIT = new Map();
function defUnit(id, dim, factor, names) { const u = { id, dim, f: factor === null ? null : E.qFromString(factor), name: names[0] }; for (const n of names) UNIT.set(n, u); }
defUnit('mm', 'length', '0.001', ['millimetre', 'millimetres', 'millimeter', 'millimeters', 'mm']);
defUnit('cm', 'length', '0.01', ['centimetre', 'centimetres', 'centimeter', 'centimeters', 'cm']);
defUnit('m', 'length', '1', ['metre', 'metres', 'meter', 'meters', 'm']);
defUnit('km', 'length', '1000', ['kilometre', 'kilometres', 'kilometer', 'kilometers', 'km']);
defUnit('in', 'length', '0.0254', ['inch', 'inches']);
defUnit('ft', 'length', '0.3048', ['foot', 'feet', 'ft']);
defUnit('yd', 'length', '0.9144', ['yard', 'yards', 'yd', 'yds']);
defUnit('mi', 'length', '1609.344', ['mile', 'miles']);
defUnit('mg', 'mass', '0.001', ['milligram', 'milligrams', 'mg']);
defUnit('g', 'mass', '1', ['gram', 'grams', 'g']);
defUnit('kg', 'mass', '1000', ['kilogram', 'kilograms', 'kg', 'kilo', 'kilos']);
defUnit('t', 'mass', '1000000', ['tonne', 'tonnes', 'metric ton', 'metric tons']);
defUnit('oz', 'mass', '28.349523125', ['ounce', 'ounces', 'oz']);
defUnit('lb', 'mass', '453.59237', ['pound', 'pounds', 'lb', 'lbs']);
defUnit('ml', 'volume', '1', ['millilitre', 'millilitres', 'milliliter', 'milliliters', 'ml']);
defUnit('cl', 'volume', '10', ['centilitre', 'centilitres', 'centiliter', 'centiliters', 'cl']);
defUnit('l', 'volume', '1000', ['litre', 'litres', 'liter', 'liters', 'l']);
defUnit('ms', 'time', '0.001', ['millisecond', 'milliseconds', 'ms']);
defUnit('s', 'time', '1', ['second', 'seconds', 'sec', 'secs', 's']);
defUnit('min', 'time', '60', ['minute', 'minutes', 'min', 'mins']);
defUnit('h', 'time', '3600', ['hour', 'hours', 'hr', 'hrs', 'h']);
defUnit('d', 'time', '86400', ['day', 'days']);
defUnit('wk', 'time', '604800', ['week', 'weeks']);
defUnit('fn', 'time', '1209600', ['fortnight', 'fortnights']);
// months and years are their own dimension: a year is 12 months exactly, and never a whole number of days or weeks
defUnit('mo', 'months', '1', ['month', 'months']);
defUnit('yr', 'months', '12', ['year', 'years']);
defUnit('dec', 'months', '120', ['decade', 'decades']);
defUnit('cen', 'months', '1200', ['century', 'centuries']);
defUnit('mil', 'months', '12000', ['millennium', 'millennia']);
defUnit('C', 'temp', null, ['degrees celsius', 'degree celsius', 'celsius', '°c', 'degrees c', 'degrees centigrade', 'centigrade']);
defUnit('F', 'temp', null, ['degrees fahrenheit', 'degree fahrenheit', 'fahrenheit', '°f', 'degrees f']);
defUnit('K', 'temp', null, ['kelvin', 'kelvins', 'degrees kelvin']);
const unitOf = (s) => UNIT.get(String(s).toLowerCase().replace(/\s+/g, ' ').replace(/° /g, '°').trim()) || null;

const KELVIN = E.qFromString('273.15'), THIRTY_TWO = qInt(32);
const toC = (id, v) => (id === 'C' ? v : id === 'F' ? E.qMul(E.qSub(v, THIRTY_TWO), E.Q(5n, 9n)) : E.qSub(v, KELVIN));
const fromC = (id, c) => (id === 'C' ? c : id === 'F' ? E.qAdd(E.qMul(c, E.Q(9n, 5n)), THIRTY_TWO) : E.qAdd(c, KELVIN));

/** "3.5 meters", "one week", "3 hours and 15 minutes", "25 °C": { dim, value (base units, or Celsius) } or null. */
function parseQty(s) {
  const src = String(s).trim().toLowerCase();
  const parts = src.split(/\s*,\s+(?:and\s+)?|\s+and\s+/);
  if (parts.length > 4) return null;
  let base = E.Q0, dim = null;
  for (const p of parts) {
    const m = /^(-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|\d+\/\d+|[a-z]+(?:-[a-z]+)?)\s*(\S.*)$/.exec(p);
    if (!m) return null;
    const n = m[1] === 'a' || m[1] === 'an' ? E.Q1 : numQ(m[1]);
    const u = unitOf(m[2]);
    if (!n || !u) return null;
    if (u.dim === 'temp') return parts.length === 1 ? { dim: 'temp', unit: u, value: toC(u.id, n) } : null;
    if (n.n < 0n || (dim && dim !== u.dim)) return null;
    dim = u.dim;
    base = E.qAdd(base, E.qMul(n, u.f));
  }
  return { dim, value: base };
}
function convertTo(q, target) {
  const u = unitOf(target);
  if (!u) return null;
  if (q.dim === 'temp') return u.dim === 'temp' ? { v: fromC(u.id, q.value), u } : null;
  return u.dim === q.dim ? { v: E.qDiv(q.value, u.f), u } : null;
}

const UNIT_WORD = '[a-z°][a-z° ]*?';
const UNIT_FRAMES = [
  new RegExp('^how many (?<u>' + UNIT_WORD + ') (?:are|are there|is|is there|go|fit) in(?:to)? (?<q>.+)$', 'i'),
  new RegExp('^how many (?<u>' + UNIT_WORD + ') (?:make up|make|equal|are equal to|is equal to) (?<q>.+)$', 'i'),
  new RegExp('^(?:convert|change|turn) (?<q>.+?) (?:in)?to (?<u>' + UNIT_WORD + ')$', 'i'),
  new RegExp('^express (?<q>.+?) in (?<u>' + UNIT_WORD + ')$', 'i'),
  new RegExp('^(?:what is|what\'s|how much is) (?<q>.+?) (?:in|into|converted to|converted into|expressed in) (?<u>' + UNIT_WORD + ')$', 'i'),
  new RegExp('^(?<q>.+?) (?:equals|is equal to|is|equal|makes) how many (?<u>' + UNIT_WORD + ')$', 'i'),
  // board 35 (readers-2), added: "Tell me how many milliliters there are in 788 centiliters.", "How many minutes does an hour have?"
  new RegExp('^(?:tell me|can you tell me|do you know|say) how many (?<u>' + UNIT_WORD + ') (?:there are|there is|are there|are|is) in(?:to)? (?<q>.+)$', 'i'),
  new RegExp('^how many (?<u>' + UNIT_WORD + ') (?:does|do) (?<q>.+?) (?:have|contain|hold)$', 'i'),
];
const THERE_ARE_RE = new RegExp('^there (?:are|is) (?<n>\\S+) (?<a>' + UNIT_WORD + ') in (?:a|an|one|1) (?<b>' + UNIT_WORD + ')$', 'i');
const THING_IS_RE = /^(?:a|an|the) [a-z]+(?: [a-z]+){0,2} is (?<q>.+?)(?: (?:long|tall|wide|high|deep|away|heavy|in length|in height))?$/i;
const HOW_MANY_THAT_RE = new RegExp('^how many (?<u>' + UNIT_WORD + ') is (?:that|it)$', 'i');

function readUnits(t) {
  if (!/\b(?:how many|convert|change|turn|express|what is|what's|how much|equals?|makes?|is)\b/i.test(t)) return null;
  const ss = sentencesOf(t).map(bare);
  if (!ss.length || ss.length > 3) return null;
  const steps = [];
  let ctx = null;
  for (const s of ss.slice(0, -1)) {
    let m = THERE_ARE_RE.exec(s);
    if (m) {
      const n = numQ(m.groups.n), a = unitOf(m.groups.a), b = unitOf(m.groups.b);
      if (!n || !a || !b || a.dim !== b.dim || a.dim === 'temp' || !E.qEq(n, E.qDiv(b.f, a.f))) return null;
      steps.push('the given fact "' + s + '" agrees with the unit table');
      continue;
    }
    m = THING_IS_RE.exec(s);
    if (m && !ctx) { const q = parseQty(m.groups.q); if (!q) return null; ctx = q; steps.push('read the quantity "' + m.groups.q + '"'); continue; }
    return null;
  }
  const last = ss[ss.length - 1];
  const tries = [];
  if (ctx) { const m = HOW_MANY_THAT_RE.exec(last); if (m) tries.push([ctx, m.groups.u, last]); }
  else for (const re of UNIT_FRAMES) { const m = re.exec(last); if (m) { const q = parseQty(m.groups.q); if (q) tries.push([q, m.groups.u, m.groups.q]); } }
  let got = null;
  for (const [q, target, said] of tries) {
    const c = convertTo(q, target);
    if (!c) continue;
    const ans = fmtNum(c.v);
    if (got && got.ans !== ans) return null;
    if (!got) got = { ans, said, target: c.u.name, dim: q.dim };
  }
  if (!got) return null;
  steps.push('read "' + got.said + '" as one ' + (got.dim === 'temp' ? 'temperature' : got.dim + ' quantity') + ' and converted it to ' + got.target + ' with exact factors (' + (got.dim === 'temp' ? 'F = C x 9/5 + 32, K = C + 273.15' : 'the unit table, every factor exact by definition') + ')');
  return out('units', got.ans, steps);
}

// ================================================================ SEQUENCE
const SEQ_NUM = '-?\\d+(?:\\.\\d+)?(?:/\\d+)?';
const SEQ_LIST_RE = new RegExp('(' + SEQ_NUM + '(?:\\s*,\\s*' + SEQ_NUM + '){2,})(\\s*,?\\s*(?:\\.\\.\\.|_+|\\?))?', 'g');
const LETTER_LIST_RE = /(?<![A-Za-z'§])([A-Za-z](?:\s*,\s*[A-Za-z]){2,})(?![A-Za-z'])(\s*,?\s*(?:\.\.\.|_+|\?))?/g;
const SW = '(?:number|term|value|element|item|one|letter|figure)';
const SS = '(?:sequence|pattern|series|progression|list)';
const NEXT_FRAMES = [
  new RegExp('^(?:what is|what\'s|find|give|name|state|determine|work out) the next(?: ' + SW + ')?(?: (?:in|of|for)(?: the| this)?(?: ' + SS + ')?)?:? L$'),
  new RegExp('^(?:what|which)(?: ' + SW + ')? comes next(?: in (?:the |this )?' + SS + ')?:? L$'),
  new RegExp('^next(?: ' + SW + ')? in (?:the |this )?' + SS + ':? L$'),
  new RegExp('^continue (?:the |this )?' + SS + ':? L\\.? (?:what is|what comes|what\'s) next$'),
  new RegExp('^L(?: \\.\\.\\.)?[,:.]? (?:what is the next(?: ' + SW + ')?|what(?: ' + SW + ')? comes next|what is next|what\'s next)$'),
  new RegExp('^(?:which|what) ' + SW + ' (?:follows|comes after) L$'),
  new RegExp('^(?:complete|finish|continue) (?:the |this )?' + SS + ':? L$'),
  // board 35 (readers-2), added: "Tell me the number that follows 3, 4, 7, 11, 18, 29."
  new RegExp('^(?:tell me|give me|find|name|state) the ' + SW + ' (?:that )?(?:follows|comes after|comes next in) L$'),
];
const SEQ_NTH_RE = new RegExp('^what is the (?<o>' + ORD_SRC + ')(?: ' + SW + ')? (?:of|in) (?:the |this )?' + SS + ':? L$');
const SEQ_AFTER_RE = new RegExp('^what comes (?:next )?after (?<x>' + SEQ_NUM + ') in (?:the |this )?' + SS + ':? L$');

const qdiff = (a) => a.slice(1).map((x, i) => E.qSub(x, a[i]));
const allEq = (a) => a.length > 0 && a.every((x) => E.qEq(x, a[0]));
/** Newton's forward difference formula: the value at index i of the polynomial of degree k through the terms. */
function newtonAt(ts, k, i) {
  let row = ts, sum = E.Q0, c = 1n;
  for (let j = 0; j <= k; j++) {
    sum = E.qAdd(sum, E.qMul(E.Q(c), row[0]));
    c = (c * BigInt(i - j)) / BigInt(j + 1);
    row = qdiff(row);
  }
  return sum;
}
/**
 * Every rule that reproduces the terms, each with the number of terms it was checked on BEYOND the ones that
 * fixed its own parameters. A rule is admitted only with two such checks, and an answer only when every admitted
 * rule gives it: 1, 2, 4, 8 is geometric and only geometric (a quadratic through it has one check), 1, 4, 9, 16,
 * 25 is quadratic and a square of consecutive integers, and both say 36.
 */
function seqRules(ts) {
  const n = ts.length, H = [];
  const d1 = qdiff(ts), d2 = qdiff(d1), d3 = qdiff(d2);
  if (allEq(d1)) H.push({ rule: 'arithmetic, difference ' + fmtNum(d1[0]), checks: n - 2, at: (i) => E.qAdd(ts[0], E.qMul(qInt(i), d1[0])) });
  if (ts[0].n !== 0n) {
    const r = E.qDiv(ts[1], ts[0]);
    if (r.n !== 0n && ts.every((x, i) => i === 0 || E.qEq(x, E.qMul(ts[i - 1], r)))) H.push({ rule: 'geometric, ratio ' + fmtNum(r), checks: n - 2, at: (i) => (i > KIND_CAPS.geometricIndex ? null : E.qMul(ts[0], E.qPow(r, BigInt(i)))) });
  }
  if (allEq(d2)) H.push({ rule: 'constant second difference ' + fmtNum(d2[0]), checks: n - 3, at: (i) => newtonAt(ts, 2, i) });
  if (allEq(d3)) H.push({ rule: 'constant third difference ' + fmtNum(d3[0]), checks: n - 4, at: (i) => newtonAt(ts, 3, i) });
  if (ts.every((x, i) => i < 2 || E.qEq(x, E.qAdd(ts[i - 1], ts[i - 2])))) {
    H.push({ rule: 'each term the sum of the two before it', checks: n - 2, at: (i) => { let a = ts[0], b = ts[1]; if (i === 0) return a; for (let j = 1; j < i; j++) { const c = E.qAdd(a, b); a = b; b = c; } return b; } });
  }
  if (ts.every((x) => x.d === 1n && x.n >= 0n)) {
    for (const k of [2n, 3n]) {
      const r0 = iroot(ts[0].n, k);
      if (r0 ** k === ts[0].n && ts.every((x, i) => x.n === (r0 + BigInt(i)) ** k)) H.push({ rule: 'the ' + (k === 2n ? 'squares' : 'cubes') + ' of consecutive whole numbers from ' + r0, checks: n - 2, at: (i) => E.Q((r0 + BigInt(i)) ** k) });
    }
  }
  return H.filter((h) => h.checks >= 2);
}

function readSequenceList(t) {
  const low = t.toLowerCase();
  const nums = [...t.matchAll(SEQ_LIST_RE)], lets = [...t.matchAll(LETTER_LIST_RE)];
  if (nums.length + lets.length !== 1) return null;
  const m = nums[0] || lets[0];
  const letters = !nums.length;
  let f = (low.slice(0, m.index) + ' L ' + low.slice(m.index + m[0].length)).replace(/\s+/g, ' ').replace(/\s+([,:.?!])/g, '$1').trim();
  f = f.replace(/\s*[?.!]+$/, '').trim();
  const raw = m[1].split(/\s*,\s*/);
  if (raw.length < 4 || raw.length > KIND_CAPS.listItems) return null;
  let ts;
  if (letters) {
    const upper = raw.every((x) => /^[A-Z]$/.test(x)), lower = raw.every((x) => /^[a-z]$/.test(x));
    if (!upper && !lower) return null;
    ts = raw.map((x) => qInt(x.toLowerCase().charCodeAt(0) - 96));
  } else {
    if (raw.some((x) => /^-?0\d/.test(x))) return null;
    ts = raw.map((x) => numQ(x));
    if (ts.some((x) => !x)) return null;
  }
  let index = ts.length, asked = 'the next term';
  const nth = SEQ_NTH_RE.exec(f);
  if (nth) { const o = ordN(nth.groups.o); if (!o) return null; index = o - 1; asked = 'term ' + o; }
  else {
    const after = SEQ_AFTER_RE.exec(f);
    if (after) { if (letters) return null; const x = numQ(after.groups.x); if (!x || !E.qEq(x, ts[ts.length - 1])) return null; }
    else if (!NEXT_FRAMES.some((re) => re.test(f))) return null;
  }
  const rules = seqRules(ts);
  if (!rules.length) return null;
  const vals = rules.map((h) => h.at(index));
  if (vals.some((v) => v === null) || !vals.every((v) => E.qEq(v, vals[0]))) return null;
  const v = vals[0];
  let answer;
  if (letters) {
    if (v.d !== 1n || v.n < 1n || v.n > 26n) return null;
    const c = String.fromCharCode(96 + Number(v.n));
    answer = raw[0] === raw[0].toUpperCase() ? c.toUpperCase() : c;
  } else answer = raw.some((x) => x.includes('.')) ? fmtNum(v) : (v.d === 1n ? v.n.toString() : E.qToString(v));
  return out('sequence', answer, [
    ts.length + ' terms given' + (letters ? ', read as letter positions (a = 1)' : ''),
    'every rule that fits was checked on at least two terms beyond its own parameters: ' + rules.map((h) => h.rule).join('; '),
    'every such rule gives the same ' + asked,
  ]);
}

// ---------------------------------------------------------------- board 35 (readers-2): a named rule, a numbered kind, a missing term
// The question may NAME its rule: "the arithmetic sequence 38, 34, 30, ...", "the geometric sequence 2, 6, 18, ...",
// "where each term adds the same amount", "The Fibonacci sequence starts 1, 1, 2, 3, 5". Then only the named rule is
// read, and three terms are enough when it fits every term given (two fix its parameters, the third checks them); a
// named rule the terms do not fit is a refusal. "the 29th square number" names a sequence with no terms at all, counted
// from 1 (1, 4, 9, ...). A missing term ("2, 4, _, 8, 10") is filled only when a rule fits the terms around it with two
// checks beyond its own parameters, and every rule that fits fills the same value.
const NAMED_SEQ = {
  arithmetic(ts) {
    const d = E.qSub(ts[1], ts[0]), at = (i) => E.qAdd(ts[0], E.qMul(qInt(i), d));
    return ts.every((x, i) => E.qEq(x, at(i))) ? { rule: 'arithmetic, difference ' + fmtNum(d) + ', the rule the question names', at } : null;
  },
  geometric(ts) {
    if (ts[0].n === 0n) return null;
    const r = E.qDiv(ts[1], ts[0]);
    if (r.n === 0n || !ts.every((x, i) => i === 0 || E.qEq(x, E.qMul(ts[i - 1], r)))) return null;
    return { rule: 'geometric, ratio ' + fmtNum(r) + ', the rule the question names', at: (i) => (i > KIND_CAPS.geometricIndex ? null : E.qMul(ts[0], E.qPow(r, BigInt(i)))) };
  },
  fibonacci(ts) {
    // the Fibonacci sequence named with the start 1, 1: its nth term by position in the terms given is F(n) as well.
    // board 35 (readers-2), fix: a start 0, 1 (the 10th term by position is 34, F(10) is 55) or 1, 2 (89 by position,
    // 55 as F(10)) has two readings, and another start is another sequence; all three are refused.
    const [a, b] = [ts[0], ts[1]].map((x) => (x.d === 1n ? x.n : null));
    if (!(a === 1n && b === 1n)) return null;
    if (!ts.every((x, i) => i < 2 || E.qEq(x, E.qAdd(ts[i - 1], ts[i - 2])))) return null;
    return { rule: 'each term the sum of the two before it, the rule the question names', at: (i) => { let a = ts[0], b = ts[1]; if (i === 0) return a; for (let j = 1; j < i; j++) { const c = E.qAdd(a, b); a = b; b = c; } return b; } };
  },
};
const SEQ_ASK = '(?:what is|what\'s|find|give|tell me|state|determine|work out|name)';
const SEQ_POS = (det) => '(?:' + det + ' (?:(?<o>' + ORD_SRC + ')|(?<nx>next))(?: ' + SW + ')?|(?:term|element|item) (?:number |no\\.? )?(?<k>\\d+))';
const SEQ_CLAUSE = '(?:where|in which) each term (?:(?<add>adds the same amount|goes up by the same amount|increases by the same amount|is the one before plus the same amount)|(?<mul>is multiplied by the same (?:amount|number)|is the one before times the same (?:amount|number)))';
const NAMED_FRAMES = [
  new RegExp('^' + SEQ_ASK + ' ' + SEQ_POS('the') + ' (?:of|in) (?:the |this |an |a )?(?<r>arithmetic|geometric) ' + SS + ':? L$'),
  new RegExp('^in (?:the |this |an |a )?(?:(?<r>arithmetic|geometric) )?' + SS + ':? L(?:,? ' + SEQ_CLAUSE + ')?,? ' + SEQ_ASK + ' ' + SEQ_POS('the') + '$'),
  new RegExp('^(?:the )?(?<r>fibonacci) ' + SS + ' (?:starts|begins|goes)(?: with)?:? L[.,;]? ' + SEQ_ASK + ' ' + SEQ_POS('(?:its|the)') + '$'),
];
const SEQ_NUMBERED_RE = new RegExp('^' + SEQ_ASK + ' the (?<o>' + ORD_SRC + ') (?<r>square|cube|triangular) number$');
const SEQ_BLANK = '(?:_+|\\?)';
const GAP_LIST_RE = new RegExp('((?:' + SEQ_NUM + '|' + SEQ_BLANK + ')(?:\\s*,\\s*(?:' + SEQ_NUM + '|' + SEQ_BLANK + ')){3,})', 'g');
const MISSING_FRAMES = [
  new RegExp('^(?:what is|what\'s|find|name|give|tell me) the missing ' + SW + '(?: (?:in|of) (?:the |this )?' + SS + ')?:? L$'),
  new RegExp('^(?:what|which) ' + SW + ' is missing(?: (?:in|from) (?:the |this )?' + SS + ')?:? L$'),
  new RegExp('^(?:what|which) ' + SW + ' (?:goes in|fills|belongs in) the (?:blank|gap)(?: (?:in|of) (?:the |this )?' + SS + ')?:? L$'),
  new RegExp('^fill in the (?:blank|gap|missing ' + SW + '):? L$'),
];
function seqTerms(raw) {
  if (raw.length > KIND_CAPS.listItems || raw.some((x) => /^-?0\d/.test(x))) return null;
  const ts = raw.map((x) => numQ(x));
  return ts.some((x) => !x) ? null : ts;
}
const seqPrint = (v, raw) => (raw.some((x) => x.includes('.')) ? fmtNum(v) : (v.d === 1n ? v.n.toString() : E.qToString(v)));
const listFrame = (low, m) => (low.slice(0, m.index) + ' L ' + low.slice(m.index + m[0].length)).replace(/\s+/g, ' ').replace(/\s+([,:.?!])/g, '$1').trim().replace(/\s*[?.!]+$/, '').trim();

function readSequenceNamed(t) {
  const low = t.toLowerCase();
  const sq = SEQ_NUMBERED_RE.exec(bare(low));
  if (sq) {
    const n = ordN(sq.groups.o);
    if (!n) return null;
    const N = BigInt(n), kind = sq.groups.r;
    const v = kind === 'square' ? N * N : kind === 'cube' ? N * N * N : (N * (N + 1n)) / 2n;
    return out('sequence', v.toString(), ['the ' + kind + ' numbers counted from the first, 1: term n is ' + (kind === 'square' ? 'n x n' : kind === 'cube' ? 'n x n x n' : 'n(n + 1)/2'), 'n = ' + n + ' gives ' + v]);
  }
  const nums = [...t.matchAll(SEQ_LIST_RE)];
  if (nums.length !== 1) return null;
  const m = nums[0], f = listFrame(low, m);
  let g = null;
  for (const re of NAMED_FRAMES) { const x = re.exec(f); if (x) { g = x.groups; break; } }
  if (!g) return null;
  // the rule the words name: arithmetic, geometric or fibonacci, or the clause; two names must agree
  const names = [...new Set([g.r, g.add ? 'arithmetic' : null, g.mul ? 'geometric' : null].filter(Boolean))];
  if (names.length > 1) return null;
  const raw = m[1].split(/\s*,\s*/), ts = seqTerms(raw);
  if (!ts) return null;
  const pos = g.nx !== undefined ? ts.length + 1 : g.o !== undefined ? ordN(g.o) : Number(g.k);
  if (!pos || pos < 1 || pos > KIND_CAPS.sequenceIndex) return null;
  let hs;
  if (names.length) { if (ts.length < 3) return null; const h = NAMED_SEQ[names[0]](ts); if (!h) return null; hs = [h]; }
  else { if (ts.length < 4) return null; hs = seqRules(ts); if (!hs.length) return null; }
  const vals = hs.map((h) => h.at(pos - 1));
  if (vals.some((v) => v === null) || !vals.every((v) => E.qEq(v, vals[0]))) return null;
  return out('sequence', seqPrint(vals[0], raw), [
    ts.length + ' terms given',
    (names.length ? 'the question names the rule and it fits every term given: ' : 'every rule that fits was checked on at least two terms beyond its own parameters: ') + hs.map((h) => h.rule).join('; '),
    'term ' + pos + ' by that rule',
  ]);
}

function readSequenceMissing(t) {
  if (!/\b(?:missing|blank|gap)\b/i.test(t)) return null;
  const low = t.toLowerCase();
  const lists = [...t.matchAll(GAP_LIST_RE)];
  if (lists.length !== 1) return null;
  const m = lists[0], f = listFrame(low, m);
  if (!MISSING_FRAMES.some((re) => re.test(f))) return null;
  const items = m[1].split(/\s*,\s*/);
  const blanks = items.map((x, i) => (/^(?:_+|\?)$/.test(x) ? i : -1)).filter((i) => i >= 0);
  if (blanks.length !== 1) return null;
  const b = blanks[0], raw = items.filter((x, i) => i !== b), known = seqTerms(raw);
  if (!known || known.length < 4) return null;
  const pos = items.map((x, i) => i).filter((i) => i !== b);
  const val = new Map(pos.map((p, j) => [p, known[j]]));
  const fills = [];
  // arithmetic: the first two known terms fix the start and the difference, the others check them
  {
    const [p, q] = pos, d = E.qDiv(E.qSub(val.get(q), val.get(p)), qInt(q - p)), at = (i) => E.qAdd(val.get(p), E.qMul(qInt(i - p), d));
    if (pos.every((i) => E.qEq(val.get(i), at(i)))) fills.push({ rule: 'arithmetic, difference ' + fmtNum(d), v: at(b) });
  }
  // geometric: the first two neighbouring known terms fix the ratio
  {
    const p = pos.find((i) => val.has(i + 1) && val.get(i).n !== 0n);
    if (p !== undefined) {
      const r = E.qDiv(val.get(p + 1), val.get(p));
      const at = (i) => (Math.abs(i - p) > KIND_CAPS.geometricIndex ? null : E.qMul(val.get(p), E.qPow(r, BigInt(i - p))));
      if (r.n !== 0n && pos.every((i) => { const v = at(i); return v !== null && E.qEq(val.get(i), v); })) { const v = at(b); if (v) fills.push({ rule: 'geometric, ratio ' + fmtNum(r), v }); }
    }
  }
  // each term the sum of the two before it: one equation gives the missing term, the others check it
  {
    const n = items.length;
    let x = null;
    if (b >= 2) x = E.qAdd(val.get(b - 1), val.get(b - 2));
    else if (b + 2 < n) x = E.qSub(val.get(b + 2), val.get(b + 1));
    if (x) { const ts = items.map((_, i) => (i === b ? x : val.get(i))); if (ts.every((y, i) => i < 2 || E.qEq(y, E.qAdd(ts[i - 1], ts[i - 2])))) fills.push({ rule: 'each term the sum of the two before it', v: x }); }
  }
  if (!fills.length || !fills.every((h) => E.qEq(h.v, fills[0].v))) return null;
  return out('sequence', seqPrint(fills[0].v, raw), [
    known.length + ' terms given around one missing term, term ' + (b + 1),
    'every rule that fits the given terms, each checked on at least two terms beyond its own parameters: ' + fills.map((h) => h.rule).join('; '),
    'every such rule fills the same value',
  ]);
}

/** The sequence reading: the list reader above, a named rule and a missing term; two readings that disagree are null. */
function readSequence(t) {
  let got = null;
  for (const read of [readSequenceList, readSequenceNamed, readSequenceMissing]) {
    const r = read(t);
    if (!r) continue;
    if (got && got.answer !== r.answer) return null;
    if (!got) got = r;
  }
  return got;
}

// ================================================================ COUNTING
const OPN = '(?:(?:the|this) (?:word|phrase|sentence|string|text|name):? )?(?:§(?<q>\\d+)|the word (?<w>[A-Za-z]+))';
const COUNT_T = '(?<t>letters|vowels|consonants|words|(?<l>[a-z])\'s)';
const COUNT_FRAMES = [
  new RegExp('^how many ' + COUNT_T + ' (?:are|are there|is|is there) in ' + OPN + '$', 'i'),
  new RegExp('^how many ' + COUNT_T + ' (?:does|do) ' + OPN + ' (?:have|contain)$', 'i'),
  new RegExp('^count (?:the |all the |all of the )?' + COUNT_T + ' in ' + OPN + '$', 'i'),
  new RegExp('^count how many ' + COUNT_T + ' (?:are|are there) in ' + OPN + '$', 'i'),
  new RegExp('^what is the (?:number|count|total number) of ' + COUNT_T + ' in ' + OPN + '$', 'i'),
  new RegExp('^' + OPN + ' (?:has|contains) how many ' + COUNT_T + '$', 'i'),
  new RegExp('^how many times (?:does|do) (?:the letter )?(?:(?<l>[a-z])|§(?<lq>\\d+)) (?:appear|occur|show up|come up) in ' + OPN + '$', 'i'),
  // board 35 (readers-2), added: 'Count the words in: "..."', 'Tell me how many words the sentence "..." has.'. The casual
  // "how many e's are in lemon" is NOT read (fix after the skeptic): a bare word after "in" is a mention or an idiom ("How
  // many A's are in total?", "in all", "in stock", "in each"), and no list of idioms is complete, so the operand must be
  // quoted or named ("the word lemon") as before.
  new RegExp('^count (?:the |all the |all of the )?' + COUNT_T + ' in: ' + OPN + '$', 'i'),
  new RegExp('^how many ' + COUNT_T + ' (?:are|are there|is|is there) in: ' + OPN + '$', 'i'),
  new RegExp('^(?:tell me|can you tell me|say) how many ' + COUNT_T + ' ' + OPN + ' (?:has|contains|have)$', 'i'),
  new RegExp('^(?:tell me|can you tell me|say) how many ' + COUNT_T + ' (?:are|are there|there are|is|is there|there is) in:? ' + OPN + '$', 'i'),
];
const DIGIT_FRAMES = [
  /^how many digits (?:does|do) (?:the (?:number|integer) )?(?<n>-?[\d,]+) (?:have|contain)$/i,
  /^how many digits (?:are|are there) in (?:the (?:number|integer) )?(?<n>-?[\d,]+)$/i,
  /^count the digits (?:in|of) (?:the (?:number|integer) )?(?<n>-?[\d,]+)$/i,
  /^what is the number of digits in (?:the (?:number|integer) )?(?<n>-?[\d,]+)$/i,
];
const POLY = { triangle: 3, square: 4, rectangle: 4, rhombus: 4, quadrilateral: 4, parallelogram: 4, trapezoid: 4, trapezium: 4, kite: 4, pentagon: 5, hexagon: 6, heptagon: 7, octagon: 8, nonagon: 9, enneagon: 9, decagon: 10, hendecagon: 11, undecagon: 11, dodecagon: 12 };
const SIDE_FRAMES = [
  /^how many (?<p>sides|edges|corners|vertices|angles) (?:does|do) (?:a|an|the) (?:regular )?(?<s>[a-z]+) have$/i,
  /^how many (?<p>sides|edges|corners|vertices|angles) (?:has|have) (?:a|an|the) (?:regular )?(?<s>[a-z]+)(?: got)?$/i,
  /^how many (?<p>sides|edges|corners|vertices|angles) (?:are there )?(?:on|in) (?:a|an|the) (?:regular )?(?<s>[a-z]+)$/i,
  /^(?:a|an) (?<s>[a-z]+) has how many (?<p>sides|edges|corners|vertices|angles)$/i,
];
const operandOf = (g, quotes) => (g.q !== undefined ? quotes[Number(g.q)] : g.w);

function countIn(t, s, letter) {
  if (s === undefined || s.length === 0 || s.length > KIND_CAPS.stringChars) return null;
  if (letter) { const L = letter.toLowerCase(); return { n: [...s.toLowerCase()].filter((c) => c === L).length, how: 'counted the letter ' + L + ' in "' + s + '", upper and lower case alike' }; }
  if (t === 'letters') return { n: [...s].filter((c) => /\p{L}/u.test(c)).length, how: 'counted the letters of "' + s + '" (a space or a mark is not a letter)' };
  if (t === 'vowels' || t === 'consonants') {
    // y is a vowel in rhythm and a consonant in yes: a word with a y has no one answer
    if (/[^a-z\s'.,;:!?-]/i.test(s) || /y/i.test(s)) return null;
    const ls = [...s.toLowerCase()].filter((c) => c >= 'a' && c <= 'z');
    const v = ls.filter((c) => 'aeiou'.includes(c)).length;
    return { n: t === 'vowels' ? v : ls.length - v, how: 'counted the ' + t + ' of "' + s + '" (a e i o u are the vowels; the text has no y)' };
  }
  if (t === 'words') {
    const toks = s.trim().split(/\s+/);
    if (!toks.every((w) => /^[\p{L}\p{N}]+(?:'[\p{L}]+)?[.,;:!?]?$/u.test(w))) return null;
    return { n: toks.length, how: 'counted the words of "' + s + '", split at the spaces' };
  }
  return null;
}

function readCounting(t) {
  if (!/\b(?:how many|count|number of|has how many|contains how many)\b/i.test(t)) return null;
  const { masked, quotes } = maskQuotes(t);
  const f = bare(masked);
  for (const re of COUNT_FRAMES) {
    const m = re.exec(f);
    if (!m) continue;
    const g = m.groups;
    const s = operandOf(g, quotes);
    let letter = g.l;
    if (g.lq !== undefined) { letter = quotes[Number(g.lq)]; if (!/^[a-z]$/i.test(letter || '')) return null; }
    const r = countIn(g.t ? g.t.toLowerCase() : null, s, letter);
    return r ? out('counting', r.n, [r.how]) : null;
  }
  for (const re of DIGIT_FRAMES) {
    const m = re.exec(f);
    if (!m) continue;
    const n = m.groups.n.replace(/^-/, '');
    if (!/^(?:\d{1,3}(?:,\d{3})+|\d+)$/.test(n) || (/^0\d/.test(n))) return null;
    const d = n.replace(/,/g, '');
    return out('counting', d.length, ['counted the digits of ' + n + ' (a comma or a sign is not a digit)']);
  }
  for (const re of SIDE_FRAMES) {
    const m = re.exec(f);
    if (!m) continue;
    const n = POLY[m.groups.s.toLowerCase()];
    return n ? out('counting', n, ['a ' + m.groups.s.toLowerCase() + ' has ' + n + ' ' + m.groups.p.toLowerCase() + ' by definition']) : null;
  }
  return null;
}

// ================================================================ SPELLING
const REV_FRAMES = [
  new RegExp('^(?:spell|write) ' + OPN + ' (?:backwards?|in reverse(?: order)?)$', 'i'),
  new RegExp('^reverse (?:the (?:letters|spelling) of )?' + OPN + '$', 'i'),
  new RegExp('^what is ' + OPN + ' (?:spelled|spelt|written) (?:backwards?|in reverse)$', 'i'),
  new RegExp('^how do you spell ' + OPN + ' backwards?$', 'i'),
  // board 35 (readers-2), added: 'Write "paper" in reverse, just the word.'. "reverse the letters of ferret" is NOT read
  // (fix after the skeptic): a bare word after "of" is a mention or points elsewhere ("of each", "of all", "of words"),
  // so the operand must be quoted or named ("the word ferret") as before.
  new RegExp('^(?:spell|write) ' + OPN + ' (?:backwards?|in reverse(?: order)?),? (?:just|only) the (?:word|letters)$', 'i'),
];
const SP_ORD = '(?<o>' + ORD_SRC + '|last)';
const NTH_FRAMES = [
  new RegExp('^(?:what|which) is the ' + SP_ORD + ' letter (?:of|in) ' + OPN + '$', 'i'),
  new RegExp('^(?:give|name|state|find|write) the ' + SP_ORD + ' letter (?:of|in) ' + OPN + '$', 'i'),
  new RegExp('^in ' + OPN + ',? (?:which|what) letter (?:comes|is) (?:the )?' + SP_ORD + '$', 'i'),
  new RegExp('^(?:which|what) letter (?:comes|is) (?:the )?' + SP_ORD + ' in ' + OPN + '$', 'i'),
  // board 35 (readers-2), added: "What's the last letter of "broccoli"?"
  new RegExp('^what\'s the ' + SP_ORD + ' letter (?:of|in) ' + OPN + '$', 'i'),
];
// board 35 (readers-2), added: "Tell me letter number 5 of the word 'kayak'.": the position as a number, counted from 1
const LETTER_NO_FRAMES = [
  new RegExp('^(?:tell me|give me|give|name|find|state|what is|what\'s) letter (?:number )?(?<n>\\d+) (?:of|in) ' + OPN + '$', 'i'),
];
const PREFIX_FRAMES = [
  new RegExp('^(?:what are|give|write|name|list) the (?<fl>first|last) (?<n>\\d+|' + SMALL.slice(2, 13).join('|') + ') letters (?:of|in) ' + OPN + '$', 'i'),
];
const CASE_UP = '(?:all )?(?:capital letters|capitals|block capitals|upper ?case|upper-case)';
const CASE_LOW = '(?:all )?(?:lower ?case|lower-case|small letters)';
const CASE_FRAMES = [
  new RegExp('^(?:write|type|convert|put|change|spell|make|turn|rewrite) ' + OPN + ' (?:in|into|to) (?<c>' + CASE_UP + '|' + CASE_LOW + ')$', 'i'),
  new RegExp('^what is ' + OPN + ' in (?<c>' + CASE_UP + '|' + CASE_LOW + ')$', 'i'),
];
const CAPFIRST_RE = new RegExp('^capitali[sz]e the first letter of ' + OPN + '$', 'i');
const ALPHA_FRAMES = [
  /^(?:put|arrange|sort|order|list|write) (?:these|the following|the) (?<k>letters|words)(?<how> in alphabetical order| alphabetically| in reverse alphabetical order):? (?<list>.+)$/i,
];
const SPELLNUM_FRAMES = [
  /^how do you spell (?:the number )?(?<n>\d+)(?: as a word| in words| out)?$/i,
  /^(?:spell|write)(?: out)? (?:the number )?(?<n>\d+) (?:in words|as a word|as words|out)$/i,
  /^what is (?:the number )?(?<n>\d+) (?:in words|written (?:out )?(?:as a word|in words)|spelled out)$/i,
];
/** 0 to 99, and round hundreds and thousands; any other number has two spellings (with and without "and"). */
function numberWords(n) {
  if (n < 20) return SMALL[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + SMALL[n % 10] : '');
  if (n % 100 === 0 && n / 100 < 10) return SMALL[n / 100] + ' hundred';
  if (n % 1000 === 0 && n / 1000 < 100) return numberWords(n / 1000) + ' thousand';
  return null;
}

function readSpelling(t) {
  if (!/\b(?:spell|spelled|spelt|reverse|letter|letters|case|capital|capitals|capitali[sz]e|alphabetical|alphabetically|words?)\b|uppercase|lowercase/i.test(t)) return null;
  const { masked, quotes } = maskQuotes(t);
  const f = bare(masked);
  const oneWord = (s) => typeof s === 'string' && /^\p{L}+$/u.test(s) && s.length <= KIND_CAPS.stringChars;
  for (const re of REV_FRAMES) {
    const m = re.exec(f);
    if (!m) continue;
    const s = operandOf(m.groups, quotes);
    if (typeof s !== 'string' || !/^[\p{L} ]+$/u.test(s) || s.length > KIND_CAPS.stringChars) return null;
    return out('spelling', [...s].reverse().join(''), ['wrote the letters of "' + s + '" from last to first']);
  }
  for (const re of NTH_FRAMES) {
    const m = re.exec(f);
    if (!m) continue;
    const s = operandOf(m.groups, quotes);
    if (!oneWord(s)) return null;
    const cs = [...s];
    const o = m.groups.o.toLowerCase() === 'last' ? cs.length : ordN(m.groups.o);
    if (!o || o > cs.length) return null;
    return out('spelling', cs[o - 1], ['letter ' + o + ' of ' + cs.length + ' in "' + s + '", counting from the first']);
  }
  // board 35 (readers-2), added: the position as a number ("letter number 5")
  for (const re of LETTER_NO_FRAMES) {
    const m = re.exec(f);
    if (!m) continue;
    const s = operandOf(m.groups, quotes);
    if (!oneWord(s)) return null;
    const cs = [...s], o = Number(m.groups.n);
    if (!(o >= 1 && o <= cs.length)) return null;
    return out('spelling', cs[o - 1], ['letter ' + o + ' of ' + cs.length + ' in "' + s + '", counting from the first']);
  }
  for (const re of PREFIX_FRAMES) {
    const m = re.exec(f);
    if (!m) continue;
    const s = operandOf(m.groups, quotes);
    const k = countOf(m.groups.n);
    if (!oneWord(s) || !k || k < 1n || k > BigInt(s.length)) return null;
    const cs = [...s], n = Number(k);
    const part = m.groups.fl.toLowerCase() === 'first' ? cs.slice(0, n) : cs.slice(cs.length - n);
    return out('spelling', part.join(''), ['the ' + m.groups.fl.toLowerCase() + ' ' + n + ' letters of "' + s + '"']);
  }
  for (const re of CASE_FRAMES) {
    const m = re.exec(f);
    if (!m) continue;
    const s = operandOf(m.groups, quotes);
    if (typeof s !== 'string' || !/^[A-Za-z ]+$/.test(s)) return null;
    const up = new RegExp('^' + CASE_UP + '$', 'i').test(m.groups.c);
    return out('spelling', up ? s.toUpperCase() : s.toLowerCase(), ['every letter of "' + s + '" in ' + (up ? 'upper' : 'lower') + ' case']);
  }
  {
    const m = CAPFIRST_RE.exec(f);
    if (m) {
      const s = operandOf(m.groups, quotes);
      if (typeof s !== 'string' || !/^[A-Za-z]/.test(s) || !/^[A-Za-z ]+$/.test(s)) return null;
      return out('spelling', s.charAt(0).toUpperCase() + s.slice(1), ['the first letter of "' + s + '" in upper case, the rest unchanged']);
    }
  }
  for (const re of ALPHA_FRAMES) {
    const m = re.exec(f);
    if (!m) continue;
    const items = splitList(m.groups.list);
    if (!items) return null;
    const k = m.groups.k.toLowerCase();
    const okLetters = items.every((x) => /^[a-z]$/.test(x)) || items.every((x) => /^[A-Z]$/.test(x));
    const okWords = items.every((x) => /^[a-z]+$/.test(x)) || items.every((x) => /^[A-Z][a-z]*$/.test(x));
    if (k === 'letters' ? !okLetters : !okWords) return null;
    const rev = /reverse/i.test(m.groups.how);
    const sorted = [...items].sort((a, b) => { const x = a.toLowerCase(), y = b.toLowerCase(); return x < y ? -1 : x > y ? 1 : 0; });
    if (rev) sorted.reverse();
    return out('spelling', sorted.join(', '), [items.length + ' ' + k + ' put in ' + (rev ? 'reverse ' : '') + 'alphabetical order, letter by letter']);
  }
  for (const re of SPELLNUM_FRAMES) {
    const m = re.exec(f);
    if (!m) continue;
    if (/^0\d/.test(m.groups.n) || m.groups.n.length > 6) return null;
    const w = numberWords(Number(m.groups.n));
    return w ? out('spelling', w, [m.groups.n + ' in English words (a compound from 21 to 99 takes a hyphen)']) : null;
  }
  return null;
}

// ================================================================ CALENDAR
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const DAY_SRC = '(?:' + DAYS.join('|') + ')';
const MONTH_SRC = '(?:' + MONTHS.join('|') + ')';
const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const monthDays = (y, m) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
const yearOk = (y) => Number.isInteger(y) && y >= KIND_CAPS.yearMin && y <= KIND_CAPS.yearMax;
// board 35 (readers-2), added. A date written YYYY-MM-DD is an ISO 8601 date, and ISO 8601 names the Gregorian calendar
// for every year from 1583 (the first whole Gregorian year), so an ISO date from 1583 names one day; a date written in words
// before 1753 still names two (Julian in Britain, Gregorian elsewhere) and stays refused. A leap year before 1753 is
// answered only in the years the Julian and Gregorian rules agree on (every year but 1700 from 1583 to 1752).
const ISO_YEAR_MIN = 1583;
const isoYearOk = (y, style) => style === 'iso' && Number.isInteger(y) && y >= ISO_YEAR_MIN && y <= KIND_CAPS.yearMax;
const leapAgrees = (y) => Number.isInteger(y) && y >= ISO_YEAR_MIN && y < KIND_CAPS.yearMin && (y % 100 !== 0 || y % 400 === 0);
// board 35 (readers-2): a month from 1583 to 1752 has one length in both calendars except February of a year the leap
// rules disagree on (1700); September 1752 (the month Britain dropped eleven days) and the length of the year 1752 stay refused.
const monthAgrees = (y, mo) => Number.isInteger(y) && y >= ISO_YEAR_MIN && y < KIND_CAPS.yearMin && !(y === 1752 && mo === 9) && (mo !== 2 || leapAgrees(y));
const yearLengthAgrees = (y) => leapAgrees(y) && y !== 1752;

// days since 1970-01-01 of a proleptic Gregorian date, and back (the civil day algorithms, integer only)
function daysFromCivil(y, m, d) {
  y -= m <= 2 ? 1 : 0;
  const era = Math.floor(y / 400), yoe = y - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}
function civilFromDays(z) {
  z += 719468;
  const era = Math.floor(z / 146097), doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1, m = mp + (mp < 10 ? 3 : -9);
  return { y: yoe + era * 400 + (m <= 2 ? 1 : 0), m, d };
}
/** The weekday (0 = Sunday) by Zeller's congruence, checked against the day count from 1970-01-01 (a Thursday); null if they disagree. */
function weekdayOf(y, m, d) {
  let Y = y, M = m;
  if (M < 3) { M += 12; Y -= 1; }
  const K = Y % 100, J = Math.floor(Y / 100);
  const h = (d + Math.floor((13 * (M + 1)) / 5) + K + Math.floor(K / 4) + Math.floor(J / 4) + 5 * J) % 7; // 0 = Saturday
  const zeller = (h + 6) % 7;
  const count = (((daysFromCivil(y, m, d) % 7) + 7 + 4) % 7);
  return zeller === count ? zeller : null;
}
function parseDate(s) {
  const w = String(s).trim().toLowerCase();
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(w);
  let y, mo, d, style;
  if (m) { y = +m[1]; mo = +m[2]; d = +m[3]; style = 'iso'; }
  else if ((m = new RegExp('^(' + MONTH_SRC + ') (\\d{1,2})(?:st|nd|rd|th)?,? (\\d{4})$').exec(w))) { y = +m[3]; mo = MONTHS.indexOf(m[1]) + 1; d = +m[2]; style = 'mdy'; }
  else if ((m = new RegExp('^(?:the )?(\\d{1,2})(?:st|nd|rd|th)? (?:of )?(' + MONTH_SRC + '),? (\\d{4})$').exec(w))) { y = +m[3]; mo = MONTHS.indexOf(m[2]) + 1; d = +m[1]; style = 'dmy'; }
  else return null;
  if (!(yearOk(y) || isoYearOk(y, style)) || mo < 1 || mo > 12 || d < 1 || d > monthDays(y, mo)) return null;
  return { y, m: mo, d, style };
}
function fmtDate(dt, style) {
  const p2 = (x) => String(x).padStart(2, '0');
  if (style === 'iso') return dt.y + '-' + p2(dt.m) + '-' + p2(dt.d);
  if (style === 'mdy') return cap1(MONTHS[dt.m - 1]) + ' ' + dt.d + ', ' + dt.y;
  return dt.d + ' ' + cap1(MONTHS[dt.m - 1]) + ' ' + dt.y;
}
const REL = { today: 0, tomorrow: 1, yesterday: -1, 'the day after tomorrow': 2, 'the day before yesterday': -2 };
const REL_SRC = '(?:the day after tomorrow|the day before yesterday|today|tomorrow|yesterday)';
const CNT = '(?:\\d+|' + [...WORD_NUM.keys()].sort((a, b) => b.length - a.length).join('|') + ')';
const mod7 = (x) => ((x % 7) + 7) % 7;

function calendarPremise(s) {
  let m = /^(\d{4}) is (not )?a leap year$/i.exec(s);
  if (m) { const y = +m[1]; return yearOk(y) && isLeap(y) === !m[2]; }
  m = new RegExp('^(' + MONTH_SRC + ')(?: (\\d{4}))? has (\\d+) days$', 'i').exec(s);
  if (m) {
    const mo = MONTHS.indexOf(m[1].toLowerCase()) + 1;
    if (mo === 2 && !m[2]) return false;
    const y = m[2] ? +m[2] : 2001;
    return (!m[2] || yearOk(y)) && monthDays(y, mo) === +m[3];
  }
  m = new RegExp('^(.+?) (?:is|was|will be) a (' + DAY_SRC + ')$', 'i').exec(s);
  if (m) { const dt = parseDate(m[1]); return !!dt && weekdayOf(dt.y, dt.m, dt.d) === DAYS.indexOf(m[2].toLowerCase()); }
  return false;
}

function calendarQuestion(q) {
  let m;
  // a leap year
  if ((m = /^(?:is|was|will) (?:the year )?(\d{4}) (?:be )?a leap year$/.exec(q))) {
    const y = +m[1]; if (!yearOk(y) && !leapAgrees(y)) return null;
    return [isLeap(y) ? 'yes' : 'no', y + (isLeap(y) ? ' is' : ' is not') + ' a leap year: divisible by 4, and not by 100 unless by 400 (Gregorian)' + (yearOk(y) ? '' : '; before 1753 the Julian rule (divisible by 4) gives the same answer')];
  }
  if ((m = /^how many days (?:are|are there|is|is there) in (?:a|one) (leap|common|non-leap|non leap|normal|regular) year$/.exec(q)) || (m = /^how many days (?:does|do) (?:a|one) (leap|common|non-leap|non leap) year have$/.exec(q))) {
    const leap = m[1] === 'leap';
    return [leap ? '366' : '365', 'a ' + (leap ? 'leap' : 'common') + ' year has ' + (leap ? '366' : '365') + ' days'];
  }
  if ((m = /^how many days (?:are|are there|is|is there) in (?:the year )?(\d{4})$/.exec(q)) || (m = /^how many days (?:does|did|will) (?:the year )?(\d{4}) have$/.exec(q))) {
    const y = +m[1]; if (!yearOk(y) && !yearLengthAgrees(y)) return null;
    return [isLeap(y) ? '366' : '365', y + (isLeap(y) ? ' is' : ' is not') + ' a leap year'];
  }
  // the days of a month
  if ((m = new RegExp('^how many days (?:are|are there|is|is there) in (?:the month of )?(' + MONTH_SRC + ')(?: (\\d{4}))?$').exec(q)) || (m = new RegExp('^how many days (?:does|did|will) (' + MONTH_SRC + ')(?: (\\d{4}))? have$').exec(q))) {
    const mo = MONTHS.indexOf(m[1]) + 1;
    if (mo === 2 && !m[2]) return null;
    if (m[2] && !yearOk(+m[2]) && !monthAgrees(+m[2], mo)) return null;
    const n = monthDays(m[2] ? +m[2] : 2001, mo);
    return [String(n), cap1(m[1]) + (m[2] ? ' ' + m[2] : '') + ' has ' + n + ' days'];
  }
  if ((m = /^how many months (?:have|has|contain) (?:exactly )?(31|30|thirty-one|thirty) days$/.exec(q))) {
    const n = m[1] === '31' || m[1] === 'thirty-one' ? 31 : 30;
    const names = MONTHS.filter((x, i) => monthDays(2001, i + 1) === n);
    return [String(names.length), names.map(cap1).join(', ') + ' have ' + n + ' days'];
  }
  // the next and the previous day or month
  if ((m = new RegExp('^(?:what|which) (?:day|weekday)(?: of the week)? (?:comes|is|falls) (after|before) (' + DAY_SRC + ')$').exec(q)) || (m = new RegExp('^what is the day (after|before) (' + DAY_SRC + ')$').exec(q))) {
    const d = mod7(DAYS.indexOf(m[2]) + (m[1] === 'after' ? 1 : -1));
    return [cap1(DAYS[d]), 'the day ' + m[1] + ' ' + cap1(m[2]) + ' in the seven day week'];
  }
  if ((m = new RegExp('^(?:what|which) month (?:comes|is) (after|before) (' + MONTH_SRC + ')$').exec(q)) || (m = new RegExp('^what is the month (after|before) (' + MONTH_SRC + ')$').exec(q))) {
    const i = (MONTHS.indexOf(m[2]) + (m[1] === 'after' ? 1 : -1) + 12) % 12;
    return [cap1(MONTHS[i]), 'the month ' + m[1] + ' ' + cap1(m[2])];
  }
  if ((m = new RegExp('^(?:what|which) month (?:comes|is|will it be) (' + CNT + ') months? (after|before|from) (' + MONTH_SRC + ')$').exec(q))) {
    const k = countOf(m[1]); if (k === null || k > 10000n) return null;
    const i = (((MONTHS.indexOf(m[3]) + (m[2] === 'before' ? -1 : 1) * Number(k)) % 12) + 12) % 12;
    return [cap1(MONTHS[i]), Number(k) + ' months ' + (m[2] === 'before' ? 'before' : 'after') + ' ' + cap1(m[3]) + ', counted around the twelve months'];
  }
  // a day relative to another
  if ((m = new RegExp('^if (' + REL_SRC + ') (?:is|was|will be) (' + DAY_SRC + '),? (?:what|which) day(?: of the week)? (?:is|was|will be|will it be|is it|was it|would it be|would be)(?: it)? (' + REL_SRC + '|in (' + CNT + ') days?|(' + CNT + ') days? (?:from now|from today|later)|(' + CNT + ') days? ago)$').exec(q))) {
    let off;
    if (REL[m[3]] !== undefined) off = REL[m[3]] - REL[m[1]];
    else { const k = countOf(m[4] || m[5] || m[6]); if (k === null || k > 100000n) return null; off = (m[6] ? -Number(k) : Number(k)) - REL[m[1]]; }
    const d = mod7(DAYS.indexOf(m[2]) + off);
    return [cap1(DAYS[d]), cap1(m[1]) + ' is ' + cap1(m[2]) + '; the day asked is ' + off + ' day(s) from it, counted mod 7'];
  }
  if ((m = new RegExp('^(?:what|which) day(?: of the week)? (?:is|will it be|comes|is it|falls|will be) (' + CNT + ') days? (after|before|from) (?:a |an )?(' + DAY_SRC + ')$').exec(q))) {
    const k = countOf(m[1]); if (k === null || k > 100000n) return null;
    const off = (m[2] === 'before' ? -1 : 1) * Number(k);
    return [cap1(DAYS[mod7(DAYS.indexOf(m[3]) + off)]), Number(k) + ' days ' + (m[2] === 'before' ? 'before' : 'after') + ' a ' + cap1(m[3]) + ': ' + Number(k) + ' mod 7 = ' + mod7(Number(k))];
  }
  // the weekday of a date
  if ((m = /^(?:what|which) (?:day of the week|weekday|day) (?:was|is|will be|fell on|falls on|is it on|was it on) (.+)$/.exec(q)) || (m = /^(?:what|which) day of the week (?:did|does|will) (.+?) fall on$/.exec(q))) {
    const dt = parseDate(m[1]); if (!dt) return null;
    const w = weekdayOf(dt.y, dt.m, dt.d); if (w === null) return null;
    return [cap1(DAYS[w]), 'Zeller\'s congruence on the Gregorian date ' + fmtDate(dt, 'iso') + ', checked against the day count from 1970-01-01 (a Thursday)'];
  }
  // date arithmetic
  if ((m = new RegExp('^what (?:date|day) (?:is|was|will it be|will be|is it) (' + CNT + ') (days?|weeks?) (after|before|from) (.+)$').exec(q)) || (m = new RegExp('^what is the date (' + CNT + ') (days?|weeks?) (after|before|from) (.+)$').exec(q))) {
    const k = countOf(m[1]); const dt = parseDate(m[4]);
    if (k === null || k > 1000000n || !dt) return null;
    const n = Number(k) * (m[2].startsWith('week') ? 7 : 1) * (m[3] === 'before' ? -1 : 1);
    const r = civilFromDays(daysFromCivil(dt.y, dt.m, dt.d) + n);
    if (!(yearOk(r.y) || isoYearOk(r.y, dt.style))) return null;
    return [fmtDate(r, dt.style), fmtDate(dt, 'iso') + ' is day ' + daysFromCivil(dt.y, dt.m, dt.d) + ' counted from 1970-01-01; ' + (n >= 0 ? 'plus ' : 'minus ') + Math.abs(n) + ' is ' + fmtDate(r, 'iso')];
  }
  // days between two dates
  if ((m = /^how many days (?:are there |are |is it |have passed |elapse |pass )?between (.+?) and (.+?)(,? inclusive)?$/.exec(q))) {
    const a = parseDate(m[1]), b = parseDate(m[2]); if (!a || !b) return null;
    const diff = Math.abs(daysFromCivil(b.y, b.m, b.d) - daysFromCivil(a.y, a.m, a.d));
    return [String(diff + (m[3] ? 1 : 0)), 'the difference of the two day counts' + (m[3] ? ', plus one because both ends are counted' : '')];
  }
  if ((m = /^how many days (?:are there |are |is it )?from (.+?) (?:to|until|till|through) (.+?),? (counting both(?: of those)?(?: dates)?|inclusive|including both(?: dates)?|counting both ends)$/.exec(q)) || (m = /^how many days (?:are there |are |is it )?from (.+?) (up to but not including) (.+)$/.exec(q))) {
    const exclusive = m[2] === 'up to but not including';
    const a = parseDate(m[1]), b = parseDate(exclusive ? m[3] : m[2]); if (!a || !b) return null;
    const diff = daysFromCivil(b.y, b.m, b.d) - daysFromCivil(a.y, a.m, a.d);
    if (diff < 0) return null;
    return [String(diff + (exclusive ? 0 : 1)), 'the difference of the two day counts' + (exclusive ? ' (the end date is not counted)' : ', plus one because both dates are counted')];
  }
  // board 35 (readers-2), added: the phrasings of the self-queries generator no frame above read. "From A to B" and
  // "how many days after A is B" are read as "between" is read above: the difference of the two day counts, B after A.
  if ((m = new RegExp('^how many days (?:does|did|will) (' + MONTH_SRC + ') have in (\\d{4})$').exec(q)) || (m = new RegExp('^(?:tell me|give me|what is|what\'s|find) the number of days in (?:the month of )?(' + MONTH_SRC + ')(?:,? (?:of |in )?(\\d{4}))?$').exec(q))) {
    const mo = MONTHS.indexOf(m[1]) + 1;
    if (mo === 2 && !m[2]) return null;
    if (m[2] && !yearOk(+m[2]) && !monthAgrees(+m[2], mo)) return null;
    const n = monthDays(m[2] ? +m[2] : 2001, mo);
    return [String(n), cap1(m[1]) + (m[2] ? ' ' + m[2] : '') + ' has ' + n + ' days'];
  }
  if ((m = /^on (?:what|which) (?:day of the week|weekday|day) (?:did|does|will) (.+?) fall$/.exec(q)) || (m = /^(?:tell me|give me|name|state|find|what is|what's) the (?:weekday|day of the week) (?:of|for|on) (.+)$/.exec(q))) {
    const dt = parseDate(m[1]); if (!dt) return null;
    const w = weekdayOf(dt.y, dt.m, dt.d); if (w === null) return null;
    return [cap1(DAYS[w]), 'Zeller\'s congruence on the Gregorian date ' + fmtDate(dt, 'iso') + ', checked against the day count from 1970-01-01 (a Thursday)'];
  }
  if ((m = /^how many days (?:are there |are |is it |pass |elapse )?from (.+?) (?:to|until|till) (.+)$/.exec(q)) || (m = /^how many days (?:after|later than) (.+?) (?:is|was|will be|comes) (.+)$/.exec(q))) {
    const a = parseDate(m[1]), b = parseDate(m[2]); if (!a || !b) return null;
    const diff = daysFromCivil(b.y, b.m, b.d) - daysFromCivil(a.y, a.m, a.d);
    if (diff < 0) return null;
    return [String(diff), 'the difference of the two day counts: ' + fmtDate(b, 'iso') + ' is ' + diff + ' days after ' + fmtDate(a, 'iso')];
  }
  // the nth month
  if ((m = new RegExp('^(?:what|which) (?:is|month is) the (' + ORD_SRC + '|last) month(?: of the year)?$').exec(q)) || (m = new RegExp('^name the (' + ORD_SRC + '|last) month(?: of the year)?$').exec(q))) {
    const n = m[1] === 'last' ? 12 : ordN(m[1]);
    if (!n || n > 12) return null;
    return [cap1(MONTHS[n - 1]), 'month ' + n + ' of the twelve, January first'];
  }
  return null;
}

function readCalendar(t) {
  if (!new RegExp('\\b(?:leap|days?|weekday|' + DAY_SRC.slice(3, -1) + '|' + MONTH_SRC.slice(3, -1) + '|month|months|\\d{4}-\\d{2}-\\d{2})\\b', 'i').test(t)) return null;
  const ss = sentencesOf(t).map((s) => bare(s));
  if (!ss.length || ss.length > 3) return null;
  const steps = [];
  for (const s of ss.slice(0, -1)) { if (!calendarPremise(s)) return null; steps.push('the given fact "' + s + '" checked and true'); }
  const r = calendarQuestion(ss[ss.length - 1].toLowerCase());
  if (!r) return null;
  steps.push(r[1]);
  return out('calendar', r[0], steps);
}

// ================================================================ COMPARISON
/** A number (3/4, -8, 0.65, 2^10) or a quantity in the unit table ("1 kilogram", "a kilogram of feathers", "0 degrees Celsius"). */
function parseOperand(s) {
  const text = String(s).trim();
  const low = text.toLowerCase();
  if (!text || text.length > 80) return null;
  if (/^-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$|^-?\d+\/\d+$/.test(low)) { const v = numQ(low); return v ? { text, dim: 'num', v } : null; }
  let m = /^(-?\d+)\s*\^\s*(\d+)$/.exec(low);
  if (m) { const k = BigInt(m[2]); if (k > 512n) return null; return { text, dim: 'num', v: E.qPow(E.qFromString(m[1]), k) }; }
  m = /^(.+?) of [a-z]+(?: [a-z]+)?$/.exec(low);
  const q = parseQty(m ? m[1] : low);
  if (!q || (m && q.dim === 'temp')) return null;
  return { text, dim: q.dim, v: q.value };
}
// direction (+1 the larger wins) and the dimensions an adjective can be said of (null: any one dimension)
const ADJ = {
  larger: [1, null], bigger: [1, null], greater: [1, null], more: [1, null], higher: [1, null],
  smaller: [-1, null], less: [-1, null], lower: [-1, null], fewer: [-1, ['num']],
  heavier: [1, ['mass']], lighter: [-1, ['mass']], longer: [1, ['length', 'time']], shorter: [-1, ['length', 'time']], taller: [1, ['length']],
  hotter: [1, ['temp']], warmer: [1, ['temp']], colder: [-1, ['temp']], cooler: [-1, ['temp']], farther: [1, ['length']], further: [1, ['length']],
};
const VERB_ADJ = { 'weighs more': [1, ['mass']], 'weighs less': [-1, ['mass']], 'lasts longer': [1, ['time']], 'takes longer': [1, ['time']], 'weigh more': [1, ['mass']], 'weigh less': [-1, ['mass']], 'last longer': [1, ['time']] };
const NOUN_DIM = { number: ['num'], value: ['num'], distance: ['length'], length: ['length', 'time'], weight: ['mass'], mass: ['mass'], temperature: ['temp'], time: ['time'], duration: ['time'], one: null, quantity: null, amount: null };
const SUP = { largest: 1, biggest: 1, greatest: 1, highest: 1, smallest: -1, least: -1, lowest: -1 };
const ADJ_SRC = '(?<adj>' + Object.keys(ADJ).join('|') + ')';
const SUP_SRC = '(?<sup>' + Object.keys(SUP).join('|') + ')';
const CHOOSE_FRAMES = [
  new RegExp('^which (?:(?<noun>one|number|value|quantity|amount|distance|length|weight|mass|temperature|time|duration) )?is (?:the )?' + ADJ_SRC + '[,:]? (?<a>.+?),? or (?<b>.+)$', 'i'),
  new RegExp('^which (?:one )?(?<vp>weighs more|weighs less|lasts longer|takes longer)[,:]? (?<a>.+?),? or (?<b>.+)$', 'i'),
  new RegExp('^of (?<a>.+?) and (?<b>.+?),? which (?:one )?is (?:the )?' + ADJ_SRC + '$', 'i'),
  new RegExp('^is (?<a>.+?) or (?<b>.+?) (?:the )?' + ADJ_SRC + '(?: number| one| value| quantity| amount)?$', 'i'),
  // board 35 (readers-2), added: "What's the larger of 17.17 and 17.5?"
  new RegExp('^(?:what is|what\'s|find|give|name|tell me|state) the ' + ADJ_SRC + '(?: number| one| value| quantity| amount)? of (?<a>.+?),? and (?<b>.+)$', 'i'),
];
const YESNO_FRAMES = [
  new RegExp('^is (?<a>.+?) ' + ADJ_SRC + ' than (?<b>.+)$', 'i'),
  /^is (?<a>.+?) (?<eq>equal to|the same as) (?<b>.+)$/i,
  /^(?:does|do) (?<a>.+?) (?<vp>weigh more|weigh less|last longer) than (?<b>.+)$/i,
];
const EXTREME_FRAMES = [
  new RegExp('^(?:which|what)(?: number| value)? is the ' + SUP_SRC + '(?: number| value)?(?: of| in| among)(?: these| the following)?(?: numbers| values)?:? (?<list>.+)$', 'i'),
  new RegExp('^(?:find|name|give) the ' + SUP_SRC + '(?: number| value)?(?: of| in| among)(?: these| the following)?(?: numbers| values)?:? (?<list>.+)$', 'i'),
];
const ORDER_FRAMES = [
  /^(?:order|rank|sort|arrange|list|put|write)(?: these| the following)?(?: numbers| values| fractions| decimals)?(?: from)? (?<from>least|smallest|lowest|largest|greatest|biggest|highest) to (?<to>greatest|largest|biggest|highest|smallest|least|lowest):? (?<list>.+)$/i,
  /^(?:order|rank|sort|arrange|put|write)(?: these| the following)?(?: numbers| values| fractions| decimals)? in (?<dir>ascending|descending|increasing|decreasing) order:? (?<list>.+)$/i,
];
const ORDER_UP = new Set(['least', 'smallest', 'lowest']);
const dimOk = (dims, d) => !dims || dims.includes(d);
const same = (ops) => ops.every((o) => o.dim === ops[0].dim);

function readComparison(t) {
  if (!/\b(?:which|is|of|order|rank|sort|arrange|list|put|write|find|name|give|does|do)\b/i.test(t) || /§/.test(t)) return null;
  const f = bare(t);
  for (const re of CHOOSE_FRAMES) {
    const m = re.exec(f);
    if (!m) continue;
    const g = m.groups;
    const a = parseOperand(g.a), b = parseOperand(g.b);
    if (!a || !b || a.dim !== b.dim) continue;
    const [dir, dims] = g.vp ? VERB_ADJ[g.vp.toLowerCase()] : ADJ[g.adj.toLowerCase()];
    if (!dimOk(dims, a.dim) || (g.noun && !dimOk(NOUN_DIM[g.noun.toLowerCase()], a.dim))) return null;
    const c = E.qCmp(a.v, b.v);
    const how = 'compared ' + a.text + ' and ' + b.text + ' as exact ' + (a.dim === 'num' ? 'rationals' : a.dim === 'temp' ? 'temperatures in degrees Celsius' : a.dim + ' in one unit');
    if (c === 0) return out('comparison', 'neither: they are the same', [how, 'they are equal']);
    return out('comparison', (c * dir > 0 ? a : b).text, [how]);
  }
  for (const re of YESNO_FRAMES) {
    const m = re.exec(f);
    if (!m) continue;
    const g = m.groups;
    const a = parseOperand(g.a), b = parseOperand(g.b);
    if (!a || !b || a.dim !== b.dim) continue;
    const c = E.qCmp(a.v, b.v);
    if (g.eq) return out('comparison', c === 0 ? 'yes' : 'no', ['compared ' + a.text + ' and ' + b.text + ' as exact values']);
    const [dir, dims] = g.vp ? VERB_ADJ[g.vp.toLowerCase()] : ADJ[g.adj.toLowerCase()];
    if (!dimOk(dims, a.dim)) return null;
    return out('comparison', c * dir > 0 ? 'yes' : 'no', ['compared ' + a.text + ' and ' + b.text + ' as exact values' + (c === 0 ? ': they are equal, so neither is ' + (g.adj || g.vp).toLowerCase() : '')]);
  }
  for (const re of EXTREME_FRAMES) {
    const m = re.exec(f);
    if (!m) continue;
    const items = splitList(m.groups.list);
    if (!items) return null;
    const ops = items.map(parseOperand);
    if (ops.some((o) => !o) || !same(ops)) return null;
    const dir = SUP[m.groups.sup.toLowerCase()];
    let best = ops[0];
    for (const o of ops) if (E.qCmp(o.v, best.v) * dir > 0) best = o;
    if (ops.some((o) => E.qEq(o.v, best.v) && o.text !== best.text)) return null;
    return out('comparison', best.text, [items.length + ' values compared as exact rationals; the ' + m.groups.sup.toLowerCase() + ' is ' + best.text]);
  }
  for (const re of ORDER_FRAMES) {
    const m = re.exec(f);
    if (!m) continue;
    const g = m.groups;
    let up;
    if (g.dir) up = /^(?:ascending|increasing)$/i.test(g.dir);
    else { const a = ORDER_UP.has(g.from.toLowerCase()), b = ORDER_UP.has(g.to.toLowerCase()); if (a === b) return null; up = a; }
    const items = splitList(g.list);
    if (!items) return null;
    const ops = items.map(parseOperand);
    if (ops.some((o) => !o) || !same(ops)) return null;
    for (let i = 0; i < ops.length; i++) for (let j = i + 1; j < ops.length; j++) if (E.qEq(ops[i].v, ops[j].v) && ops[i].text !== ops[j].text) return null;
    const sorted = [...ops].sort((x, y) => E.qCmp(x.v, y.v) * (up ? 1 : -1));
    return out('comparison', sorted.map((o) => o.text).join(', '), [items.length + ' values compared as exact rationals and put in ' + (up ? 'increasing' : 'decreasing') + ' order']);
  }
  return null;
}

// ================================================================ PROBABILITY
const FAIR = '(?:fair|unbiased)';
const SIDED = '(?:(?<s>[a-z0-9]+)-sided )?';
const CONTAINERS = '(?:bag|box|jar|urn|bowl|basket|drawer|hat|pot|tin|pouch|sack)';
const sidesOf = (s) => { if (s === undefined) return 6; const n = countOf(s); return n !== null && n >= 2n && n <= BigInt(KIND_CAPS.sides) ? Number(n) : null; };
const singular = (w) => (/(?:ch|sh|x|z|ss)es$/.test(w) ? w.slice(0, -2) : /ies$/.test(w) && w.length > 4 ? w.slice(0, -3) + 'y' : /[^s]s$/.test(w) ? w.slice(0, -1) : w);

/** One clause that sets up the experiment: a coin, dice, a container of coloured things, a spinner, a draw. */
function probClause(c) {
  let m;
  if ((m = new RegExp('^(?:you )?(?:flip|toss) (?:a|one) ' + FAIR + ' coin(?: (?<n>\\S+) times| (?<o>once|twice))?$').exec(c)) || (m = new RegExp('^(?:a|one) ' + FAIR + ' coin is (?:flipped|tossed)(?: (?<n>\\S+) times| (?<o>once|twice))?$').exec(c))) {
    const n = countOf(m.groups.n || m.groups.o || '1'); return n && n <= BigInt(KIND_CAPS.coins) ? { kind: 'coin', n: Number(n) } : null;
  }
  if ((m = new RegExp('^(?<n>\\S+) ' + FAIR + ' coins are (?:flipped|tossed)(?: together| at once| at the same time)?$').exec(c)) || (m = new RegExp('^(?:you )?(?:flip|toss) (?<n>\\S+) ' + FAIR + ' coins$').exec(c))) {
    const n = countOf(m.groups.n); return n && n >= 2n && n <= BigInt(KIND_CAPS.coins) ? { kind: 'coin', n: Number(n) } : null;
  }
  if ((m = new RegExp('^(?:a|one) ' + FAIR + ' ' + SIDED + 'die is (?:rolled|thrown|tossed)(?: once)?$').exec(c)) || (m = new RegExp('^(?:you )?(?:roll|throw) (?:a|one) ' + FAIR + ' ' + SIDED + 'die(?: once)?$').exec(c))) {
    const s = sidesOf(m.groups.s); return s ? { kind: 'dice', n: 1, s } : null;
  }
  if ((m = new RegExp('^(?<n>\\S+) ' + FAIR + ' ' + SIDED + 'dice are (?:rolled|thrown)(?: together| at once)?$').exec(c)) || (m = new RegExp('^(?:you )?(?:roll|throw) (?<n>\\S+) ' + FAIR + ' ' + SIDED + 'dice$').exec(c))) {
    const s = sidesOf(m.groups.s), n = countOf(m.groups.n); return s && n === 2n ? { kind: 'dice', n: 2, s } : null;
  }
  if ((m = new RegExp('^(?:a|an|the) ' + CONTAINERS + ' (?:has|holds|contains|is filled with) (?<counts>.+)$').exec(c))) {
    const items = splitList(m.groups.counts);
    if (!items) return null;
    const colors = new Map(); let noun = null;
    for (let i = 0; i < items.length; i++) {
      const it = /^(?<n>\S+) (?<c>[a-z]+)(?: (?<noun>[a-z]+))?$/.exec(items[i]);
      if (!it) return null;
      const n = countOf(it.groups.n);
      if (n === null || colors.has(it.groups.c)) return null;
      if (it.groups.noun) { if (noun && singular(noun) !== singular(it.groups.noun)) return null; if (!noun || singular(it.groups.noun) !== it.groups.noun) noun = it.groups.noun; }   // "1 red ball and 3 blue balls": one noun, either number
      else if (i === items.length - 1) return null;
      colors.set(it.groups.c, n);
    }
    if (!noun) return null;
    const total = [...colors.values()].reduce((a, b) => a + b, 0n);
    return total > 0n ? { kind: 'urn', colors, noun: singular(noun), nouns: singular(noun) === noun ? noun + 's' : noun, total, draws: 1, replace: null } : null;
  }
  if ((m = new RegExp('^(?:if )?(?<n>one|a|an|two|\\d+) (?<noun>[a-z]+) (?:is|are) (?:picked|drawn|chosen|taken|selected|pulled out|removed)(?: out)?(?: at random)?(?: from the ' + CONTAINERS + ')?(?:,? (?<rep>with|without) replacement)?(?: at random)?$').exec(c))) {
    const n = countOf(m.groups.n); return n && n <= 2n ? { kind: 'draw', n: Number(n), noun: singular(m.groups.noun), replace: m.groups.rep ? m.groups.rep === 'with' : null } : null;
  }
  // board 35 (readers-2): "you pick one at random" (the thing the container holds), cards numbered 1 to N, a letter of a word
  if ((m = new RegExp('^(?:you )?(?:pick|draw|choose|take|select|pull out) (?:one|(?:a|an|one) (?<noun>[a-z]+))(?: out)?(?: at random)?(?: from the ' + CONTAINERS + ')?(?: at random)?$').exec(c))) return { kind: 'draw', n: 1, noun: m.groups.noun ? singular(m.groups.noun) : null, replace: null };
  if ((m = /^(?<k>cards|tickets|tiles|chips|slips|discs|counters) numbered (?:from )?1 (?:to|through) (?<m>\d+) are (?:shuffled|mixed|mixed up|placed in a [a-z]+|put in a [a-z]+) and one is (?:drawn|picked|chosen|selected|taken|pulled out)(?: at random)?$/.exec(c))) {
    const n = BigInt(m.groups.m); return n >= 2n && n <= 10000n ? { kind: 'dice', n: 1, s: Number(n), numbered: m.groups.k } : null;
  }
  if ((m = /^(?:(?:a|one) letter is (?:picked|chosen|drawn|selected|taken)(?: at random)?|(?:you )?(?:pick|choose|draw|select|take) (?:a|one) letter(?: at random)?) from the word (?<q>['"]?)(?<w>[a-z]+)\k<q>(?: at random)?$/.exec(c))) {
    return m.groups.w.length <= KIND_CAPS.stringChars ? { kind: 'letters', word: m.groups.w } : null;
  }
  if ((m = /^a spinner has (?<n>\S+) equal (?:sections|parts|sectors|segments|regions) numbered (?:from )?1 to (?<m>\d+)$/.exec(c))) {
    const n = countOf(m.groups.n); return n && n >= 2n && n <= 100n && n === BigInt(m.groups.m) ? { kind: 'dice', n: 1, s: Number(n), spinner: true } : null;
  }
  return null;
}
function merge(exp, c) {
  if (!c) return null;
  if (c.kind === 'draw') { if (!exp || exp.kind !== 'urn' || exp.drawSet || (c.noun !== null && c.noun !== exp.noun)) return null; return { ...exp, draws: c.n, replace: c.replace, drawSet: true }; }
  return exp ? null : c;
}
const PRIMES = (s) => { const out2 = []; for (let x = 2; x <= s; x++) { let p = true; for (let d = 2; d * d <= x; d++) if (x % d === 0) { p = false; break; } if (p) out2.push(x); } return out2; };
/** The outcome values an event keeps, for one die or the total of two, or null when the words are not a rule. */
function predicate(p, lo, hi) {
  let m;
  const all = []; for (let x = lo; x <= hi; x++) all.push(x);
  if ((m = /^(?:a |an )?(\d+|[a-z]+(?:-[a-z]+)?)$/.exec(p)) && countOf(m[1]) !== null && !/^(?:a|an|once|twice)$/.test(m[1])) { const v = Number(countOf(m[1])); return { keep: all.filter((x) => x === v), how: 'the value ' + v }; }
  if ((m = /^(?:an? )?(even|odd|prime) number$/.exec(p))) {
    const pr = PRIMES(hi);
    return { keep: all.filter((x) => (m[1] === 'even' ? x % 2 === 0 : m[1] === 'odd' ? x % 2 === 1 : pr.includes(x))), how: 'the ' + m[1] + ' values' };
  }
  if ((m = /^(?:a number |a value |a score |a result )?(?:that is )?(greater|more|higher|bigger|larger|less|lower|smaller|fewer) than (\S+)$/.exec(p))) {
    const v = countOf(m[2]); if (v === null) return null;
    const up = /^(?:greater|more|higher|bigger|larger)$/.test(m[1]);
    return { keep: all.filter((x) => (up ? x > Number(v) : x < Number(v))), how: 'the values ' + (up ? 'above ' : 'below ') + v };
  }
  if ((m = /^(?:a number |a value )?(?:of )?(at least|at most|no more than|no less than) (\S+)$/.exec(p))) {
    const v = countOf(m[2]); if (v === null) return null;
    const up = m[1] === 'at least' || m[1] === 'no less than';
    return { keep: all.filter((x) => (up ? x >= Number(v) : x <= Number(v))), how: 'the values ' + m[1] + ' ' + v };
  }
  if ((m = /^a multiple of (\S+)$/.exec(p))) { const v = countOf(m[1]); if (!v) return null; return { keep: all.filter((x) => x % Number(v) === 0), how: 'the multiples of ' + v }; }
  return null;
}
const binom = (n, k) => { if (k < 0 || k > n) return 0n; let r = 1n; for (let i = 1; i <= k; i++) r = (r * BigInt(n - k + i)) / BigInt(i); return r; };

/** The probability of an event under an experiment, exact, or null. */
function probability(exp, ev) {
  let m;
  const pre = (s) => s.replace(/^(?:getting |rolling |throwing |scoring |obtaining |landing on |landing |drawing |picking |choosing |selecting |taking |pulling out |pulling |flipping |tossing |spinning )/, '');
  if (exp.kind === 'coin') {
    const n = exp.n;
    const e = pre(ev).replace(/^(?:it lands on |it lands |the coin lands on |the coin lands |it comes up |it shows )/, '');
    const face = (w) => (/^(?:heads|head)$/.test(w) ? 'heads' : /^(?:tails|tail)$/.test(w) ? 'tails' : null);
    let k = null;
    if (n === 1 && (m = /^(?:a |an )?(heads|tails|head|tail)$/.exec(e))) return { p: E.Q(1n, 2n), how: 'one fair coin: 1 of 2 faces' };
    if ((m = /^(exactly|at least|at most|more than|fewer than|less than|no more than|no fewer than) (\S+) (heads|tails|head|tail)$/.exec(e))) {
      k = countOf(m[2]); if (k === null || !face(m[3])) return null;
      const K = Number(k), rel = m[1];
      const ok = (j) => (rel === 'exactly' ? j === K : rel === 'at least' || rel === 'no fewer than' ? j >= K : rel === 'at most' || rel === 'no more than' ? j <= K : rel === 'more than' ? j > K : j < K);
      let num = 0n; for (let j = 0; j <= n; j++) if (ok(j)) num += binom(n, j);
      return { p: E.Q(num, 2n ** BigInt(n)), how: n + ' fair coins: ' + num + ' of the 2^' + n + ' equally likely outcomes have ' + rel + ' ' + K + ' ' + face(m[3]) + ' (binomial counts)' };
    }
    if ((m = /^(?:they |the coins )?(all|both) (?:coins |of them )?(?:land |landing |show |showing |come up |coming up |are |being )?(?:on )?(heads|tails)$/.exec(e))) {
      if (m[1] === 'both' && n !== 2) return null;
      return { p: E.Q(1n, 2n ** BigInt(n)), how: n + ' fair coins: 1 of the 2^' + n + ' outcomes is all ' + m[2] };
    }
    if ((m = /^(?:no|zero) (heads|tails)$/.exec(e))) return { p: E.Q(1n, 2n ** BigInt(n)), how: n + ' fair coins: 1 of the 2^' + n + ' outcomes has no ' + m[1] };
    return null;
  }
  if (exp.kind === 'dice') {
    const s = exp.s;
    if (exp.n === 1) {
      const e = pre(ev).replace(/^(?:the result is |the number rolled is |the number shown is |the number is |the score is |the die shows |it shows |it lands on |it is |the spinner lands on )/, '');
      const r = predicate(e, 1, s);
      if (!r) return null;
      return { p: E.Q(BigInt(r.keep.length), BigInt(s)), how: (exp.spinner ? 'a spinner of ' + s + ' equal sections' : exp.numbered ? exp.numbered + ' numbered 1 to ' + s + ', one drawn' : 'one fair ' + s + '-sided die') + ': ' + r.how + ' are ' + (r.keep.join(', ') || 'none') + ', ' + r.keep.length + ' of ' + s };
    }
    let e = pre(ev);
    if (/^(?:a )?doubles?$/.test(e)) return { p: E.Q(1n, BigInt(s)), how: 'two fair ' + s + '-sided dice: ' + s + ' doubles of ' + s * s + ' outcomes' };
    if ((m = /^(?:the (?:total|sum)(?: of the (?:two )?(?:dice|numbers|scores))? is |a (?:total|sum) of )(.+)$/.exec(e))) {
      e = m[1].startsWith('a ') || /^\d/.test(m[1]) || /^(?:even|odd|prime|greater|more|higher|bigger|larger|less|lower|smaller|at|no)\b/.test(m[1]) ? m[1] : null;
      if (!e) return null;
      const r = predicate(e, 2, 2 * s);
      if (!r) return null;
      let num = 0; for (let a = 1; a <= s; a++) for (let b = 1; b <= s; b++) if (r.keep.includes(a + b)) num++;
      return { p: E.Q(BigInt(num), BigInt(s * s)), how: 'two fair ' + s + '-sided dice: ' + num + ' of ' + s * s + ' equally likely outcomes have a total in ' + r.how };
    }
    return null;
  }
  if (exp.kind === 'urn') {
    const nounOk = (w) => !w || w === exp.noun || w === exp.nouns;
    const colorP = (c) => (exp.colors.has(c) ? E.Q(exp.colors.get(c), exp.total) : null);
    if (exp.draws === 1) {
      let neg = false, e = ev;
      if ((m = /^not (.+)$/.exec(e))) { neg = true; e = m[1]; }
      e = pre(e);
      let c = null;
      if ((m = /^(?:a|an|one) ([a-z]+)(?: ([a-z]+))?$/.exec(e)) && nounOk(m[2])) c = m[1];
      else if ((m = /^(?:it|the ([a-z]+))(?: is|'s) (not )?([a-z]+)$/.exec(e)) && nounOk(m[1])) { c = m[3]; if (m[2]) neg = !neg; }
      if (!c) return null;
      const p = colorP(c);
      if (!p) return null;
      return { p: neg ? E.qSub(E.Q1, p) : p, how: exp.colors.get(c) + ' ' + c + ' of ' + exp.total + ' ' + exp.nouns + (neg ? ', and the event is the other ' + (exp.total - exp.colors.get(c)) : '') };
    }
    if (exp.draws === 2 && exp.replace !== null) {
      let c = null;
      if ((m = /^both (?:of them |the ([a-z]+) )?(?:are |is )?([a-z]+)$/.exec(ev)) && nounOk(m[1])) c = m[2];
      else if ((m = /^(?:drawing |picking |getting |choosing )?two ([a-z]+)(?: ([a-z]+))?$/.exec(ev)) && nounOk(m[2])) c = m[1];
      if (!c || !exp.colors.has(c)) return null;
      const k = exp.colors.get(c), T = exp.total;
      if (exp.replace) return { p: E.qMul(E.Q(k, T), E.Q(k, T)), how: k + '/' + T + ' twice, with replacement' };
      if (T < 2n) return null;
      return { p: E.qMul(E.Q(k, T), E.Q(k > 0n ? k - 1n : 0n, T - 1n)), how: k + '/' + T + ' then ' + (k > 0n ? k - 1n : 0n) + '/' + (T - 1n) + ', without replacement' };
    }
    return null;
  }
  if (exp.kind === 'letters') {   // board 35 (readers-2): one letter of a word, each position equally likely
    const w = exp.word;
    const e = pre(ev).replace(/^(?:it is |it's |the letter (?:picked |chosen |drawn |selected )?is |the (?:picked|chosen|drawn|selected) letter is )/, '');
    if ((m = /^(?:the letter |an? )?(?<q>['"]?)(?<c>[a-z])\k<q>$/.exec(e))) {
      const k = [...w].filter((x) => x === m.groups.c).length;
      return { p: E.Q(BigInt(k), BigInt(w.length)), how: '"' + m.groups.c + '" is ' + k + ' of the ' + w.length + ' letters of "' + w + '"' };
    }
    if (/^a vowel$/.test(e) && !w.includes('y')) {
      const k = [...w].filter((x) => 'aeiou'.includes(x)).length;
      return { p: E.Q(BigInt(k), BigInt(w.length)), how: k + ' of the ' + w.length + ' letters of "' + w + '" are a, e, i, o or u' };
    }
    return null;
  }
  if (exp.kind === 'deck') {
    const e = pre(ev);
    const RANKS = ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'jack', 'queen', 'king'];
    const SUITS = { heart: 'hearts', spade: 'spades', club: 'clubs', diamond: 'diamonds' };
    if ((m = /^(?:a|an|the) (heart|spade|club|diamond)$/.exec(e))) return { p: E.Q(13n, 52n), how: '13 ' + SUITS[m[1]] + ' in 52 cards' };
    if ((m = /^(?:a|an) (ace|king|queen|jack)$/.exec(e))) return { p: E.Q(4n, 52n), how: '4 of each rank in 52 cards' };
    if ((m = /^(?:a|an) (red|black) card$/.exec(e))) return { p: E.Q(26n, 52n), how: '26 ' + m[1] + ' cards in 52' };
    if ((m = /^(?:a|an) (?:face|picture|court) card$/.exec(e))) return { p: E.Q(12n, 52n), how: 'jack, queen and king of four suits: 12 of 52' };
    if ((m = /^(?:the |an |a )?([a-z]+|\d+) of (hearts|spades|clubs|diamonds)$/.exec(e))) {
      const r = /^\d+$/.test(m[1]) ? Number(m[1]) : RANKS.indexOf(m[1]) + 1;
      return r >= 1 && r <= 13 && !(r === 1 && /^\d/.test(m[1])) ? { p: E.Q(1n, 52n), how: 'one card of 52' } : null;
    }
    return null;
  }
  return null;
}
const EMBEDDED = [
  [new RegExp('^(?<e>.+?) (?:on|with|using|when rolling|if you roll|when you roll) (?:a|one) ' + FAIR + ' ' + SIDED + 'die$'), (g) => { const s = sidesOf(g.s); return s ? { kind: 'dice', n: 1, s } : null; }],
  [new RegExp('^(?<e>.+?) (?:when|if) (?:tossing|flipping|you toss|you flip) (?:a|one) ' + FAIR + ' coin$'), () => ({ kind: 'coin', n: 1 })],
  [/^(?<e>.+?) from (?:a|an) (?:(?:standard|normal|regular|ordinary|well-shuffled|shuffled|full) )*(?:52-card |52 card )?(?:deck|pack)(?: of (?:52 )?(?:playing )?cards)?$/, (g, whole) => (/standard|52/.test(whole) ? { kind: 'deck' } : null)],
];
const PQ_FRAMES = [
  /^(?:(?<if>if .+?),? )?(?:what is|what's|find|calculate|work out|determine) the (?:probability|chance|likelihood)(?: of| that)? (?<ev>.+?)(?:,? (?:as|in the form of|expressed as|written as) (?:a |an )?(?<fmt>fraction|decimal|percentage|percent))?$/,
  /^(?:(?<if>if .+?),? )?what are the chances(?: of| that)? (?<ev>.+?)(?:,? (?:as|in the form of|expressed as) (?:a |an )?(?<fmt>fraction|decimal|percentage|percent))?$/,
];
const PFMT_RE = /^(?:give|express|write|state|present|leave)(?: it| the answer| your answer| the probability| this| the result)?(?: as| in the form of| in)? (?:a |an )?(?<fmt>fraction|decimal|percentage|percent)(?: form)?(?:(?<=fraction) in (?:its )?(?:lowest|simplest) (?:terms|form))?$/;

function readProbability(t) {
  if (!/\b(?:probability|chances?|likelihood)\b/i.test(t) || /\bodds\b/i.test(t)) return null;
  const ss = sentencesOf(t).map((s) => bare(s).toLowerCase());
  if (ss.length > 5) return null;
  let exp = null, fmt = null, q = null;
  for (const s of ss) {
    const pf = PFMT_RE.exec(s);
    if (pf) { if (fmt) return null; fmt = pf.groups.fmt; continue; }
    let m = null;
    for (const re of PQ_FRAMES) { m = re.exec(s); if (m) break; }
    if (m) { if (q) return null; q = m.groups; continue; }
    exp = merge(exp, probClause(s));
    if (!exp) return null;
  }
  if (!q) return null;
  if (q.if) { exp = merge(exp, probClause(q.if.replace(/^if /, ''))); if (!exp) return null; }
  if (q.fmt) { if (fmt) return null; fmt = q.fmt; }
  let ev = q.ev;
  for (const [re, make] of EMBEDDED) {
    const m = re.exec(ev);
    if (!m) continue;
    const e2 = make(m.groups, ev);
    if (!e2) return null;
    exp = merge(exp, e2);
    if (!exp) return null;
    ev = m.groups.e;
    break;
  }
  if (!exp || (exp.kind === 'urn' && exp.draws === 2 && exp.replace === null)) return null;
  const r = probability(exp, ev);
  if (!r) return null;
  let answer;
  if (!fmt || fmt === 'fraction') answer = E.qToString(r.p);
  else if (fmt === 'decimal') { answer = E.qToDecimal(r.p); if (answer === null) return null; }
  else { const d = E.qToDecimal(E.qMul(r.p, qInt(100))); if (d === null) return null; answer = d + '%'; }
  return out('probability', answer, [r.how, 'the probability is ' + E.qToString(r.p) + ', exact' + (fmt && fmt !== 'fraction' ? ', printed as a ' + fmt : '')]);
}

// ================================================================ GEOMETRY
const LEN_UNITS = '(?:mm|cm|m|km|in|inches|inch|ft|feet|foot|metres|meters|metre|meter|centimetres|centimeters|centimetre|centimeter|millimetres|millimeters|kilometres|kilometers|units?|yards?|yd)';
const LEN_UNIT_BASE = { mm: 'mm', millimetres: 'mm', millimeters: 'mm', cm: 'cm', centimetres: 'cm', centimeters: 'cm', centimetre: 'cm', centimeter: 'cm', m: 'm', metres: 'm', meters: 'm', metre: 'm', meter: 'm', km: 'km', kilometres: 'km', kilometers: 'km', in: 'in', inches: 'in', inch: 'in', ft: 'ft', feet: 'ft', foot: 'ft', unit: 'unit', units: 'unit', yard: 'yd', yards: 'yd', yd: 'yd' };
const VAL_SRC = '(?:\\d+(?:\\.\\d+)?|' + SMALL.slice(1).join('|') + ')(?: ?(?:square |sq |cubic )?' + LEN_UNITS + '(?:\\u00B2|\\u00B3|\\^2|\\^3)?)?';
function parseVal(s, units) {
  const m = new RegExp('^(\\d+(?:\\.\\d+)?|[a-z]+) ?(?:(?:square |sq |cubic )?(' + LEN_UNITS + ')(?:\\u00B2|\\u00B3|\\^2|\\^3)?)?$').exec(String(s).trim());
  if (!m) return null;
  const v = numQ(m[1]);
  if (!v || v.n <= 0n) return null;
  if (m[2]) units.add(LEN_UNIT_BASE[m[2]]);
  return v;
}
const SHAPE_SRC = '(?<shape>right(?:-| )(?:angled )?triangle|rectangular (?:prism|box)|square|rectangle|oblong|triangle|circle|cube|cuboid|box)';
const shapeKey = (s) => { const w = s.toLowerCase(); return /^right/.test(w) ? 'right' : /^(?:rectangular|cuboid|box)/.test(w) ? 'box' : w === 'oblong' ? 'rectangle' : w; };
const PROP_KEY = { side: 'side', sides: 'side', 'side length': 'side', edge: 'side', edges: 'side', 'edge length': 'side', length: 'length', width: 'width', breadth: 'width', height: 'height', base: 'base', radius: 'radius', diameter: 'diameter', area: 'area', perimeter: 'perimeter', circumference: 'circumference', volume: 'volume', hypotenuse: 'hyp' };
const PROP_SRC = '(?:side length|edge length|sides?|edges?|length|width|breadth|height|base|radius|diameter|area|perimeter|circumference|volume|hypotenuse)';

/** "base 10 and height 6", "sides of 9", "an area of 48 and a width of 6", "legs of 6 and 8": properties, or null. */
function parseProps(s, units) {
  const P = {};
  let rest = s;
  const legs = new RegExp('(?:^|,? and |, )legs (?:of |measuring )?(' + VAL_SRC + ') and (' + VAL_SRC + ')').exec(rest);
  if (legs) { const a = parseVal(legs[1], units), b = parseVal(legs[2], units); if (!a || !b) return null; P.legs = [a, b]; rest = (rest.slice(0, legs.index) + rest.slice(legs.index + legs[0].length)).trim(); }
  if (rest) {
    for (const part of rest.split(/,? and |, /)) {
      const m = new RegExp('^(?:a |an |the )?(' + PROP_SRC + ')(?: of| is| =| measuring| equal to)? (' + VAL_SRC + ')$').exec(part);
      if (!m) return null;
      const k = PROP_KEY[m[1]], v = parseVal(m[2], units);
      if (!v || P[k]) return null;
      P[k] = v;
    }
  }
  return P;
}
/** A shape description: "a rectangle that is 6 by 4", "a square with sides of 9", "a circle with radius 5". */
function parseDesc(s, units) {
  let m = new RegExp('^(?:a|an|the) (?:regular )?' + SHAPE_SRC + '$').exec(s);
  if (m) return { shape: shapeKey(m.groups.shape), P: {} };
  m = new RegExp('^(?:a|an|the) ' + SHAPE_SRC + ' (?:that is|which is|measuring|measures|is|of) (' + VAL_SRC + ') (?:by|x|×) (' + VAL_SRC + ')$').exec(s);
  if (m) { const a = parseVal(m[2], units), b = parseVal(m[3], units); return a && b ? { shape: shapeKey(m.groups.shape), P: { a, b } } : null; }
  m = new RegExp('^(?:a|an|the) ' + SHAPE_SRC + ' (?:with|that has|which has|having|has) (.+)$').exec(s);
  if (m) { const P = parseProps(m[2], units); return P ? { shape: shapeKey(m.groups.shape), P } : null; }
  m = new RegExp('^(?:a|an|the) ' + SHAPE_SRC + ' whose (' + PROP_SRC + ') is (' + VAL_SRC + ')$').exec(s);
  if (m) { const v = parseVal(m[3], units); return v ? { shape: shapeKey(m.groups.shape), P: { [PROP_KEY[m[2]]]: v } } : null; }
  m = new RegExp('^(?:a|an|the) ' + SHAPE_SRC + ' of side (' + VAL_SRC + ')$').exec(s);
  if (m) { const v = parseVal(m[2], units); return v ? { shape: shapeKey(m.groups.shape), P: { side: v } } : null; }
  return null;
}
const piStr = (k) => (k.d === 1n ? k.n.toString() : '(' + E.qToString(k) + ')') + 'π';
const sq = (x) => E.qMul(x, x);
/** The asked measure of the shape, as { value (a string), how }, or null. */
function measure(shape, P, target) {
  const two = qInt(2), four = qInt(4);
  const give = (v, how) => (v ? { v: fmtNum(v), how } : null);
  if (shape === 'square') {
    let s = P.side || P.a || P.length || null;
    if (P.a && P.b && !E.qEq(P.a, P.b)) return null;
    if (!s && P.area) s = sqrtQ(P.area);
    if (!s && P.perimeter) s = E.qDiv(P.perimeter, four);
    if (!s) return null;
    if (P.area && !E.qEq(P.area, sq(s))) return null;
    if (target === 'area') return give(sq(s), 'side ' + fmtNum(s) + ', area = side x side');
    if (target === 'perimeter') return give(E.qMul(four, s), 'side ' + fmtNum(s) + ', perimeter = 4 x side');
    if (target === 'side' || target === 'length') return give(s, 'side ' + fmtNum(s));
    return null;
  }
  if (shape === 'rectangle') {
    let L = P.length || P.a || null, W = P.width || P.b || null;
    if (!L && W && P.area) L = E.qDiv(P.area, W);
    if (!W && L && P.area) W = E.qDiv(P.area, L);
    if (!L && W && P.perimeter) L = E.qSub(E.qDiv(P.perimeter, two), W);
    if (!W && L && P.perimeter) W = E.qSub(E.qDiv(P.perimeter, two), L);
    if (!L || !W || L.n <= 0n || W.n <= 0n) return null;
    if (target === 'area') return give(E.qMul(L, W), fmtNum(L) + ' by ' + fmtNum(W) + ', area = length x width');
    if (target === 'perimeter') return give(E.qMul(two, E.qAdd(L, W)), fmtNum(L) + ' by ' + fmtNum(W) + ', perimeter = 2 x (length + width)');
    if (target === 'length' && !P.a) return give(L, P.area ? 'length = area / width = ' + fmtNum(P.area) + ' / ' + fmtNum(W) : 'length ' + fmtNum(L));
    if (target === 'width' && !P.b) return give(W, P.area ? 'width = area / length' : 'width ' + fmtNum(W));
    if (target === 'diagonal') return give(sqrtQ(E.qAdd(sq(L), sq(W))), 'diagonal = sqrt(length^2 + width^2), exact only when it is rational');
    return null;
  }
  if (shape === 'triangle' || shape === 'right') {
    if (shape === 'right' && P.legs) {
      const [a, b] = P.legs;
      if (target === 'hyp') return give(sqrtQ(E.qAdd(sq(a), sq(b))), 'hypotenuse = sqrt(' + fmtNum(a) + '^2 + ' + fmtNum(b) + '^2) by Pythagoras, exact only when it is rational');
      if (target === 'area') return give(E.qDiv(E.qMul(a, b), two), 'area = leg x leg / 2');
      return null;
    }
    const b = P.base || null, h = P.height || null;
    if (target === 'area' && b && h) return give(E.qDiv(E.qMul(b, h), two), 'area = base x height / 2 = ' + fmtNum(b) + ' x ' + fmtNum(h) + ' / 2');
    if (target === 'height' && b && P.area && !h) return give(E.qDiv(E.qMul(two, P.area), b), 'height = 2 x area / base');
    if (target === 'base' && h && P.area && !b) return give(E.qDiv(E.qMul(two, P.area), h), 'base = 2 x area / height');
    return null;
  }
  if (shape === 'circle') {
    let r = P.radius || null;
    if (P.diameter) { const r2 = E.qDiv(P.diameter, two); if (r && !E.qEq(r, r2)) return null; r = r2; }
    if (!r) return null;
    if (target === 'area') return { v: piStr(sq(r)), how: 'area = pi r^2 with r = ' + fmtNum(r) + ', pi kept exact as a symbol' };
    if (target === 'circumference' || target === 'perimeter') return { v: piStr(E.qMul(two, r)), how: 'circumference = 2 pi r with r = ' + fmtNum(r) + ', pi kept exact as a symbol' };
    if (target === 'diameter') return give(E.qMul(two, r), 'diameter = 2 x radius');
    if (target === 'radius') return give(r, 'radius = diameter / 2');
    return null;
  }
  if (shape === 'cube') {
    const s = P.side || null;
    if (!s) return null;
    if (target === 'volume') return give(E.qMul(s, sq(s)), 'volume = edge^3');
    if (target === 'surface') return give(E.qMul(qInt(6), sq(s)), 'surface area = 6 x edge^2');
    return null;
  }
  if (shape === 'box') {
    const l = P.length, w = P.width, h = P.height;
    if (!l || !w || !h) return null;
    if (target === 'volume') return give(E.qMul(E.qMul(l, w), h), 'volume = length x width x height');
    return null;
  }
  return null;
}
const ANGLES = { 'right angle': 90, 'straight angle': 180, 'straight line': 180, 'full turn': 360, 'full circle': 360, circle: 360, 'complete turn': 360, 'full rotation': 360, 'complete rotation': 360, revolution: 360, 'half turn': 180, 'quarter turn': 90, 'full angle': 360, 'complete angle': 360 };
const ANGLE_SRC = '(?<ang>' + Object.keys(ANGLES).sort((a, b) => b.length - a.length).join('|') + ')';
const TARGET_SRC = '(?<t>surface area|side length|area|perimeter|circumference|volume|length|width|height|base|side|hypotenuse|diagonal|radius|diameter)';
const TARGET_KEY = { 'surface area': 'surface', 'side length': 'side', hypotenuse: 'hyp' };

function geometryQuestion(q, setup, units) {
  let m;
  if ((m = new RegExp('^how many degrees (?:are there |are |is )?in (?:a|an) ' + ANGLE_SRC + '$').exec(q)) || (m = new RegExp('^what is the (?:measure|size) of (?:a|an) ' + ANGLE_SRC + '(?: in degrees)?$').exec(q)) || (m = new RegExp('^how many degrees (?:is|make) (?:a|an) ' + ANGLE_SRC + '$').exec(q))) {
    return { v: String(ANGLES[m.groups.ang]), how: 'a ' + m.groups.ang + ' is ' + ANGLES[m.groups.ang] + ' degrees by definition' };
  }
  if ((m = /^what is the sum of the (?:interior |internal )?angles (?:of|in) (?:a|an|any) (?<p>[a-z]+)$/.exec(q)) || (m = /^how many degrees do the (?:interior |internal )?angles (?:of|in) (?:a|an|any) (?<p>[a-z]+) (?:add up to|sum to|total)$/.exec(q))) {
    const n = POLY[m.groups.p]; if (!n) return null;
    return { v: String((n - 2) * 180), how: 'a ' + m.groups.p + ' has ' + n + ' sides; its angles sum to (n - 2) x 180' };
  }
  if ((m = /^how (?:big|large) is each (?:interior )?angle (?:of|in) (?:a|an) regular (?<p>[a-z]+)$/.exec(q)) || (m = /^what is (?:the (?:measure|size) of )?(?:each|one) (?:interior )?angle (?:of|in) (?:a|an) regular (?<p>[a-z]+)$/.exec(q)) || (m = /^what is the (?:measure of (?:each|one) |size of (?:each|one) )?interior angle of (?:a|an) regular (?<p>[a-z]+)$/.exec(q))) {
    const n = POLY[m.groups.p]; if (!n) return null;
    return { v: fmtNum(E.Q(BigInt((n - 2) * 180), BigInt(n))), how: 'a regular ' + m.groups.p + ': (n - 2) x 180 / n with n = ' + n };
  }
  if ((m = /^what is the third angle(?: of the triangle| in the triangle)?$/.exec(q))) {
    if (!setup || !setup.angles) return null;
    const [a, b] = setup.angles;
    const c = E.qSub(qInt(180), E.qAdd(a, b));
    return c.n > 0n ? { v: fmtNum(c), how: 'the angles of a triangle sum to 180: 180 - ' + fmtNum(a) + ' - ' + fmtNum(b) } : null;
  }
  if ((m = new RegExp('^(?:what is|what\'s|find|calculate|compute|work out|determine) (?:the|its) ' + TARGET_SRC + '(?: of (?<desc>.+?))?(?: in (?:terms of pi|degrees|square units|units|cubic units))?$').exec(q))) {
    let shape = null, P = null;
    if (m.groups.desc) { if (setup) return null; const d = parseDesc(m.groups.desc, units); if (!d) return null; shape = d.shape; P = d.P; }
    else { if (!setup || !setup.shape || !/^(?:what is|what's|find|calculate|compute|work out|determine) its /.test(q)) return null; shape = setup.shape; P = setup.P; }
    return measure(shape, P, TARGET_KEY[m.groups.t] || m.groups.t);
  }
  if ((m = /^how long is (?:it|the (?<t>hypotenuse|length|width|side|diagonal|base|height))$/.exec(q))) {
    if (!setup || !setup.shape) return null;
    const t = m.groups.t ? TARGET_KEY[m.groups.t] || m.groups.t : setup.shape === 'right' ? 'hyp' : setup.shape === 'square' ? 'side' : 'length';
    return measure(setup.shape, setup.P, t);
  }
  return null;
}

function readGeometry(t) {
  if (!/\b(?:area|perimeter|circumference|volume|angles?|degrees|hypotenuse|square|rectangle|triangle|circle|cube|cuboid|how long)\b/i.test(t)) return null;
  const ss = sentencesOf(t).map((s) => bare(s).toLowerCase());
  if (!ss.length || ss.length > 3) return null;
  const units = new Set();
  let setup = null, question = null;
  for (let i = 0; i < ss.length; i++) {
    const s = ss[i];
    if (/^(?:leave|give|write|express) (?:your|the) answer in terms of (?:pi|π)$/.test(s) && i > 0) continue;
    if (i === ss.length - 1 || (i === ss.length - 2 && /^(?:leave|give|write|express) (?:your|the) answer in terms of/.test(ss[ss.length - 1]))) { question = s; continue; }
    if (setup) return null;
    let m = /^two (?:of the )?angles (?:of|in) a triangle (?:are|measure) (\d+(?:\.\d+)?)(?: degrees|°)? and (\d+(?:\.\d+)?)(?: degrees|°)?$/.exec(s);
    if (m) { setup = { angles: [numQ(m[1]), numQ(m[2])] }; continue; }
    m = new RegExp('^(?:a|an|the) ' + SHAPE_SRC + ' (?:measures|is) (' + VAL_SRC + ') (?:by|x|×) (' + VAL_SRC + ')$').exec(s);
    if (m) { const a = parseVal(m[2], units), b = parseVal(m[3], units); if (!a || !b) return null; setup = { shape: shapeKey(m.groups.shape), P: { a, b } }; continue; }
    m = new RegExp('^(?:a|an|the) ' + SHAPE_SRC + ' has (.+)$').exec(s);
    if (m) { const P = parseProps(m[2], units); if (!P) return null; setup = { shape: shapeKey(m.groups.shape), P }; continue; }
    return null;
  }
  if (!question) return null;
  const r = geometryQuestion(question, setup, units);
  if (!r || units.size > 1) return null;
  return out('geometry', r.v, [r.how + (units.size ? ' (every length in ' + [...units][0] + ')' : '')]);
}

// ================================================================ LOGIC
const COMPARATIVES = { taller: ['height', 1], shorter: ['height|length', -1], older: ['age', 1], younger: ['age', -1], heavier: ['weight', 1], lighter: ['weight', -1], faster: ['speed', 1], slower: ['speed', -1], bigger: ['size', 1], larger: ['size', 1], smaller: ['size', -1], longer: ['length', 1], stronger: ['strength', 1], weaker: ['strength', -1], richer: ['wealth', 1], poorer: ['wealth', -1] };
const SUPERLATIVES = { tallest: ['height', 1], shortest: ['height|length', -1], oldest: ['age', 1], youngest: ['age', -1], heaviest: ['weight', 1], lightest: ['weight', -1], fastest: ['speed', 1], slowest: ['speed', -1], biggest: ['size', 1], largest: ['size', 1], smallest: ['size', -1], longest: ['length', 1], strongest: ['strength', 1], weakest: ['strength', -1], richest: ['wealth', 1], poorest: ['wealth', -1] };
const PRONOUNS = new Set(['it', 'he', 'she', 'they', 'this', 'that', 'there', 'we', 'you', 'i', 'what', 'who', 'which']);
const isName = (w) => /^[A-Z][a-z]+$/.test(w) && !PRONOUNS.has(w.toLowerCase());
// complementary pairs only: what is not wet is dry, what is not open is closed. The second word is read as the
// first with the polarity flipped. Not bright is not dark, so bright and dark are not here.
const ANTONYM = new Map([['dry', 'wet'], ['open', 'closed'], ['shut', 'closed'], ['off', 'on'], ['awake', 'asleep'], ['alive', 'dead'], ['false', 'true'], ['present', 'absent'], ['unlocked', 'locked'], ['invisible', 'visible']]);
const AUX = new Set(['is', 'are', 'was', 'were', 'am', 'be', 'been', 'does', 'do', 'did', 'will', 'then']);
const NEGW = new Set(['not', "isn't", "aren't", "wasn't", "weren't", "doesn't", "don't", "didn't", "won't"]);
const stemW = (w) => (/(?:ch|sh|x|z|ss|o)es$/.test(w) && w.length > 4 ? w.slice(0, -2) : /ies$/.test(w) && w.length > 4 ? w.slice(0, -3) + 'y' : w.length > 3 && /[^s]s$/.test(w) && !/(?:us|is)$/.test(w) ? w.slice(0, -1) : w);
/** A clause as a literal: its content words (auxiliaries dropped, a verb's -s stemmed, a complement read as its pair) and a polarity. */
function literal(clause) {
  const words = clause.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 12 || !words.every((w) => /^[a-z']+$/.test(w))) return null;
  let pol = true; const keep = [];
  for (const w of words) { if (NEGW.has(w)) { pol = !pol; continue; } if (AUX.has(w)) continue; if (w.includes("'")) return null; keep.push(w); }
  if (!keep.length) return null;
  const last = keep[keep.length - 1];
  if (ANTONYM.has(last)) { keep[keep.length - 1] = ANTONYM.get(last); pol = !pol; }
  return { key: keep.map(stemW).join(' '), pol, text: clause };
}
const SUBJ_START = new Set(['the', 'a', 'an', 'it', 'he', 'she', 'they', 'we', 'you', 'i', 'there', 'my', 'his', 'her', 'their', 'our', 'this', 'that']);
/** "it is raining the ground is wet": the one place a second clause can start, or null when there is not exactly one. */
function splitConditional(body) {
  const then = / then /i.exec(body);
  if (then) return [body.slice(0, then.index), body.slice(then.index + 6)];
  const ws = body.split(/\s+/);
  const cuts = [];
  for (let i = 2; i <= ws.length - 2; i++) if (SUBJ_START.has(ws[i].toLowerCase()) || isName(ws[i])) cuts.push(i);
  if (cuts.length !== 1) return null;
  return [ws.slice(0, cuts[0]).join(' '), ws.slice(cuts[0]).join(' ')];
}
const sing = (w) => singular(w.toLowerCase());

/** One simple premise: all / every / each / no / nothing that is, a named member, or a comparison of two names. */
function simplePremise(p) {
  let m;
  if ((m = /^(?:all|every|each|any) ([a-z]+) (?:are|is) (?:a |an )?([a-z]+)$/i.exec(p))) return { k: 'all', a: sing(m[1]), b: sing(m[2]) };
  if ((m = /^no ([a-z]+) (?:are|is) (?:a |an )?([a-z]+)$/i.exec(p)) || (m = /^nothing that is (?:a |an )?([a-z]+) is (?:a |an )?([a-z]+)$/i.exec(p))) return { k: 'none', a: sing(m[1]), b: sing(m[2]) };
  if ((m = /^([A-Za-z][a-z]+) (?:is (not )?|isn't )(?:a|an) ([a-z]+)$/.exec(p)) && isName(cap1(m[1])) && /^[A-Z]/.test(m[1])) return { k: 'member', x: m[1], neg: !!m[2] || /isn't/.test(p), a: sing(m[3]) };
  if ((m = /^([A-Z][a-z]+) (is|[a-z]+s) ([a-z]+er) than ([A-Z][a-z]+)$/.exec(p)) && isName(m[1]) && isName(m[4]) && COMPARATIVES[m[3]]) return { k: 'cmp', a: m[1], b: m[4], verb: m[2], adj: m[3] };
  return null;
}

function readLogic(t) {
  let s = t
    .replace(/^(?:please )?answer (?:with )?(?:yes or no|one word|a single word)\s*:\s*/i, '')
    .replace(/\s*(?:please )?(?:answer|reply|respond)(?: with)? (?:yes or no|one word|a single word|only yes or no|just yes or no)[.!]?\s*$/i, '');
  const ss = sentencesOf(s);
  if (!ss.length || ss.length > 5) return null;
  const last = ss[ss.length - 1];
  if (!last.endsWith('?')) return null;
  let question = last.slice(0, -1).trim();
  // the question word is read in either case; the names after it keep theirs
  question = question.replace(/^(?:Is|Are|Was|Were|Does|Do|Did|Who|Which)\b/, (w) => w.toLowerCase());
  const chunks = ss.slice(0, -1).map((x) => ({ text: bare(x), prefix: false }));
  const lc = question.lastIndexOf(', ');
  if (lc > 0 && /^(?:is|are|was|were|does|do|did|who|which)\b/i.test(question.slice(lc + 2))) { chunks.push({ text: question.slice(0, lc), prefix: true }); question = question.slice(lc + 2); }
  // the premises, clause by clause
  const simple = [], conds = [], facts = [];
  for (const ch of chunks) {
    const parts = ch.text.split(/,\s*and\s+|,\s*then\s+|,\s+|\s+and\s+/).map((x) => x.trim()).filter(Boolean);
    if (ch.prefix && /^if /i.test(parts[0])) {
      const sup = [parts[0].replace(/^if /i, ''), ...parts.slice(1)].map(simplePremise);
      if (sup.every(Boolean)) { simple.push(...sup); continue; }
    }
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (/^if /i.test(p)) {
        const body = p.slice(3);
        let pq = splitConditional(body);
        if (!pq && i + 1 < parts.length) { pq = [body, parts[i + 1]]; i++; }
        if (!pq) return null;
        const a = literal(pq[0]), b = literal(pq[1]);
        if (!a || !b) return null;
        conds.push([a, b]);
        continue;
      }
      const sp = simplePremise(p);
      if (sp) { simple.push(sp); continue; }
      const l = literal(p);
      if (!l) return null;
      facts.push(l);
    }
  }
  if (conds.length) {
    // propositional: a simple premise is one more fact
    for (const sp of simple) { if (sp.k !== 'member') return null; }
    const allFacts = [...facts, ...simple.map((sp) => literal(sp.x + ' is ' + (sp.neg ? 'not ' : '') + 'a ' + sp.a))];
    return propositional(conds, allFacts, question);
  }
  if (facts.length) return null;
  if (!simple.length) return null;
  if (simple.every((sp) => sp.k === 'cmp')) return comparative(simple, question);
  if (simple.some((sp) => sp.k === 'cmp')) return null;
  return categorical(simple, question);
}

function propositional(conds, facts, question) {
  const m = /^(is|are|was|were|does|do|did) (.+)$/i.exec(question);
  if (!m) return null;
  const q = literal(question);
  if (!q) return null;
  const known = new Map();
  const set = (l) => { if (known.has(l.key) && known.get(l.key) !== l.pol) return false; known.set(l.key, l.pol); return true; };
  const keys = new Set();
  for (const f of facts) { if (!f || !set(f)) return null; keys.add(f.key); }
  for (const [a, b] of conds) { keys.add(a.key); keys.add(b.key); }
  if (!keys.has(q.key)) return null;
  const steps = [];
  for (let round = 0, changed = true; changed && round < 64; round++) {
    changed = false;
    for (const [a, b] of conds) {
      if (known.get(a.key) === a.pol && known.get(b.key) !== b.pol) { if (!set(b)) return null; steps.push('"' + a.text + '" holds, so "' + b.text + '" holds (modus ponens)'); changed = true; }
      if (known.has(b.key) && known.get(b.key) !== b.pol && known.get(a.key) !== !a.pol) { if (!set({ key: a.key, pol: !a.pol })) return null; steps.push('"' + b.text + '" fails, so "' + a.text + '" fails (modus tollens)'); changed = true; }
    }
  }
  if (!known.has(q.key)) return null;
  return out('logic', known.get(q.key) === q.pol ? 'yes' : 'no', steps.length ? steps : ['read from the premises as given']);
}

function comparative(ps, question) {
  const dims = new Set(ps.map((p) => COMPARATIVES[p.adj][0]));
  const verbs = new Set(ps.map((p) => p.verb));
  if (verbs.size !== 1) return null;
  let dim = null;
  for (const d of dims) { if (d.includes('|')) continue; if (dim && dim !== d) return null; dim = d; }
  if (!dim) { if (dims.size !== 1) return null; return null; }
  for (const d of dims) if (!d.split('|').includes(dim)) return null;
  const gt = new Map(); const names = new Set();
  for (const p of ps) {
    const [hi, lo] = COMPARATIVES[p.adj][1] > 0 ? [p.a, p.b] : [p.b, p.a];
    names.add(hi); names.add(lo);
    if (!gt.has(hi)) gt.set(hi, new Set());
    gt.get(hi).add(lo);
  }
  const below = (x) => { const seen = new Set(), st = [x]; while (st.length) { const y = st.pop(); for (const z of gt.get(y) || []) if (!seen.has(z)) { seen.add(z); st.push(z); } } return seen; };
  for (const n of names) if (below(n).has(n)) return null;
  let m;
  if ((m = /^(?:who|which(?: person| one| of them)?) is (?:the )?([a-z]+est)$/i.exec(question))) {
    const sup = SUPERLATIVES[m[1].toLowerCase()];
    if (!sup || !sup[0].split('|').includes(dim)) return null;
    const winners = [...names].filter((x) => (sup[1] > 0 ? below(x).size === names.size - 1 : [...names].every((y) => y === x || below(y).has(x))));
    if (winners.length !== 1) return null;
    return out('logic', winners[0], ['the comparisons chain into one order of ' + names.size + ' names; ' + winners[0] + ' is ' + m[1].toLowerCase()]);
  }
  if ((m = /^is ([A-Z][a-z]+) ([a-z]+er) than ([A-Z][a-z]+)$/.exec(question)) || (m = /^(?:does|do) ([A-Z][a-z]+) [a-z]+ ([a-z]+er) than ([A-Z][a-z]+)$/.exec(question))) {
    const c = COMPARATIVES[m[2]];
    if (!c || !c[0].split('|').includes(dim) || !names.has(m[1]) || !names.has(m[3]) || m[1] === m[3]) return null;
    const [hi, lo] = c[1] > 0 ? [m[1], m[3]] : [m[3], m[1]];
    if (below(hi).has(lo)) return out('logic', 'yes', ['the comparisons chain: ' + hi + ' is above ' + lo]);
    if (below(lo).has(hi)) return out('logic', 'no', ['the comparisons chain the other way: ' + lo + ' is above ' + hi]);
    return null;
  }
  return null;
}

function categorical(ps, question) {
  const sup = new Map(), disj = [], pos = new Map(), neg = new Map();
  for (const p of ps) {
    if (p.k === 'all') { if (!sup.has(p.a)) sup.set(p.a, new Set()); sup.get(p.a).add(p.b); }
    else if (p.k === 'none') disj.push([p.a, p.b]);
    else if (p.k === 'member') { const mp = p.neg ? neg : pos; if (!mp.has(p.x)) mp.set(p.x, new Set()); mp.get(p.x).add(p.a); }
    else return null;
  }
  const up = (a) => { const seen = new Set([a]), st = [a]; while (st.length) { const y = st.pop(); for (const z of sup.get(y) || []) if (!seen.has(z)) { seen.add(z); st.push(z); } } return seen; };
  const disjoint = (A, B) => disj.some(([x, y]) => (A.has(x) && B.has(y)) || (A.has(y) && B.has(x)));
  const terms = new Set();
  for (const p of ps) { if (p.a) terms.add(p.a); if (p.b) terms.add(p.b); }
  let m;
  if ((m = /^are all ([a-z]+) ([a-z]+)$/i.exec(question)) || (m = /^is (?:every|each|any) ([a-z]+) (?:a |an )?([a-z]+)$/i.exec(question))) {
    const a = sing(m[1]), b = sing(m[2]);
    if (!terms.has(a) || !terms.has(b)) return null;
    if (up(a).has(b)) return out('logic', 'yes', ['every ' + a + ' is a ' + b + ' through the chain ' + [...up(a)].join(' < ')]);
    return null;
  }
  if ((m = /^is ([A-Z][a-z]+) (?:a|an) ([a-z]+)$/.exec(question))) {
    const x = m[1], b = sing(m[2]);
    if (!terms.has(b) || (!pos.has(x) && !neg.has(x))) return null;
    const mine = new Set(); for (const a of pos.get(x) || []) for (const z of up(a)) mine.add(z);
    const yes = mine.has(b);
    const no = disjoint(mine, up(b)) || [...(neg.get(x) || [])].some((c) => up(b).has(c));
    if (yes === no) return null;
    return out('logic', yes ? 'yes' : 'no', [yes ? x + ' is a ' + b + ' through the premises' : x + ' cannot be a ' + b + ': the premises exclude it']);
  }
  return null;
}

// ================================================================ the entry point
// board 35 (readers-2), added: "Is 3 less than 10? Answer yes or no." A last sentence that asks for yes or no is set
// aside when the reader read the question before it and its answer IS yes or no; any other answer does not meet it.
const YESNO_TAIL_RE = /(?<=[?.!])\s*(?:please\s+)?(?:(?:answer|reply|respond)(?:\s+(?:with|only\s+with|just\s+with|just|only))?(?:\s+(?:a|a\s+simple|simply))?\s+(?:yes\s+or\s+no|"yes"\s+or\s+"no")|(?:just\s+|only\s+)?yes\s+or\s+no)\s*[.!?]?\s*$/i;
function yesNoTail(read) {
  return (t) => {
    const r = read(t);
    if (r) return r;
    const m = YESNO_TAIL_RE.exec(String(t ?? ''));
    if (!m || m.index === 0) return null;
    const head = String(t).slice(0, m.index).trim();
    const h = head ? read(head) : null;
    if (!h || (h.answer !== 'yes' && h.answer !== 'no')) return null;
    h.steps.unshift('set aside the instruction "' + m[0].trim() + '": the answer below is yes or no');
    return h;
  };
}
const READERS = Object.freeze([['units', readUnits], ['sequence', readSequence], ['counting', readCounting], ['spelling', readSpelling], ['calendar', readCalendar], ['comparison', readComparison], ['probability', readProbability], ['geometry', readGeometry], ['logic', readLogic]].map(([kind, read]) => [kind, yesNoTail(read)]));
export const READ = Object.freeze(Object.fromEntries(READERS));

/**
 * The question answered by one of the nine readers, completely and exactly, or null.
 * Every reader runs; when two answer and disagree, neither answer is printed.
 * @param {string} text
 * @returns {{answer: string, method: string, steps: string[]}|null}
 */
export function exactKinds(text) {
  // the cap is on the text as given, before any tidying: a long text is refused, not trimmed into range
  if (text === null || text === undefined || String(text).length > KIND_CAPS.chars) return null;
  const t = tidy(text);
  if (!t) return null;
  let got = null;
  for (const [, read] of READERS) {
    let r = null;
    try { r = read(t); } catch { r = null; }
    if (!r) continue;
    if (got && got.answer !== r.answer) return null;
    if (!got) got = r;
  }
  return got;
}
