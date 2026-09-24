# notes/dream.md

Owner of `mind/dream.mjs`, `bench/dream.mjs`, `test/dream.test.mjs`, `bench/verdicts/dream.json`
and this note, plus ONE hook in `daemon/run.mjs` (one import, one `attachDream(...)` call, off
in a bounded run unless `opts.dreamEvery` is given). His words (MANUAL.md section A,
2026-09-23): "It also should hallucinate." This is P11 in section B. Every number below was
printed by `node bench/dream.mjs`, `node --test test/dream.test.mjs` or a `node -e` read of
`bench/verdicts/dream.json`.

## What was built

The imagination region, `mind/dream.mjs`, class `DreamRegion`, attached by
`attachDream(brain, { every })`.

- **A dream** is a real signal (`signal('event', ...)`) with `provenance: 'dream'` and
  `grounded: false`, logged as a `dream` ledger event with its novelty. It makes ONE checkable
  claim: "cell C, at its `horizon`-th run after this that consumes anything (default 2),
  consumes a signal whose data hash is H". The ledger already records the signal seqs every run
  consumed and the hash of every signal, so the claim is grounded later (the matching signal
  seq is named) or falsified, and either way scored as a `dream.score` event; one never
  resolved decays (`dream.decay`, with its reason).
- **Where dreams come from**, competing hypotheses per series, each rule applied `horizon`
  times to its own output:
  - **predict**: prediction cell histories under repeat, arithmetic, geometric, second
    difference, the cell's own last prediction, and a splice that carries another series' step
    onto this one.
  - **episode**: the numeric fields of the episodic tier's recent values, the same rules; the
    claim is about the memory cell.
  - **mind**: the cell native language model continues the series. Free sampling wrote no number
    in 25 of 25 tries on the organism, so decoding is restricted to its numeral tokens and the
    model's own most probable number is the claim.
  - **hv**: repeat, permute, bundle of the last two, bind with a semantic tier pattern, and what
    followed the nearest episode.
- **The control**: every dream has a matched control, a value replayed at random from the same
  observer's own history at the same horizon, scored on the same run, never proposed.
- **Novelty**: the normalized hv distance `(1 - sim) / 2` from the claim's content vector (the
  word encoding of `act/prompt.mjs` encodePrompt; the test asserts they agree lane for lane) to
  its nearest neighbour in the episodic tier (its own LSH index) and the semantic tier (one
  `_sims` scan), plus the predicted vector itself for an hv claim; 0 when the observer already
  consumed that exact value. Novel at 0.25 or more.
- **The gate**: a dream is useful when novel AND (grounded, or it raises the suite probe: the
  frontier items the exact path gets wrong, asked through the memory path with the dream as the
  only memory item). Only useful dreams are proposed, kind `dream.keep`, registered with
  `registerProposalKind` and judged by `dreamPolicy`. `apply()` refuses anything but the very
  proposal object the gate returned for this dream with status approved (the test forges three
  variants; all throw). A held proposal stays in the pool, exempt from decay, and is applied
  only after `gate.decide` approves it. A kept dream becomes an episodic memory item that still
  says provenance dream and grounded false, with the seq that confirmed it.
- **The period**: an afterTick hook every `every` ticks, and only when no ask is active (mail
  or inflight signals for the ask region, `brain.ctx.asking > 0`, or an `act.ask` event since
  the last cycle). A cycle's budget is the smaller of 40 ms and 5% of the wall time since the
  last cycle, with a 1 ms floor.

## The bar (final run, 2026-09-23T21:56:57.764Z, `node bench/dream.mjs`)

Three 12 major organisms from one seed, 1200 ticks each in rotated chunks: A dreams every 32
ticks, B and C do not (C is B's twin, so C against B is the band of two arms that differ in
nothing). Printed:

- 408 dreams, 516.951 per wall minute of the dreaming organism.
- Novelty fraction 18.38% (75 of 408).
- Grounded later 19.85% (81 of 408 resolved, Wilson 16.27% to 24.00%) against 5.88% (24 of 408)
  for the matched control; gap 13.97% [9.47%, 18.53%].
- Strict: grounded by a signal emitted AFTER the dream was born 52 of 408 (12.75%), 29 matched a
  signal already in flight at birth; control 13 of 408 (3.19%); strict gap 9.56% [5.93%, 13.38%].
- Proposals submitted 3, approved 3, applied 3. Ledger events never read: 0. Errors 0.
- Ticks/s 25.341 dreaming, 26.04 without (twin 26.27): A 2.76% slower than B, C against B
  -0.88%; the region itself 3.01% of A, longest cycle 44.621 ms.
- Task effect, 725 items, provider null: algebra 360/360 vs 360/360, sequence 205/205 vs
  205/205, grid 159/160 vs 159/160; gain 0.00% on each ([-1.06%, 1.06%], [-1.84%, 1.84%],
  [-2.88%, 2.88%]); not below on every suite. The cycle after the asks waited ("act.ask since
  the last cycle").

## What the first run showed about its own ruler (why the horizon is 2)

The first full run (2026-09-23T21:46:20Z) claimed the observer's NEXT consuming run. It printed
76 of 425 grounded, and its verdict shows 74 of those 76 matched a signal already in flight at
birth (control 17 of 20): the next run consumes what the previous tick emitted. The dreamer reads
histories only, never mailboxes or inflight signals, so it did not see the answer, but the answer
already existed in the organism: "grounded later" meant "observed later", not "emitted later".
The fix is `horizon: 2`, and the bench now prints the strict count beside the loose one. The
same run missed 9288 ledger events in the 160 settle ticks (the region was detached and not
observing); the settle now observes every period and the final run missed 0.

## What is not claimed

- The task effect is structural. The exact path answers all but 1 of the 725 suite items before
  memory is consulted, and the suite probe measured a total gain of 0. "Not below" holds because
  a dream cannot reach a solved item; nothing here says dreaming improves these suites.
- Useful dreams saturate. All 3 proposals came in the first 256 ticks: a kept dream ("as.0002.1
  next consumes float 184") sits near every later instance of the same regularity (the content
  vector shares every word but the value), so they fall under the novelty threshold. The region keeps one
  representative per regularity, not one per value.
- The hv generator made 125 dreams, 61 novel, 0 grounded; the mind generator 53 dreams, 0 novel,
  5 grounded. They are imagination in the loose sense only, and the ledger says so.
- Horizon 2 still leaves 29 of 81 groundings matched by a signal in flight at birth (edges with
  a delay above one tick). The strict line is the one to quote.
- The 40 ms cap is checked between claims; one claim can overrun it (longest cycle 44.621 ms).

## Next rung

- Suites the exact path does not solve, where a dream memory item can move a score: ARC
  evaluation tasks and the public sets of bench/public.mjs (Board 8's).
- Claims about ask outcomes, not only cell inputs; a horizon chosen per observer from its edge
  delays so the strict and loose counts coincide.
- The novelty threshold itself proposed through the gate.
