// runtime/kernels.mjs : ACCELERATED CELL KINDS, installed at runtime.
//
// A profile of one organism tick (node --cpu-prof, 40000 cells, 440578 edges, gen-0) said
// something blunt: 83.20% of all time inside cell compute was ONE kind, encode.time, at
// 1711.8 us per run. Nothing about that cost was information. encode.time builds a circular
// thermometer code out of vectors that are pure functions of a label, so every run of every
// one of the 720 encode.time cells was regenerating the same 20 hypervectors of 8192 lanes
// from the same seeds, bundling them, binding them to the same four role vectors, and
// throwing all of it away.
//
// This file does not change what a cell computes. It replaces the compute function of a
// measured-hot kind with one that keeps the deterministic part in a table. Same inputs,
// same outputs, lane for lane: test/speed.test.mjs runs each kind's original compute and
// its kernel on the same random inputs and compares all 8192 lanes of every emitted
// signal, including a bundle whose lanes cancel exactly so the tie rule is graded too.
//
// It lives in runtime/ and not in cells/ on purpose. The kind definitions are the readable
// statement of what a cell IS. This is the runtime saying how to execute one quickly, and
// it is installed by a caller who wants speed, never by importing a cell module.
import { getKind, hasKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';
import * as SIMD from '../core/simd.mjs';
import { RNG } from '../core/rng.mjs';

const originals = new Map();   // kind name -> the compute it had before install()
export const KERNELS = ['encode.time', 'encode.vec', 'hv.bundle', 'hv.bind', 'hv.permute'];

// The tie vector core/signal.mjs breaks an even bundle with. It is not exported, so it is
// rebuilt here from the same seed, which is the same 8192 lanes by construction; the
// weighted bundle kernel below needs it to reproduce core's tie rule exactly.
let TIE = null;
function tie(n) { if (!TIE || TIE.length !== n) TIE = S.hvRandom(new RNG('bundle:tie'), n); return TIE; }

// ---------------------------------------------------------------- encode.time
// One entry per (label, centre bucket, buckets, width). The entry already has the role
// vector bound in, so a run is four table reads and one bundle of four instead of twenty
// hvFromSeed regenerations. Measured on the organism, tableSize() reported 24 parts plus
// 4 roles, which is 229376 bytes for the whole table.
const timeParts = new Map();
const timeRoles = new Map();
function role(label) {
  let v = timeRoles.get(label);
  if (v === undefined) { v = S.hvFromSeed('encode.time:role:' + label); timeRoles.set(label, v); }
  return v;
}
function part(label, centre, buckets, width) {
  const key = label + '|' + centre + '|' + buckets + '|' + width;
  let v = timeParts.get(key);
  if (v !== undefined) return v;
  const list = [];
  for (let d = -width; d <= width; d++) list.push(S.hvFromSeed('encode.time:' + label + ':' + (((centre + d) % buckets + buckets) % buckets)));
  const b = S.bundle(list);
  v = S.bind(role(label), b);
  // the seeds and their bundle were intermediates of this entry: their heap slots go back now
  S.release(b);
  for (const x of list) S.release(x);
  timeParts.set(key, v);
  return v;
}
const modp = (a, m) => ((a % m) + m) % m;
function centreOf(phase01, buckets) { return modp(Math.round(phase01 * buckets) % buckets, buckets); }

function encodeTime(ins, cell) {
  const m = ins[0];
  if (!m.length) return [null];
  const s = m[m.length - 1].sig;
  const tms = Math.floor(S.ratToNumber(s.data));
  const { buckets, width } = cell.params;
  const ms = modp(tms, 1000), sec = Math.floor(modp(tms, 60000) / 1000), min = Math.floor(modp(tms, 3600000) / 60000), hr = Math.floor(modp(tms, 86400000) / 3600000);
  const parts = [
    part('ms', centreOf(ms / 1000, buckets), buckets, width),
    part('s', centreOf(sec / 60, buckets), buckets, width),
    part('min', centreOf(min / 60, buckets), buckets, width),
    part('h', centreOf(hr / 24, buckets), buckets, width),
  ];
  return [{ kind: 'hv', data: S.bundle(parts) }];
}

// ---------------------------------------------------------------- hv.bundle
// bench/speed.mjs --arm profile counted the organism's own inboxes: 8.81% of 66422 calls
// carry one weight for every member and 0% carry weight 1, so 91.19% of calls are a genuine
// weighted sum that the unweighted majority kernel would answer differently. The weighted
// kernel in core/simd.mjs (wbundle) accumulates in f64x2 lanes, member by member, the same
// IEEE additions in the same order as the loop below, so the double in every lane is the
// same bit for bit, and with it the sign and the tie. Members that live in the heap are
// read in place; the result is written into a fresh slot. The loops below stay as the
// fallback when the kernel declines (a width that is not a multiple of 16, more than 1024
// members, or a heap that is absent) and as the A/B: BRAIN_BUNDLE_AB=blocked puts the
// blocked loop back, =interchanged the lane-outside loop.
//
// The blocked loop reads memory in blocks. bench/speed.mjs --arm bundlekernel times five loops that produce
// the same lanes in the same order at the member counts this organism actually uses (mean
// 5.12, max 18): lane-outside-member-inside, member-outside-lane-inside, both of those over
// a flattened copy, and this one, which cuts the lanes into 1024 lane blocks so the
// accumulator for a block stays in L1 across all k members. Blocked won every member count
// from 2 to 16, by 1.22x to 1.31x over the lane-outside loop this file used to ship.
//
// The order of the additions per lane is unchanged (sender 0, then 1, then 2), which is
// what keeps this bit for bit identical: floating point addition is not associative, and a
// lane that sums to exactly zero is the lane core resolves with the tie vector. Blocking
// reorders lanes against each other, never the terms within a lane.
//
// The A/B is left in, behind an environment variable read once at load, because the choice
// is a claim about this machine and the next person should be able to re-run it rather than
// believe it: BRAIN_BUNDLE_AB=interchanged node bench/speed.mjs --arm profile --ticks 30
// puts the old loop back. Three runs each, ns per hv.bundle call, on the organism:
// interchanged 83272 / 78258 / 86541, blocked 71246 / 65515 / 74555, and the two sets do
// not overlap.
const BLOCK = 1024;
const AB = process.env.BRAIN_BUNDLE_AB || '';
let ACC = null;
function acc(len) { if (!ACC || ACC.length < len) ACC = new Float64Array(len); return ACC; }

function hvBundle(ins) {
  const m = ins[0], k = m.length;
  if (!k) return [null];
  const first = m[0].sig.data, n = first.length;
  const data = new Array(k), w = new Float64Array(k);
  for (let j = 0; j < k; j++) {
    const v = m[j].sig.data;
    if (v.length !== n) return core('hv.bundle')(ins); // a mixed width inbox is core's problem
    data[j] = v; w[j] = m[j].w > 0 ? m[j].w : 0;
  }
  const T = tie(n);
  if (!AB && SIMD.fits(n)) {
    const r = SIMD.wbundleSimd(data, w, T);
    // a lane is +1/-1 where the sum is not zero and first * T where it is: bipolar when first is
    if (r) { if (S.isBipolar(first)) S.markBipolar(r); return [{ kind: 'hv', data: r }]; }
  }
  const out = S.hvAlloc(n);
  if (k === 1) {
    const v = data[0], w0 = w[0];
    for (let i = 0; i < n; i++) { const a = v[i] * w0; out[i] = a > 0 ? 1 : a < 0 ? -1 : (first[i] * T[i] || 1); }
    return [{ kind: 'hv', data: out }];
  }
  if (AB === 'interchanged') {
    for (let i = 0; i < n; i++) {
      let a = 0;
      for (let j = 0; j < k; j++) a += data[j][i] * w[j];
      out[i] = a > 0 ? 1 : a < 0 ? -1 : (first[i] * T[i] || 1);
    }
    return [{ kind: 'hv', data: out }];
  }
  const A = acc(Math.min(BLOCK, n));
  for (let b = 0; b < n; b += BLOCK) {
    const len = Math.min(BLOCK, n - b);
    A.fill(0, 0, len);
    for (let j = 0; j < k; j++) {
      const v = data[j], wj = w[j];
      for (let i = 0; i < len; i++) A[i] += v[b + i] * wj;
    }
    for (let i = 0; i < len; i++) { const a = A[i]; out[b + i] = a > 0 ? 1 : a < 0 ? -1 : (first[b + i] * T[b + i] || 1); }
  }
  return [{ kind: 'hv', data: out }];
}

// ---------------------------------------------------------------- hv.bind
// Two members go straight to core's bind (the 16-lane kernel when both are marked bipolar,
// which every vector core makes now is). More than two members whose every vector carries
// the mark are folded through the kernel, each intermediate's slot released as soon as the
// next product exists. Anything else (an unmarked or non-bipolar member) is one scalar pass
// that truncates to int8 at each step exactly as a store into an Int8Array would, so the
// result is identical for the inputs the kernel path refuses.
function hvBind(ins) {
  const m = ins[0], k = m.length;
  if (!k) return [null];
  const first = m[0].sig.data, n = first.length;
  if (k === 1) return [{ kind: 'hv', data: first }]; // core's bindMany returns list[0] itself
  const data = new Array(k);
  let marked = true;
  for (let j = 0; j < k; j++) { const v = m[j].sig.data; if (v.length !== n) return core('hv.bind')(ins); data[j] = v; if (!S.isBipolar(v)) marked = false; }
  if (k === 2) return [{ kind: 'hv', data: S.bind(first, data[1]) }];
  if (marked && SIMD.fits(n)) {
    let out = S.bind(first, data[1]);
    for (let j = 2; j < k; j++) { const next = S.bind(out, data[j]); S.release(out); out = next; }
    return [{ kind: 'hv', data: out }];
  }
  const out = S.hvAlloc(n);
  for (let i = 0; i < n; i++) {
    let p = first[i];
    for (let j = 1; j < k; j++) p = ((p * data[j][i]) << 24) >> 24;
    out[i] = p;
  }
  return [{ kind: 'hv', data: out }];
}

// ---------------------------------------------------------------- hv.permute
// A roll is two block copies. core writes out[(i + s) % n] = a[i] one lane at a time, which
// is 8192 modulo operations and 8192 scattered stores for a move that the memory system
// can do in two.
function hvPermute(ins, cell) {
  const m = ins[0];
  if (!m.length) return [null];
  const a = m[m.length - 1].sig.data, n = a.length;
  const k = cell.params.k, s = ((k % n) + n) % n;
  const out = S.hvAlloc(n);
  out.set(a.subarray(0, n - s), s);
  if (s) out.set(a.subarray(n - s), 0);
  if (S.isBipolar(a)) S.markBipolar(out); // the same lanes in another order
  return [{ kind: 'hv', data: out }];
}

// ---------------------------------------------------------------- encode.vec
// A random projection: 8192 rows of nin float32 weights, one dot product per row, sign of
// the result. The profile arm measured 180167 ns per call, which is 2.75 ns for every one
// of the 8192 * nin multiply adds, roughly three times what the same arm measures for a
// plain weighted lane sum. The arithmetic is not the cost. The input read is: the kind
// writes `x[j] || 0` inside the inner loop, so every one of those multiply adds re-reads a
// Float32Array at an index that may be past its end, takes the undefined branch, and runs
// the falsy test that also has to map NaN and -0 to +0.
//
// The kernel reads the input once into a dense row of nin doubles, with the same falsy test
// per element, and then the inner loop is two typed array reads and a multiply add. Same
// terms, same order, same float64 accumulation, so the sign of every row is the same bit.
const ROW = new Float64Array(64);
function encodeVec(ins, cell) {
  const m = ins[0];
  if (!m.length) return [null];
  const x = m[m.length - 1].sig.data, nin = cell.params.nin, M = cell.state.M, D = S.D;
  const xs = nin <= ROW.length ? ROW : new Float64Array(nin);
  for (let j = 0; j < nin; j++) { const v = x[j]; xs[j] = v || 0; }
  const out = S.hvAlloc(D);
  for (let i = 0, row = 0; i < D; i++, row += nin) {
    let a = 0;
    for (let j = 0; j < nin; j++) a += M[row + j] * xs[j];
    out[i] = a >= 0 ? 1 : -1;
  }
  S.markBipolar(out); // every lane was just written +1 or -1
  return [{ kind: 'hv', data: out }];
}

function core(name) { return originals.get(name); }

const IMPL = { 'encode.time': encodeTime, 'encode.vec': encodeVec, 'hv.bundle': hvBundle, 'hv.bind': hvBind, 'hv.permute': hvPermute };

/**
 * Swap the accelerated compute into the named kinds. Returns the list actually installed.
 * Calling twice is a no-op for kinds already installed.
 * @param {{ kinds?: string[] }} [opts]
 */
export function install({ kinds = KERNELS } = {}) {
  const done = [];
  for (const name of kinds) {
    if (!IMPL[name] || !hasKind(name) || originals.has(name)) continue;
    const k = getKind(name);
    originals.set(name, k.compute);
    k.compute = IMPL[name];
    done.push(name);
  }
  return done;
}

/** Put every original compute back. Returns the list restored. */
export function uninstall() {
  const done = [];
  for (const [name, fn] of originals) { getKind(name).compute = fn; done.push(name); }
  originals.clear();
  return done;
}

export function installed() { return [...originals.keys()]; }
export function tableSize() { return { timeParts: timeParts.size, timeRoles: timeRoles.size, bytes: (timeParts.size + timeRoles.size) * S.D }; }
