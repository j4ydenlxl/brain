# Contamination row (queue item 10, B2)

board 19 builder, 2026-09-26, the $250 cloud session (Linux, 4 CPUs, 16 GB, Node v22.22.2, no Ollama).

## The bar

`node bench/gate.mjs --contamination` (the row-only form; it writes no file) and
`node tools/contamination-row.mjs`, which applies the gate's own `contaminationRecords`,
`contaminationRow` and `refereeOf` (imported from bench/gate.mjs, never copied) to bench/verdicts at
HEAD (read-only `git archive`) and in the working tree, prints both lines and writes
bench/verdicts/contamination.json (isTheBar true, barMet true only when the row has no cause).

Row printed before any change, this session:
`CONTAMINATION RED: bar files (isTheBar true) 55 of 189 verdict files, with a split object 26, ... with no split 25, split not an object 4`.
Printed after, by `node bench/gate.mjs --contamination` (exit 1, the row rules):
`CONTAMINATION RED: bar files (isTheBar true) 56 of 194 verdict files, with a split object 37, contaminated and labelled 1 (brief.json), contaminated and unlabelled 0, with no split 18, split not an object 1`.
`node tools/contamination-row.mjs` printed `bar files without a split object: 29 before, 19 after` and wrote
bench/verdicts/contamination.json (isTheBar true, barMet false). The 19: autopilot-board10, boundary,
census-prune, census-scale-pruned, census-scale-static, census, code, compress-board10, compress,
daemon, knowledge, math, native, public-launch, recall, senses, synth, web-ladder (no split) and grid
(string "training"). 17 of them already have their writer changed and wait on what the table names; 2
(autopilot-board10, compress-board10) have no writer at HEAD, and public-launch is board 18's.

## The split rule used

Every writer now builds its split with a pure `export function splitFor(opts)`:
`{ development: { what, ... }, heldOut: { what, ... }, contaminated }`. A bench with a real held-out
set says `contaminated: false`; a bench with none, or one whose held-out set was seen, says the
reason in one sentence as a string (the brief's form). The gate counts `contaminated` only when it
is `true`, so a reason string is counted as a split object and not in the row's contaminated tally;
contamination.json's statement says so. The ARC split's name moved from `split` to `arcSplit` in
grid.mjs and imagine.mjs.

Three benches waited for 16 GB free RAM, which a 16 GB host never has: bench/budget.mjs,
bench/daemon.mjs and bench/years.mjs take `--wait-free-gb N` (default 16, not a narrowing flag,
nothing measured changes); the cloud runs passed 4.

## The 29

Writer file, split written, re-run, and the bar figure before (the verdict at HEAD) and after (the
re-run's own verdict, its printed line in the session transcript). Run-to-run noise: the only bench
here that prints its own noise band is grid-library (two no-library arms: noise 0 before, 2 after).

| verdict | writer | split | re-run here | bar before -> after |
|---|---|---|---|---|
| budget | bench/budget.mjs | yes | yes, `--wait-free-gb 4` | MET -> MET; ram kill bound 2282.711 -> 2013.836 ms, disk 2293.391 -> 2004.906 ms (bar 5000) |
| velocity | bench/velocity.mjs | yes | yes | MET -> MET; ratio 125991x -> 156748x, 0 mismatches, audit 0 |
| velocity-heldout | bench/velocity.mjs | yes (contaminated false: seenInSearched 0) | yes | MET -> MET; fresh K=4 137/160 against K=1 109/160, both runs |
| multiply | bench/multiply.mjs | yes (contaminated false) | yes | MET -> MISSED: single 134 / population 136 -> single 136 / population 133; i0 came back both times; no noise band printed by this bench |
| spawn | bench/spawn.mjs | yes | yes | GREEN -> GREEN; run 1 spawned 30, run 2 spawned 0, both runs |
| dream | bench/dream.mjs | yes | yes (no model) | MET -> MET; ticks per second 25.785 dreaming -> 7.84 on this host |
| years | bench/years.mjs | yes (the bar seeds were seen: reason) | yes, `--wait-free-gb 4` | MET -> MET; grid 49 -> 148 both, 140.538 -> 196.823 per million organism-years (704435 -> 502991 organism-years); synthetic 89 -> 256 both |
| grid-evaluation | bench/grid.mjs | yes (contaminated false) | yes, ARC fetched | 71/400 -> 70/400 solved (timed out 321 -> 323); no barMet in this file |
| grid-library | bench/grid.mjs | yes (contaminated false) | yes, `--min-free-mb 4000` | MET -> MISSED: library 73 vs no library 71, 71 (noise 0) -> library 68 vs 69, 71 (noise 2), margin -3 |
| imagine | bench/imagine.mjs | yes (training: reason) | yes, ARC fetched; the knowledge store is absent here (284749 articles at HEAD), which the invented-word filter reads when present | invented 6 / null 3 of 236 (sign test p 0.25) -> invented 5 / null 5 of 236 (p 1); no barMet in this file |
| grid | bench/grid.mjs | yes | NO: capability/grid-library.mjs:97 refuses a corpus verdict whose `split` is not the string training, and grid.json is the grid-library bar's corpus, so a re-run would break that bar; waits on that line reading `arcSplit` (not this item's file) | untouched |
| daemon | bench/daemon.mjs | yes | ran, then the file was restored byte for byte to HEAD: the bar needs the wiki store (its ingest step refused 92 times, "no finished ingest at bench/fixtures/wiki/store") and self-code was refused once while another builder's bench flag was up; barMet false here (everyStepKind), barMet true at HEAD. Waits on the wiki store | untouched (true) |
| boundary | tools/boundary-audit.mjs (split lines only) | yes | waits on a host with 16384 MB free RAM (the audit waits for it before every driver and test; this host has 16095 MB in all) | untouched |
| senses | bench/senses.mjs | yes | waits on bench/fixtures/senses/odorants.csv and tastants.csv (hand-authored, not in git); the run here crashed at odorants.csv and its partial file was removed | untouched |
| census-prune | tools/organism-census.mjs (writer only) | yes | waits on RAM: its last run's rss ended at 6916.8 MB, over the board's 4000 MB cap | untouched |
| census | tools/organism-census.mjs | yes | waits on organism/gen-0 (absent here) | untouched |
| census-scale-static | tools/organism-census.mjs | yes | waits on organism/scale-52000 (never loaded in the cloud) | untouched |
| census-scale-pruned | tools/organism-census.mjs | yes | waits on organism/scale-52000-pruned (absent here) | untouched |
| compress | bench/compress.mjs | yes | waits on the wiki store (the tier part skips without it, so the run is partial) and on the bench's write-once rule (a bar-shaped re-run writes compress-delta-rerun.json while compress.json holds this item) | untouched |
| web-ladder | web/ladder-bar.mjs (split lines only) | yes | waits on its write-once rule (it refuses to start while web-ladder.json exists) and on web/build.mjs, board 18's file, which it runs | untouched |
| knowledge | bench/knowledge.mjs | yes (contaminated false) | waits on the wiki dump and store | untouched |
| native | bench/native.mjs | yes (contaminated false) | waits on the wiki store | untouched |
| recall | bench/recall.mjs | yes | waits on the wiki store | untouched |
| code | bench/code.mjs | yes (contaminated false) | waits on Ollama and bench/fixtures/code-tasks.json | untouched |
| math | bench/math.mjs | yes | waits on Ollama | untouched |
| synth | bench/synth.mjs | yes | waits on Ollama and bench/fixtures/public/humaneval | untouched |
| autopilot-board10 | none at HEAD: an archived copy of Board 10's autopilot.json; bench/autopilot.mjs now writes autopilot.json, which carries a split | no | cannot: its bench is superseded | untouched |
| compress-board10 | none at HEAD: Board 10's compress.json kept as a copy; bench/compress.mjs only reads it | no | cannot: its bench is superseded | untouched |
| public-launch | bench/public.mjs (board 18's file) | no | not this item's file | untouched |

The exact commands the local orchestrator runs for the ones that wait (each through tools/budget.mjs):
`node tools/boundary-audit.mjs --bar` (its BAR_COMMAND), `node bench/senses.mjs`,
`node --max-old-space-size=6000 tools/organism-census.mjs --seed organism/gen-0-pruned --ticks 200 --min-free-mb 16000 --progress 50`,
`node tools/organism-census.mjs --seed organism/gen-0 --ticks 200`,
`node --max-old-space-size=6000 tools/organism-census.mjs --static --seed organism/scale-52000` and `--seed organism/scale-52000-pruned`,
`node --max-old-space-size=6000 bench/compress.mjs` (its write-once rule sends a bar-shaped re-run to compress-delta-rerun.json while compress.json holds the item's bar: the orchestrator decides how the bar file is re-written), `node bench/daemon.mjs`,
`node --max-old-space-size=6000 web/ladder-bar.mjs` (it refuses while web-ladder.json exists: the orchestrator decides), `node bench/knowledge.mjs`,
`node --max-old-space-size=6000 bench/native.mjs`, `node bench/recall.mjs`, `node bench/code.mjs`,
`node bench/math.mjs --limit 200 --seed 1`, `node bench/synth.mjs`, and, once capability/grid-library.mjs reads `arcSplit`,
`node bench/grid.mjs --split training --budget-ms 3000 --workers 2`.

## Fixture fetched

ARC-AGI-1 from https://raw.githubusercontent.com/fchollet/ARC-AGI/master/data/{training,evaluation}/<id>.json
(Apache 2.0) into bench/fixtures/public/arc-agi-1/ (never committed): 400 training files, 1436054 bytes
(sha256 of names and bytes 463a92a26c5d8197), 400 evaluation files, 2345957 bytes (e934677a753576c0);
the ids came from the rows of bench/verdicts/grid.json and grid-evaluation.json because the GitHub tree
API answered 403 through the proxy; the SOURCES.md line is in bench/fixtures/public/SOURCES.md.

## Tests

`node --test test/contamination-split.test.mjs test/gate-contamination.test.mjs`: tests 10, pass 10,
fail 0 (4 new: every changed writer's splitFor extracted from its own source and run on planted
options, the clean/contaminated cases, the gate row GREEN on the planted splits and RED with grid's old
string split put back as the control, and tools/contamination-row.mjs --nowrite).
Touched-file tests: tasks, region, ladder, imagine, velocity, years 98/98; spawn, census-static,
boundary with velocity, years and imagine 80 of 88, the 8 fails all test/senses.test.mjs on ENOENT
bench/fixtures/senses; math, dream, knowledge, synth, census 55 of 56 (synth: ENOENT
bench/fixtures/public/humaneval); compress, multiply, code, budget 42 of 46 (code: 3 on the absent
bench/fixtures/code-tasks.json; budget: the reaper test, which fails the same way with HEAD's
bench/budget.mjs in a tree copy, so it is this host, not this change).

## For the orchestrator

- capability/grid-library.mjs:97 reads `v.split !== 'training'`; once it reads `(v.arcSplit ?? v.split)`,
  grid.json can be re-run by `node bench/grid.mjs --split training --budget-ms 3000 --workers 2`.
- autopilot-board10.json and compress-board10.json are archived copies whose benches no longer exist;
  only the orchestrator can decide how the row treats them (a verdict is never edited by hand).
- Two bars re-run here turned red on this 4-CPU shared host: multiply (population 133 below single
  136) and grid-library (margin -3 against noise 2). Their before figures were measured on the
  32-thread PC. A re-run there is the control for whether the host or the tree moved them.
- daemon.json was run (barMet false for the absent wiki store and another builder's bench flag) and
  restored byte for byte to HEAD; the cloud run's verdict is not in the tree.
