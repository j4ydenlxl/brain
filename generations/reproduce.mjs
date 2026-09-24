// generations/reproduce.mjs: THE ORGANISM MAKES ANOTHER ORGANISM, AND THE COPY IS SAVED.
//
// His words: "It actually needs to be reproducing itself, which is what ASI is. Getting
// better by itself. And saved states". Three claims, and this file is only allowed to make
// the ones it can measure:
//
//   reproducing itself   a named organism's GENOME is the thing that is copied. N children
//                        are mutated (and crossed) out of it, each one is grown into a real
//                        brain and written to its own state directory, so a child is a
//                        first class organism that can be loaded, ticked, inspected and
//                        asked to reproduce in its turn. The loop closes because the child's
//                        genome travels with it in meta.json.
//   getting better       a child is only ever CALLED better against a measurement: the same
//                        evaluateOrganismGenome, the same tick budget, the same seed, on the
//                        suites the parent was itself eligible for. A child that lost a
//                        suite the parent hosted is a regression however high its scalar is.
//   by itself            it is not. Computation is not authority. The best child becomes a
//                        `self.reproduce` proposal on the PARENT's gate and it HOLDS. The
//                        parent's lineage changes only when a human passes --approve, and
//                        then a ledger event records that it happened.
//
// WHAT IS AND IS NOT COMPARED. The parent's genome is read from state/<name>/meta.json. A
// brain that was never grown from a genome (anything `brain init` made) has none, and a
// default genome fitted to its cell count is NOT that brain: it is a different organism of
// roughly the same size. So reproduce still runs and still saves the children, and the
// proposal is refused by name, because "better than the parent" is a sentence about a
// parent nobody measured. `genomeSource` carries which of the two happened, every time.
//
// THE BAR MEASURES GENES, NOT SEEDS. Until 2026-09-18 a child was read once, the parent was
// read twice, and the better parent reading was the bar. bench/verdicts/reproduce.json at
// 03:03:10.406Z measured what that bar was actually reading: the PLACEBO arm, whose children
// keep every gene of the parent and differ only in their id, promoted at a rate of 0.5
// against 0.7084 for the mutated arms, with a mean gain of 0.033174 against 0.054608. A bar a
// gene identical child clears half the time is not measuring genes.
//
// The cause is in generations/organism-genome.mjs:443: the period and learning draw is seeded
// with `genome.seed + ':periods:' + genome.id`, so the ID IS A BUILD SEED and not a label.
// Measured here on the default genome at 40 majors, at a FIXED wiring seed, changing only the
// id moved the prediction component from 0.714045 to 0.571165 and fitness from 0.633245 to
// 0.593263, which is larger than the whole mutated gain of a bench round. A one shot reading
// of a child is therefore one draw from that lottery, and the old bar paid out on the draw.
//
// PAIRED ON K BUILD SEEDS. The parent and every child are now read on the SAME K build seeds
// (--seeds, default DEFAULT_SEEDS below, at least 3). Seed s of the child is compared against
// seed s of the parent, so the period draw, the wiring draw and the suite seed are common to
// both sides of every pair and the only thing left between them is the genes. A child is
// scored by its PAIRED MEAN GAIN over the parent and by how many of the K pairs it won, and
// the bar is: paired mean gain above the parent's OWN SEED SPREAD, a majority of the K pairs
// won, and no suite regression on the paired means. The parent is still read twice per seed,
// before and after the children, and the bar for pair s is still the BETTER of its two
// readings, so the drift between them can only ever make the bar harder.
//
// WHICH SPREAD. The parent's own seed spread here is the parent READ TWICE ON EACH BUILD
// SEED: the spread of its disagreement with itself where the seed is held still, which is the
// noise a paired gain carries. The other candidate, the range of the parent ACROSS the K
// seeds, is reported in every run as parentSeedRange and used by nothing, because the pairing
// has already cancelled it out of every gain and because it is a lottery of its own: on one
// bench parent it read 0.002738 in one round and 0.284732 in another, against a paired spread
// of 0.000924 to 0.007571 over the same 36 runs. Measured cost of using it: test (k) builds a
// child that hosts a suite its parent cannot host, it wins 4 of 5 pairs by 0.039151 against a
// paired spread of 0.001097, and the across seed range would refuse it at 0.163110. A bar that
// refuses a strictly better child is not a stricter bar, it is a broken one.
//
// THE SOAK IS NOT TOUCHED. state/soak is refused by name before anything is read, and a
// child directory is always state/<parent>-child-<k>, which is a sibling and never a path
// inside another brain.
import { statSync } from 'node:fs';
import { RNG } from '../core/rng.mjs';
import { registerProposalKind } from '../core/gate.mjs';
import {
  defaultOrganismGenome, mutateOrganismGenome, crossoverOrganismGenomes,
  buildFromOrganismGenome, evaluateOrganismGenome, hostableSuites, paretoFront,
  organismGenomeToJSON, organismGenomeFromJSON, cloneOrganismGenome,
} from './organism-genome.mjs';
import {
  ensureDirs, layout, loadBrain, readMeta, writeMeta, brainExists, checkName, saveBrain,
} from '../cli/state.mjs';

export const SELF_REPRODUCE = 'self.reproduce';

// The one brain this module refuses to read or write. A long running soak owns its own
// directory and a second process touching it would be a second writer.
export const PROTECTED_NAMES = Object.freeze(['soak']);

/** state/<parent>-child-<k>: a sibling directory, never a path inside the parent's. */
export function childStateName(parent, k) { return checkName(parent + '-child-' + k, 'child state name'); }

/**
 * A child genome's id. It is built from the PARENT GENOME's id and never from the state
 * directory's name, because the build seed is derived from the id: two directories holding
 * the same organism would otherwise grow differently wired children and "the same seed makes
 * the same children" would be false for a reason that is only a file name. The previous
 * generation's own suffix is stripped, so an id stays the same length down a long lineage
 * instead of accumulating one every generation.
 * @param {string} parentId @param {number} generation the CHILD's generation @param {number} k
 */
export function childGenomeId(parentId, generation, k) {
  return String(parentId).replace(/-c\d+-\d+$/, '') + '-c' + generation + '-' + k;
}

// ---------------------------------------------------------------- the paired design
/**
 * How many build seeds a parent and each of its children are read on. Five gives a majority
 * at three, and costs K readings of the parent before the children, K after, and K per child.
 * Three is the floor: two pairs cannot have a majority that is not also a tie.
 */
export const DEFAULT_SEEDS = 5;

/** The K build seed strings of one run. They are shared by the parent and every child. */
export function buildSeedsFor(evalSeed, k = DEFAULT_SEEDS) {
  const K = Math.max(3, Math.floor(Number(k) || DEFAULT_SEEDS));
  return Array.from({ length: K }, (_, s) => evalSeed + ':s' + s);
}

/**
 * ONE READING: this genome, grown and scored on ONE build seed.
 *
 * The id is overwritten with the build seed on the COPY that is evaluated and nowhere else:
 * the genome that is saved, proposed and recorded keeps the id it was born with. The reason
 * is in the header: organism-genome.mjs seeds the period draw with the id, so leaving the id
 * alone would mean seed s of the child and seed s of the parent were never the same build.
 * @param {object} genome @param {string} buildSeed @param {object} [opts] { ticks, windows }
 * @returns {object} the evaluation, with the genome's REAL id restored on it
 */
export function readingOn(genome, buildSeed, { ticks = 120, windows = 4 } = {}) {
  const copy = cloneOrganismGenome(genome);
  copy.id = String(buildSeed);
  const ev = evaluateOrganismGenome(copy, { ticks, windows, seed: String(buildSeed) });
  return { ...ev, id: genome.id, buildSeed: String(buildSeed) };
}

/** The K readings of one genome, in seed order. @returns {object[]} */
export function evaluateOnSeeds(genome, seeds, opts = {}) { return seeds.map((s) => readingOn(genome, s, opts)); }

/**
 * The spread of a set of readings: max minus min. This is the parent's own disagreement with
 * itself across build seeds, and it is what a claimed gain has to be bigger than. The range
 * is used rather than a standard deviation because it is the number a reader can check
 * against the printed readings without recomputing anything.
 * @param {number[]} values @returns {number}
 */
export function spreadOf(values) {
  if (!Array.isArray(values) || !values.length) return 0;
  return Number((Math.max(...values) - Math.min(...values)).toFixed(6));
}

/**
 * The bar for each pair: the BETTER of the parent's two readings on that build seed. Reading
 * the parent before and after the children and keeping the higher one means the drift of the
 * machine under the run can only raise the bar, never lower it.
 * @param {object[]} pre @param {object[]} post @returns {number[]}
 */
export function parentBarReadings(pre, post) {
  if (pre.length !== post.length) throw new Error('reproduce: the parent was read on ' + pre.length + ' seeds before the children and ' + post.length + ' after');
  return pre.map((p, i) => Math.max(p.fitness, post[i].fitness));
}

/** A majority of K pairs. @param {number} K @returns {number} */
export function pairsNeededFor(K) { return Math.floor(Number(K) / 2) + 1; }

/**
 * The false positive rate the MAJORITY term of the bar implies, under the null that a child
 * carries no gene the parent does not: its one reading on a pair is then exchangeable with
 * the parent's two readings on that pair, so it is the largest of three with probability 1/3,
 * and the rate is P(Binomial(K, 1/3) >= majority). It is an UPPER BOUND on the bar's false
 * positive rate, because a child that won a majority of pairs must still show a paired mean
 * gain above the parent's seed spread.
 * @param {number} K @returns {number}
 */
export function falsePositiveRateOfBar(K) {
  const n = Math.max(1, Math.floor(Number(K) || 1)), need = pairsNeededFor(n), p = 1 / 3;
  let acc = 0;
  for (let j = need; j <= n; j++) acc += choose(n, j) * (p ** j) * ((1 - p) ** (n - j));
  return Number(acc.toFixed(6));
}
function choose(n, k) { let c = 1; for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i; return c; }

/**
 * Pair a child's K readings against the parent's K bar readings, seed by seed.
 * @param {number[]} parentBar @param {object[]} childReadings
 * @returns {{ seedCount, pairs, pairedMeanGain, pairsWon, pairsNeeded, childMeanFitness, parentMeanFitness }}
 */
export function pairChild(parentBar, childReadings) {
  if (parentBar.length !== childReadings.length) throw new Error('reproduce: ' + childReadings.length + ' child readings against ' + parentBar.length + ' parent readings is not a paired design');
  const pairs = childReadings.map((c, i) => ({
    seed: c.buildSeed, parent: parentBar[i], child: c.fitness, gain: Number((c.fitness - parentBar[i]).toFixed(6)),
  }));
  const gains = pairs.map((p) => p.gain);
  return {
    seedCount: pairs.length, pairs,
    pairedMeanGain: Number(meanOf(gains).toFixed(6)),
    pairsWon: gains.filter((g) => g > 0).length,
    pairsNeeded: pairsNeededFor(pairs.length),
    childMeanFitness: Number(meanOf(childReadings.map((c) => c.fitness)).toFixed(6)),
    parentMeanFitness: Number(meanOf(parentBar).toFixed(6)),
  };
}
function meanOf(xs) { return xs.length ? xs.reduce((a, v) => a + v, 0) / xs.length : 0; }

/**
 * The mean of K readings of ONE genome, in the shape evaluateOrganismGenome returns, so the
 * Pareto front and compareSuites read paired means instead of one lucky draw. A suite that
 * scored on some seeds and not on others is a null, which compareSuites reads as lost: a
 * suite the organism cannot host on every seed is not a suite it hosts.
 * @param {string} id @param {object[]} readings @returns {object}
 */
export function meanReading(id, readings) {
  if (!readings.length) throw new Error('reproduce: no readings to average for ' + id);
  const eligible = readings[0].raw.taskEligible.slice();
  for (const r of readings) {
    // Eligibility is a function of the KIND SET, which is a function of the genome, so every
    // seed must agree. If one does not, the seeds are not reading one organism and the mean
    // of them is not a reading of anything.
    if (r.raw.taskEligible.join(',') !== eligible.join(',')) {
      throw new Error('reproduce: ' + id + ' hosted ' + (r.raw.taskEligible.join(',') || 'nothing') + ' on ' + r.buildSeed + ' and ' + (eligible.join(',') || 'nothing') + ' on ' + readings[0].buildSeed);
    }
  }
  const components = {};
  for (const k of Object.keys(readings[0].components)) components[k] = Number(meanOf(readings.map((r) => r.components[k] ?? 0)).toFixed(6));
  const perSuite = {};
  for (const s of Object.keys(readings[0].raw.perSuite || {})) {
    const vals = readings.map((r) => (r.raw.perSuite || {})[s]);
    perSuite[s] = vals.some((v) => typeof v !== 'number') ? null : Number(meanOf(vals).toFixed(6));
  }
  return {
    id, fitness: Number(meanOf(readings.map((r) => r.fitness)).toFixed(6)), components,
    raw: { perSuite, taskEligible: eligible },
    cells: readings[0].cells, edges: readings[0].edges,
    readings: readings.map((r) => ({ seed: r.buildSeed, fitness: r.fitness, cells: r.cells, edges: r.edges })),
  };
}

// ---------------------------------------------------------------- the gate kind
/**
 * What the policy checks, all of it from the evidence and none of it from the caller.
 * Returns 'hold' for a child that cleared every bar, because a child that cleared every bar
 * is evidence and not permission: a human decides. 'reject' for everything else, so a
 * proposal opened by hand from a worse child is refused by the same rules.
 * @param {object} evidence
 * @returns {{verdict: string, reasons: string[]}}
 */
export function judgeReproduction(evidence = {}) {
  const ev = evidence;
  const fails = [];
  if (!ev.child) fails.push('the proposal names no child');
  if (!ev.childState) fails.push('the child was not saved to a state directory, so nothing could be promoted');
  if (ev.genomeSource !== 'meta') fails.push('the parent carries no recorded genome (genomeSource ' + String(ev.genomeSource) + '), so no child can be compared to it');
  if (!Array.isArray(ev.suites) || !ev.suites.length) fails.push('the child was evaluated on no suite at all');
  if (Array.isArray(ev.regressions) && ev.regressions.length) {
    fails.push('the child scores below the parent on ' + ev.regressions.length + ' suite' + (ev.regressions.length === 1 ? '' : 's') + ': '
      + ev.regressions.map((r) => r.suite + ' ' + fmt(r.child) + ' < ' + fmt(r.parent)).join(', '));
  }
  if (!(typeof ev.childFitness === 'number' && typeof ev.parentFitness === 'number' && ev.childFitness > ev.parentFitness)) {
    fails.push('child fitness ' + fmt(ev.childFitness) + ' did not beat the better parent reading ' + fmt(ev.parentFitness));
  }
  // ---- the paired terms. A child read on fewer than three build seeds has not been
  // compared to the parent at all: one reading is one draw from the id lottery the header
  // names, and the whole point of this bar is that it is not paid out on that draw.
  const K = Array.isArray(ev.pairs) ? ev.pairs.length : 0;
  if (!(K >= 3) || Number(ev.seedCount) !== K) {
    fails.push('the child and the parent were paired on ' + K + ' build seed' + (K === 1 ? '' : 's') + ', and the bar needs at least 3');
  } else if (!(typeof ev.parentSpread === 'number' && typeof ev.pairedMeanGain === 'number')) {
    fails.push('the evidence carries no paired mean gain or no parent seed spread');
  } else {
    // The two paired terms, and every refusal names the seed spread, because the spread is
    // the thing the old bar was reading and calling a gene.
    const bar = 'paired mean gain ' + fmt(ev.pairedMeanGain) + ' against the parent own seed spread ' + fmt(ev.parentSpread)
      + ' (the parent read twice on each of the ' + K + ' build seeds)';
    if (!(ev.pairedMeanGain > ev.parentSpread)) fails.push('the ' + bar + ': the parent disagrees with itself by more than the child gained');
    const need = typeof ev.pairsNeeded === 'number' ? ev.pairsNeeded : pairsNeededFor(K);
    if (!(Number(ev.pairsWon) >= need)) fails.push('the child won ' + ev.pairsWon + ' of ' + K + ' paired seeds, short of the ' + need + ' a majority needs (' + bar + ')');
  }
  if (ev.onFront === false) fails.push('the child is not on the Pareto front of its own generation');
  if (fails.length) return { verdict: 'reject', reasons: fails };
  return {
    verdict: 'hold',
    reasons: ['child ' + ev.child + ' gained ' + fmt(ev.pairedMeanGain) + ' as a paired mean over ' + K + ' build seeds, above the parent own seed spread '
      + fmt(ev.parentSpread) + ', winning ' + ev.pairsWon + ' of ' + K + ' pairs',
    'no regression on ' + ev.suites.length + ' suite' + (ev.suites.length === 1 ? '' : 's') + ' (' + ev.suites.join(', ') + ') compared on the paired means',
    'a human decides: the state is saved at ' + ev.childState + ' either way'],
  };
}
function fmt(x) { return typeof x === 'number' ? String(Number(x.toFixed(6))) : String(x); }

/** The policy shape core/gate.mjs expects. */
export function reproducePolicy(proposal) { return judgeReproduction(proposal.evidence || {}).verdict; }

// The generation's whole evaluation table is too big for one ledger line; the line keeps
// the pointer to the child's state directory and the numbers the decision turned on.
function slim(ev) {
  return {
    parent: ev.parent, child: ev.child, childState: ev.childState, generation: ev.generation,
    parentFitness: ev.parentFitness, childFitness: ev.childFitness,
    seedCount: ev.seedCount, pairedMeanGain: ev.pairedMeanGain, pairsWon: ev.pairsWon,
    pairsNeeded: ev.pairsNeeded, parentSpread: ev.parentSpread,
    suites: ev.suites, regressions: Array.isArray(ev.regressions) ? ev.regressions.length : null,
    genomeSource: ev.genomeSource,
  };
}

// Importing this file is what teaches core the kind, so a brain that never loaded
// generations/ refuses a self.reproduce outright, which is the safe default.
registerProposalKind(SELF_REPRODUCE, { policy: reproducePolicy, slim });

// ---------------------------------------------------------------- state on disk
/**
 * Grow a genome into a brain and write it to state/<name>/ through the same path `brain
 * init` and `brain snapshot` use: ensureDirs, brain.snapshot(dir), writeMeta. The GENOME is
 * written into meta.json beside the snapshot, because the snapshot is core's format and
 * this module does not get to add a section to it. That one field is what lets a saved
 * child be read back as a genome and reproduce in its turn.
 * @param {string} name @param {object} genome @param {object} [extra] merged into meta.json
 * @returns {{ name, dir, snapshot, bytes, cells, edges, buildMs, meta }}
 */
export function saveOrganismState(name, genome, extra = {}) {
  checkName(name);
  if (PROTECTED_NAMES.includes(name)) throw new Error('reproduce: ' + name + ' is protected and is never written by this module');
  const L = ensureDirs(name);
  const { brain, buildMs } = buildFromOrganismGenome(genome, { name, seed: genome.id, ledger: 'off' });
  const file = brain.snapshot(L.dir);
  const meta = {
    name, seed: genome.seed, created: new Date().toISOString(), node: process.version,
    cells: brain.cells.length, edges: brain.connectome.size(),
    organismGenome: organismGenomeToJSON(genome),
    ...extra,
  };
  writeMeta(name, meta);
  return { name, dir: L.dir, snapshot: file, bytes: sizeOf(file), cells: brain.cells.length, edges: brain.connectome.size(), buildMs: Number(buildMs.toFixed(3)), meta };
}
// The byte count is read back from the file rather than from the object that was written,
// so a truncated or failed write reports its real size instead of an intended one.
function sizeOf(file) { try { return statSync(file).size; } catch { return 0; } }

/**
 * The genome of a named organism, and where it came from.
 *  'meta'   the genome recorded in state/<name>/meta.json by whatever grew it
 *  'fitted' no genome was recorded, so a DEFAULT genome scaled to the brain's measured cell
 *           count stands in. It is a different organism of about the same size, and every
 *           caller downstream is told so rather than being allowed to assume otherwise.
 * @param {string} name @param {object|null} brain an already loaded brain, or null
 * @returns {{ genome, source, generation, parentCells, parentEdges }}
 */
export function parentGenomeOf(name, brain = null) {
  const meta = readMeta(name) || {};
  const generation = Number.isFinite(meta.generation) ? meta.generation : 0;
  if (meta.organismGenome) {
    return { genome: organismGenomeFromJSON(meta.organismGenome), source: 'meta', generation, parentCells: meta.cells ?? null, parentEdges: meta.edges ?? null };
  }
  const cells = brain ? brain.cells.length : (meta.cells ?? 0);
  const sub = 8;
  const majors = Math.max(14, Math.round(cells / sub) || 14);
  const genome = defaultOrganismGenome({ id: name + '-fitted', seed: name, majors, subcellsPerMajor: sub });
  return { genome, source: 'fitted', generation, parentCells: cells, parentEdges: brain ? brain.connectome.size() : (meta.edges ?? null) };
}

// ---------------------------------------------------------------- comparison
/**
 * The suites the PARENT was eligible for, compared one by one against the child. A suite the
 * parent hosted and the child cannot host any more is a regression with a null child score:
 * losing the ability to run a test is not the same as failing it, and it is not better.
 * @param {object} parentEval @param {object} childEval
 * @returns {{ suites: string[], regressions: object[], gains: object[] }}
 */
export function compareSuites(parentEval, childEval) {
  const p = parentEval.raw.perSuite || {}, c = childEval.raw.perSuite || {};
  const suites = (parentEval.raw.taskEligible || []).slice();
  const regressions = [], gains = [];
  for (const s of suites) {
    const pv = p[s], cv = c[s] ?? null;
    if (typeof pv !== 'number') continue;
    if (cv === null) { regressions.push({ suite: s, parent: pv, child: null, why: 'the child cannot host this suite' }); continue; }
    if (cv < pv) regressions.push({ suite: s, parent: pv, child: cv, why: 'lower accuracy' });
    else if (cv > pv) gains.push({ suite: s, parent: pv, child: cv });
  }
  return { suites, regressions, gains };
}

// ---------------------------------------------------------------- reproduction
/**
 * Build N children from a named organism's genome, evaluate them, save every one of them,
 * and propose the best one through the parent's gate.
 *
 * @param {object} opts
 * @param {string} opts.name        the parent organism
 * @param {number} [opts.children]  how many children
 * @param {number} [opts.ticks]     tick budget every arm is evaluated on
 * @param {string} [opts.seed]
 * @param {number} [opts.rate]    expected gene operators per child. 0 is the PLACEBO arm:
 *   the child keeps every gene of the parent and differs only in its id. Under the paired
 *   bar its readings are the parent's own readings, so its gain is the machine's timing
 *   jitter and nothing else, and an arm that still promotes at rate 0 is reading the seed.
 * @param {number} [opts.seeds]   K, the build seeds the parent and every child are read on
 * @param {boolean} [opts.approve]  a human's decision, passed down from the CLI flag
 * @param {(line:string)=>void} [opts.print]
 * @returns {Promise<object>} the whole run as data
 */
export async function reproduce({
  name, children = 4, ticks = 120, windows = 4, seed = 'reproduce', rate = 2, seeds = DEFAULT_SEEDS,
  approve = false, print = null,
} = {}) {
  checkName(name);
  if (PROTECTED_NAMES.includes(name)) throw new Error('reproduce: ' + name + ' is protected (a soak owns its own directory and a second writer would corrupt it)');
  if (!brainExists(name)) throw new Error('no brain "' + name + '" at ' + layout(name).dir + ' (run: brain init ' + name + ')');
  const n = Math.max(1, Math.floor(Number(children) || 1));
  const T = Math.max(4, Math.floor(Number(ticks) || 1));
  const K = Math.max(3, Math.floor(Number(seeds) || DEFAULT_SEEDS));
  const say = typeof print === 'function' ? print : () => {};
  const t0 = process.hrtime.bigint();

  // The parent is loaded with a writable ledger because the proposal and the decision are
  // ledger events on the PARENT, not on a child and not in a file of this module's own.
  const parentBrain = await loadBrain(name, { ledger: 'full' });
  const { genome: parentGenome, source: genomeSource, generation } = parentGenomeOf(name, parentBrain);
  // The evaluation seed is keyed to the GENOME and the generation, not to the state
  // directory's name. Two directories holding the same organism are the same organism and
  // must breed the same children; a seed that carried the directory name instead would make
  // "the same seed reproduces the same children" a claim about where a file happens to sit.
  const evalSeed = seed + ':' + parentGenome.id + ':g' + generation;

  // The K build seeds of this run. Every organism in it, the parent included, is read on
  // exactly these, which is what makes seed s of a child comparable to seed s of the parent.
  const buildSeeds = buildSeedsFor(evalSeed, K);

  // arm 1 of 2 for the parent: before the children, on all K seeds
  const parentPreReadings = evaluateOnSeeds(parentGenome, buildSeeds, { ticks: T, windows });
  const parentPre = meanReading(parentGenome.id, parentPreReadings);
  say('parent pre   ' + parentGenome.id + '  mean fitness ' + parentPre.fitness + '  on ' + K + ' seeds [' + parentPreReadings.map((r) => r.fitness).join(' ')
    + ']  cells ' + parentPre.cells + '  edges ' + parentPre.edges + '  source ' + genomeSource);
  // THE OLD RULER, MEASURED ON THE SAME CHILDREN. Until 2026-09-18 this module read the parent
  // on its own id, before and after the children, read each child once on its own new id, and
  // promoted the best child on the front when that one reading beat the better parent reading
  // with no regression. The bench's placebo arm promoted at 0.5 under it. That ruler is still
  // computed here on every run, from two extra readings of the parent and one of each child,
  // and applied to nothing: the placebo rate under the old ruler and under the paired one then
  // come from the same children in the same run, instead of from a verdict file that the next
  // run overwrites. The readings are made exactly as that ruler made them: the genome keeps
  // its own id and the evaluation takes this run's seed, which is what the ruler was reading.
  const parentOwnPre = evaluateOrganismGenome(parentGenome, { ticks: T, windows, seed: evalSeed });

  const rng = new RNG(evalSeed);
  const kids = [];
  for (let k = 1; k <= n; k++) {
    let g;
    const kidId = childGenomeId(parentGenome.id, generation + 1, k);
    // Two parents once there are two children to cross, one parent otherwise. Crossover is
    // what makes a generation more than N independent walks away from the same point.
    if (rate <= 0) {
      // the placebo: every gene of the parent, a new id, and nothing else
      g = cloneOrganismGenome(parentGenome);
      g.id = kidId;
      g.meta = { ...g.meta, parents: [parentGenome.id], mutations: [] };
    } else if (kids.length >= 2 && rng.next() < 0.5) {
      const a = kids[rng.int(kids.length)].genome, b = kids[rng.int(kids.length)].genome;
      g = crossoverOrganismGenomes(a, b, rng, { id: kidId });
      g = mutateOrganismGenome(g, rng, { rate: Math.max(1, rate - 1), id: g.id });
      g.meta.parents = [a.id, b.id];
    } else {
      g = mutateOrganismGenome(parentGenome, rng, { rate, id: kidId });
      g.meta.parents = [parentGenome.id];
    }
    g.meta.gen = generation + 1;
    const readings = evaluateOnSeeds(g, buildSeeds, { ticks: T, windows });
    const ev = meanReading(g.id, readings);
    // the child on its own id: the one reading the old ruler judged it by
    const own = evaluateOrganismGenome(g, { ticks: T, windows, seed: evalSeed });
    kids.push({ k, genome: g, ev, readings, own });
    say('child ' + String(k).padStart(2) + '     ' + g.id + '  mean fitness ' + ev.fitness + '  [' + readings.map((r) => r.fitness).join(' ') + ']  cells ' + ev.cells + '  edges ' + ev.edges);
  }

  // arm 2 of 2 for the parent: after the children, on the same budget and the same K seeds
  const parentPostReadings = evaluateOnSeeds(parentGenome, buildSeeds, { ticks: T, windows });
  const parentPost = meanReading(parentGenome.id, parentPostReadings);
  // One bar per pair, the better of that seed's two parent readings, and the spread of those
  // K bars: the parent's own disagreement with itself, which is the floor a gain must clear.
  const parentBarSeeds = parentBarReadings(parentPreReadings, parentPostReadings);
  const parentBar = Number(meanOf(parentBarSeeds).toFixed(6));
  // TWO SPREADS OF THE PARENT'S OWN READINGS, and they are not the same number.
  //   parentSpread     the parent read TWICE ON EACH BUILD SEED, so the spread of its
  //                    disagreement with itself where the seed is held still. This is the
  //                    floor the bar uses, because it is the noise a paired gain carries.
  //   parentSeedRange  the range of the parent ACROSS build seeds. The pairing has already
  //                    cancelled this out of every gain, and it is a lottery in its own
  //                    right: measured on one bench parent it moved from 0.004163 in one
  //                    round to 0.283485 in another. Requiring a gain to clear it refuses a
  //                    child that is strictly better: test (k) constructs one that hosts a
  //                    suite its parent cannot host, wins 5 of 5 pairs by 0.039129, and this
  //                    range refused it at 0.166445. It is printed, and applied to nothing.
  const parentSpread = spreadOf(parentPreReadings.map((r, i) => Number((parentPostReadings[i].fitness - r.fitness).toFixed(6))));
  const parentSeedRange = spreadOf(parentBarSeeds);
  const drift = Number((parentPost.fitness - parentPre.fitness).toFixed(6));
  say('parent post  ' + parentGenome.id + '  mean fitness ' + parentPost.fitness + '  drift ' + drift + '  bar ' + parentBar + '  seed spread ' + parentSpread
    + '  range across seeds ' + parentSeedRange + '  [' + parentBarSeeds.join(' ') + ']');

  // The old ruler's verdict on this generation: the parent on its own id after the children,
  // the better of its two own readings as the bar, the best child on the front of the own
  // readings, one reading against that bar, no regression on it. Reported, never applied.
  const parentOwnPost = evaluateOrganismGenome(parentGenome, { ticks: T, windows, seed: evalSeed });
  const parentOwnBar = Number(Math.max(parentOwnPre.fitness, parentOwnPost.fitness).toFixed(6));
  const oldFront = new Set(paretoFront(kids.map((c) => c.own)).map((e) => e.id));
  const oldBest = kids.slice().sort((a, b) => (Number(oldFront.has(b.genome.id)) - Number(oldFront.has(a.genome.id))) || (b.own.fitness - a.own.fitness))[0];
  const oldCmp = compareSuites(parentOwnPre, oldBest.own);
  const wouldPromoteAtOldBar = oldFront.has(oldBest.genome.id) && oldCmp.regressions.length === 0 && oldBest.own.fitness > parentOwnBar;
  const oldBar = {
    parentPre: parentOwnPre.fitness, parentPost: parentOwnPost.fitness, parent: parentOwnBar,
    child: oldBest.genome.id, childFitness: oldBest.own.fitness, regressions: oldCmp.regressions.length,
    wouldPromote: wouldPromoteAtOldBar,
  };
  say('old ruler    parent own ' + parentOwnBar + ' [' + parentOwnPre.fitness + ' ' + parentOwnPost.fitness + ']  best child ' + oldBest.genome.id + ' own '
    + oldBest.own.fitness + '  regressions ' + oldCmp.regressions.length + '  ' + (wouldPromoteAtOldBar ? 'would have promoted' : 'would have refused'));

  // Every child is paired against the parent seed by seed before anything is ranked.
  for (const c of kids) {
    c.paired = pairChild(parentBarSeeds, c.readings);
    say('pairs ' + String(c.k).padStart(2) + '     ' + c.genome.id + '  paired mean gain ' + c.paired.pairedMeanGain + '  won ' + c.paired.pairsWon + '/' + K
      + '  [' + c.paired.pairs.map((p) => p.gain).join(' ') + ']');
  }

  // Rank on the Pareto front of the PAIRED MEANS, then take the largest paired mean gain ON
  // the front. The front is printed beside the gain so a reader can see what the weights cost.
  const front = paretoFront(kids.map((c) => c.ev));
  const frontIds = new Set(front.map((e) => e.id));
  const ranked = kids.slice().sort((a, b) => (Number(frontIds.has(b.genome.id)) - Number(frontIds.has(a.genome.id)))
    || (b.paired.pairedMeanGain - a.paired.pairedMeanGain) || (b.paired.pairsWon - a.paired.pairsWon));
  const bestKid = ranked[0];

  // Every child is saved, not only the best one: a generation that threw away its losers
  // could not be re-examined, and "saved states" was the request.
  const rows = [];
  for (const c of kids) {
    const cmp = compareSuites(parentPre, c.ev);
    const saved = saveOrganismState(childStateName(name, c.k), c.genome, {
      kind: 'organism.child', parent: name, parentGenome: parentGenome.id,
      generation: generation + 1, fitness: c.ev.fitness, components: c.ev.components,
      perSuite: c.ev.raw.perSuite, born: new Date().toISOString(),
    });
    rows.push({
      k: c.k, name: saved.name, id: c.genome.id, dir: saved.dir, snapshot: saved.snapshot, bytes: saved.bytes,
      fitness: c.ev.fitness, components: c.ev.components, perSuite: c.ev.raw.perSuite,
      cells: c.ev.cells, edges: c.ev.edges, savedCells: saved.cells, savedEdges: saved.edges,
      onFront: frontIds.has(c.genome.id), regressions: cmp.regressions, gains: cmp.gains,
      best: c === bestKid, buildMs: saved.buildMs,
      // the paired numbers this child was ranked and judged on
      readings: c.readings.map((r) => r.fitness), pairs: c.paired.pairs,
      pairedMeanGain: c.paired.pairedMeanGain, pairsWon: c.paired.pairsWon, pairsNeeded: c.paired.pairsNeeded,
      // the one reading on the child's own id, which is all the old ruler saw of it
      ownFitness: c.own.fitness, onOldFront: oldFront.has(c.genome.id),
    });
  }
  const bestRow = rows.find((r) => r.best) || null;

  // ---- the proposal
  const bestCmp = compareSuites(parentPre, bestKid.ev);
  const evidence = {
    parent: name, parentGenome: parentGenome.id, genomeSource, generation: generation + 1,
    child: bestKid.genome.id, childState: bestRow ? bestRow.name : null, childDir: bestRow ? bestRow.dir : null,
    parentFitness: parentBar, parentPre: parentPre.fitness, parentPost: parentPost.fitness, parentDrift: drift,
    childFitness: bestKid.ev.fitness, components: bestKid.ev.components,
    suites: bestCmp.suites, regressions: bestCmp.regressions, gains: bestCmp.gains,
    onFront: bestRow ? bestRow.onFront : false,
    // THE PAIRED EVIDENCE. Every number the bar turns on, and the K readings both sides were
    // scored from, so a human reading the proposal can redo the comparison by hand.
    seedCount: K, buildSeeds, parentSpread, parentSeedRange,
    pairedMeanGain: bestKid.paired.pairedMeanGain, pairsWon: bestKid.paired.pairsWon,
    pairsNeeded: bestKid.paired.pairsNeeded, pairs: bestKid.paired.pairs,
    readings: {
      seeds: buildSeeds,
      parentPre: parentPreReadings.map((r) => r.fitness),
      parentPost: parentPostReadings.map((r) => r.fitness),
      parent: parentBarSeeds,
      child: bestKid.readings.map((r) => r.fitness),
    },
    falsePositiveRateImplied: falsePositiveRateOfBar(K),
    ticks: T, seed: evalSeed, children: n, rate,
  };
  const decision = judgeReproduction(evidence);
  // The same policy on the same evidence with the OTHER spread. Nothing downstream reads it:
  // it exists so that the choice between the two floors is settled by a measured rate rather
  // than by an argument about which spread is the right one.
  const wouldPromoteAtSeedRange = judgeReproduction({ ...evidence, parentSpread: parentSeedRange }).verdict !== 'reject';
  let proposal = null, approved = false, lineage = null;
  if (decision.verdict === 'reject') {
    // Refused before it is opened. A rejected proposal on the parent's gate would record a
    // promotion attempt that this module already knows has no evidence behind it.
    say('no proposal  ' + decision.reasons.join('; '));
  } else {
    proposal = parentBrain.gate.propose({
      kind: SELF_REPRODUCE,
      what: { parent: name, child: bestKid.genome.id, childState: evidence.childState, generation: generation + 1, fitness: bestKid.ev.fitness },
      why: 'child ' + bestKid.genome.id + ' gained ' + bestKid.paired.pairedMeanGain + ' as a paired mean over ' + K + ' build seeds, won '
        + bestKid.paired.pairsWon + ' of ' + K + ' pairs against a parent seed spread of ' + parentSpread + ', and regressed on none of '
        + bestCmp.suites.length + ' suite' + (bestCmp.suites.length === 1 ? '' : 's'),
      evidence, by: 'reproduce',
    }, { t: parentBrain.clock.t, gen: parentBrain.clock.gen });
    say('proposal #' + proposal.id + '  ' + proposal.status);
    if (approve && proposal.status === 'pending') {
      // The human's decision, arriving through the CLI flag. The gate records who decided.
      parentBrain.gate.decide(proposal.id, true, 'human:reproduce --approve', { t: parentBrain.clock.t, gen: parentBrain.clock.gen });
      approved = proposal.status === 'approved';
      lineage = {
        parent: name, parentGenome: parentGenome.id, child: bestKid.genome.id,
        childState: evidence.childState, fitness: bestKid.ev.fitness, parentFitness: parentBar,
        generation: generation + 1, proposal: proposal.id, at: new Date().toISOString(),
      };
      // The ledger event and the parent's meta carry the same record: the ledger says it
      // happened and when, meta.json says what the organism's line of descent now is.
      parentBrain.ledger.append({ type: 'self.reproduce.lineage', t: parentBrain.clock.t, gen: parentBrain.clock.gen, ...lineage });
      const meta = readMeta(name) || {};
      writeMeta(name, { ...meta, generation: generation + 1, lineage: [...(Array.isArray(meta.lineage) ? meta.lineage : []), lineage] });
      say('approved     lineage ' + lineage.parent + ' -> ' + lineage.child + ' at generation ' + lineage.generation);
    }
  }

  // The parent is saved whether or not it was approved, because a HELD proposal lives in the
  // gate's pending map and the gate is part of the snapshot: without this, `brain proposals`
  // would have nothing to show and `brain approve` nothing to approve. Nothing else about
  // the parent moved: no tick was run on it and its genome is untouched.
  //
  // The failure is re-raised with the children named, because they are already on disk by
  // this point and a bare serializer stack would leave a reader thinking the whole run was
  // lost. It is not caught and swallowed: a run whose proposal never reached the snapshot
  // did not put anything in front of a human, and must not report that it did.
  try {
    saveBrain(parentBrain, name);
  } catch (e) {
    throw new Error('reproduce: the ' + n + ' children are saved (' + rows.map((r) => r.name).join(', ')
      + ') but the parent snapshot could not be rewritten, so the gate proposal was lost: ' + String(e && e.message || e));
  }

  const wallMs = Number((Number(process.hrtime.bigint() - t0) / 1e6).toFixed(3));
  return {
    name, children: n, ticks: T, windows, seed: evalSeed, rate, genomeSource, generation: generation + 1,
    seeds: K, buildSeeds, parentSpread, parentSeedRange, wouldPromoteAtSeedRange,
    // the ruler this module replaced, measured on the same children and applied to nothing
    oldBar, wouldPromoteAtOldBar,
    falsePositiveRateImplied: falsePositiveRateOfBar(K),
    hostable: hostableSuites().hostable,
    parent: {
      id: parentGenome.id, source: genomeSource,
      fitnessPre: parentPre.fitness, fitnessPost: parentPost.fitness, fitness: parentBar, drift,
      spread: parentSpread, seedRange: parentSeedRange, readings: parentBarSeeds,
      readingsPre: parentPreReadings.map((r) => r.fitness), readingsPost: parentPostReadings.map((r) => r.fitness),
      components: parentPre.components, perSuite: parentPre.raw.perSuite,
      suites: parentPre.raw.taskEligible, cells: parentPre.cells, edges: parentPre.edges,
    },
    rows, best: bestRow, front: [...frontIds], frontSize: frontIds.size,
    // the evidence the policy read, proposed or not: a refusal has to be checkable against
    // the same numbers a promotion would have been
    evidence,
    proposed: Boolean(proposal), proposal: proposal ? { id: proposal.id, kind: proposal.kind, status: proposal.status } : null,
    reasons: decision.reasons, refusal: decision.verdict === 'reject' ? decision.reasons.join('; ') : null,
    approved, lineage, wallMs,
  };
}
