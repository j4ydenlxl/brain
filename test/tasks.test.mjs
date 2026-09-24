// test/tasks.test.mjs: the yardstick has to be straight before anything is measured with
// it. Four things are checked here and nothing is taken on trust:
//   1. the generators are deterministic per seed, and move when the seed moves,
//   2. every expected answer survives a THIRD implementation, one that shares no code
//      with either tasks/exact.mjs or the brain (schoolbook long multiplication on digit
//      arrays, padded decimal comparison on strings, structural checks read off the far
//      end of each sequence),
//   3. every suite runs end to end through real cells and prints its accuracy,
//   4. the exact-arithmetic subset of the algebra suite is 100 percent, or this file
//      fails and names every problem that missed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as S from '../core/signal.mjs';
import { evalSym } from '../core/primitives.mjs';
import { Brain } from '../core/brain.mjs';
import { G } from '../cells/grid.mjs';
import '../cells/basic.mjs';
import '../cells/grid.mjs';
import * as E from '../tasks/exact.mjs';
import { buildOrganism } from '../seeds/organism.mjs';
import {
  generateAlgebra, runAlgebra, solveAlgebra, gradeAlgebra, algebraCellsOf, canonNum,
  generateSequences, runSequences, fitSequence, solveSequences, gradeSequences, sequenceCellsOf,
  generateGrids, runGrids, searchProgram, inferColorMap, SEARCH_OPS,
  nameCells, attachTap,
  SUITES, getSuite,
} from '../tasks/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

// ---------------------------------------------------------------- third implementations
// Long multiplication on digit arrays. Numbers only: no BigInt multiply anywhere, so an
// agreement with tasks/exact.mjs is an agreement between two different algorithms.
function schoolbookMul(a, b) {
  const A = [...a].reverse().map(Number), B = [...b].reverse().map(Number);
  const out = new Array(A.length + B.length).fill(0);
  for (let i = 0; i < A.length; i++) for (let j = 0; j < B.length; j++) out[i + j] += A[i] * B[j];
  for (let k = 0; k < out.length - 1; k++) { out[k + 1] += Math.floor(out[k] / 10); out[k] %= 10; }
  while (out.length > 1 && out[out.length - 1] === 0) out.pop();
  return out.reverse().join('');
}

// Decimal order decided by padding both sides to a common shape and comparing the digit
// strings. No arithmetic at all, which is exactly why it is worth having.
function splitDec(s) {
  let sign = 1;
  if (s.startsWith('-')) { sign = -1; s = s.slice(1); } else if (s.startsWith('+')) s = s.slice(1);
  const dot = s.indexOf('.');
  const ip = (dot < 0 ? s : s.slice(0, dot)).replace(/^0+(?=\d)/, '');
  const fp = dot < 0 ? '' : s.slice(dot + 1);
  return { sign, ip: ip || '0', fp };
}
function paddedCompare(as, bs) {
  const x = splitDec(as), y = splitDec(bs);
  const xz = /^0*$/.test(x.ip + x.fp), yz = /^0*$/.test(y.ip + y.fp);
  const sx = xz ? 0 : x.sign, sy = yz ? 0 : y.sign;
  if (sx !== sy) return sx < sy ? -1 : 1;
  if (sx === 0) return 0;
  const il = Math.max(x.ip.length, y.ip.length), fl = Math.max(x.fp.length, y.fp.length);
  const a = x.ip.padStart(il, '0') + x.fp.padEnd(fl, '0');
  const b = y.ip.padStart(il, '0') + y.fp.padEnd(fl, '0');
  const m = a < b ? -1 : a > b ? 1 : 0;
  return sx > 0 ? m : -m;
}

const Q = (s) => E.qFromString(String(s));
const fingerprint = (o) => JSON.stringify(o, (k, v) => (typeof v === 'bigint' ? v.toString() : v));

// Run one cell kind as a cell: inject, tick, read the outbox. Nothing is called directly.
function throughCell(kind, params, inputs) {
  const b = new Brain({ ledger: 'off', pruneEvery: 0, growth: { threshold: Number.MAX_SAFE_INTEGER } });
  b.addCell({ id: 'c', kind, region: 'cognitive', params, policy: { period: 'event' } });
  for (const [port, data] of inputs) b.inject('c', port, { kind: 'event', data });
  b.tick(1);
  const out = b.takeOutbox();
  return out.length ? out[out.length - 1].data : null;
}

// ---------------------------------------------------------------- 1. determinism
test('every generator is deterministic per seed, moves when the seed moves, and meets its size floor', () => {
  const a1 = generateAlgebra({ seed: 'fixed' }), a2 = generateAlgebra({ seed: 'fixed' }), a3 = generateAlgebra({ seed: 'other' });
  assert.equal(fingerprint(a1), fingerprint(a2), 'algebra is not reproducible from its seed');
  assert.notEqual(fingerprint(a1), fingerprint(a3), 'algebra ignores its seed');
  assert.ok(a1.length >= 300, 'algebra generated ' + a1.length + ', the floor is 300');

  const s1 = generateSequences({ seed: 'fixed' }), s2 = generateSequences({ seed: 'fixed' }), s3 = generateSequences({ seed: 'other' });
  assert.equal(fingerprint(s1), fingerprint(s2), 'sequence is not reproducible from its seed');
  assert.notEqual(fingerprint(s1), fingerprint(s3), 'sequence ignores its seed');
  assert.ok(s1.length >= 200, 'sequence generated ' + s1.length + ', the floor is 200');

  const g1 = generateGrids({ seed: 'fixed' }), g2 = generateGrids({ seed: 'fixed' }), g3 = generateGrids({ seed: 'other' });
  assert.equal(fingerprint(g1), fingerprint(g2), 'grid is not reproducible from its seed');
  assert.notEqual(fingerprint(g1), fingerprint(g3), 'grid ignores its seed');
  assert.ok(g1.length >= 150, 'grid generated ' + g1.length + ', the floor is 150');

  console.log('generated: algebra ' + a1.length + ', sequence ' + s1.length + ', grid ' + g1.length);
});

// ---------------------------------------------------------------- 2. expected answers
test('algebra expected answers survive a third implementation that shares no code with the ruler or the brain', () => {
  const problems = generateAlgebra({ seed: 'check' });
  let muls = 0, cmps = 0, fracs = 0, sums = 0;

  for (const p of problems) {
    if (p.kind === 'bigint.mul') {
      // both operands are plain positive integers, so the product is one too. The prompt
      // is the only source used here: half this family carries no a/b fields at all.
      const [a, , b] = p.prompt.split(' ');
      assert.equal(p.expected, schoolbookMul(a, b), 'long multiplication disagreed on ' + p.prompt);
      muls++;
    } else if (p.kind === 'decimal.compare') {
      assert.equal(p.expected, String(paddedCompare(p.a, p.b)), 'padded digit comparison disagreed on ' + p.prompt);
      cmps++;
    } else if (p.kind === 'decimal.sum') {
      // the sum of decimals scaled to a common number of places is an integer sum
      const terms = p.prompt.replace(/[()]/g, '').split(' + ');
      const places = Math.max(...terms.map(t => { const d = t.indexOf('.'); return d < 0 ? 0 : t.length - d - 1; }));
      let acc = 0n;
      for (const t of terms) { const s = splitDec(t); acc += BigInt(s.ip + s.fp.padEnd(places, '0')) * BigInt(s.sign); }
      const want = E.Q(acc, 10n ** BigInt(places));
      assert.equal(p.expected, E.qToString(want), 'scaled integer addition disagreed on ' + p.prompt);
      sums++;
    } else if (p.kind === 'fraction.arith') {
      // floating point cannot be exact, but it can catch an answer that is simply wrong
      const [as, op, bs] = p.prompt.split(' ');
      const qa = Q(as), qb = Q(bs), q = Q(p.expected);
      const fa = Number(qa.n) / Number(qa.d), fb = Number(qb.n) / Number(qb.d);
      const approx = op === '+' ? fa + fb : op === '-' ? fa - fb : op === '*' ? fa * fb : fa / fb;
      const got = Number(q.n) / Number(q.d);
      assert.ok(Math.abs(got - approx) <= 1e-9 * Math.max(1, Math.abs(approx)), 'float disagreed on ' + p.prompt + ': ' + got + ' vs ' + approx);
      fracs++;
    }
  }
  assert.ok(muls >= 40 && cmps >= 40 && fracs >= 40 && sums >= 40, 'too few problems reached the third implementation');
  console.log('third implementation agreed on ' + muls + ' long multiplications, ' + cmps + ' decimal comparisons, ' + sums + ' decimal sums, ' + fracs + ' fraction operations');
});

test('every stated root actually satisfies its own equation, checked by substitution', () => {
  const problems = generateAlgebra({ seed: 'check' }).filter(p => p.kind === 'linear.solve');
  assert.ok(problems.length >= 40, 'only ' + problems.length + ' linear equations');
  for (const p of problems) {
    const env = { x: S.ratFromDecimal(p.expected) };
    const left = evalSym(p.eq.args[0], env), right = evalSym(p.eq.args[1], env);
    assert.equal(S.ratCmp(left, right), 0, 'the stated root does not solve ' + p.prompt + ' (x = ' + p.expected + ')');
  }
  console.log('substitution confirmed ' + problems.length + ' roots');
});

test('sequence expected answers are re-derived from the far end of each tape, not from the rule that built it', () => {
  const problems = generateSequences({ seed: 'check' });
  const seen = {};
  for (const p of problems) {
    const xs = p.terms.map(Q), next = Q(p.expected), n = xs.length;
    seen[p.kind] = (seen[p.kind] || 0) + 1;
    if (p.kind === 'arithmetic') {
      const d = E.qSub(xs[1], xs[0]);
      for (let i = 2; i < n; i++) assert.ok(E.qEq(E.qSub(xs[i], xs[i - 1]), d), 'not arithmetic: ' + p.prompt);
      assert.ok(E.qEq(E.qSub(next, xs[n - 1]), d), 'the next term breaks the common difference: ' + p.prompt);
    } else if (p.kind === 'geometric') {
      // r read off the LAST pair, then applied forward: the generator built the tape from the first
      const r = E.qDiv(xs[n - 1], xs[n - 2]);
      assert.ok(E.qEq(E.qMul(xs[n - 1], r), next), 'the next term breaks the common ratio: ' + p.prompt);
    } else if (p.kind === 'periodic') {
      const per = p.meta.period;
      assert.ok(E.qEq(next, xs[n - per]), 'the next term is not one period back: ' + p.prompt);
    } else if (p.kind === 'recurrence') {
      const pp = Q(p.meta.p), qq = Q(p.meta.q);
      assert.ok(E.qEq(next, E.qAdd(E.qMul(pp, xs[n - 1]), E.qMul(qq, xs[n - 2]))), 'the next term breaks the recurrence: ' + p.prompt);
    } else if (p.kind === 'polynomial') {
      // the degree+1 forward difference of the whole tape plus the answer must vanish
      let row = xs.concat([next]);
      for (let k = 0; k <= p.meta.degree; k++) { const nx = []; for (let i = 0; i + 1 < row.length; i++) nx.push(E.qSub(row[i + 1], row[i])); row = nx; }
      assert.ok(row.length > 0, 'tape too short for a degree ' + p.meta.degree + ' check');
      for (const v of row) assert.ok(E.qIsZero(v), 'the next term breaks the polynomial degree: ' + p.prompt);
    }
  }
  console.log('structural re-derivation confirmed ' + JSON.stringify(seen));
});

// ---------------------------------------------------------------- 3. suites end to end
test('the algebra suite runs end to end through cells, and the exact-arithmetic subset is 100 percent', () => {
  const { report } = runAlgebra();
  console.log('algebra: ' + report.correct + '/' + report.n + ' = ' + (report.accuracy * 100).toFixed(2) + '% in ' + report.ms.toFixed(1) + 'ms across ' + report.cells + ' cells and ' + report.ticks + ' ticks');
  for (const [k, v] of Object.entries(report.byKind)) console.log('  ' + k.padEnd(18) + v.correct + '/' + v.n + ' = ' + (v.accuracy * 100).toFixed(2) + '%');

  const arith = report.byFamily.arith;
  assert.ok(arith && arith.n >= 250, 'the exact-arithmetic subset is only ' + (arith ? arith.n : 0) + ' problems');
  if (arith.correct !== arith.n) {
    const bad = report.allFailures.filter(f => f.kind !== 'linear.solve');
    const lines = bad.map(f => '  ' + f.id + ' [' + f.kind + '] ' + f.prompt + '\n      expected ' + f.expected + '\n      got      ' + f.got + (f.error ? '\n      error    ' + f.error : ''));
    assert.fail('exact arithmetic is ' + arith.correct + '/' + arith.n + ', not 100 percent. Failing problems:\n' + lines.join('\n'));
  }
  assert.equal(arith.accuracy, 1);
  assert.equal(report.byKind['linear.solve'].accuracy, 1, 'linear.solve fell below 100 percent');
});

// ---------------------------------------------------------------- inside another brain
// A suite used to know only the cell ids of the little brain it builds for itself, so
// handing it another brain did nothing (notes/generations.md request 7). These name the
// cells of a brain somebody else built and run the suite through THOSE cells, over the
// organism's own connectome, reading the answer out through a tap.
test('nameCells names the cells of a brain the suite did not build, and says what is missing', () => {
  const b = new Brain({ name: 'named', ledger: 'off', pruneEvery: 0, growth: { threshold: Number.MAX_SAFE_INTEGER } });
  b.addCell({ id: 'x.slow', kind: 'num.compare', region: 'cognitive', circuit: 'c', policy: { period: 1000 } });
  b.addCell({ id: 'x.fast', kind: 'num.compare', region: 'cognitive', circuit: 'c', policy: { period: 'event' } });
  b.addCell({ id: 'x.plus', kind: 'num.arith', region: 'cognitive', circuit: 'c', params: { op: '+' }, policy: { period: 'event' } });
  const named = nameCells(b, [
    { role: 'cmp', kind: 'num.compare' },
    { role: '+', kind: 'num.arith', where: (c) => c.params.op === '+' },
    { role: '^', kind: 'num.arith', where: (c) => c.params.op === '^' },
    { role: 'nope', kind: 'sym.eval' },
  ]);
  // A cell that runs on mail answers this tick; one on a numeric period does not, so the
  // event cell wins even though the slow one has the lower index.
  assert.equal(named.cells.cmp, 'x.fast');
  assert.equal(named.cells['+'], 'x.plus');
  assert.deepEqual(named.missing.sort(), ['^', 'nope']);
  assert.equal(named.chosen.length, 2);
});

test('a tap reads an answer out of a cell whose out port is already wired', () => {
  const b = new Brain({ name: 'tapped', ledger: 'off', pruneEvery: 0, growth: { threshold: Number.MAX_SAFE_INTEGER } });
  b.addCell({ id: 't.arith', kind: 'num.arith', region: 'cognitive', circuit: 'c', params: { op: '+' }, policy: { period: 'event' } });
  b.addCell({ id: 't.down', kind: 'sink.log', region: 'cognitive', circuit: 'c', policy: { period: 'event' } });
  b.connect('t.arith', 'out', 't.down', 'in');
  // Wired to a sink, the answer routes and therefore never reaches the outbox at all.
  b.inject('t.arith', 'a', { kind: 'num', data: S.ratFromDecimal('1.5') });
  b.inject('t.arith', 'b', { kind: 'num', data: S.ratFromDecimal('2.5') });
  b.tick(2);
  assert.equal(b.takeOutbox().filter(s => s.src === b.cell('t.arith').idx).length, 0, 'a wired cell reached the outbox');

  const tap = attachTap(b, 't.arith');
  assert.equal(attachTap(b, 't.arith').added, false, 'a second tap on the same port was added');
  b.inject('t.arith', 'a', { kind: 'num', data: S.ratFromDecimal('1.5') });
  b.inject('t.arith', 'b', { kind: 'num', data: S.ratFromDecimal('2.5') });
  b.tick(2);
  const outs = b.takeOutbox().filter(s => s.src === tap.idx);
  assert.equal(outs.length, 1, 'the tap emitted ' + outs.length + ' signals');
  assert.equal(canonNum(outs[0].data), '4');
});

test('the algebra suite runs INSIDE an organism, through cells named in it, and the difference is printed', () => {
  const counts = { decimalCompare: 20, decimalSum: 16, bigintMul: 16, fractionArith: 16, nestedEval: 16, power: 16, linearSolve: 20 };
  const problems = generateAlgebra({ seed: 'hosted/test', counts });
  const own = gradeAlgebra(problems, solveAlgebra(problems).results);

  const brain = buildOrganism({ majors: 200, subcellsPerMajor: 8, name: 'hosted-test', seed: 'organism' });
  const named = algebraCellsOf(brain);
  assert.ok(named.chosen.length >= 6, 'the organism filled only ' + named.chosen.length + ' of the 8 algebra roles');
  for (const role of ['eval', 'solve', 'cmp']) assert.ok(named.cells[role], 'no cell named for role ' + role);
  const errorsBefore = brain.stats.errors;
  const hostedResults = solveAlgebra(problems, { brain, cells: named.cells }).results;
  const hosted = gradeAlgebra(problems, hostedResults);

  console.log('  algebra own brain      ' + own.correct + '/' + own.n + ' = ' + (own.accuracy * 100).toFixed(4) + '%');
  console.log('  algebra in organism    ' + hosted.correct + '/' + hosted.n + ' = ' + (hosted.accuracy * 100).toFixed(4) + '%'
    + ', difference ' + (hosted.accuracy - own.accuracy).toFixed(6));
  console.log('  roles filled           ' + named.chosen.map(c => c.role + '=' + c.id).join(' '));
  console.log('  roles missing          ' + (named.missing.length ? named.missing.join(' ') : 'none'));

  assert.equal(own.accuracy, 1, 'the suite is not 100 percent on its own brain, so no difference means anything');
  assert.ok(hosted.correct > 0, 'the organism answered nothing at all');
  assert.equal(brain.stats.errors, errorsBefore, 'a cell threw while the suite ran inside the organism: ' + JSON.stringify(brain.lastError));
  // Every problem the organism got wrong is a problem of a role it has no cell for. There
  // is no third category: an organism cell that ran answered exactly what the suite's own
  // cell of that kind answered, because it IS the same kind on the same input.
  const missing = new Set(named.missing);
  for (const f of hosted.allFailures) {
    const r = hostedResults.find(x => x.id === f.id);
    assert.ok(missing.has(r.role), f.id + ' [' + f.kind + '] failed on role ' + r.role + ', which the organism does have a cell for');
  }
});

test('the sequence suite runs INSIDE an organism and matches its own brain', () => {
  const counts = { arithmetic: 10, geometric: 8, periodic: 8, recurrence: 8, polynomial: 10 };
  const problems = generateSequences({ seed: 'hosted/test', counts });
  const own = gradeSequences(problems, solveSequences(problems, { baseline: false }).results);
  const brain = buildOrganism({ majors: 200, subcellsPerMajor: 8, name: 'hosted-seq', seed: 'organism' });
  const named = sequenceCellsOf(brain);
  assert.deepEqual(named.missing, [], 'the organism has no seq.fit cell');
  const hosted = gradeSequences(problems, solveSequences(problems, { brain, cells: named.cells }).results);
  console.log('  sequence own brain     ' + own.correct + '/' + own.n + ' = ' + (own.accuracy * 100).toFixed(4) + '%');
  console.log('  sequence in organism   ' + hosted.correct + '/' + hosted.n + ' = ' + (hosted.accuracy * 100).toFixed(4) + '%'
    + ', difference ' + (hosted.accuracy - own.accuracy).toFixed(6));
  assert.equal(hosted.accuracy, own.accuracy, 'the organism and the suite brain disagreed on the same seq.fit kind');
});

test('a brain with none of the cells a suite wants answers nothing rather than throwing', () => {
  const empty = new Brain({ name: 'empty', ledger: 'off', pruneEvery: 0, growth: { threshold: Number.MAX_SAFE_INTEGER } });
  const problems = generateAlgebra({ seed: 'empty/test', counts: { decimalCompare: 2, decimalSum: 2, bigintMul: 2, fractionArith: 2, nestedEval: 2, power: 2, linearSolve: 2 } });
  const named = algebraCellsOf(empty);
  assert.equal(named.chosen.length, 0);
  const { results } = solveAlgebra(problems, { brain: empty, cells: named.cells });
  assert.equal(results.length, problems.length);
  for (const r of results) { assert.equal(r.got, null); assert.match(r.error, /no cell for role/); }
  assert.equal(gradeAlgebra(problems, results).accuracy, 0);

  const seqProblems = generateSequences({ seed: 'empty/test', counts: { arithmetic: 2, geometric: 2, periodic: 2, recurrence: 2, polynomial: 2 } });
  const seqNamed = sequenceCellsOf(empty);
  assert.deepEqual(seqNamed.missing, ['fit']);
  const seq = solveSequences(seqProblems, { brain: empty, cells: seqNamed.cells });
  for (const r of seq.results) { assert.equal(r.got, null); assert.match(r.error, /no cell for role/); }
});

test('the sequence suite runs end to end, and every program it fitted is a sym program a sym.eval cell reproduces', () => {
  const { problems, results, report } = runSequences();
  console.log('sequence: ' + report.correct + '/' + report.n + ' = ' + (report.accuracy * 100).toFixed(2) + '%, predict.next floor ' + report.baselineCorrect + '/' + report.n + ' = ' + (report.baselineAccuracy * 100).toFixed(2) + '%, mean hypotheses tried ' + report.meanHypothesesTried.toFixed(2) + ', ' + report.ms.toFixed(1) + 'ms');
  for (const [k, v] of Object.entries(report.byKind)) console.log('  ' + k.padEnd(12) + v.correct + '/' + v.n + ' = ' + (v.accuracy * 100).toFixed(2) + '%   floor ' + v.baselineCorrect + '/' + v.n);
  if (report.failureCount) console.log('  failures: ' + JSON.stringify(report.failures));

  assert.equal(report.correct, report.n, 'sequence is ' + report.correct + '/' + report.n + ': ' + JSON.stringify(report.failures));
  assert.ok(report.baselineAccuracy < report.accuracy, 'the stock predictor scored as well as the fitter, so the suite measures nothing');
  assert.ok(results.every(r => r.model), 'some problem produced no model');

  // The fitted program goes back into the brain through a sym.eval cell: the same sym
  // tree, evaluated by a cell rather than by the fitter, must give the same next term.
  const b = new Brain({ name: 'replay', ledger: 'runs', pruneEvery: 0, growth: { threshold: Number.MAX_SAFE_INTEGER } });
  b.addCell({ id: 'ev', kind: 'sym.eval', region: 'cognitive', policy: { period: 'event' } });
  const idx = b.cell('ev').idx;
  let replayed = 0;
  for (let i = 0; i < problems.length; i += 7) {
    const p = problems[i];
    const fit = fitSequence(p.terms);
    assert.ok(fit && fit.program, 'no program for ' + p.id);
    b.inject('ev', 'env', { kind: 'event', data: { n: String(p.terms.length) } });
    b.inject('ev', 'expr', { kind: 'sym', data: fit.program });
    b.tick(1);
    const outs = b.takeOutbox().filter(s => s.src === idx);
    const sig = outs[outs.length - 1];
    assert.ok(sig, 'sym.eval emitted nothing for ' + p.id);
    const r = S.toRat(sig.data);
    const got = r.d === 1n ? r.n.toString() : r.n.toString() + '/' + r.d.toString();
    assert.equal(got, p.expected, 'the fitted program for ' + p.id + ' (' + fit.model + ') gave ' + got + ' through a sym.eval cell, expected ' + p.expected);
    replayed++;
  }
  assert.ok(replayed >= 25, 'only ' + replayed + ' programs replayed');
  assert.equal(b.cell('ev').stats.errors, 0, 'sym.eval threw while replaying a fitted program');
  console.log('  ' + replayed + ' fitted sym programs replayed through a sym.eval cell, all exact');
});

// ---------------------------------------------------------------- grid primitives
test('all eleven grid primitives compute as cells, and the invertible ones invert', () => {
  const g = G.from([[1, 2, 0], [0, 3, 4], [5, 0, 6]]);
  const rect = G.from([[1, 2, 0, 4], [0, 3, 4, 0]]);

  // rotate: four quarter turns come home, and one turn is not the identity
  let r = g;
  for (let i = 0; i < 4; i++) r = throughCell('grid.rotate', { turns: 1 }, [['in', r]]);
  assert.ok(G.equal(r, g), 'four quarter turns did not come home');
  assert.ok(!G.equal(throughCell('grid.rotate', { turns: 1 }, [['in', g]]), g), 'one quarter turn changed nothing');
  assert.deepEqual(G.rows(throughCell('grid.rotate', { turns: 1 }, [['in', rect]])), [[0, 1], [3, 2], [4, 0], [0, 4]]);
  assert.ok(G.equal(throughCell('grid.rotate', { turns: 2 }, [['in', rect]]), G.rotate(G.rotate(rect, 1), 1)));

  // flip: twice on either axis is the identity, and the two axes differ
  for (const axis of ['h', 'v']) {
    const once = throughCell('grid.flip', { axis }, [['in', g]]);
    assert.ok(!G.equal(once, g), 'flip ' + axis + ' changed nothing');
    assert.ok(G.equal(throughCell('grid.flip', { axis }, [['in', once]]), g), 'flip ' + axis + ' twice is not the identity');
  }
  assert.deepEqual(G.rows(throughCell('grid.flip', { axis: 'h' }, [['in', rect]])), [[4, 0, 2, 1], [0, 4, 3, 0]]);

  // transpose: an involution, and it swaps the sides of a rectangle
  const tr = throughCell('grid.transpose', {}, [['in', rect]]);
  assert.equal(tr.w, rect.h); assert.equal(tr.h, rect.w);
  assert.ok(G.equal(throughCell('grid.transpose', {}, [['in', tr]]), rect));

  // colormap
  assert.deepEqual(G.rows(throughCell('grid.colormap', { map: { 1: 7, 3: 8 } }, [['in', g]])), [[7, 2, 0], [0, 8, 4], [5, 0, 6]]);

  // crop, both modes
  const sparse = G.from([[0, 0, 0, 0], [0, 5, 6, 0], [0, 7, 0, 0], [0, 0, 0, 0]]);
  assert.deepEqual(G.rows(throughCell('grid.crop', { mode: 'bbox', bg: 0 }, [['in', sparse]])), [[5, 6], [7, 0]]);
  assert.deepEqual(G.rows(throughCell('grid.crop', { mode: 'rect', x: 1, y: 0, w: 2, h: 2 }, [['in', g]])), [[2, 0], [3, 4]]);

  // translate, wrapping and not
  assert.deepEqual(G.rows(throughCell('grid.translate', { dx: 1, dy: 0, wrap: true }, [['in', rect]])), [[4, 1, 2, 0], [0, 0, 3, 4]]);
  assert.deepEqual(G.rows(throughCell('grid.translate', { dx: 1, dy: 0, wrap: false, fill: 9 }, [['in', rect]])), [[9, 1, 2, 0], [9, 0, 3, 4]]);

  // tile
  const tiled = throughCell('grid.tile', { nx: 2, ny: 3 }, [['in', rect]]);
  assert.equal(tiled.w, rect.w * 2); assert.equal(tiled.h, rect.h * 3);
  assert.deepEqual(G.rows(tiled)[0], [1, 2, 0, 4, 1, 2, 0, 4]);

  // count colours: exact, and the counts add up to the cell total
  const counts = throughCell('grid.count', {}, [['in', g]]);
  assert.equal(counts.total, 9);
  assert.equal(counts.counts[0], 3);
  assert.equal(counts.distinct, 7);
  assert.equal(Object.values(counts.counts).reduce((a, b) => a + b, 0), 9);

  // connected components, 4-neighbour then 8-neighbour on the same grid
  const blobs = G.from([[1, 1, 0, 2], [1, 0, 0, 2], [0, 0, 3, 0], [0, 3, 0, 0]]);
  const c4 = throughCell('grid.components', { bg: 0, diagonal: false }, [['in', blobs]]);
  assert.equal(c4.count, 4);
  assert.deepEqual(c4.sizes.slice().sort((a, b) => a - b), [1, 1, 2, 3]);
  const c8 = throughCell('grid.components', { bg: 0, diagonal: true }, [['in', blobs]]);
  assert.equal(c8.count, 3, '8-neighbour joins the two threes across the diagonal');
  assert.ok(G.valid(c4.labels), 'the label map is not a grid');

  // symmetry
  const sym = G.from([[1, 2, 1], [3, 4, 3], [1, 2, 1]]);
  const s = throughCell('grid.symmetry', {}, [['in', sym]]);
  assert.equal(s.horizontal, true); assert.equal(s.vertical, true); assert.equal(s.rot180, true);
  const asym = throughCell('grid.symmetry', {}, [['in', g]]);
  assert.equal(asym.horizontal, false);
  assert.equal(throughCell('grid.symmetry', {}, [['in', rect]]).diagonal, false, 'a rectangle cannot have a diagonal symmetry');

  // overlay, the one two-input primitive
  const base = G.from([[1, 1], [1, 1]]), top = G.from([[0, 5], [0, 0]]);
  assert.deepEqual(G.rows(throughCell('grid.overlay', { bg: 0 }, [['a', base], ['b', top]])), [[1, 5], [1, 1]]);

  console.log('eleven grid primitives exercised as cells');
});

test('the colour map inference reads a recolouring off the demonstrations, and refuses an inconsistent one', () => {
  const a = G.from([[1, 2], [2, 1]]), b = G.from([[3, 4], [4, 3]]);
  assert.deepEqual(inferColorMap([a], [b]), { 1: 3, 2: 4 });
  assert.equal(inferColorMap([a], [G.from([[3, 4], [5, 3]])]), null, 'an inconsistent recolouring was accepted');
  assert.equal(inferColorMap([a], [a]), null, 'the identity recolouring should not be offered as a step');
  assert.equal(inferColorMap([a], [G.from([[1, 2, 3], [3, 2, 1]])]), null, 'a shape mismatch was accepted');
});

test('the grid suite runs end to end, the winning program is executed through real cells, and the search is small', () => {
  const { tasks, results, report } = runGrids();
  console.log('grid: ' + report.correct + '/' + report.n + ' = ' + (report.accuracy * 100).toFixed(2) + '%, mean search size ' + report.meanSearchSize.toFixed(1) + ', programs found ' + report.programsFound + '/' + report.n + ', hidden program recovered exactly ' + report.recoveredHiddenProgram + ', ' + report.ms.toFixed(1) + 'ms');
  for (const [k, v] of Object.entries(report.byDepth)) console.log('  ' + k.padEnd(8) + v.correct + '/' + v.n + ' = ' + (v.accuracy * 100).toFixed(2) + '%   mean search ' + v.meanSearched.toFixed(1));
  if (report.failureCount) for (const f of report.failures) console.log('  failure: ' + JSON.stringify(f));

  assert.equal(report.correct + report.foundButWrong + report.programsNotFound, report.n, 'the outcomes do not add up to the task count');
  assert.ok(report.accuracy >= 0.95, 'grid accuracy fell to ' + (report.accuracy * 100).toFixed(2) + '%');
  assert.ok(report.meanSearchSize < 500, 'the mean search size grew to ' + report.meanSearchSize.toFixed(1));

  // The cells and the pure functions must never part company: for every task where the
  // search found a program, the grid the brain emitted is the grid the functions give.
  const byId = new Map(results.map(r => [r.id, r]));
  let checked = 0;
  for (const t of tasks) {
    const r = byId.get(t.id);
    if (!r.found) continue;
    let cur = t.test.input;
    for (const name of r.found) {
      const o = SEARCH_OPS.find(o => o.name === name);
      cur = o ? o.apply(cur) : G.colormap(cur, JSON.parse(name.slice('colormap'.length)));
    }
    assert.ok(G.equal(cur, r.got), 'the cell chain and the pure functions disagreed on ' + t.id);
    checked++;
  }
  assert.ok(checked >= 150, 'only ' + checked + ' programs were cross-checked against the cells');
  console.log('  ' + checked + ' cell chains agreed with the pure primitives');
});

// ---------------------------------------------------------------- the bench
test('bench/tasks.mjs runs every suite and writes a verdict whose totals match the rows', async () => {
  const { run } = await import('../bench/tasks.mjs');
  const v = run({ quiet: true });
  const file = path.join(ROOT, 'bench', 'verdicts', 'tasks.json');
  assert.ok(existsSync(file), 'no verdict was written');
  const j = JSON.parse(readFileSync(file, 'utf8'));
  assert.equal(j.suites.length, SUITES.length);
  assert.equal(j.totals.n, j.suites.reduce((a, s) => a + s.n, 0));
  assert.equal(j.totals.correct, j.suites.reduce((a, s) => a + s.correct, 0));
  assert.equal(j.totals.n, v.totals.n);
  for (const s of SUITES) assert.ok(j.suites.some(x => x.suite === s.name), 'the verdict is missing suite ' + s.name);
  assert.equal(getSuite('algebra').name, 'algebra');
  assert.throws(() => getSuite('nope'), /unknown suite/);
  console.log('bench verdict: ' + j.totals.correct + '/' + j.totals.n + ' = ' + (j.totals.accuracy * 100).toFixed(2) + '% across ' + j.suites.map(s => s.suite + ' ' + s.correct + '/' + s.n).join(', '));
});
