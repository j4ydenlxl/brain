// bench/semantic-cleanup.mjs: what a cleanup and a recognize cost in the semantic tier, at
// 64, 256, 1024 and 4096 stored patterns, d = 8192, and what the softmax weights look like
// underneath that cost. Two arms, interleaved: the paths this tier ran before 2026-09-17
// (SemanticMemory.fast = false: the arena accumulation on every step and a second scan
// inside recognize) and the paths it runs now. The answers are identical lane for lane,
// which test/memory.test.mjs asserts on 200 cues at each of 64, 256 and 1024 patterns.
//
// It also measures the two things that were assumed and had to be checked: how many softmax
// weights survive the round to WEIGHT_SCALE (candidate a), and what the two kernels cost
// per slot (dots is one wasm call per slot, wacc is one call for all of them).
//
// `--live` instead runs the whole organism under the V8 CPU profiler, three times, and
// merges what the profiles say into the same verdict: see liveMode() at the bottom.
import { writeFileSync, readFileSync, readdirSync, existsSync, mkdirSync, mkdtempSync, rmSync, openSync, readSync, closeSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { RNG } from '../core/rng.mjs';
import * as S from '../core/signal.mjs';
import * as SIMD from '../core/simd.mjs';
import { SemanticMemory, WEIGHT_SCALE } from '../memory/semantic.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const D = 8192;
const NS = [64, 256, 1024, 4096];
const CUES = 20;
const REPS = 3;
const NOISE = 0.15;

const now = () => Number(process.hrtime.bigint()) / 1e6;
function fastHv(rng, d) {
  const v = new Int8Array(d);
  for (let i = 0; i < d;) { let r = rng.u32(); for (let b = 0; b < 32 && i < d; b++, i++) { v[i] = (r & 1) ? 1 : -1; r >>>= 1; } }
  return v;
}
function flip(hv, rng, frac) { const out = Int8Array.from(hv); for (let i = 0; i < out.length; i++) if (rng.next() < frac) out[i] = -out[i]; return out; }

// the same arithmetic step() runs, so the weights can be looked at without instrumenting it
function weightsOf(m, state, beta) {
  const n = m.patterns.length;
  const sims = m._sims(state);
  const logits = new Float64Array(n);
  let mx = -Infinity;
  for (let i = 0; i < n; i++) { const v = beta * sims[i] + Math.log(Math.max(1e-9, m.strength[i])); logits[i] = v; if (v > mx) mx = v; }
  let sum = 0;
  const w = new Float64Array(n);
  for (let i = 0; i < n; i++) { w[i] = Math.exp(logits[i] - mx); sum += w[i]; }
  if (!(sum > 0)) sum = 1;
  const iw = new Int32Array(n);
  let k = 0, top = 0, isum = 0;
  for (let i = 0; i < n; i++) {
    iw[i] = Math.max(0, Math.round((w[i] / sum) * WEIGHT_SCALE));
    if (iw[i] > 0) k++;
    isum += iw[i];
    if (iw[i] > iw[top]) top = i;
  }
  return { iw, k, top, isum, share: iw[top] / isum };
}

const VERDICT = path.join(HERE, 'verdicts', 'semantic-cleanup.json');
const ROOT = path.join(HERE, '..');
if (process.argv.includes('--live')) { await liveMode(); process.exit(0); }

console.log('semantic cleanup bench: d=' + D + ', ' + CUES + ' cues per row, ' + REPS + ' interleaved repetitions, noise ' + NOISE);
console.log('node ' + process.version + ', ' + os.cpus().length + ' cpus, ' + os.cpus()[0].model);
console.log('simd ' + SIMD.available + ', arena fits d ' + SIMD.fits(D));

const rows = [];
for (const n of NS) {
  const rng = new RNG('semantic-cleanup-bench-' + n);
  const pats = [];
  const now_ = new SemanticMemory({ d: D, capacity: 8192 });
  const old = new SemanticMemory({ d: D, capacity: 8192 });
  old.fast = false;
  for (let i = 0; i < n; i++) {
    const p = fastHv(rng, D); pats.push(p);
    const opts = { name: 'p' + i, strength: 1 + (i % 4) };
    now_.add(p, opts); old.add(p, opts);
  }
  const cues = [];
  for (let c = 0; c < CUES; c++) cues.push(flip(pats[rng.int(n)], rng, NOISE));

  // one untimed pass per arm so both are warm before the timed repetitions
  for (const m of [now_, old]) for (const q of cues) m.recognize(q);

  const t = { nowCleanup: [], oldCleanup: [], nowRecognize: [], oldRecognize: [] };
  for (let r = 0; r < REPS; r++) {
    const order = r % 2 === 0 ? [['now', now_], ['old', old]] : [['old', old], ['now', now_]];
    for (const [tag, m] of order) {
      let t0 = now();
      for (const q of cues) m.cleanup(q);
      t[tag + 'Cleanup'].push((now() - t0) / CUES);
      t0 = now();
      for (const q of cues) m.recognize(q);
      t[tag + 'Recognize'].push((now() - t0) / CUES);
    }
  }
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const min = (a) => Math.min(...a);

  // the weights underneath, and where the domination test lands, iteration by iteration
  const perIter = new Map();
  let ksum = 0, kfull = 0, shareSum = 0, wrows = 0, iters = 0, dom = 0, held = 0;
  for (const q of cues) {
    let state = q;
    for (let it = 0; it < now_.maxIters; it++) {
      const { k, top, share, isum, iw } = weightsOf(now_, state, now_.beta);
      wrows++; ksum += k; if (k === n) kfull++; shareSum += share;
      const fire = 2 * iw[top] > isum;
      const rec = perIter.get(it) || { rows: 0, fire: 0, k: 0, share: 0 };
      rec.rows++; rec.k += k; rec.share += share; if (fire) rec.fire++;
      perIter.set(it, rec);
      const next = old.step(state, now_.beta); // the full accumulation, whatever the weights say
      if (fire) { dom++; if (S.sim(next, now_.patterns[top]) === 1) held++; }
      iters++;
      if (S.sim(next, state) === 1) { state = next; break; }
      state = next;
    }
  }

  // the two kernels on their own, at this n
  const acc = new Int32Array(D), out = new Int32Array(Math.max(n, 64));
  const ones = new Int32Array(n).fill(1);
  const probe = cues[0];
  let t0 = now();
  for (let r = 0; r < 20; r++) now_.arena.dots(probe, out, n);
  const dotsMs = (now() - t0) / 20;
  t0 = now();
  for (let r = 0; r < 20; r++) now_.arena.wacc(ones, acc, n);
  const waccMs = (now() - t0) / 20;

  const row = {
    n,
    patterns: now_.patterns.length,
    arenaCount: now_.arena.count,
    arenaCapacity: now_.arena.capacity,
    cleanupMsOld: mean(t.oldCleanup), cleanupMsNew: mean(t.nowCleanup),
    cleanupMsOldBest: min(t.oldCleanup), cleanupMsNewBest: min(t.nowCleanup),
    recognizeMsOld: mean(t.oldRecognize), recognizeMsNew: mean(t.nowRecognize),
    recognizeMsOldBest: min(t.oldRecognize), recognizeMsNewBest: min(t.nowRecognize),
    itersPerCleanup: iters / CUES,
    meanNonzero: ksum / wrows, nonzeroIsN: kfull + '/' + wrows,
    meanTopShare: shareSum / wrows,
    dominatedRows: dom + '/' + wrows,
    dominationHeld: held + '/' + dom,
    perIteration: [...perIter.entries()].sort((a, b) => a[0] - b[0]).map(([it, r]) => ({
      iteration: it, rows: r.rows, meanNonzero: r.k / r.rows, meanTopShare: r.share / r.rows, dominates: r.fire,
    })),
    dotsMs, waccMs, dotsUsPerSlot: (dotsMs * 1000) / n, waccUsPerSlot: (waccMs * 1000) / n,
    statsNew: { ...now_.stats }, statsOld: { ...old.stats },
  };
  rows.push(row);
  console.log('');
  console.log('n=' + n + '  cleanup ' + row.cleanupMsOld.toFixed(3) + ' -> ' + row.cleanupMsNew.toFixed(3) + ' ms/call'
    + '   recognize ' + row.recognizeMsOld.toFixed(3) + ' -> ' + row.recognizeMsNew.toFixed(3) + ' ms/call'
    + '   (' + (100 * (1 - row.recognizeMsNew / row.recognizeMsOld)).toFixed(1) + '% off recognize)');
  console.log('      iterations/cleanup ' + row.itersPerCleanup.toFixed(2)
    + ', nonzero weights ' + row.meanNonzero.toFixed(1) + ' of ' + n + ' (k==n on ' + row.nonzeroIsN + ' steps)'
    + ', mean top share ' + row.meanTopShare.toFixed(4));
  console.log('      domination ' + row.dominatedRows + ' steps, the bundle was the top pattern on ' + row.dominationHeld + ' of them');
  for (const p of row.perIteration) console.log('        iteration ' + p.iteration + ': ' + p.rows + ' steps, top share ' + p.meanTopShare.toFixed(4) + ', dominates ' + p.dominates);
  console.log('      kernels: dots ' + row.dotsMs.toFixed(3) + ' ms (' + row.dotsUsPerSlot.toFixed(3) + ' us/slot, one wasm call each)'
    + ', wacc ' + row.waccMs.toFixed(3) + ' ms (' + row.waccUsPerSlot.toFixed(3) + ' us/slot, one call for all)');
}

// Candidate (a) priced: if k weights were nonzero, what would accumulating only those k in
// JS cost against the one wasm call over all n? The crossover is where the two lines meet.
console.log('');
console.log('sparse accumulation in JS against the dense wasm scan, d=' + D);
const cross = [];
for (const n of [1024, 4096]) {
  const rng = new RNG('sparse-cross-' + n);
  const m = new SemanticMemory({ d: D, capacity: 8192 });
  for (let i = 0; i < n; i++) m.add(fastHv(rng, D), { strength: 1 });
  const acc = new Int32Array(D);
  const ones = new Int32Array(n).fill(1);
  for (let r = 0; r < 5; r++) m.arena.wacc(ones, acc, n);
  let t0 = now();
  for (let r = 0; r < 20; r++) m.arena.wacc(ones, acc, n);
  const dense = (now() - t0) / 20;
  const line = [];
  for (const k of [1, 2, 4, 8, 16, 32, 64, 128, 256]) {
    if (k > n) continue;
    const idx = []; for (let i = 0; i < k; i++) idx.push((i * 7919) % n);
    const run = () => { acc.fill(0); for (const i of idx) { const p = m.patterns[i]; for (let j = 0; j < D; j++) acc[j] += p[j] * 1000; } };
    for (let r = 0; r < 3; r++) run();
    const t1 = now();
    for (let r = 0; r < 20; r++) run();
    const sparse = (now() - t1) / 20;
    line.push({ k, sparseMs: sparse, denseMs: dense, wins: sparse < dense });
  }
  const last = line.filter(x => x.wins).pop();
  cross.push({ n, denseMs: dense, ks: line, crossoverK: last ? last.k : 0 });
  console.log('  n=' + n + ': one wacc over all ' + n + ' slots ' + dense.toFixed(3) + ' ms; JS over k slots: '
    + line.map(x => 'k=' + x.k + ' ' + x.sparseMs.toFixed(3)).join(', '));
  console.log('    the JS path is cheaper up to k=' + (last ? last.k : 0) + ', and the measured k is n (see the rows above), so it never runs');
}

// dots is one wasm call per slot and wacc is one call for all of them. Timing the same
// scan at four widths separates the part of a slot's cost that scales with the lanes from
// the part that does not: the fixed part is what a batched kernel would remove.
console.log('');
console.log('one dots scan of 256 slots at four widths, to price the per call fixed cost');
const widths = [];
for (const d of [1024, 2048, 4096, 8192]) {
  const rng = new RNG('width-' + d);
  const arena = new SIMD.RawArena(d, 256);
  for (let i = 0; i < 256; i++) arena.set(i, fastHv(rng, d));
  const q = fastHv(rng, d), out = new Int32Array(256);
  const ones = new Int32Array(256).fill(1), acc = new Int32Array(d);
  for (let r = 0; r < 5; r++) { arena.dots(q, out, 256); arena.wacc(ones, acc, 256); }
  let t0 = now();
  for (let r = 0; r < 50; r++) arena.dots(q, out, 256);
  const dotsUsPerSlot = ((now() - t0) / 50) * 1000 / 256;
  t0 = now();
  for (let r = 0; r < 50; r++) arena.wacc(ones, acc, 256);
  const waccUsPerSlot = ((now() - t0) / 50) * 1000 / 256;
  widths.push({ d, slots: 256, dotsUsPerSlot, waccUsPerSlot });
  console.log('  d=' + String(d).padStart(4) + ': dots ' + dotsUsPerSlot.toFixed(4) + ' us/slot, wacc ' + waccUsPerSlot.toFixed(4) + ' us/slot');
}
const a0 = widths[0], a1 = widths[widths.length - 1];
const dotsPerLane = (a1.dotsUsPerSlot - a0.dotsUsPerSlot) / (a1.d - a0.d);
const dotsFixed = a0.dotsUsPerSlot - dotsPerLane * a0.d;
const waccPerLane = (a1.waccUsPerSlot - a0.waccUsPerSlot) / (a1.d - a0.d);
const waccFixed = a0.waccUsPerSlot - waccPerLane * a0.d;
console.log('  fitted on d=1024 and d=8192: dots ' + (dotsPerLane * 1000).toFixed(4) + ' ns per lane plus '
  + dotsFixed.toFixed(4) + ' us per slot that does not scale, which is ' + (100 * dotsFixed / a1.dotsUsPerSlot).toFixed(1) + '% of a slot at d=8192');
console.log('  the same fit for wacc, which is one call for all 256 slots: ' + (waccPerLane * 1000).toFixed(4)
  + ' ns per lane plus ' + waccFixed.toFixed(4) + ' us per slot');

// A cleanup that runs out of iterations is either standing next to a fixed point or going
// round an orbit, and those want different fixes. SemanticMemory.walk() takes the same walk
// cleanup() takes without stopping at the fixed point, holds every state it passes through
// and compares each new state against all of them, so a repeat is found wherever it is. The
// same twelve cues are walked at the organism's maxIters of 8 and at 32.
console.log('');
console.log('cycle probe: walking the cleanup instead of stopping it, d=' + D + ', beta 8');
const cycleProbe = [];
for (const n of [1024, 4096]) {
  const rng = new RNG('cycle-probe-' + n);
  const m = new SemanticMemory({ d: D, capacity: 8192 });
  const pats = [];
  for (let i = 0; i < n; i++) { const p = fastHv(rng, D); pats.push(p); m.add(p, { name: 'c' + i, strength: 1 + (i % 4) }); }
  const WALKS = 12;
  const kinds = [
    ['random', () => fastHv(rng, D)],
    ['noisy 0.15', () => flip(pats[rng.int(n)], rng, 0.15)],
    ['noisy 0.35', () => flip(pats[rng.int(n)], rng, 0.35)],
  ];
  for (const [kind, make] of kinds) {
    const cues = []; for (let c = 0; c < WALKS; c++) cues.push(make());
    for (const maxIters of [8, 32]) {
      let converged = 0, cycles = 0, iters = 0, longest = 0;
      for (const q of cues) {
        const w = m.walk(q, { maxIters });
        if (w.converged) converged++;
        if (w.cycleLength > 0) { cycles++; longest = Math.max(longest, w.cycleLength); }
        iters += w.iterations;
      }
      const row = { n, kind, maxIters, walks: WALKS, converged, cycles, longestCycle: longest, meanIterations: iters / WALKS };
      cycleProbe.push(row);
      console.log('  n=' + n + ' ' + kind.padEnd(10) + ' maxIters ' + String(maxIters).padStart(2)
        + ': converged ' + converged + '/' + WALKS + ', cycles ' + cycles + '/' + WALKS
        + ', mean iterations walked ' + row.meanIterations.toFixed(2));
    }
  }
}

// the live block is written by --live and carried forward here, never invented
let carriedLive = null, carriedMergedAt = null;
if (existsSync(VERDICT)) {
  try {
    const prev = JSON.parse(readFileSync(VERDICT, 'utf8'));
    carriedLive = prev.live || null; carriedMergedAt = prev.mergedAt || null;
  } catch { carriedLive = null; }
}

const verdict = {
  at: new Date().toISOString(),
  node: process.version,
  cpus: os.cpus().length,
  cpu: os.cpus()[0].model,
  what: 'Cost of a semantic cleanup and recognize before and after the dominant weight shortcut and the reused sims, d=' + D
    + ', two arms interleaved over ' + REPS + ' repetitions of ' + CUES + ' cues. The arms answer identically lane for lane (test/memory.test.mjs).',
  d: D, cues: CUES, reps: REPS, noise: NOISE, weightScale: WEIGHT_SCALE,
  rows, sparseCrossover: cross,
  kernelWidths: { rows: widths, dotsNsPerLane: dotsPerLane * 1000, dotsFixedUsPerSlot: dotsFixed, waccNsPerLane: waccPerLane * 1000, waccFixedUsPerSlot: waccFixed },
  cycleProbe,
};
if (carriedLive) { verdict.live = carriedLive; verdict.mergedAt = carriedMergedAt; }
mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
writeFileSync(VERDICT, JSON.stringify(verdict, null, 2));
console.log('');
console.log('wrote bench/verdicts/semantic-cleanup.json at ' + verdict.at
  + (carriedLive ? ' (carrying the live block merged at ' + carriedMergedAt + ')' : ' (no live block: run with --live)'));

// ---------------------------------------------------------------- the live arm
// What the change does to the whole organism, which is the only place the population is
// 4096 patterns deep. Three runs of the same command under the V8 CPU profiler, new arm,
// control, new arm again, each on a state directory built from scratch and deleted after.
// The control is the paths this tier ran before, pinned for the whole child process by
// BRAIN_SEMANTIC_FAST=0, so no preload file and no edit is involved in selecting it. The
// .cpuprofile files are parsed here and deleted with the temporary directory that held
// them: the rows this prints, and the same rows in the verdict, are the record.
async function liveMode() {
  const NAME = 'semantic-cleanup-prof';
  // the shape of the live arm is 200 majors and 800 ticks; --ticks and --majors are here so
  // that the plumbing can be smoke tested on a small organism before the real pass
  const argInt = (flag, dflt) => { const i = process.argv.indexOf(flag); return i > 0 && process.argv[i + 1] ? Number(process.argv[i + 1]) : dflt; };
  const TICKS = argInt('--ticks', 800), MAJORS = argInt('--majors', 200);
  const command = 'BRAIN_STATE_DIR=<dir> node --cpu-prof --cpu-prof-dir <dir> bin/brain.mjs live ' + NAME
    + ' --majors ' + MAJORS + ' --ticks ' + TICKS + ' --checkpoint 100000 --heap 0';
  console.log('semantic cleanup, the live arm: ' + command);
  console.log('node ' + process.version + ', ' + os.cpus().length + ' cpus, ' + os.cpus()[0].model);
  // both the profiles and the organism's own directory live in a temporary directory that
  // this function deletes, so a profiled run leaves nothing behind and touches no other state
  const profDir = mkdtempSync(path.join(os.tmpdir(), 'semantic-cleanup-prof-'));
  const stateRoot = path.join(profDir, 'state');
  const STATE = path.join(stateRoot, NAME);
  const plan = [
    { arm: 'new', env: {} },
    { arm: 'control', env: { BRAIN_SEMANTIC_FAST: '0' } },
    { arm: 'new', env: {} },
  ];
  const runs = [];
  try {
    for (const step of plan) {
      rmSync(STATE, { recursive: true, force: true });
      for (const f of readdirSync(profDir)) if (f.endsWith('.cpuprofile')) rmSync(path.join(profDir, f), { force: true });
      const t0 = Date.now();
      const r = spawnSync(process.execPath, [
        '--cpu-prof', '--cpu-prof-dir', profDir, path.join(ROOT, 'bin', 'brain.mjs'),
        'live', NAME, '--majors', String(MAJORS), '--ticks', String(TICKS), '--checkpoint', '100000', '--heap', '0',
      ], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, env: { ...process.env, BRAIN_STATE_DIR: stateRoot, ...step.env } });
      const wallMs = Date.now() - t0;
      const stdout = (r.stdout || '') + (r.stderr || '');
      if (r.status !== 0) { console.log(stdout.slice(-2000)); throw new Error('the live run exited ' + r.status); }
      // a worker process of the run writes its own profile into the same directory, so the
      // profile of the organism is the one with the most samples, and the rest are counted
      const files = readdirSync(profDir).filter(f => f.endsWith('.cpuprofile'));
      if (files.length === 0) throw new Error('no .cpuprofile in ' + profDir);
      const parsed = files.map(f => ({ f, prof: parseProfile(path.join(profDir, f)) })).sort((a, b) => b.prof.samples - a.prof.samples);
      const prof = { ...parsed[0].prof, otherProfiles: parsed.slice(1).map(x => ({ file: x.f, samples: x.prof.samples })) };
      files[0] = parsed[0].f;
      // the three lines the run prints about the work it did, which is what makes two runs a
      // matched pair or does not
      const lines = stdout.split('\n').map(l => l.trim());
      const work = {
        stopped: lines.find(l => l.startsWith('live ' + NAME)) || '',
        cellsAndEdges: lines.find(l => l.startsWith('cells ') && l.includes('edges')) || '',
        runsPerPeriod: lines.find(l => l.startsWith('runs per period')) || '',
      };
      const stats = semanticStatsOf(path.join(STATE, 'snapshot.json'));
      runs.push({ arm: step.arm, file: files[0], wallMs, work, semanticStats: stats, ...prof });
      const last = runs[runs.length - 1];
      console.log('');
      console.log('  ' + step.arm.padEnd(7) + ' ' + files[0] + ': sampled ' + last.sampledMs.toFixed(1) + ' ms, '
        + last.samples + ' samples, ' + (wallMs / 1000).toFixed(1) + ' s wall');
      for (const k of ['wacc', 'dots']) {
        const row = last.kernels[k];
        if (row) console.log('    ' + k + ' ' + row.selfMs.toFixed(1) + ' ms self (' + row.firstHalfMs.toFixed(1)
          + ' then ' + row.secondHalfMs.toFixed(1) + '), ' + (100 * row.selfMs / last.sampledMs).toFixed(1) + '% of sampled');
      }
      console.log('    dots under recognize: ' + last.dotsFromRecognizeMs.toFixed(1) + ' ms, dots under step: ' + last.dotsFromStepMs.toFixed(1) + ' ms');
      console.log('    ' + work.stopped);
      console.log('    ' + work.cellsAndEdges);
      console.log('    ' + work.runsPerPeriod);
      console.log('    semantic at the end: ' + (stats ? stats.raw : 'not found in ' + path.join(STATE, 'snapshot.json')));
      console.log('    top ' + last.topSelf.length + ' by self time:');
      for (const row of last.topSelf) console.log('      ' + row.selfMs.toFixed(1).padStart(7) + ' ms | ' + row.firstHalfMs.toFixed(1).padStart(7)
        + ' | ' + row.secondHalfMs.toFixed(1).padStart(7) + ' | ' + row.fn);
    }
  } finally {
    rmSync(profDir, { recursive: true, force: true });
  }

  // what the three runs resolve, and what they do not
  const news = runs.filter(r => r.arm === 'new'), control = runs.find(r => r.arm === 'control');
  const kern = (r, k) => (r.kernels[k] ? r.kernels[k].selfMs : 0);
  const spread = {};
  if (news.length === 2) for (const k of ['wacc', 'dots']) spread['sameArm_' + k] = Math.abs(kern(news[0], k) - kern(news[1], k));
  if (control) for (const k of ['wacc', 'dots']) spread['armToControl_' + k] = kern(news[0], k) - kern(control, k);
  console.log('');
  for (const [k, v] of Object.entries(spread)) console.log('  ' + k + ': ' + v.toFixed(1) + ' ms');
  const recogDrop = control && control.dotsFromRecognizeMs > 0 ? news.map(r => ({
    selfMs: r.dotsFromRecognizeMs,
    dropPct: 100 * (control.dotsFromRecognizeMs - r.dotsFromRecognizeMs) / control.dotsFromRecognizeMs,
  })) : null;
  if (recogDrop) {
    console.log('  dots under recognize, control ' + control.dotsFromRecognizeMs.toFixed(1) + ' ms against '
      + recogDrop.map(x => x.selfMs.toFixed(1) + ' ms (' + x.dropPct.toFixed(2) + '% off)').join(' and '));
  }

  // the earlier profile of this organism, read back rather than remembered
  let previous = null;
  const PREV = path.join(HERE, 'verdicts', 'profile-live.json');
  if (existsSync(PREV)) {
    const j = JSON.parse(readFileSync(PREV, 'utf8'));
    const fromRows = (side) => {
      const rows = (side && (side.rows || side.top || side.functions)) || [];
      const pick = (needle) => rows.find(r => JSON.stringify(r).includes(needle)) || null;
      return { wacc: pick('wacc simd.mjs'), dots: pick('dots simd.mjs'), sampledMs: side && (side.sampledMs || side.sampled) };
    };
    previous = { from: 'bench/verdicts/profile-live.json at ' + j.at, newArm: fromRows(j.new), oldArm: fromRows(j.old) };
    console.log('  the profile before this change (bench/verdicts/profile-live.json, written ' + j.at + '): '
      + JSON.stringify(previous.newArm));
  }

  const live = {
    at: new Date().toISOString(),
    command, majors: MAJORS, ticks: TICKS,
    control: 'BRAIN_SEMANTIC_FAST=0 in the environment of the child process',
    profilesKept: false,
    note: 'Self time is the sum of the sample deltas charged to a frame; a wasm frame is also charged to its nearest JS ancestor, which is how the wacc and dots rows are formed. The halves split the sampled window at its midpoint.',
    runs, spread, dotsUnderRecognize: recogDrop ? { controlMs: control.dotsFromRecognizeMs, newRuns: recogDrop } : null,
    previous,
  };
  const j = existsSync(VERDICT) ? JSON.parse(readFileSync(VERDICT, 'utf8')) : { at: live.at };
  j.live = live; j.mergedAt = live.at;
  writeFileSync(VERDICT, JSON.stringify(j, null, 2));
  console.log('');
  console.log('merged the live block into bench/verdicts/semantic-cleanup.json at ' + live.at);
}

// The semantic counters at the end of a live run, out of the checkpoint the run wrote. The
// file carries every pattern as well, so it is scanned in chunks for the one stats object
// whose keys are the semantic ones rather than parsed whole.
function semanticStatsOf(file) {
  if (!existsSync(file)) return null;
  const re = /"stats":\{"learned":(\d+),"merged":(\d+),"forgotten":(\d+),"dropped":(\d+),"cleanups":(\d+),"iterations":(\d+),"concepts":(\d+),"steps":(\d+),"nonzero":(\d+),"dominated":(\d+),"reusedSims":(\d+)\}/;
  const CHUNK = 1 << 23, OVERLAP = 4096;
  const fd = openSync(file, 'r');
  const buf = Buffer.alloc(CHUNK);
  let m = null, pos = 0, carry = '';
  try {
    for (;;) {
      const read = readSync(fd, buf, 0, CHUNK, pos);
      if (read <= 0) break;
      pos += read;
      const text = carry + buf.toString('latin1', 0, read);
      m = text.match(re);
      if (m) break;
      carry = text.slice(-OVERLAP);
    }
  } finally { closeSync(fd); }
  if (!m) return null;
  const keys = ['learned', 'merged', 'forgotten', 'dropped', 'cleanups', 'iterations', 'concepts', 'steps', 'nonzero', 'dominated', 'reusedSims'];
  const stats = {};
  keys.forEach((k, i) => { stats[k] = Number(m[i + 1]); });
  return { raw: m[0], ...stats };
}

// A .cpuprofile is a call tree plus a sample stream: samples[i] is the node the sampler saw
// and timeDeltas[i] is the time since the sample before it, so charging deltas[i] to
// samples[i] is the self time of that node. Frames are keyed by function and file:line, and
// a wasm frame is charged to its nearest JS ancestor as well, which is the only way to tell
// the wacc kernel from the dots kernel in the profile.
function parseProfile(file) {
  const p = JSON.parse(readFileSync(file, 'utf8'));
  const byId = new Map(), parent = new Map();
  for (const n of p.nodes) { byId.set(n.id, n); for (const c of n.children || []) parent.set(c, n.id); }
  const key = (n) => {
    const f = n.callFrame;
    const name = f.functionName || '(anonymous)';
    let url = f.url || '';
    if (url.startsWith('wasm://wasm/')) url = url.slice('wasm://wasm/'.length);
    else url = url.split(/[\\/]/).pop();
    return name + ' ' + url + ':' + ((f.lineNumber ?? -1) + 1);
  };
  const deltas = p.timeDeltas || [], samples = p.samples || [];
  let total = 0; for (const d of deltas) total += d;
  const half = total / 2;
  const selfOf = new Map();
  let t = 0;
  for (let i = 0; i < samples.length; i++) {
    const d = deltas[i] || 0; t += d;
    let r = selfOf.get(samples[i]);
    if (!r) { r = { us: 0, first: 0, second: 0 }; selfOf.set(samples[i], r); }
    r.us += d; if (t <= half) r.first += d; else r.second += d;
  }
  const add = (map, k, r) => {
    let row = map.get(k);
    if (!row) { row = { fn: k, selfMs: 0, firstHalfMs: 0, secondHalfMs: 0 }; map.set(k, row); }
    row.selfMs += r.us / 1000; row.firstHalfMs += r.first / 1000; row.secondHalfMs += r.second / 1000;
    return row;
  };
  // wasm frames, and the trampolines the engine inserts on the way in and out of them, are
  // not the caller anyone can read: the nearest ancestor that is neither is the JS function
  // that owns the kernel, which is what separates the wacc row from the dots row.
  const isWasm = (k) => k.startsWith('wasm-function') || k.startsWith('js-to-wasm') || k.startsWith('wasm-to-js');
  const rows = new Map(), kernelRows = new Map(), chainRows = new Map();
  let dotsFromRecognize = 0, dotsFromStep = 0;
  for (const [id, r] of selfOf) {
    const node = byId.get(id);
    if (!node) continue;
    const k = key(node);
    add(rows, k, r);
    if (!isWasm(k)) continue;
    // the ancestors, nearest first, and the first of them that is not itself wasm
    const chain = [];
    for (let cur = parent.get(id); cur !== undefined && chain.length < 4; cur = parent.get(cur)) chain.push(key(byId.get(cur)));
    const js = chain.find(c => !isWasm(c)) || '(no js ancestor):0';
    add(kernelRows, js, r);
    add(chainRows, k + ' | ' + chain.slice(0, 3).join(' <- '), r);
    // a dots scan is either the one inside a Hopfield step or the second one recognize used
    // to run over the whole population, and the nearer caller of the two says which
    if (js.startsWith('dots ')) {
      const iStep = chain.findIndex(c => c.startsWith('step semantic.mjs'));
      const iRec = chain.findIndex(c => c.startsWith('recognize semantic.mjs'));
      if (iStep >= 0 && (iRec < 0 || iStep < iRec)) dotsFromStep += r.us / 1000;
      else if (iRec >= 0) dotsFromRecognize += r.us / 1000;
    }
  }
  const sorted = [...rows.values()].sort((a, b) => b.selfMs - a.selfMs);
  const kernelOf = (prefix) => [...kernelRows.values()].filter(r => r.fn.startsWith(prefix)).sort((a, b) => b.selfMs - a.selfMs)[0] || null;
  return {
    sampledMs: total / 1000, samples: samples.length,
    topSelf: sorted.slice(0, 12),
    kernels: { wacc: kernelOf('wacc simd.mjs'), dots: kernelOf('dots simd.mjs') },
    dotsFromRecognizeMs: dotsFromRecognize, dotsFromStepMs: dotsFromStep,
    chains: [...chainRows.values()].sort((a, b) => b.selfMs - a.selfMs).slice(0, 12),
  };
}
