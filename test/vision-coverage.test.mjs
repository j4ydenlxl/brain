// test/vision-coverage.test.mjs: bench/verdicts/vision-coverage.json and docs/research/vision-coverage.md
// (board 31 item vision-coverage), an audit of docs/INTERPRETATION-2026-09-27.md against his words in
// MANUAL.md section A and the orders of docs/VISION.md section 3, written by test/vision-coverage-bar.mjs.
//
// 1. Every quote the verdict prints (row quotes, missing parts, every "..." span in a draft, drift
//    "his", the words no row maps) is a byte-for-byte substring of one line of MANUAL.md section A,
//    re-checked by this test's own line scan and, where grep exists, by grep -F -c; the count of
//    distinct quotes equals quotesChecked and none fails.
// 2. Every row quote is at most 12 words; no quote carries an em-dash, an ellipsis character, a
//    backslash or a double quote.
// 3. Every date's day and clock tokens are printed in the quote's entry or the header above it, and
//    every row's line holds its quote.
// 4. The rows are the interpretation's printed labels, in its order; the numbering faults are recounted.
// 5. Every order named exists in docs/VISION.md section 3 (the count of orders may grow: drafts get pasted).
// 6. Verdict words follow the carry rule's shape; the counts are recounted; the md prints the same line.
// 7. Drafts run from 44 without a gap, in the order of the earliest row each covers; every PARTLY or
//    UNCARRIED row has a draft and every draft row is PARTLY or UNCARRIED; each is one line in the house
//    format and is printed in the md; each status names its sources' files and stamps.
// 8. Drift "theirs" is a substring of the interpretation; the drift kinds are recounted.
// 9. Control: the interpretation's own misquote counts 0 in MANUAL.md, and its quoted fragments are
//    recounted to the verdict's X of Y (so the checker can fail on real text).
// 10. Each check fails on a copy bent the way it guards against.
// 11. Status: every fragment of every draft status is read from the cited verdict AT ITS STAMP (the
//     file on disk when its "at" is the stamp, else the git revision whose "at" is; a stamp found in
//     neither fails), every number a status prints is a number of one of its fragments, every
//     "no isTheBar" and "absent in" claim holds in the stamped content, and no verdict file stamped at
//     or before statusAsOf (or carrying no stamp) names a term a status calls absent.
// 12. Bar clauses: each of the verdict's clauses is recomputed here from the three input files and the
//     cited verdicts; barMet is true exactly when every recomputed clause fails 0.
// 13. Printed: every line the bar printed is rebuilt here from this test's own recounts, and every
//     number in the statement is a number of those lines.
// 14. The verdict is the bar's output of the authored AUDIT in test/vision-coverage-bar.mjs (no hand edit).
//
// No network, no model, no write. Reads git history (git log, git show) only for a stamp no longer on disk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AUDIT } from './vision-coverage-bar.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = (p) => readFileSync(path.join(ROOT, p), 'utf8');
const EM = String.fromCharCode(0x2014), ELL = String.fromCharCode(0x2026);
const SELF = 'bench/verdicts/vision-coverage.json';
const V = JSON.parse(rd(SELF));
const MD = rd('docs/research/vision-coverage.md');
const M = rd('MANUAL.md').split(/\r?\n/);
const aStart = M.findIndex((l) => l.startsWith('## \u00a7A.')) + 1;
const aEnd = M.findIndex((l) => l.startsWith('## \u00a7B.'));
const VIS = rd('docs/VISION.md').split(/\r?\n/);
const INTERP = rd('docs/INTERPRETATION-2026-09-27.md');
const LABELS = INTERP.split(/\r?\n/).map((l) => /^(\d+(?:-\d+)?)\. /.exec(l)).filter(Boolean).map((m) => m[1]);
const ORDERS = (() => { const s = VIS.findIndex((l) => l.startsWith('## 3.')), e = VIS.findIndex((l) => l.startsWith('## 4.')); const o = new Set(); for (let i = s + 1; i < e; i++) { const m = /^(\d+)\. /.exec(VIS[i]); if (m) o.add(+m[1]); } return o; })();
const HAS_GREP = !spawnSync('grep', ['--version'], { encoding: 'utf8' }).error;
const grepCache = new Map();
const grepCount = (q) => { if (!grepCache.has(q)) grepCache.set(q, parseInt(String(spawnSync('grep', ['-F', '-c', '--', q, 'MANUAL.md'], { cwd: ROOT, encoding: 'utf8' }).stdout).trim(), 10) || 0); return grepCache.get(q); };
const linesInA = (q) => { const out = []; for (let i = aStart; i <= aEnd; i++) if (M[i - 1].includes(q)) out.push(i); return out; };
const NUM = /(?<![A-Za-z0-9_.])\d+(?:\.\d+)?(?![A-Za-z0-9_])/g;
const nums = (s) => String(s).match(NUM) || [];
const GAP = ['PARTLY', 'UNCARRIED'];

// ---- checks as pure functions of a verdict (so a bent copy can be graded)
function allQuotes(v) {
  const q = new Set();
  for (const r of v.rows) { q.add(r.quote); for (const m of r.missing) q.add(m); }
  for (const d of v.drafts) for (const m of d.text.matchAll(/"([^"]+)"/g)) q.add(m[1]);
  for (const d of v.drift) for (const h of d.his) q.add(h);
  for (const x of v.notInInterpretation) q.add(x.quote);
  return q;
}
function quoteProblems(v) {
  const p = [];
  for (const q of allQuotes(v)) {
    if (q.includes(EM) || q.includes(ELL) || q.includes('\\') || q.includes('"')) p.push(`forbidden char: ${q}`);
    if (!linesInA(q).length) p.push(`not in section A: ${q}`);
  }
  for (const r of v.rows) if (r.quote.trim().split(/\s+/).length > 12) p.push(`row ${r.n} over 12 words`);
  return p;
}
function grepProblems(v) { return HAS_GREP ? [...allQuotes(v)].filter((q) => grepCount(q) === 0).map((q) => `grep 0: ${q}`) : []; }
function blockOf(L) {
  let s = L; while (s > aStart && !/^(- |> )/.test(M[s - 1]) && !/^#/.test(M[s - 1])) s--;
  let e = L; while (e < aEnd && M[e] !== undefined && M[e] !== '' && !/^(- |> |\(|#)/.test(M[e])) e++;
  let h = L; while (h > aStart && !/^##/.test(M[h - 1])) h--;
  const head = /\d{4}-\d\d-\d\d/.test(M[h - 1]) ? M[h - 1] : M[h - 1] + ' ' + M[aStart - 1];
  return M.slice(s - 1, e).join(' ') + ' ' + head;
}
function datePairs(v) {
  const pairs = v.rows.map((r) => [r.quote, r.date]).concat(v.notInInterpretation.map((x) => [x.quote, x.date]));
  for (const d of v.drafts) for (const m of d.text.matchAll(/"([^"]+)" \(([^)]*\d{4}-\d\d-\d\d[^)]*)\)/g)) pairs.push([m[1], m[2]]);
  return pairs;
}
function dateProblems(v) {
  const p = [];
  for (const [q, date] of datePairs(v)) {
    const toks = date.match(/\d{4}-\d\d-\d\d|\d\d:\d\d(?::\d\d)?/g) || [];
    if (!toks.length || !linesInA(q).some((L) => { const b = blockOf(L); return toks.every((t) => b.includes(t)); })) p.push(`date ${date} for ${q}`);
  }
  for (const r of v.rows.concat(v.notInInterpretation)) if (!Number.isInteger(r.line) || r.line < aStart || r.line > aEnd || !M[r.line - 1].includes(r.quote)) p.push(`line ${r.line} does not hold ${r.quote}`);
  return p;
}
const VERDICTS = ['CARRIED', 'PARTLY', 'UNCARRIED', 'NOT FOUND', 'QUESTION'];
function rowProblems(v) {
  const p = [];
  if (JSON.stringify(v.rows.map((r) => r.n)) !== JSON.stringify(LABELS)) p.push('row labels differ from the interpretation');
  for (const r of v.rows) {
    if (!VERDICTS.includes(r.verdict)) p.push(`row ${r.n}: verdict ${r.verdict}`);
    const none = ['QUESTION', 'UNCARRIED', 'NOT FOUND'].includes(r.verdict);
    if (none && r.orders.length) p.push(`row ${r.n}: ${r.verdict} with orders`);
    if (!none && !r.orders.length) p.push(`row ${r.n}: ${r.verdict} without orders`);
    const gap = GAP.includes(r.verdict);
    if (gap !== (r.missing.length > 0)) p.push(`row ${r.n}: ${r.verdict} with ${r.missing.length} missing parts`);
  }
  return p;
}
const orderRefs = (v) => v.rows.flatMap((r) => r.orders).concat(v.notInInterpretation.flatMap((x) => x.orders));
function orderProblems(v) { return orderRefs(v).filter((o) => !ORDERS.has(o)).map((o) => `order ${o} not in VISION section 3`); }
function countProblems(v) {
  const p = [];
  const c = { carried: 0, partly: 0, uncarried: 0, notFound: 0, question: 0, total: v.rows.length };
  const key = { CARRIED: 'carried', PARTLY: 'partly', UNCARRIED: 'uncarried', 'NOT FOUND': 'notFound', QUESTION: 'question' };
  for (const r of v.rows) c[key[r.verdict]]++;
  for (const k of Object.keys(c)) if (c[k] !== v.counts[k]) p.push(`count ${k}: ${c[k]} recounted, ${v.counts[k]} printed`);
  return p;
}
function shapeProblems(v) { return [...rowProblems(v), ...orderProblems(v).map((x) => 'row ' + x), ...countProblems(v)]; }
function coverageProblems(v) {
  const p = [];
  const covered = new Set(v.drafts.flatMap((d) => d.rows));
  for (const r of v.rows) if (GAP.includes(r.verdict) && !covered.has(r.n)) p.push(`row ${r.n} ${r.verdict} has no draft`);
  for (const d of v.drafts) for (const r of d.rows) { const row = v.rows.find((x) => x.n === r); if (!row || !GAP.includes(row.verdict)) p.push(`draft ${d.n}: row ${r} is ${row ? row.verdict : 'unknown'}`); }
  return p;
}
function formatProblems(v) {
  const p = [];
  const pos = (r) => LABELS.indexOf(r);
  let prev = -1;
  v.drafts.forEach((d, i) => {
    if (d.n !== 44 + i) p.push(`draft ${d.n} at position ${i}`);
    const first = Math.min(...d.rows.map(pos));
    if (first < prev) p.push(`draft ${d.n} out of row order`);
    prev = first;
    if (!d.text.startsWith(`${d.n}. "`) || !d.text.includes(' -> ') || !d.text.includes(' Bar: ') || !d.text.includes(' Status: OPEN (') || !d.text.endsWith(').') || /\r|\n/.test(d.text)) p.push(`draft ${d.n}: not the house format`);
    const status = d.text.slice(d.text.indexOf(' Status: OPEN ('));
    for (const s of d.status.sources) if (!status.includes(s.file) || !status.includes(s.at)) p.push(`draft ${d.n}: status does not name ${s.file} at ${s.at}`);
  });
  return p;
}
function draftProblems(v) { return [...formatProblems(v), ...coverageProblems(v)]; }

// ---- status at its stamp: this test's own reader, not the bar's
const stampCache = new Map();
function atStamp(file, stamp) {
  const k = file + '|' + stamp;
  if (stampCache.has(k)) return stampCache.get(k);
  let r = { where: null, j: null };
  let j = null; try { j = JSON.parse(readFileSync(path.join(ROOT, file), 'utf8')); } catch { j = null; }
  if (j && j.at === stamp) r = { where: 'tree', j };
  else {
    const log = spawnSync('git', ['log', '--format=%H', '-n', '200', '--', file], { cwd: ROOT, encoding: 'utf8' });
    for (const h of String(log.stdout || '').split(/\r?\n/).filter(Boolean)) {
      const s = spawnSync('git', ['show', `${h}:${file}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });
      let g = null; try { g = JSON.parse(s.stdout); } catch { continue; }
      if (g && g.at === stamp) { r = { where: 'git', j: g }; break; }
    }
  }
  stampCache.set(k, r);
  return r;
}
let verdictTexts = null;
function allVerdictTexts() {
  if (verdictTexts) return verdictTexts;
  const out = [];
  const walk = (dir) => { for (const e of readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.json')) out.push(p); } };
  walk(path.join(ROOT, 'bench', 'verdicts'));
  verdictTexts = out.map((p) => ({ file: path.relative(ROOT, p).replaceAll('\\', '/'), text: readFileSync(p, 'utf8') })).filter((x) => x.file !== SELF).map((x) => ({ ...x, low: x.text.toLowerCase() }));
  return verdictTexts;
}
function statusCount(v) {
  const p = [];
  let sources = 0, fragments = 0, numbers = 0;
  for (const d of v.drafts) {
    const st = d.status;
    for (const s of st.sources) {
      sources++;
      if (!(s.at <= v.statusAsOf)) p.push(`draft ${d.n}: ${s.file} stamped ${s.at}, after statusAsOf ${v.statusAsOf}`);
      const r = atStamp(s.file, s.at);
      if (!r.j) { p.push(`draft ${d.n}: ${s.file} at ${s.at} is on neither disk nor git history`); fragments += s.fragments.length; continue; }
      const str = JSON.stringify(r.j);
      for (const f of s.fragments) { fragments++; if (!str.includes(f)) p.push(`draft ${d.n}: ${s.file} at ${s.at} lacks ${f}`); }
      if (st.noBar.includes(s.file) && r.j.isTheBar === true) p.push(`draft ${d.n}: ${s.file} is isTheBar true at ${s.at}`);
      for (const x of st.absentIn) if (x.file === s.file) for (const t of x.terms) if (str.toLowerCase().includes(t.toLowerCase())) p.push(`draft ${d.n}: ${s.file} names ${t} at ${s.at}`);
    }
    for (const f of st.noBar.concat(st.absentIn.map((x) => x.file))) if (!st.sources.some((s) => s.file === f)) p.push(`draft ${d.n}: ${f} claimed, not read`);
    let bare = d.text.slice(d.text.indexOf(' Status: OPEN ('));
    for (const s of st.sources) bare = bare.split(s.file).join(' ').split(s.at).join(' ');
    const backed = new Set(st.sources.flatMap((s) => s.fragments).concat(st.absentIn.flatMap((x) => x.terms)).flatMap(nums));
    for (const t of nums(bare)) { numbers++; if (!backed.has(t)) p.push(`draft ${d.n}: status number ${t} backed by no fragment`); }
  }
  const terms = [...new Set(v.drafts.flatMap((d) => d.status.absent.map((t) => t.toLowerCase())))];
  for (const f of allVerdictTexts()) {
    const hit = terms.filter((t) => f.low.includes(t));
    if (!hit.length) continue;
    let at = null; try { at = JSON.parse(f.text).at ?? null; } catch { at = null; }
    if (!(typeof at === 'string' && at > v.statusAsOf)) p.push(`absent ${hit.join(', ')} named by ${f.file} stamped ${at}`);
  }
  return { problems: p, sources, fragments, numbers, terms: terms.length };
}
const statusProblems = (v) => statusCount(v).problems;

function controlOf() {
  const frags = [];
  for (const l of INTERP.split(/\r?\n/)) {
    if (!/^\d+(?:-\d+)?\. /.test(l)) continue;
    for (const m of l.matchAll(/"([^"]+)"/g)) for (const f of m[1].split(/\.\.\.|\u2026/)) { const t = f.trim(); if (t.split(/\s+/).length >= 3) frags.push(t); }
  }
  const zero = V.controlResult.zero.quote;
  const zl = INTERP.split(/\r?\n/).find((l) => /^\d+(?:-\d+)?\. /.test(l) && l.includes(zero));
  return { fragments: frags.length, found: frags.filter((f) => linesInA(f).length > 0).length, zero, zeroRow: zl ? /^(\d+(?:-\d+)?)\. /.exec(zl)[1] : null, zeroCount: HAS_GREP ? grepCount(zero) : linesInA(zero).length };
}
function kindsOf(v) { const k = new Map(); for (const d of v.drift) k.set(d.kind, (k.get(d.kind) || 0) + 1); return [...k.entries()].sort((p, q) => q[1] - p[1]); }
function numberingOf() {
  const singles = new Set(LABELS.filter((l) => /^\d+$/.test(l)).map(Number));
  const ranges = LABELS.filter((l) => l.includes('-')).map((l) => l.split('-').map(Number));
  const inRange = (x) => ranges.some(([a, b]) => x >= a && x <= b);
  const twice = [...singles].filter(inRange).sort((a, b) => a - b);
  const rangeOnly = [], skipped = [];
  for (let x = 1; x <= Math.max(...singles); x++) if (!singles.has(x)) (inRange(x) ? rangeOnly : skipped).push(x);
  return { twice, rangeOnly, skipped };
}
/** The verdict's bar clauses, recomputed by this test. */
function clausesOf(v) {
  const st = statusCount(v);
  const printedTok = new Set((v.printed || []).flatMap(nums));
  return [
    ['quotes', allQuotes(v).size, quoteProblems(v).length + grepProblems(v).length],
    ['dates', datePairs(v).length, dateProblems(v).length],
    ['rows', LABELS.length, rowProblems(v).length],
    ['orders', orderRefs(v).length, orderProblems(v).length],
    ['coverage', v.rows.filter((r) => GAP.includes(r.verdict)).length, coverageProblems(v).length],
    ['drafts', v.drafts.length, formatProblems(v).length],
    ['status', st.sources, st.problems.length],
    ['statement', nums(v.statement).length, nums(v.statement).filter((t) => !printedTok.has(t)).length],
  ];
}
const barMetOf = (v) => clausesOf(v).every(([, , failed]) => failed === 0);
const bend = (f) => { const c = structuredClone(V); f(c); return c; };

test('1-2. every quote is his, byte for byte, in section A', () => {
  const qs = [...allQuotes(V)];
  assert.equal(qs.length, V.quotesChecked, 'distinct quotes equal quotesChecked');
  assert.deepEqual(quoteProblems(V), []);
  assert.deepEqual(grepProblems(V), []);
  assert.equal(V.quotesFailed, 0);
  console.log(`quotes checked ${qs.length}, failed 0 (${HAS_GREP ? 'grep -F -c and the section A line scan' : 'section A line scan; grep absent'}); section A lines ${aStart} to ${aEnd}`);
});

test('3. every date is printed in its entry or header; every line holds its quote', () => {
  const pairs = datePairs(V);
  assert.deepEqual(dateProblems(V), []);
  assert.equal(pairs.length, V.datesChecked);
  assert.equal(V.datesFailed, 0);
  console.log(`dates checked ${pairs.length}, failed 0; lines checked ${V.rows.length + V.notInInterpretation.length}`);
});

test('4. rows are the interpretation labels; numbering faults recounted', () => {
  assert.equal(LABELS.length, V.rows.length);
  assert.deepEqual(V.rows.map((r) => r.n), LABELS);
  const { twice, rangeOnly, skipped } = numberingOf();
  assert.deepEqual(twice, V.numbering.numberedTwice);
  assert.deepEqual(rangeOnly, V.numbering.rangeOnly);
  assert.deepEqual(skipped, V.numbering.skipped);
  assert.ok(twice.length > 0 && skipped.length > 0, 'the faults the item names are present');
  console.log(`rows ${V.rows.length}; numbered twice ${twice.join(',')}; range only ${rangeOnly.join(',')}; skipped ${skipped.join(',')}`);
});

test('5-6. orders exist, verdict shape holds, counts recount, md prints the line', () => {
  assert.deepEqual(shapeProblems(V), []);
  assert.ok(ORDERS.size >= V.ordersAtAudit, 'orders only grow');
  const c = V.counts;
  assert.equal(c.carried + c.partly + c.uncarried + c.notFound + c.question, c.total);
  assert.ok(V.line.startsWith(`Rows ${c.total}: CARRIED ${c.carried}, PARTLY ${c.partly}, UNCARRIED ${c.uncarried}, NOT FOUND ${c.notFound}, QUESTION ${c.question}.`));
  assert.ok(MD.includes(V.line), 'md prints the counts line');
  for (const r of V.rows) assert.ok(MD.includes(`| ${r.n} | "${r.quote.replace(/\|/g, '\\|')}" | ${r.date} | ${r.orders.join(', ') || '-'} | ${r.verdict} |`), `md table row ${r.n}`);
  console.log(V.line);
});

test('7. drafts: numbered, ordered, covering, house format, printed', () => {
  assert.deepEqual(draftProblems(V), []);
  for (const d of V.drafts) assert.ok(MD.includes(d.text), `md prints draft ${d.n}`);
  const pu = V.rows.filter((r) => GAP.includes(r.verdict)).length;
  assert.ok(pu > 0 && V.drafts.length > 0);
  console.log(`drafts ${V.drafts[0].n} to ${V.drafts[V.drafts.length - 1].n} (${V.drafts.length}) cover ${pu} PARTLY and UNCARRIED rows`);
});

test('8. drift: theirs is the interpretation, his is section A, kinds recounted', () => {
  assert.ok(V.drift.length > 0);
  for (const d of V.drift) {
    assert.ok(LABELS.includes(d.n), `drift row ${d.n}`);
    assert.ok(INTERP.includes(d.theirs), `theirs ${d.n}`);
    for (const h of d.his) assert.ok(linesInA(h).length > 0, `his ${d.n}`);
    assert.ok(MD.includes(`- Row ${d.n} (${d.kind}). Theirs: "${d.theirs}".`), `md drift ${d.n}`);
  }
  const kinds = kindsOf(V);
  assert.deepEqual(V.driftKinds.map((k) => [k.kind, k.count]), kinds);
  assert.equal(kinds.reduce((s, [, n]) => s + n, 0), V.drift.length);
  assert.ok(MD.includes(`By kind: ${kinds.map(([k, n]) => `${k} ${n}`).join(', ')}.`), 'md prints the kinds');
  console.log(`drift ${V.drift.length}: ${kinds.map(([k, n]) => `${k} ${n}`).join(', ')}`);
});

test('9. control: the checker fails on text that is not his', () => {
  const c = controlOf();
  assert.equal(linesInA(c.zero).length, 0);
  assert.equal(c.zeroCount, 0);
  assert.equal(V.controlResult.zero.count, 0);
  assert.equal(c.zeroRow, V.controlResult.zero.row);
  assert.equal(c.fragments, V.controlResult.fragments);
  assert.equal(c.found, V.controlResult.found);
  assert.ok(c.found < c.fragments, 'some of their fragments are not his words');
  assert.ok(c.found > 0, 'the checker also passes real text');
  console.log(`control: their fragments ${c.found} of ${c.fragments} found in section A; row ${c.zeroRow} "${c.zero}" counts 0`);
});

test('10. each check fails on a bent copy', () => {
  assert.ok(quoteProblems(bend((c) => { c.rows[0].quote = c.rows[0].quote.replace('five', 'fve'); })).length > 0, 'bent quote');
  assert.ok(quoteProblems(bend((c) => { c.drift[0].his[0] += ' x'; })).length > 0, 'bent drift his');
  assert.ok(dateProblems(bend((c) => { c.rows[0].date = '2026-09-15'; })).length > 0, 'bent date');
  assert.ok(dateProblems(bend((c) => { const r = c.rows.find((x) => x.n === '22'); r.date = '2026-09-17 08:51'; })).length > 0, 'bent clock');
  assert.ok(dateProblems(bend((c) => { c.rows[0].line += 1; })).length > 0, 'bent line');
  assert.ok(shapeProblems(bend((c) => { c.counts.carried += 1; })).length > 0, 'bent count');
  assert.ok(shapeProblems(bend((c) => { [c.rows[1], c.rows[2]] = [c.rows[2], c.rows[1]]; })).length > 0, 'bent label order');
  assert.ok(shapeProblems(bend((c) => { const r = c.rows.find((x) => x.verdict === 'QUESTION'); r.orders = [4]; })).length > 0, 'question with an order');
  assert.ok(shapeProblems(bend((c) => { c.rows.find((x) => x.verdict === 'CARRIED').orders = [999]; })).length > 0, 'order not in VISION');
  assert.ok(draftProblems(bend((c) => { for (const d of c.drafts) d.rows = d.rows.filter((r) => r !== '14'); })).length > 0, 'uncovered row');
  assert.ok(draftProblems(bend((c) => { c.drafts[1].n = 99; })).length > 0, 'bent numbering');
  assert.ok(draftProblems(bend((c) => { c.drafts[0].text = c.drafts[0].text.replace(' Bar: ', ' '); })).length > 0, 'bent format');
});

test('11. every status is read from the cited verdict at its stamp', () => {
  const st = statusCount(V);
  assert.deepEqual(st.problems, []);
  assert.ok(st.sources > 0 && st.fragments > 0 && st.numbers > 0 && st.terms > 0, 'the check saw sources, fragments, numbers and absent terms');
  assert.equal(st.sources, V.status.reads.length);
  assert.equal(st.fragments, V.status.fragments);
  assert.equal(st.numbers, V.status.numbers);
  assert.equal(st.terms, V.status.absence.terms.length);
  assert.equal(V.status.failed, 0);
  const where = { tree: 0, git: 0 };
  for (const d of V.drafts) for (const s of d.status.sources) where[atStamp(s.file, s.at).where]++;
  // bent copies: each status claim fails for its own cause
  const d44 = (c) => c.drafts.find((d) => d.n === 44);
  const bents = [
    ['bent fragment', (c) => { d44(c).status.sources[0].fragments[0] = '16458'; }, /lacks 16458/],
    ['bent stamp', (c) => { d44(c).status.sources[0].at = '2026-09-27T19:07:14.803Z'; }, /on neither disk nor git history/],
    ['stamp after the audit', (c) => { c.statusAsOf = '2026-09-01T00:00:00.000Z'; }, /after statusAsOf/],
    ['unbacked status number', (c) => { const d = c.drafts.find((x) => x.n === 52); d.text = d.text.replace('3.9835 times', '3.9836 times'); }, /status number 3\.9836/],
    ['no isTheBar claimed of a bar', (c) => { d44(c).status.noBar = ['bench/verdicts/census-all.json']; }, /is isTheBar true/],
    ['absent in, but present', (c) => { const d = c.drafts.find((x) => x.n === 53); d.status.absentIn[0].terms.push('gsm8k'); }, /names gsm8k/],
    ['absent term that an old verdict names', (c) => { c.drafts.find((x) => x.n === 45).status.absent.push('organism'); }, /absent organism named by/],
    ['claimed file never read', (c) => { d44(c).status.noBar = ['bench/verdicts/ladder.json']; }, /claimed, not read/],
  ];
  for (const [name, f, re] of bents) { const p = statusProblems(bend(f)); assert.ok(p.some((x) => re.test(x)), `${name}: ${p.slice(0, 3).join('; ')}`); }
  // the git-history path: a stamp no longer on disk is found in the revision that carries it
  let gitPath = 'not exercised: shallow or no git history';
  const shallow = String(spawnSync('git', ['rev-parse', '--is-shallow-repository'], { cwd: ROOT, encoding: 'utf8' }).stdout).trim();
  if (shallow === 'false') {
    const file = 'bench/verdicts/gate.json';
    const treeAt = JSON.parse(rd(file)).at;
    const revs = String(spawnSync('git', ['log', '--format=%H', '-n', '20', '--', file], { cwd: ROOT, encoding: 'utf8' }).stdout).split(/\r?\n/).filter(Boolean);
    let old = null;
    for (const h of revs) { let g = null; try { g = JSON.parse(spawnSync('git', ['show', `${h}:${file}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 }).stdout); } catch { continue; } if (g && typeof g.at === 'string' && g.at !== treeAt) { old = g; break; } }
    assert.ok(old, 'a committed gate.json stamped other than the one on disk');
    const cite = (frag) => bend((c) => { d44(c).status.sources[1] = { file, at: old.at, fragments: [frag] }; d44(c).text = d44(c).text.replace(V.drafts[0].status.sources[1].at, old.at); c.statusAsOf = old.at > c.statusAsOf ? old.at : c.statusAsOf; });
    const [key, val] = Object.entries(old).find(([k, x]) => k !== 'at' && (typeof x === 'number' || (typeof x === 'string' && x.length < 200)));
    const frag = JSON.stringify({ [key]: val }).slice(1, -1);
    const good = statusProblems(cite(frag)).filter((x) => x.includes(old.at));
    assert.deepEqual(good, [], 'a fragment of the committed revision is read from git history');
    assert.equal(atStamp(file, old.at).where, 'git');
    assert.ok(statusProblems(cite('vision-coverage bent fragment')).some((x) => x.includes('lacks vision-coverage bent fragment')), 'a fragment not in that revision fails');
    gitPath = `exercised on ${file} at ${old.at} (${frag.slice(0, 40)})`;
  }
  console.log(`status: sources ${st.sources} at their stamps (${where.tree} on disk, ${where.git} from git history), fragments ${st.fragments}, status numbers ${st.numbers}, absent terms ${st.terms} over ${allVerdictTexts().length} verdict files, failed 0; bent ${bents.length} of ${bents.length} caught; git path ${gitPath}`);
});

test('12. bar clauses recomputed; barMet is every clause at 0', () => {
  const mine = clausesOf(V);
  assert.deepEqual(V.clauses.map((c) => [c.name, c.checked, c.failed]), mine);
  assert.equal(V.bar, V.clauses.map((c) => c.text).join('; '));
  for (const c of V.clauses) assert.ok(typeof c.text === 'string' && c.text.length > 20, `clause ${c.name} states its bar`);
  assert.equal(V.barMet, barMetOf(V));
  assert.equal(V.barMet, mine.every(([, , f]) => f === 0));
  if (V.barMet) assert.ok(V.quotesFailed === 0 && V.datesFailed === 0 && V.problems.length === 0);
  const bents = [
    ['quotes', (c) => { c.rows[0].quote += ' zzz'; }],
    ['dates', (c) => { c.rows[0].date = '2026-09-15'; }],
    ['rows', (c) => { [c.rows[1], c.rows[2]] = [c.rows[2], c.rows[1]]; }],
    ['orders', (c) => { c.notInInterpretation[0].orders = [999]; }],
    ['coverage', (c) => { c.drafts[0].rows = c.drafts[0].rows.concat(['2']); }],
    ['drafts', (c) => { c.drafts[0].text = c.drafts[0].text.replace(' -> ', ' '); }],
    ['status', (c) => { c.drafts[0].status.sources[0].fragments.push('not in census-all'); }],
    ['statement', (c) => { c.statement += ' It also claims 98765.'; }],
  ];
  for (const [name, f] of bents) {
    const b = bend(f), cl = clausesOf(b);
    assert.ok(cl.find(([n]) => n === name)[2] > 0, `bent ${name} fails its own clause`);
    assert.equal(barMetOf(b), false, `bent ${name} is not barMet`);
  }
  console.log('clauses ' + mine.map(([n, k, f]) => `${n} ${k}/${f}`).join(', ') + `; barMet ${V.barMet}; bent ${bents.length} of ${bents.length} caught`);
});

test('13. every printed line is rebuilt here; every statement number is printed', () => {
  const c = controlOf(), n = numberingOf(), st = statusCount(V), cl = clausesOf(V), kinds = kindsOf(V);
  const pu = V.rows.filter((r) => GAP.includes(r.verdict)).length;
  const reads = V.status.reads, tree = reads.filter((r) => r.where === 'tree').length, git = reads.filter((r) => String(r.where).startsWith('git')).length;
  assert.equal(tree + git, st.sources, 'every source was read on disk or from git history');
  const want = [
    V.line,
    `drift ${V.drift.length} by kind: ` + kinds.map(([k, x]) => `${k} ${x}`).join(', '),
    `control: fragments ${c.found} of ${c.fragments} found; row ${c.zeroRow} quote "${c.zero}" count ${c.zeroCount}`,
    `dates checked ${datePairs(V).length}, failed ${dateProblems(V).length}; orders named ${orderRefs(V).length}, missing ${orderProblems(V).length}; docs/VISION.md section 3 orders at audit ${V.ordersAtAudit}; labels ${LABELS.length}, row faults ${rowProblems(V).length}`,
    `numbering: twice ${n.twice.join(',')}; range only ${n.rangeOnly.join(',')}; skipped ${n.skipped.join(',')}`,
    `coverage: PARTLY and UNCARRIED rows ${pu}, faults ${coverageProblems(V).length}; draft faults ${formatProblems(V).length}`,
    `status: sources ${st.sources} read at their stamp (${tree} on disk, ${git} from git history), fragments ${st.fragments}, status numbers ${st.numbers}, absent terms ${st.terms} over ${V.status.absence.filesScanned} verdict files (${V.status.absence.namedAfterAudit.length} named after the audit), failed ${st.problems.length}`,
    'drafts: ' + V.drafts.map((d) => `${d.n} ${d.key} [${d.rows.join(',')}]`).join('; '),
    'bar clauses: ' + cl.map(([x, k, f]) => `${x} ${k} checked ${f} failed`).join('; '),
    `barMet ${cl.every(([, , f]) => f === 0)}`,
  ];
  assert.deepEqual(V.printed, want);
  assert.ok(V.status.absence.filesScanned > 0);
  const tok = new Set(want.flatMap(nums)), missing = nums(V.statement).filter((t) => !tok.has(t));
  assert.deepEqual(missing, [], 'every number in the statement is printed');
  assert.ok(nums(V.statement).length >= 20, 'the statement quotes numbers');
  const softer = (kinds.find(([k]) => k === 'softer') || [null, 0])[1];
  assert.ok(V.statement.includes(`${V.drift.length} of its paraphrases drift from his words, ${softer} of them softer`));
  assert.ok(MD.includes(`- ${want[6]}.`), 'md prints the status line');
  console.log(`printed lines rebuilt ${want.length} of ${V.printed.length}; statement numbers ${nums(V.statement).length}, unprinted 0`);
});

test('14. the verdict is the bar output of the authored audit', () => {
  const strip = (xs) => xs.map(({ line, ...rest }) => rest);
  assert.deepEqual(strip(V.rows), AUDIT.rows);
  assert.deepEqual(strip(V.notInInterpretation), AUDIT.notInInterpretation);
  assert.deepEqual(V.drafts, AUDIT.drafts);
  assert.deepEqual(V.drift, AUDIT.drift);
  assert.equal(V.statusAsOf, AUDIT.statusAsOf);
  assert.equal(V.carryRule, AUDIT.carryRule);
  assert.equal(V.controlResult.zero.quote, AUDIT.control.zero);
  assert.ok(/(^| )test\/vision-coverage-bar\.mjs( |$)/.test(V.command), 'the command names the bar');
  assert.ok(existsSync(path.join(ROOT, 'test', 'vision-coverage-bar.mjs')), 'the bar is on disk');
  assert.ok(!/gen\.mjs/.test(V.command), 'no deleted scratch generator is named');
  console.log(`audit rows ${AUDIT.rows.length}, drafts ${AUDIT.drafts.length}, drift ${AUDIT.drift.length}, not mapped ${AUDIT.notInInterpretation.length}: equal to the verdict`);
});

test('verdict fields, no em-dash, prior rows file gone', () => {
  assert.equal(V.isTheBar, true);
  assert.equal(typeof V.barMet, 'boolean');
  assert.equal(V.split.heldOut, 'none');
  assert.equal(V.split.contaminated, false);
  assert.ok(typeof V.split.why === 'string' && V.split.why.length > 0);
  assert.ok(typeof V.control === 'string' && V.control.length > 0);
  assert.ok(typeof V.statement === 'string' && V.statement.length > 200);
  assert.ok(/^v\d+\.\d+\.\d+$/.test(V.node));
  assert.ok(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/.test(V.at));
  assert.ok(V.statusAsOf <= V.at, 'the statuses were read before the verdict was written');
  for (const f of ['docs/research/vision-coverage.md', 'bench/verdicts/vision-coverage.json', 'test/vision-coverage.test.mjs', 'test/vision-coverage-bar.mjs', 'notes/vision-coverage.md']) {
    assert.ok(existsSync(path.join(ROOT, f)), f);
    assert.ok(!rd(f).includes(EM), `no em-dash in ${f}`);
  }
  assert.ok(!existsSync(path.join(ROOT, 'test', 'vision-coverage-rows.json')), 'the prior rows file stays deleted');
});
