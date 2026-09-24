// test/self.test.mjs: the self improving loop, held to its own claims.
//
//   1. observation is FINITE and names EVERY region, on a brain that has ticked and on one
//      that never has (no 0/0 NaN anywhere, no region left out of the self model)
//   2. a candidate with a FALSE hypothesis is REFUTED against a matched control, and the
//      numbers that refuted it travel with the verdict
//   3. an approved change LANDS on the live brain and is TRACEABLE in the ledger back to
//      the observation that produced it
//   4. a change the policy DENIES never lands, and the brain is byte for byte unchanged
//   5. refuted candidates are ARCHIVED and never proposed again
//   6. a daemon CHECKPOINT resumes: round numbering and the archive survive a restart
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildOrganism } from '../seeds/organism.mjs';
import { Brain } from '../core/brain.mjs';
import '../cells/index.mjs';
import { observe, measure, measureRegions, health, symValue, symEnv, METRICS, watch, finite } from '../self/observe.mjs';
import { propose, applyDelta, hypothesis, candidateKey, readMetric, barFrom, deltaLine, spillFloor, SPILL_P95, pruneCap, PRUNE_CAP_RULE } from '../self/propose.mjs';
import { trial, trialAll, inputStream, grade, resetWindow, armDigest, runArm } from '../self/trial.mjs';
import { arm, isArmed, apply, applyAll, Archive, selfPolicy, traceApply, SELF_KIND } from '../self/apply.mjs';
import { SelfDaemon } from '../self/daemon.mjs';
import { fingerprint, cloneSub } from '../simulate/clone.mjs';

const TMP = mkdtempSync(path.join(tmpdir(), 'brain-self-'));
test.after(() => { try { rmSync(TMP, { recursive: true, force: true }); } catch {} });

function organism(seed = 'self-test', majors = 12) {
  const b = buildOrganism({ majors, seed, name: 'self-' + seed, ledger: 'runs' });
  return b;
}

// ---------------------------------------------------------------- 1. observation
test('observation is finite and names every region', () => {
  const b = organism('finite');
  b.tick(48);
  const model = observe(b);
  assert.deepEqual(model.regionNames, [...b.regions.keys()]);
  for (const name of b.regions.keys()) {
    assert.ok(model.regions[name], 'region ' + name + ' missing from the self model');
    for (const [k, v] of Object.entries(model.regions[name])) {
      if (typeof v === 'number') assert.ok(Number.isFinite(v), name + '.' + k + ' is not finite: ' + v);
    }
  }
  for (const k of METRICS) assert.ok(Number.isFinite(model.metrics[k]), 'metric ' + k + ' is not finite');
  assert.ok(Number.isFinite(model.health) && model.health >= 0 && model.health <= 1);
  // the sym signal evaluates, and its value IS the health number
  assert.equal(Math.abs(symValue(model.sym) - model.health) < 1e-9, true);
  const env = symEnv(model.sym);
  assert.ok(env['self.runs'] !== undefined && env['region.perception.idleRate'] !== undefined);
});

test('observation of a brain that never ticked is zeros, not NaN', () => {
  const b = organism('cold');
  const model = observe(b);
  assert.equal(model.metrics.ticks, 0);
  for (const k of METRICS) assert.ok(Number.isFinite(model.metrics[k]), k + ' is ' + model.metrics[k]);
  assert.equal(model.metrics.runsPerTick, 0);   // 0 runs over 0 ticks is 0 here, never NaN
  assert.equal(model.metrics.errorRate, 0);
  assert.equal(finite(NaN), 0);
  // every region still named, even with nothing to report
  assert.equal(Object.keys(model.regions).length, b.regions.size);
});

test('observation is read only and the periodic eye fires every K ticks', () => {
  const b = organism('watch');
  b.tick(8);
  const before = fingerprint(b);
  observe(b, { log: false });
  assert.equal(fingerprint(b), before, 'observe() changed the brain');
  const w = watch(b, { every: 16, log: false });
  b.tick(64);
  assert.equal(w.count, 4, 'expected 4 observations in 64 ticks at K=16, got ' + w.count);
  w.detach();
  const n = w.count;
  b.tick(32);
  assert.equal(w.count, n, 'detached watcher kept observing');
});

// ---------------------------------------------------------------- 2. falsification
test('a candidate with a false hypothesis is refuted on a matched control', () => {
  const b = organism('refute');
  b.tick(64);
  const model = observe(b, { log: false });
  const region = [...b.regions.keys()][0];
  // A deliberately false claim: one added cell raises a whole region's runs by 10x.
  const cand = {
    id: 'false.1', key: 'test:false', from: model.seq, at: { t: b.clock.t, gen: 0 },
    delta: { kind: 'skill.add', region, cellKind: [...b.regions.get(region).cells].map(i => b.cells[i].kind)[0], count: 1, circuit: 'test.false.' + region },
    hypothesis: hypothesis({ metric: 'region.' + region + '.runs', direction: 'up', ratio: 10, why: 'deliberately false' }),
    why: 'a false hypothesis must be refuted',
  };
  const r = trial(b, cand, { ticks: 24 });
  assert.equal(r.verdict, 'refuted', 'expected refuted, got ' + r.verdict + ' (' + r.reason + ')');
  assert.ok(Number.isFinite(r.treated) && Number.isFinite(r.control), 'the verdict carries both arms');
  assert.ok(r.treated < 10 * r.control);
  assert.equal(r.identicalArms, true, 'the two arms were not matched before the delta');
});

test('the two arms are identical until the delta touches one of them', () => {
  const b = organism('arms');
  b.tick(32);
  const model = observe(b, { log: false });
  const cands = propose(b, model, { max: 3 });
  assert.ok(cands.length > 0, 'the proposer produced nothing to try');
  for (const c of cands) {
    const r = trial(b, c, { ticks: 16 });
    assert.equal(r.identicalArms, true, 'arms differed before the delta for ' + c.key);
    assert.ok(['confirmed', 'refuted', 'undecided', 'inapplicable'].includes(r.verdict));
  }
});

test('a trial never touches the live organism', () => {
  const b = organism('isolation');
  b.tick(32);
  const model = observe(b, { log: false });
  const cands = propose(b, model, { max: 4 });
  const before = fingerprint(b), cells = b.cells.length, edges = b.connectome.size();
  for (const c of cands) trial(b, c, { ticks: 12 });
  assert.equal(b.cells.length, cells);
  assert.equal(b.connectome.size(), edges);
  assert.equal(fingerprint(b), before, 'a trial changed the live brain');
});

test('grade is exact: the hypothesis decides, the noise band only decides ties', () => {
  const cand = { hypothesis: hypothesis({ metric: 'self.runs', direction: 'up', ratio: 1.05 }) };
  const arm = (runs) => ({ metrics: { runs }, regions: {} });
  assert.equal(grade(cand, arm(110), arm(100)).verdict, 'confirmed');
  assert.equal(grade(cand, arm(80), arm(100)).verdict, 'refuted');
  assert.equal(grade(cand, arm(100), arm(100)).verdict, 'undecided');
  assert.equal(grade(cand, arm(100.2), arm(100)).verdict, 'undecided');
  // a metric neither arm has is undecided, never zero
  const missing = { hypothesis: hypothesis({ metric: 'region.nowhere.runs', direction: 'up' }) };
  assert.equal(grade(missing, arm(1), arm(1)).verdict, 'undecided');
  assert.equal(barFrom(1 / 100) > 0, true);
  assert.equal(barFrom(0), 0.005, 'the floor is the measured spillover band');
});

// ---------------------------------------------------------------- 3. approval lands
test('an approved change lands and is traceable in the ledger to its observation', () => {
  const b = organism('land');
  b.tick(64);
  arm(b.gate, { minGainPct: 0 });   // any confirmed gain is enough for this brain
  assert.equal(isArmed(b.gate), true);
  const model = observe(b);
  const region = 'perception';
  const kind = b.cells[[...b.regions.get(region).cells][0]].kind;
  const delta = { kind: 'region.grow', region, cellKind: kind, count: 2, circuit: 'test.land' };
  const result = {
    candidate: 'land.1', key: candidateKey(delta), delta, line: deltaLine(delta),
    hypothesis: 'growth lands', metric: 'region.' + region + '.runs', verdict: 'confirmed',
    treated: 110, control: 100, gain: 10, gainPct: 10, healthGain: 0.01,
    identicalArms: true, applied: { cells: 2, edges: 4 }, ticks: 24, from: model.seq,
  };
  const cells = b.cells.length;
  const d = apply(b, result);
  assert.equal(d.status, 'applied');
  assert.equal(b.cells.length, cells + 2, 'the approved change did not land');
  assert.ok(b.byId.has('test.land.0') && b.byId.has('test.land.1'));

  const tr = traceApply(b, d.seq);
  assert.equal(tr.reachedObservation, true, 'the application does not trace back to an observation');
  assert.equal(tr.observation, model.seq);
  assert.deepEqual(tr.chain.map(c => c.type), ['self.apply', 'self.trial', 'self.observe']);
  // the gate recorded a proposal and a decision of the new kind
  const kinds = b.ledger.recent(200).filter(e => e.type === 'proposal' && e.kind === SELF_KIND);
  assert.ok(kinds.length >= 1, 'no self.improve proposal in the ledger');
  const decision = b.ledger.recent(200).find(e => e.type === 'decision' && e.kind === SELF_KIND);
  assert.equal(decision.status, 'approved');
});

test('a full round observes, proposes, trials and applies through the gate', () => {
  const b = organism('round');
  b.tick(64);
  arm(b.gate, { minGainPct: 0 });
  const model = observe(b);
  const cands = propose(b, model, { max: 4, round: 1 });
  const { results } = trialAll(b, cands, { ticks: 20 });
  const report = applyAll(b, results, { archive: new Archive() });
  assert.equal(report.decisions.length, results.length);
  const confirmed = results.filter(r => r.verdict === 'confirmed').length;
  assert.equal(report.applied <= confirmed, true, 'more changes landed than were confirmed');
  for (const d of report.decisions) if (d.applied) assert.equal(d.trace.reachedObservation, true);
});

// ---------------------------------------------------------------- 4. refusal holds
test('a change the policy denies never lands', () => {
  const b = organism('deny');
  b.tick(48);
  arm(b.gate, { policy: () => 'reject' });
  const model = observe(b);
  const delta = { kind: 'region.grow', region: 'perception', cellKind: b.cells[0].kind, count: 2, circuit: 'test.deny' };
  const result = {
    candidate: 'deny.1', key: candidateKey(delta), delta, line: deltaLine(delta), hypothesis: 'denied',
    metric: 'region.perception.runs', verdict: 'confirmed', treated: 999, control: 1, gain: 998, gainPct: 99800,
    healthGain: 1, identicalArms: true, applied: { cells: 2, edges: 4 }, ticks: 24, from: model.seq,
  };
  const before = fingerprint(b), cells = b.cells.length, edges = b.connectome.size();
  const d = apply(b, result);
  assert.equal(d.applied, false);
  assert.equal(d.status, 'rejected');
  assert.equal(b.cells.length, cells);
  assert.equal(b.connectome.size(), edges);
  assert.equal(fingerprint(b), before, 'a rejected change changed the brain anyway');
  assert.equal(b.ledger.recent(50).some(e => e.type === 'decision' && e.kind === SELF_KIND && e.status === 'rejected'), true);
});

test('a held proposal waits for a human and lands only when decided', () => {
  const b = organism('hold');
  b.tick(48);
  arm(b.gate, { minGainPct: 0, requireHuman: true });
  const model = observe(b);
  const delta = { kind: 'region.grow', region: 'perception', cellKind: b.cells[0].kind, count: 1, circuit: 'test.hold' };
  const result = {
    candidate: 'hold.1', key: candidateKey(delta), delta, line: deltaLine(delta), hypothesis: 'held',
    metric: 'region.perception.runs', verdict: 'confirmed', treated: 11, control: 10, gain: 1, gainPct: 10,
    healthGain: 0.01, identicalArms: true, applied: { cells: 1, edges: 2 }, ticks: 24, from: model.seq,
  };
  const cells = b.cells.length;
  const d = apply(b, result);
  assert.equal(d.status, 'pending');
  assert.equal(d.applied, false);
  assert.equal(b.cells.length, cells, 'a held change landed without a decision');
  assert.equal(b.gate.listPending().length, 1);
  const decided = b.gate.decide(d.proposal.id, true, 'human', b.ctx);
  assert.equal(decided.status, 'approved');
  assert.equal(b.cells.length, cells, 'approving in the gate must not apply anything by itself');
});

test('an unarmed gate refuses self.improve outright', () => {
  const b = organism('unarmed');
  b.tick(8);
  assert.equal(isArmed(b.gate), false);
  const delta = { kind: 'region.grow', region: 'perception', cellKind: b.cells[0].kind, count: 1, circuit: 'test.unarmed' };
  const d = apply(b, { key: 'x', delta, verdict: 'confirmed', metric: 'm', treated: 2, control: 1, gainPct: 100, identicalArms: true, from: -1, applied: { cells: 1, edges: 1 } });
  assert.equal(d.status, 'unarmed');
  assert.equal(d.applied, false);
  assert.throws(() => b.gate.propose({ kind: SELF_KIND, what: {}, evidence: {} }, b.ctx), /unknown proposal kind/);
});

test('the policy rejects a change whose control was not matched', () => {
  const p = selfPolicy({ minGainPct: 1 });
  const base = { evidence: { deltaKind: 'region.grow', verdict: 'confirmed', gainPct: 5, identicalArms: true, cells: 1, edges: 2 } };
  assert.equal(p(base), 'approve');
  assert.equal(p({ evidence: { ...base.evidence, identicalArms: false } }), 'reject');
  assert.equal(p({ evidence: { ...base.evidence, verdict: 'undecided' } }), 'reject');
  assert.equal(p({ evidence: { ...base.evidence, gainPct: 0.2 } }), 'reject');
  assert.equal(p({ evidence: { ...base.evidence, cells: 99 } }), 'reject');
});

// ---------------------------------------------------------------- 5. the archive
test('refuted candidates are archived and never proposed again', () => {
  const b = organism('archive');
  b.tick(64);
  const model = observe(b, { log: false });
  const first = propose(b, model, { max: 5, round: 1 });
  assert.ok(first.length > 0);
  const archive = new Archive(path.join(TMP, 'archive.json'));
  for (const c of first) archive.remember(c.key, 'refuted', { line: deltaLine(c.delta), metric: c.hypothesis.metric });
  const again = propose(b, model, { archive: archive.keys(), max: 5, round: 1 });
  for (const c of again) assert.equal(archive.has(c.key), false, 'a refuted candidate was proposed again: ' + c.key);
  assert.equal(first.some(c => again.some(d => d.key === c.key)), false);
  // and it survives a save and reload
  archive.save();
  const reloaded = new Archive(path.join(TMP, 'archive.json'));
  assert.equal(reloaded.size, archive.size);
  assert.equal(reloaded.counts().refuted, first.length);
  for (const c of first) assert.equal(reloaded.has(c.key), true);
});

test('a candidate key is stable across rounds and across processes', () => {
  const delta = { kind: 'conduit.prune', region: 'motor', edges: [{ src: 'a', dst: 'b', srcPort: 0, dstPort: 1 }] };
  assert.equal(candidateKey(delta), candidateKey(JSON.parse(JSON.stringify(delta))));
  assert.notEqual(candidateKey(delta), candidateKey({ ...delta, region: 'memory', edges: [{ src: 'a', dst: 'c', srcPort: 0, dstPort: 1 }] }));
});

// ---------------------------------------------------------------- 6. the daemon
test('the daemon checkpoints and resumes', async () => {
  const dir = path.join(TMP, 'daemon');
  const b1 = organism('daemon');
  b1.tick(32);
  const d1 = new SelfDaemon(b1, { minutes: 5, rounds: 1, plateau: 9, candidates: 2, trialTicks: 12, liveTicks: 8, dir, log: false });
  const r1 = await d1.run();
  assert.equal(r1.totals.rounds, 1);
  assert.equal(existsSync(path.join(dir, 'checkpoint.json')), true);
  const cp = JSON.parse(readFileSync(path.join(dir, 'checkpoint.json'), 'utf8'));
  assert.equal(cp.round, 1);
  assert.ok(cp.rounds.length === 1 && cp.rounds[0].candidates >= 0);

  const b2 = organism('daemon');
  b2.tick(32);
  const d2 = new SelfDaemon(b2, { minutes: 5, rounds: 2, plateau: 9, candidates: 2, trialTicks: 12, liveTicks: 8, dir, log: false, resume: true });
  assert.equal(d2.resumed, true);
  assert.equal(d2.round, 1, 'a resumed daemon restarted its round counter');
  assert.equal(d2.archive.size >= 0, true);
  const r2 = await d2.run();
  assert.equal(r2.resumed, true);
  assert.equal(d2.round, 2, 'the resumed daemon did not continue past the checkpoint round');
  // every key the first run archived is still archived after the resume
  const a1 = new Archive(path.join(dir, 'archive.json'));
  assert.equal(a1.size >= d1.archive.size, true);
});

test('the daemon stops on the plateau rule and prints the numbers', async () => {
  const dir = path.join(TMP, 'plateau');
  const b = organism('plateau');
  b.tick(32);
  const lines = [];
  // nothing can ever be confirmed: every hypothesis bar is impossible
  const d = new SelfDaemon(b, { minutes: 5, plateau: 2, candidates: 2, trialTicks: 8, liveTicks: 4, dir, log: (l) => lines.push(l) });
  const origin = d.runRound.bind(d);
  d.runRound = async () => { const row = await origin(); row.confirmed = 0; d.dry++; return row; };
  const r = await d.run();
  assert.equal(r.stop.reason, 'plateau');
  assert.equal(typeof r.stop.rule, 'string');
  assert.match(r.stop.text, /consecutive rounds/);
  assert.equal(typeof r.stop.candidatesTried, 'number');
  assert.ok(lines.some(l => l.includes('plateau')), 'the plateau rule was not printed');
  assert.ok(r.metric.before !== null && r.metric.after !== null);
});

test('the daemon report carries the numbers the bench prints', async () => {
  const dir = path.join(TMP, 'report');
  const b = organism('report');
  b.tick(32);
  const d = new SelfDaemon(b, { minutes: 5, rounds: 1, plateau: 9, candidates: 3, trialTicks: 10, liveTicks: 8, dir, log: false });
  const r = await d.run();
  for (const k of ['rounds', 'candidates', 'confirmed', 'refuted', 'undecided', 'inapplicable', 'applied', 'rejected']) {
    assert.equal(typeof r.totals[k], 'number', 'totals.' + k + ' missing');
  }
  assert.equal(r.totals.candidates, r.totals.confirmed + r.totals.refuted + r.totals.undecided + r.totals.inapplicable, 'every candidate must land in exactly one verdict');
  assert.ok(Number.isFinite(r.metric.before) && Number.isFinite(r.metric.after));
  assert.equal(r.rounds.length, 1);
  assert.ok(r.rounds[0].trials.length === r.rounds[0].candidates);
  assert.equal(r.gate.approved >= r.totals.applied, true, 'more applications than approvals');
  // at most one change PER REGION per round (test/self-throttle.test.mjs covers the rule
  // itself): a round may confirm several, but only what was measured as it is applied may
  // land, and the rest are left unarchived for the next round to re-measure. The default
  // cap is a ceiling well above any organism's region count, never the real limit.
  assert.equal(r.opts.applyPerRound, 32);
  assert.ok(r.rounds[0].applied <= r.rounds[0].candidates, 'more changes landed than were even proposed');
  assert.ok(r.rounds[0].submitted <= r.rounds[0].candidates);
});

// ---------------------------------------------------------------- deltas
test('applyDelta lands the same change on a clone and on the live brain', () => {
  const b = organism('delta');
  b.tick(24);
  const region = 'memory';
  const kind = b.cells[[...b.regions.get(region).cells][0]].kind;
  const delta = { kind: 'region.grow', region, cellKind: kind, count: 3, circuit: 'test.delta' };
  const clone = cloneSub(b, { name: b.name + '.arm', seed: 'delta' });
  const onClone = applyDelta(clone, delta);
  const cells = b.cells.length, edges = b.connectome.size();
  const onLive = applyDelta(b, delta);
  assert.equal(onClone.ok, true, onClone.reason);
  assert.equal(onLive.ok, true, onLive.reason);
  assert.deepEqual(onLive.added, onClone.added, 'the same delta added different cells to the two brains');
  assert.equal(onLive.edges, onClone.edges, 'the same delta wired a different number of edges');
  assert.equal(b.cells.length, cells + 3);
  assert.equal(b.connectome.size(), edges + onLive.edges);
  // a second identical delta gets fresh ids rather than colliding
  const r2 = applyDelta(b, { kind: 'region.grow', region, cellKind: kind, count: 1, circuit: 'test.delta' });
  assert.equal(r2.ok, true, r2.reason);
  assert.notEqual(r2.added[0], onLive.added[0]);
});

test('a delta that cannot land says why and changes nothing', () => {
  const b = organism('bad');
  b.tick(8);
  const before = fingerprint(b);
  const r = applyDelta(b, { kind: 'region.grow', region: 'nowhere', cellKind: 'num.arith', count: 1, circuit: 'x' });
  assert.equal(r.ok, false);
  assert.match(r.reason, /no region/);
  const r2 = applyDelta(b, { kind: 'period.change', circuit: 'nowhere/none', to: 4 });
  assert.equal(r2.ok, false);
  const r3 = applyDelta(b, { kind: 'conduit.add', src: 'nope', dst: 'nope2' });
  assert.equal(r3.ok, false);
  const r4 = applyDelta(b, { kind: 'sideways.jump', region: 'perception' });
  assert.equal(r4.ok, false);
  assert.match(r4.reason, /unknown delta kind/);
  assert.equal(fingerprint(b), before);
});

test('period.change moves the cells and the clock wheel with them', () => {
  const b = organism('period');
  b.tick(16);
  const key = [...b.circuits.keys()].find(k => {
    const c = b.circuits.get(k);
    return c.period !== 'event' && [...c.cells].some(i => b.cells[i].policy.period !== 'event' && b.cells[i].policy.period > 4);
  });
  assert.ok(key, 'no periodic circuit to change');
  const circuit = b.circuits.get(key);
  const target = [...circuit.cells].filter(i => b.cells[i].policy.period !== 'event');
  const r = applyDelta(b, { kind: 'period.change', circuit: key, to: 2 });
  assert.equal(r.ok, true, r.reason);
  for (const i of target) assert.equal(b.cells[i].policy.period, 2);
  const due = new Set(b.clock.due(2 * 4));
  for (const i of target) assert.equal(due.has(i), true, 'cell ' + b.cells[i].id + ' is not due on its new period');
});

test('the window measured by a trial is the window, not the parent history', () => {
  const b = organism('window');
  b.tick(64);
  const before = measure(b);
  assert.ok(before.runs > 0);
  const stream = inputStream(b, { ticks: 8 });
  const clone = cloneSub(b, { name: b.name + '.arm', seed: 'w' });
  resetWindow(clone);
  assert.equal(measure(clone).runs, 0, 'the window did not start at zero');
  assert.equal(clone.cells.every(c => c.stats.runs === 0), true);
  assert.equal(stream.items.length >= 0, true);
});

test('the matched-arm proof survives the organism scale that breaks fingerprint', () => {
  const b = buildOrganism({ majors: 200, seed: 'digest', name: 'digest', ledger: 'off' });
  b.tick(8);
  const a1 = cloneSub(b, { name: b.name + '.arm', seed: 'arm' });
  const a2 = cloneSub(b, { name: b.name + '.arm', seed: 'arm' });
  assert.equal(armDigest(a1), armDigest(a2), 'two identical clones must digest the same');
  // simulate/clone.fingerprint builds ONE string out of the whole organism: millions of
  // characters for a clone at rest here, and past a JS string's limit once the arms have
  // run and filled their working memories, where it throws RangeError: Invalid string
  // length (MEASURED in bench/self.mjs at 1600 cells, notes/self.md request 7).
  // The exact length is a function of the region rosters, not of this test: the same 1600
  // cell organism printed "old rosters cells 1600 fingerprint length 12938998" before the
  // grid and seq.fit kinds entered the rosters and "new rosters cells 1600 fingerprint
  // length 9169977" after, because a grid cell serialises far smaller than the encoder cell
  // it displaced (notes/generations.md request 6). The bar below is the order of magnitude
  // this test is about, not a pin on one roster.
  assert.ok(fingerprint(a1).length > 9e6, 'fingerprint is small enough here that the digest is not needed');
  const kind = b.cells[[...b.regions.get('memory').cells][0]].kind;
  const r = applyDelta(a2, { kind: 'region.grow', region: 'memory', cellKind: kind, count: 1, circuit: 'digest.test' });
  assert.equal(r.ok, true, r.reason);
  assert.notEqual(armDigest(a1), armDigest(a2), 'the digest did not notice a new cell');
});

test('a round runs ONE control for every candidate on it', () => {
  const b = organism('onecontrol');
  b.tick(32);
  const model = observe(b, { log: false });
  const cands = propose(b, model, { max: 3, round: 1, window: 16 });
  const out = trialAll(b, cands, { ticks: 16 });
  assert.equal(typeof out.control.digest, 'number');
  assert.ok(out.control.ms > 0);
  // every candidate was graded against the same control value for the same metric
  const byMetric = new Map();
  for (const r of out.results) {
    if (r.verdict === 'inapplicable') continue;
    if (byMetric.has(r.metric)) assert.equal(byMetric.get(r.metric), r.control, 'two candidates saw different controls for ' + r.metric);
    byMetric.set(r.metric, r.control);
    assert.equal(r.identicalArms, true);
  }
});

test('readMetric reads self and region paths and refuses to invent one', () => {
  const b = organism('read');
  b.tick(16);
  const model = observe(b, { log: false });
  assert.equal(readMetric(model, 'self.runs'), model.metrics.runs);
  assert.equal(readMetric(model, 'region.perception.runs'), model.regions.perception.runs);
  assert.equal(readMetric(model, 'region.nowhere.runs'), null);
  assert.equal(readMetric(model, 'nonsense'), null);
  assert.equal(measureRegions(b).perception.cells, b.regions.get('perception').cells.size);
  assert.equal(health({ metrics: measure(b) }) >= 0, true);
});

test('a brain with no cells observes without dividing by zero', () => {
  const b = new Brain({ name: 'empty', ledger: 'off' });
  b.tick(4);
  const model = observe(b, { log: false });
  assert.equal(model.metrics.cells, 0);
  assert.equal(model.metrics.activeCellRate, 0);
  assert.equal(model.metrics.staleRate, 0);
  assert.equal(Number.isFinite(model.health), true);
  assert.deepEqual(model.regionNames, []);
  assert.deepEqual(propose(b, model, { max: 3 }), []);
});

// ---------------------------------------------------------------- null delta
test('null delta: two arms with no delta measure identically on every metric, so any gain is the delta', () => {
  // bench/self-null.mjs measured this at 0% over 180 readings on 4 seeds (2026-09-17); the
  // test pins it, because a self loop whose arms drift apart on their own grades noise.
  const b = organism('null', 12);
  b.tick(48);
  const stream = inputStream(b, { ticks: 16 });
  const armSeed = b.name + ':arm:' + b.clock.t;
  const c1 = cloneSub(b, { name: b.name + '.arm', seed: armSeed });
  const c2 = cloneSub(b, { name: b.name + '.arm', seed: armSeed });
  assert.equal(armDigest(c1), armDigest(c2), 'arms match before the run');
  const r1 = runArm(c1, stream, 16), r2 = runArm(c2, stream, 16);
  assert.ok(r1.injected > 0, 'the stream reached the arm: ' + r1.injected);
  let compared = 0;
  for (const m of METRICS) {
    const x = readMetric({ metrics: r1.metrics, regions: r1.regions, suites: null }, 'self.' + m);
    const y = readMetric({ metrics: r2.metrics, regions: r2.regions, suites: null }, 'self.' + m);
    if (x === null || y === null) continue;
    compared++;
    assert.equal(x, y, 'self.' + m + ' differs between two arms with no delta: ' + x + ' vs ' + y);
  }
  for (const name of b.regions.keys()) for (const m of ['runs', 'fired', 'active']) {
    const p = 'region.' + name + '.' + m;
    const x = readMetric({ metrics: r1.metrics, regions: r1.regions, suites: null }, p);
    const y = readMetric({ metrics: r2.metrics, regions: r2.regions, suites: null }, p);
    if (x === null || y === null) continue;
    compared++;
    assert.equal(x, y, p + ' differs between two arms with no delta: ' + x + ' vs ' + y);
  }
  assert.ok(compared >= 20, 'metrics compared: ' + compared);
  assert.equal(r1.health, r2.health);
});

test('spill floor: the measured points are returned exactly, between them a straight line, outside them the nearest point', () => {
  for (const [cells, p95] of SPILL_P95) assert.equal(spillFloor(cells), p95, 'measured point at ' + cells + ' cells');
  const [[x0, y0], [x1, y1]] = SPILL_P95;
  assert.ok(Math.abs(spillFloor((x0 + x1) / 2) - (y0 + y1) / 2) < 1e-12, 'midpoint of the first segment: ' + spillFloor((x0 + x1) / 2));
  assert.equal(spillFloor(1), SPILL_P95[0][1], 'below the smallest measured size: the largest floor');
  assert.equal(spillFloor(100000), SPILL_P95[SPILL_P95.length - 1][1], 'above the largest measured size: the smallest floor');
  assert.equal(spillFloor(NaN), SPILL_P95[0][1], 'an unknown size gets the most conservative floor');
  for (let i = 1; i < SPILL_P95.length; i++) assert.ok(SPILL_P95[i][1] < SPILL_P95[i - 1][1], 'the noise falls with size');
  // every hypothesis a round proposes clears the floor for its own organism
  const b = organism('floor', 12);
  b.tick(48);
  const model = observe(b, { log: false });
  const floor = spillFloor(model.metrics.cells);
  assert.ok(Number.isFinite(model.metrics.cells) && model.metrics.cells > 0, 'cells measured: ' + model.metrics.cells);
  const cands = propose(b, model, { max: 8, round: 1 });
  assert.ok(cands.length > 0, 'candidates');
  for (const c of cands) assert.ok(c.hypothesis.expectedPct + 1e-9 >= floor * 100, c.key + ' bar ' + c.hypothesis.expectedPct + '% under the floor ' + floor * 100 + '%');
});

// ---------------------------------------------------------------- the prune batch cap
// Added by the mutation plane (bench/mutants.mjs, pass 1, 2026-09-17). Three mutants of
// self/propose.mjs ran and survived this file: sp01 collapsed the cap to its floor (25 hits),
// sp02 made it ten times the declared share (25 hits), sp03 changed the PUBLISHED rule string
// to a share the code does not use (1 hit). Nothing in the suite read pruneCap or
// PRUNE_CAP_RULE at all, so the rule that decides how much of a live organism one approved
// self change may prune was a number nothing checked. The bar here is the published rule
// itself, parsed, so the string and the function cannot drift apart in either direction.
test('the prune cap is the rule it publishes, at every organism size (mutants sp01, sp02, sp03)', () => {
  const m = /^cap = max\((\d+(?:\.\d+)?), ceil\(edges \* (\d+(?:\.\d+)?)\)\)$/.exec(PRUNE_CAP_RULE);
  assert.ok(m, 'PRUNE_CAP_RULE is not in the form the cap is read from: ' + PRUNE_CAP_RULE);
  const floor = Number(m[1]), share = Number(m[2]);
  assert.ok(floor > 0 && share > 0 && share < 1, 'rule floor ' + floor + ' share ' + share);
  // the rule, evaluated here from the string, against the function, over four decades
  for (const edges of [0, 1, 1000, 25_600, 25_601, 128_740, 1_000_000]) {
    assert.equal(pruneCap(edges), Math.max(floor, Math.ceil(edges * share)), 'pruneCap(' + edges + ') disagrees with ' + PRUNE_CAP_RULE);
  }
  // the crossover the rule exists for: at floor/share edges the new cap IS the old flat one,
  // above it the cap grows with the organism and below it the floor holds
  const crossover = floor / share;
  assert.equal(pruneCap(crossover), floor, 'the crossover is not where the rule puts it');
  assert.equal(pruneCap(crossover / 2), floor, 'below the crossover the floor holds');
  assert.ok(pruneCap(crossover * 10) > floor * 9, 'above the crossover the cap did not scale: ' + pruneCap(crossover * 10));
  // the control the soak paid for: at the 128,740 edges where the flat 256 stopped moving
  // the stale rate, the rule must ask for more than 256
  assert.ok(pruneCap(128_740) > 256, 'at the measured soak size the cap is still the old flat 256');
  // a non-number is the floor, never NaN: a cap of NaN would approve any batch
  assert.equal(pruneCap(NaN), floor);
  assert.equal(pruneCap(undefined), floor);
  console.log('prune cap rule "' + PRUNE_CAP_RULE + '": crossover ' + crossover + ' edges, cap at 128740 edges = ' + pruneCap(128_740));
});

// ---------------------------------------------------------------- the prune batch itself
// Added by the mutation plane (bench/mutants.mjs, batch-pass1, 2026-09-17). The cap is only
// the upper bound: the batch a round actually proposes is
//     max(8, min(pruneCap(edges), ceil(staleEdges * 0.02)))
// and each of its three terms decides the batch on a DIFFERENT organism. Three mutants of
// that line ran 21 times each and survived this file: sp04 dropped the floor, sp05 made the
// share a tenth of the declared 2%, sp06 turned the cap into a second floor. The pruneCap
// test above could not see any of them, because none of them touches pruneCap. The bar here
// is the rule, evaluated at three organisms, each of which only one term can satisfy.
test('the prune batch is the floor, the share and the cap, one organism for each (mutants sp04, sp05, sp06)', () => {
  const FLOOR = 8, SHARE = 0.02; // the rule self/propose.mjs states at the batch line
  const b = organism('batch', 30);
  b.tick(80);
  const base = observe(b, { log: false });
  // the control for all three points: this region holds more stale conduits than the largest
  // batch asked for below, so what comes back is the RULE's number and not what ran out
  const held = base.regions.cognitive.staleEdges;
  assert.ok(held > 256, 'cognitive holds only ' + held + ' stale conduits: the batch would be bounded by the region, not by the rule');
  const batchAt = (edges, staleEdges) => {
    const model = { ...base, metrics: { ...base.metrics, edges, staleEdges } };
    const c = propose(b, model, { max: 32, round: 1 }).find((x) => x.delta.kind === 'conduit.prune' && x.delta.region === 'cognitive');
    assert.ok(c, 'no conduit.prune candidate for cognitive at edges ' + edges + ' stale ' + staleEdges);
    return c.delta.edges.length;
  };
  // 1. THE FLOOR decides: 2% of 50 stale is 1, which would propose a change nothing can
  //    measure. Only the floor can produce 8 here; the share gives 1 and the cap gives 256.
  assert.equal(Math.ceil(50 * SHARE), 1, 'the share at this point is not below the floor');
  assert.equal(batchAt(4400, 50), FLOOR);
  // 2. THE SHARE decides: the cap is 10000 at a million edges and the floor is 8, so 100 is
  //    a number only ceil(5000 * 0.02) produces.
  assert.equal(pruneCap(1_000_000), 10_000, 'the cap at a million edges moved');
  assert.equal(batchAt(1_000_000, 5000), Math.ceil(5000 * SHARE));
  // 3. THE CAP decides: 2% of 50,000 stale is 1000, four times the cap the self.improve gate
  //    is armed with. A batch over the cap is a batch the gate will reject.
  assert.ok(Math.ceil(50_000 * SHARE) > pruneCap(4400), 'the share at this point is not above the cap');
  assert.equal(batchAt(4400, 50_000), pruneCap(4400));
  console.log('prune batch max(' + FLOOR + ', min(cap, ceil(stale * ' + SHARE + '))): floor point ' + batchAt(4400, 50)
    + ', share point ' + batchAt(1_000_000, 5000) + ', cap point ' + batchAt(4400, 50_000) + ', region holds ' + held);
});
