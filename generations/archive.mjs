// generations/archive.mjs: THE OPEN ENDED ARCHIVE. A generational population throws away
// almost everything it ever evaluated. The Darwin Godel Machine keeps it all instead and
// samples parents out of the whole history, so a lineage that looked like a dead end can be
// picked up again ten generations later. Three things live here:
//
//   1. every evaluated genome, with its fitness, descriptors and lineage,
//   2. a MAP-Elites grid over two feature descriptors (cell count, mean period) holding the
//      best genome in each bin, so the population spreads over the feature space instead of
//      piling onto one peak,
//   3. islands: the population is split into sub-populations that evolve apart and exchange
//      a migrant every few generations.
//
// Parents are sampled as a mix of best-so-far, novelty (distance to the k nearest
// descriptors already seen) and plain random.
import { genomeFromJSON, genomeToJSON, genomeStats } from './genome.mjs';

export function descriptorsOf(genome, extra = []) {
  const s = genomeStats(genome);
  return [s.cells, s.meanPeriod, ...extra];
}

function dist(a, b) {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) { const d = (a[i] ?? 0) - (b[i] ?? 0); s += d * d; }
  return Math.sqrt(s);
}

export class Archive {
  constructor({ rng, islands = 1, capacity = 20000, noveltyK = 8, noveltySample = 256, noveltyCandidates = 192, cellBin = 1, periodBins = [1, 1.5, 2, 3, 4, 6, 8, 12, 16], mix = { best: 0.4, novelty: 0.3, random: 0.3 } } = {}) {
    if (!rng) throw new Error('archive: needs an RNG');
    this.rng = rng;
    this.islands = Math.max(1, islands);
    this.capacity = capacity;
    this.noveltyK = noveltyK;
    this.noveltySample = noveltySample;
    this.noveltyCandidates = noveltyCandidates;
    this.cellBin = cellBin;
    this.periodBins = periodBins;
    this.mix = mix;
    this.entries = [];             // every evaluated genome, newest last
    this.grid = new Map();         // MAP-Elites: binKey -> entry
    this.bestPerIsland = new Map();
    this.descSample = [];          // subsample of descriptors used for novelty
    this.best = null;
    this.stats = { added: 0, elites: 0, replaced: 0, evicted: 0, migrations: 0 };
  }

  bin(desc) {
    const cells = Math.max(0, Math.floor((desc[0] ?? 0) / this.cellBin));
    const p = desc[1] ?? 1;
    let pb = 0;
    while (pb < this.periodBins.length && p > this.periodBins[pb]) pb++;
    return cells + ':' + pb;
  }

  // entry: { id, genome (object), fitness, descriptors, gen, parents, island, mutations }
  add(entry) {
    const e = {
      id: entry.id,
      json: genomeToJSON(entry.genome),
      fitness: entry.fitness,
      descriptors: entry.descriptors || descriptorsOf(entry.genome),
      gen: entry.gen ?? 0,
      parents: entry.parents || entry.genome.meta.parents || [],
      island: entry.island ?? entry.genome.meta.island ?? 0,
      mutations: entry.mutations || entry.genome.meta.mutations || [],
      species: entry.genome.meta.species ?? -1,
    };
    this.entries.push(e);
    this.stats.added++;

    const key = this.bin(e.descriptors);
    const held = this.grid.get(key);
    if (!held) { this.grid.set(key, e); this.stats.elites++; }
    else if (e.fitness > held.fitness) { this.grid.set(key, e); this.stats.replaced++; }

    if (!this.best || e.fitness > this.best.fitness) this.best = e;
    const ib = this.bestPerIsland.get(e.island);
    if (!ib || e.fitness > ib.fitness) this.bestPerIsland.set(e.island, e);

    if (this.descSample.length < this.noveltySample) this.descSample.push(e.descriptors);
    else this.descSample[this.rng.int(this.noveltySample)] = e.descriptors;

    if (this.entries.length > this.capacity) this._evict();
    return e;
  }

  // Eviction keeps everything the grid points at, the global best, and a random half of the
  // rest. Lineage links to an evicted entry survive as ids, so a lineage walk reports the
  // gap rather than pretending it did not exist.
  _evict() {
    const keep = new Set([...this.grid.values()].map((e) => e.id));
    if (this.best) keep.add(this.best.id);
    const survivors = [];
    for (const e of this.entries) {
      if (keep.has(e.id) || this.rng.next() < 0.5) survivors.push(e);
      else this.stats.evicted++;
    }
    this.entries = survivors;
  }

  novelty(desc, k = this.noveltyK) {
    if (!this.descSample.length) return Infinity;
    const ds = this.descSample.map((d) => dist(desc, d)).sort((a, b) => a - b);
    const n = Math.min(k, ds.length);
    let s = 0;
    for (let i = 0; i < n; i++) s += ds[i];
    return n ? s / n : 0;
  }

  elites() { return [...this.grid.values()]; }
  size() { return this.entries.length; }
  bestOf(island) { return this.bestPerIsland.get(island) || null; }

  // Ranking the whole archive once per sampleParents call was measured as the dominant cost
  // of a generation (a novelty score is a distance to every descriptor in the sample, and
  // the archive grows every generation). The two shortlists are built once and reused until
  // the next add(), and the novelty shortlist is drawn from a bounded number of candidates
  // rather than the whole archive.
  _ranks(island) {
    const stamp = this.stats.added + ':' + (island == null ? '*' : island);
    if (this._rankStamp === stamp) return this._ranked;
    const pool = island == null ? this.entries : this.entries.filter((e) => e.island === island);
    if (!pool.length) { this._rankStamp = stamp; this._ranked = null; return null; }
    const byFitness = [...pool].sort((a, b) => b.fitness - a.fitness).slice(0, Math.max(1, Math.ceil(pool.length * 0.1)));
    const m = Math.min(pool.length, this.noveltyCandidates);
    const cand = new Array(m);
    for (let i = 0; i < m; i++) cand[i] = pool[this.rng.int(pool.length)];
    const novel = cand.map((e) => [e, this.novelty(e.descriptors)]).sort((a, b) => b[1] - a[1]).slice(0, Math.max(1, Math.ceil(m * 0.2)));
    this._ranked = { pool, byFitness, novel };
    this._rankStamp = stamp;
    return this._ranked;
  }

  // Sample n parents as a mix of best-so-far, novelty and random. Optionally restricted to
  // one island. Every returned genome is a fresh object, never a reference into the archive.
  sampleParents(n, { island = null, mix = this.mix } = {}) {
    const r = this._ranks(island);
    if (!r) return [];
    const { pool, byFitness, novel } = r;
    const out = [], counts = { best: 0, novelty: 0, random: 0 };
    const total = mix.best + mix.novelty + mix.random;
    for (let i = 0; i < n; i++) {
      const roll = this.rng.next() * total;
      let e;
      if (roll < mix.best) { e = byFitness[this.rng.int(byFitness.length)]; counts.best++; }
      else if (roll < mix.best + mix.novelty) { e = novel[this.rng.int(novel.length)][0]; counts.novelty++; }
      else { e = pool[this.rng.int(pool.length)]; counts.random++; }
      out.push({ entry: e, genome: genomeFromJSON(e.json), source: counts });
    }
    this.lastMix = { best: (this.lastMix?.best || 0) + counts.best, novelty: (this.lastMix?.novelty || 0) + counts.novelty, random: (this.lastMix?.random || 0) + counts.random };
    return out;
  }

  // Ring migration: the best genome of island i is copied into island i+1. Returns the
  // migrants so the engine can seed them into the receiving island's next generation.
  migrate() {
    if (this.islands < 2) return [];
    const out = [];
    for (let i = 0; i < this.islands; i++) {
      const best = this.bestPerIsland.get(i);
      if (!best) continue;
      const to = (i + 1) % this.islands;
      const g = genomeFromJSON(best.json);
      g.meta.island = to;
      g.meta.parents = [best.id];
      out.push({ from: i, to, genome: g, fitness: best.fitness });
    }
    this.stats.migrations += out.length;
    return out;
  }

  // Walk a genome's ancestry back through the archive. Reports ids it no longer holds.
  lineage(id, depth = 32) {
    const byId = new Map(this.entries.map((e) => [e.id, e]));
    const chain = [];
    let cur = [id];
    for (let d = 0; d < depth && cur.length; d++) {
      const nxt = [];
      for (const c of cur) {
        const e = byId.get(c);
        if (!e) { chain.push({ id: c, evicted: true }); continue; }
        chain.push({ id: e.id, gen: e.gen, fitness: e.fitness, mutations: e.mutations, parents: e.parents });
        for (const p of e.parents) nxt.push(p);
      }
      cur = [...new Set(nxt)];
    }
    return chain;
  }

  summary() {
    return {
      entries: this.entries.length,
      bins: this.grid.size,
      best: this.best ? Number(this.best.fitness.toFixed(6)) : null,
      bestId: this.best ? this.best.id : null,
      islands: this.islands,
      lastMix: this.lastMix || null,
      stats: this.stats,
    };
  }
}
