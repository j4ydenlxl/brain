# autopilot: self-code with no human in the loop

His 2026-09-18 08:42: "Soon it needs to generate itself open source more cells and gets better without your help". His 10:26, answering the ask for self-code approval: "Nah im not doing shit bro. Find a way to do it yrself everything is in ur hands".

Board 8 built the walls. Board 10 gives the walls something to judge: candidates from six sources, a patch author on open weights, and a record of who wrote each kept line.

## What it is

`self/autopilot.mjs`, run by `brain self-code --auto` (the brain name is optional; the autopilot works on the source tree). The human approval that `self/code.mjs` waits for is replaced by a measurement, and everything the measurement can get wrong is undone byte for byte. One candidate passes five walls in order:

1. **Ceiling.** safePath (inside the brain, not state/) plus the autopilot's list: never MANUAL.md or manual/, docs/, self/, bench/gate.mjs, bench/verdicts/, or any test file (the tests are the spec; a patch that edits the test grading it has no referee). Compared lowercased: this disk is case insensitive.
2. **A patch.** The candidate's own, the deterministic census prune, or the model author's. No patch, refused.
3. **Evidence, run on a temp copy.** Three modes, each sealed by this process, each requiring no fewer tests after the patch:
   - fix: `verifyPatch` from self/code.mjs, the named test fails without the patch and passes with it;
   - preserve: the named test passes before and after (a census prune, which must change nothing a test can see);
   - faster: as preserve, and the test's time after is at most 0.8 of its time before (a slow gate row).
4. **Gate.** Pre-patch bytes, the patch, and both hashes go to `state/self-code/<id>/` (before.bin, patch.diff, meta.json), then the file is written and the whole gate runs (`node bench/gate.mjs --quiet`, or `--gate-cmd`). GREEN keeps. RED reverts byte for byte, re-hashes against the snapshot, and restores gate.json to the bytes it had before that gate run. A tree that was already red keeps a patch only if the gate's own per-file breakdown shows it fixed a red file and turned no green file red.
5. **Record.** One JSON line per decision in `bench/verdicts/autopilot/<date>.jsonl`, written after the decision and after the revert was verified. A kept patch also appends one line to `state/self/authored.jsonl`.

A crash between the write and the ruling leaves a snapshot with no outcome.json; the next run restores it if the file still holds the patched bytes. One autopilot per tree (a pid lock in state/self-code/; a dead holder is taken over). `--dry` verifies on a temp copy and writes nothing.

## Sources

Every candidate carries its source, and the run prints candidates, proposed, kept, reverted, refused and would-apply per source, in this order:

- **gate**: a red row of the last gate run (bench/verdicts/gate.json) becomes a fix candidate on that test file.
- **notes**: every line of notes/*.md that starts with `OPEN:` (the planted grammar), and every bullet under a heading that starts with "Open", never inside a code fence. The first source file and the first test file the line names are its target and its test; with no test named, `test/<note>.test.mjs` if it exists. A fix candidate whose test already passes is refused as stale before the author is asked. A test is run once per tree state: several OPEN lines on one test share that run, and any write to the tree empties the memo.
- **imagine**: `mind/imagine.mjs` when it exists. Its `propose()` is called with the root; when that throws (the real one needs a `context.space`), the autopilot proposes over the grid DSL space and turns each proposal into a patch with `patchFor`. The anchor insert becomes a unified diff.
- **census**: bench/verdicts/census.json. The dead bitset of a seed is decoded (bit i at byte i>>3, position i&7; the popcount must equal the count), the edge declarations are the `e(` lines in import order, and the prune is a pure deletion judged on "every test stays green". A seed whose manifest.json pins a content hash is refused at the patch wall: that seed is re-emitted whole by genome/emit.mjs --prune, never edited line by line.
- **slow**: a gate row at 15000 ms or more (`--slow-ms`) becomes a faster candidate on that test.
- **mutants**: bench/verdicts/mutants.json survivors, as in Board 8.

## The author

A model cell on open weights: qwen3:30b-a3b through Ollama at http://localhost:11434, overridden by BRAIN_AUTHOR_MODEL and BRAIN_AUTHOR_BASE (or `--model`, `--author-base`) in a container. It is asked with the candidate, the target file, its test and the OPEN line, and returns a unified diff that the autopilot applies and gates like any other patch. A model or endpoint that names Claude or Anthropic is refused before any socket opens, in the config and again in the child. `bin/brain.mjs` calls the autopilot without awaiting it, so the model call runs in a synchronous child (`self/autopilot.mjs --child author`, 1024 MB heap) that prints one JSON line. The answer is reduced to one diff whose target is the candidate's file (think blocks stripped, a fenced block with a hunk preferred, a diff aimed at the test never taken). Thinking on, context 16384, at most 6000 tokens, 600000 ms timeout, at most 3 calls per run (`--author-max`). The author is on for a wet run and off for `--dry`; `--author on|off` sets it. Author names in the record: `given`, `imagine`, `deterministic:census-prune`, `model:<name>`.

## The record and the share

`state/self/authored.jsonl` gets one line per kept patch: at, runId, key, source, files, author, organism (every author but `given`), the file hash before and after, and the gate hash before and after (sha256 of the gate.json bytes that run wrote). A revert, a refusal or a dry run writes nothing there.

`node tools/authorship.mjs` reads that file and docs/BOARDS.json and prints the share: organism-authored kept patches over (all kept patches plus the unique files each board landed), per ISO week (UTC) and cumulative, and writes bench/verdicts/authorship.json once per run. On the real tree it printed 0/93 = 0.0000: the authored file is absent, and docs/BOARDS.json lists board 8 (56 files) and board 9 (37 files), both in 2026-W39.

## The bar

`node bench/autopilot.mjs && node tools/authorship.mjs`. The verdict `bench/verdicts/autopilot.json` (isTheBar true, MET, 21 of 21 checks, 31970 ms, written 2026-09-24T02:33:30.571Z) OVERWRITES the Board 8 bar of the same name (13 of 13, MET, written 2026-09-23T20:36:32.716Z), whose 13 checks run first, unchanged: stage 1 KEPT with the gate GREEN (baseline exit 1, after exit 0), stage 2 REVERTED with the gate RED on test/area.test.mjs and the CRLF file restored to its pre-patch hash (123 bytes), the test-file patch refused at the ceiling. Then, from the same run:

- Real tree, `brain self-code --auto --dry --json`: 73 candidates (gate 0, notes 44, imagine 2, census 23, slow 4, mutants 0), would apply 0, nothing written, 1085 ms. gate.json held 61 test files, 0 red, 4 rows at 15000 ms or more. notes: 44 OPEN lines in 38 files, 0 with the OPEN: grammar. imagine: 2 proposed by propose(grid DSL space, 14 imagined) + patchFor, both refused as stale. census: 223456 dead edges of 440578 in organism/gen-0 (2467 dead cells), refused because organism/gen-0/manifest.json pins content hash 4dc49d1d91c0. mutants.json: 40 mutants, 0 survived.
- Wet pass on a planted repository copy (the real bench/gate.mjs, a mind/imagine.mjs, a census seed), author off: 2 kept from non-mutant sources with the gate GREEN. imagine fixed lib/clamp.mjs (gate exit 1 before, GREEN after); the census prune took seed/gen-p/edges-000.mjs from 5 to 3 declarations with every test green. authored.jsonl grew by 2, gate hash 073763b85850 -> c0bc12a4410c -> 4e0b3aa8f5ef.
- Model cell: qwen3:30b-a3b was asked 1 time for a planted `OPEN:` line on a failing lib/mean.mjs, answered in 26778 ms, and its patch was KEPT with the gate GREEN; the second OPEN line was refused because the budget of 1 call was spent. A model named claude-opus was refused before any socket opened.
- Share over the wet copy and the real docs/BOARDS.json: 2/95 = 0.0211. `node tools/authorship.mjs` on the real tree right after: 0/93 = 0.0000.

The run before this one (2026-09-24T02:22:22Z, before the test memo and the bench flag, and before this note was rewritten) was also MET, 21 of 21: 69 candidates on the real tree (notes 40), and the model answered in 52661 ms. Two runs, two model times: 52661 ms and 26778 ms.

Tests: `node --test test/autopilot.test.mjs` 22 of 22 in about 17 s: the 11 Board 8 tests plus 11 new ones (each source yields a candidate on a planted tree, the OPEN grammar, authored.jsonl grows only on a kept patch, the census prune and the pinned seed, an OPEN line to the author and then stale, one test run for three OPEN lines on one test, slow kept vs not faster refused, the closed-provider guard, extractDiff, the share arithmetic, the CLI dry run). The one-run test was checked against the code before the memo: the same three lines ran the test 3 times there and 1 time here. No test asks a real model; a fake author stands in. test/self-code.test.mjs 17 of 17 and test/cli.test.mjs 15 of 15 stay green. The planted trees live in test/autopilot-plant.mjs.

## Budgets

Every child the bench starts declares a heap: 2048 MB for the CLI runs, 1024 MB for the author and imagine children, 6000 MB (NODE_OPTIONS) for each gate run. Sampled every 500 ms across the bench's process tree, the largest working set was 156.7 MB (31 processes; the run before: 121.5 MB, 30 processes). A wet verification copies the tree minus state, .git, node_modules and site, which du printed as 1.1G on the real tree (organism/ is 293M of it); the planted copies are a few files. The model cell is one Ollama queue: the bench asks it once. While it runs, the bench raises `state/bench-flags/<pid>.json` and lowers it in its finally.

## Beside the daemon

`daemon/run.mjs` (another item's file) runs `runFromCli` in a Worker every selfCodeEvery ticks, wet unless selfCodeDry is set, and forwards `author` only when selfCodeAuthor is set, so the default here (author on when wet) is what a daemon step gets. It refuses the step while a live pid holds a bench flag, which is why the bench raises one: stage 3 asserts the real tree was not written.

One such step ran on the real tree at 2026-09-24T02:24:16Z (run 20260924T022416440Z). It wrote 22 decisions to bench/verdicts/autopilot/2026-09-24.jsonl: 20 refused at the evidence wall (notes/act.md lines that name no test) and 2 refused as stale (notes/autopilot.md lines whose test/autopilot.test.mjs passed, 21 of 21 then), about 15 s apart, one test run each. It asked no model and wrote no source file. The worker was ended before it finished and left state/self-code/autopilot.lock holding pid 5904, which is dead, so the next run takes the lock over. The test memo came from that ledger: both stale lines ran the same test.

## Open

- The real tree's census is pinned: every prune there is refused at the patch wall, because the seed is re-emitted whole by genome/emit.mjs --prune and the autopilot does not author that call. A census source that runs the emitter on a copy, then gates the re-emitted seed, is the next wall.
- No live run on the real tree has finished with the model author on. The one daemon step that started was ended after 22 decisions and asked no model. The notes and slow candidates there are refused in `--dry` only because the author is off; each one live costs a model call (26778 ms and 52661 ms on the planted file) and a verification copy of about 1.1G.
- The 2 imagine patches on the real tree are stale: test/grid.test.mjs already passes, so they are refused before any copy.
- bin/brain.mjs does not list no-author among its boolean flags, so `--no-author` can swallow the next word; use `--author off`.
- docs/BOARDS.json lists boards 8 and 9 only, so Board 10's files are not yet in the share's denominator.
- A weakened source (not test) change that keeps every test green is kept. The gate is only as strong as the suite; the mutant bench is what measures that.
- Not scheduled. Registering it after the 04:00 BrainLadder task is the step that makes it daily.
