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

## Measured (board 23, local, item contamination-split)

board 23 builder, 2026-09-26 and 2026-09-27 EDT (a first pass, a fix pass, and fix pass 2, which re-ran every
verdict below at 2026-09-27T13:34:29Z to 13:53:31Z by their `at` fields), his Windows 11 PC (32 CPUs, 64 GB, Node
v24.15.0), MODEL OFF (no Ollama call, no socket to port 11434). Every run went through
`node tools/budget.mjs --ram-mb 4000 --disk-mb N --dir <its output dir> -- node --max-old-space-size=4000 ...`,
one at a time, with free RAM read first (35183 to 38963 MB free before each fix pass 2 run).

Row before (`node bench/gate.mjs --contamination`, the first pass, before any change):
`... with no split 18, split not an object 1; CAUSES (2): 18 bar file(s) with no split: autopilot-board10.json, boundary.json, census-prune.json, census-scale-pruned.json, census-scale-static.json, census.json, code.json, compress-board10.json, compress.json, daemon.json, knowledge.json, math.json, native.json, public-launch.json, recall.json, senses.json, synth.json, web-ladder.json`.

What each writer this item re-ran now carries (every one already had a board 19 splitFor; the verdicts on disk
had been written before it):
- bench/senses.mjs: a sense graded on live hardware samples is held out; a sense that read its fixture or table
  is named in the reason. heldOut.n counts the senses read live and heldOut.samples their live samples (fix pass
  2: the verify plane found n, a count of senses, under a what that named samples).
- bench/recall.mjs: the leak check's count (null when it gave none, never read as 0), and whether
  bench/verdicts/knowledge.json grades the same draw seed (priorGradeOf).
- bench/native.mjs: the bench's own control table: drawnInTable and recall@1 of the table against the control
  table that leaves the drawn out; a reason when the drawn sat in the table and the two scores differ, or when
  the counts were passed with no value.
- bench/knowledge.mjs: the grade's own leak count.
- bench/daemon.mjs: the reason names the suites its ruler scored; the self-code refusals read from the run's
  ledger file, with the floor they were held to.
- tools/organism-census.mjs: nothing from this item. Fix pass 2 put staticVerdictOf back to HEAD (its
  `split: splitFor(...)` line was already there); the fix pass had added a top-level mark and a statement
  sentence, more than the split its brief allows.

Fix pass 2, the verify plane's findings and what changed:
- test/contamination-split.test.mjs: the committed `assert.match(src, /split: splitFor\(/ ...)` and the
  committed knowledge and native plants are back as HEAD has them. The five writers now build the split inside
  the verdict literal (`split: splitFor(`), then mark `contaminated` and append the sentence. Because the
  committed plants pass no count and must read clean, a call that passes no count states the board 19
  construction rule (heldOut.leakCheck and heldOut.control say "not passed"), and the unmeasured case a run can
  produce is the count key passed with no value, a reason; knowledge main() and native bar() always pass the key
  (asserted on their source and on the verdicts). The fix pass's own cases for the no-key call were changed to the
  passed-null call, because they contradicted the committed plants.
- knowledge.json's --store: a store written to the default directory (bench/fixtures/wiki/store) is truncated
  as the ingest opens it (memory/knowledge.mjs KnowledgeWriter writes each file empty first), and the
  orchestrator's GSM8K rung (bench/public.mjs --set gsm8k, running through act/prompt.mjs ask(), which opens
  that store) was running, so the run graded a scratch store again. The directory is created by the run
  (tools/ingest-wiki.mjs ingest, mkdirSync recursive), so the recorded command re-runs as recorded: a test ingests
  a two page dump into a directory that does not exist and finds a whole store there. The scratch store was
  deleted after the run (the budget rule); the default store it hashed equal to stays on disk.

Re-run by each writer's own command, in fix pass 2 (figures from each verdict and its printed lines):

| verdict | command (inside the budget wrapper) | bar |
|---|---|---|
| census-scale-static | node --max-old-space-size=4000 tools/organism-census.mjs --static --seed organism/scale-52000 | isTheBar true, no barMet (the writer writes none); load bearing 5097787 of 5126010 lines = 99.45%; 18.0 s, peak working set 446.2 MB; walked line by line, the organism never loaded |
| census-scale-pruned | node --max-old-space-size=4000 tools/organism-census.mjs --static --seed organism/scale-52000-pruned | isTheBar true, no barMet; load bearing 5097823 of 5097823 lines = 100.00%; 5 of 5 prune checks true against the census-scale-static.json above; 17.1 s, 446.5 MB |
| senses | node bench/senses.mjs | MET; 5 of 5 senses fired on every sample; wall 7748.103 ms; split: 2 senses read live (sight, touch) on 6 live samples, contaminated "3 of 5 senses (hearing, smell, taste) ..." |
| recall | node bench/recall.mjs | MET; wiki 176 of 200 answered by the tier, 122 correct; suite 200/200; leaks 0; run 1.3 s, peak rss 223.7 MB; contaminated: the draw is the one knowledge.json grades |
| native | node bench/native.mjs | MET; recall@1 122/200 against 100 needed; control table 122, drawnInTable 199, so contaminated false from the control; 70.92 ns per direct hit printed; peak rss 942.1 MB, wall 435.07 s |
| knowledge | node bench/knowledge.mjs --store <scratchpad>/board23/contamination-split/kstore/store | MET; recall@1 0.625, recall@5 0.785, mean 5.18 ms per query; leaks 0; ingest 100.9 s; store 13 files, 388459374 bytes, sha256 equal to bench/fixtures/wiki/store |
| daemon | node bench/daemon.mjs | NOT MET: 6 of 7 checks yes, everyStepKind NO; phase A 39635 ticks in 360.003 s, summary ledger median 3194 B per 1000 ticks; phase B 8,370 ticks in 120.009 s, full ledger 834,989,573 B written over 31 rotations, two segments never over 52,428,750 B against 52,428,800: HELD; peak rss 1781 MB; budget wall 501.78 s, peak dir 187.8MB (state/daemon-bar, deleted by the run); split: no held-out set, contaminated true, labelled |

daemon.json is red for a reason outside the split. The committed daemon.json (at 2026-09-24T02:51:04.223Z) met
everyStepKind with a dry self-code step at t=40207. Commit 1925a1e (board 13, 2026-09-26) then gave daemon/run.mjs
a self floor (FIT_DEFAULTS.selfFloorMb 380), and this re-run under the current daemon/run.mjs refused both
self-code steps: t=20009 "rss 1084 MB ... over the floor 380 MB" and t=40201 "rss 1377 MB ... over the floor 380 MB"
(phaseA.selfCodeFit: floorFrom default, starts 0, refusals 2). The split adds nothing the bar reads; the floor lives
in daemon/run.mjs, which this item does not own.

Row after, printed by `node bench/gate.mjs --contamination` at the end of fix pass 2:
`CONTAMINATION RED: bar files (isTheBar true) 77 of 229 verdict files, with a split object 76, contaminated and labelled 14 (autopilot-board10.json, brief.json, census-prune.json, census.json, compress-board10.json, compress.json, daemon.json, math.json, public-launch.json, recall.json, senses.json, synth.json, unsplit-bars.json, web-ladder.json), contaminated and unlabelled 0, with no split 0, split not an object 1; CAUSES (1): 1 bar file(s) whose split is not an object: grid.json (string "training")`.
Every one of the 18 files the row named before carries a split object; the one cause left is grid.json, which
this item does not own. Tests: `node --test test/contamination-split.test.mjs test/gate-contamination.test.mjs`
printed tests 21, pass 21, fail 0.

Left open, said plainly:
- census-scale-static.json and census-scale-pruned.json carry isTheBar true and no top-level barMet, and their
  split reason is a string the gate counts clean (it reads contaminated only when it is true). Both need an edit
  of tools/organism-census.mjs beyond the split, which this item may not make.
- daemon.json, red on everyStepKind as above (the 380 MB self floor of daemon/run.mjs).

Read while working (fix pass 2): the verify plane's list; bench/gate.mjs (contaminationRecords,
markedContaminated, contaminationRow); test/contamination-split.test.mjs at HEAD and in the tree; the five
writers' verdict code; tools/organism-census.mjs staticVerdictOf at HEAD; tools/ingest-wiki.mjs ingest and
memory/knowledge.mjs KnowledgeWriter (how --store is created and how the default store is rewritten); the
running node processes (which showed the GSM8K rung); bench/daemon.mjs state dir; board 24b's section below.
No web page: every finding was the tree's own. The first pass's one web search (contamination reporting, result
summaries only) named a held-out twin compared with the public split, which is what native's control table is.

## The eleven

board 24b builder, 2026-09-27 (at 2026-09-27T13:31:23.007Z by the bar verdict), his Windows 11 PC, Node v24.15.0, MODEL OFF
(no Ollama call, no socket to port 11434). Item unsplit-bars.

The verdict statement, bench/verdicts/unsplit-bars.json, written by `node tools/split-stamp.mjs --bar` (it runs
`node bench/gate.mjs --contamination` as its own process and quotes what it printed, with its exit code). Printed
(exit 1, the one cause left is grid.json, item ladder-arc's):
`CONTAMINATION RED: bar files (isTheBar true) 76 of 229 verdict files, with a split object 75, contaminated and labelled 7 (brief.json, census-scale-pruned.json, census-scale-static.json, daemon.json, recall.json, senses.json, unsplit-bars.json), contaminated and unlabelled 0, with no split 0, split not an object 1; CAUSES (1): 1 bar file(s) whose split is not an object: grid.json (string "training")`.
barMet true: none of the eleven is named, and no cause names a file but grid.json.

Row printed at the start of this item (before any change): `... with no split 10, split not an object 1; CAUSES (2): 10 bar file(s) with no split: autopilot-board10.json, census-prune.json, census.json, code.json, compress-board10.json, compress.json, math.json, public-launch.json, synth.json, web-ladder.json; 1 bar file(s) whose split is not an object: grid.json (string "training")`.
census-scale-static.json had been re-run by its own writer (at 2026-09-27T01:24:20.358Z, board 23's fix pass) before this item began; it is left as its run wrote it.

Which ran and which were stamped. No writer re-ran: each reason is read from the file itself by the stamp and kept in
its splitSource.notRerunBecause.
- ran: none. web/ladder-bar.mjs was started under tools/budget.mjs and printed `[refused] bench\verdicts\web-ladder.json exists and a bar file is written once; nothing was run.` (exit 2, wall 0.16 s): its write-once rule, and a bar run rebuilds web/dist.
- stamped (10): autopilot-board10.json and compress-board10.json (archived copies, no writer writes them); census.json (rssAfterFull 16881.1 MB) and census-prune.json (rssEnd 6916.8 MB), over the 4000 MB cap; compress.json (wallMs 513982, peakRssMb 4243, and its write-once rule); code.json, math.json, synth.json (their bars ask Ollama); public-launch.json (no single writer: a detached cmd.exe chain of bench/public.mjs runs whose smokes asked Ollama); web-ladder.json.
- own run (1): census-scale-static.json.

What a stamp is (tools/split-stamp.mjs). The split is the writer's CURRENT splitFor, cut out of the writer and
compiled alone (never imported: web/ladder-bar.mjs runs its bar on import), applied to arguments read from the file
(public-launch: the smokes' own development and held-out counts, gsm8k 5 and 25, humaneval 7 and 23; compress-board10:
daemon false, tiers false). autopilot-board10 has no splitFor: its byBoard counts are bench/autopilot.mjs's verdict.split
line applied to its 21 checks, and its development and heldOut words are the stamp's. The stamp adds five keys at the
end (split, splitStampedAt, splitStampedBy, splitSource with the function's sha256, splitStampedOver with the old
file's sha256 and where the stamp sits), spliced in as text in the file's own indentation, so cutting it out gives the
old bytes back: `node tools/split-stamp.mjs --check` printed `split-stamp check: 11 of 11 ok`.

Not done, said plainly: 9 of the 10 stamped splits give a contamination reason (all but code.json, whose hidden cases
are never in a prompt), and census-scale-static.json's own run gives one too. A stamp never edits a statement, and the
gate labels a top-level contaminated true only from the statement, so the stamp adds no top-level mark: the row counts
those 9 as split and NOT as contaminated (the gap board 23's fix pass named for reason strings). Their writers' next
runs close it where the writer marks: bench/compress.mjs, bench/math.mjs, bench/synth.mjs (top-level mark plus
"Contaminated, as the split says" in the statement); tools/organism-census.mjs marks in static mode only;
web/ladder-bar.mjs and bench/public.mjs do not mark. Whether a stamp may append that sentence to a statement is the
orchestrator's call.

Writers: bench/code.mjs's splitFor now names its draw's seed and generator (a synthetic draw); bench/compress.mjs,
bench/math.mjs, bench/synth.mjs (top-level mark and statement sentence) and bench/public.mjs (splitFor from the per set
development and held-out counts, a count not measured is a reason, never clean) carry this item's earlier edits,
checked here, not re-run.

Tests: `node --test test/unsplit-bars.test.mjs`: tests 6, pass 6, fail 0 (both kinds of row; old bytes back by sha256,
numeric leaves and every field against git HEAD; controls: one number moved, the split edited, the stamp cut out and the
row names the file again; the tool's dry run, --write and idempotent second --write on a temp copy; the writers; the
gate CLI). Also run, not this item's: test/contamination-split.test.mjs with test/gate-contamination.test.mjs 17 of 17;
test/code, math, synth, compress 50 of 50 (the code test that writes code-partial.json skipped by name).

Read while working: bench/gate.mjs (contaminationRow, contaminationRecords, splitShapeOf, the --contamination CLI),
test/gate-contamination.test.mjs, test/contamination-split.test.mjs (splitForSource and the fix pass on reason
strings), this file, each of the eleven files, every writer's splitFor (code, compress, math, public, synth,
web/ladder-bar, tools/organism-census, bench/autopilot's split line), and one web search on contamination disclosure:
its result summaries name a disclosure record with a JSON schema that "accepts unknown as a valid entry" (arXiv
2608.29463), which is the rule public.mjs's splitFor already keeps (an unmeasured count is a reason, never clean).

### The eleven: fix pass (board 24b verify plane, 2026-09-27)

At 2026-09-27T13:51:13.659Z by the bar verdict, Node v24.15.0, MODEL OFF. Four problems the verify plane named, each fixed
at its source:
- bench/verdicts/code-partial.json had been rewritten (not this item's file; test/code.test.mjs writes it into the tree
  by design). Put back with `git checkout --`; `git diff --quiet` on it returned 0 after the bar. test (d) now guards it
  and the other landing files (code.json, code.progress.json, code.lock.json, compress-partial.json,
  compress-delta-rerun.json, math-partial.json, synth-partial.json) by sha256 around the writer runs.
- The statement quoted numbers the command did not print. The bar now prints a tally line beside the gate's line, and
  the statement quotes only numbers on those two lines; test (e) checks every number in it against them.
- The gate labels a file contaminated only from a top-level true, and 9 stamped files carried a reason with no mark. The
  stamp now tells the reader: top-level contaminated true and one sentence appended to the statement (" Contaminated, as
  the split stamped by tools/split-stamp.mjs says: <reason>."), both recorded in splitStampedOver (statementAt,
  statementChars, statementAppended, markAdded) so cutting them out still gives the old bytes back. A file whose own run
  already wrote a top-level contaminated is refused (action conflict), never overwritten.
- test (d) read the writers' source text. It now runs them with no model: bench/code.mjs run (limit 2, null arm, no
  write), bench/compress.mjs run (daemon, organism and tiers skipped; such a run allocates none of the three, so it now
  reads free RAM instead of waiting for 16 GB), bench/math.mjs run (a mock model, train and fallback records, temp
  dirs), bench/synth.mjs verdictOf (the verdict body run() writes, cut out as an export, since its run asks Ollama) and
  bench/public.mjs run (null arm, temp dirs, seeds until both a clean and a reason split are drawn). compress, math and
  synth set the top-level mark and the sentence from the split the verdict object carries (`split: splitFor(`, the
  literal test/contamination-split.test.mjs asks for).

Measured (fix pass):
- `node tools/split-stamp.mjs --bar` under `node tools/budget.mjs --ram-mb 4000 --disk-mb 50 --dir bench/verdicts`
  (free RAM 34382 MB before it), BUDGET exit 0, wall 0.56 s, peak ram 121.2MB. Printed:
  `CONTAMINATION RED: bar files (isTheBar true) 74 of 225 verdict files, with a split object 73, contaminated and labelled 14 (autopilot-board10.json, brief.json, census-prune.json, census.json, compress-board10.json, compress.json, daemon.json, math.json, public-launch.json, recall.json, senses.json, synth.json, unsplit-bars.json, web-ladder.json), contaminated and unlabelled 0, with no split 0, split not an object 1; CAUSES (1): 1 bar file(s) whose split is not an object: grid.json (string "training")`
  and
  `split-stamp bar: gate exit 1, stamped 10, own run 1, failed 0, a reason in split.contaminated 10, stamped with a reason 9, of those labelled by the row 9, own run with a reason the row reads as clean 1, causes 1, eleven named 0, causes other than grid.json 0, control (stamps cut out) no split 10 of 10, barMet true`.
  The control is the gate's own contaminationRow over the 10 stamped files with their stamps cut out.
- `node tools/split-stamp.mjs --check`: `split-stamp check: 11 of 11 ok`.
- Not closed here: census-scale-static.json (own run, tools/organism-census.mjs, not this item's writer, rewritten at
  2026-09-27T13:34:29.301Z by a run this fix pass did not start) gives a reason with no top-level mark, so the row reads it
  as clean: the tally's "own run with a reason the row reads as clean 1".
- Read before fixing: bench/gate.mjs (contaminationRecords, contaminationRow, splitShapeOf, the --contamination CLI),
  test/contamination-split.test.mjs (the WRITERS list and its `split: splitFor(` check), test/code.test.mjs (where it
  writes code-partial.json), test/math.test.mjs and test/public.test.mjs (how they run a writer with no model),
  bench/compress.mjs, bench/synth.mjs, bench/math.mjs and bench/code.mjs (run and splitFor), and this item's prior
  tools/split-stamp.mjs and test/unsplit-bars.test.mjs.
