// bench/velocity.mjs: ITERATION VELOCITY, MEASURED.
//
// generations/velocity.mjs says what the evaluation matrix, the plateau ruler and infinite mode
// ARE. This runs all three on the grid suite and prints what they cost and what they found:
//
//   [matrix]    the suite, the components, the precompute, the union bound of the suite
//   [audit]     EVERY cell of both planes recomputed by real grid cells in real Brains, in
//               worker threads, against the matrix (0 mismatches is the claim)
//   [sample]    one matrix plane run to its plateau, whose elites join the exactness set
//   [exact]     N genomes scored by the matrix and by the tick path, task by task
//   [rate]      evaluations per second of both paths on the SAME suite and the SAME genomes,
//               the ratio against the aim of 100x, and when the precompute pays for itself
//   [synthetic] a landscape whose optimum is known by construction, a patience sweep for the
//               directed engine and for the undirected one on the same fresh seeds, and the
//               bar patience: the generation the ruler reports against the generation the
//               optimum was first held
//   [infinite]  a finite list of planes run until the ruler fired on every one, then an
//               unbounded list run until the wall budget ended, the best carried plane to plane
//   [heldout]   the best library on a fresh draw of the same task families
//   [organism]  the same ruler on a real organism plane of generations/planes.mjs
//
//   node bench/velocity.mjs [--seed grid/velocity] [--depth 3] [--tick-genomes 1000]
//                           [--random-genomes 300] [--infinite-ms 20000] [--finite-planes 8]
//                           [--synthetic-seeds 16] [--organism-ms 40000] [--no-audit]
//                           [--no-organism] [--workers N]
//
// With no flags (or only --workers, which changes the wall time and nothing else) this is the
// bar and writes bench/verdicts/velocity.json with isTheBar true. Any other flag makes a narrower
// or different run, which writes bench/verdicts/velocity-partial.json with isTheBar false.
//
// The timings are wall clock on a shared machine: other processes were running beside this one
// when the verdict was written, so every rate is a contended rate. The RATIO is taken on the
// same genomes in the same process seconds apart, which is the fairest comparison available.
//
// THE MULTI-DRAW OBJECTIVE (Board 10). With --draws K this runs ONLY the comparison at the end of
// this file, and the Board 8 bar above does not run:
//
//   node bench/velocity.mjs --draws 4 [--draw-planes 32] [--fresh 4] [--draw-exact 40]
//
//   [draws]    the K draws (seeds derived from the run seed, draw 0 IS the run seed), the fresh
//              draws, and how many fresh tasks also appear verbatim in a searched draw
//   [draws K=k] for k = 1 and k = K: the same finite list of planes under the same plateau rule,
//              searched on the first k draws; the searched-suite score, the fresh-draw score
//              (seed <run seed>:heldout), generations to plateau, and the matrix path's evals/s
//   [control]  k = 1 on each other draw alone: how far a single draw's fresh score moves by draw
//   [exact]    the K stack against real grid cells, and the stack against its K draws
//   [bar]      the fresh-draw score at K against the one at 1
//
// --draws 4 and nothing else (--workers is accepted and changes nothing here) is the bar and writes
// bench/verdicts/velocity-heldout.json with isTheBar true; any other K or flag writes
// bench/verdicts/velocity-heldout-partial.json with isTheBar false.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { RNG } from '../core/rng.mjs';
import {
  buildGridMatrix, auditGridMatrixParallel, defaultAuditWorkers, exactnessCheck, matrixRate, tickScoreGrid,
  MatrixElites, runToPlateau, syntheticMatrix, infinite, plateauOrganismPlane,
  LEN_CAP, OPS, SECONDS_PER_YEAR, DEFAULT_SECONDS_PER_TICK,
  buildGridDraws, stackDraws, fitnessOf,
} from '../generations/velocity.mjs';
import { planeCoordinate } from '../generations/planes.mjs';
import { G } from '../cells/grid.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);

const DEFAULTS = Object.freeze({
  seed: 'grid/velocity', depth: 3, tickGenomes: 1000, randomGenomes: 300,
  infiniteMs: 20_000, finitePlanes: 8, syntheticSeeds: 16, organismMs: 40_000,
  barPatience: 200, sweep: [20, 50, 100, 200], aim: 100,
  // The engine's directed rate was chosen in a probe on synthetic seeds 0..15; the bar is graded
  // on seeds from here on, which that probe never saw.
  syntheticBase: 100,
});
const cfg = {
  seed: String(opt('seed', DEFAULTS.seed)),
  depth: Number(opt('depth', DEFAULTS.depth)),
  tickGenomes: Number(opt('tick-genomes', DEFAULTS.tickGenomes)),
  randomGenomes: Number(opt('random-genomes', DEFAULTS.randomGenomes)),
  infiniteMs: Number(opt('infinite-ms', DEFAULTS.infiniteMs)),
  finitePlanes: Number(opt('finite-planes', DEFAULTS.finitePlanes)),
  syntheticSeeds: Number(opt('synthetic-seeds', DEFAULTS.syntheticSeeds)),
  organismMs: Number(opt('organism-ms', DEFAULTS.organismMs)),
  workers: Number(opt('workers', defaultAuditWorkers())),
  audit: !has('no-audit'),
  organism: !has('no-organism'),
  draws: has('draws') ? Number(opt('draws', NaN)) : 0,
  barPatience: DEFAULTS.barPatience, sweep: DEFAULTS.sweep, aim: DEFAULTS.aim, syntheticBase: DEFAULTS.syntheticBase,
};
// --workers only changes how many threads share the audit; every other flag narrows or changes it.
const flags = argv.filter((a) => a.startsWith('--')).map((a) => a.slice(2));
const isTheBar = flags.every((f) => f === 'workers');
const OUT = path.join(ROOT, 'bench', 'verdicts', isTheBar ? 'velocity.json' : 'velocity-partial.json');

const T0 = process.hrtime.bigint();
const since = () => Number(process.hrtime.bigint() - T0) / 1e6;
const f1 = (x) => (x === null || x === undefined ? 'null' : Number(x).toFixed(1));
const f3 = (x) => (x === null || x === undefined ? 'null' : Number(x).toFixed(3));
const big = (x) => Math.round(x).toLocaleString('en-US');
const say = (s) => console.log(s);
const sum = (a) => a.reduce((x, y) => x + y, 0);

// --draws K runs heldoutDraws() (the end of this file) instead of the Board 8 bar. The bar's body
// below is left at its Board 8 indentation so its lines are the lines that bar was measured with.
if (cfg.draws) await heldoutDraws();
else {

// ---------------------------------------------------------------- [matrix]
const built = buildGridMatrix({ seed: cfg.seed, maxDepth: cfg.depth });
const M = built.matrix;
const union = M.unionBound();
say(`[matrix] tasks/grid.mjs seed ${cfg.seed}: ${M.T} tasks x ${M.C} components (identity + every chain of 1..${cfg.depth} of ${OPS.length} ops), ${M.W} words per component per plane`);
say(`[matrix] precompute ${f1(built.precomputeMs)} ms, ${big(M.meta.opsApplied)} op applications; union bound ${union}/${M.T} tasks (answered by at least one component)`);

// ---------------------------------------------------------------- [audit]
let audit = null;
if (cfg.audit) {
  audit = await auditGridMatrixParallel(M, { workers: cfg.workers });
  say(`[audit] ${audit.components} components x ${M.T} tasks = ${big(audit.cells)} cells recomputed by real grid cells in ${audit.workers} worker threads: fit mismatches ${audit.fitMismatches}, right mismatches ${audit.rightMismatches} (${f1(audit.ms)} ms, ${big(audit.ticks)} ticks)`);
} else {
  say('[audit] skipped (--no-audit): this run is partial');
}

// ---------------------------------------------------------------- [sample]
const sampler = new MatrixElites(M, { seed: 'velocity/sample', popSize: 64, lmax: 64 });
const sample = runToPlateau(sampler, { patience: cfg.barPatience });
say(`[sample] one matrix plane (pop 64, lmax 64, prune on, directed ${sampler.directed}) to its plateau: best ${sample.bestCount}/${M.T} in ${sample.bestLen} slots at generation ${sample.generationsToPlateau}, ruler fired at ${sample.firedAtGeneration}, ${f1(sample.wallToFireMs)} ms, archive ${sample.fill}/${sample.capacity}`);

// ---------------------------------------------------------------- genomes for [exact] and [rate]
const grng = new RNG('velocity/genomes');
const prior = new MatrixElites(M, { seed: 'velocity/prior', lmax: 64, initLen: [1, 64] });
const pbuf = new Int32Array(64);
const drawPrior = () => Array.from(pbuf.subarray(0, prior.randomInto(pbuf)));
const genomes = [];
const mix = { identityOnly: 0, fullLengthWithDuplicates: 0, identityFirst: 0, priorDraws: 0, elites: 0 };
genomes.push([0]); mix.identityOnly++;
{
  const full = [];
  for (let i = 0; i < LEN_CAP / 2; i++) { const c = prior.drawComponent(); full.push(c, c); }
  for (let i = full.length - 1; i > 0; i--) { const j = grng.int(i + 1); const x = full[i]; full[i] = full[j]; full[j] = x; }
  genomes.push(full); mix.fullLengthWithDuplicates++;
}
genomes.push([0, ...drawPrior()]); mix.identityFirst++;
for (let i = 0; i < cfg.randomGenomes && genomes.length < cfg.tickGenomes; i++) { genomes.push(drawPrior()); mix.priorDraws++; }
for (const e of sampler.elites()) { if (genomes.length >= cfg.tickGenomes) break; genomes.push(e.genome); mix.elites++; }
while (genomes.length < cfg.tickGenomes) { genomes.push(drawPrior()); mix.priorDraws++; }
const lens = genomes.map((g) => g.length);

// ---------------------------------------------------------------- [exact]
const ex = exactnessCheck(M, built, genomes);
const exactMismatches = ex.taskMismatches + ex.claimMismatches + ex.countMismatches + ex.fitnessMismatches + ex.wordVsReference;
say(`[exact] ${ex.genomes} genomes (${mix.identityOnly} identity only, ${mix.fullLengthWithDuplicates} of ${LEN_CAP} slots with duplicates, ${mix.identityFirst} identity first, ${mix.priorDraws} prior draws, ${mix.elites} elites of the sample plane; length ${Math.min(...lens)}..${Math.max(...lens)}), each on ${ex.tasks} tasks by the matrix and by real grid cells ticked in a Brain`);
say(`[exact] mismatches: solved ${ex.taskMismatches}, claiming slot ${ex.claimMismatches}, count ${ex.countMismatches}, fitness ${ex.fitnessMismatches}, word path vs cell-by-cell walk ${ex.wordVsReference}; counts ${Math.min(...ex.matrixCounts)}..${Math.max(...ex.matrixCounts)} of ${ex.tasks}`);

// ---------------------------------------------------------------- [rate]
const mr = matrixRate(M, genomes, { minMs: 2000 });
const loops = mr.evals / genomes.length;
const checksumExpected = loops * sum(ex.matrixCounts);
const ratio = mr.evalsPerSecond / ex.tick.evalsPerSecond;
const perEvalGain = 1 / ex.tick.evalsPerSecond - 1 / mr.evalsPerSecond;
const breakEvenEvals = perEvalGain > 0 ? (built.precomputeMs / 1000) / perEvalGain : null;
say(`[rate] tick path:   ${ex.genomes} evals in ${f1(ex.tick.ms)} ms = ${f3(ex.tick.evalsPerSecond)} evals/s (${f1(ex.tick.meanTicksPerEval)} ticks and ${f1(ex.tick.runs / ex.genomes)} cell runs per eval)`);
say(`[rate] matrix path: ${big(mr.evals)} evals in ${f1(mr.ms)} ms = ${big(mr.evalsPerSecond)} evals/s (same ${genomes.length} genomes, ${loops} passes, checksum ${mr.checksum} = ${checksumExpected} expected: ${mr.checksum === checksumExpected})`);
say(`[rate] ratio ${big(ratio)}x against an aim of ${cfg.aim}x: ${ratio >= cfg.aim ? 'MET' : 'NOT MET'}; the precompute (${f1(built.precomputeMs)} ms) is repaid after ${breakEvenEvals === null ? 'never' : big(Math.ceil(breakEvenEvals))} evaluations`);
say(`[rate] search loop (matrix scoring + variation + prune + archive), sample plane: ${big(sample.evals)} evals in ${f1(sample.wallToFireMs)} ms = ${big(sample.evalsPerSecond)} evals/s`);

// ---------------------------------------------------------------- [synthetic]
const synSeed = (s) => 'velocity/synthetic:' + (cfg.syntheticBase + s);
const syn0 = syntheticMatrix({ seed: synSeed(0) });
say(`[synthetic] landscape: ${syn0.matrix.T} tasks in ${syn0.matrix.meta.planted} blocks of ${syn0.blockSize}, one planted component per block, ${syn0.matrix.meta.decoys} decoys fitting ${syn0.matrix.meta.decoyFit} tasks and answering ${syn0.matrix.meta.decoyRight}; the unique optimum is the planted set: count ${syn0.matrix.T}, length ${syn0.matrix.meta.planted}, fitness ${syn0.optimum}`);
const synRows = [];
const landscapes = [];
for (let s = 0; s < cfg.syntheticSeeds; s++) landscapes.push(s === 0 ? syn0 : syntheticMatrix({ seed: synSeed(s) }));
const ARMS = [{ arm: 'directed', directed: undefined }, { arm: 'undirected', directed: 0 }];
for (const { arm, directed } of ARMS) for (const patience of cfg.sweep) {
  for (let s = 0; s < cfg.syntheticSeeds; s++) {
    const sm = landscapes[s];
    const eng = new MatrixElites(sm.matrix, { seed: synSeed(s) + ':engine', popSize: 64, lmax: 32, ...(directed === undefined ? {} : { directed }) });
    let found = null;
    const rep = runToPlateau(eng, { patience, maxGenerations: 50_000, onGeneration: (row) => { if (found === null && row.best === sm.optimum) found = row.gen; } });
    const b = eng.best();
    const held = [...new Set(b.genome)].sort((x, y) => x - y);
    const planted = b.genome.length === sm.plantedIds.length && held.length === sm.plantedIds.length && held.every((c, i) => c === sm.plantedIds[i]);
    const landingError = found === null ? null : rep.generationsToPlateau - found;
    const fireLag = found === null ? null : rep.firedAtGeneration - found;
    synRows.push({
      arm, directed: eng.directed, seed: cfg.syntheticBase + s, patience, foundGeneration: found, generationsToPlateau: rep.generationsToPlateau, firedAtGeneration: rep.firedAtGeneration,
      landingError, fireLag, best: rep.best, optimum: sm.optimum, bestCount: rep.bestCount, bestLen: rep.bestLen, plantedSet: planted,
      falsePlateau: found === null, onTime: found !== null && planted && rep.best === sm.optimum && landingError === 0 && fireLag === patience,
      wallToPlateauMs: rep.wallToPlateauMs, wallToFireMs: rep.wallToFireMs, evals: rep.evals, evalsPerSecond: rep.evalsPerSecond, fill: rep.fill,
    });
  }
}
// The engine's trajectory does not depend on the patience (the ruler only decides when to stop),
// so a seed must reach the optimum at the same generation under every patience that lets it.
const foundBySeed = new Map();
let trajectoryDisagreements = 0;
for (const r of synRows) {
  if (r.foundGeneration === null) continue;
  const key = r.arm + '#' + r.seed;
  if (!foundBySeed.has(key)) foundBySeed.set(key, r.foundGeneration);
  else if (foundBySeed.get(key) !== r.foundGeneration) trajectoryDisagreements++;
}
const sweep = ARMS.flatMap(({ arm }) => cfg.sweep.map((patience) => {
  const rs = synRows.filter((r) => r.arm === arm && r.patience === patience);
  const ok = rs.filter((r) => r.onTime);
  const fp = rs.filter((r) => r.falsePlateau);
  return {
    arm, directed: rs.length ? rs[0].directed : null, patience, seeds: rs.length, onTime: ok.length, falsePlateaus: fp.length,
    falsePlateauBestCounts: fp.map((r) => r.bestCount),
    meanFoundGeneration: ok.length ? sum(ok.map((r) => r.foundGeneration)) / ok.length : null,
    foundRange: ok.length ? [Math.min(...ok.map((r) => r.foundGeneration)), Math.max(...ok.map((r) => r.foundGeneration))] : null,
    meanWallToFireMs: rs.length ? sum(rs.map((r) => r.wallToFireMs)) / rs.length : null,
    meanEvalsPerSecond: rs.length ? sum(rs.map((r) => r.evalsPerSecond)) / rs.length : null,
  };
}));
for (const w of sweep) {
  say(`[synthetic] ${w.arm.padEnd(10)} (directed ${w.directed}) patience ${String(w.patience).padStart(3)}: on time ${w.onTime}/${w.seeds}, false plateaus ${w.falsePlateaus}${w.falsePlateaus ? ' (stopped holding ' + w.falsePlateauBestCounts.join(',') + ' of ' + syn0.matrix.T + ')' : ''}, optimum first held at generation ${w.foundRange ? w.foundRange[0] + '..' + w.foundRange[1] : 'n/a'}, mean wall to fire ${f1(w.meanWallToFireMs)} ms, ${big(w.meanEvalsPerSecond || 0)} evals/s`);
}
const barRows = synRows.filter((r) => r.arm === 'directed' && r.patience === cfg.barPatience);
const foundRows = barRows.filter((r) => r.landingError !== null);
const synBar = {
  patience: cfg.barPatience, seeds: barRows.length, onTime: barRows.filter((r) => r.onTime).length,
  directed: barRows.length ? barRows[0].directed : null, seedsFrom: cfg.syntheticBase,
  falsePlateaus: barRows.filter((r) => r.falsePlateau).length,
  maxAbsLandingError: foundRows.length ? Math.max(...foundRows.map((r) => Math.abs(r.landingError))) : null,
  fireLags: [...new Set(foundRows.map((r) => r.fireLag))],
  toleranceGenerations: 0, trajectoryDisagreements,
};
synBar.met = synBar.seeds > 0 && synBar.onTime === synBar.seeds && synBar.falsePlateaus === 0 && synBar.maxAbsLandingError !== null && synBar.maxAbsLandingError <= synBar.toleranceGenerations && trajectoryDisagreements === 0;
const undirBar = sweep.find((w) => w.arm === 'undirected' && w.patience === cfg.barPatience);
const dirBar = sweep.find((w) => w.arm === 'directed' && w.patience === cfg.barPatience);
say(`[synthetic] BAR (directed ${synBar.directed}, seeds ${cfg.syntheticBase}..${cfg.syntheticBase + cfg.syntheticSeeds - 1}) patience ${synBar.patience}: ${synBar.onTime}/${synBar.seeds} seeds end holding the planted set, ${synBar.falsePlateaus} false plateaus; |generationsToPlateau - generation the optimum was first held| max ${synBar.maxAbsLandingError} (tolerance ${synBar.toleranceGenerations}); fired ${synBar.fireLags.join(',')} generations after it; trajectory disagreements across patience ${trajectoryDisagreements}: ${synBar.met ? 'MET' : 'NOT MET'}`);

// ---------------------------------------------------------------- [infinite]
const ticksPerEval = ex.tick.meanTicksPerEval;
const compactRow = (r) => ({
  plane: r.plane, popSize: r.coordinate.popSize, lmax: r.coordinate.lmax, mutationRate: r.coordinate.mutationRate,
  crossoverRate: r.coordinate.crossoverRate, prune: r.coordinate.prune, directed: r.coordinate.directed, fired: r.fired, reason: r.reason,
  generationsToPlateau: r.generationsToPlateau, firedAtGeneration: r.firedAtGeneration, wallToPlateauMs: r.wallToPlateauMs,
  wallToFireMs: r.wallToFireMs, evals: r.evals, evalsPerSecond: r.evalsPerSecond, bestCount: r.bestCount, bestLen: r.bestLen,
  fill: r.fill, capacity: r.capacity, globalBestCount: r.globalBestCount, atWallMs: r.atWallMs,
});
const rowLine = (r) => `[infinite] plane ${String(r.plane).padStart(3)} pop ${String(r.popSize).padStart(3)} lmax ${String(r.lmax).padStart(2)} rate ${r.mutationRate} cross ${r.crossoverRate} prune ${r.prune ? 'on ' : 'off'} dir ${r.directed}: ${r.reason}, landed gen ${r.generationsToPlateau} (${f1(r.wallToPlateauMs)} ms), fired gen ${r.firedAtGeneration}, ${r.bestCount}/${M.T} in ${r.bestLen} slots, fill ${r.fill}/${r.capacity}, carried best ${r.globalBestCount}`;
const fin = infinite(M, { base: 'velocity/finite', planes: cfg.finitePlanes, wallMs: 300_000, patience: cfg.barPatience, ticksPerEval });
const finRows = fin.rows.map(compactRow);
for (const r of finRows) say(rowLine(r));
say(`[infinite] finite list of ${cfg.finitePlanes} coordinates: stop ${fin.stopReason}, ruler fired on ${fin.planesFired}/${fin.planesRun} (allFired ${fin.allFired}), best ${fin.best.count}/${M.T} in ${fin.best.len} slots, ${big(fin.evals)} evals in ${f1(fin.wallMs)} ms = ${big(fin.evalsPerSecond)} evals/s`);
const inf = infinite(M, { base: 'velocity/infinite', planes: Infinity, wallMs: cfg.infiniteMs, patience: cfg.barPatience, ticksPerEval });
const infRows = inf.rows.map(compactRow);
const show = infRows.length <= 12 ? infRows : [...infRows.slice(0, 6), ...infRows.slice(-4)];
for (const r of show) say(rowLine(r));
if (show.length < infRows.length) say(`[infinite] (${infRows.length - show.length} planes between these not printed; all are in the verdict)`);
say(`[infinite] unbounded list, wall budget ${cfg.infiniteMs} ms: stop ${inf.stopReason} after ${inf.planesRun} planes (${inf.planesFired} fired), best ${inf.best.count}/${M.T} (union bound ${union}) in ${inf.best.len} slots from plane ${inf.best.plane}, ${big(inf.evals)} evals in ${f1(inf.wallMs)} ms = ${big(inf.evalsPerSecond)} evals/s`);
say(`[infinite] years: ${inf.years.arithmetic}`);
const bestLib = inf.best.fitness >= fin.best.fitness ? { ...inf.best, from: 'unbounded' } : { ...fin.best, from: 'finite' };
const confirm = tickScoreGrid(bestLib.genome, built);
say(`[infinite] the best library (${bestLib.from} run) re-scored by real cells: ${confirm.count}/${M.T}, matrix said ${bestLib.count}: ${confirm.count === bestLib.count ? 'agree' : 'DISAGREE'}`);

// ---------------------------------------------------------------- [heldout]
const hoBuilt = buildGridMatrix({ seed: cfg.seed + ':heldout', maxDepth: cfg.depth });
const hoUnion = hoBuilt.matrix.unionBound();
const hoM = hoBuilt.matrix.score(bestLib.genome);
const hoK = tickScoreGrid(bestLib.genome, hoBuilt);
say(`[heldout] fresh draw (seed ${cfg.seed}:heldout, same families): the best library solves ${hoM.count}/${hoBuilt.matrix.T} (union bound ${hoUnion}) against ${bestLib.count}/${M.T} on the suite it was searched on; real cells say ${hoK.count}: ${hoK.count === hoM.count ? 'agree' : 'DISAGREE'}`);

// ---------------------------------------------------------------- [organism]
let organism = null;
if (cfg.organism) {
  const coord = planeCoordinate(1);
  try {
    organism = await plateauOrganismPlane(coord, { maxMs: cfg.organismMs });
    organism.coordinate = { index: coord.index, seed: coord.seed, world: coord.world.name || coord.world.kind, kind: coord.world.kind, secondsPerTick: coord.secondsPerTick, popSize: coord.epochScale.popSize };
    say(`[organism] planes.mjs plane ${coord.index} (${organism.coordinate.kind} ${organism.coordinate.world}, pop ${coord.epochScale.popSize}) under the ruler (epsilon ${organism.epsilon}, patience ${organism.patience}): ${organism.reason}, landed gen ${organism.generationsToPlateau} (${f1(organism.wallToPlateauMs)} ms), fired gen ${organism.firedAtGeneration}, ${f1(organism.wallToFireMs)} ms, ${organism.evals} organisms = ${f3(organism.evalsPerSecond)} organisms/s, best ${f3(organism.best)}, fill ${organism.fill}`);
    say(`[organism] years: ${organism.years.arithmetic}`);
  } catch (e) {
    organism = { error: String(e && e.stack ? e.stack : e) };
    say(`[organism] ERROR ${String(e && e.message ? e.message : e)}`);
  }
} else {
  say('[organism] skipped (--no-organism): this run is partial');
}

// ---------------------------------------------------------------- [bar] and the verdict
const auditOk = audit ? audit.fitMismatches === 0 && audit.rightMismatches === 0 : null;
const bar = {
  aimRatio: cfg.aim, ratio, ratioMet: ratio >= cfg.aim,
  exactGenomes: ex.genomes, exactMismatches, exactMet: exactMismatches === 0 && mr.checksum === checksumExpected,
  auditCells: audit ? audit.cells : 0, auditMismatches: audit ? audit.fitMismatches + audit.rightMismatches : null, auditMet: auditOk,
  synthetic: synBar,
};
bar.met = bar.ratioMet && bar.exactMet && synBar.met && auditOk !== false;
const totalMs = since();
say(`[bar] matrix ${big(mr.evalsPerSecond)} vs tick ${f3(ex.tick.evalsPerSecond)} evals/s = ${big(ratio)}x (aim ${cfg.aim}x); exactness ${ex.genomes} genomes, ${exactMismatches} mismatches; audit ${audit ? big(audit.cells) + ' cells, ' + bar.auditMismatches + ' mismatches' : 'skipped'}; synthetic ${synBar.onTime}/${synBar.seeds} on time at patience ${synBar.patience}: ${bar.met ? 'MET' : 'NOT MET'} (${f1(totalMs / 1000)} s)`);

const statement =
  `On ${M.T} grid tasks (seed ${cfg.seed}) and ${M.C} components, the evaluation matrix scored the same ${ex.genomes} genomes at ${big(mr.evalsPerSecond)} evals/s against ${f3(ex.tick.evalsPerSecond)} evals/s for real grid cells ticked in a Brain, a ratio of ${big(ratio)}x against an aim of ${cfg.aim}x (${bar.ratioMet ? 'met' : 'not met'}); ` +
  `the two paths disagreed on ${exactMismatches} task outcomes, claims, counts or fitnesses across those genomes, and ${audit ? 'the audit recomputed all ' + big(audit.cells) + ' matrix cells in real cells with ' + bar.auditMismatches + ' mismatches' : 'the full audit was skipped'}. ` +
  `On a synthetic landscape whose optimum is known, the ruler at patience ${synBar.patience} reported the generation the optimum was first held with a max error of ${synBar.maxAbsLandingError} generations (tolerance ${synBar.toleranceGenerations}) and ended holding the planted set on ${synBar.onTime} of ${synBar.seeds} fresh seeds with the directed engine (directed ${synBar.directed}, optimum first held at generation ${dirBar.foundRange ? dirBar.foundRange.join('..') : 'n/a'}), while the undirected engine on the same seeds did so on ${undirBar.onTime} (generation ${undirBar.foundRange ? undirBar.foundRange.join('..') : 'n/a'}) and stopped early on ${undirBar.falsePlateaus}; at patience ${sweep[0].patience} the directed engine was on time on ${sweep[0].onTime} and stopped early on ${sweep[0].falsePlateaus}. ` +
  `Infinite mode fired on ${fin.planesFired} of ${fin.planesRun} planes of a finite list and ran ${inf.planesRun} planes of an unbounded list until its ${cfg.infiniteMs} ms budget ended (stop: ${inf.stopReason}), carrying a best of ${inf.best.count}/${M.T} (union bound ${union}); the best library solved ${hoM.count}/${hoBuilt.matrix.T} of a fresh draw. ` +
  `The organism-years printed are declared arithmetic, never a measurement, and all wall numbers were taken on a machine shared with other processes. Bar ${bar.met ? 'met' : 'not met'}.`;

const verdict = {
  at: new Date().toISOString(),
  command: 'node bench/velocity.mjs' + (argv.length ? ' ' + argv.join(' ') : ''),
  node: process.version,
  isTheBar,
  statement,
  bar,
  config: cfg,
  matrix: { suite: 'tasks/grid.mjs', seed: cfg.seed, tasks: M.T, components: M.C, words: M.W, maxDepth: cfg.depth, ops: OPS.length, precomputeMs: built.precomputeMs, opsApplied: M.meta.opsApplied, unionBound: union, counts: M.meta.counts },
  audit,
  sample: { ...sample, years: undefined },
  exactness: { ...ex, mix, lengthRange: [Math.min(...lens), Math.max(...lens)], matrixCounts: undefined, countRange: [Math.min(...ex.matrixCounts), Math.max(...ex.matrixCounts)], matrixCountSum: sum(ex.matrixCounts) },
  rates: {
    tick: { genomes: ex.genomes, ms: ex.tick.ms, evalsPerSecond: ex.tick.evalsPerSecond, meanTicksPerEval: ex.tick.meanTicksPerEval, runsPerEval: ex.tick.runs / ex.genomes },
    matrix: { ...mr, passes: loops, checksumExpected, checksumOk: mr.checksum === checksumExpected },
    ratio, breakEvenEvals,
    searchLoop: { evals: sample.evals, ms: sample.wallToFireMs, evalsPerSecond: sample.evalsPerSecond },
  },
  synthetic: {
    landscape: { tasks: syn0.matrix.T, planted: syn0.matrix.meta.planted, blockSize: syn0.blockSize, decoys: syn0.matrix.meta.decoys, decoyFit: syn0.matrix.meta.decoyFit, decoyRight: syn0.matrix.meta.decoyRight, optimum: syn0.optimum, engine: { popSize: 64, lmax: 32, prune: true } },
    sweep, bar: synBar, rows: synRows,
  },
  infinite: {
    finite: { planes: cfg.finitePlanes, stopReason: fin.stopReason, planesRun: fin.planesRun, planesFired: fin.planesFired, allFired: fin.allFired, wallMs: fin.wallMs, evals: fin.evals, evalsPerSecond: fin.evalsPerSecond, best: fin.best, rows: finRows, years: fin.years },
    unbounded: { wallBudgetMs: cfg.infiniteMs, stopReason: inf.stopReason, planesRun: inf.planesRun, planesFired: inf.planesFired, wallMs: inf.wallMs, evals: inf.evals, evalsPerSecond: inf.evalsPerSecond, best: inf.best, rows: infRows, trajectory: inf.trajectory, years: inf.years },
    bestLibrary: { from: bestLib.from, count: bestLib.count, len: bestLib.len, fitness: bestLib.fitness, genome: bestLib.genome, tickCount: confirm.count, agree: confirm.count === bestLib.count },
    ticksPerEval, secondsPerTick: DEFAULT_SECONDS_PER_TICK, secondsPerYear: SECONDS_PER_YEAR,
  },
  heldout: { seed: cfg.seed + ':heldout', tasks: hoBuilt.matrix.T, unionBound: hoUnion, count: hoM.count, tickCount: hoK.count, agree: hoK.count === hoM.count, trainCount: bestLib.count },
  organism,
  machine: {
    platform: process.platform, arch: process.arch, cpus: os.cpus().length, cpuModel: os.cpus()[0] ? os.cpus()[0].model : null,
    availableParallelism: os.availableParallelism ? os.availableParallelism() : null,
    totalMemMB: Math.round(os.totalmem() / 1048576), freeMemMB: Math.round(os.freemem() / 1048576),
    shared: 'other processes (other builders of the same board) were running on this machine during the run; every wall number is a contended number',
  },
  wallMs: totalMs,
};
mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(verdict, null, 2) + '\n');
say(`[verdict] ${path.relative(ROOT, OUT).split(path.sep).join('/')} (isTheBar ${isTheBar})`);
}

// ---------------------------------------------------------------- the multi-draw objective
// The Board 8 search overfit the one draw it was searched on (158/160 there, 110/160 on a fresh
// draw). Here the objective is the mean over K draws (generations/velocity.mjs objectiveOf), and
// the same search, the same coordinates and the same plateau rule run at K = 1 and at K.
async function heldoutDraws() {
  const K = cfg.draws;
  if (!(Number.isInteger(K) && K >= 1 && K <= 16)) throw new Error('--draws takes a whole number 1..16');
  const planes = Number(opt('draw-planes', 32));
  const freshN = Number(opt('fresh', 4));
  const exactN = Number(opt('draw-exact', 40));
  const heldSeed = cfg.seed + ':heldout';
  const freshSeeds = Array.from({ length: freshN }, (_, i) => cfg.seed + ':fresh' + (i + 1));
  const barFlags = new Set(['draws', 'workers']);
  const isBar = K === 4 && flags.every((f) => barFlags.has(f));
  const out = path.join(ROOT, 'bench', 'verdicts', isBar ? 'velocity-heldout.json' : 'velocity-heldout-partial.json');
  const ms = (t0) => Number(process.hrtime.bigint() - t0) / 1e6;

  // ------------------------------------------------ [draws] the suites
  const full = buildGridDraws({ seed: cfg.seed, draws: K, maxDepth: cfg.depth, exclude: [heldSeed, ...freshSeeds] });
  const Td = full.matrix.tasksPerDraw;
  const partUnion = full.parts.map((p) => p.matrix.unionBound());
  say(`[draws] K = ${K} draws of tasks/grid.mjs, seeds derived from the run seed: ${full.seeds.join(', ')}; ${Td} tasks each, ${full.matrix.T} stacked, ${full.matrix.C} components, ${full.matrix.W} words per component per plane; precompute ${f1(full.precomputeMs)} ms; union bound per draw ${partUnion.join(', ')}`);
  const ho = buildGridMatrix({ seed: heldSeed, maxDepth: cfg.depth });
  const fresh = freshSeeds.map((s) => ({ seed: s, ...buildGridMatrix({ seed: s, maxDepth: cfg.depth }) }));
  const taskKey = (t) => [...t.demos.flatMap((d) => [d.input, d.output]), t.test.input, t.test.output].map(G.key).join('/');
  const searchedKeys = new Set(full.tasks.map(taskKey));
  const seenIn = (tasks) => tasks.filter((t) => searchedKeys.has(taskKey(t))).length;
  const hoSeen = seenIn(ho.tasks), freshSeen = fresh.map((f) => seenIn(f.tasks));
  const hoUnion = ho.matrix.unionBound(), freshUnion = fresh.map((f) => f.matrix.unionBound());
  say(`[draws] fresh draw ${heldSeed}: ${ho.matrix.T} tasks, union bound ${hoUnion}, ${hoSeen} of them also appear verbatim in a searched draw; ${freshN} more fresh draws ${freshSeeds.length ? freshSeeds[0] + '..' + freshN : ''}: union bound ${freshUnion.join(', ')}, seen verbatim ${freshSeen.join(', ')}`);

  // ------------------------------------------------ [draws K=k] the arms
  const plateauOf = (run) => {
    let cum = 0, cumEvals = 0, held = null, heldEvals = null, prev = -Infinity;
    for (const r of run.rows) {
      if (r.globalBest > prev) { held = cum + r.generationsToPlateau; heldEvals = cumEvals + r.evalsToPlateau; prev = r.globalBest; }
      cum += r.generations; cumEvals += r.evals;
    }
    return { firstPlaneLanded: run.rows[0].generationsToPlateau, firstPlaneFired: run.rows[0].firedAtGeneration, bestHeldAtGeneration: held, evalsToBest: heldEvals, generations: cum };
  };
  const scoreOn = (genome) => {
    const onDraw0 = full.parts[0].matrix.score(genome).count;
    const h = ho.matrix.score(genome).count;
    const fr = fresh.map((f) => f.matrix.score(genome).count);
    return { onDraw0, fresh: h, freshMore: fr, freshMoreMean: fr.length ? sum(fr) / fr.length : null };
  };
  const searchOn = (parts, label) => {
    const M = stackDraws(parts.map((p) => p.matrix), { name: label });
    const t0 = process.hrtime.bigint();
    const run = infinite(M, { base: 'velocity/finite', planes, wallMs: 600_000, patience: cfg.barPatience });
    const wall = ms(t0);
    const b = run.best;
    const s = M.score(b.genome);
    return {
      M, run, wall, plateau: plateauOf(run),
      best: { genome: b.genome, len: b.len, count: b.count, fitness: b.fitness, plane: b.plane, perDraw: M.countsByDraw(s.solved), meanCount: b.count / M.draws },
      ...scoreOn(b.genome),
    };
  };
  const armKs = [...new Set([1, K])];
  const arms = [];
  for (const k of armKs) {
    const a = searchOn(full.parts.slice(0, k), 'grid:' + k + 'draws');
    a.k = k; a.seeds = full.seeds.slice(0, k);
    arms.push(a);
    const p = a.plateau;
    say(`[draws K=${k}] search: the finite list of ${planes} planes (base velocity/finite, patience ${cfg.barPatience}, the Board 8 coordinates) on ${a.seeds.join(' + ')}: stop ${a.run.stopReason}, ruler fired on ${a.run.planesFired}/${a.run.planesRun}; plane 0 from scratch landed gen ${p.firstPlaneLanded}, fired gen ${p.firstPlaneFired}; the final best first held at generation ${p.bestHeldAtGeneration} of ${p.generations} run (cumulative over planes, ${big(p.evalsToBest)} evals); ${big(a.run.evals)} evals in ${f1(a.wall)} ms = ${big(a.run.evals / (a.wall / 1000))} evals/s (search loop)`);
    say(`[draws K=${k}] searched suite: the best library (${a.best.len} slots, plane ${a.best.plane}) solves ${f1(a.best.meanCount)}/${Td} mean over its ${k} draw${k > 1 ? 's' : ''} (per draw ${a.best.perDraw.join(', ')}), ${a.onDraw0}/${Td} on ${cfg.seed}`);
    say(`[draws K=${k}] fresh draw ${heldSeed}: ${a.fresh}/${ho.matrix.T} (union bound ${hoUnion}); the ${freshN} more fresh draws: ${a.freshMore.join(', ')} (mean ${f1(a.freshMoreMean)})`);
  }

  // ------------------------------------------------ [control] one draw at a time
  const control = [];
  for (let d = 1; d < K; d++) {
    const c = searchOn([full.parts[d]], 'grid:draw' + d);
    control.push({ draw: d, seed: full.seeds[d], searchedCount: c.best.count, len: c.best.len, fresh: c.fresh, freshMore: c.freshMore, freshMoreMean: c.freshMoreMean, evals: c.run.evals, bestHeldAtGeneration: c.plateau.bestHeldAtGeneration });
  }
  if (control.length) {
    say(`[control] K = 1 searched on each other draw alone (same list, same rule): searched ${control.map((c) => c.searchedCount + '/' + Td).join(', ')}; fresh draw ${heldSeed} ${control.map((c) => c.fresh).join(', ')}; the ${freshN} more fresh draws, mean ${control.map((c) => f1(c.freshMoreMean)).join(', ')}`);
  }

  // ------------------------------------------------ genomes for [exact] and the rates
  const genomes = [[0]];
  const mix = { identityOnly: 1, armBests: 0, controlBests: 0, sampleElites: 0, priorDraws: 0 };
  for (const a of arms) { genomes.push(a.best.genome); mix.armBests++; }
  const sampler = new MatrixElites(full.matrix, { seed: 'velocity/draws-sample', popSize: 64, lmax: 64 });
  runToPlateau(sampler, { patience: cfg.barPatience });
  for (const e of sampler.elites()) { if (genomes.length >= Math.ceil(exactN * 0.6)) break; genomes.push(e.genome); mix.sampleElites++; }
  const prior = new MatrixElites(full.matrix, { seed: 'velocity/draws-prior', lmax: 64, initLen: [1, 64] });
  const pbuf = new Int32Array(64);
  while (genomes.length < exactN) { genomes.push(Array.from(pbuf.subarray(0, prior.randomInto(pbuf)))); mix.priorDraws++; }

  // ------------------------------------------------ [exact] the stack against real cells and against its draws
  const ex = exactnessCheck(full.matrix, full, genomes);
  const exactMismatches = ex.taskMismatches + ex.claimMismatches + ex.countMismatches + ex.fitnessMismatches + ex.wordVsReference;
  say(`[exact] ${ex.genomes} genomes (${mix.identityOnly} identity only, ${mix.armBests} arm bests, ${mix.sampleElites} elites of a K = ${K} plane at its plateau, ${mix.priorDraws} prior draws), each on all ${ex.tasks} stacked tasks by the matrix and by real grid cells ticked in a Brain: mismatches solved ${ex.taskMismatches}, claiming slot ${ex.claimMismatches}, count ${ex.countMismatches}, fitness ${ex.fitnessMismatches}, word path vs cell-by-cell walk ${ex.wordVsReference} (${f1(ex.tick.ms)} ms)`);
  let stackCount = 0, stackSolved = 0, maxObjGap = 0;
  for (const g of genomes) {
    const s = full.matrix.score(g);
    const per = full.parts.map((p) => p.matrix.score(g));
    if (s.count !== sum(per.map((x) => x.count))) stackCount++;
    for (let d = 0; d < K; d++) for (let t = 0; t < Td; t++) if (s.solved[d * Td + t] !== per[d].solved[t]) stackSolved++;
    const mean = sum(per.map((x) => fitnessOf(x.count, g.length, Td))) / K;
    maxObjGap = Math.max(maxObjGap, Math.abs(s.fitness - mean));
  }
  say(`[exact] the stack against its ${K} draws scored one at a time, same ${genomes.length} genomes: count mismatches ${stackCount}, solved mismatches ${stackSolved}; max |stack objective - mean of per draw fitness| ${maxObjGap.toExponential(2)}`);
  const hoTick = arms.map((a) => tickScoreGrid(a.best.genome, ho));
  say(`[exact] the arm bests re-scored on ${heldSeed} by real cells: ${arms.map((a, i) => 'K=' + a.k + ' ' + hoTick[i].count + ' (matrix ' + a.fresh + ')').join(', ')}: ${arms.every((a, i) => hoTick[i].count === a.fresh) ? 'agree' : 'DISAGREE'}`);

  // ------------------------------------------------ [rate] the matrix path at each K
  const rates = [];
  for (const a of arms) {
    const counts = genomes.map((g) => a.M.score(g).count);
    const r = matrixRate(a.M, genomes, { minMs: 2000 });
    const passes = r.evals / genomes.length;
    const ok = r.checksum === passes * sum(counts);
    rates.push({ k: a.k, words: a.M.W, tasks: a.M.T, evals: r.evals, ms: r.ms, evalsPerSecond: r.evalsPerSecond, passes, checksum: r.checksum, checksumOk: ok, searchLoopEvalsPerSecond: a.run.evals / (a.wall / 1000) });
    say(`[rate] K=${a.k}: matrix path ${big(r.evals)} evals in ${f1(r.ms)} ms = ${big(r.evalsPerSecond)} evals/s (${a.M.T} tasks, ${a.M.W} words per plane, same ${genomes.length} genomes, checksum ${ok ? 'ok' : 'WRONG'})`);
  }

  // ------------------------------------------------ [bar]
  const a1 = arms[0], aK = arms[arms.length - 1];
  const margin = aK.fresh - a1.fresh;
  const exactOk = exactMismatches === 0 && stackCount === 0 && stackSolved === 0 && arms.every((a, i) => hoTick[i].count === a.fresh) && rates.every((r) => r.checksumOk);
  const met = K > 1 && margin > 0 && exactOk;
  say(`[bar] fresh draw ${heldSeed}: K=${K} ${aK.fresh}/${ho.matrix.T} against K=1 ${a1.fresh}/${ho.matrix.T} (${margin >= 0 ? '+' : ''}${margin}); searched suite K=${K} ${f1(aK.best.meanCount)}/${Td} mean, K=1 ${a1.best.count}/${Td}; exact ${exactMismatches} + ${stackCount + stackSolved} mismatches: ${met ? 'MET' : 'NOT MET' + (margin > 0 ? '' : ' (K=' + K + ' is ' + (1 - margin) + ' short of beating K=1)')}`);

  const armOut = (a, i) => ({
    k: a.k, seeds: a.seeds, tasks: a.M.T,
    search: { planes, base: 'velocity/finite', patience: cfg.barPatience, stopReason: a.run.stopReason, planesRun: a.run.planesRun, planesFired: a.run.planesFired, evals: a.run.evals, wallMs: a.wall, evalsPerSecond: a.run.evals / (a.wall / 1000), ...a.plateau },
    best: a.best, searchedMeanCount: a.best.meanCount, searchedOnRunSeed: a.onDraw0,
    fresh: { seed: heldSeed, count: a.fresh, tickCount: hoTick[i].count, unionBound: hoUnion },
    freshMore: { seeds: freshSeeds, counts: a.freshMore, mean: a.freshMoreMean },
    rate: rates[i],
    planes: a.run.rows.map((r) => ({ plane: r.plane, popSize: r.coordinate.popSize, lmax: r.coordinate.lmax, directed: r.coordinate.directed, generationsToPlateau: r.generationsToPlateau, firedAtGeneration: r.firedAtGeneration, generations: r.generations, evals: r.evals, bestCount: r.bestCount, bestLen: r.bestLen, globalBestCount: r.globalBestCount })),
  });
  const totalMs = since();
  const statement =
    `The objective was made the mean over K draws of the grid suite (${Td} tasks per draw, draw seeds ${full.seeds.join(', ')}, draw 0 being the run seed so that K = 1 is the Board 8 objective), and the same finite list of ${planes} planes under the same plateau rule (patience ${cfg.barPatience}) was searched at K = 1 and at K = ${K}. ` +
    `At K = 1 the best library (${a1.best.len} slots) solved ${a1.best.count}/${Td} of the suite it was searched on and ${a1.fresh}/${ho.matrix.T} of the fresh draw ${heldSeed}; at K = ${K} the best library (${aK.best.len} slots) solved a mean of ${f1(aK.best.meanCount)}/${Td} over its ${K} draws (${aK.onDraw0}/${Td} on ${cfg.seed}) and ${aK.fresh}/${ho.matrix.T} of the same fresh draw, ${margin > 0 ? margin + ' more' : margin === 0 ? 'the same' : -margin + ' fewer'} than K = 1 (union bound ${hoUnion}). ` +
    `On ${freshN} further fresh draws the means were ${f1(a1.freshMoreMean)} at K = 1 and ${f1(aK.freshMoreMean)} at K = ${K}; searched on each other draw alone, K = 1 scored ${control.map((c) => c.fresh).join(', ')} on ${heldSeed}. ` +
    `Generations to plateau: the final best was first held at cumulative generation ${a1.plateau.bestHeldAtGeneration} of ${a1.plateau.generations} at K = 1 and ${aK.plateau.bestHeldAtGeneration} of ${aK.plateau.generations} at K = ${K}; plane 0 from scratch landed at generation ${a1.plateau.firstPlaneLanded} and ${aK.plateau.firstPlaneLanded}. ` +
    `The matrix path scored ${big(rates[0].evalsPerSecond)} evals/s at K = 1 and ${big(rates[rates.length - 1].evalsPerSecond)} evals/s at K = ${K} on the same ${genomes.length} genomes. ` +
    `Exactness on the ${full.matrix.T} stacked tasks: ${exactMismatches} mismatches between the matrix and real grid cells across ${ex.genomes} genomes, ${stackCount + stackSolved} between the stack and its draws scored one at a time, and the real cells agreed with the matrix on the fresh draw for both best libraries. ` +
    `The fresh-draw bar (K = ${K} above K = 1) was ${met ? 'met' : 'not met'}. Wall numbers were taken on a machine shared with other processes.`;
  const verdict = {
    at: new Date().toISOString(),
    command: ['node', ...process.execArgv, 'bench/velocity.mjs', ...argv].join(' '),
    node: process.version,
    isTheBar: isBar,
    statement,
    bar: { draws: K, freshSeed: heldSeed, freshK1: a1.fresh, freshK: aK.fresh, margin, searchedK1: a1.best.count, searchedKMean: aK.best.meanCount, exactMismatches, stackMismatches: stackCount + stackSolved, exactOk, met },
    config: { seed: cfg.seed, depth: cfg.depth, draws: K, planes, fresh: freshN, exactGenomes: exactN, patience: cfg.barPatience, epsilon: 1e-9 },
    suites: { seeds: full.seeds, tasksPerDraw: Td, components: full.matrix.C, unionBoundPerDraw: partUnion, precomputeMs: full.precomputeMs, heldout: { seed: heldSeed, tasks: ho.matrix.T, unionBound: hoUnion, seenInSearched: hoSeen }, fresh: freshSeeds.map((s, i) => ({ seed: s, unionBound: freshUnion[i], seenInSearched: freshSeen[i] })) },
    arms: arms.map(armOut),
    control,
    exactness: { genomes: ex.genomes, tasks: ex.tasks, mix, taskMismatches: ex.taskMismatches, claimMismatches: ex.claimMismatches, countMismatches: ex.countMismatches, fitnessMismatches: ex.fitnessMismatches, wordVsReference: ex.wordVsReference, first: ex.first, tickMs: ex.tick.ms, stackCountMismatches: stackCount, stackSolvedMismatches: stackSolved, maxObjectiveGap: maxObjGap, heldoutTick: arms.map((a, i) => ({ k: a.k, matrix: a.fresh, tick: hoTick[i].count })) },
    rates,
    machine: {
      platform: process.platform, arch: process.arch, cpus: os.cpus().length,
      totalMemMB: Math.round(os.totalmem() / 1048576), freeMemMB: Math.round(os.freemem() / 1048576),
      shared: 'other builders of the same board were running on this machine during the run; every wall number is a contended number',
    },
    wallMs: totalMs,
  };
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(verdict, null, 2) + '\n');
  say(`[verdict] ${path.relative(ROOT, out).split(path.sep).join('/')} (isTheBar ${isBar}, ${f1(totalMs / 1000)} s)`);
}
