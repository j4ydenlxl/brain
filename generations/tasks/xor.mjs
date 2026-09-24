// generations/tasks/xor.mjs: TASK A. The oldest test of a non-linear circuit, run through
// real cells: a vec.mlp feature cell feeds a vec.mlp readout cell, and the readout learns
// with the local delta rule that lives inside the kind. Evolution chooses how many cells,
// how wide, how fast they learn, on which timescale they run, and how they are wired.
// Fitness is measured after the training phase, on the same four cases, in the same brain.
import { RNG } from '../../core/rng.mjs';
import { cellGene, edgeGene, createGenome, buildBrain, genomeStats } from '../genome.mjs';
import { readVec } from '../palette.mjs';

export const CASES = Object.freeze([[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]]);

// The seed is deliberately underpowered: 25 training passes, a 3 unit hidden layer and a
// learning rate of 0.01 do not solve xor. The search has to find a configuration that
// learns inside the budget, by widening a cell, raising a rate, or adding a pathway.
export const config = Object.freeze({
  width: 4,          // vec width on the wires between cells
  epochs: 25,        // training passes over the four cases: the compute budget
  settle: 4,         // brain ticks allowed for a sample to propagate before it is read
  lr: 0.01,
  nhid: 3,
  // "solved" means all four cases on the right side of 0.5. Fitness is acc minus a small
  // residual error term, and acc can only be 0, 0.25, 0.5, 0.75 or 1, so any fitness above
  // 0.75 is four out of four and nothing else can reach it.
  threshold: 0.95,
});

export const palette = ['vec.mlp', 'gen.node'];

export function seedGenome(innov, cfg = config) {
  const cells = [
    cellGene({ innov: innov.of('cell:xor.in'), id: 'in', kind: 'vec.mlp', role: 'in', fixed: true, lock: ['nin', 'nout'], region: 'perception', circuit: 'xor', params: { nin: 2, nhid: cfg.nhid, nout: cfg.width, lr: 0, seed: 'xor.in' } }),
    cellGene({ innov: innov.of('cell:xor.out'), id: 'out', kind: 'vec.mlp', role: 'out', fixed: true, lock: ['nin', 'nout'], region: 'cognitive', circuit: 'xor', params: { nin: cfg.width, nhid: cfg.nhid, nout: 1, lr: cfg.lr, seed: 'xor.out' } }),
  ];
  const edges = [edgeGene({ innov: innov.of('edge:in>out:0:0'), src: 'in', dst: 'out', srcPort: 0, dstPort: 0, w: 1, delay: 0 })];
  return createGenome({ id: 'seed', cells, edges });
}

// One episode: build the genome into a fresh Brain, train, then test. Deterministic from
// `seed`, which only decides the order the four cases are presented in.
export function episode(genome, seed, cfg = config) {
  const { brain, cells } = buildBrain(genome, { name: 'xor', seed });
  const out = cells.get('out');
  const rng = new RNG('xor:' + seed);
  const order = [0, 1, 2, 3];

  for (let epoch = 0; epoch < cfg.epochs; epoch++) {
    rng.shuffle(order);
    for (const i of order) {
      const [x0, x1, y] = CASES[i];
      brain.inject('in', 0, { kind: 'vec', data: Float32Array.from([x0, x1]) });
      brain.tick(cfg.settle);
      brain.inject('out', 1, { kind: 'vec', data: Float32Array.from([y]) });
      brain.tick(1);
    }
  }

  let correct = 0, err = 0;
  for (const [x0, x1, y] of CASES) {
    brain.inject('in', 0, { kind: 'vec', data: Float32Array.from([x0, x1]) });
    brain.tick(cfg.settle);
    const v = readVec(out);
    const got = v && Number.isFinite(v[0]) ? v[0] : 0;
    if ((got > 0.5) === (y === 1)) correct++;
    err += Math.abs(got - y);
  }
  const acc = correct / CASES.length;
  const meanErr = err / CASES.length;
  return {
    fitness: Math.max(0, acc - 0.05 * Math.min(4, meanErr)),
    acc, meanErr,
    ticks: brain.stats.ticks,
    runs: brain.stats.runs,
  };
}

export function evaluate(genome, { seeds = ['0'], cfg = config } = {}) {
  let fitness = 0, acc = 0, meanErr = 0, ticks = 0, runs = 0;
  for (const s of seeds) {
    const r = episode(genome, s, cfg);
    fitness += r.fitness; acc += r.acc; meanErr += r.meanErr; ticks += r.ticks; runs += r.runs;
  }
  const n = seeds.length;
  const st = genomeStats(genome);
  return {
    fitness: fitness / n,
    descriptors: [st.cells, st.meanPeriod, acc / n, Math.min(4, meanErr / n)],
    extras: { acc: acc / n, meanErr: meanErr / n, ticks, runs, depth: st.depth },
  };
}

export const task = { name: 'xor', config, palette, seedGenome, evaluate, episode, width: config.width, threshold: config.threshold };
export default task;
