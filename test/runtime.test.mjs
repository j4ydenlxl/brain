// test/runtime.test.mjs : the parallel runtime must be invisible in the answer.
// Run from the brain directory: node --test test/runtime.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../core/signal.mjs';
import { Cluster, buildBrain } from '../runtime/cluster.mjs';
import { relaySpec, relayInjections, RELAY_MODULE } from '../bench/parallel.mjs';

const CELLS = 200, TICKS = 30;

function reference(spec, inject, ticks) {
  const b = buildBrain(spec);
  for (const i of inject) b.inject(i.cell, i.port, { kind: i.kind, data: i.data }, { delay: i.delay | 0, w: i.w ?? 1 });
  b.tick(ticks);
  return b;
}

async function run(spec, { shards, inject = [], ticks, ...opts }) {
  const c = new Cluster(spec, { shards, ...opts });
  await c.start();
  if (inject.length) await c.injectMany(inject);
  await c.tick(ticks);
  const stats = await c.stats();
  const snap = await c.snapshot();
  return { c, stats, snap };
}

// ---------------------------------------------------------------------------------
test('a 200 cell relay brain ends 30 ticks identically at 2 and at 4 shards', async () => {
  const spec = relaySpec({ cells: CELLS });
  const inject = relayInjections(CELLS);
  const b = reference(spec, inject, TICKS);
  // the brain has to be doing real work, or the comparison proves nothing
  assert.ok(b.stats.runs > 1000, 'reference runs ' + b.stats.runs);
  assert.ok(b.stats.grown > 0, 'reference grew ' + b.stats.grown + ' edges');

  const seen = [];
  for (const shards of [2, 4]) {
    const { c, stats, snap } = await run(spec, { shards, inject, ticks: TICKS });
    try {
      assert.equal(stats.t, TICKS);
      assert.equal(stats.runs, b.stats.runs, shards + ' shards: aggregate runs');
      assert.equal(stats.signals, b.stats.signals, shards + ' shards: aggregate signals');
      assert.equal(stats.delivered, b.stats.delivered, shards + ' shards: aggregate deliveries');
      assert.equal(stats.grown, b.stats.grown, shards + ' shards: edges grown');
      assert.equal(stats.edges, b.connectome.size(), shards + ' shards: connectome size');
      assert.ok(stats.crossMessages > 0, shards + ' shards: cross-shard messages ' + stats.crossMessages);
      // and cell by cell, which is the claim that matters
      const runs = [];
      for (let i = 0; i < CELLS; i++) {
        assert.equal(snap.cells[i].stats.runs, b.cells[i].stats.runs, shards + ' shards: runs of cell c' + i);
        assert.equal(snap.cells[i].stats.fired, b.cells[i].stats.fired, shards + ' shards: fires of cell c' + i);
        runs.push(snap.cells[i].stats.runs);
      }
      seen.push(runs.join(','));
      // the barrier ran exactly once per shard per tick
      assert.equal(stats.arrived, TICKS * shards);
    } finally { await c.stop(); }
  }
  assert.equal(seen[0], seen[1], '2 shards and 4 shards must agree with each other too');
});

// ---------------------------------------------------------------------------------
test('a cross-shard edge with delay 2 lands at t + 3, and delay 0 at t + 1', async () => {
  // a lives in one region, b and z in another, so the default partition puts them on
  // different shards and both edges out of a are messages.
  const spec = {
    name: 'delay', seed: 'delay', ledger: 'off', pruneEvery: 0, maxPayloadBytes: S.D, modules: [RELAY_MODULE],
    cells: [
      { id: 'a', kind: 'bench.relay', region: 'left', circuit: 'c', policy: { period: 'event' } },
      { id: 'slow', kind: 'bench.relay', region: 'right', circuit: 'c', policy: { period: 'event' } },
      { id: 'fast', kind: 'bench.relay', region: 'right', circuit: 'c', policy: { period: 'event' } },
    ],
    edges: [
      { src: 0, srcPort: 0, dst: 1, dstPort: 0, w: 1, delay: 2 },
      { src: 0, srcPort: 0, dst: 2, dstPort: 0, w: 1, delay: 0 },
    ],
  };
  const inject = [{ cell: 'a', port: 0, kind: 'hv', data: S.hvFromSeed('one') }];

  const c = new Cluster(spec, { shards: 2, partition: { left: 0, right: 1 } });
  await c.start();
  await c.injectMany(inject);
  try {
    // a fires at t = 0. Nothing else may run before the first message is due.
    await c.tick(1);
    let snap = await c.snapshot();
    assert.equal(snap.cells[0].stats.lastT, 0, 'a runs at t=0');
    assert.equal(snap.cells[2].stats.runs, 0, 'the delay 0 edge has not landed during t=0');
    assert.equal(snap.cells[1].stats.runs, 0);

    await c.tick(1); // t = 1
    snap = await c.snapshot();
    assert.equal(snap.cells[2].stats.runs, 1, 'delay 0 across shards lands at t + 1');
    assert.equal(snap.cells[2].stats.lastT, 1);
    assert.equal(snap.cells[1].stats.runs, 0, 'the delay 2 edge is still in flight at t=1');

    await c.tick(1); // t = 2
    snap = await c.snapshot();
    assert.equal(snap.cells[1].stats.runs, 0, 'still in flight at t=2');

    await c.tick(1); // t = 3
    snap = await c.snapshot();
    assert.equal(snap.cells[1].stats.runs, 1, 'delay 2 across shards lands at t + 3');
    assert.equal(snap.cells[1].stats.lastT, 3);

    // and that is exactly what one process does with the same wiring
    const b = reference(spec, inject, 4);
    assert.equal(b.cell('fast').stats.lastT, 1);
    assert.equal(b.cell('slow').stats.lastT, 3);
    const st = await c.stats();
    assert.equal(st.crossMessages, 2);
    assert.equal(st.runs, b.stats.runs);
  } finally { await c.stop(); }
});

// ---------------------------------------------------------------------------------
test('stop() terminates every worker and leaves no handle behind', async () => {
  const spec = relaySpec({ cells: 40 });
  const c = new Cluster(spec, { shards: 4 });
  await c.start();
  assert.equal(c.workers.length, 4);
  const threads = c.workers.map(w => w.threadId);
  assert.equal(new Set(threads).size, 4, 'four distinct threads');
  await c.injectMany(relayInjections(40));
  await c.tick(3);
  await c.stop();
  assert.equal(c.workers.length, 0, 'every worker terminated');
  assert.throws(() => c._need(), /stopped/);
  await c.stop(); // idempotent
  // The real assertion is that this process exits on its own once the tests finish.
  // A worker left running would keep the event loop alive and node --test would hang.
});

// ---------------------------------------------------------------------------------
test('a weak unused edge is pruned on both sides of the partition', async () => {
  // Nothing is injected, so neither edge is ever used: both go stale and both are weak.
  const spec = {
    name: 'prune', seed: 'prune', ledger: 'off', pruneEvery: 4, gate: { pruneStale: 4 },
    maxPayloadBytes: S.D, modules: [RELAY_MODULE],
    cells: [
      { id: 'a', kind: 'bench.relay', region: 'left', circuit: 'c', policy: { period: 'event' } },
      { id: 'far', kind: 'bench.relay', region: 'right', circuit: 'c', policy: { period: 'event' } },
      { id: 'near', kind: 'bench.relay', region: 'left', circuit: 'c', policy: { period: 'event' } },
    ],
    edges: [
      { src: 0, srcPort: 0, dst: 1, dstPort: 0, w: 0.01, delay: 0 }, // crosses the partition
      { src: 0, srcPort: 0, dst: 2, dstPort: 0, w: 0.01, delay: 0 }, // stays inside a shard
    ],
  };
  const b = reference(spec, [], 9);
  assert.equal(b.connectome.live(), 0, 'one process prunes both by t=8');

  const { c, stats } = await run(spec, { shards: 2, partition: { left: 0, right: 1 }, ticks: 9 });
  try {
    assert.equal(stats.crossEdges, 1);
    assert.equal(stats.inShardEdges, 1);
    assert.equal(stats.pruned, 1, 'the coordinator pruned the cross edge');
    assert.equal(stats.liveEdges, 0, 'and the shard reported its own prune back');
    assert.equal(stats.liveEdges, b.connectome.live());
  } finally { await c.stop(); }
});

// ---------------------------------------------------------------------------------
test('payload mode clone agrees with payload mode shared', async () => {
  const spec = relaySpec({ cells: 120 });
  const inject = relayInjections(120);
  const b = reference(spec, inject, 12);
  for (const payload of ['shared', 'clone']) {
    const { c, stats, snap } = await run(spec, { shards: 3, inject, ticks: 12, payload });
    try {
      assert.equal(stats.runs, b.stats.runs, payload + ': runs');
      assert.equal(stats.signals, b.stats.signals, payload + ': signals');
      assert.equal(stats.delivered, b.stats.delivered, payload + ': deliveries');
      for (let i = 0; i < 120; i++) assert.equal(snap.cells[i].stats.runs, b.cells[i].stats.runs, payload + ': cell c' + i);
      if (payload === 'clone') assert.ok(stats.cloned > 0, 'clone mode actually cloned: ' + stats.cloned);
      else assert.equal(stats.cloned, 0, 'shared mode used the arena for every payload');
    } finally { await c.stop(); }
  }
});
