# plateau: where the score stops rising, and three ways to push that second later

Board 24A, item plateau (the Board 13 item that never launched); board 26, item plateau-repeat
(the generation budget and the two-run repeat). The loop's held-out score stops rising early
(bench/verdicts/years.json: first plateau at 0.400 s on both planes in 300 s runs). This item
measures where it stops (as a generation, with the wall second printed beside it) on five seeds per
plane, grades three published interventions against the plain control, grades the combination the
singles indicate on five held-out seeds nobody tuned on, and runs the whole bar twice back to back
to measure how far the bar's own numbers move between two runs.

Bar: `node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node
--max-old-space-size=4000 bench/plateau.mjs`, run twice on one build; verdict
`bench/verdicts/plateau.json`: **barMet false**, with every number printed (statementCheck: 62
numbers in the statement, every one printed on a line above). The verdict on disk is bar run 2 of
2 of build 209ce2ca25abcf1f (at 2026-09-27T19:18:26.344Z); every bar number below is that run's
unless a line says run 1 (at 2026-09-27T19:04:47.621Z). Tests: `node --test
test/plateau.test.mjs` 34/34; `node --test test/velocity.test.mjs` 19/19.

## Files

- `generations/plateau.mjs`: the two planes, the arm loop, the three interventions, the readers
  (plateau generation and second, gain after a time, searched gaps in generations and in seconds,
  stats, Spearman), the split (SPLIT, splitSeedStrings, retiredSeedStrings), the combination rule,
  the bar rule, the post-run diagnostic (archiveHeldout, skipped by `runArm({ diagnostic: false })`),
  `describePlane`, the worker boundary (one worker thread per arm), and now BUDGET (the generation
  budget with its derivedFrom), `searchDigest` (a fingerprint of the search a set of runs drew),
  `rerunLedger` (the bar runs of one build carried from the verdict on disk) and `repeatOf` (the
  move of the bar's numbers between those runs).
- `generations/velocity.mjs` (board 24A edit, the archive descriptors only): `MatrixElites` takes an
  optional `descriptor` ({ capacity, binOf(engine, buf, n, count, words) }). Untouched by board 26.
- `bench/plateau.mjs`: the bar. `plateau.json` (no flags, isTheBar true; a second run of the same
  build appends itself to the first run's ledger and grades the repeat); `plateau-partial.json`
  (any flag, isTheBar false: `--wall-s` runs a wall budget, `--generations`, `--row-gens`,
  `--restart-gens`, `--tune-seeds`, `--arm-seeds`, `--fresh-seeds`, `--no-fresh`, `--smoke`);
  `plateau-dev-partial.json` (board 24A's first 60 s development run, kept as history).
- `test/plateau.test.mjs`: 34 tests (22 from board 24A, 12 added by this item: the generation
  budget draws the same search at one seed whatever the clock, a wall budget does not, the restart
  clock in generations, the row cadence, BUDGET's default is the median of its derivedFrom counts,
  searchDigest, rerunLedger (same build only, duplicates dropped), repeatOf and the bar rule with
  the repeat clause, the statement numbers all printed).

## Design

- **Two planes, both non-saturating.** Grid: 4 searched draws of tasks/grid.mjs (6175
  components, 640 tasks), held-out draw of 160, cap 64 slots (Board 10 needed 96 for its 598/640,
  so 64 binds). Synthetic: a COVER plane (`coverPlane`): 384 task families with Zipf weights, 2048
  components each answering a geometric number of families (mean 3) with a reliability in
  [0.7, 1) and fitting a few others wrongly (mean 1.5), 4 searched draws of 256 tasks and one
  fresh draw of 256, cap 48. The planted synthetic plane of years saturates (years.json: 89 to 256
  of 256 on its fresh draw), so no intervention could show a gain on it.
- **The organism-year** is one generation of the whole population (64 children), as declared in
  generations/years.mjs. Organism-years equal generations; the verdict carries the arithmetic.
- **The generation budget** (board 26). Every arm runs exactly 241,675 generations of each plane
  (the planes interleaved one generation each), writes a row every 200 generations, and its
  restart clock counts generations, so the same seed draws the same search whatever else the
  machine is doing; wall time is printed, never budgeted. The default 241,675 is the median of
  the control's generations per plane over the five tuning seeds of the wall-budget bar run whose
  verdict was committed (54ed113, at 2026-09-27T14:29:17.487Z: 241,675, 243,867, 239,221,
  238,353, 274,926 on both planes; BUDGET.derivedFrom holds the counts and the path they were read
  at, and a test checks the median). The row cadence keeps about that run's row count (a row per
  100 ms of its 120 s wall, so the median over that count, rounded to a whole hundred). A
  `--wall-s` run keeps the wall budget for development and writes a partial verdict only.
- **Every arm runs both planes interleaved** for the same generation budget; the arms of one seed
  run side by side as worker threads in one process, sharing contention.
- **The plateau** is the row of the last row-to-row rise of the held-out score, read as a
  generation (the bar's x axis) and as the wall second it fell on (printed). After it the score
  never rises again.
- **The held-out draw decides nothing.** It is read to write a row after the hall of fame (the
  best library by the SEARCHED objective) changes, and after the loop for the diagnostic. A test
  swaps the held-out draw and gets the identical searched trajectory in every arm.
- **NOVELTY**: archive axes from behaviour: length; the share of the RARE tasks solved (the third
  of the answerable tasks with the fewest answering components), cubed; the share of the other
  tasks, cubed; a hash of WHICH rare tasks are solved.
- **TRANSFER**: after each generation two random elites of the other plane's archive are mapped
  into this plane (component index modulo C, cut to the cap) and offered only when they land in
  the SAME cell they held at home.
- **RESTART**: when the running engine's own searched best has not risen for N generations (N =
  RESTART.restartShare 0.1 of the budget = 24,168 generations; `--restart-gens` overrides; under a
  `--wall-s` run N is 12 s of wall, `--restart-s`), a new engine starts from the 16 cells whose
  solved-task vectors are furthest (Hamming) from the best's. The hall of fame lives outside the
  engine, so the best is never lost. The evidence for N is the gaps the control leaves between two
  rises of its searched objective, printed per seed by the bar and held by the verdict; the RESTART
  comment quotes none of them.
- **The combination rule**, fixed before any run: keep an intervention at or above the control's
  mean final held-out on both planes and above on one; combine every kept one; none kept: the
  single one with the largest summed gain as a share of each plane's held-out tasks.
- **The split.** Tuning: run seeds tune-1..5 on planes plateau/tune/*. Held out: heldout-1..5 on
  plateau/heldout/*, built only after the combination is chosen. RETIRED: fresh-1, fresh-2 on
  plateau/fresh/*, exposed by a 3 s smoke run of the earlier build (2026-09-27T01:30Z); no run of
  this build uses them and the bench refuses them. Development runs use `--no-fresh` (stops
  before (c)); the end-to-end check uses `--smoke` (namespace smoke-N, plateau/smoke/*).
- **The bar** (bar.rule in the verdict): on the held-out seeds the chosen combination beats the
  control's mean final held-out by more than the seed noise (the larger sample sd of the two arms)
  on BOTH planes AND its mean plateau generation is later on both; AND the repeat: the bar command
  run back to back on this build moved the combination-minus-control difference by less than the
  smallest seed noise on every plane. One run alone prints "the repeat is not measured" and
  barMet false.
- **The repeat and the ledger.** A bar run reads the verdict on disk, keeps its ledger runs whose
  build hash (sha256 over the 91 source files reachable from bench/plateau.mjs, taken before and
  after the run) equals this build's, drops the others and any duplicate at, appends itself and
  writes the ledger back (`reruns`); `repeat` holds, per plane, each run's difference, noise and
  plateau (generation and second, control and combination) and the move (max minus min) of each,
  the largest move of the difference over the planes, and whether every run drew the same search
  (`searchDigest`: sha256 over every row but its wall time, every restart generation and every
  transfer count of the 30 arm runs).

## Measured

Read before building (board 24A): notes/multiply.md (the plateau and tie-break paragraphs),
bench/years.mjs, bench/verdicts/years.json and multiply.json (statements), generations/velocity.mjs,
generations/archive.mjs, the earlier build of this item (its 3 s partial verdict). Published way
(two searches): MAP-Elites (Mouret and Clune, arXiv 1504.04909: behaviour niches keep stepping
stones), restart schedules (IPOP/BIPOP-CMA-ES: restart on stagnation, IPOP doubles the
population per restart). IPOP was not adopted: a doubled population halves the organism-years
per evaluation under the declared year, so the x axis would change under the arm.

Read for board 26: the verify findings of board 24A, this file, bench/plateau.mjs whole,
generations/plateau.mjs (header, runArm, the restart clock, the readers), the verdict on disk
(keys, statement, the per-plane numbers, the control's generations per plane on the five tuning
seeds), the memory "external bench repeatability" (a re-run of the same arm moves further than the
arms move), test/plateau.test.mjs and test/velocity.test.mjs (how a plane and a clock are planted).

Development runs (tuning seeds only, board 24A, wall budget):

1. `bench/plateau.mjs --wall-s 60 --tune-seeds 3 --arm-seeds 3 --no-fresh` (kept as
   plateau-dev-partial.json): no single kept; grid control 122.00 +- 0.00, synthetic 225.00 +-
   6.08.
2. A greedy max-coverage reference (the builder's scratch script, output not on disk, first fit,
   append the component with the most new right answers): synthetic 861/1024 searched, 199/256
   held-out; grid 562/640, 122/160. The evolved control beats greedy on the searched score on both
   planes.
3. `--smoke --wall-s 3 --tune-seeds 2 --arm-seeds 2 --fresh-seeds 2`: the whole path, exit 0.
4. After the bar missed: `--wall-s 120 --tune-seeds 5 --arm-seeds 0 --no-fresh` (controls only,
   plateau-partial.json), for the held-out-free pick below.

Development runs (board 26, generation budget): `--smoke` runs of the whole path at small budgets
(exit 0, partial verdicts overwritten by later runs), and the two bar runs below.

The bar (bar run 2 of 2, at 2026-09-27T19:18:26.344Z: wall 809.4 s, peak rss 386 MB, 0 model
calls, exit 0; 30 arm runs took 108.2 to 186.1 s of wall each, mean 139.4 s, printed, never
budgeted):

- (a) the control, 5 tuning seeds, 241,675 generations of each plane: grid plateau generation
  28,241 +- 18,392 (range 5,801 to 53,001; 13.57 +- 8.04 s of wall, range 2.80 to 23.22), final
  122.40 +- 0.89 of 160; synthetic plateau generation 138,081 +- 80,379 (44,001 to 238,201; 77.08
  +- 46.82 s, range 21.18 to 131.28), final 224.60 +- 4.51 of 256. The SEARCHED score kept rising
  after the held-out one stopped: searched plateau generation 42,321 +- 27,388 (21.47 +- 15.62 s)
  on grid and 204,881 +- 33,117 (116.91 +- 17.01 s) on synthetic. After its own plateau the
  control's held-out moved -0.848 +- 1.896 (grid) and -6.790 +- 12.547 (synthetic) per million
  organism-years: it falls, it does not hold. The control's longest gap between searched rises,
  per seed: 52,000, 4,600, 20,200, 15,000, 26,800 generations (30.4, 2.5, 9.6, 7.4, 12.1 s) on
  grid and 41,400, 50,200, 76,000, 145,600, 112,600 generations (25.0, 29.8, 44.6, 86.9, 63.9 s)
  on synthetic; N = 24,168 generations sits inside that range.
- (b) singles, final held-out against the control (grid; synthetic): novelty 121.00 vs 122.40;
  224.20 vs 224.60. Transfer 122.20; 224.40. Restart 122.00; 222.80. Plateau generation: novelty
  3,041 vs 28,241 and 126,081 vs 138,081; transfer 27,801 vs 28,241 and 142,681 vs 138,081;
  restart 56,041 vs 28,241 and 125,361 vs 138,081. Novelty raised the searched score on synthetic
  (966.20 vs 959.80) and not the held-out one; under the generation budget its descriptor costs
  wall, not organism-years (172 to 186 s per run against the control's 133 to 139 s, both
  241,675 generations). Transfer tried 2,416,740 migrants into grid and 2,416,750 into synthetic
  over the 5 seeds, matched 13,050 and 4,257, accepted 2 and 1: between planes that share no
  components it carries nothing. Restart fired 21 times on grid (3, 4, 5, 5, 4 per seed) and 13 on
  synthetic (2, 3, 3, 2, 3).
- (c) no single was kept, so the fallback graded transfer on heldout-1..5: grid 118.00 vs 119.20
  (noise 3.16), plateau generation 12,001 vs 56,361 (5.65 vs 28.65 s); synthetic 216.40 vs 217.80
  (noise 7.05), plateau generation 92,601 vs 80,801 (47.64 vs 40.73 s). **Not met.** Transfer is
  nearly a no-op (it accepted 1 and 1 of the 2,416,740 and 2,416,750 migrants it tried on the
  held-out seeds, matched 13,438 and 12,461), so this is a control against itself plus the time
  the probes cost.

Why it missed (the diagnostic, read by no decision, after each control run of the bar): the
final archive held a library that generalizes better than the pick, by 3.20 +- 2.59 held-out
tasks on grid and 2.60 +- 2.41 on synthetic (an oracle pick that uses the held-out draw), with a
Spearman of 0.697 +- 0.094 and 0.825 +- 0.074 between searched fitness and held-out over the top
50 elites. The held-out-free pick (the best worst-draw count among the top 50) gained 0.00 +-
1.22 (grid) and 0.00 +- 0.00 (synthetic) over the pick. So the plateau of the held-out score is a
GENERALIZATION plateau, not a search plateau: more organism-years raise the searched score and
not the held-out one, and none of the three search interventions changes what the searched draws
can teach. What moved held-out in years was more DATA (growth ingesting new draws: 49 to 148 with
growth against 109 without, years.json), not more search on the same draws.

## Repeat (board 26, item plateau-repeat)

The bar command was run twice back to back on build 209ce2ca25abcf1f (91 source files reachable
from bench/plateau.mjs; the hash taken before and after each run, changedDuringRun false), one at
a time through tools/budget.mjs, on a machine shared with this board's other builders, board 24a
and the orchestrator's GSM8K rung. The lines, verbatim:

Run 1 (at 2026-09-27T19:04:47.621Z; wall 861.8 s, peak rss 402 MB; 30 arm runs took 110.1 to
203.0 s of wall each, mean 151.4 s):

    [bar] grid: transfer minus control -1.20 against noise 3.16 (beats: false); plateau generation 12,001 against 56,361 (later: false); plateau second 5.61 s against 31.77 s (wall, printed, not the bar)
    [bar] synthetic: transfer minus control -1.40 against noise 7.05 (beats: false); plateau generation 92,601 against 80,801 (later: true); plateau second 53.63 s against 45.07 s (wall, printed, not the bar)
    [repeat] ONE bar run of this build is on disk: the repeat is not measured, so barMet is false until the bar command runs again on this build
    [bar] barMet false: the combination bar is not met and the repeat is not measured

Run 2 (at 2026-09-27T19:18:26.344Z; wall 809.4 s, peak rss 386 MB):

    [bar] grid: transfer minus control -1.20 against noise 3.16 (beats: false); plateau generation 12,001 against 56,361 (later: false); plateau second 5.65 s against 28.65 s (wall, printed, not the bar)
    [bar] synthetic: transfer minus control -1.40 against noise 7.05 (beats: false); plateau generation 92,601 against 80,801 (later: true); plateau second 47.64 s against 40.73 s (wall, printed, not the bar)
    [reruns] the bar verdict on disk (at 2026-09-27T19:04:47.621Z) carried 1 ledger run(s); this is bar run 2 of build 209ce2ca25abcf1f (dropped 0 run(s) of other builds, 0 duplicate(s)); the combination bar met in 0 of 2; combinations transfer 2
    [repeat] grid run 1 of 2 (at 2026-09-27T19:04:47.621Z): transfer minus control -1.20, noise 3.16, plateau second 5.61 s against 31.77 s, plateau generation 12,001 against 56,361
    [repeat] grid run 2 of 2 (at 2026-09-27T19:18:26.344Z): transfer minus control -1.20, noise 3.16, plateau second 5.65 s against 28.65 s, plateau generation 12,001 against 56,361
    [repeat] grid: the difference moved 0.00 between the runs against a smallest noise of 3.16 (under the noise: true); the plateau second moved 0.03 s (transfer) and 3.13 s (control); the plateau generation moved 0 and 0
    [repeat] synthetic run 1 of 2 (at 2026-09-27T19:04:47.621Z): transfer minus control -1.40, noise 7.05, plateau second 53.63 s against 45.07 s, plateau generation 92,601 against 80,801
    [repeat] synthetic run 2 of 2 (at 2026-09-27T19:18:26.344Z): transfer minus control -1.40, noise 7.05, plateau second 47.64 s against 40.73 s, plateau generation 92,601 against 80,801
    [repeat] synthetic: the difference moved 0.00 between the runs against a smallest noise of 7.05 (under the noise: true); the plateau second moved 5.98 s (transfer) and 4.34 s (control); the plateau generation moved 0 and 0
    [repeat] largest move of the difference 0.00 (grid), under the noise on both planes: true; the 2 runs drew the same search (digests equal): true
    [bar] barMet false: the combination bar is not met and the repeat is under the noise

Both runs drew the same search (searchDigest f8e37dd0a3a01585 in both: every row but its wall
time, every restart generation and every transfer count of the 30 arm runs). Every score, every
plateau generation and every difference is identical between the runs; only the wall seconds
moved (the plateau second by 0.03 to 5.98 s, the tuning control's plateau second 13.57 to
16.21 s), and the wall is printed, not graded. So the bar is now repeatable on a shared machine
by construction, and its verdict stands on both runs: transfer does not beat the control on either
plane, and the plateau is later on synthetic only. barMet false, the honest landing.

What this item fixed from the board 24A verify findings: (1) the statement said "read every 0.1 s"
while the run printed "rows every 100 ms"; the statement now names the row cadence the run ran
(a row every 200 generations) and statementCheck lists its 62 numbers, every one printed on a
line above; (2) the RESTART comment quoted gaps ("longest gaps 30.3, 2.5, 10.9 s ...") no verdict
on disk held; it now quotes no numbers and points at the printed per-seed lines and the verdict;
(3) these notes cited a verdict the verify re-run had overwritten; every number above is the
verdict on disk, stamped by its at field; (4) the wall budget made a re-run draw a different
search (the synthetic "later" flipped between the builder's run and the verify run); the
generation budget makes the same seed draw the same search, and the repeat is measured, not
assumed.

## Open

- A pick or an objective that recovers part of the oracle gap (3.20 / 2.60 tasks in the bar run)
  without the held-out draw: the worst-draw pick did not; cross-draw validation (search on 3
  draws, pick on the 4th) is the next candidate. It must be fixed before any held-out draw is read.
- Transfer between planes that share components (two grid suites, not grid and cover) is the
  test that could carry something; between unrelated planes it accepted 2 and 1 of the 2,416,740
  and 2,416,750 it tried on the tuning seeds.
- The repeat measures the move between two runs of ONE build; a third run would say whether the
  wall seconds' spread (3 to 6 s here) is typical. The bar does not ask for it.
- The RESTART comment in generations/plateau.mjs names the verdict path of the searched gaps as
  `measure.<plane>.searchedGaps`; they live at `runs.tune[i].planes.<plane>.searchedGaps` and
  `.searchedGapsGen`. Fixing the comment changes the build hash (the file is in the closure), so
  it waits for the next build of this bench and its own two runs.

## Model calls

None. Every item on this board is MODEL OFF (provider null, no socket).
