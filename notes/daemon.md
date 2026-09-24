# notes/daemon.md

This note owns the item "daemon" on Board 10. The item covers his P5, "5 percent every second... self growing self improving self
compressing self iterating", and P13, "lives 24/7, sandboxed". The files are:

- `daemon/run.mjs` (the loop, the ruler, the plateau switch and the bench flag);
- `core/ledger.mjs`, **the ledger module** (disk policy, rotation, the summary rows);
- `bench/daemon.mjs`, `test/daemon.test.mjs` and `bench/verdicts/daemon.json`;
- this note.

Every number below was printed by `node bench/daemon.mjs`, `node --test test/daemon.test.mjs`, or a
probe named where it is quoted.

## What was built

### (a) The ledger writes a summary unless told otherwise

`core/ledger.mjs` keeps two policies apart:

- **What the brain logs in memory.** This is `Brain.ledgerLevel`: `full`, `runs` or `off`.
  The ring, the counts per event type and the listeners are unchanged, so the dream region
  and every in-process reader see what they saw before.
- **What reaches the disk.** This is the new ledger `mode`, `summary` or `full`, plus a
  byte budget.

In `summary` mode nothing appended is written. Only these rows reach the file:

- `note()` rows: the daemon's `daemon.step` and `daemon.checkpoint` lines;
- one `ledger.counts` row per flush. It gives the seq range `from..to`, the number of
  events, and the count per type since the last counts row.

A flush after nothing but notes writes no counts row. Every seq the brain logged is therefore
on disk exactly once: inside a counts range, or as a row of its own. The test checks this seq
by seq.

`summary` is the default. `ledger=full` needs a budget, taken from the first of these that is
set:

1. the `ledgerBudgetMb` option;
2. `--ledger-budget-mb N` (or `=N`) on the command line;
3. `BRAIN_LEDGER_BUDGET_MB`;
4. a policy a supervisor registered for that directory.

Without a budget, `full` is written as `summary` and the daemon prints why: "ledger=full needs
--ledger-budget-mb N (an unbounded full ledger once wrote 1 TB)". A summary ledger also gets a
64 MB budget, so no mode is unbounded.

Rotation keeps two segments, `ledger.jsonl` and `ledger.1.jsonl`, each capped at half the
budget. Before this item, one drain was written whole: the brain drains 2000 lines at a time,
so a single drain could carry a segment past its half. The test caught it at 264,355 B
against a 262,144 B budget.

A drain now packs its lines into chunks, each sized to what is left of the live segment,
and rotates between chunks. A single line longer than a whole segment is the only way past
the budget. The ledger also keeps `maxDiskBytes`, the high-water mark of both segments
together, taken after every write. The rotation proof uses that number, which does not depend
on a poller's sampling.

On reopen, the seq resumes from the live segment, or from `ledger.1.jsonl` when a rotation
left the live file empty.

### (b) The loop

With the loop on (`loopEvery`, default 200 ticks in an unbounded run), each period runs the
following steps, unless an ask is active (`askActive`), in which case the period is skipped
and counted:

- **generations** (generations mode): one step of the generations self loop, in a worker
  thread capped at `genHeapMb`. The elite is promoted through the gate (`promoteElite`),
  as before.
- **dream**: the Board 9 hook (`attachDream`, one import, one call site). It cycles once per
  period (`dreamEvery` defaults to `loopEvery`).
- **spawn**: `genome/spawn.mjs spawnAsk` on the first suite question the last ruler row found
  missing. A question is missing when its plan has circuits and the organism's own cells do
  not carry it.
- **ingest** (growth mode): `ingestBatch` (32) knowledge rows into episodic memory, from a
  cursor that survives a resume.
- **self-code**: `self/autopilot.mjs runFromCli`, the `--auto` path, run in a worker thread
  capped at `selfCodeHeapMb`. It runs at most once per `selfCodeEvery` ticks (default 20,000).
  It never runs while another live process holds a bench flag, and never twice at once.

Every step, including a refused one, writes one `daemon.step` row with its kind, tick, mode
and wall ms.

A **bench flag** is a file `state/bench-flags/<pid>.json`. `raiseBenchFlag()` writes it and
`lower()` removes it. `benchFlag()` returns the first flag whose pid is alive and is not the
daemon's own. A flag with a dead pid is stale, and the reader deletes it. A killed bench never
runs its `finally`, and Windows reuses pids, so a stale flag left in place could hold self-code
off forever. On 2026-09-24 a bench run I started by accident was killed about 2 minutes in and
left exactly such a flag. The same kill left `state/daemon-bar` behind; the bench wipes that
directory at its next start. `bench/daemon.mjs` raises its own
flag. The daemon inside it runs in the same process, so it does not refuse itself.

**The dream step and the spawn step.** The spawn step asks the organism a question through
`spawnAsk`, which logs an `act.ask`. The dream region stands down for any `act.ask` since its
last cycle, and every period spawns. In the first quick run of this bench the region therefore
dreamed 1 cycle in 66. The step counter still printed "dream 66", because a skipped cycle was
counted as a step.

Two fixes, both in `daemon/run.mjs`:

- The spawn step's own `act.ask` events are credited to the region's count (`ownAsks`). A
  caller's ask still moves the count. Ask mail, inflight asks and `ctx.asking` still hold the
  region.
- A cycle that stands down is now a **refused** dream step with its reason, never a dream.

The next quick run dreamed 62 of 62 cycles.

### (c) The ruler

At every checkpoint (autosave, build, resume and final), the daemon measures the internal
suites. These are the algebra, sequence and grid items `bench/answer.mjs` draws:
`buildQuestions`, the same generators and grading, and no model anywhere. It reports two
numbers per suite:

- **exact**: answered correctly by the exact path, either the organism's own cells or
  `solve()`. `solve()` is a pure function, cached per question. **Exact is static.** The
  solver answers 724 of the 725 items at build, and nothing in the loop changes the solver, so
  its improvement per wall second is 0. It is printed because the item asks for it, not
  because it moves.
- **carried**: answered by the organism's **own spawned circuits**. It is measured on a
  clone of the spawn region (`cloneSub`), with `spawnAsk` allowed to keep no cell, and counts
  only when the clone spawned nothing, had incumbents, and the grade passed. This is the
  coordinate that grows.

Improvement per wall second is (score now minus score at the last checkpoint) over the wall
seconds between them, as a fraction of the suite. The daemon prints it at every checkpoint,
and for the whole run from the first row and the last.

The bar uses every item the generators make: 360 algebra, 205 sequence and 160 grid. A
50-per-suite draw saturated at 150 of 150 carried inside the first minute of a quick run,
which would flatten a 6-minute ruler. At 725 items the ruler costs 62 to 134 ms per
checkpoint (quick run, `[ruler]` lines).

**The plateau signal** (`LoopPlateau`) uses the rule of `generations/velocity.mjs`
(`PlateauRuler`: a coordinate fires after `patience` checkpoints within `epsilon` of its
best). It applies the rule to `carried.algebra`, `carried.sequence`, `carried.grid` and
`generations.best`. A coordinate at its ceiling is excluded, so a finished suite never fires.
A suite's ceiling is its `reach`, the planned items the exact path answers. Rows from before
`reach` existed use n; see "The bar, as measured" for why that changed.

- **generations to growth.** When any coordinate fires, the loop leaves generations mode
  for growth: spawn, ingest and dream, and no generations step.
- **growth to generations.** After 2 x `patience` checkpoints in growth, the loop returns to
  generations with fresh rulers (`arm` + 1).

### (d) The checkpoint carries its ruler

Every ruler row is appended to `ruler.jsonl` in the brain directory. The file rotates at
`rulerBudgetMb` (16 MB), keeping two segments. Each row holds:

- `at`, `atMs`, `wallMs`, the tick and `done`;
- the scores per suite;
- `bytes`: snapshot, ledger written, ledger file, ledger disk and rotations;
- the loop's step counts;
- the step since the previous row.

The same row, without the bytes, rides in the container 2 header of the checkpoint. There,
`writeCheckpoint` adds the whole file's size (`ruler.bytes`), and `checkpointRuler(file)`
reads the header without the body.

So the ruler is reproducible from disk. `rulerRates(readRuler(dir))` recomputes every step and
the whole-run rate, and `replayPlateau(rows)` recomputes the plateau state. A resumed daemon
continues the row numbering and the plateau from those rows. The bench checks all three
against what the run printed.

## Budgets

- `bench/daemon.mjs` re-runs itself with `--max-old-space-size=4096` when it was started
  without the flag.
- It waits while `os.freemem()` is under 16 GB.
- It runs one organism at a time, in one process with at most two worker threads: generations,
  and self-code, which is dry in the bar. The worker heaps are capped at 1536 and 1024 MB.
- The self-code run is `--dry` with sources `gate, notes, slow, mutants` and no rerun, so it
  spawns no process. `imagine` and `census` would copy trees.
- The bench builds in `state/daemon-bar` and deletes it before and after.

**This bench writes well over 200 MB, and says so.** In the bar, phase B wrote
1,364,996,500 B of full ledger in 120 s and rotated 52 times. Phase A wrote 2,210,319,784 B of
checkpoints, 59 of them. The quick run gives the rates: phase B's full ledger writes about
100 MB per 1000 ticks: a median of 101,658,041 B in the quick run. That is 320,756,368 B in
20 s of the quick run. The phase exists to prove the ledger rotates. On disk it never held
more than the 50 MB budget.

The checkpoints add to the total. Each is a whole snapshot written atomically over the
last: 155,415,728 B across 14 checkpoints in the quick run's minute. Only one checkpoint
exists on disk at a time.

## The bar, as measured

`node bench/daemon.mjs` ran on 2026-09-24T02:51:04Z under node v24.15.0. It re-ran itself with
`--max-old-space-size=4096`, with 45.44 GB free at the start, and wrote
`bench/verdicts/daemon.json` once, with isTheBar true and barMet true. The printed lines:

```
[A] 57,000 ticks in 363.886 s wall (stopped by wall): 157 ticks/s
[A] steps: generations 121, dream 290, spawn 186, ingest 169, self-code 2 | refused: none | periods 290, skipped for an ask 0
[A] ledger summary: 166,062 B written, file 166,062 B, 943 rows; per 1000 ticks: max 4,014 B, median 3,158 B, whole run 2,903 B (bar < 1,048,576 B)
[A] checkpoints 59 (errors 0): 2,210,319,784 B written in total, last 69,681,560 B
[A] algebra: exact 360/360 -> 360/360, carried by its own cells 0/360 -> 360/360
[A] sequence: exact 205/205 -> 205/205, carried by its own cells 0/205 -> 205/205
[A] grid: exact 159/160 -> 159/160, carried by its own cells 0/160 -> 159/160
[A] improvement per wall second over 359.629 s: exact 0, carried 0.002777 (fraction of 725 questions per s)
[A] from disk: ruler.jsonl 58 rows, rates recomputed EQUAL; checkpoint header k=57 matches the last row; plateau replay matches
[A] plateau: mode growth, arm 5, fired carried.grid,generations.best, switches 11
[B] 13,596 ticks in 120.004 s wall (stopped by wall): 113 ticks/s, resumed at t=58199
[B] ledger full budget 50 MB from the ledgerBudgetMb option: 1,364,996,500 B written (1301.76 MB), 6,636,836 lines, rotations 52 (errors 0), median 100,417,720 B per 1000 ticks
[B] two segments on disk: high-water mark 52,428,792 B (measured at every write), polled max 52,401,799 B over 577 reads (live 26,187,509, previous 26,214,399), at the end 28,232,771 B; budget 52,428,800 B: HELD
[rss] peak 2439 MB (process maxRSS, workers included), sampled peak 2335 MB, heap cap 4096 MB
[bar] MET: phaseAWall yes, ledgerUnder1MbPer1000 yes, summaryMode yes, everyStepKind yes, rulerReproducible yes, phaseBWall yes, rotationHeld yes
```

How to read it:

- **The whole-run rate is diluted.** Carried climbed from 0 through 269 and 279 to 662 over the
  first 30 checkpoints. It reached 724 of 725 at checkpoint 31 (162.904 s wall) and stayed
  there to checkpoint 57. The whole-run 0.002777 per second therefore averages a climb and a
  flat second half, and the per-checkpoint `[ruler]` lines are the better reading. Two jumps
  carry most of the climb:
  - checkpoint 9 to 10: 332 to 573;
  - checkpoint 30 to 31: 662 to 724.
- **724 is the ceiling.** It is every item the exact path answers; the last grid item fails
  both paths.
- **The plateau kept switching after that ceiling.** Grid sat at 159 of 160, and the plateau
  rule counted only n of n as a ceiling, so `carried.grid` fired on every arm: 11 switches.
  **Fixed after the bar; the bar ran the old rule.**
  - Each suite score now carries `reach`: the planned items the exact path answers (for this
    suite: 360, 205 and 159).
  - A suite at its reach is finished.
  - The spawn step is offered only items the exact path answers. Before, it retried the
    unanswerable grid item once per checkpoint.
  - The test `the plateau treats a suite at its reach as finished` replays eight rows at
    159 of 160: with reach, nothing fires; without it (the control), `carried.grid` fires, as
    the bar printed.
  - Rows written before reach existed still use n.
- **The organism grows, so it slows.** Cells went from 173 at build to 445 at the resume, and
  the last checkpoint was 69,681,560 B. Phase A averaged 157 ticks/s, against 202 in the quick
  run's first minute.
- **The verdict's statement mislabels the suite size.** It says "algebra, sequence, grid, 1000
  each", but 1000 is the cap per suite; the suites hold 360, 205 and 160. The verdict was
  written once and stays as it is. The bench now prints the real counts.

## The bar in the bench is not the SelfDaemon

`selfEvery` is 0 in the bar. The `SelfDaemon` rounds of `self/daemon.mjs` (structural
self-edits, propose and trial) are a separate, older loop that this item did not change. The
bar measures the new loop: generations, dream, spawn, ingest and self-code.

## Found on the way

- **The seed decides the organism's speed.** The first quick run used the seed `daemon-bar`
  and ran 18 ticks per second.
  - With the loop off, for 10 s each: seed `daemon-bar` ran 37 ticks/s, `probe12` ran 230
    and `whole` ran 314. All three have 173 cells.
  - The seeds build different organisms (edges 1917, 1893, 1657; runs per tick 112, 103, 98),
    and the slow one is slow with no daemon at all.
  - The bar uses `whole`, the organism's default seed. Why `daemon-bar` is 8 times slower is
    open. It belongs to the builder of `seeds/whole.mjs`.
- **The full ledger slows the ticks.** In the quick run, phase A ran 202 ticks/s on the summary
  ledger, and phase B ran 158 on the full ledger. The organism was the same, resumed.

## Next rung

- A bench flag only exists for benches that raise one. Other builders' benches do not, so
  self-code cannot yet see them. A process census, a cheap asynchronous listing of node
  processes running `bench/`, would close this.
- The one grid item the exact path gets wrong is out of reach for the loop as built. Carrying
  it needs a better solver, not more spawning.
- Once every suite is at its reach, only `generations.best` can move the plateau. The ruler
  then needs a harder suite: the ladder, or held-out items.
- Self-code runs dry in the bar. A run with the author on needs the gate, which spawns a
  6000 MB process, so it belongs outside a shared-machine bench.
