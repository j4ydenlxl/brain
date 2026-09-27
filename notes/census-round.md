# census-round: the census round inside the soak (board 23, item census-loop)

Author: board 23 builder. His words, 2026-09-24 12:02: "Its gotta work without me ... EVERY GAP should be able to be filled by itself". And 2026-09-26 10:51: "it needs to adapat and generate cells or smthn". Board 20 left two open items in notes/spawn-census.md: the loop did not call the round, and a kept cell was never promoted into the organism the loop keeps. This item closes both.

## What exists

- `self/autopilot.mjs runSoak` calls `self/census-round.mjs soakCensus` once per soak cycle.
  - The call comes right after the soak reads its ledger rows (`state/self/gaps.jsonl`, rebuilt when stale).
  - The budget is the soak's own:
    - wall: `--census-minutes`, default a quarter of the soak, at least 2 and at most 10 minutes, never past the soak's deadline.
    - RSS: `--census-ram-mb`, default the soak's heap (`--soak-heap-mb`, else 2048).
    - rounds: `--census-rounds`, default 200.
  - `--census-round off` is the control. A `--sources` list without `census-round` also turns it off.
  - A resumed soak keeps its settings and never runs the round twice.
  - The report goes where the soak already writes its report:
    - `censusRound` in the soak record (`state/self/soak-<runId>.json`) and in the CLI answer.
    - One `census-round` decision line in `bench/verdicts/autopilot/`.
  - Test seam: `o.censusModule`.
- `soakCensus` runs rounds on every red bench of that ledger that has a model-off item source (`redBenches`: one bench per item source, in ledger order; the first is `pickBench`'s pick). The model is off.
- THE PROMOTION RULE (`promotionOf`), per real arm. A spawned circuit is promoted only when all of these hold:
  - its bench improved (after above before);
  - the round kept it (no development item lost, no control row lost);
  - the firing census says every spawned cell ran on at least one item the round gained. `cellsScore` hooks `brain.hooks.afterTick` and records which watched cells fired while each item was answered. `ranOnGained` counts gained items only.
  - Everything else is discarded.
- `promoteKept` builds the promoted organism before anything touches the live file:
  - It starts from the census start and grows exactly the promoted circuits (one `cell.add` proposal each, `census.promote`) on a stage.
  - It restores the stage from disk and grades it again. The bench must move, no item may be lost, no control row may be lost, and every promoted cell must run again.
  - Only then does it write over `state/<name>/snapshot.json`, and only if the live bytes still hash to what the census copied at open.
  - It keeps the replaced bytes under `state/self/census-promoted/` (the newest 7).
  - A dry soak promotes nothing.
- Inside the loop, held-out grading is off (`openCensus heldOut:false`), so a soak does not spend its wall planning items it does not decide on.
- `bench/census-round.mjs` is the bar. It runs one `--soak 2` cycle through the CLI in two identical tree copies holding one seeded organism: first the control (`--census-round off`), then the round. It then grades each kept cell's bench on the organism each soak kept.
- `test/census-round.test.mjs`: 7 tests.
  - The call happens once per cycle (a spy), with the soak's rows and budget.
  - The control and `--sources` never call it.
  - A census that throws becomes the report's why.
  - A no-improve arm is discarded (by the rule, and by a real arm that did not move).
  - A never-ran arm is discarded (by the rule, and by a real arm grown with a planted idle cell: the bench moved 0 -> 20 through the real cell, and the idle cell fired on 0 gained items).
  - The report shape comes from a real soakCensus, including the write, the backup and a second cycle at its fixed point.
  - A live file changed mid-cycle is not overwritten.
  - Mutants, each run against this file: calling the census twice per cycle, ignoring the soak heap, dropping the improvement check, dropping the ran check, turning the firing census off, and dropping the hash guard. 6 of 6 were killed.

## Measured

- The bar ran under `node tools/budget.mjs --ram-mb 4000 --disk-mb 400 --dir <copy> -- node --max-old-space-size=4000 bench/census-round.mjs`. Verdict at 2026-09-27T01:36:10.327Z (the fix-pass re-run), node v24.15.0.
  - Copies: 2 x this tree, 142.4 MB together. The same seeded organism 5714e1b44042 was in both.
  - Control soak: exit 0, 120.4 s. `CENSUS ROUND off: --census-round off`. The organism was unchanged (5714e1b44042).
  - Round soak: exit 0, 120.4 s. The round soak line prints `ledger 252 rows, 33 red`. The bench was `missed:grid-library.json` (grid primitive, ARC-AGI-1 training, 386 development items). Census open took 22.7 s.
  - The round ran 15 rounds and spawned 15 arms (31 cells). It kept 14, discarded 1 and promoted 14, and the promotion was written.
    - The discarded arm was round 11, `training/aabf363d`: its bench did not improve (12 -> 12).
    - The census placebo spawned 14 and kept 4.
    - The census took 23.2 s at a peak RSS of 369 MB.
    - It stopped because every development item that the held cells miss and the operator expresses had been tried, not because of the wall.
  - Promotion re-grade from disk: bench 0 -> 16 of 386, controls 30/30, cells 17 -> 46. The organism went 5714e1b44042 -> 5d72d3f437cd.
  - Against the control, on the 386 development items: control 0, round 16, delta 16. 16 items gained, 0 lost. Every kept cell ran on an item the round organism gained over the control: true.
  - barMet true, contaminated no. Peak 143.4 MB under the copy dir (over 100 MB), and the copies were deleted. Budget: peak RAM 507.3 MB, wall 267.24 s.
- `node --test test/census-round.test.mjs`: 7 pass, 0 fail (the report-shape test now also asserts the printed line carries `ledger 5 rows, 4 red` and prints `?` for an unread ledger; the mutant that drops the ledger clause from censusLine fails it, 6 pass 1 fail). `node --test test/spawn-census.test.mjs`: 8 pass, 0 fail.
- `node --test test/autopilot.test.mjs` (34 tests):
  - Run 1: 33 pass, 1 fail. The failure was the wall-clock slow test ("at least 20 percent faster"), which is in runAutopilot, not runSoak.
  - Runs 2 and 3: 34 pass, 0 fail.
  - Baseline on the original self/autopilot.mjs: 34 pass, 0 fail (one run).
  - Separately, a run with TEMP pointed deep inside the session scratchpad failed 6 soak tests with ENOENT on mkdtemp: the soak copies passed the Windows path limit. Runs with the default temp dir did not.
- Fix pass (verify plane): the first verdict statement published "246 ledger rows (32 red)" but no line the bar printed carried the red count. Read why: the statement took `r.red` from the soak JSON while `censusLine` never printed it. Fix at the source: `censusLine` (self/census-round.mjs) now prints `ledger N rows, M red`, the bar prints it on its `round soak:` line, and the statement uses exactly those two fields. Read once more after: the re-run printed `ledger 252 rows, 33 red` and the statement says `252 ledger rows (33 red, ...)`. The ledger had 6 more rows on the re-run (246 -> 252); where they came from was not measured.
- The first bar run found a defect: the copies left out `bench/fixtures/answer-questions.json`, which the control rows read, so the census could not open (ENOENT). The copy now puts that file back beside `bench/fixtures/public`. The 371 MB wiki store is not put back.
- Read before building:
  - `self/census-round.mjs` (header, openCensus, runArm, the keep rule)
  - `self/autopilot.mjs runSoak` (ledger read, budget, record, the soak CLI child)
  - `notes/spawn-census.md` (its open items 1 and 2)
  - `bench/verdicts/spawn-census.json` (20 rounds, 14 kept against 4 placebo)
  - `docs/CLOUD-SESSION.md` (the queue)
  - `genome/spawn.mjs grow`, `act/spawn.mjs spawnAsk`, `core/brain.mjs hooks.afterTick`
  - `self/improve.mjs COPY_EXCLUDE` (the tree's own copy rule, reused by the bar)
  - `tools/budget.mjs` (header)
- Published practice: Voyager (Wang et al. 2023, arXiv 2305.16291) adds a program to its skill library only after self-verification says it ran and succeeded. The promotion rule here is that idea on cells: the bench must move, and the census must show the cell actually ran on what moved.

## Open

1. Held-out items are not graded inside the loop. The held-out grade of census rounds is still `bench/spawn.mjs --census` (`bench/verdicts/spawn-census.json`). A promoted organism's held-out score is not measured by this bar.
2. The bar's copies seed the organism (seeds/basic.mjs) because the live `state/` is off limits. On his machine, the soak grows the live `state/dilation/snapshot.json`, which starts from wherever it is.
3. Only one red bench had a model-off item source in the copy's ledger (`missed:grid-library.json`). The sequence and algebra benches are graded only by the tests. Word-problem and knowledge benches have no model-off source (`BENCH_KINDS`).
4. On this bench, the census stopped after 23.2 s of its 1.99-minute wall (24.4 s on the first run): no target was left. Whether a second cycle on the promoted ARC organism spawns anything is not measured here. The test's second cycle on the sequence and algebra benches spawned 0.
5. The slow test in test/autopilot.test.mjs is wall-clock based and failed once in 3 runs of the file with this change (0 of 1 on the baseline). It does not touch runSoak.
