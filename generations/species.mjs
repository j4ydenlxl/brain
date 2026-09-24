// generations/species.mjs: SPECIATION. Innovation protects itself: a genome that has just
// grown a new cell is usually worse before it is better, so it competes inside a species of
// similar genomes rather than against the whole population. Distance is the NEAT
// compatibility measure over excess, disjoint and matching weight difference; the threshold
// is not a constant but moves every generation until the species count sits on a target.
import { align } from './crossover.mjs';
import { periodValue } from './palette.mjs';

export const DEFAULT_COEFF = Object.freeze({ c1: 1.0, c2: 1.0, c3: 0.4, c4: 0.35 });

// c1 excess, c2 disjoint, c3 mean weight difference of matching edges,
// c4 mean period difference of matching cells (multi-timescale is part of the phenotype,
// so two genomes that differ only in when their cells run are not the same species).
export function compatibility(a, b, coeff = DEFAULT_COEFF) {
  const { c1, c2, c3, c4 } = { ...DEFAULT_COEFF, ...coeff };
  const e = align(a.edges, b.edges);
  const n = Math.max(1, Math.max(a.edges.length, b.edges.length));
  let wdiff = 0;
  for (const [x, y] of e.matching) wdiff += Math.abs(x.w - y.w);
  const wbar = e.matching.length ? wdiff / e.matching.length : 0;

  const c = align(a.cells, b.cells);
  let pdiff = 0;
  for (const [x, y] of c.matching) pdiff += Math.abs(Math.log2(periodValue(x.period)) - Math.log2(periodValue(y.period)));
  const pbar = c.matching.length ? pdiff / c.matching.length : 0;

  return (c1 * e.excess.length) / n + (c2 * e.disjoint.length) / n + c3 * wbar + c4 * pbar;
}

export class Speciation {
  constructor({ threshold = 3.0, targetSpecies = 8, step = 0.3, minThreshold = 0.2, maxThreshold = 40, stagnation = 15, coeff = DEFAULT_COEFF, elitism = 1 } = {}) {
    this.threshold = threshold;
    this.targetSpecies = targetSpecies;
    this.step = step;
    this.minThreshold = minThreshold;
    this.maxThreshold = maxThreshold;
    this.stagnation = stagnation;
    this.coeff = { ...DEFAULT_COEFF, ...coeff };
    this.elitism = elitism;
    this.species = [];   // { id, rep, members: [], best, bestGen, meanAdjusted }
    this.nextId = 1;
    this.stats = { assigned: 0, created: 0, removed: 0 };
  }

  // scored: [{ genome, fitness }] in a stable order. Species keep their representative
  // from the previous generation so ids are continuous across generations.
  speciate(scored, gen = 0) {
    for (const s of this.species) s.members = [];
    for (const { genome, fitness } of scored) {
      let home = null;
      for (const s of this.species) {
        if (compatibility(genome, s.rep, this.coeff) < this.threshold) { home = s; break; }
      }
      if (!home) {
        home = { id: this.nextId++, rep: genome, members: [], best: -Infinity, bestGen: gen, meanAdjusted: 0 };
        this.species.push(home);
        this.stats.created++;
      }
      home.members.push({ genome, fitness });
      genome.meta.species = home.id;
      this.stats.assigned++;
    }
    this.species = this.species.filter((s) => s.members.length > 0);
    for (const s of this.species) {
      s.members.sort((x, y) => y.fitness - x.fitness);
      s.rep = s.members[0].genome;
      const best = s.members[0].fitness;
      if (best > s.best) { s.best = best; s.bestGen = gen; }
    }
    this.species.sort((a, b) => a.id - b.id);
    return this.species;
  }

  // Fitness sharing: a genome's fitness is divided by the size of its species, so a species
  // that fills the population with copies of one idea stops being rewarded for the copies.
  shareFitness() {
    for (const s of this.species) {
      let sum = 0;
      for (const m of s.members) { m.adjusted = m.fitness / s.members.length; sum += m.adjusted; }
      s.meanAdjusted = s.members.length ? sum / s.members.length : 0;
      s.sumAdjusted = sum;
    }
    return this.species;
  }

  // Species that have not improved for `stagnation` generations are removed, except the
  // one holding the best fitness seen, which is never removed.
  removeStagnant(gen) {
    if (this.species.length <= 1) return 0;
    let bestId = this.species[0].id, bestVal = -Infinity;
    for (const s of this.species) if (s.best > bestVal) { bestVal = s.best; bestId = s.id; }
    const before = this.species.length;
    this.species = this.species.filter((s) => s.id === bestId || gen - s.bestGen < this.stagnation);
    const removed = before - this.species.length;
    this.stats.removed += removed;
    return removed;
  }

  // Move the threshold toward the target species count. This is the dynamic part: a fixed
  // threshold either collapses to one species or explodes to one species per genome as the
  // population drifts, and which of the two it does is not knowable in advance.
  adjustThreshold() {
    if (this.species.length > this.targetSpecies) this.threshold = Math.min(this.maxThreshold, this.threshold + this.step);
    else if (this.species.length < this.targetSpecies) this.threshold = Math.max(this.minThreshold, this.threshold - this.step);
    return this.threshold;
  }

  // How many offspring each species gets, proportional to its share of total adjusted
  // fitness, with every surviving species guaranteed at least one slot.
  allocate(total) {
    const species = this.species;
    if (!species.length) return [];
    const sums = species.map((s) => Math.max(0, s.sumAdjusted ?? 0));
    const grand = sums.reduce((x, y) => x + y, 0);
    let out;
    if (grand <= 0) out = species.map(() => Math.floor(total / species.length));
    else out = sums.map((v) => Math.floor((v / grand) * total));
    for (let i = 0; i < out.length; i++) if (out[i] < 1) out[i] = 1;
    // trim or top up to exactly total, largest species first
    const order = species.map((s, i) => i).sort((i, j) => (sums[j] - sums[i]) || (i - j));
    let sum = out.reduce((x, y) => x + y, 0);
    let k = 0;
    while (sum > total) { const i = order[k % order.length]; if (out[i] > 1) { out[i]--; sum--; } k++; if (k > total * 4 + order.length) break; }
    while (sum < total) { const i = order[k % order.length]; out[i]++; sum++; k++; }
    return out;
  }

  summary() {
    return {
      count: this.species.length,
      threshold: Number(this.threshold.toFixed(4)),
      sizes: this.species.map((s) => s.members.length),
      ids: this.species.map((s) => s.id),
      best: this.species.map((s) => Number((s.best ?? 0).toFixed(6))),
    };
  }
}
