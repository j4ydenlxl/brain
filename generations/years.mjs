// generations/years.mjs: ORGANISM-YEARS, DECLARED ONCE, AND A CONTINUOUS RUN THAT EARNS THEM.
//
// His words, 2026-09-23: "It also needs to evolve over billions of years in a bunch of seconds",
// and the same day: "it isnt just some statistical flex. Its supposed to actually work to land it
// in the timeframe of peak efficiency and iterate that quickly". So this file holds three things
// and says which of them is a measurement.
//
//   1. THE DECLARATION (declared, never measured). One organism-year is ONE GENERATION OF THE
//      WHOLE POPULATION ON A PLANE: the popSize children a MatrixElites generation makes and
//      scores (popSize evaluations). Organism-years therefore EQUAL generations. The carried
//      elites a new arm re-scores at its first generation are evaluations, not years: they are
//      counted in the evaluations column and never in the years column. yearsArithmetic() is
//      the one place the conversion happens, and every count it returns carries its arithmetic
//      as a sentence beside it, so no headline is ever printed alone.
//
//      This is NOT the arithmetic of generations/velocity.mjs declaredYears(), which prices an
//      evaluation as the ticks the tick path measured x a declared seconds per tick. That older
//      declaration is left where it is; this file never mixes the two.
//
//   2. THE CONTINUOUS RUN (measured). yearsRun() runs the matrix path of velocity.mjs (the
//      multi-draw objective of Board 10: the mean over K draws, stackDraws) for a fixed wall
//      budget. It records, at a fixed cadence, generations, evaluations, the searched score of
//      the archive's best and that same library's score on FRESH draws the loop never searched
//      and never reads for any decision. The start and end scores it reports are the FRESH
//      scores of the searched best, never the searched suite's.
//
//   3. THE PLATEAU AND WHAT THE LOOP DOES THERE (measured). RatePlateau fires at the first wall
//      second at which the searched score's improvement per second, over a trailing window,
//      falls under a declared floor. At that second the loop GROWS, on the matrix path:
//        widen   the library cap binds (the best is within lmaxSlack slots of lmax): lmax grows
//        ingest  the next draw of the task source joins the searched stack; past windowDraws
//                the oldest draw is retired, so the loop keeps meeting new data at a fixed cost
//                per evaluation (a sliding window of draws), or with windowDraws Infinity the
//                stack only grows
//        spawn   the source has no next draw, or the prefetch worker is still building it (the
//                loop never waits on a draw it can prefetch): a new arm with a new seed. A
//                worker that reported a failure, or has not answered within prefetchStallMs,
//                is written off for the run (result.prefetch.down) and the loop builds each
//                later draw itself, so a dead worker can never turn every ingest into a spawn
//      Every growth starts a new arm (a new MatrixElites) carrying every elite of the old one.
//      With growth off the loop prints "plateau: no growth hook" and runs on.
//
// The fresh score is held out by construction: yearsRun reads it only to write a row. The
// plateau, the growth choice and the arm seeds are functions of the searched score, the wall
// clock and the library length alone.
import { Worker, MessageChannel, receiveMessageOnPort, isMainThread, workerData } from 'node:worker_threads';
import { G } from '../cells/grid.mjs';
import {
  EvalMatrix, MatrixElites, buildGridMatrix, drawSeeds, stackDraws, syntheticMatrix, LEN_CAP,
} from './velocity.mjs';

// ---------------------------------------------------------------- 1. the declaration
export const YEAR = Object.freeze({
  unit: 'organism-year',
  declaration: 'one organism-year is one generation of the whole population on a plane, so organism-years equal generations',
  measured: false,
});
export const BILLION = 1e9;

const fmtInt = (x) => Math.round(x).toLocaleString('en-US');
const fmt = (x, d = 1) => Number(x).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

/**
 * The declared arithmetic: generations to organism-years. Pure. The count is returned with the
 * sentence that produced it; a caller prints `arithmetic` beside any count it prints.
 * @param {object} p { generations, popSize, evals, carried, wallMs }
 * @returns {object}
 */
export function yearsArithmetic({ generations, popSize, evals = null, carried = 0, wallMs = null }) {
  if (!(Number.isInteger(generations) && generations >= 0)) throw new Error('yearsArithmetic: generations must be a whole number');
  if (!(Number.isInteger(popSize) && popSize >= 1)) throw new Error('yearsArithmetic: popSize must be a whole number of at least 1');
  const organismYears = generations * 1;
  const gps = wallMs > 0 ? generations / (wallMs / 1000) : null;
  const eps = wallMs > 0 && evals !== null ? evals / (wallMs / 1000) : null;
  return {
    declaration: YEAR.declaration, measured: false,
    popSize, evaluationsPerGeneration: popSize, generations, organismYears, evals, carried, wallMs,
    generationsPerSecond: gps, evalsPerSecond: eps,
    arithmetic: fmtInt(generations) + ' generations x 1 organism-year per generation (declared: one generation = the whole population of ' +
      popSize + ' children = ' + popSize + ' evaluations' + (carried ? '; the ' + fmtInt(carried) + ' carried elites re-scored at arm starts are evaluations, not years' : '') +
      ') = ' + fmtInt(organismYears) + ' organism-years' + (evals !== null ? ' (' + fmtInt(evals) + ' evaluations)' : ''),
  };
}

/**
 * Seconds to `targetYears` organism-years at the generation rate a run MEASURED. A projection,
 * and it says so in its own text: the rate is measured, the extrapolation is not.
 * @param {object} p { targetYears, generations, wallMs }
 */
export function projectSeconds({ targetYears = BILLION, generations, wallMs }) {
  if (!(wallMs > 0) || !(generations > 0)) throw new Error('projectSeconds: needs a measured run (generations > 0, wallMs > 0)');
  const gps = generations / (wallMs / 1000);
  const seconds = targetYears / gps;
  return {
    projection: true, targetYears, generations, wallMs, generationsPerSecond: gps, seconds, hours: seconds / 3600, days: seconds / 86400,
    arithmetic: 'projection: ' + fmtInt(targetYears) + ' organism-years / ' + fmt(gps, 1) + ' generations per wall second (measured: ' +
      fmtInt(generations) + ' generations in ' + fmt(wallMs / 1000, 3) + ' s) = ' + fmtInt(seconds) + ' s (' + fmt(seconds / 3600, 1) + ' h), a projection, not a measurement',
  };
}

// ---------------------------------------------------------------- 3. the plateau signal
/**
 * Improvement per wall second over a trailing window, against a declared floor. The score at
 * time t is compared with the score of the latest sample at or before t - windowMs; the rate is
 * their difference over the seconds between them. Nothing is judged until one window has passed
 * since the arm started. It fires once per arm, at the first sample whose rate is under the floor.
 */
export class RatePlateau {
  constructor({ windowMs = 2000, floor = 0.1 } = {}) {
    if (!(windowMs > 0)) throw new Error('RatePlateau: windowMs must be above 0');
    if (!Number.isFinite(floor)) throw new Error('RatePlateau: floor must be a number');
    this.windowMs = windowMs; this.floor = floor;
    this.arm(0, null);
  }

  /** Start a new arm at tMs (the score it starts from is optional). */
  arm(tMs, score = null) {
    this.armMs = tMs; this.samples = []; this.fired = false; this.firedAt = null; this.lastRate = null;
    if (score !== null && Number.isFinite(score)) this.samples.push([tMs, score]);
  }

  /** @param {number} tMs @param {number} score @returns {{ rate: number|null, fired: boolean }} */
  observe(tMs, score) {
    this.samples.push([tMs, score]);
    if (tMs - this.armMs < this.windowMs) return { rate: null, fired: false };
    const cut = tMs - this.windowMs;
    while (this.samples.length > 1 && this.samples[1][0] <= cut) this.samples.shift();
    const [t0, s0] = this.samples[0];
    if (!(t0 <= cut) || tMs <= t0) return { rate: null, fired: false };
    const rate = (score - s0) / ((tMs - t0) / 1000);
    this.lastRate = rate;
    const fired = !this.fired && rate < this.floor;
    if (fired) { this.fired = true; this.firedAt = tMs; }
    return { rate, fired };
  }
}

/**
 * The plateau of a recorded series, by the same rule. Pure.
 * @param {Array<[number, number]>} series [tMs, score] in time order
 * @param {object} [opts] { windowMs, floor }
 * @returns {{ atMs: number, rate: number }|null}
 */
export function detectPlateau(series, { windowMs = 2000, floor = 0.1 } = {}) {
  if (!series.length) return null;
  const p = new RatePlateau({ windowMs, floor });
  p.arm(series[0][0], series[0][1]);
  for (let i = 1; i < series.length; i++) {
    const r = p.observe(series[i][0], series[i][1]);
    if (r.fired) return { atMs: series[i][0], rate: r.rate };
  }
  return null;
}

// ---------------------------------------------------------------- task sources
/**
 * The columns `idx` of a one draw matrix, as a matrix of its own over the same components.
 * @param {EvalMatrix} m @param {ArrayLike<number>} idx @param {string} name
 */
export function selectTasks(m, idx, name = m.name + ':cols') {
  const T = idx.length, W = Math.ceil(T / 32), C = m.C, mw = m.W;
  const fit = new Uint32Array(C * W), right = new Uint32Array(C * W), deepMask = new Uint32Array(W);
  for (let j = 0; j < T; j++) {
    const t = idx[j], sw = t >>> 5, sb = 1 << (t & 31), dw = j >>> 5, db = 1 << (j & 31);
    if (m.deepMask[sw] & sb) deepMask[dw] |= db;
    for (let c = 0; c < C; c++) {
      if (m.fit[c * mw + sw] & sb) fit[c * W + dw] |= db;
      if (m.right[c * mw + sw] & sb) right[c * W + dw] |= db;
    }
  }
  return new EvalMatrix({ name, components: C, tasks: T, fit, right, size: m.size, opMask: m.opMask, nOps: m.nOps, deepMask, names: m.names, meta: { ...m.meta, selected: T } });
}

const taskKey = (t) => [...t.demos.flatMap((d) => [d.input, d.output]), t.test.input, t.test.output].map(G.key).join('/');

/**
 * The grid suite of tasks/grid.mjs as an unbounded stream of draws: draw k has the seed
 * drawSeeds(seed, k + 1)[k] (draw 0 IS the seed, as in Board 10), each one precomputed by
 * buildGridMatrix when the loop ingests it. The fresh draws are seeds the stream never reaches.
 * @param {object} [opts] { seed, maxDepth, counts, freshSeeds }
 */
export function gridSource({ seed = 'grid/velocity', maxDepth = 3, counts = undefined, freshSeeds = null } = {}) {
  const fresh = freshSeeds || [seed + ':heldout'];
  for (const s of fresh) {
    if (s === seed || new RegExp('^' + seed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':draw\\d+$').test(s)) throw new Error('gridSource: fresh seed ' + s + ' is a draw of the searched stream');
  }
  const keys = new Set();
  const opt = counts ? { counts } : {};
  return {
    kind: 'grid', seed, maxDepth, counts: counts || null, maxDraws: Infinity, freshSeeds: fresh, keys,
    seedOf: (k) => drawSeeds(seed, k + 1)[k],
    draw(k) {
      const s = this.seedOf(k);
      const t0 = process.hrtime.bigint();
      const b = buildGridMatrix({ seed: s, maxDepth, ...opt });
      for (const t of b.tasks) keys.add(taskKey(t));
      return { k, seed: s, matrix: b.matrix, ms: Number(process.hrtime.bigint() - t0) / 1e6 };
    },
    /** A draw built elsewhere (the prefetch worker): the planes it posted, as a matrix. */
    adopt(k, posted) {
      const like = posted;
      const m = new EvalMatrix({ name: 'grid', components: like.C, tasks: like.T, fit: like.fit, right: like.right, size: like.size, opMask: like.opMask, nOps: like.nOps, deepMask: like.deepMask, meta: { seed: like.seed, maxDepth } });
      for (const k2 of like.keys) keys.add(k2);
      return { k, seed: like.seed, matrix: m, ms: like.ms, prefetched: true };
    },
    fresh() {
      return fresh.map((s) => { const b = buildGridMatrix({ seed: s, maxDepth, ...opt }); return { name: s, matrix: b.matrix, tasks: b.tasks }; });
    },
    /** How many of `tasks` appear verbatim in a draw this source has handed out. */
    seenVerbatim(tasks) { return tasks.filter((t) => keys.has(taskKey(t))).length; },
  };
}

/**
 * The synthetic landscape of velocity.mjs (planted components, decoys, a known optimum) cut into
 * slices: one syntheticMatrix of (draws + freshSlices) x tasksPerDraw tasks, each planted block
 * split into equal slices, and slice k of every block is draw k. The last freshSlices slices are
 * the fresh draws. Every slice is the Board 8 landscape in distribution: blocks of blockPerDraw,
 * decoys that fit decoyFit and answer decoyRight tasks per slice on average.
 * @param {object} [opts] { seed, draws, freshSlices, planted, blockPerDraw, decoys, decoyFit, decoyRight }
 */
export function syntheticSource({ seed = 'years/synthetic', draws = 64, freshSlices = 1, planted = 8, blockPerDraw = 32, decoys = 504, decoyFit = 24, decoyRight = 6 } = {}) {
  const S = draws + freshSlices;
  const B = blockPerDraw * S;
  const syn = syntheticMatrix({ seed, tasks: planted * B, planted, decoys, decoyFit: decoyFit * S, decoyRight: decoyRight * S });
  const slice = (s) => {
    const idx = [];
    for (let p = 0; p < planted; p++) for (let j = 0; j < blockPerDraw; j++) idx.push(p * B + s * blockPerDraw + j);
    return idx;
  };
  return {
    kind: 'synthetic', seed, maxDraws: draws, freshSlices, planted, optimumCount: planted * blockPerDraw, plantedIds: syn.plantedIds, whole: syn.matrix,
    seedOf: (k) => seed + ':slice' + k,
    draw(k) {
      if (!(k >= 0 && k < draws)) throw new Error('syntheticSource: draw ' + k + ' is past the ' + draws + ' searched slices');
      const t0 = process.hrtime.bigint();
      const m = selectTasks(syn.matrix, slice(k), 'synthetic:slice' + k);
      return { k, seed: this.seedOf(k), matrix: m, ms: Number(process.hrtime.bigint() - t0) / 1e6 };
    },
    fresh() {
      const out = [];
      for (let f = 0; f < freshSlices; f++) out.push({ name: seed + ':fresh' + f, matrix: selectTasks(syn.matrix, slice(draws + f), 'synthetic:fresh' + f), tasks: null });
      return out;
    },
    seenVerbatim() { return 0; },
  };
}

// ---------------------------------------------------------------- the prefetch worker
// A grid draw costs about a second and a half of precompute. With `prefetch` on, one worker
// thread builds the NEXT draw while the search runs, so an ingest at a plateau adopts a matrix
// that is already built. The worker posts planes it allocated itself (their own buffers,
// transferred whole: no view onto a shared heap is ever posted).
const PREFETCH_URL = new URL(import.meta.url);

export class Prefetcher {
  // The search loop never yields to the event loop, so the worker answers on a MessageChannel
  // this thread polls synchronously (receiveMessageOnPort) when it needs a draw. For the same
  // reason a Worker 'error' or 'exit' event cannot reach the loop while it runs: the worker
  // catches its own failure and posts it on the polled port, drain() reads it into `error`, and
  // the loop stops waiting on a worker that has failed (yearsRun: prefetchDown). A worker that
  // dies without posting (killed, out of memory) is caught by the loop's stall clock instead.
  constructor(source) {
    this.source = source;
    const ch = new MessageChannel();
    this.port = ch.port1;
    this.error = null; this.closing = false; this.requested = 0; this.delivered = 0; this.failures = 0;
    this.worker = new Worker(PREFETCH_URL, { workerData: { yearsPrefetch: { seed: source.seed, maxDepth: source.maxDepth, counts: source.counts || null, port: ch.port2 } }, transferList: [ch.port2], resourceLimits: { maxOldGenerationSizeMb: 512 } });
    this.worker.on('error', (e) => { if (!this.error) this.error = e; });
    this.worker.on('exit', (code) => { if (!this.closing && !this.error) this.error = new Error('the prefetch worker exited with code ' + code); });
    this.pending = new Set();
    this.ready = new Map();
  }
  drain() {
    for (let m = receiveMessageOnPort(this.port); m; m = receiveMessageOnPort(this.port)) {
      const msg = m.message;
      this.pending.delete(msg.k);
      if (msg.error) { this.failures++; if (!this.error) this.error = new Error('draw ' + msg.k + ' (' + msg.seed + '): ' + msg.error); continue; }
      this.delivered++;
      this.ready.set(msg.k, msg);
    }
  }
  /** True once the worker has reported a failure (read by drain()) or ended on its own. */
  get failed() { this.drain(); return !!this.error; }
  want(k) { this.drain(); if (this.ready.has(k) || this.pending.has(k)) return; this.pending.add(k); this.requested++; this.port.postMessage({ k, seed: this.source.seedOf(k) }); }
  take(k) { this.drain(); const m = this.ready.get(k); if (m) this.ready.delete(k); return m || null; }
  async close() { this.closing = true; this.port.close(); await this.worker.terminate(); }
}

if (!isMainThread && workerData && workerData.yearsPrefetch) {
  const { maxDepth, counts, port } = workerData.yearsPrefetch;
  port.on('message', ({ k, seed }) => {
    let msg, transfer;
    try {
      const t0 = process.hrtime.bigint();
      const b = buildGridMatrix({ seed, maxDepth, ...(counts ? { counts } : {}) });
      const m = b.matrix;
      const keys = b.tasks.map(taskKey);
      msg = { k, seed, C: m.C, T: m.T, fit: m.fit, right: m.right, size: m.size, opMask: m.opMask, nOps: m.nOps, deepMask: m.deepMask, keys, ms: Number(process.hrtime.bigint() - t0) / 1e6 };
      transfer = [m.fit.buffer, m.right.buffer, m.size.buffer, m.opMask.buffer, m.deepMask.buffer];
    } catch (e) {
      msg = { k, seed, error: String((e && e.message) || e) }; transfer = [];
    }
    port.postMessage(msg, transfer);
  });
}

// ---------------------------------------------------------------- 2. the continuous run
/** The fresh counts of one library, one per fresh draw. */
export function freshScores(fresh, genome) { return fresh.map((f) => f.matrix.score(genome).count); }

export const RUN_DEFAULTS = Object.freeze({
  popSize: 64, lmax: 64, lmaxStep: 32, lmaxSlack: 2, directed: 0.75, mutationRate: 1.5, crossoverRate: 0.15, bins: 6,
  windowMs: 250, floor: 0.1, rowEveryMs: 100, windowDraws: 8, growth: true, prefetch: false,
  // a grid draw takes about 1.5 s; a worker that has not answered one in 20 s is treated as dead
  prefetchStallMs: 20000,
});

/**
 * THE CONTINUOUS RUN. Generations on the matrix path until `wallMs` of wall has passed; rows at a
 * fixed cadence; the rate plateau; growth at each plateau. Returns everything the bench prints.
 * The clock starts after draw 0 is built (setupMs, reported); an ingest inside the run is paid
 * inside the budget unless the prefetch worker built it already.
 * @param {object} source gridSource() or syntheticSource()
 * @param {object} [opts] RUN_DEFAULTS plus { wallMs, seed, fresh (built fresh draws), onRow, onPlateau, clock, makePrefetcher }
 *   clock: a function returning milliseconds (default the monotonic clock). The test hands it a
 *   counter, which makes a run deterministic, and shows the fresh draws change nothing it does.
 *   makePrefetcher: (source) => a Prefetcher (default new Prefetcher(source)); the test hands it
 *   one whose worker fails, or a stand-in that never answers.
 * @returns {Promise<object>}
 */
export async function yearsRun(source, opts = {}) {
  const o = { ...RUN_DEFAULTS, ...opts };
  const wallMs = Number(o.wallMs);
  if (!(wallMs > 0)) throw new Error('yearsRun: a wall budget (wallMs > 0) is required');
  const seed = String(o.seed || source.seed + ':years');
  const fresh = o.fresh || [];
  const hr = typeof o.clock === 'function' ? o.clock : () => Number(process.hrtime.bigint()) / 1e6;

  const s0 = hr();
  const parts = [source.draw(0)];
  const setupMs = hr() - s0;
  let nextDraw = 1;
  const prefetch = o.prefetch && source.kind === 'grid' ? (typeof o.makePrefetcher === 'function' ? o.makePrefetcher(source) : new Prefetcher(source)) : null;
  try {
    return await runLoop();
  } finally {
    // every path closes the worker: the run's return, a throw from the search, a throw from a draw
    if (prefetch) await prefetch.close();
  }

  async function runLoop() {
  let wantAt = null, prefetchDown = null;
  const ask = (k) => { if (prefetch && !prefetchDown) { prefetch.want(k); wantAt = hr(); } };
  ask(nextDraw);
  // Where the next draw stands: 'ready' (the worker built it), 'building' (asked, not late),
  // or 'off' (no worker, or it failed or stalled: the loop builds the draw itself from now on).
  const nextDrawState = () => {
    if (!prefetch || prefetchDown) return 'off';
    prefetch.drain();
    if (prefetch.ready.has(nextDraw)) return 'ready';
    if (prefetch.error) { prefetchDown = { reason: 'failed: ' + String(prefetch.error.message || prefetch.error), draw: nextDraw, atMs: el() }; return 'off'; }
    if (hr() - wantAt > o.prefetchStallMs) { prefetchDown = { reason: 'stalled: no answer for draw ' + nextDraw + ' in ' + Math.round(hr() - wantAt) + ' ms (the stall clock is ' + o.prefetchStallMs + ' ms)', draw: nextDraw, atMs: el() }; return 'off'; }
    return 'building';
  };

  let lmax = Math.min(LEN_CAP, o.lmax);
  let matrix = stackDraws(parts.map((p) => p.matrix), { name: source.kind + ':years' });
  let arm = 0;
  const engineOpts = { popSize: o.popSize, mutationRate: o.mutationRate, crossoverRate: o.crossoverRate, bins: o.bins, directed: o.directed };
  let engine = new MatrixElites(matrix, { ...engineOpts, seed: seed + ':arm0', lmax });
  const plateau = new RatePlateau({ windowMs: o.windowMs, floor: o.floor });

  let generations = 0, evalsDone = 0, carried = 0;
  const rows = [], plateaus = [], growthLog = [];
  const growth = { widen: 0, ingest: 0, spawn: 0, retired: 0, prefetched: 0, builtInLoop: 0, buildMsInLoop: 0, waited: 0 };
  let start = null, freshKey = null, freshNow = null, lastRowAt = -Infinity, firstJudgeableMs = null;

  const scoreOf = () => (engine.bestCell >= 0 ? engine.bestFit * matrix.tasksPerDraw : -Infinity);
  const makeRow = (t) => {
    const b = engine.best();
    const key = arm + ':' + engine.bestFit;
    if (key !== freshKey) { freshNow = b ? freshScores(fresh, b.genome) : fresh.map(() => 0); freshKey = key; }
    return {
      tMs: t, gen: generations, evals: evalsDone + engine.evals, arm, draws: parts.length, firstDraw: parts[0].k, lastDraw: parts[parts.length - 1].k, lmax,
      searched: b ? b.fitness * matrix.tasksPerDraw : null, searchedCount: b ? b.count / matrix.draws : null, len: b ? b.len : null,
      fresh: freshNow.slice(),
    };
  };

  const T0 = hr();
  const el = () => hr() - T0;
  let stopReason = 'wall';
  plateau.arm(0, null);
  while (true) {
    engine.step();
    generations++;
    const t = el();
    if (generations === 1) {
      const r = makeRow(t);
      start = r; rows.push(r); lastRowAt = t;
      plateau.arm(t, r.searched);
    } else if (t - lastRowAt >= o.rowEveryMs) {
      const r = makeRow(t);
      rows.push(r); lastRowAt = t;
      if (o.onRow) o.onRow(r);
      const p = plateau.observe(t, scoreOf());
      if (firstJudgeableMs === null && p.rate !== null) firstJudgeableMs = t;
      if (p.fired) {
        const b = engine.best();
        const at = { atMs: t, rate: p.rate, arm, gen: generations, draws: parts.length, lmax, len: b.len, searched: r.searched, fresh: r.fresh.slice(), action: null };
        if (!o.growth) {
          at.action = 'none';
          at.text = 'plateau: no growth hook';
          plateaus.push(at);
          if (o.onPlateau) o.onPlateau(at);
        } else {
          const g0 = hr();
          let kind;
          const detail = {};
          const widen = b.len >= lmax - o.lmaxSlack && lmax < LEN_CAP;
          const state = widen ? null : nextDraw < source.maxDraws ? nextDrawState() : 'none';
          if (widen) {
            kind = 'widen'; detail.from = lmax; lmax = Math.min(LEN_CAP, lmax + o.lmaxStep); detail.to = lmax;
          } else if (state === 'building') {
            // the next draw is still being built: the loop does not wait for it, it restarts
            kind = 'spawn'; detail.waitingFor = nextDraw; growth.waited++;
          } else if (state === 'ready' || state === 'off') {
            kind = 'ingest';
            let d = state === 'ready' ? prefetch.take(nextDraw) : null;
            if (d) { d = source.adopt(nextDraw, d); growth.prefetched++; } else { d = source.draw(nextDraw); growth.builtInLoop++; growth.buildMsInLoop += d.ms; }
            parts.push(d); detail.draw = d.k; detail.seed = d.seed; detail.prefetched = !!d.prefetched; detail.buildMs = d.ms;
            nextDraw++;
            ask(nextDraw);
            while (parts.length > o.windowDraws) { const gone = parts.shift(); growth.retired++; (detail.retired || (detail.retired = [])).push(gone.k); }
            matrix = stackDraws(parts.map((q) => q.matrix), { name: source.kind + ':years' });
          } else {
            kind = 'spawn';
          }
          growth[kind]++;
          const carry = engine.elites().map((e) => e.genome);
          evalsDone += engine.evals;
          carried += carry.length;
          arm++;
          engine = new MatrixElites(matrix, { ...engineOpts, seed: seed + ':arm' + arm, lmax, carry });
          at.action = kind; at.detail = detail; at.carried = carry.length; at.growthMs = hr() - g0;
          at.text = 'plateau: ' + kind + (kind === 'widen' ? ' lmax ' + detail.from + ' -> ' + detail.to : kind === 'ingest' ? ' draw ' + detail.draw + (detail.retired ? ', retired ' + detail.retired.join(',') : '') + (detail.prefetched ? ' (prefetched)' : ' (built in the loop, ' + detail.buildMs.toFixed(0) + ' ms)') : ' arm ' + arm + (detail.waitingFor !== undefined ? ' (draw ' + detail.waitingFor + ' still building)' : '')) + ', carried ' + carry.length + ' elites';
          plateaus.push(at); growthLog.push(at);
          if (o.onPlateau) o.onPlateau(at);
          plateau.arm(el(), null);
        }
      }
    }
    if (t >= wallMs) break;
  }
  const endT = el();
  evalsDone += engine.evals;
  const end = makeRow(endT);
  rows.push(end);
  // the worker is closed by yearsRun's finally, after this returns; its record is read here
  if (prefetch) prefetch.drain();
  const prefetchRecord = prefetch
    ? { on: true, requested: prefetch.requested, delivered: prefetch.delivered, failures: prefetch.failures, down: prefetchDown, error: prefetch.error ? String(prefetch.error.message || prefetch.error) : null, stallMs: o.prefetchStallMs }
    : { on: false };

  const years = yearsArithmetic({ generations, popSize: o.popSize, evals: evalsDone, carried, wallMs: endT });
  const projection = projectSeconds({ targetYears: BILLION, generations, wallMs: endT });
  const gained = fresh.map((_, i) => end.fresh[i] - start.fresh[i]);
  const perMillion = gained.map((g) => (years.organismYears > 0 ? g / (years.organismYears / 1e6) : null));
  const b = engine.best();
  return {
    source: { kind: source.kind, seed: source.seed, tasksPerDraw: matrix.tasksPerDraw, components: matrix.C },
    options: { popSize: o.popSize, lmax0: o.lmax, lmaxStep: o.lmaxStep, lmaxSlack: o.lmaxSlack, directed: o.directed, mutationRate: o.mutationRate, crossoverRate: o.crossoverRate, bins: o.bins, windowMs: o.windowMs, floor: o.floor, rowEveryMs: o.rowEveryMs, windowDraws: o.windowDraws, growth: o.growth, prefetch: !!prefetch, seed },
    wallBudgetMs: wallMs, wallMs: endT, overshootMs: endT - wallMs, setupMs, stopReason,
    generations, evals: evalsDone, carried, years, projection,
    fresh: fresh.map((f, i) => ({ name: f.name, tasks: f.matrix.T, start: start.fresh[i], end: end.fresh[i], gained: gained[i], perMillionYears: perMillion[i] })),
    start, end, plateaus, firstPlateauMs: plateaus.length ? plateaus[0].atMs : null,
    // the first sample the plateau rule could judge (one window after generation 1), and the
    // last row before the first plateau at which the searched score rose: the plateau second
    // can never be earlier than one window after that row, whatever the search does
    firstJudgeableMs, searchedLastRoseMs: searchedLastRose(rows, plateaus.length ? plateaus[0].atMs : null),
    freshTimelines: fresh.map((_, i) => freshTimeline(rows, i, endT)),
    growth, growthLog, prefetch: prefetchRecord, finalDraws: parts.map((p) => p.k), finalLmax: lmax, arms: arm + 1,
    best: b ? { len: b.len, searched: b.fitness * matrix.tasksPerDraw, genome: b.genome } : null,
    rows,
  };
  } // runLoop
}

/**
 * The tMs of the last row at or before `untilMs` whose searched score is above the row before it,
 * or null when it never rose after the first row (or there is no `untilMs`). Pure.
 * @param {Array<{tMs: number, searched: number|null}>} rows @param {number|null} untilMs
 */
export function searchedLastRose(rows, untilMs) {
  if (untilMs === null || untilMs === undefined) return null;
  let at = null;
  for (let i = 1; i < rows.length && rows[i].tMs <= untilMs; i++) if (rows[i].searched > rows[i - 1].searched) at = rows[i].tMs;
  return at;
}

/**
 * When the fresh score of fresh draw `i` stopped rising, read off the rows a run wrote. Pure.
 * high: the highest fresh score any row reached, and lastHighMs the first row that reached it
 * (after that second the fresh score never went higher); atHalfMs / atHalf: the last row at or
 * before half the wall; secondHalfGain: end minus atHalf (can be negative: the searched best can
 * change to a library that scores lower on the fresh draw).
 * @param {Array<{tMs: number, fresh: number[]}>} rows @param {number} i @param {number} wallMs
 */
export function freshTimeline(rows, i, wallMs) {
  if (!rows.length) return null;
  let high = -Infinity, lastHighMs = null, atHalf = rows[0].fresh[i], atHalfMs = rows[0].tMs;
  for (const r of rows) {
    const v = r.fresh[i];
    if (v > high) { high = v; lastHighMs = r.tMs; }
    if (r.tMs <= wallMs / 2) { atHalf = v; atHalfMs = r.tMs; }
  }
  const end = rows[rows.length - 1].fresh[i];
  return { high, lastHighMs, atHalfMs, atHalf, end, secondHalfGain: end - atHalf };
}

/**
 * Rows thinned for a verdict: the first, the last, every growth row, and at most one per `everyMs`.
 */
export function thinRows(rows, everyMs = 1000) {
  const out = [];
  let last = -Infinity;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (i === 0 || i === rows.length - 1 || r.tMs - last >= everyMs) { out.push(r); last = r.tMs; }
  }
  return out;
}
