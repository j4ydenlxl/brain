// tools/docs-numbers.mjs: no document may publish a number that no command printed.
//
// For every markdown file under docs/ this reads every number that reads as a measurement
// (a count, a percentage, a duration, a byte size, a factor, a score) and checks that the
// same value is in docs/NUMBERS.md or in one of bench/verdicts/*.json. Numbers that are not
// measurements are skipped by a NAMED RULE, never by hand: dates and years, section and list
// and source references, table row indexes, ISEF form names like Form 1A, code labels like
// BSL-2, version strings, anything inside a URL or inline code, and numbers inside a quoted
// passage (a rule quoted from a source is that source's constant, not our measurement).
// Everything the rules do not name is a measurement and must be protected, or the file is
// reported and the tool exits 1.
//
// Run: node tools/docs-numbers.mjs            (every markdown file under docs/, read off the
//                                              directory, minus the generated NUMBERS.md)
//      node tools/docs-numbers.mjs <file.md>  (any file, for a fixture)
//      node tools/docs-numbers.mjs --json
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ------------------------------------------------------------------ the allowlist
// One entry per value per document, each with the reason it is not a measurement of this
// build. An allowlisted number is still reported in the "allowed" count, so the list cannot
// grow silently.
export const ALLOWLIST = [
  { doc: 'ISEF.md', value: '12', why: 'ISEF rule constant: the research window is 12 continuous months (Rules for All Projects), not a measurement of this build' },
  { doc: 'ISEF.md', value: '20', why: 'ISEF rule constant: a finalist must not have reached age 20 on or before May 1 preceding ISEF' },
  { doc: 'ISEF.md', value: '21', why: 'the fair-local age number quoted from research/batch-1.md item 16 in order to correct it against the ISEF rule' },
  { doc: 'ISEF.md', value: '100', why: 'Grand Award Judging Criteria: every project is scored out of 100 points; a published rubric constant' },
  { doc: 'ISEF.md', value: '10', why: 'Grand Award Judging Criteria weight for Research Question; a published rubric constant' },
  { doc: 'ISEF.md', value: '15', why: 'Grand Award Judging Criteria weight for Design and Methodology; a published rubric constant' },
  { doc: 'ISEF.md', value: '35', why: 'Grand Award Judging Criteria weight for Presentation; a published rubric constant' },
  { doc: 'ISEF.md', value: '8', why: 'gate policy constant read from core/gate.mjs: edge.grow is approved at coActivations >= 8; a configured threshold, not a result' },
  { doc: 'ISEF.md', value: '5,000', why: 'his vision target quoted from MANUAL.md section A (5,000 nodes), a goal the build is measured against, not a measurement' },
  { doc: 'ISEF.md', value: '5,000,000', why: 'his vision target quoted from MANUAL.md section A (5,000,000 lines), a goal the build is measured against, not a measurement' },
  { doc: 'ISEF-REGISTRATION.md', value: '12', why: 'ISEF rule constant: 12 continuous months of research' },
  { doc: 'ISEF-REGISTRATION.md', value: '250', why: 'ISEF rule constant: the abstract is capped at 250 words' },
  { doc: 'ISEF-REGISTRATION.md', value: '1', why: 'ISEF form name (Form 1) and the numbered path steps, both naming things rather than measuring' },
  { doc: 'PORTFOLIO.md', value: '9.11', why: 'the frontier-model comparison 9.11 vs 9.9 used as an example; test/cli.test.mjs asserts the exact comparison and test/cells.test.mjs tokenises it' },
  { doc: 'WHOLE.md', value: '20,000', why: 'daemon/run.mjs default selfEvery: 20_000, a configured period, not a result' },
  { doc: 'WHOLE.md', value: '100,000', why: 'daemon/run.mjs default genEvery: 100_000, a configured period, not a result' },
  { doc: 'ARCHITECTURE.md', value: '1503.07469', why: 'an arXiv identifier cited from research/batch-1.md, a name not a number' },
  { doc: 'ARCHITECTURE.md', value: '138,639', why: 'FlyWire v783 neuron count quoted from research/batch-1.md item 14, a published figure about another system' },
  { doc: 'ARCHITECTURE.md', value: '15,091,983', why: 'FlyWire v783 synapse count quoted from research/batch-1.md item 14, a published figure about another system' },
];

const MONTHS = /(january|february|march|april|may|june|july|august|september|october|november|december)/i;
const REF_WORDS = /(section|sections|item|items|point|points|rule|rules|quote|quotes|candidate|step|steps|figure|table|row|rows|note|notes|part|chapter|appendix|source|sources|form|grade|grades|tier|phase)\s*$/i;

// ------------------------------------------------------------------ known values
export function knownValues(root = ROOT) {
  const strings = new Set();
  const nums = [];
  const push = (n) => { if (Number.isFinite(n)) nums.push(n); };

  const numbersMd = path.join(root, 'docs', 'NUMBERS.md');
  let md = '';
  try { md = readFileSync(numbersMd, 'utf8'); } catch { md = ''; }
  for (const line of md.split('\n')) {
    const cells = line.split('|').map((s) => s.trim());
    if (cells.length < 5) continue;
    if (cells[1] === 'docs-numbers') continue; // same reason as below: never read our own report back
    const v = cells[3];
    if (!v || !/^-?\d/.test(v)) continue;
    strings.add(v);
    push(Number(v));
  }

  const dir = path.join(root, 'bench', 'verdicts');
  // docs-numbers.json is this tool's own report. Reading it back would let a document be
  // protected by a count of how many documents were protected, which proves nothing, so it
  // is the one verdict file excluded from the known values.
  let names = [];
  try { names = readdirSync(dir).filter((n) => n.endsWith('.json') && n !== 'docs-numbers.json'); } catch { names = []; }
  for (const name of names) {
    let text;
    try { text = readFileSync(path.join(dir, name), 'utf8'); } catch { continue; }
    for (const m of text.matchAll(/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g)) { strings.add(m[0]); push(Number(m[0])); }
  }
  nums.sort((a, b) => a - b);
  return { strings, nums };
}

function anyInRange(nums, lo, hi) {
  let lowIdx = 0, high = nums.length;
  while (lowIdx < high) { const mid = (lowIdx + high) >> 1; if (nums[mid] < lo) lowIdx = mid + 1; else high = mid; }
  return lowIdx < nums.length && nums[lowIdx] <= hi;
}

// A document value is protected when a verdict carries that exact value, or carries a value
// that rounds to it at the precision the document wrote it with (a document is allowed to
// round 5.6912 to 5.69, it is not allowed to invent 5.7 out of nothing).
export function isProtected(token, known) {
  const bare = token.replace(/,/g, '');
  if (known.strings.has(bare) || known.strings.has(token)) return true;
  const x = Number(bare);
  if (!Number.isFinite(x)) return false;
  const dot = bare.indexOf('.');
  const decimals = dot < 0 ? 0 : bare.length - dot - 1;
  const half = 0.5 * Math.pow(10, -decimals);
  return anyInRange(known.nums, x - half, x + half + Number.EPSILON * Math.abs(x));
}

// ------------------------------------------------------------------ masking
// Numbers inside code spans, fenced code, URLs and markdown link targets are never prose
// measurements; blank them out so the scanner never sees them.
export function maskLines(text) {
  const lines = text.split('\n');
  const out = [];
  let fenced = false;
  for (const raw of lines) {
    if (/^\s*```/.test(raw)) { fenced = !fenced; out.push(''.padEnd(raw.length, ' ')); continue; }
    if (fenced) { out.push(''.padEnd(raw.length, ' ')); continue; }
    let line = raw;
    const blank = (m) => ' '.repeat(m.length);
    line = line.replace(/`[^`]*`/g, blank);
    line = line.replace(/\bv?\d+\.\d+\.\d+\b/g, blank); // version strings are names, not measurements
    line = line.replace(/<https?:\/\/[^>\s]*>/g, blank);
    line = line.replace(/https?:\/\/\S+/g, blank);
    line = line.replace(/\]\([^)]*\)/g, blank);
    out.push(line);
  }
  return out;
}

// ------------------------------------------------------------------ the rules
// Returns the name of the rule that says this number is not a measurement, or null.
export function skipRule(line, masked, index, token) {
  const before = masked.slice(Math.max(0, index - 30), index);
  const after = masked.slice(index + token.length, index + token.length + 8);
  const bare = token.replace(/,/g, '');
  const n = Number(bare);
  const isInt = /^\d+$/.test(bare);

  if (/(arxiv|doi|isbn)[:\s]+$/i.test(before)) return 'citation-identifier';
  if (/[A-Za-z]$/.test(before) && !/\s$/.test(before)) return 'code-label';
  if (/^[A-Z]/.test(after)) return 'code-label';
  if (/^\s*#{1,6}\s*$/.test(masked.slice(0, index))) return 'heading-number';
  if (/^\s*$/.test(masked.slice(0, index)) && /^[.)]\s/.test(after)) return 'list-marker';
  if (/^\|\s*$/.test(masked.slice(0, index)) && /^\s*\|/.test(after)) return 'table-row-index';
  if (REF_WORDS.test(before)) return 'cross-reference';
  if (isInt && n >= 1900 && n <= 2100 && !token.includes(',')) return 'year';
  if (MONTHS.test(line) && isInt && n >= 1 && n <= 31) return 'date';
  if (/^\d{4}-\d{2}-\d{2}/.test(masked.slice(index, index + 10)) || /\d{4}-\d{2}-$/.test(before) || /\d{4}-$/.test(before)) return 'date';
  const quoted = quotedSpans(masked);
  if (quoted.some(([a, b]) => index >= a && index < b)) return 'quoted-source';
  return null;
}

function quotedSpans(line) {
  const spans = [];
  let open = -1;
  for (let i = 0; i < line.length; i++) {
    if (line[i] !== '"') continue;
    if (open < 0) open = i; else { spans.push([open, i + 1]); open = -1; }
  }
  return spans;
}

// ------------------------------------------------------------------ the check
export function checkDoc(file, known, allowlist = ALLOWLIST) {
  const base = path.basename(file);
  const text = readFileSync(file, 'utf8');
  const masked = maskLines(text);
  const raw = text.split('\n');
  const allowed = new Map();
  for (const a of allowlist) if (a.doc === base) allowed.set(a.value.replace(/,/g, ''), a.why);

  // weakProtected: a protected value that is a small integer. bench/verdicts carries enough
  // small integers that such a match can be a coincidence rather than a citation, so the
  // count is printed instead of being quietly folded into "protected".
  const result = { doc: base, file, protected: 0, weakProtected: 0, unprotected: 0, skipped: 0, allowed: 0, misses: [], skips: {} };
  for (let i = 0; i < masked.length; i++) {
    const line = masked[i];
    for (const m of line.matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
      const token = m[0].replace(/,$/, '');
      const rule = skipRule(raw[i], line, m.index, token);
      if (rule) { result.skipped++; result.skips[rule] = (result.skips[rule] || 0) + 1; continue; }
      // A measurement wins over the allowlist: the allowlist only ever absorbs a value that
      // nothing in bench/verdicts measured, so an entry can never hide a real number.
      if (isProtected(token, known)) {
        result.protected++;
        const bare = token.replace(/,/g, '');
        if (/^\d+$/.test(bare) && Number(bare) < 1000) result.weakProtected++;
        continue;
      }
      if (allowed.has(token.replace(/,/g, ''))) { result.allowed++; continue; }
      result.unprotected++;
      result.misses.push({ line: i + 1, value: token, text: raw[i].trim().slice(0, 120) });
    }
  }
  return result;
}

// The document set is read off the directory, never typed. A hand-written list is correct on
// the day it is typed and silently stops covering the population the moment somebody adds a
// document: the new file would be unchecked and the tool would still print a clean run, which
// is the worst possible failure for a checker. NUMBERS.md is the generated index this tool
// reads as evidence, so it is the one exclusion, and it is excluded by name here rather than
// by a pattern so that the exclusion is visible.
export const GENERATED_DOCS = ['NUMBERS.md'];

// LOG.md is the append-only session log (moved under docs/ on 2026-09-23 under P9). Each of its
// lines quotes the values a command printed ON THAT DATE, and later runs overwrite the verdict
// files those values came from, so an older line stops matching any live verdict (the test
// "printed by an earlier run and then overwritten" is the right stance for a publication
// document, and the wrong one for a dated history). The log is still read and counted: its
// count is printed on every run as history=, it is never listed line by line, and it does not
// fail the tool. Named here by file, with the reason, so the exclusion is visible and cannot
// grow by pattern. Measured 2026-09-23 18:35: 191 of its numbers no longer matched a live verdict.
export const HISTORY_DOCS = [
  { doc: 'LOG.md', why: 'append-only session log; each line quotes the values as printed on its date, and later runs overwrite the verdicts those values came from' },
];
export const isHistory = (base) => HISTORY_DOCS.some((h) => h.doc === base);

export function defaultDocs(root = ROOT) {
  let names = [];
  try { names = readdirSync(path.join(root, 'docs')); } catch { names = []; }
  return names.filter((n) => n.endsWith('.md') && !GENERATED_DOCS.includes(n)).sort();
}

export function run(files, known = knownValues()) {
  return files.map((f) => checkDoc(f, known));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const given = args.filter((a) => !a.startsWith('--'));
  const files = given.length ? given.map((a) => path.resolve(a)) : defaultDocs().map((d) => path.join(ROOT, 'docs', d));
  const results = run(files);
  if (json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    for (const r of results) {
      if (isHistory(r.doc)) {
        console.log(`${r.doc}: history=${r.unprotected} not held to the live verdicts (${HISTORY_DOCS.find((h) => h.doc === r.doc).why}); protected=${r.protected} skipped=${r.skipped}`);
        continue;
      }
      console.log(`${r.doc}: protected=${r.protected} (weak ${r.weakProtected}) unprotected=${r.unprotected} allowed=${r.allowed} skipped=${r.skipped}`);
      for (const m of r.misses) console.log(`  line ${m.line}: ${m.value}  |  ${m.text}`);
    }
    const held = results.filter((r) => !isHistory(r.doc));
    const bad = held.filter((r) => r.unprotected > 0);
    console.log(`docs checked ${held.length} (+${results.length - held.length} history), documents with an unprotected number ${bad.length}, unprotected total ${bad.reduce((a, r) => a + r.unprotected, 0)}`);
  }
  process.exit(results.some((r) => !isHistory(r.doc) && r.unprotected > 0) ? 1 : 0);
}
