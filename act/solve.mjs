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
import { CAPS, tokenize, parseWhole, parseEquation, hasUnknown, evalExact, spokenExpression, arithFrom } from './exact-read.mjs';
export { CAPS, tokenize, parseWhole, evalExact, spokenExpression };
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

// The tokenizer, parser, exact evaluator and the spoken front end live in act/exact-read.mjs (moved
// unchanged on 2026-09-26 so the browser organism on dilation.dev runs the same code); imported above.

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
    case 'sqrt': return null;                        // not linear: solveLinear refuses it
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
  return arithFrom(ts, body);
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
  if (stripped) { const r = solveExpression(text.slice(stripped[0].length)); if (r) return r; }
  const spoken = spokenExpression(text);
  if (spoken && spoken !== text.trim()) {
    const r = solveExpression(spoken);
    if (r) { r.steps.unshift('read "' + text.trim() + '" as ' + spoken); return r; }
  }
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
