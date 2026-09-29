# grid-curve: the second attempt and the clock curve (Board 33, item arc-lock-in)

The question (his, relayed): the ARC-AGI-1 row reads 21.25 against a bar of 98, "why so far?", then "lock in".
The answer this item measures: the 3000 ms one attempt run (`bench/verdicts/grid-local-evaluation.json`,
2026-09-27T18:38:05.825Z) printed 85 of 400; of the 315 it did not solve, 288 ran out of clock, 26 found a
program that fit every train pair and missed the test, 1 exhausted the vocabulary. ARC grades two attempts
and that run gave one. So two things that are not knowledge were left on the table: the second attempt and
the clock. This item moves only those two. The depth stays 4 and the vocabulary stays 196
(`capability/grid-dsl.mjs` unchanged); every verdict says so in `heldFixed`, `maxDepth` and `vocabulary`.
MODEL OFF throughout: provider null, no socket, no model call.

## What landed

- `capability/grid-search.mjs`: `programLength`, `orderAttempts`, and `solveArcTask` now emits its
  attempts in the order below, each with `found` (its discovery number). The search itself is unchanged.
- `bench/grid-curve.mjs`: the attempts run (`--out attempts`), the clock curve (the bar file), the
  journal with `--resume`, the price line, the memory rule, the training control (`--limit`, `--seed`).
- `test/grid-curve.test.mjs`: the rule on a two answer fixture and a one answer fixture, the paired gain
  and loss on fixed rows, the journal (resume, torn tail, header mismatch) on a fixture journal, the price
  line, the memory rule, the arguments, and the shapes of the three verdict files. No test runs a point.
- `bench/verdicts/grid-attempts.json`, `bench/verdicts/grid-curve.json` (THE BAR FILE),
  `bench/verdicts/grid-curve-partial.json` (the training control), and their journals
  `bench/verdicts/grid-attempts-evaluation-3000ms.jsonl`, `bench/verdicts/grid-curve-evaluation-30000ms.jsonl`,
  `bench/verdicts/grid-curve-training-3000ms-n100-seed33.jsonl`, `bench/verdicts/grid-curve-training-30000ms-n100-seed33.jsonl`.

## The second attempt rule

When more than one program fits every train pair, the two attempts are the first two programs the search
finds whose TEST outputs differ (a program whose test outputs equal an earlier attempt's on every test
input is not a new attempt). The two are listed by program length (base words; a learned last step counts
as one; a macro counts as the words it stands for), then by discovery order. When only one answer is found
before the clock ends, attempt 2 is empty. `solvedFirst` stays the program found first, the answer a one
attempt run gives. The rule text is `ORDER_RULE` in `bench/grid-curve.mjs` and `secondAttemptRule` in
every verdict.

Why the first two found and not the two shortest of every program that fits: taking the two shortest needs
the search to run on after it has two answers, and the fallback phase's cell rule programs are short, so
a short program found late could push out a right answer found first. That would lose tasks the one
attempt run solves. With the first two found, the first found is always one of the two, so no task the one
attempt run solved at the same clock can be lost except by timing.

## The memory rule (measured before it was written)

At 30000 ms the search's memory grows with the clock. Three of the heaviest evaluation tasks at 30000 ms
took the process to 5188.2 MB (budget peak) with heaps of 935, 1371 and 1579 MB after the task; twelve at
once printed `BUDGET KILLED ram 7205.4MB over 6000MB`. A first scheduler (admit 3600 MB, preempt 4600 MB
every 1.5 s, no ramp) printed `BUDGET KILLED ram 6325.9MB`. The rule that held: a lane starts a task only
while the process is under 3000 MB and at least the ramp (1500 ms, never more than a twentieth of the
clock) after the last start; over 4400 MB the task started last is stopped every 700 ms, requeued at the
head and run again from its start (at most 3 times). A preempted run writes no row, so every row in a
journal is one whole run at the whole clock. On the twelve heaviest tasks at 30000 ms it printed
`BUDGET done exit 0: wall 208.27 s, peak ram 4495.9MB`, 14 preemptions, 0 workers out of memory.

Two fixes printed on the way: a whole 1500 ms ramp at 3000 ms held the first attempts session to about
a few tasks at a time (320 rows took 693.6 s, against 103.84 s for all 400 after both fixes), so
the ramp is now at most a twentieth of the clock; and V8 keeps a finished task's heap (after 3000 ms tasks
the heap read 130 MB at the 10th percentile, 204 MB at the median, 334 MB at the 90th, 609 MB at most, over
320 rows; a full collection gave back only 288 MB to 142 MB in a probe), while a fresh worker boots in 153
to 185 ms at 28 to 29 MB, so a worker whose heap passed 96 MB is replaced after its task. The rerun from an
empty journal then printed `3000 ms: ran 400 tasks in 103.84 s this session, peak rss 2515 MB`.
The throttled first session was kept aside as a repeat: on the 340 tasks it finished it solved the same
tasks as the 12 lane run (`solved by both 75, throttled only 0, 12 lanes only 0`).

## Commands

```
node tools/budget.mjs --ram-mb 6000 --disk-mb 300 --dir bench/verdicts -- node --max-old-space-size=4000 bench/grid-curve.mjs --out attempts --split evaluation --budget-ms 3000 --attempts 2 --workers 12 --resume --base bench/verdicts/grid-local-evaluation.json --control bench/verdicts/grid-split-evaluation-control.json
node tools/budget.mjs --ram-mb 6000 --disk-mb 300 --dir bench/verdicts -- node --max-old-space-size=4000 bench/grid-curve.mjs --split evaluation --budget-ms 30000 --attempts 2 --workers 12 --resume --base bench/verdicts/grid-local-evaluation.json,bench/verdicts/grid-attempts.json
node tools/budget.mjs --ram-mb 6000 --disk-mb 300 --dir bench/verdicts -- node --max-old-space-size=4000 bench/grid-curve.mjs --split training --budget-ms 3000,30000 --attempts 2 --workers 12 --resume --limit 100 --seed 33 --base bench/verdicts/grid-local-training.json
node --test test/grid-curve.test.mjs
```

The curve command, run again with `--resume` after the control, runs nothing (its journal is complete)
and writes `grid-curve.json` again, now naming the control.

## Results (every number is a line a command printed)

### Step 1: the second attempt, 3000 ms, 12 workers, evaluation

```
POINT 3000 ms, 1 attempt: solved 85 of 400 = 21.25 percent (clean 84 of 399), timed out 288, found but wrong 26, exhausted 1, errors 0, mean ms 2422.38, wall s 243.49 [bench/verdicts/grid-local-evaluation.json, 2026-09-27T18:38:05.825Z]
POINT 3000 ms, 2 attempts: solved 86 of 400 = 21.5 percent (clean 85 of 399), timed out 286, found but wrong 27, exhausted 1, errors 0, mean ms 2792.81, wall s 103.68; against 3000 ms, 1 attempt: gained 1, lost 0 [bench/verdicts/grid-attempts-evaluation-3000ms.jsonl, 2026-09-28T01:36:54.403Z]
SECOND ATTEMPT: solved 86 of 400 = 21.5 percent with 2 attempts at 3000 ms (86 by the program found first, 0 only by the second, 55 tasks had a second answer)
against bench/verdicts/grid-local-evaluation.json (1 attempt, 85 solved): gained 1, lost 0; found but wrong there turned right 0 of 26
control bench/verdicts/grid-split-evaluation-control.json: this run 86, control 71, gained 15, lost 0
```

The second attempt converted 0 of the 26 found but wrong tasks. 13 of the 26 got a second, different
answer inside the clock, and all 26 stayed wrong (`base found-but-wrong 26 now with 2 answers 13
{"found-":26}`). The one gain, ca8f78db, was the program found first (`firstMs 2154.25`), where the one
attempt run had timed out at 3000 ms: a clock edge, not the second attempt. Lost is 0.
So at this vocabulary the second answer the search finds is a near variant of the first wrong one; the
second attempt is worth 0 tasks at 3000 ms, and the gap is the clock.

### Step 2: the clock curve, 30000 ms, 2 attempts, 12 workers, evaluation (THE BAR FILE)

```
30000 ms: ran 154 tasks in 372.98 s this session, peak rss 10577 MB, preempted 0 (0 task seconds run again), admission waits 156.9 lane seconds, workers replaced for heap 146
30000 ms journal: peak rss 10577 MB over 1 of 4 sessions ended, preempted 0, largest heap after a task 1690 MB, workers out of memory 0
POINT 30000 ms, 2 attempts: solved 91 of 400 = 22.75 percent (clean 90 of 399), timed out 272, found but wrong 35, exhausted 2, errors 0, mean ms 25864.28, wall s 3897.05; against 3000 ms, 2 attempts: gained 6, lost 1 (8ee62060) [bench/verdicts/grid-curve-evaluation-30000ms.jsonl, 2026-09-28T12:20:41.381Z]
MARGINAL 3000 to 30000 ms (1 tenfolds), 2 attempts: gained 6, lost 1, net 5, solved per 10x clock 5
isTheBar true, barMet false (22.75 < 98)
```

Ten times the clock moved the point from 86 to 91 of 400 (21.5 to 22.75 percent): gained 6, lost 1, net 5,
so 5 tasks per tenfold of clock; 272 of 400 still time out at 30 s, and found but wrong rose from 27 to 35.
The frontier row is 98 (bench/verdicts/ladder.json); at 5 tasks per tenfold no clock reaches it, so the gap
is the vocabulary (capability/grid-dsl.mjs), not the clock. The lost task, 8ee62060, is the search schedule
and not noise (both journal rows): with the 3 s clock the main search phase ended at 2250.37 ms and the
fallback phase (749.86 ms) found the right depth 2 program [rot90, cellRule] at 2291.6 ms; with the 30 s
clock the main search ran on, reached depth 3, found two wrong programs [mirrorRight, xorLR, localRule]
(the first at 4001.09 ms) and stopped at its 2 attempts after 7376.59 ms, so the fallback never ran.
A longer clock is a different search, not the same search run longer.

The point ran over four sessions of one journal (the verdict prints 1 of 4 sessions ended: only the last
wrote its end record), and three of them are a memory lesson. Board 33's session was cut by the session
limit at 171 of 400 rows. The second, under the default rule (--admit-mb 3000 --preempt-mb 4400), ran
50 of 229 tasks in 768 s with 109 preemptions (rss peak 5108 MB) and was killed by hand. The third, at
--preempt-mb 9000, printed rss 9099 MB in its first minute with lanes still preempted and was killed. The
last ran with --admit-mb 24000 --preempt-mb 30000 under --ram-mb 34000: 154 tasks in 372.98 s, preempted 0,
peak rss 10577 MB, largest heap after a task 1690 MB. A lane's heap grows through its clock, so twelve
lanes at 30 s need a bound above twelve times the 2048 MB --heap-mb default, not 4400 MB; the 300000 ms
command below needs the same three flags. A preempted task restarts from zero and every row in the journal
ran its full clock or finished, so the rule cost wall, never rows.

### Step 3: the control, the training split, a fixed seed draw of 100

```
3000 ms: ran 100 tasks in 26.4 s this session, peak rss 2500 MB, preempted 0 (0 task seconds run again), admission waits 22.8 lane seconds, workers replaced for heap 87
30000 ms: ran 100 tasks in 230.67 s this session, peak rss 10561 MB, preempted 0 (0 task seconds run again), admission waits 244.5 lane seconds, workers replaced for heap 87
30000 ms journal: peak rss 10561 MB over 1 of 1 sessions ended, preempted 0, largest heap after a task 1555 MB, workers out of memory 0
POINT 3000 ms, 1 attempt: solved 37 of 100 = 37 percent, timed out 50, found but wrong 13, exhausted 0, errors 0, mean ms 1934.28, wall s null [bench/verdicts/grid-local-training.json, 2026-09-27T18:48:25.508Z]
POINT 3000 ms, 2 attempts: solved 41 of 100 = 41 percent, timed out 49, found but wrong 10, exhausted 0, errors 0, mean ms 2554.15, wall s 26.2; against 3000 ms, 1 attempt: gained 4, lost 0 [bench/verdicts/grid-curve-training-3000ms-n100-seed33.jsonl, 2026-09-28T12:21:39.209Z]
POINT 30000 ms, 2 attempts: solved 44 of 100 = 44 percent, timed out 46, found but wrong 9, exhausted 1, errors 0, mean ms 22202.49, wall s 228.92; against 3000 ms, 2 attempts: gained 4, lost 1 (aabf363d) [bench/verdicts/grid-curve-training-30000ms-n100-seed33.jsonl, 2026-09-28T12:25:28.338Z]
MARGINAL 3000 to 30000 ms (1 tenfolds), 2 attempts: gained 4, lost 1, net 3, solved per 10x clock 3
isTheBar false (a --limit or --ids run grades part of the split; the training split is in sample (the vocabulary was written against it): the CONTROL of the curve, not the bar), barMet false
CONTROL bench/verdicts/grid-curve-partial.json (training, in sample, 2026-09-28T12:25:30.096Z): 3000 ms 1a 37 of 100, 3000 ms 2a 41 of 100 (+4 -0), 30000 ms 2a 44 of 100 (+4 -1)
```

On the training split (in sample: the vocabulary was written against it) the same curve reads 37, 41 and
44 of 100: the second attempt gains 4 at 3 s and loses 0, and the tenfold clock nets 3 (gained 4, lost 1,
aabf363d). On the held-out evaluation split the same two steps net 1 and 5 of 400. So the second attempt
pays only where the vocabulary already fits (training +4 of 100, evaluation +1 of 400), and the clock buys
3 to 5 tasks per tenfold on either split. The control ran under the same memory flags as the last
evaluation session (peak rss 10561 MB, preempted 0, largest heap after a task 1555 MB at 30 s).

## The next point: 300000 ms (the orchestrator's run, not run here)

```
node tools/budget.mjs --ram-mb 6000 --disk-mb 300 --dir bench/verdicts -- node bench/grid-curve.mjs --split evaluation --budget-ms 300000 --attempts 2 --workers 12 --resume --base bench/verdicts/grid-local-evaluation.json,bench/verdicts/grid-attempts.json --only-timed-out-of bench/verdicts/grid-curve-evaluation-30000ms.jsonl
```

It runs only the tasks the 30000 ms point left timed out (`--only-timed-out-of`), carries every other row
from the 30000 ms journal, and writes `grid-curve.json` again with every point. MEMORY WARNING: the heap
grows with the clock (the 30000 ms journal line below prints the largest heap after a task), each worker
has a 2048 MB old generation limit, and at 30000 ms the memory rule, not the CPU, set the wall. The price
line is a CPU price and says so; at 300000 ms fewer lanes fit under the 6000 MB cap, so expect a wall
several times the printed price, and expect rows with status error where a task passes its heap limit.
Run it alone on the machine, with `--resume` so a kill loses only the tasks in flight.

Run at checkpoint 4 (2026-09-28, 21:16 to 21:23 EDT, under --ram-mb 34000 --admit-mb 24000 --preempt-mb 30000, 12 workers): the memory rule held (0 preemptions, ram 15968 MB at 60 s, peak 27622 MB) and the heap rule did not. Every row that ended was killed at 304000 ms with ERR_WORKER_OUT_OF_MEMORY (15 rows, 15 errors, 0 solved, largest heap 2007 MB against the 2048 MB --heap-mb), and at 437 s the process itself aborted (exit 134, FATAL ERROR CALL_AND_RETRY_LAST Allocation failed: a lane isolate at 2007 MB after last-resort mark-compacts at 211 s and 212 s), so the journal held no clean row and was set aside. A lane heap grows through its clock and passes 2 GB near 210 s, so the 300000 ms point needs a heap above what 300 s of search allocates, at fewer lanes: the next attempt is --workers 6 --heap-mb 4096 (24.6 GB of old generation at most, under the 34000 MB cap), priced at 271 tasks times 300 s over 6 lanes, about 226 minutes of wall. The first launch of the evening, under the default rule, preempted 6 tasks in its first minute and was killed by hand at 21:15, as this note said it would.

## Measured (what was read before building)

- `notes/grid.md` (the vocabulary, the cell rule fallback, the split and contamination rules), `bench/grid.mjs`
  (`splitFor`, `overlapOf`, `frontierBar`, `loadSplit`; the `--attempts` flag exists for `--library` runs,
  so this bench drives its own workers and `bench/grid.mjs` is unchanged).
- `capability/grid-search.mjs` (`searchWithFallback`, `take()` stops at `want` answers and dedups by test
  output, `maxStates` 200,000 stored states) and `capability/grid-dsl.mjs` (`expandName`, `MACRO_JOIN`).
- `bench/verdicts/grid-local-evaluation.json`, `grid-split-evaluation-control.json` (the control arm:
  the search without the fallback phase), `grid-local-training.json`, `public-arc.json` (the bar,
  Gemini 3.1 Pro (Preview) at 98; the published no-model row, Icecuber at 17).
- `tools/budget.mjs` (the RAM cap is the working set of the whole tree, sampled every 2000 ms) and
  `test/grid-library.test.mjs` (the two attempt fixture, attempt 1 is the one attempt search).
- ARC's own scoring (two attempts per test input, right when either is right), as the verdicts in this tree
  already state it (`attemptsAllowedByArc: 2`).
- Node's `worker_threads` `resourceLimits`: a probe with `--heap-mb 800` let a heap reach 1493 MB with no
  out of memory, so the per worker limit does not bound the heap this search builds; the memory rule reads
  the process instead.

## Open

- The 300000 ms point (the command above), the orchestrator's.
- The vocabulary and the depth: held fixed here by order. The found but wrong tasks are the vocabulary's.
