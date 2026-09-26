# nextboard (board 15 item, author: board 15 builder)

## What it does
`node self/nextboard.mjs` reads state/self/gaps.jsonl (plus the PROMOTED lines of generations/spread), ranks every gap by normalized distance to its bar over its trial minutes, and writes docs/boards/proposed/board-<N>.md (N = highest board number on disk + 1, board-15b counts as 15) in the grammar self/boards.mjs parses. Then it rescans the board items through self/gaps.mjs writeBoardItems so `brain self-code --auto` lists the proposed items under source boards.

- Ranking: score = min(1, |distance| / |bar|) / trial minutes; a line with no number borrows the distance of a numeric line on the same verdict file, else 1.
- Excluded: no verdict file, no trial and no brief, a trial script that does not exist, lines of a proposed board.
- Selection: the best of each kind first, then by score, at most 3 per kind (lifted under 5), 5 to 8 items; lines sharing a trial command fold into one item.
- Waves: one model item per wave; items with overlapping files move to the next wave.
- One file per day: today's file is rewritten while no decision (autopilot ledger, brief ledger, authored ledger) names one of its items; a board with a decision is never overwritten, the next run takes N+1.
- Item task: GAP, BUILD (gap fields only), BAR (verdict file, bar, trial command), Tests (the tests that import the gap's files), MODEL line, BRIEF for board items.
- Flags: --dry, --json, --root, --min, --max, --per-kind, --pure, --no-refresh, --rebuild, --now.

## Bar (bench/nextboard.mjs, bench/verdicts/nextboard.json)
Printed at 2026-09-26T02:25:01.650Z:
- `3. WROTE docs/boards/proposed/board-17.md: board 17, 8 items (rewrite: ...), 12835 bytes; round trip through self/boards.mjs: ok`
- `2. CONTROL planted root, ledger 185 lines without docs/boards/proposed/board-17.md: board-17 items listed 0 (boards candidates 32, exit 0, 107 ms)`
- `4. LOOP run 1: brain self-code --auto --dry --json exit 0, 1765 ms: board-17 items under source boards 8 {"would-brief":8} of 40 boards candidates`
- `5. ARM planted root, the refreshed ledger 193 lines: board-17 items listed 8 (boards candidates 40, exit 0)`
- `7. NOISE the ranking over 3 reads (plan, write, a second dry run): the same gap ids in the same order: yes; loop listings identical: yes`
- `8. HELD OUT state/self/gaps-2026-09-24.jsonl: 153 lines, eligible 42, items 8 ..., round trip ok, trial scripts missing 0`
- `NEXTBOARD BAR MET`

Tests: `node --test test/nextboard.test.mjs` (planted ledgers, no Ollama): 6 pass.

## Open
- gate-slow items name bench/verdicts/gate.json as their verdict file: any GREEN gate run after the proposal marks them done even if the slow test was not sped up.
- board-17:board-10-imagine duplicates board-10:imagine in the loop (two candidates for one gap).
- Items whose gap line names no files carry owns "none named by the gap line", so the brief grammar has no owned files for them.
- A future docs/boards/board-17.js from the orchestrator would share the board-17 ids with the proposed file.
- The ledger line numbers in the GAP text shift when the ledger is refreshed.
