// bench/semantic.mjs: the semantic tier's Hopfield step, resident arena kernels against the
// JS path, graded lane for lane and timed. One command, every number printed and written to
// verdicts/semantic.json:
//   1. equality: the arena step returns the same vector as bundle(patterns, weights)
//   2. one step at a full tier: microseconds with the arena and in JS, and the ratio
//   3. the curve: microseconds per step as the tier fills
//   4. cleanup: microseconds per cue with the arena, and iterations to convergence
// The soak profile of 2026-09-17 charged 55.5 s of 117.2 s to this step in JS.
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RNG } from '../core/rng.mjs';
import * as S from '../core/signal.mjs';
import * as SIMD from '../core/simd.mjs';
import { SemanticMemory } from '../memory/semantic.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const arg = (name, dflt) => { const a = process.argv.find(x => x.startsWith('--' + name + '=')); return a ? Number(a.split('=')[1]) : dflt; };
const D = arg('d', S.D);
const N = arg('patterns', 4096);
const STEPS = arg('steps', 10);
const CURVE = [256, 1024, N].filter((v, i, a) => a.indexOf(v) === i).sort((x, y) => x - y);
const t0all = Date.now();

function tier(n, arena) {
  const rng = new RNG('semantic:bench:' + n);
  const m = new SemanticMemory({ d: D, capacity: n });
  if (!arena) { m.arena = null; m.slotOf = []; }
  const pats = [];
  for (let i = 0; i < n; i++) { const p = S.hvRandom(rng, D); pats.push(p); m.add(p, { name: i % 4 === 0 ? 'c' + i : null, strength: 1 + rng.int(5) }); }
  const cues = [];
  for (let s = 0; s < STEPS; s++) cues.push(S.bundle([pats[rng.int(n)], S.hvRandom(rng, D)]));
  return { m, cues };
}
const usPerStep = (m, cues) => { m.step(cues[0]); const t0 = process.hrtime.bigint(); for (const c of cues) m.step(c); return Number(process.hrtime.bigint() - t0) / 1e3 / cues.length; };

console.log('semantic step: D=' + D + ', wasm simd ' + (SIMD.available ? 'available' : 'unavailable (' + SIMD.unavailableReason + ')'));

// 1 + 2: equality and one step at the full tier
const A = tier(N, true), B = tier(N, false);
let equal = 0;
for (let s = 0; s < STEPS; s++) if (S.sim(A.m.step(A.cues[s]), B.m.step(B.cues[s])) === 1) equal++;
const arenaUs = A.m.arena ? usPerStep(A.m, A.cues) : null;
const jsUs = usPerStep(B.m, B.cues);
console.log('  ' + N + ' patterns: arena ' + (arenaUs === null ? 'n/a' : arenaUs.toFixed(1) + ' us') + ' per step, js ' + jsUs.toFixed(1) + ' us, equal ' + equal + '/' + STEPS);

// 3: the curve
const curve = [];
for (const n of CURVE) {
  const a = tier(n, true), b = tier(n, false);
  const au = a.m.arena ? usPerStep(a.m, a.cues) : null, bu = usPerStep(b.m, b.cues);
  curve.push({ patterns: n, arenaUs: au, jsUs: bu, speedup: au === null ? null : bu / au });
  console.log('  curve ' + String(n).padStart(5) + ' patterns: arena ' + (au === null ? 'n/a' : au.toFixed(1).padStart(8) + ' us') + '   js ' + bu.toFixed(1).padStart(8) + ' us' + (au === null ? '' : '   ' + (bu / au).toFixed(2) + 'x'));
}

// 4: cleanup
let iters = 0;
const tc = process.hrtime.bigint();
for (const c of A.cues) iters += A.m.cleanup(c).iterations;
const cleanupUs = Number(process.hrtime.bigint() - tc) / 1e3 / STEPS;
console.log('  cleanup: ' + cleanupUs.toFixed(1) + ' us per cue, ' + (iters / STEPS).toFixed(2) + ' iterations per cue, ' + N + ' patterns');

const verdict = {
  at: new Date().toISOString(), node: process.version, d: D, patterns: N, steps: STEPS, wasm: SIMD.available, ms: Date.now() - t0all,
  equal: equal + '/' + STEPS, equalSteps: equal, arenaStepUs: arenaUs, jsStepUs: jsUs, speedup: arenaUs === null ? null : jsUs / arenaUs,
  cleanupUs, iterationsPerCue: iters / STEPS, curve,
};
mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
writeFileSync(path.join(HERE, 'verdicts', 'semantic.json'), JSON.stringify(verdict, null, 2));
console.log('\nSEMANTIC: one Hopfield step over ' + N + ' patterns at D=' + D + ' takes ' + (arenaUs === null ? 'n/a' : arenaUs.toFixed(1) + ' us') + ' with the arena and ' +
  jsUs.toFixed(1) + ' us in JS' + (arenaUs === null ? '' : ', ' + (jsUs / arenaUs).toFixed(2) + 'x') + ', lane-identical ' + equal + '/' + STEPS +
  '; wrote bench/verdicts/semantic.json in ' + ((Date.now() - t0all) / 1000).toFixed(1) + ' s');
