// bench/ladder.mjs: TODAY'S SCORE, DATED, AND THE DAY OVER DAY LINE.
//
// His words this board answers: "gets better measured around 5-10 percent every day". One
// command prints four columns, their mean, and what that mean did against yesterday's.
//
// THE FOUR COLUMNS, each a rate in [0, 1]:
//
//   answer      bench/answer.mjs run() on the ladder's seed, arms organism and null. The
//               column is the organism arm over the SEEDED suites only (algebra, sequence,
//               grid); the forty fixture questions are fixed text and the same every day, so
//               one of them is drawn as an anchor and none of them is in the column.
//   code        bench/code.mjs run() with its tasks generated IN MEMORY on the ladder's seed,
//               arms organism and null. The committed fixture is never read and never
//               rewritten, so the bar's own tasks do not move when the ladder runs.
//   capability  bench/capability.mjs run() with write false: induction tasks solved plus
//               algebra equations solved and verified, over how many there were.
//   health      the whole organism built by seeds/whole.mjs at the size test/whole.test.mjs
//               uses, ticked a fixed number of ticks, observed, and its health taken. No
//               model, no socket: this column is the organism's own state.
//
// THE SEED IS THE DATE, ladder/<date>. Tomorrow's items are different items, so yesterday's
// cannot be memorised, and a score that rises is a score that rose on questions nobody had
// seen. The capability column is the one exception and it says so in the verdict: its market
// section is seeded by integers inside capability/market.mjs and does not move with the date.
//
// THE TIER. Tier 1 is the sample sizes that finish in about ten minutes with Ollama up. Tier
// N+1 unlocks when EVERY accuracy column of the previous day at tier N is at or above 0.9 and
// health is not below the day before. A higher tier draws more items, and harder ones: the
// answer column takes more of each suite, which draws more of the deeper grids and the longer
// sequences that sit at the end of those lists, and the code column weights its draw toward
// the kinds the small model failed most in the previous day's rows. The rule and each tier's
// counts are printed and written into the verdict.
//
// THE FILES. bench/verdicts/ladder/<date>.json is written once per run and never overwritten:
// a second run the same day writes <date>-2.json, then -3, and the series takes the LAST of
// the day and prints which one it took. bench/verdicts/ladder.json is the series: every dated
// file's four columns, the composite, the day over day delta per column and for the
// composite in percent of the previous day, nFor95 for the answer and code columns as their
// own benches compute it, and the line.
//
//   node bench/ladder.mjs                         THE BOARD, read from the verdicts on disk (below)
//   node bench/ladder.mjs --daily [--date YYYY-MM-DD] [--tier N] [--quick] [--model M] [--log]
//   node bench/ladder.mjs --health [--seed S] [--ticks N]   the health child, one JSON line
//   node bench/ladder.mjs --rows                  the rows item verdict (see runRows below)
//
// Any of --daily, --date, --tier, --quick, --model or --log runs the daily ruler, so the 04:00
// line bin/serve.mjs and tools/schedule-ladder.mjs run (--log) is the daily ruler as before.
// --quick opens no socket: it prints the null arms and health only, in seconds, and writes
// nothing under bench/verdicts/ladder/ and no series.
//
// THE BOARD (Board 10, his P4 and P15). With no flag the ladder calls no model and opens no
// socket: it reads the verdicts on disk and prints, per public set (GSM8K, HumanEval, ARC-AGI-1
// evaluation), the organism's accuracy row against every published row kept inside that set's
// verdicts, in his order of bars (beat model-alone and null, then the 405B row, then the
// frontier row, the "smarter than the orchestrator" bar), the orchestrator's own row (Fable
// 5.1) only where research/published.json carries one with a URL, and the three answer classes
// with their shares and latencies: model (seconds), native (provenance exact or memory,
// microseconds) and direct (one hypervector lookup, nanoseconds). Then his P15 rulers: the
// ns per cell run and per packet hop of the browser organism, instances alive, the authored
// share, bytes per score point, and improvement per wall second. A set with only partial
// verdicts is printed PARTIAL with its sample size and the reason; a set with no verdict is
// printed "not measured". It rewrites bench/verdicts/ladder.json with the board beside the
// daily series (days, deltas, line), which daemon/health.mjs and the site read.
//
// BOARD 13 adds five readings, each from the verdicts on disk and each printing "not measured"
// or "partial" where a verdict is missing or narrow, never a zero: CLIMB (per public set, the
// newest board's number against the board before it, with both Wilson intervals; a verdict's
// board is its board field, else its landing window in docs/BOARDS.json), PLATEAU (the plateau
// second and the score gained after it, from plateau.json, beside Board 11's years.json),
// CLOCK (solved against clock from grid-clock.json and the whole-400 count, beside Board 11's
// grid-library.json), DIRECT (the leak-free recall from direct-clean.json beside the swept table
// of native.json and its control), and the truth about Board 12's MULTIPLYING bar: the builder's
// run and the verifier's rerun disagree in sign, every pick shares one searched fitness, and no
// run printed seed-to-seed noise, so the block prints "decided by tie-break noise, not a bar".
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, appendFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { run as answerRun, buildQuestions, nFor95 as answerNFor95, DEFAULT_MODEL } from './answer.mjs';
import { run as codeRun, buildTasks, KINDS, nFor95 as codeNFor95 } from './code.mjs';
import { run as capabilityRun } from './capability.mjs';
import { buildWhole } from '../seeds/whole.mjs';
import { observe } from '../self/observe.mjs';
import { closeWorld } from '../world/index.mjs';
import { ANSWER_PROVENANCE as PROVENANCE } from '../act/prompt.mjs';
import { ALIVE_WINDOW_MS } from '../daemon/health.mjs';
import { compressRecords, stateDirs, runTestFile } from './gate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const LADDER_DIR = path.join(HERE, 'verdicts', 'ladder');
export const SERIES_FILE = path.join(HERE, 'verdicts', 'ladder.json');

/** The four columns, in the order they are printed. */
export const COLUMNS = Object.freeze(['answer', 'code', 'capability', 'health']);
// His unlock sentence says "every ACCURACY column ... at or above 0.9 AND health is not
// below the day before": health carries its own clause and is not one of the three the floor
// is applied to. Measured, that distinction is the whole rule: health at the small size reads
// 0.859513 at 256 ticks and 0.866802 at 1024, so a floor applied to it would never unlock.
export const ACCURACY_COLUMNS = Object.freeze(['answer', 'code', 'capability']);
/** The suites whose items the ladder's seed moves. The fixture is not one of them. */
export const SEEDED_SOURCES = Object.freeze(['algebra', 'sequence', 'grid']);
/** The band his sentence names. Met is at or above the low edge. */
export const TARGET = Object.freeze({ low: 5, high: 10 });

const r6 = (x) => Math.round(x * 1e6) / 1e6;
const r2 = (x) => Math.round(x * 100) / 100;

// ---------------------------------------------------------------- the tiers
// answerPerSuite is bench/answer.mjs's tasks option: how many items are strided out of each
// of the three suites. codeTasks is how many of the forty generated tasks are drawn. The
// health column's ticks do not move with the tier: it is a state reading, not a sample.
export const TIERS = Object.freeze([
  Object.freeze({ tier: 1, answerPerSuite: 4, codeTasks: 6, healthTicks: 256 }),
  Object.freeze({ tier: 2, answerPerSuite: 8, codeTasks: 10, healthTicks: 256 }),
  Object.freeze({ tier: 3, answerPerSuite: 12, codeTasks: 16, healthTicks: 256 }),
  Object.freeze({ tier: 4, answerPerSuite: 18, codeTasks: 24, healthTicks: 256 }),
  // 30 is every generated task there is: the ten hand written ones are not drawn.
  Object.freeze({ tier: 5, answerPerSuite: 26, codeTasks: 30, healthTicks: 256 }),
]);

/** The tier's counts. A tier above the last one keeps the last one's counts and says so. */
export function tierSpec(n) {
  const want = Math.max(1, Math.floor(Number(n) || 1));
  const found = TIERS.find((t) => t.tier === want);
  if (found) return { ...found, capped: false };
  const last = TIERS[TIERS.length - 1];
  return { ...last, tier: want, capped: true };
}

export const UNLOCK_RULE = 'tier N+1 unlocks when every accuracy column (answer, code, capability) of the previous day at tier N is at or above 0.9 and health is not below the day before';
export const UNLOCK_FLOOR = 0.9;

/**
 * The tier a date runs at, from the days before it. Pure, so the rule can be graded on hand
 * written files rather than on a day that has to be waited for.
 * @param {object[]} days the series rows, ascending by date
 * @param {string} date the day about to run
 * @returns {{tier: number, why: string}}
 */
export function nextTier(days, date) {
  const before = days.filter((d) => d.date < date).sort((a, b) => (a.date < b.date ? -1 : 1));
  if (!before.length) return { tier: 1, why: 'no day before ' + date + ': the ladder starts at tier 1' };
  const prev = before[before.length - 1];
  const prevPrev = before.length > 1 ? before[before.length - 2] : null;
  const score = (c) => (prev.columns && prev.columns[c] ? prev.columns[c].score : null);
  const missing = COLUMNS.filter((c) => score(c) === null || score(c) === undefined);
  if (missing.length) return { tier: prev.tier, why: prev.date + ' is missing the ' + missing.join(', ') + ' column, so tier stays ' + prev.tier };
  const below = ACCURACY_COLUMNS.filter((c) => score(c) < UNLOCK_FLOOR);
  if (below.length) {
    return { tier: prev.tier, why: prev.date + ' at tier ' + prev.tier + ' scored below ' + UNLOCK_FLOOR + ' on ' + below.map((c) => c + ' ' + score(c)).join(', ') + ', so tier stays ' + prev.tier };
  }
  if (prevPrev && prevPrev.columns.health && prevPrev.columns.health.score !== null
    && prev.columns.health.score < prevPrev.columns.health.score) {
    return { tier: prev.tier, why: 'health fell from ' + prevPrev.columns.health.score + ' on ' + prevPrev.date + ' to ' + prev.columns.health.score + ' on ' + prev.date + ', so tier stays ' + prev.tier };
  }
  return { tier: prev.tier + 1, why: prev.date + ' at tier ' + prev.tier + ' cleared ' + UNLOCK_FLOOR + ' on ' + ACCURACY_COLUMNS.join(', ') + (prevPrev ? ' and health held at ' + prev.columns.health.score + ' against ' + prevPrev.columns.health.score : ' and had no day before it to fall from') + ': tier ' + (prev.tier + 1) };
}

// ---------------------------------------------------------------- the draw
/** The seed every column of a day is drawn on. */
export function seedFor(date) { return 'ladder/' + date; }

// The generators number their items by POSITION, so alg.cmp.0 is the name of a slot and not
// of a question: two dates produce alg.cmp.0 with different numbers in it. An item id here is
// therefore the slot name and a digest of the item's own content, which is what actually has
// to differ tomorrow for yesterday to be unmemorisable.
export function itemId(slot, content) {
  return slot + '#' + createHash('sha256').update(String(content)).digest('hex').slice(0, 8);
}
const answerItemId = (q) => itemId(q.id, q.q + ' => ' + q.a);
const codeItemId = (t) => itemId(t.id, t.spec + '|' + JSON.stringify(t.visible) + '|' + JSON.stringify(t.hidden));

/**
 * The kinds the code column weights its draw toward: the ones the organism arm failed most
 * in the previous day's rows, lowest accuracy first, ties by name.
 * @param {object|null} prev the previous day's row, or null on the first day
 * @returns {string[]}
 */
export function weakKinds(prev) {
  const by = prev && prev.columns && prev.columns.code ? prev.columns.code.byKind : null;
  if (!by) return [];
  const rows = Object.entries(by)
    .filter(([, v]) => v && v.n > 0 && typeof v.accuracy === 'number')
    .map(([k, v]) => ({ kind: k, accuracy: v.accuracy }));
  if (!rows.length) return [];
  rows.sort((a, b) => (a.accuracy - b.accuracy) || (a.kind < b.kind ? -1 : 1));
  return rows.slice(0, Math.ceil(rows.length / 2)).map((r) => r.kind);
}

/**
 * The items of one day, without running anything: the answer question ids and the code task
 * ids. Deterministic in (date, tier, weak), so two calls agree and two dates do not.
 * @param {object} opts { date, tier, weak }
 * @returns {{seed, tier, spec, answerIds, answerBySource, codeIds, codeByKind, kindOrder}}
 */
export function planItems({ date, tier = 1, weak = [] } = {}) {
  const seed = seedFor(date);
  const spec = tierSpec(tier);
  const questions = buildQuestions({ tasksPerSuite: spec.answerPerSuite, limit: 1, seed });
  const answer = questions.filter((q) => SEEDED_SOURCES.includes(q.source));
  const answerBySource = {};
  for (const q of answer) {
    const s = answerBySource[q.source] || (answerBySource[q.source] = { n: 0, families: {} });
    s.n++;
    s.families[q.family] = (s.families[q.family] || 0) + 1;
  }
  // The tasks are grouped by kind in generation order. The draw is a round robin over the
  // kinds, weak kinds first, so a bigger count at a higher tier lands on the kinds the model
  // failed rather than on more of what it already passes.
  // The ten hand written tasks are typed into bench/code.mjs and do not move with a seed, so
  // they are not drawn here: a daily ruler whose items repeat is a ruler that can be
  // memorised. KINDS is the five generated kinds and nothing else.
  const all = buildTasks({ seed }).filter((t) => KINDS.includes(t.kind));
  const kinds = [...new Set(all.map((t) => t.kind))];
  const kindOrder = [...weak.filter((k) => kinds.includes(k)), ...kinds.filter((k) => !weak.includes(k))];
  const queues = new Map(kindOrder.map((k) => [k, all.filter((t) => t.kind === k)]));
  const code = [];
  for (let round = 0; code.length < spec.codeTasks; round++) {
    let moved = false;
    for (const k of kindOrder) {
      const q = queues.get(k);
      if (round >= q.length) continue;
      code.push(q[round]);
      moved = true;
      if (code.length >= spec.codeTasks) break;
    }
    if (!moved) break;
  }
  const codeByKind = code.reduce((m, t) => (m[t.kind] = (m[t.kind] || 0) + 1, m), {});
  return {
    seed, tier: spec.tier, spec,
    // The raw slot names are what bench/code.mjs picks by; the item ids are what a reader
    // compares across days, because they carry the content and the slot names do not.
    answerIds: answer.map((q) => q.id), answerBySource,
    codeIds: code.map((t) => t.id), codeByKind, kindOrder,
    itemIds: { answer: answer.map(answerItemId), code: code.map(codeItemId) },
    anchorId: (questions.find((q) => q.source === 'fixture') || { id: null }).id,
  };
}

// ---------------------------------------------------------------- the dated files
const DATE_RE = /^(\d{4}-\d{2}-\d{2})(?:-(\d+))?\.json$/;

/** Today, as the date the ladder names its files by. */
export function todayString(d = new Date()) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/** Every dated file of a ladder directory, ascending by date then by run of the day. */
export function datedFiles(dir = LADDER_DIR) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const f of readdirSync(dir)) {
    const m = DATE_RE.exec(f);
    if (!m) continue;
    out.push({ file: f, date: m[1], run: m[2] ? Number(m[2]) : 1 });
  }
  out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.run - b.run));
  return out;
}

/** The path the next run of this day writes: <date>.json, then -2, then -3. Never a rewrite. */
export function nextDatedPath(dir, date) {
  const runs = datedFiles(dir).filter((f) => f.date === date).map((f) => f.run);
  const n = runs.length ? Math.max(...runs) + 1 : 1;
  return { path: path.join(dir, n === 1 ? date + '.json' : date + '-' + n + '.json'), run: n };
}

/** The file the series takes for a day: the last run of that day. */
export function latestOfDay(dir, date) {
  const runs = datedFiles(dir).filter((f) => f.date === date);
  return runs.length ? runs[runs.length - 1] : null;
}

// ---------------------------------------------------------------- the series
/**
 * Percent of the previous day. Null when there is no previous day or it was zero, because a
 * percent of zero is not a number and printing one would be an invented improvement.
 */
export function deltaPercent(now, before) {
  if (now === null || now === undefined || before === null || before === undefined) return null;
  if (!(Math.abs(before) > 0)) return null;
  return r2(((now - before) / before) * 100);
}

/**
 * The line his sentence asks for. Met is at or above the low edge of the band, and the
 * number is printed either way.
 */
export function targetLine(delta) {
  if (delta === null || delta === undefined) return 'day over day: composite n/a, target ' + TARGET.low + ' to ' + TARGET.high + ' percent: first day';
  const sign = delta >= 0 ? '+' : '';
  return 'day over day: composite ' + sign + delta.toFixed(2) + ' percent, target ' + TARGET.low + ' to ' + TARGET.high
    + ' percent: ' + (delta >= TARGET.low ? 'met' : 'missed');
}

/** The mean of the four columns, or null when any one of them is absent. */
export function compositeOf(columns) {
  const xs = COLUMNS.map((c) => (columns[c] ? columns[c].score : null));
  if (xs.some((x) => x === null || x === undefined)) return null;
  return r6(xs.reduce((a, b) => a + b, 0) / xs.length);
}

/**
 * The whole series from a ladder directory: one row per day (the last run of that day), the
 * deltas against the day before, and the line for the newest day.
 * @param {string} dir
 * @returns {object}
 */
export function seriesOf(dir = LADDER_DIR) {
  const byDate = new Map();
  for (const f of datedFiles(dir)) {
    let v = null;
    try { v = JSON.parse(readFileSync(path.join(dir, f.file), 'utf8')); } catch { v = null; }
    if (!v || !v.columns) continue;
    byDate.set(f.date, { ...f, verdict: v });
  }
  const dates = [...byDate.keys()].sort();
  const days = dates.map((d) => {
    const e = byDate.get(d);
    return {
      date: d, file: 'bench/verdicts/ladder/' + e.file, runOfDay: e.run,
      runsThatDay: datedFiles(dir).filter((f) => f.date === d).length,
      tier: e.verdict.tier, at: e.verdict.at,
      columns: e.verdict.columns, composite: e.verdict.composite,
    };
  });
  const deltas = [];
  for (let i = 1; i < days.length; i++) {
    const now = days[i], before = days[i - 1];
    const perColumn = {};
    for (const c of COLUMNS) {
      perColumn[c] = deltaPercent(now.columns[c] ? now.columns[c].score : null, before.columns[c] ? before.columns[c].score : null);
    }
    deltas.push({ date: now.date, against: before.date, perColumn, composite: deltaPercent(now.composite, before.composite) });
  }
  const last = deltas.length ? deltas[deltas.length - 1] : null;
  const newest = days.length ? days[days.length - 1] : null;
  return {
    days, deltas,
    latest: newest ? { date: newest.date, file: newest.file, runOfDay: newest.runOfDay, runsThatDay: newest.runsThatDay } : null,
    lastDelta: last ? last.composite : null,
    line: targetLine(last ? last.composite : null),
    target: { ...TARGET, met: last && last.composite !== null ? last.composite >= TARGET.low : null },
  };
}

// ---------------------------------------------------------------- the health column
// The size test/whole.test.mjs uses, and its text, so this column is the same organism that
// file proves builds with zero illegal edges.
const HEALTH_SIZE = Object.freeze({ majors: 16, substrateUnits: 256, ledger: 'full' });
const HEALTH_TEXT = 'the whole brain runs as one organism: information enters, is represented at many scales, propagates through circuits, meets memories and predictions, and its consequences come back in. '.repeat(30);

/**
 * Build the whole organism at the small size, tick it, observe it, and take health.
 * Deterministic on the seed: the same seed and the same ticks give the same number.
 * @param {object} opts { seed, ticks }
 * @returns {{score, ticks, t, cells, edges, runs, errors, refused, seed}}
 */
export function healthColumn({ seed = 'ladder', ticks = 256 } = {}) {
  const { brain } = buildWhole({ ...HEALTH_SIZE, mindText: HEALTH_TEXT, seed, name: 'ladder-health' });
  try {
    brain.tick(ticks);
    const model = observe(brain, { log: false });
    return {
      score: r6(model.health), ticks, t: model.t, seed,
      cells: model.metrics.cells, edges: model.metrics.edges, runs: model.metrics.runs,
      errors: model.metrics.errors, refused: model.metrics.refused,
      activeCellRate: model.metrics.activeCellRate, usedEdgeRate: model.metrics.usedEdgeRate,
    };
  } finally {
    // The world holds timers and the learning engine holds hooks; a bench that leaves them
    // attached does not exit, and a bench that does not exit is a bench nobody runs daily.
    try { closeWorld(brain); } catch { /* nothing open */ }
    const learning = brain.whole && brain.whole.services && brain.whole.services.learning;
    if (learning && typeof learning.detach === 'function') { try { learning.detach(); } catch { /* already detached */ } }
  }
}

// MEASURED, and the reason this column is taken in a CHILD: buildWhole at this size returns
// 205 cells and health 0.848646 in a process that has done nothing else, and 200 cells and
// 0.859513 in a process that called planItems() first. The organism's build is sensitive to
// what the process already did, so a column measured after the answer and code columns would
// be a reading of the run order. The child does nothing but this, every time, so the number
// is a function of this file, the seed and the ticks and of nothing else.
export function healthInChild({ seed = 'ladder', ticks = 256 } = {}) {
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--health', '--seed', String(seed), '--ticks', String(ticks)],
    { encoding: 'utf8', timeout: 300_000 });
  if (r.status !== 0) throw new Error('the health child exited ' + r.status + ': ' + String(r.stderr).slice(0, 400));
  const last = String(r.stdout).trim().split('\n').pop();
  const out = JSON.parse(last);
  return { ...out, inChild: true };
}

// ---------------------------------------------------------------- one column out of an arm
function armRate(arm) {
  if (!arm || arm.absent) return { score: null, n: 0, correct: null, absent: true, reason: arm ? arm.reason : 'the arm is not in the run' };
  return { score: arm.accuracy, n: arm.n, correct: arm.passed !== undefined ? arm.passed : arm.correct, absent: false, reason: null };
}

// The answer column is the seeded suites only: the forty fixture questions are the same text
// every day, so a column that counted them would be part memorised by construction.
function seededRate(arm) {
  if (!arm || arm.absent) return { score: null, n: 0, correct: null, absent: true, reason: arm ? arm.reason : 'the arm is not in the run' };
  let n = 0, correct = 0;
  for (const s of SEEDED_SOURCES) {
    const row = arm.bySource ? arm.bySource[s] : null;
    if (!row || !row.n) continue;
    n += row.n; correct += row.correct;
  }
  return { score: n ? r6(correct / n) : null, n, correct, absent: false, reason: n ? null : 'no seeded item was graded' };
}

// ---------------------------------------------------------------- the run
export async function run(opts = {}) {
  const t0 = Date.now();
  const quiet = !!opts.quiet;
  const lines = [];
  const say = (line = '') => { lines.push(line); if (!quiet) console.log(line); };
  const date = opts.date || todayString();
  const quick = !!opts.quick;
  const dir = opts.dir || LADDER_DIR;
  const seriesFile = opts.seriesFile || SERIES_FILE;
  const model = opts.model || DEFAULT_MODEL;

  const priorSeries = seriesOf(dir);
  const chosen = opts.tier ? { tier: Math.max(1, Math.floor(Number(opts.tier))), why: '--tier ' + opts.tier + ' was passed on the command line' }
    : nextTier(priorSeries.days, date);
  const prevDay = priorSeries.days.filter((d) => d.date < date).slice(-1)[0] || null;
  const weak = weakKinds(prevDay);
  const plan = planItems({ date, tier: chosen.tier, weak });
  const seed = plan.seed;

  say('');
  say('LADDER ' + date + ', tier ' + plan.tier + (plan.spec.capped ? ' (counts capped at tier ' + TIERS[TIERS.length - 1].tier + ')' : '')
    + ', seed ' + seed + (quick ? ', QUICK: no socket, null arms and health only' : ', model ' + model));
  say('tier rule: ' + UNLOCK_RULE);
  say('tier why : ' + chosen.why);
  say('counts   : answer ' + plan.spec.answerPerSuite + ' per suite (' + plan.answerIds.length + ' seeded items, anchor ' + plan.anchorId
    + '), code ' + plan.codeIds.length + ' tasks (' + Object.entries(plan.codeByKind).map(([k, v]) => k + ' ' + v).join(', ') + ')'
    + ', health ' + plan.spec.healthTicks + ' ticks');
  say('draw     : kinds in order ' + plan.kindOrder.join(', ') + (weak.length ? ' (weakest first, from ' + prevDay.date + ')' : ' (no previous day to weight by)'));
  say('');

  const arms = quick ? 'null' : 'organism,null';
  const columns = {};

  // ---- answer
  const aT = Date.now();
  const answer = await answerRun({
    seed, tasks: plan.spec.answerPerSuite, limit: 1, arms, model,
    timeoutMs: Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : 120_000,
    quiet: true, write: false,
  });
  const aOrg = seededRate(answer.arms.organism);
  const aNull = seededRate(answer.arms.null);
  columns.answer = {
    score: quick ? aNull.score : aOrg.score,
    n: quick ? aNull.n : aOrg.n,
    correct: quick ? aNull.correct : aOrg.correct,
    arm: quick ? 'null' : 'organism',
    organism: aOrg, null: aNull,
    nFor95: aOrg.score !== null && aNull.score !== null ? answerNFor95(aOrg.score, aNull.score) : null,
    anchor: answer.arms.organism && !answer.arms.organism.absent && answer.arms.organism.bySource.fixture
      ? answer.arms.organism.bySource.fixture : (answer.arms.null.bySource ? answer.arms.null.bySource.fixture || null : null),
    ollamaUp: answer.ollamaUp, meanMs: quick ? answer.arms.null.meanMs : (answer.arms.organism.meanMs ?? null),
    ms: Date.now() - aT, from: 'bench/answer.mjs run()',
  };
  say('answer     ' + fmtColumn(columns.answer) + '  ' + (columns.answer.ms) + 'ms');

  // ---- code
  const cT = Date.now();
  const code = await codeRun({
    seed, inMemory: true, pick: plan.codeIds, arms, model,
    timeoutMs: Number.isFinite(opts.codeTimeoutMs) ? opts.codeTimeoutMs : 90_000,
    quiet: true, write: false,
  });
  const cOrg = armRate(code.arms.organism);
  const cNull = armRate(code.arms.null);
  columns.code = {
    score: quick ? cNull.score : cOrg.score,
    n: quick ? cNull.n : cOrg.n,
    correct: quick ? cNull.correct : cOrg.correct,
    arm: quick ? 'null' : 'organism',
    organism: cOrg, null: cNull,
    byKind: code.arms.organism && !code.arms.organism.absent ? code.arms.organism.byKind : (code.arms.null.byKind || {}),
    nFor95: cOrg.score !== null && cNull.score !== null ? codeNFor95(cOrg.score, cNull.score) : null,
    ollamaUp: code.ollamaUp, meanMs: quick ? code.arms.null.meanMs : (code.arms.organism.meanMs ?? null),
    wroteTo: null, isTheBar: code.isTheBar,
    ms: Date.now() - cT, from: 'bench/code.mjs run() with inMemory true',
  };
  say('code       ' + fmtColumn(columns.code) + '  ' + (columns.code.ms) + 'ms');

  // ---- capability
  if (!quick) {
    const pT = Date.now();
    const cap = capabilityRun({ seed, write: false, quiet: true });
    columns.capability = {
      score: cap.graded.accuracy, n: cap.graded.n, correct: cap.graded.correct, arm: 'exact',
      induction: { solved: cap.induction.solved, total: cap.induction.total, searched: cap.induction.searched },
      algebra: { solved: cap.algebra.solved, solvable: cap.algebra.solvable, verified: cap.algebra.verified },
      marketGap: cap.market.gap, verdict: cap.verdict,
      ms: Date.now() - pT, from: 'bench/capability.mjs run({ seed, write: false })',
    };
    say('capability ' + fmtColumn(columns.capability) + '  ' + columns.capability.ms + 'ms');
  } else {
    say('capability absent: --quick prints the null arms and health only');
  }

  // ---- health
  const hT = Date.now();
  const h = healthInChild({ seed, ticks: plan.spec.healthTicks });
  columns.health = { ...h, arm: 'organism', n: h.cells, correct: null, ms: Date.now() - hT, from: 'seeds/whole.mjs + self/observe.mjs' };
  say('health     score ' + h.score + '  over ' + h.cells + ' cells, ' + h.edges + ' edges, ' + h.runs + ' runs at t=' + h.t
    + ', errors ' + h.errors + ', refused ' + h.refused + '  ' + columns.health.ms + 'ms');

  const composite = compositeOf(columns);
  const prevComposite = prevDay ? prevDay.composite : null;
  const delta = deltaPercent(composite, prevComposite);
  const perColumn = {};
  for (const c of COLUMNS) {
    perColumn[c] = prevDay ? deltaPercent(columns[c] ? columns[c].score : null, prevDay.columns[c] ? prevDay.columns[c].score : null) : null;
  }
  const line = targetLine(delta);

  say('');
  say('composite  ' + (composite === null ? 'n/a (a column is absent)' : composite.toFixed(6)) + '  the mean of the four columns, each in [0, 1]');
  if (prevDay) {
    say('per column against ' + prevDay.date + ': ' + COLUMNS.map((c) => c + ' ' + (perColumn[c] === null ? 'n/a' : (perColumn[c] >= 0 ? '+' : '') + perColumn[c].toFixed(2) + '%')).join(', '));
  } else {
    say('per column: no day before ' + date + ' in ' + path.relative(path.join(HERE, '..'), dir).replace(/\\/g, '/'));
  }
  say(line);

  const verdict = {
    at: new Date().toISOString(), node: process.version,
    command: 'node bench/ladder.mjs --date ' + date + ' --tier ' + plan.tier + (quick ? ' --quick' : '') + (opts.model ? ' --model ' + model : ''),
    date, tier: plan.tier, seed, quick, model: quick ? null : model,
    tierRule: UNLOCK_RULE, tierWhy: chosen.why, tierCounts: { ...plan.spec },
    draw: {
      answerIds: plan.answerIds, answerBySource: plan.answerBySource, anchorId: plan.anchorId,
      codeIds: plan.codeIds, codeByKind: plan.codeByKind, kindOrder: plan.kindOrder, weakKinds: weak,
      itemIds: plan.itemIds,
      how: 'every item is drawn on the seed ' + seed + ', so another date draws other items. An item id is the generator\'s slot name and a digest of the item\'s own content, because the slot names repeat every day and the content does not',
    },
    columns, composite,
    dayOverDay: { against: prevDay ? prevDay.date : null, previousComposite: prevComposite, compositeDeltaPercent: delta, perColumnDeltaPercent: perColumn },
    target: { ...TARGET, met: delta === null ? null : delta >= TARGET.low },
    line, ms: Date.now() - t0,
    lines,
  };

  let wrote = null, series = null;
  if (!quick && opts.write !== false) {
    mkdirSync(dir, { recursive: true });
    const next = nextDatedPath(dir, date);
    writeFileSync(next.path, JSON.stringify(verdict, null, 2));
    wrote = next;
    series = seriesOf(dir);
    // the board rides along in ladder.json; a board that cannot be read never stops the daily write
    let board = null;
    try { board = await boardOf({}); } catch (e) { board = { error: String((e && e.message) || e) }; }
    const seriesDoc = seriesDocOf({ series, board, command: verdict.command, nFor95: { answer: columns.answer.nFor95, code: columns.code.nFor95 } });
    writeFileSync(seriesFile, JSON.stringify(seriesDoc, null, 2));
    say('');
    say('wrote ' + path.relative(path.join(HERE, '..'), next.path).replace(/\\/g, '/') + ' (run ' + next.run + ' of ' + date + ')'
      + ' and ' + path.relative(path.join(HERE, '..'), seriesFile).replace(/\\/g, '/')
      + '; the series takes ' + (series.latest ? series.latest.file + ' for ' + series.latest.date : 'nothing yet'));
  } else {
    say('');
    say('nothing written: ' + (quick ? '--quick writes no dated file and no series' : 'write was false'));
  }
  say('LADDER ' + date + ' done in ' + (Date.now() - t0) + 'ms');

  return { ...verdict, lines, wrote: wrote ? { path: wrote.path, run: wrote.run } : null, series };
}

function fmtColumn(c) {
  if (c.score === null || c.score === undefined) return 'absent: ' + (c.organism ? c.organism.reason : 'no score');
  return 'score ' + c.score.toFixed(6) + '  ' + c.correct + '/' + c.n + ' on the ' + c.arm + ' arm'
    + (c.null && !c.null.absent ? ', null ' + c.null.correct + '/' + c.null.n : '')
    + (c.nFor95 ? ', nFor95 ' + c.nFor95 : '');
}

// ---------------------------------------------------------------- the board (Board 10: P4 and P15)
// Everything below reads files. It calls no model, opens no socket and runs no bench: a number
// it prints is a field of a verdict on disk (named beside it) or arithmetic on such fields.
const BOARD_ROOT = path.join(HERE, '..');
export const VERDICTS_DIR = path.join(HERE, 'verdicts');
export const PUBLISHED_FILE = path.join(BOARD_ROOT, 'research', 'published.json');
export const LOG_FILE = path.join(BOARD_ROOT, 'docs', 'LOG.md');
/** His words for the rate of improvement (2026-09-23), printed beside the measured rate. */
export const HIS_RATE = Object.freeze({ words: '5 percent every second', percentPerSecond: 5 });

/** The three public sets, and the verdict files under bench/verdicts that belong to each. */
export const PUBLIC_SETS = Object.freeze([
  Object.freeze({ key: 'gsm8k', name: 'GSM8K', benchmark: 'gsm8k', match: /^public-gsm8k(?:-[a-z0-9]+)*\.json$/ }),
  Object.freeze({ key: 'humaneval', name: 'HumanEval', benchmark: 'humaneval', match: /^public-humaneval(?:-[a-z0-9]+)*\.json$/ }),
  Object.freeze({ key: 'arc', name: 'ARC-AGI-1 evaluation', benchmark: 'arc-agi-1', match: /^(?:public-arc|grid-evaluation)(?:-[a-z0-9]+)*\.json$/ }),
]);

/** The three answer classes: the provenance each one covers and the unit it is printed in. */
export const ANSWER_CLASSES = Object.freeze([
  Object.freeze({ key: 'model', provenance: Object.freeze(['model']), unit: 's', perMs: 1e-3, how: 'the model answered' }),
  Object.freeze({ key: 'native', provenance: Object.freeze(['exact', 'memory']), unit: 'us', perMs: 1e3, how: 'provenance exact (a solver answered, no model call) or memory' }),
  Object.freeze({ key: 'direct', provenance: Object.freeze(['direct']), unit: 'ns', perMs: 1e6, how: 'one hypervector lookup' }),
]);

const bR6 = (x) => Math.round(x * 1e6) / 1e6;
const bR3 = (x) => Math.round(x * 1e3) / 1e3;
const bR2 = (x) => Math.round(x * 100) / 100;
const isNum = (x) => typeof x === 'number' && Number.isFinite(x);
const bMean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const pctOf = (x) => (isNum(x) ? (x * 100).toFixed(2) : 'n/a');
function readJsonSafe(file) { try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return null; } }
/** A path as the tree names it (bench/verdicts/x.json), or the absolute path when it is outside. */
export function boardRel(f) {
  if (!f) return f;
  const r = path.relative(BOARD_ROOT, f);
  return (r.startsWith('..') || path.isAbsolute(r) ? f : r).replace(/\\/g, '/');
}

/** Wilson 95 interval, the same formula as bench/public.mjs wilson (test/ladder.test.mjs checks they agree). */
export function wilson95(correct, n, z = 1.96) {
  if (!(n > 0)) return { lo: null, hi: null, width: null };
  const p = correct / n, z2 = z * z;
  const d = 1 + z2 / n;
  const c = (p + z2 / (2 * n)) / d;
  const h = (z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n))) / d;
  return { lo: bR6(c - h), hi: bR6(c + h), width: bR6(2 * h) };
}

/** n and of of a verdict, from the top level or from an old-schema partial block. */
export function sampleOf(v) {
  const p = v && v.partial && typeof v.partial === 'object' ? v.partial : null;
  const n = v && isNum(v.n) ? v.n : p && isNum(p.n) ? p.n : null;
  const of = v && isNum(v.of) ? v.of : p && isNum(p.of) ? p.of : null;
  return { n, of };
}

/** Why a verdict is not the whole set, as a list; empty when it is whole. */
export function partialReasons(name, v) {
  if (!v) return ['the file does not parse'];
  const out = [];
  if (/-partial\.json$/.test(name)) out.push('the file is named -partial');
  if (v.isTheBar === false) out.push('isTheBar false');
  if (v.complete === false) out.push('complete false');
  const { n, of } = sampleOf(v);
  if (n === null || of === null) out.push('it records no n of');
  else if (n < of) out.push('a sample of ' + n + ' of ' + of);
  return out;
}
export function isPartialVerdict(name, v) { return partialReasons(name, v).length > 0; }

/** How many an arm got right, whichever word its bench counts in (correct, passed, solved). */
const countOf = (a) => (isNum(a.correct) ? a.correct : isNum(a.passed) ? a.passed : isNum(a.solved) ? a.solved : null);

/** The organism, model-alone and null arms of a verdict, in one shape whatever its schema. */
export function armsOf(v) {
  const out = {};
  for (const k of ['organism', 'alone', 'null']) {
    const x = v && v.arms ? v.arms[k] : null;
    const acc = v && v.partial && v.partial.acc ? v.partial.acc[k] : null;
    if (x) {
      if (x.absent) { out[k] = { absent: true, reason: x.reason || x.absentReason || 'absent in the verdict' }; continue; }
      const correct = countOf(x);
      const fromVerdict = !!x.interval && isNum(x.interval.lo) && isNum(x.interval.hi);
      out[k] = {
        absent: false, n: x.n, correct, accuracy: isNum(x.accuracy) ? x.accuracy : bR6(correct / x.n),
        interval: fromVerdict ? { lo: x.interval.lo, hi: x.interval.hi } : wilson95(correct, x.n),
        intervalFrom: fromVerdict ? 'the verdict' : 'the ladder (Wilson 95)', meanMs: isNum(x.meanMs) ? x.meanMs : null,
      };
    } else if (acc) {
      if (!(acc.n > 0)) { out[k] = { absent: true, reason: acc.reason || 'no answers recorded' }; continue; }
      const correct = countOf(acc);
      out[k] = {
        absent: false, n: acc.n, correct, accuracy: bR6(correct / acc.n),
        interval: wilson95(correct, acc.n), intervalFrom: 'the ladder (Wilson 95; this verdict keeps counts only)',
        meanMs: Array.isArray(acc.ms) && acc.ms.length ? bR2(bMean(acc.ms)) : null,
      };
    } else if (k === 'organism' && v && isNum(v.solved) && isNum(v.n) && v.n > 0) {
      out[k] = {
        absent: false, n: v.n, correct: v.solved, accuracy: bR6(v.solved / v.n), interval: wilson95(v.solved, v.n),
        intervalFrom: 'the ladder (Wilson 95)', meanMs: isNum(v.meanMs) ? v.meanMs : null,
      };
    } else {
      out[k] = { absent: true, reason: v && v.model === null ? 'this verdict has no model arm (its model is null)' : 'not in this verdict' };
    }
  }
  return out;
}

/**
 * One record per organism answer: ok, wall ms and provenance. A row with no provenance field
 * in a verdict whose model is null is the organism's own search (no model exists to call), so
 * it is counted exact and marked inferred; any other row without one is unrecorded.
 */
export function recordsOf(v) {
  const rows = v && Array.isArray(v.rows) ? v.rows : v && v.partial && Array.isArray(v.partial.rows) ? v.partial.rows : [];
  const noModel = !!v && v.model === null;
  const out = [];
  for (const r of rows) {
    if (r && r.arms && r.arms.organism) {
      const o = r.arms.organism;
      out.push({ ok: !!(o.ok ?? o.pass), ms: isNum(o.ms) ? o.ms : null, provenance: o.provenance || null, inferred: false });
    } else if (r && Object.prototype.hasOwnProperty.call(r, 'solved')) {
      out.push({ ok: !!r.solved, ms: isNum(r.wallMs) ? r.wallMs : isNum(r.ms) ? r.ms : null, provenance: noModel ? 'exact' : null, inferred: noModel });
    }
  }
  return out;
}

/** The class a provenance belongs to: model, native, direct, unrecorded (none) or other. */
export function classOf(provenance) {
  if (!provenance) return 'unrecorded';
  for (const c of ANSWER_CLASSES) if (c.provenance.includes(provenance)) return c.key;
  return 'other';
}

/** Shares and latencies per class over a verdict's records, each latency in its class's unit. */
export function classesOf(records) {
  const n = records.length;
  const out = {};
  for (const key of ['model', 'native', 'direct', 'unrecorded', 'other']) {
    const spec = ANSWER_CLASSES.find((c) => c.key === key) || null;
    const rs = records.filter((r) => classOf(r.provenance) === key);
    const ms = rs.map((r) => r.ms).filter(isNum);
    const msOk = rs.filter((r) => r.ok).map((r) => r.ms).filter(isNum);
    const m = bMean(ms), mOk = bMean(msOk);
    out[key] = {
      records: rs.length, of: n, share: n ? bR6(rs.length / n) : null, correct: rs.filter((r) => r.ok).length,
      inferred: rs.filter((r) => r.inferred).length, msN: ms.length, msSum: bR3(ms.reduce((a, b) => a + b, 0)),
      meanMs: m === null ? null : bR3(m), meanMsCorrect: mOk === null ? null : bR3(mOk),
      unit: spec ? spec.unit : 'ms',
      latency: m === null ? null : bR6(m * (spec ? spec.perMs : 1)),
      latencyCorrect: mOk === null ? null : bR6(mOk * (spec ? spec.perMs : 1)),
    };
  }
  return out;
}

/** Every published row the set's verdicts keep, once each, with the files that keep it. */
export function publishedRowsOf(verdicts) {
  const seen = new Map();
  for (const { file, v } of verdicts) {
    for (const r of v && Array.isArray(v.published) ? v.published : []) {
      if (!r || !isNum(r.score)) continue;
      const key = r.system + '|' + r.score + '|' + (r.metric || '');
      if (!seen.has(key)) seen.set(key, { system: r.system, score: r.score, unit: r.unit || null, metric: r.metric || null, class: r.class || null, source: r.source || null, readAt: r.readAt || null, keptIn: [boardRel(file)] });
      else if (!seen.get(key).keptIn.includes(boardRel(file))) seen.get(key).keptIn.push(boardRel(file));
    }
  }
  return [...seen.values()].sort((a, b) => b.score - a.score || String(a.system).localeCompare(String(b.system)));
}

/** The organism against one published row: which side, and whether the interval decides it. */
export function compareToRow(org, row) {
  if (!row) return null;
  if (!org || org.absent || !isNum(org.accuracy)) return { system: row.system, score: row.score, side: null, decided: null };
  const lo = org.interval && isNum(org.interval.lo) ? org.interval.lo * 100 : null;
  const hi = org.interval && isNum(org.interval.hi) ? org.interval.hi * 100 : null;
  const pct = org.accuracy * 100;
  return {
    system: row.system, score: row.score, metric: row.metric || null, class: row.class || null, source: row.source || null,
    pct: bR2(pct), lo: lo === null ? null : bR2(lo), hi: hi === null ? null : bR2(hi), gapPoints: bR2(pct - row.score),
    side: pct > row.score ? 'above' : pct < row.score ? 'below' : 'equal',
    decided: lo !== null && lo > row.score ? 'above' : hi !== null && hi < row.score ? 'below' : null,
  };
}

/** A metric the organism's single answer can be held to: none named, or an @1 metric (pass@100 is not). */
const singleShot = (metric) => !metric || /@1\b/.test(metric) || !/@\d/.test(metric);
/** P4's second bar: the 405B row. */
export function row405Of(rows) { return rows.filter((r) => /405B/i.test(r.class || '') || /405B/i.test(r.system || '')).sort((a, b) => b.score - a.score)[0] || null; }
/** P4's third bar, the "smarter than the orchestrator" bar: the best frontier row held to one answer. */
export function frontierRowOf(rows) { return rows.filter((r) => /^frontier/i.test(r.class || '') && singleShot(r.metric)).sort((a, b) => b.score - a.score)[0] || null; }
/** The orchestrator's own row (Fable 5.1): only from research/published.json, only with a URL. */
export function orchestratorRowOf(published, benchmark) {
  const rows = published && Array.isArray(published.rows) ? published.rows : [];
  return rows.find((r) => r && r.benchmark === benchmark && /Fable 5\.1/i.test(r.system || '') && /https?:\/\//.test(r.source || '') && isNum(r.score)) || null;
}

/** P4's first bar: the organism against model-alone or null, by interval separation. */
export function armSeparation(org, other) {
  if (!org || org.absent) return { verdict: 'no organism arm' };
  if (!other || other.absent) return { verdict: 'absent', reason: other ? other.reason : 'absent' };
  const verdict = org.interval.lo > other.interval.hi ? 'beats, intervals separate'
    : org.interval.hi < other.interval.lo ? 'loses, intervals separate' : 'not separated, intervals overlap';
  return { verdict, organism: org.correct + '/' + org.n, other: other.correct + '/' + other.n };
}

/** One public set: its primary verdict (newest whole, else newest partial), arms, classes and bars. */
export function boardSet(set, { dir = VERDICTS_DIR, published = null } = {}) {
  let names = [];
  try { names = readdirSync(dir).filter((f) => set.match.test(f)); } catch { names = []; }
  const verdicts = names.map((name) => {
    const file = path.join(dir, name);
    const v = readJsonSafe(file);
    return { name, file, v, reasons: partialReasons(name, v), at: v && v.at ? String(v.at) : '' };
  }).filter((x) => x.v);
  const orch = orchestratorRowOf(published, set.benchmark);
  const base = { key: set.key, name: set.name, benchmark: set.benchmark };
  if (!verdicts.length) return { ...base, status: 'not measured', reason: 'no verdict file under bench/verdicts matches ' + set.match, orchestrator: orch, files: [] };
  const byAt = (a, b) => b.at.localeCompare(a.at) || a.name.localeCompare(b.name);
  const wholes = verdicts.filter((x) => !x.reasons.length).sort(byAt);
  const partials = verdicts.filter((x) => x.reasons.length).sort(byAt);
  const primary = wholes[0] || partials[0];
  const v = primary.v;
  const arms = armsOf(v);
  const records = recordsOf(v);
  const rows = publishedRowsOf(verdicts);
  const org = arms.organism;
  const r405 = row405Of(rows), front = frontierRowOf(rows);
  const whole = !primary.reasons.length;
  const orchCmp = orch ? compareToRow(org, { system: orch.system, score: orch.score, metric: orch.metric || null, class: orch.class || null, source: orch.source }) : null;
  return {
    ...base, status: whole ? 'whole' : 'PARTIAL',
    partialBecause: primary.reasons, notTheBarBecause: Array.isArray(v.notTheBarBecause) ? v.notTheBarBecause.slice(0, 1) : [],
    primary: { file: boardRel(primary.file), at: v.at || null, command: v.command || null, isTheBar: v.isTheBar ?? null, model: v.model === undefined ? null : v.model, ...sampleOf(v) },
    arms, classes: classesOf(records), recordsRead: records.length,
    bars: {
      alone: armSeparation(org, arms.alone), null: armSeparation(org, arms.null),
      row405: r405 ? compareToRow(org, r405) : null, frontier: front ? compareToRow(org, front) : null,
      orchestrator: orchCmp, claimable: whole,
    },
    orchestrator: orch, published: rows.map((r) => ({ ...r, ...compareToRow(org, r) })),
    alsoOnDisk: verdicts.filter((x) => x !== primary).sort(byAt).map((x) => {
      const a = armsOf(x.v).organism, c = classesOf(recordsOf(x.v));
      return { file: boardRel(x.file), at: x.at || null, status: x.reasons.length ? 'PARTIAL' : 'whole', reasons: x.reasons, organism: a && !a.absent ? a.correct + '/' + a.n : null, provenanceRecorded: c.unrecorded.records === 0 };
    }),
  };
}

/** Across the three sets: organism correct over answered, and the class shares over all records. */
export function boardTotals(sets) {
  const measured = sets.filter((s) => s.status !== 'not measured');
  let correct = 0, n = 0, records = 0;
  const classes = {};
  for (const s of measured) {
    const o = s.arms.organism;
    if (o && !o.absent) { correct += o.correct; n += o.n; }
    records += s.recordsRead;
    for (const [k, c] of Object.entries(s.classes)) {
      const t = classes[k] || (classes[k] = { records: 0, correct: 0, msN: 0, msSum: 0 });
      t.records += c.records; t.correct += c.correct; t.msN += c.msN; t.msSum += c.msSum;
    }
  }
  for (const [k, t] of Object.entries(classes)) {
    const spec = ANSWER_CLASSES.find((c) => c.key === k) || null;
    t.share = records ? bR6(t.records / records) : null;
    t.msSum = bR3(t.msSum);
    t.meanMs = t.msN ? bR3(t.msSum / t.msN) : null;
    t.unit = spec ? spec.unit : 'ms';
    t.latency = t.msN ? bR6((t.msSum / t.msN) * (spec ? spec.perMs : 1)) : null;
  }
  return {
    sets: measured.length, whole: measured.filter((s) => s.status === 'whole').length, partial: measured.filter((s) => s.status === 'PARTIAL').length,
    correct, n, accuracy: n ? bR6(correct / n) : null, records, classes,
    how: 'a sum over each set\'s primary verdict, whole and partial alike, so it mixes samples with whole sets and is a tally, not a benchmark score',
  };
}

/**
 * The nanoseconds of the substrate. A verdict written for this row (ladder-substrate.json) wins;
 * the browser organism's own figures live only in a docs/LOG.md line, printed as such; the Node
 * organism's usPerRun is read from bench/verdicts/speed.json.
 */
export function substrateOf({ dir = VERDICTS_DIR, logFile = LOG_FILE } = {}) {
  const out = { measured: null, browser: null, node: null };
  const ownFile = path.join(dir, 'ladder-substrate.json');
  const own = readJsonSafe(ownFile);
  if (own && isNum(own.nsPerCellRun)) {
    out.measured = { file: boardRel(ownFile), at: own.at || null, command: own.command || null, isTheBar: own.isTheBar ?? null, nsPerCellRun: own.nsPerCellRun, nsPerHop: isNum(own.nsPerHop) ? own.nsPerHop : null, where: own.where || null };
  }
  let text = null;
  try { text = readFileSync(logFile, 'utf8'); } catch { text = null; }
  if (text) {
    const lines = text.split(/\r?\n/);
    for (let i = lines.length - 1; i >= 0; i--) {
      const m = lines[i].match(/in the browser[^;]*?([\d.]+) us per cell run, ([\d.]+) us per packet hop/);
      if (!m) continue;
      const when = (lines[i].match(/^- (\d{4}-\d{2}-\d{2} \d{2}:\d{2})/) || [null, null])[1];
      out.browser = { file: boardRel(logFile), line: i + 1, when, usPerCellRun: Number(m[1]), usPerHop: Number(m[2]), nsPerCellRun: bR3(Number(m[1]) * 1000), nsPerHop: bR3(Number(m[2]) * 1000), kind: 'a log line, not a verdict file' };
      break;
    }
  }
  const sp = readJsonSafe(path.join(dir, 'speed.json'));
  const u = sp && sp.accounting && sp.accounting.usPerRun;
  if (u && isNum(u.best)) {
    out.node = { file: boardRel(path.join(dir, 'speed.json')), at: sp.at || null, organism: sp.organism || null, cells: sp.arms && sp.arms[0] ? sp.arms[0].cells ?? null : null, usPerRun: { baseline: u.baseline ?? null, single: u.single ?? null, best: u.best }, nsPerCellRunBest: bR3(u.best * 1000) };
  }
  return out;
}

/** Instances alive: state/instances.json under the health window, else a cloud verdict. */
export function instancesOf({ states = stateDirs(BOARD_ROOT), dir = VERDICTS_DIR, now = Date.now() } = {}) {
  for (const s of states) {
    const f = path.join(s, 'instances.json');
    const j = existsSync(f) ? readJsonSafe(f) : null;
    if (!j || !j.instances) continue;
    const all = Object.values(j.instances).filter(Boolean);
    const alive = all.filter((r) => now - Date.parse(r.lastSeen) <= ALIVE_WINDOW_MS);
    return { source: boardRel(f), kind: 'state', alive: alive.length, known: all.length, windowMs: ALIVE_WINDOW_MS, partial: false };
  }
  for (const name of ['cloud.json', 'cloud-partial.json']) {
    const v = readJsonSafe(path.join(dir, name));
    if (!v || !isNum(v.instancesAlive)) continue;
    return { source: boardRel(path.join(dir, name)), kind: 'verdict', alive: v.instancesAlive, at: v.at || null, isTheBar: v.isTheBar === true, partial: v.isTheBar !== true, mode: v.mode || null, restartCount: v.restartCount ?? null };
  }
  return { source: null, alive: null, reason: 'no instances.json in a state directory and no bench/verdicts/cloud.json or cloud-partial.json' };
}

// ---------------------------------------------------------------- Board 12: P15's four rulers
// Three blocks read from the verdicts on disk. A missing verdict prints "not measured", a narrow
// run (a -partial file, or isTheBar false) prints "partial", and a number a verdict does not carry
// prints "n/a": never a 0 standing in for a number nobody measured.
const numOr = (x) => (isNum(x) ? x : null);
const na = (x) => (x === null || x === undefined ? 'n/a' : String(x));
const DAY_MS = 86_400_000;
/** Why one of these verdicts is a narrow run: named -partial, isTheBar not true, or complete false. Empty when whole. */
export function narrowReasons(name, v) {
  if (!v || typeof v !== 'object') return ['the file does not parse'];
  const out = [];
  if (/-partial\.json$/.test(name)) out.push('the file is named -partial');
  if (v.isTheBar !== true) out.push('isTheBar ' + v.isTheBar);
  if (v.complete === false) out.push('complete false');
  return out;
}

/**
 * MULTIPLYING, from bench/verdicts/multiply.json (else multiply-partial.json, printed partial):
 * instances alive at the end of each arm, duplications, and the population's best against the
 * single instance on the fresh draw, with the kill the bar asks to come back.
 */
export function multiplyOf({ dir = VERDICTS_DIR } = {}) {
  const names = ['multiply.json', 'multiply-partial.json'];
  const found = names.map((n) => ({ name: n, v: readJsonSafe(path.join(dir, n)) })).filter((x) => x.v && typeof x.v === 'object');
  if (!found.length) return { source: null, reason: 'no bench/verdicts/multiply.json or multiply-partial.json', tieBreak: tieBreakOf({ dir }) };
  const { name, v } = found[0];
  const partialBecause = narrowReasons(name, v);
  const arm = (a) => (a && typeof a === 'object' ? {
    alive: numOr(a.aliveAtEnd && a.aliveAtEnd.alive), aliveAtS: numOr(a.aliveAtEnd && a.aliveAtEnd.s), ids: a.aliveAtEnd && Array.isArray(a.aliveAtEnd.ids) ? a.aliveAtEnd.ids : null,
    maxAlive: numOr(a.maxAlive), duplications: numOr(a.duplications), fresh: numOr(a.pick && a.pick.fresh), freshT: numOr(a.pick && a.pick.freshT),
    freshMoreMean: numOr(a.pick && a.pick.freshMoreMean), evals: numOr(a.evals), elitesImported: numOr(a.elitesImported), elitesExported: numOr(a.elitesExported),
  } : null);
  const bar = v.bar && typeof v.bar === 'object' ? v.bar : {};
  const kill = v.kill && typeof v.kill === 'object' ? { id: v.kill.id ?? null, atS: numOr(v.kill.atS), checkpointT: numOr(v.kill.checkpointT), cameBack: typeof v.kill.cameBack === 'boolean' ? v.kill.cameBack : null } : null;
  const cfg = v.config && typeof v.config === 'object' ? v.config : {};
  return {
    source: boardRel(path.join(dir, name)), at: v.at || null, command: v.command || null, isTheBar: v.isTheBar === true,
    partial: partialBecause.length > 0, partialBecause,
    wallS: numOr(cfg.wallS), fresh: cfg.suite && typeof cfg.suite.fresh === 'string' ? cfg.suite.fresh : null, spawnPlan: typeof cfg.spawnPlan === 'string' ? cfg.spawnPlan : null,
    bar: { met: typeof bar.met === 'boolean' ? bar.met : null, singleFresh: numOr(bar.singleFresh), populationFresh: numOr(bar.populationFresh), freshT: numOr(bar.freshT), atOrAbove: typeof bar.atOrAbove === 'boolean' ? bar.atOrAbove : null, cameBack: typeof bar.cameBack === 'boolean' ? bar.cameBack : null },
    single: arm(v.arms && v.arms.single), population: arm(v.arms && v.arms.population), kill, modelCalls: numOr(v.modelCalls),
    alsoOnDisk: found.slice(1).map((x) => ({ file: boardRel(path.join(dir, x.name)), at: x.v.at || null, isTheBar: x.v.isTheBar === true, singleFresh: numOr(x.v.bar && x.v.bar.singleFresh), populationFresh: numOr(x.v.bar && x.v.bar.populationFresh), freshT: numOr(x.v.bar && x.v.bar.freshT), met: x.v.bar && typeof x.v.bar.met === 'boolean' ? x.v.bar.met : null, wallS: numOr(x.v.config && x.v.config.wallS) })),
    tieBreak: tieBreakOf({ dir }),
  };
}

/**
 * Patches proposed and kept per source per day, from whichever of these authorship.json carries:
 * perSourcePerDay, bySourceDay, days or perDay, as rows ({ day, source, proposed, kept }), days
 * holding { sources: { name: { proposed, kept } } }, or an object keyed by day then source.
 * Empty when the verdict carries none of them, which the block prints as not measured.
 */
export function perSourcePerDayOf(v) {
  const rows = [];
  const add = (day, source, o) => {
    if (!day || !o || typeof o !== 'object') return;
    const proposed = numOr(o.proposed), kept = numOr(o.kept);
    if (proposed === null && kept === null) return;
    rows.push({ day: String(day), source: String(source), proposed, kept });
  };
  const key = v && typeof v === 'object' ? ['perSourcePerDay', 'bySourceDay', 'days', 'perDay'].find((k) => v[k] && typeof v[k] === 'object') : null;
  const src = key ? v[key] : null;
  if (Array.isArray(src)) {
    for (const r of src) {
      if (!r || typeof r !== 'object') continue;
      const day = r.day ?? r.date;
      if (r.source !== undefined) add(day, r.source, r);
      const by = r.sources ?? r.bySource;
      if (by && typeof by === 'object') for (const [s, o] of Object.entries(by)) add(day, s, o);
    }
  } else if (src) {
    for (const [day, by] of Object.entries(src)) if (by && typeof by === 'object') for (const [s, o] of Object.entries(by)) add(day, s, o);
  }
  rows.sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : a.source < b.source ? -1 : a.source > b.source ? 1 : 0));
  return { field: key, rows };
}

/**
 * The last board and the days since it: the boards authorship.json counted, docs/BOARDS.json, and
 * the launch markers state/board<N>.marker. Each is printed with its source; the newest of them is
 * the last board. A board with a marker and no BOARDS.json entry is named, because the authored
 * share's denominator does not count its files.
 */
export function lastBoardOf({ authorship = null, boardsFile = path.join(BOARD_ROOT, 'docs', 'BOARDS.json'), states = stateDirs(BOARD_ROOT), now = Date.now() } = {}) {
  const fromList = (arr, source) => (Array.isArray(arr) ? arr : []).filter((b) => b && typeof b === 'object' && isNum(Date.parse(b.at)))
    .map((b) => ({ board: b.board ?? null, at: b.at, kind: 'landed', source })).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const counted = fromList(authorship && authorship.boards, 'bench/verdicts/authorship.json boards');
  const bj = readJsonSafe(boardsFile);
  const listed = fromList(Array.isArray(bj) ? bj : bj && bj.boards, boardRel(boardsFile));
  const markers = [];
  for (const s of states) {
    let names = []; try { names = readdirSync(s); } catch { names = []; }
    for (const n of names) {
      const m = n.match(/^board(\d+)\.marker$/);
      if (!m) continue;
      let text = ''; try { text = readFileSync(path.join(s, n), 'utf8'); } catch { continue; }
      const at = (text.match(/launched\s+(\d{4}-\d{2}-\d{2}T[\d:.]+Z)/) || [null, null])[1];
      if (at) markers.push({ board: Number(m[1]), at, kind: 'launched', source: boardRel(path.join(s, n)) });
    }
  }
  markers.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const all = [...counted, ...listed, ...markers].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const days = (x) => (x ? bR3((now - Date.parse(x.at)) / DAY_MS) : null);
  const last = (xs) => (xs.length ? xs[xs.length - 1] : null);
  const newest = last(all);
  const listedBoards = new Set(listed.map((b) => b.board));
  return {
    newest, days: days(newest), at: new Date(now).toISOString(),
    counted: last(counted), countedDays: days(last(counted)), listed: last(listed), listedDays: days(last(listed)),
    launched: last(markers), launchedDays: days(last(markers)),
    unlisted: markers.filter((m) => !listedBoards.has(m.board)).map((m) => m.board),
    reason: newest ? null : 'no board in authorship.json, ' + boardRel(boardsFile) + ' or a state/board<N>.marker',
  };
}

/** The authored share, from bench/verdicts/authorship.json, with per source per day and the last board. */
export function authoredOf({ dir = VERDICTS_DIR, boardsFile = path.join(BOARD_ROOT, 'docs', 'BOARDS.json'), states = stateDirs(BOARD_ROOT), now = Date.now() } = {}) {
  const f = path.join(dir, 'authorship.json');
  const v = readJsonSafe(f);
  const lastBoard = lastBoardOf({ authorship: v, boardsFile, states, now });
  const psd = perSourcePerDayOf(v);
  const input = v && v.sources && v.sources.authored && typeof v.sources.authored === 'object' ? v.sources.authored : null;
  const perSourcePerDay = psd.rows.length ? { field: psd.field, rows: psd.rows } : {
    field: null, rows: [],
    reason: v ? 'bench/verdicts/authorship.json carries no per-source per-day field (perSourcePerDay, bySourceDay, days or perDay)'
      + (input && input.present === false && typeof input.file === 'string' ? '; its input ' + input.file + ' is not present' : '') : 'no bench/verdicts/authorship.json',
  };
  if (!v || !isNum(v.share)) return { source: null, reason: 'no bench/verdicts/authorship.json with a share', perSourcePerDay, lastBoard };
  return {
    source: boardRel(f), at: v.at || null, command: v.command || null, isTheBar: v.isTheBar === true, partial: narrowReasons('authorship.json', v).length > 0,
    numerator: v.numerator ?? null, denominator: v.denominator ?? null, share: v.share,
    kept: numOr(v.kept), given: numOr(v.given), organism: numOr(v.organism), boardFiles: numOr(v.boardFiles),
    weeks: Array.isArray(v.weeks) ? v.weeks.filter((w) => w && typeof w === 'object').map((w) => ({ week: w.week ?? null, organism: numOr(w.organism), kept: numOr(w.kept), boardFiles: numOr(w.boardFiles), share: numOr(w.share) })) : [],
    // the denominator's boards (Board 14): which boards' files it counts, which were not launched, which it lacks
    boards: Array.isArray(v.boards) ? v.boards.filter((b) => b && typeof b === 'object').map((b) => ({ board: b.board ?? null, files: numOr(b.files), launched: typeof b.launched === 'boolean' ? b.launched : null })) : null,
    missingBoards: Array.isArray(v.missingBoards) ? v.missingBoards.map((b) => (b && typeof b === 'object' ? { board: b.board ?? null, source: b.source ?? null } : { board: b, source: null })) : null,
    perSourcePerDay, lastBoard,
  };
}

/** The knowledge sources the board holds to the same three numbers. */
export const KNOWLEDGE_SOURCES = Object.freeze([
  { name: 'simplewiki', file: 'knowledge.json', partial: 'knowledge-partial.json' },
  { name: 'enwiki', file: 'knowledge-en.json', partial: 'knowledge-en-partial.json' },
]);

/**
 * KNOWLEDGE, per source: articles held, breadth (held over the articles in the dump), and recall
 * at 1 and 5 against the null arm. The whole verdict is primary; a partial one stands in only
 * when there is no whole one, and is then printed partial.
 */
export function knowledgeOf({ dir = VERDICTS_DIR, sources = KNOWLEDGE_SOURCES } = {}) {
  const read = (name) => {
    const v = readJsonSafe(path.join(dir, name));
    if (!v || typeof v !== 'object') return null;
    const b = v.breadth || {}, g = v.grade || {}, d = v.dump || {};
    const why = narrowReasons(name, v);
    return {
      file: boardRel(path.join(dir, name)), at: v.at || null, command: v.command || null, isTheBar: v.isTheBar === true, partial: why.length > 0, partialBecause: why,
      held: numOr(b.held), articlesInDump: numOr(b.articlesInDump), articlesRead: numOr(b.articlesRead), breadth: numOr(b.ratio),
      n: numOr(g.n), recall1: numOr(g.recall1), recall5: numOr(g.recall5), null1: numOr(g.null1), null5: numOr(g.null5), meanMs: numOr(g.meanMs),
      dump: typeof d.file === 'string' ? d.file : null, licence: typeof d.licence === 'string' ? d.licence : null,
    };
  };
  const out = sources.map((s) => {
    const whole = read(s.file), part = read(s.partial);
    const primary = whole || part;
    if (!primary) return { name: s.name, status: 'not measured', reason: 'no bench/verdicts/' + s.file + ' or ' + s.partial, primary: null, alsoOnDisk: [] };
    return { name: s.name, status: primary.partial ? 'partial' : 'whole', primary, alsoOnDisk: whole && part ? [part] : [] };
  });
  const measured = out.filter((s) => s.primary);
  const held = measured.filter((s) => s.primary.held !== null);
  return { sources: out, measured: measured.length, of: out.length, heldTotal: held.length ? held.reduce((a, s) => a + s.primary.held, 0) : null, heldFrom: held.map((s) => s.name) };
}

/** Bytes per score point: the compress bar, and the newest checkpoint header on disk. */
export function bytesPerPointOf({ dir = VERDICTS_DIR, states = stateDirs(BOARD_ROOT) } = {}) {
  const f = path.join(dir, 'compress.json');
  const v = readJsonSafe(f);
  const h = v && v.ruler ? v.ruler.v2Header || null : null;
  const bar = h ? { source: boardRel(f) + ' ruler.v2Header', at: v.at || null, isTheBar: v.isTheBar === true, bytesPerScorePoint: h.bytesPerScorePoint, score: h.score, of: h.of ?? null, bytes: h.bytes ?? null } : null;
  let recs = [];
  try { recs = compressRecords({ root: BOARD_ROOT, verdictsDir: dir, states }); } catch { recs = []; }
  return { bar, last: recs.length ? recs[recs.length - 1] : null, records: recs.length };
}

/** Improvement per wall second: a live ruler.jsonl in a state directory, else daemon.json phaseA.perWallSecond. */
export async function improvementOf({ dir = VERDICTS_DIR, states = stateDirs(BOARD_ROOT) } = {}) {
  for (const s of states) {
    if (!existsSync(path.join(s, 'ruler.jsonl'))) continue;
    const { readRuler, rulerRates } = await import('../daemon/run.mjs');
    const rates = rulerRates(readRuler(s));
    if (rates.whole) return { source: boardRel(path.join(s, 'ruler.jsonl')), kind: 'live ruler', rows: rates.rows, ...rates.whole, percentPerSecond: isNum(rates.whole.carried) ? bR6(rates.whole.carried * 100) : null };
  }
  const f = path.join(dir, 'daemon.json');
  const d = readJsonSafe(f);
  const p = d && d.phaseA ? d.phaseA.perWallSecond : null;
  if (!p) return { source: null, reason: 'no ruler.jsonl in a state directory and no bench/verdicts/daemon.json phaseA.perWallSecond' };
  return { source: boardRel(f) + ' phaseA.perWallSecond', kind: 'daemon verdict', at: d.at || null, isTheBar: d.isTheBar === true, ...p, percentPerSecond: isNum(p.carried) ? bR6(p.carried * 100) : null };
}

// ---------------------------------------------------------------- GAPS, MAGNITUDE and UNDONE (Board 14 and Board 15)
// Three blocks read off the self-improvement loop's own files. Like the rest of the board they
// run nothing: every number is a count of lines on disk, a field of a verdict, or arithmetic on
// those. A file that is not there prints "not measured", never a zero.
const WEEK_MS = 7 * DAY_MS;
function readJsonlSafe(file) {
  let text; try { text = readFileSync(file, 'utf8'); } catch { return null; }
  const rows = []; let bad = 0;
  for (const l of text.split('\n')) { if (!l.trim()) continue; try { const x = JSON.parse(l); if (x && typeof x === 'object') rows.push(x); else bad++; } catch { bad++; } }
  return { rows, bad };
}
/** Every *.jsonl in a directory, each line tagged with its file; null when the directory is absent. */
function jsonlDir(dir) {
  let names; try { names = readdirSync(dir).filter((n) => n.endsWith('.jsonl')).sort(); } catch { return null; }
  const rows = []; let bad = 0;
  for (const n of names) { const r = readJsonlSafe(path.join(dir, n)); if (!r) continue; bad += r.bad; for (const x of r.rows) rows.push({ ...x, fileOf: n }); }
  return { files: names, rows, bad };
}
const relOf = (root, f) => path.relative(root, f).replaceAll('\\', '/');
const hasTrial = (g) => (typeof g.trial === 'string' ? g.trial.trim().length > 0 : !!(g.trial && g.trial.command));
const atOf = (x) => Date.parse(x && x.at);
const inWindow = (x, from, to) => { const t = atOf(x); return Number.isFinite(t) && t >= from && t <= to; };
const countBy = (rows, key) => { const o = {}; for (const r of rows) { const k = String(key(r)); o[k] = (o[k] || 0) + 1; } return o; };
const byAt = (a, b) => (atOf(a) || 0) - (atOf(b) || 0);
const kv = (o) => Object.entries(o).map(([k, n]) => k + ' ' + n).join(', ');
/** bench/autopilot.mjs orchestratorRate, loaded when asked (importing that file runs nothing); null when it cannot be. */
export async function orchestratorOf(root = BOARD_ROOT) {
  try { const m = await import('./autopilot.mjs'); return typeof m.orchestratorRate === 'function' ? m.orchestratorRate({ root }) : null; } catch { return null; }
}

/**
 * GAPS: the ledger (state/self/gaps.jsonl), the decision files (bench/verdicts/autopilot/*.jsonl)
 * and state/self/authored.jsonl. Open gaps, those with a trial, those attempted in the last 7
 * days, those kept, and every gap a decision or an authored line records as closed.
 */
export function gapsOf({ root = BOARD_ROOT, dir = VERDICTS_DIR, now = Date.now() } = {}) {
  const ledgerFile = path.join(root, 'state', 'self', 'gaps.jsonl');
  const decDir = path.join(dir, 'autopilot');
  const authFile = path.join(root, 'state', 'self', 'authored.jsonl');
  const L = readJsonlSafe(ledgerFile), D = jsonlDir(decDir), A = readJsonlSafe(authFile);
  const from = now - WEEK_MS;
  const out = { at: new Date(now).toISOString(), windowDays: 7, sources: { ledger: relOf(root, ledgerFile), decisions: relOf(root, decDir) + '/*.jsonl', authored: relOf(root, authFile) } };
  out.ledger = L ? { open: L.rows.length, unparsed: L.bad, withTrial: L.rows.filter(hasTrial).length, byKind: countBy(L.rows, (g) => g.kind || 'unknown') } : null;
  if (D) {
    const recent = D.rows.filter((x) => x.gap && typeof x.decision === 'string' && inWindow(x, from, now));
    const kept = recent.filter((x) => x.decision === 'kept');
    out.decisions = {
      files: D.files.length, lines: D.rows.length, unparsed: D.bad, attempts: recent.length, attempted: new Set(recent.map((x) => x.gap)).size,
      kept: kept.length, keptGaps: new Set(kept.map((x) => x.gap)).size, keptOnRecord: D.rows.filter((x) => x.gap && x.decision === 'kept').length,
      decisions: countBy(recent, (x) => x.decision),
    };
  } else out.decisions = null;
  out.authored = A ? { lines: A.rows.length, organism: A.rows.filter((x) => x.organism === true).length, unparsed: A.bad } : null;
  if (!D && !A) out.closed = null;
  else {
    const last = new Map();
    const rows = [...(D ? D.rows.map((x) => ({ ...x, src: relOf(root, decDir) + '/' + x.fileOf })) : []), ...(A ? A.rows.map((x) => ({ ...x, src: relOf(root, authFile) })) : [])];
    for (const x of rows.filter((r) => r.closed === true && r.gap).sort(byAt)) last.set(x.gap, x);
    out.closed = [...last.values()].map((x) => ({ gap: x.gap, before: numOr(x.before), after: numOr(x.after), unit: x.unit ?? null, bar: numOr(x.bar), operator: x.operator ?? null, at: x.at ?? null, source: x.src }));
  }
  return out;
}

export function gapsLines(g) {
  const L = [];
  L.push('GAPS (' + g.sources.ledger + ', ' + g.sources.decisions + ', ' + g.sources.authored + '; the last ' + g.windowDays + ' days to ' + g.at + '):');
  L.push('  open: ' + (g.ledger ? g.ledger.open + ' (' + kv(g.ledger.byKind) + '), with a trial ' + g.ledger.withTrial + (g.ledger.unparsed ? ', unparsed lines ' + g.ledger.unparsed : '') : 'not measured (no ' + g.sources.ledger + ')'));
  const d = g.decisions;
  L.push('  attempted in the last ' + g.windowDays + ' days: ' + (d ? d.attempted + ' gaps in ' + d.attempts + ' decisions (' + (kv(d.decisions) || 'none') + '; ' + d.files + ' decision files, ' + d.lines + ' lines)' : 'not measured (no ' + g.sources.decisions + ')'));
  L.push('  kept: ' + (d ? d.kept + ' in the last ' + g.windowDays + ' days (' + d.keptGaps + ' gaps), ' + d.keptOnRecord + ' in all the decision files' : 'not measured (no ' + g.sources.decisions + ')')
    + (g.authored ? '; ' + g.sources.authored + ' holds ' + g.authored.lines + ' lines, ' + g.authored.organism + ' with an organism author' : '; ' + g.sources.authored + ' not measured (absent)'));
  if (g.closed === null) L.push('  closed: not measured (neither the decision files nor ' + g.sources.authored + ' are on disk)');
  else {
    L.push('  closed: ' + g.closed.length + (g.closed.length ? '' : ' (no decision or authored line records a gap closed)'));
    for (const c of g.closed) L.push('    closed ' + c.gap + ': before ' + na(c.before) + ' after ' + na(c.after) + (c.unit ? ' ' + c.unit : '') + ' (bar ' + na(c.bar) + ') by ' + na(c.operator) + ', ' + na(c.at) + ' (' + c.source + ')');
  }
  return L;
}

/**
 * MAGNITUDE: the organism's rate per wall hour (the soak in bench/verdicts/soak.json, its kept
 * patches from state/self/authored.jsonl and the decision files inside that soak's window) beside
 * the orchestrator's rate (boards landed and bars met per day, bench/autopilot.mjs
 * orchestratorRate over docs/BOARDS.json and the dated lines of docs/LOG.md) and the simulated
 * clock (bench/verdicts/spread.json: improvements kept per million organism-years, generations
 * per second). orchestrator is that function's result, or null when it could not be loaded.
 */
export function magnitudeOf({ root = BOARD_ROOT, dir = VERDICTS_DIR, orchestrator = null } = {}) {
  const soakFile = path.join(dir, 'soak.json'), spreadFile = path.join(dir, 'spread.json');
  const authFile = path.join(root, 'state', 'self', 'authored.jsonl');
  const soak = readJsonSafe(soakFile), spread = readJsonSafe(spreadFile);
  const A = readJsonlSafe(authFile), D = jsonlDir(path.join(dir, 'autopilot'));
  const s = soak && soak.soak && typeof soak.soak === 'object' ? soak.soak : null;
  let organism;
  if (!s || !isNum(s.elapsedMs) || !s.startedAt || !Number.isFinite(Date.parse(s.startedAt))) {
    organism = { measured: false, reason: soak ? relOf(root, soakFile) + ' carries no soak.startedAt and soak.elapsedMs' : 'no ' + relOf(root, soakFile) };
  } else {
    const from = Date.parse(s.startedAt);
    const endIso = s.updatedAt || s.loopEndedAt || new Date(from + s.elapsedMs).toISOString();
    const to = Date.parse(endIso);
    const hours = s.elapsedMs / 36e5;
    const kept = A ? A.rows.filter((x) => x.organism === true && inWindow(x, from, to)) : null;
    const decKept = D ? D.rows.filter((x) => x.decision === 'kept' && inWindow(x, from, to)).length : null;
    const attempts = D ? D.rows.filter((x) => typeof x.decision === 'string' && inWindow(x, from, to)).length : null;
    const moved = kept ? new Set(kept.map((x) => x.gap)).size : null;
    const withDist = kept ? kept.filter((x) => isNum(x.toward) && isNum(x.bar) && x.bar !== 0) : null;
    // a kept line that carries no toward or bar is not counted as a zero distance: the sum is then not measured
    const dist = !kept || withDist.length < kept.length ? null : withDist.reduce((a, x) => a + Math.abs(x.toward) / Math.abs(x.bar), 0);
    const per = (x) => (x === null || !(hours > 0) ? null : bR6(x / hours));
    organism = {
      measured: true, source: relOf(root, soakFile), runId: s.runId ?? null, startedAt: s.startedAt, endedAt: endIso, wallHours: bR6(hours),
      kept: kept ? kept.length : null, keptDecisions: decKept, gapsMoved: moved, distanceBarUnits: dist === null ? null : bR6(dist), attempts,
      keptPerHour: per(kept ? kept.length : null), gapsMovedPerHour: per(moved), distancePerHour: per(dist), attemptsPerHour: per(attempts),
      authoredOnRecord: A ? A.rows.filter((x) => x.organism === true).length : null,
      authoredSource: A ? relOf(root, authFile) : null, decisionsSource: D ? relOf(root, path.join(dir, 'autopilot')) + '/*.jsonl' : null,
    };
  }
  const o = orchestrator;
  const orch = !o ? { measured: false, reason: 'bench/autopilot.mjs orchestratorRate could not be loaded' }
    : o.ok === false ? { measured: false, reason: o.reason || 'orchestratorRate returned no rate' }
      : { measured: true, sources: o.sources || [], boards: numOr(o.boards), boardList: Array.isArray(o.boardList) ? o.boardList : [], barsMet: numOr(o.barsMet), windowFrom: o.windowFrom ?? null, windowTo: o.windowTo ?? null, windowDays: numOr(o.windowDays), boardsPerDay: numOr(o.boardsPerDay), barsMetPerDay: numOr(o.barsMetPerDay), boardsPerHour: numOr(o.boardsPerHour), barsMetPerHour: numOr(o.barsMetPerHour) };
  const sim = !spread ? { measured: false, reason: 'no ' + relOf(root, spreadFile) }
    : { measured: true, source: relOf(root, spreadFile), at: spread.at ?? null, isTheBar: spread.isTheBar === true, barMet: typeof spread.barMet === 'boolean' ? spread.barMet : null, keptPerMillionOrganismYears: numOr(spread.keptPerMillionOrganismYears), improvementsKept: numOr(spread.improvementsKept), organismYears: numOr(spread.organismYears), organismYearsOn: numOr(spread.organismYearsOn), generationsPerSecond: numOr(spread.generationsPerSecond), spreadGenerationsPerSecond: numOr(spread.spreadGenerationsPerSecond) };
  return { organism, orchestrator: orch, simulated: sim };
}

export function magnitudeLines(m) {
  const L = ['MAGNITUDE: the organism per wall hour beside the orchestrator and the simulated clock'];
  const g = m.organism;
  if (!g.measured) L.push('  organism: not measured (' + g.reason + ')');
  else {
    L.push('  organism: soak ' + na(g.runId) + ' (' + g.source + ', ' + g.startedAt + ' to ' + g.endedAt + ', ' + g.wallHours + ' wall hours): kept '
      + (g.kept === null ? 'not measured (no state/self/authored.jsonl)' : g.kept + ' (' + g.authoredSource + ', organism author)') + ' and ' + (g.keptDecisions === null ? 'not measured in the decision files' : g.keptDecisions + ' in ' + g.decisionsSource)
      + ', gaps moved ' + na(g.gapsMoved) + ', distance moved ' + na(g.distanceBarUnits) + ' bar units, decisions ' + na(g.attempts));
    L.push('    per wall hour: kept ' + na(g.keptPerHour) + ', gaps moved ' + na(g.gapsMovedPerHour) + ', distance ' + na(g.distancePerHour) + ' bar units, decisions ' + na(g.attemptsPerHour)
      + (g.authoredOnRecord === null ? '' : '; on record in all of ' + g.authoredSource + ': ' + g.authoredOnRecord + ' kept with an organism author'));
  }
  const o = m.orchestrator;
  L.push('  orchestrator: ' + (!o.measured ? 'not measured (' + o.reason + ')'
    : na(o.boards) + ' boards landed (' + o.boardList.join(', ') + ') and ' + na(o.barsMet) + ' bars met over ' + na(o.windowDays) + ' days (' + o.sources.join(', ') + ', ' + na(o.windowFrom) + ' to ' + na(o.windowTo) + '): '
      + na(o.boardsPerDay) + ' boards per day, ' + na(o.barsMetPerDay) + ' bars met per day (' + na(o.boardsPerHour) + ' and ' + na(o.barsMetPerHour) + ' per wall hour)'));
  const s = m.simulated;
  L.push('  simulated clock: ' + (!s.measured ? 'not measured (' + s.reason + ')'
    : na(s.keptPerMillionOrganismYears) + ' improvements kept per million organism-years (' + na(s.improvementsKept) + ' kept over ' + (s.organismYearsOn !== null && s.organismYearsOn !== undefined ? na(s.organismYearsOn) + ' organism-years in the spread arm, ' + na(s.organismYears) + ' in both arms), ' : na(s.organismYears) + ' organism-years), ')
      + na(s.generationsPerSecond) + ' generations per second (spread arm ' + na(s.spreadGenerationsPerSecond) + ') (' + s.source + ', ' + na(s.at) + ', isTheBar ' + s.isTheBar + ', barMet ' + na(s.barMet) + ')'));
  return L;
}

/**
 * UNDONE: board items undone per board (the ledger's "board item" lines), the ones the organism
 * attempted in the last 7 days and kept, with the wall each refused attempt hit (the brief
 * operator's state/self/brief/*.jsonl and any decision file line on a board item), partial bars
 * with the lines resumed and records completed (state/self/resume.jsonl and any resumed line in
 * state/self/authored.jsonl), and the proposed boards on disk with their item counts.
 */
export function undoneOf({ root = BOARD_ROOT, dir = VERDICTS_DIR, now = Date.now() } = {}) {
  const ledgerFile = path.join(root, 'state', 'self', 'gaps.jsonl');
  const briefDir = path.join(root, 'state', 'self', 'brief');
  const decDir = path.join(dir, 'autopilot');
  const authFile = path.join(root, 'state', 'self', 'authored.jsonl');
  const resumeFile = path.join(root, 'state', 'self', 'resume.jsonl');
  const propDir = path.join(root, 'docs', 'boards', 'proposed');
  const L = readJsonlSafe(ledgerFile), B = jsonlDir(briefDir), D = jsonlDir(decDir), A = readJsonlSafe(authFile), R = readJsonlSafe(resumeFile);
  const from = now - WEEK_MS;
  const out = { at: new Date(now).toISOString(), windowDays: 7, sources: { ledger: relOf(root, ledgerFile), brief: relOf(root, briefDir) + '/*.jsonl', decisions: relOf(root, decDir) + '/*.jsonl', authored: relOf(root, authFile), resume: relOf(root, resumeFile), proposed: relOf(root, propDir) + '/*.md' } };
  if (L) {
    const items = L.rows.filter((g) => g.kind === 'board item');
    out.items = { total: items.length, byBoard: countBy(items, (g) => (g.board ?? 'unknown')) };
  } else out.items = null;
  // attempts: a decision line on a board item gap, from the brief logs and the decision files
  const isItem = (id) => /^board-\d+:/.test(String(id || ''));
  const isPlant = (id) => /^board-planted:/.test(String(id || ''));
  const decisionRows = [
    ...(B ? B.rows.filter((x) => x.kind === 'decision' && typeof x.decision === 'string').map((x) => ({ ...x, src: relOf(root, briefDir) + '/' + x.fileOf })) : []),
    ...(D ? D.rows.filter((x) => typeof x.decision === 'string' && (isItem(x.gap) || isPlant(x.gap))).map((x) => ({ ...x, src: relOf(root, decDir) + '/' + x.fileOf })) : []),
  ].filter((x) => inWindow(x, from, now));
  const tally = (rows) => {
    const per = new Map();
    for (const x of rows.sort(byAt)) {
      const p = per.get(x.gap) || { gap: x.gap, attempts: 0, kept: 0, refused: 0, walls: {}, last: null };
      p.attempts++;
      if (x.decision === 'kept') p.kept++;
      if (x.decision === 'refused') { p.refused++; const w = x.wall || 'unrecorded'; p.walls[w] = (p.walls[w] || 0) + 1; }
      p.last = x.at;
      per.set(x.gap, p);
    }
    const list = [...per.values()];
    const walls = {};
    for (const p of list) for (const [w, n] of Object.entries(p.walls)) walls[w] = (walls[w] || 0) + n;
    return { gaps: list.length, attempts: list.reduce((a, p) => a + p.attempts, 0), kept: list.reduce((a, p) => a + p.kept, 0), refused: list.reduce((a, p) => a + p.refused, 0), walls, per: list };
  };
  out.attempts = B || D ? tally(decisionRows.filter((x) => isItem(x.gap))) : null;
  out.plants = B || D ? tally(decisionRows.filter((x) => isPlant(x.gap))) : null;
  out.authoredOnItems = A ? A.rows.filter((x) => isItem(x.gap) || isItem(x.from)).length : null;
  // partial bars and the resume log
  const resumed = [...(R ? R.rows : []), ...(A ? A.rows.filter((x) => x.kind === 'resumed') : [])].filter((x) => Array.isArray(x.gaps));
  if (L) {
    const partial = L.rows.filter((g) => g.kind === 'bar never completed');
    const lastNot = resumed.slice().sort(byAt).reverse().find((x) => Array.isArray(x.notResumable));
    const touching = resumed.filter((x) => partial.some((g) => x.gaps.includes(g.id)));
    const total = (k) => { const v = touching.filter((x) => isNum(x[k])); return v.length ? v.reduce((a, x) => a + x[k], 0) : null; };
    out.partial = {
      total: partial.length, resumeLog: R ? { lines: R.rows.length, unparsed: R.bad } : null,
      distinct: { runs: touching.length, linesResumed: total('linesAdded'), recordsCompleted: total('recordsCompleted') },
      bars: partial.map((g) => {
        const runs = resumed.filter((x) => x.gaps.includes(g.id));
        const sum = (k) => { const v = runs.filter((x) => isNum(x[k])); return v.length ? v.reduce((a, x) => a + x[k], 0) : null; };
        return { gap: g.id, verdictFile: g.verdictFile ?? null, runs: runs.length, linesResumed: sum('linesAdded'), recordsCompleted: sum('recordsCompleted'), last: runs.length ? runs.sort(byAt)[runs.length - 1].at : null, barLanded: runs.some((x) => x.barLanded === true), notResumable: !!(lastNot && lastNot.notResumable.includes(g.id)) };
      }),
    };
  } else out.partial = null;
  // proposed boards
  let names = null; try { names = readdirSync(propDir).filter((n) => n.endsWith('.md')).sort(); } catch { names = null; }
  out.proposed = names === null ? null : names.map((n) => {
    let text = ''; try { text = readFileSync(path.join(propDir, n), 'utf8'); } catch { text = ''; }
    const board = (/^board:\s*(\d+)\s*$/m.exec(text) || [null, null])[1];
    const at = (/^at:\s*(\S+)\s*$/m.exec(text) || [null, null])[1];
    return { file: relOf(root, path.join(propDir, n)), board: board === null ? null : Number(board), items: (text.match(/^## item /gm) || []).length, at };
  });
  return out;
}

export function undoneLines(u) {
  const L = [];
  const s = u.sources;
  L.push('UNDONE (' + [s.ledger, s.brief, s.decisions, s.authored, s.resume, s.proposed].join(', ') + '; the last ' + u.windowDays + ' days to ' + u.at + '):');
  L.push('  board items undone: ' + (u.items ? u.items.total + ' (' + (Object.entries(u.items.byBoard).map(([b, n]) => 'board ' + b + ' ' + n).join(', ') || 'none') + ')' : 'not measured (no ' + s.ledger + ')'));
  const a = u.attempts;
  if (!a) L.push('  attempted by the organism in the last ' + u.windowDays + ' days: not measured (neither ' + s.brief + ' nor ' + s.decisions + ' is on disk)');
  else {
    L.push('  attempted by the organism in the last ' + u.windowDays + ' days: ' + a.gaps + ' board items in ' + a.attempts + ' attempts, kept ' + a.kept + ', refused ' + a.refused + (a.refused ? ' (walls hit: ' + kv(a.walls) + ')' : '')
      + (u.authoredOnItems === null ? '' : '; authored lines on a board item ' + u.authoredOnItems));
    for (const p of a.per) L.push('    ' + p.gap + ': attempts ' + p.attempts + ', kept ' + p.kept + ', refused ' + p.refused + (p.refused ? ' at ' + kv(p.walls) : '') + ', last ' + p.last);
    const pl = u.plants;
    if (pl && pl.attempts) L.push('  bench plants (not board items): ' + pl.gaps + ' planted items in ' + pl.attempts + ' attempts, kept ' + pl.kept + ', refused ' + pl.refused + (pl.refused ? ' (walls hit: ' + kv(pl.walls) + ')' : ''));
  }
  const p = u.partial;
  if (!p) L.push('  partial bars: not measured (no ' + s.ledger + ')');
  else {
    const touched = p.bars.filter((b) => b.runs > 0).length;
    L.push('  partial bars (kind bar never completed): ' + p.total + '; resume log ' + (p.resumeLog ? p.resumeLog.lines + ' lines' : 'not measured (no ' + s.resume + ')') + ', ' + touched + ' of them resumed'
      + (p.distinct.runs ? ' by ' + p.distinct.runs + ' distinct resume runs (lines resumed ' + na(p.distinct.linesResumed) + ', records completed ' + na(p.distinct.recordsCompleted) + '; one run can resume several bars, so the per-bar lines below share them)' : ''));
    for (const b of p.bars) L.push('    ' + b.gap + ': ' + (b.runs ? b.runs + ' resume runs, lines resumed ' + na(b.linesResumed) + ', records completed ' + na(b.recordsCompleted) + ', last ' + b.last + ', bar landed ' + (b.barLanded ? 'yes' : 'no') : p.resumeLog || b.notResumable ? 'no resume run' : 'lines resumed not measured') + (b.notResumable ? '; the resume log names it not resumable' : ''));
  }
  if (u.proposed === null) L.push('  proposed boards: not measured (no ' + s.proposed.replace('/*.md', '/') + ')');
  else {
    L.push('  proposed boards on disk: ' + u.proposed.length);
    for (const b of u.proposed) L.push('    ' + b.file + ': board ' + na(b.board) + ', ' + b.items + ' items' + (b.at ? ', at ' + b.at : ''));
  }
  return L;
}

// ---------------------------------------------------------------- Board 13: CLIMB, PLATEAU, CLOCK, DIRECT and the tie-break
// Five readings of the verdicts on disk, run like the rest of the board: nothing is run, a missing
// verdict prints "not measured", a -partial or isTheBar false one prints "partial", and a number a
// verdict does not carry prints "n/a", never a zero. PLATEAU, CLOCK and the leak-free half of
// DIRECT read verdicts other builders of this board write; their field names are not fixed here, so
// those blocks print the verdict's own fields by path (fieldGroups) and a reader checks each one
// against the file named beside it. Board 11's number is printed beside each as the baseline.

/** The landed boards of docs/BOARDS.json in landing order, and the board in progress (the lowest with no landing). */
export function boardWindowsOf(boardsFile = path.join(BOARD_ROOT, 'docs', 'BOARDS.json')) {
  const bj = readJsonSafe(boardsFile);
  const arr = Array.isArray(bj) ? bj : bj && Array.isArray(bj.boards) ? bj.boards : [];
  const landed = arr.filter((b) => b && isNum(b.board) && Number.isFinite(Date.parse(b.at))).map((b) => ({ board: b.board, at: b.at, ms: Date.parse(b.at) })).sort((a, b) => a.ms - b.ms);
  const open = arr.filter((b) => b && isNum(b.board) && !Number.isFinite(Date.parse(b.at))).map((b) => b.board).sort((a, b) => a - b);
  return { source: boardRel(boardsFile), read: !!bj, landed, inProgress: open.length ? open[0] : null };
}

/**
 * The board a verdict belongs to: its own board field; else the first landing in docs/BOARDS.json
 * at or after its at (the first landing takes everything before it, so it reads "or earlier");
 * after the last landing, the board in progress.
 */
export function boardOfVerdict(v, windows) {
  if (v && isNum(v.board)) return { board: v.board, how: 'its board field', orEarlier: false, inProgress: false };
  const t = Date.parse(v && v.at);
  if (!Number.isFinite(t)) return { board: null, how: 'no at', orEarlier: false, inProgress: false };
  const i = windows.landed.findIndex((b) => b.ms >= t);
  if (i >= 0) return { board: windows.landed[i].board, how: 'landing window', orEarlier: i === 0, inProgress: false };
  return { board: windows.inProgress, how: 'after the last landing', orEarlier: false, inProgress: true };
}

/** The sets the CLIMB block reads: the ladder's two public sets and the ARC evaluation set with Board 11's library run and this board's whole-400 clock run. */
export const CLIMB_SETS = Object.freeze([
  Object.freeze({ key: 'gsm8k', name: 'GSM8K', match: PUBLIC_SETS[0].match }),
  Object.freeze({ key: 'humaneval', name: 'HumanEval', match: PUBLIC_SETS[1].match }),
  Object.freeze({ key: 'arc', name: 'ARC-AGI-1 evaluation', match: /^(?:(?:public-arc|grid-evaluation|grid-clock-whole)(?:-[a-z0-9]+)*|grid-library(?:-partial)?)\.json$/ }),
]);
const CONTROL_ARM = /^(?:base|control|fixed|plain|none|null|alone|off|no-?library)$/i;

/**
 * The organism's count in one verdict: its organism arm; else, for a verdict whose arms are a list
 * (grid-library.json), the one arm outside the controls (base, control, fixed, plain, none, null,
 * alone, off, no-library), its first run. Two intervention arms is no reading, never a pick.
 */
export function climbArmOf(v) {
  if (v && Array.isArray(v.arms)) {
    const named = v.arms.filter((x) => x && typeof x === 'object' && typeof x.arm === 'string' && !CONTROL_ARM.test(x.arm) && isNum(countOf(x)) && isNum(x.n) && x.n > 0);
    const names = [...new Set(named.map((x) => x.arm))];
    if (names.length === 1) {
      const x = named[0], c = countOf(x);
      return { absent: false, arm: x.arm + (x.label ? ' (' + x.label + ')' : ''), n: x.n, correct: c, accuracy: bR6(c / x.n), interval: wilson95(c, x.n), intervalFrom: 'the ladder (Wilson 95)' };
    }
    return { absent: true, reason: names.length ? 'intervention arms ' + names.join(', ') + ': no one arm to read' : 'no arm outside the controls carries a count' };
  }
  const a = armsOf(v).organism;
  if (a && !a.absent && isNum(a.correct) && isNum(a.n) && a.n > 0) return { ...a, arm: 'organism' };
  return { absent: true, reason: a && a.reason ? a.reason : 'no organism arm' };
}

/** CLIMB: per public set, the newest board's number against the board before it, with both intervals. */
export function climbOf({ dir = VERDICTS_DIR, boardsFile = path.join(BOARD_ROOT, 'docs', 'BOARDS.json') } = {}) {
  const windows = boardWindowsOf(boardsFile);
  let names = []; try { names = readdirSync(dir).sort(); } catch { names = []; }
  const lastLanding = windows.landed.length ? windows.landed[windows.landed.length - 1] : null;
  const sets = CLIMB_SETS.map((set) => {
    const vs = names.filter((n) => set.match.test(n)).map((name) => ({ name, v: readJsonSafe(path.join(dir, name)) })).filter((x) => x.v && typeof x.v === 'object' && !Array.isArray(x.v));
    const ofs = vs.map((x) => sampleOf(x.v).of).filter(isNum);
    const setOf = ofs.length ? Math.max(...ofs) : null;
    const rows = vs.map(({ name, v }) => {
      const s = sampleOf(v);
      const arm = climbArmOf(v);
      // a verdict that records n and no of (grid-library.json) is held to the largest of its set records
      const view = s.of === null && setOf !== null ? { ...v, n: s.n ?? (arm.absent ? null : arm.n), of: setOf } : v;
      const reasons = partialReasons(name, view);
      const b = boardOfVerdict(v, windows);
      const sv = sampleOf(view);
      return {
        file: boardRel(path.join(dir, name)), at: v.at ? String(v.at) : null, board: b.board, boardHow: b.how, orEarlier: b.orEarlier, inProgress: b.inProgress,
        status: reasons.length ? 'PARTIAL' : 'whole', reasons, n: sv.n, of: sv.of, model: v.model === undefined ? null : v.model,
        arm: arm.absent ? null : { name: arm.arm, correct: arm.correct, n: arm.n, accuracy: arm.accuracy, interval: arm.interval, intervalFrom: arm.intervalFrom },
        armReason: arm.absent ? arm.reason : null,
      };
    });
    // one number per board: its newest whole verdict with an organism count, else its newest partial one
    const byBoard = new Map();
    for (const r of rows.filter((x) => x.arm && x.board !== null)) {
      const cur = byBoard.get(r.board);
      const better = !cur || (r.status === 'whole' && cur.status !== 'whole') || (r.status === cur.status && String(r.at) > String(cur.at));
      if (better) byBoard.set(r.board, r);
    }
    const reps = [...byBoard.values()].sort((a, b) => String(a.at).localeCompare(String(b.at)));
    const current = reps.length ? reps[reps.length - 1] : null;
    const previous = reps.length > 1 ? reps[reps.length - 2] : null;
    let delta = null;
    if (current && previous) {
      const c = current.arm, p = previous.arm;
      const decided = isNum(c.interval.lo) && isNum(p.interval.hi) && c.interval.lo > p.interval.hi ? 'up'
        : isNum(c.interval.hi) && isNum(p.interval.lo) && c.interval.hi < p.interval.lo ? 'down' : null;
      delta = { points: bR2((c.accuracy - p.accuracy) * 100), decided, partial: current.status !== 'whole' || previous.status !== 'whole', sameModel: current.model === previous.model };
    }
    const thisBoard = windows.inProgress === null ? null : { board: windows.inProgress, measured: !!(current && current.board === windows.inProgress) };
    return {
      key: set.key, name: set.name, files: rows.length, rows, current, previous, delta, thisBoard,
      unread: rows.filter((r) => !r.arm).map((r) => ({ file: r.file, reason: r.armReason })),
      reason: rows.length ? null : 'no verdict file under ' + boardRel(dir) + ' matches ' + set.match,
    };
  });
  return { source: windows.source, boardsRead: windows.read, inProgress: windows.inProgress, lastLanding: lastLanding ? { board: lastLanding.board, at: lastLanding.at } : null, sets };
}

const pctIv = (a) => pctOf(a.accuracy) + '% [' + pctOf(a.interval.lo) + ', ' + pctOf(a.interval.hi) + ']';
function climbRowText(r) {
  return 'board ' + na(r.board) + (r.orEarlier ? ' or earlier' : '') + (r.inProgress ? ' (in progress)' : '') + ': ' + (r.status === 'whole' ? 'whole' : 'PARTIAL (' + r.reasons.join(', ') + ')')
    + ', ' + r.file + ' at ' + na(r.at) + ', model ' + (r.model === null ? 'none' : r.model) + ', n ' + na(r.n) + ' of ' + na(r.of)
    + ': ' + r.arm.name + ' ' + r.arm.correct + '/' + r.arm.n + ' = ' + pctIv(r.arm);
}

/** The CLIMB block. */
export function climbLines(c) {
  const L = ['CLIMB: per public set, the newest board\'s number against the board before it (a verdict\'s board is its board field, else the first landing in ' + c.source + ' at or after its at, else the board in progress'
    + (c.inProgress !== null ? ', ' + c.inProgress : '') + (c.boardsRead ? '' : '; ' + c.source + ' could not be read, so every verdict is the board in progress') + ')'];
  for (const s of c.sets) {
    if (!s.files) { L.push('  ' + s.name + ': not measured (' + s.reason + ')'); continue; }
    if (s.thisBoard && !s.thisBoard.measured) L.push('  ' + s.name + ': board ' + s.thisBoard.board + ' (in progress): not measured, no ' + s.name + ' verdict after the last landing' + (c.lastLanding ? ' (board ' + c.lastLanding.board + ' at ' + c.lastLanding.at + ')' : ''));
    else L.push('  ' + s.name + ':');
    if (!s.current) L.push('    newest: not measured (' + s.files + ' verdict file(s), none with an organism count the ladder can read: ' + s.unread.map((u) => u.file + ', ' + u.reason).join('; ') + ')');
    else L.push('    newest, ' + climbRowText(s.current));
    if (s.current) L.push('    before: ' + (s.previous ? climbRowText(s.previous) : 'not measured (no earlier board holds a ' + s.name + ' verdict with an organism count)'));
    const d = s.delta;
    if (s.current) L.push('    delta: ' + (!d ? 'not measured (one board only)'
      : (d.points > 0 ? '+' : '') + d.points.toFixed(2) + ' points (' + pctOf(s.current.arm.accuracy) + ' against ' + pctOf(s.previous.arm.accuracy) + '), '
        + (d.decided ? d.decided + ', the intervals separate' : 'the intervals overlap (undecided)')
        + (d.partial ? '; partial: a sample on at least one side, not a whole-set climb' : '; whole against whole')
        + (d.sameModel ? '' : '; the models differ (' + (s.current.model ?? 'none') + ' against ' + (s.previous.model ?? 'none') + ')')));
    if (s.unread.length && s.current) L.push('    not read (no organism count): ' + s.unread.map((u) => u.file).join(', '));
  }
  return L;
}

/**
 * The verdict's own fields by path: every object (to a small depth) whose scalar fields include a key
 * matching re, printed as that object's path and its matching fields, plus the fields that name it
 * (arm, plane, label, name, mode, seed, intervention, clock). A number printed is a field.
 */
const NAMING_KEY = /^(?:arm|plane|label|name|mode|seed|seeds|intervention|clock|clockS|clockMs|kind|set|split)$/;
export function fieldGroups(obj, re, { max = 16, depth = 5 } = {}) {
  const groups = [];
  let total = 0;
  const scalar = (x) => (typeof x === 'number' && Number.isFinite(x)) || typeof x === 'boolean' || (typeof x === 'string' && x.length <= 48);
  const shown = (x) => (typeof x === 'string' ? '"' + x + '"' : Array.isArray(x) ? '[' + x.join(', ') + ']' : String(x));
  const visit = (o, p, d) => {
    if (!o || typeof o !== 'object' || d > depth) return;
    if (Array.isArray(o)) { o.forEach((x, i) => visit(x, p + '[' + i + ']', d + 1)); return; }
    const fields = [];
    for (const [k, x] of Object.entries(o)) {
      const numList = Array.isArray(x) && x.length > 0 && x.length <= 8 && x.every((y) => typeof y === 'number' && Number.isFinite(y));
      if (!(scalar(x) || numList)) continue;
      if (typeof x !== 'string' && re.test(k)) fields.push([k, x, true]);
      else if (NAMING_KEY.test(k)) fields.push([k, x, false]);
    }
    if (fields.some((f) => f[2])) {
      total++;
      if (groups.length < max) groups.push({ path: p || '(top)', fields: fields.map(([k, x]) => k + ' ' + shown(x)) });
    }
    for (const [k, x] of Object.entries(o)) if (x && typeof x === 'object' && !['statement', 'rows', 'journal'].includes(k)) visit(x, p ? p + '.' + k : k, d + 1);
  };
  visit(obj, '', 0);
  return { groups, total };
}

/** The first of these verdict files that parses, with why it is narrow; null when none does. */
function firstVerdictOf(dir, names) {
  for (const name of names) {
    const v = readJsonSafe(path.join(dir, name));
    if (!v || typeof v !== 'object' || Array.isArray(v)) continue;
    const partialBecause = narrowReasons(name, v);
    return { name, v, file: boardRel(path.join(dir, name)), at: v.at || null, command: v.command || null, isTheBar: v.isTheBar === true, barMet: typeof v.barMet === 'boolean' ? v.barMet : null, partial: partialBecause.length > 0, partialBecause };
  }
  return null;
}
const headOfVerdict = (f) => f.file + ', ' + (f.partial ? 'PARTIAL: ' + f.partialBecause.join(', ') : 'whole, isTheBar true') + ', ' + na(f.at) + (f.barMet === null ? '' : ', barMet ' + f.barMet);
const summaryOf = (f, re, max) => { const g = fieldGroups(f.v, re, { max }); return { file: f.file, at: f.at, command: f.command, isTheBar: f.isTheBar, barMet: f.barMet, partial: f.partial, partialBecause: f.partialBecause, groups: g.groups, groupsTotal: g.total }; };
function groupLines(s, indent) {
  const L = [];
  if (!s.groups.length) L.push(indent + 'no field of it matches what this block reads; open the file');
  for (const g of s.groups) L.push(indent + g.path + ': ' + g.fields.join(', '));
  if (s.groupsTotal > s.groups.length) L.push(indent + '(' + s.groups.length + ' of ' + s.groupsTotal + ' matching objects printed; the rest are in the file)');
  return L;
}

/** PLATEAU: the plateau second and the score gained after it, from plateau.json, beside Board 11's first plateau (years.json). */
export const PLATEAU_FIELDS = /plateau|gain|after|noise|final|perMillion/i;
export function plateauOf({ dir = VERDICTS_DIR } = {}) {
  const y = readJsonSafe(path.join(dir, 'years.json'));
  const baseline = y && y.bar && Array.isArray(y.bar.perPlane) ? {
    file: boardRel(path.join(dir, 'years.json')), at: y.at || null,
    planes: y.bar.perPlane.map((p) => ({ plane: p && p.plane ? String(p.plane) : null, firstPlateauS: numOr(p && p.firstPlateauS), start: numOr(p && p.start), end: numOr(p && p.end), gained: numOr(p && p.gained), organismYears: numOr(p && p.organismYears) })),
  } : null;
  const f = firstVerdictOf(dir, ['plateau.json', 'plateau-partial.json']);
  if (!f) return { source: null, reason: 'no bench/verdicts/plateau.json or plateau-partial.json', baseline };
  return { source: f.file, ...summaryOf(f, PLATEAU_FIELDS, 16), baseline };
}
export function plateauLines(p) {
  const L = [];
  const b = p.baseline;
  const base = b ? 'Board 11 baseline (' + b.file + ', ' + na(b.at) + '): ' + b.planes.map((x) => na(x.plane) + ' plane first plateau ' + (x.firstPlateauS === null ? 'n/a' : x.firstPlateauS.toFixed(3) + ' s') + ', score ' + na(x.start) + ' to ' + na(x.end) + ' over ' + na(x.organismYears) + ' organism-years').join('; ')
    : 'Board 11 baseline: not measured (no bench/verdicts/years.json with bar.perPlane)';
  if (!p.source) { L.push('PLATEAU: not measured (' + p.reason + ')'); L.push('  ' + base); return L; }
  L.push('PLATEAU (' + headOfVerdict(p) + '): the plateau second and the score gained after it, the verdict\'s own fields by path');
  L.push(...groupLines(p, '  '));
  L.push('  ' + base);
  return L;
}

/** CLOCK: solved against clock (grid-clock.json) and the whole-400 count (grid-clock-whole.json), beside Board 11's library run. */
export const CLOCK_FIELDS = /solved|timed|wrong|noise|budget|perSecond|wall|clock/i;
export function clockOf({ dir = VERDICTS_DIR } = {}) {
  const gl = readJsonSafe(path.join(dir, 'grid-library.json'));
  let baseline = null;
  if (gl && Array.isArray(gl.arms)) {
    const lib = gl.arms.find((a) => a && a.arm === 'library');
    const base = gl.arms.filter((a) => a && a.arm === 'base');
    baseline = { file: boardRel(path.join(dir, 'grid-library.json')), at: gl.at || null, budgetMs: numOr(gl.budgetMs), library: lib ? { solved: numOr(lib.solved), n: numOr(lib.n), timedOut: numOr(lib.timedOut), foundButWrong: numOr(lib.foundButWrong) } : null, base: base.map((a) => numOr(a.solved)), noise: numOr(gl.noise) };
  }
  const curve = firstVerdictOf(dir, ['grid-clock.json', 'grid-clock-partial.json']);
  const whole = firstVerdictOf(dir, ['grid-clock-whole.json', 'grid-clock-whole-partial.json']);
  return {
    curve: curve ? summaryOf(curve, CLOCK_FIELDS, 24) : null, curveReason: curve ? null : 'no bench/verdicts/grid-clock.json or grid-clock-partial.json',
    whole: whole ? summaryOf(whole, CLOCK_FIELDS, 12) : null, wholeReason: whole ? null : 'no bench/verdicts/grid-clock-whole.json or grid-clock-whole-partial.json',
    baseline,
  };
}
export function clockLines(c) {
  const L = ['CLOCK: solved against clock on the ARC evaluation set, and the whole-400 count'];
  if (!c.curve) L.push('  curve: not measured (' + c.curveReason + ')');
  else { L.push('  curve (' + headOfVerdict(c.curve) + '):'); L.push(...groupLines(c.curve, '    ')); }
  if (!c.whole) L.push('  whole 400: not measured (' + c.wholeReason + ')');
  else { L.push('  whole 400 (' + headOfVerdict(c.whole) + '):'); L.push(...groupLines(c.whole, '    ')); }
  const b = c.baseline;
  L.push('  Board 11 baseline: ' + (!b ? 'not measured (no bench/verdicts/grid-library.json with its arms)'
    : b.file + ', ' + na(b.at) + ', clock ' + na(b.budgetMs) + ' ms per task: library ' + (b.library ? na(b.library.solved) + ' of ' + na(b.library.n) + ' solved, ' + na(b.library.timedOut) + ' timed out, ' + na(b.library.foundButWrong) + ' found but wrong' : 'n/a')
      + '; no-library runs ' + (b.base.length ? b.base.map(na).join(' and ') : 'n/a') + ', noise ' + na(b.noise)));
  return L;
}

/** DIRECT: the leak-free recall (direct-clean.json) beside Board 11's swept table (native.json) and null. */
export const DIRECT_FIELDS = /recall|hit|null|ns$|Ns|overlap|leak|warm|tally|correct|miss|swept|clean/i;
export function directRecallOf({ dir = VERDICTS_DIR } = {}) {
  const nv = readJsonSafe(path.join(dir, 'native.json'));
  const w = nv && nv.wiki && nv.wiki.arms ? nv.wiki : null;
  const arm = (k) => (w && w.arms[k] ? { recall: numOr(w.arms[k].recallAt1), n: numOr(w.arms[k].n ?? w.n), direct: numOr(w.arms[k].direct), directCorrect: numOr(w.arms[k].directCorrect) } : null);
  const iv = (a) => (a && isNum(a.recall) && isNum(a.n) && a.n > 0 ? wilson95(a.recall, a.n) : null);
  const swept = w ? {
    file: boardRel(path.join(dir, 'native.json')), at: nv.at || null, isTheBar: nv.isTheBar === true,
    table: arm('direct'), control: arm('control'), none: arm('none'),
    hitNsMedian: numOr(nv.timing && nv.timing.hitNsMedian), missNsMedian: numOr(nv.timing && nv.timing.missNsMedian),
    titlesSwept: numOr(nv.fill && nv.fill.of), drawnInControl: numOr(nv.fill && nv.fill.drawnInControl),
  } : null;
  if (swept) for (const k of ['table', 'control', 'none']) if (swept[k]) swept[k].interval = iv(swept[k]);
  const f = firstVerdictOf(dir, ['direct-clean.json', 'direct-clean-partial.json']);
  return { clean: f ? summaryOf(f, DIRECT_FIELDS, 16) : null, cleanReason: f ? null : 'no bench/verdicts/direct-clean.json or direct-clean-partial.json', swept, sweptReason: swept ? null : 'no bench/verdicts/native.json with wiki.arms' };
}
export function directRecallLines(d) {
  const L = ['DIRECT: recall@1 with no model call, the leak-free table beside the swept one and null'];
  if (!d.clean) L.push('  leak-free (filled only from asks): not measured (' + d.cleanReason + ')');
  else { L.push('  leak-free (' + headOfVerdict(d.clean) + '):'); L.push(...groupLines(d.clean, '    ')); }
  const s = d.swept;
  if (!s) { L.push('  swept (Board 11): not measured (' + d.sweptReason + ')'); return L; }
  const one = (a) => (!a ? 'n/a' : na(a.recall) + ' of ' + na(a.n) + (a.interval ? ' [' + pctOf(a.interval.lo) + ', ' + pctOf(a.interval.hi) + ']' : ''));
  L.push('  swept (Board 11, ' + s.file + ', ' + na(s.at) + '): the table ' + one(s.table) + ' with ' + (s.table ? na(s.table.direct) : 'n/a') + ' direct hits (' + (s.table ? na(s.table.directCorrect) : 'n/a') + ' correct), '
    + na(s.hitNsMedian) + ' ns median per hit, ' + na(s.missNsMedian) + ' ns per miss; filled by sweeping ' + na(s.titlesSwept) + ' titles, the drawn ones included, so it is memoisation of the tier');
  L.push('  control (the swept table with the drawn titles left out) ' + one(s.control) + ' with ' + (s.control ? na(s.control.direct) : 'n/a') + ' direct hits; null ' + one(s.none));
  return L;
}

/**
 * The truth about Board 12's MULTIPLYING bar: the builder's run (notes/multiply.md) and the verifier's
 * rerun (bench/verdicts/multiply.json, the bar file), the searched fitness of every pick, and whether
 * any run printed seed-to-seed noise. While the picks share one searched fitness, or no run printed a
 * noise, or no gap is wider than it, the fresh number is decided by the tie-break and is not a bar.
 */
// the builder's note sits beside the verdicts of a tree (<root>/notes/multiply.md for <root>/bench/verdicts);
// any other directory has no note, so a temp directory never reads the real one
const notesOfDir = (dir) => (path.basename(dir) === 'verdicts' && path.basename(path.dirname(dir)) === 'bench' ? path.join(path.dirname(path.dirname(dir)), 'notes', 'multiply.md') : null);
export function tieBreakOf({ dir = VERDICTS_DIR, notesFile = notesOfDir(dir) } = {}) {
  const runs = [];
  let text = null; try { text = notesFile ? readFileSync(notesFile, 'utf8') : null; } catch { text = null; }
  const noteRel = notesFile ? boardRel(notesFile) : null;
  if (text) {
    const lines = text.split(/\r?\n/);
    const find = (re) => { for (let i = 0; i < lines.length; i++) { const m = re.exec(lines[i]); if (m) return { m, line: i + 1 }; } return null; };
    const s = find(/^\[bar\] single: (\d+)\/(\d+) fresh/);
    const p = find(/^\[bar\] population pick by the searched objective: (\d+)\/(\d+) fresh/);
    const f = find(/ended on the same searched score\b.*?fitness (0\.\d+)/);
    const mm = find(/the means were ([\d.]+) \(population\) and ([\d.]+) \(single\)/);
    if (s && p) runs.push({ who: 'builder', source: noteRel + ':' + s.line + ',' + p.line, at: null, wallS: null, single: Number(s.m[1]), population: Number(p.m[1]), freshT: Number(s.m[2]),
      picks: f ? [{ arm: 'single', fitness: Number(f.m[1]) }, { arm: 'population', fitness: Number(f.m[1]) }] : [], fitnessSource: f ? noteRel + ':' + f.line : null,
      freshMoreMean: mm ? { population: Number(mm.m[1]), single: Number(mm.m[2]), source: noteRel + ':' + mm.line } : null, noise: null });
  }
  const noiseOf = (v) => {
    for (const x of [v.seedNoise, v.noise, v.bar && v.bar.noise, v.bar && v.bar.seedNoise]) {
      if (isNum(x)) return x;
      if (x && typeof x === 'object') for (const k of ['seedToSeed', 'fresh', 'width', 'sd']) if (isNum(x[k])) return x[k];
    }
    return null;
  };
  for (const [who, name] of [['bar file', 'multiply.json'], ['partial', 'multiply-partial.json']]) {
    const v = readJsonSafe(path.join(dir, name));
    if (!v || typeof v !== 'object' || !v.bar) continue;
    const pick = (k) => (v.arms && v.arms[k] && v.arms[k].pick ? v.arms[k].pick : null);
    const picks = ['single', 'population'].map((k) => ({ arm: k, fitness: numOr(pick(k) && pick(k).fitness) })).filter((x) => x.fitness !== null);
    const fm = (k) => numOr(pick(k) && pick(k).freshMoreMean);
    runs.push({ who, source: boardRel(path.join(dir, name)), at: v.at || null, wallS: numOr(v.config && v.config.wallS), single: numOr(v.bar.singleFresh), population: numOr(v.bar.populationFresh), freshT: numOr(v.bar.freshT),
      picks, fitnessSource: picks.length ? boardRel(path.join(dir, name)) + ' arms.*.pick.fitness' : null,
      freshMoreMean: fm('population') !== null || fm('single') !== null ? { population: fm('population'), single: fm('single'), source: boardRel(path.join(dir, name)) + ' arms.*.pick.freshMoreMean' } : null, noise: noiseOf(v) });
  }
  for (const r of runs) r.gap = isNum(r.population) && isNum(r.single) ? r.population - r.single : null;
  const whole = runs.filter((r) => r.who !== 'partial');
  const fits = whole.flatMap((r) => r.picks.map((x) => x.fitness));
  const shared = fits.length >= 2 && fits.every((x) => x === fits[0]) ? fits[0] : null;
  const noises = whole.map((r) => r.noise).filter(isNum);
  const noise = noises.length ? Math.max(...noises) : null;
  const gaps = whole.map((r) => r.gap).filter(isNum);
  const b = whole.find((r) => r.who === 'builder'), v = whole.find((r) => r.who === 'bar file');
  const moved = b && v ? { population: isNum(b.population) && isNum(v.population) ? Math.abs(v.population - b.population) : null, single: isNum(b.single) && isNum(v.single) ? Math.abs(v.single - b.single) : null } : null;
  const measured = whole.length > 0;
  const tie = !measured ? null : shared !== null || noise === null || !gaps.length || gaps.some((g) => Math.abs(g) <= noise);
  return {
    measured, runs, picks: fits.length, sharedFitness: shared, noise, moved, tieBreak: tie,
    label: tie === null ? 'not measured' : tie ? 'decided by tie-break noise, not a bar' : 'decided by a gap wider than the seed-to-seed noise',
    rule: 'the label lifts only when a run prints its seed-to-seed noise and a gap wider than it, between picks of different searched fitness',
  };
}
export function tieBreakLines(t) {
  if (!t || !Array.isArray(t.runs)) return ['  TRUTH: not measured (no tie-break reading on this board)'];
  const L = [];
  const gapText = (g) => (g === null ? 'n/a' : (g > 0 ? '+' : '') + g);
  L.push('  TRUTH: ' + (t.measured ? t.label + ' (' + t.rule + ')' : 'not measured (no whole run: neither notes/multiply.md nor bench/verdicts/multiply.json holds one)'));
  for (const r of t.runs) {
    L.push('    ' + (r.who === 'builder' ? 'the builder\'s run' : r.who === 'bar file' ? 'the bar file (the verifier\'s rerun)' : 'the partial run') + ' (' + r.source + (r.at ? ', ' + r.at : '') + (isNum(r.wallS) ? ', ' + r.wallS + ' wall s per arm' : '') + '): population '
      + na(r.population) + '/' + na(r.freshT) + ' against single ' + na(r.single) + '/' + na(r.freshT) + ', gap ' + gapText(r.gap)
      + (r.picks.length ? '; pick fitness ' + r.picks.map((x) => x.arm + ' ' + x.fitness).join(', ') + ' (' + r.fitnessSource + ')' : '; pick fitness not recorded')
      + (r.freshMoreMean ? '; mean over the other fresh draws population ' + na(r.freshMoreMean.population) + ', single ' + na(r.freshMoreMean.single) : ''));
  }
  if (t.measured) L.push('    ' + (t.sharedFitness !== null ? 'every one of the ' + t.picks + ' picks with a recorded fitness shares one searched fitness, ' + t.sharedFitness + ', so the fresh number is chosen by the tie-break among equal libraries'
    : t.picks ? 'the ' + t.picks + ' picks with a recorded fitness do not all share one' : 'no pick records its searched fitness')
    + (t.moved ? '; the same command moved the population pick by ' + na(t.moved.population) + ' and the single by ' + na(t.moved.single) + ' between the two runs' : '')
    + '; seed-to-seed noise ' + (t.noise === null ? 'printed by no run, so no gap is called real' : t.noise));
  return L;
}

/** The whole board, read from disk. */
export async function boardOf({ dir = VERDICTS_DIR, publishedFile = PUBLISHED_FILE, logFile = LOG_FILE, states = stateDirs(BOARD_ROOT), now = Date.now(), boardsFile = path.join(BOARD_ROOT, 'docs', 'BOARDS.json'), root = BOARD_ROOT, orchestrator = undefined } = {}) {
  const published = readJsonSafe(publishedFile);
  const sets = PUBLIC_SETS.map((s) => boardSet(s, { dir, published }));
  const direct = PROVENANCE.includes('direct');
  return {
    sets, totals: boardTotals(sets),
    direct: { recordedByAnyPath: direct, provenance: [...PROVENANCE], note: direct ? null : 'act/prompt.mjs PROVENANCE is ' + PROVENANCE.join(', ') + ': no answer path records direct, so its share is 0 and its latency is not measured' },
    substrate: substrateOf({ dir, logFile }),
    instances: instancesOf({ states, dir, now }),
    multiplying: multiplyOf({ dir }),
    authored: authoredOf({ dir, boardsFile, states, now }),
    knowledge: knowledgeOf({ dir }),
    bytesPerPoint: bytesPerPointOf({ dir, states }),
    improvement: await improvementOf({ dir, states }),
    gaps: gapsOf({ root, dir, now }),
    magnitude: magnitudeOf({ root, dir, orchestrator: orchestrator === undefined ? await orchestratorOf(root) : orchestrator }),
    undone: undoneOf({ root, dir, now }),
    climb: climbOf({ dir, boardsFile }),
    plateau: plateauOf({ dir }),
    clock: clockOf({ dir }),
    directRecall: directRecallOf({ dir }),
    hisRate: HIS_RATE,
    publishedFile: boardRel(publishedFile),
  };
}

function fmtArm(a) {
  if (!a || a.absent) return 'absent (' + (a ? a.reason : 'absent') + ')';
  return a.correct + '/' + a.n + ' = ' + pctOf(a.accuracy) + '% [' + pctOf(a.interval.lo) + ', ' + pctOf(a.interval.hi) + ']';
}
function fmtCmp(c) {
  if (!c) return null;
  if (c.side === null) return c.system + ' ' + c.score + ': no organism accuracy to hold to it';
  return c.system + ' ' + c.score + (c.metric ? ' (' + c.metric + ')' : '') + ': ' + c.side + (c.side === 'equal' ? '' : ' by ' + Math.abs(c.gapPoints).toFixed(2) + ' points')
    + ', ' + (c.decided ? 'decided ' + c.decided + ' (the interval ' + c.lo.toFixed(2) + ' to ' + c.hi.toFixed(2) + ' excludes it)' : 'undecided (the interval ' + c.lo.toFixed(2) + ' to ' + c.hi.toFixed(2) + ' contains it)');
}
function fmtLatency(c) {
  if (c.latency === null) return 'latency not measured';
  const d = c.unit === 's' ? 3 : 0;
  return 'mean ' + c.latency.toFixed(d) + ' ' + c.unit + (c.latencyCorrect !== null ? ' (' + c.latencyCorrect.toFixed(d) + ' ' + c.unit + ' when correct)' : '');
}
function fmtClass(key, c, directNote) {
  const head = key + ' ' + c.records + ' of ' + c.of + ' (' + pctOf(c.share) + '%)';
  if (!c.records) return head + (key === 'direct' && directNote ? ': ' + directNote : '');
  return head + ', ' + c.correct + ' correct, ' + fmtLatency(c) + (c.inferred ? ', ' + c.inferred + ' inferred from a null model' : '');
}

const yesNo = (x) => (x === true ? 'yes' : x === false ? 'no' : 'n/a');
const status = (x) => (x.partial ? 'PARTIAL: ' + x.partialBecause.join(', ') : 'whole, isTheBar true');
const frac = (a, b) => na(a) + '/' + na(b);

/** The MULTIPLYING block. */
export function multiplyingLines(m) {
  if (!m.source) return ['MULTIPLYING: not measured (' + m.reason + ')', ...(m.tieBreak && m.tieBreak.measured ? tieBreakLines(m.tieBreak) : [])];
  const L = [];
  const p = m.population || {}, s = m.single || {};
  const alive = (a) => na(a.alive) + (a.aliveAtS !== null && a.aliveAtS !== undefined ? ' at ' + a.aliveAtS + ' s' : '') + (a.ids ? ' (' + a.ids.join(', ') + ')' : '') + ', at most ' + na(a.maxAlive) + ' at once';
  L.push('MULTIPLYING (' + m.source + ', ' + status(m) + ', ' + m.at + ', ' + na(m.wallS) + ' wall s per arm, model calls ' + na(m.modelCalls) + '):');
  L.push('  instances alive at the end: population ' + alive(p) + '; single ' + alive(s));
  L.push('  duplications: population ' + na(p.duplications) + (m.spawnPlan ? ' (' + m.spawnPlan + ')' : '') + ', single ' + na(s.duplications) + ', in one run of ' + na(m.wallS) + ' wall s; no instance has run a day, so none per day is measured');
  L.push('  best of population against single instance: ' + frac(m.bar.populationFresh, m.bar.freshT) + ' against ' + frac(m.bar.singleFresh, m.bar.freshT) + ' on ' + na(m.fresh)
    + ', at or above ' + yesNo(m.bar.atOrAbove) + '; fresh-more mean ' + na(p.freshMoreMean) + ' against ' + na(s.freshMoreMean) + '; evaluations ' + na(p.evals) + ' against ' + na(s.evals)
    + '; elites imported ' + na(p.elitesImported) + ', exported ' + na(p.elitesExported));
  L.push('  kill: ' + (m.kill ? na(m.kill.id) + ' at ' + na(m.kill.atS) + ' s, back from its checkpoint t=' + na(m.kill.checkpointT) + ': ' + yesNo(m.kill.cameBack) : 'not recorded') + '; bar met ' + yesNo(m.bar.met) + (m.partial ? ' in a PARTIAL run, so it is not claimed' : ''));
  for (const a of m.alsoOnDisk) L.push('  also on disk: ' + a.file + ' (' + (a.isTheBar ? 'isTheBar true' : 'partial, isTheBar false') + ', ' + a.at + ', ' + na(a.wallS) + ' wall s): population ' + frac(a.populationFresh, a.freshT) + ' against single ' + frac(a.singleFresh, a.freshT) + ', bar met ' + yesNo(a.met));
  if (m.tieBreak) L.push(...tieBreakLines(m.tieBreak));
  return L;
}

/** The AUTHORED block: the share, patches proposed and kept per source per day, and the days since the last board. */
export function authoredLines(au) {
  const L = [];
  L.push('AUTHORED' + (au.source ? ' (' + au.source + ', ' + (au.partial ? 'PARTIAL' : 'whole, isTheBar true') + ', ' + au.at + '):' : ': not measured (' + au.reason + ')'));
  if (au.source) {
    const bs = Array.isArray(au.boards) ? au.boards : null;
    const den = !bs ? '; the boards of the denominator: not measured (' + au.source + ' carries no boards list)'
      : '; the denominator counts the files of boards ' + (bs.filter((b) => b.launched !== false).map((b) => na(b.board) + ' (' + na(b.files) + ')').join(', ') || 'none')
        + (bs.some((b) => b.launched === false) ? ', not launched ' + bs.filter((b) => b.launched === false).map((b) => na(b.board)).join(', ') : '')
        + (Array.isArray(au.missingBoards) ? ', not in it ' + (au.missingBoards.length ? au.missingBoards.map((b) => na(b.board) + (b.source ? ' (' + b.source + ')' : '')).join(', ') : 'none') : '');
    L.push('  AUTHORED SHARE: ' + au.numerator + ' of ' + au.denominator + ' = ' + pctOf(au.share) + '% (kept patches with an organism author ' + na(au.organism) + ', kept patches of any author ' + na(au.kept) + ', files landed by boards ' + na(au.boardFiles) + ')' + den);
  }
  const psd = au.perSourcePerDay || { rows: [], reason: 'not read' };
  if (!psd.rows.length) L.push('  patches proposed and kept per source per day: not measured (' + psd.reason + ')');
  else {
    const days = [...new Set(psd.rows.map((r) => r.day))];
    L.push('  patches proposed and kept per source per day (' + psd.field + ', ' + days.length + ' day(s), the last 7 printed):');
    for (const d of days.slice(-7)) L.push('    ' + d + ': ' + psd.rows.filter((r) => r.day === d).map((r) => r.source + ' proposed ' + na(r.proposed) + ', kept ' + na(r.kept)).join('; '));
  }
  const lb = au.lastBoard;
  if (!lb || !lb.newest) L.push('  days since the last board: not measured (' + (lb ? lb.reason : 'not read') + ')');
  else {
    const one = (x, d) => 'board ' + na(x.board) + ' ' + x.kind + ' ' + x.at + ' (' + x.source + '), ' + d + ' days';
    L.push('  days since the last board: ' + lb.days + ', read at ' + lb.at + ': board ' + na(lb.newest.board) + ' ' + lb.newest.kind + ' ' + lb.newest.at + ' (' + lb.newest.source + ')');
    if (lb.counted) L.push('    the share counts boards up to ' + one(lb.counted, lb.countedDays) + (lb.listed ? '; ' + lb.listed.source + ' lists up to board ' + na(lb.listed.board) : ''));
    if (lb.unlisted.length) L.push('    boards ' + lb.unlisted.join(', ') + ' have a launch marker and no ' + (lb.listed ? lb.listed.source : 'docs/BOARDS.json') + ' entry, so the share\'s denominator does not count their files');
  }
  return L;
}

/** The KNOWLEDGE block: articles held per source, breadth, recall against the null arm. */
export function knowledgeLines(k) {
  const L = [];
  L.push('KNOWLEDGE: ' + k.measured + ' of ' + k.of + ' sources measured' + (k.heldTotal !== null ? ', ' + k.heldTotal + ' articles held (' + k.heldFrom.join(', ') + ')' : ', no articles held measured'));
  const one = (x) => na(x.held) + ' articles held of ' + na(x.articlesInDump) + ' in the dump, breadth ' + (x.breadth === null ? 'n/a' : bR6(x.breadth))
    + '; recall@1 ' + na(x.recall1) + ' against null ' + na(x.null1) + ', recall@5 ' + na(x.recall5) + ' against null ' + na(x.null5) + ', n ' + na(x.n);
  for (const s of k.sources) {
    if (!s.primary) { L.push('  ' + s.name + ': not measured (' + s.reason + ')'); continue; }
    const p = s.primary;
    L.push('  ' + s.name + ' (' + p.file + ', ' + status(p) + ', ' + p.at + '): ' + one(p) + (p.dump ? ' (' + p.dump + (p.licence ? ', ' + p.licence : '') + ')' : ''));
    for (const a of s.alsoOnDisk) L.push('    also on disk: ' + a.file + ' (' + status(a) + ', ' + a.at + '): ' + one(a));
  }
  return L;
}

/** The board as printed lines. */
export function boardLines(b) {
  const L = [];
  L.push('LADDER BOARD: the three public sets from the verdicts on disk (no model called, no socket opened)');
  for (const s of b.sets) {
    L.push('');
    if (s.status === 'not measured') {
      L.push(s.name + '  NOT MEASURED: ' + s.reason);
      L.push('  orchestrator (Fable 5.1): ' + (s.orchestrator ? s.orchestrator.system + ' ' + s.orchestrator.score + ' (' + s.orchestrator.source + ')' : 'no published row'));
      continue;
    }
    const p = s.primary;
    L.push(s.name + '  ' + (s.status === 'PARTIAL' ? 'PARTIAL, only partial verdicts on disk' : 'whole') + ': ' + p.file + ' at ' + p.at
      + (p.n !== null ? ', n ' + p.n + ' of ' + p.of : '') + ', model ' + (p.model === null ? 'none' : p.model)
      + (s.status === 'PARTIAL' ? '; partial because ' + s.partialBecause.join(', ') : ''));
    L.push('  accuracy   organism ' + fmtArm(s.arms.organism) + (s.arms.organism.absent ? '' : ' (interval from ' + s.arms.organism.intervalFrom + ')'));
    L.push('             alone ' + fmtArm(s.arms.alone) + ';  null ' + fmtArm(s.arms.null));
    L.push('  bar 1 model-alone: ' + s.bars.alone.verdict + (s.bars.alone.reason ? ' (' + s.bars.alone.reason + ')' : '') + ';  null: ' + s.bars.null.verdict + (s.bars.null.reason ? ' (' + s.bars.null.reason + ')' : ''));
    L.push('  bar 2 the 405B row: ' + (fmtCmp(s.bars.row405) || 'no 405B row kept in this set\'s verdicts'));
    L.push('  bar 3 the frontier row: ' + (fmtCmp(s.bars.frontier) || 'no frontier row held to one answer kept in this set\'s verdicts'));
    L.push('  orchestrator (Fable 5.1): ' + (s.bars.orchestrator ? fmtCmp(s.bars.orchestrator) + ' [' + b.publishedFile + ', ' + s.orchestrator.source + ']' : 'no published row'));
    if (!s.bars.claimable) L.push('  a sample, not the whole set: no bar above can be claimed from it');
    L.push('  published rows kept (' + s.published.length + '): ' + (s.published.length ? s.published.map((r) => r.system + ' ' + r.score + ' ' + (r.side || 'n/a')).join('; ') : 'none'));
    L.push('  answers    ' + ['model', 'native', 'direct'].map((k) => fmtClass(k, s.classes[k], b.direct.note ? 'no answer path records it' : null)).join(' | '));
    for (const k of ['unrecorded', 'other']) if (s.classes[k].records) L.push('             ' + k + ' ' + s.classes[k].records + ' of ' + s.classes[k].of + ': the verdict records no class for these answers');
    for (const a of s.alsoOnDisk) L.push('  also on disk: ' + a.file + ' (' + a.status + ', ' + a.at + (a.organism ? ', organism ' + a.organism : '') + (a.provenanceRecorded ? '' : ', provenance not recorded') + ')');
  }
  const t = b.totals;
  L.push('');
  L.push('ACROSS THE THREE: ' + t.sets + ' measured (' + t.whole + ' whole, ' + t.partial + ' partial); organism ' + t.correct + ' of ' + t.n + ' on the primaries; of ' + t.records + ' recorded answers '
    + ['model', 'native', 'direct'].map((k) => {
      const c = t.classes[k] || { records: 0, share: 0, latency: null, unit: '' };
      return k + ' ' + c.records + ' (' + pctOf(c.share) + '%' + (c.latency !== null ? ', mean ' + (c.unit === 's' ? c.latency.toFixed(3) : c.latency.toFixed(0)) + ' ' + c.unit : '') + ')';
    }).join(', ') + '; a tally, not a score');
  if (b.direct.note) L.push('DIRECT: ' + b.direct.note);
  const sb = b.substrate;
  L.push('SUBSTRATE: ' + (sb.measured
    ? sb.measured.nsPerCellRun + ' ns per cell run' + (sb.measured.nsPerHop !== null ? ', ' + sb.measured.nsPerHop + ' ns per packet hop' : '') + ' (' + sb.measured.file + (sb.measured.where ? ', ' + sb.measured.where : '') + ', ' + sb.measured.at + ')'
    : 'no verdict file holds the browser organism\'s ns'));
  if (sb.browser) L.push('  browser organism: ' + sb.browser.nsPerCellRun + ' ns per cell run, ' + sb.browser.nsPerHop + ' ns per packet hop (' + sb.browser.file + ' line ' + sb.browser.line + ', ' + sb.browser.when + ': ' + sb.browser.usPerCellRun + ' us and ' + sb.browser.usPerHop + ' us; ' + sb.browser.kind + ')');
  if (sb.node) L.push('  Node organism: ' + sb.node.nsPerCellRunBest + ' ns per cell run at best (' + sb.node.file + ' accounting.usPerRun: best ' + sb.node.usPerRun.best + ' us, single ' + sb.node.usPerRun.single + ' us, baseline ' + sb.node.usPerRun.baseline + ' us; ' + sb.node.organism + ', ' + sb.node.cells + ' cells, ' + sb.node.at + '); it keeps no per-hop field');
  const ins = b.instances;
  L.push('INSTANCES ALIVE: ' + (ins.alive === null ? 'not measured (' + ins.reason + ')'
    : ins.alive + (ins.kind === 'state' ? ' of ' + ins.known + ' known, lastSeen within ' + ins.windowMs + ' ms (' + ins.source + ')'
      : ' (' + ins.source + (ins.partial ? ', PARTIAL: isTheBar false' : '') + ', mode ' + ins.mode + ', ' + ins.at + '; no instances.json in a state directory here)')));
  if (b.multiplying) L.push(...multiplyingLines(b.multiplying));
  L.push(...authoredLines(b.authored));
  if (b.knowledge) L.push(...knowledgeLines(b.knowledge));
  const bp = b.bytesPerPoint;
  L.push('BYTES PER SCORE POINT: ' + (bp.bar ? bp.bar.bytesPerScorePoint + ' at the bar (' + bp.bar.source + ', score ' + bp.bar.score + ' of ' + bp.bar.of + ', ' + bp.bar.bytes + ' bytes, ' + bp.bar.at + ')' : 'no compress bar')
    + (bp.last ? '; ' + bp.last.bytesPerScorePoint + ' at the last checkpoint header on disk (' + bp.last.where + ', score ' + bp.last.score + (bp.last.of ? ' of ' + bp.last.of : '') + ', ' + bp.last.at + (bp.last.isTheBar === false ? ', not the bar' : '') + ')' : '; no checkpoint header records one'));
  const im = b.improvement;
  L.push('IMPROVEMENT PER WALL SECOND: ' + (im.source
    ? 'carried ' + im.carried + ' and exact ' + im.exact + ' of the suite per wall second = ' + im.percentPerSecond + ' percent per second (' + im.source + ', checkpoints ' + im.fromK + ' to ' + im.toK + ' over ' + im.seconds + ' s' + (im.at ? ', ' + im.at : '') + ')'
      + '; his words: ' + b.hisRate.words + ', so the measured rate is ' + (isNum(im.percentPerSecond) ? bR6(im.percentPerSecond / b.hisRate.percentPerSecond) : 'n/a') + ' of his'
    : 'not measured (' + im.reason + ')'));
  if (b.gaps) L.push(...gapsLines(b.gaps));
  if (b.magnitude) L.push(...magnitudeLines(b.magnitude));
  if (b.undone) L.push(...undoneLines(b.undone));
  if (b.climb) L.push(...climbLines(b.climb));
  if (b.plateau) L.push(...plateauLines(b.plateau));
  if (b.clock) L.push(...clockLines(b.clock));
  if (b.directRecall) L.push(...directRecallLines(b.directRecall));
  return L;
}

/** One plain paragraph saying what the board shows, built from its own numbers. */
export function boardStatement(b) {
  const parts = b.sets.map((s) => {
    if (s.status === 'not measured') return s.name + ' is not measured';
    const o = s.arms.organism;
    const acc = o && !o.absent ? o.correct + ' of ' + o.n + ' (' + pctOf(o.accuracy) + ' percent)' : 'no organism arm';
    const f = s.bars.frontier;
    return s.name + ' ' + (s.status === 'PARTIAL' ? 'is a PARTIAL sample, ' : 'is whole, ') + acc + ' from ' + s.primary.file
      + (f ? ', ' + (f.decided ? 'decided ' + f.decided : 'undecided against') + ' the frontier row ' + f.system + ' at ' + f.score : ', with no frontier row kept')
      + (s.bars.orchestrator ? ', and ' + s.bars.orchestrator.side + ' the orchestrator row ' + s.bars.orchestrator.system + ' at ' + s.bars.orchestrator.score : ', and no published orchestrator row');
  });
  const t = b.totals, im = b.improvement;
  const mc = t.classes.model || { records: 0 }, nc = t.classes.native || { records: 0 }, dc = t.classes.direct || { records: 0 };
  return 'The ladder board reads the verdicts on disk and calls no model. ' + parts.join('; ') + '. '
    + 'Of ' + t.records + ' recorded organism answers, ' + mc.records + ' came from the model, ' + nc.records + ' were native and ' + dc.records + ' were direct'
    + (b.direct.note ? ' (no answer path records direct yet)' : '') + '. '
    + (b.substrate.measured ? 'The substrate row is ' + b.substrate.measured.nsPerCellRun + ' ns per cell run. '
      : b.substrate.browser ? 'The browser organism figures, ' + b.substrate.browser.nsPerCellRun + ' ns per cell run and ' + b.substrate.browser.nsPerHop + ' ns per packet hop, come from a log line, not a verdict file. ' : '')
    + (b.instances.alive !== null ? 'Instances alive: ' + b.instances.alive + (b.instances.partial ? ' from a partial cloud run' : '') + '. ' : '')
    + (b.multiplying ? (b.multiplying.source
      ? 'Multiplying' + (b.multiplying.partial ? ' (partial)' : '') + ': ' + na(b.multiplying.population && b.multiplying.population.alive) + ' instances alive at the end of the population arm after ' + na(b.multiplying.population && b.multiplying.population.duplications) + ' duplications, its best ' + frac(b.multiplying.bar.populationFresh, b.multiplying.bar.freshT) + ' against the single instance at ' + frac(b.multiplying.bar.singleFresh, b.multiplying.bar.freshT) + '. '
      : 'Multiplying is not measured. ') : '')
    + (b.authored.source ? 'Authored share ' + pctOf(b.authored.share) + ' percent. ' : 'The authored share is not measured. ')
    + (b.authored.lastBoard && b.authored.lastBoard.newest ? 'Days since the last board: ' + b.authored.lastBoard.days + ' (board ' + na(b.authored.lastBoard.newest.board) + ' ' + b.authored.lastBoard.newest.kind + '). ' : '')
    + (b.knowledge ? 'Knowledge: ' + b.knowledge.sources.map((s) => s.primary ? s.name + ' holds ' + na(s.primary.held) + ' articles' + (s.primary.partial ? ' (partial)' : '') + ', recall@1 ' + na(s.primary.recall1) + ' against null ' + na(s.primary.null1) : s.name + ' is not measured').join('; ') + '. ' : '')
    + (b.bytesPerPoint.bar ? 'Bytes per score point ' + b.bytesPerPoint.bar.bytesPerScorePoint + ' at the compress bar. ' : '')
    + (im.source ? 'Improvement per wall second ' + im.percentPerSecond + ' percent of the suite against his ' + b.hisRate.percentPerSecond + '.' : 'Improvement per wall second is not measured.')
    + loopSentence(b) + board13Sentence(b);
}

/** CLIMB, PLATEAU, CLOCK, DIRECT and the Board 12 tie-break in one sentence each, from their own fields (Board 13). */
function board13Sentence(b) {
  const out = [];
  if (b.climb) out.push('Climb: ' + b.climb.sets.map((s) => {
    if (!s.current) return s.name + ' is not measured';
    const side = (r) => 'board ' + na(r.board) + (r.orEarlier ? ' or earlier' : '') + (r.status === 'whole' ? ' ' : ' partial ') + pctOf(r.arm.accuracy) + ' percent';
    return s.name + ' ' + side(s.current) + (s.delta ? ' against ' + side(s.previous) + ', ' + (s.delta.decided ? s.delta.decided + ' with separate intervals' : 'undecided') : ', no earlier board')
      + (s.thisBoard && !s.thisBoard.measured ? ', board ' + s.thisBoard.board + ' not measured' : '');
  }).join('; ') + '.');
  const where = (f) => (f ? 'in ' + f.file + (f.partial ? ' (partial)' : '') : 'not measured');
  if (b.plateau) out.push('The plateau is ' + (b.plateau.source ? where(b.plateau) : 'not measured') + '.');
  if (b.clock) out.push('Solved against clock is ' + where(b.clock.curve) + ' and the whole-400 count is ' + where(b.clock.whole) + '.');
  if (b.directRecall) {
    const sw = b.directRecall.swept;
    out.push('Leak-free direct recall is ' + where(b.directRecall.clean) + (sw && sw.table ? '; the swept table recalled ' + na(sw.table.recall) + ' of ' + na(sw.table.n) + ' and its control ' + (sw.control ? na(sw.control.recall) : 'n/a') : '') + '.');
  }
  const t = b.multiplying && b.multiplying.tieBreak;
  if (t && t.measured) out.push('Board 12 multiplying is ' + t.label + ': ' + t.runs.filter((r) => r.who !== 'partial').map((r) => r.who + ' population ' + na(r.population) + ' against single ' + na(r.single)).join(', ') + '.');
  return out.length ? ' ' + out.join(' ') : '';
}

/** The GAPS, MAGNITUDE and UNDONE blocks in one sentence each, from their own fields (Board 15). */
function loopSentence(b) {
  const g = b.gaps, m = b.magnitude, u = b.undone;
  const out = [];
  if (g) out.push(g.ledger ? 'Gaps open ' + g.ledger.open + ', ' + g.ledger.withTrial + ' with a trial' + (g.decisions ? ', ' + g.decisions.attempted + ' attempted and ' + g.decisions.kept + ' kept in the last ' + g.windowDays + ' days' : '') + (g.closed ? ', ' + g.closed.length + ' closed' : '') + '.' : 'The gap ledger is not measured.');
  if (m && m.organism) out.push(m.organism.measured ? 'The organism kept ' + na(m.organism.keptPerHour) + ' patches per wall hour in its soak' + (m.orchestrator.measured ? ' against the orchestrator\'s ' + na(m.orchestrator.boardsPerHour) + ' boards per wall hour' : '') + '.' : 'The organism rate is not measured.');
  if (u) out.push(u.items ? 'Board items undone ' + u.items.total + (u.attempts ? ', ' + u.attempts.gaps + ' attempted by the organism in the last ' + u.windowDays + ' days, ' + u.attempts.kept + ' kept' : '') + '.' : 'Undone board items are not measured.');
  return out.length ? ' ' + out.join(' ') : '';
}

/** ladder.json: the daily series (days, deltas, line, which health and the site read) and the board beside it. */
export function seriesDocOf({ series, board, command, nFor95 = null, at = new Date().toISOString() }) {
  return {
    at, node: process.version, command, isTheBar: true,
    split: {
      development: 'none: the board trains and tunes nothing; it reads the verdicts on disk, each of which carries its own split',
      heldOut: 'the daily series: each dated run draws its items seeded ladder/<date>, so a day is scored on items no earlier day drew',
      contaminated: false,
    },
    statement: board && !board.error ? boardStatement(board) : 'The daily series; the board could not be read: ' + (board ? board.error : 'not built') + '.',
    columns: COLUMNS,
    how: 'every dated file under bench/verdicts/ladder/ is one run; the series takes the LAST run of each day. composite is the mean of the four columns, each in [0, 1]. A delta is a percent OF THE PREVIOUS DAY, not a difference in points. board is read from the verdicts on disk by node bench/ladder.mjs.',
    tierRule: UNLOCK_RULE, target: { ...TARGET, rule: 'met at or above ' + TARGET.low + ' percent' },
    ...series,
    nFor95: { how: 'answer and code each ask their own bench for it, on the organism rate against the null rate of that day', answer: nFor95 ? nFor95.answer ?? null : null, code: nFor95 ? nFor95.code ?? null : null },
    board,
  };
}

/**
 * node bench/ladder.mjs: print the board and rewrite ladder.json with it. The file is written
 * before the function returns, and nothing here exits the process.
 */
export async function runBoard({ dir = VERDICTS_DIR, seriesFile = SERIES_FILE, ladderDir = LADDER_DIR, publishedFile = PUBLISHED_FILE, logFile = LOG_FILE, states = stateDirs(BOARD_ROOT), boardsFile = path.join(BOARD_ROOT, 'docs', 'BOARDS.json'), write = true, log = console.log, command = 'node bench/ladder.mjs' } = {}) {
  const board = await boardOf({ dir, publishedFile, logFile, states, boardsFile });
  const lines = boardLines(board);
  for (const l of lines) log(l);
  const series = seriesOf(ladderDir);
  const lastDay = series.days.length ? series.days[series.days.length - 1] : null;
  const nf = lastDay && lastDay.columns ? { answer: lastDay.columns.answer ? lastDay.columns.answer.nFor95 ?? null : null, code: lastDay.columns.code ? lastDay.columns.code.nFor95 ?? null : null } : null;
  const doc = seriesDocOf({ series, board, command, nFor95: nf });
  if (write) {
    const text = JSON.stringify(doc, null, 2);
    mkdirSync(path.dirname(seriesFile), { recursive: true });
    writeFileSync(seriesFile, text);
    const w = 'wrote ' + boardRel(seriesFile) + ' (' + Buffer.byteLength(text) + ' bytes): the board beside the daily series of ' + series.days.length + ' day(s)';
    log(''); log(w); lines.push('', w);
  }
  return { board, doc, lines };
}

// ---------------------------------------------------------------- the item verdict (rows)
// node bench/ladder.mjs --rows writes Board 10's item verdict for "rows" from three measurements:
// bench/verdicts/ladder.json (the board), bench/verdicts/gate.json (a gate run with its three
// rows) and a run of test/ladder.test.mjs it takes itself, under the gate's own budget caps. The
// bar is all three: the board written, the gate GREEN with the three rows printed, the ladder
// tests passing. Met, it writes bench/verdicts/rows.json once; otherwise rows-partial.json with
// isTheBar false and every reason. A gate run that started before a file this item owns last
// changed did not grade that file, so it is named STALE and cannot meet the bar: the first rows
// verdict was typed by hand from a gate that ended two minutes before notes/ladder.md was
// written, and that note then broke test/findings.test.mjs, which the gate had never seen.

// Board 12 widened what the verdict grades and kept how: the board must carry the three new
// blocks (MULTIPLYING, AUTHORED, KNOWLEDGE), the gate must print five rows (LOAD-BEARING and
// BOUNDARY after the three), and the tests it runs itself are the ladder's and the gate's.

// Board 15 widened it again: the board carries GAPS, MAGNITUDE and UNDONE, the gate prints seven
// rows (AUTONOMY and HANDOFF last), and both new rows must have GRADED the installation: a row that
// printed N/A graded nothing and cannot meet the bar, and a row printed RED as a referee (a live
// autopilot held the lock, so it did not turn the gate red) misses the bar all the same. Met, the
// verdict is bench/verdicts/rows.json (isTheBar true, barMet true); otherwise rows-partial.json
// (isTheBar false, barMet false). A rows file an earlier board wrote is copied to
// rows-board<N>.json (rows-partial-board<N>.json) before the first Board 15 write replaces it.

// Board 13 widened it once more: the board carries CLIMB, PLATEAU, CLOCK and DIRECT and the
// MULTIPLYING block carries the tie-break truth, the gate prints eight rows (CONTAMINATION last:
// every bar file carries a split object, and a contaminated one says so), and the tests it runs
// include test/gate-contamination.test.mjs. A RED CONTAMINATION row misses the bar like any other.
// Before the first Board 13 write, rows.json and rows-partial.json of an earlier board are both
// copied aside (rows-board<N>.json, rows-partial-board<N>.json), whichever this run writes.
export const ROWS_BOARD = 13;

/** The files the rows item owns. A gate that started before one of them changed did not see it. */
export const ROWS_OWNED = Object.freeze(['bench/ladder.mjs', 'bench/gate.mjs', 'test/ladder.test.mjs', 'test/gate.test.mjs', 'test/gate-rows.test.mjs', 'test/gate-autonomy.test.mjs', 'test/gate-contamination.test.mjs', 'notes/ladder.md']);
/** The test files node bench/ladder.mjs --rows runs itself, under the gate's budget caps. */
export const ROWS_TESTS = Object.freeze(['test/ladder.test.mjs', 'test/gate.test.mjs', 'test/gate-rows.test.mjs', 'test/gate-autonomy.test.mjs', 'test/gate-contamination.test.mjs']);
const ROW_KEYS = Object.freeze([['budget', 'BUDGET'], ['compress', 'COMPRESS'], ['hisData', 'HIS DATA'], ['loadBearing', 'LOAD-BEARING'], ['boundary', 'BOUNDARY'], ['autonomy', 'AUTONOMY'], ['handoff', 'HANDOFF'], ['contamination', 'CONTAMINATION']]);
/** The rows that read the installation: they must have graded it, not printed N/A. */
const INSTALL_ROWS = Object.freeze(['autonomy', 'handoff']);
// a block is on the board when its object is there with the fields this bench writes for it,
// "not measured" included: a block that says not measured was printed
const BOARD_BLOCKS = Object.freeze([
  ['multiplying', 'MULTIPLYING', (x) => !!x && typeof x === 'object' && 'source' in x && !!x.tieBreak && typeof x.tieBreak === 'object' && 'label' in x.tieBreak],
  ['authored', 'AUTHORED', (x) => !!x && typeof x === 'object' && 'lastBoard' in x && 'perSourcePerDay' in x],
  ['knowledge', 'KNOWLEDGE', (x) => !!x && typeof x === 'object' && Array.isArray(x.sources)],
  ['gaps', 'GAPS', (x) => !!x && typeof x === 'object' && 'ledger' in x && 'decisions' in x && 'closed' in x],
  ['magnitude', 'MAGNITUDE', (x) => !!x && typeof x === 'object' && !!x.organism && !!x.orchestrator && !!x.simulated],
  ['undone', 'UNDONE', (x) => !!x && typeof x === 'object' && 'items' in x && 'attempts' in x && 'partial' in x && 'proposed' in x],
  ['climb', 'CLIMB', (x) => !!x && typeof x === 'object' && Array.isArray(x.sets) && x.sets.length === CLIMB_SETS.length],
  ['plateau', 'PLATEAU', (x) => !!x && typeof x === 'object' && 'source' in x && 'baseline' in x],
  ['clock', 'CLOCK', (x) => !!x && typeof x === 'object' && 'curve' in x && 'whole' in x && 'baseline' in x],
  ['directRecall', 'DIRECT', (x) => !!x && typeof x === 'object' && 'clean' in x && 'swept' in x],
]);
// the printed block of each, rebuilt from the board in ladder.json by the functions that printed it
const PRINTERS = Object.freeze({
  gaps: (b) => gapsLines(b.gaps), magnitude: (b) => magnitudeLines(b.magnitude), undone: (b) => undoneLines(b.undone), authoredShare: (b) => authoredLines(b.authored).filter((l) => l.startsWith('  AUTHORED SHARE')),
  climb: (b) => climbLines(b.climb), plateau: (b) => plateauLines(b.plateau), clock: (b) => clockLines(b.clock), direct: (b) => directRecallLines(b.directRecall), tieBreak: (b) => tieBreakLines(b.multiplying.tieBreak),
});
const printedOf = (board) => Object.fromEntries(Object.entries(PRINTERS).map(([k, p]) => { try { return [k, p(board)]; } catch (e) { return [k, ['not printable from ladder.json: ' + String((e && e.message) || e).split('\n')[0]]]; } }));
const isoOf = (ms) => new Date(ms).toISOString();

/**
 * The rows verdict from what is on disk. ladder and gate are parsed JSON (or { error }), tests is
 * a runTestFile row or a list of them, owned is [{ file, mtimeMs }]. Pure: it reads nothing and
 * writes nothing.
 */
export function rowsVerdictOf({ ladder, gate, tests, owned = [], at = new Date().toISOString(), command = 'node bench/ladder.mjs --rows' }) {
  const reasons = [];
  const lad = ladder && !ladder.error ? ladder : null;
  const g = gate && !gate.error ? gate : null;

  const boardOk = !!(lad && lad.isTheBar === true && lad.board && !lad.board.error);
  const blocks = boardOk ? BOARD_BLOCKS.filter(([k, , has]) => has(lad.board[k])).map(([, label]) => label) : [];
  const missingBlocks = BOARD_BLOCKS.map(([, label]) => label).filter((l) => !blocks.includes(l));
  const ladderAtMs = lad ? Date.parse(lad.at) : NaN;
  const ladderStale = lad ? owned.filter((f) => f.file === 'bench/ladder.mjs' && !(f.mtimeMs <= ladderAtMs)) : [];
  if (!lad) reasons.push('bench/verdicts/ladder.json could not be read' + (ladder && ladder.error ? ' (' + ladder.error + ')' : ''));
  else if (!boardOk) reasons.push('bench/verdicts/ladder.json carries no board');
  else if (missingBlocks.length) reasons.push('the board in ladder.json carries no ' + missingBlocks.join(', ') + ' block');
  if (ladderStale.length) reasons.push('the board in ladder.json was written at ' + lad.at + ', before bench/ladder.mjs changed at ' + isoOf(ladderStale[0].mtimeMs));

  const startMs = g && g.startedAt ? Date.parse(g.startedAt) : NaN;
  const gateStale = g && Number.isFinite(startMs) ? owned.filter((f) => f.mtimeMs > startMs) : [];
  if (!g) reasons.push('bench/verdicts/gate.json could not be read' + (gate && gate.error ? ' (' + gate.error + ')' : ''));
  else if (!Number.isFinite(startMs)) reasons.push('gate.json records no startedAt, so which of this item\'s files that run saw cannot be told');
  else if (gateStale.length) reasons.push('STALE: the gate run started at ' + g.startedAt + ', before ' + gateStale.map((f) => f.file + ' changed at ' + isoOf(f.mtimeMs)).join(', '));

  const rows = g && g.rows ? g.rows : {};
  const printed = ROW_KEYS.filter(([k]) => rows[k] && typeof rows[k].line === 'string').map(([, label]) => label);
  const redRows = ROW_KEYS.filter(([k]) => rows[k] && rows[k].ok === false).map(([, label]) => label);
  const failing = g ? (g.tests || []).filter((t) => t.exit !== 0).map((t) => ({
    file: t.file, exit: t.exit, pass: t.pass ?? null, fail: t.fail ?? null,
    budget: t.budget ? t.budget.outcome : null, killed: t.budget ? t.budget.killed ?? null : null, peakRssMb: t.budget ? t.budget.peakRssMb ?? null : null,
  })) : [];
  const emDash = g ? (g.emDash || []) : [];
  const badImports = g ? (g.badImports || []) : [];
  if (g && printed.length < ROW_KEYS.length) reasons.push('the gate printed ' + printed.length + ' of the ' + ROW_KEYS.length + ' rows');
  const ungraded = INSTALL_ROWS.filter((k) => rows[k] && rows[k].graded === false).map((k) => ROW_KEYS.find(([x]) => x === k)[1]);
  const con = rows.contamination && typeof rows.contamination === 'object' ? rows.contamination : null;
  const conCauses = con && con.ok === false && Array.isArray(con.causes) ? con.causes : [];
  if (conCauses.length) reasons.push('CONTAMINATION: ' + conCauses.join('; '));
  if (ungraded.length) reasons.push('the ' + ungraded.join(' and ') + ' row(s) printed N/A, so the run graded no installation');
  const refereeRed = ROW_KEYS.filter(([k]) => rows[k] && rows[k].ok === false && rows[k].rules === false).map(([, label]) => label);
  if (g && g.verdict === 'GREEN' && refereeRed.length) reasons.push('red rows printed as referees (a live autopilot held the lock): ' + refereeRed.join(', '));
  if (g && g.verdict !== 'GREEN') {
    const why = [];
    if (failing.length) why.push(failing.length + ' failing test file(s)');
    if (redRows.length) why.push('red rows ' + redRows.join(', '));
    if (emDash.length) why.push(emDash.length + ' em-dash file(s)');
    if (badImports.length) why.push(badImports.length + ' bad import(s)');
    reasons.push('the gate is ' + g.verdict + (why.length ? ': ' + why.join(', ') : ''));
  }

  const runs = (Array.isArray(tests) ? tests : tests ? [tests] : []).filter(Boolean);
  const passed = (t) => !!(t && t.exit === 0 && t.fail === 0 && t.pass > 0 && t.pass === t.total);
  const testsOk = runs.length > 0 && runs.every(passed);
  if (!runs.length) reasons.push('no test file was run');
  for (const t of runs) if (!passed(t)) reasons.push(t.file + ' did not pass: ' + (t.missing ? 'not in the tree' : 'exit ' + t.exit + ', pass ' + t.pass + ', fail ' + t.fail + ', tests ' + t.total));

  const met = reasons.length === 0;
  const file = met ? 'rows.json' : 'rows-partial.json';
  const kill = (f) => f.killed ? ', killed on ' + f.killed + ' at ' + f.peakRssMb + ' MB' : '';
  const testText = (t) => t.file + (t.missing ? ' is not in the tree' : (passed(t) ? ' passed ' : ' did not pass, ') + t.pass + ' of ' + t.total + ' (fail ' + t.fail + ', exit ' + t.exit + ') in ' + t.ms + ' ms, peak RSS ' + (t.budget ? t.budget.peakRssMb : null) + ' MB');
  const sentences = [
    'Board ' + ROWS_BOARD + ' item rows (the CLIMB, PLATEAU, CLOCK and DIRECT blocks and the tie-break truth in MULTIPLYING on the ladder, the CONTAMINATION row on the gate, every earlier block and row still graded), composed by ' + command + ' from the verdicts on disk and one run of each of ' + runs.length + ' test files.',
    lad ? 'The board: bench/verdicts/ladder.json was written at ' + lad.at + ' by ' + lad.command + ', isTheBar ' + lad.isTheBar + (boardOk ? ', with the board for ' + lad.board.sets.map((s) => s.name + ' (' + s.status + ')').join(', ') + ' and the blocks ' + (blocks.length ? blocks.join(', ') : 'none') + (missingBlocks.length ? ' (missing: ' + missingBlocks.join(', ') + ')' : '') + '.' : ', with no board.') : 'The board: bench/verdicts/ladder.json could not be read.',
    g ? 'The gate: ' + g.command + ' ran from ' + (g.startedAt || 'an unrecorded start') + ' to ' + g.at + ' and is ' + g.verdict + ': test files ' + g.testsPassed + ' of ' + g.testsTotal
      + (failing.length ? ' (failing: ' + failing.map((f) => f.file + kill(f)).join('; ') + ')' : '')
      + ', assertions ' + g.assertionsPassed + ' pass and ' + g.assertionsFailed + ' fail, em-dash files ' + emDash.length + ', bad imports ' + badImports.length
      + (badImports.length ? ' (' + badImports.join(', ') + ')' : '') + '; it printed ' + printed.length + ' of the ' + ROW_KEYS.length + ' rows'
      + (redRows.length ? ', red: ' + redRows.join(', ') : ', none red') + '. '
      + (Number.isFinite(startMs) ? (gateStale.length ? 'It is STALE for this item: ' + gateStale.map((f) => f.file).join(', ') + ' changed after it started.' : 'None of the ' + owned.length + ' files this item owns changed after it started, so it graded them as they are.') : 'It records no start, so what it saw cannot be told.')
      : 'The gate: bench/verdicts/gate.json could not be read.',
    runs.length ? 'The tests, each run by this command under the gate budget: ' + runs.map(testText).join('; ') + '.' : 'No test file was run.',
    met ? 'The bar asks for all three and all three hold: MET.' : 'The bar asks for all three, so it is MISSED: ' + reasons.join('; ') + '.',
  ];
  const printedBlocks = boardOk ? printedOf(lad.board) : null;
  const doc = {
    at, command, node: process.version, isTheBar: met, barMet: met,
    statement: sentences.join(' '),
    item: 'rows', board: ROWS_BOARD, principles: { ladder: 'P15', gate: 'P8' }, met, reasons,
    split: {
      development: 'test/ladder.test.mjs, test/gate-rows.test.mjs, test/gate-autonomy.test.mjs and test/gate-contamination.test.mjs plant verdicts, ledgers, decision files, brief and resume logs, a HANDOFF.md and schtasks output under temp directories, with the task query and the lock holder injected; no real task is queried and no model is called',
      heldOut: 'the real tree: every real bench/verdicts/*.json, the real state/self/gaps.jsonl, decision files, brief and resume logs, docs/HANDOFF.md, the real read-only schtasks /query of BrainAutopilot, and the gate run to completion on it',
      contaminated: false,
    },
    parts: {
      ladder: lad ? { file: 'bench/verdicts/ladder.json', at: lad.at, command: lad.command, isTheBar: lad.isTheBar, board: boardOk, sets: boardOk ? lad.board.sets.map((s) => ({ name: s.name, status: s.status })) : [], blocks, missingBlocks } : null,
      gate: g ? {
        file: 'bench/verdicts/gate.json', command: g.command, startedAt: g.startedAt || null, at: g.at, verdict: g.verdict,
        testsPassed: g.testsPassed, testsTotal: g.testsTotal, assertionsPassed: g.assertionsPassed, assertionsFailed: g.assertionsFailed,
        failing, emDashFiles: emDash.length, emDash, badImports, rowsExpected: ROW_KEYS.length, rowsPrintedCount: printed.length, rowsPrinted: printed, redRows,
        lines: Object.fromEntries(ROW_KEYS.map(([k]) => [k, rows[k] ? rows[k].line : null])),
        gateLine: typeof g.line === 'string' ? g.line : null, ungraded, refereeRed,
        contamination: con ? { ok: con.ok ?? null, counts: con.counts ?? null, noSplit: Array.isArray(con.noSplit) ? con.noSplit : null, splitNotObject: Array.isArray(con.splitNotObject) ? con.splitNotObject : null, unlabelled: Array.isArray(con.unlabelled) ? con.unlabelled : null, labelled: Array.isArray(con.labelled) ? con.labelled : null, causes: Array.isArray(con.causes) ? con.causes : null } : null,
      } : null,
      printed: printedBlocks,
      tests: runs.map((t) => ({ file: t.file, command: 'node --max-old-space-size=6000 --test ' + t.file, tests: t.total ?? null, pass: t.pass ?? null, fail: t.fail ?? null, exit: t.exit ?? null, ms: t.ms ?? null, peakRssMb: t.budget ? t.budget.peakRssMb : null, budget: t.budget ? t.budget.outcome : null, missing: !!t.missing })),
      testFiles: runs.length,
    },
    owned: owned.map((f) => ({ file: f.file, changedAt: isoOf(f.mtimeMs) })),
    stale: { gate: gateStale.map((f) => f.file), ladder: ladderStale.map((f) => f.file) },
  };
  const lines = [
    'ROWS ' + (met ? 'MET' : 'MISSED') + ': board ' + (boardOk ? 'written' : 'missing') + (lad ? ' at ' + lad.at : '') + (boardOk ? ', blocks ' + blocks.length + '/' + BOARD_BLOCKS.length : '')
      + ', gate ' + (g ? g.verdict + ' ' + g.testsPassed + '/' + g.testsTotal + ', rows printed ' + printed.length + '/' + ROW_KEYS.length + (redRows.length ? ', red ' + redRows.join(', ') : '') : 'unread')
      + ', tests ' + (runs.length ? runs.map((t) => t.file + ' ' + t.pass + '/' + t.total + ' exit ' + t.exit).join(', ') : 'not run'),
    ...reasons.map((r) => '  ' + r),
  ];
  return { file, met, reasons, doc, lines };
}

/**
 * node bench/ladder.mjs --rows: run the ladder tests under the gate's caps, compose the item
 * verdict, write it (rows.json only once), print it. Nothing here exits the process.
 */
export async function runRows({ root = BOARD_ROOT, verdictsDir = VERDICTS_DIR, runTests = (file) => runTestFile(file, { root }), log = console.log, write = true, at = null } = {}) {
  const readJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch (e) { return { error: e.message }; } };
  const ladder = readJson(path.join(verdictsDir, 'ladder.json'));
  const gate = readJson(path.join(verdictsDir, 'gate.json'));
  const tests = [];
  for (const rel of ROWS_TESTS) {
    if (!existsSync(path.join(root, rel))) { tests.push({ file: rel, missing: true, exit: null, pass: null, fail: null, total: null, ms: null }); continue; }
    log('rows: running ' + rel + ' under the gate budget caps');
    const { row } = await runTests(path.join(root, rel));
    tests.push(row);
  }
  const owned = ROWS_OWNED.filter((f) => existsSync(path.join(root, f))).map((f) => ({ file: f, mtimeMs: statSync(path.join(root, f)).mtimeMs }));
  const v = rowsVerdictOf({ ladder, gate, tests, owned, at: at || new Date().toISOString() });
  for (const l of v.lines) log(l);
  let wrote = null;
  if (write) {
    const out = path.join(verdictsDir, v.file);
    let prior = null; try { prior = JSON.parse(readFileSync(out, 'utf8')); } catch { prior = null; }
    for (const name of ['rows.json', 'rows-partial.json']) {
      const f = path.join(verdictsDir, name);
      let p = null; try { p = JSON.parse(readFileSync(f, 'utf8')); } catch { p = null; }
      if (!p || p.board === ROWS_BOARD) continue;
      const aside = f.replace(/\.json$/, '-board' + (p.board ?? 'unknown') + '.json');
      if (!existsSync(aside)) { writeFileSync(aside, readFileSync(f)); log('rows: copied ' + boardRel(f) + ' (board ' + p.board + ') to ' + boardRel(aside) + ' before this board writes it'); }
    }
    if (v.met && prior && prior.board === ROWS_BOARD && prior.barMet === true) log('rows: ' + boardRel(out) + ' already holds the bar and is written once; this run is printed, not written');
    else {
      const text = JSON.stringify(v.doc, null, 2);
      mkdirSync(verdictsDir, { recursive: true });
      writeFileSync(out, text);
      wrote = out;
      log('wrote ' + boardRel(out) + ' (' + Buffer.byteLength(text) + ' bytes), isTheBar ' + v.doc.isTheBar);
    }
  }
  return { ...v, wrote };
}

// ---------------------------------------------------------------- cli
function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.slice(2), v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) { out[k] = true; continue; }
    out[k] = v; i++;
  }
  return out;
}

/** Any of these runs the daily ruler; with none of them the ladder prints the board. */
export const DAILY_FLAGS = Object.freeze(['daily', 'date', 'tier', 'quick', 'model', 'log']);
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain && args(process.argv.slice(2)).health) {
  // The health child, and nothing else: one line of JSON on stdout.
  const a = args(process.argv.slice(2));
  console.log(JSON.stringify(healthColumn({ seed: String(a.seed || 'ladder'), ticks: Number(a.ticks) || 256 })));
} else if (isMain && DAILY_FLAGS.some((k) => k in args(process.argv.slice(2)))) {
  const a = args(process.argv.slice(2));
  const date = a.date === true || a.date === undefined ? todayString() : String(a.date);
  const v = await run({
    date,
    tier: a.tier === true || a.tier === undefined ? null : Number(a.tier),
    quick: !!a.quick,
    model: a.model === true ? undefined : a.model,
  });
  // --log puts the whole transcript under bench/verdicts/ladder/<date>.log, which is what the
  // scheduled 04:00 task reads back. It is appended, so a second run of the day is kept too.
  if (a.log && !v.quick) {
    mkdirSync(LADDER_DIR, { recursive: true });
    appendFileSync(path.join(LADDER_DIR, date + '.log'), v.lines.join('\n') + '\n');
  }
  console.log('LADDER ' + v.date + ': composite ' + (v.composite === null ? 'n/a' : v.composite.toFixed(6)) + ', ' + v.line);
} else if (isMain && args(process.argv.slice(2)).rows) {
  // the item verdict for rows: rows.json once when the bar is met, else rows-partial.json
  const r = await runRows({});
  process.exitCode = r.met ? 0 : 1;
} else if (isMain) {
  // no flag: the board, read from the verdicts on disk; ladder.json is written before this returns
  await runBoard({});
}
