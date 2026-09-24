// generations/tasks/race.mjs: TASK C, the race cars. A one dimensional track of length L
// with K checkpoints, each carrying a speed limit drawn from the track seed. A controller
// circuit reads position and speed as a vec and emits a throttle vec. Fitness is the
// distance covered in T control steps, minus a penalty for every checkpoint taken above its
// limit. Hundreds of cars run per generation; every episode is deterministic from its seed,
// so the same car on the same track scores the same number every time it is asked.
//
// The track is not visible to the controller in advance: the sensors report the distance to
// the next checkpoint and its limit, so the circuit has to learn to lift off early. Flat
// out is not the optimum, and neither is crawling.
import { RNG } from '../../core/rng.mjs';
import { cellGene, edgeGene, createGenome, buildBrain, genomeStats } from '../genome.mjs';
import { readVec } from '../palette.mjs';

export const config = Object.freeze({
  length: 4000,       // L, track units
  checkpoints: 16,    // K corners
  steps: 250,         // T control steps per episode
  settle: 2,          // brain ticks per control step
  vmax: 16,
  accel: 1.2,
  drag: 0.075,        // terminal speed accel/drag = vmax
  limitMin: 4,
  limitMax: 14,
  crashPenalty: 200,  // track units lost per checkpoint taken too fast
  maxCrashes: 3,      // the car is out after this many
  width: 4,
  sensors: 4,
});

export const palette = ['gen.node', 'gen.ema', 'vec.mlp'];

// A track is K checkpoint positions with a speed limit each, deterministic from the seed.
export function trackFor(seed, cfg = config) {
  const rng = new RNG('track:' + seed);
  const cps = [];
  for (let i = 0; i < cfg.checkpoints; i++) {
    cps.push({
      x: (cfg.length * (i + 1)) / cfg.checkpoints,
      limit: cfg.limitMin + rng.next() * (cfg.limitMax - cfg.limitMin),
    });
  }
  return cps;
}

export function seedGenome(innov, cfg = config) {
  const W = cfg.width;
  const cells = [
    cellGene({ innov: innov.of('cell:race.in'), id: 'in', kind: 'gen.node', role: 'in', fixed: true, lock: ['width', 'gain', 'bias', 'act', 'roll'], region: 'perception', circuit: 'race', params: { width: W, gain: 1, bias: 0, act: 'lin', roll: 0 } }),
    cellGene({ innov: innov.of('cell:race.out'), id: 'out', kind: 'gen.node', role: 'out', fixed: true, lock: ['width'], region: 'motor', circuit: 'race', params: { width: W, gain: 1, bias: 0, act: 'tanh', roll: 0 } }),
  ];
  const edges = [edgeGene({ innov: innov.of('edge:in>out:0:0'), src: 'in', dst: 'out', srcPort: 0, dstPort: 0, w: 1, delay: 0 })];
  return createGenome({ id: 'seed', cells, edges });
}

export function episode(genome, seed, cfg = config) {
  const cps = trackFor(seed, cfg);
  const { brain, cells } = buildBrain(genome, { name: 'race', seed });
  const out = cells.get('out');
  const sensors = new Float32Array(cfg.sensors);
  const segment = cfg.length / cfg.checkpoints;

  let x = 0, v = 0, crashes = 0, cp = 0, throttleSum = 0, steps = 0;
  for (let step = 0; step < cfg.steps; step++) {
    const next = cps[Math.min(cp, cps.length - 1)];
    // channel 3 is a constant: without a bias channel a zero-weight circuit can only ever
    // emit zero throttle, and the whole population would start and stay at fitness 0
    sensors[0] = v / cfg.vmax;
    sensors[1] = Math.min(1, (next.x - x) / segment);
    sensors[2] = next.limit / cfg.vmax;
    sensors[3] = 1;
    brain.inject('in', 0, { kind: 'vec', data: sensors });
    brain.tick(cfg.settle);

    const y = readVec(out);
    let throttle = y && Number.isFinite(y[0]) ? y[0] : 0;
    throttle = throttle < -1 ? -1 : throttle > 1 ? 1 : throttle;
    throttleSum += throttle;
    steps++;

    v = v + throttle * cfg.accel - cfg.drag * v;
    if (v < 0) v = 0; else if (v > cfg.vmax) v = cfg.vmax;
    const before = x;
    x += v;

    // every checkpoint crossed this step is judged at the speed the car crossed it
    while (cp < cps.length && x >= cps[cp].x) {
      if (v > cps[cp].limit) { crashes++; v = 0; }
      cp++;
    }
    if (x < before) x = before;
    if (crashes >= cfg.maxCrashes || cp >= cps.length) break;
  }

  const distance = Math.min(x, cfg.length);
  const scored = Math.max(0, distance - crashes * cfg.crashPenalty);
  return {
    fitness: scored / cfg.length,
    distance, crashes,
    finalSpeed: v,
    meanThrottle: steps ? throttleSum / steps : 0,
    steps,
    ticks: brain.stats.ticks,
    runs: brain.stats.runs,
  };
}

export function evaluate(genome, { seeds = ['0'], cfg = config } = {}) {
  let fitness = 0, distance = 0, crashes = 0, throttle = 0, ticks = 0, runs = 0, epSteps = 0;
  for (const s of seeds) {
    const r = episode(genome, s, cfg);
    fitness += r.fitness; distance += r.distance; crashes += r.crashes;
    throttle += r.meanThrottle; ticks += r.ticks; runs += r.runs; epSteps += r.steps;
  }
  const n = seeds.length;
  const st = genomeStats(genome);
  return {
    fitness: fitness / n,
    descriptors: [st.cells, st.meanPeriod, crashes / n, throttle / n],
    extras: { distance: distance / n, crashes: crashes / n, meanThrottle: throttle / n, steps: epSteps, ticks, runs, depth: st.depth },
  };
}

export const task = { name: 'race', config, palette, seedGenome, evaluate, episode, width: config.width, threshold: 0.95 };
export default task;
