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
