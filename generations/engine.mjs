// generations/engine.mjs: THE LOOP. Time x amount x generations. A population of circuits
// is evaluated, split into species, and replaced by offspring of the parents that earned
// slots; the whole history goes into an open ended archive that also supplies parents. Each
// generation advances the host brain's generation clock, which is the second axis of
// core/clock.mjs: many episodes per wall second, independent of wall ticks.
//
// Two things are deliberately not shortcuts:
//   1. A champion is never "promoted" by the loop itself. It is a Proposal to the host
//      brain's gate, with evidence, and the gate decides. Computation is not authority.
//   2. The evidence includes beatControl, measured against a control population that is
//      mutated the same way but never selected. A generational loop always produces a
//      rising best-so-far curve; the control is what says whether selection did it.
import { Brain } from '../core/brain.mjs';
import { RNG } from '../core/rng.mjs';
import { Innovations, genomeToJSON, genomeStats, validate } from './genome.mjs';
import { mutate, DEFAULT_RATES, DEFAULT_LIMITS } from './mutate.mjs';
import { crossover } from './crossover.mjs';
import { Speciation } from './species.mjs';
import { Archive } from './archive.mjs';
import { Pool, evaluateSerial, workerCount } from './evaluate.mjs';
import { getTask, seedsFor } from './tasks/index.mjs';

export const DEFAULTS = Object.freeze({
  popSize: 150,
  episodes: 2,
  islands: 2,
  migrateEvery: 10,
  elitism: 1,            // genomes copied unchanged per species
  crossoverRate: 0.7,
  archiveParents: 0.25,  // share of offspring whose parents come from the archive mix
  controlSize: 24,
  survivalTop: 0.4,      // fraction of a species allowed to breed
  targetSpecies: 8,
});

export class Engine {
  constructor({
    task = 'race', cfg = null, brain = null, seed = 'evolve',
    popSize = DEFAULTS.popSize, episodes = DEFAULTS.episodes, islands = DEFAULTS.islands,
    migrateEvery = DEFAULTS.migrateEvery, elitism = DEFAULTS.elitism,
    crossoverRate = DEFAULTS.crossoverRate, archiveParents = DEFAULTS.archiveParents,
    controlSize = DEFAULTS.controlSize, survivalTop = DEFAULTS.survivalTop,
    targetSpecies = DEFAULTS.targetSpecies,
    rates = DEFAULT_RATES, limits = DEFAULT_LIMITS,
    pool = null, workers = workerCount(), parallel = true,
  } = {}) {
    this.taskName = task;
    this.task = getTask(task);
    this.cfg = cfg || this.task.config;
    this.seed = seed;
    this.rng = new RNG('engine:' + seed);
    this.innov = new Innovations();
    this.popSize = popSize;
    this.episodes = episodes;
    this.seeds = seedsFor(String(seed), episodes);
    this.islands = Math.max(1, islands);
    this.migrateEvery = migrateEvery;
    this.elitism = elitism;
    this.crossoverRate = crossoverRate;
    this.archiveParents = archiveParents;
    this.controlSize = controlSize;
    this.survivalTop = survivalTop;
    this.rates = rates;
    this.limits = limits;

    this.brain = brain || new Brain({ name: 'generations', seed: 'generations:' + seed, ledger: 'runs' });
    this.brain.addRegion('generations', { doc: 'the generations engine: population, species, archive' });

    this.speciation = new Speciation({ targetSpecies, elitism });
    this.archive = new Archive({ rng: this.rng.fork('archive'), islands: this.islands });

    this.parallel = parallel;
    this.pool = pool || (parallel ? new Pool({ task, cfg: this.cfg, size: workers }) : null);
    this.workers = this.pool ? this.pool.size : 1;

    this.gen = 0;
    this.population = [];
    this.control = [];
    this.scored = [];
    this.champion = null;        // the best genome the GATE approved, never the raw best
    this.bestSoFar = -Infinity;  // fitness of the approved champion
    this.rawBest = null;
    this.history = [];
    this.stats = { generations: 0, genomes: 0, episodes: 0, proposals: 0, promoted: 0, rejected: 0, evalMs: 0 };
    this._nextId = 0;
  }

  id(tag) { return tag + (this._nextId++); }

  init() {
    const seedGenome = this.task.seedGenome(this.innov, this.cfg);
    const problems = validate(seedGenome);
    if (problems.length) throw new Error('engine: seed genome invalid: ' + problems.join('; '));
    this.seedGenome = seedGenome;
    this.population = [];
    for (let i = 0; i < this.popSize; i++) {
      const g = mutate(seedGenome, { rng: this.rng, innov: this.innov, palette: this.task.palette, width: this.task.width, rates: this.rates, limits: this.limits, id: this.id('g') });
      g.meta.gen = 0;
      g.meta.island = i % this.islands;
      g.meta.parents = ['seed'];
      this.population.push(g);
    }
    this.control = [];
    for (let i = 0; i < this.controlSize; i++) {
      const g = mutate(seedGenome, { rng: this.rng, innov: this.innov, palette: this.task.palette, width: this.task.width, rates: this.rates, limits: this.limits, id: this.id('ctl') });
      g.meta.gen = 0;
      g.meta.parents = ['seed'];
      this.control.push(g);
    }
    this.brain.log({ type: 'generations.init', task: this.taskName, popSize: this.popSize, islands: this.islands, episodes: this.episodes, seeds: this.seeds, workers: this.workers });
    return this;
  }

  async _score(genomes) {
    const t0 = process.hrtime.bigint();
    const results = this.pool
      ? await this.pool.evaluate(genomes, { seeds: this.seeds })
      : evaluateSerial(genomes, { task: this.taskName, seeds: this.seeds, cfg: this.cfg });
    this.stats.evalMs += Number(process.hrtime.bigint() - t0) / 1e6;
    this.stats.genomes += genomes.length;
    this.stats.episodes += genomes.length * this.seeds.length;
    return genomes.map((genome, i) => ({
      genome,
      fitness: Number.isFinite(results[i]?.fitness) ? results[i].fitness : 0,
      descriptors: results[i]?.descriptors || [],
      extras: results[i]?.extras || {},
    }));
  }

  // One generation. Returns the summary that also goes into the ledger.
  async step() {
    const gen = this.gen;
    const scored = await this._score(this.population);
    const controlScored = this.controlSize ? await this._score(this.control) : [];
    this.scored = scored;

    for (const s of scored) {
      this.archive.add({ id: s.genome.id, genome: s.genome, fitness: s.fitness, descriptors: s.descriptors, gen, island: s.genome.meta.island });
    }

    this.speciation.speciate(scored, gen);
    this.speciation.shareFitness();
    const removed = this.speciation.removeStagnant(gen);
    this.speciation.adjustThreshold();

    const ranked = [...scored].sort((a, b) => b.fitness - a.fitness);
    const best = ranked[0];
    const mean = scored.reduce((s, x) => s + x.fitness, 0) / scored.length;
    const bestControl = controlScored.length ? Math.max(...controlScored.map((x) => x.fitness)) : -Infinity;
    this.rawBest = best;

    // promotion is a proposal, never an assignment
    const gain = best.fitness - (this.bestSoFar === -Infinity ? 0 : this.bestSoFar);
    const beatControl = controlScored.length ? best.fitness > bestControl : false;
    let decision = null;
    if (best.fitness > this.bestSoFar) {
      const p = this.brain.gate.propose({
        kind: 'genome.promote',
        what: { id: best.genome.id, gen, cells: genomeStats(best.genome).cells, edges: best.genome.edges.length },
        why: 'best of generation ' + gen,
        evidence: { gain, beatControl, fitness: best.fitness, control: bestControl === -Infinity ? null : bestControl, episodes: this.seeds.length },
        by: 'generations.engine',
      }, { t: this.brain.clock.t, gen });
      this.stats.proposals++;
      decision = p.status;
      if (p.status === 'approved') {
        this.champion = { genome: genomeToJSON(best.genome), fitness: best.fitness, gen, descriptors: best.descriptors, extras: best.extras };
        this.bestSoFar = best.fitness;
        this.stats.promoted++;
      } else {
        this.stats.rejected++;
      }
    }

    const summary = {
      gen,
      best: best.fitness,
      mean,
      champion: this.champion ? this.champion.fitness : null,
      control: bestControl === -Infinity ? null : bestControl,
      beatControl,
      decision,
      species: this.speciation.species.length,
      threshold: Number(this.speciation.threshold.toFixed(3)),
      stagnantRemoved: removed,
      cells: genomeStats(best.genome).cells,
      edges: best.genome.edges.length,
      archive: this.archive.size(),
      bins: this.archive.grid.size,
      extras: best.extras,
    };
    this.history.push(summary);
    this.brain.log({ type: 'generation', ...summary });

    this.population = this.reproduce(scored, gen);
    this.control = this.driftControl(controlScored, gen);
    this.brain.clock.advanceGen(1);
    this.gen++;
    this.stats.generations++;
    return summary;
  }

  // Offspring: species elites survive unchanged, the rest are crossover plus mutation from
  // parents drawn inside the species, with a share of parents pulled from the archive mix
  // (best so far, novelty, random) so a lineage that left the population can come back.
  reproduce(scored, gen) {
    const alloc = this.speciation.allocate(this.popSize);
    const next = [];
    const species = this.speciation.species;
    const migrants = this.migrateEvery && gen > 0 && gen % this.migrateEvery === 0 ? this.archive.migrate() : [];
    for (const m of migrants) { m.genome.id = this.id('mig'); m.genome.meta.gen = gen + 1; next.push(m.genome); }

    for (let si = 0; si < species.length && next.length < this.popSize; si++) {
      const s = species[si];
      let slots = alloc[si] ?? 1;
      if (next.length + slots > this.popSize) slots = this.popSize - next.length;
      const pool = s.members.slice(0, Math.max(1, Math.ceil(s.members.length * this.survivalTop)));
      for (let k = 0; k < this.elitism && k < pool.length && slots > 0; k++) {
        const e = { ...pool[k].genome };
        const copy = { ...e, cells: e.cells.map((c) => ({ ...c, params: { ...c.params }, lock: [...(c.lock || [])] })), edges: e.edges.map((x) => ({ ...x })), meta: { ...e.meta, gen: gen + 1, mutations: ['elite'] } };
        copy.id = this.id('e');
        next.push(copy);
        slots--;
      }
      for (let k = 0; k < slots; k++) {
        const useArchive = this.rng.next() < this.archiveParents;
        let a, b, fa, fb;
        if (useArchive) {
          const picks = this.archive.sampleParents(2, { island: null });
          a = picks[0]?.genome || pool[0].genome; fa = picks[0]?.entry.fitness ?? 0;
          b = picks[1]?.genome || pool[0].genome; fb = picks[1]?.entry.fitness ?? 0;
        } else {
          const pa = pool[this.rng.int(pool.length)], pb = pool[this.rng.int(pool.length)];
          a = pa.genome; fa = pa.fitness; b = pb.genome; fb = pb.fitness;
        }
        let child;
        if (a !== b && this.rng.next() < this.crossoverRate) {
          child = crossover(a, b, { rng: this.rng, fitA: fa, fitB: fb, id: this.id('c') });
        } else {
          child = { ...a, cells: a.cells.map((c) => ({ ...c, params: { ...c.params }, lock: [...(c.lock || [])] })), edges: a.edges.map((x) => ({ ...x })), meta: { ...a.meta, parents: [a.id] } };
        }
        child = mutate(child, { rng: this.rng, innov: this.innov, palette: this.task.palette, width: this.task.width, rates: this.rates, limits: this.limits, id: this.id('g') });
        child.meta.gen = gen + 1;
        child.meta.island = (a.meta.island ?? 0);
        next.push(child);
      }
    }
    // top up from the archive if speciation under-filled the population
    while (next.length < this.popSize) {
      const pick = this.archive.sampleParents(1)[0];
      const base = pick ? pick.genome : this.seedGenome;
      const child = mutate(base, { rng: this.rng, innov: this.innov, palette: this.task.palette, width: this.task.width, rates: this.rates, limits: this.limits, id: this.id('g') });
      child.meta.gen = gen + 1;
      next.push(child);
    }
    return next.slice(0, this.popSize);
  }

  // The control: the same mutation operator, the same rates, the same number of genomes,
  // and no selection at all. It is a random walk through genome space, so any gap between
  // it and the population is what selection bought.
  driftControl(controlScored, gen) {
    const out = [];
    for (const c of (controlScored.length ? controlScored.map((x) => x.genome) : this.control)) {
      const g = mutate(c, { rng: this.rng, innov: this.innov, palette: this.task.palette, width: this.task.width, rates: this.rates, limits: this.limits, id: this.id('ctl') });
      g.meta.gen = gen + 1;
      out.push(g);
    }
    return out;
  }

  // Run until one of the stop conditions is met. Every condition is optional; with none the
  // engine runs one generation.
  async run({ generations = 1, untilFitness = null, untilMs = null, onGeneration = null } = {}) {
    const t0 = Date.now();
    const out = [];
    for (let i = 0; i < generations; i++) {
      const s = await this.step();
      out.push(s);
      if (onGeneration) onGeneration(s, this);
      if (untilFitness != null && this.champion && this.champion.fitness >= untilFitness) break;
      if (untilMs != null && Date.now() - t0 >= untilMs) break;
    }
    return out;
  }

  summary() {
    return {
      task: this.taskName,
      generations: this.stats.generations,
      popSize: this.popSize,
      episodes: this.episodes,
      workers: this.workers,
      champion: this.champion ? { fitness: this.champion.fitness, gen: this.champion.gen, cells: this.champion.genome.cells.length, edges: this.champion.genome.edges.length } : null,
      gate: { ...this.brain.gate.stats },
      species: this.speciation.summary(),
      archive: this.archive.summary(),
      stats: this.stats,
      clockGen: this.brain.clock.gen,
    };
  }

  async close() { if (this.pool) await this.pool.close(); }
}

export async function evolve(opts = {}) {
  const e = new Engine(opts).init();
  try {
    const history = await e.run(opts);
    return { engine: e, history, summary: e.summary() };
  } finally {
    if (opts.keepOpen !== true) await e.close();
  }
}
