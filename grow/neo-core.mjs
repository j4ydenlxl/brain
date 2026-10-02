// grow/neo-core.mjs: THE PURE SEARCH of the NEO engine and its GATE (contract c4: "the phone browser runs the same
// search the cloud runs"). It imports nothing but ./neo-kernel.mjs: no built-in module, no host object, no disk, so a
// browser imports it as it is. grow/neo.mjs (the cloud's CLI: reading, SELECT, PROMOTE, STAGE) imports it and adds the
// file system around it; the search itself is here, moved from grow/neo.mjs unchanged in behaviour.
//
//   spawn({ task, rows, negatives, gen, parents, budget, expectOk, packs, source, cursor, trace })  the kept cells of a
//                               task and the search's stats (stats.cursor: where the next grow of the task continues)
//   withKnowledge(packs, fn)    fn run with exactly these knowledge packs in the kernel (a module's own slices)
//   usesKnow(cell)              whether a cell uses the know family (its index row is tagged know: true)
//   OPEN_MAX, OPEN_WORDS, OPEN_TOPIC_DIV, OPEN_FAIL_DIV  the open guard: spawn also keeps a knowledge-backed pyramid guarded by exclusion
//                               only (negatives as { q, group } name the groups its topic rule counts)
//   cursorBasis(rows, packs)    what a search depends on, as a sha; resumeCursor(cursor, basis) where it continues
//   rowsOf(list, skip)          rows in the engine's shape; skip(q) true leaves a prompt out (grow/retire.mjs in the cloud)
//   passesRow(out, row)         the pass rule of a cell output on a row
//   expectOk(got, expect)       judge/judge.mjs expectOk, copied (test/neo-gate.test.mjs proves them equal)
//   familyOf(cell)              the family a cell is counted under
// THE GATE (contract c2): a tier "neo" colony of grown/ answers only while it is mastered (serve true) and only a prompt
// that fits its task's question template exactly. A template is derived from the task's dev prompts: the words most
// prompts share are FIXED, the runs of other words between them are entity SLOTS ("what is the capital of {1-4}"; a
// slot every dev prompt fills with digits is numeric, "{#1-1}"). Other words, another relation's words or a missing
// slot fit no template, so the colony stays silent.
//   gateText(q)                 the text a template fits: the kernel's norm level 1
//   deriveTemplates(prompts)    the templates of a task's dev prompts, most supported first
//   templateSource(spec)        the anchored regular expression of one template, as text
//   validTemplate(spec)         whether a template is well formed (only words and slots)
//   fitsTemplates(specs, q)     whether q fits one of the templates exactly
//   isMastered(heldout)         the engine's mastered rule: held-out score 1 (every row of n > 0 right)
//   GATE_SOURCE                 the gate as source text, inlined by grow/store.mjs renderIndexMjs into grown/index.mjs
// Author: THE ENGINE builder, part 1 (gate, stage, core), 2026-10-01; part 2 (knowledge-backed cells, THE CURSOR), 2026-10-01.
import {
  PRIMS, STOP_WORDS, argTypes, evalNode, guardOk, runCell, norm, makeColony, makeCell, checkCell, canon, numbersIn, knowLoad, knowNorm, sha256Hex,
} from './neo-kernel.mjs';

/** The default search budget: candidates evaluated and milliseconds (grow/NEO.md, "The engine", step 1). */
export const BUDGET = Object.freeze({ maxGenerated: 200000, maxMs: 60000 });
/** The highest pyramid cost the enumeration reaches (a primitive named by the prompts costs 1, any other 2, a literal 1). */
export const MAX_COST = 7;
/** The share of the budget the enumeration may spend; the templates, memory, yes/no pairs and mutants spend the rest. */
export const ENUM_SHARE = 0.8;

/** Prompts every cell must stay silent on (grow/NEO.md step 3): greetings, questions about the organism, plain arithmetic. */
export const BUILTIN_NEGATIVES = Object.freeze({
  greetings: Object.freeze(['hi', 'hello', 'hey', 'hey there', 'hello there', 'good morning', 'good evening', 'good night',
    'thanks', 'thank you', 'thank you so much', 'bye', 'goodbye', 'see you later', 'how are you', 'how are you doing',
    'whats up', "what's up", 'nice to meet you', 'ok', 'cool', 'yes', 'no']),
  organism: Object.freeze(['who are you', 'what is your name', 'are you an ai', 'what can you do', 'who made you',
    'are you alive', 'how do you work', 'what are you', 'do you have feelings', 'tell me about yourself']),
  arithmetic: Object.freeze(['what is 7 plus 5', 'what is 12 times 3', 'what is 9 minus 4', 'what is 100 divided by 4',
    'add 6 and 9', 'multiply 6 by 7', '2 + 2', '15 - 8', 'what is 8 * 9', 'what is 45 / 5', 'subtract 4 from 10',
    'what is 3 squared']),
});
/** The built-in negatives as one list, in the order of BUILTIN_NEGATIVES. */
export const BUILTIN_LIST = Object.freeze([...BUILTIN_NEGATIVES.greetings, ...BUILTIN_NEGATIVES.organism, ...BUILTIN_NEGATIVES.arithmetic]);

export class Fail extends Error { constructor(msg, code = 1) { super(msg); this.code = code; } }

// ---------------------------------------------------------------- small helpers
const STOP = new Set(STOP_WORDS);
const isObj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
const cmpStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const words1 = (q) => norm(q, 1).split(' ').filter(Boolean);
const isNumWord = (w) => /^\d+$/.test(w);

// ---------------------------------------------------------------- the grader: judge/judge.mjs expectOk, copied
/** grow/contract.mjs REFUSAL_RE, copied (a refusal is never a right answer under notRefusal, never a memory value). */
export const REFUSAL_RE = /^(?:nothing in memory matches|I do not carry that yet|I am growing a cell)/i;
const CLAUSES = Object.freeze(['equals', 'contains', 'containsAny', 'notContains', 'minWords', 'maxWords', 'notRefusal']);
const LISTS = new Set(['contains', 'containsAny', 'notContains']);
const low = (s) => String(s ?? '').trim().toLowerCase();
/** Whether an expect is malformed (no clause, an unknown clause, a malformed clause): it fails closed. */
function expectBad(e) {
  if (!isObj(e)) return true;
  const keys = Object.keys(e);
  if (!keys.length) return true;
  for (const k of keys) {
    if (!CLAUSES.includes(k)) return true;
    const v = e[k];
    if (LISTS.has(k) && (!Array.isArray(v) || !v.length || !v.every((s) => typeof s === 'string' && s.trim().length))) return true;
    if ((k === 'minWords' || k === 'maxWords') && !(Number.isInteger(v) && v >= 0)) return true;
    if (k === 'equals' && typeof v !== 'string') return true;
    if (k === 'notRefusal' && v !== true) return true;
  }
  return false;
}
/**
 * True only when got meets every clause of expect: judge/judge.mjs expectOk with the same rules (trimmed,
 * case-insensitive, a non-text got fails, a malformed expect fails closed, words are runs of non-space characters).
 * @param {string|null} got the answer
 * @param {object} e the expect
 * @returns {boolean}
 */
export function expectOk(got, e) {
  if (expectBad(e) || typeof got !== 'string') return false;
  const raw = got.trim(), text = raw.toLowerCase();
  if (e.notRefusal === true && REFUSAL_RE.test(raw)) return false;
  if (e.equals !== undefined && text !== low(e.equals)) return false;
  if (e.contains && !e.contains.every((n) => text.includes(low(n)))) return false;
  if (e.containsAny && !e.containsAny.some((n) => text.includes(low(n)))) return false;
  if (e.notContains && e.notContains.some((n) => text.includes(low(n)))) return false;
  const words = (raw.match(/\S+/g) || []).length;
  if (e.minWords !== undefined && words < e.minWords) return false;
  if (e.maxWords !== undefined && words > e.maxWords) return false;
  return true;
}
/** The grader the running spawn uses: the copy above, or the one its caller passes (grow/neo.mjs passes the judge's). */
let OK = expectOk;

/**
 * Rows of one task or class in the engine's shape { q, expect, answer? }; a row without a prompt or an expect object is
 * left out, and so is a prompt skip(q) names (grow/neo.mjs passes grow/retire.mjs isRetired).
 * @param {object[]} list rows ({ q } or { prompt }, expect, answer or reply)
 * @param {((q: string) => boolean)|null} skip the prompts to leave out
 * @returns {{ q: string, expect: object, answer?: string }[]}
 */
export function rowsOf(list, skip = null) {
  const out = [];
  for (const r of Array.isArray(list) ? list : []) {
    if (!isObj(r)) continue;
    const q = typeof r.q === 'string' ? r.q : typeof r.prompt === 'string' ? r.prompt : null;
    if (!q || !q.trim() || !isObj(r.expect)) continue;
    if (typeof skip === 'function' && skip(q)) continue;
    const a = typeof r.answer === 'string' ? r.answer : typeof r.reply === 'string' ? r.reply : null;
    out.push(a !== null && a.trim() ? { q, expect: r.expect, answer: a } : { q, expect: r.expect });
  }
  return out;
}

// ---------------------------------------------------------------- rows, features and the pass rule
const strOrNull = (v) => (typeof v === 'string' && v.trim() ? v : null);
function prepRow(r) {
  const q1 = norm(r.q, 1);
  return { q: r.q, expect: r.expect, answer: typeof r.answer === 'string' ? r.answer : null, q1, w1: q1 ? q1.split(' ').length : 0, a1: typeof r.answer === 'string' ? ' ' + norm(r.answer, 1) + ' ' : null };
}
/**
 * Whether an output passes a row: judge/judge.mjs expectOk, and for a row with an answer the output lies inside that
 * answer (norm level 1, whole words), for a row without one the output does not echo the whole prompt back.
 * @param {string|null} out the output
 * @param {{ q: string, expect: object, answer?: string }} row the row
 * @returns {boolean}
 */
export function passesRow(out, row) { return passes(out, row.q1 === undefined ? prepRow(row) : row); }
function passes(out, row) {
  if (typeof out !== 'string' || !out.trim() || !OK(out, row.expect)) return false;
  const o = norm(out, 1);
  if (!o) return false;
  if (row.a1 !== null) return row.a1.includes(' ' + o + ' ');
  return !(row.w1 >= 3 && (' ' + o + ' ').includes(' ' + row.q1 + ' '));
}
/** The kernel's guard features of a prompt (grow/neo-kernel.mjs featuresOf; quoted through the kernel's own guard). */
function featOf(q) {
  const l1 = norm(q, 1);
  return { l0: norm(q, 0), pad: ' ' + l1 + ' ', words: l1 ? l1.split(' ') : [], nums: numbersIn(q).length, colon: q.includes(':'), quoted: guardOk([['quoted']], q) };
}
function holds(ft, f) {
  const [k, a] = ft;
  switch (k) {
    case 'has': { const p = norm(a, 1); return !!p && f.pad.includes(' ' + p + ' '); }
    case 'hasAny': return a.some((w) => holds(['has', w], f));
    case 'starts': return f.l0.startsWith(a.trim().toLowerCase());
    case 'ends': return f.l0.endsWith(a.trim().toLowerCase());
    case 'nums>=': return f.nums >= a;
    case 'nums==': return f.nums === a;
    case 'words<=': return f.words.length <= a;
    case 'words>=': return f.words.length >= a;
    case 'colon': return f.colon;
    case 'quoted': return f.quoted;
    case 'not': return !holds(a, f);
    default: return false;
  }
}

// ---------------------------------------------------------------- the search: pools, named primitives, enumeration
const PRIM_NAMES = Object.freeze(Object.keys(PRIMS));
const ARGS = Object.freeze(Object.fromEntries(PRIM_NAMES.map((n) => [n, argTypes(n)])));
const INTERIOR = new Set(['transform', 'aggregate', 'compare', 'compute', 'iterate']);
const ALIAS_FAMILIES = new Set(['transform', 'aggregate', 'compare', 'compute']);
const SPAN_TYPES = new Set(['num', 'str', 'nums', 'strs']);
const KEY_WORDS = Object.freeze(['of', 'for', 'to', 'about', 'on', 'in', 'from', 'is', 'called', 'named', 'word', 'phrase', 'into']);
const NUM_POOL = Object.freeze([0, 1, 2, 3, 4, 5, 10, 12, 100, 1000]);
const MUTANT_CAP = 2000;
/** The entries of one template window (THE CURSOR: round r takes the r-th window) and the most slots a template fills. */
const SPAN_WINDOW = 3000;
const MAX_SLOTS = 6;

/** The primitives the prompts name: an alias phrase (not all stop words) in a prompt, or a word stem of one. */
function namedPrims(qs) {
  const pads = qs.map((q) => ' ' + norm(q, 1) + ' ');
  const vocab = [...new Set(pads.flatMap((p) => p.trim().split(' ').filter(Boolean)))];
  const named = new Set();
  for (const name of PRIM_NAMES) {
    for (const w of PRIMS[name].words) {
      const ph = norm(w, 1);
      if (!ph || ph.split(' ').every((x) => STOP.has(x))) continue;
      const stem = !ph.includes(' ') && ph.length >= 4 && vocab.some((x) => x.startsWith(ph) && x.length - ph.length <= 3);
      if (stem || pads.some((p) => p.includes(' ' + ph + ' '))) { named.add(name); break; }
    }
  }
  return named;
}
/** The literal pools: keywords for the sense primitives that take one, numbers and strings the rows share. */
function poolsOf(rows) {
  const n = rows.length, df = new Map();
  for (const r of rows) for (const w of new Set(words1(r.q))) df.set(w, (df.get(w) || 0) + 1);
  const keywords = KEY_WORDS.filter((w) => (df.get(w) || 0) >= Math.min(2, n));
  const content = [...df].filter(([w, c]) => !STOP.has(w) && !isNumWord(w) && w.length >= 3 && c >= Math.max(2, n / 2))
    .sort((a, b) => b[1] - a[1] || cmpStr(a[0], b[0])).map(([w]) => w).slice(0, 6);
  const numDf = new Map(), wordDf = new Map(), expDf = new Map();
  for (const r of rows) {
    if (typeof r.answer === 'string') {
      for (const v of new Set(numbersIn(r.answer))) if (typeof v === 'number' && Number.isSafeInteger(v) && Math.abs(v) <= 1e6) numDf.set(v, (numDf.get(v) || 0) + 1);
      for (const w of new Set(words1(r.answer))) if (!STOP.has(w) && !isNumWord(w) && w.length >= 3) wordDf.set(w, (wordDf.get(w) || 0) + 1);
    }
    const e = r.expect, said = new Set([...(Array.isArray(e.contains) ? e.contains : []), ...(Array.isArray(e.containsAny) ? e.containsAny : []), ...(typeof e.equals === 'string' ? [e.equals] : [])]);
    for (const s of said) if (typeof s === 'string' && s.trim()) expDf.set(s, (expDf.get(s) || 0) + 1);
  }
  const shared = (m, cap) => [...m].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).map(([k]) => k).slice(0, cap);
  const nums = [...new Set([...NUM_POOL, ...shared(numDf, 10)])];
  const strs = [...new Set([...shared(expDf, 10), ...shared(wordDf, 6)])];
  return { keywords: [...new Set([...keywords, ...content])], nums, strs };
}
/** A value too large to compare cheaply is left out of the pool (the kernel still computes it; the search skips it). */
function tooBig(v) {
  if (typeof v === 'string') return v.length > 4000;
  if (typeof v === 'bigint') return v.toString(16).length > 1700;
  if (Array.isArray(v)) return v.length > 300 || v.some(tooBig);
  if (isObj(v)) return Object.keys(v).length > 100;
  return false;
}
function isConst(vec) {
  if (vec[0] === null) return false;
  const k = canon(vec[0]);
  for (let i = 1; i < vec.length; i++) if (vec[i] === null || (vec[i] !== vec[0] && canon(vec[i]) !== k)) return false;
  return true;
}
function newSearch(rows, budget, t0, named, at = {}) {
  return {
    rows, n: rows.length, ctx: rows.map((r) => ({ q: r.q, mem: null })), named, t0, ticks: 0, generated: 0, stop: null,
    limit: budget.maxGenerated, msLimit: budget.maxMs, capped: null, seen: new Map(), entries: [], byCost: {}, bools: [],
    outsSeen: new Set(), cands: [], phrases: [],
    // THE CURSOR: the round of this task's search, the enumeration combos the rounds before it offered (rebuilt here
    // without offering), the highest cost it reaches and the template window; combos counts every combo evaluated
    round: at.round || 0, replay: at.replay || 0, maxCost: at.maxCost || MAX_COST, window: at.window || 0, combos: 0, where: null,
    trace: at.trace ? [] : null,
  };
}
function spent(S) {
  if (S.stop) return true;
  if (S.generated >= S.limit) { S.stop = 'generated'; return true; }
  if ((++S.ticks & 255) === 0 && Date.now() - S.t0 > S.msLimit) { S.stop = 'ms'; S.capped = 'ms'; return true; }
  return false;
}
function addEntry(S, node, type, vec, cost, konst = null) {
  if (!vec.some((v) => v !== null)) return null;
  const key = type + '|' + canon(vec);
  if (S.seen.has(key)) return null;
  const e = { id: S.entries.length, node, type, vec, cost, konst: konst ?? isConst(vec) };
  S.seen.set(key, e.id);
  S.entries.push(e);
  const byT = S.byCost[type] || (S.byCost[type] = []);
  (byT[cost] || (byT[cost] = [])).push(e);
  return e;
}
/** One primitive over argument entries on every dev prompt, with evalNode's rule: a null argument is a null value. */
function applyPrim(S, name, args) {
  const fn = PRIMS[name].fn, k = args.length, out = new Array(S.n);
  let any = false;
  for (let i = 0; i < S.n; i++) {
    const vals = new Array(k);
    let miss = false;
    for (let j = 0; j < k; j++) { const v = args[j].vec[i]; if (v === null) { miss = true; break; } vals[j] = v; }
    if (miss) { out[i] = null; continue; }
    const v = fn(vals, S.ctx[i]);
    if (v !== null && tooBig(v)) return null;
    out[i] = v;
    if (v !== null) any = true;
  }
  return any ? out : null;
}
/** The pool at cost 1 and 2: the prompt's own values first (a value of the prompt beats an equal literal), then literals. */
function seed(S, pools) {
  for (const name of PRIM_NAMES) {
    if (PRIMS[name].family !== 'sense' || ARGS[name].length) continue;
    S.generated++;
    const vec = applyPrim(S, name, []);
    if (vec) addEntry(S, [name], PRIMS[name].out, vec, 1);
  }
  const lit = (v) => ({ vec: new Array(S.n).fill(v) });
  for (const [name, vals] of [['sense.after', pools.keywords], ['sense.before', pools.keywords], ['sense.nth', [1, 2, 3]], ['sense.wordAt', [1, 2, 3, -1]], ['sense.dateAt', [2]]]) {
    for (const v of vals) {
      S.generated++;
      const vec = applyPrim(S, name, [lit(v)]);
      if (vec) addEntry(S, [name, { lit: v }], PRIMS[name].out, vec, 2);
    }
  }
  for (const v of pools.nums) addEntry(S, { lit: v }, 'num', new Array(S.n).fill(v), 1, true);
  for (const s of pools.strs) addEntry(S, { lit: s }, 'str', new Array(S.n).fill(s), 2, true);
}
// ---------------------------------------------------------------- knowledge: the facts of the packs (contract c5)
// A task born from a source (its ledger row by "absorb:<source>") starts from that source's pack; a task with none tries
// the KNOW_PACKS packs whose keys most of its dev prompts name. Each pack column gives the keys a prompt names (know.find)
// and the first, second and last of them; each pair of columns the value of a key (know.lookup, the reverse lookup being
// the pair the other way round); a number column the number, the larger and the smaller of two keys, their sum and their
// difference; a class column (yes or no) the truth of a key and the one key of a list with that class. They are seeded
// before the prompt's own values, so the template slots a fact fills are filled by the fact.
/** The most packs a task with no source of its own tries. */
export const KNOW_PACKS = 3;
/** A column of at most this many distinct values (at least two, each twice on average) is a class column. */
const KNOW_CLASSES = 4;
/** The keys of a prompt a seed takes: the first, the second, the last. */
const KNOW_NTH = Object.freeze([1, 2, -1]);
const EMPTY_PACKS = Object.freeze([]);
let KNOW_LOADED = null;
/** The kernel's packs become these, loaded once for the same list (the kernel keeps each column's keys while loaded). */
function knowUse(packs) { if (packs !== KNOW_LOADED) { knowLoad(packs); KNOW_LOADED = packs; } }
/**
 * Run fn with exactly these packs in the kernel (a compiled colony's own slices: grow/neo.mjs scores a colony with the
 * facts its module carries), then empty the kernel's packs; the next spawn loads its own again.
 * @param {object[]} packs knowledge packs in any form the kernel's knowLoad takes
 * @param {() => any} fn
 * @returns {any} what fn returns
 */
export function withKnowledge(packs, fn) {
  KNOW_LOADED = null;
  knowLoad(Array.isArray(packs) ? packs : EMPTY_PACKS);
  try { return fn(); } finally { knowLoad(EMPTY_PACKS); KNOW_LOADED = null; }
}
const isPack = (p) => isObj(p) && typeof p.id === 'string' && Array.isArray(p.columns) && p.columns.every((c) => typeof c === 'string');
const PACK_INFO = new WeakMap();
/** The number columns (every non-empty cell a number) and class columns (their values, sorted) of a pack in row form. */
function packInfo(p) {
  let info = PACK_INFO.get(p);
  if (info) return info;
  const rows = Array.isArray(p.rows) ? p.rows : [], num = new Set(), classes = new Map();
  p.columns.forEach((c, j) => {
    let nums = 0, other = 0;
    const vals = new Map();
    for (const r of rows) {
      const v = Array.isArray(r) ? r[j] : undefined;
      if (typeof v === 'number' && Number.isFinite(v)) nums++;
      else if (typeof v === 'string' && v.trim()) other++;
      else continue;
      if (vals.size <= KNOW_CLASSES) { const k = knowNorm(v); if (k && !vals.has(k)) vals.set(k, String(v)); }
    }
    if (nums && !other) num.add(c);
    if (!nums && vals.size >= 2 && vals.size <= KNOW_CLASSES && rows.length >= 2 * vals.size) classes.set(c, [...vals.values()].sort(cmpStr));
  });
  info = { num, classes };
  PACK_INFO.set(p, info);
  return info;
}
/** The packs a task's search starts from: its source's pack, else the KNOW_PACKS packs whose keys most dev prompts name (half at least). */
function knowPacks(R, packs, source) {
  const valid = (Array.isArray(packs) ? packs : []).filter(isPack);
  const own = typeof source === 'string' ? valid.filter((p) => p.id === source) : [];
  if (own.length) return own.slice(-1);
  const scored = [];
  for (const p of valid) {
    let best = 0;
    for (const c of p.columns) {
      let n = 0;
      for (const r of R) if (evalNode(['know.find', { lit: p.id }, { lit: c }], r.q, null) !== null) n++;
      best = Math.max(best, n);
    }
    if (best && best * 2 >= R.length) scored.push({ p, best });
  }
  return scored.sort((a, b) => b.best - a.best || cmpStr(a.p.id, b.p.id)).slice(0, KNOW_PACKS).map((x) => x.p);
}
/** What the packs a search uses are (for THE CURSOR's basis): each id and its sha (or its columns and row count). */
const packsKey = (use) => use.map((p) => [p.id, typeof p.sha === 'string' ? p.sha : [p.columns, Array.isArray(p.rows) ? p.rows.length : p.n]]);
/** The knowledge seeds of the chosen packs (offered under their render only in round 0; rebuilt in every round). */
function knowSeed(S, use) {
  const lit = (v) => ({ lit: v });
  const put = (node, cost) => {
    if (!S.round) S.generated++;
    const vec = new Array(S.n);
    let any = false;
    for (let i = 0; i < S.n; i++) { const v = evalNode(node, S.rows[i].q, null); vec[i] = v !== null && tooBig(v) ? null : v; if (vec[i] !== null) any = true; }
    const type = PRIMS[node[0]].out;
    const e = any ? addEntry(S, node, type, vec, cost) : null;
    if (e && !e.konst && !S.round && type !== 'strs') apex(S, e);
    return any;
  };
  for (const p of use) {
    const id = lit(p.id), info = packInfo(p);
    for (const kc of p.columns) {
      const F = ['know.find', id, lit(kc)];
      if (!put(F, 1)) continue;
      const E = KNOW_NTH.map((k) => ['transform.nthStr', F, lit(k)]);
      const hasE = E.map((e) => put(e, 1));
      for (const vc of p.columns) {
        if (vc === kc) continue;
        const Ls = E.map((e) => ['know.lookup', e, id, lit(kc), lit(vc)]);
        const live = Ls.map((l, j) => hasE[j] && put(l, 2));
        if (info.num.has(vc)) {
          const N = Ls.map((l) => ['know.num', l]);
          N.forEach((n, j) => { if (live[j]) put(n, 2); });
          if (live[0] && live[1]) { // two keys of one prompt: the larger, the smaller, the sum, the difference
            const G = ['compare.greater', N[0], N[1]];
            put(G, 3);
            const BIG = ['route.if', G, E[0], E[1]], SMALL = ['route.if', G, E[1], E[0]];
            for (const W of [BIG, SMALL]) if (put(W, 3)) put(['know.lookup', W, id, lit(kc), lit(vc)], 3);
            put(['transform.add', N[0], N[1]], 3);
            put(['transform.sub', N[0], N[1]], 3);
          }
        }
        const cls = info.classes.get(vc);
        if (cls && live[0]) for (const v of cls) {
          put(['compare.sameText', Ls[0], lit(v)], 3);
          put(['transform.nthStr', ['know.where', F, id, lit(kc), lit(vc), lit(v)], lit(1)], 3);
        }
      }
    }
  }
}
function splits(rem, k) {
  if (k === 1) return [[rem]];
  const out = [];
  for (let a = 1; a <= rem - (k - 1); a++) for (const rest of splits(rem - a, k - 1)) out.push([a, ...rest]);
  return out;
}
/**
 * Bottom-up enumeration, cost 2 to S.maxCost (MAX_COST in a first round); false when the budget stopped it, and then
 * S.where names the cost and the primitive it stopped at. The first S.replay combos are the ones earlier rounds
 * offered: they are evaluated again (the pool they build is the arguments of every later combo) but offer nothing.
 */
function enumerate(S) {
  const weight = (name) => (S.named.has(name) ? 1 : 2);
  const order = PRIM_NAMES.filter((n) => INTERIOR.has(PRIMS[n].family) && ARGS[n].length && !ARGS[n].includes('tpl'))
    .sort((a, b) => (S.named.has(b) - S.named.has(a)) || cmpStr(a, b));
  for (let c = 2; c <= S.maxCost; c++) {
    for (const name of order) {
      const ts = ARGS[name], rem = c - weight(name);
      if (rem < ts.length) continue;
      for (const sp of splits(rem, ts.length)) {
        const lists = ts.map((t, j) => (S.byCost[t] && S.byCost[t][sp[j]]) || null);
        if (lists.some((l) => !l || !l.length)) continue;
        if (!product(S, name, lists, c)) { S.where = { cost: c, prim: name }; return false; }
      }
    }
  }
  return true;
}
function product(S, name, lists, cost) {
  const k = lists.length, idx = new Array(k).fill(0), args = new Array(k), out = PRIMS[name].out;
  for (;;) {
    let konst = true;
    for (let j = 0; j < k; j++) { args[j] = lists[j][idx[j]]; if (!args[j].konst) konst = false; }
    if (!konst) { // a constant made of constants is a literal the pool already holds
      if (spent(S)) return false;
      const silent = S.combos < S.replay; // an earlier round offered this combo: its value is rebuilt, never offered again
      S.combos++;
      if (!silent) S.generated++;
      const vec = applyPrim(S, name, args);
      if (vec) {
        const e = addEntry(S, [name, ...args.map((a) => a.node)], out, vec, cost);
        if (e && !e.konst && !silent) apex(S, e);
      }
    }
    let j = k - 1;
    while (j >= 0) { idx[j]++; if (idx[j] < lists[j].length) break; idx[j] = 0; j--; }
    if (j < 0) return true;
  }
}

// ---------------------------------------------------------------- the apex: every new value under the render of its type
/**
 * Whether an entry is transform.asText of a list of numbers: its render.and is the very pyramid the numbers' own chain
 * (transform.asText, then render.and) offered when they were made, so it is not offered twice (THE CURSOR: a later round
 * that makes it would offer again what an earlier round offered).
 */
const asTextOfNums = (e) => e.type === 'strs' && Array.isArray(e.node) && e.node[0] === 'transform.asText';
function apexChains(S, e) {
  const nm = S.named, out = [];
  switch (e.type) {
    case 'num':
      out.push([['render.number']]);
      if (e.vec.some((v) => typeof v === 'number' && !Number.isInteger(v))) out.push([['render.decimals', 2]]);
      for (const r of ['render.percent', 'render.money', 'render.ordinal']) if (nm.has(r)) out.push([[r]]);
      break;
    case 'nums': out.push([['render.listNums']], [['transform.asText'], ['render.and']]); break;
    case 'str': out.push([['render.str']]); for (const r of ['render.sentence', 'render.code']) if (nm.has(r)) out.push([[r]]); break;
    case 'strs': out.push([['render.list']], ...(asTextOfNums(e) ? [] : [[['render.and']]]), [['render.lines']]); for (const r of ['render.numbered', 'render.bullets']) if (nm.has(r)) out.push([[r]]); break;
    case 'kv': out.push([['render.json']], [['render.kvLines']]); if (nm.has('render.date')) out.push([['render.date']]); break;
    case 'bool': S.bools.push(e); break;
    default: break;
  }
  return out;
}
function chainNode(node, chain) { let n = node; for (const [name, ...extra] of chain) n = [name, n, ...extra.map((v) => ({ lit: v }))]; return n; }
function chainOuts(S, vec, chain) {
  const out = new Array(S.n);
  for (let i = 0; i < S.n; i++) {
    let v = vec[i];
    for (const [name, ...extra] of chain) { if (v === null) break; v = PRIMS[name].fn([v, ...extra], S.ctx[i]); }
    out[i] = strOrNull(v);
  }
  return out;
}
function apex(S, e) {
  for (const chain of apexChains(S, e)) {
    if (spent(S)) return;
    S.generated++;
    offer(S, { pyramid: chainNode(e.node, chain), mem: null, outs: chainOuts(S, e.vec, chain), src: 'enum' });
  }
}
/** A candidate that passes at least one dev row joins the candidates (dedupe: one per vector of outputs). */
function offer(S, cand, dedupe = true) {
  if (S.trace && cand.src !== 'parent') S.trace.push(cand.src + ' ' + canon([cand.pyramid, cand.mem])); // a parent is kept, not generated
  if (dedupe) { const k = canon(cand.outs); if (S.outsSeen.has(k)) return false; S.outsSeen.add(k); }
  const pass = cand.outs.map((o, i) => passes(o, S.rows[i]));
  if (!pass.includes(true)) return false;
  cand.pass = pass;
  S.cands.push(cand);
  return true;
}
const evalOuts = (S, pyramid, mem) => S.rows.map((r) => strOrNull(evalNode(pyramid, r.q, mem)));

// ---------------------------------------------------------------- templates: anti-unification of prompt and answer
const WORDCH = /[\p{L}\p{N}]/u;
/** The first whole-word occurrence of needle in hay (both lower case), or -1. */
function firstBounded(hay, needle, from = 0) {
  if (!needle) return -1;
  for (let i = hay.indexOf(needle, from); i >= 0; i = hay.indexOf(needle, i + 1)) {
    const a = i === 0 || !WORDCH.test(hay[i - 1]), b = i + needle.length >= hay.length || !WORDCH.test(hay[i + needle.length]);
    if (a && b) return i;
  }
  return -1;
}
function spanModes(type) {
  if (type === 'num') return [[['render.number']], [['render.plain']]];
  if (type === 'str') return [[]];
  if (type === 'nums') return [[['render.listNums']], [['transform.asText'], ['render.and']]];
  if (type === 'strs') return [[['render.list']], [['render.and']]];
  return [];
}
/**
 * Whether a node carries a text literal anywhere but as the keyword of a sense primitive or a pack, column or value
 * name of a know primitive (a slot is a value of the prompt, or a fact a pack holds for it).
 */
function wordLiteral(node, parent = null) {
  if (isObj(node)) return typeof node.lit === 'string' && !(parent && (PRIMS[parent].family === 'sense' || PRIMS[parent].family === 'know'));
  return Array.isArray(node) && node.slice(1).some((c) => wordLiteral(c, node[0]));
}
/** Every whole-word occurrence of needle in hay (both lower case), at most 8. */
function allBounded(hay, needle) {
  const out = [];
  for (let p = firstBounded(hay, needle); p >= 0 && out.length < 8; p = firstBounded(hay, needle, p + 1)) out.push(p);
  return out;
}
/**
 * The span pool: (entry, render) pairs whose text is found in at least two answers (one when only one row is
 * answered), with every place it is found (a median is also one of the listed numbers, so its own place is a later one).
 */
function spanPool(S, ans, low) {
  const spans = [], need = Math.min(2, ans.length);
  // THE CURSOR: a round takes the SPAN_WINDOW entries past the ones the rounds before it took, so each round fills other
  // templates (the entries come in the same order in every round: a round rebuilds the earlier rounds' pool first)
  const pool = S.entries.filter((e) => e.cost <= 4 && !e.konst && SPAN_TYPES.has(e.type) && !wordLiteral(e.node)).slice(S.window, S.window + SPAN_WINDOW);
  S.tplNext = S.window + pool.length;
  for (const e of pool) {
    for (const chain of spanModes(e.type).filter((ch) => !(asTextOfNums(e) && ch.length === 1 && ch[0][0] === 'render.and'))) {
      const texts = chain.length ? chainOuts(S, e.vec, chain) : e.vec.map(strOrNull);
      const hits = new Map();
      for (const i of ans) {
        const t = texts[i];
        if (t === null || !low[i] || words1(t).every((w) => STOP.has(w))) continue; // a slot of stop words is a place, not a value
        const ps = allBounded(low[i], t.toLowerCase());
        if (ps.length) hits.set(i, ps);
      }
      if (hits.size >= need) spans.push({ e, chain, texts, hits, cons: hits.size });
    }
  }
  return spans;
}
const spanOrder = (a, b) => b.s.cons - a.s.cons || b.len - a.len || a.s.e.cost - b.s.e.cost || a.s.e.id - b.s.e.id || a.s.chain.length - b.s.chain.length;
/** Greedy non-overlapping spans of one text region [lo, hi) of row i, at most k; a span takes its first free place. */
function pickSpans(spans, i, lo, hi, k) {
  const here = [];
  for (const s of spans) { const ps = s.hits.get(i); if (ps === undefined) continue; const len = s.texts[i].length; const at = ps.filter((p) => p >= lo && p + len <= hi); if (at.length) here.push({ s, ats: at, len }); }
  here.sort(spanOrder);
  const pick = [];
  for (const h of here) {
    if (pick.length >= k) break;
    const at = h.ats.find((a) => !pick.some((p) => a < p.at + p.len && p.at < a + h.len));
    if (at !== undefined) pick.push({ s: h.s, at, len: h.len });
  }
  return pick;
}
/** A render.template pyramid for text[lo, hi) with the picked spans as slots, or a literal when no span is picked. */
function tplNode(text, lo, hi, pick) {
  const ps = [...pick].sort((a, b) => a.at - b.at), tpl = [], args = [];
  let at = lo;
  ps.forEach((p, k) => { if (p.at > at) tpl.push(text.slice(at, p.at)); tpl.push({ slot: k }); args.push(chainNode(p.s.e.node, p.s.chain)); at = p.at + p.len; });
  if (at < hi) tpl.push(text.slice(at, hi));
  return args.length ? ['render.template', { lit: tpl }, ...args] : ['render.str', { lit: text.slice(lo, hi) }];
}
/** The template candidates of this round's span window; returns where the next round's window starts. */
function templateCands(S) {
  const ans = [], low = S.rows.map((r, i) => {
    if (r.answer === null) return null;
    const l = r.answer.toLowerCase();
    if (l.length !== r.answer.length) return null;
    ans.push(i);
    return l;
  });
  if (!ans.length) return S.window;
  const spans = spanPool(S, ans, low);
  const tpls = new Map();
  const keep = (pyr) => { const k = canon(pyr); if (!tpls.has(k)) tpls.set(k, pyr); };
  for (const i of ans) {
    const a = S.rows[i].answer;
    // four slots, and up to MAX_SLOTS when the answer holds more values (two facts compared: two names, two numbers, the winner)
    for (const k of [4, MAX_SLOTS]) {
      const pick = pickSpans(spans, i, 0, a.length, k);
      if (!pick.length || (k > 4 && pick.length <= 4)) continue;
      keep(tplNode(a, 0, a.length, pick));
      // the same place filled by another value of the same text ("35" is the last number, the largest and the median)
      pick.forEach((p, j0) => {
        const alts = spans.filter((s) => s !== p.s && s.texts[i] !== null && s.texts[i].length === p.len && (s.hits.get(i) || []).includes(p.at))
          .map((s) => ({ s, len: p.len })).sort(spanOrder).slice(0, 8);
        for (const { s } of alts) keep(tplNode(a, 0, a.length, pick.map((x, j) => (j === j0 ? { s, at: p.at, len: p.len } : x))));
        if (pick.length > 1) keep(tplNode(a, 0, a.length, pick.filter((_, j) => j !== j0))); // or the place kept as its text
      });
    }
  }
  if (!S.round) lineTemplates(S, ans, low, spans, keep);
  for (const pyr of tpls.values()) {
    if (spent(S)) break;
    S.generated++;
    const outs = evalOuts(S, pyr, null);
    const cand = { pyramid: pyr, mem: null, outs, src: canon(pyr).includes('"render.lines"') ? 'lines' : 'template' };
    if (offer(S, cand, false) && pyr[0] === 'render.template') S.phrases.push({ node: pyr, outs });
  }
  return S.tplNext;
}
/** The position of the number j as a whole word in a line, or -1. */
const numAt = (line, j) => firstBounded(line.toLowerCase(), String(j));
/**
 * Templates for an answer of numbered lines: line j holds the number j; the lines are one template mapped over 1..N
 * (iterate.mapTemplate) or over N copies of a sensed subject (iterate.mapTemplateStrs), N a value of the pool equal
 * to the line count, with an optional header line rendered by its own template.
 */
function lineTemplates(S, ans, low, spans, keep) {
  const bodyOf = (i, h) => { const ls = S.rows[i].answer.split('\n').map((l) => l.replace(/\r$/, '')); const b = ls.slice(h); return b.length >= 2 && b.every((l, j) => numAt(l, j + 1) >= 0) ? { ls, b } : null; };
  const nums = S.entries.filter((e) => e.type === 'num' && e.cost <= 4 && !e.konst);
  const subjects = spans.filter((s) => s.e.type === 'str' && !s.chain.length);
  for (const h of [0, 1]) {
    const shaped = new Map();
    for (const i of ans) { const b = bodyOf(i, h); if (b) shaped.set(i, b); }
    if (!shaped.size) continue;
    const numCons = (e) => { let c = 0; for (const [i, b] of shaped) if (e.vec[i] !== null && Number(e.vec[i]) === b.b.length) c++; return c; };
    for (const [i, { ls, b }] of shaped) {
      const m = b.length;
      const ns = nums.filter((e) => e.vec[i] !== null && Number(e.vec[i]) === m).map((e) => ({ e, c: numCons(e) }))
        .sort((x, y) => y.c - x.c || x.e.cost - y.e.cost || x.e.id - y.e.id).slice(0, 2).map((x) => x.e);
      if (!ns.length) continue;
      const subs = subjects.filter((s) => s.texts[i] && b.every((l) => firstBounded(l.toLowerCase(), s.texts[i].toLowerCase()) >= 0))
        .sort((x, y) => y.cons - x.cons || y.texts[i].length - x.texts[i].length || x.e.cost - y.e.cost || x.e.id - y.e.id).slice(0, 3);
      const bodies = [];
      for (const s of [null, ...subs]) {
        let tpl = null, ok = true;
        for (let j = 0; j < m && ok; j++) {
          const line = b[j], ll = line.toLowerCase(), p = numAt(line, j + 1), pl = String(j + 1).length;
          const parts = [{ at: p, len: pl, slot: s ? 1 : 0 }];
          if (s) {
            const t = s.texts[i].toLowerCase();
            let q = firstBounded(ll, t);
            while (q >= 0 && q < p + pl && p < q + t.length) q = firstBounded(ll, t, q + 1);
            if (q < 0) { ok = false; break; }
            parts.push({ at: q, len: t.length, slot: 0 });
          }
          parts.sort((x, y) => x.at - y.at);
          const t = [];
          let at = 0;
          for (const x of parts) { if (x.at > at) t.push(line.slice(at, x.at)); t.push({ slot: x.slot }); at = x.at + x.len; }
          if (at < line.length) t.push(line.slice(at));
          if (tpl === null) tpl = t; else if (canon(tpl) !== canon(t)) ok = false;
        }
        if (ok && tpl) bodies.push({ s, tpl });
      }
      let head = null;
      if (h === 1) { const hl = ls[0]; head = hl.trim() ? tplNode(S.rows[i].answer, 0, hl.length, pickSpans(spans, i, 0, hl.length, 4)) : null; if (!head) continue; }
      for (const { s, tpl } of bodies) for (const N of ns) {
        const lines = s ? ['render.lines', ['iterate.mapTemplateStrs', { lit: tpl }, ['iterate.repeat', s.e.node, N.node]]]
          : ['render.lines', ['iterate.mapTemplate', { lit: tpl }, ['iterate.range', N.node]]];
        keep(head ? ['render.template', { lit: [{ slot: 0 }, '\n', { slot: 1 }] }, head, lines] : lines);
      }
    }
  }
}

// ---------------------------------------------------------------- memory: what a row holds, the table, a relation
/** The text a row's memory holds: its answer when the answer passes its own expect, else the expect's own words. */
function valueOf(r) {
  if (r.answer !== null && OK(r.answer, r.expect)) return r.answer;
  const e = r.expect;
  const v = typeof e.equals === 'string' ? e.equals : [...(Array.isArray(e.contains) ? e.contains : []), ...(Array.isArray(e.containsAny) && e.containsAny.length ? [e.containsAny[0]] : [])].join(' ');
  return v && v.trim() && OK(v, e) && !REFUSAL_RE.test(v.trim()) ? v : null;
}
function memoryCands(S) {
  const vals = S.rows.map(valueOf);
  const LOOK = ['render.str', ['memory.lookup', ['sense.text']]], NEAR = ['render.str', ['memory.nearest', ['sense.text']]];
  const tryMem = (pyramid, mem, cover) => {
    if (spent(S)) return;
    S.generated++;
    const cand = { pyramid, mem, outs: evalOuts(S, pyramid, mem), src: 'memory' };
    if (cover) cand.cover = cover;
    offer(S, cand, false);
  };
  const table = {}, near = {};
  S.rows.forEach((r, i) => {
    if (vals[i] === null) return;
    tryMem(LOOK, { table: { [r.q]: vals[i] } }, 'all');
    if (!/\d/.test(r.q)) tryMem(NEAR, { table: { [r.q]: vals[i] } }, 'all');
    if (!Object.hasOwn(table, r.q)) { table[r.q] = vals[i]; if (!/\d/.test(r.q)) near[r.q] = vals[i]; }
  });
  if (Object.keys(table).length >= 2) tryMem(LOOK, { table });
  if (Object.keys(near).length >= 2) tryMem(NEAR, { table: near });
  // a relation: a sensed part of the prompt as the key (the text after "of", the last word, the quoted text). The key
  // must hold every word of the prompt the value repeats (a word every prompt holds aside): "a 4-day plan for chess"
  // keyed by "chess" alone would answer a 7-day plan with 4 days.
  const df = new Map();
  for (const r of S.rows) for (const w of new Set(words1(r.q))) df.set(w, (df.get(w) || 0) + 1);
  const everywhere = (w) => df.get(w) === S.n;
  const valW = vals.map((v) => (v === null ? null : new Set(words1(v))));
  for (const e of S.entries) {
    if (e.type !== 'str' || e.konst || !Array.isArray(e.node) || PRIMS[e.node[0]].family !== 'sense' || e.node[0] === 'sense.text') continue;
    const rel = {}, by = new Map();
    let ok = true, n = 0;
    S.rows.forEach((r, i) => {
      const k = e.vec[i];
      if (!ok || vals[i] === null || typeof k !== 'string' || !norm(k, 1)) return;
      const kk = norm(k, 1), kw = new Set(kk.split(' '));
      if (words1(r.q).some((w) => !STOP.has(w) && valW[i].has(w) && !kw.has(w) && !everywhere(w))) { ok = false; return; }
      if (by.has(kk)) { if (by.get(kk) !== vals[i]) ok = false; return; }
      by.set(kk, vals[i]); rel[k] = vals[i]; n++;
    });
    if (ok && n >= 2) tryMem(['render.str', ['memory.lookup', e.node]], { table: rel });
  }
}

// ---------------------------------------------------------------- yes/no: a sensed truth picks one of two phrases
function yesNoCands(S) {
  const phrases = [];
  for (const e of S.entries) if (e.type === 'str' && e.konst && !Array.isArray(e.node)) phrases.push({ node: e.node, outs: e.vec.map(strOrNull) });
  for (const p of S.phrases) phrases.push(p);
  if (!phrases.length || !S.bools.length) return;
  const pm = phrases.map((p) => p.outs.map((o, i) => passes(o, S.rows[i])));
  for (const b of S.bools) {
    if (spent(S)) return;
    S.generated += phrases.length;
    const T = [], Fa = [];
    b.vec.forEach((v, i) => { if (v === true) T.push(i); else if (v === false) Fa.push(i); });
    if (T.length < 2 || Fa.length < 2) continue;
    // a truth splits the rows only when one phrase passes every true row and one every false row
    const best = (rows) => pm.findIndex((m) => rows.every((i) => m[i]));
    const a = best(T), c = best(Fa);
    if (a < 0 || c < 0) continue;
    const A = phrases[a], C = phrases[c];
    const outs = b.vec.map((v, i) => (v === null || A.outs[i] === null || C.outs[i] === null ? null : v ? A.outs[i] : C.outs[i]));
    offer(S, { pyramid: ['render.yesNo', b.node, A.node, C.node], mem: null, outs, src: 'yesno' });
  }
}

// ---------------------------------------------------------------- mutants of the parents
function nodesOf(node, at = [], out = []) {
  out.push([at, node]);
  if (Array.isArray(node)) node.slice(1).forEach((c, j) => nodesOf(c, [...at, j + 1], out));
  return out;
}
function replaceAt(node, at, sub) { if (!at.length) return sub; const c = node.slice(); c[at[0]] = replaceAt(node[at[0]], at.slice(1), sub); return c; }
const sigOf = (n) => PRIMS[n].family + '|' + ARGS[n].join(',') + '|' + PRIMS[n].out + '|' + (PRIMS[n].rest || '') + '|' + (PRIMS[n].lazy ? 1 : 0);
/** The parents as they are, before any budget is spent: a parent its rows still keep is kept (the population is kept forever). */
function parentCands(S, parents) {
  for (const p of parents) {
    if (!isObj(p) || !checkCell(p).ok) continue;
    S.generated++;
    offer(S, { pyramid: p.pyramid, mem: p.mem, outs: evalOuts(S, p.pyramid, p.mem), guard: p.guard, keepRecord: p, src: 'parent' }, false);
  }
}
function mutantCands(S, parents, pools) {
  let n = 0;
  const go = () => n < MUTANT_CAP && !spent(S);
  const tryPyr = (pyramid, mem, p, guard = null) => {
    if (!go()) return;
    n++; S.generated++;
    const cand = { pyramid, mem, outs: evalOuts(S, pyramid, mem), parents: [p.id], src: 'mutant' };
    if (guard) { cand.guard = guard; cand.keepRecord = null; }
    offer(S, cand, !guard);
  };
  for (const p of parents) {
    if (!isObj(p) || !checkCell(p).ok) continue;
    tryPyr(p.pyramid, p.mem, p);
    let swaps = 0;
    for (const [at, node] of nodesOf(p.pyramid)) {
      if (Array.isArray(node)) {
        const sig = sigOf(node[0]);
        for (const other of PRIM_NAMES) { if (swaps >= 24) break; if (other !== node[0] && sigOf(other) === sig) { swaps++; tryPyr(replaceAt(p.pyramid, at, [other, ...node.slice(1)]), p.mem, p); } }
      } else if (isObj(node) && Object.hasOwn(node, 'lit')) {
        const v = node.lit;
        const alts = typeof v === 'number' ? [v + 1, v - 1, v * 2, ...pools.nums.slice(0, 4)] : typeof v === 'string' ? pools.keywords.slice(0, 4) : [];
        for (const a of [...new Set(alts)]) if (a !== v && Number.isFinite(typeof a === 'number' ? a : 0)) tryPyr(replaceAt(p.pyramid, at, { lit: a }), p.mem, p);
      }
    }
    const g = Array.isArray(p.guard) ? p.guard : [];
    g.forEach((_, k) => tryPyr(p.pyramid, p.mem, p, g.filter((__, j) => j !== k)));
    for (const ft of [['nums>=', 1], ['not', ['colon']], ['not', ['quoted']]]) if (!g.some((x) => canon(x) === canon(ft))) tryPyr(p.pyramid, p.mem, p, [...g, ft]);
  }
}

// ---------------------------------------------------------------- guard induction: the SENSE face of a candidate
const MAX_EXTRA = 6;
function guardContext(S, negatives) {
  const rowF = S.rows.map((r) => featOf(r.q));
  const rowW = rowF.map((f) => [...new Set(f.words)].filter((w) => !isNumWord(w)));
  const negs = [], index = new Map(), seen = new Set();
  for (const e of Array.isArray(negatives) ? negatives : []) {
    // a negative is a prompt, or { q, group } (group: the task or class it is a dev row of; the open guard's topic rule)
    const q = typeof e === 'string' ? e : isObj(e) && typeof e.q === 'string' ? e.q : null;
    if (q === null || !q.trim() || seen.has(q)) continue;
    seen.add(q);
    const j = negs.length, f = featOf(q);
    negs.push({ q, f, group: isObj(e) && typeof e.group === 'string' ? e.group : '' });
    for (const w of new Set(f.words)) { const at = index.get(w); if (at) at.push(j); else index.set(w, [j]); }
  }
  return { rowF, rowW, negs, index };
}
/** The phrases of a pyramid's interior primitives (their manifest words), the words a prompt names them by. */
function aliasWordsOf(pyramid) {
  const out = new Set();
  for (const [, node] of nodesOf(pyramid)) {
    if (!Array.isArray(node) || !ALIAS_FAMILIES.has(PRIMS[node[0]]?.family)) continue;
    for (const w of PRIMS[node[0]].words) { const p = norm(w, 1); if (p && p.length >= 3 && !/\d/.test(p) && !p.split(' ').every((x) => STOP.has(x))) out.add(p); }
  }
  return [...out].sort(cmpStr);
}
/** The negatives a list of phrases can reach (a phrase holds only where its first word is). */
function reachNegs(G, phrases) {
  const s = new Set();
  for (const p of phrases) { const w0 = norm(p, 1).split(' ')[0]; for (const j of G.index.get(w0) || []) s.add(j); }
  return [...s].sort((a, b) => a - b);
}
const cmpKey = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };
/** Greedy set cover of the passed rows by words they hold and no failed row holds: content words, the widest first. */
function greedyCover(G, P, ok, aliasSet) {
  const left = new Set(P), words = [], rowsOfW = new Map();
  for (const i of P) for (const w of G.rowW[i]) if (ok(w)) { const a = rowsOfW.get(w); if (a) a.push(i); else rowsOfW.set(w, [i]); }
  while (left.size) {
    let best = null;
    for (const [w, rs] of rowsOfW) {
      let gain = 0;
      for (const i of rs) if (left.has(i)) gain++;
      if (!gain) continue;
      const k = [STOP.has(w) ? 0 : 1, gain, aliasSet.has(w) ? 1 : 0, rs.length];
      const c = best ? cmpKey(k, best.k) : 1;
      if (c > 0 || (c === 0 && w < best.w)) best = { w, k, rs };
    }
    if (!best) break;
    words.push(best.w);
    for (const i of best.rs) left.delete(i);
    rowsOfW.delete(best.w);
  }
  return words;
}
/** Features that hold on every one of rows (dev row indices), for removing the others (features of prompts). */
function featurePool(G, rows, others) {
  const fs0 = rows.map((i) => G.rowF[i]), pool = [];
  if (!fs0.length) return pool;
  const common = G.rowW[rows[0]].filter((w) => fs0.every((f) => holds(['has', w], f)));
  for (const w of common) pool.push(['has', w]);
  const offW = new Set();
  for (const f of others) for (const w of f.words) if (!isNumWord(w) && offW.size < 400) offW.add(w);
  let k = 0;
  for (const w of [...offW].sort(cmpStr)) { if (k >= 50) break; if (!fs0.some((f) => holds(['has', w], f))) { pool.push(['not', ['has', w]]); k++; } }
  const nums = fs0.map((f) => f.nums), wc = fs0.map((f) => f.words.length);
  if (nums.every((x) => x === nums[0])) pool.push(['nums==', nums[0]]);
  if (Math.min(...nums) > 0) pool.push(['nums>=', Math.min(...nums)]);
  for (const b of ['colon', 'quoted']) { if (fs0.every((f) => f[b])) pool.push([b]); else if (fs0.every((f) => !f[b])) pool.push(['not', [b]]); }
  pool.push(['words<=', Math.max(...wc)], ['words>=', Math.min(...wc)]);
  return pool;
}
/** Add up to MAX_EXTRA features to extra, each the one that removes the most of the given prompts (features of them). */
function tighten(pool, targets, extra) {
  let left = targets;
  while (left.length && extra.length < MAX_EXTRA) {
    let best = null, bestN = 0;
    for (const ft of pool) { if (extra.some((x) => canon(x) === canon(ft))) continue; let n = 0; for (const f of left) if (!holds(ft, f)) n++; if (n > bestN) { bestN = n; best = ft; } }
    if (!best) break;
    extra.push(best);
    left = left.filter((f) => holds(best, f));
  }
  return left;
}
/**
 * The guard of a candidate: the words its passed rows hold and its failed rows lack (with the phrases of its interior
 * primitives), tightened until no negative it reaches fires; null when no guard keeps it.
 */
function induceGuard(S, G, cand) {
  const P = [], F = [];
  cand.outs.forEach((o, i) => { if (o !== null) (cand.pass[i] ? P : F).push(i); });
  if (!P.length) return null;
  if (Array.isArray(cand.guard)) return cand.guard;
  const fired = new Map();
  const fires = (j) => { if (!fired.has(j)) fired.set(j, strOrNull(evalNode(cand.pyramid, G.negs[j].q, cand.mem)) !== null); return fired.get(j); };
  const fWords = new Set(F.flatMap((i) => G.rowF[i].words));
  const ok = (w) => !fWords.has(w);
  let aliases = aliasWordsOf(cand.pyramid).filter((p) => !F.some((i) => G.rowF[i].pad.includes(' ' + p + ' ')));
  let words = cand.cover === 'all' ? [...new Set(P.flatMap((i) => G.rowW[i].filter((w) => ok(w) && !STOP.has(w))))].sort(cmpStr)
    : greedyCover(G, P, ok, new Set(aliases));
  const extra = [];
  if (!words.length) { // a conjunctive guard: features of every passed row that no failed row has (two rows at least)
    if (P.length < 2 || cand.cover === 'all') return null;
    const fF = F.map((i) => G.rowF[i]);
    if (tighten(featurePool(G, P, fF), fF, extra).length) return null;
    const offenders = G.negs.filter((n, j) => extra.every((ft) => holds(ft, n.f)) && fires(j)).map((n) => n.f);
    if (tighten(featurePool(G, P, offenders), offenders, extra).length) return null;
    return extra;
  }
  const guardOf = () => [...(words.length + aliases.length ? [['hasAny', [...words, ...aliases]]] : []), ...extra];
  const offendersOf = () => { const g = guardOf(); return reachNegs(G, [...words, ...aliases]).filter((j) => g.every((ft) => holds(ft, G.negs[j].f)) && fires(j)); };
  let off = offendersOf();
  if (off.length) { // 1. an alias phrase that reaches an offender goes
    aliases = aliases.filter((p) => !off.some((j) => G.negs[j].f.pad.includes(' ' + p + ' ')));
    off = offendersOf();
  }
  if (off.length && words.length) { // 2. features of every covered row that the offenders lack
    const covered = P.filter((i) => words.some((w) => holds(['has', w], G.rowF[i])));
    const offF = off.map((j) => G.negs[j].f);
    tighten(featurePool(G, covered, offF), offF, extra);
    off = offendersOf();
  }
  if (off.length) { // 3. a cover word that still reaches an offender goes
    words = words.filter((w) => !off.some((j) => holds(['has', w], G.negs[j].f)));
    aliases = aliases.filter((p) => !off.some((j) => G.negs[j].f.pad.includes(' ' + p + ' ')));
  }
  if (!words.length && !aliases.length) return null;
  const all = [...words, ...aliases];
  return [all.length === 1 ? ['has', all[0]] : ['hasAny', [...new Set(all)].sort(cmpStr)], ...extra];
}
/** A kept cell, or null: every dev row it fires on passes, at least one does, and it is silent on every negative it reaches. */
function keepCell(S, G, cand, guard, task, gen) {
  const rec = cand.keepRecord || null;
  const cell = makeCell({ task, gen: rec ? rec.gen : gen, parents: rec ? rec.parents : cand.parents || [], guard, pyramid: cand.pyramid, mem: cand.mem });
  let ok = 0, fired = 0;
  for (const r of S.rows) { const o = runCell(cell, r.q); if (o === null) continue; fired++; if (!passes(o, r)) return null; ok++; }
  if (!ok) return null;
  const ws = [];
  for (const ft of guard) if (ft[0] === 'has') ws.push(ft[1]); else if (ft[0] === 'hasAny') ws.push(...ft[1]);
  const js = ws.length ? reachNegs(G, ws) : G.negs.map((_, j) => j);
  for (const j of js) if (runCell(cell, G.negs[j].q) !== null) return null;
  cell.fit = { ok, fired, rows: S.n };
  return checkCell(cell).ok ? cell : null;
}

// ---------------------------------------------------------------- the open guard of a knowledge-backed cell
// A knowledge-backed pyramid answers only where a pack's key is in the prompt, so its guard need not name the words of
// the dev rows: a held-out prompt asks for the same fact in other words. Its OPEN variant keeps the pyramid and guards it
// by exclusion only, ['not', ['hasAny', words]]: the fewest words that silence it on every negative and every failed dev
// row it fires on. A word of a passed dev row is never one. A pyramid wrong on more than one in
// OPEN_FAIL_DIV of the dev rows it fires on gets none (one right by chance, the key that happens to come first, is no
// lookup of the fact). A word few groups of negatives hold (another task's topic word: at most one in
// OPEN_TOPIC_DIV of the groups) is taken first, then a word many hold (a phrasing word, which a prompt of this task may
// use too), then a word of the pack's own facts or a number (an entity or a value: it silences the cell on prompts
// that name it), and a stop word last (for a key that is a common word: "are", "is").
// Each step takes, from
// the lowest tier holding a word of a prompt still to silence, the word that silences most of them. No cover, no open
// variant; a cover is still kept only when keepCell keeps it.
/** The most knowledge-backed pyramids of one spawn that get an open variant (the best first, see openCells). */
export const OPEN_MAX = 24;
/** The most words an open guard excludes. */
export const OPEN_WORDS = 512;
/** A word held by at most one in this many groups of negatives (two at least) is a topic word. */
export const OPEN_TOPIC_DIV = 8;
/** A pyramid wrong on more than one in this many of the dev rows it fires on gets no open variant. */
export const OPEN_FAIL_DIV = 20;
/** The fewest prompts a group of negatives needs to count in the topic rule. */
const OPEN_GROUP_MIN = 3;
/** Per word, the number of groups of negatives (of OPEN_GROUP_MIN prompts at least) holding it; computed once. */
function groupFreq(G) {
  if (G.gdf) return G.gdf;
  const by = new Map(), gdf = new Map();
  for (const n of G.negs) { let s = by.get(n.group); if (!s) by.set(n.group, (s = { n: 0, words: new Set() })); s.n++; for (const w of n.f.words) s.words.add(w); }
  let big = 0;
  for (const s of by.values()) { if (s.n < OPEN_GROUP_MIN) continue; big++; for (const w of s.words) gdf.set(w, (gdf.get(w) || 0) + 1); }
  G.gdf = gdf; G.topicMax = Math.max(2, Math.ceil(big / OPEN_TOPIC_DIV));
  return gdf;
}
/** Whether a word is one of the facts of a pack the pyramid reads (its packs named by a literal), cached per pack. */
function factTest(packs, pyramid, cache) {
  const ids = new Set(nodesOf(pyramid).map(([, n]) => n).filter((n) => isObj(n) && typeof n.lit === 'string').map((n) => n.lit));
  const sets = [];
  for (const p of Array.isArray(packs) ? packs : []) {
    if (!isPack(p) || !ids.has(p.id)) continue;
    let ws = cache.get(p);
    if (!ws) {
      ws = new Set();
      for (const r of Array.isArray(p.rows) ? p.rows : []) for (const v of Array.isArray(r) ? r : []) if (typeof v === 'string' || typeof v === 'number') for (const w of words1(String(v))) ws.add(w);
      cache.set(p, ws);
    }
    sets.push(ws);
  }
  return (w) => sets.some((s) => s.has(w));
}
/** The open guard of a candidate's pyramid (see above), or null when no word list silences it where it must be silent. */
function openGuard(S, G, cell, isFact) {
  const P = [], F = [];
  S.rows.forEach((r, i) => { const o = strOrNull(evalNode(cell.pyramid, r.q, cell.mem)); if (o === null) return; (passes(o, r) ? P : F).push(i); });
  if (!P.length || F.length * OPEN_FAIL_DIV > P.length + F.length) return null;
  const own = new Set(P.flatMap((i) => G.rowF[i].words));
  const gdf = groupFreq(G), tier = (w) => (STOP.has(w) ? 3 : isFact(w) || isNumWord(w) ? 2 : (gdf.get(w) || 0) <= G.topicMax ? 0 : 1);
  const usable = (w) => !own.has(w);
  let left = F.map((i) => [...new Set(G.rowF[i].words)].filter(usable));
  for (const n of G.negs) if (strOrNull(evalNode(cell.pyramid, n.q, cell.mem)) !== null) left.push([...new Set(n.f.words)].filter(usable));
  const words = [];
  while (left.length) {
    if (words.length >= OPEN_WORDS || left.some((ws) => !ws.length)) return null;
    const gain = new Map();
    for (const ws of left) for (const w of ws) gain.set(w, (gain.get(w) || 0) + 1);
    let best = null;
    for (const [w, n] of gain) {
      const k = [tier(w), -n, gdf.get(w) || 0], c = best ? cmpKey(k, best.k) : -1;
      if (c < 0 || (c === 0 && w < best.w)) best = { w, k };
    }
    words.push(best.w);
    left = left.filter((ws) => !ws.includes(best.w));
  }
  words.sort(cmpStr);
  return words.length ? [['not', words.length === 1 ? ['has', words[0]] : ['hasAny', words]]] : [];
}
/**
 * The open variants of the best OPEN_MAX knowledge-backed pyramids among the candidates (kept or not: the pyramid right
 * on every row may have no closed guard the negatives leave), each kept by keepCell. Best: the most dev rows passed less
 * the rows failed (its guard ignored), then the smaller pyramid. A variant's parents are the kept cells of its pyramid.
 */
function openCells(S, G, kept, packs, task, gen) {
  const out = [], seen = new Set(), cache = new Map(), closed = new Map();
  for (const c of kept) { const k = canon([c.pyramid, c.mem]); if (!closed.has(k)) closed.set(k, []); closed.get(k).push(c.id); }
  const order = [];
  for (const cand of S.cands) {
    if (!usesKnow(cand) || isFallback(cand)) continue;
    const key = canon([cand.pyramid, cand.mem]);
    if (seen.has(key)) continue;
    seen.add(key);
    let net = 0;
    cand.outs.forEach((o, i) => { if (o !== null) net += cand.pass[i] ? 1 : -1; });
    order.push({ cand, key, net, size: nodesOf(cand.pyramid).length });
  }
  order.sort((a, b) => b.net - a.net || a.size - b.size || cmpStr(a.key, b.key));
  for (const { cand, key } of order.slice(0, OPEN_MAX)) {
    const guard = openGuard(S, G, cand, factTest(packs, cand.pyramid, cache));
    const parents = (closed.get(key) || []).slice().sort(cmpStr);
    const cell = guard && keepCell(S, G, { pyramid: cand.pyramid, mem: cand.mem, parents }, guard, task, gen);
    if (cell) out.push(cell);
  }
  return out;
}

// ---------------------------------------------------------------- spawn
const posInt = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.floor(Number(v)) : d);
/** The family a cell is counted under: its first primitive below the render apex, depth first (render when none). */
export function familyOf(cell) {
  for (const [, n] of nodesOf(cell.pyramid)) if (Array.isArray(n) && PRIMS[n[0]].family !== 'render') return PRIMS[n[0]].family;
  return 'render';
}
/** Whether a cell is a fallback: its pyramid answers with the nearest remembered prompt's answer (memory.nearest). */
export function isFallback(cell) {
  return isObj(cell) && nodesOf(cell.pyramid).some(([, n]) => Array.isArray(n) && n[0] === 'memory.nearest');
}
/** Whether a cell's pyramid uses a primitive of the know family (its index row is then tagged know: true). */
export function usesKnow(cell) {
  return isObj(cell) && nodesOf(cell.pyramid).some(([, n]) => Array.isArray(n) && Object.hasOwn(PRIMS, n[0]) && PRIMS[n[0]].family === 'know');
}

// ---------------------------------------------------------------- THE CURSOR: every grow continues where the last stopped
/** The meaning of a cursor: a cursor of another version starts again at round 0. */
export const CURSOR_VERSION = 1;
/** The deepest cost a cursor takes the enumeration to. */
export const MAX_COST_CEIL = 12;
/**
 * What a search depends on, as one sha: the cursor's version, the kernel's primitives, the dev rows and the packs the
 * search starts from. A cursor of another basis starts again at round 0.
 * @param {object[]} rows the dev rows (prepared or raw: q, answer, expect)
 * @param {object[]} [use] the packs the search starts from
 * @returns {string}
 */
export function cursorBasis(rows, use = []) {
  const R = Array.isArray(rows) ? rows : [];
  return sha256Hex(canon({ v: CURSOR_VERSION, prims: PRIM_NAMES, rows: R.map((r) => [r.q ?? null, r.answer ?? null, r.expect ?? null]), packs: packsKey(use) }));
}
/**
 * THE CURSOR (contract c3, "cursor"): where the next grow of a task continues, from the cursor its last grow wrote in
 * the ledger. No cursor, or one of another version or basis, is round 0: the whole search. Round r (from 1) offers only
 * what no round before it offered: the enumeration combos past the cursor's `at` (the ones before it are evaluated
 * again without being offered: they are the arguments of the later ones), one cost deeper once every cost below is
 * done, and the next window of template spans (from `tpl`). Memory, mutants, the knowledge seeds' own candidates,
 * yes/no pairs and line templates are round 0's; the parents are kept in every round (the population is kept forever).
 * @param {object|null} cursor the cursor a grow wrote ({ v, basis, round, at, maxCost, done, tpl, ... })
 * @param {string} basis cursorBasis of this search
 * @returns {{ round: number, replay: number, maxCost: number, window: number }}
 */
export function resumeCursor(cursor, basis) {
  const int = (v, lo) => Number.isInteger(v) && v >= lo;
  const ok = isObj(cursor) && cursor.v === CURSOR_VERSION && typeof basis === 'string' && cursor.basis === basis && int(cursor.round, 0) &&
    int(cursor.at, 0) && int(cursor.maxCost, 2) && cursor.maxCost <= MAX_COST_CEIL && int(cursor.tpl ?? 0, 0);
  if (!ok) return { round: 0, replay: 0, maxCost: MAX_COST, window: 0 };
  const deeper = cursor.done === true && cursor.maxCost < MAX_COST_CEIL;
  return { round: cursor.round + 1, replay: cursor.at, maxCost: deeper ? cursor.maxCost + 1 : cursor.maxCost, window: cursor.tpl ?? 0 };
}

/**
 * Spawn the cells of a task (grow/NEO.md, "The engine", steps 1 to 3): enumerate, template, remember and mutate
 * candidates over the dev rows, induce each one's guard, and keep every candidate its rows and the negatives do not
 * refute. The same rows, negatives, parents, packs and cursor give the same cells. With packs the search starts from
 * the facts of the source's pack (knowSeed); with a cursor it continues where that cursor stopped (resumeCursor), and
 * stats.cursor is the cursor the next grow of the task continues from. The best candidates that read a pack's facts
 * (kept or not) also get their open variant (openCells, openGuard), guarded by exclusion only; a negative given as
 * { q, group } names its group for that.
 * @param {{ task: string, rows: object[], negatives?: (string|{ q: string, group: string })[], gen?: number, parents?: object[], budget?: { maxGenerated?: number, maxMs?: number }, packs?: object[]|null, source?: string|null, cursor?: object|null, trace?: boolean }} spec
 * @returns {{ cells: object[], stats: { generated: number, distinct: number, kept: number, know: number, byFamily: object, bySource: object, maxHeight: number, devOk: number, devN: number, ms: number, cellsPerSecond: number, capped: string|null, packs: string[], cursor: object, trace?: string[] } }}
 */
function spawnWith({ task, rows, negatives = [], gen = 1, parents = [], budget = {}, packs = null, source = null, cursor = null, trace = false } = {}) {
  const t0 = Date.now();
  if (typeof task !== 'string' || !task.trim()) throw new Fail('spawn: the task is not a word');
  const B = { maxGenerated: posInt(budget && budget.maxGenerated, BUDGET.maxGenerated), maxMs: posInt(budget && budget.maxMs, BUDGET.maxMs) };
  const R = rowsOf(rows).map(prepRow);
  knowUse(Array.isArray(packs) ? packs : EMPTY_PACKS);
  const use = R.length ? knowPacks(R, packs, source) : [];
  const basis = cursorBasis(R, use);
  const at = resumeCursor(cursor, basis);
  const S = newSearch(R, { maxGenerated: Math.floor(B.maxGenerated * ENUM_SHARE), maxMs: Math.floor(B.maxMs * ENUM_SHARE) }, t0, namedPrims(R.map((r) => r.q)), { ...at, trace: trace === true });
  const pools = poolsOf(R);
  let done = true;
  if (R.length) { knowSeed(S, use); seed(S, pools); done = enumerate(S); }
  // the next grow's cursor: past the last combo evaluated (where this one began when rebuilding took the whole budget)
  const next = {
    v: CURSOR_VERSION, basis, round: S.round, at: Math.max(S.combos, S.replay), maxCost: S.maxCost, done,
    cost: S.where ? S.where.cost : null, prim: S.where ? S.where.prim : null, tpl: S.window,
  };
  S.stop = null; S.limit = B.maxGenerated; S.msLimit = B.maxMs;
  const P = Array.isArray(parents) ? parents : [];
  if (R.length) {
    parentCands(S, P);
    next.tpl = templateCands(S);
    if (!S.round) { memoryCands(S); yesNoCands(S); mutantCands(S, P, pools); }
  }
  const G = guardContext(S, negatives), g = Number.isInteger(gen) && gen >= 0 ? gen : 1;
  const cells = [], ids = new Set(), src = new Map();
  for (const cand of S.cands) {
    const guard = induceGuard(S, G, cand);
    const cell = guard && keepCell(S, G, cand, guard, task, g);
    if (cell && !ids.has(cell.id)) { ids.add(cell.id); cells.push(cell); src.set(cell.id, cand.src); }
  }
  // the open variants of the best knowledge-backed candidates (openCells): ordered with the others by the rule below
  for (const cell of openCells(S, G, cells, packs, task, g)) if (!ids.has(cell.id)) { ids.add(cell.id); cells.push(cell); src.set(cell.id, 'open'); }
  // grow/NEO.md step 4: rows passed (more first), alias affinity (the primitives the prompts name), size, id. Two keys of
  // part 2 come around it: a FALLBACK (the nearest remembered prompt's answer: it answers every prompt its guard takes, so
  // a prompt no dev row holds gets another prompt's answer) goes after every other cell, and at equal rows a cell that
  // reads a pack's facts goes first (a fact holds for a key no dev row names).
  const aff = new Map(cells.map((c) => [c.id, new Set(nodesOf(c.pyramid).filter(([, n]) => Array.isArray(n) && S.named.has(n[0]) && !['sense', 'render'].includes(PRIMS[n[0]].family)).map(([, n]) => n[0])).size]));
  const late = new Map(cells.map((c) => [c.id, isFallback(c) ? 1 : 0])), fact = new Map(cells.map((c) => [c.id, usesKnow(c) ? 1 : 0]));
  cells.sort((a, b) => late.get(a.id) - late.get(b.id) || b.fit.ok - a.fit.ok || fact.get(b.id) - fact.get(a.id) || aff.get(b.id) - aff.get(a.id) || a.size - b.size || cmpStr(a.id, b.id));
  const byFamily = {}, bySource = {};
  let know = 0;
  for (const c of cells) {
    const f = familyOf(c), s = src.get(c.id);
    byFamily[f] = (byFamily[f] || 0) + 1; bySource[s] = (bySource[s] || 0) + 1;
    if (usesKnow(c)) know++;
  }
  const colony = makeColony(cells);
  const devOk = R.filter((r) => { const a = colony.answer(r.q); return a !== null && OK(a, r.expect); }).length;
  const ms = Date.now() - t0;
  return {
    cells,
    stats: {
      generated: S.generated, distinct: S.entries.length + S.outsSeen.size, kept: cells.length, know, byFamily, bySource,
      maxHeight: cells.reduce((m, c) => Math.max(m, c.height), 0), devOk, devN: R.length, ms,
      cellsPerSecond: Math.round(S.generated / (Math.max(1, ms) / 1000)), capped: S.capped,
      packs: use.map((p) => p.id), cursor: next, ...(S.trace ? { trace: S.trace } : {}),
    },
  };
}
/**
 * Spawn the cells of a task (spawnWith above) with a grader: expectOk, when given, grades every row (grow/neo.mjs
 * passes judge/judge.mjs expectOk); else the copy in this file. The same rows, negatives and parents give the same cells.
 * @param {{ task: string, rows: object[], negatives?: (string|{ q: string, group: string })[], gen?: number, parents?: object[], budget?: object, expectOk?: Function }} spec
 * @returns {{ cells: object[], stats: object }}
 */
export function spawn(spec = {}) {
  const prev = OK;
  OK = spec && typeof spec.expectOk === 'function' ? spec.expectOk : expectOk;
  try { return spawnWith(spec); } finally { OK = prev; }
}

// ---------------------------------------------------------------- THE GATE (contract c2): mastered, and the template exactly
/** The most templates a task keeps, the longest text the gate fits (a question is short) and the longest entity slot. */
export const GATE_MAX_TEMPLATES = 32;
export const GATE_MAX_TEXT = 2000;
export const GATE_MAX_SLOT = 12;
/** The text a template fits: the kernel's norm level 1 (lower case, one space, letters, digits and spaces only). */
const gateTextOf = (q) => (typeof q === 'string' ? q.slice(0, 100000).trim().toLowerCase() : '').replace(/\s+/g, ' ').replace(/[^\p{L}\p{N} ]/gu, '').replace(/ +/g, ' ').trim();
export const gateText = gateTextOf;
const SLOT_RE = /^\{(#?)([1-9]\d?)-([1-9]\d?)\}$/;
const WORD_RE = /^[\p{L}\p{N}]+$/u;

/**
 * Whether a template is well formed: words of letters and digits and at least one slot "{a-b}" (any words) or
 * "{#a-b}" (numbers), a <= b <= GATE_MAX_SLOT, and at least one fixed word that is not a stop word.
 * @param {string} spec the template
 * @returns {boolean}
 */
export function validTemplate(spec) {
  if (typeof spec !== 'string' || !spec || spec.length > 400) return false;
  let slots = 0, content = 0;
  for (const p of spec.split(' ')) {
    const m = SLOT_RE.exec(p);
    if (m) { if (Number(m[2]) > Number(m[3]) || Number(m[3]) > GATE_MAX_SLOT) return false; slots++; continue; }
    if (!WORD_RE.test(p)) return false;
    if (!STOP.has(p)) content++;
  }
  return slots >= 1 && content >= 1;
}

/**
 * The anchored regular expression of a template over gateText, as text, or null for a malformed template. A slot of
 * a to b words is a to b runs of non-space characters (of digits for a numeric slot), one space apart.
 * @param {string} spec the template
 * @returns {string|null}
 */
export function templateSource(spec) {
  if (!validTemplate(spec)) return null;
  return '^' + spec.split(' ').map((p) => {
    const m = SLOT_RE.exec(p);
    if (!m) return p;
    const w = m[1] ? '\\d+' : '[^ ]+', lo = Number(m[2]) - 1, hi = Number(m[3]) - 1;
    return w + (hi > 0 ? '(?: ' + w + '){' + lo + ',' + hi + '}' : '');
  }).join(' ') + '$';
}
const RE_CACHE = new Map();
function reOf(spec) {
  if (RE_CACHE.has(spec)) return RE_CACHE.get(spec);
  const s = templateSource(spec), re = s === null ? null : new RegExp(s, 'u');
  if (RE_CACHE.size >= 4096) RE_CACHE.clear();
  RE_CACHE.set(spec, re);
  return re;
}

/**
 * Whether a prompt fits one of the templates exactly (its gateText, at most GATE_MAX_TEXT characters).
 * @param {string[]} specs the templates
 * @param {string} q the prompt
 * @returns {boolean}
 */
export function fitsTemplates(specs, q) {
  if (!Array.isArray(specs) || !specs.length) return false;
  const t = gateTextOf(q);
  if (!t || t.length > GATE_MAX_TEXT) return false;
  for (const s of specs) { const re = reOf(s); if (re && re.test(t)) return true; }
  return false;
}

/**
 * The question templates of a task, from its dev prompts. A word that is not a number and that at least
 * max(2, ceil(n / 10)) of the n distinct prompts hold is FIXED; each prompt becomes its fixed words with every run of
 * other words between them one slot. Prompts of one shape form a group; a group of at least 2 prompts with a fixed word
 * that is not a stop word is a template. A slot holds 1 to (its longest fill + 2) words, or exactly its longest
 * count of numbers when every fill is digits. Most supported first, then by text; at most GATE_MAX_TEMPLATES.
 * @param {string[]} prompts the task's dev prompts
 * @returns {string[]}
 */
export function deriveTemplates(prompts) {
  const P = [...new Set((Array.isArray(prompts) ? prompts : []).map(gateTextOf).filter((t) => t && t.length <= GATE_MAX_TEXT))];
  if (!P.length) return [];
  const m = Math.max(2, Math.ceil(P.length / 10));
  const df = new Map();
  for (const t of P) for (const w of new Set(t.split(' '))) df.set(w, (df.get(w) || 0) + 1);
  const fixed = (w) => !isNumWord(w) && df.get(w) >= m;
  const groups = new Map();
  for (const t of P) {
    const parts = [], fills = [];
    let run = null;
    for (const w of t.split(' ')) {
      if (fixed(w)) { if (run) { parts.push(null); fills.push(run); run = null; } parts.push(w); } else (run ||= []).push(w);
    }
    if (run) { parts.push(null); fills.push(run); }
    const key = parts.map((p) => (p === null ? '{}' : p)).join(' ');
    let g = groups.get(key);
    if (!g) groups.set(key, (g = { parts, n: 0, max: fills.map(() => 0), num: fills.map(() => true) }));
    g.n++;
    fills.forEach((f, i) => { g.max[i] = Math.max(g.max[i], f.length); if (!f.every(isNumWord)) g.num[i] = false; });
  }
  const out = [];
  for (const g of groups.values()) {
    if (g.n < 2) continue;
    let k = 0;
    const spec = g.parts.map((p) => {
      if (p !== null) return p;
      const i = k++, hi = Math.min(GATE_MAX_SLOT, Math.max(1, g.num[i] ? g.max[i] : g.max[i] + 2));
      return '{' + (g.num[i] ? '#' : '') + '1-' + hi + '}';
    }).join(' ');
    if (validTemplate(spec)) out.push({ spec, n: g.n });
  }
  out.sort((a, b) => b.n - a.n || cmpStr(a.spec, b.spec));
  return out.slice(0, GATE_MAX_TEMPLATES).map((x) => x.spec);
}

/**
 * The engine's mastered rule: a held-out score of exactly 1, with every one of n > 0 rows right where n and ok are given.
 * @param {{ score: number, n?: number, ok?: number }|null} h a row's heldout
 * @returns {boolean}
 */
export function isMastered(h) {
  if (!isObj(h) || h.score !== 1) return false;
  if (h.n !== undefined && !(Number.isInteger(h.n) && h.n > 0)) return false;
  if (h.ok !== undefined && h.ok !== h.n) return false;
  return true;
}

/**
 * Whether a grown/index.json row serves: tier "neo", serve exactly true and well formed templates. A locked row (any
 * other tier) is never gated; a tier "neo" row that does not serve is silent.
 * @param {object} row an index row
 * @returns {boolean}
 */
export function rowServes(row) {
  return isObj(row) && row.tier === 'neo' && row.serve === true && Array.isArray(row.templates) && row.templates.length > 0
    && row.templates.length <= GATE_MAX_TEMPLATES && row.templates.every(validTemplate);
}

/** The gate as source text: grow/store.mjs renderIndexMjs puts it in grown/index.mjs for an index with a tier "neo" row. */
export const GATE_SOURCE = [
  '// THE GATE (contract c2; grow/neo-core.mjs): a tier "neo" colony answers only while it is mastered (serve true in',
  "// grown/index.json) and only a prompt that fits one of its task's templates exactly; any other tier \"neo\" row is",
  '// silent and its module is not imported. A locked row is never gated, and every locked row comes first.',
  'const gateText = ' + gateTextOf.toString() + ';',
  'const serving = (m, sources) => {',
  "  const res = sources.map((s) => new RegExp(s, 'u'));",
  '  const fits = (q) => { const t = gateText(q); return t.length > 0 && t.length <= ' + GATE_MAX_TEXT + ' && res.some((re) => re.test(t)); };',
  '  return Object.freeze({ meta: m.meta, examples: m.examples, colony: m.colony, can: (q) => fits(q) && m.can(q) === true, answer: (q) => (fits(q) ? m.answer(q) : null) });',
  '};',
  'const silent = (meta) => Object.freeze({ meta: Object.freeze(meta), examples: Object.freeze([]), can: () => false, answer: () => null });',
].join('\n');
