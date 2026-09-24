// learning/predictive.mjs : surprise is a resource, not a number in a log.
//
// A predict.next style cell holds a hypothesis about its next input and publishes the
// error of the previous one. This rule smooths that error into cell.stats.surprise (which
// core/scheduler.mjs already reads when it funds bids, so a surprised cell gets compute)
// and turns it into a learning rate multiplier on every edge INTO that cell. An edge
// feeding a cell that is being surprised learns faster; once the cell has adapted, the
// multiplier falls back to 1 and the edge settles.
//
// The multiplier is published on the engine as lrScale and is read by the edge rules
// through evidence.gain, so predictive never writes a weight itself.
import { defineRule, mergeConfig, clamp } from './registry.mjs';
import { errorOf } from './delta.mjs';

export const predictive = defineRule({
  name: 'predictive',
  scope: 'cell',
  doc: 'Smooths the error a predicting cell publishes into cell.stats.surprise and scales the learning rate of every edge into that cell by 1 + kappa * surprise.',
  defaults: {
    tau: 8,        // ticks of the surprise moving average
    kappa: 2,      // how hard surprise scales the learning rate
    maxScale: 8,   // ceiling on the multiplier
    quiet: 1e-6,   // surprise below this is treated as zero
  },

  // target is a cell object. evidence: { error, cfg }. Returns the new surprise.
  // The running average lives on the engine, not in cell.stats.surprise, because the cell
  // itself overwrites stats.surprise with its raw error on every run (cells/basic.mjs
  // predict.next and vec.mlp both do). The rule reads its own history and writes the
  // smoothed value back where the scheduler will see it.
  apply(brain, cell, evidence, ctx) {
    const cfg = mergeConfig(predictive, evidence, ctx);
    const raw = evidence.error ?? errorOf(cell);
    const eng = ctx && ctx.learning ? ctx.learning : null;
    if (raw == null) return eng ? eng.surprise[cell.idx] : cell.stats.surprise;
    const a = 1 / Math.max(1, cfg.tau);
    const prev = eng ? eng.surprise[cell.idx] : (cell.stats.surprise || 0);
    let s = prev + a * (Math.abs(raw) - prev);
    if (s < cfg.quiet) s = 0;
    if (eng) eng.surprise[cell.idx] = s;
    cell.stats.surprise = s;
    const scale = clamp(1 + cfg.kappa * s, 1, cfg.maxScale);
    if (eng) eng.setScale(cell.idx, scale);
    return s;
  },

  init() { return { applied: 0, peak: 0 }; },

  tick(eng, ctx) {
    const st = eng.st('predictive');
    const ev = { error: null, cfg: eng.cfg('predictive') };
    let applied = 0;
    for (const idx of eng.targetSet('predictive')) {
      const cell = eng.brain.cells[idx];
      if (cell.stats.lastT !== ctx.t) continue;
      const raw = errorOf(cell);
      if (raw == null) continue;
      if (!eng.spend(1)) break;
      ev.error = raw;
      const s = predictive.apply(eng.brain, cell, ev, ctx);
      if (s > st.peak) st.peak = s;
      st.applied++; applied++;
    }
    return applied;
  },
});
