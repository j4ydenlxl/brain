// bench/years.mjs: ORGANISM-YEARS, EARNED AND COUNTED.
//
// generations/years.mjs declares the year once (one organism-year = one generation of the whole
// population on a plane, so organism-years equal generations) and runs the matrix path of
// generations/velocity.mjs continuously. This bench runs it for fixed wall budgets on two planes
// velocity.mjs hosts, the grid suite (tasks/grid.mjs, Board 10's multi-draw objective) and the
// synthetic landscape (planted optimum), and prints, per run:
//
//   [<plane> <s> s] run        what ran: the source, the population, the plateau rule, the setup
//   [<plane> <s> s] years      the count, with the declared arithmetic beside it
//   [<plane> <s> s] rate       evaluations and generations per wall second
//   [<plane> <s> s] fresh      the searched best's score on fresh draws the loop never searched
//                              and never read: start (after generation 1) and end, gained, and
//                              SCORE GAINED PER MILLION ORGANISM-YEARS
//   [<plane> <s> s] plateau    the first wall second the searched score's improvement per second
//                              fell under the declared floor, and every later one
//   [<plane> <s> s] grew       what the loop did at its plateaus (widen, ingest, spawn)
//   [<plane> <s> s] projection seconds to one billion organism-years at the measured rate, beside
//                              the measured seconds to the count actually reached
//   [control]                  the grid plane for the longest budget with growth OFF: what the
//                              loop does with no growth hook, on the same seeds and clock
//   [bar]                      the longest run on both planes: gained per million organism-years
//                              above zero, the plateau second named, the projection's arithmetic
//
//   node bench/years.mjs [--budgets 10,60,300] [--planes grid,synthetic] [--control-s 300]
//                        [--no-control] [--seed grid/velocity]
//
// With no flags this is the bar and writes bench/verdicts/years.json once, with isTheBar true.
// Any flag makes a narrower or different run, which writes bench/verdicts/years-partial.json with
// isTheBar false. Run it through tools/budget.mjs; it re-runs itself under a 4096 MB heap cap when
// started without one, waits while under 16 GB is free, raises a bench flag (daemon/run.mjs
// refuses self-code while one is up), runs one plane at a time, and starts at most one worker
// thread (the grid draw prefetch). No model is called.
import { writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const HEAP_MB = 4096;
const MB = 1024 * 1024;

if (!process.execArgv.some((a) => a.startsWith('--max-old-space-size'))) {
  const r = spawnSync(process.execPath, ['--max-old-space-size=' + HEAP_MB, fileURLToPath(import.meta.url), ...process.argv.slice(2)], { stdio: 'inherit', windowsHide: true });
  process.exit(r.status === null ? 1 : r.status);
}

const Y = await import('../generations/years.mjs');
const D = await import('../daemon/run.mjs');

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const flags = argv.filter((a) => a.startsWith('--')).map((a) => a.slice(2));
const isTheBar = flags.length === 0;
const OUT = path.join(ROOT, 'bench', 'verdicts', isTheBar ? 'years.json' : 'years-partial.json');

const DEFAULTS = Object.freeze({ budgets: [10, 60, 300], planes: ['grid', 'synthetic'], seed: 'grid/velocity', synthSeed: 'years/synthetic' });
const cfg = {
  budgets: String(opt('budgets', DEFAULTS.budgets.join(','))).split(',').map(Number),
  planes: String(opt('planes', DEFAULTS.planes.join(','))).split(','),
  seed: String(opt('seed', DEFAULTS.seed)),
  controlS: has('no-control') ? 0 : Number(opt('control-s', 0)) || null,
};
if (cfg.budgets.some((b) => !(b > 0))) throw new Error('--budgets takes positive seconds, comma separated');
const longest = Math.max(...cfg.budgets);
if (cfg.controlS === null) cfg.controlS = longest;

const say = (s) => console.log(s);
const f1 = (x) => Number(x).toFixed(1), f3 = (x) => Number(x).toFixed(3);
const big = (x) => Math.round(x).toLocaleString('en-US');
const secs = (ms) => f3(ms / 1000);

// ---------------------------------------------------------------- budgets
const freeGb = () => os.freemem() / 1024 ** 3;
const freeAtStart = freeGb();
if (freeAtStart < 16) {
  say(`[budget] ${f1(freeAtStart)} GB free, under 16 GB: waiting (up to 30 min)`);
  const until = Date.now() + 30 * 60_000;
  while (freeGb() < 16 && Date.now() < until) await new Promise((r) => setTimeout(r, 30_000));
  if (freeGb() < 16) { say(`[budget] still ${f1(freeGb())} GB free after 30 min: not running`); process.exit(2); }
}
say(`[budget] ${f1(freeGb())} GB free; heap cap ${process.execArgv.find((a) => a.startsWith('--max-old-space-size'))}; one plane at a time; at most one worker thread (the grid prefetch); no model calls`);
// the daemon's own reader sweeps flags whose process is gone (a killed bench never lowers its own)
const liveFlag = D.benchFlag({ selfPid: process.pid });
say(`[daemon] bench flags of dead processes swept by daemon/run.mjs benchFlag(); ${liveFlag ? 'a live bench flag is up: pid ' + liveFlag.pid + ' (' + liveFlag.command + ')' : 'no other live bench flag'}`);
const flag = D.raiseBenchFlag({ command: 'node bench/years.mjs ' + argv.join(' ') });
say(`[daemon] bench flag raised (${path.relative(ROOT, flag.file || path.join(D.BENCH_FLAG_DIR, process.pid + '.json'))}): daemon/run.mjs refuses self-code while it is up; daemon/run.mjs is not edited`);

const T0 = process.hrtime.bigint();
const since = () => Number(process.hrtime.bigint() - T0) / 1e6;
let peakRss = 0;
const rssTimer = setInterval(() => { peakRss = Math.max(peakRss, process.memoryUsage().rss); }, 500);
rssTimer.unref();

// ---------------------------------------------------------------- the planes
const GRID_FRESH = [cfg.seed + ':heldout', cfg.seed + ':years1', cfg.seed + ':years2'];
const planes = {
  grid: {
    source: () => Y.gridSource({ seed: cfg.seed, freshSeeds: GRID_FRESH }),
    describe: (src) => `tasks/grid.mjs draws (draw 0 = ${cfg.seed}, draw k = ${cfg.seed}:draw<k>), ${src.maxDepth === 3 ? '6175' : '?'} components (identity + every chain of 1..3 of 18 ops), 160 tasks per draw`,
    prefetch: true,
  },
  synthetic: {
    source: () => Y.syntheticSource({ seed: DEFAULTS.synthSeed, draws: 64, freshSlices: 2 }),
    describe: (src) => `velocity.mjs syntheticMatrix cut into ${src.maxDraws} searched slices + ${src.freshSlices} fresh slices of 256 tasks (8 planted blocks of 32, 504 decoys), ${src.whole.C} components, known optimum ${src.optimumCount}/256 per slice`,
    prefetch: false,
  },
};

// Fresh draws are built once per plane, outside every clock: they are the ruler, not the loop.
const freshOf = {};
for (const p of new Set([...cfg.planes, ...(cfg.controlS ? ['grid'] : [])])) {
  const t0 = process.hrtime.bigint();
  const src = planes[p].source();
  freshOf[p] = src.fresh();
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  say(`[fresh] ${p}: ${freshOf[p].map((f) => f.name + ' (' + f.matrix.T + ' tasks, union bound ' + f.matrix.unionBound() + ')').join(', ')}; built in ${f1(ms)} ms outside every clock`);
}

const rowsOut = (r) => Y.thinRows(r.rows, r.wallBudgetMs >= 60_000 ? 1000 : 250).map((x) => ({ t: Number(secs(x.tMs)), gen: x.gen, evals: x.evals, arm: x.arm, draws: x.draws, firstDraw: x.firstDraw, lastDraw: x.lastDraw, lmax: x.lmax, len: x.len, searched: x.searched === null ? null : Number(x.searched.toFixed(4)), fresh: x.fresh }));

function report(label, plane, r, src) {
  const o = r.options;
  const P = `[${label}]`;
  say(`${P} run: ${planes[plane].describe(src)}; population ${o.popSize} children per generation (${o.popSize} evaluations), MAP-Elites archive of ${6 ** 4} cells, directed ${o.directed}; lmax ${o.lmax0} (+${o.lmaxStep} when the best is within ${o.lmaxSlack} slots of it); a sliding window of ${o.windowDraws} draws; growth ${o.growth ? 'on' : 'OFF'}; prefetch worker ${o.prefetch ? 'on' : 'off'}; draw 0 built in ${f1(r.setupMs)} ms before the clock`);
  say(`${P} years: ${r.years.arithmetic}`);
  say(`${P} rate: ${big(r.evals)} evaluations in ${secs(r.wallMs)} s wall (budget ${secs(r.wallBudgetMs)} s, overshoot ${f1(r.overshootMs)} ms) = ${big(r.years.evalsPerSecond)} evals/s; ${big(r.generations)} generations = ${f1(r.years.generationsPerSecond)} generations per wall second`);
  r.fresh.forEach((f, i) => {
    const seen = src.kind === 'grid' ? src.seenVerbatim(freshOf[plane][i].tasks) : null;
    const tl = r.freshTimelines[i];
    say(`${P} fresh ${f.name} (never searched, never read by the loop${seen === null ? '' : '; ' + seen + ' of its ' + f.tasks + ' tasks appear verbatim in the ' + (r.finalDraws[r.finalDraws.length - 1] + 1) + ' draws this run searched'}): start ${f.start}/${f.tasks} (the searched best after generation 1, ${secs(r.start.tMs)} s) -> end ${f.end}/${f.tasks}; gained ${f.gained} over ${big(r.years.organismYears)} organism-years = ${f.perMillionYears.toFixed(3)} per million organism-years`);
    say(`${P} fresh ${f.name} timeline: highest ${tl.high}/${f.tasks}, first reached at ${secs(tl.lastHighMs)} s and never exceeded after; ${tl.atHalf}/${f.tasks} at ${secs(tl.atHalfMs)} s (half the wall) -> ${tl.end}/${f.tasks} at the end, a second-half gain of ${tl.secondHalfGain}`);
  });
  say(`${P} searched: ${r.start.searched.toFixed(3)} -> ${r.end.searched.toFixed(3)} (mean tasks per draw on the stack the loop searched at that moment, minus length / 257; draws ${r.end.firstDraw}..${r.end.lastDraw} at the end, library ${r.end.len} slots)`);
  const ps = r.plateaus;
  say(`${P} plateau (the searched score gained under ${o.floor} task per wall second over the trailing ${o.windowMs / 1000} s): ${ps.length ? 'first at ' + secs(ps[0].atMs) + ' s wall (generation ' + big(ps[0].gen) + ', rate ' + ps[0].rate.toFixed(4) + '/s); ' + ps.length + ' plateau' + (ps.length > 1 ? 's' : '') + ' in the run, at ' + ps.slice(0, 12).map((p) => secs(p.atMs)).join(', ') + (ps.length > 12 ? ', ... ' + secs(ps[ps.length - 1].atMs) : '') + ' s' : 'none in the run'}`);
  say(`${P} plateau timing: the searched score last rose at ${r.searchedLastRoseMs === null ? '(no rise after generation 1)' : secs(r.searchedLastRoseMs) + ' s'} before the first plateau; the rule can first judge at ${r.firstJudgeableMs === null ? '(no sample)' : secs(r.firstJudgeableMs) + ' s'} (one ${o.windowMs / 1000} s window after generation 1) and needs one flat window, so a score that stops rising early names a first plateau near the same second on every budget`);
  const pf = r.prefetch;
  say(`${P} prefetch worker: ${pf.on ? pf.requested + ' draws asked, ' + pf.delivered + ' delivered, ' + pf.failures + ' failed; ' + (pf.down ? 'WRITTEN OFF at ' + secs(pf.down.atMs) + ' s (' + pf.down.reason + '), later draws built in the loop' : 'never written off (stall clock ' + pf.stallMs + ' ms)') + (pf.error && !pf.down ? '; error after the run: ' + pf.error : '') : 'off for this run'}`);
  if (!o.growth) say(`${P} grew: ${ps.length ? ps[0].text + ' (at every one of the ' + ps.length + ')' : 'no plateau, nothing to grow'}`);
  else {
    const g = r.growth;
    const lm = r.growthLog.filter((x) => x.action === 'widen');
    say(`${P} grew at its plateaus: widen ${g.widen}${lm.length ? ' (lmax ' + lm[0].detail.from + ' -> ' + lm[lm.length - 1].detail.to + ')' : ''}, ingest ${g.ingest} (${g.prefetched} prefetched, ${g.builtInLoop} built in the loop${g.builtInLoop ? ', ' + f1(g.buildMsInLoop) + ' ms' : ''}; ${g.retired} retired; the stack ends on draws ${r.finalDraws[0]}..${r.finalDraws[r.finalDraws.length - 1]}), spawn ${g.spawn}; ${r.arms} arms; first: ${ps.length ? ps[0].text : 'none'}`);
  }
  say(`${P} ${r.projection.arithmetic}; measured: ${big(r.years.organismYears)} organism-years reached in ${secs(r.wallMs)} s`);
  return {
    label, plane, budgetS: r.wallBudgetMs / 1000, options: o, source: r.source,
    wallMs: r.wallMs, overshootMs: r.overshootMs, setupMs: r.setupMs, stopReason: r.stopReason,
    generations: r.generations, evals: r.evals, carried: r.carried, years: r.years, projection: r.projection,
    fresh: r.fresh.map((f, i) => ({ ...f, seenVerbatim: src.kind === 'grid' ? src.seenVerbatim(freshOf[plane][i].tasks) : null })),
    searched: { start: r.start.searched, end: r.end.searched },
    start: { tMs: r.start.tMs, gen: r.start.gen, fresh: r.start.fresh }, end: { tMs: r.end.tMs, gen: r.end.gen, fresh: r.end.fresh, draws: r.finalDraws, lmax: r.finalLmax, len: r.end.len },
    firstPlateauS: r.firstPlateauMs === null ? null : r.firstPlateauMs / 1000,
    firstJudgeableS: r.firstJudgeableMs === null ? null : r.firstJudgeableMs / 1000, searchedLastRoseS: r.searchedLastRoseMs === null ? null : r.searchedLastRoseMs / 1000,
    freshTimelines: r.fresh.map((f, i) => ({ name: f.name, ...r.freshTimelines[i], lastHighS: r.freshTimelines[i].lastHighMs / 1000, atHalfS: r.freshTimelines[i].atHalfMs / 1000 })),
    prefetch: r.prefetch,
    plateauCount: r.plateaus.length, plateausStored: 'the first 60 and the last 20',
    plateaus: (r.plateaus.length > 80 ? [...r.plateaus.slice(0, 60), ...r.plateaus.slice(-20)] : r.plateaus).map((p) => ({ t: Number(secs(p.atMs)), gen: p.gen, rate: p.rate, arm: p.arm, draws: p.draws, lmax: p.lmax, len: p.len, searched: p.searched, fresh: p.fresh, action: p.action, text: p.text, carried: p.carried ?? null, growthMs: p.growthMs ?? null })),
    growth: r.growth, arms: r.arms, finalDraws: r.finalDraws, finalLmax: r.finalLmax,
    best: r.best ? { len: r.best.len, searched: r.best.searched, genome: r.best.genome } : null,
    rows: rowsOut(r),
  };
}

const runs = [];
let control = null;
try {
  for (const plane of cfg.planes) {
    for (const s of cfg.budgets) {
      const src = planes[plane].source();
      const label = `${plane} ${s} s`;
      const r = await Y.yearsRun(src, { wallMs: s * 1000, fresh: freshOf[plane], prefetch: planes[plane].prefetch, seed: src.seed + ':years' });
      runs.push(report(label, plane, r, src));
    }
  }
  if (cfg.controlS) {
    const src = planes.grid.source();
    const r = await Y.yearsRun(src, { wallMs: cfg.controlS * 1000, fresh: freshOf.grid, prefetch: false, growth: false, seed: src.seed + ':years' });
    control = report(`control grid ${cfg.controlS} s, growth off`, 'grid', r, src);
  }
} finally {
  clearInterval(rssTimer);
  flag.lower();
}

// ---------------------------------------------------------------- [bar]
const at = (plane, s) => runs.find((r) => r.plane === plane && r.budgetS === s) || null;
const barRows = DEFAULTS.planes.map((p) => at(p, 300));
const primary = (r) => (r ? r.fresh[0] : null);
const perPlane = barRows.map((r, i) => ({
  plane: DEFAULTS.planes[i], ran: !!r,
  fresh: r ? primary(r).name : null, start: r ? primary(r).start : null, end: r ? primary(r).end : null, gained: r ? primary(r).gained : null,
  organismYears: r ? r.years.organismYears : null, perMillionYears: r ? primary(r).perMillionYears : null,
  firstPlateauS: r ? r.firstPlateauS : null, projectionArithmetic: r ? r.projection.arithmetic : null,
  gainedAboveZero: r ? primary(r).perMillionYears > 0 : false, plateauNamed: r ? r.firstPlateauS !== null : false,
  projectionCarriesArithmetic: r ? /^projection: .* generations per wall second \(measured: .*\) = .* s \(.* h\), a projection, not a measurement$/.test(r.projection.arithmetic) && r.years.arithmetic.includes('organism-year per generation') : false,
}));
const barMet = perPlane.every((p) => p.ran && p.gainedAboveZero && p.plateauNamed && p.projectionCarriesArithmetic);
say(`[bar] ${perPlane.map((p) => p.ran ? `${p.plane} 300 s: ${p.fresh} ${p.start} -> ${p.end}, ${p.perMillionYears.toFixed(3)} per million organism-years (${p.gainedAboveZero ? 'above zero' : 'NOT above zero'}), plateau at ${p.firstPlateauS === null ? 'NONE' : f3(p.firstPlateauS) + ' s'}, projection ${p.projectionCarriesArithmetic ? 'carries its arithmetic' : 'MISSING its arithmetic'}` : `${p.plane} 300 s: not run`).join('; ')}: ${barMet ? 'MET' : 'MISSED'}`);
if (control) {
  const g = at('grid', cfg.controlS);
  if (g) say(`[control] grid ${cfg.controlS} s, same seeds: growth on ${primary(g).start} -> ${primary(g).end} on ${primary(g).name} (${primary(g).perMillionYears.toFixed(3)} per million organism-years, ${big(g.years.organismYears)} organism-years); growth off ${primary(control).start} -> ${primary(control).end} (${primary(control).perMillionYears.toFixed(3)} per million organism-years, ${big(control.years.organismYears)} organism-years)`);
}
const peakRssMb = Math.max(peakRss, (process.resourceUsage().maxRSS || 0) * 1024) / MB;
say(`[rss] peak ${f1(peakRssMb)} MB (process maxRSS, the prefetch worker included); wall ${secs(since())} s`);

// ---------------------------------------------------------------- the verdict
const g300 = barRows[0], s300 = barRows[1];
const statement = (g300 && s300)
  ? `One organism-year is declared to be one generation of the whole population on a plane (${g300.options.popSize} children, ${g300.options.popSize} evaluations), so organism-years equal generations. ` +
    `On the grid plane the loop ran ${big(g300.years.organismYears)} organism-years in ${secs(g300.wallMs)} s and the searched best's score on the fresh draw ${primary(g300).name}, which the loop never searched or read, went from ${primary(g300).start} to ${primary(g300).end} of ${primary(g300).tasks}, ${primary(g300).perMillionYears.toFixed(3)} tasks gained per million organism-years; its first plateau was at ${f3(g300.firstPlateauS)} s (the searched score last rose before it at ${g300.searchedLastRoseS === null ? 'no row after generation 1' : f3(g300.searchedLastRoseS) + ' s'}), and it grew ${g300.growth.widen} times by widening, ${g300.growth.ingest} by ingesting a new draw and ${g300.growth.spawn} by spawning. ` +
    `That fresh score first reached its highest, ${g300.freshTimelines[0].high}, at ${f3(g300.freshTimelines[0].lastHighS)} s and never went higher; from half the wall to the end it moved by ${g300.freshTimelines[0].secondHalfGain}. ` +
    `On the synthetic plane it ran ${big(s300.years.organismYears)} organism-years in ${secs(s300.wallMs)} s and went from ${primary(s300).start} to ${primary(s300).end} of ${primary(s300).tasks} on ${primary(s300).name}, ${primary(s300).perMillionYears.toFixed(3)} per million organism-years, first plateau at ${f3(s300.firstPlateauS)} s. ` +
    `At the grid run's measured ${f1(g300.years.generationsPerSecond)} generations per wall second, one billion organism-years would take ${big(g300.projection.seconds)} s (${f1(g300.projection.hours)} h): a projection, not a measurement. ` +
    (control ? `With growth off (the control, ${cfg.controlS} s) the grid plane went from ${primary(control).start} to ${primary(control).end} on the same fresh draw. ` : '') +
    `The bar's fresh seeds were printed during development (a 3 s smoke run at a 2000 ms window, before the 250 ms window was chosen; development.barSeedExposures names every run that saw them). ` +
    `The machine was shared with other builders, so every rate is a contended wall-clock rate; no model was called.`
  : 'A narrower run: the 300 s run was not made on both planes, so the bar was not graded.';
const verdict = {
  name: 'years', at: new Date().toISOString(), command: ['node', 'bench/years.mjs', ...argv].join(' '), execArgv: process.execArgv, node: process.version,
  isTheBar, barMet: isTheBar ? barMet : false,
  bar: { rule: 'the 300 s run prints score gained per million organism-years above zero on both planes with the plateau second named, and the projection carries its arithmetic', perPlane },
  statement,
  declaration: { ...Y.YEAR, popSize: g300 ? g300.options.popSize : null, evaluationsPerGeneration: g300 ? g300.options.popSize : null, note: 'carried elites re-scored at an arm start are evaluations, not years; velocity.mjs declaredYears (ticks x seconds per tick) is a different declaration and is not used here' },
  plateauRule: { windowMs: Y.RUN_DEFAULTS.windowMs, floor: Y.RUN_DEFAULTS.floor, unit: 'searched score (mean tasks per draw minus length / 257) per wall second', firesOncePerArm: true, readsFresh: false },
  development: {
    seeds: ['years/dev', 'years/dev2', 'years/synthetic-dev'],
    chose: 'windowDraws 8 over 4 (60 s runs, window 2000 ms: fresh 145 against 141 on years/dev, 140 against 131 on years/dev2); then the plateau window 250 ms over 500 and 2000 (60 s runs, window 8 draws: mean fresh over the two dev seeds 146.5 at 250 ms, 141.0 at 500, 143.0 at 2000; one seed each, noise about 5 tasks); prefetch on, and the loop spawns instead of waiting when the next draw is still building',
    barSeedsSeenInDevelopment: true,
    barSeedExposures: [
      { at: '2026-09-24T08:26:12.481Z', command: 'node bench/years.mjs --budgets 3 --control-s 3', file: 'bench/verdicts/years-partial.json', windowMs: 2000, printed: 'grid 3 s: grid/velocity:heldout 49 -> 123, grid/velocity:years1 53 -> 119, grid/velocity:years2 62 -> 111; synthetic 3 s: years/synthetic:fresh0 89 -> 256, years/synthetic:fresh1 100 -> 256; control grid 3 s, growth off: 49 -> 109, 53 -> 108, 62 -> 101', after: 'the plateau window went from 2000 ms to 250 ms after this smoke run. The 250 ms choice is recorded above as made on the dev seeds, but it was made after these bar-seed scores had been printed, so it cannot be certified blind to them' },
      { at: '2026-09-24T08:33:50.591Z', command: 'node bench/years.mjs (the builder bar, pid 10428)', printed: 'the grid 10 s and 60 s runs on the bar seeds; killed about 240 s in, no verdict written', after: 'no search parameter changed after it' },
      { at: null, command: 'node bench/years.mjs --budgets 10,60,300 --no-control (the verify plane, a reduced run)', printed: 'every bar seed at 10, 60 and 300 s; no control', after: 'no search parameter changed after it' },
      { at: null, command: 'the fix stage that wrote this file: one smoke of its new prints, node bench/years.mjs --budgets 1 --no-control --planes grid,synthetic', printed: 'every bar seed at 1 s (the seed was left at its default by mistake; its partial file was then replaced by the 08:26 smoke file above, restored byte for byte)', after: 'changed: the prefetch worker posts its failure on the polled port and a stall clock writes a silent worker off, the worker closes on every path, and the bench prints when each fresh score stopped rising and the second the searched score last rose before the first plateau; a test now kills the mutant whose plateau reads the fresh score. No search parameter changed (population, lmax, window, floor, draws per stack, seeds)' },
    ],
    note: cfg.seed + ':heldout was printed by Boards 8 and 10 as well; ' + cfg.seed + ':years1 and :years2 were first printed by the smoke run above',
  },
  machine: { platform: process.platform, cpus: os.cpus().length, totalMemMB: Math.round(os.totalmem() / MB), freeMemGBStart: Number(f1(freeAtStart)), freeMemGBEnd: Number(f1(freeGb())), shared: 'seven builders share this machine tonight; every rate is a contended wall-clock rate; no Ollama call was made by this bench' },
  peakRssMb: Number(f1(peakRssMb)), wallMs: since(),
  runs, control,
};
mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(verdict, null, 1) + '\n');
say(`[verdict] ${path.relative(ROOT, OUT)} written (isTheBar ${isTheBar}, barMet ${verdict.barMet})`);
