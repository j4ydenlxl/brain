// test/census.test.mjs: THE CENSUS OF A TINY EMITTED ORGANISM (MANUAL P8).
//
// A tiny organism is grown by seeds/organism.mjs, emitted by genome/emit.mjs with a small
// split so it has several cells files and several edges files, and censused by
// tools/organism-census.mjs. The tests check the census adds up, that leaving one file out
// changes what the organism does, and that genome/emit.mjs --prune writes a seed that loads,
// verifies, does the same work, and never drops a declaration that ran or delivered. The
// sharded census (--shard-files) is checked against the whole census on a sparser tiny seed,
// array by array, and the refusals (a whole load over half of physical memory, a shard over
// its cap) are checked on planted inputs, the whole load one through the CLI in a child.
//
// Scratch lives in test/.census-scratch/<pid>, inside the brain tree and skipped by the gate
// (a dot directory), and is removed when the file finishes.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { totalmem } from 'node:os';
import { buildOrganism } from '../seeds/organism.mjs';
import { emitOrganism, liveBits, readLiveBits, pruneMain, pruneBrain } from '../genome/emit.mjs';
import { loadFrom } from '../genome/load.mjs';
import { censusSeed, verdictOf, chooseKnockout, readSeed, runArm, censusSharded } from '../tools/organism-census.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCRATCH = path.join(HERE, '.census-scratch', String(process.pid));
const TICKS = 40;
const quiet = () => {};

let seedDir, census, verdictFile, pruneResult, prunedCensus;

before(async () => {
  mkdirSync(SCRATCH, { recursive: true });
  const brain = buildOrganism({ majors: 48, subcellsPerMajor: 6, edgesPerCell: 6, seed: 'census-test', name: 'census-tiny' });
  seedDir = path.join(SCRATCH, 'census-tiny');
  emitOrganism(brain, { dir: seedDir, split: 200 });
  census = await censusSeed(seedDir, { ticks: TICKS, log: quiet });
  const v = verdictOf(census, { ticks: TICKS, command: 'test/census.test.mjs', isTheBar: false, knockoutSeed: 'census' });
  verdictFile = path.join(SCRATCH, 'census-tiny.json');
  writeFileSync(verdictFile, JSON.stringify(v, null, 2) + '\n');
  pruneResult = await pruneMain(['--prune', verdictFile, '--seed', seedDir, '--out', path.join(SCRATCH, 'census-tiny-pruned'), '--quiet']);
  prunedCensus = await censusSeed(pruneResult.dir, { ticks: TICKS, knockout: false, log: quiet });
});
after(() => {
  if (existsSync(SCRATCH)) rmSync(SCRATCH, { recursive: true, force: true });
  const parent = path.dirname(SCRATCH);
  if (existsSync(parent) && readdirSync(parent).length === 0) rmSync(parent, { recursive: true, force: true });
});

describe('census', () => {
  test('the tiny seed has several cells and edges files, and every file present is loaded', () => {
    assert.ok(census.seed.files.cells.length >= 2, 'cells files ' + census.seed.files.cells.length);
    assert.ok(census.seed.files.edges.length >= 2, 'edges files ' + census.seed.files.edges.length);
    assert.equal(census.files.loaded, census.files.present);
    assert.deepEqual(census.files.notLoaded, []);
  });

  test('lines add up: declarations plus structure is every loaded line', () => {
    const l = census.lines;
    assert.equal(l.loaded, l.present);
    assert.equal(l.declarations + l.structure, l.loaded);
    assert.equal(l.liveDeclarations + l.deadDeclarations, l.declarations);
    assert.equal(l.loadBearing, l.liveDeclarations + l.structure);
    assert.equal(l.fractionLiveDeclarations, Number((l.liveDeclarations / l.declarations).toFixed(6)));
    const perFile = l.perFile.reduce((a, f) => a + f.declarations, 0);
    assert.equal(perFile, l.declarations);
    // every c() and e() line is one declaration: cells and edges declared match the brain
    const f = census.full;
    const cellDecl = l.perFile.filter((x) => x.file.startsWith('cells-')).reduce((a, x) => a + x.declarations, 0);
    const edgeDecl = l.perFile.filter((x) => x.file.startsWith('edges-')).reduce((a, x) => a + x.declarations, 0);
    assert.equal(cellDecl, f.cells.declared);
    assert.equal(edgeDecl, f.edges.declared);
  });

  test('cells and edges add up, and something ran but not everything', () => {
    const c = census.full.cells, e = census.full.edges;
    assert.ok(c.ran > 0 && c.ran <= c.declared);
    assert.equal(c.ran + c.neverRan, c.declared);
    assert.equal(c.neverRanBudget + c.neverRanEventNoMail + c.neverRanOther, c.neverRan);
    assert.ok(c.fired <= c.ran, 'fired ' + c.fired + ' ran ' + c.ran);
    assert.ok(c.ranDrive <= c.ran);
    assert.ok(e.delivered > 0 && e.delivered <= e.declared);
    assert.equal(e.delivered + e.notDelivered, e.declared);
    assert.equal(e.srcNeverFired + e.srcFiredOtherPort + e.inFlightAtEnd, e.notDelivered);
    assert.ok(census.full.kinds.ran <= census.full.kinds.present && census.full.kinds.ran > 0);
    assert.ok(census.full.verified.ok);
  });

  test('the liveness bitsets carry exactly the cells that ran and the edges that delivered', () => {
    assert.equal(census.live.cells.n, census.full.cells.declared);
    assert.equal(census.live.cells.count, census.full.cells.ran);
    assert.equal(census.live.edges.n, census.full.edges.declared);
    assert.equal(census.live.edges.count, census.full.edges.delivered);
    const r = readLiveBits(census.live.edges);
    let n = 0; for (let i = 0; i < r.n; i++) if (r.has(i)) n++;
    assert.equal(n, census.full.edges.delivered);
  });

  test('a liveness whose popcount disagrees with its count is refused', () => {
    const b = liveBits(20, (i) => i % 3 === 0);
    assert.equal(b.count, 7);
    assert.throws(() => readLiveBits({ ...b, count: 8 }), /popcount/);
  });
});

describe('knockout', () => {
  test('the seeded file is chosen the same way every time', async () => {
    const seed = await readSeed(seedDir);
    assert.deepEqual(chooseKnockout(seed, 'census'), chooseKnockout(seed, 'census'));
    assert.equal(census.knockouts[0].file, chooseKnockout(seed, 'census').file);
  });

  test('leaving one file out changes a measured output', () => {
    assert.ok(census.knockouts.length >= 1);
    for (const k of census.knockouts) {
      const moved = k.delta.driveRuns !== 0 || k.delta.driveDelivered !== 0;
      assert.ok(moved, k.role + ' knockout of ' + k.file + ' moved nothing: ' + JSON.stringify(k.delta));
      const declared = k.file.startsWith('cells-') ? k.excluded.cells : k.excluded.edges;
      assert.ok(declared > 0, k.file + ' declared nothing');
    }
  });
});

describe('progress', () => {
  test('--progress samples every phase, drive and hosted tasks, at each multiple of N ticks', async () => {
    const seed = await readSeed(seedDir);
    const samples = [];
    const { arm } = await runArm(seed, { ticks: 20, tasks: true, progress: 5, samples });
    assert.equal(arm.progress, samples);
    const phases = [...new Set(samples.map((x) => x.phase))];
    assert.deepEqual(phases, ['load', 'drive', 'tasks', 'end']);
    assert.deepEqual(samples.filter((x) => x.phase === 'drive').map((x) => x.tick), [5, 10, 15, 20]);
    const last = samples[samples.length - 1];
    assert.equal(last.tick, arm.totals.all.ticks);
    assert.ok(samples.filter((x) => x.phase === 'tasks').length >= 1, 'no sample inside the hosted suites');
    for (const x of samples) assert.ok(x.rssMB > 0 && x.freeMB > 0 && Number.isInteger(x.hvSlots));
  });

  test('--min-free-mb stops the arm with the samples taken when free memory is under the floor', async () => {
    const seed = await readSeed(seedDir);
    const samples = [];
    await assert.rejects(runArm(seed, { ticks: 20, tasks: false, progress: 5, minFreeMB: 1e12, samples }), (err) => {
      assert.match(err.message, /physical memory free \(under --min-free-mb/);
      assert.equal(err.censusStop.phase, 'load');
      assert.equal(err.censusSamples, samples);
      assert.equal(samples.length, 1);
      return true;
    });
  });
});

describe('prune', () => {
  test('the pruned seed loads, verifies, and holds the live cells and edges plus what they need', () => {
    assert.ok(pruneResult.ok, JSON.stringify(pruneResult.verify.errors));
    const kc = pruneResult.kept.cells, ke = pruneResult.kept.edges;
    assert.equal(kc.ran, census.full.cells.ran);
    assert.equal(ke.delivered, census.full.edges.delivered);
    assert.equal(ke.inFlightRecorded, true, 'a census verdict records the edges in flight at the end');
    assert.equal(ke.inFlightOnly, census.full.edges.inFlightAtEnd);
    assert.equal(pruneResult.cells, kc.ran + kc.protectedOnly + kc.endpointOnly);
    assert.equal(pruneResult.edges, ke.delivered + ke.inFlightOnly + ke.protectedOnly);
    assert.equal(pruneResult.dropped.cells, census.full.cells.neverRan - kc.protectedOnly - kc.endpointOnly);
    assert.equal(pruneResult.dropped.edgesNeverDelivered, census.full.edges.notDelivered - ke.inFlightOnly - ke.protectedOnly);
    assert.deepEqual(pruneResult.lost, { cells: 0, edges: 0 });
    assert.ok(pruneResult.lines.after < pruneResult.lines.before, 'lines ' + JSON.stringify(pruneResult.lines));
    const manifest = JSON.parse(readFileSync(path.join(pruneResult.dir, 'manifest.json'), 'utf8'));
    assert.equal(manifest.genome.pruned.cells.after, pruneResult.cells);
  });

  test('the pruned seed does the same drive work, and only what was kept for another reason is dead', () => {
    const a = census.full.totals.drive, b = prunedCensus.full.totals.drive;
    assert.equal(b.runs, a.runs);
    assert.equal(b.signals, a.signals);
    assert.equal(b.delivered, a.delivered);
    assert.equal(prunedCensus.full.cells.ran, census.full.cells.ran);
    assert.equal(prunedCensus.full.edges.delivered, census.full.edges.delivered);
    const kc = pruneResult.kept.cells, ke = pruneResult.kept.edges;
    assert.equal(prunedCensus.lines.deadDeclarations, kc.protectedOnly + kc.endpointOnly + ke.inFlightOnly + ke.protectedOnly);
    assert.ok(prunedCensus.lines.fractionLoadBearing > census.lines.fractionLoadBearing);
    assert.ok(prunedCensus.lines.loaded < census.lines.loaded);
  });

  test('prune never removes a declaration that ran or delivered, nor a protected one', async () => {
    // planted liveness on the tiny seed: every third cell ran, every fifth edge delivered
    // whatever its endpoints did, so some delivered edges lead into cells that never ran
    const { brain } = await loadFrom(seedDir);
    const k = brain.connectome, nC = brain.cells.length;
    const ranCell = (i) => i % 3 === 0, delivered = (e) => e % 5 === 0;
    const protectedCell = [...Array(nC).keys()].find((i) => !ranCell(i) && ![...Array(k.n).keys()].some((e) => delivered(e) && (k.src[e] === i || k.dst[e] === i)));
    assert.ok(protectedCell !== undefined, 'no cell is free of the planted liveness');
    const live = { cells: { n: nC, has: ranCell }, edges: { n: k.n, has: delivered } };
    const { brain: out, kept } = pruneBrain(brain, live, { protect: { cells: [protectedCell], edges: [], why: ['planted'] } });
    assert.ok(kept.cells.endpointOnly > 0, 'the planted liveness never sent a delivered edge into a cell that did not run');
    assert.equal(kept.cells.protectedOnly, 1);
    const ids = new Set(out.cells.map((c) => c.id));
    for (let i = 0; i < nC; i++) if (ranCell(i)) assert.ok(ids.has(brain.cells[i].id), 'dropped ' + brain.cells[i].id + ', which ran');
    assert.ok(ids.has(brain.cells[protectedCell].id), 'dropped the protected cell');
    const ok = out.connectome, have = new Set();
    for (let e = 0; e < ok.n; e++) have.add(out.cells[ok.src[e]].id + '>' + out.cells[ok.dst[e]].id + ':' + ok.srcPort[e] + ':' + ok.dstPort[e]);
    let n = 0;
    for (let e = 0; e < k.n; e++) {
      if (!delivered(e)) continue;
      n++;
      assert.ok(have.has(brain.cells[k.src[e]].id + '>' + brain.cells[k.dst[e]].id + ':' + k.srcPort[e] + ':' + k.dstPort[e]), 'dropped edge ' + e + ', which delivered');
    }
    assert.equal(ok.n, n);
    assert.ok(out.cells.length < nC);
  });

  test('the pruned seed answers the hosted problems the same', () => {
    assert.equal(prunedCensus.full.tasks.score, census.full.tasks.score);
    assert.equal(prunedCensus.full.tasks.algebra.correct, census.full.tasks.algebra.correct);
  });

  test('a census taken on another organism is refused', async () => {
    const v = JSON.parse(readFileSync(verdictFile, 'utf8'));
    v.live.manifestHash = '0'.repeat(64);
    const bad = path.join(SCRATCH, 'census-wrong.json');
    writeFileSync(bad, JSON.stringify(v));
    await assert.rejects(pruneMain(['--prune', bad, '--seed', seedDir, '--out', path.join(SCRATCH, 'never'), '--quiet']), /different|hash/);
    assert.equal(existsSync(path.join(SCRATCH, 'never')), false);
  });
});

// The sharded census on a sparser tiny seed (2 edges per cell, 6 ticks, no hosted problems):
// sparse and short enough that a shard's backward cone is a strict part of the seed, so the
// equality below is not the whole census run again under another name.
describe('sharded', () => {
  let sparseDir;
  before(() => {
    const brain = buildOrganism({ majors: 48, subcellsPerMajor: 6, edgesPerCell: 2, seed: 'census-test', name: 'census-sparse' });
    sparseDir = path.join(SCRATCH, 'census-sparse');
    emitOrganism(brain, { dir: sparseDir, split: 200 });
  });

  test('sharded tallies equal whole tallies on a tiny seed, array by array', async () => {
    const ticks = 6;
    const seed = await readSeed(sparseDir);
    const { arm } = await runArm(seed, { ticks, tasks: false });
    const s = await censusSharded(sparseDir, { shardFiles: 1, mode: 'exact', ticks, tasks: false, capMB: 0, log: quiet });
    assert.equal(s.exact, true);
    assert.ok(s.shards.length >= 2, 'shards ' + s.shards.length);
    assert.ok(s.shards.some((x) => x.loadedCells < arm.cells.declared), 'every shard loaded the whole seed, so the check proves nothing');
    for (const k of ['runs', 'driveRuns', 'fired', 'signals', 'driveSignals', 'hits', 'driveHits', 'used']) {
      assert.deepEqual(Array.from(s.full.raw[k]), Array.from(arm.raw[k]), k + ' differs between the shards and the whole');
    }
    assert.ok(arm.cells.ran > 0 && arm.edges.delivered > 0, 'nothing ran, so the equality is empty');
    assert.deepEqual(s.full.cells, arm.cells);
    assert.deepEqual(s.full.edges, arm.edges);
    assert.deepEqual(s.full.declaredTotals, arm.declaredTotals);
  });

  test('a shard estimated over its cap is refused before anything is loaded', async () => {
    const ratio = { file: 'planted', seed: 'planted', ticks: 0, peakMB: 1, lines: 1, bytesPerLine: 1048576, how: 'planted' };
    await assert.rejects(censusSharded(sparseDir, { shardFiles: 1, ticks: 6, tasks: false, capMB: 1, ratio, log: quiet }), (err) => {
      assert.ok(err.censusRefused, err.message);
      assert.match(err.message, /over the 1 MB cap/);
      assert.ok(err.censusRefused.shards.length >= 2);
      return true;
    });
  });
});

describe('refusal', () => {
  test('a whole load past half of physical memory is refused from a planted manifest, exit 2', () => {
    const dir = path.join(SCRATCH, 'planted-huge');
    mkdirSync(dir, { recursive: true });
    // a planted ratio: 100 MB over 1000 lines, 104858 bytes per line
    const ratioFile = path.join(SCRATCH, 'planted-ratio.json');
    writeFileSync(ratioFile, JSON.stringify({ seed: 'organism/gen-0', lines: { loaded: 1000 }, memoryMB: { rssAfterFull: 100 } }));
    // enough lines that the estimate is about all of physical memory; only the manifest exists
    const lines = Math.ceil(totalmem() / 104857);
    writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({ format: 'brain.genome.v1', name: 'planted-huge', counts: { lines, cells: 1, edges: 0 } }));
    const census = path.join(HERE, '..', 'tools', 'organism-census.mjs');
    const r = spawnSync(process.execPath, ['--max-old-space-size=512', census, '--seed', dir, '--ratio-from', ratioFile, '--verdict-dir', path.join(SCRATCH, 'planted-verdicts')], { encoding: 'utf8', timeout: 60000 });
    assert.equal(r.status, 2, 'exit ' + r.status + ': ' + r.stdout + r.stderr);
    assert.match(r.stderr, /REFUSED a whole load/);
    assert.match(r.stderr, /--shard-files/);
    assert.match(r.stderr, new RegExp(lines + ' manifest lines'));
    assert.equal(existsSync(path.join(dir, 'index.mjs')), false, 'the refusal needed nothing but the manifest');
  });
});
