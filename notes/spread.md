# notes/spread.md: the spread item (Board 14)

His order of 2026-09-24: "Self improving to the magnitude of yourself is the top priority it should be better or as good as u at self improving and can be able to spread this in billions of years compressed simulated magnitude".

This note is the builder's record (author "board 14 builder"): what was built, what the bar measured and by which command, and what is still open. The model is OFF for this item: 0 model calls, no network.

## Board 20 (author "board 20 builder"): the bar met, and the line on the site

Queue item 8, his words: "Its gotta be nanoseconds", "It also needs to evolve over billions of years in a bunch of seconds", "clock dilation, and I SHOULD BE ABLE TO TEST AND USE IT". The bar is bench/spread.mjs's own rule, unchanged: ON beats OFF on the held-out score by more than the seed-to-seed noise (the larger sample sd of the two arms, 5 seeds), every kept improvement reaches all N within k, and at least one candidate is promoted. The rule now lives in generations/spread.mjs spreadChecks so a test can hold it; the arithmetic is the same.

What the Windows verdict of 2026-09-24T20:34Z actually missed: its held-out gain 0.0156 was above its noise 0.014315 (onBeatsOffByMoreThanNoise true), and the bar failed on promotion (0 promoted, "no confirmed survivor"). Both halves were worked here.

### The bar, on this host (Linux, 4 CPUs, Node v24.9.0, other builders' processes on the same CPUs)

Command, under the budget, run once, detached (it wrote bench/verdicts/spread.json and spread-control.json, isTheBar true, barMet true, at 2026-09-26T22:52:42.051Z):

```
node tools/budget.mjs --ram-mb 4000 --disk-mb 2000 --dir <scratch>/bar --record <scratch>/budget-bar.json -- node --max-old-space-size=4000 bench/spread.mjs --cache <scratch>/mx --state-root <scratch>/bar-root/bar
```

Printed lines, verbatim:

```
[spread] held-out (grid/velocity:heldout + fresh1..4): ON 0.661906 0.691210 0.667149 0.684249 0.675692 | OFF 0.643602 0.639504 0.658826 0.647149 0.657827
[spread] held-out mean ON 0.676041 vs OFF 0.649382: diff 0.026660, seed-to-seed noise 0.012005 (sd ON 0.012005, sd OFF 0.008609; paired sd 0.017462)
[spread] reach: 834 of 834 kept improvements reached all 3 instances; 834 within k = 1 generations; the latest reached them all 1 generation(s) after it was kept
[spread] survivors: 339 kept moves still held by every instance 16 generations later; 271 distinct confirmed on the file OPTIONS (base 0.574062), 6 beat the range noise
[spread] promotion: 6 written, self/gaps.mjs writeLedger (6 lines), into <scratch>/bar-root/bar
[spread] organism-years per wall hour: 5,757,760 organism-years / 317.437 s (the whole run) x 3,600 s per hour = 65,297,897
[spread] bar: ON beats OFF by more than the noise true, every kept improvement reached all within k true, at least one promoted true -> barMet true
BUDGET done exit 0: wall 317.61 s, peak ram 323.7MB, peak dir 0.0MB, cpu 330.40 s, 159 samples
```

The first promoted line: `bins 6 -> 5, crossoverRate 0.15 -> 0.206533, directed 0.75 -> 0.99975, initLenMax 8 -> 9, lmax 32 -> 48, mutationRate 1.5 -> 2.18067, strategy -> unpruned, simulated before 0.574062, after 0.703136 (gain 0.129073, noise 0.084302)`. The promotions went to a scratch state root (`--state-root`), never this tree's state/, which is on this item's deny list; a run without the flag writes state/self/gaps.jsonl as before.

### The control of the change: the same command with the intervention off

`... bench/spread.mjs --cache <scratch>/mx --intervention off --state-root <scratch>/bar-root/ctl` (bench/verdicts/spread-intervention-off.json, isTheBar false), run right after the bar:

```
[spread] held-out mean ON 0.671807 vs OFF 0.653189: diff 0.018619, seed-to-seed noise 0.019099 (sd ON 0.019099, sd OFF 0.009197; paired sd 0.027686)
[spread] survivors: 391 kept moves still held by every instance 16 generations later; 118 distinct confirmed on the file OPTIONS (base 0.574062), 0 beat the range noise
[spread] bar: ON beats OFF by more than the noise false, every kept improvement reached all within k true, at least one promoted false -> barMet false (a partial run is never the bar)
```

The run-to-run noise first, from the two verdict files (runBand; the OFF arm is the same code in both runs, its generations differ with the wall):

```
held-out, n 5 seeds: G bar 156,168,162,185,208 | G control 152,168,154,173,189
OFF arm (the same code in both runs) run-to-run band 0.003807, per seed max 0.009984, sd 0.009197
ON arm: intervention on 0.676041 vs off 0.671807 (moved 0.004234), sd on 0.012005 vs off 0.019099
gain: intervention on 0.02666 (noise 0.012005, barMet true) vs off 0.018619 (noise 0.019099); promoted 6 vs 0
```

Reading it plainly: the ON mean moved by 0.004234, about the OFF arm's own run-to-run band (0.003807), so the mean alone is not a moved gap. What moved is the ON arm's seed-to-seed sd (0.019099 to 0.012005), which is the noise band the rule reads, and promotion (0 to 6). The held-out gain 0.026660 over the noise 0.012005 is one run; the control's 0.018619 against 0.019099 is the other.

### (1) The noise, per n (development draws, never the held-out ones)

The same command twice (my scratch harness, identical to the bench's arms: spread ON by wall, 30 s per arm, OFF matched in generations; scored on the development draws grid/velocity:spread-dev1..5, 800 tasks, seeds spread/dev/1..5), before any change:

```
band baseA vs baseB seeds 1,2,3,4,5 G 176,169,169,173,113 | 158,165,167,166,117
n seeds 5, held bursts 3: control (OFF) run-to-run band 0.001531 (per seed max 0.008603); ON band 0.009764; gain -0.004467 vs 0.006828 band 0.011295; seed-to-seed noise max(sdOn,sdOff) 0.014272 | 0.015546
n seeds 5, held bursts 6: control (OFF) run-to-run band 0.001358 (per seed max 0.005839); ON band 0.011491; gain -0.005987 vs 0.006862 band 0.012849; seed-to-seed noise max(sdOn,sdOff) 0.015441 | 0.015798
n seeds 5, held bursts 12: control (OFF) run-to-run band 0.002639 (per seed max 0.012960); ON band 0.008040; gain -0.000205 vs 0.010475 band 0.010680; seed-to-seed noise max(sdOn,sdOff) 0.017554 | 0.022579
n seeds 5, held bursts 24: control (OFF) run-to-run band 0.003174 (per seed max 0.008958); ON band 0.007666; gain 0.000221 vs 0.011062 band 0.010841; seed-to-seed noise max(sdOn,sdOff) 0.018089 | 0.020913
```

- The control arm's run-to-run band at the stated n (5 seeds, 3 held bursts) is 0.001531, under half the stated gain 0.0156, so n was not raised for the band.
- Raising n in held-out bursts (3, 6, 12, 24 per organism) did not narrow the seed-to-seed noise the rule reads (0.014272 to 0.018089 in run A): that noise is lineage-to-lineage, not scorer noise. More seeds estimate a standard deviation better but do not shrink it, so n stays 5 and the heldSeeds stays 3.
- Under wall-bound generations the ON arm moves run to run (band 0.009764) because G moves with the load; at a fixed G of 170 the same code gives a band of exactly 0.

### (2) The gain: the defects named, the knob moved (development only), then held-out once

What spread did to the population: every kept move was applied by every receiver on arrival, so one organism's single noisy trial (2 to 4 seeds, a loose genes noise rule) became every organism's config, the 3 lineages collapsed into one, and the ON arm's seed-to-seed sd carried one lineage's luck. And a survivor was confirmed as its own knob values laid on OPTIONS, a config no trial ever measured.

The changes, in generations/spread.mjs (SPREAD fields; BEFORE_BOARD20 is the old setting):
- `replicate: true`: a received move waits in the receiver's pending list; the receiver runs its own matched trial and takes it only above its own noise. `replicateAs: 'config'`: the receiver tries the whole config the sender kept the move in (the elite is shared, never imposed). The move still travels the conduits and still reaches all N within k.
- `confirm: 'config'`: a survivor is confirmed as the whole config it was kept in, against the file's own OPTIONS, same promotion seeds, same range rule.

Development, at a fixed 170 generations (so the OFF arm is identical across variants; seeds spread/dev/1..5):

```
g170base G 170,170,170,170,170 held bursts 3: meanOn 0.655484 meanOff 0.657485 gain -0.002001 noise 0.018423 (sdOn 0.008175, sdOff 0.018423) gain above noise false; promo confirmed move/config per seed 0/19 0/15 0/27 0/30 0/0
g170rep G 170,170,170,170,170 held bursts 3: meanOn 0.674731 meanOff 0.657485 gain 0.017246 noise 0.018423 (sdOn 0.010880, sdOff 0.018423) gain above noise false; promo confirmed move/config per seed 0/14 0/17 0/19 0/13 0/1
g170repcfg G 170,170,170,170,170 held bursts 3: meanOn 0.672464 meanOff 0.657485 gain 0.014979 noise 0.018423 (sdOn 0.008228, sdOff 0.018423) gain above noise false; promo confirmed move/config per seed 0/19 0/13 0/17 0/27 0/2
g170repcfg G 170,170,170,170,170 held bursts 12: meanOn 0.676074 meanOff 0.658747 gain 0.017327 noise 0.017343 (sdOn 0.002597, sdOff 0.017343) gain above noise false; promo confirmed move/config per seed 0/19 0/13 0/17 0/27 0/2
```

And the bench's own development run with the chosen setting (`node bench/spread.mjs --dev`, wall-bound, bench/verdicts/spread-dev-partial.json):

```
[spread] held-out mean ON 0.676730 vs OFF 0.659260: diff 0.017470, seed-to-seed noise 0.019661 (sd ON 0.006345, sd OFF 0.019661; paired sd 0.022299)
[spread] promotion: 4 written, self/gaps.mjs writeLedger (4 lines), into <scratch>/bar-root/dev
```

(That line says "held-out mean" because the label was fixed after the run; its draws were the development ones, as its first line and the verdict's split say.)

Said straight: on the development draws the change moved the gain from about 0 to about 0.015 to 0.017 and cut the ON sd, but the gain did NOT clear the development noise (0.017 to 0.020, set by the OFF arm's seed 1). It was chosen there anyway, as the one change that moved the gain, and the held-out suite was then run once: 0.026660 against 0.012005, met. The held-out OFF sd (0.008609) is narrower than the development OFF sd; a reader should weigh the met bar with that in mind.

### The site line: organism-years per wall hour

web/ladder.mjs renders one line on the ladder page (card id per-hour). The page types no number and its walker (web/ladder-walk.mjs) accepts only fields, so each figure is a field of bench/verdicts/spread-rate.json (written by `node bench/spread.mjs --rate` and at the end of every spread bar run); at build time web/ladder.mjs does the arithmetic again over years.json and spread.json and shows a figure only where the record equals it; a source verdict without its field throws; a stale record is named, with no figure. `node web/build.mjs` printed `dist ladder/index.html    184286 bytes   1057 numbers traced in 732 spans from 17 verdict files; gsm8k partial, humaneval partial, arc whole; native whole, years whole`, and the line reads:

```
organism-years per wall hour: 6035882 for grid 300 s (502991 organism-years in 300000.49 ms, bench/verdicts/years.json) 502,991 organism-years / 300.000 s x 3,600 s per hour = 6,035,882 organism-years per wall hour (bench/verdicts/years.json, runs.2.years.organismYears over runs.2.years.wallMs); 65297897 for spread, both arms (5757760 organism-years in 317.4365 s, bench/verdicts/spread.json) 5,757,760 organism-years / 317.437 s x 3,600 s per hour = 65,297,897 organism-years per wall hour (bench/verdicts/spread.json, organismYears over wallS)
```

Not deployed (the orchestrator deploys). When years.json is re-run, the line names spread-rate.json as stale until `node bench/spread.mjs --rate` runs.

### Tests

`node --test --test-timeout=120000 test/spread.test.mjs test/ladder-page.test.mjs`: 14 tests, 14 pass. Added to test/spread.test.mjs: runBand on a planted pair of runs; spreadChecks on planted gains and bands (gain 0.9 and 1.1 of the band, a noisy ON arm, each other check failing alone, one seed); replication; confirm config. New test/ladder-page.test.mjs: the span equals the test's own arithmetic over the two files; planted years.json or spread.json without the field throws; a stale or bent record shows no figure. test/web-ladder.test.mjs and test/ladder.test.mjs still pass (47 of 47 with the two above).

### Next rung

- The bar met once, on one host; the control of the change missed on the same host. Run the bar and `--intervention off` again on a quiet machine, each twice, and print the band of the gain before calling the move robust.
- On the development draws the gain sat just under the OFF arm's sd. A larger gain needs what the band corners forbid: every arm ends at 0.7x to 1.5x of OPTIONS. The promoted lines (lmax 32 -> 48, mutationRate 1.5 -> 2.18) are the way out: an improve round applying one moves the band itself.
- The promotion trial (`--trial`) still scores the promotion seeds that selected the line (board 14's open item).

## Board 14: the result, in one paragraph

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
