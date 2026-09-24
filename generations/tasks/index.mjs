// generations/tasks/index.mjs: the task registry. A task is the only thing that decides
// what fitness means; everything else in generations/ is task blind. A task supplies a seed
// genome (which fixes the input and output interface), the palette of cell kinds mutation
// may add, and a pure evaluate(genome, { seeds, cfg }).
import xor from './xor.mjs';
import sequence from './sequence.mjs';
import race from './race.mjs';

export const TASKS = Object.freeze({ xor, sequence, race });

export function getTask(name) {
  const t = TASKS[name];
  if (!t) throw new Error('unknown task ' + name + ' (have ' + Object.keys(TASKS).join(', ') + ')');
  return t;
}
export function taskNames() { return Object.keys(TASKS); }

// Episode seeds for a run: fixed for the whole run so a fitness in generation 40 is
// comparable with a fitness in generation 1, which is what the promotion gain is measured
// against. Rotating them per generation would make the gain unreadable.
export function seedsFor(runSeed, episodes) {
  const out = [];
  for (let i = 0; i < episodes; i++) out.push(runSeed + ':' + i);
  return out;
}
