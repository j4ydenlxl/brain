// generations/plateau.mjs: THE PLATEAU, MEASURED, AND THREE WAYS PAST IT (board 24A, item plateau).
//
// His P5: "evolve over billions of years in a bunch of seconds". The years item found that the
// searched score of the matrix path stops rising within the first second and the rest of a 300 s
// run adds nothing, and notes/multiply.md found that one instance alone reaches its suite's
// searched plateau inside 240 s, so a population cannot beat it there. This file holds what the
// plateau bench (bench/plateau.mjs) runs:
//
//   1. TWO PLANES THE CONTROL DOES NOT SATURATE. The grid plane is tasks/grid.mjs as K = 4 draws
//      (generations/velocity.mjs buildGridDraws) with its held-out draw, searched at a length cap
//      of 64: at 64 slots the cap binds (Board 10 needed 96 for its 598/640), so the searched
//      score is a set-cover problem the search can still lose. The synthetic plane is coverPlane():
//      a generated world of task families and components that answer some families and fit (and
//      answer wrongly) others, K searched draws of tasks from it and one fresh draw. Its optimum is
//      NOT known; the planted landscape of velocity.mjs is solved in under a tenth of a second
//      (notes/plateau.md, the probe), so it cannot show a gain.
//
//   2. THE PLATEAU, EXACTLY. runArm() runs both planes in one loop, one generation of each in
//      turn, for a fixed wall budget, and writes a row per plane every rowEveryMs (100 ms): the
//      organism-years (one generation of the whole population is one organism-year, the
//      declaration of generations/years.mjs), the searched objective of the best library, and that
//      library's score on the plane's held-out draw. plateauOf() reads the plateau second off the
//      rows: the time of the last row whose score is above the row before it (after it the score
//      never rises again).
//
//   3. THREE INTERVENTIONS, each a switch on the same loop, so the control is the loop with all
//      three off:
//        NOVELTY   the MAP-Elites archive is keyed by BEHAVIOUR (behaviourDescriptor): which tasks
//                  a library solves, not what it is made of, so two libraries of one score that
//                  solve different tasks hold two cells and both stay as stepping stones.
//        TRANSFER  after each generation of a plane, elites of the OTHER plane are mapped into
//                  this plane's components and offered, but only the descriptor-matched ones: a
//                  migrant is offered only when it lands in the same archive cell it held at home.
//        RESTART   when the running engine's own best has not risen for restartMs, the engine is
//                  replaced by a new one seeded from the archive's most distant cells (the largest
//                  Hamming distance between a cell's solved tasks and the best's). The best found
//                  so far is kept outside the engine (the hall of fame), so a restart never loses it.
//
// The held-out draw is read ONLY to write a row. Every decision (selection, the restart clock, the
// hall of fame, which migrant is offered) is a function of the searched matrix and the clock.
//
//   4. A DIAGNOSTIC AFTER THE LOOP (archiveHeldout), read by no decision: the final archive's
//      elites scored on the held-out draw, to say whether the archive held a library that
//      generalizes better than the pick, and whether a held-out-free pick (the best worst-draw
//      count) finds it. SPLIT names the tuning, held-out, smoke and retired seed namespaces.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { RNG } from '../core/rng.mjs';
import { EvalMatrix, MatrixElites, buildGridDraws, buildGridMatrix, drawSeeds, stackDraws, popcnt, DEFAULT_BINS } from './velocity.mjs';
import { YEAR, yearsArithmetic } from './years.mjs';

export { YEAR };

// ---------------------------------------------------------------- declared constants
/** The engine every arm runs: the continuous run's defaults of generations/years.mjs. */
export const ENGINE = Object.freeze({ popSize: 64, directed: 0.75, mutationRate: 1.5, crossoverRate: 0.15, bins: DEFAULT_BINS });
/** The length caps: grid 64 (the cap binds; see the header), cover 48 (binds: see notes). */
export const LMAX = Object.freeze({ grid: 64, synthetic: 48 });
/**
 * The restart schedule's defaults: stagnation seconds (bench/plateau.mjs --restart-s) and how many
 * distant cells seed the new engine. 12 s sits inside the gaps the CONTROL left between two rises
 * of its searched objective in a 60 s development run on the tuning seeds (notes/plateau.md,
 * Measured: the longest gaps were 30.3, 2.5 and 10.9 s on grid and 10.0, 10.7 and 14.4 s on
 * synthetic, tune-1..3): a shorter N fires inside gaps the control climbs out of by itself.
 */
export const RESTART = Object.freeze({ restartMs: 12000, carry: 16 });
/**
 * THE SPLIT. The tuning side (development) and the held-out side are separate namespaces of run
 * seeds and plane seeds. The held-out side is 'heldout': a 3 s smoke run of an earlier build
 * (2026-09-27T01:30Z) ran run seeds fresh-1, fresh-2 on planes plateau/fresh/*, so those strings
 * are RETIRED and no run uses them again. splitSeedStrings() names every seed string a side touches
 * without building a matrix, so the disjointness is checked before anything runs.
 */
export const SPLIT = Object.freeze({
  tune: Object.freeze({ runPrefix: 'tune-', grid: 'plateau/tune/grid', synthetic: 'plateau/tune/cover' }),
  heldout: Object.freeze({ runPrefix: 'heldout-', grid: 'plateau/heldout/grid', synthetic: 'plateau/heldout/cover' }),
  // a smoke run (bench/plateau.mjs --smoke) runs phase (c) and the verdict on this side instead, so
  // the whole path is exercised end to end without building or running the held-out side
  smoke: Object.freeze({ runPrefix: 'smoke-', grid: 'plateau/smoke/grid', synthetic: 'plateau/smoke/cover' }),
  retired: Object.freeze({ runSeeds: Object.freeze(['fresh-1', 'fresh-2']), planeSeeds: Object.freeze(['plateau/fresh/grid', 'plateau/fresh/cover']), exposedBy: 'a 3 s smoke run (--wall-s 3 --tune-seeds 2 --arm-seeds 2 --fresh-seeds 2) of an earlier build of bench/plateau.mjs at 2026-09-27T01:30Z' }),
});

/** The run seeds of one side: <runPrefix>1 .. <runPrefix>n. */
export function runSeeds(side, n) { return Array.from({ length: n }, (_, i) => SPLIT[side].runPrefix + (i + 1)); }

/**
 * Every seed string a side's planes and runs touch: the run seeds, each plane's seed, its searched
 * draw seeds and its held-out seed, exactly as gridPlane() and coverPlane() derive them. Pure.
 * @param {string} side 'tune' | 'heldout' @param {number} n run seeds @param {number} [draws]
 */
export function splitSeedStrings(side, n, draws = 4) {
  const sp = SPLIT[side];
  if (!sp || !sp.runPrefix) throw new Error('splitSeedStrings: unknown side ' + side);
  const out = new Set(runSeeds(side, n));
  out.add(sp.grid); for (const x of drawSeeds(sp.grid, draws)) out.add(x); out.add(sp.grid + ':heldout');
  out.add(sp.synthetic); for (const x of drawSeeds(sp.synthetic + ':cover', draws)) out.add(x); out.add(sp.synthetic + ':cover:fresh');
  return out;
}

/** Every seed string the retired smoke run touched (its planes' draws and held-out seeds too). */
export function retiredSeedStrings(draws = 4) {
  const r = SPLIT.retired, out = new Set(r.runSeeds);
  const [g, c] = r.planeSeeds;
  out.add(g); for (const x of drawSeeds(g, draws)) out.add(x); out.add(g + ':heldout');
  out.add(c); for (const x of drawSeeds(c + ':cover', draws)) out.add(x); out.add(c + ':cover:fresh');
  return out;
}

/** Migrants tried per generation per direction when TRANSFER is on. */
export const TRANSFER = Object.freeze({ perGeneration: 2 });
/** The synthetic world's defaults. Chosen on the probe seed with the control only (notes/plateau.md). */
export const COVER_DEFAULTS = Object.freeze({ families: 384, components: 2048, tasksPerDraw: 256, draws: 4, zipf: 1.0, meanRight: 3, meanWrong: 1.5, rhoLo: 0.7, nOps: 18, maxSize: 3 });

// ---------------------------------------------------------------- 1. the planes
/**
 * The grid plane: K searched draws of tasks/grid.mjs (draw 0 is the seed, draw k is <seed>:draw<k>)
 * and one held-out draw, <seed>:heldout, which is never a draw of the searched stream.
 * @param {object} p { seed, draws, maxDepth }
 * @returns {{ kind: 'grid', seed: string, searched: EvalMatrix, fresh: EvalMatrix, seeds: string[], freshSeed: string, buildMs: number }}
 */
export function gridPlane({ seed, draws = 4, maxDepth = 3 } = {}) {
  if (!seed) throw new Error('gridPlane: a seed is required');
  const t0 = process.hrtime.bigint();
  const d = buildGridDraws({ seed, draws, maxDepth });
  const freshSeed = seed + ':heldout';
  if (d.seeds.includes(freshSeed)) throw new Error('gridPlane: the held-out seed is a searched draw');
  const h = buildGridMatrix({ seed: freshSeed, maxDepth });
  return { kind: 'grid', seed, searched: d.matrix, fresh: h.matrix, seeds: d.seeds, freshSeed, buildMs: Number(process.hrtime.bigint() - t0) / 1e6 };
}

/**
 * THE SYNTHETIC COVER WORLD. `families` task families with Zipf weights; `components` components,
 * each answering the tasks of a few families (a geometric number, mean meanRight) with its own
 * reliability rho in [rhoLo, 1) per task, and FITTING (claiming, then answering wrongly) the tasks
 * of a few others (mean meanWrong). A draw is `tasksPerDraw` tasks, each from a family drawn by
 * weight. The world is a function of the seed; the searched draws use drawSeeds(seed:cover, K) and
 * the fresh draw uses <seed>:cover:fresh, which no searched draw can be. Under a length cap the
 * best library is a weighted max coverage with shadowing (first fit), whose optimum is not known.
 * @param {object} p COVER_DEFAULTS plus { seed }
 */
export function coverPlane(p = {}) {
  const o = { ...COVER_DEFAULTS, ...p };
  if (!o.seed) throw new Error('coverPlane: a seed is required');
  const t0 = process.hrtime.bigint();
  const F = o.families, C = o.components;
  const rng = new RNG(o.seed + ':cover:world');
  const rank = Array.from({ length: F }, (_, i) => i);
  rng.shuffle(rank);
  const cum = new Float64Array(F);
  let acc = 0;
  for (let f = 0; f < F; f++) { acc += 1 / Math.pow(rank[f] + 1, o.zipf); cum[f] = acc; }
  const famRight = Array.from({ length: F }, () => []), famWrong = Array.from({ length: F }, () => []);
  const rho = new Float64Array(C), size = new Uint8Array(C), opMask = new Uint32Array(C);
  // a geometric count with the given mean, starting at min: P(one more) = (mean - min) / (mean - min + 1)
  const geo = (mean, min) => { let k = min; const q = (mean - min) / (mean - min + 1); while (k < 64 && rng.next() < q) k++; return k; };
  for (let c = 0; c < C; c++) {
    const nR = Math.min(F, geo(o.meanRight, 1)), nW = Math.min(F - nR, geo(o.meanWrong, 0));
    const mine = new Set();
    while (mine.size < nR) mine.add(rng.int(F));
    for (const f of mine) famRight[f].push(c);
    const wrong = new Set();
    while (wrong.size < nW) { const f = rng.int(F); if (!mine.has(f)) wrong.add(f); }
    for (const f of wrong) famWrong[f].push(c);
    rho[c] = o.rhoLo + (1 - o.rhoLo) * rng.next();
    size[c] = 1 + rng.int(o.maxSize);
    let m = 0;
    for (let b = 0; b < o.nOps; b++) if (rng.int(4) === 0) m |= (1 << b);
    opMask[c] = m >>> 0;
  }
  const pickFamily = (r) => {
    const x = r.next() * acc;
    let lo = 0, hi = F - 1;
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (cum[mid] > x) hi = mid; else lo = mid + 1; }
    return lo;
  };
  const drawMatrix = (drawSeed, name) => {
    const r = new RNG(drawSeed + ':cover:tasks');
    const T = o.tasksPerDraw, W = Math.ceil(T / 32);
    const fit = new Uint32Array(C * W), right = new Uint32Array(C * W), deepMask = new Uint32Array(W);
    const fam = new Int32Array(T);
    for (let t = 0; t < T; t++) {
      const f = pickFamily(r);
      fam[t] = f;
      const w = t >>> 5, b = 1 << (t & 31);
      for (const c of famWrong[f]) fit[c * W + w] |= b;
      for (const c of famRight[f]) { fit[c * W + w] |= b; if (r.next() < rho[c]) right[c * W + w] |= b; }
      if (r.int(2) === 0) deepMask[w] |= b;
    }
    return new EvalMatrix({ name, components: C, tasks: T, fit, right, size, opMask, nOps: o.nOps, deepMask, meta: { seed: drawSeed, families: F } });
  };
  const seeds = drawSeeds(o.seed + ':cover', o.draws);
  const freshSeed = o.seed + ':cover:fresh';
  if (seeds.includes(freshSeed)) throw new Error('coverPlane: the fresh seed is a searched draw');
  const searched = stackDraws(seeds.map((s, k) => drawMatrix(s, 'cover:draw' + k)), { name: 'cover:' + o.draws + 'draws', meta: { runSeed: o.seed, seeds } });
  const fresh = drawMatrix(freshSeed, 'cover:fresh');
  return { kind: 'synthetic', seed: o.seed, searched, fresh, seeds, freshSeed, options: o, buildMs: Number(process.hrtime.bigint() - t0) / 1e6 };
}

/**
 * A plane in words, read off the built plane itself (never a literal): the kind, the searched
 * draws and their size, the components (and, for the cover plane, its task families), the length
 * cap and the held-out draw. The bench prints it when it builds a plane and writes the same words
 * into the verdict's statement, so every constant the statement names is a number the run printed.
 * @param {object} pl a plane from gridPlane() or coverPlane() @param {number} cap its length cap
 */
export function describePlane(pl, cap) {
  const s = pl.searched, f = pl.fresh;
  const draws = s.draws, per = s.T / draws;
  if (!Number.isInteger(per)) throw new Error('describePlane: ' + s.T + ' searched tasks do not split into ' + draws + ' equal draws');
  if (!(cap > 0)) throw new Error('describePlane: a length cap is required');
  if (pl.kind === 'grid') return 'the grid plane (tasks/grid.mjs, ' + s.C + ' components, ' + draws + ' searched draws of ' + per + ' tasks, a length cap of ' + cap + ', scored on a held-out draw of ' + f.T + ' tasks)';
  if (pl.kind === 'synthetic') {
    const fam = pl.options && pl.options.families;
    if (!(fam > 0)) throw new Error('describePlane: the cover plane carries no family count');
    return 'a synthetic cover plane (' + s.C + ' generated components over ' + fam + ' task families, ' + draws + ' searched draws of ' + per + ' tasks, a length cap of ' + cap + ', scored on a fresh draw of ' + f.T + ' tasks)';
  }
  throw new Error('describePlane: unknown plane kind ' + pl.kind);
}

/** An EvalMatrix as plain data a worker can receive (the names function stays behind). */
export function matrixToWire(m) {
  return { name: m.name, components: m.C, tasks: m.T, fit: m.fit, right: m.right, size: m.size, opMask: m.opMask, nOps: m.nOps, deepMask: m.deepMask, draws: m.draws, meta: JSON.parse(JSON.stringify(m.meta || {})) };
}
export function matrixFromWire(w) { return new EvalMatrix(w); }

// ---------------------------------------------------------------- 3a. NOVELTY: behaviour descriptors
/**
 * Behaviour descriptors for MatrixElites (its `descriptor` option). Four axes of `bins` each:
 *   0  library length (the one axis kept from the default: length is the objective's tie break)
 *   1  the share of the RARE tasks it solves (the third of the answerable tasks with the fewest
 *      components answering them), cubed before binning so the bins are finest near the top
 *   2  the share of the other answerable tasks it solves, cubed the same way
 *   3  a signature of WHICH rare tasks it solves: a hash of those solved bits, modulo bins
 * Two libraries with the same count and the same length that solve different rare tasks land in
 * different cells whenever axis 1, 2 or 3 differs; under the default descriptors they share one.
 * @param {EvalMatrix} matrix @param {object} [opts] { bins }
 * @returns {{ capacity: number, binOf: Function, rareN: number, otherN: number, kind: string }}
 */
export function behaviourDescriptor(matrix, { bins = DEFAULT_BINS } = {}) {
  const { offsets, answerable } = matrix.rightIndex();
  const W = matrix.W, tasks = [];
  for (let t = 0; t < matrix.T; t++) if (answerable[t >>> 5] & (1 << (t & 31))) tasks.push(t);
  tasks.sort((a, b) => (offsets[a + 1] - offsets[a]) - (offsets[b + 1] - offsets[b]) || a - b);
  const cut = Math.ceil(tasks.length / 3);
  const rare = new Uint32Array(W), other = new Uint32Array(W);
  tasks.forEach((t, i) => { (i < cut ? rare : other)[t >>> 5] |= (1 << (t & 31)); });
  const rareN = Math.max(1, cut), otherN = Math.max(1, tasks.length - cut);
  const B = bins;
  const clampB = (v) => (v < 0 ? 0 : v >= B ? B - 1 : v);
  return {
    kind: 'behaviour', capacity: B ** 4, rareN, otherN, rare, other,
    binOf(engine, buf, n, count, words) {
      let r = 0, q = 0, h = 2166136261;
      for (let w = 0; w < W; w++) {
        const x = (words[w] & rare[w]) >>> 0;
        r += popcnt(x); q += popcnt((words[w] & other[w]) >>> 0);
        h = Math.imul(h ^ x, 16777619) >>> 0;
      }
      h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13;
      const a0 = clampB(Math.floor(((n - 1) * B) / engine.lmax));
      const a1 = clampB(Math.floor(B * Math.pow(r / rareN, 3)));
      const a2 = clampB(Math.floor(B * Math.pow(q / otherN, 3)));
      const a3 = (h >>> 0) % B;
      return ((a0 * B + a1) * B + a2) * B + a3;
    },
  };
}

// ---------------------------------------------------------------- helpers on an engine
function hamming(a, aOff, b, W) {
  let d = 0;
  for (let w = 0; w < W; w++) d += popcnt((a[aOff + w] ^ b[w]) >>> 0);
  return d;
}

/**
 * THE RESTART'S SEEDS: the `k` filled cells whose solved tasks are furthest (Hamming) from
 * `solved`, ties by higher fitness, then lower cell. Pure on the engine's state.
 * @returns {{ genomes: Int32Array[], distances: number[] }}
 */
export function distantElites(engine, solved, k) {
  const W = engine.m.W, L = engine.lmax, out = [];
  for (let i = 0; i < engine.nFilled; i++) {
    const c = engine.filled[i];
    out.push({ c, d: hamming(engine.solvedPool, c * W, solved, W), f: engine.fit[c] });
  }
  out.sort((x, y) => y.d - x.d || y.f - x.f || x.c - y.c);
  const pick = out.slice(0, Math.max(0, k));
  return { genomes: pick.map((e) => engine.pool.slice(e.c * L, e.c * L + engine.len[e.c])), distances: pick.map((e) => e.d) };
}

/**
 * The cell a library would land in on `engine`, scored and pruned exactly as offer() does it,
 * without writing the archive. Writes the pruned library into `out` and returns its length.
 */
export function probeCell(engine, buf, n, out, claims) {
  const count = engine.m.scoreAt(buf, 0, n, engine.words, engine.prune ? claims : null);
  let k = n;
  if (engine.prune) {
    k = 0;
    for (let i = 0; i < n; i++) if (claims[i]) out[k++] = buf[i];
    if (k === 0) { out[0] = buf[0]; k = 1; }
  } else out.set(buf.subarray(0, n));
  return { cell: engine.binOf(out, k, count, engine.words), len: k, count };
}

// ---------------------------------------------------------------- 2. one plane inside an arm
class PlaneRun {
  constructor(key, plane, { seed, lmax, novelty, restart, restartMs, restartCarry, engine }) {
    this.key = key;
    this.searched = plane.searched;
    this.fresh = plane.fresh;
    this.seed = seed;
    this.lmax = lmax;
    this.restartOn = !!restart;
    this.restartMs = restartMs;
    this.restartCarry = restartCarry;
    this.descriptor = novelty ? behaviourDescriptor(this.searched, { bins: engine.bins }) : null;
    this.engineOpts = { ...engine, lmax, descriptor: this.descriptor };
    this.engineIndex = 0;
    this.engine = new MatrixElites(this.searched, { ...this.engineOpts, seed: seed + ':' + key + ':e0' });
    this.gens = 0; this.retiredEvals = 0; this.carried = 0; this.restarts = [];
    this.hof = null; this.heldout = 0; this.hofChanges = 0;
    this.engRef = -Infinity; this.engRiseMs = 0;
    this.transfer = { tried: 0, matched: 0, accepted: 0, evals: 0 };
    this.rows = []; this.lastRowAt = -Infinity;
    this.tmpA = new Int32Array(Math.max(lmax, 256)); this.tmpB = new Int32Array(Math.max(lmax, 256)); this.claims = new Uint8Array(Math.max(lmax, 256));
  }

  /** The hall of fame: the best library by the searched objective seen by any engine of this plane. */
  updateHof() {
    const e = this.engine;
    if (e.bestCell < 0) return;
    if (this.hof && !(e.bestFit > this.hof.fitness)) return;
    const c = e.bestCell, L = e.lmax, W = this.searched.W;
    this.hof = { fitness: e.bestFit, count: e.cnt[c], len: e.len[c], genome: e.pool.slice(c * L, c * L + e.len[c]), solved: e.solvedPool.slice(c * W, c * W + W) };
    this.hofChanges++;
    // the held-out draw is read here, to write a row, and nowhere else
    this.heldout = this.fresh.score(this.hof.genome).count;
  }

  step() { this.engine.step(); this.gens++; this.updateHof(); }

  /** RESTART: the running engine's own best has not risen for restartMs. */
  maybeRestart(t) {
    const e = this.engine;
    if (e.bestFit > this.engRef) { this.engRef = e.bestFit; this.engRiseMs = t; }
    if (!this.restartOn || t - this.engRiseMs < this.restartMs || !this.hof) return false;
    const { genomes, distances } = distantElites(e, this.hof.solved, this.restartCarry);
    this.retiredEvals += e.evals;
    this.carried += genomes.length;
    this.engineIndex++;
    this.engine = new MatrixElites(this.searched, { ...this.engineOpts, seed: this.seed + ':' + this.key + ':e' + this.engineIndex, carry: genomes });
    this.engRef = -Infinity; this.engRiseMs = t;
    const meanD = distances.length ? distances.reduce((a, b) => a + b, 0) / distances.length : 0;
    this.restarts.push({ atMs: t, gen: this.gens, carried: genomes.length, meanDistance: meanD, hofCount: this.hof.count });
    return true;
  }

  /**
   * TRANSFER: `n` random elites of `from` (another plane's run), their components mapped into this
   * plane's (index modulo C), cut to this plane's cap, offered only when descriptor-matched.
   */
  receive(from, n, rng) {
    const src = from.engine;
    if (!src.nFilled) return;
    const C = this.searched.C, L = src.lmax;
    for (let i = 0; i < n; i++) {
      const cell = src.filled[rng.int(src.nFilled)];
      const len = Math.min(src.len[cell], this.engine.lmax);
      for (let j = 0; j < len; j++) this.tmpA[j] = src.pool[cell * L + j] % C;
      this.transfer.tried++;
      const p = probeCell(this.engine, this.tmpA, len, this.tmpB, this.claims);
      this.transfer.evals++;
      if (p.cell !== cell) continue;
      this.transfer.matched++;
      this.transfer.evals++;
      if (this.engine.offer(this.tmpB, p.len)) this.transfer.accepted++;
    }
    this.updateHof();
  }

  evals() { return this.retiredEvals + this.engine.evals; }

  row(t) {
    const h = this.hof;
    return {
      tMs: t, gen: this.gens, evals: this.evals(),
      objective: h ? h.fitness : null, searched: h ? h.count : 0, len: h ? h.len : 0, heldout: h ? this.heldout : 0,
    };
  }

  maybeRow(t, force = false) {
    if (!force && t - this.lastRowAt < this.rowEveryMs) return;
    this.rows.push(this.row(t));
    this.lastRowAt = t;
  }
}

// ---------------------------------------------------------------- 2. the arm
export const ARMS = Object.freeze({
  control: Object.freeze({ novelty: false, transfer: false, restart: false }),
  novelty: Object.freeze({ novelty: true, transfer: false, restart: false }),
  transfer: Object.freeze({ novelty: false, transfer: true, restart: false }),
  restart: Object.freeze({ novelty: false, transfer: false, restart: true }),
});

/** The name of a set of switches, e.g. 'novelty+restart' or 'control'. */
export function armName(sw) {
  const on = ['novelty', 'transfer', 'restart'].filter((k) => sw[k]);
  return on.length ? on.join('+') : 'control';
}

/**
 * ONE ARM: both planes, one generation of each in turn, for `wallMs` of wall. Returns per plane
 * its rows (every rowEveryMs), organism-years, evaluations, restarts and transfer counts.
 * @param {object} p { planes: { key: { searched, fresh } }, arm: { novelty, transfer, restart }, seed,
 *   wallMs, rowEveryMs, lmax: { key: n }, restartMs, restartCarry, transferPerGen, clock, diagnostic }
 *   clock: a function returning milliseconds (default the monotonic clock); a test hands it a counter.
 *   diagnostic: false skips archiveHeldout after the loop (archive is then null); a test compares the two.
 */
export function runArm({ planes, arm = ARMS.control, seed, wallMs, rowEveryMs = 100, lmax = LMAX, restartMs = RESTART.restartMs, restartCarry = RESTART.carry, transferPerGen = TRANSFER.perGeneration, engine = ENGINE, clock = null, diagnostic = true } = {}) {
  if (!(wallMs > 0)) throw new Error('runArm: a wall budget (wallMs > 0) is required');
  if (!seed) throw new Error('runArm: a seed is required');
  const keys = Object.keys(planes);
  const hr = typeof clock === 'function' ? clock : () => Number(process.hrtime.bigint()) / 1e6;
  const runs = keys.map((k) => {
    const r = new PlaneRun(k, planes[k], { seed, lmax: lmax[k] ?? 64, novelty: arm.novelty, restart: arm.restart, restartMs, restartCarry, engine: { ...ENGINE, ...engine } });
    r.rowEveryMs = rowEveryMs;
    return r;
  });
  const rng = new RNG(seed + ':transfer');
  const T0 = hr();
  const el = () => hr() - T0;
  let endT = 0;
  while (true) {
    for (let i = 0; i < runs.length; i++) {
      const r = runs[i];
      r.step();
      if (arm.transfer && runs.length > 1) r.receive(runs[(i + 1) % runs.length], transferPerGen, rng);
      const t = el();
      r.maybeRestart(t);
      if (r.gens === 1) r.maybeRow(t, true); else r.maybeRow(t);
    }
    endT = el();
    if (endT >= wallMs) break;
  }
  const out = {};
  for (const r of runs) {
    r.maybeRow(endT, true);
    // AFTER the loop, for the report only: the held-out scores of the final archive's elites
    const archive = diagnostic ? archiveHeldout(r.engine, r.fresh, r.hof) : null;
    const years = yearsArithmetic({ generations: r.gens, popSize: r.engineOpts.popSize, evals: r.evals(), carried: r.carried + r.transfer.evals, wallMs: endT });
    out[r.key] = {
      tasksHeldout: r.fresh.T, tasksSearched: r.searched.T, draws: r.searched.draws, lmax: r.lmax,
      descriptor: r.descriptor ? r.descriptor.kind : 'default',
      generations: r.gens, organismYears: years.organismYears, evals: r.evals(), carried: r.carried, yearsArithmetic: years.arithmetic,
      restarts: r.restarts.length, restartLog: r.restarts.slice(0, 64), transfer: { ...r.transfer },
      final: r.rows[r.rows.length - 1], best: r.hof ? { count: r.hof.count, len: r.hof.len, fitness: r.hof.fitness } : null,
      plateau: plateauOf(r.rows, 'heldout'), searchedPlateau: plateauOf(r.rows, 'objective'),
      archive, searchedGaps: (() => { const x = searchedGaps(r.rows); return { rises: x.rises, lastRiseMs: x.lastRiseMs, longest: x.gaps.slice(0, 8) }; })(),
      rows: r.rows,
    };
  }
  return { arm: armName(arm), switches: { ...arm }, seed, wallMs: endT, rowEveryMs, restartMs, restartCarry, transferPerGen, planes: out };
}

/**
 * A DIAGNOSTIC, computed once after an arm's loop has ended and read by no decision: every elite of
 * the final archive scored on the held-out draw. It says whether the archive held a library that
 * generalizes better than the pick (the best by the searched objective): maxHeldout is an ORACLE
 * pick that uses the held-out draw and is printed only, never used to choose anything.
 * @returns {{ elites: number, pickHeldout: number, maxHeldout: number, maxHeldoutSearched: number, top10: { searched: number[], heldout: number[] }, spearmanTop: number|null }}
 */
export function archiveHeldout(engine, fresh, hof, { robustTop = 50 } = {}) {
  const L = engine.lmax, rows = [], m = engine.m, W = m.W;
  for (let i = 0; i < engine.nFilled; i++) {
    const c = engine.filled[i];
    const g = engine.pool.subarray(c * L, c * L + engine.len[c]);
    const perDraw = countsByDrawWords(engine.solvedPool.subarray(c * W, c * W + W), m.T, m.tasksPerDraw);
    rows.push({ fit: engine.fit[c], searched: engine.cnt[c], heldout: fresh.score(g).count, minDraw: Math.min(...perDraw) });
  }
  rows.sort((a, b) => b.fit - a.fit);
  // A HELD-OUT-FREE PICK, for the report only (added after the bar missed, board 24A): among the
  // top `robustTop` elites by the searched objective, the one whose WORST searched draw is best
  // (ties by fitness). It reads the searched draws alone; its held-out score is printed, never used.
  let robust = null;
  for (const x of rows.slice(0, robustTop)) if (!robust || x.minDraw > robust.minDraw) robust = x;
  let mx = null;
  for (const x of rows) if (!mx || x.heldout > mx.heldout) mx = x;
  const top = rows.slice(0, Math.min(50, rows.length));
  return {
    elites: rows.length,
    pickHeldout: hof ? fresh.score(hof.genome).count : 0,
    maxHeldout: mx ? mx.heldout : 0, maxHeldoutSearched: mx ? mx.searched : 0,
    top10: { searched: rows.slice(0, 10).map((x) => x.searched), heldout: rows.slice(0, 10).map((x) => x.heldout) },
    robustPick: robust ? { rule: 'the best worst-draw searched count among the top ' + robustTop + ' by fitness', heldout: robust.heldout, searched: robust.searched, minDraw: robust.minDraw, pickMinDraw: rows[0].minDraw } : null,
    spearmanTop: spearman(top.map((x) => x.fit), top.map((x) => x.heldout)),
  };
}

/** Solved tasks per draw from packed solved words (draw k is tasks k*Td .. (k+1)*Td - 1). Pure. */
export function countsByDrawWords(words, T, Td) {
  const out = new Array(Math.ceil(T / Td)).fill(0);
  for (let t = 0; t < T; t++) if ((words[t >>> 5] >>> (t & 31)) & 1) out[Math.floor(t / Td)]++;
  return out;
}

/** Spearman rank correlation with average ranks for ties; null under 3 points or a constant side. Pure. */
export function spearman(xs, ys) {
  const n = xs.length;
  if (n < 3 || ys.length !== n) return null;
  const rank = (v) => {
    const idx = v.map((x, i) => i).sort((a, b) => v[a] - v[b]);
    const r = new Array(n);
    for (let i = 0; i < n;) {
      let j = i;
      while (j + 1 < n && v[idx[j + 1]] === v[idx[i]]) j++;
      for (let k = i; k <= j; k++) r[idx[k]] = (i + j) / 2;
      i = j + 1;
    }
    return r;
  };
  const a = rank(xs), b = rank(ys);
  const ma = a.reduce((p, q) => p + q, 0) / n, mb = b.reduce((p, q) => p + q, 0) / n;
  let sab = 0, saa = 0, sbb = 0;
  for (let i = 0; i < n; i++) { sab += (a[i] - ma) * (b[i] - mb); saa += (a[i] - ma) ** 2; sbb += (b[i] - mb) ** 2; }
  return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : null;
}

// ---------------------------------------------------------------- reading the rows
/**
 * THE PLATEAU SECOND: the time of the last row whose `key` is above the row before it (after it
 * the score never rises again), and the score there. A series that never rises after its first
 * row plateaus at its first row. Pure.
 * @param {Array<object>} rows @param {string} key @returns {{ atMs: number, score: number }|null}
 */
export function plateauOf(rows, key = 'heldout') {
  if (!rows || !rows.length) return null;
  let at = 0;
  for (let i = 1; i < rows.length; i++) if (rows[i][key] > rows[i - 1][key]) at = i;
  return { atMs: rows[at].tMs, score: rows[at][key] };
}

/**
 * The gaps between consecutive rises of the SEARCHED objective (the restart schedule's evidence: a
 * restart N shorter than the gaps a run climbs out of by itself fires inside them). Longest first.
 * @param {Array<object>} rows @returns {{ rises: number, lastRiseMs: number|null, gaps: Array<{ ms: number, fromMs: number }> }}
 */
export function searchedGaps(rows) {
  let last = null, rises = 0;
  const gaps = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].objective > rows[i - 1].objective) {
      rises++;
      if (last !== null) gaps.push({ ms: rows[i].tMs - last, fromMs: last });
      last = rows[i].tMs;
    }
  }
  gaps.sort((x, y) => y.ms - x.ms || x.fromMs - y.fromMs);
  return { rises, lastRiseMs: last, gaps };
}

/** The last row at or before tMs (the first row when none is). Pure. */
export function rowAt(rows, tMs) {
  let r = rows[0];
  for (const x of rows) { if (x.tMs <= tMs) r = x; else break; }
  return r;
}

/**
 * The score gained AFTER tauMs, per million organism-years spent after it. Pure.
 * @returns {{ from: number, to: number, gained: number, years: number, perMillion: number|null }}
 */
export function gainAfter(rows, tauMs, key = 'heldout') {
  const a = rowAt(rows, tauMs), b = rows[rows.length - 1];
  const gained = b[key] - a[key], years = b.gen - a.gen;
  return { fromMs: a.tMs, from: a[key], to: b[key], gained, years, perMillion: years > 0 ? gained / (years / 1e6) : null };
}

/** n, mean, sample sd (0 below two values), min, max. Pure. */
export function stats(xs) {
  const v = xs.filter((x) => Number.isFinite(x));
  const n = v.length;
  if (!n) return { n: 0, mean: null, sd: null, min: null, max: null };
  const mean = v.reduce((a, b) => a + b, 0) / n;
  const sd = n > 1 ? Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)) : 0;
  return { n, mean, sd, min: Math.min(...v), max: Math.max(...v) };
}

/** Change points of a row series (plus one row per second), a lossless record of the step series. */
export function compactRows(rows) {
  const out = [];
  let lastSec = -1;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i], p = rows[i - 1];
    const sec = Math.floor(r.tMs / 1000);
    if (!p || i === rows.length - 1 || r.heldout !== p.heldout || r.objective !== p.objective || sec !== lastSec) {
      out.push([Math.round(r.tMs), r.gen, r.searched, r.len, r.heldout]);
      lastSec = sec;
    }
  }
  return out;
}

/**
 * One arm against the control, per plane, on the seeds both ran (paired by seed). The control's
 * plateau second of each seed is the tau the arm's post-plateau gain is read after.
 * @param {object[]} controlRuns runArm results @param {object[]} armRuns @param {string} key plane
 */
export function compareArm(controlRuns, armRuns, key) {
  const bySeed = new Map(controlRuns.map((r) => [r.seed, r]));
  const rows = [];
  for (const a of armRuns) {
    const c = bySeed.get(a.seed);
    if (!c) continue;
    const cp = c.planes[key], ap = a.planes[key];
    const tau = cp.plateau.atMs;
    rows.push({
      seed: a.seed,
      controlFinal: cp.final.heldout, armFinal: ap.final.heldout, diff: ap.final.heldout - cp.final.heldout,
      controlPlateauMs: tau, armPlateauMs: ap.plateau.atMs,
      controlAfter: gainAfter(cp.rows, tau), armAfter: gainAfter(ap.rows, tau),
      controlSearched: cp.final.searched, armSearched: ap.final.searched,
      controlYears: cp.organismYears, armYears: ap.organismYears,
    });
  }
  const s = (f) => stats(rows.map(f));
  const control = s((r) => r.controlFinal), armF = s((r) => r.armFinal);
  const noise = Math.max(control.sd ?? 0, armF.sd ?? 0);
  return {
    plane: key, seeds: rows.map((r) => r.seed), n: rows.length,
    controlFinal: control, armFinal: armF, diff: s((r) => r.diff), noise,
    beatsByMoreThanNoise: rows.length > 0 && (armF.mean - control.mean) > noise,
    controlPlateauMs: s((r) => r.controlPlateauMs), armPlateauMs: s((r) => r.armPlateauMs),
    plateauLater: rows.length > 0 && s((r) => r.armPlateauMs).mean > s((r) => r.controlPlateauMs).mean,
    controlPerMillionAfter: s((r) => r.controlAfter.perMillion), armPerMillionAfter: s((r) => r.armAfter.perMillion),
    armGainedAfter: s((r) => r.armAfter.gained), controlGainedAfter: s((r) => r.controlAfter.gained),
    controlSearched: s((r) => r.controlSearched), armSearched: s((r) => r.armSearched),
    rows,
  };
}

/**
 * THE COMBINATION THE SINGLE RUNS SAY IS BEST, by a rule fixed before any run: an intervention is
 * KEPT when its mean final held-out score is at or above the control's on BOTH planes and above it
 * on at least one (the gains summed as shares of each plane's held-out tasks). The combination is
 * every kept intervention; when none is kept it is the single intervention with the largest summed
 * share (so the fresh seeds still grade the best the singles offer). Pure.
 * @param {object} comparisons { novelty: { grid: compareArm, synthetic: compareArm }, ... }
 * @param {object} tasks { grid: heldout tasks, synthetic: heldout tasks }
 */
export function chooseCombination(comparisons, tasks) {
  const scored = [];
  for (const [name, byPlane] of Object.entries(comparisons)) {
    const planes = Object.keys(byPlane);
    const d = planes.map((p) => byPlane[p].armFinal.mean - byPlane[p].controlFinal.mean);
    const share = planes.reduce((a, p, i) => a + d[i] / tasks[p], 0);
    const kept = d.every((x) => x >= 0) && d.some((x) => x > 0);
    scored.push({ name, diffs: Object.fromEntries(planes.map((p, i) => [p, d[i]])), share, kept });
  }
  scored.sort((a, b) => b.share - a.share || a.name.localeCompare(b.name));
  const kept = scored.filter((s) => s.kept).map((s) => s.name);
  const chosen = kept.length ? kept : scored.length ? [scored[0].name] : [];
  const sw = { novelty: chosen.includes('novelty'), transfer: chosen.includes('transfer'), restart: chosen.includes('restart') };
  return { rule: 'keep an intervention whose mean final held-out is >= the control on both planes and > on one; combine every kept one; none kept: the single one with the largest summed gain as a share of each plane\'s held-out tasks', scored, kept, chosen, switches: sw, name: armName(sw), fallback: kept.length === 0 };
}

/**
 * THE BAR on the fresh seeds: the combination beats the control's final held-out score by more
 * than the seed-to-seed noise (the larger of the two arms' sample sd) on BOTH planes, and its
 * plateau second is later on both. Pure.
 */
export function barVerdict(byPlane) {
  const planes = Object.keys(byPlane);
  const per = Object.fromEntries(planes.map((p) => {
    const c = byPlane[p];
    return [p, { beats: c.beatsByMoreThanNoise, later: c.plateauLater, diff: c.armFinal.mean - c.controlFinal.mean, noise: c.noise }];
  }));
  const met = planes.length > 0 && planes.every((p) => per[p].beats && per[p].later);
  return { met, per };
}

// ---------------------------------------------------------------- the worker boundary
const SELF = new URL(import.meta.url);

/**
 * Run jobs at once, one worker thread each (the arms of one seed side by side, so they share the
 * machine's contention). A job is { planes: { key: { searched, fresh } } as wire, ...runArm opts }.
 * @returns {Promise<object[]>} the runArm results, in job order
 */
export function runJobs(jobs, { heapMb = 512 } = {}) {
  return Promise.all(jobs.map((job) => new Promise((resolve, reject) => {
    const w = new Worker(SELF, { workerData: { plateauJob: job }, resourceLimits: { maxOldGenerationSizeMb: heapMb } });
    let done = false;
    w.on('message', (m) => { done = true; if (m.error) reject(new Error(m.error)); else resolve(m.result); w.terminate(); });
    w.on('error', (e) => { if (!done) { done = true; reject(e); } });
    w.on('exit', (code) => { if (!done) { done = true; reject(new Error('plateau worker exited with code ' + code)); } });
  })));
}

if (!isMainThread && workerData && workerData.plateauJob) {
  const job = workerData.plateauJob;
  try {
    const planes = {};
    for (const [k, p] of Object.entries(job.planes)) planes[k] = { searched: matrixFromWire(p.searched), fresh: matrixFromWire(p.fresh) };
    const result = runArm({ ...job, planes });
    parentPort.postMessage({ result });
  } catch (e) {
    parentPort.postMessage({ error: String((e && e.stack) || e) });
  }
}
