// test/ladder.test.mjs: the daily ruler, graded against the thing it replaced or a control.
//
//   (a) the draw is a function of the date: the same date and tier give the same item ids
//       twice, and another date gives other ones. The ids carry a digest of the item's own
//       content, because the generators name their slots by position and those repeat daily.
//   (b) the series arithmetic on three hand written dated files: the deltas are percents OF
//       THE PREVIOUS DAY, and the line reads met at or above 5 and missed below it.
//   (c) a second run of the same day writes <date>-2.json and the series takes the last one.
//   (d) the tier unlock rule, both sides, on hand written files.
//   (e) bench/code.mjs generating its tasks in memory leaves the committed fixture untouched.
//   (f) bench/capability.mjs run() returns the numbers it printed, and with write false it
//       leaves bench/verdicts/capability.json exactly as it found it.
//   (g) the health column is deterministic on its seed: two builds, equal.
//   (h) to (n) the board node bench/ladder.mjs prints with no flag: partial against whole and a
//       missing set, the three classes in s, us and ns, the 405B, frontier and Fable 5.1 rows,
//       Wilson 95 as the verdicts store it, instances under the health window, the P15 rows
//       each from its file, and the board on the real verdicts held to their own fields.
//   (o) and (p) the rows item verdict node bench/ladder.mjs --rows writes: met only when the
//       board with its ten blocks (Board 12's three, Board 15's GAPS, MAGNITUDE, UNDONE, Board 13's
//       CLIMB, PLATEAU, CLOCK, DIRECT, and the tie-break truth inside MULTIPLYING), a GREEN gate
//       with its eight rows (AUTONOMY and HANDOFF graded, not N/A, CONTAMINATION last with its
//       causes named, none red as a referee) and the ladder and gate tests all hold; a gate that
//       started before a file this item owns changed is STALE; rows.json is written once, and an
//       earlier board's rows.json and rows-partial.json are both kept.
//   (q) to (s) the Board 12 blocks on hand written verdicts: MULTIPLYING, AUTHORED (the share,
//       patches per source per day, days since the last board) and KNOWLEDGE, each printing
//       "not measured" for a missing verdict, PARTIAL for a -partial one, and n/a, never 0, for
//       a number the verdict does not carry.
//   (t) to (w) the Board 15 blocks on planted trees: GAPS (open, with a trial, attempted in the
//       last 7 days, kept, closed with before, after and operator), MAGNITUDE (the organism per
//       wall hour beside the orchestrator and the simulated clock), UNDONE (board items per board,
//       attempts and the wall each refusal hit, partial bars resumed, proposed boards), and the
//       AUTHORED SHARE line naming the boards its denominator counts; each prints "not measured"
//       for a missing file and never a zero for a missing number.
//   (x) to (ab) the Board 13 blocks on planted verdicts: CLIMB (the landing windows, the newest
//       board against the one before with both intervals, partial, one board only, a model
//       change), PLATEAU, CLOCK and DIRECT (each verdict by its own fields beside Board 11's
//       baseline), and the MULTIPLYING truth (tie-break noise while the picks share one searched
//       fitness or no run prints a noise, lifted only by a printed noise narrower than the gap
//       between picks of different fitness), held to the real notes/multiply.md and multiply.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, statSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  planItems, seedFor, tierSpec, nextTier, seriesOf, datedFiles, nextDatedPath, latestOfDay,
  deltaPercent, targetLine, compositeOf, healthColumn, COLUMNS, ACCURACY_COLUMNS, UNLOCK_FLOOR, TARGET,
  boardOf, boardLines, runBoard, classOf, classesOf, wilson95, armsOf, recordsOf, isPartialVerdict, armSeparation,
  instancesOf, substrateOf, authoredOf, bytesPerPointOf, improvementOf, HIS_RATE,
  multiplyOf, multiplyingLines, authoredLines, lastBoardOf, perSourcePerDayOf, knowledgeOf, knowledgeLines, narrowReasons,
  gapsOf, gapsLines, magnitudeOf, magnitudeLines, undoneOf, undoneLines,
  climbOf, climbLines, boardWindowsOf, boardOfVerdict, plateauOf, plateauLines, clockOf, clockLines, directRecallOf, directRecallLines, tieBreakOf, tieBreakLines,
} from '../bench/ladder.mjs';
import { ANSWER_PROVENANCE as PROVENANCE } from '../act/prompt.mjs';
import { ALIVE_WINDOW_MS } from '../daemon/health.mjs';
import { run as codeRun } from '../bench/code.mjs';
import { run as capabilityRun } from '../bench/capability.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = path.join(ROOT, 'bench', 'fixtures', 'code-tasks.json');
const CAPABILITY = path.join(ROOT, 'bench', 'verdicts', 'capability.json');

function tmp() { return mkdtempSync(path.join(tmpdir(), 'ladder-')); }

// A dated file with only what the series reads out of it.
function day(dir, date, tier, columns, suffix = '') {
  const cols = {};
  for (const c of COLUMNS) cols[c] = { score: columns[c] };
  const composite = compositeOf(cols);
  writeFileSync(path.join(dir, date + suffix + '.json'), JSON.stringify({ at: date + 'T04:00:00.000Z', date, tier, columns: cols, composite }, null, 2));
  return composite;
}

// ---------------------------------------------------------------- (a) the draw
test('(a) the same date and tier draw the same items twice, and another date draws others', () => {
  const a = planItems({ date: '2026-09-18', tier: 1 });
  const b = planItems({ date: '2026-09-18', tier: 1 });
  const c = planItems({ date: '2026-09-19', tier: 1 });

  assert.deepEqual(a.itemIds, b.itemIds, 'the same date and tier must draw the same items');
  assert.equal(a.seed, seedFor('2026-09-18'));
  assert.ok(a.itemIds.answer.length > 0 && a.itemIds.code.length > 0);

  const sharedAnswer = a.itemIds.answer.filter((x) => c.itemIds.answer.includes(x));
  const sharedCode = a.itemIds.code.filter((x) => c.itemIds.code.includes(x));
  console.log('(a) 2026-09-18 draws ' + a.itemIds.answer.length + ' answer and ' + a.itemIds.code.length
    + ' code items; against 2026-09-19 the overlap is ' + sharedAnswer.length + ' answer and ' + sharedCode.length + ' code');
  console.log('(a) 2026-09-18 first three answer items: ' + a.itemIds.answer.slice(0, 3).join(' '));
  console.log('(a) 2026-09-19 first three answer items: ' + c.itemIds.answer.slice(0, 3).join(' '));
  assert.equal(sharedAnswer.length, 0, 'no answer item may repeat the next day');
  assert.equal(sharedCode.length, 0, 'no code item may repeat the next day');

  // The slot names DO repeat, which is exactly why an item id is not a slot name.
  const slotOverlap = a.answerIds.filter((x) => c.answerIds.includes(x)).length;
  console.log('(a) the generators\' slot names overlap ' + slotOverlap + ' of ' + a.answerIds.length + ', which is why an item id carries a digest');
  assert.equal(slotOverlap, a.answerIds.length);
});

test('(a) a higher tier draws more items, and more of the deep grids', () => {
  const rows = [1, 2, 3].map((t) => {
    const p = planItems({ date: '2026-09-18', tier: t });
    return { tier: t, answer: p.answerIds.length, depth3: p.answerBySource.grid.families.depth3 || 0, code: p.codeIds.length };
  });
  for (const r of rows) console.log('(a) tier ' + r.tier + ': ' + r.answer + ' answer items, ' + r.depth3 + ' of them depth3 grids, ' + r.code + ' code tasks');
  assert.ok(rows[1].answer > rows[0].answer && rows[2].answer > rows[1].answer);
  assert.ok(rows[1].code > rows[0].code && rows[2].code > rows[1].code);
  assert.ok(rows[2].depth3 > rows[0].depth3, 'depth3 count must rise with the tier');
  assert.equal(tierSpec(99).capped, true, 'a tier past the last one keeps the last one\'s counts and says so');
});

// ---------------------------------------------------------------- (b) the series arithmetic
test('(b) three hand written days give the printed deltas and the met or missed line', () => {
  const dir = tmp();
  try {
    // Composites chosen so the day over day arithmetic lands on exact percents: 0.5 -> 0.535
    // is +7 percent of the previous day, and 0.535 -> 0.55105 is +3 percent of that.
    const c1 = day(dir, '2026-09-16', 1, { answer: 0.5, code: 0.5, capability: 0.5, health: 0.5 });
    const c2 = day(dir, '2026-09-17', 1, { answer: 0.535, code: 0.535, capability: 0.535, health: 0.535 });
    const c3 = day(dir, '2026-09-18', 1, { answer: 0.55105, code: 0.55105, capability: 0.55105, health: 0.55105 });
    const s = seriesOf(dir);
    console.log('(b) composites ' + c1 + ' -> ' + c2 + ' -> ' + c3);
    console.log('(b) deltas ' + s.deltas.map((d) => d.date + ' ' + d.composite + ' percent of ' + d.against).join(', '));
    console.log('(b) line: ' + s.line);
    assert.equal(s.days.length, 3);
    assert.equal(s.deltas.length, 2);
    assert.equal(s.deltas[0].composite, 7);
    assert.equal(s.deltas[1].composite, 3);
    for (const c of COLUMNS) {
      assert.equal(s.deltas[0].perColumn[c], 7, c + ' moved 7 percent of the previous day');
      assert.equal(s.deltas[1].perColumn[c], 3);
    }
    assert.match(s.line, /composite \+3\.00 percent, target 5 to 10 percent: missed/);

    // The three cases his sentence names, on the one function that writes the line.
    const met7 = targetLine(7), missed3 = targetLine(3), met12 = targetLine(12), first = targetLine(null);
    for (const l of [met7, missed3, met12, first]) console.log('(b) ' + l);
    assert.match(met7, /\+7\.00 percent, target 5 to 10 percent: met$/);
    assert.match(missed3, /\+3\.00 percent, target 5 to 10 percent: missed$/);
    assert.match(met12, /\+12\.00 percent, target 5 to 10 percent: met$/);
    assert.match(first, /first day$/);
    assert.equal(TARGET.low, 5);

    // A percent of nothing is not a number, and is never printed as one.
    assert.equal(deltaPercent(0.5, 0), null);
    assert.equal(deltaPercent(0.5, null), null);
    assert.equal(compositeOf({ answer: { score: 1 }, code: { score: 0 }, capability: { score: 1 }, health: { score: 0.5 } }), 0.625);
    assert.equal(compositeOf({ answer: { score: 1 }, code: { score: null }, capability: { score: 1 }, health: { score: 0.5 } }), null);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ---------------------------------------------------------------- (c) a second run the same day
test('(c) a second run of a day writes -2, and the series takes the last of the day', () => {
  const dir = tmp();
  try {
    const first = nextDatedPath(dir, '2026-09-18');
    assert.equal(path.basename(first.path), '2026-09-18.json');
    assert.equal(first.run, 1);
    day(dir, '2026-09-18', 1, { answer: 0.4, code: 0.4, capability: 0.4, health: 0.4 });

    const second = nextDatedPath(dir, '2026-09-18');
    console.log('(c) the second run of 2026-09-18 goes to ' + path.basename(second.path) + ' (run ' + second.run + ')');
    assert.equal(path.basename(second.path), '2026-09-18-2.json');
    assert.equal(second.run, 2);
    day(dir, '2026-09-18', 1, { answer: 0.8, code: 0.8, capability: 0.8, health: 0.8 }, '-2');

    const third = nextDatedPath(dir, '2026-09-18');
    assert.equal(path.basename(third.path), '2026-09-18-3.json');

    // Nothing was overwritten: the first file still holds the first run's numbers.
    const kept = JSON.parse(readFileSync(path.join(dir, '2026-09-18.json'), 'utf8'));
    assert.equal(kept.composite, 0.4, 'the first run of the day is never rewritten');

    assert.equal(latestOfDay(dir, '2026-09-18').file, '2026-09-18-2.json');
    const s = seriesOf(dir);
    console.log('(c) the series takes ' + s.latest.file + ' of ' + s.latest.runsThatDay + ' runs that day, composite ' + s.days[0].composite);
    assert.equal(s.days.length, 1, 'one row per day, not one per run');
    assert.equal(s.days[0].composite, 0.8, 'the series takes the LAST run of the day');
    assert.equal(s.days[0].runsThatDay, 2);
    assert.equal(datedFiles(dir).length, 2);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ---------------------------------------------------------------- (d) the unlock rule
test('(d) the tier unlocks on a clean day and holds on a dirty one, both sides', () => {
  const dir = tmp();
  try {
    // Side one: every accuracy column at or above the floor and no day before to fall from.
    day(dir, '2026-09-16', 1, { answer: 0.95, code: 0.92, capability: 1, health: 0.86 });
    const up = nextTier(seriesOf(dir).days, '2026-09-17');
    console.log('(d) unlock: ' + JSON.stringify(up));
    assert.equal(up.tier, 2);

    // Side two: one accuracy column under the floor holds the tier where it was.
    const dir2 = tmp();
    day(dir2, '2026-09-16', 2, { answer: 0.95, code: 0.5, capability: 1, health: 0.86 });
    const stay = nextTier(seriesOf(dir2).days, '2026-09-17');
    console.log('(d) held: ' + JSON.stringify(stay));
    assert.equal(stay.tier, 2, 'the tier does not rise, and does not fall either');
    assert.match(stay.why, /code 0\.5/);
    rmSync(dir2, { recursive: true, force: true });

    // Side three: the columns clear the floor but health fell against the day before.
    const dir3 = tmp();
    day(dir3, '2026-09-15', 1, { answer: 0.95, code: 0.95, capability: 1, health: 0.9 });
    day(dir3, '2026-09-16', 1, { answer: 0.95, code: 0.95, capability: 1, health: 0.8 });
    const fell = nextTier(seriesOf(dir3).days, '2026-09-17');
    console.log('(d) health fell: ' + JSON.stringify(fell));
    assert.equal(fell.tier, 1);
    assert.match(fell.why, /health fell from 0\.9 .* to 0\.8/);
    rmSync(dir3, { recursive: true, force: true });

    // And health below the floor does NOT hold the tier: his sentence puts the floor on the
    // accuracy columns and gives health its own clause. Measured, health reads 0.848646 at
    // this size, so a floor on it would mean the ladder never leaves tier 1.
    assert.ok(!ACCURACY_COLUMNS.includes('health'));
    assert.equal(ACCURACY_COLUMNS.length, 3);
    assert.equal(UNLOCK_FLOOR, 0.9);
    assert.equal(nextTier([], '2026-09-18').tier, 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ---------------------------------------------------------------- (e) the fixture is not touched
test('(e) code tasks generated in memory leave the committed fixture untouched', async () => {
  const before = statSync(FIXTURE);
  const beforeBytes = readFileSync(FIXTURE);
  const v = await codeRun({ seed: 'ladder/2026-09-18', inMemory: true, arms: 'null', limit: 2, write: false, quiet: true });
  const after = statSync(FIXTURE);
  console.log('(e) in memory run: ' + v.tasks.total + ' tasks at seed ' + v.tasks.seed + ', from ' + v.tasks.fixture
    + ', shape ' + v.shape.name + ', isTheBar ' + v.isTheBar + ', wroteTo ' + v.wroteTo);
  console.log('(e) fixture mtime ' + before.mtimeMs + ' -> ' + after.mtimeMs);
  assert.equal(after.mtimeMs, before.mtimeMs, 'the fixture must not be rewritten');
  assert.equal(Buffer.compare(beforeBytes, readFileSync(FIXTURE)), 0, 'the fixture bytes must not move');
  assert.equal(v.tasks.inMemory, true);
  assert.equal(v.tasks.seed, 'ladder/2026-09-18');
  assert.equal(v.isTheBar, false, 'an in memory run is never the bar, whatever its counts');
  assert.match(v.shape.name, /narrow/);

  // The control: the SAME call reading the fixture instead names the fixture as its source.
  const onFixture = await codeRun({ arms: 'null', limit: 2, write: false, quiet: true });
  assert.equal(onFixture.tasks.inMemory, false);
  assert.equal(onFixture.tasks.fixture, 'bench/fixtures/code-tasks.json');
  assert.notEqual(onFixture.tasks.seed, v.tasks.seed, 'the two runs are two different task sets');
  console.log('(e) the fixture run is seed ' + onFixture.tasks.seed + ', the in memory run is seed ' + v.tasks.seed);
});

// ---------------------------------------------------------------- (f) capability as a module
test('(f) capability run() returns what it printed and with write false touches no verdict', () => {
  const before = statSync(CAPABILITY);
  const v = capabilityRun({ seed: 'ladder/2026-09-18', write: false, quiet: true });
  const after = statSync(CAPABILITY);
  const text = v.lines.join('\n');
  console.log('(f) induction ' + v.induction.solved + '/' + v.induction.total + ', algebra ' + v.algebra.solved + '/' + v.algebra.solvable
    + ', graded ' + v.graded.correct + '/' + v.graded.n + ' = ' + v.graded.accuracy + ', ' + v.ms + 'ms');
  console.log('(f) capability.json mtime ' + before.mtimeMs + ' -> ' + after.mtimeMs);
  assert.equal(after.mtimeMs, before.mtimeMs, 'write false must not rewrite the bench\'s own verdict');

  // Returned is printed: every headline number is in the lines this run produced.
  assert.ok(text.includes('solved ' + v.induction.solved + '/' + v.induction.total), 'the induction count is printed');
  assert.ok(text.includes('solved ' + v.algebra.solved + '/' + v.algebra.solvable), 'the algebra count is printed');
  assert.ok(text.includes(v.market.gap.toFixed(4)), 'the market gap is printed');
  assert.equal(v.graded.correct, v.induction.solved + v.algebra.solved);
  assert.equal(v.graded.n, v.induction.total + v.algebra.solvable);
  assert.ok(v.graded.accuracy >= 0 && v.graded.accuracy <= 1);
});

// ---------------------------------------------------------------- (g) the health column
test('(g) the health column is deterministic on its seed', () => {
  const a = healthColumn({ seed: 'ladder/2026-09-18', ticks: 64 });
  const b = healthColumn({ seed: 'ladder/2026-09-18', ticks: 64 });
  const c = healthColumn({ seed: 'ladder/2026-09-19', ticks: 64 });
  console.log('(g) 2026-09-18 health ' + a.score + ' over ' + a.cells + ' cells and ' + a.edges + ' edges, twice: ' + b.score);
  console.log('(g) 2026-09-19 health ' + c.score + ' over ' + c.cells + ' cells and ' + c.edges + ' edges');
  assert.deepEqual(a, b, 'two builds on one seed must agree in every number');
  assert.ok(a.score >= 0 && a.score <= 1);
  assert.notEqual(a.edges, c.edges, 'another seed is another organism');
});

// ---------------------------------------------------------------- the board (Board 10)
// (h) through (n) grade the board that node bench/ladder.mjs prints with no flag. Every fixture
// is hand written in a temp directory, so each expected number below is known before the code
// runs; (n) then holds the board on the real verdicts to the fields of those same files.

// A new-schema public verdict: arms with their own intervals, rows with provenance.
function publicVerdict({ at, n, of, isTheBar = true, rows, published = [], model = 'qwen3:1.7b', alone = null, nul = null }) {
  const correct = rows.filter((r) => r.ok).length;
  const arm = (c, k) => ({ absent: false, n: k, correct: c, accuracy: c / k, interval: wilson95(c, k), meanMs: 1 });
  return {
    at, command: 'node bench/public.mjs', node: 'v24', isTheBar, n, of, model, published,
    arms: { organism: arm(correct, rows.length), alone: alone || arm(0, rows.length), null: nul || arm(0, rows.length) },
    rows: rows.map((r, i) => ({ i, id: 'q' + i, arms: { organism: { ok: r.ok, ms: r.ms, provenance: r.provenance } } })),
  };
}
function put(dir, name, obj) { writeFileSync(path.join(dir, name), JSON.stringify(obj, null, 2)); }

test('(h) partial against whole, a missing set, and the three classes in their units', async () => {
  const dir = tmp();
  try {
    // GSM8K: two partial files, the newer is primary; 4 answers, 2 model (1000 and 3000 ms),
    // 1 exact (0.5 ms), 1 memory (1.5 ms). Model mean 2 s; native mean 1 ms = 1000 us.
    put(dir, 'public-gsm8k-partial.json', publicVerdict({ at: '2026-09-23T00:00:00.000Z', n: 4, of: 1319, isTheBar: false, rows: [
      { ok: true, ms: 1000, provenance: 'model' }, { ok: false, ms: 3000, provenance: 'model' },
      { ok: true, ms: 0.5, provenance: 'exact' }, { ok: true, ms: 1.5, provenance: 'memory' },
    ] }));
    put(dir, 'public-gsm8k-board7-partial.json', {
      at: '2026-09-18T00:00:00.000Z', isTheBar: false, complete: false, model: 'qwen3:1.7b',
      partial: { n: 3, of: 60, acc: { organism: { n: 3, correct: 2, ms: [10, 20, 30] } }, rows: [{ arms: { organism: { ok: true, ms: 10 } } }] },
    });
    // ARC: a whole grid verdict (model null) is primary over a NEWER partial one.
    put(dir, 'grid-evaluation.json', { at: '2026-09-20T00:00:00.000Z', command: 'node bench/grid.mjs', isTheBar: true, n: 4, of: 4, solved: 1, meanMs: 5, model: null,
      rows: [{ id: 'a', solved: true, wallMs: 2, ms: 1 }, { id: 'b', solved: false, wallMs: 6, ms: 5 }, { id: 'c', solved: false, wallMs: 6 }, { id: 'd', solved: false, wallMs: 6 }] });
    put(dir, 'grid-evaluation-partial.json', { at: '2026-09-24T00:00:00.000Z', isTheBar: false, n: 2, of: 4, solved: 2, model: null, rows: [] });
    const b = await boardOf({ dir, publishedFile: path.join(dir, 'none.json'), logFile: path.join(dir, 'none.md'), states: [] });
    const [g, h, a] = b.sets;

    assert.equal(g.status, 'PARTIAL');
    assert.equal(g.primary.file.endsWith('public-gsm8k-partial.json'), true, 'the newest partial is primary');
    assert.deepEqual(g.partialBecause, ['the file is named -partial', 'isTheBar false', 'a sample of 4 of 1319']);
    assert.equal(g.alsoOnDisk.length, 1);
    assert.equal(g.alsoOnDisk[0].organism, '2/3');
    assert.equal(g.alsoOnDisk[0].provenanceRecorded, false);
    assert.equal(g.classes.model.records, 2);
    assert.equal(g.classes.model.share, 0.5);
    assert.equal(g.classes.model.unit, 's');
    assert.equal(g.classes.model.latency, 2, 'mean of 1000 and 3000 ms is 2 s');
    assert.equal(g.classes.model.latencyCorrect, 1);
    assert.equal(g.classes.native.records, 2);
    assert.equal(g.classes.native.unit, 'us');
    assert.equal(g.classes.native.latency, 1000, 'mean of 0.5 and 1.5 ms is 1000 us');
    assert.equal(g.classes.direct.records, 0);
    assert.equal(g.classes.direct.latency, null);

    assert.equal(h.status, 'not measured');

    assert.equal(a.status, 'whole');
    assert.equal(a.primary.file.endsWith('grid-evaluation.json'), true, 'a whole verdict wins over a newer partial');
    assert.equal(a.arms.organism.correct, 1);
    assert.deepEqual(a.arms.organism.interval, { lo: wilson95(1, 4).lo, hi: wilson95(1, 4).hi, width: wilson95(1, 4).width });
    assert.equal(a.arms.alone.absent, true);
    assert.equal(a.classes.native.records, 4, 'a null model: every answer is the organism own search');
    assert.equal(a.classes.native.inferred, 4);
    assert.equal(a.classes.native.latency, 5000, 'wallMs mean (2+6+6+6)/4 = 5 ms = 5000 us');
    assert.equal(a.bars.claimable, true);
    assert.equal(g.bars.claimable, false);

    const lines = boardLines(b).join('\n');
    assert.match(lines, /GSM8K {2}PARTIAL, only partial verdicts on disk/);
    assert.match(lines, /HumanEval {2}NOT MEASURED/);
    assert.match(lines, /ARC-AGI-1 evaluation {2}whole/);
    assert.match(lines, /a sample, not the whole set: no bar above can be claimed from it/);
    assert.equal(/\u2014/.test(lines), false, 'no em-dash in what the board prints');
    assert.equal(b.totals.records, 8);
    assert.equal(b.totals.classes.model.records, 2);
    assert.equal(b.totals.classes.native.records, 6);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(i) direct answers land in nanoseconds, and an unknown provenance is not counted in any class', () => {
  assert.equal(classOf('direct'), 'direct');
  assert.equal(classOf('exact'), 'native');
  assert.equal(classOf('memory'), 'native');
  assert.equal(classOf('model'), 'model');
  assert.equal(classOf(null), 'unrecorded');
  assert.equal(classOf('guess'), 'other');
  const c = classesOf([{ ok: true, ms: 0.000123, provenance: 'direct' }, { ok: false, ms: 0.000077, provenance: 'direct' }, { ok: true, ms: 9, provenance: 'guess' }]);
  assert.equal(c.direct.records, 2);
  assert.equal(c.direct.unit, 'ns');
  assert.equal(c.direct.latency, 100, '(123 + 77) / 2 ns');
  assert.equal(c.direct.latencyCorrect, 123);
  assert.equal(c.other.records, 1);
  assert.equal(c.model.records + c.native.records, 0);
  // the provenance list the organism records today has no direct, and the board says so
  assert.equal(PROVENANCE.includes('direct'), true);
});

test('(j) the 405B row, the frontier row held to one answer, and Fable 5.1 only from published.json with a URL', async () => {
  const dir = tmp();
  try {
    const rows = [
      { system: 'Open 405B', score: 90, class: 'open 405B', metric: 'em@1', source: 'https://a' },
      { system: 'Frontier A', score: 80, class: 'frontier', metric: 'pass@1', source: 'https://b' },
      { system: 'Frontier B', score: 99, class: 'frontier reasoning', metric: 'pass@100', source: 'https://c' },
      { system: 'Frontier C', score: 70, class: 'frontier reasoning', metric: null, source: 'https://d' },
      { system: 'Claude Fable 5.1 (Max)', score: 50, class: 'frontier reasoning', metric: null, source: 'https://kept-in-the-verdict' },
      { system: 'Small', score: 10, class: 'small', metric: 'pass@1', source: 'https://e' },
    ];
    // 8 of 10 correct: 80%, Wilson 95 about [49.0, 94.3]
    const answers = Array.from({ length: 10 }, (_, i) => ({ ok: i < 8, ms: 100, provenance: 'model' }));
    put(dir, 'public-humaneval.json', publicVerdict({ at: '2026-09-23T00:00:00.000Z', n: 10, of: 10, rows: answers, published: rows }));
    const pubNoUrl = path.join(dir, 'pub-no-url.json');
    writeFileSync(pubNoUrl, JSON.stringify({ rows: [{ benchmark: 'humaneval', system: 'Claude Fable 5.1 (Max)', score: 60, source: 'the leaderboard' }] }));
    const pubUrl = path.join(dir, 'pub-url.json');
    writeFileSync(pubUrl, JSON.stringify({ rows: [
      { benchmark: 'gsm8k', system: 'Claude Fable 5.1 (Max)', score: 1, source: 'https://other-benchmark' },
      { benchmark: 'humaneval', system: 'Claude Fable 5.1 (Max)', score: 30, source: 'https://published' },
    ] }));

    const none = (await boardOf({ dir, publishedFile: pubNoUrl, logFile: path.join(dir, 'x'), states: [] })).sets[1];
    assert.equal(none.status, 'whole');
    assert.equal(none.bars.row405.system, 'Open 405B');
    assert.equal(none.bars.row405.side, 'below');
    assert.equal(none.bars.row405.decided, null, '80 percent on 10 cannot decide against 90');
    assert.equal(none.bars.frontier.system, 'Frontier A', 'pass@100 is not a single answer, and 80 beats 70 and 50');
    assert.equal(none.bars.frontier.side, 'equal');
    assert.equal(none.bars.orchestrator, null, 'a Fable row kept only in a verdict, or one without a URL, is not a published row');
    const printed = boardLines(await boardOf({ dir, publishedFile: pubNoUrl, logFile: path.join(dir, 'x'), states: [] })).join('\n');
    assert.match(printed, /orchestrator \(Fable 5\.1\): no published row/);

    const yes = (await boardOf({ dir, publishedFile: pubUrl, logFile: path.join(dir, 'x'), states: [] })).sets[1];
    assert.equal(yes.bars.orchestrator.system, 'Claude Fable 5.1 (Max)');
    assert.equal(yes.bars.orchestrator.score, 30, 'the humaneval row, not the gsm8k one');
    assert.equal(yes.bars.orchestrator.side, 'above');
    assert.equal(yes.bars.orchestrator.decided, 'above', 'the interval low end is above 30');
    assert.equal(yes.published.find((r) => r.system === 'Small').decided, 'above');

    assert.equal(armSeparation(yes.arms.organism, yes.arms.null).verdict, 'beats, intervals separate');
    assert.equal(armSeparation(yes.arms.organism, { absent: true, reason: 'none' }).verdict, 'absent');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(k) the interval is Wilson 95 as the verdicts store it, and the old count words are read', () => {
  // the stored intervals of bench/verdicts/public-humaneval-partial.json and -gsm8k-partial.json
  assert.deepEqual(wilson95(5, 6), { lo: 0.436491, hi: 0.969947, width: 0.533457 });
  assert.equal(wilson95(6, 6).lo, 0.609657);
  assert.equal(wilson95(0, 6).hi, 0.390343);
  const arms = armsOf({ model: 'm', partial: { n: 3, of: 9, acc: { organism: { n: 3, passed: 2, ms: [1, 2, 3] }, alone: { n: 3, passed: 1 }, null: { n: 0, reason: 'off' } } } });
  assert.equal(arms.organism.correct, 2, 'code benches count passed');
  assert.equal(arms.organism.meanMs, 2);
  assert.equal(arms.alone.correct, 1);
  assert.equal(arms.null.absent, true);
  const recs = recordsOf({ partial: { rows: [{ arms: { organism: { pass: true, ms: 4 } } }, { arms: { organism: { pass: false, ms: 6 } } }] } });
  assert.deepEqual(recs.map((r) => r.ok), [true, false], 'code rows mark pass, not ok');
  assert.equal(isPartialVerdict('public-arc.json', { n: 400, of: 400, complete: true }), false);
  assert.equal(isPartialVerdict('public-arc.json', { n: 399, of: 400 }), true);
  assert.equal(isPartialVerdict('x.json', { isTheBar: true }), true, 'no n of recorded is not a whole set');
});

test('(l) instances alive: the health window on state/instances.json, else a cloud verdict marked partial', () => {
  const dir = tmp();
  try {
    const state = path.join(dir, 'state');
    mkdirSync(state);
    const now = Date.parse('2026-09-24T10:00:00.000Z');
    writeFileSync(path.join(state, 'instances.json'), JSON.stringify({ instances: {
      a: { id: 'a', lastSeen: new Date(now - 1000).toISOString() },
      b: { id: 'b', lastSeen: new Date(now - ALIVE_WINDOW_MS - 1000).toISOString() },
      c: { id: 'c', lastSeen: new Date(now - ALIVE_WINDOW_MS).toISOString() },
    } }));
    const s = instancesOf({ states: [state], dir, now });
    assert.equal(s.kind, 'state');
    assert.equal(s.alive, 2, 'a is fresh, c sits on the window edge, b is past it');
    assert.equal(s.known, 3);
    put(dir, 'cloud-partial.json', { at: 'x', isTheBar: false, instancesAlive: 5, mode: 'native' });
    const c = instancesOf({ states: [], dir, now });
    assert.equal(c.alive, 5);
    assert.equal(c.partial, true);
    put(dir, 'cloud.json', { at: 'y', isTheBar: true, instancesAlive: 7 });
    assert.equal(instancesOf({ states: [], dir, now }).alive, 7, 'the bar file wins over the partial one');
    assert.equal(instancesOf({ states: [], dir: path.join(dir, 'none'), now }).alive, null);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(m) substrate, authored share, bytes per point and improvement per second, each from its file', async () => {
  const dir = tmp();
  try {
    const log = path.join(dir, 'LOG.md');
    writeFileSync(log, '# log\n- 2026-09-16 22:46: web landed; in the browser 1200 majors run 4225 ticks/s, 0.09 us per cell run, 0.05 us per packet hop; more\n- 2026-09-16 22:51: viz measured per cell run 27.0 us\n');
    put(dir, 'speed.json', { at: 's', organism: 'organism/gen-0', arms: [{ cells: 40000 }], accounting: { usPerRun: { baseline: 55.463, single: 11.723, best: 2.158 } } });
    let sb = substrateOf({ dir, logFile: log });
    assert.equal(sb.measured, null);
    assert.equal(sb.browser.nsPerCellRun, 90);
    assert.equal(sb.browser.nsPerHop, 50);
    assert.equal(sb.browser.line, 2);
    assert.equal(sb.browser.when, '2026-09-16 22:46');
    assert.equal(sb.node.nsPerCellRunBest, 2158);
    put(dir, 'ladder-substrate.json', { at: 'm', command: 'c', isTheBar: true, nsPerCellRun: 42, nsPerHop: 7 });
    sb = substrateOf({ dir, logFile: log });
    assert.equal(sb.measured.nsPerCellRun, 42, 'a verdict for this row wins');

    put(dir, 'authorship.json', { at: 'a', isTheBar: true, numerator: 3, denominator: 12, share: 0.25 });
    const au = authoredOf({ dir });
    assert.equal(au.share, 0.25);
    assert.equal(au.numerator, 3);

    put(dir, 'compress.json', { at: '2026-09-24T01:00:00.000Z', isTheBar: true, ruler: { v2Header: { score: 10, of: 10, bytes: 1000, bytesPerScorePoint: 100 } } });
    put(dir, 'compress-later.json', { at: '2026-09-24T02:00:00.000Z', isTheBar: false, ruler: { v2Header: { score: 10, of: 10, bytes: 500, bytesPerScorePoint: 50 } } });
    const bp = bytesPerPointOf({ dir, states: [] });
    assert.equal(bp.bar.bytesPerScorePoint, 100);
    assert.equal(bp.last.bytesPerScorePoint, 50, 'the newest header on disk');
    assert.equal(bp.records, 2);

    // daemon.json first, then a live ruler in a state directory wins over it
    put(dir, 'daemon.json', { at: 'd', isTheBar: true, phaseA: { perWallSecond: { fromK: 0, toK: 3, seconds: 10, exact: 0, carried: 0.01 } } });
    let im = await improvementOf({ dir, states: [] });
    assert.equal(im.carried, 0.01);
    assert.equal(im.percentPerSecond, 1);
    const state = path.join(dir, 'st');
    mkdirSync(state);
    const row = (k, atMs, carried) => JSON.stringify({ k, run: 1, atMs, done: k * 1000, total: { n: 100, exact: 0, carried } });
    writeFileSync(path.join(state, 'ruler.jsonl'), row(0, 0, 0) + '\n' + row(1, 10000, 50) + '\n');
    im = await improvementOf({ dir, states: [state] });
    assert.equal(im.kind, 'live ruler');
    assert.equal(im.carried, 0.05, '50 of 100 over 10 s');
    assert.equal(im.percentPerSecond, 5, 'exactly his 5 percent every second');
    assert.equal(HIS_RATE.percentPerSecond, 5);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(n) the board on the real verdicts equals their fields, and runBoard writes only where it is told', async () => {
  const dir = tmp();
  const real = path.join(ROOT, 'bench', 'verdicts', 'ladder.json');
  const before = (() => { try { return statSync(real).mtimeMs; } catch { return null; } })();
  try {
    const out = path.join(dir, 'ladder.json');
    const printed = [];
    const r = await runBoard({ seriesFile: out, log: (l) => printed.push(l), states: [] });
    const doc = JSON.parse(readFileSync(out, 'utf8'));
    assert.equal(doc.isTheBar, true);
    assert.match(doc.at, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(doc.command, 'node bench/ladder.mjs');
    assert.equal(typeof doc.node, 'string');
    assert.equal(typeof doc.statement, 'string');
    assert.equal(doc.statement.includes('\n'), false, 'one paragraph');
    assert.ok(Array.isArray(doc.days), 'the daily series keeps the keys health and the site read');
    assert.equal(/\u2014/.test(readFileSync(out, 'utf8')), false);
    assert.equal(doc.board.sets.length, 3);
    for (const s of r.board.sets) {
      if (s.status === 'not measured') continue;
      const v = JSON.parse(readFileSync(path.join(ROOT, s.primary.file), 'utf8'));
      const want = v.arms && v.arms.organism && !v.arms.organism.absent
        ? (v.arms.organism.correct ?? v.arms.organism.solved)
        : v.partial ? (v.partial.acc.organism.correct ?? v.partial.acc.organism.passed) : v.solved;
      assert.equal(s.arms.organism.correct, want, s.key + ': the organism count is the verdict field');
      if (v.arms && v.arms.organism && v.arms.organism.interval) assert.equal(s.arms.organism.interval.lo, v.arms.organism.interval.lo);
      if (v.arms && v.arms.organism && v.arms.organism.meanMs && s.classes.model.records === s.recordsRead && s.recordsRead === v.arms.organism.n) {
        assert.ok(Math.abs(s.classes.model.meanMs - v.arms.organism.meanMs) < 0.01, s.key + ': the model mean is the verdict mean');
      }
      assert.equal(s.status === 'PARTIAL', isPartialVerdict(path.basename(s.primary.file), v));
      assert.ok(printed.some((l) => l.startsWith(s.name + '  ' + (s.status === 'PARTIAL' ? 'PARTIAL' : 'whole'))), s.key + ' printed with its status');
    }
    assert.ok(printed.some((l) => l.startsWith('wrote ')));
    // the three Board 12 blocks are printed, and each number is its verdict's field or not measured
    for (const b of ['MULTIPLYING', 'AUTHORED', 'KNOWLEDGE']) assert.ok(printed.some((l) => l.startsWith(b)), b + ' printed');
    const mv = (() => { try { return JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'multiply.json'), 'utf8')); } catch { return null; } })();
    if (mv) {
      assert.equal(doc.board.multiplying.bar.populationFresh, mv.bar.populationFresh);
      assert.equal(doc.board.multiplying.bar.singleFresh, mv.bar.singleFresh);
      assert.equal(doc.board.multiplying.population.duplications, mv.arms.population.duplications);
    } else assert.ok(printed.some((l) => l.startsWith('MULTIPLYING: not measured') || l.includes('multiply-partial.json, PARTIAL')));
    const kv = (() => { try { return JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'knowledge.json'), 'utf8')); } catch { return null; } })();
    if (kv) assert.equal(doc.board.knowledge.sources[0].primary.held, kv.breadth.held);
    // the Board 13 blocks are printed, and each CLIMB count is its verdict's own field
    for (const b of ['CLIMB', 'PLATEAU', 'CLOCK', 'DIRECT']) assert.ok(printed.some((l) => l.startsWith(b)), b + ' printed');
    assert.ok(printed.some((l) => l.startsWith('  TRUTH: ')), 'the tie-break truth printed');
    assert.equal(doc.split.contaminated, false);
    for (const s of doc.board.climb.sets) for (const r of [s.current, s.previous].filter(Boolean)) {
      const v = JSON.parse(readFileSync(path.join(ROOT, r.file), 'utf8'));
      const name = r.arm.name.split(' ')[0];
      const a = Array.isArray(v.arms) ? v.arms.find((x) => x.arm === name) : v.arms && v.arms.organism ? v.arms.organism : v.partial && v.partial.acc ? v.partial.acc.organism : { solved: v.solved, n: v.n };
      assert.equal(r.arm.correct, a.correct ?? a.passed ?? a.solved, r.file);
      assert.equal(r.arm.n, a.n, r.file);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
  const after = (() => { try { return statSync(real).mtimeMs; } catch { return null; } })();
  assert.equal(after, before, 'bench/verdicts/ladder.json is untouched by a test');
});

// ---------------------------------------------------------------- (o) and (p) the rows item verdict
// The first rows verdict was typed by hand from a gate that ended two minutes before
// notes/ladder.md was written; that note then failed test/findings.test.mjs, which the gate had
// never run against it. The verdict is now composed by node bench/ladder.mjs --rows, and a gate
// that started before an owned file changed is STALE and cannot meet the bar.
const T = (s) => Date.parse('2026-09-24T' + s + 'Z');
function rowsInputs() {
  const line = (label, ok) => label + (ok ? ' GREEN' : ' RED') + ': a row line';
  return {
    ladder: {
      at: '2026-09-24T01:00:00.000Z', command: 'node bench/ladder.mjs', isTheBar: true,
      board: {
        sets: [{ name: 'GSM8K', status: 'PARTIAL' }, { name: 'ARC-AGI-1 evaluation', status: 'whole' }],
        multiplying: { source: 'bench/verdicts/multiply.json', tieBreak: { measured: true, runs: [], picks: 0, sharedFitness: null, noise: null, moved: null, tieBreak: true, label: 'decided by tie-break noise, not a bar', rule: 'the rule' } },
        authored: { source: null, reason: 'none', perSourcePerDay: { rows: [] }, lastBoard: { newest: null } },
        knowledge: { sources: [{ name: 'simplewiki', status: 'not measured' }] },
        gaps: { at: '2026-09-24T01:00:00.000Z', windowDays: 7, sources: { ledger: 'state/self/gaps.jsonl', decisions: 'bench/verdicts/autopilot/*.jsonl', authored: 'state/self/authored.jsonl' }, ledger: { open: 12, unparsed: 0, withTrial: 9, byKind: { missed: 3, open: 9 } }, decisions: null, authored: null, closed: null },
        magnitude: { organism: { measured: false, reason: 'no bench/verdicts/soak.json' }, orchestrator: { measured: false, reason: 'not loaded' }, simulated: { measured: false, reason: 'no bench/verdicts/spread.json' } },
        undone: { at: '2026-09-24T01:00:00.000Z', windowDays: 7, sources: { ledger: 'l', brief: 'b', decisions: 'd', authored: 'a', resume: 'r', proposed: 'p/*.md' }, items: { total: 4, byBoard: { 13: 4 } }, attempts: null, plants: null, authoredOnItems: null, partial: null, proposed: null },
        climb: { source: 'docs/BOARDS.json', boardsRead: true, inProgress: 13, lastLanding: null, sets: ['GSM8K', 'HumanEval', 'ARC-AGI-1 evaluation'].map((name) => ({ key: name, name, files: 0, rows: [], current: null, previous: null, delta: null, thisBoard: { board: 13, measured: false }, unread: [], reason: 'no verdict file under bench/verdicts matches it' })) },
        plateau: { source: null, reason: 'no bench/verdicts/plateau.json or plateau-partial.json', baseline: null },
        clock: { curve: null, curveReason: 'no bench/verdicts/grid-clock.json or grid-clock-partial.json', whole: null, wholeReason: 'no bench/verdicts/grid-clock-whole.json or grid-clock-whole-partial.json', baseline: null },
        directRecall: { clean: null, cleanReason: 'no bench/verdicts/direct-clean.json or direct-clean-partial.json', swept: null, sweptReason: 'no bench/verdicts/native.json with wiki.arms' },
      },
    },
    gate: {
      command: 'node bench/gate.mjs', startedAt: '2026-09-24T02:00:00.000Z', at: '2026-09-24T02:05:12.000Z', verdict: 'GREEN',
      testsPassed: 2, testsTotal: 2, assertionsPassed: 37, assertionsFailed: 0, emDash: [], badImports: [],
      tests: [{ file: 'test/a.test.mjs', exit: 0, budget: { outcome: 'exit', peakRssMb: 88.5 } }, { file: 'test/b.test.mjs', exit: 0, budget: { outcome: 'exit', peakRssMb: 91.25 } }],
      rows: {
        budget: { ok: true, line: line('BUDGET', true) }, compress: { ok: true, line: line('COMPRESS', true) }, hisData: { ok: true, line: line('HIS DATA', true) },
        loadBearing: { ok: true, line: line('LOAD-BEARING', true) }, boundary: { ok: true, line: line('BOUNDARY', true) },
        autonomy: { ok: true, graded: true, rules: true, line: line('AUTONOMY', true) }, handoff: { ok: true, graded: true, rules: true, line: line('HANDOFF', true) },
        contamination: { ok: true, graded: true, rules: true, line: line('CONTAMINATION', true), counts: { bar: 2, withSplit: 2, noSplit: 0, splitNotObject: 0, contaminated: 0, labelled: 0, unlabelled: 0 }, noSplit: [], splitNotObject: [], labelled: [], unlabelled: [], causes: [] },
      },
      line: 'GATE GREEN: test files 2/2, assertions 37 pass / 0 fail',
    },
    tests: [
      { file: 'test/ladder.test.mjs', pass: 17, fail: 0, total: 17, exit: 0, ms: 6421, budget: { outcome: 'exit', peakRssMb: 612.75 } },
      { file: 'test/gate.test.mjs', pass: 6, fail: 0, total: 6, exit: 0, ms: 4210, budget: { outcome: 'exit', peakRssMb: 140.5 } },
      { file: 'test/gate-rows.test.mjs', pass: 9, fail: 0, total: 9, exit: 0, ms: 1730, budget: { outcome: 'exit', peakRssMb: 96.25 } },
      { file: 'test/gate-autonomy.test.mjs', pass: 11, fail: 0, total: 11, exit: 0, ms: 2210, budget: { outcome: 'exit', peakRssMb: 97.5 } },
      { file: 'test/gate-contamination.test.mjs', pass: 6, fail: 0, total: 6, exit: 0, ms: 1450, budget: { outcome: 'exit', peakRssMb: 95.75 } },
    ],
    owned: [{ file: 'bench/ladder.mjs', mtimeMs: T('00:30:00') }, { file: 'bench/gate.mjs', mtimeMs: T('00:31:00') }, { file: 'notes/ladder.md', mtimeMs: T('00:59:00') }],
    at: '2026-09-24T03:00:00.000Z',
  };
}
// every number the statement quotes is a field of the verdict, the rule a reader checks it by
function statementNumbersInFields(doc) {
  const fields = JSON.stringify({ ...doc, statement: '' });
  const nums = doc.statement.replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/g, ' ').match(/\d+(?:\.\d+)?/g) || [];
  return nums.filter((n) => !fields.includes(n));
}

test('(o) the rows verdict: met only when board, GREEN gate and tests all hold, and a stale gate is named', async () => {
  const { rowsVerdictOf } = await import('../bench/ladder.mjs');
  // met: everything holds and no owned file changed after the gate started
  const ok = rowsVerdictOf(rowsInputs());
  assert.equal(ok.met, true, ok.lines.join(' | '));
  assert.equal(ok.file, 'rows.json');
  assert.equal(ok.doc.isTheBar, true);
  for (const k of ['at', 'command', 'node', 'statement']) assert.equal(typeof ok.doc[k], 'string', k);
  assert.equal(ok.doc.statement.includes('\n'), false, 'one paragraph');
  assert.match(ok.doc.statement, /MET\.$/);
  assert.deepEqual(statementNumbersInFields(ok.doc), [], 'a statement number that is no field');

  // STALE: the note changed two minutes after the gate started, which is the first verdict's defect
  const st = rowsInputs();
  st.owned[2].mtimeMs = T('02:07:00');
  const stale = rowsVerdictOf(st);
  assert.equal(stale.met, false);
  assert.equal(stale.file, 'rows-partial.json');
  assert.equal(stale.doc.isTheBar, false);
  assert.deepEqual(stale.doc.stale.gate, ['notes/ladder.md']);
  assert.ok(stale.reasons.some((r) => r.startsWith('STALE') && r.includes('notes/ladder.md changed at 2026-09-24T02:07:00.000Z')), stale.reasons.join(' | '));
  // a file changed while the gate ran is stale too: the run may have graded it before the change,
  // so the start is the edge, not the end
  st.owned[2].mtimeMs = T('02:03:00');
  assert.equal(rowsVerdictOf(st).met, false, 'a file changed during the gate run is stale');
  // a file changed before the gate started is not stale
  st.owned[2].mtimeMs = T('01:59:59');
  assert.equal(rowsVerdictOf(st).met, true);
  // a board older than bench/ladder.mjs is stale too
  const lb = rowsInputs();
  lb.owned[0].mtimeMs = T('01:30:00');
  assert.ok(rowsVerdictOf(lb).reasons.some((r) => r.includes('before bench/ladder.mjs changed')));
  // no startedAt: what the run saw cannot be told, so the bar cannot be met from it
  const ns = rowsInputs();
  delete ns.gate.startedAt;
  assert.ok(rowsVerdictOf(ns).reasons.some((r) => r.includes('no startedAt')));

  // RED gate: the failing file, the kill, the red rows and the bad import are all named, with numbers from the fields
  const rd = rowsInputs();
  rd.gate.verdict = 'RED'; rd.gate.testsPassed = 1; rd.gate.assertionsFailed = 1;
  rd.gate.tests[1] = { file: 'test/b.test.mjs', exit: 1, pass: 3, fail: 1, budget: { outcome: 'killed', killed: 'ram', peakRssMb: 9650.2 } };
  rd.gate.rows.budget.ok = false; rd.gate.rows.hisData.ok = false;
  rd.gate.badImports = ['organism/x.mjs -> :'];
  const red = rowsVerdictOf(rd);
  assert.equal(red.met, false);
  assert.ok(red.reasons.includes('the gate is RED: 1 failing test file(s), red rows BUDGET, HIS DATA, 1 bad import(s)'), red.reasons.join(' | '));
  assert.ok(red.doc.statement.includes('test/b.test.mjs, killed on ram at 9650.2 MB'), red.doc.statement);
  assert.deepEqual(red.doc.parts.gate.redRows, ['BUDGET', 'HIS DATA']);
  assert.deepEqual(statementNumbersInFields(red.doc), [], 'a statement number that is no field');

  // a test file failing, one not run, a row missing from the gate, a red new row, or a block
  // missing from the board, each misses the bar on its own
  const tf = rowsInputs(); tf.tests[1].fail = 1; tf.tests[1].pass = 5; tf.tests[1].exit = 1;
  const tfv = rowsVerdictOf(tf);
  assert.equal(tfv.met, false);
  assert.ok(tfv.reasons.includes('test/gate.test.mjs did not pass: exit 1, pass 5, fail 1, tests 6'), tfv.reasons.join(' | '));
  const nt = rowsInputs(); nt.tests = [];
  assert.ok(rowsVerdictOf(nt).reasons.includes('no test file was run'));
  const one = rowsInputs(); one.tests = one.tests[0];
  assert.equal(rowsVerdictOf(one).met, true, 'a single run row is still read');
  const mr = rowsInputs(); delete mr.gate.rows.compress;
  assert.ok(rowsVerdictOf(mr).reasons.includes('the gate printed 7 of the 8 rows'));
  const nb = rowsInputs(); delete nb.gate.rows.loadBearing; delete nb.gate.rows.boundary;
  const nbv = rowsVerdictOf(nb);
  assert.ok(nbv.reasons.includes('the gate printed 6 of the 8 rows'), nbv.reasons.join(' | '));
  assert.deepEqual(nbv.doc.parts.gate.rowsPrinted, ['BUDGET', 'COMPRESS', 'HIS DATA', 'AUTONOMY', 'HANDOFF', 'CONTAMINATION']);
  const rb = rowsInputs(); rb.gate.verdict = 'RED'; rb.gate.rows.loadBearing = { ok: false, line: 'LOAD-BEARING RED: a row line' };
  assert.ok(rowsVerdictOf(rb).reasons.includes('the gate is RED: red rows LOAD-BEARING'));
  const mb = rowsInputs(); delete mb.ladder.board.knowledge; mb.ladder.board.authored = { share: 0.1 };
  const mbv = rowsVerdictOf(mb);
  assert.ok(mbv.reasons.includes('the board in ladder.json carries no AUTHORED, KNOWLEDGE block'), mbv.reasons.join(' | '));
  assert.deepEqual(mbv.doc.parts.ladder.blocks, ['MULTIPLYING', 'GAPS', 'MAGNITUDE', 'UNDONE', 'CLIMB', 'PLATEAU', 'CLOCK', 'DIRECT']);
  assert.deepEqual(ok.doc.parts.ladder.blocks, ['MULTIPLYING', 'AUTHORED', 'KNOWLEDGE', 'GAPS', 'MAGNITUDE', 'UNDONE', 'CLIMB', 'PLATEAU', 'CLOCK', 'DIRECT']);
  assert.equal(ok.doc.parts.tests.length, 5);
  assert.equal(ok.doc.board, 13);
  // Board 15: the verdict carries barMet at the top, a split, the printed blocks and the gate line
  assert.equal(ok.doc.barMet, true);
  assert.equal(stale.doc.barMet, false);
  assert.equal(typeof ok.doc.split.development, 'string');
  assert.equal(typeof ok.doc.split.heldOut, 'string');
  assert.ok(ok.doc.parts.printed.gaps[0].startsWith('GAPS ('), ok.doc.parts.printed.gaps[0]);
  assert.ok(ok.doc.parts.printed.gaps.includes('  open: 12 (missed 3, open 9), with a trial 9'), ok.doc.parts.printed.gaps.join(' | '));
  assert.ok(ok.doc.parts.printed.undone.includes('  board items undone: 4 (board 13 4)'), ok.doc.parts.printed.undone.join(' | '));
  assert.equal(ok.doc.parts.printed.magnitude[0], 'MAGNITUDE: the organism per wall hour beside the orchestrator and the simulated clock');
  assert.equal(ok.doc.parts.gate.gateLine, 'GATE GREEN: test files 2/2, assertions 37 pass / 0 fail');
  assert.equal(ok.doc.parts.gate.lines.autonomy, 'AUTONOMY GREEN: a row line');
  // a new row that printed N/A graded nothing: missed
  const na = rowsInputs(); na.gate.rows.autonomy = { ok: true, graded: false, rules: false, line: 'AUTONOMY N/A: not the installation' };
  const nav = rowsVerdictOf(na);
  assert.equal(nav.met, false);
  assert.ok(nav.reasons.includes('the AUTONOMY row(s) printed N/A, so the run graded no installation'), nav.reasons.join(' | '));
  // a red row printed as a referee leaves the gate GREEN and still misses the bar
  const rf = rowsInputs(); rf.gate.rows.handoff = { ok: false, graded: true, rules: false, line: 'HANDOFF RED (REFEREE, not ruling: a lock): x' };
  const rfv = rowsVerdictOf(rf);
  assert.equal(rfv.met, false);
  assert.ok(rfv.reasons.includes('red rows printed as referees (a live autopilot held the lock): HANDOFF'), rfv.reasons.join(' | '));
  // a ruling red row turns the gate red and is named
  const rh = rowsInputs(); rh.gate.verdict = 'RED'; rh.gate.rows.autonomy = { ok: false, graded: true, rules: true, line: 'AUTONOMY RED: x' };
  assert.ok(rowsVerdictOf(rh).reasons.includes('the gate is RED: red rows AUTONOMY'), rowsVerdictOf(rh).reasons.join(' | '));
  // Board 13: a MULTIPLYING block without the tie-break truth is not the block
  const mt = rowsInputs(); delete mt.ladder.board.multiplying.tieBreak;
  assert.ok(rowsVerdictOf(mt).reasons.includes('the board in ladder.json carries no MULTIPLYING block'), rowsVerdictOf(mt).reasons.join(' | '));
  const nc = rowsInputs(); delete nc.ladder.board.climb; delete nc.ladder.board.directRecall;
  assert.ok(rowsVerdictOf(nc).reasons.includes('the board in ladder.json carries no CLIMB, DIRECT block'), rowsVerdictOf(nc).reasons.join(' | '));
  // the printed blocks are rebuilt from ladder.json, and the verdict says it is not contaminated
  assert.equal(ok.doc.parts.printed.plateau[0], 'PLATEAU: not measured (no bench/verdicts/plateau.json or plateau-partial.json)');
  assert.ok(ok.doc.parts.printed.climb[0].startsWith('CLIMB: '), ok.doc.parts.printed.climb[0]);
  assert.equal(ok.doc.parts.printed.climb[1], '  GSM8K: not measured (no verdict file under bench/verdicts matches it)');
  assert.ok(ok.doc.parts.printed.tieBreak[0].startsWith('  TRUTH: decided by tie-break noise, not a bar'), ok.doc.parts.printed.tieBreak[0]);
  assert.equal(ok.doc.split.contaminated, false);
  // a ruling RED CONTAMINATION row misses the bar with every cause named, from the row's own fields
  const rc = rowsInputs(); rc.gate.verdict = 'RED';
  rc.gate.rows.contamination = {
    ok: false, graded: true, rules: true, line: 'CONTAMINATION RED: x', counts: { bar: 3, withSplit: 1, noSplit: 1, splitNotObject: 1, contaminated: 0, labelled: 0, unlabelled: 0 },
    noSplit: ['a.json'], splitNotObject: [{ file: 'b.json', split: 'string', value: 'evaluation' }], labelled: [], unlabelled: [],
    causes: ['1 bar file(s) with no split: a.json', '1 bar file(s) whose split is not an object: b.json (string "evaluation")'],
  };
  const rcv = rowsVerdictOf(rc);
  assert.equal(rcv.met, false);
  assert.ok(rcv.reasons.includes('CONTAMINATION: 1 bar file(s) with no split: a.json; 1 bar file(s) whose split is not an object: b.json (string "evaluation")'), rcv.reasons.join(' | '));
  assert.ok(rcv.reasons.includes('the gate is RED: red rows CONTAMINATION'), rcv.reasons.join(' | '));
  assert.deepEqual(rcv.doc.parts.gate.contamination.noSplit, ['a.json']);
  assert.deepEqual(rcv.doc.parts.gate.redRows, ['CONTAMINATION']);
  assert.deepEqual(statementNumbersInFields(rcv.doc), [], 'a statement number that is no field');
  // the same row as a referee leaves the gate GREEN and still misses, named twice: referee and causes
  const rr = rowsInputs(); rr.gate.rows.contamination = { ...rc.gate.rows.contamination, rules: false, line: 'CONTAMINATION RED (REFEREE, not ruling: a lock): x' };
  const rrv = rowsVerdictOf(rr);
  assert.equal(rrv.met, false);
  assert.ok(rrv.reasons.includes('red rows printed as referees (a live autopilot held the lock): CONTAMINATION'), rrv.reasons.join(' | '));
  assert.ok(rrv.reasons.some((r) => r.startsWith('CONTAMINATION: 1 bar file(s) with no split: a.json')), rrv.reasons.join(' | '));
  console.log('(o) met ' + ok.met + ', stale reasons ' + stale.reasons.length + ', red reasons ' + red.reasons.length + ', contamination reasons ' + rcv.reasons.length);
});

test('(p) runRows writes rows-partial.json when missed, rows.json once when met, and runs the ladder and gate tests', async () => {
  const { runRows, ROWS_OWNED, ROWS_TESTS } = await import('../bench/ladder.mjs');
  const { utimesSync } = await import('node:fs');
  const root = tmp();
  try {
    const vd = path.join(root, 'bench', 'verdicts');
    mkdirSync(vd, { recursive: true });
    const inp = rowsInputs();
    for (const f of ROWS_OWNED) {
      mkdirSync(path.dirname(path.join(root, f)), { recursive: true });
      writeFileSync(path.join(root, f), '// ' + f + '\n');
      utimesSync(path.join(root, f), new Date(T('00:30:00')), new Date(T('00:30:00')));
    }
    writeFileSync(path.join(vd, 'ladder.json'), JSON.stringify(inp.ladder));
    const red = { ...inp.gate, verdict: 'RED', rows: { ...inp.gate.rows, hisData: { ok: false, line: 'HIS DATA RED: a row line' } } };
    writeFileSync(path.join(vd, 'gate.json'), JSON.stringify(red));
    const ran = [];
    const runTests = async (file) => {
      const rel = path.relative(root, file).replaceAll('\\', '/');
      ran.push(rel);
      return { row: { ...inp.tests.find((t) => t.file === rel) }, out: '' };
    };
    const logs = [];
    const a = await runRows({ root, verdictsDir: vd, runTests, log: (l) => logs.push(l), at: inp.at });
    assert.deepEqual(ran, [...ROWS_TESTS]);
    assert.deepEqual(ROWS_TESTS, ['test/ladder.test.mjs', 'test/gate.test.mjs', 'test/gate-rows.test.mjs', 'test/gate-autonomy.test.mjs', 'test/gate-contamination.test.mjs']);
    assert.equal(a.met, false);
    const partial = JSON.parse(readFileSync(path.join(vd, 'rows-partial.json'), 'utf8'));
    assert.equal(partial.isTheBar, false);
    assert.equal(partial.barMet, false);
    assert.ok(partial.reasons.includes('the gate is RED: red rows HIS DATA'), partial.reasons.join(' | '));
    assert.ok(logs.some((l) => l.startsWith('ROWS MISSED')), logs.join(' | '));
    assert.ok(logs.some((l) => l.startsWith('wrote ') && l.includes('rows-partial.json')), logs.join(' | '));

    // GREEN: an earlier board's rows.json is copied aside first, then rows.json is written, and a
    // second met run leaves it byte for byte
    const board12 = JSON.stringify({ at: '2026-09-24T15:52:08.292Z', isTheBar: true, board: 12, met: true });
    writeFileSync(path.join(vd, 'rows.json'), board12);
    // an earlier board's partial file is kept aside too, though this run writes rows.json
    const partial15 = JSON.stringify({ at: '2026-09-26T05:36:42.000Z', isTheBar: false, board: 15, met: false });
    writeFileSync(path.join(vd, 'rows-partial.json'), partial15);
    writeFileSync(path.join(vd, 'gate.json'), JSON.stringify(inp.gate));
    const b = await runRows({ root, verdictsDir: vd, runTests, log: () => {}, at: inp.at });
    assert.equal(b.met, true, b.lines.join(' | '));
    const first = readFileSync(path.join(vd, 'rows.json'), 'utf8');
    assert.equal(JSON.parse(first).isTheBar, true);
    assert.equal(JSON.parse(first).barMet, true);
    assert.equal(JSON.parse(first).board, 13);
    assert.equal(readFileSync(path.join(vd, 'rows-board12.json'), 'utf8'), board12, 'the earlier board\'s verdict is kept, byte for byte');
    assert.equal(readFileSync(path.join(vd, 'rows-partial-board15.json'), 'utf8'), partial15, 'the earlier board\'s partial is kept, byte for byte');
    assert.equal(readFileSync(path.join(vd, 'rows-partial.json'), 'utf8'), partial15, 'a met run does not write rows-partial.json');
    const c = await runRows({ root, verdictsDir: vd, runTests, log: () => {}, at: '2026-09-24T04:00:00.000Z' });
    assert.equal(c.wrote, null, 'the bar file is written once');
    assert.equal(readFileSync(path.join(vd, 'rows.json'), 'utf8'), first);

    // a test file not in the tree is not run and misses the bar by name
    rmSync(path.join(root, 'test', 'gate-rows.test.mjs'));
    ran.length = 0;
    const d = await runRows({ root, verdictsDir: vd, runTests, log: () => {}, write: false, at: inp.at });
    assert.deepEqual(ran, ['test/ladder.test.mjs', 'test/gate.test.mjs', 'test/gate-autonomy.test.mjs', 'test/gate-contamination.test.mjs']);
    assert.equal(d.met, false);
    assert.ok(d.reasons.includes('test/gate-rows.test.mjs did not pass: not in the tree'), d.reasons.join(' | '));
    assert.equal(d.wrote, null);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// ---------------------------------------------------------------- (q) to (s) the Board 12 blocks
// Each block reads its verdict and prints what the verdict carries. The failure these guard is a
// missing verdict or a missing field printed as 0, which reads as a measured zero.
const NOT_ZERO = /(?:^|[\s(:,])0(?:[\s,;)/]|$)/;

test('(q) MULTIPLYING: none is not measured, a -partial one is PARTIAL and claims no bar, the whole one wins', () => {
  const dir = tmp();
  try {
    let m = multiplyOf({ dir });
    assert.equal(m.source, null);
    assert.deepEqual(multiplyingLines(m), ['MULTIPLYING: not measured (no bench/verdicts/multiply.json or multiply-partial.json)']);

    // partial only, with the single arm carrying no duplications, no evals and no kill
    put(dir, 'multiply-partial.json', {
      at: '2026-09-24T01:00:00.000Z', command: 'c', isTheBar: false, config: { wallS: 80, suite: { fresh: 'grid/velocity:heldout' } },
      bar: { met: true, singleFresh: 134, populationFresh: 133, freshT: 160, atOrAbove: false },
      arms: { population: { aliveAtEnd: { alive: 3, s: 79.5, ids: ['i0', 'i1', 'i2'] }, maxAlive: 3, duplications: 2 }, single: { aliveAtEnd: { alive: 1 } } },
    });
    m = multiplyOf({ dir });
    assert.equal(m.partial, true);
    assert.deepEqual(m.partialBecause, ['the file is named -partial', 'isTheBar false']);
    assert.equal(m.single.duplications, null, 'a missing number is null, not 0');
    let L = multiplyingLines(m);
    assert.match(L[0], /multiply-partial\.json, PARTIAL: the file is named -partial, isTheBar false, /);
    assert.ok(L.some((l) => l.includes('population 3 at 79.5 s (i0, i1, i2), at most 3 at once; single 1, at most n/a at once')), L.join(' | '));
    assert.ok(L.some((l) => l.includes('duplications: population 2, single n/a')), L.join(' | '));
    assert.ok(L.some((l) => l.includes('133/160 against 134/160 on grid/velocity:heldout, at or above no')), L.join(' | '));
    assert.ok(L.some((l) => l.startsWith('  kill: not recorded; bar met yes in a PARTIAL run, so it is not claimed')), L.join(' | '));
    for (const l of L) assert.equal(NOT_ZERO.test(l), false, 'no zero stands in for a missing number: ' + l);

    // the whole verdict is primary and the partial one is listed beside it
    put(dir, 'multiply.json', {
      at: '2026-09-24T02:00:00.000Z', command: 'node bench/multiply.mjs', isTheBar: true, modelCalls: 0, config: { wallS: 240, suite: { fresh: 'grid/velocity:heldout' }, spawnPlan: '1 then 2' },
      bar: { met: true, singleFresh: 134, populationFresh: 136, freshT: 160, atOrAbove: true, cameBack: true },
      kill: { id: 'i0', atS: 122, checkpointT: 1500, cameBack: true },
      arms: { population: { aliveAtEnd: { alive: 3, s: 237.7, ids: ['i0', 'i1', 'i2'] }, maxAlive: 3, duplications: 2, pick: { fresh: 136, freshT: 160 } }, single: { aliveAtEnd: { alive: 1, s: 239 }, maxAlive: 1, duplications: 0 } },
    });
    m = multiplyOf({ dir });
    assert.equal(m.partial, false);
    assert.equal(m.source.endsWith('multiply.json'), true);
    assert.equal(m.single.duplications, 0, 'a measured zero is printed as zero');
    L = multiplyingLines(m);
    assert.match(L[0], /multiply\.json, whole, isTheBar true, 2026-09-24T02:00:00\.000Z, 240 wall s per arm, model calls 0\):$/);
    assert.ok(L.some((l) => l.includes('136/160 against 134/160 on grid/velocity:heldout, at or above yes')), L.join(' | '));
    assert.ok(L.some((l) => l.includes('kill: i0 at 122 s, back from its checkpoint t=1500: yes; bar met yes')), L.join(' | '));
    assert.equal(L.some((l) => l.includes('not claimed')), false);
    assert.ok(L.some((l) => l.includes('also on disk: ') && l.includes('multiply-partial.json (partial, isTheBar false') && l.includes('population 133/160 against single 134/160')), L.join(' | '));
    assert.deepEqual(narrowReasons('multiply.json', { isTheBar: true, complete: false }), ['complete false']);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(r) AUTHORED: the share, patches per source per day, and days since the last board from each source', () => {
  const dir = tmp();
  try {
    const states = path.join(dir, 'state');
    mkdirSync(states);
    const boardsFile = path.join(dir, 'BOARDS.json');
    const now = Date.parse('2026-09-24T12:00:00.000Z');

    // nothing on disk: every line says not measured, and none prints a zero
    let au = authoredOf({ dir, boardsFile, states: [states], now });
    assert.equal(au.source, null);
    let L = authoredLines(au);
    assert.equal(L[0], 'AUTHORED: not measured (no bench/verdicts/authorship.json with a share)');
    assert.ok(L.includes('  patches proposed and kept per source per day: not measured (no bench/verdicts/authorship.json)'), L.join(' | '));
    assert.ok(L.some((l) => l.startsWith('  days since the last board: not measured (no board in authorship.json, ')), L.join(' | '));
    for (const l of L) assert.equal(NOT_ZERO.test(l), false, l);

    // a share with no per-day field, boards counted to 9, listed to 10, and markers for 11 and 12
    put(dir, 'authorship.json', {
      at: '2026-09-24T00:00:00.000Z', command: 'node tools/authorship.mjs', isTheBar: true, numerator: 0, denominator: 93, share: 0,
      organism: 0, kept: 0, boardFiles: 93, sources: { authored: { file: 'state/self/authored.jsonl', present: false } },
      boards: [{ board: 8, at: '2026-09-22T12:00:00Z' }, { board: 9, at: '2026-09-23T00:00:00Z' }],
    });
    writeFileSync(boardsFile, JSON.stringify([{ board: 9, at: '2026-09-23T00:00:00Z' }, { board: 10, at: '2026-09-23T12:00:00Z' }]));
    writeFileSync(path.join(states, 'board11.marker'), 'board 11 launched 2026-09-24T00:00:00Z by the chain\n');
    writeFileSync(path.join(states, 'board12.marker'), 'board 12 launched 2026-09-24T06:00:00.000Z\n');
    writeFileSync(path.join(states, 'board13.marker'), 'no launch time here\n');
    au = authoredOf({ dir, boardsFile, states: [states], now });
    assert.equal(au.share, 0);
    assert.equal(au.perSourcePerDay.rows.length, 0);
    assert.match(au.perSourcePerDay.reason, /carries no per-source per-day field .*; its input state\/self\/authored\.jsonl is not present$/);
    const lb = au.lastBoard;
    assert.equal(lb.newest.board, 12);
    assert.equal(lb.newest.kind, 'launched');
    assert.equal(lb.days, 0.25, 'six hours before noon');
    assert.equal(lb.counted.board, 9);
    assert.equal(lb.countedDays, 1.5);
    assert.equal(lb.listed.board, 10);
    assert.equal(lb.listedDays, 1);
    assert.deepEqual(lb.unlisted, [11, 12], 'a marker with no launch time is not a board');
    L = authoredLines(au);
    assert.ok(L[1].startsWith('  AUTHORED SHARE: 0 of 93 = 0.00% (kept patches with an organism author 0, kept patches of any author 0, files landed by boards 93)'), L[1]);
    assert.ok(L.some((l) => l.startsWith('  days since the last board: 0.25, read at 2026-09-24T12:00:00.000Z: board 12 launched 2026-09-24T06:00:00.000Z (')), L.join(' | '));
    assert.ok(L.some((l) => l.includes('the share counts boards up to board 9 landed 2026-09-23T00:00:00Z') && l.includes('1.5 days')), L.join(' | '));
    assert.ok(L.some((l) => l.startsWith('    boards 11, 12 have a launch marker and no ')), L.join(' | '));

    // per source per day, in each shape the extractor reads
    const rowsShape = perSourcePerDayOf({ perSourcePerDay: [{ day: '2026-09-24', source: 'organism', proposed: 4, kept: 1 }, { day: '2026-09-23', source: 'given', proposed: 2 }] });
    assert.deepEqual(rowsShape.rows, [{ day: '2026-09-23', source: 'given', proposed: 2, kept: null }, { day: '2026-09-24', source: 'organism', proposed: 4, kept: 1 }]);
    const daysShape = perSourcePerDayOf({ days: [{ date: '2026-09-24', sources: { organism: { proposed: 3, kept: 3 } } }] });
    assert.deepEqual(daysShape, { field: 'days', rows: [{ day: '2026-09-24', source: 'organism', proposed: 3, kept: 3 }] });
    const keyed = perSourcePerDayOf({ bySourceDay: { '2026-09-24': { organism: { proposed: 1, kept: 0 }, junk: 'x' } } });
    assert.deepEqual(keyed.rows, [{ day: '2026-09-24', source: 'organism', proposed: 1, kept: 0 }]);
    assert.deepEqual(perSourcePerDayOf(null), { field: null, rows: [] });
    put(dir, 'authorship.json', { at: 'a', isTheBar: false, numerator: 1, denominator: 4, share: 0.25, perDay: { '2026-09-24': { organism: { proposed: 5, kept: 1 } } } });
    au = authoredOf({ dir, boardsFile, states: [states], now });
    L = authoredLines(au);
    assert.match(L[0], /^AUTHORED \(.*authorship\.json, PARTIAL, a\):$/);
    assert.ok(L.includes('  patches proposed and kept per source per day (perDay, 1 day(s), the last 7 printed):'), L.join(' | '));
    assert.ok(L.includes('    2026-09-24: organism proposed 5, kept 1'), L.join(' | '));
    assert.equal(lastBoardOf({ boardsFile: path.join(dir, 'none.json'), states: [], now }).days, null);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(s) KNOWLEDGE: articles held per source, breadth and recall against null, a missing source not measured', () => {
  const dir = tmp();
  try {
    let k = knowledgeOf({ dir });
    assert.equal(k.measured, 0);
    assert.equal(k.heldTotal, null, 'no source measured is no total, not 0');
    let L = knowledgeLines(k);
    assert.equal(L[0], 'KNOWLEDGE: 0 of 2 sources measured, no articles held measured');
    assert.ok(L.includes('  simplewiki: not measured (no bench/verdicts/knowledge.json or knowledge-partial.json)'), L.join(' | '));
    assert.ok(L.includes('  enwiki: not measured (no bench/verdicts/knowledge-en.json or knowledge-en-partial.json)'), L.join(' | '));

    const verdict = (held, extra = {}) => ({
      at: '2026-09-24T01:00:00.000Z', command: 'node bench/knowledge.mjs', isTheBar: true,
      breadth: { held, articlesInDump: 1000, articlesRead: 1000, ratio: held / 1000 },
      grade: { n: 200, recall1: 0.625, recall5: 0.785, null1: 0.09, null5: 0.13 },
      dump: { file: 'simplewiki.xml.bz2', licence: 'CC BY-SA 4.0' }, ...extra,
    });
    // the enwiki run exists only as -partial: it is read, printed PARTIAL, and its held counts
    put(dir, 'knowledge.json', verdict(998));
    put(dir, 'knowledge-partial.json', verdict(500, { isTheBar: false }));
    put(dir, 'knowledge-en-partial.json', { at: '2026-09-24T02:00:00.000Z', isTheBar: false, breadth: { held: 40000 }, grade: {} });
    k = knowledgeOf({ dir });
    assert.equal(k.measured, 2);
    assert.equal(k.heldTotal, 40998);
    assert.deepEqual(k.sources.map((s) => s.status), ['whole', 'partial']);
    assert.equal(k.sources[1].primary.recall1, null);
    L = knowledgeLines(k);
    assert.equal(L[0], 'KNOWLEDGE: 2 of 2 sources measured, 40998 articles held (simplewiki, enwiki)');
    assert.ok(L.some((l) => l.startsWith('  simplewiki (') && l.includes('whole, isTheBar true') && l.includes('998 articles held of 1000 in the dump, breadth 0.998; recall@1 0.625 against null 0.09, recall@5 0.785 against null 0.13, n 200 (simplewiki.xml.bz2, CC BY-SA 4.0)')), L.join(' | '));
    assert.ok(L.some((l) => l.startsWith('    also on disk: ') && l.includes('knowledge-partial.json (PARTIAL: the file is named -partial, isTheBar false')), L.join(' | '));
    assert.ok(L.some((l) => l.startsWith('  enwiki (') && l.includes('PARTIAL: the file is named -partial, isTheBar false') && l.includes('40000 articles held of n/a in the dump, breadth n/a; recall@1 n/a against null n/a, recall@5 n/a against null n/a, n n/a')), L.join(' | '));
    for (const l of L.slice(1)) assert.equal(NOT_ZERO.test(l), false, l);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ---------------------------------------------------------------- (t) to (w) the Board 15 blocks
// A planted tree: a ledger, two decision files, an authored line, a soak and a spread verdict,
// brief and resume logs and a proposed board. Every number the blocks print is counted here by
// hand from what was planted.
const NOW15 = Date.parse('2026-09-26T12:34:56.789Z');
const H = 3_600_000;
const iso = (ms) => new Date(ms).toISOString();
function jsonl(file, rows) { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, rows.map((r) => JSON.stringify(r)).join('\n') + '\n'); }
function plant15() {
  const root = tmp();
  const dir = path.join(root, 'bench', 'verdicts');
  mkdirSync(dir, { recursive: true });
  jsonl(path.join(root, 'state', 'self', 'gaps.jsonl'), [
    { id: 'missed:a.json', kind: 'missed', trial: { command: 'node bench/a.mjs', bench: 'bench/a.mjs' } },
    { id: 'open:notes/x.md#1', kind: 'open', trial: null },
    { id: 'board-13:exit', kind: 'board item', board: 13, trial: 'node bench/exit.mjs --bar' },
    { id: 'board-15:resume', kind: 'board item', board: 15, trial: null },
    { id: 'never:p-partial.json', kind: 'bar never completed', verdictFile: 'bench/verdicts/p-partial.json' },
    { id: 'never:q-partial.json', kind: 'bar never completed', verdictFile: 'bench/verdicts/q-partial.json' },
  ]);
  const soakStart = NOW15 - 30 * H;
  jsonl(path.join(dir, 'autopilot', '2026-09-25.jsonl'), [
    { kind: 'self.code.auto', at: iso(soakStart + 0.1 * H), gap: 'missed:a.json', decision: 'refused', wall: 'test' },
    { kind: 'self.code.auto', at: iso(soakStart + 0.2 * H), gap: 'missed:a.json', decision: 'kept', operator: 'knob-tune', before: 3, after: 1, unit: 'ms', bar: 1, closed: true },
    { kind: 'notes.open', at: iso(soakStart + 0.3 * H), decision: 'refused', wall: 'plan' },
  ]);
  jsonl(path.join(dir, 'autopilot', '2026-09-10.jsonl'), [
    { kind: 'self.code.auto', at: iso(NOW15 - 10 * 24 * H), gap: 'open:notes/x.md#1', decision: 'refused', wall: 'test' },
  ]);
  jsonl(path.join(root, 'state', 'self', 'authored.jsonl'), [
    { at: iso(soakStart + 0.2 * H), gap: 'missed:a.json', operator: 'knob-tune', organism: true, before: 3, after: 1, toward: 2, bar: 4 },
  ]);
  put(dir, 'soak.json', { at: iso(soakStart + H), soak: { runId: 'r1', startedAt: iso(soakStart), updatedAt: iso(soakStart + 0.5 * H), elapsedMs: 0.5 * H } });
  put(dir, 'spread.json', { at: '2026-09-24T20:34:05.196Z', isTheBar: true, barMet: false, keptPerMillionOrganismYears: 12.5, improvementsKept: 25, organismYears: 2000000, generationsPerSecond: 4321.5, spreadGenerationsPerSecond: 8.25 });
  jsonl(path.join(root, 'state', 'self', 'brief', '2026-09-26.jsonl'), [
    { at: iso(NOW15 - 2 * H), kind: 'ask', gap: 'board-13:exit' },
    { at: iso(NOW15 - 2 * H), kind: 'decision', gap: 'board-13:exit', decision: 'refused', wall: 'test' },
    { at: iso(NOW15 - H), kind: 'decision', gap: 'board-13:exit', decision: 'refused', wall: 'budget' },
    { at: iso(NOW15 - H), kind: 'refusal', gap: 'board-13:exit', wall: 'plan' },
    { at: iso(NOW15 - H), kind: 'decision', gap: 'board-planted:clamp', decision: 'kept' },
    { at: iso(NOW15 - 9 * 24 * H), kind: 'decision', gap: 'board-13:exit', decision: 'refused', wall: 'gate' },
  ]);
  jsonl(path.join(root, 'state', 'self', 'resume.jsonl'), [
    { kind: 'resumed', at: iso(NOW15 - 3 * H), gaps: ['never:p-partial.json'], linesAdded: 9, recordsCompleted: 3, barLanded: false, notResumable: ['never:q-partial.json'] },
    { kind: 'resumed', at: iso(NOW15 - 2 * H), gaps: ['never:p-partial.json'], linesAdded: 6, recordsCompleted: 2, barLanded: false, notResumable: ['never:q-partial.json'] },
  ]);
  mkdirSync(path.join(root, 'docs', 'boards', 'proposed'), { recursive: true });
  writeFileSync(path.join(root, 'docs', 'boards', 'proposed', 'board-17.md'), '# BOARD 17\n\nat: 2026-09-26T02:26:03.947Z\n\nboard: 17\n\n## item a\n\ntext\n\n## item b\n\ntext\n');
  return { root, dir };
}
const ORCH = { ok: true, sources: ['docs/LOG.md', 'docs/BOARDS.json'], boards: 3, boardList: [1, 2, 3], barsMet: 2, windowFrom: '2026-09-20T00:00:00.000Z', windowTo: '2026-09-22T00:00:00.000Z', windowDays: 2, boardsPerDay: 1.5, barsMetPerDay: 1, boardsPerHour: 0.0625, barsMetPerHour: 0.0417 };

test('(t) GAPS: open, with a trial, attempted and kept in the last 7 days, closed with before, after and operator', () => {
  const { root, dir } = plant15();
  const empty = tmp();
  try {
    const g = gapsOf({ root, dir, now: NOW15 });
    assert.equal(g.ledger.open, 6);
    assert.equal(g.ledger.withTrial, 2, 'an object trial with a command and a board item trial string');
    assert.equal(g.decisions.attempted, 1, 'the 10-day-old decision and the gapless one are not attempts in the window');
    assert.equal(g.decisions.attempts, 2);
    assert.equal(g.decisions.kept, 1);
    assert.equal(g.decisions.files, 2);
    assert.deepEqual(g.closed, [{ gap: 'missed:a.json', before: 3, after: 1, unit: 'ms', bar: 1, operator: 'knob-tune', at: iso(NOW15 - 30 * H + 0.2 * H), source: 'bench/verdicts/autopilot/2026-09-25.jsonl' }]);
    const L = gapsLines(g);
    assert.ok(L.includes('  open: 6 (missed 1, open 1, board item 2, bar never completed 2), with a trial 2'), L.join(' | '));
    assert.ok(L.includes('  attempted in the last 7 days: 1 gaps in 2 decisions (refused 1, kept 1; 2 decision files, 4 lines)'), L.join(' | '));
    assert.ok(L.some((l) => l.startsWith('  kept: 1 in the last 7 days (1 gaps), 1 in all the decision files; state/self/authored.jsonl holds 1 lines, 1 with an organism author')), L.join(' | '));
    assert.ok(L.includes('    closed missed:a.json: before 3 after 1 ms (bar 1) by knob-tune, ' + iso(NOW15 - 30 * H + 0.2 * H) + ' (bench/verdicts/autopilot/2026-09-25.jsonl)'), L.join(' | '));
    // nothing on disk: not measured, never a zero
    const e = gapsLines(gapsOf({ root: empty, dir: path.join(empty, 'bench', 'verdicts'), now: NOW15 }));
    assert.ok(e.includes('  open: not measured (no state/self/gaps.jsonl)'), e.join(' | '));
    assert.ok(e.some((l) => l.startsWith('  attempted in the last 7 days: not measured')), e.join(' | '));
    assert.ok(e.some((l) => l.startsWith('  closed: not measured')), e.join(' | '));
    for (const l of e) assert.equal(NOT_ZERO.test(l), false, l);
  } finally { rmSync(root, { recursive: true, force: true }); rmSync(empty, { recursive: true, force: true }); }
});

test('(u) MAGNITUDE: the organism per wall hour of its soak beside the orchestrator and the simulated clock', () => {
  const { root, dir } = plant15();
  const empty = tmp();
  try {
    const m = magnitudeOf({ root, dir, orchestrator: ORCH });
    assert.equal(m.organism.wallHours, 0.5);
    assert.equal(m.organism.kept, 1);
    assert.equal(m.organism.keptDecisions, 1);
    assert.equal(m.organism.gapsMoved, 1);
    assert.equal(m.organism.distanceBarUnits, 0.5, 'toward 2 of a bar of 4');
    assert.equal(m.organism.attempts, 3, 'every decision line inside the 0.5 h soak window, the gapless notes one included');
    assert.equal(m.organism.attemptsPerHour, 6);
    assert.equal(m.organism.keptPerHour, 2);
    assert.equal(m.organism.distancePerHour, 1);
    const L = magnitudeLines(m);
    assert.ok(L.some((l) => l.startsWith('  organism: soak r1 (bench/verdicts/soak.json, ') && l.includes('0.5 wall hours): kept 1 (state/self/authored.jsonl, organism author) and 1 in bench/verdicts/autopilot/*.jsonl, gaps moved 1, distance moved 0.5 bar units')), L.join(' | '));
    assert.ok(L.some((l) => l.startsWith('    per wall hour: kept 2, gaps moved 2, distance 1 bar units')), L.join(' | '));
    assert.ok(L.includes('  orchestrator: 3 boards landed (1, 2, 3) and 2 bars met over 2 days (docs/LOG.md, docs/BOARDS.json, 2026-09-20T00:00:00.000Z to 2026-09-22T00:00:00.000Z): 1.5 boards per day, 1 bars met per day (0.0625 and 0.0417 per wall hour)'), L.join(' | '));
    assert.ok(L.includes('  simulated clock: 12.5 improvements kept per million organism-years (25 kept over 2000000 organism-years), 4321.5 generations per second (spread arm 8.25) (bench/verdicts/spread.json, 2026-09-24T20:34:05.196Z, isTheBar true, barMet false)'), L.join(' | '));
    // a kept line with no toward is not a zero distance
    jsonl(path.join(root, 'state', 'self', 'authored.jsonl'), [{ at: iso(NOW15 - 30 * H + 0.2 * H), gap: 'missed:a.json', organism: true }]);
    assert.equal(magnitudeOf({ root, dir, orchestrator: ORCH }).organism.distanceBarUnits, null);
    // nothing on disk and no orchestrator: three not measured lines, no zero
    const e = magnitudeLines(magnitudeOf({ root: empty, dir: path.join(empty, 'bench', 'verdicts'), orchestrator: null }));
    assert.deepEqual(e.slice(1), [
      '  organism: not measured (no bench/verdicts/soak.json)',
      '  orchestrator: not measured (bench/autopilot.mjs orchestratorRate could not be loaded)',
      '  simulated clock: not measured (no bench/verdicts/spread.json)',
    ]);
    assert.ok(magnitudeLines(magnitudeOf({ root: empty, dir, orchestrator: { ok: false, reason: 'no docs/LOG.md under x' } })).includes('  orchestrator: not measured (no docs/LOG.md under x)'));
  } finally { rmSync(root, { recursive: true, force: true }); rmSync(empty, { recursive: true, force: true }); }
});

test('(v) UNDONE: board items per board, attempts with their walls, partial bars resumed, proposed boards', () => {
  const { root, dir } = plant15();
  const empty = tmp();
  try {
    const u = undoneOf({ root, dir, now: NOW15 });
    assert.deepEqual(u.items, { total: 2, byBoard: { 13: 1, 15: 1 } });
    assert.equal(u.attempts.gaps, 1);
    assert.equal(u.attempts.attempts, 2, 'the 9-day-old decision is outside the window and the refusal line is not an attempt');
    assert.equal(u.attempts.refused, 2);
    assert.deepEqual(u.attempts.walls, { test: 1, budget: 1 });
    assert.equal(u.plants.kept, 1);
    const p = u.partial.bars.find((b) => b.gap === 'never:p-partial.json');
    assert.equal(p.runs, 2);
    assert.equal(p.linesResumed, 15);
    assert.equal(p.recordsCompleted, 5);
    assert.equal(u.partial.bars.find((b) => b.gap === 'never:q-partial.json').notResumable, true);
    assert.deepEqual(u.proposed, [{ file: 'docs/boards/proposed/board-17.md', board: 17, items: 2, at: '2026-09-26T02:26:03.947Z' }]);
    const L = undoneLines(u);
    assert.ok(L.includes('  board items undone: 2 (board 13 1, board 15 1)'), L.join(' | '));
    assert.ok(L.includes('  attempted by the organism in the last 7 days: 1 board items in 2 attempts, kept 0, refused 2 (walls hit: test 1, budget 1); authored lines on a board item 0'), L.join(' | '));
    assert.ok(L.includes('    board-13:exit: attempts 2, kept 0, refused 2 at test 1, budget 1, last ' + iso(NOW15 - H)), L.join(' | '));
    assert.ok(L.includes('  bench plants (not board items): 1 planted items in 1 attempts, kept 1, refused 0'), L.join(' | '));
    assert.ok(L.some((l) => l.startsWith('  partial bars (kind bar never completed): 2; resume log 2 lines, 1 of them resumed by 2 distinct resume runs (lines resumed 15, records completed 5;')), L.join(' | '));
    assert.ok(L.includes('    never:p-partial.json: 2 resume runs, lines resumed 15, records completed 5, last ' + iso(NOW15 - 2 * H) + ', bar landed no'), L.join(' | '));
    assert.ok(L.includes('    never:q-partial.json: no resume run; the resume log names it not resumable'), L.join(' | '));
    assert.ok(L.includes('    docs/boards/proposed/board-17.md: board 17, 2 items, at 2026-09-26T02:26:03.947Z'), L.join(' | '));
    // nothing on disk: every part not measured, never a zero
    const e = undoneLines(undoneOf({ root: empty, dir: path.join(empty, 'bench', 'verdicts'), now: NOW15 }));
    assert.ok(e.includes('  board items undone: not measured (no state/self/gaps.jsonl)'), e.join(' | '));
    assert.ok(e.some((l) => l.startsWith('  attempted by the organism in the last 7 days: not measured')), e.join(' | '));
    assert.ok(e.includes('  partial bars: not measured (no state/self/gaps.jsonl)'), e.join(' | '));
    assert.ok(e.includes('  proposed boards: not measured (no docs/boards/proposed/)'), e.join(' | '));
    for (const l of e) assert.equal(NOT_ZERO.test(l), false, l);
    // a ledger with partial bars but no resume log: lines resumed not measured, not zero
    rmSync(path.join(root, 'state', 'self', 'resume.jsonl'));
    const nr = undoneLines(undoneOf({ root, dir, now: NOW15 }));
    assert.ok(nr.some((l) => l.includes('resume log not measured (no state/self/resume.jsonl)')), nr.join(' | '));
    assert.ok(nr.includes('    never:p-partial.json: lines resumed not measured'), nr.join(' | '));
  } finally { rmSync(root, { recursive: true, force: true }); rmSync(empty, { recursive: true, force: true }); }
});

test('(w) AUTHORED SHARE names the boards its denominator counts, and the board carries the three new blocks', async () => {
  const dir = tmp();
  try {
    put(dir, 'authorship.json', {
      at: '2026-09-26T01:38:52.685Z', command: 'node tools/authorship.mjs', isTheBar: true, numerator: 1, denominator: 94, share: 1 / 94, organism: 1, kept: 1, boardFiles: 93,
      boards: [{ board: 8, files: 56, launched: true }, { board: 9, files: 37, launched: true }, { board: 13, files: 0, launched: false }],
      missingBoards: [{ board: 15, source: 'docs/boards/board-15.js' }],
    });
    const L = authoredLines(authoredOf({ dir, boardsFile: path.join(dir, 'none.json'), states: [], now: NOW15 }));
    assert.ok(L[1].endsWith('; the denominator counts the files of boards 8 (56), 9 (37), not launched 13, not in it 15 (docs/boards/board-15.js)'), L[1]);
    put(dir, 'authorship.json', { at: 'a', isTheBar: true, numerator: 1, denominator: 4, share: 0.25 });
    const M = authoredLines(authoredOf({ dir, boardsFile: path.join(dir, 'none.json'), states: [], now: NOW15 }));
    assert.ok(M[1].endsWith('; the boards of the denominator: not measured (bench/verdicts/authorship.json carries no boards list)') || M[1].includes('the boards of the denominator: not measured'), M[1]);
    // the whole board on a planted tree carries and prints the three blocks
    const { root, dir: vd } = plant15();
    try {
      const b = await boardOf({ dir: vd, root, states: [], now: NOW15, orchestrator: ORCH, publishedFile: path.join(root, 'none.json'), logFile: path.join(root, 'none.md'), boardsFile: path.join(root, 'none.json') });
      const P = boardLines(b);
      for (const k of ['GAPS (', 'MAGNITUDE: ', 'UNDONE (']) assert.ok(P.some((l) => l.startsWith(k)), k + ' printed');
      assert.equal(b.gaps.ledger.open, 6);
      assert.equal(b.undone.items.total, 2);
      assert.equal(b.magnitude.orchestrator.boards, 3);
    } finally { rmSync(root, { recursive: true, force: true }); }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ---------------------------------------------------------------- (x) to (ab) the Board 13 blocks
// Each reads its verdict and prints what it carries: "not measured" for a missing verdict, PARTIAL
// for a narrow one, n/a and never 0 for a number it does not carry. CLIMB's board of a verdict is
// its board field, else its landing window in docs/BOARDS.json; the tie-break truth is held to the
// real notes/multiply.md and bench/verdicts/multiply.json.
const okRows = (c, n) => Array.from({ length: n }, (_, i) => ({ ok: i < c, ms: 1, provenance: 'model' }));
function boards13(dir) {
  const f = path.join(dir, 'BOARDS.json');
  writeFileSync(f, JSON.stringify([
    { board: 10, at: '2026-09-23T22:00:00Z', launched: true }, { board: 11, at: '2026-09-24T13:40:00Z', launched: true },
    { board: 14, at: null, launched: false }, { board: 13, at: null, launched: false },
  ]));
  return f;
}

test('(x) CLIMB: the newest board against the one before with both intervals, partial and not measured named, never a zero', () => {
  const dir = tmp();
  try {
    const boardsFile = boards13(dir);
    const vd = path.join(dir, 'verdicts');
    mkdirSync(vd);
    let c = climbOf({ dir: vd, boardsFile });
    assert.equal(c.inProgress, 13, 'the lowest board with no landing is the board in progress');
    let L = climbLines(c);
    assert.equal(L.length, 4, L.join(' | '));
    for (const l of L.slice(1)) assert.match(l, /^ {2}(GSM8K|HumanEval|ARC-AGI-1 evaluation): not measured \(no verdict file under /);
    for (const l of L) assert.equal(NOT_ZERO.test(l), false, l);

    // the landing windows: the first landing takes everything before it, after the last is the board in progress
    const w = boardWindowsOf(boardsFile);
    assert.deepEqual(boardOfVerdict({ at: '2026-09-20T00:00:00Z' }, w), { board: 10, how: 'landing window', orEarlier: true, inProgress: false });
    assert.equal(boardOfVerdict({ at: '2026-09-23T22:00:00Z' }, w).board, 10, 'a verdict at the landing instant is that board');
    assert.equal(boardOfVerdict({ at: '2026-09-23T22:00:00.001Z' }, w).board, 11);
    assert.deepEqual(boardOfVerdict({ at: '2026-09-25T00:00:00Z' }, w), { board: 13, how: 'after the last landing', orEarlier: false, inProgress: true });
    assert.equal(boardOfVerdict({ at: '2026-09-25T00:00:00Z', board: 11 }, w).board, 11, 'a board field wins over the window');
    assert.equal(boardOfVerdict({}, w).board, null);

    // GSM8K: a partial sample on Board 10 against the whole set on the board in progress: up, decided
    put(vd, 'public-gsm8k-smoke-partial.json', publicVerdict({ at: '2026-09-20T00:00:00.000Z', n: 30, of: 1319, isTheBar: false, rows: okRows(15, 30) }));
    put(vd, 'public-gsm8k.json', publicVerdict({ at: '2026-09-25T00:00:00.000Z', n: 1319, of: 1319, rows: okRows(1100, 1319) }));
    // HumanEval: one board only
    put(vd, 'public-humaneval-partial.json', publicVerdict({ at: '2026-09-24T00:00:00.000Z', n: 30, of: 161, isTheBar: false, rows: okRows(23, 30) }));
    // ARC: Board 10's evaluation run, Board 11's library run (arms as a list, no of) and a newer partial
    // of the same board, and a run whose two intervention arms cannot be read as one
    put(vd, 'grid-evaluation.json', { at: '2026-09-23T21:00:00.000Z', isTheBar: true, model: null, solved: 71, n: 400, of: 400 });
    put(vd, 'grid-library.json', { at: '2026-09-24T10:00:00.000Z', isTheBar: true, model: null, arms: [{ arm: 'base', solved: 71, n: 400 }, { arm: 'library', label: 'library run 1', solved: 73, n: 400 }, { arm: 'base', solved: 71, n: 400 }] });
    put(vd, 'grid-library-partial.json', { at: '2026-09-24T11:00:00.000Z', isTheBar: false, model: null, arms: [{ arm: 'base', solved: 71, n: 400 }, { arm: 'library', solved: 70, n: 400 }] });
    put(vd, 'public-arc-crossover-partial.json', { at: '2026-09-24T12:00:00.000Z', isTheBar: false, model: null, arms: [{ arm: 'library', solved: 70, n: 400 }, { arm: 'crossover', solved: 72, n: 400 }] });
    c = climbOf({ dir: vd, boardsFile });
    const [g, h, a] = c.sets;
    assert.equal(g.current.board, 13);
    assert.equal(g.current.inProgress, true);
    assert.equal(g.current.status, 'whole');
    assert.equal(g.previous.board, 10);
    assert.equal(g.previous.orEarlier, true);
    assert.equal(g.previous.status, 'PARTIAL');
    assert.equal(g.delta.points, Math.round((1100 / 1319 - 15 / 30) * 10000) / 100);
    assert.equal(g.delta.decided, 'up', 'the whole-set interval sits above the sample one');
    assert.equal(g.delta.partial, true);
    assert.equal(g.thisBoard.measured, true);
    assert.equal(h.previous, null);
    assert.equal(h.delta, null);
    assert.equal(a.current.file.endsWith('grid-library.json'), true, 'the whole verdict of a board wins over its newer partial one');
    assert.equal(a.current.arm.name, 'library (library run 1)');
    assert.equal(a.current.arm.correct, 73);
    assert.equal(a.current.of, 400, 'a verdict with no of is held to the largest of its set');
    assert.equal(a.previous.arm.correct, 71);
    assert.deepEqual(a.unread.map((u) => u.reason), ['intervention arms library, crossover: no one arm to read']);
    assert.equal(a.delta.decided, null, 'overlapping intervals decide nothing');
    L = climbLines(c);
    const at = (name) => L.slice(L.findIndex((l) => l.startsWith('  ' + name)));
    const G = at('GSM8K');
    const iv = wilson95(1100, 1319);
    assert.equal(G[0], '  GSM8K:');
    assert.ok(G[1].startsWith('    newest, board 13 (in progress): whole, '), G[1]);
    assert.ok(G[1].endsWith(': organism 1100/1319 = ' + (1100 / 1319 * 100).toFixed(2) + '% [' + (iv.lo * 100).toFixed(2) + ', ' + (iv.hi * 100).toFixed(2) + ']'), G[1]);
    assert.ok(G[2].startsWith('    before: board 10 or earlier: PARTIAL (the file is named -partial, isTheBar false, a sample of 30 of 1319), '), G[2]);
    assert.ok(G[3].startsWith('    delta: +' + g.delta.points.toFixed(2) + ' points (83.40 against 50.00), up, the intervals separate; partial: a sample on at least one side'), G[3]);
    const Hh = at('HumanEval');
    assert.equal(Hh[0], '  HumanEval: board 13 (in progress): not measured, no HumanEval verdict after the last landing (board 11 at 2026-09-24T13:40:00Z)');
    assert.equal(Hh[2], '    before: not measured (no earlier board holds a HumanEval verdict with an organism count)');
    assert.equal(Hh[3], '    delta: not measured (one board only)');
    const A = at('ARC-AGI-1');
    assert.ok(A[3].startsWith('    delta: +0.50 points (18.25 against 17.75), the intervals overlap (undecided); whole against whole'), A[3]);
    assert.ok(A[4].startsWith('    not read (no organism count): ') && A[4].endsWith('public-arc-crossover-partial.json'), A[4]);
    for (const l of [...Hh.slice(0, 4), ...A.slice(0, 5)]) assert.equal(NOT_ZERO.test(l), false, l);
    // a model change is named on the delta
    put(vd, 'public-humaneval.json', publicVerdict({ at: '2026-09-25T00:00:00.000Z', n: 161, of: 161, rows: okRows(120, 161), model: 'qwen3:30b-a3b' }));
    const hv = climbLines(climbOf({ dir: vd, boardsFile })).find((l) => l.startsWith('    delta:') && l.includes('models differ'));
    assert.ok(hv && hv.includes('the models differ (qwen3:30b-a3b against qwen3:1.7b)'), String(hv));
    // an unreadable BOARDS.json says so: every verdict is then the board in progress, which is unknown
    const u = climbOf({ dir: vd, boardsFile: path.join(dir, 'none.json') });
    assert.equal(u.boardsRead, false);
    assert.ok(climbLines(u)[0].includes('none.json could not be read'), climbLines(u)[0]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(y) PLATEAU: the plateau verdict by its own fields beside Board 11\'s first plateau, not measured when absent', () => {
  const dir = tmp();
  try {
    let L = plateauLines(plateauOf({ dir }));
    assert.deepEqual(L, ['PLATEAU: not measured (no bench/verdicts/plateau.json or plateau-partial.json)', '  Board 11 baseline: not measured (no bench/verdicts/years.json with bar.perPlane)']);
    for (const l of L) assert.equal(NOT_ZERO.test(l), false, l);
    put(dir, 'years.json', { at: '2026-09-24T09:22:14.434Z', isTheBar: true, bar: { perPlane: [{ plane: 'grid', firstPlateauS: 0.40016879999637606, start: 49, end: 148, organismYears: 704435 }, { plane: 'synthetic', firstPlateauS: null, start: 89, end: 256 }] } });
    put(dir, 'plateau-partial.json', { at: '2026-09-26T01:00:00.000Z', command: 'node bench/plateau.mjs --quick', isTheBar: false, perPlane: [{ plane: 'grid', plateauS: 12.5, gainedAfter: 7, noise: 2 }, { plane: 'synthetic', plateauS: null, gainedAfter: 0 }], statement: 'plateau 99 in prose is not read' });
    L = plateauLines(plateauOf({ dir }));
    assert.ok(L[0].startsWith('PLATEAU (') && L[0].includes('plateau-partial.json, PARTIAL: the file is named -partial, isTheBar false, 2026-09-26T01:00:00.000Z)'), L[0]);
    assert.equal(L[1], '  perPlane[0]: plane "grid", plateauS 12.5, gainedAfter 7, noise 2');
    assert.equal(L[2], '  perPlane[1]: plane "synthetic", gainedAfter 0', 'a null field is not printed, a measured zero is');
    assert.ok(L[3].endsWith('grid plane first plateau 0.400 s, score 49 to 148 over 704435 organism-years; synthetic plane first plateau n/a, score 89 to 256 over n/a organism-years'), L[3]);
    assert.equal(L.some((l) => l.includes('99')), false, 'the statement is prose, not a field');
    put(dir, 'plateau.json', { at: '2026-09-26T02:00:00.000Z', isTheBar: true, barMet: false, plateauS: 30, gainedAfterPlateau: 3 });
    L = plateauLines(plateauOf({ dir }));
    assert.ok(L[0].includes('plateau.json, whole, isTheBar true, 2026-09-26T02:00:00.000Z, barMet false)'), L[0]);
    assert.equal(L[1], '  (top): plateauS 30, gainedAfterPlateau 3');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(z) CLOCK: solved against clock and the whole-400 count by their own fields beside Board 11\'s library run', () => {
  const dir = tmp();
  try {
    let L = clockLines(clockOf({ dir }));
    assert.deepEqual(L, [
      'CLOCK: solved against clock on the ARC evaluation set, and the whole-400 count',
      '  curve: not measured (no bench/verdicts/grid-clock.json or grid-clock-partial.json)',
      '  whole 400: not measured (no bench/verdicts/grid-clock-whole.json or grid-clock-whole-partial.json)',
      '  Board 11 baseline: not measured (no bench/verdicts/grid-library.json with its arms)',
    ]);
    for (const l of L) assert.equal(NOT_ZERO.test(l), false, l);
    put(dir, 'grid-library.json', { at: '2026-09-24T10:04:57.617Z', isTheBar: true, budgetMs: 3000, noise: 0, arms: [{ arm: 'base', solved: 71, n: 400 }, { arm: 'library', solved: 73, n: 400, timedOut: 319, foundButWrong: 7 }, { arm: 'base', solved: 71, n: 400 }] });
    put(dir, 'grid-clock.json', { at: '2026-09-26T03:00:00.000Z', isTheBar: true, curve: [{ clockMs: 3000, solved: 73 }, { clockMs: 30000, solved: 80, timedOut: 250 }] });
    put(dir, 'grid-clock-whole-partial.json', { at: '2026-09-26T04:00:00.000Z', isTheBar: false, n: 120, of: 400, solved: 30 });
    L = clockLines(clockOf({ dir }));
    assert.ok(L[1].startsWith('  curve (') && L[1].endsWith('grid-clock.json, whole, isTheBar true, 2026-09-26T03:00:00.000Z):'), L[1]);
    assert.equal(L[2], '    curve[0]: clockMs 3000, solved 73');
    assert.equal(L[3], '    curve[1]: clockMs 30000, solved 80, timedOut 250');
    assert.ok(L[4].includes('grid-clock-whole-partial.json, PARTIAL: the file is named -partial, isTheBar false, 2026-09-26T04:00:00.000Z'), L[4]);
    assert.equal(L[5], '    (top): solved 30');
    assert.ok(L[6].endsWith(', clock 3000 ms per task: library 73 of 400 solved, 319 timed out, 7 found but wrong; no-library runs 71 and 71, noise 0'), L[6]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(aa) DIRECT: the leak-free recall beside the swept table, its control and null', () => {
  const dir = tmp();
  try {
    let L = directRecallLines(directRecallOf({ dir }));
    assert.deepEqual(L, [
      'DIRECT: recall@1 with no model call, the leak-free table beside the swept one and null',
      '  leak-free (filled only from asks): not measured (no bench/verdicts/direct-clean.json or direct-clean-partial.json)',
      '  swept (Board 11): not measured (no bench/verdicts/native.json with wiki.arms)',
    ]);
    for (const l of L) assert.equal(NOT_ZERO.test(l), false, l);
    put(dir, 'native.json', { at: '2026-09-24T08:58:51.160Z', isTheBar: true, wiki: { n: 200, arms: { direct: { recallAt1: 122, direct: 176, directCorrect: 122 }, control: { recallAt1: 122, direct: 0 }, none: { recallAt1: 0 } } }, timing: { hitNsMedian: 42.89, missNsMedian: 15.38 }, fill: { of: 284749, drawnInControl: 0 } });
    put(dir, 'direct-clean.json', { at: '2026-09-26T05:00:00.000Z', isTheBar: true, arms: { clean: { recallAt1: 40, n: 200, directHits: 45 }, null: { recallAt1: 0, n: 200 } }, overlap: { leakedTitles: 0 } });
    L = directRecallLines(directRecallOf({ dir }));
    assert.ok(L[1].startsWith('  leak-free (') && L[1].endsWith('direct-clean.json, whole, isTheBar true, 2026-09-26T05:00:00.000Z):'), L[1]);
    assert.equal(L[2], '    arms.clean: recallAt1 40, directHits 45');
    assert.equal(L[3], '    arms.null: recallAt1 0');
    assert.equal(L[4], '    overlap: leakedTitles 0');
    const iv = (c, n) => '[' + (wilson95(c, n).lo * 100).toFixed(2) + ', ' + (wilson95(c, n).hi * 100).toFixed(2) + ']';
    assert.ok(L[5].endsWith('): the table 122 of 200 ' + iv(122, 200) + ' with 176 direct hits (122 correct), 42.89 ns median per hit, 15.38 ns per miss; filled by sweeping 284749 titles, the drawn ones included, so it is memoisation of the tier'), L[5]);
    assert.equal(L[6], '  control (the swept table with the drawn titles left out) 122 of 200 ' + iv(122, 200) + ' with 0 direct hits; null 0 of 200 ' + iv(0, 200));
    // an arm the verdict does not carry is n/a, never 0
    put(dir, 'native.json', { at: 'a', wiki: { n: 200, arms: { direct: { recallAt1: 122 } } } });
    L = directRecallLines(directRecallOf({ dir }));
    assert.ok(L[L.length - 1].startsWith('  control (the swept table with the drawn titles left out) n/a with n/a direct hits; null n/a'), L[L.length - 1]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(ab) MULTIPLYING truth: one searched fitness or no printed noise is tie-break noise, not a bar; the real Board 12 runs', () => {
  const dir = tmp();
  try {
    const vd = path.join(dir, 'bench', 'verdicts');
    mkdirSync(vd, { recursive: true });
    let t = tieBreakOf({ dir: vd });
    assert.equal(t.measured, false);
    assert.equal(t.tieBreak, null);
    assert.deepEqual(tieBreakLines(t), ['  TRUTH: not measured (no whole run: neither notes/multiply.md nor bench/verdicts/multiply.json holds one)']);
    // the builder's note beside this tree's verdicts, and the rerun's bar file: gaps of opposite sign, one fitness
    mkdirSync(path.join(dir, 'notes'));
    writeFileSync(path.join(dir, 'notes', 'multiply.md'), [
      '# multiply', '', '[bar] single: 134/160 fresh (s0, 598 searched)', '[bar] population pick by the searched objective: 133/160 fresh (i0, 598 searched)', '',
      '- **Every instance of both arms ended on the same searched score:** 598/640, length 96, fitness 0.9320403696498054. More.',
      '- On the four other fresh draws the means were 133.5 (population) and 137 (single).',
    ].join('\n'));
    const pick = (fitness, fresh, freshMoreMean) => ({ fitness, fresh, freshT: 160, freshMoreMean });
    const same = { single: { pick: pick(0.9320403696498054, 134, 137) }, population: { pick: pick(0.9320403696498054, 136, 137.25) } };
    const mv = (o = {}) => ({ at: '2026-09-24T14:36:34.385Z', isTheBar: true, config: { wallS: 240 }, bar: { met: true, singleFresh: 134, populationFresh: 136, freshT: 160 }, arms: same, ...o });
    put(vd, 'multiply.json', mv());
    t = tieBreakOf({ dir: vd });
    assert.equal(t.label, 'decided by tie-break noise, not a bar');
    assert.deepEqual(t.runs.map((r) => [r.who, r.population, r.single, r.gap]), [['builder', 133, 134, -1], ['bar file', 136, 134, 2]]);
    assert.equal(t.sharedFitness, 0.9320403696498054);
    assert.equal(t.picks, 4);
    assert.deepEqual(t.moved, { population: 3, single: 0 });
    let L = tieBreakLines(t);
    assert.equal(L[0], '  TRUTH: decided by tie-break noise, not a bar (the label lifts only when a run prints its seed-to-seed noise and a gap wider than it, between picks of different searched fitness)');
    assert.ok(L[1].includes('multiply.md:3,4): population 133/160 against single 134/160, gap -1; pick fitness single 0.9320403696498054, population 0.9320403696498054 (') && L[1].endsWith('multiply.md:6); mean over the other fresh draws population 133.5, single 137'), L[1]);
    assert.ok(L[2].includes('240 wall s per arm): population 136/160 against single 134/160, gap +2'), L[2]);
    assert.ok(L[3].includes('every one of the 4 picks with a recorded fitness shares one searched fitness, 0.9320403696498054') && L[3].includes('moved the population pick by 3 and the single by 0') && L[3].endsWith('seed-to-seed noise printed by no run, so no gap is called real'), L[3]);
    // a printed noise does not lift it while the picks share one fitness
    put(vd, 'multiply.json', mv({ seedNoise: 1 }));
    t = tieBreakOf({ dir: vd });
    assert.equal(t.noise, 1);
    assert.equal(t.tieBreak, true);
    // one fitness still holds it with the note gone: the rerun's gap of 2 is wider than a noise of 1
    rmSync(path.join(dir, 'notes', 'multiply.md'));
    t = tieBreakOf({ dir: vd });
    assert.deepEqual([t.runs.length, t.runs[0].gap, t.noise, t.sharedFitness], [1, 2, 1, 0.9320403696498054]);
    assert.equal(t.tieBreak, true, 'a gap wider than the noise between picks of one searched fitness is still the tie-break');
    // different fitness and no printed noise: still the tie-break
    const diff = { single: { pick: pick(0.9, 134, 137) }, population: { pick: pick(0.95, 140, 141) } };
    const bar140 = { met: true, singleFresh: 134, populationFresh: 140, freshT: 160 };
    put(vd, 'multiply.json', mv({ arms: diff, bar: bar140 }));
    t = tieBreakOf({ dir: vd });
    assert.equal(t.sharedFitness, null);
    assert.equal(t.tieBreak, true);
    // the control: different fitness and a printed noise narrower than the gap lifts the label, and a gap inside it does not
    put(vd, 'multiply.json', mv({ arms: diff, bar: bar140, seedNoise: 2 }));
    t = tieBreakOf({ dir: vd });
    assert.equal(t.tieBreak, false);
    assert.equal(t.label, 'decided by a gap wider than the seed-to-seed noise');
    put(vd, 'multiply.json', mv({ arms: diff, bar: bar140, bar2: 0, seedNoise: 6 }));
    assert.equal(tieBreakOf({ dir: vd }).tieBreak, true, 'a gap of 6 inside a noise of 6 is not real');
    // a partial run alone is printed and measures nothing
    rmSync(path.join(vd, 'multiply.json'));
    put(vd, 'multiply-partial.json', mv({ isTheBar: false, config: { wallS: 80 }, bar: { met: false, singleFresh: 134, populationFresh: 133, freshT: 160 } }));
    t = tieBreakOf({ dir: vd });
    assert.equal(t.measured, false);
    L = tieBreakLines(t);
    assert.equal(L.length, 2);
    assert.ok(L[1].startsWith('    the partial run (') && L[1].includes('80 wall s per arm): population 133/160 against single 134/160, gap -1'), L[1]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
  // the real Board 12 runs: the builder's note and the verifier's bar file, each number read back independently
  const noteFile = path.join(ROOT, 'notes', 'multiply.md'), barFile = path.join(ROOT, 'bench', 'verdicts', 'multiply.json');
  let note = null, rv = null;
  try { note = readFileSync(noteFile, 'utf8'); rv = JSON.parse(readFileSync(barFile, 'utf8')); } catch { note = null; }
  if (note && rv) {
    const real = tieBreakOf();
    const b = real.runs.find((r) => r.who === 'builder'), v = real.runs.find((r) => r.who === 'bar file');
    assert.ok(note.includes('[bar] single: ' + b.single + '/' + b.freshT + ' fresh'), 'the builder single is the note line');
    assert.ok(note.includes('[bar] population pick by the searched objective: ' + b.population + '/' + b.freshT + ' fresh'), 'the builder population is the note line');
    assert.equal(v.population, rv.bar.populationFresh);
    assert.equal(v.single, rv.bar.singleFresh);
    assert.equal(real.sharedFitness, rv.arms.population.pick.fitness);
    assert.equal(real.sharedFitness, rv.arms.single.pick.fitness);
    assert.equal(real.label, 'decided by tie-break noise, not a bar');
    console.log('(ab) ' + JSON.stringify({ builder: [b.population, b.single], rerun: [v.population, v.single], fitness: real.sharedFitness, noise: real.noise, label: real.label }));
  }
});
