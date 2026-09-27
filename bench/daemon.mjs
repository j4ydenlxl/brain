#!/usr/bin/env node
// bench/daemon.mjs: THE BAR for the daemon (Board 10, his P5 "5 percent every second... self
// growing self improving self compressing self iterating" and P13 "lives 24/7, sandboxed").
//
// One organism, the 12-major whole brain, built fresh in state/daemon-bar, run twice by
// daemon/run.mjs live() with the loop on:
//   phase A  6 minutes wall under the caps: ledger=summary, a checkpoint every 1000 ticks, the
//            loop (generations, dream, spawn, ingest, self-code) every 200 ticks, and a ruler
//            row at every checkpoint
//   phase B  the same organism resumed for 2 minutes with ledger=full and a 50 MB budget, to
//            prove the rotation keeps the two segments under the budget while the full ledger
//            writes far past it (this phase writes well over 200 MB in total and rotates)
//
// Printed: ticks per second, steps run by kind (from the run and from the ledger file), ledger
// bytes written per 1000 ticks (every checkpoint step and the whole run, bar < 1 MB), checkpoint
// count and bytes, suite scores at the start and the end (exact path and carried by the
// organism's own cells), improvement per wall second, the same rates recomputed from
// ruler.jsonl alone and from the checkpoint header, the plateau signal, the rotation proof, and
// the peak resident set.
//
//   node bench/daemon.mjs            the bar: writes bench/verdicts/daemon.json once
//   node bench/daemon.mjs --quick    60 s + 20 s: writes daemon-partial.json (isTheBar false)
//   flags: --wall S --full-wall S --units N --tasks N (per suite; 1000 is every item) --seed S --quick --nowrite
//   --wait-free-gb N  the free-RAM wait before the run (default 16; a 16 GB host never has 16 GB
//                     free, so the cloud host passes 4; board 19 builder); not a narrowing flag
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const HEAP_MB = 4096;

// every process this bench is declares its heap: a bare `node bench/daemon.mjs` re-runs itself
// once with the flag and hands back the child's exit code
if (!process.execArgv.some((a) => a.startsWith('--max-old-space-size'))) {
  const r = spawnSync(process.execPath, ['--max-old-space-size=' + HEAP_MB, fileURLToPath(import.meta.url), ...process.argv.slice(2)], { stdio: 'inherit', windowsHide: true });
  process.exitCode = r.status ?? 1;
} else {
  await main();
}

// board 19 builder: the split the bar was measured on (the gate's CONTAMINATION row needs an object).
/** What the daemon bar developed on and what it graded: pure, from the run's suite options. */
export function splitFor(opts = {}) {
  // board 23 builder (item contamination-split): the reason names the suites the run scored, from its ruler
  const suites = Array.isArray(opts.suites) ? opts.suites.slice() : [];
  return {
    development: { what: 'the internal suites daemon/run.mjs makeSuiteRuler draws from bench/answer.mjs (algebra, sequence, grid); the loop spawn step asks the suite questions the last ruler found no held cell for', suites, tasksPerSuite: opts.tasks ?? null, seed: opts.seed ?? null },
    heldOut: { what: 'none: the start and end suite scores are read on the same suites the loop grows its cells on; the ledger, checkpoint and rotation parts of the bar are measurements of the run, not a graded set', n: 0 },
    contaminated: suites.length
      ? 'no held-out set: the improvement is scored on the suites the loop spawns cells for (' + suites.join(', ') + ')'
      : 'no suite was scored, so nothing was held out',
  };
}

async function main() {
  const BAR = Object.freeze({ wall: 360, fullWall: 120, units: 10_000, tasks: 1000, seed: 'whole', majors: 12, checkpointEvery: 1000, fullBudgetMb: 50 });
  const QUICK = { wall: 60, fullWall: 20 };
  const argv = process.argv.slice(2);
  const o = { ...BAR, nowrite: false, quick: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], v = argv[i + 1];
    if (a === '--nowrite') o.nowrite = true;
    else if (a === '--quick') { o.quick = true; Object.assign(o, QUICK); }
    else if (a === '--seed') { o.seed = String(v); i++; }
    else if (a === '--wall') { o.wall = Number(v); i++; }
    else if (a === '--full-wall') { o.fullWall = Number(v); i++; }
    else if (a === '--units') { o.units = Number(v); i++; }
    else if (a === '--tasks') { o.tasks = Number(v); i++; }
    else if (a === '--wait-free-gb') { o.waitFreeGb = Number(v); i++; }
    else throw new Error('daemon bench: unknown flag ' + a);
  }
  const narrow = ['wall', 'fullWall', 'units', 'tasks', 'seed'].some((k) => o[k] !== BAR[k]);
  const MB = 1024 * 1024, GB = 1024 * MB;
  const say = (l) => console.log(l);
  const fmt = (n) => (Number.isFinite(n) ? Number(n).toLocaleString('en-US') : String(n));
  const mb = (b) => (b / MB).toFixed(2) + ' MB';
  const t0 = Date.now();

  // free memory first: eight builders share the machine, so under 16 GB free this waits
  for (;;) {
    const free = os.freemem();
    const waitGb = o.waitFreeGb ?? 16;
    if (free >= waitGb * GB) { say('[ram] free ' + (free / GB).toFixed(2) + ' GB of ' + (os.totalmem() / GB).toFixed(2) + ' GB, heap cap ' + HEAP_MB + ' MB'); break; }
    say('[ram] free ' + (free / GB).toFixed(2) + ' GB is under ' + waitGb + ' GB: waiting 30 s');
    await new Promise((r) => setTimeout(r, 30_000));
  }

  const STATE = path.join(ROOT, 'state', 'daemon-bar');
  rmSync(STATE, { recursive: true, force: true });
  mkdirSync(STATE, { recursive: true });
  process.env.BRAIN_STATE_DIR = STATE;
  delete process.env.BRAIN_LEDGER_BUDGET_MB;
  const D = await import(pathToFileURL(path.join(ROOT, 'daemon', 'run.mjs')).href);
  const flag = D.raiseBenchFlag({ command: 'node bench/daemon.mjs ' + argv.join(' ') });

  let peakRss = 0;
  const rssTimer = setInterval(() => { const r = process.memoryUsage().rss; if (r > peakRss) peakRss = r; }, 250);
  const common = {
    name: 'bar', majors: o.majors, substrateUnits: o.units, seed: o.seed, checkpointEvery: o.checkpointEvery,
    selfEvery: 0, selfCodeDry: true, selfCodeSources: ['gate', 'notes', 'slow', 'mutants'], suiteTasks: o.tasks,
  };
  const keep = (phase) => (l) => {
    if (l.startsWith('[live] t=')) return;
    if (l.startsWith('[ledger]') && phase === 'A') return;
    if (l.startsWith('[ruler]') || l.startsWith('[ledger]') || l.startsWith('[loop]') || l.startsWith('[self-code]') || l.startsWith('[live]') || l.startsWith('[gen') || l.startsWith('[self]')) say('  ' + phase + ' ' + l.slice(0, 400));
  };

  let verdict = null, failure = null;
  try {
    // ------------------------------------------------------------ phase A: the caps
    say('[phase A] fresh build, ' + o.majors + ' majors, ' + fmt(o.units) + ' units, ' + o.wall + ' s wall, ledger=summary, checkpoint every ' + o.checkpointEvery + ' ticks, ' + o.tasks + ' questions per suite');
    const a = await D.live({ ...common, wallMs: o.wall * 1000, ledger: 'summary', out: keep('A') });
    const aRows = D.readRuler(a.dir).filter((r) => r.run === a.ruler.run);
    const aSteps = aRows.slice(1).map((r) => r.step);
    const per1000 = aSteps.map((s) => s.ledgerBytesPer1000Ticks).filter(Number.isFinite);
    const ledgerRows = readJsonl(path.join(a.dir, 'ledger', 'ledger.jsonl'));
    const stepRows = {};
    for (const r of ledgerRows) if (r.type === 'daemon.step') { const k = r.kind + (r.refused ? ' refused' : ''); stepRows[k] = (stepRows[k] || 0) + 1; }
    // board 23 builder (item contamination-split, fix pass): why each self-code step was refused, read
    // from the ledger file on disk (daemon/run.mjs notes every refusal with its reason), and the floor
    // it was held to, so a red everyStepKind names its cause in the verdict and not only on stdout
    const selfCodeRefusals = ledgerRows.filter((r) => r.type === 'daemon.step' && r.kind === 'self-code' && r.refused)
      .map((r) => ({ t: r.t, refused: r.refused, why: r.why ?? r.reason ?? (r.refused === 'bench' ? 'a bench is running (pid ' + r.flagPid + ')' : null) }));
    const fitSelf = a.fit && a.fit.selfCode ? a.fit.selfCode : null;
    const selfCodeFit = a.fit ? { floorMb: a.fit.floorMb ?? null, floorFrom: a.fit.floorFrom ?? null, starts: fitSelf ? fitSelf.starts : null, refusals: fitSelf ? fitSelf.refusals : null, needMb: fitSelf ? fitSelf.needMb : null, needFrom: fitSelf ? fitSelf.needFrom : null, lastRefusal: fitSelf ? fitSelf.lastRefusal : null } : null;
    const first = a.ruler.first, last = a.ruler.last;
    const wholeLedger = last.done > first.done ? Math.round((last.bytes.ledgerWritten - first.bytes.ledgerWritten) / (last.done - first.done) * 1000) : null;
    const fileAfterA = sizeOf(path.join(a.dir, 'ledger', 'ledger.jsonl'));
    const fromDisk = D.rulerRates(aRows);
    const ratesEqual = isDeepStrictEqual(fromDisk, a.ruler.rates);
    const head = D.checkpointRuler(a.snapshot);
    const headOk = !!head && head.k === last.k && isDeepStrictEqual(head.scores, last.scores) && head.bytes === sizeOf(a.snapshot);
    const replay = (await D.replayPlateau(D.readRuler(a.dir))).state;
    const plateauOk = replay.mode === a.ruler.plateau.mode && isDeepStrictEqual(replay.fired, a.ruler.plateau.fired);
    const tps = a.runner.ticksPerSec;
    const A = {
      wallS: r3(a.runner.wallMs / 1000), stoppedBy: a.runner.reason, ticks: a.runner.done, ticksPerSec: tps,
      steps: a.loop.steps, refused: a.loop.refused, stepMs: a.loop.stepMs, stepRowsOnDisk: stepRows, periods: a.loop.periods, skippedForAsk: a.loop.skippedForAsk,
      dream: a.loop.dream, spawn: a.loop.spawn, ingest: a.loop.ingest, selfCode: { every: a.loop.selfCode.every, dry: a.loop.selfCode.dry, last: a.loop.selfCode.last, errors: a.loop.selfCode.errors },
      selfCodeRefusals, selfCodeFit,
      generations: { steps: a.generations.steps, best: a.generations.best, promotions: a.generations.promotions.length, errors: a.generations.errors },
      ledger: { mode: a.ledger.mode, bytesWritten: a.ledger.bytesWritten, fileBytes: fileAfterA, per1000Max: per1000.length ? Math.max(...per1000) : null, per1000Median: median(per1000), per1000Whole: wholeLedger, rows: ledgerRows.length },
      checkpoints: { count: a.checkpoints, errors: a.checkpointErrors, bytesTotal: a.checkpointBytes.total, bytesLast: a.checkpointBytes.last },
      suites: { start: first.scores, end: last.scores, startTotal: first.total, endTotal: last.total },
      perWallSecond: fromDisk.whole, rulerRows: aRows.length, rulerMs: a.ruler.ms,
      plateau: a.ruler.plateau, reproducible: { ratesFromDisk: ratesEqual, checkpointHeader: headOk, plateauReplay: plateauOk },
      errors: [...a.loop.errors, ...a.ruler.errors],
    };
    say('');
    say('[A] ' + fmt(A.ticks) + ' ticks in ' + A.wallS + ' s wall (stopped by ' + A.stoppedBy + '): ' + tps + ' ticks/s');
    say('[A] steps: ' + D.STEP_KINDS.map((k) => k + ' ' + A.steps[k]).join(', ') + ' | refused: ' + (D.STEP_KINDS.filter((k) => A.refused[k]).map((k) => k + ' ' + A.refused[k]).join(', ') || 'none') + ' | periods ' + A.periods + ', skipped for an ask ' + A.skippedForAsk);
    say('[A] step rows in the ledger file: ' + JSON.stringify(stepRows));
    say('[A] step wall ms: ' + JSON.stringify(A.stepMs) + ' | dream cycles ' + JSON.stringify(A.dream) + ' | spawn carried ' + A.spawn.carried + ' grew ' + A.spawn.grew + ' | ingest added ' + A.ingest.added + ' | generations promotions ' + A.generations.promotions);
    say('[A] self-code: ' + (A.selfCode.last ? JSON.stringify(A.selfCode.last).slice(0, 300) : 'none') + (A.selfCode.errors.length ? ' errors ' + A.selfCode.errors.join(' | ') : ''));
    say('[A] self-code refusals in the ledger file: ' + selfCodeRefusals.length + (selfCodeRefusals.length ? ' [' + selfCodeRefusals.map((x) => 't=' + x.t + ' ' + x.refused + ': ' + x.why).join('; ') + ']' : '') + '; floor ' + (selfCodeFit ? selfCodeFit.floorMb + ' MB from ' + selfCodeFit.floorFrom + ', starts ' + selfCodeFit.starts + ', need ' + selfCodeFit.needMb + ' MB (' + selfCodeFit.needFrom + ')' : 'not reported'));
    say('[A] ledger ' + A.ledger.mode + ': ' + fmt(A.ledger.bytesWritten) + ' B written, file ' + fmt(A.ledger.fileBytes) + ' B, ' + A.ledger.rows + ' rows; per 1000 ticks: max ' + fmt(A.ledger.per1000Max) + ' B, median ' + fmt(A.ledger.per1000Median) + ' B, whole run ' + fmt(A.ledger.per1000Whole) + ' B (bar < ' + fmt(MB) + ' B)');
    say('[A] checkpoints ' + A.checkpoints.count + ' (errors ' + A.checkpoints.errors + '): ' + fmt(A.checkpoints.bytesTotal) + ' B written in total, last ' + fmt(A.checkpoints.bytesLast) + ' B');
    for (const s of D.SUITES) say('[A] ' + s + ': exact ' + first.scores[s].exact + '/' + first.scores[s].n + ' -> ' + last.scores[s].exact + '/' + last.scores[s].n + ', carried by its own cells ' + first.scores[s].carried + '/' + first.scores[s].n + ' -> ' + last.scores[s].carried + '/' + last.scores[s].n);
    say('[A] improvement per wall second over ' + (A.perWallSecond && A.perWallSecond.seconds) + ' s: exact ' + (A.perWallSecond && A.perWallSecond.exact) + ', carried ' + (A.perWallSecond && A.perWallSecond.carried) + ' (fraction of ' + last.total.n + ' questions per s)');
    say('[A] from disk: ruler.jsonl ' + aRows.length + ' rows, rates recomputed ' + (ratesEqual ? 'EQUAL' : 'DIFFERENT') + '; checkpoint header k=' + (head && head.k) + ' ' + (headOk ? 'matches' : 'DOES NOT match') + ' the last row; plateau replay ' + (plateauOk ? 'matches' : 'DIFFERS'));
    say('[A] plateau: mode ' + A.plateau.mode + ', arm ' + A.plateau.arm + ', fired ' + (A.plateau.fired.join(',') || 'none') + ', switches ' + A.plateau.switchCount + (A.plateau.switches.length ? ' [' + A.plateau.switches.map((w) => 'k=' + w.k + ' to ' + w.to).join('; ') + ']' : ''));
    if (A.errors.length) say('[A] errors: ' + A.errors.join(' | '));

    // ------------------------------------------------------------ phase B: full ledger, 50 MB budget
    const budget = o.fullBudgetMb * MB;
    say('');
    say('[phase B] resume, ' + o.fullWall + ' s wall, ledger=full, --ledger-budget-mb ' + o.fullBudgetMb + ' (' + fmt(budget) + ' B)');
    const lf = path.join(a.dir, 'ledger', 'ledger.jsonl'), lp = path.join(a.dir, 'ledger', 'ledger.1.jsonl');
    const poll = { samples: 0, maxLive: 0, maxPrev: 0, maxSum: 0 };
    const poller = setInterval(() => { const x = sizeOf(lf), y = sizeOf(lp); poll.samples++; poll.maxLive = Math.max(poll.maxLive, x); poll.maxPrev = Math.max(poll.maxPrev, y); poll.maxSum = Math.max(poll.maxSum, x + y); }, 100);
    let b;
    try { b = await D.live({ ...common, wallMs: o.fullWall * 1000, ledger: 'full', ledgerBudgetMb: o.fullBudgetMb, out: keep('B') }); }
    finally { clearInterval(poller); }
    const endLive = sizeOf(lf), endPrev = sizeOf(lp);
    const bRows = D.readRuler(b.dir).filter((r) => r.run === b.ruler.run);
    const bPer1000 = bRows.slice(1).map((r) => r.step.ledgerBytesPer1000Ticks).filter(Number.isFinite);
    const B = {
      wallS: r3(b.runner.wallMs / 1000), stoppedBy: b.runner.reason, ticks: b.runner.done, ticksPerSec: b.runner.ticksPerSec, resumedAt: b.start.t,
      ledger: { mode: b.ledger.mode, budgetMb: b.ledger.budgetMb, budgetFrom: b.ledger.budgetFrom, budgetBytes: b.ledger.budgetBytes, bytesWritten: b.ledger.bytesWritten, linesWritten: b.ledger.linesWritten, rotations: b.ledger.rotations, rotateErrors: b.ledger.rotateErrors, maxDiskBytes: b.ledger.maxDiskBytes, endLive, endPrev, endSum: endLive + endPrev, poll, per1000Median: median(bPer1000) },
      steps: b.loop.steps, checkpoints: b.checkpoints, rulerRows: bRows.length, suitesEnd: b.ruler.last ? b.ruler.last.total : null, errors: [...b.loop.errors, ...b.ruler.errors],
    };
    const rotationHeld = B.ledger.mode === 'full' && B.ledger.rotations >= 1 && B.ledger.bytesWritten > budget && B.ledger.maxDiskBytes <= budget && B.ledger.poll.maxSum <= budget && B.ledger.endSum <= budget;
    say('');
    say('[B] ' + fmt(B.ticks) + ' ticks in ' + B.wallS + ' s wall (stopped by ' + B.stoppedBy + '): ' + B.ticksPerSec + ' ticks/s, resumed at t=' + B.resumedAt);
    say('[B] ledger ' + B.ledger.mode + ' budget ' + B.ledger.budgetMb + ' MB from ' + B.ledger.budgetFrom + ': ' + fmt(B.ledger.bytesWritten) + ' B written (' + mb(B.ledger.bytesWritten) + '), ' + fmt(B.ledger.linesWritten) + ' lines, rotations ' + B.ledger.rotations + ' (errors ' + B.ledger.rotateErrors + '), median ' + fmt(B.ledger.per1000Median) + ' B per 1000 ticks');
    say('[B] two segments on disk: high-water mark ' + fmt(B.ledger.maxDiskBytes) + ' B (measured at every write), polled max ' + fmt(poll.maxSum) + ' B over ' + poll.samples + ' reads (live ' + fmt(poll.maxLive) + ', previous ' + fmt(poll.maxPrev) + '), at the end ' + fmt(B.ledger.endSum) + ' B; budget ' + fmt(budget) + ' B: ' + (rotationHeld ? 'HELD' : 'NOT HELD'));
    if (B.errors.length) say('[B] errors: ' + B.errors.join(' | '));

    clearInterval(rssTimer);
    const maxRssMb = Math.round(process.resourceUsage().maxRSS / 1024);
    const peakSampledMb = Math.round(peakRss / MB);
    say('');
    say('[rss] peak ' + maxRssMb + ' MB (process maxRSS, workers included), sampled peak ' + peakSampledMb + ' MB, heap cap ' + HEAP_MB + ' MB');

    const met = {
      phaseAWall: A.stoppedBy === 'wall' && A.wallS >= o.wall * 0.98,
      ledgerUnder1MbPer1000: Number.isFinite(A.ledger.per1000Max) && A.ledger.per1000Max < MB && Number.isFinite(A.ledger.per1000Whole) && A.ledger.per1000Whole < MB,
      summaryMode: A.ledger.mode === 'summary',
      everyStepKind: D.STEP_KINDS.every((k) => A.steps[k] >= 1),
      rulerReproducible: ratesEqual && headOk && plateauOk,
      phaseBWall: B.stoppedBy === 'wall' && B.wallS >= o.fullWall * 0.98,
      rotationHeld,
    };
    const barMet = Object.values(met).every(Boolean);
    const isTheBar = !narrow;
    const pw = A.perWallSecond || {};
    const lastWhy = A.selfCodeRefusals.length ? A.selfCodeRefusals[A.selfCodeRefusals.length - 1].why : null;
    const statement = 'The 12-major organism (' + fmt(o.units) + ' substrate units) was built fresh and run by daemon/run.mjs with the loop on for ' + A.wallS + ' s of wall time under the caps: '
      + fmt(A.ticks) + ' ticks at ' + tps + ' ticks per second, ledger=summary, ' + A.checkpoints.count + ' checkpoints (' + fmt(A.checkpoints.bytesTotal) + ' bytes written, the last ' + fmt(A.checkpoints.bytesLast) + '). '
      + 'Steps run: ' + D.STEP_KINDS.map((k) => k + ' ' + A.steps[k]).join(', ') + (A.refused['self-code'] ? ', self-code refused ' + A.refused['self-code'] + (lastWhy ? ' (the last refusal, from the ledger file: ' + lastWhy + ')' : '') : '') + '. '
      + 'The summary ledger wrote at most ' + fmt(A.ledger.per1000Max) + ' bytes per 1000 ticks over any checkpoint step and ' + fmt(A.ledger.per1000Whole) + ' over the whole run, against a bar of 1 MB. '
      + 'On ' + last.total.n + ' suite questions (algebra ' + last.scores.algebra.n + ', sequence ' + last.scores.sequence.n + ', grid ' + last.scores.grid.n + ', at most ' + o.tasks + ' per suite) the exact path answered ' + first.total.exact + ' at the start and ' + last.total.exact + ' at the end, and the organism\'s own spawned cells carried ' + first.total.carried + ' at the start and ' + last.total.carried + ' at the end: '
      + 'improvement per wall second ' + pw.exact + ' (exact) and ' + pw.carried + ' (carried) as a fraction of the suite, recomputed ' + (ratesEqual ? 'identically' : 'DIFFERENTLY') + ' from ruler.jsonl alone. '
      + 'The plateau signal ended in mode ' + A.plateau.mode + ' with ' + A.plateau.switchCount + ' switches and fired coordinates ' + (A.plateau.fired.join(', ') || 'none') + '. '
      + 'Resumed for ' + B.wallS + ' s with ledger=full and a 50 MB budget, the ledger wrote ' + fmt(B.ledger.bytesWritten) + ' bytes, rotated ' + B.ledger.rotations + ' times, and its two segments never held more than ' + fmt(B.ledger.maxDiskBytes) + ' bytes against a budget of ' + fmt(budget) + '. '
      + 'Peak resident set ' + maxRssMb + ' MB. ' + (barMet ? 'Every part of the bar was met.' : 'Not met: ' + Object.entries(met).filter(([, v]) => !v).map(([k]) => k).join(', ') + '.');
    verdict = {
      name: 'daemon', at: new Date().toISOString(), command: ['node', 'bench/daemon.mjs', ...argv].join(' '), execArgv: process.execArgv, node: process.version,
      isTheBar, barMet, met, contaminated: null, statement,
      split: splitFor({ tasks: o.tasks, seed: o.seed, suites: Object.keys(last.scores || {}) }),
      bar: { ...BAR, ledgerPer1000TicksBytes: MB }, run: { ...o },
      phaseA: A, phaseB: B, peakRssMb: maxRssMb, peakRssSampledMb: peakSampledMb,
      machine: { platform: process.platform, cpus: os.cpus().length, totalMemMB: Math.round(os.totalmem() / MB), freeMemMB: Math.round(os.freemem() / MB) },
      totalWallS: r3((Date.now() - t0) / 1000),
      note: 'notes/daemon.md',
    };
    // board 23 fix pass: the gate counts contaminated only when it is true, so a reason in the split is marked at the top level and said in the statement
    verdict.contaminated = typeof verdict.split.contaminated === 'string';
    if (verdict.contaminated) verdict.statement += ' Contaminated: ' + verdict.split.contaminated + '.';
    say('[split] contaminated ' + (verdict.contaminated ? verdict.split.contaminated : 'false'));
    say('');
    say('[bar] ' + (barMet ? 'MET' : 'NOT MET') + ': ' + Object.entries(met).map(([k, v]) => k + ' ' + (v ? 'yes' : 'NO')).join(', '));
  } catch (e) {
    failure = e;
    say('[bench] failed: ' + String(e && e.stack || e));
  } finally {
    clearInterval(rssTimer);
    flag.lower();
    rmSync(STATE, { recursive: true, force: true });
    say('[state] ' + path.relative(ROOT, STATE).split(path.sep).join('/') + ' deleted: ' + !existsSync(STATE));
  }

  if (!verdict) {
    verdict = { name: 'daemon', at: new Date().toISOString(), command: ['node', 'bench/daemon.mjs', ...argv].join(' '), node: process.version, isTheBar: false, barMet: false, statement: 'The daemon bench stopped before it finished: ' + String(failure && failure.message || failure).split('\n')[0], error: String(failure && failure.stack || failure) };
  }
  if (!o.nowrite) {
    const dir = path.join(HERE, 'verdicts');
    mkdirSync(dir, { recursive: true });
    const file = path.join(dir, verdict.isTheBar ? 'daemon.json' : 'daemon-partial.json');
    writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
    say('[verdict] ' + path.relative(ROOT, file).split(path.sep).join('/') + ' (isTheBar ' + verdict.isTheBar + ', barMet ' + verdict.barMet + ')');
  }
  if (failure) process.exitCode = 1;
}

function readJsonl(file) {
  if (!existsSync(file)) return [];
  const out = [];
  for (const line of readFileSync(file, 'utf8').split('\n')) { if (!line.trim()) continue; try { out.push(JSON.parse(line)); } catch { /* a torn last line */ } }
  return out;
}
function sizeOf(f) { try { return statSync(f).size; } catch { return 0; } }
function r3(x) { return Number.isFinite(x) ? Math.round(x * 1e3) / 1e3 : null; }
function median(xs) { const s = xs.filter(Number.isFinite).sort((p, q) => p - q); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : Math.round((s[n / 2 - 1] + s[n / 2]) / 2)) : null; }
