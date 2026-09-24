// bench/venue-suite.mjs: GENERATIONS ON A MARKET. Evolving the decision, not the anatomy.
//
// tasks/venue.mjs is the yardstick: one instrument window of a recorded tape per task, run
// through the organism's own venue path at the payable price with the round trip fee
// charged, graded as return on deployed MINUS a matched random control on the same window.
// generations/organism-genome.mjs already hosts that suite, so an organism carrying
// sense.venue, world.venue and venue.trader is scored on it. What that scoring cannot do is
// make anything BETTER at trading: the suite score there is a function of the kind set, so
// every organism that contains the three kinds scores the same number. The gradient, if
// there is one anywhere, is in the parameters of the decision cell.
//
// So this bench evolves THOSE. A genome is the five parameters venue.trader reads
// (lookback, entryUp, trail, maxHold, maxOpen); a generation evaluates a population of
// them on the same train windows; selection keeps what beat its own control and breeds it.
//
// THREE ARMS, INTERLEAVED, PER WINDOW (rule: never arm by arm):
//
//   brain        the organism decides, through venue.trader, through the gate
//   random       the same COUNT of round trips, the same sizes, the same holding times,
//                entered at random on that same window, through venue.script so the
//                control travels the identical edges with the identical latency
//   never trade  the same path, an empty order list. It deploys nothing and returns
//                nothing, and it is run rather than assumed so that the zero is measured.
//
// TWO POPULATIONS, so a rising best-so-far curve is not mistaken for a discovery:
//
//   selected     parents are the top half by fitness
//   drift        the same seed genome, the same mutation operator, the same budget,
//                parents drawn UNIFORMLY at random. A generational loop always produces a
//                rising best-so-far; drift is what says whether selection did it.
//
// AND A HOLDOUT. The windows are drawn once from one instrument pool and split in two by
// INSTRUMENT: the search never sees the holdout instruments. A search over a few hundred
// evaluations on eight windows can fit noise perfectly, so the train number is reported as
// what it is (the number that was optimised) and the holdout number is the one that means
// anything.
//
// WHAT A NUMBER HERE MAY CLAIM. Nothing about profit. The fee is BORROWED (measured on
// pump.fun, applied to pumpswap, which has never been measured), and before today 0 of 12
// arms in bench/verdicts/venue.json cleared it. A null result is a result and is written
// as one. The `verdict` field is about whether the MEASUREMENT is sound; whether the
// evolved trader made money is the `claim` field, and it is allowed to say no.
//
// WHERE THE VERDICT GOES, AND WHY IT IS NOT ONE PATH. bench/verdicts/venue-suite.json is
// the CANONICAL run's file and nothing else may write it: a sanity run at --generations 3
// --pop 8 overwrote it once, and a small run wearing the deliverable's filename is a
// verdict that no longer belongs to the command inside it. So the path is chosen by the
// configuration: exactly the canonical one writes venue-suite.json, anything else writes
// venue-suite.sanity.json, and --out <name> puts it wherever it is asked to. The path is
// printed either way, so what was written is never a guess.
//
// Run:  node bench/venue-suite.mjs [--generations 16] [--pop 32] [--windows 8]
//                                  [--readings 24] [--drift 16] [--seed venue.suite/1]
//                                  [--out venue-suite]
import { writeFileSync, mkdirSync } from 'node:fs';
import { cpus } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RNG } from '../core/rng.mjs';
import {
  generateVenue, solveVenue, gradeVenue,
  windowTapeOf, runWindowArm, matchedControl,
  VENUE_SIZE, VENUE_DRAW_SEED, VENUE_KINDS_NEEDED,
} from '../tasks/index.mjs';
import { hostableSuites, scoreSuitesFor } from '../generations/organism-genome.mjs';
import { FEE_ROUND_TRIP, FEE_SOURCE } from '../world/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const COMMAND = 'node bench/venue-suite.mjs ' + process.argv.slice(2).join(' ');

const out = (s) => process.stdout.write(s + '\n');
const f = (x, n = 4) => (Number.isFinite(Number(x)) ? Number(x).toFixed(n) : 'n/a');
const pct = (x, n = 2) => (Number.isFinite(Number(x)) ? (Number(x) * 100).toFixed(n) + '%' : 'n/a');

function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) { o[a.slice(2)] = true; continue; }
    o[a.slice(2)] = /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v;
    i++;
  }
  return o;
}
const ARGS = parseArgs(process.argv.slice(2));
const GENERATIONS = Math.max(1, Number(ARGS.generations ?? 16));
const POP = Math.max(4, Number(ARGS.pop ?? 32));
const DRIFT = Math.max(0, Number(ARGS.drift ?? 16));
const WINDOWS = Math.max(2, Number(ARGS.windows ?? 8));
const READINGS = Math.max(8, Number(ARGS.readings ?? 24));
const SEED = String(ARGS.seed ?? 'venue.suite/1');
const SIZE = Number(ARGS.size ?? VENUE_SIZE);

// The canonical configuration, declared here and not inferred from what was passed, so the
// question "is this the run the deliverable file is allowed to hold" has one answer that
// does not move with the arguments.
const CANON = Object.freeze({ generations: 16, pop: 32, drift: 16, windows: 8, readings: 24, seed: 'venue.suite/1', size: VENUE_SIZE });
const CONFIG = Object.freeze({ generations: GENERATIONS, pop: POP, drift: DRIFT, windows: WINDOWS, readings: READINGS, seed: SEED, size: SIZE });
const IS_CANON = Object.keys(CANON).every((k) => CANON[k] === CONFIG[k]);
const OUT_NAME = typeof ARGS.out === 'string' ? ARGS.out.replace(/\.json$/, '') : (IS_CANON ? 'venue-suite' : 'venue-suite.sanity');
const OUT = path.join(HERE, 'verdicts', OUT_NAME + '.json');

// ---------------------------------------------------------------- the genome
// Five numbers, every one of them a parameter the venue.trader cell already reads. The
// bounds are the search space and they are declared here rather than discovered, because a
// bound that moves with the result is not a bound. `size` is NOT a gene: a search allowed
// to shrink its own size would find that the smallest order pays the least impact and
// report that as a trading rule.
const GENES = Object.freeze([
  { name: 'lookback', lo: 1, hi: 8, integer: true, step: 1.2 },
  { name: 'entryUp', lo: -0.05, hi: 0.20, integer: false, step: 0.03 },
  { name: 'trail', lo: 0.01, hi: 0.60, integer: false, step: 0.06 },
  { name: 'maxHold', lo: 2, hi: 40, integer: true, step: 4 },
  { name: 'maxOpen', lo: 1, hi: 8, integer: true, step: 1.2 },
]);
// The cell's own declared defaults, carried into generation 0 so the incumbent is in the
// population and a winner has to beat it rather than merely differ from it.
const INCUMBENT = Object.freeze({ lookback: 3, entryUp: 0.02, trail: 0.1, maxHold: 12, maxOpen: 4 });

const clampGene = (g, v) => {
  let x = Math.min(g.hi, Math.max(g.lo, v));
  if (g.integer) x = Math.round(x);
  return x;
};
const randomGenome = (rng) => {
  const g = {};
  for (const gene of GENES) g[gene.name] = clampGene(gene, gene.lo + rng.next() * (gene.hi - gene.lo));
  return g;
};
const mutateGenome = (parent, rng) => {
  const g = { ...parent };
  for (const gene of GENES) {
    if (rng.next() > 0.5) continue;   // roughly half the genes move per offspring
    g[gene.name] = clampGene(gene, g[gene.name] + rng.gauss() * gene.step);
  }
  return g;
};
const keyOf = (g) => GENES.map((x) => g[x.name]).join('|');

// ---------------------------------------------------------------- the windows
// One draw, split by INSTRUMENT. generateVenue shuffles the pool and takes instruments
// without replacement while the pool lasts, so asking for 2 * WINDOWS windows out of a
// pool of 2 * WINDOWS instruments gives 2 * WINDOWS distinct instruments, and the two
// halves share none. Two windows of one price history in two halves would be one fact
// counted as two.
out('VENUE SUITE: generations on a market, paper only, no order path out of this process');
const t0 = process.hrtime.bigint();
const allWindows = generateVenue({
  seed: SEED + '/windows',
  counts: { windows: WINDOWS * 2, readings: READINGS, instruments: WINDOWS * 2 },
  size: SIZE,
});
const drawMs = Number(process.hrtime.bigint() - t0) / 1e6;
const TRAIN = allWindows.slice(0, WINDOWS);
const HOLDOUT = allWindows.slice(WINDOWS);
const trainInstruments = new Set(TRAIN.map((p) => p.instrument));
const holdoutInstruments = new Set(HOLDOUT.map((p) => p.instrument));
const disjoint = [...trainInstruments].every((id) => !holdoutInstruments.has(id));
const synthetic = allWindows.some((p) => p.synthetic);
const pool = allWindows.length ? allWindows[0].instrumentPool : 0;
const venueName = allWindows.length ? allWindows[0].venue : 'n/a';

out('tape: ' + (synthetic ? 'SYNTHETIC (no recorded database could be read: no rate below is a measurement of any market)' : 'recorded, read only, out of the frozen trader package') +
    ', venue ' + venueName + ', pool ' + pool + ' instruments, draw seed ' + VENUE_DRAW_SEED + ', drawn in ' + Math.round(drawMs) + ' ms');
out('windows: ' + TRAIN.length + ' train + ' + HOLDOUT.length + ' holdout of ' + READINGS + ' readings, instruments disjoint ' + disjoint + ', size ' + SIZE + ' quote per entry');
out('fee bar: ' + f(FEE_ROUND_TRIP, 4) + ' round trip, BORROWED from ' + FEE_SOURCE.file + ' (measured on ' + FEE_SOURCE.venueMeasuredOn + ', applied to ' + FEE_SOURCE.venueAppliedTo + ')');
out('verdict goes to bench/verdicts/' + OUT_NAME + '.json' + (IS_CANON ? ' (the canonical configuration)' : ' (NOT the canonical configuration, so the canonical file is left alone)'));
out('');

// ---------------------------------------------------------------- the hosting figure
// This number used to be typed into a note by hand and it was typed WRONG: the note said
// the venue-only kind set scores 0.125 with venue accuracy 0.5, and the code prints half
// of each. A number about the code belongs to a command, so the bench asks the genome
// module itself, prints what came back, and puts it in the verdict. Asked twice, because a
// figure that is a property of the code has to be the same figure on the second call.
const VENUE_ONLY = new Set(VENUE_KINDS_NEEDED);
const hostable = hostableSuites();
const hostingA = scoreSuitesFor(new Set(VENUE_ONLY));
const hostingB = scoreSuitesFor(new Set(VENUE_ONLY));
const hostingRepeats = JSON.stringify(hostingA) === JSON.stringify(hostingB);
const hosting = {
  hostable: hostable.hostable, unreachable: hostable.unreachable,
  venueOnlyKindSet: [...VENUE_ONLY],
  score: hostingA.score, denominator: hostingA.denominator, coverage: hostingA.coverage,
  eligible: hostingA.eligible, skipped: hostingA.skipped, perSuite: hostingA.perSuite,
  repeats: hostingRepeats,
};
out('hosting: hostableSuites() ' + JSON.stringify(hostable.hostable) + ', unreachable ' + JSON.stringify(hostable.unreachable));
out('hosting: scoreSuitesFor(' + JSON.stringify([...VENUE_ONLY]) + ') ' + JSON.stringify(hostingA));
out('hosting: the same call a second time gives the same object ' + hostingRepeats);
out('');

// ---------------------------------------------------------------- fitness
// One evaluation is the whole suite on one set of windows: per window the brain arm and
// then its own matched control, back to back, never one whole arm and then the other. The
// number that comes back is the DIFFERENCE, so a genome that never trades scores exactly
// zero and a genome that trades badly scores less than doing nothing.
const EVALS = new Map();
let evalCount = 0;
function fitnessOf(genome, problems, tag) {
  const key = tag + '#' + keyOf(genome);
  if (EVALS.has(key)) return EVALS.get(key);
  const solved = solveVenue(problems, { trader: genome, seed: SEED + '/' + tag, size: SIZE });
  const report = gradeVenue(problems, solved.results, { feeRoundTrip: solved.feeRoundTrip });
  evalCount++;
  const row = {
    fitness: report.scoreOnDeployed,
    brainReturn: report.brainReturnOnDeployed,
    controlReturn: report.controlReturnOnDeployed,
    trips: report.brainTrips, wins: report.correct, n: report.n,
    meanGrossReturnPerTrip: report.meanGrossReturnPerTrip,
    sound: report.sound, report,
  };
  EVALS.set(key, row);
  return row;
}

// ---------------------------------------------------------------- the loop
// Two populations, stepped in the same generation on the same windows, never one whole
// population and then the other. They differ in ONE line: who gets to be a parent.
function newPopulation(size, rng, withIncumbent) {
  const p = [];
  if (withIncumbent && size > 0) p.push({ ...INCUMBENT });
  while (p.length < size) p.push(randomGenome(rng));
  return p;
}

const rngSel = new RNG(SEED + ':selected');
const rngDrift = new RNG(SEED + ':drift');
let selected = newPopulation(POP, rngSel, true);
let drift = newPopulation(DRIFT, rngDrift, true);

const history = [];
let bestGenome = null, bestFitness = -Infinity, bestGen = -1;
let driftBestFitness = -Infinity, driftBestGenome = null;

out('gen   evals    selected best   selected mean       drift best   drift mean      ms');
for (let gen = 0; gen < GENERATIONS; gen++) {
  const tg = process.hrtime.bigint();
  // interleaved: one genome of the selected population, then one of the drift population,
  // alternating, so nothing that moves across the wall clock of a generation lands on one
  // population and not the other.
  const scoredSel = [], scoredDrift = [];
  const n = Math.max(selected.length, drift.length);
  for (let i = 0; i < n; i++) {
    if (i < selected.length) scoredSel.push({ genome: selected[i], ...fitnessOf(selected[i], TRAIN, 'train') });
    if (i < drift.length) scoredDrift.push({ genome: drift[i], ...fitnessOf(drift[i], TRAIN, 'train') });
  }
  scoredSel.sort((a, b) => b.fitness - a.fitness);
  const meanOf = (rows) => (rows.length ? rows.reduce((a, r) => a + r.fitness, 0) / rows.length : 0);
  const selBest = scoredSel.length ? scoredSel[0] : null;
  const driBest = scoredDrift.length ? scoredDrift.reduce((a, r) => (r.fitness > a.fitness ? r : a), scoredDrift[0]) : null;
  if (selBest && selBest.fitness > bestFitness) { bestFitness = selBest.fitness; bestGenome = { ...selBest.genome }; bestGen = gen; }
  if (driBest && driBest.fitness > driftBestFitness) { driftBestFitness = driBest.fitness; driftBestGenome = { ...driBest.genome }; }

  const ms = Number(process.hrtime.bigint() - tg) / 1e6;
  history.push({
    gen,
    selectedBest: selBest ? selBest.fitness : null, selectedMean: meanOf(scoredSel),
    driftBest: driBest ? driBest.fitness : null, driftMean: meanOf(scoredDrift),
    bestSoFar: bestFitness, driftBestSoFar: driftBestFitness,
    evals: evalCount, ms: Math.round(ms),
  });
  out(String(gen).padStart(3) + '   ' + String(evalCount).padStart(5) + '   ' +
      f(selBest ? selBest.fitness : 0, 6).padStart(13) + '   ' + f(meanOf(scoredSel), 6).padStart(13) + '   ' +
      f(driBest ? driBest.fitness : 0, 6).padStart(13) + '   ' + f(meanOf(scoredDrift), 6).padStart(13) + '   ' +
      String(Math.round(ms)).padStart(5));

  if (gen === GENERATIONS - 1) break;
  // selected: elite plus offspring of the top half. drift: offspring of anybody.
  const parents = scoredSel.slice(0, Math.max(1, Math.floor(scoredSel.length / 2)));
  const next = [{ ...scoredSel[0].genome }];
  while (next.length < POP) next.push(mutateGenome(parents[rngSel.int(parents.length)].genome, rngSel));
  selected = next;
  const nextDrift = [];
  while (nextDrift.length < DRIFT) nextDrift.push(mutateGenome(scoredDrift[rngDrift.int(scoredDrift.length)].genome, rngDrift));
  drift = nextDrift;
}
out('');

// ---------------------------------------------------------------- the measurement
// THREE arms per window, interleaved inside the window: brain, matched random control,
// never trade. The never trade arm is run and not assumed, and what it deploys and returns
// is printed exactly as it came back.
function threeArms(problems, genome, tag) {
  const rows = [];
  let refused = 0, openAtEnd = 0, dropped = 0, collisions = 0;
  for (const p of problems) {
    const tape = windowTapeOf(p);
    const size = Number(p.size ?? SIZE);
    const brain = runWindowArm(tape, size, { decide: 'trader', trader: genome });
    const ctl = matchedControl(tape, brain.trades, SEED + '/' + tag + ':' + p.id);
    const random = runWindowArm(tape, size, { decide: 'script', orders: ctl.orders });
    const flat = runWindowArm(tape, size, { decide: 'script', orders: [] });
    refused += brain.refused + random.refused + flat.refused;
    openAtEnd += brain.openAtEnd + random.openAtEnd + flat.openAtEnd;
    dropped += brain.borderDropped + random.borderDropped + flat.borderDropped;
    collisions += ctl.collisions;
    rows.push({
      id: p.id, instrument: p.instrument, readings: p.n, size,
      brain: { trips: brain.trips, net: brain.net, deployed: brain.deployed, fees: brain.fees, ret: brain.returnOnDeployed, gross: brain.meanGrossReturnPerTrip, senseEmitted: brain.senseEmitted },
      random: { trips: random.trips, net: random.net, deployed: random.deployed, fees: random.fees, ret: random.returnOnDeployed, gross: random.meanGrossReturnPerTrip, senseEmitted: random.senseEmitted },
      // senseEmitted is why a zero from the never trade arm is a MEASURED zero and not the
      // zero of an arm that never ran: the readings went past this arm's decision cell.
      flat: { trips: flat.trips, net: flat.net, deployed: flat.deployed, fees: flat.fees, ret: flat.returnOnDeployed, senseEmitted: flat.senseEmitted },
      score: brain.returnOnDeployed - random.returnOnDeployed,
      collisions: ctl.collisions,
    });
  }
  return { rows, refused, openAtEnd, dropped, collisions };
}

// The mean of a per window number and BOTH edges of its 95 percent interval. Both edges,
// always: which end of an interval flatters a result inverts between a rate and a gap, so
// quoting one end is quoting whichever end happened to help.
function interval(values) {
  const n = values.length;
  if (!n) return { n: 0, mean: 0, sd: 0, se: 0, lo: 0, hi: 0 };
  const mean = values.reduce((a, v) => a + v, 0) / n;
  const varSum = values.reduce((a, v) => a + (v - mean) * (v - mean), 0);
  const sd = n > 1 ? Math.sqrt(varSum / (n - 1)) : 0;
  const se = n > 1 ? sd / Math.sqrt(n) : 0;
  return { n, mean, sd, se, lo: mean - 1.96 * se, hi: mean + 1.96 * se };
}

function signTest(k, n) {
  let c = 1, p = 0;
  for (let i = 0; i <= n; i++) { if (i >= k) p += c; c = c * (n - i) / (i + 1); }
  return p / Math.pow(2, n);
}

function summarise(arms, label) {
  const rows = arms.rows;
  const pooled = (side) => {
    const net = rows.reduce((a, r) => a + r[side].net, 0);
    const deployed = rows.reduce((a, r) => a + r[side].deployed, 0);
    const trips = rows.reduce((a, r) => a + r[side].trips, 0);
    const fees = rows.reduce((a, r) => a + r[side].fees, 0);
    return { net, deployed, trips, fees, returnOnDeployed: deployed > 0 ? net / deployed : 0 };
  };
  const brain = pooled('brain'), random = pooled('random'), flat = pooled('flat');
  const readingsSeen = (side) => rows.reduce((a, r) => a + (r[side].senseEmitted || 0), 0);
  const grossSum = rows.reduce((a, r) => a + r.brain.gross * r.brain.trips, 0);
  const meanGross = brain.trips > 0 ? grossSum / brain.trips : 0;
  const wins = rows.filter((r) => r.brain.trips > 0 && r.score > 0).length;
  const traded = rows.filter((r) => r.brain.trips > 0).length;
  return {
    label, windows: rows.length,
    brain, random, flat,
    readingsSeen: { brain: readingsSeen('brain'), random: readingsSeen('random'), flat: readingsSeen('flat') },
    perWindowBrainReturn: interval(rows.map((r) => r.brain.ret)),
    perWindowRandomReturn: interval(rows.map((r) => r.random.ret)),
    perWindowFlatReturn: interval(rows.map((r) => r.flat.ret)),
    perWindowScore: interval(rows.map((r) => r.score)),
    meanGrossReturnPerTrip: meanGross,
    windowsTraded: traded, windowsWonVsRandom: wins,
    signTestVsRandom: signTest(wins, rows.length),
    beatsRandom: brain.returnOnDeployed > random.returnOnDeployed,
    beatsNeverTrade: brain.returnOnDeployed > flat.returnOnDeployed,
    clearsFeeBar: meanGross > FEE_ROUND_TRIP,
    refused: arms.refused, openAtEnd: arms.openAtEnd, borderDropped: arms.dropped,
    controlCollisions: arms.collisions,
    rows,
  };
}

const best = bestGenome || { ...INCUMBENT };
const trainArms = threeArms(TRAIN, best, 'final.train');
const holdoutArms = threeArms(HOLDOUT, best, 'final.holdout');
const incumbentHoldout = threeArms(HOLDOUT, INCUMBENT, 'final.holdout');
const trainS = summarise(trainArms, 'train');
const holdS = summarise(holdoutArms, 'holdout');
const incS = summarise(incumbentHoldout, 'holdout.incumbent');

// The same genome on the same windows a second time has to give the same book. A replay
// that is not deterministic cannot support a comparison between arms at all.
const repeat = summarise(threeArms(HOLDOUT, best, 'final.holdout'), 'holdout.repeat');
const deterministic = repeat.brain.net === holdS.brain.net && repeat.brain.trips === holdS.brain.trips &&
  repeat.random.net === holdS.random.net && repeat.flat.deployed === holdS.flat.deployed;

out('best genome, generation ' + bestGen + ' of ' + GENERATIONS + ': ' + GENES.map((g) => g.name + ' ' + f(best[g.name], 4)).join(', '));
out('incumbent (the venue.trader declared defaults): ' + GENES.map((g) => g.name + ' ' + f(INCUMBENT[g.name], 4)).join(', '));
out('');
for (const s of [trainS, holdS]) {
  out(s.label.toUpperCase() + ', ' + s.windows + ' windows, three arms interleaved per window');
  out('  arm           trips   net quote   deployed quote   return on deployed        per window mean   95% interval, both edges');
  const line = (name, arm, iv) => out('  ' + name.padEnd(13) +
    String(arm.trips).padStart(5) + '  ' + f(arm.net, 6).padStart(10) + '  ' + f(arm.deployed, 6).padStart(15) + '   ' +
    pct(arm.returnOnDeployed, 4).padStart(18) + '   ' + pct(iv.mean, 4).padStart(20) + '   [' + pct(iv.lo, 4) + ', ' + pct(iv.hi, 4) + ']');
  line('brain', s.brain, s.perWindowBrainReturn);
  line('random', s.random, s.perWindowRandomReturn);
  line('never trade', s.flat, s.perWindowFlatReturn);
  out('  brain minus random, per window: mean ' + pct(s.perWindowScore.mean, 4) + '  95% [' + pct(s.perWindowScore.lo, 4) + ', ' + pct(s.perWindowScore.hi, 4) + ']  n ' + s.perWindowScore.n + '  sd ' + f(s.perWindowScore.sd, 6));
  out('  won ' + s.windowsWonVsRandom + ' of ' + s.windows + ' windows against its own control (sign test p ' + s.signTestVsRandom.toFixed(6) + '), traded on ' + s.windowsTraded);
  out('  mean gross return per round trip ' + pct(s.meanGrossReturnPerTrip, 4) + ' against the ' + pct(FEE_ROUND_TRIP, 2) + ' borrowed fee bar: clears it ' + s.clearsFeeBar);
  out('');
}
out('the incumbent defaults on the SAME holdout windows: return on deployed ' + pct(incS.brain.returnOnDeployed, 4) +
    ', per window mean ' + pct(incS.perWindowBrainReturn.mean, 4) + ' 95% [' + pct(incS.perWindowBrainReturn.lo, 4) + ', ' + pct(incS.perWindowBrainReturn.hi, 4) + '], trips ' + incS.brain.trips);
out('so the search MOVED holdout return on deployed by ' + pct(holdS.brain.returnOnDeployed - incS.brain.returnOnDeployed, 4) + ' against the incumbent it started from (a negative number here means the search made the holdout worse)');
out('selection against drift on train: best ' + f(bestFitness, 6) + ' selected vs ' + f(driftBestFitness, 6) + ' drift, over ' + GENERATIONS + ' generations and ' + evalCount + ' evaluations');
out('');

// ---------------------------------------------------------------- the claim
const claim = holdS.brain.trips === 0
  ? 'the evolved trader opened no round trip on any holdout window: there is nothing here to compare with a control'
  : (holdS.beatsRandom
    ? (holdS.beatsNeverTrade
      ? (holdS.clearsFeeBar
        ? 'the evolved trader beats its matched random control AND never trade on the holdout windows AND clears the borrowed fee bar'
        : 'the evolved trader beats its matched random control and never trade on the holdout windows but does NOT clear the borrowed fee bar: nothing here is purchasable')
      : 'the evolved trader beats its matched random control on the holdout windows but does NOT beat never trade: doing nothing was better')
    : 'the evolved trader does NOT beat its matched random control on the holdout windows');
const searchClaim = bestFitness > driftBestFitness
  ? 'selection beat drift on the train windows by ' + f(bestFitness - driftBestFitness, 6) + ' of return on deployed'
  : 'selection did NOT beat drift on the train windows: the rising best-so-far curve is what a random walk does';
// The denominator nobody quotes. A search is priced by what it had to grade on, and what
// this one had to grade on is round trips, not evaluations: a five gene space moved several
// hundred times against a handful of closed trades is a search with more ways to move than
// the measurement has evidence to move it with.
const budget = 'BUDGET: ' + evalCount + ' evaluations over ' + GENES.length + ' genes, graded on ' +
  trainS.brain.trips + ' closed round trips across ' + TRAIN.length + ' train windows (' +
  trainS.windowsTraded + ' of them traded at all), and checked on ' + holdS.brain.trips +
  ' round trips across ' + HOLDOUT.length + ' holdout windows';
const generalises = holdS.perWindowScore.lo > 0
  ? 'the holdout interval excludes zero at both edges'
  : 'the holdout interval includes zero, so this search has not shown a difference from its control';

const checks = {
  // Every arm SAW the whole tape. Three arms on one window means three replays of that
  // window, so the readings each arm's sense emitted have to agree, or one arm is being
  // compared on less of the market than the others.
  everyArmSawTheSameTape: trainS.readingsSeen.brain === trainS.readingsSeen.random && trainS.readingsSeen.brain === trainS.readingsSeen.flat &&
    holdS.readingsSeen.brain === holdS.readingsSeen.random && holdS.readingsSeen.brain === holdS.readingsSeen.flat && holdS.readingsSeen.flat > 0,
  brainArmTraded: trainS.brain.trips > 0 || holdS.brain.trips > 0,
  randomArmIsRateMatched: Math.abs(trainS.random.trips - trainS.brain.trips) <= trainS.controlCollisions &&
    Math.abs(holdS.random.trips - holdS.brain.trips) <= holdS.controlCollisions,
  neverTradeDeployedNothing: trainS.flat.trips === 0 && holdS.flat.trips === 0 &&
    trainS.flat.deployed === 0 && holdS.flat.deployed === 0 && trainS.flat.net === 0 && holdS.flat.net === 0,
  noOrderRefused: trainS.refused === 0 && holdS.refused === 0,
  nothingOpenAtEnd: trainS.openAtEnd === 0 && holdS.openAtEnd === 0,
  nothingDroppedAtTheBorder: trainS.borderDropped === 0 && holdS.borderDropped === 0,
  trainAndHoldoutInstrumentsDisjoint: disjoint,
  everyTripPaidTheFee: holdS.brain.trips === 0 || Math.abs(holdS.brain.fees - FEE_ROUND_TRIP * holdS.brain.deployed) < 1e-9,
  deterministic,
  populationsStepped: history.length === GENERATIONS,
  // The hosting figure is only worth publishing if the suite is reachable at all and the
  // call is stable: an unreachable suite would make the printed accuracy a number about
  // nothing, and a call that answers differently twice cannot be quoted anywhere.
  venueSuiteIsHostable: hosting.hostable.includes('venue') && hosting.eligible.includes('venue'),
  hostingFigureRepeats: hosting.repeats,
};
const sound = Object.values(checks).every(Boolean);

const verdict = {
  at: new Date().toISOString(),
  node: process.version, cpus: cpus().length, platform: process.platform,
  command: COMMAND,
  config: { ...CONFIG },
  canonicalConfig: { ...CANON }, isCanonicalConfig: IS_CANON,
  out: 'bench/verdicts/' + OUT_NAME + '.json',
  hosting,
  tape: { synthetic, venue: venueName, instrumentPool: pool, drawSeed: VENUE_DRAW_SEED, drawMs: Math.round(drawMs), trainInstruments: [...trainInstruments], holdoutInstruments: [...holdoutInstruments], disjoint },
  fee: { ...FEE_SOURCE, value: FEE_ROUND_TRIP, borrowed: true },
  genes: GENES, incumbent: INCUMBENT,
  best: { genome: best, trainFitness: bestFitness, foundAtGeneration: bestGen },
  drift: { bestGenome: driftBestGenome, bestFitness: driftBestFitness },
  evaluations: evalCount,
  history,
  train: trainS, holdout: holdS, incumbentOnHoldout: incS,
  claim, searchClaim, generalises, budget,
  evaluationsPerTrainTrip: trainS.brain.trips > 0 ? evalCount / trainS.brain.trips : null,
  checks, sound,
  verdict: sound ? 'GREEN' : 'RED',
};
mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
writeFileSync(OUT, JSON.stringify(verdict, null, 2));

out('WROTE bench/verdicts/' + OUT_NAME + '.json' + (IS_CANON ? '' : ', NOT the canonical venue-suite.json'));
out('CLAIM: ' + claim);
out('SEARCH: ' + searchClaim);
out(budget);
out('GENERALISES: ' + generalises);
out('VENUE SUITE ' + verdict.verdict + ': ' + Object.entries(checks).map(([k, v]) => k + ' ' + v).join(', '));
process.exit(sound ? 0 : 1);
