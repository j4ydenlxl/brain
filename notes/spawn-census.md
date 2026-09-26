# spawn-census: the organism grows its own census (queue item 5, the CLOUD part)

Author: board 20 builder. His words, 2026-09-26 10:51 EDT: "12000 cells is a little isnt it?" and "it needs to adapat and generate cells or smthn".

## What exists

- `self/census-round.mjs`: one round, model off, both arms by the same path.
  - It reads the gap ledger (`state/self/gaps.jsonl`, or `self/gaps.mjs buildLedger` in memory when that file is absent).
  - It picks the first red bench of a typed kind that has a model-off item source.
  - Real arm: one typed cell from the spawn operator (`genome/spawn.mjs plan`, then `grow` through the gate) for the first development item the held cells miss.
  - Placebo arm: a random chain of the same kind and length, drawn from the genome's own ops, grown by the same `grow`.
  - Each arm works on a trial copy of its lineage state directory. The steps are: grow, write the snapshot, restore from disk, then re-run the bench (`act/spawn.mjs spawnAsk`, growth off, so only held cells answer), then run the control rows (`bench/answer.mjs` algebra, sequence and grid, 30 questions through `ask()`).
  - A cell is KEPT only if the bench moved, no development item was lost, and no control row was lost. Anything else is deleted.
- `bench/spawn.mjs --census N` runs N rounds and writes `bench/verdicts/spawn-census.json` (partial under 20 rounds).
- The site: `web/spawn-census.mjs` reads the verdict at build time. `web/build.mjs` injects it into the landing page. `web/src/hud.js censusRows` prints it under the cell count: cells, edges, kinds, kept per hour, placebo, and the verdict's at and file.
- `test/spawn-census.test.mjs`: 8 pass, 0 fail. A mutant with the keep rule as `!regressed` made 2 of them fail.

## Measured (`node bench/spawn.mjs --census 20`, 2026-09-26T21:55:30.548Z, node v24.9.0)

- The bench was `missed:grid-library.json`, kind grid primitive.
  - Development: ARC-AGI-1 training, 386 items.
  - Held out: evaluation, 381 items.
- The real arm spawned in 15 rounds and kept 14. The placebo kept 4.
- Kept per hour of the 97.10 s census wall: 519.04 against 148.30.
- Bootstrap 95% band of the difference: [222.45, 519.04]. Bench noise before any round: 0 and 0 (diff 0).
- The kept lineage grew from 17 cells, 13 edges and 14 kinds to 46 cells, 30 edges and 22 kinds.
- Held out: 0 answered by cells at open and 0 at close.
- Peak RAM was 361.2 MB.

## Open

1. The file is named `spawn-census.json`, not `census.json`. `census.json` is the P8 organism census: the autopilot's census source and `self/prune.mjs` read its liveness bitset.
2. The loop does not call the round yet. That needs one call in `self/autopilot.mjs runSoak` when the author is off, and that file is not this item's.
3. The held-out gain is 0. The genome's grid gene (depth 3, 19 ops) expressed 1 of 381 evaluation tasks and 17 of 386 training tasks. The next rung is a deeper grid gene in `genome/spawn.mjs`.
4. The kept cells live in a copy. Nothing promotes them to `state/dilation`.
