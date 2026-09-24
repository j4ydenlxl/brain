// generations/operators-gene.mjs: THE IMPROVEMENT OPERATORS AS GENES (Board 14, item spread).
//
// His order of 2026-09-24: "Self improving to the magnitude of yourself is the top priority it should
// be better or as good as u at self improving and can be able to spread this in billions of years
// compressed simulated magnitude". The generations engine already selects over WHAT an organism is
// (generations/organism-genome.mjs). This file gives it something to select over HOW an organism
// improves itself: the four choices self/improve.mjs makes every round, written as a genome field.
//
//   order    the improvement operators to try, in order (names from the self/operators.mjs registry)
//   step     the knob step, as a fraction of the knob's value as read (self/knobs.mjs: 0.1)
//   noise    the noise rule a trial must clear to be kept: { rule, seeds }
//              range  the spread (max minus min) of the seeds, the registry's own rule (self/improve.mjs
//                     noiseOf: "the spread of the two runs")
//              sd     one sample standard deviation of the seeds
//              sd2    two sample standard deviations
//            each is taken over BOTH arms (the larger), so no rule is looser than the seed-to-seed noise
//   budget   the trial budget: trials one round may spend (the registry's TRIALS_PER_ROUND: 6)
//
// The genes live in genome.meta.operators, frozen. cloneOrganismGenome and cloneGenome copy meta with
// a shallow spread, so a frozen object is the only form a clone cannot change under its parent; a
// JSON round trip thaws it, and operatorGenesOf() normalizes and freezes it again on the way out.
//
// The registry is read by import. When self/operators.mjs or self/knobs.mjs is absent the defaults
// below stand in, and the stand-in is printed once as "not landed yet": nothing here guesses silently.
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { RNG, hash32 } from '../core/rng.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const GENES_VERSION = 1;

/** The stand-ins, used only when the registry has not landed (each one says where the real one lives). */
export const STUB = Object.freeze({
  OPERATOR_NAMES: Object.freeze(['knob-tune', 'strategy-swap', 'recombine', 'author']), // self/operators.mjs OPERATOR_NAMES
  TRIALS_PER_ROUND: 6,                                                                   // self/operators.mjs TRIALS_PER_ROUND
  DEFAULT_STEP_FRAC: 0.1,                                                                // self/knobs.mjs DEFAULT_STEP_FRAC
  MODEL_OPERATORS: Object.freeze(['author']),                                            // self/operators.mjs author() calls the model
});

/** The noise rules a gene may name. Every one is at least the seed-to-seed standard deviation. */
export const NOISE_RULES = Object.freeze({
  range: Object.freeze({ doc: 'the spread (max minus min) of the seeds, the larger of the two arms: the registry rule' }),
  sd: Object.freeze({ doc: 'one sample standard deviation of the seeds, the larger of the two arms' }),
  sd2: Object.freeze({ doc: 'two sample standard deviations of the seeds, the larger of the two arms' }),
});
export const NOISE_RULE_NAMES = Object.freeze(Object.keys(NOISE_RULES));
export const SEEDS_RANGE = Object.freeze([2, 4]);
export const STEP_RANGE = Object.freeze([0.05, 0.3]);
export const BUDGET_RANGE = Object.freeze([1, 12]);

// ---------------------------------------------------------------- the registry, by import
async function tryImport(rel, root) {
  const abs = path.join(root, rel);
  if (!existsSync(abs)) return { mod: null, reason: rel + ' is absent' };
  try { return { mod: await import(pathToFileURL(abs).href), reason: null }; } catch (e) { return { mod: null, reason: rel + ' did not import: ' + String((e && e.message) || e).split('\n')[0] }; }
}

let REGISTRY = null;
/**
 * The operator registry as the genes see it: names, the trial budget, the step and which operators need
 * the model. Read once per process; a missing piece is printed as "not landed yet" and stubbed.
 * @param {{ root?: string, say?: (l: string) => void, fresh?: boolean }} [o]
 */
export async function loadRegistry({ root = ROOT, say = (l) => console.log(l), fresh = false } = {}) {
  if (REGISTRY && !fresh) return REGISTRY;
  const ops = await tryImport('self/operators.mjs', root);
  const knobs = await tryImport('self/knobs.mjs', root);
  const missing = [];
  if (!ops.mod) { missing.push(ops.reason); say('operators-gene: self/operators.mjs not landed yet (' + ops.reason + '): the stub OPERATOR_NAMES and TRIALS_PER_ROUND stand in'); }
  if (!knobs.mod) { missing.push(knobs.reason); say('operators-gene: self/knobs.mjs not landed yet (' + knobs.reason + '): the stub step 0.1 and band 0.7x to 1.5x stand in'); }
  const names = ops.mod && Array.isArray(ops.mod.OPERATOR_NAMES) && ops.mod.OPERATOR_NAMES.length ? [...ops.mod.OPERATOR_NAMES] : [...STUB.OPERATOR_NAMES];
  REGISTRY = Object.freeze({
    landed: missing.length === 0, missing: Object.freeze(missing),
    operatorNames: Object.freeze(names),
    trialsPerRound: ops.mod && Number.isInteger(ops.mod.TRIALS_PER_ROUND) ? ops.mod.TRIALS_PER_ROUND : STUB.TRIALS_PER_ROUND,
    stepFrac: knobs.mod && Number.isFinite(knobs.mod.DEFAULT_STEP_FRAC) ? knobs.mod.DEFAULT_STEP_FRAC : STUB.DEFAULT_STEP_FRAC,
    modelOperators: Object.freeze(names.filter((n) => STUB.MODEL_OPERATORS.includes(n))),
    bandOf: knobs.mod && typeof knobs.mod.bandOf === 'function' ? knobs.mod.bandOf : stubBandOf,
    parseKnobs: knobs.mod && typeof knobs.mod.parseKnobs === 'function' ? knobs.mod.parseKnobs : null,
    from: { operators: ops.mod ? 'self/operators.mjs' : 'stub', knobs: knobs.mod ? 'self/knobs.mjs' : 'stub' },
  });
  return REGISTRY;
}

/** The band self/knobs.mjs gives a knob with no comment: 0.7x to 1.5x of the value as read, 10 percent step. */
export function stubBandOf(value, _comment = null, literal = null) {
  const integer = Number.isInteger(value) && (literal === null || !/[.eE]/.test(String(literal)));
  if (value === 0) return { lo: 0, hi: 0, step: 0, integer, form: 'default', frozen: true, malformed: null, reason: 'a knob at 0 has no multiplicative band' };
  let lo = Math.min(value * 0.7, value * 1.5), hi = Math.max(value * 0.7, value * 1.5), step = Math.abs(value) * 0.1;
  if (integer) { lo = Math.ceil(lo); hi = Math.floor(hi); step = Math.max(1, Math.round(step)); }
  return { lo, hi, step, integer, form: 'default', frozen: false, malformed: null, reason: null };
}

// ---------------------------------------------------------------- the genes
const r6 = (x) => Math.round(x * 1e6) / 1e6;
const clamp = (x, [lo, hi]) => Math.min(hi, Math.max(lo, x));

/** The registry's own choices as genes: its operator order, its step, its noise rule, its budget. */
export function defaultOperatorGenes(reg) {
  const r = reg || REGISTRY || fallbackRegistry();
  return Object.freeze({ v: GENES_VERSION, order: Object.freeze([...r.operatorNames]), step: r.stepFrac, noise: Object.freeze({ rule: 'range', seeds: 2 }), budget: r.trialsPerRound });
}

function fallbackRegistry() {
  return { operatorNames: [...STUB.OPERATOR_NAMES], trialsPerRound: STUB.TRIALS_PER_ROUND, stepFrac: STUB.DEFAULT_STEP_FRAC };
}

/**
 * Problems with a genes object; empty is good. The order must be a permutation of a subset of the
 * registry's names with no repeat; the rest must sit inside their ranges.
 */
export function validateOperatorGenes(g, reg) {
  const r = reg || REGISTRY || fallbackRegistry();
  const p = [];
  if (!g || typeof g !== 'object') return ['not a genes object'];
  if (g.v !== GENES_VERSION) p.push('v is ' + g.v + ', not ' + GENES_VERSION);
  if (!Array.isArray(g.order) || !g.order.length) p.push('order is not a non-empty list');
  else {
    const seen = new Set();
    for (const n of g.order) {
      if (!r.operatorNames.includes(n)) p.push('order names ' + n + ', which the registry does not have');
      if (seen.has(n)) p.push('order names ' + n + ' twice');
      seen.add(n);
    }
  }
  if (!(Number.isFinite(g.step) && g.step >= STEP_RANGE[0] && g.step <= STEP_RANGE[1])) p.push('step ' + g.step + ' outside [' + STEP_RANGE.join(', ') + ']');
  if (!g.noise || !NOISE_RULE_NAMES.includes(g.noise.rule)) p.push('noise.rule ' + (g.noise && g.noise.rule) + ' is not one of ' + NOISE_RULE_NAMES.join(', '));
  if (!g.noise || !(Number.isInteger(g.noise.seeds) && g.noise.seeds >= SEEDS_RANGE[0] && g.noise.seeds <= SEEDS_RANGE[1])) p.push('noise.seeds ' + (g.noise && g.noise.seeds) + ' outside [' + SEEDS_RANGE.join(', ') + ']');
  if (!(Number.isInteger(g.budget) && g.budget >= BUDGET_RANGE[0] && g.budget <= BUDGET_RANGE[1])) p.push('budget ' + g.budget + ' outside [' + BUDGET_RANGE.join(', ') + ']');
  return p;
}

/** Put genes back inside their ranges and freeze them. A name the registry lacks is dropped. */
export function normalizeOperatorGenes(g, reg) {
  const r = reg || REGISTRY || fallbackRegistry();
  const d = defaultOperatorGenes(r);
  const order = [];
  for (const n of Array.isArray(g && g.order) ? g.order : []) if (r.operatorNames.includes(n) && !order.includes(n)) order.push(n);
  const rule = g && g.noise && NOISE_RULE_NAMES.includes(g.noise.rule) ? g.noise.rule : d.noise.rule;
  const seeds = Math.round(clamp(Number(g && g.noise && g.noise.seeds) || d.noise.seeds, SEEDS_RANGE));
  return Object.freeze({
    v: GENES_VERSION,
    order: Object.freeze(order.length ? order : [...d.order]),
    step: r6(clamp(Number.isFinite(g && g.step) ? g.step : d.step, STEP_RANGE)),
    noise: Object.freeze({ rule, seeds }),
    budget: Math.round(clamp(Number.isFinite(g && g.budget) ? g.budget : d.budget, BUDGET_RANGE)),
  });
}

/** Plain (thawed) copy, for JSON or a signal. */
export function genesToJSON(g) { return { v: g.v, order: [...g.order], step: g.step, noise: { rule: g.noise.rule, seeds: g.noise.seeds }, budget: g.budget }; }

/** A short stable key: two genes objects with the same key make the same choices. */
export function genesKey(g) { return g.order.map((n) => n.split('-').map((w) => w[0]).join('')).join('>') + '|s' + g.step + '|' + g.noise.rule + 'x' + g.noise.seeds + '|b' + g.budget; }

/** Same choices? */
export function sameGenes(a, b) { return genesKey(a) === genesKey(b); }

/**
 * The genome with its operator genes set: a copy of the genome whose meta carries the frozen genes.
 * Works on an organism genome (organism-genome.mjs) and a cell genome (genome.mjs) alike: both
 * keep meta.
 */
export function withOperatorGenes(genome, genes, reg) {
  const g = normalizeOperatorGenes(genes, reg);
  const problems = validateOperatorGenes(g, reg);
  if (problems.length) throw new Error('withOperatorGenes: ' + problems.join('; '));
  return { ...genome, meta: { ...(genome.meta || {}), operators: g } };
}

/** The genome's operator genes, normalized and frozen; null when the genome has none. */
export function operatorGenesOf(genome, reg) {
  const o = genome && genome.meta && genome.meta.operators;
  return o ? normalizeOperatorGenes(o, reg) : null;
}

/** Random genes: a shuffled order, a step, a rule, a seed count and a budget from their ranges. */
export function randomOperatorGenes(rng, reg) {
  const r = reg || REGISTRY || fallbackRegistry();
  const order = [...r.operatorNames];
  for (let i = order.length - 1; i > 0; i--) { const j = rng.int(i + 1); const x = order[i]; order[i] = order[j]; order[j] = x; }
  return normalizeOperatorGenes({
    v: GENES_VERSION, order,
    step: STEP_RANGE[0] + rng.next() * (STEP_RANGE[1] - STEP_RANGE[0]),
    noise: { rule: rng.pick(NOISE_RULE_NAMES), seeds: SEEDS_RANGE[0] + rng.int(SEEDS_RANGE[1] - SEEDS_RANGE[0] + 1) },
    budget: BUDGET_RANGE[0] + rng.int(BUDGET_RANGE[1] - BUDGET_RANGE[0] + 1),
  }, r);
}

/** The mutation kinds, one of which a mutation applies. */
export const GENE_MUTATIONS = Object.freeze(['swap-order', 'step', 'rule', 'seeds', 'budget']);

/** One mutation of the genes. Returns { genes, mutation }. Pure given the rng. */
export function mutateOperatorGenes(genes, rng, reg) {
  const g = genesToJSON(genes);
  const m = rng.pick(GENE_MUTATIONS);
  if (m === 'swap-order' && g.order.length > 1) { const i = rng.int(g.order.length), j = (i + 1 + rng.int(g.order.length - 1)) % g.order.length; const x = g.order[i]; g.order[i] = g.order[j]; g.order[j] = x; }
  else if (m === 'step') g.step = g.step * (rng.next() < 0.5 ? 0.75 : 1.33);
  else if (m === 'rule') g.noise.rule = NOISE_RULE_NAMES[(NOISE_RULE_NAMES.indexOf(g.noise.rule) + 1 + rng.int(NOISE_RULE_NAMES.length - 1)) % NOISE_RULE_NAMES.length];
  else if (m === 'seeds') g.noise.seeds += rng.next() < 0.5 ? -1 : 1;
  else if (m === 'budget') g.budget += rng.next() < 0.5 ? -1 : 1;
  return { genes: normalizeOperatorGenes(g, reg), mutation: m };
}

/** Uniform crossover of two genes objects: each field from one parent; the order is one parent's whole. */
export function crossoverOperatorGenes(a, b, rng, reg) {
  const pick = () => (rng.next() < 0.5 ? a : b);
  return normalizeOperatorGenes({ v: GENES_VERSION, order: [...pick().order], step: pick().step, noise: { ...pick().noise }, budget: pick().budget }, reg);
}

/**
 * The noise a trial must clear under a rule, from the two arms' per-seed scores. `floor` stands in
 * when every seed agrees (the registry's floor is 5 percent of the distance to the bar; here the
 * caller names it, one task of the objective).
 */
export function noiseOf(rule, cand, ctrl, floor = 0) {
  const spread = (xs) => (xs.length < 2 ? 0 : Math.max(...xs) - Math.min(...xs));
  const sd = (xs) => { if (xs.length < 2) return 0; const m = xs.reduce((s, x) => s + x, 0) / xs.length; return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1)); };
  let v;
  if (rule === 'range') v = Math.max(spread(cand), spread(ctrl));
  else if (rule === 'sd') v = Math.max(sd(cand), sd(ctrl));
  else if (rule === 'sd2') v = 2 * Math.max(sd(cand), sd(ctrl));
  else throw new Error('noiseOf: unknown rule ' + rule);
  return Math.max(v, floor);
}

/** A seeded rng for genes work, so a run is reproducible from its seed alone. */
export function genesRng(label) { return new RNG(hash32('operators-gene:' + label)); }
