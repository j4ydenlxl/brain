// test/census-static.test.mjs: THE STATIC AND SAMPLED CENSUS, AND THE PRUNE BY A STATIC CENSUS (MANUAL P8).
//
// organism/scale-52000 cannot be loaded (an exact shard needs a 43 GB cone), so its census walks
// the lines instead (tools/organism-census.mjs staticCensus), measures a seeded sample exactly
// (sampledCensus), and genome/emit.mjs --prune removes the static dead set by streaming the seed
// (pruneStatic). These tests hold each of the three to a case whose answer is known:
//
//   a toy organism of 30 cells, 6 of them dead by construction (4 with no edge in, 2 fed only by
//   dead cells, one of which sends into a live cell), wired so the closure needs many passes;
//   the Wilson interval at published values;
//   the sampled census at fraction 1 against the whole run (runArm), cell by cell and edge by edge;
//   the streaming prune against pruneBrain plus emitOrganism, byte for byte, on the toy and on a
//   grown tiny organism.
//
// Scratch lives in test/.census-static-scratch/<pid> and is removed when the file finishes.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import '../cells/all.mjs';
import { Brain } from '../core/brain.mjs';
import { buildOrganism } from '../seeds/organism.mjs';
import { emitOrganism, readLiveBits, pruneMain, pruneBrain, eachLine } from '../genome/emit.mjs';
import { loadFrom, verify } from '../genome/load.mjs';
import { staticCensus, staticVerdictOf, sampledCensus, wilson, clusterRatio, drawSample, readSeed, runArm } from '../tools/organism-census.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRATCH = path.join(HERE, '.census-static-scratch', String(process.pid));
const DEAD = ['d0', 'd1', 'd2', 'd3', 'd4', 'd5'];

// 4 periodic sources, a chain of 20 event cells a0..a19 whose edges are declared BACKWARDS (so a
// pass over the edge file extends the reach by one link), and 6 dead event cells interleaved with
// them in declaration order so every cells file mixes live and dead.
function toyBrain() {
  const b = new Brain({ name: 'census-toy', ledger: 'off', pruneEvery: 0 });
  const add = (id, kind, circuit, region = 'toy', period = 'event') => b.addCell({ id, kind, region, circuit, policy: { period } });
  for (let i = 0; i < 4; i++) add('s' + i, 'source.counter', 'src', 'toy', 1);
  const order = [];
  for (let i = 0; i < 20; i++) {
    order.push('a' + i);
    if (i === 4) order.push('d0');
    if (i === 9) order.push('d1', 'd2');
    if (i === 14) order.push('d3');
  }
  order.push('d4', 'd5');
  for (const id of order) add(id, 'num.arith', id[0] === 'a' ? 'chain' : 'dead', id[0] === 'a' ? 'toy' : 'limbo');
  for (let i = 18; i >= 0; i--) b.connect('a' + i, 0, 'a' + (i + 1), 0, { delay: i === 9 ? 3 : 0 });
  b.connect('s0', 0, 'a0', 0); b.connect('s1', 0, 'a0', 1); b.connect('s2', 0, 'a1', 1); b.connect('s3', 0, 'a2', 1);
  b.connect('d0', 0, 'd4', 0); b.connect('d1', 0, 'd5', 0); b.connect('d4', 0, 'd5', 1); b.connect('d2', 0, 'a5', 1);
  return b;
}

let toyDir, toy, tinyDir, sparseDir;
const SPARSE_H = 8, SPARSE_BATCH = 60;
before(() => {
  mkdirSync(SCRATCH, { recursive: true });
  toyDir = path.join(SCRATCH, 'census-toy');
  emitOrganism(toyBrain(), { dir: toyDir, split: 12 });
  toy = staticCensus(toyDir, { tasks: false, horizon: 16 });
  tinyDir = path.join(SCRATCH, 'census-tiny');
  emitOrganism(buildOrganism({ majors: 48, subcellsPerMajor: 6, edgesPerCell: 6, seed: 'census-test', name: 'census-tiny' }), { dir: tinyDir, split: 200 });
  // the sparse seed test/census.test.mjs checks the sharded census on: at a short horizon no pair of
  // cells co-fires often enough to grow an edge, so a batch is exactly the whole run on its cells
  sparseDir = path.join(SCRATCH, 'census-sparse');
  emitOrganism(buildOrganism({ majors: 48, subcellsPerMajor: 6, edgesPerCell: 2, seed: 'census-test', name: 'census-sparse' }), { dir: sparseDir, split: 200 });
});
after(() => {
  if (existsSync(SCRATCH)) rmSync(SCRATCH, { recursive: true, force: true });
  const parent = path.dirname(SCRATCH);
  if (existsSync(parent) && readdirSync(parent).length === 0) rmSync(parent, { recursive: true, force: true });
});

const idsOf = (dir) => { const out = []; for (const f of readdirSync(dir).filter((x) => /^cells-\d+\.mjs$/.test(x)).sort()) eachLine(path.join(dir, f), (l) => { if (l.startsWith('c(')) out.push(JSON.parse('[' + l.slice(2, -2) + ']')[0]); }); return out; };

describe('static census', () => {
  test('the toy: 30 cells, exactly the 6 built dead are dead, and why', () => {
    const c = toy.cells, e = toy.edges;
    assert.equal(c.declared, 30);
    assert.equal(c.dead, 6);
    const live = readLiveBits(toy.live.cells), ids = idsOf(toyDir);
    assert.equal(ids.length, 30);
    assert.deepEqual(ids.filter((_, i) => !live.has(i)).sort(), DEAD);
    assert.equal(c.deadZeroInDegree, 4);          // d0 d1 d2 d3
    assert.equal(c.deadFedOnlyByDeadCells, 2);    // d4 (from d0), d5 (from d1 and d4)
    assert.equal(e.declared, 27);
    assert.equal(e.dead, 4);                      // d0->d4, d1->d5, d4->d5, d2->a5
    assert.equal(e.deadIntoReachableCell, 1);     // d2->a5: a dead source into a live cell
    assert.deepEqual([toy.regions.live, toy.regions.declared, toy.circuits.live, toy.circuits.declared], [1, 2, 2, 3]);
  });

  test('the toy: the closure took one pass per backwards link, and the timing is the chain with its delay', () => {
    // pass 1 reaches a0 a1 a2 from the sources; each later pass one more link, a3..a19; then one pass that changes nothing
    assert.equal(toy.closure.passes, 19);
    assert.deepEqual(toy.closure.perPass.map((p) => p.marked), [3, ...Array(17).fill(1), 0]);
    // a_i = i - 1 up to a9 = 8, then a9 -> a10 carries delay 3: a10 = 12 ... a19 = 21
    assert.equal(toy.timing.maxEarliestTick, 21);
    assert.equal(toy.timing.withinHorizon, 18);   // s0..s3 and a0..a13 at ticks 0..15
  });

  test('the toy: lines add up per file and in total, and the hash is the manifest hash', () => {
    const l = toy.lines;
    assert.equal(l.declarations, 2 + 3 + 30 + 27);
    assert.equal(l.liveDeclarations, 1 + 2 + 24 + 23);
    assert.equal(l.deadDeclarations, 12);
    assert.equal(l.structure, l.loaded - l.declarations);
    assert.equal(l.loadBearing, l.liveDeclarations + l.structure);
    assert.equal(l.fractionLoadBearing, Number((l.loadBearing / l.loaded).toFixed(6)));
    assert.equal(toy.perFile.reduce((a, f) => a + f.declarations, 0), l.declarations);
    assert.equal(toy.perFile.reduce((a, f) => a + f.live, 0), l.liveDeclarations);
    assert.ok(toy.perFile.filter((f) => f.file.startsWith('cells-')).length >= 4, 'the toy spans several cells files');
    assert.ok(toy.perFile.filter((f) => f.file.startsWith('cells-') && f.dead > 0).length >= 3, 'dead cells sit in several files');
    assert.equal(toy.manifestCount.loadBearing + toy.seed.files.lines['manifest.json'], l.loadBearing);
    assert.ok(toy.manifestCount.agrees);
    assert.ok(toy.hash.match, 'streamed ' + toy.hash.streamed + ' vs manifest ' + toy.hash.manifest);
    assert.equal(toy.legality.illegalEdges, 0);
    assert.ok(toy.whole);
  });

  test('a changed line changes the streamed hash, so a match proves the lines are the organism', () => {
    const dir = path.join(SCRATCH, 'census-toy-tampered');
    emitOrganism(toyBrain(), { dir, split: 12 });
    const f = path.join(dir, 'edges-000.mjs');
    writeFileSync(f, readFileSync(f, 'utf8').replace(/,0\);\n/, ',1);\n'));
    const r = staticCensus(dir, { tasks: false });
    assert.equal(r.hash.match, false);
  });

  test('the grown tiny seed: the streamed hash matches, and every cell a whole run ran is statically live', async () => {
    const r = staticCensus(tinyDir, { tasks: false, horizon: 16 });
    assert.ok(r.hash.match);
    assert.equal(r.legality.illegalEdges, 0);
    const { arm } = await runArm(await readSeed(tinyDir), { ticks: 16, tasks: false });
    const lc = readLiveBits(r.live.cells), le = readLiveBits(r.live.edges);
    let ranDead = 0, deliveredDead = 0;
    for (let i = 0; i < lc.n; i++) if (arm.raw.runs[i] > 0 && !lc.has(i)) ranDead++;
    for (let e = 0; e < le.n; e++) if (arm.raw.hits[e] > 0 && !le.has(e)) deliveredDead++;
    assert.equal(ranDead, 0);
    assert.equal(deliveredDead, 0);
    // and the timed bound: no cell ran that could not run within 16 ticks
    let ran = 0; for (let i = 0; i < lc.n; i++) if (arm.raw.runs[i] > 0) ran++;
    assert.ok(ran > 0 && ran <= r.timing.withinHorizon, ran + ' ran, ' + r.timing.withinHorizon + ' within the horizon');
  });
});

describe('sampled census', () => {
  test('Wilson 95 percent intervals at known values, and the cluster ratio', () => {
    const a = wilson(8, 10);
    assert.equal(a.lo.toFixed(4), '0.4902');
    assert.equal(a.hi.toFixed(4), '0.9433');
    const b = wilson(0, 10);
    assert.equal(b.lo.toFixed(4), '0.0000');
    assert.equal(b.hi.toFixed(4), '0.2775');
    const c = wilson(10, 10);
    assert.equal(c.lo.toFixed(4), '0.7225');
    assert.equal(c.hi.toFixed(4), '1.0000');
    const d = wilson(50, 100);
    assert.ok(Math.abs(d.lo - 0.4038) < 1e-4 && Math.abs(d.hi - 0.5962) < 1e-4, d.lo + ' ' + d.hi);
    assert.equal(wilson(0, 0).p, null);
    const r = clusterRatio([1, 1, 1], [2, 2, 2]);
    assert.equal(r.r, 0.5); assert.equal(r.lo, 0.5); assert.equal(r.hi, 0.5);
    const s = clusterRatio([0, 2], [2, 2]);
    assert.equal(s.r, 0.5);
    assert.ok(s.lo < 0.5 && s.hi > 0.5);
  });

  test('the draw is seeded, exact in size, distinct and sorted', () => {
    const x = drawSample(1000, 20, 'census'), y = drawSample(1000, 20, 'census'), z = drawSample(1000, 20, 'other');
    assert.equal(x.length, 20);
    assert.deepEqual([...x], [...y]);
    assert.notDeepEqual([...x], [...z]);
    assert.equal(new Set(x).size, 20);
    for (let i = 1; i < x.length; i++) assert.ok(x[i] > x[i - 1]);
    assert.deepEqual([...drawSample(7, 7, 's')], [0, 1, 2, 3, 4, 5, 6]);
  });

  test('at fraction 1 the sampled census is the whole run, cell by cell and edge by edge, in several batches', async () => {
    const H = SPARSE_H;
    const r = await sampledCensus(sparseDir, { fraction: 1, horizon: H, batchCells: SPARSE_BATCH, capMB: 0 });
    const { arm } = await runArm(await readSeed(sparseDir), { ticks: H, tasks: false });
    assert.equal(arm.totals.drive.grown, 0);
    assert.deepEqual(r.batches.map((b) => b.grown), r.batches.map(() => 0));
    const n = arm.raw.runs.length;
    assert.equal(r.sample.measured, n);
    assert.ok(r.sample.batches >= 3, r.sample.batches + ' batches');
    assert.ok(r.exact);
    let diffRuns = 0, diffFired = 0, diffHits = 0;
    for (let i = 0; i < n; i++) { if (r.raw.runs[i] !== arm.raw.runs[i]) diffRuns++; if (r.raw.fired[i] !== arm.raw.fired[i]) diffFired++; }
    for (let e = 0; e < arm.raw.hits.length; e++) if (r.raw.hits[e] !== arm.raw.hits[e]) diffHits++;
    assert.deepEqual([diffRuns, diffFired, diffHits], [0, 0, 0]);
    let ran = 0; for (let i = 0; i < n; i++) if (arm.raw.runs[i] > 0) ran++;
    assert.equal(r.shares.ran.x, ran);
    assert.equal(r.agreement.ranNotWithinHorizon, 0);
    assert.ok(r.shares.ran.lo <= r.shares.ran.p && r.shares.ran.p <= r.shares.ran.hi);
  });

  test('the reduced cone gives the same answer as the full cone on a sample', async () => {
    const a = await sampledCensus(tinyDir, { fraction: 0.25, horizon: 12, batchCells: 200, capMB: 0, reduce: true });
    const b = await sampledCensus(tinyDir, { fraction: 0.25, horizon: 12, batchCells: 200, capMB: 0, reduce: false });
    assert.deepEqual(a.raw.measured, b.raw.measured);
    for (const c of a.raw.measured) { assert.equal(a.raw.runs[c], b.raw.runs[c]); assert.equal(a.raw.fired[c], b.raw.fired[c]); }
    assert.ok(a.cones.sum <= b.cones.sum);
  });
});

describe('prune by a static census', () => {
  async function pruneBoth(dir, split, tasks) {
    const r = staticCensus(dir, { tasks });
    const vFile = path.join(SCRATCH, path.basename(dir) + '-static.json');
    writeFileSync(vFile, JSON.stringify(staticVerdictOf(r, { command: 'test', isTheBar: false }), null, 2) + '\n');
    const out = path.join(SCRATCH, path.basename(dir) + '-pruned');
    const res = await pruneMain(['--prune', vFile, '--seed', dir, '--out', out, '--quiet']);
    // the reference: load the seed, prune it in memory, emit it with the same split
    const { brain } = await loadFrom(dir);
    const live = { cells: readLiveBits(r.live.cells), edges: readLiveBits(r.live.edges) };
    const protect = { cells: r.hosted.map((id) => brain.byId.get(id).idx) };
    const ref = path.join(SCRATCH, path.basename(dir) + '-ref', path.basename(dir) + '-pruned');
    const pb = pruneBrain(brain, live, { name: path.basename(dir) + '-pruned', protect });
    const em = emitOrganism(pb.brain, { dir: ref, split });
    return { r, res, out, ref, em, brain };
  }
  const same = (a, b) => {
    const files = readdirSync(b).filter((f) => /^(cells-|edges-|regions)/.test(f)).sort();
    assert.deepEqual(readdirSync(a).filter((f) => /^(cells-|edges-|regions)/.test(f)).sort(), files);
    for (const f of files) assert.equal(readFileSync(path.join(a, f), 'utf8'), readFileSync(path.join(b, f), 'utf8'), f);
  };

  test('the toy: the prune drops exactly the static dead set and nothing else', async () => {
    const { r, res, out, ref, em } = await pruneBoth(toyDir, 12, false);
    assert.equal(res.ok, true);
    assert.deepEqual(res.cells, { before: 30, after: 24, kept: { ran: 24, protectedOnly: 0, endpointOnly: 0 }, dropped: 6 });
    assert.deepEqual([res.edges.before, res.edges.after, res.edges.dropped], [27, 23, 4]);
    assert.equal(res.regionsDropped, 1);   // limbo held only dead cells
    assert.equal(res.circuitsDropped, 1);  // and so did its circuit
    const before = idsOf(toyDir), after = idsOf(out);
    assert.deepEqual(before.filter((id) => !after.includes(id)).sort(), DEAD);
    assert.equal(after.length, r.cells.reachable);
    // it loads, verifies, and is the in-memory prune byte for byte
    const { brain, manifest } = await loadFrom(out);
    assert.ok(verify(brain, manifest).ok);
    assert.equal(brain.genome.wiring.duplicates, 0);
    assert.equal(manifest.hash, em.hash);
    same(out, ref);
    // and a static census of it finds nothing dead
    const again = staticCensus(out, { tasks: false });
    assert.equal(again.lines.deadDeclarations, 0);
    assert.ok(again.hash.match);
  });

  test('the grown tiny seed with the hosted cells: byte for byte the in-memory prune, and dead share 0 after', async () => {
    const { r, res, out, ref, em } = await pruneBoth(tinyDir, 200, true);
    assert.equal(res.ok, true);
    assert.equal(res.cells.after, r.cells.reachable);
    assert.equal(res.edges.after, r.edges.live);
    assert.equal(res.cells.kept.endpointOnly, 0);
    const { brain, manifest } = await loadFrom(out);
    assert.ok(verify(brain, manifest).ok);
    assert.equal(manifest.hash, em.hash);
    assert.equal(manifest.counts.lines, res.lines.after);
    same(out, ref);
    const again = staticCensus(out, { tasks: true });
    assert.equal(again.lines.deadDeclarations, 0);
    assert.ok(r.lines.deadDeclarations > 0, 'the tiny seed had something dead to prune');
  });

  // the command the bar ran: genome/emit.mjs --prune as its own process. Its command line once ran
  // before the streaming section's templates were initialised, which a call to pruneMain from a test
  // cannot see, because the module has finished evaluating by then.
  test('the command line: node genome/emit.mjs --prune writes the same copy as the call', async () => {
    const r = staticCensus(toyDir, { tasks: false });
    const vFile = path.join(SCRATCH, 'cli-toy-static.json');
    writeFileSync(vFile, JSON.stringify(staticVerdictOf(r, { command: 'test', isTheBar: false }), null, 2) + '\n');
    const out = path.join(SCRATCH, 'cli-toy-pruned');
    const p = spawnSync(process.execPath, [path.join(HERE, '..', 'genome', 'emit.mjs'), '--prune', vFile, '--seed', toyDir, '--out', out, '--name', 'census-toy-pruned'], { encoding: 'utf8', timeout: 60000 });
    assert.equal(p.status, 0, p.stderr);
    assert.match(p.stdout, /cells 30 -> 24: kept 24 live, 0 protected only, 0 endpoint only; dropped 6/);
    const ref = path.join(SCRATCH, 'cli-toy-call');
    const res = await pruneMain(['--prune', vFile, '--seed', toyDir, '--out', ref, '--name', 'census-toy-pruned', '--quiet']);
    assert.equal(res.ok, true);
    same(out, ref);
    assert.equal(JSON.parse(readFileSync(path.join(out, 'manifest.json'), 'utf8')).hash, res.hash);
  });
});
