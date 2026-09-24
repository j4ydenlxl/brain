// learning/homeostatic.mjs : every other rule in this directory pushes weights somewhere.
// Hebbian potentiation is positive feedback, reinforcement has no upper bound of its own,
// and a cell whose incoming weights all run away stops carrying information. This rule is
// the opposing force: it keeps the MEAN magnitude of a cell's incoming weights inside a
// band by SCALING them, which preserves every ratio the other rules learned. It clips
// nothing and it reverses nothing; it only changes the overall gain of a cell's input.
import { defineRule, mergeConfig, clamp } from './registry.mjs';
import { ACTIVE } from '../core/connectome.mjs';

export const homeostatic = defineRule({
  name: 'homeostatic',
  scope: 'cell',
  doc: 'Keeps the mean magnitude of a cell incoming weights inside [lo, hi] by scaling them all toward target, preserving their ratios.',
  defaults: {
    every: 16,      // ticks between sweeps
    lo: 0.25,
    hi: 1.0,
    target: 0.5,    // where an out of band cell is scaled to
    maxScale: 8,    // no single correction may multiply by more than this
    minMean: 1e-6,  // a cell whose inputs are all zero cannot be scaled up
    wMax: 4,
  },

  // target is a cell object. Returns the scale factor applied (1 when in band).
  apply(brain, cell, evidence, ctx) {
    const cfg = mergeConfig(homeostatic, evidence, ctx);
    const c = brain.connectome;
    let n = 0, sum = 0;
    for (const e of c.into(cell.idx)) {
      if (!(c.flags[e] & ACTIVE)) continue;
      sum += Math.abs(c.w[e]); n++;
    }
    if (n === 0) return 1;
    const mean = sum / n;
    if (mean < cfg.minMean) return 1;
    if (mean >= cfg.lo && mean <= cfg.hi) return 1;
    const scale = clamp(cfg.target / mean, 1 / cfg.maxScale, cfg.maxScale);
    if (scale === 1) return 1;
    for (const e of c.into(cell.idx)) {
      if (!(c.flags[e] & ACTIVE)) continue;
      c.w[e] = clamp(c.w[e] * scale, -cfg.wMax, cfg.wMax);
    }
    if (scale > 1) c.stats.strengthened++; else c.stats.weakened++;
    return scale;
  },

  init() { return { applied: 0, scaled: 0, up: 0, down: 0 }; },

  tick(eng, ctx) {
    const cfg = eng.cfg('homeostatic'), st = eng.st('homeostatic');
    if (cfg.every && ctx.t % cfg.every !== 0) return 0;
    const ev = { cfg };
    let applied = 0;
    for (const idx of eng.targetSet('homeostatic')) {
      if (!eng.spend(1)) break;
      const s = homeostatic.apply(eng.brain, eng.brain.cells[idx], ev, ctx);
      st.applied++; applied++;
      if (s !== 1) { st.scaled++; if (s > 1) st.up++; else st.down++; }
    }
    return applied;
  },
});

// Reporting helper used by the tests and by the CLI: the mean incoming magnitude per cell.
export function meanIncoming(brain, cell) {
  const c = brain.connectome;
  let n = 0, sum = 0;
  for (const e of c.into(cell.idx)) {
    if (!(c.flags[e] & ACTIVE)) continue;
    sum += Math.abs(c.w[e]); n++;
  }
  return n === 0 ? null : sum / n;
}
