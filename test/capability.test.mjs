// test/capability.test.mjs: the capability layer, graded. Induction has to find the
// programs, memory has to make the second request free of search, the router has to name
// the cells that contributed, and the market policy has to beat or tie a matched control
// on seeds it never saw, with the number printed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as S from '../core/signal.mjs';
import { RNG } from '../core/rng.mjs';
import { Brain } from '../core/brain.mjs';
import {
  TASKS, induceAll, induceFromExamples, enumerateTerms, evalTerm, printTerm, solveLinearExact, solveEquationText,
  algebraBattery, num, list, fromString, toString_, valueToString,
} from '../capability/induce.mjs';
import { SkillRegistry, programToJSON, programFromJSON, addSkillCell } from '../capability/skills.mjs';
import { Solver, classify } from '../capability/router.mjs';
import { runMarket, storePolicy, generateSeries, featureRows, positionsOf, scorePositions, controlScore, blockControlScore, inducePolicy } from '../capability/market.mjs';
import { attachCapability, bootstrap } from '../capability/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

test('induction writes the programs itself: arithmetic maps, list ops, string ops, with search counts and ms', () => {
  const registry = new SkillRegistry({ name: 'test' });
  const r = induceAll({ registry });
  for (const row of r.rows) {
    assert.equal(row.solved, true, row.task + ' was not solved');
    assert.ok(row.program && row.program.length, row.task + ' has no program text');
  }
  assert.equal(r.solved, r.total);
  assert.equal(registry.size, r.total);
  // the families the manual named, each one present and solved
  const families = new Set(r.rows.map(row => row.family));
  for (const f of ['arithmetic', 'list', 'string']) assert.ok(families.has(f), 'family ' + f + ' missing');
  // the programs really are the ones asked for, checked on an input the search never saw
  const byName = Object.fromEntries(registry.list().map(s => [s.name, s]));
  assert.equal(S.ratToString(evalTerm(byName['affine.3x+2'].program, { x: num(1000) })), '3002');
  assert.equal(S.ratToString(evalTerm(byName['affine.5x-7'].program, { x: num(41) })), '198');
  assert.equal(S.ratToString(evalTerm(byName['square'].program, { x: num(-13) })), '169');
  assert.equal(valueToString(evalTerm(byName['list.reverse'].program, { xs: list([8, 6, 7, 5]) })), '[5, 7, 6, 8]');
  assert.equal(S.ratToString(evalTerm(byName['list.sum'].program, { xs: list([10, 20, 30, 41]) })), '101');
  assert.equal(S.ratToString(evalTerm(byName['list.max'].program, { xs: list([4, 99, 7]) })), '99');
  assert.equal(valueToString(evalTerm(byName['list.sort'].program, { xs: list([9, 2, 7, 1]) })), '[1, 2, 7, 9]');
  assert.equal(toString_(evalTerm(byName['string.reverse'].program, { xs: fromString('tesseract') })), 'tcaresset');
  assert.equal(toString_(evalTerm(byName['string.upper'].program, { xs: fromString('dilation') })), 'DILATION');
  assert.equal(toString_(evalTerm(byName['string.shift.one'].program, { xs: fromString('hal') })), 'ibm');
  console.log('induction: solved ' + r.solved + '/' + r.total + ' tasks, ' + r.searched + ' candidate programs searched, ' + r.ms + 'ms total');
  for (const row of r.rows) console.log('  ' + row.task.padEnd(26) + ' ' + String(row.program).padEnd(28) + ' searched=' + String(row.searched).padStart(6) + ' size=' + row.size + ' ' + row.ms + 'ms');
});

test('induction is exact and refuses what it cannot fit', () => {
  // an exact rational answer, never a float
  const r = induceFromExamples([{ in: { x: num(1) }, out: num('0') }, { in: { x: num(3) }, out: num('1') }, { in: { x: num(5) }, out: num('2') }, { in: { x: num(9) }, out: num('4') }]);
  assert.equal(r.solved, true);
  assert.equal(S.ratToString(evalTerm(r.program, { x: num(2) })), '1/2');
  // nothing in the vocabulary reproduces these, and the search says so instead of guessing
  const no = induceFromExamples([{ in: { x: num(1) }, out: num(7) }, { in: { x: num(2) }, out: num(13) }, { in: { x: num(3) }, out: num(5) }, { in: { x: num(4) }, out: num(99) }], { maxSize: 5 });
  assert.equal(no.solved, false);
  assert.equal(no.program, null);
  console.log('exactness: (x-1)/2 recovered as ' + printTerm(r.program) + ', the unfittable table refused after ' + no.searched + ' candidates');
});

test('algebra: linear equations solved exactly with BigInt rationals and verified by substitution', () => {
  const one = solveEquationText('3 * x + 2 = 11', 'x');
  assert.equal(one.value, '3');
  assert.equal(one.verified, true);
  const frac = solveEquationText('(x + 1) / 3 - 2 = x / 7', 'x');
  assert.equal(frac.solved, true);
  assert.equal(frac.left, frac.right, 'substitution must make both sides the same exact rational');
  // the fraction is exact, not a float: 35/4 is the answer and it is spelled as a fraction
  assert.equal(frac.value, '35/4');
  // degenerate cases are named, not guessed at
  assert.equal(solveEquationText('2 * x + 1 = 2 * x + 5', 'x').solved, false);
  assert.equal(solveEquationText('2 * x + 1 = 2 * x + 1', 'x').reason, 'every value of x is a solution');
  assert.equal(solveLinearExact({ op: '=', args: [{ op: '*', args: [{ op: 'var', name: 'x' }, { op: 'var', name: 'x' }] }, { op: 'num', value: S.rat(4n) }] }, 'x').solved, false);
  const battery = algebraBattery(new RNG('algebra:test'), 60);
  assert.equal(battery.solvedOfSolvable, battery.solvable, 'every non-degenerate equation must be solved');
  assert.equal(battery.verified, battery.solved, 'every solution returned must have verified by substitution');
  console.log('algebra: ' + battery.solvedOfSolvable + '/' + battery.solvable + ' solvable equations solved and verified by substitution, ' + battery.degenerate + ' degenerate cases named, example ' + one.text + ' gives x = ' + one.value);
});

test('skills: the second time a task family appears it is answered with no search at all', () => {
  const registry = new SkillRegistry({ name: 'reuse' });
  const solver = new Solver({ registry });
  const examples = [{ in: { x: 0 }, out: 2 }, { in: { x: 1 }, out: 5 }, { in: { x: 2 }, out: 8 }, { in: { x: 5 }, out: 17 }];
  const firstTime = solver.solve({ examples, ask: { x: 10 }, name: 'affine.3x+2' });
  assert.equal(firstTime.answer, '32');
  assert.equal(firstTime.reused, false);
  assert.ok(firstTime.searched > 0, 'the first time must have searched');
  const secondTime = solver.solve({ examples, ask: { x: 1000 } });
  assert.equal(secondTime.answer, '3002');
  assert.equal(secondTime.reused, true);
  assert.equal(secondTime.searched, 0, 'the second time must not search at all');
  assert.equal(secondTime.skill, 'affine.3x+2');
  // a different family still searches, so the reuse is retrieval and not a blanket cache
  const other = solver.solve({ examples: [{ in: { xs: [3, 1, 2] }, out: [1, 2, 3] }, { in: { xs: [5, 4] }, out: [4, 5] }], ask: { xs: [9, 2, 7] }, name: 'list.sort' });
  assert.equal(other.answer, '[2, 7, 9]');
  assert.equal(other.reused, false);
  const rep = registry.report();
  assert.ok(rep.hits >= 1 && rep.searchesAvoided >= 1);
  console.log('skills: first ' + firstTime.searched + ' candidates in ' + firstTime.searchMs + 'ms, second 0 candidates, hit rate ' + rep.hitRate + ' over ' + rep.lookups + ' lookups, ' + rep.searchesAvoided + ' searches avoided, ' + rep.skills + ' skills held');
});

test('skills survive JSON: a stored program round trips and still answers', () => {
  const registry = new SkillRegistry({ name: 'round' });
  induceAll({ registry, tasks: TASKS.slice(0, 6) });
  const back = SkillRegistry.from(JSON.parse(JSON.stringify(registry.toJSON())));
  assert.equal(back.size, registry.size);
  for (const s of registry.list()) {
    const r = back.get(s.name);
    assert.equal(r.text, s.text);
    for (const e of s.examples) assert.equal(valueToString(evalTerm(r.program, e.in)), valueToString(e.out));
  }
  const p = programFromJSON(programToJSON(registry.get('affine.3x+2').program));
  assert.equal(S.ratToString(evalTerm(p, { x: num(7) })), '23');
  console.log('skills: ' + back.size + ' skills round tripped through JSON with every example still reproduced');
});

test('router: classifies, answers and names the cells that contributed', () => {
  const registry = new SkillRegistry({ name: 'route' });
  const solver = new Solver({ registry });
  assert.equal(classify({ text: '2 + 2' }).route, 'arithmetic');
  assert.equal(classify({ eq: 'x + 1 = 2' }).route, 'algebra');
  assert.equal(classify({ terms: [1, 2, 3] }).route, 'sequence');
  assert.equal(classify({ demos: [] }).route, 'grid');
  assert.equal(classify({ features: {} }).route, 'decision');
  assert.equal(classify({ examples: [{ in: { xs: [1] }, out: [1] }] }).route, 'list');

  const arith = solver.solve({ text: '2 + 3 * 4 - 10 / 4' });
  assert.equal(arith.answer, '23/2');
  const algebra = solver.solve({ eq: '5 * x - 3 = 2 * x + 9' });
  assert.equal(algebra.answer, '4');
  assert.equal(algebra.verified, true);
  const seq = solver.solve({ terms: [2, 4, 8, 16, 32] });
  assert.equal(seq.answer, '64');
  const examples = [{ in: { x: 1 }, out: 1 }, { in: { x: 2 }, out: 4 }, { in: { x: 3 }, out: 9 }, { in: { x: 6 }, out: 36 }];
  const induced = solver.solve({ examples, ask: { x: 12 }, name: 'square' });
  assert.equal(induced.answer, '144');

  for (const r of [arith, algebra, seq, induced]) {
    assert.ok(r.trace.length >= 1, 'every answer carries a trace');
    assert.ok(r.trace.some(step => solver.brain.byId.has(step.cell)), 'the trace names at least one real cell of the brain');
    for (const step of r.trace) assert.ok(step.seq >= 0, 'every traced cell has the ledger sequence of its run: ' + step.cell);
  }
  assert.deepEqual(arith.trace.map(s => s.cell), ['router', 'eval']);
  assert.deepEqual(algebra.trace.map(s => s.cell), ['router', 'algebra']);
  assert.deepEqual(seq.trace.map(s => s.cell), ['router', 'fit']);
  assert.ok(induced.trace.map(s => s.cell).includes('skill.square'));
  // the trace walks backwards through the ledger to the external request
  const back = solver.brain.ledger.trace(arith.trace[1].seq, 8);
  assert.ok(back.nodes.length >= 2, 'the trace walked ' + back.nodes.length + ' ledger events');
  console.log('router: ' + JSON.stringify(solver.report().byRoute) + ', traces ' + [arith, algebra, seq, induced].map(r => r.trace.map(s => s.cell).join('>')).join(' | '));
});

test('the front door is a cell: a Brain holding solve and skill answers on its own', () => {
  const brain = new Brain({ name: 'front', ledger: 'runs', pruneEvery: 0, growth: { threshold: Number.MAX_SAFE_INTEGER } });
  const registry = attachCapability(brain);
  induceAll({ registry, tasks: TASKS.slice(0, 3) });
  brain.addCell({ id: 'door', kind: 'solve', region: 'cognitive', circuit: 'front', policy: { period: 'event' } });
  const skill = registry.get('affine.3x+2');
  const cell = addSkillCell(brain, skill);
  brain.inject('door', 'request', { kind: 'event', data: { eq: '4 * x + 4 = 24' } });
  brain.tick(3);
  const answers = brain.takeOutbox().filter(s => s.port === 1);
  assert.ok(answers.length >= 1, 'the solve cell answered by itself');
  assert.equal(answers[answers.length - 1].data.answer, '5');
  assert.equal(answers[answers.length - 1].data.verified, true);
  brain.inject(cell.id, 'request', { kind: 'event', data: { args: { x: 6 } } });
  brain.tick(2);
  const symOut = brain.takeOutbox().filter(s => s.kind === 'sym');
  assert.equal(S.ratToString(S.toRat(symOut[symOut.length - 1].data.value)), '20');
  assert.equal(brain.stats.errors, 0);
  console.log('cells: ' + brain.cells.length + ' cells (' + brain.cells.map(c => c.kind).join(', ') + '), the solve cell answered x = 5 and the skill cell answered 20, brain errors ' + brain.stats.errors);
});

test('market: a policy induced by the same machinery beats or ties a matched control on held-out seeds', () => {
  const result = runMarket({ steps: 600 });
  assert.ok(result.program, 'a policy was induced');
  assert.equal(result.testSeeds.length, 8);
  assert.ok(!result.trainSeeds.some(s => result.testSeeds.includes(s)), 'the held-out seeds are held out');
  assert.ok(result.gap >= 0, 'the policy must beat or tie the control on held-out seeds, gap was ' + result.gap.toFixed(4));
  assert.ok(result.policyReturn > result.holdReturn, 'the policy must beat always long, otherwise it found the drift and not the structure');
  // the control really is matched: same positions, permuted
  const rows = featureRows(generateSeries(result.testSeeds[0], { steps: 600 }));
  const pos = positionsOf(result.program, rows);
  const scored = scorePositions(pos, rows);
  const step = controlScore(pos, rows, { draws: 16, seed: 'assert' });
  const block = blockControlScore(pos, rows, { draws: 16, seed: 'assert' });
  assert.equal(step.draws, 16);
  assert.ok(block.meanTrades > 0);
  assert.ok(Math.abs(scored.ret - result.perSeed[0].policyReturn) < 1e-12, 'the report and a fresh scoring agree');
  const registry = new SkillRegistry({ name: 'market' });
  const stored = storePolicy(registry, result);
  assert.equal(stored.name, 'market.policy');
  const solver = new Solver({ registry });
  const decision = solver.solve({ features: { z: '1.2', m: '0.3', v: '0.6', r: '0.1' } });
  assert.ok(['buy', 'hold', 'sell'].includes(decision.answer));
  assert.ok(decision.trace.some(s => s.cell === 'skill.market.policy'));
  console.log('market: policy ' + result.policy + ' over ' + result.testSeeds.length + ' held-out seeds');
  console.log('  policy return ' + result.policyReturn.toFixed(4) + ', control return ' + result.controlReturn.toFixed(4) + ' (the stricter of step shuffle ' + result.stepShuffleReturn.toFixed(4) + ' and run order ' + result.runOrderReturn.toFixed(4) + '), always long ' + result.holdReturn.toFixed(4));
  console.log('  gap ' + result.gap.toFixed(4) + ', mean gap per seed ' + result.meanGapPerSeed.toFixed(4) + ', paired t ' + result.tStat.toFixed(3) + ', permutation share ' + result.pPermutation.toFixed(4) + ', seeds with a positive gap ' + result.seedsWithPositiveGap + '/' + result.seeds);
  console.log('  ' + result.verdict);
});

test('market placebo: a policy fitted to destroyed tape earns a training return and then fails on held-out seeds', () => {
  // The canary. The features are real, the forward returns are shuffled, so there is
  // nothing to learn. The search still reports a good TRAINING return, which is what a
  // search always does, and the held-out seeds with their matched control are what
  // separate the two arms. If this arm ever came out as good as the real one, the real
  // one would mean nothing.
  const rng = new RNG('placebo');
  const trainRows = [];
  for (const s of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const rows = featureRows(generateSeries(s, { steps: 600 }));
    const shuffled = rng.shuffle(rows.map(r => r.fwd));
    rows.forEach((r, i) => { r.fwd = shuffled[i]; });
    trainRows.push(...rows);
  }
  const placebo = inducePolicy(trainRows, { maxSize: 5 });
  assert.ok(placebo.program, 'the search returns a best policy even on destroyed tape');
  assert.ok(placebo.trainReturn > 0, 'and its training return is positive, which is exactly why a training return proves nothing');
  let policySum = 0, controlSum = 0;
  const gaps = [];
  for (const s of [101, 102, 103, 104, 105, 106, 107, 108]) {
    const rows = featureRows(generateSeries(s, { steps: 600 }));
    const pos = positionsOf(placebo.program, rows);
    const got = scorePositions(pos, rows).ret;
    const ctrl = Math.max(controlScore(pos, rows, { draws: 64, seed: 'pc:' + s }).mean, blockControlScore(pos, rows, { draws: 64, seed: 'pb:' + s }).mean);
    policySum += got; controlSum += ctrl; gaps.push(got - ctrl);
  }
  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const sd = Math.sqrt(gaps.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (gaps.length - 1));
  const t = sd > 0 ? mean / (sd / Math.sqrt(gaps.length)) : 0;
  const real = runMarket({ steps: 600, draws: 32 });
  assert.ok(real.gap > policySum - controlSum, 'the real arm must be further from its control than the placebo arm is from its own');
  console.log('placebo arm: train return ' + placebo.trainReturn.toFixed(4) + ' (policy ' + placebo.text + '), held-out policy ' + policySum.toFixed(4) + ' against control ' + controlSum.toFixed(4) + ', gap ' + (policySum - controlSum).toFixed(4) + ', paired t ' + t.toFixed(3));
  console.log('  the real arm on the same held-out seeds: gap ' + real.gap.toFixed(4) + ', paired t ' + real.tStat.toFixed(3) + '. Two arms, one ruler.');
});

test('bootstrap: one call and the brain already knows the catalogue and a decision policy', () => {
  const registry = new SkillRegistry({ name: 'boot' });
  const boot = bootstrap({ registry, marketOpts: { steps: 400, testSeeds: [101, 102, 103, 104] } });
  assert.equal(boot.induction.solved, boot.induction.total);
  assert.equal(boot.policy, 'market.policy');
  assert.equal(registry.size, boot.induction.total + 1);
  const solver = boot.solver();
  const answered = ['2 ^ 10', '1 / 3 + 1 / 6'].map(t => solver.solve({ text: t }).answer);
  assert.deepEqual(answered, ['1024', '1/2']);
  console.log('bootstrap: ' + registry.size + ' skills held after one call (' + boot.induction.total + ' induced tasks plus the decision policy), ' + boot.induction.searched + ' candidates searched in ' + boot.induction.ms + 'ms');
});

// ---------------------------------------------------------------- the guards, the controls and the bars
// Every test in this section was written to kill a mutant that survived bench/mutants.mjs.
// The mutant it kills is named, because a test whose reason nobody wrote down is a test
// nobody can delete safely either.

test('induction: the runaway guard binds, and it watches the denominator as well as the numerator', () => {
  // kills cp01 (the denominator bound removed) and cp04 (the sanity filter removed).
  // x = 1e20 is chosen so that x * x is EXACTLY the limit: the guard has to decide, and
  // 1 / (x * x) puts the same pressure on the denominator.
  const LIMIT = 10n ** 40n, NEAR = LIMIT / 100n;
  let kept = 0, maxN = 0n, maxD = 0n, nearN = 0, nearD = 0;
  enumerateTerms({
    rows: [{ x: num('100000000000000000000') }, { x: num('7') }], varTypes: { x: 'num' },
    maxSize: 7, maxTerms: 30000, wantTypes: ['num'], accept: () => false,
    onNew: (e) => {
      kept++;
      for (const v of e.outs) {
        if (Array.isArray(v)) continue;
        const n = v.n < 0n ? -v.n : v.n;
        if (n > maxN) maxN = n;
        if (v.d > maxD) maxD = v.d;
        if (n >= NEAR) nearN++;
        if (v.d >= NEAR) nearD++;
      }
    },
  });
  assert.ok(kept > 1000, 'the enumeration kept only ' + kept + ' terms, too few to have tested the guard');
  assert.ok(maxN < LIMIT, 'a kept numerator of ' + String(maxN).length + ' digits is past the limit of 41');
  assert.ok(maxD < LIMIT, 'a kept denominator of ' + String(maxD).length + ' digits is past the limit of 41');
  // and the guard is not true of nothing: terms really do come up to the bar on both sides
  assert.ok(nearN > 0, 'no numerator came within a hundredth of the limit, so the bar was never tested');
  assert.ok(nearD > 0, 'no denominator came within a hundredth of the limit, so the denominator half of the bar was never tested');
  console.log('runaway guard: ' + kept + ' terms kept, largest numerator ' + String(maxN).length + ' digits, largest denominator ' + String(maxD).length + ' digits, ' + nearN + ' numerators and ' + nearD + ' denominators within a hundredth of the limit, none over it');
});

test('induction: a map or filter program is reported at the size it really costs', () => {
  // kills cp07 (map and filter children sized one too large, which reports every such
  // program one size cheaper than it is and lets it through a budget that should refuse it).
  const doubled = induceFromExamples([
    { in: { xs: list([1, 2, 3]) }, out: list([2, 4, 6]) },
    { in: { xs: list([5, 0]) }, out: list([10, 0]) },
    { in: { xs: list([-2, 7, 4]) }, out: list([-4, 14, 8]) },
  ], { maxSize: 7 });
  assert.equal(doubled.solved, true);
  assert.equal(doubled.text, 'map(e -> (e * 2), xs)');
  assert.equal(doubled.size, 5, 'a map of a size 3 body over a size 1 list is size 5');
  const big = induceFromExamples([
    { in: { xs: list([1, 9, 3, 7]) }, out: list([9, 7]) },
    { in: { xs: list([6, 2, 8]) }, out: list([6, 8]) },
    { in: { xs: list([4, 5, 11]) }, out: list([11]) },
  ], { maxSize: 7 });
  assert.equal(big.solved, true);
  assert.equal(big.text, 'filter(e -> (e > 5), xs)');
  assert.equal(big.size, 5);
  // the size IS the budget: a search that may not spend 5 does not find a program of 5
  const tight = induceFromExamples([
    { in: { xs: list([1, 2, 3]) }, out: list([2, 4, 6]) },
    { in: { xs: list([5, 0]) }, out: list([10, 0]) },
    { in: { xs: list([-2, 7, 4]) }, out: list([-4, 14, 8]) },
  ], { maxSize: 4 });
  assert.equal(tight.solved, false, 'a budget of 4 found a program of 5: the sizes are being counted wrong');
  console.log('program sizes: ' + doubled.text + ' costs ' + doubled.size + ', ' + big.text + ' costs ' + big.size + ', and neither is reachable inside a budget of 4');
});

test('induction: a library operator whose fast evaluator lies is caught by the re-check', () => {
  // kills cp08 (the re-check through evalTerm removed). The enumeration evaluates a term
  // through the operator's own ev(); what is STORED has to reproduce the examples through
  // evalTerm, the one evaluator. This operator claims x + 1 and builds x + 0, which is the
  // only way the two can ever disagree, and it is exactly what the re-check exists to catch.
  const liar = {
    name: 'lie', in: ['num'], out: 'num',
    make: (a) => ({ op: '+', args: [a, { op: 'num', value: S.rat(0n, 1n) }] }),
    ev: (a) => S.ratAdd(a, S.rat(1n, 1n)),
  };
  const r = induceFromExamples([
    { in: { x: num(1) }, out: num(2) }, { in: { x: num(2) }, out: num(3) },
    { in: { x: num(5) }, out: num(6) }, { in: { x: num(9) }, out: num(10) },
  ], { maxSize: 2, library: [liar] });
  assert.equal(r.solved, false, 'a program the one evaluator does not reproduce was stored anyway');
  assert.equal(r.program, null);
  assert.equal(r.disagreed, 0, 'the row the two evaluators disagreed on must be named');
  console.log('re-check: a library operator that claims x + 1 and builds x + 0 is refused at row ' + r.disagreed + ' after ' + r.searched + ' candidates, not stored');
});

test('algebra: three points are not a proof of linearity, the substitution is', () => {
  // kills cp13 (verification by substitution approves everything). x(x-1)(x-2) + 2x is
  // EXACTLY -5, -3, -1 at x = 0, 1, 2, so the three point check reads it as the line
  // 2x - 5 and hands back 5/2. Only putting 5/2 back into the original tree catches it.
  const r = solveEquationText('x * (x - 1) * (x - 2) + 2 * x = 5', 'x');
  assert.equal(r.solved, false, 'a root that does not satisfy the equation was returned as solved');
  assert.equal(r.verified, false);
  assert.equal(r.value, '5/2', 'the linear reading of the three points is 5/2, and that is what must fail to verify');
  assert.equal(r.left, '55/8');
  assert.equal(r.right, '5');
  assert.equal(r.reason, 'substitution did not verify');
  // the same machinery still solves the thing that IS linear
  assert.equal(solveEquationText('2 * x - 5 = 0', 'x').value, '5/2');
  console.log('linearity: a cubic that passes through the same three points as 2x - 5 is read as 5/2 and then REFUSED, left ' + r.left + ' against right ' + r.right);
});

test('skills: memory answers for the family it stored and refuses every other', () => {
  // kills cp15 (memory returns a stored skill without checking the examples at all).
  const registry = new SkillRegistry({ name: 'refuse' });
  const solver = new Solver({ registry });
  const affine = [{ in: { x: 0 }, out: 2 }, { in: { x: 1 }, out: 5 }, { in: { x: 2 }, out: 8 }, { in: { x: 5 }, out: 17 }];
  solver.solve({ examples: affine, ask: { x: 10 }, name: 'affine.3x+2' });
  // a second family of the SAME type: the type guard cannot save this one, only the
  // example check can
  const square = [{ in: { x: num(1) }, out: num(1) }, { in: { x: num(2) }, out: num(4) }, { in: { x: num(3) }, out: num(9) }, { in: { x: num(6) }, out: num(36) }];
  assert.equal(registry.match(square), null, 'a stored affine skill was offered as a match for a square');
  const second = solver.solve({ examples: square, ask: { x: 12 }, name: 'square' });
  assert.equal(second.answer, '144');
  assert.equal(second.reused, false, 'the square was answered out of memory that never held a square');
  assert.ok(second.searched > 0, 'a family that was never stored must be searched for');
  // and the one that WAS stored is still free
  const again = solver.solve({ examples: affine, ask: { x: 100 } });
  assert.equal(again.answer, '302');
  assert.equal(again.reused, true);
  console.log('memory: a square against a stored affine matched nothing and cost ' + second.searched + ' candidates, the affine came back for 0');
});

test('skills: rows that disagree on their arity match nothing', () => {
  // kills cp17 (the arity check inside renameEnv removed). match() checks the arity of the
  // FIRST row before the loop; renameEnv is what checks every other row, and a table whose
  // rows disagree is exactly the input that tells the two apart.
  const registry = new SkillRegistry({ name: 'arity' });
  const solver = new Solver({ registry });
  solver.solve({ examples: [{ in: { x: 0 }, out: 2 }, { in: { x: 1 }, out: 5 }, { in: { x: 2 }, out: 8 }, { in: { x: 5 }, out: 17 }], ask: { x: 10 }, name: 'affine.3x+2' });
  const oneVar = [{ in: { x: num(1) }, out: num(5) }, { in: { x: num(2) }, out: num(8) }];
  assert.equal(registry.match(oneVar).name, 'affine.3x+2', 'the stored skill must still match a table it does reproduce');
  const mixed = [{ in: { x: num(1) }, out: num(5) }, { in: { x: num(2), y: num(99) }, out: num(8) }];
  assert.equal(registry.match(mixed), null, 'a row carrying a second variable was silently dropped and matched anyway');
  console.log('arity: a table whose second row carries an extra variable matches nothing, the same table without it matches affine.3x+2');
});

test('router: one request runs every cell it names exactly once, so the traced seq is that run', () => {
  // The trace reports the LAST ledger sequence of the cell inside the request window.
  // cp21 replaces it with the FIRST and survives, because every cell in the solver brain
  // fires on an event and a request delivers exactly one. This test measures that, so the
  // day a cell starts running twice per request the equivalence is re-opened here.
  const solver = new Solver({ registry: new SkillRegistry({ name: 'once' }) });
  const requests = [{ text: '2 + 3 * 4' }, { eq: '5 * x - 3 = 2 * x + 9' }, { terms: [2, 4, 8, 16] },
    { examples: [{ in: { x: 1 }, out: 1 }, { in: { x: 2 }, out: 4 }, { in: { x: 3 }, out: 9 }, { in: { x: 6 }, out: 36 }], ask: { x: 12 }, name: 'square' }];
  const seen = [];
  for (const req of requests) {
    const mark = solver.brain.ledger.seq;
    const out = solver.solve(req);
    const runs = solver.brain.ledger.recent(2000, 'cell.run').filter(e => e.seq >= mark);
    const per = new Map();
    for (const e of runs) per.set(e.cell, (per.get(e.cell) || 0) + 1);
    for (const step of out.trace) {
      const mine = runs.filter(e => e.cell === step.cell);
      assert.ok(mine.length <= 1, step.cell + ' ran ' + mine.length + ' times in one request: first and last are no longer the same run');
      if (mine.length === 1) assert.equal(step.seq, mine[mine.length - 1].seq, 'the traced seq is not the run of ' + step.cell);
    }
    seen.push(out.trace.map(s => s.cell + 'x' + (per.get(s.cell) || 0)).join(','));
  }
  console.log('one run per request: ' + seen.join(' | '));
});

test('market: the fee is charged on every change of position, never credited', () => {
  // kills cp23 (the fee added instead of subtracted). On a flat tape the fee is the only
  // thing that can move the return, so its sign has nowhere to hide.
  const rows = Array.from({ length: 8 }, () => ({ fwd: 0 }));
  const flat = scorePositions(Int8Array.from([1, -1, 1, -1, 1, -1, 1, -1]), rows);
  assert.equal(flat.trades, 8);
  assert.ok(flat.ret < 0, 'eight round trips on a flat tape returned ' + flat.ret + ', which means the fee was paid TO the policy');
  assert.ok(Math.abs(flat.ret + 0.0075) < 1e-12, 'the fee on 15 units of position change is 0.0075, the run says ' + flat.ret);
  // holding costs one entry and nothing else
  const held = scorePositions(Int8Array.from([1, 1, 1, 1, 1, 1, 1, 1]), rows);
  assert.equal(held.trades, 1);
  assert.ok(held.ret < 0 && held.ret > flat.ret, 'holding must cost less than trading: ' + held.ret + ' against ' + flat.ret);
  console.log('fees: 8 alternating positions on a flat tape cost ' + flat.ret.toFixed(6) + ' over ' + flat.trades + ' trades, holding costs ' + held.ret.toFixed(6));
});

test('market: the verdict is taken against the STRICTER control, and the share counts the observed case', () => {
  // kills cp25 (the weaker of the two controls chosen) and cp26 (the +1 dropped from the
  // permutation share). Both are ways of flattering the policy with arithmetic.
  const r = runMarket({ steps: 400, draws: 8, testSeeds: [101, 102, 103, 104] });
  for (const s of r.perSeed) {
    const stricter = Math.max(s.controlMean, s.blockControlMean);
    assert.equal(s.strictControlMean, stricter, 'seed ' + s.seed + ' was graded against ' + s.strictControlMean + ' when the stricter control scored ' + stricter);
    assert.equal(s.strictControl, s.blockControlMean >= s.controlMean ? 'run-order' : 'step-shuffle', 'the named control is not the one the number came from');
    assert.equal(s.gap, s.policyReturn - stricter);
  }
  const share = (r.controlsAtLeastAsGood + 1) / (r.controlDraws + 1);
  assert.ok(Math.abs(r.pPermutation - share) < 1e-12, 'the published share ' + r.pPermutation + ' is not the one its own counts imply, ' + share);
  assert.ok(r.pPermutation > 0, 'a permutation share of exactly zero is not a measurement, it is a count that forgot the case it observed');
  assert.ok(r.pPermutation >= 1 / (r.controlDraws + 1));
  console.log('controls: ' + r.perSeed.length + ' seeds each graded against the stricter of two controls, share ' + r.pPermutation.toFixed(6) + ' from ' + r.controlsAtLeastAsGood + ' of ' + r.controlDraws + ' draws');
});

test('market: the significance bar is a conjunction, so a large t alone does not carry it', () => {
  // kills cp27 (the bar turned into an OR). With two draws a seed the permutation share
  // cannot go below 1/17, whatever the t statistic does, and the run must say so.
  const r = runMarket({ steps: 600, draws: 2 });
  assert.ok(Math.abs(r.tStat) >= 2, 'the t half of the bar has to PASS for this test to be about the other half, t was ' + r.tStat);
  assert.ok(r.pPermutation >= 0.05, 'with ' + r.controlDraws + ' draws the share cannot reach 0.05, it was ' + r.pPermutation);
  assert.equal(r.significant, false, 'a t of ' + r.tStat.toFixed(3) + ' carried a share of ' + r.pPermutation.toFixed(4) + ' over the bar on its own');
  assert.ok(r.verdict.includes('NOT significant'));
  console.log('the bar: t ' + r.tStat.toFixed(3) + ' with share ' + r.pPermutation.toFixed(4) + ' over ' + r.controlDraws + ' draws is reported NOT significant, both halves are required');
});

test('no em-dashes anywhere in the capability layer', () => {
  const dash = String.fromCharCode(0x2014);
  const files = readdirSync(path.join(ROOT, 'capability')).map(f => path.join(ROOT, 'capability', f))
    .concat([path.join(ROOT, 'test', 'capability.test.mjs'), path.join(ROOT, 'bench', 'capability.mjs'), path.join(ROOT, 'notes', 'capability.md')]);
  const bad = files.filter(f => { try { return readFileSync(f, 'utf8').includes(dash); } catch { return false; } });
  assert.deepEqual(bad, []);
  console.log('prose: ' + files.length + ' capability files scanned, 0 em-dashes');
});
