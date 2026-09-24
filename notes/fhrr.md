# notes/fhrr.md: the phasor kind, and the four lines it cost in core

The phasor hypervector (`phv`) is built in `cells/fhrr.mjs`: algebra, wasm SIMD kernels, and
seven cell kinds. `core/primitives.mjs` was NOT touched. `core/signal.mjs` needed the kind
registered, which is four labels. Recorded here so the edit is auditable.

1. `export const KINDS = Object.freeze(['hv', 'sdr', 'num', 'sym', 'vec', 'event', 'phv']);`
   `phv` is appended LAST on purpose. `runtime/protocol.mjs` turns this array order into a
   bitmask (`1 << KINDS.indexOf(k)`), so appending leaves every existing kind on its old bit
   and every shard wire format unchanged.
2. `hashData`: `case 'hv': case 'vec': case 'phv':` (a phasor hashes as its bytes, like a vec).
3. `dataToJSON`: `case 'vec': case 'phv':` (base64 of the Float32Array).
4. `dataFromJSON`: `case 'vec': case 'phv':` (back to a Float32Array copy).

Nothing else in core changed. `cells/basic.mjs` picks up `phv` automatically through its
`ANY = S.KINDS.slice()` port declaration, so `source.const` and `sink.log` carry phasors
without an edit.

## Why a phasor and not another bipolar hv

The bipolar hv is the special case of the phasor where every phase is 0 or pi. Opening the
whole circle buys three things the bench measures:

- **Exactness inside superposition.** Both algebras invert a single bind exactly (the bench
  prints hv mismatched lanes 0 and phv max phase error, both graded over 32 trials). The
  difference is what survives a bundle: see `bench/verdicts/fhrr.json` -> `superposed`.
- **Capacity.** Same D, same protocol, same cleanup codebook: `phvPerfectUpTo` against
  `hvPerfectUpTo` in the verdict.
- **Continuous quantities.** `power(a, k)` for real k is fractional binding. A price, a
  coordinate or a delay enters the algebra as an exponent, exponents add under bind, and
  similarity falls off as a kernel in the distance. The bipolar hv has no such operation:
  its only exponents are 0 and 1.

## Honest limits

- This is a product state in classical memory. There is no entanglement, no amplitude
  interference beyond what complex addition gives, and no speedup of the kind quantum
  hardware is conjectured to provide. `research/quantum-tokens.md` states exactly what the
  word "quantum" can and cannot mean here, with only measured numbers.
- The sim kernel in wasm evaluates a cosine by Taylor series, so it is adopted only when
  `calibrate()` measures it BOTH faster than the JS loop AND within 1e-6 of it on this host.
  The adoption decision and both timings are in the verdict under `wasm`.
- `bundle` is the slow operation: one cos and one sin per dimension per member, in JS. The
  bench prints its nanoseconds. It is not a wasm kernel yet.

## Open

- A wasm kernel for `bundle` (the trig, not the addition, is the cost).
- The resonator is O(iterations x factors x codebook x D) and runs in Float64 in JS. A
  batched kernel would make many-factor decoding routine rather than a demonstration.
