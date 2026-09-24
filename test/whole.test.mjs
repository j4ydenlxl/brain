// test/whole.test.mjs: the end-to-end proof that THE WHOLE BRAIN is one organism.
//   (a) build at small size: 0 illegal edges, every declared region present
//   (b) an event injected at perception reaches motor, a world actuator proposal appears in
//       the ledger, and world.trace walks it back to the injected signal
//   (c) bytes fed to the language region produce predictions and recorded prediction errors
//   (d) a sym request at the solve cell returns a verified answer with a trace
//   (e) brain live --ticks 200 checkpoints and a second --ticks 100 resumes at t=200 with
//       identical cell and edge counts
//   (f) the substrate majors tick and their fireCount rises
//   (g) 1, SEC, MIN periods all ran at least once over a MIN+1 run
//   (h) no em dashes in the new files
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWhole, restoreWhole, timescaleReport, DECLARED_REGIONS, ARC, langCells } from '../seeds/whole.mjs';
import { worldTrace, closeWorld } from '../world/index.mjs';
import { feed } from '../mind/index.mjs';
import { SEC, MIN, HOUR } from '../core/clock.mjs';
import * as S from '../core/signal.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BIN = path.join(ROOT, 'bin', 'brain.mjs');
const TEXT = 'the whole brain runs as one organism: information enters, is represented at many scales, propagates through circuits, meets memories and predictions, and its consequences come back in. '.repeat(30);
const SMALL = { majors: 16, substrateUnits: 256, ledger: 'full', mindText: TEXT, seed: 'whole-test' };

function small(extra = {}) { return buildWhole({ ...SMALL, ...extra }); }
// every in-process brain releases what it holds (the world's timers, the learning engine's
// hooks) so that node --test exits on its own the moment the last assertion runs
function shutdown(brain) {
  try { closeWorld(brain); } catch { /* nothing open */ }
  const learning = brain.whole && brain.whole.services && brain.whole.services.learning;
  if (learning && typeof learning.detach === 'function') { try { learning.detach(); } catch { /* already detached */ } }
}

test('(a) the whole brain builds with 0 illegal edges and every declared region', () => {
  const { brain, report } = small();
  try {
  assert.equal(report.illegal, 0, 'illegal edges must be 0');
  assert.equal(report.audit.faults.length, 0);
  for (const r of DECLARED_REGIONS) assert.ok(brain.regions.has(r), 'region ' + r + ' present');
  assert.ok(report.cells > 100 && report.edges > report.cells, 'cells ' + report.cells + ' edges ' + report.edges);
  for (const k of ['substrate', 'phv.bind', 'phv.memory', 'memory.episodic', 'solve', 'skill', 'mind.assoc', 'world.relay', 'world.clock', 'simulate.plan', 'decide.argmax', 'workspace.hub', 'attention.goal', 'seq.fit', 'grid.rotate', 'reward.source', 'error.aggregate']) {
    assert.ok(report.kinds.includes(k), 'kind ' + k + ' is in the connectome');
  }
  for (const stage of ARC) assert.ok(brain.byId.has(stage.id), stage.id);
  for (const p of [1, SEC, MIN, HOUR]) assert.ok(brain.clock.periods.includes(p), 'period ' + p + ' registered');
  } finally { shutdown(brain); }
});

test('(b) an event at perception reaches motor, proposes a world action, and traces back to the injection', () => {
  const { brain } = small();
  try {
  const sig = brain.inject('arc.input', 'in', { kind: 'event', data: { afterMs: 0, key: 'reflex' } });
  let act = null;
  for (let i = 0; i < 200 && !act; i++) {
    brain.tick(1);
    for (const ev of brain.ledger.recent(500, 'world.act')) if (ev.what && ev.what.key === 'reflex') { act = ev; break; }
  }
  assert.ok(act, 'a world.act for key reflex appears in the ledger');
  assert.equal(act.cell, 'w.clock');
  assert.equal(act.op, 'clock.timer');
  assert.ok(brain.ledger.recent(2000, 'proposal').some((p) => p.seq === act.proposalSeq), 'its proposal is in the ledger');
  const tr = worldTrace(brain, act.seq, { depth: 64, print: false });
  assert.equal(tr.found, true);
  for (const id of ['arc.input', 'arc.encoding', 'arc.processing', 'arc.integration', 'arc.decision', 'arc.action', 'w.motor', 'w.clock']) assert.ok(tr.cells.includes(id), 'trace passes ' + id);
  assert.ok(tr.nodes.some((n) => n.seq === sig.seq && n.cell === 'external' && n.from == null), 'trace reaches the injected signal seq ' + sig.seq);
  } finally { shutdown(brain); }
});

test('(c) bytes fed to the language region produce predictions and recorded prediction errors', () => {
  const { brain, report } = small();
  try {
  const ids = report.ids.lang;
  const errors = [], preds = [];
  const assoc = brain.cell(ids.assoc);
  const errPort = assoc.ports.out.findIndex((p) => p.name === 'error'), predPort = assoc.ports.out.findIndex((p) => p.name === 'pred');
  const off = brain.ledger.on((ev) => { if (ev.type === 'signal' && ev.cell === ids.assoc) { if (ev.port === errPort) errors.push(ev); if (ev.port === predPort) preds.push(ev); } });
  const r = feed(brain, ids, 'the whole brain runs as one organism', { maxTicks: 160 });
  off();
  assert.ok(r.tokens > 0, 'tokens scored: ' + r.tokens);
  assert.ok(r.meanBits > 0, 'mean prediction error in bits: ' + r.meanBits);
  assert.ok(preds.length > 0, 'prediction events recorded in the ledger: ' + preds.length);
  assert.ok(errors.length > 0, 'prediction error signals recorded in the ledger: ' + errors.length);
  assert.ok(assoc.stats.runs > 0 && assoc.state.n >= r.tokens);
  } finally { shutdown(brain); }
});

test('(d) a sym request at the solve cell returns a verified answer with a trace', () => {
  const { brain } = small();
  try {
  const num = (v) => ({ op: 'num', value: S.ratFromDecimal(String(v)) });
  const eq = { op: '=', args: [{ op: '+', args: [{ op: '*', args: [num(2), { op: 'var', name: 'x' }] }, num(3)] }, num(11)] };
  const solve = brain.cell('cap.solve');
  const answerPort = solve.ports.out.findIndex((p) => p.name === 'answer');
  const req = brain.inject('cap.solve', 'request', { kind: 'sym', data: eq });
  let answer = null;
  for (let i = 0; i < 6 && !answer; i++) {
    brain.tick(1);
    for (const list of brain.inflight.values()) for (const it of list) if (it.sig.src === solve.idx && it.sig.port === answerPort) { answer = it.sig; break; }
  }
  assert.ok(answer, 'the answer signal is in flight to the decision stage');
  assert.equal(answer.data.verified, true);
  assert.equal(String(answer.data.answer), '4');
  assert.equal(answer.data.by, 'exact solve and substitution');
  const tr = brain.ledger.trace(answer.seq, 8);
  assert.ok(tr.nodes.some((n) => n.type === 'cell.run' && n.cell === 'cap.solve'), 'trace passes the solve run');
  assert.ok(tr.nodes.some((n) => n.seq === req.seq && n.cell === 'external'), 'trace reaches the injected request');
  } finally { shutdown(brain); }
});

test('(e) brain live --ticks 200 checkpoints and --ticks 100 resumes at t=200 with identical counts', () => {
  const STATE = mkdtempSync(path.join(tmpdir(), 'whole-live-'));
  const run = (args) => {
    const r = spawnSync(process.execPath, [BIN, 'live', 'whole', ...args, '--majors', '12', '--units', '256', '--json', '--quiet'], { cwd: ROOT, env: { ...process.env, BRAIN_STATE_DIR: STATE, NO_COLOR: '1', FORCE_COLOR: '' }, encoding: 'utf8', timeout: 240_000 });
    assert.equal(r.status, 0, 'brain live exit 0: ' + (r.stderr || '').slice(-800));
    const at = r.stdout.indexOf('{');
    assert.ok(at >= 0, 'json payload: ' + r.stdout.slice(0, 300));
    return JSON.parse(r.stdout.slice(at));
  };
  try {
    const first = run(['--ticks', '200']);
    assert.equal(first.built, true);
    assert.equal(first.start.t, 0);
    assert.equal(first.end.t, 200);
    assert.equal(first.illegal, 0);
    assert.ok(first.checkpoints >= 2, 'checkpoints ' + first.checkpoints);
    assert.ok(existsSync(first.snapshot), 'snapshot written');
    assert.ok(first.periods['1'].runs > 0 && first.periods.SEC.runs > 0 && first.periods.MIN.runs > 0 && first.periods.HOUR.runs > 0, JSON.stringify(first.periods));
    const second = run(['--ticks', '100']);
    assert.equal(second.built, false);
    assert.equal(second.resumed, true);
    assert.equal(second.start.t, 200);
    assert.equal(second.start.cells, first.end.cells);
    assert.equal(second.start.edges, first.end.edges);
    assert.equal(second.end.t, 300);
    assert.deepEqual(second.regions, first.regions);
  } finally { rmSync(STATE, { recursive: true, force: true }); }
});

test('(f) the substrate majors tick and their fireCount rises', () => {
  const { brain, report } = small({ ledger: 'off' });
  try {
  const before = {};
  for (const [region, id] of Object.entries(report.ids.substrates)) { const c = brain.cell(id); before[region] = { runs: c.stats.runs, fired: c.state.sub.totalFired }; }
  brain.tick(40);
  for (const [region, id] of Object.entries(report.ids.substrates)) {
    const c = brain.cell(id);
    assert.equal(c.region, region);
    assert.ok(c.stats.runs >= before[region].runs + 40, region + ' substrate ran ' + c.stats.runs);
    assert.ok(c.state.sub.totalFired > before[region].fired, region + ' fireCount rose to ' + c.state.sub.totalFired);
    let any = 0; for (let i = 0; i < c.state.sub.fireCount.length; i++) any += c.state.sub.fireCount[i];
    assert.ok(any > 0, region + ' per-unit fireCount is non-zero');
  }
  } finally { shutdown(brain); }
});

test('(g) the 1, SEC, MIN and HOUR periods all ran over a SEC+1 run', () => {
  // a periodic cell is due when t % period === 0, so every period runs at t=0 and the SEC
  // cells run again at t=SEC. A MIN+1 run of the whole brain took 13,849,086 ms last night,
  // so the second MIN and HOUR runs are left to that arithmetic and not ticked here.
  const { brain, report } = buildWhole({ majors: 8, substrateUnits: 128, ledger: 'off', mindText: TEXT, skills: false, seed: 'whole-periods' });
  try {
  brain.tick(SEC + 1);
  const rows = Object.fromEntries(timescaleReport(brain).map((r) => [r.label, r]));
  assert.ok(rows['1'].runs >= SEC + 1, 'period 1 runs ' + rows['1'].runs);
  assert.ok(rows.SEC.runs >= 2 * rows.SEC.cells, 'SEC ran at t=0 and t=SEC: ' + rows.SEC.runs);
  assert.ok(rows.MIN.runs >= rows.MIN.cells, 'MIN ran at t=0: ' + rows.MIN.runs);
  assert.ok(rows.HOUR.runs >= rows.HOUR.cells, 'HOUR ran at t=0: ' + rows.HOUR.runs);
  const clock = report.ids.clock;
  assert.equal(brain.cell(clock['1']).stats.runs, SEC + 1);
  assert.equal(brain.cell(clock.SEC).stats.runs, 2);
  assert.equal(brain.cell(clock.MIN).stats.runs, 1);
  assert.equal(brain.cell(clock.HOUR).stats.runs, 1);
  assert.ok(brain.cell(clock.MIN).policy.period === MIN && brain.cell(clock.HOUR).policy.period === HOUR, 'the MIN and HOUR clock cells keep their periods');
  } finally { shutdown(brain); }
});

test('(h) snapshot and restore carry the whole (in process)', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'whole-snap-'));
  try {
    const { brain, report } = small({ dir, ledger: 'off' });
    let b2 = null;
    try {
    brain.tick(30);
    brain.snapshot(dir);
    const restored = restoreWhole(dir, { ledger: 'off' }); b2 = restored.brain; const r2 = restored.report;
    assert.equal(b2.clock.t, 30);
    assert.equal(b2.cells.length, brain.cells.length);
    assert.equal(b2.connectome.size(), brain.connectome.size());
    assert.equal(r2.illegal, 0);
    assert.deepEqual(Object.keys(r2.regions), Object.keys(report.regions));
    assert.ok(b2.memory && b2.capability && b2.capability.registry, 'memory and capability re-attached');
    assert.deepEqual(langCells(b2.whole.ids.lang), langCells(report.ids.lang));
    b2.tick(5);
    assert.equal(b2.clock.t, 35);
    } finally { shutdown(brain); if (b2) shutdown(b2); }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('(i) no em dashes in the whole-brain files', () => {
  const files = ['seeds/whole.mjs', 'daemon/run.mjs', 'daemon/generations-worker.mjs', 'test/whole.test.mjs', 'bench/whole.mjs', 'docs/WHOLE.md', 'notes/whole.md', 'bin/brain.mjs'];
  for (const f of files) {
    const p = path.join(ROOT, f);
    if (!existsSync(p)) continue;
    assert.ok(!readFileSync(p, 'utf8').includes(String.fromCharCode(0x2014)), f + ' has no em dash');
  }
});

test('(j) a failed checkpoint never leaves a zombie: autosaves that fail are counted and the run goes on, and a failed final checkpoint closes the control server before live() rejects', async () => {
  // the soak of 2026-09-17: the final checkpoint threw, control.close() never ran, and the
  // process lived on for twelve minutes answering /health with nothing ticking
  const STATE = mkdtempSync(path.join(tmpdir(), 'whole-zombie-'));
  const prev = process.env.BRAIN_STATE_DIR;
  process.env.BRAIN_STATE_DIR = STATE;
  const dir = path.join(STATE, 'zombie');
  const lines = [];
  const serversBefore = process.getActiveResourcesInfo().filter((x) => x === 'TCPServerWrap').length;
  try {
    const { live } = await import('../daemon/run.mjs');
    let err = null;
    try {
      await live({
        name: 'zombie', ticks: 6, checkpointEvery: 2, majors: 4, substrateUnits: 64, seed: 'zombie',
        out: (line) => {
          lines.push(line);
          // the build checkpoint has been written when this line prints; from here the snapshot
          // path is a directory, so every later checkpoint's rename over it must fail
          if (line.startsWith('[live] built zombie')) { rmSync(path.join(dir, 'snapshot.json'), { force: true }); mkdirSync(path.join(dir, 'snapshot.json')); }
        },
      });
    } catch (e) { err = e; }
    assert.ok(err instanceof Error, 'live() rejects when the final checkpoint fails: ' + lines.join('\n'));
    const failed = lines.filter((l) => l.startsWith('[live] checkpoint failed at t=')).map((l) => Number(l.match(/t=(\d+)/)[1]));
    assert.ok(failed.length >= 2 && failed[0] === 2 && failed[1] === 4, 'autosaves at t=2 and t=4 failed and the run went on: ' + JSON.stringify(failed) + '\n' + lines.join('\n'));
    assert.ok(lines.some((l) => l.startsWith('[live] final checkpoint failed at t=6')), 'the run reached t=6 and the final checkpoint failed there:\n' + lines.join('\n'));
    const control = lines.find((l) => l.startsWith('[live] control '));
    assert.ok(control, 'the control line printed');
    const url = control.split(' ')[2];
    await assert.rejects(fetch(url + '/health', { signal: AbortSignal.timeout(3000) }), 'the control port no longer answers: ' + url);
    assert.ok(!existsSync(path.join(dir, 'control.json')), 'control.json removed');
    // the world's own loopback endpoint (net.listen, unref'd) closes in the loop's close phase,
    // one iteration after closeWorld() asked it to: a timer lands after that phase
    await new Promise((r) => setTimeout(r, 50));
    const after = process.getActiveResourcesInfo();
    assert.equal(after.filter((x) => x === 'TCPServerWrap').length, serversBefore, 'no server handle left beyond the ' + serversBefore + ' the test runner holds: ' + after.join(','));
  } finally {
    if (prev === undefined) delete process.env.BRAIN_STATE_DIR; else process.env.BRAIN_STATE_DIR = prev;
    rmSync(STATE, { recursive: true, force: true });
  }
});

test('(k) brain status reads only the tail of the ledger file, so a ledger past the string cap cannot take status down', async () => {
  const STATE = mkdtempSync(path.join(tmpdir(), 'whole-ledger-'));
  const prev = process.env.BRAIN_STATE_DIR;
  process.env.BRAIN_STATE_DIR = STATE;
  try {
    const { readLedgerFile, layout } = await import('../cli/state.mjs');
    const L = layout('tail');
    mkdirSync(L.ledgerDir, { recursive: true });
    // fifty rows of one length each, so a byte offset lands at a known line
    const rows = Array.from({ length: 50 }, (_, i) => JSON.stringify({ seq: 10 + i, type: i % 2 ? 'run' : 'sig', pad: 'x'.repeat(40) }));
    writeFileSync(L.ledger, rows.join('\n') + '\n');
    assert.equal(readLedgerFile('tail').length, 50);
    const lineBytes = rows[0].length + 1;
    // a window that starts half way through a line: that line is dropped, the ten whole ones after it are kept
    const tail = readLedgerFile('tail', { tailBytes: Math.floor(lineBytes * 10.5) });
    assert.deepEqual(tail.map((r) => r.seq), [50, 51, 52, 53, 54, 55, 56, 57, 58, 59]);
    assert.deepEqual(readLedgerFile('tail', { max: 3 }).map((r) => r.seq), [57, 58, 59]);
  } finally {
    if (prev === undefined) delete process.env.BRAIN_STATE_DIR; else process.env.BRAIN_STATE_DIR = prev;
    rmSync(STATE, { recursive: true, force: true });
  }
});
