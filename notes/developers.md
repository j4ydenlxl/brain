# Board 32, item developers: README.md, docs/DEVELOPERS.md and the bar that runs them

His order (docs/VISION.md order 44): "I want the Brain to be a very important tool", "and for developesr all across". Clause (2) is the developer documents; this item wrote them and the bar that runs every command in them.

## What was built

- `README.md` (new, the repository root): his words, the ladder line with its `at`, one command per surface (CLI, library, HTTP, MCP, packed install), each followed by the first line it prints; a sources table; the licence stated as `LICENSE` states it.
- `docs/DEVELOPERS.md` (new): each surface in depth; the claims tables (what answers without the store, what needs it, what the store still misses, the one known wrong answer); the model cell's three variable names and the no-value rule; the footer fields; the HTTP limits and status codes from `act/ask-http.mjs`; the table of where every number comes from.
- `bench/developers.mjs`: the bar. Runs every bash block whose first word is node, curl or npm (no shell: argv split in process, anything needing a shell refused), compares the first printed line with the directive under the block, runs the library example from a scratch file, drives the MCP snippet through initialize and tools/list, asks every claims row through `ask()` with provider null, checks every sources row against its verdict file, checks every double-quoted span against docs/VISION.md, runs `tools/docs-numbers.mjs` plus a strict pass that ignores this bar's own verdict. Control: a planted wrong first line must fail.
- `test/developers.test.mjs`: parser, comparison, argv splitter, helpers, every runnable block states one first line, the example runs, the verdict shape after one bar run.

## Directives (HTML comments under a closing fence, not rendered on GitHub)

`prints`, `prints-matches`, `prints-json`, `file`, `cwd: fresh` (an empty scratch directory whose sibling `brain` is a junction to the checkout, removed before the scratch tree), `needs` (skip with a reason naming the absent file), `mcp-tools`. Tables follow `<!-- claims: no-store -->`, `<!-- claims: store -->`, `<!-- claims: store-miss -->` and `<!-- sources -->`.

## Measured

Read before building: docs/VISION.md sections 1, 3 (order 44) and 4; bin/brain.mjs; act/prompt.mjs (`ask`, `knowledgeReady`, `closeKnowledge`, the route order); act/ask-http.mjs (`LIMITS`, `FOOTER`, statuses, the model cell names); act/llm.mjs (the env provider); api/ask.mjs; tools/docs-numbers.mjs; tools/budget.mjs; tools/mcp.mjs and notes/mcp.md (the other item's server); bench/verdicts ladder.json, install.json, knowledge.json, site-probe.json, mcp.json. Published pages: code.claude.com/docs/en/mcp (the `.mcp.json` shape and `claude mcp add --scope project`), docs.npmjs.com npm-pack (the tarball name on stdout, written to the working directory).

The numbers are in `bench/verdicts/developers.json`; nothing here restates them.

## Found, outside this item's files

- The program tier answers `solve 2x + 3 = 11` with `31`; the exact tier gets `4` from `2*x+3=11`. docs/DEVELOPERS.md lists it under known wrong answers, so the bar turns red the day it changes.
- `act/solve.mjs` does not read implicit multiplication (`2x`).
- `LICENSE` is proprietary; "for developesr all across" may want a licence decision. His call.
- The site has no model cell and no store (its GET says so), so a fact asked over HTTP is the miss.
- A sources row goes stale when another item re-runs its verdict; the bar reports it (non-gating) and the row's `at` needs a touch.

## Fix pass (board 32 verify plane)

- Answers, not headers: new directives `line`, `line-matches`, `store-line`, `no-store-line` (checked against every printed line) and `json` (PATH = VALUE on the first line's JSON). Every CLI ask and every prints-json block must state one (a CLI ask: a line, or a store-line AND a no-store-line), or it fails. The packed copy is asked a fact too, so its miss is checked through the CLI.
- Model off by rule: a CLI ask with no `--provider` goes through `askModel` in `act/prompt.mjs`, which probes a local Ollama (`/api/tags`) when the answer reaches the model tier. Every CLI ask in both documents now names `--provider null` (or `env`, whose names are removed), and the bar refuses one that does not BEFORE it runs. DEVELOPERS.md no longer says `'null'` is the default provider of `ask()`.
- Sources: a fifth column names one verdict field per number (dot path, `length`, `name[key=value]`); each number must equal its field (rounded only to the decimals written). The old digit search accepted 0, 1, 3 and 5 for install.json; the test plants every wrong count 0 to 5 for install.json and site-probe.json.
- Statement: totals are printed on their own line (blocks, ran, as written, adapted, answer checks); the test asserts every digit run in the statement appears in the bar's stdout. The two adapted runs are named as adapted.
- Controls: every passing check is re-run against a planted wrong expectation (first lines, answer lines, JSON fields, every no-store claim, every source number minus one, every quote plus a 15 word span); the verdict's canary holds the counts.
- Tests: negative tests for claims, sources, quotes and answers, and an in-process mutant run of the whole bar on planted texts (`runBar({ docTexts })`) that must not be met and must name each planted error.

Read for this pass: `act/prompt.mjs` (`askModel`, `regionCell`, `memoryMissText`, `FALLTHROUGH_HEAD`), `act/llm.mjs` (`complete`, the ollama no-model path), `bin/brain.mjs` (`promptOpts`, the ask command), `tools/docs-numbers.mjs` (`maskLines`, `checkDoc`: HTML comments are not masked, so directive numbers are checked), `tools/budget.mjs` (the default record path), the live GET and POST bodies of the site's ask endpoint. Why the first run of this pass failed: the packed copy's fact ask, with no provider, printed the one line miss and a footer saying it fell back from ollama (the probe had answered); read before the fix and again after (with `--provider null` it prints the three line miss the document states).
