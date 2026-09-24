// bench/evolve.mjs: how fast does the organism iterate? Runs the generations engine on the
// race task for a fixed wall time and prints what it actually did: genomes per second,
// episodes per second, generations completed, best fitness per generation, species count,
// worker count. The verdict is written to bench/verdicts/evolve.json.
//
// His phrase for this is "millions of years in five minutes". This file prints generations
// per minute and nothing else. Whatever that number is, it is the number.
//
//   node bench/evolve.mjs [--ms 60000] [--task race] [--pop 300] [--episodes 2]
//                         [--workers N] [--seed evolve] [--quiet]
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { Engine } from '../generations/engine.mjs';
import { workerCount } from '../generations/evaluate.mjs';
import { getTask } from '../generations/tasks/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function args(argv) {
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

export async function run(opts = {}) {
  const a = { ms: 60000, task: 'race', pop: 300, episodes: 2, seed: 'evolve', workers: workerCount(), quiet: false, ...opts };
  const task = getTask(a.task);
  const engine = new Engine({
    task: a.task, seed: a.seed, popSize: a.pop, episodes: a.episodes,
    workers: a.workers, parallel: a.workers > 1,
  }).init();

  const line = (s) => {
    if (a.quiet) return;
    process.stdout.write(
      'gen ' + String(s.gen).padStart(4) +
      '  best ' + s.best.toFixed(5) +
      '  mean ' + s.mean.toFixed(5) +
      '  champ ' + (s.champion == null ? '   -   ' : s.champion.toFixed(5)) +
      '  ctrl ' + (s.control == null ? '   -   ' : s.control.toFixed(5)) +
      '  ' + (s.decision || '').padEnd(8) +
      '  species ' + String(s.species).padStart(3) +
      '  cells ' + String(s.cells).padStart(3) +
      '  archive ' + String(s.archive).padStart(6) +
      '  sec ' + s.sec.toFixed(3) +
      '  eval/s ' + String(Math.round(s.evalsPerSecond)).padStart(6) +
      '\n');
  };

  if (!a.quiet) {
    process.stdout.write('bench/evolve: task=' + a.task + ' pop=' + a.pop + ' episodes=' + a.episodes +
      ' workers=' + engine.workers + ' budget=' + (a.ms / 1000).toFixed(1) + 's' +
      ' cpus=' + (os.availableParallelism ? os.availableParallelism() : os.cpus().length) + '\n');
  }

  // Per generation the bench measures the two numbers that decide how fast the organism
  // iterates: the wall seconds that generation took, and the episodes evaluated inside it
  // divided by those seconds. A generation is popSize + controlSize genomes, each run over
  // `episodes` seeds, so an evaluation here is one episode of one genome.
  const evalsPerGen = (a.pop + engine.controlSize) * a.episodes;
  const t0 = process.hrtime.bigint();
  const history = [];
  let mark = t0;
  while (Number(process.hrtime.bigint() - t0) / 1e6 < a.ms) {
    const s = await engine.step();
    const now = process.hrtime.bigint();
    s.sec = Number(now - mark) / 1e9;
    s.evalsPerSecond = s.sec > 0 ? evalsPerGen / s.sec : 0;
    mark = now;
    history.push(s);
    line(s);
  }
  const wallMs = Number(process.hrtime.bigint() - t0) / 1e6;
  await engine.close();

  const wallSec = wallMs / 1000;
  const genomes = engine.stats.genomes;
  const episodes = engine.stats.episodes;
  const generations = history.length;
  const bestPerGen = history.map((h) => Number(h.best.toFixed(6)));
  const meanPerGen = history.map((h) => Number(h.mean.toFixed(6)));
  const speciesPerGen = history.map((h) => h.species);
  const champ = engine.champion;

  const verdict = {
    bench: 'evolve',
    when: new Date().toISOString(),
    node: process.version,
    platform: process.platform,
    cpus: os.availableParallelism ? os.availableParallelism() : os.cpus().length,
    task: a.task,
    config: { popSize: a.pop, episodes: a.episodes, seed: String(a.seed), budgetMs: a.ms, taskConfig: task.config },
    workers: engine.workers,
    wallMs: Number(wallMs.toFixed(1)),
    generations,
    genomes,
    episodes,
    genomesPerSecond: Number((genomes / wallSec).toFixed(1)),
    episodesPerSecond: Number((episodes / wallSec).toFixed(1)),
    generationsPerMinute: Number(((generations / wallSec) * 60).toFixed(2)),
    evalMs: Number(engine.stats.evalMs.toFixed(1)),
    evalShare: Number((engine.stats.evalMs / wallMs).toFixed(3)),
    evalsPerGeneration: evalsPerGen,
    bestPerGeneration: bestPerGen,
    meanPerGeneration: meanPerGen,
    speciesPerGeneration: speciesPerGen,
    secondsPerGeneration: history.map((h) => Number(h.sec.toFixed(4))),
    evalsPerSecondPerGeneration: history.map((h) => Number(h.evalsPerSecond.toFixed(1))),
    secondsPerGenerationMean: Number((wallMs / 1000 / Math.max(1, generations)).toFixed(4)),
    speciesFinal: engine.speciation.species.length,
    speciesThreshold: Number(engine.speciation.threshold.toFixed(3)),
    champion: champ ? { fitness: Number(champ.fitness.toFixed(6)), gen: champ.gen, cells: champ.genome.cells.length, edges: champ.genome.edges.length, extras: champ.extras } : null,
    gate: { ...engine.brain.gate.stats },
    archive: engine.archive.summary(),
    clockGen: engine.brain.clock.gen,
  };

  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  const file = path.join(HERE, 'verdicts', 'evolve.json');
  writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');

  if (!a.quiet) {
    const first = bestPerGen.length ? bestPerGen[0] : 0;
    const last = bestPerGen.length ? bestPerGen[bestPerGen.length - 1] : 0;
    process.stdout.write('\n');
    process.stdout.write('wall               ' + wallSec.toFixed(2) + ' s\n');
    process.stdout.write('workers            ' + engine.workers + ' of ' + verdict.cpus + ' logical cpus\n');
    process.stdout.write('generations        ' + generations + '\n');
    process.stdout.write('generations/minute ' + verdict.generationsPerMinute + '\n');
    process.stdout.write('seconds/generation ' + verdict.secondsPerGenerationMean + ' mean over ' + generations + '\n');
    process.stdout.write('genomes            ' + genomes + '  (' + verdict.genomesPerSecond + ' /s)\n');
    process.stdout.write('episodes           ' + episodes + '  (' + verdict.episodesPerSecond + ' /s)\n');
    process.stdout.write('eval share of wall ' + (verdict.evalShare * 100).toFixed(1) + ' %\n');
    process.stdout.write('best fitness       ' + first.toFixed(6) + ' at gen 0  ->  ' + last.toFixed(6) + ' at gen ' + (generations - 1) + '\n');
    process.stdout.write('champion           ' + (champ ? champ.fitness.toFixed(6) + ' from gen ' + champ.gen + ', ' + champ.genome.cells.length + ' cells, ' + champ.genome.edges.length + ' edge genes' : 'none approved by the gate') + '\n');
    process.stdout.write('gate               proposed ' + verdict.gate.proposed + ', approved ' + verdict.gate.approved + ', rejected ' + verdict.gate.rejected + '\n');
    process.stdout.write('species            ' + verdict.speciesFinal + ' at threshold ' + verdict.speciesThreshold + '\n');
    process.stdout.write('archive            ' + verdict.archive.entries + ' genomes kept, ' + verdict.archive.bins + ' MAP-Elites bins filled\n');
    process.stdout.write('verdict            ' + file + '\n');
  }
  return verdict;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const a = args(process.argv.slice(2));
  run(a).then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}
