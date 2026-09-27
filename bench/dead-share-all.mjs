#!/usr/bin/env node
// bench/dead-share-all.mjs: EVERY COUNTED SEED AT DEAD SHARE 0 (Board 27, item dead-share-all; MANUAL P8,
// his order "make sure the 5 million organism lines u wrote arent empty code").
// Author: Board 27 builder, item dead-share-all, 2026-09-27. MODEL OFF: no provider, no socket.
//
// Board 23 landed one seed (organism/gen-1-4-4-1-4) at dead share 0 and ran the same chain on copies of
// the others. This bench lands every other seed the census counts, IN PLACE, one call per seed from
// here (the chain is not run as genome/emit.mjs --dead-share --all), then censuses each, then runs the
// board's bar command, and writes bench/verdicts/dead-share-all.json from what those runs wrote:
//
//   LAND       per seed, one child under the budget wrapper:
//                genome/emit.mjs --dead-share organism/<seed> --tag dead-share-all
//                  --verdict-dir bench/verdicts/dead-share-all --json bench/verdicts/dead-share-all/chain-<seed>.json
//              (census, wire to the fixed point, prune, the horizon step, repeated until a pass changes
//              nothing; each step a child; the censuses go to bench/verdicts/dead-share-all/)
//   CENSUS     per seed, the board's own command, at most two at a time:
//                node tools/budget.mjs --ram-mb 4000 --disk-mb 400 --dir bench/verdicts -- node
//                  --max-old-space-size=4000 tools/organism-census.mjs --seed organism/<seed> --ticks 200
//                  --no-knockout --tag dead-share-all-<seed>
//   BAR        node tools/budget.mjs --ram-mb 4000 --disk-mb 400 --dir bench/verdicts -- node
//                --max-old-space-size=4000 tools/organism-census.mjs --all --ticks 200 --max-cells 1000
//              (census-all.json, isTheBar true, barMet from its own census)
//   BEFORE     bench/verdicts/census-all.json as the tree had it before this item (the census of every
//              seed before any landing), copied once to bench/verdicts/dead-share-all/census-all-before.json
//              and read from that copy on every later run; its totals are summed from its rows and its
//              statement is quoted, never typed
//   OVER CAP   a seed over --max-cells (1000) is landed only if its landing and a census fit 15 minutes
//              under the 4000 MB cap. The measurement is the landing's first step, a census of the seed,
//              run on its own under the budget wrapper (a run inside this bench would share this
//              bench's cap), with its record at bench/verdicts/dead-share-all/fit-<seed>.json:
//                node tools/budget.mjs --ram-mb 4000 --disk-mb 400 --dir bench/verdicts/dead-share-all
//                  --record bench/verdicts/dead-share-all/fit-<seed>.json -- node --max-old-space-size=4000
//                  tools/organism-census.mjs --seed organism/<seed> --ticks 200 --no-knockout
//                  --tag dead-share-all-fit --verdict-dir bench/verdicts/dead-share-all
//              A census that did not exit 0 inside 15 minutes cannot carry a landing: the seed is skipped
//              by name with its cell count and what the record says. organism/scale-52000 and
//              organism/scale-52000-pruned are never loaded (the board's order) and are skipped by name.
//   GATE       the gate's LOAD-BEARING row computed the way bench/gate.mjs computes it (its exported
//              functions; the gate itself is not run)
//
// barMet: every seed the bar census counted is at dead share 0 in it (census-all.json barMet), in its
// own census, and every landing this bench ran is OK (the chain's own checks: fixed point, settled,
// dead share not higher, hosted score, algebra and sequence not lower, a horizon step that moved
// nothing inside the census); the table holds every counted seed; the gate row is GREEN.
//
//   node tools/budget.mjs --ram-mb 4000 --disk-mb 400 --dir bench/verdicts -- node --max-old-space-size=4000 bench/dead-share-all.mjs
//   options: --max-cells 1000  --min-free-mb 8000  --fit-minutes 15  --no-land (census and bar only)
//
// A run that cannot finish writes bench/verdicts/dead-share-all-run-partial.json saying what it covered.
// A re-run does not land a seed again whose manifest hash is the one its OK chain record ended on; the
// row says which run landed it (wallS.landingRun), and every census and the bar are run again.

import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { freemem } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VDIR = path.join(ROOT, 'bench', 'verdicts');
const DIR = path.join(VDIR, 'dead-share-all');
const ITEM = 'dead-share-all';
const NEVER_LOADED = ['scale-52000', 'scale-52000-pruned'];
const LANDED_BY_BOARD_23 = 'gen-1-4-4-1-4';
const posix = (p) => p.split(path.sep).join('/');
const rel = (p) => posix(path.relative(ROOT, p));
const share = (loaded, bearing) => (loaded > 0 ? Math.round((1 - bearing / loaded) * 1e6) / 1e6 : null);
const BUDGET = (dir) => ['tools/budget.mjs', '--ram-mb', '4000', '--disk-mb', '400', '--dir', dir, '--'];
const HEAP = ['--max-old-space-size=4000'];

/** The per-seed census command, exactly as the board gave it. */
export function censusArgs(seed) {
  return [...BUDGET('bench/verdicts'), 'node', ...HEAP, 'tools/organism-census.mjs', '--seed', 'organism/' + seed, '--ticks', '200', '--no-knockout', '--tag', ITEM + '-' + seed];
}
/** The file that census writes (tools/organism-census.mjs verdictName: a tagged run is partial). */
export function censusFile(seed) { return path.join(VDIR, 'census-' + seed + '-' + ITEM + '-' + seed + '-partial.json'); }
/** One landing: the chain on one seed, in place, as a child under the budget wrapper. */
export function landArgs(seed) {
  return [...BUDGET('bench/verdicts/' + ITEM), 'node', ...HEAP, 'genome/emit.mjs', '--dead-share', 'organism/' + seed, '--tag', ITEM, '--verdict-dir', 'bench/verdicts/' + ITEM, '--json', 'bench/verdicts/' + ITEM + '/chain-' + seed + '.json'];
}
export const BAR_ARGS = [...BUDGET('bench/verdicts'), 'node', ...HEAP, 'tools/organism-census.mjs', '--all', '--ticks', '200', '--max-cells', '1000'];
/** The fit measurement for a seed over --max-cells (run on its own, not from this bench). */
export function fitArgs(seed) {
  return ['tools/budget.mjs', '--ram-mb', '4000', '--disk-mb', '400', '--dir', 'bench/verdicts/' + ITEM, '--record', 'bench/verdicts/' + ITEM + '/fit-' + seed + '.json', '--', 'node', ...HEAP, 'tools/organism-census.mjs', '--seed', 'organism/' + seed, '--ticks', '200', '--no-knockout', '--tag', ITEM + '-fit', '--verdict-dir', 'bench/verdicts/' + ITEM];
}

/** The seeds under organism/, each with its manifest cell count (dot directories are not seeds). */
export function seedsOnDisk(root = path.join(ROOT, 'organism')) {
  const out = [];
  for (const d of readdirSync(root).sort()) {
    const dir = path.join(root, d);
    if (d.startsWith('.') || !existsSync(path.join(dir, 'index.mjs')) || !existsSync(path.join(dir, 'manifest.json'))) continue;
    const m = JSON.parse(readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
    out.push({ name: d, cells: m.counts.cells, edges: m.counts.edges, hash: m.hash });
  }
  return out;
}

/** The totals of a census-all verdict, summed from its own rows. */
export function totalsOf(v) {
  const done = (v.seeds || []).filter((x) => !x.skipped);
  const sum = (f) => done.reduce((a, x) => a + f(x), 0);
  return {
    seeds: done.length, skipped: (v.seeds || []).length - done.length,
    cells: { declared: sum((x) => x.cells.declared), ran: sum((x) => x.cells.ran) },
    edges: { declared: sum((x) => x.edges.declared), delivered: sum((x) => x.edges.delivered) },
    lines: { loaded: sum((x) => x.lines.loaded), loadBearing: sum((x) => x.lines.loadBearing) },
    deadShare: share(sum((x) => x.lines.loaded), sum((x) => x.lines.loadBearing)),
    atZero: done.filter((x) => x.lines.loaded > 0 && x.lines.loadBearing === x.lines.loaded).length,
  };
}

/** The census of every seed before this item: the copy if it exists, else census-all.json copied once. */
export function readBefore() {
  const snap = path.join(DIR, 'census-all-before.json'), live = path.join(VDIR, 'census-all.json');
  if (!existsSync(snap)) {
    const v = JSON.parse(readFileSync(live, 'utf8'));
    // the before is a census the bar has not rewritten: census-all.json as tools/organism-census.mjs
    // wrote it before Board 27 (isTheBar false, no barMet); a census-all.json this item's bar wrote is not a before
    if (v.bench !== 'census-all' || v.isTheBar === true || 'barMet' in v) throw new Error('no before census: ' + rel(live) + ' was written by the bar (isTheBar ' + v.isTheBar + '), and ' + rel(snap) + ' is not on disk');
    mkdirSync(DIR, { recursive: true });
    copyFileSync(live, snap);
  }
  return { file: rel(snap), v: JSON.parse(readFileSync(snap, 'utf8')) };
}

function waitFree(minFreeMB, say) {
  const t0 = Date.now();
  let told = false;
  for (;;) {
    const free = Math.round(freemem() / 1048576);
    if (free >= minFreeMB) return free;
    if (!told) { say('  waiting: ' + free + ' MB free, under ' + minFreeMB); told = true; }
    if (Date.now() - t0 > 30 * 60_000) throw new Error('free RAM stayed under ' + minFreeMB + ' MB for 30 minutes');
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000);
  }
}
const lastLines = (s, n) => String(s || '').split(/\r?\n/).filter(Boolean).slice(-n);
// the wrapper's last line, without the path of its own record (that record is runtime, under state/)
const budgetLine = (s) => { const l = String(s || '').split(/\r?\n/).filter((x) => x.startsWith('BUDGET done') || x.startsWith('BUDGET KILLED')).slice(-1)[0]; return l ? l.replace(/, record \S+\s*$/, '') : null; };

function runSync(args, what, timeoutMs = 20 * 60_000) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', timeout: timeoutMs, maxBuffer: 256 << 20, windowsHide: true });
  const out = (r.stdout || '') + (r.stderr || '');
  return { status: r.status, wallS: (Date.now() - t0) / 1000, out, budget: budgetLine(out), error: r.error ? r.error.message : null, what };
}
function runAsync(args, what, timeoutMs = 20 * 60_000) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const ch = spawn(process.execPath, args, { cwd: ROOT, windowsHide: true });
    let out = '';
    ch.stdout.on('data', (b) => { out += b; });
    ch.stderr.on('data', (b) => { out += b; });
    const timer = setTimeout(() => ch.kill(), timeoutMs);
    ch.on('close', (status) => { clearTimeout(timer); resolve({ status, wallS: (Date.now() - t0) / 1000, out, budget: budgetLine(out), what }); });
  });
}

/** The fit record of a seed over --max-cells, as the budget wrapper wrote it (null when not measured). */
export function readFit(seed, fitMinutes = 15) {
  const f = path.join(DIR, 'fit-' + seed + '.json');
  if (!existsSync(f)) return null;
  const b = JSON.parse(readFileSync(f, 'utf8'));
  const killed = b.killed ? { which: b.killed.which, valueMb: b.killed.valueMb, cap: b.killed.cap } : null;
  const inTime = typeof b.wallS === 'number' && b.wallS <= fitMinutes * 60;
  return {
    file: rel(f), at: b.at, outcome: b.outcome, exitCode: b.exitCode, wallS: b.wallS, peakRssMb: b.peakRssMb, killed,
    caps: { ramMb: b.caps && b.caps.ramMb }, fits: b.outcome === 'exit' && b.exitCode === 0 && inTime,
  };
}

async function main(argv) {
  const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
  const maxCells = Number(opt('max-cells', 1000)), minFreeMB = Number(opt('min-free-mb', 8000)), fitMinutes = Number(opt('fit-minutes', 15));
  const land = !argv.includes('--no-land');
  const say = (s) => process.stdout.write(s + '\n');
  const command = 'node tools/budget.mjs --ram-mb 4000 --disk-mb 400 --dir bench/verdicts -- node --max-old-space-size=4000 bench/dead-share-all.mjs' + (argv.length ? ' ' + argv.join(' ') : '');
  const covered = { landed: [], censused: [], bar: false };
  mkdirSync(DIR, { recursive: true });
  try {
    const before = readBefore();
    const beforeRows = new Map(before.v.seeds.map((r) => [r.seed, r]));
    const beforeTotals = totalsOf(before.v);
    say('before: ' + before.file + ' (census-all at ' + before.v.at + '): ' + beforeTotals.lines.loadBearing + ' of ' + beforeTotals.lines.loaded + ' loaded lines load bearing on ' + beforeTotals.seeds + ' seeds, ' + beforeTotals.atZero + ' at dead share 0');

    // which seeds: counted (at or under --max-cells), over the cap (measured), never loaded
    const disk = seedsOnDisk();
    const skipped = [], toLand = [], counted = [];
    for (const s of disk) {
      if (NEVER_LOADED.includes(s.name)) { skipped.push({ seed: 'organism/' + s.name, cells: s.cells, why: 'never loaded (the board\'s order: organism/scale-52000 is never loaded), ' + s.cells + ' cells' }); continue; }
      if (s.cells > maxCells) {
        const fit = readFit(s.name, fitMinutes);
        if (fit && fit.fits) throw new Error('organism/' + s.name + ' fits (' + fit.file + '): landing an over-cap seed is not built into this bench; land it on its own first');
        const what = !fit ? 'not measured (no ' + rel(path.join(DIR, 'fit-' + s.name + '.json')) + ')'
          : 'its census alone under the ' + fit.caps.ramMb + ' MB cap ' + (fit.outcome === 'killed' ? 'was killed by the budget (' + (fit.killed && fit.killed.which) + ' ' + (fit.killed && fit.killed.valueMb) + ' MB over ' + (fit.killed && fit.killed.cap) + ') after ' + fit.wallS + ' s, peak ram ' + fit.peakRssMb + ' MB' : 'exited ' + fit.exitCode + ' (' + fit.outcome + ') after ' + fit.wallS + ' s, peak ram ' + fit.peakRssMb + ' MB') + ' (' + fit.file + ')';
        skipped.push({ seed: 'organism/' + s.name, cells: s.cells, why: s.cells + ' cells, over --max-cells ' + maxCells + '; the landing plus a census does not fit ' + fitMinutes + ' minutes under the 4000 MB cap: ' + what, fit });
        say('skip organism/' + s.name + ': ' + s.cells + ' cells; ' + what);
        continue;
      }
      counted.push(s);
      if (s.name !== LANDED_BY_BOARD_23) toLand.push(s);
    }
    for (const s of skipped.filter((x) => NEVER_LOADED.includes(x.seed.slice('organism/'.length)))) say('skip ' + s.seed + ': ' + s.why);

    // LAND: one call per seed, one at a time (each call runs its censuses one at a time). A seed whose
    // manifest hash is still the hash its chain record ended on (an OK chain) was landed by an earlier
    // run of this bench and is not landed again: a second landing would census it over the files the
    // first one named. Its wall comes from its land-<seed>.json sidecar, else the earlier verdict's row.
    const prior = (() => { try { return JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'dead-share-all.json'), 'utf8')); } catch { return null; } })();
    // an earlier row that itself re-used a landing keeps naming the run that measured the wall
    const priorWall = new Map(((prior && prior.table) || []).map((r) => [r.seed, { wallS: r.wallS ? r.wallS.landing : null, from: r.wallS && typeof r.wallS.landingRun === 'string' && r.wallS.landingRun.startsWith('an earlier run of this bench (') ? r.wallS.landingRun.slice('an earlier run of this bench ('.length, -1) : 'bench/verdicts/dead-share-all.json at ' + prior.at }]));
    const chains = new Map();
    for (const s of land ? toLand : []) {
      const jf = path.join(DIR, 'chain-' + s.name + '.json'), sf = path.join(DIR, 'land-' + s.name + '.json');
      const old = existsSync(jf) ? JSON.parse(readFileSync(jf, 'utf8')) : null;
      if (old && old.ok && old.last && old.last.hash === s.hash) {
        const side = existsSync(sf) ? JSON.parse(readFileSync(sf, 'utf8')) : null;
        const pw = priorWall.get('organism/' + s.name) || null;
        const wallS = side ? side.wallS : pw ? pw.wallS : null;
        const from = side ? rel(sf) : pw ? pw.from : 'no earlier record of its wall';
        chains.set(s.name, { ...old, wallS, exit: side ? side.exit : null, budget: side ? side.budget : null, reused: from });
        covered.landed.push('organism/' + s.name);
        say('land organism/' + s.name + ': landed by an earlier run (manifest hash ' + s.hash.slice(0, 12) + ' is the one its chain ended on), not landed again; dead share ' + old.first.deadShare + ' -> ' + old.last.deadShare + ', lines ' + old.first.lines + ' -> ' + old.last.lines + ', wall ' + (wallS === null ? '-' : wallS.toFixed(1)) + ' s from ' + from);
        continue;
      }
      waitFree(minFreeMB, say);
      const r = runSync(landArgs(s.name), 'land ' + s.name);
      if (!existsSync(jf) || r.status === null) throw new Error('landing organism/' + s.name + ' exited ' + r.status + (r.error ? ' (' + r.error + ')' : '') + ': ' + lastLines(r.out, 3).join(' | '));
      const c = JSON.parse(readFileSync(jf, 'utf8'));
      writeFileSync(sf, JSON.stringify({ seed: 'organism/' + s.name, at: new Date().toISOString(), wallS: r.wallS, exit: r.status, budget: r.budget, chain: rel(jf), hashBefore: s.hash, hashAfter: c.last && c.last.hash }, null, 2) + '\n');
      chains.set(s.name, { ...c, wallS: r.wallS, exit: r.status, budget: r.budget, reused: null });
      covered.landed.push('organism/' + s.name);
      say('land organism/' + s.name + ': dead share ' + c.first.deadShare + ' -> ' + c.last.deadShare + ', lines ' + c.first.lines + ' -> ' + c.last.lines + ', ' + (c.ok ? 'OK' : 'NOT OK (' + Object.entries(c.checks).filter(([, x]) => !x).map(([k]) => k).join(', ') + ')') + ', ' + r.wallS.toFixed(1) + ' s; ' + r.budget);
    }

    // CENSUS: the board's per-seed command, at most two at a time
    const censuses = new Map();
    const queue = counted.slice();
    const worker = async () => {
      for (let s = queue.shift(); s; s = queue.shift()) {
        waitFree(minFreeMB, say);
        const r = await runAsync(censusArgs(s.name), 'census ' + s.name);
        const f = censusFile(s.name);
        if (r.status !== 0 || !existsSync(f)) throw new Error('census organism/' + s.name + ' exited ' + r.status + ': ' + lastLines(r.out, 3).join(' | '));
        const v = JSON.parse(readFileSync(f, 'utf8'));
        censuses.set(s.name, { v, file: rel(f), wallS: r.wallS, budget: r.budget });
        covered.censused.push('organism/' + s.name);
      }
    };
    await Promise.all([worker(), worker()]);

    // the table, in name order
    const hashNow = new Map(seedsOnDisk().map((s) => [s.name, s.hash]));
    const table = counted.map((s) => {
      const b = beforeRows.get('organism/' + s.name);
      const c = censuses.get(s.name), cv = c.v, ch = chains.get(s.name) || null;
      const wired = ch ? ch.steps.filter((x) => x.step === 'wire' && x.portsWired).reduce((a, x) => a + (x.cellsWired || 0), 0) : null;
      const pruneSteps = ch ? ch.steps.filter((x) => (x.step === 'prune' || x.step === 'horizon') && x.cells && typeof x.cells.before === 'number') : [];
      const row = {
        seed: 'organism/' + s.name,
        landedBy: ch ? 'this item (' + rel(path.join(DIR, 'chain-' + s.name + '.json')) + ')' : s.name === LANDED_BY_BOARD_23 ? 'Board 23 (bench/verdicts/dead-share.json), not landed again' : 'not landed (--no-land)',
        lines: { before: b ? b.lines.loaded : null, after: cv.lines.loaded },
        loadBearing: { before: b ? b.lines.loadBearing : null, after: cv.lines.loadBearing },
        deadShare: { before: b ? share(b.lines.loaded, b.lines.loadBearing) : null, after: share(cv.lines.loaded, cv.lines.loadBearing) },
        cellsWired: wired, cellsPruned: ch ? pruneSteps.reduce((a, x) => a + (x.cells.before - x.cells.after), 0) : null,
        edgesPruned: ch ? pruneSteps.reduce((a, x) => a + (x.edges.before - x.edges.after), 0) : null,
        cells: { ran: cv.cells.ran, declared: cv.cells.declared }, edges: { delivered: cv.edges.delivered, declared: cv.edges.declared },
        wallS: { landing: ch ? ch.wallS : null, census: c.wallS, landingRun: ch ? (ch.reused ? 'an earlier run of this bench (' + ch.reused + ')' : 'this run') : null },
        chain: ch ? { ok: ch.ok, rounds: ch.rounds, passes: ch.passes, settled: ch.settled, horizon: { withheldInFlight: ch.horizon.withheld, withheldHostedNeverRan: ch.horizon.hostedNeverRan, edgesDropped: ch.horizon.edgesDropped, cellsDropped: ch.horizon.cellsDropped, reverted: ch.horizon.reverted }, firstCensusMatchesBefore: b ? ch.first.lines === b.lines.loaded && ch.first.loadBearing === b.lines.loadBearing : null, hostedScore: [ch.first.score, ch.last.score] } : null,
        census: { file: c.file, at: cv.at, hashIsTheSeed: cv.live && cv.live.manifestHash === hashNow.get(s.name) },
      };
      say('seed ' + row.seed + ': lines loaded ' + row.lines.after + '; load bearing ' + row.loadBearing.before + ' -> ' + row.loadBearing.after + '; dead share ' + row.deadShare.before + ' -> ' + row.deadShare.after + '; cells wired ' + row.cellsWired + ', pruned ' + row.cellsPruned + '; cells ran ' + row.cells.ran + ' of ' + row.cells.declared + '; edges delivered ' + row.edges.delivered + ' of ' + row.edges.declared + '; wall ' + (row.wallS.landing === null ? '-' : row.wallS.landing.toFixed(1)) + ' s landing + ' + row.wallS.census.toFixed(1) + ' s census');
      return row;
    });

    // BAR: the board's command
    waitFree(minFreeMB, say);
    const bar = runSync(BAR_ARGS, 'bar');
    for (const l of bar.out.split(/\r?\n/)) if (l.startsWith('seed organism/') || l.startsWith('skip ') || l.startsWith('Census of ') || l.startsWith('BUDGET done') || l.startsWith('BUDGET KILLED')) say('bar | ' + l);
    if (bar.status !== 0) throw new Error('the bar command exited ' + bar.status + ': ' + lastLines(bar.out, 3).join(' | '));
    covered.bar = true;
    const after = JSON.parse(readFileSync(path.join(VDIR, 'census-all.json'), 'utf8'));
    const afterTotals = totalsOf(after);
    const afterRows = new Map(after.seeds.map((r) => [r.seed, r]));
    for (const row of table) { const a = afterRows.get(row.seed); row.bar = a && !a.skipped ? { loaded: a.lines.loaded, loadBearing: a.lines.loadBearing, deadShare: share(a.lines.loaded, a.lines.loadBearing) } : null; }

    // GATE: the LOAD-BEARING row, as bench/gate.mjs computes it
    const G = await import(new URL('./gate.mjs', import.meta.url).href);
    const seeds = G.emittedSeeds(ROOT);
    const gate = G.loadBearingRow({ seeds, records: G.censusRecords(VDIR), daemon: await G.daemonLoads({ root: ROOT, seeds }) });
    say(gate.line);

    const dsv = JSON.parse(readFileSync(path.join(VDIR, 'dead-share.json'), 'utf8'));
    const barCounted = (after.counted || after.seeds.filter((x) => !x.skipped).map((x) => x.seed)).slice().sort();
    const tableSeeds = table.map((r) => r.seed).sort();
    const criteria = {
      censusAllBarMet: after.barMet === true && after.isTheBar === true,
      everyCountedSeedInTheTable: barCounted.length > 0 && JSON.stringify(barCounted) === JSON.stringify(tableSeeds),
      everyRowAtZeroInItsOwnCensus: table.length > 0 && table.every((r) => r.deadShare.after === 0 && r.census.hashIsTheSeed),
      everyRowAtZeroInTheBar: table.length > 0 && table.every((r) => r.bar && r.bar.deadShare === 0),
      // a landing this run ran must exit 0; one an earlier run ran and this run re-used is graded by its
      // chain record (the child writes it as its last statement and sets its exit code from its ok), and by
      // its exit where its land-<seed>.json sidecar recorded one
      everyLandingOK: chains.size === (land ? toLand.length : 0) && [...chains.values()].every((c) => c.ok && (c.exit === 0 || (c.exit === null && c.reused !== null))),
      noRowRose: table.every((r) => r.deadShare.before !== null && r.deadShare.after <= r.deadShare.before),
      gateRowGreen: gate.ok === true,
    };
    const barMet = Object.values(criteria).every(Boolean);
    const skippedNames = (after.skipped || []).map((x) => x.seed);
    let wroteBytes = 0;
    for (const f of readdirSync(DIR)) wroteBytes += statSync(path.join(DIR, f)).size;
    for (const r of table) wroteBytes += statSync(path.join(ROOT, r.census.file)).size;
    const v = {
      bench: ITEM, at: new Date().toISOString(), command, node: process.version, isTheBar: true, barMet,
      item: { board: 27, item: ITEM, rule: 'MANUAL P8: every counted seed under organism/ at dead share 0 (load bearing lines equal loaded lines)', landing: 'one call per seed from bench/dead-share-all.mjs (genome/emit.mjs --dead-share organism/<seed>, a child under tools/budget.mjs); not genome/emit.mjs --dead-share --all' },
      criteria,
      split: { heldOut: 'none', reason: 'a census of the tree\'s own seeds: the claim is that each seed on disk, run, reads every loaded line load bearing; nothing is fitted on one seed and scored on another, so there is nothing to hold out. The rule itself was held out once already: Board 23 ran the chain on copies of the seeds it had not built on (bench/verdicts/dead-share.json heldOut).' },
      control: {
        before: { file: before.file, at: before.v.at, command: before.v.command, statement: before.v.statement, totals: beforeTotals, note: 'the census of the same seeds before any landing of this item; every row\'s before is its row there, and each landing\'s first census is checked against it (chain.firstCensusMatchesBefore)' },
        clone: { cited: 'bench/verdicts/dead-share.json', at: dsv.at, barMet: dsv.barMet, clone: dsv.clone, note: 'the clone control of test/dead-share-bar.mjs (a seed emitted again from its own load is the same seed, and the chain over it changes nothing), cited and not re-run' },
      },
      bar: { command: 'node ' + BAR_ARGS.join(' '), file: 'bench/verdicts/census-all.json', at: after.at, barMet: after.barMet, statement: after.statement, budget: bar.budget, wallS: bar.wallS },
      totals: { before: beforeTotals, after: afterTotals },
      table,
      skipped: skipped.map((x) => ({ seed: x.seed, cells: x.cells, why: x.why })),
      barSkipped: skippedNames,
      gate: { ok: gate.ok, line: gate.line },
      wroteMB: Math.round(wroteBytes / 1048576 * 100) / 100, over100MB: wroteBytes > 100 * 1048576,
      statement: '',
    };
    const landed = table.filter((r) => r.chain);
    v.statement = 'Every counted seed under organism/ at dead share 0: ' + table.filter((r) => r.deadShare.after === 0).length + ' of ' + table.length + ' counted seeds read load bearing lines equal to loaded lines in their own census (tools/organism-census.mjs --seed at 200 ticks, --no-knockout) and ' + table.filter((r) => r.bar && r.bar.deadShare === 0).length + ' of ' + table.length + ' in the bar census (census-all.json, barMet ' + after.barMet + '). ' + landed.length + ' were landed in place by this item, one call per seed from this bench (genome/emit.mjs --dead-share: census, wire to the fixed point, prune, the horizon step, repeated until a pass changes nothing), ' + landed.filter((r) => r.chain.ok).length + ' of them OK by the chain\'s own checks (' + [...chains.values()].filter((c) => !c.reused).length + ' landed by this run, ' + [...chains.values()].filter((c) => c.reused).length + ' by an earlier run of this bench and not landed again because the seed\'s manifest hash is the one its chain ended on, ' + [...chains.values()].filter((c) => c.reused && c.exit !== null).length + ' of those with the child\'s exit recorded in a land-<seed>.json sidecar); organism/' + LANDED_BY_BOARD_23 + ' was landed by Board 23 and censused again here. Totals over the counted seeds: before (' + before.file + ', census-all at ' + before.v.at + ') ' + beforeTotals.lines.loadBearing + ' of ' + beforeTotals.lines.loaded + ' loaded lines load bearing, ' + beforeTotals.cells.ran + ' of ' + beforeTotals.cells.declared + ' cells ran, ' + beforeTotals.edges.delivered + ' of ' + beforeTotals.edges.declared + ' edges delivered; after ' + afterTotals.lines.loadBearing + ' of ' + afterTotals.lines.loaded + ', ' + afterTotals.cells.ran + ' of ' + afterTotals.cells.declared + ', ' + afterTotals.edges.delivered + ' of ' + afterTotals.edges.declared + '. Skipped by name: ' + skipped.map((x) => x.seed + ' (' + x.cells + ' cells)').join(', ') + '. Split: none held out (a census of the tree\'s own seeds). Controls: the before census, and the clone control of test/dead-share-bar.mjs cited from bench/verdicts/dead-share.json (at ' + dsv.at + ', not re-run). The gate LOAD-BEARING row is ' + (gate.ok ? 'GREEN' : 'RED') + '. The bar is ' + (barMet ? 'met' : 'NOT met' + ' (' + Object.entries(criteria).filter(([, x]) => !x).map(([k]) => k).join(', ') + ')') + '.';
    const file = path.join(VDIR, ITEM + '.json');
    writeFileSync(file, JSON.stringify(v, null, 2) + '\n');
    say(v.statement);
    say('wrote ' + rel(file) + ' (isTheBar true, barMet ' + barMet + ')');
    if (!barMet) process.exitCode = 1;
  } catch (err) {
    const file = path.join(VDIR, ITEM + '-run-partial.json');
    const v = { bench: ITEM, at: new Date().toISOString(), command, node: process.version, isTheBar: false, barMet: false, error: String(err && err.message ? err.message : err), covered, statement: 'The run did not finish: ' + String(err && err.message ? err.message : err) + '. It covered: landed ' + covered.landed.length + ' (' + covered.landed.join(', ') + '), censused ' + covered.censused.length + ', the bar ' + (covered.bar ? 'ran' : 'did not run') + '.' };
    writeFileSync(file, JSON.stringify(v, null, 2) + '\n');
    say(v.statement);
    say('wrote ' + rel(file));
    process.exitCode = 1;
  }
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await main(process.argv.slice(2));
