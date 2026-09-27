# notes/multiply.md: the multiply items (Board 12, then board 24B multiply-suite)

His P15: "multiplying, duplicating, all within cloud".

This note is the builder's record: what was built, what was measured and by which command, and what is still open. Board 24B's item (multiply-suite) rewrote it on 2026-09-27; the Board 12 version (the organism population, its kill and its bar) is in git history with the bench flow it described.

## Before this item

Board 12 built the organism population in daemon/multiply.mjs: an instance, a duplicate, the elite exchange through a shared store, and a supervisor that restarts a killed instance from its own checkpoint. Its bar ran one instance against a population of 3 on the grid suite of 4 draws with the plane ladder's library cap (32 to 96). The picks of both arms shared one searched score, so the fresh gap between the arms was decided by the store's tie-break, and bench/ladder.mjs labels that bar "decided by tie-break noise, not a bar". Its Open list asked for "a suite or a length cap the single instance does not saturate". This item is that suite, and the island model measured on it.

The organism population code and its nine tests are unchanged. The bench flow that ran it (single against a population of 3, a SIGKILL at 120 s) is retired from bench/multiply.mjs: the bench now measures the island model.

## Files

Written or edited by this item (board 24B, multiply-suite):
- **daemon/multiply.mjs:** the island model, added beside the organism population.
  - `PlaneSearch` takes `lmax` (a library cap up to LEN_CAP 256) and `popScale` (N times the children per generation).
  - New methods: `generations(gens, {evalCap})`, `searchedBest()`, `emigrants(k)` and `immigrate(batches)`.
  - `islandWorkerMain` is a worker mode driven by generation count from the main thread.
  - `runIslands()` runs N islands in lock step. `lastQuarter(trace)` reads the last quarter of a run.
- **bench/multiply.mjs:** rewritten. It runs the probe, the M sweep (`--tune`) and the deciding run, and writes the verdict. It still exports the pure `splitFor`, plus `bandOf`, `beats` and `chooseSuite`. Importing it runs nothing.
- **test/multiply.test.mjs:** six tests added. The nine before them are untouched.
- this note
- **bench/verdicts/multiply.json:** the bar, written by the bench.
- **bench/verdicts/multiply-tune-partial.json:** the M sweep (development), written by the bench.

## Design

**One island** is a PlaneSearch in a worker thread (`new PlaneWorker({mode: 'island'})`). It runs MatrixElites plane after plane, each until the PlateauRuler plateau (patience 200). A new plane starts from the store's elites.

The main thread drives every island by COUNT. The message `run {gens, evalCap}` runs that many generations and stops at the island's share of the evaluations. No island runs free on a clock. So a run is a pure function of its seed, its budget and its flags: the same command prints the same scores on an idle desk and a loaded one.

Every evaluation is counted:
- engine children
- harvest rescoring at plane ends and at the report
- the rescoring of every migrant

The exchange therefore pays for itself out of the same budget.

**The exchange.** After every M generations (an epoch), each island still under its share hands its best `migrants` libraries to every other such island (all to all). A library ranks by the searched objective, shorter first on a tie, one copy per genome. The receiver scores each migrant again on its own matrix and rejects it when the count disagrees. It offers the migrant to its store (strictly better replaces) and, when the migrant filled or replaced a cell, drops it into the running plane.

**The pick** is the best library by the searched objective over the arm's islands, a tie to the lower island. Only the final report scores the fresh draws (grid/velocity:heldout and :fresh1..7, 1280 tasks). Nothing selects on them.

**THE CONTROL: N times the population, not N times the wall.** The island literature compares an island model with one panmictic population of the same total size at the same total evaluations. N times the wall would give the control N times the generations of a quarter-size population, so the islands would win or lose on search depth. N times the population holds three things equal:
- the generations
- the children per generation
- the evaluations

Only the structure differs: one population, or N that trade. The control is `runIslands({n: 1, popScale: N})`, the same PlaneSearch with each plane's popSize times N. **The second control** is the same N islands with the exchange off. Its island i0 is the exact run i0 would be alone (a test holds it).

**Organism-years.** generations/years.mjs declares one organism-year as one generation of the whole population, and its yearsRun uses 64 children. Every arm here is priced at that declared 64-child generation: organism-years = evaluations / 64. The budget of 800,000 evaluations per arm per seed is 12,500 organism-years.

**The suite.** Grid tasks of seed grid/velocity at maxDepth 3 (6175 components, 160 tasks per draw) are searched on K draws, with the library cap from the plane ladder or raised to 256 (LEN_CAP). Five candidates run cheapest first: k4-ladder (the prior bar's suite), k4-l256, k16-l256, k32-l256 and k64-l256.

The probe runs THE CONTROL alone at the bar's budget on the three TUNING seeds tune1, tune2 and tune3, with noFresh, so no fresh draw is even loaded. For each seed it prints the searched end score and the gain over the last quarter of the budget.

A candidate is RISING when its control gained over the last quarter on all three tuning seeds, each inside the 120 s wall. The suite is the LARGEST rising candidate. With none rising, the bench prints SATURATED and writes barMet false without running a deciding seed.

**The run that decides.** It uses five DECIDING seeds, decide1 to decide5, that nothing before it ran, and three arms per seed at the same budget.
- The singles run 4 at a time.
- Per seed, the islands arm and the no-exchange arm each run on 4 worker threads.
- At most 4 workers run at once, and every arm is guarded at 120 s. An arm that reaches the guard stops, says so, and cannot meet the bar.

**The bar.** The islands must beat BOTH controls: the islands' mean held-out score over the five deciding seeds, minus the control's, must be above the seed band. The band is the wider of the two arms' min..max ranges over those seeds. The bar also needs the same organism-years within 0.5% and every arm inside the wall. The paired per-seed differences are printed beside it.

For bench/ladder.mjs, `bar.singleFresh` and `bar.populationFresh` are the held-out counts summed over the five seeds, and `bar.noise.seedToSeed` is the per-seed band times 5 in that unit. The two rules are the same inequality. `arms.*.pick.fitness` is null because each arm has five picks, one per seed, and each pick's own searched fitness is in `perSeed`.

**MODEL OFF.** Provider null, no socket, no model call. Ollama is never started and port 11434 is never called.

## Tests

`node --test test/multiply.test.mjs`: 15 tests, the 9 before this item unchanged and 6 added. The added six cover:
- **Determinism:** an island run is deterministic (the same trace and exchange log twice), and each island stops within a generation of its share. Exchange rows are all to all and at most `migrants` each way, with 0 rejected on one matrix. The pick is the best searched fitness.
- **Exchange off:** nothing is imported, and island i0 of the pair is the same run as i0 alone on the same share (same evaluations, generations and best genome). The exchange arm on the same seed imports.
- **The first control:** with `popScale` 2 it spends the same evaluations as 2 islands, within a generation, in one instance with fewer generations.
- **The cap, noFresh and the wall guard:** `lmax` 16 caps the library, noFresh scores no fresh draw, and the wall guard stops after one epoch and says `stoppedBy: 'wall'`.
- **lastQuarter:** rising, flat, one point and empty traces.
- **The bench helpers:** `bandOf`, `beats` (a gap equal to the band is not a beat; the wider range is the band), `chooseSuite` (the largest rising candidate), the candidate list, and `splitFor` (the deciding seeds held out, contamination reasons for an overlap or a fresh draw scored in development).

Mutants, each run once against the added tests and then restored (cmp against the saved copy):
- the exchange never runs: 2 fail
- `beats` with `>=`: 1 fails
- the wall guard never trips: 1 fails

The worker-boundary census still holds: 2 `.postMessage(` lines, and one `new Worker(`.

## Measured

### Read before building (the published way and the prior attempt)

- **A web search** (island model GA against a panmictic population at the same total evaluations; the migration interval; when islands help). Its summary carried three points:
  - Parallel GAs are often reported better than one large panmictic population, but a fair comparison needs care: total evaluations can mislead when communication costs differ. Here the migrants' rescoring is charged to the budget, so the communication is inside the count.
  - A simple island model with migration can need polynomial time where a panmictic population, and islands with no migration, need exponential time. That result is the reason for the no-exchange arm.
  - Island advantages may come from the separable test problems they are usually run on.
- **The emergentmind topic page** "Population and Island Models in Evolutionary Computation" says islands keep diversity through reduced mixing, with migration at configurable intervals.
- **Failed fetches.** Whitley, Rana and Heckendorn, "The Island Model Genetic Algorithm: On Separability, Population Size and Convergence", did not load: researchgate answered 403 and the semanticscholar page came back empty. Their equal-total-population comparison, Cantu-Paz's survey and Alba and Tomassini's "Parallelism and evolutionary algorithms" are cited from background knowledge, not read this session.
- **The prior attempt.** This note's Board 12 version (its Open item "The plateau"), bench/ladder.mjs tieBreakOf (the TRUTH label and what lifts it), generations/years.mjs (the organism-year declaration and yearsRun's popSize 64), and generations/velocity.mjs (matrixPlaneCoordinate's POP_LADDER 32 to 256, LEN_CAP 256).
- **An earlier attempt of this item** (2026-09-26) left a scratch grid matrix cache. It was reused: the bar printed `72 cached` for k64-l256.

### Exploration before the bench (scratch explore.mjs: the control only, tuning seeds, searched scores only)

These are one instance with 4 times the population, on tune1, tune2 and tune3. The reports computed fresh counts inside the workers, but explore.mjs never printed or read them.
- **k4-ladder at 3,000,000 evaluations:** ends 596/597/597 of 640, last-quarter gains 1/0/0.
- **k4-l256 at 10,000,000:** ends 630/630/631, gains 0/0/0.
- **k16-l256 at 4,000,000:** ends 2530/2528/2530 of 2560, gains 0/0/0.
- **k32-l256 at 2,000,000:** ends 5004/5005/5005 of 5120, gains 0/6/0.
- **k64-l256 at 800,000:** ends 9935/9938/9933 of 10240, gains 4/6/3.

So the smaller suites stay saturated at budgets several times the bar's, and 800,000 evaluations on k64 is where the single still rose and fit the wall.

### The M sweep (development, 2026-09-27T13:57:31.160Z, node v24.15.0)

`node tools/budget.mjs --ram-mb 4000 --disk-mb 500 --dir <scratch> --record <scratch>/budget-tune.json -- node --max-old-space-size=4000 bench/multiply.mjs --tune --out <scratch>` wrote bench/verdicts/multiply-tune-partial.json (isTheBar false, contaminated false, 0 fresh draws scored). The budget record shows a peak of 466.387 MB, 312.408 s and 19.227 MB on disk.

```
[tune] M 10   searched mean 9939.7/10240 (seeds 9943 9942 9934)
[tune] M 50   searched mean 9936/10240 (seeds 9932 9942 9934)
[tune] M 200  searched mean 9933/10240 (seeds 9938 9931 9930)
[tune] M off  searched mean 9925.7/10240 (seeds 9922 9937 9918) (no exchange)
[tune] the best M by the searched objective on the tuning seeds: 10 (mean 9939.7); no exchange 9925.7
```

M = 10 became the bar's default (`BAR.every`). It was chosen on the tuning seeds by the searched objective only.

### The bar (2026-09-27T14:04:52.062Z, node v24.15.0, wall 421.9 s)

`node tools/budget.mjs --ram-mb 4000 --disk-mb 500 --dir <scratch> --record <scratch>/budget-bar.json -- node --max-old-space-size=4000 bench/multiply.mjs --out <scratch>` (free RAM 35.5 GB at start) wrote bench/verdicts/multiply.json: isTheBar true, barMet false, contaminated false, 0 fresh draws scored in development. The budget line:

```
BUDGET done exit 0: wall 422.33 s, peak ram 470.4MB, peak dir 19.2MB, cpu 925.11 s, 212 samples
```

The probe, THE CONTROL on the tuning seeds at 800,000 evaluations (12,500 organism-years):

```
[probe] k4-ladder: ends 593/597/595 of 640, last quarter 0 0 +43 => SATURATED (not rising on every tuning seed inside the wall)
[probe] k4-l256: ends 630/630/630 of 640, last quarter +1 0 0 => SATURATED (not rising on every tuning seed inside the wall)
[probe] k16-l256: ends 2527/2528/2529 of 2560, last quarter 0 0 0 => SATURATED (not rising on every tuning seed inside the wall)
[probe] k32-l256: ends 5002/4994/5004 of 5120, last quarter +1 +2 0 => SATURATED (not rising on every tuning seed inside the wall)
[probe] k64-l256 tune1: control end 9935/10240 searched (len 256), last quarter +4 (19.88 per M evals, from 9931 at 599,040 evals), 55.3 s
[probe] k64-l256 tune2: control end 9938/10240 searched (len 256), last quarter +6 (29.84 per M evals, from 9932 at 599,040 evals), 53.5 s
[probe] k64-l256 tune3: control end 9933/10240 searched (len 256), last quarter +3 (14.58 per M evals, from 9930 at 594,568 evals), 49.8 s
[suite] chosen k64-l256 (the largest candidate whose control rises on every tuning seed): ends 9935/9938/9933 of 10240, last quarter +4 +6 +3, slopes 19.88 / 29.84 / 14.58 per M evals
```

The deciding run: five deciding seeds, three arms each, every arm inside the 120 s wall. The islands arms took 20.1 to 23.6 s, the no-exchange arms 20.6 to 26.5 s, and the singles 46.3 to 63.2 s, 4 at a time.

```
[arm] islands  held-out mean 1219/1280 (sd 2.3, 1215..1221, range 6; seeds 1221 1215 1220 1219 1220), organism-years 12,506 per seed, exchanges 1014, elites imported 9265, max wall 23.6 s
[arm] noexch   held-out mean 1217.8/1280 (sd 3.3, 1213..1221, range 8; seeds 1221 1221 1217 1213 1217), organism-years 12,507 per seed, exchanges 0, elites imported 0, max wall 26.5 s
[arm] single   held-out mean 1220/1280 (sd 1.6, 1218..1222, range 4; seeds 1219 1221 1218 1222 1220), organism-years 12,506 per seed, exchanges 0, elites imported 0, max wall 63.2 s
[years] every arm spent 800,000 evaluations per seed within 0.04% (the last generation of each instance): the same total organism-years; every arm inside the 120 s wall: true
```

The bar lines, verbatim:

```
[bar] single: 6100/6400 fresh (one instance, 4 times the population, summed over the 5 deciding seeds)
[bar] population pick by the searched objective: 6095/6400 fresh (4 islands, exchange every 10 generations, summed over the 5 deciding seeds); no exchange 6089/6400
[bar] islands minus single: mean -1.0 against a band of 6 (paired per seed 2 -6 2 -3 0) => does not beat the single instance
[bar] islands minus no-exchange: mean +1.2 against a band of 8 (paired per seed 0 -6 3 6 3) => does not beat the no-exchange arm
[bar] MISSED: N islands with exchange did not beat both controls by more than the seed band on k64-l256, a suite the single does not saturate
```

### Why it missed (read after the miss, from the verdict's own fields)

- **The exchange works on the searched objective.** Mean searched scores (`arms.*.searched.mean`) are 9937.4 for the islands, 9934.8 for the single and 9923.2 with no exchange. With M = 10 the islands lead the no-exchange arm on every deciding seed's searched score: 9936/9938/9941/9938/9934 against 9923/9925/9918/9920/9930 in the `[islands]` and `[noexch]` lines. They end level with the single given 4 times the population.
- **The lead does not reach the held-out draws.** On 1280 fresh tasks the arms differ by 1.0 and 1.2 tasks on average, against seed ranges of 4 to 8. The best fresh score over each arm's instances (`perSeed.bestFreshOverIslands`, which selects on the held-out draw and is not the bar) is at most 1221 for the islands (1221 1216 1221 1219 1221), 1221 with no exchange (1221 1221 1219 1219 1217) and 1222 for the single (1219 1221 1218 1222 1220): no arm holds a library the others lack on the fresh draws.
- **The control was still rising on the deciding seeds too.** The singles' last-quarter gains (`arms.single.perSeed[].lastQuarter.gained`) are 4 6 3 3 6. So the suite was not saturated on the population the bar decided on.
- **Every pick in every arm is 256 long** (`perSeed[].len`, one 255 in the no-exchange arm), and 256 is LEN_CAP. On k64-l256 the length cap binds again: the rise that is left (14.58 to 29.84 searched tasks per million evaluations in the probe) comes from trading components inside a library that is already full.

## What the numbers say

- At the same 12,500 organism-years per seed, 4 islands that trade 8 elites every 10 generations are not distinguishable on held-out tasks from one instance with 4 times the population, nor from 4 islands that never trade. The differences are 1 task in 1280, inside the seed band. The bar is missed, and it is missed on a suite the single does not saturate: its control rose over the last quarter on all 3 tuning seeds and all 5 deciding seeds.
- The exchange is not idle. It imported 9265 elites over 1014 exchanges, and it lifted the islands' searched score above the no-exchange arm's on every deciding seed. That lift is 14.2 of 10240 searched tasks on average, and it did not show on the 1280 fresh ones.

## Open

- **The length cap binds at LEN_CAP 256** on k64-l256: every pick is 256 long. A suite with more headroom per library needs LEN_CAP raised or a different objective. LEN_CAP is a constant of generations/velocity.mjs, which is board 24a's file, so this item did not touch it.
- **A larger budget is outside the wall.** The single arm at 800,000 evaluations took up to 63.2 s with 4 running at once. Doubling the budget would put it near the 120 s guard on this desk.
- **The held-out ceiling** (how many of the 1280 fresh tasks any component can solve) was not measured. The searched union bound is printed (10134 of 10240), but the fresh one is not.
- **Readers of the old verdict.** bench/ladder.mjs reads `bar.singleFresh`, `bar.populationFresh`, `bar.noise` and `arms.*.pick.fitness` from this file. The new verdict keeps those fields: the sums over the seeds, the band times 5, and a null fitness because each arm has five picks. test/ladder.test.mjs and the findings page were not run here (not this item's files). Its TRUTH block reads the `[bar] single` and `[bar] population pick` lines above.

## Model calls

None. Provider null, no socket, Ollama never started, port 11434 never called. The bench and the tests make no model call. The scores are counts of evaluations and do not move with the desk's load. Only the wall seconds do, on a desk shared with the other board 24B items.
