// act/exact-read.mjs: THE PURE HALF OF act/solve.mjs, the part that runs anywhere JavaScript runs.
//
// Split out of act/solve.mjs on 2026-09-26 (cloud session, queue item 12, his words of 11:32 EDT:
// "it should be cli in dilation.dev someday so i can prompt like any ai", and of 11:55 EDT: "Listen
// vcs must yell"). The tokenizer, the recursive descent parser, the BigInt rational evaluator and the
// spoken arithmetic front end below were written in act/solve.mjs and are MOVED here unchanged, so the
// CLI (act/solve.mjs imports them from this file) and the prompt box on dilation.dev (web/ask.mjs copies
// this file and tasks/exact.mjs byte for byte into web/dist/organism/) run the same code. This file
// imports nothing but tasks/exact.mjs: no node: module, no file, no socket, no model. That is what
// lets a visitor's browser answer "what is 17 times 23" with provenance exact in microseconds.
//
// readExact(text) is the browser organism's whole exact path, in the order act/solve.mjs solve()
// tries the same steps: the expression as written, the expression after a "compute:" prefix, the
// spoken reading, then the word problem reader (act/word.mjs) when one is passed in. An equation is
// not answered here: solve() hands it to the organism's sym.solve cell, which needs the cell runtime.
import * as E from '../tasks/exact.mjs';

// Caps, not tastes. A prompt is untrusted text, and an exponent read out of it decides how
// much BigInt work this process does: (9)^999999999 is a parse away from a hung organism.
// Every cap below refuses rather than approximates, so a capped prompt is a null and never
// a wrong answer.
export const CAPS = Object.freeze({
  chars: 20_000,      // the longest prompt the tokenizer will look at
  tokens: 4_096,      // the most tokens one expression may hold
  exponent: 512,      // |k| in a^k
  terms: 64,          // the most terms a sequence prompt may list
  demos: 16,          // the most demonstration pairs a grid prompt may list
  gridCells: 4_096,   // one grid, as tasks/grid.mjs caps its own search
  depth: 3,           // the grid search depth tasks/grid.mjs was measured at
});

// ---------------------------------------------------------------- tokens
// A token is { t: kind, v: value }. kinds: 'q' (a rational literal, with its source text),
// 'x' (the unknown), 'op' (one of + - * / ^ = %), '(' and ')'.
const OPS = new Set(['+', '-', '*', '/', '^', '=', '%']);

function readNumber(src, i) {
  const start = i;
  while (i < src.length && src[i] >= '0' && src[i] <= '9') i++;
  if (i < src.length && src[i] === '.') {
    const dot = i;
    i++;
    while (i < src.length && src[i] >= '0' && src[i] <= '9') i++;
    if (i === dot + 1) i = dot;                 // a trailing dot is not part of the number
  }
  if (i === start) return null;
  return { text: src.slice(start, i), end: i };
}

/**
 * The prompt as tokens, or null when a character appears that this file does not know.
 * Unknown means unknown: a stray letter is a refusal and not a character to skip over,
 * because skipping is how an evaluator answers a question it did not read.
 * @param {string} src
 * @returns {{t: string, v: any, text?: string}[]|null}
 */
export function tokenize(src) {
  const s = String(src ?? '');
  if (!s.length || s.length > CAPS.chars) return null;
  const out = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
    if (out.length >= CAPS.tokens) return null;
    if (c === '(' || c === ')') { out.push({ t: c }); i++; continue; }
    if (OPS.has(c)) { out.push({ t: 'op', v: c }); i++; continue; }
    // the unknown, and the one word that is an operator: `15% of 240`
    if (c === 'x' || c === 'X') {
      const next = s[i + 1];
      if (next !== undefined && /[A-Za-z0-9_]/.test(next)) return null;    // a word, not the unknown
      out.push({ t: 'x' });
      i++;
      continue;
    }
    if (/[A-Za-z]/.test(c)) {
      const m = /^[A-Za-z]+/.exec(s.slice(i));
      const w = m[0].toLowerCase();
      if (w === 'sqrt') { out.push({ t: 'fn', v: 'sqrt' }); i += m[0].length; continue; }
      if (w !== 'of') return null;
      out.push({ t: 'op', v: 'of' });
      i += m[0].length;
      continue;
    }
    const n = readNumber(s, i);
    if (!n) return null;
    // THE FRACTION LITERAL. A slash with no space on either side belongs to the number.
    let value, text = n.text;
    try { value = E.qFromString(n.text); } catch { return null; }
    i = n.end;
    while (s[i] === '/' && s[i + 1] !== undefined && /[0-9.]/.test(s[i + 1])) {
      const d = readNumber(s, i + 1);
      if (!d) break;
      let den;
      try { den = E.qFromString(d.text); } catch { return null; }
      if (den.n === 0n) return null;
      value = E.qDiv(value, den);
      text += '/' + d.text;
      i = d.end;
    }
    out.push({ t: 'q', v: value, text });
  }
  return out.length ? out : null;
}

// ---------------------------------------------------------------- the parser
// Grammar, tightest last:
//   expr    := term (('+'|'-') term)*
//   term    := unary (('*'|'/'|'of') unary)*
//   unary   := ('-'|'+')* power
//   power   := postfix ('^' unary)?
//   postfix := primary ('%')*
//   primary := q | x | '(' expr ')'
// The AST node is { op, args } with op in + - * / ^ neg %, or { op: 'q', value, text }, or
// { op: 'x' }. It is a tree of plain objects; nothing in it is ever executed as code.
function parseExpr(ts, p) {
  let node = parseTerm(ts, p);
  if (!node) return null;
  for (;;) {
    const tk = ts[p.i];
    if (!tk || tk.t !== 'op' || (tk.v !== '+' && tk.v !== '-')) return node;
    p.i++;
    const rhs = parseTerm(ts, p);
    if (!rhs) return null;
    node = { op: tk.v, args: [node, rhs] };
  }
}

function parseTerm(ts, p) {
  let node = parseUnary(ts, p);
  if (!node) return null;
  for (;;) {
    const tk = ts[p.i];
    if (!tk || tk.t !== 'op' || (tk.v !== '*' && tk.v !== '/' && tk.v !== 'of')) return node;
    p.i++;
    const rhs = parseUnary(ts, p);
    if (!rhs) return null;
    node = { op: tk.v === 'of' ? '*' : tk.v, args: [node, rhs] };
  }
}

function parseUnary(ts, p) {
  const tk = ts[p.i];
  if (tk && tk.t === 'op' && (tk.v === '-' || tk.v === '+')) {
    p.i++;
    const inner = parseUnary(ts, p);
    if (!inner) return null;
    return tk.v === '-' ? { op: 'neg', args: [inner] } : inner;
  }
  return parsePower(ts, p);
}

function parsePower(ts, p) {
  const base = parsePostfix(ts, p);
  if (!base) return null;
  const tk = ts[p.i];
  if (!tk || tk.t !== 'op' || tk.v !== '^') return base;
  p.i++;
  const exp = parseUnary(ts, p);                 // right associative, so 2^3^2 is 2^(3^2)
  if (!exp) return null;
  return { op: '^', args: [base, exp] };
}

function parsePostfix(ts, p) {
  let node = parsePrimary(ts, p);
  if (!node) return null;
  while (ts[p.i] && ts[p.i].t === 'op' && ts[p.i].v === '%') { p.i++; node = { op: '%', args: [node] }; }
  return node;
}

function parsePrimary(ts, p) {
  const tk = ts[p.i];
  if (!tk) return null;
  if (tk.t === 'q') { p.i++; return { op: 'q', value: tk.v, text: tk.text }; }
  if (tk.t === 'x') { p.i++; return { op: 'x' }; }
  if (tk.t === 'fn') {
    p.i++;
    if (!ts[p.i] || ts[p.i].t !== '(') return null;
    p.i++;
    const inner = parseExpr(ts, p);
    if (!inner) return null;
    if (!ts[p.i] || ts[p.i].t !== ')') return null;
    p.i++;
    return { op: tk.v, args: [inner] };
  }
  if (tk.t === '(') {
    p.i++;
    const inner = parseExpr(ts, p);
    if (!inner) return null;
    if (!ts[p.i] || ts[p.i].t !== ')') return null;
    p.i++;
    return inner;
  }
  return null;
}

/**
 * The whole token list as ONE expression, or null when a token is left over. Leftovers are
 * the refusal that matters: `3 + 4 and then some words` must not answer 7.
 * @param {object[]} ts
 * @returns {object|null}
 */
export function parseWhole(ts) {
  if (!ts) return null;
  const p = { i: 0 };
  const node = parseExpr(ts, p);
  if (!node || p.i !== ts.length) return null;
  return node;
}

/** The token list as `left = right`, or null when it is not one equation. */
export function parseEquation(ts) {
  if (!ts) return null;
  const at = ts.findIndex((t) => t.t === 'op' && t.v === '=');
  if (at < 0) return null;
  const left = ts.slice(0, at), right = ts.slice(at + 1);
  if (right.some((t) => t.t === 'op' && t.v === '=')) return null;       // two equals is not an equation
  const l = parseWhole(left), r = parseWhole(right);
  if (!l || !r) return null;
  return { left: l, right: r };
}

export function hasUnknown(node) {
  if (!node) return false;
  if (node.op === 'x') return true;
  return Array.isArray(node.args) && node.args.some(hasUnknown);
}

// ---------------------------------------------------------------- exact evaluation
const HUNDRED = E.Q(100n);

// The integer square root of a non-negative BigInt when it is exact, else null (Newton's
// method on BigInt, then the one check that matters: r*r === n).
function isqrt(n) {
  if (n < 0n) return null;
  if (n < 2n) return n;
  let x = BigInt(Math.floor(Math.sqrt(Number(n)))) + 1n;
  if (x <= 0n) x = 1n;
  for (;;) { const y = (x + n / x) >> 1n; if (y >= x) break; x = y; }
  while (x * x > n) x -= 1n;
  while ((x + 1n) * (x + 1n) <= n) x += 1n;
  return x * x === n ? x : null;
}

/**
 * The AST as an exact rational, or null when it cannot be one. Every arithmetic step is
 * tasks/exact.mjs on BigInt, so a thirteen digit product is the product and not a float.
 * @param {object} node
 * @returns {{n: bigint, d: bigint}|null}
 */
export function evalExact(node) {
  if (!node) return null;
  switch (node.op) {
    case 'q': return node.value;
    case 'x': return null;
    case 'neg': { const a = evalExact(node.args[0]); return a === null ? null : E.qNeg(a); }
    case '%': { const a = evalExact(node.args[0]); return a === null ? null : E.qDiv(a, HUNDRED); }
    case 'sqrt': {
      // Exact only when both integers of the rational are perfect squares; sqrt(2) is not a
      // rational and this file does not print an approximation under the provenance 'exact'.
      const a = evalExact(node.args[0]);
      if (a === null || a.n < 0n) return null;
      const rn = isqrt(a.n), rd = isqrt(a.d);
      if (rn === null || rd === null) return null;
      return E.qDiv(E.Q(rn), E.Q(rd));
    }
    case '+': case '-': case '*': case '/': {
      const a = evalExact(node.args[0]), b = evalExact(node.args[1]);
      if (a === null || b === null) return null;
      if (node.op === '+') return E.qAdd(a, b);
      if (node.op === '-') return E.qSub(a, b);
      if (node.op === '*') return E.qMul(a, b);
      if (b.n === 0n) return null;                       // division by zero is a refusal
      return E.qDiv(a, b);
    }
    case '^': {
      const a = evalExact(node.args[0]), k = evalExact(node.args[1]);
      if (a === null || k === null) return null;
      if (k.d !== 1n) return null;                       // a fractional power is not exact here
      const abs = k.n < 0n ? -k.n : k.n;
      if (abs > BigInt(CAPS.exponent)) return null;
      if (k.n < 0n && a.n === 0n) return null;
      return E.qPow(a, k.n);
    }
    default: return null;
  }
}

// ---------------------------------------------------------------- spoken arithmetic
// "what is 17 times 23" is the same expression as "17 * 23", and on 2026-09-26 10:12 EDT the
// organism answered the second in microseconds and the first with "nothing in memory matches
// times." (his order of 10:05: "Every request should be less than a token and it should be done
// in microseconds"). This front end rewrites the spoken shapes below into the operator grammar
// above and then hands the result to the same tokenizer, parser and BigInt arithmetic. The
// contract of solve() holds unchanged: after the rewrite EVERY letter must be gone (except the
// two words the tokenizer knows, "of" and "sqrt"), or the whole prompt is null. A word this
// table does not know is a refusal, never a word to skip over.
const SPOKEN_LEAD_RE = /^(?:(?:please|hey|ok|okay|so|and|now|then|quick|quickly|just)\s+)*(?:(?:can|could|would|will)\s+you\s+(?:please\s+)?)?(?:(?:tell|show)\s+me\s+)?(?:(?:what|whats|what's|how\s+much|how\s+many)\s+(?:is|are|was|were|does|do|will|would)?\s*(?:the\s+(?:value|result|answer|total|product|sum|difference|quotient)\s+(?:of|to|for)\s+)?|(?:calculate|compute|evaluate|work\s+out|find|figure\s+out|solve|simplify|give\s+me)\s+(?:the\s+(?:value|result|answer)\s+(?:of|to|for)\s+)?)?/i;
const SPOKEN_TAIL_RE = /\s*(?:(?:,|\s)\s*please)?\s*(?:(?:is\s+)?(?:equal\s+to\s+)?(?:what|how\s+much))?\s*(?:[?.!=]+\s*)*$/i;
// Each rule is [pattern, replacement], applied in order, on the lower-cased text. A rule with
// two operands keeps their order unless the words say otherwise ("subtract 3 from 10" is 10 - 3).
const SPOKEN_RULES = [
  [/\bthe\s+(?:sum|total)\s+of\s+(.+?)\s+and\s+(.+)$/i, '($1) + ($2)'],
  [/\bthe\s+difference\s+(?:between|of)\s+(.+?)\s+and\s+(.+)$/i, '($1) - ($2)'],
  [/\bthe\s+product\s+of\s+(.+?)\s+and\s+(.+)$/i, '($1) * ($2)'],
  [/\bthe\s+quotient\s+of\s+(.+?)\s+and\s+(.+)$/i, '($1) / ($2)'],
  [/\b(?:add|sum)\s+(.+?)\s+(?:and|to|with)\s+(.+)$/i, '($1) + ($2)'],
  [/\bsubtract\s+(.+?)\s+from\s+(.+)$/i, '($2) - ($1)'],
  [/\b(.+?)\s+subtracted\s+from\s+(.+)$/i, '($2) - ($1)'],
  [/\b(?:multiply|times)\s+(.+?)\s+(?:by|and|with)\s+(.+)$/i, '($1) * ($2)'],
  [/\bdivide\s+(.+?)\s+by\s+(.+)$/i, '($1) / ($2)'],
  [/\b(?:the\s+)?square\s+root\s+of\s+(.+)$/i, 'sqrt($1)'],
  [/\b(?:the\s+)?square\s+of\s+(.+)$/i, '($1) ^ 2'],
  [/\b(?:the\s+)?cube\s+of\s+(.+)$/i, '($1) ^ 3'],
  [/\b(?:a\s+)?half\s+of\s+(.+)$/i, '($1) / 2'],
  [/\b(?:a\s+)?(?:third|one\s+third)\s+of\s+(.+)$/i, '($1) / 3'],
  [/\b(?:a\s+)?(?:quarter|one\s+quarter|fourth|one\s+fourth)\s+of\s+(.+)$/i, '($1) / 4'],
  [/\bdouble\s+(.+)$/i, '2 * ($1)'],
  [/\btriple\s+(.+)$/i, '3 * ($1)'],
  [/\s+squared\b/gi, ' ^ 2'],
  [/\s+cubed\b/gi, ' ^ 3'],
  [/\s+(?:raised\s+)?to\s+the\s+(?:power\s+(?:of\s+)?|exponent\s+(?:of\s+)?)/gi, ' ^ '],
  [/\s+raised\s+to\s+/gi, ' ^ '],
  [/\s+(?:to\s+the\s+)?power\s+(?:of\s+)?/gi, ' ^ '],
  [/\s+(?:plus|added\s+to|increased\s+by|and)\s+/gi, ' + '],
  [/\s+(?:minus|less|take\s+away|decreased\s+by|reduced\s+by)\s+/gi, ' - '],
  [/\s+(?:times|multiplied\s+by|multiplied\s+with|×)\s+/gi, ' * '],
  [/(\d)\s+x\s+(?=[\d(])/gi, '$1 * '],
  [/\s+(?:divided\s+by|over|÷)\s+/gi, ' / '],
  [/\s*(?:percent|per\s+cent|pct)\b/gi, '%'],
  [/\bsquare\s+root\s*\(/gi, 'sqrt('],
  [/\bsqrt\s+(\d[\d.,/]*)/gi, 'sqrt($1)'],
];
const SPOKEN_LETTERS_RE = /[A-Za-z]+/g;

/** The spoken rewrite before the refusal check: the text with every known shape replaced, or null. */
function spokenRewrite(text) {
  let s = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!s || s.length > CAPS.chars) return null;
  const lead = SPOKEN_LEAD_RE.exec(s);
  if (lead && lead[0]) s = s.slice(lead[0].length);
  s = s.replace(SPOKEN_TAIL_RE, '');
  if (!s) return null;
  for (const [re, to] of SPOKEN_RULES) s = s.replace(re, to);
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * The words the spoken reading could not read (the reason spokenExpression refused), lower-cased,
 * each once. The prompt box prints them on a refusal, so the refusal names its cause.
 * @param {string} text
 * @returns {string[]}
 */
export function spokenLeftover(text) {
  const s = spokenRewrite(text);
  if (s === null) return [];
  return [...new Set((s.match(SPOKEN_LETTERS_RE) || []).map((w) => w.toLowerCase()).filter((l) => l !== 'of' && l !== 'sqrt' && l !== 'x'))];
}

/**
 * The spoken prompt as an expression in the grammar above, or null. Null when no spoken shape
 * matched, when a word survived the rewrite, or when nothing to compute survived (a bare number
 * is a fact question for the knowledge tier, not arithmetic).
 * @param {string} text
 * @returns {string|null}
 */
export function spokenExpression(text) {
  const s = spokenRewrite(text);
  if (s === null) return null;
  const words = s.match(SPOKEN_LETTERS_RE) || [];
  for (const w of words) { const l = w.toLowerCase(); if (l !== 'of' && l !== 'sqrt' && l !== 'x') return null; }
  if (!/[-+*/^%]|sqrt\(/.test(s)) return null;
  return s;
}

const qs = (v) => E.qToString(v);

/**
 * The value of one token list that is an expression (not an equation) with no unknown, as the
 * answer shape solve() returns, or null. act/solve.mjs solveExpression() calls this after it has
 * ruled out an equation, so the CLI and the browser build the same answer from the same tokens.
 * @param {object[]} ts tokens from tokenize()
 * @param {string} body the text the tokens came from
 * @returns {{answer: string, method: string, steps: string[]}|null}
 */
export function arithFrom(ts, body) {
  const node = parseWhole(ts);
  if (!node) return null;
  if (hasUnknown(node)) return null;              // an unknown with no equation has no value
  const v = evalExact(node);
  if (v === null) return null;
  const dec = E.qToDecimal(v);
  const steps = ['expression ' + String(body).trim(), 'exact rational arithmetic on BigInt, no rounding at any step'];
  if (dec !== null && dec !== qs(v)) steps.push('the same value in decimal is ' + dec);
  return { answer: qs(v), method: 'exact.arith', steps };
}

function arithOf(body) {
  const ts = tokenize(body);
  if (!ts || parseEquation(ts)) return null;
  return arithFrom(ts, body);
}

const COMPUTE_PREFIX = /^[^:]*\b(?:compute|evaluate|solve|simplify)\b[^:]*:\s*/i;

/**
 * The exact path with no cell runtime: arithmetic as written, after a "compute:" prefix, spoken,
 * then words (the word problem reader, passed in so this file stays one import deep).
 * @param {string} text
 * @param {{word?: (text: string) => object|null}} [opts]
 * @returns {{answer: string, method: string, steps: string[]}|null}
 */
export function readExact(text, opts = {}) {
  const s = String(text ?? '');
  if (!s.trim() || s.length > CAPS.chars) return null;
  const direct = arithOf(s);
  if (direct) return direct;
  const stripped = COMPUTE_PREFIX.exec(s);
  if (stripped) { const r = arithOf(s.slice(stripped[0].length)); if (r) return r; }
  const spoken = spokenExpression(s);
  if (spoken && spoken !== s.trim()) {
    const r = arithOf(spoken);
    if (r) { r.steps.unshift('read "' + s.trim() + '" as ' + spoken); return r; }
  }
  // the word problem reader (act/word.mjs readWord, board 18 builder): its answer is passed through only with its own
  // method name, exact.word, so the page and the CLI print the same route for the same sentence
  if (typeof opts.word === 'function') { const w = opts.word(s); if (w && w.method === 'exact.word' && typeof w.answer === 'string') return w; }
  return null;
}
