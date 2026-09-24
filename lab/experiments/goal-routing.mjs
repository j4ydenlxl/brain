// lab/experiments/goal-routing.mjs : EXPERIMENT (c). A NEW ROUTING POLICY.
//
// Question. core/scheduler.mjs makes attention an economy: a region has a budget per tick and
// due cells bid priority x (1 + surprise) x (1 + pending). simulate/attention.mjs can raise a
// cell's priority by how close the mail it is about to receive is to a goal hypervector. On a
// task where most of the traffic is a distractor, does that goal gating actually route the
// scarce budget to the goal-relevant cell, or does the ungated scheduler get there anyway?
//
// The task. Eight sink.log cells in a region whose budget is one cell run per tick. Every
// tick all eight receive a hypervector, so demand is eight times supply and the scheduler has
// to refuse seven cells per tick, every tick. One of the eight, chosen per seed, receives a
// noisy copy of the goal vector; the other seven receive fresh random vectors. Which cell is
// the relevant one, and the ORDER the eight cells are registered in, are both shuffled per
// seed. The registration order matters because core/scheduler.mjs sorts bids with a stable
// sort, so equal bids are broken by the order the cells were added: an experiment that fixed
// that order would be grading one arbitrary point of the tie-break band and calling it the
// control. Shuffling it per seed grades the band.
//
// The gate is the goal term alone: weights { novelty: 0, surprise: 0, goal: 1 }. Everything
// else about attention is left at its defaults (gain 4, priority floor 0.125, ceiling 16), so
// the thing being tested is goal gating and not a tuned attention configuration.
//
// The metric. relevantShare: of every cell run the region funded, the share that went to the
// relevant cell. With no gating a backlog-driven scheduler serves whichever queue is longest,
// which over a long run is a round robin, so the ungated share sits near one over eight.
import { Brain } from '../../core/brain.mjs';
import * as S from '../../core/signal.mjs';
import { RNG } from '../../core/rng.mjs';
import '../../cells/basic.mjs';
import { attachAttention } from '../../simulate/attention.mjs';
import { defineExperiment } from '../experiment.mjs';

export const CELLS = 8;      // one relevant, seven distractors
export const DIM = 2048;     // hypervector dimension for the goal and the distractors
export const TICKS = 200;    // ticks of an overloaded region
export const FLIP = 0.05;    // fraction of goal bits flipped in the relevant stream

const IDS = Object.freeze(Array.from({ length: CELLS }, (_, i) => 'lab.c' + i));

/** A copy of v with a fraction of its bits flipped, so the relevant stream is not identical. */
export function noisy(v, rng, flip = FLIP) {
  const out = Int8Array.from(v);
  for (let i = 0; i < out.length; i++) if (rng.next() < flip) out[i] = -out[i];
  return out;
}

export const experiment = defineExperiment({
  name: 'goal-routing',
  question: 'In a region overloaded eight to one, does attention goal gating route the funded cell runs to the goal-relevant cell more than an ungated scheduler does?',
  hypothesis: { metric: 'relevantShare', direction: 'increase', minEffect: 0.2 },
  bar: { alpha: 0.05, seeds: 16 },
  region: 'lab',
  ports: { in: IDS.map((id) => id + '#in') },
  seeds: Array.from({ length: 16 }, (_, i) => 'r' + (i + 1)),

  stream(seed) {
    const rng = new RNG('route:' + seed);
    const order = rng.shuffle([...IDS]);          // the tie-break band, sampled per seed
    const relevant = IDS[rng.int(CELLS)];
    const goal = S.hvFromSeed('goal:' + seed, DIM);
    const noise = new RNG('noise:' + seed);
    const frames = [];
    for (let t = 1; t <= TICKS; t++) {
      const frame = [];
      for (const id of IDS) {
        frame.push({ id, hv: id === relevant ? noisy(goal, noise) : S.hvFromSeed('d:' + seed + ':' + id + ':' + t, DIM) });
      }
      frames.push(frame);
    }
    return { seed, order, relevant, goal, frames, ticks: TICKS };
  },

  build(seed, ctx) {
    const b = new Brain({
      name: 'lab.routing', seed: 'route:' + seed, ledger: 'off',
      growth: { enabled: false }, pruneEvery: 0, connectomeCapacity: 32,
    });
    b.addRegion('lab', { budget: 1, doc: 'isolated experimental region: one cell run per tick, eight cells competing' });
    b.addRegion('outside', { doc: 'the rest of the organism, which a failed routing policy must not reach' });
    for (const id of ctx.stream.order) b.addCell({ id, kind: 'sink.log', region: 'lab', circuit: 'compete', params: { keep: 8 }, policy: { period: 'event' } });
    b.addCell({ id: 'outside.log', kind: 'sink.log', region: 'outside', circuit: 'watch', policy: { period: 'event' } });
    return b;
  },

  // Treatment: the alternative routing policy. Goal gating on the sealed region only.
  mechanism(brain, ctx) {
    brain.labAttention = attachAttention(brain, {
      regions: ['lab'],
      weights: { novelty: 0, surprise: 0, goal: 1 },
      goalHv: ctx.stream.goal,
    });
    return { routing: 'attention.goal', weights: { novelty: 0, surprise: 0, goal: 1 }, gain: brain.labAttention.gain, ceiling: brain.labAttention.ceil };
  },
  // Control: no gating. The same overload, the same budget, the scheduler as it ships.
  control(brain) {
    brain.labAttention = null;
    return { routing: 'none' };
  },

  measure(brain, ctx) {
    const { frames, relevant } = ctx.stream;
    // The whole stream is injected up front, on purpose. simulate/attention.mjs scores what
    // is inflight for t + 1 at the END of tick t, so a stream fed in tick by tick from this
    // loop would arrive after the scoring hook had already run and the priorities it wrote
    // would be the base ones every time.
    for (let i = 0; i < frames.length; i++) {
      for (const { id, hv } of frames[i]) brain.inject(id, 'in', { kind: 'hv', data: hv }, { delay: i + 1 });
    }
    brain.tick(frames.length + 1);

    let funded = 0, skipped = 0, relevantRuns = 0, relevantSkips = 0;
    for (const id of IDS) {
      const c = brain.cell(id);
      funded += c.stats.runs; skipped += c.stats.skips;
      if (id === relevant) { relevantRuns = c.stats.runs; relevantSkips = c.stats.skips; }
    }
    const att = brain.labAttention;
    const prio = IDS.map((id) => brain.cell(id).policy.priority);
    if (att) att.detach();
    return {
      relevantShare: funded ? relevantRuns / funded : 0,
      chance: 1 / CELLS,
      relevantRuns,
      relevantSkips,
      funded,
      skipped,
      distractorRuns: funded - relevantRuns,
      relevantPriority: brain.cell(relevant).policy.priority,
      distractorPriorityMax: Math.max(...IDS.filter((id) => id !== relevant).map((id) => brain.cell(id).policy.priority)),
      priorityRange: Math.max(...prio) - Math.min(...prio),
      attentionScored: att ? att.stats.scored : 0,
      ticks: brain.stats.ticks,
    };
  },
});

export default experiment;
