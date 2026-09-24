import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCell, runCell } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';
import * as P from '../core/primitives.mjs';
import '../cells/index.mjs';

// ---------------------------------------------------------------- test harness
// A cell can be driven directly with createCell/runCell (no Brain/Connectome needed):
// ins[portIdx] is the mailbox array runCell expects, each item { sig, w, edge, from }.
function mail(kind, data) { return { sig: S.signal(kind, data), w: 1, edge: -1, from: -1 }; }
function ins(cell, portValues) {
  const arr = cell.ports.in.map(() => []);
  for (const [name, v] of Object.entries(portValues)) {
    const idx = cell.ports.in.findIndex(p => p.name === name);
    if (idx < 0) throw new Error('test: no such in port ' + name + ' on ' + cell.kind);
    const list = Array.isArray(v) ? v : [v];
    arr[idx] = list.map(sig => mail(sig.kind, sig.data));
  }
  return arr;
}
function ctxAt(t) { return { t, gen: 0 }; }

// ================================================================== perception.mjs

test('encode.number: thermometer code makes 5 closer to 6 than to 50, and passes the exact num through', () => {
  const c = createCell({ id: 'n', kind: 'encode.number', params: { min: 0, max: 100, levels: 101 }, policy: { period: 'event' } });
  const enc = (x) => runCell(c, ins(c, { in: { kind: 'num', data: S.int(x) } }), ctxAt(0));
  const [hv5, num5] = enc(5), [hv6] = enc(6), [hv50] = enc(50);
  const simNear = S.sim(hv5.data, hv6.data), simFar = S.sim(hv5.data, hv50.data);
  assert.ok(simNear > simFar, '5~6 sim ' + simNear + ' should exceed 5~50 sim ' + simFar);
  assert.equal(S.ratToString(num5.data), '5');
});

test('encode.time: two timestamps exactly 24h apart coincide on every periodic scale, more than two 12h apart', () => {
  const c = createCell({ id: 't', kind: 'encode.time', policy: { period: 'event' } });
  const enc = (tms) => runCell(c, ins(c, { in: { kind: 'num', data: S.int(tms) } }), ctxAt(0))[0].data;
  const t0 = 1234567, day = 86400000, halfDay = 43200000;
  const simDay = S.sim(enc(t0), enc(t0 + day));
  const simHalf = S.sim(enc(t0), enc(t0 + halfDay));
  assert.equal(simDay, 1, '24h apart must be bit-identical, sim ' + simDay);
  assert.ok(simHalf < simDay, '12h apart (opposite hour phase) must be less similar: ' + simHalf + ' vs ' + simDay);
});

test('encode.vec: random projection is deterministic and preserves a notion of nearness', () => {
  const mk = () => createCell({ id: 'v', kind: 'encode.vec', params: { nin: 6, seed: 'proj-test' }, policy: { period: 'event' } });
  const c1 = mk(), c2 = mk();
  const x = Float32Array.from([1, 2, 3, 4, 5, 6]);
  const o1 = runCell(c1, ins(c1, { in: { kind: 'vec', data: x } }), ctxAt(0))[0];
  const o2 = runCell(c2, ins(c2, { in: { kind: 'vec', data: x } }), ctxAt(0))[0];
  assert.equal(S.sim(o1.data, o2.data), 1, 'same seed, same input, bit-identical hv');
  const near = Float32Array.from([1.05, 2.02, 2.97, 4.1, 4.9, 6.05]);
  const far = Float32Array.from([-6, -5, -4, -3, -2, -1]);
  const oNear = runCell(c1, ins(c1, { in: { kind: 'vec', data: near } }), ctxAt(1))[0];
  const oFar = runCell(c1, ins(c1, { in: { kind: 'vec', data: far } }), ctxAt(2))[0];
  assert.ok(S.sim(o1.data, oNear.data) > S.sim(o1.data, oFar.data), 'a small perturbation stays closer than an unrelated vector');
});

test('encode.image: a bright pixel on a dark field is the highest-contrast, and lands in the sdr', () => {
  const w = 5, h = 5, c = createCell({ id: 'i', kind: 'encode.image', params: { width: w, height: h, k: 1 }, policy: { period: 'event' } });
  const img = new Float32Array(w * h);
  const spot = 2 * w + 2; img[spot] = 1;
  const out = runCell(c, ins(c, { in: { kind: 'vec', data: img } }), ctxAt(0))[0];
  assert.deepEqual(Array.from(out.data.idx), [spot]);
});

test('decode.hv: recovers the exact name whose codebook hv was fed in', () => {
  const c = createCell({ id: 'd', kind: 'decode.hv', params: { items: ['cat', 'dog', 'fish'], threshold: 0.05 }, policy: { period: 'event' } });
  const out = runCell(c, ins(c, { in: { kind: 'hv', data: S.hvFromSeed('cat') } }), ctxAt(0))[0];
  assert.equal(out.data.name, 'cat');
  assert.equal(out.data.sim, 1);
});

test('tokenize.text: keeps a decimal number intact as a single token', () => {
  const c = createCell({ id: 'tok', kind: 'tokenize.text', policy: { period: 'event' } });
  const out = runCell(c, ins(c, { in: { kind: 'event', data: { text: 'Room 9.11 costs $3.50 today!' } } }), ctxAt(0))[0];
  assert.deepEqual(out.data.tokens, ['room', '9.11', 'costs', '3.50', 'today']);
});

// ================================================================== dynamics.mjs

test('liquid.cfc: the gated exponential decay drives h to a stable, non-trivial fixed point under constant input', () => {
  const c = createCell({ id: 'l', kind: 'liquid.cfc', params: { nin: 2, nhid: 6, dt: 1, tauMin: 3, tauMax: 3, seed: 'cfc-test' }, policy: { period: 1 } });
  const x = Float32Array.from([0.7, -0.4]);
  let prevH = null, lastDelta = Infinity;
  for (let t = 1; t <= 60; t++) {
    const h = runCell(c, ins(c, { x: { kind: 'vec', data: x } }), ctxAt(t))[0].data;
    if (prevH) { let s = 0; for (let i = 0; i < h.length; i++) { const dd = h[i] - prevH[i]; s += dd * dd; } lastDelta = Math.sqrt(s); }
    prevH = Float32Array.from(h);
  }
  console.log('liquid.cfc: final step delta after 60 ticks = ' + lastDelta.toExponential(3) + ', |h| = ' + S.vecNorm(prevH).toFixed(4));
  assert.ok(lastDelta < 1e-6, 'state has converged, delta ' + lastDelta);
  assert.ok(S.vecNorm(prevH) > 0.01, 'converged state is non-trivial, norm ' + S.vecNorm(prevH));
});

test('reservoir.echo: learns to predict a sine one step ahead, error drops with training', () => {
  const c = createCell({ id: 'r', kind: 'reservoir.echo', params: { nin: 1, nres: 40, nout: 1, spectralRadius: 0.9, leak: 0.4, lr: 0.1, seed: 'sine' }, policy: { period: 'event' } });
  const N = 2000, errsFirst = [], errsLast = [];
  let prevX = Math.sin(0);
  for (let t = 1; t <= N; t++) {
    const target = Math.sin(t * 0.3);
    runCell(c, ins(c, { x: { kind: 'vec', data: Float32Array.from([prevX]) } }), ctxAt(t));
    const out = runCell(c, ins(c, { target: { kind: 'vec', data: Float32Array.from([target]) } }), ctxAt(t));
    const err = out[2] && S.ratToNumber(out[2].data);
    if (err != null) { if (t <= 50) errsFirst.push(err); if (t > N - 50) errsLast.push(err); }
    prevX = target;
  }
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const meanFirst = avg(errsFirst), meanLast = avg(errsLast);
  console.log('reservoir.echo: sine one-step rmse first50 avg = ' + meanFirst.toFixed(4) + ', last50 avg = ' + meanLast.toFixed(4));
  assert.ok(meanLast < meanFirst, 'training reduced error: ' + meanFirst + ' -> ' + meanLast);
});

test('oscillator: sin(0)=0, quarter period hits 1, full period returns to 0', () => {
  const c = createCell({ id: 'o', kind: 'oscillator', params: { periods: [8, 16] }, policy: { period: 1 } });
  const at = (t) => runCell(c, ins(c, {}), ctxAt(t))[0].data;
  assert.ok(Math.abs(at(0)[0]) < 1e-9);
  assert.ok(Math.abs(at(2)[0] - 1) < 1e-9, 'quarter of period 8 is a peak');
  assert.ok(Math.abs(at(8)[0]) < 1e-9, 'full period 8 returns to 0');
});

test('timer: fires expired exactly params.ticks calls after trigger, then goes idle', () => {
  const c = createCell({ id: 'tm', kind: 'timer', params: { ticks: 3 }, policy: { period: 1 } });
  const o0 = runCell(c, ins(c, { trigger: { kind: 'event', data: {} } }), ctxAt(0));
  const o1 = runCell(c, ins(c, {}), ctxAt(1));
  const o2 = runCell(c, ins(c, {}), ctxAt(2));
  const o3 = runCell(c, ins(c, {}), ctxAt(3));
  assert.equal(o0[0], null); assert.equal(o1[0], null);
  assert.deepEqual(o2[0].data, { expired: true });
  assert.equal(o3[0], null, 'idle after expiry, no retrigger');
});

test('integrate.leaky: spikes exactly when the leaky sum crosses threshold, then is silent for the refractory period', () => {
  const c = createCell({ id: 'ii', kind: 'integrate.leaky', params: { threshold: 5, decay: 1, refractory: 2 }, policy: { period: 1 } });
  let spikeTick = -1;
  for (let t = 0; t < 10 && spikeTick < 0; t++) {
    const out = runCell(c, ins(c, { in: { kind: 'num', data: S.rat(1n) } }), ctxAt(t));
    if (out[0]) spikeTick = t;
  }
  assert.equal(spikeTick, 4, 'v = 1+1+1+1+1 = 5 on the 5th tick (index 4)');
  const out5 = runCell(c, ins(c, { in: { kind: 'num', data: S.rat(1n) } }), ctxAt(5));
  const out6 = runCell(c, ins(c, { in: { kind: 'num', data: S.rat(1n) } }), ctxAt(6));
  assert.equal(out5[0], null, 'refractory tick 1 of 2');
  assert.equal(out6[0], null, 'refractory tick 2 of 2');
});

// ================================================================== reasoning.mjs

test('hopfield.assoc: recovers a stored pattern from a 20%-corrupted cue', () => {
  const D = 64, c = createCell({ id: 'h', kind: 'hopfield.assoc', params: { beta: 8, iters: 5, capacity: 16 }, policy: { period: 'event' } });
  const patterns = [];
  for (let p = 0; p < 3; p++) {
    const v = new Float32Array(D);
    for (let i = 0; i < D; i++) v[i] = ((i * 2654435761 + p * 40503) >>> 0) & 1 ? 1 : -1;
    patterns.push(v);
    runCell(c, ins(c, { write: { kind: 'vec', data: v } }), ctxAt(0));
  }
  const p1 = patterns[0], cue = Float32Array.from(p1);
  for (let i = 0; i < D; i += 5) cue[i] *= -1; // flip every 5th entry: 20% corruption, deterministic
  const out = runCell(c, ins(c, { query: { kind: 'vec', data: cue } }), ctxAt(1))[0];
  const simToStored = S.vecCos(out.data, p1), simToCue = S.vecCos(out.data, cue);
  console.log('hopfield.assoc: retrieved sim to stored pattern = ' + simToStored.toFixed(4) + ', to corrupted cue = ' + simToCue.toFixed(4));
  assert.ok(simToStored > 0.9, 'retrieval recovered the stored pattern, sim ' + simToStored);
  assert.ok(simToStored > simToCue, 'retrieval denoised the cue, not just echoed it');
});

test('knn.retrieve: nearest labelled point wins', () => {
  const c = createCell({ id: 'k', kind: 'knn.retrieve', params: { k: 2, capacity: 100 }, policy: { period: 'event' } });
  const pts = [['a', [0, 0]], ['b', [10, 10]], ['c', [10, 0]]];
  for (const [label, v] of pts) runCell(c, ins(c, { write: { kind: 'vec', data: Float32Array.from(v) }, label: { kind: 'event', data: { label } } }), ctxAt(0));
  const out = runCell(c, ins(c, { query: { kind: 'vec', data: Float32Array.from([1, 1]) } }), ctxAt(1))[0];
  assert.equal(out.data.matches[0].label, 'a');
  assert.equal(out.data.matches.length, 2);
  assert.ok(out.data.matches[0].dist < out.data.matches[1].dist);
});

test('logic.gate: and/or/xor/nand/not over any fan-in', () => {
  const mk = (op) => createCell({ id: 'g-' + op, kind: 'logic.gate', params: { op }, policy: { period: 'event' } });
  const fan = (c, vals) => runCell(c, ins(c, { in: vals.map(v => ({ kind: 'event', data: { value: v } })) }), ctxAt(0))[0].data.value;
  assert.equal(fan(mk('and'), [true, true, true]), true);
  assert.equal(fan(mk('and'), [true, false, true]), false);
  assert.equal(fan(mk('or'), [false, false, true]), true);
  assert.equal(fan(mk('or'), [false, false, false]), false);
  assert.equal(fan(mk('xor'), [true, false, true]), false, 'even number of trues');
  assert.equal(fan(mk('xor'), [true, true, true]), true, 'odd number of trues');
  assert.equal(fan(mk('nand'), [true, true]), false);
  assert.equal(fan(mk('nand'), [true, false]), true);
  assert.equal(fan(mk('not'), [true]), false);
});

test('sym.simplify: folds constant subtrees exactly and keeps the variable', () => {
  const c = createCell({ id: 's', kind: 'sym.simplify', policy: { period: 'event' } });
  const { S: Y } = S;
  const expr = Y.add(Y.mul(Y.add(Y.num(2), Y.num(3)), Y.v('x')), Y.sub(Y.num(10), Y.num(4)));
  const out = runCell(c, ins(c, { in: { kind: 'sym', data: expr } }), ctxAt(0))[0];
  assert.equal(out.data.args[0].args[0].op, 'num', 'the (2+3) subtree folded to a single num node');
  assert.equal(S.ratToString(out.data.args[0].args[0].value), '5');
  for (const xv of ['0', '5', '-3.5']) {
    const env = { x: xv };
    assert.ok(S.ratEq(P.evalSym(expr, env), P.evalSym(out.data, env)), 'simplified tree evaluates the same as the original at x=' + xv);
  }
});

test('sym.diff: d/dx(3x^2 + 2x) = 6x + 2, evaluated at x=5 equals 32', () => {
  const c = createCell({ id: 'df', kind: 'sym.diff', params: { variable: 'x' }, policy: { period: 'event' } });
  const { S: Y } = S;
  const expr = Y.add(Y.mul(Y.num(3), Y.pow(Y.v('x'), Y.num(2))), Y.mul(Y.num(2), Y.v('x')));
  const out = runCell(c, ins(c, { in: { kind: 'sym', data: expr } }), ctxAt(0))[0];
  const value = P.evalSym(out.data, { x: '5' });
  assert.equal(S.ratToString(value), '32');
});

test('verify.numeric: exact rational tolerance, not floating slop', () => {
  const c = createCell({ id: 'vn', kind: 'verify.numeric', params: { tolerance: '1/1000' }, policy: { period: 'event' } });
  const value = S.ratDiv(S.int(1), S.int(3)); // exactly 1/3
  const expected = S.ratFromDecimal('0.333'); // 333/1000, off by 1/3000
  const out = runCell(c, ins(c, { value: { kind: 'num', data: value }, expected: { kind: 'num', data: expected } }), ctxAt(0))[0];
  assert.equal(out.data.ok, true, 'within 1/1000 tolerance: ' + out.data.diff);
  const c2 = createCell({ id: 'vn2', kind: 'verify.numeric', params: { tolerance: '1/1000000' }, policy: { period: 'event' } });
  const out2 = runCell(c2, ins(c2, { value: { kind: 'num', data: value }, expected: { kind: 'num', data: expected } }), ctxAt(0))[0];
  assert.equal(out2.data.ok, false, 'fails a much tighter exact tolerance');
});

// ================================================================== stats.mjs

test('stat.running: Welford mean/variance of 1..10 match the textbook formulas', () => {
  const c = createCell({ id: 'st', kind: 'stat.running', params: { every: 10 }, policy: { period: 1 } });
  let out = null;
  for (let x = 1; x <= 10; x++) out = runCell(c, ins(c, { in: { kind: 'num', data: S.int(x) } }), ctxAt(x))[0];
  assert.ok(out, 'emits after 10 values');
  assert.ok(Math.abs(out.data.mean - 5.5) < 1e-9);
  assert.ok(Math.abs(out.data.variance - 82.5 / 9) < 1e-9, 'sample variance ' + out.data.variance);
  assert.equal(out.data.min, 1); assert.equal(out.data.max, 10);
});

test('stat.histogram: values land in the expected fixed bins', () => {
  const c = createCell({ id: 'hg', kind: 'stat.histogram', params: { min: 0, max: 10, bins: 5 }, policy: { period: 1 } });
  const vals = [1, 1, 1, 3, 5, 7, 9, 9.9, 10];
  let out = null;
  for (const x of vals) out = runCell(c, ins(c, { in: { kind: 'num', data: S.flt(x) } }), ctxAt(0))[0];
  assert.deepEqual(out.data.counts, [3, 1, 1, 1, 3]);
});

test('stat.correlate: r approaches +1 for a perfect linear relation, -1 for a perfect inverse', () => {
  const cp = createCell({ id: 'cp', kind: 'stat.correlate', policy: { period: 1 } });
  let outp = null;
  for (let x = 0; x <= 20; x++) outp = runCell(cp, ins(cp, { x: { kind: 'num', data: S.flt(x) }, y: { kind: 'num', data: S.flt(2 * x + 1) } }), ctxAt(x))[0];
  assert.ok(outp.data.r > 0.999, 'positive correlation ' + outp.data.r);
  const cn = createCell({ id: 'cn', kind: 'stat.correlate', policy: { period: 1 } });
  let outn = null;
  for (let x = 0; x <= 20; x++) outn = runCell(cn, ins(cn, { x: { kind: 'num', data: S.flt(x) }, y: { kind: 'num', data: S.flt(-x) } }), ctxAt(x))[0];
  assert.ok(outn.data.r < -0.999, 'negative correlation ' + outn.data.r);
});

test('anomaly.zscore: a huge outlier after a stable baseline trips the threshold', () => {
  const c = createCell({ id: 'az', kind: 'anomaly.zscore', params: { threshold: 3, warmup: 5 }, policy: { period: 1 } });
  let out = null;
  for (let i = 0; i < 20; i++) out = runCell(c, ins(c, { in: { kind: 'num', data: S.flt(10 + 0.05 * Math.sin(i * 1.3)) } }), ctxAt(i))[0];
  assert.equal(out, null, 'no anomaly on the stable baseline');
  const spike = runCell(c, ins(c, { in: { kind: 'num', data: S.flt(50) } }), ctxAt(20))[0];
  assert.equal(spike.data.anomaly, true);
  assert.ok(Math.abs(spike.data.z) > 3, 'z = ' + spike.data.z);
});

test('rate.meter: counts events in the trailing window and decays once they age out', () => {
  const c = createCell({ id: 'rm', kind: 'rate.meter', params: { windowMs: 1000 }, policy: { period: 1 } });
  let out = null;
  for (let t = 0; t <= 900; t += 100) out = runCell(c, ins(c, { in: { kind: 'event', data: {} } }), ctxAt(t))[0];
  assert.equal(S.ratToNumber(out.data), 10, '10 events inside a 1000ms window is 10/s');
  const later = runCell(c, ins(c, {}), ctxAt(2000))[0];
  assert.equal(S.ratToNumber(later.data), 0, 'all 10 events are now older than the window');
});
