# notes/ladder.md

The daily ruler: one command, four columns, a composite, and the day over day line his
sentence asks for ("gets better measured around 5-10 percent every day").

## the ladder (2026-09-18)

`node bench/ladder.mjs --daily [--date YYYY-MM-DD] [--tier N] [--quick] [--model M] [--log]` runs four
columns on the seed `ladder/<date>` and prints today's score, dated.

**The four columns, each a rate in [0, 1].** *answer* is `bench/answer.mjs run()` on the
ladder's seed with the arms organism and null, scored over the seeded suites only: the forty
fixture questions are fixed text and the same every day, so one of them is drawn as an anchor
and none of them is counted. *code* is `bench/code.mjs run()` with its tasks generated in
memory on the ladder's seed and the arms organism and null; the committed fixture is never
read and never rewritten, so the bar's own tasks do not move when the ladder runs, and an in
memory run is narrow by definition whatever its counts. *capability* is
`bench/capability.mjs run({ seed, write: false })`, which is now a module as well as a script:
its column is the induction tasks solved plus the algebra equations solved and verified, over
how many there were. *health* builds the whole organism with `seeds/whole.mjs` at the size
`test/whole.test.mjs` uses (majors 16, substrateUnits 256), ticks it 256 ticks, observes it
and takes health. The composite is the mean of the four.

**The seed is the date.** Every item is drawn on `ladder/<date>`, so tomorrow's items are
different items and yesterday's cannot be memorised. The generators name their slots by
position, so `alg.cmp.0` is a slot and not a question: an item id here is the slot name plus
a digest of the item's own content, and on that ruler 2026-09-18 and 2026-09-19 share 0 of 12
answer items and 0 of 6 code items while sharing 12 of 12 slot names. The ten hand written
code tasks are not drawn at all, because they are typed into `bench/code.mjs` and do not move
with a seed. The capability column is the one item set the date does not move entirely: its
market section is seeded by integers inside `capability/market.mjs`.

**The tier.** Tier 1 is the sample sizes that finish in about ten minutes with Ollama up:
4 items per answer suite (12 seeded items), 6 code tasks, 256 health ticks. Tier N+1 unlocks
when every accuracy column (answer, code, capability) of the previous day at tier N is at or
above 0.9 and health is not below the day before. Health carries its own clause and is not
one of the three the floor applies to, and that distinction is the whole rule: health at this
size reads 0.848646 at 256 ticks and 0.866802 at 1024, so a floor applied to it would mean
the ladder never leaves tier 1. A higher tier draws more items and harder ones: tier 1, 2 and
3 draw 12, 24 and 36 answer items with 1, 2 and 4 depth3 grids among them, and 6, 10 and 16
code tasks, with the draw ordered by the kinds the organism failed most in the previous day's
rows. The rule, the counts and the draw are printed and written into every dated verdict.

**The files.** `bench/verdicts/ladder/<date>.json` is written once per run and never
overwritten: a second run the same day writes `<date>-2.json`, then `-3`, and the series takes
the last run of the day and prints which one it took. `bench/verdicts/ladder.json` is the
series: every dated file's four columns, the composite, the day over day delta per column and
for the composite as a percent of the previous day, nFor95 for the answer and code columns as
their own benches compute it, and the line `day over day: composite +x.xx percent, target 5
to 10 percent: met | missed | first day`, met at or above 5 and the number printed either way.

**The health column is measured in a child process.** `buildWhole` at this size returns 205
cells and health 0.848646 in a process that has done nothing else, and 200 cells and 0.859513
in a process that called `planItems()` first, so a column measured in the same process as the
answer and code columns would be a reading of the run order. The child does nothing but this,
every time.

**`--quick` opens no socket.** It prints the null arms and health only and writes nothing:
`ls bench/verdicts/ladder/` showed `2026-09-18.json` before it and `2026-09-18.json` after it,
and the run took 5694 ms, printing answer 12/12 on the null arm, code 0/6 on the null arm and
health 0.848646.

**The schedule, registered by nobody but him.** `node tools/schedule-ladder.mjs` prints the
command and registers nothing. As printed:

```
schtasks /create /tn BrainLadder /tr "cmd /c cd /d C:\Users\ybmic\Downloads\claudeskillsvideo-to-website\brain && node bench\ladder.mjs --log" /sc daily /st 04:00 /f
```

with the log at `bench\verdicts\ladder\<date>.log`, appended by the ladder itself from
`--log`, because the file name carries the date and cmd has no portable way to format one.
`--register` runs exactly that line, `--remove` deletes the task, and `--status` queries that
one task name and never dumps the machine's whole task list. It was not registered by this
board; `--status` reads "not registered (schtasks exited 1: ERROR: The system cannot find the
file specified.)".

The first day is in `bench/verdicts/ladder.json`, which takes
`bench/verdicts/ladder/2026-09-18.json` as the one run of 2026-09-18: at tier 1 on the seed
`ladder/2026-09-18` the answer column scored 1.000000 (12 of 12 on the organism arm, and the
null arm also 12 of 12, so the gap is zero and nFor95 is null), the code column scored
0.166667 (1 of 6 on the organism arm against 0 of 6 on the null arm, nFor95 20, mean 48464.17
ms a task), the capability column scored 1.000000 (205 of 205: induction 15 of 15 and algebra
190 of 190 solved and verified) and the health column scored 0.848646 over 205 cells and 2802
edges at t=256 with 0 errors and 0 refused, for a composite of 0.753828 and the line "day over
day: composite n/a, target 5 to 10 percent: first day". The whole run took 304534 ms, of which
291001 ms was the code column, and the two arms of both model columns ran with Ollama up.

## the board (Board 10, his P4 and P15, 2026-09-24)

`node bench/ladder.mjs` with no flag now prints THE BOARD and rewrites
`bench/verdicts/ladder.json`. Any of `--daily --date --tier --quick --model --log` still runs
the daily ruler above, so the 04:00 line (`bin/serve.mjs` and `tools/schedule-ladder.mjs` both
pass `--log`) is unchanged. The board calls no model, opens no socket and runs no bench: every
number it prints is a field of a verdict on disk, named beside it, or arithmetic on such fields.

**Per public set** (GSM8K, HumanEval, ARC-AGI-1 evaluation). The set's verdict files are
matched by name (`public-gsm8k*.json`, `public-humaneval*.json`, `public-arc*.json` and
`grid-evaluation*.json`). The primary verdict is the newest WHOLE one, else the newest partial
one. A verdict is partial when its name ends `-partial`, `isTheBar` is false, `complete` is
false, it records no n of, or n is below of; the board prints which of these made it partial.
Every other file of the set is printed as one "also on disk" line. A set with no file is printed
NOT MEASURED.

**The accuracy row** is the organism, model-alone and null arms with Wilson 95 intervals (the
verdict's own when it stores one; `wilson95` in the ladder is the same formula, and test (k)
holds it to the intervals the verdicts store: 5 of 6 gives 0.436491 to 0.969947). The bars,
in his P4 order: (1) beat model-alone and null, by interval separation; (2) the 405B row; (3)
the frontier row, the best row of a `frontier` class held to one answer (a pass@100 row is
not); then the orchestrator's own row, Fable 5.1, taken ONLY from `research/published.json`
and only with a URL, else "no published row". Each comparison says above or below and whether
the interval decides it. A partial primary prints "no bar above can be claimed from it".

**The three answer classes.** model (provenance `model`) in seconds; native (provenance
`exact` or `memory`) in microseconds; direct (one hypervector lookup) in nanoseconds. A row of
a verdict whose model is null (the ARC grid search) records no provenance field; it is counted
native and printed as inferred. `act/prompt.mjs PROVENANCE` is `exact, memory, model`: no
answer path records direct, so the direct share is 0 and its latency is not measured, and the
board says so on a DIRECT line.

**His P15 rows** follow the three sets, each read from its own file.

SUBSTRATE: a `bench/verdicts/ladder-substrate.json` would win; there is none, so
it prints that no verdict file holds the browser organism's ns, then the browser figures from
the `docs/LOG.md` line that holds them (labelled a log line, not a verdict), then the Node
organism's `accounting.usPerRun` from `bench/verdicts/speed.json`. INSTANCES ALIVE:
`instances.json` in a state directory under the `ALIVE_WINDOW_MS` of `daemon/health.mjs`, else
`cloud.json`, else `cloud-partial.json` marked PARTIAL. AUTHORED SHARE from `authorship.json`.
BYTES PER SCORE POINT: the compress bar's `ruler.v2Header` and the newest checkpoint header on
disk (the records the gate's COMPRESS row reads). IMPROVEMENT PER WALL SECOND: a live
`ruler.jsonl` in a state directory, else `daemon.json phaseA.perWallSecond`, printed beside his
words "5 percent every second".

**What it printed**, the run at 2026-09-24T07:23:15.460Z, exit 0. This is an excerpt: the
model-alone and null lines, bar 1, the published rows kept and the "also on disk" lines are left
out. Every printout in this note is a shell transcript that opens with the command, so the
findings page never mistakes it for prose.

```
$ node --max-old-space-size=6000 bench/ladder.mjs
GSM8K  PARTIAL, only partial verdicts on disk: bench/verdicts/public-gsm8k-partial.json at 2026-09-23T20:49:41.434Z, n 6 of 1319, model qwen3:1.7b; partial because the file is named -partial, isTheBar false, a sample of 6 of 1319
  accuracy   organism 6/6 = 100.00% [60.97, 100.00] (interval from the verdict)
  bar 2 the 405B row: Llama 3.1 405B Instruct 96.8 (em_maj1@1, 8-shot CoT): above by 3.20 points, undecided (the interval 60.97 to 100.00 contains it)
  bar 3 the frontier row: no frontier row held to one answer kept in this set's verdicts
  orchestrator (Fable 5.1): no published row
  answers    model 6 of 6 (100.00%), 6 correct, mean 1.496 s (1.496 s when correct) | native 0 of 6 (0.00%) | direct 0 of 6 (0.00%): no answer path records it
HumanEval  PARTIAL, only partial verdicts on disk: bench/verdicts/public-humaneval-partial.json at 2026-09-23T20:51:27.008Z, n 6 of 161, model qwen3:1.7b; partial because the file is named -partial, isTheBar false, a sample of 6 of 161
  accuracy   organism 5/6 = 83.33% [43.65, 96.99] (interval from the verdict)
  bar 3 the frontier row: o4-mini-high 99.3 (pass@1): below by 15.97 points, decided below (the interval 43.65 to 96.99 excludes it)
  orchestrator (Fable 5.1): no published row
  answers    model 6 of 6 (100.00%), 5 correct, mean 7.598 s (6.074 s when correct) | native 0 of 6 (0.00%) | direct 0 of 6 (0.00%): no answer path records it
ARC-AGI-1 evaluation  whole: bench/verdicts/grid-evaluation.json at 2026-09-23T22:30:54.236Z, n 400 of 400, model none
  accuracy   organism 71/400 = 17.75% [14.32, 21.80] (interval from the ladder (Wilson 95))
  bar 3 the frontier row: Gemini 3.1 Pro (Preview) 98: below by 80.25 points, decided below (the interval 14.32 to 21.80 excludes it)
  orchestrator (Fable 5.1): Claude Fable 5.1 (Max) 97.5: below by 79.75 points, decided below (the interval 14.32 to 21.80 excludes it) [research/published.json, https://arcprize.org/leaderboard]
  answers    model 0 of 400 (0.00%) | native 400 of 400 (100.00%), 71 correct, mean 2463523 us (136856 us when correct), 400 inferred from a null model | direct 0 of 400 (0.00%): no answer path records it
ACROSS THE THREE: 3 measured (1 whole, 2 partial); organism 82 of 412 on the primaries; of 412 recorded answers model 12 (2.91%, mean 4.547 s), native 400 (97.09%, mean 2463523 us), direct 0 (0.00%); a tally, not a score
DIRECT: act/prompt.mjs PROVENANCE is exact, memory, model: no answer path records direct, so its share is 0 and its latency is not measured
SUBSTRATE: no verdict file holds the browser organism's ns
  browser organism: 90 ns per cell run, 50 ns per packet hop (docs/LOG.md line 14, 2026-09-16 22:46: 0.09 us and 0.05 us; a log line, not a verdict file)
  Node organism: 2158 ns per cell run at best (bench/verdicts/speed.json accounting.usPerRun: best 2.158 us, single 11.723 us, baseline 55.463 us; organism/gen-0, 40000 cells, 2026-09-17T12:20:33.710Z); it keeps no per-hop field
INSTANCES ALIVE: 2 (bench/verdicts/cloud-partial.json, PARTIAL: isTheBar false, mode native, 2026-09-24T02:33:42.645Z; no instances.json in a state directory here)
AUTHORED SHARE: 0 of 93 = 0.00% (bench/verdicts/authorship.json, 2026-09-24T02:37:18.898Z, isTheBar true)
BYTES PER SCORE POINT: 701862.933 at the bar (bench/verdicts/compress.json ruler.v2Header, score 30 of 30, 21055888 bytes, 2026-09-24T02:33:01.810Z); 275021.867 at the last checkpoint header on disk (bench/verdicts/compress-rerun.json ruler.v2Header, score 30 of 30, 2026-09-24T03:07:56.719Z, not the bar)
IMPROVEMENT PER WALL SECOND: carried 0.002777 and exact 0 of the suite per wall second = 0.2777 percent per second (bench/verdicts/daemon.json phaseA.perWallSecond, checkpoints 0 to 57 over 359.629 s, 2026-09-24T02:51:04.223Z); his words: 5 percent every second, so the measured rate is 0.05554 of his
wrote bench/verdicts/ladder.json (41223 bytes): the board beside the daily series of 1 day(s)
```

**Reading it.** `bench/verdicts/ladder.json` holds this board. Across the three sets the
organism holds 82 of 412 recorded answers, and the one whole set, ARC-AGI-1 evaluation over 400
tasks, is decided below the frontier row and below the Fable 5.1 row. Two of the three sets are
samples of 6, so no P4 bar can be claimed on GSM8K or HumanEval, and on both the organism is not
separated from model-alone (same counts). Every GSM8K and HumanEval answer on disk came from the
model; the only native ones are the ARC grid search. Bytes per score point read 701862.933 at the
bar, and improvement per wall second reads 0.2777 percent of the suite, where his words ask for 5.

**Tests.** `node --test test/ladder.test.mjs`: 17 of 17 pass in 6.3 s (duration_ms 6307.3435).
(h) to (n) grade the board, and (o) and (p) grade the rows verdict below. A mutant sweep on copies of the ladder (never the live
file) killed 8 of 8 applied mutants against the board: preferring a partial over a whole verdict,
holding pass@100 as one answer, accepting a Fable row with no URL, accepting a Fable row of
another benchmark, deciding on the point instead of the interval, printing native in ms as us,
dropping the alive window's edge, and ignoring the code benches' `passed` count word. A second
sweep, run by the fix stage against (o) and (p) only, had a control of 2 of 2 passing and killed
10 of 10 applied mutants: the stale edge moved to the gate's end, a missing startedAt passing,
the stale list ignored, a board older than the ladder passing, a RED gate passing, a missing row
passing, failing ladder tests passing, rows.json written over, a met run named partial, and the
kill left out of the statement.

## the gate rows (Board 10, 2026-09-24)

`node bench/gate.mjs` now runs every test file under `tools/budget.mjs` and prints three new rows
after the per-file lines. Each is also written into `bench/verdicts/gate.json` under `rows`, and
each is part of the GATE verdict.

**BUDGET.** Each test file runs as `node --max-old-space-size=6000 --test <file>` under
`budget()` with its own TEMP directory. The caps are a 6000 MB working set for the file's whole
process tree, 2048 MB on its TEMP directory, and a 600 s timeout, sampled every 1000 ms, and a
file waits for 16384 MB free before it starts. The row is red on any kill, refusal, abort or
error, and on an empty run. It prints the peak RSS and which file reached it, how many files had
their tree caught alive by a sample (a file that exits between samples prints `rss unsampled`,
not 0 MB), the peak TEMP directory bytes, and the bytes left behind in temp. `NODE_TEST_CONTEXT`
is removed from the child's environment, because a gate started from inside a test would
otherwise pass it on and the child's `node --test` would refuse to run "recursively" and report
nothing.

**COMPRESS.** Bytes per score point at the newest checkpoint header on disk against the last
recorded one. Red only when bytes per point rose and the score did not.

**HIS DATA.** Every data file under `bench/fixtures/` must be named on a `SOURCES.md` line that
carries a licence. A directory line covers the files under it, and "same licence" takes the
licence the file states elsewhere. LICENSE, NOTICE and SOURCES files are not data. A name counts
only where it stands alone: `HumanEval.jsonl` does not cover `humaneval-js.jsonl`, and
`HumanEval.jsonl.bak` does not name `HumanEval.jsonl`. Anything uncovered is listed with its bytes.

**The gate copied alone.** `test/autopilot.test.mjs` copies `bench/gate.mjs` by itself into a
fixture tree that has no `tools/` and no `core/`. Static imports of those broke it, so they are
now loaded dynamically. Without `tools/budget.mjs`, every file still runs, unbudgeted, and the
BUDGET row is red and says why. Without `core/persist.mjs`, COMPRESS reads verdicts only. Gate
test (f) checks this directly.

**What it printed**, the run from 2026-09-24T07:26:34.846Z to 2026-09-24T07:31:41.632Z, exit 1.
This excerpt keeps the killed file, the three rows and the verdict line; the per-file PASS lines
and the free RAM line are left out.

```
$ node --max-old-space-size=6000 bench/gate.mjs
BUDGET KILLED ram 9313.2MB over 6000MB
BUDGET kill: 3 processes, all dead 0.62 s after the over-cap sample, at most 1.62 s after the cap was crossed
BUDGET done killed, exit 137: wall 6.63 s, peak ram 9313.2MB, peak dir 0.0MB, cpu 10.98 s, 7 samples
FAIL test/runtime.test.mjs pass=null fail=null 6963ms rss 9313.191MB dir 0B BUDGET killed ram
BUDGET RED: 68 of 68 test files ran under tools/budget.mjs (cap 6000 MB working set of the file's whole process tree, cap 2048 MB on the file's own TEMP dir, sampled every 1000 ms, --max-old-space-size=6000), 1 killed, refused or aborted (test/runtime.test.mjs killed ram); peak RSS 9313.191 MB (test/runtime.test.mjs), RSS sampled on 68 of 68 files (a file that exits before a sample catches its tree has none), peak dir 71311189 bytes (test/budget.test.mjs), left behind in temp 174775 bytes by 2 files
COMPRESS GREEN: bytes per score point 275021.867 at this checkpoint (bench/verdicts/compress-rerun.json ruler.v2Header, 2026-09-24T03:07:56.719Z, score 30 of 30) against 701874.4 at the last recorded one (bench/verdicts/compress-rerun-fidelity.json ruler.v2Header, 2026-09-24T02:53:56.933Z, score 30 of 30): fell 60.82 percent, score held
HIS DATA RED: 822 of 825 data files under bench/fixtures (779283566 of 779349684 bytes) are named on a SOURCES.md line with a licence (Apache 2.0 800, MIT 2, BSD 3-Clause 1, CC0-1.0 5, CC BY-SA 4.0 14); 10 notice files are not data; uncovered 3 files, 66118 bytes (answer-questions.json 6591, code-tasks.json 57673, perception-urls.json 1854): their origin is written nowhere, so bytes of his data cannot be ruled 0
GATE RED: test files 67/68, assertions 944 pass / 0 fail, authored code lines 110595 in 349 files, prose lines 863501, generated organism lines 5893098 in 233 files, em-dash files 0, bad imports 1, budget RED, compress GREEN, his data RED
bad imports: organism/gen-0-pruned/index.mjs -> :
```

**Why it is RED, and none of it is one of these rows misreading.**

1. `test/runtime.test.mjs` was killed at 9313.2 MB in this run: 3 processes, all dead 0.62 s
   after the over-cap sample and at most 1.62 s after the cap was crossed. The builder's two runs
   printed 9195.8 MB and 8955.1 MB, and the verify run reported 9650.2 MB. Its shards are
   `worker_threads` inside one process: the test runs 2 and 4 shards. `tools/budget.mjs` rejects
   a pid reused by a stranger by its creation time, so this is the file's own memory. Next rung
   (not my file): hold the test to 2 shards, or give its workers `resourceLimits`, and see what it
   measures.
2. HIS DATA: three root fixtures are uncovered. All three were written in this repo:
   `answer-questions.json` says it is forty hand-checkable questions, `code-tasks.json` says it
   is `bench/code.mjs buildTasks` output plus values typed by hand, and `perception-urls.json` is
   the allow list for `bench/perception.mjs`. None is a download. Next rung: a
   `bench/fixtures/SOURCES.md` with one line each, under the licence the owner picks for his own
   repo. That file is not mine to write, and the licence is not mine to choose.
3. The bad import is a false positive in the gate's older import scan. That scan is not one of
   these rows. `organism/gen-0-pruned/index.mjs` (untracked, 2026-09-23 22:51) holds
   `export const meta = {... "pruned":{"from":"gen-0" ...`, and the pattern
   `from\s*['"]([^'"]+)['"]` reads `from":"` as an import of ":". Next rung: require the quoted
   specifier to close the statement. organism/ is not mine to edit.

**The item verdict is written by the bench.** `node bench/ladder.mjs --rows` reads
`bench/verdicts/ladder.json` and `bench/verdicts/gate.json`, runs `test/ladder.test.mjs` itself
under the gate's own budget caps, and writes `bench/verdicts/rows.json` once when all three hold,
else `bench/verdicts/rows-partial.json` with isTheBar false and every reason. The first rows
verdict was typed by hand from a gate run that ended two minutes before this note was written,
and this note then broke `test/findings.test.mjs`, which that gate never ran against it. The gate
now records `startedAt` beside `at`, and a gate run that started before any file this item owns
last changed (the two benches, the two tests and this note) is named STALE and cannot meet the
bar. A file changed while the gate was running is stale as well, because the run may have graded
it before the change: the start is the edge, not the end. The order is `node bench/ladder.mjs`,
then `node bench/gate.mjs`, then `node bench/ladder.mjs --rows`. The printout above is the gate
run before the last edit of this note; the run that graded this note is the one inside that
verdict, and it is not quoted here, because writing it here would make that run stale.

**Why the findings test failed.** `tools/findings.mjs` puts on each verdict's card the prose
paragraph, from any note, that names the verdict and quotes the most of its values. This note
had pasted the gate's printout as an indented block, which that tool reads as prose, and whose
GATE line named the compress verdict in "compress GREEN". So the compress card took the block,
and the cut then kept only the BUDGET line, which quotes none of the compress values, and the
test failed. Every printout here is now a transcript that opens with the command, which the tool
skips as not prose, and the lead of the paragraph on his rulers no longer shares a paragraph with the
verdict files it names (its number was matching a value of the daemon verdict).

A second defect, in `tools/findings.mjs` (not a file this item owns), is why the cut missed. The
tool finds the first matched value in the paragraph with its ISO timestamps blanked to one space
each, then cuts the unblanked paragraph at that offset. Each timestamp before the value shifts
the cut 23 characters early. In the old block the first match sat at offset 434 blanked and 457
unblanked, one timestamp apart, so the card ended on the timestamp just before "score 30". Next
rung, for the owner of that file: take the offset on the text that is cut.

**Tests.** `node --test test/gate.test.mjs`: 7 of 7 pass in 4.0 s (duration_ms 4022.8801), and (f)
now also holds `startedAt` at or before `at`. (d) runs a real child under
the budget: the ok file exits with its RSS sampled and the 1000 bytes it left in its TEMP
counted, and a hog allocating past a 300 MB cap is killed on ram. (f) runs the gate copied alone
in a temp tree. `node --test test/autopilot.test.mjs`: 22 of 22 (duration_ms 14159.5691), including the
real-gate test that the first static imports broke.

**Gate mutant sweep.** Copies of the gate (`bench/_mut-gate.mjs`) were graded by a copy of its
tests, and both copies were deleted afterwards; the live files were never written. The
unmutated control passed 7 of 7, and 9 of 9 applied mutants were killed: BUDGET green despite a
kill, BUDGET green on an empty run, an unsampled file counted as sampled, NODE_TEST_CONTEXT
handed to the child, no fallback when `tools/budget.mjs` is missing, COMPRESS red whenever bytes
per point rose, COMPRESS green when bytes rose and the score did not, a line with no licence
covering its file, and a trailing period always ending a name (so `.bak` names the file).

## the rulers on the board and two rows on the gate (Board 12, his P15 and P8, 2026-09-24)

Board 12 puts P15's rulers on the ladder and P8 on the gate. The board gains three blocks,
MULTIPLYING, AUTHORED and KNOWLEDGE, each read from the verdicts on disk by
`node bench/ladder.mjs` with no model called and no bench run. The gate gains two rows,
LOAD-BEARING and BOUNDARY, printed after HIS DATA and counted in the GATE line. This is the board
as `node bench/ladder.mjs` printed it on this tree, with the three new blocks cut out of it:

```
node bench/ladder.mjs
MULTIPLYING (bench/verdicts/multiply.json, whole, isTheBar true, 2026-09-24T14:36:34.385Z, 240 wall s per arm, model calls 0):
  instances alive at the end: population 3 at 237.7 s (i0, i1, i2), at most 3 at once; single 1 at 238.5 s (s0), at most 1 at once
  duplications: population 2 (i0 duplicates into i1 after its 2nd exchange and into i2 after its 3rd), single 0, in one run of 240 wall s; no instance has run a day, so none per day is measured
  best of population against single instance: 136/160 against 134/160 on grid/velocity:heldout, at or above yes; fresh-more mean 137.25 against 137; evaluations 327546224 against 116706884; elites imported 2509, exported 3661
  kill: i0 at 122 s, back from its checkpoint t=1500: yes; bar met yes
  also on disk: bench/verdicts/multiply-partial.json (partial, isTheBar false, 2026-09-24T14:13:53.931Z, 80 wall s): population 133/160 against single 134/160, bar met no
AUTHORED (bench/verdicts/authorship.json, whole, isTheBar true, 2026-09-24T02:37:18.898Z):
  AUTHORED SHARE: 0 of 93 = 0.00% (kept patches with an organism author 0, kept patches of any author 0, files landed by boards 93)
  patches proposed and kept per source per day: not measured (bench/verdicts/authorship.json carries no per-source per-day field (perSourcePerDay, bySourceDay, days or perDay); its input state/self/authored.jsonl is not present)
  days since the last board: 0.084, read at 2026-09-24T15:34:18.595Z: board 12 launched 2026-09-24T13:32:47Z (state/board12.marker)
    the share counts boards up to board 9 landed 2026-09-23T21:58:00Z (bench/verdicts/authorship.json boards), 0.734 days; docs/BOARDS.json lists up to board 9
    boards 10, 11, 12 have a launch marker and no docs/BOARDS.json entry, so the share's denominator does not count their files
KNOWLEDGE: 1 of 2 sources measured, 284454 articles held (simplewiki)
  simplewiki (bench/verdicts/knowledge.json, whole, isTheBar true, 2026-09-23T21:53:15.853Z): 284454 articles held of 284749 in the dump, breadth 0.998964; recall@1 0.625 against null 0.09, recall@5 0.785 against null 0.13, n 200 (simplewiki-latest-pages-articles-multistream.xml.bz2, CC BY-SA 4.0)
    also on disk: bench/verdicts/knowledge-partial.json (PARTIAL: the file is named -partial, isTheBar false, 2026-09-23T21:52:06.557Z): 19986 articles held of n/a in the dump, breadth 0.9993; recall@1 0.33 against null 0.075, recall@5 0.545 against null 0.105, n 200
  enwiki: not measured (no bench/verdicts/knowledge-en.json or knowledge-en-partial.json)
```

**What a block will not print.** A block whose verdict is missing prints "not measured" and
names the file it looked for. A verdict that is a narrow run prints PARTIAL with the reason: the
file is named -partial, isTheBar is not true, or complete is false. A number the verdict does not
carry prints n/a. A zero is printed only when a verdict measured it, like the single arm's
duplications or the authored share. These three blocks are graded by `narrowReasons`, not the
board's `partialReasons`, because that one also calls a verdict partial when it records no "n
of" count, and none of these three verdicts records one. A partial run on disk beside a whole one
is listed under it as "also on disk" and never stands in for it.

**MULTIPLYING** reads the multiply verdict (the whole file, else the -partial one). It prints
instances alive at the end of each arm, duplications, and the population's pick on the fresh draw
against the single instance, with the kill the bar asks to come back. Duplications per day are
not printed as a rate: the verdict is one run per arm, no instance has run for a day, and the
block says so rather than dividing.

**AUTHORED** keeps the authored share where the site reads it. It adds patches proposed and kept
per source per day, and the days since the last board. The first is not measured: the authorship
verdict carries no per-source per-day field, and its input `state/self/authored.jsonl` is not
present. The deferred authored item owns the tool that would write both, so this block reads
four spellings of that field (`perSourcePerDay`, `bySourceDay`, `days`, `perDay`) and prints
whichever lands. The days since the last board take the newest of three sources, each printed
with its name: the boards the authorship verdict counted, `docs/BOARDS.json`, and the launch
line in `state/board<N>.marker`. The block also prints what that exposes: boards 10, 11
and 12 have a launch marker and no `docs/BOARDS.json` entry, so the share's denominator does not
count their files yet. docs/ is not this item's to edit.

**KNOWLEDGE** prints articles held, breadth (held over the articles in the dump) and recall at 1
and 5 against the null arm, per source. simplewiki reads the knowledge verdict. enwiki is not
measured: its verdict belongs to the deferred enwiki item and is not on disk. The total held
counts only the sources that measured it, so a missing source adds nothing and is not a zero.

**LOAD-BEARING** is the dead share of every emitted seed: one minus load-bearing lines over
loaded lines, from the census verdicts on disk. An emitted seed is a directory under organism/
with a manifest.json, or else an index.mjs. The gate reads the manifest and never the seed, so the
largest seed costs one small file. A census counts only while it still describes the
seed. With a manifest hash on both sides the hashes must match; with no hash, the census must
have been written after the manifest last changed. Of the fresh ones the bar goes first, then
the newest. A refused, stopped or sampled run that recorded no line counts is a record, not a
census. The row is RED when any emitted seed has no census that still describes it (named, with
why), or when a seed the daemon loads is more than 10 percent dead. Exactly 10 percent is not
above the cap. What the daemon loads is read two ways: the import closure of `daemon/run.mjs`,
`bin/serve.mjs` and `daemon/multiply.mjs` (static imports, literal dynamic imports, and the
`new URL(..., import.meta.url)` a Worker starts from), searched for a string literal that is a
path to a seed; and the checkpoint metas under the state directories. The literals are read by
the boundary audit's lexer, so a seed named in a comment or inside a usage string does not count.
On this tree neither names an emitted seed: the daemon runs from its own checkpoints, whose metas
are of kind whole. So the cap binds nothing today, and the row says so in words instead of
printing a quiet GREEN. It prints every seed's share with the census it came from. Most seeds are
counted only by the narrow census-all run, and many of those are far above 10 percent. A seed
counted by a static census is marked as a lower bound on its dead share. The day the daemon loads
one of those seeds, this row goes RED.

**BOUNDARY** reads `bench/verdicts/boundary.json`, which `node tools/boundary-audit.mjs --bar`
writes. It also runs the audit's own static scan of the tree now against its allowlist, which
takes well under a second. It is RED when the verdict is missing ("not measured"), partial, or
has a copied buffer at or over the cap. The rule is the audit's: copied bytes must be under the
cap, and its own underCap false is RED too. It is also RED when a row was not measured, when an
allowlist entry is over the cap, when the verdict's unlisted list is not empty or was never
recorded, or when the scan of the tree now finds a boundary the allowlist does not name. The wire
size, strings included, is printed and does not turn the row RED, because the audit reports it
as context and not as its cap measure. One boundary is over the cap on the wire today:
runtime/shard.mjs line 474, 28041254 bytes. It is printed on the row and left for the owner of
that file.

**The item verdict.** `node bench/ladder.mjs --rows` still composes it from disk and writes
`bench/verdicts/rows.json` once, else `bench/verdicts/rows-partial.json`. It now needs the three
blocks on the board and five rows printed by a GREEN gate, and it runs the three test files
itself under the gate's caps: `test/ladder.test.mjs`, `test/gate.test.mjs` and
`test/gate-rows.test.mjs`. A test file missing from the tree misses the bar by name. The order
stays: `node bench/ladder.mjs`, then `node bench/gate.mjs`, then `node bench/ladder.mjs --rows`.
Nothing this item owns is edited between them. The gate's row lines are in that verdict and in
`bench/verdicts/gate.json`. They are not quoted here, because writing them here would make that
run stale.

**Tests.** `test/gate-rows.test.mjs` is new and builds every tree it grades. It checks seed
spellings, and census freshness by hash and by time. It checks the pick order and a refused run.
It checks the cap on both sides of exactly 10 percent, a seed with no census, a stale one and no
seeds. It checks the closure, the literal reader against a comment and a usage string, and the
checkpoint metas. It checks BOUNDARY on every rule above. `test/ladder.test.mjs` gains (q) to
(s): each block on hand written verdicts, with a check that no zero stands in for a missing
number. (n) holds the real board's multiply and knowledge numbers to their verdicts' fields. (o)
and (p) now need five rows, three blocks and three test files.

```
node tools/budget.mjs --ram-mb 6000 --disk-mb 512 --dir <scratchpad>/tests-out --record <scratchpad>/tests-budget.json -- node --max-old-space-size=6000 --test --test-concurrency=1 test/ladder.test.mjs test/gate.test.mjs test/gate-rows.test.mjs
✔ (a) seedOf reads a seed from any spelling of a path to one, and nothing else (0.8273ms)
✔ (b) a census counts only while it describes the seed, the bar first, then the newest (11.8841ms)
✔ (c) LOAD-BEARING: GREEN under the cap, RED for a loaded seed over it, a seed with no census, or no seeds (8.8913ms)
✔ (d) the daemon loads what its import closure names by path and what its checkpoints name (17.4425ms)
✔ (e) BOUNDARY: GREEN under the cap and listed; RED over it, unlisted, missing or partial (0.697ms)
✔ (o) the rows verdict: met only when board, GREEN gate and tests all hold, and a stale gate is named (1.6336ms)
✔ (p) runRows writes rows-partial.json when missed, rows.json once when met, and runs the ladder and gate tests (11.8806ms)
✔ (q) MULTIPLYING: none is not measured, a -partial one is PARTIAL and claims no bar, the whole one wins (2.5972ms)
✔ (r) AUTHORED: the share, patches per source per day, and days since the last board from each source (5.2864ms)
✔ (s) KNOWLEDGE: articles held per source, breadth and recall against null, a missing source not measured (2.2399ms)
ℹ tests 32
ℹ pass 32
ℹ fail 0
ℹ duration_ms 10856.4041
BUDGET done exit 0: wall 11.03 s, peak ram 651.4MB, peak dir 0.0MB, cpu 8.17 s, 6 samples, record ../../../AppData/Local/Temp/claude/C--Users-ybmic-Downloads-claudeskillsvideo-to-website/b20b8e7e-1cf2-4327-8295-4d76361d02e2/scratchpad/tests-budget.json
```

## the loop on the board and the installation on the gate (Board 14 and Board 15, 2026-09-26)

Board 14 asked the ladder for the self-improvement loop's own numbers and the gate for a row that
says whether the loop is installed and running; Board 15 asked for what is still undone and for a
row that says whether the handoff document is true. The ladder gains three blocks, GAPS,
MAGNITUDE and UNDONE, printed after IMPROVEMENT, and the AUTHORED SHARE line names the boards its
denominator counts. The gate gains two rows, AUTONOMY and HANDOFF, printed after BOUNDARY and
counted in the GATE line. Like every other block the three new ones run nothing: each number is a
count of lines on disk, a field of a verdict, or arithmetic on those, and a file that is not
there prints "not measured", never a zero.

What each block reads:

- GAPS: state/self/gaps.jsonl (open gaps, those with a trial), the decision files
  bench/verdicts/autopilot/*.jsonl (attempted and kept in the last 7 days), state/self/authored.jsonl
  (kept with an organism author), and one line per gap a decision or authored line records as
  closed, with before, after, unit, bar and the operator.
- MAGNITUDE: three rates side by side. The organism per wall hour of its soak (bench/verdicts/soak.json
  gives the window; kept patches and distance moved come from the authored lines inside it, and a
  kept line with no toward or bar makes the distance not measured rather than zero). The
  orchestrator's boards landed and bars met per day, from bench/autopilot.mjs orchestratorRate.
  The simulated clock from bench/verdicts/spread.json.
- UNDONE: the ledger's board items per board; the organism's attempts on them in the last 7 days
  from state/self/brief/*.jsonl and the decision files, with the wall each refused attempt hit
  (bench plants tallied apart, since they are not board items); partial bars with the lines
  resumed and records completed from state/self/resume.jsonl (one resume run can resume several
  bars, so the distinct total is printed beside the per-bar lines); the proposed boards under
  docs/boards/proposed/ with their item counts.

This is what `node bench/ladder.mjs` printed on this tree for the three blocks and the share line:

```
node tools/budget.mjs --ram-mb 6000 --disk-mb 512 --dir <scratchpad>/ladder-out -- node --max-old-space-size=6000 bench/ladder.mjs
  AUTHORED SHARE: 1 of 328 = 0.30% (kept patches with an organism author 1, kept patches of any author 1, files landed by boards 327); the denominator counts the files of boards 8 (56), 9 (37), 10 (74), 11 (82), 12 (31), 14 (47), not launched 13, not in it 15 (docs/boards/board-15.js), 16 (docs/boards/board-16.js)
GAPS (state/self/gaps.jsonl, bench/verdicts/autopilot/*.jsonl, state/self/authored.jsonl; the last 7 days to 2026-09-26T04:58:17.840Z):
  open: 192 (missed 10, unreadable bar 10, bar never completed 8, ladder 7, gate slow 8, open 88, dead share 22, board item 39), with a trial 71
  attempted in the last 7 days: 41 gaps in 118 decisions (refused 117, kept 1; 2 decision files, 332 lines)
  kept: 1 in the last 7 days (1 gaps), 1 in all the decision files; state/self/authored.jsonl holds 1 lines, 1 with an organism author
  closed: 0 (no decision or authored line records a gap closed)
MAGNITUDE: the organism per wall hour beside the orchestrator and the simulated clock
  organism: soak 20260924T205054238Z (bench/verdicts/soak.json, 2026-09-24T20:50:54.238Z to 2026-09-24T21:58:28.658Z, 1.126228 wall hours): kept 1 (state/self/authored.jsonl, organism author) and 1 in bench/verdicts/autopilot/*.jsonl, gaps moved 1, distance moved 0.034 bar units, decisions 150
    per wall hour: kept 0.88792, gaps moved 0.88792, distance 0.030189 bar units, decisions 133.187978; on record in all of state/self/authored.jsonl: 1 kept with an organism author
  orchestrator: 13 boards landed (1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 14, 16) and 12 bars met over 9.7542 days (docs/LOG.md, docs/BOARDS.json, bench/verdicts/*.json, 2026-09-16T04:00:00.000Z to 2026-09-25T22:06:00.000Z): 1.3328 boards per day, 1.2302 bars met per day (0.0555 and 0.0513 per wall hour)
  simulated clock: 286.9142 improvements kept per million organism-years (1171 kept over 8243280 organism-years), 27448.7788 generations per second (spread arm 8.1315) (bench/verdicts/spread.json, 2026-09-24T20:34:05.196Z, isTheBar true, barMet false)
UNDONE (state/self/gaps.jsonl, state/self/brief/*.jsonl, bench/verdicts/autopilot/*.jsonl, state/self/authored.jsonl, state/self/resume.jsonl, docs/boards/proposed/*.md; the last 7 days to 2026-09-26T04:58:17.840Z):
  board items undone: 39 (board 10 5, board 11 3, board 12 5, board 13 9, board 14 4, board 15 3, board 16 2, board 17 8)
  attempted by the organism in the last 7 days: 1 board items in 3 attempts, kept 0, refused 3 (walls hit: test 2, budget 1); authored lines on a board item 0
    board-13:exit: attempts 3, kept 0, refused 3 at test 2, budget 1, last 2026-09-26T03:12:25.570Z
  bench plants (not board items): 1 planted items in 17 attempts, kept 2, refused 15 (walls hit: test 3, gate 4, budget 8)
  partial bars (kind bar never completed): 8; resume log 5 lines, 3 of them resumed by 5 distinct resume runs (lines resumed 168, records completed 56; one run can resume several bars, so the per-bar lines below share them)
  proposed boards on disk: 1
    docs/boards/proposed/board-17.md: board 17, 8 items, at 2026-09-26T02:26:03.947Z
```

The loop's own rate and the orchestrator's sit on one line on purpose: the organism kept one
patch in its only soak, the orchestrator landed boards. Nothing here claims the loop is fast; it
prints what the files say so the next board can see the gap between the two.

The two gate rows read the machine the tree is installed on, so they are graded only on the
installation: the tree the registered BrainAutopilot task changes into (its Task To Run is
`cmd /c cd /d <tree> && node tools\schedule-autopilot.mjs --tick`), compared resolved and without
case, or, when no task names a tree, a tree carrying both .git and state/self. On any other tree
(an operator's copy, a planted fixture, a cloud checkout) both print N/A, graded false, and change
nothing. The task is read only with `schtasks /query /tn BrainAutopilot /fo LIST /v`; nothing here
creates, changes or runs a task.

- AUTONOMY is GREEN when the ledger is under 48 hours old, every gap of kinds missed, ladder, gate
  red and gate slow has a trial whose bench file exists, BrainAutopilot is registered and Ready
  (Running is taken as working and printed), state/self/STOP is absent, and the newest decision
  file is under 48 hours old. Not registered is RED and prints the register command; a present
  STOP prints "stopped by hand". The gaps the ledger writes for these two rows themselves are
  left out as echoes, since a red row must not be its own cause.
- HANDOFF is GREEN when docs/HANDOFF.md exists, its own footer says it was generated under 48
  hours ago, every command it lists exists (a script as a file under the tree, an executable on
  PATH, a task by the same read-only query), and its undone counts by kind (the heading and its
  bullets) equal the ledger's. A script the document itself lists as still to be built by its
  board item, and that an undone board item in the ledger names in its bar command, is pending
  rather than missing; a `<task>` placeholder is skipped.

Both rows print their counts and every cause. While a live autopilot holds
state/self-code/autopilot.lock they are referees: the row is computed and printed in full, marked
"REFEREE, not ruling", and does not turn the gate red, because that gate is the autopilot deciding
whether to keep a patch and no patch can move what these rows read. The rows verdict still misses
the bar on a red referee row and on an N/A row, so a run that graded nothing cannot pass.

The rows verdict is written by `node bench/ladder.mjs --rows` as it was for Board 12: met only
when the board carries its six blocks, the gate is GREEN with all seven rows printed, and the
ladder and gate test files pass in the same run. Met, it writes bench/verdicts/rows.json with
isTheBar true and barMet true; missed, it writes bench/verdicts/rows-partial.json with both false.
A rows file an earlier board wrote is copied beside it under its board number before the first
write replaces it.

The tests plant every input under temp directories and inject the task query and the lock
holder, so no real task is queried and no model is called:

```
node tools/budget.mjs --ram-mb 6000 --disk-mb 512 --dir <scratchpad>/tests-out -- node --max-old-space-size=6000 --test --test-concurrency=1 test/ladder.test.mjs test/gate.test.mjs test/gate-rows.test.mjs test/gate-autonomy.test.mjs
ℹ tests 45
ℹ pass 45
ℹ fail 0
ℹ duration_ms 11117.5597
BUDGET done exit 0: wall 11.32 s, peak ram 644.4MB, peak dir 0.0MB, cpu 7.80 s, 6 samples, record state/budget/last.json
```

What is not done: the HANDOFF count check compares against a ledger that self/gaps.mjs rewrites on
every run, and nothing regenerates docs/HANDOFF.md when it does, so the row goes red whenever the
two drift until tools/handoff.mjs is run again. The missed gaps whose verdict form self/gaps.mjs
does not know carry no trial, and AUTONOMY stays red on them until that file learns the forms.

## the climb, the clock, the plateau, the direct recall and a split on every bar (Board 13, 2026-09-26)

Board 13 asked the board five more readings and the gate one more row. Every reading comes from the
verdicts on disk, as before: nothing is run, a missing verdict prints "not measured", a narrow one
prints PARTIAL with its reasons, and a number a verdict does not carry prints n/a, never 0.

CLIMB puts, per public set, the newest board's number beside the board before it, with both Wilson
intervals and the delta in points. A verdict belongs to its own board field when it has one, else to
the first landing in docs/BOARDS.json at or after its at (the first landing takes everything before
it, so it reads "or earlier"), else to the board in progress, which is the lowest board with no
landing: 13. One number stands for each board, its newest whole verdict, else its newest partial one.
On this tree it printed, for GSM8K, board 15's partial 366/407 = 89.93% [86.62, 92.49] against board
11's partial 27/30 = 90.00% [74.38, 96.54], -0.07 points, the intervals overlapping; for HumanEval,
board 11's partial 23/30 = 76.67% [59.07, 88.21] against 5/6 = 83.33% [43.65, 96.99] from board 8 or
earlier, -6.67 points, overlapping; for the ARC evaluation set, board 11's library arm of
grid-library.json at 73/400 = 18.25% [14.77, 22.33] against board 10's grid-evaluation.json at
71/400 = 17.75% [14.32, 21.80], +0.50 points, overlapping, whole against whole. Board 13 is not
measured on any of the three. The GSM8K and HumanEval rows are samples, so neither is a whole-set
climb, and the line says so.

PLATEAU, CLOCK and the leak-free half of DIRECT read verdicts other builders of this board write
(plateau.json, grid-clock.json, grid-clock-whole.json, direct-clean.json). None was on disk when the
board was written, so each printed "not measured". Their field names are not fixed here, so when a
file lands the block prints that verdict's own fields by path, and a reader checks each against the
file named beside it. Board 11's numbers are printed as the baselines: years.json's first plateau at
0.400 s on both planes (grid 49 to 148 over 704435 organism-years, synthetic 89 to 256 over 967321);
grid-library.json's library arm at 73 of 400 with 319 timed out and 7 found but wrong on a clock of
3000 ms per task, against no-library runs of 71 and 71, noise 0; native.json's swept table at 122 of
200 with 176 direct hits (122 correct), 42.89 ns median per hit, filled by sweeping 284749 titles,
and its control, the table with the drawn titles left out, at the same 122 of 200 with 0 direct hits.

The truth about Board 12's MULTIPLYING bar is now printed inside that block. The builder's run
printed population 133/160 against single 134/160 (notes/multiply.md lines 110 and 111); the
verifier's rerun, the bar file bench/verdicts/multiply.json, printed 136/160 against 134/160; the 80 s
partial printed 133 against 134. All four picks of the two whole runs share one searched fitness,
0.9320403696498054, so the fresh number is chosen by the tie-break among libraries the search could
not tell apart; the same command moved the population pick by 3 and the single by 0, and no run
printed a seed-to-seed noise. The block prints "decided by tie-break noise, not a bar" with both runs'
numbers. The rule it states for lifting the label: a run prints its seed-to-seed noise and a gap wider
than it, between picks of different searched fitness. That is this board's reading of "until a run
prints seed-to-seed noise that makes the gap real"; a noise printed while the picks still share one
fitness does not lift it.

The gate's CONTAMINATION row makes a rule of every board since Board 11 a check. Every
bench/verdicts/*.json with isTheBar true must carry a split object; a bar file with no split is red,
one whose split is a string (the dataset's own split, such as "evaluation") is red, and one marked
contaminated (contaminated true at its top level or anywhere in its split) whose statement does not
say so is red. A contaminated bar file whose statement says so is counted and is not a cause. A file
that does not parse is counted as unread, never as clean. Like AUTONOMY and HANDOFF it is a referee
while a live autopilot holds the lock. `node bench/gate.mjs --contamination` prints the row alone.
After the board itself gained a split, and before the gate run below, it printed 53 bar files of
184, 24 with a split object, 1 contaminated and labelled (brief.json), 0 contaminated and unlabelled, 25 with no split and 4 whose
split is a string, so the row is RED and names every file. The older bar files are the orchestrator's
to decide: each needs its split written by the bench that owns it, which this item does not own.

A red CONTAMINATION row has knock-on effects this item cannot change from its own files: on a gate
already red, the autopilot keeps a patch only when the gate shows it fixed a red file and turned no
green one red; self/gaps.mjs turns the red row into a gap with no trial; and the brief stops when the
gate on its copy is not GREEN. The rows verdict names the causes, and a red row misses its bar, as it
should.

The tests plant every verdict under temp directories. Each rule has a control that turns on the defect
alone, and the real tree is held to an independent census:

```
node tools/budget.mjs --ram-mb 6000 --disk-mb 512 --dir <scratchpad>/tests-out -- node --max-old-space-size=6000 --test --test-concurrency=1 test/ladder.test.mjs test/gate.test.mjs test/gate-rows.test.mjs test/gate-autonomy.test.mjs test/gate-contamination.test.mjs
ℹ tests 56
ℹ pass 56
ℹ fail 0
ℹ duration_ms 11931.1668
BUDGET done exit 0: wall 12.08 s, peak ram 606.1MB, peak dir 0.0MB, cpu 7.08 s, 6 samples, record state/budget/last.json
```

What is not done: PLATEAU, CLOCK and the leak-free DIRECT are not measured until their verdicts land,
and CLIMB cannot put a Board 13 number on any set until a Board 13 public or ARC verdict exists. The
25 bar files with no split and the 4 with a string split keep CONTAMINATION red until their benches
write a split object.
