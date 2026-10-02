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
//   node grow/neo.mjs grow --task <task> --gen <n> [--stage <dir>] [--knowledge <dir>|none] [--max-generated <k>] [--max-ms <ms>] [--root <dir>]
//   node grow/neo.mjs merge --stage <dir> [--knowledge <dir>|none] [--max-ms <ms>] [--root <dir>]
//   node grow/neo.mjs regate [--root <dir>]
//   node grow/neo.mjs status [--root <dir>]
// Every verb takes --era <n> and echoes it in its line. grow --stage writes ONE file, <dir>/<task>.json, and changes
// nothing else; merge applies the staged files with the proofs of a direct grow. regate keeps serve: true on a tier
// "neo" row of grown/index.json only while the colony is mastered (held-out score 1), and a serving colony answers only
// a prompt that fits a question template of its task (contract c2). The pure search is grow/neo-core.mjs (contract c4).
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
// THE TEMPORAL GRADE (part 4): a task whose task.json says "temporal": true is graded walk-forward: its held-out rows
// are only the ones later than every dev row (a row's time: its t, else the latest year or date its prompt writes,
// else the file order), and its line and index row carry heldout.placebo, persistence (each row answered with the last
// value seen before it). Such a colony is mastered only above its placebo; regate refuses a temporal row without one.
// Author: NEO board builder (THE ENGINE), 2026-10-01; part 4 (the series and table slices, the temporal grade), 2026-10-02.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { KERNEL_VERSION, PRIMS, norm, makeColony, checkCell, knowNorm, expandMacros } from './neo-kernel.mjs';
import {
  BUDGET, MAX_COST, ENUM_SHARE, BUILTIN_NEGATIVES, BUILTIN_LIST, Fail, spawn as coreSpawn, rowsOf as coreRowsOf, passesRow, familyOf,
  deriveTemplates, fitsTemplates, isMastered, rowServes, withKnowledge, usesKnow,
} from './neo-core.mjs';
import * as CORE from './neo-core.mjs';
import { loadPacks } from './know.mjs';
import { genomeOf } from './genome.mjs';
import { validateCell, validateTest, FORBIDDEN, TEST_FORBIDDEN, parseJsonl, ID_RE, MAX_SOURCE_BYTES, REFUSAL_RE } from './contract.mjs';
import { expectOk } from '../judge/judge.mjs';
import { renderIndexMjs, answersOf } from './store.mjs';
import { readRetired, isRetired } from './retire.mjs';
import { readLedger, shaText, LEDGER, TASKS_DIR, TASK_RE } from './teach.mjs';
import { DEFAULT_ROOT, CLASS_RE, armId } from './generation.mjs';

// THE SEARCH lives in grow/neo-core.mjs (contract c4): re-exported here, so every importer of grow/neo.mjs keeps its names.
export { BUDGET, MAX_COST, ENUM_SHARE, BUILTIN_NEGATIVES, Fail, passesRow, familyOf };
/**
 * Spawn the cells of a task: grow/neo-core.mjs spawn, graded by the locked judge's expectOk (judge/judge.mjs) unless
 * the spec names another grader. The same rows, negatives and parents give the same cells.
 * @param {{ task: string, rows: object[], negatives?: string[], gen?: number, parents?: object[], budget?: object, expectOk?: Function }} spec
 * @returns {{ cells: object[], stats: object }}
 */
export function spawn(spec = {}) { return coreSpawn({ ...spec, expectOk: typeof spec.expectOk === 'function' ? spec.expectOk : expectOk }); }

const HERE = path.dirname(fileURLToPath(import.meta.url));
const KERNEL_FILE = path.join(HERE, 'neo-kernel.mjs');
export const LANE = 'neo';
/** The most examples a compiled module carries (the maxExamples gene's default: the genome in force decides). */
export const MAX_EXAMPLES = 20;
/** The share of what is left of grow's --max-ms its search is told (the rest compiles, selects, promotes or stages). */
export const GROW_SPAWN_SHARE = 0.7;
/** The why of a grow that reached its --max-ms: it kept what it had. */
export const DEADLINE_WHY = 'deadline: --max-ms reached, the grow kept what it had';
export const USAGE = [
  'usage: node grow/neo.mjs spawn --class <cls> --gen <n> [--out <dir>] [--max-generated <k>] [--max-ms <ms>] [--root <dir>]',
  '       node grow/neo.mjs grow --task <task> --gen <n> [--stage <dir>] [--knowledge <dir>|none] [--max-generated <k>] [--max-ms <ms>] [--root <dir>]',
  '       node grow/neo.mjs merge --stage <dir> [--knowledge <dir>|none] [--max-ms <ms>] [--root <dir>]',
  '       node grow/neo.mjs regate [--root <dir>]',
  '       node grow/neo.mjs status [--root <dir>]',
  '       (every verb takes --era <n>)',
].join('\n');

// ---------------------------------------------------------------- small helpers
const isObj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
const round4 = (x) => Math.round(x * 1e4) / 1e4;
const first = (e) => String((e && e.message) || e).split(/\r?\n/)[0].trim();
/** The line of a child's output that names the error (node --check prints the file, the source line and a caret first). */
const errLine = (t) => { const ls = String(t ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean); return ls.find((l) => /^\w*Error\b/.test(l)) || ls[0] || ''; };
/** A digit-masked norm level 1: two prompts of one shape differ only in their digits. */
const shapeOf = (q) => norm(q, 1).replace(/\d+/g, '#');
const writeText = (f, t) => writeAtomic(f, t); // every file the engine writes: whole or not at all
const writeJson = (f, o) => writeText(f, JSON.stringify(o, null, 2) + '\n');

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
 * Rows of one task or class in the engine's shape { q, expect, answer? } (grow/neo-core.mjs rowsOf); a prompt
 * grow/retire.mjs names retired is left out.
 * @param {object[]} list rows ({ q } or { prompt }, expect, answer or reply)
 * @param {object|null} retired readRetired(root)
 * @returns {{ q: string, expect: object, answer?: string }[]}
 */
export function rowsOf(list, retired = null) { return coreRowsOf(list, retired ? (q) => isRetired(retired, q) : null); }

/**
 * The prompts a cell of a class or task must stay silent on (grow/NEO.md step 3): the dev rows of every other class
 * (judge/dev/) and task (neo/tasks/<t>/dev.jsonl), grow/curriculum.jsonl prompts of other classes, and the built-in
 * greetings, organism questions and plain arithmetic (a built-in of the same digit-masked shape as an own row is left
 * out). Never a held-out file.
 * @param {string} root the tree
 * @param {{ cls?: string|null, task?: string|null, rows?: object[] }} own the class or task and its own rows
 * @returns {string[]}
 */
export function negativesFor(root, own = {}) { return negativeGroupsFor(root, own).map((n) => n.q); }
/**
 * negativesFor with the group of each prompt, in the same order: { q, group }, group "class:<c>" for judge/dev,
 * "task:<t>" for a task's dev rows, "curriculum:<c>" for the curriculum and "builtin" for the built-ins (grow/neo-core.mjs
 * spawn reads the groups for the open guard's topic rule).
 * @param {string} root the tree
 * @param {{ cls?: string|null, task?: string|null, rows?: object[] }} own the class or task and its own rows
 * @returns {{ q: string, group: string }[]}
 */
export function negativeGroupsFor(root, { cls = null, task = null, rows = [] } = {}) {
  const ownQ = new Set(rows.map((r) => norm(r.q, 1)));
  const ownShape = new Set(rows.map((r) => shapeOf(r.q)));
  const out = [], seen = new Set();
  const add = (q, group) => { if (typeof q !== 'string' || !q.trim()) return; const k = norm(q, 1); if (!k || ownQ.has(k) || seen.has(k)) return; seen.add(k); out.push({ q, group }); };
  for (const f of dirNames(root, 'judge/dev')) if (f.endsWith('.jsonl') && f.slice(0, -6) !== cls) for (const r of rowsAt(root, 'judge/dev/' + f)) add(r && r.q, 'class:' + f.slice(0, -6));
  for (const t of dirNames(root, TASKS_DIR)) if (t !== task) for (const r of rowsAt(root, TASKS_DIR + '/' + t + '/dev.jsonl')) add(r && r.q, 'task:' + t);
  for (const r of rowsAt(root, 'grow/curriculum.jsonl')) if (r && r.class !== cls) add(r.prompt ?? r.q, 'curriculum:' + String(r.class ?? ''));
  for (const q of BUILTIN_LIST) if (!ownShape.has(shapeOf(q))) add(q, 'builtin');
  return out;
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

// ---------------------------------------------------------------- knowledge slices: the facts a module carries
/**
 * Where each know primitive's node names its pack and the pack columns it reads: [pack place, column places], the
 * places counted in the node ([name, ...args], the prompt text not an argument). null columns: every column (know.row);
 * null: no pack (know.num). A series primitive ends in its pack, key column and value column, a table primitive in its
 * pack, entity, time and value columns, so their places are read off their manifests. test/neo-know.test.mjs fails when
 * a primitive of the kernel that reads a pack is missing here.
 */
const KNOW_COLS = Object.freeze({
  'know.find': [1, [2]], 'know.has': [2, [3]], 'know.lookup': [2, [3, 4]], 'know.reverse': [2, [3, 4]], 'know.where': [2, [3, 4]], 'know.row': [2, null], 'know.num': null,
  ...Object.fromEntries(Object.keys(PRIMS).filter((n) => PRIMS[n].family === 'series' || PRIMS[n].family === 'table').map((n) => {
    const k = PRIMS[n].in.length, c = PRIMS[n].family === 'series' ? 2 : 3; // node place i holds argument i (the name is place 0)
    return [n, [k - c, Array.from({ length: c }, (_, i) => k - c + 1 + i)]];
  })),
});
/** The families whose primitives read a pack. */
const PACK_FAMILIES = new Set(['know', 'series', 'table']);
const SLICE_SEPS = Object.freeze(['|', '~', '^', '\t', '\u0001']);
const isLit = (a) => isObj(a) && Object.hasOwn(a, 'lit');
function knowNodesOf(node, out = []) {
  if (!Array.isArray(node)) return out;
  if (typeof node[0] === 'string' && Object.hasOwn(PRIMS, node[0]) && PACK_FAMILIES.has(PRIMS[node[0]].family)) out.push(node);
  for (const c of node.slice(1)) knowNodesOf(c, out);
  return out;
}
const jsonBytes = (v) => Buffer.byteLength(JSON.stringify(v));
/**
 * One column of a slice in the kernel's compact column form (the cells as they are when no form fits): the smallest of
 * the joined cells, the dictionary with an index per cell or with runs of indices (when a quarter of the cells are
 * distinct at most), and the front coded cells (text only).
 */
function sliceColumn(vals) {
  const anyNum = vals.some((v) => typeof v === 'number');
  if (anyNum && !vals.every((v) => typeof v === 'number' || v === '')) return vals; // mixed: as they are
  const strs = vals.map((v) => (typeof v === 'number' ? String(v) : v)); // String of a number parses back to the same number
  const sep = SLICE_SEPS.find((s) => !strs.some((v) => v.includes(s)));
  if (sep === undefined) return vals;
  const num = anyNum ? { num: true } : {};
  const forms = [{ s: strs.join(sep), sep, ...num }];
  const d = [...new Set(strs)];
  if (d.length * 4 <= strs.length) {
    const at = new Map(d.map((v, i) => [v, i])), runs = [];
    forms.push({ d: d.join(sep), i: strs.map((v) => at.get(v).toString(36)).join(','), sep, ...num });
    for (let k = 0; k < strs.length;) {
      let m = 1;
      while (k + m < strs.length && strs[k + m] === strs[k]) m++;
      runs.push(at.get(strs[k]).toString(36) + '*' + m.toString(36));
      k += m;
    }
    forms.push({ d: d.join(sep), r: runs.join(','), sep, ...num });
  }
  if (!anyNum) { // each cell: how many first code units it shares with the one before (35 at most, a pair never split), the rest
    let prev = '';
    const items = strs.map((v) => {
      let m = 0;
      while (m < 35 && m < v.length && m < prev.length && v[m] === prev[m]) m++;
      if (m > 0 && /[\uD800-\uDBFF]/.test(v[m - 1])) m--;
      prev = v;
      return m.toString(36) + v.slice(m);
    });
    forms.push({ f: items.join(sep), sep });
  }
  let best = forms[0], bytes = jsonBytes(best);
  for (const f of forms.slice(1)) { const b = jsonBytes(f); if (b < bytes) { best = f; bytes = b; } }
  return best;
}
const cellOk = (v) => typeof v === 'number' || (typeof v === 'string' && v.trim() !== '');
/**
 * What the kernel reads from rows in an order-dependent way (grow/neo-kernel.mjs knowFind, knowGet, knowRow): per
 * column and key, its first row and, per column, the first cell that is not empty among the rows of the key. Two row
 * orders with the same reads read the same from every primitive.
 */
function sliceReads(rows, w) {
  const out = [];
  for (let j = 0; j < w; j++) {
    const first = new Map();
    for (const r of rows) {
      const k = knowNorm(r[j]);
      if (!k) continue;
      let e = first.get(k);
      if (!e) first.set(k, (e = { row: r, vals: new Array(w).fill(null) }));
      for (let v = 0; v < w; v++) if (e.vals[v] === null && cellOk(r[v])) e.vals[v] = r[v];
    }
    out.push([...first].map(([k, e]) => JSON.stringify([k, e.row, e.vals])).sort().join('\n'));
  }
  return out.join('\n\n');
}
const SLICE_CACHE = new WeakMap();
/**
 * The columns of a slice in the row order that writes them smallest: the pack's own order, or, per column, the rows
 * sorted by it (then by the others, then by place) after a first block in the pack's order that holds, per column, the
 * rows of each key two rows share up to the first with a cell in each column. An order is taken only when the kernel
 * reads from it exactly what it reads from the pack's order (sliceReads). Cached per pack and columns.
 */
function sliceCols(p, js, clean) {
  let byPack = SLICE_CACHE.get(p);
  if (!byPack) SLICE_CACHE.set(p, (byPack = new Map()));
  const ck = JSON.stringify(js);
  if (byPack.has(ck)) return byPack.get(ck);
  const rows = p.rows.filter(Array.isArray).map((r) => js.map((j) => clean(r[j]))), w = js.length;
  const encode = (rs) => js.map((_, c) => sliceColumn(rs.map((r) => r[c])));
  let best = { n: rows.length, cols: encode(rows) }, bytes = jsonBytes(best.cols);
  if (rows.length > 1) {
    const pinned = new Set();
    for (let c = 0; c < w; c++) { // of each key two rows share: its rows up to the first with a cell in each column
      const groups = new Map();
      rows.forEach((r, i) => { const k = knowNorm(r[c]); if (!k) return; const g = groups.get(k); if (g) g.push(i); else groups.set(k, [i]); });
      for (const g of groups.values()) if (g.length > 1) for (let v = 0; v < w; v++) for (const i of g) { pinned.add(i); if (cellOk(rows[i][v])) break; }
    }
    const head = [...pinned].sort((a, b) => a - b).map((i) => rows[i]), reads = sliceReads(rows, w);
    const cmpVal = (a, b) => { const x = typeof a === 'number' ? a : String(a), y = typeof b === 'number' ? b : String(b); return typeof x === typeof y ? (x < y ? -1 : x > y ? 1 : 0) : typeof x === 'number' ? -1 : 1; };
    for (let c = 0; c < w; c++) {
      const keys = [c, ...js.map((_, k) => k).filter((k) => k !== c)];
      const rest = rows.map((r, i) => [r, i]).filter(([, i]) => !pinned.has(i));
      rest.sort((a, b) => { for (const k of keys) { const d = cmpVal(a[0][k], b[0][k]); if (d) return d; } return a[1] - b[1]; });
      const order = [...head, ...rest.map(([r]) => r)], cols = encode(order), b = jsonBytes(cols);
      if (b < bytes && sliceReads(order, w) === reads) { best = { n: order.length, cols }; bytes = b; }
    }
  }
  byPack.set(ck, best);
  return best;
}
/**
 * The knowledge a module's cells read, as slices for the kernel's knowLoad: of every pack a cell's know primitive names
 * by a literal id, every row and only the columns the cells name (every column when one reads a whole row). A cell
 * reads exactly what it reads from the whole pack (the keys and the rows are all there). A value, a column or a pack
 * that names a FORBIDDEN pattern is left out (its text empty), so the module passes the contract; the engine measures a
 * colony with its slices loaded (withKnowledge), never with the whole packs, so what it measures is what the module does.
 * @param {object[]} cells the module's cells
 * @param {object[]|null} packs knowledge packs in row form ({ id, columns, rows }), grow/know.mjs loadPacks
 * @returns {object[]} slices in the kernel's column form, sorted by id
 */
export function knowSlices(cells, packs) {
  const byId = new Map();
  for (const p of Array.isArray(packs) ? packs : []) {
    if (isObj(p) && typeof p.id === 'string' && Array.isArray(p.columns) && p.columns.every((c) => typeof c === 'string') && Array.isArray(p.rows)) byId.set(p.id, p);
  }
  const want = new Map();
  const add = (pid, cols) => { let s = want.get(pid); if (!s) want.set(pid, (s = new Set())); for (const col of cols) s.add(col); };
  for (const c of Array.isArray(cells) ? cells : []) {
    for (const n of knowNodesOf(isObj(c) ? expandMacros(c.pyramid) : null)) { // a macro reads what its body reads
      const places = Object.hasOwn(KNOW_COLS, n[0]) ? KNOW_COLS[n[0]] : null;
      if (places === null) continue;
      const [at, cols] = places, pid = isLit(n[at]) ? n[at].lit : null;
      if (typeof pid !== 'string' || !byId.has(pid)) continue;
      const p = byId.get(pid);
      if (cols === null) { add(pid, p.columns); continue; } // know.row: the whole row
      for (const j of cols) {
        const a = n[j];
        if (isLit(a)) add(pid, typeof a.lit === 'string' && p.columns.includes(a.lit) ? [a.lit] : []); else add(pid, p.columns);
      }
    }
  }
  const out = [];
  for (const id of [...want.keys()].sort()) {
    const p = byId.get(id);
    if (tripped(JSON.stringify(id))) continue;
    const cols = p.columns.filter((col) => want.get(id).has(col) && !tripped(JSON.stringify(col)));
    if (!cols.length) continue;
    const clean = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && !tripped(JSON.stringify(v)) ? v : '');
    const { n, cols: data } = sliceCols(p, cols.map((col) => p.columns.indexOf(col)), clean);
    const slice = { id, columns: cols, n, cols: data };
    if (!tripped(JSON.stringify(slice))) out.push(slice);
  }
  return out;
}

function moduleText({ id, cls, gen, lane, lines, examples, grownFrom, slices = [], macros = [] }) {
  return [
    '// ' + id + '.mjs: a NEO colony compiled by grow/neo.mjs (grow/NEO.md, "The engine"). The cells are DATA run by the',
    '// kernel of grow/neo-kernel.mjs, inlined verbatim between its markers; the first cell that answers wins.',
    'export const meta = Object.freeze(' + JSON.stringify({ id, class: cls, generation: gen, lane, grownFrom, version: 1 }) + ');',
    '',
    kernelRegion() + (macros.length ? '// the macros the cells name (neo/MACROS.json, contract c6)\nmacroLoad(' + JSON.stringify(macros) + ');\n' : '') + (slices.length ? '// the facts the cells read (grow/know.mjs packs, only the columns the cells name)\nknowLoad(' + JSON.stringify(slices) + ');\n' : '') + 'const COLONY = [',
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
/** The dev rows the first k cells answer right, FORBIDDEN-free, at most the maxExamples gene (MAX_EXAMPLES), the row of `first` first. */
function examplesOf(cells, rows, first) {
  const colony = makeColony(cells), out = [], most = CORE.genomeInForce().maxExamples;
  for (const r of rows) {
    if (out.length >= most) break;
    const ex = { q: r.q, expect: r.expect };
    if (tripped(JSON.stringify(ex)) || out.some((x) => x.q === r.q)) continue;
    const a = colony.answer(r.q);
    if (a !== null && expectOk(a, r.expect) && !REFUSAL_RE.test(a.trim())) out.push(ex);
  }
  const at = typeof first === 'string' ? out.findIndex((x) => x.q === first) : -1;
  if (at > 0) out.unshift(...out.splice(at, 1));
  return out;
}
/** The definitions of the macros a list of cells names, each once, in order of first use (a module loads exactly these). */
export function macrosOfCells(cells) {
  const out = [], seen = new Set();
  for (const c of Array.isArray(cells) ? cells : []) for (const m of CORE.macrosOf(isObj(c) ? c.pyramid : null)) if (!seen.has(m.name)) { seen.add(m.name); out.push(m); }
  return out;
}
/**
 * Compile kept cells into the text of a cell.mjs that passes grow/contract.mjs validateCell (grow/NEO.md, compile),
 * with what was left out: cells whose JSON names a FORBIDDEN pattern, and the lowest in the order when the module
 * would pass MAX_SOURCE_BYTES. The examples are the given rows the included colony answers right; none, no source.
 * With packs, the module carries the slices of them its cells read (knowSlices) and the examples are measured with
 * exactly those slices loaded.
 * @param {{ id: string, cls: string, gen: number, lane?: string, cells: object[], examples: object[], first?: string, maxBytes?: number, packs?: object[]|null }} spec
 * @returns {{ source: string|null, included: number, leftOut: number, forbidden: number, invalid: number, examples: object[], bytes: number, cells: object[], slices: object[], why?: string }}
 */
export function compileModule({ id, cls, gen, lane = LANE, cells = [], examples = [], first = null, maxBytes = MAX_SOURCE_BYTES, packs = null } = {}) {
  if (!ID_RE.test(String(id ?? ''))) throw new Fail('compile: the id ' + JSON.stringify(id) + ' does not match ' + ID_RE);
  if (typeof cls !== 'string' || !cls.trim()) throw new Fail('compile: the class is not a word');
  if (!Number.isInteger(gen) || gen < 1) throw new Fail('compile: the generation is not an integer from 1');
  const ok = [], lines = [];
  let forbidden = 0, invalid = 0;
  for (const c of Array.isArray(cells) ? cells : []) {
    if (!checkCell(c).ok) { invalid++; continue; }
    const line = cellLine(c);
    if (tripped(line) || tripped(JSON.stringify(CORE.macrosOf(c.pyramid)))) { forbidden++; continue; }
    ok.push(c); lines.push(line);
  }
  const rows = rowsOf(examples);
  const build = (k) => {
    const cs = ok.slice(0, k), slices = knowSlices(cs, packs), macros = macrosOfCells(cs);
    const exs = withKnowledge(slices, () => examplesOf(cs, rows, first));
    const source = moduleText({ id, cls, gen, lane, lines: lines.slice(0, k), examples: exs, grownFrom: exs.map((x) => x.q), slices, macros });
    return { k, exs, source, bytes: Buffer.byteLength(source), slices, macros };
  };
  let best = build(ok.length);
  if (best.bytes > maxBytes) { // the most cells that fit, by halving (the lowest in the order are left out)
    let lo = 0, hi = ok.length - 1;
    best = null;
    while (lo <= hi) { const mid = (lo + hi) >> 1, b = build(mid); if (b.bytes <= maxBytes) { best = b; lo = mid + 1; } else hi = mid - 1; }
    if (!best) best = build(0);
  }
  const base = { included: best.k, leftOut: ok.length - best.k, forbidden, invalid, examples: best.exs, bytes: best.bytes, cells: ok.slice(0, best.k), slices: best.slices, macros: best.macros };
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

// ---------------------------------------------------------------- THE GENOME and THE MACROS of a tree (contract c6)
/** Where a tree keeps the macros grow/evolve.mjs mined and a trial kept ({ macros: [...] }). */
export const MACROS_FILE = 'neo/MACROS.json';
/**
 * Put a tree's genome and macros in force for the searches of this process: neo/GENOME.json through grow/genome.mjs
 * genomeOf (a gene missing, corrupt or out of bounds is today's constant), and neo/MACROS.json through grow/neo-core.mjs
 * macroCells (a macro the kernel's type check refuses is left out), with `extra` macros after the tree's (a stage's own:
 * the first of a name wins). Every verb that spawns, compiles or merges calls it first.
 * @param {string} root the tree
 * @param {object[]} [extra] more macro definitions
 * @returns {{ rejected: string[], macros: string[] }} the genes that kept their default, the macros loaded
 */
export function engineOf(root, extra = []) {
  const g = CORE.applyGenome(genomeOf(root));
  let doc = null;
  try { const t = readData(root, MACROS_FILE); doc = t === null ? null : JSON.parse(t); } catch { doc = null; }
  const list = isObj(doc) && Array.isArray(doc.macros) ? doc.macros : [];
  const m = CORE.macroCells([...list, ...(Array.isArray(extra) ? extra : [])]);
  return { rejected: g.rejected, macros: m.loaded };
}

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
  engineOf(root);
  const { packs } = loadPacks(root);
  const { cells, stats } = spawn({ task: cls, rows, negatives: negativeGroupsFor(root, { cls, rows }), gen, parents: [], budget, packs });
  const comp = compileModule({ id, cls, gen, lane: LANE, cells, examples: rows, packs });
  const dir = path.join(out ? path.resolve(out) : path.join(root, 'work', 'grow', 'gen-' + gen, LANE), id);
  const line = {
    class: cls, generation: gen, id, generated: stats.generated, kept: stats.kept, devOk: stats.devOk, devN: stats.devN,
    cells: comp.source ? comp.included : 0, leftOut: comp.leftOut, forbidden: comp.forbidden, written: false, ms: stats.ms, cellsPerSecond: stats.cellsPerSecond, out: dir,
  };
  if (!cells.length) return { ...line, why: 'no cell was kept: nothing is written' };
  if (!comp.source) return { ...line, why: comp.why + ': nothing is written' };
  writeText(path.join(dir, 'cell.mjs'), comp.source);
  writeText(path.join(dir, 'test.mjs'), testOf(id, withKnowledge(comp.slices, () => silentFor(comp.cells))));
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

// ---------------------------------------------------------------- THE TEMPORAL GRADE: walk-forward, against persistence
// A task whose task.json says "temporal": true is graded WALK-FORWARD: its held-out rows are only the ones later than
// every dev row, and next to the colony's score stands a placebo, persistence: each held-out row answered with the
// answer of the latest row before it (the dev rows, then the held-out rows already passed). The colony is mastered only
// when it scores above that placebo (grow/neo-core.mjs isMastered reads heldout.placebo).
const TIME_TEXT = /^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/;
const TIME_IN = /(?<!\d|\d[.,])(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?(?!\d|[.,]\d)/g;
const dateValue = (y, m, d) => { const mo = Number(m || 1), dd = Number(d || 1); return mo >= 1 && mo <= 12 && dd >= 1 && dd <= 31 ? Number(y) + (mo - 1) / 12 + (dd - 1) / 372 : null; };
/**
 * A time as a number in order: a finite number as it is; a year, a year and month or a full date ("2020", "2020-03",
 * "2020-03-05") as a fractional year; any other text that is a number; else null.
 * @param {unknown} v
 * @returns {number|null}
 */
export function timeOf(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string' || !v.trim()) return null;
  const t = v.trim(), m = TIME_TEXT.exec(t);
  if (m) return dateValue(m[1], m[2], m[3]);
  const x = Number(t.replace(/,/g, ''));
  return Number.isFinite(x) ? x : null;
}
/** A row's time: its own t, else the latest year or date its prompt writes, else null. */
export function rowTime(r) {
  if (!isObj(r)) return null;
  if (r.t !== undefined) return timeOf(r.t);
  const q = typeof r.q === 'string' ? r.q : typeof r.prompt === 'string' ? r.prompt : '';
  let best = null;
  for (const m of q.slice(0, 4000).matchAll(TIME_IN)) { const x = dateValue(m[1], m[2], m[3]); if (x !== null && (best === null || x > best)) best = x; }
  return best;
}
/** The last value a row shows: its expect's equals (the exact value), else its contains joined, else its answer text. */
function lastValue(r) {
  const e = r.expect;
  if (isObj(e) && typeof e.equals === 'string') return e.equals;
  if (isObj(e) && Array.isArray(e.contains)) { const c = e.contains.filter((x) => typeof x === 'string'); if (c.length) return c.join(' '); }
  if (typeof r.answer === 'string' && r.answer.trim()) return r.answer;
  return null;
}
/**
 * The walk-forward held-out set of a temporal task and its placebo. With a time on some rows: the held-out rows whose
 * time is later than every dev row's, in time order (a row with no time is left out); with a time on no row, the file
 * order is the time (every dev row, then every held-out row). The placebo answers each kept row with the last value of
 * the latest row strictly before it.
 * @param {object[]} devRaw the dev rows as the file holds them
 * @param {object[]} heldRaw the held-out rows as the file holds them
 * @param {(got: string|null, expect: object) => boolean} [ok] the grader (judge/judge.mjs expectOk)
 * @returns {{ held: object[], placebo: { ok: number, n: number, score: number }, left: number }} held in the engine's row
 *   shape; left: the held-out rows left out
 */
export function walkForward(devRaw, heldRaw, ok = expectOk) {
  const eng = (list) => (Array.isArray(list) ? list : []).map((raw) => ({ raw, row: rowsOf([raw])[0] ?? null })).filter((x) => x.row);
  const dev = eng(devRaw), held = eng(heldRaw);
  const timed = [...dev, ...held].some((x) => rowTime(x.raw) !== null);
  let D, H;
  if (!timed) {
    D = dev.map((x, i) => ({ ...x, t: i }));
    H = held.map((x, i) => ({ ...x, t: dev.length + i }));
  } else {
    D = dev.map((x) => ({ ...x, t: rowTime(x.raw) })).filter((x) => x.t !== null);
    const last = D.reduce((m, x) => Math.max(m, x.t), -Infinity);
    H = held.map((x) => ({ ...x, t: rowTime(x.raw) })).filter((x) => x.t !== null && x.t > last);
  }
  const byTime = (a, b) => a.t - b.t;
  H.sort(byTime);
  const all = [...D, ...H].sort(byTime); // stable: among equal times the file order, dev rows first
  let pok = 0;
  for (const x of H) {
    let prev = null;
    for (const y of all) { if (y.t >= x.t) break; prev = y; }
    const guess = prev ? lastValue(prev.row) : null;
    if (guess !== null && ok(guess, x.row.expect)) pok++;
  }
  return { held: H.map((x) => x.row), placebo: score(pok, H.length), left: held.length - H.length };
}
/** Whether a task's task.json marks it temporal ("temporal": true); an unreadable task.json is not. */
export function isTemporal(root, task) {
  let doc = null;
  try { const t = readData(root, TASKS_DIR + '/' + task + '/task.json'); doc = t === null ? null : JSON.parse(t); } catch { doc = null; }
  return isObj(doc) && doc.temporal === true;
}
/** The held-out rows a task is graded on: every row, or for a temporal task the walk-forward rows and their placebo. */
function heldOf(root, task, heldText) {
  const heldRaw = parseJsonl(heldText);
  if (!isTemporal(root, task)) return { held: rowsOf(heldRaw), placebo: null };
  const devText = readData(root, TASKS_DIR + '/' + task + '/dev.jsonl');
  const w = walkForward(devText === null ? [] : parseJsonl(devText), heldRaw);
  return { held: w.held, placebo: w.placebo };
}
/**
 * The atomic read-modify-write of the ledger's generated total and, given a task and a cursor, THE CURSOR of the task:
 * set on the task's latest entry, where its next grow continues (every other key is kept as it is).
 */
function addGenerated(root, k, { task = null, cursor = null } = {}) {
  const f = path.join(root, ...LEDGER.split('/'));
  const doc = JSON.parse(fs.readFileSync(f, 'utf8'));
  doc.generated = (Number.isFinite(doc.generated) ? doc.generated : 0) + k;
  if (task !== null && isObj(cursor) && Array.isArray(doc.tasks)) {
    const at = doc.tasks.findLastIndex((r) => isObj(r) && r.task === task);
    if (at >= 0) doc.tasks[at] = { ...doc.tasks[at], cursor };
  }
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
/** The task's present colony row in grown/index.json, or null (no row, or no readable index). */
function presentOf(root, task) {
  let index = null;
  try { index = readIndex(root); } catch { return null; }
  return index.cells.find((r) => isNeoRow(r) && taskOfRow(r) === task) || null;
}
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
  return () => { for (const { f, data } of saved) { try { if (data === null) fs.rmSync(f, { force: true }); else writeAtomic(f, data); } catch { /* best effort, the next file still goes back */ } } };
}
const ENGINE_FILE = fileURLToPath(import.meta.url);
const readText = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null);
/** Write a file whole or not at all (a temporary sibling renamed over it). */
function writeAtomic(f, text) {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const tmp = f + '.' + process.pid + '.' + Date.now().toString(36) + '.tmp';
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, f);
}
/** The sha256 of grown/index.json as it stands (null when there is none): a stage names the index it was computed on. */
const indexSha = (root) => { const t = readText(path.join(root, 'grown', 'index.json')); return t === null ? null : shaText(t); };
/** The ledger's latest entry of a task, or a throw: only an opened task grows. */
function frozenOf(root, task) {
  const frozen = readLedger(root).tasks.filter((r) => r.task === task).at(-1);
  if (!frozen) throw new Fail('the task ' + task + ' is not in ' + LEDGER + ': only an opened task grows');
  return frozen;
}
/** The task's dev rows (retired prompts left out, one per norm level 1 prompt), or the why when the dev set changed. */
function devOf(root, task, frozen) {
  const devText = readData(root, TASKS_DIR + '/' + task + '/dev.jsonl');
  if (devText === null || shaText(devText) !== frozen.devSha) return { why: "the task's dev set changed since it was opened" };
  return { rows: uniqQ(rowsOf(parseJsonl(devText), readRetired(root))), why: null };
}
/** The task's colony.json: its valid cells (the parents of the next spawn) and the keys of the stages merged into it. */
function colonyOf(root, task) {
  const text = readData(root, TASKS_DIR + '/' + task + '/colony.json');
  const doc = text ? JSON.parse(text) : null;
  return {
    cells: doc ? (doc.cells || []).filter((c) => isObj(c) && checkCell(c).ok) : [],
    stages: doc && Array.isArray(doc.stages) ? doc.stages.filter((s) => typeof s === 'string') : [],
  };
}
/** colony.json after a grow: the new kept cells, then every older cell not among them (the population is kept forever). */
function writeColony(root, { task, gen, at, stats, cells, old, stages }) {
  const have = new Set(cells.map((c) => c.id));
  writeJson(path.join(root, ...TASKS_DIR.split('/'), task, 'colony.json'), { task, generation: gen, kernel: KERNEL_VERSION, at, stats, cells: [...cells, ...old.filter((c) => !have.has(c.id))], ...(stages.length ? { stages } : {}) });
}
/** The organism's baseline on held-out rows: { ok, n, score } of judge/baseline.mjs runOrganism (or the given organism). */
const baselineFn = (root, organism, knowledge) => async (held) => {
  const org = organism || (await organismOf(root, knowledge));
  const res = await org(held.map((r) => ({ q: r.q, expect: r.expect })));
  const got = Array.isArray(res) ? res : res && Array.isArray(res.rows) ? res.rows : [];
  return score(held.filter((r, i) => { const g = got[i] && got[i].q === r.q ? got[i] : got.find((x) => x && x.q === r.q); return expectOk(g ? g.got : null, r.expect); }).length, held.length);
};
/**
 * The baseline measured by a child process (`node grow/neo.mjs baseline`): a merge after a promote needs the organism
 * as it is now, and this process already holds grown/index.mjs as it was when it was first imported.
 */
const childBaseline = (root, task, knowledge) => async () => {
  const args = [ENGINE_FILE, 'baseline', '--task', task, '--root', root, ...(knowledge ? ['--knowledge', knowledge] : [])];
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
  let j = null;
  try { j = JSON.parse(String(r.stdout || '').trim().split(/\r?\n/).at(-1)); } catch { j = null; }
  if (r.status !== 0 || !isObj(j) || !isObj(j.baseline)) throw new Fail('the baseline of ' + task + ' could not be measured: ' + (isObj(j) && j.error ? j.error : errLine(r.stderr) || 'exit ' + r.status));
  return j.baseline;
};
/** A loader of grown/ modules, each file imported once per loader (fresh: a query string defeats the module cache). Null: no module. */
function loaderOf(root) {
  const mods = new Map(), stamp = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  return async (r) => {
    const f = r && r.file ? path.join(root, 'grown', ...String(r.file).split('/')) : null;
    if (!f) return null;
    if (!mods.has(f)) {
      let m = null;
      if (fs.existsSync(f)) { try { m = await import(pathToFileURL(f).href + '?v=' + stamp); } catch { m = null; } }
      mods.set(f, m);
    }
    return mods.get(f);
  };
}
/** Whether a loaded cell takes q (its can, and a serving colony's templates; null templates: a locked cell, never gated). */
const takes = (m, templates, q) => { try { return (templates === null || fitsTemplates(templates, q)) && typeof m.can === 'function' && m.can(q) === true; } catch { return false; } };
/**
 * Which earlier cell of grown/ answers q first (its id), or null: every locked row, and every tier "neo" row that serves
 * only on a prompt that fits its templates (a silent colony answers nothing, so it shadows nothing).
 */
async function shadowOf(root, rows, load = loaderOf(root)) {
  const earlier = [];
  for (const r of rows) {
    if (isNeoRow(r) && !rowServes(r)) continue;
    const m = await load(r);
    if (m) earlier.push({ id: r.id, m, templates: isNeoRow(r) ? r.templates : null });
  }
  return (q) => { const e = earlier.find(({ m, templates }) => takes(m, templates, q)); return e ? e.id : null; };
}
/** Why a colony does not serve, in words. */
const notServing = (heldout, templates) => (!isMastered(heldout) ? 'not mastered: held-out ' + (heldout ? heldout.ok + ' of ' + heldout.n + (isObj(heldout.placebo) ? ', placebo ' + heldout.placebo.ok + ' of ' + heldout.placebo.n : '') : 'none') : !templates.length ? 'no template: the dev prompts share no question shape' : null);

/**
 * SELECT of grow/NEO.md for a task's kept cells, and the PROMOTE plan when the colony wins: compile, the held-out score
 * measured BEFORE any pruning, the control prune, the organism's baseline, the present colony, the held-out prune, the
 * first example no earlier cell answers, and the gate of the new row (serve only when mastered and that example fits a
 * template of the task). Reads, never writes.
 * @returns {Promise<{ fail: object|null, sel: object|null, pruned: number, plan: object|null, out: object|null }>}
 */
async function selectOf(root, { task, gen, frozen, rows, negs, cells, ran, baselineOf, now, packs = null, deadline = null }) {
  const late = () => deadline !== null && Date.now() > deadline; // grow --max-ms: past it, SELECT stops where it is
  const tdir = TASKS_DIR + '/' + task;
  const cellsDir = path.join(root, 'grown', 'cells');
  let k = 1;
  while (fs.existsSync(path.join(cellsDir, armId(task, LANE, gen, k) + '.mjs'))) k++;
  const id = armId(task, LANE, gen, k);
  const comp = compileModule({ id, cls: task, gen, lane: LANE, cells, examples: rows, packs });
  if (!comp.source) return { fail: { ...ran, why: [comp.why] } };
  if (late()) return { fail: { ...ran, cells: comp.included, why: [DEADLINE_WHY + ' (after the compile)'], deadline: true } };
  // SELECT: the frozen held-out set, the control prompts, the organism, the present colony
  const heldText = readSelect(root, tdir + '/heldout.jsonl');
  if (heldText === null || shaText(heldText) !== frozen.heldoutSha) return { fail: { ...ran, cells: comp.included, why: ["the task's held-out set changed since it was opened"] } };
  const { held, placebo } = heldOf(root, task, heldText); // a temporal task: the walk-forward rows and their placebo
  const controlText = readSelect(root, 'judge/control.jsonl');
  const controlQ = controlText === null ? [] : parseJsonl(controlText).map((r) => (isObj(r) && typeof r.q === 'string' ? r.q : null)).filter(Boolean);
  // every colony is measured with the slices its module carries loaded, never across an await (the kernel holds one set)
  const whole = makeColony(comp.cells); // grow/NEO.md: the held-out score is measured BEFORE any pruning
  const heldout = withKnowledge(comp.slices, () => score(held.filter((r) => expectOk(whole.answer(r.q), r.expect)).length, held.length));
  if (placebo) heldout.placebo = placebo;
  const ctl = withKnowledge(comp.slices, () => prune(comp.cells, [...controlQ, ...negs], () => true));
  if (late()) return { fail: { ...ran, cells: comp.included, heldout, control: ctl.removed, why: [DEADLINE_WHY + ' (before the baseline)'], deadline: true } };
  const baseline = await baselineOf(held);
  const index = readIndex(root);
  const present = index.cells.find((r) => isNeoRow(r) && taskOfRow(r) === task) || null;
  const why = [];
  if (!(heldout.score > baseline.score)) why.push('the colony does not score above the organism');
  if (present && !(heldout.score > (present.heldout && Number.isFinite(present.heldout.score) ? present.heldout.score : -1))) why.push('the present colony scores as high');
  const sel = { ...ran, cells: comp.included, leftOut: comp.leftOut, forbidden: comp.forbidden, heldout, ...(placebo ? { placebo } : {}), baseline, control: ctl.removed };
  if (why.length) return { fail: { ...sel, why } };
  if (late()) return { fail: { ...sel, why: [DEADLINE_WHY + ' (before the prune)'], deadline: true } };
  // PROMOTE: cell by cell, a cell that answered a held-out row wrong is removed; the first example no earlier cell answers
  const kept = withKnowledge(comp.slices, () => prune(ctl.cells, held.map((r) => r.q), (q, a) => !expectOk(a, held.find((r) => r.q === q).expect)));
  const shadowed = await shadowOf(root, [...index.cells.filter((r) => !isNeoRow(r)), ...index.cells.filter((r) => isNeoRow(r) && taskOfRow(r) !== task)]);
  const pre = compileModule({ id, cls: task, gen, lane: LANE, cells: kept.cells, examples: rows, packs });
  if (!pre.source) return { fail: { ...sel, pruned: kept.removed, why: [pre.why] } };
  // THE GATE (contract c2): the row serves only when mastered, and then its first example fits a template of the task
  const templates = deriveTemplates(rows.map((r) => r.q));
  let gate = notServing(heldout, templates), free = null;
  if (gate === null) {
    free = pre.examples.find((x) => fitsTemplates(templates, x.q) && !shadowed(x.q)) || null;
    if (!free) gate = 'every example that fits a template is answered first by an earlier cell';
  }
  if (!free) free = pre.examples.find((x) => !shadowed(x.q)) || null;
  if (!free) return { fail: { ...sel, pruned: kept.removed, why: ['every example is answered first by an earlier cell'] } };
  if (late()) return { fail: { ...sel, pruned: kept.removed, why: [DEADLINE_WHY + ' (before the last compile)'], deadline: true } };
  const fin = compileModule({ id, cls: task, gen, lane: LANE, cells: kept.cells, examples: rows, first: free.q, packs });
  const row = {
    id, class: task, task, generation: gen, lane: LANE, tier: LANE, file: 'cells/' + id + '.mjs', cells: fin.included, generated: ran.generated,
    heldout: { score: heldout.score, n: heldout.n, ok: heldout.ok, ...(placebo ? { placebo } : {}) }, promotedAt: now().toISOString(), serve: gate === null, templates, ...(gate === null ? {} : { gate }),
    ...(fin.cells.some(usesKnow) ? { know: true } : {}), // a knowledge-backed colony: a cell reads a pack's facts
  };
  return { fail: null, sel, pruned: kept.removed, plan: { id, source: fin.source, row }, out: { ...sel, id, cells: fin.included, pruned: kept.removed, serve: row.serve } };
}

/**
 * PROMOTE a plan into grown/: the module, the task's one index row (its present colony and file replaced; locked rows
 * first, then the other colonies, then this one) and grown/index.mjs, then the proof: node --check, the module's
 * contract, and every cell answering its own first example through grownAnswer (a silent colony answering nothing).
 * Any failure puts grown/ back byte for byte.
 * @returns {Promise<{ ok: boolean, why?: string, replaced?: string|null }>}
 */
async function promotePlan(root, plan, render) {
  const index = readIndex(root);
  const task = plan.row.task;
  const present = index.cells.find((r) => isNeoRow(r) && taskOfRow(r) === task) || null;
  const others = [...index.cells.filter((r) => !isNeoRow(r)), ...index.cells.filter((r) => isNeoRow(r) && taskOfRow(r) !== task)];
  const cellsDir = path.join(root, 'grown', 'cells');
  const file = path.join(cellsDir, plan.id + '.mjs'), indexPath = path.join(root, 'grown', 'index.json'), mjsPath = path.join(root, 'grown', 'index.mjs');
  const oldFile = present && present.file ? path.join(root, 'grown', ...String(present.file).split('/')) : null;
  const putBack = snapshot([indexPath, mjsPath, file, ...(oldFile && oldFile !== file ? [oldFile] : [])]);
  try {
    fs.mkdirSync(cellsDir, { recursive: true });
    // every file of grown/ is written whole or not at all (a temporary sibling renamed over it); the module never over an existing one
    if (fs.existsSync(file)) throw new Fail('grown/cells/' + plan.id + '.mjs is already on disk');
    writeAtomic(file, plan.source);
    if (oldFile && oldFile !== file && fs.existsSync(oldFile)) fs.rmSync(oldFile);
    const next = { ...index, cells: [...others, plan.row] };
    writeAtomic(indexPath, JSON.stringify(next, null, 2) + '\n');
    writeAtomic(mjsPath, render(next));
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
    return { ok: false, why: 'the proof failed: ' + first(e) + ' (grown/ is as it was)' };
  }
  return { ok: true, replaced: present ? present.id : null };
}

/**
 * grow --task of grow/NEO.md: spawn the task's cells from neo/tasks/<task>/dev.jsonl with its present colony as
 * parents, write colony.json, add the generated count to the ledger, compile, SELECT on the task's held-out set
 * against the organism and the present colony, and PROMOTE into grown/ when it wins (proved, else put back byte for
 * byte). A completed grow resolves with its line, promoted or not. With `stage` (a directory) it writes ONE file,
 * <stage>/<task>.json (the result, the colony module text, the ledger delta and the kept cells), and changes nothing
 * else: `merge --stage` applies it later with the same proofs.
 * @param {{ root?: string, task: string, gen: number, organism?: Function|null, budget?: object, render?: Function, knowledge?: string, now?: Function, stage?: string|null }} opts
 * @returns {Promise<object>} the JSON line
 */
export async function growTask({ root = DEFAULT_ROOT, task, gen, organism = null, budget = {}, render = renderIndexMjs, knowledge, now = () => new Date(), stage = null } = {}) {
  const t0 = Date.now();
  if (!TASK_RE.test(String(task ?? ''))) throw new Fail('usage: --task names a task (' + TASK_RE + ')\n' + USAGE, 2);
  if (!Number.isInteger(gen) || gen < 1) throw new Fail('usage: --gen is an integer from 1\n' + USAGE, 2);
  // THE DEADLINE: with --max-ms the whole grow ends by it. The search is told GROW_SPAWN_SHARE of what is left; past the
  // deadline the grow keeps what it has (the stage file, or colony.json and the ledger) and says so (deadline: true)
  const deadline = budget && Number.isInteger(budget.maxMs) && budget.maxMs > 0 ? t0 + budget.maxMs : null;
  engineOf(root);
  const frozen = frozenOf(root, task);
  const line = (o) => ({ task, generation: gen, generated: 0, kept: 0, cells: 0, heldout: null, baseline: null, promoted: false, why: [], pruned: 0, control: 0, ...o, ms: Date.now() - t0 });
  // a mastered task is skipped: its colony answers every held-out row; the budget goes to the tasks still unmastered
  const present = presentOf(root, task);
  if (present && isMastered(present.heldout)) return line({ skipped: true, why: ['mastered: skipped (' + present.id + ' answers ' + present.heldout.ok + ' of ' + present.heldout.n + ' held-out rows)'] });
  const dev = devOf(root, task, frozen);
  if (dev.why) return line({ why: [dev.why] });
  const rows = dev.rows;
  const col = colonyOf(root, task);
  const grouped = negativeGroupsFor(root, { task, rows }), negs = grouped.map((n) => n.q);
  const indexAt = stage ? indexSha(root) : null;
  // knowledge (contract c5): the packs grow/know.mjs shelved; a task born from a source starts from that source's pack
  const { packs } = loadPacks(root);
  const source = typeof frozen.by === 'string' && frozen.by.startsWith('absorb:') ? frozen.by.slice('absorb:'.length) : null;
  // THE CURSOR: the search continues where the task's last grow stopped
  const told = deadline === null ? budget : { ...budget, maxMs: Math.max(1, Math.floor((deadline - Date.now()) * GROW_SPAWN_SHARE)) };
  const { cells, stats } = spawn({ task, rows, negatives: grouped, gen, parents: col.cells, budget: told, packs, source, cursor: isObj(frozen.cursor) ? frozen.cursor : null });
  const ran = { generated: stats.generated, kept: stats.kept, cellsPerSecond: stats.cellsPerSecond };
  const known = { packs: stats.packs, know: stats.know, round: stats.cursor.round };
  const late = () => deadline !== null && Date.now() > deadline;
  const lateFail = (where) => ({ fail: { ...ran, why: [DEADLINE_WHY + ' (' + where + ')'], deadline: true } });
  if (stage) {
    const s = late() ? lateFail('after the search') : await selectOf(root, { task, gen, frozen, rows, negs, cells, ran, baselineOf: baselineFn(root, organism, knowledge), now, packs, deadline });
    const result = line({ ...(s.fail || s.out), ...known, promotable: !!s.plan });
    const file = path.join(path.resolve(stage), task + '.json');
    const macros = macrosOfCells(cells);
    const doc = {
      kind: STAGE_KIND, version: STAGE_VERSION, task, generation: gen, at: now().toISOString(), kernel: KERNEL_VERSION,
      shas: { dev: frozen.devSha, heldout: frozen.heldoutSha }, index: indexAt, ledger: { generated: stats.generated, cursor: stats.cursor },
      stats, result, module: s.plan ? { id: s.plan.id, source: s.plan.source } : null, cells, ...(macros.length ? { macros } : {}),
    };
    writeAtomic(file, JSON.stringify(doc) + '\n');
    return { ...result, staged: file, ms: Date.now() - t0 };
  }
  ran.ledgerGenerated = addGenerated(root, stats.generated, { task, cursor: stats.cursor });
  writeColony(root, { task, gen, at: now().toISOString(), stats, cells, old: col.cells, stages: col.stages });
  const s = late() ? lateFail('after the search') : await selectOf(root, { task, gen, frozen, rows, negs, cells, ran: { ...ran, ...known }, baselineOf: baselineFn(root, organism, knowledge), now, packs, deadline });
  if (!s.plan) return line({ ...s.fail, ...known });
  if (late()) return line({ ...s.sel, ...known, pruned: s.pruned, why: [DEADLINE_WHY + ' (before the promote)'], deadline: true });
  const p = await promotePlan(root, s.plan, render);
  if (!p.ok) return line({ ...s.sel, pruned: s.pruned, why: [p.why] });
  return line({ ...s.out, promoted: true, replaced: p.replaced });
}

// ---------------------------------------------------------------- STAGE: grow --stage writes one file, merge applies it
/** The kind and version of a stage file (grow --task <t> --gen <g> --stage <dir> writes <dir>/<t>.json). */
export const STAGE_KIND = 'neo-stage';
export const STAGE_VERSION = 1;
/**
 * What is wrong with a stage document, or null: its kind and version, the task (and the file named after it), the
 * generation, the shas, the ledger delta, every cell valid by the kernel and of the task, the module.
 * @param {object} doc the parsed file
 * @param {string} name the file name
 * @returns {string|null}
 */
export function stageErrors(doc, name) {
  if (!isObj(doc) || doc.kind !== STAGE_KIND || doc.version !== STAGE_VERSION) return 'not a stage file (kind ' + STAGE_KIND + ', version ' + STAGE_VERSION + ')';
  if (typeof doc.task !== 'string' || !TASK_RE.test(doc.task)) return 'the stage names no task';
  if (name !== doc.task + '.json') return 'the file is named ' + name + ', its task is ' + doc.task;
  if (!Number.isInteger(doc.generation) || doc.generation < 1) return 'the generation is not an integer from 1';
  if (!isObj(doc.shas) || typeof doc.shas.dev !== 'string' || typeof doc.shas.heldout !== 'string') return 'the stage carries no dev and held-out shas';
  if (!isObj(doc.ledger) || !Number.isInteger(doc.ledger.generated) || doc.ledger.generated < 0) return 'the ledger delta is not a count';
  if (doc.ledger.cursor !== undefined && !(isObj(doc.ledger.cursor) && Number.isInteger(doc.ledger.cursor.round) && doc.ledger.cursor.round >= 0)) return 'the ledger cursor is not a cursor { round, .. }';
  if (!isObj(doc.stats) || !isObj(doc.result)) return 'the stage carries no stats or result';
  if (!Array.isArray(doc.cells)) return 'the stage carries no cells';
  for (const c of doc.cells) if (!isObj(c) || c.task !== doc.task || !checkCell(c).ok) return 'a staged cell is not a valid cell of ' + doc.task;
  if (doc.module !== null && !(isObj(doc.module) && typeof doc.module.id === 'string' && typeof doc.module.source === 'string')) return 'the module is neither null nor { id, source }';
  return null;
}
/**
 * Merge ONE stage file with the same proofs as a direct grow: the shape, the ledger's shas (the task not re-opened),
 * the dev and held-out files unchanged, the held-out score its cells give equal to the staged one, the module its cells
 * compile to equal to the staged one when nothing in grown/ moved, SELECT again against the organism as it is now and
 * the present colony, and the PROMOTE proof. Promote first: a failed proof applies nothing. Then colony.json (the cells,
 * the stage's key) and the ledger delta. A stage whose key colony.json already holds is skipped: merging twice is one merge.
 * @returns {Promise<{ task: string|null, refused?: string, skipped?: boolean, promoted?: boolean, id?: string|null }>}
 */
async function mergeOne(root, file, { organism, knowledge, render, now }) {
  const name = path.basename(file);
  let doc = null, task = null;
  try {
    const text = fs.readFileSync(file, 'utf8'), key = shaText(text);
    try { doc = JSON.parse(text); } catch { return { task: null, refused: 'not JSON' }; }
    task = isObj(doc) && typeof doc.task === 'string' ? doc.task : null;
    engineOf(root, isObj(doc) && Array.isArray(doc.macros) ? doc.macros : []); // the tree's genome and macros, then the stage's own
    const bad = stageErrors(doc, name);
    if (bad) return { task, refused: bad };
    const gen = doc.generation;
    const frozen = readLedger(root).tasks.filter((r) => r.task === task).at(-1);
    if (!frozen) return { task, refused: 'the task ' + task + ' is not in ' + LEDGER };
    if (frozen.devSha !== doc.shas.dev || frozen.heldoutSha !== doc.shas.heldout) return { task, refused: 'the task was opened again since it was staged (the ledger shas differ)' };
    const col = colonyOf(root, task);
    if (col.stages.includes(key)) return { task, skipped: true };
    const dev = devOf(root, task, frozen);
    if (dev.why) return { task, refused: dev.why };
    const negs = negativesFor(root, { task, rows: dev.rows });
    const ran = { generated: doc.ledger.generated, kept: doc.cells.length, cellsPerSecond: doc.stats.cellsPerSecond };
    const same = indexSha(root) === doc.index;
    const baselineOf = organism ? baselineFn(root, organism, knowledge) : childBaseline(root, task, knowledge);
    const s = await selectOf(root, { task, gen, frozen, rows: dev.rows, negs, cells: doc.cells, ran, baselineOf, now, packs: loadPacks(root).packs });
    const heldNow = s.sel ? s.sel.heldout : s.fail && s.fail.heldout ? s.fail.heldout : null;
    // a stage its deadline stopped before the held-out measure claims no score: the merge's own SELECT decides it
    const unclaimed = doc.result.deadline === true && (doc.result.heldout ?? null) === null;
    if (!unclaimed && JSON.stringify(heldNow ?? null) !== JSON.stringify(doc.result.heldout ?? null)) return { task, refused: 'the staged held-out score is not what its cells score (' + JSON.stringify(doc.result.heldout ?? null) + ' staged, ' + JSON.stringify(heldNow ?? null) + ' now)' };
    if (same && s.plan && doc.module && doc.module.id === s.plan.id && doc.module.source !== s.plan.source) return { task, refused: 'the staged module is not what its cells compile to' };
    let promoted = false;
    if (s.plan) {
      const p = await promotePlan(root, s.plan, render);
      if (!p.ok) return { task, refused: p.why };
      promoted = true;
    }
    addGenerated(root, doc.ledger.generated, { task, cursor: isObj(doc.ledger.cursor) ? doc.ledger.cursor : null });
    writeColony(root, { task, gen, at: now().toISOString(), stats: doc.stats, cells: doc.cells, old: col.cells, stages: [...col.stages, key] });
    return { task, promoted, id: promoted ? s.plan.id : null, why: s.fail ? s.fail.why : [] };
  } catch (e) {
    return { task, refused: first(e) };
  }
}
/**
 * merge --stage <dir>: apply every <dir>/*.json one at a time, in name order (mergeOne), then regate. A file that fails
 * a proof is refused and named, never merged; merging the same stage twice changes nothing the second time.
 * @param {{ root?: string, dir: string, organism?: Function|null, knowledge?: string, render?: Function, now?: Function, maxMs?: number }} opts
 * @returns {Promise<object>} the JSON line
 */
export async function mergeStage({ root = DEFAULT_ROOT, dir, organism = null, knowledge, render = renderIndexMjs, now = () => new Date(), maxMs = null } = {}) {
  const t0 = Date.now();
  if (typeof dir !== 'string' || !dir) throw new Fail('usage: merge takes --stage <dir>\n' + USAGE, 2);
  const sdir = path.resolve(dir);
  if (!fs.existsSync(sdir) || !fs.statSync(sdir).isDirectory()) throw new Fail('no stage directory at ' + sdir);
  const files = fs.readdirSync(sdir).filter((f) => f.endsWith('.json')).sort();
  const out = { files: files.length, merged: [], promoted: [], refused: [], skipped: [], left: [] };
  for (const f of files) {
    if (maxMs && Date.now() - t0 > maxMs) { out.left.push(f); continue; }
    const r = await mergeOne(root, path.join(sdir, f), { organism, knowledge, render, now });
    if (r.refused) out.refused.push({ file: f, task: r.task, why: r.refused });
    else if (r.skipped) out.skipped.push(f);
    else { out.merged.push(r.task); if (r.promoted) out.promoted.push(r.id); }
  }
  let gate;
  try { const g = await regate({ root, render }); gate = { serving: g.serving, changed: g.changed, flipped: g.flipped }; } catch (e) { gate = { error: first(e) }; }
  return { ...out, regate: gate, ms: Date.now() - t0 };
}
/**
 * baseline --task: the organism's score on the task's frozen held-out set, { task, baseline: { ok, n, score } } (the
 * child a merge measures with, so the organism it grades is the one grown/ holds now).
 */
export async function baselineOfTask({ root = DEFAULT_ROOT, task, organism = null, knowledge } = {}) {
  if (!TASK_RE.test(String(task ?? ''))) throw new Fail('usage: --task names a task (' + TASK_RE + ')\n' + USAGE, 2);
  const frozen = frozenOf(root, task);
  const heldText = readSelect(root, TASKS_DIR + '/' + task + '/heldout.jsonl');
  if (heldText === null || shaText(heldText) !== frozen.heldoutSha) throw new Fail("the task's held-out set changed since it was opened");
  return { task, baseline: await baselineFn(root, organism, knowledge)(heldOf(root, task, heldText).held) };
}

// ---------------------------------------------------------------- REGATE: serve only while mastered (contract c2)
/**
 * The gate of one tier "neo" row: { serve, templates, why }. It serves only when its task is in the ledger with its dev
 * and held-out files as they were opened, it is mastered by the engine's rule (isMastered), its templates are derived
 * from its dev prompts (retired ones left out), its module loads, and its first example fits a template and is answered.
 */
async function gateOfRow(root, row, led, retired, load) {
  const task = taskOfRow(row);
  if (!task || !TASK_RE.test(task)) return { serve: false, templates: [], why: 'the row names no task' };
  const frozen = led.tasks.filter((t) => t.task === task).at(-1);
  if (!frozen) return { serve: false, templates: [], why: 'the task is not in ' + LEDGER };
  const devText = readData(root, TASKS_DIR + '/' + task + '/dev.jsonl');
  if (devText === null || shaText(devText) !== frozen.devSha) return { serve: false, templates: [], why: "the task's dev set changed since it was opened" };
  const templates = deriveTemplates(rowsOf(parseJsonl(devText), retired).map((r) => r.q));
  const heldText = readSelect(root, TASKS_DIR + '/' + task + '/heldout.jsonl');
  if (heldText === null || shaText(heldText) !== frozen.heldoutSha) return { serve: false, templates, why: "the task's held-out set changed since it was opened" };
  const no = notServing(row.heldout, templates);
  if (no) return { serve: false, templates, why: no };
  if (isTemporal(root, task) && !(isObj(row.heldout) && isObj(row.heldout.placebo))) return { serve: false, templates, why: 'not mastered: a temporal task graded without its placebo' };
  const f = path.join(root, 'grown', ...String(row.file || '').split('/'));
  if (!row.file || !fs.existsSync(f)) return { serve: false, templates, why: 'its module is not on disk' };
  const m = await load(row);
  if (!m) return { serve: false, templates, why: 'its module does not load' };
  const q = Array.isArray(m.examples) && isObj(m.examples[0]) ? m.examples[0].q : null;
  if (typeof q !== 'string' || !fitsTemplates(templates, q)) return { serve: false, templates, why: 'its first example fits none of its templates' };
  let a = null;
  try { a = m.can(q) === true ? m.answer(q) : null; } catch { a = null; }
  if (typeof a !== 'string' || !a.trim()) return { serve: false, templates, why: 'it does not answer its own first example' };
  return { serve: true, templates, why: null, q, m };
}
/** A row with its gate written in: serve, templates, and gate (the why) only when it does not serve. */
function gated(row, g) {
  const out = { ...row, serve: g.serve, templates: g.templates, gate: g.why };
  if (g.why === null) delete out.gate;
  return out;
}
/**
 * regate (contract c2): recompute every tier "neo" row's gate, put every locked row first (a locked cell is never
 * shadowed), make silent a serving colony whose first example an earlier cell takes, and rewrite grown/index.json and
 * grown/index.mjs only when their text changes, as a transaction with the promote proof (node --check, every row in
 * place, every serving colony answering its own first example through grownAnswer; a serving row that does not is
 * made silent and the proof runs again; any other failure puts grown/ back).
 * @param {{ root?: string, render?: Function }} opts
 * @returns {Promise<{ colonies: number, mastered: number, serving: number, silent: number, served: string[], flipped: string[], templates: number, changed: boolean, lockedBad: string[], ms: number }>}
 */
export async function regate({ root = DEFAULT_ROOT, render = renderIndexMjs } = {}) {
  const t0 = Date.now();
  const indexPath = path.join(root, 'grown', 'index.json'), mjsPath = path.join(root, 'grown', 'index.mjs');
  const index = readIndex(root);
  const led = readLedger(root), retired = readRetired(root), load = loaderOf(root);
  const locked = index.cells.filter((r) => !isNeoRow(r)), before = index.cells.filter(isNeoRow);
  // every locked cell first, then each colony in order: a serving one whose first example an earlier cell takes goes silent
  const earlier = [];
  for (const r of locked) { const m = await load(r); if (m) earlier.push({ id: r.id, m, templates: null }); }
  let neo = [];
  for (const r of before) {
    const g = await gateOfRow(root, r, led, retired, load);
    if (g.serve) {
      const hit = earlier.find(({ m, templates }) => takes(m, templates, g.q));
      if (hit) { neo.push(gated(r, { serve: false, templates: g.templates, why: 'shadowed: its first example is answered first by ' + hit.id })); continue; }
      earlier.push({ id: r.id, m: g.m, templates: g.templates });
    }
    neo.push(gated(r, g));
  }
  const origJson = readText(indexPath), origMjs = readText(mjsPath);
  const result = (changed, lockedBad) => {
    const was = new Map(before.map((r) => [r.id, rowServes(r)]));
    return {
      colonies: neo.length, mastered: neo.filter((r) => isMastered(r.heldout)).length, serving: neo.filter(rowServes).length,
      silent: neo.filter((r) => !rowServes(r)).length, served: neo.filter(rowServes).map((r) => r.id),
      flipped: neo.filter((r) => was.get(r.id) !== rowServes(r)).map((r) => r.id),
      templates: neo.reduce((s, r) => s + (Array.isArray(r.templates) ? r.templates.length : 0), 0), changed, lockedBad, ms: Date.now() - t0,
    };
  };
  for (let attempt = 0; ; attempt++) {
    const next = { ...index, cells: [...locked, ...neo] };
    const jsonText = JSON.stringify(next, null, 2) + '\n', mjsText = render(next);
    if (jsonText === origJson && mjsText === origMjs) return result(false, []);
    const putBack = snapshot([indexPath, mjsPath]);
    let flip = [];
    try {
      writeAtomic(indexPath, jsonText);
      writeAtomic(mjsPath, mjsText);
      const chk = spawnSync(process.execPath, ['--check', mjsPath], { encoding: 'utf8', windowsHide: true });
      if (chk.status !== 0) throw new Fail('node --check grown/index.mjs failed: ' + errLine(chk.stderr || chk.stdout));
      const { mod: idx, answers } = await answersOf(mjsPath);
      if (idx.GROWN.length !== next.cells.length) throw new Fail('grown/index.mjs exports ' + idx.GROWN.length + ' cells, grown/index.json lists ' + next.cells.length);
      next.cells.forEach((r, i) => { if (answers[i].id !== r.id) throw new Fail('grown/index.mjs cell ' + i + ' is ' + answers[i].id + ', grown/index.json says ' + r.id); });
      const badNeo = answers.filter((a, i) => isNeoRow(next.cells[i]) && !a.ok);
      if (badNeo.length && badNeo.every((a) => rowServes(next.cells.find((r) => r.id === a.id))) && attempt < before.length) flip = badNeo;
      else if (badNeo.length) throw new Fail(badNeo.map((a) => a.id + ' does not answer as its gate says (got ' + (a.got ?? 'null') + ')').join('; '));
      else return result(true, answers.filter((a, i) => !isNeoRow(next.cells[i]) && !a.ok).map((a) => a.id));
    } catch (e) {
      putBack();
      throw new Fail('regate: the proof failed: ' + first(e) + ' (grown/ is as it was)');
    }
    putBack();
    const why = new Map(flip.map((a) => [a.id, a.got ? 'shadowed: its first example is answered first by ' + a.got : 'it does not answer its own first example through grownAnswer']));
    neo = neo.map((r) => (why.has(r.id) ? { ...r, serve: false, gate: why.get(r.id) } : r));
  }
}

// ---------------------------------------------------------------- status
/**
 * The engine's features (contract c3), detected, never declared: gate, stage and core are this file and
 * grow/neo-core.mjs; know when the kernel holds a primitive of the family know and grow/know.mjs is on disk; genome,
 * macros and cursor when grow/neo-core.mjs exports what the search reads them with (applyGenome, macroCells, resumeCursor).
 * @returns {string[]}
 */
export function featuresOf() {
  const out = [];
  if (typeof CORE.deriveTemplates === 'function' && typeof CORE.fitsTemplates === 'function' && typeof regate === 'function') out.push('gate');
  if (typeof mergeStage === 'function' && typeof stageErrors === 'function') out.push('stage');
  if (typeof CORE.spawn === 'function') out.push('core');
  if (Object.values(PRIMS).some((p) => p && p.family === 'know') && fs.existsSync(path.join(HERE, 'know.mjs'))) out.push('know');
  if (typeof CORE.applyGenome === 'function') out.push('genome');
  if (typeof CORE.macroCells === 'function') out.push('macros');
  if (typeof CORE.resumeCursor === 'function') out.push('cursor');
  return out;
}
/**
 * status of grow/NEO.md: opened tasks, promoted colonies and their cells, mastered colonies (held-out score 1), the
 * serving colonies (the gate), the ledger's generated total, the kept population of every task's colony.json and its
 * families, and the engine's features.
 * @param {string} root the tree
 * @returns {{ tasks: number, colonies: number, cells: number, mastered: number, serving: number, generated: number, kept: number, byFamily: object, features: string[], at: string }}
 */
export function status(root = DEFAULT_ROOT) {
  engineOf(root); // a cell that names a macro is counted under the family of its body
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
    mastered: rows.filter((r) => isMastered(r.heldout)).length, serving: rows.filter(rowServes).length, generated: led.doc.generated, kept, byFamily,
    features: featuresOf(), at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------- CLI
const FLAGS = new Set(['root', 'class', 'task', 'gen', 'out', 'max-generated', 'max-ms', 'knowledge', 'stage', 'era']);
const VERBS = Object.freeze(['spawn', 'grow', 'status', 'regate', 'merge', 'baseline']);
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
 * The CLI: spawn, grow (--stage), merge, regate, status, baseline. Prints one JSON line last; resolves to the exit code
 * (0, 1 a failure, 2 usage). --era <n> is taken by every verb and echoed in its line.
 * @param {string[]} argv the arguments after the script
 * @param {{ log?: Function, err?: Function, organism?: Function|null }} io
 * @returns {Promise<number>}
 */
export async function main(argv = process.argv.slice(2), { log = console.log, err = console.error, organism = null } = {}) {
  try {
    const { pos, flags } = parseFlags(argv);
    const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
    const budget = { maxGenerated: intFlag(flags['max-generated'], 'max-generated'), maxMs: intFlag(flags['max-ms'], 'max-ms') };
    const era = flags.era === undefined ? undefined : Number(flags.era);
    if (era !== undefined && !(Number.isInteger(era) && era >= 0)) throw new Fail('usage: --era is an integer from 0\n' + USAGE, 2);
    const verb = pos[0];
    if (pos.length !== 1 || !VERBS.includes(verb)) throw new Fail('usage: one verb of ' + VERBS.join(', ') + '\n' + USAGE, 2);
    let out;
    if (verb === 'spawn') {
      if (flags.class === undefined || flags.gen === undefined) throw new Fail('usage: spawn takes --class and --gen\n' + USAGE, 2);
      out = spawnClass(root, { cls: flags.class, gen: intFlag(flags.gen, 'gen'), out: flags.out || null, budget });
    } else if (verb === 'grow') {
      if (flags.task === undefined || flags.gen === undefined) throw new Fail('usage: grow takes --task and --gen\n' + USAGE, 2);
      out = await growTask({ root, task: flags.task, gen: intFlag(flags.gen, 'gen'), organism, budget, knowledge: flags.knowledge, stage: flags.stage ?? null });
    } else if (verb === 'merge') {
      if (flags.stage === undefined) throw new Fail('usage: merge takes --stage <dir>\n' + USAGE, 2);
      out = await mergeStage({ root, dir: flags.stage, organism, knowledge: flags.knowledge, maxMs: budget.maxMs ?? null });
    } else if (verb === 'regate') out = await regate({ root });
    else if (verb === 'baseline') {
      if (flags.task === undefined) throw new Fail('usage: baseline takes --task\n' + USAGE, 2);
      out = await baselineOfTask({ root, task: flags.task, organism, knowledge: flags.knowledge });
    } else out = status(root);
    log(JSON.stringify(era === undefined ? out : { ...out, era }));
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
