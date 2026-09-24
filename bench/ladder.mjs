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

/** The authored share, from bench/verdicts/authorship.json. */
export function authoredOf({ dir = VERDICTS_DIR } = {}) {
  const f = path.join(dir, 'authorship.json');
  const v = readJsonSafe(f);
  if (!v || !isNum(v.share)) return { source: null, reason: 'no bench/verdicts/authorship.json with a share' };
  return { source: boardRel(f), at: v.at || null, command: v.command || null, isTheBar: v.isTheBar === true, numerator: v.numerator ?? null, denominator: v.denominator ?? null, share: v.share };
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

/** The whole board, read from disk. */
export async function boardOf({ dir = VERDICTS_DIR, publishedFile = PUBLISHED_FILE, logFile = LOG_FILE, states = stateDirs(BOARD_ROOT), now = Date.now() } = {}) {
  const published = readJsonSafe(publishedFile);
  const sets = PUBLIC_SETS.map((s) => boardSet(s, { dir, published }));
  const direct = PROVENANCE.includes('direct');
  return {
    sets, totals: boardTotals(sets),
    direct: { recordedByAnyPath: direct, provenance: [...PROVENANCE], note: direct ? null : 'act/prompt.mjs PROVENANCE is ' + PROVENANCE.join(', ') + ': no answer path records direct, so its share is 0 and its latency is not measured' },
    substrate: substrateOf({ dir, logFile }),
    instances: instancesOf({ states, dir, now }),
    authored: authoredOf({ dir }),
    bytesPerPoint: bytesPerPointOf({ dir, states }),
    improvement: await improvementOf({ dir, states }),
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
  const au = b.authored;
  L.push('AUTHORED SHARE: ' + (au.source ? au.numerator + ' of ' + au.denominator + ' = ' + pctOf(au.share) + '% (' + au.source + ', ' + au.at + (au.isTheBar ? ', isTheBar true' : ', not the bar') + ')' : 'not measured (' + au.reason + ')'));
  const bp = b.bytesPerPoint;
  L.push('BYTES PER SCORE POINT: ' + (bp.bar ? bp.bar.bytesPerScorePoint + ' at the bar (' + bp.bar.source + ', score ' + bp.bar.score + ' of ' + bp.bar.of + ', ' + bp.bar.bytes + ' bytes, ' + bp.bar.at + ')' : 'no compress bar')
    + (bp.last ? '; ' + bp.last.bytesPerScorePoint + ' at the last checkpoint header on disk (' + bp.last.where + ', score ' + bp.last.score + (bp.last.of ? ' of ' + bp.last.of : '') + ', ' + bp.last.at + (bp.last.isTheBar === false ? ', not the bar' : '') + ')' : '; no checkpoint header records one'));
  const im = b.improvement;
  L.push('IMPROVEMENT PER WALL SECOND: ' + (im.source
    ? 'carried ' + im.carried + ' and exact ' + im.exact + ' of the suite per wall second = ' + im.percentPerSecond + ' percent per second (' + im.source + ', checkpoints ' + im.fromK + ' to ' + im.toK + ' over ' + im.seconds + ' s' + (im.at ? ', ' + im.at : '') + ')'
      + '; his words: ' + b.hisRate.words + ', so the measured rate is ' + (isNum(im.percentPerSecond) ? bR6(im.percentPerSecond / b.hisRate.percentPerSecond) : 'n/a') + ' of his'
    : 'not measured (' + im.reason + ')'));
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
    + (b.authored.source ? 'Authored share ' + pctOf(b.authored.share) + ' percent. ' : '')
    + (b.bytesPerPoint.bar ? 'Bytes per score point ' + b.bytesPerPoint.bar.bytesPerScorePoint + ' at the compress bar. ' : '')
    + (im.source ? 'Improvement per wall second ' + im.percentPerSecond + ' percent of the suite against his ' + b.hisRate.percentPerSecond + '.' : 'Improvement per wall second is not measured.');
}

/** ladder.json: the daily series (days, deltas, line, which health and the site read) and the board beside it. */
export function seriesDocOf({ series, board, command, nFor95 = null, at = new Date().toISOString() }) {
  return {
    at, node: process.version, command, isTheBar: true,
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
export async function runBoard({ dir = VERDICTS_DIR, seriesFile = SERIES_FILE, ladderDir = LADDER_DIR, publishedFile = PUBLISHED_FILE, logFile = LOG_FILE, states = stateDirs(BOARD_ROOT), write = true, log = console.log, command = 'node bench/ladder.mjs' } = {}) {
  const board = await boardOf({ dir, publishedFile, logFile, states });
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

/** The files the rows item owns. A gate that started before one of them changed did not see it. */
export const ROWS_OWNED = Object.freeze(['bench/ladder.mjs', 'bench/gate.mjs', 'test/ladder.test.mjs', 'test/gate.test.mjs', 'notes/ladder.md']);
const ROW_KEYS = Object.freeze([['budget', 'BUDGET'], ['compress', 'COMPRESS'], ['hisData', 'HIS DATA']]);
const isoOf = (ms) => new Date(ms).toISOString();

/**
 * The rows verdict from what is on disk. ladder and gate are parsed JSON (or { error }), tests is
 * a runTestFile row, owned is [{ file, mtimeMs }]. Pure: it reads nothing and writes nothing.
 */
export function rowsVerdictOf({ ladder, gate, tests, owned = [], at = new Date().toISOString(), command = 'node bench/ladder.mjs --rows' }) {
  const reasons = [];
  const lad = ladder && !ladder.error ? ladder : null;
  const g = gate && !gate.error ? gate : null;

  const boardOk = !!(lad && lad.isTheBar === true && lad.board && !lad.board.error);
  const ladderAtMs = lad ? Date.parse(lad.at) : NaN;
  const ladderStale = lad ? owned.filter((f) => f.file === 'bench/ladder.mjs' && !(f.mtimeMs <= ladderAtMs)) : [];
  if (!lad) reasons.push('bench/verdicts/ladder.json could not be read' + (ladder && ladder.error ? ' (' + ladder.error + ')' : ''));
  else if (!boardOk) reasons.push('bench/verdicts/ladder.json carries no board');
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
  if (g && g.verdict !== 'GREEN') {
    const why = [];
    if (failing.length) why.push(failing.length + ' failing test file(s)');
    if (redRows.length) why.push('red rows ' + redRows.join(', '));
    if (emDash.length) why.push(emDash.length + ' em-dash file(s)');
    if (badImports.length) why.push(badImports.length + ' bad import(s)');
    reasons.push('the gate is ' + g.verdict + (why.length ? ': ' + why.join(', ') : ''));
  }

  const testsOk = !!(tests && tests.exit === 0 && tests.fail === 0 && tests.pass > 0 && tests.pass === tests.total);
  if (!testsOk) reasons.push('test/ladder.test.mjs did not pass: ' + (tests ? 'exit ' + tests.exit + ', pass ' + tests.pass + ', fail ' + tests.fail + ', tests ' + tests.total : 'not run'));

  const met = reasons.length === 0;
  const file = met ? 'rows.json' : 'rows-partial.json';
  const kill = (f) => f.killed ? ', killed on ' + f.killed + ' at ' + f.peakRssMb + ' MB' : '';
  const sentences = [
    'Board 10 item rows (his P4 and P15), composed by ' + command + ' from the verdicts on disk and one run of the ladder tests.',
    lad ? 'The board: bench/verdicts/ladder.json was written at ' + lad.at + ' by ' + lad.command + ', isTheBar ' + lad.isTheBar + (boardOk ? ', with the board for ' + lad.board.sets.map((s) => s.name + ' (' + s.status + ')').join(', ') + '.' : ', with no board.') : 'The board: bench/verdicts/ladder.json could not be read.',
    g ? 'The gate: ' + g.command + ' ran from ' + (g.startedAt || 'an unrecorded start') + ' to ' + g.at + ' and is ' + g.verdict + ': test files ' + g.testsPassed + ' of ' + g.testsTotal
      + (failing.length ? ' (failing: ' + failing.map((f) => f.file + kill(f)).join('; ') + ')' : '')
      + ', assertions ' + g.assertionsPassed + ' pass and ' + g.assertionsFailed + ' fail, em-dash files ' + emDash.length + ', bad imports ' + badImports.length
      + (badImports.length ? ' (' + badImports.join(', ') + ')' : '') + '; it printed ' + printed.length + ' of the ' + ROW_KEYS.length + ' rows'
      + (redRows.length ? ', red: ' + redRows.join(', ') : ', none red') + '. '
      + (Number.isFinite(startMs) ? (gateStale.length ? 'It is STALE for this item: ' + gateStale.map((f) => f.file).join(', ') + ' changed after it started.' : 'None of the ' + owned.length + ' files this item owns changed after it started, so it graded them as they are.') : 'It records no start, so what it saw cannot be told.')
      : 'The gate: bench/verdicts/gate.json could not be read.',
    tests ? 'The ladder tests: test/ladder.test.mjs ' + (testsOk ? 'passed ' : 'did not pass, ') + tests.pass + ' of ' + tests.total + ' (fail ' + tests.fail + ', exit ' + tests.exit + ') in ' + tests.ms + ' ms under the gate budget, peak RSS ' + (tests.budget ? tests.budget.peakRssMb : null) + ' MB.' : 'The ladder tests were not run.',
    met ? 'The bar asks for all three and all three hold: MET.' : 'The bar asks for all three, so it is MISSED: ' + reasons.join('; ') + '.',
  ];
  const doc = {
    at, command, node: process.version, isTheBar: met,
    statement: sentences.join(' '),
    item: 'rows', board: 10, met, reasons,
    parts: {
      ladder: lad ? { file: 'bench/verdicts/ladder.json', at: lad.at, command: lad.command, isTheBar: lad.isTheBar, board: boardOk, sets: boardOk ? lad.board.sets.map((s) => ({ name: s.name, status: s.status })) : [] } : null,
      gate: g ? {
        file: 'bench/verdicts/gate.json', command: g.command, startedAt: g.startedAt || null, at: g.at, verdict: g.verdict,
        testsPassed: g.testsPassed, testsTotal: g.testsTotal, assertionsPassed: g.assertionsPassed, assertionsFailed: g.assertionsFailed,
        failing, emDashFiles: emDash.length, emDash, badImports, rowsPrinted: printed, redRows,
        lines: Object.fromEntries(ROW_KEYS.map(([k]) => [k, rows[k] ? rows[k].line : null])),
      } : null,
      ladderTests: tests ? { command: 'node --max-old-space-size=6000 --test test/ladder.test.mjs', tests: tests.total, pass: tests.pass, fail: tests.fail, exit: tests.exit, ms: tests.ms, peakRssMb: tests.budget ? tests.budget.peakRssMb : null, budget: tests.budget ? tests.budget.outcome : null } : null,
    },
    owned: owned.map((f) => ({ file: f.file, changedAt: isoOf(f.mtimeMs) })),
    stale: { gate: gateStale.map((f) => f.file), ladder: ladderStale.map((f) => f.file) },
  };
  const lines = [
    'ROWS ' + (met ? 'MET' : 'MISSED') + ': board ' + (boardOk ? 'written' : 'missing') + (lad ? ' at ' + lad.at : '')
      + ', gate ' + (g ? g.verdict + ' ' + g.testsPassed + '/' + g.testsTotal + ', rows printed ' + printed.length + '/' + ROW_KEYS.length + (redRows.length ? ', red ' + redRows.join(', ') : '') : 'unread')
      + ', ladder tests ' + (tests ? tests.pass + '/' + tests.total + ' exit ' + tests.exit : 'not run'),
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
  log('rows: running test/ladder.test.mjs under the gate budget caps');
  const { row: tests } = await runTests(path.join(root, 'test', 'ladder.test.mjs'));
  const owned = ROWS_OWNED.filter((f) => existsSync(path.join(root, f))).map((f) => ({ file: f, mtimeMs: statSync(path.join(root, f)).mtimeMs }));
  const v = rowsVerdictOf({ ladder, gate, tests, owned, at: at || new Date().toISOString() });
  for (const l of v.lines) log(l);
  let wrote = null;
  if (write) {
    const out = path.join(verdictsDir, v.file);
    if (v.met && existsSync(out)) log('rows: ' + boardRel(out) + ' already holds the bar and is written once; this run is printed, not written');
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
