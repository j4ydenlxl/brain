// test/daemon.test.mjs: Board 10, item "daemon" (his P5 and P13). The persistent process
// logs a SUMMARY ledger unless told otherwise, a full ledger rotates at its budget, one short
// run exercises every step kind of the loop, the self-code step refuses while another process
// holds a bench flag, and the ruler a checkpoint carries reads back from disk: the rates
// recompute from ruler.jsonl alone, the checkpoint header carries the last row, and the
// plateau state replays from the rows.
//
//   node --test test/daemon.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, statSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { Ledger, previousSegment } from '../core/ledger.mjs';
import {
  live, ledgerOptions, readRuler, rulerRates, replayPlateau, checkpointRuler, raiseBenchFlag, benchFlag, coordinatesOf, STEP_KINDS, DEFAULTS,
} from '../daemon/run.mjs';

const STATE = mkdtempSync(path.join(tmpdir(), 'daemon-test-'));
process.env.BRAIN_STATE_DIR = STATE;
delete process.env.BRAIN_LEDGER_BUDGET_MB;
process.on('exit', () => { try { rmSync(STATE, { recursive: true, force: true }); } catch { /* the OS cleans tmp */ } });

// the tiny organism every run here uses: 4 majors, 64 substrate units
const TINY = { majors: 4, substrateUnits: 64, checkpointEvery: 50, loopEvery: 10, suiteTasks: 4, plateauPatience: 1, selfCodeEvery: 100, selfCodeDry: true, selfCodeSources: ['mutants'], selfEvery: 0 };
const lines = (file) => (existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);

// one loop run shared by the default, every-kind and read-back tests
let shared = null;
function sharedRun() {
  // selfFloorMb lifted: the self round's memory guard (Board 13 fit) is graded by test/cloud-fit.test.mjs; this run measures
  // every step kind, and the test process's own rss (741 MB peak under the gate) sits over the 380 MB default floor.
  if (!shared) shared = live({ ...TINY, name: 'loop', seed: 'daemon-test', ticks: 300, selfFloorMb: 1e6, benchFlagDir: path.join(STATE, 'flags-none') });
  return shared;
}

test('summary is the default: the file holds only note rows and counts rows, and full without a budget is refused down to summary', async () => {
  assert.equal(DEFAULTS.ledger, 'summary');
  const o = ledgerOptions({}, { argv: [], env: {} });
  assert.equal(o.mode, 'summary'); assert.equal(o.level, 'full'); assert.ok(o.budgetBytes > 0, 'a summary ledger carries a budget too');
  const f = ledgerOptions({ ledger: 'full' }, { argv: [], env: {} });
  assert.equal(f.mode, 'summary', 'full with no budget is written as summary');
  assert.match(f.downgraded, /--ledger-budget-mb/);
  const g = ledgerOptions({ ledger: 'full' }, { argv: ['node', 'x', '--ledger-budget-mb', '50'], env: {} });
  assert.equal(g.mode, 'full'); assert.equal(g.budgetBytes, 50 * 1024 * 1024); assert.equal(g.budgetFrom, '--ledger-budget-mb');

  const p = await sharedRun();
  assert.equal(p.ledger.asked, 'summary');
  assert.equal(p.ledger.mode, 'summary');
  assert.equal(p.ledger.downgraded, null);
  const rows = lines(path.join(p.dir, 'ledger', 'ledger.jsonl'));
  assert.ok(rows.length > 0, 'the summary ledger is not empty');
  assert.ok(p.ledger.seq > 10 * rows.length, 'the brain logged ' + p.ledger.seq + ' events and the file holds ' + rows.length + ' rows');
  for (const r of rows) assert.equal(r.note, true, 'every row on disk is a note: ' + JSON.stringify(r).slice(0, 200));
  const types = new Set(rows.map((r) => r.type));
  assert.deepEqual([...types].sort(), ['daemon.checkpoint', 'daemon.step', 'ledger.counts']);
  // every seq the brain logged is on disk: inside a counts row's range, or a row of its own
  const covered = new Set(rows.map((r) => r.seq));
  for (const r of rows) if (r.type === 'ledger.counts') { assert.equal(r.events, r.to - r.from + 1); for (let q = r.from; q <= r.to; q++) covered.add(q); }
  assert.equal(covered.size, p.ledger.seq, 'covered ' + covered.size + ' of ' + p.ledger.seq);
  for (let q = 0; q < p.ledger.seq; q++) if (!covered.has(q)) assert.fail('seq ' + q + ' is on disk nowhere');

  // live() itself: full with no budget anywhere is downgraded, and says so
  const said = [];
  const q = await live({ majors: 4, substrateUnits: 64, name: 'nobudget', seed: 'nobudget', ticks: 20, checkpointEvery: 10, ledger: 'full', out: (l) => said.push(l) });
  assert.equal(q.ledger.mode, 'summary');
  assert.ok(said.some((l) => l.startsWith('[live] ledger=full needs --ledger-budget-mb')), said.join('\n'));
});

test('rotation at the budget: two segments, never past the budget, and the seq resumes across a rotation', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'daemon-ledger-'));
  try {
    const budget = 200_000;
    const L = new Ledger({ dir, mode: 'full', budgetBytes: budget, flushEvery: 100 });
    let maxDisk = 0;
    for (let i = 0; i < 5000; i++) {
      L.append({ type: 'probe', i, pad: 'x'.repeat(64) });
      if (i % 100 === 99) { const s = L.stats(); maxDisk = Math.max(maxDisk, s.diskBytes); }
    }
    L.flush();
    const s = L.stats();
    assert.ok(s.bytesWritten > 2 * budget, 'wrote ' + s.bytesWritten + ' bytes, more than twice the budget');
    assert.ok(s.rotations >= 2, 'rotations ' + s.rotations);
    assert.ok(s.fileBytes <= budget / 2, 'the live segment ' + s.fileBytes + ' <= ' + budget / 2);
    const onDisk = statSync(L.file).size + statSync(previousSegment(L.file)).size;
    assert.equal(onDisk, s.diskBytes);
    assert.ok(onDisk <= budget && maxDisk <= budget, 'disk ' + onDisk + ', max seen ' + maxDisk + ', budget ' + budget);
    assert.ok(s.maxDiskBytes >= onDisk && s.maxDiskBytes <= budget, 'the high-water mark ' + s.maxDiskBytes + ' of both segments stays under ' + budget);
    assert.deepEqual(readdirSync(dir).sort(), ['ledger.1.jsonl', 'ledger.jsonl']);
    const again = new Ledger({ dir, mode: 'full', budgetBytes: budget });
    assert.equal(again.seq, 5000, 'the seq resumes from the live segment after rotations');
  } finally { rmSync(dir, { recursive: true, force: true }); }

  // the daemon with ledger=full and a quarter megabyte budget writes far more than that and keeps two segments under it
  const p = await live({ majors: 4, substrateUnits: 64, name: 'full', seed: 'full', ticks: 120, checkpointEvery: 40, ledger: 'full', ledgerBudgetMb: 0.25 });
  const budget = 0.25 * 1024 * 1024;
  assert.equal(p.ledger.mode, 'full');
  assert.equal(p.ledger.budgetBytes, Math.floor(budget));
  assert.ok(p.ledger.bytesWritten > 2 * budget, 'wrote ' + p.ledger.bytesWritten);
  assert.ok(p.ledger.rotations >= 1, 'rotations ' + p.ledger.rotations);
  const f = path.join(p.dir, 'ledger', 'ledger.jsonl');
  const disk = statSync(f).size + statSync(previousSegment(f)).size;
  assert.ok(disk <= budget, 'on disk ' + disk + ' <= ' + budget);
  assert.ok(p.ledger.maxDiskBytes >= disk && p.ledger.maxDiskBytes <= budget, 'high-water mark ' + p.ledger.maxDiskBytes);
});

test('every step kind runs at least once in a short run, and each step is one ledger row with its wall ms', async () => {
  const p = await sharedRun();
  for (const k of STEP_KINDS) assert.ok(p.loop.steps[k] >= 1, k + ' ran ' + p.loop.steps[k] + ' times: ' + JSON.stringify(p.loop.steps));
  assert.equal(p.loop.skippedForAsk, 0);
  assert.ok(p.loop.spawn.carried >= 1 && p.loop.ingest.added >= 1, JSON.stringify({ spawn: p.loop.spawn, ingest: p.loop.ingest }));
  // the dream step dreams in a run whose every period also spawns: the spawn step's own asks do not stand it down
  assert.ok(p.loop.dream.dreamed >= 1 && p.loop.dream.ownAsks >= 1, JSON.stringify(p.loop.dream));
  assert.equal(p.loop.refused.dream, p.loop.dream.skipped, 'a skipped dream cycle is a refused step, not a dream');
  assert.equal(p.loop.selfCode.last.ok, true, 'the dry self-code run answered: ' + JSON.stringify(p.loop.selfCode));
  const steps = lines(path.join(p.dir, 'ledger', 'ledger.jsonl')).filter((r) => r.type === 'daemon.step');
  for (const k of STEP_KINDS) assert.equal(steps.filter((r) => r.kind === k && !r.refused).length, p.loop.steps[k], 'ledger rows for ' + k);
  for (const r of steps) assert.ok(Number.isFinite(r.ms) && r.ms >= 0, 'a step row carries its wall ms: ' + JSON.stringify(r));
  // the organism's own cells came to carry suite questions they did not carry at the start
  assert.equal(p.ruler.first.total.carried, 0);
  assert.ok(p.ruler.last.total.carried > p.ruler.first.total.carried, 'carried ' + p.ruler.first.total.carried + ' -> ' + p.ruler.last.total.carried);
  assert.ok(p.ruler.rates.whole.carried > 0);
});

test('self-code refuses while another live process holds a bench flag, and a dead or own flag does not count', async () => {
  const flags = mkdtempSync(path.join(tmpdir(), 'daemon-flags-'));
  try {
    // a pid that has exited: its flag is stale
    const gone = spawnSync(process.execPath, ['-e', '0']).pid;
    const stale = raiseBenchFlag({ dir: flags, pid: gone, command: 'exited' });
    raiseBenchFlag({ dir: flags, pid: process.pid, command: 'this process' });
    assert.equal(benchFlag({ dir: flags, selfPid: process.pid }), null, 'a dead pid and our own pid raise nothing');
    assert.equal(existsSync(stale.file), false, 'a killed bench never lowers its flag: the reader sweeps it');
    const held = raiseBenchFlag({ dir: flags, pid: process.ppid, command: 'node bench/something.mjs' });
    const seen = benchFlag({ dir: flags, selfPid: process.pid });
    assert.ok(seen && seen.pid === process.ppid, JSON.stringify(seen));
    const said = [];
    const p = await live({ ...TINY, name: 'flagged', seed: 'flagged', ticks: 120, selfCodeEvery: 20, benchFlagDir: flags, out: (l) => said.push(l) });
    assert.equal(p.loop.steps['self-code'], 0, 'no self-code run while the flag is up');
    assert.ok(p.loop.refused['self-code'] >= 2, 'refused ' + p.loop.refused['self-code']);
    assert.ok(p.loop.refusals.every((r) => r.kind !== 'self-code' || r.why === 'bench'));
    assert.ok(said.some((l) => l.startsWith('[self-code] refused at t=') && l.includes('pid ' + process.ppid)), said.filter((l) => l.startsWith('[self-code]')).join('\n'));
    const refusedRows = lines(path.join(p.dir, 'ledger', 'ledger.jsonl')).filter((r) => r.type === 'daemon.step' && r.kind === 'self-code');
    assert.ok(refusedRows.length >= 2 && refusedRows.every((r) => r.refused === 'bench' && r.flagPid === process.ppid));
    held.lower();
    assert.equal(benchFlag({ dir: flags, selfPid: process.pid }), null, 'lowered');
  } finally { rmSync(flags, { recursive: true, force: true }); }
});

test('the ruler reads back from a checkpoint: rates recompute from ruler.jsonl, the header carries the last row, the plateau replays, a resume continues', async () => {
  const p = await sharedRun();
  const rows = readRuler(p.dir).filter((r) => r.run === p.ruler.run);
  assert.equal(rows.length, p.ruler.rows);
  assert.ok(rows.length >= 4, 'rows ' + rows.length);
  for (const r of rows) {
    for (const key of ['at', 'atMs', 'wallMs', 't', 'done', 'scores', 'total', 'bytes']) assert.ok(r[key] !== undefined, 'row ' + r.k + ' carries ' + key);
    assert.ok(r.bytes.snapshot > 0 && r.bytes.ledgerWritten > 0, JSON.stringify(r.bytes));
  }
  assert.deepEqual(rulerRates(rows), p.ruler.rates, 'every rate recomputes from disk');
  for (let i = 1; i < rows.length; i++) assert.deepEqual(rows[i].step, rulerRates(rows).steps[i - 1], 'the step a row printed is the step its rows give');
  const head = checkpointRuler(p.snapshot);
  const last = rows[rows.length - 1];
  assert.ok(head, 'the checkpoint header carries a ruler');
  assert.equal(head.k, last.k); assert.equal(head.t, last.t); assert.equal(head.done, last.done);
  assert.deepEqual(head.scores, last.scores);
  assert.equal(head.score, last.total.exact); assert.equal(head.of, last.total.n);
  assert.equal(head.bytes, statSync(p.snapshot).size, 'the header states the size of its own file');
  const { state } = await replayPlateau(rows, { patience: TINY.plateauPatience });
  assert.equal(state.mode, p.ruler.plateau.mode);
  assert.deepEqual(state.fired, p.ruler.plateau.fired);
  assert.deepEqual(state.switches, p.ruler.plateau.switches);

  // a resume reads the rows back: its first row is k = last + 1, and the mode it starts in is the replayed one
  const said = [];
  const q = await live({ ...TINY, name: 'loop', seed: 'daemon-test', ticks: 60, benchFlagDir: path.join(STATE, 'flags-none'), out: (l) => said.push(l) });
  assert.equal(q.resumed, true);
  assert.equal(q.ruler.first.kind, 'start');
  assert.equal(q.ruler.first.k, last.k + 1);
  assert.equal(q.ruler.first.total.carried, last.total.carried, 'a resumed organism still carries what it carried');
  assert.ok(said.some((l) => l.startsWith('[ruler] k=' + (last.k + 1) + ' start')), said.filter((l) => l.startsWith('[ruler]')).join('\n'));
});

test('the plateau treats a suite at its reach as finished: a suite the exact path cannot complete does not fire forever', async () => {
  // the bar of 2026-09-24 ended at grid 159 of 160 (the exact path answers 159) and fired carried.grid on every arm
  const row = (k, withReach) => {
    const sc = (n, c) => (withReach ? { n, exact: c, carried: c, reach: c } : { n, exact: c, carried: c });
    return { k, t: k * 1000, done: k * 1000, atMs: 1e12 + k * 5000, run: 'synthetic', scores: { algebra: sc(360, 360), sequence: sc(205, 205), grid: sc(160, 159) }, total: { n: 725, exact: 724, carried: 724 }, generations: { best: null } };
  };
  assert.equal(coordinatesOf(row(0, true))['carried.grid'].ceiling, true);
  assert.equal(coordinatesOf(row(0, false))['carried.grid'].ceiling, false, 'a row from before reach existed uses n');
  const withReach = await replayPlateau([0, 1, 2, 3, 4, 5, 6, 7].map((k) => row(k, true)), { patience: 3 });
  assert.equal(withReach.state.mode, 'generations');
  assert.deepEqual(withReach.state.fired, []);
  assert.equal(withReach.state.switchCount, 0);
  // the control: the same rows without reach fire carried.grid, which is what the bar printed
  const without = await replayPlateau([0, 1, 2, 3, 4, 5, 6, 7].map((k) => row(k, false)), { patience: 3 });
  assert.deepEqual(without.state.fired, ['carried.grid']);
  assert.ok(without.state.switchCount >= 1);
});
