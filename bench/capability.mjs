// bench/capability.mjs: the capability layer with every number printed by this command.
// Induction (search counts and ms per task), skills (hit rate, searches avoided), the
// router (one request per route, with the cells that contributed), and the market
// (policy return, control return, gap, and whether the gap is significant).
//
// It is both a script and a module. As a script it runs exactly as it always did and writes
// bench/verdicts/capability.json. As a module, run({ seed, write }) returns every number it
// printed and writes that file ONLY when write is true, so the daily ladder can take this
// column without touching the file this bench owns.
//
//   node bench/capability.mjs [--seed bench]
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RNG } from '../core/rng.mjs';
import { induceAll, algebraBattery, TASKS, evalTerm, valueToString } from '../capability/induce.mjs';
import { SkillRegistry } from '../capability/skills.mjs';
import { Solver } from '../capability/router.mjs';
import { runMarket, storePolicy } from '../capability/market.mjs';
import { generateGrids } from '../tasks/grid.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const pad = (s, n) => String(s).padEnd(n);
const rpad = (s, n) => String(s).padStart(n);

/** The seed the script has always used. A caller that passes nothing gets the same numbers. */
export const DEFAULT_SEED = 'bench';

/**
 * One run of the whole capability bench.
 * @param {object} [opts]
 * @param {string} [opts.seed] shifts the algebra battery and the router's grid, not the market
 * @param {boolean} [opts.write] write bench/verdicts/capability.json (the script passes true)
 * @param {boolean} [opts.quiet] collect the lines instead of printing them
 * @returns {object} the verdict, plus lines: every line this run produced
 */
export function run({ seed = DEFAULT_SEED, write = false, quiet = false } = {}) {
  const t0 = Date.now();
  const lines = [];
  const say = (line = '') => { lines.push(line); if (!quiet) console.log(line); };

  say('CAPABILITY BENCH: nothing below was asked to be built. Every row is a request the brain answered by itself.\n');

  // -------------------------------------------------------------- 1. induction
  const registry = new SkillRegistry({ name: 'bench' });
  const induction = induceAll({ registry });
  say('1. INDUCTION over the sym language: typed bottom-up search, pruned by observational equivalence');
  say('   ' + pad('task', 26) + pad('family', 12) + pad('program', 30) + rpad('size', 5) + rpad('searched', 10) + rpad('kept', 8) + rpad('ms', 9));
  for (const row of induction.rows) {
    say('   ' + pad(row.task, 26) + pad(row.family, 12) + pad(row.program, 30) + rpad(row.size, 5) + rpad(row.searched, 10) + rpad(row.kept, 8) + rpad(row.ms, 9));
  }
  say('   solved ' + induction.solved + '/' + induction.total + ', ' + induction.searched + ' candidate programs evaluated, ' + induction.ms + 'ms total\n');

  // -------------------------------------------------------------- 2. algebra
  const battery = algebraBattery(new RNG(seed + ':algebra'), 200);
  say('2. ALGEBRA, exact: two probes, a linearity check at a third point, and substitution back into the equation');
  say('   equations ' + battery.n + ', solvable ' + battery.solvable + ', solved ' + battery.solvedOfSolvable + '/' + battery.solvable + ', every solution verified by substitution ' + battery.verified + '/' + battery.solved + ', degenerate cases named ' + battery.degenerate);
  for (const row of battery.rows.slice(0, 3)) say('   ' + pad(row.text, 34) + ' x = ' + pad(row.value, 12) + ' verified ' + row.verified);
  say('');

  // -------------------------------------------------------------- 3. skills
  const solver = new Solver({ registry });
  // A family the catalogue does not contain, so the first request really does search. Asking
  // for one the catalogue already holds would be a memory hit on the first try, which would
  // prove the point by begging the question.
  const reuseExamples = [{ in: { x: 0 }, out: 1 }, { in: { x: 1 }, out: 8 }, { in: { x: 2 }, out: 15 }, { in: { x: 5 }, out: 36 }];
  const firstAsk = solver.solve({ examples: reuseExamples, ask: { x: 10 }, name: 'bench.affine.7x+1' });
  const secondAsk = solver.solve({ examples: reuseExamples, ask: { x: 1000 } });
  say('3. SKILLS, memory before search (a family the catalogue does not hold, so the first request has to search)');
  say('   first request : answer ' + firstAsk.answer + ', searched ' + firstAsk.searched + ' candidates in ' + firstAsk.searchMs + 'ms, program ' + firstAsk.program);
  say('   same family   : answer ' + secondAsk.answer + ', searched ' + secondAsk.searched + ' candidates, reused ' + secondAsk.reused + ' (' + secondAsk.skill + ')');
  const skillReport = registry.report();
  say('   registry: ' + skillReport.skills + ' skills, ' + skillReport.lookups + ' lookups, ' + skillReport.hits + ' hits, hit rate ' + skillReport.hitRate + ', searches avoided ' + skillReport.searchesAvoided + ', applications ' + skillReport.applications + '\n');

  // -------------------------------------------------------------- 4. the router
  const grids = generateGrids({ seed, counts: {} });
  const gridProblem = grids[0];
  const requests = [
    { label: 'arithmetic', request: { text: '2 ^ 20 + 1 / 3' } },
    { label: 'algebra', request: { eq: '7 * x - 5 = 2 * x + 30' } },
    { label: 'sequence', request: { terms: [3, 6, 12, 24, 48] } },
    { label: 'list', request: { examples: [{ in: { xs: [3, 1, 2] }, out: [1, 2, 3] }, { in: { xs: [9, 4] }, out: [4, 9] }], ask: { xs: [8, 2, 5] }, name: 'bench.sort' } },
    { label: 'grid', request: { demos: gridProblem.demos.slice(0, 2), ask: gridProblem.demos[2] ? gridProblem.demos[2].input : gridProblem.demos[0].input } },
  ];
  say('4. ROUTER: one request per route, with the cells that contributed (trace-back is a manual requirement)');
  const routed = [];
  for (const { label, request } of requests) {
    const r = solver.solve(request);
    const answer = typeof r.answer === 'object' && r.answer ? ('grid ' + r.answer.w + 'x' + r.answer.h) : String(r.answer);
    say('   ' + pad(label, 12) + pad('route=' + r.route, 20) + pad('answer=' + answer, 30) + 'cells=' + r.trace.map(s => s.cell + '(' + s.kind + ')').join(' > '));
    routed.push({ label, route: r.route, answer, cells: r.trace.map(s => s.cell), seqs: r.trace.map(s => s.seq), ms: r.ms });
  }
  say('');

  // -------------------------------------------------------------- 5. the market
  say('5. MARKET: a decision policy induced by the same machinery, on a synthetic world with planted structure.');
  say('   No venue, no money, no data from any other project. The claim is the gap against a matched control, nothing more.');
  const market = runMarket({});
  storePolicy(registry, market);
  say('   policy            ' + market.policy + '  (size ' + market.size + ', found after ' + market.searched + ' candidates, ' + market.distinctPolicies + ' distinct decision vectors, ' + market.inductionMs + 'ms)');
  say('   training seeds    ' + market.trainSeeds.join(', ') + '   held-out seeds ' + market.testSeeds.join(', ') + '   steps ' + market.steps + '   fee ' + market.fee + ' per unit of position change');
  say('   train return      ' + market.trainReturn.toFixed(4) + ' over the training seeds (an objective a search can game, which is why it decides nothing)');
  say('   policy return     ' + market.policyReturn.toFixed(4) + ' over ' + market.seeds + ' held-out seeds');
  say('   control return    ' + market.controlReturn.toFixed(4) + ' (the stricter control: step shuffle ' + market.stepShuffleReturn.toFixed(4) + ', run order ' + market.runOrderReturn.toFixed(4) + ')');
  say('   always long       ' + market.holdReturn.toFixed(4) + ', beaten on ' + market.seedsBeatingHold + '/' + market.seeds + ' seeds');
  say('   GAP               ' + market.gap.toFixed(4) + ' (mean per seed ' + market.meanGapPerSeed.toFixed(4) + ', sd ' + market.sdGap.toFixed(4) + ', paired t ' + market.tStat.toFixed(3) + ')');
  say('   permutation       ' + market.controlsAtLeastAsGood + ' of ' + market.controlDraws + ' control draws did at least as well, share ' + market.pPermutation.toFixed(4));
  say('   positive gap on   ' + market.seedsWithPositiveGap + '/' + market.seeds + ' held-out seeds');
  say('   VERDICT           ' + market.verdict);
  say('   tape             ' + JSON.stringify(market.regimeShare));
  say('   per seed:');
  for (const r of market.perSeed) {
    say('     seed ' + rpad(r.seed, 4) + '  policy ' + rpad(r.policyReturn.toFixed(4), 9) + '  control ' + rpad(r.strictControlMean.toFixed(4), 9) + ' (' + pad(r.strictControl, 13) + ') gap ' + rpad(r.gap.toFixed(4), 9) + '  trades ' + rpad(r.trades, 4) + '  win rate ' + r.winRate.toFixed(3));
  }
  say('');

  // -------------------------------------------------------------- verdict
  const verdict = {
    at: new Date().toISOString(), node: process.version, ms: Date.now() - t0,
    command: 'node bench/capability.mjs' + (seed === DEFAULT_SEED ? '' : ' --seed ' + seed),
    seed,
    induction: { solved: induction.solved, total: induction.total, searched: induction.searched, ms: induction.ms, rows: induction.rows },
    algebra: { n: battery.n, solvable: battery.solvable, solved: battery.solvedOfSolvable, verified: battery.verified, degenerate: battery.degenerate },
    skills: { ...skillReport, firstSearched: firstAsk.searched, secondSearched: secondAsk.searched, reusedOnSecond: secondAsk.reused },
    router: routed,
    market: {
      policy: market.policy, size: market.size, searched: market.searched, distinctPolicies: market.distinctPolicies,
      trainSeeds: market.trainSeeds, testSeeds: market.testSeeds, steps: market.steps, fee: market.fee,
      trainReturn: market.trainReturn, policyReturn: market.policyReturn, controlReturn: market.controlReturn,
      stepShuffleReturn: market.stepShuffleReturn, runOrderReturn: market.runOrderReturn, holdReturn: market.holdReturn,
      gap: market.gap, meanGapPerSeed: market.meanGapPerSeed, sdGap: market.sdGap, tStat: market.tStat,
      pPermutation: market.pPermutation, significant: market.significant, verdict: market.verdict,
      seedsWithPositiveGap: market.seedsWithPositiveGap, seeds: market.seeds, seedsBeatingHold: market.seedsBeatingHold,
      regimeShare: market.regimeShare, perSeed: market.perSeed,
    },
    registrySize: registry.size,
  };
  verdict.verdict = induction.solved === induction.total && battery.solvedOfSolvable === battery.solvable && market.gap >= 0 ? 'GREEN' : 'RED';
  // The one accuracy this bench can hand a ruler that needs a rate: the graded items it
  // pooled, induction tasks plus solvable equations, over how many there were. The market
  // gap is a return and is deliberately not folded in, because it is not in [0, 1].
  verdict.graded = {
    correct: induction.solved + battery.solvedOfSolvable,
    n: induction.total + battery.solvable,
    accuracy: (induction.total + battery.solvable) > 0
      ? Math.round(((induction.solved + battery.solvedOfSolvable) / (induction.total + battery.solvable)) * 1e6) / 1e6
      : null,
    how: 'induction tasks solved plus algebra equations solved and verified, over induction tasks plus solvable equations',
  };
  const tail = 'CAPABILITY ' + verdict.verdict
    + ': induced ' + induction.solved + '/' + induction.total + ' tasks in ' + induction.searched + ' candidates, algebra '
    + battery.solvedOfSolvable + '/' + battery.solvable + ' solved and verified, skill hit rate ' + skillReport.hitRate
    + ', market gap ' + market.gap.toFixed(4) + ' (t ' + market.tStat.toFixed(3) + ', ' + (market.significant ? 'significant' : 'not significant') + '), ' + verdict.ms + 'ms';
  // The file is written after the measurement and only when the caller owns it: the ladder
  // reads this column and must not overwrite the bench's own verdict with its narrower seed.
  if (write) {
    mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
    writeFileSync(path.join(HERE, 'verdicts', 'capability.json'), JSON.stringify(verdict, null, 2));
  }
  say(tail);
  return { ...verdict, lines, statement: tail };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const i = process.argv.indexOf('--seed');
  const seed = i > 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : DEFAULT_SEED;
  // No exit code is set: this script has always finished 0 and printed its verdict word, and
  // a gate that reads the word would be broken by a status this file never used to return.
  run({ seed, write: true });
}
