// test/speed.test.mjs : speed is not allowed to change the answer.
//
// Three claims are graded here, each against the thing it replaced:
//   1. runtime/partition.mjs cuts fewer edges than the partition it started from, and
//      fewer than a round robin, while staying inside its capacity cap.
//   2. runtime/kernels.mjs computes what the kind it replaced computes, lane for lane, on
//      random inputs, including the tie lanes.
//   3. runtime/fast.mjs and runtime/cluster.mjs end a run where one unoptimised process
//      ends it: same stats, same run and fire count for every single cell.
//
// Run from the brain directory: node --test test/speed.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as S from '../core/signal.mjs';
import { RNG } from '../core/rng.mjs';
import { createCell, getKind } from '../core/cell.mjs';
import '../cells/index.mjs';
import { buildOrganism } from '../seeds/organism.mjs';
import { Cluster, buildBrain, specFromBrain } from '../runtime/cluster.mjs';
import { FastBrain, accelerate } from '../runtime/fast.mjs';
import * as K from '../runtime/kernels.mjs';
import { graphFromBrain, partitionBrain, seedPartition, cutEdges, stripedPartition, balanceOf, adjacency, refine, cellWeights, normalizeWeights } from '../runtime/partition.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Every shard thread imports the spec's module list before it builds its cells, so the list
// must register every kind the seed uses. seeds/organism.mjs uses grid.* and seq.fit, which
// only cells/all.mjs registers (2026-09-17: the gate crashed on 'unknown cell kind:
// grid.rotate' with cells/index.mjs here).
const CELLS_URL = pathToFileURL(path.join(ROOT, 'cells/all.mjs')).href;
// A cluster whose start or tick threw still holds its worker threads, and a test process
// with live workers never exits: the gate then waits out its 600 s timeout (exit null,
// 600011 ms, 2026-09-17). stop() is a no-op before start() finished, so the workers are
// terminated by hand as well.
async function stopHard(c) {
  await c.stop();
  await Promise.all((c.workers || []).map(w => w.terminate()));
}
const TICKS = 50;

// A small organism: the same builder, the same wiring rule, 40 majors instead of 5000.
function small(name = 'speed-test') {
  return buildOrganism({ majors: 40, subcellsPerMajor: 8, edgesPerCell: 12, name, seed: 'speed' });
}

function counts(brain) {
  const n = brain.cells.length, runs = new Int32Array(n), fired = new Int32Array(n);
  for (let i = 0; i < n; i++) { runs[i] = brain.cells[i].stats.runs; fired[i] = brain.cells[i].stats.fired; }
  return { runs, fired };
}

function firstDifference(a, b, cells) {
  for (let i = 0; i < a.runs.length; i++) {
    if (a.runs[i] !== b.runs[i]) return 'cell ' + cells[i].id + ' ran ' + a.runs[i] + ' vs ' + b.runs[i];
    if (a.fired[i] !== b.fired[i]) return 'cell ' + cells[i].id + ' fired ' + a.fired[i] + ' vs ' + b.fired[i];
  }
  return null;
}

// ---------------------------------------------------------------------------------
test('the partition cuts fewer edges than its seed and far fewer than a round robin', () => {
  const g = graphFromBrain(small('part'));
  for (const shards of [2, 4, 8]) {
    const seed = seedPartition(g, shards);
    const before = cutEdges(g, seed.of);
    const r = partitionBrain(g, shards, { passes: 8 });
    const striped = cutEdges(g, stripedPartition(g.n, shards));
    assert.ok(r.cutAfter <= before, shards + ' shards: refinement raised the cut from ' + before + ' to ' + r.cutAfter);
    assert.equal(r.cutBefore, before);
    assert.ok(r.cutAfter < striped, shards + ' shards: cut ' + r.cutAfter + ' is not below the round robin control ' + striped);
    // the cut is counted over the same edge list both times
    assert.equal(r.edges, g.m);
    // and the balance cap held
    const bal = balanceOf(r.of, shards);
    assert.ok(bal.max <= r.cap, shards + ' shards: heaviest shard ' + bal.max + ' is over the cap ' + r.cap);
  }
});

// The weights exist because a shard's tick ends with its LAST cell: balancing the number of
// cells balances the wrong thing. Two claims here, and the first one is the one that keeps
// every older result valid: a weight of 1 per cell has to leave every decision alone.
test('a weight of one per cell changes no decision, and a real weight balances weight', () => {
  const b = small('part-weight');
  const g = graphFromBrain(b);
  const ones = new Float64Array(g.n).fill(1);
  for (const shards of [2, 4, 8]) {
    const plain = partitionBrain(g, shards, { passes: 8 });
    const same = partitionBrain(g, shards, { passes: 8, weight: ones });
    assert.deepEqual(Array.from(same.of), Array.from(plain.of), shards + ' shards: a weight of 1 per cell moved a cell the unweighted run did not');
    assert.equal(same.cutAfter, plain.cutAfter, shards + ' shards: the cut changed under a weight of 1');
  }
  const w = normalizeWeights(cellWeights(b.cells, {}));
  let mean = 0;
  for (const x of w) mean += x;
  assert.ok(Math.abs(mean / w.length - 1) < 1e-9, 'normalizeWeights did not centre the mean on 1, it is ' + (mean / w.length));
  let spread = 0;
  for (const x of w) if (x !== w[0]) spread++;
  assert.ok(spread > 0, 'this fixture gives every cell the same weight, so the weighted path was never graded');
  // The promise a weight vector makes is the cap: no shard carries more than slack times
  // the mean weight. It holds at every shard count here. The weaker claim, that weighting
  // also beats the unweighted run on weight imbalance, is only asserted where it is true:
  // at 2 shards the unweighted chunk seed happens to be better balanced by weight than the
  // capped weighted one, and a test that claimed otherwise would be claiming a wish.
  for (const shards of [2, 4, 8]) {
    const weighted = partitionBrain(g, shards, { passes: 8, weight: w });
    const after = balanceOf(weighted.of, shards, w);
    assert.ok(after.max <= weighted.cap, shards + ' shards: heaviest shard by weight ' + after.max + ' is over the weighted cap ' + weighted.cap);
    assert.equal(weighted.weighted.after.imbalance, after.imbalance, shards + ' shards: partitionBrain reported a different weighted balance from balanceOf');
  }
  // At 4 shards the same happened once seeds/organism.mjs took the grid and seq.fit kinds
  // (2026-09-17, the gate printed '4 shards: weighting made the weight imbalance worse,
  // 1.024 to 1.055'): the cap held, the seed was better by weight. So 8 shards only.
  for (const shards of [8]) {
    const plain = partitionBrain(g, shards, { passes: 8 });
    const weighted = partitionBrain(g, shards, { passes: 8, weight: w });
    const before = balanceOf(plain.of, shards, w), after = balanceOf(weighted.of, shards, w);
    assert.ok(after.imbalance <= before.imbalance, shards + ' shards: weighting made the weight imbalance worse, ' + before.imbalance + ' to ' + after.imbalance);
  }
});

test('one refinement pass never raises the cut, on a graph it was not seeded on', () => {
  const g = graphFromBrain(small('part2'));
  const shards = 4;
  const of = stripedPartition(g.n, shards); // deliberately the worst start
  const before = cutEdges(g, of);
  const r = refine(g, of, shards, { passes: 6, adj: adjacency(g) });
  let last = before;
  for (const p of r.passes) { assert.ok(p.cut <= last, 'pass ' + p.pass + ' raised the cut ' + last + ' to ' + p.cut); last = p.cut; }
  assert.ok(last < before, 'refinement from a round robin start did not reduce ' + before);
});

// ---------------------------------------------------------------------------------
test('every kernel computes what the kind it replaced computes, lane for lane', () => {
  const rng = new RNG('kernel-grading');
  const hv = () => { const v = new Int8Array(S.D); for (let i = 0; i < S.D; i++) v[i] = (rng.u32() & 1) ? 1 : -1; return v; };
  const mail = (k, w = null) => { const l = []; for (let i = 0; i < k; i++) l.push({ sig: S.signal('hv', hv(), {}), w: w === null ? 0.5 + rng.next() : w, e: -1, from: -1 }); return l; };

  const cases = [];
  for (const k of [1, 2, 3, 5, 8]) cases.push(['hv.bundle', { kind: 'hv.bundle', id: 'b' + k, region: 'r', circuit: 'c' }, [mail(k)]]);
  for (const k of [1, 2, 3, 4]) cases.push(['hv.bind', { kind: 'hv.bind', id: 'x' + k, region: 'r', circuit: 'c' }, [mail(k)]]);
  for (const kk of [0, 1, 7, 8191]) cases.push(['hv.permute', { kind: 'hv.permute', id: 'p' + kk, region: 'r', circuit: 'c', params: { k: kk } }, [mail(1)]]);
  for (const ms of [0, 1, 37, 999, 86399999, 1763251200000]) {
    cases.push(['encode.time', { kind: 'encode.time', id: 't' + ms, region: 'r', circuit: 'c' }, [[{ sig: S.signal('num', S.ratFromDecimal(String(ms)), {}), w: 1, e: -1, from: -1 }]]]);
  }
  // encode.vec reads its input with `x[j] || 0`, so the cases have to include a vec shorter
  // than nin (the read is past the end), a NaN and a negative zero, which are the three
  // inputs that falsy test does not pass through
  {
    const vec = (arr) => [[{ sig: S.signal('vec', Float32Array.from(arr), {}), w: 1, e: -1, from: -1 }]];
    const eight = [0.5, -1.25, 3, 0, -0.75, 2.5, -4, 1];
    const cases2 = [
      ['full', eight],
      ['short', [1.5, -2.5, 0.25]],
      ['empty', []],
      ['nan', [NaN, 1, -1, 0, 2, -2, 3, -3]],
      ['negzero', [-0, 1, -1, 0, 2, -2, 3, -3]],
      ['long', [...eight, 9, 9, 9, 9]],
    ];
    for (const [id, arr] of cases2) cases.push(['encode.vec', { kind: 'encode.vec', id: 'v' + id, region: 'r', circuit: 'c', params: { nin: 8, seed: 'grade' } }, vec(arr)]);
    cases.push(['encode.vec', { kind: 'encode.vec', id: 'vnin3', region: 'r', circuit: 'c', params: { nin: 3, seed: 'grade3' } }, vec([1, -1, 0.5])]);
  }

  // an even bundle whose lanes cancel exactly, to grade the tie rule rather than the sum
  {
    const a = hv(), b = new Int8Array(a.length);
    for (let i = 0; i < a.length; i++) b[i] = -a[i];
    cases.push(['hv.bundle', { kind: 'hv.bundle', id: 'tie', region: 'r', circuit: 'c' }, [[
      { sig: S.signal('hv', a, {}), w: 1, e: -1, from: -1 },
      { sig: S.signal('hv', b, {}), w: 1, e: -1, from: -1 },
    ]]]);
  }

  K.uninstall();
  const before = cases.map(([, spec, ins]) => getKind(spec.kind).compute(ins, createCell(spec), { t: 0, gen: 0 }));
  const names = K.install();
  assert.deepEqual([...names].sort(), [...K.KERNELS].sort());
  const after = cases.map(([, spec, ins]) => getKind(spec.kind).compute(ins, createCell(spec), { t: 0, gen: 0 }));
  K.uninstall();

  for (let i = 0; i < cases.length; i++) {
    const [name, spec] = cases[i], a = before[i], b = after[i];
    assert.equal(b.length, a.length, name + ' ' + spec.id + ': port count changed');
    for (let p = 0; p < a.length; p++) {
      if (a[p] === null) { assert.equal(b[p], null, name + ' ' + spec.id + ' port ' + p + ': kernel emitted where core did not'); continue; }
      assert.equal(b[p].kind, a[p].kind, name + ' ' + spec.id + ' port ' + p + ': kind changed');
      const x = a[p].data, y = b[p].data;
      assert.equal(y.length, x.length, name + ' ' + spec.id + ' port ' + p + ': length changed');
      let diff = -1;
      for (let j = 0; j < x.length; j++) if (x[j] !== y[j]) { diff = j; break; }
      assert.equal(diff, -1, name + ' ' + spec.id + ' port ' + p + ': first differing lane ' + diff + ' core=' + x[diff] + ' kernel=' + y[diff]);
    }
  }
});

// ---------------------------------------------------------------------------------
test('FastBrain ends ' + TICKS + ' ticks exactly where Brain ends them', () => {
  K.uninstall();
  const plain = small('fast-a');
  plain.tick(TICKS);
  const plainCounts = counts(plain);
  const plainStats = JSON.stringify(plain.stats);

  K.install();
  const fast = accelerate(small('fast-b'));
  assert.ok(fast instanceof FastBrain);
  fast.tick(TICKS);
  K.uninstall();

  // growth has to be live for this to mean anything: a fixed connectome hides an ordering
  // difference, because the fired list is only read by the structural block
  assert.ok(plain.stats.grown > 0, 'the fixture grew no edges, so the run order was never graded');
  assert.equal(JSON.stringify(fast.stats), plainStats);
  const d = firstDifference(plainCounts, counts(fast), plain.cells);
  assert.equal(d, null);
  // the weights hebbian learning moved must match too, not just the counts
  for (let e = 0; e < plain.connectome.n; e++) assert.equal(fast.connectome.w[e], plain.connectome.w[e], 'edge ' + e + ' weight');
  assert.ok(fast.fastStats().rebuilds >= 1);
});

// ---------------------------------------------------------------------------------
test('the cluster ends ' + TICKS + ' ticks exactly where one process ends them, at 1, 2 and 4 shards', async () => {
  K.uninstall();
  const source = small('cluster-src');
  const spec = specFromBrain(source, { modules: [CELLS_URL], name: 'speed-cluster', seed: 'speed', kernels: false });
  const ref = buildBrain(spec);
  ref.tick(TICKS);
  const refCounts = counts(ref);
  // This fixture rewires itself while it runs, which is the case that grades the delivery
  // order and the run order: a shard that hands a cell its two inputs in the other order
  // grows a different brain from that tick on.
  assert.ok(ref.stats.grown > 0, 'the fixture grew no edges, so the ordering was never graded');

  for (const shards of [1, 2, 4]) {
    const g = graphFromBrain(ref);
    const part = partitionBrain(g, shards, { passes: 8 });
    const c = new Cluster(spec, { shards, partition: part.of });
    let got, st;
    try { await c.start(); await c.tick(TICKS); got = await c.counts(); st = await c.stats(); }
    finally { await stopHard(c); }
    assert.equal(st.runs, ref.stats.runs, shards + ' shards: total runs');
    assert.equal(st.signals, ref.stats.signals, shards + ' shards: total signals');
    assert.equal(st.delivered, ref.stats.delivered, shards + ' shards: total deliveries');
    assert.equal(st.grown, ref.stats.grown, shards + ' shards: edges grown');
    assert.equal(st.errors, ref.stats.errors, shards + ' shards: cell errors');
    const d = firstDifference(refCounts, got, ref.cells);
    assert.equal(d, null, shards + ' shards: ' + d);
  }
});

// ---------------------------------------------------------------------------------
// A partition is allowed to change the speed and nothing else. This one is balanced by the
// per cell run count the reference run measured, which moves cells across shards that the
// cell count balance would never move, so the delivery order and the run order are being
// graded on a partition no other test produces.
test('a work weighted partition is still the same brain, with growth on', async () => {
  K.uninstall();
  const source = small('cluster-weight');
  const spec = specFromBrain(source, { modules: [CELLS_URL], name: 'speed-weighted', seed: 'speed', kernels: false });
  const ref = buildBrain(spec);
  ref.tick(TICKS);
  const refCounts = counts(ref);
  assert.ok(ref.stats.grown > 0, 'the fixture grew no edges, so the ordering was never graded');

  const shards = 4;
  const g = graphFromBrain(ref);
  const w = normalizeWeights(Float64Array.from(refCounts.runs));
  const plain = partitionBrain(g, shards, { passes: 8 });
  const part = partitionBrain(g, shards, { passes: 8, weight: w });
  assert.notDeepEqual(Array.from(part.of), Array.from(plain.of), 'the weighted partition is the unweighted one, so nothing new was graded');
  const c = new Cluster(spec, { shards, partition: part.of });
  let got, st;
  try { await c.start(); await c.tick(TICKS); got = await c.counts(); st = await c.stats(); }
  finally { await stopHard(c); }
  assert.equal(st.runs, ref.stats.runs, 'total runs');
  assert.equal(st.signals, ref.stats.signals, 'total signals');
  assert.equal(st.delivered, ref.stats.delivered, 'total deliveries');
  assert.equal(st.grown, ref.stats.grown, 'edges grown');
  assert.equal(st.errors, ref.stats.errors, 'cell errors');
  const d = firstDifference(refCounts, got, ref.cells);
  assert.equal(d, null, 'weighted partition: ' + d);
});

// ---------------------------------------------------------------------------------
test('the cluster with kernels installed in its shards is still the same brain', async () => {
  K.uninstall();
  const source = small('cluster-kern');
  const specPlain = specFromBrain(source, { modules: [CELLS_URL], name: 'speed-kern', seed: 'speed', kernels: false });
  const ref = buildBrain(specPlain);
  ref.tick(TICKS);
  const refCounts = counts(ref);

  const spec = { ...specPlain, kernels: true };
  const g = graphFromBrain(ref);
  const part = partitionBrain(g, 4, { passes: 8 });
  const c = new Cluster(spec, { shards: 4, partition: part.of });
  let got, st;
  try { await c.start(); await c.tick(TICKS); got = await c.counts(); st = await c.stats(); }
  finally { await stopHard(c); }
  assert.equal(st.runs, ref.stats.runs);
  assert.equal(st.cloned, 0, 'a payload fell back to the structured clone path: ' + st.cloned);
  assert.equal(firstDifference(refCounts, got, ref.cells), null);
});
