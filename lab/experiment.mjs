// lab/experiment.mjs : THE RESEARCH INSTRUMENT. His manual: "BRAIN is therefore designed
// as both an intelligence architecture and a research instrument. The system should support
// controlled experiments on new primitives, new cell architectures, new learning mechanisms,
// new memory structures, new routing strategies, and new forms of structural adaptation."
//
// An Experiment is a hypothesis with a bar written down BEFORE the numbers exist:
//
//   name        what the verdict file is called
//   hypothesis  { metric, direction, minEffect }  which number moves, which way, how far
//   bar         { alpha, seeds }                  the permutation share it must clear
//   build(seed) the base organism for this seed, the same one both arms start from
//   stream(seed) the seeded input stream, computed ONCE and handed to both arms
//   mechanism(brain, ctx)  installs the alternative into an ISOLATED region of a CLONE
//   control(brain, ctx)    the untouched clone (default: a no-op) on the same stream
//   measure(brain, ctx)    drives the stream and returns a bag of numbers
//   seeds       the K seeds the pair is run over
//
// run(exp) clones the base twice per seed, so treatment and control differ in exactly one
// thing: which function was called on the clone. The comparison is PAIRED (per seed) and
// the share is a sign-flip permutation over the paired differences, exact when 2^K fits in
// a sweep and seeded-sampled when it does not. Nothing here is a t test: the null is the
// experiment's own pairs with their signs shuffled, which needs no distributional claim.
//
// Three outcomes, and only three:
//   confirmed  effect >= minEffect in the stated direction AND share <= alpha
//   refuted    effect <= -minEffect (a significant move the WRONG way) AND reverse <= alpha
//   undecided  anything else, including "the right sign but not far enough"
//
// A refuted experiment is a result, not a failure. The verdict file records the numbers and
// a content hash of the mechanism's own source text, taken with node:crypto, so the file
// names the code it graded without asking git anything.
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RNG } from '../core/rng.mjs';
import { cloneSub } from '../simulate/clone.mjs';
import { isolate } from './isolate.mjs';

export const LAB_ROOT = path.dirname(fileURLToPath(import.meta.url));
export const VERDICTS_DIR = path.join(LAB_ROOT, 'verdicts');
export const ARMS = Object.freeze(['treatment', 'control']);
export const DIRECTIONS = Object.freeze(['increase', 'decrease']);
export const DEFAULT_BAR = Object.freeze({ alpha: 0.05, seeds: 8, exactUpTo: 16, samples: 20000 });

// ---------------------------------------------------------------- definition
/**
 * Validate an experiment and freeze what must not drift once it has been stated.
 * @param {object} spec
 * @returns {object} the experiment
 */
export function defineExperiment(spec) {
  const e = { control: noop, ports: {}, region: 'lab', ...spec };
  req(e.name && typeof e.name === 'string', 'an experiment needs a name');
  req(e.hypothesis && typeof e.hypothesis === 'object', e.name + ': a hypothesis is required, stated before the run');
  const h = e.hypothesis;
  req(typeof h.metric === 'string' && h.metric, e.name + ': hypothesis.metric must name the number that moves');
  req(DIRECTIONS.includes(h.direction), e.name + ': hypothesis.direction must be one of ' + DIRECTIONS.join('|'));
  req(typeof h.minEffect === 'number' && h.minEffect > 0, e.name + ': hypothesis.minEffect must be a positive minimum effect');
  req(typeof e.build === 'function', e.name + ': build(seed, ctx) -> Brain is required');
  req(typeof e.mechanism === 'function', e.name + ': mechanism(brain, ctx) is required');
  req(typeof e.control === 'function', e.name + ': control(brain, ctx) must be a function');
  req(typeof e.measure === 'function', e.name + ': measure(brain, ctx) -> metrics is required');
  req(Array.isArray(e.seeds) && e.seeds.length >= 2, e.name + ': at least 2 seeds, and the same seeds for both arms');
  e.bar = Object.freeze({ ...DEFAULT_BAR, ...(e.bar || {}) });
  e.hypothesis = Object.freeze({ ...h });
  return e;
}
function req(ok, msg) { if (!ok) throw new Error('lab: ' + msg); }
function noop() { return null; }

/** sha256 of a function's own source text. No git, no file paths, just the code. */
export function contentHash(fn) {
  if (typeof fn !== 'function') return null;
  return 'sha256:' + createHash('sha256').update(Function.prototype.toString.call(fn)).digest('hex');
}

// ---------------------------------------------------------------- statistics
/**
 * Paired differences, signed so that a positive number always means "the hypothesis moved".
 * @param {number[]} treatment @param {number[]} control @param {string} direction
 * @returns {number[]}
 */
export function signedDiffs(treatment, control, direction) {
  const s = direction === 'decrease' ? -1 : 1;
  return treatment.map((t, i) => s * (t - control[i]));
}

/** @param {number[]} xs @returns {{n,mean,sd,median,min,max}} */
export function describe(xs) {
  const n = xs.length;
  if (!n) return { n: 0, mean: 0, sd: 0, median: 0, min: 0, max: 0 };
  const mean = xs.reduce((a, b) => a + b, 0) / n;
  const sd = n > 1 ? Math.sqrt(xs.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1)) : 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = n >> 1;
  return { n, mean, sd, median: n % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2, min: s[0], max: s[n - 1] };
}

/**
 * Sign-flip permutation share. Under the null the label on each PAIR is arbitrary, so every
 * assignment of signs is equally likely; the share is how often a null mean reaches the
 * observed one. Exact for n <= exactUpTo (all 2^n assignments, the observed one included),
 * seeded-sampled above it. Returns both tails so a refutation is graded as strictly as a
 * confirmation.
 * @param {number[]} diffs
 * @param {object} [opts] { exactUpTo, samples, seed }
 */
export function permutationShare(diffs, opts = {}) {
  const { exactUpTo = DEFAULT_BAR.exactUpTo, samples = DEFAULT_BAR.samples, seed = 'lab:perm' } = opts;
  const n = diffs.length;
  if (!n) return { share: 1, reverse: 1, mode: 'empty', draws: 0, observed: 0 };
  const observed = diffs.reduce((a, b) => a + b, 0) / n;
  let ge = 0, le = 0, draws = 0;
  if (n <= exactUpTo) {
    const total = 2 ** n;
    for (let mask = 0; mask < total; mask++) {
      let s = 0;
      for (let i = 0; i < n; i++) s += (mask >> i) & 1 ? -diffs[i] : diffs[i];
      const m = s / n;
      if (m >= observed) ge++;
      if (m <= observed) le++;
    }
    draws = total;
    return { share: ge / total, reverse: le / total, mode: 'exact', draws, observed };
  }
  const rng = new RNG(seed);
  for (let k = 0; k < samples; k++) {
    let s = 0;
    for (let i = 0; i < n; i++) s += rng.sign() * diffs[i];
    const m = s / n;
    if (m >= observed) ge++;
    if (m <= observed) le++;
  }
  draws = samples;
  return { share: (ge + 1) / (samples + 1), reverse: (le + 1) / (samples + 1), mode: 'sampled', draws, observed };
}

/**
 * The verdict against a bar that was stated before the run.
 * @param {object} effect describe() of the signed diffs
 * @param {object} perm permutationShare()
 * @param {object} hypothesis @param {object} bar
 */
export function verdictOf(effect, perm, hypothesis, bar) {
  const min = hypothesis.minEffect, alpha = bar.alpha;
  const reasons = [];
  let verdict = 'undecided';
  if (effect.n < bar.seeds) {
    reasons.push('only ' + effect.n + ' seeds, the bar asked for ' + bar.seeds);
  } else if (effect.mean >= min && perm.share <= alpha) {
    verdict = 'confirmed';
    reasons.push('effect ' + fx(effect.mean) + ' >= minEffect ' + fx(min) + ', permutation share ' + fx(perm.share) + ' <= alpha ' + fx(alpha));
  } else if (effect.mean <= -min && perm.reverse <= alpha) {
    verdict = 'refuted';
    reasons.push('effect ' + fx(effect.mean) + ' <= -minEffect ' + fx(-min) + ' (the wrong way), reverse share ' + fx(perm.reverse) + ' <= alpha ' + fx(alpha));
  } else {
    if (effect.mean < min && effect.mean > -min) reasons.push('effect ' + fx(effect.mean) + ' is inside the band [' + fx(-min) + ', ' + fx(min) + ']');
    if (effect.mean >= min && perm.share > alpha) reasons.push('effect ' + fx(effect.mean) + ' clears minEffect but the permutation share is ' + fx(perm.share) + ' > alpha ' + fx(alpha));
    if (effect.mean <= -min && perm.reverse > alpha) reasons.push('effect ' + fx(effect.mean) + ' is below -minEffect but the reverse share is ' + fx(perm.reverse) + ' > alpha ' + fx(alpha));
  }
  return { verdict, confirmed: verdict === 'confirmed', refuted: verdict === 'refuted', undecided: verdict === 'undecided', reasons };
}
function fx(x) { return typeof x === 'number' ? Number(x.toFixed(6)) : x; }

// ---------------------------------------------------------------- the run
/**
 * Run both arms over every seed and grade them against the pre-stated bar.
 * @param {object} exp a defineExperiment() result
 * @param {object} [opts] { write, verdictsDir, seeds, onArm }
 * @returns {Promise<object>} the verdict record (also written to lab/verdicts/<name>.json)
 */
export async function run(exp, opts = {}) {
  const e = exp.hypothesis && exp.bar ? exp : defineExperiment(exp);
  const seeds = opts.seeds || e.seeds;
  const t0 = performance.now();
  const rows = [];
  for (const seed of seeds) {
    const stream = typeof e.stream === 'function' ? e.stream(seed) : null;
    const base = await e.build(seed, { seed, stream, experiment: e });
    const arms = {};
    for (const arm of ARMS) {
      const clone = cloneSub(base, { name: base.name + '.' + arm, seed: String(seed) + ':' + arm, ledger: 'full' });
      const firewall = e.region ? isolate(clone, e.region, e.ports || {}) : null;
      const ctx = { seed, arm, stream, region: e.region, firewall, rng: new RNG(String(seed) + ':' + arm), experiment: e };
      const a0 = performance.now();
      const installed = arm === 'treatment' ? await e.mechanism(clone, ctx) : await e.control(clone, ctx);
      const metrics = await e.measure(clone, ctx);
      const ms = performance.now() - a0;
      if (metrics == null || typeof metrics[e.hypothesis.metric] !== 'number' || !Number.isFinite(metrics[e.hypothesis.metric])) {
        throw new Error('lab: ' + e.name + ' seed ' + seed + ' arm ' + arm + ': measure() must return a finite number for the stated metric "' + e.hypothesis.metric + '", got ' + JSON.stringify(metrics && metrics[e.hypothesis.metric]));
      }
      arms[arm] = {
        metrics, ms: round(ms, 3), installed: installed ?? null,
        cells: clone.cells.length, edges: clone.connectome.size(),
        refusedCrossings: firewall ? firewall.stats.refused : 0,
        undeclaredCrossings: firewall ? firewall.crossings().filter((c) => !c.declared).length : 0,
      };
      if (firewall) firewall.detach();
      if (typeof opts.onArm === 'function') opts.onArm(seed, arm, arms[arm]);
    }
    rows.push({ seed: String(seed), treatment: arms.treatment, control: arms.control });
  }

  const metric = e.hypothesis.metric;
  const tVals = rows.map((r) => r.treatment.metrics[metric]);
  const cVals = rows.map((r) => r.control.metrics[metric]);
  const diffs = signedDiffs(tVals, cVals, e.hypothesis.direction);
  const effect = describe(diffs);
  const perm = permutationShare(diffs, { ...e.bar, seed: 'lab:' + e.name });
  const v = verdictOf(effect, perm, e.hypothesis, e.bar);
  const wins = diffs.filter((d) => d > 0).length, losses = diffs.filter((d) => d < 0).length;

  // Every other number measure() returned, summarized the same way, so a reader can see
  // what else moved without a second run. The stated metric stays first.
  const secondary = {};
  const keys = new Set();
  for (const r of rows) for (const arm of ARMS) for (const k of Object.keys(r[arm].metrics)) if (typeof r[arm].metrics[k] === 'number') keys.add(k);
  for (const k of [...keys].sort()) {
    const t = describe(rows.map((r) => num(r.treatment.metrics[k])));
    const c = describe(rows.map((r) => num(r.control.metrics[k])));
    secondary[k] = { treatmentMean: round(t.mean, 6), controlMean: round(c.mean, 6), delta: round(t.mean - c.mean, 6) };
  }

  const record = {
    name: e.name,
    question: e.question || '',
    at: new Date().toISOString(),
    node: process.version,
    hypothesis: { ...e.hypothesis },
    bar: { ...e.bar },
    region: e.region,
    ports: e.ports || {},
    seeds: rows.map((r) => r.seed),
    k: rows.length,
    metric,
    treatment: { mean: round(describe(tVals).mean, 6), sd: round(describe(tVals).sd, 6), values: tVals.map((x) => round(x, 6)) },
    control: { mean: round(describe(cVals).mean, 6), sd: round(describe(cVals).sd, 6), values: cVals.map((x) => round(x, 6)) },
    effect: { mean: round(effect.mean, 6), sd: round(effect.sd, 6), median: round(effect.median, 6), min: round(effect.min, 6), max: round(effect.max, 6), wins, losses, ties: rows.length - wins - losses },
    diffs: diffs.map((d) => round(d, 6)),
    permutation: { share: round(perm.share, 6), reverse: round(perm.reverse, 6), mode: perm.mode, draws: perm.draws },
    verdict: v.verdict,
    reasons: v.reasons,
    secondary,
    isolation: {
      refusedCrossings: rows.reduce((a, r) => a + r.treatment.refusedCrossings + r.control.refusedCrossings, 0),
      undeclaredCrossings: rows.reduce((a, r) => a + r.treatment.undeclaredCrossings + r.control.undeclaredCrossings, 0),
    },
    source: { mechanism: contentHash(e.mechanism), control: contentHash(e.control), measure: contentHash(e.measure), build: contentHash(e.build) },
    wallMs: round(performance.now() - t0, 1),
    rows: rows.map((r) => ({ seed: r.seed, treatment: strip(r.treatment), control: strip(r.control) })),
  };
  if (opts.write !== false) record.file = writeVerdict(record, opts.verdictsDir);
  return record;
}
function num(x) { return typeof x === 'number' && Number.isFinite(x) ? x : 0; }
function round(x, d) { const p = 10 ** d; return typeof x === 'number' && Number.isFinite(x) ? Math.round(x * p) / p : x; }
function strip(a) { return { metrics: a.metrics, ms: a.ms, cells: a.cells, edges: a.edges, refusedCrossings: a.refusedCrossings, installed: a.installed }; }

/** @param {object} record @param {string} [dir] @returns {string} the file written */
export function writeVerdict(record, dir = VERDICTS_DIR) {
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, record.name + '.json');
  writeFileSync(file, JSON.stringify(record, null, 2));
  return file;
}
/** @param {string} nameOrFile @param {string} [dir] @returns {object} */
export function readVerdict(nameOrFile, dir = VERDICTS_DIR) {
  const file = nameOrFile.endsWith('.json') ? path.resolve(nameOrFile) : path.join(dir, nameOrFile + '.json');
  if (!existsSync(file)) throw new Error('lab: no verdict at ' + file + ' (run it first: node lab/cli.mjs run ' + path.basename(file, '.json') + ')');
  return { ...JSON.parse(readFileSync(file, 'utf8')), file };
}
/** @param {string} [dir] @returns {object[]} */
export function listVerdicts(dir = VERDICTS_DIR) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
    .map((f) => { try { return { ...JSON.parse(readFileSync(path.join(dir, f), 'utf8')), file: path.join(dir, f) }; } catch { return null; } })
    .filter(Boolean);
}

// ---------------------------------------------------------------- reporting
/** One block of plain text per experiment. Every number on it came from run(). */
export function renderVerdict(r) {
  const L = [];
  const pct = (x) => (typeof x === 'number' ? x.toFixed(6) : String(x));
  L.push('experiment ' + r.name + '   ' + r.verdict.toUpperCase());
  if (r.question) L.push('  question   ' + r.question);
  L.push('  hypothesis ' + r.metric + ' ' + r.hypothesis.direction + 's by at least ' + r.hypothesis.minEffect + ', alpha ' + r.bar.alpha + ', ' + r.bar.seeds + ' seeds');
  L.push('  seeds      ' + r.k + '  (' + r.seeds.join(', ') + ')');
  L.push('  treatment  mean ' + pct(r.treatment.mean) + '  sd ' + pct(r.treatment.sd));
  L.push('  control    mean ' + pct(r.control.mean) + '  sd ' + pct(r.control.sd));
  L.push('  effect     mean ' + pct(r.effect.mean) + '  median ' + pct(r.effect.median) + '  min ' + pct(r.effect.min) + '  max ' + pct(r.effect.max));
  L.push('  pairs      wins ' + r.effect.wins + '  losses ' + r.effect.losses + '  ties ' + r.effect.ties);
  L.push('  permutation share ' + pct(r.permutation.share) + '  reverse ' + pct(r.permutation.reverse) + '  (' + r.permutation.mode + ', ' + r.permutation.draws + ' draws)');
  L.push('  isolation  refused crossings ' + r.isolation.refusedCrossings + ', undeclared crossings left ' + r.isolation.undeclaredCrossings);
  for (const why of r.reasons) L.push('  because    ' + why);
  const others = Object.keys(r.secondary).filter((k) => k !== r.metric);
  if (others.length) {
    L.push('  other measured numbers (treatment / control / delta)');
    for (const k of others) L.push('    ' + k.padEnd(24) + String(r.secondary[k].treatmentMean).padStart(14) + String(r.secondary[k].controlMean).padStart(14) + String(r.secondary[k].delta).padStart(14));
  }
  L.push('  mechanism  ' + r.source.mechanism);
  L.push('  wall       ' + r.wallMs + ' ms' + (r.file ? '   verdict ' + r.file : ''));
  return L.join('\n');
}
