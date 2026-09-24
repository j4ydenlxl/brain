// test/substrate.test.mjs: the dense substrate. Determinism, connectivity, unique params,
// arrival timing (delay d arrives at t + 1 + d), the Brain cell kind ticking and emitting,
// and wasm agreeing with the JS reference bit for bit.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Substrate, KINDS, KIND, REGIONS, NEVER, K_PARAMS, layoutFor } from '../core/substrate.mjs';
import { Brain } from '../core/brain.mjs';
import '../cells/basic.mjs';

test('twenty kinds, each with a distinct name, cost and plain-English function', () => {
  assert.ok(KINDS.length >= 16, KINDS.length + ' kinds');
  assert.equal(new Set(KINDS.map(k => k.name)).size, KINDS.length);
  for (const k of KINDS) { assert.ok(k.cost > 0 && k.cost <= 1); assert.ok(k.function.length > 20, k.name); }
  assert.equal(REGIONS.length, 8);
});

test('no per-unit objects: every field is a typed view on one buffer of the size the layout declares', () => {
  const s = new Substrate({ units: 1000, seed: 'views' });
  const L = layoutFor(1000, 8, 7);
  assert.equal(s.buffer.byteLength >= L.bytes, true);
  for (const name of ['ring', 'params', 'state', 'capability', 'lastFired', 'fireCount', 'out', 'inDeg', 'rowPtr', 'col', 'weight', 'delay', 'kind', 'region']) {
    assert.ok(ArrayBuffer.isView(s[name]), name + ' is a typed array');
    assert.equal(s[name].buffer, s.buffer, name + ' shares the buffer');
  }
});

test('determinism: same seed gives the same fireCount vector, a different seed does not', () => {
  const a = new Substrate({ units: 20000, seed: 'det', backend: 'js' });
  const b = new Substrate({ units: 20000, seed: 'det', backend: 'js' });
  const c = new Substrate({ units: 20000, seed: 'det2', backend: 'js' });
  a.tick(60); b.tick(60); c.tick(60);
  assert.deepEqual(a.fireCount, b.fireCount);
  assert.deepEqual(a.state, b.state);
  assert.ok(a.totalFired > 0, 'something fired: ' + a.totalFired);
  let diff = 0; for (let i = 0; i < a.units; i++) if (a.fireCount[i] !== c.fireCount[i]) diff++;
  assert.ok(diff > 1000, 'different seed differs in ' + diff + ' units');
});

test('all connected: one weakly connected component, every unit reachable, and no self edge', () => {
  const s = new Substrate({ units: 30000, seed: 'conn' });
  assert.equal(s.components(), 1);
  for (let i = 0; i < s.units; i++) {
    assert.equal(s.rowPtr[i + 1] - s.rowPtr[i], 8);
    for (let e = s.rowPtr[i]; e < s.rowPtr[i + 1]; e++) { assert.notEqual(s.col[e], i, 'unit ' + i + ' self edge'); assert.ok(s.col[e] < s.units); }
    assert.ok(s.inDeg[i] >= 1, 'unit ' + i + ' has an in edge (the ring)');
  }
  // the census itself: every edge is counted exactly once, so the in degrees sum to E
  let inSum = 0; for (let i = 0; i < s.units; i++) inSum += s.inDeg[i];
  assert.equal(inSum, s.layout.E, 'in-degree census counts every edge: ' + inSum + ' of ' + s.layout.E);
  // the ring edge is the first edge of every unit
  for (let i = 0; i < s.units; i++) assert.equal(s.col[s.rowPtr[i]], (i + 1) % s.units);
});

test('unique params: no two units share a parameter vector, and the signature is a bijection', () => {
  const s = new Substrate({ units: 50000, seed: 'uniq' });
  const seen = new Set();
  for (let i = 0; i < s.units; i++) {
    const p = i * K_PARAMS;
    const key = s.params[p] + '|' + s.params[p + 1] + '|' + s.params[p + 2] + '|' + s.params[p + 3];
    assert.equal(seen.has(key), false, 'unit ' + i + ' repeats a param vector');
    seen.add(key);
  }
  assert.equal(seen.size, s.units);
  assert.equal(s.duplicateSignatures(), 0);
  // A count of duplicates cannot see a collapsed bijection until the population reaches
  // 2^24, so the construction is checked directly on the raw 24 bit signatures: an odd
  // multiplier makes consecutive indices alternate parity, and a full 24 bit mask makes
  // the values reach the top half of the range. Drop either and this test goes red while
  // duplicateSignatures() is still 0.
  let evenSig = 0, oddSig = 0, maxSig = 0;
  for (let i = 0; i < s.units; i++) {
    const k = Math.round(s.params[i * K_PARAMS + 3] * 16777216);
    if (k % 2) oddSig++; else evenSig++;
    if (k > maxSig) maxSig = k;
  }
  assert.ok(evenSig > 0 && oddSig > 0, 'signatures take both parities (odd multiplier): ' + evenSig + ' even, ' + oddSig + ' odd');
  assert.ok(maxSig > 8388608, 'signatures reach the top half of the 24 bit range: max ' + maxSig);
  // capability varies while every unit is the same size
  let lo = 1, hi = 0; for (let i = 0; i < s.units; i++) { lo = Math.min(lo, s.capability[i]); hi = Math.max(hi, s.capability[i]); }
  assert.ok(hi - lo > 0.3, 'capability spans ' + lo.toFixed(3) + '..' + hi.toFixed(3));
  const counts = new Array(KINDS.length).fill(0); for (let i = 0; i < s.units; i++) counts[s.kind[i]]++;
  assert.ok(counts.every(c => c > 0), 'every kind is present: ' + counts.join(','));
});

test('arrival timing: delay d written at tick t is read at t + 1 + d, for every d in the ring', () => {
  for (const d of [0, 1, 2, 5, 7]) {
    const s = new Substrate({ units: 4, seed: 'arrive', edgesPerUnit: 1, maxDelay: 7, backend: 'js' });
    // unit 0: threshold kind, fires amplitude 1 when input >= 0.5; its one edge goes to unit 1 with delay d
    s.kind.fill(KIND.threshold); s.state.fill(0);
    for (let i = 0; i < 4; i++) { s.params[i * K_PARAMS] = 0.5; s.params[i * K_PARAMS + 2] = 1; }
    s.col[0] = 1; s.weight[0] = 1; s.delay[0] = d;
    s.col[1] = 2; s.weight[1] = 0; s.col[2] = 3; s.weight[2] = 0; s.col[3] = 0; s.weight[3] = 0;
    const t0 = 3;
    s.tick(t0);
    assert.equal(s.lastFired[0], NEVER); assert.equal(s.lastFired[1], NEVER);
    s.inject(0, Float32Array.from([1]));
    s.tick(1);
    assert.equal(s.lastFired[0], t0, 'unit 0 fires on the tick it is injected into');
    for (let t = t0 + 1; t < t0 + 1 + d; t++) { s.tick(1); assert.equal(s.lastFired[1], NEVER, 'd=' + d + ': nothing at t=' + t); }
    s.tick(1);
    assert.equal(s.lastFired[1], t0 + 1 + d, 'd=' + d + ': arrival at t + 1 + d');
    assert.equal(s.fireCount[1], 1);
  }
});

test('the router kind forwards to the first half of its edges when positive and the second half when negative', () => {
  const s = new Substrate({ units: 5, seed: 'route', edgesPerUnit: 4, maxDelay: 0, backend: 'js' });
  s.kind.fill(KIND.comparator); s.kind[0] = KIND.router; s.state.fill(0);
  for (let i = 0; i < 5; i++) { s.params[i * K_PARAMS] = 0.1; s.params[i * K_PARAMS + 2] = 1; }
  for (let k = 0; k < 4; k++) { s.col[k] = 1 + k; s.weight[k] = 1; s.delay[k] = 0; }
  for (let e = 4; e < 20; e++) s.weight[e] = 0;
  s.inject(0, Float32Array.from([1])); s.tick(2);
  assert.deepEqual([...s.fireCount.subarray(1)], [1, 1, 0, 0]);
  s.inject(0, Float32Array.from([-1])); s.tick(2);
  assert.deepEqual([...s.fireCount.subarray(1)], [1, 1, 1, 1]);
});

test('unit(id) and snapshot() expose everything the clickable brain needs', () => {
  const s = new Substrate({ units: 2048, seed: 'view' });
  s.tick(30);
  const u = s.unit(77);
  for (const k of ['id', 'kind', 'kindName', 'function', 'region', 'regionName', 'capability', 'params', 'state', 'fireCount', 'lastFired', 'outEdges', 'inDegree']) assert.ok(k in u, k);
  assert.equal(u.kindName, KINDS[u.kind].name);
  assert.equal(u.outEdges.length, 8);
  assert.ok(u.outEdges.every(e => e.to < s.units && Number.isFinite(e.weight) && e.delay <= 7));
  const snap = s.snapshot(100, 110, { edges: 3 });
  assert.equal(snap.units.length, 10); assert.equal(snap.units[0].id, 100); assert.equal(snap.units[0].outEdges.length, 3);
  assert.doesNotThrow(() => JSON.stringify(snap));
  // the guard's own error, not any error: without the pattern this passes on the
  // TypeError thrown later by reading past the end of the kind array
  assert.throws(() => s.unit(5000), /Substrate\.unit: no unit 5000/);
});

test('the boundary is inclusive: at exactly its threshold, integrate.fire and threshold fire', () => {
  for (const name of ['integrate.fire', 'threshold']) {
    const s = new Substrate({ units: 4, seed: 'edge', edgesPerUnit: 1, maxDelay: 0, backend: 'js' });
    s.kind.fill(KIND[name]); s.state.fill(0);
    for (let i = 0; i < 4; i++) { s.params[i * K_PARAMS] = 0.5; s.params[i * K_PARAMS + 2] = 1; }
    for (let e = 0; e < 4; e++) s.weight[e] = 0;
    s.inject(0, Float32Array.from([0.5]));   // exactly the threshold, exact in f32
    s.tick(1);
    assert.equal(s.fireCount[0], 1, name + ' fires at exactly its threshold');
    assert.equal(s.out[0], 1, name + ' emits its amplitude at the threshold');
    assert.equal(s.fireCount[1], 0, name + ' does not fire on no input');
  }
});

test('the burst event is edge triggered: staying above the line emits once, not once per tick', () => {
  const b = new Brain({ name: 'burst', ledger: 'off', growth: { enabled: false } });
  // threshold 0: the firing fraction is at or above it on every single tick, so a level
  // trigger would emit ten events and a crossing trigger emits exactly one
  b.addCell({ id: 'S', kind: 'substrate', region: 'cortex', params: { units: 1024, seed: 'burst', threshold: 0 } });
  b.addCell({ id: 'log', kind: 'sink.log', region: 'cortex' });
  b.connect('S', 'event', 'log', 'in');
  b.tick(10);
  assert.equal(b.cell('S').state.sub.t, 10);
  assert.equal(b.cell('S').state.bursts, 1, 'one upward crossing in ten ticks that are all above');
  assert.equal(b.cell('log').memory.working.filter(w => w.kind === 'event').length, 1);
});

test('wasm kernel equals the JS reference: identical fireCount, state and outputs after 100 ticks', (t) => {
  const js = new Substrate({ units: 40000, seed: 'twin', backend: 'js' });
  const wasm = new Substrate({ units: 40000, seed: 'twin', backend: 'auto' });
  if (!wasm.wasmReady) { t.diagnostic('wasm unavailable: ' + wasm.wasmReason); return; }
  assert.equal(wasm.backend, 'wasm');
  const fj = [], fw = [];
  for (let k = 0; k < 100; k++) { fj.push(js.tick()); fw.push(wasm.tick()); }
  assert.deepEqual(fw, fj, 'fired per tick');
  assert.deepEqual(wasm.fireCount, js.fireCount);
  assert.deepEqual(wasm.state, js.state);
  assert.deepEqual(wasm.out, js.out);
  assert.deepEqual(wasm.lastFired, js.lastFired);
  assert.ok(js.totalFired > 10000, 'activity: ' + js.totalFired);
  // switching a live substrate between backends continues the same trajectory
  wasm.useBackend('js'); wasm.tick(10); js.tick(10);
  assert.deepEqual(wasm.fireCount, js.fireCount);
});

test('wasm equals the JS reference WITH THE INPUT CLAMP BINDING: free running never reaches it', (t) => {
  const js = new Substrate({ units: 4096, seed: 'clamp', backend: 'js' });
  const wasm = new Substrate({ units: 4096, seed: 'clamp', backend: 'auto' });
  if (!wasm.wasmReady) { t.diagnostic('wasm unavailable: ' + wasm.wasmReason); return; }
  const big = new Float32Array(256).fill(500);   // far past the +/- 64 clamp both backends apply
  let clamped = 0;
  for (let k = 0; k < 30; k++) {
    js.inject(0, big); wasm.inject(0, big);
    for (let i = 0; i < 256; i++) if (Math.abs(js.ring[(js.t % js.layout.R) * js.units + i]) > 64) clamped++;
    js.tick(); wasm.tick();
  }
  assert.ok(clamped > 0, 'the clamp actually bound on ' + clamped + ' unit-ticks');
  assert.deepEqual(wasm.fireCount, js.fireCount, 'fireCount under a saturating input');
  assert.deepEqual(wasm.state, js.state, 'state under a saturating input');
  assert.deepEqual(wasm.out, js.out, 'out under a saturating input');
  console.log('clamp twin: ' + clamped + ' unit-ticks past the clamp, ' + js.totalFired + ' fired, backends identical');
});

test('Brain attachment: the substrate cell ticks, reads a slice out, injects a slice in, and emits on a burst', () => {
  const b = new Brain({ name: 'sub', ledger: 'off', growth: { enabled: false } });
  b.addCell({ id: 'S', kind: 'substrate', region: 'cortex', params: { units: 8192, seed: 'brain', inLo: 0, inLen: 16, outLo: 0, outLen: 32, threshold: 0.01 } });
  b.addCell({ id: 'log', kind: 'sink.log', region: 'cortex' });
  b.connect('S', 'out', 'log', 'in');
  b.connect('S', 'event', 'log', 'in');
  const sub = b.cell('S').state.sub;
  b.tick(40);
  assert.equal(sub.t, 40);
  const outs = b.cell('log').memory.working;
  assert.ok(outs.some(w => w.kind === 'vec'), 'vec outputs reached the sink');
  assert.ok(outs.some(w => w.kind === 'event'), 'a burst event reached the sink');
  assert.equal(b.cell('S').state.bursts >= 1, true);
  // injecting into the in slice changes the units it names on the very next tick
  const before = sub.fireCount.slice(0, 16);
  b.inject('S', 'in', { kind: 'vec', data: new Float32Array(16).fill(50) });
  b.tick(1);
  let changed = 0; for (let i = 0; i < 16; i++) if (sub.fireCount[i] !== before[i]) changed++;
  assert.ok(changed >= 8, changed + ' of the 16 injected units fired');
  const insp = b.inspect('S');
  assert.equal(insp.state.dynamic.t, 41);
  assert.equal(b.stats.errors, 0);
});

test('snapshot and restore of the substrate cell carry the dynamic arrays', () => {
  const a = new Substrate({ units: 3000, seed: 'persist' });
  a.tick(25);
  const j = a.serializeDynamic();
  const b = new Substrate({ units: 3000, seed: 'persist' }).restoreDynamic(JSON.parse(JSON.stringify(j)));
  a.tick(10); b.tick(10);
  assert.deepEqual(b.fireCount, a.fireCount);
  assert.equal(b.t, 35);
});
