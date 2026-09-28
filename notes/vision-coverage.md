# vision-coverage: the interpretation's numbered map against his words and the orders (board 31)

Author: board 31 builder, item vision-coverage (a re-run: the first builder died on the session limit and left
test/vision-coverage-rows.json; what was useful in it was re-checked and moved into the audit, and the file is
deleted), then a FIX PASS after the verify plane. His paste, 2026-09-27 between 15:09:53 and 15:13:47 EDT: "here
this is an interpretation of the manual:" (MANUAL.md section A, line 393).

## What landed

- `test/vision-coverage-bar.mjs`: THE BAR. It holds the audit as authored data (AUDIT at the bottom: a verdict per
  row, the drafts 44 to 58 with the files, stamps and fragments each status was read from, the drift list, his
  words no row maps), measures every claim against MANUAL.md section A, docs/VISION.md section 3,
  docs/INTERPRETATION-2026-09-27.md and the cited verdict files, prints what it measured, and writes the verdict and
  the md from those measurements. barMet is true only when all eight clauses fail 0: quotes, dates, rows, orders,
  coverage, drafts, status, statement. Not a node:test file; under a node --test runner it writes nothing.
  Run: `node tools/budget.mjs --ram-mb 4000 --disk-mb 50 --dir <scratch> --record <scratch>/budget.json -- node --max-old-space-size=4000 test/vision-coverage-bar.mjs`
- `bench/verdicts/vision-coverage.json`: isTheBar true; clauses (each with checked and failed), problems, rows,
  counts, drafts, status (each source read at its stamp, on disk or from git history), drift and driftKinds,
  numbering, notInInterpretation, control and its result, printed (the bar's own lines), statement.
- `docs/research/vision-coverage.md`: the table, the draft orders in one pasteable section, the status sources as
  re-read, the drift list with its kinds, the numbering faults, his words no row maps, the control, the count line.
- `test/vision-coverage.test.mjs`: re-measures every claim with its own readers (line scan, grep -F -c, its own
  at-stamp reader with the git-history fallback, its own absence scan), recomputes each bar clause and barMet,
  rebuilds every printed line, checks every number in the statement is printed, checks the verdict equals the
  bar's AUDIT, and shows each check failing on a bent copy.

## Fix pass (verify plane, four findings)

1. "13 of them softer" was printed by no command: the bar now prints `drift 23 by kind: softer 13, ...`, the
   statement is built from printed values, and the statement clause fails any number the printed lines lack.
2. The command named a deleted scratch generator: the bar is now `test/vision-coverage-bar.mjs`, on disk and
   re-runnable (the test-name precedent: test/published-rows-bar.mjs, test/dead-share-bar.mjs).
3. The status test asserted nothing: test 11 now fails on a fragment missing at the stamp, a stamp found on neither
   disk nor git history, a stamp after statusAsOf, a status number no fragment carries, a "no isTheBar" or "absent
   in" claim that does not hold, a file claimed but not read, and an absent term named by a verdict stamped at or
   before statusAsOf; 8 bent copies each fail for their own cause, and the git-history path is exercised on a
   committed gate.json revision (found, and a fragment not in it fails).
4. barMet was checked against two counts: test 12 recomputes all eight clauses and asserts barMet is exactly
   "every clause at 0"; 8 bent copies each fail their own clause and turn barMet false.

## Measured

- Read before the fix: the four findings; the prior test, notes and verdict; bench/gate.mjs (it runs only
  `test/*.test.mjs`, line 1075); tools/budget.mjs usage (`--record` to keep the run record out of state/).
- Research (bounded): Node test runner discovery, https://nodejs.org/api/test.html : a bare `node --test` also
  matches `**/test/**/*.{cjs,mjs,js}`, so the bar guards on NODE_TEST_CONTEXT and writes nothing under a runner.
  Method research from the first pass stands: requirements traceability (TestRail,
  https://www.testrail.com/blog/requirements-traceability-matrix/ ; NASA SWE-052,
  https://swehb.nasa.gov/spaces/7150/pages/16450285/SWE-052+-+Bidirectional+Traceability+Between+Higher+Level+Requirements+and+Software+Requirements ).
- The status clause failed once on real data before the fix landed, and that was read before fixing: the first
  run printed `status: ... failed 1` because bench/verdicts/grok-bot.json was rewritten (2026-09-27T23:45:29.493Z
  to 2026-09-27T23:57:17.200Z) and the old stamp was untracked, so on neither disk nor git history. Draft 49 was
  re-read at the new stamp ("Of 54 measures, 3 have a number on both sides") and statusAsOf set to the re-read,
  2026-09-28T00:02:48.739Z. Read once more after: the re-run printed `failed 0`, grok-bot still at 23:57:17.200Z.
- Status numbers no fragment carried (found by the new number check, fixed by adding the exact fragments read from
  each file): draft 44 census-all.json ("20 of 20 counted seeds", "Skipped (4)", "over --max-cells 1000"), draft 52
  compress.json ("against a bar of 5"), draft 53 ladder.json ("1189 of 1319"), draft 55 native.json ("the bar is
  100").
- Two stored lines were wrong in the prior verdict and are now computed: row 122 pointed at the 2026-09-18 copy of
  its quote (line 225), the dated one is line 359; "Also never stop. Just build" pointed at line 166, the
  2026-09-27 15:05 re-send is line 383.
- Printed by the bar: "Rows 123: CARRIED 77, PARTLY 23, UNCARRIED 3, NOT FOUND 0, QUESTION 20. Quotes checked
  194, failed 0. Drafts 44 to 58 (15) cover 26 PARTLY and UNCARRIED rows. Drift 23."; "drift 23 by kind: softer
  13, ..."; "control: fragments 85 of 145 found; row 36 quote "did a lot of work get done?" count 0"; "status:
  sources 22 read at their stamp (22 on disk, 0 from git history), fragments 45, status numbers 36, absent terms 9
  over 441 verdict files (0 named after the audit), failed 0"; "barMet true".

## Open

- The drafts 44 to 58 are for the orchestrator to paste into docs/VISION.md section 3 (docs/ is not this item's).
- Five cited stamps are on disk only, not committed: gate.json, act-web.json, grok-bot.json, ns.json,
  vision-count.json. Commit them with this board: a stamp rewritten before it is committed is on neither disk nor
  git history, and test 11 then fails until the bar is re-run with that draft's status re-read.
- Draft 47 names an ASSUMPTION needing his word: the execution freeze on the trader is in the ORCHESTRATOR'S READINGS
  of section A, not in his words; order 36 cannot be MET while order 35 stays FROZEN.
- Drafts 45 and 53 name two more ASSUMPTIONS: "Warp tesseract sixth dimension." and "conscious" have no measure yet.
- The order quotes in VISION.md section 3 were not audited byte for byte against section A (order 6, for one,
  quotes "Its gotta be a genius"; his line is "The Brain is supposed to be a genius."); a follow-up item can run the
  same checker over section 3.
