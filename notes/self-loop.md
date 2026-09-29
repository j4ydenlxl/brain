# notes/self-loop.md: one command that makes the organism fill its own gaps

Board 35, item self-loop. His words: "Its gotta work without me... EVERY GAP should be able to be filled by itself".
Before this item the pieces ran apart: self/queries.mjs generated questions (bench/self-queries.mjs), self/mistakes.mjs
ledgered and re-asked what was graded wrong, self/gaps.mjs turned a missed bar into a gap row with a trial, and
self/autopilot.mjs picked candidates. Nothing asked fresh questions every morning and handed what it missed to the rest.

Files: `self/loop.mjs` (new), `bench/self-loop.mjs` (new, the bar), `test/self-loop.test.mjs` (new),
`bench/verdicts/self-loop.json`, runtime records under `state/self/loop/` (never committed). Add-only edits:
`self/gaps.mjs` (FORMS `self-query-group` and its parser `selfQueryGroup`), `bench/self-queries.mjs` (`--group`,
`--template`, the `SELECTED` line, `checks.wholeRun` so a selection is never the bar, and `ranToTheEnd` read against the
rows selected), `self/autopilot.mjs` (the guarded `loop` source, its round, a `--dry` CLI, and the soak's once-a-day loop
tick: `loopTickPlan`, `runLoopTick`, one guarded step in `runSoak` before the ledger is read).

## How to run

```
node self/loop.mjs [--dry] [--n 2000] [--seed <s>] [--json]
    [--date YYYY-MM-DD] [--state-dir DIR] [--gaps-root DIR] [--plant-closed <group>] [--learn on|dry|off] [--learn-limit N] [--no-reask] [--no-selftest]
node self/autopilot.mjs --dry [--sources a,b] [--loop-dir DIR] [--json]
bin/brain.mjs self-code --auto --soak <min> [--loop-tick off]   (the 05:00 soak; it runs the loop tick first, once a day)
node --test test/self-loop.test.mjs
node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir state/board35/self-loop -- node --max-old-space-size=4000 bench/self-loop.mjs --state-dir state/board35/self-loop
```

## One tick, in order

1. QUERIES. bench/self-queries.mjs `run()` in process at a fresh seed: by default the day number since 2026-01-01
   (`seedOfDay`, UTC arithmetic on the local date), so each morning asks new questions; `--n 2000`; the generator's
   self test and every control first; model off. The self-queries held-out seeds 34 and 35 are refused: the loop
   feeds learning. Misses go to `state/self/loop/<date>-misses.jsonl` (one row per open group, ranked by count, then
   every wrong row), never to bench/verdicts.
2. LEDGER. self/mistakes.mjs `buildLedger` + `reaskAll` (its own worker, 2000 ms wall per row) + `summarizeReask`.
   When self/learn.mjs exists, `learn({ root, dry, limit })` runs (dry under `--dry` or `--learn dry`), then the
   ledger is re-asked in a fresh worker, so what learn() wrote is read. Absent, or `--learn off`, a skip line is
   printed and after is before. self/learn.mjs returns programs, patterns and a tally rather than the item's
   `{kept, tried, shapes}`; `learnSummary` records both (kept = programs, tried = tally.judged, shapes = lessons).
3. DIFF. Against the newest `state/self/loop/<date>.json` dated before this tick, per group (a template id):
   closed = open before, drawn now, no miss now; opened = missed now, not open before; stayed = open before and missed
   now; undrawn = open before and not drawn at this seed (neither closed nor stayed, counted apart).
4. GAPS. Every open group is a gap line: kind `self-query group`, subsystem `act`, measured = wrong + refused (each
   apart: measuredWrong, measuredRefused), bar 0 and 0, files = the readers of its kind that exist (arithmetic:
   act/exact-read.mjs, act/solve.mjs, act/word.mjs; the other seven kinds: act/exact-kinds.mjs), trial = FORMS
   `self-query-group` with the tick's `--n`, `--seed S --group G` (so `trialOf()` resolves it and the trial asks
   exactly the rows the tick asked of that group). They are written into `state/self/gaps.jsonl` beside a FRESH
   rebuild of the rest of the ledger (self/gaps.mjs buildLedger), so a loop write never makes stale lines look fresh.
5. LINE. `LOOP <date>: asked N answered N correct N wrong N refused N; groups open N closed N opened N; ledger
   learned before N after N; gaps written N`. Dry mode prints it and writes nothing. The same line carries
   `  PROBLEMS: ...` and the tick exits 1 when wrong is not 0, the counts do not partition (asked = correct + wrong +
   refused, answered = correct + wrong), a socket was counted, a self-queries control failed or the second opinion
   disagreed; the record and the gap rows are still written (a wrong row is the gap to fill).

The record `state/self/loop/<date>.json` holds every count: the queries and their controls, the ledger before, learn
and after, the groups (drawn, open with counts, closed, opened, stayed, undrawn), the plant, the gap rows with their
trials, the sockets.

MODEL OFF, COUNTED WHERE THE PRELOAD RUNS (corrected by board 36). The CLI re-executes itself once under a preload
(`GUARD_SOURCE`, a data: URL given to `--import`) that refuses and counts every `net.Socket` connect and `fetch` in the
main thread and in every worker started from a FILE that inherits the process's execArgv (the `--import` rides on it;
no Worker in this tree passes its own execArgv), measured at depth one and two (the re-ask worker of
self/mistakes.mjs is one); a
worker's attempt reaches the main count over a BroadcastChannel and is also written to stderr as a line starting
`LOOP SOCKET REFUSED`. NOT covered, and named in every record as `sockets.notCovered` (`NOT_COVERED` in
self/loop.mjs): an `eval:true` worker at any depth, which starts WITHOUT the preload when the main runs from a file as
the loop's does (the program and test workers act/run.mjs starts near lines 155 and 386, nested inside the re-ask
worker through self/mistakes.mjs runTests on a humaneval row: a skeptic measured one print ECONNREFUSED
127.0.0.1:9 with the count unchanged, as docs/boards/board-36.js item pins (P4) records), and every child process (the generator's self test). An in-process tick with no
preload (a test's) guards the main thread only and its record says so (`NOT_COVERED_IN_PROCESS`). The test and the
bench carry the old canary (a planted connect in the main thread and in an eval:true worker must count main 1,
workers 1; its main runs from `-e`, a shape under which an eval:true worker does get the preload) and, since board 36,
a coverage probe in the loop's own shape (below).

## The autopilot source

`self/autopilot.mjs`: `loopCandidates()` reads the newest loop record; its open groups with a trial are candidates of
source `loop`, evidence `trial`, ranked by count (a stable sort, so ties keep the record's rank). With no record the
source yields nothing, so planted trees and earlier callers see what they saw before. `collectCandidates` reads it by
default and after every other source; a soak's Board 10 pass (SOURCE_ORDER only) never reads it. `runAutopilot`
sends a loop candidate to `loopRound`: dry, `would-run-trial`; live, at most `LOOP_TRIALS_PER_RUN` (1) trial, run in a
child through bench/gaps.mjs `runTrial` (a child, not an import: self/gaps.mjs imports self/autopilot.mjs while its
own top-level await runs, and a static import back deadlocked `node self/gaps.mjs --dry`, exit 13; caught by
test/gaps.test.mjs). A trial changes no file; the next tick's diff says closed.

## Who runs it every morning

The 05:00 BrainAutopilot task runs `tools/schedule-autopilot.mjs --tick`, which runs tickArgv(): `bin/brain.mjs self-code
--auto --soak 90 --author on --json` under tools/budget.mjs. A soak reads the gap ledger, never the `loop` candidate source,
so `runSoak` runs the loop tick itself, once a day, BEFORE it reads `state/self/gaps.jsonl`: `loopTickPlan` says run when
the soak is live, `--sources` keeps gaps, the root is this tree and `state/self/loop/<today>.json` is absent;
`runLoopTick` spawns `node self/loop.mjs --date <today>` (20 min wall) and the soak prints its LOOP line and keeps it in
the soak file (`loopTick`). The tick rewrites the ledger fresh with one row per open group, so the soak's gap queue plans
those rows in the same run. `--loop-tick off` turns it off; a dry soak, a planted root (every test) and a ticked day
never spawn it. `node self/autopilot.mjs --dry` prints what a live soak would do now (`loop tick: ...`).

## The split

Development: seeds 900001, 900002, 900003 and 900010 to 900014 (smoke runs and tests), seeds 10 to 13 (the bench's
development runs at dates 2026-01-11 to 2026-01-14), the self-queries development seeds 7, 8, 9. Held out for the bar:
dates 2026-09-26 and 2026-09-27, seeds 268 and 269, n 2000. Their rows were fixed before any run at them: the hashes
below were printed first and are the constant `HELD_OUT` in bench/self-loop.mjs (this note only repeats them). The
FIRST run at them was the first bar run, 2026-09-28T18:52:15Z, which read refused 20 and 11 (the constant
`FIRST_BAR_RUN` in the bench); every bar run since (the verdict at 19:15:36Z, board 36's at 2026-09-28T23:18:40.036Z) re-asks the same
rows, and the verdict's split says so (`heldOut.firstAsked`, `heldOut.reRun`). sha256 of
`JSON.stringify(generate({ seed, n: 2000 }))`:
- 268: 206bb18053d368dfc5001ce1dee9d120256d538e06d7c7cea638cc0c838e91dc
- 269: 089d2ca9c3d486135b3b3158630b4fd554e60f610a88d5365fa20d3d35ef69f2

The bench recomputes both and writes `contaminated` false only when they match and no held-out seed is a
development seed. Nothing in this loop is a learner of GSM8K test records: the re-ask grades against the fixture,
and learn() is self/learn.mjs's own development split.

## Measured by board 35 (printed by its bar run, verdict at 2026-09-28T19:15:36.161Z, barMet true, 88.2 s, peak RAM 1548.5 MB)

- tests: node --test test/self-loop.test.mjs exit 0, tests 12 pass 12 fail 0
- LOOP 2026-09-26: asked 2000 answered 1926 correct 1926 wrong 0 refused 74; groups open 7 closed 0 opened 7; ledger learned before 85 after 85; gaps written 7
- LOOP 2026-09-27: asked 2000 answered 1947 correct 1947 wrong 0 refused 53; groups open 7 closed 1 opened 1; ledger learned before 85 after 85; gaps written 7
- ledger (both ticks): asked 418 learned 85 fixed 87 refused 326 wrong now 0; learn ran dry, kept 12, tried 127460, shapes 5 (28589 and 29555 ms); after equal to before (dry learn writes nothing)
- previous: tick 2 names 2026-09-26.json (seed 268)
- diff, loop vs the bench's own: closed 1 / 1, opened 1 / 1, stayed 6 / 6, names equal; misses file 2 holds 53 rows = wrong plus refused 53; drawn templates 111 / 111; control (counting.occurrences.casual-how-many dropped from the bench copy) closed 2 opened 1 stayed 5, differs
- plant: --plant-closed calendar.leap.is (stayed by the bench's own diff) printed closed 1 for calendar.leap.is; the same dry tick without the plant closed 0 for it; dry wrote nothing; control --plant-closed arithmetic.add.imperative (never open) exit 1, refused
- trials: 7 gap rows, resolved through trialOf() 7, exit 0 7, printed a reading 7, reading equal to the record 7, 5.77 s
- autopilot --dry: 186 candidates (gate 0, notes 80, imagine 1, census 23, slow 5, mutants 0, boards 70, loop 7), 7 LOOP CANDIDATE lines in rank order, each WOULD-RUN-TRIAL; loop tick: a live soak on this tree now WOULD RUN node self/loop.mjs --date 2026-09-28
- morning: tickArgv() is a soak; loop tick plan ticked 2026-09-27 false, fresh 2026-09-28 true, dry false, planted false, off false
- sockets 0 (both ticks: main 0, workers 0, self-queries 0, learn 0; stderr refusal lines 0); canary main 1 workers 1 with 2 refusal lines
- wrong 0 and 0; self-queries controls failed 0 of 18000 checks at each tick, second opinion disagree 0

The first bar run (18:52:15Z) read refused 20 and 11 at the same seeds; the organism's answers moved between the runs
(other board 35 items edit act/). The bar grades the loop, not the answer rate.

## Board 36 item pins (2026-09-28): four pinned defects fixed as written, the bar re-run

1. The sockets words. "EVERY thread" was false: measured with the preload and a FILE main (no socket opened, the guard
   read in each thread), main true, file worker true, file worker nested in a file worker true, eval:true worker false,
   eval:true worker nested in a file worker false; with an ESM `-e` main (`--input-type=module`, the old canary's shape) an eval:true worker read
   guarded true. self/loop.mjs (header, the guard's `how`, `NOT_COVERED` as `sockets.notCovered`) and this note now say
   exactly that. test/self-loop.test.mjs and bench/self-loop.mjs (section 8b) grade it; the no-preload control that
   must read all five false was in the test only at the 23:18:40Z run and is in the bench too since the fix below.
2. `--plant-closed` without `--dry` is refused: parseArgs and tick() throw `PLANT_NEEDS_DRY`, the CLI prints
   `self/loop.mjs: --plant-closed needs --dry: a planted closure written into a real record is a lie` and exits 2,
   writing nothing. Tested, and the bench runs it as a third plant control; the plant's "wrote nothing" now compares
   file contents (sha256) as well as names.
3. The renamed-group control beside the dropped-group one: the bench's copy of misses file 2 with one group renamed
   (same group rows, same counts) must differ from the loop's diff. Both are printed.
4. The split names the first bar run and says HELD_OUT is a constant of the bench (above).

Printed by the re-run (`node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir state/board35/self-loop -- node
--max-old-space-size=4000 bench/self-loop.mjs --state-dir state/board35/self-loop`, verdict at
2026-09-28T23:18:40.036Z, barMet true, 89.2 s, peak ram 1539.4MB):
- tests: node --test test/self-loop.test.mjs exit 0, tests 14 pass 14 fail 0
- LOOP 2026-09-26: asked 2000 answered 1926 correct 1926 wrong 0 refused 74; groups open 7 closed 0 opened 7; ledger learned before 85 after 85; gaps written 7
- LOOP 2026-09-27: asked 2000 answered 1947 correct 1947 wrong 0 refused 53; groups open 7 closed 1 opened 1; ledger learned before 85 after 85; gaps written 7
- ledger (both ticks): asked 418 learned 85 fixed 87 refused 327 wrong now 0; learn ran dry, kept 0, tried 127460, shapes 0 (29011 and 28947 ms)
- control: the bench copy of misses file 2 without counting.occurrences.casual-how-many: closed 2 opened 1 stayed 5; differs from the loop yes
- control: the bench copy of misses file 2 with counting.occurrences.casual-how-many renamed counting.occurrences.casual-how-many.renamed-by-the-bench (7 group rows holding 53 rows, the same counts yes): closed 2 opened 2 stayed 5; differs from the loop yes
- plant: closed 1 for calendar.leap.is, the dry tick without the plant closed 0; dry wrote nothing (names and contents) yes; --plant-closed arithmetic.add.imperative (never open at tick 1) exit 1, refused yes; --plant-closed calendar.leap.is without --dry exit 2, refused yes
- trials: 7 gap rows of tick 2, resolved through trialOf() 7, exit 0 7, printed a reading 7, reading equal to the record 7, 5.726 s
- sockets: total 0; canary main 1 workers 1 with 2 refusal lines; coverage in the loop shape main true, file worker true, file worker nested in a file worker true, eval:true worker false, eval:true worker nested in a file worker false; both records name what is not covered yes
- split: rows sha256 equal to the declared constant HELD_OUT yes; first asked by the bar run at 2026-09-28T18:52:15Z (refused 20 and 11); contaminated false

What the numbers say: the loop's mechanics hold with the two new controls and the refusal. Two readings moved since
the 19:15:36Z verdict and are not this item's: learn() dry now reports kept 0 and shapes 0 (it reported kept 12,
shapes 5), and the ledger re-ask reads refused 327 (it read 326); self/learn.mjs and act/ are other items' files.
A literal-match count of the 309 string literals board 35 (73f0293) added under test/ against the generated rows: seed
268 5, seed 269 4, controls seed 270 2 and seed 271 2 (n 2000 each); the matches are fixed-text prompts ("Five fair
coins...", "Was 1700 a leap year?", "reverse the letters of kettle" and two bag prompts), so the split stays
contaminated false, and the count is here for the next reader.

### Board 36 item pins, the fix after the skeptic (2026-09-28)

- The words are narrower where they claimed more than was measured: a FILE worker is covered when it inherits the
  process's execArgv (the `--import` rides on it; a grep of the tree finds no Worker given its own execArgv), measured
  at depth one and two; the ECONNREFUSED measurement is attributed to its record (docs/boards/board-36.js item pins,
  P4), not to a board 36 skeptic. The guard's `how` says "every file worker of this process that inherits its
  execArgv". A probe with an ESM `-e` main (`--input-type=module`) printed `{"main":true,"eval":true}`, and a CommonJS `-e` main under the same preload printed `{"main":true,"eval":false}` (the board 36 second verify's probe): the old canary's ESM shape does cover an
  eval:true worker, the loop's does not.
- bench/self-loop.mjs 8b carries the no-preload control (the same probe, no `--import`, all five must read false) and
  the coverage check fails without it.
- The split's self-queries seeds are read from bench/self-queries.mjs (DEV_SEEDS, READ_BEFORE_FIX_SEEDS,
  COPIED_INTO_TESTS_SEEDS), no longer a copy of 7, 8, 9: none is a held-out seed here, so contaminated stays false.

The verdict this note is the card of, bench/verdicts/self-loop.json at 2026-09-28T23:46:11.416Z (isTheBar true, barMet true, 91.2 s), printed: tick 1 (seed 268, 34453 ms) asked 2000, answered 1926, correct 1926, wrong 0, refused 74; tick 2 (seed 269, 33686 ms) asked 2000, answered 1947, correct 1947, wrong 0, refused 53; each tick ran 18000 control checks with 0 failed and drew 111 templates; the ledger before tick 1 held 727 rows (asked 418, fixed 87, refused 327, learned 85, ARC skipped 309, 1475 ms); the dry learn tried 127460 candidates over 7613 rows and 7466 mistakes and kept 0; tick 2 diffed against tick 1 closed 1, opened 1, stayed 6, equal to the bench; 7 of 7 gap-row trials exited 0 in 5.781 s; the autopilot listed 7 loop candidates; tests 14 of 14; sockets 0.

Printed by the re-run (same command, verdict at 2026-09-28T23:46:11.416Z, "BUDGET done exit 0: wall 91.33 s, peak ram
1675.1MB, peak dir 0.3MB"):
- "tests: node --test test/self-loop.test.mjs exit 0, tests 14 pass 14 fail 0"
- "LOOP 2026-09-26: asked 2000 answered 1926 correct 1926 wrong 0 refused 74; groups open 7 closed 0 opened 7; ledger learned before 85 after 85; gaps written 7"
- "LOOP 2026-09-27: asked 2000 answered 1947 correct 1947 wrong 0 refused 53; groups open 7 closed 1 opened 1; ledger learned before 85 after 85; gaps written 7"
- the two diff controls: dropped "closed 2 opened 1 stayed 5; differs from the loop yes", renamed "(7 group rows holding 53 rows, the same counts yes): closed 2 opened 2 stayed 5; differs from the loop yes"
- plant: "--plant-closed calendar.leap.is without --dry exit 2, refused yes (self/loop.mjs: --plant-closed needs --dry: a planted closure written into a real record is a lie)"
- coverage: "main true, file worker true, file worker nested in a file worker true, eval:true worker false, eval:true worker nested in a file worker false"; control "main false, file worker false, nested file worker false, eval:true false, nested eval:true false, all unguarded yes; the words are true of the code yes"
- "trials: 7 gap rows of tick 2, resolved through trialOf() 7, exit 0 7, printed a reading 7, reading equal to the record 7, 5.781 s"
- "sockets: tick 1 0 (main 0, workers 0, self-queries 0, learn 0), tick 2 0 (main 0, workers 0, self-queries 0, learn 0), stderr refusal lines 0; total 0"
- "BAR self-loop: barMet true (tests true, ticks true, previous true, diff true, plant true, trials true, autopilot true, morning true, sockets 0, canary true, coverage words true, wrong 0/0, controls true, contaminated false); 91.2 s"

## Open

- self/loop.mjs REFUSED_SEEDS is 34 and 35, which board 36 made self-queries DEVELOPMENT seeds; the seeds of the
  next clean self-queries bar (not chosen yet) are not refused by the loop, so whoever picks them should add them there.
- Coverage is words, not a fix: an eval:true worker (act/run.mjs's program and test workers) under the loop still
  starts without the guard. Covering it needs the guard inside those workers' own source or a `--import` in their
  `execArgv`; act/run.mjs is not this item's file.
- self/gaps.mjs `buildLedger` does not know the loop's rows: any other rebuild of state/self/gaps.jsonl (the soak's
  24 h refresh, `node self/gaps.mjs`) drops them until the next tick writes them again.
- A kept patch inside a soak refreshes the ledger through self/gaps.mjs buildLedger, which drops the loop rows for the
  rest of that soak; the next morning's tick writes them again.
- `node tools/schedule-autopilot.mjs --status` printed TaskName BrainAutopilot, Next Run Time 9/29/2026 5:00:00 AM: that
  soak is the first live run of the loop tick on this tree (learn on, so self/learn.mjs writes what it learns); nothing
  here has watched one run end to end on the real tree yet.
- self/gaps.mjs `PARSERS.selfQueries` (`/^total asked \d+ answered \d+ correct \d+ wrong (\d+)/m`) never matches the
  printed total line, which carries `answered N (xx.xx%)`; not this item's parser, left as found.
- The item named FORMS entries only; the `selfQueryGroup` PARSERS entry was added beside it because a trial needs a
  parser that reads a group.
- bench/self-queries.mjs statement text of a `--group` run still says "N at each of seeds" (its notTheBarBecause names
  wholeRun).
- Sockets from child processes (the generator's self test) and from eval:true workers are not counted by the loop's
  guard (board 36 made the words say so; see above).
- The organism's answers moved while this was built (other board 35 items edit act/): the same seed read 46 refused,
  then 15, minutes apart. The loop's diff is what measures that; the bar requires each trial's reading to equal its record, so an edit to act/
  between tick 2 and its trials would fail the bar run (a re-run, not a weaker check, is the answer).
