// generations/epochs.mjs: DEEP TIME. A generational search over whole organisms that is
// meant to be left running, so three things it would otherwise not need are built in:
//
//   1. an archive that keeps DIFFERENT organisms, not only better ones. MAP-Elites over
//      four behaviour descriptors: how evenly the regions carry the firing load, how far
//      signals travel in ticks, how much of the organism ever fires, and how mixed its cell
//      kinds are. One elite per cell of that grid. A search that keeps only the best
//      converges on one shape and then has nothing left to recombine; this one cannot,
//      because a cell of the grid can only be taken by an organism that behaves like that
//      cell. Novelty, the distance from a candidate's behaviour to the nearest behaviour
//      already held, is fed back into the objective, so being unlike everything alive is
//      worth something on its own. That is the creativity term, and it is a number.
//
//   2. a checkpoint every K generations, and a resume that continues the generation
//      counter rather than restarting it. A run that cannot be resumed is a run whose
//      length is capped by the patience of whoever started it.
//
//   3. a years clock. A generation is a declared number of organism-years and the
//      declaration is in the manifest, not in the prose: ticks per generation, organisms
//      per generation, and seconds per tick. core/clock.mjs declares one tick to be one
//      millisecond of organism time, so secondsPerTick is 0.001 unless a caller says
//      otherwise, and every years number this file prints comes with the arithmetic that
//      produced it.
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RNG } from '../core/rng.mjs';
import { emitOrganism } from '../genome/emit.mjs';
import {
  defaultOrganismGenome, randomOrganismGenome, cloneOrganismGenome,
  organismGenomeToJSON, organismGenomeFromJSON,
  mutateOrganismGenome, crossoverOrganismGenomes, validateOrganismGenome,
  evaluateOrganismGenome, buildFromOrganismGenome, descriptorVector,
  OBJECTIVE_WEIGHTS,
} from './organism-genome.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const BRAIN_ROOT = path.resolve(HERE, '..');

// A Julian year in seconds: 365.25 days. Written here as one constant so every years
// number in this project divides by the same one.
export const SECONDS_PER_YEAR = 31_557_600;
// core/clock.mjs: "1 tick = 1 ms logical".
export const DEFAULT_SECONDS_PER_TICK = 0.001;

// ---------------------------------------------------------------- MAP-Elites
// The descriptor space, one axis per behaviour descriptor, with the edges of each axis
// declared. A value outside the edges falls in the first or last bin; nothing is dropped.
export const DESCRIPTOR_AXES = Object.freeze([
  { key: 'regionEntropy', edges: [0.2, 0.4, 0.6, 0.75, 0.85, 0.93] },
  { key: 'meanDelay', edges: [1, 2, 4, 8, 16, 32] },
  { key: 'firingFraction', edges: [0.05, 0.15, 0.3, 0.5, 0.7, 0.9] },
  { key: 'kindEntropy', edges: [0.5, 0.7, 0.85, 0.93, 0.97, 0.99] },
]);

/** The number of cells the grid could hold if every combination were reachable. */
export function gridCapacity() { return DESCRIPTOR_AXES.reduce((a, ax) => a * (ax.edges.length + 1), 1); }

/** @param {object} desc @returns {string} the grid cell a behaviour falls in */
export function binOf(desc) {
  const parts = [];
  for (const ax of DESCRIPTOR_AXES) {
    const v = Number(desc[ax.key]);
    let b = 0;
    while (b < ax.edges.length && Number.isFinite(v) && v > ax.edges[b]) b++;
    parts.push(b);
  }
  return parts.join('-');
}

export class OrganismArchive {
  constructor({ noveltyK = 4 } = {}) {
    this.cells = new Map();   // binKey -> elite entry
    this.noveltyK = noveltyK;
    this.fillHistory = [];    // [generation, cells filled] after each generation
    this.stats = { evaluated: 0, placed: 0, replaced: 0, rejected: 0, emitted: 0 };
  }

  /**
   * Offer an evaluation to the grid. It takes the cell if the cell is empty or if it beats
   * what is there. Nothing else is kept: the grid IS the population.
   * @param {object} entry { id, genome, fitness, components, descriptors, gen }
   * @returns {{ placed: boolean, key: string, replacedId: string|null }}
   */
  add(entry) {
    this.stats.evaluated++;
    const key = binOf(entry.descriptors);
    const held = this.cells.get(key);
    const e = {
      key, id: entry.id, fitness: entry.fitness,
      components: entry.components, descriptors: entry.descriptors,
      vector: descriptorVector(entry.descriptors),
      gen: entry.gen ?? 0, genome: organismGenomeToJSON(entry.genome),
      cells: entry.cells ?? null, edges: entry.edges ?? null,
      parents: entry.genome?.meta?.parents || [], mutations: entry.genome?.meta?.mutations || [],
      emitted: held ? held.emitted : null,
    };
    if (!held) { this.cells.set(key, e); this.stats.placed++; return { placed: true, key, replacedId: null, first: true }; }
    if (entry.fitness > held.fitness) { this.cells.set(key, e); this.stats.replaced++; return { placed: true, key, replacedId: held.id, first: false }; }
    this.stats.rejected++;
    return { placed: false, key, replacedId: null, first: false };
  }

  /**
   * Distance from a behaviour vector to the mean of its k nearest neighbours in the grid.
   * Zero when the grid is empty, so an empty archive pays no novelty to anybody.
   * @param {number[]} vec @param {number} [k]
   * @returns {number}
   */
  novelty(vec, k = this.noveltyK) {
    if (!this.cells.size) return 0;
    const ds = [];
    for (const e of this.cells.values()) {
      let s = 0;
      for (let i = 0; i < vec.length; i++) { const d = vec[i] - (e.vector[i] ?? 0); s += d * d; }
      ds.push(Math.sqrt(s));
    }
    ds.sort((a, b) => a - b);
    const n = Math.min(k, ds.length);
    let sum = 0;
    for (let i = 0; i < n; i++) sum += ds[i];
    return n ? sum / n : 0;
  }

  elites() { return [...this.cells.values()]; }
  fill() { return this.cells.size; }
  best() {
    let b = null;
    for (const e of this.cells.values()) if (!b || e.fitness > b.fitness) b = e;
    return b;
  }
  /** Mean fitness over the grid: the quality-diversity score a MAP-Elites run reports. */
  qdScore() {
    let s = 0;
    for (const e of this.cells.values()) s += e.fitness;
    return s;
  }
  toJSON() { return { v: 1, noveltyK: this.noveltyK, stats: this.stats, fillHistory: this.fillHistory, cells: [...this.cells.entries()] }; }
  static fromJSON(j) {
    const a = new OrganismArchive({ noveltyK: j.noveltyK });
    a.stats = { ...a.stats, ...j.stats };
    a.fillHistory = j.fillHistory || [];
    a.cells = new Map(j.cells);
    return a;
  }
}

// ---------------------------------------------------------------- the engine
export class Epochs {
  /**
   * @param {object} [opts]
   * @param {string} [opts.seed]
   * @param {number} [opts.popSize] organisms evaluated per generation
   * @param {number} [opts.ticks] ticks each organism is run for
   * @param {number} [opts.windows] windows those ticks are split into
   * @param {number} [opts.checkpointEvery] generations between checkpoints, 0 to disable
   * @param {string} [opts.dir] checkpoint directory, default brain/state/generations
   * @param {number} [opts.secondsPerTick] the declared organism-seconds one tick is worth
   * @param {number} [opts.crossoverRate]
   * @param {number} [opts.mutationRate] expected mutation operators applied per child
   * @param {boolean} [opts.emit] emit every elite that enters the archive as source
   * @param {number} [opts.emitLimit] stop emitting after this many elites
   * @param {object} [opts.scale] the box random generation zero genomes are drawn from
   */
  constructor({
    seed = 'epochs', popSize = 12, ticks = 160, windows = 4,
    checkpointEvery = 10, dir = null, secondsPerTick = DEFAULT_SECONDS_PER_TICK,
    crossoverRate = 0.35, mutationRate = 2, suites = true,
    emit = false, emitLimit = 20, emitDir = null, releaseOrganisms = false,
    scale = { majors: [16, 48], subcellsPerMajor: [3, 6], edgesPerCell: [4, 10], localWindow: [2, 8] },
  } = {}) {
    this.seed = String(seed);
    this.popSize = Math.max(2, popSize);
    this.ticks = Math.max(4, ticks);
    this.windows = Math.max(2, windows);
    this.checkpointEvery = checkpointEvery;
    this.dir = dir ? path.resolve(dir) : path.join(BRAIN_ROOT, 'state', 'generations');
    this.emitDir = emitDir ? path.resolve(emitDir) : path.join(BRAIN_ROOT, 'organism');
    this.secondsPerTick = secondsPerTick;
    this.crossoverRate = crossoverRate;
    this.mutationRate = mutationRate;
    this.suites = suites;
    // An organism this search discards hands its hypervector slots back the moment its scores
    // have been read. Nothing the archive keeps is a vector (it keeps a genome as JSON), so
    // no elite and no survivor can be holding one of them. Off by default: the walk that finds
    // them costs wall clock, and only a caller that is running out of heap should pay it.
    this.releaseOrganisms = releaseOrganisms;
    this.emit = emit;
    this.emitLimit = emitLimit;
    this.scale = scale;
    this.rng = new RNG(this.seed + ':epochs');
    this.archive = new OrganismArchive();
    this.generation = 0;
    this.totalTicks = 0;
    this.totalOrganisms = 0;
    this.emissions = [];       // { dir, gen, key, id, lines, files, cells, edges }
    this.emittedLines = 0;
    this.history = [];         // one row per generation
    this.stats = { evalMs: 0, emitMs: 0, checkpoints: 0, resumed: 0, errors: 0 };
    this.lastError = null;
  }

  /** The manifest: every declared number the years clock is computed from. */
  manifest() {
    return {
      seed: this.seed,
      popSize: this.popSize,
      ticksPerOrganism: this.ticks,
      windows: this.windows,
      secondsPerTick: this.secondsPerTick,
      secondsPerYear: SECONDS_PER_YEAR,
      ticksPerGeneration: this.ticks * this.popSize,
      organismSecondsPerGeneration: this.ticks * this.popSize * this.secondsPerTick,
      yearsPerGeneration: (this.ticks * this.popSize * this.secondsPerTick) / SECONDS_PER_YEAR,
      yearsPerLineageGeneration: (this.ticks * this.secondsPerTick) / SECONDS_PER_YEAR,
      weights: OBJECTIVE_WEIGHTS,
      crossoverRate: this.crossoverRate,
      mutationRate: this.mutationRate,
      suites: this.suites,
    };
  }

  /**
   * The years clock, with the arithmetic that produced it.
   * @returns {{ generations, organisms, ticks, organismSeconds, years, lineageYears, arithmetic }}
   */
  years() {
    const organismSeconds = this.totalTicks * this.secondsPerTick;
    const yrs = organismSeconds / SECONDS_PER_YEAR;
    const lineage = (this.generation * this.ticks * this.secondsPerTick) / SECONDS_PER_YEAR;
    return {
      generations: this.generation,
      organisms: this.totalOrganisms,
      ticks: this.totalTicks,
      secondsPerTick: this.secondsPerTick,
      organismSeconds,
      years: yrs,
      lineageYears: lineage,
      arithmetic: this.totalOrganisms + ' organisms x ' + this.ticks + ' ticks = ' + this.totalTicks +
        ' ticks; ' + this.totalTicks + ' x ' + this.secondsPerTick + ' s/tick = ' + organismSeconds.toFixed(3) +
        ' organism-seconds; / ' + SECONDS_PER_YEAR + ' s/year = ' + yrs.toExponential(6) + ' organism-years',
    };
  }

  /** Seed generation zero: the organism seeds/organism.mjs describes, plus random draws. */
  init() {
    this.seedGenomes = [defaultOrganismGenome({
      id: 'og-seed', seed: this.seed,
      majors: mid(this.scale.majors), subcellsPerMajor: mid(this.scale.subcellsPerMajor),
      edgesPerCell: mid(this.scale.edgesPerCell), localWindow: mid(this.scale.localWindow),
    })];
    for (let i = 1; i < this.popSize; i++) {
      this.seedGenomes.push(randomOrganismGenome(this.rng, { id: 'og-r' + i, seed: this.seed, ...this.scale }));
    }
    return this;
  }

  /** Build this generation's candidates out of the archive, or out of the seeds at gen 0. */
  population() {
    if (!this.archive.fill()) return (this.seedGenomes || this.init().seedGenomes).map(cloneOrganismGenome);
    const elites = this.archive.elites();
    const out = [];
    for (let i = 0; i < this.popSize; i++) {
      const a = organismGenomeFromJSON(elites[this.rng.int(elites.length)].genome);
      let child;
      if (elites.length > 1 && this.rng.next() < this.crossoverRate) {
        const b = organismGenomeFromJSON(elites[this.rng.int(elites.length)].genome);
        child = crossoverOrganismGenomes(a, b, this.rng, { id: 'og-g' + this.generation + '-' + i });
        child = mutateOrganismGenome(child, this.rng, { rate: Math.max(1, this.mutationRate - 1), id: child.id });
        child.meta.parents = [a.id, b.id];
      } else {
        child = mutateOrganismGenome(a, this.rng, { rate: this.mutationRate, id: 'og-g' + this.generation + '-' + i });
      }
      child.meta.gen = this.generation;
      out.push(child);
    }
    return out;
  }

  /**
   * Run one generation. Every candidate is evaluated with a novelty callback bound to the
   * archive AS IT STANDS AT THE START of the generation, so two candidates in the same
   * generation are scored against the same archive and the order they are evaluated in
   * cannot change their fitness.
   * @returns {object} the generation row
   */
  step() {
    const t0 = process.hrtime.bigint();
    const snapshot = this.archive.elites().map((e) => e.vector);
    const novelty = (vec) => nearestMean(vec, snapshot, this.archive.noveltyK);
    const pop = this.population();
    const rows = [];
    let placed = 0, replaced = 0, releasedSlots = 0, releaseMs = 0;
    const before = this.archive.fill();

    for (const genome of pop) {
      let ev;
      try {
        ev = evaluateOrganismGenome(genome, {
          ticks: this.ticks, windows: this.windows,
          seed: this.seed + ':g' + this.generation, novelty, suites: this.suites,
          release: this.releaseOrganisms,
        });
      } catch (err) {
        this.stats.errors++;
        this.lastError = String(err && err.message ? err.message : err);
        continue;
      }
      this.totalTicks += ev.ticks;
      this.totalOrganisms++;
      releasedSlots += ev.releasedSlots || 0;
      releaseMs += ev.releaseMs || 0;
      const r = this.archive.add({ ...ev, genome, gen: this.generation });
      if (r.placed) { placed++; if (!r.first) replaced++; }
      if (r.placed && this.emit) this.emitElite(this.archive.cells.get(r.key));
      rows.push({ id: ev.id, fitness: ev.fitness, key: r.key, placed: r.placed, components: ev.components, cells: ev.cells, edges: ev.edges });
    }

    this.generation++;
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    this.stats.evalMs += ms;
    this.archive.fillHistory.push([this.generation, this.archive.fill()]);

    const best = this.archive.best();
    const fits = rows.map((r) => r.fitness);
    const row = {
      gen: this.generation,
      evaluated: rows.length,
      placed, replaced,
      fillBefore: before, fill: this.archive.fill(), newCells: this.archive.fill() - before,
      best: best ? best.fitness : 0,
      bestKey: best ? best.key : null,
      genBest: fits.length ? Math.max(...fits) : 0,
      genMean: fits.length ? fits.reduce((a, v) => a + v, 0) / fits.length : 0,
      qd: Number(this.archive.qdScore().toFixed(6)),
      ms: Number(ms.toFixed(1)),
      releasedSlots, releaseMs: Number(releaseMs.toFixed(1)),
      years: this.years().years,
      emitted: this.emissions.length,
      emittedLines: this.emittedLines,
    };
    this.history.push(row);
    if (this.checkpointEvery && this.generation % this.checkpointEvery === 0) this.checkpoint();
    return row;
  }

  /**
   * Write one elite out as source under organism/gen-<generation>-<slot>/. The slot is the
   * grid cell, so an elite that is replaced later overwrites its own directory and the tree
   * holds one directory per behaviour rather than one per evaluation.
   * @param {object} elite
   * @returns {object|null} the emission record
   */
  emitElite(elite) {
    if (!elite || this.emissions.length >= this.emitLimit) return null;
    const t0 = process.hrtime.bigint();
    const name = 'gen-' + elite.gen + '-' + elite.key;
    const dir = path.join(this.emitDir, name);
    let out;
    try {
      const { brain } = buildFromOrganismGenome(organismGenomeFromJSON(elite.genome), { name, seed: 'emit' });
      out = emitOrganism(brain, { dir, clean: true });
    } catch (err) {
      this.stats.errors++;
      this.lastError = 'emit ' + name + ': ' + String(err && err.message ? err.message : err);
      return null;
    }
    this.stats.emitMs += Number(process.hrtime.bigint() - t0) / 1e6;
    this.archive.stats.emitted++;
    const rec = {
      dir: path.relative(BRAIN_ROOT, out.dir).replaceAll('\\', '/'),
      gen: elite.gen, key: elite.key, id: elite.id,
      lines: out.lines, files: out.files.length + 1,
      cells: out.counts.cells, edges: out.counts.edges, hash: out.hash,
    };
    // A re-emitted slot replaces its own record, so the line total is the tree on disk and
    // not a running sum of everything ever written to the same directory.
    const prev = this.emissions.findIndex((e) => e.key === rec.key && e.gen === rec.gen);
    if (prev >= 0) { this.emittedLines -= this.emissions[prev].lines; this.emissions[prev] = rec; }
    else this.emissions.push(rec);
    this.emittedLines += rec.lines;
    elite.emitted = rec.dir;
    return rec;
  }

  /** Count the physical lines actually on disk under the emitted directories. */
  countEmittedLines() {
    let lines = 0, files = 0;
    for (const e of this.emissions) {
      const dir = path.join(BRAIN_ROOT, e.dir);
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir)) {
        lines += readFileSync(path.join(dir, f), 'utf8').split('\n').length;
        files++;
      }
    }
    return { lines, files };
  }

  // ------------------------------------------------------------ checkpoints
  /** @returns {string} the file written */
  checkpoint() {
    mkdirSync(this.dir, { recursive: true });
    const j = {
      v: 1, when: new Date().toISOString(),
      seed: this.seed, generation: this.generation,
      config: {
        popSize: this.popSize, ticks: this.ticks, windows: this.windows,
        checkpointEvery: this.checkpointEvery, secondsPerTick: this.secondsPerTick,
        crossoverRate: this.crossoverRate, mutationRate: this.mutationRate,
        suites: this.suites, emit: this.emit, emitLimit: this.emitLimit, scale: this.scale,
        // Carried so a resumed run emits into the same tree as the run it continues; a
        // resume that defaulted this would write a second tree and the line count would be
        // the sum of two runs presented as one.
        emitDir: this.emitDir,
      },
      rng: this.rng.serialize(),
      totalTicks: this.totalTicks, totalOrganisms: this.totalOrganisms,
      emissions: this.emissions, emittedLines: this.emittedLines,
      stats: this.stats, history: this.history,
      manifest: this.manifest(), years: this.years(),
      archive: this.archive.toJSON(),
    };
    const file = path.join(this.dir, 'gen-' + String(this.generation).padStart(6, '0') + '.json');
    writeFileSync(file, JSON.stringify(j));
    writeFileSync(path.join(this.dir, 'latest.json'), JSON.stringify({ file: path.basename(file), generation: this.generation, when: j.when }, null, 2) + '\n');
    this.stats.checkpoints++;
    return file;
  }

  /** @param {string} [dir] @returns {string|null} the newest checkpoint file, if any */
  static latestCheckpoint(dir = null) {
    const d = dir ? path.resolve(dir) : path.join(BRAIN_ROOT, 'state', 'generations');
    if (!existsSync(d)) return null;
    const files = readdirSync(d).filter((f) => /^gen-\d+\.json$/.test(f)).sort();
    return files.length ? path.join(d, files[files.length - 1]) : null;
  }

  /**
   * Continue a run from a checkpoint. The generation counter, the archive, the RNG stream,
   * the tick total and the emission records all come back, so the years clock of the
   * resumed run counts the ticks of the run it resumed as well as its own.
   * @param {string} [dir]
   * @param {object} [overrides] config the caller wants changed on the way back in
   * @returns {Epochs|null}
   */
  static resume(dir = null, overrides = {}) {
    const file = Epochs.latestCheckpoint(dir);
    if (!file) return null;
    const j = JSON.parse(readFileSync(file, 'utf8'));
    const e = new Epochs({ seed: j.seed, dir: dir || undefined, ...j.config, ...overrides });
    e.rng = RNG.from(j.rng);
    e.generation = j.generation;
    e.totalTicks = j.totalTicks;
    e.totalOrganisms = j.totalOrganisms;
    e.emissions = j.emissions || [];
    e.emittedLines = j.emittedLines || 0;
    e.stats = { ...e.stats, ...j.stats, resumed: (j.stats?.resumed || 0) + 1 };
    e.history = j.history || [];
    e.archive = OrganismArchive.fromJSON(j.archive);
    e.resumedFrom = path.basename(file);
    return e;
  }

  summary() {
    const best = this.archive.best();
    const y = this.years();
    return {
      generations: this.generation,
      organisms: this.totalOrganisms,
      ticks: this.totalTicks,
      years: y.years,
      lineageYears: y.lineageYears,
      arithmetic: y.arithmetic,
      archiveFill: this.archive.fill(),
      archiveCapacity: gridCapacity(),
      qd: Number(this.archive.qdScore().toFixed(6)),
      best: best ? { id: best.id, key: best.key, fitness: best.fitness, components: best.components, cells: best.cells, edges: best.edges, gen: best.gen } : null,
      emitted: this.emissions.length,
      emittedLines: this.emittedLines,
      stats: this.stats,
      archiveStats: this.archive.stats,
      lastError: this.lastError,
    };
  }
}

// ---------------------------------------------------------------- helpers
function nearestMean(vec, vectors, k) {
  if (!vectors.length) return 0;
  const ds = vectors.map((v) => {
    let s = 0;
    for (let i = 0; i < vec.length; i++) { const d = vec[i] - (v[i] ?? 0); s += d * d; }
    return Math.sqrt(s);
  }).sort((a, b) => a - b);
  const n = Math.min(k, ds.length);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += ds[i];
  return n ? sum / n : 0;
}

function mid(range) { return Array.isArray(range) ? Math.round((range[0] + range[1]) / 2) : range; }

export { validateOrganismGenome };
