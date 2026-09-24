import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Brain } from '../core/brain.mjs';
import * as S from '../core/signal.mjs';
import { RNG } from '../core/rng.mjs';
import * as F from '../cells/fhrr.mjs';

const D = S.D;
function mkBrain(opts = {}) { return new Brain({ name: 'fhrr-test', seed: 'fhrr-test', ledger: 'off', ...opts }); }
function maxPhaseError(a, b) {
  let m = 0;
  for (let i = 0; i < a.length; i++) { let e = Math.abs(a[i] - b[i]); if (e > Math.PI) e = Math.abs(e - F.TAU); if (e > m) m = e; }
  return m;
}

// ================================================================== the algebra

test('phv: the kind is registered and a phasor round-trips through the snapshot encoding', () => {
  assert.ok(S.isKind('phv'), 'phv is a signal kind');
  assert.equal(S.KINDS.indexOf('hv'), 0, 'existing kinds keep their index, so the runtime bitmask is unchanged');
  const a = F.phvFromSeed('snapshot');
  const back = S.dataFromJSON('phv', S.dataToJSON('phv', a));
  assert.deepEqual(Array.from(back), Array.from(a));
  assert.equal(S.hashData('phv', a), S.hashData('phv', back), 'the same phasor hashes the same');
});

test('phv: random phasors are quasi-orthogonal and every phase is on the circle', () => {
  const rng = new RNG('ortho');
  const vs = Array.from({ length: 12 }, () => F.phvRandom(rng, D));
  for (const v of vs) for (let i = 0; i < D; i++) assert.ok(v[i] >= 0 && v[i] < F.TAU, 'phase in [0, TAU)');
  let worst = 0;
  for (let i = 0; i < vs.length; i++) for (let j = i + 1; j < vs.length; j++) worst = Math.max(worst, Math.abs(F.sim(vs[i], vs[j])));
  assert.ok(worst < 0.05, 'worst off-diagonal similarity ' + worst.toFixed(4) + ' at D=' + D);
  assert.ok(Math.abs(F.sim(vs[0], vs[0]) - 1) < 1e-6, 'a phasor is identical to itself');
});

test('phv: unbind(bind(a, b), b) equals a to 1e-6 per phase, over 16 random pairs', () => {
  const rng = new RNG('exact-inverse');
  let worst = 0;
  for (let t = 0; t < 16; t++) {
    const a = F.phvRandom(rng, D), b = F.phvRandom(rng, D);
    worst = Math.max(worst, maxPhaseError(F.unbind(F.bind(a, b), b), a));
    assert.ok(F.sim(F.unbind(F.bind(a, b), b), a) > 1 - 1e-9, 'similarity of the round trip is 1');
  }
  assert.ok(worst <= 1e-6, 'worst phase error ' + worst.toExponential(3) + ' is within 1e-6');
});

// One float32 step at a phase near TAU is 2^2 * 2^-23. A law that needs two wrapped
// intermediates (associativity) can land a few of those away from the other grouping: that
// is the storage format rounding, not the algebra, so the bound is stated in ulps and the
// similarity is checked as well.
const ULP_AT_TAU = Math.pow(2, 2 - 23);

test('phv: bind is commutative, associative, has zero as its identity, and inverse undoes it', () => {
  const a = F.phvFromSeed('alg-a'), b = F.phvFromSeed('alg-b'), c = F.phvFromSeed('alg-c');
  assert.ok(maxPhaseError(F.bind(a, b), F.bind(b, a)) <= 1e-6, 'commutative');
  const assoc = maxPhaseError(F.bind(F.bind(a, b), c), F.bind(a, F.bind(b, c)));
  assert.ok(assoc <= 4 * ULP_AT_TAU, 'associative to ' + assoc.toExponential(3) + ' radians, within four float32 steps');
  assert.ok(F.sim(F.bind(F.bind(a, b), c), F.bind(a, F.bind(b, c))) > 1 - 1e-9, 'both groupings are the same phasor');
  assert.ok(maxPhaseError(F.bind(a, F.phvZero(D)), a) <= 1e-6, 'zero phases are the identity');
  assert.ok(maxPhaseError(F.bind(a, F.inverse(a)), F.phvZero(D)) <= 1e-6, 'a bound with its inverse is the identity');
  assert.ok(Math.abs(F.sim(F.bind(a, b), a)) < 0.05, 'a bound pair is dissimilar to both its parts');
});

test('phv: a bundle of k items stays similar to every member, and above the noise floor', () => {
  const rng = new RNG('bundle');
  for (const k of [2, 4, 8, 16, 32]) {
    const items = Array.from({ length: k }, () => F.phvRandom(rng, D));
    const { phases, mag } = F.bundleFull(items);
    const floor = 4 / Math.sqrt(D); // four standard deviations of an unrelated pair
    for (const it of items) assert.ok(F.sim(phases, it) > floor, 'k=' + k + ': member similarity ' + F.sim(phases, it).toFixed(4) + ' above ' + floor.toFixed(4));
    const other = F.phvRandom(rng, D);
    assert.ok(Math.abs(F.sim(phases, other)) < floor, 'k=' + k + ': a non-member stays at the noise floor');
    let m = 0; for (let i = 0; i < D; i++) m += mag[i];
    assert.ok(m / D > 0.5 * Math.sqrt(k), 'k=' + k + ': the resultant magnitude grows like sqrt(k), measured ' + (m / D).toFixed(3));
  }
});

test('phv: fractional binding encodes order, similarity falling monotonically with distance', () => {
  const base = F.phvFromSeed('fractional');
  const xs = []; for (let s = 0; s <= 20; s++) xs.push(s * 0.025); // [0, 0.5], the band above noise
  const sims = xs.map(dx => F.sim(base, F.power(base, 1 + dx)));
  assert.ok(Math.abs(sims[0] - 1) < 1e-6, 'zero distance is identity');
  for (let i = 1; i < sims.length; i++) assert.ok(sims[i] <= sims[i - 1] + 1e-6, 'sim falls from dx=' + xs[i - 1].toFixed(3) + ' to dx=' + xs[i].toFixed(3));
  assert.ok(sims[sims.length - 1] < 0.05, 'by half a unit of distance the code has decorrelated, measured ' + sims[sims.length - 1].toFixed(4));
  // the encoding is an algebra, not a table: power(a, x) bound with power(a, y) is power(a, x + y)
  assert.ok(maxPhaseError(F.bind(F.power(base, 0.3), F.power(base, 0.45)), F.power(base, 0.75)) <= 1e-5, 'exponents add under bind');
});

test('phv: the resonator decodes a known 3-factor product from codebooks of 64', () => {
  const rng = new RNG('resonator-test');
  const books = [];
  for (let f = 0; f < 3; f++) books.push(Array.from({ length: 64 }, () => F.phvRandom(rng, D)));
  const truth = [7, 41, 23];
  const product = F.bindMany(truth.map((m, f) => books[f][m]));
  const out = F.resonate(product, books, { seed: 'resonator-test' });
  assert.deepEqual(out.factors, truth, 'exact factorisation out of ' + Math.pow(64, 3) + ' candidate products');
  assert.ok(out.ok && out.fit > 0.99, 'fit ' + out.fit.toFixed(6));
  assert.ok(out.iters <= 200, 'converged in ' + out.iters + ' iterations over ' + out.restarts + ' start(s)');
});

test('phv memory: capacity at D=8192 beats the bipolar hv on the same protocol', () => {
  const keys = Array.from({ length: 200 }, (_, i) => 'k' + i);
  const vals = Array.from({ length: 200 }, (_, i) => 'v' + i);
  const pk = keys.map(n => F.phvFromSeed(n, D)), pv = vals.map(n => F.phvFromSeed(n, D));
  const hk = keys.map(n => S.hvFromSeed(n, D)), hv = vals.map(n => S.hvFromSeed(n, D));
  const k = 120;
  const mem = new F.PhasorMemory(D);
  for (let i = 0; i < k; i++) mem.write(pk[i], pv[i]);
  const phases = mem.phases();
  const hmem = S.bundle(Array.from({ length: k }, (_, i) => S.bind(hk[i], hv[i])));
  let pHit = 0, hHit = 0;
  for (let i = 0; i < k; i++) {
    const out = F.unbind(phases, pk[i]);
    let best = -Infinity, bi = -1;
    for (let m = 0; m < pv.length; m++) { const s = F.sim(pv[m], out); if (s > best) { best = s; bi = m; } }
    if (bi === i) pHit++;
    const hout = S.bind(hmem, hk[i]);
    let hb = -Infinity, hbi = -1;
    for (let m = 0; m < hv.length; m++) { const s = S.sim(hv[m], hout); if (s > hb) { hb = s; hbi = m; } }
    if (hbi === i) hHit++;
  }
  assert.equal(pHit, k, 'phv read back all ' + k + ' pairs out of a 200 item codebook');
  assert.ok(pHit >= hHit, 'phv ' + pHit + '/' + k + ' against bipolar hv ' + hHit + '/' + k);
});

// ================================================================== wasm kernels

test('phv: the wasm kernels agree with the scalar loops, and the adoption rule is measured', () => {
  const cal = F.calibrate({ trials: 4, reps: 4 });
  if (!cal.available) { assert.equal(F.CAL.useBind, false); assert.equal(F.CAL.useSim, false); return; }
  assert.ok(cal.bindMaxErr <= F.TOL, 'bind kernel agrees to ' + cal.bindMaxErr.toExponential(3) + ' radians');
  assert.ok(cal.simMaxErr <= F.TOL, 'sim kernel agrees to ' + cal.simMaxErr.toExponential(3));
  const rng = new RNG('kernel-equal');
  for (let t = 0; t < 8; t++) {
    const a = F.phvRandom(rng, D), b = F.phvRandom(rng, D);
    assert.ok(maxPhaseError(F.bindWasm(a, b), F.scalar.bind(a, b)) <= F.TOL, 'bind lane for lane');
    assert.ok(maxPhaseError(F.unbindWasm(a, b), F.scalar.unbind(a, b)) <= F.TOL, 'unbind lane for lane');
    assert.ok(Math.abs(F.simWasm(a, b) - F.scalar.sim(a, b)) <= F.TOL, 'sim to ' + F.TOL);
  }
  // whichever path is active must still answer the algebra's own law
  const a = F.phvFromSeed('active-a'), b = F.phvFromSeed('active-b');
  assert.ok(maxPhaseError(F.unbind(F.bind(a, b), b), a) <= 1e-6, 'the active path inverts exactly');
});

test('phv: a vector whose length is not a whole number of lanes falls back to scalar and still inverts', () => {
  const d = 1023; // not divisible by four
  assert.equal(F.fits(d), false);
  assert.equal(F.fits(1022), false, 'an even width that is not four lanes is still not a kernel width');
  assert.equal(F.fits(1024), F.wasmAvailable, 'a four-lane width is a kernel width when there is a kernel');
  const rng = new RNG('odd');
  const a = F.phvRandom(rng, d), b = F.phvRandom(rng, d);
  assert.ok(maxPhaseError(F.unbind(F.bind(a, b), b), a) <= 1e-6);
  assert.ok(Math.abs(F.sim(a, a) - 1) < 1e-6);
});

// ================================================================== cells inside a Brain

test('phv cells: encode, bind, unbind and sim run inside a Brain and emit on their ports', () => {
  const b = mkBrain();
  b.addCell({ id: 'enc', kind: 'phv.encode', params: { base: 'price' } });
  b.addCell({ id: 'cmp', kind: 'phv.sim' });
  const encode = (x) => {
    b.inject('enc', 'in', { kind: 'num', data: S.ratFromDecimal(String(x)) });
    b.tick();
    const sig = b.takeOutbox().find(s => s.kind === 'phv');
    assert.ok(sig, 'phv.encode emitted a phasor for ' + x);
    return sig.data;
  };
  const p1 = encode(1.5), p2 = encode(1.5);
  assert.deepEqual(Array.from(p2), Array.from(p1), 'the same number encodes to the same phasor');
  b.inject('cmp', 'a', { kind: 'phv', data: p1 });
  b.inject('cmp', 'b', { kind: 'phv', data: p2 });
  b.tick();
  const simSig = b.takeOutbox().find(s => s.kind === 'num');
  assert.ok(simSig, 'phv.sim emitted a num');
  assert.ok(Math.abs(S.ratToNumber(S.toRat(simSig.data)) - 1) < 1e-5, 'interference of a phasor with itself is 1');
  assert.equal(b.cell('enc').stats.fired, 2, 'the encoder emitted exactly on the two ticks it was fed, and stayed silent otherwise');
  assert.ok(b.cells.every(c => c.stats.errors === 0), 'no cell threw');
});

test('phv cells: encode is a continuum, near numbers stay similar and far numbers separate', () => {
  const b = mkBrain();
  b.addCell({ id: 'e1', kind: 'phv.encode', params: { base: 'axis', scale: 1 } });
  const encode = (x) => {
    b.inject('e1', 'in', { kind: 'num', data: S.ratFromDecimal(String(x)) });
    b.tick();
    const out = b.takeOutbox();
    return out.find(s => s.kind === 'phv').data;
  };
  const p0 = encode(10), near = encode(10.05), far = encode(10.5);
  assert.ok(F.sim(p0, near) > 0.6, 'a near number stays similar, measured ' + F.sim(p0, near).toFixed(4));
  assert.ok(Math.abs(F.sim(p0, far)) < 0.05, 'half a unit away has decorrelated, measured ' + F.sim(p0, far).toFixed(4));
});

test('phv cells: bind then unbind through two wired cells returns the original phasor', () => {
  const b = mkBrain();
  b.addCell({ id: 'bind', kind: 'phv.bind' });
  b.addCell({ id: 'un', kind: 'phv.unbind' });
  b.connect('bind', 'out', 'un', 'a');
  const role = F.phvFromSeed('role:colour'), filler = F.phvFromSeed('filler:red');
  b.inject('bind', 'in', { kind: 'phv', data: role });
  b.inject('bind', 'in', { kind: 'phv', data: filler });
  b.inject('un', 'b', { kind: 'phv', data: role });
  b.tick();
  b.takeOutbox();
  b.tick();
  const out = b.takeOutbox().find(s => s.kind === 'phv');
  assert.ok(out, 'phv.unbind emitted');
  assert.ok(F.sim(out.data, filler) > 1 - 1e-6, 'the filler came back exactly, sim ' + F.sim(out.data, filler).toFixed(9));
});

test('phv cells: bundle reports a confidence that falls as more items are superposed', () => {
  const conf = (k) => {
    const b = mkBrain();
    b.addCell({ id: 'bu', kind: 'phv.bundle' });
    for (let i = 0; i < k; i++) b.inject('bu', 'in', { kind: 'phv', data: F.phvFromSeed('bundle-cell:' + i) });
    b.tick();
    const out = b.takeOutbox();
    const c = out.find(s => s.kind === 'num');
    assert.ok(out.find(s => s.kind === 'phv'), 'a superposition was emitted');
    return S.ratToNumber(S.toRat(c.data));
  };
  const c1 = conf(1), c4 = conf(4), c16 = conf(16);
  assert.ok(Math.abs(c1 - 1) < 1e-5, 'one item is full confidence, measured ' + c1.toFixed(5));
  assert.ok(c4 < c1 && c16 < c4, 'confidence falls with the item count: ' + c1.toFixed(4) + ' > ' + c4.toFixed(4) + ' > ' + c16.toFixed(4));
});

test('phv cells: memory writes key-bound values and reads any one back by its key', () => {
  const b = mkBrain();
  b.addCell({ id: 'mem', kind: 'phv.memory' });
  const pairs = [['sky', 'blue'], ['grass', 'green'], ['sun', 'yellow'], ['coal', 'black'], ['snow', 'white']];
  for (const [key, value] of pairs) { b.inject('mem', 'write', { kind: 'event', data: { key, value } }); b.tick(); b.takeOutbox(); }
  for (const [key, value] of pairs) {
    b.inject('mem', 'read', { kind: 'event', data: { key } });
    b.tick();
    const out = b.takeOutbox().find(s => s.kind === 'event');
    assert.equal(out.data.value, value, key + ' read back as ' + out.data.value);
    assert.equal(out.data.stored, pairs.length);
    assert.ok(out.data.sim > 0.3, key + ' read with similarity ' + out.data.sim.toFixed(4));
  }
});

test('phv cells: resonate factorises a product built from its own configured codebooks', () => {
  const books = [['red', 'green', 'blue'], ['circle', 'square', 'triangle'], ['left', 'right', 'centre']];
  const b = mkBrain();
  b.addCell({ id: 'res', kind: 'phv.resonate', params: { books, d: D } });
  const want = ['green', 'triangle', 'left'];
  const product = F.bindMany(want.map(n => F.phvFromSeed(n + '#' + D, D)));
  b.inject('res', 'in', { kind: 'phv', data: product });
  b.tick();
  const out = b.takeOutbox().find(s => s.kind === 'event');
  assert.deepEqual(out.data.factors, want, 'decoded ' + JSON.stringify(out.data.factors));
  assert.ok(out.data.ok && out.data.fit > 0.99, 'fit ' + out.data.fit.toFixed(6));
});

test('phv cells: every kind serializes and restores through a Brain snapshot', async () => {
  const { mkdtempSync, rmSync } = await import('node:fs');
  const os = await import('node:os');
  const pathMod = await import('node:path');
  const dir = mkdtempSync(pathMod.join(os.tmpdir(), 'fhrr-snap-'));
  const b = mkBrain({ dir });
  b.addCell({ id: 'enc', kind: 'phv.encode' });
  b.addCell({ id: 'mem', kind: 'phv.memory' });
  b.addCell({ id: 'res', kind: 'phv.resonate', params: { books: [['a', 'b'], ['c', 'd']], d: D } });
  b.inject('mem', 'write', { kind: 'event', data: { key: 'k', value: 'v' } });
  b.tick(); b.takeOutbox();
  b.snapshot(dir);
  const b2 = Brain.restore(dir, { ledger: 'off' });
  b2.inject('mem', 'read', { kind: 'event', data: { key: 'k' } });
  b2.tick();
  const out = b2.takeOutbox().find(s => s.kind === 'event');
  assert.equal(out.data.value, 'v', 'the superposition survived the snapshot');
  assert.equal(out.data.stored, 1);
  rmSync(dir, { recursive: true, force: true });
});

// ================================================================== the representation itself
// Everything above measures phasors through sim(), which is blind to a whole turn: a phase
// of -0.3 and a phase of TAU - 0.3 interfere identically. The representation still claims
// every phase is in [0, TAU), and these are the tests that hold it to that.

test('phv: wrap lands in [0, TAU) including the two edges that round', () => {
  assert.equal(F.wrap(0), 0);
  assert.equal(F.wrap(F.TAU), 0, 'a whole turn is zero');
  assert.equal(F.wrap(-1e-16), 0, 'a negative smaller than one float step off a turn comes back as 0, not TAU');
  for (const x of [-F.TAU * 3, -5.5, -1e-9, 0.25, 3, 6.283, F.TAU - 1e-9, F.TAU * 2, 1e6]) {
    const y = F.wrap(x);
    assert.ok(y >= 0 && y < F.TAU, 'wrap(' + x + ') = ' + y + ' is in [0, TAU)');
    assert.ok(Math.abs(Math.cos(y) - Math.cos(x)) < 1e-9 && Math.abs(Math.sin(y) - Math.sin(x)) < 1e-9, 'wrap(' + x + ') is the same point on the circle');
  }
});

test('phv: every operation returns phases in [0, TAU), not merely the right point on the circle', () => {
  const rng = new RNG('range');
  const a = F.phvRandom(rng, 256), b = F.phvRandom(rng, 256);
  const out = {
    bind: F.bind(a, b), unbind: F.unbind(a, b), inverse: F.inverse(a),
    power: F.power(a, -2.75), permute: F.permute(a, 7), bundle: F.bundle([a, b]),
  };
  for (const [name, v] of Object.entries(out)) {
    for (let i = 0; i < v.length; i++) assert.ok(v[i] >= 0 && v[i] < F.TAU, name + ' phase ' + i + ' = ' + v[i] + ' left [0, TAU)');
  }
});

test('phv: permute is a roll by exactly k, invertible, and a negative shift is normalised', () => {
  const rng = new RNG('permute');
  const n = 64, a = F.phvRandom(rng, n);
  for (const k of [1, 7, n - 1]) {
    const p = F.permute(a, k);
    for (let i = 0; i < n; i++) assert.equal(p[(i + k) % n], a[i], 'permute by ' + k + ' moves index ' + i + ' to ' + ((i + k) % n));
    assert.deepEqual(Array.from(F.unpermute(p, k)), Array.from(a), 'permute by ' + k + ' round trips');
  }
  assert.deepEqual(Array.from(F.permute(a, -3)), Array.from(F.permute(a, n - 3)), 'a negative shift is the same roll as its positive complement');
  assert.deepEqual(Array.from(F.permute(a, -n - 5)), Array.from(F.permute(a, n - 5)), 'a shift past a whole turn of the vector normalises');
  assert.ok(Math.abs(F.sim(F.permute(a, 1), a)) < 0.2, 'a rolled phasor is not its own neighbour, sim ' + F.sim(F.permute(a, 1), a).toFixed(4));
});

test('phv: encodeVector gives each component its own base, so order is part of the code', () => {
  const rng = new RNG('encvec');
  const bases = [F.phvRandom(rng, D), F.phvRandom(rng, D), F.phvRandom(rng, D)];
  // exponents a whole unit apart, because fractional binding is a kernel in the exponent
  // gap and a small gap leaves the two codes legitimately similar
  const xy = F.encodeVector(bases, [0, 1, 0.5]);
  const yx = F.encodeVector(bases, [1, 0, 0.5]);
  assert.ok(Math.abs(F.sim(xy, yx)) < 0.05, 'swapping two components changes the code, sim ' + F.sim(xy, yx).toFixed(4));
  // and the roles really are the bases: dividing out the other two leaves component 0
  const v = F.encodeVector(bases, [0.25, 0.6, 0.5]);
  const rest = F.bind(F.power(bases[1], 0.6), F.power(bases[2], 0.5));
  assert.ok(F.sim(F.unbind(v, rest), F.power(bases[0], 0.25)) > 1 - 1e-6, 'the first role unbinds back to its own base raised to its own exponent');
  // the same path through the cell: a vec in must use one base per component
  const b = mkBrain();
  b.addCell({ id: 'enc', kind: 'phv.encode', params: { base: 'vec', d: D } });
  const got = [];
  for (const xs of [[0, 1], [1, 0]]) {
    b.inject('enc', 'in', { kind: 'vec', data: Float32Array.from(xs) });
    b.tick();
    const sig = b.takeOutbox().find(s => s.kind === 'phv');
    assert.ok(sig, 'the encoder emitted for [' + xs + ']');
    got.push(sig.data);
  }
  assert.equal(got.length, 2, 'the encoder emitted both vectors');
  assert.ok(Math.abs(F.sim(got[0], got[1])) < 0.05, 'the cell encodes order too, sim ' + F.sim(got[0], got[1]).toFixed(4));
});

test('phv memory: magnitude is a per-write mean, so it falls as the superposition fills', () => {
  const rng = new RNG('mag');
  const one = new F.PhasorMemory(D).write(F.phvRandom(rng, D), F.phvRandom(rng, D));
  assert.ok(Math.abs(one.magnitude() - 1) < 1e-6, 'one write leaves unit magnitude, measured ' + one.magnitude().toFixed(6));
  const many = new F.PhasorMemory(D);
  for (let i = 0; i < 16; i++) many.write(F.phvRandom(rng, D), F.phvRandom(rng, D));
  assert.ok(many.magnitude() < 1, '16 writes leave a mean below 1, measured ' + many.magnitude().toFixed(6));
  assert.ok(many.magnitude() > 0.15, 'and it does not collapse: ' + many.magnitude().toFixed(6));
  console.log('phasor memory magnitude: 1 write ' + one.magnitude().toFixed(6) + ', 16 writes ' + many.magnitude().toFixed(6));
});

test('phv: a dead dimension is repopulated on the unit circle, never divided by its own zero', () => {
  const d = 32;
  const re = new Float64Array(d), im = new Float64Array(d);
  for (let i = 0; i < 8; i++) { re[i] = 3; im[i] = 4; }   // the rest are exactly zero
  const out = F.normalise(re, im, d, new RNG('dead'));
  for (let i = 0; i < d; i++) {
    assert.ok(Number.isFinite(out.re[i]) && Number.isFinite(out.im[i]), 'dimension ' + i + ' is a number');
    assert.ok(Math.abs(Math.hypot(out.re[i], out.im[i]) - 1) < 1e-12, 'dimension ' + i + ' is on the unit circle');
  }
  assert.ok(Math.abs(out.re[0] - 0.6) < 1e-12 && Math.abs(out.im[0] - 0.8) < 1e-12, 'a live dimension is just normalised');
});

test('phv: the restart loop returns the BEST fit it found, not the last or the worst', () => {
  const d = 512, rng = new RNG('restart');
  const books = [Array.from({ length: 8 }, () => F.phvRandom(rng, d)), Array.from({ length: 8 }, () => F.phvRandom(rng, d))];
  const product = F.phvRandom(rng, d);   // not a product of codewords, so no restart can succeed
  const opts = { iters: 20, threshold: 0.99, seed: 'restart' };
  const fits = [];
  for (let r = 0; r < 5; r++) fits.push(F.resonateOnce(product, books, { ...opts, seed: 'restart#' + r, random: r > 0 }).fit);
  const best = F.resonate(product, books, { ...opts, restarts: 5 });
  assert.equal(best.ok, false, 'a random product is not factorisable, fit ' + best.fit.toFixed(6));
  assert.ok(Math.max(...fits) - Math.min(...fits) > 1e-6, 'the restarts really do differ: ' + fits.map(f => f.toFixed(4)).join(' '));
  assert.equal(best.fit, Math.max(...fits), 'resonate keeps the best of ' + fits.map(f => f.toFixed(4)).join(' '));
});

// ================================================================== prose hygiene

test('phv: no em-dash in the phasor sources', async () => {
  const { readFileSync } = await import('node:fs');
  for (const f of ['../cells/fhrr.mjs', '../bench/fhrr.mjs', '../test/fhrr.test.mjs', '../research/quantum-tokens.md', '../notes/fhrr.md']) {
    const src = readFileSync(new URL(f, import.meta.url), 'utf8');
    assert.ok(!src.includes(String.fromCharCode(0x2014)), f + ' carries an em-dash');
  }
});
