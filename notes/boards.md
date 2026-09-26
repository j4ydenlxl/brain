# notes/boards.md: every undone board item is a ledger line and a self-code candidate (board 15 builder)

## Files

`self/boards.mjs` (the reader; `--json`, `--gaps`), `self/gaps.mjs` (the "board item" kind and its
writer only), `self/autopilot.mjs` (the boards source only), `bench/boards.mjs` (the bar),
`test/boards.test.mjs`, `test/boards-plant.mjs`, `bench/verdicts/boards.json`,
`state/self/boards-budget.json`. MODEL OFF: no socket is opened anywhere in this item.

## Design

The reader never runs a board script. A small tokenizer walks the text for an array named ITEMS
(or `*_ITEMS`) and reads `key`, `owns`, `task`, `wave`, `ollama`, `model` from each object:
single-quoted, double-quoted and template-literal strings (an escaped backtick stays text, a `${...}`
is kept as text, never evaluated), numbers, booleans and identifiers (kept as their names). A script
that does not parse is reported by file, container and line. Proposed boards
(`docs/boards/proposed/*.md`) have a written grammar with a renderer and a parser that round-trip.

Done or undone, per item: the verdict file is the first `bench/verdicts/<name>.json` after BAR (the
first one the item owns or writes, when the first is only an input the bar reads). Done means
isTheBar true and barMet true, or met, met.bar, bar.met, or a MET word for older files, dated after
the board's launch marker. Undone states: no-verdict-named, partial-only, absent, unreadable,
not-the-bar, undecidable, missed, stale. A board whose marker is absent (Board 13) says so on
every item.

The trial is the bar's node line (the one naming the verdict file, else the one running the bench the
BAR parenthesis names, else the first that writes no other verdict), else the bench in the BAR
parenthesis, else an owned `bench/<stem>.mjs` for `bench/verdicts/<stem>.json`. An owned bench whose
name is only a prefix of the stem (`bench/grid.mjs` for `grid-clock.json`) is printed as a hint and
never becomes a trial, because its flags are written nowhere.

Ledger: `writeLedger` in self/gaps.mjs replaces any board-item lines it is handed with a fresh scan
and appends them after every other line; bench/gaps.mjs runs trials from buildLedger's in-memory
lines, so board items are never run as its trials, and the soak's gapQueue skips the kind.

Autopilot: source `boards`, evidence mode `brief`, registered outside SOURCE_ORDER (a Board 14 soak
reads SOURCE_ORDER only, so no 60-minute brief runs inside a soak). Candidates come smallest owned
set first. self/brief.mjs is probed by name in a child; absent or not importing, every candidate is
refused with "brief operator not landed" and the error line. A dry run says "would-brief". A live run
hands at most one item per run to `runBrief()` in a child, with the author's remaining model calls
(0 with the author off). A kept patch set that edits existing files goes through applyToTree (the
gap's files, a snapshot, the real gate, a byte-for-byte revert on red). A kept set that creates a
file is saved under `state/self/boards-kept/` and refused at the apply wall, because applyToTree has
no wall that writes new files.

Speed: a scan of the 6 boards costs about 26.5 ms cold (every verdict JSON parsed, the largest
0.86 MB). A warm scan costs about 5 ms: the parse, each item's BAR and each verdict (keyed by path,
size, mtime and ctime) are cached per process, so a warm scan only reads and stats files.

## The bar (run 2 at 2026-09-25T21:17:01Z, the one on disk)

`node tools/budget.mjs --ram-mb 6000 --disk-mb 600 --dir state/self --wait-free-ram-mb 16384 --record state/self/boards-budget.json -- node --max-old-space-size=6000 bench/boards.mjs`

- Scan x5: 6 boards (6 parse clean), 48 items, done 17, undone 31, parse errors 0. Cold 26533.3 us,
  warm median 4968.55 us (min 4682.1, max 5463.3). The undone set was identical across the 5 scans.
- Must-list, 12 rows, all ok: Board 13 plateau, clock, math, code, direct, live, exit, rows undone;
  Board 12 enwiki undone; Board 14 gaps, operators, spread (their verdicts say barMet false) undone.
  Trials found: plateau, math, rows, gaps, operators, spread. None found: clock (hint bench/grid.mjs),
  code (hint bench/synth.mjs), direct, live, exit (hint bench/venue.mjs), enwiki (hint bench/knowledge.mjs).
- Ledger state/self/gaps.jsonl: 184 lines written, 31 of kind "board item". Boards 10 to 14: 25
  undone items, 25 in the ledger with their whole brief and the verdict file they name. Two name no
  verdict file (board-11:site, board-11:public): their line carries verdictFile null and the reason.
- Source, 2 dry runs: 140 candidates each, 31 under source boards, all "would-brief", 25 of 25
  required listed. The source line:
  `{"read":true,"from":"ledger","where":"state/self/gaps.jsonl","items":31,"reason":null,"scanErrors":0,"withTrial":22,"needsModel":11,"brief":{"landed":true,"operator":"runBrief","reason":null},"candidates":31}`
- CONTROL (`--sources gate,notes,imagine,census,slow,mutants`, the boards source off): 109 candidates,
  0 boards. Other sources were 109 in both dry runs and in the control.
- Held out: 13 earlier committed revisions of the board scripts (git show, never read while the parser
  was written), 13 parse clean, 95 items.
- Bar MET. Wall 3.96 s, peak RAM of the tree 424.9 MB, model calls 0.

Run 1 (2026-09-25T21:15:01Z, two minutes before run 2, the same bar) also printed barMet true, with 32 undone, 32 boards
candidates and "brief operator not landed: self/brief.mjs does not import (Node.js v24.15.0)". The
brief was being written at that moment. That message was the child's last stderr line. The probe now
reports the error line, and a failed probe is retried after 60 s instead of being held until the
file changes. Run 1 wrote bench/verdicts/boards.json itself, so board-15:boards read as done in
run 2 (undone 32 to 31).

## Open

- bench/autopilot.mjs stage 3 sums perSource over SOURCE_ORDER against the candidate count. With
  the boards source on it is off by the boards count (31 now). That file is not mine.
- tools/handoff.mjs reads the SOURCE_ORDER literal, so `boards` is not listed there. The soak never
  runs board items, by design. daemon/health.mjs gapCounters counts board items as open gaps.
- The brief's kept patch set creates new files for most items. This file does not apply those (the
  apply wall); they are saved for a writer that has a new-file wall.
- board-11:site and board-11:public can never be done under the verdict-file rule: their BAR is a
  build, a test and a journal.
