// bench/scale.mjs: DOES THE ORGANISM HOLD AT SCALE?
//
// For each size it builds the organism, writes it out as source, imports that source back,
// verifies the reloaded brain against the manifest, and ticks both. Every number printed
// here is measured by this run: nothing is estimated and nothing is carried over from a
// previous one. Usage:
//
//   node bench/scale.mjs [--sizes 1000,5000] [--ticks 20] [--keep 5000] [--split 20000]
//
// --keep names the size whose emitted source stays on disk, in brain/organism/gen-0. Every
// other size is emitted into a temporary directory and deleted, because the point of those
// sizes is the timing, not the artefact.
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOrganism, auditWiring } from '../seeds/organism.mjs';
import { emitOrganism } from '../genome/emit.mjs';
import { loadFrom, verify, diffOrganisms } from '../genome/load.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const argv = process.argv.slice(2);
const arg = (name, dflt) => { const i = argv.indexOf('--' + name); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : dflt; };
const sizes = String(arg('sizes', '1000,5000')).split(',').map(Number);
const ticks = Number(arg('ticks', 20));
const keepSize = Number(arg('keep', 5000));
const keepName = String(arg('name', 'gen-0'));
const subcells = Number(arg('subcells', 8));
const edgesPerCell = Number(arg('edges', 12));
// The emitter splits files at 20000 lines and refuses a regions.mjs over that; one line per
// circuit means an organism past 19,986 majors needs a wider split, declared here, never hidden.
const split = Number(arg('split', 20000));

const ms = () => Number(process.hrtime.bigint()) / 1e6;
const mb = (bytes) => +(bytes / 1048576).toFixed(1);
// A rate rounded to an integer turns 1.47 ticks per second into 1, which reads as a
// different measurement. Rates under 100 keep two decimals.
const per = (n, milli) => {
  if (!(milli > 0)) return 0;
  const r = n / (milli / 1000);
  return r >= 100 ? Math.round(r) : +r.toFixed(2);
};

const results = [];
for (const majors of sizes) {
  const keep = majors === keepSize;
  const name = keep ? keepName : 'scale-' + majors;
  const dir = keep ? path.join(ROOT, 'organism', name) : path.join(tmpdir(), 'brain-scale-' + majors + '-' + process.pid);

  const tBuild = ms();
  const built = buildOrganism({ majors, subcellsPerMajor: subcells, edgesPerCell, name });
  const buildMs = +(ms() - tBuild).toFixed(1);
  // Absolute, not a delta: the garbage collector runs between the two reads, so a delta
  // can come back negative and would be a number that measures the collector, not the brain.
  const memBuilt = process.memoryUsage();

  const audit = auditWiring(built);

  const tEmit = ms();
  const em = emitOrganism(built, { dir, split });
  const emitMs = +(ms() - tEmit).toFixed(1);

  const tLoad = ms();
  const { brain: loaded, manifest } = await loadFrom(dir);
  const loadMs = +(ms() - tLoad).toFixed(1);

  const v = verify(loaded, manifest);
  const d = diffOrganisms(built, loaded);

  const tTickA = ms();
  built.tick(ticks);
  const tickBuiltMs = +(ms() - tTickA).toFixed(1);

  const tTickB = ms();
  loaded.tick(ticks);
  const tickLoadedMs = +(ms() - tTickB).toFixed(1);

  const sameStats = JSON.stringify(built.stats) === JSON.stringify(loaded.stats);
  const heapPeak = process.memoryUsage();

  const row = {
    majors, cells: built.cells.length, circuits: built.circuits.size, regions: built.regions.size,
    edges: built.connectome.size(), edgesPerCellActual: +(built.connectome.size() / built.cells.length).toFixed(2),
    buildMs, emitMs, loadMs,
    files: em.files.length + 1, linesWritten: em.lines, bytesWritten: em.bytes,
    ticks, tickBuiltMs, tickLoadedMs,
    runs: loaded.stats.runs, signals: loaded.stats.signals, delivered: loaded.stats.delivered,
    runsPerSec: per(loaded.stats.runs, tickLoadedMs),
    ticksPerSec: per(ticks, tickLoadedMs),
    deliveriesPerSec: per(loaded.stats.delivered, tickLoadedMs),
    cellsBuiltPerSec: per(built.cells.length, buildMs),
    edgesEmittedPerSec: per(built.connectome.size(), emitMs),
    linesLoadedPerSec: per(em.lines, loadMs),
    heapAfterBuildMB: mb(memBuilt.heapUsed), rssAfterBuildMB: mb(memBuilt.rss),
    heapWithBothMB: mb(heapPeak.heapUsed), rssWithBothMB: mb(heapPeak.rss),
    illegalEdges: built.genome.wiring.illegal, auditFaults: audit.faults.length,
    refusedSignals: loaded.stats.refused, cellErrors: loaded.stats.errors,
    verified: v.ok, checkedEdges: v.checkedEdges, identical: d.same, sameStatsAfterTicks: sameStats,
    hash: v.hash, kept: keep ? path.relative(ROOT, dir).replaceAll('\\', '/') : null,
  };
  results.push(row);
  console.log(Object.entries(row).map(([k, x]) => k + '=' + x).join(' '));
  if (!v.ok) console.log('  VERIFY ERRORS: ' + v.errors.join(' | '));
  if (!d.same) console.log('  DIFFERENCES: ' + d.differences.join(' | '));
  if (audit.faults.length) console.log('  AUDIT FAULTS: ' + audit.faults.join(' | '));

  if (!keep && existsSync(dir)) rmSync(dir, { recursive: true, force: true });
}

const green = results.every(r => r.verified && r.identical && r.sameStatsAfterTicks && r.illegalEdges === 0 && r.auditFaults === 0 && r.refusedSignals === 0 && r.cellErrors === 0);
mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
writeFileSync(path.join(HERE, 'verdicts', 'scale.json'), JSON.stringify({
  at: new Date().toISOString(), node: process.version,
  cpus: (await import('node:os')).availableParallelism(),
  args: { sizes, ticks, subcells, edgesPerCell, keepSize, keepName },
  results, verdict: green ? 'GREEN' : 'RED',
}, null, 2));
console.log('\nSCALE ' + (green ? 'GREEN' : 'RED') + ': ' + results.length + ' sizes, ' +
  results.map(r => r.majors + ' majors ' + r.cells + ' cells ' + r.edges + ' edges ' + r.linesWritten + ' lines').join(', '));
console.log('wrote bench/verdicts/scale.json');
process.exit(green ? 0 : 1);
