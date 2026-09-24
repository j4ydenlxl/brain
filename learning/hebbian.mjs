// learning/hebbian.mjs : the fly brain rule, dW = eta * pre * post - alpha * W, with an
// eligibility window that makes it care about ORDER (STDP).
//
// Order comes from two numbers the substrate already keeps: the t stamp a signal carries
// (core/signal.mjs stamps every emitted signal with the tick its source fired) and the
// delay on the edge that carries it (core/connectome.mjs). A pre spike emitted at tPre
// ARRIVES at its target at tPre + 1 + delay, one tick of travel plus the edge delay
// (engine.arrival). Let dt = tPost - arrival:
//   dt >= 0   the pre spike arrived before the post cell fired, it may have caused it,
//             potentiate by aPlus * exp(-dt / tauPlus)
//   dt <  0   the post cell had already fired when the pre spike arrived, it cannot have
//             caused it, depress by aMinus * exp(dt / tauMinus)
// The rate term (eta * pre * post) and the decay term (-alpha * W) are the fly rule as
// written in DESIGN.md section 5. pre is the source cell's decaying activity trace, post
// is 1 when the destination fired on this tick.
import { defineRule, mergeConfig, clamp } from './registry.mjs';
import { ACTIVE } from '../core/connectome.mjs';

export const hebbian = defineRule({
  name: 'hebbian',
  scope: 'edge',
  doc: 'dW = eta * pre * post - alpha * W with an STDP window: a pre spike arriving before the post spike potentiates, one arriving after depresses.',
  defaults: {
    eta: 0.02,        // rate term
    alpha: 0.001,     // weight decay
    aPlus: 0.02,      // potentiation amplitude
    aMinus: 0.021,    // depression amplitude, slightly larger so a random pairing is net negative
    tauPlus: 12,      // potentiation time constant, ticks
    tauMinus: 12,     // depression time constant, ticks
    window: 64,       // ticks beyond which a pairing is ignored
    wMax: 4,
  },

  // One edge, one update. evidence: { pre, post, dt, gain, cfg }.
  apply(brain, e, evidence, ctx) {
    const rule = hebbian;
    const cfg = mergeConfig(rule, evidence, ctx);
    const c = brain.connectome;
    const w = c.w[e];
    const pre = evidence.pre ?? 0, post = evidence.post ?? 0, dt = evidence.dt;
    let dw = cfg.eta * pre * post - cfg.alpha * w;
    if (dt != null && Math.abs(dt) <= cfg.window) {
      dw += dt >= 0
        ? cfg.aPlus * Math.exp(-dt / cfg.tauPlus)
        : -cfg.aMinus * Math.exp(dt / cfg.tauMinus);
    }
    dw *= evidence.gain ?? 1;
    if (dw === 0) return 0;
    c.w[e] = clamp(w + dw, -cfg.wMax, cfg.wMax);
    if (dw > 0) c.stats.strengthened++; else c.stats.weakened++;
    return dw;
  },

  init() { return { applied: 0, potentiated: 0, depressed: 0, sum: 0 }; },

  // Per tick sweep. Only edges that touch a cell which fired on this tick are candidates,
  // so the cost is proportional to activity and not to the size of the connectome.
  tick(eng, ctx) {
    const b = eng.brain, c = b.connectome, t = ctx.t;
    const cfg = eng.cfg('hebbian'), st = eng.st('hebbian');
    const own = eng.targetSet('hebbian');
    const ev = { pre: 0, post: 0, dt: null, gain: 1, cfg };
    let applied = 0;
    for (const idx of eng.firedNow) {
      for (const e of c.outOf(idx)) applied += consider(e);
      for (const e of c.into(idx)) applied += consider(e);
    }
    st.applied += applied;
    return applied;

    function consider(e) {
      if (!(c.flags[e] & ACTIVE)) return 0;
      const src = c.src[e], dst = c.dst[e];
      if (!own.has(dst)) return 0;
      if (eng.seen.has(e)) return 0;
      eng.seen.add(e);
      const postFired = eng.firedNow.has(dst);
      let dt = null;
      if (postFired && eng.fireT[src] >= 0) {
        const arrive = eng.arrival(e, eng.fireT[src]);
        if (arrive <= t) dt = t - arrive;
      } else if (eng.firedNow.has(src) && eng.fireT[dst] >= 0) {
        dt = eng.fireT[dst] - eng.arrival(e, t);
      }
      ev.pre = eng.pre(src, t);
      ev.post = postFired ? 1 : 0;
      ev.dt = dt;
      ev.gain = eng.gainForCell(dst);
      if (!eng.spend(1)) return 0;
      const dw = hebbian.apply(b, e, ev, ctx);
      if (dw > 0) st.potentiated++; else if (dw < 0) st.depressed++;
      st.sum += dw;
      return 1;
    }
  },
});
