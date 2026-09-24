// tools/organism-census.mjs: HOW MUCH OF THE GENERATED ORGANISM RUNS (MANUAL P8).
//
// "make sure the 5 million organism lines u wrote arent empty code, that all of the code is
// extremely important". An emitted seed is declarations: regions.mjs declares regions and
// circuits, cells-NNN.mjs one c() line per cell, edges-NNN.mjs one e() line per edge. A line
// is load bearing only if what it declares does something when the organism runs. This tool
// loads a seed, drives it, and counts:
//
//   files      files present in the seed directory, files the load actually read
//   lines      physical lines present and loaded (counted the way bench/gate.mjs counts),
//              declaration lines, and the declaration lines whose cell RAN or whose edge
//              DELIVERED; the rest are structure (headers, braces, index.mjs, manifest.json)
//   cells      declared, ran at least once, fired (emitted) at least once, threw; the ones
//              that never ran split by why: budget skipped, event cell that no mail reached
//   edges      declared, delivered at least once; the rest split by why: the source never
//              fired, the source fired on another port, scheduled but still in flight
//   kinds      present, ran; the kinds that never ran are named
//
// THE DRIVE is the standard one for a loaded seed, bench/speed.mjs: one brain.tick(1) per
// turn of the event loop, nothing injected, runtime/kernels.mjs installed (speed.json shows
// the kernels arm does the identical work: same runs, signals and deliveries per tick as the
// baseline arm). Every periodic cell is due at t = 0 (core/clock.mjs: t % period === 0), so a
// slow period does not hide a cell from a short census. Then THE TASKS: the two suites that
// can run inside a loaded organism (tasks/host.mjs names its cells and reads them through a
// tap), algebra and sequence, at the per suite counts generations/organism-genome.mjs scores
// a genome on. Their injections are part of the census, so a cell that only answers when the
// organism is asked something counts as running, and the prune cannot remove it.
//
// THE KNOCKOUT reloads the same seed with ONE emitted file left out (chosen by hashing
// --knockout-seed over the cells and edges files, or named with --knockout) and runs the same
// drive and the same tasks. Leaving out a cells file also drops every edge that names one of
// its cells, reported as orphaned. The delta in runs, deliveries, surviving cells whose run
// count changed, and the task score is what the absence of those lines did.
//
// THE LIVENESS is written into the verdict as two bitsets (genome/emit.mjs liveBits), which
// genome/emit.mjs --prune reads to re-emit the seed without what never ran.
//
//   node tools/organism-census.mjs --seed organism/gen-0 [--ticks 200] [--knockout-seed census]
//        [--knockout cells-001.mjs] [--no-knockout] [--no-knockout-tasks] [--tasks off] [--no-kernels] [--partial]
//        [--progress N] [--min-free-mb M] [--tag name]
//   node tools/organism-census.mjs --all [--ticks 200] [--max-cells 50000]
//   node tools/organism-census.mjs --static --seed organism/scale-52000 [--horizon 16] [--tasks off]
//        walks every line and loads nothing (staticCensus below): census-scale-static.json, and for
//        the seed genome/emit.mjs --prune wrote from it, census-scale-pruned.json
//   node tools/organism-census.mjs --sample 0.02 --seed organism/scale-52000 [--horizon 16]
//        [--batch-cells 80000] [--cap-mb 5000] [--max-batches N] [--sample-seed census] [--no-reduce]
//        runs a seeded sample of cells exactly on their cones (sampledCensus below):
//        census-scale-sampled-partial.json, isTheBar false (the measurement beside the static bar)
//
// Verdicts: organism/gen-0 writes bench/verdicts/census.json, any other seed
// census-<name>.json, isTheBar true. A run with --partial, --no-knockout or --tasks off writes
// <that name>-partial.json with isTheBar false. --all writes census-all.json, isTheBar false.
//
// --progress N prints (and records in the verdict) the process memory every N ticks of every
// arm, drive and tasks alike, plus the hypervector heap's slots in use and fallbacks. On
// Windows rss is the working set, which stops growing once the machine pages, so the line also
// prints the machine's free physical memory. --min-free-mb M stops the census with a printed
// error when a sample finds less than M MB free, and writes <name>-stopped-partial.json (isTheBar
// false) holding every sample taken: the record of where an organism stopped fitting in RAM.
// Run under node --expose-gc, every sample follows a full collection. --tag t writes
// census[-seed]-t-partial.json (isTheBar false), so a diagnostic run overwrites nothing.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync, openSync, readSync, writeSync, closeSync, rmSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { freemem, totalmem, tmpdir } from 'node:os';
import { heapStats } from '../core/simd.mjs';
import { dropPayload } from '../core/signal.mjs';
import { getKind, DEFAULT_POLICY } from '../core/cell.mjs';
import '../cells/all.mjs';
import { loadOrganism, verify, readManifest } from '../genome/load.mjs';
import { liveBits, eachLine, declArgs, cellHashRow, edgeHashRow, seedFiles } from '../genome/emit.mjs';
import { edgeFault } from '../genome/wire.mjs';
import { install as installKernels } from '../runtime/kernels.mjs';
import {
  generateAlgebra, solveAlgebra, gradeAlgebra, algebraCellsOf,
  generateSequences, solveSequences, gradeSequences, sequenceCellsOf,
  nameCells, roleOfRoute, ALGEBRA_ROLES, SEQUENCE_ROLES,
} from '../tasks/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const BRAIN_ROOT = path.resolve(HERE, '..');
const toPosix = (p) => p.replaceAll('\\', '/');
const rel = (p) => toPosix(path.relative(BRAIN_ROOT, p));
const now = () => Number(process.hrtime.bigint()) / 1e6;
const turn = () => new Promise((r) => setImmediate(r));
const pct = (a, b) => (b ? (100 * a / b).toFixed(2) : 'n/a');
const frac = (a, b) => (b ? Number((a / b).toFixed(6)) : null);

// The per suite counts generations/organism-genome.mjs SUITE_DEFS scores a genome on.
export const ALGEBRA_COUNTS = Object.freeze({ decimalCompare: 6, decimalSum: 5, bigintMul: 5, fractionArith: 5, nestedEval: 5, power: 4, linearSolve: 6 });
export const SEQUENCE_COUNTS = Object.freeze({ arithmetic: 5, geometric: 4, periodic: 4, recurrence: 4, polynomial: 5 });

// ---------------------------------------------------------------- the seed on disk
/** Count physical lines the way bench/gate.mjs does: text.split('\n').length. */
function physicalLines(file) {
  const buf = readFileSync(file);
  let n = 1;
  for (let i = 0; i < buf.length; i++) if (buf[i] === 10) n++;
  return n;
}

/**
 * Import a seed once. Every part module is a pure replay of declarations, so one import
 * serves the full load and the knockout load alike.
 * @param {string} dir
 */
export async function readSeed(dir) {
  const abs = path.resolve(BRAIN_ROOT, dir);
  const manifest = readManifest(abs);
  const indexFile = path.join(abs, 'index.mjs');
  const indexText = readFileSync(indexFile, 'utf8');
  const cellFiles = [...indexText.matchAll(/from "\.\/(cells-\d+\.mjs)"/g)].map((m) => m[1]);
  const edgeFiles = [...indexText.matchAll(/from "\.\/(edges-\d+\.mjs)"/g)].map((m) => m[1]);
  const t0 = now();
  const mod = await import(pathToFileURL(indexFile).href);
  const importMs = now() - t0;
  if (mod.parts.cells.length !== cellFiles.length || mod.parts.edges.length !== edgeFiles.length) {
    throw new Error('census: index.mjs imports ' + cellFiles.length + ' cells and ' + edgeFiles.length + ' edges files but exports ' + mod.parts.cells.length + ' and ' + mod.parts.edges.length);
  }
  // Declarations per file, by replaying each module into a counter.
  let nr = 0, nk = 0;
  mod.parts.regions(() => { nr++; }, () => { nk++; });
  const cellCounts = mod.parts.cells.map((fn) => { let n = 0; fn(() => { n++; }); return n; });
  const edgeCounts = mod.parts.edges.map((fn) => { let n = 0; fn(() => { n++; }); return n; });
  const present = readdirSync(abs).filter((f) => statSync(path.join(abs, f)).isFile()).sort();
  const lines = {};
  for (const f of present) lines[f] = physicalLines(path.join(abs, f));
  return {
    dir: abs, name: path.basename(abs), manifest, meta: mod.meta, parts: mod.parts, importMs,
    files: { present, cells: cellFiles, edges: edgeFiles, lines },
    declared: { regions: nr, circuits: nk, cellsPerFile: cellCounts, edgesPerFile: edgeCounts },
  };
}

/**
 * Build a Brain from a read seed, optionally leaving one cells or edges file out.
 * @returns {{ brain, excluded: null|object }}
 */
export function assemble(seed, { exclude = null } = {}) {
  const { parts, meta, files } = seed;
  if (!exclude) return { brain: loadOrganism(parts, meta), excluded: null };
  const ci = files.cells.indexOf(exclude), ei = files.edges.indexOf(exclude);
  if (ci < 0 && ei < 0) throw new Error('census: ' + exclude + ' is not a cells or edges file of ' + seed.name);
  const cells = parts.cells.filter((_, i) => i !== ci);
  let present = null;
  if (ci >= 0) { present = new Set(); for (const fn of cells) fn((id) => { present.add(id); }); }
  const excluded = { file: exclude, cells: ci >= 0 ? seed.declared.cellsPerFile[ci] : 0, edges: ei >= 0 ? seed.declared.edgesPerFile[ei] : 0, orphanedEdges: 0 };
  const edges = parts.edges.filter((_, i) => i !== ei).map((fn) => (present === null ? fn : (e) => fn((src, dst, ...rest) => {
    if (present.has(src) && present.has(dst)) e(src, dst, ...rest); else excluded.orphanedEdges++;
  })));
  const brain = loadOrganism({ regions: parts.regions, cells, edges }, meta);
  return { brain, excluded };
}

/** Pick the knockout file: sha256 of the seed string, modulo the cells and edges files. */
export function chooseKnockout(seed, knockoutSeed) {
  const candidates = [...seed.files.cells, ...seed.files.edges];
  const h = createHash('sha256').update(String(knockoutSeed)).digest();
  const i = h.readUInt32BE(0) % candidates.length;
  return { file: candidates[i], index: i, of: candidates.length, by: 'sha256(' + JSON.stringify(String(knockoutSeed)) + ') mod ' + candidates.length };
}

// ---------------------------------------------------------------- the tasks
/** The hosted suites: algebra and sequence answered by cells of this brain. */
export function taskScore(brain, { seed = 'census' } = {}) {
  const ap = generateAlgebra({ seed: seed + '/algebra', counts: ALGEBRA_COUNTS });
  const sp = generateSequences({ seed: seed + '/sequence', counts: SEQUENCE_COUNTS });
  const an = algebraCellsOf(brain), sn = sequenceCellsOf(brain);
  const t0 = now();
  const ag = gradeAlgebra(ap, solveAlgebra(ap, { brain, cells: an.cells }).results);
  const sg = gradeSequences(sp, solveSequences(sp, { brain, cells: sn.cells }).results);
  const row = (g, named) => ({ n: g.n, correct: g.correct, accuracy: Number(g.accuracy.toFixed(6)), missingRoles: named.missing, cells: named.chosen.map((c) => c.id) });
  const algebra = row(ag, an), sequence = row(sg, sn);
  return { algebra, sequence, score: Number(((algebra.accuracy + sequence.accuracy) / 2).toFixed(6)), ms: Math.round(now() - t0) };
}

// ---------------------------------------------------------------- dormant mail
// A cell on a numeric period runs only when t % period === 0 (core/clock.mjs); mail wakes
// event cells only. So once a periodic cell has no due tick left before the last tick the arm
// can reach, every item delivered to it stays in its mailbox, unread, to the end of the arm.
// Measured on gen-0 at 40 ticks (notes/census.md): 845,446 such items, 795.7 MB of payload,
// on the 8269 cells with periods of 1 s, 1 min and 1 h, which run at t = 0 and never again in
// a census. That, not the state the cells keep, is most of what took gen-0 to 16,877 MB.
//
// The census drops that mail right after Brain._deliver has counted it (brain.stats.delivered
// and the per edge hits are taken first), returning each payload the way a consuming run
// does (core/signal.mjs dropPayload). Nothing observable moves: the cell never runs again
// inside the arm, so it never reads the mail, and nothing else looks into a mailbox. Core
// is not edited; the drop is on this instance only, for this census.

/** The last tick an arm can reach: the drive, plus two ticks per hosted problem at most. */
export function lastTickBound(ticks, tasks) {
  const n = (o) => Object.values(o).reduce((a, x) => a + x, 0);
  return ticks + (tasks ? 2 * (n(ALGEBRA_COUNTS) + n(SEQUENCE_COUNTS)) : 0) - 1;
}
const NEVER = 2147483647;
/** First tick from which a cell will not run again up to lastTick; NEVER for an event cell. */
export function dormantFrom(period, lastTick) {
  if (period === 'event') return NEVER;
  const d = Math.floor(lastTick / period) * period + 1;
  return d <= lastTick ? d : NEVER;
}
function clearMailbox(cell) {
  let n = 0;
  for (const q of cell.mailbox) {
    if (!q.length) continue;
    for (const m of q) dropPayload(m.sig);
    n += q.length; q.length = 0;
  }
  return n;
}

// ---------------------------------------------------------------- one arm
/**
 * Load, drive, score, count. Everything returned is a measurement of this arm.
 * @param {object} seed from readSeed
 * @param {object} opts { exclude, ticks, tasks, taskSeed, keep }
 */
export async function runArm(seed, { exclude = null, ticks = 200, tasks = true, taskSeed = 'census', verifyLoad = true, progress = 0, minFreeMB = 0, label = '', log = null, samples = [], dropDormant = true } = {}) {
  const t0 = now();
  let phase = (label ? label + ' ' : '') + 'load';
  const sample = (brain) => {
    // Under node --expose-gc a sample follows a full collection, so it reads what is still
    // reachable, not garbage that has not been collected yet.
    const collected = typeof globalThis.gc === 'function';
    if (collected) globalThis.gc();
    const m = process.memoryUsage(), h = heapStats();
    const row = { phase, tick: brain ? brain.stats.ticks : 0, s: Number(((now() - t0) / 1000).toFixed(1)), rssMB: mb(m.rss), heapUsedMB: mb(m.heapUsed), heapTotalMB: mb(m.heapTotal), arrayBuffersMB: mb(m.arrayBuffers), externalMB: mb(m.external), freeMB: mb(freemem()), hvInUse: h.inUse, hvSlots: h.slots, hvFallbacks: h.fallbacks, afterGc: collected };
    samples.push(row);
    if (log) log('  progress   ' + row.phase + ' tick ' + row.tick + ' at ' + row.s + ' s: rss ' + row.rssMB + ' MB, heap used ' + row.heapUsedMB + ' of ' + row.heapTotalMB + ' MB, array buffers ' + row.arrayBuffersMB + ' MB, free ' + row.freeMB + ' of ' + mb(totalmem()) + ' MB, hv heap ' + row.hvInUse + ' of ' + row.hvSlots + ' slots, ' + row.hvFallbacks + ' fallbacks' + (collected ? ', after a full gc' : ''));
    if (minFreeMB > 0 && row.freeMB < minFreeMB) {
      const err = new Error('census: ' + row.freeMB + ' MB of physical memory free (under --min-free-mb ' + minFreeMB + ') at ' + row.phase + ' tick ' + row.tick + ', ' + row.s + ' s into the arm; rss ' + row.rssMB + ' MB, heap used ' + row.heapUsedMB + ' MB, array buffers ' + row.arrayBuffersMB + ' MB');
      err.censusSamples = samples; err.censusStop = row;
      throw err;
    }
    return row;
  };
  const { brain, excluded } = assemble(seed, { exclude });
  const loadMs = now() - t0;
  if (progress > 0) {
    sample(brain);
    phase = (label ? label + ' ' : '') + 'drive';
    // Wrapped on this instance only, like _deliver below: a sample every time the tick count
    // crosses a multiple of N, whoever called tick (the drive loop or the hosted suites).
    const tick = brain.tick; let mark = 0;
    brain.tick = function () { const r = tick.apply(this, arguments); const q = Math.floor(this.stats.ticks / progress); if (q > mark) { mark = q; sample(this); } return r; };
  }
  const nCells = brain.cells.length, k = brain.connectome, nEdges = k.n;
  const wiring = brain.genome.wiring || {};
  let verified = null;
  if (!exclude && verifyLoad) {
    const v = verify(brain, seed.manifest);
    verified = { ok: v.ok, hash: v.hash, errors: v.errors.slice(0, 5) };
    if (!v.ok) throw new Error('census: ' + seed.name + ' does not verify against its manifest: ' + v.errors.join('; '));
    // Line order is edge index order only when the reload accepted every e() line.
    if (wiring.duplicates || wiring.added !== seed.manifest.counts.edges) throw new Error('census: reload added ' + wiring.added + ' edges with ' + wiring.duplicates + ' duplicates; the manifest declares ' + seed.manifest.counts.edges);
  }

  // Per edge deliveries, counted where core counts brain.stats.delivered: every item of a
  // tick's inflight bucket goes into a mailbox in Brain._deliver. Wrapped on this instance
  // only; core is not edited. Taps added by the task phase sit past nEdges and are ignored.
  const hits = new Uint32Array(nEdges);
  const lastTick = lastTickBound(ticks, tasks);
  const dormant = new Int32Array(nCells);
  let dormantCells = 0, mailDropped = 0;
  for (let i = 0; i < nCells; i++) { dormant[i] = dropDormant ? dormantFrom(brain.cells[i].policy.period, lastTick) : NEVER; if (dormant[i] !== NEVER) dormantCells++; }
  const deliver = brain._deliver;
  brain._deliver = function (t) {
    const l = this.inflight.get(t);
    deliver.call(this, t);
    if (!l) return;
    // the drop is exact only inside the bound it was computed for
    if (dropDormant && t > lastTick) throw new Error('census: the arm reached tick ' + t + ', past the ' + lastTick + ' its dormant mail drop was computed for');
    for (let i = 0; i < l.length; i++) {
      const it = l[i], e = it.e;
      if (e >= 0 && e < nEdges) hits[e]++;
      if (it.dst < nCells && dormant[it.dst] <= t) mailDropped += clearMailbox(this.cells[it.dst]);
    }
  };
  // signals per declared cell (Brain.stats.signals counts the same calls, for every cell)
  const signals = new Uint32Array(nCells);
  const emit = brain._emit;
  brain._emit = function (cell, p, out, runSeq) { if (cell.idx < nCells) signals[cell.idx]++; return emit.call(this, cell, p, out, runSeq); };

  const t1 = now();
  for (let i = 0; i < ticks; i++) { brain.tick(1); await turn(); }
  const driveMs = now() - t1;
  const driveStats = { ...brain.stats };
  const driveRuns = new Int32Array(nCells);
  for (let i = 0; i < nCells; i++) driveRuns[i] = brain.cells[i].stats.runs;
  const driveHits = hits.slice();
  const driveSignals = signals.slice();

  phase = (label ? label + ' ' : '') + 'tasks';
  const task = tasks ? taskScore(brain, { seed: taskSeed }) : null;
  phase = (label ? label + ' ' : '') + 'end';
  if (progress > 0) sample(brain);
  const endStats = { ...brain.stats };
  if (task) task.ticks = endStats.ticks - driveStats.ticks;

  // ------------------------------------------------ cells
  const cellRows = { declared: nCells, ran: 0, ranDrive: 0, ranOnlyInTasks: 0, fired: 0, errored: 0, neverRan: 0, neverRanBudget: 0, neverRanEventNoMail: 0, neverRanOther: 0 };
  const gotMail = new Uint8Array(nCells);
  for (let e = 0; e < nEdges; e++) if (hits[e]) gotMail[k.dst[e]] = 1;
  const kindsPresent = new Map(), kindsRan = new Map(), kindsFired = new Map();
  const regionRows = {};
  const liveCircuits = new Set(), liveRegions = new Set();
  for (let i = 0; i < nCells; i++) {
    const c = brain.cells[i], s = c.stats;
    kindsPresent.set(c.kind, (kindsPresent.get(c.kind) || 0) + 1);
    const rr = regionRows[c.region] || (regionRows[c.region] = { cells: 0, ran: 0 });
    rr.cells++;
    if (s.errors > 0) cellRows.errored++;
    if (s.fired > 0) { cellRows.fired++; kindsFired.set(c.kind, (kindsFired.get(c.kind) || 0) + 1); }
    if (driveRuns[i] > 0) cellRows.ranDrive++;
    if (s.runs > 0) {
      cellRows.ran++; rr.ran++;
      if (driveRuns[i] === 0) cellRows.ranOnlyInTasks++;
      kindsRan.set(c.kind, (kindsRan.get(c.kind) || 0) + 1);
      liveCircuits.add(c.region + '/' + c.circuit); liveRegions.add(c.region);
    } else {
      cellRows.neverRan++;
      if (s.skips > 0) cellRows.neverRanBudget++;
      else if (c.policy.period === 'event' && !gotMail[i]) cellRows.neverRanEventNoMail++;
      else cellRows.neverRanOther++;
    }
  }

  // ------------------------------------------------ edges
  const edgeRows = { declared: nEdges, delivered: 0, deliveredDrive: 0, notDelivered: 0, srcNeverFired: 0, srcFiredOtherPort: 0, inFlightAtEnd: 0 };
  for (let e = 0; e < nEdges; e++) {
    if (driveHits[e]) edgeRows.deliveredDrive++;
    if (hits[e]) { edgeRows.delivered++; continue; }
    edgeRows.notDelivered++;
    if (k.usage[e] > 0) edgeRows.inFlightAtEnd++;
    else if (brain.cells[k.src[e]].stats.fired > 0) edgeRows.srcFiredOtherPort++;
    else edgeRows.srcNeverFired++;
  }

  const kinds = {
    present: kindsPresent.size, ran: kindsRan.size,
    fired: kindsFired.size,
    neverRan: [...kindsPresent.keys()].filter((x) => !kindsRan.has(x)).sort(),
    ranNeverFired: [...kindsPresent.keys()].filter((x) => kindsRan.has(x) && !kindsFired.has(x)).sort(),
    byKind: Object.fromEntries([...kindsPresent.entries()].sort().map(([x, n]) => [x, { cells: n, ran: kindsRan.get(x) || 0, fired: kindsFired.get(x) || 0 }])),
  };
  const regions = Object.fromEntries(Object.entries(regionRows).map(([n, r]) => [n, { ...r, fraction: frac(r.ran, r.cells) }]));
  const totals = {
    drive: { runs: driveStats.runs, signals: driveStats.signals, delivered: driveStats.delivered, grown: driveStats.grown, errors: driveStats.errors, refused: driveStats.refused },
    all: { ticks: endStats.ticks, runs: endStats.runs, signals: endStats.signals, delivered: endStats.delivered, grown: endStats.grown, errors: endStats.errors, refused: endStats.refused },
  };
  const ids = exclude ? null : brain.cells.slice(0, nCells).map((c) => c.id);
  const runs = new Int32Array(nCells), fired = new Int32Array(nCells), used = new Uint8Array(nEdges);
  for (let i = 0; i < nCells; i++) { runs[i] = brain.cells[i].stats.runs; fired[i] = brain.cells[i].stats.fired; }
  for (let e = 0; e < nEdges; e++) used[e] = k.usage[e] > 0 ? 1 : 0;
  const out = {
    excluded, loadMs: Math.round(loadMs), driveMs: Math.round(driveMs), ticks, verified,
    wiring: { added: wiring.added, duplicates: wiring.duplicates, illegal: wiring.illegal },
    cells: cellRows, edges: edgeRows, kinds, regions, totals, tasks: task,
    declaredTotals: declaredTotalsOf({ runs, driveRuns, signals, driveSignals, hits, driveHits }),
    dormant: { lastTickBound: lastTick, dropped: dropDormant, cells: dormantCells, mailDropped },
    circuitsLive: liveCircuits.size, regionsLive: liveRegions.size,
    ...(progress > 0 ? { progress: samples } : {}),
    // raw per index arrays for the caller: liveness, the knockout comparison, the sharded check
    raw: {
      ids, driveRuns, runs, fired, signals, driveSignals, hits, driveHits, used,
      cellLive: (i) => runs[i] > 0,
      edgeLive: (e) => hits[e] > 0,
      nCells, nEdges,
    },
  };
  return { arm: out, brain };
}

/** Runs, signals and deliveries summed over the DECLARED cells and edges only (no tap, no inject). */
function declaredTotalsOf({ runs, driveRuns, signals, driveSignals, hits, driveHits }) {
  const sum = (a) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; };
  return {
    drive: { runs: sum(driveRuns), signals: sum(driveSignals), delivered: sum(driveHits) },
    all: { runs: sum(runs), signals: sum(signals), delivered: sum(hits) },
  };
}

// ---------------------------------------------------------------- lines
/** Declaration lines per file and how many of them declared something that ran. */
export function lineCensus(seed, arm) {
  const L = seed.files.lines;
  const present = Object.values(L).reduce((a, n) => a + n, 0);
  const loadedFiles = ['index.mjs', 'regions.mjs', 'manifest.json', ...seed.files.cells, ...seed.files.edges].filter((f) => L[f] !== undefined);
  const loaded = loadedFiles.reduce((a, f) => a + L[f], 0);
  const perFile = [];
  let decl = seed.declared.regions + seed.declared.circuits, live = arm.regionsLive + arm.circuitsLive;
  perFile.push({ file: 'regions.mjs', lines: L['regions.mjs'], declarations: decl, live });
  let lo = 0;
  seed.files.cells.forEach((f, i) => {
    const n = seed.declared.cellsPerFile[i];
    let v = 0; for (let j = lo; j < lo + n; j++) if (arm.raw.cellLive(j)) v++;
    perFile.push({ file: f, lines: L[f], declarations: n, live: v });
    decl += n; live += v; lo += n;
  });
  lo = 0;
  seed.files.edges.forEach((f, i) => {
    const n = seed.declared.edgesPerFile[i];
    let v = 0; for (let j = lo; j < lo + n; j++) if (arm.raw.edgeLive(j)) v++;
    perFile.push({ file: f, lines: L[f], declarations: n, live: v });
    decl += n; live += v; lo += n;
  });
  const structure = loaded - decl;
  return {
    present, loaded, declarations: decl, liveDeclarations: live, deadDeclarations: decl - live, structure,
    loadBearing: live + structure,
    fractionLiveDeclarations: frac(live, decl), fractionLoadBearing: frac(live + structure, loaded),
    perFile,
  };
}

// ---------------------------------------------------------------- the whole census of a seed
export async function censusSeed(dir, { ticks = 200, tasks = true, knockout = true, knockoutSeed = 'census', knockoutFile = null, knockoutTasks = true, kernels = true, progress = 0, minFreeMB = 0, samples = [], log = (s) => process.stdout.write(s + '\n') } = {}) {
  if (kernels) installKernels();
  const mem0 = process.memoryUsage().rss;
  const seed = await readSeed(dir);
  const files = {
    present: seed.files.present.length,
    loaded: ['index.mjs', 'regions.mjs', 'manifest.json', ...seed.files.cells, ...seed.files.edges].filter((f) => seed.files.present.includes(f)).length,
    notLoaded: seed.files.present.filter((f) => !['index.mjs', 'regions.mjs', 'manifest.json', ...seed.files.cells, ...seed.files.edges].includes(f)),
  };
  log('census ' + rel(seed.dir) + ': imported ' + (seed.files.cells.length + seed.files.edges.length + 2) + ' modules in ' + (seed.importMs / 1000).toFixed(1) + ' s');
  const watch = { progress, minFreeMB, log: progress > 0 ? log : null, samples };
  let { arm: full, brain: fullBrain } = await runArm(seed, { ticks, tasks, taskSeed: 'census', ...watch });
  const lines = lineCensus(seed, full);
  const live = {
    manifestHash: seed.manifest.hash,
    phases: tasks ? 'the drive ticks plus the hosted algebra and sequence problems' : 'the drive ticks only',
    cells: liveBits(full.raw.nCells, full.raw.cellLive),
    edges: liveBits(full.raw.nEdges, full.raw.edgeLive),
    // edges that carried a signal still in flight when the run ended: genome/emit.mjs --prune keeps them
    inFlight: liveBits(full.raw.nEdges, (e) => full.raw.used[e] > 0 && full.raw.hits[e] === 0),
  };
  const ids = full.raw.ids, driveRunsFull = full.raw.driveRuns;
  const memFull = process.memoryUsage().rss;
  printArm(log, seed, files, full, lines, ticks);

  // Knockouts. 'seeded' leaves out the file sha256(--knockout-seed) picks (or --knockout).
  // 'tasks' leaves out the cells file that declares the cells the hosted suites chose in the
  // full arm, a declared second arm: the seeded one is blind to which lines carry the score.
  const knockouts = [];
  if (knockout) {
    const plan = [];
    const seeded = knockoutFile ? { file: knockoutFile, by: '--knockout' } : chooseKnockout(seed, knockoutSeed);
    plan.push({ role: 'seeded', file: seeded.file, by: seeded.by });
    if (knockoutTasks && full.tasks) {
      const hostIds = [...full.tasks.algebra.cells, ...full.tasks.sequence.cells];
      const pos = new Map(); for (let i = 0; i < ids.length; i++) pos.set(ids[i], i);
      const byFile = new Map();
      for (const id of hostIds) {
        let j = pos.get(id), fi = 0;
        if (j === undefined) continue;
        while (fi < seed.declared.cellsPerFile.length && j >= seed.declared.cellsPerFile[fi]) { j -= seed.declared.cellsPerFile[fi]; fi++; }
        const fname = seed.files.cells[fi];
        byFile.set(fname, (byFile.get(fname) || 0) + 1);
      }
      const top = [...byFile.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0];
      if (top && top[0] !== seeded.file) plan.push({ role: 'tasks', file: top[0], by: 'the cells file declaring ' + top[1] + ' of the ' + hostIds.length + ' cells the hosted suites chose' });
    }
    // drop the full arm's brain before the next load: at scale two organisms do not fit
    full.raw.cellLive = null; full.raw.edgeLive = null;
    releaseBrain(fullBrain); fullBrain = null;
    const idxOf = new Map(); for (let i = 0; i < ids.length; i++) idxOf.set(ids[i], i);
    for (const p of plan) {
      const { arm: kArm, brain: kBrain } = await runArm(seed, { exclude: p.file, ticks, tasks, taskSeed: 'census', ...watch, label: 'knockout ' + p.role });
      // surviving cells whose drive run count changed
      let survivors = 0, changed = 0, silenced = 0, woken = 0;
      for (let i = 0; i < kArm.raw.nCells; i++) {
        const j = idxOf.get(kBrain.cells[i].id);
        if (j === undefined) continue;
        survivors++;
        const a = driveRunsFull[j], b = kArm.raw.driveRuns[i];
        if (a !== b) { changed++; if (a > 0 && b === 0) silenced++; if (a === 0 && b > 0) woken++; }
      }
      releaseBrain(kBrain);
      const d = (a, b) => b - a;
      const ko = {
        role: p.role, file: p.file, chosenBy: p.by, fileLines: seed.files.lines[p.file],
        excluded: kArm.excluded,
        cells: { declared: kArm.cells.declared, ran: kArm.cells.ran, ranDrive: kArm.cells.ranDrive },
        edges: { declared: kArm.edges.declared, delivered: kArm.edges.delivered },
        totals: kArm.totals, tasks: kArm.tasks,
        survivors: { cells: survivors, driveRunsChanged: changed, silenced, woken },
        delta: {
          driveRuns: d(full.totals.drive.runs, kArm.totals.drive.runs),
          driveSignals: d(full.totals.drive.signals, kArm.totals.drive.signals),
          driveDelivered: d(full.totals.drive.delivered, kArm.totals.drive.delivered),
          cellsRan: d(full.cells.ran, kArm.cells.ran),
          edgesDelivered: d(full.edges.delivered, kArm.edges.delivered),
          taskScore: full.tasks && kArm.tasks ? Number((kArm.tasks.score - full.tasks.score).toFixed(6)) : null,
          algebraCorrect: full.tasks && kArm.tasks ? kArm.tasks.algebra.correct - full.tasks.algebra.correct : null,
          sequenceCorrect: full.tasks && kArm.tasks ? kArm.tasks.sequence.correct - full.tasks.sequence.correct : null,
        },
        loadMs: kArm.loadMs, driveMs: kArm.driveMs,
      };
      printKnockout(log, full, ko);
      knockouts.push(ko);
    }
  } else {
    releaseBrain(fullBrain); fullBrain = null;
  }
  delete full.raw;
  return { seed, files, full, lines, live, knockout: knockouts[0] || null, knockouts, memoryMB: { rssStart: mb(mem0), rssAfterFull: mb(memFull), rssEnd: mb(process.memoryUsage().rss) } };
}

// ---------------------------------------------------------------- the refusal (before any whole load)
// A whole load of organism/scale-52000 took the machine to paging (notes/census.md). So before
// a census imports a seed whole it estimates the resident memory the census will reach: the
// seed's manifest line count times the bytes per line gen-0 measured, from a census verdict
// (default bench/verdicts/census.json, the gen-0 bar: its rss after the full arm over its
// loaded lines). Over half the physical memory, the census refuses with exit code 2 and says
// to shard. Nothing is imported before the estimate: a planted manifest.json is enough.
export const DEFAULT_RATIO_FROM = 'bench/verdicts/census.json';

/**
 * Bytes of resident memory per loaded line, measured by a census of gen-0.
 * With progress samples and a horizon, the peak rss among samples up to that tick; otherwise
 * the rss after the full arm.
 * @param {string} file a census verdict
 * @param {number} [horizon] last tick the estimate is for
 */
export function ratioOf(file = DEFAULT_RATIO_FROM, horizon = Infinity) {
  const abs = path.resolve(BRAIN_ROOT, file);
  if (!existsSync(abs)) throw new Error('census: no ratio verdict at ' + rel(abs));
  const v = JSON.parse(readFileSync(abs, 'utf8'));
  const lines = v.lines && v.lines.loaded;
  if (!lines) throw new Error('census: ' + rel(abs) + ' carries no lines.loaded');
  let peakMB = null, how = null;
  const rows = Array.isArray(v.progress) ? v.progress.filter((s) => !/knockout/.test(s.phase) && s.tick <= horizon) : [];
  if (rows.length) { peakMB = Math.max(...rows.map((s) => s.rssMB)); how = 'peak rss of ' + rows.length + ' progress samples up to tick ' + Math.max(...rows.map((s) => s.tick)); }
  else if (v.memoryMB && v.memoryMB.rssAfterFull) { peakMB = v.memoryMB.rssAfterFull; how = 'rss after its full arm'; }
  else if (v.memoryMB && v.memoryMB.peakRssMB) { peakMB = v.memoryMB.peakRssMB; how = 'its peak rss'; }
  if (!peakMB) throw new Error('census: ' + rel(abs) + ' carries no rss to take a ratio from');
  const bytesPerLine = peakMB * 1048576 / lines;
  return { file: rel(abs), seed: v.seed, ticks: v.ticks, peakMB, lines, bytesPerLine: Math.round(bytesPerLine), how };
}

/**
 * The ratio a sharded plan is estimated with when --ratio-from is not given. A shard's memory
 * depends on how many ticks it runs, so the ratio comes from the newest census of gen-0 whose
 * progress samples cover ticks 0 to the horizon at most 2 ticks apart (the peak among them is
 * then the peak up to the horizon, under the runtime that census ran). Without one, the default
 * verdict's ratio (its rss after the full arm), which overstates a short horizon.
 * @param {number} horizon last tick of the run being estimated
 * @param {string} [dir] where the census verdicts are
 */
export function calibratedRatio(horizon, dir = path.join(BRAIN_ROOT, 'bench', 'verdicts')) {
  let best = null;
  for (const f of existsSync(dir) ? readdirSync(dir) : []) {
    if (!/^census.*\.json$/.test(f)) continue;
    let v;
    try { v = JSON.parse(readFileSync(path.join(dir, f), 'utf8')); } catch { continue; }
    if (toPosix(String(v.seed || '')) !== 'organism/gen-0' || !Array.isArray(v.progress) || !(v.lines && v.lines.loaded) || !v.at) continue;
    const t = v.progress.filter((s) => !/knockout/.test(s.phase)).map((s) => s.tick).sort((a, b) => a - b);
    if (!t.length || t[t.length - 1] < horizon) continue;
    const within = t.filter((x) => x <= horizon);
    let gap = within.length ? within[0] : Infinity;
    for (let i = 1; i < within.length; i++) gap = Math.max(gap, within[i] - within[i - 1]);
    if (within.length) gap = Math.max(gap, horizon - within[within.length - 1]);
    if (gap > 2) continue;
    if (!best || v.at > best.at) best = { file: path.join(dir, f), at: v.at };
  }
  return ratioOf(best ? best.file : DEFAULT_RATIO_FROM, horizon);
}

/** The estimate a whole load is refused on. Reads only manifest.json. */
export function estimateWhole(dir, ratio) {
  const abs = path.resolve(BRAIN_ROOT, dir);
  const m = readManifest(abs);
  const lines = m.counts && m.counts.lines;
  if (!Number.isFinite(lines)) throw new Error('census: ' + rel(abs) + '/manifest.json carries no counts.lines');
  const estimateMB = lines * ratio.bytesPerLine / 1048576;
  const limitMB = totalmem() / 2 / 1048576;
  return { seed: rel(abs), lines, estimateMB: Math.round(estimateMB), limitMB: Math.round(limitMB), totalMB: Math.round(totalmem() / 1048576), refuse: estimateMB > limitMB, ratio };
}
export function refusalText(est) {
  return 'census: REFUSED a whole load of ' + est.seed + ': estimated ' + est.estimateMB + ' MB resident = ' + est.lines + ' manifest lines x ' + est.ratio.bytesPerLine + ' bytes per line (gen-0: ' + est.ratio.peakMB + ' MB over ' + est.ratio.lines + ' lines, ' + est.ratio.how + ', ' + est.ratio.file + '), over half of the ' + est.totalMB + ' MB of physical memory (' + est.limitMB + ' MB). Census it in shards: --shard-files N loads N cells files at a time.';
}

// ---------------------------------------------------------------- the seed as text (sharded)
// A sharded census never imports the seed: an ES module stays cached for the life of the
// process, so a shard could not be freed. It reads each emitted file as text, one file at a
// time, and parses each c() and e() line as the JSON array its arguments are (genome/emit.mjs
// writes them with JSON.stringify), replaying only the lines a shard needs into loadOrganism.

/** index.mjs names the files in load order and carries the meta the loader takes. */
export function seedText(dir) {
  const abs = path.resolve(BRAIN_ROOT, dir);
  const manifest = readManifest(abs);
  const indexText = readFileSync(path.join(abs, 'index.mjs'), 'utf8');
  const cellFiles = [...indexText.matchAll(/from "\.\/(cells-\d+\.mjs)"/g)].map((m) => m[1]);
  const edgeFiles = [...indexText.matchAll(/from "\.\/(edges-\d+\.mjs)"/g)].map((m) => m[1]);
  const mm = indexText.match(/^export const meta = (\{.*\});\r?$/m);
  if (!mm) throw new Error('census: ' + rel(abs) + '/index.mjs carries no meta line');
  return { dir: abs, name: path.basename(abs), manifest, meta: JSON.parse(mm[1]), cellFiles, edgeFiles };
}

/**
 * Walk the declaration lines of one emitted file: fn(text, a, b) gets the argument text as
 * text.slice(a, b). Returns the physical lines of the file, counted the way bench/gate.mjs
 * counts them (the newlines plus one).
 */
function eachDecl(file, prefix, fn) {
  const text = readFileSync(file, 'utf8');
  const n = text.length;
  const prefixes = Array.isArray(prefix) ? prefix : [prefix];
  let lines = 1, i = 0;
  while (i < n) {
    let j = text.indexOf('\n', i);
    if (j < 0) j = n; else lines++;
    for (const pre of prefixes) {
      if (!text.startsWith(pre, i)) continue;
      let end = j;
      if (end > i && text.charCodeAt(end - 1) === 13) end--;
      if (text.charCodeAt(end - 1) !== 59 || text.charCodeAt(end - 2) !== 41) throw new Error('census: ' + file + ': a declaration line does not end in ");"');
      fn(text, i + pre.length, end - 2, pre);
      break;
    }
    i = j + 1;
  }
  return lines;
}
const argsOf = (text, a, b) => JSON.parse('[' + text.slice(a, b) + ']');

/**
 * Parse a whole seed as text into flat arrays: per cell its kind, region, circuit, period and
 * file; per edge its endpoints, ports and delay. The hosted suites pick their cells from this
 * (tasks/host.mjs nameCells on the same cells in the same order), so every shard injects into
 * the cells the whole organism would.
 */
export function planSeed(st, { taskSeed = 'census' } = {}) {
  const t0 = now();
  const m = st.manifest;
  const nC = m.counts.cells, nE = m.counts.edges;
  const ids = new Array(nC), idx = new Map();
  const kinds = [], kindId = new Map(), regions = [], regionId = new Map(), circuitId = new Map(), circuitList = [];
  const kindOf = new Uint16Array(nC), regionOf = new Uint16Array(nC), circuitOf = new Int32Array(nC);
  const period = new Float64Array(nC), fileOf = new Uint16Array(nC);
  const roleKinds = new Set([...ALGEBRA_ROLES, ...SEQUENCE_ROLES].map((r) => r.kind));
  const roleCells = [];
  const lines = {};
  const intern = (map, list, key) => { let v = map.get(key); if (v === undefined) { v = list.length; list.push(key); map.set(key, v); } return v; };
  // regions.mjs: r(name, o) and k(region, name, period, doc), replayed as they are
  const regionsDecl = [];
  const rf = path.join(st.dir, 'regions.mjs');
  let nr = 0, nk = 0;
  lines['regions.mjs'] = eachDecl(rf, ['r(', 'k('], (t, a, b, pre) => { regionsDecl.push([pre[0], argsOf(t, a, b)]); if (pre === 'r(') nr++; else nk++; });
  const cellsPerFile = [], edgesPerFile = [];
  let g = 0;
  st.cellFiles.forEach((f, fi) => {
    const before = g;
    lines[f] = eachDecl(path.join(st.dir, f), 'c(', (t, a, b) => {
      const [id, kind, region, circuit, params, policy] = argsOf(t, a, b);
      if (g >= nC) throw new Error('census: ' + st.name + ' declares more cells than its manifest counts (' + nC + ')');
      ids[g] = id; idx.set(id, g);
      kindOf[g] = intern(kindId, kinds, kind);
      regionOf[g] = intern(regionId, regions, region || 'default');
      circuitOf[g] = intern(circuitId, circuitList, (region || 'default') + '/' + (circuit || 'default'));
      const p = policy && policy.period !== undefined ? policy.period : DEFAULT_POLICY.period;
      period[g] = p === 'event' ? -1 : p;
      fileOf[g] = fi;
      if (roleKinds.has(kind)) roleCells.push({ id, kind, params: { ...(getKind(kind).defaults || {}), ...(params || {}) }, policy: { period: p } });
      g++;
    });
    cellsPerFile.push(g - before);
  });
  if (g !== nC) throw new Error('census: ' + st.name + ' declares ' + g + ' cells, its manifest counts ' + nC);
  const src = new Int32Array(nE), dst = new Int32Array(nE), delay = new Int32Array(nE);
  const sp = new Uint8Array(nE), dp = new Uint8Array(nE);
  let ge = 0;
  st.edgeFiles.forEach((f) => {
    const before = ge;
    lines[f] = eachDecl(path.join(st.dir, f), 'e(', (t, a, b) => {
      const x = argsOf(t, a, b);
      const s = idx.get(x[0]), d = idx.get(x[1]);
      if (s === undefined || d === undefined) throw new Error('census: ' + f + ': an edge names an undeclared cell (' + x[0] + ' -> ' + x[1] + ')');
      if (ge >= nE) throw new Error('census: ' + st.name + ' declares more edges than its manifest counts (' + nE + ')');
      src[ge] = s; dst[ge] = d; sp[ge] = x[2]; dp[ge] = x[3]; delay[ge] = x[5];
      ge++;
    });
    edgesPerFile.push(ge - before);
  });
  if (ge !== nE) throw new Error('census: ' + st.name + ' declares ' + ge + ' edges, its manifest counts ' + nE);
  const present = readdirSync(st.dir).filter((f) => statSync(path.join(st.dir, f)).isFile()).sort();
  for (const f of present) if (lines[f] === undefined) lines[f] = physicalLines(path.join(st.dir, f));
  // the hosted suites: the cells the whole organism would pick, and the ticks they cost
  const pseudo = { cells: roleCells };
  const an = nameCells(pseudo, ALGEBRA_ROLES), sn = nameCells(pseudo, SEQUENCE_ROLES);
  const ap = generateAlgebra({ seed: taskSeed + '/algebra', counts: ALGEBRA_COUNTS });
  const sq = generateSequences({ seed: taskSeed + '/sequence', counts: SEQUENCE_COUNTS });
  let taskTicks = 0;
  for (const p of ap) if (an.cells[roleOfRoute(p.route)]) taskTicks += 2;
  if (sn.cells.fit) taskTicks += 2 * sq.length;
  const pickIds = [...new Set([...Object.values(an.cells), ...Object.values(sn.cells)])];
  return {
    nC, nE, ids, idx, kinds, kindOf, regions, regionOf, circuits: circuitList, circuitOf, period, fileOf, src, dst, delay, sp, dp,
    regionsDecl, declared: { regions: nr, circuits: nk, cellsPerFile, edgesPerFile }, lines, present,
    picks: { algebra: an.cells, sequence: sn.cells, missing: { algebra: an.missing, sequence: sn.missing }, cells: pickIds.map((id) => idx.get(id)) },
    taskTicks, parseMs: Math.round(now() - t0),
  };
}

/**
 * The backward cone of a set of cells within L ticks: every cell with a path into the set whose
 * travel time (one tick per edge plus its delay, core/connectome.mjs arrival) is at most L. A
 * cell outside it cannot change anything inside the set before tick L, so a shard that loads
 * its owned cells and their cone reproduces the whole organism on the owned cells exactly.
 * @returns {Int32Array} distance per cell, NEVER outside the cone
 */
export function backwardCone(plan, owned, L) {
  const { nC, nE, src, dst, delay } = plan;
  if (!plan.inStart) {
    const inStart = new Int32Array(nC + 1);
    for (let e = 0; e < nE; e++) inStart[dst[e] + 1]++;
    for (let i = 0; i < nC; i++) inStart[i + 1] += inStart[i];
    const fill = inStart.slice(0, nC), inList = new Int32Array(nE);
    for (let e = 0; e < nE; e++) inList[fill[dst[e]]++] = e;
    plan.inStart = inStart; plan.inList = inList;
  }
  const { inStart, inList } = plan;
  const dist = new Int32Array(nC).fill(NEVER);
  const buckets = Array.from({ length: Math.max(0, L) + 1 }, () => []);
  for (let i = 0; i < nC; i++) if (owned[i]) { dist[i] = 0; buckets[0].push(i); }
  for (let d = 0; d <= L; d++) {
    for (const v of buckets[d]) {
      if (dist[v] !== d) continue;
      for (let q = inStart[v]; q < inStart[v + 1]; q++) {
        const e = inList[q], u = src[e], nd = d + 1 + delay[e];
        if (nd <= L && nd < dist[u]) { dist[u] = nd; buckets[nd].push(u); }
      }
    }
    buckets[d] = null;
  }
  return dist;
}

/**
 * What one shard loads. exact: its owned cells, their backward cone within the last tick, and
 * the cells the hosted suites inject into. cut: its owned cells and the injected cells only,
 * so an owned cell misses the mail of every cell outside the shard (an approximation, never
 * the bar). Edges: both endpoints loaded. Phantom edges: an owned source into a cell the shard
 * does not load; the census accounts for them at the source (see runShard).
 */
export function planShard(plan, files, { mode = 'exact', L, tasks = true, ratio = null }) {
  const { nC, nE, fileOf, src, dst } = plan;
  const owned = new Uint8Array(nC);
  const fset = new Set(files);
  let nOwned = 0;
  for (let i = 0; i < nC; i++) if (fset.has(fileOf[i])) { owned[i] = 1; nOwned++; }
  const inR = new Uint8Array(nC);
  let nCone = 0;
  if (mode === 'exact') {
    const dist = backwardCone(plan, owned, L);
    for (let i = 0; i < nC; i++) if (dist[i] !== NEVER) { inR[i] = 1; nCone++; }
  } else {
    for (let i = 0; i < nC; i++) if (owned[i]) { inR[i] = 1; nCone++; }
  }
  if (tasks) for (const c of plan.picks.cells) inR[c] = 1;
  let nR = 0; for (let i = 0; i < nC; i++) nR += inR[i];
  const loadE = new Uint8Array(nE);
  let nLoadE = 0, nPhantom = 0, nOwnedE = 0;
  for (let e = 0; e < nE; e++) {
    if (inR[src[e]] && inR[dst[e]]) { loadE[e] = 1; nLoadE++; }
    if (owned[src[e]]) { nOwnedE++; if (!inR[dst[e]]) nPhantom++; }
  }
  const lines = nR + nLoadE;
  const estimateMB = ratio ? Math.round(lines * ratio.bytesPerLine / 1048576) : null;
  return { files, owned, inR, loadE, nOwned, nCone, nR, nLoadE, nOwnedE, nPhantom, lines, estimateMB, whole: nR === nC };
}

/**
 * Load one shard from text and run the census drive and the hosted suites on it, with the
 * tick schedule of the whole organism. Returns the owned cells and the edges they source.
 */
export async function runShard(st, plan, shard, { ticks, tasks, L, capMB = 0, taskSeed = 'census', label = 'shard', into } = {}) {
  const t0 = now();
  const { nC, nE } = plan;
  const cellList = []; for (let g = 0; g < nC; g++) if (shard.inR[g]) cellList.push(g);
  const edgeList = new Int32Array(shard.nLoadE);
  { let j = 0; for (let e = 0; e < nE; e++) if (shard.loadE[e]) edgeList[j++] = e; }
  let gc = 0, ge = 0;
  const parts = {
    regions: (r, k) => { for (const [f, a] of plan.regionsDecl) (f === 'r' ? r : k)(...a); },
    cells: st.cellFiles.map((f) => (c) => { eachDecl(path.join(st.dir, f), 'c(', (t, a, b) => { if (shard.inR[gc++]) c(...argsOf(t, a, b)); }); }),
    edges: st.edgeFiles.map((f) => (e) => { eachDecl(path.join(st.dir, f), 'e(', (t, a, b) => { if (shard.loadE[ge++]) e(...argsOf(t, a, b)); }); }),
  };
  const meta = { ...st.meta, counts: { ...(st.meta.counts || {}), edges: shard.nLoadE } };
  let peakMB = 0;
  const rssNow = () => { const r = mb(process.memoryUsage.rss()); if (r > peakMB) peakMB = r; return r; };
  const cap = (where) => {
    const r = rssNow();
    if (capMB > 0 && r > capMB) {
      const err = new Error('census: ' + label + ' reached ' + r + ' MB resident at ' + where + ', over the ' + capMB + ' MB cap');
      err.censusCap = { label, where, rssMB: r, capMB }; throw err;
    }
  };
  let brain = loadOrganism(parts, meta);
  const loadMs = now() - t0;
  cap('load');
  const nLC = brain.cells.length, k = brain.connectome, nLE = k.n;
  if (nLC !== cellList.length) throw new Error('census: ' + label + ' loaded ' + nLC + ' cells, planned ' + cellList.length);
  if (nLE !== shard.nLoadE || brain.genome.wiring.duplicates) throw new Error('census: ' + label + ' loaded ' + nLE + ' edges with ' + brain.genome.wiring.duplicates + ' duplicates, planned ' + shard.nLoadE);
  for (let j = 0; j < nLC; j++) if (brain.cells[j].id !== plan.ids[cellList[j]]) throw new Error('census: ' + label + ' cell ' + j + ' is ' + brain.cells[j].id + ', planned ' + plan.ids[cellList[j]]);
  const ownedLocal = new Uint8Array(nLC);
  for (let j = 0; j < nLC; j++) ownedLocal[j] = shard.owned[cellList[j]];
  const localOf = new Int32Array(nC).fill(-1);
  for (let j = 0; j < nLC; j++) localOf[cellList[j]] = j;
  // phantom edges, per owned local source cell (CSR in global edge order)
  const phStart = new Int32Array(nLC + 1);
  for (let e = 0; e < nE; e++) { const s = plan.src[e]; if (shard.owned[s] && !shard.inR[plan.dst[e]]) phStart[localOf[s] + 1]++; }
  for (let j = 0; j < nLC; j++) phStart[j + 1] += phStart[j];
  const nPh = phStart[nLC];
  const phEdge = new Int32Array(nPh), phPort = new Uint8Array(nPh), phDelay = new Int32Array(nPh), phAccepts = new Array(nPh);
  { const fill = phStart.slice(0, nLC);
    for (let e = 0; e < nE; e++) {
      const s = plan.src[e], d = plan.dst[e];
      if (!(shard.owned[s] && !shard.inR[d])) continue;
      const q = fill[localOf[s]]++;
      phEdge[q] = e; phPort[q] = plan.sp[e]; phDelay[q] = plan.delay[e];
      phAccepts[q] = getKind(plan.kinds[plan.kindOf[d]]).ports.in[plan.dp[e]].kinds;
    } }
  const phUsage = new Uint32Array(nPh), phDrive = new Uint32Array(nPh), phAll = new Uint32Array(nPh);
  let phRefused = 0;
  // deliveries per loaded edge, and the dormant mail drop, exactly as runArm does
  const hits = new Uint32Array(nLE);
  const dormant = new Int32Array(nLC);
  for (let j = 0; j < nLC; j++) dormant[j] = dormantFrom(brain.cells[j].policy.period, L);
  let mailDropped = 0;
  const deliver = brain._deliver;
  brain._deliver = function (t) {
    const l = this.inflight.get(t);
    deliver.call(this, t);
    if (!l) return;
    if (t > L) throw new Error('census: ' + label + ' reached tick ' + t + ', past the last tick ' + L + ' of the whole organism schedule');
    for (let i = 0; i < l.length; i++) {
      const it = l[i], e = it.e;
      if (e >= 0 && e < nLE) hits[e]++;
      if (it.dst < nLC && dormant[it.dst] <= t) mailDropped += clearMailbox(this.cells[it.dst]);
    }
  };
  const signals = new Uint32Array(nLC);
  const emit = brain._emit;
  brain._emit = function (cell, p, out, runSeq) {
    const sig = emit.call(this, cell, p, out, runSeq);
    const j = cell.idx;
    if (j < nLC && ownedLocal[j]) {
      signals[j]++;
      const t = this.clock.t;
      for (let q = phStart[j]; q < phStart[j + 1]; q++) {
        if (phPort[q] !== p) continue;
        if (!phAccepts[q].includes(out.kind)) { phRefused++; continue; }
        phUsage[q]++;
        const at = t + 1 + phDelay[q];
        if (at <= ticks - 1) phDrive[q]++;
        if (at <= L) phAll[q]++;
      }
    }
    return sig;
  };
  const tick = brain.tick;
  brain.tick = function () { const r = tick.apply(this, arguments); cap('tick ' + this.stats.ticks); return r; };

  const t1 = now();
  for (let i = 0; i < ticks; i++) { brain.tick(1); await turn(); }
  const driveMs = now() - t1;
  const driveRunsL = new Int32Array(nLC);
  for (let j = 0; j < nLC; j++) driveRunsL[j] = brain.cells[j].stats.runs;
  const driveHits = hits.slice(), driveSignals = signals.slice();
  const t2 = now();
  let taskRes = null;
  if (tasks) {
    const ap = generateAlgebra({ seed: taskSeed + '/algebra', counts: ALGEBRA_COUNTS });
    const sq = generateSequences({ seed: taskSeed + '/sequence', counts: SEQUENCE_COUNTS });
    const ar = solveAlgebra(ap, { brain, cells: plan.picks.algebra }).results;
    const sr = solveSequences(sq, { brain, cells: plan.picks.sequence }).results;
    taskRes = { ar, sr };
  }
  const taskMs = now() - t2;
  const endTicks = brain.stats.ticks;
  if (endTicks !== L + 1) throw new Error('census: ' + label + ' ran ' + endTicks + ' ticks, the whole organism schedule is ' + (L + 1));
  cap('end');
  // what the shard owns: its cells, and every edge one of them sources, written straight into
  // the whole seed's arrays; a cell or edge written twice is an error, never a sum
  const T = into;
  let nCellsOut = 0, nEdgesOut = 0;
  for (let j = 0; j < nLC; j++) {
    if (!ownedLocal[j]) continue;
    const g = cellList[j], s = brain.cells[j].stats;
    if (T.seenCell[g]++) throw new Error('census: cell ' + plan.ids[g] + ' tallied twice');
    T.runs[g] = s.runs; T.driveRuns[g] = driveRunsL[j]; T.fired[g] = s.fired; T.errs[g] = s.errors; T.skips[g] = s.skips; T.signals[g] = signals[j]; T.driveSignals[g] = driveSignals[j];
    nCellsOut++;
  }
  const put = (g, h, dh, u) => { if (T.seenEdge[g]++) throw new Error('census: edge ' + g + ' tallied twice'); T.hits[g] = h; T.driveHits[g] = dh; T.used[g] = u; nEdgesOut++; };
  for (let le = 0; le < nLE; le++) { const g = edgeList[le]; if (shard.owned[plan.src[g]]) put(g, hits[le], driveHits[le], k.usage[le] > 0 ? 1 : 0); }
  for (let q = 0; q < nPh; q++) put(phEdge[q], phAll[q], phDrive[q], phUsage[q] > 0 ? 1 : 0);
  const grown = brain.stats.grown;
  const errors = brain.stats.errors;
  brain = null;
  if (typeof globalThis.gc === 'function') globalThis.gc();
  return {
    cells: nCellsOut, edges: nEdgesOut, tasks: taskRes, grown, errors, mailDropped, phantomRefused: phRefused,
    loadMs: Math.round(loadMs), driveMs: Math.round(driveMs), taskMs: Math.round(taskMs), wallMs: Math.round(now() - t0), peakRssMB: peakMB,
  };
}

/**
 * The census of a seed in shards of N cells files. Every declared cell is tallied in the shard
 * that owns it and every declared edge in the shard that owns its source, so the tallies add
 * up to the whole seed. mode exact reproduces the whole organism on each shard's owned cells
 * (the backward cone); mode cut does not and is never the bar.
 */
export async function censusSharded(dir, { shardFiles = 1, mode = 'exact', ticks = 200, tasks = true, capMB = 8000, ratio = null, ratioFrom = null, taskSeed = 'census', kernels = true, log = (s) => process.stdout.write(s + '\n'), refuseOver = true } = {}) {
  if (kernels) installKernels();
  const w0 = now();
  const st = seedText(dir);
  const plan = planSeed(st, { taskSeed });
  const L = ticks + (tasks ? plan.taskTicks : 0) - 1;
  if (!ratio && (ratioFrom || capMB > 0)) ratio = ratioFrom ? ratioOf(ratioFrom, L) : calibratedRatio(L);
  const nFiles = st.cellFiles.length, nShards = Math.ceil(nFiles / shardFiles);
  log('census ' + rel(st.dir) + ' in shards of ' + shardFiles + ' cells files (' + nShards + ' shards), mode ' + mode + ', cap ' + capMB + ' MB resident per shard');
  log('  plan       parsed ' + (st.cellFiles.length + st.edgeFiles.length + 1) + ' files as text in ' + (plan.parseMs / 1000).toFixed(1) + ' s: ' + plan.nC + ' cells, ' + plan.nE + ' edges; rss ' + mb(process.memoryUsage.rss()) + ' MB');
  log('  horizon    ' + ticks + ' drive ticks' + (tasks ? ' + ' + plan.taskTicks + ' hosted task ticks' : '') + ' = ticks 0 to ' + L + (tasks ? '; hosted cells ' + Object.entries(plan.picks.algebra).map(([r, id]) => r + ' ' + id).join(', ') + ', fit ' + (plan.picks.sequence.fit || 'none') : ''));
  if (ratio) log('  ratio      ' + ratio.bytesPerLine + ' bytes per line (gen-0: ' + ratio.peakMB + ' MB over ' + ratio.lines + ' lines, ' + ratio.how + ', ' + ratio.file + ')');
  const shards = [];
  for (let s = 0; s < nShards; s++) {
    const files = []; for (let f = s * shardFiles; f < Math.min(nFiles, (s + 1) * shardFiles); f++) files.push(f);
    const sh = planShard(plan, files, { mode, L, tasks, ratio });
    sh.index = s; sh.fileNames = files.map((f) => st.cellFiles[f]);
    shards.push(sh);
    log('  shard ' + s + '    ' + sh.fileNames.join(', ') + ': owns ' + sh.nOwned + ' cells and the ' + sh.nOwnedE + ' edges they source; loads ' + sh.nR + ' of ' + plan.nC + ' cells' + (mode === 'exact' ? ' (backward cone within ' + L + ' ticks: ' + sh.nCone + ')' : '') + ' and ' + sh.nLoadE + ' of ' + plan.nE + ' edges; ' + sh.nPhantom + ' owned edges lead out of the shard' + (sh.estimateMB !== null ? '; estimate ' + sh.estimateMB + ' MB' : ''));
  }
  const overCap = (sh) => capMB > 0 && sh.estimateMB !== null && sh.estimateMB > capMB;
  const over = shards.filter((sh) => sh.whole || overCap(sh));
  if (refuseOver && over.length) {
    const why = over.map((sh) => 'shard ' + sh.index + (sh.whole ? ' needs every cell of the seed (a whole load)' : '') + (overCap(sh) ? ' is estimated at ' + sh.estimateMB + ' MB, over the ' + capMB + ' MB cap' : '')).join('; ');
    const err = new Error('census: REFUSED the sharded census of ' + rel(st.dir) + ': ' + why + '.' + (mode === 'exact' ? ' An exact shard must load the backward cone of its cells over the whole horizon, and at ' + (L + 1) + ' ticks that cone is ' + Math.max(...shards.map((x) => x.nCone)) + ' of ' + plan.nC + ' cells.' : ''));
    err.censusRefused = { shards: shards.map(shardRow), L, plan: planRow(plan), ratio };
    throw err;
  }
  // run the shards one at a time, freeing each before the next
  const nC = plan.nC, nE = plan.nE;
  const runs = new Int32Array(nC), driveRuns = new Int32Array(nC), fired = new Int32Array(nC), errs = new Int32Array(nC), skips = new Int32Array(nC);
  const signals = new Uint32Array(nC), driveSignals = new Uint32Array(nC), seenCell = new Uint8Array(nC);
  const hits = new Uint32Array(nE), driveHits = new Uint32Array(nE), used = new Uint8Array(nE), seenEdge = new Uint8Array(nE);
  const into = { runs, driveRuns, fired, errs, skips, signals, driveSignals, seenCell, hits, driveHits, used, seenEdge };
  const ownerOf = new Int32Array(nC).fill(-1);
  const taskParts = [];
  for (const sh of shards) {
    for (let i = 0; i < nC; i++) if (sh.owned[i]) ownerOf[i] = sh.index;
    const r = await runShard(st, plan, sh, { ticks, tasks, L, capMB, taskSeed, label: 'shard ' + sh.index, into });
    taskParts.push(r.tasks);
    Object.assign(sh, { ran: r, peakRssMB: r.peakRssMB });
    log('  shard ' + sh.index + ' ran  load ' + (r.loadMs / 1000).toFixed(1) + ' s, drive ' + (r.driveMs / 1000).toFixed(1) + ' s, tasks ' + (r.taskMs / 1000).toFixed(1) + ' s; tallied ' + r.cells + ' cells and ' + r.edges + ' edges; peak rss ' + r.peakRssMB + ' MB (cap ' + capMB + '); grown ' + r.grown + ', dormant mail dropped ' + r.mailDropped);
    sh.owned = sh.inR = sh.loadE = null;
  }
  for (let i = 0; i < nC; i++) if (!seenCell[i]) throw new Error('census: cell ' + plan.ids[i] + ' was tallied by no shard');
  for (let e = 0; e < nE; e++) if (!seenEdge[e]) throw new Error('census: edge ' + e + ' was tallied by no shard');
  // the hosted answers: each problem from the shard that owns the cell it was put to
  let tasksOut = null;
  if (tasks) {
    const ap = generateAlgebra({ seed: taskSeed + '/algebra', counts: ALGEBRA_COUNTS });
    const sq = generateSequences({ seed: taskSeed + '/sequence', counts: SEQUENCE_COUNTS });
    const ownerId = (id) => (id ? ownerOf[plan.idx.get(id)] : -1);
    const ar = ap.map((p, i) => { const r0 = taskParts[0].ar[i]; const o = ownerId(r0.cell); return o >= 0 ? taskParts[o].ar[i] : r0; });
    const fo = ownerId(plan.picks.sequence.fit);
    const sr = fo >= 0 ? taskParts[fo].sr : taskParts[0].sr;
    const ag = gradeAlgebra(ap, ar), sg = gradeSequences(sq, sr);
    const row = (g, cells, missing) => ({ n: g.n, correct: g.correct, accuracy: Number(g.accuracy.toFixed(6)), missingRoles: missing, cells: Object.values(cells) });
    const algebra = row(ag, plan.picks.algebra, plan.picks.missing.algebra), sequence = row(sg, plan.picks.sequence, plan.picks.missing.sequence);
    tasksOut = { algebra, sequence, score: Number(((algebra.accuracy + sequence.accuracy) / 2).toFixed(6)), ticks: plan.taskTicks, results: { algebra: ar.map((r) => r.got), sequence: sr.map((r) => r.got) } };
  }
  const arm = tallyOf(plan, { runs, driveRuns, fired, errs, skips, signals, driveSignals, hits, driveHits, used, ticks, tasks: tasksOut });
  const seed = { dir: st.dir, name: st.name, manifest: st.manifest, files: { present: plan.present, cells: st.cellFiles, edges: st.edgeFiles, lines: plan.lines }, declared: plan.declared };
  const lines = lineCensus(seed, arm);
  const files = { present: plan.present.length, loaded: ['index.mjs', 'regions.mjs', 'manifest.json', ...st.cellFiles, ...st.edgeFiles].filter((f) => plan.present.includes(f)).length, notLoaded: plan.present.filter((f) => !['index.mjs', 'regions.mjs', 'manifest.json', ...st.cellFiles, ...st.edgeFiles].includes(f)) };
  const live = {
    manifestHash: st.manifest.hash,
    phases: (tasks ? 'the drive ticks plus the hosted algebra and sequence problems' : 'the drive ticks only') + ', sharded ' + mode,
    cells: liveBits(nC, (i) => runs[i] > 0),
    edges: liveBits(nE, (e) => hits[e] > 0),
    inFlight: liveBits(nE, (e) => used[e] > 0 && hits[e] === 0),
  };
  const exact = mode === 'exact' && shards.every((sh) => sh.ran.grown === 0);
  const out = {
    mode, exact, shardFiles, capMB, L, taskTicks: tasks ? plan.taskTicks : 0, seed, files, lines, full: arm, live,
    shards: shards.map(shardRow), ratio, wallMs: Math.round(now() - w0), processMaxRssMB: mb(process.resourceUsage().maxRSS * 1024), plan: planRow(plan),
  };
  delete arm.raw.cellLive; delete arm.raw.edgeLive;
  return out;
}
const shardRow = (sh) => ({ shard: sh.index, files: sh.fileNames, ownedCells: sh.nOwned, ownedEdges: sh.nOwnedE, loadedCells: sh.nR, cone: sh.nCone, loadedEdges: sh.nLoadE, phantomEdges: sh.nPhantom, estimateMB: sh.estimateMB, whole: sh.whole, ...(sh.ran ? { peakRssMB: sh.ran.peakRssMB, loadMs: sh.ran.loadMs, driveMs: sh.ran.driveMs, taskMs: sh.ran.taskMs, wallMs: sh.ran.wallMs, grown: sh.ran.grown, errors: sh.ran.errors, mailDropped: sh.ran.mailDropped, phantomRefused: sh.ran.phantomRefused } : {}) });
const planRow = (p) => ({ cells: p.nC, edges: p.nE, parseMs: p.parseMs, taskTicks: p.taskTicks, picks: { algebra: p.picks.algebra, sequence: p.picks.sequence, missing: p.picks.missing } });

/** The census rows of runArm, from per cell and per edge arrays however they were gathered. */
function tallyOf(plan, { runs, driveRuns, fired, errs, skips, signals, driveSignals, hits, driveHits, used, ticks, tasks }) {
  const { nC, nE } = plan;
  const cellRows = { declared: nC, ran: 0, ranDrive: 0, ranOnlyInTasks: 0, fired: 0, errored: 0, neverRan: 0, neverRanBudget: 0, neverRanEventNoMail: 0, neverRanOther: 0 };
  const gotMail = new Uint8Array(nC);
  for (let e = 0; e < nE; e++) if (hits[e]) gotMail[plan.dst[e]] = 1;
  const kp = new Map(), kr = new Map(), kf = new Map(), regionRows = {}, liveCircuits = new Set(), liveRegions = new Set();
  for (let i = 0; i < nC; i++) {
    const kind = plan.kinds[plan.kindOf[i]], region = plan.regions[plan.regionOf[i]];
    kp.set(kind, (kp.get(kind) || 0) + 1);
    const rr = regionRows[region] || (regionRows[region] = { cells: 0, ran: 0 });
    rr.cells++;
    if (errs[i] > 0) cellRows.errored++;
    if (fired[i] > 0) { cellRows.fired++; kf.set(kind, (kf.get(kind) || 0) + 1); }
    if (driveRuns[i] > 0) cellRows.ranDrive++;
    if (runs[i] > 0) {
      cellRows.ran++; rr.ran++;
      if (driveRuns[i] === 0) cellRows.ranOnlyInTasks++;
      kr.set(kind, (kr.get(kind) || 0) + 1);
      liveCircuits.add(plan.circuitOf[i]); liveRegions.add(region);
    } else {
      cellRows.neverRan++;
      if (skips[i] > 0) cellRows.neverRanBudget++;
      else if (plan.period[i] === -1 && !gotMail[i]) cellRows.neverRanEventNoMail++;
      else cellRows.neverRanOther++;
    }
  }
  const edgeRows = { declared: nE, delivered: 0, deliveredDrive: 0, notDelivered: 0, srcNeverFired: 0, srcFiredOtherPort: 0, inFlightAtEnd: 0 };
  for (let e = 0; e < nE; e++) {
    if (driveHits[e]) edgeRows.deliveredDrive++;
    if (hits[e]) { edgeRows.delivered++; continue; }
    edgeRows.notDelivered++;
    if (used[e]) edgeRows.inFlightAtEnd++;
    else if (fired[plan.src[e]] > 0) edgeRows.srcFiredOtherPort++;
    else edgeRows.srcNeverFired++;
  }
  const kinds = {
    present: kp.size, ran: kr.size, fired: kf.size,
    neverRan: [...kp.keys()].filter((x) => !kr.has(x)).sort(),
    ranNeverFired: [...kp.keys()].filter((x) => kr.has(x) && !kf.has(x)).sort(),
    byKind: Object.fromEntries([...kp.entries()].sort().map(([x, n]) => [x, { cells: n, ran: kr.get(x) || 0, fired: kf.get(x) || 0 }])),
  };
  const regions = Object.fromEntries(Object.entries(regionRows).map(([n, r]) => [n, { ...r, fraction: frac(r.ran, r.cells) }]));
  return {
    ticks, cells: cellRows, edges: edgeRows, kinds, regions, tasks,
    declaredTotals: declaredTotalsOf({ runs, driveRuns, signals, driveSignals, hits, driveHits }),
    circuitsLive: liveCircuits.size, regionsLive: liveRegions.size,
    raw: { runs, driveRuns, fired, signals, driveSignals, hits, driveHits, used, cellLive: (i) => runs[i] > 0, edgeLive: (e) => hits[e] > 0, nCells: nC, nEdges: nE },
  };
}

function releaseBrain(brain) {
  if (!brain) return;
  // Hand back what is cheap to hand back; the rest goes with the last reference.
  brain.inflight && brain.inflight.clear && brain.inflight.clear();
  brain.outbox = [];
  if (typeof globalThis.gc === 'function') globalThis.gc();
}
const mb = (b) => Number((b / 1048576).toFixed(1));

// ---------------------------------------------------------------- printing
function printArm(log, seed, files, a, lines, ticks) {
  log('  files      ' + files.loaded + ' loaded of ' + files.present + ' present' + (files.notLoaded.length ? ' (not loaded: ' + files.notLoaded.join(', ') + ')' : ''));
  log('  lines      ' + lines.loaded + ' loaded of ' + lines.present + ' present; declarations ' + lines.declarations + ', of which ran or delivered ' + lines.liveDeclarations + ' (' + pct(lines.liveDeclarations, lines.declarations) + '%), dead ' + lines.deadDeclarations + '; structure ' + lines.structure);
  log('  load bearing lines ' + lines.loadBearing + ' of ' + lines.loaded + ' loaded (' + pct(lines.loadBearing, lines.loaded) + '%)');
  log('  verify     ' + (a.verified ? (a.verified.ok ? 'ok, hash ' + a.verified.hash.slice(0, 16) : 'FAILED') : 'skipped') + '; wiring added ' + a.wiring.added + ', duplicates ' + a.wiring.duplicates + ', illegal ' + a.wiring.illegal + '; load ' + (a.loadMs / 1000).toFixed(1) + ' s');
  log('  drive      ' + ticks + ' ticks in ' + (a.driveMs / 1000).toFixed(1) + ' s: runs ' + a.totals.drive.runs + ', signals ' + a.totals.drive.signals + ', delivered ' + a.totals.drive.delivered + ', grown ' + a.totals.drive.grown + ', errors ' + a.totals.drive.errors + ', refused ' + a.totals.drive.refused);
  if (a.dormant) log('  memory     dormant mail ' + (a.dormant.dropped ? 'dropped' : 'kept') + ': ' + a.dormant.cells + ' periodic cells have no due tick left after their last one up to tick ' + a.dormant.lastTickBound + '; ' + a.dormant.mailDropped + ' items delivered to them were counted, then dropped');
  const c = a.cells;
  log('  cells      declared ' + c.declared + ', ran ' + c.ran + ' (' + pct(c.ran, c.declared) + '%), ran in the drive ' + c.ranDrive + ' (' + pct(c.ranDrive, c.declared) + '%), ran only in the tasks ' + c.ranOnlyInTasks + ', fired ' + c.fired + ' (' + pct(c.fired, c.declared) + '%), threw ' + c.errored);
  log('             never ran ' + c.neverRan + ': budget skipped ' + c.neverRanBudget + ', event cell no mail reached ' + c.neverRanEventNoMail + ', other ' + c.neverRanOther);
  const e = a.edges;
  log('  edges      declared ' + e.declared + ', delivered ' + e.delivered + ' (' + pct(e.delivered, e.declared) + '%), delivered in the drive ' + e.deliveredDrive + ' (' + pct(e.deliveredDrive, e.declared) + '%)');
  log('             never delivered ' + e.notDelivered + ': source never fired ' + e.srcNeverFired + ', source fired on another port ' + e.srcFiredOtherPort + ', in flight at the end ' + e.inFlightAtEnd);
  log('  kinds      present ' + a.kinds.present + ', ran ' + a.kinds.ran + ' (' + pct(a.kinds.ran, a.kinds.present) + '%), emitted ' + a.kinds.fired + (a.kinds.neverRan.length ? '; never ran: ' + a.kinds.neverRan.join(', ') : '') + (a.kinds.ranNeverFired.length ? '; ran but never emitted: ' + a.kinds.ranNeverFired.join(', ') : ''));
  const quiet = Object.entries(a.kinds.byKind).filter(([, v]) => v.ran > 0 && v.fired < v.ran).sort((x, y) => (y[1].ran - y[1].fired) - (x[1].ran - x[1].fired)).slice(0, 8);
  if (quiet.length) log('             ran without emitting, most cells first: ' + quiet.map(([x, v]) => x + ' ' + (v.ran - v.fired) + '/' + v.ran).join(', '));
  log('  regions    ' + Object.entries(a.regions).map(([n, r]) => n + ' ' + r.ran + '/' + r.cells).join(', '));
  if (a.tasks) {
    const t = a.tasks;
    log('  tasks      algebra ' + t.algebra.correct + '/' + t.algebra.n + (t.algebra.missingRoles.length ? ' (no cell for ' + t.algebra.missingRoles.join(', ') + ')' : '') + ', sequence ' + t.sequence.correct + '/' + t.sequence.n + (t.sequence.missingRoles.length ? ' (no cell for ' + t.sequence.missingRoles.join(', ') + ')' : '') + ', hosted score ' + t.score + ' (' + t.ticks + ' more ticks, ' + (t.ms / 1000).toFixed(1) + ' s)');
  }
}

function printKnockout(log, full, ko) {
  const x = ko.excluded;
  log('  knockout   ' + ko.role + ': ' + ko.file + ' (' + ko.fileLines + ' lines, chosen by ' + ko.chosenBy + '): left out ' + x.cells + ' cells, ' + x.edges + ' edges, and ' + x.orphanedEdges + ' edges that named a left out cell');
  log('             drive runs ' + full.totals.drive.runs + ' -> ' + ko.totals.drive.runs + ' (' + signed(ko.delta.driveRuns) + '), delivered ' + full.totals.drive.delivered + ' -> ' + ko.totals.drive.delivered + ' (' + signed(ko.delta.driveDelivered) + '), signals ' + signed(ko.delta.driveSignals));
  log('             cells ran ' + full.cells.ran + ' -> ' + ko.cells.ran + ' (' + signed(ko.delta.cellsRan) + '), edges delivered ' + full.edges.delivered + ' -> ' + ko.edges.delivered + ' (' + signed(ko.delta.edgesDelivered) + ')');
  log('             surviving cells ' + ko.survivors.cells + ', drive run count changed on ' + ko.survivors.driveRunsChanged + ' (silenced ' + ko.survivors.silenced + ', woken ' + ko.survivors.woken + ')');
  if (ko.tasks && full.tasks) log('             hosted score ' + full.tasks.score + ' -> ' + ko.tasks.score + ' (' + signed(ko.delta.taskScore) + '), algebra correct ' + signed(ko.delta.algebraCorrect) + ', sequence correct ' + signed(ko.delta.sequenceCorrect));
}
const signed = (v) => (v === null || v === undefined ? 'n/a' : (v > 0 ? '+' : '') + v);

// ---------------------------------------------------------------- verdict
export function statementOf(r, ticks) {
  const f = r.full, l = r.lines;
  let s = 'The census loaded ' + r.files.loaded + ' of ' + r.files.present + ' files of ' + rel(r.seed.dir) + ' (' + l.loaded + ' of ' + l.present + ' lines), drove it ' + ticks + ' ticks one tick per event loop turn with nothing injected, then ran the hosted algebra and sequence problems inside it' + (f.tasks ? ' (' + f.tasks.ticks + ' more ticks)' : '') + '. '
    + 'Of ' + f.cells.declared + ' declared cells ' + f.cells.ran + ' ran at least once (' + pct(f.cells.ran, f.cells.declared) + ' percent) and ' + f.cells.fired + ' emitted; of ' + f.edges.declared + ' declared edges ' + f.edges.delivered + ' delivered at least once (' + pct(f.edges.delivered, f.edges.declared) + ' percent); ' + f.kinds.ran + ' of ' + f.kinds.present + ' kinds ran. '
    + 'Of ' + l.declarations + ' declaration lines ' + l.liveDeclarations + ' declared something that ran or delivered, and ' + l.loadBearing + ' of ' + l.loaded + ' loaded lines are load bearing counting the ' + l.structure + ' structure lines. ';
  for (const k of r.knockouts || []) {
    s += (k.role === 'tasks' ? ' ' : '') + 'Leaving out ' + k.file + ' (' + k.fileLines + ' lines' + (k.excluded.cells ? ', ' + k.excluded.cells + ' cells and ' + k.excluded.orphanedEdges + ' edges that named them' : ', ' + k.excluded.edges + ' edges') + ') moved drive runs by ' + signed(k.delta.driveRuns) + ' and drive deliveries by ' + signed(k.delta.driveDelivered) + ', changed the drive run count of ' + k.survivors.driveRunsChanged + ' of ' + k.survivors.cells + ' surviving cells, and moved the hosted task score by ' + signed(k.delta.taskScore) + '.';
  }
  return s;
}

export function verdictOf(r, { ticks, command, isTheBar, knockoutSeed }) {
  const f = r.full;
  return {
    bench: 'census', at: new Date().toISOString(), command, node: process.version, isTheBar,
    statement: statementOf(r, ticks),
    seed: rel(r.seed.dir), ticks, knockoutSeed,
    drive: 'one brain.tick(1) per event loop turn, nothing injected (bench/speed.mjs), runtime/kernels.mjs installed; then the hosted algebra and sequence problems (tasks/host.mjs) at the generations/organism-genome.mjs counts',
    files: r.files, lines: r.lines,
    cells: f.cells, edges: f.edges, kinds: f.kinds, regions: f.regions, totals: f.totals, tasks: f.tasks,
    verified: f.verified, wiring: f.wiring,
    knockout: r.knockout, knockouts: r.knockouts,
    timing: { importMs: Math.round(r.seed.importMs), loadMs: f.loadMs, driveMs: f.driveMs },
    memoryMB: r.memoryMB,
    dormant: f.dormant, declaredTotals: f.declaredTotals,
    ...(r.full.progress ? { progress: r.full.progress } : {}),
    live: r.live,
  };
}

function verdictName(seedName, partial, tag = '', base = null) {
  const b = base || (seedName === 'gen-0' ? 'census' : 'census-' + seedName);
  return b + (tag ? '-' + tag : '') + (partial ? '-partial' : '') + '.json';
}
// the sharded census of the 5 million line seed is bench/verdicts/census-scale.json
const shardedBase = (name) => (name === 'scale-52000' ? 'census-scale' : 'census-' + name + '-sharded');

// ---------------------------------------------------------------- the sharded verdict
function printSharded(log, r) {
  const f = r.full, l = r.lines, c = f.cells, e = f.edges;
  log('  files      ' + r.files.loaded + ' read of ' + r.files.present + ' present' + (r.files.notLoaded.length ? ' (not read: ' + r.files.notLoaded.join(', ') + ')' : '') + '; every declaration tallied in exactly one shard');
  log('  lines      ' + l.loaded + ' loaded of ' + l.present + ' present; declarations ' + l.declarations + ', of which ran or delivered ' + l.liveDeclarations + ' (' + pct(l.liveDeclarations, l.declarations) + '%), dead declarations ' + l.deadDeclarations + '; structure ' + l.structure);
  log('  load bearing lines ' + l.loadBearing + ' of ' + l.loaded + ' loaded (' + pct(l.loadBearing, l.loaded) + '%)');
  log('  cells      declared ' + c.declared + ', ran ' + c.ran + ' (' + pct(c.ran, c.declared) + '%), ran in the drive ' + c.ranDrive + ', ran only in the tasks ' + c.ranOnlyInTasks + ', fired ' + c.fired + ' (' + pct(c.fired, c.declared) + '%), threw ' + c.errored);
  log('             never ran ' + c.neverRan + ': budget skipped ' + c.neverRanBudget + ', event cell no mail reached ' + c.neverRanEventNoMail + ', other ' + c.neverRanOther);
  log('  edges      declared ' + e.declared + ', delivered ' + e.delivered + ' (' + pct(e.delivered, e.declared) + '%), delivered in the drive ' + e.deliveredDrive);
  log('             never delivered ' + e.notDelivered + ': source never fired ' + e.srcNeverFired + ', source fired on another port ' + e.srcFiredOtherPort + ', in flight at the end ' + e.inFlightAtEnd);
  log('  kinds      present ' + f.kinds.present + ', ran ' + f.kinds.ran + ', emitted ' + f.kinds.fired + (f.kinds.neverRan.length ? '; never ran: ' + f.kinds.neverRan.join(', ') : '') + (f.kinds.ranNeverFired.length ? '; ran but never emitted: ' + f.kinds.ranNeverFired.join(', ') : ''));
  log('  regions    ' + Object.entries(f.regions).map(([n, x]) => n + ' ' + x.ran + '/' + x.cells).join(', '));
  const dt = f.declaredTotals;
  log('  totals     declared cells and edges: drive runs ' + dt.drive.runs + ', signals ' + dt.drive.signals + ', delivered ' + dt.drive.delivered + '; with the tasks runs ' + dt.all.runs + ', signals ' + dt.all.signals + ', delivered ' + dt.all.delivered);
  if (f.tasks) log('  tasks      algebra ' + f.tasks.algebra.correct + '/' + f.tasks.algebra.n + ', sequence ' + f.tasks.sequence.correct + '/' + f.tasks.sequence.n + ', hosted score ' + f.tasks.score + ' (' + f.tasks.ticks + ' task ticks), each answer from the shard owning the cell it was put to');
  log('  peak rss   ' + r.shards.map((s) => 'shard ' + s.shard + ' ' + s.peakRssMB + ' MB').join(', ') + ' (cap ' + r.capMB + ' MB per shard); process peak working set ' + r.processMaxRssMB + ' MB');
  log('  wall       ' + (r.wallMs / 1000).toFixed(1) + ' s (plan ' + (r.plan.parseMs / 1000).toFixed(1) + ' s, shards ' + r.shards.map((s) => (s.wallMs / 1000).toFixed(1) + ' s').join(', ') + ')');
  log('  exact      ' + (r.exact ? 'yes: every shard loaded the backward cone of its cells over all ' + (r.L + 1) + ' ticks and grew no edge' : 'NO: ' + (r.mode !== 'exact' ? 'mode ' + r.mode + ', owned cells miss the mail of cells outside their shard' : 'a shard grew ' + r.shards.map((s) => s.grown).join('/') + ' edges by co-activation, which depends on the whole brain')));
}

export function shardedStatement(r, ticks) {
  const f = r.full, l = r.lines;
  return 'The census read all ' + r.files.loaded + ' files of ' + rel(r.seed.dir) + ' (' + l.loaded + ' lines) as text and ran it in ' + r.shards.length + ' shards of ' + r.shardFiles + ' cells files, one at a time, ' + (r.mode === 'exact' ? 'each shard loading its cells and their backward cone over the ' + (r.L + 1) + ' tick horizon' : 'each shard loading only its own cells (mode cut: an owned cell misses the mail of every cell outside its shard, so this is an approximation and never the bar)') + ', under a cap of ' + r.capMB + ' MB resident per shard; peak rss per shard ' + r.shards.map((s) => s.peakRssMB + ' MB').join(', ') + ', wall ' + (r.wallMs / 1000).toFixed(1) + ' s. It drove the organism ' + ticks + ' ticks with nothing injected' + (f.tasks ? ', then ran the hosted algebra and sequence problems (' + f.tasks.ticks + ' more ticks; algebra ' + f.tasks.algebra.correct + ' of ' + f.tasks.algebra.n + ', sequence ' + f.tasks.sequence.correct + ' of ' + f.tasks.sequence.n + ')' : '') + '. '
    + 'Of ' + f.cells.declared + ' declared cells ' + f.cells.ran + ' ran (' + pct(f.cells.ran, f.cells.declared) + ' percent) and ' + f.cells.fired + ' emitted; of ' + f.edges.declared + ' declared edges ' + f.edges.delivered + ' delivered (' + pct(f.edges.delivered, f.edges.declared) + ' percent). '
    + 'Of ' + l.declarations + ' declaration lines ' + l.liveDeclarations + ' declared something that ran or delivered and ' + l.deadDeclarations + ' are dead; ' + l.loadBearing + ' of ' + l.loaded + ' lines are load bearing (' + pct(l.loadBearing, l.loaded) + ' percent). '
    + (r.exact ? 'Every shard was exact: the tallies are the whole organism.' : 'Not exact: ' + (r.mode !== 'exact' ? 'cut shards.' : 'a shard grew edges.'));
}

export function shardedVerdictOf(r, { ticks, command, isTheBar }) {
  const f = r.full;
  return {
    bench: 'census', mode: 'sharded ' + r.mode, at: new Date().toISOString(), command, node: process.version, isTheBar,
    statement: shardedStatement(r, ticks),
    seed: rel(r.seed.dir), ticks, shardFiles: r.shardFiles, exact: r.exact,
    horizon: { driveTicks: ticks, taskTicks: r.taskTicks, lastTick: r.L },
    drive: 'one brain.tick(1) per event loop turn per shard, nothing injected, runtime/kernels.mjs installed; then the hosted algebra and sequence problems into the cells the whole organism picks (tasks/host.mjs nameCells), on every shard, with the whole schedule',
    files: r.files, lines: r.lines,
    cells: f.cells, edges: f.edges, kinds: f.kinds, regions: f.regions, declaredTotals: f.declaredTotals, tasks: f.tasks,
    shards: r.shards,
    memoryMB: { capPerShard: r.capMB, peakRssPerShard: r.shards.map((s) => s.peakRssMB), processPeakWorkingSet: r.processMaxRssMB },
    wallMs: r.wallMs, ratio: r.ratio, plan: r.plan,
    live: r.live,
  };
}

// ---------------------------------------------------------------- a pruned seed against its source
/** When the seed was written by genome/emit.mjs --prune, the census it was pruned by. */
export function pruneSource(seed) {
  const p = seed.manifest && seed.manifest.genome && seed.manifest.genome.pruned;
  if (!p || !p.census || !p.census.file) return null;
  const abs = path.resolve(BRAIN_ROOT, p.census.file);
  if (!existsSync(abs)) return { pruned: p, file: p.census.file, missing: true };
  return { pruned: p, file: p.census.file, verdict: JSON.parse(readFileSync(abs, 'utf8')) };
}

/** Before (the source census) and after (this census of the pruned seed), and the checks the bar names. */
export function pruneComparison(src, r, ticks) {
  const b = src.verdict, a = r;
  const side = (lines, tasks, totals, cells, edges) => ({
    lines: lines.loaded, loadBearing: lines.loadBearing, fractionLoadBearing: lines.fractionLoadBearing, deadDeclarations: lines.deadDeclarations,
    algebra: tasks ? { correct: tasks.algebra.correct, n: tasks.algebra.n } : null,
    sequence: tasks ? { correct: tasks.sequence.correct, n: tasks.sequence.n } : null,
    score: tasks ? tasks.score : null,
    drive: { runs: totals.drive.runs, signals: totals.drive.signals, delivered: totals.drive.delivered },
    cellsRan: cells.ran, cellsDeclared: cells.declared, edgesDelivered: edges.delivered, edgesDeclared: edges.declared,
  });
  const before = { file: src.file, at: b.at, ticks: b.ticks, ...side(b.lines, b.tasks, b.totals, b.cells, b.edges) };
  const after = { ticks, ...side(a.lines, a.full.tasks, a.full.totals, a.full.cells, a.full.edges) };
  const checks = {
    sameTicks: before.ticks === after.ticks,
    fewerLines: after.lines < before.lines,
    loadBearingShareRose: after.fractionLoadBearing > before.fractionLoadBearing,
    algebraDidNotFall: !!(before.algebra && after.algebra) && after.algebra.correct >= before.algebra.correct,
    sequenceDidNotFall: !!(before.sequence && after.sequence) && after.sequence.correct >= before.sequence.correct,
    sameDriveWork: before.drive.runs === after.drive.runs && before.drive.signals === after.drive.signals && before.drive.delivered === after.drive.delivered,
  };
  const met = checks.sameTicks && checks.fewerLines && checks.loadBearingShareRose && checks.algebraDidNotFall && checks.sequenceDidNotFall;
  return { before, after, checks, met, pruned: src.pruned };
}

function printPrune(log, cmp) {
  const b = cmp.before, a = cmp.after;
  log('  prune      before: ' + b.file + ' (' + b.at + ', ' + b.ticks + ' ticks); after: this census (' + a.ticks + ' ticks)');
  log('  lines      ' + b.lines + ' -> ' + a.lines + ' (' + signed(a.lines - b.lines) + ')');
  log('  load bearing share ' + b.fractionLoadBearing + ' -> ' + a.fractionLoadBearing + ' (' + (cmp.checks.loadBearingShareRose ? 'rose' : 'DID NOT RISE') + '); dead declarations ' + b.deadDeclarations + ' -> ' + a.deadDeclarations);
  log('  algebra    ' + b.algebra.correct + '/' + b.algebra.n + ' -> ' + a.algebra.correct + '/' + a.algebra.n + ' (' + (cmp.checks.algebraDidNotFall ? 'did not fall' : 'FELL') + '); sequence ' + b.sequence.correct + '/' + b.sequence.n + ' -> ' + a.sequence.correct + '/' + a.sequence.n + ' (' + (cmp.checks.sequenceDidNotFall ? 'did not fall' : 'FELL') + '); hosted score ' + b.score + ' -> ' + a.score);
  log('  drive      runs ' + b.drive.runs + ' -> ' + a.drive.runs + ', signals ' + b.drive.signals + ' -> ' + a.drive.signals + ', delivered ' + b.drive.delivered + ' -> ' + a.drive.delivered + ' (' + (cmp.checks.sameDriveWork ? 'the same work: removing the dead declarations moved nothing the drive measures' : 'NOT the same work') + ')');
  log('  bar        ' + (cmp.met ? 'MET' : 'MISSED') + ': ' + Object.entries(cmp.checks).map(([k, v]) => k + ' ' + v).join(', '));
}

// ---------------------------------------------------------------- the static census (never loads the seed)
// An exact shard of organism/scale-52000 must load a 43 GB backward cone, so the census that
// walks all 5 million lines cannot run the organism. It reads it instead: every emitted file
// line by line through a fixed buffer (genome/emit.mjs eachLine), one Map from cell id to index
// and a few typed arrays per cell in memory, and the edges written once to a binary file of
// (source, destination, delay) triples in the OS temp dir, 12 bytes an edge. The closure then
// runs in passes over that file until a pass changes nothing:
//
//   THE STATIC RULE. A periodic cell runs at tick 0 whatever its input (core/clock.mjs:
//   t % period === 0); an event cell runs only when mail reaches it. So a cell can run only if
//   a path of edges leads to it from a periodic cell (or from a cell the hosted problems inject
//   into, tasks/host.mjs), and an edge can deliver only if its source can run. A declaration is
//   live by the static rule when it is such a cell, such an edge, or a region or circuit that
//   holds such a cell. Everything else is dead code no drive and no hosted problem can reach.
//
// The static rule is an UPPER BOUND on what runs: reachable is not ran, and a reachable cell
// may never fire. The sampled census (below) measures the gap. The same passes compute the
// earliest tick a cell could run, 1 + delay per edge from the periodic cells at tick 0, which
// bounds what any run of H ticks can reach.
//
// The walk also recomputes the seed's content hash (genome/wire.mjs contentHash) from the lines
// (genome/emit.mjs cellHashRow, edgeHashRow) and checks every edge's ports (edgeFault): when
// the hash equals the manifest's, the lines walked are exactly the organism the loader builds.

const STATIC_CHUNK = 1 << 18; // triples per read or write: 3 MB
const INF32 = 0x7fffffff;

/** Every Int32 triple of a file, in order, through one fixed buffer. */
function eachTriple(file, n, fn) {
  const ab = new ArrayBuffer(STATIC_CHUNK * 12);
  const b = Buffer.from(ab), v = new Int32Array(ab);
  const fd = openSync(file, 'r');
  try {
    let e = 0;
    while (e < n) {
      const k = Math.min(STATIC_CHUNK, n - e);
      const got = readSync(fd, b, 0, k * 12, e * 12);
      if (got !== k * 12) throw new Error('census: short read of the edge file at edge ' + e);
      for (let q = 0; q < k; q++) fn(v[3 * q], v[3 * q + 1], v[3 * q + 2], e + q);
      e += k;
    }
  } finally { closeSync(fd); }
}

/**
 * The static census of an emitted seed: never imports it, never builds a Brain.
 * @param {string} dir the seed directory
 * @param {object} [o] { tasks: count the hosted problems' cells as sources (default true),
 *   horizon: report the cells that could run within this many ticks (default 16),
 *   scratchDir: where the edge file goes (default the OS temp dir), log }
 */
export function staticCensus(dir, { tasks = true, taskSeed = 'census', horizon = 16, scratchDir = null, log = () => {} } = {}) {
  const w0 = now();
  const abs = path.resolve(BRAIN_ROOT, dir);
  const manifest = readManifest(abs);
  const { cells: cellFiles, edges: edgeFiles } = seedFiles(abs);
  const nC = manifest.counts.cells, nE = manifest.counts.edges;
  let peakMB = 0;
  const rss = () => { const r = mb(process.memoryUsage.rss()); if (r > peakMB) peakMB = r; return r; };
  rss();
  const lines = {};
  const h = createHash('sha256');
  h.update('brain.genome.v1\n');
  h.update('cells ' + nC + '\n');
  // regions.mjs: the r() and k() lines
  const rNames = [], kKeys = [];
  lines['regions.mjs'] = eachLine(path.join(abs, 'regions.mjs'), (l) => {
    if (l.startsWith('r(')) rNames.push(declArgs(l, 'r(')[0]);
    else if (l.startsWith('k(')) { const a = declArgs(l, 'k('); kKeys.push(a[0] + '/' + a[1]); }
  });
  // cells: id to index, kind, region, circuit, periodic, and the hash rows
  const idOf = new Map();
  const kinds = [], kindId = new Map(), kindPorts = [];
  const regions = [], regionId = new Map(), circuits = [], circuitId = new Map();
  const intern = (map, list, key) => { let v = map.get(key); if (v === undefined) { v = list.length; list.push(key); map.set(key, v); } return v; };
  const kindOf = new Uint16Array(nC), regionOf = new Uint16Array(nC), circuitOf = new Int32Array(nC);
  const periodic = new Uint8Array(nC);
  const roleKinds = new Set([...ALGEBRA_ROLES, ...SEQUENCE_ROLES].map((r) => r.kind));
  const roleCells = [];
  const cellsPerFile = [];
  let g = 0;
  const t1 = now();
  for (const f of cellFiles) {
    const before = g;
    lines[f] = eachLine(path.join(abs, f), (l) => {
      if (!l.startsWith('c(')) return;
      const a = declArgs(l, 'c(');
      const [id, kind, region, circuit, params, policy] = a;
      if (g >= nC) throw new Error('census: ' + f + ' declares more cells than the manifest counts (' + nC + ')');
      if (idOf.has(id)) throw new Error('census: ' + f + ' declares cell ' + id + ' a second time');
      idOf.set(id, g);
      let ki = kindId.get(kind);
      if (ki === undefined) { const K = getKind(kind); ki = kinds.length; kinds.push(K.name); kindPorts.push(K.ports); kindId.set(kind, ki); }
      kindOf[g] = ki;
      regionOf[g] = intern(regionId, regions, region || 'default');
      circuitOf[g] = intern(circuitId, circuits, (region || 'default') + '/' + (circuit || 'default'));
      const p = policy && policy.period !== undefined ? policy.period : DEFAULT_POLICY.period;
      periodic[g] = p === 'event' ? 0 : 1;
      h.update(cellHashRow(...a));
      if (tasks && roleKinds.has(kind)) roleCells.push({ id, kind, params: { ...(getKind(kind).defaults || {}), ...(params || {}) }, policy: { period: p } });
      g++;
      if ((g & 65535) === 0) rss();
    });
    cellsPerFile.push(g - before);
  }
  if (g !== nC) throw new Error('census: ' + rel(abs) + ' declares ' + g + ' cells, its manifest counts ' + nC);
  rss();
  const cellsMs = now() - t1;
  // edges: hash rows, port legality, in-degree, and the triple file
  h.update('edges ' + nE + '\n');
  const tmp = mkdtempSync(path.join(scratchDir || tmpdir(), 'census-static-'));
  const triFile = path.join(tmp, 'edges.i32');
  try {
    const inDeg = new Int32Array(nC);
    const edgesPerFile = [];
    let ge = 0, faults = 0;
    const faultSamples = [];
    const t2 = now();
    {
      const ab = new ArrayBuffer(STATIC_CHUNK * 12);
      const wb = Buffer.from(ab), wv = new Int32Array(ab);
      const fd = openSync(triFile, 'w');
      let nb = 0;
      const flush = () => { if (nb) { writeSync(fd, wb, 0, nb * 12); nb = 0; } };
      const U16 = new Uint16Array(1);
      try {
        for (const f of edgeFiles) {
          const before = ge;
          lines[f] = eachLine(path.join(abs, f), (l) => {
            if (!l.startsWith('e(')) return;
            const x = declArgs(l, 'e(');
            const s = idOf.get(x[0]), d = idOf.get(x[1]);
            if (s === undefined || d === undefined) throw new Error('census: ' + f + ': an edge names an undeclared cell (' + x[0] + ' -> ' + x[1] + ')');
            if (ge >= nE) throw new Error('census: ' + rel(abs) + ' declares more edges than its manifest counts (' + nE + ')');
            const fault = edgeFault({ id: x[0], ports: kindPorts[kindOf[s]] }, { id: x[1], ports: kindPorts[kindOf[d]] }, x[2], x[3]);
            if (fault) { faults++; if (faultSamples.length < 5) faultSamples.push({ edge: ge, file: f, fault }); }
            h.update(edgeHashRow(...x));
            U16[0] = x[5];
            wv[3 * nb] = s; wv[3 * nb + 1] = d; wv[3 * nb + 2] = U16[0]; nb++;
            if (nb === STATIC_CHUNK) flush();
            inDeg[d]++;
            ge++;
            if ((ge & 262143) === 0) rss();
          });
          edgesPerFile.push(ge - before);
        }
        flush();
      } finally { closeSync(fd); }
    }
    if (ge !== nE) throw new Error('census: ' + rel(abs) + ' declares ' + ge + ' edges, its manifest counts ' + nE);
    const edgesMs = now() - t2;
    const hash = h.digest('hex');
    rss();
    // the other files: counted, never parsed
    const present = readdirSync(abs).filter((f) => statSync(path.join(abs, f)).isFile()).sort();
    for (const f of present) if (lines[f] === undefined) lines[f] = eachLine(path.join(abs, f), () => {});
    // the hosted problems' cells (tasks/host.mjs nameCells on the same cells in the same order)
    let hosted = [], picks = null;
    if (tasks) {
      const pseudo = { cells: roleCells };
      const an = nameCells(pseudo, ALGEBRA_ROLES), sn = nameCells(pseudo, SEQUENCE_ROLES);
      hosted = [...new Set([...Object.values(an.cells), ...Object.values(sn.cells)])].filter(Boolean);
      picks = { algebra: an.cells, sequence: sn.cells, missing: { algebra: an.missing, sequence: sn.missing } };
    }
    // the closure, in passes over the triple file until a pass changes nothing
    const reach = new Uint8Array(nC), fT = new Int32Array(nC).fill(INF32);
    let nPeriodic = 0;
    for (let i = 0; i < nC; i++) if (periodic[i]) { reach[i] = 1; fT[i] = 0; nPeriodic++; }
    let hostedOnly = 0;
    for (const id of hosted) { const i = idOf.get(id); if (!reach[i]) hostedOnly++; reach[i] = 1; }
    const t3 = now();
    const passes = [];
    for (;;) {
      let marked = 0, lowered = 0;
      eachTriple(triFile, nE, (s, d, dl) => {
        if (reach[s] && !reach[d]) { reach[d] = 1; marked++; }
        const fs0 = fT[s];
        if (fs0 !== INF32) { const nd = fs0 + 1 + dl; if (nd < fT[d]) { fT[d] = nd; lowered++; } }
      });
      passes.push({ marked, lowered });
      rss();
      if (!marked && !lowered) break;
      if (passes.length > nC + 1) throw new Error('census: the closure did not settle in ' + passes.length + ' passes');
    }
    const closureMs = now() - t3;
    // the verdict of the rule, per cell and per edge
    let reachable = 0, deadZeroIn = 0, deadFedByDead = 0, withinH = 0, timedReach = 0;
    const deadByKind = new Map();
    const hist = new Map();
    for (let i = 0; i < nC; i++) {
      if (fT[i] !== INF32) { timedReach++; hist.set(fT[i], (hist.get(fT[i]) || 0) + 1); if (fT[i] <= horizon - 1) withinH++; }
      if (reach[i]) { reachable++; continue; }
      if (inDeg[i] === 0) deadZeroIn++; else deadFedByDead++;
      const k = kinds[kindOf[i]];
      deadByKind.set(k, (deadByKind.get(k) || 0) + 1);
    }
    const eBits = new Uint8Array((nE + 7) >> 3);
    let liveEdges = 0, deadIntoLive = 0, closureBroken = 0;
    const liveEdgesPerFile = new Array(edgeFiles.length).fill(0);
    { let fi = 0, end = edgesPerFile[0] || 0;
      eachTriple(triFile, nE, (s, d, dl, e) => {
        while (e >= end && fi < edgeFiles.length - 1) { fi++; end += edgesPerFile[fi]; }
        if (reach[s]) { eBits[e >> 3] |= 1 << (e & 7); liveEdges++; liveEdgesPerFile[fi]++; if (!reach[d]) closureBroken++; }
        else if (reach[d]) deadIntoLive++;
      }); }
    if (closureBroken) throw new Error('census: ' + closureBroken + ' live edges lead into a cell the closure left dead');
    const liveCellsPerFile = []; { let lo = 0; for (const n of cellsPerFile) { let v = 0; for (let i = lo; i < lo + n; i++) v += reach[i]; liveCellsPerFile.push(v); lo += n; } }
    const liveRegionNames = new Set(), liveCircuitKeys = new Set();
    for (let i = 0; i < nC; i++) if (reach[i]) { liveRegionNames.add(regions[regionOf[i]]); liveCircuitKeys.add(circuits[circuitOf[i]]); }
    const regionsLive = rNames.filter((n) => liveRegionNames.has(n)).length;
    const circuitsLive = kKeys.filter((k) => liveCircuitKeys.has(k)).length;
    const seed = { dir: abs, name: path.basename(abs), manifest, files: { present, cells: cellFiles, edges: edgeFiles, lines }, declared: { regions: rNames.length, circuits: kKeys.length, cellsPerFile, edgesPerFile } };
    const arm = { regionsLive, circuitsLive, raw: { cellLive: (i) => reach[i] === 1, edgeLive: (e) => ((eBits[e >> 3] >> (e & 7)) & 1) === 1 } };
    const lc = lineCensus(seed, arm);
    const indexed = ['index.mjs', 'regions.mjs', 'manifest.json', ...cellFiles, ...edgeFiles];
    const notWalked = present.filter((f) => !indexed.includes(f));
    const manifestFileLines = lines['manifest.json'];
    const manifestCount = { lines: manifest.counts.lines, loadBearing: lc.loadBearing - manifestFileLines, fraction: frac(lc.loadBearing - manifestFileLines, manifest.counts.lines), agrees: manifest.counts.lines === lc.loaded - manifestFileLines };
    const liveCells = liveBits(nC, (i) => reach[i] === 1);
    const liveEdgeBits = { n: nE, count: liveEdges, encoding: liveCells.encoding, b64: Buffer.from(eBits).toString('base64') };
    const histRows = [...hist.entries()].sort((a, b) => a[0] - b[0]);
    rss();
    const out = {
      mode: 'static', seed, lines: lc, manifestCount,
      files: { present: present.length, walked: indexed.filter((f) => present.includes(f)).length, notWalked, cellFiles: cellFiles.length, edgeFiles: edgeFiles.length },
      whole: notWalked.length === 0 && g === nC && ge === nE,
      hash: { streamed: hash, manifest: manifest.hash, match: hash === manifest.hash },
      legality: { illegalEdges: faults, samples: faultSamples },
      sources: { periodic: nPeriodic, hosted: hosted.length, hostedNotPeriodic: hostedOnly, tasks, picks },
      closure: { passes: passes.length, perPass: passes, edgeFileBytes: nE * 12, edgeFile: 'OS temp dir, removed when the census ends' },
      cells: {
        declared: nC, reachable, dead: nC - reachable, deadZeroInDegree: deadZeroIn, deadFedOnlyByDeadCells: deadFedByDead,
        deadByKind: Object.fromEntries([...deadByKind.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))),
        periodic: nPeriodic, event: nC - nPeriodic,
      },
      edges: { declared: nE, live: liveEdges, dead: nE - liveEdges, deadIntoReachableCell: deadIntoLive, deadIntoDeadCell: nE - liveEdges - deadIntoLive },
      regions: { declared: rNames.length, live: regionsLive }, circuits: { declared: kKeys.length, live: circuitsLive },
      timing: { horizon, withinHorizon: withinH, reachableFromPeriodic: timedReach, earliestTick: Object.fromEntries(histRows.map(([k, n]) => [k, n])), maxEarliestTick: histRows.length ? histRows[histRows.length - 1][0] : null },
      perFile: lc.perFile.map((r, i) => ({ ...r, dead: r.declarations - r.live })),
      kinds: kinds.length,
      live: { manifestHash: manifest.hash, phases: 'the static rule: reachable from a periodic cell' + (tasks ? ' or a hosted problem cell' : '') + ' through the edge lists; nothing was run', cells: liveCells, edges: liveEdgeBits },
      hosted,
      memoryMB: { peakRssSampled: peakMB, processPeakWorkingSet: mb(process.resourceUsage().maxRSS * 1024) },
      ms: { cells: Math.round(cellsMs), edges: Math.round(edgesMs), closure: Math.round(closureMs), wall: Math.round(now() - w0) },
    };
    return out;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

function printStatic(log, r) {
  const l = r.lines, c = r.cells, e = r.edges, s = r.sources;
  log('static census of ' + rel(r.seed.dir) + ': ' + r.files.walked + ' of ' + r.files.present + ' files walked line by line, never loaded' + (r.files.notWalked.length ? ' (not walked: ' + r.files.notWalked.join(', ') + ')' : ''));
  log('  hash       streamed ' + r.hash.streamed.slice(0, 16) + ', manifest ' + String(r.hash.manifest).slice(0, 16) + ': ' + (r.hash.match ? 'MATCH, the lines walked are the organism the loader builds' : 'MISMATCH'));
  log('  legality   ' + r.legality.illegalEdges + ' illegal edges of ' + e.declared + ' (genome/wire.mjs edgeFault on every e() line)');
  log('  sources    ' + s.periodic + ' periodic cells (due at tick 0 whatever their input)' + (s.tasks ? ' + ' + s.hostedNotPeriodic + ' hosted problem cells not already periodic (' + s.hosted + ' picked)' : ''));
  log('  closure    ' + r.closure.passes + ' passes over a ' + r.closure.edgeFileBytes + ' byte edge file (Int32 source, destination, delay per edge); cells marked per pass ' + r.closure.perPass.map((p) => p.marked).join(', '));
  log('  cells      declared ' + c.declared + ', reachable ' + c.reachable + ' (' + pct(c.reachable, c.declared) + '%), dead ' + c.dead + ': no edge in ' + c.deadZeroInDegree + ', fed only by dead cells ' + c.deadFedOnlyByDeadCells);
  log('             dead by kind: ' + Object.entries(c.deadByKind).slice(0, 12).map(([k, n]) => k + ' ' + n).join(', ') + (Object.keys(c.deadByKind).length > 12 ? ', ...' : ''));
  log('  edges      declared ' + e.declared + ', both ends reachable ' + e.live + ' (' + pct(e.live, e.declared) + '%), dead ' + e.dead + ' (their source is dead; ' + e.deadIntoReachableCell + ' of them lead into a reachable cell)');
  log('  regions    ' + r.regions.live + ' of ' + r.regions.declared + ' hold a reachable cell; circuits ' + r.circuits.live + ' of ' + r.circuits.declared);
  const tk = r.timing;
  log('  timing     earliest tick a cell could run (1 + delay per edge from the periodic cells at tick 0): within ' + tk.horizon + ' ticks ' + tk.withinHorizon + ' (' + pct(tk.withinHorizon, c.declared) + '%), ever ' + tk.reachableFromPeriodic + ', latest ' + tk.maxEarliestTick);
  for (const f of r.perFile) log('  file       ' + f.file.padEnd(14) + ' lines ' + String(f.lines).padStart(6) + ', declarations ' + String(f.declarations).padStart(6) + ', live ' + String(f.live).padStart(6) + ', dead ' + String(f.dead).padStart(6));
  log('  lines      present ' + l.present + ', walked ' + l.loaded + '; declarations ' + l.declarations + ' = ' + r.regions.declared + ' regions + ' + r.circuits.declared + ' circuits + ' + c.declared + ' cells + ' + e.declared + ' edges; structure ' + l.structure + ' = ' + l.loaded + ' - ' + l.declarations);
  log('  live       ' + l.liveDeclarations + ' = ' + r.regions.live + ' regions + ' + r.circuits.live + ' circuits + ' + c.reachable + ' cells + ' + e.live + ' edges; dead declarations ' + l.deadDeclarations);
  log('  load bearing (static rule) = live ' + l.liveDeclarations + ' + structure ' + l.structure + ' = ' + l.loadBearing + ' of ' + l.loaded + ' lines = ' + pct(l.loadBearing, l.loaded) + '%');
  log('             over the manifest count (every file but manifest.json, the gate way): ' + r.manifestCount.loadBearing + ' of ' + r.manifestCount.lines + ' = ' + pct(r.manifestCount.loadBearing, r.manifestCount.lines) + '%');
  log('  memory     peak rss ' + r.memoryMB.peakRssSampled + ' MB sampled, process peak working set ' + r.memoryMB.processPeakWorkingSet + ' MB');
  log('  time       ' + (r.ms.wall / 1000).toFixed(1) + ' s (cells ' + (r.ms.cells / 1000).toFixed(1) + ' s, edges ' + (r.ms.edges / 1000).toFixed(1) + ' s, closure ' + (r.ms.closure / 1000).toFixed(1) + ' s)');
}

export function staticStatement(r) {
  const l = r.lines, c = r.cells, e = r.edges;
  return 'The static census walked all ' + r.files.walked + ' files of ' + rel(r.seed.dir) + ' (' + l.loaded + ' physical lines, ' + r.manifestCount.lines + ' by the manifest count) line by line without loading the organism, in ' + (r.ms.wall / 1000).toFixed(1) + ' s at a peak working set of ' + r.memoryMB.processPeakWorkingSet + ' MB; its streamed content hash ' + (r.hash.match ? 'equals' : 'DIFFERS FROM') + ' the manifest hash and ' + r.legality.illegalEdges + ' edges are illegal. '
    + 'By the static rule (a cell is live when a path of edges reaches it from one of the ' + r.sources.periodic + ' periodic cells' + (r.sources.tasks ? ' or ' + r.sources.hosted + ' hosted problem cells' : '') + ', an edge when its source is live, a region or circuit when it holds a live cell; ' + r.closure.passes + ' closure passes) ' + c.reachable + ' of ' + c.declared + ' cells (' + pct(c.reachable, c.declared) + ' percent) and ' + e.live + ' of ' + e.declared + ' edges (' + pct(e.live, e.declared) + ' percent) are live; ' + c.dead + ' cells are dead (' + c.deadZeroInDegree + ' with no edge in, ' + c.deadFedOnlyByDeadCells + ' fed only by dead cells). '
    + 'Load bearing = ' + l.liveDeclarations + ' live declarations + ' + l.structure + ' structure lines = ' + l.loadBearing + ' of ' + l.loaded + ' lines (' + pct(l.loadBearing, l.loaded) + ' percent; ' + r.manifestCount.loadBearing + ' of ' + r.manifestCount.lines + ' by the manifest count), with ' + l.deadDeclarations + ' dead declarations. '
    + 'The static rule is an upper bound: reachable is not ran, and at a ' + r.timing.horizon + ' tick horizon only ' + r.timing.withinHorizon + ' cells could run at all.';
}

export function staticVerdictOf(r, { command, isTheBar }) {
  return {
    bench: 'census', mode: 'static', at: new Date().toISOString(), command, node: process.version, isTheBar,
    statement: staticStatement(r),
    seed: rel(r.seed.dir),
    rule: 'a cell is live when a path of edges reaches it from a periodic cell (due at tick 0 whatever its input)' + (r.sources.tasks ? ' or from a cell the hosted algebra and sequence problems inject into' : '') + '; an edge is live when its source is live (then both ends are); a region or circuit is live when it holds a live cell. Nothing is run: this is an upper bound on what runs.',
    whole: r.whole, files: r.files, hash: r.hash, legality: r.legality,
    lines: { ...r.lines, perFile: undefined }, manifestCount: r.manifestCount,
    arithmetic: {
      declarations: r.lines.declarations + ' = ' + r.regions.declared + ' regions + ' + r.circuits.declared + ' circuits + ' + r.cells.declared + ' cells + ' + r.edges.declared + ' edges',
      live: r.lines.liveDeclarations + ' = ' + r.regions.live + ' + ' + r.circuits.live + ' + ' + r.cells.reachable + ' + ' + r.edges.live,
      structure: r.lines.structure + ' = ' + r.lines.loaded + ' walked lines - ' + r.lines.declarations + ' declarations',
      loadBearing: r.lines.loadBearing + ' = ' + r.lines.liveDeclarations + ' + ' + r.lines.structure + '; share ' + r.lines.loadBearing + ' / ' + r.lines.loaded + ' = ' + r.lines.fractionLoadBearing,
      manifestCount: r.manifestCount.loadBearing + ' = ' + r.lines.loadBearing + ' - ' + r.seed.files.lines['manifest.json'] + ' manifest.json lines; share ' + r.manifestCount.loadBearing + ' / ' + r.manifestCount.lines + ' = ' + r.manifestCount.fraction,
    },
    sources: r.sources, closure: r.closure,
    cells: r.cells, edges: r.edges, regions: r.regions, circuits: r.circuits, timing: r.timing,
    perFile: r.perFile,
    memoryMB: r.memoryMB, ms: r.ms,
    live: r.live, hosted: r.hosted,
  };
}

// ---------------------------------------------------------------- the sampled census
// The static rule says what COULD run. The sampled census measures what DOES, exactly, on a
// seeded 2 percent of the cells: each sampled cell is run with its backward cone at a short
// horizon (runShard, the sharded census's exact shard, tasks off), so it does exactly what it
// does in the whole organism over those ticks. The cone is cut further without losing
// exactness: a cell u enters the cone of c only when f(u) + b(u) <= L, where f(u) is the
// earliest tick u could run (from the periodic cells at tick 0, 1 + delay per edge) and b(u)
// its travel time to c. A cell outside that set cannot run early enough for anything it sends
// to reach c by tick L; every cell on a shortest path from a kept cell also satisfies the
// inequality (f grows by at most the edge it crosses while b shrinks by exactly it), so the
// kept set is closed. The sampled cells are run in batches whose cones' union stays under a
// size, each batch freed before the next.

function seededUniform(seed) {
  const b = createHash('sha256').update(String(seed)).digest();
  let a = b.readUInt32LE(0), c = b.readUInt32LE(4), d = b.readUInt32LE(8), e = b.readUInt32LE(12);
  return () => {
    // sfc32
    const t = (((a + c) | 0) + e) | 0;
    e = (e + 1) | 0;
    a = c ^ (c >>> 9);
    c = (d + (d << 3)) | 0;
    d = (d << 21) | (d >>> 11);
    d = (d + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

/** k of n indices drawn without replacement by a seeded partial Fisher-Yates, ascending. */
export function drawSample(n, k, seed) {
  if (!(k >= 0 && k <= n)) throw new Error('census: cannot draw ' + k + ' of ' + n);
  const rnd = seededUniform(seed);
  const idx = new Int32Array(n);
  for (let i = 0; i < n; i++) idx[i] = i;
  for (let i = 0; i < k; i++) { const j = i + Math.floor(rnd() * (n - i)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
  return Int32Array.from(idx.subarray(0, k)).sort();
}

const Z95 = 1.959963984540054;
/** The Wilson score interval for x successes of n, 95 percent by default. */
export function wilson(x, n, z = Z95) {
  if (!n) return { x, n, p: null, lo: null, hi: null };
  const p = x / n, z2 = z * z, den = 1 + z2 / n;
  const mid = (p + z2 / (2 * n)) / den;
  const hw = (z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n))) / den;
  return { x, n, p, lo: Math.max(0, mid - hw), hi: Math.min(1, mid + hw) };
}

/** A ratio over clusters (a sampled cell and its out-edges) with its linearised 95 percent interval. */
export function clusterRatio(ys, ms, z = Z95) {
  const n = ys.length;
  let Y = 0, M = 0;
  for (let i = 0; i < n; i++) { Y += ys[i]; M += ms[i]; }
  if (!M || n < 2) return { y: Y, m: M, clusters: n, r: M ? Y / M : null, lo: null, hi: null };
  const r = Y / M;
  let s2 = 0;
  for (let i = 0; i < n; i++) { const d = ys[i] - r * ms[i]; s2 += d * d; }
  s2 /= n - 1;
  const se = Math.sqrt(s2 / n) / (M / n);
  return { y: Y, m: M, clusters: n, r, se, lo: Math.max(0, r - z * se), hi: Math.min(1, r + z * se) };
}

/**
 * Run a seeded sample of cells exactly, each on its (reduced) backward cone at a short horizon.
 * @param {string} dir
 * @param {object} [o] { fraction (0.02), sampleSeed ('census'), horizon in ticks (16),
 *   batchCells: the most cells one batch loads (80000), capMB per batch (5000), reduce (true),
 *   maxBatches: stop after this many (a timing run, never the whole sample), kernels, log }
 */
export async function sampledCensus(dir, { fraction = 0.02, sampleSeed = 'census', horizon = 16, batchCells = 80000, capMB = 5000, reduce = true, maxBatches = Infinity, kernels = true, log = () => {} } = {}) {
  if (kernels) installKernels();
  const w0 = now();
  const st = seedText(dir);
  const plan = planSeed(st);
  const { nC, nE, src, dst, delay, period } = plan;
  const L = horizon - 1;
  // forward and backward adjacency
  const csr = (key) => {
    const start = new Int32Array(nC + 1);
    for (let e = 0; e < nE; e++) start[key[e] + 1]++;
    for (let i = 0; i < nC; i++) start[i + 1] += start[i];
    const fill = start.slice(0, nC), list = new Int32Array(nE);
    for (let e = 0; e < nE; e++) list[fill[key[e]]++] = e;
    return { start, list };
  };
  const fw = csr(src), bw = csr(dst);
  // f: the earliest tick each cell could run, from the periodic cells at tick 0
  const f = new Int32Array(nC).fill(INF32);
  { const B = [[]];
    for (let i = 0; i < nC; i++) if (period[i] !== -1) { f[i] = 0; B[0].push(i); }
    for (let d = 0; d < B.length; d++) {
      const bucket = B[d]; if (!bucket) continue;
      for (const v of bucket) {
        if (f[v] !== d) continue;
        for (let q = fw.start[v]; q < fw.start[v + 1]; q++) {
          const e = fw.list[q], u = dst[e], nd = d + 1 + delay[e];
          if (nd < f[u]) { f[u] = nd; (B[nd] || (B[nd] = [])).push(u); }
        }
      }
      B[d] = null;
    } }
  // the static rule on this plan (tasks off: the periodic cells are the only sources)
  const staticCells = { reachable: 0, withinHorizon: 0 };
  for (let i = 0; i < nC; i++) { if (f[i] !== INF32) staticCells.reachable++; if (f[i] <= L) staticCells.withinHorizon++; }
  let staticEdges = 0; for (let e = 0; e < nE; e++) if (f[src[e]] !== INF32) staticEdges++;
  // the sample and its cones
  const k = Math.round(fraction * nC);
  const sample = drawSample(nC, k, sampleSeed);
  const dist = new Int32Array(nC).fill(NEVER);
  const touched = [];
  const buckets = Array.from({ length: L + 1 }, () => []);
  const coneOf = (c) => {
    for (const t of touched) dist[t] = NEVER;
    touched.length = 0;
    for (const b of buckets) b.length = 0;
    dist[c] = 0; touched.push(c); buckets[0].push(c);
    for (let d = 0; d <= L; d++) {
      for (const v of buckets[d]) {
        if (dist[v] !== d) continue;
        for (let q = bw.start[v]; q < bw.start[v + 1]; q++) {
          const e = bw.list[q], u = src[e], nd = d + 1 + delay[e];
          if (nd > L || nd >= dist[u]) continue;
          if (reduce && (f[u] === INF32 || f[u] + nd > L)) continue;
          if (dist[u] === NEVER) touched.push(u);
          dist[u] = nd; buckets[nd].push(u);
        }
      }
    }
    return touched;
  };
  // batches: consecutive sampled cells while the union of their cones stays under batchCells
  const t0 = now();
  const batches = [];
  const coneSizes = new Int32Array(k);
  { const inU = new Uint8Array(nC); let members = [], cur = [];
    const flush = () => { if (!cur.length) return; batches.push({ cells: cur, union: members.length }); for (const x of members) inU[x] = 0; members = []; cur = []; };
    for (let s = 0; s < k; s++) {
      const cl = coneOf(sample[s]);
      coneSizes[s] = cl.length;
      let add = 0; for (const x of cl) if (!inU[x]) add++;
      if (cur.length && members.length + add > batchCells) flush();
      for (const x of cl) if (!inU[x]) { inU[x] = 1; members.push(x); }
      cur.push(sample[s]);
    }
    flush(); }
  const planMs = now() - t0;
  const sortedSizes = Int32Array.from(coneSizes).sort();
  const q = (p) => (k ? sortedSizes[Math.min(k - 1, Math.floor(p * k))] : null);
  const cones = { median: q(0.5), p90: q(0.9), max: k ? sortedSizes[k - 1] : null, sum: sortedSizes.reduce((a, b) => a + b, 0) };
  log('sampled census of ' + rel(st.dir) + ': ' + k + ' of ' + nC + ' cells (' + pct(k, nC) + '%, seed ' + JSON.stringify(sampleSeed) + '), each run exactly on its backward cone at ' + horizon + ' ticks (0 to ' + L + '), tasks off');
  log('  cones      ' + (reduce ? 'reduced (f(u) + b(u) <= ' + L + ')' : 'full') + ': median ' + cones.median + ', p90 ' + cones.p90 + ', max ' + cones.max + ' cells; ' + batches.length + ' batches of at most ' + batchCells + ' cells, ' + batches.reduce((a, b) => a + b.union, 0) + ' cells loaded in all; planned in ' + (planMs / 1000).toFixed(1) + ' s; rss ' + mb(process.memoryUsage.rss()) + ' MB');
  // run the batches
  const into = {
    runs: new Int32Array(nC), driveRuns: new Int32Array(nC), fired: new Int32Array(nC), errs: new Int32Array(nC), skips: new Int32Array(nC),
    signals: new Uint32Array(nC), driveSignals: new Uint32Array(nC), seenCell: new Uint8Array(nC),
    hits: new Uint32Array(nE), driveHits: new Uint32Array(nE), used: new Uint8Array(nE), seenEdge: new Uint8Array(nE),
  };
  const rows = [];
  const owned = new Uint8Array(nC), inR = new Uint8Array(nC), loadE = new Uint8Array(nE);
  for (let bi = 0; bi < batches.length && bi < maxBatches; bi++) {
    const b = batches[bi];
    owned.fill(0); inR.fill(0); loadE.fill(0);
    for (const c of b.cells) { owned[c] = 1; for (const x of coneOf(c)) inR[x] = 1; }
    let nLoadE = 0;
    for (let e = 0; e < nE; e++) if (inR[src[e]] && inR[dst[e]]) { loadE[e] = 1; nLoadE++; }
    const r = await runShard(st, plan, { owned, inR, loadE, nLoadE }, { ticks: horizon, tasks: false, L, capMB, label: 'batch ' + bi, into });
    const row = { batch: bi, owned: b.cells.length, loadedCells: b.union, loadedEdges: nLoadE, grown: r.grown, errors: r.errors, peakRssMB: r.peakRssMB, wallMs: r.wallMs, mailDropped: r.mailDropped, phantomRefused: r.phantomRefused };
    rows.push(row);
    log('  batch ' + String(bi).padStart(3) + '  owns ' + row.owned + ', loads ' + row.loadedCells + ' cells and ' + row.loadedEdges + ' edges; grown ' + row.grown + ', peak rss ' + row.peakRssMB + ' MB, ' + (row.wallMs / 1000).toFixed(1) + ' s');
  }
  const ranBatches = rows.length, complete = ranBatches === batches.length;
  // the sampled cells that were run, and what they did
  const measured = [];
  for (let bi = 0; bi < ranBatches; bi++) for (const c of batches[bi].cells) measured.push(c);
  let ran = 0, fired = 0, reach = 0, within = 0, ranNotWithin = 0, ranNotReach = 0, withinNotRan = 0, errored = 0;
  const ys = [], ms = [], sys = [];
  for (const c of measured) {
    if (!into.seenCell[c]) throw new Error('census: sampled cell ' + plan.ids[c] + ' was not tallied');
    const r = into.runs[c] > 0, fi = into.fired[c] > 0, re = f[c] !== INF32, wi = f[c] <= L;
    ran += r; fired += fi; reach += re; within += wi; errored += into.errs[c] > 0;
    if (r && !wi) ranNotWithin++;
    if (r && !re) ranNotReach++;
    if (wi && !r) withinNotRan++;
    let y = 0, m = 0;
    for (let q2 = fw.start[c]; q2 < fw.start[c + 1]; q2++) { const e = fw.list[q2]; m++; if (into.hits[e] > 0) y++; }
    ys.push(y); ms.push(m); sys.push(re ? m : 0);
  }
  const n = measured.length;
  const shares = {
    ran: wilson(ran, n), fired: wilson(fired, n),
    staticReachable: wilson(reach, n), staticWithinHorizon: wilson(within, n),
    edgesDelivered: clusterRatio(ys, ms), edgesStaticLive: clusterRatio(sys, ms),
  };
  // lines: the static rule on the whole seed, and the dynamic estimate from the sample
  const declRegions = plan.declared.regions, declCircuits = plan.declared.circuits;
  const loadedFiles = ['index.mjs', 'regions.mjs', 'manifest.json', ...st.cellFiles, ...st.edgeFiles];
  const loadedLines = loadedFiles.reduce((a, x) => a + (plan.lines[x] || 0), 0);
  const declarations = declRegions + declCircuits + nC + nE;
  const structure = loadedLines - declarations;
  const liveRegionNames = new Set(), liveCircuitKeys = new Set();
  for (let i = 0; i < nC; i++) if (f[i] !== INF32) { liveRegionNames.add(plan.regions[plan.regionOf[i]]); liveCircuitKeys.add(plan.circuits[plan.circuitOf[i]]); }
  let rLive = 0, kLive = 0;
  for (const [t, a] of plan.regionsDecl) { if (t === 'r' && liveRegionNames.has(a[0])) rLive++; if (t === 'k' && liveCircuitKeys.has(a[0] + '/' + a[1])) kLive++; }
  // static (tasks off, so the periodic cells are the only sources) and the dynamic estimate: the
  // sampled ran share times the cells, the delivered share times the edges, and the regions and
  // circuits the static rule keeps (an upper bound: the sample cannot tell which circuit ran)
  const staticLive = rLive + kLive + staticCells.reachable + staticEdges;
  const est = (pc, pe) => (pc === null || pe === null ? null : rLive + kLive + pc * nC + pe * nE);
  const dynLive = { p: est(shares.ran.p, shares.edgesDelivered.r), lo: est(shares.ran.lo, shares.edgesDelivered.lo), hi: est(shares.ran.hi, shares.edgesDelivered.hi) };
  const share = (x) => (x === null ? null : Number(((x + structure) / loadedLines).toFixed(6)));
  const lineShares = {
    static: { liveDeclarations: staticLive, loadBearing: staticLive + structure, fraction: share(staticLive) },
    dynamic: { liveDeclarations: dynLive.p === null ? null : Math.round(dynLive.p), fraction: share(dynLive.p), lo: share(dynLive.lo), hi: share(dynLive.hi) },
  };

  const out = {
    mode: 'sampled', seed: { dir: st.dir, name: st.name, manifestHash: st.manifest.hash }, horizon, L, fraction, sampleSeed, reduce, batchCells, capMB,
    sample: { drawn: k, measured: n, complete, batches: batches.length, batchesRun: ranBatches },
    cones, shares, errored,
    agreement: { ranNotWithinHorizon: ranNotWithin, ranNotReachable: ranNotReach, withinHorizonNotRan: withinNotRan, reachableNotRan: reach - (ran - ranNotReach) },
    wholeStatic: { cells: nC, edges: nE, reachable: staticCells.reachable, withinHorizon: staticCells.withinHorizon, liveEdges: staticEdges },
    lines: { loaded: loadedLines, declarations, structure, regionsDeclared: declRegions, circuitsDeclared: declCircuits, regionsLive: rLive, circuitsLive: kLive, ...lineShares },
    batches: rows, exact: rows.every((x) => x.grown === 0),
    memoryMB: { peakRssPerBatchMax: rows.length ? Math.max(...rows.map((x) => x.peakRssMB)) : null, processPeakWorkingSet: mb(process.resourceUsage().maxRSS * 1024), capPerBatch: capMB },
    ms: { plan: Math.round(planMs), wall: Math.round(now() - w0) },
    raw: { measured, runs: into.runs, fired: into.fired, hits: into.hits, f },
  };
  return out;
}

// the static census of the 5 million line seed is bench/verdicts/census-scale-static.json, and of
// the seed pruned by it census-scale-pruned.json
const staticBase = (name) => (name === 'scale-52000' ? 'census-scale-static' : name === 'scale-52000-pruned' ? 'census-scale-pruned' : 'census-' + name + '-static');
const sampledBase = (name) => (name === 'scale-52000' ? 'census-scale-sampled' : 'census-' + name + '-sampled');
const pc = (x) => (x === null || x === undefined ? 'n/a' : (100 * x).toFixed(2) + '%');
const ci = (o, key = 'p') => pc(o[key]) + ' (95% ' + pc(o.lo) + ' to ' + pc(o.hi) + ')';

/** A pruned seed's static census against the static census it was pruned by. */
export function staticPruneComparison(b, a, pruned, file) {
  const side = (v) => ({
    lines: v.lines.loaded, manifestLines: v.manifestCount.lines, declarations: v.lines.declarations,
    liveDeclarations: v.lines.liveDeclarations, deadDeclarations: v.lines.deadDeclarations,
    deadShare: frac(v.lines.deadDeclarations, v.lines.declarations),
    fractionLoadBearing: v.lines.fractionLoadBearing, cells: v.cells.declared, reachableCells: v.cells.reachable, edges: v.edges.declared, liveEdges: v.edges.live,
  });
  const before = { file, at: b.at, ...side(b) }, after = side(a);
  const checks = {
    fewerLines: after.lines < before.lines,
    keptEveryLiveCell: after.cells === before.reachableCells && after.reachableCells === before.reachableCells,
    keptEveryLiveEdge: after.edges === before.liveEdges && after.liveEdges === before.liveEdges,
    noDeadDeclarationLeft: after.deadDeclarations === 0,
    loadBearingShareRose: after.fractionLoadBearing > before.fractionLoadBearing,
  };
  const statement = 'Against ' + file + ', the static census this seed was pruned by: lines ' + before.lines + ' to ' + after.lines + ' (manifest count ' + before.manifestLines + ' to ' + after.manifestLines + '), dead declarations ' + before.deadDeclarations + ' of ' + before.declarations + ' (dead share ' + before.deadShare + ') to ' + after.deadDeclarations + ' of ' + after.declarations + ' (dead share ' + after.deadShare + '), load bearing share ' + before.fractionLoadBearing + ' to ' + after.fractionLoadBearing + '; cells ' + before.cells + ' to ' + after.cells + ' (' + before.reachableCells + ' were live), edges ' + before.edges + ' to ' + after.edges + ' (' + before.liveEdges + ' were live).';
  return { before, after, checks, pruned: { from: pruned.from, fromHash: pruned.fromHash, rule: pruned.rule, streamed: pruned.streamed, cells: pruned.cells, edges: pruned.edges, kept: pruned.kept }, statement };
}

function printStaticPrune(log, cmp) {
  const b = cmp.before, a = cmp.after;
  log('  prune      before: ' + b.file + ' (' + b.at + '); after: this census');
  log('  lines      ' + b.lines + ' -> ' + a.lines + ' (' + signed(a.lines - b.lines) + '); manifest count ' + b.manifestLines + ' -> ' + a.manifestLines);
  log('  dead share ' + b.deadDeclarations + '/' + b.declarations + ' = ' + b.deadShare + ' -> ' + a.deadDeclarations + '/' + a.declarations + ' = ' + a.deadShare + '; load bearing share ' + b.fractionLoadBearing + ' -> ' + a.fractionLoadBearing);
  log('  checks     ' + Object.entries(cmp.checks).map(([k, v]) => k + ' ' + v).join(', '));
}

function printSampled(log, r, sv, sf) {
  const s = r.shares, n = r.sample.measured, H = r.horizon;
  log('  sample     ' + n + ' of ' + r.sample.drawn + ' drawn cells measured (' + r.sample.batchesRun + ' of ' + r.sample.batches + ' batches)' + (r.sample.complete ? '' : '; INCOMPLETE, a timing run'));
  log('  ran        ' + s.ran.x + ' of ' + n + ' sampled cells ran within ' + H + ' ticks: ' + ci(s.ran) + ' (Wilson)');
  log('  fired      ' + s.fired.x + ' of ' + n + ' emitted at least once: ' + ci(s.fired));
  log('  edges      ' + s.edgesDelivered.y + ' of the ' + s.edgesDelivered.m + ' out-edges of the sampled cells delivered: ' + ci(s.edgesDelivered, 'r') + ' (ratio over ' + s.edgesDelivered.clusters + ' cells as clusters)');
  log('  check      ran but not reachable within ' + H + ' ticks by the static rule: ' + r.agreement.ranNotWithinHorizon + '; ran but not reachable at all: ' + r.agreement.ranNotReachable + ' (the static rule bounds the run cell by cell); reachable within ' + H + ' ticks and did not run: ' + r.agreement.withinHorizonNotRan);
  log('  side by side, cells: static reachable ' + ci(s.staticReachable) + ' | static within ' + H + ' ticks ' + ci(s.staticWithinHorizon) + ' | ran ' + ci(s.ran) + ' | fired ' + ci(s.fired));
  log('               whole seed, static: reachable ' + r.wholeStatic.reachable + '/' + r.wholeStatic.cells + ' = ' + pct(r.wholeStatic.reachable, r.wholeStatic.cells) + '%, within ' + H + ' ticks ' + r.wholeStatic.withinHorizon + '/' + r.wholeStatic.cells + ' = ' + pct(r.wholeStatic.withinHorizon, r.wholeStatic.cells) + '%');
  log('               edges: static live ' + ci(s.edgesStaticLive, 'r') + ' | delivered ' + ci(s.edgesDelivered, 'r'));
  log('               lines: static load bearing ' + pc(r.lines.static.fraction) + ' (whole seed, periodic sources only)' + (sv ? ', ' + pc(sv.lines.fractionLoadBearing) + ' in ' + rel(sf) + ' (with the hosted cells)' : '') + ' | dynamic estimate at ' + H + ' ticks ' + pc(r.lines.dynamic.fraction) + ' (95% ' + pc(r.lines.dynamic.lo) + ' to ' + pc(r.lines.dynamic.hi) + ')');
  log('  exact      ' + (r.exact ? 'yes: no batch grew an edge, so every sampled cell did exactly what it does in the whole organism over ticks 0 to ' + r.L : 'NO: a batch grew edges by co-activation'));
  log('  memory     peak rss per batch up to ' + r.memoryMB.peakRssPerBatchMax + ' MB (cap ' + r.memoryMB.capPerBatch + '), process peak working set ' + r.memoryMB.processPeakWorkingSet + ' MB; wall ' + (r.ms.wall / 1000).toFixed(1) + ' s');
}

export function sampledStatement(r, sv, staticFile) {
  const s = r.shares, H = r.horizon, n = r.sample.measured;
  return 'The sampled census drew ' + r.sample.drawn + ' of ' + r.wholeStatic.cells + ' cells of ' + rel(r.seed.dir) + ' (fraction ' + r.fraction + ', seed ' + JSON.stringify(r.sampleSeed) + ') and ran ' + n + ' of them' + (r.sample.complete ? '' : ' (an incomplete timing run)') + ' exactly, each on its backward cone at a ' + H + ' tick horizon, in ' + r.sample.batchesRun + ' batches of at most ' + r.batchCells + ' cells under a ' + r.capMB + ' MB cap per batch' + (r.exact ? ', no batch growing an edge' : ', NOT exact: a batch grew edges') + '. '
    + s.ran.x + ' of ' + n + ' ran (' + pc(s.ran.p) + ', 95% Wilson ' + pc(s.ran.lo) + ' to ' + pc(s.ran.hi) + '), ' + s.fired.x + ' emitted (' + pc(s.fired.p) + ', ' + pc(s.fired.lo) + ' to ' + pc(s.fired.hi) + '), and ' + s.edgesDelivered.y + ' of their ' + s.edgesDelivered.m + ' out-edges delivered (' + pc(s.edgesDelivered.r) + ', ' + pc(s.edgesDelivered.lo) + ' to ' + pc(s.edgesDelivered.hi) + '). '
    + 'On the same cells the static rule says ' + pc(s.staticReachable.p) + ' reachable and ' + pc(s.staticWithinHorizon.p) + ' reachable within ' + H + ' ticks; ' + r.agreement.ranNotWithinHorizon + ' cells ran outside the static bound. '
    + 'Lines: static load bearing ' + pc(r.lines.static.fraction) + (sv ? ' (' + pc(sv.lines.fractionLoadBearing) + ' in ' + staticFile + ')' : '') + ' against a dynamic estimate of ' + pc(r.lines.dynamic.fraction) + ' (' + pc(r.lines.dynamic.lo) + ' to ' + pc(r.lines.dynamic.hi) + ') at ' + H + ' ticks, the regions and circuits counted by the static rule.';
}

export function sampledVerdictOf(r, { command, staticVerdict = null, staticFile = null }) {
  return {
    bench: 'census', mode: 'sampled', at: new Date().toISOString(), command, node: process.version, isTheBar: false,
    statement: sampledStatement(r, staticVerdict, staticFile),
    seed: rel(r.seed.dir), manifestHash: r.seed.manifestHash, horizon: { ticks: r.horizon, lastTick: r.L }, fraction: r.fraction, sampleSeed: r.sampleSeed,
    method: 'a seeded partial Fisher-Yates draw of cells; each sampled cell loaded with its backward cone (reduced to the cells u with f(u) + b(u) <= L, f the earliest tick u could run from the periodic cells at tick 0, b its travel time to the sampled cell) and run by runShard, the exact shard of the sharded census, tasks off; ran and fired shares with Wilson 95 percent intervals, the delivered share of the sampled cells\' out-edges with a cluster ratio interval',
    sample: r.sample, cones: r.cones, shares: r.shares, agreement: r.agreement, wholeStatic: r.wholeStatic, lines: r.lines,
    staticVerdict: staticFile, exact: r.exact, errored: r.errored,
    batches: r.batches, memoryMB: r.memoryMB, ms: r.ms, reduce: r.reduce, batchCells: r.batchCells, capMB: r.capMB,
  };
}

// ---------------------------------------------------------------- CLI
async function main(argv) {
  const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
  const has = (k) => argv.includes('--' + k);
  const ticks = Number(opt('ticks', 200));
  const tasks = opt('tasks', 'on') !== 'off';
  const knockout = !has('no-knockout');
  const knockoutTasks = !has('no-knockout-tasks');
  const kernels = !has('no-kernels');
  const knockoutSeed = opt('knockout-seed', 'census');
  const progress = Number(opt('progress', 0)) || 0;
  const minFreeMB = Number(opt('min-free-mb', 0)) || 0;
  const command = 'node ' + process.execArgv.join(' ') + (process.execArgv.length ? ' ' : '') + 'tools/organism-census.mjs ' + argv.join(' ');
  const outDir = path.resolve(BRAIN_ROOT, opt('verdict-dir', path.join('bench', 'verdicts')));
  const ratioFrom = opt('ratio-from', DEFAULT_RATIO_FROM);
  const tag = String(opt('tag', '')).replace(/[^a-z0-9-]/gi, '');
  mkdirSync(outDir, { recursive: true });

  // ---- static: walk every line of the seed, load nothing (the census of the 5 million lines)
  if (has('static')) {
    const seedDir = opt('seed', 'organism/gen-0');
    const name = path.basename(path.resolve(BRAIN_ROOT, seedDir));
    const log = (s) => process.stdout.write(s + '\n');
    const r = staticCensus(seedDir, { tasks, horizon: Number(opt('horizon', 16)) });
    printStatic(log, r);
    const partial = has('partial') || tag !== '' || !tasks || !r.whole || !r.hash.match;
    const v = staticVerdictOf(r, { command, isTheBar: !partial });
    const base = staticBase(name);
    // a seed genome/emit.mjs --prune wrote from a static census is compared with that census,
    // and with the exact sharded attempt on it when one was refused
    const pr = r.seed.manifest.genome && r.seed.manifest.genome.pruned;
    if (pr && pr.census && pr.census.file) {
      const srcFile = path.resolve(BRAIN_ROOT, pr.census.file);
      if (existsSync(srcFile)) {
        const b = JSON.parse(readFileSync(srcFile, 'utf8'));
        if (b.mode === 'static') {
          v.prune = staticPruneComparison(b, v, pr, pr.census.file);
          printStaticPrune(log, v.prune);
          v.statement += ' ' + v.prune.statement;
        }
      }
      const refusedFile = path.join(outDir, verdictName(name, true, 'refused', shardedBase(name)));
      if (existsSync(refusedFile)) {
        const x = JSON.parse(readFileSync(refusedFile, 'utf8'));
        v.exactAttempt = { file: rel(refusedFile), at: x.at, command: x.command, error: x.error, lastTick: x.horizon && x.horizon.lastTick, shards: (x.shards || []).map((s) => ({ shard: s.shard, ownedCells: s.ownedCells, cone: s.cone, loadedCells: s.loadedCells, loadedEdges: s.loadedEdges, estimateMB: s.estimateMB })) };
        log('  exact      refused first (' + v.exactAttempt.file + ', ' + x.at + '): ' + v.exactAttempt.shards.map((s) => 'shard ' + s.shard + ' cone ' + s.cone + ' cells, estimate ' + s.estimateMB + ' MB').join('; ') + ', over the ' + (x.capMB || 8000) + ' MB cap; so the static census walked it instead');
        v.statement += ' The exact sharded census was tried first and refused before loading anything (' + v.exactAttempt.file + ': ' + v.exactAttempt.shards.map((s) => 'shard ' + s.shard + ' estimated at ' + s.estimateMB + ' MB').join(', ') + '), so this static census is the mode that walked the whole pruned seed.';
      }
    }
    const file = path.join(outDir, verdictName(name, partial, tag, base));
    writeFileSync(file, JSON.stringify(v, null, 2) + '\n');
    log('  ' + v.statement);
    log('wrote ' + rel(file) + ' (isTheBar ' + v.isTheBar + ', ' + (JSON.stringify(v).length / 1024).toFixed(0) + ' KB)');
    return;
  }

  // ---- sampled: a seeded fraction of the cells, each run exactly on its cone at a short horizon
  if (has('sample')) {
    const fraction = Number(opt('sample', 0.02));
    if (!(fraction > 0 && fraction <= 1)) throw new Error('census: --sample takes a fraction in (0, 1]');
    const seedDir = opt('seed', 'organism/gen-0');
    const name = path.basename(path.resolve(BRAIN_ROOT, seedDir));
    const log = (s) => process.stdout.write(s + '\n');
    const maxBatches = has('max-batches') ? Number(opt('max-batches', 0)) : Infinity;
    const r = await sampledCensus(seedDir, {
      fraction, sampleSeed: opt('sample-seed', 'census'), horizon: Number(opt('horizon', 16)),
      batchCells: Number(opt('batch-cells', 80000)), capMB: Number(opt('cap-mb', 5000)), reduce: !has('no-reduce'), maxBatches, kernels, log,
    });
    const sf = path.join(outDir, verdictName(name, false, '', staticBase(name)));
    const sv = existsSync(sf) ? JSON.parse(readFileSync(sf, 'utf8')) : null;
    printSampled(log, r, sv, sf);
    const v = sampledVerdictOf(r, { command, staticVerdict: sv, staticFile: sv ? rel(sf) : null });
    const file = path.join(outDir, verdictName(name, true, tag || (r.sample.complete ? '' : 'timing'), sampledBase(name)));
    delete v.raw;
    writeFileSync(file, JSON.stringify(v, null, 2) + '\n');
    log('  ' + v.statement);
    log('wrote ' + rel(file) + ' (isTheBar false: the sampled census is the measurement beside the bar, not the bar; ' + (JSON.stringify(v).length / 1024).toFixed(0) + ' KB)');
    return;
  }

  // ---- sharded: N cells files at a time, never the whole seed at once
  if (has('shard-files')) {
    const shardFiles = Number(opt('shard-files', 0));
    if (!(Number.isInteger(shardFiles) && shardFiles >= 1)) throw new Error('census: --shard-files takes a positive integer');
    const mode = has('cut') ? 'cut' : 'exact';
    const capMB = Number(opt('cap-mb', 8000));
    const seedDir = opt('seed', 'organism/gen-0');
    const name = path.basename(path.resolve(BRAIN_ROOT, seedDir));
    const base = shardedBase(name) + (mode === 'cut' ? '-cut' : '');
    let r;
    try {
      r = await censusSharded(seedDir, { shardFiles, mode, ticks, tasks, capMB, ratioFrom: has('ratio-from') ? ratioFrom : null, kernels });
    } catch (err) {
      if (!err.censusRefused && !err.censusCap) throw err;
      const refused = !!err.censusRefused;
      const file = path.join(outDir, verdictName(name, true, (tag ? tag + '-' : '') + (refused ? 'refused' : 'stopped'), base));
      const v = {
        bench: 'census', mode: 'sharded ' + mode, at: new Date().toISOString(), command, node: process.version, isTheBar: false,
        statement: err.message + (refused ? ' Nothing was loaded; the plan below is the whole record.' : ' The shard was stopped; no tally was taken.'),
        seed: toPosix(seedDir), ticks, shardFiles, capMB, error: err.message,
        ...(refused ? { horizon: { lastTick: err.censusRefused.L }, shards: err.censusRefused.shards, plan: err.censusRefused.plan, ratio: err.censusRefused.ratio } : { stoppedAt: err.censusCap }),
      };
      writeFileSync(file, JSON.stringify(v, null, 2) + '\n');
      console.error(err.message);
      console.log('wrote ' + rel(file) + ' (isTheBar false, ' + (refused ? 'refused' : 'stopped at the cap') + ')');
      process.exitCode = refused ? 2 : 1;
      return;
    }
    printSharded((s) => process.stdout.write(s + '\n'), r);
    const partial = has('partial') || !r.exact || !tasks || tag !== '';
    const v = shardedVerdictOf(r, { ticks, command, isTheBar: !partial });
    const file = path.join(outDir, verdictName(name, partial, tag, base));
    writeFileSync(file, JSON.stringify(v, null, 2) + '\n');
    console.log('  ' + v.statement);
    console.log('wrote ' + rel(file) + ' (isTheBar ' + v.isTheBar + ', ' + (JSON.stringify(v).length / 1024).toFixed(0) + ' KB)');
    return;
  }

  if (has('all')) {
    const maxCells = Number(opt('max-cells', 50000));
    const root = path.join(BRAIN_ROOT, 'organism');
    const rows = [];
    for (const d of readdirSync(root).sort()) {
      const dir = path.join(root, d);
      if (!existsSync(path.join(dir, 'index.mjs'))) continue;
      const m = readManifest(dir);
      if (m.counts.cells > maxCells) { console.log('skip ' + d + ': ' + m.counts.cells + ' cells is over --max-cells ' + maxCells); rows.push({ seed: 'organism/' + d, skipped: 'cells ' + m.counts.cells + ' over --max-cells ' + maxCells }); continue; }
      const est = estimateWhole(dir, ratioOf(ratioFrom));
      if (est.refuse) { console.log('skip ' + d + ': ' + refusalText(est)); rows.push({ seed: 'organism/' + d, skipped: 'estimated ' + est.estimateMB + ' MB, over half of physical memory' }); continue; }
      const r = await censusSeed(dir, { ticks, tasks, knockout, knockoutSeed, knockoutTasks, kernels });
      rows.push({ seed: 'organism/' + d, cells: r.full.cells, edges: r.full.edges, kinds: { present: r.full.kinds.present, ran: r.full.kinds.ran }, lines: { loaded: r.lines.loaded, declarations: r.lines.declarations, live: r.lines.liveDeclarations, loadBearing: r.lines.loadBearing }, tasks: r.full.tasks && r.full.tasks.score, knockoutDelta: r.knockouts.map((k) => ({ role: k.role, file: k.file, delta: k.delta })) });
    }
    const done = rows.filter((x) => !x.skipped);
    const sum = (f) => done.reduce((a, x) => a + f(x), 0);
    const v = {
      bench: 'census-all', at: new Date().toISOString(), command, node: process.version, isTheBar: false, ticks,
      statement: 'Census of ' + done.length + ' seeds under organism/ at ' + ticks + ' ticks each (' + (rows.length - done.length) + ' skipped as over --max-cells): ' + sum((x) => x.cells.ran) + ' of ' + sum((x) => x.cells.declared) + ' declared cells ran and ' + sum((x) => x.edges.delivered) + ' of ' + sum((x) => x.edges.declared) + ' declared edges delivered; ' + sum((x) => x.lines.loadBearing) + ' of ' + sum((x) => x.lines.loaded) + ' loaded lines are load bearing. Not the bar: the bar is organism/gen-0 at 200 ticks and organism/scale-52000 at 20.',
      seeds: rows,
    };
    const file = path.join(outDir, 'census-all.json');
    writeFileSync(file, JSON.stringify(v, null, 2) + '\n');
    console.log(v.statement);
    console.log('wrote ' + rel(file));
    return;
  }

  const seedDir = opt('seed', 'organism/gen-0');
  // (b) the refusal: before anything of the seed is imported, from its manifest alone
  const est = estimateWhole(seedDir, ratioOf(ratioFrom));
  if (est.refuse) {
    console.error(refusalText(est));
    process.exitCode = 2;
    return;
  }
  const samples = [];
  let r;
  try {
    r = await censusSeed(seedDir, { ticks, tasks, knockout, knockoutSeed, knockoutFile: opt('knockout', null), knockoutTasks, kernels, progress, minFreeMB, samples });
  } catch (err) {
    if (!err.censusStop) throw err;
    // The organism stopped fitting: record every sample taken, never a census.
    const name = path.basename(path.resolve(BRAIN_ROOT, seedDir));
    const file = path.join(outDir, verdictName(name + '-stopped', true));
    const stop = err.censusStop;
    const v = {
      bench: 'census', at: new Date().toISOString(), command, node: process.version, isTheBar: false,
      statement: 'The census of ' + toPosix(seedDir) + ' at ' + ticks + ' ticks stopped before it finished: at ' + stop.phase + ' tick ' + stop.tick + ', ' + stop.s + ' s into the arm, the machine had ' + stop.freeMB + ' MB of physical memory free, under --min-free-mb ' + minFreeMB + ' (rss ' + stop.rssMB + ' MB, heap used ' + stop.heapUsedMB + ' MB, array buffers ' + stop.arrayBuffersMB + ' MB, of ' + mb(totalmem()) + ' MB installed). No cell, edge or line count was taken; the samples below are the whole record.',
      seed: toPosix(seedDir), ticks, error: err.message, stoppedAt: stop, totalMB: mb(totalmem()), progress: samples,
    };
    writeFileSync(file, JSON.stringify(v, null, 2) + '\n');
    console.error(err.message);
    console.log('wrote ' + rel(file) + ' (isTheBar false, the census stopped)');
    process.exitCode = 1;
    return;
  }
  // --tag names a diagnostic run's file apart from the others; a tagged run is never the bar.
  let partial = has('partial') || !knockout || !tasks || tag !== '';
  const v = verdictOf(r, { ticks, command, isTheBar: !partial, knockoutSeed });
  // A seed genome/emit.mjs --prune wrote is compared with the census it was pruned by; for the
  // gen-0 bar census that comparison is the prune bar, bench/verdicts/census-prune.json.
  let base = null;
  const src = pruneSource(r.seed);
  if (src && !src.missing) {
    const cmp = pruneComparison(src, r, ticks);
    printPrune((s) => process.stdout.write(s + '\n'), cmp);
    v.prune = cmp;
    if (!cmp.met) { partial = true; v.isTheBar = false; }
    v.statement += ' Against ' + cmp.before.file + ', the census this seed was pruned by: lines ' + cmp.before.lines + ' to ' + cmp.after.lines + ', load bearing share ' + cmp.before.fractionLoadBearing + ' to ' + cmp.after.fractionLoadBearing + ', algebra ' + cmp.before.algebra.correct + ' to ' + cmp.after.algebra.correct + ' of ' + cmp.after.algebra.n + ', sequence ' + cmp.before.sequence.correct + ' to ' + cmp.after.sequence.correct + ' of ' + cmp.after.sequence.n + ', drive runs ' + cmp.before.drive.runs + ' to ' + cmp.after.drive.runs + '; the bar is ' + (cmp.met ? 'met' : 'missed') + '.';
    if (src.file === 'bench/verdicts/census.json') base = 'census-prune';
  }
  const file = path.join(outDir, verdictName(r.seed.name, partial, tag, base));
  writeFileSync(file, JSON.stringify(v, null, 2) + '\n');
  console.log('  ' + v.statement);
  console.log('wrote ' + rel(file) + ' (isTheBar ' + v.isTheBar + ', ' + (JSON.stringify(v).length / 1024).toFixed(0) + ' KB)');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main(process.argv.slice(2));
}
