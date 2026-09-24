// simulate/world.mjs : A WORLD is the contract between a cloned sub-brain and the
// simulator: which cells to clone, what the action alphabet is, how an action becomes a
// signal, how a predicted outcome is read back, and how a trajectory is scored. It is a
// registry of named objects because cell params must stay serializable: a cell carries
// the NAME of a world, never a closure.
//
// The rollout never renders anything. The next state is whatever the cloned predictor
// cells say it is, fed straight back in as the next observation (research/SYNTHESIS.md 9).
const WORLDS = new Map();

// spec = {
//   cells | region | circuit,        // the subgraph to clone (clone.resolveIds)
//   exclude, excludeKinds,           // never clone the planner that is asking
//   actions: [...],                  // the action alphabet
//   init(ctx) -> state,              // starting hypothetical state
//   encode(action, ctx) -> injection | injection[],   // { cell, port, kind, data, delay?, w? }
//   observe(clone, ctx) -> state,    // next state from the clone's predictors
//   score(trace, ctx) -> number,     // higher is better
//   predictors?: [cellId], evaluators?: [cellId],     // default: auto-detected
//   perturb?(state, rng, ctx) -> state,               // per-seed noise, for uncertainty
//   lambda?: number,                 // default risk aversion for decide()
// }
export function defineWorld(name, spec) {
  if (!spec || typeof spec.encode !== 'function') throw new Error('world ' + name + ': encode(action, ctx) required');
  if (typeof spec.score !== 'function') throw new Error('world ' + name + ': score(trace, ctx) required');
  const w = { name, actions: [], lambda: 0.5, ...spec };
  WORLDS.set(name, w);
  return w;
}
export function getWorld(w) {
  if (w && typeof w === 'object') return w;
  const s = WORLDS.get(w);
  if (!s) throw new Error('unknown world ' + w + ' (defined: ' + [...WORLDS.keys()].join(', ') + ')');
  return s;
}
export function hasWorld(name) { return WORLDS.has(name); }
export function listWorlds() { return [...WORLDS.keys()]; }
export function clearWorlds() { WORLDS.clear(); }
