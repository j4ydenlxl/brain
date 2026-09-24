// bench/planes.mjs: HUNDREDS OF PLANES AT ONCE.
//
// generations/planes.mjs says what one plane IS and runs one. This runs P of them across W
// child processes and reports what the whole sweep cost and what it bought:
//
//   simulated years per wall second   the dilation rate of the sweep, with the arithmetic
//   cost per plane                    wall ms and MB, measured, both means over the planes
//   archive coverage before and after the union of MAP-Elites grid cells held after every
//                                     plane's FIRST generation, against the union held at
//                                     the end. Each plane keeps its own archive, so the
//                                     union is what the SWEEP found, not what any one
//                                     search found.
//
//   node bench/planes.mjs [--planes 200] [--ticks 2000] [--workers N] [--chunk 6]
//                         [--base planes] [--venue-share 0.5] [--plane-ms 120000]
//                         [--collect-fraction 0.25] [--no-release]
//                         [--out bench/verdicts/planes.json] [--quiet]
//   node bench/planes.mjs --probe 296 [--ticks 2000] [--chunk 6]
//
// --probe runs no sweep and writes no verdict: it runs the chunk holding one plane in three
// arms at once and prints the heap counters generation by generation inside that plane, plus
// the residue of every plane in the chunk by region. That printout is where the collection
// fraction below comes from.
//
// CHILD PROCESSES, NOT WORKER THREADS. Two reasons, both measured rather than assumed.
// (1) A brain built in a process leaves a mind model and a skill registry behind in module
// level maps that a later build never frees (bench/footprint.mjs found the same thing), so
// a process that runs plane after plane climbs: ten planes in one process took RSS from
// 85.6 MB to 866.3 MB. Chunking the sweep into short lived children puts a ceiling on that
// climb, and `--chunk` is that ceiling. (2) A worker thread would hold this process open
// and share its heap; a child exits and its memory goes back to the operating system.
//
// THE SOAK IS NOT TOUCHED. A plane writes nothing at all: no checkpoint directory, no
// emission tree, nothing under state/. See the header of generations/planes.mjs.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { planeCoordinate, planeDescriptor, runPlane, runPlaneAsync, gridCapacity, SECONDS_PER_YEAR, defaultWorkers } from '../generations/planes.mjs';
// Imported for plan(), planSlots() and heapStats(). The import compiles the wasm module and
// allocates no linear memory (core/simd.mjs: the memory is created on the first call that
// could reach it), so the parent, which never allocates a hypervector, pays nothing for it.
import * as SIMD from '../core/simd.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SELF = fileURLToPath(import.meta.url);
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

// Roughly what one child's resident set reached over a chunk of planes in the measurement
// quoted in the header. Used only to keep the worker count from asking for more memory
// than the machine has free while the soak is running; the chosen count is printed.
//
// It was an assumption a child could break: on 400 planes at 2000 ticks with 4 workers the
// peak child rss read 959.488 MB against this 900, and on the 8000 plane sweep in
// bench/verdicts/planes.json it read 976.844 MB. With the collection point and the planned
// heap below, the same 400 plane command reads 585.75 MB, so the number is now a bound with
// headroom rather than one the sweep walks past. It is left where it is: a peak measured at
// 400 planes is not a promise about the tail of 8000.
const CHILD_RSS_BUDGET_MB = 900;

const mean = (xs) => (xs.length ? xs.reduce((a, v) => a + v, 0) / xs.length : 0);
const round = (x, n = 3) => Number(Number(x).toFixed(n));

// ================================================================== child mode
// One child runs the plane indices it was handed, in the order it was handed them, and
// prints exactly one JSON line per plane on stdout. Everything else it has to say goes to
// stderr so the parent's parser never sees it.
//
// WHY A COLLECTION POINT BETWEEN PLANES. A hypervector slot comes back to core/simd.mjs in
// one of two ways: release(), when an owner knows nobody else holds the view, or the
// FinalizationRegistry, which fires only at an event loop turn AFTER a collection. A child
// that ran plane after plane synchronously gave V8 neither, so no slot ever came back
// (heapStats().finalizerCalls read 0 at every plane) and the live set only climbed: measured
// in one process over six planes, inUse 14893, 28449, 42259, 59976, then the heap full at
// 65536, with rss 377.5, 480.0, 579.2, 702.3, 821.1 MB. The organisms of a finished plane
// are already garbage when runPlane returns; what the child lacked was the turn at which
// that garbage could be collected and the finalizers could run. The same six planes with
// gc() and three event loop turns between them read inUse 55, 61, 62, 84, 93, 93 and rss
// 324.0, 324.9, 324.8, 350.7, 406.1, 406.7 MB.
//
// WHY THE HEAP IS PLANNED. core/simd.mjs installs its memory once, at the first allocation,
// and cannot resize it afterwards, so a child that says nothing gets the main thread default
// of 512 MB whatever it is about to run. plan() is called here, before the first allocation,
// for the LARGEST organism this child will run, which is what its plan can be sized for: the
// per organism coefficients of planSlots() are a measurement of the live set of ONE organism
// with returns working. A whole plane holds more than that at once, because no slot comes
// back inside a plane, and the overflow is counted in heapStats().fallbacks and carried per
// plane below. A fallback is a plain Int8Array, which a collection CAN take back; a bigger
// wasm memory could not be taken back at all, and the resident pages of one are what pushes
// a machine that is also running the soak towards swap.
//
// WHY THE COLLECTION POINT ALSO RUNS INSIDE A PLANE. Between planes was not enough, because a
// plane runs its own generations synchronously and fills the heap before it ever reaches the
// point between planes. Measured on plane 296 of the 400 plane sweep (the worst plane of the
// sweep by its own fallbacks), with the child's planned 26368 slots: inUse 6770 after
// generation 1, 17698 after 2, FULL from generation 3, and 61632 of that plane's 91743
// attempts fell back, 67.18 %. So the plane runner yields between generations
// (generations/planes.mjs runPlaneAsync) and this same collection point runs there too, when
// the heap is past COLLECT_FRACTION of its slots.
//
// WHY THE ORGANISMS ALSO RELEASE, AND WHY THAT IS THE DEFAULT. A collection point can only
// return what V8 has already decided is garbage, and a generation makes more garbage than the
// boundary between two generations can absorb when the heap is small. The three arms of
// `--probe 296 --ticks 2000 --chunk 1` under BRAIN_HV_HEAP_MB=128, run in one wall window,
// printed it: the synchronous plane fell back 73138 times of 91743 attempts (79.72 %), the
// yielding plane with the collection point still fell back 4819 times (5.25 %), and the
// yielding plane whose organisms hand their own slots back the moment their scores have been
// read fell back 0 times, at a peak of 10576 slots against 16384. So the second half of the
// fix is not an option the bar command would have to pass: it is on, and BRAIN_PLANES_RELEASE=0
// is the arm without it.
const turn = () => new Promise((r) => setImmediate(r));
async function collectionPoint(rounds = 3) {
  // BRAIN_PLANES_COLLECT=0 holds the path this bench had BEFORE it had a collection point,
  // so test/planes.test.mjs can run the two side by side in one wall window and grade the
  // fix against the thing it replaced rather than against a remembered number. The sweep
  // never sets it.
  if (process.env.BRAIN_PLANES_COLLECT === '0') return false;
  // --expose-gc is passed to the child by the parent below. Without it the turns alone are
  // kept (they still let a finalizer that V8 chose to run fire), and the child says so.
  const gc = typeof globalThis.gc === 'function' ? globalThis.gc : null;
  for (let k = 0; k < rounds; k++) { if (gc) gc(); await turn(); }
  return gc !== null;
}

// The fraction of the planned slots at which a generation boundary becomes a collection
// point. Chosen from the STEP 1 printout rather than by taste: the largest rise ONE
// generation made in the probe of plane 296 was 10928 slots of 26368 (41.4 %), and the
// widest plane of the sweep (64 majors, popSize 12) allocates about 25200 in a generation
// against a 28416 slot plan, so a generation that starts under a quarter full cannot fill
// the heap before the next boundary. Raising it would put a generation back inside a full
// heap; lowering it only collects more often, which costs wall clock and buys nothing.
const COLLECT_FRACTION = 0.25;

async function runChild() {
  const indices = String(opt('indices', '')).split(',').filter(Boolean).map(Number);
  const ticks = Number(opt('ticks', 2000));
  const base = String(opt('base', 'planes'));
  const venueShare = Number(opt('venue-share', 0.5));
  const planeMs = Number(opt('plane-ms', 120_000));
  const worker = Number(opt('worker', -1));
  const seq = Number(opt('seq', -1));
  const fraction = Number(opt('collect-fraction', COLLECT_FRACTION));
  const inPlaneRounds = Number(opt('collect-rounds', 1));
  // BRAIN_PLANES_ASYNC=0 is the plane runner this bench had BEFORE it had one: the whole
  // plane in one synchronous loop, no yield between generations. It is the control arm of
  // test/planes.test.mjs (k) and of the probe below. The sweep never sets it.
  const asyncPlane = process.env.BRAIN_PLANES_ASYNC !== '0';
  // The other half of the fix, and it is the DEFAULT: an organism hands its own slots back
  // the moment its scores have been read, instead of waiting for a collection to notice it is
  // garbage. BRAIN_PLANES_RELEASE=0 (or --no-release) is the arm without it, which is what
  // test/planes.test.mjs grades the default against. A flag that the bar command does not
  // pass cannot be part of what the bar measures, so it is on rather than opt in.
  const releaseOrganisms = process.env.BRAIN_PLANES_RELEASE !== '0' && !has('no-release');
  const genSeries = has('gen-series');
  const coords = indices.map((i) => planeCoordinate(i, { base, venueShare }));
  const maxMajors = coords.reduce((m, c) => Math.max(m, c.epochScale.majors[1]), 0);
  const hvPlan = SIMD.plan({ majors: maxMajors, by: 'bench/planes child' });
  const mb = (b) => Number((b / 1048576).toFixed(3));
  for (let pos = 0; pos < coords.length; pos++) {
    const coord = coords[pos];
    const i = coord.index;
    // Cumulative heap counters at the moment this plane starts, so the plane's OWN fallbacks
    // can be reported as a delta. heapStats() is process wide and cumulative: a plane at
    // position 4 of a child that reads 46 % has inherited most of it from the four before.
    const h0 = SIMD.heapStats();
    const series = [];
    let collections = 0;
    let inUsePeakInPlane = h0.inUse;
    // One recorder for both arms, so the two per generation tables are comparable line for
    // line. hb is the heap as the generation ENDED, before anything this hook does; the
    // synchronous arm reads it again for the after column, because a turn is the very thing
    // it is the control for and it may not take one.
    const record = (info, hb, collected) => {
      if (!genSeries) return;
      const ha = SIMD.heapStats();
      const m = process.memoryUsage();
      series.push({
        gen: info.gen, ticks: info.ticks, organisms: info.organisms, genMs: info.genMs,
        releasedSlots: info.releasedSlots, collected,
        inUseBefore: hb.inUse, inUseAfter: ha.inUse, peak: ha.peak, slots: ha.slots,
        allocs: ha.allocs, fallbacks: ha.fallbacks, fallbackPct: ha.fallbackPct,
        finalizerCalls: ha.finalizerCalls,
        rssMB: mb(m.rss), heapUsedMB: mb(m.heapUsed), heapTotalMB: mb(m.heapTotal),
        externalMB: mb(m.external), arrayBuffersMB: mb(m.arrayBuffers),
      });
    };
    const betweenGenerations = async (info) => {
      const hb = SIMD.heapStats();
      if (hb.inUse > inUsePeakInPlane) inUsePeakInPlane = hb.inUse;
      let collected = false;
      if (hb.slots > 0 && hb.inUse >= hb.slots * fraction) { await collectionPoint(inPlaneRounds); collections++; collected = true; }
      else await turn();  // a turn on its own still lets a finalizer V8 chose to run fire
      record(info, hb, collected);
    };
    // The control arm's hook. It takes no turn and collects nothing, so the table it prints is
    // the heap of a plane that runs its generations straight through, which is the printout
    // that says at WHICH generation the heap fills.
    const onGeneration = (info) => {
      const hb = SIMD.heapStats();
      if (hb.inUse > inUsePeakInPlane) inUsePeakInPlane = hb.inUse;
      record(info, hb, false);
    };
    let row;
    try {
      row = asyncPlane
        ? await runPlaneAsync(coord, { ticks, maxMs: planeMs, release: releaseOrganisms, betweenGenerations })
        : runPlane(coord, { ticks, maxMs: planeMs, release: releaseOrganisms, onGeneration });
    } catch (e) {
      row = { ok: false, index: i, descriptor: planeDescriptor(coord).id, error: String(e && e.message ? e.message : e), coordinate: coord };
    }
    // The plane is over and its organisms are unreachable: collect, THEN read the memory, so
    // the series below is the memory this child is still holding between planes rather than
    // the memory it happened to be holding at the moment the last tick ran.
    const gcRan = await collectionPoint();
    const m = process.memoryUsage();
    const h = SIMD.heapStats();
    row.worker = worker;
    row.childSeq = seq;
    row.planeInChild = pos;
    row.planesInChild = coords.length;
    row.gcAvailable = gcRan;
    row.asyncPlane = asyncPlane;
    row.releaseOrganisms = releaseOrganisms;
    row.collectFraction = fraction;
    row.collectionsInPlane = collections;
    row.hvInUsePeakInPlane = inUsePeakInPlane;
    if (genSeries) row.genSeries = series;
    // This plane's OWN share of the heap counters, as deltas against the moment it started.
    // The cumulative fallbackPct of a plane late in a child is mostly the planes before it.
    {
      const h1 = SIMD.heapStats();
      const a = h1.allocs - h0.allocs, f = h1.fallbacks - h0.fallbacks;
      row.inPlane = {
        allocs: a, fallbacks: f,
        fallbackPct: a + f > 0 ? Number((100 * f / (a + f)).toFixed(2)) : 0,
        released: h1.released - h0.released,
        finalizerCalls: h1.finalizerCalls - h0.finalizerCalls,
      };
    }
    row.after = {
      rssMB: mb(m.rss), heapUsedMB: mb(m.heapUsed), heapTotalMB: mb(m.heapTotal),
      externalMB: mb(m.external), arrayBuffersMB: mb(m.arrayBuffers),
      hv: {
        slots: h.slots, inUse: h.inUse, peak: h.peak, allocs: h.allocs, fallbacks: h.fallbacks,
        fallbackPct: h.fallbackPct, released: h.released, reclaimed: h.reclaimed,
        finalizerCalls: h.finalizerCalls, installedMB: h.installedMB,
        planApplied: hvPlan.applied, planSlots: hvPlan.slots, planReason: hvPlan.reason,
        planWouldBeSlots: hvPlan.wouldBeSlots, planMajors: maxMajors,
      },
    };
    process.stdout.write(JSON.stringify(row) + '\n');
  }
}

if (isMain && has('child')) {
  await runChild();
  process.exit(0);
}

// ================================================================== probe mode
// STEP 1 of this item: look INSIDE a plane. Runs the chunk that holds one named plane in
// three arms at once, prints the heap counters generation by generation for the named plane,
// and names the residue of every plane in the chunk by region. It writes no verdict: its job
// is to show where the heap fills and what the rss that is neither the JS heap nor an
// ArrayBuffer actually is, so the collection fraction above is chosen from a printout.
//
//   node bench/planes.mjs --probe 296 [--ticks 2000] [--chunk 6]
//
// THE ARMS RUN IN ONE WALL WINDOW, spawned together, never one after the other: the whole
// point is a heap comparison on a machine that also runs a soak, and a machine that gets busy
// must not be able to land on one arm alone.
function spawnProbe(list, env, extra = []) {
  return new Promise((resolve, reject) => {
    const args = ['--expose-gc', SELF, '--child', '--gen-series', '--indices', list.join(','),
      '--ticks', String(opt('ticks', 2000)), '--worker', '0', '--seq', '0', ...extra];
    const child = spawn(process.execPath, args, { cwd: ROOT, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', reject);
    child.on('close', (code) => {
      const lines = out.trim().split('\n').filter(Boolean);
      if (code !== 0) reject(new Error('probe child exited ' + code + ': ' + err.slice(-2000)));
      else resolve(lines.map((l) => JSON.parse(l)));
    });
  });
}

if (isMain && has('probe')) {
  const target = Number(opt('probe', 0));
  const chunk = Math.max(1, Number(opt('chunk', 6)));
  const start = Math.floor(target / chunk) * chunk;
  const list = Array.from({ length: chunk }, (_, k) => start + k);
  console.log('probe: plane ' + target + ' inside the chunk ' + list[0] + '..' + list[list.length - 1] +
    ', tick budget ' + opt('ticks', 2000) + ', three arms in one wall window\n');
  const t0 = process.hrtime.bigint();
  const [sync, asyncOnly, asyncRelease] = await Promise.all([
    spawnProbe(list, { BRAIN_PLANES_ASYNC: '0', BRAIN_PLANES_RELEASE: '0' }),
    spawnProbe(list, { BRAIN_PLANES_ASYNC: '1', BRAIN_PLANES_RELEASE: '0' }),
    spawnProbe(list, { BRAIN_PLANES_ASYNC: '1', BRAIN_PLANES_RELEASE: '1' }),
  ]);
  const wallMs = Number(process.hrtime.bigint() - t0) / 1e6;
  const arms = [
    ['synchronous plane (the arm this replaces)', sync],
    ['async plane, collection point inside it', asyncOnly],
    ['async plane, collection point, organisms released', asyncRelease],
  ];
  for (const [name, rows] of arms) {
    const r = rows.find((x) => x.index === target);
    console.log('--- ' + name);
    if (!r) { console.log('    plane ' + target + ' did not report'); continue; }
    console.log('    plane ' + target + ' ' + r.descriptor + '  majors ' + JSON.stringify(r.coordinate.epochScale.majors) +
      ' popSize ' + r.coordinate.epochScale.popSize + '  heap ' + r.after.hv.slots + ' slots (' + r.after.hv.installedMB + ' MB)');
    console.log('    gen  inUse before  inUse after  peak   allocs  fallbacks  fb %   finalizers  released  gen ms  collected  rss MB');
    for (const g of r.genSeries || []) {
      console.log('    ' + String(g.gen).padStart(3) + String(g.inUseBefore).padStart(13) + String(g.inUseAfter).padStart(13) +
        String(g.peak).padStart(7) + String(g.allocs).padStart(9) + String(g.fallbacks).padStart(11) +
        String(g.fallbackPct).padStart(7) + String(g.finalizerCalls).padStart(12) + String(g.releasedSlots).padStart(10) +
        String(g.genMs).padStart(8) + String(g.collected).padStart(11) + String(g.rssMB).padStart(9));
    }
    console.log('    this plane alone: ' + r.inPlane.allocs + ' allocs, ' + r.inPlane.fallbacks + ' fallbacks, ' +
      r.inPlane.fallbackPct + ' %, ' + r.inPlane.released + ' released, ' + r.inPlane.finalizerCalls + ' finalizer calls; ' +
      r.collectionsInPlane + ' collection points, wall ' + r.wallMs + ' ms of which ' + r.pauseMs + ' ms suspended; ' +
      'generations ' + r.generations + ', organisms ' + r.organisms + ', ticks ' + r.ticks + ', fill ' + r.archiveFillAfter +
      ', best ' + (r.best ? r.best.fitness + ' in ' + r.best.key : 'none'));
    console.log('    the whole chunk : ' + rows.reduce((a, x) => a + x.inPlane.allocs, 0) + ' allocs, ' +
      rows.reduce((a, x) => a + x.inPlane.fallbacks, 0) + ' fallbacks, peak rss ' + Math.max(...rows.map((x) => x.rssPeakMB)) +
      ' MB, wall ' + Math.round(rows.reduce((a, x) => a + x.wallMs, 0)) + ' ms');
    // THE RESIDUE, BY REGION. rss is the JS heap node reports as heapUsed, plus the
    // ArrayBuffers it counts, plus a residue. The residue is not one thing, so it is split
    // into the three regions that can hold it: the V8 heap node has COMMITTED but is not
    // using (heapTotal minus heapUsed, resident and never in heapUsed), what node calls
    // external, and the wasm linear memory of core/simd.mjs, of which a page is resident only
    // once written, so it steps up exactly when a plane touches slots no plane before it
    // touched. Whatever is left after those three is the process itself, printed as `rest`
    // rather than attributed to the heap.
    console.log('    residue     plane  rss MB  heapUsed  heapTotal  external  arrayBuf  residue  v8 slack  hv peak  touched MB  untouched  rest');
    let flat = null, prev = null;
    for (const x of rows) {
      const res = Number((x.after.rssMB - x.after.heapUsedMB - x.after.arrayBuffersMB).toFixed(3));
      const touched = Number((x.after.hv.peak * SIMD.SLOT / 1048576).toFixed(3));
      const slack = Number((x.after.heapTotalMB - x.after.heapUsedMB).toFixed(3));
      // external HOLDS the wasm heap, so touched is a part of external and not a region
      // beside it: subtracting both would count the hypervector heap twice. untouched is the
      // part of the installed heap external counts that the operating system has never made
      // resident, which is why rest moves between two arms that install the same heap.
      const untouched = Number((x.after.hv.installedMB - touched).toFixed(3));
      const rest = Number((res - slack - x.after.externalMB).toFixed(3));
      console.log('                ' + String(x.index).padStart(5) + String(x.after.rssMB).padStart(8) +
        String(x.after.heapUsedMB).padStart(10) + String(x.after.heapTotalMB).padStart(11) +
        String(x.after.externalMB).padStart(10) + String(x.after.arrayBuffersMB).padStart(10) +
        String(res).padStart(9) + String(slack).padStart(10) + String(x.after.hv.peak).padStart(9) +
        String(touched).padStart(12) + String(untouched).padStart(11) + String(rest).padStart(8));
      if (prev !== null && flat === null && Math.abs(res - prev) < 1) flat = x.index;
      prev = res;
    }
    console.log('    residue flattens at plane ' + (flat === null ? 'no plane in this child: it was still moving at the last one' : flat) + '\n');
  }
  console.log('probe wall ' + (wallMs / 1000).toFixed(3) + ' s for all three arms together');
  process.exit(0);
}

// ================================================================== parent mode
if (isMain) {
  const planes = Number(opt('planes', 200));
  const ticks = Number(opt('ticks', 2000));
  const base = String(opt('base', 'planes'));
  const venueShare = Number(opt('venue-share', 0.5));
  const chunk = Math.max(1, Number(opt('chunk', 6)));
  const planeMs = Number(opt('plane-ms', 120_000));
  const quiet = has('quiet');
  const collectFraction = Number(opt('collect-fraction', COLLECT_FRACTION));
  // On unless the caller says otherwise: see the child above. --no-release is the control arm.
  const releaseOrganisms = !has('no-release');
  const outFile = path.resolve(ROOT, String(opt('out', path.join('bench', 'verdicts', 'planes.json'))));
  const command = 'node bench/planes.mjs ' + argv.join(' ');

  // The worker count: what the caller asked for, else the contract default (cores minus
  // two), and in either case never more than free memory can hold a child's resident set
  // for. The reason a number was lowered is printed, never silently applied.
  const asked = opt('workers', null);
  const byCores = asked === null ? defaultWorkers() : Math.max(1, Number(asked));
  const byMemory = Math.max(1, Math.floor((os.freemem() / 1048576) / CHILD_RSS_BUDGET_MB));
  const workers = Math.max(1, Math.min(byCores, byMemory, planes));
  if (!quiet) {
    console.log('bench/planes: ' + planes + ' planes, tick budget ' + ticks + ' each, ' + workers + ' workers, ' + chunk + ' planes per child');
    console.log('  workers      asked ' + (asked === null ? 'default ' + byCores + ' (' + (os.availableParallelism ? os.availableParallelism() : os.cpus().length) + ' cores minus 2)' : String(byCores)) +
      ', free memory allows ' + byMemory + ' at ' + CHILD_RSS_BUDGET_MB + ' MB a child (' + Math.round(os.freemem() / 1048576) + ' MB free), taking ' + workers);
    console.log('  years clock  1 year = ' + SECONDS_PER_YEAR + ' s; each plane declares its own seconds per tick and carries the arithmetic');
    console.log('  archive      ' + gridCapacity() + ' reachable cells per plane, each plane starting empty\n');
  }

  // ---------------------------------------------------------------- dispatch
  // A single cursor over the plane indices, handed out in chunks to whichever child is free
  // next. Chunks therefore overlap in time across the workers rather than each worker
  // owning one contiguous block start to finish, so the sweep is interleaved: a slow arm of
  // the coordinate space cannot land entirely on one worker and bend the wall clock.
  let cursor = 0;
  const rows = [];
  const failures = [];
  const tSweep = process.hrtime.bigint();

  function nextChunk() {
    if (cursor >= planes) return null;
    const list = [];
    for (let i = 0; i < chunk && cursor < planes; i++) list.push(cursor++);
    return list;
  }

  let spawned = 0;
  function runChunk(list, worker) {
    return new Promise((resolve) => {
      // --expose-gc is what lets the child's collection point between planes actually
      // collect; without it the FinalizationRegistry of core/simd.mjs has no collection to
      // fire after and no slot of a finished plane comes back. The child reports whether it
      // got it (gcAvailable), so a run that lost the flag is visible rather than assumed.
      const args = ['--expose-gc', SELF, '--child', '--indices', list.join(','), '--ticks', String(ticks), '--base', base, '--venue-share', String(venueShare), '--plane-ms', String(planeMs), '--worker', String(worker), '--seq', String(spawned++), '--collect-fraction', String(collectFraction)];
      if (!releaseOrganisms) args.push('--no-release');
      const child = spawn(process.execPath, args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
      let buf = '', err = '';
      const got = [];
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (d) => {
        buf += d;
        let nl;
        while ((nl = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          try { got.push(JSON.parse(line)); } catch (e) { err += 'unparsable line: ' + line.slice(0, 200) + '\n'; }
        }
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (d) => { err += d; });
      child.on('close', (code) => {
        for (const r of got) {
          rows.push(r);
          if (!r.ok) failures.push({ index: r.index, reason: r.error || r.lastError || 'not ok' });
          if (!quiet) {
            console.log(
              'plane ' + String(r.index).padStart(4) + ' ' + r.descriptor +
              '  ' + String(r.coordinate.world.kind === 'venue' ? 'venue:' + r.coordinate.world.name : 'policy:' + r.coordinate.world.name).padEnd(30) +
              ' s/tick ' + String(r.coordinate.secondsPerTick).padStart(9) +
              '  gens ' + String(r.generations).padStart(3) +
              '  ticks ' + String(r.ticks).padStart(6) +
              '  years ' + Number(r.simulatedYears).toExponential(4) +
              '  fill ' + String(r.archiveFillAfter).padStart(4) +
              '  ' + String(Math.round(r.wallMs)).padStart(6) + ' ms' +
              '  rss +' + String(r.rssDeltaMB).padStart(8) + ' MB' +
              (r.after ? '  held ' + String(r.after.rssMB).padStart(8) + ' MB' +
                '  hv ' + String(r.after.hv.inUse).padStart(5) + '/' + String(r.after.hv.slots) +
                ' peak ' + String(r.after.hv.peak).padStart(5) + ' fb ' + String(r.after.hv.fallbackPct).padStart(6) + '%' : '')
            );
          }
        }
        // A child that died mid chunk leaves the planes it never printed unaccounted for.
        // They are recorded as failures by index, not quietly dropped, because a sweep that
        // silently loses planes reports a rate over a denominator it never ran.
        const done = new Set(got.map((r) => r.index));
        for (const i of list) if (!done.has(i)) failures.push({ index: i, reason: 'child exited ' + code + ' without printing this plane' + (err ? ': ' + err.slice(-400) : '') });
        resolve();
      });
    });
  }

  async function worker(id) {
    for (let list = nextChunk(); list; list = nextChunk()) await runChunk(list, id);
  }

  await Promise.all(Array.from({ length: workers }, (_, id) => worker(id)));
  const sweepMs = Number(process.hrtime.bigint() - tSweep) / 1e6;

  // ---------------------------------------------------------------- totals
  const ok = rows.filter((r) => r.ok);
  const totalTicks = ok.reduce((a, r) => a + r.ticks, 0);
  const totalYears = ok.reduce((a, r) => a + r.simulatedYears, 0);
  const totalGenerations = ok.reduce((a, r) => a + r.generations, 0);
  const totalOrganisms = ok.reduce((a, r) => a + r.organisms, 0);
  const childWallMs = ok.reduce((a, r) => a + r.wallMs, 0);
  const yearsPerWallSecond = sweepMs > 0 ? totalYears / (sweepMs / 1000) : 0;

  const before = new Set();
  const after = new Set();
  for (const r of ok) {
    for (const k of r.firstGenKeys || []) before.add(k);
    for (const k of r.finalKeys || []) after.add(k);
  }
  const capacity = gridCapacity();

  const best = ok.reduce((b, r) => (r.best && (!b || r.best.fitness > b.fitness) ? { ...r.best, plane: r.index, descriptor: r.descriptor } : b), null);
  const distinctDescriptors = new Set(rows.map((r) => r.descriptor)).size;

  // ---------------------------------------------------------------- the shape of the growth
  // What a child holds between planes, in the order that child ran them. The question this
  // answers is whether a child GROWS: a monotonic series is an accumulation, a flat or
  // sawtooth one is a child that gives back what a plane took. The slope is least squares
  // of the held rss against the ordinal of the plane inside the run, in MB per plane, and
  // the falling steps are counted beside it because a series can have a small slope and
  // still climb without ever falling.
  const slopeOf = (ys) => {
    const n = ys.length;
    if (n < 2) return 0;
    const mx = (n - 1) / 2, my = mean(ys);
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) { num += (i - mx) * (ys[i] - my); den += (i - mx) * (i - mx); }
    return den ? num / den : 0;
  };
  const steps = (ys) => {
    let up = 0, down = 0;
    for (let i = 1; i < ys.length; i++) { if (ys[i] > ys[i - 1]) up++; else if (ys[i] < ys[i - 1]) down++; }
    return { up, down };
  };
  // The declared rule, so the word in the verdict is not a matter of taste: a series is
  // MONOTONIC when it never falls and rises by more than 1 MB a plane, FLAT when its slope
  // is under 1 MB a plane either way, and SAWTOOTH otherwise (it falls somewhere).
  const shapeOf = (ys) => {
    const s = slopeOf(ys), st = steps(ys);
    if (st.down === 0 && s > 1) return 'monotonic';
    if (Math.abs(s) < 1) return 'flat';
    return 'sawtooth';
  };
  const withAfter = ok.filter((r) => r.after);
  const byOrder = (a, b) => (a.childSeq - b.childSeq) || (a.planeInChild - b.planeInChild);
  const perWorker = [];
  for (const w of [...new Set(withAfter.map((r) => r.worker))].sort((a, b) => a - b)) {
    const mine = withAfter.filter((r) => r.worker === w).sort(byOrder);
    const ys = mine.map((r) => r.after.rssMB);
    const st = steps(ys);
    perWorker.push({
      worker: w, planes: ys.length,
      rssFirstMB: ys[0] ?? 0, rssLastMB: ys[ys.length - 1] ?? 0,
      rssPeakMB: ys.length ? Math.max(...ys) : 0,
      rssMeanMB: round(mean(ys), 3),
      slopeMBPerPlane: round(slopeOf(ys), 4),
      risingSteps: st.up, fallingSteps: st.down,
      shape: shapeOf(ys),
      hvPeakSlots: mine.length ? Math.max(...mine.map((r) => r.after.hv.peak)) : 0,
      hvInUseLast: mine.length ? mine[mine.length - 1].after.hv.inUse : 0,
      fallbackPctLast: mine.length ? mine[mine.length - 1].after.hv.fallbackPct : 0,
    });
  }
  // The same question asked inside ONE child, which is the window that matters here: a child
  // dies after its chunk, so an accumulation across a whole worker is partly just the next
  // child starting again.
  const childSlopes = [];
  for (const seq of [...new Set(withAfter.map((r) => r.childSeq))]) {
    const mine = withAfter.filter((r) => r.childSeq === seq).sort((a, b) => a.planeInChild - b.planeInChild);
    if (mine.length < 2) continue;
    const ys = mine.map((r) => r.after.rssMB);
    childSlopes.push({ seq, planes: ys.length, firstMB: ys[0], lastMB: ys[ys.length - 1], slope: slopeOf(ys), down: steps(ys).down });
  }
  // The mean held rss at each position inside a child, over every child: one series of
  // `chunk` points that says what a plane costs the child that runs it, first plane to last.
  const byPosition = [];
  for (let p = 0; ; p++) {
    const at = withAfter.filter((r) => r.planeInChild === p);
    if (!at.length) break;
    byPosition.push({ planeInChild: p, planes: at.length, rssMeanMB: round(mean(at.map((r) => r.after.rssMB)), 3) });
  }
  const oneWorker = withAfter.filter((r) => r.worker === (perWorker[0] ? perWorker[0].worker : -1)).sort(byOrder);
  const inPlane = ok.filter((r) => r.inPlane);
  // The residue series for the full series worker, and the plane at which it stops moving.
  // "Flattens" is declared, not eyeballed: the first plane after which the residue moves by
  // less than 1 MB and never moves by more than 1 MB again inside that same child.
  const residueRows = oneWorker.map((r) => {
    const res = round(r.after.rssMB - r.after.heapUsedMB - r.after.arrayBuffersMB, 3);
    const touched = round(r.after.hv.peak * SIMD.SLOT / 1048576, 3);
    // The residue split into the regions that can hold it, so the word names a place: the V8
    // heap committed and not in use, what node calls external, the wasm pages the hypervector
    // heap has written, and what is left over, which is the process itself.
    const slack = round(r.after.heapTotalMB - r.after.heapUsedMB, 3);
    return {
      index: r.index, childSeq: r.childSeq, planeInChild: r.planeInChild,
      rssMB: r.after.rssMB, heapUsedMB: r.after.heapUsedMB, heapTotalMB: r.after.heapTotalMB,
      externalMB: r.after.externalMB, arrayBuffersMB: r.after.arrayBuffersMB,
      residueMB: res, hvPeakSlots: r.after.hv.peak, hvTouchedMB: touched,
      // external HOLDS the wasm heap: touched is a part of it, not a region beside it, so
      // rest subtracts external once and untouched says how much of it the operating system
      // has never had to make resident.
      v8SlackMB: slack, hvUntouchedMB: round(r.after.hv.installedMB - touched, 3),
      restMB: round(res - slack - r.after.externalMB, 3),
      residueMinusTouchedMB: round(res - touched, 3),
    };
  });
  const flattenBySeq = [];
  for (const seq of [...new Set(residueRows.map((r) => r.childSeq))]) {
    const mine = residueRows.filter((r) => r.childSeq === seq).sort((a, b) => a.planeInChild - b.planeInChild);
    let at = null;
    for (let i = 1; i < mine.length; i++) {
      if (Math.abs(mine[i].residueMB - mine[i - 1].residueMB) < 1) { if (at === null) at = mine[i].index; }
      else at = null;
    }
    flattenBySeq.push({ childSeq: seq, planes: mine.length, flattensAtPlane: at, firstResidueMB: mine[0] ? mine[0].residueMB : 0, lastResidueMB: mine.length ? mine[mine.length - 1].residueMB : 0 });
  }
  const residue = {
    rule: 'residueMB = rssMB - heapUsedMB - arrayBuffersMB, split into: v8SlackMB = heapTotalMB - heapUsedMB, committed and resident but never counted in heapUsed; externalMB, which is where node counts the wasm linear memory of the hypervector heap, of which hvTouchedMB = hv peak slots x ' + SIMD.SLOT + ' bytes is the part this child has actually written and hvUntouchedMB the part the operating system never made resident; restMB = residue - v8Slack - external, the process itself',
    worker: perWorker[0] ? perWorker[0].worker : -1,
    v8SlackMeanMB: round(mean(residueRows.map((r) => r.v8SlackMB)), 3),
    externalMeanMB: round(mean(residueRows.map((r) => r.externalMB)), 3),
    hvTouchedMeanMB: round(mean(residueRows.map((r) => r.hvTouchedMB)), 3),
    hvUntouchedMeanMB: round(mean(residueRows.map((r) => r.hvUntouchedMB)), 3),
    restMeanMB: round(mean(residueRows.map((r) => r.restMB)), 3),
    restSdMB: (() => {
      const xs = residueRows.map((r) => r.restMB);
      const m = mean(xs);
      return round(Math.sqrt(mean(xs.map((x) => (x - m) * (x - m)))), 3);
    })(),
    residueMinusTouchedMeanMB: round(mean(residueRows.map((r) => r.residueMinusTouchedMB)), 3),
    residueMinusTouchedSdMB: (() => {
      const xs = residueRows.map((r) => r.residueMinusTouchedMB);
      const m = mean(xs);
      return round(Math.sqrt(mean(xs.map((x) => (x - m) * (x - m)))), 3);
    })(),
    childrenThatFlatten: flattenBySeq.filter((f) => f.flattensAtPlane !== null).length,
    children: flattenBySeq.length,
    perChild: flattenBySeq,
    series: residueRows,
  };
  const childGrowth = {
    gcAvailableInChildren: withAfter.every((r) => r.gcAvailable === true),
    planesWithRecord: withAfter.length,
    perWorker,
    withinChild: {
      children: childSlopes.length,
      meanFirstMB: round(mean(childSlopes.map((c) => c.firstMB)), 3),
      meanLastMB: round(mean(childSlopes.map((c) => c.lastMB)), 3),
      meanSlopeMBPerPlane: round(mean(childSlopes.map((c) => c.slope)), 4),
      maxSlopeMBPerPlane: childSlopes.length ? round(Math.max(...childSlopes.map((c) => c.slope)), 4) : 0,
      childrenThatNeverFall: childSlopes.filter((c) => c.down === 0).length,
      meanRssByPosition: byPosition,
      shape: shapeOf(byPosition.map((p) => p.rssMeanMB)),
      slopeOfMeanMBPerPlane: round(slopeOf(byPosition.map((p) => p.rssMeanMB)), 4),
    },
    hv: {
      installedMB: withAfter.length ? withAfter[0].after.hv.installedMB : 0,
      planApplied: withAfter.length ? withAfter[0].after.hv.planApplied : false,
      planReason: withAfter.length ? withAfter[0].after.hv.planReason : 'no child record',
      peakSlotsMax: withAfter.length ? Math.max(...withAfter.map((r) => r.after.hv.peak)) : 0,
      inUseAfterPlaneMax: withAfter.length ? Math.max(...withAfter.map((r) => r.after.hv.inUse)) : 0,
      fallbackPctMean: round(mean(withAfter.map((r) => r.after.hv.fallbackPct)), 3),
      fallbackPctMax: withAfter.length ? Math.max(...withAfter.map((r) => r.after.hv.fallbackPct)) : 0,
      finalizerCallsMax: withAfter.length ? Math.max(...withAfter.map((r) => r.after.hv.finalizerCalls)) : 0,
      // heapStats() is cumulative over the CHILD, so the two numbers above are what a plane
      // INHERITED plus its own. These are each plane's own share, as deltas taken either side
      // of it, which is the number the fix is actually about.
      inPlaneFallbackPctMean: round(mean(inPlane.map((r) => r.inPlane.fallbackPct)), 3),
      inPlaneFallbackPctMax: inPlane.length ? Math.max(...inPlane.map((r) => r.inPlane.fallbackPct)) : 0,
      inPlaneFallbacksTotal: inPlane.reduce((a, r) => a + r.inPlane.fallbacks, 0),
      inPlaneAllocsTotal: inPlane.reduce((a, r) => a + r.inPlane.allocs, 0),
      inUsePeakInPlaneMax: inPlane.length ? Math.max(...inPlane.map((r) => r.hvInUsePeakInPlane || 0)) : 0,
      slotsReleasedTotal: ok.reduce((a, r) => a + (r.releasedSlots || 0), 0),
      collectionPointsInPlanes: ok.reduce((a, r) => a + (r.collectionsInPlane || 0), 0),
      generationYields: ok.reduce((a, r) => a + (r.generationYields || 0), 0),
      pauseMsTotal: round(ok.reduce((a, r) => a + (r.pauseMs || 0), 0), 1),
      asyncPlane: withAfter.length ? withAfter[0].asyncPlane === true : false,
      releaseOrganisms: withAfter.length ? withAfter[0].releaseOrganisms === true : false,
      collectFraction: withAfter.length ? withAfter[0].collectFraction : null,
    },
    // THE RESIDUE OF A PLANE, BY REGION. A child's rss is the JS heap node reports as
    // heapUsed, plus the ArrayBuffers it counts separately, plus a residue. The residue of a
    // plane is compared against the wasm linear memory the hypervector heap has TOUCHED: the
    // memory is installed once at its full size and cannot be resized or handed back, but a
    // page of it is resident only once written, so the residue steps up exactly when a plane
    // needs more slots than any plane before it in that child, and flattens when none does.
    residue,
    heldRssMBMean: round(mean(withAfter.map((r) => r.after.rssMB)), 3),
    heldRssMBMax: withAfter.length ? Math.max(...withAfter.map((r) => r.after.rssMB)) : 0,
    // The full series for one worker, so the shape can be read off the verdict rather than
    // taken from the summary above.
    fullSeriesWorker: perWorker[0] ? perWorker[0].worker : -1,
    fullSeries: oneWorker.map((r) => ({
      index: r.index, childSeq: r.childSeq, planeInChild: r.planeInChild,
      rssMB: r.after.rssMB, heapUsedMB: r.after.heapUsedMB, arrayBuffersMB: r.after.arrayBuffersMB,
      hvInUse: r.after.hv.inUse, hvPeak: r.after.hv.peak, hvFallbackPct: r.after.hv.fallbackPct,
      organisms: r.organisms, generations: r.generations,
    })),
  };

  const totals = {
    planesRequested: planes,
    planesCompleted: ok.length,
    planesFailed: failures.length,
    distinctDescriptors,
    workers, chunk, tickBudgetPerPlane: ticks,
    sweepWallMs: round(sweepMs, 1),
    sweepWallSeconds: round(sweepMs / 1000, 3),
    childWallMsSum: round(childWallMs, 1),
    parallelSpeedup: sweepMs > 0 ? round(childWallMs / sweepMs, 3) : 0,
    generations: totalGenerations,
    organisms: totalOrganisms,
    ticks: totalTicks,
    simulatedYears: totalYears,
    simulatedYearsPerWallSecond: yearsPerWallSecond,
    yearsArithmetic: 'sum over ' + ok.length + ' planes of (that plane ticks x its declared s/tick) / ' + SECONDS_PER_YEAR + ' s/year = ' +
      totalYears.toExponential(6) + ' organism-years; / ' + round(sweepMs / 1000, 3) + ' wall s = ' + yearsPerWallSecond.toExponential(6) + ' organism-years per wall second',
    costPerPlane: {
      wallMsMeanMeasuredInChild: round(mean(ok.map((r) => r.wallMs)), 1),
      wallMsSweepDivided: ok.length ? round(sweepMs / ok.length, 1) : 0,
      rssDeltaMBMean: round(mean(ok.map((r) => r.rssDeltaMB)), 3),
      rssPeakMBMean: round(mean(ok.map((r) => r.rssPeakMB)), 3),
      rssPeakMBMax: ok.length ? Math.max(...ok.map((r) => r.rssPeakMB)) : 0,
      ticksPerWallSecond: sweepMs > 0 ? round(totalTicks / (sweepMs / 1000), 3) : 0,
    },
    archiveCoverage: {
      capacityPerPlane: capacity,
      unionAfterFirstGeneration: before.size,
      unionAtEnd: after.size,
      fractionAfterFirstGeneration: round(before.size / capacity, 6),
      fractionAtEnd: round(after.size / capacity, 6),
      gained: after.size - before.size,
      cellsPerPlaneMean: round(mean(ok.map((r) => r.archiveFillAfter)), 3),
      placed: ok.reduce((a, r) => a + (r.archiveStats ? r.archiveStats.placed : 0), 0),
      replaced: ok.reduce((a, r) => a + (r.archiveStats ? r.archiveStats.replaced : 0), 0),
      rejected: ok.reduce((a, r) => a + (r.archiveStats ? r.archiveStats.rejected : 0), 0),
      evaluated: ok.reduce((a, r) => a + (r.archiveStats ? r.archiveStats.evaluated : 0), 0),
    },
    childGrowth,
    best,
  };

  if (!quiet) {
    console.log('');
    console.log('planes               ' + ok.length + ' completed, ' + failures.length + ' failed, of ' + planes + ' requested');
    console.log('distinct coordinates ' + distinctDescriptors + ' descriptors over ' + rows.length + ' rows');
    console.log('sweep wall           ' + totals.sweepWallSeconds + ' s across ' + workers + ' workers (' + totals.childWallMsSum + ' ms of child wall, speedup ' + totals.parallelSpeedup + 'x)');
    console.log('generations          ' + totalGenerations + ', ' + totalOrganisms + ' organisms, ' + totalTicks + ' ticks');
    console.log('simulated years      ' + totalYears.toExponential(6) + ' organism-years');
    console.log('  per wall second    ' + yearsPerWallSecond.toExponential(6) + ' organism-years/s');
    console.log('  arithmetic         ' + totals.yearsArithmetic);
    console.log('cost per plane       ' + totals.costPerPlane.wallMsMeanMeasuredInChild + ' ms mean in child, ' + totals.costPerPlane.wallMsSweepDivided + ' ms of sweep wall, ' +
      totals.costPerPlane.rssDeltaMBMean + ' MB mean rise, peak child rss ' + totals.costPerPlane.rssPeakMBMax + ' MB');
    console.log('ticks per wall sec   ' + totals.costPerPlane.ticksPerWallSecond);
    console.log('archive coverage     ' + before.size + ' of ' + capacity + ' cells after the first generation (' + (totals.archiveCoverage.fractionAfterFirstGeneration * 100).toFixed(3) +
      ' %) -> ' + after.size + ' at the end (' + (totals.archiveCoverage.fractionAtEnd * 100).toFixed(3) + ' %), gained ' + totals.archiveCoverage.gained);
    console.log('  per plane          ' + totals.archiveCoverage.cellsPerPlaneMean + ' cells mean; ' + totals.archiveCoverage.placed + ' placed, ' +
      totals.archiveCoverage.replaced + ' replaced, ' + totals.archiveCoverage.rejected + ' rejected of ' + totals.archiveCoverage.evaluated + ' evaluated');
    console.log('child growth         held rss mean ' + childGrowth.heldRssMBMean + ' MB, max ' + childGrowth.heldRssMBMax +
      ' MB; hv heap ' + childGrowth.hv.installedMB + ' MB installed (' + childGrowth.hv.planReason + ')');
    console.log('  inside a child     ' + childGrowth.withinChild.shape + ', slope of the mean ' + childGrowth.withinChild.slopeOfMeanMBPerPlane +
      ' MB per plane over ' + childGrowth.withinChild.children + ' children, mean first ' + childGrowth.withinChild.meanFirstMB +
      ' MB to mean last ' + childGrowth.withinChild.meanLastMB + ' MB, ' + childGrowth.withinChild.childrenThatNeverFall + ' never fell');
    for (const p of childGrowth.withinChild.meanRssByPosition) console.log('    plane ' + p.planeInChild + ' of a child  ' + p.rssMeanMB + ' MB mean over ' + p.planes + ' planes');
    for (const w of childGrowth.perWorker) console.log('  worker ' + w.worker + '           ' + w.shape + ', ' + w.planes + ' planes, first ' + w.rssFirstMB + ' MB, last ' + w.rssLastMB +
      ' MB, peak ' + w.rssPeakMB + ' MB, slope ' + w.slopeMBPerPlane + ' MB/plane, ' + w.risingSteps + ' up ' + w.fallingSteps + ' down');
    console.log('  hv slots           peak ' + childGrowth.hv.peakSlotsMax + ' in a plane, ' + childGrowth.hv.inUseAfterPlaneMax +
      ' still held after a plane at worst, fallback ' + childGrowth.hv.fallbackPctMean + ' % mean ' + childGrowth.hv.fallbackPctMax +
      ' % max, gc in children ' + childGrowth.gcAvailableInChildren);
    console.log('  inside a plane     fallback ' + childGrowth.hv.inPlaneFallbackPctMean + ' % mean ' + childGrowth.hv.inPlaneFallbackPctMax +
      ' % max (a plane against its OWN allocs: ' + childGrowth.hv.inPlaneFallbacksTotal + ' of ' +
      (childGrowth.hv.inPlaneAllocsTotal + childGrowth.hv.inPlaneFallbacksTotal) + ' attempts), peak held inside a plane ' +
      childGrowth.hv.inUsePeakInPlaneMax + ' slots');
    console.log('  the fix            async plane ' + childGrowth.hv.asyncPlane + ', release ' + childGrowth.hv.releaseOrganisms +
      ', collect at ' + childGrowth.hv.collectFraction + ' of the slots: ' + childGrowth.hv.generationYields + ' generation yields, ' +
      childGrowth.hv.collectionPointsInPlanes + ' of them collection points, ' + childGrowth.hv.slotsReleasedTotal +
      ' slots released by organisms, ' + childGrowth.hv.pauseMsTotal + ' ms suspended in all');
    console.log('  residue           ' + childGrowth.residue.rule);
    console.log('                     residue minus touched pages ' + childGrowth.residue.residueMinusTouchedMeanMB + ' MB mean, sd ' +
      childGrowth.residue.residueMinusTouchedSdMB + ' MB over ' + childGrowth.residue.series.length + ' planes of worker ' +
      childGrowth.residue.worker + '; ' + childGrowth.residue.childrenThatFlatten + ' of ' + childGrowth.residue.children + ' children flatten');
    console.log('                     by region: v8 slack ' + childGrowth.residue.v8SlackMeanMB + ' MB mean, external ' +
      childGrowth.residue.externalMeanMB + ' MB (of which the hv heap has written ' + childGrowth.residue.hvTouchedMeanMB +
      ' MB and never touched ' + childGrowth.residue.hvUntouchedMeanMB + ' MB), rest ' +
      childGrowth.residue.restMeanMB + ' MB (sd ' + childGrowth.residue.restSdMB + ')');
    for (const f of childGrowth.residue.perChild) console.log('    child ' + f.childSeq + ' residue ' + f.firstResidueMB + ' to ' + f.lastResidueMB +
      ' MB over ' + f.planes + ' planes, flattens at ' + (f.flattensAtPlane === null ? 'no plane' : 'plane ' + f.flattensAtPlane));
    if (best) console.log('best                 ' + best.fitness + ' (' + best.id + ', plane ' + best.plane + ' ' + best.descriptor + ', cell ' + best.key + ', gen ' + best.gen + ', ' + best.cells + ' cells, ' + best.edges + ' edges)');
    for (const f of failures.slice(0, 10)) console.log('failed plane ' + f.index + ': ' + String(f.reason).slice(0, 200));
  }

  // ---------------------------------------------------------------- verdict
  // Written after the sweep finished and after every number above was computed from rows
  // this run produced. Nothing here is typed by hand.
  const verdict = {
    at: new Date().toISOString(),
    node: process.version,
    platform: process.platform,
    cpus: os.availableParallelism ? os.availableParallelism() : os.cpus().length,
    command,
    config: { planes, ticks, base, venueShare, chunk, planeMs, workersAsked: asked === null ? null : Number(asked), workersUsed: workers, collectFraction, releaseOrganisms },
    ...totals,
    failures,
    rows: rows.map((r) => ({
      index: r.index, descriptor: r.descriptor, ok: r.ok,
      world: r.coordinate ? r.coordinate.world : null,
      secondsPerTick: r.secondsPerTick ?? (r.coordinate ? r.coordinate.secondsPerTick : null),
      epochScale: r.coordinate ? r.coordinate.epochScale : null,
      generations: r.generations, organisms: r.organisms, ticks: r.ticks,
      simulatedYears: r.simulatedYears, yearsArithmetic: r.yearsArithmetic,
      wallMs: r.wallMs, pauseMs: r.pauseMs ?? null, rssPeakMB: r.rssPeakMB, rssStartMB: r.rssStartMB, rssDeltaMB: r.rssDeltaMB,
      generationYields: r.generationYields ?? null, releasedSlots: r.releasedSlots ?? null,
      collectionsInPlane: r.collectionsInPlane ?? null, hvInUsePeakInPlane: r.hvInUsePeakInPlane ?? null,
      inPlane: r.inPlane || null,
      archiveFillBefore: r.archiveFillBefore, archiveFillAfter: r.archiveFillAfter, archiveAdded: r.archiveAdded,
      qd: r.qd, best: r.best, error: r.error || null,
      // what the child was still holding after this plane, and the heap counters behind it
      worker: r.worker ?? null, childSeq: r.childSeq ?? null, planeInChild: r.planeInChild ?? null,
      after: r.after || null,
    })),
  };
  mkdirSync(path.dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(verdict, null, 2) + '\n');
  if (!quiet) console.log('verdict              ' + path.relative(ROOT, outFile).replaceAll('\\', '/'));
  process.exit(failures.length && !ok.length ? 1 : 0);
}
