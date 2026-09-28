// reason/induce.mjs: PROGRAM INDUCTION OVER A SMALL DSL (board 23 builder, item induce; ROUTE A of
// docs/RESEARCH-PARADIGM.md, his 2026-09-26 19:41 EDT order "there needs to be a paradigm shift").
//
// A template is the same question with other numbers; a held-out record is a new question. This file
// turns a word problem into STRUCTURE and answers with a PROGRAM, never with a stored answer:
//
//   parse(sentence)       the quantities of a sentence with their roles (positional q0..qn-1, named
//                         fraction and multiplier words f0.. m0.., implicit unit constants) and the
//                         cue words around each one, plus the question sentence's cue classes.
//   PRIMITIVES            the DSL: at most 24 primitives, each with a one-line meaning (the table
//                         notes/induce.md prints).
//   search(parsed, gold)  bottom-up enumeration to depth 4 (four operations, five leaves, every leaf
//                         used at most once) with OBSERVATIONAL EQUIVALENCE: programs over the same
//                         leaves that give the same value on this record are one class (a version
//                         space: each class keeps a few alternative derivations, expanded only at
//                         the end). The fourth level is never built: the target is propagated
//                         top-down through each operation's inverse and looked up in the bank
//                         (the Duet idea, POPL 2021). Returns every program that reproduces gold.
//   abstract(found)       the library: per cue pattern (four levels, fine to coarse), the programs
//                         that reproduce the most development records, each kept only when it
//                         reproduces at least two (an abstraction, not a memory), its records listed
//                         as provenance.
//   answerFromPrograms(sentence, kept)
//                         parse, walk the cue levels fine to coarse, run the ranked programs of the
//                         matching pattern, and return the first value that passes the invariant
//                         (a positive whole number): { answer, program, ns, level, pattern, support }.
//                         Microseconds, no model, no socket, no answer key.
//
// No model is called anywhere here. Nothing here reads a file except makeRecordReader, whose every
// record read is logged (the spy the tests and the bench use to prove the held-out ids were never
// opened by the search).
import fs from 'node:fs';

// ---------------------------------------------------------------- the DSL
// Leaves are what the parse extracts; operations are what the search composes. The search uses the
// six arithmetic operations; the named leaves carry the words (half, twice, dozen, week, percent)
// so that "half as many" is mul(x, f0) with f0 = 0.5 read from the word, not a constant guessed.
export const PRIMITIVES = Object.freeze([
  { name: 'q', arity: 0, kind: 'leaf', meaning: 'extract: the i-th number written in the text (digits, number words, money, percent as a fraction)' },
  { name: 'f', arity: 0, kind: 'leaf', meaning: 'fraction word: half, a third, two-thirds, a quarter, 3/4 written as a fraction (the i-th one)' },
  { name: 'm', arity: 0, kind: 'leaf', meaning: 'multiplier word: twice, double, triple, thrice, quadruple (the i-th one)' },
  { name: 'dozen', arity: 0, kind: 'leaf', meaning: '12, present when the text says dozen' },
  { name: 'week', arity: 0, kind: 'leaf', meaning: '7 days in a week, present when the text names weeks and days' },
  { name: 'hour', arity: 0, kind: 'leaf', meaning: '60 minutes in an hour, present when the text names hours and minutes' },
  { name: 'minute', arity: 0, kind: 'leaf', meaning: '60 seconds in a minute, present when the text names minutes and seconds' },
  { name: 'day', arity: 0, kind: 'leaf', meaning: '24 hours in a day, present when the text names days and hours' },
  { name: 'yearm', arity: 0, kind: 'leaf', meaning: '12 months in a year, present when the text names years and months' },
  { name: 'yearw', arity: 0, kind: 'leaf', meaning: '52 weeks in a year, present when the text names years and weeks' },
  { name: 'monthw', arity: 0, kind: 'leaf', meaning: '4 weeks in a month, present when the text names months and weeks' },
  { name: 'pct100', arity: 0, kind: 'leaf', meaning: '100, present when the text says percent (a whole in percentage points)' },
  { name: 'two', arity: 0, kind: 'leaf', meaning: '2, present when the text says both, pair, twins, round trip or couple' },
  { name: 'add', arity: 2, kind: 'op', meaning: 'total: a + b (in all, altogether, combined, sum)', fn: (a, b) => a + b },
  { name: 'sub', arity: 2, kind: 'op', meaning: 'remaining or compare: a - b (left, how many more, difference)', fn: (a, b) => a - b },
  { name: 'mul', arity: 2, kind: 'op', meaning: 'times: a * b (each, per item times items, twice, half of)', fn: (a, b) => a * b },
  { name: 'div', arity: 2, kind: 'op', meaning: 'per: a / b (split equally, rate, average, how many groups)', fn: (a, b) => a / b },
  { name: 'grow', arity: 2, kind: 'op', meaning: 'a increased by the fraction b: a * (1 + b) (b percent more, a and twice a together)', fn: (a, b) => a * (1 + b) },
  { name: 'shrink', arity: 2, kind: 'op', meaning: 'a decreased by the fraction b: a * (1 - b) (discount, what is left after spending a fraction)', fn: (a, b) => a * (1 - b) },
]);
export const OPS = Object.freeze(PRIMITIVES.filter((p) => p.kind === 'op'));
const OP_FN = Object.freeze(Object.fromEntries(OPS.map((o) => [o.name, o.fn])));
const COMMUTATIVE = new Set(['add', 'mul']);
export const MAX_OPS = 4;

// ---------------------------------------------------------------- the parse
const UNITS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const ORD_DEN = { half: 2, halves: 2, third: 3, thirds: 3, fourth: 4, fourths: 4, quarter: 4, quarters: 4, fifth: 5, fifths: 5, sixth: 6, sixths: 6, seventh: 7, sevenths: 7, eighth: 8, eighths: 8, ninth: 9, ninths: 9, tenth: 10, tenths: 10 };
const MULT = { twice: 2, double: 2, doubled: 2, doubles: 2, triple: 3, tripled: 3, triples: 3, thrice: 3, quadruple: 4, quadrupled: 4 };
const TWO_CUES = new Set(['both', 'pair', 'pairs', 'twins', 'couple']);
const FRACTION_FOLLOW = new Set(['of', 'as', 'the', 'that', 'this', 'what', 'his', 'her', 'their', 'its', 'an', 'a', 'more', 'less', 'hour', 'mile', 'cup', 'pound', 'dozen', 'day', 'year', 'gallon']);

function wordNumber(w) {
  if (w in UNITS) return UNITS[w];
  if (w in TENS) return TENS[w];
  const h = /^([a-z]+)-([a-z]+)$/.exec(w);
  if (h && h[1] in TENS && h[2] in UNITS && UNITS[h[2]] > 0 && UNITS[h[2]] < 10) return TENS[h[1]] + UNITS[h[2]];
  return null;
}

const TOKEN = /(\d{1,2}):(\d{2})\s*(am|pm|a\.m\.|p\.m\.)?|(\$\s?)?(\d+(?:\.\d+)?|\.\d+)(?:\s?\/\s?(\d+))?(\s?%|\s?percent\b)?(\$)?|([a-z]+(?:[-'][a-z]+)*)|([.?!])/g;

/** The tokens of a text: numbers (with money, percent, fraction and clock readings) and words. */
export function tokenize(text) {
  let t = String(text ?? '').toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/ /g, ' ');
  for (let k = 0; k < 3; k++) t = t.replace(/(\d),(\d{3})(?!\d)/g, '$1$2');
  const out = [];
  let m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(t)) !== null) {
    if (m[1] !== undefined) {
      let h = +m[1];
      const min = +m[2];
      const ap = m[3] ? m[3][0] : null;
      if (ap === 'p' && h < 12) h += 12;
      if (ap === 'a' && h === 12) h = 0;
      if (ap) out.push({ t: 'num', v: h + min / 60, kind: 'clock', raw: m[0] });
      else { out.push({ t: 'num', v: +m[1], kind: 'num', raw: m[1] }); out.push({ t: 'num', v: min, kind: 'num', raw: m[2] }); }
    } else if (m[5] !== undefined) {
      const money = !!m[4] || !!m[8];
      if (m[6] !== undefined) {
        const d = +m[6];
        if (d > 0) out.push({ t: 'num', v: +m[5] / d, kind: 'frac', raw: m[0] });
        else out.push({ t: 'num', v: +m[5], kind: money ? 'money' : 'num', raw: m[0] });
      } else if (m[7]) out.push({ t: 'num', v: +m[5] / 100, kind: 'pct', raw: m[0] });
      else out.push({ t: 'num', v: +m[5], kind: money ? 'money' : 'num', raw: m[0] });
    } else if (m[9] !== undefined) out.push({ t: 'w', w: m[9] });
    else if (m[10] !== undefined) out.push({ t: 'p', w: m[10] });
  }
  return out;
}

const Q_CUES = [
  ['left', /\b(left|remain|remains|remaining|rest|still|change|leftover)\b/],
  ['more', /\b(more|less|fewer|longer|shorter|older|younger|difference|further|farther|taller|faster|slower|cheaper|saves?|saved|profit)\b/],
  ['total', /\b(total|altogether|together|combined|in all|sum|overall|entire|all)\b/],
  ['each', /\b(each|per|every|average|apiece|one)\b/],
  ['money', /(\$|\bdollars?\b|\bcosts?\b|\bspend\b|\bspent\b|\bpay\b|\bpaid\b|\bearn|\bmake\b|\bmade\b|\bmoney\b|\bprice\b|\bcharge)/],
  ['time', /\b(how long|hours?|minutes?|days?|weeks?|years?|months?|seconds?)\b/],
  ['pct', /(percent|percentage|%)/],
];

/**
 * THE PARSE. Quantities with roles and the cue words around them.
 * @returns {{pos: object[], named: object, namedList: object[], qcues: string[], sentences: number, question: string}}
 */
export function parse(sentence) {
  const toks = tokenize(sentence);
  // sentences: split at . ? ! tokens
  const sents = [[]];
  for (const tk of toks) { if (tk.t === 'p') { sents[sents.length - 1].push(tk); sents.push([]); } else sents[sents.length - 1].push(tk); }
  if (!sents[sents.length - 1].length) sents.pop();
  let qi = -1;
  for (let i = sents.length - 1; i >= 0; i--) if (sents[i].some((x) => x.t === 'p' && x.w === '?')) { qi = i; break; }
  if (qi < 0) qi = sents.length - 1;
  const flat = [];
  sents.forEach((s, si) => { for (const tk of s) flat.push({ ...tk, s: si }); });
  const words = new Set(flat.filter((x) => x.t === 'w').map((x) => x.w));
  const pos = [], fr = [], mu = [];
  const word = (i) => (i >= 0 && i < flat.length && flat[i].t === 'w' ? flat[i].w : null);
  const ctx = (i) => ({ prev: [word(i - 3), word(i - 2), word(i - 1)].filter(Boolean), next: [word(i + 1), word(i + 2), word(i + 3)].filter(Boolean) });
  for (let i = 0; i < flat.length; i++) {
    const tk = flat[i];
    if (tk.t === 'num') {
      // "3 dozen" stays 3; the dozen leaf carries the 12
      if (tk.kind === 'frac') fr.push({ v: tk.v, raw: tk.raw, s: tk.s, i, ...ctx(i) });
      else pos.push({ v: tk.v, kind: tk.kind, raw: tk.raw, s: tk.s, i, ...ctx(i) });
      continue;
    }
    if (tk.t !== 'w') continue;
    const w = tk.w;
    // fraction words: two-thirds, one-fourth, a third, one quarter, half
    const hy = /^([a-z]+)-([a-z]+)$/.exec(w);
    if (hy && (hy[1] in UNITS) && (hy[2] in ORD_DEN) && UNITS[hy[1]] > 0) { fr.push({ v: UNITS[hy[1]] / ORD_DEN[hy[2]], raw: w, s: tk.s, i, ...ctx(i) }); continue; }
    if (w === 'half' || w === 'halves') { fr.push({ v: 0.5, raw: w, s: tk.s, i, ...ctx(i) }); continue; }
    if (w in ORD_DEN) {
      const p = word(i - 1), n = word(i + 1);
      const num = p === 'a' || p === 'an' ? 1 : p in UNITS && UNITS[p] > 0 && UNITS[p] < 10 ? UNITS[p] : null;
      if (num !== null && (n === null || FRACTION_FOLLOW.has(n) || w.endsWith('s') || flat[i + 1] && flat[i + 1].t === 'p')) {
        // the number word before it was already taken as a quantity: take it back
        if (p in UNITS && pos.length && pos[pos.length - 1].i === i - 1) pos.pop();
        fr.push({ v: num / ORD_DEN[w], raw: (p ? p + ' ' : '') + w, s: tk.s, i, ...ctx(i) });
      }
      continue;
    }
    if (w in MULT) { mu.push({ v: MULT[w], raw: w, s: tk.s, i, ...ctx(i) }); continue; }
    const wn = wordNumber(w);
    if (wn !== null) {
      // "one hundred", "two thousand"
      let v = wn, j = i;
      if (word(i + 1) === 'hundred') { v *= 100; j = i + 1; }
      else if (word(i + 1) === 'thousand') { v *= 1000; j = i + 1; }
      else if (word(i + 1) === 'million') { v *= 1e6; j = i + 1; }
      // "one" in "one of", "one day", "no one" is not a count we can use: keep only a counted one
      if (w === 'one' && !(word(i + 1) && !['of', 'another', 'more', 'or', 'and', 'who', 'that', 'is', 'was'].includes(word(i + 1)) && word(i - 1) !== 'no' && word(i - 1) !== 'any' && word(i - 1) !== 'every')) continue;
      pos.push({ v, kind: 'word', raw: w, s: tk.s, i, ...ctx(i) });
      i = j;
      continue;
    }
    if (w === 'hundred' && (word(i - 1) === 'a')) { pos.push({ v: 100, kind: 'word', raw: 'a hundred', s: tk.s, i, ...ctx(i) }); continue; }
    if (w === 'dozen' && word(i - 1) === 'a') { pos.push({ v: 1, kind: 'word', raw: 'a dozen', s: tk.s, i, ...ctx(i) }); continue; }
  }
  const named = {};
  const namedList = [];
  const put = (name, v, cue) => { named[name] = v; namedList.push({ name, v, cue }); };
  fr.forEach((f, k) => put('f' + k, f.v, f.raw));
  mu.forEach((m, k) => put('m' + k, m.v, m.raw));
  const has = (...ws) => ws.some((w) => words.has(w));
  if (has('dozen', 'dozens')) put('dozen', 12, 'dozen');
  if (has('week', 'weeks', 'weekly') && has('day', 'days', 'daily', 'night', 'nights', 'nightly', 'morning', 'mornings', 'evening', 'evenings')) put('week', 7, 'week+day');
  if (has('hour', 'hours', 'hourly') && has('minute', 'minutes')) put('hour', 60, 'hour+minute');
  if (has('minute', 'minutes') && has('second', 'seconds')) put('minute', 60, 'minute+second');
  if (has('day', 'days', 'daily') && has('hour', 'hours')) put('day', 24, 'day+hour');
  if (has('year', 'years', 'yearly', 'annual', 'annually') && has('month', 'months', 'monthly')) put('yearm', 12, 'year+month');
  if (has('year', 'years', 'yearly', 'annual', 'annually') && has('week', 'weeks', 'weekly')) put('yearw', 52, 'year+week');
  if (has('month', 'months', 'monthly') && has('week', 'weeks', 'weekly')) put('monthw', 4, 'month+week');
  if (pos.some((q) => q.kind === 'pct') || has('percent', 'percentage')) put('pct100', 100, 'percent');
  if ([...TWO_CUES].some((w) => words.has(w)) || /round[ -]trip/.test(String(sentence).toLowerCase())) put('two', 2, 'both/pair');
  const qtext = sents[qi] ? sents[qi].filter((x) => x.t === 'w').map((x) => x.w).join(' ') + (sents[qi].some((x) => x.kind === 'money') ? ' $' : '') + (sents[qi].some((x) => x.kind === 'pct') ? ' %' : '') : '';
  const qcues = Q_CUES.filter(([, re]) => re.test(qtext)).map(([k]) => k);
  for (const q of pos) q.inQ = q.s === qi;
  return { pos, named, namedList, qcues, sentences: sents.length, question: qtext };
}

/** One positional quantity's role tag: its kind and the cue words beside it. */
function roleTag(q) {
  const k = q.kind === 'money' ? 'm' : q.kind === 'pct' ? 'p' : q.kind === 'clock' ? 'c' : 'n';
  const nx = q.next[0] || '', nx2 = q.next[1] || '';
  const each = ['each', 'per', 'every', 'apiece', 'an', 'a'].includes(nx) || ['each', 'per', 'every', 'apiece'].includes(nx2) ? 'E' : '';
  const times = q.next.includes('times') ? 'X' : '';
  const diff = ['more', 'less', 'fewer', 'older', 'younger', 'longer', 'shorter'].includes(nx) || ['more', 'less', 'fewer', 'older', 'younger', 'longer', 'shorter'].includes(nx2) ? 'D' : '';
  return k + each + times + diff + (q.inQ ? 'Q' : '');
}

/**
 * THE CUE PATTERNS of a parse, fine to coarse. A kept program is filed under each; a held-out
 * question is answered at the finest pattern that has a kept program which passes the invariant.
 */
export const LEVELS = Object.freeze(['role', 'cue', 'named', 'count']);
export function patterns(p) {
  const n = p.pos.length;
  const named = p.namedList.map((x) => x.name).sort().join(',');
  const q = p.qcues.join(',');
  return {
    role: 'n' + n + '|q' + q + '|x' + named + '|r' + p.pos.map(roleTag).join(','),
    cue: 'n' + n + '|q' + q + '|x' + named,
    named: 'n' + n + '|x' + named,
    count: 'n' + n,
  };
}

// ---------------------------------------------------------------- programs
/** The leaves of a parse, in a fixed order: positional quantities, then the named ones. */
export function leavesOf(p) {
  const out = p.pos.map((q, i) => ({ name: 'q' + i, v: q.v }));
  for (const x of p.namedList) out.push({ name: x.name, v: x.v });
  return out;
}

/** A program tree to its canonical text: commutative chains flattened and sorted. */
export function show(node) {
  if (node.leaf) return node.leaf;
  if (COMMUTATIVE.has(node.op)) {
    const parts = [];
    const walk = (n) => { if (!n.leaf && n.op === node.op) { walk(n.a); walk(n.b); } else parts.push(show(n)); };
    walk(node);
    parts.sort();
    let s = parts[0];
    for (let i = 1; i < parts.length; i++) s = node.op + '(' + s + ',' + parts[i] + ')';
    return s;
  }
  return node.op + '(' + show(node.a) + ',' + show(node.b) + ')';
}

/** Program text back to a tree (the store holds text). */
export function readProgram(text) {
  let i = 0;
  const s = String(text);
  function node() {
    const m = /^[a-z]+[0-9]*/.exec(s.slice(i));
    if (!m) throw new Error('bad program at ' + i + ': ' + s);
    i += m[0].length;
    if (s[i] === '(') {
      i++;
      const a = node();
      if (s[i] !== ',') throw new Error('bad program: , expected at ' + i);
      i++;
      const b = node();
      if (s[i] !== ')') throw new Error('bad program: ) expected at ' + i);
      i++;
      if (!(m[0] in OP_FN)) throw new Error('unknown primitive ' + m[0]);
      return { op: m[0], a, b };
    }
    return { leaf: m[0] };
  }
  const t = node();
  if (i !== s.length) throw new Error('trailing text in program: ' + s);
  return t;
}

/** Compile a tree to a closure over a leaf table (a program run is a few adds and multiplies). */
export function compile(node) {
  if (node.leaf) { const k = node.leaf; return (L) => (k in L ? L[k] : NaN); }
  const f = OP_FN[node.op], a = compile(node.a), b = compile(node.b);
  return (L) => f(a(L), b(L));
}
export function opsOf(node) { return node.leaf ? 0 : 1 + opsOf(node.a) + opsOf(node.b); }
export function leafNames(node, out = new Set()) { if (node.leaf) out.add(node.leaf); else { leafNames(node.a, out); leafNames(node.b, out); } return out; }

/** The leaf table a program runs against. */
export function leafTable(p) {
  const L = Object.create(null);
  p.pos.forEach((q, i) => { L['q' + i] = q.v; });
  for (const x of p.namedList) L[x.name] = x.v;
  return L;
}

// ---------------------------------------------------------------- the search
const KEY = (v) => Math.round(v * 1e6);
const EPS = 1e-6;
/** A value the enumeration keeps: positive, finite, not huge, and a fraction with a small denominator. */
function nice(v) {
  if (!(v > 0) || !Number.isFinite(v) || v > 1e9) return false;
  for (const d of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 16, 20, 25, 100, 1000]) { const x = v * d; if (Math.abs(x - Math.round(x)) < EPS * Math.max(1, x)) return true; }
  return false;
}
function domainOk(op, a, b) {
  if (op === 'div') return b !== 0;
  if (op === 'shrink') return b > 0 && b < 1;
  if (op === 'grow') return b > 0 && b <= 5;
  return true;
}
const popcount = (x) => { let c = 0; while (x) { x &= x - 1; c++; } return c; };

/**
 * THE SEARCH. Every program of at most MAX_OPS operations over the parsed leaves (each leaf used at
 * most once) whose value is gold. Bottom-up by leaf set with observational equivalence (one class per
 * leaf set and value, a few derivations kept per class), the last level by top-down inversion.
 * @param {object} p a parse
 * @param {number} gold the answer to reproduce
 * @param {{maxOps?: number, altCap?: number, programCap?: number, maxLeaves?: number}} opts
 */
export function search(p, gold, opts = {}) {
  const maxOps = Math.min(opts.maxOps ?? MAX_OPS, MAX_OPS);
  const altCap = opts.altCap ?? 3;
  const programCap = opts.programCap ?? 64;
  const maxLeaves = opts.maxLeaves ?? 12;
  const leaves = leavesOf(p).slice(0, maxLeaves);
  const L = leaves.length;
  const stats = { leaves: L, classes: 0, combined: 0, lookups: 0, matches: 0, truncatedLeaves: leavesOf(p).length > maxLeaves };
  if (!L || !Number.isFinite(gold)) return { programs: [], stats };
  const bank = new Array(1 << L);
  const index = new Map(); // value key -> classes (every mask), for the top-down level
  const gk = KEY(gold);
  // a class whose value is the answer keeps every derivation up to programCap (the others keep altCap):
  // with altCap alone the first splits enumerated fill the answer class, and the derivation through
  // the leaves in the order the worked answer uses them can be dropped
  const addClass = (mask, v, alt) => {
    let m = bank[mask];
    if (!m) { m = new Map(); bank[mask] = m; }
    const k = KEY(v);
    let c = m.get(k);
    if (!c) {
      c = { v, mask, size: popcount(mask), alts: [] };
      m.set(k, c);
      stats.classes++;
      let arr = index.get(k);
      if (!arr) { arr = []; index.set(k, arr); }
      arr.push(c);
    }
    if (c.alts.length < (k === gk ? programCap : altCap)) c.alts.push(alt);
    return c;
  };
  for (let i = 0; i < L; i++) addClass(1 << i, leaves[i].v, { leaf: leaves[i].name });
  // masks by size
  const bySize = Array.from({ length: L + 1 }, () => []);
  for (let mask = 1; mask < (1 << L); mask++) bySize[popcount(mask)].push(mask);
  const maxBankLeaves = Math.min(maxOps, L); // bank classes have at most maxOps leaves (maxOps-1 operations)
  for (let s = 2; s <= maxBankLeaves; s++) {
    for (const mask of bySize[s]) {
      const low = mask & -mask;
      // every split into A (holding the lowest bit) and B
      for (let A = (mask - 1) & mask; A > 0; A = (A - 1) & mask) {
        if (!(A & low)) continue;
        const B = mask ^ A;
        const ma = bank[A], mb = bank[B];
        if (!ma || !mb) continue;
        for (const ca of ma.values()) for (const cb of mb.values()) {
          for (const op of OPS) {
            for (let o = 0; o < (COMMUTATIVE.has(op.name) ? 1 : 2); o++) {
              const x = o ? cb : ca, y = o ? ca : cb;
              if (!domainOk(op.name, x.v, y.v)) continue;
              const v = op.fn(x.v, y.v);
              stats.combined++;
              if (!nice(v)) continue;
              addClass(mask, v, { op: op.name, x, y });
            }
          }
        }
      }
    }
  }
  const found = []; // { kind:'class', c } or { kind:'top', op, x, y }
  // programs of fewer than maxOps operations: a bank class whose value is gold
  const direct = index.get(gk) || [];
  for (const c of direct) if (c.size >= 2) found.push({ kind: 'class', c });
  // programs of exactly maxOps operations: top-down through each inverse, looked up in the bank
  const need = maxOps + 1;
  if (L >= 2 && need <= L + 0) {
    const inv = (name, a, t, aFirst) => {
      // the value b must have so that op(a,b) (aFirst) or op(b,a) is t
      switch (name) {
        case 'add': return t - a;
        case 'mul': return a === 0 ? NaN : t / a;
        case 'sub': return aFirst ? a - t : t + a;
        case 'div': return aFirst ? (t === 0 ? NaN : a / t) : t * a;
        case 'grow': return aFirst ? (a === 0 ? NaN : t / a - 1) : t / (1 + a);
        case 'shrink': return aFirst ? (a === 0 ? NaN : 1 - t / a) : (a === 1 ? NaN : t / (1 - a));
        default: return NaN;
      }
    };
    for (let mask = 1; mask < (1 << L); mask++) {
      const ma = bank[mask];
      if (!ma) continue;
      const sa = popcount(mask);
      if (sa >= need) continue;
      const low = mask & -mask;
      for (const ca of ma.values()) {
        for (const op of OPS) {
          for (let o = 0; o < (COMMUTATIVE.has(op.name) ? 1 : 2); o++) {
            const aFirst = o === 0;
            const bv = inv(op.name, ca.v, gold, aFirst);
            stats.lookups++;
            if (!Number.isFinite(bv) || !(bv > 0)) continue;
            const arr = index.get(KEY(bv));
            if (!arr) continue;
            for (const cb of arr) {
              if (cb.mask & mask) continue;
              if (sa + cb.size !== need) continue;
              // each unordered pair of leaf sets once: A holds the lower bit
              if ((cb.mask & -cb.mask) < low) continue;
              const x = aFirst ? ca : cb, y = aFirst ? cb : ca;
              if (!domainOk(op.name, x.v, y.v)) continue;
              const v = op.fn(x.v, y.v);
              if (Math.abs(v - gold) > EPS * Math.max(1, Math.abs(gold))) continue;
              found.push({ kind: 'top', op: op.name, x, y });
              stats.matches++;
            }
          }
        }
      }
    }
  }
  // expand the version space into concrete programs, fewest operations first
  const expand = (c, cap) => {
    const out = [];
    for (const alt of c.alts) {
      if (out.length >= cap) break;
      if (alt.leaf) { out.push({ leaf: alt.leaf }); continue; }
      const xs = expand(alt.x, cap), ys = expand(alt.y, cap);
      for (const a of xs) { for (const b of ys) { out.push({ op: alt.op, a, b }); if (out.length >= cap) break; } if (out.length >= cap) break; }
    }
    return out;
  };
  // an answer class: every derivation it kept, each child expanded to a few
  const expandTop = (c, cap) => {
    const out = [];
    for (const alt of c.alts) {
      if (out.length >= cap) break;
      if (alt.leaf) { out.push({ leaf: alt.leaf }); continue; }
      for (const a of expand(alt.x, 3)) for (const b of expand(alt.y, 3)) if (out.length < cap) out.push({ op: alt.op, a, b });
    }
    return out;
  };
  const seen = new Map();
  const push = (t) => { const s = show(t); if (!seen.has(s)) seen.set(s, { text: s, tree: t, ops: opsOf(t) }); };
  found.sort((a, b) => (a.kind === 'class' ? a.c.size : a.x.size + a.y.size) - (b.kind === 'class' ? b.c.size : b.x.size + b.y.size));
  for (const f of found) {
    if (seen.size >= programCap) break;
    if (f.kind === 'class') { for (const t of expandTop(f.c, programCap)) push(t); }
    else { for (const a of expand(f.x, 3)) for (const b of expand(f.y, 3)) push({ op: f.op, a, b }); }
  }
  const programs = [...seen.values()].sort((a, b) => a.ops - b.ops || (a.text < b.text ? -1 : a.text > b.text ? 1 : 0)).slice(0, programCap);
  return { programs, stats };
}

/** The values a program computes at each operation (for the chain check on development records). */
export function innerValues(node, L, out = []) {
  if (node.leaf) return L[node.leaf];
  const a = innerValues(node.a, L, out), b = innerValues(node.b, L, out);
  const v = OP_FN[node.op](a, b);
  out.push(v);
  return v;
}

/**
 * The numbers a GSM8K worked answer writes (every operand and result of its <<a op b = c>> steps and
 * every number of its prose). A found program whose every intermediate value is among them follows
 * the worked chain; the others reproduce the answer by coincidence as far as this record can tell.
 */
export function chainNumbers(answerText) {
  const s = new Set();
  const t = String(answerText ?? '').replace(/(\d),(\d{3})/g, '$1$2');
  for (const m of t.matchAll(/\d*\.?\d+/g)) { const v = parseFloat(m[0]); if (Number.isFinite(v)) { s.add(KEY(v)); s.add(KEY(v / 100)); } }
  // a step <<16-3-4=9>> writes 9 but computes 13 (or 7) on the way: its sub-steps belong to the chain
  for (const m of t.matchAll(/<<([^=<>]+)=/g)) for (const v of stepValues(m[1])) if (Number.isFinite(v)) s.add(KEY(v));
  return s;
}
/**
 * The values one worked step computes on the way: every prefix of each run of + and - (or * and /),
 * and every sum (product) of consecutive terms of one sign after the first, so a - b - c yields a - b
 * and b + c. A step that is not plain arithmetic yields nothing.
 */
export function stepValues(expr) {
  const src = String(expr).replace(/\s+/g, '').replace(/[$%]/g, '');
  const toks = src.match(/\d*\.?\d+|[-+*/()]/g);
  if (!toks || toks.join('') !== src) return [];
  const out = [];
  let i = 0;
  const run = (next, ops, fn, join) => {
    const terms = [{ op: null, v: next() }];
    let acc = terms[0].v;
    while (ops.includes(toks[i])) { const op = toks[i++]; const v = next(); terms.push({ op, v }); acc = fn(op, acc, v); out.push(acc); }
    for (let a = 1; a < terms.length; a++) { let g = terms[a].v; for (let b = a + 1; b < terms.length && terms[b].op === terms[a].op; b++) { g = join(g, terms[b].v); out.push(g); } }
    return acc;
  };
  const factor = () => {
    const x = toks[i];
    if (x === '(') { i++; const v = sum(); if (toks[i] !== ')') throw new Error('paren'); i++; return v; }
    if (x === '-') { i++; return -factor(); }
    if (x === undefined || !/\d/.test(x)) throw new Error('number');
    i++;
    return parseFloat(x);
  };
  const product = () => run(factor, ['*', '/'], (op, a, b) => (op === '*' ? a * b : a / b), (a, b) => a * b);
  const sum = () => run(product, ['+', '-'], (op, a, b) => (op === '+' ? a + b : a - b), (a, b) => a + b);
  try { sum(); if (i !== toks.length) return []; } catch { return []; }
  return out;
}
export function followsChain(tree, L, chain) {
  const vals = [];
  innerValues(tree, L, vals);
  return vals.every((v) => chain.has(KEY(v)));
}

// ---------------------------------------------------------------- the abstraction
/**
 * THE LIBRARY. found: [{ id, parse, programs: [{text, chain}] }]. Every program is filed under each
 * cue pattern of its record; per pattern, the programs are ranked by the development records they
 * reproduce (following the worked chain first, then any), and only a program that reproduces at
 * least minSupport records under that pattern is kept.
 */
export function abstract(found, opts = {}) {
  const minSupport = opts.minSupport ?? 2;
  const keepBy = opts.keepBy ?? 'chain';
  const rankBy = opts.rankBy ?? 'precision';
  const invariant = opts.invariant ?? 'whole';
  const levels = {};
  for (const lv of LEVELS) levels[lv] = new Map();
  // every searched record (found or not) by pattern: the population a kept program is tried on
  const members = {};
  for (const lv of LEVELS) members[lv] = new Map();
  for (const r of opts.records || found) {
    const pats = patterns(r.parse);
    const L = leafTable(r.parse);
    for (const lv of LEVELS) { let a = members[lv].get(pats[lv]); if (!a) { a = []; members[lv].set(pats[lv], a); } a.push(L); }
  }
  for (const r of found) {
    const pats = patterns(r.parse);
    for (const lv of LEVELS) {
      const m = levels[lv];
      let bucket = m.get(pats[lv]);
      if (!bucket) { bucket = new Map(); m.set(pats[lv], bucket); }
      for (const pr of r.programs) {
        let e = bucket.get(pr.text);
        if (!e) { e = { program: pr.text, ops: pr.ops, support: 0, chain: 0, records: [], chainRecords: [] }; bucket.set(pr.text, e); }
        e.support++;
        if (pr.chain) { e.chain++; e.chainRecords.push(r.id); }
        e.records.push(r.id);
      }
    }
  }
  const kept = { version: 1, minSupport, keepBy, rankBy, invariant, levels: {}, programs: 0, patterns: 0 };
  const distinct = new Set();
  for (const lv of LEVELS) {
    const out = {};
    for (const [pat, bucket] of levels[lv]) {
      const list = [...bucket.values()].filter((e) => (keepBy === 'chain' ? e.chain : e.support) >= minSupport);
      // tried: the development records of this pattern on which the program passes the invariant
      // (a positive whole number): its worked-chain count over tried is its precision where it would answer
      const Ls = members[lv].get(pat) || [];
      for (const e of list) { const f = compiledOf(e.program); let t = 0; for (const L of Ls) if (acceptable(f(L), L, invariant)) t++; e.tried = Math.max(t, e.support); }
      list.sort(rankBy === 'precision' ? rankPrecision : rank);
      if (!list.length) continue;
      out[pat] = list;
      kept.patterns++;
      for (const e of list) distinct.add(e.program);
    }
    kept.levels[lv] = out;
  }
  kept.programs = distinct.size;
  return kept;
}
function rank(a, b) { return b.chain - a.chain || b.support - a.support || a.ops - b.ops || (a.program < b.program ? -1 : a.program > b.program ? 1 : 0); }
/**
 * The smoothed share (k + 1) / (n + 2): k the pattern's development records the program reproduces by
 * their worked chain, n those on which it would answer (its value passes the invariant).
 */
export const precisionOf = (support, tried) => (support + 1) / (tried + 2);
function rankPrecision(a, b) { return precisionOf(b.chain, b.tried) - precisionOf(a.chain, a.tried) || rank(a, b); }

// ---------------------------------------------------------------- answering
const compiled = new Map();
function compiledOf(text) {
  let f = compiled.get(text);
  if (!f) { f = compile(readProgram(text)); compiled.set(text, f); }
  return f;
}
/** The invariant every GSM8K answer satisfies: a positive whole number. */
export function wholePositive(v) { return Number.isFinite(v) && v > 0 && Math.abs(v - Math.round(v)) < 1e-6 * Math.max(1, Math.abs(v)); }
/**
 * THE INVARIANT an answer must pass before it is given: 'whole' is a positive whole number; 'new' adds
 * that the answer is not one of the numbers the question already wrote (a question does not ask what it states).
 */
export function acceptable(v, L, invariant = 'whole') {
  if (!wholePositive(v)) return false;
  if (invariant === 'new') { for (const k in L) if (k[0] === 'q' && Math.abs(L[k] - v) < 1e-9) return false; }
  return true;
}

/**
 * THE ANSWER through the kept programs only. Walks the cue levels fine to coarse; at the first pattern
 * with a kept program whose run passes the invariant, returns it. opts.exclude (a record id) leaves
 * that record's own support and its own chain count out (the development leave-one-out); opts.levels narrows the walk;
 * opts.minPrecision refuses a level whose development leave-one-out precision (kept.devLoo) is lower.
 * @returns {{answer: string, value: number, program: string, level: string, pattern: string, support: number, chain: number, records: string[], ns: number} | null}
 */
export function answerFromPrograms(sentence, kept, opts = {}) {
  const t0 = process.hrtime.bigint();
  if (!kept || !kept.levels) return null;
  const p = parse(sentence);
  const pats = patterns(p);
  const L = leafTable(p);
  const minSupport = kept.minSupport ?? 2;
  const keepBy = kept.keepBy ?? 'chain';
  const ex = opts.exclude ?? null;
  for (const lv of opts.levels || LEVELS) {
    const list = kept.levels[lv] && kept.levels[lv][pats[lv]];
    if (!list) continue;
    // a caller may refuse a level whose development leave-one-out precision is below its floor
    if (opts.minPrecision && !(kept.devLoo && kept.devLoo[lv] && kept.devLoo[lv].precision >= opts.minPrecision)) continue;
    let order = list;
    if (ex !== null) {
      // the leave-one-out: this record's own support and its own try come out, then the list is re-ranked
      order = [];
      for (const e of list) {
        let support = e.support, chain = e.chain, tried = e.tried ?? e.support;
        const own = e.records.includes(ex);
        if (own) { support--; if ((e.chainRecords || []).includes(ex)) chain--; }
        if ((keepBy === 'chain' ? chain : support) < minSupport) continue;
        if (acceptable(compiledOf(e.program)(L), L, kept.invariant)) tried--;
        order.push({ ...e, support, chain, tried: Math.max(tried, support) });
      }
      order.sort((kept.rankBy ?? 'chain') === 'precision' ? rankPrecision : rank);
    }
    for (const e of order) {
      const v = compiledOf(e.program)(L);
      if (!acceptable(v, L, kept.invariant)) continue;
      const ns = Number(process.hrtime.bigint() - t0);
      return { answer: String(Math.round(v)), value: v, program: e.program, level: lv, pattern: pats[lv], support: e.support, chain: e.chain, tried: e.tried ?? null, records: e.records.slice(0, 8), ns };
    }
  }
  return null;
}

// ---------------------------------------------------------------- the record reader (with its spy)
/**
 * A GSM8K jsonl reader that parses ONE line only when its record is asked for, and logs every id it
 * opened. The file's bytes are read once (they are one file); a record is opened only by get().
 */
export function makeRecordReader(file, { idOf = (i) => 'gsm8k.' + i } = {}) {
  let lines = null;
  const opened = [];
  const openedSet = new Set();
  return {
    file,
    opened,
    openedSet,
    get(id) {
      if (lines === null) lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
      const m = /\.(\d+)$/.exec(String(id));
      if (!m) throw new Error('not a record id: ' + id);
      const i = +m[1];
      if (i >= lines.length || !lines[i].trim()) return null;
      if (idOf(i) !== id) throw new Error('record id ' + id + ' does not name line ' + i);
      opened.push(id);
      openedSet.add(id);
      return { id, ...JSON.parse(lines[i]) };
    },
  };
}

/** The graded integer of a GSM8K answer (the text after ####). */
export function goldOf(record) {
  const m = /####\s*(-?[\d,]+(?:\.\d+)?)/.exec(String((record && record.answer) || ''));
  if (!m) return null;
  const v = Number(m[1].replace(/,/g, ''));
  return Number.isFinite(v) ? v : null;
}

/**
 * THE DEVELOPMENT RUN: read each development record through the reader, parse its question, search
 * the programs that reproduce its answer, mark the ones that follow its worked chain, and build the
 * library. Only reader.get(id) for id in devIds is ever called here.
 */
export function induce(reader, devIds, opts = {}) {
  const found = [], rows = [], records = [];
  const deadline = opts.deadline ?? Infinity;
  let covered = 0;
  for (const id of devIds) {
    if (Date.now() > deadline) break;
    const rec = reader.get(id);
    covered++;
    if (!rec) { rows.push({ id, missing: true }); continue; }
    const gold = goldOf(rec);
    const p = parse(rec.question);
    records.push({ id, parse: p });
    const t0 = process.hrtime.bigint();
    const s = search(p, gold, opts);
    const searchNs = Number(process.hrtime.bigint() - t0);
    const chain = chainNumbers(rec.answer);
    const L = leafTable(p);
    const programs = s.programs.map((pr) => ({ text: pr.text, ops: pr.ops, chain: followsChain(pr.tree, L, chain) }));
    rows.push({ id, gold, n: p.pos.length, leaves: s.stats.leaves, programs: programs.length, chainPrograms: programs.filter((x) => x.chain).length, classes: s.stats.classes, searchNs, first: programs[0] ? programs[0].text : null });
    if (programs.length) found.push({ id, parse: p, programs });
  }
  const kept = abstract(found, { ...opts, records });
  return { found, rows, kept, covered };
}

// ---------------------------------------------------------------- the question form (board 35, item program-guard)
/**
 * THE QUESTION FORM of a prompt (or of its parse): the role-level pattern, which names the count of positional
 * quantities, the question sentence's cue classes (left, more, total, each, money, time, pct), the named quantities
 * and every positional quantity's role tag (its kind, and the each / times / more-or-less / in-the-question cues
 * beside it), plus the unit word after each positional quantity. act/prompt.mjs gate 7 answers only a prompt whose
 * role form is one the matching program fit in development; bench/program-guard.mjs --forms writes those forms.
 * @param {string|object} textOrParse
 * @returns {{role: string, units: string[]}}
 */
export function questionForm(textOrParse) {
  const p = typeof textOrParse === 'string' ? parse(textOrParse) : textOrParse;
  return { role: patterns(p).role, units: p.pos.map((q) => (q.next && q.next[0]) || '') };
}

/**
 * THE PATTERN AT A LEVEL of a role form (board 35, item program-guard): the role form is 'n|q|x|r' (patterns(p).role),
 * and the coarser levels are its parts: cue 'n|q|x', named 'n|x', count 'n'. No part holds a '|' (the question cues,
 * the named leaves and the role tags are words and letters), so patternAt(patterns(p).role, lv) === patterns(p)[lv];
 * bench/program-guard.mjs --forms checks that on every development row it indexes before it writes the index.
 * @param {string} role @param {string} level one of LEVELS @returns {string}
 */
export function patternAt(role, level) {
  const p = String(role).split('|');
  if (level === 'role') return String(role);
  if (level === 'cue') return p.slice(0, 3).join('|');
  if (level === 'named') return p[0] + '|' + p[2];
  if (level === 'count') return p[0];
  throw new Error('not a level: ' + level);
}
