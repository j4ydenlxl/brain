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
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { freemem, totalmem } from 'node:os';
import { heapStats } from '../core/simd.mjs';
import { dropPayload } from '../core/signal.mjs';
import { getKind, DEFAULT_POLICY } from '../core/cell.mjs';
import '../cells/all.mjs';
import { loadOrganism, verify, readManifest } from '../genome/load.mjs';
import { liveBits } from '../genome/emit.mjs';
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
    nC, nE, ids, idx, kinds, kindOf, regions, regionOf, circuitOf, period, fileOf, src, dst, delay, sp, dp,
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
