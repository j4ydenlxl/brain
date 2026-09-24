// generations/tasks/sequence.mjs: TASK B. A repeating pattern of events arrives one symbol
// per step as a one-hot vec; the circuit has to emit the NEXT symbol before it is shown.
// The error is the one core/primitives predict() computes and the predict.next cell
// reports: root mean square difference between the emitted vec and the observed vec.
//
// The genome shares its brain with one unwired predict.next cell of its own, marked as a
// control, fed the true stream. Its error is the score a linear extrapolator gets on the
// same pattern, so every fitness here is printed next to what predicting nothing new would
// have scored.
import { RNG } from '../../core/rng.mjs';
import * as P from '../../core/primitives.mjs';
import { cellGene, edgeGene, createGenome, buildBrain, genomeStats } from '../genome.mjs';
import { readVec } from '../palette.mjs';

export const config = Object.freeze({
  symbols: 4,       // alphabet size, also the vec width
  patternLen: 6,    // length of the repeating pattern
  steps: 120,       // symbols shown in one episode
  warmup: 24,       // steps before the error starts counting
  settle: 3,        // brain ticks per symbol
});

// predict.next is deliberately NOT in the add-cell palette: its prediction port can emit
// hv and num as well as vec, and no vec cell accepts those, so the port kind rule refuses
// every split that would insert one. It stays in the genome as the unwired control cell.
export const palette = ['gen.node', 'gen.ema'];

function oneHot(i, n) { const v = new Float32Array(n); v[i] = 1; return v; }

export function patternFor(seed, cfg = config) {
  const rng = new RNG('seq:' + seed);
  const pat = [];
  for (let i = 0; i < cfg.patternLen; i++) pat.push(rng.int(cfg.symbols));
  // a pattern that is one symbol repeated is not a sequence problem; force a change
  if (pat.every((x) => x === pat[0])) pat[cfg.patternLen - 1] = (pat[0] + 1) % cfg.symbols;
  return pat;
}

export function seedGenome(innov, cfg = config) {
  const W = cfg.symbols;
  const cells = [
    cellGene({ innov: innov.of('cell:seq.in'), id: 'in', kind: 'gen.node', role: 'in', fixed: true, region: 'perception', circuit: 'seq', params: { width: W, gain: 1, bias: 0, act: 'lin' } }),
    cellGene({ innov: innov.of('cell:seq.out'), id: 'out', kind: 'gen.node', role: 'out', fixed: true, region: 'cognitive', circuit: 'seq', params: { width: W, gain: 1, bias: 0, act: 'lin' } }),
    cellGene({ innov: innov.of('cell:seq.ctl'), id: 'ctl', kind: 'predict.next', role: 'ctl', fixed: true, region: 'cognitive', circuit: 'control', params: { history: 4 } }),
  ];
  const edges = [edgeGene({ innov: innov.of('edge:in>out:0:0'), src: 'in', dst: 'out', srcPort: 0, dstPort: 0, w: 1, delay: 0 })];
  return createGenome({ id: 'seed', cells, edges });
}

export function episode(genome, seed, cfg = config) {
  const pat = patternFor(seed, cfg);
  const { brain, cells } = buildBrain(genome, { name: 'seq', seed });
  const out = cells.get('out'), ctl = cells.get('ctl');
  const W = cfg.symbols;
  const vecs = [];
  for (let i = 0; i < W; i++) vecs.push(oneHot(i, W));

  let err = 0, ctlErr = 0, counted = 0, ctlCounted = 0;
  for (let step = 0; step < cfg.steps; step++) {
    const now = pat[step % pat.length];
    const next = pat[(step + 1) % pat.length];
    brain.inject('in', 0, { kind: 'vec', data: vecs[now] });
    if (ctl) brain.inject('ctl', 0, { kind: 'vec', data: vecs[now] });
    brain.tick(cfg.settle);
    const v = readVec(out);
    if (step >= cfg.warmup) {
      const pred = v && v.every((x) => Number.isFinite(x)) ? v : new Float32Array(W);
      const e = P.predict('vec', [pred], vecs[next]).error;
      err += Number.isFinite(e) ? e : Math.SQRT2;
      counted++;
      const ce = ctl ? ctl.state.lastError : null;
      if (ce != null && Number.isFinite(ce)) { ctlErr += ce; ctlCounted++; }
    }
  }
  const meanErr = counted ? err / counted : Math.SQRT2;
  return {
    fitness: Math.max(0, 1 - Math.min(1, meanErr)),
    meanErr,
    ctlErr: ctlCounted ? ctlErr / ctlCounted : null,
    ticks: brain.stats.ticks,
    runs: brain.stats.runs,
  };
}

export function evaluate(genome, { seeds = ['0'], cfg = config } = {}) {
  let fitness = 0, meanErr = 0, ctlErr = 0, ctlN = 0, ticks = 0, runs = 0;
  for (const s of seeds) {
    const r = episode(genome, s, cfg);
    fitness += r.fitness; meanErr += r.meanErr; ticks += r.ticks; runs += r.runs;
    if (r.ctlErr != null) { ctlErr += r.ctlErr; ctlN++; }
  }
  const n = seeds.length;
  const st = genomeStats(genome);
  return {
    fitness: fitness / n,
    descriptors: [st.cells, st.meanPeriod, meanErr / n, st.depth],
    extras: { meanErr: meanErr / n, controlErr: ctlN ? ctlErr / ctlN : null, ticks, runs, depth: st.depth },
  };
}

export const task = { name: 'sequence', config, palette, seedGenome, evaluate, episode, width: config.symbols, threshold: 0.9 };
export default task;
