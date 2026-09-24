// bench/epochs.mjs: RUN THE ORGANISM THROUGH DEEP TIME FOR A WALL BUDGET.
//
// Five minutes by default. What it prints is what it did: generations completed, organisms
// evaluated, ticks run, the simulated years those ticks are worth with the arithmetic shown,
// how many cells of the MAP-Elites archive filled and when, the best organism and every
// component of its score, and the number of source lines the emitted elites put on disk,
// counted by reading the files back rather than by adding up what the emitter claimed.
//
//   node bench/epochs.mjs [--minutes 5] [--pop 12] [--ticks 160] [--seed epochs]
//                         [--emit 20] [--resume] [--quiet] [--no-suites]
//
// The verdict is bench/verdicts/epochs.json.
import { mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { Epochs, gridCapacity, SECONDS_PER_YEAR, BRAIN_ROOT } from '../generations/epochs.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.slice(2);
    const v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) { out[k] = true; continue; }
    out[k] = /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v;
    i++;
  }
  return out;
}

// Directories a previous emission left behind. Cleared before a fresh run so the line count
// is this run's tree and not this run plus whatever was there before.
function clearEmitted(dir) {
  if (!existsSync(dir)) return 0;
  let n = 0;
  for (const name of readdirSync(dir)) {
    if (!/^gen-\d+-[\d-]+$/.test(name)) continue;
    rmSync(path.join(dir, name), { recursive: true, force: true });
    n++;
  }
  return n;
}

export async function run(opts = {}) {
  const a = {
    minutes: 5, pop: 12, ticks: 160, windows: 4, seed: 'epochs', emit: 20,
    checkpointEvery: 10, quiet: false, resume: false, suites: true, ...opts,
  };
  if (a['no-suites']) a.suites = false;
  const budgetMs = Number(a.minutes) * 60_000;
  const organismDir = path.join(BRAIN_ROOT, 'organism');

  let engine = null;
  if (a.resume) engine = Epochs.resume(null, { emit: true, emitLimit: Number(a.emit) });
  if (!engine) {
    clearEmitted(organismDir);
    engine = new Epochs({
      seed: String(a.seed), popSize: Number(a.pop), ticks: Number(a.ticks), windows: Number(a.windows),
      checkpointEvery: Number(a.checkpointEvery), emit: true, emitLimit: Number(a.emit), suites: a.suites,
    }).init();
  }

  if (!a.quiet) {
    const m = engine.manifest();
    process.stdout.write('bench/epochs: budget ' + a.minutes + ' min, pop ' + m.popSize + ', ticks/organism ' +
      m.ticksPerOrganism + ', emit first ' + a.emit + ' elites' + (engine.resumedFrom ? ', resumed from ' + engine.resumedFrom : '') + '\n');
    process.stdout.write('years clock:  1 tick = ' + m.secondsPerTick + ' organism-seconds (core/clock.mjs: 1 tick = 1 ms logical); 1 year = ' + SECONDS_PER_YEAR + ' s\n');
    process.stdout.write('              one generation = ' + m.popSize + ' organisms x ' + m.ticksPerOrganism + ' ticks = ' +
      m.ticksPerGeneration + ' ticks = ' + m.organismSecondsPerGeneration + ' organism-seconds = ' + m.yearsPerGeneration.toExponential(4) + ' organism-years\n');
    process.stdout.write('archive:      ' + gridCapacity() + ' reachable cells over 4 behaviour descriptors\n\n');
  }

  const t0 = process.hrtime.bigint();
  const rows = [];
  while (Number(process.hrtime.bigint() - t0) / 1e6 < budgetMs) {
    const row = engine.step();
    rows.push(row);
    if (!a.quiet) {
      process.stdout.write(
        'gen ' + String(row.gen).padStart(4) +
        '  best ' + row.best.toFixed(6) +
        '  genBest ' + row.genBest.toFixed(6) +
        '  genMean ' + row.genMean.toFixed(6) +
        '  fill ' + String(row.fill).padStart(4) + ' (+' + row.newCells + ')' +
        '  qd ' + row.qd.toFixed(3) +
        '  years ' + row.years.toExponential(4) +
        '  ' + String(Math.round(row.ms)).padStart(6) + ' ms\n');
    }
  }
  const wallMs = Number(process.hrtime.bigint() - t0) / 1e6;
  const file = engine.checkpoint();

  const onDisk = engine.countEmittedLines();
  const s = engine.summary();
  const y = engine.years();
  // The numerator is the generations THIS RUN completed, never the running total: on a
  // resumed run the total counts generations that some earlier wall clock paid for, and
  // dividing it by this run's wall seconds would report a rate that rises every time the
  // bench is resumed. On a fresh run the two are equal and the number is the same.
  const generationsPerMinute = (rows.length / (wallMs / 60_000));

  const verdict = {
    bench: 'epochs',
    when: new Date().toISOString(),
    node: process.version, platform: process.platform,
    cpus: os.availableParallelism ? os.availableParallelism() : os.cpus().length,
    config: { minutes: a.minutes, pop: engine.popSize, ticks: engine.ticks, windows: engine.windows, seed: engine.seed, emitLimit: engine.emitLimit, suites: engine.suites, resumed: engine.resumedFrom || null },
    manifest: engine.manifest(),
    wallMs: Number(wallMs.toFixed(1)),
    generations: s.generations,
    generationsThisRun: rows.length,
    generationsPerMinute: Number(generationsPerMinute.toFixed(3)),
    secondsPerGenerationMean: Number((wallMs / 1000 / Math.max(1, rows.length)).toFixed(4)),
    organisms: s.organisms,
    ticks: s.ticks,
    simulatedYears: y.years,
    simulatedLineageYears: y.lineageYears,
    yearsArithmetic: y.arithmetic,
    archive: {
      fill: s.archiveFill, capacity: s.archiveCapacity,
      fillFraction: Number((s.archiveFill / s.archiveCapacity).toFixed(6)),
      qd: s.qd, stats: s.archiveStats,
      fillHistory: engine.archive.fillHistory,
      cells: engine.archive.elites().map((e) => ({ key: e.key, id: e.id, gen: e.gen, fitness: e.fitness, cells: e.cells, edges: e.edges, descriptors: e.descriptors, emitted: e.emitted })),
    },
    best: s.best,
    emission: {
      directories: engine.emissions.length,
      linesReportedByEmitter: s.emittedLines,
      linesCountedOnDisk: onDisk.lines,
      filesOnDisk: onDisk.files,
      agree: onDisk.lines === s.emittedLines,
      each: engine.emissions,
    },
    perGeneration: rows,
    stats: s.stats,
    checkpoint: path.relative(BRAIN_ROOT, file).replaceAll('\\', '/'),
    lastError: s.lastError,
  };

  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  const out = path.join(HERE, 'verdicts', 'epochs.json');
  writeFileSync(out, JSON.stringify(verdict, null, 2) + '\n');

  if (!a.quiet) {
    const b = s.best;
    process.stdout.write('\n');
    process.stdout.write('wall                 ' + (wallMs / 1000).toFixed(2) + ' s\n');
    process.stdout.write('generations          ' + s.generations + ' total, ' + rows.length + ' this run\n');
    process.stdout.write('generations/minute   ' + verdict.generationsPerMinute + '  (' + rows.length + ' generations over ' + (wallMs / 60_000).toFixed(3) + ' wall minutes)\n');
    process.stdout.write('seconds/generation   ' + verdict.secondsPerGenerationMean + ' mean over ' + rows.length + '\n');
    process.stdout.write('organisms evaluated  ' + s.organisms + '\n');
    process.stdout.write('ticks run            ' + s.ticks + '\n');
    process.stdout.write('simulated years      ' + y.years.toExponential(6) + ' organism-years\n');
    process.stdout.write('  arithmetic         ' + y.arithmetic + '\n');
    process.stdout.write('  one lineage        ' + y.lineageYears.toExponential(6) + ' organism-years over ' + s.generations + ' generations\n');
    process.stdout.write('archive fill         ' + s.archiveFill + ' of ' + s.archiveCapacity + ' cells (' + (verdict.archive.fillFraction * 100).toFixed(3) + ' %), qd ' + s.qd + '\n');
    process.stdout.write('archive placements   ' + s.archiveStats.placed + ' placed, ' + s.archiveStats.replaced + ' replaced, ' + s.archiveStats.rejected + ' rejected of ' + s.archiveStats.evaluated + ' evaluated\n');
    if (b) {
      process.stdout.write('best                 ' + b.fitness + ' (' + b.id + ', cell ' + b.key + ', gen ' + b.gen + ', ' + b.cells + ' cells, ' + b.edges + ' edges)\n');
      process.stdout.write('  components         ' + Object.entries(b.components).map(([k, v]) => k + ' ' + Number(v).toFixed(4)).join(', ') + '\n');
    }
    process.stdout.write('emitted              ' + engine.emissions.length + ' elites under organism/\n');
    process.stdout.write('generated lines      ' + onDisk.lines + ' in ' + onDisk.files + ' files, counted on disk' +
      (verdict.emission.agree ? ' (the emitter reported the same)' : ' (the emitter reported ' + s.emittedLines + ')') + '\n');
    process.stdout.write('checkpoint           ' + verdict.checkpoint + '\n');
    process.stdout.write('verdict              ' + path.relative(BRAIN_ROOT, out).replaceAll('\\', '/') + '\n');
    if (s.lastError) process.stdout.write('last error           ' + s.lastError + '\n');
  }
  return verdict;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  run(parseArgs(process.argv.slice(2))).then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}
