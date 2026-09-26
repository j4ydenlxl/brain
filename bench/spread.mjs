// bench/spread.mjs: THE SPREAD BAR (Board 14, item spread). generations/spread.mjs says what a spread
// population IS; this runs it with spread ON and, on the SAME seeds for the SAME generations, with
// spread OFF (the control), and prints what spreading buys:
//
//   organism-years simulated (generations/years.mjs: one engine generation of the whole engine
//     population is one organism-year), generations per second, improvements kept, the generation at
//     which each kept improvement reached all N instances (N: daemon/multiply.mjs POPULATION_SIZE),
//     the held-out score with spread ON against spread OFF on the same seeds with the seed-to-seed
//     noise, and the candidates promoted with their simulated before and after.
//
//   BAR: ON beats OFF on the held-out score by more than the seed-to-seed noise (the larger sample
//   standard deviation of the two arms over the seeds), AND every kept improvement reached all N
//   instances within k generations (k read off the connectome), AND at least one candidate was
//   promoted with its before and after printed. A null printed with its noise is a landing.
//
//   node bench/spread.mjs [--cache <dir>]                          the bar: 5 seeds, a 300 s run
//   node bench/spread.mjs --seeds 2 --wall-s 20 [--no-promote]     a partial run (-partial.json, isTheBar false)
//   node bench/spread.mjs --trial [--cache <dir>]                  one "metric <n>" line: the file's OPTIONS on the promotion seeds
//
// Board 20 builder (the flags below never make a run the bar, except --state-root, which only moves
// where a promotion is written):
//   --state-root <dir>      a promotion writes <dir>/state/self/gaps.jsonl, not this tree's state/
//   --dev                   scores the development draws (generations/spread.mjs DEV_SEEDS) on the seeds
//                           spread/dev/<i>, never the held-out ones: spread-dev-partial.json
//   --intervention off      the population as it was before board 20 (BEFORE_BOARD20), the control of
//                           the board 20 change: spread-intervention-off.json (-partial when narrower)
//   --rate                  writes bench/verdicts/spread-rate.json (organism-years per wall hour of
//                           years.json and spread.json, web/ladder.mjs rateRecord); every bar run ends with it
//
// The 300 s are the whole run's trial wall: 5 seeds x 2 arms, 30 s each. The ON arm runs its 30 s
// and stops at a generation count G; the OFF arm runs exactly G generations (a matched control is
// matched in generations, not wall). Held-out and promotion bursts come after and are counted apart.
// The bar runs under the budget:
//
//   node tools/budget.mjs --ram-mb 6000 --disk-mb 64 --dir <out> -- node --max-old-space-size=6000 bench/spread.mjs --cache <out>/mx
//
// No model is called (the author operator is skipped, "model off"). No network.
import { mkdirSync, writeFileSync, renameSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSuite, gridMatrixCached, SUITE, POPULATION_SIZE } from '../daemon/multiply.mjs';
import { drawSeeds, stackDraws } from '../generations/velocity.mjs';
import { projectSeconds, yearsArithmetic } from '../generations/years.mjs';
import {
  SpreadPopulation, loadRegistry, SPREAD, OPTIONS, STRATEGY, AUTHOR, confirmSurvivors, promotedLine, promote, trialMetric, sampleSd, spreadChecks, BEFORE_BOARD20, DEV_SEEDS,
} from '../generations/spread.mjs';
import { rateRecord, RATE } from '../web/ladder.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = (n) => argv.includes('--' + n);
const opt = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const say = (l) => console.log(l);
const r4 = (x) => Math.round(x * 1e4) / 1e4, r6 = (x) => Math.round(x * 1e6) / 1e6;
const fmtInt = (x) => Math.round(x).toLocaleString('en-US');
const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;

const BAR = Object.freeze({ seeds: 5, wallS: 300 });

function writeJson(file, v) {
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.' + process.pid + '.tmp';
  writeFileSync(tmp, JSON.stringify(v, null, 2) + '\n');
  renameSync(tmp, file);
}

// ---------------------------------------------------------------- --rate: organism-years per wall hour (board 20 builder)
/** Write bench/verdicts/spread-rate.json from years.json and spread.json as they are on disk now; print its arithmetic. */
function writeRate(vdir) {
  const read = (n) => { try { return JSON.parse(readFileSync(path.join(vdir, n), 'utf8')); } catch { return null; } };
  const rec = rateRecord({ years: read('years.json'), spread: read('spread.json') }, { command: 'node bench/spread.mjs --rate' });
  writeJson(path.join(vdir, RATE), rec);
  for (const r of rec.sources) say('[spread] organism-years per wall hour, ' + r.label + ': ' + r.arithmetic);
  say('[spread] wrote bench/verdicts/' + RATE + ' (' + rec.sources.length + ' source verdicts)');
  return rec;
}
if (flag('rate')) {
  writeRate(path.join(ROOT, 'bench', 'verdicts'));
  process.exit(0);
}

// ---------------------------------------------------------------- --trial: the promoted line's metric
if (flag('trial')) {
  const cacheDir = opt('cache', null);
  if (cacheDir) mkdirSync(cacheDir, { recursive: true });
  const seeds = drawSeeds(SUITE.seed, SUITE.draws);
  const parts = seeds.map((s) => gridMatrixCached(s, { maxDepth: SUITE.maxDepth, cacheDir }).matrix);
  const matrix = parts.length === 1 ? parts[0] : stackDraws(parts, { name: 'grid:' + parts.length + 'draws', meta: { runSeed: SUITE.seed, seeds, maxDepth: SUITE.maxDepth } });
  const m = trialMetric(matrix, OPTIONS, STRATEGY);
  say('spread trial: OPTIONS ' + JSON.stringify(OPTIONS) + ', STRATEGY ' + STRATEGY + ', seeds ' + m.xs.map(r6).join(' '));
  say('metric ' + r6(m.mean));
  process.exit(0);
}

// ---------------------------------------------------------------- the bar
const seedsN = Number(opt('seeds', BAR.seeds)), wallS = Number(opt('wall-s', BAR.wallS));
const noPromote = flag('no-promote');
// board 20 builder: --dev scores the development draws (DEV_SEEDS) in place of the held-out ones and is never the bar;
// --intervention off runs the population as it was before board 20 (BEFORE_BOARD20), the control of the board 20 change;
// --state-root <dir> is the tree a promotion writes its ledger lines into (default: this tree).
const dev = flag('dev');
const interventionOff = opt('intervention', 'on') === 'off';
const cfgOver = interventionOff ? { ...BEFORE_BOARD20 } : {};
const runCfg = { ...SPREAD, ...cfgOver };
const stateRoot = opt('state-root', null) ? path.resolve(opt('state-root')) : ROOT;
const fullN = seedsN === BAR.seeds && wallS === BAR.wallS && !noPromote;
const isTheBar = fullN && !dev && !interventionOff;
const VDIR = path.join(ROOT, 'bench', 'verdicts');
const stem = dev ? 'spread-dev-partial' : interventionOff ? 'spread-intervention-off' + (fullN ? '' : '-partial') : isTheBar ? 'spread' : 'spread-partial';
const command = ['node', ...process.execArgv, 'bench/spread.mjs', ...argv].join(' ');
const perArmMs = (wallS * 1000) / (seedsN * 2);
const t00 = performance.now();

say('[spread] ' + (isTheBar ? 'THE BAR' : dev ? 'a DEVELOPMENT run (--dev: scored on ' + DEV_SEEDS.join(', ') + ', never the bar)' : interventionOff ? 'the CONTROL of the board 20 change (--intervention off: ' + JSON.stringify(BEFORE_BOARD20) + '), never the bar' : 'a partial run (flags differ from the bar)') + ': ' + seedsN + ' seeds, a ' + wallS + ' s run (' + (perArmMs / 1000) + ' s per arm per seed), N = ' + POPULATION_SIZE + ' (daemon/multiply.mjs POPULATION_SIZE), S = ' + SPREAD.survive + ', replicate ' + runCfg.replicate + ', confirm ' + runCfg.confirm + ', model off');
const registry = await loadRegistry({ say });
say('[spread] registry: operators ' + registry.operatorNames.join(', ') + ' from ' + registry.from.operators + '; step ' + registry.stepFrac + ' and bands from ' + registry.from.knobs + '; trials per round ' + registry.trialsPerRound);
const suite = loadSuite({ cacheDir: opt('cache', null) });
if (dev) {
  for (const s of DEV_SEEDS) if (suite.seeds.includes(s) || suite.freshSeeds.includes(s)) throw new Error('a development draw is a searched or held-out draw: ' + s);
  suite.fresh = DEV_SEEDS.map((s) => ({ seed: s, matrix: gridMatrixCached(s, { maxDepth: SUITE.maxDepth, cacheDir: opt('cache', null) }).matrix }));
  suite.freshSeeds = [...DEV_SEEDS];
  say('[spread] development: the held-out draws are NOT scored in this run; the ' + suite.fresh.length + ' development draws (' + suite.fresh.reduce((s, f) => s + f.matrix.T, 0) + ' tasks) stand in their place');
}
say('[spread] suite: ' + suite.seeds.length + ' searched draws (T = ' + suite.matrix.T + '), ' + suite.fresh.length + ' fresh draws held out (' + suite.fresh.reduce((s, f) => s + f.matrix.T, 0) + ' tasks), ' + suite.cached + ' cached, ' + suite.built + ' built, ' + Math.round(suite.ms) + ' ms');

const MARKS = [0, 0.25, 0.5, 0.75, 1];
const rowAt = (pop, G, f) => { const g = Math.max(-1, Math.round(f * G) - 1); return pop.history.find((h) => h.g === g) || pop.history[pop.history.length - 1]; };

const perSeed = [];
const allSurvivors = [];
let partialWhy = null;
try {
  for (let i = 0; i < seedsN; i++) {
    const seed = (dev ? 'spread/dev/' : 'spread/bar/') + (i + 1); // board 20 builder: development runs evolve on their own seeds
    const on = new SpreadPopulation({ suite, seed, spread: true, registry, cfg: cfgOver });
    on.run({ wallMs: perArmMs });
    const G = on.stats.generations;
    on.drain();
    const off = new SpreadPopulation({ suite, seed, spread: false, registry, cfg: cfgOver });
    off.run({ generations: G });
    off.drain(on.drained);
    const heldOn = on.heldOut(), heldOff = off.heldOut();
    const marks = MARKS.map((f) => ({ f, g: rowAt(on, G, f).g, on: r6(on.heldOut(rowAt(on, G, f)).mean), off: r6(off.heldOut(rowAt(off, G, f)).mean) }));
    const reach = on.reach();
    const surv = on.survivors();
    for (const a of surv) allSurvivors.push({ ...a, run: seed });
    const yOn = on.years(), yOff = off.years();
    const rec = {
      seed, generations: G, k: on.k, drained: on.drained,
      on: { wallMs: Math.round(on.stats.wallMs), organismYears: yOn.organismYears, evals: yOn.evals, trials: on.stats.trials, kept: on.stats.kept, received: on.stats.received, refused: on.stats.refused, adopted: on.stats.adopted, reverted: on.stats.reverted, modelOff: on.stats.modelOff, heldOut: r6(heldOn.mean), perInstance: Object.fromEntries(Object.entries(heldOn.per).map(([k, v]) => [k, r6(v)])), final: on.history[on.history.length - 1].configs, survivors: surv.length },
      off: { wallMs: Math.round(off.stats.wallMs), organismYears: yOff.organismYears, evals: yOff.evals, trials: off.stats.trials, kept: off.stats.kept, received: off.stats.received, refused: off.stats.refused, reverted: off.stats.reverted, modelOff: off.stats.modelOff, noPartner: off.stats.noPartner, heldOut: r6(heldOff.mean), perInstance: Object.fromEntries(Object.entries(heldOff.per).map(([k, v]) => [k, r6(v)])), final: off.history[off.history.length - 1].configs },
      marks,
      reach: { kept: reach.length, reachedAll: reach.filter((x) => x.reachedAll).length, withinK: reach.filter((x) => x.withinK).length, maxTicks: reach.reduce((m, x) => Math.max(m, x.ticks ?? Infinity), 0), moves: reach.map((x) => [x.id, x.gen, x.reachedAllAt]) },
    };
    perSeed.push(rec);
    say('[spread] ' + seed + ': ON ' + G + ' generations in ' + (rec.on.wallMs / 1000).toFixed(1) + ' s, ' + fmtInt(rec.on.organismYears) + ' organism-years, ' + rec.on.trials + ' trials, ' + rec.on.kept + ' kept, ' + rec.on.adopted + ' genes adopted; OFF ' + G + ' generations in ' + (rec.off.wallMs / 1000).toFixed(1) + ' s, ' + rec.off.trials + ' trials, ' + rec.off.kept + ' kept');
    say('[spread]   reach: ' + rec.reach.reachedAll + ' of ' + rec.reach.kept + ' kept improvements reached all ' + on.ids.length + ' instances, ' + rec.reach.withinK + ' within k = ' + on.k + ' (max ' + rec.reach.maxTicks + ' generations after the keep; first: ' + reach.slice(0, 3).map((x) => x.id + ' kept g' + x.gen + ' all by g' + x.reachedAllAt).join(', ') + ')');
    say('[spread]   held-out: ON ' + rec.on.heldOut.toFixed(6) + ', OFF ' + rec.off.heldOut.toFixed(6) + ' (diff ' + (rec.on.heldOut - rec.off.heldOut).toFixed(6) + '); along the run ' + marks.map((m) => 'g' + m.g + ' ' + m.on.toFixed(4) + '/' + m.off.toFixed(4)).join(', '));
  }
} catch (e) {
  partialWhy = 'the run stopped after ' + perSeed.length + ' of ' + seedsN + ' seeds: ' + String((e && e.stack) || e).split('\n').slice(0, 3).join(' | ');
  say('[spread] ' + partialWhy);
}

// ---------------------------------------------------------------- promotion
const runTag = new Date().toISOString().slice(0, 10) + '-' + (isTheBar ? 'bar' : dev ? 'dev' : interventionOff ? 'intervention-off' : 'partial');
let conf = { rows: [], confirmed: [] }, promoted = { written: 0, how: noPromote ? '--no-promote' : 'not reached' }, lines = [];
if (!partialWhy && allSurvivors.length) {
  conf = confirmSurvivors(suite.matrix, allSurvivors, { cfg: runCfg, floor: SPREAD.floorTasks / suite.matrix.T });
  lines = conf.confirmed.map((row) => promotedLine(row, { runTag }));
  if (!noPromote) promoted = await promote(lines, { root: stateRoot, spread: true, say });
}
say('[spread] survivors: ' + allSurvivors.length + ' kept moves still held by every instance ' + SPREAD.survive + ' generations later; ' + conf.rows.length + ' distinct confirmed on the file OPTIONS (base ' + (conf.baseXs ? mean(conf.baseXs).toFixed(6) : 'n/a') + '), ' + conf.confirmed.length + ' beat the range noise');
for (const l of lines) say('[spread]   promoted ' + l.id + ': ' + Object.entries(l.simulated.knobs).map(([k, v]) => k + ' ' + v.asRead + ' -> ' + v.to).concat(l.simulated.strategy ? ['strategy -> ' + l.simulated.strategy] : []).join(', ') + ', simulated before ' + l.simulated.before.toFixed(6) + ', after ' + l.simulated.after.toFixed(6) + ' (gain ' + l.simulated.gain.toFixed(6) + ', noise ' + l.simulated.noise.toFixed(6) + '), author ' + l.author);
say('[spread] promotion: ' + promoted.written + ' written, ' + promoted.how + (promoted.written ? ', into ' + (stateRoot === ROOT ? 'this tree' : stateRoot) : ''));

// ---------------------------------------------------------------- the numbers
const done = perSeed.length;
const on = perSeed.map((r) => r.on.heldOut), off = perSeed.map((r) => r.off.heldOut);
const genTotal = perSeed.reduce((s, r) => s + r.generations, 0);
const years = perSeed.reduce((s, r) => s + r.on.organismYears + r.off.organismYears, 0);
const yearsOn = perSeed.reduce((s, r) => s + r.on.organismYears, 0);
const trialWallMs = perSeed.reduce((s, r) => s + r.on.wallMs + r.off.wallMs, 0);
const evals = perSeed.reduce((s, r) => s + r.on.evals + r.off.evals, 0);
const ya = yearsArithmetic({ generations: years, popSize: SPREAD.burstPop, evals, wallMs: trialWallMs });
const proj = years > 0 ? projectSeconds({ generations: years, wallMs: trialWallMs }) : null;
const keptOn = perSeed.reduce((s, r) => s + r.on.kept, 0), keptOff = perSeed.reduce((s, r) => s + r.off.kept, 0);
const reachedAll = perSeed.reduce((s, r) => s + r.reach.reachedAll, 0), withinK = perSeed.reduce((s, r) => s + r.reach.withinK, 0);
const maxTicks = perSeed.reduce((m, r) => Math.max(m, r.reach.maxTicks), 0);
const k = perSeed.length ? perSeed[0].k : null;
const gps = years / (trialWallMs / 1000), spreadGps = (2 * genTotal) / (trialWallMs / 1000);
const keptPerM = yearsOn > 0 ? (keptOn / yearsOn) * 1e6 : null;
// the rule is generations/spread.mjs spreadChecks (board 20 builder moved it there so a test can hold it); unchanged
const rule = spreadChecks({ on, off, keptOn, withinK, promoted: promoted.written });
const { checks, noise, sdOn, sdOff, pairedSd } = rule, meanDiff = rule.diff;
const barMet = !partialWhy && isTheBar && Object.values(checks).every(Boolean);
const runWallS = r4((performance.now() - t00) / 1000);
const perWallHour = runWallS > 0 ? Math.round((years / runWallS) * 3600) : null;

say('[spread] organism-years simulated: ' + ya.arithmetic);
say('[spread] generations per second: ' + gps.toFixed(1) + ' engine generations (organism-years) per trial wall second; ' + spreadGps.toFixed(2) + ' population generations per second (' + fmtInt(2 * genTotal) + ' generations, both arms, in ' + (trialWallMs / 1000).toFixed(1) + ' s)');
if (proj) say('[spread] ' + proj.arithmetic);
say('[spread] organism-years per wall hour: ' + fmtInt(years) + ' organism-years / ' + runWallS.toFixed(3) + ' s (the whole run) x 3,600 s per hour = ' + (perWallHour === null ? 'n/a' : fmtInt(perWallHour)));
say('[spread] improvements kept: ON ' + keptOn + ', OFF ' + keptOff + ' (' + (keptPerM === null ? 'n/a' : keptPerM.toFixed(2)) + ' kept per million ON organism-years)');
say('[spread] reach: ' + reachedAll + ' of ' + keptOn + ' kept improvements reached all ' + POPULATION_SIZE + ' instances; ' + withinK + ' within k = ' + k + ' generations; the latest reached them all ' + maxTicks + ' generation(s) after it was kept');
say('[spread] ' + (dev ? 'development (' + DEV_SEEDS.join(', ') + ')' : 'held-out (grid/velocity:heldout + fresh1..4)') + ': ON ' + on.map((x) => x.toFixed(6)).join(' ') + ' | OFF ' + off.map((x) => x.toFixed(6)).join(' '));
say('[spread] ' + (dev ? 'development' : 'held-out') + ' mean ON ' + (done ? mean(on).toFixed(6) : 'n/a') + ' vs OFF ' + (done ? mean(off).toFixed(6) : 'n/a') + ': diff ' + meanDiff.toFixed(6) + ', seed-to-seed noise ' + noise.toFixed(6) + ' (sd ON ' + sdOn.toFixed(6) + ', sd OFF ' + sdOff.toFixed(6) + '; paired sd ' + pairedSd.toFixed(6) + ')');
say('[spread] promoted: ' + promoted.written + ' candidate(s)');
say('[spread] bar: ON beats OFF by more than the noise ' + checks.onBeatsOffByMoreThanNoise + ', every kept improvement reached all within k ' + checks.everyKeptReachedAllWithinK + ', at least one promoted ' + checks.promotedAtLeastOne + ' -> barMet ' + barMet + (isTheBar ? '' : ' (a partial run is never the bar)'));

const statement = (partialWhy ? 'PARTIAL: ' + partialWhy + '. ' : '')
  + (dev ? 'DEVELOPMENT run: the scores below are on the development draws, not the held-out ones. ' : interventionOff ? 'CONTROL of the board 20 change: replicate ' + runCfg.replicate + ', confirm ' + runCfg.confirm + '. ' : '')
  + 'Spread ON against spread OFF on the same ' + done + ' seeds, the same generations each (' + perSeed.map((r) => r.generations).join(', ') + '), N = ' + POPULATION_SIZE + ' organisms. '
  + 'Simulated ' + fmtInt(years) + ' organism-years at ' + gps.toFixed(1) + ' per second. ON kept ' + keptOn + ' improvements, OFF ' + keptOff + '; ' + withinK + ' of ' + keptOn + ' reached all ' + POPULATION_SIZE + ' instances within k = ' + k + '. '
  + 'Held-out: ON ' + (done ? mean(on).toFixed(6) : 'n/a') + ' vs OFF ' + (done ? mean(off).toFixed(6) : 'n/a') + ', diff ' + meanDiff.toFixed(6) + ' against a seed-to-seed noise of ' + noise.toFixed(6) + (checks.onBeatsOffByMoreThanNoise ? ': ON beats OFF by more than the noise.' : ': ON does not beat OFF by more than the noise, a null at this run length.') + ' '
  + promoted.written + ' candidate(s) promoted (confirmation: ' + runCfg.confirm + '; receivers replicate: ' + runCfg.replicate + '). ' + fmtInt(years) + ' organism-years in a ' + runWallS.toFixed(1) + ' s run is ' + (perWallHour === null ? 'n/a' : fmtInt(perWallHour)) + ' organism-years per wall hour. barMet ' + barMet + '.';

const common = {
  at: new Date().toISOString(), command, node: process.version, item: 'spread', board: 14, author: AUTHOR, revisedBy: 'board 20 builder', modelCalls: 0, mode: dev ? 'dev' : interventionOff ? 'intervention-off' : 'spread',
  split: {
    seeds: perSeed.map((r) => r.seed), perArmWallS: perArmMs / 1000, runWallS, matchedOn: 'generations: OFF runs exactly the generations ON reached in its wall',
    searched: SUITE.seed + ' K = ' + SUITE.draws + ' draws (' + suite.matrix.T + ' tasks)',
    heldOut: dev ? 'none: --dev scored the development draws in their place' : suite.freshSeeds.join(', ') + ' (' + suite.fresh.reduce((s, f) => s + f.matrix.T, 0) + ' tasks), scored only after the run',
    development: DEV_SEEDS.join(', ') + ' (grid draws built like the held-out ones, never searched, never held out) and the seeds spread/dev/<i>: board 20 chose replicate and confirm on them (node bench/spread.mjs --dev)' + (dev ? '; THIS run scored them' : ''),
    contaminated: false,
    exposures: 'the held-out draws were scored by the board 14 bar runs of 2026-09-24 (the earlier spread.json) and by no board 20 development run',
    replicate: runCfg.replicate, confirm: runCfg.confirm, heldSeeds: runCfg.heldSeeds,
    population: POPULATION_SIZE, k, survive: SPREAD.survive, burst: SPREAD.burstGens + ' engine generations x ' + SPREAD.burstPop + ' children', options: OPTIONS, strategy: STRATEGY,
  },
  wallS: runWallS,
};
const verdict = {
  ...common, isTheBar: isTheBar && !partialWhy, barMet, checks,
  organismYears: years, organismYearsOn: yearsOn, organismYearsPerWallHour: perWallHour, generationsPerSecond: r4(gps), spreadGenerationsPerSecond: r4(spreadGps), improvementsKept: keptOn, keptPerMillionOrganismYears: keptPerM === null ? null : r4(keptPerM),
  years: { arithmetic: ya.arithmetic, declaration: ya.declaration, projection: proj ? proj.arithmetic : null },
  heldOut: { on: on.map(r6), off: off.map(r6), meanOn: done ? r6(mean(on)) : null, meanOff: done ? r6(mean(off)) : null, diff: r6(meanDiff), sdOn: r6(sdOn), sdOff: r6(sdOff), noise: r6(noise), pairedSd: r6(pairedSd), marks: perSeed.map((r) => ({ seed: r.seed, marks: r.marks })) },
  reach: { kept: keptOn, reachedAll, withinK, k, maxTicks, perSeed: perSeed.map((r) => ({ seed: r.seed, ...r.reach })) },
  promoted: { count: promoted.written, how: promoted.how, lines: lines.map((l) => ({ id: l.id, before: l.simulated.before, after: l.simulated.after, gain: l.simulated.gain, noise: l.simulated.noise, knobs: l.simulated.knobs, strategy: l.simulated.strategy, author: l.author })), survivors: allSurvivors.length, confirmedRows: conf.rows.length },
  perSeed: perSeed.map((r) => ({ seed: r.seed, generations: r.generations, on: r.on, marks: r.marks })),
  registry: { landed: registry.landed, missing: registry.missing, operators: registry.operatorNames, from: registry.from },
  statement,
};
const control = {
  ...common, isTheBar: isTheBar && !partialWhy, barMet, checks, arm: 'OFF',
  statement: 'The control of bench/verdicts/' + (partialWhy && isTheBar ? 'spread-partial' : stem) + '.json: spread OFF, the same seeds and the same generations, no conduits, no adoption, no promotion. Held-out ' + off.map((x) => x.toFixed(6)).join(' ') + ' (sd ' + sdOff.toFixed(6) + '); OFF kept ' + keptOff + ' improvements. ' + statement,
  heldOut: { off: off.map(r6), meanOff: done ? r6(mean(off)) : null, sdOff: r6(sdOff) },
  perSeed: perSeed.map((r) => ({ seed: r.seed, generations: r.generations, off: r.off })),
};
const vfile = path.join(VDIR, (partialWhy && isTheBar ? 'spread-partial' : stem) + '.json');
const cstem = dev ? 'spread-dev-control-partial' : interventionOff ? 'spread-intervention-off-control' + (fullN ? '' : '-partial') : (partialWhy && isTheBar ? 'spread-control-partial' : isTheBar ? 'spread-control' : 'spread-control-partial');
const cfile = path.join(VDIR, cstem + '.json');
if (partialWhy || !isTheBar) { verdict.isTheBar = false; control.isTheBar = false; }
writeJson(vfile, verdict);
writeJson(cfile, control);
if (vfile === path.join(VDIR, 'spread.json')) writeRate(VDIR);
say('[spread] wrote ' + path.relative(ROOT, vfile).replaceAll('\\', '/') + ' and ' + path.relative(ROOT, cfile).replaceAll('\\', '/') + ' (isTheBar ' + verdict.isTheBar + ', barMet ' + barMet + '), ' + runWallS + ' s, rss ' + Math.round(process.memoryUsage().rss / 1048576) + ' MB');
