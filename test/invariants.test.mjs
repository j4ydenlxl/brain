// test/invariants.test.mjs: the properties the core must hold whatever else changes, plus
// one test for every mutant that bench/mutants.mjs found the other test files could not kill.
// Each test names the defect it exists to catch, so a later reader can tell what would have
// to break for it to fire.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { RNG, hash32 } from '../core/rng.mjs';
import * as S from '../core/signal.mjs';
import * as P from '../core/primitives.mjs';
import { Connectome, CoActivation } from '../core/connectome.mjs';
import { Ledger } from '../core/ledger.mjs';
import { Gate, PROPOSAL_KINDS } from '../core/gate.mjs';
import { Scheduler } from '../core/scheduler.mjs';
import { Brain } from '../core/brain.mjs';
import '../cells/basic.mjs';
import '../cells/control.mjs';
import { seedBasic } from '../seeds/basic.mjs';

// ---------------------------------------------------------------- helpers
const ledgerDigest = (b) => {
  const evs = b.ledger.recent(1_000_000);
  const parts = evs.map(e => [e.seq, e.type, e.cell ?? '', e.kind ?? '', e.hash ?? '', e.t ?? '', e.out ? e.out.join('|') : ''].join(','));
  return { events: evs.length, hash: hash32(parts.join(';')).toString(16) };
};
const cellDigest = (b) => b.cells.map(c => ({
  id: c.id, runs: c.stats.runs, fired: c.stats.fired, skips: c.stats.skips,
  errors: c.stats.errors, lastT: c.stats.lastT, mailbox: c.mailbox.map(m => m.length),
}));

// ---------------------------------------------------------------- hv algebra
// This one reads a module level cache (TIE) that is built on first use, so it has to run
// before any other bundle in this file. Mutant: the tie vector is not rebuilt when the
// width changes, which leaves lanes past the old width with no tie value at all.
test('bundle rebuilds its tie vector when the width changes (must run first)', () => {
  const rng = new RNG('tie:width');
  const small = [S.hvRandom(rng, 16), S.hvRandom(rng, 16)];
  assert.deepEqual(S.bundle(small, [1, 1]), S.scalar.bundle(small), 'tie lanes at width 16');
  const big = [S.hvRandom(rng, 64), S.hvRandom(rng, 64)];
  assert.deepEqual(S.bundle(big, [1, 1]), S.scalar.bundle(big), 'tie lanes at width 64 after a width 16 bundle');
  let ties = 0;
  for (let i = 0; i < 64; i++) if (big[0][i] !== big[1][i]) ties++;
  assert.ok(ties > 0, 'the even bundle has to tie somewhere to grade the tie vector');
  console.log('tie lanes graded at width 64: ' + ties + ' of 64');
});

// Mutants: permute rolls the other way; a negative shift is not normalized into range.
test('permute rolls forward by k and a negative k rolls back', () => {
  const rng = new RNG('permute');
  const a = S.hvRandom(rng, 64);
  const p1 = S.permute(a, 1);
  for (let i = 0; i < 64; i++) assert.equal(p1[(i + 1) % 64], a[i], 'lane ' + i + ' moved forward by one');
  const pm1 = S.permute(a, -1);
  for (let i = 0; i < 64; i++) assert.equal(pm1[i], a[(i + 1) % 64], 'lane ' + i + ' moved back by one');
  assert.deepEqual(S.unpermute(S.permute(a, 5), 5), a);
  assert.deepEqual(S.permute(a, -3), S.unpermute(a, 3));
  assert.deepEqual(S.permute(a, 64), a, 'a full turn is the identity');
  assert.deepEqual(S.permute(a, -67), S.permute(a, -3), 'shifts are taken modulo the width');
});

// ---------------------------------------------------------------- exact numbers
// Mutants: rationals are never reduced; gcd drops the absolute value of its first argument;
// a negative denominator loses its sign instead of moving it to the numerator.
test('rationals are always in lowest terms with a positive denominator', () => {
  assert.equal(S.ratToString(S.rat(6n, 4n)), '3/2');
  assert.equal(S.ratToString(S.rat(-6n, 4n)), '-3/2');
  assert.equal(S.ratToString(S.rat(6n, -4n)), '-3/2');
  assert.equal(S.rat(6n, -4n).d, 2n, 'the denominator is positive');
  assert.equal(S.rat(-6n, -4n).d, 2n);
  assert.equal(S.ratToString(S.rat(-6n, -4n)), '3/2');
  assert.equal(S.gcd(-12n, 8n), 4n);
  assert.equal(S.gcd(12n, -8n), 4n);
  assert.equal(S.gcd(-12n, -8n), 4n);
  assert.equal(S.ratToString(S.ratFromDecimal('-0.250')), '-1/4');
  assert.equal(S.ratToString(S.ratDiv(S.int(1), S.int(-3))), '-1/3');
});

// ---------------------------------------------------------------- the sym language
// Mutants: a tail call is not marked; the trampoline does not loop; strictly-less-than
// compares as less-or-equal; if takes the branch it was not told to take.
test('sym: tail calls trampoline, comparisons are strict, if takes the branch it was told', () => {
  const L = S.S, V = L.v, N = (x) => L.num(x);
  const loop = L.rec('f', ['i', 'acc'],
    L.if(L.gt(V('i'), N(100000)), V('acc'), L.call('f', L.add(V('i'), N(1)), L.add(V('acc'), V('i')))),
    L.call('f', N(1), N(0)));
  assert.equal(S.ratToString(P.evalSym(loop)), '5000050000', 'a 100000 step tail loop in constant stack');
  assert.equal(S.ratToString(P.evalSym(L.lt(N(3), N(3)))), '0');
  assert.equal(S.ratToString(P.evalSym(L.lt(N(2), N(3)))), '1');
  assert.equal(S.ratToString(P.evalSym(L.le(N(3), N(3)))), '1');
  assert.equal(S.ratToString(P.evalSym(L.gt(N(3), N(3)))), '0');
  assert.equal(S.ratToString(P.evalSym(L.ge(N(3), N(3)))), '1');
  assert.equal(S.ratToString(P.evalSym(L.if(N(1), N(7), N(9)))), '7');
  assert.equal(S.ratToString(P.evalSym(L.if(N(0), N(7), N(9)))), '9');
  assert.equal(S.ratToString(P.evalSym(L.floor(N('-2.5')))), '-3');
  assert.equal(S.ratToString(P.evalSym(L.mod(N(-7), N(3)))), '2');
});

// ---------------------------------------------------------------- the connectome
// Mutants: prune takes strong weights instead of weak ones; staleness is not required;
// a pruned edge is a candidate again.
test('prune candidates are live, weak and stale, and a pruned edge never comes back', () => {
  const c = new Connectome(8);
  const weakStale = c.add(0, 1, { w: 0.01 });
  const weakFresh = c.add(0, 2, { w: 0.01 });
  const strongStale = c.add(0, 3, { w: 0.9 });
  const weakPruned = c.add(0, 4, { w: 0.01 });
  const weakDormant = c.add(0, 5, { w: 0.01 });
  for (const e of [weakStale, strongStale, weakPruned, weakDormant]) c.touch(e, 10);
  c.touch(weakFresh, 4900);
  c.prune(weakPruned);
  c.dormant(weakDormant);
  assert.deepEqual(c.pruneCandidates(5000, { floor: 0.05, staleTicks: 1000 }), [weakStale]);
  assert.deepEqual(c.pruneCandidates(5000, { floor: 0.005, staleTicks: 1000 }), [], 'nothing is weak enough under a lower floor');
});

// Mutants: the sample budget is spent twice over; the sampled pair may be a cell with itself.
test('co-activation spends exactly its sample budget and never pairs a cell with itself', () => {
  const c = new Connectome();
  const budget = 64;
  const fired = Array.from({ length: 40 }, (_, i) => i); // 780 pairs, well over the budget
  let draws = 0;
  new CoActivation({ threshold: 1, sampleBudget: budget }).observe(fired, c, { int: () => { draws++; return 0; } });
  assert.equal(draws, 2 * budget, 'two draws per sample for a budget of ' + budget + ', got ' + draws);
  const co = new CoActivation({ threshold: 1, sampleBudget: budget });
  const out = co.observe(fired, c, new RNG('coact:pairs'));
  assert.ok(out.length > 0, 'the sampler produced ' + out.length + ' pairs');
  for (const [a, b] of out) assert.ok(a < b, 'pair ' + a + ',' + b + ' is ordered and is not a self pair');
  // under the budget the sampler is exhaustive and takes no draws at all
  let draws2 = 0;
  const small = new CoActivation({ threshold: 99, sampleBudget: budget });
  small.observe([1, 2, 3], c, { int: () => { draws2++; return 0; } });
  assert.equal(draws2, 0, 'three cells is three pairs, under the budget, so no sampling');
  assert.equal(small.stats.exhaustive, 1);
});

// ---------------------------------------------------------------- the scheduler
// Mutants: bids are funded from the lowest up; priority drops out of the bid. The second
// only shows when the cheap cell is the one the input order would fund first.
test('the scheduler funds the highest bid first even when the lowest bidder was added first', () => {
  const b = new Brain({ ledger: 'off', pruneEvery: 0 });
  b.addRegion('r', { budget: 1 });
  b.addCell({ id: 'lo', kind: 'source.counter', region: 'r', policy: { priority: 1 } });
  b.addCell({ id: 'hi', kind: 'source.counter', region: 'r', policy: { priority: 5 } });
  b.tick(4);
  assert.equal(b.cell('hi').stats.runs, 4, 'the high bidder ran every tick');
  assert.equal(b.cell('lo').stats.runs, 0);
  assert.equal(b.cell('lo').stats.skips, 4, 'and the low bidder kept its mailbox');
  assert.ok(Scheduler.bid(b.cell('hi')) > Scheduler.bid(b.cell('lo')), 'priority is in the bid');
});

// ---------------------------------------------------------------- the gate
// Mutants: a humanRequired kind is auto-approved; a prune is approved on staleness alone.
test('the gate never approves a humanRequired kind without a human decision', () => {
  const l = new Ledger({ ring: 256 });
  const g = new Gate({ ledger: l, policy: () => 'approve' }); // a policy that would approve anything
  for (const kind of PROPOSAL_KINDS) {
    const p = g.propose({ kind, what: {}, evidence: { coActivations: 1e9, staleTicks: 1e9, w: 0, gain: 1, beatControl: true, testsPassed: true } });
    if (g.humanRequired.has(kind)) {
      assert.equal(p.status, 'pending', kind + ' is held for a human');
      assert.equal(p.decidedBy, undefined);
      assert.equal(l.recent(256, 'decision').filter(d => d.proposal === p.id).length, 0, 'no decision was logged for ' + kind);
      const decided = g.decide(p.id, true, 'human');
      assert.equal(decided.status, 'approved');
      assert.equal(decided.decidedBy, 'human');
    } else {
      assert.equal(p.status, 'approved', kind + ' is the policy decision');
      assert.equal(p.decidedBy, 'policy');
    }
  }
  assert.equal(g.listPending().length, 0);
  assert.equal(g.stats.held, 0);
});

test('the default policy refuses to prune an edge that is stale but strong', () => {
  const g = new Gate({ ledger: new Ledger({ ring: 64 }) });
  const strong = g.propose({ kind: 'edge.prune', what: {}, evidence: { staleTicks: 100000, w: 0.9 } });
  assert.equal(strong.status, 'rejected', 'stale is not enough on its own');
  const weak = g.propose({ kind: 'edge.prune', what: {}, evidence: { staleTicks: 100000, w: 0.001 } });
  assert.equal(weak.status, 'approved');
  const fresh = g.propose({ kind: 'edge.prune', what: {}, evidence: { staleTicks: 1, w: 0.001 } });
  assert.equal(fresh.status, 'rejected', 'weak is not enough on its own');
});

// ---------------------------------------------------------------- the ledger
// Mutants: trace stops at depth 1 whatever the caller asked for; trace forgets the
// signal to run link.
test('ledger trace walks to the depth it was given and follows the signal to run link', () => {
  const l = new Ledger({ ring: 64 });
  const a = l.append({ type: 'signal', from: null });
  const r = l.append({ type: 'cell.run', consumed: [a] });
  const s = l.append({ type: 'signal', from: r });
  const r2 = l.append({ type: 'cell.run', consumed: [s] });
  assert.deepEqual(l.trace(r2).nodes.map(n => n.seq), [r2, s, r, a], 'the default depth reaches the root event');
  assert.deepEqual(l.trace(r2, 0).nodes.map(n => n.seq), [r2]);
  assert.deepEqual(l.trace(r2, 1).nodes.map(n => n.seq), [r2, s]);
  assert.deepEqual(l.trace(r2, 2).nodes.map(n => n.seq), [r2, s, r]);
  for (const [from, to] of l.trace(r2).edges) assert.ok(from < to, 'provenance points backwards in seq');
});

// ---------------------------------------------------------------- time and delivery
// Mutants: arrival is late by one tick; arrival ignores the edge delay; the clamp that
// keeps a signal scheduled into an already drained tick from vanishing is removed.
test('a signal never arrives earlier than t + 1 + delay', () => {
  for (const delay of [0, 1, 3]) {
    const b = new Brain({ ledger: 'runs', pruneEvery: 0 });
    b.addCell({ id: 'src', kind: 'source.counter', region: 'r', policy: { period: 4 } });
    b.addCell({ id: 'dst', kind: 'sink.log', region: 'r', policy: { period: 'event' } });
    b.connect('src', 'out', 'dst', 'in', { delay });
    b.tick(12);
    const want = [0, 4, 8].map(t => t + 1 + delay).filter(t => t < 12);
    const got = b.ledger.recent(500, 'cell.run').filter(r => r.cell === 'dst').map(r => r.t);
    assert.deepEqual(got, want, 'delay ' + delay + ': arrived at ' + got.join(',') + ' want ' + want.join(','));
    assert.equal(b.connectome.arrival(0, 100), 101 + delay);
  }
});

test('a signal scheduled into a tick that was already drained lands on the next tick, not never', () => {
  const b = new Brain({ ledger: 'runs', pruneEvery: 0 });
  b.addCell({ id: 'sink', kind: 'sink.log', region: 'r', policy: { period: 'event' } });
  b.hooks.afterTick.push((br, t) => { if (t === 3) br.inject('sink', 'in', { kind: 'event', data: { x: 1 } }); });
  b.tick(8);
  const got = b.ledger.recent(500, 'cell.run').filter(r => r.cell === 'sink').map(r => r.t);
  assert.deepEqual(got, [4], 'injected during tick 3, delivered at tick 4, ran at ' + got.join(','));
});

// ---------------------------------------------------------------- kinds
// Mutants: connect never refuses; connect refuses unless every kind fits; the emit time
// kind check is gone; compatiblePorts accepts a pair where only some kinds fit.
test('kinds never cross a port they are not declared for', () => {
  const b = new Brain({ ledger: 'runs', pruneEvery: 0 });
  b.addCell({ id: 'any', kind: 'source.const', region: 'r', params: { kind: 'hv', data: S.hvFromSeed('cross', 64) }, policy: { period: 1 } });
  b.addCell({ id: 'cmp', kind: 'num.compare', region: 'r', policy: { period: 'event' } });
  b.addCell({ id: 'enc', kind: 'encode.hv', region: 'r', policy: { period: 'event' } });
  // no kind in common: refused at wiring time
  assert.throws(() => b.connect('enc', 'hv', 'cmp', 'a'), /not accepted/, 'hv out cannot meet a num in');
  assert.throws(() => b.inject('cmp', 'a', { kind: 'event', data: {} }), /does not accept event/);
  // a polymorphic out port may wire to a narrow in port: some kind can still meet
  const e = b.connect('any', 'out', 'cmp', 'a');
  assert.ok(e >= 0, 'a source that can emit num may wire to a num port');
  // but the signal it actually emits is an hv, and that one is refused at emit time
  b.tick(3);
  assert.equal(b.cell('cmp').stats.runs, 0, 'the num port never ran on an hv');
  assert.ok(b.stats.refused >= 1, 'refused at emit: ' + b.stats.refused);
  assert.equal(b.cell('cmp').mailbox[0].length, 0, 'and nothing sits in its mailbox');
  // growth only ever wires a pair where every kind the source emits fits the destination
  assert.equal(b.compatiblePorts(b.cell('any'), b.cell('cmp')), null, 'growth will not wire a polymorphic out to a num in');
  assert.deepEqual(b.compatiblePorts(b.cell('enc'), b.cell('enc')), null);
  const hvIn = b.addCell({ id: 'log', kind: 'sink.log', region: 'r', policy: { period: 'event' } });
  assert.deepEqual(b.compatiblePorts(b.cell('enc'), hvIn), [0, 0], 'hv out into a port that takes every kind');
});

// ---------------------------------------------------------------- the register
// Mutant: the register decrements below zero and tests the value after the decrement
// instead of the value it had (the Minsky rule the register machine is compiled against).
test('num.register holds at zero and answers for the value it had before the decrement', () => {
  const b = new Brain({ ledger: 'off', pruneEvery: 0 });
  b.addCell({ id: 'r', kind: 'num.register', region: 'r', params: { initial: 1 }, policy: { period: 'event' } });
  const keys = [];
  for (let i = 0; i < 3; i++) {
    b.inject('r', 'dec', { kind: 'event', data: {} });
    b.tick(1);
    keys.push(b.takeOutbox().filter(s => s.kind === 'event').map(s => s.data.key).join());
  }
  assert.deepEqual(keys, ['nonzero', 'zero', 'zero']);
  assert.equal(b.cell('r').state.n, 0n, 'never below zero');
});

// ---------------------------------------------------------------- determinism and persistence
test('two brains from the same seed and wiring produce identical ledgers after 500 ticks', () => {
  const run = () => {
    const b = seedBasic({ ledger: 'full', seed: 'determinism' });
    for (const [at, text] of [[0, 'hello brain'], [37, 'hello again'], [150, 'stop now'], [410, 'ask me']]) {
      while (b.clock.t < at) b.tick(1);
      b.inject('p.encode', 'in', { kind: 'event', data: { text } });
    }
    while (b.clock.t < 500) b.tick(1);
    return b;
  };
  const a = run(), c = run();
  const da = ledgerDigest(a);
  assert.deepEqual(da, ledgerDigest(c));
  assert.deepEqual(cellDigest(a), cellDigest(c));
  assert.deepEqual(a.summary(), c.summary());
  assert.equal(a.clock.t, 500);
  assert.ok(da.events > 100, 'graded ' + da.events + ' ledger events');
  console.log('determinism over 500 ticks: ' + da.events + ' events, ledger hash ' + da.hash);
});

test('snapshot then restore then tick equals continued tick', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'brain-invariants-'));
  try {
    const b = seedBasic({ ledger: 'full', seed: 'snap' });
    b.inject('p.encode', 'in', { kind: 'event', data: { text: 'one two three' } });
    b.tick(20);
    b.inject('p.encode', 'in', { kind: 'event', data: { text: 'four five' } }, { delay: 3 });
    assert.ok(b.inflight.size > 0, 'there is a signal in flight across the snapshot');
    b.snapshot(dir);
    const c = Brain.restore(dir, { ledger: 'off' });
    b.tick(40); c.tick(40);
    assert.equal(c.clock.t, b.clock.t);
    assert.deepEqual(cellDigest(c), cellDigest(b));
    assert.deepEqual(c.connectome.serialize(), b.connectome.serialize());
    assert.deepEqual(c.stats, b.stats);
    assert.equal(S.sim(c.cell('a.predict').state.lastPrediction, b.cell('a.predict').state.lastPrediction), 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
