// test/years.test.mjs: the organism-years declaration, the rate plateau, and the continuous run.
// No model is called; no server is started; the one worker thread (the prefetch) is terminated.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  YEAR, BILLION, yearsArithmetic, projectSeconds, RatePlateau, detectPlateau, selectTasks,
  gridSource, syntheticSource, yearsRun, freshScores, thinRows, Prefetcher, freshTimeline, searchedLastRose,
} from '../generations/years.mjs';
import { RNG } from '../core/rng.mjs';

// ---------------------------------------------------------------- (a) the arithmetic
test('(a) yearsArithmetic: organism-years equal generations, on fixed inputs, with the arithmetic beside the count', () => {
  const y = yearsArithmetic({ generations: 1234, popSize: 64, evals: 1234 * 64 + 10, carried: 10, wallMs: 2000 });
  assert.equal(y.organismYears, 1234);
  assert.equal(y.generations, 1234);
  assert.equal(y.evaluationsPerGeneration, 64);
  assert.equal(y.generationsPerSecond, 617);
  assert.equal(y.evalsPerSecond, (1234 * 64 + 10) / 2);
  assert.equal(y.measured, false);
  assert.equal(y.declaration, YEAR.declaration);
  assert.match(y.arithmetic, /^1,234 generations x 1 organism-year per generation/);
  assert.match(y.arithmetic, /whole population of 64 children = 64 evaluations/);
  assert.match(y.arithmetic, /the 10 carried elites re-scored at arm starts are evaluations, not years/);
  assert.match(y.arithmetic, /= 1,234 organism-years \(78,986 evaluations\)$/);
  // nothing carried: the clause is left out, the count is unchanged
  const z = yearsArithmetic({ generations: 7, popSize: 3 });
  assert.equal(z.organismYears, 7);
  assert.equal(z.generationsPerSecond, null);
  assert.doesNotMatch(z.arithmetic, /carried/);
  assert.throws(() => yearsArithmetic({ generations: 1.5, popSize: 64 }), /whole number/);
  assert.throws(() => yearsArithmetic({ generations: 10, popSize: 0 }), /popSize/);
});

test('(a) projectSeconds: a billion organism-years at a measured rate is a projection, and says so', () => {
  const p = projectSeconds({ targetYears: BILLION, generations: 1000, wallMs: 2000 });
  assert.equal(p.generationsPerSecond, 500);
  assert.equal(p.seconds, 2e6);
  assert.equal(p.hours, 2e6 / 3600);
  assert.equal(p.projection, true);
  assert.match(p.arithmetic, /^projection: 1,000,000,000 organism-years \/ 500\.0 generations per wall second \(measured: 1,000 generations in 2\.000 s\) = 2,000,000 s \(555\.6 h\), a projection, not a measurement$/);
  assert.throws(() => projectSeconds({ generations: 0, wallMs: 1000 }), /measured run/);
});

// ---------------------------------------------------------------- (b) the plateau
const series = (fn, { toMs = 6000, stepMs = 100 } = {}) => {
  const out = [];
  for (let t = 0; t <= toMs; t += stepMs) out.push([t, fn(t)]);
  return out;
};

test('(b) a flat series plateaus one window after its start; a rising one never does', () => {
  const flat = detectPlateau(series(() => 5), { windowMs: 2000, floor: 0.1 });
  assert.ok(flat, 'a flat series must plateau');
  assert.equal(flat.atMs, 2000);
  assert.equal(flat.rate, 0);
  // one task per second, against a floor of 0.1 task per second: never
  assert.equal(detectPlateau(series((t) => t / 1000), { windowMs: 2000, floor: 0.1 }), null);
  // rising, then flat from 3 s: fires one window into the flat part, not before
  const kink = detectPlateau(series((t) => Math.min(t, 3000) / 1000), { windowMs: 2000, floor: 0.1 });
  assert.ok(kink);
  assert.ok(kink.atMs > 3000 && kink.atMs <= 5000, 'fired at ' + kink.atMs);
  // rising under the floor is a plateau: 0.05 task per second against 0.1
  const slow = detectPlateau(series((t) => 0.05 * t / 1000), { windowMs: 2000, floor: 0.1 });
  assert.equal(slow.atMs, 2000);
  assert.ok(Math.abs(slow.rate - 0.05) < 1e-12);
});

test('(b) RatePlateau judges nothing inside the first window, fires once per arm, and re-arms', () => {
  const p = new RatePlateau({ windowMs: 1000, floor: 0.5 });
  p.arm(0, 10);
  assert.deepEqual(p.observe(500, 10), { rate: null, fired: false });
  const r = p.observe(1000, 10);
  assert.equal(r.fired, true);
  assert.equal(p.firedAt, 1000);
  assert.equal(p.observe(1500, 10).fired, false, 'fires once per arm');
  p.arm(2000, 10);
  assert.equal(p.fired, false);
  assert.equal(p.observe(2500, 20).rate, null);
  assert.equal(p.observe(3000, 30).fired, false, '20 tasks in 1 s is far above the floor');
});

// ---------------------------------------------------------------- the sources
test('selectTasks keeps every cell of the columns it selects', () => {
  const src = syntheticSource({ seed: 'years/test-cols', draws: 3, freshSlices: 1 });
  const m = src.whole;
  const rng = new RNG('years/test-cols');
  const idx = Array.from({ length: 70 }, () => rng.int(m.T));
  const s = selectTasks(m, idx);
  assert.equal(s.T, 70);
  let bad = 0;
  for (let c = 0; c < m.C; c++) for (let j = 0; j < idx.length; j++) {
    const a = m.cell(c, idx[j]), b = s.cell(c, j);
    if (a.fit !== b.fit || a.right !== b.right) bad++;
  }
  assert.equal(bad, 0);
});

test('syntheticSource: the planted set solves every searched slice and every fresh slice whole', () => {
  const src = syntheticSource({ seed: 'years/test-slices', draws: 4, freshSlices: 2 });
  const fresh = src.fresh();
  assert.equal(fresh.length, 2);
  for (let k = 0; k < 4; k++) assert.equal(src.draw(k).matrix.score(src.plantedIds).count, src.optimumCount);
  assert.deepEqual(freshScores(fresh, src.plantedIds), [src.optimumCount, src.optimumCount]);
  assert.throws(() => src.draw(4), /past the 4 searched slices/);
});

test('gridSource refuses a fresh seed that is a draw of the searched stream', () => {
  assert.throws(() => gridSource({ seed: 'g/x', freshSeeds: ['g/x:draw3'] }), /is a draw of the searched stream/);
  assert.throws(() => gridSource({ seed: 'g/x', freshSeeds: ['g/x'] }), /is a draw/);
  assert.doesNotThrow(() => gridSource({ seed: 'g/x', freshSeeds: ['g/x:heldout', 'g/x:fresh1'] }));
});

// ---------------------------------------------------------------- (c) the run loop
test('(c) the run loop stops at its wall budget', async () => {
  const src = syntheticSource({ seed: 'years/test-wall', draws: 6, freshSlices: 1 });
  const budget = 600;
  const r = await yearsRun(src, { wallMs: budget, windowMs: 150, fresh: src.fresh() });
  assert.equal(r.stopReason, 'wall');
  assert.ok(r.wallMs >= budget, 'ran ' + r.wallMs + ' ms');
  assert.ok(r.wallMs < budget + 400, 'overshot to ' + r.wallMs + ' ms');
  assert.ok(r.generations > 0);
  assert.equal(r.years.organismYears, r.generations);
  assert.equal(r.years.popSize, 64);
  assert.ok(r.evals >= r.generations * 64, 'every generation scores the whole population');
  assert.equal(r.evals, r.generations * 64 + r.carried);
  assert.equal(r.fresh.length, 1);
  assert.equal(r.fresh[0].gained, r.end.fresh[0] - r.start.fresh[0]);
  assert.ok(r.plateaus.length >= 1, 'a 600 ms run with a 150 ms window reaches a plateau');
  assert.ok(r.plateaus.every((p) => ['widen', 'ingest', 'spawn'].includes(p.action)));
  for (let i = 1; i < r.rows.length; i++) assert.ok(r.rows[i].tMs >= r.rows[i - 1].tMs);
  const thin = thinRows(r.rows, 200);
  assert.ok(thin.length <= r.rows.length && thin[0] === r.rows[0] && thin[thin.length - 1] === r.rows[r.rows.length - 1]);
  await assert.rejects(() => yearsRun(src, {}), /wall budget/);
});

test('(c) with growth off the loop names the missing hook at the plateau and runs on', async () => {
  const src = syntheticSource({ seed: 'years/test-nogrowth', draws: 4, freshSlices: 1 });
  const r = await yearsRun(src, { wallMs: 500, windowMs: 100, growth: false, fresh: src.fresh() });
  assert.ok(r.plateaus.length >= 1);
  assert.equal(r.plateaus[0].text, 'plateau: no growth hook');
  assert.equal(r.arms, 1);
  assert.deepEqual(r.finalDraws, [0]);
  assert.equal(r.growth.ingest + r.growth.widen + r.growth.spawn, 0);
});

test('the fresh draws are read for rows only: the same run with and without them does the same thing', async () => {
  const src = () => syntheticSource({ seed: 'years/test-heldout', draws: 5, freshSlices: 2 });
  const counter = () => { let n = 0; return () => (n++) * 0.05; };
  const a = await yearsRun(src(), { wallMs: 400, windowMs: 60, rowEveryMs: 5, clock: counter() });
  const s = src();
  const b = await yearsRun(s, { wallMs: 400, windowMs: 60, rowEveryMs: 5, clock: counter(), fresh: s.fresh() });
  assert.equal(a.generations, b.generations);
  assert.equal(a.evals, b.evals);
  assert.deepEqual(a.plateaus.map((p) => [p.atMs, p.action, p.gen]), b.plateaus.map((p) => [p.atMs, p.action, p.gen]));
  assert.deepEqual(a.best.genome, b.best.genome);
  assert.deepEqual(a.rows.map((r) => r.searched), b.rows.map((r) => r.searched));
  assert.ok(a.plateaus.length >= 2, 'the counter clock reaches more than one plateau');
  assert.equal(b.fresh.length, 2);
});

test('the prefetch worker builds a draw bit for bit as the loop would, and closes', async () => {
  const counts = { depth1: 6, depth2: 4, depth3: 2 };
  const src = gridSource({ seed: 'years/test-prefetch', maxDepth: 1, counts, freshSeeds: ['years/test-prefetch:heldout'] });
  const p = new Prefetcher(src);
  try {
    p.want(2);
    let got = null;
    for (let i = 0; i < 500 && !got; i++) { got = p.take(2); if (!got) await new Promise((r) => setTimeout(r, 20)); }
    assert.ok(got, 'the worker answered within 10 s');
    const adopted = src.adopt(2, got);
    const direct = src.draw(2);
    assert.equal(adopted.seed, 'years/test-prefetch:draw2');
    assert.equal(adopted.matrix.T, direct.matrix.T);
    assert.deepEqual(Array.from(adopted.matrix.fit), Array.from(direct.matrix.fit));
    assert.deepEqual(Array.from(adopted.matrix.right), Array.from(direct.matrix.right));
    assert.deepEqual(Array.from(adopted.matrix.deepMask), Array.from(direct.matrix.deepMask));
  } finally {
    await p.close();
  }
  // and the loop with the worker on ingests, prefetched or not, and closes it
  const src2 = gridSource({ seed: 'years/test-prefetch2', maxDepth: 1, counts, freshSeeds: ['years/test-prefetch2:heldout'] });
  const r = await yearsRun(src2, { wallMs: 1500, windowMs: 100, prefetch: true, fresh: src2.fresh() });
  assert.equal(r.options.prefetch, true);
  assert.ok(r.growth.ingest >= 1, 'ingested ' + r.growth.ingest);
  assert.equal(r.growth.prefetched + r.growth.builtInLoop, r.growth.ingest);
  assert.equal(src2.seenVerbatim(src2.fresh()[0].tasks) >= 0, true);
});

// ---------------------------------------------------------------- a prefetch worker that fails
const tinyGrid = (seed) => gridSource({ seed, maxDepth: 1, counts: { depth1: 6, depth2: 4, depth3: 2 }, freshSeeds: [seed + ':heldout'] });
const waitFor = async (fn, ms = 10000) => { const until = Date.now() + ms; while (!fn() && Date.now() < until) await new Promise((r) => setTimeout(r, 20)); return fn(); };

test('a worker whose build throws posts the failure on the polled port, and drain() reads it', async () => {
  const src = tinyGrid('years/test-fail');
  const p = new Prefetcher({ ...src, maxDepth: 9 }); // buildGridMatrix refuses maxDepth 9
  try {
    p.want(1);
    assert.ok(await waitFor(() => p.failed), 'the failure reached the main thread within 10 s');
    assert.match(String(p.error.message), /draw 1 .*maxDepth must be 0\.\.4/);
    assert.equal(p.take(1), null, 'a failed draw is never handed out as ready');
    assert.equal(p.failures, 1);
    assert.equal(p.delivered, 0);
  } finally {
    await p.close();
  }
});

test('a failed worker is written off and the loop builds its draws itself: ingests are not turned into spawns', async () => {
  const src = tinyGrid('years/test-fail2');
  const r = await yearsRun(src, { wallMs: 1500, windowMs: 100, prefetch: true, fresh: src.fresh(), makePrefetcher: (s) => new Prefetcher({ ...s, maxDepth: 9 }) });
  assert.ok(r.prefetch.down, 'the run wrote the worker off');
  assert.match(r.prefetch.down.reason, /^failed: draw 1 .*maxDepth/);
  assert.equal(r.growth.prefetched, 0);
  assert.ok(r.growth.builtInLoop >= 1, 'built in the loop ' + r.growth.builtInLoop);
  assert.equal(r.growth.ingest, r.growth.builtInLoop);
  assert.ok(r.finalDraws[r.finalDraws.length - 1] >= 1, 'the stack moved past draw 0');
});

test('a worker that never answers is written off by the stall clock', async () => {
  const src = tinyGrid('years/test-stall');
  const silent = { requested: 0, delivered: 0, failures: 0, error: null, ready: new Map(), closed: false, want() { this.requested++; }, drain() {}, take() { return null; }, async close() { this.closed = true; } };
  const r = await yearsRun(src, { wallMs: 1500, windowMs: 100, prefetch: true, prefetchStallMs: 300, fresh: src.fresh(), makePrefetcher: () => silent });
  assert.ok(r.prefetch.down, 'written off');
  assert.match(r.prefetch.down.reason, /^stalled: no answer for draw 1 in \d+ ms \(the stall clock is 300 ms\)$/);
  assert.ok(r.prefetch.down.atMs >= 300 - 50, 'not before the stall clock ran out: ' + r.prefetch.down.atMs);
  assert.ok(r.growth.builtInLoop >= 1);
  assert.equal(silent.closed, true);
});

test('the worker is closed when the run throws', async () => {
  const src = tinyGrid('years/test-throw');
  const draw = src.draw.bind(src);
  src.draw = (k) => { if (k >= 1) throw new Error('draw boom'); return draw(k); };
  const failing = { requested: 0, delivered: 0, failures: 1, error: new Error('dead'), ready: new Map(), closed: false, want() { this.requested++; }, drain() {}, take() { return null; }, async close() { this.closed = true; } };
  await assert.rejects(() => yearsRun(src, { wallMs: 1500, windowMs: 100, prefetch: true, makePrefetcher: () => failing }), /draw boom/);
  assert.equal(failing.closed, true, 'closed on the throw path');
});

test('freshTimeline on fixed rows: the last new high, the score at half the wall, the second-half gain', () => {
  const rows = [[0, 49], [100, 90], [200, 120], [300, 118], [400, 125], [500, 125], [600, 121], [800, 124]].map(([tMs, v]) => ({ tMs, fresh: [v, 7] }));
  const f = freshTimeline(rows, 0, 800);
  assert.deepEqual(f, { high: 125, lastHighMs: 400, atHalfMs: 400, atHalf: 125, end: 124, secondHalfGain: -1 });
  assert.deepEqual(freshTimeline(rows, 1, 800), { high: 7, lastHighMs: 0, atHalfMs: 400, atHalf: 7, end: 7, secondHalfGain: 0 });
  assert.equal(freshTimeline([], 0, 800), null);
});

test('searchedLastRose: the last rise at or before the first plateau, or null', () => {
  const rows = [[1, 75], [101, 150], [201, 157], [301, 157], [401, 157], [501, 158]].map(([tMs, searched]) => ({ tMs, searched }));
  assert.equal(searchedLastRose(rows, 401), 201);
  assert.equal(searchedLastRose(rows, 600), 501);
  assert.equal(searchedLastRose(rows, null), null);
  assert.equal(searchedLastRose(rows.map((r) => ({ ...r, searched: 5 })), 600), null);
});

test('a fresh draw that never moves does not move the plateau: the rule reads the searched score only', async () => {
  const counter = () => { let n = 0; return () => (n++) * 0.05; };
  const flatFresh = [{ name: 'flat', matrix: { T: 1, score: () => ({ count: 0 }) } }];
  const run = (fresh) => yearsRun(syntheticSource({ seed: 'years/test-flatfresh', draws: 5, freshSlices: 1 }), { wallMs: 400, windowMs: 60, rowEveryMs: 5, clock: counter(), fresh });
  const a = await run([]);
  const b = await run(flatFresh);
  // the condition a fresh-reading rule would be caught by: the searched score was still rising
  // when the rule could first judge, so the first plateau came later than that sample
  assert.ok(a.plateaus.length >= 1 && a.plateaus[0].atMs > a.firstJudgeableMs, 'searched still rising at the first judgeable sample: plateau ' + (a.plateaus[0] && a.plateaus[0].atMs) + ', first judgeable ' + a.firstJudgeableMs);
  assert.deepEqual(b.rows.map((r) => r.fresh[0]).filter((v) => v !== 0), [], 'the fresh draw never moved');
  assert.deepEqual(b.plateaus.map((p) => [p.atMs, p.action, p.gen]), a.plateaus.map((p) => [p.atMs, p.action, p.gen]));
  assert.equal(b.generations, a.generations);
});
