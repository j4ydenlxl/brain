// test/dead-share-all.test.mjs: EVERY COUNTED SEED AT DEAD SHARE 0 (Board 27, item dead-share-all; MANUAL P8,
// his order "make sure the 5 million organism lines u wrote arent empty code").
// Author: Board 27 builder, item dead-share-all, 2026-09-27. MODEL OFF: no provider, no socket.
//
//   the verdict   bench/verdicts/dead-share-all.json holds every seed the bar census counted, before
//                 and after are numbers on every row, after is at most before, the before totals are
//                 the before file's own rows, and the skipped list names the four seeds it skips
//   the horizon   a planted small seed with one edge whose signal cannot arrive inside the census (its
//                 delay is past the census's last tick): the chain lands it at dead share 0 through the
//                 horizon step with nothing inside the census moved; the control, the same seed with
//                 the step off, stays above 0 with that edge still in flight
//   the emitter   generations/epochs.mjs emitElite calls the landing once per seed it writes, and the
//                 seed on disk reads dead share 0 in a census of its own; the control, the same search
//                 with the landing off, emits a seed above 0
//   --all         the chain over a root skips dot directories, seeds named in --skip and seeds over
//                 --max-cells, and a root with nothing to chain is not OK
//
// Scratch lives in test/.dead-share-all-scratch/<pid> and is removed when the file finishes.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync, readdirSync, cpSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '../cells/all.mjs';
import { buildOrganism } from '../seeds/organism.mjs';
import { emitOrganism, deadShareChain, deadShareAll, readLiveBits } from '../genome/emit.mjs';
import { loadFrom } from '../genome/load.mjs';
import { censusSeed } from '../tools/organism-census.mjs';
import { Epochs } from '../generations/epochs.mjs';
import { totalsOf } from '../bench/dead-share-all.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BR = path.resolve(HERE, '..');
const SCRATCH = path.join(HERE, '.dead-share-all-scratch', String(process.pid));
const TICKS = 40;
const quiet = () => {};
const share = (l) => Math.round((1 - l.loadBearing / l.loaded) * 1e6) / 1e6;

before(() => { mkdirSync(SCRATCH, { recursive: true }); });
after(() => {
  if (existsSync(SCRATCH)) rmSync(SCRATCH, { recursive: true, force: true });
  const parent = path.dirname(SCRATCH);
  if (existsSync(parent) && readdirSync(parent).length === 0) rmSync(parent, { recursive: true, force: true });
});

describe('the verdict (bench/verdicts/dead-share-all.json)', () => {
  const vf = path.join(BR, 'bench', 'verdicts', 'dead-share-all.json');
  const af = path.join(BR, 'bench', 'verdicts', 'census-all.json');
  const bf = path.join(BR, 'bench', 'verdicts', 'dead-share-all', 'census-all-before.json');

  test('every seed the bar census counted is in the table, and only those', () => {
    const v = JSON.parse(readFileSync(vf, 'utf8')), a = JSON.parse(readFileSync(af, 'utf8'));
    const counted = a.seeds.filter((x) => !x.skipped).map((x) => x.seed).sort();
    assert.ok(counted.length > 0, 'the bar census counted no seed');
    assert.deepEqual(v.table.map((r) => r.seed).sort(), counted);
    assert.equal(v.isTheBar, true);
    assert.equal(typeof v.barMet, 'boolean');
  });

  test('before and after are numbers on every row, after is at most before, and the before is the before file', () => {
    const v = JSON.parse(readFileSync(vf, 'utf8')), b = JSON.parse(readFileSync(bf, 'utf8'));
    const rows = new Map(b.seeds.map((x) => [x.seed, x]));
    const num = (x) => typeof x === 'number' && Number.isFinite(x);
    for (const r of v.table) {
      for (const k of ['lines', 'loadBearing', 'deadShare']) assert.ok(num(r[k].before) && num(r[k].after), r.seed + ' ' + k + ' ' + JSON.stringify(r[k]));
      assert.ok(r.deadShare.after <= r.deadShare.before, r.seed + ' rose: ' + r.deadShare.before + ' -> ' + r.deadShare.after);
      const x = rows.get(r.seed);
      assert.ok(x && !x.skipped, r.seed + ' is not a counted row of the before file');
      assert.equal(r.lines.before, x.lines.loaded, r.seed);
      assert.equal(r.loadBearing.before, x.lines.loadBearing, r.seed);
      assert.equal(r.deadShare.before, share(x.lines), r.seed);
    }
    // the before totals are summed from the before file's own rows, never typed
    assert.deepEqual(v.totals.before, totalsOf(b));
    assert.equal(v.control.before.at, b.at);
    assert.equal(v.control.before.statement, b.statement);
    assert.ok(v.totals.before.lines.loadBearing < v.totals.before.lines.loaded, 'the before census had no dead line: nothing was measured');
  });

  test('the skipped list names the four seeds, each with why', () => {
    const v = JSON.parse(readFileSync(vf, 'utf8'));
    const names = v.skipped.map((s) => s.seed).sort();
    assert.deepEqual(names, ['organism/gen-0', 'organism/gen-0-pruned', 'organism/scale-52000', 'organism/scale-52000-pruned']);
    for (const s of v.skipped) assert.ok(typeof s.why === 'string' && s.why.length > 0 && Number.isInteger(s.cells) && s.cells > 1000, JSON.stringify(s));
    for (const s of v.skipped.filter((x) => /gen-0/.test(x.seed))) assert.match(s.why, /15 minutes|not measured/, s.seed);
  });
});

describe('the horizon step on a planted seed', () => {
  let planted, edge;
  before(async () => {
    // the tiny organism census.test.mjs chains to 0 with nothing in flight; plant one edge that
    // delivered in its census and give it a delay past the census's last tick
    const brain = buildOrganism({ majors: 48, subcellsPerMajor: 6, edgesPerCell: 6, seed: 'census-test', name: 'planted' });
    const src = path.join(SCRATCH, 'planted-src');
    emitOrganism(brain, { dir: src, split: 200 });
    const c = await censusSeed(src, { ticks: TICKS, knockout: false, log: quiet });
    const { brain: b } = await loadFrom(src);
    const live = readLiveBits(c.live.edges);
    const k = b.connectome;
    // an edge that delivered into a cell another delivered edge also feeds, so the cell still runs and
    // only the edge is left dead (a cell fed by nothing else would be pruned with it, no horizon needed)
    const fedBy = (x, not) => { for (let e = 0; e < k.n; e++) if (e !== not && live.has(e) && k.dst[e] === x) return true; return false; };
    for (let e = k.n - 1; e >= 0 && edge === undefined; e--) if (live.has(e) && fedBy(k.dst[e], e)) edge = e;
    assert.ok(edge !== undefined, 'no edge delivered in the census of the tiny seed');
    k.delay[edge] = 60000;
    planted = path.join(SCRATCH, 'planted');
    emitOrganism(b, { dir: planted, split: 200 });
    const p = await censusSeed(planted, { ticks: TICKS, knockout: false, log: quiet });
    assert.ok(readLiveBits(p.live.inFlight).has(edge), 'the planted edge is not in flight at the end of its census');
    assert.ok(readLiveBits(p.live.cells).has(k.dst[edge]), 'the cell of the planted edge no longer runs');
    assert.ok(p.lines.loadBearing < p.lines.loaded);
  });

  test('the chain lands it at dead share 0 through the horizon step, nothing inside the census moved', () => {
    const dir = path.join(SCRATCH, 'planted-on');
    cpSync(planted, dir, { recursive: true }); // the depth the seed was emitted at
    const r = deadShareChain(dir, { ticks: TICKS, tag: 'hz', verdictDir: path.join(SCRATCH, 'v-on') });
    assert.ok(r.ok, JSON.stringify(r.checks));
    assert.equal(r.last.deadShare, 0);
    assert.ok(r.horizon.landed >= 1 && r.horizon.withheld >= 1, JSON.stringify(r.horizon));
    assert.equal(r.horizon.reverted, 0);
    assert.equal(r.checks.horizonChangedNothingInside, true);
    assert.ok(r.derivedFiles.length >= 1);
    const d = JSON.parse(readFileSync(path.resolve(BR, r.derivedFiles[0]), 'utf8'));
    assert.equal(d.isTheBar, false);
    assert.equal(d.live.inFlight, undefined, 'the derived census still carries its in flight set');
    assert.ok(d.derived.withheld.inFlight >= 1);
    assert.ok(r.last.score >= r.first.score, r.first.score + " -> " + r.last.score); // the wire may raise it; the step itself moved nothing (above)
    const m = JSON.parse(readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
    assert.equal(r.last.hash, m.hash);
  });

  test('the control: the same planted seed with the horizon step off stays above 0, the edge still in flight', () => {
    const dir = path.join(SCRATCH, 'planted-off');
    cpSync(planted, dir, { recursive: true }); // the depth the seed was emitted at
    const r = deadShareChain(dir, { ticks: TICKS, tag: 'hzoff', verdictDir: path.join(SCRATCH, 'v-off'), horizon: false });
    assert.ok(r.last.deadShare > 0, 'without the step the planted seed reached ' + r.last.deadShare + ': the step was not what landed it');
    assert.equal(r.horizon.ran, 0);
    const v = JSON.parse(readFileSync(path.resolve(BR, r.censusFiles[r.censusFiles.length - 1]), 'utf8'));
    assert.ok(v.live.inFlight.count >= 1, 'no edge in flight at the end of the last census');
  });
});

describe('the emitter lands every seed it writes (generations/epochs.mjs emitElite)', () => {
  const scale = { majors: [14, 20], subcellsPerMajor: [2, 3], edgesPerCell: [3, 6], localWindow: [1, 3] };
  const opts = (tag) => ({ seed: 'emit', popSize: 3, ticks: 40, windows: 2, checkpointEvery: 0, dir: path.join(SCRATCH, 'gen-' + tag), emit: true, emitLimit: 2, emitDir: path.join(SCRATCH, 'emit-' + tag), suites: false, scale });

  test('once per emit, and the seed on disk reads dead share 0 in its own census', async () => {
    const calls = [];
    const e = new Epochs({
      ...opts('on'), deadShareDir: path.join(SCRATCH, 'v-epochs'),
      deadShare: (dir, o) => { calls.push({ dir, o }); return deadShareChain(dir, o); },
    }).init();
    e.step();
    assert.ok(e.emissions.length >= 1, 'nothing was emitted');
    assert.equal(calls.length, e.emissions.length, 'the landing ran ' + calls.length + ' times for ' + e.emissions.length + ' emissions');
    assert.equal(e.landings, e.emissions.length);
    assert.equal(new Set(calls.map((c) => c.dir)).size, calls.length, 'a seed was landed twice');
    for (const rec of e.emissions) {
      const dir = path.join(BR, rec.dir);
      assert.ok(calls.some((c) => path.resolve(c.dir) === path.resolve(dir)), rec.dir + ' was emitted and not landed');
      assert.equal(calls.find((c) => path.resolve(c.dir) === path.resolve(dir)).o.ticks, 200);
      assert.ok(rec.deadShare && rec.deadShare.ok, JSON.stringify(rec.deadShare));
      assert.ok(rec.deadShare.deadShare.before > 0, 'the emitted seed was at 0 before the landing: nothing was measured');
      assert.equal(rec.deadShare.deadShare.after, 0);
      const m = JSON.parse(readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
      assert.equal(rec.hash, m.hash, 'the record is not the landed seed');
      let onDisk = 0;
      for (const f of readdirSync(dir)) onDisk += readFileSync(path.join(dir, f), 'utf8').split('\n').length;
      assert.equal(rec.lines, onDisk);
      // a census of its own, in this process, not the chain's
      const c = await censusSeed(dir, { ticks: 200, knockout: false, log: quiet });
      assert.equal(c.lines.loadBearing, c.lines.loaded, rec.dir + ': ' + c.lines.loadBearing + ' of ' + c.lines.loaded + ' lines load bearing');
    }
  });

  test('the control: the same search with the landing off emits a seed above 0, and a custom emit dir is off by default', async () => {
    const e = new Epochs({ ...opts('off') }).init();
    assert.equal(e.deadShare, false, 'a custom emit dir lands by default');
    e.step();
    assert.ok(e.emissions.length >= 1);
    assert.equal(e.landings, 0);
    const rec = e.emissions[0];
    assert.equal(rec.deadShare, undefined);
    const c = await censusSeed(path.join(BR, rec.dir), { ticks: 200, knockout: false, log: quiet });
    assert.ok(c.lines.loadBearing < c.lines.loaded, 'the unlanded seed is already at 0: the landing was not what took it there');
    assert.equal(new Epochs({ checkpointEvery: 0, dir: path.join(SCRATCH, 'gen-default') }).deadShare, true, 'the tree\'s organism/ is not landed by default');
  });
});

describe('the chain over a root (deadShareAll)', () => {
  test('skips dot directories, seeds named in --skip and seeds over --max-cells; nothing chained is not OK', () => {
    const root = path.join(SCRATCH, 'root');
    const fake = (name, cells) => {
      const d = path.join(root, name);
      mkdirSync(d, { recursive: true });
      writeFileSync(path.join(d, 'index.mjs'), '// not loaded\n');
      writeFileSync(path.join(d, 'manifest.json'), JSON.stringify({ counts: { cells } }) + '\n');
    };
    fake('.hidden', 10); fake('big', 5000); fake('named', 10);
    mkdirSync(path.join(root, 'no-index'), { recursive: true });
    const r = deadShareAll({ root, maxCells: 1000, skip: ['named'], ticks: TICKS, verdictDir: path.join(SCRATCH, 'v-all') });
    assert.deepEqual(r.rows, []);
    assert.deepEqual(r.skipped.map((s) => s.seed.split('/').pop()).sort(), ['big', 'named']);
    assert.match(r.skipped.find((s) => s.seed.endsWith('big')).why, /cells 5000 over --max-cells 1000/);
    assert.equal(r.ok, false, 'a root with nothing chained reported OK');
  });
});
