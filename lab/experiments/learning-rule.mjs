// lab/experiments/learning-rule.mjs : EXPERIMENT (a). A NEW LEARNING MECHANISM.
//
// Question. learning/registry.mjs holds named, swappable rules. If the rule a region runs is
// genuinely a plug, then swapping one for another must be a thing a researcher can DO and
// MEASURE, not a thing the architecture merely claims. So: replace the hebbian rule with the
// predictive rule inside an isolated region running a sequence task, and see what happens to
// the structure the region learns.
//
// The task. K symbols arrive one per tick in a fixed cyclic order. Each symbol owns one cell
// (cells/control.mjs event.filter) that emits only when ITS symbol arrives, so a cell that
// merely RECEIVES a signal does not fire: the lateral wires can carry traffic without every
// cell spiking every tick, which is what makes spike order mean anything. The cells are wired
// all to all laterally with equal weights. A symbol cell fires at tick T; its signal reaches
// every other symbol cell at T + 1, which is exactly when the NEXT symbol's cell fires. The
// edge from a symbol to its true successor is therefore the only edge whose pre spike lands
// on the same tick as its post spike (dt = 0, the top of the STDP window in
// learning/hebbian.mjs).
//
// The metric. nextSymbolAccuracy: for each symbol cell, the heaviest lateral edge out of it.
// One point when that edge points at the true successor. A TIE is not a prediction, so a tie
// among m edges scores 1/m, which is exactly what a coin would score; with K = 8 symbols and
// 7 lateral edges each, an untouched connectome scores 1/7 = 0.142857 by construction rather
// than by luck of the insertion order.
//
// The expected failure mode is the point. learning/predictive.mjs is scope 'cell': it smooths
// a predicting cell's error into cell.stats.surprise and scales a learning RATE. It never
// writes a weight. If that is true then the treatment cannot move the connectome at all, and
// the experiment should come back refuted with ruleApplications 0. Stating it that way means
// the run can prove it instead of the comment asserting it.
import { Brain } from '../../core/brain.mjs';
import { RNG } from '../../core/rng.mjs';
import '../../cells/basic.mjs';
import '../../cells/control.mjs';
import { attach } from '../../learning/index.mjs';
import { defineExperiment } from '../experiment.mjs';

export const K = 8;          // symbols in the alphabet, one cell each
export const CYCLES = 60;    // full passes over the cycle
const TICKS = K * CYCLES;

function symbolIds() { return Array.from({ length: K }, (_, k) => 'lab.s' + k); }

/** A seeded cyclic order over the K symbols: cycle[i] is followed by cycle[(i+1) % K]. */
export function cycleFor(seed) {
  const order = new RNG('cycle:' + seed).shuffle(Array.from({ length: K }, (_, k) => k));
  const next = new Array(K);
  for (let i = 0; i < K; i++) next[order[i]] = order[(i + 1) % K];
  return { order, next };
}

/**
 * The heaviest lateral edge out of each symbol cell, scored against the true successor.
 * A tie of m edges scores 1/m: an untouched connectome lands on chance, not on whichever
 * edge happened to be inserted first.
 */
export function nextSymbolAccuracy(brain, next) {
  const ids = new Set(symbolIds());
  let score = 0, tied = 0;
  for (let k = 0; k < K; k++) {
    const cell = brain.cell('lab.s' + k);
    let best = -Infinity, winners = [];
    for (const e of brain.connectome.outOf(cell.idx)) {
      const dst = brain.cells[brain.connectome.dst[e]];
      if (!ids.has(dst.id)) continue;
      const w = brain.connectome.w[e];
      if (w > best + 1e-9) { best = w; winners = [dst.id]; }
      else if (Math.abs(w - best) <= 1e-9) winners.push(dst.id);
    }
    if (!winners.length) continue;
    if (winners.length > 1) tied++;
    if (winners.includes('lab.s' + next[k])) score += 1 / winners.length;
  }
  return { accuracy: score / K, tiedCells: tied };
}

export const experiment = defineExperiment({
  name: 'learning-rule',
  question: 'On a sequence task in an isolated region, does the predictive rule recover the next-symbol structure of the connectome better than the hebbian rule it replaces?',
  hypothesis: { metric: 'nextSymbolAccuracy', direction: 'increase', minEffect: 0.05 },
  bar: { alpha: 0.05, seeds: 8 },
  region: 'lab',
  ports: { in: ['lab.in#in'], out: [] },
  seeds: ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'],

  stream(seed) {
    const { order, next } = cycleFor(seed);
    const symbols = [];
    for (let c = 0; c < CYCLES; c++) for (let i = 0; i < K; i++) symbols.push(order[i]);
    return { order, next, symbols, ticks: TICKS };
  },

  build(seed) {
    const b = new Brain({
      name: 'lab.sequence', seed: 'seq:' + seed, ledger: 'off',
      growth: { enabled: false }, pruneEvery: 0, connectomeCapacity: 256,
    });
    b.addRegion('lab', { doc: 'isolated experimental region: the sequence circuit under test' });
    b.addRegion('outside', { doc: 'the rest of the organism, which a failed mechanism must not reach' });
    // The fan-out. It passes any symbol through, so one injection reaches every symbol cell.
    b.addCell({ id: 'lab.in', kind: 'event.filter', region: 'lab', circuit: 'sequence', params: { field: 'sym', values: Array.from({ length: K }, (_, k) => k) }, policy: { period: 'event' } });
    for (let k = 0; k < K; k++) {
      b.addCell({ id: 'lab.s' + k, kind: 'event.filter', region: 'lab', circuit: 'sequence', params: { field: 'sym', value: k }, policy: { period: 'event' } });
    }
    b.addCell({ id: 'outside.log', kind: 'sink.log', region: 'outside', circuit: 'watch', policy: { period: 'event' } });
    for (let k = 0; k < K; k++) b.connect('lab.in', 'out', 'lab.s' + k, 'in');
    for (let k = 0; k < K; k++) for (let j = 0; j < K; j++) if (k !== j) b.connect('lab.s' + k, 'out', 'lab.s' + j, 'in', { w: 0.5, conf: 0.5 });
    return b;
  },

  // Treatment: the alternative learning mechanism, installed on the isolated region only.
  mechanism(brain, ctx) {
    brain.labEngine = attach(brain, { rules: ['predictive'], print: false, warn: false, predictive: { region: ctx.region } });
    return { rule: 'predictive', scope: 'cell' };
  },
  // Control: the same clone, the same stream, the rule the architecture already had.
  control(brain, ctx) {
    brain.labEngine = attach(brain, { rules: ['hebbian'], print: false, warn: false, hebbian: { region: ctx.region } });
    return { rule: 'hebbian', scope: 'edge' };
  },

  measure(brain, ctx) {
    const { symbols, next, ticks } = ctx.stream;
    const cx = brain.connectome;
    const before = Float32Array.from(cx.w.subarray(0, cx.size()));
    for (let i = 0; i < symbols.length; i++) {
      brain.inject('lab.in', 'in', { kind: 'event', data: { sym: symbols[i] } }, { delay: i + 1 });
    }
    brain.tick(ticks + 3);
    const { accuracy, tiedCells } = nextSymbolAccuracy(brain, next);
    let moved = 0, sumAbs = 0;
    for (let e = 0; e < before.length; e++) { const d = cx.w[e] - before[e]; if (d !== 0) { moved++; sumAbs += Math.abs(d); } }
    const report = brain.labEngine ? brain.labEngine.report() : null;
    if (brain.labEngine) brain.labEngine.detach();
    return {
      nextSymbolAccuracy: accuracy,
      chance: 1 / (K - 1),
      tiedCells,
      weightsMoved: moved,
      meanAbsWeightDelta: moved ? sumAbs / moved : 0,
      ruleApplications: report ? report.applied : 0,
      cellRuns: brain.stats.runs,
      signals: brain.stats.signals,
    };
  },
});

export default experiment;
