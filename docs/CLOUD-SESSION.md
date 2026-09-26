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

## The $250 spend plan (written 2026-09-25 22:40 EDT, the night the weekly pool read 85 percent)

Read from the usage card at 22:32 EDT: plan Pro; 5-hour window 33 percent; weekly all models 85 percent and weekly Fable 47 percent, both reset 2026-09-30 15:00Z; extra usage OFF, monthly limit 101.55 USD, spent 0.00. The $250 buys nothing until extra usage is ON with its monthly limit set to 250 (claude.ai, Settings, Usage). That is HIS click, the one step this plan cannot take.

The ruler stays: verdicts landed per dollar. Three levers move it, each measured on this machine:

1. **Dispatches.** One subagent costs about 55k tokens before it does any work (measured, memory `subagent-harness-overhead`). A cloud session is ONE builder with NO subagents: every dollar goes to the item.
2. **Turns.** Every turn re-sends the whole context. A session that checks a 30-minute run once a minute pays for its context thirty times. A long bar runs inside one Bash call (`command > out.txt` then a `sleep` of up to ten minutes per call) or detached with the verdict file read ONCE at the end. Never a per-turn check.
3. **Context.** Never read a file over 20 KB whole. MANUAL.md section A is his words and an item does not need it unless the item's brief cites it: read section B STATE, this file, and the item's brief; extract the rest with node, never cat.

Per-session rules that hold the price:

- Model Opus 5.5 (`claude-opus-5-5`), default effort. Sonnet 5 never builds here: a wrong build costs a second session, which is dearer than the model difference.
- One item per session. The session claims it in the ledger at start (`{"at","item","claim":true}`) and closes it with the verdict line. Sessions run in parallel only on DIFFERENT items: parallelism buys wall time, never tokens.
- Stop rule: a session that has spent 25 USD (its own cost display) without a verdict file writes `<item>-partial.json` (isTheBar false, what was measured), the ledger line, and closes. No single item is worth a tenth of the pool.
- After the first two ledger lines exist, the queue is re-ordered by rung moved per dollar. The numbers come from the ledger, never from this file.
- Wall time is free in the cloud and tokens are not. Items whose cost is a long CPU run (the gate on a second machine, 30-minute daemon runs, spread, gaps, operators, grid) belong in the cloud; items that need Ollama or the frozen trader data stay on his PC.

The queue. A session takes the first item that is red (`barMet` false or no verdict) and unclaimed:

- **A. Rows 1 to 7 of the table above.** The gate first: a gate green only on his PC is not a gate.
- **B. Board 13's cpu items**, brief and bar in `docs/boards/board-13.js`: `fit` (the 448 MB cap; host run 36198423380 fails daily until it lands; skip it if `bench/verdicts/cloud-fit.json` already reads barMet true), then `plateau`, `clock`, `direct`, `live`, `exit`. `math` and `code` need Ollama: never in the cloud.
- **C. The organism's own board** `docs/boards/proposed/board-17.md`: 8 items written by Board 15's nextboard item from the gap ledger, each naming its verdict file. This is his "every gap fills itself": the organism writes the board, the cloud session executes it, the ledger grades it. When Board 17 is spent, run `node self/boards.mjs` (the nextboard operator) for the next proposed board and take from that.
- **D. Board 14's `spread`, `gaps`, `operators`** are rows 3, 6 and 7 above.

Every landing is a PR against `master` (this repository's branch is `master`) merged by the local orchestrator or by him. A session never merges its own PR.

What the local machine does with zero Claude tokens meanwhile: the organism's own loop. `bench/verdicts/soak.json` holds the command (`node tools/budget.mjs --ram-mb 6000 --disk-mb 2000 --dir state/self -- node --max-old-space-size=6000 bin/brain.mjs self-code --auto --soak <minutes> --author on --json`); it kept 1 of 150 candidates in 60 minutes on 2026-09-25, the STOP switch is `state/self/STOP`, and the `--soak` minutes are the only knob. That loop is the vision's own engine; it costs the local GPU, not the pool.

## What is never done in a cloud session

- No secrets: none in chat, none in the repository, none in a PR. `state/` is never committed.
- No push to `main`; every landing is a PR the owner or the local orchestrator merges.
- No number quoted that a command did not print; no em-dashes in prose; no estimate in the ledger's `usd`.
- No second item in the same session: the ledger line closes the session.
