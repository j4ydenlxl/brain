// reason/synth.mjs: THE CODE REGION. Sample, test, repair: the organism writes a function by
// RUNNING what the model wrote against the examples the task itself states, and keeps the
// candidate the examples confirm.
//
// A model alone writes one function and stops. This region asks the model cell for up to k
// candidates, runs each one inside act/run.mjs's sandbox against assertions it read out of
// the prompt's own comment, keeps the first candidate that passes every one of them, and when
// none does, runs ONE repair round: the model is shown the failing example and what the
// candidate did on it (the value it returned or the error it threw), and asked again.
//
//   (a) extract   the prompt's comment is scanned for examples in three shapes:
//                   doctest   `>>> f(1, 2)` with the value on the next line
//                   example   `f(1, 2) == 3`, `f(1, 2) ==> 3`, `f(1, 2) -> 3`, `f(x) = 3`,
//                             and `Input: a = 1, b = 2` over `Output: 3`
//                   returns   `f(1, 2) returns 3`, `f(1, 2) should return 3`, and
//                             `For x = 5 the output should be 3`
//                 Every argument and every expected value goes through a LITERAL PARSER
//                 (strings, numbers, booleans, null, undefined, NaN, Infinity, arrays,
//                 objects, Python True/False/None and tuples). Nothing from the prompt is ever
//                 executed as code: the assertion program is GENERATED from parsed values by
//                 toSource(), so a comment that says `f(process.exit())` is not an example,
//                 it is text that failed to parse.
//   (b) sample    k completions from the model cell, each with its own seed, so a rerun
//                 draws the same k candidates and a k=1 run is the first draw of a k=5 run.
//   (c) test      each candidate, made stop-token safe (below), runs against the extracted
//                 assertions in the sandbox under a wall clock (timeoutMs). A loop is ended by
//                 worker.terminate(), not by the candidate.
//   (d) keep      the first candidate that passes every extracted assertion (sampling stops
//                 there), else the one that passes most, the earliest on a tie.
//   (e) repair    when none passes all, ONE round: each repair prompt shows one failing
//                 candidate, the example it failed and the error or value, the failing
//                 candidates taken in order of passes; re-sampled up to repairK times, re-tested,
//                 stopping at the first that passes all.
//   (f) provenance "model+exact" when extracted assertions confirmed the kept candidate (it
//                 passed every one, at least one), "model" when none could be extracted or
//                 the kept candidate did not pass them all, "null" for the no-model floor,
//                 "absent" when the model cell produced no candidate at all.
//
// THE HIDDEN TESTS NEVER COME HERE. synthesize() takes a prompt. A benchmark record's tests
// string is the grade, and only the bench that grades reads it; test/synth.test.mjs holds
// that by source (this file never names a tests field) and by a spy on the model cell.
//
// STOP-TOKEN SAFETY. MultiPL-E cuts a completion at the first "\nfunction ", "\n/*", "\n//" or
// "\nconsole.log". A candidate with a helper function after the entry, or a comment at column
// zero, loses its tail to that cut and fails for a reason that is not its logic. stopSafe()
// indents any line that begins with a stop token's text by one space (a declaration or a
// comment means the same thing indented) and replaces a whole-line console call, which would
// throw in a sandbox with no console, by an empty statement. The code that is TESTED here is
// the code that is RETURNED, so a rewrite that broke a candidate would fail its own examples.
//
// AUTHORITY. What the model writes is a string. It is never imported, written to the tree, or
// run in this process: it runs in act/run.mjs's worker and pruned vm context and dies there.
import { performance } from 'node:perf_hooks';
import { complete } from '../act/llm.mjs';
import { runTests, renderValue } from '../act/run.mjs';
import { SANDBOX_RULES } from '../act/code.mjs';

/** MultiPL-E's JavaScript stop tokens, the set every record of humaneval-js.jsonl carries. */
export const JS_STOP_TOKENS = Object.freeze(['\nfunction ', '\n/*', '\n//', '\nconsole.log']);
export const DEFAULTS = Object.freeze({
  k: 5, timeoutMs: 3000, repair: true, maxTokens: 4000, modelTimeoutMs: 300_000,
  probeMs: 1500, memoryMB: 128, maxAssertions: 24, compare: 'loose',
});
export const PROVENANCE = Object.freeze(['model+exact', 'model', 'null', 'absent']);
export const SHAPES = Object.freeze(['doctest', 'example', 'returns']);

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const MARK = 'SYNTH_RESULTS';

// ================================================================ the prompt
/** The function the prompt declares last, which is the one a benchmark calls. */
export function entryOf(prompt) {
  const ms = [...String(prompt ?? '').matchAll(/function\s*\*?\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g)];
  return ms.length ? ms[ms.length - 1][1] : null;
}

/** The parameter names of the entry's signature, in order. */
export function paramsOf(prompt, entry) {
  if (!entry || !IDENT.test(entry)) return [];
  const m = new RegExp('function\\s*\\*?\\s*' + entry.replace(/\$/g, '\\$') + '\\s*\\(([^)]*)\\)').exec(String(prompt ?? ''));
  if (!m) return [];
  return m[1].split(',').map((p) => p.replace(/=.*$/, '').replace(/^\s*\.\.\./, '').trim()).filter((p) => IDENT.test(p));
}

/** The comment text of a prompt, one entry per comment line, with the comment markers off. */
export function docLines(prompt) {
  const out = [];
  let inBlock = false;
  for (const raw of String(prompt ?? '').split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, '');
    if (inBlock) {
      const end = line.indexOf('*/');
      const body = (end >= 0 ? line.slice(0, end) : line).replace(/^\s*\*\s?/, '');
      out.push(body);
      if (end >= 0) inBlock = false;
      continue;
    }
    const lc = /^\s*\/\/\s?(.*)$/.exec(line);
    if (lc) { out.push(lc[1]); continue; }
    const bc = /^\s*\/\*+\s?(.*)$/.exec(line);
    if (bc) {
      const end = bc[1].indexOf('*/');
      out.push(end >= 0 ? bc[1].slice(0, end) : bc[1]);
      if (end < 0) inBlock = true;
    }
  }
  return out;
}

// ================================================================ the literal parser
// A value, parsed, never evaluated. Returns { ok, value, end } where end is the index after
// the literal. Python's True, False, None and tuples are read as MultiPL-E translates them:
// true, false, undefined and arrays.
const WORDS = new Map([
  ['true', true], ['false', false], ['null', null], ['undefined', undefined],
  ['NaN', NaN], ['Infinity', Infinity], ['True', true], ['False', false], ['None', undefined],
]);
const NUM_RE = /^[+-]?(?:(?:\d[\d_]*)(?:\.[\d_]*)?(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)n?/;
const FAIL = Object.freeze({ ok: false });

function skipWs(s, i) {
  while (i < s.length && /\s/.test(s[i])) i++;
  return i;
}

function parseString(s, i) {
  const q = s[i];
  let j = i + 1, out = '';
  while (j < s.length) {
    const ch = s[j];
    if (ch === q) return { ok: true, value: out, end: j + 1 };
    if (ch === '\n' && q !== '`') return FAIL;
    if (q === '`' && ch === '$' && s[j + 1] === '{') return FAIL;
    if (ch === '\\') {
      const e = s[j + 1];
      if (e === undefined) return FAIL;
      const simple = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', 0: '\0' };
      if (e in simple && !(e === '0' && /\d/.test(s[j + 2] || ''))) { out += simple[e]; j += 2; continue; }
      if (e === 'x') { const h = /^[0-9a-fA-F]{2}/.exec(s.slice(j + 2)); if (!h) return FAIL; out += String.fromCharCode(parseInt(h[0], 16)); j += 4; continue; }
      if (e === 'u') {
        const h = /^[0-9a-fA-F]{4}/.exec(s.slice(j + 2));
        if (h) { out += String.fromCharCode(parseInt(h[0], 16)); j += 6; continue; }
        const b = /^\{([0-9a-fA-F]{1,6})\}/.exec(s.slice(j + 2));
        if (b) { out += String.fromCodePoint(parseInt(b[1], 16)); j += 2 + b[0].length; continue; }
        return FAIL;
      }
      if (e === '\n') { j += 2; continue; }
      out += e; j += 2; continue;
    }
    out += ch; j++;
  }
  return FAIL;
}

function parseSeq(s, i, close) {
  // s[i] is the opener; returns the items and whether a comma was seen
  const items = [];
  let j = skipWs(s, i + 1), comma = false;
  if (s[j] === close) return { ok: true, items, comma, end: j + 1 };
  for (;;) {
    const v = parseValue(s, j);
    if (!v.ok) return FAIL;
    items.push(v.value);
    j = skipWs(s, v.end);
    if (s[j] === ',') { comma = true; j = skipWs(s, j + 1); if (s[j] === close) return { ok: true, items, comma, end: j + 1 }; continue; }
    if (s[j] === close) return { ok: true, items, comma, end: j + 1 };
    return FAIL;
  }
}

function parseObject(s, i) {
  const out = {};
  let j = skipWs(s, i + 1);
  if (s[j] === '}') return { ok: true, value: out, end: j + 1 };
  for (;;) {
    let key;
    if (s[j] === '"' || s[j] === "'") { const k = parseString(s, j); if (!k.ok) return FAIL; key = k.value; j = k.end; }
    else {
      const m = /^(?:[A-Za-z_$][A-Za-z0-9_$]*|-?\d+(?:\.\d+)?)/.exec(s.slice(j));
      if (!m) return FAIL;
      key = String(m[0].includes('.') || m[0].startsWith('-') ? Number(m[0]) : m[0]); j += m[0].length;
    }
    j = skipWs(s, j);
    if (s[j] !== ':') return FAIL;
    const v = parseValue(s, j + 1);
    if (!v.ok) return FAIL;
    out[key] = v.value;
    j = skipWs(s, v.end);
    if (s[j] === ',') { j = skipWs(s, j + 1); if (s[j] === '}') return { ok: true, value: out, end: j + 1 }; continue; }
    if (s[j] === '}') return { ok: true, value: out, end: j + 1 };
    return FAIL;
  }
}

function parseValue(s, i) {
  const j = skipWs(s, i);
  const c = s[j];
  if (c === undefined) return FAIL;
  if (c === '"' || c === "'" || c === '`') return parseString(s, j);
  if (c === '[') { const r = parseSeq(s, j, ']'); return r.ok ? { ok: true, value: r.items, end: r.end } : FAIL; }
  if (c === '(') {
    const r = parseSeq(s, j, ')');
    if (!r.ok) return FAIL;
    if (r.items.length === 1 && !r.comma) return { ok: true, value: r.items[0], end: r.end };
    return { ok: true, value: r.items, end: r.end };
  }
  if (c === '{') return parseObject(s, j);
  if ((c === '-' || c === '+') && s.startsWith('Infinity', j + 1)) return { ok: true, value: c === '-' ? -Infinity : Infinity, end: j + 9 };
  const n = NUM_RE.exec(s.slice(j));
  if (n && /\d/.test(n[0])) {
    let t = n[0].replace(/_/g, '');
    if (t.endsWith('n')) {
      if (/[.eE]/.test(t)) return FAIL;
      try { return { ok: true, value: BigInt(t.slice(0, -1)), end: j + n[0].length }; } catch { return FAIL; }
    }
    const v = Number(t);
    if (!Number.isFinite(v)) return FAIL;
    return { ok: true, value: v, end: j + n[0].length };
  }
  const w = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(s.slice(j));
  if (w && WORDS.has(w[0])) return { ok: true, value: WORDS.get(w[0]), end: j + w[0].length };
  return FAIL;
}

/** One literal at position i of s: { ok, value, end }. Exported for the tests. */
export function parseLiteral(s, i = 0) { return parseValue(String(s ?? ''), i); }

/** A whole comma separated argument list, every character consumed: { ok, args }. */
export function parseArgs(text) {
  const s = String(text ?? '');
  const args = [];
  let j = skipWs(s, 0);
  if (j >= s.length) return { ok: true, args };
  for (;;) {
    const v = parseValue(s, j);
    if (!v.ok) return { ok: false, args: [] };
    args.push(v.value);
    j = skipWs(s, v.end);
    if (j >= s.length) return { ok: true, args };
    if (s[j] !== ',') return { ok: false, args: [] };
    j = skipWs(s, j + 1);
    if (j >= s.length) return { ok: true, args };
  }
}

/** `a = 1, b = [2]` read against the signature's parameter names, or null. */
function parseNamedArgs(text, params) {
  const s = String(text ?? '');
  const named = [];
  let j = skipWs(s, 0);
  while (j < s.length) {
    const m = /^([A-Za-z_$][A-Za-z0-9_$]*)\s*=(?!=)\s*/.exec(s.slice(j));
    if (!m) return null;
    const v = parseValue(s, j + m[0].length);
    if (!v.ok) return null;
    named.push([m[1], v.value]);
    j = skipWs(s, v.end);
    if (s[j] === ',' || s[j] === ';') j = skipWs(s, j + 1);
    else if (j < s.length && !/^and\b/i.test(s.slice(j))) break;
    else if (/^and\b/i.test(s.slice(j))) j = skipWs(s, j + 3);
  }
  if (!named.length || skipWs(s, j) < s.length) return null;
  if (params.length && named.every(([k]) => params.includes(k)) && named.length === params.length) {
    return params.map((p) => named.find(([k]) => k === p)[1]);
  }
  if (!params.length || named.length === params.length) return named.map(([, v]) => v);
  return null;
}

// ================================================================ the extractor
const REL_SYM = /^[ \t]*(==>|===|==|-->|->|=>|➞|→|⇒|=(?!=)|:)[ \t]*/;
const REL_WORD = /^[ \t]*,?[ \t]*(?:(?:it|this|which|then|and)[ \t]+)?(?:(?:should|will|would|must|shall|to)[ \t]+)?(is[ \t]+equal[ \t]+to|evaluates?[ \t]+to|results?[ \t]+in|returns?|returned|gives?|outputs?|yields?|equals?|produces?|be|is|are)\b[ \t]*:?[ \t]*/i;
// after a literal: the end, whitespace, or closing punctuation, never more of a word
const AFTER_OK = /^(?:$|[\s.,;:!?)\]])/;

/** The balanced argument text of a call whose "(" is at s[open]: { ok, text, end }. */
function callArgs(s, open) {
  let depth = 0, q = null;
  for (let j = open; j < s.length; j++) {
    const ch = s[j];
    if (q) {
      if (ch === '\\') { j++; continue; }
      if (ch === q) q = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { q = ch; continue; }
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') {
      depth--;
      if (depth === 0) return ch === ')' ? { ok: true, text: s.slice(open + 1, j), end: j + 1 } : { ok: false };
      if (depth < 0) return { ok: false };
    }
  }
  return { ok: false };
}

/** A literal that must END the line it ends on (a doctest's value line). */
function lineValue(s, i) {
  const v = parseValue(s, i);
  if (!v.ok) return FAIL;
  const rest = s.slice(v.end);
  const nl = rest.indexOf('\n');
  const tail = nl < 0 ? rest : rest.slice(0, nl);
  return /^\s*$/.test(tail) ? v : FAIL;
}

/** A literal followed by nothing that would make it part of a longer expression. */
function boundedValue(s, i) {
  const v = parseValue(s, i);
  if (!v.ok) return FAIL;
  const rest = s.slice(v.end);
  if (!AFTER_OK.test(rest)) return FAIL;
  // "f(x) == 3 + 1" or "f(x) = n * 2" is arithmetic, not a value
  if (/^[ \t]*(?:[-+*/%^&|]|\*\*)[ \t]*[\w(\[]/.test(rest)) return FAIL;
  return v;
}

/**
 * The executable examples a prompt states about its entry function.
 * @param {string} prompt
 * @param {string} [entry] defaults to the last function the prompt declares
 * @returns {{entry: string|null, params: string[], assertions: object[], shapes: object}}
 *   each assertion { args, expected, shape, call, want } with call and want as source text
 */
export function extractAssertions(prompt, entry = entryOf(prompt), opts = {}) {
  const max = Number.isFinite(opts.maxAssertions) ? opts.maxAssertions : DEFAULTS.maxAssertions;
  const params = paramsOf(prompt, entry);
  const out = { entry: entry || null, params, assertions: [], shapes: { doctest: 0, example: 0, returns: 0 } };
  if (!entry || !IDENT.test(entry)) return out;
  const doc = docLines(prompt).join('\n');
  const seen = new Set();
  const add = (args, expected, shape) => {
    if (out.assertions.length >= max) return;
    const call = entry + '(' + args.map(toSource).join(', ') + ')';
    const want = toSource(expected);
    const key = call + ' => ' + want;
    if (seen.has(key)) return;
    // one call with two different stated answers is a comment that contradicts itself; the
    // first statement stands and the second is not an example
    for (const a of out.assertions) if (a.call === call) return;
    seen.add(key);
    out.assertions.push({ args, expected, shape, call, want });
    out.shapes[shape]++;
  };

  // calls to the entry, anywhere in the comment
  const esc = entry.replace(/\$/g, '\\$');
  const callRe = new RegExp('(^|[^A-Za-z0-9_$.])(' + esc + ')\\s*\\(', 'g');
  for (const m of doc.matchAll(callRe)) {
    const nameAt = m.index + m[1].length;
    const open = doc.indexOf('(', nameAt + entry.length);
    const c = callArgs(doc, open);
    if (!c.ok) continue;
    const pa = parseArgs(c.text);
    if (!pa.ok) continue;
    const lineStart = doc.lastIndexOf('\n', nameAt - 1) + 1;
    const before = doc.slice(lineStart, nameAt);
    const isDoctest = /^\s*>>>\s*(?:print\s*\(\s*)?$/.test(before);
    let rest = doc.slice(c.end);
    if (isDoctest && /^\s*\)/.test(rest) && /print\s*\($/.test(before.trim())) rest = rest.replace(/^\s*\)/, '');
    const restAt = doc.length - rest.length;
    const sym = REL_SYM.exec(rest);
    const word = sym ? null : REL_WORD.exec(rest);
    if (sym || word) {
      const at = restAt + (sym || word)[0].length;
      const v = boundedValue(doc, at);
      if (v.ok) {
        add(pa.args, v.value, isDoctest ? 'doctest' : (word ? 'returns' : 'example'));
        continue;
      }
    }
    if (isDoctest) {
      const nl = rest.indexOf('\n');
      if (nl >= 0 && /^\s*$/.test(rest.slice(0, nl))) {
        const v = lineValue(doc, restAt + nl + 1);
        if (v.ok) add(pa.args, v.value, 'doctest');
      }
    }
  }

  // Input: ... / Output: ...
  for (const m of doc.matchAll(/\bInput\s*:\s*([^\n]*)\n(?:[^\n]*\n){0,1}?\s*Output\s*:\s*/gi)) {
    const inText = m[1].trim().replace(/[.;]\s*$/, '');
    let args = parseNamedArgs(inText, params);
    if (!args) { const pa = parseArgs(inText); if (pa.ok && (params.length === 0 || pa.args.length === params.length)) args = pa.args; }
    if (!args) continue;
    const v = boundedValue(doc, m.index + m[0].length);
    if (v.ok) add(args, v.value, 'example');
  }

  // For x = 5 the output should be 3
  for (const m of doc.matchAll(/\bfor\s+([A-Za-z_$][A-Za-z0-9_$]*\s*=(?!=)[^\n]*?)[ \t]*,?[ \t]*the[ \t]+(?:output|result|answer|return[ \t]+value)[ \t]+(?:should[ \t]+be|will[ \t]+be|is)[ \t]*:?[ \t]*/gi)) {
    const args = parseNamedArgs(m[1].trim(), params);
    if (!args) continue;
    const v = boundedValue(doc, m.index + m[0].length);
    if (v.ok) add(args, v.value, 'returns');
  }
  return out;
}

// ================================================================ source from values
/** JavaScript source for a parsed value. The only way prompt data becomes code. */
export function toSource(v) {
  if (v === undefined) return 'undefined';
  if (v === null) return 'null';
  const t = typeof v;
  if (t === 'boolean') return String(v);
  if (t === 'number') {
    if (Number.isNaN(v)) return 'NaN';
    if (v === Infinity) return 'Infinity';
    if (v === -Infinity) return '-Infinity';
    if (Object.is(v, -0)) return '-0';
    return String(v);
  }
  if (t === 'bigint') return v.toString() + 'n';
  if (t === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(toSource).join(', ') + ']';
  if (t === 'object') return '({' + Object.keys(v).map((k) => JSON.stringify(k) + ': ' + toSource(v[k])).join(', ') + '})';
  throw new Error('toSource: not a literal value (' + t + ')');
}

// ================================================================ the harness
// One program per candidate, run after it in the same sandbox context. Every assertion runs
// inside its own try, so one throw does not hide the others, and the tally leaves the worker
// as the message of one final throw (runTests reports a throw and nothing else).
const LOOSE_EQ = [
  'function __synthEq(a, b) {',
  '  if (a === b) return true;',
  '  if (typeof a === "number" && typeof b === "number") {',
  '    if (a !== a && b !== b) return true;',
  '    return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));',
  '  }',
  '  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return a == b;',
  '  if (Array.isArray(a) !== Array.isArray(b)) return false;',
  '  var ka = Object.keys(a), kb = Object.keys(b);',
  '  if (ka.length !== kb.length) return false;',
  '  for (var i = 0; i < ka.length; i++) {',
  '    if (!Object.prototype.hasOwnProperty.call(b, ka[i])) return false;',
  '    if (!__synthEq(a[ka[i]], b[ka[i]])) return false;',
  '  }',
  '  return true;',
  '}',
].join('\n');
const STRICT_EQ = renderValue.toString() + '\nfunction __synthEq(a, b) { return JSON.stringify(renderValue(a)) === JSON.stringify(renderValue(b)); }';

/**
 * The assertion program for one entry. compare 'loose' is node's assert.deepEqual (primitives
 * by ==, NaN equal to NaN) with a 1e-9 relative float tolerance; 'strict' is act/run.mjs's
 * renderValue identity, the rule runCases grades by.
 */
export function buildHarness(entry, assertions, compare = 'loose') {
  if (!entry || !IDENT.test(entry)) throw new Error('buildHarness: the entry is not an identifier');
  const lines = [
    compare === 'strict' ? STRICT_EQ : LOOSE_EQ,
    'function __synthShow(v) { try { var s = JSON.stringify(v, function (k, x) { return typeof x === "bigint" ? String(x) + "n" : x === undefined ? "@undefined" : x; }); return String(s === undefined ? String(v) : s).slice(0, 160); } catch (e) { return String(v).slice(0, 160); } }',
    'function __synthRun(thunk, want) {',
    '  try { var got = thunk(); return __synthEq(got, want) ? { ok: 1 } : { ok: 0, got: __synthShow(got) }; }',
    '  catch (e) { return { ok: 0, err: String((e && e.name) || "Error") + ": " + String(e && e.message).slice(0, 200) }; }',
    '}',
    'if (typeof ' + entry + ' !== "function") throw new Error("SYNTH_NOENTRY: the candidate defines no function named ' + entry + '");',
    'var __synthR = [];',
  ];
  for (const a of assertions) lines.push('__synthR.push(__synthRun(function () { return ' + entry + '(' + a.args.map(toSource).join(', ') + '); }, ' + toSource(a.expected) + '));');
  lines.push('var __synthBad = 0; for (var __i = 0; __i < __synthR.length; __i++) if (!__synthR[__i].ok) __synthBad++;');
  lines.push('if (__synthBad) throw new Error("' + MARK + '" + JSON.stringify(__synthR));');
  return lines.join('\n');
}

/**
 * Run one candidate against the harness in the sandbox.
 * @returns {Promise<{passed: number, of: number, loaded: boolean, timedOut: boolean, error: string|null, results: object[], ms: number}>}
 */
export async function testCandidate(code, entry, assertions, opts = {}) {
  const of = assertions.length;
  const harness = opts.harness || buildHarness(entry, assertions, opts.compare);
  const r = await runTests(code, harness, {
    limitMs: Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : DEFAULTS.timeoutMs,
    memoryMB: Number.isFinite(opts.memoryMB) ? opts.memoryMB : DEFAULTS.memoryMB,
  });
  const base = { of, ms: r.ms, timedOut: !!r.timedOut };
  if (r.passed) return { ...base, passed: of, loaded: true, error: null, results: assertions.map(() => ({ ok: 1 })) };
  const err = String(r.error || '');
  const at = err.indexOf(MARK);
  if (r.stage === 'tests' && at >= 0) {
    try {
      const results = JSON.parse(err.slice(at + MARK.length));
      if (Array.isArray(results) && results.length === of) {
        return { ...base, passed: results.filter((x) => x && x.ok).length, loaded: true, error: null, results };
      }
    } catch { /* a candidate that rewrote JSON gets no tally */ }
  }
  return { ...base, passed: 0, loaded: r.stage === 'tests' && !/SYNTH_NOENTRY/.test(err), error: err.slice(0, 300) || 'the candidate failed', results: [] };
}

// ================================================================ what the model wrote
function definesEntry(code, entry) {
  if (!entry) return false;
  const e = entry.replace(/\$/g, '\\$');
  return new RegExp('(?:function\\s*\\*?\\s*' + e + '\\s*\\(|(?:const|let|var)\\s+' + e + '\\s*=)').test(code);
}

/**
 * The code out of a model's answer: reasoning removed, the LAST fenced block that defines the
 * entry (a model that ends with a usage example writes it in a later fence), else the last
 * fence, else an unterminated fence's tail, else the whole text.
 */
export function codeFrom(text, entry) {
  let t = String(text ?? '').replace(/<think>[\s\S]*?<\/think>/gi, ' ').replace(/<think>[\s\S]*$/i, ' ');
  const fences = [...t.matchAll(/```[a-zA-Z]*[ \t]*\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
  let code;
  if (fences.length) {
    const defining = fences.filter((f) => definesEntry(f, entry));
    code = defining.length ? defining[defining.length - 1] : fences[fences.length - 1];
  } else {
    const open = /```[a-zA-Z]*[ \t]*\r?\n([\s\S]*)$/.exec(t);
    code = open ? open[1] : t;
  }
  code = code.replace(/^[ \t]*export[ \t]+(?:default[ \t]+)?/gm, '').replace(/^[ \t]*module\.exports[^\n]*$/gm, '');
  return code.replace(/\r\n/g, '\n').trim();
}

function parensBalanced(line) {
  let d = 0, q = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) { if (ch === '\\') { i++; continue; } if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { q = ch; continue; }
    if (ch === '(') d++;
    else if (ch === ')') { d--; if (d < 0) return false; }
  }
  return d === 0 && q === null;
}

/**
 * A candidate that survives the stop-token cut unchanged: { code, changed, safe }.
 * safe is false when a stop token still occurs (inside a string, say), and the code is then
 * what the cut will see.
 */
export function stopSafe(code, stopTokens = JS_STOP_TOKENS) {
  const src = String(code ?? '').replace(/\r\n/g, '\n');
  const lines = src.split('\n');
  const heads = (Array.isArray(stopTokens) ? stopTokens : []).filter((t) => typeof t === 'string' && t.startsWith('\n') && t.length > 1).map((t) => t.slice(1));
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (/^console\.[A-Za-z]+\s*\(.*\)\s*;?$/.test(trimmed) && parensBalanced(trimmed)) {
      lines[i] = lines[i].slice(0, lines[i].length - lines[i].trimStart().length) + ';';
      continue;
    }
    if (i > 0 && heads.some((h) => lines[i].startsWith(h))) lines[i] = ' ' + lines[i];
  }
  const out = lines.join('\n');
  const safe = !(Array.isArray(stopTokens) ? stopTokens : []).some((t) => typeof t === 'string' && t && out.includes(t));
  return { code: out, changed: out !== src, safe };
}

// ================================================================ prompts
/** The first prompt: the function as the task states it, and the sandbox's rules. */
export function samplePrompt(prompt) {
  return [
    'Complete the JavaScript function below. Write the whole function, starting with its signature exactly as given, so that it does what its comment says and returns the values its examples show.',
    '',
    '```javascript',
    String(prompt ?? '').replace(/\s+$/, ''),
    '```',
    '',
    SANDBOX_RULES,
    '',
    'Answer with one fenced javascript code block holding the whole function and nothing else.',
  ].join('\n');
}

/** What a failing candidate did on its first failing example, in one sentence. */
export function failureSentence(cand, assertions, timeoutMs) {
  const t = cand.test || {};
  if (t.timedOut) return 'It did not finish within ' + timeoutMs + ' ms on ' + (assertions[0] ? assertions[0].call : 'its first example') + ', so it probably loops forever.';
  if (!t.loaded) return 'It did not load: ' + String(t.error || 'no function was defined').replace(/\s+/g, ' ').slice(0, 240) + '.';
  const i = (t.results || []).findIndex((x) => !x || !x.ok);
  if (i < 0) return 'It failed.';
  const a = assertions[i], r = t.results[i];
  if (r.err) return 'On ' + a.call + ' it should return ' + a.want + ', but it threw ' + String(r.err).replace(/\s+/g, ' ').slice(0, 240) + '.';
  return 'On ' + a.call + ' it should return ' + a.want + ', but it returned ' + String(r.got) + '.';
}

/** The repair prompt: the task, the failing candidate, the example it failed and what happened. */
export function repairPrompt(prompt, cand, assertions, timeoutMs) {
  return [
    samplePrompt(prompt),
    '',
    'YOUR PREVIOUS ANSWER WAS RUN AND IT IS WRONG.',
    '',
    '```javascript',
    String(cand.code || ''),
    '```',
    '',
    failureSentence(cand, assertions, timeoutMs),
    '',
    'Fix it. Answer with one fenced javascript code block holding the whole corrected function and nothing else.',
  ].join('\n');
}

// ================================================================ selection
const passesAll = (c) => !!(c && c.test && c.test.loaded && c.test.passed === c.test.of);

/** The candidate a list keeps: the first that passes all, else the most passes, earliest on a tie. */
export function pick(cands) {
  const list = (cands || []).filter((c) => c && c.reached !== false);
  if (!list.length) return null;
  const first = list.find(passesAll);
  if (first) return first;
  let best = null;
  for (const c of list) {
    const score = (c.test && c.test.loaded ? 1 : 0) + (c.test ? c.test.passed : 0) * 2;
    const bs = best ? (best.test && best.test.loaded ? 1 : 0) + (best.test ? best.test.passed : 0) * 2 : -1;
    if (score > bs) best = c;
  }
  return best;
}

// FNV-1a over a string, to a 31 bit seed Ollama accepts
function seedOf(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h & 0x7fffffff;
}

function defaultCell(req) {
  return complete({
    prompt: req.prompt, provider: 'ollama', model: req.model, base: req.base,
    probeMs: req.probeMs, timeoutMs: req.timeoutMs, maxTokens: req.maxTokens, seed: req.seed,
  });
}

/**
 * Sample, test, repair.
 *
 * @param {object} o
 *   prompt      the task: a function signature under a comment (a MultiPL-E prompt), and
 *               NOTHING else; a benchmark's hidden tests never come here
 *   model       the model cell's model name
 *   k           candidates sampled before repair; default 5
 *   timeoutMs   the sandbox wall clock for one candidate's assertion run; default 3000
 *   repair      one repair round when no candidate passes every assertion; default true
 *   repairK     samples in the repair round; default k
 *   provider    'ollama' (default) or 'null': no model, the floor, a stub that returns undefined
 *   cell        async (req) => { ok, text, ms, tokens, reason }: the model cell, injectable
 *   maxTokens, modelTimeoutMs, base, probeMs  passed to the model cell
 *   seed        base seed; each draw's seed is derived from it, the phase and the draw number
 *   stopTokens  the cut the completion must survive; default MultiPL-E JavaScript's
 *   compare     'loose' (default, assert.deepEqual) or 'strict' (act/run.mjs renderValue)
 *   budgetMs    optional wall clock for the whole synthesis; no new call starts past it
 * @returns {Promise<{completion: string, provenance: string, candidates: object[],
 *   passedExtracted: number, extractedCount: number, calls: number, ms: number, entry: string|null,
 *   extracted: object[], shapes: object, keptIndex: number, sampledKeptIndex: number, reason: string|null}>}
 */
export async function synthesize(o = {}) {
  const t0 = performance.now();
  const prompt = String(o.prompt ?? '');
  const k = Math.max(1, Number.isFinite(o.k) ? Math.floor(o.k) : DEFAULTS.k);
  const repair = o.repair === undefined ? DEFAULTS.repair : !!o.repair;
  const repairK = Math.max(1, Number.isFinite(o.repairK) ? Math.floor(o.repairK) : k);
  const timeoutMs = Number.isFinite(o.timeoutMs) && o.timeoutMs > 0 ? o.timeoutMs : DEFAULTS.timeoutMs;
  const memoryMB = Number.isFinite(o.memoryMB) ? o.memoryMB : DEFAULTS.memoryMB;
  const compare = o.compare === 'strict' ? 'strict' : 'loose';
  const stopTokens = Array.isArray(o.stopTokens) ? o.stopTokens : JS_STOP_TOKENS;
  const provider = o.provider == null ? 'ollama' : String(o.provider);
  const cell = typeof o.cell === 'function' ? o.cell : defaultCell;
  const baseSeed = o.seed === undefined || o.seed === null ? 'synth|' + prompt : String(o.seed);
  const budgetMs = Number.isFinite(o.budgetMs) && o.budgetMs > 0 ? o.budgetMs : Infinity;
  const elapsed = () => performance.now() - t0;

  const entry = IDENT.test(String(o.entry || '')) ? String(o.entry) : entryOf(prompt);
  const ex = extractAssertions(prompt, entry, { maxAssertions: o.maxAssertions });
  const assertions = ex.assertions;
  const shown = assertions.map((a) => ({ call: a.call, want: a.want, shape: a.shape }));
  const out = {
    completion: '', provenance: 'absent', candidates: [], passedExtracted: 0, extractedCount: assertions.length,
    calls: 0, ms: 0, entry: entry || null, extracted: shown, shapes: ex.shapes,
    keptIndex: -1, sampledKeptIndex: -1, reason: null,
  };
  if (!entry) { out.reason = 'the prompt declares no function'; out.ms = elapsed(); return out; }
  const harness = buildHarness(entry, assertions, compare);
  const testOpts = { harness, timeoutMs, memoryMB };

  const tried = new Map(); // code -> test, so a repeated candidate is not run twice
  const evaluate = async (raw) => {
    const safe = stopSafe(raw, stopTokens);
    let test = tried.get(safe.code);
    if (!test) { test = await testCandidate(safe.code, entry, assertions, testOpts); tried.set(safe.code, test); }
    return { code: safe.code, rawCode: raw, normalized: safe.changed, stopSafe: safe.safe, test };
  };

  if (provider === 'null') {
    const stub = 'function ' + entry + '() { return undefined; }';
    const c = { phase: 'null', index: 0, reached: true, seed: null, modelMs: 0, tokens: 0, ...(await evaluate(stub)) };
    c.endMs = elapsed();
    out.candidates.push(c);
    out.keptIndex = out.sampledKeptIndex = 0;
    out.completion = c.code;
    out.passedExtracted = c.test.passed;
    out.provenance = 'null';
    out.reason = 'provider null: no model was asked; the candidate is a function that returns undefined';
    out.ms = elapsed();
    return out;
  }

  let down = null;
  const draw = async (phase, index, p) => {
    if (elapsed() >= budgetMs) { down = 'the synthesis budget of ' + budgetMs + ' ms was spent'; return null; }
    const seed = seedOf(baseSeed + '|' + phase + '|' + index);
    const c = await cell({
      prompt: p, model: o.model, base: o.base, probeMs: Number.isFinite(o.probeMs) ? o.probeMs : DEFAULTS.probeMs,
      timeoutMs: Number.isFinite(o.modelTimeoutMs) ? o.modelTimeoutMs : DEFAULTS.modelTimeoutMs,
      maxTokens: Number.isFinite(o.maxTokens) ? o.maxTokens : DEFAULTS.maxTokens, seed, phase, index,
    });
    out.calls++;
    const reached = !!(c && c.ok);
    const row = { phase, index, seed, reached, modelMs: c && Number.isFinite(c.ms) ? c.ms : null, tokens: c && Number.isFinite(c.tokens) ? c.tokens : null };
    if (!reached) {
      down = (c && c.reason) || 'the model cell did not answer';
      Object.assign(row, { reason: down, code: '', rawCode: '', normalized: false, stopSafe: true, test: null });
    } else {
      Object.assign(row, await evaluate(codeFrom(c.text, entry)));
    }
    row.endMs = elapsed();
    out.candidates.push(row);
    return row;
  };

  for (let i = 0; i < k; i++) {
    const c = await draw('sample', i, samplePrompt(prompt));
    if (!c || !c.reached) break;
    if (passesAll(c)) break;
  }
  const sampled = out.candidates.slice();
  const keptSampled = pick(sampled);
  out.sampledKeptIndex = keptSampled ? out.candidates.indexOf(keptSampled) : -1;

  if (repair && keptSampled && !passesAll(keptSampled) && down === null) {
    // the failing candidates, distinct by code, most passes first: each repair prompt shows one
    const failing = [];
    const seenCode = new Set();
    for (const c of [...sampled].filter((x) => x.reached && x.code).sort((a, b) => (b.test.passed - a.test.passed) || ((b.test.loaded ? 1 : 0) - (a.test.loaded ? 1 : 0)))) {
      if (seenCode.has(c.code)) continue;
      seenCode.add(c.code);
      failing.push(c);
    }
    if (!failing.length) failing.push(keptSampled);
    for (let j = 0; j < repairK; j++) {
      const base = failing[j % failing.length];
      const c = await draw('repair', j, repairPrompt(prompt, base, assertions, timeoutMs));
      if (!c || !c.reached) break;
      if (passesAll(c)) break;
    }
  }

  const kept = pick(out.candidates);
  out.ms = elapsed();
  if (!kept) { out.reason = down || 'no candidate was produced'; return out; }
  out.keptIndex = out.candidates.indexOf(kept);
  out.completion = kept.code;
  out.passedExtracted = kept.test.passed;
  out.provenance = assertions.length > 0 && passesAll(kept) ? 'model+exact' : 'model';
  out.reason = down;
  return out;
}

/** The candidates list without code, for a journal or a verdict. */
export function summarize(cands) {
  return (cands || []).map((c) => ({
    phase: c.phase, index: c.index, reached: c.reached, modelMs: c.modelMs, tokens: c.tokens, endMs: Math.round((c.endMs || 0) * 100) / 100,
    chars: (c.code || '').length, normalized: !!c.normalized, stopSafe: c.stopSafe !== false,
    passed: c.test ? c.test.passed : null, of: c.test ? c.test.of : null, loaded: c.test ? c.test.loaded : null,
    timedOut: c.test ? c.test.timedOut : null, error: c.test && c.test.error ? String(c.test.error).slice(0, 160) : (c.reason ? String(c.reason).slice(0, 160) : null),
  }));
}
