// learning/reinforcement.mjs : three factor learning. Pre and post activity alone only
// leaves a MARK on an edge (an eligibility trace). A reward broadcast to a region later
// decides whether that mark becomes a strengthening or a weakening.
//
//   z[e]  <- gamma * lambda * z[e] + pre_arrival * post          eligibility, per edge
//   b     <- b + beta * (r - b)                                   baseline, per region
//   dW[e] <- eta * (r - b) * z[e]                                 credit, on reward
//
// gamma is the discount (an edge active long before the reward is credited less), lambda
// is the trace decay, beta sets how fast the baseline tracks the reward so that a reward
// which is merely usual produces no learning at all.
//
// The reward never arrives as a function call. A cells/learning.mjs reward.source cell
// emits it as a num signal on the wire and appends a learn.reward event to the ledger;
// the engine's ledger listener is what this rule reads. That is the whole coupling.
import { defineRule, mergeConfig, clamp } from './registry.mjs';
import { ACTIVE } from '../core/connectome.mjs';

export const reinforcement = defineRule({
  name: 'reinforcement',
  scope: 'edge',
  doc: 'Three factor: a reward broadcast to a region credits edges into that region by their eligibility trace, against a running baseline and a per tick discount.',
  defaults: {
    eta: 0.1,       // credit rate
    gamma: 0.95,    // discount per tick
    lambda: 0.85,   // eligibility decay per tick
    beta: 0.05,     // baseline tracking rate
    floor: 1e-4,    // traces below this are dropped
    wMax: 4,
  },

  // target is an edge index. evidence: { z, delta, reward, baseline, gain, cfg }.
  apply(brain, e, evidence, ctx) {
    const cfg = mergeConfig(reinforcement, evidence, ctx);
    const c = brain.connectome;
    if (!(c.flags[e] & ACTIVE)) return 0;
    const eng = ctx && ctx.learning ? ctx.learning : null;
    const z = evidence.z ?? (eng ? eng.eligibility(e, ctx.t, cfg) : 0);
    if (!z) return 0;
    const d = evidence.delta ?? ((evidence.reward ?? 0) - (evidence.baseline ?? 0));
    if (!d) return 0;
    const dw = cfg.eta * d * z * (evidence.gain ?? 1);
    if (dw === 0) return 0;
    c.w[e] = clamp(c.w[e] + dw, -cfg.wMax, cfg.wMax);
    if (dw > 0) c.stats.strengthened++; else c.stats.weakened++;
    return dw;
  },

  init() { return { baselines: new Map(), rewards: 0, credited: 0, sum: 0, lastDelta: 0 }; },

  tick(eng, ctx) {
    const b = eng.brain, c = b.connectome, t = ctx.t;
    const cfg = eng.cfg('reinforcement'), st = eng.st('reinforcement');
    const own = eng.targetSet('reinforcement');

    // 1. lay eligibility on every edge that carried a pre spike into a cell that fired now
    for (const idx of eng.firedNow) {
      for (const e of c.into(idx)) {
        if (!(c.flags[e] & ACTIVE)) continue;
        if (!own.has(idx)) continue;
        const src = c.src[e];
        if (eng.fireT[src] < 0) continue;
        if (eng.arrival(e, eng.fireT[src]) !== t) continue; // the spike arrives exactly now
        eng.bumpEligibility(e, t, 1, cfg);
      }
    }

    // 2. a reward for a region credits every live trace on an edge into that region
    let applied = 0;
    const rewards = eng.takeRewards();
    for (const [region, r] of rewards) {
      st.rewards++;
      const base = st.baselines.get(region) ?? 0;
      const d = r - base;
      st.baselines.set(region, base + cfg.beta * d);
      st.lastDelta = d;
      if (d === 0) continue;
      const ev = { z: 0, delta: d, reward: r, baseline: base, gain: 1, cfg };
      for (const [e, z] of eng.eligibleEdges(t, cfg)) {
        const dst = c.dst[e];
        if (!own.has(dst)) continue;
        if (region !== '*' && b.cells[dst].region !== region) continue;
        if (!eng.spend(1)) break;
        ev.z = z;
        ev.gain = eng.gainForCell(dst);
        const dw = reinforcement.apply(b, e, ev, ctx);
        if (dw !== 0) { st.credited++; st.sum += dw; applied++; }
      }
      eng.ledger.append({ type: 'learn.reinforce', t, gen: ctx.gen, region, reward: r, baseline: base, delta: d, edges: applied });
    }
    return applied;
  },
});
