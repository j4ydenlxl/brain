// tasks/sequence.mjs : THE YARDSTICK FOR INDUCTION. Given the first N terms of an exact
// rational sequence, name the next one. Five families: arithmetic, geometric with exact
// rationals, periodic patterns, second-order linear recurrences (Fibonacci-like), and
// polynomials in the index.
//
// Two solvers run on every problem so the measurement has a floor under it:
//   predict.next  the stock cell from cells/basic.mjs. On a num stream it repeats the
//                 last value, so it can only be right when the sequence is constant.
//                 It is here to show what the accuracy of a non-solver looks like.
//   seq.fit       a cell defined below. It does not pattern match. It writes a SYM
//                 PROGRAM for each hypothesis, evaluates that program with evalSym at
//                 every index it was given, and only accepts the hypothesis when every
//                 term comes back exactly equal. The answer is then that program
//                 evaluated one index further. A wrong hypothesis cannot survive,
//                 because verification is exact rational equality over the whole tape.
//
// The recurrence hypotheses are written as tail-recursive sym programs with rec, if,
// comparisons and call, so the induction really is carried out in the sym language the
// brain evaluates, not in JavaScript that happens to live in a cell.
import { defineKind } from '../core/cell.mjs';
import { RNG } from '../core/rng.mjs';
import * as S from '../core/signal.mjs';
import { evalSym } from '../core/primitives.mjs';
import { Brain } from '../core/brain.mjs';
import * as E from './exact.mjs';
import { nameCells, readHeads } from './host.mjs';
import '../cells/basic.mjs';

const L = S.S, V = S.S.v;
const first = (mail) => (mail.length ? mail[mail.length - 1].sig : null);
const N = (x) => (typeof x === 'object' ? L.num(x) : L.num(String(x)));

// ---------------------------------------------------------------- the sym hypotheses
// Every hypothesis is a sym tree in one free variable n. Verification evaluates it at
// n = 0 .. terms.length - 1; the prediction is the same tree at n = terms.length.

function constantProgram(x) { return N(x); }

function arithmeticProgram(a, d) { return L.add(N(a), L.mul(N(d), V('n'))); }

function geometricProgram(a, r) { return L.mul(N(a), L.pow(N(r), V('n'))); }

function periodicProgram(values) {
  const p = values.length;
  let tree = N(values[p - 1]);
  for (let j = p - 2; j >= 0; j--) tree = L.if(L.eq(L.mod(V('n'), N(p)), N(j)), N(values[j]), tree);
  return tree;
}

// x_k = p * x_{k-1} + s, written as a tail call so the trampoline in evalSym runs it in
// constant JS stack however far the index goes.
function affineProgram(x0, p, s) {
  return L.rec('g', ['i', 'a'],
    L.if(L.ge(V('i'), V('n')), V('a'),
      L.call('g', L.add(V('i'), N(1)), L.add(L.mul(N(p), V('a')), N(s)))),
    L.call('g', N(0), N(x0)));
}

// x_k = p * x_{k-1} + q * x_{k-2}, two accumulators, again tail recursive.
function order2Program(x0, x1, p, q) {
  return L.rec('g', ['i', 'a', 'b'],
    L.if(L.ge(V('i'), V('n')), V('a'),
      L.call('g', L.add(V('i'), N(1)), V('b'), L.add(L.mul(N(p), V('b')), L.mul(N(q), V('a'))))),
    L.call('g', N(0), N(x0), N(x1)));
}

// Newton forward form: f(n) = sum_j C(n, j) * D_j, with C(n, j) spelled out as a product
// over the sym language rather than looked up.
function polynomialProgram(diffs) {
  const terms = [];
  for (let j = 0; j < diffs.length; j++) {
    if (diffs[j].n === 0n) continue;
    if (j === 0) { terms.push(N(diffs[0])); continue; }
    let numer = V('n'), fact = 1n;
    for (let i = 1; i < j; i++) numer = L.mul(numer, L.sub(V('n'), N(i)));
    for (let i = 1; i <= j; i++) fact *= BigInt(i);
    terms.push(L.mul(L.div(numer, N(S.rat(fact))), N(diffs[j])));
  }
  if (terms.length === 0) return N(S.rat(0n));
  return terms.length === 1 ? terms[0] : L.add(...terms);
}

// ---------------------------------------------------------------- the fitter
function forwardDifferences(xs, maxOrder) {
  const rows = [xs.slice()];
  for (let k = 1; k <= maxOrder; k++) {
    const prev = rows[k - 1];
    if (prev.length < 2) break;
    const row = [];
    for (let i = 0; i + 1 < prev.length; i++) row.push(S.ratSub(prev[i + 1], prev[i]));
    rows.push(row);
  }
  return rows;
}

function verify(program, xs) {
  for (let i = 0; i < xs.length; i++) {
    let v;
    try { v = evalSym(program, { n: S.rat(BigInt(i)) }); }
    catch { return false; }
    if (S.ratCmp(v, xs[i]) !== 0) return false;
  }
  return true;
}

// fitSequence(terms, params) -> { model, program, next, tried } or null.
// terms are exact rational strings ("7", "-3/4", "0.25"); next comes back canonical.
export function fitSequence(terms, { maxPeriod = 5, maxDegree = 4 } = {}) {
  const xs = terms.map(t => S.toRat(S.ratFromDecimal(String(t))));
  const n = xs.length;
  if (n < 3) return null;
  const candidates = [];

  candidates.push(['constant', constantProgram(xs[0])]);

  candidates.push(['arithmetic', arithmeticProgram(xs[0], S.ratSub(xs[1], xs[0]))]);

  if (xs[0].n !== 0n) candidates.push(['geometric', geometricProgram(xs[0], S.ratDiv(xs[1], xs[0]))]);

  // A period p hypothesis is read straight off the first p terms, so the cap n - 3 is
  // what keeps three terms back as evidence rather than as bookkeeping.
  for (let p = 2; p <= Math.min(maxPeriod, n - 3); p++) candidates.push(['periodic.' + p, periodicProgram(xs.slice(0, p))]);

  // affine order 1: x_k = p x_{k-1} + s, fitted from the first three terms
  if (S.ratCmp(xs[1], xs[0]) !== 0) {
    const p = S.ratDiv(S.ratSub(xs[2], xs[1]), S.ratSub(xs[1], xs[0]));
    const s = S.ratSub(xs[1], S.ratMul(p, xs[0]));
    candidates.push(['affine1', affineProgram(xs[0], p, s)]);
  }

  // linear order 2: fitted from the first four terms by Cramer's rule, exactly
  if (n >= 4) {
    const det = S.ratSub(S.ratMul(xs[1], xs[1]), S.ratMul(xs[0], xs[2]));
    if (det.n !== 0n) {
      const p = S.ratDiv(S.ratSub(S.ratMul(xs[2], xs[1]), S.ratMul(xs[0], xs[3])), det);
      const q = S.ratDiv(S.ratSub(S.ratMul(xs[1], xs[3]), S.ratMul(xs[2], xs[2])), det);
      candidates.push(['linear2', order2Program(xs[0], xs[1], p, q)]);
    }
  }

  // polynomial, last, and never with a degree high enough to fit anything: the cap
  // leaves at least three terms the hypothesis was not fitted on, so passing
  // verification is evidence and not bookkeeping.
  const degreeCap = Math.min(maxDegree, n - 4);
  if (degreeCap >= 2) {
    const rows = forwardDifferences(xs, degreeCap);
    for (let k = 2; k <= degreeCap; k++) {
      if (!rows[k] || rows[k].length === 0) break;
      candidates.push(['polynomial.' + k, polynomialProgram(rows.slice(0, k + 1).map(r => r[0]))]);
    }
  }

  let tried = 0;
  for (const [model, program] of candidates) {
    tried++;
    if (!verify(program, xs)) continue;
    let next;
    try { next = evalSym(program, { n: S.rat(BigInt(n)) }); } catch { continue; }
    const r = S.toRat(next);
    return { model, program, tried, next: r.d === 1n ? r.n.toString() : r.n.toString() + '/' + r.d.toString() };
  }
  return { model: null, program: null, tried, next: null };
}

// ---------------------------------------------------------------- the cell
defineKind('seq.fit', {
  doc: 'Induces the rule behind a rational sequence by writing one sym program per hypothesis, verifying it exactly at every given index, and evaluating the survivor one index further. Emits { next, model, program, tried }.',
  ports: { in: [{ name: 'terms', kinds: ['event'] }], out: [{ name: 'next', kinds: ['event'] }] },
  defaults: { maxPeriod: 5, maxDegree: 4 },
  init: () => ({ fits: 0, misses: 0, lastModel: null }),
  compute: (ins, cell) => {
    const sig = first(ins[0]);
    if (!sig || !Array.isArray(sig.data.terms)) return [null];
    const r = fitSequence(sig.data.terms, cell.params);
    if (!r || r.next === null) { cell.state.misses++; cell.state.lastModel = null; return [{ kind: 'event', data: { next: null, model: null, program: null, tried: r ? r.tried : 0 } }]; }
    cell.state.fits++; cell.state.lastModel = r.model;
    return [{ kind: 'event', data: { next: r.next, model: r.model, program: S.symToString(r.program), tried: r.tried } }];
  },
  serialize: (s) => ({ fits: s.fits, misses: s.misses, lastModel: s.lastModel }),
  cost: 2,
});

// ---------------------------------------------------------------- generator
export const SEQUENCE_COUNTS = Object.freeze({ arithmetic: 45, geometric: 40, periodic: 35, recurrence: 40, polynomial: 45 });

function smallQ(rng, { allowFraction = true, nonZero = false } = {}) {
  for (;;) {
    const n = rng.int(21) - 10;
    if (nonZero && n === 0) continue;
    if (allowFraction && rng.int(3) === 0) return E.Q(BigInt(n), BigInt(1 + rng.int(6)));
    return E.Q(BigInt(n));
  }
}

function genArithmetic(rng, count, out) {
  for (let i = 0; i < count; i++) {
    const n = 6 + rng.int(4);
    const a = smallQ(rng), d = smallQ(rng, { nonZero: true });
    const terms = [];
    for (let k = 0; k < n; k++) terms.push(E.qToString(E.qAdd(a, E.qMul(d, E.Q(BigInt(k))))));
    const expected = E.qToString(E.qAdd(a, E.qMul(d, E.Q(BigInt(n)))));
    out.push({ id: 'seq.ari.' + i, kind: 'arithmetic', terms, expected, rule: 'a + d*n, a=' + E.qToString(a) + ' d=' + E.qToString(d), meta: { a: E.qToString(a), d: E.qToString(d) } });
  }
}

function genGeometric(rng, count, out) {
  for (let i = 0; i < count; i++) {
    const n = 6 + rng.int(3);
    const a = smallQ(rng, { allowFraction: false, nonZero: true });
    let r;
    for (;;) { r = E.Q(BigInt(1 + rng.int(5)) * (rng.int(4) === 0 ? -1n : 1n), BigInt(1 + rng.int(4))); if (!(r.n === 1n && r.d === 1n)) break; }
    const terms = [];
    for (let k = 0; k < n; k++) terms.push(E.qToString(E.qMul(a, E.qPow(r, k))));
    const expected = E.qToString(E.qMul(a, E.qPow(r, n)));
    out.push({ id: 'seq.geo.' + i, kind: 'geometric', terms, expected, rule: 'a * r^n, a=' + E.qToString(a) + ' r=' + E.qToString(r), meta: { a: E.qToString(a), r: E.qToString(r) } });
  }
}

function genPeriodic(rng, count, out) {
  for (let i = 0; i < count; i++) {
    const p = 2 + rng.int(3);
    const n = 7 + rng.int(3);
    const values = [];
    for (let j = 0; j < p; j++) values.push(smallQ(rng));
    if (values.every(v => E.qEq(v, values[0]))) values[p - 1] = E.qAdd(values[0], E.Q1);
    const terms = [];
    for (let k = 0; k < n; k++) terms.push(E.qToString(values[k % p]));
    const expected = E.qToString(values[n % p]);
    out.push({ id: 'seq.per.' + i, kind: 'periodic', terms, expected, rule: 'period ' + p + ' over [' + values.map(E.qToString).join(', ') + ']', meta: { period: p, values: values.map(E.qToString) } });
  }
}

const NAMED_RECURRENCES = [
  { name: 'fibonacci', p: 1n, q: 1n, x0: 0n, x1: 1n },
  { name: 'lucas', p: 1n, q: 1n, x0: 2n, x1: 1n },
  { name: 'pell', p: 2n, q: 1n, x0: 0n, x1: 1n },
  { name: 'jacobsthal', p: 1n, q: 2n, x0: 0n, x1: 1n },
];
function genRecurrence(rng, count, out) {
  for (let i = 0; i < count; i++) {
    const n = 7 + rng.int(3);
    let p, q, x0, x1, name;
    if (i < NAMED_RECURRENCES.length) {
      const r = NAMED_RECURRENCES[i];
      p = E.Q(r.p); q = E.Q(r.q); x0 = E.Q(r.x0); x1 = E.Q(r.x1); name = r.name;
    } else {
      p = E.Q(BigInt(1 + rng.int(3))); q = E.Q(BigInt(rng.int(4) - 1 || 1));
      x0 = E.Q(BigInt(rng.int(5))); x1 = E.Q(BigInt(1 + rng.int(5))); name = 'p=' + E.qToString(p) + ' q=' + E.qToString(q);
    }
    const xs = [x0, x1];
    for (let k = 2; k <= n; k++) xs.push(E.qAdd(E.qMul(p, xs[k - 1]), E.qMul(q, xs[k - 2])));
    out.push({ id: 'seq.rec.' + i, kind: 'recurrence', terms: xs.slice(0, n).map(E.qToString), expected: E.qToString(xs[n]), rule: 'x_k = p x_{k-1} + q x_{k-2}, ' + name, meta: { p: E.qToString(p), q: E.qToString(q), x0: E.qToString(x0), x1: E.qToString(x1) } });
  }
}

function genPolynomial(rng, count, out) {
  for (let i = 0; i < count; i++) {
    const deg = 2 + rng.int(2);
    const n = 7 + rng.int(3);
    const coef = [];
    for (let j = 0; j <= deg; j++) coef.push(smallQ(rng, { allowFraction: j === 0 }));
    if (E.qIsZero(coef[deg])) coef[deg] = E.Q1;
    const at = (k) => { let acc = E.Q0; for (let j = 0; j <= deg; j++) acc = E.qAdd(acc, E.qMul(coef[j], E.qPow(E.Q(BigInt(k)), j))); return acc; };
    const terms = [];
    for (let k = 0; k < n; k++) terms.push(E.qToString(at(k)));
    out.push({ id: 'seq.pol.' + i, kind: 'polynomial', terms, expected: E.qToString(at(n)), rule: 'degree ' + deg + ' polynomial in n', meta: { degree: deg, coef: coef.map(E.qToString) } });
  }
}

export function generateSequences({ seed = 'sequence/1', counts = SEQUENCE_COUNTS } = {}) {
  const c = { ...SEQUENCE_COUNTS, ...counts };
  const out = [];
  genArithmetic(new RNG(seed + ':ari'), c.arithmetic, out);
  genGeometric(new RNG(seed + ':geo'), c.geometric, out);
  genPeriodic(new RNG(seed + ':per'), c.periodic, out);
  genRecurrence(new RNG(seed + ':rec'), c.recurrence, out);
  genPolynomial(new RNG(seed + ':pol'), c.polynomial, out);
  for (const p of out) p.prompt = p.terms.join(', ') + ', ?';
  return out;
}

// ---------------------------------------------------------------- the solving organism
export function buildSequenceBrain({ name = 'sequence', ledger = 'runs' } = {}) {
  const b = new Brain({ name, ledger, pruneEvery: 0, growth: { threshold: Number.MAX_SAFE_INTEGER } });
  b.addCell({ id: 'seq.fit', kind: 'seq.fit', region: 'cognitive', circuit: 'sequence', policy: { period: 'event' } });
  return b;
}

// The one role this suite injects into. A brain that has no seq.fit cell cannot answer it
// at all, which nameCells reports by name rather than by a thrown error.
export const SEQUENCE_ROLES = Object.freeze([
  { role: 'fit', kind: 'seq.fit', why: 'the whole suite: one cell that writes and verifies a sym program per hypothesis' },
]);
export const SEQUENCE_CELLS = Object.freeze({ fit: 'seq.fit' });

/**
 * Name the cells of an arbitrary brain for the one role this suite injects into.
 * @param {object} brain @returns {{ cells, missing, chosen }}
 */
export function sequenceCellsOf(brain) { return nameCells(brain, SEQUENCE_ROLES); }

/**
 * @param {object[]} problems
 * @param {object} [opts]
 * @param {object} [opts.brain] the brain to answer through; built here when absent
 * @param {object} [opts.cells] role -> cell id, for a HOSTED run inside another brain. The
 *   answer is then read through a tap (tasks/host.mjs), because inside a brain that wires
 *   every out port nothing reaches the outbox on its own.
 * @param {boolean} [opts.baseline] run the stock predict.next floor. Off by default in a
 *   hosted run: the floor needs a FRESH cell per problem so no history leaks between them,
 *   and adding one cell per problem to somebody else's organism is not a measurement of
 *   that organism.
 */
export function solveSequences(problems, { brain = null, cells = null, tap = null, ticks = null, baseline = null } = {}) {
  const b = brain || buildSequenceBrain();
  const hosted = cells !== null;
  const map = cells || SEQUENCE_CELLS;
  const fitId = map.fit || null;
  const useTap = tap === null ? hosted : tap;
  const nTicks = ticks === null ? (useTap ? 2 : 1) : ticks;
  const runBaseline = baseline === null ? !hosted : baseline;
  if (!fitId) {
    return { brain: b, results: problems.map((p) => ({ id: p.id, got: null, model: null, program: null, tried: 0, baseline: null, error: 'no cell for role fit' })) };
  }
  const fitIdx = readHeads(b, [fitId], { tap: useTap }).readIdx.get(fitId);
  const results = [];
  for (let i = 0; i < problems.length; i++) {
    const p = problems[i];

    // the stock predictor, one fresh cell per problem so no history leaks between them
    let baselineNext = null;
    if (runBaseline) {
      const id = 'seq.pn.' + i;
      const pn = b.addCell({ id, kind: 'predict.next', region: 'perception', circuit: 'sequence', params: { history: 4 }, policy: { period: 'event' } });
      for (const t of p.terms) {
        b.inject(id, 'observe', { kind: 'num', data: S.ratFromDecimal(String(t)) });
        b.tick(1);
        const sigs = b.takeOutbox().filter(s => s.src === pn.idx && s.port === 0);
        const last = sigs[sigs.length - 1];
        if (last) { const r = S.toRat(last.data); baselineNext = r.d === 1n ? r.n.toString() : r.n.toString() + '/' + r.d.toString(); }
      }
    }

    // the fitter
    b.inject(fitId, 'terms', { kind: 'event', data: { terms: p.terms } });
    b.tick(nTicks);
    const outs = b.takeOutbox().filter(s => s.src === fitIdx);
    const sig = outs[outs.length - 1] ?? null;
    results.push({
      id: p.id,
      got: sig ? sig.data.next : null,
      model: sig ? sig.data.model : null,
      program: sig ? sig.data.program : null,
      tried: sig ? sig.data.tried : 0,
      baseline: baselineNext,
    });
  }
  return { brain: b, results };
}

// ---------------------------------------------------------------- grader
export function gradeSequences(problems, results, { maxFailures = 25 } = {}) {
  const byId = new Map(results.map(r => [r.id, r]));
  const byKind = {}, models = {};
  const failures = [];
  let correct = 0, baselineCorrect = 0, triedTotal = 0;
  for (const p of problems) {
    const r = byId.get(p.id) || { got: null, baseline: null, tried: 0, model: null };
    const ok = r.got !== null && r.got === p.expected;
    if (ok) correct++;
    if (r.baseline !== null && r.baseline === p.expected) baselineCorrect++;
    triedTotal += r.tried || 0;
    const e = byKind[p.kind] || (byKind[p.kind] = { n: 0, correct: 0, baselineCorrect: 0 });
    e.n++; if (ok) e.correct++; if (r.baseline !== null && r.baseline === p.expected) e.baselineCorrect++;
    const mk = r.model || '(none)';
    const m = models[mk] || (models[mk] = { picked: 0, correct: 0 });
    m.picked++; if (ok) m.correct++;
    if (!ok) failures.push({ id: p.id, kind: p.kind, prompt: p.prompt, expected: p.expected, got: r.got, model: r.model, rule: p.rule });
  }
  for (const k of Object.keys(byKind)) {
    byKind[k].accuracy = byKind[k].n ? byKind[k].correct / byKind[k].n : 0;
    byKind[k].baselineAccuracy = byKind[k].n ? byKind[k].baselineCorrect / byKind[k].n : 0;
  }
  return {
    suite: 'sequence', n: problems.length, correct,
    accuracy: problems.length ? correct / problems.length : 0,
    baselineCorrect, baselineAccuracy: problems.length ? baselineCorrect / problems.length : 0,
    meanHypothesesTried: problems.length ? triedTotal / problems.length : 0,
    byKind, models, failures: failures.slice(0, maxFailures), failureCount: failures.length, allFailures: failures,
  };
}

export function runSequences(opts = {}) {
  const problems = generateSequences(opts);
  const t0 = process.hrtime.bigint();
  const { brain, results } = solveSequences(problems, opts);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const report = gradeSequences(problems, results, opts);
  report.ms = Math.round(ms * 1000) / 1000;
  report.cells = brain.cells.length;
  report.ticks = brain.stats.ticks;
  report.cellRuns = brain.stats.runs;
  return { problems, results, report, brain };
}

export const sequenceSuite = Object.freeze({
  name: 'sequence',
  doc: 'next element of an exact rational sequence, induced by verified sym programs in a seq.fit cell, with the stock predict.next cell as the floor',
  generate: generateSequences, solve: solveSequences, grade: gradeSequences, run: runSequences,
});
