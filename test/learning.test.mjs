// test/learning.test.mjs : run from the brain directory with
//   node --test test/learning.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Brain } from '../core/brain.mjs';
import { makePolicy } from '../core/gate.mjs';
import * as S from '../core/signal.mjs';
import '../cells/basic.mjs';
import '../cells/learning.mjs';
import {
  attach, detach, listRules, getRule, hasRule, rulesNamedBy, ruleNames, meanIncoming,
} from '../learning/index.mjs';

// A brain with the core's own growth and pruning switched off, so that anything that
// happens to the connectome in these tests came from learning/ and nowhere else. The gate
// policy has to be named explicitly: core/brain.mjs derives the gate's grow threshold from
// coact.threshold and its prune staleness from pruneEvery, so silencing the core's own
// growth would otherwise silently move the bar every proposal in this file has to clear.
function quietBrain(opts = {}) {
  return new Brain({ ledger: 'runs', growth: { threshold: 1e9 }, pruneEvery: 0, policy: makePolicy(), ...opts });
}
const HV = S.hvFromSeed('stimulus');
const relay = (b, id, region, circuit = 'main') =>
  b.addCell({ id, kind: 'hv.permute', region, circuit, params: { k: 0 }, policy: { period: 'event' } });
// memory.assoc fires when a QUERY arrives and stays silent when only a KEY arrives, which
// is how these tests drive a post cell with, and without, its presynaptic partner.
const target = (b, id, region, learn = null, circuit = 'main') =>
  b.addCell({ id, kind: 'memory.assoc', region, circuit, policy: { period: 'event', learn } });

// ---------------------------------------------------------------- 1. the registry
test('registry: rules are named plugins with a scope and a doc, and a cell policy may name one', () => {
  const names = ruleNames();
  for (const n of ['hebbian', 'delta', 'reinforcement', 'predictive', 'structural', 'homeostatic']) {
    assert.ok(names.includes(n), 'missing rule ' + n);
    const r = getRule(n);
    assert.ok(['edge', 'cell', 'structure'].includes(r.scope), n + ' scope');
    assert.ok(r.doc.length > 20, n + ' doc');
    assert.equal(typeof r.apply, 'function');
  }
  assert.equal(hasRule('nope'), false);
  assert.throws(() => getRule('nope'), /unknown learning rule/);
  assert.equal(listRules().length, names.length);

  const b = quietBrain({ ledger: 'off' });
  relay(b, 'a', 'r');
  target(b, 'p', 'r', ['hebbian', 'homeostatic']);
  target(b, 'q', 'r', 'delta');
  target(b, 'z', 'r', false);
  assert.deepEqual(rulesNamedBy(b.cell('p')), ['hebbian', 'homeostatic']);
  assert.deepEqual(rulesNamedBy(b.cell('q')), ['delta']);
  assert.deepEqual(rulesNamedBy(b.cell('z')), []);
  assert.deepEqual(rulesNamedBy(b.cell('a')), []);
});

// ---------------------------------------------------------------- 2. hebbian with STDP
test('hebbian strengthens a causal pre-post pair and weakens an anti-causal one', () => {
  const W0 = 0.5;

  // causal: pre fires at t=0, its spike arrives at the post cell's QUERY port at t=1 and
  // makes it fire there. dt = tPost - arrival = 0, the strongest potentiation there is.
  const causal = quietBrain();
  relay(causal, 'pre', 'r');
  target(causal, 'post', 'r', ['hebbian']);
  const eC = causal.connect('pre', 'out', 'post', 'query', { w: W0 });
  const engC = attach(causal, { print: false });
  causal.inject('pre', 'in', { kind: 'hv', data: HV });
  causal.tick(3);
  const wC = causal.connectome.w[eC];

  // anti-causal: the post cell fires at t=0 on its own, the pre cell fires at t=1 and its
  // spike lands on the KEY port at t=2, which produces no output. dt = 0 - 2 = -2.
  const anti = quietBrain();
  relay(anti, 'pre', 'r');
  target(anti, 'post', 'r', ['hebbian']);
  const eA = anti.connect('pre', 'out', 'post', 'key', { w: W0 });
  attach(anti, { print: false });
  anti.inject('post', 'query', { kind: 'hv', data: HV });
  anti.tick(1);
  anti.inject('pre', 'in', { kind: 'hv', data: HV });
  anti.tick(2);
  const wA = anti.connectome.w[eA];

  assert.ok(wC > W0, 'causal pairing must potentiate: ' + wC + ' vs ' + W0);
  assert.ok(wA < W0, 'anti-causal pairing must depress: ' + wA + ' vs ' + W0);
  assert.equal(anti.cell('post').stats.fired, 1, 'the key-only arrival must not make post fire');
  assert.ok(engC.st('hebbian').potentiated >= 1 && engC.report().applied >= 2, JSON.stringify(engC.report()));

  // and the primitive on its own, with evidence handed to it directly
  const solo = quietBrain({ ledger: 'off' });
  relay(solo, 'a', 'r'); target(solo, 'b', 'r');
  const e = solo.connect('a', 'out', 'b', 'query', { w: 1 });
  const rule = getRule('hebbian');
  const up = rule.apply(solo, e, { pre: 1, post: 1, dt: 0, gain: 1 }, solo.ctx);
  const down = rule.apply(solo, e, { pre: 0, post: 0, dt: -1, gain: 1 }, solo.ctx);
  assert.ok(up > 0 && down < 0, 'apply: ' + up + ' / ' + down);
});

// ---------------------------------------------------------------- 3. delta
test('delta moves the weights into an erring cell and stops moving them as the error falls', () => {
  const b = quietBrain({ ledger: 'off' });
  b.addCell({ id: 'relay', kind: 'integrate.ema', region: 'r', params: { tau: 1 }, policy: { period: 'event' } });
  b.addCell({ id: 'mlp', kind: 'vec.mlp', region: 'r', params: { nin: 2, nhid: 8, nout: 1, lr: 0.1 }, policy: { period: 'event', learn: ['delta'] } });
  const e = b.connect('relay', 'out', 'mlp', 'x', { w: 1 });
  attach(b, { delta: { eta: 0.002 }, print: false });

  const w = [b.connectome.w[e]];
  const err = [];
  const step = (i) => {
    const x0 = (i % 2), x1 = ((i >> 1) % 2);
    b.inject('relay', 'in', { kind: 'vec', data: Float32Array.from([x0, x1]) });
    b.tick(1);
    b.inject('mlp', 'target', { kind: 'vec', data: Float32Array.from([x0]) });
    b.tick(1);
  };
  for (let i = 0; i < 20; i++) step(i);
  w.push(b.connectome.w[e]); err.push(b.cell('mlp').state.err);
  for (let i = 20; i < 180; i++) step(i);
  w.push(b.connectome.w[e]);
  for (let i = 180; i < 200; i++) step(i);
  w.push(b.connectome.w[e]); err.push(b.cell('mlp').state.err);

  const early = Math.abs(w[1] - w[0]), late = Math.abs(w[3] - w[2]);
  assert.ok(w[1] < w[0] && w[3] < w[2], 'a positive error attenuates its inputs: ' + w.join(' '));
  assert.ok(err[1] < err[0], 'the cell learned: err ' + err[0].toFixed(4) + ' -> ' + err[1].toFixed(4));
  assert.ok(late < early, 'delta slows as the error falls: first 20 steps ' + early.toFixed(5) + ', last 20 ' + late.toFixed(5));
});

// ---------------------------------------------------------------- 4. reinforcement
test('reinforcement raises the weights on the path that led to reward and not on a control path', () => {
  const b = quietBrain();
  relay(b, 'srcA', 'sensory'); target(b, 'outA', 'motor');
  relay(b, 'srcB', 'sensory'); target(b, 'outB', 'motor');
  b.addCell({ id: 'rw', kind: 'reward.source', region: 'reward', params: { value: 1, region: 'motor' }, policy: { period: 'event' } });
  const eA = b.connect('srcA', 'out', 'outA', 'query', { w: 0 });
  const eB = b.connect('srcB', 'out', 'outB', 'query', { w: 0 });
  const eng = attach(b, { rules: ['reinforcement'], reinforcement: { eta: 0.1, gamma: 0.95, lambda: 0.85, floor: 0.01 }, print: false });

  b.inject('srcB', 'in', { kind: 'hv', data: HV });   // the control path, 22 ticks early
  b.tick(22);
  b.inject('srcA', 'in', { kind: 'hv', data: HV });   // the path that led to the reward
  b.tick(2);
  b.inject('rw', 'trigger', { kind: 'event', data: { go: 1 } });
  b.tick(1);

  const dA = b.connectome.w[eA], dB = b.connectome.w[eB];
  assert.equal(b.cell('outA').stats.fired, 1);
  assert.equal(b.cell('outB').stats.fired, 1);
  assert.ok(dA > 0.05, 'rewarded path credited: ' + dA);
  assert.equal(dB, 0, 'control path uncredited, its trace decayed below the floor: ' + dB);
  assert.equal(eng.st('reinforcement').rewards, 1);
  assert.equal(b.ledger.recent(50, 'learn.reward').length, 1);
  assert.equal(b.ledger.recent(50, 'learn.reinforce')[0].region, 'motor');
});

// ---------------------------------------------------------------- 5. predictive
test('predictive raises surprise on a changed sequence and lowers it after adaptation', () => {
  const b = quietBrain({ ledger: 'off' });
  b.addCell({ id: 'pred', kind: 'predict.next', region: 'assoc', policy: { period: 'event', learn: ['predictive'] } });
  b.addCell({ id: 'down', kind: 'hv.bundle', region: 'assoc', policy: { period: 'event' } });
  const eng = attach(b, { predictive: { tau: 8, kappa: 2 }, print: false });
  const idx = b.cell('pred').idx;
  const feed = (v, n) => { for (let i = 0; i < n; i++) { b.inject('pred', 'observe', { kind: 'vec', data: Float32Array.from(v) }); b.tick(1); } };

  feed([1, 0], 20);
  const settled = b.cell('pred').stats.surprise, gainSettled = eng.lrScale[idx];
  feed([5, 0], 2);
  const surprised = b.cell('pred').stats.surprise, gainSurprised = eng.lrScale[idx];
  feed([5, 0], 30);
  const adapted = b.cell('pred').stats.surprise, gainAdapted = eng.lrScale[idx];

  assert.ok(settled < 0.01, 'a predictable sequence carries no surprise: ' + settled);
  assert.ok(surprised > 0.3, 'the change is surprising: ' + surprised);
  assert.ok(adapted < surprised / 3, 'surprise falls again after adaptation: ' + surprised.toFixed(4) + ' -> ' + adapted.toFixed(4));
  assert.equal(gainSettled, 1);
  assert.ok(gainSurprised > 1.5, 'surprise scales the learning rate of edges into the cell: ' + gainSurprised);
  assert.ok(gainAdapted < gainSurprised && gainAdapted < 1.2, 'and gives it back: ' + gainAdapted);
});

// ---------------------------------------------------------------- 6. structural
test('structural proposes through the gate with evidence, and never changes structure without an approval', () => {
  // (a) not enough evidence: no proposal at all
  const thin = quietBrain();
  relay(thin, 'x', 'r'); relay(thin, 'y', 'r');
  attach(thin, { rules: ['structural'], structural: { every: 4, growThreshold: 8, decayEvery: 0, pruneSweepEvery: 0 }, print: false });
  for (let i = 0; i < 4; i++) {
    thin.inject('x', 'in', { kind: 'hv', data: HV });
    thin.inject('y', 'in', { kind: 'hv', data: HV });
    thin.tick(1);
  }
  thin.tick(4);
  assert.equal(thin.gate.stats.proposed, 0, 'no evidence, no proposal');
  assert.equal(thin.connectome.size(), 0);

  // (b) enough evidence: one proposal, approved, and exactly one edge
  const grown = quietBrain();
  relay(grown, 'x', 'r'); relay(grown, 'y', 'r');
  const engG = attach(grown, { rules: ['structural'], structural: { every: 4, growThreshold: 8, decayEvery: 0, pruneSweepEvery: 0 }, print: false });
  for (let i = 0; i < 9; i++) {
    grown.inject('x', 'in', { kind: 'hv', data: HV });
    grown.inject('y', 'in', { kind: 'hv', data: HV });
    grown.tick(1);
  }
  assert.equal(grown.gate.stats.proposed, 1);
  assert.equal(grown.gate.stats.approved, 1);
  assert.equal(grown.connectome.size(), 1);
  assert.equal(engG.st('structural').grown, 1);
  const prop = grown.ledger.recent(200, 'proposal').find(p => p.by === 'learning.structural');
  assert.ok(prop, 'the proposal is in the ledger');
  assert.equal(prop.kind, 'edge.grow');
  assert.ok(prop.evidence.coActivations >= 8, 'with its evidence: ' + JSON.stringify(prop.evidence));
  assert.equal(grown.ledger.recent(200, 'decision').filter(d => d.status === 'approved').length, 1);

  // (c) the same evidence against a stricter gate: proposed, rejected, and nothing grew
  const strict = quietBrain({ policy: makePolicy({ growThreshold: 1000 }) });
  relay(strict, 'x', 'r'); relay(strict, 'y', 'r');
  attach(strict, { rules: ['structural'], structural: { every: 4, growThreshold: 8, decayEvery: 0, pruneSweepEvery: 0 }, print: false });
  for (let i = 0; i < 9; i++) {
    strict.inject('x', 'in', { kind: 'hv', data: HV });
    strict.inject('y', 'in', { kind: 'hv', data: HV });
    strict.tick(1);
  }
  assert.equal(strict.gate.stats.proposed, 1);
  assert.equal(strict.gate.stats.rejected, 1);
  assert.equal(strict.connectome.size(), 0, 'a rejected proposal changes nothing');

  // (d) disuse: a weak silent edge is proposed for pruning and pruned after approval
  const stale = quietBrain({ policy: makePolicy({ pruneStale: 120 }) });
  relay(stale, 'x', 'r'); target(stale, 'y', 'r');
  const e = stale.connect('x', 'out', 'y', 'query', { w: 0.01 });
  const engS = attach(stale, { rules: ['structural'], structural: { every: 0, decayEvery: 0, pruneSweepEvery: 64, staleTicks: 120 }, print: false });
  stale.tick(130);
  assert.equal(engS.st('structural').pruned, 1);
  assert.equal(stale.connectome.live(), 0);
  const pp = stale.ledger.recent(500, 'proposal').find(p => p.kind === 'edge.prune');
  assert.ok(pp && pp.evidence.staleTicks >= 120 && Math.abs(pp.evidence.w) < 0.05, JSON.stringify(pp && pp.evidence));
  assert.equal(stale.connectome.flags[e] & 1, 0, 'the edge is no longer active');
});

// ---------------------------------------------------------------- 7. homeostatic
test('homeostatic keeps the mean incoming weight per cell inside the band and preserves ratios', () => {
  const b = quietBrain({ ledger: 'off' });
  b.addCell({ id: 'hub', kind: 'hv.bundle', region: 'r', policy: { period: 'event', learn: ['homeostatic'] } });
  b.addCell({ id: 'low', kind: 'hv.bundle', region: 'r', policy: { period: 'event', learn: ['homeostatic'] } });
  for (let i = 0; i < 3; i++) relay(b, 's' + i, 'r');
  const hi = [2, 3, 4].map((w, i) => b.connect('s' + i, 'out', 'hub', 'in', { w }));
  const lo = [0.01, 0.02].map((w, i) => b.connect('s' + i, 'out', 'low', 'in', { w }));
  const eng = attach(b, { homeostatic: { every: 1, lo: 0.25, hi: 1.0, target: 0.5, maxScale: 8 }, print: false });

  assert.equal(meanIncoming(b, b.cell('hub')), 3);
  b.tick(1);
  const mHub = meanIncoming(b, b.cell('hub'));
  assert.ok(Math.abs(mHub - 0.5) < 1e-6, 'one sweep brings a runaway cell to target: ' + mHub);
  assert.ok(Math.abs(b.connectome.w[hi[1]] / b.connectome.w[hi[0]] - 1.5) < 1e-5, 'ratios preserved');

  b.tick(4);
  const mLow = meanIncoming(b, b.cell('low'));
  assert.ok(mLow >= 0.25 && mLow <= 1.0, 'a starved cell is scaled back into band: ' + mLow);
  assert.ok(Math.abs(b.connectome.w[lo[1]] / b.connectome.w[lo[0]] - 2) < 1e-4, 'ratios preserved');
  assert.ok(Math.abs(meanIncoming(b, b.cell('hub')) - 0.5) < 1e-6, 'and an in band cell is left alone');
  assert.ok(eng.st('homeostatic').down >= 1 && eng.st('homeostatic').up >= 1);
});

// ---------------------------------------------------------------- 8. attach and detach
test('attach and detach leave no hook, no listener and no ctx field behind', () => {
  const b = quietBrain({ ledger: 'off' });
  relay(b, 'a', 'r'); target(b, 'p', 'r', ['hebbian']);
  b.connect('a', 'out', 'p', 'query', { w: 0.5 });
  const hooks0 = b.hooks.afterTick.length, listeners0 = b.ledger.listeners.size;
  assert.equal('learning' in b.ctx, false);

  const eng = attach(b, { print: false });
  assert.equal(b.hooks.afterTick.length, hooks0 + 1);
  assert.equal(b.ledger.listeners.size, listeners0 + 1);
  assert.equal(b.ctx.learning, eng);
  b.inject('a', 'in', { kind: 'hv', data: HV });
  b.tick(4);
  assert.equal(eng.report().ticks, 4);

  eng.detach();
  assert.equal(b.hooks.afterTick.length, hooks0);
  assert.equal(b.ledger.listeners.size, listeners0);
  assert.equal('learning' in b.ctx, false);
  const ticksAtDetach = eng.report().ticks;
  b.inject('a', 'in', { kind: 'hv', data: HV });
  b.tick(10);
  assert.equal(eng.report().ticks, ticksAtDetach, 'a detached engine never runs again');
  assert.equal(eng.detach(), eng, 'detaching twice is a no-op');
  assert.equal(b.hooks.afterTick.length, hooks0);

  // two engines, detached in the wrong order, still leave nothing
  const e1 = attach(b, { print: false }), e2 = attach(b, { print: false });
  assert.equal(b.hooks.afterTick.length, hooks0 + 2);
  detach(e1); detach(e2);
  assert.equal(b.hooks.afterTick.length, hooks0);
  assert.equal(b.ledger.listeners.size, listeners0);
  assert.equal('learning' in b.ctx, false);
});

// ---------------------------------------------------------------- 9. the learning cells
test('learning cells carry reward, error, gain and a named rule through the connectome', () => {
  const b = quietBrain();
  b.addCell({ id: 'rw', kind: 'reward.source', region: 'reward', params: { value: 0.75, region: 'motor' }, policy: { period: 'event' } });
  b.addCell({ id: 'err', kind: 'error.aggregate', region: 'assoc', circuit: 'pred', params: { tau: 2 }, policy: { period: 'event' } });
  b.addCell({ id: 'mod', kind: 'modulator', region: 'mod', params: { base: 1, scale: 1, region: 'motor' }, policy: { period: 'event' } });
  b.addCell({ id: 'hub', kind: 'hv.bundle', region: 'motor', policy: { period: 'event' } });
  for (let i = 0; i < 2; i++) relay(b, 's' + i, 'motor');
  const es = [3, 5].map((w, i) => b.connect('s' + i, 'out', 'hub', 'in', { w }));
  b.addCell({ id: 'apply', kind: 'learn.apply', region: 'control', params: { rule: 'homeostatic', region: 'motor', config: { lo: 0.25, hi: 1, target: 0.5 } }, policy: { period: 4 } });
  const eng = attach(b, { print: false });
  assert.equal(meanIncoming(b, b.cell('hub')), 4, 'the hub starts far above the band');

  b.inject('rw', 'trigger', { kind: 'event', data: { go: 1 } });
  b.inject('err', 'error', { kind: 'num', data: S.flt(0.4) });
  b.inject('err', 'error', { kind: 'num', data: S.flt(0.6) });
  b.inject('mod', 'in', { kind: 'num', data: S.flt(1) });
  b.tick(1);

  // reward: a num on the wire and a learn.reward event the engine picked up
  const rwEv = b.ledger.recent(50, 'learn.reward');
  assert.equal(rwEv.length, 1);
  assert.equal(rwEv[0].region, 'motor');
  assert.equal(rwEv[0].value, 0.75);
  assert.equal(eng.rewards.get('motor'), 0.75);
  assert.equal(b.cell('rw').state.emitted, 1);

  // error: two error signals bundled into one number, published to the circuit
  const errEv = b.ledger.recent(50, 'learn.error')[0];
  assert.ok(Math.abs(errEv.error - 0.5) < 1e-6, 'mean of 0.4 and 0.6: ' + errEv.error);
  assert.equal(errEv.n, 2);
  assert.equal(errEv.circuit, 'assoc/pred');
  assert.ok(Math.abs(eng.errorFor('assoc/pred').error - 0.5) < 1e-6);

  // gain: a modulator sets the learning rate multiplier for a whole region
  assert.equal(b.ledger.recent(50, 'learn.modulator')[0].gain, 2);
  assert.equal(eng.gainFor('motor'), 2);
  assert.equal(eng.gainForCell(b.cell('hub').idx), 2);
  assert.equal(eng.gainFor('assoc'), 1);

  // learn.apply: a cell that runs a named rule over a target set on its own period. It is
  // a period 4 cell, so it is due at t = 0 and has already run once by here.
  const m = meanIncoming(b, b.cell('hub'));
  assert.ok(Math.abs(m - 0.5) < 1e-6, 'learn.apply ran homeostatic over region motor: ' + m);
  assert.ok(Math.abs(b.connectome.w[es[1]] / b.connectome.w[es[0]] - 5 / 3) < 1e-5);
  const ap = b.ledger.recent(50, 'learn.apply').pop();
  assert.equal(ap.rule, 'homeostatic');
  assert.equal(ap.scope, 'cell');
  assert.ok(ap.applied >= 1, JSON.stringify(ap));
  assert.equal(b.cell('apply').state.runs >= 1, true);
});

// ---------------------------------------------------------------- 10. cost
test('the per tick budget is enforced and printed, and cells added after attach are picked up', () => {
  const lines = [];
  const b = quietBrain();
  for (let i = 0; i < 6; i++) {
    relay(b, 's' + i, 'r');
    target(b, 'p' + i, 'r', ['hebbian']);
    b.connect('s' + i, 'out', 'p' + i, 'query', { w: 0.5 });
  }
  const eng = attach(b, { budget: 2, printEvery: 1, print: (l) => lines.push(l) });
  for (let i = 0; i < 6; i++) b.inject('s' + i, 'in', { kind: 'hv', data: HV });
  b.tick(3);

  const r = eng.report();
  assert.ok(r.skipped > 0, 'the budget bit: ' + JSON.stringify(r));
  assert.ok(r.overBudget >= 1, 'and was recorded: ' + r.overBudget);
  assert.equal(r.appliedPerTick <= r.budget, true);
  assert.ok(b.ledger.recent(50, 'learn.budget').length >= 1, 'over budget is a ledger event');
  assert.equal(lines.length, 3, 'printEvery 1 printed one line per tick');
  assert.match(lines[0], /^\[learning\] t=\d+ rules=hebbian applied\/tick=[\d.]+ us\/tick=[\d.]+ max=[\d.]+us budget=2 skipped=\d+ overBudget=\d+$/);

  // a cell added after attach is sampled like any other on the next tick
  relay(b, 'late', 'r');
  target(b, 'lateP', 'r', ['hebbian']);
  const e = b.connect('late', 'out', 'lateP', 'query', { w: 0.5 });
  eng.config.budget = 1000;
  b.inject('late', 'in', { kind: 'hv', data: HV });
  b.tick(3);
  assert.ok(b.connectome.w[e] > 0.5, 'the late edge learned: ' + b.connectome.w[e]);
  assert.equal(eng.nCells >= b.cells.length, true);

  // the plain string form of policy.learn collides with the core built in branch, and says so
  const warned = [];
  const c = quietBrain({ ledger: 'off' });
  relay(c, 'a', 'r');
  target(c, 'p', 'r', 'hebbian');
  attach(c, { print: (l) => warned.push(l) });
  assert.equal(warned.length, 1);
  assert.match(warned[0], /policy\.learn = "hebbian" as a plain string/);
});

// ---------------------------------------------------------------- 11. the whole loop
test('a small brain learns to route an input to the rewarded output', () => {
  const b = quietBrain({ name: 'router', ledger: 'runs' });
  relay(b, 'in', 'perception');
  b.addCell({ id: 'sel', kind: 'learn.explore', region: 'decide', params: { beta: 4 }, policy: { period: 'event' } });
  target(b, 'L', 'motor');
  target(b, 'R', 'motor');
  b.addCell({ id: 'rwL', kind: 'reward.source', region: 'reward', params: { value: 1, region: 'motor' }, policy: { period: 'event' } });
  b.addCell({ id: 'rwR', kind: 'reward.source', region: 'reward', params: { value: -1, region: 'motor' }, policy: { period: 'event' } });
  b.connect('in', 'out', 'sel', 'in');
  const eL = b.connect('sel', 'a', 'L', 'query', { w: 0 });
  const eR = b.connect('sel', 'b', 'R', 'query', { w: 0 });
  b.connect('L', 'out', 'rwL', 'trigger');
  b.connect('R', 'out', 'rwR', 'trigger');

  const EPISODE = 10;
  const episode = () => { b.inject('in', 'in', { kind: 'hv', data: HV }); b.tick(EPISODE); };
  const rate = (n) => {
    const st = b.cell('sel').state;
    const a0 = st.counts[0], b0 = st.counts[1];
    for (let i = 0; i < n; i++) episode();
    const hits = st.counts[0] - a0, miss = st.counts[1] - b0;
    return hits / Math.max(1, hits + miss);
  };

  const before = rate(60);                       // no engine attached: the policy cannot move
  const eng = attach(b, {
    rules: ['reinforcement'],
    reinforcement: { eta: 0.2, gamma: 0.95, lambda: 0.6, floor: 0.01 },
    print: false,
  });
  for (let i = 0; i < 200; i++) episode();       // train
  const after = rate(60);

  const r = eng.report();
  console.log('[routing] success rate before ' + (before * 100).toFixed(1) + '% after ' + (after * 100).toFixed(1) +
    '%  w(rewarded)=' + b.connectome.w[eL].toFixed(3) + ' w(other)=' + b.connectome.w[eR].toFixed(3) +
    '  episodes=320 ticks=' + b.clock.t);
  console.log(eng.budgetLine());

  assert.ok(before > 0.3 && before < 0.7, 'an untrained policy is a coin flip: ' + before);
  assert.ok(after > 0.9, 'a trained policy routes to the rewarded output: ' + after);
  assert.ok(after - before > 0.3, 'before ' + before + ' after ' + after);
  assert.ok(b.connectome.w[eL] > b.connectome.w[eR] + 1, 'the connectome holds the policy');
  assert.equal(b.ledger.recent(4000, 'learn.reward').length > 0, true);
  assert.ok(r.usPerTick > 0 && Number.isFinite(r.usPerTick), 'a measured per tick cost: ' + r.usPerTick);
  assert.ok(r.skipped === 0 && r.overBudget === 0, 'inside budget: ' + JSON.stringify(r));
});
