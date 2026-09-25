# CLOUD-SESSION: the brief for every Claude Code cloud session

His order (2026-09-25, about 17:35 EDT, verbatim in MANUAL.md section A): "the Cloud session SHOULD BE LITERALLY the most PRODUCTIVE $250 ever. LIKE EVERY DOLLAR SHOULD BE USED FOR SOMETHING SUBSTANTIAL."

The ruler is VERDICTS LANDED PER DOLLAR: a verdict is a `bench/verdicts/*.json` with `barMet` decided by a command that printed its numbers, merged to `main`. A session that ends without a verdict file and a ledger line spent its dollars on nothing.

## Every session, in this order

1. Read `MANUAL.md` in full (section A is his, section B is STATE), then this file. Model: Opus 5.5 (`claude-opus-5-5`), never Opus 5; no subagent fleets.
2. Run item 0 (below). Read `bench/verdicts/cloud-session/env.json`. The sandbox has no Ollama and no GPU: every item here is model-off. An item whose `peakRssMb` in its last verdict exceeds `ramMb` is skipped with one ledger line saying so.
3. Take the FIRST item below whose verdict is still red (`barMet` false) and not claimed in the ledger by an open PR. One item per session. Work on branch `cloud/<item>`.
4. Run the bar command exactly as written (replace `<heap>` with `heapFlagMb` from env.json). Fix code until the bar is met or the command proves it cannot be met on this data; either outcome is a verdict.
5. Append one line to `bench/verdicts/cloud-session/ledger.jsonl`: `{"at","item","verdict","barMet","branch","usd","tokens"}` where `usd` and `tokens` are read from the session's own cost display, never estimated.
6. Rewrite STATE in `MANUAL.md` section B (one line for this item), add one dated line to `docs/LOG.md`, commit explicit paths (never `state/`, never `bench/fixtures/`), open a PR titled `cloud: <item> <barMet>` whose body is the verdict's printed lines.

## Items (the order is the priority; each is substantial and CPU-only)

| # | item | bar command | verdict file | why it is substantial |
|---|------|-------------|--------------|-----------------------|
| 0 | env | `node tools/cloud-session-env.mjs` | `bench/verdicts/cloud-session/env.json` | every later item's feasibility is read from it |
| 1 | gate | `node --max-old-space-size=<heap> bench/gate.mjs` | `bench/verdicts/gate.json` | the whole tree's tests and budgets on a second machine; a gate green only on his PC is not a gate |
| 2 | grid-library | `node bench/grid.mjs --split training --budget-ms 3000 --workers <cpus> --library --dev-fold odd --arms base,library --corpus bench/verdicts/grid.json --tag cloud-odd` then the same with `--dev-fold even --tag cloud-even` | `bench/verdicts/grid-library-cloud-odd.json`, `-even.json` | the ARC-AGI-1 library arm has never been graded against its no-library arm on both folds (six red verdicts say "no comparison") |
| 3 | spread | `node --max-old-space-size=<heap> bench/spread.mjs --cache state/spread-cache` | `bench/verdicts/spread.json` and `spread-control.json` | spread ON versus OFF on the same seeds is red; the P2 generations claim rests on it |
| 4 | native | `node bench/native.mjs --limit 3000 --lookups 100000` | `bench/verdicts/native.json` | the ask path's direct table and knowledge tier on 200 held-out facts, measured in nanoseconds; his "frontier level in microseconds" |
| 5 | years | `node bench/years.mjs --budgets 3 --control-s 3` | `bench/verdicts/years.json` | the organism-years and plateau rule with a control |
| 6 | gaps | `node --max-old-space-size=<heap> bench/gaps.mjs` | `bench/verdicts/gaps.json` | the self-improvement loop's gap census; red since Board 14 |
| 7 | operators | `node bench/operators.mjs --tmp state/ops-run` | `bench/verdicts/operators.json` | planted defects 6 of 6 must be found and kept; red since Board 14 |

Not for the cloud (they need Ollama or a frozen project): `recall`, `synth`, `authorship`, any autopilot run with `--author on`, `venue` (the trader is frozen).

## What is never done in a cloud session

- No secrets: none in chat, none in the repository, none in a PR. `state/` is never committed.
- No push to `main`; every landing is a PR the owner or the local orchestrator merges.
- No number quoted that a command did not print; no em-dashes in prose; no estimate in the ledger's `usd`.
- No second item in the same session: the ledger line closes the session.
