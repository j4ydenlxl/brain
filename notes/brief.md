# notes/brief.md: the brief item (Board 15)

His words, relayed: "Needs to be fronteir level in microseconds. And self improving. Without your build. THAT HAS TO BE ESTABLISHED NOW."

This note is the builder's record. Every number below was printed by the command named beside it.

## Files

Written by this item:
- self/brief.mjs (new): the operator that finishes a board item with no orchestrator
- self/operators.mjs: the brief registration; author asks the organism first, the model cell last, provenance recorded
- test/brief.test.mjs and test/brief-plant.mjs (new)
- bench/brief.mjs (new), plus the verdicts it writes: bench/verdicts/brief-partial.json and bench/verdicts/brief-real-partial.json (both isTheBar false)
- state/self/brief/: one dated jsonl of plan, write, test, bar, gate and decision records, and direct.bin, the learned table
- this note

bench/verdicts/brief.json was NOT written: the bar run was partial (see Open).

## Design

The executor is the organism's ask() chain, in order: direct (a learned table), exact (the board grammar and stated examples), memory, program synthesis, library learning. The model cell comes last: qwen3:30b-a3b through Ollama at localhost:11434. A model named claude-anything, or any base that is not local, is refused before a socket opens. Every step prints its provenance and its ns, us or s.

Pipeline, per item, on a copy of the tree (organism/, state/, bench/fixtures/, web/dist/ and .git/ excluded, the copy deleted after):
- PLAN: the owned files only, parsed from the board script.
- WRITE: one whole file per call; bare builtin imports are rewritten to node: before the schema gate.
- TEST: the first 60 failure lines go back; at most 4 repair rounds.
- BAR: a verdict with isTheBar true.
- GATE: node bench/gate.mjs --quiet on the copy.
- KEPT only when the tests pass, the verdict has isTheBar true and the gate is GREEN; the patch set's author is "organism (brief)".

Budgets: 40 model calls, 60 min wall, 120 s per call. Refusals print their wall.

The thinking budget: the model thinks on a streamed /api/chat; at 0.45 of the call wall with no answer text the stream is cut and a raw /api/generate closes the think block and asks for the answer. Without it the bench file call hit the 115 s wall repeatedly.

The gate base (the control for the gate wall): the gate is first run on a copy with no item written. A gate that is RED only on the base's red files adds no new red; the answers of such a run are learned as tested (never a patch set, never KEPT). A KEPT run's answers are learned as verified.

## Commands

- Tests: `node --test test/brief.test.mjs test/operators.test.mjs` printed tests 23, pass 23, fail 0, duration_ms 24713.1917. No test opens a socket to Ollama or writes the real tree.
- Bar: `node tools/budget.mjs --ram-mb 6000 --disk-mb 8000 --dir <scratch>/brief-run -- node --max-old-space-size=6000 bench/brief.mjs --tmp <scratch>/brief-run`

## What the bar printed (run 2026-09-25T22:25:33.262Z)

Gate base: "GATE RED: test files 89/95", em-dash files 4, bad imports 0; "base gate RED in 535.64 s on 831 files; red without any item: test/authorship.test.mjs, test/boundary.test.mjs, test/cloud.test.mjs, test/findings.test.mjs, test/portfolio-page.test.mjs, test/web.test.mjs".

Planted (the clamp item, the real model, a fresh table):
- PLAN exact, step 9975.2 us, 0 model calls.
- WRITE planted/clamp.mjs model+exact, 3/3 stated examples passed, 32.32 s.
- Test file and bench file: thinking closed at 51.77 s, answers 7.85 s and 12.41 s.
- 3 BAR failures, then "BAR ok, 0.75 s: exit 0, verdict isTheBar true, barMet true; printed: checked 1000, mismatches 0".
- Gate RED on the same 6 files as the base: 0 new red. REFUSED at the gate wall; 6 model calls, 296.4 s of model, 859.22 s in all; 4 answers learned; organism share 0.14.

Replay (the table the first run learned): PLAN direct, lookup 25800 ns; all 4 accepted answers direct, mean lookup 9350 ns; 0 model calls; organism share 1; BAR ok, checked 1000, mismatches 0; gate 0 new red; REFUSED at the gate wall, 540.03 s in all.

Control (the table off, 0 model calls): REFUSED at the budget wall, 3.2 s.

Micro (the PLAN ask, 1000 times):
- direct lookup: median 100 ns, p99 500.
- ask() on the table: median 43.5 us, p99 91.3.
- CONTROL ask() with the table off (n 200): median 1085.1 us, p99 1460.7.
- CONTROL the grammar: median 49 us, p99 115.1.

Real (board-13:exit, 6 owned files, the fewest among 6 undone model-off items): PLAN exact, 4464.6 us; REFUSED at the test wall after 4 repair rounds; 6 model calls, 291.68 s of model, 298.84 s in all; organism share 0.17. The real tree: planted files present 0 before and 0 after; the real item's owned files byte-identical 6 of 6. 1051499 MB free on the temp drive after the copies were deleted.

Totals: model calls in all 12; peak RSS of any child or this process 1834.902 MB; the budget wrapper printed wall 2242.00 s, peak ram 2121.9MB.

Final line: "BRIEF BAR PARTIAL (isTheBar false: the base gate is RED on 6 file(s) no item wrote, so no item can be KEPT on this tree)".

## Open

- The base gate is RED on 6 files other items own, so no item can be KEPT on this tree and brief.json cannot be written. Rerun the bar when the gate is GREEN.
- The real item failed at the test wall: its plan wrote test/venue-exit.test.mjs only (world/venue.mjs 1313 lines, generations/venue-suite.mjs 1066 and bench/venue.mjs 819 dropped at the 400-line whole-file cap; notes/venue.md not rewritten), and the tests still failed after 4 repair rounds. A patch mode for large files is the next gap.
- The planted item is the operator's own fixture; the replay proves the table, not generalisation.
- Earlier aborted runs left records in the same jsonl.
