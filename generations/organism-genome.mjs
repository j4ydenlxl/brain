// generations/organism-genome.mjs: A GENOME FOR THE WHOLE ORGANISM.
//
// generations/genome.mjs evolves a circuit: twenty cells and twenty edges wired by hand,
// scored on one small task. That is a race car. This file evolves the ANIMAL: the region
// plan itself. Its genes are the things seeds/organism.mjs reads when it grows a brain,
// plus the things that can only be set once the brain exists.
//
//   scale genes       majors, subcells per major, out edges attempted per cell, the width
//                     of the regional window a local axon may reach across
//   region genes      per region: its share of the majors, the mix of cell kinds its
//                     majors are built from, the mix of periods its cells run at, a delay
//                     scale on every edge leaving it, and the fraction of its cells that
//                     carry a local learning rule
//
// A build here is two steps:
//
//   1. a region table is BUILT from the genes (each entry of the exported REGIONS table
//      copied, with the gene's share and a roster expanded from the gene's kind mix) and
//      handed to buildOrganism as its `regions` argument, along with the scale genes,
//   2. the period mix, the delay scales and the learning policy are applied to the built
//      brain through the public clock and connectome, which is the only place they can be
//      applied at all: a period is registered in the tick wheel at addCell time.
//
// Step 1 used to be a patch of somebody else's module level table, written into REGIONS
// and put back in a finally, which meant no two organisms could be grown at the same time
// in one process. seeds/organism.mjs takes a `regions` option now (notes/generations.md
// request 4, granted), so nothing here writes to the exported table and the test builds
// two organisms with different rosters in one process to say so.
//
// SCORING. Multi objective, every component returned, none of them hidden inside a scalar:
//
//   predictionDrop  mean surprise over the predictor cells in the first window of ticks
//                   against the last window. Falling error scores; flat or rising does not.
//   taskScore       the suites of tasks/index.mjs whose cell kinds this organism CONTAINS.
//                   The suite runs on its own brain, not inside the organism, so what this
//                   measures is whether the organism holds the machinery a suite needs and
//                   how well that machinery scores. It is a function of the organism's kind
//                   set and nothing else, which is why it is cached by that kind set.
//   throughput      cell runs per wall second of ticking.
//   cost            cells plus edges.
//   novelty         distance from this organism's behaviour descriptor to the nearest one
//                   an archive has already seen. Supplied by the caller, never computed
//                   from the organism alone.
//
// The scalar `fitness` is a declared weighted sum of the five, and the weights are exported
// so a reader can recompute it from the components by hand.
//
// FOUR OF THE FIVE ARE DETERMINISTIC. prediction, task, cost and novelty are a pure
// function of the genome, the seed and the archive that was passed in. throughput is cell
// runs per WALL second and is therefore not reproducible: the same genome scored twice can
// differ in the last places of the scalar, and on a tie that decides which of two organisms
// holds a cell of the archive. That is a real property of measuring speed, not a bug to be
// papered over with a fixed clock, and the test asserts the four exactly and the fifth to a
// band rather than asserting a determinism the measurement cannot have.
import { buildOrganism, REGIONS } from '../seeds/organism.mjs';
import { SEC, MIN, HOUR } from '../core/clock.mjs';
import { RNG } from '../core/rng.mjs';
import { getKind } from '../core/cell.mjs';
import { releaseAll } from '../core/signal.mjs';
import { slotOf } from '../core/simd.mjs';
import { algebraSuite, sequenceSuite, gridSuite, venueSuite, buildAlgebraBrain, buildSequenceBrain, SEARCH_OPS, VENUE_KINDS_NEEDED } from '../tasks/index.mjs';
// The venue cell kinds are defined in world/venue.mjs, not in cells/index.mjs, so the
// module that puts them in a region roster is the module that has to make sure they are
// registered: validateOrganismGenome calls getKind on every kind a mix names.
import '../world/venue.mjs';

// ---------------------------------------------------------------- the gene space
// Every bound here is a hard bound: no mutation and no crossover may leave the box, so a
// genome that came out of this module is always one buildOrganism can grow.
export const BOUNDS = Object.freeze({
  majors: [14, 20000],
  subcellsPerMajor: [2, 24],
  edgesPerCell: [2, 32],
  localWindow: [1, 64],
  share: [0.02, 0.60],
  kindWeight: [0, 8],
  delayScale: [0.25, 4],
  learnProb: [0, 0.9],
  // Long enough that the default mix, every kind weighted 1, gives every kind of the
  // longest roster at least one slot. The longest roster is perception: 16 kinds in
  // seeds/organism.mjs (ten encoders plus the six grid kinds that made the grid suite
  // hostable), plus the one venue kind VENUE_ROSTER adds below, so 17. Cognitive is 15
  // with seq.fit, motor is 10 with the two venue kinds. A shorter value here would
  // silently drop kinds from the default genome, and a suite would then be ineligible for
  // a reason that was an artefact of this constant rather than a gene anybody chose. Any
  // roster that grows past 17 must move this number with it.
  rosterLength: 17,
});

// The periods a cell may be given, in the units core/clock.mjs declares (one tick is one
// millisecond of organism time). 'event' means the cell runs when mail arrives.
export const PERIOD_SLOTS = Object.freeze(['event', 1, SEC, MIN, HOUR]);

// Kinds that write cell.stats.surprise when they run. The prediction term is the mean of
// this set and of nothing else: averaging surprise over cells that never write it would
// divide a real number by a count of zeros and report a fall that was only dilution.
export const PREDICTOR_KINDS = Object.freeze(['predict.next', 'liquid.cfc', 'reservoir.echo', 'anomaly.zscore', 'plan.rollout']);

// The declared weights of the scalar. fitness = sum(weight * component), components in [0,1].
export const OBJECTIVE_WEIGHTS = Object.freeze({
  prediction: 0.30, task: 0.28, throughput: 0.16, cost: 0.10, novelty: 0.16,
});

// Cost reference: the organism against which a cost of 1/2 is scored. 5000 majors of 8
// cells with 12 out edges each is the organism seeds/organism.mjs grows by default.
export const COST_REFERENCE = 40000 + 440578;

// THE VENUE ROSTER. seeds/organism.mjs is not this session's to write to, and the three
// cell kinds the venue suite's solver path is made of live in world/venue.mjs rather than
// in cells/index.mjs, so they are added to the gene space HERE and nowhere else: the
// exported REGIONS table is never written, and a caller of buildOrganism that does not
// come through this module grows exactly what it grew before.
//
// Where each one goes is the placement world/venue.mjs argues for: a market reading is a
// perception, and deciding to act on it is motor, along with the book that fills the order.
// A grown cell of any of the three is inert on its own: sense.venue with no tape refuses
// once and then emits nothing, world.venue with no armed venue policy refuses every order
// it is handed, and venue.trader emits nothing until it is shown a reading.
const VENUE_ROSTER = Object.freeze({
  perception: Object.freeze(['sense.venue']),
  motor: Object.freeze(['world.venue', 'venue.trader']),
});

const REGION_NAMES = Object.freeze(REGIONS.map((r) => r.name));
const ROSTERS = Object.freeze(Object.fromEntries(REGIONS.map((r) => [r.name, Object.freeze([...r.roster, ...(VENUE_ROSTER[r.name] || [])])])));

/** @returns {string[]} the region names a genome carries, in the order seeds declares them */
export function regionNames() { return [...REGION_NAMES]; }
/** @param {string} region @returns {string[]} the kinds that region's majors may be built from */
export function rosterOf(region) { return [...(ROSTERS[region] || [])]; }

// ---------------------------------------------------------------- construction
/**
 * The genome of the organism seeds/organism.mjs grows by default: every share as declared,
 * every kind of a roster weighted 1, the period mix seeds uses, no delay scaling.
 * @param {object} [opts]
 * @returns {object} an organism genome
 */
export function defaultOrganismGenome({ id = 'og-0', seed = 'organism', majors = 5000, subcellsPerMajor = 8, edgesPerCell = 12, localWindow = 8 } = {}) {
  const regions = {};
  for (const r of REGIONS) {
    regions[r.name] = {
      share: r.share,
      // ROSTERS, not r.roster: the default genome weights every kind the GENE SPACE has
      // for this region, which is the seeds roster plus whatever VENUE_ROSTER added. A
      // default that skipped them would make the venue suite unreachable for every genome
      // nobody had mutated, and the task denominator would then be counting a suite the
      // default organism was never eligible for.
      kindMix: Object.fromEntries(ROSTERS[r.name].map((k) => [k, 1])),
      periodMix: { event: 0.68, 1: 0.12, [SEC]: 0.10, [MIN]: 0.06, [HOUR]: 0.04 },
      delayScale: 1,
      learnProb: 0.25,
    };
  }
  return {
    v: 1, id, seed: String(seed),
    scale: {
      majors: clampInt(majors, BOUNDS.majors), subcellsPerMajor: clampInt(subcellsPerMajor, BOUNDS.subcellsPerMajor),
      edgesPerCell: clampInt(edgesPerCell, BOUNDS.edgesPerCell), localWindow: clampInt(localWindow, BOUNDS.localWindow),
    },
    regions,
    meta: { gen: 0, parents: [], mutations: [], born: 0 },
  };
}

/**
 * A genome drawn at random inside the bounds. Used to seed generation zero with something
 * other than one point, so the archive has spread before the first mutation.
 * @param {RNG} rng
 * @param {object} [opts] scale ranges to draw inside, defaults to a small organism
 * @returns {object}
 */
export function randomOrganismGenome(rng, { id = 'og-r', seed = 'organism', majors = [16, 64], subcellsPerMajor = [3, 8], edgesPerCell = [4, 14], localWindow = [2, 12] } = {}) {
  const g = defaultOrganismGenome({ id, seed });
  g.scale.majors = clampInt(majors[0] + rng.int(majors[1] - majors[0] + 1), BOUNDS.majors);
  g.scale.subcellsPerMajor = clampInt(subcellsPerMajor[0] + rng.int(subcellsPerMajor[1] - subcellsPerMajor[0] + 1), BOUNDS.subcellsPerMajor);
  g.scale.edgesPerCell = clampInt(edgesPerCell[0] + rng.int(edgesPerCell[1] - edgesPerCell[0] + 1), BOUNDS.edgesPerCell);
  g.scale.localWindow = clampInt(localWindow[0] + rng.int(localWindow[1] - localWindow[0] + 1), BOUNDS.localWindow);
  for (const name of REGION_NAMES) {
    const r = g.regions[name];
    r.share = clamp(r.share * (0.5 + rng.next()), BOUNDS.share);
    for (const k of Object.keys(r.kindMix)) r.kindMix[k] = clamp(rng.next() * 4, BOUNDS.kindWeight);
    if (!Object.values(r.kindMix).some((w) => w > 0.05)) r.kindMix[Object.keys(r.kindMix)[0]] = 1;
    r.periodMix = normalizeMix(Object.fromEntries(PERIOD_SLOTS.map((p) => [p, rng.next()])));
    r.delayScale = clamp(0.5 + rng.next() * 2, BOUNDS.delayScale);
    r.learnProb = clamp(rng.next() * 0.6, BOUNDS.learnProb);
  }
  return normalizeOrganismGenome(g);
}

/** Deep copy. @param {object} g @returns {object} */
export function cloneOrganismGenome(g) {
  const regions = {};
  for (const [name, r] of Object.entries(g.regions)) {
    regions[name] = { share: r.share, kindMix: { ...r.kindMix }, periodMix: { ...r.periodMix }, delayScale: r.delayScale, learnProb: r.learnProb };
  }
  return {
    v: 1, id: g.id, seed: g.seed, scale: { ...g.scale }, regions,
    meta: { ...g.meta, parents: [...(g.meta?.parents || [])], mutations: [...(g.meta?.mutations || [])] },
  };
}

/** JSON round trip. The genome is already plain data; this stamps and deep copies it. */
export function organismGenomeToJSON(g) { return cloneOrganismGenome(g); }
export function organismGenomeFromJSON(j) {
  if (!j || j.v !== 1) throw new Error('organism genome: unknown serialized version ' + (j && j.v));
  const g = cloneOrganismGenome(j);
  const problems = validateOrganismGenome(g);
  if (problems.length) throw new Error('organism genome: invalid on load: ' + problems.join('; '));
  return g;
}

// Put a genome back inside its bounds: integers integral, shares and mixes positive and
// summing to one, every region present, every kind of a region's roster present.
export function normalizeOrganismGenome(g) {
  g.scale.majors = clampInt(g.scale.majors, BOUNDS.majors);
  g.scale.subcellsPerMajor = clampInt(g.scale.subcellsPerMajor, BOUNDS.subcellsPerMajor);
  g.scale.edgesPerCell = clampInt(g.scale.edgesPerCell, BOUNDS.edgesPerCell);
  g.scale.localWindow = clampInt(g.scale.localWindow, BOUNDS.localWindow);
  for (const name of REGION_NAMES) {
    const r = g.regions[name] || (g.regions[name] = { share: 0.1, kindMix: {}, periodMix: {}, delayScale: 1, learnProb: 0.25 });
    r.share = clamp(Number.isFinite(r.share) ? r.share : 0.1, BOUNDS.share);
    const mix = {};
    for (const k of ROSTERS[name]) mix[k] = clamp(Number.isFinite(r.kindMix[k]) ? r.kindMix[k] : 0, BOUNDS.kindWeight);
    if (!Object.values(mix).some((w) => w > 0.05)) mix[ROSTERS[name][0]] = 1;
    r.kindMix = mix;
    r.periodMix = normalizeMix(r.periodMix);
    r.delayScale = clamp(Number.isFinite(r.delayScale) ? r.delayScale : 1, BOUNDS.delayScale);
    r.learnProb = clamp(Number.isFinite(r.learnProb) ? r.learnProb : 0, BOUNDS.learnProb);
  }
  for (const name of Object.keys(g.regions)) if (!REGION_NAMES.includes(name)) delete g.regions[name];
  return g;
}

/**
 * Structural problems that would make buildFromOrganismGenome throw or grow a brain with a
 * region that has no majors. Returns a list; empty is good.
 * @param {object} g
 * @returns {string[]}
 */
export function validateOrganismGenome(g) {
  const p = [];
  if (!g || g.v !== 1) return ['not an organism genome'];
  for (const [key, range] of [['majors', BOUNDS.majors], ['subcellsPerMajor', BOUNDS.subcellsPerMajor], ['edgesPerCell', BOUNDS.edgesPerCell], ['localWindow', BOUNDS.localWindow]]) {
    const v = g.scale?.[key];
    if (!Number.isInteger(v)) p.push('scale.' + key + ' is not an integer: ' + v);
    else if (v < range[0] || v > range[1]) p.push('scale.' + key + ' ' + v + ' outside [' + range[0] + ', ' + range[1] + ']');
  }
  for (const name of REGION_NAMES) {
    const r = g.regions?.[name];
    if (!r) { p.push('no genes for region ' + name); continue; }
    if (!(r.share > 0)) p.push(name + '.share is not positive: ' + r.share);
    const live = Object.entries(r.kindMix || {}).filter(([, w]) => w > 0.05);
    if (!live.length) p.push(name + '.kindMix has no kind with weight above 0.05');
    for (const [k] of live) {
      if (!ROSTERS[name].includes(k)) p.push(name + '.kindMix names ' + k + ', which is not in that region roster');
      else { try { getKind(k); } catch { p.push(name + '.kindMix names unknown kind ' + k); } }
    }
    const psum = Object.values(r.periodMix || {}).reduce((a, v) => a + (Number.isFinite(v) ? Math.max(0, v) : 0), 0);
    if (!(psum > 0)) p.push(name + '.periodMix sums to ' + psum);
    for (const k of Object.keys(r.periodMix || {})) if (!PERIOD_SLOTS.map(String).includes(String(k))) p.push(name + '.periodMix names unknown period ' + k);
  }
  return p;
}

// ---------------------------------------------------------------- mutation
export const MUTATION_KINDS = Object.freeze(['majors', 'subcells', 'edges', 'window', 'share', 'kindMix', 'periodMix', 'delay', 'learn']);

/**
 * Mutate a genome. Always changes at least one gene: the operator list is shuffled and the
 * function keeps applying operators until one of them actually moved a number, so a draw
 * that landed on a gene already at its bound does not silently return a copy.
 * @param {object} genome
 * @param {RNG} rng
 * @param {object} [opts] { rate: expected operators applied, id: the child id }
 * @returns {object} a new genome
 */
export function mutateOrganismGenome(genome, rng, { rate = 2, id = null } = {}) {
  const g = cloneOrganismGenome(genome);
  g.id = id || (genome.id + '.m' + (rng.u32() % 100000));
  g.meta = { ...g.meta, parents: [genome.id], mutations: [] };
  const order = rng.shuffle([...MUTATION_KINDS]);
  const want = Math.max(1, Math.round(rate));
  let applied = 0;
  for (let pass = 0; pass < 3 && applied < want; pass++) {
    for (const op of order) {
      if (applied >= want && pass > 0) break;
      const note = applyMutation(g, op, rng);
      if (note) { g.meta.mutations.push(note); applied++; }
      if (applied >= want) break;
    }
  }
  if (!applied) {
    // Every operator was at a bound. Force the one gene that always has room: the id of
    // the region whose share is furthest from the top of its range.
    const name = REGION_NAMES.slice().sort((a, b) => g.regions[a].share - g.regions[b].share)[0];
    const before = g.regions[name].share;
    g.regions[name].share = clamp(before * 1.1 + 0.01, BOUNDS.share);
    g.meta.mutations.push('share:' + name + ':forced');
  }
  return normalizeOrganismGenome(g);
}

function applyMutation(g, op, rng) {
  const region = () => REGION_NAMES[rng.int(REGION_NAMES.length)];
  switch (op) {
    case 'majors': return bump(g.scale, 'majors', BOUNDS.majors, rng, 0.35, true) && 'majors=' + g.scale.majors;
    case 'subcells': return bump(g.scale, 'subcellsPerMajor', BOUNDS.subcellsPerMajor, rng, 0.35, true) && 'subcells=' + g.scale.subcellsPerMajor;
    case 'edges': return bump(g.scale, 'edgesPerCell', BOUNDS.edgesPerCell, rng, 0.35, true) && 'edges=' + g.scale.edgesPerCell;
    case 'window': return bump(g.scale, 'localWindow', BOUNDS.localWindow, rng, 0.4, true) && 'window=' + g.scale.localWindow;
    case 'share': { const n = region(); return bump(g.regions[n], 'share', BOUNDS.share, rng, 0.3, false) && 'share:' + n; }
    case 'delay': { const n = region(); return bump(g.regions[n], 'delayScale', BOUNDS.delayScale, rng, 0.35, false) && 'delay:' + n; }
    case 'learn': { const n = region(); return bump(g.regions[n], 'learnProb', BOUNDS.learnProb, rng, 0.4, false) && 'learn:' + n; }
    case 'kindMix': {
      const n = region(), roster = ROSTERS[n];
      const k = roster[rng.int(roster.length)];
      const before = g.regions[n].kindMix[k];
      const after = clamp(rng.next() < 0.2 ? 0 : before * (0.4 + rng.next() * 1.8) + rng.next() * 0.3, BOUNDS.kindWeight);
      if (Math.abs(after - before) < 1e-9) return null;
      g.regions[n].kindMix[k] = after;
      if (!Object.values(g.regions[n].kindMix).some((w) => w > 0.05)) { g.regions[n].kindMix[k] = before || 1; return null; }
      return 'kind:' + n + '/' + k;
    }
    case 'periodMix': {
      const n = region();
      const slot = String(PERIOD_SLOTS[rng.int(PERIOD_SLOTS.length)]);
      const mix = { ...g.regions[n].periodMix };
      const before = mix[slot] ?? 0;
      mix[slot] = Math.max(0, before * (0.3 + rng.next() * 2) + rng.next() * 0.1);
      const next = normalizeMix(mix);
      if (Math.abs((next[slot] ?? 0) - (g.regions[n].periodMix[slot] ?? 0)) < 1e-9) return null;
      g.regions[n].periodMix = next;
      return 'period:' + n + '/' + slot;
    }
    default: return null;
  }
}

function bump(obj, key, range, rng, strength, integer) {
  const before = obj[key];
  const factor = 1 + rng.gauss() * strength;
  let after = integer ? Math.round(before * factor) : before * factor;
  if (integer && after === before) after = before + (rng.next() < 0.5 ? -1 : 1);
  after = integer ? clampInt(after, range) : clamp(after, range);
  if (integer ? after === before : Math.abs(after - before) < 1e-12) return false;
  obj[key] = after;
  return true;
}

// ---------------------------------------------------------------- crossover
/**
 * Uniform crossover at the gene level: every scale gene and every region's gene block is
 * taken whole from one parent or the other, and the numeric genes of a region block are
 * blended when the coin says so. Whole blocks travel together because a kind mix and the
 * share that decides how many majors draw from it are one trait, not two.
 * @param {object} a @param {object} b @param {RNG} rng @param {object} [opts]
 * @returns {object} a valid genome
 */
export function crossoverOrganismGenomes(a, b, rng, { id = null } = {}) {
  const g = cloneOrganismGenome(a);
  g.id = id || (a.id + 'x' + b.id.slice(-4) + '.' + (rng.u32() % 100000));
  g.meta = { ...g.meta, parents: [a.id, b.id], mutations: [] };
  for (const key of ['majors', 'subcellsPerMajor', 'edgesPerCell', 'localWindow']) {
    g.scale[key] = rng.next() < 0.5 ? a.scale[key] : b.scale[key];
  }
  for (const name of REGION_NAMES) {
    const ra = a.regions[name], rb = b.regions[name];
    if (!rb) continue;
    const roll = rng.next();
    if (roll < 0.4) g.regions[name] = { share: ra.share, kindMix: { ...ra.kindMix }, periodMix: { ...ra.periodMix }, delayScale: ra.delayScale, learnProb: ra.learnProb };
    else if (roll < 0.8) g.regions[name] = { share: rb.share, kindMix: { ...rb.kindMix }, periodMix: { ...rb.periodMix }, delayScale: rb.delayScale, learnProb: rb.learnProb };
    else {
      // blend: the arithmetic mean of both parents' numbers, gene by gene
      const mix = {};
      for (const k of ROSTERS[name]) mix[k] = ((ra.kindMix[k] ?? 0) + (rb.kindMix[k] ?? 0)) / 2;
      const per = {};
      for (const p of PERIOD_SLOTS) per[p] = ((ra.periodMix[p] ?? 0) + (rb.periodMix[p] ?? 0)) / 2;
      g.regions[name] = {
        share: (ra.share + rb.share) / 2, kindMix: mix, periodMix: per,
        delayScale: (ra.delayScale + rb.delayScale) / 2, learnProb: (ra.learnProb + rb.learnProb) / 2,
      };
    }
  }
  return normalizeOrganismGenome(g);
}

// ---------------------------------------------------------------- building
/**
 * Grow the organism this genome describes.
 *
 * The region table handed to buildOrganism is BUILT here from the genes and is a fresh
 * object per call. The exported REGIONS table of seeds/organism.mjs is read and never
 * written, so two organisms with different rosters may be grown in one process.
 *
 * @param {object} genome
 * @param {object} [opts] { name, seed, ledger, growth, gate }
 * @returns {{ brain: object, buildMs: number, roster: object }}
 */
export function buildFromOrganismGenome(genome, { name = null, seed = null, ledger = 'off', growth = { threshold: Number.MAX_SAFE_INTEGER }, gate = {} } = {}) {
  const g = normalizeOrganismGenome(cloneOrganismGenome(genome));
  const rosters = {};
  const regions = REGIONS.map((r) => {
    const gene = g.regions[r.name];
    const roster = expandRoster(gene.kindMix, ROSTERS[r.name]);
    rosters[r.name] = roster;
    return { ...r, share: gene.share, roster };
  });
  const t0 = process.hrtime.bigint();
  const brain = buildOrganism({
    majors: g.scale.majors, subcellsPerMajor: g.scale.subcellsPerMajor,
    edgesPerCell: g.scale.edgesPerCell, localWindow: g.scale.localWindow, regions,
    seed: g.seed + ':' + (seed || g.id), name: name || g.id, ledger, growth, gate,
  });
  applyPeriodAndPolicyGenes(brain, g);
  applyDelayGenes(brain, g);
  brain.organismGenome = g;
  return { brain, buildMs: Number(process.hrtime.bigint() - t0) / 1e6, roster: rosters };
}

/**
 * A kind mix is a weight per kind. A roster is a list buildOrganism cycles through. This
 * turns the first into the second by largest remainder over a fixed length, so a kind with
 * twice the weight gets twice the slots and the result is a pure function of the mix.
 * @param {object} kindMix @param {string[]} roster @returns {string[]}
 */
export function expandRoster(kindMix, roster) {
  const live = roster.filter((k) => (kindMix[k] ?? 0) > 0.05);
  if (!live.length) return [roster[0]];
  const total = live.reduce((a, k) => a + kindMix[k], 0);
  const L = BOUNDS.rosterLength;
  const raw = live.map((k) => (kindMix[k] / total) * L);
  const slots = raw.map(Math.floor);
  let left = L - slots.reduce((a, v) => a + v, 0);
  const order = raw.map((v, i) => [v - slots[i], i]).sort((x, y) => y[0] - x[0] || x[1] - y[1]);
  for (let i = 0; left > 0; i++, left--) slots[order[i % order.length][1]]++;
  const out = [];
  for (let i = 0; i < live.length; i++) for (let s = 0; s < slots[i]; s++) out.push(live[i]);
  return out.length ? out : [live[0]];
}

// Re-draw every non clock cell's period from its region's period mix, and re-roll the local
// learning rule at the region's learnProb. A period lives in the tick wheel, so the cell is
// unregistered and registered again rather than having its policy written behind the clock.
function applyPeriodAndPolicyGenes(brain, g) {
  const rng = new RNG(g.seed + ':periods:' + g.id);
  for (const cell of brain.cells) {
    const gene = g.regions[cell.region];
    if (!gene) continue;
    // The homeostasis clock circuit is the organism's time base and is left alone: every
    // other periodic cell in the organism is a multiple of one of its drivers.
    if (cell.region === 'homeostasis' && isClockCircuit(brain, cell)) continue;
    const driver = getKind(cell.kind).ports.in.length === 0;
    const want = pickPeriod(rng, gene.periodMix, driver);
    if (want !== cell.policy.period) {
      brain.clock.unregister(cell);
      cell.policy.period = want;
      brain.clock.register(cell);
    }
    cell.policy.learn = rng.next() < gene.learnProb ? 'hebbian' : null;
  }
}

// A cell with no in ports can never be woken by mail, so a driver never gets 'event'.
function pickPeriod(rng, mix, driver) {
  const slots = PERIOD_SLOTS.filter((p) => !(driver && p === 'event'));
  let total = 0;
  for (const p of slots) total += Math.max(0, mix[p] ?? 0);
  if (!(total > 0)) return driver ? 1 : 'event';
  let r = rng.next() * total;
  for (const p of slots) { r -= Math.max(0, mix[p] ?? 0); if (r <= 0) return p; }
  return slots[slots.length - 1];
}

function isClockCircuit(brain, cell) {
  const c = brain.circuits.get(cell.region + '/' + cell.circuit);
  return !!(c && c.doc && c.doc.startsWith('the homeostasis clock'));
}

// Scale every edge's delay by the delayScale gene of the region its SOURCE cell sits in.
// Delay is not part of port legality, so this cannot make a legal connectome illegal. An
// edge inside one major was wired with delay 0 and stays at 0: scaling zero is zero, which
// is the right answer, a circuit talks to itself within the tick.
function applyDelayGenes(brain, g) {
  const k = brain.connectome;
  for (let e = 0; e < k.n; e++) {
    const scale = g.regions[brain.cells[k.src[e]].region]?.delayScale ?? 1;
    if (scale === 1) continue;
    k.delay[e] = Math.max(0, Math.round(k.delay[e] * scale));
  }
}

// ---------------------------------------------------------------- behaviour descriptors
/**
 * Four numbers that say what an organism DOES, not how good it is. These are the axes of
 * the MAP-Elites archive, so two organisms with the same fitness and different behaviour
 * both survive.
 *
 *   regionEntropy  Shannon entropy of the share of cell firings each region took, over
 *                  log(regions), so 1 means every region carried the same load and 0 means
 *                  one region did everything.
 *   meanDelay      mean edge delay in ticks over the live connectome.
 *   firingFraction distinct cells that fired at least once, over cells.
 *   kindEntropy    Shannon entropy of the kind histogram over log(distinct kinds present).
 *
 * @param {object} brain @param {object} trace the counters the tick loop collected
 * @returns {{ regionEntropy, meanDelay, firingFraction, kindEntropy }}
 */
export function behaviourDescriptors(brain, trace) {
  const perRegion = [];
  for (const name of REGION_NAMES) perRegion.push(trace.firesByRegion.get(name) || 0);
  const kinds = new Map();
  for (const c of brain.cells) kinds.set(c.kind, (kinds.get(c.kind) || 0) + 1);
  const k = brain.connectome;
  let delaySum = 0;
  for (let e = 0; e < k.n; e++) delaySum += k.delay[e];
  return {
    regionEntropy: normalizedEntropy(perRegion),
    meanDelay: k.n ? delaySum / k.n : 0,
    firingFraction: brain.cells.length ? trace.distinctFired / brain.cells.length : 0,
    kindEntropy: normalizedEntropy([...kinds.values()]),
  };
}

/** @param {object} d @returns {number[]} the descriptor as a vector, in a fixed order */
export function descriptorVector(d) { return [d.regionEntropy, Math.log10(1 + d.meanDelay), d.firingFraction, d.kindEntropy]; }

export function normalizedEntropy(counts) {
  const live = counts.filter((c) => c > 0);
  const total = live.reduce((a, c) => a + c, 0);
  if (!total || live.length < 2) return 0;
  let h = 0;
  for (const c of live) { const p = c / total; h -= p * Math.log(p); }
  return h / Math.log(live.length);
}

// ---------------------------------------------------------------- the task suites
// A suite's solver names the kinds that suite needs. An organism that contains all of them
// can host that suite; one that does not, cannot, and scores nothing for it. The suite then
// runs on its own brain, so its score is a function of the KIND SET and nothing else, which
// is why one run per eligible set is cached and reused.
//
// The denominator is HOSTABLE, not the number of suites. Two of the three suites used to
// name kinds that no region roster of seeds/organism.mjs carried at all (`seq.fit` for
// sequence, the `grid.*` family for grid): no genome could ever host them, and dividing
// by three would publish a ceiling of one third and call it a score. That is history:
// seeds/organism.mjs carries the grid family in the perception roster and seq.fit in the
// cognitive roster now (notes/generations.md request 6, granted), so the denominator moved
// on its own with no change to this function. hostableSuites() is still computed from the
// union of the rosters, so it is what the gene space can actually reach that decides, and a
// suite the vocabulary cannot reach is still reported by name with the kinds it wants.
//
// The venue suite arrived the same way and on purpose: its three kinds are in the gene
// space because VENUE_ROSTER above put them there, so the denominator moved from three to
// four by a roster edit, and hostableSuites() worked out the rest on its own.
const SUITE_DEFS = [
  { name: 'algebra', suite: algebraSuite, kinds: () => kindsOfBrain(buildAlgebraBrain({ name: 'kinds.algebra', ledger: 'off' })), counts: { decimalCompare: 6, decimalSum: 5, bigintMul: 5, fractionArith: 5, nestedEval: 5, power: 4, linearSolve: 6 } },
  { name: 'sequence', suite: sequenceSuite, kinds: () => kindsOfBrain(buildSequenceBrain({ name: 'kinds.sequence', ledger: 'off' })), counts: { arithmetic: 5, geometric: 4, periodic: 4, recurrence: 4, polynomial: 5 } },
  { name: 'grid', suite: gridSuite, kinds: () => new Set(SEARCH_OPS.map((o) => o.kind).filter(Boolean)), counts: { depth1: 4, depth2: 4, depth3: 4 } },
  // The venue suite names its three kinds itself (tasks/venue.mjs VENUE_KINDS_NEEDED)
  // rather than being read off a brain, for the same reason the grid suite does: its
  // solver GROWS the cells it needs through attachVenue, so there is no standing brain to
  // take a kind set from. Its accuracy is the share of windows the brain beat its own
  // matched random control on, so a score of zero here is a suite that did not beat a
  // coin, not a suite that was skipped: a skipped suite is reported by name in `skipped`.
  { name: 'venue', suite: venueSuite, kinds: () => new Set(VENUE_KINDS_NEEDED), counts: { windows: 4, readings: 20 } },
];
let SUITE_KINDS = null, HOSTABLE = null;
const SUITE_CACHE = new Map();

function kindsOfBrain(built) {
  const brain = built && built.brain ? built.brain : built;
  return new Set((brain.cells || []).map((c) => c.kind));
}

/** @returns {Map<string, Set<string>>} suite name -> the cell kinds its solver is made of */
export function suiteKinds() {
  if (SUITE_KINDS) return SUITE_KINDS;
  SUITE_KINDS = new Map();
  for (const d of SUITE_DEFS) {
    let set;
    try { set = d.kinds(); } catch { set = new Set(); }
    SUITE_KINDS.set(d.name, set);
  }
  return SUITE_KINDS;
}

/** The union of every region roster: every kind any genome in this gene space can contain. */
export function rosterVocabulary() {
  const all = new Set();
  for (const name of REGION_NAMES) for (const k of ROSTERS[name]) all.add(k);
  return all;
}

/**
 * The suites whose kinds are all inside the roster vocabulary, so some genome could host
 * them. This, not the suite count, is the denominator of the task score.
 * @returns {{ hostable: string[], unreachable: {suite: string, missing: string[]}[] }}
 */
export function hostableSuites() {
  if (HOSTABLE) return HOSTABLE;
  const vocab = rosterVocabulary(), wanted = suiteKinds();
  const hostable = [], unreachable = [];
  for (const d of SUITE_DEFS) {
    const need = wanted.get(d.name);
    const missing = [...need].filter((k) => !vocab.has(k));
    if (need.size && !missing.length) hostable.push(d.name);
    else unreachable.push({ suite: d.name, missing: need.size ? missing : ['(the solver declares no fixed kinds)'] });
  }
  HOSTABLE = { hostable, unreachable };
  return HOSTABLE;
}

/**
 * Score the suites this organism's kind set can host.
 * @param {Set<string>} kindSet the kinds present in the organism
 * @param {object} [opts] { seed }
 * @returns {{ score, eligible, skipped, unreachable, coverage, perSuite, denominator }}
 */
export function scoreSuitesFor(kindSet, { seed = 'epoch' } = {}) {
  const wanted = suiteKinds();
  const { hostable, unreachable } = hostableSuites();
  const eligible = [], skipped = [];
  let covered = 0, total = 0;
  for (const name of hostable) {
    const need = wanted.get(name);
    total += need.size;
    let have = 0;
    for (const k of need) if (kindSet.has(k)) have++;
    covered += have;
    if (have === need.size) eligible.push(name); else skipped.push(name);
  }
  const key = eligible.join(',') + '|' + seed;
  let perSuite = SUITE_CACHE.get(key);
  if (!perSuite) {
    perSuite = {};
    for (const d of SUITE_DEFS) {
      if (!eligible.includes(d.name)) { perSuite[d.name] = null; continue; }
      const report = d.suite.run({ seed: seed + '/' + d.name, counts: d.counts }).report;
      perSuite[d.name] = Number(report.accuracy.toFixed(6));
    }
    SUITE_CACHE.set(key, perSuite);
  }
  const scored = Object.values(perSuite).filter((v) => v !== null);
  const denominator = Math.max(1, hostable.length);
  return {
    score: scored.reduce((a, v) => a + v, 0) / denominator,
    eligible, skipped, unreachable, denominator,
    coverage: total ? covered / total : 0, perSuite,
  };
}

/** Drop the memoised suite runs. The tests call this so one test cannot pay for another. */
export function clearSuiteCache() { SUITE_CACHE.clear(); }

// ---------------------------------------------------------------- evaluation
/**
 * Build the organism, tick it, and score it on five components.
 *
 * @param {object} genome
 * @param {object} [opts]
 * @param {number} [opts.ticks] total ticks to run
 * @param {number} [opts.windows] windows the ticks are split into; the prediction term
 *   compares the first against the last
 * @param {string} [opts.seed]
 * @param {(desc:number[]) => number} [opts.novelty] distance from this behaviour to the
 *   nearest one already archived; returns 0 when there is no archive
 * @param {boolean} [opts.suites] run the task suites, default true
 * @param {number} [opts.costReference]
 * @returns {object} { fitness, components, raw, descriptors, cells, edges, ... }
 */
export function evaluateOrganismGenome(genome, {
  ticks = 240, windows = 4, seed = 'epoch', novelty = null, suites = true,
  costReference = COST_REFERENCE, weights = OBJECTIVE_WEIGHTS, noveltyReference = 0.5,
  release = false,
} = {}) {
  const problems = validateOrganismGenome(genome);
  if (problems.length) throw new Error('evaluate: ' + problems.join('; '));
  const { brain, buildMs } = buildFromOrganismGenome(genome, { seed });

  const predictors = [];
  for (const c of brain.cells) if (PREDICTOR_KINDS.includes(c.kind)) predictors.push(c);
  const kindSet = new Set(brain.cells.map((c) => c.kind));

  const trace = { firesByRegion: new Map(), distinctFired: 0, windows: [] };
  const seenFired = new Uint8Array(brain.cells.length);
  const per = Math.max(1, Math.floor(ticks / Math.max(1, windows)));

  // A predictor's surprise is read only on the ticks that predictor actually RAN. Reading
  // cell.stats.surprise once per window instead would re-report the last error a cell
  // happened to write, however many windows ago, so a predictor that stopped running would
  // hold the mean still and a flat line would be published as evidence of nothing changing.
  const prevRuns = new Int32Array(predictors.length);
  for (let pi = 0; pi < predictors.length; pi++) prevRuns[pi] = predictors[pi].stats.runs;

  const t0 = process.hrtime.bigint();
  for (let w = 0; w < windows; w++) {
    let fires = 0, sSum = 0, sN = 0;
    for (let i = 0; i < per; i++) {
      brain.tick(1);
      const fired = brain.lastFired || [];
      fires += fired.length;
      for (const idx of fired) {
        if (!seenFired[idx]) { seenFired[idx] = 1; trace.distinctFired++; }
        const rn = brain.cells[idx].region;
        trace.firesByRegion.set(rn, (trace.firesByRegion.get(rn) || 0) + 1);
      }
      for (let pi = 0; pi < predictors.length; pi++) {
        const c = predictors[pi];
        if (c.stats.runs === prevRuns[pi]) continue;
        prevRuns[pi] = c.stats.runs;
        const s = c.stats.surprise;
        if (Number.isFinite(s)) { sSum += s; sN++; }
      }
    }
    trace.windows.push({ window: w, ticks: per, fires, surprise: sN ? sSum / sN : null, samples: sN, predictors: predictors.length });
  }
  const tickMs = Number(process.hrtime.bigint() - t0) / 1e6;

  // ---- components, each in [0,1]
  const first = trace.windows[0], last = trace.windows[trace.windows.length - 1];
  const s0 = first && first.surprise !== null ? first.surprise : null;
  const s1 = last && last.surprise !== null ? last.surprise : null;
  // No predictor cells means no prediction evidence, which scores the neutral 0.5 rather
  // than a fall. An organism that removed every predictor must not be paid for the removal.
  const dropRaw = (s0 === null || s1 === null) ? null : (s0 - s1) / (Math.abs(s0) + 1e-9);
  const prediction = dropRaw === null ? 0.5 : clamp01((clamp(dropRaw, [-1, 1]) + 1) / 2);

  const task = suites ? scoreSuitesFor(kindSet, { seed }) : { score: 0, eligible: [], skipped: SUITE_DEFS.map((d) => d.name), unreachable: [], denominator: 1, coverage: 0, perSuite: {} };

  const runsPerSecond = tickMs > 0 ? (brain.stats.runs / (tickMs / 1000)) : 0;
  // A logarithmic scale: 1 run/s scores 0, 10 million runs/s scores 1. Measured throughput
  // on this machine lives between those, so the term has resolution where the data is.
  const throughput = clamp01(Math.log10(1 + runsPerSecond) / 7);

  const size = brain.cells.length + brain.connectome.n;
  const cost = clamp01(1 / (1 + size / costReference));

  const descriptors = behaviourDescriptors(brain, trace);
  const vec = descriptorVector(descriptors);
  const novRaw = novelty ? novelty(vec) : 0;
  const nov = clamp01(novRaw / noveltyReference);

  const components = { prediction, task: task.score, throughput, cost, novelty: nov };
  let fitness = 0;
  for (const k of Object.keys(weights)) fitness += weights[k] * (components[k] ?? 0);

  // The organism is finished with: every number above has been read off it and nothing below
  // reads it again. This is the last moment it exists, so this is where it gives its slots
  // back. It happens AFTER the scores so no measurement can see a released lane, and it is
  // opt in so the path that does not pay for the walk is still the default.
  let releasedSlots = 0;
  let releaseMs = 0;
  if (release) {
    const tr = process.hrtime.bigint();
    releasedSlots = releaseOrganism(brain);
    releaseMs = Number(process.hrtime.bigint() - tr) / 1e6;
  }

  return {
    releasedSlots, releaseMs: Number(releaseMs.toFixed(3)),
    id: genome.id,
    fitness: Number(fitness.toFixed(6)),
    components,
    weights,
    raw: {
      surpriseFirst: s0, surpriseLast: s1, surpriseDrop: dropRaw, predictors: predictors.length,
      taskEligible: task.eligible, taskSkipped: task.skipped, taskCoverage: Number(task.coverage.toFixed(4)), perSuite: task.perSuite,
      runsPerSecond: Number(runsPerSecond.toFixed(1)), cellRuns: brain.stats.runs, signals: brain.stats.signals,
      cells: brain.cells.length, edges: brain.connectome.n, size,
      buildMs: Number(buildMs.toFixed(3)), tickMs: Number(tickMs.toFixed(3)), ticks: per * windows,
      noveltyDistance: Number(novRaw.toFixed(6)),
    },
    descriptors, descriptorVector: vec,
    windows: trace.windows,
    cells: brain.cells.length, edges: brain.connectome.n,
    ticks: per * windows,
  };
}

// ---------------------------------------------------------------- what an organism owns
/**
 * Every hypervector slot REACHABLE FROM THIS ORGANISM, once each, by slot id.
 *
 * A slot comes back to core/simd.mjs in one of two ways: release(), by an owner who knows
 * nobody else holds the view, or the FinalizationRegistry, which fires only at an event loop
 * turn after a collection. An organism that has just been scored is garbage in full, but a
 * generation that does not turn the loop cannot have that garbage collected, so the slots
 * stay out. This is the first way: walk what the organism holds and hand it back.
 *
 * WHAT MAKES THIS SAFE. The walk starts at the brain and follows only its own object graph,
 * so a module level cache is out of reach unless the organism itself holds the cached vector:
 * the two shared caches in cells/perception.mjs (TIME_HV and TIME_SCALE) are reached through
 * neither a cell's state nor the connectome, and their vectors are operands of bind/bundle,
 * which return fresh arrays. Measured: two organisms built in one process, ticked, and walked
 * hold 1145 and 1563 slots and share ZERO of them, which is the control test (k) asserts.
 *
 * @param {object} brain a built organism
 * @returns {Int8Array[]} the slot views it holds, deduplicated by slot
 */
export function organismVectors(brain) {
  const bySlot = new Map();
  const seen = new Set();
  const stack = [brain];
  while (stack.length) {
    const o = stack.pop();
    if (o === null || typeof o !== 'object' || seen.has(o)) continue;
    seen.add(o);
    if (ArrayBuffer.isView(o)) { const s = slotOf(o); if (s >= 0 && !bySlot.has(s)) bySlot.set(s, o); continue; }
    if (o instanceof Map) { for (const [k, v] of o) { if (k && typeof k === 'object') stack.push(k); if (v && typeof v === 'object') stack.push(v); } continue; }
    if (o instanceof Set) { for (const v of o) if (v && typeof v === 'object') stack.push(v); continue; }
    if (Array.isArray(o)) { for (let i = 0; i < o.length; i++) { const v = o[i]; if (v && typeof v === 'object') stack.push(v); } continue; }
    for (const k of Object.keys(o)) { const v = o[k]; if (v && typeof v === 'object') stack.push(v); }
  }
  return [...bySlot.values()];
}

/**
 * Hand back every slot the organism holds. The caller must be finished with the brain: after
 * this the lanes of those views belong to whoever the heap hands them to next.
 * @param {object} brain @returns {number} slots returned
 */
export function releaseOrganism(brain) {
  if (!brain || !Array.isArray(brain.cells)) return 0;
  return releaseAll(organismVectors(brain));
}

/**
 * Pareto front over a list of evaluations: the ones no other evaluation beats on every
 * component at once. Printed beside the scalar so a reader can see what the weights cost.
 * @param {object[]} evals
 * @returns {object[]}
 */
export function paretoFront(evals, keys = Object.keys(OBJECTIVE_WEIGHTS)) {
  return evals.filter((a) => !evals.some((b) => b !== a
    && keys.every((k) => (b.components[k] ?? 0) >= (a.components[k] ?? 0))
    && keys.some((k) => (b.components[k] ?? 0) > (a.components[k] ?? 0))));
}

// ---------------------------------------------------------------- small helpers
function clamp(v, [lo, hi]) { return v < lo ? lo : v > hi ? hi : v; }
function clampInt(v, range) { return Math.round(clamp(Math.round(Number(v) || range[0]), range)); }
function clamp01(v) { return Number.isFinite(v) ? (v < 0 ? 0 : v > 1 ? 1 : v) : 0; }
function normalizeMix(mix) {
  const out = {};
  let total = 0;
  for (const p of PERIOD_SLOTS) { const v = Math.max(0, Number(mix[p]) || 0); out[p] = v; total += v; }
  if (!(total > 0)) { for (const p of PERIOD_SLOTS) out[p] = 1 / PERIOD_SLOTS.length; return out; }
  for (const p of PERIOD_SLOTS) out[p] = out[p] / total;
  return out;
}
