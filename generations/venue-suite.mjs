// generations/venue-suite.mjs: GENERATIONS ON THE FULL TAPE. The trader's genome, evolved.
//
// What evolves is the decision cell: a genome is exactly the params venue.trader reads
// (world/venue.mjs, TRADER_DEFAULTS), so an evolved genome drops into the organism as the
// cell's params with nothing translated. What it is graded on is every recorded pumpswap
// instrument with enough readings, packed once into typed arrays and replayed through
// traderDecide, the cell's own decision function, at the payable price with the fee charged.
//
// WHY NOT scoreSuitesFor. The board 1 venue suite graded an organism by its kind set, and
// every organism that held the three venue kinds scored the same number: no gradient. The
// gradient here is the net after the fee per round trip on the TRAINING instruments, which
// moves with every gene.
//
// THE EPOCHS API. VenueEpochs extends generations/epochs.mjs Epochs and VenueArchive
// extends its OrganismArchive; epochs.mjs is imported, never edited. Kept from the parent:
// the seeded RNG stream, the generation counter, the history rows, the years clock and its
// arithmetic (a tick here is one recorded reading replayed, and secondsPerTick is the tape's
// measured cadence, so the clock counts market time replayed, printed with its arithmetic
// and never as a headline). Replaced: what a genome is, how one is evaluated, and the grid
// the archive bins by (trips per instrument, readings held, entry direction).
//
// THE CONTROLS. A trader number means nothing alone, so every arm here is scored on the
// same instruments:
//
//   evolved   the best genome of the search
//   control   the SAME number of round trips on each instrument, entered at random at
//             readings where a buy can fill, and exited by the SAME exit rule with the same
//             genome (trail, take profit, holding cap): it has every piece of the evolved
//             trader except the entry decision
//   hold      one round trip per instrument, first fillable reading to the last reading
//
// and the comparison is PAIRED BY INSTRUMENT: one gap per holdout instrument, a 95 percent
// interval on the mean gap, and nFor95, the number of instruments the observed mean and
// spread would need before the interval excluded zero.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RNG, hash32 } from '../core/rng.mjs';
import { Brain } from '../core/brain.mjs';
import { Epochs, OrganismArchive, SECONDS_PER_YEAR } from './epochs.mjs';
import { attachWorld, closeWorld, bookOf, resetTape } from '../world/index.mjs';
import {
  normalizeTrader, replayTrader, replayControl, replayHold, ceilingOf, newAcc,
  packTape, readingsOf, replayTapeOf, TRADER_DEFAULTS,
  attachSensors, gateAdmits, exitWhy, admitsBuy, payableBuy, tripFrom, replayAgeControl,
  SENSOR_WINDOW, SENSOR_NAMES,
} from '../world/venue.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const BRAIN_ROOT = path.resolve(HERE, '..');

// ---------------------------------------------------------------- the genome
// One entry per gene. u is the gene's position in [0, 1]; log genes move in log space so a
// step means the same ratio at both ends. An `off` gene can be switched off entirely
// (value 0), which the decision reads as "this test is not applied".
export const VENUE_GENES = Object.freeze([
  { name: 'lookback', lo: 1, hi: 30, int: true, log: true },
  { name: 'entryUp', lo: 0.001, hi: 0.6, log: true },
  { name: 'entryDir', values: [1, -1] },
  { name: 'trail', lo: 0.01, hi: 0.95, log: true },
  { name: 'maxHold', lo: 1, hi: 150, int: true, log: true },
  { name: 'takeProfit', lo: 0.02, hi: 5, log: true, off: true },
  { name: 'minQuote', lo: 2, hi: 2000, log: true, off: true },
  { name: 'maxEntryStep', lo: 2, hi: 180, int: true, log: true, off: true },
]);

/** The trader that shipped before any search: venue.trader's defaults. */
export const INCUMBENT = Object.freeze({
  lookback: TRADER_DEFAULTS.lookback, entryUp: TRADER_DEFAULTS.entryUp, entryDir: TRADER_DEFAULTS.entryDir,
  trail: TRADER_DEFAULTS.trail, maxHold: TRADER_DEFAULTS.maxHold, takeProfit: 0, minQuote: 0, maxEntryStep: 0,
});

const toU = (g, v) => (g.log ? Math.log(v / g.lo) / Math.log(g.hi / g.lo) : (v - g.lo) / (g.hi - g.lo));
const fromU = (g, u) => {
  const x = Math.min(1, Math.max(0, u));
  let v = g.log ? g.lo * Math.pow(g.hi / g.lo, x) : g.lo + x * (g.hi - g.lo);
  if (g.int) v = Math.round(v);
  return Math.min(g.hi, Math.max(g.lo, v));
};
const reflect = (u) => { let x = u; while (x < 0 || x > 1) x = x < 0 ? -x : 2 - x; return x; };

/** A genome drawn uniformly (in each gene's own space) from the gene box. */
export function randomVenueGenome(rng) {
  const g = {};
  for (const gene of VENUE_GENES) {
    if (gene.values) { g[gene.name] = gene.values[rng.int(gene.values.length)]; continue; }
    if (gene.off && rng.next() < 0.5) { g[gene.name] = 0; continue; }
    g[gene.name] = fromU(gene, rng.next());
  }
  return g;
}

/** Clamp every gene into its box; a missing gene takes the incumbent's value. */
export function clampVenueGenome(genome) {
  const g = {};
  for (const gene of VENUE_GENES) {
    const v = genome[gene.name] ?? INCUMBENT[gene.name];
    if (gene.values) { g[gene.name] = gene.values.includes(v) ? v : gene.values[0]; continue; }
    if (gene.off && !(Number(v) > 0)) { g[gene.name] = 0; continue; }
    g[gene.name] = fromU(gene, toU(gene, Math.min(gene.hi, Math.max(gene.lo, Number(v)))));
  }
  return g;
}

/** Each gene moves with probability rate / genes: a gaussian step in its own space. */
export function mutateVenueGenome(parent, rng, { rate = 2, sigma = 0.12 } = {}) {
  const g = { ...parent };
  const p = rate / VENUE_GENES.length;
  let moved = 0;
  for (const gene of VENUE_GENES) {
    if (rng.next() >= p) continue;
    moved++;
    if (gene.values) { g[gene.name] = gene.values[(gene.values.indexOf(g[gene.name]) + 1) % gene.values.length]; continue; }
    if (gene.off) {
      if (!(g[gene.name] > 0)) { g[gene.name] = fromU(gene, rng.next()); continue; }
      if (rng.next() < 0.15) { g[gene.name] = 0; continue; }
    }
    g[gene.name] = fromU(gene, reflect(toU(gene, g[gene.name]) + sigma * rng.gauss()));
  }
  if (!moved) return mutateVenueGenome(parent, rng, { rate, sigma });
  return g;
}

/** Uniform crossover, gene by gene. */
export function crossVenueGenomes(a, b, rng) {
  const g = {};
  for (const gene of VENUE_GENES) g[gene.name] = rng.next() < 0.5 ? a[gene.name] : b[gene.name];
  return g;
}

export const venueKeyOf = (g) => VENUE_GENES.map((x) => g[x.name]).join('|');

/**
 * The decision params a genome means on the full tape. maxOpen is not a gene: every
 * instrument is its own book, so a cap across instruments never binds in the kernel, and it
 * is set out of reach so the organism cross check does not bind it either.
 */
export function traderParamsOf(genome, o) {
  return normalizeTrader({ ...clampVenueGenome(genome), size: o.size, maxOpen: 1e9 });
}

// ---------------------------------------------------------------- one evaluation
/**
 * The fitness of a genome on a set of instruments: the net after the fee per round trip.
 * A genome with fewer than minTrips trips is not a trader the search may pick, because on
 * a tape where most trips lose the fee the best score of all would otherwise belong to the
 * genome that never trades (0 beats every loss). It scores -3 + trips / minTrips instead,
 * which lies in [-3, -2): always under any real trader, because a trip can lose at most
 * 1 + fee of its size and the fee is under 1, and rising as it trades more, so the search
 * still has a slope to climb out of the empty region. (-2 + trips / minTrips, the first
 * version, rose ABOVE -(1 + fee) once minTrips passed 22.)
 */
export function fitnessOf(net, trips, minTrips) {
  return trips >= minTrips && trips > 0 ? net / trips : -3 + trips / Math.max(1, minTrips);
}
/**
 * One evaluation: the trader on every instrument of idxs, summed.
 */
export function evaluateVenueGenome(tape, idxs, genome, o, { minTrips = 1 } = {}) {
  const q = traderParamsOf(genome, o);
  const acc = newAcc();
  let readings = 0;
  for (let t = 0; t < idxs.length; t++) {
    const i = idxs[t];
    readings += tape.off[i + 1] - tape.off[i];
    replayTrader(tape, i, q, o, acc);
  }
  const fitness = fitnessOf(acc.net, acc.trips, minTrips);
  return {
    fitness, trips: acc.trips, net: acc.net, netPerTrip: acc.trips ? acc.net / acc.trips : 0,
    grossPerTrip: acc.trips ? acc.gross / acc.trips : 0, meanHeld: acc.trips ? acc.held / acc.trips : 0,
    entries: acc.entries, buys: acc.buys, impactRefused: acc.impactRefused, failed: acc.failed,
    liqTrips: acc.liqTrips, liqNet: acc.liqNet, readings,
    descriptors: { tripsPerInstrument: idxs.length ? acc.trips / idxs.length : 0, meanHeld: acc.trips ? acc.held / acc.trips : 0, entryDir: q.entryDir },
  };
}

// ---------------------------------------------------------------- the archive
// Its own grid: how often the genome trades, how long it holds, which way it enters. One
// elite per cell, so the search keeps traders that behave differently and not only the
// single best one.
export const VENUE_AXES = Object.freeze([
  { key: 'tripsPerInstrument', edges: [0.02, 0.1, 0.3, 0.7, 1.5, 3] },
  { key: 'meanHeld', edges: [2, 4, 8, 16, 32, 64] },
]);
export function venueBinOf(desc) {
  const parts = [];
  for (const ax of VENUE_AXES) {
    const v = Number(desc[ax.key]);
    let b = 0;
    while (b < ax.edges.length && Number.isFinite(v) && v > ax.edges[b]) b++;
    parts.push(b);
  }
  parts.push(desc.entryDir < 0 ? 'd' : 'm');
  return parts.join('-');
}
export function venueGridCapacity() { return VENUE_AXES.reduce((a, ax) => a * (ax.edges.length + 1), 1) * 2; }

export class VenueArchive extends OrganismArchive {
  add(entry) {
    this.stats.evaluated++;
    const key = venueBinOf(entry.descriptors);
    const held = this.cells.get(key);
    const e = {
      key, id: entry.id, fitness: entry.fitness, components: entry.components, descriptors: entry.descriptors,
      vector: VENUE_AXES.map((ax) => Math.log1p(Math.max(0, Number(entry.descriptors[ax.key]) || 0))).concat([entry.descriptors.entryDir < 0 ? 1 : 0]),
      gen: entry.gen ?? 0, genome: { ...entry.genome }, parents: entry.parents || [],
    };
    if (!held) { this.cells.set(key, e); this.stats.placed++; return { placed: true, key, replacedId: null, first: true }; }
    if (entry.fitness > held.fitness) { this.cells.set(key, e); this.stats.replaced++; return { placed: true, key, replacedId: held.id, first: false }; }
    this.stats.rejected++;
    return { placed: false, key, replacedId: null, first: false };
  }
}

// ---------------------------------------------------------------- the engine
export class VenueEpochs extends Epochs {
  /**
   * @param {object} opts
   * @param {object} opts.tape        a packed tape
   * @param {Int32Array} opts.train   the instruments the search may see
   * @param {object} opts.o           { size, fee, maxImpact, lag }
   * @param {number} [opts.minTrips]  the trip floor of the fitness
   * @param {number} [opts.secondsPerTick] market seconds one reading stands for
   */
  constructor({ tape, train, o, seed = 'venue.epochs', popSize = 64, minTrips = 1, secondsPerTick = 20, elite = 16, crossoverRate = 0.3, mutationRate = 2 } = {}) {
    let readings = 0;
    for (const i of train) readings += tape.off[i + 1] - tape.off[i];
    super({ seed, popSize, ticks: readings, windows: 2, checkpointEvery: 0, secondsPerTick, suites: false, emit: false, crossoverRate, mutationRate });
    this.tape = tape; this.train = train; this.o = o; this.minTrips = minTrips;
    this.eliteSize = elite;
    this.archive = new VenueArchive();
    this.top = [];          // the best genomes ever evaluated, by fitness, at most eliteSize
    this.seen = new Map();  // genome key -> evaluation, so a genome is never paid for twice
    this.evaluations = 0;
    this.cacheHits = 0;
  }

  manifest() {
    return {
      seed: this.seed, popSize: this.popSize, readingsPerEvaluation: this.ticks, trainInstruments: this.train.length,
      secondsPerTick: this.secondsPerTick, secondsPerYear: SECONDS_PER_YEAR,
      fitness: 'net after the fee per round trip on the training instruments; a genome under minTrips = ' + this.minTrips + ' trips scores -3 + trips / minTrips, under any real trader',
      genes: VENUE_GENES.map((g) => g.name), crossoverRate: this.crossoverRate, mutationRate: this.mutationRate,
      elite: this.eliteSize, grid: VENUE_AXES.map((a) => a.key).concat(['entryDir']), gridCapacity: venueGridCapacity(),
    };
  }

  init() {
    this.seedGenomes = [{ ...INCUMBENT }];
    for (let i = 1; i < this.popSize; i++) this.seedGenomes.push(randomVenueGenome(this.rng));
    return this;
  }

  population() {
    if (!this.archive.fill()) return (this.seedGenomes || this.init().seedGenomes).map((g) => ({ ...g }));
    const elites = this.archive.elites();
    const pickParent = () => {
      // half the parents are the best ever seen (exploitation), half any elite of the grid
      if (this.top.length && this.rng.next() < 0.5) {
        const a = this.top[this.rng.int(this.top.length)], b = this.top[this.rng.int(this.top.length)];
        return (a.fitness >= b.fitness ? a : b).genome;
      }
      return elites[this.rng.int(elites.length)].genome;
    };
    const out = [];
    for (let k = 0; k < this.popSize; k++) {
      let child;
      if (this.rng.next() < this.crossoverRate) {
        child = mutateVenueGenome(crossVenueGenomes(pickParent(), pickParent(), this.rng), this.rng, { rate: Math.max(1, this.mutationRate - 1) });
      } else {
        child = mutateVenueGenome(pickParent(), this.rng, { rate: this.mutationRate });
      }
      out.push(clampVenueGenome(child));
    }
    return out;
  }

  evaluate(genome) {
    const key = venueKeyOf(genome);
    const hit = this.seen.get(key);
    if (hit) { this.cacheHits++; return hit; }
    const ev = evaluateVenueGenome(this.tape, this.train, genome, this.o, { minTrips: this.minTrips });
    this.seen.set(key, ev);
    this.evaluations++;
    this.totalTicks += ev.readings;
    this.totalOrganisms++;
    return ev;
  }

  step() {
    const t0 = process.hrtime.bigint();
    const pop = this.population();
    const before = this.archive.fill();
    let placed = 0, replaced = 0, fresh = 0;
    const fits = [];
    for (let k = 0; k < pop.length; k++) {
      const genome = pop[k];
      const had = this.evaluations;
      const ev = this.evaluate(genome);
      if (this.evaluations > had) fresh++;
      fits.push(ev.fitness);
      const id = 'vg' + this.generation + '-' + k;
      const r = this.archive.add({ id, genome, fitness: ev.fitness, components: { trips: ev.trips, netPerTrip: ev.netPerTrip, meanHeld: ev.meanHeld }, descriptors: ev.descriptors, gen: this.generation });
      if (r.placed) { placed++; if (!r.first) replaced++; }
      this.offerTop({ id, genome, fitness: ev.fitness, ev });
    }
    this.generation++;
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    this.stats.evalMs += ms;
    this.archive.fillHistory.push([this.generation, this.archive.fill()]);
    const best = this.top[0];
    const row = {
      gen: this.generation, evaluated: pop.length, fresh, placed, replaced,
      fillBefore: before, fill: this.archive.fill(),
      best: best ? best.fitness : 0, bestTrips: best ? best.ev.trips : 0,
      genBest: fits.length ? Math.max(...fits) : 0,
      genMean: fits.length ? fits.reduce((a, v) => a + v, 0) / fits.length : 0,
      ms: Number(ms.toFixed(1)), evaluationsPerSecond: ms > 0 ? Number((fresh / (ms / 1000)).toFixed(1)) : 0,
      years: this.years().years,
    };
    this.history.push(row);
    return row;
  }

  offerTop(entry) {
    const key = venueKeyOf(entry.genome);
    if (this.top.some((t) => venueKeyOf(t.genome) === key)) return;
    this.top.push(entry);
    this.top.sort((a, b) => b.fitness - a.fitness);
    if (this.top.length > this.eliteSize) this.top.length = this.eliteSize;
  }

  best() { return this.top[0] || null; }

  summary() {
    const y = this.years();
    const b = this.best();
    return {
      generations: this.generation, evaluations: this.evaluations, cacheHits: this.cacheHits,
      readingsReplayed: this.totalTicks, marketYearsReplayed: y.years,
      yearsArithmetic: this.evaluations + ' evaluations x ' + this.ticks + ' readings = ' + this.totalTicks + ' readings; x ' +
        this.secondsPerTick + ' s per reading = ' + (this.totalTicks * this.secondsPerTick).toFixed(0) + ' market-seconds; / ' +
        SECONDS_PER_YEAR + ' s per year = ' + y.years.toExponential(4) + ' market-years replayed',
      archiveFill: this.archive.fill(), archiveCapacity: venueGridCapacity(), archiveStats: this.archive.stats,
      best: b ? { id: b.id, genome: clampVenueGenome(b.genome), fitness: b.fitness, trips: b.ev.trips, netPerTrip: b.ev.netPerTrip } : null,
      evalMs: this.stats.evalMs,
    };
  }
}

// ---------------------------------------------------------------- the three arms
/**
 * The evolved trader, its matched random control and hold, on the same instruments, with
 * one number per instrument per arm (the sum of that instrument's trip returns, as a
 * fraction of size). The control's number on an instrument is the evolved trip count times
 * the control's mean return per trip over o.draws random draws there, so it is trip matched
 * by construction and its own noise is averaged down.
 */
export function evaluateArms(tape, idxs, genome, o, seed = 'venue.arms') {
  const q = traderParamsOf(genome, o);
  const rng = new RNG(seed + ':control');
  const n = idxs.length;
  const ev = new Float64Array(n), ct = new Float64Array(n), hd = new Float64Array(n), k = new Int32Array(n);
  const accE = newAcc(), accC = newAcc(), accH = newAcc();
  let controlTrips = 0, matched = 0;
  for (let t = 0; t < n; t++) {
    const i = idxs[t];
    const before = accE.trips;
    ev[t] = replayTrader(tape, i, q, o, accE);
    k[t] = accE.trips - before;
    if (k[t] > 0) {
      const c = replayControl(tape, i, q, k[t], rng, o, accC);
      controlTrips += c.trips;
      ct[t] = c.trips ? k[t] * (c.net / c.trips) : 0;
      if (c.trips) matched += k[t];
    }
    hd[t] = replayHold(tape, i, o, accH);
  }
  const sum = (a) => { let s = 0; for (let t = 0; t < a.length; t++) s += a[t]; return s; };
  const tripsE = accE.trips;
  return {
    instruments: n, perInstrument: { evolved: ev, control: ct, hold: hd, trips: k },
    evolved: { trips: tripsE, net: sum(ev), netPerTrip: tripsE ? sum(ev) / tripsE : 0, grossPerTrip: tripsE ? accE.gross / tripsE : 0, meanHeld: tripsE ? accE.held / tripsE : 0, impactRefused: accE.impactRefused, liqTrips: accE.liqTrips, liqNet: accE.liqNet, instrumentsTraded: Array.from(k).filter((x) => x > 0).length },
    control: { tripsMatched: matched, drawnTrips: controlTrips, draws: o.draws, collisions: accC.collisions, net: sum(ct), netPerTrip: matched ? sum(ct) / matched : 0, drawnNetPerTrip: accC.trips ? accC.net / accC.trips : 0, liqTrips: accC.liqTrips, liqNet: accC.liqNet, matchedShare: tripsE ? matched / tripsE : 1, fillShare: tripsE && o.draws ? controlTrips / (o.draws * tripsE) : 0 },
    hold: { trips: accH.trips, net: sum(hd), netPerTrip: accH.trips ? sum(hd) / accH.trips : 0, noEntry: accH.noEntry, liqTrips: accH.liqTrips, liqNet: accH.liqNet },
  };
}

/** The entry ceiling over a set of instruments: how many clear the fee at all. */
export function ceilingOver(tape, idxs, o) {
  let clears = 0, clearsSwapOnly = 0, noEntry = 0;
  const bests = [];
  for (const i of idxs) {
    const c = ceilingOf(tape, i, o);
    if (c.entries === 0) noEntry++;
    if (c.best > 0) clears++;
    if (c.swapOnly > 0) clearsSwapOnly++;
    if (Number.isFinite(c.best)) bests.push(c.best);
  }
  bests.sort((a, b) => a - b);
  const qt = (p) => (bests.length ? bests[Math.min(bests.length - 1, Math.floor(p * bests.length))] : null);
  return {
    instruments: idxs.length, clears, clearsSwapOnly, noEntry,
    share: idxs.length ? clears / idxs.length : 0, shareSwapOnly: idxs.length ? clearsSwapOnly / idxs.length : 0,
    bestTrip: { p10: qt(0.1), median: qt(0.5), p90: qt(0.9), max: bests.length ? bests[bests.length - 1] : null },
  };
}

// ---------------------------------------------------------------- paired statistics
/**
 * One gap per instrument. The interval is mean +- 1.96 standard errors (a normal interval:
 * the n here is hundreds), a seeded percentile bootstrap is reported beside it as a second
 * ruler because a few instruments carry most of the spread, and nFor95 is the number of
 * instruments the observed mean and sd would need before the normal interval excluded zero:
 * ceil((1.96 sd / |mean|)^2).
 */
export function pairedStats(xs, { boot = 2000, seed = 'venue.boot' } = {}) {
  const a = Array.from(xs);
  const n = a.length;
  if (!n) return { n: 0, mean: 0, sd: 0, se: 0, lo: 0, hi: 0, nFor95: null, bootLo: 0, bootHi: 0, positive: 0, negative: 0, zero: 0, excludesZero: false };
  let s = 0;
  for (const x of a) s += x;
  const mean = s / n;
  let v = 0;
  for (const x of a) v += (x - mean) * (x - mean);
  const sd = n > 1 ? Math.sqrt(v / (n - 1)) : 0;
  const se = sd / Math.sqrt(n);
  const lo = mean - 1.96 * se, hi = mean + 1.96 * se;
  const nFor95 = mean !== 0 && sd > 0 ? Math.ceil(Math.pow(1.96 * sd / Math.abs(mean), 2)) : (mean !== 0 ? 1 : null);
  const rng = new RNG(seed);
  const means = new Float64Array(boot);
  for (let b = 0; b < boot; b++) {
    let t = 0;
    for (let k = 0; k < n; k++) t += a[rng.int(n)];
    means[b] = t / n;
  }
  means.sort();
  const bootLo = boot ? means[Math.floor(0.025 * boot)] : lo;
  const bootHi = boot ? means[Math.min(boot - 1, Math.floor(0.975 * boot))] : hi;
  return {
    n, mean, sd, se, lo, hi, nFor95, bootLo, bootHi, boot,
    positive: a.filter((x) => x > 0).length, negative: a.filter((x) => x < 0).length, zero: a.filter((x) => x === 0).length,
    excludesZero: lo > 0 || hi < 0, bootExcludesZero: bootLo > 0 || bootHi < 0,
  };
}

/** evolved minus another arm, per instrument. */
export function gapsOf(a, b) {
  const out = new Float64Array(a.length);
  for (let t = 0; t < a.length; t++) out[t] = a[t] - b[t];
  return out;
}

// ---------------------------------------------------------------- the organism, checked
/**
 * Run a genome through the ORGANISM (sense.venue, venue.trader, the gate, world.venue) on a
 * handful of instruments of a packed tape, and through the kernel on the same readings, and
 * compare the two books trip by trip. The instruments are cut to one common length and put
 * on one clock so the organism perceives them interleaved, which is the condition under
 * which its fill lands exactly one reading after the decision (the kernel's lag 1).
 * @returns {{ instruments, readings, organismTrips, kernelTrips, identical, maxAbsDiff, lag, refused }}
 */
export function organismAgrees(tape, idxs, genome, o, { cadenceMs = 20000, params = null } = {}) {
  if (idxs.length < 3) throw new Error('organismAgrees needs at least three instruments to interleave');
  let len = Infinity;
  for (const i of idxs) len = Math.min(len, tape.off[i + 1] - tape.off[i]);
  // the age, births and origin each reading carries travel with it, so the sensors the
  // organism computes from the replay are the sensors the kernel reads from its columns
  const list = Array.from(idxs).map((i, r) => ({
    id: tape.ids[i], migrated: tape.migrated ? tape.migrated[i] === 1 : false,
    readings: readingsOf(tape, i).slice(0, len).map((x, s) => ({ tMs: 1757000000000 + s * cadenceMs + r * 7, ageS: x.ageS, births: x.births, quote: x.quote, base: x.base })),
  }));
  const packed = attachSensors(packTape(list, { source: 'check', venue: tape.venue || 'pumpswap' }));
  const replay = replayTapeOf(list, { db: tape.db || null, venue: tape.venue || 'pumpswap', source: tape.db ? 'trader.db' : 'synthetic', synthetic: !tape.db });
  // params: the venue.trader params as the organism reads them (board 11 sensor genomes);
  // otherwise the board 8 genome through traderParamsOf
  const traderParams = params ? { ...params, size: o.size, maxOpen: 1e9 } : { ...clampVenueGenome(genome), size: o.size, maxOpen: 1e9 };
  const q = params ? normalizeTrader(traderParams) : traderParamsOf(genome, o);
  const kernel = [];
  for (let i = 0; i < packed.instruments; i++) {
    const acc = newAcc();
    replayTrader(packed, i, q, o, acc, (t) => kernel.push({ instrument: packed.ids[i], entry: t.entryFill, exit: t.exitFill, pnl: t.ret * o.size }));
  }
  const policy = {
    venue: {
      enabled: true, paper: true, tapes: replay.db ? [replay.db] : [], venues: [replay.venue],
      allowSynthetic: !!replay.synthetic, feeRoundTrip: o.fee, maxNotional: o.size, maxReadings: 1000000,
    },
  };
  resetTape(replay);
  const brain = new Brain({ name: 'venue-check', seed: 'venue-check', growth: false, pruneEvery: 0, ledger: 'runs' });
  let organism = [], b = null;
  try {
    attachWorld(brain, policy, {
      actuators: false, senses: false, listen: false, wire: false, tape: replay,
      venue: { size: o.size, decide: 'trader', trader: traderParams, feeRoundTrip: o.fee, feeLegs: !!o.legs, maxImpact: o.maxImpact },
    });
    const sense = brain.cell('w.venue'), book = brain.cell('w.book'), cell = brain.cell('w.decide');
    const motor = brain.cell('w.motor'), percept = brain.cell('w.percept');
    const cap = 40 * replay.readings + 4000;
    for (let t = 0; t < cap; t++) {
      brain.tick(1);
      const quiet = cell.state.queue.length === 0 && motor.state.queue.length === 0 && percept.state.queue.length === 0;
      if (sense.state.done && quiet && Object.keys(book.state.positions).length === 0) break;
    }
    b = bookOf(book);
    organism = b.trades.map((t) => ({ instrument: t.instrument, entry: t.entryStep, exit: t.exitStep, pnl: t.pnl }));
  } finally {
    closeWorld(brain);
  }
  const keyOf = (t) => t.instrument + ':' + t.entry + ':' + t.exit;
  const sortT = (arr) => arr.slice().sort((x, y) => (keyOf(x) < keyOf(y) ? -1 : keyOf(x) > keyOf(y) ? 1 : 0));
  const A = sortT(organism), B = sortT(kernel);
  let identical = A.length === B.length, maxAbsDiff = 0;
  for (let t = 0; identical && t < A.length; t++) {
    if (keyOf(A[t]) !== keyOf(B[t])) { identical = false; break; }
    maxAbsDiff = Math.max(maxAbsDiff, Math.abs(A[t].pnl - B[t].pnl));
  }
  if (maxAbsDiff > 1e-12) identical = false;
  return {
    instruments: idxs.length, readings: packed.readings, readingsPerInstrument: len,
    organismTrips: A.length, kernelTrips: B.length, identical, maxAbsDiff,
    lag: b ? b.meanLagReadings : null, refused: b ? b.refused : null, impactRefused: b ? b.impactRefused : null,
  };
}

// ================================================================ BOARD 11: THE SENSOR TRADER
// The board 8 genome decided on the price alone (a move of entryUp over lookback readings).
// The board 11 genome decides on the typed SENSORS the tape carries (world/venue.mjs,
// VENUE_SENSORS: real SOL, age, trading intervals, buy intervals, reserve slope, market
// births, migrated) through the venue.trader gate, with no price trigger at all (entryDir 0),
// and exits by a TRAILING exit whose parameters evolve too (trail, the gain that arms it, a
// stop loss, a take profit, a holding cap). A genome is still exactly the params the cell
// reads: sensorParamsOf is the whole translation.
//
// THE OBJECTIVE IS THE BAR'S OWN QUESTION, ASKED ON TRAIN. The holdout asks whether the
// sensor entries beat random entries AT THE SAME INSTRUMENT AGES with the same exit. So the
// fitness is not net per trip (which a search can raise by picking an age, and the age is
// matched away by the control): it is the per instrument sum of (trip return minus the mean
// return of every fillable entry in the same age bin under the same exit), and its t
// statistic over the instruments. Train is split in two folds by a stable hash; each fold's
// trips are compared with its OWN fold's age baseline (all its fillable entries, no sample),
// and the fitness is the smaller of the two t statistics, so an edge that lives in one half
// of the training instruments scores as the half where it does not. A gate on age alone
// scores about zero by construction: its trips ARE its bin's entries.
//
// Nothing here reads a holdout instrument: SensorEpochs is handed the train indices, and the
// baseline and the folds are built from them only (test/venue-sensors.test.mjs proves the
// search's history does not move when every holdout reading is scrambled).

/** One entry per gene; `part` says whether it gates the entry or shapes the exit. */
export const SENSOR_GENES = Object.freeze([
  { name: 'realSolMin', lo: 2, hi: 3000, log: true, off: true, pOff: 0.75, part: 'gate' },
  { name: 'realSolMax', lo: 10, hi: 6000, log: true, off: true, pOff: 0.75, part: 'gate' },
  { name: 'ageMin', lo: 10, hi: 3000, log: true, off: true, pOff: 0.75, part: 'gate' },
  { name: 'ageMax', lo: 30, hi: 4000, log: true, off: true, pOff: 0.75, part: 'gate' },
  { name: 'tradesMin', lo: 1, hi: SENSOR_WINDOW, int: true, off: true, pOff: 0.75, part: 'gate' },
  { name: 'buyersMin', lo: 1, hi: SENSOR_WINDOW, int: true, off: true, pOff: 0.75, part: 'gate' },
  { name: 'slopeMin', lo: -0.6, hi: 0.5, offNull: true, pOff: 0.75, part: 'gate' },
  { name: 'slopeMax', lo: -0.2, hi: 3, offNull: true, pOff: 0.75, part: 'gate' },
  { name: 'birthsMin', lo: 2, hi: 45, int: true, off: true, pOff: 0.75, part: 'gate' },
  { name: 'birthsMax', lo: 5, hi: 50, int: true, off: true, pOff: 0.75, part: 'gate' },
  { name: 'migrated', values: [-1, 0, 1], part: 'gate' },
  { name: 'maxEntries', lo: 1, hi: 6, int: true, off: true, pOff: 0.5, part: 'gate' },
  { name: 'trail', lo: 0.02, hi: 0.95, log: true, part: 'exit' },
  { name: 'trailArm', lo: 0.02, hi: 2, log: true, off: true, pOff: 0.5, part: 'exit' },
  { name: 'stopLoss', lo: 0.05, hi: 0.9, off: true, pOff: 0.5, part: 'exit' },
  { name: 'maxHold', lo: 1, hi: 180, int: true, log: true, part: 'exit' },
  { name: 'takeProfit', lo: 0.05, hi: 10, log: true, off: true, pOff: 0.5, part: 'exit' },
]);
export const EXIT_GENES = Object.freeze(SENSOR_GENES.filter((g) => g.part === 'exit').map((g) => g.name));

/** The sensor trader before any search: no gate at all (it enters wherever a buy fills), venue.trader's default trail and holding cap. */
export const SENSOR_BASE = Object.freeze({
  realSolMin: 0, realSolMax: 0, ageMin: 0, ageMax: 0, tradesMin: 0, buyersMin: 0,
  slopeMin: null, slopeMax: null, birthsMin: 0, birthsMax: 0, migrated: -1, maxEntries: 0,
  trail: TRADER_DEFAULTS.trail, trailArm: 0, stopLoss: 0, maxHold: TRADER_DEFAULTS.maxHold, takeProfit: 0,
});

const isOff = (gene, v) => (gene.offNull ? v === null || v === undefined || !Number.isFinite(Number(v)) : !(Number(v) > 0));
const offValue = (gene) => (gene.offNull ? null : 0);

/** A genome drawn from the gene box; a gate test is off with probability pOff. */
export function randomSensorGenome(rng) {
  const g = {};
  for (const gene of SENSOR_GENES) {
    if (gene.values) { g[gene.name] = gene.values[rng.int(gene.values.length)]; continue; }
    if ((gene.off || gene.offNull) && rng.next() < (gene.pOff ?? 0.5)) { g[gene.name] = offValue(gene); continue; }
    g[gene.name] = fromU(gene, rng.next());
  }
  return g;
}

/** Clamp every gene into its box; a missing gene takes SENSOR_BASE's value. */
export function clampSensorGenome(genome) {
  const g = {};
  for (const gene of SENSOR_GENES) {
    const v = genome[gene.name] === undefined ? SENSOR_BASE[gene.name] : genome[gene.name];
    if (gene.values) { g[gene.name] = gene.values.includes(v) ? v : gene.values[0]; continue; }
    if ((gene.off || gene.offNull) && isOff(gene, v)) { g[gene.name] = offValue(gene); continue; }
    g[gene.name] = fromU(gene, toU(gene, Math.min(gene.hi, Math.max(gene.lo, Number(v)))));
  }
  return g;
}

/** Each gene moves with probability rate / genes; an off gene switches on at a random value, an on gene switches off with probability 0.15. */
export function mutateSensorGenome(parent, rng, { rate = 2, sigma = 0.12 } = {}) {
  const g = { ...parent };
  const p = rate / SENSOR_GENES.length;
  let moved = 0;
  for (const gene of SENSOR_GENES) {
    if (rng.next() >= p) continue;
    moved++;
    if (gene.values) { g[gene.name] = gene.values[(gene.values.indexOf(g[gene.name]) + 1 + rng.int(gene.values.length - 1)) % gene.values.length]; continue; }
    if (gene.off || gene.offNull) {
      if (isOff(gene, g[gene.name])) { g[gene.name] = fromU(gene, rng.next()); continue; }
      if (rng.next() < 0.15) { g[gene.name] = offValue(gene); continue; }
    }
    g[gene.name] = fromU(gene, reflect(toU(gene, Number(g[gene.name])) + sigma * rng.gauss()));
  }
  if (!moved) return mutateSensorGenome(parent, rng, { rate, sigma });
  return g;
}

/** Uniform crossover, gene by gene. */
export function crossSensorGenomes(a, b, rng) {
  const g = {};
  for (const gene of SENSOR_GENES) g[gene.name] = rng.next() < 0.5 ? a[gene.name] : b[gene.name];
  return g;
}

export const sensorKeyOf = (g) => SENSOR_GENES.map((x) => String(g[x.name])).join('|');

/** The venue.trader params a sensor genome means: no price trigger, the gate, the trailing exit. */
export function sensorParamsOf(genome, o) {
  return { ...clampSensorGenome(genome), entryDir: 0, lookback: 1, entryUp: 0, minQuote: 0, maxEntryStep: 0, size: o.size, maxOpen: 1e9 };
}
/** How many gate tests a genome switches on (maxEntries is a count, not a test, and is left out). */
export function gateCountOf(genome) {
  const g = clampSensorGenome(genome);
  let c = 0;
  for (const gene of SENSOR_GENES) {
    if (gene.part !== 'gate' || gene.name === 'maxEntries') continue;
    if (gene.values ? g[gene.name] !== -1 : !isOff(gene, g[gene.name])) c++;
  }
  return c;
}

// ---------------------------------------------------------------- the age baseline
// Age bins, finest where the return moves fastest with age (the first two minutes).
export const AGE_EDGES = Object.freeze((() => {
  const e = [];
  for (let a = 10; a <= 120; a += 10) e.push(a);
  for (let a = 150; a <= 600; a += 30) e.push(a);
  for (let a = 660; a <= 1200; a += 60) e.push(a);
  for (let a = 1350; a <= 2400; a += 150) e.push(a);
  for (let a = 2700; a <= 4200; a += 300) e.push(a);
  return e;
})());
export const AGE_BINS = AGE_EDGES.length + 1;
/** The bin of an age: the number of edges at or under it. */
export function ageBinOf(age) {
  let lo = 0, hi = AGE_EDGES.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (AGE_EDGES[m] <= age) lo = m + 1; else hi = m; }
  return lo;
}

/**
 * The fold of each position of idxs: a stable hash of the instrument id, 0 or 1. The FNV-1a
 * hash's LOW bit is only the parity of its input's low bits, so two salts gave CORRELATED
 * folds (measured: a fold bit drawn inside a fold of another salt came out constant); the
 * hash is finalized (murmur3 fmix32) before a bit is taken.
 */
export function mix32(h) {
  let x = h >>> 0;
  x ^= x >>> 16; x = Math.imul(x, 0x85ebca6b) >>> 0;
  x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35) >>> 0;
  x ^= x >>> 16;
  return x >>> 0;
}
export function foldsOf(tape, idxs, salt = 'venue.fold/1') {
  const f = new Uint8Array(idxs.length);
  for (let t = 0; t < idxs.length; t++) f[t] = mix32(hash32(salt + ':' + tape.ids[idxs[t]])) & 1;
  return f;
}

/** The decision readings of an instrument where a buy fills (d < n - 1: a trip needs a later reading). */
export function fillableEntries(tape, i, o, cb) {
  const a = tape.off[i], n = tape.off[i + 1] - a;
  for (let d = 0; d < n - 1; d++) {
    const f = d + o.lag < n ? d + o.lag : n - 1;
    const j = a + f;
    if (!admitsBuy(tape.quote[j], o.size, o.maxImpact)) continue;
    if (!(payableBuy(tape.quote[j], tape.base[j], o.size) > 0)) continue;
    cb(d);
  }
}

/**
 * The mean return of EVERY fillable entry of each fold, per age bin, under an exit rule:
 * what a random entry at that age earns with that exit, after the fee, at the payable price.
 * Memoized by the exit genes, so a child that changed only its gate costs nothing here.
 */
export class AgeBaseline {
  constructor(tape, idxs, fold, o) {
    this.tape = tape; this.o = o;
    const ri = [], rd = [], rb = [], rf = [];
    for (let t = 0; t < idxs.length; t++) {
      const i = idxs[t];
      const a = tape.off[i];
      fillableEntries(tape, i, o, (d) => { ri.push(i); rd.push(d); rb.push(ageBinOf(tape.ageS[a + d])); rf.push(fold[t]); });
    }
    this.ri = Int32Array.from(ri); this.rd = Int32Array.from(rd); this.rb = Int32Array.from(rb); this.rf = Uint8Array.from(rf);
    this.entries = this.ri.length;
    this.cache = new Map(); this.hits = 0; this.misses = 0; this.ms = 0;
  }
  static keyOf(q) { return [q.trail, q.trailArm, q.stopLoss, q.maxHold, q.takeProfit].join('|'); }
  /** @returns {{ mean: Float64Array[], count: Int32Array[], emptyBins: number }} one array per fold */
  of(q) {
    const key = AgeBaseline.keyOf(q);
    const hit = this.cache.get(key);
    if (hit) { this.hits++; return hit; }
    this.misses++;
    const t0 = process.hrtime.bigint();
    const sum = [new Float64Array(AGE_BINS), new Float64Array(AGE_BINS)], count = [new Int32Array(AGE_BINS), new Int32Array(AGE_BINS)];
    const tot = [0, 0], cnt = [0, 0];
    const acc = newAcc();
    for (let k = 0; k < this.entries; k++) {
      const r = tripFrom(this.tape, this.ri[k], this.rd[k], q, this.o, acc);
      if (!Number.isFinite(r)) continue;
      const f = this.rf[k], b = this.rb[k];
      sum[f][b] += r; count[f][b]++; tot[f] += r; cnt[f]++;
    }
    let emptyBins = 0;
    const mean = [new Float64Array(AGE_BINS), new Float64Array(AGE_BINS)];
    for (let f = 0; f < 2; f++) {
      const all = cnt[f] ? tot[f] / cnt[f] : 0;
      for (let b = 0; b < AGE_BINS; b++) {
        if (count[f][b]) mean[f][b] = sum[f][b] / count[f][b];
        else { mean[f][b] = all; emptyBins++; }
      }
    }
    const out = { mean, count, emptyBins };
    if (this.cache.size < 4096) this.cache.set(key, out);
    this.ms += Number(process.hrtime.bigint() - t0) / 1e6;
    return out;
  }
}

/** mean / (sd / sqrt(n)), 0 when there is no spread. */
function tStat(sum, sumSq, n) {
  if (n < 2) return 0;
  const mean = sum / n;
  const v = (sumSq - n * mean * mean) / (n - 1);
  return v > 0 ? mean / Math.sqrt(v / n) : 0;
}

/**
 * One evaluation of a sensor genome on the training instruments: per instrument, the sum
 * over its trips of (return minus its fold's age baseline at the entry age); the t statistic
 * of that over the instruments of each fold (an instrument that never traded counts 0); the
 * fitness is the smaller t. Under minTrips trips a genome scores -1000 + trips / minTrips,
 * under every real trader, rising as it trades more.
 */
export function evaluateSensorGenome(tape, idxs, genome, o, { baseline, fold, minTrips = 1 } = {}) {
  const q = normalizeTrader(sensorParamsOf(genome, o));
  const base = baseline.of(q);
  const acc = newAcc();
  const s = [0, 0], ss = [0, 0], nf = [0, 0], tripsF = [0, 0];
  let readings = 0, gapSum = 0;
  for (let t = 0; t < idxs.length; t++) {
    const i = idxs[t], f = fold[t], a = tape.off[i];
    readings += tape.off[i + 1] - a;
    let g = 0, k = 0;
    const mean = base.mean[f];
    replayTrader(tape, i, q, o, acc, (x) => { g += x.ret - mean[ageBinOf(tape.ageS[a + x.entryDecision])]; k++; });
    s[f] += g; ss[f] += g * g; nf[f]++; tripsF[f] += k; gapSum += g;
  }
  const t0 = tStat(s[0], ss[0], nf[0]), t1 = tStat(s[1], ss[1], nf[1]);
  const fitness = acc.trips >= minTrips && acc.trips > 0 ? Math.min(t0, t1) : -1000 + acc.trips / Math.max(1, minTrips);
  return {
    fitness, tFolds: [t0, t1], tripsFolds: tripsF, trips: acc.trips, net: acc.net,
    netPerTrip: acc.trips ? acc.net / acc.trips : 0, gapPerTrip: acc.trips ? gapSum / acc.trips : 0,
    meanHeld: acc.trips ? acc.held / acc.trips : 0, impactRefused: acc.impactRefused, readings,
    descriptors: { tripsPerInstrument: idxs.length ? acc.trips / idxs.length : 0, meanHeld: acc.trips ? acc.held / acc.trips : 0, migrated: q.migrated, gates: gateCountOf(genome) },
  };
}

export class SensorEpochs extends VenueEpochs {
  /**
   * @param {object} opts
   * @param {object} opts.tape        a packed tape with attachSensors done
   * @param {Int32Array} opts.train   the instruments the search may see (and nothing else)
   * @param {object} opts.o           { size, fee, maxImpact, lag, legs }
   */
  constructor({ tape, train, o, seed = 'venue.sensors', popSize = 64, minTrips = 1, secondsPerTick = 20, elite = 16, crossoverRate = 0.3, mutationRate = 2, foldSalt = 'venue.fold/1' } = {}) {
    super({ tape, train, o, seed, popSize, minTrips, secondsPerTick, elite, crossoverRate, mutationRate });
    if (!tape.sensors) throw new Error('SensorEpochs needs attachSensors(tape) first');
    this.foldSalt = foldSalt;
    this.fold = foldsOf(tape, train, foldSalt);
    this.baseline = new AgeBaseline(tape, train, this.fold, o);
  }

  manifest() {
    return {
      seed: this.seed, popSize: this.popSize, readingsPerEvaluation: this.ticks, trainInstruments: this.train.length,
      secondsPerTick: this.secondsPerTick, secondsPerYear: SECONDS_PER_YEAR,
      fitness: 'min over two train folds (hash32 of "' + this.foldSalt + ':" + id, bit 0) of the t statistic over instruments of the per instrument sum of (trip return after the fee minus the mean return of every fillable entry of the same fold in the same age bin under the same exit); a genome under minTrips = ' + this.minTrips + ' trips scores -1000 + trips / minTrips',
      genes: SENSOR_GENES.map((g) => g.name), exitGenes: EXIT_GENES, ageBins: AGE_BINS, baselineEntries: this.baseline.entries,
      crossoverRate: this.crossoverRate, mutationRate: this.mutationRate, elite: this.eliteSize,
      grid: ['tripsPerInstrument', 'meanHeld', 'migrated gate (wallet vs any or migrated)'], gridCapacity: venueGridCapacity(),
    };
  }

  init() {
    this.seedGenomes = [{ ...SENSOR_BASE }];
    for (let i = 1; i < this.popSize; i++) this.seedGenomes.push(randomSensorGenome(this.rng));
    return this;
  }

  population() {
    if (!this.archive.fill()) return (this.seedGenomes || this.init().seedGenomes).map((g) => ({ ...g }));
    const elites = this.archive.elites();
    const pickParent = () => {
      if (this.top.length && this.rng.next() < 0.5) {
        const a = this.top[this.rng.int(this.top.length)], b = this.top[this.rng.int(this.top.length)];
        return (a.fitness >= b.fitness ? a : b).genome;
      }
      return elites[this.rng.int(elites.length)].genome;
    };
    const out = [];
    for (let k = 0; k < this.popSize; k++) {
      let child;
      if (this.rng.next() < this.crossoverRate) {
        child = mutateSensorGenome(crossSensorGenomes(pickParent(), pickParent(), this.rng), this.rng, { rate: Math.max(1, this.mutationRate - 1) });
      } else {
        child = mutateSensorGenome(pickParent(), this.rng, { rate: this.mutationRate });
      }
      out.push(clampSensorGenome(child));
    }
    return out;
  }

  evaluate(genome) {
    const key = sensorKeyOf(genome);
    const hit = this.seen.get(key);
    if (hit) { this.cacheHits++; return hit; }
    const ev = evaluateSensorGenome(this.tape, this.train, genome, this.o, { baseline: this.baseline, fold: this.fold, minTrips: this.minTrips });
    // the archive's third axis: the migrated gate, where board 8 had the entry direction
    ev.descriptors.entryDir = ev.descriptors.migrated === 0 ? -1 : 1;
    this.seen.set(key, ev);
    this.evaluations++;
    this.totalTicks += ev.readings;
    this.totalOrganisms++;
    return ev;
  }

  offerTop(entry) {
    const key = sensorKeyOf(entry.genome);
    if (this.top.some((t) => sensorKeyOf(t.genome) === key)) return;
    this.top.push(entry);
    this.top.sort((a, b) => b.fitness - a.fitness);
    if (this.top.length > this.eliteSize) this.top.length = this.eliteSize;
  }

  summary() {
    const s = super.summary();
    const b = this.best();
    s.best = b ? { id: b.id, genome: clampSensorGenome(b.genome), fitness: b.fitness, tFolds: b.ev.tFolds, trips: b.ev.trips, netPerTrip: b.ev.netPerTrip, gapPerTrip: b.ev.gapPerTrip } : null;
    s.baseline = { entries: this.baseline.entries, computed: this.baseline.misses, reused: this.baseline.hits, ms: this.baseline.ms };
    return s;
  }
}

// ---------------------------------------------------------------- grading one elite
/** The tail of a list of trip returns: the win rate, the rate of trips at +100% or more, and how much of the winnings the best trips carry. */
export function tailOf(rets) {
  const a = Float64Array.from(rets).sort().reverse();
  const T = a.length;
  let net = 0, pos = 0, wins = 0, tail = 0;
  for (const r of a) { net += r; if (r > 0) { pos += r; wins++; } if (r >= 1) tail++; }
  const top = T ? Math.max(1, Math.ceil(0.05 * T)) : 0;
  let topPos = 0;
  for (let k = 0; k < top; k++) if (a[k] > 0) topPos += a[k];
  let kFor100 = null;
  if (net > 0) { let c = 0; for (let k = 0; k < T; k++) { c += a[k]; if (c >= net) { kFor100 = k + 1; break; } } }
  return {
    trips: T, net, meanPerTrip: T ? net / T : 0, winRate: T ? wins / T : 0, wins,
    tailRate: T ? tail / T : 0, tailTrips: tail, top5pctTrips: top,
    top5pctShareOfWinnings: pos > 0 ? topPos / pos : null,
    kFor100, kFor100Share: kFor100 && T ? kFor100 / T : null,
    best: T ? a[0] : null, worst: T ? a[T - 1] : null,
  };
}

/** The fee check of one booked trip: what it paid is the both-legs fee of its own proceeds, and net = gross - fee exactly. */
export function feeDeviation(x, o) {
  const grossRet = x.gross / o.size - 1;
  const want = o.legs ? (o.fee / 2) * (1 + x.gross / o.size) : o.fee;
  return Math.max(Math.abs(x.fee - want), Math.abs(grossRet - x.ret - x.fee));
}
/** Whether a trip filled at a price better than the ratio the pool reported (it never can). */
export function beatsMid(x) {
  return x.buyPayable < x.buyMid * (1 - 1e-12) || x.sellPayable > x.sellMid * (1 + 1e-12);
}

/**
 * The elite on a set of instruments (the holdout, for the bar) against:
 *   age      THE MATCHED CONTROL: for every evolved trip, `draws` entries on random OTHER
 *            instruments of the same set at the reading nearest the same age (within tolS),
 *            fillable under the same cap, with the same exit rule, size and fee
 *   within   the board 8 control: the same trips per instrument at random fillable readings
 *            of the SAME instrument, same exit
 *   hold     one trip per instrument, first fillable reading to the last
 * One number per instrument per arm (the sum of its trip returns in units of size; the age
 * control's number is the sum over its trips of each trip's mean over the draws), paired.
 */
export function gradeSensorElite(tape, idxs, genome, o, { draws = 16, tolS = 30, seed = 'venue.sensors.grade', boot = 2000 } = {}) {
  const params = sensorParamsOf(genome, o);
  const q = normalizeTrader(params);
  const n = idxs.length;
  const accE = newAcc();
  const trips = [];
  const ev = new Float64Array(n), k = new Int32Array(n);
  for (let t = 0; t < n; t++) {
    const i = idxs[t], a = tape.off[i];
    const before = accE.trips;
    ev[t] = replayTrader(tape, i, q, o, accE, (x) => trips.push({
      t, i, d: x.entryDecision, age: tape.ageS[a + x.entryDecision], ret: x.ret, gross: x.gross, fee: x.fee,
      held: x.exitFill - x.entryFill, why: x.why, buyPayable: x.buyPayable, buyMid: x.buyMid, sellPayable: x.sellPayable, sellMid: x.sellMid,
    }));
    k[t] = accE.trips - before;
  }
  // the age matched control
  const ctrl = [];
  const ac = replayAgeControl(tape, idxs, trips, q, o, new RNG(seed + ':age'), { draws, tolS, onTrip: (x) => ctrl.push({ ret: x.ret, gross: x.gross, fee: x.fee, buyPayable: x.buyPayable, buyMid: x.buyMid, sellPayable: x.sellPayable, sellMid: x.sellMid }) });
  const ct = new Float64Array(n), gap = new Float64Array(n);
  const tripGaps = [];
  let unmatchedTrips = 0, shortDrawn = 0;
  for (let m = 0; m < trips.length; m++) {
    if (ac.drawn[m] < draws) shortDrawn++;
    const c = ac.perTrip[m];
    if (!Number.isFinite(c)) { unmatchedTrips++; continue; }
    ct[trips[m].t] += c; gap[trips[m].t] += trips[m].ret - c; tripGaps.push(trips[m].ret - c);
  }
  // the within instrument random time control and hold
  const rngW = new RNG(seed + ':within');
  const accW = newAcc(), accH = newAcc();
  const wc = new Float64Array(n), hd = new Float64Array(n);
  let wMatched = 0;
  for (let t = 0; t < n; t++) {
    const i = idxs[t];
    if (k[t] > 0) {
      const c = replayControl(tape, i, q, k[t], rngW, { ...o, draws }, accW);
      wc[t] = c.trips ? k[t] * (c.net / c.trips) : 0;
      if (c.trips) wMatched += k[t];
    }
    hd[t] = replayHold(tape, i, o, accH);
  }
  // the checks every booked trip must pass
  let payableViolations = 0, feeMaxDev = 0, feesAboveFlat = 0;
  for (const x of trips) { if (beatsMid(x)) payableViolations++; feeMaxDev = Math.max(feeMaxDev, feeDeviation(x, o)); if (x.fee > o.fee + 1e-12) feesAboveFlat++; }
  for (const x of ctrl) { if (beatsMid(x)) payableViolations++; feeMaxDev = Math.max(feeMaxDev, feeDeviation(x, o)); }
  const cand = Array.from(ac.candidates).sort((x, y) => x - y);
  const traded = Array.from(k, (x) => x > 0);
  const whyCount = {};
  for (const x of trips) whyCount[x.why] = (whyCount[x.why] || 0) + 1;
  const sum = (arr) => { let s = 0; for (let t = 0; t < arr.length; t++) s += arr[t]; return s; };
  const matched = trips.length - unmatchedTrips;
  return {
    params, instruments: n, instrumentsTraded: traded.filter(Boolean).length,
    perInstrument: { evolved: ev, ageControl: ct, within: wc, hold: hd, trips: k, gap },
    evolved: { trips: accE.trips, net: sum(ev), netPerTrip: accE.trips ? sum(ev) / accE.trips : 0, grossPerTrip: accE.trips ? accE.gross / accE.trips : 0, feesPerTrip: accE.trips ? accE.fees / accE.trips : 0, meanHeld: accE.trips ? accE.held / accE.trips : 0, impactRefused: accE.impactRefused, liqTrips: accE.liqTrips, why: whyCount, tail: tailOf(trips.map((x) => x.ret)) },
    ageControl: {
      draws, tolS, tripsMatched: matched, shortDrawn, unmatchedDraws: ac.unmatched, drawnTrips: ac.acc.trips,
      maxAgeGap: ac.maxAgeGap, candidates: { min: cand.length ? cand[0] : 0, median: cand.length ? cand[cand.length >> 1] : 0, max: cand.length ? cand[cand.length - 1] : 0 },
      net: sum(ct), netPerTrip: matched ? sum(ct) / matched : 0,
      tail: tailOf(ctrl.map((x) => x.ret)),
    },
    within: { tripsMatched: wMatched, net: sum(wc), netPerTrip: wMatched ? sum(wc) / wMatched : 0, collisions: accW.collisions, drawnTrips: accW.trips },
    hold: { trips: accH.trips, net: sum(hd), netPerTrip: accH.trips ? sum(hd) / accH.trips : 0, noEntry: accH.noEntry },
    gapAge: pairedStats(gap, { boot, seed: seed + ':boot:age' }),
    gapAgeTraded: pairedStats(Array.from(gap).filter((_, t) => traded[t]), { boot, seed: seed + ':boot:traded' }),
    gapAgePerTrip: pairedStats(tripGaps, { boot, seed: seed + ':boot:trip' }),
    gapWithin: pairedStats(gapsOf(ev, wc), { boot, seed: seed + ':boot:within' }),
    gapHold: pairedStats(gapsOf(ev, hd), { boot, seed: seed + ':boot:hold' }),
    checks: { unmatchedTrips, payableViolations, tripsChecked: trips.length + ctrl.length, feeMaxDev, feesAboveFlat },
    trips,
  };
}

// ---------------------------------------------------------------- what each sensor says
/** The AUC of x for a binary y over entries sorted by x, each entry weighted (ties count half). */
export function weightedAuc(order, x, y, w = null) {
  let wp = 0, wn = 0, below = 0, s = 0;
  for (let a = 0; a < order.length;) {
    const v = x[order[a]];
    let gp = 0, gn = 0, b = a;
    while (b < order.length && x[order[b]] === v) { const e = order[b]; const ww = w ? w[e] : 1; if (y[e]) gp += ww; else gn += ww; b++; }
    s += gp * (below + gn / 2);
    below += gn; wp += gp; wn += gn;
    a = b;
  }
  return wp > 0 && wn > 0 ? s / (wp * wn) : NaN;
}

/**
 * THE SENSOR CENSUS: every fillable decision reading of idxs entered once, with the exit of
 * q (the gate is NOT applied: this asks what each sensor says about entries nobody chose),
 * at the payable price after the fee. Per sensor, the AUC of the sensor for a WIN (return
 * over zero) and for BEATING THE AGE BASELINE (return over the mean of its age bin in this
 * same census, the question the bar asks), each with a 95 percent interval from a bootstrap
 * over INSTRUMENTS (the entries of one instrument are not independent draws). 0.5 is no
 * information; under 0.5 the sensor ranks the other way.
 */
export function sensorAucs(tape, idxs, q, o, { boot = 200, seed = 'venue.auc' } = {}) {
  if (!tape.sensors) throw new Error('sensorAucs needs attachSensors(tape) first');
  const inst = [], ret = [], bin = [], at = [];
  const acc = newAcc();
  for (let t = 0; t < idxs.length; t++) {
    const i = idxs[t], a = tape.off[i];
    fillableEntries(tape, i, o, (d) => {
      const r = tripFrom(tape, i, d, q, o, acc);
      if (!Number.isFinite(r)) return;
      inst.push(t); ret.push(r); bin.push(ageBinOf(tape.ageS[a + d])); at.push(a + d);
    });
  }
  const N = ret.length;
  const bs = new Float64Array(AGE_BINS), bc = new Int32Array(AGE_BINS);
  for (let e = 0; e < N; e++) { bs[bin[e]] += ret[e]; bc[bin[e]]++; }
  const win = new Uint8Array(N), beat = new Uint8Array(N);
  let wins = 0, beats = 0, net = 0, tail = 0;
  for (let e = 0; e < N; e++) {
    win[e] = ret[e] > 0 ? 1 : 0; wins += win[e];
    beat[e] = ret[e] > bs[bin[e]] / bc[bin[e]] ? 1 : 0; beats += beat[e];
    net += ret[e]; if (ret[e] >= 1) tail++;
  }
  const rng = new RNG(seed);
  const mult = new Int32Array(idxs.length);
  const weights = [];
  for (let b = 0; b < boot; b++) {
    mult.fill(0);
    for (let k = 0; k < idxs.length; k++) mult[rng.int(idxs.length)]++;
    const ww = new Float32Array(N);
    for (let e = 0; e < N; e++) ww[e] = mult[inst[e]];
    weights.push(ww);
  }
  const per = {};
  for (const name of SENSOR_NAMES) {
    const col = tape.sensors.cols[name];
    const x = new Float64Array(N);
    for (let e = 0; e < N; e++) x[e] = col[at[e]];
    const order = Array.from({ length: N }, (_, e) => e).sort((p, r) => x[p] - x[r]);
    const one = (y) => {
      const auc = weightedAuc(order, x, y);
      const bsA = [];
      for (const ww of weights) { const v = weightedAuc(order, x, y, ww); if (Number.isFinite(v)) bsA.push(v); }
      bsA.sort((p, r) => p - r);
      const lo = bsA.length ? bsA[Math.floor(0.025 * bsA.length)] : NaN, hi = bsA.length ? bsA[Math.min(bsA.length - 1, Math.floor(0.975 * bsA.length))] : NaN;
      return { auc, lo, hi, excludesHalf: lo > 0.5 || hi < 0.5 };
    };
    per[name] = { win: one(win), beatsAge: one(beat) };
  }
  return { entries: N, instruments: idxs.length, winRate: N ? wins / N : 0, beatsAgeRate: N ? beats / N : 0, meanPerEntry: N ? net / N : 0, tailRate: N ? tail / N : 0, boot, per };
}
