// judge/judge.mjs: THE LOCKED JUDGE'S GRADER (grow/CONTRACT.md, "expect"). His words: "The judge is LOCKED: the
// select step and the held-out sets are outside what the organism may edit, so it cannot grade itself up."
// expectOk(got, expect) grades one answer; score(rows, results) grades a set. Pure, synchronous, no socket.
// This file is named in judge/LOCK.json: an edit to it makes judge/verify.mjs print LOCK DRIFT and select refuse.
// Author: board 37 builder, item judge, 2026-09-30 (his Day 1 order in NEXT-WEEK.md).
import { REFUSAL_RE } from '../grow/contract.mjs';

/** The clauses an expect may carry (CONTRACT.md). Any other key is a typo and fails closed. */
export const CLAUSES = Object.freeze(['equals', 'contains', 'containsAny', 'notContains', 'minWords', 'maxWords', 'notRefusal']);
const LISTS = new Set(['contains', 'containsAny', 'notContains']);

const norm = (s) => String(s ?? '').trim().toLowerCase();
/** The number of words in a text: its runs of non-space characters. */
export const wordCount = (s) => (String(s ?? '').trim().match(/\S+/g) || []).length;

/** What is wrong with an expect itself (not with an answer): no clause, an unknown clause, a malformed clause. */
export function expectErrors(expect) {
  const out = [];
  if (!expect || typeof expect !== 'object' || Array.isArray(expect)) return ['expect is not an object'];
  const keys = Object.keys(expect);
  if (!keys.length) return ['expect has no clause'];
  for (const k of keys) {
    if (!CLAUSES.includes(k)) { out.push('unknown clause ' + k); continue; }
    const v = expect[k];
    if (LISTS.has(k) && (!Array.isArray(v) || !v.length || !v.every((s) => typeof s === 'string' && s.trim().length))) out.push(k + ' is not a list of words');
    if ((k === 'minWords' || k === 'maxWords') && !(Number.isInteger(v) && v >= 0)) out.push(k + ' is not a whole number');
    if (k === 'equals' && typeof v !== 'string') out.push('equals is not a text');
    if (k === 'notRefusal' && v !== true) out.push('notRefusal is not true');
  }
  return out;
}

/**
 * Every clause of `expect` that `got` fails, in words; an empty list means the answer is right.
 * Text compares trimmed and case-insensitively. `got` that is not a string (a null is a miss) fails every expect,
 * `notRefusal` included. An expect with no clause, an unknown clause or a malformed clause fails closed: an
 * assertion that holds for any result is not an assertion.
 * @param {string|null} got the answer
 * @param {object} expect { equals?, contains?, containsAny?, notContains?, minWords?, maxWords?, notRefusal? }
 * @returns {string[]}
 */
export function expectFailures(got, expect) {
  const bad = expectErrors(expect);
  if (bad.length) return bad;
  // a null (or any non-text) is a miss, never a right answer, whatever the clauses
  if (typeof got !== 'string') return ['the answer is null'];
  const out = [];
  const raw = got.trim();
  const text = raw.toLowerCase();
  if (expect.notRefusal === true && REFUSAL_RE.test(raw)) out.push('the answer is a refusal');
  if (expect.equals !== undefined && text !== norm(expect.equals)) out.push('the answer does not equal "' + expect.equals + '"');
  if (expect.contains) for (const n of expect.contains) if (!text.includes(norm(n))) out.push('the answer does not contain "' + n + '"');
  if (expect.containsAny && !expect.containsAny.some((n) => text.includes(norm(n)))) out.push('the answer contains none of ' + expect.containsAny.map((n) => '"' + n + '"').join(', '));
  if (expect.notContains) for (const n of expect.notContains) if (text.includes(norm(n))) out.push('the answer contains "' + n + '"');
  const words = wordCount(raw);
  if (expect.minWords !== undefined && words < expect.minWords) out.push('the answer has ' + words + ' words, under ' + expect.minWords);
  if (expect.maxWords !== undefined && words > expect.maxWords) out.push('the answer has ' + words + ' words, over ' + expect.maxWords);
  return out;
}

/** True only when `got` meets every clause of `expect` (CONTRACT.md). */
export function expectOk(got, expect) {
  return expectFailures(got, expect).length === 0;
}

/** The key a prompt is matched by across files: trimmed, lower case. */
export const qKey = (q) => norm(q);

/**
 * Grade a set. Each row { q, expect } is matched to the first result { q, got, can? } with the same q (trimmed,
 * case-insensitive); a row with no result, or whose result says can false, is not ok.
 * @returns {{ n: number, ok: number, score: number, rows: { q: string, ok: boolean, why: string[] }[] }}
 */
export function score(rows, results) {
  const byQ = new Map();
  for (const r of Array.isArray(results) ? results : []) {
    if (r && typeof r.q === 'string' && !byQ.has(qKey(r.q))) byQ.set(qKey(r.q), r);
  }
  const graded = [];
  let ok = 0;
  for (const row of Array.isArray(rows) ? rows : []) {
    const r = byQ.get(qKey(row && row.q));
    let why;
    if (!r) why = ['no result for this row'];
    else if (r.can === false) why = ['the cell said it cannot answer'];
    else why = expectFailures(r.got, row.expect);
    if (!why.length) ok++;
    graded.push({ q: row && row.q, ok: !why.length, why });
  }
  const n = graded.length;
  return { n, ok, score: n ? Math.round((ok / n) * 1e4) / 1e4 : 0, rows: graded };
}
