// test/gaps.test.mjs: the gap ledger and its trial runner (board 14 builder). Every tree is planted
// under the OS temp dir and deleted; no model is called and the real tree is never written.
// The gap bar's own number (board 17 builder (the organism's item)): a planted gaps.json with
// bar.share is read by the ledger with a number and a distance, the same file without it is the
// control, barShare counts the covered lines that meet the bar, and --dry prints trialShare; the
// hisData, autonomy and handoff rows carry a trial that grades the row alone (self/gaps.mjs --row).
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, rmSync, existsSync, utimesSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildLedger, writeLedger, readLedger, classifyBar, summarize, measureOf, LEDGER_REL , rowTrial, barLines, trialShareOf, PARSERS, ROOT, rowAlone, ROW_ALONE } from '../self/gaps.mjs';
import { runTrial, barShare, SHARE_BAR } from '../bench/gaps.mjs';
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
    assert.equal(lines.find((l) => l.id === 'gate-red:row:boundary').trial.key, 'row:boundary', 'a red row with a row-only command carries its trial');
    assert.equal(rowTrial('budget'), null, 'a red row without one keeps trial null');
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

// ------------------------------------------------------------------ board 17 builder (the organism's item)
const gapsVerdict = (bar, barMet) => ({ at: '2026-09-26T12:00:00.000Z', node: 'v24', command: 'node --max-old-space-size=4000 bench/gaps.mjs', isTheBar: true, barMet, split: { development: 'd', heldOut: 'h', contaminated: false }, statement: 's', bar });

test('a planted gaps.json with bar.share is read by the ledger with a number and a distance; the old shape is the control', async () => {
  const root = plantTree({ verdicts: { 'gaps.json': gapsVerdict({ share: 0.75, shareBar: 1, coveredLines: 4, meetingLines: 3, met: false }, false) } });
  try {
    const { lines } = await buildLedger({ root });
    const l = lines.find((x) => x.id === 'missed:gaps.json');
    assert.ok(l, 'a missed gaps.json is one ledger line');
    assert.deepEqual([l.measured, l.bar, l.distance, l.better], [0.75, 1, 0.25, 'higher']);
    assert.match(l.unit, /share of the gap lines/);
    assert.match(l.why, /decided by barMet; measured bar\.share, bar bar\.shareBar/);
    assert.equal(l.trial.key, 'gaps', 'its trial is self/gaps.mjs --dry');
    assert.equal(l.trial.parser, 'gapsDry');
  } finally { rmSync(root, { recursive: true, force: true }); }
  const control = plantTree({ verdicts: { 'gaps.json': gapsVerdict({ requiredWithoutTrial: ['missed:operators.json'], modelFreeTrials: 35, printedMetric: 35, trialWallS: 397.99, limitS: 600, met: false }, false) } });
  try {
    const { lines } = await buildLedger({ root: control });
    const l = lines.find((x) => x.id === 'missed:gaps.json');
    assert.deepEqual([l.measured, l.bar, l.distance], [null, null, null], 'without bar.share no registered field holds a number');
    assert.match(l.why, /no registered field holds a number beside this bar/);
  } finally { rmSync(control, { recursive: true, force: true }); }
  const met = plantTree({ verdicts: { 'gaps.json': gapsVerdict({ share: 1, shareBar: 1, met: true }, true) } });
  try {
    const { lines, report } = await buildLedger({ root: met });
    assert.equal(lines.find((x) => x.id === 'missed:gaps.json'), undefined, 'a met gaps.json is no gap');
    assert.ok(report.verdicts.met.includes('gaps.json'));
  } finally { rmSync(met, { recursive: true, force: true }); }
  const m = measureOf('gaps', gapsVerdict({ share: 0.5, shareBar: 1 }, false));
  assert.deepEqual([m.measured, m.bar, m.distance], [0.5, 1, 0.5]);
});

test('a missed contamination.json shares the CONTAMINATION row trial', async () => {
  const root = plantTree({ verdicts: { 'contamination.json': { ...gapsVerdict({ rule: 'no cause' }, false), command: 'node tools/contamination-row.mjs' } } });
  try {
    const { lines } = await buildLedger({ root });
    const l = lines.find((x) => x.id === 'missed:contamination.json');
    assert.equal(l.trial.key, 'row:contamination');
    assert.deepEqual(l.trial.argv.slice(1), ['bench/gate.mjs', '--contamination']);
    assert.equal(l.trial.needsModel, false);
    assert.deepEqual(summarize(lines).requiredWithoutTrial, [], 'the required gap carries a trial');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('barShare: a covered line meets the bar only with a trial that printed inside the bound; the share is the bar\'s number', () => {
  const t = (key, needsModel = false) => ({ key, needsModel });
  const lines = [
    { id: 'missed:a.json', kind: 'missed', trial: t('ta') },
    { id: 'missed:b.json', kind: 'missed', trial: null },
    { id: 'ladder:x', kind: 'ladder', trial: t('model', true) },
    { id: 'gate-slow:test/s.test.mjs', kind: 'gate slow', trial: t('tb') },
    { id: 'dead:organism/g', kind: 'dead share', trial: t('tc') },
    { id: 'open:notes/x.md#1', kind: 'open', trial: null },
    { id: 'unreadable:u.json', kind: 'unreadable bar', trial: null },
  ];
  assert.deepEqual(barLines(lines).map((l) => l.id), ['missed:a.json', 'missed:b.json', 'ladder:x', 'gate-slow:test/s.test.mjs', 'dead:organism/g'], 'the required kinds and every model-free trial line; open and unreadable lines are not covered');
  assert.equal(trialShareOf(lines), 0.8);
  const runs = [
    { key: 'ta', printedMetric: true, endS: 10 },
    { key: 'tb', printedMetric: false, firstLine: 'exit 1: boom', endS: 20 },
    { key: 'tc', printedMetric: true, endS: 700 },
  ];
  const sh = barShare(lines, runs, { wallS: 600 });
  assert.deepEqual([sh.share, sh.covered, sh.meeting, sh.carrying, sh.trialShare], [0.4, 5, 2, 4, 0.8]);
  assert.deepEqual(sh.notMeeting.map((m) => m.id), ['missed:b.json', 'gate-slow:test/s.test.mjs', 'dead:organism/g']);
  assert.match(sh.notMeeting[0].why, /^no trial$/);
  assert.match(sh.notMeeting[1].why, /failed: exit 1: boom/);
  assert.match(sh.notMeeting[2].why, /printed at 700 s of trial wall, past 600 s/);
  assert.ok(!(sh.share >= SHARE_BAR), 'short of the bar');
  const fixed = lines.map((l) => (l.id === 'missed:b.json' ? { ...l, trial: t('ta') } : l));
  const all = barShare(fixed, runs.map((r) => ({ ...r, printedMetric: true, endS: Math.min(r.endS, 599) })), { wallS: 600 });
  assert.equal(all.share, 1);
  assert.ok(all.share >= SHARE_BAR, 'every covered line meets it: the bar is met');
  assert.equal(barShare(lines, []).share, null, 'no model-free trial ran: nothing measured, never a 0');
  assert.deepEqual([barShare(lines, runs, { keys: new Set(['ta']) }).share, barShare(lines, runs, { keys: new Set(['ta']) }).covered], [1, 1], 'a narrow run covers the lines of its own trials');
});

test('the gaps trial reads trialShare: self/gaps.mjs --dry prints it and writes nothing', () => {
  assert.equal(PARSERS.gapsDry.read('noise\n{"trialShare":0.8,"requiredWithoutTrial":5}\n'), 0.8);
  assert.equal(PARSERS.gapsDry.read('not json'), null);
  const r = spawnSync(process.execPath, ['self/gaps.mjs', '--dry'], { cwd: ROOT, encoding: 'utf8', timeout: 60_000 });
  assert.equal(r.status, 0, r.stderr);
  const j = JSON.parse(r.stdout.trim().split(/\r?\n/).pop());
  assert.ok(j.barLines > 0);
  assert.ok(j.trialShare > 0 && j.trialShare <= 1, 'a share: ' + j.trialShare);
  assert.equal(PARSERS.gapsDry.read(r.stdout), j.trialShare);
});

test('a red hisData, autonomy or handoff row carries a trial that grades it alone; the planted fixture flips hisData', async () => {
  const gate = { ...plantedGate(), rows: { hisData: { ok: false, line: 'HIS DATA RED' }, autonomy: { ok: false, line: 'AUTONOMY RED' }, handoff: { ok: false, line: 'HANDOFF RED' }, budget: { ok: false, line: 'BUDGET RED' } } };
  const root = plantTree({ gate });
  try {
    const { lines } = await buildLedger({ root });
    for (const name of ROW_ALONE) {
      const l = lines.find((x) => x.id === 'gate-red:row:' + name);
      assert.equal(l.trial.key, 'row:' + name);
      assert.deepEqual(l.trial.argv, ['self/gaps.mjs', '--row', name]);
      assert.equal(l.trial.parser, 'row');
      assert.match(l.why, /graded alone by self\/gaps\.mjs --row /);
    }
    const b = lines.find((x) => x.id === 'gate-red:row:budget');
    assert.equal(b.trial, null, 'the BUDGET row is computed over the test run: no bounded form, the control');
    assert.match(b.why, /no bounded form/);
    put(root, 'bench/fixtures/set/data.json', '{"x":1}\n');
    const red = await rowAlone('hisData', { root });
    assert.deepEqual([red.row, red.ok, red.metric], ['hisData', false, 1]);
    put(root, 'bench/fixtures/SOURCES.md', '# sources\n\n- set/data.json: planted by test/gaps.test.mjs, MIT\n');
    const green = await rowAlone('hisData', { root });
    assert.deepEqual([green.ok, green.metric], [true, 0], green.line);
    await assert.rejects(() => rowAlone('budget', { root }), /no row graded alone is named budget/);
  } finally { rmSync(root, { recursive: true, force: true }); }
  const out = '{"row":"autonomy","ok":false,"rules":true,"graded":true,"metric":2}\nAUTONOMY RED: two causes\n';
  assert.equal(PARSERS.row.read(out), 2);
  assert.equal(PARSERS.row.read('AUTONOMY RED only'), null);
  const r = spawnSync(process.execPath, ['self/gaps.mjs', '--row', 'hisData'], { cwd: ROOT, encoding: 'utf8', timeout: 60_000 });
  const j = JSON.parse(r.stdout.split(/\r?\n/)[0]);
  assert.equal(j.row, 'hisData');
  assert.equal(r.status, j.ok || !j.rules ? 0 : 1, 'the exit code is the row');
  assert.equal(PARSERS.row.read(r.stdout), j.metric);
});

test('--trial-ram-mb: a trial capped under its ledger cap is killed at the smaller cap and recorded alone; its ledger cap is the control', async () => {
  const root = plantTree({ verdicts: {} });
  try {
    const eat = 'const a = []; for (let i = 0; i < 40; i++) a.push(Buffer.alloc(8 * 1024 * 1024, 1)); setTimeout(() => process.stdout.write(String(a.length)), 3500);';
    const trial = { key: 'eater', argv: ['-e', eat], minutes: 0.5, needsModel: false, where: 'tree', writes: [], parser: null, runner: 'budget', ramMb: 6000, diskMb: 50 };
    const capped = await runTrial(trial, { root, freeRamMb: 0, ramMb: 150 });
    assert.equal(capped.outcome, 'killed', 'killed at the 150 MB cap: ' + capped.firstLine);
    assert.equal(capped.failed, true);
    assert.match(capped.firstLine, /BUDGET KILLED/);
    const control = await runTrial(trial, { root, freeRamMb: 0 });
    assert.equal(control.outcome, 'exit', 'the ledger cap of 6000 MB lets the same trial finish');
    assert.equal(control.exitCode, 0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
