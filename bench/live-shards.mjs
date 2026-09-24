// bench/live-shards.mjs : THE WHOLE BRAIN ON THE PARALLEL RUNTIME.
//
// runtime/cluster.mjs has only ever carried the synthetic relay brain of bench/parallel.mjs.
// This bench puts the organism of seeds/whole.mjs through the same machine: buildWhole at
// the asked size, specFromBrain, then runCluster at 1, 2, 4, 8 and 16 shards, and it asks
// two questions that have never been asked of the whole brain together:
//
//   (a) is the sharded brain the SAME brain at every shard count? The global fired list is
//       hashed tick by tick, the per cell run and fire counts are read back out of the
//       shards, and the coordinator's own ledger is digested. Identical hashes at 1, 2, 4,
//       8 and 16 shards is the invariant bench/parallel.mjs checks, on the real organism.
//   (b) what does the extra hardware buy? Ticks per second per shard count and the speedup
//       over one shard, measured on the tick loop alone (start and stop are excluded and
//       reported separately as wallMs).
//
// A third question the landing demands: some cell kinds may not be able to run inside a
// worker at all. Those are not guessed. A single process reference is ticked in this thread,
// where every registry seeds/whole.mjs builds is present, a census worker ticks the same
// spec with nothing registered, and any cell whose run or fire count differs is BLOCKED.
// The reason is read out of that cell's own cell.error event, never invented. The whole
// brain minus every blocked kind is then run as the largest runnable subset and proved
// identical to one process as well as identical across shard counts.
//
// Usage:
//   node bench/live-shards.mjs [--majors 1000] [--units 256] [--ticks 200]
//                              [--shards 1,2,4,8,16]
// Writes bench/verdicts/live-shards.json. Every number in notes/shards.md comes from it.
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { availableParallelism } from 'node:os';
import { Worker, isMainThread, workerData, parentPort } from 'node:worker_threads';
import { buildWhole } from '../seeds/whole.mjs';
import { Cluster, runCluster, specFromBrain, buildBrain } from '../runtime/cluster.mjs';
import { closeWorld } from '../world/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// The module every shard imports. Importing seeds/whole.mjs registers every cell kind the
// whole brain uses and builds nothing, which is exactly what a shard needs.
export const WHOLE_MODULE = new URL('../seeds/whole.mjs', import.meta.url).href;
const SELF = new URL(import.meta.url);

// ---------------------------------------------------------------- hashing
// FNV-1a, 32 bit, over integers. A hash is a number so it can be a numeric leaf of the
// verdict; two runs agree exactly when the numbers agree.
const FNV_OFFSET = 0x811c9dc5, FNV_PRIME = 0x01000193;
export function fnvInt(h, v) {
  const x = v | 0;
  for (let i = 0; i < 4; i++) { h = (h ^ ((x >>> (i * 8)) & 0xff)) >>> 0; h = Math.imul(h, FNV_PRIME) >>> 0; }
  return h >>> 0;
}
export function fnvStr(h, s) {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h = (h ^ (c & 0xff)) >>> 0; h = Math.imul(h, FNV_PRIME) >>> 0;
    h = (h ^ ((c >>> 8) & 0xff)) >>> 0; h = Math.imul(h, FNV_PRIME) >>> 0;
  }
  return h >>> 0;
}

/** Accumulates the global fired list, tick by tick, into one number. */
export class FiredDigest {
  constructor() { this.h = FNV_OFFSET >>> 0; this.ticks = 0; this.total = 0; }
  push(t, fired) {
    this.h = fnvInt(this.h, t);
    this.h = fnvInt(this.h, fired.length);
    for (let i = 0; i < fired.length; i++) this.h = fnvInt(this.h, fired[i]);
    this.ticks++; this.total += fired.length;
  }
  get hash() { return this.h >>> 0; }
}

/** Per cell run and fire counts, in global cell order, as one number. */
export function countsDigest(runs, fired) {
  let h = FNV_OFFSET >>> 0;
  for (let i = 0; i < runs.length; i++) { h = fnvInt(h, runs[i]); h = fnvInt(h, fired[i]); }
  return h >>> 0;
}

// The coordinator's shadow Brain is the one GLOBAL ledger a cluster has. Its in memory ring
// holds 100000 events and the build alone can write more than that, so the event bodies
// cannot all be read back; ledger.counts is complete, so the digest is taken over the event
// TYPE histogram plus the final seq. That is partition independent by construction and it
// is what "the ledger hashes are identical across shard counts" can honestly mean here.
export function ledgerDigest(ledger) {
  const types = [...ledger.counts.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  let h = FNV_OFFSET >>> 0;
  h = fnvInt(h, ledger.seq);
  for (const [type, n] of types) { h = fnvStr(h, type); h = fnvInt(h, n); }
  return { hash: h >>> 0, events: ledger.seq, types: Object.fromEntries(types) };
}

// ---------------------------------------------------------------- the census worker
// This file is its own worker entry. A shard of runtime/shard.mjs never sets this flag, so
// importing this module from a shard cannot start a census.
const IS_CENSUS = !isMainThread && workerData && workerData.liveShardsCensus === true;
if (IS_CENSUS) {
  // A worker thread with nothing registered: no memory system, no mind model, no world.
  // Exactly the environment a shard's cells wake up in.
  const b = buildBrain(workerData.spec);
  b.tick(workerData.ticks | 0);
  // With the spec's ledger at 'off' the ONLY events in the ring are cell.error, which
  // core/cell.mjs appends through ctx.ledger directly rather than through Brain.log, so
  // the ring is intact and every reason can be read.
  const why = new Map();
  for (const ev of b.ledger.recent(100000, 'cell.error')) {
    const rec = why.get(ev.cell);
    if (rec) rec.errors++;
    else why.set(ev.cell, { cell: ev.cell, errors: 1, message: String(ev.error) });
  }
  const runs = new Int32Array(b.cells.length), fired = new Int32Array(b.cells.length);
  for (let i = 0; i < b.cells.length; i++) { runs[i] = b.cells[i].stats.runs; fired[i] = b.cells[i].stats.fired; }
  parentPort.postMessage({
    type: 'census', runs, fired,
    errors: b.stats.errors, ticks: workerData.ticks | 0,
    why: [...why.values()],
  });
  parentPort.close();
}

/** Tick the spec in a bare worker thread and report per cell counts and every error reason. */
export function census(spec, ticks) {
  return new Promise((res, rej) => {
    const w = new Worker(SELF, { workerData: { liveShardsCensus: true, spec, ticks } });
    let got = null;
    w.on('message', (m) => { got = m; });
    w.on('error', rej);
    w.on('exit', (code) => (got ? res(got) : rej(new Error('census worker exited with code ' + code))));
  });
}

// ---------------------------------------------------------------- the arms
const now = () => Number(process.hrtime.bigint()) / 1e6;

/** One process: the reference every sharded arm is measured against. */
export function referenceRun(spec, ticks) {
  const b = buildBrain(spec, { ledger: 'full' });
  const digest = new FiredDigest();
  b.hooks.afterTick.push((_brain, t, fired) => digest.push(t, fired));
  const t0 = now();
  b.tick(ticks);
  const ms = now() - t0;
  const n = b.cells.length;
  const runs = new Int32Array(n), fired = new Int32Array(n);
  for (let i = 0; i < n; i++) { runs[i] = b.cells[i].stats.runs; fired[i] = b.cells[i].stats.fired; }
  const led = ledgerDigest(b.ledger);
  return {
    brain: b, runs, fired,
    row: {
      shards: 0, ticks, ms: +ms.toFixed(1), seconds: +(ms / 1000).toFixed(4),
      ticksPerSec: +(ticks / (ms / 1000)).toFixed(3),
      runs: b.stats.runs, signals: b.stats.signals, delivered: b.stats.delivered,
      refused: b.stats.refused, errors: b.stats.errors, grown: b.stats.grown, pruned: b.stats.pruned,
      firedHash: digest.hash, firedTicks: digest.ticks, firedTotal: digest.total,
      countsHash: countsDigest(runs, fired),
      ledgerHash: led.hash, ledgerEvents: led.events,
    },
  };
}

/**
 * A cluster run that watches the global fired list. Cluster._structural(t, fired) is the
 * one place the coordinator holds the whole brain's fired list, so an own property on the
 * instance intercepts it without any change to runtime/cluster.mjs.
 */
export async function identityRun(spec, shards, ticks) {
  const c = new Cluster(spec, { shards, ledger: 'full' });
  const digest = new FiredDigest();
  const inner = Cluster.prototype._structural.bind(c);
  c._structural = (t, fired) => { digest.push(t, fired); return inner(t, fired); };
  const w0 = now();
  await c.start();
  const startMs = now() - w0;
  const t0 = now();
  await c.tick(ticks);
  const ms = now() - t0;
  const st = await c.stats();
  const cn = await c.counts();
  const led = ledgerDigest(c.shadow.ledger);
  await c.stop();
  return {
    runs: cn.runs, fired: cn.fired,
    row: {
      shards, ticks, startMs: +startMs.toFixed(1), ms: +ms.toFixed(1), seconds: +(ms / 1000).toFixed(4),
      ticksPerSec: +(ticks / (ms / 1000)).toFixed(3), wallMs: +(now() - w0).toFixed(1),
      runs: st.runs, signals: st.signals, delivered: st.delivered,
      refused: st.refused, errors: st.errors, grown: st.grown, pruned: st.pruned,
      cells: st.cells, edges: st.edges, liveEdges: st.liveEdges,
      inShardEdges: st.inShardEdges, crossEdges: st.crossEdges,
      crossMessages: st.crossMessages, crossDelivered: st.crossDelivered,
      cloned: st.cloned, overflow: st.overflow, arrived: st.arrived,
      sharedBytes: st.sharedBytes, sharedMB: +(st.sharedBytes / 1048576).toFixed(2),
      firedHash: digest.hash, firedTicks: digest.ticks, firedTotal: digest.total,
      countsHash: countsDigest(cn.runs, cn.fired),
      ledgerHash: led.hash, ledgerEvents: led.events,
      gateProposed: st.gate.proposed | 0, gateApproved: st.gate.approved | 0, gateRefused: st.gate.refused | 0,
      coordRoundTripUs: +st.coord.roundTripUs.toFixed(1), coordReplyUs: +st.coord.replyUs.toFixed(1),
      coordFiredUs: +st.coord.firedUs.toFixed(1), coordStructUs: +st.coord.structUs.toFixed(1),
      busyUsMax: Math.max(...st.per.map((p) => p.busyUs)),
      busyUsSum: st.per.reduce((a, p) => a + p.busyUs, 0),
    },
  };
}

/** The timing arm, through the exported convenience the landing names. */
export async function timedRun(spec, shards, ticks) {
  const w0 = now();
  const r = await runCluster(spec, { shards, ticks });
  return {
    shards, ticks, seconds: +r.seconds.toFixed(4), ticksPerSec: +(ticks / r.seconds).toFixed(3),
    wallMs: +(now() - w0).toFixed(1),
    runs: r.stats.runs, signals: r.stats.signals, delivered: r.stats.delivered,
    refused: r.stats.refused, errors: r.stats.errors,
    crossEdges: r.stats.crossEdges, crossMessages: r.stats.crossMessages,
    sharedMB: +(r.stats.sharedBytes / 1048576).toFixed(2),
  };
}

// ---------------------------------------------------------------- the runnable subset
/** Drop every cell of a blocked kind and keep the edges whose two ends both survive. */
export function subsetSpec(spec, blockedKinds) {
  const block = new Set(blockedKinds);
  const keep = [], map = new Int32Array(spec.cells.length).fill(-1);
  for (let i = 0; i < spec.cells.length; i++) {
    if (block.has(spec.cells[i].kind)) continue;
    map[i] = keep.length; keep.push(spec.cells[i]);
  }
  const edges = [];
  for (const e of spec.edges) {
    const s = map[e.src], d = map[e.dst];
    if (s < 0 || d < 0) continue;
    edges.push({ ...e, src: s, dst: d });
  }
  const names = new Set(keep.map((c) => c.region || 'default'));
  return {
    ...spec, name: spec.name + '-subset',
    regions: spec.regions.filter((r) => names.has(r.name)),
    cells: keep, edges,
  };
}

/** Where two per cell count vectors disagree, grouped by kind. */
export function divergence(cells, aRuns, aFired, bRuns, bFired) {
  const byKind = new Map();
  let n = 0;
  for (let i = 0; i < cells.length; i++) {
    if (aRuns[i] === bRuns[i] && aFired[i] === bFired[i]) continue;
    n++;
    const k = cells[i].kind;
    let rec = byKind.get(k);
    if (!rec) { rec = { kind: k, cells: 0, refRuns: 0, shardRuns: 0, refFired: 0, shardFired: 0, ids: [] }; byKind.set(k, rec); }
    rec.cells++; rec.refRuns += aRuns[i]; rec.shardRuns += bRuns[i];
    rec.refFired += aFired[i]; rec.shardFired += bFired[i];
    if (rec.ids.length < 4) rec.ids.push(cells[i].id);
  }
  return { cells: n, byKind: [...byKind.values()].sort((x, y) => y.cells - x.cells) };
}

function allSame(rows, field) { return rows.length > 0 && rows.every((r) => r[field] === rows[0][field]); }
function row(o) { console.log(Object.entries(o).map(([k, v]) => k + '=' + v).join(' ')); }

// ---------------------------------------------------------------- main
async function main() {
  const argv = process.argv.slice(2);
  const arg = (name, dflt) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : dflt; };
  const wantMajors = Number(arg('majors', 1000));
  const wantUnits = Number(arg('units', 256));
  const ticks = Number(arg('ticks', 200));
  const shardCounts = String(arg('shards', '1,2,4,8,16')).split(',').map(Number).filter((n) => n > 0);

  console.log('live-shards: node ' + process.version + ' threads ' + availableParallelism()
    + ' asking majors=' + wantMajors + ' units=' + wantUnits + ' ticks=' + ticks + ' shards=' + shardCounts.join(','));

  // 1. the largest size that actually builds. The asked size is tried first; each rung down
  //    is recorded so the verdict says which one ran and what it cost to find out.
  const ladder = [[wantMajors, wantUnits], [500, 256], [250, 128], [100, 64], [32, 64], [8, 64]];
  const attempts = [];
  let built = null;
  for (const [majors, units] of ladder) {
    const t0 = now();
    try {
      const { brain, report } = buildWhole({ majors, substrateUnits: units, ledger: 'off', name: 'live-shards', seed: 'live-shards' });
      const buildMs = now() - t0;
      attempts.push({ majors, units, ok: 1, buildMs: +buildMs.toFixed(1), cells: brain.cells.length, edges: brain.connectome.size() });
      built = { brain, report, majors, units, buildMs };
      break;
    } catch (err) {
      attempts.push({ majors, units, ok: 0, buildMs: +(now() - t0).toFixed(1), error: String((err && err.message) || err) });
      console.log('size majors=' + majors + ' units=' + units + ' DID NOT BUILD: ' + (err && err.message));
    }
  }
  if (!built) throw new Error('no size on the ladder built the whole brain');
  const { brain } = built;
  console.log('size that ran: majors=' + built.majors + ' units=' + built.units
    + ' cells=' + brain.cells.length + ' edges=' + brain.connectome.size()
    + ' buildMs=' + built.buildMs.toFixed(0) + ' rssMB=' + (process.memoryUsage().rss / 1048576).toFixed(0));

  const verdict = {
    at: new Date().toISOString(), node: process.version, threads: availableParallelism(),
    requested: { majors: wantMajors, units: wantUnits, ticks, shardCounts },
    size: {
      majors: built.majors, units: built.units, attempts: attempts.length,
      buildMs: +built.buildMs.toFixed(1), cells: brain.cells.length,
      edges: brain.connectome.size(), liveEdges: brain.connectome.live(),
      regions: brain.regions.size, kinds: new Set(brain.cells.map((c) => c.kind)).size,
      ladder: attempts,
    },
  };

  try {
    // 2. the spec
    let t0 = now();
    const spec = specFromBrain(brain, { modules: [WHOLE_MODULE], name: 'live-shards', seed: 'live-shards', ledger: 'off' });
    verdict.spec = {
      ms: +(now() - t0).toFixed(1), cells: spec.cells.length, edges: spec.edges.length,
      regions: spec.regions.length, modules: spec.modules.length,
      maxPayloadBytes: spec.maxPayloadBytes, pruneEvery: spec.pruneEvery,
    };
    console.log('spec: cells=' + spec.cells.length + ' edges=' + spec.edges.length + ' regions=' + spec.regions.length + ' in ' + verdict.spec.ms + ' ms');

    // 3. the single process reference, in this thread, with every registry present
    const ref = referenceRun(spec, ticks);
    verdict.reference = ref.row;
    row({ arm: 'reference', ...ref.row });

    // 4. the census: the same spec in a bare worker thread, with nothing registered
    t0 = now();
    const cen = await census(spec, ticks);
    const censusMs = now() - t0;
    const div = divergence(spec.cells, ref.runs, ref.fired, cen.runs, cen.fired);
    const kindOfCell = new Map(spec.cells.map((c) => [c.id, c.kind]));
    const errorsByKind = new Map();
    for (const w of cen.why) {
      const kind = kindOfCell.get(w.cell);
      const rec = errorsByKind.get(kind) || { errors: 0, cells: 0, message: w.message };
      rec.errors += w.errors; rec.cells++; errorsByKind.set(kind, rec);
    }
    const blockedKinds = div.byKind.map((k) => k.kind);
    const kindCellCount = new Map();
    for (const c of spec.cells) kindCellCount.set(c.kind, (kindCellCount.get(c.kind) || 0) + 1);
    const cellsOfBlockedKinds = blockedKinds.reduce((a, k) => a + (kindCellCount.get(k) || 0), 0);
    verdict.census = {
      ms: +censusMs.toFixed(1), ticks: cen.ticks, errors: cen.errors,
      cellsWithErrors: cen.why.length,
      cellsDiverged: div.cells, cellsTotal: spec.cells.length,
      kindsBlocked: blockedKinds.length, kindsTotal: verdict.size.kinds,
      cellsOfBlockedKinds, runnableCells: spec.cells.length - cellsOfBlockedKinds,
      runnableFraction: +((spec.cells.length - cellsOfBlockedKinds) / spec.cells.length).toFixed(6),
      kinds: div.byKind.map((k) => ({
        kind: k.kind, cellsOfKind: kindCellCount.get(k.kind) || 0, cellsDiverged: k.cells,
        errorsInWorker: (errorsByKind.get(k.kind) || { errors: 0 }).errors,
        refRuns: k.refRuns, shardRuns: k.shardRuns, refFired: k.refFired, shardFired: k.shardFired,
        ids: k.ids,
        reason: (errorsByKind.get(k.kind) || { message: 'no cell.error event: the cell never ran in the worker' }).message,
      })),
    };
    console.log('census: ' + div.cells + ' of ' + spec.cells.length + ' cells diverge in a bare worker, over '
      + blockedKinds.length + ' kinds, ' + cen.errors + ' cell errors');
    for (const k of verdict.census.kinds) {
      console.log('  BLOCKED ' + k.kind + ' cells=' + k.cellsOfKind + ' diverged=' + k.cellsDiverged
        + ' errors=' + k.errorsInWorker + ' reason: ' + k.reason);
    }

    // 5. the whole brain across shard counts: identity first, then the timing arm
    const wholeIdentity = [], wholeTiming = [], cmp = [];
    for (const s of shardCounts) {
      const r = await identityRun(spec, s, ticks);
      wholeIdentity.push(r.row);
      cmp.push({ shards: s, ...divergence(spec.cells, ref.runs, ref.fired, r.runs, r.fired) });
      row({ arm: 'whole-identity', ...r.row });
    }
    for (const s of shardCounts) {
      const r = await timedRun(spec, s, ticks);
      r.speedup = +(wholeTiming.length ? wholeTiming[0].seconds / r.seconds : 1).toFixed(3);
      r.speedupOverOneProcess = +(ref.row.seconds / r.seconds).toFixed(3);
      wholeTiming.push(r);
      row({ arm: 'whole-timing', ...r });
    }
    verdict.whole = {
      shardLedger: 'off', coordinatorLedger: 'full',
      identity: wholeIdentity, timing: wholeTiming,
      firedHashSame: allSame(wholeIdentity, 'firedHash') ? 1 : 0,
      countsHashSame: allSame(wholeIdentity, 'countsHash') ? 1 : 0,
      ledgerHashSame: allSame(wholeIdentity, 'ledgerHash') ? 1 : 0,
      runsSame: allSame(wholeIdentity, 'runs') ? 1 : 0,
      signalsSame: allSame(wholeIdentity, 'signals') ? 1 : 0,
      deliveredSame: allSame(wholeIdentity, 'delivered') ? 1 : 0,
      errorsSame: allSame(wholeIdentity, 'errors') ? 1 : 0,
      firedHash: wholeIdentity[0].firedHash, countsHash: wholeIdentity[0].countsHash,
      ledgerHash: wholeIdentity[0].ledgerHash, ledgerEvents: wholeIdentity[0].ledgerEvents,
      ledgerTickEvents: wholeIdentity[0].ledgerEvents - (spec.cells.length + spec.edges.length + verdict.spec.regions),
      firedHashMatchesOneProcess: wholeIdentity[0].firedHash === ref.row.firedHash ? 1 : 0,
      cellsDivergingFromOneProcess: cmp.map((c) => ({ shards: c.shards, cells: c.cells })),
      bestTicksPerSec: Math.max(...wholeTiming.map((r) => r.ticksPerSec)),
      bestSpeedup: Math.max(...wholeTiming.map((r) => r.speedup)),
    };

    // 6. the largest runnable subset: the whole brain minus every blocked kind
    const sub = subsetSpec(spec, blockedKinds);
    const subRef = referenceRun(sub, ticks);
    row({ arm: 'subset-reference', ...subRef.row });
    const subIdentity = [], subCmp = [];
    for (const s of shardCounts) {
      const r = await identityRun(sub, s, ticks);
      subIdentity.push(r.row);
      subCmp.push({ shards: s, ...divergence(sub.cells, subRef.runs, subRef.fired, r.runs, r.fired) });
      row({ arm: 'subset-identity', ...r.row });
    }
    for (const r of subIdentity) r.speedup = +(subIdentity[0].seconds / r.seconds).toFixed(3);
    verdict.subset = {
      cells: sub.cells.length, edges: sub.edges.length, regions: sub.regions.length,
      droppedCells: spec.cells.length - sub.cells.length, droppedEdges: spec.edges.length - sub.edges.length,
      droppedKinds: blockedKinds.length,
      reference: subRef.row, identity: subIdentity,
      firedHashSame: allSame(subIdentity, 'firedHash') ? 1 : 0,
      countsHashSame: allSame(subIdentity, 'countsHash') ? 1 : 0,
      ledgerHashSame: allSame(subIdentity, 'ledgerHash') ? 1 : 0,
      firedHash: subIdentity[0].firedHash, countsHash: subIdentity[0].countsHash,
      firedHashMatchesOneProcess: subIdentity[0].firedHash === subRef.row.firedHash ? 1 : 0,
      countsHashMatchesOneProcess: subIdentity[0].countsHash === subRef.row.countsHash ? 1 : 0,
      cellsDivergingFromOneProcess: subCmp.map((c) => ({ shards: c.shards, cells: c.cells })),
      errorsInShards: subIdentity[0].errors,
      bestTicksPerSec: Math.max(...subIdentity.map((r) => r.ticksPerSec)),
      bestSpeedup: Math.max(...subIdentity.map((r) => r.speedup)),
    };

    verdict.headline = {
      cells: spec.cells.length, edges: spec.edges.length, ticks,
      oneProcessTicksPerSec: ref.row.ticksPerSec,
      oneShardTicksPerSec: wholeTiming[0].ticksPerSec,
      bestShards: wholeTiming.reduce((a, b) => (b.ticksPerSec > a.ticksPerSec ? b : a)).shards,
      bestTicksPerSec: verdict.whole.bestTicksPerSec,
      bestSpeedupOverOneShard: verdict.whole.bestSpeedup,
      identicalAcrossShardCounts: verdict.whole.firedHashSame && verdict.whole.countsHashSame && verdict.whole.ledgerHashSame ? 1 : 0,
      kindsThatCannotShard: blockedKinds.length,
      cellsThatCannotShard: cellsOfBlockedKinds,
      runnableCells: verdict.census.runnableCells,
      runnableFraction: verdict.census.runnableFraction,
      subsetMatchesOneProcess: verdict.subset.firedHashMatchesOneProcess && verdict.subset.countsHashMatchesOneProcess ? 1 : 0,
      subsetIdenticalAcrossShardCounts: verdict.subset.firedHashSame && verdict.subset.countsHashSame ? 1 : 0,
    };
    console.log('HEADLINE ' + JSON.stringify(verdict.headline));
  } finally {
    // The write is NOT the last statement of the happy path: a run that throws half way
    // still leaves the verdict it managed to measure on disk, with the fields it reached.
    mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
    const file = path.join(HERE, 'verdicts', 'live-shards.json');
    writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
    console.log('wrote ' + file);
    try { closeWorld(brain); } catch { /* nothing open */ }
    const learning = brain.whole && brain.whole.services && brain.whole.services.learning;
    if (learning && typeof learning.detach === 'function') { try { learning.detach(); } catch { /* already detached */ } }
  }
}

// Called, never awaited at the top level: a shard that imports this module would otherwise
// deadlock on an unsettled top level await (the trap bench/parallel.mjs records).
const invoked = isMainThread && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) main().catch((e) => { console.error(e); process.exitCode = 1; });
