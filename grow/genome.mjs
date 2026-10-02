// grow/genome.mjs: THE ENGINE'S GENOME (grow/NEO.md, his words of 19:15Z to 19:24Z: "it should change its own code for
// iteration, testing, benching", "IT should permanently change code for the better", "rewrite itself, and iterate its
// own engine"). Every tunable the NEO search of grow/neo.mjs uses is a GENE here: its default is EQUAL to the engine's
// constant of 2026-10-01, it has hard bounds, and the organism changes it with no model: grow/evolve.mjs draws a mutant
// with mutate(), runs the engine on it and on the present genome under one budget, and keeps the mutant only when the
// engine's own printed score says it is better (contract c6: neo/GENOME.json, neo/MACROS.json, neo/TRIALS.jsonl).
//
// The module is PURE apart from genomeOf, and it has no static node: import, so a phone browser imports it as it is
// (genomeFrom takes the parsed GENOME.json; genomeOf reads <root>/neo/GENOME.json through process.getBuiltinModule and
// falls back to the defaults where there is no file system). OPEN-ENDED: GENES is data; a gene appended to it (a new
// knob the engine learns to read) is mutated, validated and recorded with no other change here, and a gene the engine
// does not read yet is harmless (its trials tie, so they are never kept).
//
//   genomeOf(root)            the frozen genome of a tree (defaults where GENOME.json is missing, corrupt or out of bounds)
//   genomeFrom(doc)           the same from a parsed GENOME.json ({ genes: {...} } or a flat object)
//   validate(g, { partial })  { ok, errors }: every gene known, of its kind, inside its bounds
//   mutate(g, seed, { genes }) { genome, change }: one or two genes moved, deterministic for the seed, always in bounds
//   crossover(a, b, seed)     { genome, change }: each gene taken whole from a or from b
//   describe(change)          one line of text for a genome change or a macro change
// Author: NATIVE EVOLVE builder, 2026-10-01.

/** The file a tree's genome lives in (contract c6). */
export const GENOME_FILE = 'neo/GENOME.json';
/** The version of the GENOME.json document this module writes and reads. */
export const GENOME_VERSION = 1;

const f = Object.freeze;
const KEYWORDS_TODAY = ['of', 'for', 'to', 'about', 'on', 'in', 'from', 'is', 'called', 'named', 'word', 'phrase', 'into'];
const FAMILIES_TODAY = ['aggregate', 'compare', 'compute', 'iterate', 'transform'];
const SOURCES_TODAY = ['parent', 'template', 'memory', 'yesno', 'mutant'];

/**
 * The genes. kind: int (scale lin or log), real (step, two decimals), perm (a permutation of the default), ints or
 * words (a list; mutation adds a value of `pool` or drops one). scope: "budget" genes are held equal across the two arms
 * of a trial (contract: the SAME budget), so mutate never draws them; "search" genes are what a trial grades. where:
 * the place in the engine's search (grow/neo.mjs, the search now in grow/neo-core.mjs) whose constant the default equals.
 */
export const GENES = f([
  { name: 'maxGenerated', kind: 'int', def: 200000, min: 1000, max: 5000000, scale: 'log', scope: 'budget', where: 'BUDGET.maxGenerated' },
  { name: 'maxMs', kind: 'int', def: 60000, min: 1000, max: 600000, scale: 'log', scope: 'budget', where: 'BUDGET.maxMs' },
  { name: 'maxCost', kind: 'int', def: 7, min: 2, max: 12, scale: 'lin', scope: 'search', where: 'MAX_COST' },
  { name: 'enumShare', kind: 'real', def: 0.8, min: 0.05, max: 0.95, step: 0.1, scope: 'search', where: 'ENUM_SHARE' },
  { name: 'maxExamples', kind: 'int', def: 20, min: 1, max: 100, scale: 'log', scope: 'search', where: 'MAX_EXAMPLES' },
  { name: 'mutantCap', kind: 'int', def: 2000, min: 0, max: 50000, scale: 'log', scope: 'search', where: 'MUTANT_CAP' },
  { name: 'mutantSwaps', kind: 'int', def: 24, min: 0, max: 200, scale: 'log', scope: 'search', where: 'mutantCands swaps >= 24' },
  { name: 'maxExtra', kind: 'int', def: 6, min: 0, max: 16, scale: 'lin', scope: 'search', where: 'MAX_EXTRA' },
  { name: 'notFeatures', kind: 'int', def: 50, min: 0, max: 400, scale: 'log', scope: 'search', where: 'featurePool k >= 50' },
  { name: 'offWords', kind: 'int', def: 400, min: 0, max: 4000, scale: 'log', scope: 'search', where: 'featurePool offW.size < 400' },
  { name: 'spanPool', kind: 'int', def: 3000, min: 100, max: 30000, scale: 'log', scope: 'search', where: 'spanPool slice(0, 3000)' },
  { name: 'spanMaxCost', kind: 'int', def: 4, min: 1, max: 12, scale: 'lin', scope: 'search', where: 'spanPool and lineTemplates e.cost <= 4' },
  { name: 'templateSlots', kind: 'int', def: 4, min: 1, max: 12, scale: 'lin', scope: 'search', where: 'pickSpans(.., 4)' },
  { name: 'templateAlts', kind: 'int', def: 8, min: 0, max: 64, scale: 'log', scope: 'search', where: 'templateCands alts slice(0, 8)' },
  { name: 'lineNums', kind: 'int', def: 2, min: 1, max: 8, scale: 'lin', scope: 'search', where: 'lineTemplates ns slice(0, 2)' },
  { name: 'lineSubjects', kind: 'int', def: 3, min: 0, max: 12, scale: 'lin', scope: 'search', where: 'lineTemplates subs slice(0, 3)' },
  { name: 'poolNums', kind: 'int', def: 10, min: 0, max: 64, scale: 'log', scope: 'search', where: 'poolsOf shared(numDf, 10)' },
  { name: 'poolExpect', kind: 'int', def: 10, min: 0, max: 64, scale: 'log', scope: 'search', where: 'poolsOf shared(expDf, 10)' },
  { name: 'poolWords', kind: 'int', def: 6, min: 0, max: 32, scale: 'log', scope: 'search', where: 'poolsOf shared(wordDf, 6)' },
  { name: 'poolContent', kind: 'int', def: 6, min: 0, max: 32, scale: 'log', scope: 'search', where: 'poolsOf content slice(0, 6)' },
  { name: 'namedCost', kind: 'int', def: 1, min: 1, max: 4, scale: 'lin', scope: 'search', where: 'enumerate weight: a named primitive' },
  { name: 'costAggregate', kind: 'int', def: 2, min: 1, max: 4, scale: 'lin', scope: 'search', where: 'enumerate weight: an unnamed aggregate primitive' },
  { name: 'costCompare', kind: 'int', def: 2, min: 1, max: 4, scale: 'lin', scope: 'search', where: 'enumerate weight: an unnamed compare primitive' },
  { name: 'costCompute', kind: 'int', def: 2, min: 1, max: 4, scale: 'lin', scope: 'search', where: 'enumerate weight: an unnamed compute primitive' },
  { name: 'costIterate', kind: 'int', def: 2, min: 1, max: 4, scale: 'lin', scope: 'search', where: 'enumerate weight: an unnamed iterate primitive' },
  { name: 'costTransform', kind: 'int', def: 2, min: 1, max: 4, scale: 'lin', scope: 'search', where: 'enumerate weight: an unnamed transform primitive' },
  { name: 'familyOrder', kind: 'perm', def: FAMILIES_TODAY, scope: 'search', where: 'enumerate order after the named primitives (today: by name, so by family a to z)' },
  { name: 'sourceOrder', kind: 'perm', def: SOURCES_TODAY, scope: 'search', where: 'spawn: parentCands, templateCands, memoryCands, yesNoCands, mutantCands' },
  { name: 'decimals', kind: 'int', def: 2, min: 0, max: 6, scale: 'lin', scope: 'search', where: "apexChains ['render.decimals', 2]" },
  { name: 'numPool', kind: 'ints', def: [0, 1, 2, 3, 4, 5, 10, 12, 100, 1000], minLen: 0, maxLen: 32, lo: -1000000, hi: 1000000, pool: [6, 7, 8, 9, 11, 20, 24, 25, 50, 60, 360, 365, 1024], scope: 'search', where: 'NUM_POOL' },
  { name: 'keyWords', kind: 'words', def: KEYWORDS_TODAY, minLen: 0, maxLen: 32, pool: ['with', 'by', 'at', 'as', 'than', 'between', 'per', 'like', 'means', 'say', 'number', 'name', 'letter', 'list'], scope: 'search', where: 'KEY_WORDS' },
  { name: 'nthPool', kind: 'ints', def: [1, 2, 3], minLen: 0, maxLen: 12, lo: -12, hi: 12, pool: [4, 5, -1, -2], scope: 'search', where: "seed ['sense.nth', [1, 2, 3]]" },
  { name: 'wordAtPool', kind: 'ints', def: [1, 2, 3, -1], minLen: 0, maxLen: 12, lo: -12, hi: 12, pool: [4, 5, -2, -3], scope: 'search', where: "seed ['sense.wordAt', [1, 2, 3, -1]]" },
  { name: 'bigList', kind: 'int', def: 300, min: 10, max: 3000, scale: 'log', scope: 'search', where: 'tooBig v.length > 300' },
  { name: 'bigText', kind: 'int', def: 4000, min: 100, max: 40000, scale: 'log', scope: 'search', where: 'tooBig v.length > 4000' },
].map((g) => f({ ...g, ...(Array.isArray(g.def) ? { def: f(g.def.slice()) } : {}), ...(Array.isArray(g.pool) ? { pool: f(g.pool.slice()) } : {}) })));

const BY_NAME = new Map(GENES.map((g) => [g.name, g]));
const isObj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
const round2 = (x) => Math.round(x * 100) / 100;
const freezeVal = (v) => (Array.isArray(v) ? f(v.slice()) : v);
const same = (a, b) => (Array.isArray(a) || Array.isArray(b) ? Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => x === b[i]) : a === b);

/** The defaults: today's constants of grow/neo.mjs, frozen. */
export const DEFAULTS = f(Object.fromEntries(GENES.map((g) => [g.name, g.def])));
/** The genes a trial may draw (scope "search"). */
export const SEARCH_GENES = f(GENES.filter((g) => g.scope === 'search').map((g) => g.name));

/**
 * Why a value is not a valid allele of a gene, or null when it is.
 * @param {object} g the gene
 * @param {*} v the value
 * @returns {string|null}
 */
function geneError(g, v) {
  switch (g.kind) {
    case 'int':
      if (!Number.isInteger(v)) return g.name + ' is not an integer';
      if (v < g.min || v > g.max) return g.name + ' ' + v + ' is outside [' + g.min + ', ' + g.max + ']';
      return null;
    case 'real':
      if (typeof v !== 'number' || !Number.isFinite(v)) return g.name + ' is not a finite number';
      if (v < g.min || v > g.max) return g.name + ' ' + v + ' is outside [' + g.min + ', ' + g.max + ']';
      return null;
    case 'perm': {
      if (!Array.isArray(v) || v.length !== g.def.length) return g.name + ' is not a list of ' + g.def.length;
      const s = new Set(v);
      if (s.size !== v.length || !g.def.every((x) => s.has(x))) return g.name + ' is not a permutation of ' + g.def.join(',');
      return null;
    }
    case 'ints': {
      if (!Array.isArray(v)) return g.name + ' is not a list';
      if (v.length < g.minLen || v.length > g.maxLen) return g.name + ' has ' + v.length + ' values, not ' + g.minLen + ' to ' + g.maxLen;
      if (!v.every((x) => Number.isInteger(x) && x >= g.lo && x <= g.hi)) return g.name + ' holds a value that is not an integer in [' + g.lo + ', ' + g.hi + ']';
      if (new Set(v).size !== v.length) return g.name + ' repeats a value';
      return null;
    }
    case 'words': {
      if (!Array.isArray(v)) return g.name + ' is not a list';
      if (v.length < g.minLen || v.length > g.maxLen) return g.name + ' has ' + v.length + ' words, not ' + g.minLen + ' to ' + g.maxLen;
      if (!v.every((x) => typeof x === 'string' && /^[a-z]{1,16}$/.test(x))) return g.name + ' holds a value that is not a lower case word';
      if (new Set(v).size !== v.length) return g.name + ' repeats a word';
      return null;
    }
    default: return g.name + ' has an unknown kind ' + g.kind;
  }
}

/**
 * Check a genome: every gene known, of its kind, inside its bounds; with partial false (the default) every gene present.
 * @param {object} g the genome
 * @param {{ partial?: boolean }} [opts]
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validate(g, { partial = false } = {}) {
  if (!isObj(g)) return { ok: false, errors: ['the genome is not an object'] };
  const errors = [];
  for (const k of Object.keys(g)) if (!BY_NAME.has(k)) errors.push(k + ' is not a gene');
  for (const gene of GENES) {
    if (!Object.hasOwn(g, gene.name)) { if (!partial) errors.push(gene.name + ' is missing'); continue; }
    const e = geneError(gene, g[gene.name]);
    if (e) errors.push(e);
  }
  return { ok: errors.length === 0, errors };
}

/**
 * The frozen genome of a parsed GENOME.json: each gene's value when it is valid, its default otherwise (a gene out of
 * bounds is never used, a gene this module does not know is left out).
 * @param {object|null} doc { genes: {...} } or a flat object of genes
 * @returns {Readonly<object>}
 */
export function genomeFrom(doc) {
  const src = isObj(doc) && isObj(doc.genes) ? doc.genes : isObj(doc) ? doc : {};
  const out = {};
  for (const gene of GENES) out[gene.name] = Object.hasOwn(src, gene.name) && geneError(gene, src[gene.name]) === null ? freezeVal(src[gene.name]) : gene.def;
  return f(out);
}

/**
 * The parsed <root>/neo/GENOME.json, or null (no file, not JSON, no file system).
 * @param {string} root the tree
 * @returns {object|null}
 */
export function readGenomeDoc(root) {
  const fs = typeof process !== 'undefined' && process && typeof process.getBuiltinModule === 'function' ? process.getBuiltinModule('node:fs') : null;
  if (!fs || typeof root !== 'string' || !root) return null;
  try { const j = JSON.parse(fs.readFileSync(root.replace(/[\\/]+$/, '') + '/' + GENOME_FILE, 'utf8')); return isObj(j) ? j : null; } catch { return null; }
}

/**
 * The genome a tree's engine runs with: <root>/neo/GENOME.json read gene by gene, the defaults (today's constants)
 * for anything missing, corrupt or out of bounds. Frozen.
 * @param {string} root the tree
 * @returns {Readonly<object>}
 */
export function genomeOf(root) { return genomeFrom(readGenomeDoc(root)); }

/** A 32 bit FNV-1a hash of a text, with a seed. */
function fnv(text, seed = 0x811c9dc5) {
  let h = seed >>> 0;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
/** A deterministic generator in [0, 1) from any seed (a number or a text): mulberry32 over the FNV hash of the seed. */
export function rng(seed) {
  let a = fnv(String(seed));
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** A stable text form of a genome (genes in GENES order, unknown keys left out). */
export function canonGenome(g) { return JSON.stringify(GENES.map((gene) => [gene.name, isObj(g) ? g[gene.name] : undefined])); }
/** 16 hex of two FNV-1a hashes of a text (an id, not a cryptographic digest). */
export function hashText(t) { const s = String(t); return fnv(s).toString(16).padStart(8, '0') + fnv(s, 0x01000193).toString(16).padStart(8, '0'); }
/** A short id of a genome: hashText of its stable text. */
export function genomeId(g) { return hashText(canonGenome(g)); }
/** The genes where b differs from a: [{ gene, from, to }] in GENES order. */
export function diff(a, b) {
  const out = [];
  for (const gene of GENES) if (!same(a[gene.name], b[gene.name])) out.push({ gene: gene.name, from: a[gene.name], to: b[gene.name] });
  return out;
}

/** One move of one gene, inside its bounds and different from v, or undefined when the gene cannot move. */
function move(gene, v, r) {
  const up = r() < 0.5;
  switch (gene.kind) {
    case 'int': {
      const cands = [];
      if (gene.scale === 'log') {
        const k = 1.25 + r() * 0.75; // a factor in [1.25, 2)
        const a = Math.max(v + 1, Math.round(v * k)), b = Math.min(v - 1, Math.round(v / k));
        cands.push(up ? a : b, up ? b : a);
      } else {
        const d = 1 + Math.floor(r() * Math.max(1, (gene.max - gene.min) / 10));
        cands.push(up ? v + d : v - d, up ? v - d : v + d);
      }
      for (const c of cands) { const x = Math.min(gene.max, Math.max(gene.min, c)); if (x !== v) return x; }
      return undefined;
    }
    case 'real': {
      const d = gene.step * (0.5 + r());
      for (const c of up ? [v + d, v - d] : [v - d, v + d]) { const x = round2(Math.min(gene.max, Math.max(gene.min, c))); if (x !== v) return x; }
      return undefined;
    }
    case 'perm': {
      if (v.length < 2) return undefined;
      const i = Math.floor(r() * v.length);
      let j = Math.floor(r() * (v.length - 1));
      if (j >= i) j++;
      const out = v.slice();
      [out[i], out[j]] = [out[j], out[i]];
      return out;
    }
    case 'ints':
    case 'words': {
      const absent = gene.pool.filter((x) => !v.includes(x));
      const canAdd = absent.length > 0 && v.length < gene.maxLen, canDrop = v.length > gene.minLen;
      if (!canAdd && !canDrop) return undefined;
      if (canAdd && (!canDrop || up)) return [...v, absent[Math.floor(r() * absent.length)]];
      const i = Math.floor(r() * v.length);
      return v.filter((_, j) => j !== i);
    }
    default: return undefined;
  }
}

/**
 * A mutant of a genome: one gene (seven draws in ten) or two moved, chosen among the search genes (or the given ones),
 * deterministic for the seed, always valid. The input genome is read through genomeFrom, so an out of bounds input is
 * mutated from its defaults.
 * @param {object} genome the genome
 * @param {number|string} seed the seed
 * @param {{ genes?: string[] }} [opts] the genes that may move (default SEARCH_GENES)
 * @returns {{ genome: Readonly<object>, change: { gene: string, from: *, to: * }[] }}
 */
export function mutate(genome, seed, { genes = SEARCH_GENES } = {}) {
  const base = genomeFrom(genome);
  const names = [...new Set((Array.isArray(genes) ? genes : SEARCH_GENES).filter((n) => BY_NAME.has(n)))];
  const r = rng('mutate:' + String(seed));
  const want = names.length > 1 && r() >= 0.7 ? 2 : 1;
  const left = names.slice(), next = { ...base };
  let moved = 0;
  while (left.length && moved < want) {
    const name = left.splice(Math.floor(r() * left.length), 1)[0];
    const to = move(BY_NAME.get(name), base[name], r);
    if (to === undefined) continue;
    next[name] = freezeVal(to);
    moved++;
  }
  const out = f(next);
  return { genome: out, change: diff(base, out) };
}

/**
 * A child of two genomes: each gene taken whole from a or from b by a seeded coin (so a permutation stays one).
 * @param {object} a a genome
 * @param {object} b a genome
 * @param {number|string} seed the seed
 * @returns {{ genome: Readonly<object>, change: { gene: string, from: *, to: * }[] }} change: where the child differs from a
 */
export function crossover(a, b, seed) {
  const A = genomeFrom(a), B = genomeFrom(b), r = rng('crossover:' + String(seed)), out = {};
  for (const gene of GENES) out[gene.name] = r() < 0.5 ? A[gene.name] : B[gene.name];
  const g = f(out);
  return { genome: g, change: diff(A, g) };
}

const show = (v) => (Array.isArray(v) ? '[' + v.join(',') + ']' : String(v));
/**
 * One line for a change: a list of gene moves ("maxCost 7 -> 8; enumShare 0.8 -> 0.7"), a macro change
 * ({ op: "add"|"retire", name, params, size }), or nothing.
 * @param {*} change the change
 * @returns {string}
 */
export function describe(change) {
  if (Array.isArray(change)) return change.length ? change.map((c) => (isObj(c) ? c.gene + ' ' + show(c.from) + ' -> ' + show(c.to) : String(c))).join('; ') : 'no change';
  if (isObj(change) && typeof change.op === 'string') {
    const tail = change.op === 'add' ? ' (' + (change.size ?? '?') + ' nodes, ' + (change.params ?? 0) + ' params, ' + (Array.isArray(change.from) ? change.from.length : 0) + ' tasks)' : change.why ? ' (' + change.why + ')' : '';
    return change.op + ' ' + String(change.name) + tail;
  }
  return 'no change';
}
