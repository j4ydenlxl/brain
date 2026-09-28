// test/grok-bot.test.mjs: bench/verdicts/grok-bot.json and docs/research/grok-bot.md, written by
// bench/grok-bot.mjs (board 29 item grok-bot, fixed on board 31 item grok-bot-fix).
//
// 1. Every number on our side equals the field in the named file AT THE STAMP THE ROW RECORDED: the
//    file must still carry that "at", and the value is re-read by this test's own path reader (not the
//    assembler's). A file that moved on is a FAILURE naming the file, never a skipped row: the fix is
//    to re-run node bench/grok-bot.mjs, which reads the current stamps. A LIVE file (a bench still
//    running) only appends rows, so its value at the stamp is the recount over the rows it held then:
//    the verdict pins {at, rows, digest}, and this test recounts those first rows after checking their
//    sha256 itself; rows that changed are a failure, never a skip.
// 2. Every ratio equals the arithmetic its rule names; every row with both sides on a ratio scale has one.
// 3. Every Grok number is a number in a string that a LOADED source printed (status 200, ISO readAt).
// 4. Sources: the 22 pages board 29 read are all still listed; readAt is one ISO instant per loaded
//    page and null (with triedAt) for a page that did not load; each quote is under 15 words.
// 5. Like with like: every pair of arms the statement quotes is on one population, recounted here
//    from the file's rows, and the statement prints each pair's counts.
// 6. The command re-runs: bench/grok-bot.mjs build(), in memory with the verdict's own "at", gives
//    the same measures, pairs, counts, statement, sources and markdown as the files on disk.
// 7. No em-dash in any file of this item; the markdown prints every row and the 10000x paragraph.
// 8. Every number the statement and the 10000x paragraph quote is a token of a line the command prints
//    (report(), which never prints the prose whole): build() records each value the prose interpolates,
//    and this test tokenizes both sides itself (board 31 fix: the interval and the 161 were not printed).
// 9. build() reads no file and probes no path whose stamp the verdict does not record (board 31 fix:
//    section 8 of the markdown once turned on whether bench/conceive.mjs existed, a fact no stamp held).
// Controls: each check is shown to fail on a copy bent the way it guards against.
//
// No network, no model, no write.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, report } from '../bench/grok-bot.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERDICT = path.join(ROOT, 'bench', 'verdicts', 'grok-bot.json');
const MD = path.join(ROOT, 'docs', 'research', 'grok-bot.md');
const EM = String.fromCharCode(0x2014);
const ISO = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/;

// the 22 pages board 29 read, with the status each returned then (problem 3 of the fix: keep them)
const BOARD29 = {
  'https://x.ai/news/introducing-grok-bot': 200, 'https://x.ai/bot': 403, 'https://docs.x.ai/grok-bot/overview': 200,
  'https://docs.x.ai/grok-bot/teams-and-enterprises': 200, 'https://docs.x.ai/grok-bot/computer-and-apps': 200,
  'https://docs.x.ai/grok-bot/faq': 200, 'https://cursor.com/help/grok-bot/plans': 200, 'https://cursor.com/help/grok-bot/security': 404,
  'https://cursor.com/pricing': 200, 'https://cursor.com/docs/account/pricing': 200, 'https://x.ai/grok': 403, 'https://grok.com/plans': 200,
  'https://grok.com/supergrok': 200, 'https://docs.x.ai/grok/faq': 200, 'https://docs.x.ai/docs/models': 200, 'https://x.ai/news/grok-4-7': 200,
  'https://x.ai/news/grok-4-6': 200, 'https://artificialanalysis.ai/models/grok-4-7': 200, 'https://www.layer3labs.io/guides/what-is-grok-bot': 200,
  'https://en.wikipedia.org/wiki/Grok_(chatbot)': 200, 'https://cellcog.ai/blog/what-is-grok-bot/': 200,
  'https://cybernews.com/ai-news/grok-5-artificial-general-intelligence/': 403,
};

// ---- this test's own reader (independent of bench/grok-bot.mjs) ----
function getPath(obj, p) {
  let cur = obj;
  for (const seg of p.split('.')) {
    const m = seg.match(/^([^[]+)\[([^=]+)=(.+)\]$/);
    if (m) {
      const arr = cur?.[m[1]];
      cur = Array.isArray(arr) ? arr.find((r) => String(r?.[m[2]]) === m[3]) : undefined;
    } else cur = cur?.[seg];
    if (cur === undefined) return undefined;
  }
  return cur;
}
function recountPaired(file, a, b, split) {
  let n = 0; const correct = { [a]: 0, [b]: 0 };
  for (const r of file.rows ?? []) {
    if (split && r.split !== split) continue;
    const x = r.arms?.[a]; const y = r.arms?.[b];
    if (!x || !y || x.absent || y.absent || typeof x.ok !== 'boolean' || typeof y.ok !== 'boolean') continue;
    n += 1; if (x.ok) correct[a] += 1; if (y.ok) correct[b] += 1;
  }
  return { [a]: { n, correct: correct[a], accuracy: n ? correct[a] / n : null }, [b]: { n, correct: correct[b], accuracy: n ? correct[b] / n : null } };
}
const files = new Map();
function load(rel) {
  if (!files.has(rel)) files.set(rel, existsSync(path.join(ROOT, rel)) ? JSON.parse(readFileSync(path.join(ROOT, rel), 'utf8')) : null);
  return files.get(rel);
}
const digest = (rows) => createHash('sha256').update(JSON.stringify(rows)).digest('hex').slice(0, 16);
// the named file as it stood at stamp "at": itself when it still carries that stamp; a live file that
// appended rows since, cut back to the rows its pin says it held (their digest checked here); else null
function atStamp(v, rel, at) {
  const file = load(rel);
  if (!file) return { file: null, why: `missing: ${rel} is gone; re-run node bench/grok-bot.mjs` };
  if (file.at === at) return { file };
  const pin = v.pins?.[rel];
  if (pin && pin.at === at) {
    const rows = (file.rows ?? []).slice(0, pin.rows);
    if (rows.length === pin.rows && digest(rows) === pin.digest) return { file: { ...file, at, rows }, pinned: true };
    return { file: null, why: `stale: ${rel} no longer holds the ${pin.rows} rows it held at ${at}; re-run node bench/grok-bot.mjs` };
  }
  return { file: null, why: `stale: ${rel} is now at ${file.at}, the verdict recorded ${at}; re-run node bench/grok-bot.mjs` };
}
function readRow(v, row) {
  const s = atStamp(v, row.oursFile, row.oursAt);
  if (!s.file) return { why: s.why };
  const file = s.file;
  const [p, regexPart] = row.oursPath.split(' (regex ');
  const pm = p.match(/^paired\(([^,]+),([^,)]+)(?:,([^)]+))?\)\.(.+)$/);
  let raw = pm ? getPath(recountPaired(file, pm[1], pm[2], pm[3]), pm[4]) : getPath(file, p);
  if (regexPart) {
    const m = String(raw).match(new RegExp(regexPart.replace(/\)$/, '')));
    raw = m ? Number(m[1]) : undefined;
  }
  return { at: file.at ?? null, pinned: !!s.pinned, value: typeof raw === 'number' && Number.isFinite(raw) ? Number((raw * (row.oursScale ?? 1)).toPrecision(12)) : null };
}
const WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
function numbersOf(s) {
  const out = [];
  for (const m of String(s).matchAll(/\d[\d,]*(?:\.\d+)?/g)) out.push(Number(m[0].replaceAll(',', '')));
  for (const w of String(s).toLowerCase().split(/[^a-z]+/)) if (WORDS[w]) out.push(WORDS[w]);
  return out;
}

// returns a list of problems; empty means the verdict holds
function check(v) {
  const problems = [];
  let compared = 0; let pinned = 0;
  const loaded = new Map(v.sources.filter((s) => s.status === 200 && ISO.test(s.readAt ?? '')).map((s) => [s.url, s]));
  for (const s of v.sources) {
    if (s.status === 200 && !(ISO.test(s.readAt ?? '') && !Number.isNaN(Date.parse(s.readAt)))) problems.push(`readAt not one ISO instant: ${s.url}`);
    if (s.status !== 200 && (s.readAt !== null || !ISO.test(s.triedAt ?? ''))) problems.push(`a page that did not load needs readAt null and triedAt: ${s.url}`);
    if (s.quote !== null && (typeof s.quote !== 'string' || s.quote.trim().split(/\s+/).length >= 15)) problems.push(`quote not under 15 words: ${s.url}`);
  }
  for (const m of v.measures) {
    if (!loaded.has(m.theirsUrl)) problems.push(`theirsUrl not a loaded source: ${m.name}`);
    if (typeof m.theirs === 'number') {
      const src = loaded.get(m.theirsUrl);
      if (!src || !src.printed.includes(m.theirsPrinted)) problems.push(`theirs printed string not printed by its source: ${m.name}`);
      else if (!numbersOf(m.theirsPrinted).includes(m.theirs)) problems.push(`theirs ${m.theirs} is not in "${m.theirsPrinted}": ${m.name}`);
    } else if (!/^no number/.test(m.theirsNote)) problems.push(`missing theirs without saying so: ${m.name}`);
    if (m.oursFile) {
      if (typeof m.oursPath !== 'string') { problems.push(`ours file without a path: ${m.name}`); continue; }
      const r = readRow(v, m);
      if (r.why) { problems.push(`${r.why}: ${m.name}`); continue; }
      compared += 1; if (r.pinned) pinned += 1;
      if (r.value !== m.ours) problems.push(`ours ${m.ours} but ${m.oursFile} ${m.oursPath} reads ${r.value} at ${r.at}: ${m.name}`);
      if (m.ours === null && !/^no number/.test(m.oursNote)) problems.push(`missing ours without saying so: ${m.name}`);
    } else if (typeof m.ours === 'number') problems.push(`ours without a file: ${m.name}`);
    else if (!/^no number/.test(m.oursNote)) problems.push(`missing ours without saying so: ${m.name}`);
    if (typeof m.theirs === 'number' && typeof m.ours === 'number') {
      const want = m.kind === 'lower' ? m.theirs / m.ours
        : m.kind === 'higher' ? (100 - m.theirs) / (100 - m.ours)
          : m.kind === 'higher-rate' ? m.ours / m.theirs : null;
      if (want === null ? m.ratio !== null : !(typeof m.ratio === 'number' && Math.abs(m.ratio - want) <= Math.abs(want) * 1e-8)) problems.push(`ratio ${m.ratio} but the rule gives ${want}: ${m.name}`);
    } else if (m.ratio !== null) problems.push(`a ratio with one side missing: ${m.name}`);
  }
  for (const p of v.pairs) {
    if (p.organism.n !== p.alone.n || (p.null && p.null.n !== p.organism.n)) { problems.push(`pair on two populations: ${p.set} ${p.population}`); continue; }
    const s = atStamp(v, p.file, p.at);
    if (!s.file) { problems.push(`${s.why}: pair ${p.set} ${p.population}`); continue; }
    const file = s.file;
    const split = /heldOut/.test(p.population) ? 'heldOut' : null;
    const rc = recountPaired(file, 'organism', 'alone', split);
    if (rc.organism.n !== p.organism.n || rc.organism.correct !== p.organism.correct || rc.alone.correct !== p.alone.correct) {
      problems.push(`pair ${p.set} ${p.population} is not what the rows recount (${rc.organism.correct}/${rc.organism.n} and ${rc.alone.correct}/${rc.alone.n})`);
    }
    if (p.null) {
      const rn = recountPaired(file, 'organism', 'null', split);
      if (rn.null.n !== p.null.n || rn.null.correct !== p.null.correct) problems.push(`null arm of ${p.set} ${p.population} is not what the rows recount`);
    }
    for (const arm of ['organism', 'alone']) {
      if (!v.statement.includes(`${p[arm].correct} of ${p[arm].n}`) && p.population !== 'heldOut, records both arms graded') problems.push(`statement does not print ${arm} ${p.set} ${p.population}`);
    }
  }
  for (const [rel, pin] of Object.entries(v.pins ?? {})) {
    if (!v.measures.some((m) => m.oursFile === rel && m.oursLive && m.oursAt === pin.at)) problems.push(`a pin no live row reads: ${rel}`);
  }
  for (const m of v.measures.filter((x) => x.oursLive)) if (!v.pins?.[m.oursFile]) problems.push(`a live file without a pin: ${m.name}`);
  return { problems, compared, pinned };
}

const verdict = JSON.parse(readFileSync(VERDICT, 'utf8'));
const md = readFileSync(MD, 'utf8');

test('the verdict has the fields the board asks for, and its command is a tracked file', () => {
  for (const k of ['at', 'command', 'node', 'isTheBar', 'barMet', 'split', 'statement', 'sources', 'measures', 'pairs', 'checks', 'counts']) assert.ok(k in verdict, k);
  assert.equal(typeof verdict.barMet, 'boolean');
  assert.equal(verdict.isTheBar, true);
  assert.ok(ISO.test(verdict.at));
  assert.equal(verdict.split.heldOut, 'none');
  assert.equal(verdict.split.contaminated, false);
  assert.equal(verdict.command, 'node bench/grok-bot.mjs');
  assert.ok(existsSync(path.join(ROOT, 'bench', 'grok-bot.mjs')), 'the command names a file in the tree');
  assert.equal(verdict.barMet, Object.values(verdict.checks).every(Boolean), 'barMet is the conjunction of the checks');
  assert.ok(verdict.measures.some((m) => typeof m.theirs === 'number'), 'a number on their side');
  assert.ok(verdict.measures.some((m) => typeof m.ours === 'number'), 'a number on our side');
});

test('sources: the 22 pages are kept, one ISO instant per loaded page, null for a page that did not load, quotes under 15 words', () => {
  const byUrl = new Map(verdict.sources.map((s) => [s.url, s]));
  for (const [url, status] of Object.entries(BOARD29)) {
    assert.ok(byUrl.has(url), `kept: ${url}`);
    assert.equal(byUrl.get(url).status, status, url);
  }
  assert.equal(verdict.counts.sources, verdict.sources.length);
  assert.equal(verdict.counts.sourcesLoaded, verdict.sources.filter((s) => s.status === 200).length);
  for (const s of verdict.sources) {
    assert.ok(s.url.startsWith('https://') && Number.isInteger(s.status), s.url);
    if (s.status === 200) assert.ok(ISO.test(s.readAt) && !/between|,/.test(s.readAt), `one instant: ${s.url} ${s.readAt}`);
    else assert.equal(s.readAt, null, s.url);
  }
  assert.ok(verdict.sources.some((s) => s.status !== 200), 'the pages that failed are listed with their status');
});

test('every number on our side equals the field in the named file at the stamp the row recorded, every ratio follows its rule', () => {
  const r = check(verdict);
  assert.deepEqual(r.problems, []);
  const withFile = verdict.measures.filter((m) => m.oursFile).length;
  assert.equal(r.compared, withFile, 'every row with a file is compared, none skipped');
  assert.ok(withFile >= 20, `rows with a file: ${withFile}`);
  const both = verdict.measures.filter((m) => typeof m.theirs === 'number' && typeof m.ours === 'number');
  assert.equal(verdict.counts.both, both.length);
  assert.ok(both.every((m) => m.kind === 'scale' || typeof m.ratio === 'number'), 'a ratio on every both-sided row');
  console.log(`grok-bot rows compared ${r.compared} of ${withFile} (${r.pinned} on a live file cut back to its pin), stale 0, both-sided ${both.length}`);
});

test('like with like: GSM8K from the finished whole set, each pair on one population, printed in the statement', () => {
  const gsm = verdict.pairs.filter((p) => p.set === 'gsm8k');
  assert.equal(gsm.length, 2);
  assert.ok(gsm.every((p) => p.file === 'bench/verdicts/public-gsm8k.json'), 'the whole set, not the partial');
  assert.equal(load('bench/verdicts/public-gsm8k.json').complete, true);
  const all = gsm.find((p) => p.population === 'all');
  assert.equal(all.organism.n, load('bench/verdicts/public-gsm8k.json').n);
  const he = verdict.pairs.filter((p) => p.set === 'humaneval');
  assert.ok(he.length >= 1 && he.every((p) => /public-humaneval(-partial)?\.json$/.test(p.file)), 'HumanEval from the partial or the whole set');
  if (existsSync(path.join(ROOT, 'bench/verdicts/public-humaneval.json'))) assert.ok(he.every((p) => p.file === 'bench/verdicts/public-humaneval.json'), 'the whole HumanEval set once it exists');
  for (const p of verdict.pairs) assert.equal(p.organism.n, p.alone.n, `${p.set} ${p.population}`);
});

test('the command re-runs: build() over the files on disk gives the same verdict and markdown', () => {
  const { verdict: again, md: mdAgain } = build(ROOT, verdict.at, verdict.pins);
  for (const k of ['measures', 'pairs', 'pins', 'counts', 'checks', 'statement', 'sources', 'split', 'command', 'barMet', 'derived']) assert.deepEqual(again[k], verdict[k], k);
  assert.equal(mdAgain, md, 'markdown');
});

test('no em-dash, and the markdown prints every row and the 10000x paragraph', () => {
  for (const f of [MD, VERDICT, path.join(ROOT, 'bench', 'grok-bot.mjs'), path.join(ROOT, 'notes', 'grok-bot.md'), fileURLToPath(import.meta.url)]) {
    assert.equal(readFileSync(f, 'utf8').includes(EM), false, `em-dash in ${f}`);
  }
  for (const m of verdict.measures.filter((x) => typeof x.ours === 'number')) {
    assert.ok(md.includes(`| ${m.name} | ${m.ours} | ${m.unit} | ${m.oursFile} (${m.oursPath})`), `section 6 row: ${m.name}`);
  }
  for (const n of ['## 0.', '## 1.', '## 2.', '## 3.', '## 4.', '## 5.', '## 6.', '## 7.', '## 8.', '## Sources']) assert.ok(md.includes(n), n);
  const para = md.split('\n').find((l) => l.startsWith('What "10000x better and cheaper" would take on the'));
  assert.ok(para, 'the 10000x paragraph');
  for (const m of verdict.measures.filter((x) => typeof x.theirs === 'number' && typeof x.ours === 'number')) {
    assert.ok(para.includes(String(m.ours)) || para.includes(String(Number((100 - m.ours).toPrecision(4)))), `the paragraph reads ${m.name}`);
  }
});

// this test's own tokenizer: every run of digits, with its decimals, as a string
const tokens = (x) => String(x).match(/\d+(?:\.\d+)?/g) ?? [];
function notPrinted(values, printedLines) {
  const have = new Set(printedLines.flatMap(tokens));
  return [...new Set(values.flatMap(tokens))].filter((t) => !have.has(t));
}

test('every number the statement and the 10000x paragraph quote is printed by the command', () => {
  const b = build(ROOT, verdict.at, verdict.pins);
  assert.equal(b.verdict.statement, verdict.statement, 'the recorded values are the ones of the statement on disk');
  const printed = report(b);
  assert.ok(!printed.some((l) => l.includes(verdict.statement.slice(0, 80)) || l.includes(b.tenK.slice(0, 80))), 'the prose is never printed whole');
  const values = [...b.quoted.statement, ...b.quoted.tenK];
  const numeric = values.flatMap(tokens);
  assert.ok(b.quoted.statement.length >= 30 && b.quoted.tenK.length >= 20 && numeric.length >= 100, `quoted values ${b.quoted.statement.length} + ${b.quoted.tenK.length}, numeric tokens ${numeric.length}`);
  // the two numbers the verify plane found unprinted are recorded values: the interval and the set size
  const iv = verdict.pairs.find((p) => p.set === 'gsm8k' && p.population === 'all').interval;
  for (const bound of [iv.lo, iv.hi]) {
    const t = (Math.round(100 * bound * 100) / 100).toFixed(2);
    assert.ok(tokens(verdict.statement).includes(t) && numeric.includes(t), `the interval bound ${t} is quoted and recorded`);
  }
  const he = verdict.pairs.find((p) => p.set === 'humaneval');
  if (he.live) assert.ok(numeric.includes(String(he.progress.of)), 'the HumanEval set size is recorded');
  assert.deepEqual(notPrinted(values, printed.slice(0, -1)), []);
  assert.equal(verdict.checks.everyNumberTheProseQuotesIsPrinted, true);
  // controls: without the derived lines, or without the pair lines, numbers the prose quotes go unprinted
  const noDerived = notPrinted(values, printed.filter((l) => !l.startsWith('derived ')));
  assert.ok(noDerived.length > 0, 'dropping the derived lines leaves quoted numbers unprinted');
  const noPairs = notPrinted(values, printed.filter((l) => !l.startsWith('pair ')));
  assert.ok(noPairs.includes('90.14'), `dropping the pair lines leaves the percentages unprinted: ${noPairs.join(' ')}`);
  console.log(`grok-bot prose numbers: ${new Set(numeric).size} distinct tokens quoted, ${notPrinted(values, printed.slice(0, -1)).length} unprinted; control without derived lines ${noDerived.length} unprinted, without pair lines ${noPairs.length}`);
});

test('build() reads no file and probes no path whose stamp the verdict does not record', () => {
  const b = build(ROOT, verdict.at, verdict.pins);
  const stamped = new Set([...verdict.measures.filter((m) => m.oursFile).map((m) => m.oursFile), ...verdict.pairs.map((p) => p.file), ...Object.keys(verdict.pins)]);
  // the one probe allowed: whether the whole HumanEval set exists, which test 4 holds to the verdict
  const allowed = new Set(['exists:bench/verdicts/public-humaneval.json']);
  const unstamped = (inputs) => inputs.filter((r) => !stamped.has(r) && !allowed.has(r));
  assert.deepEqual(unstamped(b.inputs), []);
  for (const rel of stamped) assert.ok(b.inputs.includes(rel), `the recorder saw ${rel}`);
  assert.ok(b.inputs.includes('bench/verdicts/conceive.json'), 'section 8 reads the conceive verdict through a stamped row');
  // control: a probe of a path no stamp holds is caught
  assert.deepEqual(unstamped([...b.inputs, 'exists:bench/conceive.mjs']), ['exists:bench/conceive.mjs']);
  console.log(`grok-bot inputs ${b.inputs.length}, stamped ${stamped.size}, unstamped ${unstamped(b.inputs).length}`);
});

test('controls: each check fails on a copy bent the way it guards against', () => {
  const caught = (v, prefix) => check(v).problems.some((p) => p.startsWith(prefix));
  const stableRow = verdict.measures.findIndex((m) => /public-arc\.json$/.test(m.oursFile ?? ''));
  assert.ok(stableRow >= 0);
  const bent = structuredClone(verdict); bent.measures[stableRow].ours += 1;
  assert.ok(caught(bent, 'ours '), 'bent number');

  const both = verdict.measures.findIndex((m) => typeof m.theirs === 'number' && typeof m.ours === 'number' && m.ratio !== null);
  const bentRatio = structuredClone(verdict); bentRatio.measures[both].ratio *= 10000;
  assert.ok(caught(bentRatio, 'ratio '), 'bent ratio');

  const unread = structuredClone(verdict); unread.measures[0].theirsUrl = 'https://example.invalid/never-read';
  assert.ok(caught(unread, 'theirsUrl '), 'unread URL');

  const silent = structuredClone(verdict);
  const missing = silent.measures.findIndex((m) => typeof m.ours !== 'number' && !m.oursFile);
  silent.measures[missing].oursNote = 'n/a';
  assert.ok(caught(silent, 'missing ours'), 'a silent gap');

  const stale = structuredClone(verdict); stale.measures[stableRow].oursAt = '2026-01-01T00:00:00.000Z';
  assert.ok(caught(stale, 'stale: '), 'a stale stamp fails, it is not skipped');

  const range = structuredClone(verdict); range.sources[0].readAt = '2026-09-27, between 19:12Z and 19:16:12Z (UTC by date -u)';
  assert.ok(caught(range, 'readAt not one ISO instant'), 'a range readAt');

  const failed = structuredClone(verdict); failed.sources.find((s) => s.status !== 200).readAt = '2026-09-27T19:12:50.547Z';
  assert.ok(caught(failed, 'a page that did not load'), 'a failed page with a read time');

  const longQuote = structuredClone(verdict); longQuote.sources[0].quote = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen';
  assert.ok(caught(longQuote, 'quote not under 15 words'), 'a quote of 15 words');

  const notPrinted = structuredClone(verdict);
  const t = notPrinted.measures.findIndex((m) => typeof m.theirs === 'number');
  notPrinted.measures[t].theirs += 1;
  assert.ok(caught(notPrinted, 'theirs '), 'a Grok number its page did not print');

  const twoPops = structuredClone(verdict);
  const g = twoPops.pairs.findIndex((p) => p.set === 'gsm8k' && p.population === 'all');
  twoPops.pairs[g].organism = structuredClone(verdict.pairs.find((p) => p.set === 'gsm8k' && p.population === 'heldOut').organism);
  assert.ok(caught(twoPops, 'pair on two populations'), 'held-out organism beside an all-records control');

  const wrongPair = structuredClone(verdict); wrongPair.pairs[g].alone.correct += 1;
  assert.ok(caught(wrongPair, 'pair gsm8k all is not what the rows recount'), 'a pair the rows do not recount');

  // a live file: an earlier row that changed after the stamp, and a pin claiming more rows than exist
  const live = verdict.measures.find((m) => m.oursLive);
  if (live) {
    const movedRows = structuredClone(verdict); movedRows.pins[live.oursFile].digest = '0000000000000000';
    for (const m of movedRows.measures) if (m.oursFile === live.oursFile) m.oursAt = movedRows.pins[live.oursFile].at = '2026-01-01T00:00:00.000Z';
    assert.ok(caught(movedRows, 'stale: '), 'a pinned live file whose rows changed');
    const tooMany = structuredClone(verdict); tooMany.pins[live.oursFile].rows += 100000;
    for (const m of tooMany.measures) if (m.oursFile === live.oursFile) m.oursAt = tooMany.pins[live.oursFile].at = '2026-01-01T00:00:00.000Z';
    assert.ok(caught(tooMany, 'stale: '), 'a pin that claims rows the file never held');
    const unpinned = structuredClone(verdict); delete unpinned.pins[live.oursFile];
    assert.ok(caught(unpinned, 'a live file without a pin'), 'a live row without a pin');
  } else assert.deepEqual(verdict.pins, {}, 'no live file read, so no pin');
  // the build refuses a pin whose rows changed rather than re-reading the file as it is now
  const pinFile = Object.keys(verdict.pins)[0];
  if (pinFile) assert.throws(() => build(ROOT, verdict.at, { [pinFile]: { ...verdict.pins[pinFile], digest: '0000000000000000' } }), /no longer holds/);
});
