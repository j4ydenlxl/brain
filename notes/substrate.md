# notes/substrate.md: the dense substrate (millions of micro units in one process)

His words: "every single node / neuron should be clickable and have different functions.
They should all be the same sizes but some should have very high capability some less,
all connected. Make millions of these capability. They should be unique and
interconnected. Its not a mirror of the human brain, its making a brain to make the ai as
hyperefficient and performative as possible."

## What was built

- `core/substrate.mjs`: `class Substrate({ units, seed, kinds, edgesPerUnit, maxDelay, localWindow, excitatory, gain, backend })`.
  Struct of arrays on ONE buffer (a `WebAssembly.Memory` when it fits, else an ArrayBuffer):
  kind u8, region u8, capability f32, params f32 x4, state f32 x2, lastFired u32,
  fireCount u32, out f32, inDeg u32; edges in CSR (rowPtr u32, col u32, weight f32,
  delay u8); an input ring of `maxDelay + 2` slots of f32 x units. No per-unit object,
  ever: `unit(id)` builds a plain object on demand from the arrays.
- Twenty kinds, each one `case` in the JS loop and one block in the wasm `br_table`:
  integrate.fire, leaky, xor, majority, delay.line, counter, comparator, multiplier,
  accumulator, hash.mix, threshold, oscillator, latch, min, max, router, squash,
  differentiator, refractory.fire, inhibit. Each carries a plain-English `function`
  line for the clickable brain.
- Same size, different capability: every unit is 1+1+4+16+8+4+4+4+4 = 46 bytes of unit
  state plus 8 edges of 9 bytes plus its ring slots. `capability` in [0, 1] is
  0.45 x kind cost + 0.35 x normalised degree + 0.20 x signature.
- Unique: params 0..2 (threshold, rate, amplitude) are seeded hashes; param 3, the
  signature, is `(i * odd + c) mod 2^24 / 2^24`, a bijection of the index for up to
  2^24 units (the constructor refuses more), exact in f32. `duplicateSignatures()` sorts
  the raw bit patterns and counts adjacent equals; the test also checks the full vector.
- All connected: edge 0 of every unit is the spanning ring `i -> i + 1 mod N`; the other
  seven are 60% local (within `localWindow` = 64 either side, delay 0..2) and 40% long
  range (anywhere, delay 1..maxDelay). `components()` runs union-find over every edge
  and returns the number of weakly connected components; 1 is asserted by the test and
  printed by the bench.
- Time: `tick()` reads slot `t % R`, runs every unit once, delivers `o * weight` into slot
  `(t + 1 + delay) % R`, then zeroes the slot it read. Delay 0 lands next tick, the same
  rule as `Connectome.arrival = t + 1 + delay`. The router kind is the one kind whose
  delivery differs: positive output goes to the first half of its out edges, negative to
  the second half.
- wasm: `assembleTick(layout)` emits a module by hand (no toolchain, like core/simd.mjs)
  with N, R and every array offset baked in as immediates; 1477 bytes at 50k units, 1484 at 1M, 1494 at 4M (only the offset immediates grow). Every
  arithmetic step mirrors the JS reference in the same order with f64 compute and f32
  rounding at the same stores, so `fireCount`, `state`, `out` and `lastFired` are
  identical after 100 ticks (test and bench both assert it). `useBackend('js'|'wasm')`
  switches a live substrate and the trajectory continues unchanged.
- Brain cell kind `'substrate'` (defined in core/substrate.mjs, registered on import):
  ports `in: vec` (adds into units `[inLo, inLo + inLen)` scaled by edge weight),
  `out: vec` (state s0 of `[outLo, outLo + outLen)`), `event` (emits
  `{ type: 'substrate.burst', fired, fraction }` when the firing fraction crosses
  `threshold` upward). `serialize`/`deserialize` carry the dynamic arrays (ring, state,
  counters) so a brain snapshot restores it; the static arrays are rebuilt from the seed.
- `bench/substrate.mjs` writes `bench/verdicts/substrate.json`; `test/substrate.test.mjs`
  holds 11 tests.

## Measured choices (100,000 units, 200 ticks, the numbers a throwaway run printed)

Firing fraction over ticks 100..199 against the weight gain, excitatory fraction 0.6:

| gain | firing fraction | ms/tick (js) |
|------|-----------------|--------------|
| 1    | 0.5502          | 1.62         |
| 0.5  | 0.0654          | 1.07         |
| 0.35 | 0.0529          | 0.98         |
| 0.25 | 0.0489          | 1.01         |
| 0.15 | 0.0463          | 0.96         |

The excitatory fraction alone (0.5 to 0.75 at gain 1) moved the fraction only 0.5423 to
0.5549, because many kinds fire on magnitude, not sign. The transition is in the gain,
between 0.5 and 1. Default gain is 0.5: sparse (about 6.5% of units fire per tick),
oscillator driven, and activity still reaches every region.

## Core: nothing edited

No file outside the three new ones plus this note was touched. `cells/index.mjs` was NOT
edited: the kind registers when `core/substrate.mjs` is imported, so a seed that wants a
substrate cell imports it. If the organism should carry substrate majors, the one-line
hook is `import '../core/substrate.mjs';` in `cells/index.mjs`; left for core to decide.

## Requests for core (open)

1. `Brain.inject` and `_emit` copy nothing for `vec`, so a substrate `out` slice of 64
   floats per tick is cheap; a slice of 1e6 floats would be one Float32Array allocation
   per tick. If the viz wants the whole state, read `cell.state.sub.state` directly
   rather than through a port.
2. `Substrate.units` is capped at 2^24 by the signature bijection. Past that, widen the
   signature to two params (48 bits) or shard into several substrates.

## Bench numbers (node bench/substrate.mjs, 2026-09-16, Node v24.15.0, 32 threads)

| units     | layout MB | build ms | js ms/tick | js ticks/s | wasm ms/tick | wasm ticks/s | unit-updates/s (wasm) | firing fraction | components | dup signatures | wasm = js |
|-----------|-----------|----------|------------|------------|--------------|--------------|-----------------------|-----------------|------------|----------------|-----------|
| 1,000,000 | 150.7     | 234.8    | 20.743     | 48.21      | 14.024       | 71.31        | 71,308,427            | 0.0393          | 1          | 0              | 0 units differ |
| 4,000,000 | 602.7     | 980.1    | 83.964     | 11.91      | 55.563       | 18           | 71,989,783            | 0.0396          | 1          | 0              | 0 units differ |

rss with both twins alive: 353.8 MB at 1M, 1408.9 MB at 4M (limit 4 GB, so 4M fit; the
bench would otherwise print the largest size that does). Speedup wasm over js: x1.48 and
x1.51. Scaling is linear: 48.2M unit-updates/s js at both sizes, 71.3M and 72.0M wasm.
