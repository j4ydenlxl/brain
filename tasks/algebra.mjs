// tasks/algebra.mjs : THE YARDSTICK FOR ARITHMETIC. A seeded generator of exact
// arithmetic and algebra problems of exactly the kinds a language model gets wrong:
// decimal comparisons (9.11 against 9.9), sums like 0.1 + 0.2, long multiplication of
// 8 to 15 digit integers, fraction arithmetic, nested expressions, integer powers of
// decimals, and linear equations in one variable with decimal coefficients.
//
// Three things are kept apart on purpose:
//   1. the PROBLEM is a spec tree plus the literal text of every leaf,
//   2. the EXPECTED answer is computed by tasks/exact.mjs, which imports nothing from
//      core/ and parses the same literal text with its own BigInt parser,
//   3. the ANSWER is produced by Brain cells (sym.eval, sym.solve, num.compare,
//      num.arith) reached through inject, tick and the outbox, never by calling a
//      primitive directly.
// So a correct answer means two independent implementations, one of them the organism
// itself, agreed on an exact rational.
import { RNG } from '../core/rng.mjs';
import * as S from '../core/signal.mjs';
import { Brain } from '../core/brain.mjs';
import * as E from './exact.mjs';
import { nameCells, readHeads } from './host.mjs';
import '../cells/basic.mjs';

const L = S.S;

// ---------------------------------------------------------------- problem spec helpers
// A leaf carries both the literal text and the exact value parsed by the independent
// ruler. The brain gets the text (so its own decimal parser is on trial); the grader
// gets the value.
function leaf(text) { return { op: 'q', text: String(text), value: E.qFromString(String(text)) }; }
function node(op, ...args) { return { op, args }; }
function powNode(base, k) { return { op: '^', args: [base], k }; }

// spec tree -> sym tree. Every leaf becomes S.num(text), so core/signal.mjs parses the
// same characters tasks/exact.mjs parsed.
export function specToSym(spec) {
  switch (spec.op) {
    case 'q': return L.num(spec.text);
    case '+': return L.add(...spec.args.map(specToSym));
    case '*': return L.mul(...spec.args.map(specToSym));
    case '-': return L.sub(specToSym(spec.args[0]), specToSym(spec.args[1]));
    case '/': return L.div(specToSym(spec.args[0]), specToSym(spec.args[1]));
    case '^': return L.pow(specToSym(spec.args[0]), L.num(String(spec.k)));
    default: throw new Error('algebra: unknown spec op ' + spec.op);
  }
}

// The brain answers in rats; the grader speaks canonical strings. Same spelling rule as
// tasks/exact.mjs qToString, which is a spelling, not an answer.
export function canonNum(v) {
  if (v == null) return null;
  if (v.type === 'int') return v.n.toString();
  if (v.type === 'float') return String(v.x);
  const r = S.toRat(v);
  return r.d === 1n ? r.n.toString() : r.n.toString() + '/' + r.d.toString();
}

// ---------------------------------------------------------------- literal generators
function decimalText(rng, { intDigits = 1, places = 2, signed = false } = {}) {
  let ip = String(1 + rng.int(Math.pow(10, intDigits) - 1));
  let fp = '';
  for (let i = 0; i < places; i++) fp += String(rng.int(10));
  const sign = signed && rng.int(2) === 0 ? '-' : '';
  return sign + ip + (places > 0 ? '.' + fp : '');
}
function bigIntText(rng, digits) {
  let s = String(1 + rng.int(9));
  for (let i = 1; i < digits; i++) s += String(rng.int(10));
  return s;
}
function nonZeroDecimalText(rng, opts) {
  for (;;) { const t = decimalText(rng, opts); if (E.qFromString(t).n !== 0n) return t; }
}

// ---------------------------------------------------------------- the seven families
// Every generator returns problems shaped
//   { id, kind, family, prompt, expected, route, sym?, eq?, a?, b? }
// family 'arith' is the exact-arithmetic subset the test requires to be 100 percent.

function genDecimalCompare(rng, n, out) {
  for (let i = 0; i < n; i++) {
    let a, b;
    const style = i % 4;
    if (style === 0) {
      // the 9.11 against 9.9 trap: same integer part, the longer fraction is the smaller number
      const ip = 1 + rng.int(99);
      const short = 1 + rng.int(9);
      const longFirst = rng.int(short);
      a = ip + '.' + longFirst + String(rng.int(10));
      b = ip + '.' + short;
    } else if (style === 1) {
      // trailing zeros: 3.50 against 3.5 is an equality many readers get wrong
      const ip = 1 + rng.int(50), f = 1 + rng.int(9);
      a = ip + '.' + f + '0';
      b = ip + '.' + f;
    } else if (style === 2) {
      // negatives, where "further from zero" and "larger" part company
      const ip = 1 + rng.int(20);
      a = '-' + ip + '.' + (1 + rng.int(9)) + String(rng.int(10));
      b = '-' + ip + '.' + (1 + rng.int(9));
    } else {
      a = decimalText(rng, { intDigits: 2, places: 1 + rng.int(4) });
      b = decimalText(rng, { intDigits: 2, places: 1 + rng.int(4) });
    }
    const cmp = E.qCmp(E.qFromString(a), E.qFromString(b));
    out.push({ id: 'alg.cmp.' + i, kind: 'decimal.compare', family: 'arith', prompt: 'cmp(' + a + ', ' + b + ')', expected: String(cmp), route: 'num.compare', a, b });
  }
}

function genDecimalSum(rng, n, out) {
  for (let i = 0; i < n; i++) {
    let terms;
    if (i === 0) terms = ['0.1', '0.2'];                       // the canonical float failure
    else if (i === 1) terms = ['0.1', '0.2', '0.3'];
    else if (i === 2) terms = ['1.005', '2.675', '0.32'];
    else {
      const k = 2 + rng.int(4);
      terms = [];
      for (let j = 0; j < k; j++) terms.push(decimalText(rng, { intDigits: 1 + rng.int(3), places: 1 + rng.int(4), signed: j > 0 }));
    }
    const spec = node('+', ...terms.map(leaf));
    out.push({ id: 'alg.sum.' + i, kind: 'decimal.sum', family: 'arith', prompt: E.qSpecToString(spec), expected: E.qToString(E.qEval(spec)), route: 'sym.eval', sym: specToSym(spec) });
  }
}

function genBigMul(rng, n, out) {
  for (let i = 0; i < n; i++) {
    const da = 8 + rng.int(8), db = 8 + rng.int(8);
    const a = bigIntText(rng, da), b = bigIntText(rng, db);
    const spec = node('*', leaf(a), leaf(b));
    const expected = E.qToString(E.qEval(spec));
    // half the family goes through a num.arith cell, half through sym.eval, so both
    // paths into the exact layer are measured rather than one standing in for the other
    if (i % 2 === 0) out.push({ id: 'alg.mul.' + i, kind: 'bigint.mul', family: 'arith', prompt: a + ' * ' + b, expected, route: 'num.arith:*', a, b });
    else out.push({ id: 'alg.mul.' + i, kind: 'bigint.mul', family: 'arith', prompt: a + ' * ' + b, expected, route: 'sym.eval', sym: specToSym(spec) });
  }
}

const FRAC_OPS = ['+', '-', '*', '/'];
function genFractionArith(rng, n, out) {
  for (let i = 0; i < n; i++) {
    const op = FRAC_OPS[i % 4];
    const an = 1 + rng.int(40), ad = 1 + rng.int(40), bn = 1 + rng.int(40), bd = 1 + rng.int(40);
    const a = (rng.int(4) === 0 ? '-' : '') + an + '/' + ad;
    const b = bn + '/' + bd;
    const spec = node(op, leaf(a), leaf(b));
    const expected = E.qToString(E.qEval(spec));
    if (i % 2 === 0) out.push({ id: 'alg.frac.' + i, kind: 'fraction.arith', family: 'arith', prompt: a + ' ' + op + ' ' + b, expected, route: 'num.arith:' + op, a, b });
    else out.push({ id: 'alg.frac.' + i, kind: 'fraction.arith', family: 'arith', prompt: a + ' ' + op + ' ' + b, expected, route: 'sym.eval', sym: specToSym(spec) });
  }
}

function randomSpec(rng, depth) {
  if (depth === 0) {
    if (rng.int(3) === 0) return leaf((1 + rng.int(30)) + '/' + (1 + rng.int(30)));
    return leaf(decimalText(rng, { intDigits: 1 + rng.int(2), places: 1 + rng.int(3), signed: true }));
  }
  const op = FRAC_OPS[rng.int(4)];
  const a = randomSpec(rng, depth - 1);
  let b = randomSpec(rng, depth - 1);
  if (op === '/') { let guard = 0; while (E.qEval(b).n === 0n && guard++ < 8) b = randomSpec(rng, depth - 1); if (E.qEval(b).n === 0n) b = leaf('1'); }
  return node(op, a, b);
}
function genNestedEval(rng, n, out) {
  for (let i = 0; i < n; i++) {
    const spec = randomSpec(rng, 2 + (i % 2));
    out.push({ id: 'alg.nest.' + i, kind: 'nested.eval', family: 'arith', prompt: E.qSpecToString(spec), expected: E.qToString(E.qEval(spec)), route: 'sym.eval', sym: specToSym(spec) });
  }
}

function genPower(rng, n, out) {
  for (let i = 0; i < n; i++) {
    const k = 2 + rng.int(11);
    const base = rng.int(3) === 0 ? (1 + rng.int(9)) + '/' + (2 + rng.int(9)) : nonZeroDecimalText(rng, { intDigits: 1, places: 1 + rng.int(2) });
    const spec = powNode(leaf(base), k);
    const expected = E.qToString(E.qEval(spec));
    if (i % 2 === 0) out.push({ id: 'alg.pow.' + i, kind: 'power', family: 'arith', prompt: '(' + base + ')^' + k, expected, route: 'num.arith:^', a: base, b: String(k) });
    else out.push({ id: 'alg.pow.' + i, kind: 'power', family: 'arith', prompt: '(' + base + ')^' + k, expected, route: 'sym.eval', sym: specToSym(spec) });
  }
}

// Linear equations in one variable with decimal coefficients. Four surface forms that
// all reduce to coefL * x + constL = coefR * x + constR. The expected root is computed
// from the reduced form by tasks/exact.mjs; the brain is handed the unreduced tree.
function genLinearSolve(rng, n, out) {
  let i = 0, guard = 0;
  while (i < n && guard++ < n * 40) {
    const form = 'ABCD'[i % 4];
    const aT = nonZeroDecimalText(rng, { intDigits: 1, places: 1 + rng.int(2) });
    const bT = decimalText(rng, { intDigits: 1 + rng.int(2), places: 1 + rng.int(2), signed: true });
    const cT = decimalText(rng, { intDigits: 1, places: 1 + rng.int(2), signed: true });
    const dT = decimalText(rng, { intDigits: 1 + rng.int(2), places: 1 + rng.int(2), signed: true });
    const eT = nonZeroDecimalText(rng, { intDigits: 1, places: 1 });
    const a = E.qFromString(aT), b = E.qFromString(bT), c = E.qFromString(cT), d = E.qFromString(dT), e = E.qFromString(eT);
    let coefL, constL, eq, prompt;
    const xv = L.v('x');
    if (form === 'A') {
      coefL = a; constL = b;
      eq = L.eq(L.add(L.mul(L.num(aT), xv), L.num(bT)), L.add(L.mul(L.num(cT), xv), L.num(dT)));
      prompt = aT + '*x + ' + bT + ' = ' + cT + '*x + ' + dT;
    } else if (form === 'B') {
      coefL = a; constL = E.qMul(a, b);
      eq = L.eq(L.mul(L.num(aT), L.add(xv, L.num(bT))), L.add(L.mul(L.num(cT), xv), L.num(dT)));
      prompt = aT + '*(x + ' + bT + ') = ' + cT + '*x + ' + dT;
    } else if (form === 'C') {
      coefL = E.qDiv(a, e); constL = E.qDiv(b, e);
      eq = L.eq(L.div(L.add(L.mul(L.num(aT), xv), L.num(bT)), L.num(eT)), L.add(L.mul(L.num(cT), xv), L.num(dT)));
      prompt = '(' + aT + '*x + ' + bT + ') / ' + eT + ' = ' + cT + '*x + ' + dT;
    } else {
      coefL = a; constL = E.qNeg(b);
      eq = L.eq(L.sub(L.mul(L.num(aT), xv), L.num(bT)), L.add(L.mul(L.num(cT), xv), L.num(dT)));
      prompt = aT + '*x - ' + bT + ' = ' + cT + '*x + ' + dT;
    }
    const denom = E.qSub(coefL, c);
    if (denom.n === 0n) continue;                       // degenerate: no unique root
    const x = E.qDiv(E.qSub(d, constL), denom);
    out.push({ id: 'alg.lin.' + i, kind: 'linear.solve', family: 'algebra', prompt, expected: E.qToString(x), route: 'sym.solve', eq, variable: 'x' });
    i++;
  }
}

// ---------------------------------------------------------------- generator
export const ALGEBRA_COUNTS = Object.freeze({
  decimalCompare: 60, decimalSum: 50, bigintMul: 50, fractionArith: 50, nestedEval: 50, power: 40, linearSolve: 60,
});

export function generateAlgebra({ seed = 'algebra/1', counts = ALGEBRA_COUNTS } = {}) {
  const c = { ...ALGEBRA_COUNTS, ...counts };
  const out = [];
  genDecimalCompare(new RNG(seed + ':cmp'), c.decimalCompare, out);
  genDecimalSum(new RNG(seed + ':sum'), c.decimalSum, out);
  genBigMul(new RNG(seed + ':mul'), c.bigintMul, out);
  genFractionArith(new RNG(seed + ':frac'), c.fractionArith, out);
  genNestedEval(new RNG(seed + ':nest'), c.nestedEval, out);
  genPower(new RNG(seed + ':pow'), c.power, out);
  genLinearSolve(new RNG(seed + ':lin'), c.linearSolve, out);
  return out;
}

// ---------------------------------------------------------------- the solving organism
// One brain, one circuit, eight cells, reused across every problem: a persistent object
// answering a stream of questions, which is what the architecture is for. Growth is
// switched off (a co-activation threshold nothing can reach) so the connectome the
// grader reads is the connectome that was wired, and pruning is off for the same reason.
export function buildAlgebraBrain({ name = 'algebra', ledger = 'runs' } = {}) {
  const b = new Brain({ name, ledger, pruneEvery: 0, growth: { threshold: Number.MAX_SAFE_INTEGER } });
  const mk = (id, kind, params) => b.addCell({ id, kind, region: 'cognitive', circuit: 'algebra', params, policy: { period: 'event' } });
  mk('alg.eval', 'sym.eval');
  mk('alg.solve', 'sym.solve', { variable: 'x' });
  mk('alg.cmp', 'num.compare');
  for (const [suffix, op] of [['add', '+'], ['sub', '-'], ['mul', '*'], ['div', '/'], ['pow', '^']]) mk('alg.' + suffix, 'num.arith', { op });
  return b;
}

// ---------------------------------------------------------------- naming the cells
// A route names a ROLE, and a role is filled by a cell id. The eight ids of the brain this
// file builds for itself are the default; any other brain fills the same eight roles with
// its own ids through algebraCellsOf, which is what lets the suite run inside an organism
// (notes/generations.md request 7).
export const ALGEBRA_ROLES = Object.freeze([
  { role: 'eval', kind: 'sym.eval', why: 'sym.eval routes: sums, nested expressions, half the products, fractions and powers' },
  { role: 'solve', kind: 'sym.solve', where: (c) => (c.params.variable ?? 'x') === 'x', why: 'the linear equations, all in x' },
  { role: 'cmp', kind: 'num.compare', why: 'the decimal comparisons' },
  { role: '+', kind: 'num.arith', where: (c) => c.params.op === '+', why: 'half the fraction additions' },
  { role: '-', kind: 'num.arith', where: (c) => c.params.op === '-', why: 'half the fraction subtractions' },
  { role: '*', kind: 'num.arith', where: (c) => c.params.op === '*', why: 'half the big integer products and fraction products' },
  { role: '/', kind: 'num.arith', where: (c) => c.params.op === '/', why: 'half the fraction divisions' },
  { role: '^', kind: 'num.arith', where: (c) => c.params.op === '^', why: 'half the integer powers' },
]);

export const ALGEBRA_CELLS = Object.freeze({
  eval: 'alg.eval', solve: 'alg.solve', cmp: 'alg.cmp',
  '+': 'alg.add', '-': 'alg.sub', '*': 'alg.mul', '/': 'alg.div', '^': 'alg.pow',
});

/**
 * Name the cells of an arbitrary brain for the eight roles this suite injects into.
 * @param {object} brain
 * @returns {{ cells: Record<string,string>, missing: string[], chosen: object[] }}
 *   `missing` names the roles this brain has no cell for. Those problems are answered
 *   null and counted wrong, which is the honest reading: the brain cannot do them.
 */
export function algebraCellsOf(brain) { return nameCells(brain, ALGEBRA_ROLES); }

/** The role a problem's route wants, or null if the route is not one this suite emits. */
export function roleOfRoute(route) {
  if (route === 'sym.eval') return 'eval';
  if (route === 'sym.solve') return 'solve';
  if (route === 'num.compare') return 'cmp';
  if (route.startsWith('num.arith:')) return route.slice('num.arith:'.length);
  return null;
}

/**
 * @param {object[]} problems
 * @param {object} [opts]
 * @param {object} [opts.brain] the brain to answer through; built here when absent
 * @param {object} [opts.cells] role -> cell id. Absent means the eight ids buildAlgebraBrain
 *   uses. Present means a HOSTED run: the answers are read through a tap, because inside a
 *   brain that wires every out port nothing reaches the outbox on its own.
 * @param {boolean} [opts.tap] override the tap, which defaults to on for a hosted run
 * @param {number} [opts.ticks] ticks per problem; 1 without a tap, 2 with one
 */
export function solveAlgebra(problems, { brain = null, cells = null, tap = null, ticks = null } = {}) {
  const b = brain || buildAlgebraBrain();
  const hosted = cells !== null;
  const map = cells || ALGEBRA_CELLS;
  const useTap = tap === null ? hosted : tap;
  const nTicks = ticks === null ? (useTap ? 2 : 1) : ticks;
  const { readIdx } = readHeads(b, Object.values(map), { tap: useTap });
  const results = [];
  for (const p of problems) {
    const role = roleOfRoute(p.route);
    if (role === null) throw new Error('algebra: unknown route ' + p.route);
    const target = map[role] || null;
    // A role this brain cannot fill is recorded as such rather than thrown, so a hosted
    // run reports which parts of the suite the host has no cell for instead of dying.
    if (!target) { results.push({ id: p.id, got: null, cell: null, role, error: 'no cell for role ' + role }); continue; }
    if (p.route === 'sym.eval') b.inject(target, 'expr', { kind: 'sym', data: p.sym });
    else if (p.route === 'sym.solve') b.inject(target, 'eq', { kind: 'sym', data: p.eq });
    else {
      b.inject(target, 'a', { kind: 'num', data: S.ratFromDecimal(p.a) });
      b.inject(target, 'b', { kind: 'num', data: S.ratFromDecimal(p.b) });
    }

    const idx = readIdx.get(target);
    const before = b.stats.errors || 0;
    b.tick(nTicks);
    const outs = b.takeOutbox().filter(sig => sig.src === idx);
    const sig = outs[outs.length - 1] ?? null;
    let got = null;
    if (sig) {
      if (sig.kind === 'num') got = canonNum(sig.data);
      else if (sig.kind === 'event') got = sig.data.cmp !== undefined ? String(sig.data.cmp) : (sig.data.value ?? null);
    }
    results.push({ id: p.id, got, cell: target, role, error: (b.stats.errors || 0) > before ? (b.lastError && b.lastError.error) || 'cell threw' : null });
  }
  return { brain: b, results };
}

// ---------------------------------------------------------------- grader
export function gradeAlgebra(problems, results, { maxFailures = 25 } = {}) {
  const byId = new Map(results.map(r => [r.id, r]));
  const byKind = {}, byFamily = {};
  const failures = [];
  let correct = 0;
  for (const p of problems) {
    const r = byId.get(p.id) || { got: null, error: 'no result' };
    const ok = r.got !== null && r.got === p.expected;
    if (ok) correct++;
    for (const [bucket, key] of [[byKind, p.kind], [byFamily, p.family]]) {
      const e = bucket[key] || (bucket[key] = { n: 0, correct: 0 });
      e.n++; if (ok) e.correct++;
    }
    if (!ok) failures.push({ id: p.id, kind: p.kind, prompt: p.prompt, expected: p.expected, got: r.got, error: r.error || null });
  }
  for (const bucket of [byKind, byFamily]) for (const k of Object.keys(bucket)) bucket[k].accuracy = bucket[k].n ? bucket[k].correct / bucket[k].n : 0;
  return {
    suite: 'algebra', n: problems.length, correct,
    accuracy: problems.length ? correct / problems.length : 0,
    byKind, byFamily, failures: failures.slice(0, maxFailures), failureCount: failures.length, allFailures: failures,
  };
}

export function runAlgebra(opts = {}) {
  const problems = generateAlgebra(opts);
  const t0 = process.hrtime.bigint();
  const { brain, results } = solveAlgebra(problems, opts);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const report = gradeAlgebra(problems, results, opts);
  report.ms = Math.round(ms * 1000) / 1000;
  report.cells = brain.cells.length;
  report.ticks = brain.stats.ticks;
  report.cellRuns = brain.stats.runs;
  return { problems, results, report, brain };
}

export const algebraSuite = Object.freeze({
  name: 'algebra',
  doc: 'exact arithmetic and one-variable algebra, answered by sym.eval, sym.solve, num.compare and num.arith cells',
  generate: generateAlgebra, solve: solveAlgebra, grade: gradeAlgebra, run: runAlgebra,
});
