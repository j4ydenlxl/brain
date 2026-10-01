// grow/contract.mjs: THE CELL CONTRACT (grow/CONTRACT.md). One function every part of the loop shares:
// validateCell(source, mod) says whether a module is a cell the organism may run, and why not.
// Author: Fable 5.1 orchestrator, 2026-09-30 (his Day 1 order in NEXT-WEEK.md).
export const CONTRACT_VERSION = 1;
export const ID_RE = /^[a-z0-9][a-z0-9-]{2,63}$/;
export const MAX_SOURCE_BYTES = 512 * 1024;
export const REFUSAL_RE = /^(?:nothing in memory matches|I do not carry that yet|I am growing a cell)/i;
export const FORBIDDEN = Object.freeze([
  [/\brequire\s*\(/, 'require()'],
  [/\bimport\s*\(/, 'dynamic import()'],
  [/\bfetch\s*\(/, 'fetch()'],
  [/\bprocess\b/, 'process'],
  [/\beval\s*\(/, 'eval()'],
  [/\bnew\s+Function\b/, 'new Function'],
  [/\bsetTimeout\b|\bsetInterval\b|\bsetImmediate\b/, 'a timer'],
  [/\bXMLHttpRequest\b|\bWebSocket\b/, 'a socket'],
  [/\bglobalThis\b/, 'globalThis'],
]);
const IMPORT_RE = /^\s*import\s+(?:[^'"]+?\s+from\s+)?['"]([^'"]+)['"]/gm;
const EXPORT_RE = /^\s*export\s+(?:async\s+)?(?:const|let|var|function\*?|class)\s+([A-Za-z_$][\w$]*)/gm;

/** Every import specifier of an ES module source, in order. */
export function importsOf(source) {
  const out = [];
  for (const m of String(source).matchAll(IMPORT_RE)) out.push(m[1]);
  return out;
}

function exportsNamed(src, n) {
  return new RegExp('export\\s*\\{[^}]*\\b' + n + '\\b[^}]*\\}').test(src);
}

/**
 * Validate a cell: its source (the text of cell.mjs) and, when given, its evaluated module namespace.
 * @param {string} source the text of cell.mjs
 * @param {object|null} mod the imported module, or null to check the source alone
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateCell(source, mod = null) {
  const errors = [];
  const src = String(source ?? '');
  if (!src.trim()) errors.push('the source is empty');
  if (Buffer.byteLength(src) > MAX_SOURCE_BYTES) errors.push('the source is over ' + MAX_SOURCE_BYTES + ' bytes');
  for (const spec of importsOf(src)) {
    if (!spec.startsWith('./') || spec.includes('..')) errors.push('import "' + spec + '" is not a relative file in the cell directory');
  }
  for (const [re, what] of FORBIDDEN) if (re.test(src)) errors.push('the source uses ' + what);
  const names = new Set([...src.matchAll(EXPORT_RE)].map((m) => m[1]));
  for (const n of ['meta', 'can', 'answer', 'examples']) if (!names.has(n) && !exportsNamed(src, n)) errors.push('no export named ' + n);
  if (mod) {
    const meta = mod.meta;
    if (!meta || typeof meta !== 'object') errors.push('meta is not an object');
    else {
      if (!ID_RE.test(String(meta.id ?? ''))) errors.push('meta.id does not match ' + ID_RE);
      if (typeof meta.class !== 'string' || !meta.class.trim()) errors.push('meta.class is not a word');
      if (!Number.isInteger(meta.generation) || meta.generation < 1) errors.push('meta.generation is not an integer from 1');
      if (typeof meta.lane !== 'string' || !meta.lane.trim()) errors.push('meta.lane is not a word');
      if (!Array.isArray(meta.grownFrom) || !meta.grownFrom.every((s) => typeof s === 'string')) errors.push('meta.grownFrom is not a list of prompts');
      if (meta.version !== CONTRACT_VERSION) errors.push('meta.version is not ' + CONTRACT_VERSION);
    }
    if (typeof mod.can !== 'function') errors.push('can is not a function');
    if (typeof mod.answer !== 'function') errors.push('answer is not a function');
    if (!Array.isArray(mod.examples) || !mod.examples.length) errors.push('examples is not a non-empty list');
    else for (const [i, ex] of mod.examples.entries()) {
      if (!ex || typeof ex.q !== 'string' || !ex.q.length) { errors.push('examples[' + i + '].q is not a string'); continue; }
      if (!ex.expect || typeof ex.expect !== 'object') errors.push('examples[' + i + '].expect is not an object');
      if (typeof mod.can === 'function') {
        let c = null;
        try { c = mod.can(ex.q); } catch (e) { errors.push('can threw on examples[' + i + ']: ' + String(e && e.message || e)); }
        if (c !== true) errors.push('can(examples[' + i + '].q) is not true');
      }
      if (typeof mod.answer === 'function') {
        let a = null;
        try { a = mod.answer(ex.q); } catch (e) { errors.push('answer threw on examples[' + i + ']: ' + String(e && e.message || e)); }
        if (typeof a !== 'string' || !a.trim()) errors.push('answer(examples[' + i + '].q) is not a non-empty string');
        else if (REFUSAL_RE.test(a)) errors.push('answer(examples[' + i + '].q) is a refusal');
      }
    }
  }
  return { ok: errors.length === 0, errors };
}

/** What test.mjs may import besides ./x.mjs files of its own directory (node:fs reads inside that directory only). */
export const TEST_IMPORTS = Object.freeze(['node:test', 'node:assert', 'node:assert/strict', 'node:fs', 'node:path', 'node:url']);
/** test.mjs may patch globals (a fake Date) and use timers (its 30 s budget bounds them); everything else of FORBIDDEN binds. */
export const TEST_FORBIDDEN = Object.freeze(FORBIDDEN.filter(([, what]) => what !== 'a timer' && what !== 'globalThis'));

/**
 * Validate a cell's test.mjs by its source: it imports ./cell.mjs, nothing outside its directory but TEST_IMPORTS,
 * and never names process (no exit code of its own), require, dynamic import, fetch, eval or a socket. Its
 * pass/fail count is read by the probe from node's own reporter file, never from what the file prints.
 * @param {string} source the text of test.mjs
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateTest(source) {
  const errors = [];
  const src = String(source ?? '');
  if (!src.trim()) errors.push('test.mjs is empty');
  if (Buffer.byteLength(src) > MAX_SOURCE_BYTES) errors.push('test.mjs is over ' + MAX_SOURCE_BYTES + ' bytes');
  const specs = importsOf(src);
  if (!specs.includes('./cell.mjs')) errors.push('test.mjs does not import ./cell.mjs');
  for (const spec of specs) {
    if (TEST_IMPORTS.includes(spec) || (spec.startsWith('./') && !spec.includes('..'))) continue;
    errors.push('test.mjs imports "' + spec + '": only ./x.mjs of its directory, ' + TEST_IMPORTS.join(', '));
  }
  for (const [re, what] of TEST_FORBIDDEN) if (re.test(src)) errors.push('test.mjs uses ' + what);
  return { ok: errors.length === 0, errors };
}

/** Parse one JSONL text into rows, skipping blank lines; a bad line throws with its number. */
export function parseJsonl(text) {
  const rows = [];
  String(text ?? '').split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    try { rows.push(JSON.parse(line)); } catch (e) { throw new Error('line ' + (i + 1) + ' is not JSON: ' + String(e && e.message || e)); }
  });
  return rows;
}
