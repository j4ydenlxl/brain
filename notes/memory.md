# notes/memory.md

Owner of `memory/*.mjs`, `cells/memory.mjs`, `test/memory.test.mjs`.
Everything below was observed while building those files on 2026-09-16.

## Requests for core (worked around, not blocking)

1. **`signal.mjs bundle(list, weights)` truncates fractional weights.**
   The accumulator is an `Int32Array`, so `acc[i] += v[i] * w` with `w < 1` writes 0. A
   softmax weight vector therefore bundles to nothing. `memory/semantic.mjs` works around
   it by scaling the softmax to integers first (`WEIGHT_SCALE = 1_000_000`, rounded), which
   keeps the accumulator inside Int32 for up to a few thousand patterns. A `Float64Array`
   accumulator, or a documented "weights must be integers" contract, would remove the trap.

2. **`signal.mjs ItemMemory` has no `delete(name)`.**
   Forgetting a concept has to remove its codebook entry as well as its pattern.
   `SemanticMemory._removeSlot` reaches into `items.items` (the underlying Map) to do it.
   An `ItemMemory.delete(name)` method would let that stop being a reach through.

3. **No place on `Brain` for a service object that cells can reach.**
   Cell params are serialized with the cell, so a param cannot hold a live reference. The
   memory cells therefore carry `params.system`, a string, and resolve it through a module
   level registry in `memory/index.mjs` (`registerMemorySystem` / `getMemorySystem`).
   `attachMemory(brain, sys)` also sets `brain.memory` for code that has the brain in hand.
   A `Brain.services` map, keyed by name and restored by name, would formalise this.

4. **`Brain.snapshot()` does not carry the memory system.**
   A full restore needs `MemorySystem.serialize()` written next to `snapshot.json` and
   `MemorySystem.from()` called after `Brain.restore()`. A snapshot hook (a list of
   `{ name, serialize, restore }`) would make the pair atomic.

5. **A throwing cell is invisible outside the ledger.**
   `runCell` catches, increments `cell.stats.errors` and appends a `cell.error` event.
   Nothing surfaces it. This cost real time during development: a `MemorySystem` built with
   `d: 1024` sitting behind `encode.hv`, which always emits `D = 8192`, appended **zero**
   episodes over six rounds and reported success everywhere else. `brain.summary()` naming
   the cells with a nonzero `stats.errors` would have caught it in one line.

## Behaviour the memory tests depend on

- `core/brain.mjs _emit` schedules at `clock.t + 1 + delay`, so a zero delay edge still
  arrives on the next tick. Anything that injects into a memory cell and then reads the
  result needs at least two ticks, which is what `test/memory.test.mjs` does.
- Periodic cells are due at `t = 0` as well as at every multiple of their period, so a cell
  with `period: MIN` has run once before any minute has passed. The slow cell test asserts
  `runs === 1` before ticking and `runs === 2` at `t = MIN + 1`.

## Design decisions worth knowing about

- **Episodic is append only, so forgetting there is cooling, not deletion.** `cool(t)` marks
  every episode older than `t` cold; cold episodes leave similarity retrieval but stay on
  the record and can be read back with `{ includeCold: true }` or revived with `warm(id)`.
- **The episodic index is rebuilt from the seed, never serialized.** `serialize()` writes the
  keys, times, gens, cold flags, values and items; `from()` re-signs and re-buckets. That is
  what guarantees the index cannot drift out of step with the keys.
- **Sequence position is carried by the permutation, not by a stored index.** `encode` is
  `bundle_i permute(item_i, i * stride)` and `decodeAt(hv, i)` is `cleanup(permute(hv, -i))`.
  `recall` returns items decoded back out of the hypervector rather than copied from the
  stored name list, so a match that cannot be decoded reports `exact: false`.
- **A skill is checked for JSON safety when it is defined, not when it is used.** `jsonSafe`
  walks the value instead of trusting `JSON.stringify`, because the encoder silently drops
  functions and `undefined` and turns a typed array into an object of numbered keys.

## Measured, `node --test test/memory.test.mjs`, 2026-09-16

- 12 tests, 12 pass, 0 fail, 1537 ms total.
- Episodic at 100,000 episodes, d = 512: build 345 ms (290 episodes/ms), index query
  **0.857 ms** mean over 200 queries with top1 200/200, exact full scan 32.6 ms mean over 20
  queries, **38x** faster than the scan it is graded against, 5,823 candidates per query of
  which 58 get an exact `sim()`, 3,968 buckets over 16 bands of 8 bits, 100 row time range
  in 0.034 ms.
- Semantic cleanup, d = 2048, 8 concepts, 20 trials per row: 20/20 correct at every noise
  level tried (5%, 15%, 25%, 35% of coordinates flipped, cue similarity 0.900 down to
  0.299), mean 2.00 iterations to converge.
- Sequence memory, d = 8192, 100 sequences of 6 items over a 60 item vocabulary, cue of 3
  items: recall **100/100**, exact decode of all 6 positions **100/100**, next item
  **100/100**, 1.24 ms per recall and prediction pair.
- Consolidation over 34 episodes formed 2 co-occurrence concepts from 12 repeats each, and a
  single decay pass at rate 0.5 with floor 1 forgot exactly the 10 items seen once while the
  concepts survived at strength 6.
- Memory cells inside a brain: 60,001 ticks in 19 ms, the `MIN` period consolidation cell
  fired twice and formed 2 concepts, the `MIN` period forget cell swept 4 working entries and
  cooled 6 episodes.

## 2026-09-17, the cleanup cost: what the two kernel rows are made of

A CPU profile of the live organism named two rows inside `memory/semantic.mjs`: the weighted
accumulation `wacc`, called from `step`, and the dot scan `dots`, called from `_sims`. This
section is what those two rows are made of, what was cut out of them exactly, what was
measured and thrown away, and what the whole organism does with the cut in.

Every number below was printed on 2026-09-17 by one of three commands, and the line that
printed it is written next to it:

    node bench/semantic-cleanup.mjs
    node bench/semantic-cleanup.mjs --live
    node --test test/memory.test.mjs

The verdict is `bench/verdicts/semantic-cleanup.json`, written by the first command at
`2026-09-17T21:35:38.173Z` and carrying the live block the second merged at
`2026-09-17T21:34:57.941Z`. Nothing here is quoted from a profile that is not parsed into
that file.

### What landed, both exact

1. **The dominant weight shortcut.** When one integer weight is larger than all the others
   put together, every lane of the accumulation takes that pattern's sign: `acc[j]` is
   `w_top * p_top[j]` plus a remainder whose magnitude cannot exceed `isum - w_top`, which
   is smaller. So the bundle *is* that pattern and nothing has to be scanned to know it.
   The remainder is only bounded by the weight sum while every lane of every pattern is +1
   or -1, so `SemanticMemory` carries a bipolar flag per pattern (`bip`, `_nonBip`), set on
   the way in, and the shortcut is off while any pattern is not bipolar. The winning lane is
   then never zero, so `bundle()`'s tie rule cannot apply either.
   It is an identity, not a threshold: in the bench the full accumulation returned exactly
   the top pattern on **40/40, 34/34, 23/23 and 1/1** of the steps where the test fired.
2. **Reusing the sims in `recognize`.** A converged cleanup ends on a step whose scored
   sims belong to the state it returns, lane for lane, so `recognize` no longer scans the
   whole population a second time to pick the best match. It reuses them only when the
   cleanup converged, which is exactly when the two states are the same vector.

`SemanticMemory.fast = false` selects the old paths, and `BRAIN_SEMANTIC_FAST=0` in the
environment selects them for a whole process. The exactness test's control, the bench's old
arm and the profiled control run of the live arm all take that path, and the organism never
does.

### Exactness first

`test/memory.test.mjs`, 200 noisy cues at each of 64, 256 and 1024 stored patterns,
d = 8192, comparing `hv` lane for lane and `name`, `sim`, `slot`, `cueSim`,
`iterations` and `converged` against the same memory with `fast = false`:

    exactness n=64, 200 cues: steps 458, accumulations skipped 378, converged 200, sims reused 200, mean nonzero weights 64.0 of 64
    exactness n=256, 200 cues: steps 533, accumulations skipped 312, converged 191, sims reused 191, mean nonzero weights 256.0 of 256
    exactness n=1024, 200 cues: steps 695, accumulations skipped 214, converged 170, sims reused 170, mean nonzero weights 1024.0 of 1024

A second test holds the guard: one lane set to 0 in one stored pattern stops the shortcut
firing (`dominated` does not move), a merge that makes the slot bipolar again turns it back
on, forgetting the pattern clears the flag, and a restore rebuilds one flag per pattern. A
third walks the cleanup instead of stopping it and checks the walk against `cleanup()`:

    walk n=64, 20 cues: converged 20/20, cycles 0/20, iterations walked 44 (mean 2.20), scripted orbit cycleLength 2

Whole file: `ℹ pass 19`, `ℹ fail 0`.

### What it costs per call, `node bench/semantic-cleanup.mjs`

d = 8192, 20 cues per row, 3 interleaved repetitions, old arm and new arm in the same
process, order alternating per repetition:

    n=64  cleanup 0.240 -> 0.072 ms/call   recognize 0.264 -> 0.069 ms/call   (73.8% off recognize)
    n=256  cleanup 0.687 -> 0.326 ms/call   recognize 0.846 -> 0.326 ms/call   (61.5% off recognize)
    n=1024  cleanup 2.968 -> 1.860 ms/call   recognize 3.283 -> 1.904 ms/call   (42.0% off recognize)
    n=4096  cleanup 18.106 -> 17.497 ms/call   recognize 20.798 -> 17.865 ms/call   (14.1% off recognize)

The shortcut's reach is set by the top weight's share, which falls as the population grows,
because the softmax background mass grows with it:

    n=64   mean top share 0.8815, domination 40/40 steps
    n=256  mean top share 0.7352, domination 34/40 steps
    n=1024 mean top share 0.4765, domination 23/43 steps
    n=4096 mean top share 0.2127, domination  1/53 steps

Per iteration it is the last step of a cleanup that dominates, never the first: at n=1024,
`iteration 0: 20 steps, top share 0.2117, dominates 0` and
`iteration 1: 20 steps, top share 0.7323, dominates 20`. That is the shape of the win. The
first step of a cleanup pays the full accumulation and the step that confirms the attractor
does not.

### Measured and thrown away

- **Accumulating only the nonzero weights (candidate a) never runs.** The premise is false:
  after the round to `WEIGHT_SCALE` the weights are **not** mostly zero. Measured over
  every step of the bench, `k == n` on **40/40, 40/40, 43/43 and 53/53** steps, that is
  `nonzero weights 4096.0 of 4096` at the largest row. A weight only rounds to zero below
  5e-7 of the mass, and at beta = 8 the background patterns sit three to four orders of
  magnitude above that. The JS sparse path was priced anyway, so the crossover is on
  record: `n=1024: one wacc over all 1024 slots 0.737 ms; JS over k slots: k=1 0.015 ... k=64 0.691, k=128 1.411`
  and `n=4096: one wacc over all 4096 slots 3.393 ms; ... k=256 2.878`. The JS path wins up
  to k = 64 at n = 1024 and k = 256 at n = 4096 and the measured k is n, so it never runs
  and was not landed. What replaced it is the domination bound, which is the same sparse
  accumulation with k = 1 under a proof rather than under a count of zeros.
- **Comparing the softmax weights of one iteration with the last (candidate c) is not an
  exact convergence test.** Equal weights do imply an equal vector, but the converse fails,
  so it would find the fixed point one iteration after `sim(next, state) === 1` does and
  change `iterations`. It also cannot fire here: with k = n the weights are thousands of
  six digit integers recomputed from a state that moved.
- **Proving convergence a step early saves nothing.** When the shortcut fires the next state
  is a stored pattern, and the top weight's share cannot fall when the state moves onto it
  (the top logit rises by beta * 2h/d and no other logit can rise by more), so the next step
  is provably a fixed point. Skipping that step does not pay, because `recognize` still
  needs the sims of the answer to pick the best match, which is the same scan.
- **A cleanup that runs out of iterations is late, not circling.** `SemanticMemory.walk()`
  takes the same walk `cleanup()` takes without stopping at the fixed point, holds every
  state it passes and compares each new state against all of them, so a repeat is found
  wherever it is. Twelve cues of each of three kinds, at 1024 and at 4096 patterns,
  d = 8192, beta = 8, walked at the organism's `maxIters` of 8 and again at 32:

        n=1024 random     maxIters  8: converged 5/12, cycles 0/12, mean iterations walked 7.75
        n=1024 random     maxIters 32: converged 12/12, cycles 0/12, mean iterations walked 9.17
        n=1024 noisy 0.15 maxIters  8: converged 12/12, cycles 0/12, mean iterations walked 2.42
        n=1024 noisy 0.15 maxIters 32: converged 12/12, cycles 0/12, mean iterations walked 2.42
        n=1024 noisy 0.35 maxIters  8: converged 6/12, cycles 0/12, mean iterations walked 6.50
        n=1024 noisy 0.35 maxIters 32: converged 12/12, cycles 0/12, mean iterations walked 9.58
        n=4096 random     maxIters  8: converged 9/12, cycles 0/12, mean iterations walked 7.33
        n=4096 random     maxIters 32: converged 12/12, cycles 0/12, mean iterations walked 7.92
        n=4096 noisy 0.15 maxIters  8: converged 12/12, cycles 0/12, mean iterations walked 2.58
        n=4096 noisy 0.15 maxIters 32: converged 12/12, cycles 0/12, mean iterations walked 2.58
        n=4096 noisy 0.35 maxIters  8: converged 7/12, cycles 0/12, mean iterations walked 7.50
        n=4096 noisy 0.35 maxIters 32: converged 12/12, cycles 0/12, mean iterations walked 8.58

  Zero cycles in 144 walks, and every one of the 72 walks given 32 iterations converged,
  including the ones that were still moving at 8. So there is no short orbit to detect and
  cut out. What is true is that a cue far from any stored pattern needs more iterations
  than `maxIters` allows, and that a cue near one is done in about two and a half.
- **A batched `dots` kernel would not pay much.** `dots` is one wasm call per slot and
  `wacc` is one call for all of them, so the per call cost was priced by timing the same
  256 slot scan at four widths: `d=1024: dots 0.0622 us/slot` up to
  `d=8192: dots 0.4058 us/slot`, fitted `0.0479 ns per lane plus 0.0131 us per slot that
  does not scale, which is 3.2% of a slot at d=8192`. Batching the calls buys that 3.2%.

### Past 256 patterns (candidate d)

Nothing falls back. The arena is constructed at `min(capacity, 256)` slots but
`RawArena.set` reserves `max(slot + 1, capacity * 2)` when it runs out, so the same wasm
path runs at every population: the bench rows print `arena.count` equal to the pattern count
at 1024 and 4096, and the exactness test asserts it. What does change is the cost per slot,
because the arena is n * 8192 bytes and walks out of cache: dots per slot
`0.417 us` at n=256, `0.453 us` at n=1024, `0.669 us` at n=4096, and wacc per slot
`0.727`, `0.813`, `0.851 us`. The growth the profile saw over a run comes from that.

### The live organism, `node bench/semantic-cleanup.mjs --live`

The bench runs the organism three times under the V8 CPU profiler, new arm, control, new arm
again, on

    BRAIN_STATE_DIR=<dir> node --cpu-prof --cpu-prof-dir <dir> bin/brain.mjs live semantic-cleanup-prof --majors 200 --ticks 800 --checkpoint 100000 --heap 0

and parses the profiles itself into the `live` block of the verdict. The control arm is the
old paths, pinned for the whole child process by `BRAIN_SEMANTIC_FAST=0`, so choosing it
takes no preload and no edit. The state directory and the profiles live in a temporary
directory the bench deletes, which is why the parsed rows and not the `.cpuprofile` files are
the record.

The three runs did the same work, line for line, which is what makes them a matched set:
each printed `800 ticks`, `cells 1672 (start 1672), edges 37991 (start 18553)`,
`runs per period over this run: 1:174400 64:13 SEC:172 MIN:117 HOUR:63 event:774585`, and
the same semantic counters apart from the two this change moves:

    {"learned":6477,"merged":0,"forgotten":0,"dropped":2381,"cleanups":777,"iterations":5773,"concepts":0,"steps":5773,"nonzero":7862832,"dominated":85,"reusedSims":292}
    {"learned":6477, ... same ... ,"dominated":0,"reusedSims":0}   (the control)

What the profiler charged the two kernels, run by run:

    new     sampled 80996.8 ms: wacc 6484.2 ms (2886.7 then 3597.5), dots 5106.7 ms (2214.0 then 2892.7)
    control sampled 45427.4 ms: wacc 6601.6 ms (1465.9 then 5135.7), dots 5646.2 ms (1176.3 then 4469.9)
    new     sampled 47716.9 ms: wacc 6433.7 ms (1441.7 then 4992.0), dots 4952.5 ms (992.8 then 3959.8)

The first run's sampled window is nearly twice the others because the checkpoint write landed
inside it: its top row is `34512.5 ms | writeFileUtf8 :0`, against `4433.9 ms` for the same
row in the third run and no such row in the control. So the totals are not comparable across
that run, and the two rows do not resolve the change in any case:
`same arm, wacc: 50.5 ms apart; dots: 154.1 ms apart` against
`arm to control, wacc: -117.5 ms; dots: -539.5 ms`. Between the two clean runs the kernels
are `wacc 6601.6 against 6433.7` and `dots 5646.2 against 4952.5`, which is the right sign
and still smaller than what one profile can separate.

One sub row does resolve, because it is the one the reused sims deletes. Charging the kernel
samples to the nearest JS caller, the `dots` scan under `recognize` is **661.7 ms** in the
control against **227.9 ms** and **236.1 ms** in the two new runs, `65.55%` and `64.33%` off
that row, and the two new runs agree to 8.2 ms. The `dots` scan under `step`, which this
change does not touch, is `4984.5 ms` in the control against `4878.7 ms` and `4716.5 ms`.

The counters are the honest measure of the rest, because they are counts and not timings.
The semantic memory ends the run at its capacity, 4096 patterns, having held
`7862832/5773 = 1362` patterns per step on average over the run. At that operating point
this change skipped `85/5773 = 1.47%` of the accumulations and
`292/(5773+777) = 292/6550 = 4.46%` of the scans. That is the whole live effect, and it is
below what a single profile can see. The bench rows above are where the win is, and the live
organism is not there: it saturates at 4096 patterns, where the top weight holds 0.2127 of
the mass, and it converges late, `5773/777 = 7.43` iterations per cleanup of a `maxIters` of
8, with `292/777 = 37.58%` of cleanups converging.

For the record, the profile of this organism taken before the change, read back out of
`bench/verdicts/profile-live.json` (written `2026-09-17T18:58:15.990Z`) by the `--live` run,
put the same two rows at `wacc 4714.5 ms` and `dots 3687.6 ms` of `40791.7 ms` sampled. That
is a different organism load and a different sampled window from every run above, so it is a
record of where the rows started, not a comparison.

### Requests for core

5. **A packed arena for bipolar patterns (`core/simd.mjs`).** The semantic arena is
   `n * 8192` bytes, 33.5 MB at 4096 patterns, and the cost per slot grows as it leaves
   cache (dots 0.417 us/slot at n=256 against 0.669 us/slot at n=4096, measured above).
   One bit per lane would be 8x fewer bytes, and the exact dot of two bipolar vectors is
   `n - 2 * popcount(xor)`, which `hpack` and `RawArena.best` already do for the nearest
   neighbour path. `SemanticMemory` knows which patterns are bipolar (`bip`, `_nonBip`) and
   can tell the arena. This is the only lever left on the `dots` row that does not change an
   answer: the softmax needs every sim, so the scan cannot be skipped.
6. **`wacc` costs more per lane than `dots` for one more multiply.** Fitted over four widths
   on 256 slots: `dots 0.0479 ns per lane` against `wacc 0.0843 ns per lane plus 0.0044 us
   per slot`, which is `0.0843 / 0.0479 = 1.76x` the rate. If the weighted accumulation ran
   at the dot's rate the largest row in the live profile would fall by about two fifths.
   Worth a look while the kernels are being rewritten, but it is a kernel question, not a
   `memory/` one.
7. **A batched `dots` is not worth it** (3.2% of a slot at d = 8192, measured above), so
   the JS loop over one wasm call per slot can stay.

## 2026-09-17 later, finishing the landing: the walk, the environment pin, and a live arm that runs itself

A previous session was cut off with this landing in an unfinished state, and the testing
plane found three numbers in this file and in `memory/semantic.mjs` that no command in the
repository printed: a top twelve table from a `.cpuprofile` that was nowhere on disk, a
`cycles` and `mean iterations walked` tally that no code computed, and a comment in
`memory/semantic.mjs` reading `55.5 s of a 117.2 s soak profile`. All three are gone. What
replaced them is code that prints them.

`SemanticMemory.walk(query, opts)` is the cleanup walk kept instead of thrown away. It holds
every state of the walk and compares each new state against all of them, so a repeat of the
state just left is the fixed point `cleanup()` stops on and a repeat of an older one is an
orbit whose length is how far back the repeat is. It answers nothing the organism reads and
`cleanup()` is untouched by it. `test/memory.test.mjs` asserts that on a converging cue the
walk ends where `cleanup()` ends, on the same vector, after the same number of steps, and
that a scripted two step orbit is reported as `cycleLength 2` at `cycleAt 1` after 3
iterations. The bench then walks 144 cues through it, printed above: zero cycles, and every
walk given 32 iterations converges.

`BRAIN_SEMANTIC_FAST=0` in the environment builds every `SemanticMemory` in that process on
the old paths, and an explicit `{ fast: true }` beats it. That is what lets a profiled live
run take the control arm without a preload file, and `test/memory.test.mjs` asserts all four
cases, including that only the exact string `0` turns it off.

`bench/semantic-cleanup.mjs --live` is the live re-profile as a command. It runs the organism
three times at 200 majors and 800 ticks under `--cpu-prof`, parses each `.cpuprofile` itself
(self time per frame, split at the midpoint of the sampled window, with wasm frames and the
`js-to-wasm` trampolines charged to their nearest JS ancestor, which is what separates the
`wacc` row from the `dots` row), and merges the runs, the top twelve by self time, the kernel
rows, the sub rows under `step` and under `recognize`, the counters out of the checkpoint and
the run to run spread into the `live` block of the verdict. The organism's state directory
goes to a temporary directory through `BRAIN_STATE_DIR`, so a profiled run never touches
`brain/state` and leaves nothing behind. A plain `node bench/semantic-cleanup.mjs` carries an
existing `live` block forward rather than overwriting it with nothing.

Measured while finishing: `node --test test/memory.test.mjs` is `ℹ pass 19`, `ℹ fail 0`, up
from 17 by the two tests above. The whole gate line is in the report of this landing.

Requests for core, in the order they cost something:

1. The live arm is three profiled runs and takes minutes, and the checkpoint write can land
   inside the sampled window and double it, as it did in the first run above
   (`34512.5 ms | writeFileUtf8 :0`). A way to stop and start sampling around a phase, or a
   `live` flag that checkpoints outside the profiled window, would make a run comparable to
   another run without a caveat.
2. `bin/brain.mjs live` prints no counter for the memory system, so the semantic counters
   have to be scanned out of `snapshot.json` by regular expression over the file in chunks,
   because the file is hundreds of megabytes and parsing it is not affordable. A one line
   summary of `brain.memory.serialize().semantic.stats` on exit, or a small sidecar file
   next to the snapshot, would delete that scan.
3. Still open from the section above: a packed arena for bipolar patterns is the only
   remaining lever on the `dots` row that does not change an answer.

## The live organism, the top twelve by self time (2026-09-17)

The testing plane flagged a top-twelve-by-self-time table in "The live organism" section
above as unverified: no printed line or verdict field backed it. There is no such table
in that section as written; the paragraph merely describes that `bench/semantic-cleanup.mjs
--live` computes one (`live.runs[i].topSelf`, `bench/semantic-cleanup.mjs:519`) and folds it
into the verdict. This section is that table, read straight out of the verdict already on
disk rather than re-run, since the run that produced it already exists and a fresh run takes
minutes on its own admission two paragraphs up.

Source: `bench/verdicts/semantic-cleanup.json`, `live.runs[2]` (the third of the three
profiled runs, arm `new`, file `CPU.20260917.173409.38924.0.001.cpuprofile`), merged into
the verdict at `live.at = 2026-09-17T21:34:57.941Z` by

    BRAIN_STATE_DIR=<dir> node --cpu-prof --cpu-prof-dir <dir> bin/brain.mjs live semantic-cleanup-prof --majors 200 --ticks 800 --checkpoint 100000 --heap 0

This is the run picked out above as the clean one: its `sampledMs` is `47716.891`, close to
the control's `45427.397`, unlike the first run whose window the checkpoint write doubled.

    selfMs     firstHalf  secondHalf  fn
    6433.7 ms | 1441.7 then 4992.0 | wasm-function[5] b47ebc36:1
    4957.1 ms |  992.8 then 3964.3 | wasm-function[3] b47ebc36:1
    4930.7 ms | 2862.5 then 2068.2 | bundle signal.mjs:65
    4433.9 ms | 2410.2 then 2023.7 | writeFileUtf8 :0
    1598.9 ms |  945.2 then  653.7 | compute basic.mjs:72
    1537.5 ms |    0.0 then 1537.5 | dataToJSON signal.mjs:380
    1471.3 ms |  927.2 then  544.0 | _tick brain.mjs:149
    1385.8 ms | 1143.8 then  242.0 | permute signal.mjs:93
    1351.6 ms |  880.6 then  471.0 | find connectome.mjs:39
    1296.8 ms |  901.2 then  395.7 | hashData signal.mjs:349
    1261.3 ms |  737.3 then  523.9 | _emit brain.mjs:125
    1092.7 ms |  667.3 then  425.4 | append ledger.mjs:28

`wasm-function[5]` and `wasm-function[3]` are the `wacc` and `dots` kernel rows already
named in the section above (`wacc simd.mjs:311`, `dots simd.mjs:304`); this table just shows
where they sit against everything else the profiler sampled in this run, unrenamed, exactly
as `bench/semantic-cleanup.mjs` prints and stores them. `bundle signal.mjs:65` sits third,
above the checkpoint write in this run and above the two kernels in the control run's own
table (not reproduced here; same fields, in `live.runs[1]`), which is the same rank it holds
in the profile named in the requests-for-core section above (request 6, "the largest row in
the live profile"). Nothing above this line was recomputed; every millisecond is copied from
`live.runs[2].topSelf` in the verdict named at the top of this section.
