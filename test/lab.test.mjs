// test/lab.test.mjs : the research instrument, tested as an instrument. Every claim lab/
// makes is checked against a thing that can fail: a verdict is graded against a bar stated
// before the numbers exist, an isolated region refuses a crossing at every door it has and
// writes the refusal to the ledger, a replay matches bit for bit and then DIVERGES when a
// divergence is injected, a comparison reports a change that was made on purpose, an
// integration is refused for an undecided verdict and accepted for a confirmed one, and the
// cost instrument counts zero external API tokens because it counted every door, not because
// this file says so.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Brain } from '../core/brain.mjs';
import { PROPOSAL_KINDS, knownKind } from '../core/gate.mjs';
import '../cells/index.mjs';
import { isolate, RegionCrossing, RegionFirewall } from '../lab/isolate.mjs';
import '../lab/kinds.mjs';
import {
  defineExperiment, run, signedDiffs, describe as describeStats, permutationShare, verdictOf,
  contentHash, readVerdict, listVerdicts, renderVerdict, DEFAULT_BAR, VERDICTS_DIR,
} from '../lab/experiment.mjs';
import { record, replay, referenceStream, normalizeEvent, renderReplay } from '../lab/replay.mjs';
import { compareBrains, compareStates, regionRuns, errorCurve, renderCompare } from '../lab/compare.mjs';
import { judge, labPolicy, proposeIntegration, renderIntegration, LAB_INTEGRATE } from '../lab/integrate.mjs';
import { measureCost, watchNetwork, renderCost, cpuResolutionMs, defaultTasks } from '../lab/cost.mjs';
import { EXPERIMENT_NAMES, loadExperiment } from '../lab/experiments/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const EM_DASH = String.fromCharCode(0x2014);

// ---------------------------------------------------------------- fixtures
// A tiny two region brain. Region 'lab' is the one that gets sealed; region 'out' stands in
// for the rest of the organism that a failed mechanism must not be able to reach.
function twoRegions(opts = {}) {
  const b = new Brain({ name: 'lab.t', seed: 'lab.t', ledger: 'full', growth: { enabled: false }, pruneEvery: 0, ...opts });
  b.addRegion('lab', { doc: 'sealed' });
  b.addRegion('out', { doc: 'the rest of the organism' });
  b.addCell({ id: 'lab.in', kind: 'event.filter', region: 'lab', circuit: 'c', params: { field: 'k', values: [0, 1] }, policy: { period: 'event' } });
  b.addCell({ id: 'lab.mid', kind: 'event.filter', region: 'lab', circuit: 'c', params: { field: 'k', value: 0 }, policy: { period: 'event' } });
  b.addCell({ id: 'lab.out', kind: 'event.filter', region: 'lab', circuit: 'c', params: { field: 'k', value: 1 }, policy: { period: 'event' } });
  b.addCell({ id: 'out.sink', kind: 'sink.log', region: 'out', circuit: 'w', policy: { period: 'event' } });
  b.addCell({ id: 'out.src', kind: 'event.filter', region: 'out', circuit: 'w', params: { field: 'k', value: 7 }, policy: { period: 'event' } });
  return b;
}

// A brain with real traffic, for recording and replaying.
function tickingBrain(dir, { extraCell = false } = {}) {
  const b = new Brain({ name: 'probe', seed: 'probe', dir, ledger: 'full', growth: { enabled: false }, pruneEvery: 0 });
  b.addRegion('a', { doc: 'a' });
  b.addRegion('b', { doc: 'b' });
  b.addCell({ id: 'a.in', kind: 'event.filter', region: 'a', circuit: 'c', params: { field: 'k', values: [0, 1, 2, 3] }, policy: { period: 'event' } });
  for (let i = 0; i < 4; i++) b.addCell({ id: 'a.s' + i, kind: 'event.filter', region: 'a', circuit: 'c', params: { field: 'k', value: i }, policy: { period: 'event' } });
  b.addCell({ id: 'b.log', kind: 'sink.log', region: 'b', circuit: 'w', policy: { period: 'event' } });
  if (extraCell) b.addCell({ id: 'b.log2', kind: 'sink.log', region: 'b', circuit: 'w', policy: { period: 'event' } });
  for (let i = 0; i < 4; i++) b.connect('a.in', 'out', 'a.s' + i, 'in');
  for (let i = 0; i < 4; i++) b.connect('a.s' + i, 'out', 'b.log', 'in');
  if (extraCell) b.connect('a.s0', 'out', 'b.log2', 'in');
  for (let i = 0; i < 40; i++) b.inject('a.in', 'in', { kind: 'event', data: { k: i % 4 } }, { delay: i + 1 });
  return b;
}

function tmp(name) { return mkdtempSync(path.join(tmpdir(), 'lab-' + name + '-')); }
function ledgerOf(brain, type) { return brain.ledger.recent(10000).filter((e) => e.type === type); }

// ---------------------------------------------------------------- 1. the verdict and its bar
test('the statistics grade a pre-stated bar, and all three verdicts are reachable', () => {
  // A paired difference is signed so that positive always means "the hypothesis moved",
  // whichever direction the hypothesis stated.
  assert.deepEqual(signedDiffs([3, 5], [1, 1], 'increase'), [2, 4]);
  assert.deepEqual(signedDiffs([3, 5], [1, 1], 'decrease'), [-2, -4]);

  const s = describeStats([1, 2, 3, 4]);
  assert.equal(s.n, 4);
  assert.equal(s.mean, 2.5);
  assert.equal(s.median, 2.5);
  assert.equal(s.min, 1);
  assert.equal(s.max, 4);

  // Sign-flip permutation, exact. Eight identical positive pairs: only the all-positive
  // assignment reaches the observed mean, so the share is exactly 1 of 2^8.
  const p = permutationShare([1, 1, 1, 1, 1, 1, 1, 1], { exactUpTo: 16 });
  assert.equal(p.mode, 'exact');
  assert.equal(p.draws, 256);
  assert.equal(p.share, 1 / 256);
  assert.equal(p.reverse, 1);
  // The reverse tail is graded just as strictly, so a refutation cannot be cheaper.
  const q = permutationShare([-1, -1, -1, -1, -1, -1, -1, -1], { exactUpTo: 16 });
  assert.equal(q.share, 1);
  assert.equal(q.reverse, 1 / 256);

  const bar = { alpha: 0.05, seeds: 8 };
  const hyp = { metric: 'x', direction: 'increase', minEffect: 0.5 };
  const big = describeStats([1, 1, 1, 1, 1, 1, 1, 1]);
  assert.equal(verdictOf(big, p, hyp, bar).verdict, 'confirmed');
  const neg = describeStats([-1, -1, -1, -1, -1, -1, -1, -1]);
  assert.equal(verdictOf(neg, q, hyp, bar).verdict, 'refuted');
  // The right sign but not far enough is NOT a confirmation. It is undecided, and it says so.
  const small = describeStats([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);
  const smallPerm = permutationShare([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1], { exactUpTo: 16 });
  const v = verdictOf(small, smallPerm, hyp, bar);
  assert.equal(v.verdict, 'undecided');
  assert.match(v.reasons.join(' '), /inside the band/);
  // Too few seeds is undecided whatever the numbers look like.
  assert.equal(verdictOf(describeStats([1, 1]), permutationShare([1, 1]), hyp, bar).verdict, 'undecided');
});

test('an experiment writes a verdict with its numbers and a git free hash of the mechanism source', async () => {
  const dir = tmp('verdict');
  try {
    // An alpha of 0.05 is unreachable with 4 seeds: the smallest share a sign flip
    // permutation can produce is 1 of 2^4, which is 0.0625, so four seeds cannot clear
    // that bar however clean the separation is. Six seeds can, so the experiment states 6.
    assert.equal(permutationShare([1, 1, 1, 1], { exactUpTo: 16 }).share, 1 / 16);
    assert.ok(1 / 16 > 0.05, 'four seeds cannot reach alpha 0.05, which is why the bar below says 6');
    // A deliberately boring experiment: the mechanism adds a constant to the metric, so the
    // answer is known in advance and the harness is what is being tested.
    const exp = defineExperiment({
      name: 'unit-lift',
      question: 'does the harness grade a known lift correctly',
      hypothesis: { metric: 'score', direction: 'increase', minEffect: 0.5 },
      bar: { alpha: 0.05, seeds: 6 },
      region: 'lab',
      ports: { in: ['lab.in#in'] },
      seeds: ['a', 'b', 'c', 'd', 'e', 'f'],
      build: () => twoRegions({ ledger: 'off' }),
      mechanism: (brain) => { brain.labLift = 1; return { lift: 1 }; },
      control: (brain) => { brain.labLift = 0; return { lift: 0 }; },
      measure: (brain, ctx) => ({ score: (brain.labLift || 0) + (ctx.rng.next() * 0.01), cells: brain.cells.length }),
    });
    const r = await run(exp, { verdictsDir: dir });
    assert.equal(r.verdict, 'confirmed');
    assert.equal(r.k, 6);
    assert.equal(r.metric, 'score');
    assert.equal(r.effect.wins, 6);
    assert.equal(r.effect.losses, 0);
    assert.equal(r.permutation.mode, 'exact');
    assert.equal(r.permutation.draws, 64);
    assert.equal(r.permutation.share, 1 / 64);
    assert.ok(r.effect.mean >= r.hypothesis.minEffect, 'effect ' + r.effect.mean + ' must reach ' + r.hypothesis.minEffect);
    // The hash names the code that was graded, and it comes from the source text, not git.
    assert.match(r.source.mechanism, /^sha256:[0-9a-f]{64}$/);
    assert.equal(r.source.mechanism, contentHash(exp.mechanism));
    assert.notEqual(r.source.mechanism, r.source.control);
    assert.equal(contentHash('not a function'), null);
    // The file on disk carries the same numbers.
    const onDisk = JSON.parse(readFileSync(path.join(dir, 'unit-lift.json'), 'utf8'));
    assert.equal(onDisk.verdict, 'confirmed');
    assert.equal(onDisk.effect.mean, r.effect.mean);
    assert.equal(onDisk.source.mechanism, r.source.mechanism);
    assert.equal(listVerdicts(dir).length, 1);
    assert.equal(readVerdict('unit-lift', dir).name, 'unit-lift');
    assert.match(renderVerdict(r), /experiment unit-lift\s+CONFIRMED/);
    // A metric the measure did not return is an error, not a silent zero.
    const broken = defineExperiment({ ...exp, name: 'unit-broken', measure: () => ({ other: 1 }) });
    await assert.rejects(() => run(broken, { verdictsDir: dir }), /must return a finite number/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('an experiment cannot be defined without a hypothesis, a bar and both arms', () => {
  const ok = { name: 'x', hypothesis: { metric: 'm', direction: 'increase', minEffect: 1 }, build: () => null, mechanism: () => null, measure: () => ({ m: 1 }), seeds: ['a', 'b'] };
  assert.doesNotThrow(() => defineExperiment(ok));
  assert.throws(() => defineExperiment({ ...ok, name: '' }), /needs a name/);
  assert.throws(() => defineExperiment({ ...ok, hypothesis: { metric: 'm', direction: 'sideways', minEffect: 1 } }), /direction must be/);
  assert.throws(() => defineExperiment({ ...ok, hypothesis: { metric: 'm', direction: 'increase', minEffect: 0 } }), /positive minimum effect/);
  assert.throws(() => defineExperiment({ ...ok, seeds: ['only-one'] }), /at least 2 seeds/);
  assert.throws(() => defineExperiment({ ...ok, mechanism: undefined }), /mechanism/);
  // The bar is frozen once stated, so it cannot be edited after the numbers exist.
  const e = defineExperiment(ok);
  assert.equal(e.bar.alpha, DEFAULT_BAR.alpha);
  assert.throws(() => { 'use strict'; e.bar.alpha = 0.5; }, TypeError);
  assert.throws(() => { 'use strict'; e.hypothesis.minEffect = 0.0001; }, TypeError);
});

// ---------------------------------------------------------------- 2. isolation
test('an isolated region refuses a crossing at every door and logs each refusal', () => {
  const b = twoRegions();
  const fw = isolate(b, 'lab', { in: ['lab.in#in'], out: ['lab.out#out'] });
  assert.ok(fw instanceof RegionFirewall);
  assert.equal(ledgerOf(b, 'lab.isolate.attach').length, 1);

  // Door 1: connect. An edge INTO an undeclared in port is refused, loudly and in the ledger.
  assert.throws(() => b.connect('out.src', 'out', 'lab.mid', 'in'), RegionCrossing);
  // And an edge OUT of an undeclared out port is refused the same way.
  assert.throws(() => b.connect('lab.mid', 'out', 'out.sink', 'in'), RegionCrossing);
  // A declared port is allowed, in both directions.
  assert.doesNotThrow(() => b.connect('out.src', 'out', 'lab.in', 'in'));
  assert.doesNotThrow(() => b.connect('lab.out', 'out', 'out.sink', 'in'));
  // An edge wholly inside the region is nobody's business.
  assert.doesNotThrow(() => b.connect('lab.in', 'out', 'lab.mid', 'in'));
  // An edge wholly outside it likewise.
  assert.doesNotThrow(() => b.connect('out.src', 'out', 'out.sink', 'in'));

  // Door 2: inject. An injection into an undeclared in port of a sealed cell is refused.
  assert.throws(() => b.inject('lab.mid', 'in', { kind: 'event', data: { k: 0 } }), RegionCrossing);
  assert.doesNotThrow(() => b.inject('lab.in', 'in', { kind: 'event', data: { k: 0 } }));
  // An injection into a cell OUTSIDE the region is not the firewall's business.
  assert.doesNotThrow(() => b.inject('out.src', 'in', { kind: 'event', data: { k: 7 } }));

  // Door 3: the gate policy. core/brain.mjs proposes edge.grow before it calls connect, so
  // the firewall rejects the proposal and the tick loop never reaches a throw. Both
  // proposals carry evidence core's own makePolicy would APPROVE (coActivations above its
  // growThreshold of 8), so the only thing that can separate them is the firewall.
  const ev = { coActivations: 16 };
  const grow = b.gate.propose({ kind: 'edge.grow', what: { src: 'out.src', dst: 'lab.mid', srcPort: 0, dstPort: 0 }, why: 'test', evidence: ev, by: 'test' }, b.ctx);
  assert.equal(grow.status, 'rejected', 'the crossing into an undeclared port is refused by the firewall');
  const growOk = b.gate.propose({ kind: 'edge.grow', what: { src: 'out.src', dst: 'lab.in', srcPort: 0, dstPort: 0 }, why: 'test', evidence: ev, by: 'test' }, b.ctx);
  assert.equal(growOk.status, 'approved', 'the same evidence into a DECLARED port passes the firewall and then core');

  const refusals = ledgerOf(b, 'lab.isolate.refuse');
  assert.equal(refusals.length, 4, 'two connects, one inject and one gate proposal were refused');
  assert.deepEqual(refusals.map((r) => r.door), ['connect', 'connect', 'inject', 'gate']);
  assert.equal(fw.stats.refused, 4);
  assert.deepEqual(fw.stats.byDoor, { connect: 2, gate: 1, inject: 1 });
  assert.ok(fw.stats.allowed >= 4);
  for (const r of refusals) {
    assert.equal(r.region, 'lab');
    assert.match(r.why, /undeclared (in|out) port/);
    assert.ok(r.seq >= 0, 'every refusal carries the ledger seq it was written at');
  }

  // Nothing undeclared got through, and the audit says so by walking the connectome.
  const crossings = fw.crossings();
  assert.equal(crossings.length, 2);
  assert.equal(crossings.filter((c) => !c.declared).length, 0);
  const rep = fw.report();
  assert.equal(rep.undeclaredCrossings, 0);
  assert.equal(rep.ports.in.length, 1);
  assert.equal(rep.ports.out.length, 1);

  // A mechanism may open the door its own new cell needs, and only that door.
  b.addCell({ id: 'lab.extra', kind: 'event.filter', region: 'lab', circuit: 'c', params: { field: 'k', value: 5 }, policy: { period: 'event' } });
  assert.throws(() => b.inject('lab.extra', 'in', { kind: 'event', data: { k: 5 } }), RegionCrossing);
  fw.declare('in', 'lab.extra#in');
  assert.equal(ledgerOf(b, 'lab.isolate.declare').length, 1);
  assert.doesNotThrow(() => b.inject('lab.extra', 'in', { kind: 'event', data: { k: 5 } }));

  // detach puts every door back exactly as it was, and says so in the ledger.
  fw.detach();
  assert.equal(ledgerOf(b, 'lab.isolate.detach').length, 1);
  assert.doesNotThrow(() => b.connect('out.src', 'out', 'lab.mid', 'in'));
  assert.equal(Object.prototype.hasOwnProperty.call(b, 'connect'), false, 'the instance wrapper is gone, the prototype method is back');
  assert.equal(Object.prototype.hasOwnProperty.call(b, 'inject'), false);
});

test('a failed mechanism inside a sealed region cannot corrupt the rest of the organism', () => {
  const b = twoRegions();
  const fw = isolate(b, 'lab', { in: ['lab.in#in'] });
  // The mechanism is a bad one: it tries to wire itself into the rest of the organism.
  let threw = null;
  try { b.connect('lab.mid', 'out', 'out.sink', 'in'); } catch (e) { threw = e; }
  assert.ok(threw instanceof RegionCrossing);
  assert.equal(threw.detail.door, 'connect');
  // The organism outside the region is untouched: no edge reaches it.
  const into = [...b.connectome.into(b.cell('out.sink').idx)];
  assert.equal(into.length, 0);
  // And the region still works for the traffic it declared.
  b.connect('lab.in', 'out', 'lab.mid', 'in');
  b.inject('lab.in', 'in', { kind: 'event', data: { k: 0 } });
  b.tick(3);
  assert.ok(b.cell('lab.mid').stats.runs > 0, 'the sealed region still ran');
  assert.equal(b.cell('out.sink').stats.runs, 0, 'the rest of the organism never ran');
  fw.detach();
});

test('a declared port must belong to the region being sealed', () => {
  const b = twoRegions();
  assert.throws(() => isolate(b, 'lab', { in: ['out.sink#in'] }), /which is in region out/);
  assert.throws(() => isolate(b, 'lab', { in: ['lab.in#nosuchport'] }), /port/);
});

// ---------------------------------------------------------------- 3. replay and compare
test('replay is bit for bit, and reports the first divergence when one is injected', () => {
  const root = tmp('replay');
  try {
    const dir = path.join(root, 'a');
    const b = tickingBrain(dir);
    b.tick(3);
    const manifest = record(b, dir, { ticks: 30 });
    assert.equal(manifest.ticks, 30);
    assert.ok(manifest.events > 0, 'the recording wrote ' + manifest.events + ' events');
    assert.equal(manifest.coactPending, 0);
    assert.equal(typeof manifest.fingerprint, 'string');

    const ref = referenceStream(dir, { ticks: 30 });
    assert.equal(ref.events.length, manifest.events);
    assert.ok(ref.events.every((e) => e.t >= ref.t0));

    // The two ledgers line up because core wrote the seq into the snapshot, not because this
    // file moved a counter by hand: a bare restore already starts where the recording did.
    const restored = Brain.restore(dir, { dir: null, ledger: 'full' });
    assert.equal(restored.ledger.seq, manifest.baseSeq, 'the restored ledger continues the recording');

    const clean = replay(dir, { ticks: 30 });
    assert.equal(clean.ledgerSeqAtStart, manifest.baseSeq);
    assert.equal(clean.coactPending, 0, 'growth is off in this fixture, so there are no counters to restore');
    assert.equal(clean.ok, true, clean.divergence ? JSON.stringify(clean.divergence) : 'no divergence');
    assert.equal(clean.divergence, null);
    assert.equal(clean.referenceEvents, clean.replayedEvents);
    assert.equal(clean.compared, clean.referenceEvents);
    assert.equal(clean.runOrderMatch, true);
    assert.equal(clean.outputHashesMatch, true);
    assert.equal(clean.fingerprintMatch, true);
    assert.equal(clean.cellRuns.reference, clean.cellRuns.replayed);
    assert.equal(clean.signals.reference, clean.signals.replayed);
    assert.match(renderReplay(clean), /VERDICT DETERMINISTIC/);

    // Now break one cell's parameters, which changes what it emits, and demand the report.
    const bad = replay(dir, { ticks: 30, tamper: (br) => { br.cell('a.s2').params.value = 99; } });
    assert.equal(bad.ok, false);
    assert.ok(bad.divergence, 'a divergence must be found');
    assert.equal(typeof bad.divergence.index, 'number');
    assert.equal(typeof bad.divergence.tick, 'number');
    assert.equal(bad.divergence.cell, 'a.s2', 'the report names the cell that diverged');
    assert.equal(bad.divergence.field, 'out', 'the report names the field that diverged');
    assert.deepEqual(bad.divergence.expected.out, ['event']);
    assert.deepEqual(bad.divergence.got.out, [null]);
    assert.equal(bad.fingerprintMatch, false);
    assert.equal(bad.runOrderMatch, false);
    assert.match(renderReplay(bad), /VERDICT DIVERGED/);

    // The replay never writes to the recording: the ledger on disk is the same length after.
    const after = referenceStream(dir, { ticks: 30 });
    assert.equal(after.events.length, ref.events.length);

    // Normalization drops only what cannot be compared across two runs, and nothing else.
    const own = new Set([10, 11, 12]);
    const n = normalizeEvent({ seq: 12, type: 'cell.run', t: 4, cell: 'x', consumed: [11, 3], from: 10, dir: 'C:/somewhere' }, own);
    assert.equal(n.seq, undefined);
    assert.equal(n.dir, undefined);
    assert.deepEqual(n.consumed, [1, 'pre']);
    assert.equal(n.from, 2);
    assert.equal(n.cell, 'x');
    assert.equal(n.t, 4);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('a recording taken part way to a growth threshold replays into the same organism', () => {
  const root = tmp('coact');
  try {
    const dir = path.join(root, 'g');
    const b = new Brain({ name: 'grow', seed: 'grow', dir, ledger: 'full', growth: { threshold: 8 }, gate: { growThreshold: 8 }, pruneEvery: 0 });
    b.addCell({ id: 'a', kind: 'source.counter', region: 'r' });
    b.addCell({ id: 'c', kind: 'source.counter', region: 'r' });
    b.addCell({ id: 'p', kind: 'predict.next', region: 'r', policy: { period: 'event' } });
    b.addCell({ id: 's', kind: 'sink.log', region: 'r', policy: { period: 'event', learn: 'hebbian' } });
    b.connect('c', 'out', 'p', 'observe');
    b.connect('a', 'out', 's', 'in', { w: 0.5 });
    b.tick(5);
    const pending = b.coact.counts.size;
    assert.ok(pending > 0, 'the counters are part way to the threshold: ' + pending);

    const manifest = record(b, dir, { ticks: 30 });
    assert.equal(manifest.coactPending, pending, 'the manifest reports the counters the snapshot carried, measured not assumed');
    assert.ok(b.stats.grown > 0, 'the original crossed the threshold inside the recorded window');

    const clean = replay(dir, { ticks: 30 });
    assert.equal(clean.coactPending, pending, 'the replay measured the counters that came back out of the snapshot');
    assert.equal(clean.coactMatch, true);
    assert.equal(clean.ok, true, clean.divergence ? JSON.stringify(clean.divergence) : 'no divergence');
    assert.equal(clean.fingerprintMatch, true);
    assert.match(renderReplay(clean), /coactivation/);

    // The counters are load bearing: start them at zero, as a restore did before core carried
    // them, and the same recording grows a different organism.
    const cleared = replay(dir, { ticks: 30, tamper: (br) => br.coact.counts.clear() });
    assert.equal(cleared.ok, false);
    assert.ok(cleared.divergence, 'counters at zero must diverge');
    assert.equal(cleared.fingerprintMatch, false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('record refuses a brain it cannot replay', () => {
  const b = new Brain({ name: 'nofile', ledger: 'full' });
  assert.throws(() => record(b, tmp('nofile'), { ticks: 1 }), /file backed ledger/);
  const root = tmp('nolevel');
  try {
    const c = new Brain({ name: 'nolevel', dir: root, ledger: 'runs' });
    assert.throws(() => record(c, root, { ticks: 1 }), /ledger level/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('compare reports a known change between two runs and two snapshots', () => {
  const root = tmp('compare');
  try {
    const dirA = path.join(root, 'a'), dirB = path.join(root, 'b');
    const a = tickingBrain(dirA);
    a.tick(20);
    a.snapshot(dirA); a.ledger.flush();
    const b = tickingBrain(dirB, { extraCell: true });
    b.tick(20);
    b.snapshot(dirB); b.ledger.flush();

    // Two live brains first: the change was made on purpose, so the table must name it.
    const live = compareBrains(a, b, { labels: ['A', 'B'] });
    assert.equal(live.cells.b - live.cells.a, 1);
    assert.deepEqual(live.cells.added, ['b.log2']);
    assert.deepEqual(live.cells.removed, []);
    assert.equal(live.edges.b - live.edges.a, 1);
    assert.equal(live.edges.added, 1);
    assert.equal(live.edges.pruned, 0);

    // Per-region run counts, which is where the extra cell actually shows up in behaviour.
    const runsA = regionRuns(a), runsB = regionRuns(b);
    assert.equal(runsA.b.cells, 1);
    assert.equal(runsB.b.cells, 2);
    assert.ok(runsB.b.runs > runsA.b.runs, 'region b ran more in B: ' + runsB.b.runs + ' against ' + runsA.b.runs);
    assert.equal(runsA.a.cells, 5);
    assert.equal(runsA.a.runs, runsB.a.runs, 'region a is untouched by the change in region b');

    // And the same comparison from the two state directories on disk.
    const onDisk = compareStates(dirA, dirB, { labels: ['A', 'B'], buckets: 4 });
    assert.deepEqual(onDisk.cells.added, ['b.log2']);
    assert.equal(onDisk.edges.added, 1);
    assert.equal(onDisk.error.a.buckets.length, 4);
    assert.equal(onDisk.error.b.buckets.length, 4);
    assert.equal(onDisk.error.a.t0, onDisk.error.b.t0, 'both curves are on the same tick grid');
    assert.equal(onDisk.error.a.t1, onDisk.error.b.t1);
    const text = renderCompare(onDisk);
    assert.match(text, /cells only in B: b\.log2/);
    assert.match(text, /per-region run counts/);
    assert.match(text, /prediction error curve/);

    // A brain compared with itself reports no change at all.
    const same = compareBrains(a, a, { labels: ['A', 'A'] });
    assert.equal(same.cells.added.length, 0);
    assert.equal(same.cells.removed.length, 0);
    assert.equal(same.edges.added, 0);
    assert.equal(same.edges.pruned, 0);

    // The error curve reads surprise off cell.run events and buckets it on a tick grid.
    const evs = [
      { type: 'cell.run', t: 0, cell: 'x', surprise: 1 },
      { type: 'cell.run', t: 1, cell: 'x', surprise: 3 },
      { type: 'cell.run', t: 9, cell: 'x', surprise: 5 },
      { type: 'signal', t: 9, hash: 'ignored' },
    ];
    const curve = errorCurve(evs, { buckets: 2, t0: 0, t1: 10 });
    assert.equal(curve.n, 3, 'the signal event is not a cell.run and is not counted');
    assert.equal(curve.mean, 3);
    assert.equal(curve.buckets.length, 2);
    assert.equal(curve.buckets[0].n, 2);
    assert.equal(curve.buckets[0].meanError, 2);
    assert.equal(curve.buckets[1].n, 1);
    assert.equal(curve.buckets[1].meanError, 5);
    assert.equal(curve.first, 2);
    assert.equal(curve.last, 5);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

// ---------------------------------------------------------------- 4. integration through the gate
const CONFIRMED = Object.freeze({
  name: 'unit-confirmed', metric: 'score', k: 8, region: 'lab',
  hypothesis: { metric: 'score', direction: 'increase', minEffect: 0.5 },
  bar: { alpha: 0.05, seeds: 8 },
  effect: { mean: 1.2 }, permutation: { share: 0.004 }, verdict: 'confirmed',
  source: { mechanism: 'sha256:' + 'a'.repeat(64) },
});
const UNDECIDED = Object.freeze({ ...CONFIRMED, name: 'unit-undecided', verdict: 'undecided', effect: { mean: 0.1 }, permutation: { share: 0.4 } });

test('integrate is refused for an undecided verdict and accepted for a confirmed one', () => {
  // The policy on its own, first: four checks, all of them read out of the verdict file.
  assert.equal(judge({ evidence: { verdict: CONFIRMED, file: 'x.json' } }).verdict, 'approve');
  assert.equal(judge({ evidence: { verdict: UNDECIDED, file: 'x.json' } }).verdict, 'reject');
  assert.equal(judge({ evidence: {} }).verdict, 'reject');
  assert.match(judge({ evidence: {} }).reasons.join(' '), /no verdict file/);
  // A confirmed verdict whose effect did not reach the minimum it stated is still refused.
  const tooSmall = { ...CONFIRMED, effect: { mean: 0.2 } };
  assert.equal(judge({ evidence: { verdict: tooSmall } }).verdict, 'reject');
  assert.match(judge({ evidence: { verdict: tooSmall } }).reasons.join(' '), /did not reach the stated minEffect/);
  // Nor one whose permutation share did not clear the alpha it stated.
  const tooLoose = { ...CONFIRMED, permutation: { share: 0.2 } };
  assert.match(judge({ evidence: { verdict: tooLoose } }).reasons.join(' '), /did not clear the stated alpha/);
  // Nor one run over fewer seeds than the bar asked for.
  assert.match(judge({ evidence: { verdict: { ...CONFIRMED, k: 3 } } }).reasons.join(' '), /only 3 seeds/);
  // Nor one whose mechanism is not the code the verdict graded.
  assert.match(judge({ evidence: { verdict: CONFIRMED, mechanismHash: 'sha256:' + 'b'.repeat(64) } }).reasons.join(' '), /the verdict graded/);
  assert.equal(labPolicy({ evidence: { verdict: CONFIRMED } }), 'approve');

  // Now through a real gate on a real brain.
  const b = twoRegions();
  let applied = 0;
  const bad = proposeIntegration(b, { verdict: UNDECIDED, what: { region: 'lab' }, apply: () => { applied++; } });
  assert.equal(bad.approved, false);
  assert.equal(bad.applied, false);
  assert.equal(applied, 0, 'a refused proposal never runs its apply');
  assert.equal(bad.proposal.kind, LAB_INTEGRATE);
  assert.equal(bad.proposal.status, 'rejected');

  const good = proposeIntegration(b, { verdict: CONFIRMED, what: { region: 'lab' }, apply: (br) => { applied++; br.addRegion('integrated', { doc: 'landed' }); } });
  assert.equal(good.approved, true);
  assert.equal(good.applied, true);
  assert.equal(applied, 1);
  assert.equal(good.proposal.status, 'approved');
  assert.ok(b.regions.has('integrated'), 'the approved change actually landed');
  assert.notEqual(good.proposal.id, bad.proposal.id, 'both proposals came from the same id space');

  // The gate's own books balance, and the ledger carries the same two events core writes.
  assert.equal(b.gate.stats.proposed >= 2, true);
  assert.equal(b.gate.stats.approved >= 1, true);
  assert.equal(b.gate.stats.rejected >= 1, true);
  const proposals = ledgerOf(b, 'proposal').filter((e) => e.kind === LAB_INTEGRATE);
  const decisions = ledgerOf(b, 'decision').filter((e) => e.kind === LAB_INTEGRATE);
  assert.equal(proposals.length, 2);
  assert.equal(decisions.length, 2);
  assert.deepEqual(decisions.map((d) => d.status), ['rejected', 'approved']);
  assert.equal(ledgerOf(b, 'lab.integrate.applied').length, 1);
  // The ledger line carries the numbers the decision turned on, not the whole verdict.
  assert.equal(proposals[1].evidence.effect, CONFIRMED.effect.mean);
  assert.equal(proposals[1].evidence.share, CONFIRMED.permutation.share);
  assert.equal(proposals[1].evidence.seeds, CONFIRMED.k);
  assert.match(renderIntegration(good), /APPROVED/);
  assert.match(renderIntegration(bad), /REJECTED/);

  // Core knows the kind now: importing lab/integrate.mjs registers it on core/gate.mjs with
  // this file's policy, and the proposal goes through the ordinary brain.gate.propose. The
  // nine built in kinds are untouched, and the kind is NOT one of them.
  assert.equal(good.coreKnowsKind, true);
  assert.equal(knownKind(LAB_INTEGRATE), true);
  assert.equal(PROPOSAL_KINDS.length, 9);
  assert.equal(PROPOSAL_KINDS.includes(LAB_INTEGRATE), false, 'a registered kind is not smuggled into the frozen list');
  const evidence = { verdict: CONFIRMED, file: 'x.json', experiment: CONFIRMED.name, metric: CONFIRMED.metric, effect: CONFIRMED.effect.mean, share: CONFIRMED.permutation.share, seeds: CONFIRMED.k, mechanismHash: null };
  const direct = b.gate.propose({ kind: LAB_INTEGRATE, what: { region: 'lab' }, evidence, by: 'lab' }, { t: 0, gen: 0 });
  assert.equal(direct.status, 'approved', 'the gate itself accepts the kind and the registered policy decides it');
  assert.equal(direct.decidedBy, 'policy');
  // and the ledger line carries the slim view of the evidence, not the whole verdict record
  const line = ledgerOf(b, 'proposal').filter((e) => e.kind === LAB_INTEGRATE).pop();
  assert.equal(line.evidence.verdict, 'confirmed', 'the verdict is the word, not the record');
  assert.equal(line.evidence.seeds, CONFIRMED.k);
  assert.equal(line.evidence.effect, CONFIRMED.effect.mean);
  assert.equal(Object.keys(line.evidence).sort().join(','), 'effect,experiment,file,mechanismHash,metric,seeds,share,verdict');
});

test('a shipped confirmed verdict integrates and a shipped refuted one does not', () => {
  const confirmed = listVerdicts().filter((v) => v.verdict === 'confirmed');
  const notConfirmed = listVerdicts().filter((v) => v.verdict !== 'confirmed');
  assert.ok(confirmed.length + notConfirmed.length >= 3, 'the three shipped experiments have been run: ' + listVerdicts().map((v) => v.name).join(', '));
  const b = twoRegions();
  for (const v of confirmed) assert.equal(proposeIntegration(b, { name: v.name }).approved, true, v.name + ' is confirmed and must be accepted');
  for (const v of notConfirmed) assert.equal(proposeIntegration(b, { name: v.name }).approved, false, v.name + ' is ' + v.verdict + ' and must be refused');
  assert.throws(() => proposeIntegration(b, { name: 'no-such-experiment' }), /no verdict at/);
});

// ---------------------------------------------------------------- 5. the cost instrument
test('the cost instrument prices the task list and counts zero external API tokens', async () => {
  const out = path.join(tmp('cost'), 'cost.json');
  try {
    const r = await measureCost({ scale: 0.1, seed: 'test:cost', out });
    assert.equal(r.external.apiTokens, 0);
    assert.equal(r.external.networkCalls, 0);
    assert.equal(r.external.dependencies, 0);
    // Zero is only worth reading because every door was counted, so every door must be there.
    for (const door of ['fetch', 'httpRequest', 'httpsRequest', 'socketConnect', 'tlsConnect', 'dnsLookup', 'dnsPromisesLookup']) {
      assert.equal(r.external.byDoor[door], 0, door + ' was counted and was never called');
    }
    assert.equal(r.tasks.length, 3);
    assert.deepEqual(r.tasks.map((t) => t.task), ['algebra', 'recall', 'sequence']);
    for (const t of r.tasks) {
      assert.ok(t.n > 0, t.task + ' attempted ' + t.n + ' tasks');
      assert.ok(t.solved >= 0 && t.solved <= t.n, t.task + ' solved ' + t.solved + ' of ' + t.n);
      assert.ok(Number.isFinite(t.cpuMs) && t.cpuMs >= 0);
      assert.ok(Number.isFinite(t.wallMs) && t.wallMs > 0);
      assert.ok(t.peakSampledRssMB > 0);
      assert.ok(t.detail && typeof t.detail === 'object', t.task + ' prints what it counted');
    }
    assert.equal(r.total.n, r.tasks.reduce((a, t) => a + t.n, 0));
    assert.equal(r.total.solved, r.tasks.reduce((a, t) => a + t.solved, 0));
    assert.ok(r.total.cpuMsPerSolvedTask !== null && r.total.cpuMsPerSolvedTask >= 0);
    assert.ok(r.total.peakRssMB > 0, 'peak memory ' + r.total.peakRssMB + ' MB');
    // A cpu figure of zero is a resolution artefact, and the report has to say how coarse.
    assert.ok(r.total.cpuResolutionMs === null || r.total.cpuResolutionMs > 0);
    const text = renderCost(r);
    assert.match(text, /external API tokens\s+0/);
    assert.match(text, /network calls made\s+0/);
    assert.match(text, /cpu clock resolution/);
    // The file on disk carries the same zero.
    const onDisk = JSON.parse(readFileSync(out, 'utf8'));
    assert.equal(onDisk.external.apiTokens, 0);
    assert.equal(onDisk.external.networkCalls, 0);
  } finally { rmSync(path.dirname(out), { recursive: true, force: true }); }
});

test('the network counter counts at the door, and nothing here touches a network', async () => {
  const w = await watchNetwork();
  try {
    const dns = await import('node:dns');
    const net = await import('node:net');
    // Nothing is resolved and no socket is opened. watchNetwork increments BEFORE it
    // forwards the call, so a call that is rejected on its own arguments still proves the
    // door counts. A test that actually reached a network would be slow, flaky, and on a
    // machine with no resolver it would hang the gate instead of failing it.
    assert.throws(() => dns.default.lookup('localhost'));          // no callback argument
    assert.equal(w.counts.dnsLookup, 1, 'the counter that reports zero can also report one');
    const sock = new net.Socket();
    try { sock.connect(); } catch { /* no port and no path, which is the point */ }
    sock.destroy();
    assert.equal(w.counts.socketConnect, 1, 'a second door counts on its own');
    assert.equal(w.total(), 2);
  } finally { w.restore(); }
  // After restore the wrappers are gone, so the instrument cannot leak into the rest of a run.
  const dns2 = await import('node:dns');
  assert.throws(() => dns2.default.lookup('localhost'));
  assert.equal(w.counts.dnsLookup, 1, 'the restored door does not count');
});

test('the cpu clock resolution is measured rather than assumed', () => {
  const c = cpuResolutionMs();
  assert.ok(c.spins > 0);
  assert.ok(c.resolutionMs === null || c.resolutionMs > 0, 'resolution ' + c.resolutionMs + ' ms in ' + c.spins + ' spins');
  assert.equal(defaultTasks({ scale: 1 }).length, 3);
});

// ---------------------------------------------------------------- 6. the shipped experiments
test('every shipped experiment has a verdict on disk with the numbers it was graded on', async () => {
  assert.deepEqual(EXPERIMENT_NAMES, ['learning-rule', 'phasor-memory', 'goal-routing']);
  for (const name of EXPERIMENT_NAMES) {
    const exp = await loadExperiment(name);
    assert.equal(exp.name, name);
    assert.ok(exp.seeds.length >= exp.bar.seeds, name + ' runs ' + exp.seeds.length + ' seeds against a bar of ' + exp.bar.seeds);
    const v = readVerdict(name);
    assert.equal(v.name, name);
    assert.ok(['confirmed', 'refuted', 'undecided'].includes(v.verdict), name + ' is ' + v.verdict);
    assert.equal(v.metric, exp.hypothesis.metric);
    assert.equal(v.hypothesis.minEffect, exp.hypothesis.minEffect);
    assert.equal(v.k, exp.seeds.length);
    assert.equal(v.treatment.values.length, v.k);
    assert.equal(v.control.values.length, v.k);
    assert.equal(v.diffs.length, v.k);
    assert.ok(Number.isFinite(v.effect.mean));
    assert.ok(v.permutation.share >= 0 && v.permutation.share <= 1);
    assert.equal(v.isolation.undeclaredCrossings, 0, name + ' left no undeclared crossing behind');
    // The verdict names the code it graded, and that code has not changed since.
    assert.equal(v.source.mechanism, contentHash(exp.mechanism), name + ' mechanism source has not drifted from the verdict');
    assert.equal(v.source.control, contentHash(exp.control), name + ' control source has not drifted from the verdict');
  }
  // Failure is a normal result: at least one of the three did not confirm, and that is fine.
  const verdicts = EXPERIMENT_NAMES.map((n) => readVerdict(n).verdict);
  assert.ok(verdicts.some((v) => v !== 'confirmed'), 'verdicts: ' + verdicts.join(', '));
  assert.ok(verdicts.includes('confirmed'), 'verdicts: ' + verdicts.join(', '));
});

// ---------------------------------------------------------------- 7. house rules
test('no lab file carries an em dash, and none of them imports a dependency', () => {
  const roots = [path.join(ROOT, 'lab'), path.join(ROOT, 'lab', 'experiments')];
  const files = [];
  for (const dir of roots) for (const f of readdirSync(dir)) if (f.endsWith('.mjs')) files.push(path.join(dir, f));
  files.push(path.join(ROOT, 'test', 'lab.test.mjs'));
  files.push(path.join(ROOT, 'bench', 'lab.mjs'));
  files.push(path.join(ROOT, 'notes', 'lab.md'));
  assert.ok(files.length >= 10, 'checked ' + files.length + ' files');
  let specs = 0;
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    assert.equal(src.includes(EM_DASH), false, path.relative(ROOT, f) + ' carries an em dash');
    // The same three patterns bench/gate.mjs scans for, anchored at the start of a line so
    // the word "from" inside a comment or a string is not mistaken for an import.
    const found = [];
    for (const m of src.matchAll(/^\s*(?:import|export)\b[^;]*?\bfrom\s*['"]([^'"]+)['"]/gm)) found.push(m[1]);
    for (const m of src.matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm)) found.push(m[1]);
    for (const m of src.matchAll(/\bimport\(\s*['"]([^'"]+)['"]/g)) found.push(m[1]);
    for (const spec of found) {
      specs++;
      assert.ok(spec.startsWith('.') || spec.startsWith('node:'), path.relative(ROOT, f) + ' imports ' + spec);
    }
  }
  assert.ok(specs > 40, specs + ' import specifiers checked across ' + files.length + ' files');
});

test('the verdicts directory is where the harness says it is', () => {
  assert.equal(VERDICTS_DIR, path.join(ROOT, 'lab', 'verdicts'));
  assert.ok(listVerdicts().length >= 3, listVerdicts().length + ' verdicts on disk');
});

test('the bench verdict on disk reproduced every shipped experiment', async () => {
  // Importing bench/lab.mjs runs nothing: the main guard compares argv[1] and is false here.
  // The bench itself takes about a second and a half, so the test grades the verdict it
  // wrote rather than running it again, and asserts the file is the current one by checking
  // the mechanism hash in it against the mechanism on disk right now.
  const { render } = await import('../bench/lab.mjs');
  const file = path.join(ROOT, 'bench', 'verdicts', 'lab.json');
  const v = JSON.parse(readFileSync(file, 'utf8'));
  assert.equal(v.verdict, 'GREEN', 'bench/verdicts/lab.json says ' + v.verdict + ': run node bench/lab.mjs');
  assert.equal(v.reproduced, v.experimentsTotal);
  assert.equal(v.experimentsTotal, EXPERIMENT_NAMES.length);
  for (const e of v.experiments) {
    assert.deepEqual(e.mismatches, [], e.name + ' did not reproduce');
    const exp = await loadExperiment(e.name);
    assert.equal(e.mechanismHash, contentHash(exp.mechanism), e.name + ': the bench graded a different mechanism than the one on disk now');
  }
  // The replay half of the bench has to have caught the injected divergence. A determinism
  // check that never diverges is measuring nothing.
  assert.equal(v.replay.clean.ok, true);
  assert.equal(v.replay.caught, true);
  assert.equal(v.replay.clean.divergence, null);
  assert.ok(v.replay.tampered.divergence, 'the tampered replay must report a first divergence');
  assert.equal(v.replay.tampered.divergence.cell, 'a.s2');
  assert.equal(v.cost.external.networkCalls, 0);
  assert.match(render(v), /reproduced/);
  assert.match(render(v), new RegExp(EXPERIMENT_NAMES[0]));
});
