// test/census-round.test.mjs: THE CENSUS ROUND IN THE LOOP (board 23 builder, item census-loop).
//
// self/autopilot.mjs runSoak calls self/census-round.mjs soakCensus once per soak cycle, after the
// ledger rows are read, under the soak's own wall and RAM; a spawned cell is promoted only when its
// bench improved AND the census says it ran on an item the bench gained. What is graded here:
//   1. the call happens once per cycle (a spy module through the o.censusModule seam), with the rows
//      the soak read and the soak's own budget, and --census-round off (the control) never calls it;
//   2. a cell whose bench did not improve is discarded (the rule, and a real arm that did not move);
//   3. a cell whose census says it never ran is discarded (the rule, and a real arm grown with a
//      planted idle cell: the bench moved 0 -> 20 through the real cell, the idle one fired on none);
//   4. the report object's shape, from a real soakCensus on a seeded organism in a temp root, and
//      the promotion it writes (state/dilation/snapshot.json, the replaced bytes kept).
// Every tree lives under the OS temp dir and is deleted; the live state/ is never read; the model is
// off (provider null, no socket).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { runSoak, SOAK_HEAP_MB } from '../self/autopilot.mjs';
import { plantInto } from './operators-plant.mjs';
import { seedBasic } from '../seeds/basic.mjs';
import {
  soakCensus, promotionOf, promoteKept, openCensus, closeCensus, runArm, nextTarget, redBenches, pickBench,
  ranOnGained, censusLine, PROMOTED_REL, PROMOTE_BY,
} from '../self/census-round.mjs';

const TMP = mkdtempSync(path.join(os.tmpdir(), 'census-loop-test-'));
test.after(() => rmSync(TMP, { recursive: true, force: true }));
const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');

// ------------------------------------------------------------------ the soak, with a spy
const LEDGER = [
  { id: 'missed:sequence.json', kind: 'missed', measured: 0, bar: 1 },
  { id: 'ladder:algebra', kind: 'ladder', measured: 0, bar: 1 },
];
function soakTree(lines) {
  const base = mkdtempSync(path.join(TMP, 'soak-'));
  const root = path.join(base, 'tree');
  plantInto(root, { gate: 'fake' });
  const f = path.join(root, 'state', 'self', 'gaps.jsonl');
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, lines.map((l) => JSON.stringify(l)).join('\n') + '\n');
  const tmpBase = path.join(base, 'copies');
  mkdirSync(tmpBase, { recursive: true });
  return { root, tmpBase };
}
const noRate = () => ({ ok: false, reason: 'not read in a test' });
const SOAK_MIN = 0.03;
const SOAK = { author: 'off', 'gate-minutes': 0, 'idle-step-ms': 200, rateFn: noRate, soak: SOAK_MIN };
const SPY_REPORT = Object.freeze({
  ran: true, off: false, why: '1 circuit(s) kept, 1 promoted into state/dilation', rounds: 2, spawned: 2, cellsSpawned: 3, kept: 1, discarded: 1,
  promoted: 1, written: true,
  keptCells: [{ bench: 'missed:sequence.json', round: 1, target: 'seq.ari.0', cells: ['spawn.fit'], before: 0, after: 20, delta: 20, gained: 20, ran: { 'spawn.fit': 20 } }],
  discardedCells: [{ bench: 'ladder:algebra', round: 1, target: 'x', cells: ['spawn.solve'], before: 0, after: 0, delta: 0, why: 'its bench did not improve (0 -> 0)' }],
  benches: [{ id: 'missed:sequence.json', rounds: 1, kept: 1, discarded: 0, before: 0, after: 20 }, { id: 'ladder:algebra', rounds: 1, kept: 0, discarded: 1, before: 0, after: 0 }],
});
function spyModule(report = SPY_REPORT) {
  const calls = [];
  return { calls, soakCensus: async (o) => { calls.push(o); return JSON.parse(JSON.stringify(report)); } };
}
const autopilotLines = (root) => {
  const d = path.join(root, 'bench', 'verdicts', 'autopilot');
  if (!existsSync(d)) return [];
  return readdirSync(d).filter((n) => n.endsWith('.jsonl')).flatMap((n) => readFileSync(path.join(d, n), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)));
};

test('the call happens once per cycle (a spy): after the ledger rows are read, under the soak own wall and RAM', async () => {
  const { root, tmpBase } = soakTree(LEDGER);
  const spy = spyModule();
  const logs = [];
  const r = await runSoak({ ...SOAK, sources: 'gaps,census-round', 'soak-heap-mb': 1536, root, tmpBase, censusModule: spy, log: (l) => logs.push(l) });
  assert.equal(spy.calls.length, 1, 'one soak cycle, one census round');
  const c = spy.calls[0];
  assert.deepEqual(c.lines.map((l) => l.id), LEDGER.map((l) => l.id), 'the rows the soak read from its ledger');
  assert.equal(c.ledgerFrom, 'state/self/gaps.jsonl');
  assert.equal(c.root, root);
  assert.equal(c.ramMb, 1536, 'the soak own heap is the census RAM budget');
  assert.ok(c.wallMs > 0 && c.wallMs <= SOAK_MIN * 60_000, 'the census wall never passes the soak wall: ' + c.wallMs);
  assert.equal(c.write, true);
  assert.equal(typeof c.runId, 'string');
  assert.ok(c.tmp && c.tmp.startsWith(tmpBase), 'the census copies go where the soak puts its copies');
  // the report, where the soak writes its report
  assert.equal(r.censusRound.kept, 1);
  assert.equal(r.censusRound.cfg.on, true);
  assert.equal(r.censusRound.cfg.ramMb, 1536);
  const onDisk = JSON.parse(readFileSync(path.join(root, ...r.soakFile.split('/')), 'utf8'));
  assert.deepEqual(onDisk.censusRound.keptCells, SPY_REPORT.keptCells, 'the soak file carries the census report');
  const ev = autopilotLines(root).filter((l) => l.event === 'census-round');
  assert.equal(ev.length, 1, 'one decision line per cycle');
  assert.deepEqual(ev[0].keptCells.map((k) => [k.bench, k.delta]), [['missed:sequence.json', 20]]);
  assert.equal(ev[0].author, 'organism (census-round)');
  assert.ok(logs.some((l) => /CENSUS ROUND ran: 2 round\(s\), spawned 2, kept 1, discarded 1, promoted 1 into state\/dilation/.test(l)), 'the soak says what the round did');
  // a second cycle is a second call, and only one
  const r2 = await runSoak({ ...SOAK, sources: 'gaps,census-round', root, tmpBase, censusModule: spy, log: () => {} });
  assert.equal(spy.calls.length, 2);
  assert.equal(spy.calls[1].ramMb, SOAK_HEAP_MB, 'no --soak-heap-mb: the soak default heap');
  assert.equal(r2.censusRound.kept, 1);
});

test('the control: --census-round off (and --sources without census-round) never calls the round', async () => {
  const { root, tmpBase } = soakTree(LEDGER);
  const spy = spyModule();
  const off = await runSoak({ ...SOAK, 'census-round': 'off', root, tmpBase, censusModule: spy, log: () => {} });
  assert.equal(spy.calls.length, 0);
  assert.deepEqual([off.censusRound.off, off.censusRound.ran, off.censusRound.rounds, off.censusRound.kept, off.censusRound.why], [true, false, 0, 0, '--census-round off']);
  assert.match(censusLine(off.censusRound), /^CENSUS ROUND off: --census-round off$/);
  const left = await runSoak({ ...SOAK, sources: 'gaps', root, tmpBase, censusModule: spy, log: () => {} });
  assert.equal(spy.calls.length, 0);
  assert.equal(left.censusRound.why, '--sources leaves census-round out');
  // a census that throws is the report why; the soak goes on
  const boom = { soakCensus: async () => { throw new Error('planted failure'); } };
  const thrown = await runSoak({ ...SOAK, sources: 'gaps,census-round', root, tmpBase, censusModule: boom, log: () => {} });
  assert.equal(thrown.censusRound.ran, false);
  assert.match(thrown.censusRound.why, /threw: .*planted failure/);
});

// ------------------------------------------------------------------ the promotion rule
test('the rule: a cell whose bench did not improve is discarded', () => {
  const d = promotionOf({ spawned: 1, cells: ['c1'], before: 3, after: 3, kept: false, ran: { c1: 0 }, why: 'the bench did not move (3 -> 3)' });
  assert.deepEqual([d.promote, d.spawned, d.delta], [false, true, 0]);
  assert.match(d.why, /its bench did not improve \(3 -> 3\)/);
  const worse = promotionOf({ spawned: 1, cells: ['c1'], before: 3, after: 2, kept: false, ran: { c1: 4 } });
  assert.deepEqual([worse.promote, worse.delta], [false, -1], 'firing does not rescue a bench that fell');
  const ungraded = promotionOf({ spawned: 1, cells: ['c1'], before: 3, after: null, kept: false, ran: null });
  assert.equal(ungraded.promote, false, 'a bench never graded is not an improvement');
  const moved = promotionOf({ spawned: 1, cells: ['c1'], before: 3, after: 5, kept: false, ran: { c1: 2 }, why: 'regressed: 1 development items lost' });
  assert.equal(moved.promote, false, 'a bench that moved but lost an item is not kept');
  assert.match(moved.why, /did not keep it: regressed/);
  const none = promotionOf({ spawned: 0, why: 'the brain already holds every cell of this circuit' });
  assert.deepEqual([none.promote, none.spawned], [false, false], 'nothing grown, nothing discarded');
});

test('the rule: a cell whose census says it never ran is discarded', () => {
  const d = promotionOf({ spawned: 2, cells: ['c1', 'c2'], before: 0, after: 4, kept: true, ran: { c1: 4, c2: 0 } });
  assert.deepEqual([d.promote, d.delta, d.never], [false, 4, ['c2']]);
  assert.match(d.why, /c2 never ran on an item the bench gained: not load bearing/);
  assert.equal(promotionOf({ spawned: 1, cells: ['c1'], before: 0, after: 4, kept: true, ran: null }).promote, false, 'no census, no promotion');
  assert.equal(promotionOf({ spawned: 1, cells: ['c1'], before: 0, after: 4, kept: true, ran: {} }).promote, false, 'a cell absent from the census never ran');
  const ok = promotionOf({ spawned: 2, cells: ['c1', 'c2'], before: 0, after: 4, kept: true, ran: { c1: 4, c2: 1 } });
  assert.deepEqual([ok.promote, ok.delta, ok.never], [true, 4, []]);
  // the firing census itself: gained items only, per cell
  const fired = new Map([['i1', new Set(['c1'])], ['i2', new Set(['c1', 'c2'])], ['i3', new Set(['c2'])]]);
  assert.deepEqual(ranOnGained(['c1', 'c2', 'c3'], ['i1', 'i2'], fired), { c1: 2, c2: 1, c3: 0 }, 'i3 was not gained, so c2 firing there does not count');
  assert.deepEqual(ranOnGained(['c1'], [], fired), { c1: 0 });
  assert.deepEqual(ranOnGained(['c1'], ['i1'], null), { c1: 0 });
});

function seededRoot(tag) {
  const root = path.join(mkdtempSync(path.join(TMP, tag + '-')), 'root');
  const live = path.join(root, 'state', 'dilation');
  mkdirSync(live, { recursive: true });
  seedBasic({ name: 'dilation', dir: live, ledger: 'off' }).snapshot(live);
  return { root, live: path.join(live, 'snapshot.json') };
}

test('real arms: the idle cell that never ran and the arm that did not improve are both discarded, nothing written', async () => {
  const { root, live } = seededRoot('arms');
  const before = sha(live);
  const lines = [LEDGER[0]];
  const ctx = await openCensus({ root, tmp: path.join(TMP, 'arms-work'), lines, bench: redBenches(lines).benches[0], heldOut: false });
  try {
    assert.equal(ctx.heldOutBefore, null, 'held out is not graded inside the loop');
    const tg = nextTarget(ctx);
    assert.ok(tg, 'the seeded organism misses a sequence item the genome expresses');
    // round 1: the real circuit plus a planted cell nothing wires to
    const idle = 'census.test.idle';
    const padded = { ...tg.circuit, cells: [...tg.circuit.cells, { id: idle, kind: 'sink.log', params: {}, circuit: 'idle' }] };
    const a = await runArm(ctx, 'real', padded, { round: 1, target: tg.item.id });
    assert.ok(a.after > a.before && a.kept, 'the bench moved through the real cell: ' + a.before + ' -> ' + a.after);
    assert.equal(a.ran[idle], 0, 'the census: the idle cell fired on none of the gained items');
    assert.ok(Object.entries(a.ran).filter(([id]) => id !== idle).every(([, n]) => n > 0), 'every other spawned cell ran');
    ctx.rounds.push({ round: 1, real: a, placebo: { spawned: 0, kept: false } });
    ctx.circuits = new Map([[1, padded]]);
    // round 2: a cell that cannot move a bench the lineage already answers
    const noop = { gene: 'placebo', method: 'test', cells: [{ id: 'census.test.noop', kind: 'num.arith', params: { op: '+' }, circuit: 'placebo' }], edges: [], exit: 'census.test.noop', depth: 0 };
    const b = await runArm(ctx, 'real', noop, { round: 2, target: 'none' });
    assert.equal(b.spawned, 1);
    assert.equal(b.after, b.before, 'the bench did not move');
    ctx.rounds.push({ round: 2, real: b, placebo: { spawned: 0, kept: false } });
    ctx.circuits.set(2, noop);
    const p = await promoteKept(ctx, { root, write: true });
    assert.equal(p.promote.length, 0);
    assert.deepEqual(p.discard.map((r) => r.round), [1, 2]);
    assert.match(p.discard[0].why, /census\.test\.idle never ran on an item the bench gained/);
    assert.match(p.discard[1].why, /its bench did not improve/);
    assert.equal(p.written, false);
    assert.equal(sha(live), before, 'nothing promoted, the live organism untouched');
    assert.equal(existsSync(path.join(root, ...PROMOTED_REL.split('/'))), false, 'no promotion record');
  } finally {
    const c = closeCensus(ctx);
    assert.equal(c.workDeleted, true);
  }
});

// ------------------------------------------------------------------ the report object
test('the report object shape: a real soakCensus on a seeded organism, the promotion written, a second cycle at its fixed point', async () => {
  const { root, live } = seededRoot('report');
  const lines = [
    LEDGER[0], LEDGER[1],
    { id: 'missed:answer.json', kind: 'missed' }, // the same item source as ladder:algebra
    { id: 'missed:ns.json', kind: 'missed' }, // typed, no model-off source
    { id: 'green:sequence', kind: 'passing' }, // not red
  ];
  const rb = redBenches(lines);
  assert.deepEqual(rb.benches.map((b) => b.source), ['answer:sequence', 'answer:algebra']);
  assert.deepEqual(rb.benches[0], { ...pickBench(lines), skipped: [] }, 'the first bench is the one pickBench takes');
  assert.equal(rb.red, 4);
  assert.deepEqual(rb.skipped.map((s) => s.id), ['missed:answer.json', 'missed:ns.json']);

  const before = sha(live);
  const dry = await soakCensus({ root, lines, tmp: path.join(TMP, 'report-work'), wallMs: 120_000, write: false });
  assert.equal(dry.written, false);
  assert.equal(sha(live), before, 'a dry cycle writes nothing');
  assert.ok(dry.kept > 0 && dry.promotions.every((p) => /^dry: /.test(p.why)), 'dry says what it would promote');

  const r = await soakCensus({ root, lines, tmp: path.join(TMP, 'report-work'), wallMs: 120_000, runId: 'test-run' });
  for (const k of ['ran', 'why', 'at', 'modelCalls', 'write', 'budget', 'stoppedBy', 'ledger', 'red', 'benches', 'skipped', 'rounds', 'spawned', 'cellsSpawned', 'kept', 'discarded',
    'keptCells', 'discardedCells', 'placebo', 'promoted', 'written', 'promotions', 'ms', 'peakRssMb']) assert.ok(k in r, 'report field ' + k);
  assert.equal(r.ran, true);
  assert.equal(r.modelCalls, 0);
  assert.deepEqual(r.budget, { wallMs: 120_000, ramMb: 2048, rounds: 200 });
  assert.deepEqual(r.ledger, { from: 'injected', lines: 5 });
  assert.deepEqual(r.benches.map((b) => b.id), ['missed:sequence.json', 'ladder:algebra']);
  for (const b of r.benches) {
    for (const k of ['id', 'kind', 'source', 'rounds', 'spawned', 'kept', 'discarded', 'promoted', 'written', 'why', 'openS', 'dev', 'before', 'after', 'workDeleted']) assert.ok(k in b, 'bench field ' + k);
    assert.equal(b.workDeleted, true, b.id + ': the census work dir deleted');
  }
  assert.ok(r.kept > 0, 'the seeded organism misses items the genome expresses: something is kept');
  assert.equal(r.kept, r.keptCells.length);
  assert.equal(r.discarded, r.discardedCells.length);
  assert.equal(r.kept + r.discarded, r.spawned, 'every arm that spawned is kept or discarded');
  for (const k of r.keptCells) {
    assert.ok(typeof k.bench === 'string' && k.delta > 0 && k.after - k.before === k.delta, 'a kept cell names its bench and a positive delta');
    assert.ok(k.cells.length && k.cells.every((id) => k.ran[id] > 0), 'every kept cell ran on a gained item');
  }
  for (const k of r.discardedCells) assert.equal(typeof k.why, 'string');
  assert.equal(r.written, true);
  assert.equal(r.promoted, r.kept);
  assert.notEqual(sha(live), before, 'the promoted organism is the one the soak keeps');
  const recs = readdirSync(path.join(root, ...PROMOTED_REL.split('/')));
  assert.equal(recs.length, r.promotions.filter((p) => p.written).length, 'one record per written promotion');
  const meta = JSON.parse(readFileSync(path.join(root, ...PROMOTED_REL.split('/'), recs[0], 'meta.json'), 'utf8'));
  assert.deepEqual([meta.by, meta.runId, meta.hashBefore], [PROMOTE_BY, 'test-run', before]);
  assert.ok(existsSync(path.join(root, ...PROMOTED_REL.split('/'), recs[0], 'before-snapshot.json')), 'the replaced bytes are kept');
  for (const p of r.promotions.filter((x) => x.written)) assert.ok(p.verify.benchAfter > p.verify.benchBefore && p.verify.lost === 0 && p.verify.controlAfter >= p.verify.controlBefore, 'graded again from disk');
  assert.match(censusLine(r), /^CENSUS ROUND ran: \d+ round\(s\) on missed:sequence\.json, ladder:algebra; spawned \d+/);
  assert.equal(r.red, 4, 'the report counts the red lines redBenches counted');
  assert.ok(censusLine(r).includes('; ledger 5 rows, 4 red; '), 'the printed line carries the ledger rows and the red count the report holds: ' + censusLine(r));
  assert.ok(censusLine({ ...r, ledger: null, red: null }).includes('; ledger ? rows, ? red; '), 'an unread ledger prints ?, never a zero');

  const again = await soakCensus({ root, lines, tmp: path.join(TMP, 'report-work'), wallMs: 120_000 });
  assert.deepEqual([again.spawned, again.kept, again.written], [0, 0, false], 'the next cycle starts from the promoted organism: nothing left to spawn for');
  assert.deepEqual(again.benches.map((b) => b.before), r.benches.map((b) => b.after), 'each bench starts where the promotion left it');
});

test('the promotion writes only over the bytes it was measured against: a live file changed mid-cycle is left alone', async () => {
  const { root, live } = seededRoot('race');
  const lines = [LEDGER[0]];
  let touched = null;
  const log = (l) => {
    if (touched === null && /^census open: /.test(l)) { writeFileSync(live, readFileSync(live, 'utf8') + '\n'); touched = sha(live); }
  };
  const r = await soakCensus({ root, lines, tmp: path.join(TMP, 'race-work'), wallMs: 120_000, log });
  assert.ok(touched, 'the live file was changed after the census copied it');
  assert.ok(r.rounds > 0 && r.keptCells.length === 0, 'the round ran; nothing is reported kept once the write is refused');
  assert.equal(r.written, false);
  assert.match(r.promotions[0].why, /changed while the census ran/);
  assert.ok(r.discardedCells.length > 0 && r.discardedCells.every((d) => /changed while the census ran/.test(d.why)), 'the refused cells are discarded with the reason');
  assert.equal(sha(live), touched, 'the changed live file is not overwritten');
  assert.equal(existsSync(path.join(root, ...PROMOTED_REL.split('/'))), false);
});
