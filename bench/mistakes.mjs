// bench/mistakes.mjs: THE BAR for the mistake ledger (self/mistakes.mjs). Author: board 34 builder (item mistakes).
// MODEL OFF: the re-ask is ask() with provider 'null'; nothing here opens a socket.
//
//   node bench/mistakes.mjs --reask            read the five sources, write the ledger, re-ask every row whose prompt
//                                              is on disk (a wall per row, printed), write the re-ask rows and the verdict
//   node bench/mistakes.mjs                    the ledger and the lessons only (the verdict is NOT written: a bar
//                                              that did not re-ask cannot be met, and would overwrite one that did)
//   --json                                     print the verdict as JSON
//   --since <prev mistakes.json>               print the paired change per source against an earlier verdict
//                                              (learned: left the ledger or newly fixed by the re-ask; regressed:
//                                              entered the ledger or no longer fixed)
//   --wall-ms N (default 2000)  --limit N (a partial re-ask: never the bar, writes no verdict)  --nowrite  --quiet
//
// WRITES: bench/verdicts/mistakes-ledger.jsonl (every run, rebuilt from the sources), and with --reask
// bench/verdicts/mistakes-reask.jsonl and bench/verdicts/mistakes.json. Each is a few hundred KB at most; the verdict
// records their bytes.
//
// isTheBar: all five sources read, none absent, and no ledger row with why 'unknown'.
// barMet: isTheBar, the re-ask ran through ask() (never an injected asker) on every row whose prompt is on disk, the
// lessons carry at least 90% of ledger rows, the ledger count per source equals the source's own count (printed beside
// it), the grader controls hold, and the split is not contaminated (split.contaminated false: the held-out file is on
// disk, its ids hash to the idsSha256 it recorded when written, it names as many ids as its n, none of them is a ledger
// row, and the mtime of self/mistakes.mjs is later than the held-out file's at field; otherwise contaminated holds the
// reasons and the bar is not met). The mtime check is necessary and not sufficient for "the vocabulary was written after
// the held-out file": any later edit of self/mistakes.mjs passes it, and the verdict says exactly that, no more.
// THE CONTROLS (named, printed, never fitted; each can fail on a single row):
//   regrade      the source's own wrong answer, graded again by this file's grader, is wrong on every row that kept
//                one (gsm8k got, the answer bench candidate, the census stored text); HumanEval keeps no code, so it
//                has no regrade and says so
//   gold         for EVERY re-askable row, the row's own right answer as the reply must read fixed. On disk: gsm8k the
//                integer after ####, the answer bench its expected value, the census an exact rubric's answer. Built
//                from the row's own rubric or tests where no answer text is on disk (never checked against the grader
//                before it is graded): a contains rubric's terms, an example string of a regex rubric, a text at the
//                low edge of every length band, and for a code rubric or a HumanEval record a function that returns
//                each test's own expected value. A row whose own tests do not parse (node:vm compiles them) cannot
//                read fixed for any reply; it is counted apart, named, and must NOT read fixed
//   wrong        for every re-askable row, a deliberately wrong reply must be graded answered and wrong (nowOf reads it
//                still where the row was wrong before, wrong-now where it refused before): the gold's last integer
//                plus one (or an x appended), the contains terms less the one the rubric needs, a reply with no letter
//                or digit for a regex rubric, one unit over the first length band, a function returning an object no
//                test expects
//   empty        the empty reply, asked ONCE (one call on the first re-askable row, not a per-row count), reads refused
//   censusKind   how often the shape read from a census prompt's text is one its own kind allows (a measurement of the
//                vocabulary, reported, not a condition of the bar)
//   heldOut      bench/verdicts/mistakes-heldout.json (GSM8K ids answered RIGHT; the file's own text says it was
//                written before any vocabulary code): the share of those questions the vocabulary shapes
import { existsSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as M from '../self/mistakes.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const CARRY_MIN = 0.9;
export const COMMAND = 'node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts --record state/board34/mistakes/budget.json -- node --max-old-space-size=4000 bench/mistakes.mjs --reask';

export function args(argv) {
  const o = { reask: false, json: false, since: null, write: true, quiet: false, wallMs: M.WALL_MS, limit: 0 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--reask') o.reask = true;
    else if (a === '--json') o.json = true;
    else if (a === '--since') { o.since = argv[++i]; if (!o.since) throw new Error('--since needs a path'); }
    else if (a === '--nowrite') o.write = false;
    else if (a === '--quiet') o.quiet = true;
    else if (a === '--wall-ms') { o.wallMs = Number(argv[++i]); if (!(o.wallMs > 0)) throw new Error('--wall-ms needs a positive number'); }
    else if (a === '--limit') { o.limit = Number(argv[++i]); if (!(o.limit >= 0)) throw new Error('--limit needs a number'); }
    else throw new Error('unknown flag ' + a);
  }
  return o;
}

const abs = (root, rel) => (path.isAbsolute(rel) ? rel : path.join(root, rel));
const readJson = (f) => JSON.parse(readFileSync(f, 'utf8'));
const count = (xs, key) => { const o = {}; for (const x of xs) o[x[key]] = (o[x[key]] || 0) + 1; return o; };

/** The hash the held-out file records for its ids, as its writer computed it: sha256 of the ids joined by a newline. */
export const heldOutIdsHash = (ids) => M.sha256(ids.join('\n'));

/** The held-out split from its file's text: the file's own hash and stamp, whether its ids still hash to the idsSha256
 * it recorded and number its n, how many of them are ledger rows, and the share of its questions the vocabulary shapes. */
export function heldOutOf(text, ctx, rows = [], file = M.FILES.heldOut) {
  const h = JSON.parse(text);
  const ids = Array.isArray(h.ids) ? h.ids.map(String) : [];
  const idsOk = Array.isArray(h.ids) && typeof h.idsSha256 === 'string' && heldOutIdsHash(ids) === h.idsSha256;
  const countOk = Array.isArray(h.ids) && h.n === ids.length;
  const ledgerGsm = new Set(rows.filter((r) => r.source === 'gsm8k').map((r) => String(r.id)));
  const overlap = ids.filter((id) => ledgerGsm.has(id));
  let of = 0, shaped = 0;
  const byOp = {}, unshaped = [];
  for (const id of ids) {
    const rec = ctx.gsm8k && ctx.gsm8k[Number(String(id).split('.')[1])];
    if (!rec) continue;
    of++;
    const o = M.opOf(rec.question);
    if (o) { shaped++; byOp[o.op] = (byOp[o.op] || 0) + 1; } else if (unshaped.length < 10) unshaped.push(id);
  }
  return {
    file, sha256: M.sha256(text), at: h.at ?? null, n: h.n ?? null, ids: ids.length, idsSha256: h.idsSha256 ?? null, idsSha256Holds: idsOk,
    countHolds: countOk, ledgerOverlap: overlap.length, ledgerOverlapExamples: overlap.slice(0, 5),
    what: 'GSM8K ids the organism answered right, every 6th by test index; the file\'s own text says it was written before any vocabulary code, and the only check of that order here is split.code (an mtime, necessary and not sufficient)',
    of, shaped, share: of ? Math.round((shaped / of) * 10000) / 10000 : null, byOp, unshapedExamples: unshaped,
  };
}

/** The held-out split read from disk (absent says so). */
export function heldOutCoverage(root, ctx, rows = []) {
  const f = abs(root, M.FILES.heldOut);
  if (!existsSync(f)) return { file: M.FILES.heldOut, absent: true };
  return heldOutOf(readFileSync(f, 'utf8'), ctx, rows);
}

/** The one order check the bar can run: the mtime of self/mistakes.mjs is later than the held-out file's at field.
 * NECESSARY, NOT SUFFICIENT for "the vocabulary was written after the held-out file": any later edit passes it. */
export const CODE_ORDER_CHECK = 'the mtime of self/mistakes.mjs is later than the held-out file\'s at field (necessary, not sufficient: any later edit of self/mistakes.mjs passes it)';
export function codeOrderOf(codeMtime, heldOutAt) {
  const later = codeMtime && heldOutAt ? Date.parse(codeMtime) > Date.parse(heldOutAt) : null;
  return { file: 'self/mistakes.mjs', mtime: codeMtime ?? null, heldOutAt: heldOutAt ?? null, mtimeLaterThanHeldOutAt: later, check: CODE_ORDER_CHECK };
}

/** false when the split is clean, else the reasons in one string (board rule 1: contaminated false or the reason). */
export function contaminationOf(heldOut, mtimeLaterThanHeldOutAt) {
  const why = [];
  if (!heldOut || heldOut.absent) why.push('the held-out file ' + ((heldOut && heldOut.file) || M.FILES.heldOut) + ' is not on disk');
  else {
    if (!heldOut.idsSha256Holds) why.push('its ids do not hash to the idsSha256 it recorded when written');
    if (!heldOut.countHolds) why.push('it names ' + heldOut.ids + ' ids where its n says ' + heldOut.n);
    if (heldOut.ledgerOverlap > 0) why.push(heldOut.ledgerOverlap + ' of its ids are ledger rows (' + heldOut.ledgerOverlapExamples.join(' ') + ')');
    if (mtimeLaterThanHeldOutAt !== true) why.push('the mtime of self/mistakes.mjs is not later than the held-out file\'s at field');
  }
  return why.length ? why.join('; ') : false;
}

/** The bar, from its parts: every condition named; an injected asker or a partial re-ask never meets it. */
export function barMetOf({ isTheBar, reask, limit, injected, carries, matchAll, controlsHold, contaminated }) {
  return !!(isTheBar && reask && reask.ranOnEvery && limit === 0 && !injected && carries && matchAll && controlsHold && contaminated === false);
}

// ---------------------------------------------------------------- the control replies (built, never graded to build)
/** The text with its last run of digits raised by one ('504' -> '505', '12:35' -> '12:36', '3/4' -> '3/5'); a text
 * with no digit gets an x appended ('mice' -> 'micex'). The deliberately wrong reply to an answer on disk. */
export function offByOne(text) {
  const t = String(text ?? '');
  const m = /(\d+)(?!.*\d)/s.exec(t);
  if (!m) return t + 'x';
  return t.slice(0, m.index) + (BigInt(m[1]) + 1n).toString() + t.slice(m.index + m[1].length);
}

const REPRESENTATIVES = 'axA0 -.):*#/|?_\n';
const LINE_END = /^[\n\r\u2028\u2029]$/;
const PRINTABLE = Array.from({ length: 95 }, (_, k) => String.fromCharCode(32 + k)).join('');
const ESCAPE_TEXT = Object.freeze({ d: '0', D: 'x', w: 'a', W: ' ', s: ' ', S: 'x', n: '\n', t: '\t', r: '\r' });
/** One string a regular expression should match, built from its source alone (the shortest choice everywhere: the
 * first alternative, a quantifier's minimum, a class's first representative, else the first printable ASCII character
 * it matches, a lookaround and \b emit nothing). Never
 * tested against the pattern here: the gold control grades it, and a string that does not match fails that row.
 * null for syntax this builder does not read (a back reference) and for an anchor it cannot satisfy (text after $, or ^
 * after text, not at a line end with the m flag). */
export function regexExample(pattern, flags = '') {
  const src = String(pattern ?? '');
  const multi = String(flags).includes('m');
  const classFlags = String(flags).replace(/[gmyd]/g, '');
  let i = 0;
  const alt = () => { const alts = [seq()]; while (src[i] === '|') { i++; alts.push(seq()); } return { t: 'alt', alts }; };
  const seq = () => { const items = []; while (i < src.length && src[i] !== '|' && src[i] !== ')') items.push(quant(atom())); return { t: 'seq', items }; };
  function atom() {
    const c = src[i];
    if (c === '(') {
      i++;
      let kind = 'group';
      if (src.startsWith('?:', i)) i += 2;
      else if (src.startsWith('?=', i) || src.startsWith('?!', i)) { kind = 'look'; i += 2; }
      else if (src.startsWith('?<=', i) || src.startsWith('?<!', i)) { kind = 'look'; i += 3; }
      else if (src.startsWith('?<', i)) { const e = src.indexOf('>', i); if (e < 0) throw new Error('an unclosed group name'); i = e + 1; }
      const body = alt();
      if (src[i] !== ')') throw new Error('an unclosed group');
      i++;
      return { t: kind, body };
    }
    if (c === '[') {
      const s = i++;
      if (src[i] === '^') i++;
      if (src[i] === ']') i++;
      while (i < src.length && src[i] !== ']') { if (src[i] === '\\') i++; i++; }
      if (src[i] !== ']') throw new Error('an unclosed class');
      i++;
      return { t: 'class', src: src.slice(s, i) };
    }
    if (c === '\\') {
      const e = src[i + 1];
      i += 2;
      if (/[1-9k]/.test(e)) throw new Error('a back reference');
      if (e === 'x') { const h = src.slice(i, i + 2); i += 2; return { t: 'char', c: String.fromCharCode(parseInt(h, 16)) }; }
      if (e === 'u') { const h = src.slice(i, i + 4); i += 4; return { t: 'char', c: String.fromCharCode(parseInt(h, 16)) }; }
      if (e === 'b' || e === 'B') return { t: 'none' };
      return { t: 'char', c: ESCAPE_TEXT[e] ?? e };
    }
    i++;
    if (c === '^' || c === '$') return { t: 'anchor', c };
    if (c === '.') return { t: 'class', src: '.' };
    return { t: 'char', c };
  }
  function quant(a) {
    let min;
    const c = src[i];
    const brace = c === '{' ? /^\{(\d+)(?:,\d*)?\}/.exec(src.slice(i)) : null;
    if (c === '?' || c === '*') { min = 0; i++; }
    else if (c === '+') { min = 1; i++; }
    else if (brace) { min = Number(brace[1]); i += brace[0].length; }
    else return a;
    if (src[i] === '?') i++;
    return { t: 'rep', min, a };
  }
  let out = '', afterEnd = false;
  const canEndLine = (a) => (a.t === 'char' && a.c === '\n') || (a.t === 'class' && new RegExp('^' + (a.src === '.' ? '.' : a.src) + '$', classFlags).test('\n'));
  const put = (s) => {
    // $ consumes nothing: text after it matches only when it starts with a line end (m flag).
    if (afterEnd) { if (!multi || !LINE_END.test(s[0] ?? '')) throw new Error('text after $'); afterEnd = false; }
    out += s;
  };
  function emit(n) {
    switch (n.t) {
      case 'alt': return emit(n.alts[0]);
      case 'seq': for (const x of n.items) emit(x); return undefined;
      case 'group': return emit(n.body);
      case 'look': case 'none': return undefined;
      case 'rep':
        // After $ (m flag) the next text must start at a line end: a repeat that can match one gives it one ("$[\s\S]*^").
        if (n.min === 0 && afterEnd && multi && canEndLine(n.a)) { put('\n'); return undefined; }
        for (let k = 0; k < n.min; k++) emit(n.a);
        return undefined;
      case 'char': return put(n.c);
      case 'class': {
        const re = new RegExp('^' + n.src + '$', classFlags);
        const ch = [...REPRESENTATIVES].find((x) => re.test(x)) ?? [...PRINTABLE].find((x) => re.test(x));
        if (ch === undefined) throw new Error('no representative for ' + n.src);
        return put(ch);
      }
      case 'anchor':
        if (n.c === '$') { afterEnd = true; return undefined; }
        // ^ consumes nothing: after text it matches only right after a line end (m flag).
        if (out === '' || (multi && LINE_END.test(out[out.length - 1]))) return undefined;
        throw new Error('^ after text');
      default: throw new Error('a node this builder does not read: ' + n.t);
    }
  }
  try {
    const tree = alt();
    if (i !== src.length) throw new Error('an unmatched )');
    emit(tree);
    return out;
  } catch { return null; }
}

export const LENGTH_BANDS = Object.freeze(['words', 'sentences', 'paragraphs', 'lines', 'items']);
/** A text built to a length rubric's bands: mode 'low' puts every band at its minimum (at least 1); mode 'over' puts
 * the rubric's FIRST band one over its maximum (or one under a minimum of 2 or more when it has no maximum). Items and
 * lines are one line each ("1. item 1" when numbered, "- item 1" otherwise); words, sentences and paragraphs are
 * "Word word." sentences spread over the paragraphs. null for a combination it does not build. */
export function lengthText(g, mode = 'low') {
  const bands = Object.keys(g || {}).filter((k) => LENGTH_BANDS.includes(k) && g[k]);
  if (!bands.length) return null;
  const want = {};
  for (const k of bands) want[k] = Math.max(1, g[k].min ?? 0);
  if (mode === 'over') {
    const b = g[bands[0]];
    if (Number.isFinite(b.max)) want[bands[0]] = b.max + 1;
    else if ((b.min ?? 0) >= 2) want[bands[0]] = b.min - 1;
    else return null;
  }
  if (want.items !== undefined || want.lines !== undefined) {
    if (bands.length > 1) return null;
    if (want.items !== undefined) return Array.from({ length: want.items }, (_, j) => (g.items.numbered ? (j + 1) + '. ' : '- ') + 'item ' + (j + 1)).join('\n');
    return Array.from({ length: want.lines }, (_, j) => 'Line ' + (j + 1) + '.').join('\n');
  }
  const P = want.paragraphs ?? 1, S = want.sentences ?? P, W = want.words ?? 2 * S;
  if (S < P || W < S) return null;
  const sentences = [];
  for (let j = 0; j < S; j++) {
    const n = Math.floor(W / S) + (j < W % S ? 1 : 0);
    sentences.push(Array.from({ length: n }, (_, k) => (k === 0 ? 'Word' : 'word')).join(' ') + '.');
  }
  const paras = Array.from({ length: P }, () => []);
  sentences.forEach((s, j) => paras[Math.floor((j * P) / S)].push(s));
  return paras.map((p) => p.join(' ')).join('\n\n');
}

/** The index of the character that closes the bracket open at depth 0 from i, string literals skipped; -1 if none. */
function closeAt(s, i) {
  let depth = 0;
  for (; i < s.length; i++) {
    const c = s[i];
    if (c === '"' || c === "'" || c === '`') { i++; while (i < s.length && s[i] !== c) { if (s[i] === '\\') i++; i++; } continue; }
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') { if (depth === 0) return i; depth--; }
  }
  return -1;
}
/** A HumanEval record's tests as {entry, pairs: [{args (an array literal), want}]}, read from its
 * assert.deepEqual(candidate(ARGS),WANT) lines; pairs null when a line is not that shape. */
export function humanEvalPairs(tests) {
  const s = String(tests ?? '');
  const entry = (/let candidate = ([A-Za-z_$][\w$]*);/.exec(s) || [])[1] || null;
  const HEAD = 'assert.deepEqual(candidate(';
  const asserts = (s.match(/\bassert\.\w+\(/g) || []).length;
  const pairs = [];
  let at = s.indexOf(HEAD);
  while (at >= 0) {
    const a0 = at + HEAD.length;
    const a1 = closeAt(s, a0);
    if (a1 < 0 || s[a1] !== ')') return { entry, pairs: null };
    let w0 = a1 + 1;
    while (s[w0] === ' ') w0++;
    if (s[w0] !== ',') return { entry, pairs: null };
    const w1 = closeAt(s, w0 + 1);
    if (w1 < 0 || s[w1] !== ')') return { entry, pairs: null };
    pairs.push({ args: '[' + s.slice(a0, a1) + ']', want: s.slice(w0 + 1, w1).trim() });
    at = s.indexOf(HEAD, w1);
  }
  return { entry, pairs: pairs.length && pairs.length === asserts ? pairs : null };
}
/** A reply holding one function named entry that returns each test's own expected value for that test's arguments. */
export function tableFunction(entry, pairs) {
  const table = pairs.map((p) => '[' + p.args + ', ' + p.want + ']').join(', ');
  return '```js\nfunction ' + entry + '(...args) { const table = [' + table + ']; const key = JSON.stringify(args); for (const [a, w] of table) if (JSON.stringify(a) === key) return w; return undefined; }\n```';
}
/** Do two of a test table's argument lists evaluate (node:vm, a fresh context) to the same JSON, the key tableFunction
 * looks up? Then a function of its arguments alone cannot return two different wants for them (HumanEval_92: 3 and 3.0
 * are one number in JavaScript). null when the arguments do not evaluate. */
export function argsCollide(pairs) {
  let keys;
  try { keys = vm.runInNewContext('[' + pairs.map((p) => p.args).join(', ') + '].map((a) => JSON.stringify(a))', Object.create(null), { timeout: 1000 }); } catch { return null; }
  return new Set(keys).size !== keys.length;
}
/** A reply holding one function named entry that returns the k-th test's want on its k-th call (the tests call it in
 * order, once per assertion). */
export function sequenceFunction(entry, pairs) {
  return '```js\nfunction ' + entry + '() { const wants = [' + pairs.map((p) => p.want).join(', ') + ']; ' + entry + '.calls = (' + entry + '.calls || 0) + 1; return wants[' + entry + '.calls - 1]; }\n```';
}
/** The gold function for a test table: tableFunction, or sequenceFunction when two argument lists share a key. */
export function goldFunction(entry, pairs) {
  return argsCollide(pairs) === true
    ? { text: sequenceFunction(entry, pairs), how: 'a function returning each test\'s expected value in call order (two of its tests pass arguments with one JSON key)' }
    : { text: tableFunction(entry, pairs), how: 'a function returning each test\'s expected value for its arguments' };
}
/** A reply holding one function named entry that returns an object no test expects. */
export const wrongFunction = (entry) => '```js\nfunction ' + entry + '() { return { mistakesControl: \'a deliberately wrong value\' }; }\n```';
/** Does a test source compile (node:vm, never run)? A record whose tests do not compile fails every reply. */
export function testsCompile(tests) { try { new vm.Script(String(tests ?? '')); return true; } catch { return false; } }
const stripStar = (t) => String(t).replace(/\*$/, '');

/** The two control replies for one re-askable row: gold {text, from: 'disk'|'built', how} or null (with goldWhy), and
 * wrong {text, how}; unpassable when the row's own tests do not compile. Nothing here calls a grader. */
export function controlReplies(row, ctx, G) {
  const out = { gold: null, goldWhy: null, wrong: null, unpassable: false };
  const disk = (text, how) => ({ text, from: 'disk', how });
  const built = (text, how) => (text === null || text === undefined ? null : { text, from: 'built', how });
  if (row.source === 'gsm8k') {
    const rec = ctx.gsm8k && ctx.gsm8k[Number(String(row.id).split('.')[1])];
    const fa = rec ? G.finalAnswer(rec) : null;
    if (fa === null) { out.goldWhy = 'no integer after #### on disk'; return out; }
    out.gold = disk('The answer is ' + fa + '.', 'the integer after ####');
    out.wrong = { text: 'The answer is ' + offByOne(fa) + '.', how: 'that integer plus one' };
  } else if (row.source === 'answer') {
    const q = ctx.answer && ctx.answer.get(String(row.id).split('@')[0]);
    if (!q) { out.goldWhy = 'the question is not on disk'; return out; }
    out.gold = disk(String(q.a), 'the fixture answer');
    out.wrong = { text: offByOne(q.a), how: 'the fixture answer, last integer plus one' };
  } else if (row.source === 'humaneval') {
    const rec = ctx.humaneval && ctx.humaneval.get(row.id);
    if (!rec) { out.goldWhy = 'the record is not on disk'; return out; }
    const { entry, pairs } = humanEvalPairs(rec.tests);
    out.unpassable = !testsCompile(rec.tests);
    if (!entry || !pairs) { out.goldWhy = 'its tests are not assert.deepEqual(candidate(...),...) lines'; }
    else { const gf = goldFunction(entry, pairs); out.gold = built(gf.text, gf.how + ', read from its tests'); }
    if (entry) out.wrong = { text: wrongFunction(entry), how: 'a function returning an object no test expects' };
  } else if (row.source === 'conceive') {
    const p = ctx.conceive && ctx.conceive.get(row.id);
    const g = p && p.grade;
    if (!g) { out.goldWhy = 'the prompt is not on disk'; return out; }
    if (g.type === 'exact') {
      out.gold = disk(String(g.answer), 'the exact rubric answer');
      out.wrong = { text: offByOne(g.answer), how: 'the exact answer, last integer plus one or an x appended' };
    } else if (g.type === 'contains') {
      const all = (g.all || []).map(stripStar), any = (g.any || []).map(stripStar);
      out.gold = built([...all, ...any.slice(0, 1)].join(' '), 'the contains rubric\'s terms');
      out.wrong = { text: [...(any.length ? all : all.slice(0, -1)), 'xq'].join(' '), how: 'the contains terms less the one the rubric needs' };
    } else if (g.type === 'regex') {
      out.gold = built(regexExample(g.pattern, g.flags || ''), 'an example string built from the regex rubric');
      out.wrong = { text: '-', how: 'a reply with no letter or digit' };
    } else if (g.type === 'length') {
      out.gold = built(lengthText(g, 'low'), 'a text at the low edge of every length band');
      const over = lengthText(g, 'over');
      if (over !== null) out.wrong = { text: over, how: 'one unit over the first length band' };
    } else if (g.type === 'code') {
      const tests = Array.isArray(g.tests) ? g.tests : [];
      if (tests.length && /^[A-Za-z_$][\w$]*$/.test(String(g.entry))) {
        const gf = goldFunction(g.entry, tests.map((t) => ({ args: JSON.stringify(t.args), want: JSON.stringify(t.want) })));
        out.gold = built(gf.text, gf.how + ', read from the code rubric');
        out.wrong = { text: wrongFunction(g.entry), how: 'a function returning an object no test expects' };
      }
    }
    if (!out.gold && !out.goldWhy) out.goldWhy = 'no gold built for a ' + g.type + ' rubric';
  } else out.goldWhy = 'not a re-askable source';
  return out;
}

/** The grader controls: regrade (the source's own wrong answer is wrong again), gold (every re-askable row's right
 * answer reads fixed), wrong (every re-askable row's deliberately wrong reply is graded answered and wrong), empty
 * (ONE call: the empty reply reads refused). gradeFn replaces M.gradeReask (a test's, to show each control failing). */
export async function graderControls(rows, ctx, root, { gradeFn = M.gradeReask } = {}) {
  const G = await M.graders();
  const conceiveText = new Map();
  const cf = abs(root, M.FILES.conceive);
  if (existsSync(cf)) for (const r of readJson(cf).rows) if (r.arm === 'organism' && typeof r.text === 'string') conceiveText.set(r.id, r.text);
  const idOf = (r) => r.source + ':' + r.id;
  const keep = (xs, x) => { if (xs.length < 10) xs.push(x); };
  const regrade = { of: 0, wrong: 0, disagree: [], bySource: {}, none: 'humaneval keeps no code in its journal, so it has no regrade; a refused row has no answer to regrade' };
  for (const r of rows) {
    if (r.source === 'arc' || r.why === 'refused') continue;
    let wrongText = null;
    if (r.source === 'gsm8k' && r.given !== null) wrongText = 'The answer is ' + r.given + '.';
    else if (r.source === 'answer' && r.given) wrongText = String(r.given);
    else if (r.source === 'conceive' && conceiveText.has(r.id)) wrongText = conceiveText.get(r.id);
    if (wrongText === null) continue;
    const g = await gradeFn(r, wrongText, ctx);
    const b = regrade.bySource[r.source] = regrade.bySource[r.source] || { of: 0, wrong: 0 };
    regrade.of++; b.of++;
    if (g.answered === true && g.ok === false) { regrade.wrong++; b.wrong++; } else keep(regrade.disagree, idOf(r));
  }
  const askable = rows.filter((r) => r.source !== 'arc' && M.promptText(r, ctx) !== null);
  const gold = { of: 0, fixed: 0, onDisk: 0, built: 0, unpassable: 0, unpassableIds: [], none: 0, noneIds: [], disagree: [], bySource: {} };
  const wrong = { of: 0, wrong: 0, still: 0, wrongNow: 0, none: 0, noneIds: [], disagree: [], bySource: {} };
  for (const r of askable) {
    const c = controlReplies(r, ctx, G);
    const gb = gold.bySource[r.source] = gold.bySource[r.source] || { of: 0, fixed: 0, onDisk: 0, built: 0, unpassable: 0, none: 0 };
    const wb = wrong.bySource[r.source] = wrong.bySource[r.source] || { of: 0, wrong: 0, still: 0, wrongNow: 0, none: 0 };
    if (!c.gold) { gold.none++; gb.none++; keep(gold.noneIds, idOf(r) + ' (' + c.goldWhy + ')'); }
    else {
      gold.of++; gb.of++;
      if (c.gold.from === 'disk') { gold.onDisk++; gb.onDisk++; } else { gold.built++; gb.built++; }
      const now = M.nowOf(r.why, await gradeFn(r, c.gold.text, ctx));
      if (c.unpassable) {
        if (now !== 'fixed') { gold.unpassable++; gb.unpassable++; keep(gold.unpassableIds, idOf(r)); } else keep(gold.disagree, idOf(r) + ' (read fixed though its tests do not compile)');
      } else if (now === 'fixed') { gold.fixed++; gb.fixed++; } else keep(gold.disagree, idOf(r) + ' (read ' + now + ')');
    }
    if (!c.wrong) { wrong.none++; wb.none++; keep(wrong.noneIds, idOf(r)); }
    else {
      wrong.of++; wb.of++;
      const g = await gradeFn(r, c.wrong.text, ctx);
      const now = M.nowOf(r.why, g);
      if (g.answered === true && g.ok === false) {
        wrong.wrong++; wb.wrong++;
        if (now === 'still') { wrong.still++; wb.still++; } else { wrong.wrongNow++; wb.wrongNow++; }
      } else keep(wrong.disagree, idOf(r) + ' (read ' + now + ')');
    }
  }
  let empty = { calls: 0, row: null, answered: null, now: null };
  if (askable.length) {
    const e = await gradeFn(askable[0], '', ctx);
    empty = { calls: 1, row: idOf(askable[0]), answered: e.answered, now: M.nowOf(askable[0].why, e) };
  }
  const holds = regrade.of > 0 && regrade.wrong === regrade.of
    && askable.length > 0 && gold.none === 0 && gold.of === askable.length && gold.fixed + gold.unpassable === gold.of
    && wrong.none === 0 && wrong.of === askable.length && wrong.wrong === wrong.of
    && empty.calls === 1 && empty.now === 'refused';
  return { askable: askable.length, regrade, gold, wrong, empty, holds };
}

/** Build the verdict. askFn replaces the worker (a test's); write false writes nothing. */
export async function run(opts = {}) {
  const o = { root: ROOT, reask: false, write: true, wallMs: M.WALL_MS, limit: 0, askFn: null, since: null, command: null, onRow: null, ...opts };
  const t0 = Date.now();
  const b = await M.buildLedger({ root: o.root });
  const { rows, ctx } = b;
  const sources = b.sources.map((s) => ({
    name: s.name, file: s.file, absent: s.absent, rows: s.rows, mistakes: s.mistakes.length,
    duplicates: s.duplicates ?? 0, torn: s.torn ?? 0,
    own: s.own ? s.own.count : null, ownFile: s.own ? s.own.file : null, ownField: s.own ? s.own.field : null,
    match: !s.absent && s.own && s.own.count === s.mistakes.length,
  }));
  const bySource = {};
  for (const s of M.SOURCE_NAMES) { const xs = rows.filter((r) => r.source === s); bySource[s] = { mistakes: xs.length, byWhy: count(xs, 'why') }; }
  const byWhy = {};
  for (const w of M.WHY) byWhy[w] = rows.filter((r) => r.why === w).length;
  const allLessons = M.lessonsOf(rows);
  const carry = M.carriedShare(rows);
  const unshaped = rows.filter((r) => r.shape === M.UNSHAPED).map((r) => r.source + ':' + r.id);
  const censusKind = M.censusKindControl(rows);
  const heldOut = heldOutCoverage(o.root, ctx, rows);
  const controls = await graderControls(rows, ctx, o.root);

  const askable = rows.filter((r) => r.source !== 'arc' && M.promptText(r, ctx) !== null).length;
  let reask = null, reaskRows = null;
  if (o.reask) {
    const res = await M.reaskAll(rows, ctx, { wallMs: o.wallMs, askFn: o.askFn, limit: o.limit, onRow: o.onRow });
    reaskRows = res.rows;
    const s = M.summarizeReask(res.rows);
    reask = {
      ...s, askable, ranOnEvery: res.rows.length === askable && askable > 0, wallMsPerRow: o.wallMs, limit: o.limit,
      skipped: res.skipped, arcNote: 'ARC rows are not re-asked: a grid task is not a prompt; the grid search re-runs them',
      runWallMs: res.wallMs, workerStarts: res.workerStarts, warmMsMedian: M.median(res.warmMs),
      asker: o.askFn ? 'injected' : 'one worker thread, ask() provider null, seeds/basic.mjs seedBasic warmed with bench/conceive.mjs WARM',
    };
  }
  const ledgerIds = {}, reaskFixedIds = {};
  for (const s of M.SOURCE_NAMES) {
    ledgerIds[s] = rows.filter((r) => r.source === s).map((r) => r.id);
    reaskFixedIds[s] = reaskRows ? reaskRows.filter((r) => r.source === s && r.now === 'fixed').map((r) => r.id) : [];
  }
  const allRead = sources.every((s) => !s.absent);
  const isTheBar = allRead && byWhy.unknown === 0;
  const matchAll = sources.every((s) => s.match);
  const carries = carry.share !== null && carry.share >= CARRY_MIN;
  const code = codeOrderOf(fileTime(o.root, 'self/mistakes.mjs'), heldOut.at ?? null);
  const contaminated = contaminationOf(heldOut, code.mtimeLaterThanHeldOutAt);
  // An injected asker (a test's) is never the bar: the bar is ask() itself, model off.
  const barMet = barMetOf({ isTheBar, reask, limit: o.limit, injected: !!o.askFn, carries, matchAll, controlsHold: controls.holds, contaminated });
  const lessons = allLessons.slice(0, 20).map((l) => ({ shape: l.shape, count: l.count, bySource: l.bySource, whys: l.whys, examples: l.examples, ownerHint: l.ownerHint }));
  const since = o.since ? { file: o.since.file, at: o.since.verdict.at ?? null, bySource: M.sinceDiff(o.since.verdict, { ledgerIds, reaskFixedIds }) } : null;
  const statement = statementOf({ sources, rows, byWhy, carry, lessons, reask, isTheBar, barMet, controls, heldOut, censusKind, allLessons, contaminated, code });
  const verdict = {
    at: new Date().toISOString(), command: o.command || COMMAND, launch: COMMAND, node: process.version, isTheBar, barMet,
    split: {
      contaminated, heldOut, dev: 'the development population is the ledger rows themselves (the GSM8K, census and answer bench wrong rows), read while writing the vocabulary; the held-out rows are measured once here, and nothing on disk shows they were never read',
      code,
    },
    sources, ledger: { rows: rows.length, dropped: b.dropped, file: M.FILES.ledger }, bySource, byWhy,
    lessons, lessonsTotal: allLessons.length, lessonsCarry: { ...carry, min: CARRY_MIN, carries }, unshaped,
    controls: { ...controls, censusKind, heldOutShaped: heldOut.share ?? null }, reask,
    since, ledgerIds, reaskFixedIds, writes: null, benchMs: Date.now() - t0, statement,
  };
  if (o.write) {
    const w = {};
    const lf = abs(o.root, M.FILES.ledger);
    // every row carries the run's at: test/wire-induce-verify.mjs drawAt rebuilds the GSM8K held-out pool at an instant from
    // every journal under bench/verdicts and reads a row with no at as older than any instant (a stampless ledger shrank
    // the pool at ns.json's at from 229 to 209 on 2026-09-28)
    writeFileSync(lf, rows.map((r) => JSON.stringify({ ...ledgerRow(r), at: verdict.at })).join('\n') + '\n');
    w.ledgerBytes = statSync(lf).size;
    if (reask && o.limit === 0) {
      const rf = abs(o.root, M.FILES.reask);
      writeFileSync(rf, reaskRows.map((r) => JSON.stringify({ ...r, at: verdict.at })).join('\n') + '\n');
      w.reaskBytes = statSync(rf).size;
      verdict.writes = { ...w, over100MB: false };
      const vf = abs(o.root, M.FILES.verdict);
      writeFileSync(vf, JSON.stringify(verdict, null, 1) + '\n');
      verdict.writes.verdictBytes = statSync(vf).size;
    } else verdict.writes = { ...w, verdict: 'not written: ' + (reask ? 'a partial re-ask (--limit)' : 'no --reask') };
  }
  return verdict;
}

function fileTime(root, rel) { try { return statSync(abs(root, rel)).mtime.toISOString(); } catch { return null; } }

export const LEDGER_KEYS = Object.freeze(['source', 'id', 'kind', 'prompt', 'promptRef', 'given', 'wanted', 'wantedRef', 'route', 'provenance', 'why', 'detail', 'shape', 'ownerHint']);
export function ledgerRow(r) { const o = {}; for (const k of LEDGER_KEYS) o[k] = r[k] ?? null; return o; }

function statementOf({ sources, rows, byWhy, carry, lessons, reask, isTheBar, barMet, controls, heldOut, censusKind, allLessons, contaminated, code }) {
  const src = sources.map((s) => s.name + ' ' + (s.absent ? 'ABSENT' : s.mistakes + ' of ' + s.rows + (s.match ? ' (its own count agrees)' : ' (its own count says ' + s.own + ')'))).join(', ');
  const why = Object.entries(byWhy).filter(([, n]) => n > 0).map(([w, n]) => w + ' ' + n).join(', ');
  const top = lessons.slice(0, 3).map((l) => l.shape + ' (' + l.count + ')').join('; ');
  let s = 'The ledger holds ' + rows.length + ' mistakes read from five sources: ' + src + '. By why: ' + why + '. ';
  s += allLessons.length + ' lessons carry ' + carry.carried + ' of ' + carry.of + ' rows; the largest are ' + top + '. ';
  s += 'The census control reads ' + censusKind.agree + ' of ' + censusKind.of + ' census rows as a shape their own kind allows; the held-out GSM8K questions are shaped ' + (heldOut.shaped ?? 0) + ' of ' + (heldOut.of ?? 0) + '. ';
  s += contaminated === false
    ? 'The held-out split is clean by the checks the bar runs: its ids hash to the idsSha256 the file recorded, it names as many ids as its n, none of them is a ledger row, and the mtime of self/mistakes.mjs (' + code.mtime + ') is later than the held-out file\'s at (' + code.heldOutAt + '); that last check is necessary and not sufficient for the vocabulary having been written after the held-out file, since any later edit of self/mistakes.mjs passes it. '
    : 'The held-out split is contaminated (' + contaminated + '), so the bar cannot be met. ';
  const cg = controls.gold, cw = controls.wrong;
  s += 'Grader controls, one reply of each kind per re-askable row: the right answer (on disk for ' + cg.onDisk + ' rows, built from the row\'s own rubric or tests for ' + cg.built + ') reads fixed on ' + cg.fixed + ' of ' + cg.of;
  if (cg.unpassable) s += '; on the other ' + cg.unpassable + ', whose own tests do not compile, it reads not fixed, as it must';
  if (cg.none) s += '; no right answer was built for ' + cg.none;
  s += '; a deliberately wrong reply is graded wrong on ' + cw.wrong + ' of ' + cw.of + ' (still ' + cw.still + ', wrong-now ' + cw.wrongNow + ')';
  s += '; the sources\' own wrong answers regrade wrong ' + controls.regrade.wrong + ' of ' + controls.regrade.of;
  s += controls.empty.calls === 1 ? '; the empty reply, asked once, reads ' + controls.empty.now + '. ' : '; the empty reply was not asked (no re-askable row). ';
  if (reask) s += 'Asked again with no model (provider null, a wall of ' + reask.wallMsPerRow + ' ms per row): ' + reask.rows + ' of ' + reask.askable + ' re-askable rows ran; ' + reask.fixed + ' fixed (' + reask.learned + ' of them refused before, so learned), ' + reask.still + ' still wrong, ' + reask.refused + ' refused (' + reask.timedOut + ' cut at the wall), ' + reask.wrongNow + ' wrong now where they refused before; median ' + reask.medianMs + ' ms. ARC rows were not re-asked (a grid task is not a prompt). ';
  else s += 'The re-ask did not run (no --reask), so the bar cannot be met by this run. ';
  s += isTheBar ? (barMet ? 'The bar is met.' : 'The bar is not met.') : 'This run is not the bar (a source absent or a row unclassified).';
  return s;
}

/** The lines the bar prints. */
export function lines(v) {
  const out = [];
  for (const s of v.sources) {
    out.push('MISTAKES ' + s.name + ': ' + (s.absent ? 'ABSENT (' + s.file + ' not on disk)' : s.file + ' read, ' + s.rows + ' graded rows, ' + s.mistakes + ' mistakes; its own count ' + s.own + ' (' + s.ownFile + ': ' + s.ownField + ') ' + (s.match ? 'MATCH' : 'MISMATCH')));
  }
  out.push('MISTAKES ledger ' + v.ledger.rows + ' rows (dedup dropped ' + v.ledger.dropped + '); by why ' + Object.entries(v.byWhy).map(([k, n]) => k + ' ' + n).join(', '));
  out.push('MISTAKES lessons ' + v.lessonsTotal + ' carry ' + v.lessonsCarry.carried + '/' + v.lessonsCarry.of + ' = ' + v.lessonsCarry.share + ' (min ' + v.lessonsCarry.min + '); unshaped ' + v.unshaped.length);
  for (const l of v.lessons.slice(0, 5)) out.push('  LESSON ' + l.count + ' ' + l.shape + ' e.g. ' + l.examples.join(' ') + ' -> ' + l.ownerHint);
  const c = v.controls;
  const cg = c.gold, cw = c.wrong;
  out.push('CONTROL per re-askable row (' + c.askable + '): gold ' + cg.fixed + '/' + cg.of + ' fixed (on disk ' + cg.onDisk + ', built ' + cg.built
    + (cg.unpassable ? '; ' + cg.unpassable + ' read not fixed as required, own tests do not compile: ' + cg.unpassableIds.join(' ') : '')
    + (cg.none ? '; none built for ' + cg.none + ': ' + cg.noneIds.join(' ') : '') + (cg.disagree.length ? '; DISAGREE ' + cg.disagree.join(' ') : '')
    + '); wrong ' + cw.wrong + '/' + cw.of + ' graded wrong (still ' + cw.still + ', wrong-now ' + cw.wrongNow + (cw.none ? '; none built for ' + cw.none : '') + (cw.disagree.length ? '; DISAGREE ' + cw.disagree.join(' ') : '') + ')');
  out.push('CONTROL by source: ' + Object.keys(cg.bySource).map((n) => { const g = cg.bySource[n], w = cw.bySource[n]; return n + ' gold ' + g.fixed + '/' + g.of + ' (disk ' + g.onDisk + ', built ' + g.built + (g.unpassable ? ', tests do not compile ' + g.unpassable : '') + (g.none ? ', none ' + g.none : '') + '), wrong ' + w.wrong + '/' + w.of; }).join('; '));
  out.push('CONTROL empty ' + (c.empty.calls === 1 ? '1 call (' + c.empty.row + '): reads ' + c.empty.now : 'not called (no re-askable row)') + '; regrade ' + c.regrade.wrong + '/' + c.regrade.of + ' wrong' + (c.regrade.disagree.length ? ' (DISAGREE ' + c.regrade.disagree.join(' ') + ')' : '') + '; controls hold ' + c.holds);
  out.push('CONTROL censusKind ' + c.censusKind.agree + '/' + c.censusKind.of + '; heldOut shaped ' + (v.split.heldOut.shaped ?? 'n/a') + '/' + (v.split.heldOut.of ?? 'n/a') + ' (' + v.split.heldOut.file + ' sha256 ' + String(v.split.heldOut.sha256 || '').slice(0, 12) + ', at ' + v.split.heldOut.at + ')');
  const ho = v.split.heldOut;
  out.push('SPLIT heldOut ' + ho.file + (ho.absent ? ' ABSENT' : ': ids ' + ho.ids + ' (n ' + ho.n + ', count holds ' + ho.countHolds + '), ids sha256 ' + String(ho.idsSha256 || '').slice(0, 12) + ' holds ' + ho.idsSha256Holds + ', ledger overlap ' + ho.ledgerOverlap) + '; code mtime ' + v.split.code.mtime + ' later than heldOut at ' + v.split.code.heldOutAt + ': ' + v.split.code.mtimeLaterThanHeldOutAt + ' (necessary, not sufficient: any later edit passes it); contaminated ' + (v.split.contaminated === false ? 'false' : 'YES (' + v.split.contaminated + ')'));
  if (v.reask) {
    for (const [n, s] of Object.entries(v.reask.bySource)) out.push('REASK ' + n + ': rows ' + s.rows + ', fixed ' + s.fixed + ', still ' + s.still + ', refused ' + s.refused + ', wrong-now ' + s.wrongNow + ', learned ' + s.learned + ', timed out ' + s.timedOut + ', median ms ' + s.medianMs);
    out.push('REASK arc: skipped ' + v.reask.skipped.arc + ' rows (a grid task is not a prompt)' + (v.reask.skipped.noPrompt ? '; no prompt on disk ' + v.reask.skipped.noPrompt : ''));
    out.push('REASK all: rows ' + v.reask.rows + ' of ' + v.reask.askable + ' re-askable, fixed ' + v.reask.fixed + ', still ' + v.reask.still + ', refused ' + v.reask.refused + ', wrong-now ' + v.reask.wrongNow + ', learned ' + v.reask.learned + ', timed out ' + v.reask.timedOut + ', median ms ' + v.reask.medianMs + ', wall ms per row ' + v.reask.wallMsPerRow + ', worker starts ' + v.reask.workerStarts + ', run ' + v.reask.runWallMs + ' ms');
  } else out.push('REASK not run (pass --reask)');
  if (v.since) for (const [n, d] of Object.entries(v.since.bySource)) out.push('SINCE ' + n + ': learned ' + d.learned + ', regressed ' + d.regressed + ' (left the ledger ' + d.leftLedger + ', entered ' + d.enteredLedger + ', re-ask newly fixed ' + d.reaskNewlyFixed + ', lost a fix ' + d.reaskLostFix + '; ' + d.before + ' -> ' + d.now + ')');
  out.push('MISTAKES bar: isTheBar ' + v.isTheBar + ', barMet ' + v.barMet + (v.writes && v.writes.verdictBytes ? ' (verdict ' + M.FILES.verdict + ' written, ' + v.writes.verdictBytes + ' bytes; ledger ' + v.writes.ledgerBytes + ', re-ask ' + v.writes.reaskBytes + ')' : v.writes && v.writes.verdict ? ' (' + v.writes.verdict + ')' : ' (nothing written)'));
  return out;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const o = args(process.argv.slice(2));
  let since = null;
  if (o.since) {
    const f = abs(process.cwd(), o.since);
    if (!existsSync(f)) throw new Error('--since: ' + o.since + ' is not on disk');
    since = { file: o.since, verdict: readJson(f) };
  }
  const command = 'node bench/mistakes.mjs ' + process.argv.slice(2).join(' ');
  const v = await run({ reask: o.reask, write: o.write, wallMs: o.wallMs, limit: o.limit, since, command: command.trim() });
  if (o.json) console.log(JSON.stringify(v, null, 1));
  else if (!o.quiet) for (const l of lines(v)) console.log(l);
  else console.log(lines(v).slice(-1)[0]);
  process.exitCode = v.barMet ? 0 : 1;
}
