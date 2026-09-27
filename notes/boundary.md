# notes/boundary.md

Board 12, item boundary. Owner of `tools/boundary-audit.mjs`, `test/boundary.test.mjs`,
`bench/verdicts/boundary.json`, `bench/verdicts/boundary-before.json` and this note. No model
calls were made.

## What it does

- `--static`: a small lexer skips comments and prose, then lists every postMessage (worker
  sources in strings included), workerData with its transferList, process/fork send and
  structuredClone: 76 boundaries in 20 files.
- `--probe`: the same file preloads through `NODE_OPTIONS=--require` into every process and worker
  thread and measures each message: the buffers a clone copies, a view counted as its whole
  buffer, wasm memories tracked. 28 drivers (12 test files, 16 functions, with faults that
  reach the error posts) measured 75 boundaries live and 1 from its literal value.
- `--bar`: rescans, reprobes, checks the ALLOWLIST (key: file, kind, expression; line free).

## Numbers (bench/verdicts/boundary.json, 2026-09-24T14:24:37Z)

- Copied buffers, the cap measure: largest 1,048,576 B (the deliberate calibration post);
  0 boundaries at the 16 MB cap; 0 wasm heap views, before and after. Fixed: 0, so no owned file
  was edited. Earlier builders already route hypervectors through ownBytes.
- Control: a real core/simd.mjs view posted unpacked is flagged and costs the whole heap.
- The wire size (strings included) is reported but is not the cap measure. It reads 1.0911 of
  v8.serialize. runtime/shard.mjs:474, the shard snapshot, is 28,041,254 B at the live-shards
  bench default (majors 1000, units 256) and 2,996,732 B at majors 100. It is not my file, and
  only tests call Cluster.snapshot. bench/live-shards.mjs:124 is 13.9 MB on the wire, which is
  near the cap.
- test/boundary.test.mjs 9/9; a boundary planted in the tree turns the GATE red.
- Peak RAM of the bar: 1146.4 MB.

## Measured (board 23, item boundary, 2026-09-27T00:48:22.742Z, Node v24.15.0, model off)

- Read first: the header of tools/boundary-audit.mjs, this note, docs/CLOUD-SESSION.md lines 104 to 197,
  the driver code (runOneDriver waits for 16384 MB free, 300 s driver timeout) and the host fixture
  notes at the top of test/autopilot.test.mjs (the WAIT_FREE_RAM_MB 16384 wait the cloud probe hit).
  Free RAM here read 35714 MB before the probe, so the wait did not bind.
- Before: test/boundary.test.mjs 8 of 9 (GATE case: test/autopilot.test.mjs:108, :109 postMessage in
  a worker source and :112 workerData unlisted); --static 76 boundaries, allowlist unlisted 3.
- Probe with 'autopilot' in TEST_DRIVERS alone: measured live 2, test/autopilot.test.mjs:109 (the
  worker's `{ error }` post) unexercised, because it runs only when the worker's import fails. Fix: one
  fault driver, `test-autopilot-url` (fault 'url', the pattern of grid-url, imagine-url, public-url,
  self-code-url), in DRIVERS beside TEST_DRIVERS. Probe of both drivers: test-autopilot 34 of 34,
  test-autopilot-url 32 of 34 (the 2 fail by design under the fault), measured live 3, 15.66 s wall,
  peak 591.6 MB.
- Allowlist entries pasted from --print-allowlist --label autopilot: :112 workerData copied 0 wire 848,
  :108 copied 0 wire 17560, :109 copied 0 wire 757.
- Bar (the verdict's command, wrapped in budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts):
  76 boundaries, 30 drivers, probe 74, literal 2, unexercised 0, over cap 0, allowlist 76 listed,
  unlisted 0, stale 0, isTheBar true, barMet true; wall 86.39 s, peak 1419.8 MB (outer), 1154.9 MB
  (inner). The verdict now carries splitFor's split object (heldOut n 0, "none: an audit of every
  boundary in the tree has no set it was not written against"), so CONTAMINATION no longer names it.
- Gate BOUNDARY row, computed alone from the new verdict: GREEN, 76 against 76 listed, unlisted 0.
- test/boundary.test.mjs 11 of 11: added (a) every test file holding a boundary is a plain driver and
  one holding a worker source also has a fault driver, with two controls (without the autopilot pair
  both checks name it; without only its fault driver only the second does); (b) splitFor's split
  passes the gate's own contaminationRow and the same verdict without it is a cause.

## Measured (board 23, item boundary, fix pass, 2026-09-27T00:57:14.034Z, Node v24.15.0, model off)

- Read: the verify plane's four findings, runOneDriver and the bar function of tools/boundary-audit.mjs
  (lines 813 to 1060), test/autopilot.test.mjs lines 95 to 118 and 599 to 651.
- DRIVERS line `test-autopilot-url` kept, not reverted: the file is owned, test/autopilot.test.mjs:109
  runs only under the url fault (no literal value: `String(e.stack)`), and test/boundary.test.mjs case
  (a) requires a fault driver for a test file holding a worker source. Reverting it leaves the row
  unexercised and barMet false. It sits outside TEST_DRIVERS and ALLOWLIST: the orchestrator accepts or
  reverts it.
- test-autopilot under the probe: exit 1, 34 tests, 33 pass, 1 fail, in this run and in the verify
  plane's. The failing case (verify plane: test/autopilot.test.mjs:643) asserts a wall-clock decision,
  'kept' only when the patch runs at least 20 percent faster, so a loaded machine turns it to 'refused'.
  Not owned here; the boundary rows it reaches (:108 json post, :112 workerData) are measured whether the
  assertion passes or not, and the driver exit code is not in barMet.
- The verdict statement quotes the probe's message record count and the 16777216 byte cap, which the
  --bar output does not print (the statement template and the say lines are outside the owned regions).
- Bar re-run: 76 boundaries, 30 drivers, probe 74, literal 2, unexercised 0, over cap 0, allowlist 76
  listed, unlisted 0, stale 0, test/boundary.test.mjs 11 of 11, barMet true, isTheBar true; wall 89.19 s,
  peak 1434.6 MB (outer), 1164.1 MB (inner).

## Measured (board 23, item boundary, second fix pass, 2026-09-27T13:36:53.168Z, Node v24.15.0, model off)

- Read first: the verify plane's findings (80 boundaries, unexercised 4, unlisted 4, tests 9 of 11), the
  runJobs function and the worker block of generations/plateau.mjs, test/plateau.test.mjs (the wire test
  and the runJobs test, whose bad job rejects through the worker's `{ error }` post), this tool's DRIVERS,
  bar() and ALLOWLIST, test/boundary.test.mjs and bench/gate.mjs boundaryRow. No published method applies
  (a missing driver and allowlist entry), so no web page was read.
- Before, on the live tree: --static printed 80 boundaries in 24 files (structuredClone 1), allowlist
  unlisted 4, stale 0. The four are board 24a's untracked files: generations/plateau.mjs workerData
  `{ plateauJob: job }`, postMessage `{ result }` and `{ error: ... }`, and test/plateau.test.mjs
  structuredClone `matrixToWire(a.searched)`, the first test file whose only boundary is a clone.
- Fix: 'plateau' added to TEST_DRIVERS (its test reaches the error post itself, so no fault driver is
  needed); probe --label plateau --only test-plateau: 17 of 17, measured live 4, 5 message records;
  --print-allowlist entries pasted: `{result}` copied 0 wire 1523, `{error}` copied 0 wire 372,
  workerData copied 13592 wire 14376, structuredClone copied 9488 wire 9884.
- test/boundary.test.mjs 12 of 12: added one case, undriven meets all four kinds a test file can hold
  (clone, worker source, workerData, send): each needs a plain driver, only the worker source a fault
  driver, a fault driver alone is not a plain driver, and the live tree's test files hold at least two
  kinds. Mutant control: 'plateau' dropped from TEST_DRIVERS gives 10 of 12 (both driver cases fail).
- First bar: barMet false, unexercised 3, orphan sites 3. Board 24a edited generations/plateau.mjs during
  the run: the scan read lines 538, 552, 554 and the probe measured 578, 592, 594. Cause read after: the
  file's mtime moved twice more within 3 minutes. Waited for a 240 s quiet window on both plateau files.
- Second bar (same command, wrapped in budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts):
  80 boundaries, 31 drivers, probe 78, literal 2, unexercised 0, orphan sites 0, over cap 0, allowlist 80
  listed, unlisted 0, stale 0, test/boundary.test.mjs 12 of 12, barMet true, isTheBar true; wall
  119.53 s, peak 1452.1 MB (outer), 1150.3 MB (inner). Plateau file mtimes unchanged across the run.
- Gate BOUNDARY row computed alone with the gate's own live scan: GREEN, 80 against 80 listed.
- Coupling: the five new lines are true only while board 24a's plateau files exist. If those files do
  not land with this change, the four entries go stale and the test-plateau driver has no file: red.

## Measured (board 26, item boundary-statement, verdict at 2026-09-27T18:38:30.242Z, Node v24.15.0, model off)

- Read first: the header, bar(), summarize(), loadProbe() and the probe's record rule of tools/boundary-audit.mjs,
  bench/verdicts/boundary.json (keys, touched, tests, statement), this note, bench/gate.mjs boundaryRow and
  self/gaps.mjs (its parser reads the "unlisted N, stale N, over cap N" line, left unchanged). No published
  method applies (a statement template), so no web page was read.
- The four open defects, as found: the statement said "1318 message records" (res.probe.measured, never
  printed and not a verdict field; the verdict's own summary.messages read 1631, a different measure: the
  probe writes a record for a site's first 32 messages per thread, then powers of two, a larger message or a
  new wasm view, while messages sums the per-thread counts); "16777216 byte cap" (verdict.cap, never printed);
  "Touched tests: test/boundary.test.mjs 12/12" while verdict.touched was [] (testsOf always adds this tool's
  own test). Plateau: generations/plateau.mjs and test/plateau.test.mjs are tracked since 54ed113; git status
  --short prints " M" for both (board 24a's working tree edits), so the four plateau ALLOWLIST entries and the
  test-plateau driver no longer depend on untracked files.
- Fix: statementOf(verdict) builds the statement from the verdict object alone and records the field path of
  every number in order; bar() keeps every line it prints (verdict.printed), prints the cap, the record count,
  the message count and the fixed count, adds summary.kinds, probe.measured and why to the verdict, and runs
  auditStatement: each number token must equal its field and appear in a printed line, and no touched claim
  may stand when touched is []. A failed audit sets barMet false. The touched clause is omitted when touched
  is empty; the re-run tests are labelled "Tests re-run by the bar".
- test/boundary.test.mjs: two cases added (14 cases). One parses the real verdict's statement with its own
  regex and holds each of its numbers to its field and to a printed line; one plants a verdict with other
  counts (4242 records, cap 65536, 3 drivers, no before run, a skipped test, a touched file, barMet false) and
  holds its statement to the planted fields, with three controls: a literal "1318 message records" appended is
  unsourced, a field changed after the statement was built is unsourced, a touched claim with touched [] is
  caught. Both new cases failed on the board 23 verdict (first bar pass, tally 11 of 14) and pass after it.
- First bar pass: barMet false with unexercised 2 and orphan sites 2: bench/grid.mjs was being edited by
  another builder during the run (scan read lines 120 and 141, the probe measured 160 and 183). Waited for a
  240 s quiet window across the 24 boundary files (572 s), then re-ran.
- Second bar (the verdict's command wrapped in budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts):
  80 boundaries, 31 drivers, 1660 message records, 2193 messages, probe 78, literal 2, unexercised 0, orphan
  sites 0, over cap 0, cap 16777216 printed, allowlist 80 listed, unlisted 3, stale 3; statement 35 numbers,
  unsourced 0, unprinted 0, touched claim false; test/boundary.test.mjs 13 of 14; isTheBar true, barMet false;
  wall 155.66 s, peak 1351.8 MB (outer), 1111.3 MB (inner); boundary file mtimes unchanged across the run.
- barMet false is the tree, not the statement: the unlisted and stale pairs are bench/imagine.mjs:145 and :157
  (board 24a, not allowlisted here by order) and bench/grid.mjs:236 workerData, whose expression another
  builder changed in its uncommitted edit; the one failing case is GATE, naming those three sites.

## Measured (board 26, item boundary-statement, fix pass, verdict at 2026-09-27T18:52:05.356Z, Node v24.15.0, model off)

- Read first: the verify plane's findings, bar(), aggregate(), summarize(), probeRun() and scanTree() of
  tools/boundary-audit.mjs, bench/gate.mjs boundaryRow and its isMain guard, self/gaps.mjs (the boundary
  parser reads "unlisted N, stale N, over cap N", unchanged), the tools/budget.mjs flags. Published way read:
  Bazel's "input dependency was modified during execution" check, which confirms a change against the file's
  content digest, not a metadata proxy such as mtime (web search, one page of results).
- Why the race recurs: board 23 (generations/plateau.mjs) and board 26 (bench/grid.mjs, then bench/imagine.mjs)
  each had a builder edit a scanned file while the bar ran; the scan read one set of lines, the probe
  another, and the bar printed orphan sites with no cause. Fix: scanTree(root, { fingerprint }) records the
  sha1 of every file it reads; bar() hashes the tree at its static scan and again after the probe;
  stillTreeOf names the moved files, those holding a boundary, and the tree orphan sites inside them. It is
  printed ("still tree: ..."), stored as verdict.stillTree, quoted in the statement from its fields, and a
  moved file holding a boundary adds a why reason (barMet false).
- BAR_COMMAND: the space before its quote restored, and it now carries the board budget (--ram-mb 4000,
  --max-old-space-size=4000, disk cap 2000 MB on state/boundary, wait for 16384 MB free). The bar was run by
  exactly that command, with no outer wrapper, so the verdict command is the command that ran.
- bench/grid.mjs:236 workerData: another builder added `fallback: cfg.fixedVocab ? false : undefined`, so its
  key moved (~420d5966c479 to ~a2d36b3f2cff). Its ALLOWLIST entry re-measured by the probe (drivers grid,
  grid-poison, grid-url): copied 0, wire 11533. The bench/imagine.mjs entries are left to the orchestrator.
- test/boundary.test.mjs: two cases added (16 cases). The still tree on a planted tree: a line inserted above a
  boundary moves its scanned line from 2 to 3; an edited, an added and a removed file are moved; only moved
  files holding a boundary are the race; one orphan in a moved file counted; controls: a second scan and an
  mtime-only re-stamp move nothing, and the same edits with no boundary are moved but not the race. The bar
  command case: one space between words, budget.mjs first, RAM cap at most 4000, disk cap on state/boundary,
  heap no larger than the RAM cap, verdict.command equals BAR_COMMAND, the printed still tree line and the
  statement match verdict.stillTree, why names the race exactly when a boundary file moved, and a planted
  moved tree gets its own statement.
- First bar (BAR_COMMAND): 82 boundaries, still tree 538 files, changed 1 (tools/organism-census.mjs),
  holding a boundary 0; unexercised 8 (all bench/imagine.mjs, mid edit); allowlist unlisted 6, stale 4;
  wall 123.44 s, peak 1127.1 MB.
- Second bar (BAR_COMMAND, after the grid entry): 82 boundaries in 24 files, 31 drivers, 1714 message
  records, 2247 messages (the count moves run to run: drivers are timed tests), probe 79, literal 2,
  unexercised 1 (bench/imagine.mjs:237), orphan sites 0, over cap 0; still tree 538 files, changed 5
  (bench/imagine.mjs, bench/site-ask.mjs, test/census-static.test.mjs, test/census.test.mjs,
  test/dead-share-all.test.mjs), holding a boundary 1 (bench/imagine.mjs, mtime 14:53:40 EDT inside the
  run); allowlist 80 listed, unlisted 5, stale 3, all bench/imagine.mjs; statement 39 numbers, unsourced 0,
  unprinted 0; test/boundary.test.mjs 15 of 16 (GATE, bench/imagine.mjs only); isTheBar true, barMet false;
  wall 140.63 s, peak 1181.8 MB.
- barMet false is bench/imagine.mjs alone (board 24a still editing it; its ALLOWLIST entries are the
  orchestrator's). After it lands: --print-allowlist the imagine rows into ALLOWLIST, re-run BAR_COMMAND in a
  window where the still tree line reads holding a boundary 0.
