// bench/speed.mjs : HOW MUCH FASTER, AND HOW FAR FROM 100x.
//
// Four arms, each in its own process so that no arm's JIT state, heap or garbage collector
// history is measured inside another one:
//
//   baseline   the organism exactly as it loads: core Brain, core cell kinds
//   kernels    core Brain, runtime/kernels.mjs installed
//   fast       runtime/fast.mjs FastBrain, runtime/kernels.mjs installed
//   cluster W  runtime/cluster.mjs on W worker shards with the region partition from
//              runtime/partition.mjs, kernels installed inside every shard
//
// Every arm reports ticks/s and runs/s over the same number of ticks on the same organism,
// after the same warm up. The accounting at the end multiplies only numbers these arms
// printed, and states the gap to 100x with the next lever named. Nothing is extrapolated.
//
//   node bench/speed.mjs [--organism organism/gen-0] [--ticks 50] [--warm 5]
//                        [--shards 1,2,4,8,16,32] [--verify 4] [--skip-baseline]
//
// --verify W also runs W shards for --ticks ticks and compares the per cell fire count
// against the single process arm, cell by cell.
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir, availableParallelism } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const argv = process.argv.slice(2);
const arg = (name, dflt) => { const i = argv.indexOf('--' + name); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : dflt; };
const has = (name) => argv.includes('--' + name);

const ORGANISM = arg('organism', 'organism/gen-0');
const TICKS = Number(arg('ticks', 50));
const WARM = Number(arg('warm', 5));
const SHARDS = String(arg('shards', '1,2,4,8,16,32')).split(',').map(Number).filter(Boolean);
const VERIFY = Number(arg('verify', 4));
// every kind the organism seed uses: grid.* and seq.fit register only through cells/all.mjs
const CELLS_URL = pathToFileURL(path.join(ROOT, 'cells/all.mjs')).href;

const rate = (n, seconds) => (seconds > 0 ? (n / seconds >= 100 ? Math.round(n / seconds) : +(n / seconds).toFixed(3)) : 0);

// ---------------------------------------------------------------- one arm, in process
async function loadOrganismBrain() {
  const { loadFrom } = await import(pathToFileURL(path.join(ROOT, 'genome/load.mjs')).href);
  const dir = path.isAbsolute(ORGANISM) ? ORGANISM : path.join(ROOT, ORGANISM);
  const t0 = process.hrtime.bigint();
  const { brain, manifest, meta } = await loadFrom(dir);
  return { brain, manifest, meta, loadSeconds: Number(process.hrtime.bigint() - t0) / 1e9 };
}

// One tick per turn of the event loop, which is how cli/run.mjs drives a live brain (it
// awaits between chunks) and how a cluster shard already runs (one message per tick). It
// matters for one thing: a hypervector slot in core/simd.mjs's heap is returned by a
// FinalizationRegistry, and node runs those callbacks only when the loop turns. Measured
// before this loop existed: 0 callbacks inside a 411 ms synchronous loop, 188416 after one
// setImmediate. A bench that ticked 50 times without yielding would be measuring a heap that
// can never be reclaimed, which is not the runtime anyone runs.
const turn = () => new Promise((r) => setImmediate(r));
async function tickYield(brain, n) { for (let i = 0; i < n; i++) { brain.tick(1); await turn(); } }

async function timeTicks(brain, ticks, warm, afterWarm) {
  await tickYield(brain, warm);
  if (afterWarm) afterWarm(brain);
  const before = { ...brain.stats };
  const t0 = process.hrtime.bigint();
  await tickYield(brain, ticks);
  const seconds = Number(process.hrtime.bigint() - t0) / 1e9;
  const s = brain.stats;
  return {
    seconds: +seconds.toFixed(3), ticks, tickLoop: 'one tick per event loop turn',
    runs: s.runs - before.runs, signals: s.signals - before.signals, delivered: s.delivered - before.delivered,
    grown: s.grown - before.grown, errors: s.errors - before.errors, refused: s.refused - before.refused,
    ticksPerSec: rate(ticks, seconds), runsPerSec: rate(s.runs - before.runs, seconds),
    deliveriesPerSec: rate(s.delivered - before.delivered, seconds),
    // The workload, not the speed: how much this arm actually had to do per tick. Two arms
    // are only comparable on runs/s when these agree.
    runsPerTick: +((s.runs - before.runs) / ticks).toFixed(1),
    deliveredPerTick: +((s.delivered - before.delivered) / ticks).toFixed(1),
  };
}

function fireCounts(brain) {
  const n = brain.cells.length, runs = new Int32Array(n), fired = new Int32Array(n);
  for (let i = 0; i < n; i++) { runs[i] = brain.cells[i].stats.runs; fired[i] = brain.cells[i].stats.fired; }
  return { runs, fired };
}

// The hypervector heap's own counters (core/signal.mjs heapStats), when the core in this
// tree has one: slots in use, the peak, and how many allocations fell back to a plain
// Int8Array because the heap was full. An older core returns null here and the arm prints
// nothing, which is what lets one bench file run both the old and the new code.
async function heapStatsOf() {
  const S = await import(pathToFileURL(path.join(ROOT, 'core/signal.mjs')).href);
  return typeof S.heapStats === 'function' ? S.heapStats() : null;
}
// A cluster's shards are worker threads; each one appends its counters to the file named
// by BRAIN_HV_HEAP_REPORT (every 4096 allocations and on every heap full transition, from
// core/signal.mjs itself, because terminate() runs no exit hook in a worker). The last line
// per thread is that shard's final reading, and this sums them.
function heapReportOf(file) {
  if (!file || !existsSync(file)) return null;
  const last = new Map();
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try { const j = JSON.parse(line); last.set(j.tid, j); } catch { /* a torn line from a thread mid write */ }
  }
  if (!last.size) return null;
  const rows = [...last.values()];
  const sum = (k) => rows.reduce((a, r) => a + (r[k] || 0), 0);
  // the same field names heapStats() uses in one thread, so heapLine reads either
  return {
    threads: rows.length, capacityBytes: rows[0].capacityBytes, slots: sum('slots'),
    inUse: sum('inUse'), peak: sum('peak'), maxPeakOneThread: Math.max(...rows.map(r => r.peak || 0)),
    allocs: sum('allocs'), fallbacks: sum('fallbacks'), reclaimed: sum('reclaimed'), released: sum('released'), copiedIn: sum('copiedIn'),
    fallbackPct: sum('allocs') + sum('fallbacks') ? +(100 * sum('fallbacks') / (sum('allocs') + sum('fallbacks'))).toFixed(2) : 0,
  };
}
function heapLine(o) {
  const h = o.heap;
  if (!h) return;
  console.log('  hv heap' + (h.threads ? ' over ' + h.threads + ' shard threads' : '') + ': capacity=' + (h.capacityBytes / 1048576).toFixed(0) + 'MB slots=' + h.slots + ' inUse=' + h.inUse
    + ' peak=' + h.peak + (h.maxPeakOneThread !== undefined ? ' (largest one thread ' + h.maxPeakOneThread + ')' : '')
    + ' allocs=' + h.allocs + ' fallbacks=' + h.fallbacks + ' (' + h.fallbackPct + '%) reclaimed=' + h.reclaimed + ' released=' + h.released + ' copiedIn=' + h.copiedIn);
}

// Which cell kinds the organism actually spends its runs on, and how many of those runs
// belong to a kind that core/substrate.mjs could hold as a dense unit. A kind is counted
// dense-shaped here when every one of its ports carries only scalar payloads (num, event,
// sym): a hypervector or a vec port means per run allocation of 8192 bytes, which is the
// thing a struct-of-arrays substrate cannot do. This is a property of the kind registry,
// read after the organism is loaded, plus a per cell run count measured over the same
// window as the speed numbers. It prices the substrate lever; it does not build it.
const SCALAR = new Set(['num', 'event', 'sym']);
async function kindMix(brain, beforeRuns) {
  const { getKind } = await import(pathToFileURL(path.join(ROOT, 'core/cell.mjs')).href);
  const K = (await import(pathToFileURL(path.join(ROOT, 'runtime/kernels.mjs')).href)).KERNELS;
  const by = new Map();
  for (let i = 0; i < brain.cells.length; i++) {
    const c = brain.cells[i], k = c.kind;
    let e = by.get(k);
    if (!e) {
      const def = getKind(k);
      const ports = [...def.ports.in, ...def.ports.out];
      e = {
        kind: k, cells: 0, runs: 0, fired: 0,
        dense: ports.every(p => p.kinds.every(x => SCALAR.has(x))),
        kernelled: K.includes(k),
      };
      by.set(k, e);
    }
    e.cells++;
    e.runs += c.stats.runs - beforeRuns[i];
    e.fired += c.stats.fired;
  }
  const rows = [...by.values()].sort((a, b) => b.runs - a.runs);
  const total = rows.reduce((a, r) => a + r.runs, 0);
  for (const r of rows) r.share = +(100 * r.runs / total).toFixed(2);
  const denseRuns = rows.filter(r => r.dense).reduce((a, r) => a + r.runs, 0);
  const kernelledRuns = rows.filter(r => r.kernelled).reduce((a, r) => a + r.runs, 0);
  return {
    totalRuns: total, kinds: rows.length, rows,
    denseRuns, densePct: +(100 * denseRuns / total).toFixed(2),
    kernelledRuns, kernelledPct: +(100 * kernelledRuns / total).toFixed(2),
  };
}

async function armSingle(kind) {
  const { brain, loadSeconds, meta } = await loadOrganismBrain();
  let b = brain;
  if (kind !== 'baseline') (await import(pathToFileURL(path.join(ROOT, 'runtime/kernels.mjs')).href)).install();
  if (kind === 'fast') b = (await import(pathToFileURL(path.join(ROOT, 'runtime/fast.mjs')).href)).accelerate(brain);
  let beforeRuns = null;
  const r = await timeTicks(b, TICKS, WARM, has('kinds') ? (bb) => { beforeRuns = bb.cells.map(c => c.stats.runs); } : null);
  if (beforeRuns) r.kindMix = await kindMix(b, beforeRuns);
  const out = { arm: kind, shards: 0, cells: b.cells.length, edges: b.connectome.size(), loadSeconds: +loadSeconds.toFixed(3), ...r, seed: meta.seed ?? meta.name, heap: await heapStatsOf() };
  const dump = arg('dump', null);
  if (dump) {
    const c = fireCounts(b);
    writeFileSync(dump, Buffer.concat([Buffer.from(c.runs.buffer), Buffer.from(c.fired.buffer)]));
  }
  return out;
}

// ---------------------------------------------------------------- the profile arm
// Where the time actually goes, by cell kind. Every kind's compute is wrapped in a pair of
// hrtime reads, so the arm is slower than the real one: that is the point, it is not a
// speed arm. Two corrections make the shares honest rather than merely suggestive:
//   1. the cost of the two hrtime reads themselves is measured on this machine, in this
//      process, and calls * that cost is subtracted from every kind's total;
//   2. the total of all kinds is compared to the wall clock of the same ticks, so the line
//      says what fraction of a tick is inside cell compute at all. Nothing outside that
//      fraction can be recovered by making a cell kind faster, whatever the kernel.
async function armProfile() {
  const { brain, loadSeconds } = await loadOrganismBrain();
  (await import(pathToFileURL(path.join(ROOT, 'runtime/kernels.mjs')).href)).install();
  const K = (await import(pathToFileURL(path.join(ROOT, 'runtime/kernels.mjs')).href)).KERNELS;
  const { getKind, listKinds } = await import(pathToFileURL(path.join(ROOT, 'core/cell.mjs')).href);

  // The cost of the instrument, measured with the instrument.
  const hr = process.hrtime.bigint;
  let sink = 0n;
  const probeN = 200000;
  const p0 = hr();
  for (let i = 0; i < probeN; i++) { const a = hr(); const b = hr(); sink += b - a; }
  const probeNs = Number(hr() - p0) / probeN; // two reads plus the loop, per wrapped call
  if (sink < 0n) throw new Error('impossible');

  // hv.bundle is the kind the first profile named, so this arm also counts the shape of its
  // inbox: how many members, whether every member carries the same edge weight (a weighted
  // majority with one weight IS the unweighted majority, which is the only case core's 16
  // lane kernel can take), and whether the widths line up for that kernel.
  const bundleShape = { calls: 0, members: 0, maxMembers: 0, allWeightsEqual: 0, allWeightsOne: 0, simdShaped: 0, byK: {} };
  const tallyBundle = (ins) => {
    const m = ins && ins[0];
    if (!m || !m.length) return;
    const k = m.length, n = m[0].sig.data.length;
    bundleShape.calls++;
    bundleShape.members += k;
    if (k > bundleShape.maxMembers) bundleShape.maxMembers = k;
    const bucket = k <= 4 ? String(k) : k <= 8 ? '5-8' : k <= 16 ? '9-16' : k <= 32 ? '17-32' : k <= 64 ? '33-64' : '65+';
    bundleShape.byK[bucket] = (bundleShape.byK[bucket] || 0) + 1;
    let equal = true, ones = true, widths = true;
    const w0 = m[0].w;
    for (let j = 0; j < k; j++) {
      if (m[j].w !== w0) equal = false;
      if (m[j].w !== 1) ones = false;
      if (m[j].sig.data.length !== n) widths = false;
    }
    if (equal) bundleShape.allWeightsEqual++;
    if (ones) bundleShape.allWeightsOne++;
    if (equal && widths && w0 > 0 && k < 128 && n % 16 === 0) bundleShape.simdShaped++;
  };

  const times = new Map();
  for (const name of listKinds()) {
    const k = getKind(name);
    if (typeof k.compute !== 'function') continue;
    const orig = k.compute;
    const rec = { kind: name, calls: 0, ns: 0 };
    times.set(name, rec);
    const watch = name === 'hv.bundle';
    k.compute = function (ins, cell, ctx) {
      if (watch) tallyBundle(ins);
      const t0 = hr();
      const r = orig.call(this, ins, cell, ctx);
      rec.ns += Number(hr() - t0);
      rec.calls++;
      return r;
    };
  }
  const b = (await import(pathToFileURL(path.join(ROOT, 'runtime/fast.mjs')).href)).accelerate(brain);
  await tickYield(b, WARM);
  const before = { ...b.stats };
  const t0 = hr();
  await tickYield(b, TICKS);
  const seconds = Number(hr() - t0) / 1e9;
  const runs = b.stats.runs - before.runs;
  const heap = await heapStatsOf();

  const rows = [...times.values()].filter(r => r.calls > 0).map(r => {
    const net = Math.max(0, r.ns - r.calls * probeNs);
    const def = getKind(r.kind);
    const ports = [...def.ports.in, ...def.ports.out];
    return {
      kind: r.kind, calls: r.calls, rawMs: +(r.ns / 1e6).toFixed(1), netMs: +(net / 1e6).toFixed(1),
      nsPerCall: +(net / r.calls).toFixed(0),
      dense: ports.every(p => p.kinds.every(x => SCALAR.has(x))),
      kernelled: K.includes(r.kind),
    };
  }).sort((a, b2) => b2.netMs - a.netMs);
  const totalNet = rows.reduce((a, r) => a + r.netMs, 0);
  const denseNet = rows.filter(r => r.dense).reduce((a, r) => a + r.netMs, 0);
  const kernelledNet = rows.filter(r => r.kernelled).reduce((a, r) => a + r.netMs, 0);
  const wallMs = seconds * 1000;
  for (const r of rows) r.share = +(100 * r.netMs / totalNet).toFixed(2);
  return {
    arm: 'profile', shards: 0, cells: b.cells.length, loadSeconds: +loadSeconds.toFixed(3),
    ticks: TICKS, seconds: +seconds.toFixed(3), runs, heap,
    instrumentNsPerCall: +probeNs.toFixed(1),
    computeMs: +totalNet.toFixed(1), wallMs: +wallMs.toFixed(1),
    computeShareOfTickPct: +(100 * totalNet / wallMs).toFixed(1),
    denseMs: +denseNet.toFixed(1), denseShareOfComputePct: +(100 * denseNet / totalNet).toFixed(2),
    kernelledMs: +kernelledNet.toFixed(1), kernelledShareOfComputePct: +(100 * kernelledNet / totalNet).toFixed(2),
    bundleShape: {
      calls: bundleShape.calls,
      meanMembers: bundleShape.calls ? +(bundleShape.members / bundleShape.calls).toFixed(2) : 0,
      maxMembers: bundleShape.maxMembers,
      laneOps: bundleShape.members * 8192,
      allWeightsEqualPct: bundleShape.calls ? +(100 * bundleShape.allWeightsEqual / bundleShape.calls).toFixed(2) : 0,
      allWeightsOnePct: bundleShape.calls ? +(100 * bundleShape.allWeightsOne / bundleShape.calls).toFixed(2) : 0,
      simdShapedPct: bundleShape.calls ? +(100 * bundleShape.simdShaped / bundleShape.calls).toFixed(2) : 0,
      byK: bundleShape.byK,
    },
    rows,
  };
}

// ---------------------------------------------------------------- the hv.bundle arm
// The profile arm names one kind as the majority of all compute time. This one takes that
// kind's one primitive apart on this machine, at the member counts the organism uses, and
// prints three numbers per count:
//   fresh   core's bundle() on members it has never seen. Its SIMD path is guarded by a
//           bipolar() check that walks every lane of every member, and the cache that
//           remembers the answer is keyed on the vector object, so fresh members pay it.
//   warm    the same call on members bundle() has already checked once.
//   simd    core's own 16 lane kernel called directly, which is the work itself.
// If fresh is far above warm, the guard costs more than the kernel and the lever is the
// guard, not the kernel.
async function armHvBundle() {
  const S = await import(pathToFileURL(path.join(ROOT, 'core/signal.mjs')).href);
  const SIMD = await import(pathToFileURL(path.join(ROOT, 'core/simd.mjs')).href);
  const { RNG } = await import(pathToFileURL(path.join(ROOT, 'core/rng.mjs')).href);
  const D = S.D, TIE = S.hvRandom(new RNG('bundle:tie'), D);
  const hr = process.hrtime.bigint;
  const rng = new RNG('bench:hvbundle');
  const make = (k) => Array.from({ length: k }, () => S.hvRandom(rng, D));
  const reps = 200;
  const rows = [];
  for (const k of [2, 4, 8, 16, 32, 64]) {
    // fresh: a different set of members every call, which is what a live brain hands it
    const fresh = Array.from({ length: reps }, () => make(k));
    let t0 = hr();
    for (let i = 0; i < reps; i++) S.bundle(fresh[i]);
    const freshUs = Number(hr() - t0) / 1e3 / reps;
    const one = make(k);
    S.bundle(one); // warm the bipolar cache for these members
    t0 = hr();
    for (let i = 0; i < reps; i++) S.bundle(one);
    const warmUs = Number(hr() - t0) / 1e3 / reps;
    t0 = hr();
    for (let i = 0; i < reps; i++) SIMD.bundleSimd(one, TIE);
    const simdUs = Number(hr() - t0) / 1e3 / reps;
    // the guard on its own: one scan of k * D lanes
    const fresh2 = Array.from({ length: reps }, () => make(k));
    t0 = hr();
    let acc = 0;
    for (let i = 0; i < reps; i++) for (const v of fresh2[i]) { for (let j = 0; j < D; j++) if (v[j] !== 1 && v[j] !== -1) { acc++; break; } }
    const scanUs = Number(hr() - t0) / 1e3 / reps;
    rows.push({ members: k, freshUs: +freshUs.toFixed(2), warmUs: +warmUs.toFixed(2), simdUs: +simdUs.toFixed(2), scanUs: +scanUs.toFixed(2), guardShare: +(100 * (freshUs - warmUs) / freshUs).toFixed(1), checked: acc });
  }
  return { arm: 'hvbundle', shards: 0, D, simdAvailable: SIMD.available, reps, rows };
}

// ---------------------------------------------------------------- the bundle kernel arm
// The profile arm says hv.bundle is the majority of all compute time, and it also says the
// 16 lane majority kernel cannot have it: only 8.81% of calls carry one weight for every
// member, and 0% carry weight 1, so 91% of calls are a genuine weighted sum that core's
// unweighted kernel would answer differently. That leaves the scalar loop, and the question
// becomes how the scalar loop reads memory. This arm times five loops that all compute the
// same lanes in the same order (member 0, then 1, then 2, which is what keeps a lane that
// sums to exactly zero landing on the tie rule):
//   interchanged  what runtime/kernels.mjs ships: lane outside, member inside, so the inner
//                 step jumps a whole vector in memory and every member is a separate
//                 JS array element load.
//   accum         member outside, lane inside, into a Float64Array accumulator. Both
//                 streams are sequential; the accumulator is written k times.
//   blocked       the same, but the lanes are cut into blocks that fit in L1, so the
//                 accumulator for a block stays hot across all k members.
//   flat          interchanged, but the members are first copied into one Int8Array, so the
//                 inner load is one typed array, not k of them.
//   flatBlocked   blocked over that same flat copy.
// The identity of the output is checked lane for lane against the shipped loop before any
// of them are timed, so a faster row is only reported if it is the same answer.
async function armBundleKernel() {
  const S = await import(pathToFileURL(path.join(ROOT, 'core/signal.mjs')).href);
  const { RNG } = await import(pathToFileURL(path.join(ROOT, 'core/rng.mjs')).href);
  const D = S.D, T = S.hvRandom(new RNG('bundle:tie'), D);
  const hr = process.hrtime.bigint;
  const rng = new RNG('bench:bundlekernel');

  const interchanged = (data, w, k, n, first) => {
    const out = new Int8Array(n);
    for (let i = 0; i < n; i++) {
      let a = 0;
      for (let j = 0; j < k; j++) a += data[j][i] * w[j];
      out[i] = a > 0 ? 1 : a < 0 ? -1 : (first[i] * T[i] || 1);
    }
    return out;
  };
  const accum = (data, w, k, n, first) => {
    const out = new Int8Array(n), acc = new Float64Array(n);
    for (let j = 0; j < k; j++) { const v = data[j], wj = w[j]; for (let i = 0; i < n; i++) acc[i] += v[i] * wj; }
    for (let i = 0; i < n; i++) { const a = acc[i]; out[i] = a > 0 ? 1 : a < 0 ? -1 : (first[i] * T[i] || 1); }
    return out;
  };
  const blocked = (data, w, k, n, first, B = 1024) => {
    const out = new Int8Array(n), acc = new Float64Array(Math.min(B, n));
    for (let b = 0; b < n; b += B) {
      const end = Math.min(b + B, n), len = end - b;
      acc.fill(0, 0, len);
      for (let j = 0; j < k; j++) { const v = data[j], wj = w[j]; for (let i = 0; i < len; i++) acc[i] += v[b + i] * wj; }
      for (let i = 0; i < len; i++) { const a = acc[i]; out[b + i] = a > 0 ? 1 : a < 0 ? -1 : (first[b + i] * T[b + i] || 1); }
    }
    return out;
  };
  const flatten = (data, k, n) => { const f = new Int8Array(k * n); for (let j = 0; j < k; j++) f.set(data[j], j * n); return f; };
  const flat = (data, w, k, n, first) => {
    const f = flatten(data, k, n), out = new Int8Array(n);
    for (let i = 0; i < n; i++) {
      let a = 0;
      for (let j = 0; j < k; j++) a += f[j * n + i] * w[j];
      out[i] = a > 0 ? 1 : a < 0 ? -1 : (first[i] * T[i] || 1);
    }
    return out;
  };
  const flatBlocked = (data, w, k, n, first, B = 1024) => {
    const f = flatten(data, k, n), out = new Int8Array(n), acc = new Float64Array(Math.min(B, n));
    for (let b = 0; b < n; b += B) {
      const end = Math.min(b + B, n), len = end - b;
      acc.fill(0, 0, len);
      for (let j = 0; j < k; j++) { const base = j * n + b, wj = w[j]; for (let i = 0; i < len; i++) acc[i] += f[base + i] * wj; }
      for (let i = 0; i < len; i++) { const a = acc[i]; out[b + i] = a > 0 ? 1 : a < 0 ? -1 : (first[b + i] * T[b + i] || 1); }
    }
    return out;
  };
  const impls = [['interchanged', interchanged], ['accum', accum], ['blocked', blocked], ['flat', flat], ['flatBlocked', flatBlocked]];

  const reps = 300;
  const rows = [];
  let mismatches = 0;
  for (const k of [2, 3, 5, 8, 16]) {
    // a fresh set of members per rep, which is what a live inbox hands the kernel, and
    // weights that are not all equal, which is what 91.19% of the organism's calls carry
    const sets = Array.from({ length: reps }, () => {
      const data = Array.from({ length: k }, () => S.hvRandom(rng, D));
      const w = new Float64Array(k);
      for (let j = 0; j < k; j++) w[j] = 0.25 + rng.next();
      return { data, w };
    });
    const ref = interchanged(sets[0].data, sets[0].w, k, D, sets[0].data[0]);
    const row = { members: k };
    for (const [name, fn] of impls) {
      const got = fn(sets[0].data, sets[0].w, k, D, sets[0].data[0]);
      for (let i = 0; i < D; i++) if (got[i] !== ref[i]) { mismatches++; break; }
      for (let i = 0; i < reps; i++) fn(sets[i].data, sets[i].w, k, D, sets[i].data[0]); // warm
      const t0 = hr();
      for (let i = 0; i < reps; i++) fn(sets[i].data, sets[i].w, k, D, sets[i].data[0]);
      row[name] = +(Number(hr() - t0) / 1e3 / reps).toFixed(2);
    }
    row.bestName = impls.map(([n2]) => n2).reduce((a, b) => (row[b] < row[a] ? b : a));
    row.speedup = +(row.interchanged / row[row.bestName]).toFixed(2);
    row.nsPerLaneOp = +(row[row.bestName] * 1000 / (k * D)).toFixed(3);
    rows.push(row);
  }
  // The rows above have a fixed cost in them that does not move with the member count, so
  // the same call is taken apart at the organism's mean member count: the allocation of the
  // 8192 lane result, the accumulation itself, and the loop that turns the accumulator into
  // signs and resolves a zero lane with the tie vector.
  const K5 = 5;
  const parts = Array.from({ length: reps }, () => {
    const data = Array.from({ length: K5 }, () => S.hvRandom(rng, D));
    const w = new Float64Array(K5);
    for (let j = 0; j < K5; j++) w[j] = 0.25 + rng.next();
    return { data, w };
  });
  const accReady = new Float64Array(D);
  for (let i = 0; i < D; i++) accReady[i] = (i % 7) - 3;
  let sink = 0;
  const time = (fn) => { for (let i = 0; i < reps; i++) sink += fn(i) | 0; const t0 = hr(); for (let i = 0; i < reps; i++) sink += fn(i) | 0; return +(Number(hr() - t0) / 1e3 / reps).toFixed(2); };
  const allocUs = time(() => new Int8Array(D)[0]);
  const accumUs = time((r) => {
    const acc = new Float64Array(D), s = parts[r];
    for (let j = 0; j < K5; j++) { const v = s.data[j], wj = s.w[j]; for (let i = 0; i < D; i++) acc[i] += v[i] * wj; }
    return acc[0];
  });
  const signUs = time((r) => {
    const out = new Int8Array(D), first = parts[r].data[0];
    for (let i = 0; i < D; i++) { const a = accReady[i]; out[i] = a > 0 ? 1 : a < 0 ? -1 : (first[i] * T[i] || 1); }
    return out[0];
  });
  const readUs = time((r) => { const s = parts[r]; let a = 0; for (let j = 0; j < K5; j++) { const v = s.data[j]; for (let i = 0; i < D; i++) a += v[i]; } return a; });
  const decompose = { members: K5, allocUs, accumUs, signUs, readUs, blockedUs: rows.find(r => r.members === K5).blocked, sink: sink === 0 ? 0 : 1 };

  return { arm: 'bundlekernel', shards: 0, D, reps, mismatches, rows, decompose };
}

async function armCluster(W) {
  const { brain, loadSeconds, meta } = await loadOrganismBrain();
  const { Cluster, specFromBrain } = await import(pathToFileURL(path.join(ROOT, 'runtime/cluster.mjs')).href);
  const P = await import(pathToFileURL(path.join(ROOT, 'runtime/partition.mjs')).href);
  const g = P.graphFromBrain(brain);
  // --weight rate|cost|both|runs|runs+cost balances the shards by how much work their cells
  // are, not by how many cells they are. The three sources of a cell's weight, in order of
  // how much they are guesses:
  //   rate  1 / policy.period, a pure function of the spec. 68% of this organism's cells
  //         have period 'event', and for those it says nothing at all.
  //   runs  the per cell run count the single process arm already dumped for the identity
  //         check. Nothing is assumed: it is how often that exact cell ran over these ticks.
  //   cost  the per kind nanoseconds the profile arm measured on this machine, handed over
  //         in a file rather than on the command line.
  const weightMode = arg('weight', null);
  let weight = null, weightNote = null;
  if (weightMode) {
    const nsPath = arg('kindns', null);
    const wantCost = weightMode === 'cost' || weightMode === 'both' || weightMode === 'runs+cost';
    const kindNs = wantCost && nsPath && existsSync(nsPath) ? JSON.parse(readFileSync(nsPath, 'utf8')) : null;
    let base;
    if (weightMode === 'runs' || weightMode === 'runs+cost') {
      const f = arg('cellruns', null) || arg('against', null);
      if (!f || !existsSync(f)) throw new Error('--weight ' + weightMode + ' needs --cellruns or --against pointing at the per cell run dump');
      const buf = readFileSync(f), n = brain.cells.length;
      const runs = new Int32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + n * 4));
      base = new Float64Array(n);
      for (let i = 0; i < n; i++) base[i] = Math.max(0, runs[i]) * (kindNs ? (kindNs[brain.cells[i].kind] ?? 1) : 1);
    } else {
      base = P.cellWeights(brain.cells, { kindNs, eventRate: Number(arg('eventrate', 1)), useRate: weightMode !== 'cost' });
    }
    weight = P.normalizeWeights(base);
    // A shard's tick is not only its cells' compute. The tick budget splits it into compute
    // and the drain of what the other shards sent, and the drain scales with how many cells
    // and edges the shard holds, not with how expensive each of its cells is. Balancing on
    // pure compute therefore handed one shard 7.7x the mean cell count and the straggle went
    // from 11980.3us to 57316.4us. --blend f mixes the two rulers: f of a cell's weight is
    // the measured cost, 1 - f is one per cell. f = 0 is the unweighted partition exactly,
    // f = 1 is pure cost. normalizeWeights has already put the mean on 1, so the blend keeps
    // it there and the cap keeps its meaning.
    const blend = Number(arg('blend', 1));
    if (blend < 1) for (let i = 0; i < weight.length; i++) weight[i] = (1 - blend) + blend * weight[i];
    let min = Infinity, max = 0;
    for (const x of weight) { if (x < min) min = x; if (x > max) max = x; }
    weightNote = { mode: weightMode, blend, kindNs: !!kindNs, min: +min.toFixed(4), max: +max.toFixed(4) };
  }
  const part = P.partitionBrain(g, W, { passes: Number(arg('passes', 8)), slack: Number(arg('slack', 1.05)), weight });
  const spec = specFromBrain(brain, { modules: [CELLS_URL], seed: meta.seed ?? meta.name, kernels: true, name: 'speed' });
  // --cut zero is the CEILING arm: the same organism, the same partition, the same number
  // of threads and the same barrier, with every cross shard edge deleted from the spec.
  // Nothing crosses a thread boundary, so what it measures is the barrier plus the per
  // shard overhead and nothing else. It is a different brain (it has fewer edges, so it
  // delivers fewer signals) and it is never verified against one process: it is a clock,
  // not an answer. Its droppedEdges and its remaining crossMessages are printed with it.
  // What a K tick fence window would cost. A cross shard signal emitted at tick t arrives at
  // t + 1 + delay (core/connectome.mjs), so a window of K ticks needs no fence inside it
  // exactly when every cut edge has delay >= K - 1. K = minCutDelay + 1 is therefore the
  // largest exact window for this partition, and blockedAtK counts the cut edges that would
  // have to become in-shard edges to reach each larger K.
  const cutDelayHist = {};
  let cutEdgeCount = 0, minCutDelay = Infinity;
  for (const e of spec.edges) {
    if (part.of[e.src] === part.of[e.dst]) continue;
    cutEdgeCount++;
    const d = e.delay | 0;
    cutDelayHist[d] = (cutDelayHist[d] || 0) + 1;
    if (d < minCutDelay) minCutDelay = d;
  }
  const blockedAtK = {};
  for (let K = 2; K <= 8; K++) { let n = 0; for (const d of Object.keys(cutDelayHist)) if (Number(d) < K - 1) n += cutDelayHist[d]; blockedAtK[K] = n; }
  const fence = { cutEdges: cutEdgeCount, minCutDelay: Number.isFinite(minCutDelay) ? minCutDelay : null, exactK: Number.isFinite(minCutDelay) ? minCutDelay + 1 : null, cutDelayHist, blockedAtK };

  // Two ways to force the cut to zero, because they bracket the truth from both sides:
  //   --cut zero     delete every cross shard edge. Fewest assumptions, but it also deletes
  //                  those edges' deliveries and the cascade they would have started, so the
  //                  arm carries LESS work per tick than the real one. Its runs/s is an
  //                  upper bound that flatters the barrier.
  //   --cut rewire   keep every cross shard edge, with its port, weight, delay and
  //                  confidence, but move its destination to a cell of the SAME KIND inside
  //                  the source's own shard. Edge count, fan out, delays and signal types
  //                  survive, so the work per tick is close to the real arm's. An edge whose
  //                  destination kind is absent from the source shard is deleted and counted.
  // Neither is the organism, and neither is ever verified against one process: they are
  // clocks for the barrier, not answers. Both print their droppedEdges and their work/tick.
  const cutMode = arg('cut', null);
  const zeroCut = cutMode === 'zero' || cutMode === 'rewire';
  let droppedEdges = 0, rewiredEdges = 0;
  if (zeroCut) {
    const of = part.of, cells = spec.cells;
    const bucket = new Map();
    if (cutMode === 'rewire') {
      for (let i = 0; i < cells.length; i++) {
        const key = of[i] + '|' + cells[i].kind;
        let b = bucket.get(key);
        if (!b) bucket.set(key, b = []);
        b.push(i);
      }
    }
    const keep = [];
    for (const e of spec.edges) {
      if (of[e.src] === of[e.dst]) { keep.push(e); continue; }
      const b = cutMode === 'rewire' ? bucket.get(of[e.src] + '|' + cells[e.dst].kind) : null;
      if (b && b.length) {
        let dst = b[e.src % b.length];
        if (dst === e.src && b.length > 1) dst = b[(e.src + 1) % b.length]; // no new self loop
        keep.push({ ...e, dst });
        rewiredEdges++;
      } else droppedEdges++;
    }
    spec.edges = keep;
  }
  // The shard threads read this at load and append their heap counters to it; the
  // coordinator thread's own core is already loaded, and it runs no cells.
  const heapReport = path.join(tmpdir(), 'brain-hvheap-' + process.pid + '.jsonl');
  process.env.BRAIN_HV_HEAP_REPORT = heapReport;
  const c = new Cluster(spec, { shards: W, partition: part.of });
  const t0 = process.hrtime.bigint();
  await c.start();
  const startSeconds = Number(process.hrtime.bigint() - t0) / 1e9;
  await c.tick(WARM);
  const s0 = await c.stats();
  const t1 = process.hrtime.bigint();
  await c.tick(TICKS);
  const seconds = Number(process.hrtime.bigint() - t1) / 1e9;
  const s1 = await c.stats();
  let verify = null;
  const against = arg('against', null);
  if (against && existsSync(against)) {
    const buf = readFileSync(against), n = brain.cells.length;
    const wantRuns = new Int32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + n * 4));
    const wantFired = new Int32Array(buf.buffer.slice(buf.byteOffset + n * 4, buf.byteOffset + n * 8));
    const got = await c.counts();
    let runsDiff = 0, firedDiff = 0, firstDiff = null;
    for (let i = 0; i < n; i++) {
      if (got.runs[i] !== wantRuns[i]) { runsDiff++; if (firstDiff === null) firstDiff = { cell: brain.cells[i].id, idx: i, runs: [wantRuns[i], got.runs[i]] }; }
      if (got.fired[i] !== wantFired[i]) { firedDiff++; if (firstDiff === null) firstDiff = { cell: brain.cells[i].id, idx: i, fired: [wantFired[i], got.fired[i]] }; }
    }
    verify = { cells: n, runsDiff, firedDiff, identical: runsDiff === 0 && firedDiff === 0, firstDiff };
  }
  await c.stop();
  const heap = heapReportOf(heapReport);
  if (existsSync(heapReport)) rmSync(heapReport, { force: true });
  // The barrier split. Every shard accumulates the microseconds it spends inside step()
  // (drain, deliver, tick, flush, report) into the control block, so the difference across
  // the timed window divided by the ticks is that shard's compute per tick. A tick cannot
  // end before its slowest shard, so wall per tick minus the LARGEST shard busy is what the
  // fence itself costs: waiting at the barrier, the coordinator's between tick work, and
  // the wake up of 32 threads. That is a measured split, not a model.
  const busy = s1.per.map((p, i) => (p.busyUs - s0.per[i].busyUs) / TICKS);
  const drain = s1.per.map((p, i) => (p.drainUs - s0.per[i].drainUs) / TICKS);
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const wallPerTickUs = seconds * 1e6 / TICKS;
  const maxBusyUs = Math.max(...busy), minBusyUs = Math.min(...busy), meanBusyUs = sum(busy) / busy.length;
  const barrier = {
    wallPerTickUs: +wallPerTickUs.toFixed(1),
    maxShardBusyUs: +maxBusyUs.toFixed(1),
    meanShardBusyUs: +meanBusyUs.toFixed(1),
    minShardBusyUs: +minBusyUs.toFixed(1),
    maxShardDrainUs: +Math.max(...drain).toFixed(1),
    meanShardDrainUs: +(sum(drain) / drain.length).toFixed(1),
    fenceUs: +(wallPerTickUs - maxBusyUs).toFixed(1),
    fencePct: +(100 * (wallPerTickUs - maxBusyUs) / wallPerTickUs).toFixed(1),
    // How much of the slowest shard's tick the other 31 threads sat idle for, which is what
    // a better balanced partition could still take back.
    straggleUs: +(maxBusyUs - meanBusyUs).toFixed(1),
  };
  // The fence, itemised on the coordinator's own thread. dispatchUs is what is left of the
  // round trip once the slowest shard's own compute is taken out: the command out, the
  // thread wake up, the reply back. The rest is serial coordinator work that no number of
  // shards divides, so it is exactly the Amdahl term of this design.
  const ct = s1.coord, c0 = s0.coord, dt = ct.ticks - c0.ticks;
  const cd = (k) => +((ct[k] - c0[k]) / dt).toFixed(1);
  barrier.coordinator = {
    roundTripUs: cd('roundTripUs'), replyUs: cd('replyUs'), firedUs: cd('firedUs'),
    structUs: cd('structUs'), pruneUs: cd('pruneUs'),
    dispatchUs: +(cd('roundTripUs') - maxBusyUs).toFixed(1),
    serialUs: +(cd('replyUs') + cd('firedUs') + cd('structUs') + cd('pruneUs')).toFixed(1),
  };
  barrier.coordinator.serialPct = +(100 * barrier.coordinator.serialUs / wallPerTickUs).toFixed(1);
  return {
    arm: zeroCut ? 'ceiling-' + cutMode : (weightMode ? 'cluster-w-' + weightMode + (weightNote && weightNote.blend < 1 ? '-blend' + weightNote.blend : '') : 'cluster'),
    zeroCut, cutMode, droppedEdges, rewiredEdges, barrier, fence,
    weight: weightNote, weightedBalance: part.weighted ? part.weighted.after : null,
    shards: W, cells: brain.cells.length, edges: brain.connectome.size(),
    loadSeconds: +loadSeconds.toFixed(3), startSeconds: +startSeconds.toFixed(3),
    seconds: +seconds.toFixed(3), ticks: TICKS,
    runs: s1.runs - s0.runs, signals: s1.signals - s0.signals, delivered: s1.delivered - s0.delivered,
    ticksPerSec: rate(TICKS, seconds), runsPerSec: rate(s1.runs - s0.runs, seconds),
    deliveriesPerSec: rate(s1.delivered - s0.delivered, seconds),
    runsPerTick: +((s1.runs - s0.runs) / TICKS).toFixed(1),
    deliveredPerTick: +((s1.delivered - s0.delivered) / TICKS).toFixed(1),
    crossEdges: s1.crossEdges, inShardEdges: s1.inShardEdges,
    cutFraction: part.cutFractionAfter, cutBefore: part.cutFractionBefore,
    crossMessages: s1.crossMessages - s0.crossMessages, cloned: s1.cloned - s0.cloned, overflow: s1.overflow - s0.overflow,
    sharedMB: +(s1.sharedBytes / 1048576).toFixed(1), imbalance: part.balanceAfter.imbalance,
    errors: s1.errors, refused: s1.refused, verify, heap,
  };
}

// ---------------------------------------------------------------- child arm entry
const ARM = arg('arm', null);
if (ARM) {
  const run = ARM === 'cluster' ? armCluster(Number(arg('shards', 4)))
    : ARM === 'profile' ? armProfile()
    : ARM === 'hvbundle' ? armHvBundle()
    : ARM === 'bundlekernel' ? armBundleKernel()
    : armSingle(ARM);
  run.then((r) => { console.log('ARM ' + JSON.stringify(r)); }).catch((e) => { console.log('ARM ' + JSON.stringify({ arm: ARM, error: String(e && e.stack || e) })); process.exitCode = 1; });
}

// ---------------------------------------------------------------- the bench
// --hv-heap-mb N sizes core/simd.mjs's hypervector heap in every single process arm, and
// --hv-heap-mb-cluster M in every shard thread of the cluster arms (32 threads each hold
// one, and Windows charges commit for a wasm memory before it is touched: 16 memories of
// 1 GiB took 16.06 GB of commit on this machine, untouched). Unset, core's own default
// applies. Both are printed in CONDITIONS and stored in the verdict.
const HV_HEAP_MB = arg('hv-heap-mb', null), HV_HEAP_MB_CLUSTER = arg('hv-heap-mb-cluster', HV_HEAP_MB);
function child(args, label) {
  const env = { ...process.env };
  const mb = args.includes('cluster') ? HV_HEAP_MB_CLUSTER : HV_HEAP_MB;
  if (mb !== null) env.BRAIN_HV_HEAP_MB = String(mb);
  const r = spawnSync(process.execPath, ['--max-old-space-size=16384', path.join(HERE, 'speed.mjs'), ...args], { cwd: ROOT, encoding: 'utf8', timeout: 1_800_000, maxBuffer: 64 * 1024 * 1024, env });
  const out = (r.stdout || '') + (r.stderr || '');
  const line = out.split('\n').find(l => l.startsWith('ARM '));
  if (!line) throw new Error('arm ' + label + ' printed no result (exit ' + r.status + ')\n' + out.slice(-4000));
  const j = JSON.parse(line.slice(4));
  if (j.error) throw new Error('arm ' + label + ' failed: ' + j.error);
  return j;
}

function row(o) {
  const keys = ['arm', 'shards', 'ticksPerSec', 'runsPerSec', 'deliveriesPerSec', 'seconds', 'runs', 'runsPerTick', 'deliveredPerTick', 'cutFraction', 'droppedEdges', 'crossMessages', 'cloned', 'sharedMB', 'imbalance'];
  console.log(keys.filter(k => o[k] !== undefined).map(k => k + '=' + o[k]).join(' '));
}

function barrierLine(o) {
  const b = o.barrier;
  if (!b) return;
  console.log('  barrier at ' + o.shards + ' shards: wall/tick=' + b.wallPerTickUs + 'us  slowest shard busy=' + b.maxShardBusyUs
    + 'us  mean busy=' + b.meanShardBusyUs + 'us  min busy=' + b.minShardBusyUs + 'us  fence=' + b.fenceUs + 'us (' + b.fencePct
    + '% of the tick)  straggle=' + b.straggleUs + 'us  drain mean=' + b.meanShardDrainUs + 'us');
  const c = b.coordinator;
  if (c) console.log('    of which the coordinator: dispatch+wake=' + c.dispatchUs + 'us  serial=' + c.serialUs + 'us (' + c.serialPct
    + '% of the tick) = weightBack+replies ' + c.replyUs + 'us + globalFired ' + c.firedUs + 'us + structural ' + c.structUs + 'us + prune ' + c.pruneUs + 'us');
  const f = o.fence;
  if (f) console.log('  fence window at ' + o.shards + ' shards: cutEdges=' + f.cutEdges + ' minCutDelay=' + f.minCutDelay
    + ' largest exact K=' + f.exactK + '  cut edges below K=2,3,4: ' + f.blockedAtK[2] + ',' + f.blockedAtK[3] + ',' + f.blockedAtK[4]
    + '  cut delay histogram=' + JSON.stringify(f.cutDelayHist));
}

async function main() {
  if (ARM) return;
  const started = new Date().toISOString();
  console.log('CONDITIONS at=' + started + ' organism=' + ORGANISM + ' ticks=' + TICKS + ' warm=' + WARM
    + ' threads=' + availableParallelism() + ' node=' + process.version + ' platform=' + process.platform + '/' + process.arch
    + ' shardCounts=' + SHARDS.join(',') + ' armsAreSeparateProcesses=yes headlineRepeats=2'
    + ' tickLoop=one-tick-per-event-loop-turn hvHeapMB=' + (HV_HEAP_MB === null ? 'core-default' : HV_HEAP_MB) + '/' + (HV_HEAP_MB_CLUSTER === null ? 'core-default' : HV_HEAP_MB_CLUSTER) + '(cluster)'
    + ' note=other agents may be running benches on this machine');
  const results = [];
  const base = has('skip-baseline') ? null : child(['--arm', 'baseline', '--organism', ORGANISM, '--ticks', String(TICKS), '--warm', String(WARM)], 'baseline');
  if (base) { row(base); heapLine(base); results.push(base); }
  const kern = child(['--arm', 'kernels', '--organism', ORGANISM, '--ticks', String(TICKS), '--warm', String(WARM)], 'kernels');
  row(kern); heapLine(kern); results.push(kern);

  const dump = path.join(tmpdir(), 'brain-speed-fire-' + process.pid + '.bin');
  const fast = child(['--arm', 'fast', '--organism', ORGANISM, '--ticks', String(TICKS), '--warm', String(WARM), '--dump', dump, '--kinds'], 'fast');
  row(fast); heapLine(fast); results.push(fast);
  if (fast.kindMix) {
    const m = fast.kindMix;
    console.log('\nKIND MIX over the measured window (' + m.totalRuns + ' runs, ' + m.kinds + ' kinds)');
    console.log('kind                       cells       runs   share%  dense  kernelled');
    for (const r of m.rows) {
      console.log(r.kind.padEnd(24) + String(r.cells).padStart(7) + String(r.runs).padStart(11) + String(r.share).padStart(8)
        + '  ' + (r.dense ? 'yes' : 'no ').padStart(5) + '  ' + (r.kernelled ? 'yes' : 'no ').padStart(9));
    }
    console.log('  runs on kinds a dense substrate could hold: ' + m.denseRuns + ' of ' + m.totalRuns + ' = ' + m.densePct + '%');
    console.log('  runs on kinds runtime/kernels.mjs already accelerates: ' + m.kernelledRuns + ' of ' + m.totalRuns + ' = ' + m.kernelledPct + '%');
  }

  // Where the time goes, which is a different question from where the runs go.
  const prof = child(['--arm', 'profile', '--organism', ORGANISM, '--ticks', String(TICKS), '--warm', String(WARM)], 'profile');
  console.log('\nTIME INSIDE CELL COMPUTE, by kind (instrumented arm, ' + prof.seconds + 's for ' + prof.ticks + ' ticks, instrument cost '
    + prof.instrumentNsPerCall + 'ns per call already subtracted)');
  console.log('kind                          calls     net ms   ns/call   share%  dense  kernelled');
  for (const r of prof.rows.slice(0, 20)) {
    console.log(r.kind.padEnd(24) + String(r.calls).padStart(11) + String(r.netMs).padStart(11) + String(r.nsPerCall).padStart(10)
      + String(r.share).padStart(8) + '  ' + (r.dense ? 'yes' : 'no ').padStart(5) + '  ' + (r.kernelled ? 'yes' : 'no ').padStart(9));
  }
  console.log('  cell compute is ' + prof.computeMs + 'ms of a ' + prof.wallMs + 'ms window = ' + prof.computeShareOfTickPct + '% of the tick');
  console.log('  of that compute, dense shaped kinds are ' + prof.denseMs + 'ms = ' + prof.denseShareOfComputePct + '%, already kernelled kinds are ' + prof.kernelledMs + 'ms = ' + prof.kernelledShareOfComputePct + '%');
  const bs = prof.bundleShape;
  console.log('  hv.bundle inbox shape over ' + bs.calls + ' calls: mean ' + bs.meanMembers + ' members, max ' + bs.maxMembers
    + ', ' + bs.laneOps + ' lane multiply adds in the window');
  console.log('    every member the same weight: ' + bs.allWeightsEqualPct + '% of calls, every weight exactly 1: ' + bs.allWeightsOnePct
    + '%, shaped for the 16 lane majority kernel: ' + bs.simdShapedPct + '%');
  console.log('    members per call: ' + Object.entries(bs.byK).map(([k, v]) => k + '=' + v).join(' '));
  results.push({ arm: 'profile', seconds: prof.seconds, computeShareOfTickPct: prof.computeShareOfTickPct, denseShareOfComputePct: prof.denseShareOfComputePct, bundleShape: bs });
  const hv = child(['--arm', 'hvbundle'], 'hvbundle');
  console.log('\nhv.bundle TAKEN APART at D=' + hv.D + ', wasm SIMD available=' + hv.simdAvailable + ', ' + hv.reps + ' calls per cell, microseconds per call');
  console.log('members   fresh    warm    simd    lane scan   guard share of fresh');
  for (const r of hv.rows) {
    console.log(String(r.members).padStart(7) + String(r.freshUs).padStart(8) + String(r.warmUs).padStart(8) + String(r.simdUs).padStart(8)
      + String(r.scanUs).padStart(13) + String(r.guardShare).padStart(16) + '%');
  }
  results.push({ arm: 'hvbundle', rows: hv.rows });

  const bk = child(['--arm', 'bundlekernel'], 'bundlekernel');
  console.log('\nTHE WEIGHTED BUNDLE LOOP, five ways to the same lanes, microseconds per call at D=' + bk.D + ', ' + bk.reps + ' calls each, '
    + bk.mismatches + ' lanes differ from the shipped loop');
  console.log('members  interchanged   accum  blocked    flat  flatBlocked   best         speedup  ns/lane op');
  for (const r of bk.rows) {
    console.log(String(r.members).padStart(7) + String(r.interchanged).padStart(14) + String(r.accum).padStart(8) + String(r.blocked).padStart(9)
      + String(r.flat).padStart(8) + String(r.flatBlocked).padStart(13) + '   ' + r.bestName.padEnd(13) + String(r.speedup).padStart(5) + 'x'
      + String(r.nsPerLaneOp).padStart(12));
  }
  const dc = bk.decompose;
  console.log('  one call at ' + dc.members + ' members taken apart: allocate the result ' + dc.allocUs + 'us, read the members ' + dc.readUs
    + 'us, multiply and accumulate ' + dc.accumUs + 'us, sign and tie ' + dc.signUs + 'us, whole blocked call ' + dc.blockedUs + 'us');
  results.push({ arm: 'bundlekernel', rows: bk.rows, decompose: dc, mismatches: bk.mismatches });

  const nsPath = path.join(tmpdir(), 'brain-speed-kindns-' + process.pid + '.json');
  writeFileSync(nsPath, JSON.stringify(Object.fromEntries(prof.rows.map(r => [r.kind, r.nsPerCall]))));

  const clusterRows = [];
  for (const W of SHARDS) {
    const args = ['--arm', 'cluster', '--shards', String(W), '--organism', ORGANISM, '--ticks', String(TICKS), '--warm', String(WARM)];
    if (W === VERIFY) args.push('--against', dump);
    const r = child(args, 'cluster' + W);
    row(r); results.push(r); clusterRows.push(r);
    barrierLine(r); heapLine(r);
    if (r.verify) console.log('  verify vs single process at ' + W + ' shards: cells=' + r.verify.cells + ' runsDiff=' + r.verify.runsDiff + ' firedDiff=' + r.verify.firedDiff + ' identical=' + r.verify.identical + (r.verify.firstDiff ? ' first=' + JSON.stringify(r.verify.firstDiff) : ''));
  }
  // ------------------------------------------------- the headline arm, twice, and the ceiling
  // Other agents run benches on this machine, so the headline arm is repeated and both
  // numbers are printed. The ceiling is the same arm with every cross shard edge deleted:
  // the fastest this many threads can possibly go behind this barrier.
  const HEAD = SHARDS[SHARDS.length - 1];
  const headArgs = ['--arm', 'cluster', '--shards', String(HEAD), '--organism', ORGANISM, '--ticks', String(TICKS), '--warm', String(WARM)];
  const repeat = child(headArgs, 'cluster' + HEAD + ' repeat');
  repeat.arm = 'cluster-repeat';
  row(repeat); results.push(repeat); barrierLine(repeat); heapLine(repeat);
  const ceilingDelete = child([...headArgs, '--cut', 'zero'], 'ceiling-zero' + HEAD);
  row(ceilingDelete); results.push(ceilingDelete); barrierLine(ceilingDelete);
  const ceiling = child([...headArgs, '--cut', 'rewire'], 'ceiling-rewire' + HEAD);
  row(ceiling); results.push(ceiling); barrierLine(ceiling);
  const head1 = clusterRows.find(r => r.shards === HEAD);
  console.log('  headline spread at ' + HEAD + ' shards: run 1 = ' + (head1 ? head1.runsPerSec : 'n/a') + ' runs/s, run 2 = ' + repeat.runsPerSec + ' runs/s'
    + (head1 ? ', ratio ' + (repeat.runsPerSec / head1.runsPerSec).toFixed(3) : ''));

  // ------------------------------------------------- balancing work instead of cells
  // The straggle line above says the shards finish at very different times while their cell
  // counts are balanced to 1.05. These arms balance the partition by cell weight instead,
  // and each one is verified cell by cell against the single process run, because a
  // different partition is only allowed to change the speed, never the brain.
  const weightArms = [];
  const weightPlan = [['rate', 1], ['both', 1], ['runs', 1], ['runs+cost', 1], ['runs+cost', 0.25], ['runs+cost', 0.5], ['runs+cost', 0.75]];
  for (const [mode, blend] of weightPlan) {
    const label = 'weight=' + mode + (blend < 1 ? ' blend=' + blend : '');
    const r = child([...headArgs, '--weight', mode, '--blend', String(blend), '--kindns', nsPath, '--against', dump], 'cluster' + HEAD + ' ' + label);
    row(r); barrierLine(r); results.push(r); weightArms.push(r);
    if (r.weight) console.log('  weights: mode=' + r.weight.mode + ' blend=' + r.weight.blend + ' measuredKindCost=' + r.weight.kindNs + ' lightest cell=' + r.weight.min + ' heaviest=' + r.weight.max
      + ' weighted imbalance after=' + (r.weightedBalance ? r.weightedBalance.imbalance : 'n/a') + ' cell count imbalance=' + r.imbalance);
    if (r.verify) console.log('  verify vs single process: cells=' + r.verify.cells + ' runsDiff=' + r.verify.runsDiff + ' firedDiff=' + r.verify.firedDiff + ' identical=' + r.verify.identical + (r.verify.firstDiff ? ' first=' + JSON.stringify(r.verify.firstDiff) : ''));
    if (head1) console.log('  vs the unweighted headline: runs/s ' + head1.runsPerSec + ' to ' + r.runsPerSec + ' = ' + (r.runsPerSec / head1.runsPerSec).toFixed(3)
      + 'x, straggle ' + head1.barrier.straggleUs + 'us to ' + r.barrier.straggleUs + 'us, cut ' + (100 * head1.cutFraction).toFixed(1) + '% to ' + (100 * r.cutFraction).toFixed(1) + '%');
  }
  if (existsSync(dump)) rmSync(dump, { force: true });
  if (existsSync(nsPath)) rmSync(nsPath, { force: true });

  // ---------------------------------------------------------------- the table
  const one = clusterRows.find(r => r.shards === 1);
  console.log('\nSHARD SPEEDUP TABLE (runs/s, and the speedup over 1 shard of the same runtime)');
  console.log('shards  ticks/s     runs/s   speedup   cut%   crossMsg   cloned');
  for (const r of clusterRows) {
    const sp = one ? +(r.runsPerSec / one.runsPerSec).toFixed(2) : null;
    console.log(String(r.shards).padStart(6) + '  ' + String(r.ticksPerSec).padStart(7) + '  ' + String(r.runsPerSec).padStart(9) + '  ' + String(sp === null ? 'n/a' : sp + 'x').padStart(8) + '  ' + (100 * r.cutFraction).toFixed(1).padStart(5) + '  ' + String(r.crossMessages).padStart(9) + '  ' + String(r.cloned).padStart(7));
  }

  // ---------------------------------------------------------------- the accounting
  // The best real arm, which may be a weighted one: the accounting quotes what was measured
  // to be fastest while still verified identical to one process, never the prettiest row.
  const best = [...clusterRows, repeat, ...weightArms].reduce((a, b) => (b.runsPerSec > a.runsPerSec ? b : a), clusterRows[0]);
  const hot = base ? +(fast.runsPerSec / base.runsPerSec).toFixed(3) : null;
  const shardMult = one ? +(best.runsPerSec / one.runsPerSec).toFixed(3) : null;
  const product = hot !== null && shardMult !== null ? +(hot * shardMult).toFixed(3) : null;
  const endToEnd = base ? +(Math.max(best.runsPerSec, fast.runsPerSec) / base.runsPerSec).toFixed(3) : null;
  const acc = {
    baselineRunsPerSec: base ? base.runsPerSec : null,
    baselineTicksPerSec: base ? base.ticksPerSec : null,
    optimisedSingleRunsPerSec: fast.runsPerSec,
    optimisedSingleTicksPerSec: fast.ticksPerSec,
    hotPathMultiplier: hot,
    bestShardCount: best.shards, bestShardRunsPerSec: best.runsPerSec,
    oneShardRunsPerSec: one ? one.runsPerSec : null,
    shardMultiplier: shardMult,
    product,
    measuredEndToEnd: endToEnd,
    gapTo100x: product ? +(100 / product).toFixed(2) : null,
    // The ceiling: the same threads and the same barrier with nothing crossing a thread.
    // perfectLinear is HEAD copies of the measured single process arm, which is what
    // HEAD threads would do with no barrier and no communication at all.
    ceilingMode: ceiling.cutMode,
    ceilingShards: ceiling.shards,
    ceilingRunsPerSec: ceiling.runsPerSec,
    ceilingTicksPerSec: ceiling.ticksPerSec,
    ceilingDroppedEdges: ceiling.droppedEdges,
    ceilingRewiredEdges: ceiling.rewiredEdges,
    ceilingDeleteRunsPerSec: ceilingDelete.runsPerSec,
    ceilingDeleteTicksPerSec: ceilingDelete.ticksPerSec,
    ceilingDeleteDroppedEdges: ceilingDelete.droppedEdges,
    ceilingOverOneShard: one ? +(ceiling.runsPerSec / one.runsPerSec).toFixed(3) : null,
    perfectLinearRunsPerSec: ceiling.shards * fast.runsPerSec,
    ceilingOfPerfectLinear: +(100 * ceiling.runsPerSec / (ceiling.shards * fast.runsPerSec)).toFixed(1),
    realOfCeiling: +(100 * best.runsPerSec / ceiling.runsPerSec).toFixed(1),
    barrierAtHead: ceiling.barrier ? { real: (clusterRows.find(r => r.shards === ceiling.shards) || {}).barrier, zeroCut: ceiling.barrier } : null,
    headlineRepeatRunsPerSec: repeat.runsPerSec,
    // A tick of the ceiling arm is not a tick of the real arm: deleting the cross edges
    // deletes their deliveries, so the ceiling is a lighter brain. These are the workloads
    // themselves, so that anyone reading runs/s can see what each arm was carrying.
    runsPerTick: { single: fast.runsPerTick, best: best.runsPerTick, ceiling: ceiling.runsPerTick },
    deliveredPerTick: { single: fast.deliveredPerTick, best: best.deliveredPerTick, ceiling: ceiling.deliveredPerTick },
    // Microseconds of wall clock per cell run, which is the one rate that survives the
    // workload difference: it is time divided by the work actually done.
    usPerRun: {
      baseline: base ? +(1e6 / base.runsPerSec).toFixed(3) : null,
      single: +(1e6 / fast.runsPerSec).toFixed(3),
      best: +(1e6 / best.runsPerSec).toFixed(3),
      ceiling: +(1e6 / ceiling.runsPerSec).toFixed(3),
    },
    ceilingSpeedupPerRun: +(fast.runsPerSec === 0 ? 0 : ceiling.runsPerSec / fast.runsPerSec).toFixed(3),
    // The arithmetic of 100x itself, on this machine, with these threads.
    needFor100xRunsPerSec: base ? base.runsPerSec * 100 : null,
    perfectLinearOverBaseline: base ? +(ceiling.shards * fast.runsPerSec / base.runsPerSec).toFixed(2) : null,
    ceilingOverBaseline: base ? +(ceiling.runsPerSec / base.runsPerSec).toFixed(2) : null,
    shardingCanReach100x: base ? (ceiling.shards * fast.runsPerSec >= base.runsPerSec * 100) : null,
    // The efficiency question, which is the one the ceiling actually answers: to reach 100x
    // of baseline from the optimised single process, HEAD threads would have to hold this
    // fraction of perfect linear. The ceiling is the fraction they hold with NOTHING
    // crossing a thread. If the second is below the first, no partitioner can close the gap.
    efficiencyNeededFor100xPct: base ? +(100 * (base.runsPerSec * 100 / fast.runsPerSec) / ceiling.shards).toFixed(1) : null,
    ceilingEfficiencyPct: +(100 * ceiling.runsPerSec / (ceiling.shards * fast.runsPerSec)).toFixed(1),
    realEfficiencyPct: +(100 * best.runsPerSec / (best.shards * fast.runsPerSec)).toFixed(1),
    nextLever: nextLever(best, clusterRows, ceiling, fast, base, weightArms, repeat),
  };
  // ------------------------------------------------- what the one remaining lever is worth
  // The ceiling says threads cannot close the gap, so the factor has to come out of the work
  // per cell run. The profile says where that work is, and two arms above have already
  // measured both speeds of the same primitive on this machine: the scalar weighted lane sum
  // the hypervector kinds run at, and core's 16 lane wasm kernel. The ratio of those two, and
  // the share of the tick the hypervector kinds hold, is the whole of the arithmetic.
  {
    const simd8 = hv.rows.find(r => r.members === 8);
    const scalarNs = +(bk.decompose.accumUs * 1000 / (bk.decompose.members * hv.D)).toFixed(3);
    const simdNs = simd8 ? +(simd8.simdUs * 1000 / (8 * hv.D)).toFixed(3) : null;
    const ratio = simdNs ? +(scalarNs / simdNs).toFixed(2) : null;
    const computeShare = prof.computeShareOfTickPct / 100;
    const hvShare = prof.kernelledShareOfComputePct / 100;
    // Two bounds, because the two speeds are not the same operation. The 16 lane kernel is an
    // UNWEIGHTED majority over int8 lanes; 91.19% of this organism's bundles are weighted, and
    // a weighted sum that has to keep float64 addition order covers 2 lanes per 128 bit
    // instruction, not 16. So the upper bound is the measured ratio, and the lower bound is
    // the lane width that the weighted arithmetic can actually use.
    const at = (r) => {
      const saved = computeShare * hvShare * (1 - 1 / r);
      const single = +(1 / (1 - saved)).toFixed(2);
      return { ratio: +r.toFixed(2), tickSavedPct: +(100 * saved).toFixed(1), singleProcessMultiplier: single,
        endToEnd: endToEnd === null ? null : +(endToEnd * single).toFixed(2),
        shortOf100x: endToEnd === null ? null : +(100 / (endToEnd * single)).toFixed(2) };
    };
    acc.laneLever = {
      scalarNsPerLaneOp: scalarNs, simdNsPerLaneOp: simdNs, ratio,
      computeShareOfTickPct: prof.computeShareOfTickPct,
      hvShareOfComputePct: prof.kernelledShareOfComputePct,
      denseShareOfComputePct: prof.denseShareOfComputePct,
      weightedShareOfBundleCallsPct: prof.bundleShape ? +(100 - prof.bundleShape.allWeightsEqualPct).toFixed(2) : null,
      upperBound: ratio ? at(ratio) : null,
      f64x2Bound: at(2),
    };
  }
  console.log('\n100x ACCOUNTING (every number below was printed by an arm above)');
  console.log('  baseline single process        ' + acc.baselineRunsPerSec + ' runs/s (' + acc.baselineTicksPerSec + ' ticks/s)');
  console.log('  optimised single process       ' + acc.optimisedSingleRunsPerSec + ' runs/s (' + acc.optimisedSingleTicksPerSec + ' ticks/s)  = ' + acc.hotPathMultiplier + 'x');
  console.log('  best shard count               ' + acc.bestShardCount + ' shards at ' + acc.bestShardRunsPerSec + ' runs/s, over 1 shard = ' + acc.shardMultiplier + 'x');
  console.log('  product of the two             ' + acc.product + 'x');
  console.log('  measured end to end            ' + acc.measuredEndToEnd + 'x (fastest arm over baseline, one number divided by one number)');
  console.log('  gap to 100x                    ' + acc.gapTo100x + 'x still missing');
  console.log('  ceiling, ' + acc.ceilingShards + ' shards cut=0      ' + acc.ceilingRunsPerSec + ' runs/s (' + acc.ceilingTicksPerSec + ' ticks/s) rewiring '
    + acc.ceilingRewiredEdges + ' cross edges into their own shard and deleting ' + acc.ceilingDroppedEdges + ', over 1 shard = ' + acc.ceilingOverOneShard + 'x');
  console.log('  same, deleting instead         ' + acc.ceilingDeleteRunsPerSec + ' runs/s (' + acc.ceilingDeleteTicksPerSec + ' ticks/s), '
    + acc.ceilingDeleteDroppedEdges + ' cross edges deleted (a lighter brain, so this one flatters the barrier)');
  console.log('  perfect linear, no barrier     ' + acc.perfectLinearRunsPerSec + ' runs/s (' + acc.ceilingShards + ' x the optimised single process)');
  console.log('  ceiling of perfect linear      ' + acc.ceilingOfPerfectLinear + '%   (what the barrier and the per shard overhead leave)');
  console.log('  real of ceiling                ' + acc.realOfCeiling + '%   (what the cross shard traffic costs on top of that)');
  console.log('  work per tick, runs            single=' + acc.runsPerTick.single + '  ' + best.shards + ' shards=' + acc.runsPerTick.best + '  ceiling=' + acc.runsPerTick.ceiling);
  console.log('  work per tick, deliveries      single=' + acc.deliveredPerTick.single + '  ' + best.shards + ' shards=' + acc.deliveredPerTick.best + '  ceiling=' + acc.deliveredPerTick.ceiling);
  console.log('  microseconds per cell run      baseline=' + acc.usPerRun.baseline + '  single=' + acc.usPerRun.single + '  ' + best.shards + ' shards=' + acc.usPerRun.best + '  ceiling=' + acc.usPerRun.ceiling);
  console.log('  100x of baseline needs         ' + acc.needFor100xRunsPerSec + ' runs/s');
  console.log('  perfect linear is worth        ' + acc.perfectLinearOverBaseline + 'x of baseline, the measured ceiling ' + acc.ceilingOverBaseline + 'x');
  console.log('  can sharding alone reach 100x  ' + (acc.shardingCanReach100x ? 'yes, if scaling were perfect' : 'NO: even ' + acc.ceilingShards + ' perfect copies of the optimised single process are only ' + acc.perfectLinearOverBaseline + 'x'));
  console.log('  parallel efficiency at ' + acc.ceilingShards + '        needed for 100x=' + acc.efficiencyNeededFor100xPct + '%   ceiling with zero cut=' + acc.ceilingEfficiencyPct + '%   measured=' + acc.realEfficiencyPct + '%');
  const budget = head1 && head1.barrier && head1.barrier.coordinator ? tickBudget(head1) : null;
  if (budget) {
    console.log('\nTICK BUDGET at ' + head1.shards + ' shards (one tick is ' + budget.wall + 'us of wall clock, and these are its parts)');
    for (const p of budget.parts) console.log('  ' + p.name.padEnd(32) + String(p.us).padStart(10) + 'us  ' + (100 * p.us / budget.wall).toFixed(1).padStart(5) + '%');
    console.log('  ' + 'named above'.padEnd(32) + String(budget.named).padStart(10) + 'us  ' + (100 * budget.named / budget.wall).toFixed(1).padStart(5) + '%, unaccounted ' + budget.unaccounted + 'us');
    acc.tickBudget = budget;
  }
  {
    const L = acc.laneLever;
    console.log('\nTHE ONE LEVER LEFT, priced from the arms above');
    console.log('  a weighted lane sum costs      ' + L.scalarNsPerLaneOp + 'ns per lane multiply add (bundlekernel arm, ' + bk.decompose.members + ' members)');
    console.log('  the 16 lane wasm kernel        ' + L.simdNsPerLaneOp + 'ns per lane (hvbundle arm, 8 members, unweighted) = ' + L.ratio + 'x faster');
    console.log('  hypervector kinds hold         ' + L.hvShareOfComputePct + '% of cell compute, which is ' + L.computeShareOfTickPct + '% of the tick');
    console.log('  but ' + L.weightedShareOfBundleCallsPct + '% of bundles are weighted   and a float64 weighted sum covers 2 lanes per 128 bit instruction, not 16');
    console.log('  upper bound, at ' + L.upperBound.ratio + 'x a lane    removes ' + L.upperBound.tickSavedPct + '% of the tick = ' + L.upperBound.singleProcessMultiplier
      + 'x single, ' + L.upperBound.endToEnd + 'x end to end, still ' + L.upperBound.shortOf100x + 'x short of 100x');
    console.log('  f64x2 bound, at ' + L.f64x2Bound.ratio + 'x a lane     removes ' + L.f64x2Bound.tickSavedPct + '% of the tick = ' + L.f64x2Bound.singleProcessMultiplier
      + 'x single, ' + L.f64x2Bound.endToEnd + 'x end to end, still ' + L.f64x2Bound.shortOf100x + 'x short of 100x');
    console.log('  dense shaped kinds are worth   ' + L.denseShareOfComputePct + '% of compute, so compiling THOSE into core/substrate.mjs is worth at most that');
  }
  console.log('\n  next lever                     ' + acc.nextLever);

  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  const verdict = {
    at: started, node: process.version, threads: availableParallelism(),
    organism: ORGANISM, ticks: TICKS, warm: WARM, shardCounts: SHARDS,
    tickLoop: 'one tick per event loop turn', hvHeapMB: HV_HEAP_MB, hvHeapMBCluster: HV_HEAP_MB_CLUSTER,
    arms: results, table: clusterRows.map(r => ({ shards: r.shards, ticksPerSec: r.ticksPerSec, runsPerSec: r.runsPerSec, speedupOverOneShard: one ? +(r.runsPerSec / one.runsPerSec).toFixed(3) : null, cutFraction: r.cutFraction, crossMessages: r.crossMessages, cloned: r.cloned, sharedMB: r.sharedMB })),
    hvHeap: results.filter(r => r.heap).map(r => ({ arm: r.arm, shards: r.shards || 1, ...r.heap })),
    accounting: acc,
    ceiling, ceilingDelete, headlineRepeat: repeat, weightArms, profile: prof, hvBundle: hv, kindMix: fast.kindMix || null,
    fenceWindow: clusterRows.map(r => ({ shards: r.shards, ...r.fence })),
    barrier: clusterRows.map(r => ({ shards: r.shards, ...r.barrier })).concat([{ shards: ceiling.shards, cut: 'zero', ...ceiling.barrier }]),
    verify: clusterRows.map(r => r.verify).filter(Boolean),
  };
  writeFileSync(path.join(HERE, 'verdicts', 'speed.json'), JSON.stringify(verdict, null, 2));
  console.log('\nwrote bench/verdicts/speed.json');
}

// A tick of the headline arm, split into five slices that add up to the wall clock. Four of
// the five are overhead, and the largest of those four is the lever, whatever anyone hoped
// it would be. Every number comes from a counter a shard or the coordinator wrote.
//   compute   the average shard's own cell work, minus its drain
//   drain     the average shard's cost of taking in what the other shards sent
//   straggle  the busiest shard minus the average one: threads sitting idle at the fence
//   serial    the coordinator's own per tick work, which no number of shards divides
//   dispatch  the round trip minus the busiest shard: command out, wake up, reply back
function tickBudget(row) {
  const b = row.barrier, c = b.coordinator;
  const compute = +(b.meanShardBusyUs - b.meanShardDrainUs).toFixed(1);
  const parts = [
    { name: 'shard compute', us: compute },
    { name: 'shard drain of cross messages', us: b.meanShardDrainUs },
    { name: 'straggle (idle at the fence)', us: b.straggleUs },
    { name: 'coordinator serial work', us: c ? c.serialUs : 0 },
    { name: 'dispatch and wake up', us: c ? c.dispatchUs : 0 },
  ];
  const named = parts.reduce((a, x) => a + x.us, 0);
  return { parts, named: +named.toFixed(1), wall: b.wallPerTickUs, unaccounted: +(b.wallPerTickUs - named).toFixed(1) };
}

// The lever is chosen from what the run itself measured, not from a wish list. The ceiling
// arm decides the first branch: it is the same threads and the same barrier with nothing
// crossing a thread, so the distance from the ceiling to perfect linear is barrier and per
// shard overhead, and the distance from the real arm to the ceiling is communication.
function nextLever(best, rows, ceiling, fast, base, weightArms = [], repeat = null) {
  const one = rows.find(r => r.shards === 1);
  const cloned = rows.reduce((a, r) => a + (r.cloned || 0), 0);
  const perfect = ceiling.shards * fast.runsPerSec;
  const head = rows.find(r => r.shards === ceiling.shards);
  if (base && perfect < base.runsPerSec * 100) {
    return 'sharding cannot reach 100x on this machine at all: ' + ceiling.shards + ' PERFECT copies of the optimised single process are '
      + (perfect / base.runsPerSec).toFixed(2) + 'x of baseline, and the measured ceiling with zero cut is '
      + (ceiling.runsPerSec / base.runsPerSec).toFixed(2) + 'x. The remaining factor has to come out of the work per cell run, not out of more threads: compile the dense shaped kinds into core/substrate.mjs.';
  }
  if (one && best.shards > 1 && best.runsPerSec < one.runsPerSec * 1.5 && cloned > 0) {
    return 'cross shard payloads that are not typed arrays (num, event, sym) take the postMessage clone path through the coordinator: ' + cloned + ' clones in this run. Give the descriptor slab an encoding for them and the barrier stops paying for them.';
  }
  if (best.shards === 1) return 'sharding lost outright at every W: the barrier and the cross shard traffic cost more than the cells saved. Cut the cross traffic (a coarser partition unit or fewer, larger cells) before adding threads.';
  if (!head || !head.barrier || !head.barrier.coordinator) return 'no barrier split was measured, so no lever is named.';
  const bud = tickBudget(head);
  const overhead = bud.parts.slice(1).sort((a, b2) => b2.us - a.us);
  const top = overhead[0];
  const pct = (100 * top.us / bud.wall).toFixed(1);
  const how = {
    'shard drain of cross messages': 'cut the cross traffic itself: a multilevel coarsen and uncoarsen pass over the circuit graph, or a cheaper record per message.',
    // The obvious answer to straggle is to balance by work, and this bench measures that
    // rather than assuming it. If every weighted arm lost to the unweighted one, saying
    // "balance by work" here would be recommending what the run just falsified.
    // The headline arm is run twice precisely so that a weighted arm is not graded against
    // one sample of a machine other agents are also running on. The bar is the BEST of the
    // two unweighted runs, and the spread between them is printed next to the verdict, so a
    // win smaller than the spread reads as what it is.
    'straggle (idle at the fence)': (() => {
      const arms = weightArms.filter(r => r && r.runsPerSec);
      if (!head || !arms.length) return 'balance the partition by cell WORK instead of cell count, which is what runtime/partition.mjs cellWeights does.';
      const plain = Math.max(head.runsPerSec, repeat && repeat.runsPerSec ? repeat.runsPerSec : 0);
      const spread = repeat && repeat.runsPerSec ? +(Math.max(head.runsPerSec, repeat.runsPerSec) / Math.min(head.runsPerSec, repeat.runsPerSec)).toFixed(3) : null;
      const bestW = arms.reduce((a, b2) => (b2.runsPerSec > a.runsPerSec ? b2 : a));
      const ratio = +(bestW.runsPerSec / plain).toFixed(3);
      const tag = 'the best of ' + arms.length + ' weighted arms is ' + bestW.arm + ' at ' + bestW.runsPerSec + ' runs/s against the best unweighted '
        + plain + ' = ' + ratio + 'x, where the same unweighted arm run twice spread ' + spread + 'x';
      if (spread !== null && ratio <= spread) {
        return 'balancing by cell WORK does not clear the noise on this machine: ' + tag
          + '. Worse, the pure cost weights raise the cell count imbalance to ' + arms.reduce((a, b2) => Math.max(a, b2.imbalance || 0), 0)
          + ' because a weight predicts COMPUTE while a shard busy tick is compute plus a drain that scales with how many cells and edges the shard holds. Blending the two rulers (--blend) is what keeps both balanced; the straggle that is left is per shard fixed cost, not partition quality.';
      }
      return 'balancing the partition by cell WORK takes some of it back: ' + tag + '. Push that weight, not the cut.';
    })(),
    'coordinator serial work': 'take the coordinator off the critical path. It is Brain._structural on the shadow brain plus the global fired list, run once per tick on one thread, so it is the Amdahl term of this design and no shard count divides it.',
    'dispatch and wake up': 'amortise the fence: batch K ticks between fences where the cut delay histogram allows it, or replace the postMessage round trip with an Atomics barrier among the shards.',
  }[top.name];
  return 'the biggest overhead slice of a ' + ceiling.shards + ' shard tick is ' + top.name + ' at ' + top.us + 'us of ' + bud.wall + 'us (' + pct + '%). ' + how;
}

if (!ARM && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e); process.exitCode = 1; });
}
