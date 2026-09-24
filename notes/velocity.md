# velocity: iteration velocity, measured

His P5 (2026-09-23): "billions of years, or infinite... to actually work to land it in the
timeframe of peak efficiency and iterate that quickly. Iteration velocity." This item answers
the first half with arithmetic nobody should quote and the second half with two measured
numbers: how many genomes a second can be SCORED, and how many generations a search takes to
stop improving, on a landscape where the right answer is known.

Every number below was printed by `node bench/velocity.mjs` (the bar run, verdict
`bench/verdicts/velocity.json`, at 2026-09-23T21:25:24.250Z, node v24.15.0, 97.6 s wall). The
machine was shared with other builders of the same board while it ran, so every rate is a
contended rate.

## What was built

`generations/velocity.mjs`, three pieces:

1. **The evaluation matrix.** Suite: `tasks/grid.mjs`, seed `grid/velocity`, 160 tasks.
   Components: the identity plus every chain of 1 to 3 of the 18 `SEARCH_OPS`, 6175 of them,
   with the colour map inferred at the end exactly as `tryTerminal` does. Two bit planes, FIT and
   RIGHT, 5 words per component each. A genome is an ordered library; the first slot that fits a
   task answers it. Scoring is a walk over typed arrays, no Brain built:
   `claimed = FIT & unclaimed; solved |= claimed & RIGHT; unclaimed &= ~FIT`.
   Precompute: 1463.1 ms, 3,951,360 op applications. Union bound: 159/160.
2. **The plateau ruler.** Fires when the best has not risen by more than epsilon over
   `patience` generations, measured against the best at the last improvement. Reports
   generationsToPlateau (the last improvement), the generation it fired, wall to both,
   evals/s, archive fill, and the declared years.
3. **Infinite mode.** Plane after plane from an unbounded list of coordinates (population,
   library cap, mutation rate, crossover, prune, directed rate), each to its plateau, the best
   library carried into the next plane's generation zero. Ends when the ruler fired on every
   coordinate of a finite list, or when the wall budget ends.

## The bar, as printed

```
[rate] tick path:   1000 evals in 61709.3 ms = 16.205 evals/s (2022.4 ticks and 28227.9 cell runs per eval)
[rate] matrix path: 4,347,000 evals in 2000.1 ms = 2,173,397 evals/s (same 1000 genomes, 4347 passes, checksum 290944710 = 290944710 expected: true)
[rate] ratio 134,119x against an aim of 100x: MET; the precompute (1463.1 ms) is repaid after 24 evaluations
[exact] mismatches: solved 0, claiming slot 0, count 0, fitness 0, word path vs cell-by-cell walk 0; counts 0..158 of 160
[audit] 6175 components x 160 tasks = 988,000 cells recomputed by real grid cells in 16 worker threads: fit mismatches 0, right mismatches 0 (6642.9 ms, 246,672 ticks)
[synthetic] BAR (directed 0.75, seeds 100..115) patience 200: 16/16 seeds end holding the planted set, 0 false plateaus; |generationsToPlateau - generation the optimum was first held| max 0 (tolerance 0); fired 200 generations after it; trajectory disagreements across patience 0: MET
```

The 1000 exactness genomes: 1 identity only, 1 of 256 slots with duplicates, 1 identity first,
836 prior draws, 161 elites of a plane at its plateau; lengths 1..256; counts 0..158 of 160.

## Why the exactness claim is worth something

- The tick path is not the matrix recomputed. Every transform in it is a real grid cell in a
  real `Brain` (chains wired once per genome, inputs injected round by round, outputs read off
  the outbox, colour maps through real `grid.colormap` cells). The matrix is filled by the pure
  functions of `cells/grid.mjs`. A disagreement between a cell and its pure function would be a
  mismatch.
- The audit is the whole matrix, not a sample: 988,000 cells, 0 mismatches.
- The zero has a control. `test/velocity.test.mjs` (c) and (d) flip one bit in a copy of a
  small matrix; the serial audit, the parallel audit and the exactness check each find exactly
  that bit. A check that could not see would have printed zero there too.
- The rate loop's checksum equals its passes times the sum of the counts the exactness check
  scored, so the fast loop scored the same thing, not a cheaper thing.
- The tests can fail. Two mutants were planted in place and the file restored byte for byte
  (cmp identical): dropping the unclaimed update in `scoreAt` failed (a), (b) and (f)
  (`pass 10, fail 3`); making the ruler fire one generation late failed (e), (f) and (l)
  (`pass 10, fail 3`).
- What the exactness check CANNOT see: both paths share `terminal()` (colour map inference and
  the fit decision, the logic of `tasks/grid.mjs tryTerminal`) and `gridChainOf` (which chain a
  component index is). A defect there would be the same defect on both sides. The check proves
  the cells and the cache agree on every transform, not that `tryTerminal`'s rule is right.

## The patience sweep (the ruler's real cost)

Synthetic landscape: 256 tasks in 8 blocks of 32, one planted component per block, 504 decoys
that fit 24 tasks and answer 6. The unique optimum is the planted set. Seeds 100..115, never
seen by the probe that chose the engine's directed rate (seeds 0..15).

| engine | patience | on time | false plateaus | optimum first held at gen |
|---|---|---|---|---|
| directed 0.75 | 20 | 10/16 | 6 | 18..126 |
| directed 0.75 | 50 | 15/16 | 1 | 18..126 |
| directed 0.75 | 100 | 16/16 | 0 | 18..146 |
| directed 0.75 | 200 | 16/16 | 0 | 18..146 |
| undirected | 20 | 4/16 | 12 | 140..249 |
| undirected | 50 | 10/16 | 6 | 140..408 |
| undirected | 100 | 15/16 | 1 | 140..454 |
| undirected | 200 | 16/16 | 0 | 140..464 |

(The optimum-first-held range covers only the seeds that were on time at that patience, which is
why it widens as the patience grows.)

A false plateau is the ruler declaring the search finished before the optimum was held. At a
short patience the ruler stops on a library holding 255 of 256, which looks finished: the last
planted component is the rarest draw of all. Patience is therefore a price paid in wall time for
not stopping early. At patience 200 the directed engine paid it with 0 false plateaus on 16
fresh seeds. The one directed false plateau at patience 50 (seed 105) stopped holding 256 of 256 in 9
slots (verdict row: bestLen 9 against the optimum's 8): every task solved, but not the
shortest library.

## The directed draw (the iteration-velocity win)

The matrix knows which tasks a parent leaves unsolved and which components answer each task.
With probability `directed`, a replace or an insert draws a component that answers one of the
parent's unsolved tasks, instead of a draw from the size prior. Scoring is untouched: the
proposal is aimed, and the verdict on it is the same exact walk. On the bar seeds the optimum was
first held at generation 18..146 directed, against 140..464 undirected.

The rate 0.75 was chosen in a probe on synthetic seeds 0..15 and grid seeds a, b, c. That is
why the bar uses seeds 100..115, and why the undirected engine is printed beside it on the same
seeds.

## Prune

A slot that claims no task changes nothing: every task it fits was already claimed, so removing
it leaves every later claim as it was. The count is exactly unchanged and the library is
strictly fitter, so the archive holds only libraries whose every slot claims a task. Test (g)
checks the count identity on 150 random libraries and the property on every elite.

## Infinite mode, as printed

- Finite list of 8 coordinates: stop `planes`, the ruler fired on 8/8, best 158/160 in 51
  slots, 262,023 evals in 157.6 ms.
- Unbounded list, wall budget 20000 ms: stop `wall` after 976 planes (975 fired), best
  158/160 (union bound 159) in 50 slots from plane 182, 28,572,975 evals in 20000.2 ms =
  1,428,634 evals/s. Re-scored by real cells: 158/160, agree.
- A plane with a library cap below the carried library's length receives the carried library
  truncated to its cap, so it starts lower: the printed finite-list row for plane 7 (lmax 32)
  ends at 139/160 while the carried best is 158. Short-cap planes did raise the global best at
  the start of each run (unbounded planes 0 and 1, lmax 32: 136 then 139), before any longer
  library existed; after that, the cap bounds what such a plane can add.

## Years (declared arithmetic, never a headline)

```
[infinite] years: 28572975 evaluations x 2022.448 ticks each (measured on the tick path) x 0.001 s/tick (declared) / 31557600 s/year = 1.831171e+0 organism-years (declared arithmetic, not a measurement)
```

That is what the evaluations would have cost as ticks of the organism at the declared seconds per
tick. The matrix path runs no ticks. The number that is a measurement is the evals/s beside it.

## What it did NOT buy: generalisation

```
[heldout] fresh draw (seed grid/velocity:heldout, same families): the best library solves 110/160 (union bound 159) against 158/160 on the suite it was searched on; real cells say 110: agree
```

The fast search found a library that solves 158 of the 160 tasks it was searched on and 110 of
a fresh draw of the same families. The velocity is real; the libraries overfit the draw they
were searched on. The fix is a search objective over more than one draw (a matrix per draw,
scored together), which the matrix makes cheap. Board 10 built it: see the next section.

## The multi-draw objective (Board 10)

Every number in this section was printed by `node --max-old-space-size=4000 bench/velocity.mjs
--draws 4` (verdict `bench/verdicts/velocity-heldout.json`, isTheBar true, at
2026-09-24T02:01:59.589Z, node v24.15.0, 36.1 s wall, machine shared with other builders).

**What changed, and only this.** `generations/velocity.mjs` gained the objective: `drawSeeds`
(draw 0 IS the run seed, draw k is `<seed>:draw<k>`), `stackDraws` (K matrices over the same
components laid end to end on the task axis), `buildGridDraws`, and `objectiveOf`, the mean over
the K draws of `fitnessOf` on each:

    (sum_k count_k / K - len / 257) / Td        (Td = tasks per draw)

The word walk over the stack gives `sum_k count_k` exactly (first fit is decided task by task, and
the draws are disjoint task ranges). At K = 1 `objectiveOf` returns `fitnessOf` itself, so the
one draw search is the Board 8 search draw for draw (test (p) runs both and compares every
generation's best). The engine, the plane coordinates and the plateau rule (patience 200,
epsilon 1e-9) are untouched; `MatrixElites.offer` now asks the matrix for its objective.

**The bar, as printed.**

```
[draws K=1] searched suite: the best library (50 slots, plane 14) solves 158.0/160 mean over its 1 draw (per draw 158), 158/160 on grid/velocity
[draws K=1] fresh draw grid/velocity:heldout: 109/160 (union bound 159); the 4 more fresh draws: 104, 97, 104, 97 (mean 100.5)
[draws K=4] searched suite: the best library (96 slots, plane 23) solves 149.5/160 mean over its 4 draws (per draw 153, 146, 152, 147), 153/160 on grid/velocity
[draws K=4] fresh draw grid/velocity:heldout: 137/160 (union bound 159); the 4 more fresh draws: 129, 138, 132, 129 (mean 132.0)
[control] K = 1 searched on each other draw alone (same list, same rule): searched 158/160, 160/160, 156/160; fresh draw grid/velocity:heldout 114, 116, 118; the 4 more fresh draws, mean 113.8, 115.8, 110.3
[exact] 40 genomes (1 identity only, 2 arm bests, 21 elites of a K = 4 plane at its plateau, 16 prior draws), each on all 640 stacked tasks by the matrix and by real grid cells ticked in a Brain: mismatches solved 0, claiming slot 0, count 0, fitness 0, word path vs cell-by-cell walk 0 (12202.2 ms)
[exact] the stack against its 4 draws scored one at a time, same 40 genomes: count mismatches 0, solved mismatches 0; max |stack objective - mean of per draw fitness| 1.11e-16
[exact] the arm bests re-scored on grid/velocity:heldout by real cells: K=1 109 (matrix 109), K=4 137 (matrix 137): agree
[rate] K=1: matrix path 9,928,600 evals in 2000.0 ms = 4,964,293 evals/s (160 tasks, 5 words per plane, same 40 genomes, checksum ok)
[rate] K=4: matrix path 2,465,760 evals in 2000.0 ms = 1,232,868 evals/s (640 tasks, 20 words per plane, same 40 genomes, checksum ok)
[bar] fresh draw grid/velocity:heldout: K=4 137/160 against K=1 109/160 (+28); searched suite K=4 149.5/160 mean, K=1 158/160; exact 0 + 0 mismatches: MET
```

Generations to plateau (same 32 plane list, base `velocity/finite`, all 32 fired at both K):
plane 0 from scratch landed at generation 259 (K = 1) and 389 (K = 4); the final best was first
held at cumulative generation 3649 of 8319 (K = 1) and 10786 of 15494 (K = 4). The search loop
ran 1,508,875 evals/s at K = 1 and 638,589 at K = 4.

**How to read it.**

- The trade is the one the objective asks for: the searched-suite score fell (158/160 at K = 1,
  a mean of 149.5/160 at K = 4) and the fresh-draw score rose by the printed +28 (109 to 137),
  with the mean over 4 further fresh draws going from 100.5 to 132.0.
- The control says the gain is not the luck of a better single draw: searched on draw 1, 2 or 3
  alone, K = 1 scored 114, 116 and 118 on the same fresh draw, every one below 137.
- No fresh task appears verbatim in a searched draw (0 of 160 for the heldout, 0 for each of
  the 4 more), so the fresh score is not a copy.
- K = 1 here is a finite list of 32 planes and scored 109 on the fresh draw; Board 8's 110 was
  the best of an unbounded 20 s run (a different library, 50 slots, plane 182). Both searches
  are run to plateau by the same rule; the finite list is used here because it is deterministic.
- The matrix path costs what the words cost: 20 words per plane at K = 4 against 5 at K = 1,
  and the rate fell from 4,964,293 to 1,232,868 evals/s on the same 40 genomes. These 40 genomes
  are not Board 8's 1000 (no
  256 slot library among them), so the K = 1 rate here (4,964,293) is not comparable with Board
  8's 2,173,397.
- The K = 4 best holds 96 slots, the longest library any coordinate of the plane ladder allows
  (`LMAX_LADDER` tops out at 96). The cap binds at K = 4 and did not at K = 1 (50 slots).

**The tests can fail.** Two mutants were planted in `generations/velocity.mjs` and the file
restored byte for byte (cmp identical): stacking every draw onto task range 0 failed (o) and (q)
(`pass 17, fail 2`); dividing the mean by the stacked task count instead of the per draw count
failed (o) (`pass 18, fail 1`).

`bench/verdicts/velocity-heldout-partial.json` (isTheBar false) holds a repeat of the same
computation, `--draws 4 --draw-planes 32` (32 is the default, the extra flag only marks it
partial), run to read its peak working set from PowerShell: 215.2 MB. It printed the same bar
line, `K=4 137/160 against K=1 109/160 (+28)`: the search is deterministic from its seeds.

## Why the organism genome is not matrix scored

The organism genome of `generations/organism-genome.mjs` has five terms. Four are deterministic,
but the matrix needs a score that splits into per component, per task columns, and only the
library-shaped task term does:

- **prediction** is read off the whole wired brain after a tick run (mean surprise of its
  predictor cells), a property of the wiring, not a sum over parts;
- **throughput** is cell runs per wall second, a wall clock;
- **novelty** depends on the archive passed in.

So the organism planes get the ruler without the matrix: `plateauOrganismPlane` wraps a real
plane of `generations/planes.mjs` through the `runPlaneAsync` hook, and nothing in
`planes.mjs` or `epochs.mjs` was edited.

```
[organism] planes.mjs plane 1 (policy sealed, pop 9) under the ruler (epsilon 0.001, patience 6): plateau, landed gen 3 (1445.1 ms), fired gen 9, 2650.3 ms, 81 organisms = 30.562 organisms/s, best 0.788, fill 28
```

The organism plane scores 30.562 organisms/s; the matrix engine's search loop scores
1,344,161 evals/s. They score different objects, so that is not a ratio anyone should quote.
It is why the matrix exists.

## Open

- Generalisation: the single draw search gave 158/160 searched, 110/160 fresh (Board 8). The
  mean over 4 draws gives 137/160 fresh against 109 at K = 1 on the same plane list (Board 10,
  above). Next rungs: the K = 4 library sits at the ladder's 96 slot cap, so a longer cap for
  K above 1 is the first thing to measure; then K = 8 and 16 (the rate falls with the words);
  then the ARC tasks of `capability/grid-search.mjs` as draws, not generated ones.
- The tick path rate (16.205 evals/s) was measured under contention and includes one
  256 slot genome; the ratio is the fair number because both paths saw the same genomes in
  the same process.
- The union bound is 159/160 and the best is 158/160. Why the 159th task is not reached was
  not investigated.
- Other suites reached by `hostableSuites()` could get a matrix wherever a component's outcome
  on a task is deterministic. Not built.
