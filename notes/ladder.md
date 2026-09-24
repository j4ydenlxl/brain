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
