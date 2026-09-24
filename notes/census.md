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

## Board 12, BAR 1: the static census of scale-52000: MET

`node tools/budget.mjs --ram-mb 6000 --disk-mb 100 --dir bench/verdicts -- node --max-old-space-size=6000 tools/organism-census.mjs --static --seed organism/scale-52000`,
exit 0, bench/verdicts/census-scale-static.json (isTheBar true, 838 KB):

- Walked 88 of 88 files line by line (5126010 physical lines, 5125448 by the manifest count), never
  loaded. Streamed content hash a5dd71bb96767e51 equals the manifest's: the lines walked are the
  organism the loader builds. 0 illegal edges of 4656829.
- Static rule: a cell is live when a path of edges reaches it from a periodic cell (141319, due at
  tick 0) or a hosted problem cell (7 more); an edge when its source is live; a region or circuit
  when it holds a live cell. 6 closure passes over a 55881948 byte edge file in the OS temp dir.
- Cells 411858 of 416000 reachable (99.00%); 4142 dead (4125 with no edge in, 17 fed only by dead
  cells). Edges 4632748 of 4656829 live (99.48%). Regions 7 of 7, circuits 52000 of 52000.
- Load bearing = live 5096613 + structure 1174 = 5097787 of 5126010 lines = 99.45% (5097225 of
  5125448 by the manifest count); 28223 dead declarations.
- 9.8 s wall, peak working set 441.6 MB (the budget wrapper saw 425.5 MB).
- The rule is an UPPER BOUND. Control on gen-0: the static census of organism/gen-0 against the
  200 tick dynamic census.json finds 0 cells that ran and 0 edges that delivered which the static
  rule calls dead, but 1580 statically live cells never ran and 219037 statically live edges never
  delivered. Static reach is not the 17.32% cut floor; the sampled census below measures the gap.

## Board 12: the sampled census of scale-52000 (beside the bar, isTheBar false)

`node tools/budget.mjs --ram-mb 6000 --disk-mb 100 --dir bench/verdicts -- node --max-old-space-size=6000 tools/organism-census.mjs --sample 0.02 --seed organism/scale-52000 --batch-cells 200000 --cap-mb 5000`,
exit 0, bench/verdicts/census-scale-sampled-partial.json (the sampled census is never the bar, so
it is always a -partial file):

- Drew 8320 of 416000 cells (seeded partial Fisher-Yates, seed "census"). Each one ran exactly on
  its backward cone at 16 ticks (0 to 15), reduced to the cells u with f(u) + b(u) <= 15. Cones:
  median 3250, p90 13812, max 53959 cells. The run took 62 batches of at most 200000 cells,
  12248654 cells loaded in all, with tasks off.
- ran 6456 of 8320 = 77.60% (Wilson 95% 76.69% to 78.48%). fired 2646 of 8320 = 31.80% (30.81% to
  32.81%). Out-edges delivered: 19388 of 93251 = 20.79% (cluster ratio 20.04% to 21.54%).
- Side by side on the same cells: static reachable 99.03%, static within 16 ticks 97.80%, ran
  77.60%, fired 31.80%. Whole seed, static: 411858/416000 = 99.00% reachable.
- Lines: the static load-bearing share is 99.45%; the dynamic estimate at 16 ticks is 26.22% (95%
  25.47% to 26.98%). In the dynamic estimate, the regions and circuits are counted by the static
  rule.
- Check: 0 cells ran outside the static bound. 1681 cells were reachable within 16 ticks and did
  not run.
- Exact: every one of the 62 batches grew 0 edges, so every sampled cell did what it does in the
  whole organism over ticks 0 to 15. Caveat: an edge the WHOLE organism would grow from a cell
  outside a cone is not seen. Growth needs a pair to co-fire 8 times in the 64-tick window, and
  the horizon here is 16 ticks.
- Timing run first: `--max-batches 1` at 80000 cells took 4.7 s and 1090.1 MB for its batch. That
  file is bench/verdicts/census-scale-sampled-timing-partial.json.
- Wall time 789.1 s. The peak rss per batch was up to 3685.1 MB; the budget wrapper saw 3654.4 MB.
- What it means for "5 million lines aren't empty code": by the static rule 99.45% of the lines
  are wired to a source. Over 16 ticks, about 26% of them actually carry something. The gap
  between the two is the headroom the census cannot close without a longer exact run, and the
  exact run cannot fit in 8000 MB.

## Board 12, BAR 2: prune scale-52000 by the static census, census the copy: MET

The prune, `node tools/budget.mjs --ram-mb 6000 --disk-mb 400 --dir organism/scale-52000-pruned -- node --max-old-space-size=6000 genome/emit.mjs --prune bench/verdicts/census-scale-static.json --out organism/scale-52000-pruned`,
exit 0 in 11.9 s. The budget wrapper saw a peak of 445.6 MB:

- It is streamed line by line and never loaded. It uses the same rule that pruned gen-0: keep the
  live cells, the live edges, the endpoints of kept edges, the protected (hosted) cells, and the
  regions and circuits that hold a kept cell. Lines are copied verbatim and re-chunked like
  emitOrganism, and the hash is computed while streaming.
- Lines went from 5125448 to 5097225 by the manifest count, with 28223 removed (0.55%). Cells went
  from 416000 to 411858 (4142 dropped), and edges from 4656829 to 4632748 (24081 dropped). No
  regions or circuits were dropped. The split is 60000 lines per file.
- The prune WRITES OVER 200 MB: 277097516 bytes on disk in 88 files (277080596 before the
  manifest; the prune printed the source at 278790402). The budget wrapper saw the directory peak at 264.3 MB. It rotates:
  pruneStatic removes organism/scale-52000-pruned before it writes, so only one copy ever exists.
  The content hash is bc3b5bf1e6c30aa6.

The exact sharded census on the pruned seed was tried first,
`node --max-old-space-size=6000 --expose-gc tools/organism-census.mjs --seed organism/scale-52000-pruned --shard-files 4 --ticks 20`
(through the wrapper). It exited 2 and was REFUSED before loading anything. Shard 0's cone is 406576
cells, estimated at 43210 MB; shard 1's cone is 404611 cells, estimated at 43385 MB. Both are over
the 8000 MB cap. The refusal is in bench/verdicts/census-scale-52000-pruned-sharded-refused-partial.json.

So the static census walked it instead:
`node tools/budget.mjs --ram-mb 6000 --disk-mb 100 --dir bench/verdicts -- node --max-old-space-size=6000 tools/organism-census.mjs --static --seed organism/scale-52000-pruned`.
It exited 0 and wrote bench/verdicts/census-scale-pruned.json (isTheBar true):

- 88 of 88 files were walked. The streamed hash bc3b5bf1e6c30aa6 equals the manifest hash, and 0 of
  4632748 edges are illegal.
- The pruned seed is 5097823 physical lines, or 5097225 by the manifest count. Declarations:
  5096613, of which 5096613 are live and 0 are dead. The dead share is 0/5096613 = 0, down from
  28223/5124836 = 0.005507.
- Load bearing by the static rule: 5097823 of 5097823 lines = 100.00%.
- Checks against census-scale-static.json: fewerLines, keptEveryLiveCell, keptEveryLiveEdge,
  noDeadDeclarationLeft and loadBearingShareRose are all true.
- 11.2 s, with a peak working set of 449.9 MB.
- The same caveat applies as for bar 1: 100% is the static UPPER bound. The sampled census above
  puts the lines that carry something within 16 ticks at about 26%.

## Board 12: tests

`node --test test/census-static.test.mjs` passes 12 of 12 in under 1 s:

- the toy static closure: 30 cells, of which exactly the 6 built dead are dead, with 19 passes;
- the Wilson and cluster intervals;
- the seeded draw;
- the sampled census at fraction 1 against the whole run, cell by cell and edge by edge, in 7
  batches. It uses the sparse seed at 8 ticks, where nothing grows; the grown tiny seed grows edges
  inside batches, so it is not an exact reference;
- the reduced cone against the full cone;
- the streaming prune against pruneBrain plus emitOrganism, byte for byte, on the toy (it drops
  exactly the static dead set) and on the tiny seed with its hosted cells;
- `node genome/emit.mjs --prune` as its own process.

That last test exists because the CLI first ran before the streaming section's templates were
initialised (ReferenceError: Cannot access 'regionsHeadOf' before initialization), and a call from
a test could not see it. The fix moves the command line to the end of emit.mjs. On a mutant that
puts the command line back in its old place, the test fails 1 of 1.

test/census.test.mjs (17) and test/genome.test.mjs (36) still pass: 65 of 65 across the three files.
