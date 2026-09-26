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

## The $250 spend plan (rewritten 2026-09-26 10:20 EDT on his order; the first plan of 22:40 the night before is in git)

His words of 10:05 EDT are in `MANUAL.md` section A: "it's a pro at everything, its asi, self improving, clock dilation, and I SHOULD BE ABLE TO TEST AND USE IT. Every request should be less than a token and it should be done in microseconds ... optimized for efficiency and frontier level benches ... a god at percepting and memecoins ... able to create code. Dude we are SO FAR". The queue below is in HIS order, not the ledger's: every item is something he can TEST AND USE when it lands, and every item ends with the one command he runs.

The $250 buys nothing until extra usage is ON with its monthly limit set to 250 (claude.ai, Settings, Usage; at 05:25 EDT the card read extra usage OFF, limit 101.55 USD, spent 0.00). That is HIS click, the one step this plan cannot take.

### What he can test and use today (measured 10:12 EDT on this machine, model cell OFF)

```
node bin/brain.mjs init dilation
node bin/brain.mjs ask dilation "What is the capital of France" --provider null
```

prints `answer [knowledge "Capital of France"]: paris`, `route knowledge  provenance memory`, `llm null/- 0.00ms`: a request answered from the ingested wiki store with no model and no token. The same command with `"what is 17 times 23"` prints `nothing in memory matches times.`: arithmetic is NOT on the sub-token path from `ask` today. `bench/verdicts/native.json` (2026-09-24, `node bench/native.mjs`) holds the distance on the knowledge tier: 122 of 200 held-out facts answered with no model (61.0 percent, the bar is 100), direct-table hit 42.89 ns median, miss 15.38 ns median over 1,000,000 lookups. `bench/verdicts/public-gsm8k-partial.json` (2026-09-26 12:54Z) holds the distance on the frontier bench: organism 472 of 530 correct (0.890566) and every one of the 530 went through the model (native share 0, mean 23,559 ms per task; Llama 3.1 405B publishes 96.8). The site is https://dilation.dev. That is "SO FAR", in numbers a command printed.

### The queue, in his order

A session takes the first item that is red (`barMet` false or no verdict) and unclaimed. Every item is CPU-only unless marked LOCAL; each ends with what he types to test it.

1. **Less than a token, in microseconds: arithmetic and word problems on the sub-token path.** `reason/solved.mjs` keeps verified math programs as templates, but `ask` with the model off does not reach them (10:12 EDT: `nothing in memory matches times.`). Item: `ask` tries the solved templates and the exact solver before the knowledge tier and before any model cell, for any question that parses to numbers and an operation, with provenance `solved` or `exact`, and the GSM8K public bench counts those as `native`. Bar: `node bench/ns.mjs` (writes `bench/verdicts/ns.json`; the held-out share of GSM8K records answered with no model is the number: 0 of 200 on 2026-09-25, while the same path answers 188 of 499 development records at accuracy 1 with a step median of 1200 ns, so the mechanism exists and its COVERAGE is the gap) and `node bench/native.mjs` (`bench/verdicts/native.json`, `met.share`). HE TESTS: `node bin/brain.mjs ask dilation "what is 17 times 23" --provider null` prints 391 with provenance solved or exact and `0.00ms`.
2. **Frontier benches, the whole set, with the native share printed beside the score.** The GSM8K chain is at 530 of 1319 (`cut.nextId` gsm8k.530), HumanEval is a partial, ARC solved 1 of 400 (`bench/verdicts/public-arc.json`, mean 91.93 ms per task, program search to depth 3; the human panel publishes 98). LOCAL for GSM8K and HumanEval (they run qwen3:1.7b on Ollama; the cloud has no Ollama): `node bench/public.mjs --set gsm8k --limit 0 --resume --wall-minutes 45` repeated until `complete` is true, then the same with `--set humaneval`. CLOUD for ARC: deeper program induction in `tasks/grid.mjs` and `capability/induce.mjs`, graded by `node bench/public.mjs --set arc --limit 0 --budgetMs 3000 --quiet` (`bench/verdicts/public-arc.json`, `arms.organism.solved` over 400, evaluation set held out from the training set the grid bench develops on). HE TESTS: `node bench/public.mjs --set arc --limit 20 --budgetMs 3000` and reads `solved`.
3. **Efficiency: the whole ask in microseconds, measured, not the table alone.** `bench/speed.mjs` runs four arms in four processes; `bench/verdicts/speed.json` is its verdict. Item: the ask path's own median, model off, on the three routes (direct, knowledge, solved) printed as one line, and the largest constant term named (today the knowledge lookup and the ledger write, not the table). Bar: `node bench/speed.mjs` with `barMet` true on the rule it states. HE TESTS: `node bench/ns.mjs` and reads the step median line.
4. **A god at perceiving memecoins: the perception bench on the trader's captured tapes, execution frozen.** The trader is frozen for EXECUTION by his 2026-09-16 order; his 10:05 words make PERCEPTION a brain capability. The tapes exist: `trader/data/trader.db` (236,572,672 bytes, last written 2026-09-11T19:49:52Z) and the neuron registry the trader built (memory `trader-neuron-registry`). LOCAL first: a fixture export, `bench/fixtures/curves/` (a held-out draw of captured curves as JSONL, no keys, no wallet, no venue socket), written by a new `tools/export-curves.mjs` that reads only that database. CLOUD then: `bench/perceive.mjs` reads one curve reading at a time and classifies it (newborn, migrating, complete, dead, by the trader's own `complete` flag and the registry's typed cells) in nanoseconds per reading, graded on the held-out split with a split OBJECT, against a rate-matched coin control, and NEVER buys. Verdict `bench/verdicts/perceive.json`, `barMet` on separation from the control at the stated n. HE TESTS: `node bench/perceive.mjs --limit 200` and reads the separation line and the ns per reading.
5. **Create code: the self-code operator on a gap HE names, kept through the four walls.** Today `self-code --auto` picks its own candidates from the gap ledger. Item: `node bin/brain.mjs self-code dilation --gap "<his sentence>"` writes a brief from his sentence, builds the patch, runs the gate on a copy, keeps it only if the gate stays green and the named bench moves, and prints the diff. LOCAL (the builder is qwen3:30b-a3b on Ollama). Bar: `node bench/self-code.mjs` (`bench/verdicts/self-code.json`) with one kept patch from a named gap in the run. HE TESTS: `node bin/brain.mjs self-code dilation --gap "the ask path should answer 17 times 23" --dry` and reads the brief it wrote.
6. **Self-improving: the loop that runs without either of us.** It exists: `bench/verdicts/soak.json` (2026-09-26 10:38Z, `--soak 90 --author on`, isTheBar true, barMet true, kept 0 of the candidates it tried, 13 model calls at a mean of 90.03 s). BrainAutopilot runs it at 05:00 daily and BrainLadder at 04:00. Item: the kept-per-hour line and the organism-years line on the site, read from the verdict, so the loop's yield is visible without a terminal. LOCAL. Bar: `node bench/autopilot.mjs` (`bench/verdicts/autopilot-*.json`). HE TESTS: `node bin/brain.mjs self-code --auto --soak 30 --author on --json` and reads `kept`; `state/self/STOP` stops it.
7. **Clock dilation: years per wall hour, on the site.** `bench/verdicts/years.json` (`node bench/years.mjs`, barMet true) prints 704,435 organism-years on the grid plane in a 300 s run; `bench/verdicts/spread.json` (`node bench/spread.mjs`, barMet FALSE) reached 8,243,280 organism-years and its held-out gain 0.0156 sits inside its noise 0.014315. Item: spread's bar met (the gain over the noise band at the stated n) and one line on https://dilation.dev, "organism-years per wall hour", read from the verdicts. CLOUD (spread is CPU). HE TESTS: `node bench/years.mjs` and reads `organismYears`.
8. **The fit (B1).** `node bench/cloud.mjs --native --seconds 1800 --out bench/verdicts/cloud-fit.json` still counts 6 budget kills at the 448 MB cap (21 in the HEAD control), each right after a checkpoint write of 6.5 to 7.9 MB (`notes/cloud-fit.md`): stream the checkpoint in `daemon/run.mjs`, bar unchanged, control unchanged; the host's daily run fails until it lands. CLOUD.
9. **The contamination row (B2).** `node bench/gate.mjs --contamination` is RED on 29 bar verdicts: 25 with no split (autopilot-board10, boundary, budget, census-prune, census-scale-pruned, census-scale-static, census, code, compress-board10, compress, daemon, dream, knowledge, math, multiply, native, public-launch, recall, senses, spawn, synth, velocity-heldout, velocity, web-ladder, years) and 4 with a string split (grid-evaluation, grid-library, grid, imagine). Each bench writes a split object or a contaminated label, then its verdict is re-run by its own bar command, never edited by hand; the row is never widened. CLOUD, one file per session is fine.
10. **Rows 1 to 7 of the table above, then Board 13's `plateau`, `clock`, `direct`, `live`, `exit`, then the organism's own board** `docs/boards/proposed/board-17.md` (8 items from the gap ledger, each naming its verdict file; when spent, `node self/boards.mjs` writes the next). `math` and `code` need Ollama: never in the cloud.

### The levers and the rules (unchanged, measured on this machine)

1. **Dispatches.** One subagent costs about 55k tokens before it does any work (memory `subagent-harness-overhead`). A cloud session is ONE builder with NO subagents.
2. **Turns.** Every turn re-sends the whole context. A long bar runs inside one Bash call (`command > out.txt`, then `sleep` up to ten minutes per call) or detached with the verdict file read ONCE at the end. Never a per-turn check.
3. **Context.** Never read a file over 20 KB whole. Read section B STATE of `MANUAL.md`, this file, and the item's brief; extract the rest with node.

- Model Opus 5.5 (`claude-opus-5-5`), default effort. Sonnet 5 never builds here.
- One item per session. The session claims it in the ledger at start (`{"at","item","claim":true}`) and closes it with the verdict line. Sessions run in parallel only on DIFFERENT items.
- Stop rule: a session that has spent 25 USD (its own cost display) without a verdict file writes `<item>-partial.json` (isTheBar false, what was measured), the ledger line, and closes.
- After the first two ledger lines exist, the queue is re-ordered by rung moved per dollar INSIDE his order: an item never jumps above one he listed earlier.
- Wall time is free in the cloud and tokens are not. Items whose cost is a long CPU run belong in the cloud; items that need Ollama or the trader's database stay on his PC (LOCAL above).
- Every landing is a PR against `master` merged by the local orchestrator or by him. A session never merges its own PR.

What the local machine does with zero Claude tokens meanwhile: the organism's own loop. `bench/verdicts/soak.json` holds the command (`node tools/budget.mjs --ram-mb 6000 --disk-mb 2000 --dir state/self -- node --max-old-space-size=6000 bin/brain.mjs self-code --auto --soak <minutes> --author on --json`); the STOP switch is `state/self/STOP`, and the `--soak` minutes are the only knob. That loop is the vision's own engine; it costs the local GPU, not the pool.

## What is never done in a cloud session

- No secrets: none in chat, none in the repository, none in a PR. `state/` is never committed.
- No push to `main`; every landing is a PR the owner or the local orchestrator merges.
- No number quoted that a command did not print; no em-dashes in prose; no estimate in the ledger's `usd`.
- No second item in the same session: the ledger line closes the session.
