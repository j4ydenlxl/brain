// reason/solved.mjs: THE SOLVED-PROGRAM MEMORY (Board 15, item ns). Author: board 15 builder.
//
// His order of 2026-09-24 14:31: "it should be nanoseconds per response at 400 B checkpoint flr
// now". The math region (reason/math.mjs) answers a word problem by having the model write a
// program solve() and running it in a sandbox, which costs seconds of model time per question.
// Once a program has been verified on a question, the model is not needed for that question
// again, nor for the same question with other numbers: the program IS the solution of the class.
// This file keeps every such program as a TEMPLATE and answers a question that matches one with
// no model call.
//
// A TEMPLATE is three things:
//   the question with its numbers abstracted to slots (abstractNumbers below: digits, thousands
//     commas, decimals, and the number words zero to ninety-nine; each slot keeps its spelling
//     style so the text renders back exactly, which the tests check as a round trip),
//   the program with the same slots (bindProgram: every numeric literal of the program whose
//     value equals a question number is bound to that number's slot; 0 and 1 are never bound,
//     because a program uses them as arithmetic constants far more often than as the question's
//     "one"),
//   the verification it passed (the gold answer it matched in the journal, or the vote and the
//     checker verdict of the math region when it was learned live, and always a re-run of the
//     program in reason/math.mjs runProgram, the sandbox, reproducing that answer).
//
// THE MATCH. A question is normalised (whitespace collapsed, lower case, curly quotes made
// straight, and the instruction bench/public.mjs ALONE_PROMPT appends removed). Its exact
// normalised text is looked up first; then its slot form. Both keys come out of ONE pass over the
// question as it arrives (scanKey: no string built, 96 bit keys) and live in memory/direct.mjs
// SolvedTable. On a text hit the template runs on its own numbers; on a form hit the slots are
// bound to the new question's numbers and the template is checked before it runs:
//   constraints  a question number the program never used must keep its value (the program may
//                have folded it into a constant, 20% written as 0.2), and numbers that bound the
//                same literal must stay equal;
//   the run      the program must return a finite number;
//   the shape    an integer answer stays an integer, a non-negative one stays non-negative;
//   agreement    when several templates share the form, every one that passes must agree.
// A template that fails any of these is SKIPPED with its reason counted, and the ask falls through
// to the next region (the exact path, memory, the math region with its model cell).
//
// THE TWO RUNNERS. A program that is STRAIGHT LINE (fastCheck: one function solve() with no
// loops, no calls but Math.*, no member access but Math.*, no strings, no arrays, every name
// declared by let, const or var) is compiled ONCE into a function of its slots inside a node:vm
// context with code generation from strings off, so a response costs one normalisation, two
// hashes, one probe and one call: nanoseconds to microseconds. At fill time the compiled function
// must agree with the sandbox on the question's own numbers AND on the numbers doubled, or the
// template is not fast. Any other program runs in the sandbox (reason/math.mjs runProgram, a
// worker with a heap cap and a wall clock) with the new numbers written into its literals:
// milliseconds, still no model. Every answer says which runner produced it.
//
// THE FILE: state/self/ns-templates.jsonl, one template per line (TEMPLATE_FIELDS). ask() reads it
// only when a caller asks for the default memory (opts.solved === true, or BRAIN_SOLVED=1), and a
// memory that learns appends every template it keeps to its own file, so every model answer the
// math region verifies makes the same question class a template the next time.
//
// MODEL OFF: nothing here opens a socket.
import { readFileSync, existsSync, appendFileSync, mkdirSync, writeFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SolvedTable } from '../memory/direct.mjs';
import { runProgram, valueKey, renderAnswer } from './math.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const AUTHOR = 'board 15 builder';
export const SOLVED_FORMAT = 1;
export const TEMPLATES_REL = 'state/self/ns-templates.jsonl';
export const TEMPLATES_FILE = path.join(ROOT, TEMPLATES_REL);
/** The instruction bench/public.mjs ALONE_PROMPT appends to every GSM8K question, normalised. */
export const INSTRUCTION = 'answer with the final number.';
/** Literal values a program uses as constants far more often than as the question's own number. */
export const NEVER_BIND = Object.freeze([0, 1]);
/** The Math members a straight-line program may name. */
export const MATH_MEMBERS = Object.freeze(['abs', 'ceil', 'floor', 'round', 'trunc', 'max', 'min', 'pow', 'sqrt', 'cbrt', 'sign', 'hypot', 'log', 'log10', 'log2', 'exp', 'PI', 'E']);
/** Why a template was skipped on a question, one counter each. */
export const SKIP_REASONS = Object.freeze(['constraint', 'throw', 'nonfinite', 'shape', 'disagree', 'render']);
/** The journal arms that carry a program, in the order a record's programs are kept. */
export const PROGRAM_ARMS = Object.freeze(['pot5v', 'pot5', 'pot1', 'pot1@big']);

// ------------------------------------------------------------------ normalisation
const QUOTE_ANY = /[‘’“”]/;
const WS = /\s+/g;

/**
 * The normalised question: whitespace collapsed, lower case, curly quotes straight, and the
 * trailing ALONE_PROMPT instruction removed.
 * @param {string} text
 * @returns {string}
 */
export function normText(text) {
  let t = String(text ?? '').replace(WS, ' ').trim().toLowerCase();
  if (t.endsWith(INSTRUCTION)) t = t.slice(0, t.length - INSTRUCTION.length).trimEnd();
  if (QUOTE_ANY.test(t)) t = t.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  return t;
}

// ------------------------------------------------------------------ number abstraction
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const WORD_VALUE = new Map([...ONES.map((w, i) => [w, i]), ...TENS.map((w, i) => [w, i * 10]).filter(([w]) => w)]);
const UNITS = ONES.slice(1, 10).join('|');
const WORDS = [...TENS.filter(Boolean).map((w) => w + '(?:-(?:' + UNITS + '))?'), ...[...ONES].sort((a, b) => b.length - a.length)].join('|');
/** Digits (thousands commas and decimals kept) or a number word from zero to ninety-nine. */
export const NUMBER_RE = new RegExp('(\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|\\d+(?:\\.\\d+)?)|\\b(' + WORDS + ')\\b', 'g');
const SLOT_DIGIT = '\u0001', SLOT_WORD = '\u0002';

/** The English word of an integer from 0 to 99, or null. */
export function numberWord(v) {
  if (!Number.isInteger(v) || v < 0 || v > 99) return null;
  if (v < 20) return ONES[v];
  const t = TENS[Math.floor(v / 10)], u = v % 10;
  return u ? t + '-' + ONES[u] : t;
}

/**
 * The question's numbers as slots. styles[i] is 'w' for a word, else 'd' (plain) or 'c' (thousands
 * commas) followed by the count of decimals the question wrote.
 * @param {string} norm a normalised question
 * @returns {{norm: string, form: string, parts: string[], values: number[], styles: string[]}}
 */
export function abstractNumbers(norm) {
  const parts = [], values = [], styles = [];
  let last = 0, m;
  NUMBER_RE.lastIndex = 0;
  while ((m = NUMBER_RE.exec(norm)) !== null) {
    parts.push(norm.slice(last, m.index));
    if (m[1] !== undefined) {
      const raw = m[1];
      const comma = raw.indexOf(',') >= 0;
      const plain = comma ? raw.replace(/,/g, '') : raw;
      const dot = plain.indexOf('.');
      const whole = dot >= 0 ? dot : plain.length;
      values.push(Number(plain));
      // a written leading zero (007, 05.30) keeps its width: 'p' and the digits before the point
      styles.push((comma ? 'c' : 'd') + (dot >= 0 ? plain.length - dot - 1 : 0) + (whole > 1 && plain[0] === '0' ? 'p' + whole : ''));
    } else {
      const w = m[2], h = w.indexOf('-');
      values.push(h < 0 ? WORD_VALUE.get(w) : WORD_VALUE.get(w.slice(0, h)) + WORD_VALUE.get(w.slice(h + 1)));
      styles.push('w');
    }
    last = m.index + m[0].length;
  }
  parts.push(norm.slice(last));
  let form = parts[0];
  for (let i = 0; i < styles.length; i++) form += (styles[i] === 'w' ? SLOT_WORD : SLOT_DIGIT) + parts[i + 1];
  return { norm, form, parts, values, styles };
}

/** One number in a slot's style, or null when the style cannot spell it. */
export function renderNumber(v, style) {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return null;
  if (style === 'w') return numberWord(v);
  const sm = /^([cd])(\d+)(?:p(\d+))?$/.exec(style);
  if (!sm) return null;
  const dec = Number(sm[2]);
  const scaled = v * 10 ** dec;
  let s = Math.abs(scaled - Math.round(scaled)) < 1e-9 ? v.toFixed(dec) : String(v);
  if (/e/i.test(s)) return null;
  if (sm[3]) s = s.replace(/^\d+/, (d) => d.padStart(Number(sm[3]), '0'));
  if (sm[1] === 'c') s = s.replace(/^\d+/, (d) => d.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
  return s;
}

/**
 * The text of a slot form with these numbers in its slots (the inverse of abstractNumbers).
 * @param {{parts: string[], styles: string[]}} abs
 * @param {number[]} values
 * @returns {string|null} null when a style cannot spell a value
 */
export function renderForm(abs, values) {
  let out = abs.parts[0];
  for (let i = 0; i < abs.styles.length; i++) {
    const r = renderNumber(values[i], abs.styles[i]);
    if (r === null) return null;
    out += r + abs.parts[i + 1];
  }
  return out;
}

/** The slot form printed for a human: each slot as <d> or <w>. */
export function showForm(form) { return String(form).replaceAll(SLOT_DIGIT, '<d>').replaceAll(SLOT_WORD, '<w>'); }

// ------------------------------------------------------------------ the one-pass key
// THE KEY OF A QUESTION, in ONE pass over the text as it arrives: whitespace collapsed, ASCII
// letters lower cased and the ALONE_PROMPT instruction dropped on the fly, numbers recognised by
// the same grammar as NUMBER_RE (a hand scanner, cross-checked against the regex on every GSM8K
// question by test/solved.test.mjs). The pass writes two byte streams into scratch buffers:
//   the form stream   every character of the normalised text, except that a number writes ONE
//                     slot code (1 for digits, 2 for a word) instead of its characters;
//   the spell stream  the characters of each number as written, then a 0.
// (A character above U+007F, which only a normalised text reaches the scanner with, is written
// as 0xFF and its two bytes.) Each stream is then hashed four bytes at a time in three
// independent 32 bit lanes (hashBytes). The FORM key is the form lanes; the TEXT key is the form
// lanes mixed with the spell lanes, since a slot form and the spellings in its slots determine
// the normalised text. Keys are 96 bits: two lanes place a key in memory/direct.mjs SolvedTable
// and the third verifies it, with its low bit set to the kind so a text key and a form key never
// compare equal. No string is built and nothing is allocated. A raw text holding any character
// above U+007F takes the exact slow road instead (normText, then the same scanner over the
// normalised string), because Unicode lower casing and Unicode whitespace are not one character
// in, one character out. hashKey() is the REFERENCE: the same streams written from the regex
// over a normalised string; add() keys a template with it, and the tests hold the scanner to it.
const M1 = 0x01000193, M2 = 0x5bd1e995, M3 = 0x27d4eb2f;
const SEED = Object.freeze({ form: [0x811c9dc5 | 0, 0x3c6ef372 | 0, 0x243f6a88 | 0], spell: [0x9e3779b9 | 0, 0x7f4a7c15 | 0, 0x165667b1 | 0] });
function fmix32(h) {
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return h >>> 0;
}
// Three lanes over the first n bytes of a stream (its words view w; the caller zeroed the bytes
// from n to the next multiple of four). The length is mixed in, so padding cannot collide.
function hashBytes(w, n, seed, out, at) {
  let h1 = seed[0], h2 = seed[1], h3 = seed[2];
  const words = (n + 3) >>> 2;
  for (let i = 0; i < words; i++) {
    const x = w[i];
    h1 = Math.imul(h1 ^ x, M1); h1 ^= h1 >>> 15;
    h2 = Math.imul(h2 ^ x, M2); h2 ^= h2 >>> 13;
    h3 = Math.imul(h3 ^ x, M3); h3 ^= h3 >>> 16;
  }
  out[at] = fmix32(h1 ^ n); out[at + 1] = fmix32(h2 ^ Math.imul(n, 0x9e3779b1)); out[at + 2] = fmix32(h3 ^ Math.imul(n, 0x85ebca77));
}
const LANES = new Uint32Array(6);
function finish(out) {
  // LANES: form 0..2, spell 3..5
  const a1 = LANES[0], a2 = LANES[1], a3 = LANES[2];
  out[0] = fmix32(a1 ^ Math.imul(LANES[3], 0x9e3779b1));
  out[1] = fmix32(a2 ^ Math.imul(LANES[4], 0x85ebca77));
  out[2] = fmix32(a3 ^ Math.imul(LANES[5], 0xc2b2ae3d)) & ~1;
  out[3] = a1; out[4] = a2; out[5] = (a3 & ~1) | 1;
  return out;
}
/** The scanner's output: text hi, lo, v then form hi, lo, v (the low bit of v is the kind). */
export const KEY = new Uint32Array(6);
let FB = new Uint8Array(1024), FW = new Uint32Array(FB.buffer);
let SB = new Uint8Array(1024), SW = new Uint32Array(SB.buffer);
let VALS = new Float64Array(64);
function room(n) {
  const cap = Math.max(1024, 1 << Math.ceil(Math.log2(n + 16)));
  if (FB.length < cap) { FB = new Uint8Array(cap); FW = new Uint32Array(FB.buffer); }
  if (SB.length < cap) { SB = new Uint8Array(cap); SW = new Uint32Array(SB.buffer); }
}
const POW10 = Array.from({ length: 23 }, (_, i) => 10 ** i);
const INS_CODES = Array.from(INSTRUCTION, (ch) => ch.charCodeAt(0));
// number words by first letter: [length, value, codes], and the lengths a number word of each
// first letter can have as a bit mask (most prose words stop at the mask)
const WORD_TABLE = Array.from({ length: 26 }, () => []);
const LEN_MASK = new Int32Array(26);
for (const [w, v] of WORD_VALUE) { const i = w.charCodeAt(0) - 97; WORD_TABLE[i].push([w.length, v, Array.from(w, (ch) => ch.charCodeAt(0))]); LEN_MASK[i] |= 1 << w.length; }
const isWs = (c) => c === 32 || (c >= 9 && c <= 13);
const isDigit = (c) => c >= 48 && c <= 57;
const isLetter = (c) => (c | 32) >= 97 && (c | 32) <= 122;
const isWordChar = (c) => ((c | 32) >= 97 && (c | 32) <= 122) || (c >= 48 && c <= 57) || c === 95;

/**
 * THE REFERENCE KEYS of a string that is already normalised: the two streams written from the
 * regex (NUMBER_RE, abstractNumbers' grammar), hashed as the scanner hashes them, in KEY's order.
 * @param {string} norm
 * @returns {Uint32Array} text hi, lo, v, form hi, lo, v
 */
export function hashKey(norm) {
  const s = String(norm);
  const fb = new Uint8Array((3 * s.length + 11) & ~3), sb = new Uint8Array((2 * s.length + 11) & ~3);
  let fn = 0, sn = 0, last = 0, m;
  const put = (c) => { if (c > 127) { fb[fn++] = 0xff; fb[fn++] = c >>> 8; fb[fn++] = c & 0xff; } else fb[fn++] = c; };
  NUMBER_RE.lastIndex = 0;
  while ((m = NUMBER_RE.exec(s)) !== null) {
    for (let i = last; i < m.index; i++) put(s.charCodeAt(i));
    fb[fn++] = m[1] !== undefined ? 1 : 2;
    for (let i = 0; i < m[0].length; i++) sb[sn++] = m[0].charCodeAt(i);
    sb[sn++] = 0;
    last = m.index + m[0].length;
  }
  for (let i = last; i < s.length; i++) put(s.charCodeAt(i));
  const lanes = new Uint32Array(6);
  hashBytes(new Uint32Array(fb.buffer), fn, SEED.form, lanes, 0);
  hashBytes(new Uint32Array(sb.buffer), sn, SEED.spell, lanes, 3);
  LANES.set(lanes);
  return finish(new Uint32Array(6));
}

// The value of the number word at s[p, p+len), lower cased on read, or -1.
function wordAt(s, p, len) {
  const i = (s.charCodeAt(p) | 32) - 97;
  if (len < 3 || len > 9 || i < 0 || i > 25 || !((LEN_MASK[i] >> len) & 1)) return -1;
  const cands = WORD_TABLE[i];
  outer: for (let j = 0; j < cands.length; j++) {
    const w = cands[j];
    if (w[0] !== len) continue;
    const codes = w[2];
    for (let q = 1; q < len; q++) if ((s.charCodeAt(p + q) | 32) !== codes[q]) continue outer;
    return w[1];
  }
  return -1;
}

// Where the ALONE_PROMPT instruction starts when [start, end) ends with it (whitespace runs
// matching its single spaces, ASCII case folded), trimmed; else end.
function stripInstruction(s, start, end) {
  let q = end;
  for (let k = INS_CODES.length - 1; k >= 0; k--) {
    const ic = INS_CODES[k];
    if (ic === 32) {
      if (q <= start || !isWs(s.charCodeAt(q - 1))) return end;
      while (q > start && isWs(s.charCodeAt(q - 1))) q--;
    } else {
      const c = s.charCodeAt(q - 1);
      if (q <= start || (c >= 65 && c <= 90 ? c + 32 : c) !== ic) return end;
      q--;
    }
  }
  while (q > start && isWs(s.charCodeAt(q - 1))) q--;
  return q;
}

/**
 * THE SCANNER: fill KEY (text and form keys) and the scratch values from one pass over s.
 * pre true: s is already normalised (a character above U+007F is plain text). pre false: s is raw;
 * the scan returns -1 at the first character above U+007F and the caller takes the slow road.
 * @returns {number} how many numbers the question holds, or -1
 */
export function scanKey(s, pre) {
  let start = 0, end = s.length;
  if (!pre) {
    while (start < end && isWs(s.charCodeAt(start))) start++;
    while (end > start && isWs(s.charCodeAt(end - 1))) end--;
    end = stripInstruction(s, start, end);
  }
  if (FB.length < 3 * (end - start) + 16) room(3 * (end - start));
  const fb = FB, sb = SB;
  let fn = 0, sn = 0, nv = 0, prevWord = false, p = start;
  while (p < end) {
    const c = s.charCodeAt(p);
    const lc = c | 32;
    if (lc >= 97 && lc <= 122) {
      // a letter run: prose in the form stream, unless it proves to be a number word
      const f0 = fn;
      let q = p, d = lc;
      do { fb[fn++] = d; if (++q >= end) break; d = s.charCodeAt(q) | 32; } while (d >= 97 && d <= 122);
      if (!prevWord && !(q < end && isWordChar(s.charCodeAt(q)))) {
        const v = wordAt(s, p, q - p);
        if (v >= 0) {
          let e = q, val = v;
          if (v >= 20 && q + 1 < end && s.charCodeAt(q) === 45) {
            let r = q + 1;
            while (r < end && isLetter(s.charCodeAt(r))) r++;
            if (!(r < end && isWordChar(s.charCodeAt(r)))) { const u = wordAt(s, q + 1, r - q - 1); if (u >= 1 && u <= 9) { e = r; val = v + u; } }
          }
          fn = f0; fb[fn++] = 2;
          for (let r = p; r < e; r++) sb[sn++] = s.charCodeAt(r) | 32; // letters lower cased; '-' is 45 either way
          sb[sn++] = 0;
          if (nv === VALS.length) { const gr = new Float64Array(VALS.length * 2); gr.set(VALS); VALS = gr; }
          VALS[nv++] = val;
          q = e;
        }
      }
      prevWord = true; p = q; continue;
    }
    if (c >= 48 && c <= 57) {
      // NUMBER_RE's digit alternatives: \d{1,3}(?:,\d{3})+(?:\.\d+)? then \d+(?:\.\d+)?
      let q = p;
      while (q < end && isDigit(s.charCodeAt(q))) q++;
      if (q - p <= 3) {
        while (q + 3 < end && s.charCodeAt(q) === 44 && isDigit(s.charCodeAt(q + 1)) && isDigit(s.charCodeAt(q + 2)) && isDigit(s.charCodeAt(q + 3))) q += 4;
      }
      if (q + 1 < end && s.charCodeAt(q) === 46 && isDigit(s.charCodeAt(q + 1))) { q += 2; while (q < end && isDigit(s.charCodeAt(q))) q++; }
      let mant = 0, nd = 0, dec = 0, dot = false;
      for (let r = p; r < q; r++) {
        const d = s.charCodeAt(r);
        sb[sn++] = d;
        if (d === 46) dot = true;
        else if (d !== 44) { mant = mant * 10 + (d - 48); nd++; if (dot) dec++; }
      }
      sb[sn++] = 0;
      fb[fn++] = 1;
      if (nv === VALS.length) { const gr = new Float64Array(VALS.length * 2); gr.set(VALS); VALS = gr; }
      VALS[nv++] = nd > 15 ? Number(s.slice(p, q).replaceAll(',', '')) : dec ? mant / POW10[dec] : mant;
      prevWord = true; p = q; continue;
    }
    if (c === 32 || (c >= 9 && c <= 13)) {
      p++;
      while (p < end && isWs(s.charCodeAt(p))) p++;
      fb[fn++] = 32;
      prevWord = false; continue;
    }
    if (c > 127) {
      if (!pre) return -1;
      fb[fn++] = 0xff; fb[fn++] = c >>> 8; fb[fn++] = c & 0xff;
    } else fb[fn++] = c;
    prevWord = c === 95; p++;
  }
  fb[fn] = 0; fb[fn + 1] = 0; fb[fn + 2] = 0;
  sb[sn] = 0; sb[sn + 1] = 0; sb[sn + 2] = 0;
  hashBytes(FW, fn, SEED.form, LANES, 0);
  hashBytes(SW, sn, SEED.spell, LANES, 3);
  finish(KEY);
  return nv;
}

/** scanKey on a raw question, taking the slow road for a non-ASCII text. */
export function keyOf(text) {
  const s = typeof text === 'string' ? text : String(text ?? '');
  const n = scanKey(s, false);
  return n >= 0 ? n : scanKey(normText(s), true);
}

/** A copy of the values of the last scan, as a plain array. */
export function scannedValues(n) {
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = VALS[i];
  return out;
}

// ------------------------------------------------------------------ the program
const TOKEN_RE = /(\s+)|(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(0[xXbBoO][0-9a-fA-F_]+|\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?|\.\d[\d_]*(?:[eE][+-]?\d+)?)|([A-Za-z_$][\w$]*)|(\*\*=|===|!==|>>>=|>>>|<<=|>>=|\*\*|<=|>=|==|!=|&&=|\|\|=|\?\?=|&&|\|\||\?\?|\?\.|\+\+|--|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|=>|<<|>>|[-+*/%=<>!?:;,.(){}[\]~^&|])|(["'`])|([\s\S])/y;

/**
 * The tokens of a program: numbers (with value), identifiers and operators, each with its span.
 * Whitespace and comments are skipped. A quote marks the program as holding a string.
 * @param {string} code
 * @returns {{tokens: {k: 'num'|'id'|'op', s: string, a: number, b: number, v?: number}[], quote: boolean, stray: string[]}}
 */
export function tokenize(code) {
  const src = String(code ?? '');
  const tokens = [], stray = [];
  let quote = false, m;
  TOKEN_RE.lastIndex = 0;
  while (TOKEN_RE.lastIndex < src.length && (m = TOKEN_RE.exec(src)) !== null) {
    const a = m.index, b = a + m[0].length;
    if (m[1] !== undefined || m[2] !== undefined) continue;
    if (m[3] !== undefined) tokens.push({ k: 'num', s: m[3], a, b, v: Number(m[3].replace(/_/g, '')) });
    else if (m[4] !== undefined) tokens.push({ k: 'id', s: m[4], a, b });
    else if (m[5] !== undefined) tokens.push({ k: 'op', s: m[5], a, b });
    else if (m[6] !== undefined) { quote = true; tokens.push({ k: 'op', s: m[6], a, b }); }
    else stray.push(m[7]);
  }
  return { tokens, quote, stray };
}

/**
 * Bind a program's numeric literals to the question's slots. A literal equal to one question
 * number binds to its slot; equal to several, to the first, and those slots must stay equal (a
 * group); 0 and 1 never bind; a literal that is an argument of toFixed or toPrecision never binds.
 * A question number no literal bound is FIXED: a new question must keep its value.
 * @param {string} program
 * @param {{values: number[]}} abs
 * @returns {{ok: boolean, reason: string|null, binds: {a: number, b: number, slot: number}[], fixed: number[], groups: number[][], tokens: object}}
 */
export function bindProgram(program, abs) {
  const tk = tokenize(program);
  const binds = [], used = new Set(), groups = [], seenGroup = new Set();
  if (tk.quote) return { ok: false, reason: 'the program holds a string literal', binds, fixed: [], groups, tokens: tk };
  const t = tk.tokens;
  for (let i = 0; i < t.length; i++) {
    const x = t[i];
    if (x.k !== 'num' || !Number.isFinite(x.v) || NEVER_BIND.includes(x.v)) continue;
    if (i >= 2 && t[i - 1].s === '(' && t[i - 2].k === 'id' && (t[i - 2].s === 'toFixed' || t[i - 2].s === 'toPrecision')) continue;
    const slots = [];
    for (let j = 0; j < abs.values.length; j++) if (abs.values[j] === x.v) slots.push(j);
    if (!slots.length) continue;
    binds.push({ a: x.a, b: x.b, slot: slots[0] });
    for (const j of slots) used.add(j);
    if (slots.length > 1 && !seenGroup.has(slots.join(','))) { seenGroup.add(slots.join(',')); groups.push(slots); }
  }
  const fixed = [];
  for (let j = 0; j < abs.values.length; j++) if (!used.has(j)) fixed.push(j);
  return { ok: true, reason: null, binds, fixed, groups, tokens: tk };
}

const ALLOWED_KEYWORDS = new Set(['let', 'const', 'var', 'return', 'if', 'else', 'true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);
const VALUE_WORDS = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);
const DECL = new Set(['let', 'const', 'var']);
const ASSIGN_OPS = new Set(['=', '+=', '-=', '*=', '/=', '%=', '**=', '&=', '|=', '^=', '<<=', '>>=', '>>>=', '&&=', '||=', '??=', '++', '--']);
const REJECT_OPS = new Set(['=>', '[', ']', '?.']);
const MATH_SET = new Set(MATH_MEMBERS);

/**
 * Whether a program is STRAIGHT LINE, so it may be compiled once and called in-process: exactly
 * `function solve() { ... }`, and inside it only declared locals, numbers, arithmetic, comparison,
 * logic, the conditional operator, if and else, return, and Math.<member> (MATH_MEMBERS). No loop
 * keyword, no call but Math.*, no member access but Math.*, no string, no array, no arrow, no
 * nested function. A program that fails is not refused: it runs in the sandbox instead.
 * @param {{tokens: object[], quote: boolean, stray: string[]}} tk tokenize()'s result
 * @returns {{ok: boolean, reason: string|null, declared: string[]}}
 */
export function fastCheck(tk) {
  const no = (reason) => ({ ok: false, reason, declared: [] });
  if (tk.quote) return no('a string literal');
  if (tk.stray.length) return no('a character outside the grammar: ' + JSON.stringify(tk.stray[0]));
  const t = tk.tokens;
  if (t.length < 6 || t[0].s !== 'function' || t[1].s !== 'solve' || t[2].s !== '(' || t[3].s !== ')' || t[4].s !== '{') return no('not exactly function solve() { ... }');
  let depth = 0, end = -1;
  for (let i = 4; i < t.length; i++) {
    if (t[i].s === '{') depth++;
    else if (t[i].s === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end < 0) return no('unbalanced braces');
  for (let i = end + 1; i < t.length; i++) if (t[i].s !== ';') return no('code after solve()');
  const body = t.slice(5, end);
  // pass 1: the declared names
  const declared = new Set();
  let inDecl = false, declDepth = 0, expectName = false, d = 0;
  for (const x of body) {
    if (x.k === 'id' && DECL.has(x.s)) { inDecl = true; declDepth = d; expectName = true; continue; }
    if (expectName) {
      if (x.k !== 'id' || ALLOWED_KEYWORDS.has(x.s) || x.s === 'Math' || x.s === 'solve' || x.s === 'arguments' || x.s === 'eval' || x.s.startsWith('__')) return no('a declaration that is not a plain new name: ' + x.s);
      declared.add(x.s); expectName = false; continue;
    }
    if (x.s === '(' || x.s === '{') d++;
    else if (x.s === ')' || x.s === '}') d--;
    else if (inDecl && d === declDepth && x.s === ',') expectName = true;
    else if (inDecl && d === declDepth && x.s === ';') inDecl = false;
  }
  // pass 2: every token against the grammar
  for (let i = 0; i < body.length; i++) {
    const x = body[i], prev = i > 0 ? body[i - 1] : null, next = i + 1 < body.length ? body[i + 1] : null;
    if (x.k === 'op') {
      if (REJECT_OPS.has(x.s)) return no('operator ' + x.s);
      if (x.s === '.') {
        if (!prev || prev.s !== 'Math' || !next || next.k !== 'id' || !MATH_SET.has(next.s)) return no('member access that is not Math.<member>');
        const after = i + 2 < body.length ? body[i + 2] : null;
        if (after && ASSIGN_OPS.has(after.s)) return no('an assignment to Math.' + next.s);
        continue;
      }
      if (x.s === '(' && prev) {
        if (prev.k === 'id' && !(ALLOWED_KEYWORDS.has(prev.s) && !VALUE_WORDS.has(prev.s))) {
          const isMathCall = i >= 3 && body[i - 2].s === '.' && body[i - 3].s === 'Math' && MATH_SET.has(prev.s);
          if (!isMathCall) return no('a call that is not Math.<member>(): ' + prev.s);
        } else if (prev.s === ')') return no('a call on a call result');
      }
      continue;
    }
    if (x.k === 'num') continue;
    // an identifier
    if (prev && prev.s === '.') continue; // the member name, already checked at the dot
    if (x.s === 'Math') { if (!next || next.s !== '.') return no('Math used as a value'); continue; }
    if (ALLOWED_KEYWORDS.has(x.s)) continue;
    if (!declared.has(x.s)) return no('an undeclared name: ' + x.s);
  }
  return { ok: true, reason: null, declared: [...declared] };
}

let FAST_CONTEXT = null;
function fastContext() {
  if (!FAST_CONTEXT) FAST_CONTEXT = vm.createContext({}, { name: 'solved-fast', codeGeneration: { strings: false, wasm: false } });
  return FAST_CONTEXT;
}

/** The program with each bound literal replaced: by `__s[slot]` (compiled) or by a value (sandbox). */
export function substitute(program, binds, write) {
  const src = String(program);
  let out = '', pos = 0;
  for (const b of [...binds].sort((x, y) => x.a - y.a)) { out += src.slice(pos, b.a) + write(b.slot); pos = b.b; }
  return out + src.slice(pos);
}

/**
 * Compile a straight-line program ONCE into a function of its slot values, inside a vm context
 * with code generation from strings off (the second wall behind fastCheck).
 * @returns {Function|null}
 */
export function compileFast(program, binds) {
  const src = '"use strict";\n' + substitute(program, binds, (slot) => '__s[' + slot + ']') + '\nreturn solve();';
  try { return vm.compileFunction(src, ['__s'], { parsingContext: fastContext() }); } catch { return null; }
}

/** The program as the sandbox runs it with these slot values in its bound literals. */
export function programFor(template, values) {
  return substitute(template.program, template.binds, (slot) => {
    const v = values[slot];
    return v < 0 ? '(' + String(v) + ')' : String(v);
  });
}

// ------------------------------------------------------------------ templates
const r3 = (x) => Math.round(x * 1000) / 1000;
const sha12 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 12);

/** The fields a template line carries on disk (fn is rebuilt from program and binds on load). */
export const TEMPLATE_FIELDS = Object.freeze(['format', 'id', 'by', 'at', 'source', 'question', 'parts', 'styles', 'values', 'program', 'binds', 'fixed', 'groups', 'answer', 'integer', 'nonNegative', 'fast', 'fastWhy', 'verification']);

/**
 * Build and verify one template. The program must reproduce `answer` in the sandbox on the
 * question's own numbers; a straight-line program is also compiled, and the compiled function must
 * agree with the sandbox on the question's numbers and on its bound numbers doubled.
 * @param {object} o { question, program, answer, verification, source, by, at, timeoutMs }
 * @returns {Promise<{ok: boolean, reason: string|null, template: object|null}>}
 */
export async function makeTemplate(o) {
  const norm = normText(o.question);
  const abs = abstractNumbers(norm);
  const program = String(o.program ?? '').trim();
  if (!program) return { ok: false, reason: 'no program', template: null };
  const want = valueKey(Number(o.answer));
  if (want === null) return { ok: false, reason: 'the verified answer is not a finite number', template: null };
  const bound = bindProgram(program, abs);
  if (!bound.ok) return { ok: false, reason: bound.reason, template: null };
  const run = await runProgram(program, { timeoutMs: o.timeoutMs ?? 2000 });
  if (!run.ok) return { ok: false, reason: 'the sandbox did not run it: ' + run.error, template: null };
  if (valueKey(run.value) !== want) return { ok: false, reason: 'the sandbox returned ' + valueKey(run.value) + ', not the verified ' + want, template: null };
  const v = Number(want);
  const t = {
    format: SOLVED_FORMAT, id: sha12(abs.form + '\u0000' + program), by: o.by || 'fill from journal (' + AUTHOR + ')', at: o.at || new Date().toISOString(),
    source: o.source || null, question: norm, parts: abs.parts, styles: abs.styles, values: abs.values, program,
    binds: bound.binds, fixed: bound.fixed, groups: bound.groups,
    answer: renderAnswer(v), integer: Number.isInteger(v), nonNegative: v >= 0, fast: false, fastWhy: null,
    verification: { ...(o.verification || {}), sandbox: valueKey(run.value), compiled: null, doubled: null },
  };
  // the compiled runner: straight line, agrees with the sandbox on the question's numbers and doubled
  const fc = fastCheck(bound.tokens);
  if (!fc.ok) t.fastWhy = fc.reason;
  else {
    const fn = compileFast(program, t.binds);
    let got = null;
    try { got = fn ? fn(t.values) : null; } catch (e) { t.fastWhy = 'the compiled function threw: ' + String(e && e.message).slice(0, 80); }
    if (fn && t.fastWhy === null) {
      t.verification.compiled = valueKey(got);
      if (valueKey(got) !== want) t.fastWhy = 'the compiled function returned ' + valueKey(got) + ', the sandbox ' + want;
      else if (t.binds.length) {
        const doubled = t.values.map((x, j) => (t.fixed.includes(j) ? x : 2 * x));
        const sb = await runProgram(programFor(t, doubled), { timeoutMs: o.timeoutMs ?? 2000 });
        let cv = null;
        try { cv = fn(doubled); } catch { cv = null; }
        const sk = sb.ok ? valueKey(sb.value) : null, ck = valueKey(cv);
        t.verification.doubled = { sandbox: sk, compiled: ck };
        if (sk !== ck) t.fastWhy = 'on the doubled numbers the compiled function returned ' + ck + ', the sandbox ' + sk;
      }
      if (t.fastWhy === null) t.fast = true;
    } else if (!fn && t.fastWhy === null) t.fastWhy = 'the program did not compile in the fast context';
  }
  return { ok: true, reason: null, template: t };
}

/** A template line as JSON (the compiled function is not written). */
export function templateLine(t) {
  const o = {};
  for (const k of TEMPLATE_FIELDS) o[k] = t[k] === undefined ? null : t[k];
  return JSON.stringify(o);
}

// ------------------------------------------------------------------ the memory
const MISS_NO_TEMPLATE = Object.freeze({ hit: false, why: 'no template' });
const NO_SKIPS = Object.freeze({});
/** A fresh counter set. */
export function newStats() {
  return { asked: 0, hits: 0, text: 0, form: 0, compiled: 0, sandbox: 0, stored: 0, misses: 0, noTemplate: 0, allSkipped: 0, skipped: Object.fromEntries(SKIP_REASONS.map((r) => [r, 0])), learned: 0, learnRefused: 0 };
}

export class SolvedMemory {
  /** @param {object} [opts] { file: where learn() appends, learn: true to learn from model answers } */
  constructor(opts = {}) {
    this.table = new SolvedTable({ capacity: opts.capacity || 512 });
    this.templates = [];
    this.byId = new Map();
    this.file = opts.file || null;
    this.learn = opts.learn === true;
    this.stats = newStats();
    this._why = null;
  }

  get size() { return this.templates.length; }

  /**
   * Add a template (from makeTemplate or a file line): index it under its text and its form, and
   * compile a fast one. A template with an id already held is not added twice.
   * @returns {boolean} added
   */
  add(t) {
    if (this.byId.has(t.id)) return false;
    const tt = { ...t };
    tt.fn = tt.fast ? compileFast(tt.program, tt.binds) : null;
    if (tt.fast && !tt.fn) { tt.fast = false; tt.fastWhy = 'the program did not compile on load'; }
    tt.fixedSet = tt.fixed;
    const i = this.templates.length;
    this.templates.push(tt);
    this.byId.set(tt.id, i);
    let form = tt.parts[0];
    for (let j = 0; j < tt.styles.length; j++) form += (tt.styles[j] === 'w' ? SLOT_WORD : SLOT_DIGIT) + tt.parts[j + 1];
    tt.form = form;
    tt.valuesF64 = Float64Array.from(tt.values);
    const k = hashKey(tt.question);
    this.table.add(k[0], k[1], k[2], 'text', tt.question, i);
    this.table.add(k[3], k[4], k[5], 'form', form, i);
    return true;
  }

  // Run one compiled template on these slot values: its answer key, or null with this._why set.
  _runFast(t, values) {
    let v;
    try { v = t.fn(values); } catch { this._why = 'throw'; return null; }
    if (typeof v !== 'number' || !Number.isFinite(v)) { this._why = 'nonfinite'; return null; }
    return this._shape(t, v);
  }

  // The answer key of a value when the template's shape allows it, else null with this._why set.
  _shape(t, v) {
    // reason/math.mjs valueKey, with its answer for an integer under 1e12 (12 significant digits) taken directly
    const k = Number.isInteger(v) && v < 1e12 && v > -1e12 ? String(v === 0 ? 0 : v) : valueKey(v);
    if (k === null) { this._why = 'nonfinite'; return null; }
    const x = Number(k);
    if ((t.integer && !Number.isInteger(x)) || (t.nonNegative && x < 0)) { this._why = 'shape'; return null; }
    return k;
  }

  _constraints(t, values, n = values.length) {
    if (n !== t.values.length) return false;
    for (const j of t.fixed) if (values[j] !== t.values[j]) return false;
    for (const g of t.groups) for (let q = 1; q < g.length; q++) if (values[g[q]] !== values[g[0]]) return false;
    return true;
  }

  // Count a skipped template, into this match's own tally (made on the first skip) and the stats.
  _skip(skipped, why) {
    const o = skipped || {};
    o[why] = (o[why] || 0) + 1;
    this.stats.skipped[why]++;
    return o;
  }

  /**
   * THE MATCH, synchronous: one scan of the question (keyOf), the exact normalised text first,
   * then the slot form. Compiled templates run here. Returns a hit, a miss (with why), or pending
   * (templates that need the sandbox; resolve() runs them). A miss allocates nothing.
   * @param {string} text
   * @returns {{hit: boolean, answer?: string, via?: 'text'|'form', run?: string, template?: object, templates?: number,
   *   pending?: object[], values?: number[], why?: string, skipped?: object}}
   */
  match(text) {
    const st = this.stats;
    st.asked++;
    const nv = keyOf(text);
    const tbl = this.table, tpls = this.templates;
    let e = tbl.first(tbl.lookup(KEY[0], KEY[1], KEY[2]));
    if (e >= 0) {
      let key = null, run = null, tpl = null, n = 0;
      for (; e >= 0; e = tbl.next[e]) {
        const t = tpls[tbl.tpl[e]];
        n++;
        const k = t.fast ? this._runFast(t, t.valuesF64) : t.answer;
        if (k === null) continue;
        if (key === null) { key = k; run = t.fast ? 'compiled' : 'stored'; tpl = t; } else if (k !== key) { key = null; st.skipped.disagree++; break; }
      }
      if (key !== null) { st.hits++; st.text++; st[run]++; return { hit: true, answer: key, via: 'text', run, template: tpl, templates: n, values: tpl.values }; }
    }
    e = tbl.first(tbl.lookup(KEY[3], KEY[4], KEY[5]));
    if (e < 0) { st.misses++; st.noTemplate++; return MISS_NO_TEMPLATE; }
    let skipped = null, pending = null, key = null, tpl = null, n = 0, disagree = false;
    for (; e >= 0; e = tbl.next[e]) {
      const t = tpls[tbl.tpl[e]];
      n++;
      if (!this._constraints(t, VALS, nv)) { skipped = this._skip(skipped, 'constraint'); continue; }
      if (!t.fast) { (pending || (pending = [])).push(t); continue; }
      const k = this._runFast(t, VALS);
      if (k === null) { skipped = this._skip(skipped, this._why); continue; }
      if (key === null) { key = k; tpl = t; } else if (k !== key) disagree = true;
    }
    if (disagree) { skipped = this._skip(skipped, 'disagree'); st.misses++; st.allSkipped++; return { hit: false, why: 'templates disagree', skipped }; }
    if (pending) return { hit: false, pending, known: key, knownTemplate: tpl, values: scannedValues(nv), why: 'needs the sandbox', skipped: skipped || {}, templates: n };
    if (key === null) { st.misses++; st.allSkipped++; return { hit: false, why: 'every template was skipped', skipped }; }
    st.hits++; st.form++; st.compiled++;
    return { hit: true, answer: key, via: 'form', run: 'compiled', template: tpl, templates: n, values: scannedValues(nv), skipped: skipped || NO_SKIPS };
  }

  /**
   * Finish a pending match: run each sandbox template on the new numbers (reason/math.mjs
   * runProgram), apply the same shape and agreement checks, and return a hit or a miss.
   */
  async resolve(m, opts = {}) {
    const st = this.stats;
    if (!m || m.hit || !m.pending) return m;
    let key = m.known ?? null, tpl = m.knownTemplate ?? null, disagree = false;
    let skipped = { ...(m.skipped || {}) };
    for (const t of m.pending) {
      const r0 = await runProgram(programFor(t, m.values), { timeoutMs: opts.timeoutMs ?? 2000 });
      if (!r0.ok) { skipped = this._skip(skipped, r0.error && /non-number/.test(r0.error) ? 'nonfinite' : 'throw'); continue; }
      const k = this._shape(t, r0.value);
      if (k === null) { skipped = this._skip(skipped, this._why); continue; }
      if (key === null) { key = k; tpl = t; } else if (k !== key) disagree = true;
    }
    if (disagree) { skipped = this._skip(skipped, 'disagree'); st.misses++; st.allSkipped++; return { hit: false, why: 'templates disagree', skipped }; }
    if (key === null) { st.misses++; st.allSkipped++; return { hit: false, why: 'every template was skipped', skipped }; }
    st.hits++; st.form++; st.sandbox++;
    return { hit: true, answer: key, via: 'form', run: 'sandbox', template: tpl, templates: m.templates, values: m.values, skipped };
  }

  /** match() then resolve(): the whole solved step. */
  async answer(text, opts = {}) {
    const m = this.match(text);
    return m.pending ? this.resolve(m, opts) : m;
  }

  /**
   * THE FILL FROM A LIVE ANSWER: a math region answer (provenance model+exact with its program)
   * becomes a template when its vote held a majority and its checker did not reject it, and the
   * sandbox reproduces it. A memory with a file appends the template there.
   * @param {string} question
   * @param {{answer: string, program: string, vote?: object, verified?: object, provenance?: string}} region
   * @returns {Promise<{kept: boolean, reason: string|null, template: object|null}>}
   */
  async learnFrom(question, region, opts = {}) {
    const refuse = (reason) => { this.stats.learnRefused++; return { kept: false, reason, template: null }; };
    if (!region || region.provenance !== 'model+exact') return refuse('not a model+exact answer');
    if (!region.program) return refuse('no program');
    const vote = region.vote || null;
    if (vote && Number.isInteger(vote.count) && Number.isInteger(vote.of) && vote.of > 1 && vote.count * 2 <= vote.of) return refuse('no majority: ' + vote.count + ' of ' + vote.of);
    if (vote && vote.tie) return refuse('a tied vote');
    if (region.verified && region.verified.verdict === 'reject') return refuse('the checker rejected it');
    const made = await makeTemplate({
      question, program: region.program, answer: region.answer, by: 'organism (solved learn)', source: { kind: 'live', model: opts.model ?? null },
      verification: { gold: null, votes: vote ? vote.count : null, of: vote ? vote.of : null, verdict: region.verified ? region.verified.verdict : null },
    });
    if (!made.ok) return refuse(made.reason);
    if (!this.add(made.template)) return refuse('already held');
    this.stats.learned++;
    if (this.file) { mkdirSync(path.dirname(this.file), { recursive: true }); appendFileSync(this.file, templateLine(made.template) + '\n'); }
    return { kept: true, reason: null, template: made.template };
  }

  /** Write every template to one file, whole (a temp file renamed over it). */
  save(file = this.file) {
    mkdirSync(path.dirname(file), { recursive: true });
    const tmp = file + '.tmp';
    writeFileSync(tmp, this.templates.map(templateLine).join('\n') + (this.templates.length ? '\n' : ''));
    renameSync(tmp, file);
    return { templates: this.templates.length, file };
  }

  /** Read a templates file (a missing file is an empty memory). */
  static load(file, opts = {}) {
    const mem = new SolvedMemory({ ...opts, file: opts.file ?? file });
    if (!existsSync(file)) return mem;
    for (const l of readFileSync(file, 'utf8').split(/\r?\n/)) {
      if (!l.trim()) continue;
      let t;
      try { t = JSON.parse(l); } catch { continue; }
      if (t && t.format === SOLVED_FORMAT && typeof t.program === 'string' && Array.isArray(t.parts)) mem.add(t);
    }
    return mem;
  }
}

// ------------------------------------------------------------------ the default memory
let DEFAULT = null;
/** The default memory: state/self/ns-templates.jsonl, read once per process (it learns into the same file). */
export function defaultSolvedMemory() {
  if (!DEFAULT) DEFAULT = SolvedMemory.load(TEMPLATES_FILE, { learn: process.env.BRAIN_SOLVED_LEARN === '1' });
  return DEFAULT;
}
/** Forget the default memory, so the next ask reads the file again. */
export function resetSolved() { DEFAULT = null; }

/**
 * The memory an ask uses: an explicit one (anything with match()), the default for true (or for
 * an absent option when BRAIN_SOLVED=1), else none.
 * @param {object} opts ask()'s options
 * @returns {SolvedMemory|null}
 */
export function solvedFor(opts = {}) {
  const s = opts.solved;
  if (s === false) return null;
  if (s && typeof s === 'object' && typeof s.match === 'function') return s;
  if (s === true || (s === undefined && process.env.BRAIN_SOLVED === '1')) return defaultSolvedMemory();
  return null;
}

// ------------------------------------------------------------------ the fill from the journals
/**
 * Every row of a journal that carries a program, with what the rest carry.
 * @param {string} file a .jsonl
 * @returns {{file: string, rows: number, arms: number, withProgram: number, records: Set<string>, programRecords: Set<string>, rowsWithProgram: object[]}}
 */
export function scanJournal(file) {
  const out = { file, rows: 0, arms: 0, withProgram: 0, records: new Set(), programRecords: new Set(), rowsWithProgram: [] };
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { return out; }
  for (const l of text.split(/\r?\n/)) {
    if (!l.trim()) continue;
    let r;
    try { r = JSON.parse(l); } catch { continue; }
    out.rows++;
    if (!r || r.type !== 'arm' || !r.id) continue;
    out.arms++;
    out.records.add(String(r.id));
    if (typeof r.program === 'string' && r.program.trim()) { out.withProgram++; out.programRecords.add(String(r.id)); out.rowsWithProgram.push(r); }
  }
  return out;
}

/**
 * Fill a memory from journal rows that carry a program. A row becomes a template only when it was
 * graded right (ok true against the gold answer) and the sandbox reproduces its answer. The
 * programs of one record are tried in PROGRAM_ARMS order; distinct programs each make a template.
 * @param {object} o { rows: journal rows with a program, questionOf(id): the question text, memory, onRow }
 * @returns {Promise<{memory: SolvedMemory, rows: number, graded: number, right: number, kept: number, duplicate: number,
 *   refused: object, records: Set<string>, fast: number, sandbox: number, fastWhy: object}>}
 */
export async function fillFromRows(o) {
  const mem = o.memory || new SolvedMemory();
  const rank = (arm) => { const i = PROGRAM_ARMS.indexOf(arm); return i < 0 ? PROGRAM_ARMS.length : i; };
  const rows = [...o.rows].sort((a, b) => (String(a.id) < String(b.id) ? -1 : String(a.id) > String(b.id) ? 1 : rank(a.arm) - rank(b.arm)));
  const rep = { memory: mem, rows: rows.length, graded: 0, right: 0, kept: 0, duplicate: 0, refused: {}, records: new Set(), fast: 0, sandbox: 0, fastWhy: {} };
  for (const r of rows) {
    if (typeof r.ok === 'boolean') rep.graded++;
    if (r.ok !== true) { rep.refused['graded wrong'] = (rep.refused['graded wrong'] || 0) + 1; continue; }
    rep.right++;
    const q = o.questionOf(String(r.id));
    if (!q) { rep.refused['no question text'] = (rep.refused['no question text'] || 0) + 1; continue; }
    const made = await makeTemplate({
      question: q, program: r.program, answer: r.got,
      source: { file: o.file || null, record: String(r.id), arm: r.arm, at: r.at || null },
      verification: { gold: r.gold ?? null, goldOk: true, votes: r.votes && r.votes[0] ? r.votes[0].count : null, of: r.samplesDrawn ?? null, verdict: r.verify ? r.verify.verdict : null },
    });
    if (!made.ok) { const k = made.reason.split(':')[0]; rep.refused[k] = (rep.refused[k] || 0) + 1; continue; }
    if (!mem.add(made.template)) { rep.duplicate++; continue; }
    rep.kept++;
    rep.records.add(String(r.id));
    if (made.template.fast) rep.fast++;
    else { rep.sandbox++; const k = String(made.template.fastWhy).split(':')[0]; rep.fastWhy[k] = (rep.fastWhy[k] || 0) + 1; }
    if (o.onRow) o.onRow(r, made.template);
  }
  return rep;
}

export const _internals = Object.freeze({ SLOT_DIGIT, SLOT_WORD, r3 });
