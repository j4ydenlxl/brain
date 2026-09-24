// generations/spread.mjs: SPREAD, SELF IMPROVEMENT ON THE SIMULATED CLOCK (Board 14, item spread).
//
// His order of 2026-09-24: "Self improving to the magnitude of yourself is the top priority it should
// be better or as good as u at self improving and can be able to spread this in billions of years
// compressed simulated magnitude".
//
// self/improve.mjs improves the real tree one round at a time, on the wall clock, one trial per
// minute. This file runs the same kind of round on the SIMULATED clock, where a round costs
// milliseconds, and lets a population of organisms improve themselves and each other:
//
//   THE GAP      the velocity library search (generations/velocity.mjs MatrixElites on the K = 4 draw
//                grid suite of daemon/multiply.mjs), scored by the objective velocity.mjs already
//                scores, unchanged. Its knobs are the numeric fields of OPTIONS below, read the way
//                self/knobs.mjs reads any knob (band 0.7x to 1.5x of the value as read); its
//                strategies are STRATEGIES, selected by STRATEGY, the shape self/operators.mjs
//                strategySwap reads. So a simulated knob is a REAL knob of this file.
//   AN ORGANISM  one cell of kind spread.instance in a population Brain (core/brain.mjs), holding
//                its config of the gap, its operator genes (generations/operators-gene.mjs) and its
//                operator cursor. N comes from daemon/multiply.mjs POPULATION_SIZE.
//   A GENERATION every organism spends up to its trial budget (a gene) on its operators, in the
//                order its genes name, each trial on a CLONE (simulate/clone.mjs cloneSub) of its
//                own cell: the candidate config and the current config (the matched control) each
//                run one burst per seed on the SAME engine seeds, and the move is KEPT only when the
//                mean paired gain beats the noise its noise rule reads off those seeds (never looser
//                than the seed-to-seed standard deviation). Then the population Brain ticks once:
//                one generation is one tick of the simulated clock.
//   SPREAD ON    a kept move leaves its organism on the 'out' port and travels the connectome's own
//                conduits (daemon/multiply.mjs spreadConduits, wired as Brain edges); every organism
//                that receives it applies it and forwards it once. The archive records the tick at
//                which each organism received each move; k, the ticks a move needs to reach every
//                organism, is read off the connectome by a shortest path walk. The message also
//                carries the sender's genes and their measured rate, and a receiver adopts genes
//                whose rate beats its own at its next window: selection over HOW to improve.
//   SPREAD OFF   no conduits, no adoption, no promotion, no file written: every organism runs
//                exactly as it would alone (test/spread.test.mjs holds it to that, byte for byte).
//   GENES        every SPREAD.window generations each organism reads a fixed yardstick (its config,
//                fixed seeds) and rates its genes by the yardstick gain per organism-year. A (1+1)
//                keeps a mutated genes object only when it rated no worse than its parent's window.
//   PROMOTION    a kept move still held S generations later by every organism is a survivor. A
//                survivor is confirmed on the file's own OPTIONS (base against base plus the move, on
//                SPREAD.promoteSeeds fixed seeds, the registry's range rule) and only a confirmed one
//                is PROMOTED to state/self/gaps.jsonl as kind "promoted from simulation", with its
//                simulated before and after, through self/gaps.mjs writeLedger when it exists.
//
// Organism-years follow the one declaration of generations/years.mjs: one organism-year is one
// generation of a whole engine population (SPREAD.burstPop children, fixed so one yearsArithmetic
// call covers every burst). Yardstick bursts are years; held-out and promotion bursts are
// measurement and are counted apart.
//
// The model is never called here: the author operator is skipped with a printed "model off".
import { existsSync, mkdirSync, appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Brain } from '../core/brain.mjs';
import { defineKind, hasKind } from '../core/cell.mjs';
import { ACTIVE } from '../core/connectome.mjs';
import { RNG, hash32 } from '../core/rng.mjs';
import { cloneSub, deepCopy } from '../simulate/clone.mjs';
import { MatrixElites, objectiveOf } from './velocity.mjs';
import { yearsArithmetic } from './years.mjs';
import { POPULATION_SIZE, populationIds, spreadConduits } from '../daemon/multiply.mjs';
import {
  loadRegistry, defaultOperatorGenes, normalizeOperatorGenes, mutateOperatorGenes, genesToJSON, genesKey, noiseOf, stubBandOf,
} from './operators-gene.mjs';

const SELF = fileURLToPath(import.meta.url);
export const SPREAD_FILE = SELF;
export const ROOT = path.resolve(path.dirname(SELF), '..');
export const REL = 'generations/spread.mjs';
export const AUTHOR = 'board 14 builder';
export const PROMOTED_KIND = 'promoted from simulation';
export const PROMOTED_REL = 'state/self/spread-promoted.jsonl';

// ---------------------------------------------------------------- the simulated gap
/** The knobs of the simulated gap: the MatrixElites options of generations/velocity.mjs, as its constructor defaults them. */
export const OPTIONS = Object.freeze({
  mutationRate: 1.5,   // mean point mutations per child
  crossoverRate: 0.15, // share of children made by crossover
  directed: 0.75,      // share of draws aimed at a task the parent leaves unsolved
  lmax: 32,            // longest library a genome may hold
  bins: 6,             // MAP-Elites bins per behaviour axis
  initLenMax: 8,       // longest random genome of generation zero
});

/** The strategies of the simulated gap, the shape self/operators.mjs strategySwap reads. */
export const STRATEGIES = Object.freeze({
  pruned: Object.freeze({ prune: true }),    // a child is pruned of slots that claim no task before it is offered
  unpruned: Object.freeze({ prune: false }), // children are offered as drawn
});
export const STRATEGY = 'pruned';

/** How the simulation runs. Not a knob object: burstPop is fixed so organism-years stay one declaration. */
export const SPREAD = Object.freeze({
  burstPop: 32,       // children per engine generation, every burst (years.mjs: one engine generation = one organism-year)
  burstGens: 40,      // engine generations per burst
  window: 8,          // generations between two yardstick reads (the genes' rating window)
  yardSeeds: 2,       // yardstick bursts per read, on seeds fixed for the organism's life
  survive: 16,        // S: generations a kept move must still be held, by every organism, to be a survivor
  delay: 0,           // conduit delay in ticks (a signal takes 1 + delay ticks per hop)
  promoteSeeds: 4,    // confirmation bursts per arm before a survivor is promoted (the --trial seeds)
  maxPromote: 6,      // at most this many lines promoted per run
  heldSeeds: 3,       // held-out bursts per organism
  floorTasks: 1,      // the noise floor when every seed agrees: this many tasks of the objective
  maxSteps: 200,      // operator steps (refused ones included) one organism may take in one generation
});

// ---------------------------------------------------------------- small pure helpers
const r6 = (x) => Math.round(x * 1e6) / 1e6;
const mean = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : NaN);
export function sampleSd(xs) { if (xs.length < 2) return 0; const m = mean(xs); return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1)); }

/**
 * The knobs of the simulated gap, banded the way self/knobs.mjs bands them (the registry's bandOf, or
 * the stub). The band is fixed by the value AS READ (options), so a config can never walk it.
 */
export function gapKnobs(options = OPTIONS, reg = null) {
  const bandOf = (reg && reg.bandOf) || stubBandOf;
  return Object.keys(options).map((name) => {
    const value = options[name];
    const b = bandOf(value, null, String(value));
    return { name, value, lo: b.lo, hi: b.hi, integer: !!b.integer, frozen: !!b.frozen };
  }).filter((k) => !k.frozen);
}

/** A knob's step under a genes step fraction: that fraction of the value as read, at least 1 for an integer knob. */
export function stepOf(knob, frac) { return knob.integer ? Math.max(1, Math.round(frac * Math.abs(knob.value))) : r6(frac * Math.abs(knob.value)); }

/** The MatrixElites options of a config. */
export function engineOptions(config, strategy, seed, pop) {
  const lmax = Math.max(1, Math.round(config.lmax));
  return {
    seed, popSize: pop, lmax, initLen: [1, Math.max(1, Math.min(lmax, Math.round(config.initLenMax)))],
    mutationRate: config.mutationRate, crossoverRate: config.crossoverRate, directed: config.directed,
    bins: Math.max(1, Math.round(config.bins)), prune: (STRATEGIES[strategy] || STRATEGIES[STRATEGY]).prune,
  };
}

/** One burst: a fresh MatrixElites on the searched matrix, `gens` generations, its best library. */
export function burst(matrix, config, strategy, seed, gens = SPREAD.burstGens, pop = SPREAD.burstPop) {
  const e = new MatrixElites(matrix, engineOptions(config, strategy, seed, pop));
  for (let g = 0; g < gens; g++) e.step();
  const b = e.best();
  return { fitness: b ? b.fitness : -Infinity, count: b ? b.count : 0, len: b ? b.len : 0, genome: b ? b.genome : [], evals: e.evals, gens };
}

/** The held-out objective of a library: velocity's objective over every fresh draw, summed. */
export function freshObjective(fresh, genome) {
  let count = 0, tasks = 0;
  for (const f of fresh) { count += f.matrix.score(genome).count; tasks += f.matrix.T; }
  return objectiveOf(count, genome.length, tasks, fresh.length);
}

// ---------------------------------------------------------------- the organism cell
export const KIND = 'spread.instance';
if (!hasKind(KIND)) {
  defineKind(KIND, {
    doc: 'one organism of a spread population: its config of the simulated gap, its operator genes, its cursor; applies and forwards kept moves once',
    ports: { in: [{ name: 'in', kinds: ['event'] }, { name: 'self', kinds: ['event'] }], out: [{ name: 'out', kinds: ['event'] }] },
    init: () => ({}),
    compute(ins, cell, ctx) {
      const st = cell.state, fresh = [];
      const archive = ctx.brain && ctx.brain.spreadArchive;
      for (const port of ins) for (const it of port) {
        const msgs = it.sig && it.sig.data && Array.isArray(it.sig.data.msgs) ? it.sig.data.msgs : [];
        for (const m of msgs) {
          if (st.seen[m.id] !== undefined) continue;
          st.seen[m.id] = ctx.t;
          if (archive && archive.has(m.id)) archive.get(m.id).received[cell.id] = ctx.t;
          if (m.origin !== cell.id) receive(st, m);
          fresh.push(m);
        }
      }
      return st.spread && fresh.length ? [{ kind: 'event', data: { msgs: fresh } }] : [];
    },
  });
}

/** A received move: its values are applied, its sender's config is a partner, its genes an offer. */
function receive(st, m) {
  for (const [k, v] of Object.entries(m.to.config || {})) st.config[k] = v;
  if (m.to.strategy) st.strategy = m.to.strategy;
  st.received++;
  st.partners[m.origin] = { config: { ...m.config }, strategy: m.strategyNow, t: m.gen };
  if (m.genes) st.offers.push({ genes: m.genes, fit: m.fit, from: m.origin });
}

function newCursor(op = 0) { return { op, ki: 0, dir: 1, flipped: false, moved: false, si: 0, pi: 0 }; }

// ---------------------------------------------------------------- the population
export class SpreadPopulation {
  /**
   * @param {object} o
   * @param {{ matrix: object, fresh: {seed: string, matrix: object}[] }} o.suite searched matrix and fresh draws (daemon/multiply.mjs loadSuite)
   * @param {string} o.seed the run seed: every engine seed is a function of it
   * @param {boolean} [o.spread] conduits and adoption on (true) or off (false)
   * @param {number} [o.size] N, daemon/multiply.mjs POPULATION_SIZE unless given
   * @param {string[]} [o.ids] instance ids (default daemon/multiply.mjs populationIds(size))
   * @param {object} [o.options] the gap's knobs as read (OPTIONS)
   * @param {object} [o.cfg] SPREAD overrides
   * @param {object} o.registry generations/operators-gene.mjs loadRegistry()
   * @param {object|object[]} [o.genes] starting genes (one for all, or one per instance)
   * @param {boolean} [o.trials] false: tick and propagate only (a test plants moves by hand)
   * @param {(l: string) => void} [o.say]
   */
  constructor({ suite, seed, spread = true, size = POPULATION_SIZE, ids = null, options = OPTIONS, strategy = STRATEGY, cfg = {}, registry, genes = null, trials = true, say = () => {} }) {
    if (!registry) throw new Error('SpreadPopulation: registry is required (generations/operators-gene.mjs loadRegistry)');
    this.suite = suite; this.matrix = suite.matrix; this.fresh = suite.fresh || [];
    this.seed = String(seed); this.spread = !!spread; this.cfg = { ...SPREAD, ...cfg };
    this.reg = registry; this.options = { ...options }; this.baseStrategy = strategy; this.trialsOn = trials !== false; this.say = say;
    this.knobs = gapKnobs(this.options, registry);
    this.ids = ids ? [...ids] : populationIds(size);
    this.floor = this.cfg.floorTasks / this.matrix.T;
    this.archive = new Map();
    this.history = [];
    this.stats = { generations: 0, engineGens: 0, evals: 0, trials: 0, refused: 0, kept: 0, received: 0, modelOff: 0, noPartner: 0, adopted: 0, reverted: 0, mutated: 0, measureGens: 0, wallMs: 0, cloneMs: 0 };
    this.instYears = Object.fromEntries(this.ids.map((id) => [id, 0]));
    this.brain = new Brain({ name: 'spread/' + this.seed + (this.spread ? '' : ':off'), seed: this.seed, ledger: 'off', pruneEvery: 0, growth: { threshold: Number.MAX_SAFE_INTEGER } });
    this.brain.spreadArchive = this.archive;
    const g0 = Array.isArray(genes) ? genes : this.ids.map(() => genes);
    this.ids.forEach((id, i) => {
      const cell = this.brain.addCell({ id, kind: KIND, region: 'spread', circuit: 'population', policy: { period: 'event' } });
      const gg = normalizeOperatorGenes(g0[i] || defaultOperatorGenes(registry), registry);
      cell.state = {
        id, spread: this.spread, config: { ...this.options }, strategy, genes: genesToJSON(gg), parentGenes: null, genesFit: null, parentFit: null,
        cursor: newCursor(), seen: {}, partners: {}, offers: [], kept: 0, received: 0, trials: 0, seq: 0, yard: null, yardYears: 0,
      };
    });
    if (this.spread) for (const [a, b] of spreadConduits(this.ids)) this.brain.connect(a, 'out', b, 'in', { w: 1, delay: this.cfg.delay });
    this.k = this.spread ? conduitReach(this.brain, this.ids) : null;
    this.snapshot(-1);
  }

  get t() { return this.brain.clock.t; }
  state(id) { return this.brain.byId.get(id).state; }

  /** Engine seeds of one trial: identical for the candidate and its matched control, and for spread on and off. */
  trialSeeds(id, g, t, n) { return Array.from({ length: n }, (_, s) => this.seed + '/' + id + '/g' + g + '/t' + t + '/s' + s); }

  /** The matched trial: candidate and current config on the same engine seeds; kept only above the noise rule. */
  judge(id, st, cand, g, t) {
    const n = st.genes.noise.seeds, seeds = this.trialSeeds(id, g, t, n);
    const cs = [], ks = [];
    for (const s of seeds) {
      const c = burst(this.matrix, cand.config, cand.strategy, s, this.cfg.burstGens, this.cfg.burstPop);
      const k = burst(this.matrix, st.config, st.strategy, s, this.cfg.burstGens, this.cfg.burstPop);
      cs.push(c.fitness); ks.push(k.fitness);
      this.stats.evals += c.evals + k.evals;
    }
    const gens = 2 * n * this.cfg.burstGens;
    this.stats.engineGens += gens; this.instYears[id] += gens;
    this.stats.trials++; st.trials++;
    const gain = mean(cs.map((x, i) => x - ks[i]));
    const noise = noiseOf(st.genes.noise.rule, cs, ks, this.floor);
    return { gain, noise, s: gain > noise ? 1 : gain < -noise ? -1 : 0, candMean: mean(cs), ctrlMean: mean(ks), rule: st.genes.noise.rule, seeds: n };
  }

  /** Commit a kept move to the twin's state and build its message. */
  keep(st, cand, operator, v, g) {
    const from = { config: {} }, to = { config: {} };
    for (const k of this.knobs) if (cand.config[k.name] !== st.config[k.name]) { from.config[k.name] = st.config[k.name]; to.config[k.name] = cand.config[k.name]; }
    if (cand.strategy !== st.strategy) { from.strategy = st.strategy; to.strategy = cand.strategy; }
    st.config = { ...cand.config }; st.strategy = cand.strategy; st.kept++;
    const m = {
      id: st.id + '#' + (++st.seq), origin: st.id, gen: g, operator, from, to,
      before: r6(v.ctrlMean), after: r6(v.candMean), gain: r6(v.gain), noise: r6(v.noise), rule: v.rule, seeds: v.seeds,
      config: { ...st.config }, strategyNow: st.strategy, genes: genesToJSON(normalizeOperatorGenes(st.genes, this.reg)), fit: st.genesFit,
    };
    this.archive.set(m.id, { ...m, received: {} });
    this.stats.kept++;
    return m;
  }

  // ---- the operators, simulated. Each step returns { spent, kept, done }.
  knobStep(id, st, g, t) {
    const c = st.cursor;
    if (c.ki >= this.knobs.length) return { spent: 0, done: true };
    const k = this.knobs[c.ki], cur = st.config[k.name], step = stepOf(k, st.genes.step);
    const value = k.integer ? Math.round(cur + c.dir * step) : r6(cur + c.dir * step);
    const next = () => { c.ki++; c.dir = 1; c.flipped = false; c.moved = false; };
    if (value < k.lo || value > k.hi) {
      // refused: outside the band as read, never run, never counted (self/operators.mjs knobTune)
      this.stats.refused++;
      if (!c.flipped && !c.moved) { c.dir = -c.dir; c.flipped = true; } else next();
      return { spent: 0 };
    }
    const cand = { config: { ...st.config, [k.name]: value }, strategy: st.strategy };
    const v = this.judge(id, st, cand, g, t);
    if (v.s > 0) { const m = this.keep(st, cand, 'knob-tune', v, g); c.moved = true; return { spent: 1, kept: m }; }
    if (v.s < 0 && !c.flipped && !c.moved) { c.dir = -c.dir; c.flipped = true; return { spent: 1 }; }
    next();
    return { spent: 1 };
  }

  strategyStep(id, st, g, t) {
    const c = st.cursor, names = Object.keys(STRATEGIES).filter((n) => n !== st.strategy);
    if (c.si >= names.length) return { spent: 0, done: true };
    const name = names[c.si++];
    const v = this.judge(id, st, { config: { ...st.config }, strategy: name }, g, t);
    const kept = v.s > 0 ? this.keep(st, { config: { ...st.config }, strategy: name }, 'strategy-swap', v, g) : null;
    return { spent: 1, kept, done: c.si >= names.length };
  }

  recombineStep(id, st, g, t) {
    const c = st.cursor, partners = Object.keys(st.partners).sort();
    if (!partners.length) { this.stats.noPartner++; return { spent: 0, done: true }; }
    if (c.pi >= partners.length) return { spent: 0, done: true };
    const p = st.partners[partners[c.pi++]];
    const rng = new RNG(hash32(this.seed + '/' + id + '/g' + g + '/t' + t + '/recombine'));
    const config = {};
    for (const k of this.knobs) config[k.name] = rng.next() < 0.5 ? st.config[k.name] : p.config[k.name];
    const strategy = rng.next() < 0.5 ? st.strategy : p.strategy;
    const same = strategy === st.strategy && this.knobs.every((k) => config[k.name] === st.config[k.name]);
    if (same) return { spent: 0, done: c.pi >= partners.length };
    const v = this.judge(id, st, { config, strategy }, g, t);
    const kept = v.s > 0 ? this.keep(st, { config, strategy }, 'recombine', v, g) : null;
    return { spent: 1, kept, done: c.pi >= partners.length };
  }

  /** One organism's generation, on a clone of its own cell. */
  organismGeneration(id, g) {
    const c0 = performance.now();
    const twin = cloneSub(this.brain, { cells: [id], seed: this.seed + '/' + id + '/twin/g' + g, name: 'spread.twin.' + id });
    this.stats.cloneMs += performance.now() - c0;
    const st = twin.byId.get(id).state;
    const budget = st.genes.budget, order = st.genes.order;
    const kept = [];
    let trials = 0, steps = 0, idle = 0;
    while (trials < budget && steps < this.cfg.maxSteps && idle <= 2 * order.length) {
      steps++;
      const op = order[st.cursor.op % order.length];
      let r;
      if (op === 'knob-tune') r = this.knobStep(id, st, g, trials);
      else if (op === 'strategy-swap') r = this.strategyStep(id, st, g, trials);
      else if (op === 'recombine') r = this.recombineStep(id, st, g, trials);
      else { this.stats.modelOff++; r = { spent: 0, done: true }; } // author: the model is off here, never called
      if (r.spent) { trials++; idle = 0; } else if (r.done) idle++;
      if (r.kept) kept.push(r.kept);
      if (r.done) st.cursor = newCursor((st.cursor.op + 1) % order.length);
    }
    // the real cell did not move while the twin ran; the twin's state, kept moves and cursor, is the new one
    this.brain.byId.get(id).state = deepCopy(st);
    for (const m of kept) this.brain.inject(id, 'self', { kind: 'event', data: { msgs: [m] } });
    return kept.length;
  }

  /** The yardstick: the organism's config on its own fixed seeds (years: its bursts are its life). */
  yardstick(id, st) {
    const xs = [];
    for (let s = 0; s < this.cfg.yardSeeds; s++) {
      const b = burst(this.matrix, st.config, st.strategy, this.seed + '/' + id + '/yard/s' + s, this.cfg.burstGens, this.cfg.burstPop);
      xs.push(b.fitness); this.stats.evals += b.evals;
    }
    const gens = this.cfg.yardSeeds * this.cfg.burstGens;
    this.stats.engineGens += gens; this.instYears[id] += gens;
    return mean(xs);
  }

  /** End of a genes window: rate, (1+1) keep or revert, adopt a better neighbour's genes (spread on), mutate. */
  windowEnd(id, g) {
    const cell = this.brain.byId.get(id), st = cell.state;
    const yard = this.yardstick(id, st);
    const years = this.instYears[id] - st.yardYears;
    const fit = st.yard === null ? null : r6(((yard - st.yard) / Math.max(1, years)) * 1e6); // yardstick gain per million organism-years
    if (fit !== null) {
      if (st.parentGenes && st.parentFit !== null && fit < st.parentFit) { st.genes = st.parentGenes; st.genesFit = st.parentFit; this.stats.reverted++; }
      else st.genesFit = fit;
    }
    if (this.spread && st.offers.length) {
      let best = null;
      for (const o of st.offers) if (o.fit !== null && o.fit !== undefined && (!best || o.fit > best.fit)) best = o;
      if (best && (st.genesFit === null || best.fit > st.genesFit) && genesKey(normalizeOperatorGenes(best.genes, this.reg)) !== genesKey(normalizeOperatorGenes(st.genes, this.reg))) {
        st.genes = genesToJSON(normalizeOperatorGenes(best.genes, this.reg)); st.genesFit = best.fit; this.stats.adopted++;
      }
    }
    st.offers = [];
    st.parentGenes = st.genes; st.parentFit = st.genesFit;
    const rng = new RNG(hash32(this.seed + '/' + id + '/genes/g' + g));
    st.genes = genesToJSON(mutateOperatorGenes(normalizeOperatorGenes(st.genes, this.reg), rng, this.reg).genes);
    this.stats.mutated++;
    st.cursor = newCursor(st.cursor.op);
    st.yard = yard; st.yardYears = this.instYears[id];
  }

  snapshot(g) {
    const row = { g, configs: {} };
    for (const id of this.ids) { const st = this.state(id); row.configs[id] = { config: { ...st.config }, strategy: st.strategy, genes: genesKey(normalizeOperatorGenes(st.genes, this.reg)) }; }
    this.history.push(row);
  }

  /** One generation: every organism's trials, then one tick of the population's clock. */
  generation() {
    const g = this.t;
    if (this.trialsOn) for (const id of this.ids) this.organismGeneration(id, g);
    this.brain.tick();
    if (this.trialsOn && (g + 1) % this.cfg.window === 0) for (const id of this.ids) this.windowEnd(id, g);
    this.stats.received = this.ids.reduce((s, id) => s + this.state(id).received, 0);
    this.snapshot(g);
    this.stats.generations = g + 1;
    return g;
  }

  /** Run to a generation count or a wall budget, whichever comes first. */
  run({ generations = Infinity, wallMs = Infinity, onGeneration = null } = {}) {
    const t0 = performance.now();
    while (this.stats.generations < generations && performance.now() - t0 < wallMs) {
      const g = this.generation();
      if (onGeneration) onGeneration(g, this);
    }
    this.stats.wallMs += performance.now() - t0;
    return this.stats;
  }

  /**
   * Let what is on the wire arrive: `ticks` more ticks of the clock with no trial, no window and no
   * organism-year (a move kept in the last generation is still in flight when the trials stop). The
   * default is k, the most any move needs; spread off has no wire, and a drain there only ticks.
   */
  drain(ticks = this.k === null || !Number.isFinite(this.k) ? 0 : this.k) {
    for (let i = 0; i < ticks; i++) {
      const g = this.t;
      this.brain.tick();
      this.stats.received = this.ids.reduce((s, id) => s + this.state(id).received, 0);
      this.snapshot(g);
    }
    this.drained = (this.drained || 0) + ticks;
    return ticks;
  }

  /** Plant a kept move in one organism as if it had kept it now (tests, and a move a caller carries in). */
  plant(id, patch, { before = 0, after = 0 } = {}) {
    const st = this.state(id);
    const cand = { config: { ...st.config, ...(patch.config || {}) }, strategy: patch.strategy || st.strategy };
    const m = this.keep(st, cand, 'planted', { ctrlMean: before, candMean: after, gain: after - before, noise: 0, rule: 'planted', seeds: 0 }, this.t);
    this.brain.inject(id, 'self', { kind: 'event', data: { msgs: [m] } });
    return m;
  }

  /** Every kept move with the tick each organism received it and the ticks it took to reach them all. */
  reach() {
    const out = [];
    for (const a of this.archive.values()) {
      const got = this.ids.filter((id) => a.received[id] !== undefined);
      const all = got.length === this.ids.length;
      const lastAt = all ? Math.max(...this.ids.map((id) => a.received[id])) : null;
      out.push({ id: a.id, origin: a.origin, gen: a.gen, operator: a.operator, to: a.to, received: { ...a.received }, reachedAll: all, reachedAllAt: lastAt, ticks: all ? lastAt - a.gen : null, withinK: all && this.k !== null && lastAt - a.gen <= this.k });
    }
    return out;
  }

  /** Is a move still held at a history row? Every knob on the far side of its old value, the strategy unchanged. */
  holds(a, row, id) {
    const c = row.configs[id];
    if (!c) return false;
    for (const [k, to] of Object.entries(a.to.config || {})) { const from = a.from.config[k]; if (!((c.config[k] - from) * (to - from) > 0)) return false; }
    if (a.to.strategy && c.strategy !== a.to.strategy) return false;
    return true;
  }

  /** Kept moves still held S generations after they were kept, by every organism (spread on) or their own (off). */
  survivors(S = this.cfg.survive) {
    const out = [];
    for (const a of this.archive.values()) {
      if (a.operator === 'planted') continue;
      const row = this.history.find((h) => h.g === a.gen + S);
      if (!row) continue;
      const who = this.spread ? this.ids : [a.origin];
      if (who.every((id) => this.holds(a, row, id))) out.push({ ...a, survivedTo: a.gen + S });
    }
    return out;
  }

  /** Held-out score of every organism's config at a history row: velocity's objective on the fresh draws. */
  heldOut(row = this.history[this.history.length - 1], seeds = this.cfg.heldSeeds) {
    const per = {};
    for (const id of this.ids) {
      const c = row.configs[id], xs = [];
      for (let s = 0; s < seeds; s++) {
        const b = burst(this.matrix, c.config, c.strategy, 'spread/held/s' + s, this.cfg.burstGens, this.cfg.burstPop);
        this.stats.measureGens += b.gens;
        xs.push(freshObjective(this.fresh, b.genome));
      }
      per[id] = mean(xs);
    }
    return { g: row.g, per, mean: mean(Object.values(per)) };
  }

  years() {
    return yearsArithmetic({ generations: this.stats.engineGens, popSize: this.cfg.burstPop, evals: this.stats.evals, wallMs: this.stats.wallMs });
  }
}

/**
 * k: the ticks a kept move needs to reach every organism, read off the connectome itself (every
 * ACTIVE edge from an organism's out port, 1 + delay ticks each). Infinity when one cannot reach another.
 */
export function conduitReach(brain, ids) {
  const idx = ids.map((id) => brain.byId.get(id).idx), cx = brain.connectome;
  let k = 0;
  for (const s of idx) {
    const dist = new Map([[s, 0]]), queue = [s];
    while (queue.length) {
      // a small graph: pick the nearest unfinished node (Dijkstra without a heap)
      queue.sort((a, b) => dist.get(a) - dist.get(b));
      const u = queue.shift();
      for (const e of cx.outOf(u)) {
        if (!(cx.flags[e] & ACTIVE)) continue;
        const v = cx.dst[e], d = dist.get(u) + 1 + cx.delay[e];
        if (!dist.has(v) || d < dist.get(v)) { dist.set(v, d); queue.push(v); }
      }
    }
    for (const t of idx) k = Math.max(k, dist.has(t) ? dist.get(t) : Infinity);
  }
  return k;
}

// ---------------------------------------------------------------- confirmation and promotion
/** The seeds a promotion is confirmed on and a --trial measures: fixed, so the real trial reproduces "before". */
export function promoteSeeds(n = SPREAD.promoteSeeds) { return Array.from({ length: n }, (_, i) => 'spread/promote/s' + i); }

/** The --trial metric: the mean searched objective of a config on the promotion seeds. */
export function trialMetric(matrix, config = OPTIONS, strategy = STRATEGY, { seeds = promoteSeeds(), cfg = SPREAD } = {}) {
  const xs = seeds.map((s) => burst(matrix, config, strategy, s, cfg.burstGens, cfg.burstPop).fitness);
  return { mean: mean(xs), xs };
}

/**
 * Confirm survivors on the file's own OPTIONS: base against base plus the move, on the promotion
 * seeds, the registry's range rule. One line per knob (the best confirmed move on it).
 */
export function confirmSurvivors(matrix, survivors, { options = OPTIONS, strategy = STRATEGY, cfg = SPREAD, floor = 0 } = {}) {
  const seeds = promoteSeeds(cfg.promoteSeeds);
  const base = seeds.map((s) => burst(matrix, options, strategy, s, cfg.burstGens, cfg.burstPop).fitness);
  const seen = new Set(), rows = [];
  for (const a of survivors) {
    const cfgTo = { ...options, ...(a.to.config || {}) }, stTo = a.to.strategy || strategy;
    const key = JSON.stringify([cfgTo, stTo]);
    if (seen.has(key)) continue;
    seen.add(key);
    const after = seeds.map((s) => burst(matrix, cfgTo, stTo, s, cfg.burstGens, cfg.burstPop).fitness);
    const gain = mean(after.map((x, i) => x - base[i]));
    const noise = noiseOf('range', after, base, floor);
    rows.push({ move: a, config: cfgTo, strategy: stTo, before: r6(mean(base)), after: r6(mean(after)), gain: r6(gain), noise: r6(noise), confirmed: gain > noise, beforeXs: base.map(r6), afterXs: after.map(r6) });
  }
  // one line per knob set: the best confirmed gain
  const best = new Map();
  for (const r of rows.filter((x) => x.confirmed)) {
    const key = Object.keys(r.move.to.config || {}).sort().join('+') + (r.move.to.strategy ? '+strategy' : '');
    if (!best.has(key) || r.gain > best.get(key).gain) best.set(key, r);
  }
  return { rows, confirmed: [...best.values()].sort((a, b) => b.gain - a.gain).slice(0, cfg.maxPromote), baseXs: base.map(r6), seeds };
}

/** The ledger trial of a promoted line: bench/spread.mjs --trial on a copy of the tree, "metric <n>" on stdout. */
export function promotedTrial() {
  const argv = ['--max-old-space-size=6000', 'bench/spread.mjs', '--trial', '--cache', '{tmp}/spread-mx'];
  return {
    key: 'spread-trial', command: 'node tools/budget.mjs --ram-mb 6000 --disk-mb 64 --dir <copy> -- node ' + argv.map((a) => a.replaceAll('{tmp}', '<copy>/tmp')).join(' '),
    minutes: 2, needsModel: false, writes: [], where: 'copy', bench: 'bench/spread.mjs', argv, parser: null, runner: 'budget', dry: null, seed: null, fixtures: [], trader: false,
    ramMb: 6000, diskMb: 64, metric: { regex: '^metric (-?[0-9.eE+-]+)$' },
    doc: 'bench/spread.mjs --trial prints the mean searched objective of generations/spread.mjs OPTIONS and STRATEGY on the ' + SPREAD.promoteSeeds + ' promotion seeds, one "metric <n>" line',
  };
}

/** The ledger line of one confirmed survivor. */
export function promotedLine(row, { runTag, at = new Date().toISOString(), options = OPTIONS } = {}) {
  const a = row.move;
  const knobs = Object.keys(a.to.config || {}).sort();
  const what = knobs.map((k) => 'OPTIONS.' + k + ' ' + options[k] + ' -> ' + row.config[k]).concat(a.to.strategy ? ['STRATEGY ' + STRATEGY + ' -> ' + a.to.strategy] : []).join(', ');
  const trial = promotedTrial();
  return {
    id: 'promoted:spread:' + (knobs.join('+') || 'strategy') + ':' + runTag,
    kind: PROMOTED_KIND, subsystem: 'generations',
    measured: row.before, bar: row.after, unit: 'searched objective of a ' + SPREAD.burstGens + '-generation velocity burst, mean of ' + SPREAD.promoteSeeds + ' seeds (simulated)',
    distance: r6(row.after - row.before),
    verdictFile: 'bench/verdicts/spread.json', benchCommand: 'node tools/budget.mjs --ram-mb 6000 --disk-mb 64 --dir <out> -- node --max-old-space-size=6000 bench/spread.mjs',
    trial, files: [REL], since: at, better: 'higher',
    why: 'promoted from simulation: ' + what + ' was kept by ' + a.origin + ' (' + a.operator + ') at generation ' + a.gen + ' of run ' + runTag + ', held by every organism ' + SPREAD.survive
      + ' generations later, and confirmed on the file own OPTIONS: before ' + row.before + ', after ' + row.after + ' (gain ' + row.gain + ' over the range noise ' + row.noise + ')',
    author: 'organism (' + a.operator + ')',
    simulated: {
      before: row.before, after: row.after, gain: row.gain, noise: row.noise, beforeXs: row.beforeXs, afterXs: row.afterXs,
      knobs: Object.fromEntries(knobs.map((k) => [k, { asRead: options[k], to: row.config[k] }])), strategy: a.to.strategy || null,
      keptBy: a.origin, operator: a.operator, gen: a.gen, survivedTo: a.survivedTo, trialBefore: a.before, trialAfter: a.after, trialGain: a.gain, trialNoise: a.noise, rule: a.rule, run: runTag,
    },
  };
}

/**
 * Write promoted lines: through self/gaps.mjs readLedger + writeLedger when it exists (the old ledger kept
 * as gaps-<date>.jsonl, the writer's own rule), else appended directly, and always appended to
 * state/self/spread-promoted.jsonl (the gaps item rewrites the ledger whole and keeps only its own kinds).
 * With spread off nothing is written. The writer is this tree's code (gapsFile); root is where the data goes.
 */
export async function promote(lines, { root = ROOT, spread = true, say = () => {}, gapsFile = path.join(ROOT, 'self', 'gaps.mjs') } = {}) {
  if (!spread) return { written: 0, how: 'spread off: nothing is promoted', file: null };
  if (!lines.length) return { written: 0, how: 'no confirmed survivor', file: null };
  mkdirSync(path.join(root, 'state', 'self'), { recursive: true });
  let how, report = null;
  if (existsSync(gapsFile)) {
    const g = await import(pathToFileURL(gapsFile).href);
    const { lines: old } = g.readLedger(root);
    const ids = new Set(lines.map((l) => l.id));
    report = g.writeLedger(old.filter((l) => !ids.has(l.id)).concat(lines), { root });
    how = 'self/gaps.mjs writeLedger (' + report.lines + ' lines' + (report.previous ? ', the previous file kept as ' + report.previous : '') + ')';
  } else {
    appendFileSync(path.join(root, 'state', 'self', 'gaps.jsonl'), lines.map((l) => JSON.stringify(l)).join('\n') + '\n');
    how = 'self/gaps.mjs is absent: appended directly to state/self/gaps.jsonl';
    say('spread: ' + how);
  }
  appendFileSync(path.join(root, PROMOTED_REL), lines.map((l) => JSON.stringify(l)).join('\n') + '\n');
  return { written: lines.length, how, file: 'state/self/gaps.jsonl', copy: PROMOTED_REL, report };
}

export { loadRegistry };
