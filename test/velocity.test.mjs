// test/velocity.test.mjs: the evaluation matrix is an exact cache, the plateau ruler fires where
// it says it fires, and infinite mode stops for the two reasons it declares.
//   (a) the word path equals the cell-by-cell reference walk on random libraries, synthetic
//       and grid, including libraries with duplicates and libraries led by the identity
//   (b) on a small grid suite, real grid cells ticked in a Brain agree with the matrix on every
//       task of every genome: solved, claiming slot, count and fitness
//   (c) the full audit of the small matrix finds 0 mismatches, and the CONTROL: one flipped bit
//       in a copy of the matrix is found by the audit (exactly that bit) and by the exactness
//       check, so the zero above is not the zero of a check that cannot see
//   (d) the parallel audit (worker threads) agrees with the serial one and also finds the bit
//   (e) the ruler fires exactly `patience` generations after the last improvement; movement
//       that never adds up to epsilon never resets the clock, slow progress that does is
//       progress; the adaptive factor waits for its gap
//   (f) on a synthetic landscape with a known optimum, the engine ends holding the planted set,
//       the ruler's generationsToPlateau is the generation the optimum was first held, and it
//       fires exactly patience generations later
//   (g) prune never changes a count, and a pruned archive holds only slots that claim a task
//   (h) the engine is deterministic from its seed, and directed 0 differs from directed 0.75
//   (i) infinite mode ends with allFired on a finite list and on the wall for an unbounded one,
//       and the carried best never falls from one plane to the next
//   (j) the rate loop's checksum is its passes times the sum of the counts it scored
//   (k) the per task index lists exactly the components whose RIGHT bit is set
//   (l) the ruler on a real organism plane of planes.mjs fires and reports its plane
//   (m) no em dashes in the files of this item
//   (n) the draw seeds: draw 0 is the run seed, the rest derived from it, none a held-out seed
//   (o) the multi-draw stack IS its draws: counts add, solved bits concatenate, the objective is
//       the mean of the per draw fitness, and one draw stacked is the single draw matrix
//   (p) K = 1 through the draws path is the Board 8 search draw for draw, plateau rule included
//   (q) real grid cells agree with a three draw stack on every task, and the CONTROL: one bit
//       flipped in the third draw's range is found, at that task
//   (r) on a stack the ruler still fires patience after the landing, and the best is scored by
//       the mean objective
//   (s) the heldout verdict, once written, agrees with its own fields
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RNG } from '../core/rng.mjs';
import {
  EvalMatrix, referenceScore, buildGridMatrix, exactnessCheck, auditGridMatrix, auditGridMatrixParallel,
  tickScoreGrid, matrixRate, syntheticMatrix, MatrixElites, PlateauRuler, runToPlateau, infinite,
  plateauOrganismPlane, fitnessOf, popcnt, LEN_CAP, gridComponentCount,
  objectiveOf, drawSeeds, stackDraws, buildGridDraws,
} from '../generations/velocity.mjs';
import { planeCoordinate } from '../generations/planes.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SMALL = { seed: 'velocity/test', counts: { depth1: 6, depth2: 6, depth3: 6 }, maxDepth: 2 };
const small = buildGridMatrix(SMALL);

function randomGenomes(matrix, n, seed, maxLen = 40) {
  const rng = new RNG(seed);
  const out = [[0]];
  for (let i = 0; i < n; i++) {
    const len = 1 + rng.int(maxLen);
    const g = [];
    for (let k = 0; k < len; k++) g.push(rng.int(matrix.C));
    if (i % 5 === 0) g.push(g[0]);            // a duplicate slot
    if (i % 7 === 0) g.unshift(0);            // led by the identity
    out.push(g);
  }
  return out;
}

function flippedCopy(matrix, c, t, plane) {
  const fit = matrix.fit.slice(), right = matrix.right.slice();
  const target = plane === 'fit' ? fit : right;
  target[c * matrix.W + (t >>> 5)] ^= (1 << (t & 31));
  return new EvalMatrix({ name: matrix.name + ':flipped', components: matrix.C, tasks: matrix.T, fit, right, size: matrix.size, opMask: matrix.opMask, nOps: matrix.nOps, deepMask: matrix.deepMask, meta: matrix.meta, draws: matrix.draws });
}

test('(a) the word path equals the reference walk on random libraries', () => {
  const syn = syntheticMatrix({ seed: 'velocity/test:a' }).matrix;
  for (const m of [syn, small.matrix]) {
    for (const g of randomGenomes(m, 200, 'a:' + m.name)) {
      const w = m.score(g), r = referenceScore(m, g);
      assert.equal(w.count, r.count);
      assert.deepEqual(Array.from(w.solved), Array.from(r.solved));
      assert.equal(w.fitness, fitnessOf(r.count, g.length, m.T));
    }
  }
  assert.equal(small.matrix.C, gridComponentCount(2));
});

test('(b) real grid cells agree with the matrix on every task of every genome', () => {
  const eng = new MatrixElites(small.matrix, { seed: 'velocity/test:b', popSize: 32, lmax: 24 });
  runToPlateau(eng, { patience: 30 });
  const genomes = [...randomGenomes(small.matrix, 12, 'b'), ...eng.elites(12).map((e) => e.genome)];
  const ex = exactnessCheck(small.matrix, small, genomes);
  assert.equal(ex.genomes, genomes.length);
  assert.equal(ex.taskMismatches, 0, JSON.stringify(ex.first));
  assert.equal(ex.claimMismatches, 0, JSON.stringify(ex.first));
  assert.equal(ex.countMismatches, 0);
  assert.equal(ex.fitnessMismatches, 0);
  assert.equal(ex.wordVsReference, 0);
  assert.ok(Math.max(...ex.matrixCounts) > 0, 'the genomes solve something: the agreement is not all zeros');
  assert.ok(ex.tick.ticks > 0 && ex.tick.runs > 0, 'the tick path ran cells');
});

test('(c) the full audit finds nothing, and finds one flipped bit exactly', () => {
  const a = auditGridMatrix(small.matrix, small, { batch: 64 });
  assert.equal(a.components, small.matrix.C);
  assert.equal(a.cells, small.matrix.C * small.matrix.T);
  assert.equal(a.fitMismatches, 0, JSON.stringify(a.first));
  assert.equal(a.rightMismatches, 0, JSON.stringify(a.first));
  // CONTROL: flip one RIGHT bit where the component fits, so the cells disagree with the copy
  let c = -1, t = -1;
  for (let k = 1; k < small.matrix.C && c < 0; k++) for (let j = 0; j < small.matrix.T; j++) if (small.matrix.cell(k, j).fit) { c = k; t = j; break; }
  assert.ok(c > 0, 'some component fits some task');
  const bad = flippedCopy(small.matrix, c, t, 'right');
  const b = auditGridMatrix(bad, small, { components: [c, 0] });
  assert.equal(b.rightMismatches, 1);
  assert.equal(b.fitMismatches, 0);
  assert.equal(b.first.component, c);
  assert.equal(b.first.task, t);
  const ex = exactnessCheck(bad, small, [[c]]);
  assert.equal(ex.taskMismatches, 1, 'the exactness check sees the flipped bit too');
});

test('(d) the parallel audit agrees and sees the flipped bit', async () => {
  const a = await auditGridMatrixParallel(small.matrix, { workers: 2, batch: 64 });
  assert.equal(a.components, small.matrix.C);
  assert.equal(a.fitMismatches + a.rightMismatches, 0, JSON.stringify(a.first));
  assert.equal(a.workers, 2);
  const bad = flippedCopy(small.matrix, 5, 3, 'fit');
  const b = await auditGridMatrixParallel(bad, { workers: 2, batch: 64 });
  assert.equal(b.fitMismatches, 1);
  assert.equal(b.rightMismatches, 0);
  assert.equal(b.first.component, 5);
  assert.equal(b.first.task, 3);
});

test('(e) the ruler fires at the last improvement plus patience', () => {
  const r = new PlateauRuler({ epsilon: 0.01, patience: 5 });
  const bests = [0.1, 0.2, 0.2, 0.205, 0.209, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3];
  let fired = null;
  bests.forEach((b, i) => { const o = r.observe(i + 1, b); if (o.fired) fired = i + 1; });
  assert.equal(fired, 11, 'last improvement at generation 6, patience 5');
  assert.equal(r.firedAt, 11);
  // steps of 0.001 never add up to epsilon within the patience: the clock is never reset
  const slow = new PlateauRuler({ epsilon: 0.01, patience: 4 });
  let f2 = null;
  for (let g = 1; g <= 20 && f2 === null; g++) if (slow.observe(g, 0.5 + g * 0.001).fired) f2 = g;
  assert.equal(f2, 5);
  // steps of 0.004 add up past epsilon every third generation: slow progress is progress
  const creep = new PlateauRuler({ epsilon: 0.01, patience: 4 });
  const imp = [];
  for (let g = 1; g <= 20; g++) { const o = creep.observe(g, 0.5 + g * 0.004); if (o.improved) imp.push(g); assert.equal(o.fired, false); }
  assert.deepEqual(imp, [1, 4, 7, 10, 13, 16, 19]);
  // adaptive: factor 2 waits twice the longest gap between improvements
  const seq = [0.1, 0.1, 0.2, 0.2, 0.2, 0.3, ...new Array(14).fill(0.3)];
  const fireAt = (factor) => { const q = new PlateauRuler({ epsilon: 0.01, patience: 3, factor }); for (let i = 0; i < seq.length; i++) if (q.observe(i + 1, seq[i]).fired) return i + 1; return null; };
  assert.equal(fireAt(0), 9);
  assert.equal(fireAt(2), 12);
  assert.throws(() => new PlateauRuler({ patience: 0 }));
});

test('(f) a known optimum: the ruler lands on the generation it was first held', () => {
  for (const s of [0, 1]) {
    const sm = syntheticMatrix({ seed: 'velocity/test:f' + s });
    const patience = 100;
    const eng = new MatrixElites(sm.matrix, { seed: 'velocity/test:f' + s + ':engine', popSize: 64, lmax: 32 });
    let found = null;
    const rep = runToPlateau(eng, { patience, maxGenerations: 20_000, onGeneration: (row) => { if (found === null && row.best === sm.optimum) found = row.gen; } });
    assert.ok(found !== null, 'the optimum was reached');
    assert.equal(rep.fired, true);
    assert.equal(rep.best, sm.optimum);
    assert.equal(rep.bestCount, sm.matrix.T);
    assert.equal(rep.generationsToPlateau, found);
    assert.equal(rep.firedAtGeneration, found + patience);
    assert.deepEqual([...eng.best().genome].sort((a, b) => a - b), sm.plantedIds);
  }
  // the landscape refuses to be built with a non-unique optimum
  assert.throws(() => syntheticMatrix({ tasks: 64, planted: 8, decoyRight: 8 }));
});

test('(g) prune never changes a count, and the archive holds only working slots', () => {
  const m = small.matrix;
  const claims = new Uint8Array(LEN_CAP), words = new Uint32Array(m.W), words2 = new Uint32Array(m.W);
  for (const g of randomGenomes(m, 150, 'g', 60)) {
    const buf = Int32Array.from(g);
    const n0 = m.scoreAt(buf, 0, buf.length, words, claims);
    const kept = g.filter((_, i) => claims[i]);
    const b2 = Int32Array.from(kept.length ? kept : [g[0]]);
    const n1 = m.scoreAt(b2, 0, b2.length, words2);
    assert.equal(n1, n0);
    assert.deepEqual(Array.from(words2), Array.from(words));
  }
  const eng = new MatrixElites(m, { seed: 'velocity/test:g', popSize: 32, lmax: 32 });
  for (let i = 0; i < 60; i++) eng.step();
  assert.ok(eng.pruned > 0, 'prune removed slots');
  for (const e of eng.elites()) {
    if (e.count === 0) continue;
    const buf = Int32Array.from(e.genome);
    m.scoreAt(buf, 0, buf.length, words, claims);
    for (let i = 0; i < buf.length; i++) assert.equal(claims[i], 1, 'every slot of an elite claims a task');
  }
});

test('(h) the engine is deterministic from its seed; directed changes the search', () => {
  const run = (opts) => { const e = new MatrixElites(small.matrix, { seed: 'velocity/test:h', popSize: 32, lmax: 24, ...opts }); const t = []; for (let i = 0; i < 40; i++) t.push(e.step().best); return { t, e }; };
  const a = run({}), b = run({});
  assert.deepEqual(a.t, b.t);
  assert.deepEqual(a.e.best().genome, b.e.best().genome);
  const u = run({ directed: 0 });
  assert.equal(u.e.directedDraws, 0);
  assert.ok(a.e.directedDraws > 0);
  assert.notDeepEqual(u.t, a.t);
});

test('(i) infinite mode: all fired on a finite list, the wall on an unbounded one', () => {
  const syn = syntheticMatrix({ seed: 'velocity/test:i' }).matrix;
  const fin = infinite(syn, { base: 'velocity/test:i', planes: 3, wallMs: 60_000, patience: 20 });
  assert.equal(fin.stopReason, 'planes');
  assert.equal(fin.planesRun, 3);
  assert.equal(fin.allFired, true);
  for (let i = 1; i < fin.rows.length; i++) assert.ok(fin.rows[i].globalBest >= fin.rows[i - 1].globalBest);
  const inf = infinite(syn, { base: 'velocity/test:i2', planes: Infinity, wallMs: 300, patience: 20 });
  assert.equal(inf.stopReason, 'wall');
  assert.ok(inf.planesRun >= 1);
  assert.equal(inf.allFired, false);
  assert.ok(inf.wallMs >= 300);
  assert.equal(inf.years.measured, false);
  assert.throws(() => infinite(syn, { planes: Infinity, wallMs: 0 }));
});

test('(j) the rate checksum is passes times the counts', () => {
  const gs = randomGenomes(small.matrix, 30, 'j');
  const counts = gs.map((g) => small.matrix.score(g).count);
  const r = matrixRate(small.matrix, gs, { minMs: 50 });
  const passes = r.evals / gs.length;
  assert.equal(Number.isInteger(passes), true);
  assert.equal(r.checksum, passes * counts.reduce((x, y) => x + y, 0));
});

test('(k) the per task index lists exactly the RIGHT components', () => {
  const m = small.matrix;
  const ix = m.rightIndex();
  let total = 0;
  for (let c = 0; c < m.C; c++) for (let w = 0; w < m.W; w++) total += popcnt(m.right[c * m.W + w]);
  assert.equal(ix.components.length, total);
  for (let t = 0; t < m.T; t++) {
    const listed = new Set(ix.components.subarray(ix.offsets[t], ix.offsets[t + 1]));
    for (let c = 0; c < m.C; c++) assert.equal(listed.has(c), m.cell(c, t).right);
  }
});

test('(l) the ruler on a real organism plane fires and reports', async () => {
  const rep = await plateauOrganismPlane(planeCoordinate(1), { patience: 2, maxMs: 60_000 });
  assert.equal(rep.plane, 1);
  assert.ok(rep.generations >= 1);
  assert.ok(rep.evals > 0);
  assert.ok(rep.ticks > 0);
  assert.equal(rep.error, null);
  assert.equal(rep.years.measured, false);
  if (rep.fired) assert.equal(rep.firedAtGeneration - rep.generationsToPlateau, 2);
});

test('(m) no em dashes in the files of this item', () => {
  for (const f of ['generations/velocity.mjs', 'bench/velocity.mjs', 'test/velocity.test.mjs', 'notes/velocity.md', 'bench/verdicts/velocity.json', 'bench/verdicts/velocity-partial.json', 'bench/verdicts/velocity-heldout.json', 'bench/verdicts/velocity-heldout-partial.json']) {
    const p = path.join(ROOT, f);
    if (!existsSync(p)) continue;
    assert.equal(readFileSync(p, 'utf8').includes(String.fromCharCode(0x2014)), false, f);
  }
});

// ---------------------------------------------------------------- the multi-draw objective
const DRAWS3 = buildGridDraws({ ...SMALL, draws: 3 });

test('(n) draw seeds: draw 0 is the run seed, the rest derived, none held out', () => {
  assert.deepEqual(drawSeeds('s', 1), ['s']);
  const s4 = drawSeeds('grid/velocity', 4);
  assert.equal(s4[0], 'grid/velocity');
  assert.equal(new Set(s4).size, 4);
  assert.deepEqual(drawSeeds('grid/velocity', 4), s4, 'a pure function of the run seed');
  assert.equal(s4.includes('grid/velocity:heldout'), false);
  assert.throws(() => drawSeeds('s', 0));
  assert.throws(() => buildGridDraws({ ...SMALL, draws: 2, exclude: [SMALL.seed + ':draw1'] }), /holds out/);
  assert.deepEqual(DRAWS3.seeds, drawSeeds(SMALL.seed, 3));
});

test('(o) the stack is its draws: counts add, solved bits concatenate, the objective is the mean', () => {
  const m = DRAWS3.matrix, Td = m.tasksPerDraw;
  assert.equal(m.draws, 3);
  assert.equal(m.T, 3 * DRAWS3.parts[0].matrix.T);
  let solvedSomething = 0;
  for (const g of randomGenomes(m, 150, 'o')) {
    const s = m.score(g), r = referenceScore(m, g);
    const per = DRAWS3.parts.map((p) => p.matrix.score(g));
    assert.equal(s.count, per.reduce((a, x) => a + x.count, 0));
    for (let d = 0; d < 3; d++) assert.deepEqual(Array.from(s.solved.subarray(d * Td, (d + 1) * Td)), Array.from(per[d].solved));
    assert.deepEqual(m.countsByDraw(s.solved), per.map((x) => x.count));
    assert.equal(r.count, s.count);
    assert.equal(r.fitness, s.fitness);
    const mean = per.reduce((a, x) => a + fitnessOf(x.count, g.length, Td), 0) / 3;
    assert.ok(Math.abs(s.fitness - mean) < 1e-12, s.fitness + ' vs ' + mean);
    if (s.count > 0) solvedSomething++;
  }
  assert.ok(solvedSomething > 0, 'the agreement is not all zeros');
  // one draw stacked is the single draw matrix, and its objective is fitnessOf bit for bit
  const one = stackDraws([small.matrix]);
  assert.equal(one.draws, 1);
  assert.deepEqual(Array.from(one.fit), Array.from(small.matrix.fit));
  assert.deepEqual(Array.from(one.right), Array.from(small.matrix.right));
  assert.deepEqual(Array.from(one.deepMask), Array.from(small.matrix.deepMask));
  for (const g of randomGenomes(small.matrix, 50, 'o1')) assert.equal(one.score(g).fitness, fitnessOf(small.matrix.score(g).count, g.length, small.matrix.T));
  assert.equal(objectiveOf(7, 3, 20), fitnessOf(7, 3, 20));
  // a stack is not one draw, and a matrix refuses a K that does not divide its tasks
  assert.throws(() => stackDraws([small.matrix, m]));
  assert.throws(() => new EvalMatrix({ name: 'x', components: 1, tasks: 10, fit: new Uint32Array(1), right: new Uint32Array(1), size: new Uint8Array(1), opMask: new Uint32Array(1), nOps: 1, deepMask: new Uint32Array(1), draws: 3 }));
  // the parallel audit regenerates ONE draw from meta.seed; a stack must not pass for one
  assert.equal(m.meta.seed, undefined);
});

test('(p) K = 1 through the draws path is the single draw search, draw for draw', () => {
  const d1 = buildGridDraws({ ...SMALL, draws: 1 });
  assert.deepEqual(Array.from(d1.matrix.fit), Array.from(small.matrix.fit));
  const run = (m) => { const e = new MatrixElites(m, { seed: 'velocity/test:p', popSize: 32, lmax: 24 }); const t = []; for (let i = 0; i < 40; i++) t.push(e.step().best); return { t, g: e.best().genome }; };
  const a = run(small.matrix), b = run(d1.matrix);
  assert.deepEqual(b.t, a.t);
  assert.deepEqual(b.g, a.g);
  const pick = (f) => f.rows.map((r) => [r.generationsToPlateau, r.firedAtGeneration, r.best, r.bestLen]);
  const fa = infinite(small.matrix, { base: 'velocity/test:p', planes: 2, wallMs: 60_000, patience: 20 });
  const fb = infinite(d1.matrix, { base: 'velocity/test:p', planes: 2, wallMs: 60_000, patience: 20 });
  assert.deepEqual(pick(fb), pick(fa));
});

test('(q) real cells agree with a three draw stack, and see one flipped bit in the third draw', () => {
  const m = DRAWS3.matrix, Td = m.tasksPerDraw;
  const eng = new MatrixElites(m, { seed: 'velocity/test:q', popSize: 32, lmax: 24 });
  runToPlateau(eng, { patience: 30 });
  const genomes = [...randomGenomes(m, 8, 'q'), ...eng.elites(6).map((e) => e.genome)];
  const ex = exactnessCheck(m, DRAWS3, genomes);
  assert.equal(ex.tasks, 3 * Td);
  assert.equal(ex.taskMismatches, 0, JSON.stringify(ex.first));
  assert.equal(ex.claimMismatches, 0, JSON.stringify(ex.first));
  assert.equal(ex.countMismatches, 0);
  assert.equal(ex.fitnessMismatches, 0);
  assert.equal(ex.wordVsReference, 0);
  assert.ok(Math.max(...ex.matrixCounts) > 0);
  // CONTROL: a RIGHT bit flipped where a component fits a task of the third draw
  const p2 = DRAWS3.parts[2].matrix;
  let c = -1, t = -1;
  for (let k = 1; k < p2.C && c < 0; k++) for (let j = 0; j < p2.T; j++) if (p2.cell(k, j).fit) { c = k; t = j; break; }
  assert.ok(c > 0);
  const bad = flippedCopy(m, c, 2 * Td + t, 'right');
  const exb = exactnessCheck(bad, DRAWS3, [[c]]);
  assert.equal(exb.taskMismatches, 1);
  assert.equal(exb.first.task, 2 * Td + t);
});

test('(r) on a stack the ruler fires patience after the landing, scored by the mean', () => {
  const m = DRAWS3.matrix;
  const eng = new MatrixElites(m, { seed: 'velocity/test:r', popSize: 32, lmax: 32 });
  const rep = runToPlateau(eng, { patience: 40 });
  assert.equal(rep.fired, true);
  assert.equal(rep.firedAtGeneration - rep.generationsToPlateau, 40);
  assert.equal(rep.best, m.objective(rep.bestCount, rep.bestLen));
  assert.equal(rep.best, objectiveOf(rep.bestCount, rep.bestLen, m.T, 3));
  const b = eng.best();
  assert.equal(m.score(b.genome).count, b.count);
});

test('(s) the heldout verdict, once written, agrees with its own fields', (t) => {
  const p = path.join(ROOT, 'bench', 'verdicts', 'velocity-heldout.json');
  if (!existsSync(p)) { t.skip('bench/verdicts/velocity-heldout.json not written yet'); return; }
  const v = JSON.parse(readFileSync(p, 'utf8'));
  assert.equal(v.isTheBar, true);
  assert.match(v.at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/);
  assert.match(v.command, /bench\/velocity\.mjs --draws 4$/);
  assert.match(v.node, /^v\d+\./);
  assert.equal(typeof v.statement, 'string');
  assert.equal(v.bar.draws, 4);
  const k1 = v.arms.find((a) => a.k === 1), k4 = v.arms.find((a) => a.k === 4);
  assert.equal(k1.fresh.count, v.bar.freshK1);
  assert.equal(k4.fresh.count, v.bar.freshK);
  assert.equal(k1.fresh.tickCount, k1.fresh.count, 'real cells agree on the fresh draw at K = 1');
  assert.equal(k4.fresh.tickCount, k4.fresh.count, 'real cells agree on the fresh draw at K = 4');
  assert.equal(v.bar.margin, v.bar.freshK - v.bar.freshK1);
  assert.equal(v.bar.exactMismatches, 0);
  assert.equal(v.bar.stackMismatches, 0);
  assert.equal(v.bar.met, v.bar.margin > 0 && v.bar.exactOk);
  assert.equal(k4.best.perDraw.length, 4);
  assert.equal(k4.searchedMeanCount, k4.best.perDraw.reduce((a, x) => a + x, 0) / 4);
  assert.equal(k1.seeds[0], v.config.seed);
  for (const s of [k1.fresh.count, k4.fresh.count]) assert.ok(v.statement.includes(s + '/' + v.suites.heldout.tasks), 'the statement quotes ' + s);
  assert.ok(v.statement.includes(v.bar.met ? 'was met' : 'was not met'));
});
