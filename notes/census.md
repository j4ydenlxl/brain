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

## Board 14: Prune on a copy (self/prune.mjs)

Author: board 14 builder. The autopilot's census source proposed prunes of pinned seeds that
were all refused at the patch wall: deleting lines from one file of a seed breaks its manifest
hash, and the only prune that keeps a seed loadable re-emits the whole seed. `self/prune.mjs`
authors that call, on a copy of the tree only:

    pruneSeed({ root, census, seed, control, include, gateCmd, carry, work })
      -> { seed, linesBefore, linesAfter, deadShareBefore, deadShareAfter, gate, ms, patch,
           prunedDir, prunedOnReal, load, after, carried, tests, cleanup, real, decision }

1. It decodes the census bitsets the way `self/autopilot.mjs` decodeBits does (bit i at byte
   i>>3, position i&7). It refuses a popcount that is not the recorded count, a byte length
   that is not ceil(n/8), a census taken on another content hash, and a seed with no census.
2. It copies the tree without state/, .git/, bench/fixtures/ (except the paths the gate's own
   tests name, from gateIncludes), web/dist/, and every seed but the one being pruned.
3. `genome/emit.mjs` pruneOnCopy runs the copy's own emitter into organism/<seed>-pruned.
4. It re-points the seed's index.mjs and manifest.json. Those two files are the whole patch,
   checked to apply back byte for byte.
5. It loads and verifies the seed in a child process.
6. It reads the dead share after from a census of the pruned content hash, and carries that
   census to the re-pointed seed on the copy only.
7. It runs the seed's own tests and `node bench/gate.mjs --quiet`.
8. It deletes the copy, organism/ first, and hashes the real tree's seed, census, pruned
   directory and organism/ listing before and after.

`--control` runs the same copy with no prune.

### The bar, run 1 (bench/verdicts/prune.json): NOT MET

The run was `node tools/budget.mjs --ram-mb 6000 --disk-mb 2048 --dir <work> -- node
--max-old-space-size=6000 bench/prune.mjs --work <work>`, with 846.6 s wall and a peak RSS of
2120.5 MB for the whole tree. The chosen seed was organism/gen-0 (485784 lines) with
bench/verdicts/census.json. The 20 smaller gen-* seeds have only bitless rows in
census-all.json, and organism/gen-0-pruned's census marks nothing dead.

- Lines went from 485784 to 259770 (manifest counts.lines). Cells went from 40000 to 37533,
  and edges from 440578 to 217122.
- The dead share was 0.46487 before (census.json: 260069 of 485992 loaded lines were load
  bearing) and 0 after (census-prune.json: 259943 of 259943, the same dynamic 200-tick ruler).
  The noise is a spread of 0 over 3 censuses of the content before and 2 of the content after.
  The ruler band over 8 censuses of every mode and tick count is 0.46487 to 0.651799.
- The re-pointed gen-0 loaded and verified as the pruned content: 37533 cells, 217122 edges,
  hash e83bb4c5e620. That is the hash of Board 12's organism/gen-0-pruned in the real tree, so
  the 444-line patch alone is the whole change there.
- The own tests passed: census 17/17, gate-rows 5/5, ladder 20/20 and prune 7/7.
- The gate on the copy was RED: 79/87 test files and 1093 pass / 25 fail assertions.
  LOAD-BEARING was GREEN, reading "gen-0 0.00% (census-gen-0-repointed-partial.json)".
- CONTROL: the same copy with nothing pruned was also RED, with the same 8 files (cli, daemon,
  findings, perception, prompt-regions, public-regions, public, venue-suite) and the same
  1093/25. The copy caused the RED, not the prune.
- The real tree was unchanged (516ea09de9eb before and after), the work dir was deleted, and
  1041410 MB were left.

Tests: `node --test test/prune.test.mjs` passes 7/7 in 3.6 s on a planted seed under a temp
directory. Four mutants of self/prune.mjs each turned one test red: no popcount check (d), no
path re-rooting (a), a copy root not named brain (a), and no out-of-tree copy (f).

Run 1's record is kept as bench/verdicts/prune-run1-partial.json. Its numbers are as measured,
and isTheBar was set to false when run 2 replaced it.

### Why the copy was red, and the fix (all in self/prune.mjs)

The 8 red files were run alone on a copy made the same way (a diagnosis under
tools/budget.mjs). They showed three defects of the copy and none of the prune:

- gateIncludes read only test files. The fixtures are read through the modules the tests call:
  bench/public.mjs reads bench/fixtures/public, bench/perception.mjs reads perception-urls.json,
  act/prompt.mjs reads the knowledge store the daemon's ingest step opens, and tools/findings.mjs
  reads web/dist. It now reads all 393 authored source files for bench/fixtures and web/dist
  paths. It keeps each path of at most 512 MB, which gives 9 paths and 376.386 MB. It leaves
  out bench/fixtures and bench/fixtures/wiki (the 368 MB dump) as too big.
- test/cli.test.mjs reads module URLs relative to "/brain/", so the copy's root is now
  <box>/brain.
- tasks/venue.mjs replays the frozen trader tape from ../../trader/data/trader.db. Without it,
  the venue suite fell back to synthetic windows and printed a hosting score of 0.125 against
  the published 0.0625. gateIncludes now lists out-of-tree paths named by '..' segments, and
  copyTree COPIES them (225.613 MB) into the trial's own box. It never links them, and it
  refuses a box that is the real tree's parent.

At a short path, the 8 files still failed the same way, so path length was not the cause.
After the fix, all 8 passed on a diagnosis copy.

### The bar, run 2 (bench/verdicts/prune.json): MET

The command was the same as run 1, with 1041.5 s wall and a peak RSS of 2119.2 MB for the whole
tree. The copy was 466.2 MB, with trader.db beside it.

- Lines, cells, edges, the dead share (0.46487 to 0 on the same ruler, spread 0), the load
  (37533 cells, 217122 edges, hash e83bb4c5e620) and the 444-line patch were all as in run 1.
- The own tests passed, now including test/operators.test.mjs (11/11).
- The gate on the copy with gen-0 re-pointed was GREEN: 88/88 test files, 1129 pass / 0 fail,
  and LOAD-BEARING GREEN.
- CONTROL, the same copy with nothing pruned: GREEN, 88/88 and 1129 / 0.
- The real tree was unchanged (516ea09de9eb before and after), the work dir was deleted, and
  1041363 MB were left.

Next rungs:
1. The autopilot's census source calls pruneSeed, not a patch that deletes lines.
2. A census with liveness bits for the small gen-* seeds, which only have bitless rows today.
3. Apply the 444-line patch to the real tree, where organism/gen-0-pruned already sits at the
   same hash. That decision is the orchestrator's (request 2 above: census under the ladder
   drive first).

## Board 23, dead-share: wire before prune on organism/gen-1-4-4-1-4

The gap was dead:organism/gen-1-4-4-1-4. bench/verdicts/census-all.json measured its dead share at
0.71436 (1 - loadBearing/loaded) against a bar of 0.

The emitter: organism/gen-1-4-4-1-4 was written by generations/epochs.mjs emitElite, which calls
buildFromOrganismGenome and then genome/emit.mjs emitOrganism. The rule that changed it lives in
genome/emit.mjs:

- wireBrain and wireMain (`--wire <census>`): a silent cell gets one edge per unreached in port.
  A silent cell is one with no out edge that delivered. It qualifies only if it is not hosted and
  can read mail inside the census horizon. Each new edge comes from a port that delivered, obeys
  the subset rule and the monomorphic claim of genome/wire.mjs, and copies the donor edge's
  weight, delay and confidence. It picks the nearest donor: same circuit, then same region, then
  any.
- pruneBrain and pruneMain (`--prune <census>`): unchanged in rule.
- Both refuse a census taken on another manifest hash before importing anything.
- Both land in place through a staging sibling at the same depth.
- A zero-wire round in place leaves the seed as it is.
- Every wire round is kept under genome.wired.rounds.

No file of the seed was edited by hand.

### Measured

Each census ran at 200 ticks, through tools/budget.mjs --ram-mb 4000, and wrote
bench/verdicts/census-gen-1-4-4-1-4-dead-share-rN-partial.json.

- **r0, the seed as emitted.** 1929 lines loaded. Of 1832 declarations, 454 ran or delivered and
  1378 were dead; 551 of 1929 lines were load bearing (28.56%). Cells: 226 of 255 ran and 30
  fired. Edges: 170 of 1519 delivered. Kinds: 13 emitted. Hosted score 0.083334 (algebra 6/36,
  sequence 0/22).
- **Wire 1, by r0.** 225 cells were silent: 2 hosted, 133 on a clock with no run after tick 0
  inside horizon tick 315, and 90 that can read mail. Their 109 unreached in ports got 72 edges
  from 35 donor ports; 37 had no legal donor. 58 cells were wired (22 had never ran). Edges went
  1519 -> 1591. 2019 lines on the census ruler, hash 8124a68016dd223b.
- **r1.** 807 of 1904 declarations live and 1097 dead. Cells: 248 ran, 77 fired. Edges: 501 of
  1591 delivered. Hosted score 0.083334.
- **Wire 2, by r1.** 182 silent: 133 on a clock, 47 can read mail. 35 unreached ports got 30
  edges from 94 donor ports; 5 had no legal donor. 26 cells were wired (6 had never ran). Edges
  went 1591 -> 1621. 2049 lines on the census ruler, hash 44b0cb8c317dc4f4.
- **r2.** 1013 of 1934 declarations live and 921 dead. Cells: 254 ran, 103 fired. Edges: 701 of
  1621 delivered. Hosted score 0.083334.
- **Wire 3, by r2: the fixed point.** 156 silent, 21 can read mail. Of 5 unreached ports, 0 were
  wired and 5 had no legal donor. That run rewrote the manifest with its zero record before the
  in-place no-op rule existed. So the landed manifest's genome.wired shows only this round; wires
  1 and 2 are in the r0 and r1 verdicts and here.
- **Prune by r2, in place.** Lines, one ruler per statement: 1965 -> 1044 on the manifest count
  (every emitted file but manifest.json), and 2049 -> 1175 on the census ruler (every file,
  manifest.json included), where the prune comparison printed -874. The first print, "1965 -> 1175,
  790 removed", set a manifest count before against a census ruler after (see the fix pass). Cells
  255 -> 254: the 254 that ran were kept and 1 was dropped. Edges 1621 -> 701: the 701 that delivered
  were kept and 920 were dropped. The 3 hosted cells were protected. Round trip OK, hash
  dc84e3d733a8732f.
- **r3, the landed seed.** Of 1013 declarations, 1013 ran or delivered and 0 are dead. Load
  bearing 1175 of 1175 (100.00%). Cells: 254 of 254 ran, 103 fired (40.55%). Edges: 701 of 701
  delivered. Kinds: 30 emitted. Hosted score 0.083334. The drive did the same work as r2 (runs
  21239, signals 19019, delivered 101113). The prune comparison printed "bar MET".
- **The bar command**, `tools/organism-census.mjs --all --ticks 200 --max-cells 1000` through
  budget.mjs, wrote bench/verdicts/census-all.json. Its gen-1-4-4-1-4 row: "lines 1175 loaded of
  1175 present; declarations 1013, of which ran or delivered 1013 (100.00%), dead 0". The gate's
  census pick (bench/gate.mjs censusFor) reads census-all.json at 1175 and 1175, a dead share of 0.

### The control: the prune alone

The control was the prune alone, from the r0 census, on a scratch copy of the same seed. On the
census ruler, lines went 1929 -> 592 (r0 loaded 1929 of 1929; the control's census loaded 592). The
first print, "1863 -> 592", set the seed's manifest count against the copy's census ruler. Cells
went 255 -> 226 and edges 1519 -> 170. Its census: 592 lines loaded, 454
declarations live, 0 dead, 30 fired, 13 kinds emitted, 15936 delivered in the drive. The hosted
score was the same.

Both routes reach a dead share of 0. They differ in what they keep:

| Measure | Wire, then prune | Prune alone |
|---|---|---|
| Live declarations | 1013 | 454 |
| Cells that fired | 103 | 30 |
| Kinds emitted | 30 | 13 |
| Delivered in the drive | 101113 | 15936 |

### Tests

- test/census.test.mjs printed "tests 53, suites 10, pass 53, fail 0" after fix pass 2 (35 of 35
  before it). The build pass added 10 cases in describe('wire'); the fix pass added 4 more there and
  4 in describe('line rulers'). The build pass's 10 cover:
  - legality, donor and claim;
  - the wired census;
  - wire then prune against the prune-alone control;
  - protect;
  - the clock horizon;
  - wire and prune in place;
  - the stale import-cache refusals;
  - rounds to a fixed point.
- The fix pass's 8 cover: an oracle of the whole wire list (nearest donor, not lowest index); a
  wired edge copying planted weight, delay and confidence; a planted edge that is already declared
  and must not be declared twice; each ruler of --wire and --prune on its own line; a prune that
  drops a declaration against one that drops nothing; the census ruler read before an in-place
  landing; the unread count.
- Fix pass 2 added 15 cases in describe('dead-share fix pass') and 3 in describe('dead-share bar').
  - The landing: the order of its renames; a transient EPERM then EBUSY, waited out 20 and 40 ms; a
    refusal every time, 12 tries, the seed as it was; ENOENT not retried; a seed that cannot be put
    back, named; debris cleared. Also the retry codes.
  - A prune of a pruned seed keeps both rounds.
  - The wire history: rebuilt against the round the wire recorded, and what the prune kept against
    an oracle of the pruned seed's edges. It refuses a non-chain, merges once, and claims what was
    kept only from the prune of that census of that seed.
  - The chain: its child wire agrees with the in-process one; every round is in the manifest; run
    again it changes nothing; two copies land one hash.
  - Lost history given to the chain, and to one wire in place, is written back once, the hash
    unchanged.
  - The bar's pre-registered held-out judgement (judgeHeldOut).
- `node test/dead-share.mutants.mjs`, run through budget.mjs, printed: "mutants of the dead-share
  rules (genome/emit.mjs wire, census seed load, line rulers, unread count, landing in place, rename
  retry, prune record, wire history, chain): 43/43 fail at least one case of test/census.test.mjs;
  survived 0, never ran 0". Its two controls, the suite as it is and an unmutated copy through the
  same load hook (loaded true), each printed pass 53 of 53. The run before the in-process wire
  case was added printed 42/43: "history added at the fixed point is not written" survived,
  because the chain runs that wire as a child the hook does not reach. The fix pass's 23/23 (pass
  35 of 35) and the build pass's "12 mutants" are superseded.
- test/census-static.test.mjs printed "tests 12, pass 12, fail 0".
- On the tiny test seed, wiring moved the hosted score from 0.42298 to 0.916667. That is not
  explained, so no test asserts its direction.

### Fix pass: the verify plane

- **Two rulers, fixed at the source (genome/emit.mjs).** emitOrganism writes manifest.json before
  it adds that file's own lines to counts.lines, so the manifest count leaves manifest.json out,
  while the census, the gate and emitOrganism's return count every file. pruneMain and wireMain now
  print each ruler on its own line (censusLinesOf, manifestLinesOf), and read the seed's census
  ruler before an in-place landing replaces the directory. The prune of a scratch copy of the
  landed seed, by that seed's own census, printed "lines 1044 -> 1044 (manifest count: every
  emitted file but manifest.json): 0 removed, 0.00% of the seed" and "lines 1175 -> 1175 (census
  ruler: every file, manifest.json included): 0 removed", then "ROUND TRIP OK".
- **Unread mail, measured and not changed.** The prune now prints the kept edges whose destination
  has no run after tick 0 inside the census horizon. On the landed seed: "unread 307 of 701 kept
  edges deliver into 106 cells with no run after tick 0 inside horizon tick 315 (142 kept cells are
  on such a clock)". The census counts those 307 as delivered, so its dead share of 0 includes
  them. Its own memory line says the mail is dropped: "142 periodic cells have no due tick left
  after their last one up to tick 315; 60729 items delivered to them were counted, then dropped".
  The delivered rule lives in tools/organism-census.mjs, outside this item's files. Removing the
  edges would change what the organism does after tick 315, so they stay; retiming those cells, or
  a longer horizon, is the next rung.
- **The landed seed, censused after the fix.** `tools/organism-census.mjs --seed
  organism/gen-1-4-4-1-4 --ticks 200 --no-knockout --tag dead-share-fix` through budget.mjs wrote
  bench/verdicts/census-gen-1-4-4-1-4-dead-share-fix-partial.json: "lines 1175 loaded of 1175
  present; declarations 1013, of which ran or delivered 1013 (100.00%), dead 0". Against r2 it
  printed "lines 2049 -> 1175 (-874)" and "bar MET".
- **The bar command, re-run.** `tools/organism-census.mjs --all --ticks 200 --max-cells 1000`
  wrote bench/verdicts/census-all.json with the same gen-1-4-4-1-4 row. That file carries isTheBar
  false with no barMet and no split: --all writes a survey, and its summary printed "Not the bar:
  the bar is organism/gen-0 at 200 ticks and organism/scale-52000 at 20." Its writer is
  tools/organism-census.mjs, outside this item's files, so the fields stay missing here.

### Fix pass 2: the seven verify findings

The emitter that writes organism/gen-1-4-4-1-4 now, and the only thing that did: genome/emit.mjs
`--dead-share organism/<seed>` (deadShareChain). It runs a census, wires in place to the fixed point
(a round whose hash does not change), prunes by the last census when there is something to drop,
and runs a last census. Each step is a child process, and each census is checked against the
seed's manifest hash. Its rule for the prune is the one above: keep what delivered, what was in
flight at the end, and what is hosted.

- **The bar (finding 1).** tools/organism-census.mjs --all writes census-all.json with isTheBar
  false, and it is not this item's file. The new test/dead-share-bar.mjs runs that command unchanged
  and writes bench/verdicts/dead-share.json with isTheBar true, a top-level barMet, a split, the
  control and a statement. Run through budget.mjs, it printed:
  - "organism/gen-1-4-4-1-4: dead share 0 (1299 of 1299 lines load bearing); cells 254 of 254 ran,
    edges 701 of 701 delivered; the row is the seed on disk true (manifest 254 cells, 701 edges,
    census ruler 1299 lines)"
  - "CONTROL before: ... dead share 0.71436 (551 of 1929), the ledger 0.71436: true"
  - "HELD OUT 18 seeds: safe 18, lowered 18, under the cap 0.1 18, at 0 6, deterministic 18; dead
    share before 0.37945 to 0.648221, after 0 to 0.007389"
  - "BAR MET: dev true, provenance true, clone true, held out safe 18/18"

  The criteria were fixed in the file before the held-out run. Held out means the 18 other seeds
  the bar censused, chained on two scratch copies each. No chain ran on them while the rule was
  built. organism/gen-0-2-3-1-3 had a chain trial and is reported as contaminated. Its line read
  "0.625411 -> 0.001546 ... safe".
- **The line count grew by the provenance.** The census ruler counts manifest.json as structure.
  The rebuilt rounds added lines to the landed seed: the trial census (`--tag gaps`,
  census-gen-1-4-4-1-4-gaps-partial.json) printed "lines 2049 -> 1299 (-750)", where the fix census
  had printed 1175. The dead share is 0 on both.
- **The report (finding 2).** The current tallies are in Tests below.
- **The flake (finding 3).** The failure did not reproduce. Thirty back-to-back runs of
  test/census.test.mjs, then 35 tests, each printed "pass 35 fail 0". The likely cause is finding
  4's window, a Windows rename refused while a file of the directory is still open. The tests now
  assert that condition directly with planted refusals, not by re-running.
- **The land (finding 4).** emitTarget no longer removes the seed before the staging is in its
  place:
  - the seed is renamed aside to .<name>.emit-replaced;
  - the staging is renamed into its place;
  - the old seed is removed last.

  A rename refused with EPERM, EACCES or EBUSY is retried (retrying: 12 tries, waits 20 ms doubling
  to 1000 ms). This is what graceful-fs does on win32. When the second rename fails for good, the
  seed is put back. When even that fails, the error names where the seed lies intact. Debris from a
  run that died half way is cleared first.
- **Provenance (finding 5).** A pruned seed's record keeps every prune under genome.pruned.rounds.
  `--wire-history a,b,c` rebuilds lost wire rounds from the census verdicts taken between them
  (wireHistory, mergeWireHistory). Each rebuilt round carries:
  - the hash link, the edges wired, and how many of them the prune's census saw delivered;
  - "reconstructed", with the counts only the wire run printed listed as notRecovered.

  The landing command was `genome/emit.mjs --dead-share organism/gen-1-4-4-1-4 --tag
  dead-share-land --wire-history <r0>,<r1>,<r2>` through budget.mjs. It printed "dead share 0 -> 0,
  lines 1175 -> 1175, hosted score 0.083334 -> 0.083334, wire rounds 0 to the fixed point: OK" and
  left hash dc84e3d733a8732f. The bar's provenance line read: "f3c731c4->8124a680 wired 72 (kept 72
  delivered, 0 in flight only) rebuilt; 8124a680->44b0cb8c wired 30 (kept 30 delivered, 0 in flight
  only) rebuilt; 44b0cb8c wired 0; dc84e3d7 wired 0; pruned from 44b0cb8c by
  bench/verdicts/census-gen-1-4-4-1-4-dead-share-r2-partial.json: true".
- **The clone (finding 6), partly.** A copy made by loading the seed and emitting it again has the
  same hash. The chain over the copy changes nothing: "chain rounds 0, prune skipped true, dead share
  0 -> 0: true". What stays open is outside this item's files:
  - generations/epochs.mjs emitElite never runs the chain;
  - .gitignore keeps organism/* off the repository.

  So an epochs run that emits gen-1-4-4-1-4 again writes the 0.71436 seed until genome/emit.mjs
  --dead-share runs after it.
- **Dead 0 at a horizon (finding 7).** This was measured, and no stricter prune was made. The bar's
  own knockout of edges-000.mjs, every edge of the seed, printed "edges delivered -701, drive
  delivered -101113, drive runs -8297, cells ran -47, hosted score 0". The edges carry drive work,
  not the hosted score. The long horizon printed:
  - at 200 ticks (last tick 315): "cells with no run after tick 0 142, edges into them 307 (reaching
    106 of them); period 1000 cells 44: runs 44, fired 4, edges into them 99; mail dropped 60729";
  - at 1200 ticks (last tick 1315): "cells with no run after tick 0 98, edges into them 208
    (reaching 74 of them); period 1000 cells 44: runs 88, fired 25, edges into them 99; mail dropped
    253167".

  The cells on the 1000 tick clock run again at tick 1000, and 25 of them fire by tick 1200. A
  prune at the 315 tick horizon would cut edges into them, so the prune keeps them. The 208 edges
  into cells on the 60000 and 3600000 tick clocks are not read by any run up to tick 1315. That is
  unmeasured further out.

### What was read

- Hu et al. 2016, Network Trimming (APoZ activation census pruning), arXiv 1607.03250.
- Mocanu et al. 2018, SET (prune and regrow).
- graceful-fs (npm's fs wrapper), its rename on win32: it retries EPERM, EACCES and EBUSY with a
  growing backoff (fix pass 2, the land).
- docs/boards/board-17.js: the same item. Nothing had landed.
- The tools/organism-census.mjs header and pruneComparison.
- The genome/wire.mjs claim rule.
- self/gaps.mjs deadShareGaps and bench/gate.mjs censusFor.

### Caveats

- The drive is idle only.
- 133 cells run on periods of 1000, 60000 and 3600000. They run once at tick 0, so they count as
  ran, but inside 200 ticks they never fire. Retiming them, or a longer horizon, is the next rung.
  In the landed seed, 307 of 701 kept edges deliver into 106 such cells (the fix pass).
- The wiring made more of the organism run. It did not answer better: the hosted score stayed
  0.083334.
- organism/* is gitignored. A gen-1-4-4-1-4 emitted again by generations/epochs.mjs emitElite would
  come out unwired and unpruned until genome/emit.mjs --dead-share runs after it (fix pass 2).
- The chain's children run without NODE_OPTIONS, so a mutant loaded through the mutants file's
  hook reaches only the code the suite runs in its own process. The wire at the fixed point is
  tested in process as well for that reason.
