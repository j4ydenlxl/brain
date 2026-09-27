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
