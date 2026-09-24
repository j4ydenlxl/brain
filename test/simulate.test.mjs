import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Brain } from '../core/brain.mjs';
import { RNG } from '../core/rng.mjs';
import * as S from '../core/signal.mjs';
import '../cells/basic.mjs';
import '../cells/simulate.mjs';
import { cloneSub, resolveIds, fingerprint, sharedBuffers, deepCopy } from '../simulate/clone.mjs';
import { defineWorld, getWorld, listWorlds } from '../simulate/world.mjs';
import { rollout, simulateCandidates, scalarize, readout, variance } from '../simulate/simulator.mjs';
import { plan, decide, enumerateCandidates, randomCandidates, localSearch } from '../simulate/planner.mjs';
import { Workspace, entropy } from '../simulate/workspace.mjs';
import { Attention } from '../simulate/attention.mjs';

// ---------------------------------------------------------------- fixtures
// A toy 1D world. The organism learns p' = clamp(p + 0.25a, -1, 1) from experience with a
// vec.mlp, and a predict.next cell watches the model's own output stream. Planning then
// happens entirely inside clones of that learned model: no world is ever touched again.
const STEP = 0.25;
function toyBrain({ samples = 8000, nhid = 24, lr = 0.05 } = {}) {
  const b = new Brain({ name: 'toy', ledger: 'off' });
  b.addRegion('world', { doc: 'the learned forward model' });
  b.addCell({ id: 'w.model', kind: 'vec.mlp', region: 'world', circuit: 'dyn', params: { nin: 2, nhid, nout: 1, lr, seed: 'toy' }, policy: { period: 'event' } });
  b.addCell({ id: 'w.predict', kind: 'predict.next', region: 'world', circuit: 'dyn', policy: { period: 'event' } });
  b.connect('w.model', 'y', 'w.predict', 'observe');
  const rng = new RNG('toy-train');
  for (let i = 0; i < samples; i++) {
    const p = rng.next() * 2 - 1;
    const a = [-1, 0, 1][rng.int(3)];
    const q = Math.max(-1, Math.min(1, p + STEP * a));
    b.inject('w.model', 'x', { kind: 'vec', data: Float32Array.from([p, a]) });
    b.inject('w.model', 'target', { kind: 'vec', data: Float32Array.from([q]) });
    b.tick(1);
  }
  b.takeOutbox();
  return b;
}
function modelError(b, rng = new RNG('toy-check'), n = 200) {
  let se = 0;
  for (let i = 0; i < n; i++) {
    const p = rng.next() * 2 - 1, a = [-1, 0, 1][rng.int(3)];
    const q = Math.max(-1, Math.min(1, p + STEP * a));
    b.inject('w.model', 'x', { kind: 'vec', data: Float32Array.from([p, a]) });
    b.tick(1);
    const y = b.cell('w.model').state.lastY[0];
    se += (y - q) * (y - q);
  }
  b.takeOutbox();
  return Math.sqrt(se / n);
}

defineWorld('toy1d', {
  region: 'world',
  actions: [-1, 0, 1],
  encode: (a, ctx) => ({ cell: 'w.model', port: 'x', kind: 'vec', data: Float32Array.from([ctx.state, a]) }),
  observe: (clone) => { const y = clone.cell('w.model').state.lastY; return y ? y[0] : 0; },
  score: (trace, ctx) => -Math.abs(trace[trace.length - 1].state - ctx.goal),
});
// The same world with per-seed measurement noise, so uncertainty across seeds is real.
defineWorld('toy1d.noisy', {
  ...getWorld('toy1d'),
  name: 'toy1d.noisy',
  perturb: (s, rng) => s + (rng.next() - 0.5) * 0.12,
});

// ---------------------------------------------------------------- 1. clone isolation
test('clone: a mutated clone leaves the original byte-identical and shares no typed array', () => {
  const b = toyBrain({ samples: 300 });
  b.addRegion('cognitive');
  b.addCell({ id: 'c.hold', kind: 'source.const', region: 'cognitive', params: { kind: 'hv', data: S.hvFromSeed('held') }, policy: { period: 'event' } });
  b.addCell({ id: 'c.mem', kind: 'memory.assoc', region: 'cognitive', policy: { period: 'event' } });
  b.inject('c.mem', 'key', { kind: 'hv', data: S.hvFromSeed('k1') });
  b.inject('c.mem', 'value', { kind: 'event', data: { v: 1 } });
  b.tick(1);
  b.inject('w.model', 'x', { kind: 'vec', data: Float32Array.from([0.1, 1]) }, { delay: 3 }); // still in flight
  const before = fingerprint(b);

  const clone = cloneSub(b);
  assert.equal(clone.cells.length, b.cells.length);
  assert.equal(clone.connectome.size(), b.connectome.size());
  assert.equal(clone.clock.t, b.clock.t);
  assert.equal(fingerprint(clone).length > 0, true);

  // no shared memory anywhere in cell state, params, mailboxes or the connectome
  assert.deepEqual(sharedBuffers(b, clone), []);

  // now maul the clone in every way a rollout could
  clone.cell('w.model').state.W1.fill(0);
  clone.cell('c.hold').state.data[0] = -clone.cell('c.hold').state.data[0];
  clone.cell('c.mem').state.keys.length = 0;
  clone.connectome.w[0] = 99;
  clone.inject('w.model', 'x', { kind: 'vec', data: Float32Array.from([0.5, -1]) });
  clone.tick(25);
  clone.addRegion('brand.new', { budget: 2 });
  clone.addCell({ id: 'extra', kind: 'source.counter', region: 'brand.new' });

  assert.equal(fingerprint(b), before, 'the original is byte-identical after the clone was mutated');
  assert.notEqual(fingerprint(clone), before);
  assert.deepEqual(sharedBuffers(b, clone), []);
  // and the parent did not gain the clone's tick
  assert.equal(b.cell('w.model').stats.runs < clone.cell('w.model').stats.runs, true);
});

test('clone: resolveIds selects by region, circuit, id and exclusion, and only internal edges come along', () => {
  const b = new Brain({ name: 'sel', ledger: 'off' });
  b.addCell({ id: 'a', kind: 'source.counter', region: 'r1', circuit: 'c1' });
  b.addCell({ id: 'b', kind: 'sink.log', region: 'r1', circuit: 'c2', policy: { period: 'event' } });
  b.addCell({ id: 'c', kind: 'sink.log', region: 'r2', circuit: 'c1', policy: { period: 'event' } });
  b.connect('a', 'out', 'b', 'in');
  b.connect('a', 'out', 'c', 'in');
  assert.deepEqual(resolveIds(b, { region: 'r1' }), ['a', 'b']);
  assert.deepEqual(resolveIds(b, { circuit: 'r1/c1' }), ['a']);
  assert.deepEqual(resolveIds(b, { cells: ['c', 'a'] }), ['a', 'c']);
  assert.deepEqual(resolveIds(b, { exclude: 'b' }), ['a', 'c']);
  assert.deepEqual(resolveIds(b, { excludeKinds: 'sink.log' }), ['a']);
  const sub = cloneSub(b, { region: 'r1' });
  assert.equal(sub.cells.length, 2);
  assert.equal(sub.connectome.size(), 1, 'the edge to r2 was left behind with r2');
  assert.equal(b.connectome.size(), 2);
});

test('clone: 1,000 cells', () => {
  const b = new Brain({ name: 'big', ledger: 'off' });
  b.addRegion('bulk');
  const N = 1000;
  for (let i = 0; i < N; i++) {
    const k = i % 20 === 0 ? 'vec.mlp' : (i % 4 === 0 ? 'predict.next' : (i % 4 === 1 ? 'hv.bundle' : (i % 4 === 2 ? 'source.counter' : 'sink.log')));
    const params = k === 'vec.mlp' ? { nin: 8, nhid: 16, nout: 4 } : {};
    b.addCell({ id: 'c' + i, kind: k, region: 'bulk', circuit: 'c' + (i % 10), params, policy: { period: k === 'source.counter' ? 1 : 'event' } });
  }
  let edges = 0;
  for (let i = 0; i + 3 < N; i += 4) { b.connect('c' + (i + 2), 'out', 'c' + (i + 3), 'in'); edges++; }
  b.tick(2);
  const t0 = process.hrtime.bigint();
  const clone = cloneSub(b);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  console.log('    clone of ' + N + ' cells and ' + edges + ' edges: ' + ms.toFixed(2) + ' ms (' + clone.origin.ms.toFixed(2) + ' ms measured inside cloneSub)');
  assert.equal(clone.cells.length, N);
  assert.equal(clone.connectome.size(), edges);
  assert.deepEqual(sharedBuffers(b, clone), []);
  assert.ok(ms < 2000, 'clone of 1,000 cells took ' + ms.toFixed(2) + ' ms');
});

// ---------------------------------------------------------------- 2. the simulator
test('simulator: a learned 1D model ranks reaching the goal above missing it, and the run is deterministic per seed', () => {
  const b = toyBrain();
  const rmse = modelError(b);
  console.log('    toy1d model rmse on 200 held-out transitions: ' + rmse.toFixed(4));
  assert.ok(rmse < 0.05, 'the model learned the dynamics, rmse ' + rmse.toFixed(4));

  const up = { id: 'up', actions: [1, 1, 1, 1, 1, 1] };
  const down = { id: 'down', actions: [-1, -1, -1, -1, -1, -1] };
  const stay = { id: 'stay', actions: [0, 0, 0, 0, 0, 0] };
  const res = simulateCandidates(b, { world: 'toy1d', candidates: [down, stay, up], horizon: 6, goal: 0.6, state0: -0.6, lambda: 0.5 });
  console.log('    ranked: ' + res.ranked.map(r => r.id + ' score ' + r.score.toFixed(3) + ' unc ' + r.uncertainty.toFixed(4) + ' end ' + r.state.toFixed(3)).join(' | '));
  assert.equal(res.best.id, 'up');
  assert.equal(res.ranked.map(r => r.id).join(','), 'up,stay,down');
  assert.equal(res.ticks, 18, 'three candidates over horizon 6');
  // open-loop rollout error compounds: the model is fed its own output six times over
  const drift = Math.abs(res.best.state - (-0.6 + STEP * 6));
  console.log('    six-step open-loop drift from the true -0.6 + 6 x 0.25 = 0.9: ' + drift.toFixed(4));
  assert.ok(drift < 0.12, 'six up steps from -0.6 reach about 0.9, got ' + res.best.state.toFixed(3));

  // the trace is complete, per tick, and carries both predictor cells
  const tr = res.best.trace;
  assert.equal(tr.length, 6);
  assert.deepEqual(tr.map(r => r.tick), [0, 1, 2, 3, 4, 5]);
  assert.deepEqual(Object.keys(tr[3].predictions).sort(), ['w.model', 'w.predict']);
  assert.ok(tr[0].state < tr[5].state, 'the state moved toward the goal');

  // determinism: the same seed gives the same trace, twice
  const a1 = rollout(b, { world: 'toy1d', candidate: up, horizon: 6, goal: 0.6, state0: -0.6, seed: 7 });
  const a2 = rollout(b, { world: 'toy1d', candidate: up, horizon: 6, goal: 0.6, state0: -0.6, seed: 7 });
  assert.deepEqual(a1.trace.map(r => r.state), a2.trace.map(r => r.state));
  assert.equal(a1.score, a2.score);
  // and the parent is untouched by 18 simulated ticks: 8000 training ticks + 200 checks
  assert.equal(b.cell('w.model').stats.runs, 8200);
});

test('simulator: uncertainty is reported from seeds and from disagreeing predictor cells', () => {
  const b = toyBrain({ samples: 1500 });
  const cands = [{ id: 'up', actions: [1, 1, 1, 1] }, { id: 'down', actions: [-1, -1, -1, -1] }];
  const one = simulateCandidates(b, { world: 'toy1d', candidates: cands, horizon: 4, goal: 0.5, state0: 0, seeds: [0] });
  const many = simulateCandidates(b, { world: 'toy1d.noisy', candidates: cands, horizon: 4, goal: 0.5, state0: 0, seeds: [1, 2, 3, 4, 5] });
  console.log('    uncertainty: 1 seed (predictor spread) ' + one.best.uncertainty.toFixed(5) + ' | 5 noisy seeds (score spread) ' + many.best.uncertainty.toFixed(5));
  assert.equal(one.best.uncertainty, one.best.uncertaintyPredictors, 'one seed falls back to predictor spread');
  assert.ok(one.best.uncertaintyPredictors > 0, 'w.model and w.predict do not agree at every tick');
  assert.equal(many.best.uncertainty, many.best.uncertaintySeeds);
  assert.ok(many.best.uncertaintySeeds > 0, 'five perturbed seeds do not agree');
  assert.equal(many.ticks, 40, 'two candidates x five seeds x horizon 4');
  assert.equal(many.best.scores.length, 5);
  // lambda actually moves the ranking key
  const risky = simulateCandidates(b, { world: 'toy1d.noisy', candidates: cands, horizon: 4, goal: 0.5, state0: 0, seeds: [1, 2, 3], lambda: 0 });
  const timid = simulateCandidates(b, { world: 'toy1d.noisy', candidates: cands, horizon: 4, goal: 0.5, state0: 0, seeds: [1, 2, 3], lambda: 10 });
  assert.equal(risky.best.decision, risky.best.score);
  assert.ok(timid.best.decision < timid.best.score);
});

test('simulator: scalarize and readout speak every signal kind', () => {
  assert.equal(scalarize('vec', Float32Array.from([1, 3])), 2);
  assert.equal(scalarize('num', S.flt(1.5)), 1.5);
  assert.equal(scalarize('num', S.ratFromDecimal('9.11')), 9.11);
  assert.equal(scalarize('sdr', S.sdr(10, [1, 2])), 0.2);
  assert.equal(scalarize('event', { pass: true }), 1);
  assert.equal(scalarize('event', { score: -3 }), -3);
  assert.equal(scalarize('hv', new Int8Array([1, 1, -1, -1])), 0);
  assert.equal(scalarize('num', S.flt(NaN)), 0);
  const b = toyBrain({ samples: 20 });
  assert.equal(readout(b.cell('w.model')).kind, 'vec');
  assert.equal(readout(b.cell('w.predict')).kind, 'vec');
  assert.equal(readout(b.cell('w.model')).value.length, 1);
  assert.equal(variance([1, 1, 1]), 0);
  assert.equal(variance([0, 2]), 1);
});

// ---------------------------------------------------------------- 3. the planner
test('planner: candidate generation enumerates, samples and searches locally', () => {
  const A = [-1, 0, 1];
  const all = enumerateCandidates(A, 2, 100);
  assert.equal(all.length, 9);
  assert.deepEqual(all[0].actions, [-1, -1]);
  assert.deepEqual(all[8].actions, [1, 1]);
  assert.equal(enumerateCandidates(A, 4, 10).length, 10, 'the cap binds');
  const r1 = randomCandidates(A, 5, 6, new RNG('s'));
  const r2 = randomCandidates(A, 5, 6, new RNG('s'));
  assert.deepEqual(r1.map(c => c.actions), r2.map(c => c.actions), 'sampling is seeded');
  assert.notDeepEqual(r1.map(c => c.actions), randomCandidates(A, 5, 6, new RNG('t')).map(c => c.actions));
  const near = localSearch({ actions: [1, 1, 1, 1] }, A, 5, new RNG('l'), { radius: 1 });
  assert.equal(near.length, 5);
  for (const c of near) {
    assert.equal(c.actions.length, 4);
    assert.ok(c.actions.filter((x, i) => x !== [1, 1, 1, 1][i]).length >= 1, 'a neighbour differs somewhere');
  }
  assert.equal(decide([{ id: 'a', score: 1, uncertainty: 0 }, { id: 'b', score: 2, uncertainty: 4 }], 0.5).id, 'a');
  assert.equal(decide([{ id: 'a', score: 1, uncertainty: 0 }, { id: 'b', score: 2, uncertainty: 4 }], 0).id, 'b');
});

test('planner: the tick budget is hard, and more budget buys more search', () => {
  const b = toyBrain();
  const common = { world: 'toy1d', horizon: 4, goal: 0.6, state0: -0.6, seeds: [0], width: 8, seed: 'budget' };
  const tight = plan(b, { ...common, rounds: 8, budgetTicks: 20 });
  const loose = plan(b, { ...common, rounds: 8, budgetTicks: 400 });
  console.log('    budget 20: ' + tight.ticksUsed + ' ticks, ' + tight.evaluated + ' candidates, best ' + tight.best.score.toFixed(3));
  console.log('    budget 400: ' + loose.ticksUsed + ' ticks, ' + loose.evaluated + ' candidates, best ' + loose.best.score.toFixed(3));
  assert.equal(tight.costPer, 4);
  assert.ok(tight.ticksUsed <= 20, 'ticksUsed ' + tight.ticksUsed + ' must not cross the budget');
  assert.equal(tight.ticksUsed, 20);
  assert.equal(tight.evaluated, 5, 'a budget of 20 ticks buys exactly 5 rollouts of horizon 4');
  assert.equal(tight.truncated, true);
  assert.ok(loose.ticksUsed <= 400);
  assert.ok(loose.evaluated > tight.evaluated, 'more budget evaluated more candidates');
  assert.ok(loose.best.score > tight.best.score, 'and local search found a strictly better plan with the room to look');
  // a budget too small for a single rollout buys nothing and still does not overspend
  const none = plan(b, { ...common, rounds: 8, budgetTicks: 3 });
  assert.equal(none.ticksUsed, 0);
  assert.equal(none.evaluated, 0);
  assert.equal(none.best, null);
  assert.equal(none.truncated, true);
});

test('planner: the plan it returns actually reaches the goal in the learned model', () => {
  const b = toyBrain();
  const res = plan(b, { world: 'toy1d', horizon: 6, budgetTicks: 600, goal: 0.6, state0: -0.6, seeds: [0], width: 12, rounds: 3, seed: 'reach' });
  const end = res.best.state;
  console.log('    best plan ' + JSON.stringify(res.best.actions) + ' ends at ' + end.toFixed(3) + ' (goal 0.6) after ' + res.ticksUsed + ' simulated ticks');
  assert.ok(Math.abs(end - 0.6) < 0.12, 'the plan lands near the goal, ended at ' + end.toFixed(3));
  const sumOfSteps = res.best.actions.reduce((a, x) => a + x, 0);
  assert.equal(Math.abs(-0.6 + STEP * sumOfSteps - 0.6) < 0.15, true, 'and it is the right arithmetic in the real world too');
});

// ---------------------------------------------------------------- 4. the global workspace
test('workspace: entropy is measured over the broadcast set', () => {
  assert.equal(entropy(['a', 'a', 'a']), 0);
  assert.equal(entropy(['a', 'b']), 1);
  assert.equal(entropy(['a']), 0);
  assert.ok(Math.abs(entropy(['a', 'a', 'b']) - 0.5793) < 0.001);
});

test('workspace: top-k wins the bus, hubs receive it, and the novelty drive fires when entropy collapses', () => {
  const b = new Brain({ name: 'ws', ledger: 'off' });
  b.addRegion('cortex');
  for (const [id, sal] of [['s1', 3], ['s2', 2], ['s3', 1]]) {
    b.addCell({ id, kind: 'workspace.submit', region: 'cortex', circuit: 'submit', params: { salience: sal }, policy: { period: 'event' } });
  }
  b.addCell({ id: 'hub', kind: 'workspace.hub', region: 'cortex', circuit: 'gw', policy: { period: 'event' } });
  b.addCell({ id: 'sink', kind: 'sink.log', region: 'cortex', circuit: 'gw', policy: { period: 'event' } });
  b.connect('hub', 'out', 'sink', 'in');
  const ws = new Workspace(b, {
    k: 2, regions: ['cortex'], hubs: ['hub'],
    collapseThreshold: 0.01, collapseTicks: 2,
    novelty: { cell: 'hub', port: 'broadcast', kind: 'hv' }, noveltyRegion: 'cortex',
  }).attach();

  const submit = (v1, v2, v3) => {
    b.inject('s1', 'in', { kind: 'hv', data: v1 });
    b.inject('s2', 'in', { kind: 'hv', data: v2 });
    b.inject('s3', 'in', { kind: 'hv', data: v3 });
    b.tick(1);
  };
  // four diverse ticks: three submissions, the two most salient win, entropy is 1
  for (let i = 0; i < 4; i++) submit(S.hvFromSeed('a' + i), S.hvFromSeed('b' + i), S.hvFromSeed('c' + i));
  const diverse = ws.history.filter(r => r.winners.length);
  assert.equal(diverse.length, 4);
  assert.deepEqual(diverse[0].winners.map(w => w.cell), ['s1', 's2'], 'top-k by salience');
  assert.equal(diverse.every(r => r.entropy === 1), true);
  assert.equal(ws.stats.novelty, 0, 'a diverse workspace needs no drive');
  assert.equal(ws.stats.submitted, 12);
  assert.equal(ws.stats.winners, 8);
  assert.ok(b.cell('hub').state.broadcasts > 0, 'the hub received the broadcast');
  assert.ok(b.cell('sink').stats.runs > 0, 'and passed it on across the graph');

  // now collapse it: the same content wins every slot
  const same = S.hvFromSeed('stuck');
  submit(same, same, same);
  assert.equal(ws.history.at(-1).entropy, 0);
  assert.equal(ws.stats.novelty, 0, 'one collapsed tick is not yet a collapse');
  submit(same, same, same);
  assert.equal(ws.history.at(-1).entropy, 0);
  assert.equal(ws.history.at(-1).novelty, true, 'two collapsed ticks in a row fire the intrinsic drive');
  assert.equal(ws.stats.novelty, 1);
  assert.equal(ws.stats.collapses, 1);

  // the novelty it injected competes at high salience and breaks the loop from the inside
  submit(same, same, same);
  const after = ws.history.at(-1);
  assert.equal(after.winners[0].cell, '(novelty)');
  assert.equal(after.entropy, 1, 'entropy recovered because the drive put something new on the bus');
  const report = ws.report();
  console.log('    workspace: ' + JSON.stringify(report));
  assert.equal(report.refused, 0);
  assert.equal(ws.detach()._hook, null);
});

test('workspace: a port that cannot carry the broadcast refuses it instead of coercing', () => {
  const b = new Brain({ name: 'ws2', ledger: 'off' });
  b.addRegion('cortex');
  b.addCell({ id: 's1', kind: 'workspace.submit', region: 'cortex', params: { salience: 1 }, policy: { period: 'event' } });
  b.addCell({ id: 'numeric', kind: 'num.compare', region: 'cortex', policy: { period: 'event' } });
  const ws = new Workspace(b, { k: 1, regions: ['cortex'] }).subscribe('numeric', 'a').attach();
  b.inject('s1', 'in', { kind: 'hv', data: S.hvFromSeed('x') });
  b.tick(2);
  assert.equal(ws.stats.refused, 1);
  assert.equal(ws.stats.broadcasts, 0);
  assert.equal(b.cell('numeric').stats.runs, 0);
});

// ---------------------------------------------------------------- 5. attention
function attentionBrain(goalHv) {
  const b = new Brain({ name: 'attn', ledger: 'off' });
  b.addRegion('cortex', { budget: 1 });   // one cell per tick, no more
  b.addRegion('limbic');
  // 'boring' is registered first on purpose: without attention it wins every tie
  b.addCell({ id: 'boring', kind: 'sink.log', region: 'cortex', circuit: 'c', policy: { period: 'event' } });
  b.addCell({ id: 'relevant', kind: 'sink.log', region: 'cortex', circuit: 'c', policy: { period: 'event' } });
  b.addCell({ id: 'goal', kind: 'attention.goal', region: 'limbic', circuit: 'g', params: { label: 'target', emit: false }, policy: { period: 'event' } });
  b.cell('goal').state.hv = goalHv;
  return b;
}
function feed(b, ticks) {
  const goalHv = b.cell('goal').state.hv;
  for (let i = 0; i < ticks; i++) {
    b.inject('relevant', 'in', { kind: 'hv', data: S.bundle([goalHv, S.hvFromSeed('mix' + i)]) }, { delay: 1 });
    b.inject('boring', 'in', { kind: 'hv', data: S.hvFromSeed('dull' + i) }, { delay: 1 });
    b.tick(1);
  }
}

test('attention: a goal-matching cell is funded under a tight budget while a boring one is skipped', () => {
  const goalHv = S.hvFromSeed('target');
  const TICKS = 8;

  const control = attentionBrain(goalHv);
  feed(control, TICKS);
  const cr = control.cell('relevant').stats.runs, cb = control.cell('boring').stats.runs;

  const b = attentionBrain(goalHv);
  const att = new Attention(b, { regions: ['cortex'], goalCell: 'goal', weights: { novelty: 0, surprise: 1, goal: 3 }, gain: 12 }).attach();
  feed(b, TICKS);
  const ar = b.cell('relevant').stats.runs, ab = b.cell('boring').stats.runs;

  console.log('    control: relevant ran ' + cr + ', boring ran ' + cb + ' | attention: relevant ran ' + ar + ', boring ran ' + ab);
  assert.equal(ar, 7, 'every tick with mail funded the relevant cell');
  assert.equal(ab, 0, 'the boring cell was never funded');
  assert.equal(b.cell('boring').stats.skips, 7);
  assert.ok(cb > 0 && cr < ar, 'without attention the boring cell takes the budget');
  assert.equal(b.scheduler.stats.funded, 7);
  assert.equal(b.scheduler.stats.skipped, 7);

  const rel = att.relevanceOf('relevant'), dull = att.relevanceOf('boring');
  console.log('    relevance: relevant goal ' + rel.goal.toFixed(3) + ' priority ' + rel.priority.toFixed(2) + ' | boring goal ' + dull.goal.toFixed(3) + ' priority ' + dull.priority.toFixed(2));
  assert.ok(rel.goal > 0.4 && dull.goal < 0.1);
  assert.ok(rel.priority > dull.priority * 3);
  assert.ok(dull.priority < 1.5, 'a random hypervector barely moves the boring cell off its base priority of 1');

  const row = att.budgetReport(TICKS - 1, 'cortex');
  console.log('    budget report: ' + JSON.stringify(row));
  assert.equal(row.budget, 1);
  assert.equal(row.demand, 2);
  assert.equal(row.funded, 1);
  assert.equal(row.skipped, 1);
  assert.equal(row.spent, 1);
  assert.equal(row.headroom, 0);
  assert.equal(row.top[0].cell, 'relevant');
});

test('attention: surprise propagates from a predictor to the cell about to receive its output', () => {
  const b = new Brain({ name: 'surp', ledger: 'off' });
  b.addRegion('cortex');
  b.addCell({ id: 'pred', kind: 'predict.next', region: 'cortex', circuit: 'p', policy: { period: 'event' } });
  b.addCell({ id: 'down', kind: 'sink.log', region: 'cortex', circuit: 'p', policy: { period: 'event' } });
  b.addCell({ id: 'calm', kind: 'sink.log', region: 'cortex', circuit: 'p', policy: { period: 'event' } });
  b.connect('pred', 'prediction', 'down', 'in');
  const att = new Attention(b, { regions: ['cortex'], weights: { novelty: 1, surprise: 4, goal: 0 }, gain: 6 }).attach();
  const jumps = [0, 5, -5, 9, -9, 12];
  for (const x of jumps) { b.inject('pred', 'observe', { kind: 'vec', data: Float32Array.from([x]) }); b.tick(1); }
  console.log('    pred surprise ' + b.cell('pred').stats.surprise.toFixed(3) + ', inherited by down ' + b.cell('down').stats.surprise.toFixed(3) + ', calm ' + b.cell('calm').stats.surprise.toFixed(3));
  assert.ok(b.cell('pred').stats.surprise > 1, 'the predictor owns a real error');
  assert.ok(b.cell('down').stats.surprise > 1, 'the cell about to receive it inherits that surprise');
  assert.equal(b.cell('calm').stats.surprise, 0, 'a cell with no incoming signal inherits nothing');
  assert.ok(att.relevanceOf('down').surprise > 0.5, 'squashed into [0,1]');
  assert.ok(b.cell('down').policy.priority > 1, 'and it is funded ahead of the rest');
});

// ---------------------------------------------------------------- 6. the cells
test('cells: simulate.plan turns a goal event into a ranked plan inside one tick', () => {
  const b = toyBrain();
  b.addRegion('cognitive');
  b.addCell({ id: 'planner', kind: 'simulate.plan', region: 'cognitive', circuit: 'plan',
    params: { world: 'toy1d', horizon: 5, budgetTicks: 400, lambda: 0.5, width: 16, rounds: 5, keep: 3, seeds: [0] },
    policy: { period: 'event' } });
  b.addCell({ id: 'chooser', kind: 'decide.argmax', region: 'cognitive', circuit: 'plan', params: { lambda: 0.5, window: 1 }, policy: { period: 'event' } });
  b.connect('planner', 'plan', 'chooser', 'in');
  b.inject('planner', 'goal', { kind: 'event', data: { goal: 0.5, state: -0.5 } });
  b.tick(3);
  const out = b.takeOutbox();
  const choice = out.find(s => s.src === b.cell('chooser').idx);
  const planEvent = b.cell('planner').state;
  assert.equal(planEvent.plans, 1);
  assert.ok(planEvent.lastTicks <= 400 && planEvent.lastTicks > 0);
  assert.ok(choice, 'the chooser emitted a decision');
  console.log('    planner used ' + planEvent.lastTicks + ' ticks, chose ' + JSON.stringify(choice.data.actions) + ' score ' + choice.data.score.toFixed(3));
  assert.equal(choice.data.actions.length, 5);
  assert.equal(choice.data.chosen, 1);
  assert.ok(choice.data.considered >= 3);
  assert.ok(Math.abs(-0.5 + STEP * choice.data.actions.reduce((a, x) => a + x, 0) - 0.5) < 0.2);
  // the planner never cloned itself
  assert.equal(b.cell('planner').stats.runs, 1);
});

test('cells: simulate.counterfactual answers what would have happened under a different action', () => {
  const b = toyBrain();
  b.addRegion('cognitive');
  b.addCell({ id: 'cf', kind: 'simulate.counterfactual', region: 'cognitive', circuit: 'cf', params: { world: 'toy1d' }, policy: { period: 'event' } });
  b.inject('cf', 'episode', { kind: 'event', data: { actions: [1, 1, -1, -1], at: 2, alt: 1, goal: 0.8, state: 0 } });
  b.tick(1);
  const ans = b.takeOutbox().find(s => s.src === b.cell('cf').idx).data;
  console.log('    counterfactual: at ' + ans.at + ' was ' + ans.was + ' instead ' + ans.alt + ' -> factual end ' + ans.factual.state.toFixed(3) + ', counterfactual end ' + ans.counterfactual.state.toFixed(3) + ', delta ' + ans.delta.toFixed(3));
  assert.equal(ans.was, -1);
  assert.equal(ans.alt, 1);
  assert.equal(ans.better, true, 'replacing a step back with a step forward gets nearer 0.8');
  assert.ok(ans.delta > 0.4);
  assert.ok(ans.counterfactual.state > ans.factual.state);
  assert.equal(ans.ticks, 8, 'two rollouts of horizon 4');
});

test('cells: attention.goal holds and replaces a goal hypervector across a snapshot-shaped round trip', () => {
  const b = new Brain({ name: 'g', ledger: 'off' });
  b.addRegion('limbic');
  b.addCell({ id: 'goal', kind: 'attention.goal', region: 'limbic', params: { label: 'first' }, policy: { period: 'event' } });
  b.addCell({ id: 'probe', kind: 'sink.log', region: 'limbic', policy: { period: 'event' } });
  b.connect('goal', 'goal', 'probe', 'in');
  assert.equal(S.sim(b.cell('goal').state.hv, S.hvFromSeed('first')), 1);
  b.inject('goal', 'set', { kind: 'hv', data: S.hvFromSeed('second') });
  b.tick(2);
  assert.equal(S.sim(b.cell('goal').state.hv, S.hvFromSeed('second')), 1);
  assert.equal(b.cell('goal').state.changes, 1);
  assert.ok(b.cell('probe').stats.runs > 0);
  // a clone carries the goal and does not share its bytes
  const c = cloneSub(b);
  assert.equal(S.sim(c.cell('goal').state.hv, S.hvFromSeed('second')), 1);
  assert.deepEqual(sharedBuffers(b, c), []);
});

test('cells: decide.argmax ranks a ranked list over a window and breaks ties on id', () => {
  const b = new Brain({ name: 'd', ledger: 'off' });
  b.addRegion('cognitive');
  b.addCell({ id: 'pick', kind: 'decide.argmax', region: 'cognitive', params: { lambda: 1, window: 2 }, policy: { period: 'event' } });
  b.inject('pick', 'in', { kind: 'event', data: { ranked: [{ id: 'a', score: 10, uncertainty: 9 }, { id: 'b', score: 5, uncertainty: 0 }] } });
  b.tick(1);
  let out = b.takeOutbox().pop().data;
  assert.equal(out.id, 'b', 'lambda 1 punishes the uncertain winner');
  assert.equal(out.considered, 2);
  b.inject('pick', 'in', { kind: 'event', data: { id: 'c', score: 7, uncertainty: 0 } });
  b.tick(1);
  out = b.takeOutbox().pop().data;
  assert.equal(out.id, 'c', 'the window keeps the older candidates and c beats them both');
  assert.equal(out.considered, 3);
  assert.equal(out.chosen, 2);
});

test('cells: every new kind survives a snapshot and a restore', () => {
  const b = toyBrain({ samples: 400 });
  b.addRegion('cognitive');
  b.addRegion('limbic');
  b.addCell({ id: 'goal', kind: 'attention.goal', region: 'limbic', params: { label: 'aim' }, policy: { period: 'event' } });
  b.addCell({ id: 'sub', kind: 'workspace.submit', region: 'cognitive', params: { salience: 2 }, policy: { period: 'event' } });
  b.addCell({ id: 'hub', kind: 'workspace.hub', region: 'cognitive', policy: { period: 'event' } });
  b.addCell({ id: 'pick', kind: 'decide.argmax', region: 'cognitive', params: { lambda: 0.25 }, policy: { period: 'event' } });
  b.addCell({ id: 'planner', kind: 'simulate.plan', region: 'cognitive', params: { world: 'toy1d', horizon: 3, budgetTicks: 60, width: 6, rounds: 2 }, policy: { period: 'event' } });
  b.addCell({ id: 'cf', kind: 'simulate.counterfactual', region: 'cognitive', params: { world: 'toy1d' }, policy: { period: 'event' } });
  b.connect('planner', 'plan', 'pick', 'in');
  b.inject('goal', 'set', { kind: 'hv', data: S.hvFromSeed('elsewhere') });
  b.inject('sub', 'in', { kind: 'hv', data: S.hvFromSeed('thought') });
  b.inject('hub', 'broadcast', { kind: 'hv', data: S.hvFromSeed('thought') });
  b.inject('planner', 'goal', { kind: 'event', data: { goal: 0.25, state: 0 } });
  b.inject('cf', 'episode', { kind: 'event', data: { actions: [1, -1, 1], at: 1, alt: 1, goal: 0.5, state: 0 } });
  b.tick(4);
  b.takeOutbox();

  const dir = mkdtempSync(path.join(tmpdir(), 'brain-sim-'));
  try {
    b.snapshot(dir);
    const r = Brain.restore(dir, { ledger: 'off' });
    assert.equal(S.sim(r.cell('goal').state.hv, S.hvFromSeed('elsewhere')), 1);
    assert.equal(r.cell('goal').state.changes, 1);
    assert.equal(r.cell('sub').state.submitted, 1);
    assert.equal(r.cell('hub').state.broadcasts, b.cell('hub').state.broadcasts);
    assert.equal(r.cell('pick').state.chosen, b.cell('pick').state.chosen);
    assert.equal(r.cell('planner').state.plans, 1);
    assert.equal(r.cell('planner').state.lastTicks, b.cell('planner').state.lastTicks);
    assert.equal(r.cell('cf').state.asked, 1);
    // and the restored brain can still plan, from the restored world model
    const chosenBefore = r.cell('pick').state.chosen;
    r.inject('planner', 'goal', { kind: 'event', data: { goal: -0.25, state: 0 } });
    r.tick(3);
    assert.equal(r.cell('planner').state.plans, 2);
    assert.equal(r.cell('pick').state.chosen, chosenBefore + 1, 'the restored planner planned and the restored chooser chose');
    const choice = r.takeOutbox().find(s => s.src === r.cell('pick').idx);
    assert.equal(choice.data.actions.length, 3);
    assert.ok(choice.data.actions.reduce((a, x) => a + x, 0) < 0, 'a negative goal asks for negative steps');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('integration: a workspace and an attention economy run on the same brain without fighting', () => {
  const b = new Brain({ name: 'both', ledger: 'off' });
  b.addRegion('cortex', { budget: 2 });
  b.addRegion('limbic');
  b.addCell({ id: 'goal', kind: 'attention.goal', region: 'limbic', params: { label: 'aim', emit: false }, policy: { period: 'event' } });
  for (const [id, sal] of [['s1', 3], ['s2', 2], ['s3', 1]]) {
    b.addCell({ id, kind: 'workspace.submit', region: 'cortex', circuit: 'in', params: { salience: sal }, policy: { period: 'event' } });
  }
  b.addCell({ id: 'hub', kind: 'workspace.hub', region: 'cortex', circuit: 'gw', policy: { period: 'event' } });
  b.addCell({ id: 'listener', kind: 'sink.log', region: 'cortex', circuit: 'gw', policy: { period: 'event' } });
  b.connect('hub', 'out', 'listener', 'in');
  const ws = new Workspace(b, { k: 2, regions: ['cortex'], hubs: ['hub'], collapseThreshold: 0.01, collapseTicks: 2, noveltyRegion: 'cortex' }).attach();
  const att = new Attention(b, { regions: ['cortex'], goalCell: 'goal', weights: { novelty: 1, surprise: 1, goal: 2 }, gain: 6 }).attach();
  assert.equal(b.hooks.afterTick.length, 2);

  const aim = b.cell('goal').state.hv;
  for (let i = 0; i < 12; i++) {
    b.inject('s1', 'in', { kind: 'hv', data: S.bundle([aim, S.hvFromSeed('w' + i)]) });
    b.inject('s2', 'in', { kind: 'hv', data: S.hvFromSeed('q' + i) });
    b.inject('s3', 'in', { kind: 'hv', data: S.hvFromSeed('z' + (i % 2)) });
    b.tick(1);
  }
  console.log('    integration: ' + JSON.stringify(ws.report()) + ' scheduler ' + JSON.stringify(b.scheduler.stats));
  // 36 signals were injected, but a region budget of 2 across 5 cells does not fund every
  // submitter every tick, so fewer reach the bus. That starvation is the economy working.
  assert.ok(ws.stats.submitted > 0 && ws.stats.submitted < 36, 'submitted ' + ws.stats.submitted + ' of 36 injected');
  assert.ok(ws.stats.broadcasts > 0);
  assert.ok(b.cell('hub').state.broadcasts > 0);
  assert.ok(b.cell('listener').stats.runs > 0);
  assert.ok(b.scheduler.stats.skipped > 0, 'a budget of 2 in a region of 5 cells really binds');
  assert.equal(att.budgetReport(6, 'cortex').budget, 2);
  assert.ok(att.budgetReport(6, 'cortex').spent <= 2, 'the region never overspends its budget');
  assert.ok(att.relevanceOf('hub') !== null);
  ws.detach(); att.detach();
  assert.equal(b.hooks.afterTick.length, 0);
});

test('worlds: the registry refuses an unknown world and a spec without encode or score', () => {
  assert.throws(() => getWorld('nope'), /unknown world nope/);
  assert.throws(() => defineWorld('bad', { score: () => 0 }), /encode/);
  assert.throws(() => defineWorld('bad', { encode: () => [] }), /score/);
  assert.ok(listWorlds().includes('toy1d'));
  assert.deepEqual(deepCopy({ a: new Int8Array([1, 2]) }).a instanceof Int8Array, true);
});
