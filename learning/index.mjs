// learning/index.mjs : import this and every named rule is registered.
// Nothing here imports cells/, so cells/learning.mjs can import this without a cycle.
export * from './registry.mjs';
export { hebbian } from './hebbian.mjs';
export { delta, errorOf } from './delta.mjs';
export { reinforcement } from './reinforcement.mjs';
export { predictive } from './predictive.mjs';
export { structural } from './structural.mjs';
export { homeostatic, meanIncoming } from './homeostatic.mjs';
export { attach, detach, LearningEngine, DEFAULTS, DEFAULT_ORDER } from './engine.mjs';
