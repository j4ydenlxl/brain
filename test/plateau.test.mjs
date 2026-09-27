// test/plateau.test.mjs: the plateau reader, the cover plane, the three interventions and the bar.
// No model is called; no server is started; the worker threads a test starts end with their job.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ARMS, armName, coverPlane, behaviourDescriptor, distantElites, probeCell, runArm, runJobs,
  plateauOf, rowAt, gainAfter, stats, compactRows, compareArm, chooseCombination, barVerdict,
  matrixToWire, matrixFromWire, RESTART,
  SPLIT, runSeeds, splitSeedStrings, retiredSeedStrings, searchedGaps, spearman, archiveHeldout,
  describePlane, gridPlane, LMAX, COVER_DEFAULTS,
} from '../generations/plateau.mjs';
import { EvalMatrix, MatrixElites } from '../generations/velocity.mjs';

const counter = (step = 0.5) => { let t = 0; return () => (t += step); };
const small = (seed, extra = {}) => coverPlane({ seed, families: 48, components: 256, tasksPerDraw: 64, draws: 2, ...extra });
const LM = { a: 12, b: 10 };

// ---------------------------------------------------------------- reading the rows
test('plateauOf: the last rise, the score there; a series that never rises plateaus at its first row', () => {
  const rows = [3, 5, 5, 4, 6, 6, 5].map((h, i) => ({ tMs: i * 100, heldout: h, gen: i * 10 }));
  assert.deepEqual(plateauOf(rows, 'heldout'), { atMs: 400, score: 6 });
  const flat = [5, 5, 4].map((h, i) => ({ tMs: i * 100, heldout: h }));
  assert.deepEqual(plateauOf(flat, 'heldout'), { atMs: 0, score: 5 });
  // a fall and a rise back to the old level is a rise
  const back = [5, 4, 5, 5].map((h, i) => ({ tMs: i * 100, heldout: h }));
  assert.deepEqual(plateauOf(back, 'heldout'), { atMs: 200, score: 5 });
  assert.equal(plateauOf([], 'heldout'), null);
});

test('rowAt and gainAfter: the gain after tau per million organism-years, and the control\'s own gain after its plateau is never above zero', () => {
  const rows = [3, 5, 5, 4, 6, 6, 5].map((h, i) => ({ tMs: i * 100, heldout: h, gen: i * 1000 }));
  assert.equal(rowAt(rows, 250).tMs, 200);
  assert.equal(rowAt(rows, -5).tMs, 0);
  const g = gainAfter(rows, 150);
  assert.equal(g.from, 5); assert.equal(g.to, 5); assert.equal(g.gained, 0); assert.equal(g.years, 5000);
  const h = gainAfter(rows, 0);
  assert.equal(h.gained, 2); assert.equal(h.years, 6000); assert.equal(h.perMillion, 2 / 0.006);
  const own = gainAfter(rows, plateauOf(rows).atMs);
  assert.equal(own.gained, -1);
  assert.ok(own.gained <= 0);
  assert.equal(gainAfter(rows, 900).perMillion, null);
});

test('stats: mean and sample sd; one value has sd 0; non-finite values are left out', () => {
  const s = stats([1, 2, 3, 4]);
  assert.equal(s.n, 4); assert.equal(s.mean, 2.5); assert.equal(s.sd, Math.sqrt(5 / 3)); assert.equal(s.min, 1); assert.equal(s.max, 4);
  assert.equal(stats([7]).sd, 0);
  assert.equal(stats([1, null, NaN, 3]).n, 2);
  assert.equal(stats([]).mean, null);
});

test('compactRows keeps every change point, the last row and one row per second', () => {
  const rows = [];
  for (let i = 0; i < 35; i++) rows.push({ tMs: i * 100, gen: i, searched: i < 12 ? i : 12, len: 3, heldout: i < 20 ? 1 : 2, objective: i < 12 ? i : 12 });
  const c = compactRows(rows);
  const times = c.map((r) => r[0]);
  for (const t of [0, 100, 1100, 1200, 2000, 3000, 3400]) assert.ok(times.includes(t), 'missing ' + t);
  assert.ok(!times.includes(2500));
  assert.ok(c.length < rows.length);
});

// ---------------------------------------------------------------- the cover plane
test('coverPlane: a function of its seed; RIGHT inside FIT everywhere; the fresh draw is none of the searched draws', () => {
  const a = small('t/cover'), b = small('t/cover'), c = small('t/cover2');
  assert.deepEqual(a.searched.fit, b.searched.fit);
  assert.deepEqual(a.fresh.right, b.fresh.right);
  assert.notDeepEqual(a.searched.fit, c.searched.fit);
  for (const m of [a.searched, a.fresh]) for (let i = 0; i < m.fit.length; i++) assert.equal((m.right[i] & ~m.fit[i]) >>> 0, 0);
  assert.equal(a.searched.draws, 2);
  assert.equal(a.searched.T, 128);
  assert.equal(a.fresh.T, 64);
  assert.ok(!a.seeds.includes(a.freshSeed));
  // the fresh draw's planes differ from each searched draw's (a different sample of tasks)
  const W = a.fresh.W, sw = a.searched.W;
  for (let k = 0; k < 2; k++) {
    let same = true;
    for (let cc = 0; cc < a.fresh.C && same; cc++) for (let t = 0; t < 64; t++) {
      const f1 = (a.fresh.fit[cc * W + (t >>> 5)] >>> (t & 31)) & 1;
      const u = k * 64 + t;
      const f2 = (a.searched.fit[cc * sw + (u >>> 5)] >>> (u & 31)) & 1;
      if (f1 !== f2) { same = false; break; }
    }
    assert.equal(same, false, 'draw ' + k + ' equals the fresh draw');
  }
  assert.ok(a.searched.unionBound() > 0);
});

test('matrixToWire / matrixFromWire: a library scores the same on both sides', () => {
  const a = small('t/wire');
  const m = matrixFromWire(structuredClone(matrixToWire(a.searched)));
  const g = [3, 17, 40, 99, 5];
  assert.deepEqual(m.score(g).solved, a.searched.score(g).solved);
  assert.equal(m.draws, a.searched.draws);
});

// ---------------------------------------------------------------- NOVELTY: behaviour descriptors
function handMatrix() {
  // 6 tasks: t0..t3 each answered by one component (c0: t0 t1, c1: t2 t3); t4 t5 by c2..c5
  const C = 6, T = 6, W = 1;
  const fit = new Uint32Array(C * W), right = new Uint32Array(C * W);
  const set = (c, t) => { fit[c] |= 1 << t; right[c] |= 1 << t; };
  set(0, 0); set(0, 1); set(1, 2); set(1, 3);
  for (let c = 2; c < 6; c++) { set(c, 4); set(c, 5); }
  return new EvalMatrix({ name: 'hand', components: C, tasks: T, fit, right, size: new Uint8Array(C).fill(1), opMask: new Uint32Array(C).fill(1), nOps: 4, deepMask: new Uint32Array(W) });
}

test('behaviour descriptors: two libraries of one count and one length that solve different tasks share a default cell and hold two behaviour cells', () => {
  const m = handMatrix();
  const A = Int32Array.from([0, 2]), B = Int32Array.from([1, 2]);
  const sa = m.score(A), sb = m.score(B);
  assert.equal(sa.count, 4); assert.equal(sb.count, 4);
  assert.notDeepEqual(sa.solved, sb.solved);
  const def = new MatrixElites(m, { seed: 't', lmax: 4, popSize: 1 });
  const beh = new MatrixElites(m, { seed: 't', lmax: 4, popSize: 1, descriptor: behaviourDescriptor(m) });
  const tmp = new Int32Array(4), cl = new Uint8Array(4);
  const cellOf = (e, g) => probeCell(e, g, g.length, tmp, cl).cell;
  assert.equal(cellOf(def, A), cellOf(def, B), 'the default descriptors cannot tell them apart');
  assert.notEqual(cellOf(beh, A), cellOf(beh, B), 'the behaviour descriptors must');
  // in the archive: the default keeps one (a tie keeps the incumbent), the behaviour archive keeps both
  def.offer(Int32Array.from(A), 2); def.offer(Int32Array.from(B), 2);
  beh.offer(Int32Array.from(A), 2); beh.offer(Int32Array.from(B), 2);
  assert.equal(def.nFilled, 1);
  assert.equal(beh.nFilled, 2);
  assert.equal(beh.capacity, 6 ** 4);
  // without a descriptor the engine is the one it was: the same cells as a build with descriptor null
  const d2 = new MatrixElites(m, { seed: 't', lmax: 4, popSize: 1, descriptor: null });
  assert.equal(cellOf(d2, A), cellOf(def, A));
});

test('probeCell lands a library in exactly the cell offer() writes, pruned the same way', () => {
  const p = small('t/probe');
  const tmp = new Int32Array(64), cl = new Uint8Array(64);
  for (const desc of [null, behaviourDescriptor(p.searched)]) {
    for (let k = 0; k < 20; k++) {
      const e = new MatrixElites(p.searched, { seed: 't' + k, lmax: 12, popSize: 1, descriptor: desc });
      const g = Int32Array.from({ length: 1 + (k % 12) }, (_, i) => (k * 37 + i * 101) % p.searched.C);
      const pr = probeCell(e, g, g.length, tmp, cl);
      assert.equal(e.nFilled, 0);
      assert.equal(e.offer(Int32Array.from(g), g.length), true);
      assert.equal(e.filled[0], pr.cell);
      assert.equal(e.len[pr.cell], pr.len);
      assert.equal(e.cnt[pr.cell], pr.count);
    }
  }
});

// ---------------------------------------------------------------- RESTART
test('distantElites: the chosen cells are the furthest from the given solved set, and no unchosen cell is further', () => {
  const p = small('t/dist');
  const e = new MatrixElites(p.searched, { seed: 'd', lmax: 12 });
  for (let i = 0; i < 60; i++) e.step();
  const W = p.searched.W, bc = e.bestCell;
  const solved = e.solvedPool.slice(bc * W, bc * W + W);
  const k = 5;
  const { genomes, distances } = distantElites(e, solved, k);
  assert.equal(genomes.length, Math.min(k, e.nFilled));
  for (let i = 1; i < distances.length; i++) assert.ok(distances[i - 1] >= distances[i]);
  const all = [];
  for (let i = 0; i < e.nFilled; i++) {
    const c = e.filled[i];
    let d = 0;
    for (let w = 0; w < W; w++) { let x = (e.solvedPool[c * W + w] ^ solved[w]) >>> 0; while (x) { d += x & 1; x >>>= 1; } }
    all.push(d);
  }
  all.sort((x, y) => y - x);
  assert.deepEqual(distances, all.slice(0, distances.length));
  assert.ok(distances[0] > 0);
});

test('restart: fires after restartMs flat, never loses the best (the hall of fame), and changes nothing before it first fires', () => {
  const planes = { a: small('t/r1') };
  const ctl = runArm({ planes, arm: ARMS.control, seed: 's', wallMs: 3000, clock: counter(), lmax: LM, restartMs: 200 });
  const rst = runArm({ planes, arm: ARMS.restart, seed: 's', wallMs: 3000, clock: counter(), lmax: LM, restartMs: 200 });
  const r = rst.planes.a;
  assert.ok(r.restarts >= 2, 'restarts ' + r.restarts);
  assert.equal(ctl.planes.a.restarts, 0);
  for (let i = 1; i < r.rows.length; i++) assert.ok(r.rows[i].objective >= r.rows[i - 1].objective, 'the searched best fell at row ' + i);
  const first = r.restartLog[0];
  assert.ok(first.carried > 0 && first.carried <= RESTART.carry);
  // before the first restart the two arms are the same run, row for row
  const before = (rows) => rows.filter((x) => x.tMs < first.atMs);
  assert.deepEqual(before(r.rows), before(ctl.planes.a.rows));
  assert.ok(before(r.rows).length >= 2, "two rows at least before the first restart, or the equality shows nothing");
  // and after it they are not
  assert.notDeepEqual(r.rows.map((x) => x.evals), ctl.planes.a.rows.map((x) => x.evals));
});

// ---------------------------------------------------------------- TRANSFER
test('transfer: only descriptor-matched migrants are offered, component indices mapped into the receiver; off, nothing crosses', () => {
  const planes = { a: small('t/x1'), b: small('t/x2', { components: 200 }) };
  const on = runArm({ planes, arm: ARMS.transfer, seed: 's', wallMs: 2000, clock: counter(), lmax: LM });
  const off = runArm({ planes, arm: ARMS.control, seed: 's', wallMs: 2000, clock: counter(), lmax: LM });
  for (const k of ['a', 'b']) {
    const t = on.planes[k].transfer;
    assert.ok(t.tried > 0);
    assert.ok(t.matched <= t.tried && t.accepted <= t.matched);
    assert.equal(t.evals, t.tried + t.matched);
    assert.deepEqual(off.planes[k].transfer, { tried: 0, matched: 0, accepted: 0, evals: 0 });
  }
  // the migrant check itself: a library that lands elsewhere is never offered
  assert.ok(on.planes.a.transfer.matched < on.planes.a.transfer.tried);
});

// ---------------------------------------------------------------- the held-out draw decides nothing
test('the held-out draw is read only to write rows: another held-out draw changes no decision in any arm', () => {
  const p = small('t/h1'), q = small('t/h2');
  const other = { searched: p.searched, fresh: q.fresh };
  for (const arm of [ARMS.control, ARMS.novelty, ARMS.restart, ARMS.transfer, { novelty: true, transfer: true, restart: true }]) {
    const planesA = { a: p, b: small('t/h3') }, planesB = { a: other, b: planesA.b };
    const x = runArm({ planes: planesA, arm, seed: 's', wallMs: 1500, clock: counter(), lmax: LM, restartMs: 150 });
    const y = runArm({ planes: planesB, arm, seed: 's', wallMs: 1500, clock: counter(), lmax: LM, restartMs: 150 });
    const strip = (rows) => rows.map(({ heldout, ...rest }) => rest);
    assert.deepEqual(strip(x.planes.a.rows), strip(y.planes.a.rows), armName(arm));
    assert.deepEqual(x.planes.b.rows, y.planes.b.rows, armName(arm));
    assert.notDeepEqual(x.planes.a.rows.map((r) => r.heldout), y.planes.a.rows.map((r) => r.heldout), 'the two held-out draws must score differently or this test shows nothing');
  }
});

test('armName and the arms', () => {
  assert.equal(armName(ARMS.control), 'control');
  assert.equal(armName({ novelty: true, restart: true }), 'novelty+restart');
  assert.equal(armName({ novelty: true, transfer: true, restart: true }), 'novelty+transfer+restart');
});

// ---------------------------------------------------------------- the comparison, the combination, the bar
function fakeRun(seed, arm, byPlane) {
  const planes = {};
  for (const [k, v] of Object.entries(byPlane)) {
    const rows = v.series.map((h, i) => ({ tMs: i * 1000, gen: i * 100, heldout: h, searched: 0 }));
    planes[k] = { rows, final: rows[rows.length - 1], plateau: plateauOf(rows), organismYears: rows[rows.length - 1].gen };
  }
  return { seed, arm, planes };
}

test('compareArm pairs by seed, reads the arm\'s gain after the CONTROL\'s plateau second, and takes the larger sd as the noise', () => {
  const ctl = [fakeRun('s1', 'control', { g: { series: [1, 3, 3, 3] } }), fakeRun('s2', 'control', { g: { series: [1, 2, 2, 2] } })];
  const arm = [fakeRun('s2', 'restart', { g: { series: [1, 2, 4, 6] } }), fakeRun('s1', 'restart', { g: { series: [1, 3, 3, 5] } }), fakeRun('s9', 'restart', { g: { series: [9, 9, 9, 9] } })];
  const c = compareArm(ctl, arm, 'g');
  assert.equal(c.n, 2);
  assert.deepEqual(c.seeds, ['s2', 's1']);
  assert.equal(c.controlFinal.mean, 2.5);
  assert.equal(c.armFinal.mean, 5.5);
  assert.equal(c.noise, Math.max(stats([3, 2]).sd, stats([6, 5]).sd));
  const s2 = c.rows[0];
  assert.equal(s2.controlPlateauMs, 1000);
  assert.equal(s2.armAfter.gained, 4);
  assert.equal(s2.controlAfter.gained, 0);
  assert.equal(s2.armPlateauMs, 3000);
  assert.equal(c.beatsByMoreThanNoise, true);
  assert.equal(c.plateauLater, true);
});

function cmp(controlMean, armMean, sd, cPl, aPl) {
  return { armFinal: { mean: armMean, sd }, controlFinal: { mean: controlMean, sd }, noise: sd, beatsByMoreThanNoise: armMean - controlMean > sd, plateauLater: aPl > cPl };
}

test('chooseCombination: keeps an intervention at or above the control on both planes and above on one; none kept falls back to the best single', () => {
  const T = { grid: 160, synthetic: 256 };
  const a = chooseCombination({
    novelty: { grid: cmp(100, 101, 1, 1, 1), synthetic: cmp(200, 200, 1, 1, 1) },
    transfer: { grid: cmp(100, 100, 1, 1, 1), synthetic: cmp(200, 200, 1, 1, 1) },
    restart: { grid: cmp(100, 103, 1, 1, 1), synthetic: cmp(200, 199, 1, 1, 1) },
  }, T);
  assert.deepEqual(a.chosen, ['novelty']);
  assert.equal(a.name, 'novelty');
  assert.equal(a.fallback, false);
  const b = chooseCombination({
    novelty: { grid: cmp(100, 101, 1, 1, 1), synthetic: cmp(200, 200, 1, 1, 1) },
    restart: { grid: cmp(100, 100, 1, 1, 1), synthetic: cmp(200, 202, 1, 1, 1) },
    transfer: { grid: cmp(100, 99, 1, 1, 1), synthetic: cmp(200, 200, 1, 1, 1) },
  }, T);
  assert.equal(b.name, 'novelty+restart');
  const c = chooseCombination({
    novelty: { grid: cmp(100, 99, 1, 1, 1), synthetic: cmp(200, 203, 1, 1, 1) },
    restart: { grid: cmp(100, 98, 1, 1, 1), synthetic: cmp(200, 201, 1, 1, 1) },
    transfer: { grid: cmp(100, 100, 1, 1, 1), synthetic: cmp(200, 200, 1, 1, 1) },
  }, T);
  assert.equal(c.fallback, true);
  assert.deepEqual(c.chosen, ['novelty']);
});

test('barVerdict: met only when the combination beats the noise AND plateaus later on BOTH planes', () => {
  assert.equal(barVerdict({ grid: cmp(100, 105, 2, 10, 20), synthetic: cmp(200, 205, 2, 10, 20) }).met, true);
  assert.equal(barVerdict({ grid: cmp(100, 105, 2, 10, 20), synthetic: cmp(200, 201, 2, 10, 20) }).met, false);
  assert.equal(barVerdict({ grid: cmp(100, 105, 2, 10, 20), synthetic: cmp(200, 205, 2, 30, 20) }).met, false);
  assert.equal(barVerdict({ grid: cmp(100, 102, 2, 10, 20), synthetic: cmp(200, 205, 2, 10, 20) }).met, false, 'a gain equal to the noise is not more than the noise');
  assert.equal(barVerdict({}).met, false);
});

// ---------------------------------------------------------------- the worker boundary
test('runJobs: an arm runs in a worker thread and comes back whole; a bad job rejects', async () => {
  const p = small('t/w');
  const wire = { a: { searched: matrixToWire(p.searched), fresh: matrixToWire(p.fresh) } };
  const [r] = await runJobs([{ planes: wire, arm: ARMS.novelty, seed: 'w', wallMs: 300, lmax: LM }]);
  assert.equal(r.arm, 'novelty');
  assert.equal(r.planes.a.descriptor, 'behaviour');
  assert.ok(r.planes.a.generations > 0);
  assert.ok(r.planes.a.rows.length >= 2);
  await assert.rejects(runJobs([{ planes: wire, arm: ARMS.control, seed: 'w', wallMs: 0 }]), /wall budget/);
});

// ---------------------------------------------------------------- the split, the gaps, the diagnostic (board 24A, second pass)
test('the split: tuning, held-out, smoke and the retired smoke run share no seed string, and the strings are the ones the planes derive', () => {
  const t = splitSeedStrings('tune', 5), h = splitSeedStrings('heldout', 5), sm = splitSeedStrings('smoke', 5), r = retiredSeedStrings();
  const sets = { t, h, sm, r };
  for (const [a, A] of Object.entries(sets)) for (const [b, B] of Object.entries(sets)) if (a < b) assert.deepEqual([...A].filter((x) => B.has(x)), [], a + ' and ' + b + ' overlap');
  assert.deepEqual(runSeeds('heldout', 3), ['heldout-1', 'heldout-2', 'heldout-3']);
  // the retired run seeds are exactly the ones the earlier smoke run used, and the held-out side is not named fresh
  assert.deepEqual([...SPLIT.retired.runSeeds], ['fresh-1', 'fresh-2']);
  for (const x of h) assert.ok(!x.includes('/fresh/') && !/^fresh-/.test(x), x);
  // the strings a small cover plane derives are the ones splitSeedStrings names for its seed
  const p = small(SPLIT.tune.synthetic, { draws: 4 });
  for (const x of p.seeds) assert.ok(t.has(x), 'missing ' + x);
  assert.ok(t.has(p.freshSeed));
  assert.throws(() => splitSeedStrings('retired', 2), /unknown side/);
});

test('searchedGaps: the gaps between rises of the searched objective, longest first; a flat series has none', () => {
  const rows = [1, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4].map((o, i) => ({ tMs: i * 100, objective: o }));
  const g = searchedGaps(rows);
  assert.equal(g.rises, 3);
  assert.equal(g.lastRiseMs, 900);
  assert.deepEqual(g.gaps, [{ ms: 500, fromMs: 400 }, { ms: 300, fromMs: 100 }]);
  const flat = searchedGaps([5, 5, 5].map((o, i) => ({ tMs: i * 100, objective: o })));
  assert.equal(flat.rises, 0); assert.equal(flat.lastRiseMs, null); assert.deepEqual(flat.gaps, []);
});

test('spearman: +1 and -1 on monotone series, average ranks on ties, null when a side is constant or under three points', () => {
  assert.equal(spearman([1, 2, 3, 4], [10, 20, 30, 40]), 1);
  assert.equal(spearman([1, 2, 3, 4], [4, 3, 2, 1]), -1);
  const t = spearman([1, 2, 3, 4], [1, 1, 2, 2]);
  assert.ok(t > 0.89 && t < 0.9, String(t));
  assert.equal(spearman([1, 2, 3], [5, 5, 5]), null);
  assert.equal(spearman([1, 2], [1, 2]), null);
});

test('archiveHeldout: every elite scored on the held-out draw after the run; the oracle is at least the pick for the control, and it changes no row', () => {
  const p = small('t/arch');
  const planes = { a: p };
  const x = runArm({ planes, arm: ARMS.control, seed: 's', wallMs: 1500, clock: counter(), lmax: LM });
  const a = x.planes.a.archive;
  assert.ok(a.elites > 1);
  assert.equal(a.pickHeldout, x.planes.a.final.heldout);
  assert.ok(a.maxHeldout >= a.pickHeldout);
  assert.equal(a.top10.searched.length, Math.min(10, a.elites));
  for (let i = 1; i < a.top10.searched.length; i++) assert.ok(a.top10.searched[i - 1] >= a.top10.searched[i], 'top10 is by fitness, and fitness orders the count first');
  // computed from an engine by hand, it agrees
  const e = new MatrixElites(p.searched, { seed: 'h', lmax: 12 });
  for (let i = 0; i < 30; i++) e.step();
  const L = e.lmax, bc = e.bestCell;
  const hof = { genome: e.pool.slice(bc * L, bc * L + e.len[bc]) };
  const d = archiveHeldout(e, p.fresh, hof);
  let mx = -1;
  for (let i = 0; i < e.nFilled; i++) { const c = e.filled[i]; mx = Math.max(mx, p.fresh.score(e.pool.subarray(c * L, c * L + e.len[c])).count); }
  assert.equal(d.maxHeldout, mx);
  assert.equal(d.elites, e.nFilled);
  assert.equal(d.pickHeldout, p.fresh.score(hof.genome).count);
  // archiveHeldout reads the engine and the hall of fame and writes neither
  const snap = (en) => ({ pool: Array.from(en.pool), len: Array.from(en.len), fit: Array.from(en.fit), cnt: Array.from(en.cnt), filled: Array.from(en.filled.subarray(0, en.nFilled)), solved: Array.from(en.solvedPool), nFilled: en.nFilled, bestCell: en.bestCell });
  const before = snap(e), hofBefore = Array.from(hof.genome);
  archiveHeldout(e, p.fresh, hof);
  assert.deepEqual(snap(e), before);
  assert.deepEqual(Array.from(hof.genome), hofBefore);
  // a run WITHOUT the diagnostic (diagnostic: false skips archiveHeldout): the switch took effect
  // (no archive), and every row, the final row and the best are the rows of the run with it
  const y = runArm({ planes, arm: ARMS.control, seed: 's', wallMs: 1500, clock: counter(), lmax: LM, diagnostic: false });
  assert.equal(y.planes.a.archive, null);
  assert.notEqual(x.planes.a.archive, null);
  assert.ok(x.planes.a.rows.length > 2);
  assert.deepEqual(y.planes.a.rows, x.planes.a.rows);
  assert.deepEqual(y.planes.a.final, x.planes.a.final);
  assert.deepEqual(y.planes.a.best, x.planes.a.best);
  assert.equal(y.planes.a.generations, x.planes.a.generations);
});

test('describePlane: every number is read off the built plane and the cap passed in, on the defaults and on a non-default plane', () => {
  // a non-default cover plane: the words name ITS numbers, and none of the defaults it does not share
  const p = small('t/describe', { families: 40 });
  const w = describePlane(p, 12);
  assert.equal(w, 'a synthetic cover plane (256 generated components over 40 task families, 2 searched draws of 64 tasks, a length cap of 12, scored on a fresh draw of 64 tasks)');
  for (const d of [String(COVER_DEFAULTS.families), String(COVER_DEFAULTS.components), String(LMAX.synthetic)]) assert.ok(!w.includes(d), 'the default ' + d + ' leaked into a non-default plane');
  // the default cover plane: the defaults the bench runs
  const c = coverPlane({ seed: 't/describe-default' });
  assert.equal(describePlane(c, LMAX.synthetic), 'a synthetic cover plane (' + COVER_DEFAULTS.components + ' generated components over ' + COVER_DEFAULTS.families + ' task families, ' + COVER_DEFAULTS.draws + ' searched draws of ' + COVER_DEFAULTS.tasksPerDraw + ' tasks, a length cap of ' + LMAX.synthetic + ', scored on a fresh draw of ' + COVER_DEFAULTS.tasksPerDraw + ' tasks)');
  // a grid plane with 2 draws: its draw count, its per-draw size and its held-out size come off the matrices
  const g = gridPlane({ seed: 't/describe-grid', draws: 2 });
  const gw = describePlane(g, 7);
  assert.equal(g.searched.draws, 2);
  assert.ok(gw.startsWith('the grid plane (tasks/grid.mjs, ' + g.searched.C + ' components, 2 searched draws of ' + (g.searched.T / 2) + ' tasks, a length cap of 7, scored on a held-out draw of ' + g.fresh.T + ' tasks)'), gw);
  assert.throws(() => describePlane(p, 0), /length cap/);
  assert.throws(() => describePlane({ ...p, kind: 'other' }, 12), /unknown plane kind/);
  assert.throws(() => describePlane({ ...p, options: {} }, 12), /family count/);
});
