// generations/planes.mjs: A PLANE IS ONE SIMULATION COORDINATE.
//
// generations/epochs.mjs runs ONE deep time search: one seed, one scale box, one seconds
// per tick, one archive. That is a single line through the space of searches. A plane is a
// POINT in that space, written down so it can be reproduced, compared and run in parallel
// with hundreds of its neighbours:
//
//   seed            the stream every random draw inside the plane comes from
//   world           what the organisms of this plane are being searched for. Two kinds:
//                   a POLICY world names the declared reach the organism would run under
//                   (world/policy.json is the only policy shipped, and it denies
//                   everything), and a VENUE world names a segment of a venue tape by
//                   venue, instrument count, readings per instrument and offset.
//   secondsPerTick  the declared organism-seconds one tick is worth. This is the time
//                   dilation axis: at 0.001 s/tick a tick is a millisecond of organism
//                   time, at 60 s/tick the same tick is a minute, and the years clock in
//                   generations/epochs.mjs divides by the same SECONDS_PER_YEAR either
//                   way. Nothing about the computation changes; what changes is what the
//                   run DECLARES a tick to be worth, and that declaration travels with the
//                   coordinate instead of hiding in prose.
//   epochScale      the population and the box of organism shapes the search draws from:
//                   popSize, ticks per organism, windows, and the four scale ranges
//                   (majors, subcells per major, out edges per cell, local window).
//
// WHAT THE WORLD DOES AND DOES NOT DO TODAY. The world is a coordinate axis. It enters the
// run in two places and nowhere else: it is mixed into the evaluation seed (so two planes
// that differ only in their world search different trajectories) and it carries the
// `suites` flag the evaluator is called with. A plane does NOT open a socket, read
// trader.db, arm a policy or replay a tape. It cannot: nothing here constructs a world
// cell, and world/policy.json denies every reach. A venue world's segment is therefore a
// DESCRIPTION of the tape a later bench would replay, recorded so the plane that searched
// for it can be found again, not evidence that the tape was replayed.
//
// WHAT A PLANE WRITES: nothing. checkpointEvery is 0 and emit is off, so a plane holds its
// archive in memory and returns it. Hundreds of planes running at once must not contend
// for one checkpoint directory, and the soak on state/soak must never be touched by them.
import os from 'node:os';
import { RNG, hash32 } from '../core/rng.mjs';
import { Epochs, SECONDS_PER_YEAR, DEFAULT_SECONDS_PER_TICK, gridCapacity, DESCRIPTOR_AXES } from './epochs.mjs';

export { SECONDS_PER_YEAR, DEFAULT_SECONDS_PER_TICK, gridCapacity };

// ---------------------------------------------------------------- declared ladders
// Every axis a coordinate is drawn on is a declared, finite list or range written here, so
// a reader can say what the space of planes IS without running one.

// The time dilation ladder, in organism-seconds per tick: a millisecond, a centisecond, a
// decisecond, a second, a minute, an hour, a day, a Julian year. Every rung is a
// DECLARATION of what one tick is worth to the organisms of that plane, never a
// measurement, and every years number derived from it is printed with the arithmetic
// (ticks x s/tick / SECONDS_PER_YEAR) beside it so a reader can undo the declaration.
export const SECONDS_PER_TICK_LADDER = Object.freeze([0.001, 0.01, 0.1, 1, 60, 3600, 86_400, SECONDS_PER_YEAR]);

/** The policy worlds. Only the shipped policy exists, and it denies everything. */
export const POLICY_WORLDS = Object.freeze([
  { name: 'sealed', policy: 'world/policy.json', suites: true },
  { name: 'sealed-bare', policy: 'world/policy.json', suites: false },
]);

/** The venue tape segments a venue world may name. Counts only, never a replay. */
export const VENUE_SEGMENTS = Object.freeze([
  { venue: 'pumpswap', instruments: 8, readings: 60, offset: 0 },
  { venue: 'pumpswap', instruments: 16, readings: 120, offset: 0 },
  { venue: 'pumpswap', instruments: 16, readings: 120, offset: 120 },
  { venue: 'pumpswap', instruments: 24, readings: 60, offset: 240 },
  { venue: 'synthetic', instruments: 16, readings: 40, offset: 0 },
]);

/** The box every scale range is drawn inside. Small on purpose: hundreds of planes. */
export const SCALE_BOUNDS = Object.freeze({
  majors: [8, 64],
  subcellsPerMajor: [2, 8],
  edgesPerCell: [3, 12],
  localWindow: [2, 10],
  popSize: [4, 12],
  ticksPerOrganism: [24, 96],
  windows: [2, 5],
});

/** Defaults for a plane run. `ticks` is the tick budget one plane is run for. */
export const DEFAULT_PLANE_TICKS = 2000;
/** A plane stops at whichever comes first, the tick budget or this many generations. */
export const DEFAULT_MAX_GENERATIONS = 200;

/** Workers the sweep uses when the caller names none: leave two cores for the soak and the shell. */
export function defaultWorkers() {
  const n = (os.availableParallelism ? os.availableParallelism() : os.cpus().length) - 2;
  return Math.max(1, n);
}

// ---------------------------------------------------------------- the coordinate
function span(rng, [lo, hi]) {
  // A sub range of [lo, hi], drawn low edge first so hi is never below lo.
  const a = lo + rng.int(hi - lo + 1);
  const b = a + rng.int(hi - a + 1);
  return [a, b];
}

/**
 * The coordinate of plane `index` in the sweep named by `base`. A pure function of the two:
 * the same base and index give the same coordinate in any process, on any run, which is
 * what makes a sweep over hundreds of planes reproducible without shipping a list of them.
 * @param {number} index
 * @param {object} [opts]
 * @param {string} [opts.base] the sweep name every plane seed is derived from
 * @param {number} [opts.venueShare] fraction of planes given a venue world, in [0,1]
 * @returns {object} the plane coordinate
 */
export function planeCoordinate(index, { base = 'planes', venueShare = 0.5 } = {}) {
  const i = Math.max(0, Math.floor(Number(index) || 0));
  const rng = new RNG(String(base) + ':plane:' + i);
  const world = rng.next() < venueShare
    ? { kind: 'venue', ...VENUE_SEGMENTS[rng.int(VENUE_SEGMENTS.length)], suites: true }
    : { kind: 'policy', ...POLICY_WORLDS[rng.int(POLICY_WORLDS.length)] };
  if (world.kind === 'venue') world.name = world.venue + '-' + world.instruments + 'x' + world.readings + '@' + world.offset;
  return {
    index: i,
    seed: String(base) + ':' + i,
    world,
    secondsPerTick: SECONDS_PER_TICK_LADDER[rng.int(SECONDS_PER_TICK_LADDER.length)],
    epochScale: {
      popSize: SCALE_BOUNDS.popSize[0] + rng.int(SCALE_BOUNDS.popSize[1] - SCALE_BOUNDS.popSize[0] + 1),
      ticksPerOrganism: SCALE_BOUNDS.ticksPerOrganism[0] + rng.int(SCALE_BOUNDS.ticksPerOrganism[1] - SCALE_BOUNDS.ticksPerOrganism[0] + 1),
      windows: SCALE_BOUNDS.windows[0] + rng.int(SCALE_BOUNDS.windows[1] - SCALE_BOUNDS.windows[0] + 1),
      majors: span(rng, SCALE_BOUNDS.majors),
      subcellsPerMajor: span(rng, SCALE_BOUNDS.subcellsPerMajor),
      edgesPerCell: span(rng, SCALE_BOUNDS.edgesPerCell),
      localWindow: span(rng, SCALE_BOUNDS.localWindow),
    },
  };
}

/** Every problem with a coordinate, as strings. Empty means usable. */
export function validatePlaneCoordinate(c) {
  const bad = [];
  if (!c || typeof c !== 'object') return ['not an object'];
  if (typeof c.seed !== 'string' || !c.seed) bad.push('seed must be a non empty string');
  if (!Number.isFinite(c.secondsPerTick) || c.secondsPerTick <= 0) bad.push('secondsPerTick must be a positive number');
  if (!c.world || typeof c.world !== 'object') bad.push('world missing');
  else if (c.world.kind !== 'policy' && c.world.kind !== 'venue') bad.push('world.kind must be policy or venue');
  else if (c.world.kind === 'venue' && !c.world.venue) bad.push('venue world needs a venue');
  const s = c.epochScale;
  if (!s || typeof s !== 'object') bad.push('epochScale missing');
  else {
    for (const k of ['majors', 'subcellsPerMajor', 'edgesPerCell', 'localWindow']) {
      const r = s[k];
      if (!Array.isArray(r) || r.length !== 2 || !Number.isFinite(r[0]) || !Number.isFinite(r[1]) || r[1] < r[0]) bad.push('epochScale.' + k + ' must be a [lo, hi] range with hi at or above lo');
    }
    for (const k of ['popSize', 'ticksPerOrganism', 'windows']) {
      if (!Number.isFinite(s[k]) || s[k] < 1) bad.push('epochScale.' + k + ' must be a positive number');
    }
  }
  return bad;
}

// Canonical JSON: keys sorted at every depth, so a coordinate built by two different code
// paths that set the same fields in a different ORDER still descriptors to the same text.
// Without this the descriptor would be a fingerprint of insertion order as much as of the
// coordinate, and two runs of the same plane could disagree.
function canonical(v) {
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
  }
  return JSON.stringify(v === undefined ? null : v);
}

/**
 * The descriptor of a coordinate: the canonical text, a 32 bit hash of it, and a short id.
 * The plane INDEX is deliberately left out, so the same point visited from two different
 * sweeps is recognised as the same point.
 * @param {object} c @returns {{ text: string, hash: number, id: string }}
 */
export function planeDescriptor(c) {
  const text = canonical({
    seed: c.seed,
    world: c.world,
    secondsPerTick: c.secondsPerTick,
    epochScale: c.epochScale,
  });
  const hash = hash32(text);
  return { text, hash, id: 'p' + hash.toString(16).padStart(8, '0') };
}

/** The years one plane's tick budget is worth, with the arithmetic that produced it. */
export function plannedYears(c, ticks = DEFAULT_PLANE_TICKS) {
  const organismSeconds = ticks * c.secondsPerTick;
  const years = organismSeconds / SECONDS_PER_YEAR;
  return {
    ticks, secondsPerTick: c.secondsPerTick, organismSeconds, years,
    arithmetic: ticks + ' ticks x ' + c.secondsPerTick + ' s/tick = ' + organismSeconds +
      ' organism-seconds; / ' + SECONDS_PER_YEAR + ' s/year = ' + years.toExponential(6) + ' organism-years',
  };
}

// ---------------------------------------------------------------- running one plane
/**
 * The generations of one plane, one at a time, as a generator.
 *
 * WHY A GENERATOR AND NOT TWO LOOPS. A plane used to be one synchronous loop, and that is
 * what filled the hypervector heap: a slot comes back through core/simd.mjs only at an event
 * loop turn after a collection, so a run that never yields holds every vector every organism
 * of every generation ever made. Measured on plane 296 of the 400 plane sweep, with the
 * child's planned heap of 26368 slots: inUse 6770 after generation 1, 17698 after 2, and the
 * heap FULL from generation 3 on, after which 61632 of 91743 allocation attempts fell back to
 * plain Int8Array copies (67.18 % of that plane's attempts).
 *
 * The generator is the seam. runPlane drives it to the end without stopping, exactly as the
 * old synchronous loop did, and runPlaneAsync awaits a caller hook at every yield, so the
 * CALLER owns what happens between generations (bench/planes.mjs owns the collection point,
 * which is the only place in this project allowed to call gc()). The arithmetic is in the
 * engine and is untouched by either: a yield changes no draw from the RNG.
 */
function* planeGenerations(coord, { ticks = DEFAULT_PLANE_TICKS, maxGenerations = DEFAULT_MAX_GENERATIONS, maxMs = 0, release = false, elites = false } = {}) {
  const problems = validatePlaneCoordinate(coord);
  if (problems.length) throw new Error('plane ' + (coord && coord.seed) + ': ' + problems.join('; '));
  const desc = planeDescriptor(coord);
  const s = coord.epochScale;

  const engine = new Epochs({
    // The world is mixed into the engine seed here and nowhere else: two coordinates that
    // differ only in their world are two different searches, which is the whole point of
    // the world being an axis of the coordinate.
    seed: coord.seed + '|' + coord.world.kind + ':' + (coord.world.name || coord.world.venue),
    popSize: s.popSize,
    ticks: s.ticksPerOrganism,
    windows: s.windows,
    checkpointEvery: 0,          // a plane writes nothing: see the header
    emit: false,
    suites: coord.world.suites !== false,
    secondsPerTick: coord.secondsPerTick,
    // When on, the organism an evaluation built returns its own hypervector slots the moment
    // its scores have been read. The archive keeps a genome, never a vector, so nothing the
    // generation keeps can hold one of them. Off by default so the old path is the default.
    releaseOrganisms: release,
    scale: {
      majors: s.majors, subcellsPerMajor: s.subcellsPerMajor,
      edgesPerCell: s.edgesPerCell, localWindow: s.localWindow,
    },
  }).init();

  const rssAt = () => (typeof process.memoryUsage.rss === 'function' ? process.memoryUsage.rss() : process.memoryUsage().rss);
  const rssStart = rssAt();
  let rssPeak = rssStart;
  const t0 = process.hrtime.bigint();
  const rows = [];
  let firstGenKeys = [];
  let error = null;
  let pauseNs = 0n;
  let released = 0;
  let yields = 0;

  while (engine.totalTicks < ticks && engine.generation < maxGenerations) {
    let row;
    try { row = engine.step(); } catch (e) { error = String(e && e.message ? e.message : e); break; }
    rows.push({ gen: row.gen, fill: row.fill, newCells: row.newCells, best: row.best, qd: row.qd, ms: row.ms });
    released += row.releasedSlots || 0;
    if (engine.generation === 1) firstGenKeys = engine.archive.elites().map((e) => e.key);
    const r = rssAt();
    if (r > rssPeak) rssPeak = r;
    if (maxMs && Number(process.hrtime.bigint() - t0) / 1e6 >= maxMs) break;
    // The seam between generations. runPlane resumes immediately; runPlaneAsync gives the
    // caller its hook here. The time spent suspended is measured rather than folded into the
    // plane's wall clock silently: wallMs stays the whole span and pauseMs says how much of
    // it the plane was not running.
    const tPause = process.hrtime.bigint();
    yields++;
    yield {
      plane: coord.index ?? null, descriptor: desc.id,
      gen: engine.generation, ticks: engine.totalTicks, organisms: engine.totalOrganisms,
      fill: row.fill, best: row.best, genMs: row.ms, releasedSlots: row.releasedSlots || 0,
    };
    pauseNs += process.hrtime.bigint() - tPause;
  }

  const wallMs = Number(process.hrtime.bigint() - t0) / 1e6;
  const y = engine.years();
  const best = engine.archive.best();
  const mb = (b) => Number((b / 1048576).toFixed(3));

  return {
    ok: !error, error,
    index: coord.index ?? null,
    descriptor: desc.id, hash: desc.hash,
    coordinate: coord,
    tickBudget: ticks,
    generations: engine.generation,
    organisms: engine.totalOrganisms,
    ticks: engine.totalTicks,
    secondsPerTick: coord.secondsPerTick,
    simulatedYears: y.years,
    simulatedLineageYears: y.lineageYears,
    yearsArithmetic: y.arithmetic,
    wallMs: Number(wallMs.toFixed(1)),
    // Of that wall, the part the plane spent suspended between generations (zero under
    // runPlane, which never suspends), and what the generations handed back on their own.
    pauseMs: Number((Number(pauseNs) / 1e6).toFixed(1)),
    generationYields: yields,
    releasedSlots: released,
    // rssPeak is the whole child process at its high water mark during this plane, which on
    // a worker that has already run planes includes what those planes left behind; rssDelta
    // is the rise this plane is responsible for. Both are reported because neither alone is
    // the cost of a plane.
    rssPeakMB: mb(rssPeak), rssStartMB: mb(rssStart), rssDeltaMB: mb(rssPeak - rssStart),
    archiveFillBefore: 0,        // every plane starts from an empty archive: nothing is resumed
    archiveFillAfter: engine.archive.fill(),
    archiveAdded: engine.archive.fill(),
    archiveCapacity: gridCapacity(),
    archiveStats: engine.archive.stats,
    firstGenKeys,
    finalKeys: engine.archive.elites().map((e) => e.key),
    qd: Number(engine.archive.qdScore().toFixed(6)),
    // The best elite carries its COMPONENTS, not only its scalar. Four of the five are pure
    // functions of the genome and the seed; the fifth, throughput, is cell runs per WALL
    // second, so it is the one term a busy machine can move. Without the components a rerun
    // can only be graded against a band somebody chose, and a band is where a real change in
    // the arithmetic would hide: with them, test/planes.test.mjs asserts the four exactly and
    // asserts that the whole difference in the scalar is the throughput weight times the
    // throughput difference.
    best: best ? { id: best.id, key: best.key, fitness: best.fitness, gen: best.gen, cells: best.cells, edges: best.edges, components: best.components } : null,
    // The whole grid, id by id, for a caller that wants to compare two runs cell by cell
    // rather than on the single best. Off by default: 400 planes would carry it into the
    // sweep verdict for nothing.
    elites: elites ? engine.archive.elites().map((e) => ({ key: e.key, id: e.id, gen: e.gen, fitness: e.fitness, components: e.components })) : null,
    perGeneration: rows,
    lastError: engine.lastError,
  };
}

/**
 * Run one plane for a tick budget, without stopping. Generations are run whole: the loop
 * stops on the first generation that takes the running tick total to or past `ticks`, so the
 * budget is a floor and the row reports the ticks actually run, never the budget.
 *
 * This is the synchronous driver, kept exactly as it was: it never yields to the event loop,
 * so no hypervector slot can come back inside the plane. Callers that can afford to yield
 * should use runPlaneAsync, which is what bench/planes.mjs does.
 *
 * @param {object} coord a plane coordinate
 * @param {object} [opts]
 * @param {number} [opts.ticks] the tick budget
 * @param {number} [opts.maxGenerations] hard stop, whichever comes first
 * @param {number} [opts.maxMs] wall stop, whichever comes first, 0 for none
 * @param {boolean} [opts.release] organisms return their own slots as they are discarded
 * @param {boolean} [opts.elites] carry the whole grid, id by id, in the row
 * @param {(info: object) => void} [opts.onGeneration] called between generations, SYNCHRONOUSLY:
 *   it is how the control arm of the bench records the same heap counters as the async arm
 *   without the event loop turn that would undo the very thing being measured
 * @returns {object} the plane row
 */
export function runPlane(coord, opts = {}) {
  const { onGeneration = null, ...rest } = opts;
  const it = planeGenerations(coord, rest);
  let r = it.next();
  while (!r.done) {
    if (onGeneration) onGeneration(r.value);
    r = it.next();
  }
  return r.value;
}

/**
 * The same plane, driven asynchronously: `betweenGenerations` is awaited after every
 * generation, which is where the caller may turn the event loop and collect. The plane's
 * arithmetic is identical either way, because every draw comes from the engine's own RNG and
 * a suspension takes none.
 *
 * @param {object} coord a plane coordinate
 * @param {object} [opts] every option runPlane takes, plus:
 * @param {(info: object) => (void|Promise<void>)} [opts.betweenGenerations] awaited between generations
 * @returns {Promise<object>} the plane row
 */
export async function runPlaneAsync(coord, opts = {}) {
  const { betweenGenerations = null, ...rest } = opts;
  const it = planeGenerations(coord, rest);
  let r = it.next();
  while (!r.done) {
    if (betweenGenerations) await betweenGenerations(r.value);
    r = it.next();
  }
  return r.value;
}

/** The coordinates of a whole sweep, in index order. */
export function planeSweep(count, opts = {}) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(planeCoordinate(i, opts));
  return out;
}

export { DESCRIPTOR_AXES };
