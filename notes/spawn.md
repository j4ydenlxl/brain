# spawn: a question grows the cells that answer it

Board 8, item spawn. His P7 ("cells must spawn when prompted") in the ask path.

## What it is

- `genome/spawn.mjs` reads a question for six features: number, algebra, sequence, grid, text and code. The features select genes from a genome of six, in priority order: `cmp`, `solve`, `arith`, `eval`, `fit`, `program`.
- A gene expresses a small circuit of registered kinds:
  - `num.compare`
  - `sym.solve`
  - `num.arith`
  - `sym.eval`
  - `seq.fit`
  - a grid program chain ending in a `task.tap` read head
- Growth is ONE `cell.add` proposal through `brain.gate`, and only an approved proposal grows. Cells and edges are then built with `Brain.addCell` and `Brain.connect`, the same calls every builder uses. Spawned cells are sealed against co-activation growth, and run on mail only (`period: 'event'`).
- `act/spawn.mjs` works in four steps:
  1. The incumbent circuits (already held) run first, with no proposal.
  2. If none of them carries an answer, the missing circuits are grown and every applicable circuit runs in the same ticks.
  3. A circuit carries when it reproduces every demonstration and emits an answer. When two circuits disagree, nothing carries.
  4. What this ask grew and did not carry is removed as ONE `cell.remove` proposal. What carried is kept.
- The hook in `act/prompt.mjs` is one import line plus one call line at the top of `ask()`.
  - It is on with `spawn: true`, or when the brain already has a `spawn` region.
  - It is off with `spawn: false` or `prose: true`.
  - A decline falls through to the direct route unchanged.
- Removal is tail only. Every cell from the first removed cell to the end of the roster must be in region `spawn`, or the removal is refused with the reason. When a removal goes ahead, `compactTail` renumbers:
  - the roster
  - live edges (rekeyed)
  - clock registrations
  - circuit and region sets
  - signals in flight
  - the outbox
  - co-activation counters
  - the seal set
- A grid program is a trie: cell ids are the op path, so a program that starts with a kept one grows only its suffix and a new read head.

## Measured (`node bench/spawn.mjs`, bench/verdicts/spawn.json, 2026-09-23T20:47:07.659Z, node v24.15.0)

The run asked 30 questions: algebra 10, sequence 10 and grid 10, drawn by `bench/answer.mjs` at `--tasks 10`. Per suite accuracy:

| suite | off | on1 | on2 | spawned1 | spawned2 |
|---|---|---|---|---|---|
| algebra | 10 | 10 | 10 | 3 | 0 |
| sequence | 10 | 10 | 10 | 1 | 0 |
| grid | 10 | 10 | 10 | 26 | 0 |

- Cells spawned: 30 in run 1 and 0 in run 2. Run 2 ran on the cells run 1 kept.
- Run 1 kept 30 cells and pruned 0.
- Gate decisions: `cell.add approved 14`, `edge.grow rejected 2`. The two rejections are co-activation proposals into sealed spawn cells.
- Spawned circuits carried 30 answers on run 1 and 30 on run 2. No model was asked.
- Summed ms per suite:
  - off: 13.62 / 11.81 / 16.17
  - on1: 4.04 / 4.11 / 5.67
  - on2: 0.93 / 1.18 / 3.13

  These timings are not part of the bar. An earlier run the same day printed off 22.44 / 16.45 / 23.27 against on1 7.12 / 6.34 / 10.38, so they are noisy.
- Tests:
  - `node --test test/spawn.test.mjs`: 10 pass, 0 fail
  - `test/act-prompt.test.mjs`: 16 pass, 0 fail
  - perception, public, region, solve and answer tests: 58 pass, 0 fail
- Mutation check: three mutants, each caught by a different test (9 pass, 1 fail each):
  - compaction without edge renumbering
  - losers never pruned
  - tail rule off

## Open

1. **Pruning never fires in the bar suite (pruned 0).** The first binop question arrives after a three-term sum, so the held `eval` cell answers it and `arith` is never explored. Pruning is proven only by the test: a binop on a fresh brain spawned 2, pruned 1 and kept 1.
2. **Grid reuse is structural, not a skipped search.** `searchProgram` still runs on every grid ask. 26 of the 30 kept cells are grid chains, one per distinct program. A recall of a kept chain without the search is the next speedup.
3. **No text or code gene.** A prose or code prompt declines with "no gene serves text" or "no gene serves code". This is the gap to his "god at coding".
4. **Duplicated readers.** The prompt readers (the regexes, `toSym`, `parseGrid`) are copies of act/solve.mjs, because it does not export them. The owner of act/solve.mjs should export them so the two cannot drift.
5. **The wide grid search has no gene.** When the depth-4 search in capability/grid-search.mjs is needed, spawn declines and the direct route answers.
6. **Pruned edges are never freed.** They keep their connectome slots forever. An observer outside core that keeps per-index data would see an index reused after a removal.
7. **Restoring spawned cells needs their kinds loaded.** A snapshot that holds spawned cells restores only after `tasks/sequence.mjs` and `tasks/host.mjs` have loaded, because they register `seq.fit` and `task.tap`.
