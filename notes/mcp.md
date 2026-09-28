# mcp-server: the brain as a tool a Claude session calls (board 32)

Author: board 32 builder. His words, 2026-09-27: "I want the Brain to be a very important tool, even for you
for further ambitious projects, and for developesr all across" (docs/VISION.md order 44 clause (1)).

## What landed

- `tools/mcp.mjs`: a zero dependency stdio MCP server (Node 24 ESM). JSON-RPC 2.0, one message per line,
  nothing but JSON-RPC on stdout (stdout.write and console.log are pointed at stderr before any module that
  might print is loaded; the server keeps the one real writer). Methods: `initialize` (echoes 2024-11-05,
  2025-03-26 or 2025-06-18, else 2025-06-18; `capabilities.tools.listChanged` false; serverInfo `brain` and
  the package.json version), `ping`, `tools/list`, `tools/call`. Notifications are never answered. Unknown
  method -32601; a line that is not JSON -32700 with id null, and serving goes on; a non object, a batch, an
  id that is neither a string nor an integer, no method, or jsonrpc not "2.0" is -32600; an unknown tool or
  arguments that are not an object is -32602 (the specification's tools page); a tool that fails on its
  input or data is `isError: true` with the reason. stdin end drains the queue and exits 0. One stderr line
  per tool call: `mcp tool=<name> ms=<ms> isError=<bool>`.
- `bench/mcp.mjs`: the bar and, with `--mutants`, the mutant pass (below). `test/mcp.test.mjs`: 15 tests;
  every server test runs the server as a child process (`BRAIN_MCP_TEST_SERVER` points them at another copy).

## Registering it (the orchestrator's step, not done here)

Add to the repository root `.mcp.json` (the file already holds `scraper` and `tesseract` in this shape), with
the absolute path on this machine:

```json
{
  "mcpServers": {
    "brain": {
      "command": "node",
      "args": ["C:/Users/ybmic/Downloads/claudeskillsvideo-to-website/brain/tools/mcp.mjs"]
    }
  }
}
```

Or from a shell: `claude mcp add brain -- node C:/Users/ybmic/Downloads/claudeskillsvideo-to-website/brain/tools/mcp.mjs`.
A developer on another machine uses their own absolute path to `brain/tools/mcp.mjs`; nothing else is needed
(no install, no dependency, no key). Flags: `--state` loads a named brain from the CLI state root instead of
the in-memory seed; `--knowledge-dir DIR` points the knowledge tier at another store.

## What each tool returns (one text block each)

- `ask {prompt, brain = "dilation", provider = "none"}`: act/prompt.mjs `ask()`, the call `node bin/brain.mjs
  ask` makes. The text is the answer's text, a blank line, then ONE JSON footer line: `route`, `provenance`
  (answer, tier, title, method, memoryHits, webPages, modelAgreed), `native` (kind, form, ns), `exact`
  (answer, method, ns), `llm` (provider, model, ms, tokens, ok, reason, fellBack), `ns`, `serverUs`,
  `knowledge` (ready, why), `memoryMiss` (true when the text is one of the two memory miss texts:
  FALLTHROUGH_HEAD or "nothing in memory matches"), `brain` (name, source seed or state), `promptHash`,
  `promptChars`. The brain is the seeds/basic.mjs one `init dilation` builds, built once per process per
  name, in memory, ledger ring only (act/ask-http.mjs's choice), so nothing under state/ is read or written;
  with `--state` it is `cli/state.mjs loadBrain(name)` plus the ingested pages, as the CLI does, and the
  ledger is flushed after each ask. A name that is not in the state root falls back to the seed and says so.
- `knowledge {query, k = 5}`: `knowledgeStore()` (the function the tier uses) asked the tier's own question
  ("What is X?", or locate() for where and when). First line: counts, candidates, ms. Then the top k answers
  (answer phrase, score, article title, fact kind, the fact) and the top k recalled facts (article, kind, sim,
  text). An absent store: "the knowledge store is absent on this host ..." with knowledgeReady()'s reason,
  isError false.
- `verdict {name}`: `name` must match `^[a-z0-9-]+$`. First line `verdict <name>: barMet <v>, isTheBar <v>,
  at <v>` (a field the file lacks prints `(absent)`), then `command:` and `statement:`. A bad name or a
  missing file is isError true.
- `status {}`: `VISION <countLine>` from tools/vision-count.mjs's exports (in process, no child), then
  `ladder: <line> (at <at>, barMet <v>)` from bench/verdicts/ladder.json.

## The provider rule

`provider` defaults to `"none"`, which passes provider null: no model runs, no socket opens, and the footer's
`llm.reason` says the caller asked for no model. `"ollama"` is the local model cell (the one queue: never
from a bench or a test on a shared night). `"env"` is act/ask-http.mjs's wiring: the NAMES `BRAIN_LLM_BASE`,
`BRAIN_LLM_KEY`, `BRAIN_LLM_MODEL` go to act/llm.mjs, which reads the values at request time; when either of
the first two is unset in the server's environment the call is refused (isError) before anything is asked,
and a reply is scrubbed of both values as a last wall. The bar and the tests run model off only.

## Measured

Read before building: web/tools/code-universe-bridge.mjs `--mcp` (the tree's prior stdio server: line
framing, reply shape, the -32700 answer), bin/brain.mjs `ask` (the call shape), act/ask-http.mjs (the footer
fields, the seed brain, the value scrub), act/prompt.mjs (ask, knowledgeStore, knowledgeReady, factQuestion,
FALLTHROUGH_HEAD), tools/vision-count.mjs (countVision, countLine), and two pages of the published way:
modelcontextprotocol.io specification 2025-06-18, basic/transports (stdio: newline delimited, no embedded
newlines, nothing but MCP messages on stdout) and server/tools (unknown tool is the protocol error -32602,
invalid input data is a tool result with isError true). Where the bridge differed (it answered -32700 to a
blank line, isError to an unknown tool, and anything with an id), this server follows the specification.

Bar: `node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/mcp.mjs`
writes bench/verdicts/mcp.json; every call prints one line, and a second line with the evidence its check read.

Mutant pass: `node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir <scratch> -- node --max-old-space-size=4000
bench/mcp.mjs --mutants --scratch <scratch>` writes bench/verdicts/mcp-mutants.json and prints the tally line; the
tally lives there, not here. Its rules are the tree's own, read in bench/mutants.mjs's header before writing it:
a probe (__MUTP) in every replacement proves the defect ran (no probe line is NOT EXECUTED, never survived or
killed), a kill is graded against a baseline run of the unmutated copy (a test that passed there and fails
now), and a wall clock timeout is a kill only when the baseline finished inside half the clock. Here the copy
is tools/mcp.mjs alone, transplanted into the scratch directory with its ROOT and its four relative imports
pointed back at the tree. The provider env refusal is not mutated: without it a call could reach a model
endpoint, and every run on this board is model off.

### Fix pass (the verify plane's four findings, each fixed at the source)

1. The knowledge check matched `\bParis\b` anywhere, and the tool's header echoes the query, so it passed on
   0 answers. Now `knowledgeTopIsParis` parses the answer lines under "answers, best first:", requires the
   header's counts to equal the lines, and the top answer to be "paris" from the article "Paris". Controls:
   knowledge "qwzx vrbl plomf" and the Paris header alone with its counts zeroed (the exact text that fooled the
   old check) both read false, live in the bar and fixed in a test. The same defect sat in the capital check
   (a recall line says "other than Paris"): `capitalIsParis` reads only the ask's own answer line and requires
   the knowledge route and tier; its live control is "What is the capital of Italy?", same route, answer rome.
   The knowledge, status, unknown tool and log line checks now count toward barMet.
2. The statement said "from the memory tier" by printing provenance.answer; it now prints the footer's route
   and tier, both printed on the call's evidence line.
3. The statement carried numbers the command never printed (the server version cut off by the row's print width, a GSM8K
   count typed into the bench, the stdout line count, the log line count). Each now has its own printed line;
   the verdict check compares the tool's text with bench/verdicts/public-gsm8k.json read by the bench instead
   of a typed count, and status is compared with tools/vision-count.mjs and bench/verdicts/ladder.json the same
   way. The bar test now asserts that every number in the statement appears in the bar's stdout.
4. The mutant tally was prose only. It is now the `--mutants` command above, its printed tally line and its
   verdict file; test/mcp.test.mjs holds the mutant table to the source (every rule matches exactly once, every
   replacement calls the probe, every copy passes `node --check`), so a table gone stale fails a test instead of
   quietly never applying.

Read for the fix pass: bench/mutants.mjs (header: probe, baseline, clock rules), the server's knowledge and ask
texts as printed live for "What is the capital of France?", "What is the capital of Italy?", "Paris" and
"qwzx vrbl plomf", and Node's TAP reporter output (the `# tests` summary key collides with a tests array: the
parser keeps the count as `total`, found when its own test failed).

## Open

- The orchestrator registers the server in `.mcp.json` (snippet above) and adds the test to the gate.
- The mutant pass runs the suite once for the baseline and once per mutant; it is a command of its own, not part of the gate.
- `provider: "ollama"` and `provider: "env"` answering were not run here (model off by order); only the env
  refusal is tested.
