// tools/bench-attention.mjs: what the attention hook costs on the whole brain, the numbers
// notes/whole.md request 6 asks for. Two arms on one freshly built brain each:
//   every=1   the hook scores on every tick (the old behaviour)
//   every=N   the hook scores on one tick in N (the option this landed)
// and, separately, the cost of one Attention.step call measured around the call itself.
//   node tools/bench-attention.mjs [ticks] [every] [majors] [units]
import { buildWhole } from '../seeds/whole.mjs';
import { closeWorld } from '../world/index.mjs';

const ticks = Number(process.argv[2] || 100);
const every = Number(process.argv[3] || 16);
const majors = Number(process.argv[4] || 12);
const units = Number(process.argv[5] || 256);
const now = () => Number(process.hrtime.bigint()) / 1e6;

function build() {
  const { brain } = buildWhole({ majors, substrateUnits: units, ledger: 'off', seed: 'attention-bench', mindBytes: 20_000 });
  return brain;
}
function release(brain) {
  try { closeWorld(brain); } catch { /* nothing open */ }
  const learning = brain.whole.services.learning;
  if (learning && typeof learning.detach === 'function') learning.detach();
}

// arm: the hook in place, nothing else touched
function arm(n) {
  const brain = build();
  const att = brain.whole.services.attention;
  att.every = n;
  const t0 = now();
  brain.tick(ticks);
  const ms = now() - t0;
  const out = { every: n, ms, perTick: ms / ticks, ticksPerSec: (ticks / ms) * 1000, scoredTicks: att.stats.ticks, skippedTicks: att.stats.skipped, scored: att.stats.scored };
  release(brain);
  return out;
}

// the step itself: one extra call per tick, timed around the call
function stepCost() {
  const brain = build();
  const att = brain.whole.services.attention;
  att.every = 1;
  let stepMs = 0;
  for (let i = 0; i < ticks; i++) {
    brain.tick(1);
    const a = now();
    att.step(brain, brain.clock.t);
    stepMs += now() - a;
  }
  const out = { cells: brain.cells.length, edges: brain.connectome.size(), stepMs, perStep: stepMs / ticks, scored: att.stats.scored };
  release(brain);
  return out;
}

const one = arm(1);
const many = arm(every);
const s = stepCost();
console.log('whole: cells ' + s.cells + ', edges ' + s.edges);
console.log('every=1:  ' + ticks + ' ticks in ' + one.ms.toFixed(2) + ' ms, ' + one.ticksPerSec.toFixed(2) + ' ticks/s, attention scored on ' + one.scoredTicks + ' ticks, skipped ' + one.skippedTicks + ', ' + one.scored + ' signals');
console.log('every=' + every + ': ' + ticks + ' ticks in ' + many.ms.toFixed(2) + ' ms, ' + many.ticksPerSec.toFixed(2) + ' ticks/s, attention scored on ' + many.scoredTicks + ' ticks, skipped ' + many.skippedTicks + ', ' + many.scored + ' signals');
console.log('one Attention.step: ' + ticks + ' calls in ' + s.stepMs.toFixed(2) + ' ms, ' + s.perStep.toFixed(4) + ' ms per step, ' + s.scored + ' signals scored');
