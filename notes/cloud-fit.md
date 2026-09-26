# notes/cloud-fit.md: the fit item (Board 13)

His P13: the organism lives 24/7 in a 512m container; the supervisor's rss budget is 448 MB (BRAIN_RSS_CAP_MB 448).

This file is the builder's record: what changed, what was measured, by which command, and what is open. Every number below was printed by the command named beside it.

## Files

- memory/knowledge.mjs: the resident cap (BRAIN_KNOWLEDGE_RESIDENT_MB, default 64). readTyped reads windowed with readSync into fixed 16384-byte segments; the least recently read segments are evicted; census() prints residentBytes, capBytes, evictions; residentGuard(store) walks what a store really holds and says OVER when it is past its cap.
- daemon/run.mjs: the self round's memory guard (BRAIN_SELF_FLOOR_MB, default 380: run, prune or defer, printed with its numbers), the tick-freeze fix (the suites run beside the ticking organism on a clone; the live tick cost is measured after them as a median; holdPlan sizes the synchronous rest against BRAIN_SELF_HOLD_MS, default 1000, or defers; a stop skips the round), and the self-code floor (a child under tools/budget.mjs with an rss cap of floor minus rss, started only when rss plus its measured need stays under the floor).
- bin/serve.mjs: the health census carries knowledge and fit.
- bench/cloud.mjs: the FIT rows and the fit watch, beside Board 16's 8 rows.
- test/cloud-fit.test.mjs: extended with four tests.
- bench/verdicts/cloud-fit.json (the bar), cloud-fit-control.json (the control), cloud-fit-300.json (RUN 1).

## The freeze, found by measuring

At HEAD 3add994c the self round paused the runner for its whole length. A scratch probe of the cloud config (scratch fit/p1.log) printed round 1 at 1541ms and round 2 at 121351ms; its 5 s census read t=39961 from 157.5 s to 272.5 s, so the tick stood still for the whole round. The control run's own log (bench-a.log of cloud-fit-control) printed round 2 at 121329ms.

The rest of a round is ticks of trial arms, so its hold is the live tick cost times the arms: on the tiny test organism the same one-candidate round held 232 ms at 2 ms a tick and 5279 ms at 28 ms a tick. The fix measures that cost before every hold and sizes candidates, then the trial window, to the budget, else defers.

After the fix:
- The tiny test (two rounds, 200 ms budget) printed "the longest the tick stood still was 159 ms" and, in a later run, 175 ms (bar: under 1000).
- RUN 1 printed a hold max of 684.456 ms.
- RUN 2 printed a hold max of 709.209 ms, with 0 holds over the 1000 ms budget.

## Bar

RUN 1: `node bench/cloud.mjs --native --seconds 300 --keep --out bench/verdicts/cloud-fit-300.json`. This is the 300 s shape of `node bench/cloud.mjs`; docker is absent, so native.
- restartCount1NoBudgetKill true: restarts 1, budget kills 0. B: restarts 0, budget kills 0.
- rss peak {"daemonA":460,"serveA":66,"daemonB":443,"serveB":67,"instanceA":526,"instanceB":510}, so daemonPeakRssUnderCap is false.
- FIT rows all true:
  - self rounds 5;
  - self-code starts 2, refusals 3, kills 2;
  - checkpoint age max 7.6 s;
  - hold max 684.456 ms.
- Budget wrapper: "wall 306.86 s, peak ram 1020.3MB".

RUN 2: `node bench/cloud.mjs --native --seconds 1800 --keep --out bench/verdicts/cloud-fit.json`. isTheBar true, barMet false.
- Restarts: A 7 (1 bench kill, 6 budget kills), B 0 (0 budget kills).
- rss peak {"daemonA":575,"serveA":71,"daemonB":531,"serveB":72,"instanceA":646,"instanceB":603}.
- Self rounds 6 (log 6). Hold max 709.209 ms, 0 over budget. Plan defers 0, guard defers 411, prunes 0.
- Self-code:
  - starts 1 (log 1), refusals 24, kills 1;
  - the child was killed at a peak of 127.824 MB under its 57 MB cap;
  - last refusal: "rss 390 MB + need 128 MB (measured at t=20096 (killed)) = 518 MB, over the floor 380 MB".
- Checkpoint age: max A 11.3 s, B 7.9 s over 360 samples; 2.9 s at the end.
- Knowledge (the serve lines): resident max A 1498336 and B 1826016 bytes of a cap of 67108864, evictions 0.
- FIT rows {"fitBudgetKills0":false,"fitSelfRounds3":true,"fitSelfCodeStart1":true,"fitCheckpointAgeMax60":true,"fitHoldUnder1s":true}. Of the 8 rows, restartCount1NoBudgetKill and daemonPeakRssUnderCap are false.
- Budget wrapper: "wall 1807.03 s, peak ram 1222.5MB, peak dir 572.9MB".

The six budget kills of A, from bench-a.log. Each came right after a checkpoint's [ruler] and [ledger] lines, while the checkpoint grew from 6,516,088 B to 7,953,600 B:

| t | rss at kill | after |
|---|---|---|
| 293345 | 542 MB | 900.3 s |
| 360111 | 450 MB | 294.7 s |
| 369039 | 451 MB | 64.8 s |
| 371185 | 462 MB | 13 s |
| 377945 | 558 MB | 35.2 s |
| 379900 | 451 MB | 10.4 s |

The self-round guard was deferring over the floor at the time. For example, "rss 446 MB is over the floor 380 MB and a prune releases only 1.4 MB" at t=293014.

The 8 rows need no scaling: they run on fractions of --seconds, so at 1800 s the bench kill is at 450 s, the duplicate at 810 s, the egress probe at 1080 s and the after reading at 1800 s.

The statement's "Knowledge store census: none" is a reporting defect of the fit watch. The last A daemon (pid 38572) had restarted after the budget kill at 2026-09-26T07:54:18.263Z, before the after reading at 07:54:43.785Z, and had not opened a store yet, and its empty census replaced the last one read. The serve lines above carry the real numbers. bench/cloud.mjs now keeps the last non-empty census. The verdict stays as written.

## Control

bench/verdicts/cloud-fit-control.json: the tree at HEAD 3add994c7e75626b75a43d669521b2b84b6c7a59 (a copy in scratch) with this harness, 1800 s.
- Restarts: A 14 (1 bench kill, 13 budget kills), B 8 (8 budget kills), so restarts beyond the bench kill 21.
- rss peak {"daemonA":600,"serveA":66,"daemonB":585,"serveB":71,"instanceA":666,"instanceB":656}.
- Checkpoint age 82.9 s at the end, max 225.3 s. Self rounds (log) 11.
- Self-code starts 0: HEAD refuses self-code while the bench flag is up.
- Budget wrapper: "wall 1829.19 s, peak ram 1094.1MB".

The control restarted, so the control condition holds.

Change against the control:

| | control (HEAD) | RUN 2 |
|---|---|---|
| budget kills | 21 | 6 |
| daemon rss peak A / B | 600 / 585 MB | 575 / 531 MB |
| checkpoint age max | 225.3 s | 11.3 s |
| longest round hold | 121329 ms | 709.209 ms |

Noise: one 1800 s run per arm, so seed-to-seed noise at 1800 s is not measured. The ladder below is the only repeat measure.

## Ladder

`node bench/ladder.mjs --health --seed 7 --ticks 2000`, each run under tools/budget.mjs. Three runs at HEAD and three after, plus three more after the last daemon/run.mjs edit. All nine printed the same line:

`{"score":0.86343,"ticks":2000,"t":2000,"seed":"7","cells":205,"edges":2881,"runs":292989,"errors":0,"refused":0,"activeCellRate":0.8439024390243902,"usedEdgeRate":0.7073932662270045}`

The HEAD band is zero wide, and every field after the change sits inside it. Walls were 10.50 s to 10.63 s.

## Tests

`node --test test/cloud-fit.test.mjs test/cloud.test.mjs test/memory.test.mjs test/daemon.test.mjs`:
- Latest spec run: tests 40, pass 40, fail 0, duration_ms 24905.8719.
- Over 10 runs of the final code: 8 green.
- One failure was test/daemon.test.mjs:106: "self-code ran 0 times: {"generations":4,"dream":33,"spawn":9,"ingest":11,"self-code":0}".
- One failure was test/cloud.test.mjs at file level: "test failed" at 6974 ms with no subtest reported, cause not found.
- The HEAD copy ran the same four files green 4 of 4 (36 tests).

The daemon.test failure is the floor. That test's tiny organism runs in the test process, and a scratch probe of its shared run printed:
- alone: "rss 364 MB + need 0 MB ... = 364 MB, under the floor 380 MB";
- with the other three files running beside it, all three attempts refused, one of them "rss 544 MB + need 0 MB (not measured yet; the start is bounded by its cap) = 544 MB, over the floor 380 MB".

The floor is doing what the item says. The test's TINY options set no selfFloorMb, and test/daemon.test.mjs is not a file this item owns.

## Open

- The bar is missed on budget kills: 6 against 21 in the control. The kills follow checkpoint writes as the organism and its checkpoint grow. The self round is already deferred (411 guard defers) and the knowledge store holds under 2 MB, so the rss is outside the lines this item owns: the checkpoint serialization, the generations worker, and organism growth.
- The self-code dry child is killed at its cap within a second (127.824 MB against 57 MB). A start counts, but the child does no work, and its measured need then refuses later starts.
- test/daemon.test.mjs needs a floor in its TINY options (for example selfFloorMb 1024) to be deterministic under the floor.
- The cloud.test.mjs file-level flake (1 in 10) is not explained.
