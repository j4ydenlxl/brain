// grow/neo.mjs: THE ENGINE of the NEO tier (grow/NEO.md, "The engine"). It reads a task's example rows and, with no
// language model and no dependency, generates thousands of NEO cells by composing the orthogonal primitives of
// grow/neo-kernel.mjs, keeps every cell its examples do not refute, compiles the kept cells into one cell module, and,
// for a self-opened task, selects and promotes the colony into grown/ (the code the organism answers with).
// His words: "u are to build something that allows it to generate thousands of cells for a task", "The cells should
// be extremely poweful, like little orthogonal pyramids in itself. keep the cells you have, the NEO cells generated
// per task and kept and alters the code" and "All native btw, its ai data center in ur pocket, none of that ollama
// crap".
//
//   node grow/neo.mjs spawn --class <cls> --gen <n> [--out <dir>] [--max-generated <k>] [--max-ms <ms>] [--root <dir>]
//   node grow/neo.mjs grow --task <task> --gen <n> [--knowledge <dir>|none] [--max-generated <k>] [--max-ms <ms>] [--root <dir>]
//   node grow/neo.mjs status [--root <dir>]
// Each verb prints one JSON line last. A usage error exits 2, a failure exits 1.
//
// SPAWN, in four sources of cells (every candidate evaluated counts in stats.generated):
// 1. ENUMERATION: a bottom-up, type-directed enumerative synthesizer over the kernel. The value pool is seeded by the
//    sense primitives on each dev prompt and a small pool of literals (plus the numbers and words the dev answers
//    share); every primitive whose argument types fit is applied to entries of smaller cost, cost 1 upward. Two
//    expressions with the same values on every dev prompt are one (observational equivalence: the cheaper is kept).
//    A primitive the dev prompts name by one of its words costs 1, any other costs 2. Every new value is tried under
//    the render apex of its type; a rendered text that passes at least one dev row is a candidate.
// 2. TEMPLATES: anti-unification of each answered row: the values of the pool found inside the answer become slots,
//    so "The mean of 4, 8 and 9 is 7." yields a template whose last slot is aggregate.mean of the sensed list; an
//    answer of numbered lines yields a template mapped over 1..N.
// 3. MEMORY: a row's answer under its prompt (each norm level, and the nearest prompt), the task's whole table, and a
//    relation table keyed by a sensed part of the prompt (the text after "of", the last word, the quoted text).
// 4. MUTANTS of the parents (the cells an earlier generation of the task kept).
// GUARD INDUCTION gives each candidate its SENSE face: the words its passed rows share and its failed rows lack (the
// words of its primitives first), tightened until it fires on no row it fails and on no negative. A candidate that
// passes a row and fails none it fires on is KEPT. No clock and no random number reaches a cell: the same rows give
// the same cells (only stats.ms and what derives from it differ; a run stopped by --max-ms says so in stats.capped).
//
// The engine never opens judge/heldout/, judge/control.jsonl, state/ or a task's heldout.jsonl while spawning: every
// file it reads goes through readData, which REFUSES those paths. Only SELECT reads a task's heldout.jsonl and the q
// of judge/control.jsonl, through its own reader.
// Author: NEO board builder (THE ENGINE), 2026-10-01.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  KERNEL_VERSION, PRIMS, STOP_WORDS, argTypes, evalNode, guardOk, runCell, norm, makeColony, makeCell, checkCell,
  canon, numbersIn, fmtNum,
} from './neo-kernel.mjs';
import { validateCell, validateTest, FORBIDDEN, TEST_FORBIDDEN, parseJsonl, ID_RE, MAX_SOURCE_BYTES, REFUSAL_RE } from './contract.mjs';
import { expectOk } from '../judge/judge.mjs';
import { renderIndexMjs, answersOf } from './store.mjs';
import { readRetired, isRetired } from './retire.mjs';
import { readLedger, shaText, LEDGER, TASKS_DIR, TASK_RE } from './teach.mjs';
import { DEFAULT_ROOT, CLASS_RE, armId } from './generation.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const KERNEL_FILE = path.join(HERE, 'neo-kernel.mjs');
export const LANE = 'neo';
/** The default search budget: candidates evaluated and milliseconds (grow/NEO.md, "The engine", step 1). */
export const BUDGET = Object.freeze({ maxGenerated: 200000, maxMs: 60000 });
/** The highest pyramid cost the enumeration reaches (a primitive named by the prompts costs 1, any other 2, a literal 1). */
export const MAX_COST = 7;
/** The share of the budget the enumeration may spend; the templates, memory, yes/no pairs and mutants spend the rest. */
export const ENUM_SHARE = 0.8;
/** The most examples a compiled module carries. */
export const MAX_EXAMPLES = 20;
export const USAGE = [
  'usage: node grow/neo.mjs spawn --class <cls> --gen <n> [--out <dir>] [--max-generated <k>] [--max-ms <ms>] [--root <dir>]',
  '       node grow/neo.mjs grow --task <task> --gen <n> [--knowledge <dir>|none] [--max-generated <k>] [--max-ms <ms>] [--root <dir>]',
  '       node grow/neo.mjs status [--root <dir>]',
].join('\n');

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
const BUILTIN_LIST = Object.freeze([...BUILTIN_NEGATIVES.greetings, ...BUILTIN_NEGATIVES.organism, ...BUILTIN_NEGATIVES.arithmetic]);

export class Fail extends Error { constructor(msg, code = 1) { super(msg); this.code = code; } }

// ---------------------------------------------------------------- small helpers
const STOP = new Set(STOP_WORDS);
const isObj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
const round4 = (x) => Math.round(x * 1e4) / 1e4;
const first = (e) => String((e && e.message) || e).split(/\r?\n/)[0].trim();
/** The line of a child's output that names the error (node --check prints the file, the source line and a caret first). */
const errLine = (t) => { const ls = String(t ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean); return ls.find((l) => /^\w*Error\b/.test(l)) || ls[0] || ''; };
const cmpStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const words1 = (q) => norm(q, 1).split(' ').filter(Boolean);
const isNumWord = (w) => /^\d+$/.test(w);
/** A digit-masked norm level 1: two prompts of one shape differ only in their digits. */
const shapeOf = (q) => norm(q, 1).replace(/\d+/g, '#');
const writeText = (f, t) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, t); };
const writeJson = (f, o) => writeText(f, JSON.stringify(o, null, 2) + '\n');
const relOf = (root, f) => path.relative(root, f).split(path.sep).join('/');

// ---------------------------------------------------------------- reading: the spawn reader refuses the held-out files
const REFUSED = Object.freeze([/^judge\/heldout(\/|$)/, /^judge\/control\.jsonl$/, /^state(\/|$)/, /(^|\/)heldout(\.jsonl)?(\/|$)/, /control\.jsonl$/]);
/** A path relative to root in posix form, or a throw for a path that leaves root. */
function relPosix(rel) {
  const r = path.posix.normalize(String(rel ?? '').split(path.sep).join('/')).replace(/^\.\//, '');
  if (!r || r === '.' || r.startsWith('..') || path.posix.isAbsolute(r)) throw new Fail('refused: ' + JSON.stringify(rel) + ' is not a path inside the root');
  return r;
}
/**
 * The spawn's only reader: the text of root/rel, REFUSED (a throw, never a read) for judge/heldout/, judge/control.jsonl,
 * state/ and any heldout.jsonl. A missing file is null.
 * @param {string} root the tree
 * @param {string} rel a path relative to root
 * @returns {string|null}
 */
export function readData(root, rel) {
  const r = relPosix(rel);
  if (REFUSED.some((re) => re.test(r))) throw new Fail('refused: ' + r + ' is held out, the engine never reads it while spawning');
  const f = path.join(root, ...r.split('/'));
  if (!fs.existsSync(f)) return null;
  return fs.readFileSync(f, 'utf8');
}
const rowsAt = (root, rel) => { const t = readData(root, rel); return t === null ? [] : parseJsonl(t); };
/** SELECT's reader: only a task's heldout.jsonl and judge/control.jsonl, nothing else. */
function readSelect(root, rel) {
  const r = relPosix(rel);
  if (!/^neo\/tasks\/[^/]+\/heldout\.jsonl$/.test(r) && r !== 'judge/control.jsonl') throw new Fail('refused: the selector reads only a task held-out set and judge/control.jsonl, not ' + r);
  const f = path.join(root, ...r.split('/'));
  return fs.existsSync(f) && fs.statSync(f).isFile() ? fs.readFileSync(f, 'utf8') : null;
}
const dirNames = (root, rel) => { const d = path.join(root, ...relPosix(rel).split('/')); try { return fs.readdirSync(d).sort(); } catch { return []; } };

/**
 * Rows of one task or class in the engine's shape { q, expect, answer? }; a row without a prompt or an expect object is
 * left out, and so is a prompt grow/retire.mjs names retired.
 * @param {object[]} list rows ({ q } or { prompt }, expect, answer or reply)
 * @param {object|null} retired readRetired(root)
 * @returns {{ q: string, expect: object, answer?: string }[]}
 */
export function rowsOf(list, retired = null) {
  const out = [];
  for (const r of Array.isArray(list) ? list : []) {
    if (!isObj(r)) continue;
    const q = typeof r.q === 'string' ? r.q : typeof r.prompt === 'string' ? r.prompt : null;
    if (!q || !q.trim() || !isObj(r.expect)) continue;
    if (retired && isRetired(retired, q)) continue;
    const a = typeof r.answer === 'string' ? r.answer : typeof r.reply === 'string' ? r.reply : null;
    out.push(a !== null && a.trim() ? { q, expect: r.expect, answer: a } : { q, expect: r.expect });
  }
  return out;
}

/**
 * The prompts a cell of a class or task must stay silent on (grow/NEO.md step 3): the dev rows of every other class
 * (judge/dev/) and task (neo/tasks/<t>/dev.jsonl), grow/curriculum.jsonl prompts of other classes, and the built-in
 * greetings, organism questions and plain arithmetic (a built-in of the same digit-masked shape as an own row is left
 * out). Never a held-out file.
 * @param {string} root the tree
 * @param {{ cls?: string|null, task?: string|null, rows?: object[] }} own the class or task and its own rows
 * @returns {string[]}
 */
export function negativesFor(root, { cls = null, task = null, rows = [] } = {}) {
  const ownQ = new Set(rows.map((r) => norm(r.q, 1)));
  const ownShape = new Set(rows.map((r) => shapeOf(r.q)));
  const out = [], seen = new Set();
  const add = (q) => { if (typeof q !== 'string' || !q.trim()) return; const k = norm(q, 1); if (!k || ownQ.has(k) || seen.has(k)) return; seen.add(k); out.push(q); };
  for (const f of dirNames(root, 'judge/dev')) if (f.endsWith('.jsonl') && f.slice(0, -6) !== cls) for (const r of rowsAt(root, 'judge/dev/' + f)) add(r && r.q);
  for (const t of dirNames(root, TASKS_DIR)) if (t !== task) for (const r of rowsAt(root, TASKS_DIR + '/' + t + '/dev.jsonl')) add(r && r.q);
  for (const r of rowsAt(root, 'grow/curriculum.jsonl')) if (r && r.class !== cls) add(r.prompt ?? r.q);
  for (const q of BUILTIN_LIST) if (!ownShape.has(shapeOf(q))) add(q);
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
  if (typeof out !== 'string' || !out.trim() || !expectOk(out, row.expect)) return false;
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
function newSearch(rows, budget, t0, named) {
  return {
    rows, n: rows.length, ctx: rows.map((r) => ({ q: r.q, mem: null })), named, t0, ticks: 0, generated: 0, stop: null,
    limit: budget.maxGenerated, msLimit: budget.maxMs, capped: null, seen: new Map(), entries: [], byCost: {}, bools: [],
    outsSeen: new Set(), cands: [], phrases: [],
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
function splits(rem, k) {
  if (k === 1) return [[rem]];
  const out = [];
  for (let a = 1; a <= rem - (k - 1); a++) for (const rest of splits(rem - a, k - 1)) out.push([a, ...rest]);
  return out;
}
/** Bottom-up enumeration, cost 2 to MAX_COST; false when the budget stopped it. */
function enumerate(S) {
  const weight = (name) => (S.named.has(name) ? 1 : 2);
  const order = PRIM_NAMES.filter((n) => INTERIOR.has(PRIMS[n].family) && ARGS[n].length && !ARGS[n].includes('tpl'))
    .sort((a, b) => (S.named.has(b) - S.named.has(a)) || cmpStr(a, b));
  for (let c = 2; c <= MAX_COST; c++) {
    for (const name of order) {
      const ts = ARGS[name], rem = c - weight(name);
      if (rem < ts.length) continue;
      for (const sp of splits(rem, ts.length)) {
        const lists = ts.map((t, j) => (S.byCost[t] && S.byCost[t][sp[j]]) || null);
        if (lists.some((l) => !l || !l.length)) continue;
        if (!product(S, name, lists, c)) return false;
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
      S.generated++;
      const vec = applyPrim(S, name, args);
      if (vec) {
        const e = addEntry(S, [name, ...args.map((a) => a.node)], out, vec, cost);
        if (e && !e.konst) apex(S, e);
      }
    }
    let j = k - 1;
    while (j >= 0) { idx[j]++; if (idx[j] < lists[j].length) break; idx[j] = 0; j--; }
    if (j < 0) return true;
  }
}

// ---------------------------------------------------------------- the apex: every new value under the render of its type
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
    case 'strs': out.push([['render.list']], [['render.and']], [['render.lines']]); for (const r of ['render.numbered', 'render.bullets']) if (nm.has(r)) out.push([[r]]); break;
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
  if (type === 'num') return [[['render.number']]];
  if (type === 'str') return [[]];
  if (type === 'nums') return [[['render.listNums']], [['transform.asText'], ['render.and']]];
  if (type === 'strs') return [[['render.list']], [['render.and']]];
  return [];
}
/** Whether a node carries a text literal anywhere but as the keyword of a sense primitive (a slot is a value of the prompt). */
function wordLiteral(node, parent = null) {
  if (isObj(node)) return typeof node.lit === 'string' && !(parent && PRIMS[parent].family === 'sense');
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
  const pool = S.entries.filter((e) => e.cost <= 4 && !e.konst && SPAN_TYPES.has(e.type) && !wordLiteral(e.node)).slice(0, 3000);
  for (const e of pool) {
    for (const chain of spanModes(e.type)) {
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
function templateCands(S) {
  const ans = [], low = S.rows.map((r, i) => {
    if (r.answer === null) return null;
    const l = r.answer.toLowerCase();
    if (l.length !== r.answer.length) return null;
    ans.push(i);
    return l;
  });
  if (!ans.length) return;
  const spans = spanPool(S, ans, low);
  const tpls = new Map();
  const keep = (pyr) => { const k = canon(pyr); if (!tpls.has(k)) tpls.set(k, pyr); };
  for (const i of ans) {
    const a = S.rows[i].answer, pick = pickSpans(spans, i, 0, a.length, 4);
    if (!pick.length) continue;
    keep(tplNode(a, 0, a.length, pick));
    // the same place filled by another value of the same text ("35" is the last number, the largest and the median)
    pick.forEach((p, k) => {
      const alts = spans.filter((s) => s !== p.s && s.texts[i] !== null && s.texts[i].length === p.len && (s.hits.get(i) || []).includes(p.at))
        .map((s) => ({ s, len: p.len })).sort(spanOrder).slice(0, 8);
      for (const { s } of alts) keep(tplNode(a, 0, a.length, pick.map((x, j) => (j === k ? { s, at: p.at, len: p.len } : x))));
      if (pick.length > 1) keep(tplNode(a, 0, a.length, pick.filter((_, j) => j !== k))); // or the place kept as its text
    });
  }
  lineTemplates(S, ans, low, spans, keep);
  for (const pyr of tpls.values()) {
    if (spent(S)) break;
    S.generated++;
    const outs = evalOuts(S, pyr, null);
    const cand = { pyramid: pyr, mem: null, outs, src: canon(pyr).includes('"render.lines"') ? 'lines' : 'template' };
    if (offer(S, cand, false) && pyr[0] === 'render.template') S.phrases.push({ node: pyr, outs });
  }
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
  if (r.answer !== null && expectOk(r.answer, r.expect)) return r.answer;
  const e = r.expect;
  const v = typeof e.equals === 'string' ? e.equals : [...(Array.isArray(e.contains) ? e.contains : []), ...(Array.isArray(e.containsAny) && e.containsAny.length ? [e.containsAny[0]] : [])].join(' ');
  return v && v.trim() && expectOk(v, e) && !REFUSAL_RE.test(v.trim()) ? v : null;
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
  for (const q of Array.isArray(negatives) ? negatives : []) {
    if (typeof q !== 'string' || !q.trim() || seen.has(q)) continue;
    seen.add(q);
    const j = negs.length, f = featOf(q);
    negs.push({ q, f });
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

// ---------------------------------------------------------------- spawn
const posInt = (v, d) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.floor(Number(v)) : d);
/** The family a cell is counted under: its first primitive below the render apex, depth first (render when none). */
function familyOf(cell) {
  for (const [, n] of nodesOf(cell.pyramid)) if (Array.isArray(n) && PRIMS[n[0]].family !== 'render') return PRIMS[n[0]].family;
  return 'render';
}
/**
 * Spawn the cells of a task (grow/NEO.md, "The engine", steps 1 to 3): enumerate, template, remember and mutate
 * candidates over the dev rows, induce each one's guard, and keep every candidate its rows and the negatives do not
 * refute. The same rows, negatives and parents give the same cells.
 * @param {{ task: string, rows: object[], negatives?: string[], gen?: number, parents?: object[], budget?: { maxGenerated?: number, maxMs?: number } }} spec
 * @returns {{ cells: object[], stats: { generated: number, distinct: number, kept: number, byFamily: object, bySource: object, maxHeight: number, devOk: number, devN: number, ms: number, cellsPerSecond: number, capped: string|null } }}
 */
export function spawn({ task, rows, negatives = [], gen = 1, parents = [], budget = {} } = {}) {
  const t0 = Date.now();
  if (typeof task !== 'string' || !task.trim()) throw new Fail('spawn: the task is not a word');
  const B = { maxGenerated: posInt(budget && budget.maxGenerated, BUDGET.maxGenerated), maxMs: posInt(budget && budget.maxMs, BUDGET.maxMs) };
  const R = rowsOf(rows).map(prepRow);
  const S = newSearch(R, { maxGenerated: Math.floor(B.maxGenerated * ENUM_SHARE), maxMs: Math.floor(B.maxMs * ENUM_SHARE) }, t0, namedPrims(R.map((r) => r.q)));
  const pools = poolsOf(R);
  if (R.length) { seed(S, pools); enumerate(S); }
  S.stop = null; S.limit = B.maxGenerated; S.msLimit = B.maxMs;
  const P = Array.isArray(parents) ? parents : [];
  if (R.length) { parentCands(S, P); templateCands(S); memoryCands(S); yesNoCands(S); mutantCands(S, P, pools); }
  const G = guardContext(S, negatives), g = Number.isInteger(gen) && gen >= 0 ? gen : 1;
  const cells = [], ids = new Set(), src = new Map();
  for (const cand of S.cands) {
    const guard = induceGuard(S, G, cand);
    const cell = guard && keepCell(S, G, cand, guard, task, g);
    if (cell && !ids.has(cell.id)) { ids.add(cell.id); cells.push(cell); src.set(cell.id, cand.src); }
  }
  // grow/NEO.md step 4: rows passed (more first), alias affinity (the primitives the prompts name), size, id
  const aff = new Map(cells.map((c) => [c.id, new Set(nodesOf(c.pyramid).filter(([, n]) => Array.isArray(n) && S.named.has(n[0]) && !['sense', 'render'].includes(PRIMS[n[0]].family)).map(([, n]) => n[0])).size]));
  cells.sort((a, b) => b.fit.ok - a.fit.ok || aff.get(b.id) - aff.get(a.id) || a.size - b.size || cmpStr(a.id, b.id));
  const byFamily = {}, bySource = {};
  for (const c of cells) { const f = familyOf(c); byFamily[f] = (byFamily[f] || 0) + 1; const s = src.get(c.id); bySource[s] = (bySource[s] || 0) + 1; }
  const colony = makeColony(cells);
  const devOk = R.filter((r) => { const a = colony.answer(r.q); return a !== null && expectOk(a, r.expect); }).length;
  const ms = Date.now() - t0;
  return {
    cells,
    stats: {
      generated: S.generated, distinct: S.entries.length + S.outsSeen.size, kept: cells.length, byFamily, bySource,
      maxHeight: cells.reduce((m, c) => Math.max(m, c.height), 0), devOk, devN: R.length, ms,
      cellsPerSecond: Math.round(S.generated / (Math.max(1, ms) / 1000)), capped: S.capped,
    },
  };
}

// ---------------------------------------------------------------- compile: the kept cells as one cell module
let KERNEL_TEXT = null;
/** The kernel's marked region of grow/neo-kernel.mjs, verbatim, the two marker lines included. */
export function kernelRegion() {
  if (KERNEL_TEXT !== null) return KERNEL_TEXT;
  const t = fs.readFileSync(KERNEL_FILE, 'utf8');
  const a = t.search(/^\/\/ <KERNEL>/m), b = t.search(/^\/\/ <\/KERNEL>/m);
  if (a < 0 || b < a) throw new Fail('grow/neo-kernel.mjs has no // <KERNEL> ... // </KERNEL> region');
  const end = t.indexOf('\n', b);
  KERNEL_TEXT = t.slice(a, end < 0 ? t.length : end + 1);
  return KERNEL_TEXT;
}
const tripped = (s) => FORBIDDEN.some(([re]) => re.test(s));
const cellLine = (c) => JSON.stringify({ id: c.id, guard: c.guard, pyramid: c.pyramid, mem: c.mem });
function moduleText({ id, cls, gen, lane, lines, examples, grownFrom }) {
  return [
    '// ' + id + '.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the',
    '// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.',
    'export const meta = Object.freeze(' + JSON.stringify({ id, class: cls, generation: gen, lane, grownFrom, version: 1 }) + ');',
    '',
    kernelRegion() + 'const COLONY = [',
    lines.join(',\n'),
    '];',
    'const RUN = makeColony(COLONY);',
    'export const examples = ' + JSON.stringify(examples) + ';',
    'export const colony = Object.freeze({ cells: COLONY.length, kernel: KERNEL_VERSION });',
    '/** The answer of the first cell of the colony that answers q, or null. */',
    "export function answer(q) { return RUN.answer(String(q ?? '')); }",
    '/** Whether a cell of the colony answers q. */',
    'export function can(q) { return answer(q) !== null; }',
    '',
  ].join('\n');
}
/** The dev rows the first k cells answer right, FORBIDDEN-free, at most MAX_EXAMPLES, the row of `first` first. */
function examplesOf(cells, rows, first) {
  const colony = makeColony(cells), out = [];
  for (const r of rows) {
    if (out.length >= MAX_EXAMPLES) break;
    const ex = { q: r.q, expect: r.expect };
    if (tripped(JSON.stringify(ex)) || out.some((x) => x.q === r.q)) continue;
    const a = colony.answer(r.q);
    if (a !== null && expectOk(a, r.expect) && !REFUSAL_RE.test(a.trim())) out.push(ex);
  }
  const at = typeof first === 'string' ? out.findIndex((x) => x.q === first) : -1;
  if (at > 0) out.unshift(...out.splice(at, 1));
  return out;
}
/**
 * Compile kept cells into the text of a cell.mjs that passes grow/contract.mjs validateCell (grow/NEO.md, compile),
 * with what was left out: cells whose JSON names a FORBIDDEN pattern, and the lowest in the order when the module
 * would pass MAX_SOURCE_BYTES. The examples are the given rows the included colony answers right; none, no source.
 * @param {{ id: string, cls: string, gen: number, lane?: string, cells: object[], examples: object[], first?: string, maxBytes?: number }} spec
 * @returns {{ source: string|null, included: number, leftOut: number, forbidden: number, invalid: number, examples: object[], bytes: number, cells: object[], why?: string }}
 */
export function compileModule({ id, cls, gen, lane = LANE, cells = [], examples = [], first = null, maxBytes = MAX_SOURCE_BYTES } = {}) {
  if (!ID_RE.test(String(id ?? ''))) throw new Fail('compile: the id ' + JSON.stringify(id) + ' does not match ' + ID_RE);
  if (typeof cls !== 'string' || !cls.trim()) throw new Fail('compile: the class is not a word');
  if (!Number.isInteger(gen) || gen < 1) throw new Fail('compile: the generation is not an integer from 1');
  const ok = [], lines = [];
  let forbidden = 0, invalid = 0;
  for (const c of Array.isArray(cells) ? cells : []) {
    if (!checkCell(c).ok) { invalid++; continue; }
    const line = cellLine(c);
    if (tripped(line)) { forbidden++; continue; }
    ok.push(c); lines.push(line);
  }
  const rows = rowsOf(examples);
  const build = (k) => {
    const exs = examplesOf(ok.slice(0, k), rows, first);
    const source = moduleText({ id, cls, gen, lane, lines: lines.slice(0, k), examples: exs, grownFrom: exs.map((x) => x.q) });
    return { k, exs, source, bytes: Buffer.byteLength(source) };
  };
  let best = build(ok.length);
  if (best.bytes > maxBytes) { // the most cells that fit, by halving (the lowest in the order are left out)
    let lo = 0, hi = ok.length - 1;
    best = null;
    while (lo <= hi) { const mid = (lo + hi) >> 1, b = build(mid); if (b.bytes <= maxBytes) { best = b; lo = mid + 1; } else hi = mid - 1; }
    if (!best) best = build(0);
  }
  const base = { included: best.k, leftOut: ok.length - best.k, forbidden, invalid, examples: best.exs, bytes: best.bytes, cells: ok.slice(0, best.k) };
  if (!best.k) return { ...base, source: null, why: 'no kept cell fits in a module' };
  if (!best.exs.length) return { ...base, source: null, why: 'no dev row is answered right by the kept cells' };
  return { ...base, source: best.source };
}
/**
 * compile of grow/NEO.md: the text of the cell.mjs, or null when nothing can be compiled.
 * @param {{ id: string, cls: string, gen: number, lane?: string, cells: object[], examples: object[] }} spec
 * @returns {string|null}
 */
export function compile(spec) { return compileModule(spec).source; }

/** The test.mjs of a compiled colony: valid by grow/contract.mjs validateTest, four tests, no import but ./cell.mjs and node:test. */
export function testOf(id, silent = []) {
  return [
    '// test.mjs of ' + id + ', written by grow/neo.mjs: its meta, every example answered right, silence on greetings and',
    '// plain arithmetic, and a colony of at least one cell.',
    "import test from 'node:test';",
    "import assert from 'node:assert/strict';",
    "import { meta, can, answer, examples, colony } from './cell.mjs';",
    'const REFUSAL_RE = ' + REFUSAL_RE.toString() + ';',
    "const low = (s) => String(s ?? '').trim().toLowerCase();",
    '/** The clauses of judge/judge.mjs expectOk, for an answer and its expect. */',
    'function expectOk(got, e) {',
    "  if (typeof got !== 'string' || !e || typeof e !== 'object') return false;",
    '  const t = low(got), words = (got.trim().match(/\\S+/g) || []).length;',
    '  if (e.notRefusal === true && REFUSAL_RE.test(got.trim())) return false;',
    '  if (e.equals !== undefined && t !== low(e.equals)) return false;',
    '  if (e.contains && !e.contains.every((n) => t.includes(low(n)))) return false;',
    '  if (e.containsAny && !e.containsAny.some((n) => t.includes(low(n)))) return false;',
    '  if (e.notContains && e.notContains.some((n) => t.includes(low(n)))) return false;',
    '  if (e.minWords !== undefined && words < e.minWords) return false;',
    '  if (e.maxWords !== undefined && words > e.maxWords) return false;',
    '  return true;',
    '}',
    'const SILENT = ' + JSON.stringify(silent) + ';',
    "test('meta names this colony', () => { assert.equal(meta.id, " + JSON.stringify(id) + "); assert.equal(meta.lane, 'neo'); assert.equal(meta.version, 1); });",
    "test('every example is answered right', () => { assert.ok(examples.length >= 1); for (const ex of examples) { assert.equal(can(ex.q), true, ex.q); assert.ok(expectOk(answer(ex.q), ex.expect), ex.q); } });",
    "test('silent on greetings and plain arithmetic', () => { for (const q of SILENT) { assert.equal(can(q), false, q); assert.equal(answer(q), null, q); } });",
    "test('the colony holds at least one cell', () => { assert.ok(colony.cells >= 1); });",
    '',
  ].join('\n');
}
/** The built-in greetings and plain arithmetic the colony is silent on (each verified), for its test.mjs. */
const silentFor = (cells) => { const c = makeColony(cells); return [...BUILTIN_NEGATIVES.greetings, ...BUILTIN_NEGATIVES.arithmetic].filter((q) => !c.can(q) && !tripped(q)); };

// ---------------------------------------------------------------- spawn --class: a lane-neo candidate for a locked class
const uniqQ = (rows) => { const seen = new Set(); return rows.filter((r) => { const k = norm(r.q, 1); if (seen.has(k)) return false; seen.add(k); return true; }); };
function briefOf(id, cls, gen, stats, comp) {
  return [
    '# ' + id + ': a NEO colony for the class ' + cls + ' (generation ' + gen + ')',
    '',
    'Generated by `node grow/neo.mjs spawn --class ' + cls + ' --gen ' + gen + '` with no model call (grow/NEO.md, "The engine").',
    '',
    '- candidates evaluated (generated): ' + stats.generated + ', distinct values and outputs: ' + stats.distinct,
    '- cells kept: ' + stats.kept + ', by family: ' + JSON.stringify(stats.byFamily) + ', by source: ' + JSON.stringify(stats.bySource),
    '- tallest pyramid: ' + stats.maxHeight + ', dev rows the colony answers right: ' + stats.devOk + ' of ' + stats.devN,
    '- cells in cell.mjs: ' + comp.included + ', left out for the size bar: ' + comp.leftOut + ', left out for a FORBIDDEN pattern: ' + comp.forbidden,
    '- examples: ' + comp.examples.length + ', ms: ' + stats.ms + ', candidates per second: ' + stats.cellsPerSecond,
    '',
    'Every kept cell is in colony.json; the locked judge decides this candidate like any other.',
    '',
  ].join('\n');
}
/**
 * spawn --class of grow/NEO.md: rows of judge/dev/<cls>.jsonl and the class's grow/dreams.jsonl rows (retired prompts
 * left out), spawned and compiled into the candidate directory <out>/<cls>-neo-g<n>/ (out defaults to
 * work/grow/gen-<n>/neo/). With no kept cell or no example nothing is written and the line says why.
 * @param {string} root the tree
 * @param {{ cls: string, gen: number, out?: string|null, budget?: object }} opts
 * @returns {object} the JSON line
 */
export function spawnClass(root, { cls, gen, out = null, budget = {} } = {}) {
  if (!CLASS_RE.test(String(cls ?? ''))) throw new Fail('usage: --class names a class (' + CLASS_RE + ')\n' + USAGE, 2);
  if (!Number.isInteger(gen) || gen < 1) throw new Fail('usage: --gen is an integer from 1\n' + USAGE, 2);
  const retired = readRetired(root);
  const dev = rowsAt(root, 'judge/dev/' + cls + '.jsonl'), dreams = rowsAt(root, 'grow/dreams.jsonl').filter((r) => isObj(r) && r.class === cls);
  const rows = uniqQ(rowsOf([...dev, ...dreams], retired));
  if (!rows.length) throw new Fail('no row for the class ' + cls + ' in judge/dev/' + cls + '.jsonl or grow/dreams.jsonl');
  const id = armId(cls, LANE, gen);
  const { cells, stats } = spawn({ task: cls, rows, negatives: negativesFor(root, { cls, rows }), gen, parents: [], budget });
  const comp = compileModule({ id, cls, gen, lane: LANE, cells, examples: rows });
  const dir = path.join(out ? path.resolve(out) : path.join(root, 'work', 'grow', 'gen-' + gen, LANE), id);
  const line = {
    class: cls, generation: gen, id, generated: stats.generated, kept: stats.kept, devOk: stats.devOk, devN: stats.devN,
    cells: comp.source ? comp.included : 0, leftOut: comp.leftOut, forbidden: comp.forbidden, written: false, ms: stats.ms, cellsPerSecond: stats.cellsPerSecond, out: dir,
  };
  if (!cells.length) return { ...line, why: 'no cell was kept: nothing is written' };
  if (!comp.source) return { ...line, why: comp.why + ': nothing is written' };
  writeText(path.join(dir, 'cell.mjs'), comp.source);
  writeText(path.join(dir, 'test.mjs'), testOf(id, silentFor(comp.cells)));
  writeText(path.join(dir, 'examples.jsonl'), comp.examples.map((x) => JSON.stringify(x)).join('\n') + '\n');
  writeText(path.join(dir, 'brief.md'), briefOf(id, cls, gen, stats, comp));
  writeJson(path.join(dir, 'colony.json'), { id, class: cls, generation: gen, lane: LANE, kernel: KERNEL_VERSION, stats, included: comp.included, leftOut: comp.leftOut, forbidden: comp.forbidden, cells });
  return { ...line, written: true };
}

// ---------------------------------------------------------------- grow --task: spawn, compile, SELECT, PROMOTE
/** The organism of judge/baseline.mjs runOrganism, with the knowledge pack when present (grow/teach.mjs does the same). */
export async function organismOf(root, knowledge) {
  const file = path.join(root, 'judge', 'baseline.mjs');
  if (!fs.existsSync(file)) throw new Fail('no judge/baseline.mjs under ' + root + ': the baseline cannot be measured');
  const { runOrganism, PACK } = await import(pathToFileURL(file).href);
  const k = knowledge === 'none' ? false : knowledge ? path.resolve(knowledge) : (PACK && fs.existsSync(PACK) ? PACK : undefined);
  return (rows) => runOrganism(rows, { knowledge: k });
}
const score = (ok, n) => ({ ok, n, score: n ? round4(ok / n) : 0 });
/** The atomic read-modify-write of the ledger's generated total (every other key is kept as it is). */
function addGenerated(root, k) {
  const f = path.join(root, ...LEDGER.split('/'));
  const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
  doc.generated = (Number.isFinite(doc.generated) ? doc.generated : 0) + k;
  const tmp = f + '.' + Date.now().toString(36) + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(doc, null, 2) + '\n');
  fs.renameSync(tmp, f);
  return doc.generated;
}
function readIndex(root) {
  const f = path.join(root, 'grown', 'index.json');
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (!isObj(j) || !Number.isInteger(j.generation) || !Array.isArray(j.cells)) throw new Fail('grown/index.json is not { generation, cells: [..] }');
  return j;
}
const isNeoRow = (r) => isObj(r) && (r.tier === LANE);
const taskOfRow = (r) => (typeof r.task === 'string' ? r.task : typeof r.class === 'string' ? r.class : null);
/** Cells left after removing, one by one, the cell that answers each prompt of qs wrong (bad(q, answer) true). */
function prune(cells, qs, bad) {
  let list = cells.slice(), removed = 0;
  for (let guard = 0; guard < 100000; guard++) {
    const colony = makeColony(list);
    let hit = null;
    for (const q of qs) { const e = colony.explain(q); if (e && bad(q, e.answer)) { hit = e.index; break; } }
    if (hit === null) break;
    list.splice(hit, 1); removed++;
  }
  return { cells: list, removed };
}
/** Byte-exact snapshot of files, restored by put(). */
function snapshot(files) {
  const saved = files.map((f) => ({ f, data: fs.existsSync(f) ? fs.readFileSync(f) : null }));
  return () => { for (const { f, data } of saved) { try { if (data === null) fs.rmSync(f, { force: true }); else fs.writeFileSync(f, data); } catch { /* best effort, the next file still goes back */ } } };
}
/**
 * grow --task of grow/NEO.md: spawn the task's cells from neo/tasks/<task>/dev.jsonl with its present colony as
 * parents, write colony.json, add the generated count to the ledger, compile, SELECT on the task's held-out set
 * against the organism and the present colony, and PROMOTE into grown/ when it wins (proved, else put back byte for
 * byte). A completed grow resolves with its line, promoted or not.
 * @param {{ root?: string, task: string, gen: number, organism?: Function|null, budget?: object, render?: Function, knowledge?: string, now?: Function }} opts
 * @returns {Promise<object>} the JSON line
 */
export async function growTask({ root = DEFAULT_ROOT, task, gen, organism = null, budget = {}, render = renderIndexMjs, knowledge, now = () => new Date() } = {}) {
  const t0 = Date.now();
  if (!TASK_RE.test(String(task ?? ''))) throw new Fail('usage: --task names a task (' + TASK_RE + ')\n' + USAGE, 2);
  if (!Number.isInteger(gen) || gen < 1) throw new Fail('usage: --gen is an integer from 1\n' + USAGE, 2);
  const frozen = readLedger(root).tasks.filter((r) => r.task === task).at(-1);
  if (!frozen) throw new Fail('the task ' + task + ' is not in ' + LEDGER + ': only an opened task grows');
  const tdir = TASKS_DIR + '/' + task;
  const line = (o) => ({ task, generation: gen, generated: 0, kept: 0, cells: 0, heldout: null, baseline: null, promoted: false, why: [], pruned: 0, control: 0, ...o, ms: Date.now() - t0 });
  const devText = readData(root, tdir + '/dev.jsonl');
  if (devText === null || shaText(devText) !== frozen.devSha) return line({ why: ["the task's dev set changed since it was opened"] });
  const rows = uniqQ(rowsOf(parseJsonl(devText), readRetired(root)));
  const colonyFile = path.join(root, ...tdir.split('/'), 'colony.json');
  const colText = readData(root, tdir + '/colony.json');
  const old = colText ? (JSON.parse(colText).cells || []).filter((c) => isObj(c) && checkCell(c).ok) : [];
  const negs = negativesFor(root, { task, rows });
  const { cells, stats } = spawn({ task, rows, negatives: negs, gen, parents: old, budget });
  const totals = addGenerated(root, stats.generated);
  const have = new Set(cells.map((c) => c.id));
  writeJson(colonyFile, { task, generation: gen, kernel: KERNEL_VERSION, at: now().toISOString(), stats, cells: [...cells, ...old.filter((c) => !have.has(c.id))] });
  const cps = stats.cellsPerSecond, ran = { generated: stats.generated, kept: stats.kept, cellsPerSecond: cps, ledgerGenerated: totals };
  const cellsDir = path.join(root, 'grown', 'cells');
  let k = 1;
  while (fs.existsSync(path.join(cellsDir, armId(task, LANE, gen, k) + '.mjs'))) k++;
  const id = armId(task, LANE, gen, k);
  const comp = compileModule({ id, cls: task, gen, lane: LANE, cells, examples: rows });
  if (!comp.source) return line({ ...ran, why: [comp.why] });
  // SELECT: the frozen held-out set, the control prompts, the organism, the present colony
  const heldText = readSelect(root, tdir + '/heldout.jsonl');
  if (heldText === null || shaText(heldText) !== frozen.heldoutSha) return line({ ...ran, cells: comp.included, why: ["the task's held-out set changed since it was opened"] });
  const held = rowsOf(parseJsonl(heldText));
  const controlText = readSelect(root, 'judge/control.jsonl');
  const controlQ = controlText === null ? [] : parseJsonl(controlText).map((r) => (isObj(r) && typeof r.q === 'string' ? r.q : null)).filter(Boolean);
  const whole = makeColony(comp.cells); // grow/NEO.md: the held-out score is measured BEFORE any pruning
  const heldout = score(held.filter((r) => expectOk(whole.answer(r.q), r.expect)).length, held.length);
  const gate = prune(comp.cells, [...controlQ, ...negs], () => true);
  const org = organism || (await organismOf(root, knowledge));
  const res = await org(held.map((r) => ({ q: r.q, expect: r.expect })));
  const got = Array.isArray(res) ? res : res && Array.isArray(res.rows) ? res.rows : [];
  const baseline = score(held.filter((r, i) => { const g = got[i] && got[i].q === r.q ? got[i] : got.find((x) => x && x.q === r.q); return expectOk(g ? g.got : null, r.expect); }).length, held.length);
  const index = readIndex(root);
  const present = index.cells.find((r) => isNeoRow(r) && taskOfRow(r) === task) || null;
  const why = [];
  if (!(heldout.score > baseline.score)) why.push('the colony does not score above the organism');
  if (present && !(heldout.score > (present.heldout && Number.isFinite(present.heldout.score) ? present.heldout.score : -1))) why.push('the present colony scores as high');
  const sel = { ...ran, cells: comp.included, leftOut: comp.leftOut, forbidden: comp.forbidden, heldout, baseline, control: gate.removed };
  if (why.length) return line({ ...sel, why });
  // PROMOTE: cell by cell, a cell that answered a held-out row wrong is removed; the first example no earlier cell answers
  const kept = prune(gate.cells, held.map((r) => r.q), (q, a) => !expectOk(a, held.find((r) => r.q === q).expect));
  const others = [...index.cells.filter((r) => !isNeoRow(r)), ...index.cells.filter((r) => isNeoRow(r) && taskOfRow(r) !== task)];
  const earlier = [];
  for (const r of others) {
    const f = path.join(root, 'grown', ...String(r.file || '').split('/'));
    if (!r.file || !fs.existsSync(f)) continue;
    try { earlier.push(await import(pathToFileURL(f).href + '?v=' + Date.now().toString(36) + '-' + earlier.length)); } catch { /* a cell that does not load answers nothing */ }
  }
  const shadowed = (q) => earlier.some((m) => { try { return typeof m.can === 'function' && m.can(q) === true; } catch { return false; } });
  const pre = compileModule({ id, cls: task, gen, lane: LANE, cells: kept.cells, examples: rows });
  const free = pre.source ? pre.examples.find((x) => !shadowed(x.q)) : null;
  if (!free) return line({ ...sel, pruned: kept.removed, why: [pre.source ? 'every example is answered first by an earlier cell' : pre.why] });
  const fin = compileModule({ id, cls: task, gen, lane: LANE, cells: kept.cells, examples: rows, first: free.q });
  const file = path.join(cellsDir, id + '.mjs'), indexPath = path.join(root, 'grown', 'index.json'), mjsPath = path.join(root, 'grown', 'index.mjs');
  const oldFile = present && present.file ? path.join(root, 'grown', ...String(present.file).split('/')) : null;
  const putBack = snapshot([indexPath, mjsPath, file, ...(oldFile && oldFile !== file ? [oldFile] : [])]);
  const row = { id, class: task, task, generation: gen, lane: LANE, tier: LANE, file: 'cells/' + id + '.mjs', cells: fin.included, generated: stats.generated, heldout: { score: heldout.score, n: heldout.n, ok: heldout.ok }, promotedAt: now().toISOString() };
  try {
    fs.mkdirSync(cellsDir, { recursive: true });
    fs.writeFileSync(file, fin.source, { flag: 'wx' });
    if (oldFile && oldFile !== file && fs.existsSync(oldFile)) fs.rmSync(oldFile);
    const next = { ...index, cells: [...others, row] };
    fs.writeFileSync(indexPath, JSON.stringify(next, null, 2) + '\n');
    fs.writeFileSync(mjsPath, render(next));
    const chk = spawnSync(process.execPath, ['--check', mjsPath], { encoding: 'utf8', windowsHide: true });
    if (chk.status !== 0) throw new Fail('node --check grown/index.mjs failed: ' + errLine(chk.stderr || chk.stdout));
    const mod = await import(pathToFileURL(file).href + '?v=' + Date.now().toString(36));
    const v = validateCell(fs.readFileSync(file, 'utf8'), mod);
    if (!v.ok) throw new Fail('the promoted colony fails the contract: ' + v.errors.join('; '));
    const { mod: idx, answers } = await answersOf(mjsPath);
    if (idx.GROWN.length !== next.cells.length) throw new Fail('grown/index.mjs exports ' + idx.GROWN.length + ' cells, grown/index.json lists ' + next.cells.length);
    next.cells.forEach((r, i) => { if (answers[i].id !== r.id) throw new Fail('grown/index.mjs cell ' + i + ' is ' + answers[i].id + ', grown/index.json says ' + r.id); });
    const bad = answers.filter((a) => !a.ok);
    if (bad.length) throw new Fail(bad.map((a) => a.id + ' does not answer its own examples[0].q through grownAnswer (got ' + (a.got ?? 'null') + ')').join('; '));
  } catch (e) {
    putBack();
    return line({ ...sel, pruned: kept.removed, why: ['the proof failed: ' + first(e) + ' (grown/ is as it was)'] });
  }
  return line({ ...sel, id, cells: fin.included, pruned: kept.removed, promoted: true, replaced: present ? present.id : null });
}

// ---------------------------------------------------------------- status
/**
 * status of grow/NEO.md: opened tasks, promoted colonies and their cells, mastered colonies (held-out score 1), the
 * ledger's generated total, the kept population of every task's colony.json and its families.
 * @param {string} root the tree
 * @returns {{ tasks: number, colonies: number, cells: number, mastered: number, generated: number, kept: number, byFamily: object, at: string }}
 */
export function status(root = DEFAULT_ROOT) {
  const led = readLedger(root);
  let rows = [];
  try { rows = readIndex(root).cells.filter(isNeoRow); } catch { rows = []; }
  const byFamily = {};
  let kept = 0;
  for (const t of dirNames(root, TASKS_DIR)) {
    const text = readData(root, TASKS_DIR + '/' + t + '/colony.json');
    if (text === null) continue;
    let cells = [];
    try { cells = JSON.parse(text).cells || []; } catch { cells = []; }
    for (const c of cells) if (isObj(c) && Array.isArray(c.pyramid) && PRIMS[c.pyramid[0]]) { kept++; const f = familyOf(c); byFamily[f] = (byFamily[f] || 0) + 1; }
  }
  return {
    tasks: new Set(led.tasks.map((r) => r.task)).size, colonies: rows.length,
    cells: rows.reduce((s, r) => s + (Number.isInteger(r.cells) ? r.cells : 0), 0),
    mastered: rows.filter((r) => r.heldout && r.heldout.score === 1).length, generated: led.doc.generated, kept, byFamily, at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------- CLI
const FLAGS = new Set(['root', 'class', 'task', 'gen', 'out', 'max-generated', 'max-ms', 'knowledge']);
function parseFlags(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const k = a.slice(2);
    if (!FLAGS.has(k)) throw new Fail('usage: unknown flag --' + k + '\n' + USAGE, 2);
    if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) throw new Fail('usage: --' + k + ' needs a value\n' + USAGE, 2);
    flags[k] = argv[++i];
  }
  return { pos, flags };
}
const intFlag = (v, name) => { if (v === undefined) return undefined; const n = Number(v); if (!Number.isInteger(n) || n < 1) throw new Fail('usage: --' + name + ' is an integer from 1\n' + USAGE, 2); return n; };
/**
 * The CLI: spawn, grow, status. Prints one JSON line last; resolves to the exit code (0, 1 a failure, 2 usage).
 * @param {string[]} argv the arguments after the script
 * @param {{ log?: Function, err?: Function, organism?: Function|null }} io
 * @returns {Promise<number>}
 */
export async function main(argv = process.argv.slice(2), { log = console.log, err = console.error, organism = null } = {}) {
  try {
    const { pos, flags } = parseFlags(argv);
    const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
    const budget = { maxGenerated: intFlag(flags['max-generated'], 'max-generated'), maxMs: intFlag(flags['max-ms'], 'max-ms') };
    const verb = pos[0];
    if (pos.length !== 1 || !['spawn', 'grow', 'status'].includes(verb)) throw new Fail('usage: one verb of spawn, grow, status\n' + USAGE, 2);
    let out;
    if (verb === 'spawn') {
      if (flags.class === undefined || flags.gen === undefined) throw new Fail('usage: spawn takes --class and --gen\n' + USAGE, 2);
      out = spawnClass(root, { cls: flags.class, gen: intFlag(flags.gen, 'gen'), out: flags.out || null, budget });
    } else if (verb === 'grow') {
      if (flags.task === undefined || flags.gen === undefined) throw new Fail('usage: grow takes --task and --gen\n' + USAGE, 2);
      out = await growTask({ root, task: flags.task, gen: intFlag(flags.gen, 'gen'), organism, budget, knowledge: flags.knowledge });
    } else out = status(root);
    log(JSON.stringify(out));
    return 0;
  } catch (e) {
    const code = e instanceof Fail ? e.code : 1;
    err('neo: ' + (e instanceof Fail ? e.message : first(e)));
    log(JSON.stringify({ ok: false, error: first(e), code }));
    return code;
  }
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  main().then((code) => { process.exitCode = code; });
}
