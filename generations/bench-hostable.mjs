// generations/bench-hostable.mjs: WHAT THE ROSTER CHANGE AND THE HOSTED SUITE ARE WORTH.
//
// Two measurements, both written into bench/verdicts/generations-hostable.json.
//
//   deep time   one short run of generations/epochs.mjs, the same engine bench/epochs.mjs
//               drives. It is driven from here rather than from that bench for one reason:
//               bench/epochs.mjs calls engine.checkpoint() unconditionally at the end of a
//               run, which writes under brain/state, and state is not this session's to
//               write to. Everything else is the same object with the same defaults, and
//               the run is recorded with checkpointEvery 0, emit off and a checkpoint
//               directory outside the repository.
//
//               The run is done TWICE, with --label before and --label after, on either
//               side of the roster change of seeds/organism.mjs, same seed, same budget,
//               same machine. Each run writes its own block, so the file carries both and
//               neither is a number anybody typed.
//
//   hosted      the algebra and sequence suites answered twice on the SAME problems: once
//               by the small brain each suite builds for itself, and once INSIDE an
//               organism grown by seeds/organism.mjs, through cells named by
//               tasks/host.mjs and read through a tap. The difference is published, and so
//               are the roles the organism has no cell for.
//
// Run:  node generations/bench-hostable.mjs --label after [--minutes 3] [--majors 200]
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { Epochs, gridCapacity } from './epochs.mjs';
import { hostableSuites, rosterVocabulary, suiteKinds } from './organism-genome.mjs';
import { buildOrganism } from '../seeds/organism.mjs';
import {
  generateAlgebra, solveAlgebra, gradeAlgebra, algebraCellsOf,
  generateSequences, solveSequences, gradeSequences, sequenceCellsOf,
} from '../tasks/index.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'bench', 'verdicts', 'generations-hostable.json');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) { out[a.slice(2)] = true; continue; }
    out[a.slice(2)] = /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v;
    i++;
  }
  return out;
}

const ALGEBRA_COUNTS = { decimalCompare: 20, decimalSum: 16, bigintMul: 16, fractionArith: 16, nestedEval: 16, power: 16, linearSolve: 20 };
const SEQUENCE_COUNTS = { arithmetic: 10, geometric: 8, periodic: 8, recurrence: 8, polynomial: 10 };

// ---------------------------------------------------------------- deep time
function deepTime({ minutes, pop, ticks, windows, seed }) {
  const dir = path.join(tmpdir(), 'brain-hostable-' + process.pid);
  const engine = new Epochs({
    seed, popSize: pop, ticks, windows,
    checkpointEvery: 0, dir, emit: false, suites: true,
  }).init();
  const budgetMs = minutes * 60_000;
  const t0 = process.hrtime.bigint();
  const rows = [];
  while (Number(process.hrtime.bigint() - t0) / 1e6 < budgetMs) {
    const row = engine.step();
    rows.push(row);
    process.stdout.write('gen ' + String(row.gen).padStart(4) + '  best ' + row.best.toFixed(6) +
      '  genMean ' + row.genMean.toFixed(6) + '  fill ' + String(row.fill).padStart(4) +
      ' (+' + row.newCells + ')  qd ' + row.qd.toFixed(3) + '  ' + String(Math.round(row.ms)).padStart(6) + ' ms\n');
  }
  const wallMs = Number(process.hrtime.bigint() - t0) / 1e6;
  const s = engine.summary();
  const elites = engine.archive.elites();
  const taskOf = (e) => (e.components && Number.isFinite(e.components.task) ? e.components.task : null);
  const tasks = elites.map(taskOf).filter((v) => v !== null);
  const meanTask = tasks.length ? tasks.reduce((a, v) => a + v, 0) / tasks.length : null;
  return {
    config: { minutes, pop, ticks, windows, seed },
    wallSeconds: Number((wallMs / 1000).toFixed(3)),
    generations: s.generations,
    organisms: s.organisms,
    ticks: s.ticks,
    archiveFill: s.archiveFill,
    archiveCapacity: s.archiveCapacity,
    archiveFillPercent: Number(((s.archiveFill / s.archiveCapacity) * 100).toFixed(4)),
    qd: s.qd,
    archiveStats: s.archiveStats,
    best: s.best,
    bestTask: s.best ? Number(s.best.components.task.toFixed(6)) : null,
    eliteTaskMean: meanTask === null ? null : Number(meanTask.toFixed(6)),
    eliteTaskCount: tasks.length,
    errors: s.stats.errors,
    lastError: s.lastError,
  };
}

// ---------------------------------------------------------------- hosted suites
function hosted({ majors, subcells, seed }) {
  const algebraProblems = generateAlgebra({ seed: seed + '/algebra', counts: ALGEBRA_COUNTS });
  const sequenceProblems = generateSequences({ seed: seed + '/sequence', counts: SEQUENCE_COUNTS });

  // own brain
  const ownAlgebra = gradeAlgebra(algebraProblems, solveAlgebra(algebraProblems).results);
  const ownSequence = gradeSequences(sequenceProblems, solveSequences(sequenceProblems, { baseline: false }).results);

  // inside the organism
  const brain = buildOrganism({ majors, subcellsPerMajor: subcells, name: 'hostable', seed: 'organism' });
  const grown = { cells: brain.cells.length, edges: brain.connectome.n };
  const aNamed = algebraCellsOf(brain);
  const sNamed = sequenceCellsOf(brain);
  const errorsBefore = brain.stats.errors;
  const grownBefore = brain.connectome.n;
  const hostAlgebraResults = solveAlgebra(algebraProblems, { brain, cells: aNamed.cells }).results;
  const hostAlgebra = gradeAlgebra(algebraProblems, hostAlgebraResults);
  const hostSequence = gradeSequences(sequenceProblems, solveSequences(sequenceProblems, { brain, cells: sNamed.cells }).results);

  // How many problems of each role the organism answered at all, as against answered
  // correctly: a role with no cell answers none, which is why the accuracy fell.
  const byRole = {};
  for (const r of hostAlgebraResults) {
    const e = byRole[r.role] || (byRole[r.role] = { n: 0, answered: 0 });
    e.n++; if (r.got !== null) e.answered++;
  }

  return {
    organism: {
      majors, subcellsPerMajor: subcells,
      cellsAsGrown: grown.cells, edgesAsGrown: grown.edges,
      // After the suites have run. The cells added are the read heads, one per named cell.
      // The edges added are one per read head PLUS whatever co-activation growth added
      // while the organism was ticking, which is why the two are counted apart.
      cellsAfterRun: brain.cells.length, edgesAfterRun: brain.connectome.n,
      readHeadsAdded: brain.cells.length - grown.cells,
      edgesAddedByGrowth: brain.connectome.n - grownBefore - (brain.cells.length - grown.cells),
      edgesGrownByCoactivation: brain.stats.grown,
    },
    algebra: {
      n: ownAlgebra.n,
      ownBrainAccuracy: Number(ownAlgebra.accuracy.toFixed(6)),
      insideOrganismAccuracy: Number(hostAlgebra.accuracy.toFixed(6)),
      difference: Number((hostAlgebra.accuracy - ownAlgebra.accuracy).toFixed(6)),
      ownBrainCorrect: ownAlgebra.correct,
      insideOrganismCorrect: hostAlgebra.correct,
      rolesFilled: aNamed.chosen.map((c) => c.role + '=' + c.id + '@' + c.period),
      rolesMissing: aNamed.missing,
      byKindInsideOrganism: Object.fromEntries(Object.entries(hostAlgebra.byKind).map(([k, v]) => [k, Number(v.accuracy.toFixed(6))])),
      answeredByRole: byRole,
    },
    sequence: {
      n: ownSequence.n,
      ownBrainAccuracy: Number(ownSequence.accuracy.toFixed(6)),
      insideOrganismAccuracy: Number(hostSequence.accuracy.toFixed(6)),
      difference: Number((hostSequence.accuracy - ownSequence.accuracy).toFixed(6)),
      ownBrainCorrect: ownSequence.correct,
      insideOrganismCorrect: hostSequence.correct,
      rolesFilled: sNamed.chosen.map((c) => c.role + '=' + c.id + '@' + c.period),
      rolesMissing: sNamed.missing,
    },
    // The grid suite is NOT hosted: tasks/grid.mjs answers by wiring the program it found
    // as a fresh chain of cells and running that chain, so the cells that compute the
    // answer are built for the task rather than named in a brain that already exists.
    grid: { hostedInsideOrganism: false, why: 'solveGrids wires a fresh cell chain per task; there is no existing cell to name' },
    cellErrorsRaisedInsideOrganism: brain.stats.errors - errorsBefore,
  };
}

// ---------------------------------------------------------------- main
const a = parseArgs(process.argv.slice(2));
const label = a.label === 'before' ? 'before' : 'after';
const minutes = Number(a.minutes ?? 3);
const majors = Number(a.majors ?? 200);
const subcells = Number(a.subcells ?? 8);

const vocab = rosterVocabulary();
const kinds = suiteKinds();
const { hostable, unreachable } = hostableSuites();
process.stdout.write('label               ' + label + '\n');
process.stdout.write('roster vocabulary   ' + vocab.size + ' kinds\n');
process.stdout.write('hostable suites     ' + hostable.length + ' of ' + kinds.size + ': ' + hostable.join(', ') + '\n');
process.stdout.write('unreachable         ' + (unreachable.length ? unreachable.map((u) => u.suite + ' (missing ' + u.missing.join(' ') + ')').join('; ') : 'none') + '\n\n');

let verdict = { bench: 'generations-hostable' };
if (existsSync(OUT)) { try { verdict = JSON.parse(readFileSync(OUT, 'utf8')); } catch { verdict = { bench: 'generations-hostable' }; } }

// --only hosted re-measures the hosted suites and keeps the deep time block a previous run
// of this same label wrote, so a change to what the hosted part records does not cost
// another deep time run. Without it, both parts are measured fresh.
const only = a.only === 'hosted' ? 'hosted' : null;
const kept = only === 'hosted' && verdict[label] ? verdict[label].deepTime : null;
if (only === 'hosted' && !kept) throw new Error('--only hosted: no deep time block for label ' + label + ' to keep');

const block = {
  label,
  rosterVocabularySize: vocab.size,
  suitesDeclared: kinds.size,
  hostableCount: hostable.length,
  hostable,
  unreachable,
  deepTime: kept || deepTime({ minutes, pop: Number(a.pop ?? 12), ticks: Number(a.ticks ?? 160), windows: Number(a.windows ?? 4), seed: String(a.seed ?? 'hostable') }),
  deepTimeKeptFromEarlierRun: !!kept,
};
if (label === 'after') block.hosted = hosted({ majors, subcells, seed: String(a.seed ?? 'hostable') });

verdict.bench = 'generations-hostable';
verdict.at = new Date().toISOString();
verdict.node = process.version;
verdict.platform = process.platform;
verdict.cpus = os.availableParallelism ? os.availableParallelism() : os.cpus().length;
verdict[label] = block;
if (verdict.before && verdict.after) {
  verdict.delta = {
    hostableCount: verdict.after.hostableCount - verdict.before.hostableCount,
    bestTask: Number((verdict.after.deepTime.bestTask - verdict.before.deepTime.bestTask).toFixed(6)),
    bestFitness: Number((verdict.after.deepTime.best.fitness - verdict.before.deepTime.best.fitness).toFixed(6)),
    archiveFill: verdict.after.deepTime.archiveFill - verdict.before.deepTime.archiveFill,
    generations: verdict.after.deepTime.generations - verdict.before.deepTime.generations,
  };
}

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(verdict, null, 2) + '\n');

const d = block.deepTime;
process.stdout.write('\nwall                ' + d.wallSeconds + ' s\n');
process.stdout.write('generations         ' + d.generations + ', organisms ' + d.organisms + ', ticks ' + d.ticks + '\n');
process.stdout.write('archive fill        ' + d.archiveFill + ' of ' + d.archiveCapacity + ' (' + d.archiveFillPercent + ' %), qd ' + d.qd + '\n');
if (d.best) {
  process.stdout.write('best                ' + d.best.fitness + ' (' + d.best.id + ', cell ' + d.best.key + ', gen ' + d.best.gen + ', ' + d.best.cells + ' cells, ' + d.best.edges + ' edges)\n');
  process.stdout.write('  components        ' + Object.entries(d.best.components).map(([k, v]) => k + ' ' + Number(v).toFixed(4)).join(', ') + '\n');
}
process.stdout.write('best task           ' + d.bestTask + '\n');
process.stdout.write('elite task mean     ' + d.eliteTaskMean + ' over ' + d.eliteTaskCount + ' archive elites\n');
process.stdout.write('eval errors         ' + d.errors + (d.lastError ? ' (' + d.lastError + ')' : '') + '\n');
if (block.hosted) {
  const h = block.hosted;
  process.stdout.write('\norganism            ' + h.organism.cellsAsGrown + ' cells, ' + h.organism.edgesAsGrown + ' edges as grown\n');
  process.stdout.write('  after the suites  ' + h.organism.cellsAfterRun + ' cells, ' + h.organism.edgesAfterRun + ' edges: +' +
    h.organism.readHeadsAdded + ' read heads and their edges, +' + h.organism.edgesAddedByGrowth + ' edges from co-activation growth (brain.stats.grown ' + h.organism.edgesGrownByCoactivation + ')\n');
  process.stdout.write('algebra own brain   ' + h.algebra.ownBrainAccuracy + ' (' + h.algebra.ownBrainCorrect + ' of ' + h.algebra.n + ')\n');
  process.stdout.write('algebra in organism ' + h.algebra.insideOrganismAccuracy + ' (' + h.algebra.insideOrganismCorrect + ' of ' + h.algebra.n + '), difference ' + h.algebra.difference + '\n');
  process.stdout.write('  roles filled      ' + h.algebra.rolesFilled.join(' ') + '\n');
  process.stdout.write('  roles missing     ' + (h.algebra.rolesMissing.length ? h.algebra.rolesMissing.join(' ') : 'none') + '\n');
  process.stdout.write('sequence own brain  ' + h.sequence.ownBrainAccuracy + ' (' + h.sequence.ownBrainCorrect + ' of ' + h.sequence.n + ')\n');
  process.stdout.write('sequence in organism ' + h.sequence.insideOrganismAccuracy + ' (' + h.sequence.insideOrganismCorrect + ' of ' + h.sequence.n + '), difference ' + h.sequence.difference + '\n');
  process.stdout.write('grid                on its own brain: ' + h.grid.why + '\n');
  process.stdout.write('cell errors raised  ' + h.cellErrorsRaisedInsideOrganism + '\n');
}
if (verdict.delta) {
  process.stdout.write('\ndelta hostable      ' + verdict.delta.hostableCount + '\n');
  process.stdout.write('delta best task     ' + verdict.delta.bestTask + '\n');
  process.stdout.write('delta best fitness  ' + verdict.delta.bestFitness + '\n');
  process.stdout.write('delta archive fill  ' + verdict.delta.archiveFill + '\n');
}
process.stdout.write('\nverdict             ' + path.relative(ROOT, OUT).replaceAll('\\', '/') + '\n');
