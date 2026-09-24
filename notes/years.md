# years: organism-years, declared once, earned continuously

His words, 2026-09-23 (section A): "It also needs to evolve over billions of years in a bunch of
seconds", and the same day: "it isnt just some statistical flex. Its supposed to actually work
to land it in the timeframe of peak efficiency and iterate that quickly."

This item answers both halves with one rule: a count of years is never printed without its
arithmetic, and the score it is quoted against is a score on data the loop never searched.

Files: `generations/years.mjs` (the declaration, the plateau, the sources, the run),
`bench/years.mjs`, `test/years.test.mjs`, `bench/verdicts/years.json`, this note.
`generations/velocity.mjs` and `daemon/run.mjs` were read and not edited.

## The declaration

**One organism-year is one generation of the whole population on a plane**, so organism-years
equal generations. A generation is the popSize children a `MatrixElites` generation makes and
scores: 64 children, 64 evaluations. When the loop starts a new arm it re-scores the elites it
carries; those are evaluations and never years. `yearsArithmetic()` is the only place the
conversion happens and returns the count with its sentence. `projectSeconds()` turns a measured
generation rate into seconds to a target count and writes the word "projection" into its own
text.

This is not `velocity.mjs declaredYears()` (evaluations x ticks the tick path measured x a
declared seconds per tick). That older declaration stays where it is; this file never mixes the
two.

## The continuous run

`yearsRun(source, { wallMs })` runs the matrix path of `velocity.mjs` with Board 10's
multi-draw objective (the mean over K draws, `stackDraws`) until the wall budget ends. Every
100 ms it writes a row: generations, evaluations, the searched score of the archive's best, and
that same library's score on the FRESH draws.

**Two planes velocity.mjs hosts:**

- **grid**: `tasks/grid.mjs` as an unbounded stream of draws. Draw 0 is `grid/velocity`, draw k
  is `grid/velocity:draw<k>` (Board 10's `drawSeeds`). Fresh: `grid/velocity:heldout` (the fresh
  draw Boards 8 and 10 printed), and `grid/velocity:years1`, `grid/velocity:years2`, never
  printed before this bench. The bench counts how many fresh tasks appear verbatim in the draws
  a run searched.
- **synthetic**: `velocity.mjs syntheticMatrix` (planted components, decoys, a known optimum) cut
  into 64 searched slices and 2 fresh slices of 256 tasks. Every slice is the Board 8 landscape
  in distribution; the planted set solves every slice whole (a test checks it).

**The fresh score is held out by construction.** The loop reads it only to write a row. The
plateau, the growth choice and the arm seeds depend on the searched score, the wall clock and
the library length. The test "the fresh draws are read for rows only" runs the same loop on a
counter clock with and without fresh draws and compares generations, evaluations, every plateau,
every searched score and the final library: identical.

## The plateau and what the loop does there

`RatePlateau`: the searched score (mean tasks per draw minus length / 257) is compared with the
latest row at or before one window ago; the rate is the difference over the seconds between.
**Declared: window 250 ms, floor 0.1 task per wall second.** It fires once per arm.

At the plateau the loop GROWS, on the matrix path, then starts a new arm carrying every elite:

- **widen**: the best library is within 2 slots of the cap, so lmax grows by 32 (to at most 256);
- **ingest**: the next draw joins the searched stack, and past 8 draws the oldest is retired (a
  sliding window of data at a fixed cost per evaluation);
- **spawn**: no next draw is ready, so a new arm with a new seed. A worker thread builds the
  next grid draw while the search runs (about 1.4 s per draw), and the loop never waits for it.

With growth off it prints `plateau: no growth hook` and runs on. That is the control.

**The daemon.** Board 10's continuous loop (`daemon/run.mjs`) already runs a generations step per
period (organism `Epochs` in its worker). Its `LoopPlateau` switches to growth (spawn, ingest,
dream) when a coordinate stops moving. Those steps act on a live Brain, not on a matrix, so this
loop does not call them. It uses the daemon's exposed hook instead: the bench raises a bench flag
(`raiseBenchFlag`), and the daemon refuses self-code while the flag is up.
`daemon/run.mjs` is not edited.

## Development numbers, not the bar

The builder made two choices and recorded them as made on development seeds (`years/dev`,
`years/dev2`, `years/synthetic-dev`):

- **8 draws over 4** (60 s runs, window 2000 ms). Fresh 145 against 141 on `years/dev`, 140
  against 131 on `years/dev2`.
- **Window 250 ms over 500 and 2000** (60 s runs, 8 draws). Mean fresh over the two dev seeds:
  146.5 at 250, 141.0 at 500, 143.0 at 2000. One seed each; the noise is about 5 tasks, so this
  choice is weak.

At a 2000 ms window the first plateau fired at 2.101 s with rate 0.0000: the searched score had
stopped moving within about 0.1 s, and every arm idled most of its window. That is why the window
came down.

**The bar seeds were NOT blind.** An earlier version of this note said no bar seed was run while
choosing. That was wrong. A 3 s smoke run at 2026-09-24T08:26:12Z (`node bench/years.mjs
--budgets 3 --control-s 3`, window 2000 ms, file `bench/verdicts/years-partial.json`, kept) printed
every bar fresh draw. The 250 ms window was chosen after it, so that choice cannot be certified
blind to the bar seeds. Later runs also printed them: the builder's killed bar (pid 10428), the
verify plane's reduced run, and a 1 s smoke of this fix stage (its seed was left at the default by
mistake). None of those was followed by a change to a search parameter. The verdict carries the
list as `development.barSeedsSeenInDevelopment: true` and `development.barSeedExposures`. The
public stage should treat `grid/velocity:heldout`, `:years1` and `:years2` as development records
from now on, and should draw new fresh seeds for any held-out number it prints.

## When the prefetch worker fails

The search loop never yields to the event loop, so a Worker `error` or `exit` event cannot reach
it while it runs. The builder's version saved the error in a handler that could not fire, and a
worker that died left every later ingest as a spawn, silently. Now:

- the worker catches its own failure and posts it on the port the loop polls; `drain()` reads it
  into `Prefetcher.error`, and a failed draw is never handed out as ready;
- a worker that answers nothing for `prefetchStallMs` (20 s; a grid draw takes about 1.5 s) is
  written off by the loop's own clock, which covers a killed or out-of-memory worker;
- once written off, the loop builds each later draw itself, and the run reports it in
  `prefetch.down` (the reason, the draw, the second);
- the worker is closed in a `finally`, so a throw from the search or from a draw closes it too.

The bench prints one `prefetch worker:` line per run: draws asked, delivered, failed, and whether
the worker was written off.

## Mutants

Nine mutants, each planted exactly once in `generations/years.mjs`, then the test file run, then
the file restored and compared with `cmp`. They were run in the scratchpad (`years-mutants.sh`)
before the bar started, never during it, because the prefetch worker re-reads this file from disk
at every run.

- **First pass: 8 of 9 killed.** M1 carried elites counted as years; M3 wall budget ignored until
  twice over; M4 rate against the arm start; M5 projection divides the wrong way; M6 drain ignores
  a posted failure; M7 worker not closed on the way out; M8 stall clock never runs out; M9 a
  failed worker still counts as building.
- **M2 survived:** a plateau that reads the fresh score instead of the searched score. On the
  synthetic plane both scores went flat at the same row, so the existing test could not see the
  difference. A new test gives the run a fresh draw that never moves. It checks that the searched
  score was still rising at the first sample the rule could judge, which is the condition M2
  needs. Then it requires the same plateaus with and without that fresh draw. With M2 planted:
  17 pass, 1 fail. Restored: `cmp` identical.
- **Final pass, on the code the bar ran, after the bar: 9 of 9 killed** (18 tests: M1 2 fail,
  M2 1, M3 1, M4 6, M5 1, M6 2, M7 2 plus a 150 s timeout because the open worker kept the
  process alive, M8 1, M9 2). Restored: `cmp` identical. The unmutated file: 18 pass, 0 fail.

## The bar: MET (bench/verdicts/years.json, at 2026-09-24T09:22:14Z)

Command: `node tools/budget.mjs --ram-mb 6000 --wait-free-ram-mb 16384 --status-s 120 --record
state/budget/years-bar.json -- node --max-old-space-size=4096 bench/years.mjs`. Exit 0, 1050.44 s
wall, peak RAM 398.1 MB by the wrapper (400.1 MB process maxRSS, the worker included). No model
was called. Other builders' benches ran at the same time, so every rate is a contended wall-clock
rate.

```
[bar] grid 300 s: grid/velocity:heldout 49 -> 148, 140.538 per million organism-years (above zero), plateau at 0.400 s, projection carries its arithmetic; synthetic 300 s: years/synthetic:fresh0 89 -> 256, 172.642 per million organism-years (above zero), plateau at 0.400 s, projection carries its arithmetic: MET
[control] grid 300 s, same seeds: growth on 49 -> 148 on grid/velocity:heldout (140.538 per million organism-years, 704,435 organism-years); growth off 49 -> 109 (11.543 per million organism-years, 5,198,000 organism-years)
```

| run | organism-years | generations per wall second | fresh (first draw) | per million organism-years |
|---|---|---|---|---|
| grid 10 s | 75,309 | 7530.8 | heldout 49 -> 144 | 1261.469 |
| grid 60 s | 189,380 | 3156.3 | heldout 49 -> 148 | 522.758 |
| grid 300 s | 704,435 | 2348.1 | heldout 49 -> 148 | 140.538 |
| synthetic 10 s | 54,465 | 5446.4 | fresh0 89 -> 256 | 3066.189 |
| synthetic 60 s | 229,732 | 3828.9 | fresh0 89 -> 256 | 726.934 |
| synthetic 300 s | 967,321 | 3224.4 | fresh0 89 -> 256 | 172.642 |
| control grid 300 s, growth off | 5,198,000 | 17326.7 | heldout 49 -> 109 | 11.543 |

Projection, grid 300 s: 1,000,000,000 organism-years / 2,348.1 generations per wall second
(measured: 704,435 generations in 300.000 s) = 425,874 s (118.3 h). That is a projection, not a
measurement. Measured: 704,435 organism-years in 300.000 s. The prefetch worker was asked for 181
draws and delivered 180; none failed, and it was never written off.

## Read this before quoting the bar

- **"Above zero" is a weak bar.** One gained task passes it. On the grid plane the score per
  million organism-years falls with budget (1261.469, 522.758, 140.538). The fresh score levels
  off while the years keep growing in step with the wall. On the grid plane the heldout score
  peaked at 154/160 at 115.355 s and ended at 148, so from half the wall to the end it moved -1. On
  the synthetic plane every fresh slice reached the optimum, 256/256, at 0.100 s, and the rest of
  the 300 s ran at that ceiling.
- **The plateau second measures the rule's window, not the search.** It was 0.400 s on every run.
  The searched score last rose at 0.100 s, and a 0.25 s window cannot fire until one flat window
  has passed.
- **The gain comes from growth, and growth costs speed.** With growth off, the same seeds ran
  17326.7 generations per wall second against 2348.1 with growth on, and stopped at 109 on
  heldout. With growth on (180 ingested draws, 4 widenings) the run reached 148. The billion-year
  projection is a statement about speed only; the fastest loop is the one that learns least.
- Runs are not bit-reproducible. Plateaus fall on the wall clock, and the prefetch timing changes
  the order of the arms. Earlier runs of the same command ended the grid 10 s run on a different
  heldout score.

## Next rung

1. Grade on a plane that does not reach its ceiling within 300 s. The ARC-AGI evaluation split
   on the grid DSL is one; most of it times out today. Keep the verdict's `secondHalfGain` beside
   the bar. It is -1 on grid and 0 on synthetic tonight.
2. New fresh seeds, drawn by the public stage and never printed by this item.
3. A plateau rule whose earliest second is not fixed by its own window.
