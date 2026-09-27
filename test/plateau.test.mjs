// test/plateau.test.mjs: the plateau reader, the cover plane, the three interventions and the bar.
// No model is called; no server is started; the worker threads a test starts end with their job.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ARMS, armName, coverPlane, behaviourDescriptor, distantElites, probeCell, runArm, runJobs,
  plateauOf, rowAt, gainAfter, stats, compactRows, compareArm, chooseCombination, barVerdict,
  matrixToWire, matrixFromWire, RESTART,
  SPLIT, runSeeds, splitSeedStrings, retiredSeedStrings, searchedGaps, spearman, archiveHeldout,
  describePlane, gridPlane, LMAX, COVER_DEFAULTS, sourceClosure, rerunLedger, rerunWords,
  BUDGET, plateauGenOf, searchedGapsGen, searchDigest, repeatOf, statementNumbers,
} from '../generations/plateau.mjs';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EvalMatrix, MatrixElites, syntheticMatrix } from '../generations/velocity.mjs';

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

// ---------------------------------------------------------------- the build and the re-run ledger (board 24A, fix pass)
test('sourceClosure: static, bare, multi-line, export-from and dynamic imports are followed; a file nobody imports is not hashed; a missing one is listed', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'plateau-closure-'));
  try {
    const w = (r, t) => { mkdirSync(path.dirname(path.join(dir, r)), { recursive: true }); writeFileSync(path.join(dir, r), t); };
    w('a.mjs', "import os from 'node:os';\nimport { b } from './b.mjs';\nimport './sub/c.mjs';\nimport {\n  q,\n  r\n} from './m.mjs';\n");
    w('b.mjs', "export const b = 1;\nexport async function f() { return import('./d.mjs'); }\nexport async function g() { return import(\"./gone.mjs\"); }\n");
    w('sub/c.mjs', "export { x } from '../e.mjs';\n");
    w('d.mjs', 'export const d = 1;\n'); w('e.mjs', 'export const x = 1;\n'); w('m.mjs', 'export const q = 1, r = 2;\n');
    w('z.mjs', 'export const z = 1;\n');
    const c = sourceClosure([path.join(dir, 'a.mjs')], dir);
    assert.deepEqual(c.files, ['a.mjs', 'b.mjs', 'd.mjs', 'e.mjs', 'm.mjs', 'sub/c.mjs']);
    assert.deepEqual(c.missing, ['gone.mjs']);
    assert.match(c.hash, /^[0-9a-f]{64}$/);
    assert.equal(sourceClosure([path.join(dir, 'a.mjs')], dir).hash, c.hash, 'the same bytes hash the same');
    w('z.mjs', 'export const z = 2;\n');
    assert.equal(sourceClosure([path.join(dir, 'a.mjs')], dir).hash, c.hash, 'a file nobody imports changes no build');
    w('e.mjs', 'export const x = 2;\n');
    const c2 = sourceClosure([path.join(dir, 'a.mjs')], dir);
    assert.notEqual(c2.hash, c.hash, 'a file two imports deep changes the build');
    w('gone.mjs', 'export {};\n');
    const c3 = sourceClosure([path.join(dir, 'a.mjs')], dir);
    assert.deepEqual(c3.missing, []);
    assert.notEqual(c3.hash, c2.hash, 'a missing file that appears changes the build');
  } finally { rmSync(dir, { recursive: true, force: true }); }
  // the bench itself: the closure reaches the loop, the engine, the grid tasks and the worker's dynamic import
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const b = sourceClosure([path.join(root, 'bench', 'plateau.mjs')], root);
  for (const need of ['bench/plateau.mjs', 'generations/plateau.mjs', 'generations/velocity.mjs', 'generations/years.mjs', 'generations/planes.mjs', 'tasks/grid.mjs', 'core/rng.mjs']) assert.ok(b.files.includes(need), need + ' is loaded by the bench and must be in its build');
  assert.ok(!b.files.some((x) => x.startsWith('state/') || x.startsWith('test/')), 'no runtime state and no test file is part of the build');
});

const ledgerEntry = (at, build, o = {}) => ({
  at, build, barMet: o.barMet ?? false, combination: o.combination ?? 'transfer',
  per: {
    grid: { beats: o.gb ?? false, later: o.gl ?? false, diff: o.gd ?? -1, controlFinal: o.gc ?? 119, armFinal: o.ga ?? 118, controlPlateauS: o.gp ?? 25, armPlateauS: o.gq ?? 5 },
    synthetic: { beats: false, later: o.sl ?? false, diff: -1.4, controlFinal: o.sc ?? 217.8, armFinal: 216.4, controlPlateauS: o.sp ?? 37, armPlateauS: o.sq ?? 43.6 },
  },
});

test('rerunLedger: carries only the same build, keeps a repeated at once, counts every boolean and ranges every number; one run is not a spread', () => {
  // one run, nothing before it: not measured, a range of one value
  const one = rerunLedger(null, ledgerEntry('t3', 'H'));
  assert.equal(one.n, 1); assert.equal(one.measured, false); assert.equal(one.droppedOtherBuild, 0);
  assert.deepEqual(one.per.grid.range.controlFinal, { n: 1, min: 119, max: 119, sd: 0 });
  // three earlier entries of build H (one repeated), one of build K, one junk row
  const prev = [
    ledgerEntry('t1', 'H', { sl: true, sc: 225, sp: 70.9, gc: 119.2 }),
    ledgerEntry('t1', 'H', { sl: true, sc: 225, sp: 70.9, gc: 119.2 }),
    ledgerEntry('t2', 'H', { sl: false, sc: 224.4, sp: 52.95, gc: 119 }),
    ledgerEntry('t0', 'K', { barMet: true, gb: true, gl: true, sl: true, gc: 1000 }),
    null,
  ];
  const L = rerunLedger(prev, ledgerEntry('t3', 'H', { sl: true, sc: 225, sp: 37, gc: 119.2, combination: 'novelty' }));
  assert.equal(L.n, 3); assert.equal(L.measured, true);
  assert.equal(L.droppedOtherBuild, 1); assert.equal(L.droppedDuplicate, 1);
  assert.deepEqual(L.runs.map((r) => r.at), ['t1', 't2', 't3']);
  assert.equal(L.barMetTrue, 0, 'the other build met the bar and is not counted');
  assert.deepEqual(L.combinations, { transfer: 2, novelty: 1 });
  assert.equal(L.per.synthetic.trueCount.later, 2, 'the flip the verify plane saw is counted, 2 of 3');
  assert.equal(L.per.synthetic.trueCount.beats, 0);
  assert.equal(L.per.grid.trueCount.later, 0);
  assert.equal(L.per.grid.range.controlFinal.min, 119); assert.equal(L.per.grid.range.controlFinal.max, 119.2);
  assert.equal(L.per.synthetic.range.controlPlateauS.min, 37); assert.equal(L.per.synthetic.range.controlPlateauS.max, 70.9);
  assert.ok(L.per.synthetic.range.controlFinal.sd > 0);
  // the run's own at is never carried twice, even when the verdict on disk already holds it
  assert.equal(rerunLedger([ledgerEntry('t3', 'H')], ledgerEntry('t3', 'H')).n, 1);
  assert.throws(() => rerunLedger([], { at: 't', per: {} }), /needs at, build and per/);
});

test('rerunWords: one run says NOT measured and names no range; more runs name the counts and ranges the ledger holds', () => {
  const w1 = rerunWords(rerunLedger([ledgerEntry('t0', 'K')], ledgerEntry('t1', 'abcdef0123456789ffff')), { files: 91 });
  assert.match(w1, /first bar run of this build \(sha256 abcdef0123456789, 91 source files\)/);
  assert.match(w1, /not measured/);
  assert.match(w1, /1 earlier run\(s\) of other builds were dropped/);
  assert.ok(!/beat the noise in|plateaued later in/.test(w1), 'one run names no spread');
  const L = rerunLedger([ledgerEntry('t1', 'H', { sl: true, sp: 70.9 }), ledgerEntry('t2', 'H', { sp: 52.95 })], ledgerEntry('t3', 'H', { sl: true, sp: 37 }));
  const w = rerunWords(L);
  assert.match(w, /bar run 3 of this build/);
  assert.match(w, /the bar was met in 0/);
  assert.match(w, /the singles chose transfer 3 \(runs per combination\)/);
  assert.match(w, /grid beat the noise in 0 and plateaued later in 0 \(control final 119\.00, combination final 118\.00, control plateau 25\.00 s, combination plateau 5\.00 s\)/);
  assert.match(w, /synthetic beat the noise in 0 and plateaued later in 2 \(control final 217\.80, combination final 216\.40, control plateau 37\.00\.\.70\.90 s, combination plateau 43\.60 s\)/);
  assert.ok(!/not measured/.test(w));
});

// ---------------------------------------------------------------- the generation budget and the repeat (board 26, item plateau-repeat)
// a PLANTED small plane (velocity.mjs syntheticMatrix: the optimum is 8 planted components), its held-out side another planted world of the same shape
const plantedPlane = (seed) => {
  const shape = { tasks: 64, planted: 8, decoys: 56, decoyFit: 12, decoyRight: 4 };
  return { searched: syntheticMatrix({ seed, ...shape }).matrix, fresh: syntheticMatrix({ seed: seed + ':fresh', ...shape }).matrix };
};
const stripWall = (rows) => rows.map(({ tMs, ...rest }) => rest);

test('generation budget: two searches at one seed on a planted small plane draw the same search and the same plateau generations, whatever the clock; a wall budget does not', () => {
  const planes = { a: plantedPlane('t/planted'), b: small('t/g2') };
  const budget = { generations: 900, rowEveryGens: 10, restartGens: 60 };
  for (const arm of [ARMS.control, ARMS.novelty, ARMS.transfer, ARMS.restart, { novelty: true, transfer: true, restart: true }]) {
    const x = runArm({ planes, arm, seed: 's', ...budget, clock: counter(0.5), lmax: LM });
    const y = runArm({ planes, arm, seed: 's', ...budget, clock: counter(7.3), lmax: LM });
    for (const k of ['a', 'b']) {
      const px = x.planes[k], py = y.planes[k];
      assert.equal(px.generations, 900, armName(arm) + ' ' + k + ' ran exactly the budget');
      assert.equal(py.generations, 900);
      assert.ok(px.plateauGen && Number.isInteger(px.plateauGen.atGen));
      assert.equal(px.plateauGen.atGen, py.plateauGen.atGen, armName(arm) + ' ' + k + ': the plateau generation is the same on both runs');
      assert.equal(px.searchedPlateauGen.atGen, py.searchedPlateauGen.atGen);
      assert.deepEqual(stripWall(px.rows), stripWall(py.rows), armName(arm) + ' ' + k + ': every row but its wall time');
      assert.deepEqual(px.restartLog.map((r) => r.gen), py.restartLog.map((r) => r.gen));
      assert.deepEqual(px.transfer, py.transfer);
      // the two clocks did differ, or the equalities above show nothing
      assert.notDeepEqual(px.rows.map((r) => r.tMs), py.rows.map((r) => r.tMs));
    }
    assert.equal(searchDigest([x]), searchDigest([y]), armName(arm));
    assert.equal(x.budget.kind, 'generations');
    assert.deepEqual({ generations: x.budget.generations, rowEveryGens: x.budget.rowEveryGens, restartGens: x.budget.restartGens }, budget);
  }
  // the restart clock counts generations: the restart arm fired on the planted plane and at a whole number of generations
  const r = runArm({ planes, arm: ARMS.restart, seed: 's', ...budget, clock: counter(0.5), lmax: LM });
  assert.ok(r.planes.a.restarts + r.planes.b.restarts >= 1, 'a restart fired, so the generation restart clock was exercised');
  // the CONTROL of this test: the same arm under a WALL budget with the two clocks draws two different searches
  const wx = runArm({ planes, arm: ARMS.restart, seed: 's', wallMs: 450, clock: counter(0.5), lmax: LM, restartMs: 30 });
  const wy = runArm({ planes, arm: ARMS.restart, seed: 's', wallMs: 450, clock: counter(7.3), lmax: LM, restartMs: 30 });
  assert.notEqual(wx.planes.a.generations, wy.planes.a.generations);
  assert.notEqual(searchDigest([wx]), searchDigest([wy]));
  assert.equal(wx.budget.kind, 'wall');
});

test('generation budget: the restart fires after restartGens flat, never loses the best, and changes nothing before it first fires', () => {
  const planes = { a: small('t/rg') };
  const ctl = runArm({ planes, arm: ARMS.control, seed: 's', generations: 1500, rowEveryGens: 5, restartGens: 40, clock: counter(), lmax: LM });
  const rst = runArm({ planes, arm: ARMS.restart, seed: 's', generations: 1500, rowEveryGens: 5, restartGens: 40, clock: counter(), lmax: LM });
  const r = rst.planes.a;
  assert.ok(r.restarts >= 2, 'restarts ' + r.restarts);
  assert.equal(ctl.planes.a.restarts, 0);
  for (let i = 1; i < r.rows.length; i++) assert.ok(r.rows[i].objective >= r.rows[i - 1].objective, 'the searched best fell at row ' + i);
  const first = r.restartLog[0];
  assert.ok(first.gen >= 40, 'the first restart waited restartGens generations at least');
  const before = (rows) => rows.filter((x) => x.gen < first.gen);
  assert.deepEqual(stripWall(before(r.rows)), stripWall(before(ctl.planes.a.rows)));
  assert.ok(before(r.rows).length >= 2);
  // a restartGens longer than the run never fires
  const never = runArm({ planes, arm: ARMS.restart, seed: 's', generations: 300, rowEveryGens: 5, restartGens: 301, clock: counter(), lmax: LM });
  assert.equal(never.planes.a.restarts, 0);
  // the defaults: rows and restart from BUDGET and RESTART.restartShare
  const d = runArm({ planes, arm: ARMS.control, seed: 's', generations: 2000, clock: counter(), lmax: LM, diagnostic: false });
  assert.equal(d.budget.restartGens, Math.round(2000 * RESTART.restartShare));
  assert.equal(d.budget.rowEveryGens, Math.max(1, Math.round(2000 * BUDGET.rowEveryGens / BUDGET.generations)));
  assert.ok(Number.isInteger(BUDGET.generations) && BUDGET.generations > 0);
});

test('runArm budgets: a generation budget or a wall budget, never both, and a generation budget is a whole number', () => {
  const planes = { a: small('t/v') };
  assert.throws(() => runArm({ planes, seed: 's', generations: 10, wallMs: 100 }), /not both/);
  assert.throws(() => runArm({ planes, seed: 's', generations: 0 }), /whole number above 0/);
  assert.throws(() => runArm({ planes, seed: 's', generations: 10.5 }), /whole number above 0/);
  assert.throws(() => runArm({ planes, seed: 's' }), /wall budget|generation budget/);
  assert.throws(() => runArm({ planes, seed: 's', generations: 10, rowEveryGens: 0.5 }), /whole numbers/);
});

test('runJobs: two worker-thread runs of one seed under a generation budget come back with the same search digest and plateau generations', async () => {
  const p = plantedPlane('t/wpl'), q = small('t/wq');
  const wire = { a: { searched: matrixToWire(p.searched), fresh: matrixToWire(p.fresh) }, b: { searched: matrixToWire(q.searched), fresh: matrixToWire(q.fresh) } };
  const job = (arm) => ({ planes: wire, arm, seed: 'w', generations: 700, rowEveryGens: 7, restartGens: 50, lmax: LM });
  const one = await runJobs([job(ARMS.control), job(ARMS.transfer), job(ARMS.restart)]);
  const two = await runJobs([job(ARMS.restart), job(ARMS.control), job(ARMS.transfer)]);
  const byArm = (rs) => Object.fromEntries(rs.map((r) => [r.arm, r]));
  const A = byArm(one), B = byArm(two);
  assert.equal(searchDigest(one), searchDigest(two));
  for (const arm of ['control', 'transfer', 'restart']) for (const k of ['a', 'b']) {
    assert.equal(A[arm].planes[k].plateauGen.atGen, B[arm].planes[k].plateauGen.atGen, arm + ' ' + k);
    assert.equal(A[arm].planes[k].generations, 700);
  }
  // the digest sees a different search: another seed changes it
  const other = await runJobs([{ ...job(ARMS.control), seed: 'w2' }]);
  assert.notEqual(searchDigest([other[0]]), searchDigest([A.control]));
});

test('plateauGenOf and searchedGapsGen read the generation of the plateauOf row and the gaps in generations', () => {
  const rows = [3, 5, 5, 4, 6, 6, 5].map((h, i) => ({ tMs: i * 100 + 7, heldout: h, gen: i * 10, objective: [1, 2, 2, 2, 3, 3, 3][i] }));
  assert.deepEqual(plateauGenOf(rows, 'heldout'), { atGen: 40, atMs: 407, score: 6 });
  assert.equal(plateauGenOf(rows, 'heldout').atMs, plateauOf(rows, 'heldout').atMs, 'the same row as plateauOf');
  assert.equal(plateauGenOf([], 'heldout'), null);
  const g = searchedGapsGen(rows);
  assert.equal(g.rises, 2); assert.equal(g.lastRiseGen, 40);
  assert.deepEqual(g.gaps, [{ gens: 30, fromGen: 10 }]);
  assert.equal(rowAt(rows, 25, 'gen').gen, 20);
  assert.equal(gainAfter(rows, 25, 'heldout', 'gen').fromGen, 20);
});

test('compareArm on the generation axis: later is read in generations even when the wall seconds say the opposite', () => {
  const run = (seed, arm, series, gens, times) => {
    const rows = series.map((h, i) => ({ tMs: times[i], gen: gens[i], heldout: h, searched: 0 }));
    return { seed, arm, planes: { g: { rows, final: rows[rows.length - 1], plateau: plateauOf(rows), plateauGen: plateauGenOf(rows), organismYears: rows[rows.length - 1].gen } } };
  };
  // control plateaus at generation 200 (second 4.0); the arm at generation 300 but, running faster, at second 1.5
  const ctl = [run('s1', 'control', [1, 2, 3, 3], [0, 100, 200, 300], [0, 2000, 4000, 6000])];
  const arm = [run('s1', 'transfer', [1, 2, 3, 4], [0, 100, 200, 300], [0, 500, 1000, 1500])];
  const gen = compareArm(ctl, arm, 'g', { axis: 'gen' });
  const wall = compareArm(ctl, arm, 'g');
  assert.equal(gen.axis, 'gen'); assert.equal(wall.axis, 'tMs');
  assert.equal(gen.controlPlateauGen.mean, 200); assert.equal(gen.armPlateauGen.mean, 300);
  assert.equal(gen.plateauLater, true, 'later by generations');
  assert.equal(wall.plateauLater, false, 'earlier by wall seconds');
  assert.equal(gen.controlPlateauMs.mean, 4000); assert.equal(gen.armPlateauMs.mean, 1500);
  // the arm's gain after the control's plateau is read at the control's plateau GENERATION
  assert.equal(gen.rows[0].armAfter.fromGen, 200); assert.equal(gen.rows[0].armAfter.gained, 1);
  assert.throws(() => compareArm(ctl, arm, 'g', { axis: 'years' }), /axis/);
});

const repEntry = (at, o = {}) => ({
  at, build: 'B', barMet: false, combination: 'transfer', digest: o.digest ?? 'd1',
  per: {
    grid: { beats: false, later: o.gl ?? false, diff: o.gd ?? -1.2, noise: o.gn ?? 3.16, controlFinal: 119, armFinal: 118, controlPlateauS: o.gcs ?? 25, armPlateauS: o.gas ?? 5, controlPlateauGen: o.gcg ?? 40000, armPlateauGen: o.gag ?? 9000 },
    synthetic: { beats: false, later: true, diff: o.sd ?? -1.4, noise: o.sn ?? 7.05, controlFinal: 217.8, armFinal: 216.4, controlPlateauS: o.scs ?? 37, armPlateauS: 43.6, controlPlateauGen: 70000, armPlateauGen: 80000 },
  },
});

test('repeatOf: both runs per plane, the largest move of the difference, and under the noise only with two runs and a move under the smallest noise on every plane', () => {
  // one run: nothing is measured and nothing is under the noise
  const one = repeatOf(rerunLedger(null, repEntry('t1')));
  assert.equal(one.n, 1); assert.equal(one.measured, false); assert.equal(one.underNoise, false);
  assert.equal(one.largestMove, 0);
  // two identical runs (the same search): every move is 0, under the noise
  const same = repeatOf(rerunLedger([repEntry('t1')], repEntry('t2', { gcs: 31.5, scs: 40 })));
  assert.equal(same.n, 2); assert.equal(same.measured, true); assert.equal(same.underNoise, true); assert.equal(same.sameSearch, true);
  assert.equal(same.largestMove, 0);
  assert.deepEqual(same.per.grid.runs.map((r) => r.at), ['t1', 't2']);
  assert.equal(same.per.grid.plateauSMove.control, 6.5, 'the plateau second moved while the search did not');
  assert.equal(same.per.grid.plateauGenMove.control, 0);
  // the verify plane's case: the difference moved, on synthetic by more than its smaller noise
  const moved = repeatOf(rerunLedger([repEntry('t1', { sd: -1.4, sn: 7.05 })], repEntry('t2', { sd: 6.0, sn: 7.53, digest: 'd2' })));
  assert.equal(moved.largestMovePlane, 'synthetic');
  assert.ok(Math.abs(moved.largestMove - 7.4) < 1e-9);
  assert.equal(moved.per.synthetic.noiseMin, 7.05);
  assert.equal(moved.per.synthetic.moveUnderNoise, false);
  assert.equal(moved.per.grid.moveUnderNoise, true);
  assert.equal(moved.underNoise, false, 'one plane over its noise fails the repeat');
  assert.equal(moved.sameSearch, false);
  // a move exactly at the noise is not under it; a zero noise admits no move at all
  const edge = repeatOf(rerunLedger([repEntry('t1', { gd: 0 })], repEntry('t2', { gd: 3.16 })));
  assert.equal(edge.per.grid.moveUnderNoise, false);
  const zero = repeatOf(rerunLedger([repEntry('t1', { gn: 0 })], repEntry('t2', { gn: 0 })));
  assert.equal(zero.per.grid.moveUnderNoise, false);
  // a run with no digest makes sameSearch unknown, not true
  const nod = repeatOf(rerunLedger([{ ...repEntry('t1'), digest: undefined }], repEntry('t2')));
  assert.equal(nod.sameSearch, null);
});

test('statementNumbers: a number the statement names and no printed line holds is named; digits inside a hash or a seed name are not numbers', () => {
  const printed = '[plateau] rows every 200 generations, seeds tune-1,tune-2; sha256 6cd01d8e69419bd8\n[bar] grid: transfer minus control -1.20 against noise 3.16; 241,675 generations';
  const ok = statementNumbers('Rows every 200 generations; minus control 1.20 against 3.16 over 241,675 generations (sha256 6cd01d8e69419bd8, tune-1).', printed);
  assert.deepEqual(ok.missing, []);
  assert.deepEqual(ok.numbers, ['200', '1.20', '3.16', '241,675', '1']);
  const bad = statementNumbers('the held-out score read every 0.1 s, noise 3.2.', printed);
  assert.deepEqual(bad.missing, ['0.1', '3.2'], 'the verify plane\'s case: 0.1 s where the run printed 100 ms');
  assert.deepEqual(statementNumbers('no numbers here.', printed), { numbers: [], missing: [] });
  // a range names both ends; an end no line printed is missing
  const r = statementNumbers('control plateau 3.16..241,675 s and 1.20..9.99 s.', printed);
  assert.deepEqual(r.numbers, ['3.16', '241,675', '1.20', '9.99']);
  assert.deepEqual(r.missing, ['9.99']);
});

test('BUDGET: the default generation count is the median of the five control counts it names, per plane, and the row cadence keeps the wall run\'s row count to a whole hundred', () => {
  const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[(s.length - 1) / 2]; };
  const d = BUDGET.derivedFrom;
  for (const k of ['grid', 'synthetic']) {
    assert.equal(d.controlGenerations[k].length, 5);
    assert.equal(med(d.controlGenerations[k]), BUDGET.generations, k);
  }
  const rows = (d.wallS * 1000) / d.rowEveryMs;
  assert.equal(BUDGET.rowEveryGens, Math.round(BUDGET.generations / rows / 100) * 100);
  assert.ok(Number.isInteger(BUDGET.generations) && Number.isInteger(BUDGET.rowEveryGens));
  assert.match(d.verdictAt, /^\d{4}-\d\d-\d\dT/);
});
