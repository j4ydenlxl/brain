// generations/velocity.mjs: ITERATION VELOCITY. His P5, 2026-09-23: "billions of years, or
// infinite... to actually work to land it in the timeframe of peak efficiency and iterate that
// quickly". The years are worth nothing unless the search converges on real tasks, so this file
// is about two numbers and nothing else: how many genomes a second can be SCORED, and how many
// generations and wall seconds a search takes to stop improving.
//
// Three pieces.
//
//   1. THE EVALUATION MATRIX. For a fixed task suite whose per component outcome is
//      deterministic, every component's outcome on every task is computed ONCE, into two bit
//      planes: FIT (the component reproduces every demonstration of the task) and RIGHT (it fits,
//      and the answer it then gives on the held-out test input is the graded answer). A genome is
//      an ordered library of components; it answers a task with the FIRST component in its order
//      that fits, which is how a library of programs is used. Scoring a genome is then a walk of
//      its slots over typed arrays:
//
//          claimed = FIT[c] & unclaimed;  solved |= claimed & RIGHT[c];  unclaimed &= ~FIT[c]
//
//      one machine word per 32 tasks, no brain built, no tick run. The trader project reached
//      60.2M genome evaluations per second on the same idea (a precomputed return matrix).
//
//      The matrix is an EXACT cache and says so by being checked: tickScoreGrid() scores the same
//      genome the slow way, with every grid transform executed by a real grid cell in a real
//      Brain (a chain of cells per component, the inputs injected, the brain ticked, the outbox
//      read), and the per task outcomes of the two paths must agree on every task of every genome
//      checked. The matrix itself is filled by the pure grid functions of cells/grid.mjs, the
//      same ones the cells call, so a disagreement between a cell and its pure function would
//      show up as a mismatch, which is the only kind of check worth having.
//
//      The suite is tasks/grid.mjs, one of the four suites organism-genome.mjs hostableSuites()
//      reaches. A component is a chain of zero to maxDepth of its SEARCH_OPS, with the colour map
//      inferred at the end exactly as that file's tryTerminal does. The organism genome of
//      epochs.mjs is NOT matrix scored, and cannot be: its prediction term is deterministic but
//      is read off the whole wired brain after a tick run (it does not split into per component
//      columns), its throughput term is a wall clock, and its novelty term depends on the
//      archive passed in. notes/velocity.md says why in full.
//
//   2. THE PLATEAU RULER. A plane stops when the archive's best has not improved by more than
//      epsilon over `patience` generations. It prints generationsToPlateau (the generation of the
//      last improvement, the landing), the generation it fired, wall to both, evaluations per
//      second, archive fill, and the declared arithmetic years. The ruler wraps any engine with a
//      step(): the matrix engine here, and a real organism plane of planes.mjs through the seam
//      runPlaneAsync already exposes (plateauOrganismPlane).
//
//   3. INFINITE MODE. Planes are drawn from an unbounded list of coordinates and each is run to
//      its plateau; the next plane starts from the best genome found so far, so a plateau is not
//      a stop but a restart from the best place known. It ends when the ruler has fired on every
//      coordinate of a finite list, or when the wall budget ends.
//
// YEARS. A matrix evaluation runs no ticks. The years printed beside it are the declared
// arithmetic: evaluations x the ticks the tick path MEASURED per evaluation of the same suite x
// the declared seconds per tick / SECONDS_PER_YEAR. That is what the evaluations would have cost
// as organism time, it is never a measurement, and it is never a headline.
import { RNG, hash32 } from '../core/rng.mjs';
import { Brain } from '../core/brain.mjs';
import { G } from '../cells/grid.mjs';
import '../cells/grid.mjs';
import { SEARCH_OPS, GRID_COUNTS, generateGrids, inferColorMap } from '../tasks/grid.mjs';
import { SECONDS_PER_YEAR, DEFAULT_SECONDS_PER_TICK } from './epochs.mjs';
import os from 'node:os';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

export { SECONDS_PER_YEAR, DEFAULT_SECONDS_PER_TICK };

// ---------------------------------------------------------------- declared constants
/** The longest library any engine here may hold. The parsimony term divides by one more. */
export const LEN_CAP = 256;
/** The guard tasks/grid.mjs applies to a candidate grid: past this it is not the answer. */
export const MAX_CELLS = 4096;
/** The ops a grid component is made of, in the order tasks/grid.mjs declares them. */
export const OPS = SEARCH_OPS;
/** Bins per descriptor axis of the MAP-Elites archive. Four axes. */
export const DEFAULT_BINS = 6;

/**
 * The fitness of a library that solves `count` of `tasks` with `len` slots. Solving one more task
 * always beats any change of length (len never exceeds LEN_CAP), and between two libraries that
 * solve the same tasks the shorter one wins. Both paths call this one function, so the scalar is
 * identical whenever the count and the length are.
 * @param {number} count @param {number} len @param {number} tasks @returns {number}
 */
export function fitnessOf(count, len, tasks) { return (count - len / (LEN_CAP + 1)) / tasks; }

/**
 * THE OBJECTIVE OVER K DRAWS. A suite of `tasks` tasks that is K draws of `tasks / K` each,
 * stacked, is scored as the MEAN over the draws of fitnessOf on each draw:
 *
 *     mean_k (count_k - len / (LEN_CAP + 1)) / Td  =  (sum_k count_k / K - len / (LEN_CAP + 1)) / Td
 *
 * with Td = tasks / K, so only the total count is needed, and the word walk over the stacked
 * planes gives exactly that total (the draws are disjoint task ranges). At K = 1 this IS
 * fitnessOf, the same expression evaluated in the same order, so a one draw search is the single
 * draw search of Board 8 bit for bit. At K above 1 one task on one draw is worth 1 / K of a task
 * of a single draw, and a slot still costs 1 / (LEN_CAP + 1) of one: the length term is the
 * per draw tie break it always was, averaged.
 * @param {number} count solved tasks summed over the draws @param {number} len
 * @param {number} tasks tasks summed over the draws @param {number} [draws]
 * @returns {number}
 */
export function objectiveOf(count, len, tasks, draws = 1) {
  if (draws === 1) return fitnessOf(count, len, tasks);
  return (count / draws - len / (LEN_CAP + 1)) / (tasks / draws);
}

function popcnt(x) {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return Math.imul((x + (x >>> 4)) & 0x0F0F0F0F, 0x01010101) >>> 24;
}
export { popcnt };

// ---------------------------------------------------------------- the matrix
/**
 * Components x tasks, two bit planes, plus what the descriptors need per component (its size and
 * the ops it uses) and per task (whether it is a deep task). Built by buildGridMatrix or
 * syntheticMatrix; scored by score() and scoreAt().
 */
export class EvalMatrix {
  constructor({ name, components, tasks, fit, right, size, opMask, nOps, deepMask, names = null, meta = {}, draws = 1 }) {
    this.name = name;
    this.C = components; this.T = tasks; this.W = Math.ceil(tasks / 32);
    if (fit.length !== this.C * this.W || right.length !== this.C * this.W) throw new Error('matrix: plane size is not components x words');
    // The objective's K: the tasks are `draws` equal draws laid end to end (stackDraws), and the
    // fitness of a library is its mean over them (objectiveOf). A plain matrix is one draw.
    if (!(Number.isInteger(draws) && draws >= 1 && tasks % draws === 0)) throw new Error('matrix: draws must be a whole number that divides the tasks');
    this.draws = draws;
    this.tasksPerDraw = tasks / draws;
    this.fit = fit; this.right = right;
    this.size = size; this.opMask = opMask; this.nOps = nOps;
    this.deepMask = deepMask;
    this.names = names;
    this.meta = meta;
    this.maxSize = 0;
    for (let c = 0; c < this.C; c++) if (size[c] > this.maxSize) this.maxSize = size[c];
    this.fullMask = new Uint32Array(this.W);
    for (let t = 0; t < this.T; t++) this.fullMask[t >>> 5] |= (1 << (t & 31));
    this._un = new Uint32Array(this.W);
    // The draw prior: a size is drawn uniformly, then a component of that size. A library of
    // short programs is reached as often as one of long ones, although long ones outnumber them.
    const bySize = new Map();
    for (let c = 0; c < this.C; c++) { const s = size[c]; if (!bySize.has(s)) bySize.set(s, []); bySize.get(s).push(c); }
    this.groups = [...bySize.keys()].sort((a, b) => a - b).map((s) => Int32Array.from(bySize.get(s)));
  }

  /**
   * Score the library held in buf[off .. off + len). Writes the solved task bits into `solved`
   * (W words) and returns the number of tasks solved. With `claims` (a Uint8Array of at least
   * len), slot i is marked 1 when it claimed at least one task, 0 when every task it fits had
   * already been claimed by an earlier slot or it fits none.
   * @param {Int32Array} buf @param {number} off @param {number} len @param {Uint32Array} solved
   * @param {Uint8Array} [claims]
   * @returns {number}
   */
  scoreAt(buf, off, len, solved, claims = null) {
    const W = this.W, fit = this.fit, right = this.right, un = this._un;
    un.set(this.fullMask);
    solved.fill(0);
    if (claims) claims.fill(0, 0, len);
    for (let i = 0; i < len; i++) {
      const base = buf[off + i] * W;
      let open = 0, took = 0;
      for (let w = 0; w < W; w++) {
        const f = fit[base + w] & un[w];
        if (f !== 0) { solved[w] |= f & right[base + w]; un[w] &= ~f; took = 1; }
        open |= un[w];
      }
      if (claims) claims[i] = took;
      if (open === 0) break;
    }
    let n = 0;
    for (let w = 0; w < W; w++) n += popcnt(solved[w]);
    return n;
  }

  /**
   * @param {ArrayLike<number>} genome component indices in library order
   * @returns {{ count: number, solved: Uint8Array, fitness: number }}
   */
  score(genome) {
    const buf = Int32Array.from(genome);
    const words = new Uint32Array(this.W);
    const count = this.scoreAt(buf, 0, buf.length, words);
    return { count, solved: unpackBits(words, this.T), fitness: this.objective(count, buf.length) };
  }

  /** The fitness of a library of `len` slots that solves `count` tasks: the mean over the draws. */
  objective(count, len) { return objectiveOf(count, len, this.T, this.draws); }

  /** Solved tasks per draw, from a solved vector as score() returns it. */
  countsByDraw(solved) {
    const out = new Array(this.draws).fill(0), Td = this.tasksPerDraw;
    for (let t = 0; t < this.T; t++) if (solved[t]) out[Math.floor(t / Td)]++;
    return out;
  }

  /** Tasks some single component answers correctly when it comes first: the ceiling of any library. */
  unionBound() {
    const acc = new Uint32Array(this.W);
    for (let c = 0; c < this.C; c++) for (let w = 0; w < this.W; w++) acc[w] |= this.right[c * this.W + w];
    let n = 0;
    for (let w = 0; w < this.W; w++) n += popcnt(acc[w]);
    return n;
  }

  /** @param {number} c @param {number} t @returns {{ fit: boolean, right: boolean }} */
  cell(c, t) {
    const i = c * this.W + (t >>> 5), b = 1 << (t & 31);
    return { fit: (this.fit[i] & b) !== 0, right: (this.right[i] & b) !== 0 };
  }

  describe(c) { return this.names ? this.names(c) : 'c' + c; }

  /**
   * Per task, the components that answer it (RIGHT set), as one compressed index: the
   * components answering task t are components[offsets[t] .. offsets[t + 1]). Also the union of
   * RIGHT over all components (`answerable`). Built once, on first use, from the planes.
   * @returns {{ offsets: Int32Array, components: Int32Array, answerable: Uint32Array }}
   */
  rightIndex() {
    if (this._rix) return this._rix;
    const T = this.T, W = this.W;
    const offsets = new Int32Array(T + 1);
    const answerable = new Uint32Array(W);
    for (let c = 0; c < this.C; c++) {
      for (let w = 0; w < W; w++) {
        let x = this.right[c * W + w];
        answerable[w] |= x;
        while (x) { const b = 31 - Math.clz32(x); offsets[w * 32 + b + 1]++; x = (x & ~(1 << b)) >>> 0; }
      }
    }
    for (let t = 0; t < T; t++) offsets[t + 1] += offsets[t];
    const components = new Int32Array(offsets[T]);
    const at = offsets.slice(0, T);
    for (let c = 0; c < this.C; c++) {
      for (let w = 0; w < W; w++) {
        let x = this.right[c * W + w];
        while (x) { const b = 31 - Math.clz32(x); components[at[w * 32 + b]++] = c; x = (x & ~(1 << b)) >>> 0; }
      }
    }
    this._rix = { offsets, components, answerable };
    return this._rix;
  }
}

function unpackBits(words, T) {
  const out = new Uint8Array(T);
  for (let t = 0; t < T; t++) out[t] = (words[t >>> 5] >>> (t & 31)) & 1;
  return out;
}

/**
 * The reference the matrix is checked against in the tests: first fit, task by task, read off
 * the planes one cell at a time. Slow, obvious, and independent of scoreAt's word arithmetic.
 */
export function referenceScore(matrix, genome) {
  const solved = new Uint8Array(matrix.T);
  const claimedBy = new Int16Array(matrix.T).fill(-1);
  let count = 0;
  const g = Array.from(genome);
  for (let t = 0; t < matrix.T; t++) {
    for (let i = 0; i < g.length; i++) {
      const { fit, right } = matrix.cell(g[i], t);
      if (!fit) continue;
      claimedBy[t] = i;
      if (right) { solved[t] = 1; count++; }
      break;
    }
  }
  return { count, solved, claimedBy, fitness: objectiveOf(count, g.length, matrix.T, matrix.draws || 1) };
}

// ---------------------------------------------------------------- the grid suite
/** How many components a grid matrix of this depth holds: the identity, then 18^1 .. 18^d. */
export function gridComponentCount(maxDepth) {
  let n = 1, p = 1;
  for (let d = 1; d <= maxDepth; d++) { p *= OPS.length; n += p; }
  return n;
}

/**
 * Component index to its chain of op indices. Index 0 is the identity (no op, the colour map
 * alone). Then every chain of length 1, then of length 2, and so on, each block in base-18 order.
 * @param {number} c @param {number} maxDepth @returns {number[]}
 */
export function gridChainOf(c, maxDepth) {
  if (c === 0) return [];
  let off = 1, p = 1;
  for (let d = 1; d <= maxDepth; d++) {
    p *= OPS.length;
    if (c < off + p) {
      let r = c - off;
      const chain = new Array(d);
      for (let i = d - 1; i >= 0; i--) { chain[i] = r % OPS.length; r = Math.floor(r / OPS.length); }
      return chain;
    }
    off += p;
  }
  throw new Error('gridChainOf: component ' + c + ' is past depth ' + maxDepth);
}

function applyGuarded(o, g) {
  if (!g) return null;
  const out = OPS[o].apply(g);
  return out && out.cells.length <= MAX_CELLS ? out : null;
}

function allEqual(cur, wanted) {
  for (let i = 0; i < wanted.length; i++) if (!cur[i] || !G.equal(cur[i], wanted[i])) return false;
  return true;
}

/**
 * The terminal step of tasks/grid.mjs tryTerminal, for one component's outputs on one task:
 * the component fits when its demo outputs are the wanted ones, or when one inferred colour map
 * turns them into the wanted ones. Returns the answer the component then gives on the test input.
 * Used by BOTH paths: the pure precompute hands it grids the pure functions made, the tick path
 * hands it grids the cells made and a colormap applier that runs a real grid.colormap cell.
 * @returns {{ fit: boolean, answer: object|null }}
 */
function terminal(outs, wanted, applyMap) {
  const demos = outs.slice(0, wanted.length);
  if (allEqual(demos, wanted)) return { fit: true, answer: outs[wanted.length] || null };
  const map = inferColorMap(demos, wanted);
  if (!map) return { fit: false, answer: null };
  const mapped = applyMap(outs, map);
  if (!allEqual(mapped.slice(0, wanted.length), wanted)) return { fit: false, answer: null };
  return { fit: true, answer: mapped[wanted.length] || null };
}

const pureMap = (outs, map) => outs.map((g) => (g ? G.colormap(g, map) : null));

/**
 * Generate the grid suite and fill its matrix with the pure grid functions. Every chain shares
 * its prefix's outputs, so each grid op is applied once per grid per chain.
 * @param {object} [opts] { seed, counts, maxDepth }
 * @returns {{ matrix: EvalMatrix, tasks: object[], maxDepth: number, precomputeMs: number }}
 */
export function buildGridMatrix({ seed = 'grid/velocity', counts = GRID_COUNTS, maxDepth = 3 } = {}) {
  if (!(maxDepth >= 0 && maxDepth <= 4)) throw new Error('buildGridMatrix: maxDepth must be 0..4');
  const t0 = process.hrtime.bigint();
  const tasks = generateGrids({ seed, counts });
  const C = gridComponentCount(maxDepth), T = tasks.length, W = Math.ceil(T / 32);
  const fit = new Uint32Array(C * W), right = new Uint32Array(C * W);
  const size = new Uint8Array(C), opMask = new Uint32Array(C);
  for (let c = 0; c < C; c++) {
    const chain = gridChainOf(c, maxDepth);
    size[c] = chain.length;
    let m = 0;
    for (const o of chain) m |= (1 << o);
    opMask[c] = m >>> 0;
  }
  const deepMask = new Uint32Array(W);
  // Block offsets: blockOff[d] is the index of the first chain of length d.
  const blockOff = [0, 1];
  for (let d = 2, p = OPS.length; d <= maxDepth + 1; d++, p *= OPS.length) blockOff.push(blockOff[d - 1] + p);
  let applied = 0;
  for (let t = 0; t < T; t++) {
    const task = tasks[t];
    if (task.length >= 2) deepMask[t >>> 5] |= (1 << (t & 31));
    const wanted = task.demos.map((d) => d.output);
    const inputs = task.demos.map((d) => d.input).concat([task.test.input]);
    const word = t >>> 5, bit = 1 << (t & 31);
    const record = (c, outs) => {
      const r = terminal(outs, wanted, pureMap);
      if (!r.fit) return;
      fit[c * W + word] |= bit;
      if (r.answer && G.equal(r.answer, task.test.output)) right[c * W + word] |= bit;
    };
    const walk = (depth, rank, outs) => {
      record(blockOff[depth] + rank, outs);
      if (depth === maxDepth) return;
      for (let o = 0; o < OPS.length; o++) {
        const next = outs.map((g) => applyGuarded(o, g));
        applied += next.length;
        walk(depth + 1, rank * OPS.length + o, next);
      }
    };
    walk(0, 0, inputs);
  }
  const precomputeMs = Number(process.hrtime.bigint() - t0) / 1e6;
  const matrix = new EvalMatrix({
    name: 'grid', components: C, tasks: T, fit, right, size, opMask, nOps: OPS.length, deepMask,
    names: (c) => { const ch = gridChainOf(c, maxDepth); return ch.length ? ch.map((o) => OPS[o].name).join('>') : 'identity'; },
    meta: { seed, counts: { ...GRID_COUNTS, ...counts }, maxDepth, opsApplied: applied, precomputeMs },
  });
  return { matrix, tasks, maxDepth, precomputeMs };
}

// ---------------------------------------------------------------- the multi-draw objective
/**
 * The seeds of K draws of a suite, derived from the run seed. Draw 0 is the run seed itself, so
 * the first draw is the suite a single draw search is run on, and K = 1 is that search.
 * @param {string} seed @param {number} draws @returns {string[]}
 */
export function drawSeeds(seed, draws) {
  if (!(Number.isInteger(draws) && draws >= 1)) throw new Error('drawSeeds: draws must be a whole number of at least 1');
  const out = [String(seed)];
  for (let k = 1; k < draws; k++) out.push(seed + ':draw' + k);
  return out;
}

/**
 * K matrices over the same components, laid end to end on the task axis: task t of draw k is task
 * k x Td + t of the stack. First fit is decided task by task, so the walk over the stack claims
 * and solves on each draw exactly what it would on that draw alone, and its count is the sum of
 * the per draw counts. The stack carries draws = K, so its fitness is the mean (objectiveOf).
 * @param {EvalMatrix[]} parts @param {object} [opts] { name, meta }
 * @returns {EvalMatrix}
 */
export function stackDraws(parts, { name = 'draws', meta = {} } = {}) {
  const K = parts.length;
  if (K < 1) throw new Error('stackDraws: needs at least one draw');
  const first = parts[0], C = first.C, Td = first.T;
  for (const p of parts) {
    if (p.C !== C || p.T !== Td || p.draws !== 1) throw new Error('stackDraws: every draw must be one draw of the same components and the same number of tasks');
    for (let c = 0; c < C; c++) if (p.size[c] !== first.size[c] || p.opMask[c] !== first.opMask[c]) throw new Error('stackDraws: component ' + c + ' is not the same component in every draw');
  }
  const T = K * Td, W = Math.ceil(T / 32);
  const fit = new Uint32Array(C * W), right = new Uint32Array(C * W), deepMask = new Uint32Array(W);
  for (let k = 0; k < K; k++) {
    const p = parts[k], pw = p.W;
    for (let t = 0; t < Td; t++) {
      const src = t >>> 5, sb = 1 << (t & 31);
      const u = k * Td + t, dst = u >>> 5, db = 1 << (u & 31);
      if (p.deepMask[src] & sb) deepMask[dst] |= db;
      for (let c = 0; c < C; c++) {
        if (p.fit[c * pw + src] & sb) fit[c * W + dst] |= db;
        if (p.right[c * pw + src] & sb) right[c * W + dst] |= db;
      }
    }
  }
  return new EvalMatrix({
    name, components: C, tasks: T, fit, right, size: first.size, opMask: first.opMask, nOps: first.nOps, deepMask,
    names: first.names, draws: K, meta: { draws: K, tasksPerDraw: Td, parts: parts.map((p) => p.meta), ...meta },
  });
}

/**
 * The grid suite as K draws: one matrix per draw seed (drawSeeds), stacked. Returns a suite the
 * tick path and the exactness check take as they take a single draw (tasks in stack order,
 * maxDepth, draws), plus the per draw parts.
 * @param {object} [opts] { seed, draws, counts, maxDepth, exclude: seeds no draw may use }
 * @returns {{ matrix: EvalMatrix, tasks: object[], maxDepth: number, draws: number, seeds: string[], parts: object[], precomputeMs: number }}
 */
export function buildGridDraws({ seed = 'grid/velocity', draws = 1, counts = GRID_COUNTS, maxDepth = 3, exclude = [] } = {}) {
  const seeds = drawSeeds(seed, draws);
  for (const s of seeds) if (exclude.includes(s)) throw new Error('buildGridDraws: draw seed ' + s + ' is a seed the caller holds out');
  const parts = seeds.map((s) => ({ seed: s, ...buildGridMatrix({ seed: s, counts, maxDepth }) }));
  // meta.runSeed, not meta.seed: the parallel audit regenerates ONE suite from meta.seed, so a
  // stack must not look like a single draw to it (audit the parts, one draw at a time).
  const matrix = stackDraws(parts.map((p) => p.matrix), { name: 'grid:' + draws + 'draws', meta: { runSeed: seed, seeds, counts: { ...GRID_COUNTS, ...counts }, maxDepth } });
  return {
    matrix, tasks: parts.flatMap((p) => p.tasks), maxDepth, draws, seeds, parts,
    precomputeMs: parts.reduce((a, p) => a + p.precomputeMs, 0),
  };
}

// ---------------------------------------------------------------- the tick path
function tickBrain() {
  return new Brain({
    name: 'velocity.tick', seed: 'velocity.tick', ledger: 'off', pruneEvery: 0,
    growth: { threshold: Number.MAX_SAFE_INTEGER }, ledgerRing: 16, connectomeCapacity: 64,
  });
}

// Tick until every chain whose output is awaited has delivered, or until the chain length plus a
// slack of four ticks has passed. A chain whose cell emitted nothing is left null, as the pure
// path leaves a null grid.
function drain(brain, want, maxLen, onSignal) {
  let waiting = want;
  let ticks = 0;
  while (waiting > 0 && ticks < maxLen + 4) {
    brain.tick(1);
    ticks++;
    for (const sig of brain.takeOutbox()) if (onSignal(sig)) waiting--;
  }
}

/**
 * Score a library the slow way: every grid transform is a real grid cell in a real Brain.
 *
 * One Brain per genome. One chain of cells per distinct component, wired once, reused for every
 * task. For each task the three demonstration inputs and the test input are injected, one round
 * at a time, into every chain head at once, the brain is ticked until each chain's last cell has
 * delivered, and the grids are read off the outbox. A component whose outputs need a colour map
 * gets a real grid.colormap cell with the inferred map as its params, and its outputs are pushed
 * through that cell. The first component in library order that fits answers the task.
 *
 * With `all` on, every distinct component's fit and answer are worked out on every task (not
 * only up to the first fit), and returned as two bit planes in component order: the audit.
 *
 * @param {ArrayLike<number>} genome component indices in library order
 * @param {{ tasks: object[], maxDepth: number }} suite what buildGridMatrix returned
 * @param {object} [opts] { all }
 * @returns {{ count, solved: Uint8Array, claimedBy: Int16Array, fitness, ticks, cells, runs, planes }}
 */
function tickPath(genome, suite, { all = false } = {}) {
  const { tasks, maxDepth } = suite;
  const g = Array.from(genome);
  const brain = tickBrain();
  const chains = new Map();   // component -> { head, lastIdx, len }
  let maxLen = 0;
  for (const c of g) {
    if (chains.has(c)) continue;
    const ops = gridChainOf(c, maxDepth);
    const ids = [];
    for (let i = 0; i < ops.length; i++) {
      const id = 'v.' + c + '.' + i;
      brain.addCell({ id, kind: OPS[ops[i]].kind, region: 'cognitive', circuit: 'velocity', params: OPS[ops[i]].params, policy: { period: 'event' } });
      if (i > 0) brain.connect(ids[i - 1], 'out', id, 'in');
      ids.push(id);
    }
    chains.set(c, { head: ids[0] || null, lastIdx: ids.length ? brain.cell(ids[ids.length - 1]).idx : -1, len: ops.length });
    if (ops.length > maxLen) maxLen = ops.length;
  }
  const byLast = new Map();
  for (const [c, ch] of chains) if (ch.lastIdx >= 0) byLast.set(ch.lastIdx, c);
  const live = [...chains.entries()].filter(([, ch]) => ch.len > 0);
  const distinct = [...chains.keys()];

  // The colour map cells live in a small brain of their own, one per task. A map cell is used
  // for one task and never again, and core/brain.mjs scans every event cell on every tick, so
  // keeping them in the chain brain made each tick pay for every map of every earlier task.
  const cm = { brain: null, task: -1, count: 0, ticks: 0, runs: 0, cells: 0 };
  const retireMapBrain = () => {
    if (!cm.brain) return;
    cm.ticks += cm.brain.stats.ticks; cm.runs += cm.brain.stats.runs; cm.cells += cm.brain.cells.length;
    cm.brain = null;
  };
  let currentTask = -1;
  const cellMap = (outs, map) => {
    if (cm.task !== currentTask || !cm.brain) { retireMapBrain(); cm.brain = tickBrain(); cm.task = currentTask; }
    const mb = cm.brain;
    const id = 'v.cm.' + (cm.count++);
    const cell = mb.addCell({ id, kind: 'grid.colormap', region: 'cognitive', circuit: 'velocity', params: { map }, policy: { period: 'event' } });
    return outs.map((grid) => {
      if (!grid) return null;
      mb.inject(id, 'in', { kind: 'event', data: grid });
      let got = null;
      drain(mb, 1, 1, (sig) => { if (sig.src !== cell.idx) return false; got = sig.data; return true; });
      return got;
    });
  };

  const T = tasks.length, W = Math.ceil(T / 32);
  const solved = new Uint8Array(T);
  const claimedBy = new Int16Array(T).fill(-1);
  const planes = all ? { components: distinct, fit: new Uint32Array(distinct.length * W), right: new Uint32Array(distinct.length * W) } : null;
  let count = 0;
  for (let t = 0; t < T; t++) {
    currentTask = t;
    const task = tasks[t];
    const wanted = task.demos.map((d) => d.output);
    const inputs = task.demos.map((d) => d.input).concat([task.test.input]);
    const outs = new Map();
    for (const c of distinct) outs.set(c, new Array(inputs.length).fill(null));
    for (let r = 0; r < inputs.length; r++) {
      for (const [c, ch] of chains) if (ch.len === 0) outs.get(c)[r] = inputs[r];
      for (const [, ch] of live) brain.inject(ch.head, 'in', { kind: 'event', data: inputs[r] });
      drain(brain, live.length, maxLen, (sig) => {
        const c = byLast.get(sig.src);
        if (c === undefined) return false;
        const row = outs.get(c);
        const first = row[r] === null;
        row[r] = sig.data;
        return first;
      });
    }
    if (all) {
      const verdict = new Map();
      for (let k = 0; k < distinct.length; k++) {
        const c = distinct[k];
        const res = terminal(outs.get(c), wanted, cellMap);
        const ok = res.fit && !!res.answer && G.equal(res.answer, task.test.output);
        verdict.set(c, { fit: res.fit, ok });
        if (res.fit) planes.fit[k * W + (t >>> 5)] |= (1 << (t & 31));
        if (ok) planes.right[k * W + (t >>> 5)] |= (1 << (t & 31));
      }
      for (let i = 0; i < g.length; i++) {
        const v = verdict.get(g[i]);
        if (!v.fit) continue;
        claimedBy[t] = i;
        if (v.ok) { solved[t] = 1; count++; }
        break;
      }
      continue;
    }
    for (let i = 0; i < g.length; i++) {
      const res = terminal(outs.get(g[i]), wanted, cellMap);
      if (!res.fit) continue;
      claimedBy[t] = i;
      if (res.answer && G.equal(res.answer, task.test.output)) { solved[t] = 1; count++; }
      break;
    }
  }
  retireMapBrain();
  return {
    count, solved, claimedBy, fitness: objectiveOf(count, g.length, T, suite.draws || 1),
    ticks: brain.stats.ticks + cm.ticks, cells: brain.cells.length + cm.cells, runs: brain.stats.runs + cm.runs,
    mapCells: cm.count, planes,
  };
}

/** The tick path, first fit only: what a library costs to score the slow way. */
export function tickScoreGrid(genome, suite) { return tickPath(genome, suite); }

/**
 * Score every genome both ways and count the disagreements, task by task: whether the task was
 * solved (the fast word path against the cells), and which slot claimed it (the per cell
 * reference walk against the cells). The count and the scalar fitness are compared too.
 * @param {EvalMatrix} matrix @param {object} suite @param {ArrayLike<number>[]} genomes
 * @returns {{ genomes, tasks, taskMismatches, claimMismatches, countMismatches, fitnessMismatches, wordVsReference, first, tick, matrixCounts }}
 */
export function exactnessCheck(matrix, suite, genomes) {
  let taskMismatches = 0, claimMismatches = 0, countMismatches = 0, fitnessMismatches = 0, wordVsReference = 0, first = null;
  let ticks = 0, tickMs = 0, runs = 0;
  const matrixCounts = [];
  for (let i = 0; i < genomes.length; i++) {
    const g = genomes[i];
    const m = matrix.score(g);
    const ref = referenceScore(matrix, g);
    const t0 = process.hrtime.bigint();
    const k = tickScoreGrid(g, suite);
    tickMs += Number(process.hrtime.bigint() - t0) / 1e6;
    ticks += k.ticks; runs += k.runs;
    matrixCounts.push(m.count);
    if (m.count !== ref.count) wordVsReference++;
    if (m.count !== k.count) countMismatches++;
    if (m.fitness !== k.fitness) fitnessMismatches++;
    for (let t = 0; t < matrix.T; t++) {
      const badSolved = m.solved[t] !== k.solved[t];
      const badClaim = ref.claimedBy[t] !== k.claimedBy[t];
      if (badSolved) taskMismatches++;
      if (badClaim) claimMismatches++;
      if ((badSolved || badClaim) && !first) {
        first = { genome: i, task: t, taskId: suite.tasks[t].id, matrix: { solved: m.solved[t], claimedBy: ref.claimedBy[t] }, tick: { solved: k.solved[t], claimedBy: k.claimedBy[t] }, library: Array.from(g).map((c) => matrix.describe(c)) };
      }
    }
  }
  return {
    genomes: genomes.length, tasks: matrix.T,
    taskMismatches, claimMismatches, countMismatches, fitnessMismatches, wordVsReference, first,
    tick: { ms: tickMs, ticks, runs, meanTicksPerEval: genomes.length ? ticks / genomes.length : 0, evalsPerSecond: tickMs > 0 ? genomes.length / (tickMs / 1000) : 0 },
    matrixCounts,
  };
}

/**
 * THE FULL AUDIT: every cell of both planes, recomputed by real cells. Components are taken in
 * batches, one Brain per batch, and every component of the batch is judged on every task.
 * @param {EvalMatrix} matrix @param {object} suite
 * @param {object} [opts] { batch, components: the indices to audit (default all), onBatch }
 * @returns {{ components, cells, fitMismatches, rightMismatches, first, ms, ticks }}
 */
export function auditGridMatrix(matrix, suite, { batch = 128, components = null, onBatch = null } = {}) {
  const list = components ? Array.from(components) : Array.from({ length: matrix.C }, (_, i) => i);
  let fitMismatches = 0, rightMismatches = 0, first = null, ticks = 0;
  const W = matrix.W;
  const t0 = process.hrtime.bigint();
  for (let b = 0; b < list.length; b += batch) {
    const chunk = list.slice(b, b + batch);
    const k = tickPath(chunk, suite, { all: true });
    ticks += k.ticks;
    for (let j = 0; j < k.planes.components.length; j++) {
      const c = k.planes.components[j];
      for (let w = 0; w < W; w++) {
        const df = (k.planes.fit[j * W + w] ^ matrix.fit[c * W + w]) >>> 0;
        const dr = (k.planes.right[j * W + w] ^ matrix.right[c * W + w]) >>> 0;
        if (df) fitMismatches += popcnt(df);
        if (dr) rightMismatches += popcnt(dr);
        if ((df || dr) && !first) {
          const bit = 31 - Math.clz32(df || dr);
          const t = w * 32 + bit;
          first = { component: c, name: matrix.describe(c), task: t, taskId: suite.tasks[t] ? suite.tasks[t].id : null, matrix: matrix.cell(c, t), cells: { fit: ((k.planes.fit[j * W + w] >>> bit) & 1) === 1, right: ((k.planes.right[j * W + w] >>> bit) & 1) === 1 } };
        }
      }
    }
    if (onBatch) onBatch({ done: Math.min(list.length, b + batch), of: list.length, fitMismatches, rightMismatches });
  }
  return { components: list.length, cells: list.length * matrix.T, fitMismatches, rightMismatches, first, ms: Number(process.hrtime.bigint() - t0) / 1e6, ticks };
}

/**
 * The matrix path's scoring rate on a list of genomes, looped until at least `minMs` of wall.
 * @returns {{ evals, ms, evalsPerSecond, checksum }}
 */
export function matrixRate(matrix, genomes, { minMs = 1000 } = {}) {
  const lens = genomes.map((g) => g.length);
  const off = [];
  let total = 0;
  for (const n of lens) { off.push(total); total += n; }
  const buf = new Int32Array(total);
  genomes.forEach((g, i) => buf.set(Int32Array.from(g), off[i]));
  const words = new Uint32Array(matrix.W);
  let evals = 0, checksum = 0;
  const t0 = process.hrtime.bigint();
  let ms = 0;
  do {
    for (let i = 0; i < genomes.length; i++) checksum += matrix.scoreAt(buf, off[i], lens[i], words);
    evals += genomes.length;
    ms = Number(process.hrtime.bigint() - t0) / 1e6;
  } while (ms < minMs);
  return { evals, ms, evalsPerSecond: evals / (ms / 1000), checksum };
}

// ---------------------------------------------------------------- a synthetic landscape
/**
 * A matrix whose optimum is known by construction. The tasks are cut into `planted` blocks of
 * equal size; one planted component fits and answers exactly its block. Every decoy fits
 * `decoyFit` tasks drawn from the whole suite and answers only `decoyRight` of them, fewer than a
 * block, so it can shadow a planted component (placed before it, it claims tasks and answers some
 * wrongly) but never replace one. The unique best library is the planted set, in any order:
 * count = tasks, length = planted, fitness = fitnessOf(tasks, planted, tasks).
 * @returns {{ matrix: EvalMatrix, optimum: number, plantedIds: number[], blockSize: number }}
 */
export function syntheticMatrix({ seed = 'synthetic', tasks = 256, planted = 8, decoys = 504, decoyFit = 24, decoyRight = 6, nOps = 18, maxSize = 3 } = {}) {
  if (tasks % planted !== 0) throw new Error('syntheticMatrix: tasks must divide into planted blocks');
  const B = tasks / planted;
  if (!(decoyRight < B)) throw new Error('syntheticMatrix: a decoy must answer fewer tasks than a block, or the optimum is not unique');
  if (decoyRight > decoyFit || decoyFit > tasks) throw new Error('syntheticMatrix: need decoyRight <= decoyFit <= tasks');
  const rng = new RNG(seed + ':synthetic');
  const C = planted + decoys, T = tasks, W = Math.ceil(T / 32);
  const fit = new Uint32Array(C * W), right = new Uint32Array(C * W);
  const size = new Uint8Array(C), opMask = new Uint32Array(C), deepMask = new Uint32Array(W);
  // planted components sit at random indices, so nothing about their position is special
  const order = Array.from({ length: C }, (_, i) => i);
  for (let i = C - 1; i > 0; i--) { const j = rng.int(i + 1); const x = order[i]; order[i] = order[j]; order[j] = x; }
  const plantedIds = order.slice(0, planted).sort((a, b) => a - b);
  const set = (plane, c, t) => { plane[c * W + (t >>> 5)] |= (1 << (t & 31)); };
  for (let p = 0; p < planted; p++) {
    const c = order[p];
    for (let t = p * B; t < (p + 1) * B; t++) { set(fit, c, t); set(right, c, t); }
  }
  const all = Array.from({ length: T }, (_, i) => i);
  for (let d = 0; d < decoys; d++) {
    const c = order[planted + d];
    for (let i = 0; i < decoyFit; i++) { const j = i + rng.int(T - i); const x = all[i]; all[i] = all[j]; all[j] = x; }
    for (let i = 0; i < decoyFit; i++) set(fit, c, all[i]);
    for (let i = 0; i < decoyRight; i++) set(right, c, all[i]);
  }
  for (let c = 0; c < C; c++) {
    size[c] = 1 + rng.int(maxSize);
    let m = 0;
    for (let o = 0; o < nOps; o++) if (rng.int(4) === 0) m |= (1 << o);
    opMask[c] = m >>> 0;
  }
  for (let t = 0; t < T; t++) if (rng.int(2) === 0) deepMask[t >>> 5] |= (1 << (t & 31));
  const matrix = new EvalMatrix({
    name: 'synthetic', components: C, tasks: T, fit, right, size, opMask, nOps, deepMask,
    names: (c) => (plantedIds.includes(c) ? 'planted' : 'decoy') + c,
    meta: { seed, planted, decoys, decoyFit, decoyRight, blockSize: B },
  });
  return { matrix, optimum: fitnessOf(T, planted, T), plantedIds, blockSize: B };
}

// ---------------------------------------------------------------- the matrix engine
/**
 * MAP-Elites over libraries, scored by the matrix. The archive is typed arrays: a fitness per
 * cell, a length per cell, and a pool of lmax slots per cell. Four descriptor axes, each cut into
 * `bins`: library length, mean component size, the share of the op vocabulary the library uses,
 * and the share of its solved tasks that are deep tasks. Selection is a tournament of two among
 * filled cells; a child is one parent (or a one point crossover of two) with a geometric number of
 * edits: replace a slot, insert one, delete one, swap two. The library length is a gene: it grows
 * and shrinks with the search, bounded by lmax.
 *
 * PRUNE (on by default). A slot that claims no task changes nothing: every task it fits was
 * claimed before it, so removing it leaves the unclaimed set, and therefore every later slot's
 * claims, exactly as they were. The count is unchanged and the library is shorter, so a pruned
 * child is strictly fitter than the unpruned one and is what gets offered. The archive holds only
 * libraries whose every slot does work.
 *
 * DIRECTED (0.75 by default). A replace or an insert draws, with this probability, a component
 * that answers one of the parent's unsolved tasks, read off the matrix's per task index, instead
 * of a draw from the size prior. It is the matrix used as a proposal distribution: the proposal
 * is aimed, the verdict on it is the same exact walk. The rate was chosen in a probe on synthetic
 * seeds 0..15 and grid seeds a, b, c; bench/velocity.mjs grades the bar on synthetic seeds that
 * probe never saw, and prints the undirected engine (directed 0) on the same seeds beside it.
 */
export class MatrixElites {
  constructor(matrix, { seed = 'velocity', popSize = 64, lmax = 32, initLen = [1, 8], mutationRate = 1.5, crossoverRate = 0.15, bins = DEFAULT_BINS, carry = null, prune = true, directed = 0.75 } = {}) {
    if (!(lmax >= 1 && lmax <= LEN_CAP)) throw new Error('MatrixElites: lmax must be 1..' + LEN_CAP);
    this.m = matrix;
    this.seed = String(seed);
    this.rng = new RNG(this.seed + ':elites');
    this.popSize = Math.max(1, popSize | 0);
    this.lmax = lmax | 0;
    this.initLen = [Math.max(1, initLen[0] | 0), Math.min(this.lmax, Math.max(1, initLen[1] | 0))];
    this.mutationRate = Math.max(1, mutationRate);
    this.crossoverRate = crossoverRate;
    this.bins = bins;
    this.capacity = bins ** 4;
    this.fit = new Float64Array(this.capacity).fill(-Infinity);
    this.cnt = new Int32Array(this.capacity);
    this.len = new Int32Array(this.capacity);
    this.pool = new Int32Array(this.capacity * this.lmax);
    this.filled = new Int32Array(this.capacity);
    this.nFilled = 0;
    this.bestCell = -1;
    this.bestFit = -Infinity;
    this.generation = 0;
    this.evals = 0;
    this.child = new Int32Array(this.lmax);
    this.other = new Int32Array(this.lmax);
    this.words = new Uint32Array(matrix.W);
    this.claims = new Uint8Array(this.lmax);
    this.prune = !!prune;
    this.pruned = 0;
    this.carry = carry ? carry.map((g) => Int32Array.from(g).slice(0, this.lmax)) : [];
    // THE DIRECTED DRAW. The matrix says which tasks a parent leaves unsolved and which
    // components answer each task, so with probability `directed` a replace or an insert draws
    // a component that answers one of the parent's unsolved tasks (among the tasks some
    // component answers) instead of one from the size prior. Scoring is untouched: a directed
    // child is scored by the same exact walk as any other, so this changes what is PROPOSED,
    // never what a proposal is worth. At directed = 0 no extra random number is drawn, and the
    // engine is, draw for draw, the undirected one.
    this.directed = Math.max(0, Math.min(1, Number(directed) || 0));
    this.solvedPool = new Uint32Array(this.capacity * matrix.W);
    this.parentCell = -1;
    this.directedDraws = 0;
    if (this.directed > 0) {
      const ix = matrix.rightIndex();
      this.rOff = ix.offsets; this.rComp = ix.components; this.answerable = ix.answerable;
    }
  }

  /** A component that answers a task the current parent leaves unsolved; the prior when none. */
  drawDirected() {
    const a = this.parentCell;
    if (a < 0) return this.drawComponent();
    const W = this.m.W, base = a * W;
    let open = 0;
    for (let w = 0; w < W; w++) open += popcnt((this.answerable[w] & ~this.solvedPool[base + w]) >>> 0);
    if (open === 0) return this.drawComponent();
    let k = this.rng.int(open);
    for (let w = 0; w < W; w++) {
      let x = (this.answerable[w] & ~this.solvedPool[base + w]) >>> 0;
      const n = popcnt(x);
      if (k >= n) { k -= n; continue; }
      while (x) {
        const b = 31 - Math.clz32(x);
        if (k === 0) {
          const t = w * 32 + b, lo = this.rOff[t], hi = this.rOff[t + 1];
          this.directedDraws++;
          return this.rComp[lo + this.rng.int(hi - lo)];
        }
        k--;
        x = (x & ~(1 << b)) >>> 0;
      }
    }
    return this.drawComponent();
  }

  /** The draw a replace or an insert uses. */
  draw() { return this.directed > 0 && this.rng.next() < this.directed ? this.drawDirected() : this.drawComponent(); }

  drawComponent() {
    const gs = this.m.groups;
    const g = gs[this.rng.int(gs.length)];
    return g[this.rng.int(g.length)];
  }

  randomInto(buf) {
    const [lo, hi] = this.initLen;
    const n = lo + this.rng.int(hi - lo + 1);
    for (let i = 0; i < n; i++) buf[i] = this.drawComponent();
    return n;
  }

  select() {
    const a = this.filled[this.rng.int(this.nFilled)], b = this.filled[this.rng.int(this.nFilled)];
    return this.fit[a] >= this.fit[b] ? a : b;
  }

  mutateInPlace(buf, n) {
    let edits = 1;
    const p = 1 - 1 / this.mutationRate;   // geometric number of edits with mean mutationRate
    while (edits < 8 && this.rng.next() < p) edits++;
    for (let e = 0; e < edits; e++) {
      const r = this.rng.next();
      if (r < 0.45) {
        buf[this.rng.int(n)] = this.draw();
      } else if (r < 0.7) {
        if (n >= this.lmax) { buf[this.rng.int(n)] = this.draw(); continue; }
        const at = this.rng.int(n + 1);
        for (let i = n; i > at; i--) buf[i] = buf[i - 1];
        buf[at] = this.draw();
        n++;
      } else if (r < 0.85) {
        if (n <= 1) continue;
        const at = this.rng.int(n);
        for (let i = at; i < n - 1; i++) buf[i] = buf[i + 1];
        n--;
      } else {
        if (n < 2) continue;
        const i = this.rng.int(n), j = this.rng.int(n);
        const x = buf[i]; buf[i] = buf[j]; buf[j] = x;
      }
    }
    return n;
  }

  makeChild() {
    const buf = this.child, L = this.lmax;
    this.parentCell = -1;
    if (this.nFilled === 0) return this.randomInto(buf);
    const a = this.select();
    this.parentCell = a;
    let n = this.len[a];
    buf.set(this.pool.subarray(a * L, a * L + n));
    if (this.nFilled > 1 && this.rng.next() < this.crossoverRate) {
      const b = this.select();
      const nb = this.len[b];
      const ca = this.rng.int(n + 1), cb = this.rng.int(nb + 1);
      let k = ca;
      for (let i = cb; i < nb && k < L; i++) buf[k++] = this.pool[b * L + i];
      n = k;
      if (n === 0) { buf[0] = this.drawComponent(); n = 1; }
    }
    return this.mutateInPlace(buf, n);
  }

  binOf(buf, n, count, words) {
    const m = this.m, B = this.bins;
    let sumSize = 0, ops = 0;
    for (let i = 0; i < n; i++) { const c = buf[i]; sumSize += m.size[c]; ops |= m.opMask[c]; }
    let deep = 0;
    for (let w = 0; w < m.W; w++) deep += popcnt(words[w] & m.deepMask[w]);
    const clampB = (v) => (v < 0 ? 0 : v >= B ? B - 1 : v);
    const a0 = clampB(Math.floor(((n - 1) * B) / this.lmax));
    const a1 = clampB(m.maxSize ? Math.floor((sumSize / n / m.maxSize) * B) : 0);
    const a2 = clampB(m.nOps ? Math.floor((popcnt(ops >>> 0) / m.nOps) * B) : 0);
    const a3 = clampB(count ? Math.floor((deep / count) * B) : 0);
    return ((a0 * B + a1) * B + a2) * B + a3;
  }

  offer(buf, n) {
    const count = this.m.scoreAt(buf, 0, n, this.words, this.prune ? this.claims : null);
    this.evals++;
    if (this.prune) {
      let k = 0;
      for (let i = 0; i < n; i++) if (this.claims[i]) buf[k++] = buf[i];
      if (k === 0) k = 1;          // a library that claims nothing keeps one slot, and still scores 0
      this.pruned += n - k;
      n = k;
    }
    const f = this.m.objective(count, n);
    const cell = this.binOf(buf, n, count, this.words);
    const held = this.fit[cell];
    if (held === -Infinity) this.filled[this.nFilled++] = cell;
    else if (!(f > held)) return false;
    this.fit[cell] = f;
    this.cnt[cell] = count;
    this.len[cell] = n;
    this.pool.set(buf.subarray(0, n), cell * this.lmax);
    this.solvedPool.set(this.words, cell * this.m.W);
    if (f > this.bestFit) { this.bestFit = f; this.bestCell = cell; }
    return true;
  }

  /** One generation: popSize children (generation zero: the carried genomes, then random ones). */
  step() {
    const t0 = process.hrtime.bigint();
    let placed = 0;
    const before = this.nFilled;
    if (this.generation === 0 && this.carry.length) {
      for (const g of this.carry) { this.child.set(g); if (this.offer(this.child, g.length)) placed++; }
    }
    for (let i = 0; i < this.popSize; i++) {
      const n = this.makeChild();
      if (this.offer(this.child, n)) placed++;
    }
    this.generation++;
    return {
      gen: this.generation, evals: this.evals, placed, fill: this.nFilled, newCells: this.nFilled - before,
      best: this.bestFit, bestCount: this.bestCell >= 0 ? this.cnt[this.bestCell] : 0,
      bestLen: this.bestCell >= 0 ? this.len[this.bestCell] : 0,
      ms: Number(process.hrtime.bigint() - t0) / 1e6,
    };
  }

  /** @returns {{ fitness, count, len, genome: number[] }|null} */
  best() {
    if (this.bestCell < 0) return null;
    const c = this.bestCell, L = this.lmax;
    return { fitness: this.fit[c], count: this.cnt[c], len: this.len[c], genome: Array.from(this.pool.subarray(c * L, c * L + this.len[c])) };
  }

  /** Every elite's genome, for a caller that wants to check or carry them. */
  elites(limit = Infinity) {
    const out = [];
    for (let i = 0; i < this.nFilled && out.length < limit; i++) {
      const c = this.filled[i], L = this.lmax;
      out.push({ cell: c, fitness: this.fit[c], count: this.cnt[c], genome: Array.from(this.pool.subarray(c * L, c * L + this.len[c])) });
    }
    return out;
  }

  fill() { return this.nFilled; }
}

// ---------------------------------------------------------------- the plateau ruler
/**
 * Fires when the best has not risen by more than `epsilon` over `patience` generations. An
 * improvement is measured against the best at the LAST improvement, not against the previous
 * generation: steps each smaller than epsilon count once they add up to more than epsilon (slow
 * progress is progress), and movement that never adds up to epsilon never resets the clock.
 *
 * With `factor` above zero the patience is ADAPTIVE: the ruler waits the larger of `patience`
 * and `factor` times the longest gap it has seen between two improvements. A search whose
 * improvements come further and further apart (the last planted component of a library is the
 * rarest draw of all) is then not declared finished in the middle of one of its own gaps.
 */
export class PlateauRuler {
  constructor({ epsilon = 1e-9, patience = 50, factor = 0 } = {}) {
    if (!(patience >= 1)) throw new Error('PlateauRuler: patience must be at least 1');
    this.epsilon = epsilon;
    this.patience = patience;
    this.factor = factor;
    this.ref = -Infinity;
    this.lastImprovementGen = null;
    this.maxGap = 0;
    this.firedAt = null;
    this.observed = 0;
  }

  /** The number of flat generations the ruler waits for right now. */
  get effectivePatience() { return Math.max(this.patience, Math.ceil(this.factor * this.maxGap)); }

  /** @param {number} gen @param {number} best @returns {{ improved: boolean, fired: boolean }} */
  observe(gen, best) {
    this.observed++;
    let improved = false;
    if (this.lastImprovementGen === null || best > this.ref + this.epsilon) {
      if (this.lastImprovementGen !== null && gen - this.lastImprovementGen > this.maxGap) this.maxGap = gen - this.lastImprovementGen;
      this.ref = best; this.lastImprovementGen = gen; improved = true;
    }
    const fired = this.firedAt === null && gen - this.lastImprovementGen >= this.effectivePatience;
    if (fired) this.firedAt = gen;
    return { improved, fired };
  }

  get fired() { return this.firedAt !== null; }
}

/**
 * The declared arithmetic that turns evaluations into organism-years. Never a measurement.
 * @param {number} evals @param {number} ticksPerEval @param {number} secondsPerTick
 */
export function declaredYears(evals, ticksPerEval, secondsPerTick = DEFAULT_SECONDS_PER_TICK) {
  const ticks = evals * ticksPerEval;
  const organismSeconds = ticks * secondsPerTick;
  const years = organismSeconds / SECONDS_PER_YEAR;
  return {
    evals, ticksPerEval, secondsPerTick, ticks, organismSeconds, years, measured: false,
    arithmetic: evals + ' evaluations x ' + Number(ticksPerEval.toFixed(3)) + ' ticks each (measured on the tick path) x ' +
      secondsPerTick + ' s/tick (declared) / ' + SECONDS_PER_YEAR + ' s/year = ' + years.toExponential(6) + ' organism-years (declared arithmetic, not a measurement)',
  };
}

/**
 * Run an engine until the ruler fires, the generation cap is reached, or the wall budget ends.
 * @param {{ step: () => object, fill: () => number, capacity?: number, evals?: number }} engine
 * @param {object} [opts] { epsilon, patience, maxGenerations, maxMs, ticksPerEval, secondsPerTick, onGeneration }
 * @returns {object} the plane report
 */
export function runToPlateau(engine, { epsilon = 1e-9, patience = 50, factor = 0, maxGenerations = 1e9, maxMs = 0, ticksPerEval = 0, secondsPerTick = DEFAULT_SECONDS_PER_TICK, onGeneration = null } = {}) {
  const ruler = new PlateauRuler({ epsilon, patience, factor });
  const t0 = process.hrtime.bigint();
  const wall = () => Number(process.hrtime.bigint() - t0) / 1e6;
  let row = null, reason = 'generations';
  let landing = { gen: 0, wallMs: 0, evals: 0, best: -Infinity, count: 0, fill: 0 };
  while (true) {
    row = engine.step();
    const w = wall();
    const r = ruler.observe(row.gen, row.best);
    if (r.improved) landing = { gen: row.gen, wallMs: w, evals: row.evals, best: row.best, count: row.bestCount ?? null, fill: row.fill };
    if (onGeneration) onGeneration(row, r);
    if (r.fired) { reason = 'plateau'; break; }
    if (row.gen >= maxGenerations) { reason = 'generations'; break; }
    if (maxMs && w >= maxMs) { reason = 'wall'; break; }
  }
  const wallMs = wall();
  return {
    fired: ruler.fired, reason, epsilon, patience, factor, effectivePatience: ruler.effectivePatience, longestGap: ruler.maxGap,
    generationsToPlateau: landing.gen, wallToPlateauMs: landing.wallMs, evalsToPlateau: landing.evals,
    firedAtGeneration: ruler.firedAt, wallToFireMs: wallMs, generations: row.gen,
    evals: row.evals, evalsPerSecond: wallMs > 0 ? row.evals / (wallMs / 1000) : 0,
    best: row.best, bestCount: row.bestCount ?? null, bestLen: row.bestLen ?? null,
    fill: row.fill, capacity: engine.capacity ?? null,
    years: declaredYears(row.evals, ticksPerEval, secondsPerTick),
  };
}

// ---------------------------------------------------------------- planes of the matrix engine
const POP_LADDER = Object.freeze([32, 64, 128, 256]);
const LMAX_LADDER = Object.freeze([32, 48, 64, 96]);
const RATE_LADDER = Object.freeze([1, 1.5, 2, 3]);
const CROSS_LADDER = Object.freeze([0, 0.1, 0.2, 0.3]);
const DIRECTED_LADDER = Object.freeze([0.25, 0.5, 0.75, 0.9]);

/**
 * The coordinate of matrix plane `index` of the sweep `base`. A pure function of the two.
 * @returns {{ index, seed, popSize, lmax, mutationRate, crossoverRate, prune, directed }}
 */
export function matrixPlaneCoordinate(index, { base = 'velocity' } = {}) {
  const h = hash32(base + '#' + index);
  return {
    index, seed: base + ':' + index,
    popSize: POP_LADDER[h & 3], lmax: LMAX_LADDER[(h >>> 2) & 3],
    mutationRate: RATE_LADDER[(h >>> 4) & 3], crossoverRate: CROSS_LADDER[(h >>> 6) & 3],
    prune: ((h >>> 8) & 3) !== 0,
    directed: DIRECTED_LADDER[(h >>> 10) & 3],
  };
}

/**
 * INFINITE MODE. Plane after plane, each run to its plateau, until the ruler has fired on every
 * coordinate of a finite list (`planes`) or the wall budget ends. With `carry` on, each plane's
 * generation zero holds the best library found so far, so the search iterates past a plateau
 * rather than starting again from nothing.
 *
 * @param {EvalMatrix} matrix
 * @param {object} [opts] { base, planes (Infinity for no end), wallMs, epsilon, patience, maxGenerations, carry, ticksPerEval, secondsPerTick, onPlane }
 * @returns {object} { stopReason, planesRun, planesFired, allFired, wallMs, evals, evalsPerSecond, best, rows, trajectory, years }
 */
export function infinite(matrix, { base = 'velocity', planes = Infinity, wallMs = 10_000, epsilon = 1e-9, patience = 50, factor = 0, maxGenerations = 1e9, carry = true, ticksPerEval = 0, secondsPerTick = DEFAULT_SECONDS_PER_TICK, onPlane = null } = {}) {
  if (!(wallMs > 0) && !Number.isFinite(planes)) throw new Error('infinite: with no plane limit a wall budget is required');
  const t0 = process.hrtime.bigint();
  const wall = () => Number(process.hrtime.bigint() - t0) / 1e6;
  const rows = [], trajectory = [];
  let best = null, evals = 0, stopReason = 'planes', i = 0;
  while (i < planes) {
    const left = wallMs > 0 ? wallMs - wall() : Infinity;
    if (left <= 0) { stopReason = 'wall'; break; }
    const coord = matrixPlaneCoordinate(i, { base });
    const engine = new MatrixElites(matrix, { ...coord, carry: carry && best ? [best.genome] : null });
    const rep = runToPlateau(engine, { epsilon, patience, factor, maxGenerations, maxMs: Number.isFinite(left) ? left : 0, ticksPerEval, secondsPerTick });
    evals += rep.evals;
    const b = engine.best();
    if (b && (!best || b.fitness > best.fitness)) best = { ...b, plane: i };
    const { years: _planeYears, ...planeRep } = rep;
    const row = { plane: i, coordinate: coord, ...planeRep, globalBest: best ? best.fitness : null, globalBestCount: best ? best.count : null, atWallMs: wall() };
    rows.push(row);
    trajectory.push([Number(row.atWallMs.toFixed(1)), best ? best.count : 0]);
    if (onPlane) onPlane(row);
    i++;
    if (!rep.fired) { stopReason = rep.reason === 'wall' ? 'wall' : rep.reason; break; }
  }
  const ms = wall();
  const fired = rows.filter((r) => r.fired).length;
  return {
    stopReason, planesRun: rows.length, planesFired: fired,
    allFired: Number.isFinite(planes) && rows.length === planes && fired === planes,
    wallMs: ms, evals, evalsPerSecond: ms > 0 ? evals / (ms / 1000) : 0,
    best, rows, trajectory,
    years: declaredYears(evals, ticksPerEval, secondsPerTick),
  };
}

// ---------------------------------------------------------------- a real organism plane
const PLATEAU_STOP = Symbol('velocity.plateau');

/**
 * The same ruler on a real organism plane of generations/planes.mjs, through the seam that file
 * already exposes: runPlaneAsync awaits a hook between generations, the ruler reads the best the
 * plane yields, and when it fires the hook throws a private sentinel that ends the plane. Nothing
 * in planes.mjs or epochs.mjs is edited; the plane's arithmetic is the plane's own.
 *
 * The plane's tick budget is lifted (the ruler and the wall budget decide), and its years are its
 * own declaration: ticks run x the coordinate's seconds per tick / SECONDS_PER_YEAR.
 * @param {object} coord a plane coordinate from planes.mjs planeCoordinate
 * @param {object} [opts] { epsilon, patience, maxMs, maxGenerations, betweenGenerations }
 * @returns {Promise<object>} the plane report
 */
export async function plateauOrganismPlane(coord, { epsilon = 1e-3, patience = 6, maxMs = 60_000, maxGenerations = 100_000, betweenGenerations = null } = {}) {
  const { runPlaneAsync } = await import('./planes.mjs');
  const ruler = new PlateauRuler({ epsilon, patience });
  const t0 = process.hrtime.bigint();
  const wall = () => Number(process.hrtime.bigint() - t0) / 1e6;
  let last = null, landing = null, row = null;
  try {
    row = await runPlaneAsync(coord, {
      ticks: Number.MAX_SAFE_INTEGER, maxGenerations, maxMs,
      betweenGenerations: async (info) => {
        last = { ...info, wallMs: wall() };
        const r = ruler.observe(info.gen, info.best);
        if (r.improved) landing = last;
        if (r.fired) throw PLATEAU_STOP;
        if (betweenGenerations) await betweenGenerations(info);
      },
    });
  } catch (e) {
    if (e !== PLATEAU_STOP) throw e;
  }
  const wallMs = wall();
  const organisms = row ? row.organisms : last ? last.organisms : 0;
  const ticks = row ? row.ticks : last ? last.ticks : 0;
  const organismSeconds = ticks * coord.secondsPerTick;
  const years = organismSeconds / SECONDS_PER_YEAR;
  return {
    plane: coord.index ?? null, fired: ruler.fired, reason: ruler.fired ? 'plateau' : (row && row.error ? 'error' : 'wall'),
    epsilon, patience,
    generationsToPlateau: landing ? landing.gen : null, wallToPlateauMs: landing ? landing.wallMs : null,
    firedAtGeneration: ruler.firedAt, wallToFireMs: wallMs,
    generations: row ? row.generations : last ? last.gen : 0,
    evals: organisms, evalsPerSecond: wallMs > 0 ? organisms / (wallMs / 1000) : 0,
    best: row ? (row.best ? row.best.fitness : null) : last ? last.best : null,
    fill: row ? row.archiveFillAfter : last ? last.fill : 0,
    ticks, secondsPerTick: coord.secondsPerTick,
    years: {
      ticks, secondsPerTick: coord.secondsPerTick, organismSeconds, years, measured: false,
      arithmetic: ticks + ' ticks run x ' + coord.secondsPerTick + ' s/tick (the plane\'s declaration) / ' + SECONDS_PER_YEAR + ' s/year = ' + years.toExponential(6) + ' organism-years (declared arithmetic, not a measurement)',
    },
    error: row && row.error ? row.error : null,
  };
}

// ---------------------------------------------------------------- the audit, across threads
/** Threads the parallel audit uses when the caller names none: half the machine, at most 16. */
export function defaultAuditWorkers() {
  const n = os.availableParallelism ? os.availableParallelism() : os.cpus().length;
  return Math.max(1, Math.min(16, Math.floor(n / 2)));
}

/**
 * The full audit fanned out over worker threads. Each worker regenerates the suite from the
 * matrix's own seed and counts (so the audit also checks that generateGrids is the same function
 * in every thread), judges its share of the components in real cells, and posts the two planes
 * back; the comparison against the matrix happens here, in the thread that owns the matrix.
 * @param {EvalMatrix} matrix a grid matrix from buildGridMatrix
 * @param {object} [opts] { workers, batch }
 * @returns {Promise<{ components, cells, fitMismatches, rightMismatches, first, ms, ticks, workers }>}
 */
export async function auditGridMatrixParallel(matrix, { workers = defaultAuditWorkers(), batch = 64 } = {}) {
  const { seed, counts, maxDepth } = matrix.meta;
  if (seed === undefined || maxDepth === undefined) throw new Error('auditGridMatrixParallel: needs a grid matrix built from a seed');
  const t0 = process.hrtime.bigint();
  const n = Math.max(1, Math.min(workers, matrix.C));
  const shards = Array.from({ length: n }, () => []);
  for (let c = 0; c < matrix.C; c++) shards[c % n].push(c);
  const runs = shards.map((components) => new Promise((resolve, reject) => {
    const w = new Worker(new URL(import.meta.url), { workerData: { velocityAudit: { seed, counts, maxDepth, components, batch } } });
    let got = null;
    w.once('message', (m) => { got = m; });
    w.once('error', reject);
    w.once('exit', (code) => (got ? resolve(got) : reject(new Error('audit worker exited ' + code + ' without a result'))));
  }));
  const results = await Promise.all(runs);
  const W = matrix.W;
  let fitMismatches = 0, rightMismatches = 0, first = null, ticks = 0, components = 0;
  for (const part of results) {
    for (const b of part) {
      ticks += b.ticks;
      for (let j = 0; j < b.components.length; j++) {
        const c = b.components[j];
        components++;
        for (let w = 0; w < W; w++) {
          const df = (b.fit[j * W + w] ^ matrix.fit[c * W + w]) >>> 0;
          const dr = (b.right[j * W + w] ^ matrix.right[c * W + w]) >>> 0;
          if (df) fitMismatches += popcnt(df);
          if (dr) rightMismatches += popcnt(dr);
          if ((df || dr) && !first) {
            const bit = 31 - Math.clz32(df || dr);
            first = { component: c, name: matrix.describe(c), task: w * 32 + bit, matrix: matrix.cell(c, w * 32 + bit) };
          }
        }
      }
    }
  }
  return { components, cells: components * matrix.T, fitMismatches, rightMismatches, first, ms: Number(process.hrtime.bigint() - t0) / 1e6, ticks, workers: n };
}

// A worker thread started by auditGridMatrixParallel loads this same file; this block is the
// whole of what it does. On the main thread, and in any worker started for another purpose, it
// does nothing.
if (!isMainThread && workerData && workerData.velocityAudit) {
  const { seed, counts, maxDepth, components, batch } = workerData.velocityAudit;
  const suite = { tasks: generateGrids({ seed, counts }), maxDepth };
  const out = [];
  for (let b = 0; b < components.length; b += batch) {
    const k = tickPath(components.slice(b, b + batch), suite, { all: true });
    out.push({ components: k.planes.components, fit: k.planes.fit, right: k.planes.right, ticks: k.ticks });
  }
  parentPort.postMessage(out);
}
