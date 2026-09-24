# Quantum tokens: what the word can honestly mean in software today

His question: "What if AI was quantum? Instead of tokens, qubits are like quantum tokens."
This note answers it with a built thing and measured numbers, and states plainly where the
analogy stops. Every number below was printed by `node bench/fhrr.mjs` on this machine
(Node v24.15.0, D = 8192) and is stored in `bench/verdicts/fhrr.json`.

## The buildable form: a phasor, not a qubit

A token is an index into a vocabulary. It has no interior: two tokens are equal or they are
not. A qubit is a unit vector of complex amplitudes, and the useful part is not the mystery,
it is the arithmetic: amplitudes ADD, so two states can occupy the same register at once and
interfere, and the operations that move them are unitary, so they are exactly invertible.

Those two properties are available classically if a signal carries a phase per dimension.
That is the `phv` kind in `cells/fhrr.mjs`: a Float32Array of 8192 phases, one unit complex
number per dimension.

- superposition is complex addition (`bundle`), and what survives is interference, not an
  overwrite
- binding is phase addition (`bind`), a diagonal unitary, so it has an EXACT inverse
  (`unbind`), which is phase subtraction
- measurement is the real part of a normalised inner product (`sim`), and it does not
  collapse the state: a phasor can be read as many times as you like
- a real exponent (`power`, fractional binding) encodes a continuous quantity, and exponents
  add under bind

This is Fourier Holographic Reduced Representation. The bipolar hypervector already in
`core/signal.mjs` is its special case where every phase is 0 or pi.

## What was measured

**Capacity.** One vector, k key-bound values written into it, each read back by unbinding its
key and cleaned up against a 512 item codebook. Phasor read-back is perfect (50 of 50 reads)
up to 320 items and 98% at 500; the bipolar hv at the same D and the same protocol is perfect
up to 120 items, 98% at 200, 88% at 320, and 64% at 500.

**Exactness.** Over 32 random trials, `unbind(bind(a, b), b)` returns the original phases with
a worst error of 4.768e-7 radians and a similarity of 1.000000000. The bipolar hv also
inverts a single bind exactly (0 mismatched lanes, similarity 1.000000000): binding is exact
in BOTH algebras, and the honest claim is narrower than "phasors unbind exactly and hv does
not". The difference appears inside a superposition, where the read-out carries the other
items as noise: at 8 stored pairs the phasor read-out sits at 0.3138 similarity to the true
value against 0.2716 for the hv, and at 128 pairs 0.0779 against 0.0700.

**Continuity.** `sim(a, power(a, 1 + dx))` falls from 1.000000 at dx = 0 through 0.935620 at
0.1 and 0.637219 at 0.25 to 0.000282 at 0.5, monotonically over 21 samples of [0, 0.5]. That
is a kernel over a continuum, reached by arithmetic rather than by bucketing a number into a
symbol. Beyond 0.5 the curve rings around zero (measured -0.004811 at dx = 1.0), so the
ordering claim is made only on the band where the code is above noise.

**Factorisation.** A product of three unknown factors, each from a codebook of 64, is 262144
candidate products. A resonator network (alternating projection between the codebooks, with
restarts when a run settles on a state that does not rebuild the product) recovered the exact
triple in 19 of 20 trials, in a mean of 6.3 iterations and 2.7 starts, mean 388.85 ms. Cost
scales with iterations, not with the number of combinations.

**Throughput.** Bind 85,972 per second (11632 ns) with the hand assembled wasm SIMD kernel
against 28,964 per second (34526 ns) in JS. Sim 164,439 per second (6081 ns) with the kernel
against 10,520 per second (95059 ns) in JS, agreeing to 2.75e-8. Bundle of 8 is the slow
operation at 621 per second (1609151 ns), because it costs a cosine and a sine per dimension
per member. The bipolar hv remains faster per operation (bind 282,622 per second, sim
1,765,848 per second): the phasor buys capacity and continuity, and it pays for them.

## What is NOT possible without quantum hardware

Stating this so no one reads more into the word than the code earns.

- **No entanglement.** Every phasor here is a product state, one independent phase per
  dimension. The states that make quantum computing interesting are the ones that CANNOT be
  written that way, and none of them are representable in a Float32Array of phases.
- **No exponential state space.** n qubits carry 2^n amplitudes. D = 8192 phases carry 8192.
  Superposition capacity here is a measured curve (320 items above), not an exponential.
- **No Grover or Shor speedup.** The resonator searches 262144 combinations in a mean of 6.3
  iterations, but that is alternating projection on a classical vector, not amplitude
  amplification, and it can fail: it did once in 20 trials.
- **No collapse, no measurement problem, no non-determinism.** Reading a phasor is free and
  repeatable. That is a feature for a brain that has to be auditable, and it is also the
  exact sense in which this is not quantum.
- **No quantum advantage claim of any kind.** Nothing here runs faster than a classical
  algorithm could, because it IS a classical algorithm.

## Why it still matters for BRAIN

The useful half of "quantum tokens" was never the hardware. It was that a unit of meaning
should be able to hold several things at once, combine with others reversibly, carry a
continuous quantity without being bucketed, and be decomposed back into its parts. A token
does none of those. A phasor does all four, measured above, in Float32Array of 8192 numbers
that a cell can hold as state and a connectome can carry on an edge.

Sources for the mechanism, both classical: Plate's Holographic Reduced Representations
(the Fourier variant is the phasor algebra used here) and Frady, Kent, Olshausen and
Sommer's resonator networks for factoring distributed representations. The invention here is
not the algebra, it is that it is a first class signal kind of this brain with wasm kernels,
cell kinds and a bench that grades it against the representation it replaces.
