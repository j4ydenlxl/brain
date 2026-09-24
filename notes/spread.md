# notes/spread.md: the spread item (Board 14)

His order of 2026-09-24: "Self improving to the magnitude of yourself is the top priority it should be better or as good as u at self improving and can be able to spread this in billions of years compressed simulated magnitude".

This note is the builder's record (author "board 14 builder"): what was built, what the bar measured and by which command, and what is still open. The model is OFF for this item: 0 model calls, no network.

## The result, in one paragraph

The bar ran once, to completion, and is **not met**. It printed a null with its noise.
- **Held-out score:** ON 0.668053 against OFF 0.653430 on the same 5 seeds and the same generations. The difference is 0.014623; the seed-to-seed noise is 0.014646.
- **Reach:** every kept improvement reached all 3 instances within k = 1 generation: 1170 of 1170.
- **Promotion:** no candidate was promoted. Of 596 survivors (185 distinct), none beat the range noise when confirmed on the file's own OPTIONS.
- **Scale:** the run simulated 8,242,800 organism-years at 27498.0 per trial-wall second. At that rate, 1,000,000,000 organism-years is a projection of 36,366 s (10.1 h). It is a projection, not a measurement.

## Files

Written by this item (author "board 14 builder"):
- generations/spread.mjs (new): the spread population, the promotion writer
- generations/operators-gene.mjs (new): the operator genes as a genome field
- bench/spread.mjs (new): the bar
- test/spread.test.mjs (new): 6 tests
- this note
- bench/verdicts/spread.json and bench/verdicts/spread-control.json, written by the bench
- state/self/spread-promoted.jsonl, appended by the bench on every promotion

Edited:
- **simulate/clone.mjs:** only the operator genes. When a brain carries `operatorGenes`, or an `organismGenome` whose `meta.operators` is set, the clone carries a deep, frozen copy as `clone.operatorGenes`. It does not carry the genome itself.
- **daemon/multiply.mjs:** only the propagation of a kept improvement across instances. It adds `POPULATION_SIZE = 3` (N), `populationIds(n)` and `spreadConduits(ids)`: a ring wired both ways, with each edge listed once and no edge when N is 1. The population CLI's default size now reads POPULATION_SIZE. test/multiply.test.mjs passes 9 of 9 and test/simulate.test.mjs passes 21 of 21 after the edits.

## Design

The real tree improves itself through self/improve.mjs, one round at a time on the wall clock. This item runs the same kind of round on the simulated clock, where a round costs milliseconds, and spreads what one organism learns to the others.

**The gap.** The organisms improve the velocity library search: generations/velocity.mjs MatrixElites on the K = 4 draw grid suite of daemon/multiply.mjs. It is scored by the objective velocity.mjs already uses.
- The knobs are the numeric fields of `OPTIONS` in generations/spread.mjs, read the way self/knobs.mjs reads any knob, with the same band of 0.7x to 1.5x.
- The strategies are `STRATEGIES`, selected by `STRATEGY`, in the shape self/operators.mjs strategySwap reads.

So a knob moved in simulation is a real knob of a real file, and a promoted move is a line the real improve loop can try.

**An organism** is one cell of kind `spread.instance` in a population Brain (core/brain.mjs). It holds its config of the gap, its operator genes and its operator cursor. N is POPULATION_SIZE from daemon/multiply.mjs.

**A generation.** Every organism spends its trial budget (a gene) on its operators, in the order its genes name.
- Each trial runs on a clone of its own cell (simulate/clone.mjs cloneSub).
- The candidate config and the current config (the matched control) each run one burst per seed, on the SAME engine seeds.
- A move is kept only when the mean paired gain beats the noise. The noise is read off those seeds by the organism's noise rule, and it is never looser than one seed-to-seed standard deviation, with a floor of one task.
- Then the population Brain ticks once. One generation is one tick of the simulated clock.
- The author operator needs the model, so it is skipped with a printed "model off".

**Spread ON.**
- A kept move leaves its organism on the `out` port and travels the connectome's own conduits (spreadConduits, wired as Brain edges).
- Every organism that receives a move applies it and forwards it once.
- The archive records the tick at which each organism received each move.
- k is the number of ticks a move needs to reach every organism. It is read off the connectome by a shortest-path walk over the active edges, weighted 1 + delay.
- The message also carries the sender's genes and their measured rate. A receiver adopts genes whose rate beats its own at its next window: selection over HOW to improve, not only over what.

**Spread OFF** (the control) has no conduits, no adoption, no promotion and writes no file. Every organism runs exactly as it would alone, and test/spread.test.mjs holds it to that.

**Operator genes** (generations/operators-gene.mjs) are `{v, order, step, noise: {rule, seeds}, budget}`:
- `order`: the operator order;
- `step`: the knob step, 0.05 to 0.3;
- `noise.rule`: the noise rule, one of range, sd or sd2;
- `noise.seeds`: the trial seeds, 2 to 4;
- `budget`: the trials per generation, 1 to 12.

They live on an organism genome as `meta.operators` and survive the genome's clone and its JSON round trip. Every `window` generations, an organism reads a fixed yardstick and rates its genes by the yardstick gain per organism-year. A (1+1) keeps a mutated genes object only when it rated no worse than its parent's window.

**Promotion.**
- A kept move that every organism still holds S generations later is a survivor.
- A survivor is confirmed on the file's own OPTIONS: base against base plus the move, on `promoteSeeds` fixed seeds, under the registry's range rule.
- Only a confirmed survivor is promoted to state/self/gaps.jsonl, as kind "promoted from simulation". The line carries the simulated before and after, a trial command (`node bench/spread.mjs --trial`, which prints `metric <n>`), and author "organism (<operator>)".
- The write goes through self/gaps.mjs writeLedger, which keeps the previous ledger as gaps-<date>.jsonl. Every promotion is also appended to state/self/spread-promoted.jsonl.

**Organism-years** follow the one declaration in generations/years.mjs: one organism-year is one generation of a whole engine population. Yardstick bursts count as years. Held-out and promotion bursts are measurement and are counted apart.

**The 300 s.** The bar reads "a 300 s run on 5 seeds" as the whole run's trial wall: 5 seeds x 2 arms x 30 s.
- The ON arm runs 30 s and stops at a generation count G.
- The OFF arm runs exactly G generations on the same seed, so the control is matched in generations, not in wall.
- Both arms then drain k ticks with no trials, so a move kept on the last generation is not counted as unreached.
- The held-out score is the mean over organisms of the fresh objective (5 fresh draws, 800 tasks) on 3 fixed held-out seeds.
- The noise is the larger sample standard deviation of the two arms over the 5 seeds.

## The bar

Command, under the budget:

```
node tools/budget.mjs --ram-mb 6000 --disk-mb 64 --dir <scratch>/spread14 --record <scratch>/spread14/budget-bar.json -- node --max-old-space-size=6000 bench/spread.mjs --cache <scratch>/spread14/mx
```

The run ended with exit 0 after a wall of 301.70 s. Peak RAM was 289.3 MB, peak disk 2.4 MB, and there was one process. The verdict is bench/verdicts/spread.json and the control arm is bench/verdicts/spread-control.json. Both have isTheBar true and barMet false, and both were written once, when the run completed.

The printed lines, verbatim:

```
[spread] spread/bar/1: ON 225 generations in 30.1 s, 792,800 organism-years, 4701 trials, 353 kept, 3 genes adopted; OFF 225 generations in 31.1 s, 4315 trials, 164 kept
[spread]   held-out: ON 0.662293, OFF 0.651296 (diff 0.010997); along the run g-1 0.5274/0.5274, g55 0.6718/0.6436, g112 0.6588/0.6511, g168 0.6302/0.6467, g224 0.6623/0.6513
[spread] spread/bar/2: ON 267 generations in 30.1 s, 808,080 organism-years, 4809 trials, 223 kept, 2 genes adopted; OFF 267 generations in 35.3 s, 4841 trials, 188 kept
[spread]   held-out: ON 0.685166, OFF 0.662247 (diff 0.022919); along the run g-1 0.5274/0.5274, g66 0.6757/0.6302, g133 0.6901/0.6461, g199 0.6688/0.6399, g266 0.6775/0.6622
[spread] spread/bar/3: ON 249 generations in 30.1 s, 830,640 organism-years, 4885 trials, 228 kept, 2 genes adopted; OFF 249 generations in 27.8 s, 4435 trials, 212 kept
[spread]   held-out: ON 0.665420, OFF 0.650866 (diff 0.014554); along the run g-1 0.5274/0.5274, g61 0.6659/0.6543, g124 0.6830/0.6596, g186 0.6830/0.6295, g248 0.6654/0.6509
[spread] spread/bar/4: ON 258 generations in 30.1 s, 820,640 organism-years, 4642 trials, 183 kept, 4 genes adopted; OFF 258 generations in 29.2 s, 4868 trials, 220 kept
[spread]   held-out: ON 0.679298, OFF 0.643164 (diff 0.036134); along the run g-1 0.5274/0.5274, g64 0.6537/0.6443, g128 0.6699/0.6445, g193 0.6839/0.6658, g257 0.6793/0.6432
[spread] spread/bar/5: ON 222 generations in 30.0 s, 829,200 organism-years, 4834 trials, 183 kept, 4 genes adopted; OFF 222 generations in 25.9 s, 3782 trials, 242 kept
[spread]   held-out: ON 0.648089, OFF 0.659578 (diff -0.011489); along the run g-1 0.5274/0.5274, g55 0.6660/0.6615, g110 0.6781/0.6388, g166 0.6554/0.6672, g221 0.6481/0.6596
[spread] survivors: 596 kept moves still held by every instance 16 generations later; 185 distinct confirmed on the file OPTIONS (base 0.574062), 0 beat the range noise
[spread] promotion: 0 written, no confirmed survivor
[spread] organism-years simulated: 8,242,800 generations x 1 organism-year per generation (declared: one generation = the whole population of 32 children = 32 evaluations) = 8,242,800 organism-years (263,769,600 evaluations)
[spread] generations per second: 27498.0 engine generations (organism-years) per trial wall second; 8.15 population generations per second (2,442 generations, both arms, in 299.8 s)
[spread] projection: 1,000,000,000 organism-years / 27,498.0 generations per wall second (measured: 8,242,800 generations in 299.760 s) = 36,366 s (10.1 h), a projection, not a measurement
[spread] improvements kept: ON 1170, OFF 1026 (286.67 kept per million ON organism-years)
[spread] reach: 1170 of 1170 kept improvements reached all 3 instances; 1170 within k = 1 generations; the latest reached them all 1 generation(s) after it was kept
[spread] held-out (grid/velocity:heldout + fresh1..4): ON 0.662293 0.685166 0.665420 0.679298 0.648089 | OFF 0.651296 0.662247 0.650866 0.643164 0.659578
[spread] held-out mean ON 0.668053 vs OFF 0.653430: diff 0.014623, seed-to-seed noise 0.014646 (sd ON 0.014646, sd OFF 0.007617; paired sd 0.017511)
[spread] promoted: 0 candidate(s)
[spread] bar: ON beats OFF by more than the noise false, every kept improvement reached all within k true, at least one promoted false -> barMet false
```

Each seed also printed a reach line. On every seed, every kept move reached all 3 instances within k = 1. The first reach on seed 1 was `i1#1 kept g0 all by g1`.

For the rows item: 27498.0 generations per second, and 286.67 improvements kept per million organism-years. The verdict carries both as `generationsPerSecond` and `keptPerMillionOrganismYears`.

## Reading the null

**Held-out.** ON finishes 0.014623 above OFF, and the noise is 0.014646. The bar asks for more than the noise, and the run falls short of that by 0.000023. It is a null, and this note does not call it a win. ON is higher on 4 of the 5 seeds; seed 5 goes the other way, -0.011489.

**Along the run.** The "along the run" marks point to where the signal may be. The following was computed after the run from the marks in the verdict file. It is post hoc, not the bar. It was printed by a `node -e` over bench/verdicts/spread.json, and the noise is the larger sample sd of the two arms at that mark:

```
post hoc mark f=0.25: ON mean 0.666637 OFF mean 0.646766 diff 0.019870 noise max(sd) 0.011870, ON higher on 5 of 5 seeds
post hoc mark f=0.5: ON mean 0.675988 OFF mean 0.648009 diff 0.027979 noise max(sd) 0.012076, ON higher on 5 of 5 seeds
post hoc mark f=0.75: ON mean 0.664268 OFF mean 0.649848 diff 0.014420 noise max(sd) 0.022330, ON higher on 3 of 5 seeds
post hoc mark f=1: ON mean 0.666524 OFF mean 0.653430 diff 0.013094 noise max(sd) 0.012680, ON higher on 4 of 5 seeds
```

(The f=1 mark is taken before the k-tick drain. The bar's end score is taken after it, which is why the two ON means differ.)

The reading, as a hypothesis only:
- Spread ON climbs faster. It is ahead on every seed at the quarter and half marks.
- It then gives some of that back on the held-out tasks. On seed 1 it went from 0.6718 at g55 to 0.6302 at g168.
- OFF keeps climbing. By the end, the gap is inside the noise.

That fits spread copying moves that fit the 640 searched tasks faster than they generalise to the 800 held-out ones. Four marks were looked at after the fact, so the midpoint lead is not a result. The next bar should name its stopping point in advance, and should choose it on a validation split that is not the held-out one (see Open).

**Promotion.** 0 promoted. Every kept move was judged against the organism's own evolved config, which drifts toward the band corners; the probe saw lmax 48 and mutationRate 2.25. A move that helps there does not, on this evidence, help the file's own OPTIONS (base 0.574062) by more than the range noise on 4 seeds. None of 185 did. The promotion gate refused, as it should. So state/self/gaps.jsonl was not touched: its mtime is before the run, and state/self/spread-promoted.jsonl was not created.

## Tests

`node --test --test-timeout=120000 test/spread.test.mjs`: 6 tests, 6 pass, 0 fail, under 1 s. There is no model, no network and no write to the real tree. Every file a test writes is under a mkdtemp dir that is removed in `test.after`.

1. The operator genes round-trip through the organism genome (deep clone and JSON) and through simulate/clone.mjs cloneSub. They also survive the clone of a population cell.
2. A planted improvement reaches all instances within k on the 3-instance population, and k = 1 there. It also holds for N 5, 3 and 6 with delays 0, 2 and 1 (k 2, 3 and 6), where the farthest instance is exactly k away. With spread OFF, the same plant never leaves its instance.
3. The promotion line carries the required fields. `promote` goes through self/gaps.mjs writeLedger into a temp root: the old ledger is kept as gaps-<date>.jsonl and a second promote replaces rather than duplicates. When no writer is present, promote appends directly.
4. Spread OFF changes nothing a test can see:
   - no conduits, k null, no adoption, an empty outbox;
   - each instance equals a run of that instance alone;
   - promote with spread off leaves a planted tree byte-identical;
   - generation 0 with ON equals OFF.
5. A move is kept only when its gain beats its noise, and the same config against itself is a gain of exactly 0.
6. populationIds and spreadConduits.

**Mutants** (each printed its tally, and every file was restored and checked with cmp):
- With the first 5 tests, each of these made exactly one test fail (4 pass, 1 fail):
  - M1, the clone drops the genes;
  - M2, no forward;
  - M3, the receiver ignores the move;
  - M4, promote ignores spread off;
  - M5, OFF is wired;
  - M6, the wrong kind.
- M7 (a move is kept without beating the control) survived the first 5 tests. Test 5 was added for it, and M7 now makes one test fail (5 pass, 1 fail).

The other suites whose files this item edited still pass: test/multiply.test.mjs 9 of 9 and test/simulate.test.mjs 21 of 21.

## Open

- **The midpoint lead is a hypothesis, not a result.** A pre-registered bar should hold out a validation split apart from the held-out suite, stop each arm at its best validation generation, and score held-out once.
- **Promotion transfer.** No move kept on an evolved config transferred to the file's OPTIONS. Two changes would test transfer directly:
  - confirm a survivor on the population's consensus config rather than the base;
  - or keep the organisms' configs anchored to OPTIONS.
  Either would be a new bar, not this one widened.
- **The gaps ledger does not know the kind.** The self/gaps.mjs `KINDS` list does not include "promoted from simulation", so the gaps item's next rewrite of the ledger would drop a promoted line. That is why every promotion is also appended to state/self/spread-promoted.jsonl. The fix belongs to the gaps item's file, not this one.
- **Shared seeds.** `node bench/spread.mjs --trial` scores OPTIONS on the same promote seeds the confirmation used. An improve round on a promoted line would then be graded on the seeds that selected it. The seeds should be separated before any line is promoted.
- **Speed.** At 27498.0 generations per second on one process, a billion organism-years is a projected 10.1 h. It has not been run or measured. The item was capped at one bench process, and at most 2 workers were allowed.
