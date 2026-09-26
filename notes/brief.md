# notes/brief.md: the brief item (Board 15)

His words, relayed: "Needs to be fronteir level in microseconds. And self improving. Without your build. THAT HAS TO BE ESTABLISHED NOW."

This note is the builder's record. Every number below was printed by the command named beside it.

## Files

Written by this item:
- self/brief.mjs (new): the operator that finishes a board item with no orchestrator
- self/operators.mjs: the brief registration; author asks the organism first, the model cell last, provenance recorded
- test/brief.test.mjs and test/brief-plant.mjs (new)
- bench/brief.mjs (new), plus the verdicts it writes: bench/verdicts/brief.json (the bar, isTheBar true), bench/verdicts/brief-real-partial.json (the bounded real attempt, isTheBar false) and bench/verdicts/brief-partial.json (the first run, on a RED base gate, isTheBar false; kept as history)
- state/self/brief/: one dated jsonl of plan, write, test, bar, gate and decision records, and direct.bin, the learned table
- this note

## Design

The executor is the organism's ask() chain, in order: direct (a learned table), exact (the board grammar and stated examples), memory, program synthesis, library learning. The model cell comes last: qwen3:30b-a3b through Ollama at localhost:11434. A model named claude-anything, or any base that is not local, is refused before a socket opens. Every step prints its provenance and its ns, us or s.

Pipeline, per item, on a copy of the tree (organism/, state/, bench/fixtures/, web/dist/ and .git/ excluded, the copy deleted after):
- PLAN: the owned files only, parsed from the board script.
- WRITE: one whole file per call; bare builtin imports are rewritten to node: before the schema gate.
- TEST: the first 60 failure lines go back; at most 4 repair rounds.
- BAR: a verdict with isTheBar true, and THE STATEMENT WALL (below).
- GATE: node bench/gate.mjs --quiet on the copy.
- KEPT only when the tests pass, the verdict has isTheBar true and the gate is GREEN; the patch set's author is "organism (brief)".

Budgets: 40 model calls, 60 min wall, 120 s per call. Refusals print their wall.

The thinking budget: the model thinks on a streamed /api/chat; at 0.45 of the call wall with no answer text the stream is cut and a raw /api/generate closes the think block and asks for the answer.

The gate base (the control for the gate wall): the gate is first run on a copy with no item written. A gate that is RED only on the base's red files adds no new red; the answers of such a run are learned as tested (never a patch set, never KEPT). A KEPT run's answers are learned as verified.

THE STATEMENT WALL (fix stage, 2026-09-26). The first re-run on a GREEN base found the next wall: the planted bench the model wrote had a statement "all tests passed"; tests and bar passed ("checked 1000, mismatches 0"), then the gate on the copy went RED on test/findings.test.mjs after 518.28 s ("new red over the base: test/findings.test.mjs"). A scratch copy reproduced it: "the note on planted-clamp quotes none of its values: all tests passed". The findings page requires a verdict's shown statement to quote one of that verdict's own measured values (tools/findings.mjs verdictValues: a number field of 10 or more, or a non-integer). self/brief.mjs statementCheck() now applies that same rule at the bar step, before the gate spends its minutes: a quiet statement goes back to the author as a repair round, and the bench rule the author reads says so. Cross-check on two scratch copies against the real findings test: quiet statement, statementCheck ok false, findings test exit 1; quoting statement, statementCheck ok true, findings test exit 0.

## Commands

- Tests: `node --test test/brief.test.mjs test/operators.test.mjs` printed tests 24, pass 24, fail 0, duration_ms 25161.4511. No test opens a socket to Ollama or writes the real tree. The new test: a quiet statement is refused at the bar step with exit 0, the bench is repaired, the run is kept, the gate runs once.
- Bar: `node tools/budget.mjs --ram-mb 6000 --disk-mb 8000 --dir <scratch>/brief-run -- node --max-old-space-size=6000 bench/brief.mjs --tmp <scratch>/brief-run`

## What the bar printed (run 2026-09-26T02:40:45.586Z, bench/verdicts/brief.json)

Gate base: "GATE GREEN: test files 96/96, assertions 1216 pass / 0 fail", em-dash files 0, bad imports 0; "base gate GREEN in 506.21 s on 841 files".

Planted (the clamp item, the real model, a fresh table):
- PLAN exact (brief-grammar), step 9567.4 us, 0 model calls.
- WRITE planted/clamp.mjs model+exact, 3/3 stated examples passed, 38.38 s.
- WRITE test/planted-clamp.test.mjs model, 28.51 s; WRITE bench/planted-clamp.mjs model, 64.55 s (thinking closed at 51.76 s).
- TEST ok, pass 4, fail 0; "BAR ok, 0.63 s: exit 0, verdict isTheBar true, barMet true; printed: checked 1000, mismatches 0".
- "GATE ok, 515.36 s: GATE GREEN: test files 97/97, assertions 1220 pass / 0 fail".
- KEPT: 3 files as a patch set by organism (brief); 3 model calls, 131.24 s of model, 650.74 s in all; organism share 0.25.

Replay (the table the first run learned): PLAN direct, lookup 2200 ns; all 4 answers direct (verified), mean step 391.68 us, mean lookup 2500 ns; 0 model calls; organism share 1; BAR ok, checked 1000, mismatches 0; gate GREEN 97/97 in 513.96 s; KEPT, 517.85 s in all.

Control (the table off, 0 model calls): REFUSED at the budget wall, 2.64 s.

Micro (the PLAN ask, 1000 times):
- direct lookup: median 100 ns, p99 300.
- ask() on the table: median 39.2 us, p99 57.8.
- CONTROL ask() with the table off (n 200): median 1098.8 us, p99 1349.9.
- CONTROL the grammar: median 46.5 us, p99 133.3.

Real (board-13:exit, 6 owned files, the fewest among 7 undone model-off items): PLAN exact, 2287.1 us; world/venue.mjs (1313 lines), generations/venue-suite.mjs (1066) and bench/venue.mjs (819) dropped at the 400-line whole-file cap, notes/venue.md not rewritten; the plan wrote test/venue-exit.test.mjs only; REFUSED at the test wall after 4 repair rounds ("The requested module '../world/venue.mjs' does not provide an export named 'calculateNetAfterFee'"); 5 model calls, 212.64 s of model, 218.91 s in all; organism share 0.17. The real tree: planted files present 0 before and 0 after; the real item's owned files byte-identical 6 of 6.

Totals: model calls in all 8; peak RSS of any child or this process 1792.684 MB; the budget wrapper printed wall 1900.41 s, peak ram 2097.7MB.

Final line: "BRIEF BAR MET: planted KEPT, real ran to the test wall with every step printed; verdict bench/verdicts/brief.json".

## Open

- The real item was REFUSED at the test wall, not KEPT: three of its source files are over the whole-file cap, so the organism could only write a test against exports that do not exist. A patch mode for large files is the next rung.
- The planted item is the operator's own fixture (contaminated, labelled in the verdict's split); the replay proves the table, not generalisation.
- The model still wrote 3 of 4 planted answers and 5 of 6 real ones (organism shares 0.25 and 0.17); only the replay is organism-only (share 1).
- An earlier re-run (2026-09-26T02:12:05.100Z) was stopped after its planted gate found the statement wall; its 8 model calls are in the same jsonl.
