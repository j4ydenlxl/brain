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

## Measured (Board 19, queue item 9 B1: the streamed checkpoint; board 19 builder, 2026-09-26)

Host: the cloud session (Linux, node v22.22.2, 4 CPUs shared with three other agents, 16 GB). bench/fixtures/wiki/store is absent from this checkout, so the ingest step opens no knowledge store here (the Board 13 runs above had one). Every number below was printed by the command named beside it; the probe and A/B scripts were scratch files outside the tree.

### Before: the rss around a checkpoint write

The probe runs bin/serve.mjs natively with compose.yaml's environment as bench/cloud.mjs sets it (the model stub, BRAIN_SELF_CODE_DRY 1), with the rss cap lifted to 2000 MB so nothing restarts, for 600 s, under tools/budget.mjs. A preload in the daemon child wraps Brain.prototype.snapshot: VmRSS before, VmHWM at the end after a reset through /proc/self/clear_refs at the start (the peak during the write), VmRSS after. A sampler outside reads the child's VmRSS every 100 ms (+1 s, +2 s). Today's writer:

- t=1014 checkpoint 2521528 B write 1096 ms: rss before 242.9 MB, peak during 281.3 MB (+38.4), after 273.2 MB, +1 s 264.7 MB, +2 s 273.1 MB
- t=36097 checkpoint 2705144 B write 1202 ms: rss before 380.1 MB, peak during 416.2 MB (+36.1), after 388.8 MB, +1 s 380.4 MB, +2 s 379.7 MB
- t=70097 checkpoint 1995328 B write 1151 ms: rss before 383.8 MB, peak during 428.8 MB (+45), after 393 MB, +1 s 383.9 MB, +2 s 384.3 MB
- checkpoints 72: write delta peak-before mean 36.5 MB, max 49.7 MB, min 30.6 MB; peak during max 432.9 MB; write ms mean 1166; bytes max 2853128; overall sampled daemon rss max 429.6 MB

What the write held, read from the code and from the header of the probe's checkpoint at t=52097 (4167 vectors of 8192 lanes, raw 4267008 bytes; skeleton raw 2357915 bytes; 5115 slots):
1. the whole snapshot document at once (core/brain.mjs): every cell, mailbox, signal in flight and outbox signal serialized before the first byte is written, each payload its own string (core/signal.mjs packHV builds a new string for every reference);
2. the skeleton as a list of small strings, then joined into one string, then a Buffer of it;
3. each vector twice (its packed bytes and a latin1 key string of the same length for the dedup map), the payload bytes and the edge columns as small Buffers;
4. at assembly a concatenated copy of every section, then xorRiceEncode's own copy of each vector store and an output buffer of at least half of it.

The episodic store's serialisation (memory/episodic.mjs serialize, one string per key, 2048 at the bound) is part of 1 and stays eager: seeds/whole.mjs builds it in the snapshot hook, outside this item's lines. The after figures below include it.

### The change: synchronous and chunked

A Writable with backpressure would let ticks run between chunks, and the checkpoint is the organism at exactly one tick, so the writer is synchronous: one call, bounded blocks, the tick held as before. Lines:
- core/persist.mjs: line 10 (the zlib import adds createDeflateRaw and constants), line 11 (the pack import adds XorRiceStream), and the new block at lines 773 to 1141 (STREAM_BLOCK, Spill, SpillStream, SyncDeflate, StreamTable, writeCheckpointStreamed). writeCheckpoint, SlotTable and assembleCheckpoint are untouched: they are the control.
- core/pack.mjs: the new class XorRiceStream at lines 338 to 426; xorRiceEncode untouched.
- core/brain.mjs: line 14 (the import), snapshot() at line 269 (a `stream` option; its document code moved unchanged into snapshotDoc at lines 292 to 336, with `lazy`), lazyList at line 399.
- daemon/run.mjs: checkpointStream() and its comment at lines 116 to 122 (BRAIN_CHECKPOINT_STREAM=0 is the control), checkpoint() at line 129 passes the switch, and line 747 prints "[live] checkpoint write streamed" or "whole" at every start.
- bin/serve.mjs: unchanged (the child inherits the environment).
- bench/cloud.mjs, the defect that blocked the bar: the free RAM wait was fixed at 16 GB and this 16 GB host has about 14 free, so the bench would wait 30 minutes and exit 3. `--free-gb N` (lines 5, 474 to 483), default 16; every command below names `--free-gb 4`.

How it holds its bound: one walk of the document as today; the slot records, the skeleton (through one staging block, a new deflate every SKEL_CHUNK characters) and the payload bytes (a new deflate every BYTES_CHUNK bytes) go through incremental raw deflates on zlib's own handle, the edge columns raw, each new vector into its group's plain stream and a streamed xor-rice coder that keeps only its 65 slot window; every stream is blocks of 64 KiB on a spill file (<file>.spill) plus one partial block; the header is computed at the end, then the temp file gets the prefix, the header and each section copied block by block, and is renamed over the target; the spill is deleted either way. Vector dedup is a 53 bit key of two CRCs, every hit confirmed against the bytes read back. The same bytes as today's writer: test/cloud-fit-stream.test.mjs, and "identical true" in every A/B line below.

### After: the same probe, streamed

- t=1014 checkpoint 2529648 B write 1019 ms: rss before 237.3 MB, peak during 242.8 MB (+5.5), after 242.8 MB, +1 s 248 MB, +2 s 250.2 MB
- t=32097 checkpoint 2756328 B write 996 ms: rss before 352.3 MB, peak during 357.2 MB (+4.9), after 357 MB, +1 s 354.3 MB, +2 s 353.8 MB
- t=62097 checkpoint 2208952 B write 1146 ms: rss before 370.3 MB, peak during 378.4 MB (+8.1), after 375.7 MB, +1 s 361.9 MB, +2 s 368.2 MB
- checkpoints 64: write delta peak-before mean 6.3 MB, max 10.1 MB, min 2.3 MB; peak during max 378.4 MB; write ms mean 1056; bytes max 2860312; overall sampled daemon rss max 379.2 MB

### The control with its noise: one organism written both ways

A scratch script restores an organism the bench wrote, then writes its checkpoint 5 times each way, alternating, under the daemon's heap flags (--max-old-space-size=224 --max-semi-space-size=1 --optimize-for-size), and prints the peak over the rss before each write (VmHWM after a reset), in MB:
- t=71056, 1987304 bytes, old first: old [45.1,46.8,52.8,37.3,46.8] mean 45.8; stream [1.9,2,0.5,1.9,1.7] mean 1.6. Stream first: old [45.1,56.3,52.7,45.1,46.1] mean 49.1; stream [9.8,2.1,-0.1,0.8,1.5] mean 2.8. identical true.
- t=155256, 4018848 bytes (the control bench run's final organism), old first: old [46.8,38.4,39.6,42.7,43.3] mean 42.2; stream [1.1,2.1,1.5,1.5,2] mean 1.6. Stream first: old [38.7,53.3,45.2,52.1,48.3] mean 47.5; stream [12.8,1,1.6,0.9,0.6] mean 3.4. identical true.

Noise: the old writer's 20 writes span 37.3 to 56.3 MB and the streamed writer's -0.1 to 12.8 MB (its largest two are a process's first write); the ranges do not overlap. Write time: old 825 to 1236 ms, stream 670 to 1079 ms.

### The bar and the control

Both under `node tools/budget.mjs --ram-mb 4000 --disk-mb 2000 --dir <scratch dir> -- node --max-old-space-size=512 bench/cloud.mjs --native --seconds 1800 --keep --free-gb 4 --out <verdict>`, with TMPDIR set to the watched dir so the bench's state sat under it, one after the other: the control first (BRAIN_CHECKPOINT_STREAM=0, bench/verdicts/cloud-fit-control.json), then the bar (bench/verdicts/cloud-fit.json). The 300 s smoke of both arms ran before them (cloud-fit-control-partial.json: restarts 1, budget kills 0, peak 381/370; cloud-fit-partial.json: restarts 1, budget kills 0, peak 367/360).

CONTROL, streamed writer off (the daemon logs print "[live] checkpoint write whole (BRAIN_CHECKPOINT_STREAM=0, the control)"):
- health before: ok true, restarts 0, budgetKills 0, tick 39217, rssMb 376, peak daemon 419, checkpoint t=39097, 2683752 bytes, 1.5 s old
- `kill: daemon pid 21388 killed at t=49029 (checkpoint t=48097); restart count 1 after 4900 ms, new pid 22574, resumed at t=48097 (from checkpoint: true)`
- `restart count 1 (1 from the bench kill, 0 budget kills at the rss cap, 0 other); B: restarts 0, budget kills 0`
- health after: ok true, restarts 1, budgetKills 0, tick 155173, rssMb 391, peak daemon 439, checkpoint t=155097, 3902136 bytes, 2 s old
- `rss peak: {"daemonA":439,"serveA":82,"daemonB":454,"serveB":77,"instanceA":521,"instanceB":531}`
- `FIT peak daemon rss A 439 MB, B 454 MB (cap 448); budget kills A 0, B 0; self rounds 3 (log 3), hold max 1559.523 ms, plan defers 1, guard defers 121, prunes 0; self-code starts 1 (log 1), refusals 4, kills 1; checkpoint age max 17.7 s`
- 8 rows: daemonPeakRssUnderCap false, the other 7 true. Checkpoint bytes max 4140744 (A), 4149288 (B). Budget wrapper: wall 1806.66 s, peak ram 1105.3MB, peak dir 212.5MB.

BAR, streamed ("[live] checkpoint write streamed (core/persist.mjs writeCheckpointStreamed)"):
- health before: ok true, restarts 0, budgetKills 0, tick 34016, rssMb 385, peak daemon 392, checkpoint t=33097, 2758576 bytes, 9.8 s old
- `kill: daemon pid 27526 killed at t=43073 (checkpoint t=43097); restart count 1 after 4453 ms, new pid 29211, resumed at t=43097 (from checkpoint: true)`
- `restart count 1 (1 from the bench kill, 0 budget kills at the rss cap, 0 other); B: restarts 0, budget kills 0`
- health after: ok true, restarts 1, budgetKills 0, tick 141083, rssMb 390, peak daemon 404, checkpoint t=140097, 3387688 bytes, 12.8 s old
- `rss peak: {"daemonA":404,"serveA":84,"daemonB":402,"serveB":78,"instanceA":488,"instanceB":480}`
- `FIT rows {"fitBudgetKills0":true,"fitSelfRounds3":true,"fitSelfCodeStart1":true,"fitCheckpointAgeMax60":true,"fitHoldUnder1s":false} rows8Met true isTheBar true barMet false`
- Checkpoint bytes max 3889512 (A), 3666880 (B). Budget wrapper: wall 1808.41 s, peak ram 1064.6MB, peak dir 178.3MB.

The verdict: isTheBar true, barMet false. The bench's own reasons: the control restarted 0 times beyond the bench kill, "so this run cannot show the fit is what kept the organism alive", and fit row fitHoldUnder1s false.

Reading it:
- Budget kills: 0 in both arms here, against 21 (control) and 6 (Board 13 bar) on the owner's machine. Here the checkpoint grew only to 4149288 bytes and the ticks to 155173 (the Board 13 kills came at t=293345 to 379900 with checkpoints of 6.5 to 7.9 MB): the organism never reached the size where they came, so the kill row cannot tell the arms apart on this host.
- The row that moved: daemon peak rss, control A 439 and B 454 (B over the cap, daemonPeakRssUnderCap false), bar A 404 and B 402 (all 8 rows true). One 1800 s run per arm, so run-to-run noise at 1800 s is not measured; the spread between the two instances of one run was 15 MB (control) and 2 MB (bar). The in-process control above is the repeated measure.
- fitHoldUnder1s is false in both arms (control 1559.523 ms, bar 1643.415 ms): the logs print rounds holding the tick 913 to 1560 ms (control) and 1034 to 1643 ms (bar) against plans of about 890 ms on this contended host. The hold is the self round (self/daemon.mjs runRound, clone trials), which writes no brain checkpoint: outside this item.
- The bar's split.control text reads "the tree at HEAD (a copy)": a fixed string in bench/cloud.mjs. The control verdict's fitTree, and fit.control.tree in the bar, name what ran: this tree with BRAIN_CHECKPOINT_STREAM=0.

### Tests

- `node --test test/cloud-fit-stream.test.mjs test/cloud-fit.test.mjs test/cloud.test.mjs test/daemon.test.mjs`: tests 28, pass 26, fail 2, duration_ms 117557.659891. The same with BRAIN_CHECKPOINT_STREAM=0: tests 28, pass 26, fail 2, the same two.
- Alone: test/cloud-fit-stream.test.mjs 7/7 (duration_ms 2953.622371), test/cloud-fit.test.mjs 8/8, test/cloud.test.mjs 7/7, test/daemon.test.mjs 5 of 6.
- The two failures, in both arms: test/cloud-fit.test.mjs "two self rounds under a 200 ms hold budget" fails only beside the other files ("two rounds ran: 0"; its log: "tick sampled 534 times over 99026 ms through 0 rounds", so its organism never reached a round inside the test's 100 s wall on the shared CPUs) and passes alone; test/daemon.test.mjs "every step kind runs at least once" reads "ingest ran 0 times" because bench/fixtures/wiki/store is absent from this checkout.
- The touched core, alone: test/checkpoint.test.mjs 8/8, test/compress.test.mjs 7/7, test/core.test.mjs 26/26, test/delta.test.mjs 11/11.

### The host run this is for

.github/workflows/cloud.yml, printed by node from its wallMinutes and tools/cloud-github.mjs PRIVATE_MINUTES: "host run: wallMinutes 55 + about 5 build and upload = 60 min a run; 30 daily runs = 1800 min a month of 2000 free (200 left); organism minutes a day 55 of 1440 = 3.82 percent uptime". The crash-loop rule ends the run when serve has restarted the daemon 5 times; the first host run (Board 16) reached 5 budget kills inside 35 minutes. Whether the streamed write keeps a 55 minute host run under 5 is measured by the next host run (node bench/cloud-host.mjs), not here.

## Open

- The fit bar (isTheBar true) is missed on two conditions outside the streamed write: on this host the control never restarts (0 budget kills in 1800 s), so the bench cannot credit the fit, and fitHoldUnder1s is false in both arms (the self round's hold on a contended 4 CPU host). Next rung: the same 1800 s pair where the control restarts (the owner's machine, where the HEAD control counted 21), and the GitHub Actions host run.
- If the cap is still hit, what else holds memory, named in order of what the probe and the code show: the resume (core/persist.mjs readJSONStreamed reads the whole checkpoint into one Buffer and builds the whole document before Brain.restore), the eager snapshot extras (memory.serialize with one string per episodic key), the self-code dry child (killed at its cap: "BUDGET KILLED ram 44.9MB over 30MB" and "78.3MB over 33MB" in the bar), and the generations worker.
- The incremental deflate drives zlib's own handle (_handle.writeSync and _writeState, internal fields of Node's zlib stream), present on v22.22.2 here; without them the writer deflates each section from one growing buffer (the same bytes, bounded by that section's raw size) and stats.zlib says which ran. Node v24 (the owner's machine) is not measured.
- test/daemon.test.mjs needs bench/fixtures/wiki/store for its ingest assertion; test/cloud-fit.test.mjs's two-round test is wall-bound (100 s) beside other files on shared CPUs. The Board 13 items stand: the self-code dry child dies at its cap within a second, and the cloud.test.mjs file-level flake (1 in 10) is not explained.
