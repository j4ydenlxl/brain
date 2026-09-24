# census: how much of the generated organism runs (MANUAL P8)

His words, 09-23: "make sure the 5 million organism lines u wrote arent empty code, that all of
the code is extremely important". Nobody had measured how much of it runs. This measures it.

## What exists

- `tools/organism-census.mjs --seed <dir> [--ticks K]`: loads an emitted seed, drives it the
  bench/speed.mjs way (one `brain.tick(1)` per event loop turn, nothing injected, kernels
  installed), then runs the hosted algebra and sequence problems inside it (tasks/host.mjs,
  2 ticks each). It counts files, lines, cells that ran and emitted, edges that delivered
  (counted per edge by wrapping `Brain._deliver` on the instance; core is not edited), and
  kinds. Then two knockouts: the file `sha256("census") mod files` picks, and the cells file
  that declares the cells the hosted suites chose. `--all` runs every seed under organism/.
- Dormant mail: a periodic cell with no due tick left before the run's last tick can never read
  its mailbox again, so its mail is counted as delivered and then dropped (`dropPayload`). This
  changes no tally and is what makes gen-0 fit (below).
- The refusal (b): before a whole load the census reads only `manifest.json` and estimates
  resident memory as manifest lines times gen-0's measured bytes per line (default ratio:
  bench/verdicts/census.json, its rss after the full arm). Over half of physical memory it
  prints the reason, says to use `--shard-files`, and exits 2. Nothing is imported first.
- `--shard-files N` (a): reads the seed as text (never imported, so it can be freed), and runs
  it in shards of N cells files, one at a time, under `--cap-mb` (default 8000) resident per
  shard, checked every tick. A cell is tallied by the shard that owns it and an edge by the
  shard that owns its source, each exactly once. Mode exact (the default) loads each shard's
  backward cone: every cell whose signals can reach an owned cell within the horizon (drive
  plus hosted ticks), weighted by 1 + delay, so the owned cells do exactly what they do in the
  whole seed. A shard is refused before loading when its estimate (its lines times a gen-0
  ratio measured at the same horizon, from the newest gen-0 census whose samples cover it, or
  `--ratio-from`) is over the cap, or when it needs every cell. `--cut` loads only the owned
  cells: an approximation, written to a `-cut` partial file, never the bar.
- `node genome/emit.mjs --prune <census.json> --out <dir>` (c): keeps every cell that ran,
  every edge that delivered, every edge in flight at the end (when the census recorded them),
  both endpoints of every kept edge, the cells the hosted problems ran on, and every declaration
  of a file whose knockout lowered a hosted score. It prints lines before and after, reloads
  the copy, verifies it, and checks that no cell that ran and no edge that delivered is missing.
  A census of a pruned seed is compared with the census it was pruned by.
- `test/census.test.mjs`: 17 tests, 1.6 s. New: sharded exact tallies equal the whole census
  array by array on a sparse tiny seed where a shard loads less than the seed; a shard over its
  cap is refused; a planted manifest is refused through the CLI with exit 2 and the
  `--shard-files` advice; prune keeps every ran or delivered or protected declaration under a
  planted liveness that sends delivered edges into cells that never ran. Each of those was
  checked against a mutant (no endpoint keeping, phantom edges untallied, refusal disabled):
  each mutant failed exactly its test, 16 pass 1 fail.

## gen-0 at 200 ticks (bench/verdicts/census.json)

- 29 of 29 files loaded, 485992 of 485992 lines.
- Cells: 37533 of 40000 ran (93.83%), but only 20456 (51.14%) ever emitted. All 2467 that
  never ran are event cells no mail reached. None was budget skipped.
- Edges: 217122 of 440578 delivered (49.28%). Of the 223456 that never delivered, 210641
  leave a cell that never emits, 12814 leave a cell that emits on another port, 1 was in flight.
- Lines: 259662 of 485585 declaration lines declare something that ran or delivered (53.47%).
- Kinds: 47 of 47 ran, 33 emitted. Ran and never emitted once: anomaly.zscore, encode.hv,
  hopfield.assoc, hv.compare, knn.retrieve, memory.assoc, sink.log, stat.correlate,
  state.machine, sym.diff, sym.simplify, sym.verify, timer, verify.numeric. All 1483
  knn.retrieve and 1483 memory.assoc cells ran and never answered.
- Knockouts: seeded (edges-000.mjs) drive runs -101796, deliveries -2304634; tasks
  (cells-000.mjs) runs -3151999, deliveries -25990020. Hosted score moved by 0 in both.

## Memory: it was dormant mail, not the memory kinds

The earlier guess (knn.retrieve, memory.assoc, hopfield.assoc holding hypervectors) was wrong.
8269 periodic cells have no due tick left after their last one, and every item delivered to
them sat in a mailbox forever. Dropping that mail once delivered (census-dormant-partial.json,
200 ticks, no knockout) printed the same tallies to the digit (drive runs 5479058, signals
4030353, delivered 36176281, cells ran 37533, edges delivered 217122, load bearing 53.51%,
algebra 34/36, sequence 0/22) and dropped 9727774 items; peak rss went from 16877.1 MB to
6024.8 MB.

## BAR 1: scale-52000 in shards of 4 cells files at 20 ticks: MISSED, refused

`node --max-old-space-size=6000 --expose-gc tools/organism-census.mjs --seed organism/scale-52000 --shard-files 4 --ticks 20`,
exit 2 in 4 s, bench/verdicts/census-scale-refused-partial.json (isTheBar false):

- Plan: 86 files parsed as text in 3.5 s, 416000 cells, 4656829 edges, rss 328.9 MB.
- Horizon: 20 drive ticks plus 112 hosted ticks (scale hosts fit, gen-0 does not) = ticks 0 to 131.
- Ratio: 9050 bytes per line (gen-0, 4194.6 MB peak up to tick 130, census-h64-partial.json).
- Shard 0 (cells-000 to 003) owns 239976 cells, needs a cone of 410718 of 416000 cells and
  4623958 of 4656829 edges: estimate 43453 MB. Shard 1 owns 176024, cone 406640: 43610 MB.
  Both over the 8000 MB cap. The organism is so connected that an exact shard is the whole seed.
- Before the h64 calibration the same command used census.json's ratio (36423 bytes per line,
  from before the dormant mail drop) and printed 174883 MB and 175516 MB.

The calibration holds on gen-0: the exact sharded census at 20 ticks in 3 shards
(census-gen-0-sharded-check-partial.json) estimated 3508, 3517, 3490 MB and measured peak rss
3544.3, 3793.3, 3815.4 MB, and its cell and edge liveness bitsets, per file lines and kinds are
identical to the whole census at the same ticks (census-h20-partial.json).

The next rung, measured, not the bar: `--shard-files 1 --cut --ticks 20` on scale-52000
(census-scale-cut-partial.json, 1600 KB): 7 shards, peak rss 3026.8, 1758.4, 1196.8, 1250.1,
1314.4, 2146.6, 2179.6 MB, wall 70.8 s; 5126010 lines loaded, 887806 load bearing (17.32%),
4238204 dead declarations, 205246 of 416000 cells ran, 631015 of 4656829 edges delivered,
algebra 25/36, sequence 22/22. In shards of 4, cut was refused too (estimates 22303 and 15869 MB).
Cut is a floor, not an estimate: on gen-0 at 20 ticks
(census-gen-0-sharded-cut-calib-partial.json) cut read 34.82% load bearing against the exact
53.51%, and every cell and edge it counted live was live in the exact run (0 only in cut, 6130
cells and 84712 edges only in exact).

## BAR 2: prune gen-0 by census.json, census it at 200 ticks: MET

`node --max-old-space-size=6000 genome/emit.mjs --prune bench/verdicts/census.json --out organism/gen-0-pruned`:
lines 485784 to 259943 (manifest count, the gate way), 225841 removed; cells 40000 to 37533
(kept 37533 that ran, 0 endpoint only, 0 protected only); edges 440578 to 217122 (kept 217122
that delivered; census.json recorded no in flight set); both knockouts lowered no hosted score,
so they protect nothing more; round trip ok, 0 ran cells and 0 delivered edges missing.

`node --max-old-space-size=6000 tools/organism-census.mjs --seed organism/gen-0-pruned --ticks 200 --min-free-mb 16000 --progress 50`,
218 s, bench/verdicts/census-prune.json (isTheBar true): lines 485992 to 259943; load bearing
share 0.53513 to 1; dead declarations 225923 to 0; algebra 34/36 to 34/36; sequence 0/22 to
0/22; drive runs 5479058, signals 4030353, delivered 36176281 before and after. Its tasks
knockout (the pruned cells-000.mjs, a different set of 19994 cells) moved the hosted score by
-0.083333 (algebra -6), where the unpruned seed's tasks knockout moved it by 0.

## Caveats

- Liveness is measured under this idle drive only. A cell that only wakes on input this drive
  never gives is counted dead, so the pruned seed deletes capability nobody asked for yet.
- organism/gen-0-pruned is where the task put it, so anything that counts organism/ lines now
  counts its 259943 as well. organism/gen-0 is untouched.
- No bench here wrote over 200 MB: the largest verdict is 1600 KB, the pruned seed 15374051
  bytes before its manifest.
- One scratch log (not a verdict) had another builder's bench/imagine.mjs lines interleaved
  into it through a shared file name; every number above is from the verdict files.

## Requests

1. Core or genome owner, for BAR 1: an exact shard of scale-52000 is the whole seed at any
   horizon measured (cone 410718 of 416000 at 132 ticks), and a whole load already sat at
   5839.8 MB at tick 0 (census-scale-52000-stopped-partial.json). Exact under 8000 MB needs
   fewer resident bytes per loaded cell, or a sparser wiring. Until then the cut floor above is
   the measured number for the 5 million lines.
2. Orchestrator: replace organism/gen-0 with the pruned seed only after a census under the
   ladder drive (the public suites injected), not the idle one.
3. Genome: wire each kind's inputs from kinds whose outputs meet its firing condition, then
   re-census; the target is every kind listed above emitting.
