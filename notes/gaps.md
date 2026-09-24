# notes/gaps.md: every gap one ledger line, each with a bounded trial (board 14 builder)

## Files

`self/gaps.mjs` (the ledger; `--dry`, `--json`), `bench/gaps.mjs` (the bar), `test/gaps.test.mjs`,
`test/gaps-plant.mjs`, `bench/verdicts/gaps.json`, `state/self/gaps.jsonl` (at most 7
`gaps-<date>.jsonl` kept), `state/self/gaps-budget.json`.

## Design

A bar file is read by barMet, met, met.bar, bar.met, then its verdict word. knowledge, multiply
and velocity name `bar.met`; public-launch names none, because its bar is prose. The 10 undecidable
files: census-prune, census-scale-pruned, census-scale-static, census, compress-board10,
grid-evaluation, grid, imagine, ladder, public-launch.

Ladder rungs, read from fields only:

| rung | read | gap |
| --- | --- | --- |
| sets.gsm8k, humaneval, arc | bars beside published rows | yes |
| improvement | 0.2777 against 5 | yes |
| target | lastDelta -0.6 against low 5 | yes |
| bytesPerPoint | 59660.533 against 59660.8 | no |
| knowledge.enwiki | not measured | no |

A trial runs in a copy without organism/, state/, bench/fixtures/, web/dist/ or .git/. The
exceptions: the one seed a census reads; arc-agi-1 for grid; answer-questions.json for compress,
daemon and ladder-daily; code-tasks.json for ladder-daily; trader.db for venue.
organism/scale-52000 has trial null (never loaded whole). math, public-gsm8k and public-humaneval
have no dry form, so they are unproved.

## Open

- prune.json was missed (gateGreen false) and has trial null. bench/prune.mjs has one form, and
  its own run took 846.6 s. This gap alone holds the bar NOT MET.
- The compress ratio ranged 2.2034 to 2.8015 over five runs of one form; daemon ranged 1.3526
  to 1.3891.
- The schedule trial reads registration only. Registering the task is his call.
