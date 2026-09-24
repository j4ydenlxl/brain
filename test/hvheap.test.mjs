// test/hvheap.test.mjs: the hypervector heap (core/simd.mjs, core/signal.mjs, runtime/kernels.mjs).
// Every vector core makes is a view on the SIMD module's memory when a slot is free; a slot
// comes back through release() or through the finalizer once the collector has run and the
// loop has turned; a full heap falls back to plain arrays and counts it; the weighted kernel
// is core's Float64 loop bit for bit; the wire format is unchanged.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import v8 from 'node:v8';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as SIMD from '../core/simd.mjs';
import * as S from '../core/signal.mjs';
import { RNG } from '../core/rng.mjs';
import { getKind } from '../core/cell.mjs';
import '../cells/index.mjs';
import * as K from '../runtime/kernels.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = (p) => pathToFileURL(path.join(ROOT, p)).href;
v8.setFlagsFromString('--expose-gc');
const gc = vm.runInNewContext('gc');
const turn = () => new Promise((r) => setTimeout(r, 10));
const D = S.D;
const lanes = (v) => Array.from(v);
// core's weighted loop, copied here so the kernel is graded against the expression itself
function refWeighted(list, weights, T) {
  const n = list[0].length, f = list[0], acc = new Float64Array(n);
  for (let k = 0; k < list.length; k++) { const v = list[k], w = weights[k]; for (let i = 0; i < n; i++) acc[i] += v[i] * w; }
  const out = new Int8Array(n);
  let ties = 0;
  for (let i = 0; i < n; i++) { if (!(acc[i] > 0) && !(acc[i] < 0)) ties++; out[i] = acc[i] > 0 ? 1 : acc[i] < 0 ? -1 : (f[i] * T[i] || 1); }
  return { out, ties };
}

test('every hypervector core makes is born in the heap, marked bipolar except hvRandom', () => {
  assert.equal(SIMD.available, true, SIMD.unavailableReason);
  const h = S.heapStats();
  assert.ok(h.slots > 0, 'no heap: ' + JSON.stringify(h));
  for (const k of ['slots', 'inUse', 'peak', 'fallbacks', 'allocs', 'reclaimed', 'released', 'copiedIn', 'capacityBytes']) assert.equal(typeof h[k], 'number', k);
  const rng = new RNG('hvheap:births');
  const r = S.hvRandom(rng);
  assert.ok(SIMD.isHeap(r) && !S.isBipolar(r), 'hvRandom: heap, unmarked (a test may still write a zero lane)');
  const a = S.hvFromSeed('hvheap:a'), b = S.hvFromSeed('hvheap:b');
  assert.ok(SIMD.isHeap(a) && S.isBipolar(a), 'hvFromSeed: heap, marked');
  const bound = S.bind(a, b);
  assert.ok(SIMD.isHeap(bound) && S.isBipolar(bound), 'bind');
  const bundled = S.bundle([a, b, r]);
  assert.ok(SIMD.isHeap(bundled) && S.isBipolar(bundled), 'bundle');
  const weighted = S.bundle([a, b, r], [0.5, 1.5, 2]);
  assert.ok(SIMD.isHeap(weighted) && S.isBipolar(weighted), 'weighted bundle with a bipolar first member');
  const p = S.permute(a, 3);
  assert.ok(SIMD.isHeap(p) && S.isBipolar(p), 'permute of a marked vector');
  const r2 = S.hvRandom(rng), p2 = S.permute(r2, 3);
  assert.ok(SIMD.isHeap(p2) && !S.isBipolar(p2), 'permute of an unmarked vector stays unmarked');
  const u = S.unpackHV(S.packHV(a));
  assert.ok(SIMD.isHeap(u) && S.isBipolar(u), 'unpackHV');
  const acc = new Int32Array(D);
  for (let i = 0; i < D; i++) acc[i] = a[i] + b[i];
  const fa = S.bundleFromAcc(acc, a);
  assert.ok(SIMD.isHeap(fa) && S.isBipolar(fa), 'bundleFromAcc');
  assert.ok(SIMD.isHeap(S.hvAlloc(D)), 'hvAlloc');
  const wide = S.hvAlloc(SIMD.SLOT + 16);
  assert.ok(!SIMD.isHeap(wide) && wide.length === SIMD.SLOT + 16, 'a vector wider than a slot is a plain array');
  assert.ok(!SIMD.isHeap(S.hvZero()), 'hvZero stays a plain zero array');
});

test('alloc hands out distinct slot-aligned views; release returns the slot at once; a second release, a plain array and an unaligned view are refused', () => {
  const h0 = S.heapStats();
  const v1 = SIMD.alloc(D), v2 = SIMD.alloc(D);
  assert.ok(v1 && v2 && v1.buffer === v2.buffer && v1.byteOffset !== v2.byteOffset);
  assert.equal(v1.length, D);
  assert.ok(SIMD.slotOf(v1) >= 0 && SIMD.slotOf(v2) >= 0 && SIMD.slotOf(v1) !== SIMD.slotOf(v2));
  assert.equal(Math.abs(v1.byteOffset - v2.byteOffset) % SIMD.SLOT, 0, 'slots are SLOT bytes apart'); // abs: a negative remainder is -0, which strict equal refuses (2026-09-17)
  const h1 = S.heapStats();
  assert.equal(h1.inUse - h0.inUse, 2);
  assert.equal(h1.allocs - h0.allocs, 2);
  assert.ok(h1.peak >= h1.inUse);
  assert.equal(S.release(v1), true);
  assert.equal(S.heapStats().inUse - h0.inUse, 1);
  assert.equal(S.release(v1), false, 'a second release is refused');
  assert.equal(S.heapStats().doubleFrees - h0.doubleFrees, 1, 'and counted');
  assert.equal(S.release(new Int8Array(D)), false, 'a plain array is not a slot');
  assert.equal(S.release(v2.subarray(16)), false, 'a view that does not start a slot is not released');
  assert.equal(S.heapStats().inUse - h0.inUse, 1, 'v2 still held');
  assert.equal(S.release(v2), true);
  assert.equal(S.heapStats().inUse, h0.inUse);
  assert.equal(S.heapStats().released - h0.released, 2);
  const v3 = SIMD.alloc(D);
  assert.equal(SIMD.slotOf(v3), SIMD.slotOf(v2), 'the slot freed last is handed out first');
  S.release(v3);
});

test('a dropped view returns its slot through the finalizer after a collection and a turn; a stale finalizer cannot free a slot handed out again', async () => {
  const rng = new RNG('hvheap:reclaim');
  const h0 = S.heapStats();
  const N = 4096;
  (() => { for (let i = 0; i < N; i++) S.hvRandom(rng, 16); })();
  const h1 = S.heapStats();
  assert.equal(h1.inUse - h0.inUse, N, 'nothing comes back inside a synchronous loop');
  gc();
  let h2, turns = 0;
  const t0 = Date.now();
  while ((h2 = S.heapStats()).reclaimed - h0.reclaimed < N && Date.now() - t0 < 10000) { await turn(); turns++; }
  console.log('reclaim: N=' + N + ' inUse before=' + h0.inUse + ' at loop end=' + h1.inUse + ' after gc and ' + turns + ' turns=' + h2.inUse + ' reclaimed=' + (h2.reclaimed - h0.reclaimed) + ' ms=' + (Date.now() - t0));
  assert.ok(h2.reclaimed - h0.reclaimed >= N, 'reclaimed ' + (h2.reclaimed - h0.reclaimed) + ' of ' + N);
  assert.ok(h2.inUse <= h1.inUse - N, 'inUse ' + h2.inUse + ' after, ' + h1.inUse + ' at the loop end');
  // releasing through a second view over the same slot leaves the first view's finalizer
  // registered; when it fires, its generation is old and the slot's new owner keeps it
  let v1 = SIMD.alloc(D);
  const slot = SIMD.slotOf(v1);
  let twin = v1.subarray(0);
  assert.equal(S.release(twin), true);
  const v2 = SIMD.alloc(D);
  assert.equal(SIMD.slotOf(v2), slot, 'the slot came straight back');
  const s0 = S.heapStats().stale;
  v1 = null; twin = null;
  gc();
  const t1 = Date.now();
  while (S.heapStats().stale === s0 && Date.now() - t1 < 10000) await turn();
  assert.ok(S.heapStats().stale > s0, 'the old view\'s finalizer fired and was recognised as stale');
  assert.equal(S.release(v2), true, 'v2 still owned its slot');
});

test('a full heap falls back to plain arrays, counts every fallback, reports the transition to BRAIN_HV_HEAP_REPORT, and computes the same lanes', () => {
  const report = path.join(os.tmpdir(), 'brain-hvheap-test-' + process.pid + '.jsonl');
  try { fs.unlinkSync(report); } catch { /* none yet */ }
  const code = [
    'import * as S from ' + JSON.stringify(url('core/signal.mjs')) + ';',
    'import * as SIMD from ' + JSON.stringify(url('core/simd.mjs')) + ';',
    'import { RNG } from ' + JSON.stringify(url('core/rng.mjs')) + ';',
    'const rng = new RNG("hvheap:full"); const keep = [];',
    'for (let i = 0; i < 200; i++) keep.push(S.hvRandom(rng));',
    'const h = S.heapStats();',
    'const a = keep[190], b = keep[191], eight = keep.slice(180, 188);',
    'const bound = S.bind(a, b), bundled = S.bundle(eight), weighted = S.bundle(eight, [1, 1, 1, 1, 1, 1, 1, 1]);',
    'const sb = S.scalar.bundle(eight), sbind = S.scalar.bind(a, b);',
    'let ok = true; for (let i = 0; i < a.length; i++) if (bound[i] !== sbind[i] || bundled[i] !== sb[i] || weighted[i] !== sb[i]) ok = false;',
    'console.log(JSON.stringify({ slots: h.slots, inUse: h.inUse, fallbacks: h.fallbacks, full: h.full, heapMB: h.heapMB, heapFirst: SIMD.isHeap(keep[0]), plainLast: !SIMD.isHeap(keep[199]), boundHeap: SIMD.isHeap(bound), ok }));',
  ].join('\n');
  const run = (mb) => JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', code], { env: { ...process.env, BRAIN_HV_HEAP_MB: mb, BRAIN_HV_HEAP_REPORT: report }, encoding: 'utf8' }).trim().split('\n').pop());
  const one = run('1');
  console.log('heap of 1 MB: ' + JSON.stringify(one));
  assert.equal(one.slots, 128);
  assert.equal(one.inUse, 128);
  assert.equal(one.full, true);
  assert.ok(one.fallbacks >= 72, 'fallbacks ' + one.fallbacks);
  assert.ok(one.heapFirst && one.plainLast && !one.boundHeap && one.ok, JSON.stringify(one));
  const lines = fs.readFileSync(report, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.ok(lines.some((l) => l.why === 'full' && l.tid === 0 && l.slots === 128 && typeof l.at === 'string'), 'the full transition was reported: ' + JSON.stringify(lines.map((l) => l.why)));
  const zero = run('0');
  console.log('heap of 0 MB: ' + JSON.stringify(zero));
  assert.equal(zero.slots, 0);
  assert.ok(zero.fallbacks >= 200, 'fallbacks ' + zero.fallbacks);
  assert.ok(!zero.heapFirst && zero.plainLast && zero.ok, JSON.stringify(zero));
  try { fs.unlinkSync(report); } catch { /* already gone */ }
});

test('when every slot is taken the kernel wrappers still answer, into plain arrays, and the slots come back on release', () => {
  const a = S.hvFromSeed('hvheap:fill:a'), b = S.hvFromSeed('hvheap:fill:b');
  const h0 = S.heapStats(); // read after a and b exist: they hold two slots until the end of this test (2026-09-17)
  const hold = [];
  for (;;) { const v = SIMD.alloc(16); if (!v) break; hold.push(v); }
  const full = S.heapStats();
  assert.equal(full.full, true);
  assert.equal(full.inUse, full.slots);
  assert.equal(full.fallbacks - h0.fallbacks, 1, 'the refused alloc was counted');
  const bound = S.bind(a, b), bundled = S.bundle([a, b, bound]);
  assert.ok(!SIMD.isHeap(bound) && !SIMD.isHeap(bundled), 'plain arrays while the heap is full');
  assert.deepEqual(lanes(bound), lanes(S.scalar.bind(a, b)));
  assert.deepEqual(lanes(bundled), lanes(S.scalar.bundle([a, b, bound])));
  assert.ok(S.heapStats().fallbacks - full.fallbacks >= 2);
  for (const v of hold) S.release(v);
  const after = S.heapStats();
  assert.equal(after.full, false);
  assert.equal(after.inUse, h0.inUse, 'every held slot came back');
  console.log('fill: slots=' + full.slots + ' held=' + hold.length + ' fallbacks=' + (after.fallbacks - h0.fallbacks) + ' released=' + (after.released - h0.released));
  S.release(a); S.release(b);
});

test('the weighted bundle kernel is core\'s Float64 loop bit for bit: ties, NaN and missing weights, one member, 1024 members, mixed heap and plain members, any Int8 lanes', () => {
  const rng = new RNG('hvheap:weighted');
  let graded = 0, tiesGraded = 0;
  for (const n of [16, 128, D]) {
    const T = S.hvRandom(new RNG('bundle:tie'), n);
    const heapV = () => S.hvRandom(rng, n);
    const plainV = () => Int8Array.from(heapV());
    const anyV = () => { const v = new Int8Array(n); for (let i = 0; i < n; i++) v[i] = (rng.u32() & 255) - 128; return v; };
    const many = (k, mk) => Array.from({ length: k }, mk);
    const twin = heapV(), twin2 = heapV();
    const cases = [
      ['one member', [heapV()], [0.7]],
      ['one member, weight 0 (every lane a tie)', [heapV()], [0]],
      ['eight, random weights', many(8, heapV), many(8, () => rng.next() * 3 - 1)],
      ['eight, cancelling pairs (ties)', [twin, twin, twin2, twin2, heapV(), heapV(), twin, twin], [2, -2, 0.5, -0.5, 1, -1, 3, -3]],
      ['NaN weight', many(3, heapV), [1, NaN, 1]],
      ['missing weight', many(3, heapV), [1, 2]],
      ['mixed heap and plain members', [heapV(), plainV(), heapV(), plainV()], [0.25, 0.5, 0.75, 1]],
      ['any Int8 lanes', many(3, anyV), [1.5, -2.5, 3]],
      ['weights as a Float64Array', many(5, heapV), Float64Array.from([1, 0.1, 0.01, 0.001, 0.0001])],
      ['weights below zero and above one', many(6, heapV), [-4, 9.5, 0, 1e-9, 1e9, -0.0]],
    ];
    if (n === 16) cases.push(['1024 members', many(1024, heapV), many(1024, () => rng.next())], ['1025 members (the scalar path)', many(1025, heapV), many(1025, () => rng.next())]);
    for (const [name, list, w] of cases) {
      const got = S.bundle(list, w);
      const want = refWeighted(list, w, T);
      assert.deepEqual(lanes(got), lanes(want.out), name + ' at n=' + n);
      if (name.includes('tie') || name.includes('NaN') || name.includes('missing')) assert.ok(want.ties > 0, name + ': no tie lane was graded');
      if (name.includes('any Int8')) assert.ok(!S.isBipolar(got), 'a weighted bundle of non-bipolar members is not marked');
      else if (list.length <= 1024) assert.ok(S.isBipolar(got), name + ': marked');
      graded += n; tiesGraded += want.ties;
    }
  }
  // a width that is not a whole number of 16-lane blocks keeps the scalar path, same answer
  const n = 24, T = S.hvRandom(new RNG('bundle:tie'), n), list = [S.hvRandom(rng, n), S.hvRandom(rng, n), S.hvRandom(rng, n)], w = [0.3, 0.3, 0.3];
  assert.deepEqual(lanes(S.bundle(list, w)), lanes(refWeighted(list, w, T).out));
  console.log('weighted: lanes graded=' + graded + ' tie lanes=' + tiesGraded);
});

test('members that live in the heap are read in place: a bundle of eight heap vectors copies nothing, of eight plain vectors copies eight', () => {
  const rng = new RNG('hvheap:copies');
  const heap = Array.from({ length: 8 }, () => S.hvFromSeed('hvheap:copy:' + rng.u32()));
  const plain = heap.map((v) => Int8Array.from(v));
  S.bundle(heap); // the tie vector exists after this
  const c0 = S.heapStats().copiedIn;
  S.bundle(heap); const c1 = S.heapStats().copiedIn;
  S.bundle(plain); const c2 = S.heapStats().copiedIn;
  S.bundle(heap, [1, 2, 3, 4, 5, 6, 7, 8]); const c3 = S.heapStats().copiedIn;
  S.bind(heap[0], heap[1]); const c4 = S.heapStats().copiedIn;
  S.bind(plain[0], plain[1]); const c5 = S.heapStats().copiedIn;
  S.sim(heap[0], heap[1]); S.hamming(heap[0], heap[1]); const c6 = S.heapStats().copiedIn;
  assert.equal(c1 - c0, 0, 'bundle of heap members');
  assert.equal(c2 - c1, 8, 'bundle of plain members');
  assert.equal(c3 - c2, 0, 'weighted bundle of heap members');
  assert.equal(c4 - c3, 0, 'bind of heap members');
  assert.equal(c5 - c4, 2, 'bind of plain members');
  assert.equal(c6 - c5, 0, 'sim and hamming of heap members');
});

test('permute is the same roll as the lane loop for every shift, and the mark follows the input', () => {
  const rng = new RNG('hvheap:permute');
  const a = S.hvFromSeed('hvheap:perm'), n = a.length;
  for (const k of [0, 1, -1, 5, 4096, n, n + 3, -n - 3, 8191]) {
    const want = new Int8Array(n), s = ((k % n) + n) % n;
    for (let i = 0; i < n; i++) want[(i + s) % n] = a[i];
    const got = S.permute(a, k);
    assert.deepEqual(lanes(got), lanes(want), 'k=' + k);
    assert.ok(SIMD.isHeap(got) && S.isBipolar(got), 'k=' + k + ': heap, marked');
    assert.deepEqual(lanes(S.unpermute(got, k)), lanes(a), 'unpermute k=' + k);
  }
  const r = S.hvRandom(rng);
  r[7] = 0;
  const p = S.permute(r, 1);
  assert.equal(p[8], 0);
  assert.ok(!S.isBipolar(p), 'an unmarked input gives an unmarked output');
});

test('the wire format is unchanged: b8192: plus base64 for a bipolar vector, base64 Int8 for one with a zero lane, both read back the same lanes', () => {
  const a = S.hvFromSeed('hvheap:wire');
  const s = S.dataToJSON('hv', a);
  assert.ok(s.startsWith('b8192:'), s.slice(0, 12));
  assert.equal(s.length, 6 + 1368);
  const back = S.dataFromJSON('hv', s);
  assert.deepEqual(lanes(back), lanes(a));
  assert.ok(SIMD.isHeap(back) && S.isBipolar(back), 'a vector read from the wire lands in the heap, marked');
  const z = S.hvRandom(new RNG('hvheap:zero'));
  z[100] = 0;
  const sz = S.dataToJSON('hv', z);
  assert.ok(!sz.includes(':') && sz.length === 10924, 'a zero lane keeps the Int8 form: ' + sz.length);
  const bz = S.dataFromJSON('hv', sz);
  assert.deepEqual(lanes(bz), lanes(z));
  assert.equal(bz[100], 0);
  const m = new S.ItemMemory();
  m.get('one'); m.get('two');
  const m2 = S.ItemMemory.from(JSON.parse(JSON.stringify(m.serialize())));
  assert.ok(SIMD.isHeap(m2.get('one')), 'an item read from a snapshot lands in the heap');
  assert.deepEqual(lanes(m2.get('two')), lanes(m.get('two')));
  assert.equal(m2.nearest(m.get('one'))[0], 'one');
});

test('bindMany releases the intermediates it made and keeps only the result', () => {
  const list = Array.from({ length: 5 }, (_, i) => S.hvFromSeed('hvheap:many:' + i));
  const h0 = S.heapStats();
  const r = S.bindMany(list);
  const h1 = S.heapStats();
  assert.equal(h1.allocs - h0.allocs, 4, 'four products');
  assert.equal(h1.released - h0.released, 3, 'three of them released');
  assert.equal(h1.inUse - h0.inUse, 1, 'one held: the result');
  let want = S.scalar.bind(list[0], list[1]);
  for (let i = 2; i < 5; i++) want = S.scalar.bind(want, list[i]);
  assert.deepEqual(lanes(r), lanes(want));
  assert.equal(S.bindMany([list[0]]), list[0]);
  for (const v of list) assert.ok(SIMD.slotOf(v) >= 0 && S.release(v), 'the inputs were untouched');
});

test('a released intermediate\'s slot is reused by the next alloc, over and over, so a fold that releases never grows the heap', () => {
  const h0 = S.heapStats();
  const seen = new Set();
  let v = SIMD.alloc(D);
  const first = SIMD.slotOf(v);
  for (let i = 0; i < 1000; i++) {
    assert.equal(S.release(v), true, 'release ' + i);
    v = SIMD.alloc(D);
    seen.add(SIMD.slotOf(v));
  }
  const h1 = S.heapStats();
  assert.equal(seen.size, 1, '1000 release-then-alloc rounds used ' + seen.size + ' distinct slots');
  assert.equal([...seen][0], first, 'and it is the slot the first alloc took');
  assert.equal(h1.inUse - h0.inUse, 1, 'one slot held at the end');
  assert.equal(h1.allocs - h0.allocs, 1001);
  assert.equal(h1.released - h0.released, 1000);
  assert.equal(h1.fallbacks, h0.fallbacks, 'not one fallback in 1001 allocations off a single slot');
  console.log('reuse: slot ' + first + ' served ' + (h1.allocs - h0.allocs) + ' allocations, ' + (h1.released - h0.released) + ' releases, 0 new fallbacks');
  S.release(v);
});

// plan() has to run before the memory exists, so every arm of this test is its own process.
const planChild = (body, env = {}) => {
  const code = [
    'import * as SIMD from ' + JSON.stringify(url('core/simd.mjs')) + ';',
    'import * as S from ' + JSON.stringify(url('core/signal.mjs')) + ';',
    body,
    'console.log(JSON.stringify({ stats: SIMD.heapStats(), plan: SIMD.heapPlan() }));',
  ].join('\n');
  return JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', code], { env: { ...process.env, BRAIN_HV_HEAP_MB: '', BRAIN_HV_HEAP_EAGER: '0', ...env }, encoding: 'utf8' }).trim().split('\n').pop());
};

test('a plan of N slots installs N, not 65536; the plan is arithmetic on majors; BRAIN_HV_HEAP_MB still wins; a plan after the first allocation cannot move the memory', () => {
  // the default, with nothing planned: the flat size this module chooses on its own
  const flat = planChild('SIMD.alloc(8192);');
  assert.equal(flat.stats.slots, 65536, 'unplanned: ' + flat.stats.slots + ' slots');
  assert.equal(flat.plan.applied, false);
  // an explicit slot count
  const exact = planChild('SIMD.plan({ slots: 777, by: "test" }); SIMD.alloc(8192);');
  assert.equal(exact.stats.slots, 777, 'planned 777, installed ' + exact.stats.slots);
  assert.equal(exact.stats.capacityBytes, 777 * SIMD.SLOT);
  assert.equal(exact.plan.applied, true);
  assert.ok(exact.stats.installedMB < flat.stats.installedMB, exact.stats.installedMB + ' MB planned against ' + flat.stats.installedMB + ' MB flat');
  // from an organism: the arithmetic this module publishes, and the child agrees with it
  const want = SIMD.planSlots(12, 256);
  assert.equal(want, SIMD.PLAN_BASE_SLOTS + SIMD.PLAN_SLOTS_PER_MAJOR * 12);
  const organism = planChild('SIMD.plan({ majors: 12, units: 256, by: "test" }); SIMD.alloc(8192);');
  assert.equal(organism.stats.slots, want, 'a 12 major organism plans ' + want + ' slots, installed ' + organism.stats.slots);
  assert.ok(organism.stats.slots < 65536 / 8, 'and that is far below the flat 65536');
  // the clamps hold at both ends
  assert.equal(SIMD.planSlots(0, 0), SIMD.PLAN_BASE_SLOTS);
  assert.equal(SIMD.planSlots(1e9, 0), SIMD.PLAN_MAX_SLOTS);
  assert.ok(SIMD.planSlots(12, 256) === SIMD.planSlots(12, 100000), 'units carries no coefficient in the plan: it is recorded, not used');
  // an operator who names a size gets it, and the plan says it stood aside
  const env = planChild('SIMD.plan({ majors: 12, units: 256, by: "test" }); SIMD.alloc(8192);', { BRAIN_HV_HEAP_MB: '1' });
  assert.equal(env.stats.slots, 128, 'BRAIN_HV_HEAP_MB=1 wins: ' + env.stats.slots + ' slots');
  assert.equal(env.plan.applied, false);
  assert.ok(env.plan.reason.includes('BRAIN_HV_HEAP_MB'), env.plan.reason);
  // too late is reported, never pretended
  const late = planChild('SIMD.alloc(8192); SIMD.plan({ majors: 12, units: 256, by: "test" });');
  assert.equal(late.stats.slots, 65536);
  assert.equal(late.plan.applied, false);
  assert.ok(late.plan.reason.includes('already installed'), late.plan.reason);
  console.log('plan: flat ' + flat.stats.slots + ' slots (' + flat.stats.installedMB + ' MB) -> planned ' + organism.stats.slots + ' slots (' + organism.stats.installedMB + ' MB) for 12 majors; exact ' + exact.stats.slots + '; env wins ' + env.stats.slots + '; late ' + late.stats.slots);
});

test('a fold that releases what it owns holds its heap flat where the same fold without release fills it: hvSequence against its own control', () => {
  // The organism's own shape, measured: a 12 major buildWhole ran this fold 58000 times with
  // four members each. Here both arms run the same fold the same number of times on a heap
  // deliberately smaller than the arm would need if nothing came back, so the difference is
  // the release and nothing else.
  const CALLS = 2000, MEMBERS = 4;
  const items = Array.from({ length: MEMBERS }, (_, i) => S.hvFromSeed('hvheap:fold:item:' + i));
  const drop = [];
  // control: the fold WITHOUT release, written out here exactly as core/signal.mjs had it
  const h0 = S.heapStats();
  for (let c = 0; c < CALLS; c++) {
    const list = new Array(MEMBERS);
    for (let i = 0; i < MEMBERS; i++) list[i] = S.permute(items[i], MEMBERS - 1 - i);
    drop.push(S.bundle(list));
  }
  const control = S.heapStats();
  const controlAllocs = control.allocs - h0.allocs, controlFallbacks = control.fallbacks - h0.fallbacks;
  const controlHeld = control.inUse - h0.inUse;
  // the arm: the same fold through the public API, which releases its own intermediates
  const h1 = S.heapStats();
  const kept = [];
  for (let c = 0; c < CALLS; c++) kept.push(S.hvSequence(items));
  const arm = S.heapStats();
  const armReleased = arm.released - h1.released;
  const armHeld = arm.inUse - h1.inUse;
  console.log('fold ' + CALLS + ' x ' + MEMBERS + ' members: control held ' + controlHeld + ' slots (' + controlAllocs + ' allocs, ' + controlFallbacks + ' fallbacks); hvSequence held ' + armHeld + ' and released ' + armReleased);
  assert.equal(armReleased, CALLS * MEMBERS, 'every member of every fold came back: ' + armReleased);
  assert.ok(armHeld <= CALLS, 'the arm holds at most the results it returned: ' + armHeld);
  assert.ok(controlHeld > armHeld, 'the control holds more: ' + controlHeld + ' against ' + armHeld);
  // the shape the contract names: with the fold releasing, the slots in use per call stay at
  // the result alone, so the ratio of slots held to allocations made is 1 / (MEMBERS + 1)
  assert.ok(armHeld / (arm.allocs - h1.allocs) <= 1 / (MEMBERS + 1) + 1e-9, 'held ' + armHeld + ' of ' + (arm.allocs - h1.allocs) + ' allocations');
  // every result is still correct, lane for lane, against the scalar reference
  const want = S.scalar.bundle(items.map((v, i) => S.permute(v, MEMBERS - 1 - i)));
  assert.deepEqual(lanes(kept[0]), lanes(want), 'the released fold computes the same lanes');
  assert.deepEqual(lanes(kept[CALLS - 1]), lanes(want));
  for (const v of kept) S.release(v);
  for (const v of drop) S.release(v);
  for (const v of items) S.release(v);
});

test('a 12 major organism ticked 200 times through the public API: what the heap ends at, and how much of it is garbage', { timeout: 600000 }, () => {
  // The whole point of the heap is that a slot comes back. Inside one job it can only come
  // back through release(), so this test measures the organism's real end state and the
  // share of it that a collection and an event loop turn would return.
  const code = [
    'import * as SIMD from ' + JSON.stringify(url('core/simd.mjs')) + ';',
    'import { buildWhole } from ' + JSON.stringify(url('seeds/whole.mjs')) + ';',
    'import { rmSync } from "node:fs";',
    'const dir = ' + JSON.stringify(path.join(ROOT, 'state', 'hvheap-organism')) + ';',
    'rmSync(dir, { recursive: true, force: true });',
    'const built = buildWhole({ majors: 12, substrateUnits: 256, ledger: "off", name: "hvheap-organism", seed: "footprint-12" });',
    'built.brain.tick(200);',
    'const end = SIMD.heapStats();',
    'const sites = SIMD.heapSites(6);',
    'const v8 = await import("node:v8"); const vm = await import("node:vm");',
    'v8.default.setFlagsFromString("--expose-gc"); const gc = vm.default.runInNewContext("gc");',
    'for (let i = 0; i < 14; i++) { gc(); await new Promise((r) => setTimeout(r, 5)); }',
    'const settled = SIMD.heapStats();',
    'rmSync(dir, { recursive: true, force: true });',
    'console.log(JSON.stringify({ end, live: settled.inUse, plan: built.report.hvPlan, sites }));',
    'process.exit(0);',
  ].join('\n');
  const r = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', code], { cwd: ROOT, env: { ...process.env, BRAIN_HV_HEAP_MB: '', BRAIN_HV_HEAP_EAGER: '0', BRAIN_HV_HEAP_SITES: '1' }, encoding: 'utf8', maxBuffer: 1 << 26 }).trim().split('\n').pop());
  const { end, live, plan, sites } = r;
  const tried = end.allocs + end.fallbacks;
  console.log('organism 12 majors, 200 ticks: plan ' + plan.slots + ' slots (' + plan.wouldBeMB + ' MB, applied ' + plan.applied + '), inUse ' + end.inUse + ' of ' + end.slots +
    ', allocs ' + end.allocs + ', fallbacks ' + end.fallbacks + ' of ' + tried + ' tries (' + end.fallbackPct + '%), released ' + end.released + ', finalizerCalls ' + end.finalizerCalls +
    ', live after a collection and turns ' + live);
  console.log('organism allocation sites: ' + JSON.stringify(sites));
  // the plan did its job: the memory installed is the organism's size, not a flat 512 MB
  assert.equal(plan.applied, true);
  assert.equal(end.slots, plan.slots);
  assert.ok(end.installedMB < 64, 'the installed heap is ' + end.installedMB + ' MB');
  // MEASURED: not one finalizer fires inside a synchronous build and tick loop, so the only
  // way a slot comes back inside the run is release() by its owner. Before the owners
  // released, this run ended with every slot taken and 98.93 percent of its allocation
  // attempts falling back to plain arrays; with the tokenizer fold, the mind model's context
  // readers, the semantic cleanup walk and the two memory restore paths releasing what they
  // make, the plan's slots serve the whole run with no fallback at all.
  // `live` is what a collection and a turn would still return: the garbage of the owners
  // that cannot release, because what they make is a signal payload or a cell's state.
  assert.equal(end.finalizerCalls, 0, 'a synchronous run gets no finalizer turn');
  assert.ok(end.released > tried * 0.9, 'released ' + end.released + ' of ' + tried + ' allocation attempts: the owners are not returning their slots');
  assert.ok(end.fallbackPct < 1, 'fallbacks ' + end.fallbacks + ' of ' + tried + ' (' + end.fallbackPct + '%): the sized heap is not serving the run');
  assert.ok(end.inUse < end.slots, 'inUse ' + end.inUse + ' of ' + end.slots + ': the heap ended full');
  assert.ok(live <= end.inUse && live > 0, 'live ' + live + ' of ' + end.inUse + ' in use');
  // the site census names that owner rather than leaving it to argument
  assert.ok(sites.length > 0, 'the census recorded nothing');
  const [topSite, topCount] = sites[0];
  assert.ok(topCount / tried > 0.5, 'the top site ' + topSite + ' holds ' + topCount + ' of ' + tried + ' allocation attempts');
  assert.ok(!topSite.includes('core/simd') && !topSite.includes('core/signal'), 'the top site is outside the two files the heap lives in: ' + topSite);
});

test('a 12 major organism ticked 200 times: the garbage a collection and a turn return is a minority of what the heap holds at the end', { timeout: 600000 }, () => {
  // The claim this grades: after the owners that CAN release do, a run's end state is a heap
  // the plan covered with no fallback, and the litter left in it is bounded. This child
  // builds and ticks only, with no snapshot and no restore, so its denominator is smaller
  // than the bench row's: MEASURED HERE on 2026-09-18, after the payload contract gave every
  // routed vector an owner, 2 of 560 slots in use (0.36 percent) came back on a collection
  // and a turn, against 558 still live. Its own control is the reading this same child gave
  // before that contract existed, 1152 of 2377 (48.46 percent), and before any release at all
  // the bench read 1757 of 3200 (54.91 percent). The bar below is 5 percent: fourteen times
  // the measured figure, so run to run movement cannot trip it, and a tenth of the 55 percent
  // bar it replaces, so a return to the old shape does.
  const code = [
    'import * as SIMD from ' + JSON.stringify(url('core/simd.mjs')) + ';',
    'import { buildWhole } from ' + JSON.stringify(url('seeds/whole.mjs')) + ';',
    'import { rmSync } from "node:fs";',
    'const dir = ' + JSON.stringify(path.join(ROOT, 'state', 'hvheap-garbage')) + ';',
    'rmSync(dir, { recursive: true, force: true });',
    'const built = buildWhole({ majors: 12, substrateUnits: 256, ledger: "off", name: "hvheap-garbage", seed: "footprint-12" });',
    'built.brain.tick(200);',
    'const end = SIMD.heapStats();',
    'const v8 = await import("node:v8"); const vm = await import("node:vm");',
    'v8.default.setFlagsFromString("--expose-gc"); const gc = vm.default.runInNewContext("gc");',
    'for (let i = 0; i < 14; i++) { gc(); await new Promise((r) => setTimeout(r, 5)); }',
    'const settled = SIMD.heapStats();',
    'rmSync(dir, { recursive: true, force: true });',
    'console.log(JSON.stringify({ end, live: settled.inUse, plan: built.report.hvPlan }));',
    'process.exit(0);',
  ].join('\n');
  const r = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', code], { cwd: ROOT, env: { ...process.env, BRAIN_HV_HEAP_MB: '', BRAIN_HV_HEAP_EAGER: '0' }, encoding: 'utf8', maxBuffer: 1 << 26 }).trim().split('\n').pop());
  const { end, live, plan } = r;
  const garbage = end.inUse - live;
  const fraction = end.inUse ? garbage / end.inUse : 0;
  console.log('garbage after the turn: ' + garbage + ' of ' + end.inUse + ' slots in use (' + (100 * fraction).toFixed(2) + '%), ' + live +
    ' live, plan ' + plan.slots + ' slots (' + plan.wouldBeMB + ' MB), peak ' + end.peak + ', fallbacks ' + end.fallbacks + ' (' + end.fallbackPct + '%), released ' + end.released);
  assert.equal(end.finalizerCalls, 0, 'a synchronous run gets no finalizer turn, so nothing came back except by release()');
  assert.ok(garbage > 0 && live > 0, 'both sides of the split were measured: garbage ' + garbage + ', live ' + live);
  // the measured shape, with room for run to run movement on top of the 0.36 percent measured
  assert.ok(fraction < 0.05, 'garbage ' + garbage + ' of ' + end.inUse + ' in use is ' + (100 * fraction).toFixed(2) + '%, at or above the 5% bar');
  // the whole point of the plan: no allocation in the run had to fall back to a plain array
  assert.equal(end.fallbacks, 0, 'fallbacks ' + end.fallbacks + ' of ' + (end.allocs + end.fallbacks) + ' attempts');
  assert.ok(end.peak <= plan.slots, 'the plan covered the peak: peak ' + end.peak + ', plan ' + plan.slots);
});

test('a released slot changes no computation: a 12 major organism ticked 50 times with the heap on is the same organism with the heap off', { timeout: 600000 }, () => {
  // THE GUARD ON THE PAYLOAD CONTRACT. Every release this contract added returns a slot that
  // the releaser believes nobody will read again. If that belief is wrong somewhere, the slot
  // is handed to the next alloc() and a receiver reads a vector that has been overwritten, so
  // the organism computes something else. With BRAIN_HV_HEAP_MB=0 there is no heap and every
  // release is a no op (release() refuses a plain array), so that arm CANNOT read a released
  // slot. The two arms therefore have to agree exactly, and any disagreement is that bug.
  const child = (arm) => [
    'import { buildWhole } from ' + JSON.stringify(url('seeds/whole.mjs')) + ';',
    'import { rmSync } from "node:fs";',
    'const dir = ' + JSON.stringify(path.join(ROOT, 'state', 'hvheap-determinism-')) + ' + ' + JSON.stringify(arm) + ';',
    'rmSync(dir, { recursive: true, force: true });',
    'const built = buildWhole({ majors: 12, substrateUnits: 256, ledger: "off", name: "hvheap-determinism-' + arm + '", seed: "footprint-12" });',
    'built.brain.tick(50);',
    'const s = built.brain.summary();',
    'rmSync(dir, { recursive: true, force: true });',
    // the name differs by arm on purpose (two state dirs), so it is not part of the comparison
    'console.log(JSON.stringify({ t: s.t, gen: s.gen, cells: s.cells, edges: s.edges, liveEdges: s.liveEdges, stats: s.stats, connectome: s.connectome, scheduler: s.scheduler, outbox: s.outbox, mail: s.mail }));',
    'process.exit(0);',
  ].join('\n');
  const run = (arm, env) => JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', child(arm)], {
    cwd: ROOT, env: { ...process.env, BRAIN_HV_HEAP_EAGER: '0', ...env }, encoding: 'utf8', maxBuffer: 1 << 26,
  }).trim().split('\n').pop());
  const on = run('on', { BRAIN_HV_HEAP_MB: '' });
  const off = run('off', { BRAIN_HV_HEAP_MB: '0' });
  console.log('heap on : ' + JSON.stringify(on));
  console.log('heap off: ' + JSON.stringify(off));
  // the arms have to have done real work, or equality would be the equality of two empty runs
  assert.ok(on.stats.runs > 0 && on.stats.signals > 0 && on.edges > 0, 'the heap on arm did nothing: ' + JSON.stringify(on.stats));
  assert.equal(on.t, off.t, 'the clock');
  assert.equal(on.gen, off.gen, 'the generation');
  assert.equal(on.cells, off.cells, 'the cell count');
  assert.equal(on.edges, off.edges, 'the connectome edge count');
  assert.equal(on.liveEdges, off.liveEdges, 'the live edge count');
  assert.deepEqual(on.stats, off.stats, 'the brain stats');
  assert.deepEqual(on.connectome, off.connectome, 'the connectome stats');
  assert.deepEqual(on.scheduler, off.scheduler, 'the scheduler stats');
});

test('the plan is at or above the peak the bench measured, at every size where the ceiling lets it be', () => {
  const peaks = SIMD.PLAN_MEASURED_PEAKS;
  const line = (m) => SIMD.PLAN_BASE_SLOTS + SIMD.PLAN_SLOTS_PER_MAJOR * m;
  const missed = [];
  for (const key of Object.keys(peaks.bySlots)) {
    const m = Number(key), peak = peaks.bySlots[key], capped = peaks.capped[key];
    // a capped peak is a floor on the need, not the need: the plan cannot be graded against it
    if (capped) { assert.ok(line(m) > 0 && SIMD.planSlots(m, peaks.units) === SIMD.PLAN_MAX_SLOTS, m + ' majors: a capped peak clamps to the ceiling'); continue; }
    assert.ok(line(m) >= peak, m + ' majors: the fitted line gives ' + line(m) + ' slots against a measured peak of ' + peak);
    const planned = SIMD.planSlots(m, peaks.units);
    if (planned < peak) missed.push({ majors: m, planned, peak, shortBy: peak - planned });
    else assert.ok(planned >= peak, m + ' majors: planSlots gives ' + planned + ' against a peak of ' + peak);
  }
  console.log('plan against the measured peaks: ' + Object.keys(peaks.bySlots).map((m) => m + ' majors peak ' + peaks.bySlots[m] + (peaks.capped[m] ? ' (capped)' : '') + ' line ' + line(Number(m)) + ' planSlots ' + SIMD.planSlots(Number(m), peaks.units)).join('; '));
  console.log('short of the peak because of PLAN_MAX_SLOTS=' + SIMD.PLAN_MAX_SLOTS + ': ' + (missed.length ? JSON.stringify(missed) : 'none'));
  // 100 majors is still clamped by the CEILING, and that clamp is asserted rather than assumed:
  // the line wants 43248 slots and gets 32768. What changed on 2026-09-18 is that the clamp is
  // no longer a miss. The payload contract cut this organism's peak need from 40199 slots to
  // 28504, which the ceiling now covers, so no uncapped size is short of its peak any more and
  // the assertion is that there are none, not that there is exactly one.
  assert.equal(SIMD.planSlots(100, peaks.units), SIMD.PLAN_MAX_SLOTS, '100 majors is clamped by the ceiling');
  assert.ok(line(100) > SIMD.PLAN_MAX_SLOTS, 'the clamp is what 100 majors gets, not the line: line ' + line(100) + ', ceiling ' + SIMD.PLAN_MAX_SLOTS);
  assert.ok(line(100) >= peaks.bySlots[100], 'the line clears the 100 major peak before the clamp: ' + line(100) + ' against ' + peaks.bySlots[100]);
  assert.equal(missed.length, 0, 'an uncapped size is short of its measured peak: ' + JSON.stringify(missed));
  // the one size that is NOT covered is the one whose peak is a cap and therefore unknown
  assert.equal(peaks.capped[1000], true, '1000 majors is the size whose need is still above the 65536 slot ruler');
});

test('the ownership census splits a site\'s slots into the ones something holds and the ones nobody does', () => {
  // heapOwnership() is what a release at cause is decided from, so it is graded against a
  // control the test itself builds: one site that keeps every vector it makes and one that
  // drops every vector it makes, in the same child, with the same count.
  // written to a real file OUTSIDE the repo: the census strips everything up to and including
  // the repo directory from a frame, so a site inside it would lose its function name
  const code = [
    'import * as SIMD from ' + JSON.stringify(url('core/simd.mjs')) + ';',
    'import * as S from ' + JSON.stringify(url('core/signal.mjs')) + ';',
    'import { RNG } from ' + JSON.stringify(url('core/rng.mjs')) + ';',
    'const rng = new RNG("hvheap:ownership");',
    'const kept = [];',
    'function keeper() { for (let i = 0; i < 300; i++) kept.push(S.hvRandom(rng, 8192)); }',
    'function dropper() { for (let i = 0; i < 300; i++) S.hvRandom(rng, 8192); }',
    'keeper(); dropper();',
    'const before = SIMD.heapOwnership(32);',
    'const v8 = await import("node:v8"); const vm = await import("node:vm");',
    'v8.default.setFlagsFromString("--expose-gc"); const gc = vm.default.runInNewContext("gc");',
    'for (let i = 0; i < 14; i++) { gc(); await new Promise((r) => setTimeout(r, 5)); }',
    'const after = SIMD.heapOwnership(32);',
    'console.log(JSON.stringify({ before, after, kept: kept.length, stats: SIMD.heapStats() }));',
    'process.exit(0);',
  ].join('\n');
  const child = path.join(os.tmpdir(), 'brain-hvheap-ownership-' + process.pid + '.mjs');
  fs.writeFileSync(child, code);
  let r;
  try {
    r = JSON.parse(execFileSync(process.execPath, [child], { cwd: ROOT, env: { ...process.env, BRAIN_HV_HEAP_MB: '64', BRAIN_HV_HEAP_EAGER: '0', BRAIN_HV_HEAP_SITES: '1' }, encoding: 'utf8', maxBuffer: 1 << 26 }).trim().split('\n').pop());
  } finally { try { fs.unlinkSync(child); } catch { /* already gone */ } }
  const find = (rows, name) => rows.find((x) => x.site.includes(name));
  const keepBefore = find(r.before, 'keeper'), dropBefore = find(r.before, 'dropper');
  const keepAfter = find(r.after, 'keeper'), dropAfter = find(r.after, 'dropper');
  console.log('ownership: keeper ' + JSON.stringify(keepBefore) + ' -> live ' + (keepAfter && keepAfter.live) + '; dropper ' + JSON.stringify(dropBefore) + ' -> live ' + (dropAfter && dropAfter.live));
  assert.ok(keepBefore && dropBefore, 'both sites were named: ' + JSON.stringify(r.before.map((x) => x.site)));
  assert.equal(keepBefore.attempts, 300);
  assert.equal(dropBefore.attempts, 300);
  assert.equal(keepBefore.live, 300, 'the keeper holds every slot it took');
  assert.equal(dropBefore.live, 300, 'and so does the dropper, until a collection: nothing comes back inside a synchronous run');
  assert.equal(keepAfter.live, 300, 'the keeper still holds them after the collection and turn: live, not garbage');
  assert.ok(dropAfter.live < 30, 'the dropper\'s slots came back: ' + dropAfter.live + ' of 300 still in use');
});

test('runtime/kernels.mjs hv.bundle, hv.bind and hv.permute write into the heap, mark when the input is marked, and match the kinds they replaced', () => {
  const rng = new RNG('hvheap:kernels');
  const bundleKind = getKind('hv.bundle'), bindKind = getKind('hv.bind'), permKind = getKind('hv.permute');
  const coreBundle = bundleKind.compute, coreBind = bindKind.compute, corePerm = permKind.compute;
  const fresh = (marked) => { const v = S.hvFromSeed('hvheap:k:' + rng.u32()); return marked ? v : Int8Array.from(v); };
  const mail = (k, marked) => Array.from({ length: k }, (_, i) => ({ sig: S.signal('hv', fresh(marked), {}), w: i === 3 ? -1 : 0.5 + rng.next(), e: -1, from: -1 }));
  K.install();
  try {
    for (const [k, marked] of [[1, true], [2, true], [5, true], [5, false], [18, true]]) {
      const ins = [mail(k, marked)], cell = { params: { k: 3 } };
      // the kernel runs first: core's own scan would mark a plain member before the kernel saw it
      const got = bundleKind.compute(ins)[0].data, gotB = bindKind.compute(ins)[0].data, gotP = permKind.compute(ins, cell)[0].data;
      const want = coreBundle(ins)[0].data, wantB = coreBind(ins)[0].data, wantP = corePerm(ins, cell)[0].data;
      assert.deepEqual(lanes(got), lanes(want), 'hv.bundle k=' + k + ' marked=' + marked);
      assert.ok(SIMD.isHeap(got), 'hv.bundle result in the heap');
      assert.equal(S.isBipolar(got), marked, 'hv.bundle result marked exactly when the first member is');
      assert.deepEqual(lanes(gotB), lanes(wantB), 'hv.bind k=' + k + ' marked=' + marked);
      assert.ok(SIMD.isHeap(gotB), 'hv.bind result in the heap');
      if (k > 1) assert.equal(S.isBipolar(gotB), marked, 'hv.bind result marked exactly when every member is');
      assert.deepEqual(lanes(gotP), lanes(wantP), 'hv.permute k=' + k);
      assert.ok(SIMD.isHeap(gotP) && S.isBipolar(gotP) === marked, 'hv.permute result in the heap, mark follows');
    }
  } finally { K.uninstall(); }
});
