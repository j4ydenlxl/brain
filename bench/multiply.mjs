// bench/multiply.mjs: MULTIPLYING, MEASURED AS AN ISLAND MODEL (his P15, 2026-09-23: "multiplying,
// duplicating, all within cloud"; board 24B item multiply-suite). daemon/multiply.mjs runIslands()
// runs N instances of the grid plane search in lock step, by generation COUNT and by EVALUATIONS,
// so every number here is a pure function of the seed, the budget and the flags (a loaded desk
// changes the wall seconds and nothing else). This bench asks one question: do N instances that
// swap elites beat one instance given the same total organism-years?
//
//   [suite]   every candidate suite (grid draws x library length cap) built once into <out>/matrices
//   [probe]   THE CONTROL alone (one instance with N times the population) on the three TUNING seeds
//             of each candidate, at the bar's budget: its searched end score and its slope over the
//             last quarter of the budget. The suite is the LARGEST candidate whose control still
//             rises on all three tuning seeds inside the 120 s wall. None rising prints SATURATED and
//             stops with barMet false.
//   [decide]  on the five DECIDING seeds, three arms at the same total evaluations:
//               islands   N instances, elite exchange every M generations (all to all, --migrants each)
//               noexch    the same N instances with the exchange off (the second control)
//               single    ONE instance with N times the population (the first control)
//             each arm's pick by the searched objective, scored on 8 fresh draws (1280 tasks)
//   [bar]     islands beat BOTH controls by more than the seed band: the islands' mean held-out score
//             over the five deciding seeds minus the control's is above the wider of the two arms'
//             min..max ranges over those seeds
//
//   node bench/multiply.mjs [--n 4] [--every 10] [--migrants 8] [--evals 800000] [--out DIR]
//   (M = 10 was chosen by node bench/multiply.mjs --tune on the tuning seeds, searched objective only:
//   bench/verdicts/multiply-tune-partial.json)
//   node bench/multiply.mjs --tune [--tune-every 10,50,200] [--suite k64-l256]      (development)
//
// With no flags (or only --out, which moves the files and changes nothing measured) this is the bar
// and writes bench/verdicts/multiply.json with isTheBar true; --tune writes multiply-tune-partial.json
// and any other flag multiply-run-partial.json, both isTheBar false. The bar runs under the budget:
//
//   node tools/budget.mjs --ram-mb 4000 --disk-mb 500 --dir <out> -- node --max-old-space-size=4000
//        bench/multiply.mjs --out <out>
//
// THE CONTROL IS GIVEN N TIMES THE POPULATION, NOT N TIMES THE WALL. The island literature compares
// an island model with a single panmictic population of the SAME TOTAL SIZE at the SAME TOTAL NUMBER
// OF EVALUATIONS (Whitley, Rana and Heckendorn, "The island model genetic algorithm"; Cantu-Paz's
// survey of parallel genetic algorithms; Alba and Tomassini, "Parallelism and evolutionary
// algorithms"). N times the wall would hand the control N times the generations of a population a
// quarter the size: a different search depth, and a comparison the islands lose or win on depth
// alone. N times the population holds the generation count, the children per generation and the
// evaluations equal, so the only difference left is the structure: one population or N that trade.
// Organism-years are priced as generations/years.mjs declares them (one year = one generation of the
// 64-child population of yearsRun), so organism-years = evaluations / 64 for every arm.
//
// MODEL OFF: provider null, no socket, no model call. At most 4 worker threads at once, at most 120 s
// of wall per arm (a guard: an arm that reaches it stops early and says so, and cannot meet the bar).
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runIslands, lastQuarter, loadSuite, writeJsonAtomic } from '../daemon/multiply.mjs';
import { raiseBenchFlag, benchFlag } from '../daemon/run.mjs';

// board 19 builder: the split the bar was measured on (the gate's CONTAMINATION row needs an object).
// board 24B builder (multiply-suite): it names the tuning seeds and the deciding seeds.
/** What the multiply bar developed on and what it held out: pure, from the suite and the seeds. */
export function splitFor(opts = {}) {
  const suite = opts.suite || {};
  const seed = suite.seed || 'grid/velocity';
  const fresh = suite.fresh || 'grid/velocity:heldout';
  const more = Number.isFinite(suite.freshMore) ? suite.freshMore : 4;
  const draws = [fresh].concat(Array.from({ length: more }, (_, i) => seed + ':fresh' + (i + 1)));
  const tune = Array.isArray(opts.tuneSeeds) ? opts.tuneSeeds.map(String) : [];
  const decide = Array.isArray(opts.decideSeeds) ? opts.decideSeeds.map(String) : [];
  const devFresh = Number(opts.devFreshScored) || 0;
  const overlap = decide.filter((s) => tune.includes(s));
  const K = suite.draws ?? 4;
  const contaminated = overlap.length ? 'the deciding seeds ' + overlap.join(', ') + ' are also tuning seeds, so the run that decides reused a seed the suite and M were chosen on'
    : devFresh > 0 ? 'the development runs scored ' + devFresh + ' fresh draws, so a held-out draw informed a choice' : false;
  return {
    development: {
      what: 'the searched suite (' + K + ' grid draws of seed ' + seed + (suite.lmax ? ', library cap ' + suite.lmax : '') + ') and the TUNING seeds ' + (tune.length ? tune.join(', ') : '(none in this run)') +
        ': the saturation probe of every candidate suite and the M sweep ran on them and read the searched objective only; the fresh draws were never loaded into those runs',
      seed, draws: K, tuneSeeds: tune, freshScoredInDevelopment: devFresh,
    },
    heldOut: {
      what: 'the DECIDING seeds ' + (decide.length ? decide.join(', ') : '(none in this run)') + ', which the tuning seeds never touched (no suite, cap, M or budget was chosen on them), and the fresh draws ' +
        draws.join(', ') + ', never searched and never used to pick: each arm is scored by its pick by the searched objective on them',
      decideSeeds: decide, draws,
    },
    contaminated,
  };
}

/** Mean, sample sd, min, max and range of a list of numbers. Pure. */
export function bandOf(xs) {
  const n = xs.length;
  if (!n) return { n: 0, mean: null, sd: null, min: null, max: null, range: null, values: [] };
  const mean = xs.reduce((a, x) => a + x, 0) / n;
  const sd = n > 1 ? Math.sqrt(xs.reduce((a, x) => a + (x - mean) ** 2, 0) / (n - 1)) : 0;
  const min = Math.min(...xs), max = Math.max(...xs);
  return { n, mean, sd, min, max, range: max - min, values: xs.slice() };
}

/** Does arm a beat control c by more than the seed band (the wider of the two min..max ranges)? Pure. */
export function beats(a, c) {
  const band = Math.max(a.range, c.range);
  const gap = a.mean - c.mean;
  return { gap, band, beat: gap > band };
}

/** The suite: the LAST (largest) probed candidate whose control rose on every tuning seed inside the wall, else null. Pure. */
export function chooseSuite(rows) {
  let pick = null;
  for (const r of rows) if (r.rising) pick = r;
  return pick;
}

// The candidates, cheapest first: the prior bar's suite, then the library cap raised, then more draws.
export const CANDIDATES = Object.freeze([
  { name: 'k4-ladder', draws: 4, lmax: null, what: 'the prior bar suite: 4 grid draws, the library cap of the plane ladder (32 to 96)' },
  { name: 'k4-l256', draws: 4, lmax: 256, what: '4 grid draws, library cap raised to 256' },
  { name: 'k16-l256', draws: 16, lmax: 256, what: '16 grid draws, library cap 256' },
  { name: 'k32-l256', draws: 32, lmax: 256, what: '32 grid draws, library cap 256' },
  { name: 'k64-l256', draws: 64, lmax: 256, what: '64 grid draws, library cap 256' },
]);
export const suiteOf = (c) => ({ kind: 'grid', seed: 'grid/velocity', draws: c.draws, maxDepth: 3, fresh: 'grid/velocity:heldout', freshMore: 7, lmax: c.lmax });
export const EVALS_PER_YEAR = 64;
export const WALL_S = 120;
export const MAX_WORKERS = 4;
// A single instance has no exchange, so M only sets how often its trace is read (the run is by
// generation count, so the trajectory is the same at any M); it is read every TRACE_EVERY generations.
export const TRACE_EVERY = 10;
export const BAR = Object.freeze({ n: 4, every: 10, migrants: 8, evals: 800000, seeds: ['decide1', 'decide2', 'decide3', 'decide4', 'decide5'], tuneSeeds: ['tune1', 'tune2', 'tune3'], tuneEvery: [10, 50, 200] });

// ---------------------------------------------------------------- the run
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const MB = 1048576;
const say = (l) => console.log(l);
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;
const fmtInt = (x) => Math.round(x).toLocaleString('en-US');
const sum = (xs) => xs.reduce((a, x) => a + (Number(x) || 0), 0);
const signed = (x, d = 1) => (x > 0 ? '+' : '') + (d ? x.toFixed(d) : String(x));

function dirBytes(dir) {
  let n = 0;
  let names = []; try { names = readdirSync(dir, { withFileTypes: true }); } catch { return 0; }
  for (const e of names) { const p = path.join(dir, e.name); if (e.isDirectory()) n += dirBytes(p); else { try { n += statSync(p).size; } catch { /* gone */ } } }
  return n;
}

/** Run thunks with at most `limit` at once, results in order. */
async function pool(thunks, limit) {
  const out = new Array(thunks.length);
  let next = 0;
  const lane = async () => { while (next < thunks.length) { const i = next++; out[i] = await thunks[i](); } };
  await Promise.all(Array.from({ length: Math.min(limit, thunks.length) }, lane));
  return out;
}

/** One run, flattened: the pick, its searched and held-out scores, the budget it spent. */
function rowOf(r, T) {
  const b = r.pick ? r.pick.best : null;
  const q = lastQuarter(r.trace);
  return {
    seed: r.seed, pick: r.pick ? r.pick.island : null, searched: b ? b.count : null, searchedT: T, fitness: b ? b.fitness : null, len: b ? b.len : null,
    fresh: b && b.freshCounts.length ? sum(b.freshCounts) : null, freshT: b && b.freshTs.length ? sum(b.freshTs) : null, freshCounts: b ? b.freshCounts : [], heldout: b ? b.fresh : null, heldoutT: b ? b.freshT : null,
    evals: r.evals, evalsWithReport: r.evalsWithReport, organismYears: r1(r.evals / EVALS_PER_YEAR), gens: r.gens, epochs: r.epochs, exchanges: r.exchanges, elitesImported: r.elitesImported,
    wallS: r1(r.wallMs / 1000), stoppedBy: r.stoppedBy, freshScored: r.freshScored, planesRun: r.islands.map((x) => x.planesRun), planesFired: r.islands.map((x) => x.planesFired),
    lastQuarter: q ? { gained: q.gained, rising: q.rising, slopePerMEvals: q.slopePerMEvals === null ? null : r2(q.slopePerMEvals), atEvals: q.at.evals, atCount: q.at.count } : null,
    bestFreshOverIslands: r.bestFreshOverIslands,
  };
}

function armOf(name, what, rows) {
  const fresh = rows.every((x) => x.fresh !== null) ? bandOf(rows.map((x) => x.fresh)) : null;
  return {
    name, what, perSeed: rows, fresh, searched: bandOf(rows.map((x) => x.searched)),
    freshSum: fresh ? sum(rows.map((x) => x.fresh)) : null, freshTSum: fresh ? sum(rows.map((x) => x.freshT)) : null,
    evals: sum(rows.map((x) => x.evals)), organismYears: bandOf(rows.map((x) => x.organismYears)), exchanges: sum(rows.map((x) => x.exchanges)), elitesImported: sum(rows.map((x) => x.elitesImported)),
    allWithinWall: rows.every((x) => x.stoppedBy === 'budget'), maxWallS: Math.max(...rows.map((x) => x.wallS)),
  };
}

const runLine = (tag, x) => '[' + tag + '] ' + x.seed + ': pick ' + x.pick + ' searched ' + x.searched + '/' + x.searchedT + ' (len ' + x.len + ')' +
  (x.fresh !== null ? ', held-out ' + x.fresh + '/' + x.freshT + ' (heldout draw ' + x.heldout + '/' + x.heldoutT + ')' : '') +
  ', ' + fmtInt(x.evals) + ' evals = ' + fmtInt(x.organismYears) + ' organism-years, ' + x.gens + ' generations, ' + x.exchanges + ' exchanges, ' + x.elitesImported + ' elites imported, ' + x.wallS + ' s' + (x.stoppedBy !== 'budget' ? ' STOPPED BY THE WALL' : '');
const armLine = (a) => '[arm] ' + a.name.padEnd(8) + ' held-out mean ' + r1(a.fresh.mean) + '/' + a.perSeed[0].freshT + ' (sd ' + r1(a.fresh.sd) + ', ' + a.fresh.min + '..' + a.fresh.max + ', range ' + a.fresh.range + '; seeds ' + a.fresh.values.join(' ') +
  '), organism-years ' + fmtInt(a.organismYears.mean) + ' per seed, exchanges ' + a.exchanges + ', elites imported ' + a.elitesImported + ', max wall ' + a.maxWallS + ' s';

async function main() {
  const argv = process.argv.slice(2);
  const KNOWN = new Set(['n', 'every', 'migrants', 'evals', 'seeds', 'tune-seeds', 'candidates', 'out', 'tune', 'tune-every', 'suite']);
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i].startsWith('--') ? argv[i].slice(2) : null;
    if (!k || !KNOWN.has(k)) { console.error('[multiply] unknown argument ' + argv[i] + '; known: --' + [...KNOWN].join(' --')); process.exit(2); }
    if (k !== 'tune') i++;
  }
  const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
  const list = (k, d) => { const v = opt(k, null); return v === null ? d : String(v).split(',').map((s) => s.trim()).filter(Boolean); };
  const int = (k, d) => { const v = Number(opt(k, d)); if (!Number.isInteger(v) || v < 1) { console.error('[multiply] --' + k + ' must be a whole number of at least 1'); process.exit(2); } return v; };
  const tune = argv.includes('--tune');
  const cfg = {
    n: int('n', BAR.n), every: int('every', BAR.every), migrants: int('migrants', BAR.migrants), evals: int('evals', BAR.evals),
    seeds: list('seeds', BAR.seeds), tuneSeeds: list('tune-seeds', BAR.tuneSeeds), candidates: list('candidates', CANDIDATES.map((c) => c.name)),
    tuneEvery: list('tune-every', BAR.tuneEvery.map(String)).map(Number), suite: opt('suite', null),
    out: path.resolve(opt('out', path.join(ROOT, 'state', 'multiply-bench'))),
  };
  const onlyOut = argv.every((a, i) => a === '--out' || (i > 0 && argv[i - 1] === '--out'));
  const isTheBar = !tune && onlyOut;
  const VERDICT = path.join(ROOT, 'bench', 'verdicts', isTheBar ? 'multiply.json' : tune ? 'multiply-tune-partial.json' : 'multiply-run-partial.json');
  const COMMAND = ['node', ...process.execArgv, 'bench/multiply.mjs', ...argv].join(' ');
  const CACHE = path.join(cfg.out, 'matrices');
  const T0 = Date.now();
  const cands = cfg.candidates.map((nm) => CANDIDATES.find((c) => c.name === nm));
  if (cands.some((c) => !c)) { console.error('[multiply] unknown candidate in ' + cfg.candidates.join(',') + '; known: ' + CANDIDATES.map((c) => c.name).join(', ')); process.exit(2); }
  if (cfg.n > MAX_WORKERS) { console.error('[multiply] --n ' + cfg.n + ' needs ' + cfg.n + ' worker threads at once; this board allows at most ' + MAX_WORKERS); process.exit(2); }
  if (tune && cfg.tuneEvery.some((m) => !Number.isInteger(m) || m < 1)) { console.error('[multiply] --tune-every takes whole numbers of generations'); process.exit(2); }
  const overlap = cfg.seeds.filter((s) => cfg.tuneSeeds.includes(s));
  if (overlap.length) { console.error('[multiply] the deciding seeds ' + overlap.join(', ') + ' are also tuning seeds: refused'); process.exit(2); }

  let flag = null, verdictWritten = false;
  try {
    say('[multiply] ' + (isTheBar ? 'THE BAR' : tune ? 'THE M SWEEP (development: tuning seeds, searched objective only, never the bar)' : 'a partial run (flags differ from the bar)') + '; node ' + process.version + ', ' + os.cpus().length + ' threads, ' + r1(os.freemem() / 1073741824) + ' GB free at start; MODEL OFF (provider null, no socket, no model call)');
    say('[multiply] N ' + cfg.n + ' instances, exchange every M ' + cfg.every + ' generations, ' + cfg.migrants + ' migrants each way, budget ' + fmtInt(cfg.evals) + ' evaluations = ' + fmtInt(cfg.evals / EVALS_PER_YEAR) + ' organism-years per arm per seed; at most ' + MAX_WORKERS + ' workers, at most ' + WALL_S + ' s per arm');
    say('[control] one instance given N times the population (' + cfg.n + ' x the children per generation), not N times the wall: the island model is compared with one panmictic population of the same total size at the same total evaluations (Whitley et al.; Cantu-Paz; Alba and Tomassini), so generations, children per generation and evaluations are equal and only the structure differs');
    const other = benchFlag({ selfPid: process.pid });
    say('[multiply] ' + (other ? 'another live bench flag is up: pid ' + other.pid : 'no other live bench flag'));
    flag = raiseBenchFlag({ command: COMMAND });
    mkdirSync(CACHE, { recursive: true });

    // ---- the suites, built once (the fresh draws are built here and handed to no search)
    const info = {};
    const needed = tune ? [CANDIDATES.find((c) => c.name === (cfg.suite || CANDIDATES[CANDIDATES.length - 1].name))] : cands;
    if (needed.some((c) => !c)) { console.error('[multiply] unknown --suite ' + cfg.suite); process.exitCode = 2; return; }
    for (const c of needed) {
      const t = Date.now();
      const s = loadSuite({ cacheDir: CACHE, suite: suiteOf(c) });
      info[c.name] = { C: s.matrix.C, T: s.matrix.T, union: s.matrix.unionBound(), built: s.built, cached: s.cached, ms: Date.now() - t };
      say('[suite] ' + c.name + ': ' + c.what + '; ' + s.matrix.C + ' components, ' + s.matrix.T + ' searched tasks (' + info[c.name].union + ' solvable by some component), ' + s.built + ' built, ' + s.cached + ' cached, ' + r1((Date.now() - t) / 1000) + ' s');
    }
    const base = (c, seed, extra) => ({ suite: suiteOf(c), cacheDir: CACHE, seed, lmax: c.lmax, every: cfg.every, migrants: cfg.migrants, evalBudget: cfg.evals, wallMs: WALL_S * 1000, ...extra });
    let devFreshScored = 0;

    if (tune) {
      // ---- THE M SWEEP (development): islands with the exchange at each M, and without, on the tuning seeds
      const c = needed[0], T = info[c.name].T;
      const table = [];
      for (const m of [...cfg.tuneEvery, 'off']) {
        const rows = [];
        for (const sd of cfg.tuneSeeds) {
          const r = await runIslands(base(c, sd, { n: cfg.n, exchange: m !== 'off', every: m === 'off' ? cfg.every : m, noFresh: true }));
          devFreshScored += r.freshScored;
          const x = rowOf(r, T);
          rows.push(x);
          say(runLine('tune M ' + m, x));
        }
        const b = bandOf(rows.map((x) => x.searched));
        table.push({ every: m, exchange: m !== 'off', searched: b, rows });
        say('[tune] M ' + String(m).padEnd(4) + ' searched mean ' + r1(b.mean) + '/' + T + ' (seeds ' + b.values.join(' ') + ')' + (m === 'off' ? ' (no exchange)' : ''));
      }
      const best = table.filter((t) => t.exchange).reduce((a, t) => (!a || t.searched.mean > a.searched.mean ? t : a), null);
      say('[tune] the best M by the searched objective on the tuning seeds: ' + best.every + ' (mean ' + r1(best.searched.mean) + '); no exchange ' + r1(table.find((t) => !t.exchange).searched.mean));
      const wallMs = Date.now() - T0;
      writeJsonAtomic(VERDICT, {
        at: new Date().toISOString(), command: COMMAND, node: process.version, isTheBar: false, barMet: false, complete: true,
        statement: 'Development only: on the tuning seeds ' + cfg.tuneSeeds.join(', ') + ' and the suite ' + c.name + ', ' + cfg.n + ' islands at ' + fmtInt(cfg.evals) + ' evaluations per seed were run with the elite exchange every ' + cfg.tuneEvery.join(', ') + ' generations and with it off, and scored by the searched objective only (the fresh draws were never loaded). The best M by the searched mean was ' + best.every + '. This chooses a flag; it is not the bar, and no deciding seed was run.',
        split: splitFor({ suite: suiteOf(c), tuneSeeds: cfg.tuneSeeds, decideSeeds: [], devFreshScored }),
        config: { ...cfg, out: path.relative(ROOT, cfg.out), suite: suiteOf(c), evalsPerOrganismYear: EVALS_PER_YEAR, wallGuardS: WALL_S, maxWorkers: MAX_WORKERS, provider: null },
        suite: { name: c.name, ...info[c.name] }, table, bestEvery: best.every, modelCalls: 0, wallMs,
        disk: { outMb: r1(dirBytes(cfg.out) / MB), over100: dirBytes(cfg.out) > 100 * MB },
      }, { pretty: true });
      verdictWritten = true;
      say('[multiply] wrote ' + path.relative(ROOT, VERDICT) + ' (isTheBar false) in ' + r1(wallMs / 1000) + ' s');
      return;
    }

    // ---- THE PROBE: the control alone on the tuning seeds of every candidate, at the bar's budget
    const probe = [];
    for (const c of cands) {
      const T = info[c.name].T;
      const runs = await pool(cfg.tuneSeeds.map((sd) => () => runIslands(base(c, sd, { n: 1, popScale: cfg.n, exchange: false, every: TRACE_EVERY, noFresh: true }))), MAX_WORKERS);
      const rows = runs.map((r) => rowOf(r, T));
      devFreshScored += sum(runs.map((r) => r.freshScored));
      for (const x of rows) say('[probe] ' + c.name + ' ' + x.seed + ': control end ' + x.searched + '/' + T + ' searched (len ' + x.len + '), last quarter ' + signed(x.lastQuarter.gained, 0) + ' (' + (x.lastQuarter.slopePerMEvals ?? 0) + ' per M evals, from ' + x.lastQuarter.atCount + ' at ' + fmtInt(x.lastQuarter.atEvals) + ' evals), ' + x.wallS + ' s' + (x.stoppedBy !== 'budget' ? ' STOPPED BY THE WALL' : ''));
      const rising = rows.every((x) => x.lastQuarter.gained > 0 && x.stoppedBy === 'budget');
      probe.push({ name: c.name, what: c.what, draws: c.draws, lmax: c.lmax, T, union: info[c.name].union, rising, rows,
        ends: rows.map((x) => x.searched), gains: rows.map((x) => x.lastQuarter.gained), slopes: rows.map((x) => x.lastQuarter.slopePerMEvals), maxWallS: Math.max(...rows.map((x) => x.wallS)) });
      say('[probe] ' + c.name + ': ends ' + rows.map((x) => x.searched).join('/') + ' of ' + T + ', last quarter ' + rows.map((x) => signed(x.lastQuarter.gained, 0)).join(' ') + ' => ' + (rising ? 'RISING on every tuning seed' : 'SATURATED (not rising on every tuning seed inside the wall)'));
    }
    const chosen = chooseSuite(probe);
    const cand = chosen ? CANDIDATES.find((c) => c.name === chosen.name) : null;
    if (!chosen) {
      say('[suite] SATURATED at every candidate affordable in ' + WALL_S + ' s: the control stops rising on some tuning seed at every cap probed; no deciding run');
      const wallMs = Date.now() - T0;
      writeJsonAtomic(VERDICT, {
        at: new Date().toISOString(), command: COMMAND, node: process.version, isTheBar, barMet: false, complete: true,
        statement: 'The single instance saturated every candidate suite probed (' + probe.map((p) => p.name).join(', ') + ') inside ' + WALL_S + ' s at ' + fmtInt(cfg.evals) + ' evaluations: on at least one tuning seed its searched score did not rise over the last quarter of the budget. With no suite the control fails to saturate, the island model cannot be measured against it, so the bar is missed and no deciding seed was run.',
        split: splitFor({ suite: suiteOf(cands[cands.length - 1]), tuneSeeds: cfg.tuneSeeds, decideSeeds: cfg.seeds, devFreshScored }),
        bar: { met: false, rule: 'a suite the control does not saturate, then islands with exchange beat both controls by more than the seed band', saturated: true, singleFresh: null, populationFresh: null, freshT: null },
        probe, arms: { single: { duplications: 0, pick: { fresh: null, freshT: null, fitness: null } }, population: { duplications: 0, pick: { fresh: null, freshT: null, fitness: null } } },
        config: { ...cfg, out: path.relative(ROOT, cfg.out), evalsPerOrganismYear: EVALS_PER_YEAR, wallGuardS: WALL_S, maxWorkers: MAX_WORKERS, provider: null }, modelCalls: 0, wallMs,
      }, { pretty: true });
      verdictWritten = true;
      say('[multiply] wrote ' + path.relative(ROOT, VERDICT) + ' (isTheBar ' + isTheBar + ', barMet false)');
      return;
    }
    say('[suite] chosen ' + chosen.name + ' (the largest candidate whose control rises on every tuning seed): ends ' + chosen.ends.join('/') + ' of ' + chosen.T + ', last quarter ' + chosen.gains.map((g) => signed(g, 0)).join(' ') + ', slopes ' + chosen.slopes.join(' / ') + ' per M evals');

    // ---- THE DECIDING RUN: five deciding seeds, three arms, the same evaluations
    const T = chosen.T;
    const singles = await pool(cfg.seeds.map((sd) => () => runIslands(base(cand, sd, { n: 1, popScale: cfg.n, exchange: false, every: TRACE_EVERY }))), MAX_WORKERS);
    const sRows = singles.map((r) => rowOf(r, T));
    for (const x of sRows) say(runLine('single', x));
    const iRows = [], xRows = [];
    for (const sd of cfg.seeds) {
      const a = rowOf(await runIslands(base(cand, sd, { n: cfg.n, exchange: true })), T);
      iRows.push(a); say(runLine('islands', a));
      const b = rowOf(await runIslands(base(cand, sd, { n: cfg.n, exchange: false })), T);
      xRows.push(b); say(runLine('noexch', b));
    }
    const I = armOf('islands', cfg.n + ' instances, elite exchange every ' + cfg.every + ' generations, ' + cfg.migrants + ' migrants each way, all to all', iRows);
    const X = armOf('noexch', cfg.n + ' instances with the exchange off (the second control)', xRows);
    const S = armOf('single', 'one instance with ' + cfg.n + ' times the population (the first control)', sRows);
    say('');
    for (const a of [I, X, S]) say(armLine(a));
    const vsS = beats(I.fresh, S.fresh), vsX = beats(I.fresh, X.fresh);
    const paired = (c) => cfg.seeds.map((_, k) => iRows[k].fresh - c.perSeed[k].fresh);
    const yearsGap = Math.max(...cfg.seeds.map((_, k) => Math.max(Math.abs(iRows[k].evals - sRows[k].evals), Math.abs(iRows[k].evals - xRows[k].evals)))) / cfg.evals;
    const sameYears = yearsGap <= 0.005;
    const inWall = I.allWithinWall && X.allWithinWall && S.allWithinWall;
    const barMet = vsS.beat && vsX.beat && sameYears && inWall;
    say('[years] every arm spent ' + fmtInt(cfg.evals) + ' evaluations per seed within ' + r2(yearsGap * 100) + '% (the last generation of each instance): ' + (sameYears ? 'the same total organism-years' : 'NOT the same organism-years (over 0.5% apart)') + '; every arm inside the ' + WALL_S + ' s wall: ' + inWall);
    say('[bar] single: ' + S.freshSum + '/' + S.freshTSum + ' fresh (one instance, ' + cfg.n + ' times the population, summed over the ' + cfg.seeds.length + ' deciding seeds)');
    say('[bar] population pick by the searched objective: ' + I.freshSum + '/' + I.freshTSum + ' fresh (' + cfg.n + ' islands, exchange every ' + cfg.every + ' generations, summed over the ' + cfg.seeds.length + ' deciding seeds); no exchange ' + X.freshSum + '/' + X.freshTSum);
    say('[bar] islands minus single: mean ' + signed(vsS.gap, 1) + ' against a band of ' + vsS.band + ' (paired per seed ' + paired(S).join(' ') + ') => ' + (vsS.beat ? 'BEATS' : 'does not beat') + ' the single instance');
    say('[bar] islands minus no-exchange: mean ' + signed(vsX.gap, 1) + ' against a band of ' + vsX.band + ' (paired per seed ' + paired(X).join(' ') + ') => ' + (vsX.beat ? 'BEATS' : 'does not beat') + ' the no-exchange arm');
    say('[bar] ' + (barMet ? 'MET' : 'MISSED') + ': N islands with exchange ' + (barMet ? 'beat both controls by more than the seed band' : 'did not beat both controls by more than the seed band') + ' on ' + chosen.name + ', a suite the single does not saturate');

    const outBytes = dirBytes(cfg.out);
    const wallMs = Date.now() - T0;
    say('[disk] out holds ' + r1(outBytes / MB) + ' MB' + (outBytes > 100 * MB ? ' (OVER 100 MB)' : ''));
    say('[multiply] wall ' + r1(wallMs / 1000) + ' s');
    const pickJson = (a) => ({ fresh: a.freshSum, freshT: a.freshTSum, fitness: null, why: 'one pick per deciding seed (the best library by the searched objective over the arm\'s instances); fresh is their held-out counts summed over the seeds, and each pick\'s own searched fitness is in perSeed', perSeed: a.perSeed.map((x) => ({ seed: x.seed, island: x.pick, fresh: x.fresh, freshT: x.freshT, searched: x.searched, fitness: x.fitness, len: x.len })) });
    const armJson = (a) => ({ what: a.what, heldOut: a.fresh, searched: a.searched, organismYears: a.organismYears, evals: a.evals, exchanges: a.exchanges, elitesImported: a.elitesImported, duplications: 0, allWithinWall: a.allWithinWall, maxWallS: a.maxWallS, pick: pickJson(a), perSeed: a.perSeed });
    const statement = 'On ' + chosen.name + ' (' + chosen.what + '), a suite whose control was still rising over the last quarter of its budget on all three tuning seeds, ' + cfg.n + ' islands that traded their best ' + cfg.migrants + ' libraries every ' + cfg.every + ' generations were run against two controls at the same ' + fmtInt(cfg.evals) + ' evaluations (' + fmtInt(cfg.evals / EVALS_PER_YEAR) + ' organism-years) per seed: one instance with ' + cfg.n + ' times the population, and the same ' + cfg.n + ' islands with no exchange. On five deciding seeds the tuning never touched, each arm\'s pick by the searched objective scored a mean of ' + r1(I.fresh.mean) + ' (islands), ' + r1(S.fresh.mean) + ' (single) and ' + r1(X.fresh.mean) + ' (no exchange) of ' + iRows[0].freshT + ' held-out tasks on eight fresh draws, with seed ranges of ' + I.fresh.range + ', ' + S.fresh.range + ' and ' + X.fresh.range + '. The islands ' + (vsS.beat ? 'beat' : 'did not beat') + ' the single instance (gap ' + r1(vsS.gap) + ' against a band of ' + vsS.band + ') and ' + (vsX.beat ? 'beat' : 'did not beat') + ' the no-exchange arm (gap ' + r1(vsX.gap) + ' against a band of ' + vsX.band + '), so the bar is ' + (barMet ? 'met' : 'missed') + '. No model was called; the numbers are counts of evaluations and do not depend on the desk\'s load.';
    writeJsonAtomic(VERDICT, {
      at: new Date().toISOString(), command: COMMAND, node: process.version, isTheBar, barMet, complete: true, statement,
      split: splitFor({ suite: suiteOf(cand), tuneSeeds: cfg.tuneSeeds, decideSeeds: cfg.seeds, devFreshScored }),
      control: { first: 'single', gets: 'N times the population', notGiven: 'N times the wall', why: 'the island model literature (Whitley, Rana and Heckendorn; Cantu-Paz; Alba and Tomassini) compares islands with one panmictic population of the same total size at the same total evaluations; N times the wall would give the control N times the generations of a quarter-size population and compare search depth, not structure', second: 'noexch: the same N islands with the exchange off' },
      bar: {
        met: barMet, rule: 'N islands with exchange beat BOTH controls: mean held-out score over the deciding seeds minus the control mean above the wider min..max range of the two arms, at the same organism-years (within 0.5%), every arm inside ' + WALL_S + ' s, on a suite whose control rose over the last quarter on every tuning seed',
        singleFresh: S.freshSum, populationFresh: I.freshSum, noExchangeFresh: X.freshSum, freshT: I.freshTSum, freshTPerSeed: iRows[0].freshT,
        noise: { seedToSeed: vsS.band * cfg.seeds.length, perSeedBand: vsS.band, unit: 'tasks summed over the ' + cfg.seeds.length + ' deciding seeds, the unit of singleFresh and populationFresh: the per-seed band times ' + cfg.seeds.length },
        vsSingle: { ...vsS, paired: paired(S) }, vsNoExchange: { ...vsX, paired: paired(X) }, sameYears, yearsGapFraction: yearsGap, inWall, suiteRising: true,
      },
      suite: { chosen: chosen.name, what: chosen.what, T, union: chosen.union, rule: 'the largest probed candidate whose control rose over the last quarter on every tuning seed inside the wall' },
      probe,
      arms: { population: armJson(I), single: armJson(S), noExchange: armJson(X) },
      config: { ...cfg, out: path.relative(ROOT, cfg.out), suite: suiteOf(cand), evalsPerOrganismYear: EVALS_PER_YEAR, organismYearsPerArm: cfg.evals / EVALS_PER_YEAR, wallGuardS: WALL_S, maxWorkers: MAX_WORKERS, patience: 200, provider: null, schedule: 'probe: the tuning seeds of each candidate in parallel; decide: the singles ' + MAX_WORKERS + ' at a time, then per seed the islands arm and the no-exchange arm, each on ' + cfg.n + ' workers' },
      disk: { outMb: r1(outBytes / MB), over100: outBytes > 100 * MB },
      machine: { cpus: os.cpus().length, totalMemGb: r1(os.totalmem() / 1073741824), platform: process.platform },
      modelCalls: 0, wallMs,
    }, { pretty: true });
    verdictWritten = true;
    say('[multiply] wrote ' + path.relative(ROOT, VERDICT) + ' (isTheBar ' + isTheBar + ', barMet ' + barMet + ')');
  } catch (e) {
    console.error('[multiply] FAILED: ' + (e && e.stack || e));
    process.exitCode = 1;
  } finally {
    if (flag) flag.lower();
    if (!verdictWritten) say('[multiply] no verdict written');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
