// capability/index.mjs: the capability layer as one surface. Importing this module
// registers the cell kinds 'skill' and 'solve', so any Brain can hold them.
//
// The layer answers the question the manual asks: a modern assistant has to be told what
// to build, and this one is not. Given examples it writes the program, given an equation
// it solves it exactly and verifies the solution by substitution, given a market it
// induces a decision policy and grades it against a matched control, and given anything
// it has met before it answers from memory with no search at all.
import { SkillRegistry, defaultRegistry } from './skills.mjs';
import { induceAll, TASKS, algebraBattery } from './induce.mjs';
import { Solver } from './router.mjs';
import { runMarket, storePolicy } from './market.mjs';

export * from './induce.mjs';
export * from './skills.mjs';
export * from './router.mjs';
export * from './market.mjs';
export { listKinds, hasKind, getKind } from '../core/cell.mjs';

// Give a brain its own registry, so two brains do not share what they learned unless
// they are meant to.
export function attachCapability(brain, { registry = null } = {}) {
  brain.capability = { registry: registry || new SkillRegistry({ name: brain.name + ':skills' }) };
  return brain.capability.registry;
}

// One call that brings a fresh registry up to the whole catalogue plus a decision policy:
// the state in which the brain "already knows how to do it" before anyone asks.
export function bootstrap({ registry = defaultRegistry, market = true, marketOpts = {} } = {}) {
  const induction = induceAll({ registry });
  let policy = null, marketResult = null;
  if (market) {
    marketResult = runMarket(marketOpts);
    policy = storePolicy(registry, marketResult);
  }
  return {
    registry, induction, market: marketResult,
    skills: registry.size, policy: policy ? policy.name : null,
    solver: () => new Solver({ registry }),
  };
}

export { TASKS, algebraBattery, induceAll, SkillRegistry, defaultRegistry, Solver, runMarket, storePolicy };
