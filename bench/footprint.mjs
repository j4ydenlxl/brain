// bench/footprint.mjs: AN AI DATACENTER IN YOUR POCKET NEEDS A FOOTPRINT NUMBER.
//
// Modelled on bench/whole.mjs (buildWhole from seeds/whole.mjs): for each --majors value it
// builds the whole brain, ticks it, checkpoints it exactly the way core/brain.mjs writes
// state/<name>/snapshot.json, restores that checkpoint into a fresh brain, and reads the
// browser build sizes off disk. Every row runs in its OWN child process (node itself,
// re-invoking this file with --child-row): a brain built earlier in the same process leaves
// a mind model and a skill registry behind in module level maps that a later build never
// frees, so an in-process loop would measure each later row's memory on top of every row
// before it. A fresh process per row measures only that row.
//
// Three columns were added on 2026-09-18, when the RSS still standing turned out to be the
// hypervector heap holding slots nobody returned: hvPlan (what SIMD.plan sized the heap to for
// that organism), hvSites (which owners the allocations belong to, one extra run under
// BRAIN_HV_HEAP_SITES=1) and hvHeapAfterTurn, which forces a collection and takes the event
// loop turns the FinalizationRegistry needs AFTER every other figure in the row is captured,
// so the share of the heap that was garbage all along is measured and not argued.
//
// Two columns were added on 2026-09-17, after the first run measured a fixed cost of about
// 600 MB RSS at build at every organism size: a PROBE column (tools/footprint-probe.mjs, one
// module per process, so the floor can be attributed to a module) and a BEFORE AND AFTER on
// the smallest row, run as two interleaved arms in this same process rather than quoted from
// an older verdict. --no-probe and --no-arms leave both out.
//
//   node bench/footprint.mjs [--majors 12,100,1000] [--units 256] [--ticks 200]
//                            [--extra-majors 12] [--extra-units 100000] [--extra-budget-ms 60000]
//                            [--probe-repeat 3] [--arm-repeat 2] [--no-probe] [--no-arms]
import { writeFileSync, mkdirSync, rmSync, statSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SELF = fileURLToPath(import.meta.url);
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const has = (k) => args.includes('--' + k);
// A test (or anything else) may import this file only for the constants below: the sweep
// and the child row both stay inert unless this file is the one node was told to run.
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

const mb = (b) => Number((b / 1048576).toFixed(1));
const bytesToMB = (b) => Number((b / 1048576).toFixed(3));
const now = () => Number(process.hrtime.bigint()) / 1e6;

// ---------------------------------------------------------------- declared pocket budgets
// These three numbers are authored engineering targets for a phone class device, never
// measurements: the verdict marks every one of them as "declared", and every figure they are
// compared against comes from this bench's own measurement in the same run.
export const POCKET_RSS_MB = 512;         // budget: a phone app's typical whole-process memory ceiling
export const POCKET_CHECKPOINT_MB = 50;   // budget: a checkpoint small enough to sync over mobile data without friction
export const POCKET_TICKS_PER_SEC = 5;    // budget: fast enough on device to feel responsive (one tick per 200 ms or better)
export const POCKET_BUDGETS = Object.freeze({
  rssMB: { value: POCKET_RSS_MB, declared: true, meaning: 'process RSS after 200 ticks must sit at or under this many MB' },
  checkpointMB: { value: POCKET_CHECKPOINT_MB, declared: true, meaning: 'the snapshot.json checkpoint must sit at or under this many MB' },
  ticksPerSec: { value: POCKET_TICKS_PER_SEC, declared: true, meaning: 'ticks per second over the measured run must sit at or above this rate' },
});

// ================================================================== child mode
// One row, measured in a brand new process, printing exactly one JSON line to stdout and
// nothing else (the parent parses that line; every console.log below writes to stderr so it
// stays out of the parent's way while still showing up when this file is run alone).
async function runChildRow() {
  const { buildWhole, restoreWhole } = await import('../seeds/whole.mjs');
  const { closeWorld } = await import('../world/index.mjs');
  const majors = Number(opt('majors', 12));
  const substrateUnits = Number(opt('units', 256));
  const ticks = Number(opt('ticks', 200));
  const label = String(opt('label', String(majors)));
  // the seed is separate from the label: two arms of the same comparison write different
  // scratch dirs but must build the SAME organism, or the arms differ by the brain, not by
  // the change under test
  const seed = String(opt('seed', 'footprint-' + label));

  const shutdown = (brain) => {
    try { closeWorld(brain); } catch { /* nothing open */ }
    const learning = brain.whole && brain.whole.services && brain.whole.services.learning;
    if (learning && typeof learning.detach === 'function') { try { learning.detach(); } catch { /* already detached */ } }
  };

  const dir = path.join(ROOT, 'state', 'footprint-' + label);
  let brain = null, restored = null;
  const rowT0 = now();
  try {
    rmSync(dir, { recursive: true, force: true });
    const memBefore = process.memoryUsage();
    const t0 = now();
    const built = buildWhole({ majors, substrateUnits, ledger: 'off', name: 'footprint-' + label, seed });
    brain = built.brain;
    const buildMs = now() - t0;
    const memBuilt = process.memoryUsage();

    const t1 = now();
    brain.tick(ticks);
    const tickMs = now() - t1;
    const memAfter = process.memoryUsage();
    const ticksPerSec = ticks / (tickMs / 1000);

    // checkpoint bytes: brain.snapshot(dir) is the exact call core/brain.mjs's own
    // persistence path uses to write state/<name>/snapshot.json
    const snapFile = brain.snapshot(dir);
    const checkpointBytes = statSync(snapFile).size;

    const t2 = now();
    const restoredResult = restoreWhole(dir, { ledger: 'off' });
    restored = restoredResult.brain;
    const restoreMs = now() - t2;

    const rssAfterMB = mb(memAfter.rss);
    const checkpointMB = bytesToMB(checkpointBytes);

    // The hypervector heap counters, read LAST, after every figure above is already captured.
    // The claim this bench's note rests on (the RSS that is left is a heap full of slots nobody
    // returned) was published from a separate command whose output no verdict carried, so the
    // row that builds the brain now records the counters itself. Reading them cannot move a
    // number above it, and heapStats() installing the heap in a process that never used it
    // would only happen after the last measurement was taken.
    let hvHeap, hvHeapAfterTurn, hvSites = null, hvOwnership = null, hvGarbageByRoute = null;
    try {
      const SIMD = await import('../core/simd.mjs');
      hvHeap = SIMD.heapStats();
      hvSites = SIMD.heapSites(12);
      // PER SITE, live against garbage. heapOwnership() reads the slot column, so the same
      // call made before the collection and after it splits every site's slots into the ones
      // something still holds and the ones nobody did. Empty unless BRAIN_HV_HEAP_SITES=1.
      const ownBefore = SIMD.heapOwnership(32);
      // WHY the slots never came back, measured rather than argued: force a collection and
      // give the event loop the turns the FinalizationRegistry needs, then read the counters
      // again. What comes back is what was garbage all along and the run could not see. This
      // is the LAST thing the row does: every figure above is already captured.
      const v8 = await import('node:v8'); const vm = await import('node:vm');
      v8.default.setFlagsFromString('--expose-gc');
      const gc = vm.default.runInNewContext('gc');
      const before = hvHeap.inUse;
      for (let i = 0; i < 14; i++) { gc(); await new Promise((r) => setTimeout(r, 5)); }
      const after = SIMD.heapStats();
      hvHeapAfterTurn = {
        inUseBefore: before, inUseAfter: after.inUse, reclaimed: after.reclaimed, released: after.released,
        garbage: before - after.inUse,
        garbagePct: before ? +(100 * (before - after.inUse) / before).toFixed(2) : 0,
        finalizerCallsDuringRun: hvHeap.finalizerCalls,
      };
      if (ownBefore.length) {
        const after = new Map(SIMD.heapOwnership(32).map((r) => [r.site, r]));
        hvOwnership = ownBefore.map((r) => {
          const a = after.get(r.site) || { live: 0, liveRouted: 0 };
          // WHERE a site's garbage went, which decides who can release it: a slot that left the
          // site as the payload of a scheduled signal is the router's to return when the last
          // mailbox consumes it; a slot that never left is held where it was put (a cell state,
          // a memory row) and can only be returned there.
          const garbage = r.live - a.live, asPayload = r.liveRouted - a.liveRouted;
          return {
            site: r.site, attempts: r.attempts, liveAtEnd: r.live, liveAfterTurn: a.live, garbage,
            routedAtEnd: r.liveRouted, routedAfterTurn: a.liveRouted,
            garbageAsPayload: asPayload, garbageHeld: garbage - asPayload,
          };
        }).filter((r) => r.liveAtEnd > 0 || r.garbage > 0).sort((a, b) => b.garbage - a.garbage || b.liveAfterTurn - a.liveAfterTurn);
        const rows = hvOwnership.filter((r) => r.garbage > 0);
        hvGarbageByRoute = {
          rows: rows.map((r) => ({ site: r.site, garbage: r.garbage, asPayload: r.garbageAsPayload, held: r.garbageHeld })),
          totals: {
            garbage: rows.reduce((s, r) => s + r.garbage, 0),
            asPayload: rows.reduce((s, r) => s + r.garbageAsPayload, 0),
            held: rows.reduce((s, r) => s + r.garbageHeld, 0),
          },
        };
      }
    } catch (e) { hvHeap = hvHeap || { error: String((e && e.message) || e) }; hvHeapAfterTurn = { error: String((e && e.message) || e) }; }
    const result = {
      ok: true, majors, substrateUnits, label, rowMs: Number((now() - rowT0).toFixed(1)),
      buildMs: Number(buildMs.toFixed(1)),
      memoryMB: {
        rssBefore: mb(memBefore.rss), rssBuilt: mb(memBuilt.rss), rssAfter: rssAfterMB,
        heapBuilt: mb(memBuilt.heapUsed), heapAfter: mb(memAfter.heapUsed),
        arrayBuffersBuilt: mb(memBuilt.arrayBuffers), arrayBuffersAfter: mb(memAfter.arrayBuffers),
      },
      ticks, tickMs: Number(tickMs.toFixed(1)), ticksPerSec: Number(ticksPerSec.toFixed(3)),
      checkpointBytes, checkpointMB,
      restoreMs: Number(restoreMs.toFixed(1)),
      hvHeap, hvHeapAfterTurn, hvSites, hvOwnership, hvGarbageByRoute, hvPlan: (built.report && built.report.hvPlan) || null,
      fitsPocketBudget: {
        rssMB: rssAfterMB <= POCKET_RSS_MB,
        checkpointMB: checkpointMB <= POCKET_CHECKPOINT_MB,
        ticksPerSec: ticksPerSec >= POCKET_TICKS_PER_SEC,
      },
    };
    process.stdout.write(JSON.stringify(result) + '\n');
  } finally {
    if (restored) shutdown(restored);
    if (brain) shutdown(brain);
    rmSync(dir, { recursive: true, force: true });
  }
}

if (isMain && has('child-row')) {
  await runChildRow();
  process.exit(0);
}

// ================================================================== the note check
// notes/footprint.md publishes this bench's numbers, and until now nothing tied the two
// together: tools/docs-numbers.mjs reads its document set off docs/, so a note under notes/
// was outside every run of it and the note's figures could drift away from the verdict they
// cite without anything saying so. This file writes that verdict, so this file is where the
// tie belongs. It reads the verdicts on disk, measures nothing, and is cheap.
export async function checkNote() {
  const { checkDoc, knownValues } = await import('../tools/docs-numbers.mjs');
  const r = checkDoc(path.join(ROOT, 'notes', 'footprint.md'), knownValues());
  console.log('note notes/footprint.md against bench/verdicts: protected=' + r.protected + ' (weak ' + r.weakProtected + ') unprotected=' + r.unprotected + ' skipped=' + r.skipped);
  for (const m of r.misses) console.log('  line ' + m.line + ': ' + m.value + '  |  ' + m.text);
  return r;
}

// --check-note runs that check ALONE, with no measurement, and makes it the exit code. It is
// a separate mode rather than a gate on the full run because a fresh measurement legitimately
// moves numbers before the note has been updated with them: a run that measured correctly
// must not exit 1 for a note nobody has written yet.
if (isMain && has('check-note')) {
  const r = await checkNote();
  process.exit(r.unprotected > 0 ? 1 : 0);
}

// ================================================================== parent mode
if (isMain) {
const majorsList = String(opt('majors', '12,100,1000')).split(',').map(Number);
const units = Number(opt('units', 256));
const ticks = Number(opt('ticks', 200));
const extraMajors = Number(opt('extra-majors', 12));
const extraUnits = Number(opt('extra-units', 100_000));
const extraBudgetMs = Number(opt('extra-budget-ms', 60_000));

// Spawns node on this same file with --child-row, waits for it, and parses the one JSON
// line it printed. `timeoutMs` (when given) makes spawnSync kill the child if it overruns:
// a real enforcement of the budget, not an after-the-fact time comparison.
function spawnRow(majors, substrateUnits, label, timeoutMs, env, seed) {
  const rowArgs = [SELF, '--child-row', '--majors', String(majors), '--units', String(substrateUnits), '--ticks', String(ticks), '--label', label];
  if (seed) rowArgs.push('--seed', seed);
  const t0 = now();
  const opts = { encoding: 'utf8', cwd: ROOT, maxBuffer: 1024 * 1024 * 64 };
  if (env) opts.env = { ...process.env, ...env };
  if (timeoutMs) opts.timeout = timeoutMs;
  const res = spawnSync(process.execPath, rowArgs, opts);
  const wallMs = Number((now() - t0).toFixed(1));
  if (res.error && res.error.code === 'ETIMEDOUT') {
    return { ok: false, majors, substrateUnits, label, wallMs, reason: 'killed after ' + wallMs + ' ms, over the ' + timeoutMs + ' ms budget (spawnSync timeout)' };
  }
  if (res.status !== 0) {
    return { ok: false, majors, substrateUnits, label, wallMs, reason: 'child exited ' + res.status + ': ' + String(res.stderr || '').slice(-2000) };
  }
  const line = String(res.stdout || '').trim().split('\n').filter(Boolean).pop();
  if (!line) return { ok: false, majors, substrateUnits, label, wallMs, reason: 'no JSON line on stdout' };
  let row;
  try { row = JSON.parse(line); } catch (e) { return { ok: false, majors, substrateUnits, label, wallMs, reason: 'bad JSON: ' + e.message }; }
  row.wallMs = wallMs;
  return row;
}

function printRow(r) {
  if (!r.ok) { console.log('majors ' + r.majors + ' units ' + r.substrateUnits + ': NO, ' + r.reason); return; }
  console.log(
    'majors ' + r.majors + ' units ' + r.substrateUnits + ': build ' + r.buildMs + ' ms, rss ' + r.memoryMB.rssBuilt +
    ' MB built / ' + r.memoryMB.rssAfter + ' MB after ' + r.ticks + ' ticks, heap ' + r.memoryMB.heapAfter + ' MB, arrayBuffers ' +
    r.memoryMB.arrayBuffersAfter + ' MB, ' + r.ticksPerSec + ' ticks/s, checkpoint ' + r.checkpointBytes + ' bytes (' + r.checkpointMB +
    ' MB), restore ' + r.restoreMs + ' ms, fits pocket budget: rss ' + r.fitsPocketBudget.rssMB + ', checkpoint ' +
    r.fitsPocketBudget.checkpointMB + ', ticks/s ' + r.fitsPocketBudget.ticksPerSec
  );
  const h = r.hvHeap;
  if (h && !h.error) {
    console.log('  hypervector heap at the end of that row: inUse ' + h.inUse + ' of ' + h.slots + ' slots, peak ' + h.peak + ', allocs ' + h.allocs +
      ', reclaimed ' + h.reclaimed + ', released ' + h.released + ', fallbacks ' + h.fallbacks + ' (' + h.fallbackPct + '%), full ' + h.full + ', heapMB ' + h.heapMB +
      ', finalizerCalls ' + h.finalizerCalls);
  }
  if (r.hvPlan) console.log('  heap plan: ' + (r.hvPlan.applied ? 'applied ' + r.hvPlan.slots + ' slots (' + r.hvPlan.wouldBeMB + ' MB) for ' + r.hvPlan.majors + ' majors, ' + r.hvPlan.units + ' units' : 'not applied (' + r.hvPlan.reason + '), ' + r.hvPlan.slots + ' slots'));
  const g = r.hvHeapAfterTurn;
  if (g && !g.error) {
    console.log('  why the slots did not come back: ' + g.finalizerCallsDuringRun + ' finalizer calls during the whole row; after a forced collection and event loop turns, inUse ' +
      g.inUseBefore + ' -> ' + g.inUseAfter + ', so ' + g.garbage + ' of them (' + g.garbagePct + '%) were garbage the run could not see');
  }
  if (r.hvSites && r.hvSites.length) {
    console.log('  allocation sites (BRAIN_HV_HEAP_SITES=1), descending:');
    for (const [where, n] of r.hvSites) console.log('    ' + n + '  ' + where);
  }
  if (r.hvOwnership && r.hvOwnership.length) {
    console.log('  ownership per site (attempts, slots still in use at the end, still in use after the collection and turn, garbage):');
    for (const o of r.hvOwnership) console.log('    ' + o.attempts + '  ' + o.liveAtEnd + '  ' + o.liveAfterTurn + '  ' + o.garbage + '  ' + o.site);
  }
  if (r.hvGarbageByRoute && r.hvGarbageByRoute.rows.length) {
    const t = r.hvGarbageByRoute.totals;
    console.log('  garbage by route (garbage, of it left as a signal payload, of it held in cell state or a memory row):');
    for (const o of r.hvGarbageByRoute.rows) console.log('    ' + o.garbage + '  ' + o.asPayload + '  ' + o.held + '  ' + o.site);
    console.log('    ' + t.garbage + '  ' + t.asPayload + '  ' + t.held + '  TOTAL');
  }
}

// ---------------------------------------------------------------- run the sweep
const rows = [];
for (const majors of majorsList) {
  const label = String(majors);
  const r = spawnRow(majors, units, label, 10 * 60_000); // 10 minutes: generous, never the budget under test
  rows.push(r);
  printRow(r);
}

// the optional extra row: 100,000 substrate units at 12 majors, kept only if this single
// row finishes inside extraBudgetMs. spawnSync's own timeout enforces the budget: if the
// child overruns it is killed and the row is recorded as a measured no, not a guess.
const extraLabel = extraMajors + '-units' + extraUnits;
const extraMeasured = spawnRow(extraMajors, extraUnits, extraLabel, extraBudgetMs);
const extraKept = extraMeasured.ok && extraMeasured.wallMs <= extraBudgetMs;
const extraRow = { ...extraMeasured, budgetMs: extraBudgetMs, kept: extraKept };
if (extraKept) {
  console.log('extra row (majors ' + extraMajors + ', units ' + extraUnits + ') finished in ' + extraMeasured.wallMs + ' ms, under the ' + extraBudgetMs + ' ms budget: kept');
  printRow(extraMeasured);
} else {
  console.log('extra row (majors ' + extraMajors + ', units ' + extraUnits + ') did not finish under the ' + extraBudgetMs + ' ms budget: a measured no, recorded but not counted among the kept rows (' + (extraRow.reason || ('wall ' + extraRow.wallMs + ' ms')) + ')');
}

// ---------------------------------------------------------------- the probe column
// Where the fixed cost sits, module by module: tools/footprint-probe.mjs imports one module
// at a time in a process of its own. The table below is the probe's answer for the whole
// import graph of bin/brain.mjs; `changed` is the before and after of the two modules whose
// eager work was deferred, measured HERE, in this run, by running the arms interleaved
// against each other rather than against an older verdict file.
//   eager: BRAIN_HV_HEAP_EAGER=1 BRAIN_FHRR_CAL_EAGER=1, the behaviour before this change
//   lazy:  the default, the behaviour after it
const EAGER_ENV = { BRAIN_HV_HEAP_EAGER: '1', BRAIN_FHRR_CAL_EAGER: '1' };
const LAZY_ENV = { BRAIN_HV_HEAP_EAGER: '0', BRAIN_FHRR_CAL_EAGER: '0' };
const probeRepeat = Number(opt('probe-repeat', 3));
let probe = null;
if (!has('no-probe')) {
  const { probeTable, probeArms } = await import('../tools/footprint-probe.mjs');
  const table = probeTable({ repeat: 1, env: LAZY_ENV });
  const changedIds = ['core/simd.mjs', 'cells/fhrr.mjs', 'cells/index.mjs', 'cells/all.mjs', 'seeds/whole.mjs'];
  const arms = probeArms(changedIds, { eager: EAGER_ENV, lazy: LAZY_ENV }, { repeat: probeRepeat });
  const changed = changedIds.map((id, i) => {
    const e = arms.eager[i], l = arms.lazy[i];
    if (e.error || l.error) return { id, error: e.error || l.error };
    return {
      id,
      rssBeforeMB: e.rssDelta, rssAfterMB: l.rssDelta, rssSavedMB: Number((e.rssDelta - l.rssDelta).toFixed(1)),
      externalBeforeMB: e.externalDelta, externalAfterMB: l.externalDelta,
      importMsBefore: e.importMs, importMsAfter: l.importMs,
      runs: Math.min(e.runs, l.runs),
    };
  });
  probe = { ...table, interleaved: true, armRepeat: probeRepeat, arms: { eager: 'BRAIN_HV_HEAP_EAGER=1 BRAIN_FHRR_CAL_EAGER=1', lazy: 'the default' }, changed };
  const top = [...table.rows].filter((r) => !r.error).sort((a, b) => b.rssDelta - a.rssDelta).slice(0, 5);
  console.log('probe: ' + table.modules + ' modules, heaviest import ' + top.map((r) => r.id + ' ' + r.rssDelta + ' MB').join(', '));
  for (const c of changed) {
    if (c.error) { console.log('probe arm ' + c.id + ': NO, ' + c.error); continue; }
    console.log('probe arm ' + c.id + ': import rss ' + c.rssBeforeMB + ' MB eager -> ' + c.rssAfterMB + ' MB lazy (saved ' + c.rssSavedMB + ' MB), external ' + c.externalBeforeMB + ' -> ' + c.externalAfterMB + ' MB, ' + c.importMsBefore + ' -> ' + c.importMsAfter + ' ms, ' + c.runs + ' runs each');
  }
}

// ---------------------------------------------------------------- the smallest row, both arms
// The contract's before and after: the smallest organism this bench builds, run once under
// each arm per repeat, the arms INTERLEAVED so drift on this machine moves both.
let smallestArms = null;
if (!has('no-arms')) {
  const smallest = Math.min(...majorsList);
  const armRepeat = Number(opt('arm-repeat', 2));
  const armSeed = 'footprint-' + smallest; // every arm builds the organism the headline row builds
  // The change under test is the heap PLAN: core/simd.mjs sized itself to a flat 512 MB in the
  // main thread whatever was about to be built, and now seeds/whole.mjs calls SIMD.plan() with
  // the organism before the first allocation.
  //   flat512 (before): BRAIN_HV_HEAP_MB=512, the size that module chose on its own
  //   planned (after):  the default, the size plan() chooses for this organism
  //   heapOff:          BRAIN_HV_HEAP_MB=0, how much of what is left the heap holds. Its
  //                     ticks/s is the floor the planned arm must not fall below, because
  //                     every kernel call in it falls back to a plain array.
  const runs = { flat512: [], planned: [], heapOff: [] };
  for (let r = 0; r < armRepeat; r++) {
    runs.flat512.push(spawnRow(smallest, units, 'arm-flat512-' + r, 10 * 60_000, { ...LAZY_ENV, BRAIN_HV_HEAP_MB: '512' }, armSeed));
    runs.planned.push(spawnRow(smallest, units, 'arm-planned-' + r, 10 * 60_000, LAZY_ENV, armSeed));
    runs.heapOff.push(spawnRow(smallest, units, 'arm-heapoff-' + r, 10 * 60_000, { ...LAZY_ENV, BRAIN_HV_HEAP_MB: '0' }, armSeed));
  }
  const pick = (list) => {
    const ok = list.filter((x) => x.ok);
    if (!ok.length) return null;
    ok.sort((a, b) => a.memoryMB.rssAfter - b.memoryMB.rssAfter);
    return ok[Math.floor(ok.length / 2)];
  };
  const armOf = (row, err) => row
    ? { rssBuiltMB: row.memoryMB.rssBuilt, rssAfterMB: row.memoryMB.rssAfter, heapAfterMB: row.memoryMB.heapAfter, arrayBuffersAfterMB: row.memoryMB.arrayBuffersAfter, buildMs: row.buildMs, ticksPerSec: row.ticksPerSec, checkpointBytes: row.checkpointBytes, hvHeap: row.hvHeap, hvHeapAfterTurn: row.hvHeapAfterTurn, hvPlan: row.hvPlan }
    : { error: err };
  const e = pick(runs.flat512), l = pick(runs.planned), z = pick(runs.heapOff);
  // one extra run, not repeated, that names WHICH owners the allocations belong to. The stack
  // per allocation is far too expensive to leave on, so it is its own run and its rss and
  // ticks/s are not comparable to the arms above.
  const sitesRow = spawnRow(smallest, units, 'arm-sites', 10 * 60_000, { ...LAZY_ENV, BRAIN_HV_HEAP_SITES: '1' }, armSeed);
  printRow(sitesRow); // the sites row prints its own ownership table, which no other row can
  smallestArms = {
    majors: smallest, substrateUnits: units, ticks, armRepeat, interleaved: true, seed: armSeed,
    arms: {
      flat512: 'BRAIN_HV_HEAP_MB=512, the flat size core/simd.mjs chose on its own before the plan hook',
      planned: 'the default, the size SIMD.plan() chooses for this organism',
      heapOff: 'BRAIN_HV_HEAP_MB=0, how much of what is left the hypervector heap holds',
    },
    before: armOf(e, 'no flat512 run finished'),
    after: armOf(l, 'no planned run finished'),
    heapOff: armOf(z, 'no heapOff run finished'),
    sites: sitesRow.ok ? {
      allocationSites: sitesRow.hvSites, hvHeap: sitesRow.hvHeap,
      // per site, live against garbage: the reading a release at cause needs, because a site
      // whose slots survive the collection owns vectors something still holds
      ownership: sitesRow.hvOwnership, ownershipAfterTurn: sitesRow.hvHeapAfterTurn,
      // the same garbage, split by where it went: what left the site as a signal payload (the
      // router releases it) against what is held in a cell state or a memory row (only the
      // holder can). The two halves need different fixes, so they are counted apart.
      garbageByRoute: sitesRow.hvGarbageByRoute,
      note: 'BRAIN_HV_HEAP_SITES=1, one run, not comparable on time',
    } : { error: sitesRow.reason },
    // every round of every arm, so a difference between the medians can be read against the
    // width of each arm's own spread instead of being quoted as if it were exact
    // the same peak reading the larger rows carry, for the size core/simd.mjs's plan floor
    // is set against
    flat512Peak: flat512Peak(runs.flat512.filter((x) => x.ok)),
    rssAfterRunsMB: Object.fromEntries(Object.entries(runs).map(([k, list]) => [k, list.filter((x) => x.ok).map((x) => x.memoryMB.rssAfter)])),
    ticksPerSecRuns: Object.fromEntries(Object.entries(runs).map(([k, list]) => [k, list.filter((x) => x.ok).map((x) => x.ticksPerSec)])),
    fallbackPctRuns: Object.fromEntries(Object.entries(runs).map(([k, list]) => [k, list.filter((x) => x.ok && x.hvHeap && !x.hvHeap.error).map((x) => x.hvHeap.fallbackPct)])),
  };
  if (e && l) {
    smallestArms.rssBuiltSavedMB = Number((e.memoryMB.rssBuilt - l.memoryMB.rssBuilt).toFixed(1));
    smallestArms.rssAfterSavedMB = Number((e.memoryMB.rssAfter - l.memoryMB.rssAfter).toFixed(1));
    smallestArms.missesPocketRssByMB = Number((l.memoryMB.rssAfter - POCKET_RSS_MB).toFixed(1));
    smallestArms.fallbackPctBeforeAfter = [e.hvHeap && e.hvHeap.fallbackPct, l.hvHeap && l.hvHeap.fallbackPct];
    console.log('smallest row (' + smallest + ' majors), ' + armRepeat + ' interleaved rounds, flat512 -> planned: rss built ' + e.memoryMB.rssBuilt + ' -> ' + l.memoryMB.rssBuilt + ' MB, rss after ' + ticks + ' ticks ' + e.memoryMB.rssAfter + ' -> ' + l.memoryMB.rssAfter + ' MB, checkpoint ' + e.checkpointBytes + ' -> ' + l.checkpointBytes + ' bytes, ticks/s ' + e.ticksPerSec + ' -> ' + l.ticksPerSec + ', slots ' + e.hvHeap.slots + ' -> ' + l.hvHeap.slots + ', fallbackPct ' + e.hvHeap.fallbackPct + ' -> ' + l.hvHeap.fallbackPct);
    console.log('smallest row rss after ' + ticks + ' ticks, every round: ' + JSON.stringify(smallestArms.rssAfterRunsMB));
    console.log('smallest row ticks/s, every round: ' + JSON.stringify(smallestArms.ticksPerSecRuns));
    console.log('smallest row fallbackPct, every round: ' + JSON.stringify(smallestArms.fallbackPctRuns));
    console.log('smallest row against the ' + POCKET_RSS_MB + ' MB pocket budget: ' + (smallestArms.missesPocketRssByMB <= 0 ? 'met, ' + (-smallestArms.missesPocketRssByMB) + ' MB under' : 'MISSED by ' + smallestArms.missesPocketRssByMB + ' MB'));
  } else {
    console.log('smallest row arms: NO, ' + JSON.stringify(smallestArms));
  }
  if (l && z) {
    smallestArms.hvHeapHoldsMB = Number((l.memoryMB.rssAfter - z.memoryMB.rssAfter).toFixed(1));
    smallestArms.withoutHvHeapFitsPocketRss = z.memoryMB.rssAfter <= POCKET_RSS_MB;
    console.log('smallest row with core/simd.mjs hypervector heap sized to 0: rss after ' + ticks + ' ticks ' + z.memoryMB.rssAfter + ' MB (the heap holds ' + smallestArms.hvHeapHoldsMB + ' MB of the ' + l.memoryMB.rssAfter + ' MB), fits the ' + POCKET_RSS_MB + ' MB budget: ' + smallestArms.withoutHvHeapFitsPocketRss + ', ticks/s ' + z.ticksPerSec + ' (not comparable: every kernel falls back)');
    // the tick rate bar: the planned arm may not be slower than the heapOff arm by more than
    // the width the repeats themselves show, so the heap is never paying for itself in time
    const spreadOf = (list) => (list.length < 2 ? 0 : Number((Math.max(...list) - Math.min(...list)).toFixed(3)));
    const zSpread = spreadOf(smallestArms.ticksPerSecRuns.heapOff || []);
    smallestArms.tickRateBar = {
      plannedTicksPerSec: l.ticksPerSec, heapOffTicksPerSec: z.ticksPerSec, heapOffSpread: zSpread,
      floor: Number((z.ticksPerSec - zSpread).toFixed(3)), met: l.ticksPerSec >= z.ticksPerSec - zSpread,
    };
    console.log('tick rate bar: planned ' + l.ticksPerSec + ' against the heapOff floor ' + smallestArms.tickRateBar.floor + ' (heapOff ' + z.ticksPerSec + ' minus its own spread ' + zSpread + '): ' + (smallestArms.tickRateBar.met ? 'met' : 'MISSED'));
    // The SECOND ruler, beside the first and not instead of it: the bar above takes the
    // SLOWEST planned round (pick() is the median by rss, and the rounds are not sorted by
    // rate) against the heapOff arm's own spread, so a wide planned arm can miss on one slow
    // round while its middle sits above the control. This one is median against median, and
    // the floor it must clear is the control's median minus the LARGER of the two arms'
    // spreads, so the width of both arms is in the ruler rather than only the control's.
    const lSpread = spreadOf(smallestArms.ticksPerSecRuns.planned || []);
    const med = (list) => (list.length ? [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)] : null);
    const lMed = med(smallestArms.ticksPerSecRuns.planned || []), zMed = med(smallestArms.ticksPerSecRuns.heapOff || []);
    const widest = Math.max(lSpread, zSpread);
    smallestArms.tickRateBarPaired = {
      plannedMedian: lMed, heapOffMedian: zMed, plannedSpread: lSpread, heapOffSpread: zSpread,
      widestSpread: Number(widest.toFixed(3)),
      floor: lMed == null || zMed == null ? null : Number((zMed - widest).toFixed(3)),
      met: lMed != null && zMed != null && lMed >= zMed - widest,
    };
    console.log('tick rate bar paired: planned median ' + lMed + ' (spread ' + lSpread + ') against the heapOff median ' + zMed + ' (spread ' + zSpread + ') minus the wider spread ' + smallestArms.tickRateBarPaired.widestSpread + ', floor ' + smallestArms.tickRateBarPaired.floor + ': ' + (smallestArms.tickRateBarPaired.met ? 'met' : 'MISSED'));
  }
}

// ---------------------------------------------------------------- the other sizes, both arms
// The plan changes the heap at every organism size, so the question "did the bigger rows get
// slower" has to be answered by arms interleaved in THIS run as well: the headline rows above
// are one run each, and this note's own rule is that a figure from one run may not be read
// against a figure from another. heapOff is not repeated here; it is an rss attribution arm
// and the smallest row already carries it.
// The peak a 65536 slot heap reached, with everything needed to know whether that peak is the
// organism's need or the heap's cap: an arm that filled has a peak equal to its slot count and
// says nothing about how much more it wanted. hvHeapAfterTurn splits that peak into what was
// still live and what was garbage all along.
function flat512Peak(okRuns) {
  const rows = okRuns.filter((x) => x.hvHeap && !x.hvHeap.error);
  if (!rows.length) return null;
  const r = rows[0];
  const t = r.hvHeapAfterTurn && !r.hvHeapAfterTurn.error ? r.hvHeapAfterTurn : null;
  return {
    slots: r.hvHeap.slots, peak: r.hvHeap.peak, inUseAtEnd: r.hvHeap.inUse,
    full: r.hvHeap.full, fallbacks: r.hvHeap.fallbacks, fallbackPct: r.hvHeap.fallbackPct,
    capped: r.hvHeap.full || r.hvHeap.fallbacks > 0,
    liveAfterTurn: t ? t.inUseAfter : null, garbageAfterTurn: t ? t.garbage : null,
    runs: rows.length,
  };
}

let sizeArms = null;
if (!has('no-arms') && majorsList.length > 1) {
  const armRepeat = Number(opt('arm-repeat', 2));
  const smallest = Math.min(...majorsList);
  sizeArms = [];
  for (const majors of majorsList) {
    if (majors === smallest) continue;
    const seed = 'footprint-' + majors;
    const runs = { flat512: [], planned: [] };
    for (let r = 0; r < armRepeat; r++) {
      runs.flat512.push(spawnRow(majors, units, 'size-flat512-' + majors + '-' + r, 10 * 60_000, { ...LAZY_ENV, BRAIN_HV_HEAP_MB: '512' }, seed));
      runs.planned.push(spawnRow(majors, units, 'size-planned-' + majors + '-' + r, 10 * 60_000, LAZY_ENV, seed));
    }
    const ok = (list) => list.filter((x) => x.ok);
    const spread = (list) => (list.length < 2 ? 0 : Number((Math.max(...list) - Math.min(...list)).toFixed(3)));
    const tps = { flat512: ok(runs.flat512).map((x) => x.ticksPerSec), planned: ok(runs.planned).map((x) => x.ticksPerSec) };
    const rssAfter = { flat512: ok(runs.flat512).map((x) => x.memoryMB.rssAfter), planned: ok(runs.planned).map((x) => x.memoryMB.rssAfter) };
    const med = (list) => (list.length ? [...list].sort((a, b) => a - b)[Math.floor(list.length / 2)] : null);
    const worstSpread = Math.max(spread(tps.flat512), spread(tps.planned));
    const entry = {
      majors, substrateUnits: units, ticks, armRepeat, interleaved: true, seed,
      ticksPerSecRuns: tps, rssAfterRunsMB: rssAfter,
      ticksPerSecMedian: { flat512: med(tps.flat512), planned: med(tps.planned) },
      rssAfterMedianMB: { flat512: med(rssAfter.flat512), planned: med(rssAfter.planned) },
      slots: { flat512: (ok(runs.flat512)[0] || {}).hvHeap && ok(runs.flat512)[0].hvHeap.slots, planned: (ok(runs.planned)[0] || {}).hvHeap && ok(runs.planned)[0].hvHeap.slots },
      fallbackPct: { flat512: (ok(runs.flat512)[0] || {}).hvHeap && ok(runs.flat512)[0].hvHeap.fallbackPct, planned: (ok(runs.planned)[0] || {}).hvHeap && ok(runs.planned)[0].hvHeap.fallbackPct },
      widestArmSpreadTicksPerSec: worstSpread,
      // What a 65536 slot heap says this organism actually needs over a synchronous 200 tick
      // run: peak is the true need only while the arm never filled, so full and fallbacks
      // travel with it and a capped peak is visible instead of being read as a need.
      // core/simd.mjs's PLAN_SLOTS_PER_MAJOR is set off these peaks.
      flat512Peak: flat512Peak(ok(runs.flat512)),
    };
    if (entry.ticksPerSecMedian.flat512 != null && entry.ticksPerSecMedian.planned != null) {
      entry.slowerBy = Number((entry.ticksPerSecMedian.flat512 - entry.ticksPerSecMedian.planned).toFixed(3));
      entry.notSlowerThanSpread = entry.slowerBy <= worstSpread;
    }
    sizeArms.push(entry);
    if (entry.flat512Peak) {
      const p = entry.flat512Peak;
      console.log(majors + ' majors, what a ' + p.slots + ' slot heap needed: peak ' + p.peak + ' slots, ' + p.inUseAtEnd + ' in use at the end, of which ' +
        p.liveAfterTurn + ' live and ' + p.garbageAfterTurn + ' garbage after the collection and turn; full ' + p.full + ', fallbacks ' + p.fallbacks + ' (' + p.fallbackPct + '%): ' +
        (p.capped ? 'CAPPED, the peak is the heap and the need is higher' : 'not capped, so the peak is the need'));
    }
    console.log(majors + ' majors, ' + armRepeat + ' interleaved rounds, flat512 -> planned: ticks/s ' + JSON.stringify(tps) + ', rss after ' + ticks + ' ticks ' + JSON.stringify(rssAfter) +
      ', slots ' + entry.slots.flat512 + ' -> ' + entry.slots.planned + ', fallbackPct ' + entry.fallbackPct.flat512 + ' -> ' + entry.fallbackPct.planned +
      ', slower by ' + entry.slowerBy + ' against the widest arm spread ' + worstSpread + ': ' + (entry.notSlowerThanSpread ? 'within it' : 'OUTSIDE it'));
  }
}

// ---------------------------------------------------------------- browser build sizes
const appJsPath = path.join(ROOT, 'web', 'dist', 'app.js');
const indexHtmlPath = path.join(ROOT, 'web', 'dist', 'index.html');
const browser = {};
for (const [key, p] of [['appJs', appJsPath], ['indexHtml', indexHtmlPath]]) {
  if (existsSync(p)) {
    const bytes = statSync(p).size;
    browser[key] = { path: path.relative(ROOT, p), bytes, mb: bytesToMB(bytes), fitsPocketBudget: bytesToMB(bytes) <= POCKET_CHECKPOINT_MB };
  } else {
    browser[key] = { path: path.relative(ROOT, p), bytes: null, mb: null, fitsPocketBudget: null, reason: 'file not found' };
  }
}
console.log('browser build: app.js ' + (browser.appJs.bytes ?? 'missing') + ' bytes, index.html ' + (browser.indexHtml.bytes ?? 'missing') + ' bytes');

// ---------------------------------------------------------------- verdict
const verdict = {
  at: new Date().toISOString(), node: process.version,
  // the command that wrote this file, so every number below can be re-measured by copying one line
  command: ['node', path.relative(ROOT, SELF).split(path.sep).join('/'), ...args].join(' '),
  units, ticks,
  pocketBudgets: POCKET_BUDGETS,
  rows,
  extraRow,
  smallestArms,
  sizeArms,
  probe,
  browser,
};
mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
const file = path.join(HERE, 'verdicts', 'footprint.json');
writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
console.log('wrote ' + file);

// The note this run feeds, read back against the verdict the line above just wrote, so a run
// that moved the numbers says immediately which lines of notes/footprint.md went stale.
await checkNote();
} // isMain
