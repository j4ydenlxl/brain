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

`node tools/authorship.mjs` reads that file and docs/BOARDS.json and prints the share: organism-authored kept patches over (all kept patches plus the unique files each board landed), per ISO week (UTC) and cumulative, the days since the last board, and candidates, proposed and kept per source per day from the live ledger lines. It writes bench/verdicts/authorship.json once per run.

A board's `at` is when it LANDED: its `BOARD N ... LANDED` line in docs/LOG.md, read as America/New_York local time, and only with no such line its latest checkpoint commit. Board 10's checkpoint commit is 2026-09-24T13:33:17Z; its LANDED line (docs/LOG.md:62) says 04:12 local, which is 2026-09-24T08:12:00Z, and that is the `at` now. Each derived entry carries `atSource`, `runId` (the wf_ id on the LOG line) and `commitsAt`.

The denominator fills itself. `node tools/authorship.mjs --fill` derives every board that docs/LOG.md says LANDED and docs/BOARDS.json lacks: the items of docs/boards/board-N.js and the files of its checkpoint commits, found by subject ("Board N landed", "Boards N to M landed"; "not landed" never counts). It prints the rows and writes nothing; `--write-boards` writes them. A board that says launched false while docs/LOG.md says it LANDED is printed as a STALE line naming that command. The plain run prints boards with a docs/boards source and no entry (today 14 and 15) as NOT IN THE DENOMINATOR.

On the real tree it printed 0/280 = 0.0000: the authored file is absent, and docs/BOARDS.json lists boards 8 (56 files), 9 (37), 10 (74), 11 (82) and 12 (31), all in 2026-W39, and board 13 not launched (8 items, 0 checkpoint commits). test/authorship.test.mjs checked every listed file: 280 in the tree, 0 only in a named commit. Board 9's 11 files under bench/fixtures/ are kept out of git by .gitignore and live only in the tree; the checkpoint commit aee673e carries the rest of boards 8 and 9.

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

## Boards 14 and 15: the soak grades itself

His order (2026-09-25): "Needs to be fronteir level in microseconds. And self improving. Without your build. THAT HAS TO BE ESTABLISHED NOW." The Board 14 soak (SOAK 20260924T205054238Z) was graded by the orchestrator from its transcript, because its builder died on the usage limit. From Board 15 on, a soak writes its own verdict when it ends, so the 05:00 BrainAutopilot run leaves a graded file with nobody reading it.

The Board 14 loop spec (docs/boards/board-14.js, key loop), part by part, checked on 2026-09-25 against the code and the tests:

- (a) the gaps source. Already landed: every line of state/self/gaps.jsonl with a trial, ordered by distance to the bar over trial minutes; the ledger is rebuilt at the start when older than 24 h; a dead-share gap goes to self/prune.mjs (refused at the ceiling on the real tree, because the prune writes under organism/, unless --allow-organism). Tested by "a gap candidate flows from the ledger to the decision line". Fixed: nothing. Added: nothing.
- (b) the walls. Already landed: ceiling, patch (an operator of self/operators.mjs), evidence (self/improve.mjs on a copy), gate (the real gate on the tree, RED reverts byte for byte), record (operator, before, after, noise on the decision line; a keep appends "organism (<operator>)" from "gaps:<id>" to state/self/authored.jsonl). Tested by the flow and the authorship tests. Fixed: nothing. Added: nothing.
- (c) the budgets. Already landed: --soak, --model-calls (12 per hour of soak), --trial-minutes (10), at most 2 copies alive (SOAK_MAX_COPIES), each deleted and the deletion verified; state/self/STOP refuses with exit 0; a live bench flag refuses; --resume. Tested by the STOP, --resume and ends-at-its-minute tests. Fixed: nothing. Added: nothing.
- (d) the daemon and /health. Already landed: the self-code step of daemon/run.mjs passes selfCodeSoak, turns the author on when wet and refuses while STOP exists; daemon/health.mjs gapCounters prints gaps {open, withTrial, attempted, kept, closed} (`node daemon/health.mjs --gaps`). Neither had a test. Added: selfCodeCliOpts, a pure export the step now calls, and the step's record carries the soak's verdict (file, isTheBar, barMet); one test reads both, and gapCounters over a planted soak gives 0 open, 1 attempted, 1 kept, 1 closed.
- (e) the ledger rebuilt after every keep, a gap that left it printed CLOSED. Already landed and tested. Fixed: nothing. Added: nothing.
- The bar. Graded by the orchestrator (scratchpad/write-soak.mjs). Added in Board 15: the grader below, and that file rewritten from the same record by it.

What Board 15 added:

- At its end runSoak writes its end lines, its MAGNITUDE and its exit code into its record (state/self/soak-<runId>.json), then grades itself (gradeSoak) and writes bench/verdicts/soak.json when the soak is the bar (60 min or more, the author on, not dry), else bench/verdicts/soak-partial.json (isTheBar false). It prints `VERDICT <file>: isTheBar X, barMet Y (...)`. runSoakFromCli then writes the code bin/brain.mjs exits with into the record.
- The four checks: ranFullWall (status done, no crash, elapsed at least the soak's minutes, exit 0), gapsAttempts (3 or more), gateGreenAfter (exit 0 and a GATE GREEN line), proofSoakExit0 (the newest 1-minute author-off soak on record; a copied .exit file, the process's own code, wins over the record).
- On the real tree the bar is never under 60 minutes; a lower bar is taken only on a planted tree (the tests and bench stage 7).
- A bar file that holds another soak, or another writer's grade of the same soak, is appended whole to bench/verdicts/soak-history.jsonl before it is replaced.
- Every verdict carries the autonomy facts read at its end: the BrainAutopilot task (schtasks, on the real tree only), STOP, the newest decision file and its age, the last gate (gate.json and the last GATE line of docs/LOG.md).
- `node bench/autopilot.mjs --grade-soak <runId|latest>` grades a finished soak from its record and its copied transcript (bench/verdicts/autopilot/*<runId>.out, .err, .exit). No bench runs and no soak starts.
- `node bench/autopilot.mjs --model off` skips the one model call of stage 4b and writes bench/verdicts/autopilot-partial.json (isTheBar false); stage 7, four checks on the grader, runs either way.

Printed on 2026-09-25:

- `node bench/autopilot.mjs --grade-soak 20260924T205054238Z` (through the budget wrapper): "GRADE-SOAK 20260924T205054238Z: isTheBar true, barMet true; wrote bench/verdicts/soak.json, the file it replaced appended to bench/verdicts/soak-history.jsonl", "checks: ranFullWall pass, gapsAttempts pass, gateGreenAfter pass, proofSoakExit0 pass", "baseline kept: 112 of 112 numbers and lines of the replaced bench/verdicts/soak.json", "reproduced from the record: 65 of 66 printed end lines" (the one not in the record is MAGNITUDE: that soak predates the record keeping it).
- AUTONOMY from the same run: task BrainAutopilot registered true, status Ready, next run 9/26/2026 5:00:00 AM; STOP absent; newest decision file bench/verdicts/autopilot/2026-09-25.jsonl (38 lines, age 0.3256 h); gate.json GATE GREEN: test files 89/89, assertions 1141 pass / 0 fail (at 2026-09-24T23:33:19.370Z).
- `node --test test/autopilot.test.mjs`: tests 34, pass 34, fail 0, duration_ms 43608.3903 (the 28 before plus 6 for Board 15). `node --test test/daemon.test.mjs`: 6 of 6.
- `node bench/autopilot.mjs --model off`: "AUTOPILOT PARTIAL: 29/30 checks (1 skipped: --model off)", 49686 ms, exit 0; stage 7: the planted bar-grade soak wrote soak.json barMet true (gap attempts 6, "GATE GREEN: fixture gate", proof exit 0, model calls 0), its control barMet false with 1 history line, the real soak regrades barMet true and agrees with soak.json.

The next bar-length soak, one command; it writes bench/verdicts/soak.json itself:

`node tools/budget.mjs --ram-mb 6000 --disk-mb 2000 --dir state/self -- node --max-old-space-size=6000 bin/brain.mjs self-code --auto --soak 60 --author on --json`

The registered 05:00 tick runs `--soak 90 --author on`, which is bar length, so its soak grades itself into the same file.

## Schedule

`tools/schedule-autopilot.mjs` makes the loop daily, the way tools/schedule-ladder.mjs made the ladder. With no flag it prints the schtasks line and registers nothing:

    schtasks /create /tn BrainAutopilot /tr "cmd /c cd /d C:\Users\ybmic\Downloads\claudeskillsvideo-to-website\brain && node tools\schedule-autopilot.mjs --tick" /sc daily /st 05:00 /f

05:00 is one hour after BrainLadder (04:00). schtasks takes at most 261 characters of /tr, so the task runs a tick (116 characters) and the tick runs the command:

    node tools/budget.mjs --ram-mb 6000 --disk-mb 2000 --dir state/self -- node --max-old-space-size=6000 bin/brain.mjs self-code --auto --soak 90 --author on --json

The tick appends every guard line, the whole transcript and the exit to `bench/verdicts/autopilot/<date>.log` (UTC date), beside the ledger `<date>.jsonl`. It refuses with exit 0 and one printed line, also appended to the log, while:

1. `state/self/STOP` exists;
2. a bench flag is live (`state/bench-flags/<pid>.json` held by a live pid; a dry tick goes on);
3. `--soak` is not landed (self/autopilot.mjs and self/daemon.mjs read no soak option);
4. free RAM stays under 16384 MB for 30 minutes.

`--tick --dry` runs the same wrapper with `--dry --author off` in place of `--soak 90 --author on`: a dry run with the author on would still ask the model. `--status` queries the one task name and prints "not registered", exit 0, when it is absent. `--register`, `--run-now` (it waits up to 3 minutes for the log to grow) and `--remove` act on that one name only. `bin/brain.mjs` now lists no-author among its boolean flags, so `--no-author` no longer swallows the next word.

The header quotes his order of 2026-09-24 12:02 ("Its gotta work without me") as the authorisation, beside the ladder's rule that registering is his call. Board 14's schedule builder did not register it: a builder is a subagent, and its orchestrator's instruction is not his consent. One command, run by him or by his own session, registers it:

    node tools/schedule-autopilot.mjs --register

`node tools/schedule-autopilot.mjs --bar` (verdict bench/verdicts/schedule-autopilot.json, 2026-09-24T18:44:10Z) printed BAR NOT MET, 3 of 5 checks:

- registered, ready: FAIL. `schtasks /query /tn BrainAutopilot /fo LIST` printed "not registered".
- The direct run of the dry command, through the same budget wrapper: exit 0, 1639 ms, peak ram 117.5 MB by the wrapper's line. 105 candidates (notes 76, imagine 1, census 23, slow 5), 105 refused, would apply 0, 0 model calls. The day log went from 1930 to 3860 lines; the ledger stayed at 22 lines, because a dry run writes no ledger line.
- The control, the same dry tick on a temp tree with state/self/STOP planted: REFUSED (stop), exit 0, its log 0 -> 1 lines, temp tree deleted.
- The share names boards 8 to 12: 0/280.
- Were the task registered, its 05:00 run today would print "autopilot tick refused: --soak is not landed yet" and start nothing. Board 14 wave 2 adds the option; until then a registered task writes one refusal line a day.

Tests: `node --test test/schedule-autopilot.test.mjs test/authorship.test.mjs` 14 of 14 in 620 ms. They never register or remove a task. They cover the printed command (05:00, the budget wrapper, STOP, /tr within 261), `--status` on an absent name ("not registered", exit 0), each guard on a planted tree, a STOP tick from the CLI, a dry tick through a fake wrapper, the bar on a planted tree, the boolean no-author with a value flag as control, and docs/BOARDS.json against the tree and its named commits. A mutation pass broke 7 behaviours one at a time (no-author a value flag, the STOP guard off, 06:00, `at` ignoring docs/LOG.md, "not landed" counted, STALE not printed, skipped items dropped): each was caught by at least one failing test, and each file was restored byte for byte. test/autopilot.test.mjs and test/ladder.test.mjs: 42 of 42.

## Open

- The real tree's census is pinned: every prune there is refused at the patch wall, because the seed is re-emitted whole by genome/emit.mjs --prune and the autopilot does not author that call. A census source that runs the emitter on a copy, then gates the re-emitted seed, is the next wall.
- The model author on the real tree: the 60-minute soak asked qwen3:30b-a3b 8 times (7 answered, mean 93.72 s) and none of its patches was kept; the one keep of that soak was knob-tune on test/multiply.test.mjs (30440 to 29930 ms against a bar of 15000).
- The imagine patches on the real tree were stale when last read (test/grid.test.mjs already passes), so they are refused before any copy; stage 3 on 2026-09-25 read imagine 1.
- A weakened source (not test) change that keeps every test green is kept. The gate is only as strong as the suite; the mutant bench is what measures that.
- The proof check reads the newest 1-minute author-off soak on record (20260925T203706836Z on 2026-09-25). Nothing re-runs it daily, so that proof ages while each day's soak cites it.
- A soak's own verdict is written before its process exits, from the code runSoak returns (the verdict names that source). The 05:00 tick logs to bench/verdicts/autopilot/<date>.log, not to <anything><runId>.exit, so a regrade of a tick soak also has no process exit file to read.
- A --model off run of the bench is never the bar. The last bench run with the model asked is the Board 14 one in bench/verdicts/autopilot.json (26 of 26, 2026-09-24T20:40:41.877Z).
