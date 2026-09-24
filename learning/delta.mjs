// learning/delta.mjs : error driven learning on the wire (Widrow Hoff).
//
// A cell that exposes an error is the teacher for the edges that feed it. cells/basic.mjs
// vec.mlp writes a root mean square error to state.err and to stats.surprise; predict.next
// writes state.lastError. This rule reads whatever the cell exposes and moves every live
// incoming edge by dW = -eta * error * pre.
//
// Sign matters and is honest about what the cell gives us. When the cell exposes a SIGNED
// error (state.errSigned, or evidence.error supplied by a learn.apply cell or a modulator)
// this is the delta rule: the fixed point is error = 0 from either side. When the cell
// exposes only a MAGNITUDE (vec.mlp's root mean square is never negative) the same
// expression is input gain control: the wires into a cell that is getting it wrong are
// attenuated, and they stop moving exactly when the error reaches zero.
import { defineRule, mergeConfig, clamp } from './registry.mjs';
import { ACTIVE } from '../core/connectome.mjs';

export const delta = defineRule({
  name: 'delta',
  scope: 'cell',
  doc: 'Error driven: dW = -eta * error * pre on every live edge into a cell that exposes an error (vec.mlp state.err, predict.next state.lastError, or evidence.error).',
  defaults: { eta: 0.05, wMax: 4, minError: 1e-9 },

  // target is a cell object. evidence: { error, pre?, gain, cfg }.
  apply(brain, cell, evidence, ctx) {
    const cfg = mergeConfig(delta, evidence, ctx);
    const err = evidence.error ?? errorOf(cell);
    if (err == null || Math.abs(err) < cfg.minError) return 0;
    const c = brain.connectome;
    const eng = ctx && ctx.learning ? ctx.learning : null;
    const t = ctx ? ctx.t : 0;
    const gain = evidence.gain ?? 1;
    let sum = 0;
    for (const e of c.into(cell.idx)) {
      if (!(c.flags[e] & ACTIVE)) continue;
      const pre = evidence.pre ?? (eng ? eng.pre(c.src[e], t) : 1);
      if (pre === 0) continue;
      const dw = -cfg.eta * err * pre * gain;
      if (dw === 0) continue;
      c.w[e] = clamp(c.w[e] + dw, -cfg.wMax, cfg.wMax);
      if (dw > 0) c.stats.strengthened++; else c.stats.weakened++;
      sum += dw;
    }
    return sum;
  },

  init() { return { applied: 0, sum: 0 }; },

  tick(eng, ctx) {
    const st = eng.st('delta');
    const ev = { error: null, gain: 1, cfg: eng.cfg('delta') };
    let applied = 0;
    for (const idx of eng.targetSet('delta')) {
      const cell = eng.brain.cells[idx];
      if (cell.stats.lastT !== ctx.t) continue; // only cells that ran on this tick
      const err = errorOf(cell);
      if (err == null) continue;
      if (!eng.spend(1)) break;
      ev.error = err;
      ev.gain = eng.gainForCell(idx);
      st.sum += delta.apply(eng.brain, cell, ev, ctx);
      st.applied++; applied++;
    }
    return applied;
  },
});

// What a cell publishes as its error, in order of preference.
export function errorOf(cell) {
  const s = cell.state;
  if (s) {
    if (typeof s.errSigned === 'number') return s.errSigned;
    if (typeof s.err === 'number') return s.err;
    if (typeof s.lastError === 'number') return s.lastError;
  }
  if (typeof cell.stats.surprise === 'number' && cell.stats.surprise !== 0) return cell.stats.surprise;
  return null;
}
