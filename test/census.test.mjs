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
// genome/emit.mjs --wire (Board 23) is checked the same way: what it wires is legal, came from a
// port that delivered, went into a silent cell that reads mail, and a prune by the wired seed's
// census keeps more live than the prune alone on the same seed.
//
// Scratch lives in test/.census-scratch/<pid>, inside the brain tree and skipped by the gate
// (a dot directory), and is removed when the file finishes.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync, readdirSync, cpSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { totalmem } from 'node:os';
import { buildOrganism } from '../seeds/organism.mjs';
import { emitOrganism, liveBits, readLiveBits, pruneMain, pruneBrain, wireMain, wireBrain } from '../genome/emit.mjs';
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

// Wire before prune (MANUAL P8, Board 23): genome/emit.mjs --wire gives a silent cell's unreached
// in ports one edge each from a port that delivered, and the prune by the wired seed's census
// then removes what still never runs. The control is the prune alone (pruneResult above) on the
// same tiny seed, the same ticks and the same census.
describe('wire', () => {
  let wireResult, wiredCensus, wiredVerdictFile, wiredPruned, wiredPrunedCensus, v0, live0, hosted;
  const keyOf = (c, sp) => { const o = c.ports.out[sp]; const key = [...o.kinds].sort().join('|'); return o.kinds.length > 1 ? key + '#' + c.idx : key; };
  const edgeKey = (b, e) => { const k = b.connectome; return b.cells[k.src[e]].id + '>' + b.cells[k.dst[e]].id + ':' + k.srcPort[e] + ':' + k.dstPort[e]; };
  before(async () => {
    v0 = JSON.parse(readFileSync(verdictFile, 'utf8'));
    live0 = { cells: readLiveBits(v0.live.cells), edges: readLiveBits(v0.live.edges) };
    hosted = new Set([...(v0.tasks.algebra.cells || []), ...(v0.tasks.sequence.cells || [])]);
    wireResult = await wireMain(['--wire', verdictFile, '--seed', seedDir, '--out', path.join(SCRATCH, 'census-tiny-wired'), '--quiet']);
    wiredCensus = await censusSeed(wireResult.dir, { ticks: TICKS, knockout: false, log: quiet });
    wiredVerdictFile = path.join(SCRATCH, 'census-tiny-wired.json');
    writeFileSync(wiredVerdictFile, JSON.stringify(verdictOf(wiredCensus, { ticks: TICKS, command: 'test/census.test.mjs', isTheBar: false, knockoutSeed: 'census' }), null, 2) + '\n');
    wiredPruned = await pruneMain(['--prune', wiredVerdictFile, '--seed', wireResult.dir, '--out', path.join(SCRATCH, 'census-tiny-wired-pruned'), '--quiet']);
    wiredPrunedCensus = await censusSeed(wiredPruned.dir, { ticks: TICKS, knockout: false, log: quiet });
  });

  test('wire adds edges only, from ports that delivered, into silent unhosted cells that read mail, on ports nothing reached', async () => {
    assert.ok(wireResult.ok, JSON.stringify(wireResult.verify.errors));
    assert.ok(wireResult.counts.portsWired > 0, 'nothing was wired, so every check below is empty');
    assert.equal(wireResult.moved, 0);
    const { brain } = await loadFrom(seedDir);
    const k = brain.connectome, nE = k.n, horizon = v0.dormant.lastTickBound;
    assert.equal(wireResult.cells, brain.cells.length);
    assert.equal(wireResult.edges, nE + wireResult.wired.length);
    assert.equal(wireResult.wired.length, wireResult.counts.portsWired);
    const idx = new Map(brain.cells.map((c, i) => [c.id, i]));
    const delivers = new Uint8Array(brain.cells.length), reached = new Set(), first = new Map(), have = new Set();
    for (let e = 0; e < nE; e++) {
      have.add(edgeKey(brain, e));
      const ck = k.dst[e] + ':' + k.dstPort[e];
      if (!first.has(ck)) first.set(ck, e);
      if (live0.edges.has(e)) { delivers[k.src[e]] = 1; reached.add(ck); }
    }
    let claimed = 0;
    const seen = new Set();
    for (const w of wireResult.wired) {
      const s = idx.get(w.src), i = idx.get(w.dst), c = brain.cells[i], d = brain.cells[s];
      assert.ok(live0.edges.has(w.donorEdge), w.src + '.' + w.srcPort + ' donates through edge ' + w.donorEdge + ', which never delivered');
      assert.equal(k.src[w.donorEdge], s); assert.equal(k.srcPort[w.donorEdge], w.srcPort);
      assert.equal(delivers[i], 0, 'wired into ' + w.dst + ', which already delivered');
      assert.equal(hosted.has(w.dst), false, 'wired into ' + w.dst + ', which the hosted problems ran on');
      const p = c.policy.period;
      assert.ok(p === 'event' || (typeof p === 'number' && p >= 1 && p <= horizon), 'wired into ' + w.dst + ', period ' + p + ', which reads no mail before tick ' + horizon);
      assert.equal(reached.has(i + ':' + w.dstPort), false, 'wired ' + w.dst + '.' + w.dstPort + ', which a delivered edge already reached');
      assert.ok(d.ports.out[w.srcPort].kinds.every((x) => c.ports.in[w.dstPort].kinds.includes(x)), 'illegal kinds ' + w.src + '.' + w.srcPort + ' -> ' + w.dst + '.' + w.dstPort);
      const f = first.get(i + ':' + w.dstPort);
      if (f !== undefined) { claimed++; assert.equal(keyOf(d, w.srcPort), keyOf(brain.cells[k.src[f]], k.srcPort[f]), 'the claim of ' + w.dst + '.' + w.dstPort + ' was broken'); }
      const key = w.src + '>' + w.dst + ':' + w.srcPort + ':' + w.dstPort;
      assert.equal(have.has(key) || seen.has(key), false, 'duplicate edge ' + key);
      seen.add(key);
    }
    assert.ok(claimed > 0, 'no wired port had an afferent, so the claim was never checked');
    const back = (await loadFrom(wireResult.dir)).brain, bk = back.connectome;
    for (let j = 0; j < wireResult.wired.length; j++) {
      const w = wireResult.wired[j], e = nE + j, de = w.donorEdge;
      assert.equal(edgeKey(back, e), w.src + '>' + w.dst + ':' + w.srcPort + ':' + w.dstPort);
      assert.equal(bk.w[e], k.w[de]); assert.equal(bk.delay[e], k.delay[de]); assert.equal(bk.conf[e], k.conf[de]);
    }
    const manifest = JSON.parse(readFileSync(path.join(wireResult.dir, 'manifest.json'), 'utf8'));
    assert.equal(manifest.genome.wired.portsWired, wireResult.counts.portsWired);
  });

  test('the wired seed runs without a throw and more of it is live than before', () => {
    assert.equal(wiredCensus.full.cells.errored, 0);
    assert.ok(wiredCensus.lines.liveDeclarations > census.lines.liveDeclarations, 'live ' + wiredCensus.lines.liveDeclarations + ' vs ' + census.lines.liveDeclarations);
    assert.ok(wiredCensus.full.cells.fired > census.full.cells.fired, 'fired ' + wiredCensus.full.cells.fired + ' vs ' + census.full.cells.fired);
  });

  test('wire then prune leaves only what was kept for another reason dead, and keeps more live than the prune alone (the control)', () => {
    assert.ok(wiredPruned.ok, JSON.stringify(wiredPruned.verify.errors));
    const kc = wiredPruned.kept.cells, ke = wiredPruned.kept.edges;
    assert.equal(wiredPrunedCensus.lines.deadDeclarations, kc.protectedOnly + kc.endpointOnly + ke.inFlightOnly + ke.protectedOnly);
    const a = wiredCensus.full.totals.drive, b = wiredPrunedCensus.full.totals.drive;
    assert.equal(b.runs, a.runs); assert.equal(b.signals, a.signals); assert.equal(b.delivered, a.delivered);
    assert.ok(wiredPrunedCensus.lines.liveDeclarations > prunedCensus.lines.liveDeclarations, 'live ' + wiredPrunedCensus.lines.liveDeclarations + ' vs the control ' + prunedCensus.lines.liveDeclarations);
    assert.ok(wiredPrunedCensus.full.cells.fired >= prunedCensus.full.cells.fired, 'fired ' + wiredPrunedCensus.full.cells.fired + ' vs the control ' + prunedCensus.full.cells.fired);
    assert.ok(wiredPrunedCensus.lines.deadDeclarations <= prunedCensus.lines.deadDeclarations);
  });

  test('a protected cell is never wired, and the same run without the protection wires it', async () => {
    const horizon = v0.dormant.lastTickBound;
    const open = wireBrain((await loadFrom(seedDir)).brain, live0, { horizon });
    assert.equal(open.counts.protectedSkipped, 0);
    const target = open.wired[0] && open.wired[0].dst;
    assert.ok(target, 'nothing was wired without protection');
    const b2 = (await loadFrom(seedDir)).brain;
    const ti = b2.cells.findIndex((c) => c.id === target);
    const shut = wireBrain(b2, live0, { horizon, protect: [ti] });
    assert.equal(shut.counts.protectedSkipped, 1);
    assert.equal(shut.wired.some((w) => w.dst === target), false, 'wired into the protected cell ' + target);
    assert.deepEqual(shut.wired, open.wired.filter((w) => w.dst !== target));
  });

  test('a periodic cell with no run inside the horizon is never wired, and a longer horizon wires it', async () => {
    const horizon = v0.dormant.lastTickBound;
    const near = wireBrain((await loadFrom(seedDir)).brain, live0, { horizon });
    assert.ok(near.counts.clockSkipped > 0, 'no silent cell was on a slow clock, so the rule was never exercised');
    const far = wireBrain((await loadFrom(seedDir)).brain, live0, { horizon: 1e9 });
    assert.equal(far.counts.clockSkipped, 0);
    const slow = far.wired.filter((w) => { const p = far.brain.cells.find((c) => c.id === w.dst).policy.period; return typeof p === 'number' && p > horizon; });
    assert.ok(slow.length > 0, 'the longer horizon wired no slow cell');
    for (const w of slow) assert.equal(near.wired.some((x) => x.dst === w.dst), false, 'wired the slow cell ' + w.dst + ' inside horizon ' + horizon);
  });

  test('in place: --out equal to --seed lands through a staging sibling, and a census of the old seed is then refused with the seed untouched', async () => {
    const dir = path.join(SCRATCH, 'census-tiny-in-place'); // the depth the seed was emitted at: index.mjs imports genome/load.mjs by a relative path
    cpSync(seedDir, dir, { recursive: true });
    const r = await wireMain(['--wire', verdictFile, '--seed', dir, '--out', dir, '--quiet']);
    assert.ok(r.ok, JSON.stringify(r.verify.errors));
    assert.equal(path.resolve(r.dir), path.resolve(dir));
    assert.deepEqual(readdirSync(SCRATCH).filter((x) => /emit-staging/.test(x)), [], 'a staging directory was left behind');
    const m = JSON.parse(readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
    assert.equal(m.hash, wireResult.verify.hash, 'the seed wired in place differs from the one wired elsewhere');
    const before = readFileSync(path.join(dir, 'manifest.json'), 'utf8');
    await assert.rejects(wireMain(['--wire', verdictFile, '--seed', dir, '--out', dir, '--quiet']), /hash/);
    assert.equal(readFileSync(path.join(dir, 'manifest.json'), 'utf8'), before);
    assert.deepEqual(readdirSync(SCRATCH).filter((x) => /emit-staging/.test(x)), []);
  });

  test('in place: a seed rewritten in place earlier in this process is refused, not pruned from its stale import cache', async () => {
    // wire in place, then prune in place by a census whose hash IS the wired seed's: the manifest
    // matches, but this process imported the old parts files from the same paths, so the load is
    // stale and the prune must refuse rather than land a seed its census never measured
    const dir = path.join(SCRATCH, 'census-tiny-stale');
    cpSync(seedDir, dir, { recursive: true });
    const r = await wireMain(['--wire', verdictFile, '--seed', dir, '--out', dir, '--quiet']);
    assert.ok(r.ok, JSON.stringify(r.verify.errors));
    assert.equal(JSON.parse(readFileSync(wiredVerdictFile, 'utf8')).live.manifestHash, r.verify.hash, 'the wired census is not of this seed, so the refusal below would be the hash one');
    const before = readFileSync(path.join(dir, 'manifest.json'), 'utf8');
    await assert.rejects(pruneMain(['--prune', wiredVerdictFile, '--seed', dir, '--out', dir, '--quiet']), /import cache/);
    assert.equal(readFileSync(path.join(dir, 'manifest.json'), 'utf8'), before);
    assert.deepEqual(readdirSync(SCRATCH).filter((x) => /emit-staging/.test(x)), []);
  });

  test('the wire verifies what it loaded: a stale import of a seed pruned in place is refused even when it loads', async () => {
    // prune in place (the first import of this path loads the wired parts), then wire by a census
    // of the pruned seed: the manifest matches, the parts served are the wired ones from the cache
    const dir = path.join(SCRATCH, 'census-tiny-stale-load');
    cpSync(wireResult.dir, dir, { recursive: true });
    const p = await pruneMain(['--prune', wiredVerdictFile, '--seed', dir, '--out', dir, '--quiet']);
    assert.ok(p.ok, JSON.stringify(p.verify.errors));
    const vf = path.join(SCRATCH, 'census-tiny-wired-pruned.json');
    writeFileSync(vf, JSON.stringify(verdictOf(wiredPrunedCensus, { ticks: TICKS, command: 'test/census.test.mjs', isTheBar: false, knockoutSeed: 'census' })) + '\n');
    assert.equal(JSON.parse(readFileSync(vf, 'utf8')).live.manifestHash, p.verify.hash, 'the census is not of the pruned seed, so the refusal below would be the hash one');
    const out = path.join(SCRATCH, 'census-tiny-never-wired');
    await assert.rejects(wireMain(['--wire', vf, '--seed', dir, '--out', out, '--quiet']), /manifest does not describe[^]*import cache/);
    assert.equal(existsSync(out), false);
  });

  test('rounds of census and wire reach a fixed point, every round is kept in the manifest, and the fixed point in place leaves the seed as it is', async () => {
    let dir = wireResult.dir, vf = wiredVerdictFile, last = wireResult;
    const rounds = [wireResult.counts.portsWired];
    for (let r = 2; r <= 8 && last.counts.portsWired > 0; r++) {
      last = await wireMain(['--wire', vf, '--seed', dir, '--out', path.join(SCRATCH, 'census-tiny-wired-r' + r), '--quiet']);
      assert.ok(last.ok, JSON.stringify(last.verify.errors));
      rounds.push(last.counts.portsWired);
      dir = last.dir;
      if (last.counts.portsWired === 0) break;
      const c = await censusSeed(dir, { ticks: TICKS, knockout: false, log: quiet });
      vf = path.join(SCRATCH, 'census-tiny-wired-r' + r + '.json');
      writeFileSync(vf, JSON.stringify(verdictOf(c, { ticks: TICKS, command: 'test/census.test.mjs', isTheBar: false, knockoutSeed: 'census' })) + '\n');
    }
    assert.equal(rounds[rounds.length - 1], 0, 'no fixed point in 8 rounds: ' + rounds.join(', '));
    assert.ok(rounds.length >= 2);
    const m = JSON.parse(readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
    assert.deepEqual(m.genome.wired.rounds.map((x) => x.portsWired), rounds);
    assert.equal(m.genome.wired.portsWired, 0);
    // the fixed point over the seed itself (the seed the last round read, whose census is vf):
    // nothing is written, so the record of the rounds that did wire stays
    const prev = rounds.length >= 3 ? path.join(SCRATCH, 'census-tiny-wired-r' + (rounds.length - 1)) : wireResult.dir;
    const fixed = path.join(SCRATCH, 'census-tiny-fixed-in-place');
    cpSync(prev, fixed, { recursive: true });
    const before = readFileSync(path.join(fixed, 'manifest.json'), 'utf8');
    const r = await wireMain(['--wire', vf, '--seed', fixed, '--out', fixed, '--quiet']);
    assert.equal(r.ok, true); assert.equal(r.unchanged, true); assert.equal(r.counts.portsWired, 0);
    assert.equal(readFileSync(path.join(fixed, 'manifest.json'), 'utf8'), before, 'the fixed point rewrote the seed');
    assert.deepEqual(readdirSync(SCRATCH).filter((x) => /emit-staging/.test(x)), []);
  });

  test('in place: --prune with --out equal to --seed lands the same pruned seed as a prune elsewhere', async () => {
    const dir = path.join(SCRATCH, 'census-tiny-prune-in-place');
    cpSync(wireResult.dir, dir, { recursive: true });
    const r = await pruneMain(['--prune', wiredVerdictFile, '--seed', dir, '--out', dir, '--quiet']);
    assert.ok(r.ok, JSON.stringify(r.verify.errors));
    assert.deepEqual(readdirSync(SCRATCH).filter((x) => /emit-staging/.test(x)), [], 'a staging directory was left behind');
    assert.equal(r.lines.after, wiredPruned.lines.after);
    assert.equal(JSON.parse(readFileSync(path.join(dir, 'manifest.json'), 'utf8')).hash, wiredPruned.verify.hash);
  });

  // Board 23 dead-share fix pass: the cases above check that what was wired is legal (soundness);
  // this one checks that everything the rule owes was wired, and with the donor it names
  // (completeness and choice), from an oracle written from the rule's words, not from its code.
  test('every unreached in port of a silent unhosted cell that reads mail gets the nearest legal donor, and nothing else is wired', async () => {
    const { brain } = await loadFrom(seedDir);
    const k = brain.connectome, nE = k.n, nC = brain.cells.length, horizon = v0.dormant.lastTickBound;
    const delivers = new Uint8Array(nC), reached = new Set(), owner = new Map(), have = new Set(), firstDelivered = new Map();
    for (let e = 0; e < nE; e++) {
      const s = k.src[e], d = k.dst[e], sp = k.srcPort[e], dp = k.dstPort[e];
      have.add(s + ':' + d + ':' + sp + ':' + dp);
      if (!owner.has(d + ':' + dp)) owner.set(d + ':' + dp, keyOf(brain.cells[s], sp)); // the first declared afferent claims the port
      if (!live0.edges.has(e)) continue;
      delivers[s] = 1; reached.add(d + ':' + dp);
      if (!firstDelivered.has(s + ':' + sp)) firstDelivered.set(s + ':' + sp, e);
    }
    const donors = [...firstDelivered.entries()].map(([key, e]) => { const [s, sp] = key.split(':').map(Number); return { s, sp, e }; });
    const expected = [];
    let evt = 0, slow = 0, owned = 0, free = 0, notLowestIndex = 0;
    for (let i = 0; i < nC; i++) {
      const c = brain.cells[i], p = c.policy.period;
      if (delivers[i] || hosted.has(c.id)) continue;
      if (!(p === 'event' || (typeof p === 'number' && p >= 1 && p <= horizon))) { slow++; continue; }
      for (let dp = 0; dp < c.ports.in.length; dp++) {
        if (reached.has(i + ':' + dp)) continue;
        const legal = donors.filter((d) => d.s !== i
          && brain.cells[d.s].ports.out[d.sp].kinds.every((x) => c.ports.in[dp].kinds.includes(x))
          && (!owner.has(i + ':' + dp) || owner.get(i + ':' + dp) === keyOf(brain.cells[d.s], d.sp))
          && !have.has(d.s + ':' + i + ':' + d.sp + ':' + dp));
        if (!legal.length) continue;
        const dc = (d) => brain.cells[d.s];
        const near = (d) => (dc(d).circuit === c.circuit && dc(d).region === c.region ? 0 : dc(d).region === c.region ? 1 : 2);
        const rank = (d) => [near(d), Math.abs(d.s - i), d.s, d.sp];
        const less = (a, b) => { for (let j = 0; j < a.length; j++) if (a[j] !== b[j]) return a[j] < b[j]; return false; };
        let best = legal[0];
        for (const d of legal) if (less(rank(d), rank(best))) best = d;
        const lowest = legal.reduce((a, d) => (d.s < a.s || (d.s === a.s && d.sp < a.sp) ? d : a), legal[0]);
        if (lowest !== best) notLowestIndex++;
        if (p === 'event') evt++;
        if (owner.has(i + ':' + dp)) owned++; else free++;
        expected.push({ src: dc(best).id, dst: c.id, srcPort: best.sp, dstPort: dp, donorEdge: best.e });
      }
    }
    // the population this oracle saw: both kinds of cell, both kinds of port, and a choice the
    // nearness rank decided (the nearest legal donor was not the lowest indexed one)
    assert.ok(expected.length > 0, 'the oracle owes nothing, so the equality below is empty');
    assert.ok(evt > 0 && expected.length - evt > 0, 'wired event cells ' + evt + ' of ' + expected.length + ': one kind of cell only');
    assert.ok(owned > 0 && free > 0, 'claimed ports ' + owned + ', unclaimed ' + free + ': one kind of port only');
    assert.ok(notLowestIndex > 0, 'the nearest donor was always the lowest indexed one, so nearness was never tested');
    assert.ok(slow > 0, 'no silent cell was on a slow clock');
    assert.deepEqual(wireResult.wired.map((w) => ({ src: w.src, dst: w.dst, srcPort: w.srcPort, dstPort: w.dstPort, donorEdge: w.donorEdge })), expected);
  });

  test('a wired edge carries its donor edge\'s weight, delay and confidence, on planted confidences that differ', async () => {
    // every edge of the tiny seed carries the 0.5 default confidence, so a copy of the confidence is
    // untested there; plant a different confidence on every edge first, then wire in memory
    const { brain } = await loadFrom(seedDir);
    const k = brain.connectome, nE = k.n;
    for (let e = 0; e < nE; e++) k.conf[e] = Math.fround(0.25 + (e % 7) / 16);
    const { wired } = wireBrain(brain, live0, { horizon: v0.dormant.lastTickBound, protect: [...hosted].map((id) => brain.cells.findIndex((c) => c.id === id)) });
    assert.ok(wired.length > 0);
    const confs = new Set(wired.map((w) => k.conf[w.donorEdge]));
    assert.ok(confs.size > 1, 'the donors carried one confidence only');
    for (let j = 0; j < wired.length; j++) {
      const e = nE + j, de = wired[j].donorEdge;
      assert.equal(k.conf[e], k.conf[de], 'confidence of wired edge ' + j);
      assert.equal(k.w[e], k.w[de], 'weight of wired edge ' + j);
      assert.equal(k.delay[e], k.delay[de], 'delay of wired edge ' + j);
    }
  });

  test('an edge already declared is never declared twice: planted, the only donor port already has an undelivered edge into the unreached port', async () => {
    // on the census's own liveness a delivering port almost never has an undelivered edge into an
    // unreached port (fan-out delivers on every edge of a port that fired), so the check was never
    // reached there; plant a liveness where one edge alone delivered and its port's sibling edge
    // leads, unreached, into a port that port already claims
    const { brain } = await loadFrom(seedDir);
    const k = brain.connectome, nE = k.n, nC = brain.cells.length, horizon = v0.dormant.lastTickBound;
    const reads = (c) => c.policy.period === 'event' || (typeof c.policy.period === 'number' && c.policy.period >= 1 && c.policy.period <= horizon);
    const first = new Map(), bySrcPort = new Map();
    for (let e = 0; e < nE; e++) {
      const ck = k.dst[e] + ':' + k.dstPort[e], sk = k.src[e] + ':' + k.srcPort[e];
      if (!first.has(ck)) first.set(ck, e);
      if (!bySrcPort.has(sk)) bySrcPort.set(sk, []);
      bySrcPort.get(sk).push(e);
    }
    let pick = null;
    for (const e0 of first.values()) {
      const s = k.src[e0], sp = k.srcPort[e0], i = k.dst[e0];
      if (s === i || hosted.has(brain.cells[i].id) || !reads(brain.cells[i])) continue;
      const e1 = bySrcPort.get(s + ':' + sp).find((e) => e !== e0 && k.dst[e] !== i);
      if (e1 === undefined) continue;
      pick = { e0, e1, s, sp, i, dp: k.dstPort[e0] };
      break;
    }
    assert.ok(pick, 'no edge of the tiny seed fits the plant');
    const live = { cells: { n: nC, has: () => true }, edges: { n: nE, has: (e) => e === pick.e1 } };
    const protect = [...hosted].map((id) => brain.cells.findIndex((c) => c.id === id));
    const idx = new Map(brain.cells.map((c, i) => [c.id, i]));
    const declared = new Set();
    for (let e = 0; e < nE; e++) declared.add(k.src[e] + '>' + k.dst[e] + ':' + k.srcPort[e] + ':' + k.dstPort[e]);
    const r = wireBrain(brain, live, { horizon, protect });
    assert.equal(r.counts.donors, 1);
    for (const w of r.wired) assert.equal(declared.has(idx.get(w.src) + '>' + idx.get(w.dst) + ':' + w.srcPort + ':' + w.dstPort), false, 'declared twice: ' + w.src + '.' + w.srcPort + ' -> ' + w.dst + '.' + w.dstPort);
    assert.equal(r.wired.some((w) => w.dst === brain.cells[pick.i].id && w.dstPort === pick.dp), false, 'the planted port was wired from the port that already has an edge into it');
    assert.ok(r.counts.portsNoDonor >= 1);
  });

  test('the wire counts lines on two rulers, never mixed: the manifest count and every file with manifest.json', () => {
    const l = wireResult.lines;
    assert.equal(l.before, manifestCount(seedDir));
    assert.equal(l.after, manifestCount(wireResult.dir));
    assert.equal(l.removed, l.before - l.after);
    assert.equal(l.census.before, everyFileLines(seedDir));
    assert.equal(l.census.after, everyFileLines(wireResult.dir));
    assert.equal(l.census.before, census.lines.present);
    assert.equal(l.census.after, wiredCensus.lines.present);
    assert.equal(l.census.before - l.before, manifestFileLines(seedDir));
    assert.equal(l.census.after - l.after, manifestFileLines(wireResult.dir));
  });
});

// Board 23 dead-share fix pass: genome/emit.mjs --prune printed "lines <seed manifest count> ->
// <copy lines with manifest.json>", two rulers in one line (on organism/gen-1-4-4-1-4 it printed
// 1965 -> 1175, where one ruler reads 1965 -> 1044 and the other 2049 -> 1175). Each print is now
// one ruler, and a prune that drops nothing must print 0 removed on both.
const manifestCount = (dir) => JSON.parse(readFileSync(path.join(dir, 'manifest.json'), 'utf8')).counts.lines;
const manifestFileLines = (dir) => readFileSync(path.join(dir, 'manifest.json'), 'utf8').split('\n').length;
const everyFileLines = (dir) => readdirSync(dir).reduce((a, f) => a + readFileSync(path.join(dir, f), 'utf8').split('\n').length, 0);
describe('line rulers', () => {
  test('the prune prints before and after on one ruler each: the manifest count, and the census ruler', () => {
    const l = pruneResult.lines;
    assert.equal(l.before, manifestCount(seedDir));
    assert.equal(l.after, manifestCount(pruneResult.dir));
    assert.equal(l.removed, l.before - l.after);
    assert.ok(l.removed > 0, JSON.stringify(l));
    assert.equal(l.census.before, census.lines.present);
    assert.equal(l.census.after, prunedCensus.lines.present);
    assert.equal(l.census.before, everyFileLines(seedDir));
    assert.equal(l.census.after, everyFileLines(pruneResult.dir));
    assert.equal(l.census.removed, l.census.before - l.census.after);
    // manifest.json is the one file the two rulers disagree on, before and after
    assert.equal(l.census.before - l.before, manifestFileLines(seedDir));
    assert.equal(l.census.after - l.after, manifestFileLines(pruneResult.dir));
  });

  test('a prune that drops a declaration removes lines, and a prune that drops nothing removes 0 on the manifest count', async () => {
    // the census of the pruned seed has no knockout, so the prune by it drops what only a knockout
    // protected (a prune that removes); the census of that result prunes nothing (the fixed point)
    const vf2 = path.join(SCRATCH, 'census-tiny-pruned.json');
    writeFileSync(vf2, JSON.stringify(verdictOf(prunedCensus, { ticks: TICKS, command: 'test/census.test.mjs', isTheBar: false, knockoutSeed: 'census' })) + '\n');
    const p2 = await pruneMain(['--prune', vf2, '--seed', pruneResult.dir, '--out', path.join(SCRATCH, 'census-tiny-pruned-2'), '--quiet']);
    assert.ok(p2.ok, JSON.stringify(p2.verify.errors));
    const c2 = await censusSeed(p2.dir, { ticks: TICKS, knockout: false, log: quiet });
    const vf3 = path.join(SCRATCH, 'census-tiny-pruned-2.json');
    writeFileSync(vf3, JSON.stringify(verdictOf(c2, { ticks: TICKS, command: 'test/census.test.mjs', isTheBar: false, knockoutSeed: 'census' })) + '\n');
    const p3 = await pruneMain(['--prune', vf3, '--seed', p2.dir, '--out', path.join(SCRATCH, 'census-tiny-pruned-3'), '--quiet']);
    assert.ok(p3.ok, JSON.stringify(p3.verify.errors));
    assert.ok(p2.cells + p2.edges < pruneResult.cells + pruneResult.edges, 'the second prune dropped nothing, so it is not the row that removes');
    assert.ok(p2.lines.removed > 0, JSON.stringify(p2.lines));
    assert.equal(p3.cells, p2.cells, 'the third prune dropped a cell, so it is not the fixed point');
    assert.equal(p3.edges, p2.edges);
    assert.equal(p3.lines.before, p3.lines.after, JSON.stringify(p3.lines));
    assert.equal(p3.lines.removed, 0);
    assert.equal(p3.lines.census.before - p3.lines.census.after, manifestFileLines(p2.dir) - manifestFileLines(p3.dir));
  });

  test('in place, the census ruler before is the seed as it was, read before the directory is replaced', async () => {
    const dir = path.join(SCRATCH, 'census-tiny-ruler-in-place');
    cpSync(seedDir, dir, { recursive: true });
    const wantBefore = everyFileLines(dir), wantCount = manifestCount(dir);
    const r = await pruneMain(['--prune', verdictFile, '--seed', dir, '--out', dir, '--quiet']);
    assert.ok(r.ok, JSON.stringify(r.verify.errors));
    assert.equal(r.lines.census.before, wantBefore);
    assert.equal(r.lines.before, wantCount);
    assert.equal(r.lines.after, manifestCount(dir));
    assert.equal(r.lines.census.after, everyFileLines(dir));
    assert.ok(r.lines.census.before !== r.lines.census.after);
  });

  test('the prune counts the kept edges whose mail no cell reads inside the census horizon', async () => {
    const u = pruneResult.unread, horizon = JSON.parse(readFileSync(verdictFile, 'utf8')).dormant.lastTickBound;
    assert.ok(u && u.horizon === horizon, JSON.stringify(u));
    const { brain } = await loadFrom(pruneResult.dir);
    const k = brain.connectome, reads = (c) => c.policy.period === 'event' || (typeof c.policy.period === 'number' && c.policy.period >= 1 && c.policy.period <= horizon);
    let n = 0; const into = new Set();
    for (let e = 0; e < k.n; e++) if (!reads(brain.cells[k.dst[e]])) { n++; into.add(k.dst[e]); }
    assert.equal(u.keptEdges, k.n);
    assert.equal(u.edges, n);
    assert.equal(u.cells, into.size);
    assert.equal(u.cellsNoRunAfterTick0, brain.cells.filter((c) => !reads(c)).length);
    assert.ok(n > 0 && n < k.n, 'unread ' + n + ' of ' + k.n + ': one kind of edge only');
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

// Board 23 dead-share fix pass. The landing of a seed in place (emitTarget) once removed the seed
// before renaming the staging over it, so a rename Windows refused (EPERM, EBUSY: another process
// still holding a file just written) left no seed at all; it now moves the seed aside, lands the
// staging, and removes the old seed last, retrying the refusals Windows lifts a moment later. A prune
// of a pruned seed kept only its own round; the wire rounds a manifest lost are rebuilt from the
// censuses between them; and the whole rule (census, wire to the fixed point, prune, census) is one
// command, genome/emit.mjs --dead-share, each step its own process.
describe('dead-share fix pass', () => {
  let E, fsx, BR, v0, wired, wiredVf, v1, wiredPrunedDir;
  const posix = (p) => p.split(path.sep).join('/');
  const leftovers = (name) => readdirSync(SCRATCH).filter((x) => x.startsWith('.' + name + '.emit-'));
  const plantedSeed = (name, text) => { const d = path.join(SCRATCH, name); mkdirSync(d, { recursive: true }); writeFileSync(path.join(d, 'x.txt'), text); return d; };
  const refusal = (code) => { const e = new Error('planted ' + code); e.code = code; return e; };
  before(async () => {
    E = await import('../genome/emit.mjs');
    fsx = await import('node:fs');
    BR = path.resolve(HERE, '..');
    v0 = JSON.parse(readFileSync(verdictFile, 'utf8'));
    wired = await E.wireMain(['--wire', verdictFile, '--seed', seedDir, '--out', path.join(SCRATCH, 'ds-wired'), '--quiet']);
    const c1 = await censusSeed(wired.dir, { ticks: TICKS, knockout: false, log: quiet });
    v1 = verdictOf(c1, { ticks: TICKS, command: 'test/census.test.mjs', isTheBar: false, knockoutSeed: 'census' });
    wiredVf = path.join(SCRATCH, 'ds-wired.json');
    writeFileSync(wiredVf, JSON.stringify(v1) + '\n');
    wiredPrunedDir = (await E.pruneMain(['--prune', wiredVf, '--seed', wired.dir, '--out', path.join(SCRATCH, 'ds-wired-pruned'), '--quiet'])).dir;
  });

  test('land: the seed is never removed before the staging is in its place; the old seed is removed last', () => {
    const dir = plantedSeed('land-order', 'old');
    const ops = [];
    const name = (p) => (samePathT(p, dir) ? 'seed' : /emit-staging$/.test(p) ? 'staging' : /emit-replaced$/.test(p) ? 'replaced' : p);
    const t = E.emitTarget(dir, dir, {
      rename: (a, b) => { ops.push('rename ' + name(a) + ' -> ' + name(b)); fsx.renameSync(a, b); },
      rm: (p, o) => { ops.push('rm ' + name(p)); fsx.rmSync(p, o); },
      sleep: () => { throw new Error('nothing was refused, nothing should wait'); },
    });
    mkdirSync(t.dir, { recursive: true }); writeFileSync(path.join(t.dir, 'x.txt'), 'new');
    assert.equal(t.land(), dir);
    assert.deepEqual(ops, ['rename seed -> replaced', 'rename staging -> seed', 'rm replaced']);
    assert.equal(readFileSync(path.join(dir, 'x.txt'), 'utf8'), 'new');
    assert.deepEqual(leftovers('land-order'), []);
  });

  test('land: a rename refused for a moment (EPERM, then EBUSY) is retried after a growing wait and lands', () => {
    const dir = plantedSeed('land-transient', 'old');
    const waits = []; let refused = 0;
    const t = E.emitTarget(dir, dir, {
      rename: (a, b) => { if (/emit-staging$/.test(a) && refused < 2) { refused++; throw refusal(refused === 1 ? 'EPERM' : 'EBUSY'); } fsx.renameSync(a, b); },
      sleep: (ms) => waits.push(ms),
    });
    mkdirSync(t.dir, { recursive: true }); writeFileSync(path.join(t.dir, 'x.txt'), 'new');
    assert.equal(t.land(), dir);
    assert.equal(refused, 2);
    assert.deepEqual(waits, [20, 40]);
    assert.equal(readFileSync(path.join(dir, 'x.txt'), 'utf8'), 'new');
    assert.deepEqual(leftovers('land-transient'), []);
  });

  test('land: a rename refused every time leaves the seed as it was, with no staging and no replaced copy behind', () => {
    const dir = plantedSeed('land-refused', 'old');
    const waits = []; let tries = 0;
    const t = E.emitTarget(dir, dir, {
      rename: (a, b) => { if (/emit-staging$/.test(a)) { tries++; throw refusal('EPERM'); } fsx.renameSync(a, b); },
      sleep: (ms) => waits.push(ms),
    });
    mkdirSync(t.dir, { recursive: true }); writeFileSync(path.join(t.dir, 'x.txt'), 'new');
    assert.throws(() => t.land(), /left as it was/);
    assert.equal(tries, 12, 'the refused rename was tried ' + tries + ' times');
    assert.deepEqual(waits, [20, 40, 80, 160, 320, 640, 1000, 1000, 1000, 1000, 1000]);
    assert.equal(readFileSync(path.join(dir, 'x.txt'), 'utf8'), 'old', 'the seed was not put back');
    assert.deepEqual(leftovers('land-refused'), []);
  });

  test('land: an error that is not a moment of Windows (ENOENT) is not retried, and the seed is put back', () => {
    const dir = plantedSeed('land-enoent', 'old');
    const waits = [];
    const t = E.emitTarget(dir, dir, {
      rename: (a, b) => { if (/emit-staging$/.test(a)) throw refusal('ENOENT'); fsx.renameSync(a, b); },
      sleep: (ms) => waits.push(ms),
    });
    mkdirSync(t.dir, { recursive: true });
    assert.throws(() => t.land(), /ENOENT[^]*left as it was/);
    assert.deepEqual(waits, []);
    assert.equal(readFileSync(path.join(dir, 'x.txt'), 'utf8'), 'old');
    assert.deepEqual(leftovers('land-enoent'), []);
  });

  test('land: a seed that cannot be put back is named where it lies, never deleted', () => {
    const dir = plantedSeed('land-stranded', 'old');
    const t = E.emitTarget(dir, dir, {
      rename: (a, b) => { if (/emit-staging$/.test(a) || /emit-replaced$/.test(a)) throw refusal('EACCES'); fsx.renameSync(a, b); },
      sleep: () => {},
    });
    mkdirSync(t.dir, { recursive: true });
    assert.throws(() => t.land(), (err) => { assert.match(err.message, /intact at/); assert.ok(err.message.includes(t.replaced)); return true; });
    assert.equal(readFileSync(path.join(t.replaced, 'x.txt'), 'utf8'), 'old');
    fsx.renameSync(t.replaced, dir);
    fsx.rmSync(t.staging, { recursive: true, force: true });
  });

  test('land: what a run that died half way left (a staging, a replaced copy) is cleared before the next landing', () => {
    const dir = plantedSeed('land-debris', 'old');
    for (const x of ['.land-debris.emit-staging', '.land-debris.emit-replaced']) { mkdirSync(path.join(SCRATCH, x), { recursive: true }); writeFileSync(path.join(SCRATCH, x, 'junk.txt'), 'junk'); }
    const t = E.emitTarget(dir, dir);
    assert.deepEqual(leftovers('land-debris'), []);
    mkdirSync(t.dir, { recursive: true }); writeFileSync(path.join(t.dir, 'x.txt'), 'new');
    t.land();
    assert.deepEqual(readdirSync(dir), ['x.txt']);
    assert.equal(readFileSync(path.join(dir, 'x.txt'), 'utf8'), 'new');
  });

  test('retrying: EPERM, EACCES and EBUSY are waited out; any other code is thrown at once', () => {
    for (const code of ['EPERM', 'EACCES', 'EBUSY']) {
      let n = 0;
      assert.equal(E.retrying(() => { if (++n < 3) throw refusal(code); return 'done'; }, { sleep: () => {} }), 'done');
      assert.equal(n, 3, code);
    }
    for (const code of ['ENOENT', 'ENOTEMPTY', 'EEXIST', undefined]) {
      let n = 0;
      assert.throws(() => E.retrying(() => { n++; throw refusal(code); }, { sleep: () => {} }));
      assert.equal(n, 1, String(code));
    }
  });

  test('a prune of a pruned seed keeps the first prune in its record: both rounds, in order, the latest on top', async () => {
    const vf = path.join(SCRATCH, 'ds-pruned-census.json');
    writeFileSync(vf, JSON.stringify(verdictOf(prunedCensus, { ticks: TICKS, command: 'test/census.test.mjs', isTheBar: false, knockoutSeed: 'census' })) + '\n');
    const first = JSON.parse(readFileSync(path.join(pruneResult.dir, 'manifest.json'), 'utf8'));
    const r = await E.pruneMain(['--prune', vf, '--seed', pruneResult.dir, '--out', path.join(SCRATCH, 'ds-pruned-twice'), '--quiet']);
    assert.ok(r.ok, JSON.stringify(r.verify.errors));
    const p = JSON.parse(readFileSync(path.join(r.dir, 'manifest.json'), 'utf8')).genome.pruned;
    assert.equal(p.rounds.length, 2);
    const { rounds: r0, ...firstTop } = first.genome.pruned;
    assert.deepEqual(p.rounds[0], firstTop, 'the first prune is not the first round');
    assert.equal(p.rounds[1].fromHash, first.hash);
    const { rounds: _r, ...top } = p;
    assert.deepEqual(p.rounds[1], top, 'the latest round is not on top');
  });

  test('wire history: the round between two censuses is rebuilt with its hash link, the edges it wired, and how many of them the prune kept', async () => {
    const pruned = JSON.parse(readFileSync(path.join(wiredPrunedDir, 'manifest.json'), 'utf8')).genome.pruned;
    const rounds = E.wireHistory([{ file: posix(path.relative(BR, verdictFile)), v: v0 }, { file: posix(path.relative(BR, wiredVf)), v: v1 }], { pruned }); // wired elsewhere: the two censuses name two paths
    assert.equal(rounds.length, 1);
    const r = rounds[0];
    assert.ok(wired.counts.portsWired > 0, 'the tiny seed wired nothing: the round below would be empty');
    assert.equal(r.fromHash, v0.live.manifestHash);
    assert.equal(r.toHash, v1.live.manifestHash);
    assert.equal(r.edgesBefore, wired.counts.edgesBefore);
    assert.equal(r.edgesAfter, wired.counts.edgesAfter);
    assert.equal(r.portsWired, wired.counts.portsWired, 'the rebuilt round disagrees with the round the wire recorded');
    assert.equal(r.horizon, v0.dormant.lastTickBound);
    assert.ok(r.reconstructed && r.notRecovered.includes('portsNoDonor'));
    // the oracle: the wired edges (by endpoints and ports) that are declared in the pruned seed
    const { brain } = await loadFrom(wiredPrunedDir);
    const k = brain.connectome, have = new Set();
    for (let e = 0; e < k.n; e++) have.add(brain.cells[k.src[e]].id + '>' + brain.cells[k.dst[e]].id + ':' + k.srcPort[e] + ':' + k.dstPort[e]);
    const survived = wired.wired.filter((w) => have.has(w.src + '>' + w.dst + ':' + w.srcPort + ':' + w.dstPort)).length;
    assert.equal(r.keptByPrune.delivered + r.keptByPrune.inFlightOnly, survived);
    assert.ok(survived > 0 && survived <= r.portsWired);
    // no prune record from that census: nothing is claimed about what was kept
    assert.equal(E.wireHistory([{ file: 'a.json', v: v0 }, { file: 'b.json', v: v1 }])[0].keptByPrune, undefined);
  });

  test('wire history refuses what is not a chain, and merged into a genome it lands once, ahead of the recorded rounds', () => {
    const a = { file: 'a.json', v: v0 }, b = { file: 'b.json', v: v1 };
    assert.throws(() => E.wireHistory([a, { file: 'a2.json', v: { ...v0, at: v1.at } }]), /same seed/);
    assert.throws(() => E.wireHistory([a, { file: 'c.json', v: { ...v1, cells: { ...v1.cells, declared: v1.cells.declared + 1 } } }]), /edges only/);
    assert.throws(() => E.wireHistory([b, { file: 'a3.json', v: { ...v0, at: new Date(Date.parse(v1.at) + 1000).toISOString() } }]), /added edges/);
    assert.throws(() => E.wireHistory([{ file: 'late.json', v: { ...v0, at: new Date(Date.parse(v1.at) + 1000).toISOString() } }, b]), /not taken after/);
    assert.throws(() => E.wireHistory([a, b], { seed: 'organism/some-other-seed' }), /is a census of/);
    assert.throws(() => E.wireHistory([a]), /at least two/);
    const rebuilt = E.wireHistory([a, b]);
    const recorded = { fromHash: v1.live.manifestHash, horizon: 1, portsWired: 0, edgesBefore: v1.edges.declared, edgesAfter: v1.edges.declared };
    const g = { name: 'x', wired: { ...recorded } };
    const m1 = E.mergeWireHistory(g, rebuilt);
    assert.equal(m1.added, 1);
    assert.equal(m1.genome.wired.rounds.length, 2);
    assert.equal(m1.genome.wired.rounds[0].toHash, v1.live.manifestHash);
    assert.deepEqual(m1.genome.wired.rounds[1], recorded);
    assert.equal(m1.genome.wired.portsWired, 0, 'the top of the record is no longer the latest round');
    const m2 = E.mergeWireHistory(m1.genome, rebuilt);
    assert.equal(m2.added, 0);
    assert.deepEqual(m2.genome, m1.genome);
    assert.throws(() => E.mergeWireHistory({ wired: { fromHash: 'f'.repeat(64) } }, rebuilt), /first recorded round starts from/);
  });

  test('the dead-share chain: census, wire to the fixed point, prune, census, each a child process, every round in the manifest, and run again it changes nothing', () => {
    const dir = path.join(SCRATCH, 'census-tiny-chain'); // the depth the seed was emitted at
    cpSync(seedDir, dir, { recursive: true });
    const vdir = path.join(SCRATCH, 'chain-verdicts');
    const r = E.deadShareChain(dir, { ticks: TICKS, tag: 'chain', verdictDir: vdir });
    assert.ok(r.ok, JSON.stringify(r.checks));
    assert.equal(r.fixedPoint, true);
    const wires = r.steps.filter((s) => s.step === 'wire');
    // the child census and the child wire agree with the in-process ones on the same seed
    assert.equal(r.first.hash, v0.live.manifestHash);
    assert.equal(wires[0].portsWired, wired.counts.portsWired);
    const m = JSON.parse(readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
    assert.deepEqual(m.genome.wired.rounds.map((x) => x.portsWired), wires.filter((s) => !s.fixedPoint).map((s) => s.portsWired));
    assert.equal(m.genome.pruned.census.file, r.censusFiles[r.censusFiles.length - 2]);
    assert.equal(r.last.hash, m.hash);
    assert.ok(r.last.deadShare < r.first.deadShare, r.first.deadShare + ' -> ' + r.last.deadShare);
    assert.equal(r.last.edges.delivered, m.genome.pruned.kept.edges.delivered, 'the pruned seed does not deliver exactly what the prune kept as delivered');
    assert.ok(r.last.score >= r.first.score);
    for (const f of r.censusFiles) assert.ok(existsSync(path.resolve(BR, f)), f);
    assert.deepEqual(readdirSync(SCRATCH).filter((x) => /emit-(staging|replaced)/.test(x)), []);
    const before = readFileSync(path.join(dir, 'manifest.json'), 'utf8');
    const again = E.deadShareChain(dir, { ticks: TICKS, tag: 'chain-again', verdictDir: vdir });
    assert.equal(again.rounds, 0);
    assert.ok(again.steps.some((s) => s.step === 'prune' && s.skipped), JSON.stringify(again.steps.map((s) => s.step)));
    assert.equal(readFileSync(path.join(dir, 'manifest.json'), 'utf8'), before, 'a second run rewrote a seed at its fixed point');
    assert.equal(again.first.hash, r.last.hash);
  });

  test('rebuilt wire history of rounds the manifest already records adds nothing, and the fixed point in place is left as it is', async () => {
    const dir = path.join(SCRATCH, 'census-tiny-chain');
    const files = readdirSync(path.join(SCRATCH, 'chain-verdicts')).filter((x) => /-chain-c\d+-partial\.json$/.test(x)).sort((a, b) => Number(a.match(/-c(\d+)-/)[1]) - Number(b.match(/-c(\d+)-/)[1]));
    assert.ok(files.length >= 3, files.join(', '));
    const abs = files.map((x) => path.join(SCRATCH, 'chain-verdicts', x));
    const before = readFileSync(path.join(dir, 'manifest.json'), 'utf8');
    // the censuses before and after the chain's first wire round: that round is in the record already
    const r = await E.wireMain(['--wire', abs[abs.length - 1], '--seed', dir, '--out', dir, '--wire-history', abs[0] + ',' + abs[1], '--quiet']);
    assert.equal(r.ok, true);
    assert.equal(r.unchanged, true, 'history the manifest holds already rewrote the seed');
    assert.equal(readFileSync(path.join(dir, 'manifest.json'), 'utf8'), before);
  });

  test('the dead-share chain is a function of the seed: two copies land the same organism', () => {
    const vdir = path.join(SCRATCH, 'chain-verdicts-twin');
    const hashes = [];
    for (const n of ['census-tiny-twin-a', 'census-tiny-twin-b']) {
      const dir = path.join(SCRATCH, n);
      cpSync(seedDir, dir, { recursive: true });
      const r = E.deadShareChain(dir, { ticks: TICKS, tag: 'twin', verdictDir: vdir });
      assert.ok(r.ok, JSON.stringify(r.checks));
      hashes.push(r.last.hash);
    }
    assert.equal(hashes[0], hashes[1]);
    assert.notEqual(hashes[0], v0.live.manifestHash, 'the chain changed nothing, so the equality above says nothing');
  });

  test('wire history claims what the prune kept only from the prune of that census of that seed', async () => {
    const pruned = JSON.parse(readFileSync(path.join(wiredPrunedDir, 'manifest.json'), 'utf8')).genome.pruned;
    const a = { file: posix(path.relative(BR, verdictFile)), v: v0 }, b = { file: posix(path.relative(BR, wiredVf)), v: v1 };
    assert.ok(E.wireHistory([a, b], { pruned })[0].keptByPrune, 'the control: the prune of that census is read');
    assert.equal(E.wireHistory([a, { ...b, file: b.file + '.other.json' }], { pruned })[0].keptByPrune, undefined, 'a prune by another census was read as this one');
    assert.equal(E.wireHistory([a, b], { pruned: { ...pruned, fromHash: 'f'.repeat(64) } })[0].keptByPrune, undefined, 'a prune of another seed was read as this one');
  });

  test('the chain given wire history a manifest lost writes it back at the fixed point, the seed unchanged, and only once', async () => {
    // the seed the censuses below measured, at the path they name (the history names its seed); the
    // last test of the file, so no test after it reads this seed
    const dir = path.join(SCRATCH, 'census-tiny-chain');
    const vdir = path.join(SCRATCH, 'chain-verdicts');
    const nth = (x) => Number(x.match(/-chain-c(\d+)-partial\.json$/)[1]);
    const files = readdirSync(vdir).filter((x) => /-chain-c\d+-partial\.json$/.test(x)).sort((x, y) => nth(x) - nth(y));
    assert.ok(files.length >= 3, files.join(', '));
    const rel = files.map((x) => posix(path.relative(BR, path.join(vdir, x))));
    const c = rel.map((f) => JSON.parse(readFileSync(path.resolve(BR, f), 'utf8')));
    const mf = path.join(dir, 'manifest.json');
    const { brain, manifest: m0 } = await loadFrom(dir);
    const first = m0.genome.wired.rounds[0];
    assert.equal(first.fromHash, c[0].live.manifestHash);
    assert.equal(first.toHash === undefined || first.toHash === c[1].live.manifestHash, true);
    // the record as the wire wrote it before it appended: only the round that wired nothing over the
    // seed the prune read (the census of it is c[1]); the round that wired is lost. The seed is emitted
    // again under that record (the record lives in the emitted meta the loader reads, not only in
    // manifest.json), the same cells and edges
    const g = JSON.parse(JSON.stringify(m0.genome));
    g.wired = { from: first.from, fromHash: c[1].live.manifestHash, horizon: first.horizon, cells: first.cells, portsWired: 0, edgesBefore: c[1].edges.declared, edgesAfter: c[1].edges.declared, census: { file: rel[1], at: c[1].at, ticks: c[1].ticks } };
    brain.genome = g;
    assert.equal(emitOrganism(brain, { dir }).hash, m0.hash, 'the seed emitted again under the lost record is not the same seed');
    assert.equal(m0.genome.pruned.census.file, rel[1], 'the prune did not read the census after the wire round');
    const r = E.deadShareChain(dir, { ticks: TICKS, tag: 'lost', verdictDir: path.join(SCRATCH, 'lost-verdicts'), wireHistory: [rel[0], rel[1]] });
    assert.ok(r.ok, JSON.stringify(r.checks));
    assert.equal(r.rounds, 0);
    assert.ok(r.steps.some((s) => s.step === 'prune' && s.skipped));
    const m1 = JSON.parse(readFileSync(mf, 'utf8'));
    assert.equal(m1.hash, m0.hash, 'writing history changed the cells or edges');
    const rounds = m1.genome.wired.rounds;
    assert.equal(rounds.length, 3, JSON.stringify(rounds.map((x) => [x.fromHash.slice(0, 8), x.portsWired])));
    assert.ok(rounds[0].reconstructed);
    assert.equal(rounds[0].fromHash, c[0].live.manifestHash);
    assert.equal(rounds[0].toHash, c[1].live.manifestHash);
    assert.equal(rounds[0].portsWired, first.portsWired, 'the rebuilt round disagrees with the round the chain recorded');
    assert.ok(rounds[0].keptByPrune && rounds[0].keptByPrune.delivered + rounds[0].keptByPrune.inFlightOnly <= rounds[0].portsWired);
    assert.equal(rounds[1].fromHash, c[1].live.manifestHash);
    assert.equal(rounds[2].fromHash, m1.hash);
    assert.equal(rounds[2].portsWired, 0);
    const after = readFileSync(mf, 'utf8');
    const again = E.deadShareChain(dir, { ticks: TICKS, tag: 'lost-again', verdictDir: path.join(SCRATCH, 'lost-verdicts'), wireHistory: [rel[0], rel[1]] });
    assert.ok(again.ok, JSON.stringify(again.checks));
    assert.equal(readFileSync(mf, 'utf8'), after, 'history the manifest holds already was written again');
    // the same, in this process (the chain runs the wire as a child): the lost record emitted again,
    // then one wire in place by the chain's census of this seed, given the history, writes it back
    const again2 = await loadFrom(dir);
    again2.brain.genome = g;
    assert.equal(emitOrganism(again2.brain, { dir }).hash, m0.hash);
    assert.equal(JSON.parse(readFileSync(mf, 'utf8')).genome.wired.rounds, undefined, 'the lost record was not emitted again');
    const w = await E.wireMain(['--wire', path.resolve(BR, r.censusFiles[0]), '--seed', dir, '--out', dir, '--wire-history', rel[0] + ',' + rel[1], '--quiet']);
    assert.equal(w.ok, true);
    assert.notEqual(w.unchanged, true, 'history added at the fixed point was not written');
    const m2 = JSON.parse(readFileSync(mf, 'utf8'));
    assert.equal(m2.hash, m0.hash);
    assert.deepEqual(m2.genome.wired.rounds.map((x) => [x.fromHash, x.portsWired, !!x.reconstructed]), rounds.map((x) => [x.fromHash, x.portsWired, !!x.reconstructed]));
  });
});
const samePathT = (a, b) => (process.platform === 'win32' ? path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase() : path.resolve(a) === path.resolve(b));

describe('dead-share bar: the pre-registered held-out judgement (test/dead-share-bar.mjs judgeHeldOut)', () => {
  let judge;
  before(async () => { ({ judgeHeldOut: judge } = await import('./dead-share-bar.mjs')); });
  const row = (o = {}) => ({ hash: 'h', deadShare: 0.5, lines: 100, loadBearing: 50, score: 0.2, algebra: 3, sequence: 1, edges: { declared: 10 }, cells: { declared: 5 }, ...o });
  const chain = (o = {}) => ({ first: row(), last: row({ hash: 'z', deadShare: 0, lines: 60, loadBearing: 60 }), rounds: 1, checks: { fixedPoint: true, deadShareDidNotRise: true, hostedScoreDidNotFall: true, algebraDidNotFall: true, sequenceDidNotFall: true }, ...o });
  const copy = (run, o = {}) => ({ run, sourceHash: 'h', copyHash: 'h', chain: chain(), ...o });
  const bar = { lines: { loaded: 100, loadBearing: 50 } };
  test('the control: two faithful copies, a chain that met its checks and landed the same organism twice, is safe', () => {
    const j = judge({ seed: 's', bar, copies: [copy('a'), copy('b')] });
    assert.equal(j.safe, true, j.why.join('; '));
    assert.deepEqual([j.before, j.after, j.lowered, j.underCap, j.zero, j.deterministic], [0.5, 0, true, true, true, true]);
  });
  test('a copy that is not the seed, a first census that reads other lines, a failed check, two different organisms, a chain that did not run: each is not safe', () => {
    const cases = [
      [copy('a', { copyHash: 'other' }), copy('b'), /is not the seed/],
      [copy('a', { chain: chain({ first: row({ loadBearing: 49 }) }) }), copy('b'), /the bar read/],
      [copy('a', { chain: chain({ checks: { ...chain().checks, hostedScoreDidNotFall: false } }) }), copy('b'), /hostedScoreDidNotFall false/],
      [copy('a'), copy('b', { chain: chain({ last: row({ hash: 'y', deadShare: 0, lines: 60, loadBearing: 60 }) }) }), /different organisms/],
      [copy('a'), copy('b', { chain: undefined, error: 'boom' }), /did not run: boom/],
    ];
    for (const [a, b, re] of cases) {
      const j = judge({ seed: 's', bar, copies: [a, b] });
      assert.equal(j.safe, false, String(re));
      assert.match(j.why.join('; '), re);
    }
  });
  test('under the cap and at 0 are reported apart from safe: a chain that lowered dead share to 0.2 is safe, not under the cap 0.1', () => {
    const c = chain({ last: row({ hash: 'z', deadShare: 0.2, lines: 60, loadBearing: 48 }) });
    const j = judge({ seed: 's', bar, copies: [copy('a', { chain: c }), copy('b', { chain: c })] });
    assert.deepEqual([j.safe, j.lowered, j.underCap, j.zero], [true, true, false, false]);
  });
});

// Board 27 dead-share-all: the horizon step withholds, from the census the prune reads, the edges in
// flight at its end and the cells the hosted problems chose that never ran; the step lands only when
// nothing measured inside the census moved, the roles each suite found no cell for included.
describe('dead-share-all: the horizon step', () => {
  let E, v0;
  before(async () => {
    E = await import('../genome/emit.mjs');
    v0 = JSON.parse(readFileSync(verdictFile, 'utf8'));
  });

  test('seedCellIds reads the cells of a seed from its files in load order', async () => {
    const ids = E.seedCellIds(seedDir);
    const { brain } = await loadFrom(seedDir);
    assert.equal(ids.length, brain.cells.length);
    assert.deepEqual(ids, brain.cells.map((c) => c.id));
  });

  test('hostedNeverRan names a chosen cell only when its run bit is clear, and withheldAtHorizon drops it and the in flight set', () => {
    const ids = E.seedCellIds(seedDir);
    const hosted = [...v0.tasks.algebra.cells, ...v0.tasks.sequence.cells];
    assert.ok(hosted.length > 0, 'the tiny census hosted no problem');
    // the census as written: every chosen cell ran (the hosted problems inject into it)
    assert.deepEqual(E.hostedNeverRan(v0, ids), []);
    // plant: clear the run bit of the first chosen cell
    const idx = ids.indexOf(hosted[0]);
    const cells = readLiveBits(v0.live.cells);
    const planted = { ...v0, live: { ...v0.live, cells: liveBits(cells.n, (i) => i !== idx && cells.has(i)) } };
    assert.deepEqual(E.hostedNeverRan(planted, ids), [hosted[0]]);
    const d = E.withheldAtHorizon(planted, 'x.json', [hosted[0]]);
    assert.equal(d.isTheBar, false);
    assert.equal(d.live.inFlight, undefined);
    assert.equal(d.live.cells, planted.live.cells);
    assert.ok(!d.tasks.algebra.cells.includes(hosted[0]) && !d.tasks.sequence.cells.includes(hosted[0]));
    assert.equal(d.tasks.algebra.cells.length + d.tasks.sequence.cells.length, hosted.filter((x) => x !== hosted[0]).length);
    assert.deepEqual(d.derived.withheld, { inFlight: v0.live.inFlight.count, of: v0.live.inFlight.n, hostedNeverRan: [hosted[0]] });
    // nothing to withhold: the census as written with only its in flight set taken out
    const same = E.withheldAtHorizon(v0, 'x.json');
    assert.deepEqual(same.tasks, v0.tasks);
    // a census that names a cell the seed does not declare is refused
    assert.throws(() => E.hostedNeverRan({ ...v0, tasks: { algebra: { cells: ['no.such.cell'] } } }, ids), /does not declare/);
    assert.throws(() => E.hostedNeverRan(v0, ids.slice(1)), /covers/);
  });

  test('horizonMoved names every number inside the census that moved, the roles with no cell included', () => {
    assert.deepEqual(E.horizonMoved(v0, v0), []);
    const names = E.horizonWork(v0).map(([n]) => n);
    for (const n of ['drive delivered', 'run signals', 'cells ran', 'edges delivered', 'mail dropped', 'hosted score', 'algebra roles with no cell', 'sequence roles with no cell']) assert.ok(names.includes(n), n);
    const lostRole = { ...v0, tasks: { ...v0.tasks, algebra: { ...v0.tasks.algebra, missingRoles: [...v0.tasks.algebra.missingRoles, 'planted'] } } };
    const moved = E.horizonMoved(v0, lostRole);
    assert.equal(moved.length, 1, moved.join('; '));
    assert.match(moved[0], /^algebra roles with no cell /);
    const fewer = { ...v0, cells: { ...v0.cells, ran: v0.cells.ran - 1 } };
    assert.deepEqual(E.horizonMoved(v0, fewer).map((x) => x.split(' ').slice(0, 2).join(' ')), ['cells ran']);
    // a number missing on either side is moved, never equal
    assert.ok(E.horizonMoved(v0, { ...v0, dormant: undefined }).some((x) => x.startsWith('mail dropped')));
  });
});
