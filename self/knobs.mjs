// self/knobs.mjs: THE KNOBS OF A SOURCE FILE, READ WITHOUT EDITING IT (Board 14, item operators).
//
// His order of 2026-09-24 12:02: "Its gotta work without me. Thats the most important part. EVERY
// GAP should be able to be filled by itself, ur just the engineer to author it". A gap is a number
// the organism printed and a bar it did not reach. Before any operator can turn a number toward a
// bar it has to know which numbers in the source it may turn and how far. This file is that list.
//
// A KNOB is one of:
//
//   1. a top-level constant whose trailing comment starts with the word "knob":
//        export const NAME = <number>; // knob [lo, hi] step
//        const NAME = <number>;        // knob [lo, hi]        (step: 10 percent of the value)
//        const NAME = <number>;        // knob                 (band 0.7x to 1.5x, step 10 percent)
//      top-level means the declaration starts in column 0; an indented const is a local, never a knob.
//   2. every numeric field at the top level of an exported object named DEFAULTS, OPTIONS, CONFIG or
//      LIMITS (Object.freeze({...}) or a plain literal): band 0.7x to 1.5x of the value, step 10
//      percent. Nested objects, strings, booleans, null and expressions are not knobs.
//
// The band of a knob is fixed by the value AS READ (the real tree's value), so a search that steps a
// knob on a copy can never walk the band along with it. An integer knob (value and band integers)
// keeps integer steps of at least 1. A knob whose value is 0 has no multiplicative band and is
// listed as frozen. A comment that starts "knob [" but does not parse is listed as malformed, never
// guessed at.
//
//   node self/knobs.mjs <file> [<file> ...] [--json]
//   node self/knobs.mjs --gap <id> [--gaps state/self/gaps.jsonl] [--json]
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const KNOB_OBJECTS = Object.freeze(['DEFAULTS', 'OPTIONS', 'CONFIG', 'LIMITS']);
export const DEFAULT_BAND = Object.freeze([0.7, 1.5]);
export const DEFAULT_STEP_FRAC = 0.1;

const NUM_SRC = '-?(?:\\d[\\d_]*(?:\\.[\\d_]*)?|\\.\\d[\\d_]*)(?:[eE][-+]?\\d+)?';
const NUM_RE = new RegExp('^' + NUM_SRC + '$');
const CONST_RE = new RegExp('^(export\\s+)?const\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*(' + NUM_SRC + ')\\s*;?\\s*\\/\\/\\s*(.*)$');
const OBJ_RE = new RegExp('^export\\s+const\\s+(' + KNOB_OBJECTS.join('|') + ')\\s*=\\s*(?:Object\\.freeze\\s*\\(\\s*)?\\{', 'm');

/** A numeric literal as a number: numeric separators dropped. */
export function numOf(lit) {
  const s = String(lit).replaceAll('_', '');
  return NUM_RE.test(String(lit)) ? Number(s) : NaN;
}
const isInt = (x) => Number.isInteger(x);
const r6 = (x) => Number(Number(x).toPrecision(12));

/**
 * The band and step of a knob from its value and its comment's grammar. An integer knob is one
 * whose LITERAL is written as an integer (no point, no exponent): 1.0 is a real knob, 1 is not.
 * @returns {{lo, hi, step, integer, form, frozen, malformed, reason}}
 */
export function bandOf(value, comment = null, literal = null) {
  const c = comment === null ? null : String(comment).trim();
  let lo = null, hi = null, step = null, form = 'default', malformed = null;
  if (c !== null) {
    const m = c.match(new RegExp('^knob\\b\\s*(?:\\[\\s*(' + NUM_SRC + ')\\s*,\\s*(' + NUM_SRC + ')\\s*\\])?\\s*(' + NUM_SRC + ')?'));
    if (!m) return { malformed: 'the comment does not start with the word knob' };
    if (/^knob\b\s*\[/.test(c) && m[1] === undefined) malformed = 'the band after "knob [" does not parse as [lo, hi]';
    if (m[1] !== undefined) { lo = numOf(m[1]); hi = numOf(m[2]); form = 'band'; }
    if (m[3] !== undefined) { step = numOf(m[3]); form = form === 'band' ? 'band+step' : 'step'; }
  }
  if (malformed) return { lo: null, hi: null, step: null, integer: false, form: 'malformed', frozen: true, malformed, reason: malformed };
  if (lo === null) {
    const a = value * DEFAULT_BAND[0], b = value * DEFAULT_BAND[1];
    lo = Math.min(a, b); hi = Math.max(a, b);
  }
  if (lo > hi) return { lo, hi, step, integer: false, form: 'malformed', frozen: true, malformed: 'the band [' + lo + ', ' + hi + '] is empty', reason: 'the band is empty' };
  const intLit = literal === null ? true : !/[.eE]/.test(String(literal));
  const integer = intLit && isInt(value) && (form === 'default' || form === 'step' || (isInt(lo) && isInt(hi)));
  if (integer && form !== 'band' && form !== 'band+step') { lo = Math.ceil(r6(lo)); hi = Math.floor(r6(hi)); }
  if (step === null) step = Math.abs(value) * DEFAULT_STEP_FRAC || (hi - lo) * DEFAULT_STEP_FRAC;
  if (integer) step = Math.max(1, Math.round(step));
  step = r6(step);
  const frozen = !(step > 0) || hi === lo;
  return { lo: r6(lo), hi: r6(hi), step, integer, form, frozen, malformed: null, reason: frozen ? (value === 0 && form === 'default' ? 'a knob of 0 has no multiplicative band' : 'the band holds one value') : null };
}

// ------------------------------------------------------------------ the object scanner
/**
 * The top-level numeric fields of the object literal whose "{" is at text[open]: skips strings,
 * template literals, comments and nested brackets. Returns [{field, literal, start, end}] with
 * start/end the literal's character offsets in text, and close, the offset of the matching "}".
 */
export function objectFields(text, open) {
  const out = [];
  let depth = 0, i = open;
  const n = text.length;
  let expectKey = true, key = null, keyEnd = -1;
  while (i < n) {
    const ch = text[i];
    if (ch === '/' && text[i + 1] === '/') { const e = text.indexOf('\n', i); i = e < 0 ? n : e; continue; }
    if (ch === '/' && text[i + 1] === '*') { const e = text.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
    if (ch === '"' || ch === "'" || ch === '`') {
      const q = ch; let j = i + 1;
      while (j < n && text[j] !== q) { if (text[j] === '\\') j++; j++; }
      if (depth === 1 && expectKey) { key = text.slice(i + 1, j); keyEnd = j + 1; expectKey = false; }
      i = j + 1; continue;
    }
    if (ch === '{' || ch === '[' || ch === '(') { depth++; i++; if (depth === 1) expectKey = true; continue; }
    if (ch === '}' || ch === ']' || ch === ')') { depth--; i++; if (depth === 0) return { fields: out, close: i - 1 }; continue; }
    if (depth === 1) {
      if (ch === ',') { expectKey = true; key = null; i++; continue; }
      if (expectKey && /[A-Za-z_$]/.test(ch)) {
        let j = i; while (j < n && /[\w$]/.test(text[j])) j++;
        key = text.slice(i, j); keyEnd = j; expectKey = false; i = j; continue;
      }
      if (ch === ':' && key !== null && keyEnd >= 0) {
        let j = i + 1; while (j < n && /[ \t]/.test(text[j])) j++;
        const m = text.slice(j).match(new RegExp('^(' + NUM_SRC + ')'));
        if (m) {
          const end = j + m[1].length;
          let k = end; while (k < n && /[ \t]/.test(text[k])) k++;
          // a literal ends the value: a comma, the closing brace, a newline or a comment
          if (k >= n || text[k] === ',' || text[k] === '}' || text[k] === '\n' || text[k] === '\r' || text.startsWith('//', k) || text.startsWith('/*', k)) {
            out.push({ field: key, literal: m[1], start: j, end });
          }
        }
        key = null; keyEnd = -1; i++; continue;
      }
    }
    i++;
  }
  return { fields: out, close: -1 };
}

const lineAt = (text, off) => { let l = 1; for (let i = 0; i < off; i++) if (text.charCodeAt(i) === 10) l++; return l; };

/**
 * Every knob in one source text.
 * @param {string} text the file's contents
 * @param {{file?: string}} [o] the file's path relative to the brain, carried on every knob
 * @returns {Array<object>} {id, file, kind, name, object, field, line, literal, start, end, value, lo, hi, step, integer, form, frozen, malformed, reason}
 */
export function parseKnobs(text, { file = null } = {}) {
  const src = String(text);
  const out = [];
  // 1. constants with a knob comment, declared in column 0
  let off = 0;
  const lines = src.split('\n');
  for (let li = 0; li < lines.length; li++) {
    const raw = lines[li].replace(/\r$/, '');
    const m = raw.match(CONST_RE);
    if (m && /^knob\b/.test(m[4].trim())) {
      const value = numOf(m[3]);
      const b = bandOf(value, m[4], m[3]);
      const litAt = raw.indexOf(m[3], raw.indexOf('=') + 1);
      out.push({
        id: (file || '') + '#' + m[2], file, kind: 'const', name: m[2], object: null, field: null, exported: !!m[1], line: li + 1,
        literal: m[3], start: off + litAt, end: off + litAt + m[3].length, value, ...b, comment: m[4].trim(),
      });
    }
    off += lines[li].length + 1;
  }
  // 2. numeric fields of exported DEFAULTS / OPTIONS / CONFIG / LIMITS
  const re = new RegExp(OBJ_RE.source, 'gm');
  let m;
  while ((m = re.exec(src)) !== null) {
    const open = m.index + m[0].length - 1;
    const { fields } = objectFields(src, open);
    for (const f of fields) {
      const value = numOf(f.literal);
      if (!Number.isFinite(value)) continue;
      const b = bandOf(value, null, f.literal);
      out.push({
        id: (file || '') + '#' + m[1] + '.' + f.field, file, kind: 'field', name: m[1] + '.' + f.field, object: m[1], field: f.field, exported: true,
        line: lineAt(src, f.start), literal: f.literal, start: f.start, end: f.end, value, ...b, comment: null,
      });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

/** The knobs of one file under root (relative path). A missing file is an empty list with a reason. */
export function knobsOf(rel, { root = ROOT } = {}) {
  const abs = path.resolve(root, rel);
  if (!existsSync(abs)) return { file: rel, knobs: [], reason: 'no such file' };
  return { file: rel, knobs: parseKnobs(readFileSync(abs, 'utf8'), { file: rel.replaceAll('\\', '/') }), reason: null };
}

/** The knobs of a gap: every file on its files list, in order. */
export function knobsForGap(gap, { root = ROOT } = {}) {
  const files = Array.isArray(gap && gap.files) ? gap.files : [];
  const per = files.map((f) => knobsOf(f, { root }));
  return { gap: gap && gap.id, files: per, knobs: per.flatMap((p) => p.knobs) };
}

/** Format a value the way its literal was written: an integer knob stays an integer. */
export function formatValue(value, knob) {
  if (knob && knob.integer) return String(Math.round(value));
  const v = r6(value);
  return String(v);
}

/**
 * The text with one knob set to a new value. Refused (ok false) when the value is outside the
 * knob's band, when the knob is frozen or malformed, or when the text at the knob's offsets is not
 * the literal it was read as (the file changed under the reader).
 */
export function setKnob(text, knob, value) {
  if (!knob) return { ok: false, reason: 'no knob' };
  if (knob.malformed) return { ok: false, reason: 'the knob ' + knob.name + ' is malformed: ' + knob.malformed };
  if (knob.frozen) return { ok: false, reason: 'the knob ' + knob.name + ' is frozen: ' + (knob.reason || 'no step') };
  if (!Number.isFinite(value)) return { ok: false, reason: 'the value is not a finite number' };
  const eps = Math.abs(knob.step) * 1e-9;
  if (value < knob.lo - eps || value > knob.hi + eps) return { ok: false, band: true, reason: 'the value ' + value + ' is outside the band [' + knob.lo + ', ' + knob.hi + '] of ' + knob.name };
  const src = String(text);
  if (src.slice(knob.start, knob.end) !== knob.literal) return { ok: false, reason: 'the text at ' + knob.name + ' is no longer the literal ' + knob.literal };
  const lit = formatValue(value, knob);
  return { ok: true, text: src.slice(0, knob.start) + lit + src.slice(knob.end), literal: lit };
}

/**
 * A unified diff from text a to text b for the file rel. One hunk per run of changed lines with up
 * to `context` lines around it; when the line counts differ, one hunk spanning the common prefix and
 * suffix. The output applies with self/code.mjs applyUnifiedPatch.
 */
export function unifiedDiff(rel, a, b, { context = 2 } = {}) {
  const A = String(a).split(/\r?\n/), B = String(b).split(/\r?\n/);
  const head = ['--- a/' + rel, '+++ b/' + rel];
  const hunks = [];
  if (A.length === B.length) {
    const changed = [];
    for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) changed.push(i);
    if (!changed.length) return null;
    let s = 0;
    while (s < changed.length) {
      let e = s;
      while (e + 1 < changed.length && changed[e + 1] - changed[e] <= 2 * context + 1) e++;
      const from = Math.max(0, changed[s] - context), to = Math.min(A.length - 1, changed[e] + context);
      const body = [];
      for (let i = from; i <= to; i++) {
        if (A[i] === B[i]) body.push(' ' + A[i]);
        else { body.push('-' + A[i]); }
        if (A[i] !== B[i]) body.push('+' + B[i]);
      }
      // regroup: every "-" of a run before its "+" lines
      const regrouped = [];
      let minus = [], plus = [];
      for (const l of body) {
        if (l[0] === '-') minus.push(l); else if (l[0] === '+') plus.push(l);
        else { regrouped.push(...minus, ...plus, l); minus = []; plus = []; }
      }
      regrouped.push(...minus, ...plus);
      const n = to - from + 1;
      hunks.push('@@ -' + (from + 1) + ',' + n + ' +' + (from + 1) + ',' + n + ' @@', ...regrouped);
      s = e + 1;
    }
  } else {
    let p = 0; while (p < A.length && p < B.length && A[p] === B[p]) p++;
    let q = 0; while (q < A.length - p && q < B.length - p && A[A.length - 1 - q] === B[B.length - 1 - q]) q++;
    const from = Math.max(0, p - context);
    const aEnd = Math.min(A.length, A.length - q + context), bEnd = Math.min(B.length, B.length - q + context);
    const body = [];
    for (let i = from; i < p; i++) body.push(' ' + A[i]);
    for (let i = p; i < A.length - q; i++) body.push('-' + A[i]);
    for (let i = p; i < B.length - q; i++) body.push('+' + B[i]);
    for (let i = A.length - q; i < aEnd; i++) body.push(' ' + A[i]);
    hunks.push('@@ -' + (from + 1) + ',' + (aEnd - from) + ' +' + (from + 1) + ',' + (bEnd - from) + ' @@', ...body);
  }
  return [...head, ...hunks].join('\n') + '\n';
}

/** The files a unified diff touches (the +++ side, else the --- side), relative, a/ b/ stripped. */
export function filesOfDiff(patch) {
  const out = [];
  let from = null;
  for (const l of String(patch || '').split(/\r?\n/)) {
    if (l.startsWith('--- ')) from = l.slice(4).split('\t')[0].trim().replace(/^[ab]\//, '');
    else if (l.startsWith('+++ ')) {
      let to = l.slice(4).split('\t')[0].trim();
      to = to === '/dev/null' ? from : to.replace(/^[ab]\//, '');
      if (to && !out.includes(to)) out.push(to);
      from = null;
    }
  }
  return out;
}

/** Lines a unified diff adds or removes (headers excluded). */
export function changedLines(patch) {
  let n = 0;
  for (const l of String(patch || '').split(/\r?\n/)) {
    if (l.startsWith('+++ ') || l.startsWith('--- ')) continue;
    if (l.startsWith('+') || l.startsWith('-')) n++;
  }
  return n;
}

/** Read a gaps ledger (JSON lines); a missing file is an empty list. */
export function readGaps(file) {
  if (!existsSync(file)) return [];
  const out = [];
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    try { out.push(JSON.parse(line)); } catch { /* a torn line is not a gap */ }
  }
  return out;
}

export function knobLine(k) {
  return k.name.padEnd(28) + ' ' + String(k.literal).padStart(10) + '  line ' + String(k.line).padEnd(5)
    + (k.malformed ? ' MALFORMED: ' + k.malformed : k.frozen ? ' frozen (' + k.reason + ')' : ' band [' + k.lo + ', ' + k.hi + '] step ' + k.step + (k.integer ? ' integer' : '') + '  ' + k.form);
}

// ------------------------------------------------------------------ CLI
function main(argv) {
  const json = argv.includes('--json');
  const gi = argv.indexOf('--gap');
  const gf = argv.indexOf('--gaps');
  let groups;
  if (gi >= 0) {
    const ledger = gf >= 0 ? path.resolve(argv[gf + 1]) : path.join(ROOT, 'state', 'self', 'gaps.jsonl');
    const gap = readGaps(ledger).find((g) => String(g.id) === String(argv[gi + 1]));
    if (!gap) { console.log('no gap ' + argv[gi + 1] + ' in ' + ledger); process.exitCode = 1; return; }
    groups = knobsForGap(gap).files;
  } else {
    const files = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && (argv[i - 1] === '--gaps')));
    if (!files.length) { console.log('usage: node self/knobs.mjs <file> [...] [--json] | --gap <id> [--gaps FILE]'); return; }
    groups = files.map((f) => knobsOf(f));
  }
  if (json) { console.log(JSON.stringify(groups, null, 2)); return; }
  for (const g of groups) {
    console.log(g.file + ': ' + g.knobs.length + ' knob(s)' + (g.reason ? ' (' + g.reason + ')' : ''));
    for (const k of g.knobs) console.log('  ' + knobLine(k));
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
