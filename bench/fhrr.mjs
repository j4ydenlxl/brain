// bench/fhrr.mjs: the phasor kind, measured against the bipolar hv it extends.
// Four questions, one command, every number printed and written to verdicts/fhrr.json:
//   1. capacity: how many key-value pairs can one vector hold and still be read back
//   2. unbinding: how exact is the inverse, alone and inside a superposition
//   3. resonator: how often does alternating projection factorise a 3-factor product
//   4. throughput: nanoseconds per bind, bundle and sim, wasm kernels against JS
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RNG } from '../core/rng.mjs';
import * as S from '../core/signal.mjs';
import * as F from '../cells/fhrr.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const D = S.D;
const arg = (name, dflt) => { const a = process.argv.find(x => x.startsWith('--' + name + '=')); return a ? Number(a.split('=')[1]) : dflt; };
const VOCAB = arg('vocab', 512);      // size of the cleanup codebook the read-back must win
const SAMPLE = arg('sample', 50);     // keys read back per capacity point
const TRIALS = arg('trials', 20);     // resonator trials
const GRID = [1, 2, 3, 5, 8, 12, 20, 32, 50, 80, 120, 200, 320, 500];
const t0all = Date.now();

// ---------------------------------------------------------------- vocabularies
const rng = new RNG('fhrr:bench');
const keyNames = Array.from({ length: VOCAB }, (_, i) => 'key' + i);
const valNames = Array.from({ length: VOCAB }, (_, i) => 'val' + i);
const pKeys = keyNames.map(n => F.phvFromSeed(n, D));
const pVals = valNames.map(n => F.phvFromSeed(n, D));
const hKeys = keyNames.map(n => S.hvFromSeed(n, D));
const hVals = valNames.map(n => S.hvFromSeed(n, D));

// which value index does this read-out point at, out of the whole vocabulary
function argmaxPhv(v) { let b = -Infinity, bi = -1; for (let m = 0; m < pVals.length; m++) { const s = F.sim(pVals[m], v); if (s > b) { b = s; bi = m; } } return [bi, b]; }
function argmaxHv(v) { let b = -Infinity, bi = -1; for (let m = 0; m < hVals.length; m++) { const s = S.sim(hVals[m], v); if (s > b) { b = s; bi = m; } } return [bi, b]; }

// ---------------------------------------------------------------- 1. capacity curve
console.log('capacity: ' + GRID.length + ' points, cleanup codebook ' + VOCAB + ', up to ' + SAMPLE + ' read-backs per point, D=' + D);
const capacity = [];
for (const k of GRID) {
  const pick = new RNG('cap:' + k);
  const pairs = [];
  for (let i = 0; i < k; i++) pairs.push([i % VOCAB, pick.int(VOCAB)]);
  // phv: one complex accumulator of key-bound values
  const pmem = new F.PhasorMemory(D);
  for (const [ki, vi] of pairs) pmem.write(pKeys[ki], pVals[vi]);
  const pPhases = pmem.phases();
  // hv: bundle of bound pairs
  const hmem = S.bundle(pairs.map(([ki, vi]) => S.bind(hKeys[ki], hVals[vi])));
  const idx = []; for (let i = 0; i < Math.min(k, SAMPLE); i++) idx.push(Math.floor(i * k / Math.min(k, SAMPLE)));
  let pHit = 0, hHit = 0, pSim = 0, hSim = 0;
  for (const i of idx) {
    const [ki, vi] = pairs[i];
    const [pm, ps] = argmaxPhv(F.unbind(pPhases, pKeys[ki]));
    if (pm === vi) pHit++;
    pSim += ps;
    const [hm, hs] = argmaxHv(S.bind(hmem, hKeys[ki]));
    if (hm === vi) hHit++;
    hSim += hs;
  }
  const row = { items: k, reads: idx.length, phvAccuracy: pHit / idx.length, hvAccuracy: hHit / idx.length, phvTopSim: pSim / idx.length, hvTopSim: hSim / idx.length, phvMagnitude: pmem.magnitude() };
  capacity.push(row);
  console.log(`  items ${String(k).padStart(3)}  phv ${(row.phvAccuracy * 100).toFixed(1)}% (top sim ${row.phvTopSim.toFixed(4)})  hv ${(row.hvAccuracy * 100).toFixed(1)}% (top sim ${row.hvTopSim.toFixed(4)})`);
}
const lastPerfect = (key) => { let best = 0; for (const r of capacity) if (r[key] === 1) best = r.items; return best; };
const phvPerfect = lastPerfect('phvAccuracy'), hvPerfect = lastPerfect('hvAccuracy');

// ---------------------------------------------------------------- 2. unbinding exactness
// Alone, both algebras invert exactly: phv by phase subtraction, hv because the elementwise
// product is its own inverse. The difference shows up inside a superposition, which is what
// the third block measures: the same k pairs, read back, similarity to the true value.
const ex = { phvMaxPhaseError: 0, phvSelfSim: 0, hvMismatchLanes: 0, hvSelfSim: 0, trials: 32 };
{
  const r = new RNG('exact');
  for (let t = 0; t < ex.trials; t++) {
    const a = F.phvRandom(r, D), b = F.phvRandom(r, D);
    const back = F.unbind(F.bind(a, b), b);
    for (let i = 0; i < D; i++) { let e = Math.abs(back[i] - a[i]); if (e > Math.PI) e = Math.abs(e - F.TAU); if (e > ex.phvMaxPhaseError) ex.phvMaxPhaseError = e; }
    ex.phvSelfSim += F.sim(back, a);
    const ha = S.hvFromSeed('ex-a' + t, D), hb = S.hvFromSeed('ex-b' + t, D);
    const hback = S.bind(S.bind(ha, hb), hb);
    ex.hvMismatchLanes += S.hamming(hback, ha);
    ex.hvSelfSim += S.sim(hback, ha);
  }
  ex.phvSelfSim /= ex.trials; ex.hvSelfSim /= ex.trials;
}
const superposed = [];
for (const k of [2, 4, 8, 16, 32, 64, 128]) {
  const pick = new RNG('sup:' + k);
  const pairs = []; for (let i = 0; i < k; i++) pairs.push([i % VOCAB, pick.int(VOCAB)]);
  const pmem = new F.PhasorMemory(D); for (const [ki, vi] of pairs) pmem.write(pKeys[ki], pVals[vi]);
  const ph = pmem.phases();
  const hmem = S.bundle(pairs.map(([ki, vi]) => S.bind(hKeys[ki], hVals[vi])));
  let p = 0, h = 0;
  for (const [ki, vi] of pairs) { p += F.sim(F.unbind(ph, pKeys[ki]), pVals[vi]); h += S.sim(S.bind(hmem, hKeys[ki]), hVals[vi]); }
  superposed.push({ items: k, phvSim: p / k, hvSim: h / k });
}
console.log('\nunbinding: phv max phase error ' + ex.phvMaxPhaseError.toExponential(3) + ' rad, sim ' + ex.phvSelfSim.toFixed(9) +
  '; hv mismatched lanes ' + ex.hvMismatchLanes + ', sim ' + ex.hvSelfSim.toFixed(9) + ' (' + ex.trials + ' trials each)');
for (const r of superposed) console.log(`  in superposition of ${String(r.items).padStart(3)}: phv sim to the true value ${r.phvSim.toFixed(4)}, hv ${r.hvSim.toFixed(4)}`);

// ---------------------------------------------------------------- 3. fractional binding
// A real exponent encodes a continuum: similarity must fall away with distance, and it must
// fall MONOTONICALLY over the sampled range or the code is not an ordering.
// Phases drawn uniformly on the circle make the kernel sin(TAU dx) / (TAU dx): it falls from
// 1 to the noise floor over dx in [0, 0.5] and then rings around zero, so the ordering claim
// is made and checked on [0, 0.5], the band where the code is above noise.
const base = F.phvFromSeed('bench:fractional', D);
const fractional = [];
for (let s = 0; s <= 40; s++) { const dx = s * 0.025; fractional.push({ dx, sim: F.sim(base, F.power(base, 1 + dx)) }); }
const band = fractional.filter(r => r.dx <= 0.5);
let monotone = true;
for (let i = 1; i < band.length; i++) if (band[i].sim > band[i - 1].sim + 1e-6) monotone = false;
const at = (dx) => fractional.find(r => Math.abs(r.dx - dx) < 1e-9).sim;
console.log('\nfractional binding: sim at dx=0 ' + at(0).toFixed(6) + ', dx=0.1 ' + at(0.1).toFixed(6) +
  ', dx=0.25 ' + at(0.25).toFixed(6) + ', dx=0.5 ' + at(0.5).toFixed(6) + ', dx=1.0 ' + at(1).toFixed(6) +
  '; monotone on [0, 0.5] ' + monotone + ' over ' + band.length + ' samples');

// ---------------------------------------------------------------- 4. resonator
const res = { trials: TRIALS, factors: 3, book: 64, solved: 0, meanIters: 0, meanRestarts: 0, meanFit: 0, meanMs: 0, iterCap: 200, restartCap: 16 };
{
  const r = new RNG('resonate');
  const books = [];
  for (let f = 0; f < res.factors; f++) { const b = []; for (let m = 0; m < res.book; m++) b.push(F.phvRandom(r, D)); books.push(b); }
  for (let t = 0; t < TRIALS; t++) {
    const truth = books.map(() => r.int(res.book));
    const product = F.bindMany(truth.map((m, f) => books[f][m]));
    const t1 = Date.now();
    const out = F.resonate(product, books, { iters: res.iterCap, restarts: res.restartCap, seed: 'bench:' + t });
    res.meanMs += Date.now() - t1;
    res.meanIters += out.iters; res.meanRestarts += out.restarts; res.meanFit += out.fit;
    if (out.factors.every((m, f) => m === truth[f])) res.solved++;
  }
  res.meanIters /= TRIALS; res.meanRestarts /= TRIALS; res.meanFit /= TRIALS; res.meanMs /= TRIALS;
  res.successRate = res.solved / TRIALS;
}
console.log('\nresonator: ' + res.solved + '/' + res.trials + ' exact factorisations of a ' + res.factors +
  '-factor product, codebooks of ' + res.book + ' (search space ' + Math.pow(res.book, res.factors) + '), mean ' +
  res.meanIters.toFixed(1) + ' iterations and ' + res.meanRestarts.toFixed(1) + ' starts, mean fit ' + res.meanFit.toFixed(4) + ', mean ' + res.meanMs.toFixed(1) + ' ms');

// ---------------------------------------------------------------- 5. throughput
function timeOp(fn, reps) { fn(); const t = process.hrtime.bigint(); for (let i = 0; i < reps; i++) fn(i); return Number(process.hrtime.bigint() - t) / reps; }
const a1 = F.phvFromSeed('t:a', D), b1 = F.phvFromSeed('t:b', D);
const eight = Array.from({ length: 8 }, (_, i) => F.phvFromSeed('t:v' + i, D));
const ha1 = S.hvFromSeed('t:a', D), hb1 = S.hvFromSeed('t:b', D);
const hEight = Array.from({ length: 8 }, (_, i) => S.hvFromSeed('t:v' + i, D));
const ops = {
  phvBind: timeOp(() => F.bind(a1, b1), 2000),
  phvBindJs: timeOp(() => F.scalar.bind(a1, b1), 2000),
  phvUnbind: timeOp(() => F.unbind(a1, b1), 2000),
  phvSim: timeOp(() => F.sim(a1, b1), 2000),
  phvSimJs: timeOp(() => F.scalar.sim(a1, b1), 2000),
  phvBundle8: timeOp(() => F.bundle(eight), 400),
  phvPower: timeOp(() => F.power(a1, 1.37), 2000),
  hvBind: timeOp(() => S.bind(ha1, hb1), 2000),
  hvSim: timeOp(() => S.sim(ha1, hb1), 2000),
  hvBundle8: timeOp(() => S.bundle(hEight), 400),
};
const perSec = (ns) => Math.round(1e9 / ns);
console.log('\nthroughput at D=' + D + ' (nanoseconds per call, calls per second):');
for (const [k, ns] of Object.entries(ops)) console.log(`  ${k.padEnd(11)} ${ns.toFixed(0).padStart(8)} ns  ${perSec(ns).toLocaleString('en-US').padStart(12)} /s`);
console.log('  wasm kernels: bind adopted ' + F.CAL.useBind + ' (max phase error ' + (F.CAL.bindMaxErr ?? NaN).toExponential(2) +
  '), sim adopted ' + F.CAL.useSim + ' (max error ' + (F.CAL.simMaxErr ?? NaN).toExponential(2) + ')');

// ---------------------------------------------------------------- verdict
const verdict = {
  at: new Date().toISOString(), node: process.version, d: D, vocab: VOCAB, sample: SAMPLE, ms: Date.now() - t0all,
  wasm: F.CAL,
  capacity, phvPerfectUpTo: phvPerfect, hvPerfectUpTo: hvPerfect,
  unbinding: ex, superposed, fractional: { monotone, curve: fractional },
  resonator: res, ops, opsPerSecond: Object.fromEntries(Object.entries(ops).map(([k, ns]) => [k, perSec(ns)])),
};
mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
writeFileSync(path.join(HERE, 'verdicts', 'fhrr.json'), JSON.stringify(verdict, null, 2));
console.log('\nFHRR: phv read-back is perfect up to ' + phvPerfect + ' items, bipolar hv up to ' + hvPerfect +
  ' items, at D=' + D + ' against a cleanup codebook of ' + VOCAB + '; resonator ' + res.solved + '/' + res.trials +
  '; wrote bench/verdicts/fhrr.json in ' + ((Date.now() - t0all) / 1000).toFixed(1) + ' s');
