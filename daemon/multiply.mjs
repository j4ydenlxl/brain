// daemon/multiply.mjs: MULTIPLYING (his P15, 2026-09-23: "multiplying, duplicating, all within
// cloud"). An instance is one node process running daemon/run.mjs live() on its own state
// directory, with its own health port, and one worker thread searching the grid plane. A
// population is several of them sharing one directory:
//
//   <popDir>/inst-<id>/instance.json     who it is: id, seed, parent, wall seconds, spawn plan
//   <popDir>/inst-<id>/brain/            the organism (snapshot.json, meta.json, ledger/) plus
//                                        plane.json (the plane's elites and counters, written
//                                        at every checkpoint), multiply.json (the health status,
//                                        once a second) and done.json (written when it ends)
//   <popDir>/store/<id>.json             the elites this instance found, exported at every checkpoint
//   <popDir>/instances/<id>.json         heartbeat, once a second (pid, port, tick, rss, ended)
//   <popDir>/requests/<id>.json          a duplicate waiting to be launched
//   <popDir>/logs, <popDir>/budget       each instance's output and its tools/budget.mjs records
//
// (a) DUPLICATE. duplicateInstance() copies the instance's latest checkpoint (snapshot.json,
//     meta.json, plane.json; never control.json or the ledger) through a temp dir and one
//     rename into <popDir>/inst-<new id>, writes an instance.json with a DIFFERENT seed (the
//     same seed is refused, an existing id is 409), and files a request. The population
//     supervisor launches it as its own node process under tools/budget.mjs caps; the new
//     instance resumes the copied organism and plane with its own seed, state dir and health
//     port. An instance runs its spawn plan (instance.json spawnPlan) after its Nth exchange,
//     and records each duplicate in instance.json so a restarted instance never makes it twice.
//     The copy is not started as a child of its parent process on purpose: a container is not a
//     child of another container, and a parent killed at 120 s must not take its duplicates down.
//
// (b) ELITE EXCHANGE. The plane is the velocity grid library search (generations/velocity.mjs
//     MatrixElites on the K = 4 draw grid suite, plane after plane, each to its plateau, each
//     carrying every stored elite into generation zero). Every elite lands in an EliteStore keyed
//     by a fixed MAP-Elites cell (the four velocity axes with lmax 96), which replaces a held
//     elite ONLY with a strictly better one and records the source instance that found it. At
//     every checkpoint (daemon/run.mjs opts.onCheckpoint) the worker harvests its running plane,
//     reads every other instance's store file, re-scores each genome on its own matrix (a row
//     whose count or cell disagrees is rejected), keeps the best per cell, drops the accepted
//     ones into the running plane, writes its own finds to store/<id>.json and saves plane.json.
//     The fresh draws (grid/velocity:heldout and :fresh1..4) are scored only in report(), never
//     in selection.
//
// (c) HEALTH. daemon/health.mjs serves each instance on its own port (port 0, 127.0.0.1) and
//     reads multiply.json and the population heartbeats: instances alive, this instance's id,
//     duplications made, elites imported and exported.
//
// (d) SUPERVISOR. Population launches every instance and every request through a launcher
//     (tools/budget.mjs by default) and restarts an instance that exits without done.json from
//     its own last checkpoint, following bin/serve.mjs: backoff 1 s, doubled when it died
//     within 10 s of starting, a restart cap, and never past the instance's own deadline (its
//     wall seconds run from its FIRST start, so a restart does not buy it more time).
//
// Every message across the worker boundary, both directions and workerData, goes through
// runtime/protocol.mjs ownBytes (postToPlane on this side, post in the worker).
//
//   node daemon/multiply.mjs instance --dir <popDir>/inst-<id>
//   node daemon/multiply.mjs population --dir <popDir> [--wall-s 240] [--seed 1] [--size 3]
//   node daemon/multiply.mjs prebuild --cache <dir>   (build the suite's matrices once into a cache)
import { Worker, isMainThread, parentPort, workerData, threadId } from 'node:worker_threads';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, rmSync, readdirSync, statSync, copyFileSync, openSync, closeSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { ownBytes } from '../runtime/protocol.mjs';
import { EvalMatrix, MatrixElites, PlateauRuler, matrixPlaneCoordinate, buildGridMatrix, stackDraws, drawSeeds, gridChainOf, OPS, popcnt, DEFAULT_BINS, syntheticMatrix } from '../generations/velocity.mjs';

const SELF = fileURLToPath(import.meta.url);
export const MULTIPLY_FILE = SELF;
export const ROOT = path.resolve(path.dirname(SELF), '..');

/** The searched suite and the fresh draws: bench/velocity.mjs --draws 4, the same seeds. */
export const SUITE = Object.freeze({ kind: 'grid', seed: 'grid/velocity', draws: 4, maxDepth: 3, fresh: 'grid/velocity:heldout', freshMore: 4 });
/** The store's cell grid: the velocity axes, with the longest library any plane may hold. */
export const STORE_LMAX = 96;
export const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,31}$/;
export const DEFAULTS = Object.freeze({
  // checkpointEvery: the 12 major organism alone ticked 29 and 30 t/s over its first 600 ticks on
  // this desk; beside its plane worker in the bar it reached t=2450 in 244.413 s with 11
  // checkpoints (bench/verdicts/multiply.json); every checkpoint is an exchange
  wallS: 240, majors: 12, units: 256, checkpointEvery: 250, chunk: 10, ledgerBudgetMb: 16,
  patience: 200, epsilon: 1e-9, sliceMs: 25, heartbeatMs: 1000, planeHeapMb: 256,
  instanceHeapMb: 1024, instanceRamMb: 1600, instanceDiskMb: 600, budgetIntervalMs: 2000,
  restartMax: 3, backoffMs: 1000, pollMs: 250, minSpawnLeftS: 30,
});

const firstLine = (e) => String((e && e.message) || e).split('\n')[0];
const iso = (ms = Date.now()) => new Date(ms).toISOString();
const r3 = (x) => Math.round(x * 1e3) / 1e3;
export const readJson = (file, dflt = null) => { try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return dflt; } };
const sleepSync = (ms) => { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch { /* no wait available */ } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Write JSON through a temp file and one rename (retried: Windows refuses a rename over an open file). */
export function writeJsonAtomic(file, value, { pretty = false } = {}) {
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.' + process.pid + '.' + threadId + '.tmp';
  writeFileSync(tmp, JSON.stringify(value, null, pretty ? 2 : 0) + '\n');
  for (let i = 0; ; i++) {
    try { renameSync(tmp, file); return file; } catch (e) {
      if (i >= 8) { try { rmSync(tmp, { force: true }); } catch { /* best effort */ } throw e; }
      sleepSync(15 * (i + 1));
    }
  }
}

export const instanceDir = (popDir, id) => path.join(popDir, 'inst-' + id);
export const BRAIN_NAME = 'brain';
const brainDirOf = (instDir) => path.join(instDir, BRAIN_NAME);

// ---------------------------------------------------------------- the store's cells
/**
 * The MAP-Elites cell of a library on the store's fixed grid: MatrixElites.binOf's four axes
 * (length over lmax, mean component size, share of the op vocabulary, share of solved tasks that
 * are deep) with lmax fixed at STORE_LMAX, so a cell means the same thing on every plane and in
 * every instance. `words` are the solved task bits scoreAt wrote for this library.
 */
export function storeCellOf(matrix, genome, n, count, words, { bins = DEFAULT_BINS, lmax = STORE_LMAX } = {}) {
  const m = matrix, B = bins;
  let sumSize = 0, ops = 0;
  for (let i = 0; i < n; i++) { const c = genome[i]; sumSize += m.size[c]; ops |= m.opMask[c]; }
  let deep = 0;
  for (let w = 0; w < m.W; w++) deep += popcnt(words[w] & m.deepMask[w]);
  const clampB = (v) => (v < 0 ? 0 : v >= B ? B - 1 : v);
  const a0 = clampB(Math.floor(((n - 1) * B) / lmax));
  const a1 = clampB(m.maxSize ? Math.floor((sumSize / n / m.maxSize) * B) : 0);
  const a2 = clampB(m.nOps ? Math.floor((popcnt(ops >>> 0) / m.nOps) * B) : 0);
  const a3 = clampB(count ? Math.floor((deep / count) * B) : 0);
  return ((a0 * B + a1) * B + a2) * B + a3;
}

/** A genome a store may hold: 1..STORE_LMAX whole component indices of this matrix. */
export function validGenome(genome, C) {
  if (!Array.isArray(genome) || genome.length < 1 || genome.length > STORE_LMAX) return false;
  for (const c of genome) if (!(Number.isInteger(c) && c >= 0 && c < C)) return false;
  return true;
}

// ---------------------------------------------------------------- the elite store
/**
 * Best per cell across the population. offer() replaces a held elite only with a STRICTLY better
 * one (a tie keeps the incumbent), and every row carries `source`, the instance that found it,
 * and `via`, the store file it was read from (null when found here).
 */
export class EliteStore {
  constructor({ id, bins = DEFAULT_BINS, lmax = STORE_LMAX } = {}) {
    if (!ID_RE.test(String(id))) throw new Error('EliteStore: id must match ' + ID_RE.source);
    this.id = String(id); this.bins = bins; this.lmax = lmax;
    this.cells = new Map();
    this.stats = { offered: 0, filled: 0, replaced: 0, kept: 0 };
  }

  /** @param {{cell, fitness, count, len, genome, source, at?}} row @returns {'filled'|'replaced'|'kept'} */
  offer(row, { via = null } = {}) {
    this.stats.offered++;
    const held = this.cells.get(row.cell);
    if (held && !(row.fitness > held.fitness)) { this.stats.kept++; return 'kept'; }
    this.cells.set(row.cell, {
      cell: row.cell, fitness: row.fitness, count: row.count, len: row.len, genome: Array.from(row.genome),
      source: String(row.source), via: via ?? row.via ?? null, at: row.at ?? null,
    });
    if (held) { this.stats.replaced++; return 'replaced'; }
    this.stats.filled++;
    return 'filled';
  }

  get size() { return this.cells.size; }
  get(cell) { return this.cells.get(cell) || null; }
  rows() { return [...this.cells.values()].sort((a, b) => a.cell - b.cell); }
  /** Rows this instance found itself. */
  own() { return this.rows().filter((r) => r.source === this.id); }
  /** The best by the searched objective; a tie goes to the lower cell. */
  best() {
    let b = null;
    for (const r of this.cells.values()) if (!b || r.fitness > b.fitness || (r.fitness === b.fitness && r.cell < b.cell)) b = r;
    return b;
  }
  toJSON() { return { id: this.id, bins: this.bins, lmax: this.lmax, stats: { ...this.stats }, rows: this.rows() }; }
  static from(doc, { id = doc && doc.id } = {}) {
    const s = new EliteStore({ id, bins: doc && doc.bins || DEFAULT_BINS, lmax: doc && doc.lmax || STORE_LMAX });
    for (const r of (doc && doc.rows) || []) s.cells.set(r.cell, { ...r, genome: Array.from(r.genome) });
    if (doc && doc.stats) Object.assign(s.stats, doc.stats);
    return s;
  }
}

// ---------------------------------------------------------------- the matrix cache
const MAGIC = Buffer.from('BRAINMX1');

/** Where a grid draw's matrix is cached: one binary file per seed and depth. */
export function matrixCacheFile(cacheDir, seed, maxDepth) {
  const h = createHash('sha256').update(String(seed) + '|' + maxDepth).digest('hex').slice(0, 12);
  return path.join(cacheDir, 'grid-' + String(seed).replace(/[^A-Za-z0-9._-]/g, '_') + '-d' + maxDepth + '-' + h + '.bin');
}

const bytesOf = (a) => new Uint8Array(a.buffer, a.byteOffset, a.byteLength);

/** MAGIC, a u32 header length, a JSON header (with the sha256 of the planes), then the planes. */
export function saveMatrix(file, matrix, { seed, maxDepth }) {
  const parts = [matrix.fit, matrix.right, matrix.size, matrix.opMask, matrix.deepMask].map(bytesOf);
  const sha = createHash('sha256');
  for (const p of parts) sha.update(p);
  const header = Buffer.from(JSON.stringify({ seed, maxDepth, C: matrix.C, T: matrix.T, W: matrix.W, nOps: matrix.nOps, lens: parts.map((p) => p.byteLength), sha256: sha.digest('hex'), counts: matrix.meta && matrix.meta.counts || null }));
  const len = Buffer.alloc(4); len.writeUInt32LE(header.length, 0);
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.' + process.pid + '.' + threadId + '.tmp';
  writeFileSync(tmp, Buffer.concat([MAGIC, len, header, ...parts.map((p) => Buffer.from(p.buffer, p.byteOffset, p.byteLength))]));
  renameSync(tmp, file);
  return file;
}

/** Load a cached matrix; throws when the magic, the sizes or the sha256 do not hold. */
export function loadMatrix(file) {
  const buf = readFileSync(file);
  if (buf.length < 12 || !buf.subarray(0, 8).equals(MAGIC)) throw new Error('loadMatrix: ' + file + ' is not a matrix cache file');
  const hl = buf.readUInt32LE(8);
  const h = JSON.parse(buf.subarray(12, 12 + hl).toString('utf8'));
  let o = 12 + hl;
  const take = (Ctor, n) => {
    const out = new Ctor(n);
    const b = bytesOf(out);
    if (o + b.byteLength > buf.length) throw new Error('loadMatrix: ' + file + ' is truncated');
    b.set(buf.subarray(o, o + b.byteLength));
    o += b.byteLength;
    return out;
  };
  const fit = take(Uint32Array, h.C * h.W), right = take(Uint32Array, h.C * h.W), size = take(Uint8Array, h.C), opMask = take(Uint32Array, h.C), deepMask = take(Uint32Array, h.W);
  const sha = createHash('sha256');
  for (const a of [fit, right, size, opMask, deepMask]) sha.update(bytesOf(a));
  if (sha.digest('hex') !== h.sha256) throw new Error('loadMatrix: ' + file + ' fails its sha256');
  const maxDepth = h.maxDepth;
  return new EvalMatrix({
    name: 'grid', components: h.C, tasks: h.T, fit, right, size, opMask, nOps: h.nOps, deepMask,
    names: (c) => { const ch = gridChainOf(c, maxDepth); return ch.length ? ch.map((x) => OPS[x].name).join('>') : 'identity'; },
    meta: { seed: h.seed, maxDepth, counts: h.counts, cached: path.basename(file) },
  });
}

/** One grid draw's matrix: from the cache when it holds a valid copy, else built (and cached). */
export function gridMatrixCached(seed, { maxDepth = 3, cacheDir = null } = {}) {
  const t0 = performance.now();
  const file = cacheDir ? matrixCacheFile(cacheDir, seed, maxDepth) : null;
  if (file && existsSync(file)) {
    try { return { matrix: loadMatrix(file), cached: true, ms: performance.now() - t0 }; } catch { /* rebuilt below */ }
  }
  const b = buildGridMatrix({ seed, maxDepth });
  if (file) { try { saveMatrix(file, b.matrix, { seed, maxDepth }); } catch { /* the next start builds it again */ } }
  return { matrix: b.matrix, cached: false, ms: performance.now() - t0 };
}

/**
 * The searched suite (K draws stacked) and the fresh draws. A synthetic suite (tests only) is one
 * syntheticMatrix searched and one of another seed as its fresh draw.
 * @returns {{ matrix: EvalMatrix, fresh: {seed, matrix}[], seeds: string[], freshSeeds: string[], ms: number, cached: number, built: number }}
 */
export function loadSuite({ cacheDir = null, suite = SUITE } = {}) {
  const t0 = performance.now();
  if (suite.kind === 'synthetic') {
    const s = String(suite.seed || 'synthetic');
    const opts = { tasks: suite.tasks || 256, planted: suite.planted || 8, decoys: suite.decoys || 504 };
    return {
      matrix: syntheticMatrix({ seed: s, ...opts }).matrix, fresh: [{ seed: s + ':heldout', matrix: syntheticMatrix({ seed: s + ':heldout', ...opts }).matrix }],
      seeds: [s], freshSeeds: [s + ':heldout'], ms: performance.now() - t0, cached: 0, built: 2,
    };
  }
  const seeds = drawSeeds(suite.seed, suite.draws);
  const freshSeeds = [suite.fresh, ...Array.from({ length: suite.freshMore || 0 }, (_, i) => suite.seed + ':fresh' + (i + 1))];
  for (const s of freshSeeds) if (seeds.includes(s)) throw new Error('loadSuite: fresh seed ' + s + ' is a searched draw');
  let cached = 0, built = 0;
  const get = (s) => { const r = gridMatrixCached(s, { maxDepth: suite.maxDepth, cacheDir }); if (r.cached) cached++; else built++; return r.matrix; };
  const parts = seeds.map(get);
  const matrix = parts.length === 1 ? parts[0] : stackDraws(parts, { name: 'grid:' + parts.length + 'draws', meta: { runSeed: suite.seed, seeds, maxDepth: suite.maxDepth } });
  const fresh = freshSeeds.map((s) => ({ seed: s, matrix: get(s) }));
  return { matrix, fresh, seeds, freshSeeds, ms: performance.now() - t0, cached, built };
}

// ---------------------------------------------------------------- the plane
/**
 * The grid plane of one instance: MatrixElites plane after plane (matrixPlaneCoordinate over
 * base 'multiply/<seed>'), each run to its PlateauRuler plateau, each carrying every stored elite
 * into generation zero; an EliteStore holding the best per cell; and the exchange.
 */
export class PlaneSearch {
  constructor({ id, base, matrix, fresh = [], patience = DEFAULTS.patience, epsilon = DEFAULTS.epsilon, state = null } = {}) {
    this.id = String(id); this.base = String(base);
    this.m = matrix; this.fresh = fresh;
    this.patience = patience; this.epsilon = epsilon;
    this.store = new EliteStore({ id: this.id });
    this.planeIndex = 0; this.planesRun = 0; this.planesFired = 0;
    this.evalsDone = 0; this.rescoreEvals = 0; this.exchanges = 0;
    this.imported = { files: 0, rows: 0, filled: 0, replaced: 0, kept: 0, rejected: 0, injected: 0 };
    this.exported = 0; this.exportedKeys = new Map();
    this.inherited = null; this.resumed = null; this.clockT = null;
    this.words = new Uint32Array(matrix.W);
    this.buf = new Int32Array(STORE_LMAX);
    if (state) this.load(state);
    this.startPlane();
  }

  /** Matrix evaluations by this instance's plane engines (carries and injected imports included). */
  get evals() { return this.evalsDone + (this.engine ? this.engine.evals : 0); }

  load(state) {
    const store = EliteStore.from(state.store || { rows: [] }, { id: this.id });
    if (state.id !== this.id) {
      // a duplicate: the parent's elites are inherited (their source stays the parent), the
      // counters and the plane list start over under this instance's own base
      this.store = store;
      this.inherited = { from: state.id, rows: store.size, evals: state.evalsDone || 0, planeIndex: state.planeIndex ?? null, t: state.t ?? null };
      return;
    }
    this.store = store;
    this.planeIndex = state.planeIndex | 0; this.planesRun = state.planesRun | 0; this.planesFired = state.planesFired | 0;
    this.evalsDone = Number(state.evalsDone) || 0; this.rescoreEvals = Number(state.rescoreEvals) || 0; this.exchanges = state.exchanges | 0;
    Object.assign(this.imported, state.imported || {});
    this.exported = state.exported | 0;
    this.exportedKeys = new Map(Object.entries(state.exportedKeys || {}).map(([k, v]) => [Number(k), v]));
    this.inherited = state.inherited || null;
    this.resumed = { planeIndex: this.planeIndex, storeRows: store.size, t: state.t ?? null, savedAt: state.savedAt ?? null };
  }

  startPlane() {
    const coord = matrixPlaneCoordinate(this.planeIndex, { base: this.base });
    const carry = this.store.rows().sort((a, b) => b.fitness - a.fitness || a.cell - b.cell).map((r) => r.genome);
    this.coord = coord;
    this.engine = new MatrixElites(this.m, { seed: coord.seed, popSize: coord.popSize, lmax: coord.lmax, mutationRate: coord.mutationRate, crossoverRate: coord.crossoverRate, prune: coord.prune, directed: coord.directed, carry });
    this.ruler = new PlateauRuler({ epsilon: this.epsilon, patience: this.patience });
  }

  /** Generations for at least `ms` milliseconds; a plane that plateaus is harvested and the next begins. */
  slice(ms) {
    const t0 = performance.now();
    let gens = 0;
    do {
      const row = this.engine.step();
      gens++;
      if (this.ruler.observe(row.gen, row.best).fired) this.endPlane(true);
    } while (performance.now() - t0 < ms);
    return gens;
  }

  endPlane(fired) {
    this.harvest();
    this.evalsDone += this.engine.evals;
    this.planesRun++;
    if (fired) this.planesFired++;
    this.planeIndex++;
    this.startPlane();
  }

  /** Score a genome on this instance's own matrix: count, length, fitness and store cell; null when invalid. */
  rescore(genome) {
    if (!validGenome(genome, this.m.C)) return null;
    const n = genome.length;
    for (let i = 0; i < n; i++) this.buf[i] = genome[i];
    const count = this.m.scoreAt(this.buf, 0, n, this.words);
    this.rescoreEvals++;
    return { count, len: n, fitness: this.m.objective(count, n), cell: storeCellOf(this.m, this.buf, n, count, this.words) };
  }

  /** The running plane's elites into the store (idempotent: a held elite is replaced only by a better one). */
  harvest() {
    for (const e of this.engine.elites()) {
      const s = this.rescore(e.genome);
      if (s) this.store.offer({ ...s, genome: e.genome, source: this.id, at: this.clockT });
    }
  }

  /** An accepted import joins the running plane now, not only at the next plane's carry. */
  inject(genome) {
    const e = this.engine, n = Math.min(genome.length, e.lmax);
    for (let i = 0; i < n; i++) e.child[i] = genome[i];
    e.offer(e.child, n);
    this.imported.injected++;
  }

  /** Read every other instance's store file; keep the better per cell. */
  importAll(storeDir) {
    const r = { files: 0, rows: 0, filled: 0, replaced: 0, kept: 0, rejected: 0 };
    let names = [];
    try { names = readdirSync(storeDir).filter((n) => n.endsWith('.json')).sort(); } catch { /* no store yet */ }
    for (const n of names) {
      const other = n.slice(0, -5);
      if (other === this.id) continue;
      const doc = readJson(path.join(storeDir, n));
      if (!doc || !Array.isArray(doc.rows)) continue;
      r.files++;
      for (const row of doc.rows) {
        r.rows++;
        const s = row ? this.rescore(row.genome) : null;
        // the count and the cell are recomputed here; a row that disagrees came from another matrix
        if (!s || s.count !== row.count || s.cell !== row.cell || !ID_RE.test(String(row.source || other))) { r.rejected++; continue; }
        const out = this.store.offer({ ...s, genome: row.genome, source: String(row.source || other), at: row.at ?? null }, { via: other });
        r[out]++;
        if (out !== 'kept') this.inject(row.genome);
      }
    }
    for (const k of Object.keys(r)) this.imported[k] += r[k];
    return r;
  }

  /** Write this instance's own finds to store/<id>.json; returns rows written and how many are new since the last export. */
  exportOwn(storeDir) {
    const own = this.store.own();
    let fresh = 0;
    for (const row of own) {
      const key = String(row.fitness);
      if (this.exportedKeys.get(row.cell) !== key) { fresh++; this.exportedKeys.set(row.cell, key); }
    }
    this.exported += fresh;
    writeJsonAtomic(path.join(storeDir, this.id + '.json'), { id: this.id, at: iso(), t: this.clockT, rows: own.map((x) => ({ cell: x.cell, fitness: x.fitness, count: x.count, len: x.len, genome: x.genome, source: x.source, at: x.at })) });
    return { rows: own.length, fresh };
  }

  /** The whole exchange of one checkpoint: harvest, import, export, save. */
  exchange({ t = null, kind = 'checkpoint', storeDir, planeFile = null }) {
    const c0 = performance.now();
    this.clockT = t;
    this.harvest();
    const imported = this.importAll(storeDir);
    const exported = this.exportOwn(storeDir);
    this.exchanges++;
    if (planeFile) this.save(planeFile);
    return { kind, t, imported, exported, storeRows: this.store.size, exchanges: this.exchanges, ms: r3(performance.now() - c0) };
  }

  toState() {
    return {
      version: 1, id: this.id, base: this.base, t: this.clockT, savedAt: iso(),
      planeIndex: this.planeIndex, planesRun: this.planesRun, planesFired: this.planesFired,
      evalsDone: this.evals, rescoreEvals: this.rescoreEvals, exchanges: this.exchanges,
      imported: { ...this.imported }, exported: this.exported, exportedKeys: Object.fromEntries(this.exportedKeys),
      inherited: this.inherited, store: this.store.toJSON(),
    };
  }

  save(planeFile) { writeJsonAtomic(planeFile, this.toState()); return planeFile; }

  /** Counters and the best by the searched objective, with its fresh-draw scores. */
  report() {
    this.harvest();
    const best = this.store.best();
    let b = null;
    if (best) {
      const counts = this.fresh.map((f) => f.matrix.score(best.genome).count);
      const more = counts.slice(1);
      b = {
        fitness: best.fitness, count: best.count, len: best.len, cell: best.cell, source: best.source,
        searchedMeanCount: best.count / this.m.draws, tasksPerDraw: this.m.tasksPerDraw,
        fresh: counts.length ? counts[0] : null, freshT: this.fresh.length ? this.fresh[0].matrix.T : null,
        freshMore: more, freshMoreMean: more.length ? more.reduce((a, x) => a + x, 0) / more.length : null,
        genome: best.genome,
      };
    }
    return {
      id: this.id, base: this.base, evals: this.evals, rescoreEvals: this.rescoreEvals,
      planesRun: this.planesRun, planesFired: this.planesFired, planeIndex: this.planeIndex,
      storeRows: this.store.size, ownRows: this.store.own().length, exchanges: this.exchanges,
      imported: { ...this.imported }, elitesImported: this.imported.filled + this.imported.replaced, elitesExported: this.exported,
      inherited: this.inherited, resumed: this.resumed, t: this.clockT, best: b,
    };
  }
}

// ---------------------------------------------------------------- the worker boundary
// THE WORKER BOUNDARY. Three crossings and no others: workerData (planeWorkerOptions), main to
// worker (postToPlane) and worker to main (postFromPlane). Each passes through ownBytes first,
// so a typed array view that is a window on a larger buffer crosses as a copy of its own bytes.
/** Every post to the plane worker. */
export function postToPlane(port, msg) { const m = ownBytes(msg); port.postMessage(m); return m; }
/** Every post from the plane worker. */
export function postFromPlane(port, msg) { const m = ownBytes(msg); port.postMessage(m); return m; }
/** The Worker options of a plane worker: its workerData through ownBytes. */
export function planeWorkerOptions(data, heapMb = DEFAULTS.planeHeapMb) { return { workerData: ownBytes({ multiplyPlane: data }), resourceLimits: { maxOldGenerationSizeMb: heapMb } }; }

/** The main thread's handle on an instance's plane worker. */
export class PlaneWorker {
  constructor(cfg) {
    this.cfg = { sliceMs: DEFAULTS.sliceMs, patience: DEFAULTS.patience, epsilon: DEFAULTS.epsilon, heapMb: DEFAULTS.planeHeapMb, suite: SUITE, ...cfg };
    this.worker = null; this.seq = 0; this.waiting = new Map(); this.exited = null; this.sliceError = null;
  }

  start() {
    const { heapMb, ...data } = this.cfg;
    this.worker = new Worker(SELF, planeWorkerOptions(data, heapMb));
    this.worker.on('message', (m) => {
      if (m && m.seq === -1) { this.sliceError = m.error; return; }
      const w = m && this.waiting.get(m.seq);
      if (!w) return;
      this.waiting.delete(m.seq);
      if (m.op === 'error') w.reject(new Error(m.error)); else w.resolve(m);
    });
    const fail = (e) => { for (const w of this.waiting.values()) w.reject(e); this.waiting.clear(); };
    this.worker.on('error', (e) => fail(e));
    this.worker.on('exit', (code) => { this.exited = code; fail(new Error('the plane worker exited ' + code)); });
    return new Promise((resolve, reject) => this.waiting.set(0, { resolve, reject }));
  }

  request(op, extra = {}) {
    if (!this.worker || this.exited !== null) return Promise.reject(new Error('the plane worker is not running'));
    const seq = ++this.seq;
    const p = new Promise((resolve, reject) => this.waiting.set(seq, { resolve, reject }));
    postToPlane(this.worker, { op, seq, ...extra });
    return p;
  }

  exchange(info) { return this.request('exchange', info); }
  report() { return this.request('report'); }
  async stop(info = {}) {
    let r = null;
    try { r = await this.request('stop', info); } finally { if (this.worker) await this.worker.terminate().catch(() => {}); }
    return r;
  }
}

function planeWorkerMain(cfg) {
  const post = (m) => postFromPlane(parentPort, m);
  let search, stopping = false;
  try {
    const t0 = performance.now();
    const suite = loadSuite({ cacheDir: cfg.cacheDir, suite: cfg.suite });
    const state = cfg.planeFile ? readJson(cfg.planeFile) : null;
    search = new PlaneSearch({ id: cfg.id, base: cfg.base, matrix: suite.matrix, fresh: suite.fresh, patience: cfg.patience, epsilon: cfg.epsilon, state });
    post({ op: 'ready', seq: 0, loadMs: r3(performance.now() - t0), suiteMs: r3(suite.ms), cached: suite.cached, built: suite.built, seeds: suite.seeds, freshSeeds: suite.freshSeeds, C: suite.matrix.C, T: suite.matrix.T, report: search.report() });
  } catch (e) { post({ op: 'error', seq: 0, error: firstLine(e) }); return; }
  parentPort.on('message', (m) => {
    if (!m || typeof m !== 'object') return;
    try {
      if (m.op === 'exchange') {
        const ex = search.exchange({ t: m.t ?? null, kind: m.kind, storeDir: cfg.storeDir, planeFile: cfg.planeFile });
        post({ op: 'exchanged', seq: m.seq, exchange: ex, report: search.report() });
      } else if (m.op === 'report') post({ op: 'report', seq: m.seq, report: search.report() });
      else if (m.op === 'stop') {
        stopping = true;
        const ex = search.exchange({ t: m.t ?? search.clockT, kind: 'stop', storeDir: cfg.storeDir, planeFile: cfg.planeFile });
        post({ op: 'stopped', seq: m.seq, exchange: ex, report: search.report() });
      } else post({ op: 'error', seq: m.seq, error: 'unknown op ' + m.op });
    } catch (e) { post({ op: 'error', seq: m.seq, error: firstLine(e) }); }
  });
  const loop = () => { if (stopping) return; try { search.slice(cfg.sliceMs); } catch (e) { stopping = true; post({ op: 'error', seq: -1, error: 'slice: ' + firstLine(e) }); return; } setImmediate(loop); };
  setImmediate(loop);
}

// ---------------------------------------------------------------- instances on disk
/** A new instance directory with its instance.json (no checkpoint: it builds on its first start). */
export function createInstance({ popDir, id, seed, wallS = DEFAULTS.wallS, organism = {}, spawnPlan = [], cacheDir = null, suite = SUITE, minSpawnLeftS = DEFAULTS.minSpawnLeftS }) {
  if (!ID_RE.test(String(id))) throw new Error('createInstance: id must match ' + ID_RE.source);
  const dir = instanceDir(popDir, id);
  if (existsSync(path.join(dir, 'instance.json'))) throw new Error('createInstance: ' + id + ' already exists');
  const inst = {
    id: String(id), seed: String(seed), parent: null, popDir: path.resolve(popDir), wallS,
    organism: { majors: DEFAULTS.majors, units: DEFAULTS.units, checkpointEvery: DEFAULTS.checkpointEvery, chunk: DEFAULTS.chunk, ledgerBudgetMb: DEFAULTS.ledgerBudgetMb, ...organism },
    spawnPlan: spawnPlan.map((p) => ({ id: String(p.id), seed: String(p.seed), afterExchange: p.afterExchange ?? 1, spawnPlan: p.spawnPlan || [] })), spawned: [],
    cacheDir: cacheDir ? path.resolve(cacheDir) : path.join(path.resolve(popDir), 'matrices'), suite, minSpawnLeftS, createdAt: iso(), firstStartMs: null, starts: 0,
  };
  writeJsonAtomic(path.join(dir, 'instance.json'), inst, { pretty: true });
  return { dir, inst };
}

/**
 * DUPLICATE: copy an instance's latest checkpoint into a new instance with a different seed.
 * @returns {{ status: number, body: object }} 200 with the copy, 400 bad id or same seed, 404 no checkpoint, 409 exists, 503 raced twice
 */
export function duplicateInstance({ popDir, fromDir, id, seed, spawnPlan = [], atMs = Date.now() }) {
  const s = String(seed ?? '');
  if (!ID_RE.test(String(id))) return { status: 400, body: { ok: false, error: 'id must match ' + ID_RE.source } };
  if (!/^[0-9A-Za-z._:-]{1,32}$/.test(s)) return { status: 400, body: { ok: false, error: 'seed must be 1 to 32 characters of [0-9A-Za-z._:-], got ' + JSON.stringify(s) } };
  const parent = readJson(path.join(fromDir, 'instance.json'));
  if (!parent) return { status: 404, body: { ok: false, error: 'no instance.json at ' + fromDir } };
  if (s === String(parent.seed)) return { status: 400, body: { ok: false, error: 'a duplicate needs a different seed than its parent (' + s + ')' } };
  const src = brainDirOf(fromDir);
  const snap = path.join(src, 'snapshot.json');
  if (!existsSync(snap)) return { status: 404, body: { ok: false, error: 'no checkpoint yet at ' + snap } };
  const dest = instanceDir(popDir, id);
  if (existsSync(dest)) return { status: 409, body: { ok: false, error: 'instance ' + id + ' already exists', dir: dest } };
  const tmp = path.join(popDir, '.dup-' + id + '.' + process.pid + '.tmp');
  const files = ['snapshot.json', 'meta.json', 'plane.json'];
  for (let attempt = 0; attempt < 2; attempt++) {
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(path.join(tmp, BRAIN_NAME), { recursive: true });
    const before = files.map((f) => { try { const st = statSync(path.join(src, f)); return st.size + ':' + st.mtimeMs; } catch { return null; } });
    for (const f of files) if (existsSync(path.join(src, f))) copyFileSync(path.join(src, f), path.join(tmp, BRAIN_NAME, f));
    const after = files.map((f) => { try { const st = statSync(path.join(src, f)); return st.size + ':' + st.mtimeMs; } catch { return null; } });
    if (before.join('|') !== after.join('|')) continue;
    const meta = readJson(path.join(tmp, BRAIN_NAME, 'meta.json')) || {};
    const bytes = statSync(path.join(tmp, BRAIN_NAME, 'snapshot.json')).size;
    const sha256 = createHash('sha256').update(readFileSync(path.join(tmp, BRAIN_NAME, 'snapshot.json'))).digest('hex');
    const plane = readJson(path.join(tmp, BRAIN_NAME, 'plane.json'));
    const inst = {
      id: String(id), seed: s, parent: parent.id, popDir: parent.popDir, wallS: parent.wallS, organism: parent.organism,
      spawnPlan: spawnPlan.map((p) => ({ id: String(p.id), seed: String(p.seed), afterExchange: p.afterExchange ?? 1, spawnPlan: p.spawnPlan || [] })), spawned: [],
      cacheDir: parent.cacheDir, suite: parent.suite, minSpawnLeftS: parent.minSpawnLeftS ?? DEFAULTS.minSpawnLeftS, createdAt: iso(atMs), firstStartMs: null, starts: 0,
      duplicatedFrom: { id: parent.id, seed: parent.seed, tick: meta.t ?? null, bytes, sha256, planeRows: plane && plane.store ? plane.store.rows.length : 0, planeT: plane ? plane.t ?? null : null },
    };
    writeJsonAtomic(path.join(tmp, 'instance.json'), inst, { pretty: true });
    renameSync(tmp, dest);
    writeJsonAtomic(path.join(popDir, 'requests', id + '.json'), { id: String(id), seed: s, parent: parent.id, at: iso(atMs) });
    return { status: 200, body: { ok: true, id: String(id), seed: s, parent: parent.id, dir: dest, fromTick: meta.t ?? null, bytes, sha256, planeRows: inst.duplicatedFrom.planeRows } };
  }
  rmSync(tmp, { recursive: true, force: true });
  return { status: 503, body: { ok: false, error: 'a checkpoint landed during both copy attempts; try again' } };
}

// ---------------------------------------------------------------- one instance
/** Run one instance from its directory until its deadline (first start + wallS). Resolves to its end record. */
export async function runInstance(instDir, { out = (l) => console.log(l), heartbeatMs = DEFAULTS.heartbeatMs } = {}) {
  instDir = path.resolve(instDir);
  const instFile = path.join(instDir, 'instance.json');
  const inst = readJson(instFile);
  if (!inst || !ID_RE.test(String(inst.id))) throw new Error('runInstance: no valid instance.json at ' + instFile);
  const id = inst.id, popDir = inst.popDir;
  const startMs = Date.now();
  if (!inst.firstStartMs) inst.firstStartMs = startMs;
  inst.starts = (inst.starts || 0) + 1;
  writeJsonAtomic(instFile, inst, { pretty: true });
  const deadline = inst.firstStartMs + inst.wallS * 1000;
  // daemon/run.mjs and cli/state.mjs read BRAIN_STATE_DIR at call time: this instance's own state dir
  process.env.BRAIN_STATE_DIR = instDir;
  const brainDir = brainDirOf(instDir);
  mkdirSync(brainDir, { recursive: true });
  const planeFile = path.join(brainDir, 'plane.json');
  const storeDir = path.join(popDir, 'store');
  mkdirSync(storeDir, { recursive: true });
  const say = (l) => out('[multiply ' + id + '] ' + l);

  const status = {
    instance: id, seed: inst.seed, parent: inst.parent || null, pid: process.pid, port: null, popDir, starts: inst.starts,
    resumed: false, resumedAt: null, built: null, tick: null, tps: null, rssMb: null, maxRssMb: 0,
    duplications: (inst.spawned || []).length, spawned: (inst.spawned || []).map((x) => x.id), elitesImported: 0, elitesExported: 0,
    storeRows: 0, evals: 0, exchanges: 0, planeResumed: null, planeInherited: null, best: null, errors: [], ended: false, startedAt: iso(startMs), firstStartAt: iso(inst.firstStartMs), deadlineAt: iso(deadline),
  };
  const fold = (rep) => {
    if (!rep) return;
    status.elitesImported = rep.elitesImported; status.elitesExported = rep.elitesExported; status.storeRows = rep.storeRows;
    status.evals = rep.evals; status.exchanges = rep.exchanges; status.planesRun = rep.planesRun; status.planesFired = rep.planesFired;
    status.best = rep.best ? { fitness: rep.best.fitness, count: rep.best.count, len: rep.best.len, source: rep.best.source, fresh: rep.best.fresh, freshT: rep.best.freshT, freshMoreMean: rep.best.freshMoreMean } : null;
  };
  const beat = () => {
    const mu = process.memoryUsage();
    status.rssMb = Math.round(mu.rss / 1048576);
    status.maxRssMb = Math.max(status.maxRssMb, status.rssMb, Math.round((process.resourceUsage().maxRSS || 0) / 1024));
    status.updatedAt = iso(); status.atMs = Date.now();
    try { writeJsonAtomic(path.join(brainDir, 'multiply.json'), status); } catch (e) { status.errors.push('status: ' + firstLine(e)); }
    try { writeJsonAtomic(path.join(popDir, 'instances', id + '.json'), { id, pid: process.pid, port: status.port, seed: inst.seed, parent: status.parent, tick: status.tick, rssMb: status.rssMb, maxRssMb: status.maxRssMb, resumed: status.resumed, resumedAt: status.resumedAt, starts: status.starts, exchanges: status.exchanges, duplications: status.duplications, atMs: status.atMs, ended: status.ended }); } catch (e) { status.errors.push('heartbeat: ' + firstLine(e)); }
    if (status.errors.length > 16) status.errors.splice(0, status.errors.length - 16);
  };

  // the plane first: the 'built' checkpoint's exchange needs it
  const plane = new PlaneWorker({ id, base: 'multiply/' + inst.seed, planeFile, storeDir, cacheDir: inst.cacheDir, suite: inst.suite || SUITE });
  const ready = await plane.start();
  fold(ready.report);
  status.planeResumed = ready.report.resumed; status.planeInherited = ready.report.inherited;
  say('plane ' + (ready.report.resumed ? 'resumed from plane.json at plane ' + ready.report.resumed.planeIndex + ' with ' + ready.report.resumed.storeRows + ' stored elites (saved at t=' + ready.report.resumed.t + ')' : ready.report.inherited ? 'inherited ' + ready.report.inherited.rows + ' elites from ' + ready.report.inherited.from + ' (its plane.json at t=' + ready.report.inherited.t + ')' : 'started empty') + '; suite ' + ready.C + ' components x ' + ready.T + ' tasks, ' + ready.cached + ' draws cached, ' + ready.built + ' built, ' + ready.loadMs + ' ms');

  const doDuplicate = (childId, childSeed, plan = []) => {
    const r = duplicateInstance({ popDir, fromDir: instDir, id: childId, seed: childSeed, spawnPlan: plan });
    if (r.status === 200) {
      inst.spawned = inst.spawned || [];
      inst.spawned.push({ id: r.body.id, seed: r.body.seed, at: iso(), fromTick: r.body.fromTick, planeRows: r.body.planeRows });
      writeJsonAtomic(instFile, inst, { pretty: true });
      status.duplications = inst.spawned.length; status.spawned = inst.spawned.map((x) => x.id);
      say('duplicated into ' + r.body.id + ' (seed ' + r.body.seed + ') from checkpoint t=' + r.body.fromTick + ', ' + r.body.bytes + ' bytes, ' + r.body.planeRows + ' plane elites');
    } else say('duplicate ' + childId + ' refused: ' + r.status + ' ' + r.body.error);
    return r;
  };
  const health = await startHealthFor({ instDir, onDuplicate: (seed) => doDuplicate(id + '-d' + String(seed).replace(/[^A-Za-z0-9._-]/g, '_'), seed) });
  status.port = health.port;
  beat();
  const iv = setInterval(beat, heartbeatMs);
  say('health ' + health.url + '/health, pid ' + process.pid + ', start ' + inst.starts + ', deadline in ' + Math.round((deadline - Date.now()) / 100) / 10 + ' s');

  let chain = Promise.resolve();
  const afterExchange = (r) => {
    fold(r.report);
    const ex = r.exchange;
    say('exchange ' + ex.kind + ' t=' + ex.t + ': imported ' + (ex.imported.filled + ex.imported.replaced) + ' (' + ex.imported.filled + ' new cells, ' + ex.imported.replaced + ' replaced, ' + ex.imported.kept + ' kept, ' + ex.imported.rejected + ' rejected) from ' + ex.imported.files + ' stores, exported ' + ex.exported.fresh + ' of ' + ex.exported.rows + ' own, store ' + ex.storeRows + ' cells, best ' + (r.report.best ? r.report.best.count + ' by ' + r.report.best.source + ' fresh ' + r.report.best.fresh : 'none') + ', ' + ex.ms + ' ms');
    const done = new Set((inst.spawned || []).map((x) => x.id));
    for (const p of inst.spawnPlan || []) {
      if (done.has(p.id) || r.report.exchanges < p.afterExchange) continue;
      const minLeft = inst.minSpawnLeftS ?? DEFAULTS.minSpawnLeftS;
      if (deadline - Date.now() < minLeft * 1000) { say('spawn of ' + p.id + ' skipped: under ' + minLeft + ' s left'); continue; }
      doDuplicate(p.id, p.seed, p.spawnPlan || []);
      break; // one duplicate per exchange
    }
  };
  const onCheckpoint = (info) => {
    chain = chain.then(() => plane.exchange({ kind: info.kind, t: info.t })).then(afterExchange).catch((e) => { status.errors.push('exchange: ' + firstLine(e)); say('exchange failed: ' + firstLine(e)); });
  };

  const org = inst.organism || {};
  let payload = null, liveError = null;
  const wallMs = deadline - Date.now();
  if (wallMs > 1000) {
    try {
      const { live } = await import('./run.mjs');
      payload = await live({
        name: BRAIN_NAME, majors: org.majors, substrateUnits: org.units, seed: 'multiply:' + inst.seed, checkpointEvery: org.checkpointEvery, chunk: org.chunk,
        wallMs, loopEvery: 0, selfEvery: 0, genEvery: 0, dreamEvery: 0, ruler: false, ledger: 'summary', ledgerBudgetMb: org.ledgerBudgetMb,
        instance: id, onCheckpoint,
        out: (line) => {
          const s = String(line);
          const p = /^\[live\] t=(\d+) done=\d+ (\d+(?:\.\d+)?)\/s/.exec(s);
          if (p) { status.tick = Number(p[1]); status.tps = Number(p[2]); return; }
          const b = /^\[live\] (built|resumed) \S+ in (\d+) ms at t=(\d+)/.exec(s);
          if (b) { status.built = b[1] === 'built'; status.resumed = b[1] === 'resumed'; status.resumedAt = Number(b[3]); status.tick = Number(b[3]); status.loadMs = Number(b[2]); beat(); }
          if (s.startsWith('[live]') || s.startsWith('[multiply')) out(s);
        },
      });
      status.tick = payload.end ? payload.end.t : status.tick;
    } catch (e) { liveError = e; status.errors.push('live: ' + firstLine(e)); say('live failed: ' + firstLine(e)); }
  } else say('no time left (' + wallMs + ' ms): the organism does not start');
  await chain;
  let final = null;
  try { final = await plane.stop({ t: status.tick }); fold(final.report); } catch (e) { status.errors.push('plane stop: ' + firstLine(e)); }
  const rep = final ? final.report : null;
  if (!liveError) {
    writeJsonAtomic(path.join(brainDir, 'done.json'), {
      at: iso(), id, seed: inst.seed, parent: inst.parent || null, t: status.tick, starts: inst.starts, resumedAt: status.resumedAt,
      checkpoints: payload ? payload.checkpoints : 0, exchangeCalls: payload && payload.exchange ? payload.exchange.calls : 0, report: rep,
      wallS: r3((Date.now() - inst.firstStartMs) / 1000), maxRssMb: status.maxRssMb, duplications: status.duplications, spawned: inst.spawned || [],
    }, { pretty: true });
    status.ended = true;
  }
  clearInterval(iv);
  beat();
  await health.close();
  say('ended at t=' + status.tick + ': evals ' + status.evals + ', planes ' + status.planesRun + ', store ' + status.storeRows + ' cells, imported ' + status.elitesImported + ', exported ' + status.elitesExported + ', duplications ' + status.duplications + (rep && rep.best ? ', best ' + rep.best.count + ' (' + rep.best.searchedMeanCount + '/' + rep.best.tasksPerDraw + ' mean) fresh ' + rep.best.fresh + '/' + rep.best.freshT : ''));
  if (liveError) throw liveError;
  return { id, status, report: rep };
}

async function startHealthFor({ instDir, onDuplicate }) {
  const { startHealth } = await import('./health.mjs');
  return startHealth({ port: 0, host: '127.0.0.1', stateDir: instDir, name: BRAIN_NAME, onDuplicate });
}

// ---------------------------------------------------------------- the supervisor
/**
 * The default launcher: `node daemon/multiply.mjs instance --dir <dir>` under tools/budget.mjs
 * caps (RAM and disk of that instance's own tree and dir), output to <popDir>/logs/<id>.log, one
 * budget record per attempt in <popDir>/budget.
 */
export function budgetLauncher({ ramMb = DEFAULTS.instanceRamMb, diskMb = DEFAULTS.instanceDiskMb, heapMb = DEFAULTS.instanceHeapMb, intervalMs = DEFAULTS.budgetIntervalMs } = {}) {
  return ({ id, dir, attempt, popDir }) => {
    const logFile = path.join(popDir, 'logs', id + '.log');
    mkdirSync(path.dirname(logFile), { recursive: true });
    const fd = openSync(logFile, 'a');
    let gotPid;
    const pid = new Promise((r) => { gotPid = r; });
    const done = import('../tools/budget.mjs').then(({ budget }) => budget('node', ['--max-old-space-size=' + heapMb, SELF, 'instance', '--dir', dir], {
      ramMb, diskMb, dir, intervalMs, statusMs: 3_600_000, cwd: ROOT, stdio: ['ignore', fd, fd],
      record: path.join(popDir, 'budget', id + '-' + attempt + '.json'),
      log: (l) => { try { appendFileSync(logFile, l + '\n'); } catch { /* the log is best effort */ } },
      onSpawn: (child) => gotPid(child.pid),
    })).then((rec) => ({ code: rec.exitCode, signal: rec.signal, record: rec }), (e) => ({ code: null, signal: null, error: firstLine(e), record: null }))
      .finally(() => { try { closeSync(fd); } catch { /* closed */ } gotPid(null); });
    return { pid, done };
  };
}

/** A launcher without budget caps, for tests: a plain node child, output to the log file. */
export function plainLauncher({ script = SELF, args = (dir) => ['instance', '--dir', dir], heapMb = 512 } = {}) {
  return ({ id, dir, popDir }) => {
    const logFile = path.join(popDir, 'logs', id + '.log');
    mkdirSync(path.dirname(logFile), { recursive: true });
    const fd = openSync(logFile, 'a');
    return import('node:child_process').then(({ spawn }) => {
      const child = spawn(process.execPath, ['--max-old-space-size=' + heapMb, script, ...args(dir)], { cwd: ROOT, stdio: ['ignore', fd, fd], windowsHide: true });
      const done = new Promise((resolve) => {
        child.once('exit', (code, signal) => resolve({ code, signal, record: null }));
        child.once('error', (e) => resolve({ code: null, signal: null, error: firstLine(e), record: null }));
      }).finally(() => { try { closeSync(fd); } catch { /* closed */ } });
      return { pid: Promise.resolve(child.pid), done };
    });
  };
}

/**
 * The population supervisor (bin/serve.mjs's restart pattern, one member per instance): launches
 * each instance and each duplicate request, restarts an instance that exits without done.json
 * from its own last checkpoint, and reports every exit.
 */
export class Population {
  constructor({ popDir, launch = null, restartMax = DEFAULTS.restartMax, backoffMs = DEFAULTS.backoffMs, pollMs = DEFAULTS.pollMs, log = () => {} } = {}) {
    this.popDir = path.resolve(popDir);
    this.launch = launch || budgetLauncher();
    this.restartMax = restartMax; this.backoffBase = backoffMs; this.pollMs = pollMs; this.log = log;
    this.members = new Map(); this.timers = []; this.poller = null; this.stopping = false;
    for (const d of ['requests', 'instances', 'store', 'logs', 'budget']) mkdirSync(path.join(this.popDir, d), { recursive: true });
  }

  start() {
    if (!this.poller) this.poller = setInterval(() => this.pollRequests(), this.pollMs);
    return this;
  }

  pollRequests() {
    if (this.stopping) return;
    let names = [];
    try { names = readdirSync(path.join(this.popDir, 'requests')).filter((n) => n.endsWith('.json')); } catch { return; }
    for (const n of names) {
      const req = readJson(path.join(this.popDir, 'requests', n));
      try { rmSync(path.join(this.popDir, 'requests', n), { force: true }); } catch { /* taken */ }
      if (!req || !ID_RE.test(String(req.id)) || this.members.has(req.id)) continue;
      if (!existsSync(path.join(instanceDir(this.popDir, req.id), 'instance.json'))) continue;
      this.log('[population] request: ' + req.parent + ' duplicated into ' + req.id + ' (seed ' + req.seed + '), launching');
      this.add(req.id);
    }
  }

  add(id) {
    if (this.members.has(id)) return this.members.get(id);
    const m = { id, dir: instanceDir(this.popDir, id), attempt: 0, restarts: 0, pid: null, exits: [], done: false, gaveUp: null, backoffMs: this.backoffBase, startedAt: null, killed: [], pids: [] };
    this.members.set(id, m);
    this.spawn(m);
    return m;
  }

  spawn(m) {
    if (this.stopping) { m.done = true; m.gaveUp = 'stopping'; return; }
    m.attempt++;
    m.startedAt = Date.now();
    const h = Promise.resolve(this.launch({ id: m.id, dir: m.dir, attempt: m.attempt, popDir: this.popDir }));
    m.running = h.then(async (handle) => {
      const pid = await handle.pid;
      m.pid = pid; if (pid) m.pids.push(pid);
      this.log('[population] ' + m.id + ' started (attempt ' + m.attempt + ', pid ' + pid + ')');
      const res = await handle.done;
      this.onExit(m, res);
    }).catch((e) => this.onExit(m, { code: null, signal: null, error: firstLine(e) }));
  }

  onExit(m, res) {
    const afterS = Math.round((Date.now() - m.startedAt) / 100) / 10;
    const rec = res.record || null;
    m.pid = null;
    m.exits.push({ attempt: m.attempt, at: iso(), code: res.code, signal: res.signal, afterS, outcome: rec ? rec.outcome : null, peakRssMb: rec ? rec.peakRssMb : null, error: res.error || null });
    if (existsSync(path.join(m.dir, BRAIN_NAME, 'done.json'))) { m.done = true; this.log('[population] ' + m.id + ' ended (code ' + res.code + ', attempt ' + m.attempt + ', ' + afterS + ' s' + (rec ? ', peak ' + rec.peakRssMb + ' MB' : '') + ')'); return; }
    const inst = readJson(path.join(m.dir, 'instance.json')) || {};
    // an instance that died before it recorded its first start has spent none of its time yet
    const deadline = inst.firstStartMs ? inst.firstStartMs + (inst.wallS || 0) * 1000 : Infinity;
    const why = this.stopping ? 'stopping' : m.restarts >= this.restartMax ? 'restart cap ' + this.restartMax : Date.now() >= deadline - 2000 ? 'past its deadline' : null;
    if (why) { m.done = true; m.gaveUp = why; this.log('[population] ' + m.id + ' exited code=' + res.code + ' signal=' + res.signal + ' after ' + afterS + ' s; not restarted: ' + why); return; }
    m.restarts++;
    m.backoffMs = afterS < 10 ? Math.min(60_000, m.backoffMs * 2) : this.backoffBase;
    const meta = readJson(path.join(m.dir, BRAIN_NAME, 'meta.json'));
    this.log('[population] ' + m.id + ' exited code=' + res.code + ' signal=' + res.signal + ' after ' + afterS + ' s; restart ' + m.restarts + ' from its checkpoint t=' + (meta ? meta.t : null) + ' in ' + m.backoffMs + ' ms');
    const t = setTimeout(() => this.spawn(m), m.backoffMs);
    this.timers.push(t);
  }

  /** SIGKILL the member's current process (the supervisor restarts it). Returns the pid, or null. */
  kill(id) {
    const m = this.members.get(id);
    if (!m || !m.pid) return null;
    const pid = m.pid;
    try { process.kill(pid, 'SIGKILL'); } catch (e) { this.log('[population] kill ' + id + ' failed: ' + firstLine(e)); return null; }
    m.killed.push({ pid, at: iso() });
    return pid;
  }

  settled() { return [...this.members.values()].every((m) => m.done); }

  async waitAll({ pollMs = 250, timeoutMs = Infinity } = {}) {
    const t0 = Date.now();
    for (;;) {
      this.pollRequests();
      let pending = 0;
      try { pending = readdirSync(path.join(this.popDir, 'requests')).filter((n) => n.endsWith('.json')).length; } catch { /* none */ }
      if (this.settled() && pending === 0) break;
      if (Date.now() - t0 > timeoutMs) break;
      await sleep(pollMs);
    }
    return this.summary();
  }

  async stop() {
    this.stopping = true;
    if (this.poller) clearInterval(this.poller);
    for (const t of this.timers) clearTimeout(t);
    for (const m of this.members.values()) if (m.pid) { try { process.kill(m.pid, 'SIGKILL'); } catch { /* gone */ } }
    await Promise.all([...this.members.values()].map((m) => m.running && m.running.catch(() => {})));
  }

  summary() {
    return [...this.members.values()].map((m) => ({ id: m.id, attempts: m.attempt, restarts: m.restarts, done: m.done, gaveUp: m.gaveUp, exits: m.exits, killed: m.killed, pids: m.pids }));
  }
}

// ---------------------------------------------------------------- the entry
function parseArgs(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2); const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true; o[k] = v; } else o._.push(a);
  }
  return o;
}

async function main(argv) {
  const a = parseArgs(argv);
  const cmd = a._[0];
  if (cmd === 'instance') {
    if (!a.dir) throw new Error('instance: --dir <instance dir> is required');
    await runInstance(a.dir);
    return;
  }
  if (cmd === 'prebuild') {
    // the matrices of the suite built once into a cache dir, so no instance spends its wall time building them
    if (!a.cache) throw new Error('prebuild: --cache <dir> is required');
    const s = loadSuite({ cacheDir: path.resolve(a.cache) });
    const mu = process.memoryUsage();
    console.log('[multiply] prebuild: ' + s.seeds.length + ' searched draws and ' + s.freshSeeds.length + ' fresh draws, ' + s.cached + ' cached, ' + s.built + ' built, C=' + s.matrix.C + ' T=' + s.matrix.T + ', ' + Math.round(s.ms) + ' ms, rss ' + Math.round(mu.rss / 1048576) + ' MB');
    return;
  }
  if (cmd === 'population') {
    if (!a.dir) throw new Error('population: --dir <population dir> is required');
    const popDir = path.resolve(a.dir), seed = Number(a.seed || 1), size = Math.max(1, Number(a.size || 3)), wallS = Number(a['wall-s'] || DEFAULTS.wallS);
    const plan = Array.from({ length: size - 1 }, (_, k) => ({ id: 'i' + (k + 1), seed: String(seed + k + 1), afterExchange: k + 2 }));
    if (!existsSync(path.join(instanceDir(popDir, 'i0'), 'instance.json'))) createInstance({ popDir, id: 'i0', seed: String(seed), wallS, spawnPlan: plan });
    const pop = new Population({ popDir, log: (l) => console.log(l) }).start();
    pop.add('i0');
    const onSig = () => { pop.stop().then(() => process.exit(130)); };
    process.on('SIGINT', onSig); process.on('SIGTERM', onSig);
    const s = await pop.waitAll();
    await pop.stop();
    console.log(JSON.stringify(s, null, 2));
    return;
  }
  console.error('usage: node daemon/multiply.mjs instance --dir <popDir>/inst-<id>\n       node daemon/multiply.mjs population --dir <popDir> [--wall-s 240] [--seed 1] [--size 3]\n       node daemon/multiply.mjs prebuild --cache <dir>');
  process.exitCode = 2;
}

if (!isMainThread && workerData && workerData.multiplyPlane) planeWorkerMain(workerData.multiplyPlane);
else if (isMainThread && process.argv[1] && path.resolve(process.argv[1]) === SELF) {
  main(process.argv.slice(2)).then(() => { setTimeout(() => process.exit(process.exitCode || 0), 2000).unref(); }, (e) => { console.error('[multiply] ' + (e && e.stack || e)); process.exitCode = 1; setTimeout(() => process.exit(1), 2000).unref(); });
}
