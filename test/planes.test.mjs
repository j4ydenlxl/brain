// test/planes.test.mjs: a plane coordinate is reproducible, distinct coordinates are
// distinct, and the sweep bench reports the planes it actually ran.
//   (a) the same coordinate, built twice, descriptors to the same id and text
//   (b) a descriptor is a fingerprint of the COORDINATE, not of key insertion order
//   (c) two different coordinates give two different descriptors, and a sweep of 64 planes
//       gives 64 of them (the control: the descriptor is not a constant dressed up)
//   (d) one coordinate changed on one axis moves the descriptor, axis by axis
//   (e) a bad coordinate is refused by name rather than run
//   (f) running the same plane twice reruns the deterministic quantities EXACTLY, cell by
//       cell, and the whole of the difference in the scalar fitness is the throughput weight
//       times the throughput difference: an identity, not a band somebody chose
//   (g) importing generations/planes.mjs runs no plane and writes nothing
//   (h) the bench on 4 planes with 2 workers writes a verdict whose plane count is 4
//   (i) no em dashes in the two new files
//   (j) a child of the sweep does not grow across planes: what it still holds after the last
//       plane is what it held after the first, against the control of the same child running
//       the plane runner this one replaced, which is a synchronous plane with no collection
//       point at all
//   (k) one plane against a heap small enough to fill during it: the fix falls back 0 times
//       where the runner it replaced falls back on most of its attempts
//   (l) the same plane yielding and not yielding is the same search: same generations, same
//       organisms, the same grid cell for cell, and the same score to the same identity
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  planeCoordinate, planeDescriptor, planeSweep, runPlane, runPlaneAsync, validatePlaneCoordinate,
  plannedYears, SECONDS_PER_TICK_LADDER, SECONDS_PER_YEAR, gridCapacity,
} from '../generations/planes.mjs';
import { OBJECTIVE_WEIGHTS } from '../generations/organism-genome.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BENCH = path.join(ROOT, 'bench', 'planes.mjs');

// WHAT A RERUN MAY MOVE, AND WHAT IT MAY NOT. Three of the five objective components are pure
// functions of the genome and the evaluation seed and may not move by one bit: prediction,
// task and cost. THROUGHPUT is cell runs per WALL second, so a machine that got busy moves it.
// NOVELTY moves too, and it took a red test to find out why: novelty is the distance from a
// candidate's behaviour to the elites the archive held when the generation began, and which
// organism holds a cell is decided by a fitness that carries the throughput term, so a flip
// inside generation 1 travels into every novelty read in generation 2. Measured on plane 2 at
// 400 ticks: cell 2-4-1-4 read novelty 0.46159629149296 on one run and 0.45194341828297546 on
// the next while prediction, task and cost were identical to the last bit.
//
// So a rerun is graded as an identity rather than as a band somebody chose: exactly two terms
// may move, and the whole of the move in the scalar must be their two weights times their two
// moves. 2e-6 is the arithmetic of the comparison, not a tolerance for the search: fitness is
// stored rounded to six decimals, so two of them can differ by 1e-6 each.
const SCALAR_ROUNDING = 2e-6;
const WALL_CLOCK_TERMS = ['throughput', 'novelty'];
const PURE_TERMS = ['prediction', 'task', 'cost'];
const explainedGap = (e, f) => WALL_CLOCK_TERMS.reduce((a, k) => a + OBJECTIVE_WEIGHTS[k] * (e.components[k] - f.components[k]), 0);
function gradeSameSearch(a, b, label) {
  for (const k of ['generations', 'organisms', 'ticks', 'simulatedYears', 'archiveFillAfter', 'descriptor']) {
    assert.equal(a[k], b[k], label + ': ' + k + ' must rerun identically');
  }
  const bByKey = new Map(b.elites.map((e) => [e.key, e]));
  assert.deepEqual(a.elites.map((e) => e.key).sort(), b.elites.map((e) => e.key).sort(), label + ': the grid must hold the same cells');
  let worstGap = 0, worstResidual = 0, moved = 0;
  for (const e of a.elites) {
    const f = bByKey.get(e.key);
    assert.equal(e.id, f.id, label + ': cell ' + e.key + ' must be held by the same organism');
    assert.equal(e.gen, f.gen, label + ': cell ' + e.key + ' must be taken in the same generation');
    for (const k of PURE_TERMS) {
      assert.equal(e.components[k], f.components[k], label + ': cell ' + e.key + ' component ' + k + ' is a pure function of the genome and the seed and must be identical');
    }
    if (e.components.novelty !== f.components.novelty) moved++;
    const gap = e.fitness - f.fitness;
    const explained = explainedGap(e, f);
    worstGap = Math.max(worstGap, Math.abs(gap));
    worstResidual = Math.max(worstResidual, Math.abs(gap - explained));
    assert.ok(Math.abs(gap - explained) <= SCALAR_ROUNDING,
      label + ': cell ' + e.key + ' moved ' + gap.toFixed(9) + ' and its throughput and novelty explain only ' + explained.toFixed(9));
  }
  return { worstGap, worstResidual, cells: a.elites.length, noveltyMoved: moved };
}

test('(a) the same coordinate descriptors to the same id', () => {
  for (const i of [0, 1, 7, 42, 199]) {
    const a = planeDescriptor(planeCoordinate(i));
    const b = planeDescriptor(planeCoordinate(i));
    assert.equal(a.id, b.id, 'plane ' + i + ' must rerun to the same descriptor id');
    assert.equal(a.text, b.text, 'plane ' + i + ' must rerun to the same descriptor text');
    assert.equal(a.hash, b.hash);
  }
});

test('(b) the descriptor ignores key insertion order', () => {
  const c = planeCoordinate(3);
  // The same fields, written in the reverse order. A descriptor built by JSON.stringify
  // alone would differ here, and two processes that built the same plane by different code
  // paths would then disagree about whether it was the same plane.
  const shuffled = {
    epochScale: { ...c.epochScale }, secondsPerTick: c.secondsPerTick,
    world: { ...c.world }, seed: c.seed, index: c.index,
  };
  assert.equal(planeDescriptor(shuffled).id, planeDescriptor(c).id);
});

test('(c) different coordinates give different descriptors', () => {
  assert.notEqual(planeDescriptor(planeCoordinate(0)).id, planeDescriptor(planeCoordinate(1)).id);
  const sweep = planeSweep(64);
  const ids = new Set(sweep.map((c) => planeDescriptor(c).id));
  assert.equal(ids.size, 64, '64 planes must give 64 distinct descriptors');
  // The control for (a): a descriptor that never changed would also pass (a), so the same
  //64 planes drawn from a DIFFERENT sweep base must give a disjoint set of ids.
  const other = new Set(planeSweep(64, { base: 'planes-b' }).map((c) => planeDescriptor(c).id));
  for (const id of ids) assert.ok(!other.has(id), 'sweep bases must not collide on ' + id);
});

test('(d) each axis of the coordinate moves the descriptor', () => {
  const c = planeCoordinate(11);
  const base = planeDescriptor(c).id;
  const spt = SECONDS_PER_TICK_LADDER.find((v) => v !== c.secondsPerTick);
  assert.notEqual(planeDescriptor({ ...c, seed: c.seed + 'x' }).id, base, 'seed must move it');
  assert.notEqual(planeDescriptor({ ...c, secondsPerTick: spt }).id, base, 'secondsPerTick must move it');
  assert.notEqual(planeDescriptor({ ...c, world: { ...c.world, name: String(c.world.name) + 'x' } }).id, base, 'world must move it');
  assert.notEqual(planeDescriptor({ ...c, epochScale: { ...c.epochScale, popSize: c.epochScale.popSize + 1 } }).id, base, 'epochScale must move it');
  // The index is deliberately NOT part of the descriptor: the same point reached from two
  // sweeps is the same point.
  assert.equal(planeDescriptor({ ...c, index: c.index + 1000 }).id, base, 'index must not move it');
});

test('(e) a bad coordinate is refused by name', () => {
  assert.deepEqual(validatePlaneCoordinate(planeCoordinate(5)), [], 'a drawn coordinate is valid');
  const c = planeCoordinate(5);
  assert.ok(validatePlaneCoordinate({ ...c, secondsPerTick: 0 }).some((s) => s.includes('secondsPerTick')));
  assert.ok(validatePlaneCoordinate({ ...c, world: { kind: 'nowhere' } }).some((s) => s.includes('world.kind')));
  assert.ok(validatePlaneCoordinate({ ...c, epochScale: { ...c.epochScale, majors: [9, 2] } }).some((s) => s.includes('majors')));
  assert.throws(() => runPlane({ ...c, secondsPerTick: -1 }, { ticks: 10 }), /secondsPerTick/);
});

test('(f) the same plane reruns to the same deep time numbers', () => {
  const c = planeCoordinate(2);
  const a = runPlane(c, { ticks: 400, elites: true });
  const b = runPlane(c, { ticks: 400, elites: true });
  assert.equal(a.ok, true, a.error || '');
  // A BAND WAS THE WRONG RULER. This assertion used to be that the best fitness of two runs
  // agreed inside 0.02, and it went red once on this machine at 0.649256 against 0.671157
  // while every other quantity matched: the throughput term is cell runs per WALL second, so
  // a machine that gets busy can move it as far as it likes and no band is a fact about the
  // search. What IS a fact is the identity above, measured over 15 cells: the same organism
  // holds every cell, its three pure components are bit identical, and the whole of the move
  // in the scalar is the two wall clock terms times their two weights.
  const g = gradeSameSearch(a, b, 'rerun');
  console.log('   rerun: ' + g.cells + ' cells, same organism in every one, novelty moved in ' + g.noveltyMoved +
    ', worst fitness gap ' + g.worstGap.toFixed(6) + ', worst residual after the two wall clock terms ' + g.worstResidual.toFixed(9));
  assert.equal(a.best.key, b.best.key, 'the best cell of the grid must be the same cell');
  assert.equal(a.best.id, b.best.id, 'the best cell must be held by the same organism');
  // The years clock is the declaration, undone by hand here rather than trusted.
  assert.equal(a.simulatedYears, (a.ticks * c.secondsPerTick) / SECONDS_PER_YEAR);
  assert.equal(plannedYears(c, 400).years, (400 * c.secondsPerTick) / SECONDS_PER_YEAR);
  assert.ok(a.ticks >= 400, 'the tick budget is a floor: generations run whole');
  assert.ok(a.archiveFillAfter <= gridCapacity());
});

test('(g) importing generations/planes.mjs writes nothing', async () => {
  const gen = path.join(ROOT, 'state', 'generations');
  const before = existsSync(gen) ? readFileSync(path.join(gen, 'latest.json'), 'utf8') : null;
  await import('../generations/planes.mjs');
  runPlane(planeCoordinate(4), { ticks: 200 });
  const after = existsSync(gen) ? readFileSync(path.join(gen, 'latest.json'), 'utf8') : null;
  assert.equal(before, after, 'a plane must not touch state/generations');
});

test('(h) the bench on 4 planes with 2 workers writes a verdict of 4 planes', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'planes-'));
  const out = path.join(dir, 'planes.json');
  try {
    const res = spawnSync(process.execPath, [
      BENCH, '--planes', '4', '--workers', '2', '--chunk', '2', '--ticks', '200', '--quiet', '--out', out,
    ], { encoding: 'utf8', cwd: ROOT, timeout: 5 * 60_000, maxBuffer: 64 * 1024 * 1024 });
    assert.equal(res.status, 0, 'bench exited ' + res.status + ': ' + String(res.stderr).slice(-2000));
    const v = JSON.parse(readFileSync(out, 'utf8'));
    assert.equal(v.planesRequested, 4);
    assert.equal(v.planesCompleted, 4, 'four planes must be completed, not counted');
    assert.equal(v.planesFailed, 0);
    assert.equal(v.rows.length, 4, 'one row per plane');
    assert.equal(v.workers, 2, 'two workers');
    assert.equal(v.distinctDescriptors, 4);
    assert.ok(v.at && v.node && v.command, 'the verdict carries at, node and the command that printed it');
    assert.ok(v.command.includes('--planes 4'), 'the command kept is the one that ran');
    // The totals are the rows added up, not a separate claim.
    assert.equal(v.ticks, v.rows.reduce((a, r) => a + r.ticks, 0));
    assert.ok(Math.abs(v.simulatedYears - v.rows.reduce((a, r) => a + r.simulatedYears, 0)) < 1e-9);
    assert.ok(v.archiveCoverage.unionAtEnd >= v.archiveCoverage.unionAfterFirstGeneration, 'coverage cannot fall: the union only grows');
    assert.ok(v.simulatedYearsPerWallSecond > 0);
    assert.ok(v.sweepWallMs > 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// One child of the sweep, over the plane indices given, with the environment given. The same
// entry point the sweep spawns and the same flag, so what is graded is the child the bar runs.
function runSweepChild(indices, env, ticks = '400', extra = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [
      '--expose-gc', BENCH, '--child', '--indices', indices, '--ticks', ticks, '--worker', '0', '--seq', '0', ...extra,
    ], { cwd: ROOT, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', reject);
    child.on('close', (code) => {
      const lines = out.trim().split('\n').filter(Boolean);
      const want = indices.split(',').length;
      if (code !== 0 || lines.length !== want) reject(new Error('child exited ' + code + ' with ' + lines.length + ' rows: ' + err.slice(-2000)));
      else resolve(lines.map((l) => JSON.parse(l)));
    });
  });
}

test('(j) a child gives back what a plane took, and the collection point is why', async () => {
  // The claim is about a CHILD, so the child is what runs: six planes through the same entry
  // point the sweep spawns. The control arm is the code this replaced WHOLE, which is a
  // synchronous plane (BRAIN_PLANES_ASYNC=0), no collection point (BRAIN_PLANES_COLLECT=0)
  // and no organism handing its slots back (BRAIN_PLANES_RELEASE=0). Turning off only the
  // collection point would not be that control: a plane that yields gets an event loop turn
  // between generations, and a turn alone lets a finalizer V8 chose to run fire, so the arm
  // would report finalizer calls the old code could never have made. The two run in the SAME
  // wall window so a machine that got busy cannot land on one arm alone.
  const run = (env) => runSweepChild('0,1,2,3,4,5', env);
  const [on, off] = await Promise.all([
    run({}),
    run({ BRAIN_PLANES_COLLECT: '0', BRAIN_PLANES_ASYNC: '0', BRAIN_PLANES_RELEASE: '0' }),
  ]);

  const rss = (rows) => rows.map((r) => r.after.rssMB);
  const held = (rows) => rows.map((r) => r.after.hv.inUse);
  console.log('   collection point on : rss ' + rss(on).join(' ') + ' MB; slots still held ' + held(on).join(' ') +
    '; finalizer calls ' + on[on.length - 1].after.hv.finalizerCalls + '; heap ' + on[0].after.hv.slots + ' slots');
  console.log('   collection point off: rss ' + rss(off).join(' ') + ' MB; slots still held ' + held(off).join(' ') +
    '; finalizer calls ' + off[off.length - 1].after.hv.finalizerCalls + '; heap ' + off[0].after.hv.slots + ' slots');

  // The control, which is the code this replaced: with no collection point no slot ever
  // comes back inside a synchronous child, so the live set only climbs.
  assert.equal(off.every((r) => r.gcAvailable === false), true, 'the off arm must report no collection point');
  assert.equal(off[off.length - 1].after.hv.finalizerCalls, 0, 'with no collection point no finalizer can run');
  for (let i = 1; i < off.length; i++) {
    assert.ok(held(off)[i] >= held(off)[i - 1], 'the control live set may not fall at plane ' + i + ': ' + held(off).join(' '));
  }
  assert.ok(held(off)[off.length - 1] > 5000, 'the control must be holding thousands of slots by the last plane, held ' + held(off).join(' '));

  // The arm under test. Slots come back, so what a child still holds after the last plane is
  // what it held after the first, to a margin measured on this machine: three runs of these
  // six planes held 41, 57, 57, 62, 66, 67 slots, so 256 is the margin asserted.
  assert.equal(on.every((r) => r.gcAvailable === true), true, 'the on arm must have a collection point');
  assert.ok(on[on.length - 1].after.hv.finalizerCalls > 0, 'slots must come back through the registry');
  assert.ok(on[on.length - 1].after.hv.inUse <= on[0].after.hv.inUse + 256,
    'slots held after the last plane ' + on[on.length - 1].after.hv.inUse + ' vs after the first ' + on[0].after.hv.inUse);

  // Rss after the last plane against rss after the first. What may still rise is pages of
  // the FIXED heap that a later, larger plane touched for the first time and the operating
  // system keeps resident; that is bounded by the slot high water mark, which is why the
  // margin is computed from it rather than guessed, plus 48 MB of JS slack measured on the
  // same runs (heapTotal moved 141.4 to 142.9 MB, heapUsed 11.7 to 12.5).
  const grew = rss(on)[on.length - 1] - rss(on)[0];
  const touched = (on[on.length - 1].after.hv.peak - on[0].after.hv.peak) * 8192 / 1048576;
  console.log('   rss after the last plane rose ' + grew.toFixed(3) + ' MB over the first; the heap high water mark rose ' +
    touched.toFixed(3) + ' MB; the control rose ' + (rss(off)[off.length - 1] - rss(off)[0]).toFixed(3) + ' MB');
  assert.ok(grew <= touched + 48, 'rss grew ' + grew.toFixed(3) + ' MB, more than the ' + touched.toFixed(3) + ' MB of heap pages a bigger plane touched plus 48 MB');
});

test('(k) against a heap small enough to fill, the fix falls back 0 times', async () => {
  // THE CLAIM AT ITS OWN SCALE. Plane 296 is the worst plane of the 400 plane sweep by its own
  // fallbacks, and BRAIN_HV_HEAP_MB=128 is a heap it cannot fit: a fallback is a plain
  // Int8Array copy, which is exactly what the wasm kernels exist to avoid, so a run that falls
  // back is doing the arithmetic the slow way whatever its rss says. Three arms, spawned
  // together in one wall window: the runner this replaced, the yield and the collection point
  // on their own, and the whole fix, which is what the sweep runs.
  const heap = '128';
  const [old, halfway, fix] = await Promise.all([
    runSweepChild('296', { BRAIN_HV_HEAP_MB: heap, BRAIN_PLANES_ASYNC: '0', BRAIN_PLANES_COLLECT: '0', BRAIN_PLANES_RELEASE: '0' }, '2000'),
    runSweepChild('296', { BRAIN_HV_HEAP_MB: heap, BRAIN_PLANES_RELEASE: '0' }, '2000'),
    runSweepChild('296', { BRAIN_HV_HEAP_MB: heap }, '2000'),
  ]);
  const say = (name, rows) => {
    const r = rows[0];
    console.log('   ' + name.padEnd(34) + ' heap ' + r.after.hv.installedMB + ' MB (' + r.after.hv.slots + ' slots)' +
      '  peak ' + String(r.after.hv.peak).padStart(6) + '  attempts ' + (r.inPlane.allocs + r.inPlane.fallbacks) +
      '  fallbacks ' + String(r.inPlane.fallbacks).padStart(6) + ' (' + r.inPlane.fallbackPct + ' %)' +
      '  released ' + String(r.releasedSlots).padStart(6) + '  generations ' + r.generations);
    return r;
  };
  const o = say('the runner this replaced', old);
  const h = say('yield and collection point only', halfway);
  const f = say('the fix, which the sweep runs', fix);
  assert.equal(o.after.hv.slots, f.after.hv.slots, 'the three arms must be given the same heap');
  assert.ok(o.inPlane.fallbacks > 10_000, 'the control must fill this heap: it fell back ' + o.inPlane.fallbacks + ' times');
  assert.ok(o.inPlane.fallbackPct > 50, 'the control must fall back on most of its attempts, not ' + o.inPlane.fallbackPct + ' %');
  assert.equal(f.inPlane.fallbacks, 0, 'the fix must not fall back once, and fell back ' + f.inPlane.fallbacks + ' times');
  assert.ok(f.releasedSlots > 0, 'the fix releases organisms: ' + f.releasedSlots + ' slots came back by release');
  assert.equal(o.releasedSlots, 0, 'the control releases nothing');
  // The middle arm is why the release is not optional: the yield and the collection point
  // alone leave this heap full by the last generations.
  assert.ok(h.inPlane.fallbacks > f.inPlane.fallbacks, 'the yield alone must not already reach 0, it fell back ' + h.inPlane.fallbacks + ' times');
  // The same plane, same search, three arms: the fix may not have bought the heap with ticks.
  for (const k of ['generations', 'organisms', 'ticks', 'archiveFillAfter']) {
    assert.equal(o[k], f[k], k + ' must be the same search in both arms');
    assert.equal(h[k], f[k], k + ' must be the same search in every arm');
  }
  assert.equal(o.best.key, f.best.key, 'the best cell must be the same cell in both arms');
});

test('(l) a plane that yields and releases is the same search as one that does neither', async () => {
  // The two halves of the fix are a yield and a release, and neither may touch the
  // arithmetic: every draw comes from the engine's own RNG, a suspension takes none, and an
  // organism releases only after every number has been read off it. This is that claim, in
  // process, on one plane: the control is the synchronous runner with nothing released.
  const c = planeCoordinate(2);
  const turn = () => new Promise((r) => setImmediate(r));
  const control = runPlane(c, { ticks: 400, elites: true });
  let yields = 0;
  const fixed = await runPlaneAsync(c, { ticks: 400, elites: true, release: true, betweenGenerations: async () => { yields++; await turn(); } });
  const g = gradeSameSearch(control, fixed, 'yield and release against the synchronous runner');
  console.log('   control: ' + control.releasedSlots + ' slots released, ' + control.pauseMs + ' ms suspended; fix: ' +
    fixed.releasedSlots + ' released over ' + yields + ' yields, ' + fixed.pauseMs + ' ms suspended; ' + g.cells +
    ' cells, novelty moved in ' + g.noveltyMoved + ', worst fitness gap ' + g.worstGap.toFixed(6) +
    ', worst residual ' + g.worstResidual.toFixed(9));
  assert.equal(control.releasedSlots, 0, 'the control hands nothing back');
  assert.ok(fixed.releasedSlots > 0, 'the fix hands slots back: ' + fixed.releasedSlots);
  assert.ok(yields > 0, 'the fix must have yielded');
  assert.equal(control.best.id, fixed.best.id, 'the best organism must be the same organism');
  // qd is the sum of the fitness of every cell, so it may move only by what the two wall clock
  // terms moved in each of them, and by nothing else.
  const explained = control.elites.reduce((a, e) => a + Math.abs(explainedGap(e, fixed.elites.find((x) => x.key === e.key))), 0);
  assert.ok(Math.abs(control.qd - fixed.qd) <= explained + g.cells * SCALAR_ROUNDING,
    'qd moved ' + Math.abs(control.qd - fixed.qd).toFixed(6) + ' and the throughput term explains ' + explained.toFixed(6));
});

test('(i) no em dashes in the new files', () => {
  for (const f of ['generations/planes.mjs', 'bench/planes.mjs', 'test/planes.test.mjs']) {
    assert.ok(!readFileSync(path.join(ROOT, f), 'utf8').includes(String.fromCharCode(0x2014)), f + ' must hold no em dash');
  }
});
