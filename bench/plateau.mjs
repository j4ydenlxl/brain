// bench/plateau.mjs: THE PLATEAU, MEASURED ON FIVE SEEDS, AND THREE INTERVENTIONS GRADED ON FRESH SEEDS.
//
// generations/plateau.mjs holds the planes, the loop and the three interventions. This bench:
//
//   (a) MEASURE   the control (all three switches off) on the tuning seeds, both planes (the grid
//                 plane's held-out draw, the synthetic cover plane's fresh draw), for a GENERATION
//                 budget (P.BUDGET: every arm runs the same number of generations of each plane, a
//                 row every rowEveryGens generations): per seed the plateau (the last rise of the
//                 held-out score: after it the score never rises again) as a generation and as the
//                 wall second it fell on, the score there, the final score, and the seed-to-seed
//                 noise (sample sd) of the final score.
//   (b) SINGLES   NOVELTY, TRANSFER and RESTART, each on the same tuning seeds, run side by side
//                 with the control of the same seed (one worker thread per arm): per plane the final
//                 held-out score against the control's, the score gained per million organism-years
//                 after the control's plateau generation, and the plateau under the intervention.
//   (c) FRESH     the combination the singles say is best (chooseCombination, a rule written
//                 before any run) against the control on five FRESH seeds, on planes built from
//                 fresh task seeds only after (b) has finished. Nothing in (a) or (b) ever built
//                 or read them.
//
// THE GENERATION BUDGET (board 26, item plateau-repeat). The bar used to be cut by the wall clock, so
// on a shared machine a re-run of the same seed drew a different search and moved the verdict (the
// verify plane re-ran it and the synthetic plateau comparison flipped). Now every arm runs exactly
// --generations generations of each plane (default P.BUDGET.generations, the control's measured
// median of the last wall-budget bar run), its rows and its restart clock count generations, and the
// same seed draws the same search. Wall time is printed, never budgeted.
//
// THE BAR: barMet is true only when the combination on the fresh seeds beats the control's final
// held-out score by more than the seed-to-seed noise (the larger sample sd of the two arms) on BOTH
// planes AND its mean plateau generation is later than the control's on both, AND THE REPEAT holds:
// the bar command run back to back on this build (the second run carries the first through the
// re-run ledger below) moved the combination-minus-control difference by less than the smallest
// seed noise on every plane. Otherwise false, with every number printed.
//
//   node bench/plateau.mjs [--generations 241675] [--row-gens 200] [--restart-gens N]
//                          [--tune-seeds 5] [--arm-seeds 5] [--fresh-seeds 5] [--concurrency 8]
//                          [--wait-free-mb 8000] [--no-fresh] [--smoke]
//                          [--wall-s S [--restart-s 12]]   (a wall-budget partial run, as before)
//
//   --no-fresh  a development run: (a) and (b) on the tuning seeds, then stop; the held-out seeds
//               and planes are never built (with --arm-seeds 0 it runs the controls alone)
//   --smoke     runs (c) and the verdict on the smoke namespace (smoke-N, plateau/smoke/*) instead
//               of the held-out one, so the whole path is exercised without touching held-out data
//
// After each run the control's final archive is scored on the held-out draw FOR THE REPORT ONLY
// (generations/plateau.mjs archiveHeldout): the oracle elite, the Spearman of searched fitness
// against held-out over the top 50, and a held-out-free pick (the best worst-draw count). No
// decision reads any of it.
//
// THE RE-RUN LEDGER AND THE REPEAT. The bench hashes every file it loads (generations/plateau.mjs
// sourceClosure) at the start and again before the verdict. A bar run carries forward the ledger
// entries of the bar verdict it replaces that share its build hash, appends its own (with a digest of
// the search it drew, P.searchDigest), and prints per plane every carried run's difference, noise and
// plateau, and how far each moved (P.repeatOf). With one run of a build the repeat is not measured
// and barMet is false.
//
// THE STATEMENT names only numbers the run printed: it is built from the same values with the same
// formats, and before it is written P.statementNumbers checks every number in it against the lines
// printed above it; a number no line printed is named and makes the exit code 1.
//
// With no flags this is the bar and writes bench/verdicts/plateau.json with isTheBar true. Any
// flag but --wait-free-mb makes a different run, written to bench/verdicts/plateau-partial.json
// with isTheBar false. Run it through tools/budget.mjs. It re-runs itself under a 4000 MB heap cap
// when started without one, waits while under 8000 MB is free before every batch, and is ONE
// process: its arms are worker threads (at most --concurrency at once). No model is called.
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const HEAP_MB = 4000;
const ROW_MS = 100; // a wall-budget partial run (--wall-s) writes a row every 100 ms of wall

if (!process.execArgv.some((a) => a.startsWith('--max-old-space-size'))) {
  const r = spawnSync(process.execPath, ['--max-old-space-size=' + HEAP_MB, fileURLToPath(import.meta.url), ...process.argv.slice(2)], { stdio: 'inherit', windowsHide: true });
  process.exit(r.status === null ? 1 : r.status);
}

const P = await import('../generations/plateau.mjs');
// THE BUILD this run measures: every file the bench loads, hashed at the start and again before the
// verdict is written (generations/plateau.mjs sourceClosure). Bar runs of one build are carried in
// the verdict's re-run ledger, so a re-run's spread is a measurement, not a sentence.
const BUILD0 = P.sourceClosure([fileURLToPath(import.meta.url)], ROOT);

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const flags = argv.filter((a) => a.startsWith('--')).map((a) => a.slice(2)).filter((f) => f !== 'wait-free-mb');
const isTheBar = flags.length === 0;
const OUT = path.join(ROOT, 'bench', 'verdicts', isTheBar ? 'plateau.json' : 'plateau-partial.json');

const WALL = argv.includes('--wall-s');
const DEFAULTS = Object.freeze({ generations: P.BUDGET.generations, rowGens: P.BUDGET.rowEveryGens, restartShare: P.RESTART.restartShare, restartS: P.RESTART.restartMs / 1000, tuneSeeds: 5, armSeeds: 5, freshSeeds: 5, concurrency: 8, waitFreeMb: 8000 });
const gens0 = WALL ? null : Number(opt('generations', DEFAULTS.generations));
const cfg = {
  budget: WALL ? 'wall' : 'generations',
  generations: gens0,
  rowGens: WALL ? null : Number(opt('row-gens', Math.max(1, Math.round(gens0 * P.BUDGET.rowEveryGens / P.BUDGET.generations)))),
  restartGens: WALL ? null : Number(opt('restart-gens', Math.max(1, Math.round(gens0 * DEFAULTS.restartShare)))),
  wallS: WALL ? Number(opt('wall-s', NaN)) : null,
  restartS: WALL ? Number(opt('restart-s', DEFAULTS.restartS)) : null,
  tuneSeeds: Number(opt('tune-seeds', DEFAULTS.tuneSeeds)),
  armSeeds: Number(opt('arm-seeds', DEFAULTS.armSeeds)),
  freshSeeds: Number(opt('fresh-seeds', DEFAULTS.freshSeeds)),
  concurrency: Number(opt('concurrency', DEFAULTS.concurrency)),
  waitFreeMb: Number(opt('wait-free-mb', DEFAULTS.waitFreeMb)),
};
const whole = (x) => Number.isInteger(x) && x >= 1;
if (WALL ? !(cfg.wallS > 0 && cfg.restartS > 0) : !(whole(cfg.generations) && whole(cfg.rowGens) && whole(cfg.restartGens))) throw new Error('bad budget flags');
if (!(cfg.tuneSeeds >= 1) || !(cfg.armSeeds >= (argv.includes('--no-fresh') ? 0 : 1)) || !(cfg.freshSeeds >= 2) || !(cfg.concurrency >= 1)) throw new Error('bad flags');
cfg.armSeeds = Math.min(cfg.armSeeds, cfg.tuneSeeds);
const AXIS = WALL ? 'tMs' : 'gen';

// THE SEEDS (generations/plateau.mjs SPLIT). The tuning seeds and planes are the development split;
// the held-out seeds and planes ('heldout-N', plateau/heldout/*) are held out. The held-out namespace
// is not 'fresh': a 3 s smoke run of an earlier build ran fresh-1, fresh-2 on plateau/fresh/*, so
// those strings are RETIRED and the split check below refuses them. No development run of this
// build touched the held-out strings: --no-fresh, the flag every tuning run used, stops before (c).
const TUNE = P.runSeeds('tune', cfg.tuneSeeds);
const SMOKE = argv.includes('--smoke');
const HELD = SMOKE ? 'smoke' : 'heldout';
const FRESH = P.runSeeds(HELD, cfg.freshSeeds);
const PLANE_SEEDS = { tune: { grid: P.SPLIT.tune.grid, synthetic: P.SPLIT.tune.synthetic }, fresh: { grid: P.SPLIT[HELD].grid, synthetic: P.SPLIT[HELD].synthetic } };
const RETIRED = P.SPLIT.retired;
{
  const t = P.splitSeedStrings('tune', cfg.tuneSeeds), h = P.splitSeedStrings('heldout', cfg.freshSeeds), sm = P.splitSeedStrings('smoke', cfg.freshSeeds), r = P.retiredSeedStrings();
  const bad = [...t].filter((x) => h.has(x) || r.has(x) || sm.has(x)).concat([...h].filter((x) => r.has(x) || sm.has(x)));
  if (bad.length) throw new Error('the split is not disjoint: ' + bad.join(', '));
}
const NO_FRESH = argv.includes('--no-fresh');

// every line the run prints is kept, so the statement can be checked against what was printed
const PRINTED = [];
const say = (s) => { PRINTED.push(s); console.log(s); };
const f1 = (x) => (x === null || x === undefined ? 'n/a' : Number(x).toFixed(1));
const f2 = (x) => (x === null || x === undefined ? 'n/a' : Number(x).toFixed(2));
const f3 = (x) => (x === null || x === undefined ? 'n/a' : Number(x).toFixed(3));
// plateau seconds print at 0.01 s: two means 20 ms apart must not both print as the same tenth
const s2 = (ms) => f2(ms / 1000);
const big = (x) => (x === null || x === undefined ? 'n/a' : Math.round(x).toLocaleString('en-US'));
const freeMb = () => Math.round(os.freemem() / 1048576);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const T_START = Date.now();

// the budget in words: printed once in the run line and reused verbatim by the statement
const BUDGET_WORDS = WALL
  ? cfg.wallS + ' wall seconds per run (a wall budget: a re-run draws a different search)'
  : big(cfg.generations) + ' generations of each plane per run (a generation budget: the same seed draws the same search; wall time is printed, never budgeted)';
const ROW_WORDS = WALL ? 'a row every ' + ROW_MS + ' ms of wall' : 'a row every ' + big(cfg.rowGens) + ' generations';
const RESTART_WORDS = WALL ? cfg.restartS + ' s' : big(cfg.restartGens) + ' generations';
// a plateau in the words of this run's axis: the generation (the bar's axis) and the wall second it fell on
const plWords = (genStat, msStat) => (WALL ? s2(msStat) + ' s' : 'generation ' + big(genStat) + ' (' + s2(msStat) + ' s)');

async function waitForRam(label) {
  let waited = 0;
  while (freeMb() < cfg.waitFreeMb) {
    if (waited % 30000 === 0) say('[ram] ' + label + ': ' + freeMb() + ' MB free, under ' + cfg.waitFreeMb + ' MB: waiting');
    await sleep(5000); waited += 5000;
  }
  return waited;
}

function planeWire(pl) { return { searched: P.matrixToWire(pl.searched), fresh: P.matrixToWire(pl.fresh) }; }
function planeMeta(pl) {
  return { kind: pl.kind, seed: pl.seed, searchedSeeds: pl.seeds, freshSeed: pl.freshSeed, components: pl.searched.C, tasksSearched: pl.searched.T, draws: pl.searched.draws, tasksHeldout: pl.fresh.T, unionSearched: pl.searched.unionBound(), unionHeldout: pl.fresh.unionBound(), buildMs: pl.buildMs, options: pl.options || null };
}

function buildPlanes(side) {
  const g = P.gridPlane({ seed: PLANE_SEEDS[side].grid });
  const c = P.coverPlane({ seed: PLANE_SEEDS[side].synthetic });
  for (const pl of [g, c]) say('[planes ' + side + '] ' + pl.kind + ' ' + pl.seed + ': ' + P.describePlane(pl, P.LMAX[pl.kind]) + '; ' + pl.searched.T + ' searched tasks, union ' + pl.searched.unionBound() + '; held-out ' + pl.freshSeed + ' ' + pl.fresh.T + ' tasks, union ' + pl.fresh.unionBound() + '; built in ' + f1(pl.buildMs) + ' ms');
  return { grid: g, synthetic: c };
}

/** Every seed string one side's planes and runs touch. */
function seedSet(side, runSeeds, planes) {
  const s = new Set(runSeeds);
  for (const pl of Object.values(planes)) { s.add(pl.seed); for (const x of pl.seeds) s.add(x); s.add(pl.freshSeed); }
  return s;
}

// batches: all arms of one seed run together; seeds are packed while the batch has room
function batches(jobs) {
  const bySeed = new Map();
  for (const j of jobs) { if (!bySeed.has(j.seed)) bySeed.set(j.seed, []); bySeed.get(j.seed).push(j); }
  const out = [];
  let cur = [];
  for (const group of bySeed.values()) {
    if (cur.length && cur.length + group.length > cfg.concurrency) { out.push(cur); cur = []; }
    cur.push(...group);
  }
  if (cur.length) out.push(cur);
  return out;
}

const budgetOf = () => (WALL ? { wallMs: cfg.wallS * 1000, restartMs: cfg.restartS * 1000, rowEveryMs: ROW_MS } : { generations: cfg.generations, rowEveryGens: cfg.rowGens, restartGens: cfg.restartGens });

async function runPhase(label, planes, jobs) {
  const wire = { grid: planeWire(planes.grid), synthetic: planeWire(planes.synthetic) };
  const results = [];
  const bs = batches(jobs);
  for (let i = 0; i < bs.length; i++) {
    const b = bs[i];
    const waited = await waitForRam(label + ' batch ' + (i + 1));
    const t0 = Date.now();
    say('[' + label + '] batch ' + (i + 1) + '/' + bs.length + ': ' + b.map((j) => j.seed + ' ' + P.armName(j.arm)).join(', ') + ' (' + b.length + ' worker threads at once, ' + freeMb() + ' MB free' + (waited ? ', waited ' + (waited / 1000) + ' s' : '') + ')');
    const rs = await P.runJobs(b.map((j) => ({ planes: wire, arm: j.arm, seed: j.seed, ...budgetOf() })));
    for (const r of rs) {
      results.push(r);
      const g = r.planes.grid, c = r.planes.synthetic;
      const line = (k, x) => k + ' held-out ' + x.final.heldout + '/' + x.tasksHeldout + ' (searched ' + x.final.searched + '/' + x.tasksSearched + ' len ' + x.final.len + '), plateau at ' + plWords(x.plateauGen.atGen, x.plateau.atMs) + ' at ' + x.plateau.score + ', searched plateau at ' + plWords(x.searchedPlateauGen.atGen, x.searchedPlateau.atMs) + ', ' + big(x.organismYears) + ' organism-years, ' + x.restarts + ' restarts' + (r.switches.transfer ? ', transfer tried ' + x.transfer.tried + ' matched ' + x.transfer.matched + ' accepted ' + x.transfer.accepted : '');
      say('[' + label + ' ' + r.seed + ' ' + r.arm + '] wall ' + f1(r.wallMs / 1000) + ' s; ' + line('grid', g) + '; ' + line('synthetic', c));
    }
    say('[' + label + '] batch ' + (i + 1) + ' took ' + f1((Date.now() - t0) / 1000) + ' s');
  }
  return results;
}

function compactRun(r) {
  const planes = {};
  for (const [k, x] of Object.entries(r.planes)) {
    const { rows, ...rest } = x;
    planes[k] = { ...rest, rows: P.compactRows(rows), rowsColumns: ['tMs', 'organismYears', 'searchedCount', 'len', 'heldout'], rowsNote: 'change points of the rows (' + ROW_WORDS + ') plus the first row of every wall second; the score is a step function, so the full series is these rows held' };
  }
  return { ...r, planes };
}

function cmpLine(label, cmp, T) {
  return '[' + label + '] ' + cmp.plane + ' (n=' + cmp.n + ' seeds): final held-out ' + f2(cmp.armFinal.mean) + ' +- ' + f2(cmp.armFinal.sd) + ' vs control ' + f2(cmp.controlFinal.mean) + ' +- ' + f2(cmp.controlFinal.sd) + ' of ' + T +
    ' (diff ' + f2(cmp.armFinal.mean - cmp.controlFinal.mean) + ', noise ' + f2(cmp.noise) + ', beats by more than noise: ' + cmp.beatsByMoreThanNoise + '); gained after the control plateau ' + f2(cmp.armGainedAfter.mean) + ' +- ' + f2(cmp.armGainedAfter.sd) + ' tasks = ' + f3(cmp.armPerMillionAfter.mean) + ' +- ' + f3(cmp.armPerMillionAfter.sd) + ' per million organism-years (control ' + f3(cmp.controlPerMillionAfter.mean) + ' +- ' + f3(cmp.controlPerMillionAfter.sd) + ')' +
    (WALL ? '' : '; plateau generation ' + big(cmp.armPlateauGen.mean) + ' +- ' + big(cmp.armPlateauGen.sd) + ' vs control ' + big(cmp.controlPlateauGen.mean) + ' +- ' + big(cmp.controlPlateauGen.sd)) +
    '; plateau second ' + s2(cmp.armPlateauMs.mean) + ' +- ' + s2(cmp.armPlateauMs.sd) + ' s vs control ' + s2(cmp.controlPlateauMs.mean) + ' +- ' + s2(cmp.controlPlateauMs.sd) + ' s (later' + (WALL ? '' : ' by generation') + ': ' + cmp.plateauLater + '); searched ' + f2(cmp.armSearched.mean) + ' vs ' + f2(cmp.controlSearched.mean);
}

// ---------------------------------------------------------------- run
say('[plateau] node ' + process.version + ', ' + os.cpus().length + ' threads, ' + (os.totalmem() / 1073741824).toFixed(1) + ' GB RAM, ' + freeMb() + ' MB free at start; heap cap ' + (process.execArgv.find((x) => x.startsWith('--max-old-space-size')) || 'default') + '; no model calls');
say('[plateau] ' + (isTheBar ? 'THE BAR' : 'a partial run (flags: ' + flags.join(' ') + ')') + ': ' + BUDGET_WORDS + ', ' + ROW_WORDS + ', restart after ' + RESTART_WORDS + ' without a searched rise; tuning seeds ' + TUNE.join(',') + ' (interventions on the first ' + cfg.armSeeds + '), fresh seeds ' + FRESH.join(',') + ', up to ' + cfg.concurrency + ' worker threads at once');
if (!WALL) {
  const d = P.BUDGET.derivedFrom;
  say('[plateau] the generation budget\'s default: ' + big(P.BUDGET.generations) + ' generations, the median of the control\'s generations per plane over the five tuning seeds of the wall-budget bar verdict at ' + d.verdictAt + ' (' + d.wallS + ' s per run, commit ' + d.commit + ', read at ' + d.read + '): grid ' + d.controlGenerations.grid.map(big).join(', ') + '; synthetic ' + d.controlGenerations.synthetic.map(big).join(', ') + '; rows every ' + big(P.BUDGET.rowEveryGens) + ' generations keep about that run\'s row count (one per ' + d.rowEveryMs + ' ms)');
}
say('[plateau] declaration: ' + P.YEAR.declaration + ' (declared, not measured)');
say('[build] ' + BUILD0.files.length + ' source files reachable from bench/plateau.mjs, sha256 ' + BUILD0.hash.slice(0, 16) + (BUILD0.missing.length ? ', missing ' + BUILD0.missing.join(', ') : ''));
say('[plateau] engine ' + JSON.stringify(P.ENGINE) + ', caps ' + JSON.stringify(P.LMAX) + ', restart carry ' + P.RESTART.carry + ' distant cells, transfer ' + P.TRANSFER.perGeneration + ' migrants per generation per direction');

await waitForRam('start');
const tunePlanes = buildPlanes('tune');
const tuneSeedSet = seedSet('tune', TUNE, tunePlanes);

// (a) + (b): the control on every tuning seed, the three singles on the first armSeeds
const tuneJobs = [];
TUNE.forEach((seed, i) => {
  tuneJobs.push({ seed, arm: P.ARMS.control });
  if (i < cfg.armSeeds) for (const a of ['novelty', 'transfer', 'restart']) tuneJobs.push({ seed, arm: P.ARMS[a] });
});
const tuneRuns = await runPhase('tune', tunePlanes, tuneJobs);
const controls = tuneRuns.filter((r) => r.arm === 'control');

// (a) the plateau, exactly
const measure = {};
for (const key of ['grid', 'synthetic']) {
  const per = controls.map((r) => { const x = r.planes[key]; return { seed: r.seed, plateauGen: x.plateauGen.atGen, plateauMs: x.plateau.atMs, plateauScore: x.plateau.score, final: x.final.heldout, searchedPlateauGen: x.searchedPlateauGen.atGen, searchedPlateauMs: x.searchedPlateau.atMs, finalSearched: x.final.searched, organismYears: x.organismYears, afterPlateauYears: x.final.gen - x.plateauGen.atGen, wallS: r.wallMs / 1000 }; });
  for (const p of per) say('[a ' + key + ' ' + p.seed + '] control: held-out plateau at ' + plWords(p.plateauGen, p.plateauMs) + ' (the last rise; after it the score never rises again) at ' + p.plateauScore + '/' + controls[0].planes[key].tasksHeldout + ', final ' + p.final + '; searched plateau at ' + plWords(p.searchedPlateauGen, p.searchedPlateauMs) + ', final searched ' + p.finalSearched + '/' + controls[0].planes[key].tasksSearched + '; ' + big(p.organismYears) + ' organism-years in the run, ' + big(p.afterPlateauYears) + ' of them after the plateau');
  const fin = P.stats(per.map((p) => p.final)), pl = P.stats(per.map((p) => p.plateauMs / 1000)), sp = P.stats(per.map((p) => p.searchedPlateauMs / 1000));
  const plg = P.stats(per.map((p) => p.plateauGen)), spg = P.stats(per.map((p) => p.searchedPlateauGen));
  say('[a ' + key + '] control over ' + per.length + ' seeds: final held-out ' + f2(fin.mean) + ' +- ' + f2(fin.sd) + ' (seed-to-seed noise, sample sd; range ' + fin.min + '..' + fin.max + '); ' + (WALL ? '' : 'plateau generation ' + big(plg.mean) + ' +- ' + big(plg.sd) + ' (range ' + big(plg.min) + ' to ' + big(plg.max) + '); ') + 'plateau second ' + f2(pl.mean) + ' +- ' + f2(pl.sd) + ' s (range ' + f2(pl.min) + ' to ' + f2(pl.max) + '); searched plateau ' + (WALL ? '' : 'generation ' + big(spg.mean) + ' +- ' + big(spg.sd) + ', ') + f2(sp.mean) + ' +- ' + f2(sp.sd) + ' s');
  // the restart schedule's evidence: the gaps the control left between rises of its searched objective
  for (const r of controls) {
    if (WALL) { const x = r.planes[key].searchedGaps; say('[a ' + key + ' ' + r.seed + '] control searched objective rose ' + x.rises + ' times, last at ' + (x.lastRiseMs === null ? 'n/a' : s2(x.lastRiseMs)) + ' s; longest gaps between rises ' + x.longest.slice(0, 4).map((gp) => s2(gp.ms) + ' s from ' + s2(gp.fromMs) + ' s').join(', ') + ' (restart N is ' + RESTART_WORDS + ')'); }
    else { const x = r.planes[key].searchedGapsGen; say('[a ' + key + ' ' + r.seed + '] control searched objective rose ' + x.rises + ' times, last at generation ' + big(x.lastRiseGen) + '; longest gaps between rises ' + x.longest.slice(0, 4).map((gp) => big(gp.gens) + ' generations from ' + big(gp.fromGen)).join(', ') + ' (restart N is ' + RESTART_WORDS + ')'); }
  }
  // the diagnostic (read by no decision): did the control's final archive hold a library that generalizes better than its pick?
  const arch = controls.map((r) => ({ seed: r.seed, ...r.planes[key].archive }));
  for (const x of arch) say('[a ' + key + ' ' + x.seed + '] diagnostic after the run (no decision reads it): the final archive held ' + x.elites + ' elites; the pick scored ' + x.pickHeldout + ' on the held-out draw, the best elite on it scored ' + x.maxHeldout + ' (an ORACLE pick, printed only; its searched count ' + x.maxHeldoutSearched + '); Spearman of searched fitness against held-out over the top 50 elites ' + f3(x.spearmanTop) + (x.robustPick ? '; a held-out-free pick (' + x.robustPick.rule + ') scored ' + x.robustPick.heldout + ' (searched ' + x.robustPick.searched + ', worst draw ' + x.robustPick.minDraw + ' against the pick of ' + x.robustPick.pickMinDraw + ')' : ''));
  const gap = P.stats(arch.map((x) => x.maxHeldout - x.pickHeldout)), rho = P.stats(arch.map((x) => x.spearmanTop));
  const rob = P.stats(arch.filter((x) => x.robustPick).map((x) => x.robustPick.heldout - x.pickHeldout));
  say('[a ' + key + '] diagnostic over ' + arch.length + ' seeds: the oracle elite beat the pick by ' + f2(gap.mean) + ' +- ' + f2(gap.sd) + ' held-out tasks; Spearman over the top 50 ' + f3(rho.mean) + ' +- ' + f3(rho.sd) + '; the held-out-free robust pick minus the pick ' + f2(rob.mean) + ' +- ' + f2(rob.sd) + ' (n=' + rob.n + ')');
  measure[key] = { perSeed: per, final: fin, plateauS: pl, plateauGen: plg, searchedPlateauS: sp, searchedPlateauGen: spg, archiveDiagnostic: { perSeed: arch, oracleMinusPick: gap, spearmanTop50: rho, robustMinusPick: rob, note: 'computed after each run ended, from the final archive, and read by no decision: an oracle pick that uses the held-out draw, printed to say whether the archive held a better generalizing library than the pick' } };
}

// (b) the three singles against the control, same seeds
const singles = {};
for (const a of cfg.armSeeds > 0 ? ['novelty', 'transfer', 'restart'] : []) {
  const runs = tuneRuns.filter((r) => r.arm === a);
  singles[a] = {};
  for (const key of ['grid', 'synthetic']) {
    const cmp = P.compareArm(controls, runs, key, { axis: AXIS });
    singles[a][key] = cmp;
    say(cmpLine('b ' + a, cmp, controls[0].planes[key].tasksHeldout));
  }
}
const heldoutTasks = { grid: controls[0].planes.grid.tasksHeldout, synthetic: controls[0].planes.synthetic.tasksHeldout };
const combo = P.chooseCombination(singles, heldoutTasks);
for (const s of combo.scored) say('[combination] ' + s.name + ': mean diff grid ' + f2(s.diffs.grid) + ', synthetic ' + f2(s.diffs.synthetic) + ', summed share ' + f3(s.share) + ', kept ' + s.kept);
say('[combination] rule: ' + combo.rule + '; chosen ' + combo.name + (combo.fallback ? ' (NO intervention was kept: the single best by summed share is graded)' : ''));

const configOut = () => ({ ...cfg, defaults: DEFAULTS, budgetDefault: P.BUDGET, engine: P.ENGINE, lmax: P.LMAX, restart: { ...P.RESTART, restartGens: cfg.restartGens, restartMs: WALL ? cfg.restartS * 1000 : null }, transfer: P.TRANSFER, cover: P.COVER_DEFAULTS, rowEveryGens: cfg.rowGens, rowEveryMs: WALL ? ROW_MS : null });

if (NO_FRESH) {
  // a development run: (a) and (b) on the tuning seeds only; the held-out strings are never built
  const wallMs = Date.now() - T_START;
  const dev = {
    name: 'plateau', at: new Date().toISOString(), command: 'node --max-old-space-size=' + HEAP_MB + ' bench/plateau.mjs ' + argv.join(' '), execArgv: process.execArgv, node: process.version,
    isTheBar: false, barMet: false,
    split: { development: { runSeeds: TUNE, planeSeeds: PLANE_SEEDS.tune, allSeedStrings: [...tuneSeedSet] }, heldOut: 'none: a --no-fresh development run stops after (b) and never builds or runs the held-out seeds or planes', contaminated: false },
    statement: 'A development run on the tuning seeds only (' + TUNE.join(', ') + ', ' + BUDGET_WORDS + '): the control and the three singles, and the combination the rule would choose (' + combo.name + '). The held-out seeds and planes were not built. It grades nothing.',
    config: configOut(),
    planes: { tune: { grid: planeMeta(tunePlanes.grid), synthetic: planeMeta(tunePlanes.synthetic) } },
    build: { hash: BUILD0.hash, files: BUILD0.files, missing: BUILD0.missing },
    measure, singles, combination: combo, searchDigest: P.searchDigest(tuneRuns), runs: { tune: tuneRuns.map(compactRun) },
    peakRssMb: Math.round(process.resourceUsage().maxRSS / 1024), wallMs, modelCalls: 0,
  };
  const OUTDEV = path.join(ROOT, 'bench', 'verdicts', 'plateau-partial.json');
  writeFileSync(OUTDEV, JSON.stringify(dev, null, 1));
  say('[verdict] ' + path.relative(ROOT, OUTDEV) + ', a development run (--no-fresh): isTheBar false, barMet false; wall ' + f1(wallMs / 1000) + ' s');
  process.exit(0);
}


// (c) the held-out seeds, on planes built only now
const freshPlanes = buildPlanes('fresh');
const freshSeedSet = seedSet('fresh', FRESH, freshPlanes);
const overlap = [...freshSeedSet].filter((s) => tuneSeedSet.has(s));
if (overlap.length) throw new Error('held-out seeds overlap the tuning seeds: ' + overlap.join(', '));
const retiredSet = P.retiredSeedStrings();
const retiredHit = [...freshSeedSet, ...tuneSeedSet].filter((s) => retiredSet.has(s));
if (retiredHit.length) throw new Error('a retired seed string is in use: ' + retiredHit.join(', '));
say('[split] ' + tuneSeedSet.size + ' tuning seed strings, ' + freshSeedSet.size + ' held-out seed strings, overlap 0, retired strings in use 0 (retired: ' + RETIRED.runSeeds.join(', ') + ' on ' + RETIRED.planeSeeds.join(', ') + '); the held-out planes were built after the combination was chosen');
const freshJobs = [];
for (const seed of FRESH) { freshJobs.push({ seed, arm: P.ARMS.control }); freshJobs.push({ seed, arm: combo.switches }); }
const freshRuns = await runPhase('fresh', freshPlanes, freshJobs);
const freshControl = freshRuns.filter((r) => r.arm === 'control');
const freshCombo = freshRuns.filter((r) => r.arm === combo.name);
const fresh = {};
const freshMeasure = {};
for (const key of ['grid', 'synthetic']) {
  fresh[key] = P.compareArm(freshControl, freshCombo, key, { axis: AXIS });
  for (const row of fresh[key].rows) say('[c ' + key + ' ' + row.seed + '] control final ' + row.controlFinal + ', plateau ' + plWords(row.controlPlateauGen, row.controlPlateauMs) + '; ' + combo.name + ' final ' + row.armFinal + ', plateau ' + plWords(row.armPlateauGen, row.armPlateauMs) + '; after the control plateau: control ' + f3(row.controlAfter.perMillion) + ', ' + combo.name + ' ' + f3(row.armAfter.perMillion) + ' per million organism-years (' + row.armAfter.gained + ' tasks over ' + big(row.armAfter.years) + ')');
  say(cmpLine('c ' + combo.name, fresh[key], freshControl[0].planes[key].tasksHeldout));
  freshMeasure[key] = { plateauS: P.stats(freshControl.map((r) => r.planes[key].plateau.atMs / 1000)), plateauGen: P.stats(freshControl.map((r) => r.planes[key].plateauGen.atGen)), final: P.stats(freshControl.map((r) => r.planes[key].final.heldout)) };
}
const verdict = P.barVerdict(fresh);
for (const key of ['grid', 'synthetic']) {
  const v = verdict.per[key], x = fresh[key];
  say('[bar] ' + key + ': ' + combo.name + ' minus control ' + f2(v.diff) + ' against noise ' + f2(v.noise) + ' (beats: ' + v.beats + '); ' +
    (WALL ? 'plateau ' + s2(x.armPlateauMs.mean) + ' s against ' + s2(x.controlPlateauMs.mean) + ' s (later: ' + v.later + ')'
      : 'plateau generation ' + big(x.armPlateauGen.mean) + ' against ' + big(x.controlPlateauGen.mean) + ' (later: ' + v.later + '); plateau second ' + s2(x.armPlateauMs.mean) + ' s against ' + s2(x.controlPlateauMs.mean) + ' s (wall, printed, not the bar)'));
}
say('[bar] the combination bar is ' + (verdict.met ? 'MET' : 'NOT MET') + ': ' + combo.name + ' on ' + FRESH.length + ' held-out seeds ' + (verdict.met ? 'beats' : 'does not beat') + ' the control by more than the seed noise with a later plateau on both planes');

// ---------------------------------------------------------------- the re-run ledger and the repeat
const AT = new Date().toISOString();
const BUILD1 = P.sourceClosure([fileURLToPath(import.meta.url)], ROOT);
const changedDuringRun = BUILD1.hash !== BUILD0.hash;
if (changedDuringRun) say('[build] a file the bench loads CHANGED during this run: sha256 ' + BUILD0.hash.slice(0, 16) + ' at the start, ' + BUILD1.hash.slice(0, 16) + ' now; this run joins the build of no other run');
const DIGEST = P.searchDigest([...tuneRuns, ...freshRuns]);
say('[search] digest of the search this run drew (every row but its wall time, every restart and transfer count, ' + (tuneRuns.length + freshRuns.length) + ' arm runs): ' + DIGEST.slice(0, 16));
const wallArm = P.stats([...tuneRuns, ...freshRuns].map((r) => r.wallMs / 1000));
say('[wall] ' + (tuneRuns.length + freshRuns.length) + ' arm runs took ' + f1(wallArm.min) + ' to ' + f1(wallArm.max) + ' s of wall each (mean ' + f1(wallArm.mean) + ' s)' + (WALL ? '' : ', printed, never budgeted'));
const entry = { at: AT, build: changedDuringRun ? BUILD1.hash + ':changed-during-run' : BUILD0.hash, barMet: verdict.met, combination: combo.name, budget: cfg.budget, generations: cfg.generations, wallS: cfg.wallS, digest: DIGEST, per: {} };
for (const key of ['grid', 'synthetic']) {
  entry.per[key] = {
    beats: verdict.per[key].beats, later: verdict.per[key].later, diff: verdict.per[key].diff, noise: verdict.per[key].noise,
    controlFinal: fresh[key].controlFinal.mean, armFinal: fresh[key].armFinal.mean,
    controlPlateauS: fresh[key].controlPlateauMs.mean / 1000, armPlateauS: fresh[key].armPlateauMs.mean / 1000,
    controlPlateauGen: fresh[key].controlPlateauGen.mean, armPlateauGen: fresh[key].armPlateauGen.mean,
    tuneControlFinal: measure[key].final.mean, tuneControlPlateauS: measure[key].plateauS.mean,
  };
}
let previousRuns = null, previousNote = 'no bar verdict on disk';
if (isTheBar && existsSync(OUT)) {
  try {
    const pv = JSON.parse(readFileSync(OUT, 'utf8'));
    previousRuns = pv.reruns && Array.isArray(pv.reruns.runs) ? pv.reruns.runs : [];
    previousNote = 'the bar verdict on disk (at ' + pv.at + ') carried ' + (pv.reruns && Array.isArray(pv.reruns.runs) ? pv.reruns.runs.length + ' ledger run(s)' : 'no re-run ledger (a build before the ledger)');
  } catch (e) { previousNote = 'the bar verdict on disk did not parse (' + String(e.message || e).slice(0, 80) + ')'; }
}
const ledger = isTheBar ? P.rerunLedger(previousRuns, entry) : null;
const repeat = ledger ? P.repeatOf(ledger) : null;
const d2 = (x) => (x === null ? 'n/a' : f2(x));
if (ledger) {
  say('[reruns] ' + previousNote + '; this is bar run ' + ledger.n + ' of build ' + ledger.build.slice(0, 16) + ' (dropped ' + ledger.droppedOtherBuild + ' run(s) of other builds, ' + ledger.droppedDuplicate + ' duplicate(s)); the combination bar met in ' + ledger.barMetTrue + ' of ' + ledger.n + '; combinations ' + Object.entries(ledger.combinations).map(([k, v]) => k + ' ' + v).join(', ') + (ledger.measured ? '' : '; ONE run: the re-run spread is not measured'));
  const rg = (x, d) => (x.min === x.max ? x.min.toFixed(d) : x.min.toFixed(d) + '..' + x.max.toFixed(d));
  for (const key of ['grid', 'synthetic']) {
    const x = ledger.per[key];
    say('[reruns] ' + key + ' over ' + x.n + ' run(s): beats true in ' + x.trueCount.beats + ', later true in ' + x.trueCount.later + '; held-out control final ' + rg(x.range.controlFinal, 2) + ', combination final ' + rg(x.range.armFinal, 2) + ', control plateau ' + rg(x.range.controlPlateauS, 2) + ' s, combination plateau ' + rg(x.range.armPlateauS, 2) + ' s; tuning control final ' + rg(x.range.tuneControlFinal, 2) + ', tuning control plateau ' + rg(x.range.tuneControlPlateauS, 2) + ' s');
  }
  for (const key of ['grid', 'synthetic']) {
    const x = repeat.per[key];
    x.runs.forEach((r, i) => say('[repeat] ' + key + ' run ' + (i + 1) + ' of ' + x.n + ' (at ' + r.at + '): ' + combo.name + ' minus control ' + f2(r.diff) + ', noise ' + f2(r.noise) + ', plateau second ' + f2(r.armPlateauS) + ' s against ' + f2(r.controlPlateauS) + ' s, plateau generation ' + big(r.armPlateauGen) + ' against ' + big(r.controlPlateauGen)));
    if (repeat.measured) say('[repeat] ' + key + ': the difference moved ' + d2(x.diffMove) + ' between the runs against a smallest noise of ' + d2(x.noiseMin) + ' (under the noise: ' + x.moveUnderNoise + '); the plateau second moved ' + d2(x.plateauSMove.arm) + ' s (' + combo.name + ') and ' + d2(x.plateauSMove.control) + ' s (control); the plateau generation moved ' + big(x.plateauGenMove.arm) + ' and ' + big(x.plateauGenMove.control));
  }
  if (repeat.measured) say('[repeat] largest move of the difference ' + d2(repeat.largestMove) + ' (' + repeat.largestMovePlane + '), under the noise on both planes: ' + repeat.underNoise + '; the ' + repeat.n + ' runs drew the same search (digests equal): ' + repeat.sameSearch);
  else say('[repeat] ONE bar run of this build is on disk: the repeat is not measured, so barMet is false until the bar command runs again on this build');
}
const barMet = isTheBar && verdict.met && !!repeat && repeat.underNoise;
say('[bar] barMet ' + barMet + ': the combination bar is ' + (verdict.met ? 'met' : 'not met') + (repeat ? ' and the repeat is ' + (!repeat.measured ? 'not measured' : repeat.underNoise ? 'under the noise' : 'NOT under the noise') : ' (a partial run: no repeat)'));

// ---------------------------------------------------------------- verdict
const wallMs = Date.now() - T_START;
const peakRssMb = Math.round(process.resourceUsage().maxRSS / 1024);
const g = fresh.grid, c = fresh.synthetic;
const single = (a, k) => { const x = singles[a][k]; return a + ' ' + f2(x.armFinal.mean) + ' against ' + f2(x.controlFinal.mean) + ' (plateau ' + (WALL ? s2(x.armPlateauMs.mean) + ' s against ' + s2(x.controlPlateauMs.mean) + ' s' : 'generation ' + big(x.armPlateauGen.mean) + ' against ' + big(x.controlPlateauGen.mean)) + ')'; };
// every plane constant the statement names is read off the built planes (P.describePlane, the same
// words the [planes] lines printed), the engine (P.ENGINE.popSize) and the caps (P.LMAX)
const planeWords = (side) => P.describePlane(side.grid, P.LMAX.grid) + ' and ' + P.describePlane(side.synthetic, P.LMAX.synthetic);
const tuneWords = planeWords(tunePlanes), heldWords = planeWords(freshPlanes);
const tuneAt = (k) => (WALL ? f2(measure[k].plateauS.mean) + ' +- ' + f2(measure[k].plateauS.sd) + ' s' : 'generation ' + big(measure[k].plateauGen.mean) + ' +- ' + big(measure[k].plateauGen.sd) + ' (' + f2(measure[k].plateauS.mean) + ' +- ' + f2(measure[k].plateauS.sd) + ' s of wall)');
const heldAt = (x) => (WALL ? 'plateau ' + s2(x.armPlateauMs.mean) + ' s against ' + s2(x.controlPlateauMs.mean) + ' s' : 'plateau generation ' + big(x.armPlateauGen.mean) + ' against ' + big(x.controlPlateauGen.mean) + ', at ' + s2(x.armPlateauMs.mean) + ' s against ' + s2(x.controlPlateauMs.mean) + ' s of wall');
let repeatWords = '';
if (repeat && repeat.measured) {
  const pw = (k) => { const x = repeat.per[k]; return x.runs.map((r) => f2(r.diff)).join(' and ') + ' on ' + k + ' (noise ' + x.runs.map((r) => f2(r.noise)).join(' and ') + ', a move of ' + d2(x.diffMove) + '; the control\'s plateau second moved ' + d2(x.plateauSMove.control) + ' s and its plateau generation ' + big(x.plateauGenMove.control) + ')'; };
  repeatWords = P.rerunWords(ledger, { files: BUILD0.files.length }) + ' THE REPEAT: run by run, ' + combo.name + ' minus control was ' + pw('grid') + ' and ' + pw('synthetic') + '. The largest move of the difference, ' + d2(repeat.largestMove) + ' on ' + repeat.largestMovePlane + ', is ' + (repeat.underNoise ? 'under' : 'NOT under') + ' the noise on both planes, and the runs drew ' + (repeat.sameSearch ? 'the same search (equal digests)' : 'different searches') + '. ';
} else if (repeat) {
  repeatWords = P.rerunWords(ledger, { files: BUILD0.files.length }) + ' So the repeat is not measured, and barMet is false until the bar command runs again on this build. ';
}
const statement =
  'One organism-year is declared to be one generation of the whole population (' + P.ENGINE.popSize + ' children) on a plane. Two planes the plain search does not saturate were run for ' + BUDGET_WORDS + ', one generation of each in turn, with ' + ROW_WORDS + ': ' + (tuneWords === heldWords ? tuneWords + ', the same shapes on the tuning and the held-out seeds' : 'on the tuning seeds ' + tuneWords + ', on the held-out seeds ' + heldWords) + '. ' +
  'On ' + TUNE.length + ' tuning seeds the plain control last rose on the held-out score at ' + tuneAt('grid') + ' on grid and ' + tuneAt('synthetic') + ' on synthetic, ending at ' + f2(measure.grid.final.mean) + ' +- ' + f2(measure.grid.final.sd) + ' and ' + f2(measure.synthetic.final.mean) + ' +- ' + f2(measure.synthetic.final.sd) + ' (mean +- seed sd). ' +
  'Three interventions each ran beside the control on the first ' + cfg.armSeeds + ' of those seeds: behaviour-keyed archive cells (novelty), descriptor-matched elites crossing between the planes every generation (transfer) and a re-seed from the archive\'s most distant cells after ' + RESTART_WORDS + ' without a searched rise (restart). Final held-out on grid: ' + ['novelty', 'transfer', 'restart'].map((a) => single(a, 'grid')).join('; ') + '. On synthetic: ' + ['novelty', 'transfer', 'restart'].map((a) => single(a, 'synthetic')).join('; ') + '. ' +
  'By a rule fixed before the runs the singles chose ' + combo.name + (combo.fallback ? ' (no single was at or above the control on both planes, so the single with the largest summed gain was graded)' : '') + '. ' +
  'On ' + FRESH.length + ' held-out seeds, on planes built from task seeds the tuning never touched, ' + combo.name + ' ended at ' + f2(g.armFinal.mean) + ' against the control\'s ' + f2(g.controlFinal.mean) + ' on grid (noise ' + f2(g.noise) + ', ' + heldAt(g) + ') and ' + f2(c.armFinal.mean) + ' against ' + f2(c.controlFinal.mean) + ' on synthetic (noise ' + f2(c.noise) + ', ' + heldAt(c) + '). ' +
  'The combination bar (beat the control by more than the seed noise and plateau at a later ' + (WALL ? 'second' : 'generation') + ', on both planes) is ' + (verdict.met ? 'met' : 'not met') + '. ' +
  (WALL ? 'This run was cut by the wall clock on a shared machine, so a re-run moves these numbers. ' : 'The machine was shared with other builders, so the wall seconds are contended seconds and move between runs; the generations do not. ') +
  (changedDuringRun ? 'A file the bench loads changed during this run, so it joins the build of no other run. ' : '') + repeatWords +
  'barMet is ' + barMet + '. No model was called.';
const statementCheck = P.statementNumbers(statement, PRINTED.join('\n'));
say('[statement] ' + statementCheck.numbers.length + ' numbers in the statement; every one printed on a line above: ' + (statementCheck.missing.length === 0) + (statementCheck.missing.length ? '; NOT printed: ' + statementCheck.missing.join(', ') : ''));

const out = {
  name: 'plateau',
  at: AT,
  command: 'node --max-old-space-size=' + HEAP_MB + ' bench/plateau.mjs' + (argv.length ? ' ' + argv.join(' ') : ''),
  execArgv: process.execArgv,
  node: process.version,
  isTheBar,
  barMet,
  barMetIfBar: verdict.met && !!repeat && repeat.underNoise,
  split: {
    development: { what: 'the tuning seeds and the tuning planes: the control of (a) and the three singles of (b) ran here, and the combination was chosen from their held-out scores; every development run of this build (--no-fresh) ran here too', runSeeds: TUNE, planeSeeds: PLANE_SEEDS.tune, allSeedStrings: [...tuneSeedSet] },
    heldOut: { what: 'the held-out seeds and planes (new task draws for both planes, searched and held-out): built after the combination was chosen; the tuning never built, searched or scored them, and no development run touched them. The repeat re-runs the same command, so the second run grades the same held-out seeds again; nothing was tuned between the runs', runSeeds: FRESH, planeSeeds: PLANE_SEEDS.fresh, allSeedStrings: [...freshSeedSet], overlapWithDevelopment: overlap },
    retired: { ...RETIRED, why: 'those strings were exposed by that smoke run, so no run of this build uses them; the held-out side moved to the heldout namespace', inUse: retiredHit },
    withinEveryRun: 'the held-out draw of a plane is read only to write a row; selection, the restart clock, the hall of fame and which migrant is offered read the searched matrix and the generation count alone (test/plateau.test.mjs swaps the held-out draw and gets the identical searched trajectory in every arm)',
    contaminated: false,
  },
  bar: {
    rule: 'on the held-out seeds, the chosen combination beats the control\'s mean final held-out score by more than the seed-to-seed noise (the larger sample sd of the two arms) on BOTH planes, and its mean plateau ' + (WALL ? 'second' : 'generation') + ' is later than the control\'s on both; and the repeat: the bar command run back to back on this build moved the difference by less than the smallest seed noise on every plane',
    control: 'the same loop with novelty, transfer and restart all off, on the same seeds and the same planes, for the same budget, run in the same batch of worker threads',
    combination: combo.name, met: verdict.met, per: verdict.per, repeatUnderNoise: repeat ? repeat.underNoise : null, barMet,
  },
  statement,
  statementCheck,
  budget: { kind: cfg.budget, generations: cfg.generations, rowEveryGens: cfg.rowGens, restartGens: cfg.restartGens, wallS: cfg.wallS, default: P.BUDGET, wallPerArmS: wallArm, note: WALL ? 'a wall budget: a re-run draws a different search' : 'a generation budget: every arm runs the same generations of each plane, rows and the restart clock count generations, and wall time is printed, never budgeted' },
  searchDigest: DIGEST,
  build: { hash: BUILD0.hash, hashAtEnd: BUILD1.hash, changedDuringRun, files: BUILD0.files, missing: BUILD0.missing, rule: 'sha256 over every file reachable from bench/plateau.mjs through relative imports (generations/plateau.mjs sourceClosure); two bar runs are one build only when the hashes are equal' },
  reruns: ledger,
  repeat,
  declaration: P.YEAR,
  config: configOut(),
  planes: { tune: { grid: planeMeta(tunePlanes.grid), synthetic: planeMeta(tunePlanes.synthetic) }, fresh: { grid: planeMeta(freshPlanes.grid), synthetic: planeMeta(freshPlanes.synthetic) } },
  measure,
  freshMeasure,
  singles,
  combination: combo,
  fresh,
  runs: { tune: tuneRuns.map(compactRun), fresh: freshRuns.map(compactRun) },
  machine: { cpus: os.cpus().length, totalGb: Number((os.totalmem() / 1073741824).toFixed(1)), freeMbAtEnd: freeMb(), shared: 'this board\'s other builders, board 24a and the orchestrator\'s GSM8K rung' },
  peakRssMb, wallMs, modelCalls: 0,
};
mkdirSync(path.dirname(OUT), { recursive: true });
const text = JSON.stringify(out, null, 1);
if (text.length > 100 * 1048576) say('[verdict] this verdict is over 100 MB');
writeFileSync(OUT, text);
say('[verdict] ' + path.relative(ROOT, OUT) + ' (' + (text.length / 1048576).toFixed(2) + ' MB), isTheBar ' + isTheBar + ', barMet ' + out.barMet + '; wall ' + f1(wallMs / 1000) + ' s, peak rss ' + peakRssMb + ' MB');
if (statementCheck.missing.length) { console.error('[statement] names numbers no line printed: ' + statementCheck.missing.join(', ')); process.exit(1); }
