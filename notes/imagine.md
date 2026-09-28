# notes/imagine.md

Owner of `mind/imagine.mjs`, `capability/grid-invent.mjs`, `bench/imagine.mjs`,
`test/imagine.test.mjs`, `test/imagine.mutants.mjs`, `bench/verdicts/imagine.json` and this note
(Board 10, item imagine). His P14, verbatim: "Ai is algorithms. What if this had imagination? Could
think outside the box? Could vision? Could create new things that have never been done before".

The bar command is `node --max-old-space-size=4000 bench/imagine.mjs --split training --budget-work
1500 --workers 2` (board 31; before board 28 it was `--budget-ms 3000`, a wall clock), launched
since board 24a through `node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts --`.
Since board 24a it runs three seeds and the library arm in one process and decides `barMet` from
its own rows; since board 28 every budget is counted work and every seed runs twice. The runs so far, one at a time, each the only
bench process of this item:

| run | command options | wall | verdict |
| --- | --- | --- | --- |
| run 1 | the bar, round 1 library | 798.35 s | copied aside, then overwritten by run 2 |
| run 2 | the bar, round 2 library | 793.57 s | `bench/verdicts/imagine.json` (isTheBar true) |
| seed s2 | the bar plus `--seed s2` | 794.63 s | `bench/verdicts/imagine-seed-s2.json` |
| evaluation | `--split evaluation --carry` | 1115.49 s | `bench/verdicts/imagine-evaluation-carry-true.json` |
| evaluation s2 | `--split evaluation --carry --seed s2` | 1117.56 s | `bench/verdicts/imagine-evaluation-seed-s2-carry-true.json` |
| evaluation s3 | `--split evaluation --carry --seed s3` | 1112.16 s | `bench/verdicts/imagine-evaluation-seed-s3-carry-true.json` |
| training, doubt | the bar plus `--doubt` | 819.1 s | `bench/verdicts/imagine-doubt-true.json` |
| evaluation, doubt | `--split evaluation --carry --doubt` | 1122.85 s | `bench/verdicts/imagine-evaluation-carry-true-doubt-true.json` |
| shape mult | the bar plus `--shape mult` | 34.04 s | `bench/verdicts/imagine-shape-mult-partial.json` |
| shape mult+other | the bar plus `--shape mult+other` | 8.89 s | `bench/verdicts/imagine-shape-mult-other-partial.json` |
| shape smaller+same | the bar plus `--shape smaller+same` | 5.73 s | `bench/verdicts/imagine-shape-smaller-same-partial.json` |
| shape other+mult | the bar plus `--shape other+mult` | 8.78 s | `bench/verdicts/imagine-shape-other-mult-partial.json` |
| screen | the bar plus `--admit 64` | 799.48 s | `bench/verdicts/imagine-admit-64.json` |
| budget | the bar plus `--budget-ms 6000` in place of 3000 | 1428.52 s | `bench/verdicts/imagine-budgetms-6000.json` |
| budget s2 | the same plus `--seed s2` | 1426.16 s | `bench/verdicts/imagine-budgetms-6000-seed-s2.json` |
| board 24a small | `--limit 8 --budget-ms 600 --mine-ms 200 --imagine-budget 80 --no-knowledge` | 25.07 s | `bench/verdicts/imagine-budgetms-600-minems-200-imaginebudget-80-knowledge-false-partial.json` |
| board 24a ten ids | the bar plus `--ids` of ten tasks solved in earlier runs | 104.86 s | `bench/verdicts/imagine-partial.json` |
| board 24a bar | the bar: seeds imagine-bench, s2, s3, the library arm on | 3192.1 s | `bench/verdicts/imagine.json` (isTheBar true, barMet false), overwritten by the next row |
| board 24a verifier | the same command again | not kept | `bench/verdicts/imagine.json` at 2026-09-27T15:34:28Z (barMet true, a wall clock draw), superseded by board 31 |
| board 28 small | `--limit 8 --imagine-budget 80 --no-knowledge`, work budgets 800 and 300, 2 runs | 56.83 s | `bench/verdicts/imagine-imaginebudget-80-knowledge-false-partial.json` |
| board 28 ten ids | the bar plus `--ids` of 17 ids (10 of them timeouts of the new grid.json), work 800, 2 runs | 124.96 s | `bench/verdicts/imagine-partial.json` (overwrote board 24a's ten ids run) |
| board 31 timing | `--limit 24 --runs 1 --seeds imagine-bench --budget-work 1500` | 55.17 s | `bench/verdicts/imagine-budgetwork-1500-seeds-imaginebench-runs-1-partial.json` |
| board 31 bar | the bar: `--budget-work 1500`, seeds imagine-bench, s2, s3, each run twice, the library arm on | 2729.51 s | `bench/verdicts/imagine.json` (isTheBar true, barMet false) |

The board 24a bar run is the bar's verdict (node v24.15.0, isTheBar true, barMet false); run 2 was
the verdict before it, and the sections after the board 24a one describe runs 1 and 2 and the
suites around them. Every number below was printed by one of
these runs or by a command named with it: `node bench/imagine.mjs --runs`, `node bench/imagine.mjs
--objectives`, `node --test test/imagine.test.mjs`, `node test/imagine.mutants.mjs`, or a one off
`node -e` over a verdict, or an analysis script named where it is used. Those scripts are
`test/imagine-loo-probe.mjs`, `test/imagine-doubt-compare.mjs`, `test/imagine-doubt-changed.mjs`,
`test/imagine-new-at-budget.mjs` and `test/imagine-new-at-budget-2.mjs`: they read and print, write
nothing, and are not tests (the gate runs `test/*.test.mjs` only). They were written in the
session scratchpad, then copied into `test/` with their paths made relative; re-run from there on
the same inputs, every output the note quotes came back identical, and a control against a
different output did not. Two of those inputs are run 1's verdict, whose only copy is outside the
repository: a second bar verdict in `bench/verdicts/` would be published by `tools/findings.mjs`
as a finding of its own. The machine was shared with other builders while the runs ran.

## Boards 28 and 31: one seed, one draw (item imagine-repeat)

**Why.** Board 24a's bar printed invented 8, 9, 5 against null 3, 5, 6, a mean lead of 2.6667 inside a
seed to seed band of 6: barMet false. Its verifier ran the SAME command again and printed invented
8, 9, 7 against null 5, 5, 4, a mean lead of 3.3333 above a band of 2: barMet true, written over the
verdict at 2026-09-27T15:34:28Z. **That barMet true was a wall clock draw and is superseded** by the
board 31 verdict below: mining (1000 ms a task) and the search (3000 ms a task per arm) were budgeted
by the wall clock, so a seed did not fix what a task searched (the invented library sizes differed
between the two runs), and at one seed the null arm moved 3 to 5 (imagine-bench) and 6 to 4 (s3),
as far as the seeds moved it. A band read from the seeds alone could not see that. The memory
"external bench repeatability" says the same: a re-run of the same arm moved further than the arms.

**What was built.** Board 28 wrote it and died on the session limit before a bar run or a note;
board 31 read every file it left (the tests were green, 21 of 21), kept it, and finished:

- **Every budget is work** (`capability/grid-invent.mjs`, the work meter). The search, the admission
  screen, the invented words and the learners count what they do: calls (one per word or learner
  application), cells (read, written, hashed, compared), learn and grade. `WORK_MS` weighs the
  counts so one work ms is about one wall ms on this machine; the fit is `test/imagine-work-probe.mjs`,
  whose board 28 run the file header records as calls 0.00123, cells 0.000036, learn 0, grade 0, work
  over wall median 0.997 over 97 timed phases (board 31 did not re-run the probe: no draw depends on
  the weights, they are a unit). `searchWith` and `solveWith` take `opts.work`, `admitFor` a work
  budget. `--budget-work N` and `--mine-work M` name the budgets (`--budget-ms` and `--mine-ms` are
  read as the same work budgets). The wall clock is printed and never budgets a draw: it only stops
  a job at 4 times its budget plus 4000 ms (`WALL_SAFETY`), and every such stop is counted and
  printed, because under a heavy load a wall limit that binds first would bring back the very
  movement this removes (the same failure is filed against another project's deterministic mode,
  spoorendonk/coso issue 209, read while this ran).
- **Results apply in job order.** Board 24a offered a job the words of whichever jobs had FINISHED,
  which depends on the machine. `inOrder` applies results in job order, and `visibleAt` offers job j
  of a stage only the words that jobs up to j minus `LAG` (2, the most workers) brought in, plus
  every earlier stage's, so the worker that finishes first decides nothing.
- **Every seed runs twice** (`--runs 2`, the default; mining included). `barOf` now reads two bands
  over three numbers (the arm's count, the control's count, the lead): the seed to seed band (the
  range across the seeds within one run, the largest over the runs) and the run to run band (the
  range across the runs at one seed, the largest over the seeds). The band is the larger, `bound`
  names which one set it, and `barMet` needs at least 3 seeds, every seed run at least twice, and a
  mean lead strictly above the band. The library arm keeps its own two bands as the second
  comparison, against the null and against the invented arm.
- **The verdict carries both runs per seed** (`perRun`, `solvedWithInvented` as one array per run),
  both bands, `bound`, and `runToRun`: per seed and arm the task rows whose status, program, words,
  states or work came back different, the key list fingerprints of every library, and the mining
  fingerprint. The statement says which band bound, and names the verdict it replaces.
- **The mutants refuse to run beside a bench.** `test/imagine.mutants.mjs` edits
  `capability/grid-invent.mjs`, `bench/imagine.mjs` and `mind/imagine.mjs` in place. A bench's
  workers import `capability/grid-invent.mjs` when they boot, and a worker the wall safety replaces
  boots again mid run, so a mutant in the file at that moment runs inside the bar; board 24a's first
  bar launch had the mutants beside it and was relaunched. The bench now keeps
  `bench/verdicts/imagine-running-partial.json` fresh every minute and removes it at the end, every
  narrower run writes a partial verdict, and the harness refuses (exit 2) while any
  `bench/verdicts/imagine-*-partial.json` is younger than ten minutes.
- **Board 31**: the dead ternary is gone (`runImagineBench` defaulted `cfg.seeds` and `cfg.runs`
  though `parseArgs` always sets them; it now refuses a cfg without them, and a test holds that);
  the split names the development ids (the tasks `bench/verdicts/grid.json` solved, never scored), the
  held out ids (the scored timeouts), the seeds and the runs. `contaminated` stays the reason, not
  false: the scored tasks were seen in development (the DSL and the imagination's combinators were
  written against the training split, and every scored task's train pairs were mined for words
  offered to the OTHER scored tasks), which is the rule of `bench/gate.mjs` ("true with the reason
  when a held-out record was ever seen in development") and of `test/contamination-split.test.mjs`
  (a set that is not really held out gives the reason). No scored task's own pairs or test output fed
  a word it was offered, so the comparison of the arms is clean; the absolute counts are in sample.
- **The work budget, chosen by time and never by a solve.** A timing partial (24 tasks, one seed, one
  run, 1500 work ms) printed `work ms per task invented 1381, null 1500.05, library 1498.27; wall ms
  per task invented 1132.72, null 1347.28, library 1217.16` and `solve 47.37 s` for 72 jobs (0 solved
  in every arm): about 0.88 wall ms per work ms. The bar is 195 tasks x 3 jobs x 3 seeds x 2 runs,
  3510 jobs on 2 workers, so 1500 work ms is about 2320 s of solving, under an hour with room for the
  shared load. `BAR_WORK` is 1500, `BAR_MINE_WORK` 300 (board 28).
- **The scored set moved under the item.** Board 26 rewrote `bench/verdicts/grid.json` at
  2026-09-27T18:54:29Z (isTheBar false, 400 of 400 rows, 167 solved, 195 timed out), so the bar
  scores 195 timeouts where board 24a scored 236; the numbers are not comparable one to one.
- **Not done here**: `tools/boundary-audit.mjs` lists 80 boundaries with 5 unlisted and 3 stale, all
  in `bench/imagine.mjs` (the two worker `postMessage` boundaries changed shape); the orchestrator
  allowlists them after this item lands.

Board 28's two partials, read from their verdicts' printed lines, showed the draw fixed before any
bar ran: at `--limit 8` (work 800) `run 1 against run 2 at one seed: mining identical; rows that came
back different (status, program, words, states, work) 0 of 72`, and on ten timeouts `0 of 90`.

### The bar, printed (board 31)

The bar command, launched as the brief says, alone on this item, with 34098 MB free before it
(`os.freemem()`):

    node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/imagine.mjs --split training --budget-work 1500 --workers 2

The lines that decide it, verbatim from its stdout:

    tasks 195 (the fixed vocabulary timed out on every one at 3000 ms in bench/verdicts/grid.json; so it solves 0 of them by construction; fold 0 99, fold 1 96); budget 1500 work ms per task per arm, mining 300 work ms per task; 2 runs of seeds imagine-bench, s2, s3
    run 1 mining: 195 tasks, 0 found a program while mining, stopped by the wall clock safety 0, fingerprint deaeaae0, 18 s
    run 2 mining: 195 tasks, 0 found a program while mining, stopped by the wall clock safety 0, fingerprint deaeaae0, 18.89 s
    run 1 seed imagine-bench: solved with an added word: invented 2 (44f52bb0, 53b68214), null 2 (1c786137, 6773b310), library 2 (44f52bb0, 53b68214) of 195; without an added word: invented 0, null 0, library 0; found but wrong: invented 5, null 4, library 2
    run 1 seed s2: solved with an added word: invented 1 (44f52bb0), null 2 (44f52bb0, 6773b310), library 3 (44f52bb0, 4be741c5, 53b68214) of 195; without an added word: invented 0, null 0, library 0; found but wrong: invented 4, null 4, library 5
    run 1 seed s3: solved with an added word: invented 2 (44f52bb0, 53b68214), null 1 (44f52bb0), library 1 (53b68214) of 195; without an added word: invented 0, null 0, library 0; found but wrong: invented 5, null 3, library 5
    run 2 seed imagine-bench: solved with an added word: invented 2 (44f52bb0, 53b68214), null 2 (1c786137, 6773b310), library 2 (44f52bb0, 53b68214) of 195; without an added word: invented 0, null 0, library 0; found but wrong: invented 5, null 4, library 2
    run 2 seed s2: solved with an added word: invented 1 (44f52bb0), null 2 (44f52bb0, 6773b310), library 3 (44f52bb0, 4be741c5, 53b68214) of 195; without an added word: invented 0, null 0, library 0; found but wrong: invented 4, null 4, library 5
    run 2 seed s3: solved with an added word: invented 2 (44f52bb0, 53b68214), null 1 (44f52bb0), library 1 (53b68214) of 195; without an added word: invented 0, null 0, library 0; found but wrong: invented 5, null 3, library 5
    the bar, the invented arm against the null arm: invented 2, 1, 2 | 2, 1, 2; null 2, 2, 1 | 2, 2, 1; lead 0, -1, 1 | 0, -1, 1 (run 1 | run 2, seeds in the order imagine-bench, s2, s3); mean lead 0; seed to seed band 2 (the largest range across the 3 seeds within one run of: the invented count 1, the null count 1, the lead 2); run to run band 0 (the largest move between runs at one seed of: the invented count 0, the null count 0, the lead 0); band 2, set by the seed to seed band
    barMet false: the mean lead 0 is not above the band 2, set by the seed to seed band
    the library arm (DreamCoder: routines compressed from solved programs by description length, the imagination's draw refit to them, cross fitted by fold) against the same null: library 2, 3, 1 | 2, 3, 1; null 2, 2, 1 | 2, 2, 1; lead 0, 1, 0 | 0, 1, 0 (run 1 | run 2, seeds in the order imagine-bench, s2, s3); mean lead 0.3333; seed to seed band 2 (the largest range across the 3 seeds within one run of: the library count 2, the null count 1, the lead 1); run to run band 0 (the largest move between runs at one seed of: the library count 0, the null count 0, the lead 0); band 2, set by the seed to seed band; beyond the band false
    the library arm against the invented arm: library 2, 3, 1 | 2, 3, 1; invented 2, 1, 2 | 2, 1, 2; lead 0, 2, -1 | 0, 2, -1 (run 1 | run 2, seeds in the order imagine-bench, s2, s3); mean lead 0.3333; seed to seed band 3 (the largest range across the 3 seeds within one run of: the library count 2, the invented count 1, the lead 3); run to run band 0 (the largest move between runs at one seed of: the library count 0, the invented count 0, the lead 0); band 3, set by the seed to seed band; beyond the band false
    run 1 against run 2 at one seed: mining identical; rows that came back different (status, program, words, states, work) 0 of 1755: seed imagine-bench invented 0, null 0, library 0 of 195 (libraries identical); seed s2 invented 0, null 0, library 0 of 195 (libraries identical); seed s3 invented 0, null 0, library 0 of 195 (libraries identical)
    per task over the seeds and runs (seed runs one arm solved it in minus the other, one vote per task): invented over null ahead 2, behind 2, sign test p 1; library over null ahead 2, behind 2, p 1; library over invented ahead 2, behind 1, p 1
    phases: mine 36.89 s, invent and sleep 58.73 s, solve 2633.28 s over 2 runs of 3 seeds (run walls 1369.39 s, 1359.54 s); stopped by the wall clock safety: mining 0, solving 18; workers replaced 18; wall 2729.19 s; peak rss 1033 MB
    wrote bench/verdicts/imagine.json (1.78 MB) (isTheBar true, barMet false)
    BUDGET done exit 0: wall 2729.51 s, peak ram 1022.0MB, peak dir 58.0MB, cpu 5462.44 s, 1365 samples, record state/budget/last.json

**Result: barMet false, and the draw is fixed.** Run 2 repeated run 1 row for row: 0 of 1755 task
rows (195 tasks x 3 arms x 3 seeds) came back different, the mining fingerprint was the same
(deaeaae0) and every library's key list fingerprint was the same, so the run to run band is 0 and
the band, 2, is set by the seed to seed band. The invented arm solved 2, 1, 2 and the null 2, 2, 1
at every seed of both runs: a mean lead of 0. The library arm (DreamCoder) solved 2, 3, 1, a mean
lead of 0.3333 over the null, inside its band of 2. Per task, the invented arm was ahead on 2 tasks
(44f52bb0, which it solved at every seed and the null at two, and 53b68214) and behind on 2
(1c786137, 6773b310): sign test p 1.

**Read from the rows, before and after writing this.** At 1500 work ms a task (about half the old
3000 wall ms) every arm solves 1 to 3 of 195 where board 24a's arms solved 3 to 9 of 236 at 3000 ms,
so the counts are too small to separate: 44f52bb0 and 53b68214 are the invented arm's only solves,
and the null arm's 1c786137 and 6773b310 are tasks the invented arm never solved. Each sleep kept 1
routine that was already a word (0 not already a word), as in board 24a: the development corpus is 90
readable programs and the other fold fed 0 to 2 solves.

**The wall safety bound on one task, the same way every time.** The bench printed `stopped by the
wall clock safety: mining 0, solving 18; workers replaced 18`. All 18 are one task, 3631a71a, in all
three arms at every seed of both runs (read from the verdict's rows): its 1500 work ms take longer
than the 10000 ms safety. A one off probe (the session scratchpad, `solveWith` with the fixed
vocabulary alone) printed `work 1500 status timeout searched 10857 reported work 1500.2737 wall ms
10135 counts {"calls":30787,"cells":40622380,"learn":25782591,"grade":0}`: four 30x30 train pairs,
and the learners' count (25782591) weighs 0 in `WORK_MS`, so this task is under priced by the fit.
It did not move a row between the runs (the kills are in the 0 of 1755) and it cannot move the
verdict (a solve by one arm at every seed would move the mean lead by 1, under the band of 2), but on
a faster machine the job could end before the safety and grade differently. The fix is a refit of
`WORK_MS` that prices `learn` (or a safety that does not bind at 4x), and then the bar again: left open.

## Board 24a: the bar decided from its rows, and a DreamCoder library

The brief for this round: the bench decides `barMet` from its own rows, true only when the
invented arm solves MORE timed out tasks than the null by more than the seed to seed band, over
at least three seeds, with the band printed; the verdict carries `split` (development, heldOut,
contaminated); and ONE published idea is applied to the invention step, measured against the
same null on the same seeds.

**Result: barMet false, with the band printed.** Over the seeds imagine-bench, s2 and s3 the
invented arm solved 8, 9 and 5 of the 236 timeouts and the null 3, 5 and 6: a mean lead of 2.6667
against a seed to seed band of 6. The library arm (DreamCoder) solved 6, 5 and 8: a mean lead of
1.6667 over the null against a band of 3, and a mean lead of -1 over the plain invented arm.

### What changed

- **One command, three seeds.** The bar command now runs the seeds `imagine-bench`, `s2` and `s3`
  in one process (`--seeds a,b,c` names others; `--seed x` runs one and is a variant). Mining
  runs once. Each seed draws its own imagination, its own null library of the same size and its
  own library arm, and scores every arm on the same 236 timeouts.
- **barMet from the rows** (`barOf` in `bench/imagine.mjs`). Per seed, the lead is invented
  solves minus null solves. The band is the LARGEST range across the seeds of three numbers: the
  invented count, the null count and the lead, that is how far one of them moved when only the
  draw changed. `barMet` is true only with at least 3 seeds and a mean lead strictly above the
  band, so a met bar is positive in every seed. A lead equal to the band is not met, and a steady
  lead is not met when the counts themselves move more than it (tests hold both).
- **The split.** `development` is the ARC-AGI-1 training material the vocabulary was invented on
  (the DSL, the solved programs of `bench/verdicts/grid.json`, the mined train pairs). `heldOut`
  is the 236 scored timeouts, with the two folds. `contaminated` is the reason, never false: every
  scored task's train pairs were mined for words offered to the OTHER scored tasks, and the DSL was
  written against the training split. No test output fed a word a task was offered.
- **The control is the null arm**, as before: random compositions of the fixed vocabulary and
  pairwise recombinations of the same memory, as many words as the invented library, through the
  same screen and the same clock. The verdict names it in `control` and in its statement.

### The published idea: DreamCoder's library learning

DreamCoder (Ellis et al., PLDI 2021, arXiv 2006.08381) alternates WAKE, solving tasks with the
current library, and SLEEP: abstraction adds to the library the program fragments that most
compress the solved programs, and dreaming refits the generative model so the next search draws
what solved before more often. "Dreaming with ARC" (Banburski et al., CBMM Memo 113) applied it
to ARC. Applied here as the **library arm**, a third arm beside invented and null:

- **Sleep (abstraction).** `compressLibrary` in `capability/grid-invent.mjs`. A solved program is
  read into steps (`programSteps`: the learned last step dropped, an added word looked up by key).
  A step costs 1 if it is a base word or a routine, else the length of its structural tokens. A
  candidate is a contiguous run of two or more steps that is a grid to grid word, or one added
  word. Adding it gains uses x (its length - 1) and costs lambda x its length. The best candidate
  with a gain above 0 is added, the corpus is rewritten, and the search repeats, so a routine can
  hold an earlier one.
- **Refit (the grammar).** `libraryPrior` counts each base grid word in the programs (inside
  added words too) and each imagination operator whose word was used. `dslSpace` with a prior gives
  an operator (its count plus alpha) slots in the round robin draw and draws inner words in
  proportion to their count plus alpha, routines by their uses plus alpha. Without a prior the
  draws are exactly the old uniform ones.
- **The library arm's words** (`libraryWords`): the same collapsed and mined words the invented
  arm holds, then the routines, then imagination under the refit prior with the same seed, capped
  at the invented library's size, so it never holds more words than the invented arm or the null.
- **Cross fitting, so no scored task shapes a word it is offered.** The 236 timeouts split into
  two folds by `foldOf` (FNV-1a of the id, modulo 2): 120 and 116. Stage A scores invented and
  null on fold 0. The sleep for fold 1 reads the development programs (the solved programs of
  grid.json, tasks never scored) plus the invented arm's SOLVED programs of fold 0 only
  (`sleepCorpus`). Stage B scores invented, null and library on fold 1, interleaved. The sleep for
  fold 0 reads the invented solves of fold 1. Stage C scores the library on fold 0. A routine
  carries the programs it came from as sources, every word imagined under a prior carries the
  tasks that fed that prior, and a word the library arm kept travels to the other fold with those
  sources; `offerable` never offers a task a word whose sources hold it.
- **Settings fixed before the first library run**, never tuned on its solves: 2 folds, lambda 1,
  at most 24 routines, alpha 1 (`LIBRARY` in `bench/imagine.mjs`).

### The bar, printed

The bar command, launched as the brief says:

    node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/imagine.mjs --split training --budget-ms 3000 --workers 2

The lines that decide it:

    tasks 236 (the fixed vocabulary timed out on every one at 3000 ms in bench/verdicts/grid.json; so it solves 0 of them by construction; fold 0 120, fold 1 116)
    the bar, the invented arm against the null arm on seeds imagine-bench, s2, s3: invented 8, 9, 5; null 3, 5, 6; lead 5, 4, -1; mean lead 2.6667; seed to seed band 6 (the largest range across the 3 seeds of: the invented count 4, the null count 3, the lead 6)
    barMet false: the mean lead 2.6667 is not above the band 6
    the library arm (DreamCoder: routines compressed from solved programs by description length, the imagination's draw refit to them, cross fitted by fold) against the same null on the same seeds: library 6, 5, 8; null 3, 5, 6; lead 3, 0, 2; mean lead 1.6667; seed to seed band 3 (the largest range across the 3 seeds of: the library count 3, the null count 3, the lead 3); beyond the band false
    the library arm against the invented arm on the same seeds: library 6, 5, 8; invented 8, 9, 5; lead -2, -4, 3; mean lead -1; seed to seed band 7 (the largest range across the 3 seeds of: the library count 3, the invented count 4, the lead 7); beyond the band false
    per task over the seeds (seeds one arm solved it in minus the other, one vote per task): invented over null ahead 10, behind 4, sign test p 0.1796; library over null ahead 7, behind 3, p 0.3438; library over invented ahead 4, behind 7, p 0.5488
    phases: mine 120.72 s once (0 found a program while mining), invent and sleep 56.19 s, solve 3015.09 s over 3 seeds; wall 3192.1 s; peak rss 1724 MB
    wrote bench/verdicts/imagine.json (isTheBar true, barMet false)
    BUDGET done exit 0: wall 3192.40 s, peak ram 1703.3MB, peak dir 50.3MB, cpu 6945.02 s, 1597 samples, record state/budget/last.json

Per seed, from the same run:

    seed imagine-bench: solved with an added word: invented 8 (017c7c7b, 32597951, 44f52bb0, 53b68214, 794b24be, d4469b4b, ef135b50, ff28f65a), null 3 (44f52bb0, 6cdd2623, d4469b4b), library 6 (11852cab, 32597951, 44f52bb0, 6cdd2623, 794b24be, d4469b4b) of 236; without an added word: invented 0, null 0, library 0; found but wrong: invented 14, null 14, library 17
    seed s2: solved with an added word: invented 9 (11852cab, 32597951, 44f52bb0, 4522001f, 53b68214, 73251a56, 794b24be, ba97ae07, d4469b4b), null 5 (44f52bb0, 4522001f, 6cdd2623, 794b24be, d4469b4b), library 5 (44f52bb0, 794b24be, ba97ae07, d4469b4b, ef135b50) of 236; without an added word: invented 0, null 0, library 0; found but wrong: invented 13, null 13, library 19
    seed s3: solved with an added word: invented 5 (28e73c20, 44f52bb0, 794b24be, ba97ae07, d4469b4b), null 6 (31aa019c, 44f52bb0, 4522001f, 6773b310, 794b24be, d4469b4b), library 8 (11852cab, 239be575, 44f52bb0, 4522001f, 53b68214, 6773b310, 794b24be, d4469b4b) of 236; without an added word: invented 0, null 0, library 0; found but wrong: invented 13, null 15, library 16
    seed imagine-bench by operator (invented arm words / solves): lift.object 232/0, lift.cell 238/0, lift.layer 241/0, superpose 229/7, quarter 176/0, fixpoint 241/2, lift.select 239/0, conjugate 142/0, analogy 92/0; imagination by round: round 1 1421 words, 6 tasks; round 2 409 words, 0 tasks
    seed s2 by operator (invented arm words / solves): lift.object 234/1, lift.cell 239/0, lift.layer 239/0, superpose 232/5, quarter 177/0, fixpoint 230/1, lift.select 236/0, conjugate 125/1, analogy 88/0; imagination by round: round 1 1408 words, 5 tasks; round 2 392 words, 1 tasks
    seed s3 by operator (invented arm words / solves): lift.object 241/0, lift.cell 234/0, lift.layer 237/0, superpose 235/1, quarter 175/0, fixpoint 234/1, lift.select 241/0, conjugate 142/0, analogy 93/0; imagination by round: round 1 1405 words, 2 tasks; round 2 427 words, 0 tasks
    seed imagine-bench libraries: invented 3690 (collapse 24, collapse.generalised 138, timeout 241, timeout.generalised 1457, imagine 1830), null 3690; library fold 1 3690 (slept on 6 invented solves of the other fold and 93 development programs: 1 routines, 0 not already a word, description length 155 to 154; 1830 words imagined under the refit draw); library fold 0 3690 (slept on 2 invented solves of the other fold and 93 development programs: 1 routines, 0 not already a word, description length 139 to 138; 1830 words imagined under the refit draw)
    seed imagine-bench kept through the gate: invented 9 (12 submitted, 0 refused), library 8 (9 submitted, 0 refused); null words that solved 4; mean novelty of the invented arm's kept words 0.3363; library solves by a routine 0, by a word imagined under the refit draw 3, by another word 3
    seed s2 kept through the gate: invented 12 (12 submitted, 0 refused), library 5 (5 submitted, 0 refused); null words that solved 6; mean novelty of the invented arm's kept words 0.3135; library solves by a routine 0, by a word imagined under the refit draw 2, by another word 3
    seed s3 kept through the gate: invented 5 (5 submitted, 0 refused), library 12 (14 submitted, 0 refused); null words that solved 6; mean novelty of the invented arm's kept words 0.287; library solves by a routine 0, by a word imagined under the refit draw 5, by another word 3

Every stage of every seed printed killed 0, errors 0. The verdict is 1050060 bytes with 708 rows
(236 tasks x 3 seeds), node v24.15.0, `at` 2026-09-27T14:36:15.204Z.

### Why it failed, read from the rows

Read before any fix, by a `node -e` over the verdict's rows (per task, per seed, per arm):

- **The band is the lead's own range, 5, 4, -1.** In s3 the invented arm solved 5 and the null 6.
- **The invented arm's extra solves do not recur.** Of the 13 distinct tasks it solved over the
  three seeds, 3 were solved in all three (44f52bb0, 794b24be, d4469b4b), 3 in two and 7 in one.
  The null solved 7 distinct, 2 in all three (44f52bb0, d4469b4b), 3 in two and 2 in one. The
  tasks it solves in all three seeds, the null solves too (794b24be in two of its seeds).
- **Which superpose words a seed draws decides its count.** The superpose operator's words were in
  7 solves in imagine-bench, 5 in s2 and 1 in s3 (the by operator lines). 32597951 was solved in
  imagine-bench and s2 by the invented arm, with different superpose words each time, and timed
  out in s3; 53b68214 was solved by the invented arm in imagine-bench and s2 and in s3 only by the
  library arm, each time with `both.hcat(id,andLR)` first. 19 of the invented arm's 22 solves over
  the seeds end in a learned last step (localRule, extendTo, colormap and the like) fitted on the
  grid a drawn word produced; so do 12 of the null's 14 and 17 of the library arm's 19.
- So on average the invented arm is ahead (per task 10 ahead, 4 behind, sign test p 0.1796), but
  the seed to seed swing in what the round robin draws is larger than the lead. No fix was made
  after the bar: the brief takes a false barMet with the band printed as a landing, and a change
  chosen on these seeds would be read off the scored tasks.

### The library arm: what the sleep found

- **The routines did nothing.** Each of the six sleeps kept 1 routine, already a word of the
  library (0 not already a word), and shortened the corpus by 1 (for example 155 to 154). No
  library solve used a routine: by a routine 0 in every seed. Its solves came from words imagined
  under the refit draw (3, 2, 5) and other words (3, 3, 3).
- **The corpus is too thin to compress.** A one off probe over `bench/verdicts/grid.json`
  (`node test/imagine-sleep-probe.mjs`, written in the session scratchpad and copied into `test/`
  with its paths made relative; re-run from there it printed the same bytes) printed `programs with steps 93 lengths
  {"1":71,"2":17,"3":3,"4":2}`, `routines 1 before 122 after 121` and `chain(keepRareColor,cropBBox)
  uses 3 gain 1`. With 71 of 93 programs one step long there is almost nothing to share; the sleep
  adds 2 to 6 invented solves of the other fold per sleep, also short.
- **The refit draw did move the imagination**: the library arm solved 12 distinct tasks, 8 of
  them in one seed only, including 3 tasks the invented arm never solved in any seed (239be575, 6773b310,
  6cdd2623). Against the
  null it led in 2 seeds and tied in 1 (lead 3, 0, 2), inside its band of 3.
- DreamCoder's gains come from compressing many solved programs that share structure; the idea
  applied here is sound but starved. A larger corpus (the solved programs of every ARC run, or
  the evaluation split's) is the next thing it needs, not a new setting.

### Earlier board 24a runs (partial, isTheBar false)

- **Ten ids** (the bar plus `--ids` of ten tasks solved in earlier runs, 104.86 s, `bench/verdicts/imagine-partial.json`):
  `the bar, the invented arm against the null arm on seeds imagine-bench, s2, s3: invented 5, 6, 7; null 5, 5, 5; lead 0, 1, 2; mean lead 1; seed to seed band 2`,
  then `barMet false: the mean lead 1 is not above the band 2`. Every stage printed killed 0, errors 0.
- **Small** (`--limit 8 --budget-ms 600 --mine-ms 200 --imagine-budget 80 --no-knowledge`, 25.07 s,
  `bench/verdicts/imagine-budgetms-600-minems-200-imaginebudget-80-knowledge-false-partial.json`):
  every arm solved 0 in every seed, `barMet false: the mean lead 0 is not above the band 0`.
- **A stopped launch.** The first launch of the bar command was stopped after its 120 s status
  line, while mining: `node test/imagine.mutants.mjs` (which edits `capability/grid-invent.mjs`,
  `bench/imagine.mjs` and `mind/imagine.mjs` in place) was run by mistake alongside it, and a
  worker spawned then could have loaded a mutant. The harness restored every file (compared byte
  for byte against a copy taken before), no other running bench imports these files, and the bar
  was relaunched from scratch. The run above is that relaunch.

## What was built

**mind/imagine.mjs: imagination as a checked claim, not a word.**

- `propose(context, budget)` returns typed candidates: `primitive`, `wiring`, `objective` or
  `patch`. A candidate survives only when it is:
  - **outside memory**: not an exact stored key, not an exact article title in the knowledge
    store when one is present (`memory/knowledge.mjs` `titleLookup`, opened read only), and at a
    hypervector distance above the floor (0.15) from every stored item. A candidate's vector
    (D 8192, bipolar) bundles its tokens (the same word seeds the ask path uses) and each token
    bound to its position. Distance is (1 minus similarity) over 2.
  - **outside the recombination null**: before imagining, the null draws as many random
    candidates AND as many pairwise recombinations of memory as the imagination draws. Any key
    the null reached is rejected, since a recombination is not imagination.
- Every rejection is counted by cause: invalid, duplicate, inMemory, inKnowledge, inNull and
  nearMemory.
- `keep(candidate, evidence)` submits to the authority gate (`core/gate.mjs`) as the registered
  kind `imagine.keep`. Its policy (`imaginePolicy`):
  - rejects anything whose provenance is not the imagination;
  - approves a primitive or wiring only with a novelty distance above zero and at least one
    solved task that is not among its sources (held out);
  - approves an objective only with a hypothesis and a complete ruler: a suite, a bar (metric,
    comparison, value) and a control;
  - holds a code patch until the autopilot's verification is in the evidence.
- `objectiveSpace(facts)` is the space the vision imagines in. Objectives are made from measured
  facts, and the null recombines stored hypotheses with stored rulers.

**capability/grid-invent.mjs: invention for the ARC grid search.**

- Three sources of words:
  - **(i) collapse**: every contiguous run of 2 or more unlearned words of a solved program in
    `bench/verdicts/grid.json`, as one step, plus sibling variants (the same family and types,
    for example rot90 for rot270).
  - **(ii) timeouts**: each timed out task is searched for 1000 ms. The partial programs with
    the best mapped pixel agreement (one colour map across all train pairs, as the colormap
    learner reads it), above the identity baseline, are recorded and generalised the same way.
  - **(iii) imagination**: `propose()` over the DSL with combinators the chain grammar cannot
    say:
    - per object lift (`each.c8`, `each.m8`)
    - per partition cell (`cells`)
    - per colour layer (`layers`)
    - superpose (`overlay`, `under`) or lay side by side (`hcat`, `vcat`)
    - four quadrants (`quad`)
    - fixed point (`fix`)
    - conjugation (T, inner, inverse of T)
    - analogy (a sibling swap in a memory chain)
    - select then transform (`sel`): one of the 23 base object selectors (for example smallest
      or topmost) picks some objects, the inner word runs on each picked object cut out on
      background, the result is pasted back centred, and every other cell stays as it was.
- **Round 2 of the imagination**: `imagineWords` runs 2 rounds. The second round draws half the
  budget, its memory holds the first round's words, and its inner words are the first round's
  words. So it can only return what nests them, for example a per object lift of a superpose,
  and a nesting that repeats round 1 is rejected as memory.
- **Admission, the same in both arms**: `admitFor` ranks a library for one task. It reads the
  train pairs and the test inputs, never the test outputs:
  - stage 1 runs every word on the first train input;
  - stage 2 runs the best 4k on every train and test input and scores improvement (the cells
    that had to change and now match under one colour map, minus the cells broken);
  - ties break by key, and the top 32 enter the search at cost 1, ahead of the base words.
- `searchWith` is `searchGrid` with those words added. Answers are still run as cells: an
  invented step runs in a `grid.invent` cell, and `grid.dsl.match` cells check every train
  pair.
- `InventedVocabulary` holds the kept words. A word enters only through the gate.
- `patchFor` turns a kept chain into a code patch for `capability/grid-dsl.mjs`, which the gate
  holds for the autopilot. Combinators are not proposed, since they need this file's
  interpreter.

**bench/imagine.mjs: the bar.**

1. **Mine.** Search every timeout for 1000 ms (source ii).
2. **Build the libraries.** The invented library comes from (i), (ii) and (iii). The null
   library holds as many random compositions and pairwise recombinations of the same memory.
3. **Solve.** Each task runs twice, once per arm, with the arms interleaved on 2 workers:
   - one 3000 ms clock per task per arm covers admission and search;
   - a word is never offered to a task it was mined or collapsed from;
   - a solve that uses an added word puts that word in the arm's run time vocabulary: through
     the gate for the invented arm, by the same rule for the null arm, so both arms grow alike.
4. **Propose objectives.** The run proposes objectives from what it measured and writes the
   approved ones to `state/imagine/objectives.jsonl`. It also writes held patches to
   `state/imagine/patches.jsonl`, and a bar run merges its kept words into
   `state/imagine/vocabulary.json` (by key, with the union of the tasks they solved and the runs
   that kept them).
5. **Log the run.** Every complete run, and every run of one whole shape class, appends a record
   to `state/imagine/runs.jsonl`: its start and end, command, split, options, the ids each arm
   solved, the kept words, the per operator and per shape counts, and the carried words' solves.
6. **Grade the objectives.** Every run prints how the objectives in the file stand against the
   runs that tested them (see Vision below).
7. **Keep the summary.** The verdict keeps the summary lines exactly as printed (`printed`), so a
   lost or shared stdout cannot lose them. This was added after run 2, whose stdout file was
   shared by accident with another builder's census.

Options and modes added since run 2:

- `--carry` reads `state/imagine/vocabulary.json` and puts the kept words of earlier bar runs in
  the invented arm, and the null words that solved in the null arm, before the run starts. A
  carried word is not counted again as kept.
- `node bench/imagine.mjs --runs` prints the runs log grouped by setting, with a two sided sign
  test on the runs.
- `node bench/imagine.mjs --objectives` prints every objective with its grade.

Naming of other runs:

- A narrower run (`--limit`, `--ids`, `--shape`) writes `imagine-partial.json` with isTheBar
  false and keeps its state under `state/imagine/partial/`, so a probe never becomes the bar's
  memory.
- A complete run with any bar option changed (split, budget, workers, admit, admit fraction,
  mining clock, mining depth, imagination budget, seed, knowledge or carry) writes
  `imagine-<option>-<value>.json` with isTheBar false, and also keeps its state under
  `state/imagine/partial/`.

## The bar before board 24a, printed (runs 1 and 2)

Run 2, the verdict before board 24a:

    tasks 236 (the fixed vocabulary timed out on every one at 3000 ms in bench/verdicts/grid.json)
    solved with invented primitives at the same budget: 4 of 236 (31aa019c, 44f52bb0, 794b24be, d4469b4b)
    solved by the null arm (random compositions and recombinations at the same budget): 3 of 236 (44f52bb0, 6cdd2623, 794b24be)
    solved by the fixed vocabulary: 0 of 236 (by construction: these are its timeouts)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 17, null 17
    primitives invented: 3665 (collapse 24, collapse.generalised 138, timeout 240, timeout.generalised 1442, imagine 1821); null library 3665
    primitives kept: 5 through the gate (5 submitted, 0 refused); null arm words that solved: 4
    mean novelty distance of kept primitives: 0.2385 (hypervector distance from the nearest word of the base vocabulary)
    objectives proposed: 4, written to state/imagine/objectives.jsonl: 4 (15 were already there); patches proposed and held: 4
    ms per task: invented arm 2825.57 (admission 83.69 ms, 32 words admitted), null arm 2820.3 (admission 95.85 ms, 31.98 admitted); killed at the hard deadline 0, errors 0
    phases: mine 120.76 s (0 found a program while mining), invent 5.15 s, solve 667.61 s; wall 793.57 s; peak rss 1549 MB
    wrote bench/verdicts/imagine.json (isTheBar true)

Run 1, the earlier run of the same command with the round 1 library:

    solved with invented primitives at the same budget: 4 of 236 (28e73c20, 44f52bb0, 794b24be, d4469b4b)
    solved by the null arm (random compositions and recombinations at the same budget): 3 of 236 (31aa019c, 44f52bb0, d4469b4b)
    primitives invented: 3232 (collapse 24, collapse.generalised 138, timeout 243, timeout.generalised 1459, imagine 1368); null library 3232
    primitives kept: 4 through the gate (4 submitted, 0 refused); null arm words that solved: 4
    mean novelty distance of kept primitives: 0.2786 (hypervector distance from the nearest word of the base vocabulary)
    objectives proposed: 15, written to state/imagine/objectives.jsonl: 15 (0 were already there); patches proposed and held: 3
    phases: mine 120.19 s (0 found a program while mining), invent 6.3 s, solve 671.78 s; wall 798.35 s; peak rss 1559 MB

Seed s2, the bar's command plus `--seed s2` (another imagination draw and null draw):

    solved with invented primitives at the same budget: 4 of 236 (11852cab, 44f52bb0, 794b24be, d4469b4b)
    solved by the null arm (random compositions and recombinations at the same budget): 4 of 236 (31aa019c, 44f52bb0, 794b24be, d4469b4b)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 17, null 17
    primitives invented: 3697 (collapse 24, collapse.generalised 138, timeout 245, timeout.generalised 1473, imagine 1817); null library 3697
    primitives kept: 5 through the gate (5 submitted, 0 refused); null arm words that solved: 5
    mean novelty distance of kept primitives: 0.2857 (hypervector distance from the nearest word of the base vocabulary)
    phases: mine 119.99 s (0 found a program while mining), invent 4.29 s, solve 670.29 s; wall 794.63 s; peak rss 1594 MB

**The kept words of run 2**, each with its source, operator, novelty and held out solve (from
`bench/verdicts/imagine.json`):

| word | source | operator | novelty | solved |
| --- | --- | --- | --- | --- |
| `chain(antiTranspose,keepRareColor,antiTranspose)` | imagine | conjugate | 0.180054 | 31aa019c |
| `chain(outline8,recolorBorder)` | imagine | analogy | 0.189819 | 31aa019c |
| `chain(recolorSize4,trimBorder)` | collapse | | 0.183594 | 44f52bb0 |
| `fix(chain(rot90,gravityUp,slideLeft))` | imagine | fixpoint | 0.358154 | 794b24be |
| `chain(objectsC4,colorOf,pixel,up3)` | collapse.generalised | | 0.280884 | d4469b4b |

Run 1 kept four words:

- `fix(chain(frame,invert,hollow))` (imagine, fixpoint, 0.355469, 28e73c20);
- `chain(flipH,recolorSize4,trimBorder,flipH)` (imagine, conjugate, 0.231812, 44f52bb0);
- `chain(antiTranspose,gravityUp,recolorSize4)` (timeout.generalised, 0.246094, 794b24be);
- `chain(objectsC4,colorOf,pixel,up3)` (collapse.generalised, 0.280884, d4469b4b).

The training tasks only the invented arm solved, and the program that solved each (from the
verdicts' rows):

- 28e73c20 (run 1): `fix(chain(frame,invert,hollow))`, then localRule;
- 31aa019c (run 2): the conjugation `chain(antiTranspose,keepRareColor,antiTranspose)`, then the
  analogy `chain(outline8,recolorBorder)`, then stamp;
- 11852cab (seed s2): a superpose `both.overlay(id,outline4)`, then a per object lift
  `each.m8(symFillD4)`, then colormap.

**The imagination by round in run 2**: round 1 drew 1600 and kept 1409; round 2 drew 800 and
kept 412, with 189 rejected as memory and 148 as within the floor.

**By operator in run 2** (words in the library, then tasks solved):

| operator | words | solved |
| --- | --- | --- |
| lift.object | 237 | 0 |
| lift.cell | 234 | 0 |
| lift.layer | 239 | 0 |
| superpose | 231 | 0 |
| quarter | 172 | 0 |
| fixpoint | 238 | 1 |
| lift.select | 244 | 0 |
| analogy | 95 | 1 |
| conjugate | 131 | 1 |

## The evaluation split: the first test on tasks nothing here was written against

`node --max-old-space-size=4000 bench/imagine.mjs --split evaluation --budget-ms 3000 --workers 2
--carry` runs the same bench over the 321 evaluation tasks the fixed vocabulary timed out on
(`bench/verdicts/grid-evaluation.json`). The DSL, the combinators, the screen and every option were
written and tuned on the training split only. `--carry` adds the kept words of the training bar
runs to the invented arm (8 words) and the null words that solved to the null arm (8 words).
It printed:

    tasks 321 (the fixed vocabulary timed out on every one at 3000 ms in bench/verdicts/grid-evaluation.json)
    solved with invented primitives at the same budget: 7 of 321 (32e9702f, 45737921, 62ab2642, 9110e3c5, 929ab4e9, 9c1e755f, bf32578f)
    solved by the null arm (random compositions and recombinations at the same budget): 3 of 321 (32e9702f, 62ab2642, 642d658d)
    solved by the fixed vocabulary: 0 of 321 (by construction: these are its timeouts)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 6, null 3
    primitives invented: 4189 (collapse 14, collapse.generalised 72, timeout 330, timeout.generalised 1931, imagine 1842); null library 4189
    primitives kept: 7 through the gate (10 submitted, 0 refused); null arm words that solved: 3
    carried from state/imagine/vocabulary.json (written 2026-09-24T02:49:53.780Z): invented arm 8 words solved 1 tasks (9110e3c5), null arm 8 words solved 1 (32e9702f)
    transfer objectives in state/imagine/objectives.jsonl: 7, their word carried 7, met 1 (chain(objectsC4,colorOf,pixel,up3))
    mean novelty distance of kept primitives: 0.3165 (hypervector distance from the nearest word of the base vocabulary)
    objectives proposed: 7, written to state/imagine/partial/objectives.jsonl: 7 (23 were already there); patches proposed and held: 2
    ms per task: invented arm 2923.08 (admission 111.4 ms, 32 words admitted), null arm 2968.43 (admission 125.06 ms, 32 admitted); killed at the hard deadline 0, errors 0
    phases: mine 163.47 s (0 found a program while mining), invent 5.78 s, solve 946.17 s; wall 1115.49 s; peak rss 1546 MB
    wrote bench/verdicts/imagine-evaluation-carry-true.json (every evaluation timeout, isTheBar false)

The 7 words it kept (from the verdict's `kept`):

| word | source | operator | novelty | solved |
| --- | --- | --- | --- | --- |
| `chain(rot90,shiftUp,rot270)` | imagine | conjugate | 0.24646 | 32e9702f |
| `both.overlay(id,chain(outline8,ray4))` | imagine | superpose | 0.379395 | 32e9702f, 62ab2642 |
| `each.m8(layers(invert))` | imagine | lift.object | 0.348755 | 45737921, bf32578f |
| `fix(chain(outline8,recolorSizeRank))` | imagine | fixpoint | 0.346069 | 62ab2642 |
| `layers(symFillD4)` | imagine | lift.layer | 0.311401 | 929ab4e9 |
| `each.m8(both.overlay(id,periodicUnmask))` | imagine | lift.object | 0.394287 | 9c1e755f |
| `chain(connectHVP,symFillH)` | timeout.generalised | | 0.189209 | bf32578f |

By operator on the evaluation split (words, then solves by a word of that operator, from the
verdict's `operators`): lift.object 230/3, lift.cell 235/0, lift.layer 234/1, superpose 230/2,
quarter 171/0, fixpoint 239/1, lift.select 236/0, conjugate 167/1, analogy 100/0.

What this adds:

- **Out of sample, the invented arm solved 7 and the null 3.** Five tasks were solved by the
  invented arm alone (45737921, 9110e3c5, 929ab4e9, 9c1e755f, bf32578f) and one by the null alone
  (642d658d). On those 6 tasks a two sided sign test gives p 0.21875 (printed by the bench's
  `signTest(5, 1)` in a one off node -e). One run does not decide it; the replicate is below.
- **The combinators that solved nothing on training solve here.** Per object lift, superpose and
  per layer solved 0 training tasks in run 2; on evaluation their words have 6 of the 10 solves
  by kept words. Six of the 7 kept words come from the imagination proper, not from collapsed or
  mined chains. (A later training run, the doubt run below, drew a library whose round 1 words
  helped solve 4 training tasks: which words a draw holds decides which tasks fall.)
- **One carried word transferred.** `chain(objectsC4,colorOf,pixel,up3)`, collapsed and
  generalised from training, solved the evaluation task 9110e3c5, which meets its transfer
  objective. The other 7 carried invented words solved nothing here.
- `each.m8(both.overlay(id,periodicUnmask))` is a per object lift of a superpose. Round 1's inner
  words are base words, so this nesting can only come from round 2. That is read from the code:
  the kept record of this run did not store the round (the vocabulary stores it from round 7 of
  the bench on).

**The plan for the evaluation split, fixed at 2026-09-24T03:49:53Z before the third run started.** Three
evaluation runs with --carry: the default seed, s2 and s3. After s3 the per task sign test from
`node bench/imagine.mjs --runs` is reported as it comes out, whatever it is, and no fourth seed
is added to move it. After two runs it printed: invented ahead on 7 tasks, behind on 1, p 0.0703.

**The replicate with seed s2** (another imagination draw and null draw, the same carried words)
printed:

    solved with invented primitives at the same budget: 4 of 321 (32e9702f, 9110e3c5, a8610ef7, d2acf2cb)
    solved by the null arm (random compositions and recombinations at the same budget): 2 of 321 (32e9702f, 642d658d)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 9, null 4
    primitives invented: 4171 (collapse 14, collapse.generalised 72, timeout 331, timeout.generalised 1937, imagine 1817); null library 4171
    primitives kept: 4 through the gate (5 submitted, 0 refused); null arm words that solved: 1
    carried from state/imagine/vocabulary.json (written 2026-09-24T02:49:53.780Z): invented arm 8 words solved 1 tasks (9110e3c5), null arm 8 words solved 1 (642d658d)
    transfer objectives in state/imagine/objectives.jsonl: 7, their word carried 7, met 1 (chain(objectsC4,colorOf,pixel,up3))
    mean novelty distance of kept primitives: 0.2622 (hypervector distance from the nearest word of the base vocabulary)
    phases: mine 163.41 s (0 found a program while mining), invent 5.75 s, solve 948.34 s; wall 1117.56 s; peak rss 1562 MB
    objectives graded by the runs that tested them after they were written: 19 in state/imagine/objectives.jsonl, met 1, mixed 1, not met 11, untested 6

- The direction held (4 against 2; invented alone 3, null alone 1), but the tasks moved: of the
  first run's 7, only 32e9702f and 9110e3c5 came back. Which combinator words the imagination
  draws decides which tasks fall, so one draw is a small sample of what the space can do.
- The carried collapsed word `chain(objectsC4,colorOf,pixel,up3)` solved 9110e3c5 again: the
  one transfer that repeats.

**The third seed, s3** (run under the plan above) printed:

    solved with invented primitives at the same budget: 4 of 321 (32e9702f, 9110e3c5, 9c1e755f, d2acf2cb)
    solved by the null arm (random compositions and recombinations at the same budget): 1 of 321 (81c0276b)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 9, null 11
    paired by task: invented only 4 (32e9702f, 9110e3c5, 9c1e755f, d2acf2cb), null only 1 (81c0276b), both 0; two sided sign test on the tasks one arm alone solved: p 0.375
    by operator (words in the library / solves by a word of it): lift.object 237/1, lift.cell 234/0, lift.layer 240/0, superpose 236/1, quarter 175/0, fixpoint 245/0, lift.select 237/0, conjugate 166/0, analogy 87/1
    carried from state/imagine/vocabulary.json (written 2026-09-24T02:49:53.780Z): invented arm 8 words solved 1 tasks (9110e3c5), null arm 8 words solved 0
    phases: mine 163.37 s (0 found a program while mining), invent 5.36 s, solve 943.36 s; wall 1112.16 s; peak rss 1635 MB

It also printed `imagination by round (...): none`, which was wrong: the bench copied each word
into its library without the round, so the tally never saw one. Fixed in round 8 (the entry
keeps the round, and the line now says how many imagined words have no round instead of a
silent none); a 4 task partial run then printed `round 1 1417 words, 0 tasks; round 2 368
words, 0 tasks`.

**The pre-registered result.** After the three seeds, `node bench/imagine.mjs --runs` printed for
the evaluation split:

      pooled: invented 15, null 6 over 3 runs; invented ahead in 3, tied 0, behind 0; sign test p 0.25
      paired per run (a task one arm alone solved, once per run): invented only 12, null only 3; sign test p 0.0352 (runs share tasks, so this p is optimistic)
      paired per task (runs solved by invented minus by null, one vote per task): invented ahead 8, behind 2; sign test p 0.1094

So on tasks nothing here was written against, the invented arm solved 15 to the null's 6 over three
draws, led in every run, and is ahead on 8 tasks against 2. The per task test, the one that does
not count a task twice, gives p 0.1094: suggestive, not decided at 0.05. No fourth seed was added.

## Across runs

`node bench/imagine.mjs --runs` printed, after the evaluation replicate (lines per run left out).
It pairs the arms two ways. Per run counts a task once in every run where one arm alone solved
it; runs share tasks, so that p is optimistic. Per task gives each task one vote, the sign of
the runs the invented arm solved it in minus the runs the null did:

    training, 3000 ms, admit 32, admit fraction 0.4, imagination budget 1600: 3 runs
      pooled: invented 12, null 10 over 3 runs; invented ahead in 2, tied 1, behind 0; sign test p 0.5
      paired per run (a task one arm alone solved, once per run): invented only 5, null only 3; sign test p 0.7266 (runs share tasks, so this p is optimistic)
      paired per task (runs solved by invented minus by null, one vote per task): invented ahead 4, behind 2; sign test p 0.6875
    evaluation, 3000 ms, admit 32, admit fraction 0.4, imagination budget 1600, carried vocabulary: 2 runs
      pooled: invented 11, null 5 over 2 runs; invented ahead in 2, tied 0, behind 0; sign test p 0.5
      paired per run (a task one arm alone solved, once per run): invented only 8, null only 2; sign test p 0.1094 (runs share tasks, so this p is optimistic)
      paired per task (runs solved by invented minus by null, one vote per task): invented ahead 7, behind 1; sign test p 0.0703

(Run 1's record was backfilled from its verdict copy, and run 2's and seed s2's from theirs, since
the log was added after they ran.)

## Doubt: a check on memorising learners (round 8)

Most programs that fit every train pair and fail the test end in a learner of the DSL's top cost
(3: localRule, stamp, rayLearned; the DSL itself prices them highest). A probe
(`test/imagine-loo-probe.mjs`) rebuilds every found program in
the verdicts, checks that each rebuild reproduces its recorded right or wrong (a rebuild that
fails or disagrees is counted, not dropped), then refits the last learner on all train pairs but
one and asks it to predict the pair left out. Re-run for this note, it printed over the three
training verdicts (run 1, run 2, seed s2):

       3  right, colormap, leave one out fails every pair
       3  right, colormap, leave one out fails some pairs
       1  right, colormap, leave one out passes
       8  right, localRule, leave one out fails some pairs
       3  right, localRule, leave one out passes
       1  right, no learner
       3  right, stamp, leave one out passes
       2  wrong, colormap, leave one out fails every pair
       8  wrong, colormap, leave one out fails some pairs
       3  wrong, colormap, leave one out passes
      78  wrong, localRule, leave one out fails every pair
       1  wrong, localRule, leave one out fails some pairs
       5  wrong, stamp, leave one out fails every pair
       1  wrong, stamp, leave one out fails some pairs

and over the three evaluation verdicts (the default seed, s2, s3):

       2  right, colormap, leave one out fails every pair
       4  right, colormap, leave one out passes
       2  right, localRule, leave one out fails every pair
       3  right, localRule, leave one out passes
       3  right, no learner
       5  right, stamp, leave one out fails some pairs
       2  right, stamp, leave one out passes
      10  wrong, colormap, leave one out fails every pair
       1  wrong, colormap, leave one out fails some pairs
       6  wrong, colormap, leave one out passes
      17  wrong, localRule, leave one out fails every pair
       2  wrong, localRule, leave one out fails some pairs
       3  wrong, no learner
       2  wrong, objectRecolor, leave one out fails every pair
       1  wrong, stamp, leave one out fails some pairs

No rebuild failed or disagreed with its record (neither line was printed). A colour map does not separate (right ones often need every pair to see every colour), so it is
not asked.

`memorised(L, tr, wanted)` in `capability/grid-invent.mjs` is that check, for top cost learners.
With `--doubt`, `searchWith` keeps a memorised program as a fallback and searches on; it answers
with the fallback only when the search ends without a better one. The same rule runs in both
arms. Test 9 checks, with the search capped at the root, that a memorised fit yields to one that
is not (recolour by size) and still answers when nothing better is found. The same two toys
searched in full printed:

    sized, doubt false: status found, program ["localRule"], doubted 0, from the fallback false
    sized, doubt true: status found, program ["objectRecolor"], doubted 1, from the fallback false
    placed, doubt false: status found, program ["localRule"], doubted 0, from the fallback false
    placed, doubt true: status found, program ["kronInverse","outline8","leftHalf","colormap"], doubted 39, from the fallback false

So doubt can trade one wrong answer for another: the search goes on and may find a longer
spurious fit. It stays off by default until runs say otherwise.

**Caveat on design.** The rule was chosen on the training verdicts, but the evaluation separation
was looked at before the doubt runs, so an evaluation doubt run tests the rule's effect on
solves, not a design that never saw evaluation.

**The decision rule, fixed at 2026-09-24T04:10:37Z before any doubt run.** Two runs: the bar command
plus `--doubt`, and `--split evaluation --carry --doubt`, both on the default seed. Doubt becomes
the default only if, in BOTH runs, the invented arm solves at least as many tasks as it did
without doubt on the same seed (4 on training in run 2, 7 on evaluation) and its found but wrong
count falls. Otherwise it stays off, and the result is reported either way.

**Training, with doubt** (the bar command plus `--doubt`, 2026-09-24) printed:

    solved with invented primitives at the same budget: 7 of 236 (11852cab, 32597951, 44f52bb0, 53b68214, 794b24be, d4469b4b, ef135b50)
    solved by the null arm (random compositions and recombinations at the same budget): 3 of 236 (239be575, 44f52bb0, 4522001f)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 20, null 17
    doubt (a top cost learner that predicts no train pair from the others is kept as a fallback): tasks that doubted a program, invented arm 17, null arm 14; answered from the fallback, invented arm 16, null arm 13
    paired by task: invented only 6 (11852cab, 32597951, 53b68214, 794b24be, d4469b4b, ef135b50), null only 2 (239be575, 4522001f), both 1; two sided sign test on the tasks one arm alone solved: p 0.2891
    primitives invented: 3685 (collapse 24, collapse.generalised 138, timeout 244, timeout.generalised 1465, imagine 1814); null library 3685
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1423 words, 4 tasks (11852cab, 32597951, 53b68214, ef135b50); round 2 391 words, 0 tasks
    by operator (words in the library / solves by a word of it): lift.object 232/1, lift.cell 233/0, lift.layer 234/0, superpose 223/5, quarter 176/0, fixpoint 232/0, lift.select 241/0, analogy 102/0, conjugate 141/0
    phases: mine 120.1 s (0 found a program while mining), invent 4.28 s, solve 694.65 s; wall 819.1 s; peak rss 1491 MB
    wrote bench/verdicts/imagine-doubt-true.json (a variant of the bar, isTheBar false)

Paired against run 2 (the same command and seed without doubt) by a comparison script
(`test/imagine-doubt-compare.mjs`):

    without: node --max-old-space-size=4000 bench/imagine.mjs --split training --budget-ms 3000 --workers 2 at 2026-09-24T02:49:53.780Z (doubt false, seed imagine-bench)
    with:    node --max-old-space-size=4000 bench/imagine.mjs --split training --budget-ms 3000 --workers 2 --doubt at 2026-09-24T04:25:41.854Z (doubt true, seed imagine-bench)
    invented: solved 4 -> 7; found but wrong 17 -> 20; gained 4 (11852cab (was wrong), 32597951 (was timeout), 53b68214 (was timeout), ef135b50 (was timeout)); lost 1 (31aa019c (timeout))
      tasks that doubted a program 17; answered from the fallback 16 (right 0)
      as a flag (with): answers from the fallback 16, right 0; other answers 11, right 7; solved tasks that had doubted a program 0
      changes: solved -> timeout 1, timeout -> solved 3, timeout -> wrong 6, wrong -> solved 1, wrong -> timeout 2
    null: solved 3 -> 3; found but wrong 17 -> 17; gained 2 (239be575 (was wrong), 4522001f (was timeout)); lost 2 (6cdd2623 (timeout), 794b24be (wrong))
      tasks that doubted a program 14; answered from the fallback 13 (right 0)
      as a flag (with): answers from the fallback 13, right 0; other answers 7, right 3; solved tasks that had doubted a program 0
      changes: solved -> timeout 1, solved -> wrong 1, timeout -> solved 1, timeout -> wrong 5, wrong -> solved 1, wrong -> timeout 5

The same script on run 1 against run 2, neither with doubt, is the control for how far two runs
of one configuration move on their own:

    without: node --max-old-space-size=4000 bench/imagine.mjs --split training --budget-ms 3000 --workers 2 at 2026-09-24T02:33:15.606Z (doubt false, seed imagine-bench)
    with:    node --max-old-space-size=4000 bench/imagine.mjs --split training --budget-ms 3000 --workers 2 at 2026-09-24T02:49:53.780Z (doubt false, seed imagine-bench)
    invented: solved 4 -> 4; found but wrong 15 -> 17; gained 1 (31aa019c (was timeout)); lost 1 (28e73c20 (timeout))
      changes: solved -> timeout 1, timeout -> solved 1, timeout -> wrong 4, wrong -> timeout 2
    null: solved 3 -> 3; found but wrong 15 -> 17; gained 2 (6cdd2623 (was timeout), 794b24be (was wrong)); lost 2 (31aa019c (wrong), d4469b4b (wrong))
      changes: solved -> wrong 2, timeout -> solved 1, timeout -> wrong 4, wrong -> solved 1, wrong -> timeout 3

What that says:

- **Doubt stays off.** The invented arm's found but wrong count rose (17 to 20), so the rule fixed
  above fails on the first of its two runs. The evaluation run is still made, to finish the pair
  and to test the flag out of sample.
- **The rise in solves (4 to 7) is not doubt's.** No solved task had doubted a program, in either
  arm. The libraries differ (3665 words in run 2, 3685 here: mining runs against a clock), and
  the control's changes line shows invented arm tasks moving with no doubt at all. The 4 new solves
  are the 4 tasks round 1 imagined words helped solve (the round line above).
- **Doubt barely changes an answer.** Of 17 invented arm tasks that doubted a program, 16 ended on
  the fallback; the search on found nothing better in the budget. Where it did go on (5117e062, in
  both arms) it found another wrong program, as the toy predicted.
- **As a flag it is exact on this run.** Every answer from the fallback was wrong (16 of 16
  invented, 13 of 13 null), and no right answer was flagged. So the solver can say which of its
  answers are guesses: 16 of the invented arm's 20 wrong answers carry the flag. These are the
  training tasks the rule was chosen on, so the evaluation run is the test of it.

**Evaluation, with doubt** (`--split evaluation --carry --doubt`, the default seed) printed:

    carried from state/imagine/vocabulary.json: invented arm 8 words, null arm 8
    solved with invented primitives at the same budget: 4 of 321 (9110e3c5, 929ab4e9, 9c1e755f, f823c43c)
    solved by the null arm (random compositions and recombinations at the same budget): 1 of 321 (62ab2642)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 7, null 9
    doubt (a top cost learner that predicts no train pair from the others is kept as a fallback): tasks that doubted a program, invented arm 5, null arm 4; answered from the fallback, invented arm 4, null arm 4
    paired by task: invented only 4 (9110e3c5, 929ab4e9, 9c1e755f, f823c43c), null only 1 (62ab2642), both 0; two sided sign test on the tasks one arm alone solved: p 0.375
    primitives invented: 4182 (collapse 14, collapse.generalised 72, timeout 331, timeout.generalised 1937, imagine 1828); null library 4182
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1431 words, 0 tasks; round 2 397 words, 3 tasks (929ab4e9, 9c1e755f, f823c43c)
    by operator (words in the library / solves by a word of it): lift.object 233/1, lift.cell 238/0, lift.layer 241/1, superpose 221/0, quarter 173/0, fixpoint 234/1, lift.select 239/0, conjugate 163/0, analogy 86/0
    carried from state/imagine/vocabulary.json (written 2026-09-24T02:49:53.780Z): invented arm 8 words solved 1 tasks (9110e3c5), null arm 8 words solved 0
    phases: mine 163.22 s (0 found a program while mining), invent 5.27 s, solve 954.28 s; wall 1122.85 s; peak rss 1557 MB
    wrote bench/verdicts/imagine-evaluation-carry-true-doubt-true.json (every evaluation timeout, isTheBar false)

Paired against the evaluation run on the same seed without doubt:

    without: node --max-old-space-size=4000 bench/imagine.mjs --split evaluation --budget-ms 3000 --workers 2 --carry at 2026-09-24T03:27:51.315Z (doubt false, seed imagine-bench)
    with:    node --max-old-space-size=4000 bench/imagine.mjs --split evaluation --carry --doubt at 2026-09-24T04:46:25.158Z (doubt true, seed imagine-bench)
    invented: solved 7 -> 4; found but wrong 6 -> 7; gained 1 (f823c43c (was timeout)); lost 4 (32e9702f (wrong), 45737921 (timeout), 62ab2642 (wrong), bf32578f (timeout))
      tasks that doubted a program 5; answered from the fallback 4 (right 0)
      as a flag (with): answers from the fallback 4, right 0; other answers 7, right 4; solved tasks that had doubted a program 1
      changes: solved -> timeout 2, solved -> wrong 2, timeout -> solved 1, wrong -> timeout 1
    null: solved 3 -> 1; found but wrong 3 -> 9; gained 0; lost 2 (32e9702f (wrong), 642d658d (wrong))
      tasks that doubted a program 4; answered from the fallback 4 (right 0)
      as a flag (with): answers from the fallback 4, right 0; other answers 6, right 1; solved tasks that had doubted a program 0
      changes: solved -> wrong 2, timeout -> wrong 4

**The decision: doubt stays off.** The invented arm solved fewer (7 to 4) and its found but wrong
count rose (6 to 7), so the rule fails on this run as well as on training. That is final for
this round; the default is unchanged.

**The rule measured the draw, not doubt.** It compared two runs whose libraries differ (4189
words without doubt here, 4182 with). A fair measure stays inside one run: without doubt,
`searchWith` returns its first fit, and that first fit is exactly what doubt keeps aside as the
fallback (read from the code: `if (!fallback) fallback = r; continue;` where the plain path is
`if (r) return r;`). So doubt changed an answer only where a task doubted and did not end on the
fallback. A listing script (`test/imagine-doubt-changed.mjs`) printed, for training:

    invented: answers doubt changed (doubted, not ended on the fallback): 1 (5117e062 (wrong))
    invented: tasks gained or lost against the run without doubt: 11852cab gained, doubted 0; 31aa019c lost, doubted 0; 32597951 gained, doubted 0; 53b68214 gained, doubted 0; ef135b50 gained, doubted 0
    null: answers doubt changed (doubted, not ended on the fallback): 1 (5117e062 (wrong))
    null: tasks gained or lost against the run without doubt: 239be575 gained, doubted 0; 4522001f gained, doubted 0; 6cdd2623 lost, doubted 0; 794b24be lost, doubted 0

and for evaluation:

    invented: answers doubt changed (doubted, not ended on the fallback): 1 (f823c43c (solved))
    invented: tasks gained or lost against the run without doubt: 32e9702f lost, doubted 0; 45737921 lost, doubted 0; 62ab2642 lost, doubted 0; bf32578f lost, doubted 0; f823c43c gained, doubted 1
    null: answers doubt changed (doubted, not ended on the fallback): 0
    null: tasks gained or lost against the run without doubt: 32e9702f lost, doubted 0; 642d658d lost, doubted 0

- Every task gained or lost between the runs had doubted nothing, except f823c43c: the losses
  (32e9702f among them, solved in all three evaluation runs without doubt) came from the draw.
- Inside the runs, doubt changed one invented arm answer each time: 5117e062 on training (still
  wrong) and f823c43c on evaluation, solved after the search went on past a doubted fit, by a
  round 2 word. The fallback it replaced was not scored; fallbacks were right 0 times in both runs.
- **The flag held out of sample.** On evaluation every answer from the fallback was wrong again
  (4 of 4 in each arm).

So doubt is a sound signal and a weak change to the search: it marks guesses, and at this budget
the search rarely finds anything better once it has doubted. Scoring the fallback inside the run
would measure the change exactly; that is not built.

## The shape suites (round 9)

Four objectives ask for a combinator that solves a timeout of a shape class nothing solved. Each
names its suite: the bar command plus `--shape <class>`, which mines, imagines and solves on
that class's training timeouts only (the mult run mined 22 timeout words, where run 2, over all
236, mined 240). Run one after another, they printed:

**`--shape mult`**

    tasks 10 (the fixed vocabulary timed out on every one at 3000 ms in bench/verdicts/grid.json)
    solved with invented primitives at the same budget: 1 of 10 (4522001f)
    solved by the null arm (random compositions and recombinations at the same budget): 1 of 10 (4522001f)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 0, null 0
    primitives invented: 2164 (collapse 24, collapse.generalised 138, timeout 22, timeout.generalised 137, imagine 1843); null library 2164
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1453 words, 1 tasks (4522001f); round 2 390 words, 0 tasks
    by operator (words in the library / solves by a word of it): lift.object 225/0, lift.cell 227/0, lift.layer 238/0, superpose 233/0, quarter 175/0, fixpoint 226/1, lift.select 241/0, conjugate 167/0, analogy 111/0

**`--shape mult+other`**

    tasks 2 (the fixed vocabulary timed out on every one at 3000 ms in bench/verdicts/grid.json)
    solved with invented primitives at the same budget: 0 of 2
    solved by the null arm (random compositions and recombinations at the same budget): 0 of 2
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 0, null 0
    primitives invented: 1986 (collapse 24, collapse.generalised 138, timeout 3, timeout.generalised 18, imagine 1803); null library 1986
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1442 words, 0 tasks; round 2 361 words, 0 tasks
    by operator (words in the library / solves by a word of it): lift.object 225/0, lift.cell 221/0, lift.layer 223/0, superpose 223/0, quarter 174/0, fixpoint 234/0, lift.select 238/0, conjugate 162/0, analogy 103/0

**`--shape smaller+same`**

    tasks 1 (the fixed vocabulary timed out on every one at 3000 ms in bench/verdicts/grid.json)
    solved with invented primitives at the same budget: 0 of 1
    solved by the null arm (random compositions and recombinations at the same budget): 0 of 1
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 0, null 0
    primitives invented: 1942 (collapse 24, collapse.generalised 138, imagine 1780); null library 1942
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1426 words, 0 tasks; round 2 354 words, 0 tasks
    by operator (words in the library / solves by a word of it): lift.object 230/0, lift.cell 226/0, lift.layer 228/0, superpose 227/0, quarter 176/0, fixpoint 224/0, lift.select 233/0, conjugate 164/0, analogy 72/0

**`--shape other+mult`**

    tasks 2 (the fixed vocabulary timed out on every one at 3000 ms in bench/verdicts/grid.json)
    solved with invented primitives at the same budget: 1 of 2 (53b68214)
    solved by the null arm (random compositions and recombinations at the same budget): 0 of 2
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 0, null 0
    primitives invented: 1954 (collapse 24, collapse.generalised 138, timeout 4, timeout.generalised 24, imagine 1764); null library 1954
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1413 words, 1 tasks (53b68214); round 2 351 words, 0 tasks
    by operator (words in the library / solves by a word of it): lift.object 235/0, lift.cell 228/0, lift.layer 224/0, superpose 218/2, quarter 175/0, fixpoint 232/0, lift.select 234/0, conjugate 152/0, analogy 66/0

and `node bench/imagine.mjs --objectives` graded them:

      met | shape | a combinator built for mult shape tasks solves at least one of the 10 mult timeouts nothing solved | bar >= 1 | measured 1 in 1 run | null arm on the same metric 1
      not met | shape | a combinator built for mult+other shape tasks solves at least one of the 2 mult+other timeouts nothing solved | bar >= 1 | measured 0 in 1 run | null arm on the same metric 0
      not met | shape | a combinator built for smaller+same shape tasks solves at least one of the 1 smaller+same timeouts nothing solved | bar >= 1 | measured 0 in 1 run | null arm on the same metric 0
      met | shape | a combinator built for other+mult shape tasks solves at least one of the 2 other+mult timeouts nothing solved | bar >= 1 | measured 1 in 1 run | null arm on the same metric 0

- **other+mult is met beyond the null**: 53b68214, by a round 1 word, where the null solved nothing.
- **mult is met on its bar, not beyond the null**: the null solved the same task, 4522001f.
- **mult+other and smaller+same are not met**: neither arm solved a task.
- These are 10, 2, 1 and 2 tasks, one run each. They say the classes are not closed to the
  imagination, not that it beats recombination on them.

**The grade now carries its control.** A shape bar (and the screen bar) counts the invented arm
alone, although every objective names the null arm as its control, so the first mult grade
read "met" with nothing said about the null that solved the same task. The grading now reads
the null arm's value on the same metric from the same run (`controlOf` in `bench/imagine.mjs`)
and prints it beside the measure. The status still follows the bar as it was written; no bar
was changed.

**File naming.** A shape suite now writes `imagine-shape-<class>-partial.json`. The mult suite ran
before that fix, wrote the shared `imagine-partial.json`, and was copied to
`bench/verdicts/imagine-shape-mult-partial.json` before the next suite could overwrite it.

## The screen suite: admitting 64 words instead of 32

The screen objective predicted that admitting 64 words per task instead of 32 solves more timeouts
in the invented arm without losing the lead over the null. Its suite (the bar command plus
`--admit 64`) printed:

    solved with invented primitives at the same budget: 5 of 236 (32597951, 44f52bb0, 53b68214, 794b24be, d4469b4b)
    solved by the null arm (random compositions and recombinations at the same budget): 5 of 236 (11852cab, 44f52bb0, 6773b310, 6cdd2623, d4469b4b)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 13, null 15
    paired by task: invented only 3 (32597951, 53b68214, 794b24be), null only 3 (11852cab, 6773b310, 6cdd2623), both 2; two sided sign test on the tasks one arm alone solved: p 1
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1410 words, 3 tasks (32597951, 44f52bb0, 53b68214); round 2 409 words, 0 tasks
    by operator (words in the library / solves by a word of it): lift.object 236/0, lift.cell 238/0, lift.layer 236/0, superpose 229/4, quarter 176/0, fixpoint 231/0, lift.select 242/0, analogy 102/0, conjugate 129/0
    phases: mine 120.18 s (0 found a program while mining), invent 4.71 s, solve 674.51 s; wall 799.48 s; peak rss 1536 MB
    wrote bench/verdicts/imagine-admit-64.json (a variant of the bar, isTheBar false)

- **Met on its bar, failed on its own words.** The bar counts the invented arm alone (more than 4),
  and it solved 5. But the hypothesis also says "without losing the lead over the null", and the
  null solved 5 too: run 2 at 32 led 4 to 3, this run is level. The bar the template wrote encoded
  only the first clause. That is the template's defect, reported here, not a reason to regrade.
- One run, and runs of one configuration move on their own (the control above), so this does not
  show that a wider screen helps either arm.

## The budget suite: twice the clock

The budget objective, written by run 1, predicted that at 6000 ms the invented arm leads the null
by more than the 1 it led by at 3000 ms. Its suite (the bar command with `--budget-ms 6000`)
printed:

    tasks 236 (the fixed vocabulary timed out on every one at 3000 ms in bench/verdicts/grid.json)
    solved with invented primitives at the same budget: 10 of 236 (11852cab, 2dee498d, 32597951, 44f52bb0, 4522001f, 53b68214, 6773b310, 73251a56, 794b24be, d4469b4b)
    solved by the null arm (random compositions and recombinations at the same budget): 6 of 236 (31aa019c, 44f52bb0, 6cdd2623, 794b24be, ae4f1146, d4469b4b)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 18, null 19
    paired by task: invented only 7 (11852cab, 2dee498d, 32597951, 4522001f, 53b68214, 6773b310, 73251a56), null only 3 (31aa019c, 6cdd2623, ae4f1146), both 3; two sided sign test on the tasks one arm alone solved: p 0.3438
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1421 words, 6 tasks (11852cab, 2dee498d, 32597951, 4522001f, 53b68214, 73251a56); round 2 400 words, 1 tasks (53b68214)
    by operator (words in the library / solves by a word of it): lift.object 238/1, lift.cell 236/0, lift.layer 238/0, superpose 230/6, quarter 173/0, fixpoint 235/1, lift.select 240/0, analogy 91/0, conjugate 140/2
    primitives kept: 14 through the gate (17 submitted, 0 refused); null arm words that solved: 7
    phases: mine 119.97 s (0 found a program while mining), invent 4.52 s, solve 1303.94 s; wall 1428.52 s; peak rss 1992 MB
    wrote bench/verdicts/imagine-budgetms-6000.json (a variant of the bar, isTheBar false)

A listing script (`test/imagine-new-at-budget.mjs`) read `state/imagine/runs.jsonl` and printed:

    earlier training runs read: 9 (the bar, the bar, seed-s2, doubt-true, the bar shape mult, the bar shape mult+other, the bar shape smaller+same, the bar shape other+mult, admit-64)
    6000 ms invented arm, solved in no earlier training run by either arm: 2 of 10 (2dee498d, 73251a56)
    6000 ms null arm, solved in no earlier training run by either arm: 1 of 6 (ae4f1146)

- **Met on its bar in this run.** The lead measured 4, above the bar of 1.
- **The doubled clock changed the solve, not the library.** Mining ran 119.97 s here and 120.76 s
  in run 2, on the same mining clock, and the libraries are the same kind of draw (3699 words
  here, 3665 in run 2). Every solve in both arms used an added word (0 without one).
- **Both arms gained.** The invented arm solved 10 where the three 3000 ms runs of the bar solved
  4 each; the null solved 6 where they solved 3, 3 and 4. Most of the gain is tasks some arm had
  already solved in an earlier run; the listing above names the ones no earlier training run had.
- **Not decided.** One run. Per task, invented ahead 7, behind 3, sign test p 0.3438. And a lead of the
  same size has come from a single 3000 ms run: the doubt run printed 7 against 3, where doubt
  changed one invented answer inside the run, so most of that lead was the draw. This meets the
  written bar; it does not show that the lead grows with the clock.

**The replicate with seed s2** (another imagination draw and null draw, the same clock) printed:

    solved with invented primitives at the same budget: 6 of 236 (2dee498d, 32597951, 44f52bb0, 53b68214, 794b24be, d4469b4b)
    solved by the null arm (random compositions and recombinations at the same budget): 8 of 236 (11852cab, 31aa019c, 44f52bb0, 4522001f, 6773b310, 794b24be, cf98881b, f8b3ba0a)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 22, null 20
    paired by task: invented only 4 (2dee498d, 32597951, 53b68214, d4469b4b), null only 6 (11852cab, 31aa019c, 4522001f, 6773b310, cf98881b, f8b3ba0a), both 2; two sided sign test on the tasks one arm alone solved: p 0.7539
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1413 words, 3 tasks (2dee498d, 32597951, 53b68214); round 2 393 words, 1 tasks (53b68214)
    by operator (words in the library / solves by a word of it): lift.object 237/0, lift.cell 243/0, lift.layer 239/0, superpose 229/4, quarter 175/0, fixpoint 226/0, lift.select 229/0, conjugate 130/0, analogy 98/0
    phases: mine 120.14 s (0 found a program while mining), invent 4.3 s, solve 1301.63 s; wall 1426.16 s; peak rss 2301 MB
    wrote bench/verdicts/imagine-budgetms-6000-seed-s2.json (a variant of the bar, isTheBar false)

and `node bench/imagine.mjs --runs` printed for the two 6000 ms runs:

      pooled: invented 16, null 14 over 2 runs; invented ahead in 1, tied 0, behind 1; sign test p 1
      tasks by runs solved, invented: 2dee498d 2, 32597951 2, 44f52bb0 2, 53b68214 2, 794b24be 2, d4469b4b 2, 11852cab 1, 4522001f 1, 6773b310 1, 73251a56 1
      tasks by runs solved, null: 31aa019c 2, 44f52bb0 2, 794b24be 2, 11852cab 1, 4522001f 1, 6773b310 1, 6cdd2623 1, ae4f1146 1, cf98881b 1, d4469b4b 1, f8b3ba0a 1
      paired per run (a task one arm alone solved, once per run): invented only 11, null only 9; sign test p 0.8238 (runs share tasks, so this p is optimistic)
      paired per task (runs solved by invented minus by null, one vote per task): invented ahead 5, behind 5; sign test p 1

The listing script, rewritten to compare each 6000 ms run with every 3000 ms training run
(`test/imagine-new-at-budget-2.mjs`), printed:

    3000 ms training runs read: 9; 6000 ms training runs: 2
    6000 ms seed imagine-bench, invented arm, solved in no 3000 ms training run by either arm: 2 of 10 (2dee498d, 73251a56)
    6000 ms seed imagine-bench, null arm, solved in no 3000 ms training run by either arm: 1 of 6 (ae4f1146)
    6000 ms seed s2, invented arm, solved in no 3000 ms training run by either arm: 1 of 6 (2dee498d)
    6000 ms seed s2, null arm, solved in no 3000 ms training run by either arm: 2 of 8 (cf98881b, f8b3ba0a)

and `node bench/imagine.mjs --objectives` now grades the budget objective:

      mixed | budget | at 6000 ms the invented arm leads the null by more than the 1 it leads by at 3000 ms | bar > 1 | measured 4, -2 in 2 runs

- **The lead did not replicate.** Invented 6, null 8: the null led this time (by task, invented
  alone 4, null alone 6, p 0.7539). The budget objective is now mixed (measured 4, then -2).
- **Over both runs the arms are level.** Pooled, invented 16 and null 14; per task, invented ahead
  5 and behind 5, sign test p 1. The first run's lead of 4 was the draw, as the bullet above
  warned it might be.
- **The clock helps both arms.** At 6000 ms the invented arm solved 10 and 6 and the null 6 and 8,
  where the three 3000 ms runs of the bar printed 4, 4 and 4 against 3, 3 and 4. What the doubled
  clock opened, it opened to either arm: 2dee498d fell to the invented arm in both 6000 ms runs
  and in no 3000 ms run, and the null took three tasks no 3000 ms run solved, each in one run.

## Round 10: met, read against its control

Round 9 printed the null arm's value beside a shape or screen grade. Round 10 counts it: each such
grade says in how many runs the invented arm went beyond the null on the same metric (a tie is
not beyond), and the summary line counts the met objectives the null matched in a run.
`node bench/imagine.mjs --objectives` printed, after the first budget run:

    objectives in state/imagine/objectives.jsonl: 19; logged runs: 14; met 5, mixed 1, not met 13, untested 0; met, but the null arm matched it on the same metric in a run: 2

and, for the objectives with a lead bar or a same metric control:

      met | budget | at 6000 ms the invented arm leads the null by more than the 1 it leads by at 3000 ms | bar > 1 | measured 4 in 1 run
      met | shape | a combinator built for mult shape tasks solves at least one of the 10 mult timeouts nothing solved | bar >= 1 | measured 1 in 1 run | null arm on the same metric 1 | beyond the null in 0 of 1 run
      met | screen | admitting 64 words per task instead of 32 solves more timeouts in the invented arm without losing the lead over the null | bar > 4 | measured 5 in 1 run | null arm on the same metric 5 | beyond the null in 0 of 1 run
      not met | shape | a combinator built for mult+other shape tasks solves at least one of the 2 mult+other timeouts nothing solved | bar >= 1 | measured 0 in 1 run | null arm on the same metric 0 | beyond the null in 0 of 1 run
      not met | shape | a combinator built for smaller+same shape tasks solves at least one of the 1 smaller+same timeouts nothing solved | bar >= 1 | measured 0 in 1 run | null arm on the same metric 0 | beyond the null in 0 of 1 run
      met | shape | a combinator built for other+mult shape tasks solves at least one of the 2 other+mult timeouts nothing solved | bar >= 1 | measured 1 in 1 run | null arm on the same metric 0 | beyond the null in 1 of 1 run

- **2 of the 5 met objectives were matched by the null**: the mult shape (1 against 1) and the
  screen (5 against 5). Of the other three, the budget bar subtracts the null already, other+mult
  went beyond it in 1 of 1 run, and the transfer has no same metric control.
- **The transfer control is gone.** Round 9 read a transfer's control as the number of null words
  carried. That counts 8 words where the transfer metric counts one, so it was not the same
  metric. A transfer now carries no control, and a test holds it there.
- **The screen template now bars what it says.** Its hypothesis claimed "without losing the lead
  over the null" while its bar counted the invented arm alone. A new screen objective states the
  lead and bars the lead (invented minus null), as the budget template does. The screen objective
  already written keeps the bar it was written with, so it stays met, and the new column shows
  the null matched it. A test grades one level run (5 against 5) both ways: met under the old
  bar, not met under the lead bar.
- No bar was changed and no objective was rewritten; only the template for new ones.

## What it says, and what it does not

- **Board 24a, decided from the rows: not met.** Over three seeds in one launch the invented arm
  led the null by 5, 4 and -1 (mean 2.6667) against a seed to seed band of 6. Per task it was ahead
  on 10 and behind on 4 (p 0.1796). The lead is there on average and smaller than what one seed's
  draw moves. The DreamCoder library arm did not change that: its routines were never used.
- **On training, imagination does not clearly beat recombination.** The invented arm solved 4 in
  each of 3 runs; the null solved 3, 3 and 4. Invented was ahead in 2 runs and tied in 1 (sign
  test p 0.5). The invented arm was steadier: 3 tasks came back in all 3 runs.
- **Out of sample it did better in all three runs: 7 against 3, 4 against 2, 4 against 1.** Per
  task over the three, invented was ahead on 8 tasks and behind on 2 (sign test p 0.1094). That is
  suggestive, not decided, and it was the number fixed in advance.
- **Why the null is strong.** It draws from the same memory: collapsed solved programs and mined
  partials. It also passes through the same task conditioned screen. Much of the lift in both
  arms is depth compression (a 3 or 4 step chain costs 1) chosen per task by the screen.
- **What the null cannot say.** The null composes chains. The imagination's combinators (per
  object, per layer, superpose, fixed point, select) are shapes of program the chain grammar has
  no way to write, and on evaluation they did most of the solving. The combinators themselves
  were written by hand; what the imagination does is find which ones, over which inner words,
  are new and worth trying, and keep only what solves a task it was not built from.
- **At twice the clock both arms solved more, and the lead did not grow.** 10 against 6, then
  6 against 8; per task over the two runs, invented ahead 5, behind 5 (p 1). The
  budget objective is mixed.
- **Found but wrong.** On training both arms found 17 programs that fit every train pair and fail
  the test. Most end in localRule or stamp, fitted on grids an added word produced. This is
  acceptance, not imagination, and changes both arms alike. Round 8 tried a check on it (doubt,
  above): the check marks those answers as guesses but turns none of them into a solve, so it
  stays off.

## Vision: the objectives it wrote, and how they stand

Run 1 proposed 15 objectives from its own measurements and wrote all 15 to
`state/imagine/objectives.jsonl`. Run 2 read those as memory and proposed 4 new ones. The file
holds 19. Variant runs write theirs under `state/imagine/partial/`. The templates:

- **lead**: beat the null by more than now.
- **budget**: at twice the clock, the lead grows.
- **transfer**: a kept word solves an evaluation timeout.
- **shape**: a combinator for a shape class that nothing solved.
- **operator**: an operator nested one level deeper beats its current count.
- **screen**: admitting 64 words instead of 32.

Each objective names a runnable suite (a `node bench/...` command), a bar with a metric,
comparison and value, and the null arm as its control, and passed the gate on that basis.

**Grading closes the loop.** An objective is a prediction, so it is graded only by runs that
started after it was written, whose command runs its suite (the only extra options allowed are a
seed, a carry and quiet), and, for a transfer, only by a run that carried the word. The metric is
read from the run's log record. `node bench/imagine.mjs --objectives` printed, after the budget
replicate, the last suite to run:

    objectives in state/imagine/objectives.jsonl: 19; logged runs: 15; met 4, mixed 2, not met 13, untested 0; met, but the null arm matched it on the same metric in a run: 2

- **met (4)**: the transfer of `chain(objectsC4,colorOf,pixel,up3)` (1 in each of 3 runs); the
  other+mult shape, beyond the null; the mult shape and the screen, both matched by the null on
  the same metric.
- **mixed (2)**: analogy nested deeper (measured 1, then 0; bar above 0), and the budget lead
  (measured 4, then -2; bar above 1).
- **not met (13)**: the lead (measured 1, then 0; bar above 1), the other 6 transfers (0 in each of
  3 runs), the mult+other and smaller+same shapes (neither arm solved a task), and the operator
  objectives for lift.cell, lift.layer, conjugate and fixpoint.
- **untested (0)**: every objective's suite has now run at least once after it was written.

## Tests

`node --test test/imagine.test.mjs` on node v24.15.0, after the board 31 bar run: `ℹ tests 22`,
`ℹ pass 22`, `ℹ fail 0` (duration_ms 7464.9596); after the board 24a bar run it printed 17 of 17.
The tests check:

- a stored word, an exact knowledge title and a word within the floor are rejected, while a
  control operator in the same call proves the path can return something;
- a candidate equal to what the null's recombination reaches is rejected, and the null library
  is distinct, typed and the size asked for;
- a planted per object mirror task times out on the fixed vocabulary at 400 ms and is solved by
  a word the imagination invented from the base vocabulary alone, admitted by the screen, then
  kept through the gate;
- every objective template yields a suite, a bar and a control that the gate approves (the screen
  template states the lead and bars the lead), one without a control or without a suite is
  rejected, and re-proposing from the same facts yields nothing new;
- the combinators compute what their keys say, on a hand checked grid (flip per object, under,
  overlay, select smallest, select topmost, a tie that selects nothing, a fixed point) and round
  2 nests round 1;
- the vocabulary refuses a word that solved nothing, solved only its own source, or has no
  novelty, and admits it only on a held out solve; a forged provenance is rejected; a patch is
  held;
- an objective is graded only by a later run of its own suite: the run it was read off gives
  untested, a changed option is another suite, a transfer needs a run that carried the word, and a
  shape grade carries the null arm's value beside its own (a lead bar already subtracts it), a
  tie is not beyond the null, a transfer carries no control, and a screen bar written on the lead
  reads a level run as not met while one written on the invented count keeps that bar; the sign
  test, the runs table and the merge of kept words are checked by hand;
- the arms are paired by task: `pairedOf` returns the tasks one arm alone solved, and the runs
  table counts a task once per run in the per run pairing but gives it one vote in the per task
  pairing;
- a memorised program is doubted: `memorised` is true for a localRule that predicts neither pair
  from the other, false for one that does, false for a colour map and for one train pair; with
  doubt, the search prefers a fit that is not memorised and still answers with the fallback when
  it finds nothing better; doubt is off by default;
- (board 24a) the bar is met only when the mean lead over at least three seeds is strictly above
  the band: met at leads 3, 4, 2 (band 2); not met with two seeds, at a mean lead equal to the band
  (1, 2, 3), with a lead of 5 in every seed when the counts move 6, or behind the control; the
  band is the largest of the three ranges; a row that is not a number is not a seed; the bench
  defaults to the three bar seeds and refuses a repeated seed;
- a task votes once over the seeds, and a task both arms solved equally often casts no vote;
- the sleep keeps a routine only when it shortens the corpus: a two word fragment used twice
  (gain 0) is not kept, used three times it is (gain 1, the corpus shorter by exactly the gain), a
  routine holds an earlier one (7 uses then 3, description length 17 to 11), one added word of
  three tokens used twice is kept, and lambda 2 keeps nothing;
- a solved program is read into steps (the learned last step dropped, an added word looked up by
  key, null for a name it cannot read) and a run of steps into one word (base words chain, the
  rest make a seq, a nested seq flattens);
- the refit draw favours what solved: counts and operator slots are what the programs hold, a
  word with 1000 uses is drawn more than half the time and under a fifth without a prior, a
  routine is drawn by its uses, and without a prior each operator is drawn once a cycle;
- the library arm never offers a task a word its own program shaped: base words first, a
  routine keeps the programs it came from as sources, every word imagined under the prior carries
  the tasks that fed it, `offerable` drops each of them for those tasks and offers everything to a
  task that fed nothing, and the cap holds;
- a fold is slept only on the solved programs of the other fold: the fold of an id never changes,
  both folds hold tasks, and `sleepCorpus` reads neither its own fold, nor an unsolved or found but
  wrong program, nor one it cannot read;
- the bar command is not a variant (`--seed s2` and `--no-library` are), and on both ARC splits the
  split names the cross fitting and gives `contaminated` as a reason, never false; (board 31) the
  split names the development ids, the held out ids (no id in both), the seeds and the runs;
- (board 28) the band is the larger of the seed to seed and the run to run band: a second run that
  moves every count by 4 sets a band of 4 and unmeets a mean lead of 3 the seeds alone met, the same
  run twice gives a run to run band of 0, a move of the lead alone binds, equal bands are named, and
  one run (or a run number repeated, or a seed missing from run 2) never meets the bar;
- (board 28) results apply in job order whatever order they finish in, and job j is offered only
  the words of jobs up to j minus LAG: two stages whose jobs finish in different random orders
  offer every job the same words, while offering every word applied so far (the board 24a way)
  differs with the order (the control);
- (board 28) a search under a work budget draws the same library and the same solves on any
  clock: on a small planted set (the planted scene, the same scenes mirrored inside each object's
  box, and a noise task), mining, the invented library, the admission and the solves are identical
  twice and again with a word that burns 4 ms of wall clock per call; the planted mirror is solved,
  the noise task times out by work, an admission cut by work stops at the same word; the control:
  under a WALL budget the same slow word cuts the same search short (fewer states searched);
- (board 28) a grid verdict ran the whole split by its own counts, not by its isTheBar (board 26
  writes the training grid.json with isTheBar false), and the bar command is the defaults: the work
  budgets and two runs;
- (board 31) the bench refuses a cfg without seeds or runs instead of defaulting them.

`node --test test/grid.test.mjs` stayed green: 7 of 7 (duration_ms 725.5325), before board 24a; it
was not re-run in board 24a (the brief runs only this item's own test files).

`node test/imagine.mutants.mjs` breaks one required check at a time and runs the suite. It
printed, after the board 31 bar run (the bar had exited and no imagine partial was younger than ten
minutes), `baseline: 22 tests, all pass` and `mutants killed 42 of 42`, exit 0; the three source files
were compared byte for byte against copies taken before and came back identical. After the board 24a
bar run it printed 31 of 31 over 17 tests (before board 24a: 21 of 21 over 9 tests). The guard's
control: with `bench/verdicts/imagine-guardcontrol-partial.json` written a moment before (then
removed), the harness printed `refused: bench/verdicts/imagine-guardcontrol-partial.json is 0 s old;
...` and exited 2 without touching a file. The mutants:

- the memory, knowledge, null and floor checks turned off;
- the held out rule, novelty rule and control requirement removed;
- the vocabulary skipping the gate;
- the per object lift made the identity;
- select picking every object;
- under behaving as overlay;
- round 2 not nesting;
- grading that ignores time order;
- a transfer graded without a carry;
- pairing that counts shared tasks as one arm's;
- a task that votes once per run instead of once;
- `memorised` never true;
- doubt dropping the fallback;
- an objective's control never read;
- a tie counted as beyond the null;
- a lead bar read as a count;
- (board 24a) a mean lead equal to the band meeting the bar; the band taken as the lead range
  alone; the bar needing no seeds; a fold sleeping on its own programs; the sleep reading a
  program that was not solved; `offerable` offering a task its own words; a word imagined under
  the prior forgetting what fed it; the sleep keeping a routine that gains nothing; the prior
  never reaching the operator draw; a program keeping its learned last step;
- (board 28) the band ignoring the run to run band; one run meeting the bar; a repeated run number
  counted as a second run; the run to run band reading the lead alone; results applied in the order
  they finish; a job seeing the words of the job just before it; a grid run whole only as a bar; the
  search budget reading the wall clock; the admission budget reading the wall clock;
- (board 31) the bench defaulting a cfg without seeds; the split forgetting the held out ids.

**A mutant that never ran was counted as killed.** The first version of the last mutant left an
unbalanced parenthesis, so `bench/imagine.mjs` failed to parse, the test file failed to load, and
the harness counted "exit 1, pass 0 fail 1" as a kill. The harness now runs the unmutated suite
first (every test must pass, and its count is recorded), checks that each mutated file parses
(`node --check`), and counts a kill only when every test ran and one failed. A control copy of the
harness holding only the old broken mutant and a no-op edit printed `control: unbalanced paren:
DOES NOT PARSE, mutant never ran`, `control: a no-op edit: SURVIVED, exit 0, pass 7 fail 0` and
`mutants killed 0 of 2, never ran 1`, and exited 1.

## Budgets

- Peak RSS for a whole run: 1559 MB (run 1), 1549 MB (run 2), 1594 MB (seed s2), 1546 MB
  (evaluation), 1562 MB (evaluation s2), 1635 MB (evaluation s3), 1491 MB (training, doubt),
  1557 MB (evaluation, doubt), 1536 MB (screen, admit 64), 1545 MB (shape mult), 1242 MB (shape
  mult+other), 1048 MB (shape smaller+same), 962 MB (shape other+mult), 1992 MB (budget, 6000 ms),
  2301 MB (budget, 6000 ms, seed s2), the largest. The workers are threads of the same process,
  each capped at 1536 MB old generation, and each process declares `--max-old-space-size=4000`.
- Each run used 2 workers and was the only bench process of this item. Free memory was checked
  before each (between 44.78 and 48.41 GB).
- Bench round 7 (after the evaluation replicate) prints, per run, a paired line (the tasks one
  arm alone solved, with a sign test), the imagination by round (words, and the tasks a word of
  each round helped solve) and the per operator counts. The vocabulary keeps each word's round.
- The knowledge store is opened read only for the imagination phase (residentBytes 124529024,
  printed by `KnowledgeStore.residentBytes()` in a one off node -e) and closed before the solve.
- The state files are small. After run 2, objectives.jsonl was 19436 bytes (19 lines),
  patches.jsonl 4696 (7 lines) and vocabulary.json 2771. The verdict was 203100 bytes. No
  rotation is needed.
- Board 24a bar: `BUDGET done exit 0: wall 3192.40 s, peak ram 1703.3MB, peak dir 50.3MB, cpu
  6945.02 s`; the bench printed peak rss 1724 MB. Free memory before the launch: 37888 MB
  (`os.freemem()`). The verdict is 1050060 bytes, far under 100 MB. The ten ids run printed
  `peak ram 1123.9MB`, the small run peak rss 553 MB.
- Board 31 bar: `BUDGET done exit 0: wall 2729.51 s, peak ram 1022.0MB, peak dir 58.0MB, cpu
  5462.44 s`; the bench printed peak rss 1033 MB and wrote a 1.78 MB verdict (1869286 bytes, 1170 rows:
  195 tasks x 3 seeds x 2 runs, each row holding the three arms). The timing partial printed `peak ram
  911.7MB`, wall 55.54 s. Free memory before the bar: 34098 MB.
- No model calls and no network (model off: provider null, no socket, no call to port 11434).

## Measured (board 24a): what was read

- **The prior attempt**: this note in full; `bench/verdicts/imagine.json` as it stood (written
  2026-09-26T19:52:35Z on node v22.22.2, invented 5 against null 5, no `barMet`);
  `bench/verdicts/dream.json` (how another item states its split); and the uncommitted library
  code a previous builder left in `capability/grid-invent.mjs` (the seq word, the prior draw,
  `compressLibrary`, `libraryPrior`, `foldOf`, `programSteps`, `seqSpec`), kept and wired in, with
  `libraryWords` rewritten and `offerable` added.
- **The published way** (three pages and one search): the arXiv abstract page of DreamCoder
  (2006.08381); a web search for "Dreaming with ARC" (CBMM Memo 113), whose result described the
  compression as running over correct programs; the memo's PDF, which could not be rendered here
  (no pdftoppm), and was not retried; the README of the mxbi/dreamcoder-arc repository, which gave
  no detail of the method.
- **Why the bar failed**, read before any fix and again after writing this note: the verdict's
  rows per task, seed and arm (`node -e` over `bench/verdicts/imagine.json`), and the sleep probe
  over `bench/verdicts/grid.json`. No fix followed, so there is no after run to read.
- **Before the bar**: the small and ten ids runs, read to check that the stages, the folds and
  the leakage guards ran (killed 0, errors 0 in every stage).

## Measured (board 31): what was read, and the final bar

- **The prior attempts**: `git diff --stat` on this item's files (1703 insertions, 380 deletions,
  all uncommitted), `node --test test/imagine.test.mjs` first (21 of 21 green, so the working copy
  was coherent and no repair was needed), then `bench/imagine.mjs` whole, the header and work meter
  of `capability/grid-invent.mjs`, `test/imagine.test.mjs`, `test/imagine.mutants.mjs`,
  `test/imagine-work-probe.mjs`, this note, and the printed lines of board 28's two partials
  (`bench/verdicts/imagine-imaginebudget-80-knowledge-false-partial.json`, `imagine-partial.json`).
  `bench/verdicts/imagine-running-partial.json` was a stale marker of board 28's killed bar launch
  (`at` 2026-09-27T19:32:12Z); the board 31 bar rewrote and removed it.
- **The house rules on the split**: `bench/gate.mjs` (the CONTAMINATION row) and
  `test/contamination-split.test.mjs` (15 of 15 green after the split gained its ids).
- **The published way** (one search): a web search on work budgets against wall clock limits for
  reproducible search, which returned spoorendonk/coso issue 209 ("e2e deterministic_work fails
  under load: wall clock binds before the work budget") and, from the same results, the practice in
  program synthesis of budgeting by programs enumerated, which is hardware independent (read from
  the search summary only; no result page was opened). The first is the failure the wall safety count watches for; it fired here on one task.
- **Why the bar is barMet false**, read from the rows before writing and again after: every arm
  solves 1 to 3 tasks at 1500 work ms, the lead is -1, 0 or 1 at each seed and identical in both
  runs; the wall safety kills are one task, 3631a71a, read from the verdict's rows and a one off
  probe of `solveWith` on it.
- **The earlier barMet true at 2026-09-27T15:34:28Z was a wall clock draw, superseded.** The new
  verdict names it in `supersedes` (`{"at":"2026-09-27T15:34:28.279Z","barMet":true,"byWork":false}`)
  and in its statement.
- The final bar's printed lines are in "The bar, printed (board 31)" above; its verdict is
  `bench/verdicts/imagine.json`, `at` 2026-09-28T00:14:12.089Z, node v24.15.0, isTheBar true,
  barMet false, variant null.
