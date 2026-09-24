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
//       board with its three Board 12 blocks, a GREEN gate with its five rows and the ladder and
//       gate tests all hold; a gate that started before a file this item owns changed is STALE;
//       rows.json is written once.
//   (q) to (s) the Board 12 blocks on hand written verdicts: MULTIPLYING, AUTHORED (the share,
//       patches per source per day, days since the last board) and KNOWLEDGE, each printing
//       "not measured" for a missing verdict, PARTIAL for a -partial one, and n/a, never 0, for
//       a number the verdict does not carry.
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
        multiplying: { source: 'bench/verdicts/multiply.json' },
        authored: { source: null, reason: 'none', perSourcePerDay: { rows: [] }, lastBoard: { newest: null } },
        knowledge: { sources: [{ name: 'simplewiki', status: 'not measured' }] },
      },
    },
    gate: {
      command: 'node bench/gate.mjs', startedAt: '2026-09-24T02:00:00.000Z', at: '2026-09-24T02:05:12.000Z', verdict: 'GREEN',
      testsPassed: 2, testsTotal: 2, assertionsPassed: 37, assertionsFailed: 0, emDash: [], badImports: [],
      tests: [{ file: 'test/a.test.mjs', exit: 0, budget: { outcome: 'exit', peakRssMb: 88.5 } }, { file: 'test/b.test.mjs', exit: 0, budget: { outcome: 'exit', peakRssMb: 91.25 } }],
      rows: {
        budget: { ok: true, line: line('BUDGET', true) }, compress: { ok: true, line: line('COMPRESS', true) }, hisData: { ok: true, line: line('HIS DATA', true) },
        loadBearing: { ok: true, line: line('LOAD-BEARING', true) }, boundary: { ok: true, line: line('BOUNDARY', true) },
      },
    },
    tests: [
      { file: 'test/ladder.test.mjs', pass: 17, fail: 0, total: 17, exit: 0, ms: 6421, budget: { outcome: 'exit', peakRssMb: 612.75 } },
      { file: 'test/gate.test.mjs', pass: 6, fail: 0, total: 6, exit: 0, ms: 4210, budget: { outcome: 'exit', peakRssMb: 140.5 } },
      { file: 'test/gate-rows.test.mjs', pass: 9, fail: 0, total: 9, exit: 0, ms: 1730, budget: { outcome: 'exit', peakRssMb: 96.25 } },
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
  assert.ok(rowsVerdictOf(mr).reasons.includes('the gate printed 4 of the 5 rows'));
  const nb = rowsInputs(); delete nb.gate.rows.loadBearing; delete nb.gate.rows.boundary;
  const nbv = rowsVerdictOf(nb);
  assert.ok(nbv.reasons.includes('the gate printed 3 of the 5 rows'), nbv.reasons.join(' | '));
  assert.deepEqual(nbv.doc.parts.gate.rowsPrinted, ['BUDGET', 'COMPRESS', 'HIS DATA']);
  const rb = rowsInputs(); rb.gate.verdict = 'RED'; rb.gate.rows.loadBearing = { ok: false, line: 'LOAD-BEARING RED: a row line' };
  assert.ok(rowsVerdictOf(rb).reasons.includes('the gate is RED: red rows LOAD-BEARING'));
  const mb = rowsInputs(); delete mb.ladder.board.knowledge; mb.ladder.board.authored = { share: 0.1 };
  const mbv = rowsVerdictOf(mb);
  assert.ok(mbv.reasons.includes('the board in ladder.json carries no AUTHORED, KNOWLEDGE block'), mbv.reasons.join(' | '));
  assert.deepEqual(mbv.doc.parts.ladder.blocks, ['MULTIPLYING']);
  assert.deepEqual(ok.doc.parts.ladder.blocks, ['MULTIPLYING', 'AUTHORED', 'KNOWLEDGE']);
  assert.equal(ok.doc.parts.tests.length, 3);
  assert.equal(ok.doc.board, 12);
  console.log('(o) met ' + ok.met + ', stale reasons ' + stale.reasons.length + ', red reasons ' + red.reasons.length);
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
    assert.deepEqual(ROWS_TESTS, ['test/ladder.test.mjs', 'test/gate.test.mjs', 'test/gate-rows.test.mjs']);
    assert.equal(a.met, false);
    const partial = JSON.parse(readFileSync(path.join(vd, 'rows-partial.json'), 'utf8'));
    assert.equal(partial.isTheBar, false);
    assert.ok(partial.reasons.includes('the gate is RED: red rows HIS DATA'), partial.reasons.join(' | '));
    assert.ok(logs.some((l) => l.startsWith('ROWS MISSED')), logs.join(' | '));
    assert.ok(logs.some((l) => l.startsWith('wrote ') && l.includes('rows-partial.json')), logs.join(' | '));

    // GREEN: rows.json is written, then a second met run leaves it byte for byte
    writeFileSync(path.join(vd, 'gate.json'), JSON.stringify(inp.gate));
    const b = await runRows({ root, verdictsDir: vd, runTests, log: () => {}, at: inp.at });
    assert.equal(b.met, true, b.lines.join(' | '));
    const first = readFileSync(path.join(vd, 'rows.json'), 'utf8');
    assert.equal(JSON.parse(first).isTheBar, true);
    const c = await runRows({ root, verdictsDir: vd, runTests, log: () => {}, at: '2026-09-24T04:00:00.000Z' });
    assert.equal(c.wrote, null, 'the bar file is written once');
    assert.equal(readFileSync(path.join(vd, 'rows.json'), 'utf8'), first);

    // a test file not in the tree is not run and misses the bar by name
    rmSync(path.join(root, 'test', 'gate-rows.test.mjs'));
    ran.length = 0;
    const d = await runRows({ root, verdictsDir: vd, runTests, log: () => {}, write: false, at: inp.at });
    assert.deepEqual(ran, ['test/ladder.test.mjs', 'test/gate.test.mjs']);
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
