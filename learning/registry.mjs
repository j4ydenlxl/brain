// learning/registry.mjs : LEARNING IS DISTRIBUTED. BRAIN does not have one learning
// algorithm. It has a registry of named rules, each a plugin, each testable and
// replaceable without rebuilding the substrate (DESIGN.md section 9).
//
// A rule is:
//   {
//     name      unique string
//     scope     'edge' | 'cell' | 'structure'   what a single apply() touches
//     doc       one line saying what it does
//     defaults  the rule's configuration, merged under the engine config
//     init?(engine, cfg) -> state               per attachment state (traces, counters)
//     tick?(engine, ctx)  -> { applied, ... }   per tick sweep: gather evidence, call apply
//     apply(brain, target, evidence, ctx)       the primitive, one target, one update
//   }
//
// target by scope:
//   edge       an edge index into brain.connectome
//   cell       a cell object
//   structure  null (the rule works over the whole brain and proposes to the gate)
//
// evidence is a plain bag the caller fills: pre, post, dt, z, delta, error, gain, cfg.
// A rule NEVER reaches into another rule. Rules communicate only through signals
// (cells/learning.mjs carries reward, error and gain on the wire) and through the
// ledger (learn.reward, learn.error, learn.modulator events). That is the whole
// coupling surface, which is what makes a rule swappable.

const RULES = new Map();
export const SCOPES = Object.freeze(['edge', 'cell', 'structure']);

export function defineRule(def) {
  const { name, scope, apply, doc = '', defaults = {}, init = null, tick = null } = def || {};
  if (!name || typeof name !== 'string') throw new Error('defineRule: a rule needs a name');
  if (RULES.has(name)) throw new Error('learning rule already defined: ' + name);
  if (!SCOPES.includes(scope)) throw new Error('rule ' + name + ': scope must be one of ' + SCOPES.join('|'));
  if (typeof apply !== 'function') throw new Error('rule ' + name + ': apply(brain, target, evidence, ctx) required');
  if (init && typeof init !== 'function') throw new Error('rule ' + name + ': init must be a function');
  if (tick && typeof tick !== 'function') throw new Error('rule ' + name + ': tick must be a function');
  if (!doc) throw new Error('rule ' + name + ': doc required, a rule nobody can read is a rule nobody can replace');
  const rule = Object.freeze({ name, scope, doc, defaults: Object.freeze({ ...defaults }), init, tick, apply });
  RULES.set(name, rule);
  return rule;
}

export function getRule(name) {
  const r = RULES.get(name);
  if (!r) throw new Error('unknown learning rule: ' + name + ' (have ' + [...RULES.keys()].join(', ') + ')');
  return r;
}
export function hasRule(name) { return RULES.has(name); }
export function ruleNames() { return [...RULES.keys()]; }
export function listRules() {
  return [...RULES.values()].map(r => ({ name: r.name, scope: r.scope, doc: r.doc, defaults: r.defaults }));
}

// A cell policy may name a rule: policy.learn = 'hebbian' or ['hebbian', 'homeostatic'].
// The array form is the recommended one. core/brain.mjs matches policy.learn === 'hebbian'
// exactly and runs its own built in edge update for that cell, so the plain string form
// makes two rules act on the same edges. attach() warns when it sees that.
export function rulesNamedBy(cell) {
  const l = cell && cell.policy ? cell.policy.learn : null;
  if (!l || l === false) return [];
  const list = Array.isArray(l) ? l : [l];
  return list.filter(n => typeof n === 'string' && RULES.has(n));
}
export function namesRule(cell, name) {
  const l = cell && cell.policy ? cell.policy.learn : null;
  if (!l || l === false) return false;
  return Array.isArray(l) ? l.includes(name) : l === name;
}

// Merge order: rule defaults, then the engine configuration, then per call evidence.cfg.
export function mergeConfig(rule, evidence, ctx) {
  const fromEngine = ctx && ctx.learning && typeof ctx.learning.cfg === 'function' ? ctx.learning.cfg(rule.name) : null;
  if (evidence && evidence.cfg) return evidence.cfg;
  if (fromEngine) return fromEngine;
  return rule.defaults;
}

export function clamp(x, lo, hi) { return x < lo ? lo : x > hi ? hi : x; }
