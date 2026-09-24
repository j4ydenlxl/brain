// act/solve.mjs: WHAT THE ORGANISM CAN ANSWER WITHOUT ASKING ANYBODY.
//
// The answer bench said the uncomfortable thing plainly. On 2026-09-18T04:45:02.418Z the
// organism arm scored algebra 1/3, sequence 2/3, grid 0/3 and the model alone scored the
// same 1/3, 2/3, 0/3, because on those items the organism WAS the model: ask() retrieved,
// handed the retrieval to qwen3:1.7b and printed whatever came back. Every one of those
// items is something this repository can compute exactly. tasks/algebra.mjs solves linear
// equations through real cells, tasks/sequence.mjs induces a verified sym program from the
// terms, tasks/grid.mjs searches a composition of grid primitives against demonstrations,
// and tasks/exact.mjs multiplies thirteen digit integers with BigInt and never rounds.
// ask() called none of them. This file is the route to them.
//
// THE CONTRACT OF solve(), and every clause is a refusal:
//
//   solve(prompt) returns { answer, method, steps } when the prompt is something it can
//   compute COMPLETELY, and null otherwise. A prompt it parses only in part is null: a
//   partial answer from an exact path is worse than no answer, because it arrives wearing
//   the provenance 'exact'.
//
//   No model is called. No code is evaluated: there is no eval, no Function, no vm here,
//   and the expression evaluator is a recursive descent parser over a token list. No file
//   is opened, no url is fetched, no environment variable is read. A prompt is text and it
//   stays text. That is what makes 'exact' a provenance worth printing.
//
// WHY A FRACTION LITERAL IS NOT A DIVISION. tasks/algebra.mjs prints a fraction problem as
// `-3/4 / 5/6`, and left to right division reads that as ((-3/4)/5)/6, which is not the
// value the grader holds. A human does not read it that way either: the slash with no
// space around it is part of the number, and the slash with spaces is the operator. The
// tokenizer implements exactly that rule, so `31/31 + 24/34` is two fraction literals and
// `6 / 3 / 2` is two divisions.
//
// WHY THE ANSWER IS RENDERED AS A LAST LINE. bench/answer.mjs grades all three arms with
// one extractor, which reads the last boxed value or else the last meaningful line. An
// exact answer that came out of BigInt and then failed that ruler would be measured as
// wrong, so this file ends its text with the value and nothing after it.
import * as E from '../tasks/exact.mjs';
import * as S from '../core/signal.mjs';
import { solveAlgebra } from '../tasks/algebra.mjs';
import { fitSequence } from '../tasks/sequence.mjs';
import { searchProgram, runProgramInBrain, buildGridBrain } from '../tasks/grid.mjs';
import { G } from '../cells/grid.mjs';
import { searchGrid } from '../capability/grid-search.mjs';
import { fromRows as fromDslRows, toRows as toDslRows } from '../capability/grid-dsl.mjs';

const L = S.S;

/** The methods solve() can return, so a caller can enumerate them without parsing prose. */
export const METHODS = Object.freeze(['exact.arith', 'exact.compare', 'exact.linear', 'exact.sequence', 'exact.grid']);

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
      if (m[0].toLowerCase() !== 'of') return null;
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
function parseEquation(ts) {
  if (!ts) return null;
  const at = ts.findIndex((t) => t.t === 'op' && t.v === '=');
  if (at < 0) return null;
  const left = ts.slice(0, at), right = ts.slice(at + 1);
  if (right.some((t) => t.t === 'op' && t.v === '=')) return null;       // two equals is not an equation
  const l = parseWhole(left), r = parseWhole(right);
  if (!l || !r) return null;
  return { left: l, right: r };
}

function hasUnknown(node) {
  if (!node) return false;
  if (node.op === 'x') return true;
  return Array.isArray(node.args) && node.args.some(hasUnknown);
}

// ---------------------------------------------------------------- exact evaluation
const HUNDRED = E.Q(100n);

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

// The AST as a sym tree for the brain's own cells. A rational literal with a denominator
// has no single spelling core/signal.mjs parses, so it is rebuilt as a division of its two
// integers, which is the same value and a tree the sym language already evaluates.
function toSym(node) {
  switch (node.op) {
    case 'q': {
      const v = node.value;
      if (v.d === 1n) return L.num(v.n.toString());
      return L.div(L.num(v.n.toString()), L.num(v.d.toString()));
    }
    case 'x': return L.v('x');
    case 'neg': return L.sub(L.num('0'), toSym(node.args[0]));
    case '%': return L.div(toSym(node.args[0]), L.num('100'));
    case '+': return L.add(toSym(node.args[0]), toSym(node.args[1]));
    case '-': return L.sub(toSym(node.args[0]), toSym(node.args[1]));
    case '*': return L.mul(toSym(node.args[0]), toSym(node.args[1]));
    case '/': return L.div(toSym(node.args[0]), toSym(node.args[1]));
    case '^': return L.pow(toSym(node.args[0]), toSym(node.args[1]));
    default: throw new Error('solve: unknown node ' + node.op);
  }
}

// ---------------------------------------------------------------- the prompt shapes
// The generated prompts bench/answer.mjs builds, read back. Each pattern is written against
// the generator it came from (tasks/algebra.mjs, tasks/sequence.mjs, tasks/grid.mjs) and
// each one refuses the whole prompt when any part of it does not fit.
const COMPARE_RE = /^Compare two numbers\..*?First\s+(-?[\d.]+)\s*,\s*second\s+(-?[\d.]+)\s*\./is;
// A prefix is stripped only when it SAYS it is asking for a computation. "How many words are
// in the sentence: the gate holds a proposal." has a colon too, and its tail is not an
// expression, but a looser rule would be one prose question away from an exact wrong answer.
const COMPUTE_PREFIX_RE = /^[^:]*\b(?:compute|evaluate|solve|simplify)\b[^:]*:\s*/i;
const SEQUENCE_RE = /first terms of an exact sequence\s*:\s*(.+?)\s*\.\s*What is the next term/is;
const SEQUENCE_QMARK_RE = /^\s*([-\d][-\d.,/\s]*?),\s*\?\s*$/;
const GRID_HEAD_RE = /rows separated by \|/i;
const GRID_DEMO_RE = /^([0-9|]+)\s*->\s*([0-9|]+)$/;
const GRID_TEST_RE = /Apply that same transformation to this input:\s*([0-9|]+)/i;

const qs = (v) => E.qToString(v);

// ---------------------------------------------------------------- arithmetic and algebra
function solveExpression(body) {
  const ts = tokenize(body);
  if (!ts) return null;
  const eq = parseEquation(ts);
  if (eq) return solveLinear(eq, body);
  const node = parseWhole(ts);
  if (!node) return null;
  if (hasUnknown(node)) return null;              // an unknown with no equation has no value
  const v = evalExact(node);
  if (v === null) return null;
  const dec = E.qToDecimal(v);
  const steps = ['expression ' + body.trim(), 'exact rational arithmetic on BigInt, no rounding at any step'];
  if (dec !== null && dec !== qs(v)) steps.push('the same value in decimal is ' + dec);
  return { answer: qs(v), method: 'exact.arith', steps };
}

// One linear equation in x, answered by the organism's own sym.solve cell rather than by
// arithmetic written here. buildAlgebraBrain is cheap and a fresh one per call carries no
// state between two prompts, which is what keeps one answer from depending on the last.
function solveLinear(eq, body) {
  if (!hasUnknown(eq.left) && !hasUnknown(eq.right)) return null;
  let tree;
  try { tree = L.eq(toSym(eq.left), toSym(eq.right)); } catch { return null; }
  const problem = { id: 'solve.lin', kind: 'linear.solve', route: 'sym.solve', eq: tree, variable: 'x' };
  let got = null;
  try { got = solveAlgebra([problem]).results[0].got; } catch { return null; }
  if (got === null || got === undefined || got === '') return null;
  // The answer is put back through the exact ruler: a spelling the grader cannot parse is
  // not an answer this file is allowed to call exact.
  let value;
  try { value = E.qFromString(String(got)); } catch { return null; }
  return {
    answer: qs(value), method: 'exact.linear',
    steps: ['equation ' + body.trim(), 'solved for x by the organism sym.solve cell, then checked back through the exact rational parser'],
  };
}

function solveCompare(m) {
  const problem = { id: 'solve.cmp', kind: 'decimal.compare', route: 'num.compare', a: m[1], b: m[2] };
  let got = null;
  try { got = solveAlgebra([problem]).results[0].got; } catch { return null; }
  if (got !== '-1' && got !== '0' && got !== '1') return null;
  return {
    answer: got, method: 'exact.compare',
    steps: [m[1] + ' against ' + m[2] + ' compared as exact rationals by the organism num.compare cell'],
  };
}

// ---------------------------------------------------------------- sequences
function solveSequence(list) {
  const terms = String(list).split(',').map((t) => t.trim()).filter(Boolean);
  if (terms.length < 3 || terms.length > CAPS.terms) return null;
  for (const t of terms) { try { E.qFromString(t); } catch { return null; } }
  let fit = null;
  try { fit = fitSequence(terms); } catch { return null; }
  if (!fit || fit.next === null || fit.next === undefined) return null;
  let value;
  try { value = E.qFromString(String(fit.next)); } catch { return null; }
  return {
    answer: qs(value), method: 'exact.sequence',
    steps: [terms.length + ' terms given', 'model ' + fit.model + ', written as a sym program and verified exactly at every index given, then evaluated one index further'],
  };
}

// ---------------------------------------------------------------- grids
function parseGrid(line) {
  const rows = String(line).split('|').filter((r) => r.length);
  if (!rows.length) return null;
  const w = rows[0].length;
  if (!w || w * rows.length > CAPS.gridCells) return null;
  const cells = [];
  for (const r of rows) {
    if (r.length !== w) return null;
    for (const ch of r) {
      if (ch < '0' || ch > '9') return null;
      cells.push(Number(ch));
    }
  }
  return { w, h: rows.length, cells };
}

function solveGrid(prompt) {
  const test = GRID_TEST_RE.exec(prompt);
  if (!test) return null;
  const input = parseGrid(test[1]);
  if (!input) return null;
  const demos = [];
  for (const raw of prompt.split('\n')) {
    const m = GRID_DEMO_RE.exec(raw.trim());
    if (!m) continue;
    const a = parseGrid(m[1]), b = parseGrid(m[2]);
    if (!a || !b) return null;                    // a demonstration read only in part is a refusal
    demos.push({ input: a, output: b });
    if (demos.length > CAPS.demos) return null;
  }
  if (demos.length < 2) return null;
  let found = null;
  try { found = searchProgram(demos, { maxDepth: CAPS.depth }); } catch { found = null; }
  if (found && found.program) {
    let run = null;
    try { run = runProgramInBrain(buildGridBrain({ name: 'solve.grid' }), found.program, input, 'solve'); } catch { return null; }
    if (!run || !run.grid || !G.valid(run.grid)) return null;
    return {
      answer: G.toString(run.grid).replace(/\n/g, '|'), method: 'exact.grid',
      steps: [
        demos.length + ' demonstrations, one program searched to depth ' + CAPS.depth + ' and ' + found.searched + ' candidates tested',
        'program ' + found.names.join(' then ') + ', run as real grid cells on the held out input',
      ],
    };
  }
  // THE WIDE VOCABULARY. The depth 3 search above is the one the answer bench measured, so it
  // goes first and its answers do not move. When it exhausts, capability/grid-search.mjs
  // searches the typed vocabulary of capability/grid-dsl.mjs to depth 4 under a wall clock
  // budget, and its answer is what grid.dsl cells emitted after grid.dsl.match cells confirmed
  // every demonstration. A search that runs out of clock is a refusal, never a guess.
  const WIDE_BUDGET_MS = 1500;
  const toDsl = (g) => fromDslRows(G.rows(g));
  let wide = null;
  try {
    wide = searchGrid({ train: demos.map((d) => ({ input: toDsl(d.input), output: toDsl(d.output) })), test: [{ input: toDsl(input) }] }, { budgetMs: WIDE_BUDGET_MS });
  } catch { return null; }
  if (!wide || wide.status !== 'found' || !wide.outputs || !wide.outputs[0]) return null;
  const rows = toDslRows(wide.outputs[0]);
  return {
    answer: rows.map((r) => r.join('')).join('|'), method: 'exact.grid',
    steps: [
      demos.length + ' demonstrations; the depth ' + CAPS.depth + ' search exhausted, so the ' + wide.vocabulary + ' step vocabulary was searched to depth 4 in ' + wide.ms + ' ms and ' + wide.searched + ' candidates tested',
      'program ' + wide.names.join(' then ') + ', graded on every demonstration by grid.dsl.match cells and run as grid.dsl cells on the held out input',
    ],
  };
}

// ---------------------------------------------------------------- solve
/**
 * What the organism can compute from this prompt alone.
 *
 * @param {string} prompt the human's words. They are read and never executed.
 * @returns {{answer: string, method: string, steps: string[]}|null} null when the prompt is
 *   not something this file can answer completely. Never a partial answer.
 */
export function solve(prompt) {
  const text = String(prompt ?? '');
  if (!text.trim() || text.length > CAPS.chars) return null;

  if (GRID_HEAD_RE.test(text)) return solveGrid(text);

  const cmp = COMPARE_RE.exec(text);
  if (cmp) return solveCompare(cmp);

  const seq = SEQUENCE_RE.exec(text);
  if (seq) return solveSequence(seq[1]);
  const qmark = SEQUENCE_QMARK_RE.exec(text);
  if (qmark) return solveSequence(qmark[1]);

  const direct = solveExpression(text);
  if (direct) return direct;
  const stripped = COMPUTE_PREFIX_RE.exec(text);
  if (stripped) return solveExpression(text.slice(stripped[0].length));
  return null;
}

/**
 * The solved answer as text the one bench ruler reads: the value on the last line, with
 * nothing after it. The steps are above it, so a human sees the working and the extractor
 * still sees the answer.
 * @param {{answer: string, method: string, steps: string[]}} s
 * @returns {string}
 */
export function renderSolved(s) {
  const lines = ['answered exactly by ' + s.method + ', with no model and no network.'];
  for (const step of s.steps || []) lines.push('- ' + step);
  lines.push(String(s.answer));
  return lines.join('\n');
}

/**
 * Did the model land on the same value the exact path computed? Used only to COUNT
 * disagreements in the ledger. The exact answer is never changed by what this returns.
 * @param {string} modelText
 * @param {string} answer the exact answer
 * @returns {boolean}
 */
export function modelAgrees(modelText, answer) {
  const want = String(answer);
  const hay = String(modelText ?? '');
  if (!hay.trim()) return false;
  let wantQ = null;
  try { wantQ = E.qFromString(want); } catch { wantQ = null; }
  if (wantQ === null) return hay.includes(want);
  for (const m of hay.matchAll(/-?\d+(?:\.\d+)?(?:\s*\/\s*-?\d+(?:\.\d+)?)?/g)) {
    try { if (E.qEq(E.qFromString(m[0].replace(/\s+/g, '')), wantQ)) return true; } catch { /* not a number here */ }
  }
  return false;
}
