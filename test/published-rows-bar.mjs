// test/published-rows-bar.mjs: the bar of item published-rows (board 23).
// Author: board 23 builder (item published-rows), 2026-09-26.
//
// The item: research/published.json gains cited rows for the two endpoints of his fourth
// acceptance test ("grows ALONE from the GPT-4o row to the Opus 5.5 row", 2026-09-26 11:32) on
// the three public sets this tree runs (GSM8K, HumanEval, ARC-AGI-1), and for Claude Fable 5.1
// where a published number exists (P15: a Fable 5.1 row is added only from a published source).
// A number that could not be found published is NOT typed: notes/published.md names the pair on
// an "OMITTED |" line with the places looked.
//
// This script reads files only. It calls no model, opens no socket, runs no bench of the sets.
//   BAR    : every row of research/published.json passes rowProblems (URL source, a date that
//            is a real calendar date and not after today, a score in [0,100]; a row added on or
//            after FULL_CITATION_FROM also a model, a metric, a printed value that IS the score,
//            and a quote under QUOTE_WORDS_UNDER words that holds it), and
//            every required pair (GPT-4o and Claude Opus 5.5, each on GSM8K and HumanEval, the
//            item's bar as written) has a row that bench/public.mjs publishedFor returns.
//   TESTS  : node --test test/published.test.mjs, its tally read from its own output.
//   CONTROL: rowProblems run on mutants of the real rows (URL removed, score 101, printed
//            changed, quote padded past the word limit, date removed, a date after today, a date
//            that is not on the calendar); each mutant must be rejected FOR ITS OWN CAUSE (the
//            problem it plants is among the problems returned), or the checker is true of nothing.
// It prints the row census (counts, dates read, the longest added quote against the limit),
// "published rows for <benchmark>" for each set, the pair matrix, the control, the tally, and
// writes bench/verdicts/published-rows.json from those measurements. Every number the verdict's
// statement quotes is one of those printed lines.
//   node test/published-rows-bar.mjs [--out <verdict path>]
// Not a node:test file (no .test.mjs suffix): the gate does not run it.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PUBLISHED_FILE = path.join(ROOT, 'research', 'published.json');
export const NOTES_FILE = path.join(ROOT, 'notes', 'published.md');
/** Rows read on or after this date carry the full citation this item added: model, printed, quote. */
export const FULL_CITATION_FROM = '2026-09-26';
/** A quote on an added row is under this many words. */
export const QUOTE_WORDS_UNDER = 15;
const DAY_MS = 86400000;
/** The furthest ahead any time zone runs of UTC (UTC+14), so "today" is the latest date on Earth. */
const AHEAD_MS = 14 * 3600000;

/** The calendar date a readAt starts with, as UTC ms at midnight, or null when it is not a real date (2026-02-30 is not). */
export function readDateOf(readAt) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(readAt || ''));
  if (!m) return null;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const t = Date.UTC(y, mo - 1, d);
  const back = new Date(t);
  return back.getUTCFullYear() === y && back.getUTCMonth() === mo - 1 && back.getUTCDate() === d ? t : null;
}

/** Midnight UTC of the latest calendar date anywhere on Earth at time now: a readAt after it is in the future wherever it was written. */
export function latestDayAt(now = Date.now()) { return Math.floor((now + AHEAD_MS) / DAY_MS) * DAY_MS; }
/** The endpoints of his fourth acceptance test, and the orchestrator's own model. */
export const MODELS = Object.freeze([
  Object.freeze({ name: 'GPT-4o', match: /gpt-4o(?!-mini)/i }),
  Object.freeze({ name: 'Claude Opus 5.5', match: /opus 5\.5/i }),
  Object.freeze({ name: 'Claude Fable 5.1', match: /fable 5\.1/i }),
]);
export const BENCHMARKS = Object.freeze(['gsm8k', 'humaneval', 'arc-agi-1']);
/** The item's bar as written: GPT-4o and Opus 5.5 rows for at least GSM8K and HumanEval. */
export const REQUIRED = Object.freeze([
  ['GPT-4o', 'gsm8k'], ['GPT-4o', 'humaneval'], ['Claude Opus 5.5', 'gsm8k'], ['Claude Opus 5.5', 'humaneval'],
].map((x) => Object.freeze(x)));

const words = (s) => String(s).trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));

/** Everything wrong with one row of research/published.json; an empty list is a clean row. */
export function rowProblems(r, now = Date.now()) {
  const out = [];
  if (!r || typeof r !== 'object') return ['not an object'];
  if (typeof r.benchmark !== 'string' || !r.benchmark) out.push('no benchmark key');
  if (typeof r.system !== 'string' || !r.system) out.push('no system');
  if (!/https?:\/\/\S+/.test(String(r.source || ''))) out.push('source has no URL');
  if (!/^\d{4}-\d{2}-\d{2}/.test(String(r.readAt || ''))) out.push('readAt has no date');
  else {
    const t = readDateOf(r.readAt);
    if (t === null) out.push('readAt ' + String(r.readAt).slice(0, 10) + ' is not a calendar date');
    else if (t > latestDayAt(now)) out.push('readAt ' + String(r.readAt).slice(0, 10) + ' is after today');
  }
  if (typeof r.score !== 'number' || !Number.isFinite(r.score) || r.score < 0 || r.score > 100) out.push('score is not a number in [0,100]');
  if (String(r.readAt || '').slice(0, 10) >= FULL_CITATION_FROM) {
    if (typeof r.model !== 'string' || !r.model) out.push('no model');
    if (typeof r.metric !== 'string' || !r.metric) out.push('no metric variant');
    if (typeof r.printed !== 'string' || !r.printed) out.push('no printed value');
    else {
      const v = Number(r.printed.replace(/%$/, ''));
      const pct = /%$/.test(r.printed) || v > 1 ? v : v * 100;
      if (!Number.isFinite(v) || Math.abs(pct - r.score) > 1e-9) out.push('printed ' + JSON.stringify(r.printed) + ' is not the score ' + r.score);
    }
    if (typeof r.quote !== 'string' || !r.quote) out.push('no quote');
    else {
      if (words(r.quote).length >= QUOTE_WORDS_UNDER) out.push('quote is ' + words(r.quote).length + ' words, not under ' + QUOTE_WORDS_UNDER);
      if (typeof r.printed === 'string' && !r.quote.includes(r.printed)) out.push('quote does not hold the printed value');
    }
  }
  return out;
}

/** Which of MODELS a row belongs to, by its model field when it has one, else by its system name. */
export function modelOf(r) {
  const s = String((r && (r.model || r.system)) || '');
  const hit = MODELS.find((m) => m.match.test(s));
  return hit ? hit.name : null;
}

/** The "OMITTED | model | benchmark | looked: ..." lines of notes/published.md. */
export function omissionsOf(text) {
  const out = [];
  for (const line of String(text).split(/\r?\n/)) {
    const m = /^OMITTED \| ([^|]+?) \| ([^|]+?) \| (.+)$/.exec(line.trim());
    if (m) out.push({ model: m[1], benchmark: m[2], looked: m[3], urls: (m[3].match(/https?:\/\/\S+/g) || []).length });
  }
  return out;
}

export function readPublished(file = PUBLISHED_FILE) { return JSON.parse(readFileSync(file, 'utf8')); }

/** The model x benchmark matrix: the rows found, or the omission line, for each pair. */
export function matrix(rows, omitted) {
  const out = [];
  for (const m of MODELS) for (const b of BENCHMARKS) {
    const found = rows.filter((r) => r.benchmark === b && modelOf(r) === m.name);
    const om = omitted.find((o) => o.model === m.name && o.benchmark === b) || null;
    out.push({ model: m.name, benchmark: b, rows: found.map((r) => ({ system: r.system, score: r.score, metric: r.metric || null, source: r.source, readAt: r.readAt })), omitted: om });
  }
  return out;
}

/** Mutants of real rows, each of which rowProblems must reject; expect is the problem the mutant plants. */
export function mutants(rows) {
  const full = rows.find((r) => String(r.readAt || '').slice(0, 10) >= FULL_CITATION_FROM);
  const old = rows.find((r) => String(r.readAt || '').slice(0, 10) < FULL_CITATION_FROM);
  const out = [];
  for (const base of [full, old].filter(Boolean)) {
    const isFull = base === full;
    out.push({ name: 'url removed (' + base.system + ')', expect: /source has no URL/, row: { ...base, source: 'the leaderboard' } });
    out.push({ name: 'score 101 (' + base.system + ')', expect: /score is not a number in \[0,100\]/, row: { ...base, score: 101 } });
    out.push({ name: 'score as a string (' + base.system + ')', expect: /score is not a number in \[0,100\]/, row: { ...base, score: String(base.score) } });
    out.push({ name: 'date removed (' + base.system + ')', expect: /readAt has no date/, row: { ...base, readAt: 'today' } });
    out.push({ name: 'date after today (' + base.system + ')', expect: /is after today/, row: { ...base, readAt: '2099-01-01 00:00 EDT' } });
    // a date off the calendar on the same side of FULL_CITATION_FROM as its base, so only the date is wrong
    out.push({ name: 'date not on the calendar (' + base.system + ')', expect: /is not a calendar date/, row: { ...base, readAt: (isFull ? '2026-09-31' : '2026-02-30') + ' 00:00 EDT' } });
  }
  if (full) {
    const pad = Array.from({ length: QUOTE_WORDS_UNDER }, (_, i) => 'w' + (i + 1)).join(' ');
    out.push({ name: 'printed changed (' + full.system + ')', expect: /is not the score/, row: { ...full, printed: String(full.score + 1) } });
    out.push({ name: 'quote padded past ' + QUOTE_WORDS_UNDER + ' words (' + full.system + ')', expect: /words, not under/, row: { ...full, quote: full.quote + ' ' + pad } });
    out.push({ name: 'quote without the value (' + full.system + ')', expect: /does not hold the printed value/, row: { ...full, quote: 'a quote with no number' } });
    out.push({ name: 'model removed (' + full.system + ')', expect: /no model/, row: { ...full, model: undefined } });
  }
  return out;
}

/** A mutant is caught only when the problem it plants is among the problems returned. */
export function caught(m, now = Date.now()) {
  const problems = rowProblems(m.row, now);
  return { problems, rejected: problems.length > 0, forItsCause: problems.some((p) => m.expect.test(p)) };
}

async function main() {
  const argOut = process.argv.indexOf('--out');
  const OUT = argOut > 0 ? path.resolve(process.argv[argOut + 1]) : path.join(ROOT, 'bench', 'verdicts', 'published-rows.json');
  const t0 = Date.now();
  const doc = readPublished();
  const rows = doc.rows;
  const PUB = await import(pathToFileURL(path.join(ROOT, 'bench', 'public.mjs')).href);
  const omitted = omissionsOf(readFileSync(NOTES_FILE, 'utf8'));

  // every row
  const bad = rows.map((r, i) => ({ i, system: r.system, problems: rowProblems(r) })).filter((x) => x.problems.length);
  const added = rows.filter((r) => String(r.readAt || '').slice(0, 10) >= FULL_CITATION_FROM);
  const earlierN = rows.length - added.length;
  const dates = rows.map((r) => String(r.readAt || '').slice(0, 10)).sort();
  const afterToday = rows.filter((r) => rowProblems(r).some((p) => /is after today/.test(p))).length;
  const offCalendar = rows.filter((r) => rowProblems(r).some((p) => /is not a calendar date/.test(p))).length;
  const quoteWords = added.map((r) => String(r.quote || '').trim().split(/\s+/).length);
  const longestQuote = quoteWords.length ? Math.max(...quoteWords) : null;
  console.log('ROWS ' + rows.length + ' in research/published.json: ' + earlierN + ' read before ' + FULL_CITATION_FROM + ', ' + added.length + ' read on or after it; dates read ' + dates[0] + ' to ' + dates[dates.length - 1] + '; ' + afterToday + ' after today, ' + offCalendar + ' not on the calendar');
  console.log('QUOTES of the ' + added.length + ' added rows: longest ' + longestQuote + ' words (whitespace tokens), the limit is under ' + QUOTE_WORDS_UNDER + ' words');
  console.log('');

  // the published rows for each set, through the consumer the bench uses
  const through = {};
  for (const set of PUB.SETS) {
    const b = PUB.SET_META[set].benchmark;
    const got = PUB.publishedFor(b);
    through[b] = got;
    console.log('published rows for ' + b + ' (set ' + set + '): ' + got.length + ' rows through bench/public.mjs publishedFor');
    for (const r of got.filter((x) => modelOf(x))) {
      console.log('  ' + String(r.score).padStart(6) + ' ' + String(r.unit).padEnd(8) + String(r.system).padEnd(58) + (r.class || '') + (r.metric ? ' [' + r.metric + ']' : '') + ' ' + String(r.readAt));
    }
  }

  // the pair matrix, and whether publishedFor returns each required row
  const mx = matrix(rows, omitted);
  const req = REQUIRED.map(([model, benchmark]) => {
    const cell = mx.find((c) => c.model === model && c.benchmark === benchmark);
    const viaConsumer = (through[benchmark] || []).filter((r) => modelOf(r) === model).length;
    return { model, benchmark, rows: cell.rows.length, viaPublishedFor: viaConsumer, omitted: !!cell.omitted };
  });
  console.log('');
  for (const c of mx) {
    const top = c.rows.length ? c.rows.reduce((a, b) => (b.score > a.score ? b : a)) : null;
    console.log('pair ' + c.model.padEnd(17) + c.benchmark.padEnd(10) + (top ? c.rows.length + ' row(s), top ' + top.score + ' ' + top.system : c.omitted ? 'OMITTED, not published where looked (' + c.omitted.urls + ' URLs named in notes/published.md)' : 'NO ROW AND NO OMISSION LINE'));
  }
  const conflicts = mx.filter((c) => c.rows.length && c.omitted).map((c) => c.model + ' ' + c.benchmark);
  const undocumented = mx.filter((c) => !c.rows.length && !c.omitted).map((c) => c.model + ' ' + c.benchmark);

  // the control: mutants of real rows
  const ms = mutants(rows).map((m) => ({ name: m.name, expect: String(m.expect), ...caught(m) }));
  const survived = ms.filter((m) => !m.forItsCause);
  console.log('');
  console.log('CONTROL mutants of real rows rejected for their own cause: ' + (ms.length - survived.length) + '/' + ms.length + (survived.length ? ' (survived: ' + survived.map((m) => m.name).join('; ') + ')' : ''));

  // the tests
  const tr = spawnSync(process.execPath, ['--test', 'test/published.test.mjs'], { cwd: ROOT, encoding: 'utf8', timeout: 120000 });
  const tout = String(tr.stdout || '') + String(tr.stderr || '');
  const tally = {};
  for (const k of ['tests', 'pass', 'fail', 'skipped', 'todo', 'cancelled']) {
    const m = new RegExp('^ℹ ' + k + ' (\\d+)$', 'm').exec(tout);
    tally[k] = m ? Number(m[1]) : null;
  }
  const tallyLine = 'tests ' + tally.tests + ' pass ' + tally.pass + ' fail ' + tally.fail + ' skipped ' + tally.skipped + ' (exit ' + tr.status + ')';
  console.log('TESTS node --test test/published.test.mjs: ' + tallyLine);

  const reqMet = req.filter((x) => x.rows > 0 && x.viaPublishedFor > 0);
  const reqMissing = req.filter((x) => !(x.rows > 0 && x.viaPublishedFor > 0));
  const testsGreen = tr.status === 0 && tally.fail === 0 && tally.tests > 0 && tally.pass === tally.tests;
  const rowsClean = bad.length === 0;
  const controlBites = survived.length === 0 && ms.length > 0;
  const datesClean = afterToday === 0 && offCalendar === 0;
  const barMet = rowsClean && datesClean && testsGreen && controlBites && reqMissing.length === 0 && conflicts.length === 0 && undocumented.length === 0;
  const notMetBecause = [];
  if (!rowsClean) notMetBecause.push(bad.length + ' row(s) fail rowProblems');
  if (!testsGreen) notMetBecause.push('test/published.test.mjs is not green: ' + tallyLine);
  if (!controlBites) notMetBecause.push(survived.length + ' mutant(s) survived the checker');
  for (const x of reqMissing) notMetBecause.push(x.model + ' ' + x.benchmark + ': no published row' + (x.omitted ? ' (omitted in notes/published.md: not found published where looked, so not typed)' : ''));
  if (conflicts.length) notMetBecause.push('row and omission line both present: ' + conflicts.join(', '));
  if (undocumented.length) notMetBecause.push('no row and no omission line: ' + undocumented.join(', '));

  const openPairs = mx.filter((c) => !c.rows.length).map((c) => c.model + ' ' + c.benchmark);
  const statement = 'research/published.json holds ' + rows.length + ' cited rows, ' + added.length + ' of them read on or after ' + FULL_CITATION_FROM
    + ' and carrying a source URL, the date read, the metric variant, the value exactly as printed and a quote under ' + QUOTE_WORDS_UNDER + ' words (the longest is ' + longestQuote + '); '
    + (rows.length - bad.length) + ' of ' + rows.length + ' rows pass the row check (' + afterToday + ' of them dated after today), and ' + (ms.length - survived.length) + ' of ' + ms.length
    + ' deliberately broken copies of real rows are rejected by it, each for the fault planted in it. Of the four pairs the item named (GPT-4o and Claude Opus 5.5, each on GSM8K and HumanEval) '
    + reqMet.length + ' have a published row that bench/public.mjs publishedFor returns: '
    + (reqMet.map((x) => x.model + ' ' + x.benchmark).join(', ') || 'none') + '. '
    + (reqMissing.length ? reqMissing.map((x) => x.model + ' ' + x.benchmark).join(' and ') + ' were not found published (the vendor announcement and system card were read and name neither benchmark), so no number was typed and the bar as written is not met. ' : '')
    + 'Both endpoints do have a row on ARC-AGI-1: ' + mx.filter((c) => c.benchmark === 'arc-agi-1' && c.model !== 'Claude Fable 5.1' && c.rows.length).map((c) => c.model + ' ' + c.rows.reduce((a, b) => (b.score > a.score ? b : a)).score + ' percent').join(' and ')
    + ' on the ARC Prize semi-private set, which is not the public evaluation set this tree runs. Pairs with no published row: ' + (openPairs.join(', ') || 'none') + '. No model was called and no set was re-run.';

  const verdict = {
    at: new Date().toISOString(),
    item: 'published-rows',
    board: 23,
    command: 'node test/published-rows-bar.mjs (launched as node tools/budget.mjs --ram-mb 4000 --disk-mb 64 --dir <scratch> --record <scratch>/budget.json -- node --max-old-space-size=4000 test/published-rows-bar.mjs)',
    node: process.version,
    isTheBar: true,
    barMet,
    bar: 'every row of research/published.json passes rowProblems, the mutant control is rejected in full, node --test test/published.test.mjs is green, and GPT-4o and Claude Opus 5.5 each have a published row on GSM8K and on HumanEval that bench/public.mjs publishedFor returns (the item bar as written)',
    notMetBecause,
    split: {
      development: 'the rows themselves, read from the web on ' + FULL_CITATION_FROM + ' and appended to research/published.json',
      heldOut: 'none',
      why: 'this item measures citations, not a model: there is no accuracy of ours to hold data out for. The check is run on every row, the ' + (rows.length - added.length) + ' rows written by earlier boards as well as the ' + added.length + ' added here, and against mutants of both kinds',
      contaminated: false,
    },
    control: { name: 'mutants of real rows through rowProblems, each required to fail for the fault it plants', rejected: ms.length - survived.length, of: ms.length, mutants: ms.map((m) => ({ name: m.name, expect: m.expect, rejected: m.rejected, forItsCause: m.forItsCause })) },
    tests: { command: 'node --test test/published.test.mjs', ...tally, exit: tr.status },
    rows: { total: rows.length, earlier: earlierN, added: added.length, clean: rows.length - bad.length, bad, datesRead: { first: dates[0], last: dates[dates.length - 1], afterToday, offCalendar } },
    quotes: { limitUnderWords: QUOTE_WORDS_UNDER, longestWords: longestQuote, of: added.length },
    required: req,
    pairs: mx.map((c) => ({ model: c.model, benchmark: c.benchmark, rows: c.rows, omitted: c.omitted ? { looked: c.omitted.looked } : null })),
    modelCalls: 0,
    ms: Date.now() - t0,
    statement,
  };
  writeFileSync(OUT, JSON.stringify(verdict, null, 2) + '\n');
  console.log('');
  console.log('BAR published-rows: barMet ' + barMet + '; required pairs with a row ' + reqMet.length + '/' + req.length + '; rows clean ' + (rows.length - bad.length) + '/' + rows.length + '; added ' + added.length);
  for (const r of notMetBecause) console.log('  not met: ' + r);
  console.log('verdict written to ' + path.relative(ROOT, OUT).split(path.sep).join('/'));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((e) => { console.error('published-rows-bar stopped: ' + String((e && e.stack) || e)); process.exitCode = 2; });
}
