# plateau: where the score stops rising, and three ways to push that second later

Board 24A, item plateau (the Board 13 item that never launched). The loop's held-out score stops
rising early (bench/verdicts/years.json: first plateau at 0.400 s on both planes in 300 s runs).
This item measures that second at 0.1 s resolution on five seeds per plane, grades three published
interventions against the plain control, and grades the combination the singles indicate on five
held-out seeds nobody tuned on.

Bar: `node bench/plateau.mjs` (through tools/budget.mjs), verdict `bench/verdicts/plateau.json`:
**barMet false**, with every number printed. The verdict on disk is the fix-pass run (at
2026-09-27T14:13:50.056Z); every bar number below is that run's. Tests: `node --test
test/plateau.test.mjs` 22/22; `node --test test/velocity.test.mjs` 19/19 after the descriptor hook.

## Files

- `generations/plateau.mjs` (new): the two planes, the arm loop, the three interventions, the
  readers (plateau second, gain after a time, searched gaps, stats, Spearman), the split (SPLIT,
  splitSeedStrings, retiredSeedStrings), the combination rule, the bar rule, the post-run
  diagnostic (archiveHeldout, skipped by `runArm({ diagnostic: false })` so a test can compare a
  run without it), `describePlane` (a plane in words, read off the built plane) and the worker
  boundary (one worker thread per arm).
- `generations/velocity.mjs` (edited, the archive descriptors only): `MatrixElites` takes an
  optional `descriptor` ({ capacity, binOf(engine, buf, n, count, words) }). Without one the four
  default axes key the archive exactly as before. Scoring and selection are untouched.
- `generations/archive.mjs`: read, unchanged (it is the organism-genome archive; the matrix path
  this item measures uses MatrixElites).
- `bench/plateau.mjs` (new): the bar. `plateau.json` (no flags, isTheBar true);
  `plateau-partial.json` (any flag, isTheBar false; now the controls-only development run below);
  `plateau-dev-partial.json` (the first 60 s development run, kept because the restart N cites it).
- `test/plateau.test.mjs` (new): 22 tests.

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
- **Every arm runs both planes interleaved** (one generation of each in turn) for the same wall;
  the arms of one seed run side by side as worker threads in one process, sharing contention.
- **The plateau second** is the time of the last row-to-row rise of the held-out score (rows
  every 100 ms of wall). After it the score never rises again.
- **The held-out draw decides nothing.** It is read to write a row after the hall of fame (the
  best library by the SEARCHED objective) changes, and after the loop for the diagnostic. A test
  swaps the held-out draw and gets the identical searched trajectory in every arm.
- **NOVELTY**: archive axes from behaviour: length; the share of the RARE tasks solved (the third
  of the answerable tasks with the fewest answering components), cubed; the share of the other
  tasks, cubed; a hash of WHICH rare tasks are solved.
- **TRANSFER**: after each generation two random elites of the other plane's archive are mapped
  into this plane (component index modulo C, cut to the cap) and offered only when they land in
  the SAME cell they held at home.
- **RESTART**: when the running engine's own searched best has not risen for N s (`--restart-s`,
  default 12), a new engine starts from the 16 cells whose solved-task vectors are furthest
  (Hamming) from the best's. The hall of fame lives outside the engine, so the best is never lost.
- **The combination rule**, fixed before any run: keep an intervention at or above the control's
  mean final held-out on both planes and above on one; combine every kept one; none kept: the
  single one with the largest summed gain as a share of each plane's held-out tasks.
- **The split.** Tuning: run seeds tune-1..5 on planes plateau/tune/*. Held out: heldout-1..5 on
  plateau/heldout/*, built only after the combination is chosen. RETIRED: fresh-1, fresh-2 on
  plateau/fresh/*, exposed by a 3 s smoke run of the earlier build (2026-09-27T01:30Z); no run of
  this build uses them and the bench refuses them. Every development run used `--no-fresh` (stops
  before (c)); the end-to-end check used `--smoke` (namespace smoke-N, plateau/smoke/*).
- **The bar**: the combination beats the control's final by more than the seed noise (the larger
  sample sd of the two arms) on BOTH planes AND its mean plateau second is later on both.

## Measured

Read before building: notes/multiply.md (the plateau and tie-break paragraphs), bench/years.mjs,
bench/verdicts/years.json and multiply.json (statements), generations/velocity.mjs,
generations/archive.mjs, the earlier build of this item (its 3 s partial verdict). Published way
(two searches): MAP-Elites (Mouret and Clune, arXiv 1504.04909: behaviour niches keep stepping
stones), restart schedules (IPOP/BIPOP-CMA-ES: restart on stagnation, IPOP doubles the
population per restart). IPOP was not adopted: a doubled population halves the organism-years
per evaluation under the declared year, so the x axis would change under the arm.

Development runs (tuning seeds only):

1. `bench/plateau.mjs --wall-s 60 --tune-seeds 3 --arm-seeds 3 --no-fresh` (kept as
   plateau-dev-partial.json): no single kept; grid control 122.00 +- 0.00, synthetic 225.00 +-
   6.08. N = 12 s was set from the gaps between searched rises that run printed (its build did
   not write the gaps into the verdict, so they are not on disk; the bar run's gaps are below).
2. A greedy max-coverage reference (the builder's scratch script, output not on disk, first fit, append the component with the
   most new right answers): synthetic 861/1024 searched, 199/256 held-out; grid 562/640, 122/160.
   The evolved control beats greedy on the searched score on both planes.
3. `--smoke --wall-s 3 --tune-seeds 2 --arm-seeds 2 --fresh-seeds 2`: the whole path, exit 0.
4. After the bar missed: `--wall-s 120 --tune-seeds 5 --arm-seeds 0 --no-fresh` (controls only,
   now plateau-partial.json), for the held-out-free pick below.

The bar (`bench/plateau.mjs` through tools/budget.mjs, the fix-pass run at
2026-09-27T14:13:50.056Z: wall 615.5 s, peak rss 403 MB, 0 model calls, exit 0):

- (a) the control, 5 tuning seeds, 120 s: grid plateau second 11.49 +- 6.98 s (range 2.2..19.6),
  final 122.40 +- 0.89 of 160; synthetic 61.22 +- 35.26 s (18.9..101.7), final 225.00 +- 4.53 of
  256. The SEARCHED score kept rising after the held-out one stopped: searched plateau 17.84 +-
  12.37 s (grid) and 91.54 +- 12.87 s (synthetic). After its own plateau second the control's
  held-out moved -0.769 +- 1.720 (grid) and -5.934 +- 10.926 (synthetic) per million
  organism-years: it falls, it does not hold. The control's longest gap between searched rises,
  per seed: 23.9, 2.1, 9.0, 6.3, 10.3 s (grid) and 19.4, 23.3, 34.6, 66.4, 45.3 s (synthetic);
  N = 12 s sits inside that range.
- (b) singles, final held-out against the control (grid; synthetic): novelty 121.00 vs 122.40;
  224.40 vs 225.00. Transfer 122.20; 224.80. Restart 121.60; 224.00. Plateau second: novelty 1.8
  vs 11.5 s and 48.5 vs 61.2 s; transfer 11.5 vs 11.5 s and 64.7 vs 61.2 s; restart 15.6 vs 11.5
  s and 39.6 vs 61.2 s. Novelty raised the searched score on synthetic (965.40 vs 960.00) and not
  the held-out one; it ran 205,029 organism-years per run to the control's 272,534 (its
  descriptor costs). Transfer tried 2,669,104 migrants into grid and 2,669,114 into synthetic
  over the 5 seeds, matched 14,175 and 4,553, accepted 2 and 1: between planes that share no
  components it carries nothing. Restart fired 22 times on grid and 11 on synthetic.
- (c) no single was kept, so the fallback graded transfer on heldout-1..5: grid 118.00 vs 119.20
  (noise 3.16), plateau 4.7 vs 25.1 s; synthetic 216.40 vs 217.80 (noise 7.05), plateau 42.7 vs
  35.8 s. **Not met.** Transfer is nearly a no-op (it accepted 1 and 1 of the 2,575,546 and
  2,575,556 migrants it tried on the held-out seeds), so this is a control against itself plus
  the time the probes cost.

Why it missed (the diagnostic, read by no decision, after each control run of the bar): the
final archive held a library that generalizes better than the pick, by 3.20 +- 2.59 held-out
tasks on grid and 2.80 +- 2.17 on synthetic (an oracle pick that uses the held-out draw), with a
Spearman of 0.698 +- 0.092 and 0.828 +- 0.071 between searched fitness and held-out over the top
50 elites. The held-out-free pick (the best worst-draw count among the top 50) gained 0.00 +-
1.22 (grid) and 0.00 +- 0.00 (synthetic) over the pick, in the bar run and in development run 4
alike. So the plateau of the held-out score is a GENERALIZATION plateau, not a search plateau:
more organism-years raise the searched score and not the held-out one, and none of the three
search interventions changes what the searched draws can teach. What moved held-out in years was
more DATA (growth ingesting new draws: 49 to 148 with growth against 109 without, years.json),
not more search on the same draws.

## Fix pass (board 24A verify findings)

- The statement named the plane constants as literals (64 children, 4 draws of 160, cap 64, 2048
  components, 384 families, cap 48), and 384 was printed by no line. Now `describePlane` reads
  every number off the built plane and the cap passed in; the `[planes]` lines print those words
  (`2048 generated components over 384 task families`) and the statement is built from the same
  call and from ENGINE.popSize, so the statement names only what the run printed. A test builds a
  non-default cover plane (40 families, 256 components, 2 draws of 64, cap 12) and a 2-draw grid
  plane and checks that the words name their numbers and none of the defaults.
- The archiveHeldout test claimed its rows were "the rows of a run without it" while both runs ran
  the diagnostic. `runArm` now takes `diagnostic: false`; the test compares a run with it against
  a run without it (rows, final row, best, generations) and checks the switch took effect, and it
  snapshots the engine and the hall of fame around archiveHeldout (nothing written). Three mutants
  (the switch ignored, the diagnostic writing the engine, a literal draw count in describePlane)
  each turn one test red.
- The bench is cut by the wall clock on a shared machine, so a re-run does not reproduce the
  numbers: the synthetic "later" comparison was false in the builder's run and true in the verify
  re-run (at 2026-09-27T13:59:26.265Z) and in this run. The tuning control's grid final held
  (122.40 +- 0.89 in the builder's run and in this one). barMet false and the transfer fallback
  reproduced every time. The statement now says a re-run moves the numbers and names the at field
  as their stamp.
- The bar was re-run after every edit of this pass; the earlier notes cited a run whose verdict the
  verify re-run had overwritten. Every bar number above is the verdict on disk.

Read for this pass: the verify findings, bench/plateau.mjs (the statement and the plane lines),
generations/plateau.mjs (runArm, archiveHeldout, the plane builders), generations/velocity.mjs
(stackDraws: tasksPerDraw), the three verdicts on disk (their at, command and diagnostic fields).

## Open

- A pick or an objective that recovers part of the oracle gap (3.20 / 2.80 tasks in the bar run) without the
  held-out draw: the worst-draw pick did not; cross-draw validation (search on 3 draws, pick on
  the 4th) is the next candidate. It must be fixed before any held-out draw is read.
- Transfer between planes that share components (two grid suites, not grid and cover) is the
  test that could carry something; between unrelated planes it accepted 2 and 1 of the 2,669,104
  and 2,669,114 it tried on the tuning seeds.
- The re-run spread of the bar itself (the same command twice) is not measured; the runs so far
  agree on the verdict and not on the plateau seconds. A generation-count budget instead of a
  wall budget would make a run repeatable, at the cost of the wall-second x axis the bar names.

## Model calls

None. Every item on this board is MODEL OFF (provider null, no socket).
