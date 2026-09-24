// test/gaps.test.mjs: the gap ledger and its trial runner (board 14 builder). Every tree is planted
// under the OS temp dir and deleted; no model is called and the real tree is never written.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, rmSync, existsSync, utimesSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildLedger, writeLedger, readLedger, classifyBar, summarize, measureOf, LEDGER_REL } from '../self/gaps.mjs';
import { runTrial } from '../bench/gaps.mjs';
import { plantTree, put, EXPECTED, BAROBJ_MEASURE, plantedLadder, plantedGate } from './gaps-plant.mjs';

const pick = (l) => ({ id: l.id, kind: l.kind, measured: l.measured, bar: l.bar, distance: l.distance, subsystem: l.subsystem });

test('one met, one missed, one undecidable, one partial only and one bar object yield exactly the expected lines', async () => {
  const root = plantTree();
  try {
    const { lines, report } = await buildLedger({ root, measures: BAROBJ_MEASURE });
    assert.deepEqual(lines.map(pick), EXPECTED);
    assert.deepEqual(report.verdicts.met, ['met.json']);
    assert.deepEqual(report.verdicts.missed, ['barobj.json', 'missed.json']);
    assert.deepEqual(report.verdicts.undecidable, ['undecidable.json']);
    assert.equal(report.verdicts.fields.barobj, 'bar.met');
    const missed = lines.find((l) => l.id === 'missed:missed.json');
    assert.deepEqual(missed.files, ['core/thing.mjs'], 'the map entry whose command names bench/missed.mjs gives its files');
    assert.equal(missed.benchCommand, 'node bench/missed.mjs');
    assert.equal(missed.since, '2026-09-24T12:00:00.000Z');
    for (const l of lines) assert.equal(l.trial, null, l.id + ' has no registered form');
    assert.deepEqual(summarize(lines).requiredWithoutTrial, ['missed:barobj.json', 'missed:missed.json']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('the classifier order: barMet, met, met.bar, bar.met, the verdict word, else undecidable', () => {
  assert.equal(classifyBar({ barMet: false, met: true }).field, 'barMet');
  assert.equal(classifyBar({ met: { bar: true } }).state, 'met');
  assert.equal(classifyBar({ verdict: 'NULL AGAINST' }).state, 'missed');
  assert.equal(classifyBar({ verdict: 'NOT MET' }).state, 'missed');
  assert.equal(classifyBar({ verdict: 'BEATS' }).state, 'met');
  assert.equal(classifyBar({ verdict: 'NARROW' }).state, 'undecidable');
  assert.equal(classifyBar({ bar: 'prose' }).state, 'undecidable');
  const m = measureOf('unregistered', { bar: { gateGreen: false, loaded: true, drop: 0.4, met: false } });
  assert.deepEqual([m.measured, m.bar, m.distance], [1, 2, 1], 'bar booleans, its own met flag and numbers left out');
  assert.match(m.from, /false: gateGreen/);
  assert.equal(measureOf('unregistered', { bar: { met: false, only: true } }).measured, null, 'one condition is not a count');
});

test('a ladder field reading "not measured" yields no gap', async () => {
  const root = plantTree({ verdicts: {}, ladder: plantedLadder() });
  try {
    const { lines, report } = await buildLedger({ root });
    const ladder = lines.filter((l) => l.kind === 'ladder');
    assert.deepEqual(ladder.map((l) => l.id), ['ladder:sets.arc.frontier'], 'only the one block with a number beside its bar');
    assert.equal(ladder[0].measured, 17.75);
    assert.equal(ladder[0].bar, 98);
    assert.equal(ladder[0].distance, 80.25);
    assert.equal(ladder[0].trial.key, 'grid');
    assert.ok(report.ladder.rungs.some((r) => r.rung === 'knowledge.enwiki' && r.read === 'not measured' && r.gap === false));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('gate rows and OPEN lines: red and slow files, a red row, one OPEN line', async () => {
  const root = plantTree({ verdicts: {}, gate: plantedGate(), notes: { 'x.md': '# notes/x.md\n\n## Open\n\n- core/thing.mjs is slow\n' } });
  try {
    const { lines } = await buildLedger({ root });
    const ids = lines.filter((l) => l.kind !== 'unreadable bar' && l.kind !== 'missed').map((l) => l.kind + ' ' + l.id.replace(/#.*/, '#'));
    assert.deepEqual(ids, ['gate red gate-red:row:boundary', 'gate red gate-red:test/thing.test.mjs', 'gate slow gate-slow:test/slow.test.mjs', 'open open:notes/x.md#']);
    const red = lines.find((l) => l.id === 'gate-red:test/thing.test.mjs');
    assert.equal(red.subsystem, 'Things');
    assert.equal(red.trial.key, 'test:test/thing.test.mjs');
    assert.equal(lines.find((l) => l.id === 'gate-red:row:boundary').trial, null);
    assert.deepEqual(lines.find((l) => l.kind === 'open').files, ['core/thing.mjs']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('a trial that exceeds its minutes is killed and recorded as failed', async () => {
  const root = plantTree({ verdicts: {} });
  try {
    const trial = { key: 'sleeper', argv: ['-e', 'setInterval(() => {}, 1000)'], minutes: 0.03, needsModel: false, where: 'tree', writes: [], parser: null, runner: 'budget', ramMb: 6000, diskMb: 50 };
    const t0 = Date.now();
    const r = await runTrial(trial, { root, freeRamMb: 0 });
    assert.equal(r.ran, true);
    assert.equal(r.completed, false);
    assert.equal(r.outcome, 'aborted');
    assert.equal(r.failed, true);
    assert.equal(r.printedMetric, false);
    assert.match(r.firstLine, /killed at its 0\.03 minute bound/);
    assert.ok(Date.now() - t0 < 60_000, 'killed near its bound, not left running');
    assert.equal(r.copyGone, true);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('a copy trial reads its metric from the copy, never the stale real file, and leaves no copy', async () => {
  const root = plantTree({ verdicts: {} });
  try {
    const stale = put(root, 'bench/verdicts/compress-partial.json', { bar: { measured: 1 } });
    put(root, 'state/big.txt', 'state is excluded from a copy');
    put(root, 'bench/fixtures/one.json', '{"n":4.2}');
    put(root, 'bench/fixtures/other.json', '{"n":-2}');
    put(root, 'bench/writer.mjs', [
      "import { writeFileSync, existsSync, readFileSync } from 'node:fs';",
      "const n = existsSync('state') || existsSync('bench/fixtures/other.json') ? -1 : JSON.parse(readFileSync('bench/fixtures/one.json', 'utf8')).n;",
      "writeFileSync('bench/verdicts/compress-partial.json', JSON.stringify({ bar: { measured: n } }));",
    ].join('\n'));
    const before = readFileSync(stale, 'utf8');
    const trial = { key: 'writer', argv: ['bench/writer.mjs'], minutes: 1, needsModel: false, where: 'copy', writes: ['bench/verdicts/compress-partial.json'], parser: 'compress', runner: 'budget', ramMb: 6000, diskMb: 50, fixtures: ['bench/fixtures/one.json'] };
    const r = await runTrial(trial, { root, freeRamMb: 0 });
    assert.equal(r.printedMetric, true, r.firstLine || '');
    assert.equal(r.metric, 4.2, 'the fresh file in the copy, state/ not copied, and of bench/fixtures only the one named file');
    assert.equal(r.copyGone, true);
    assert.equal(r.realWritesUnchanged, true);
    assert.equal(readFileSync(stale, 'utf8'), before);
    const failing = await runTrial({ ...trial, key: 'writer-missing', argv: ['bench/nothing.mjs'] }, { root, freeRamMb: 0 });
    assert.equal(failing.failed, true);
    assert.match(failing.firstLine, /^exit 1: /);
    const silent = await runTrial({ ...trial, key: 'writer-silent', argv: ['-e', '0'] }, { root, freeRamMb: 0 });
    assert.equal(silent.completed, true);
    assert.equal(silent.metric, null, 'exit 0 without a write never reads the stale copy of the file');
    assert.equal(silent.failed, true);
    assert.match(silent.firstLine, /was not written/);
    assert.notEqual(silent.peakRssMb, 0, 'a working set of 0 is no reading: it is null, never a number');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('the rewrite keeps at most 7 dated files', () => {
  const root = plantTree({ verdicts: {} });
  try {
    for (let d = 1; d <= 9; d++) put(root, 'state/self/gaps-2026-09-0' + d + '.jsonl', '{"id":"old ' + d + '"}\n');
    const cur = put(root, LEDGER_REL, '{"id":"previous"}\n');
    const when = new Date('2026-09-20T12:00:00Z');
    utimesSync(cur, when, when);
    const w = writeLedger([{ id: 'a', kind: 'missed' }, { id: 'b', kind: 'open' }], { root });
    const dir = path.join(root, 'state', 'self');
    const dated = readdirSync(dir).filter((n) => /^gaps-\d{4}-\d{2}-\d{2}\.jsonl$/.test(n)).sort();
    assert.equal(dated.length, 7);
    assert.deepEqual(dated, ['gaps-2026-09-04.jsonl', 'gaps-2026-09-05.jsonl', 'gaps-2026-09-06.jsonl', 'gaps-2026-09-07.jsonl', 'gaps-2026-09-08.jsonl', 'gaps-2026-09-09.jsonl', 'gaps-2026-09-20.jsonl']);
    assert.equal(w.previous, 'gaps-2026-09-20.jsonl');
    assert.deepEqual(w.removed.sort(), ['gaps-2026-09-01.jsonl', 'gaps-2026-09-02.jsonl', 'gaps-2026-09-03.jsonl']);
    assert.equal(readFileSync(path.join(dir, 'gaps-2026-09-20.jsonl'), 'utf8'), '{"id":"previous"}\n');
    assert.deepEqual(readLedger(root).lines.map((l) => l.id), ['a', 'b']);
    writeFileSync(path.join(dir, 'gaps.jsonl'), '{"id":"x"}\nnot json\n');
    assert.deepEqual(readLedger(root), { lines: [{ id: 'x' }], bad: 1, found: true });
    assert.ok(!existsSync(path.join(dir, 'gaps.jsonl.tmp')));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
