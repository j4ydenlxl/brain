// test/simd.test.mjs: the 16-lane kernels are graded lane for lane against the scalar
// loops on random inputs, including even-count bundles where every tie position must match.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as SIMD from '../core/simd.mjs';
import * as S from '../core/signal.mjs';
import { RNG } from '../core/rng.mjs';

test('wasm simd module instantiates on this node', () => {
  assert.equal(SIMD.available, true, SIMD.unavailableReason);
  assert.ok(SIMD.moduleBytes.length < 2000, 'module is ' + SIMD.moduleBytes.length + ' bytes');
});

test('bind, sim, hamming match the scalar reference on 200 random pairs at several widths', () => {
  const rng = new RNG('simd:bind');
  let checked = 0;
  for (const d of [16, 64, 1024, 8192]) for (let trial = 0; trial < 50; trial++) {
    const a = S.hvRandom(rng, d), b = S.hvRandom(rng, d);
    assert.deepEqual(S.bind(a, b), S.scalar.bind(a, b));
    assert.equal(S.sim(a, b), S.scalar.sim(a, b));
    assert.equal(S.hamming(a, b), S.scalar.hamming(a, b));
    assert.equal(S.sim(a, a), 1); assert.equal(S.hamming(a, a), 0);
    checked++;
  }
  assert.equal(checked, 200);
});

test('sim and hamming stay exact when lanes hold zeros (dot kernel, not the equality trick)', () => {
  const rng = new RNG('simd:zero');
  const a = S.hvRandom(rng, 256), b = S.hvRandom(rng, 256);
  for (let i = 0; i < 256; i += 3) a[i] = 0;
  assert.equal(S.sim(a, b), S.scalar.sim(a, b));
  assert.equal(S.hamming(a, b), S.scalar.hamming(a, b));
  assert.deepEqual(S.bind(a, b), S.scalar.bind(a, b), 'zero lanes fall back to the scalar bind');
});

test('bundle matches the scalar reference for odd and even member counts, ties included', () => {
  const rng = new RNG('simd:bundle');
  let ties = 0;
  for (const d of [16, 128, 8192]) for (const count of [1, 2, 3, 4, 7, 8, 16, 33, 127]) {
    const list = Array.from({ length: count }, () => S.hvRandom(rng, d));
    const got = S.bundle(list), want = S.scalar.bundle(list);
    assert.deepEqual(got, want, 'd=' + d + ' count=' + count);
    if (count % 2 === 0) { const acc = new Int32Array(d); for (const v of list) for (let i = 0; i < d; i++) acc[i] += v[i]; for (let i = 0; i < d; i++) if (acc[i] === 0) ties++; }
  }
  assert.ok(ties > 1000, 'even bundles produced ' + ties + ' tie lanes to grade');
});

test('128 or more members and non-lane widths take the scalar path and still agree', () => {
  const rng = new RNG('simd:big');
  const big = Array.from({ length: 130 }, () => S.hvRandom(rng, 64));
  assert.deepEqual(S.bundle(big), S.scalar.bundle(big));
  const odd = [S.hvRandom(rng, 40), S.hvRandom(rng, 40), S.hvRandom(rng, 40)];
  assert.deepEqual(S.bundle(odd), S.scalar.bundle(odd));
  assert.deepEqual(S.bind(odd[0], odd[1]), S.scalar.bind(odd[0], odd[1]));
});

test('kernels are faster than scalar at D=8192 (printed, and at least 3x on bundle)', () => {
  const rng = new RNG('simd:speed');
  const vs = Array.from({ length: 8 }, () => S.hvRandom(rng, 8192));
  const time = (fn, n = 400) => { for (let i = 0; i < 50; i++) fn(); const t0 = process.hrtime.bigint(); for (let i = 0; i < n; i++) fn(); return Number(process.hrtime.bigint() - t0) / 1e3 / n; };
  const r = { bundleScalarUs: time(() => S.scalar.bundle(vs)), bundleSimdUs: time(() => S.bundle(vs)), bindScalarUs: time(() => S.scalar.bind(vs[0], vs[1])), bindSimdUs: time(() => S.bind(vs[0], vs[1])), simScalarUs: time(() => S.scalar.sim(vs[0], vs[1])), simSimdUs: time(() => S.sim(vs[0], vs[1])) };
  console.log('simd speed', Object.entries(r).map(([k, v]) => k + '=' + v.toFixed(2)).join(' '));
  assert.ok(r.bundleScalarUs / r.bundleSimdUs >= 3, 'bundle speedup ' + (r.bundleScalarUs / r.bundleSimdUs).toFixed(2) + 'x');
});

test('hpack: the packed hamming kernel and the arena scan agree with the scalar reference, through growth, holes and ties', () => {
  const rng = new RNG('arena');
  const n = 8192;
  const items = Array.from({ length: 300 }, () => S.hvRandom(rng, n));
  const a = new SIMD.Arena(n, 4); // starts with four slots and grows
  items.forEach((v, i) => a.set(i, v));
  assert.equal(a.count, 300);
  const q = S.hvRandom(rng, n);
  const dots = a.dots(q, new Float64Array(300));
  for (let i = 0; i < 300; i++) assert.equal(dots[i], S.scalar.sim(items[i], q) * n, 'dot at slot ' + i);
  // an exact copy of an item scores the full dot, and among equals the lower slot wins
  a.set(300, items[7]); a.set(301, items[7]);
  assert.deepEqual(a.best(items[7]), [7, n]);
  // the last slot moves into a hole: the hole takes its content and the moved-from slot is gone
  const w = S.hvRandom(rng, n);
  a.set(301, w); a.move(301, 7); a.truncate(301);
  assert.equal(a.count, 301);
  assert.deepEqual(a.best(w), [7, n]);
  assert.deepEqual(a.best(items[7]), [300, n]);
  assert.equal(a.dots(q, new Float64Array(301))[7], S.scalar.sim(w, q) * n);
  // a width that is not a whole number of 128-lane blocks is refused
  assert.throws(() => new SIMD.Arena(8200), /128-lane/);
  assert.equal(SIMD.fitsPacked(8192), true); assert.equal(SIMD.fitsPacked(8200), false);
  // pack: bit (i & 7) of byte (i >> 3) is lane i, set when the lane is +1
  const packed = SIMD.pack(items[0], new Uint8Array(n / 8), 0);
  for (let i = 0; i < n; i++) assert.equal((packed[i >> 3] >> (i & 7)) & 1, items[0][i] > 0 ? 1 : 0);
  // an empty arena has no best
  assert.equal(new SIMD.Arena(n).best(q), null);
});

test('simd: wacc accumulates weight times lane in i32 lanes exactly on any Int8 lanes, and RawArena dots match the scalar dot', () => {
  if (!SIMD.available) return;
  const rng = new RNG('wacc');
  const n = 8192, count = 37;
  const arena = new SIMD.RawArena(n, 8);
  const members = [];
  for (let k = 0; k < count; k++) {
    const v = new Int8Array(n);
    for (let i = 0; i < n; i++) v[i] = k % 5 === 0 ? rng.int(7) - 3 : (rng.int(2) ? 1 : -1);
    members.push(v); arena.set(k, v);
  }
  assert.equal(arena.count, count, 'the arena grew past its starting capacity of 8');
  const w = new Int32Array(count);
  for (let k = 0; k < count; k++) w[k] = rng.int(1_000_001);
  const acc = arena.wacc(w, new Int32Array(n));
  const want = new Int32Array(n);
  for (let k = 0; k < count; k++) for (let i = 0; i < n; i++) want[i] += w[k] * members[k][i];
  assert.deepEqual(acc, want, 'weighted accumulation, every lane');
  const q = new Int8Array(n); for (let i = 0; i < n; i++) q[i] = rng.int(5) - 2;
  const dots = arena.dots(q, new Int32Array(count));
  for (let k = 0; k < count; k++) { let d = 0; for (let i = 0; i < n; i++) d += q[i] * members[k][i]; assert.equal(dots[k], d, 'dot of member ' + k); }
  arena.move(count - 1, 3); arena.truncate(count - 1);
  const dots2 = arena.dots(q, new Int32Array(count - 1));
  let d3 = 0; for (let i = 0; i < n; i++) d3 += q[i] * members[count - 1][i];
  assert.equal(dots2[3], d3, 'swap-remove: the last member now reads at slot 3');
  const acc2 = arena.wacc(w, new Int32Array(n), 2);
  const want2 = new Int32Array(n);
  for (let k = 0; k < 2; k++) for (let i = 0; i < n; i++) want2[i] += w[k] * members[k][i];
  assert.deepEqual(acc2, want2, 'a count below the member count reads only those, and the accumulator is cleared first');
  assert.throws(() => arena.set(0, new Int8Array(16)), /lanes/);
});
