# site-ask: the server half of the prompt box (queue item 12)

Author: board 18 builder. His words: 2026-09-26 11:32 EDT "it should be cli in dilation.dev someday so i
can prompt like any ai"; 11:55 EDT "Listen vcs must yell".

## What landed

- `act/ask-http.mjs`: the pure handler `handle({ method, headers, body, ip, env, now })`. POST `{ prompt }`
  runs `act/prompt.mjs ask()` on the brain `init dilation` builds (seeds/basic.mjs, built once per process,
  in memory, ledger ring only) and returns the CLI footer fields plus `serverUs`, `host`, `knowledge`.
  GET prints the usage and the footer names; OPTIONS is 204 with no Access-Control-Allow-Origin; another
  Origin is 403; 413 over 2000 chars; 400 on bad JSON; 429 with Retry-After past 20 asks a minute per
  client or 300 per instance. Provider `env` only when BOTH `BRAIN_LLM_BASE` and `BRAIN_LLM_KEY` are set
  (names passed to act/llm.mjs, the CLI wiring), else `null` and the footer says the model cell is not
  configured. Cold start installs bin/serve.mjs `installGuard` with one origin, the model's; everything
  else is EGRESS_REFUSED. One log line per request under `os.tmpdir()/brain-ask`, never the prompt.
  The exact path is warmed at cold start on a throwaway brain with the null provider.
- `api/ask.mjs`: the Vercel function. `vercel.json` gained `functions["api/ask.mjs"]`: `includeFiles`
  `world/policy.json` (the only runtime read besides the absent knowledge store) and `maxDuration` 60.
  No `.vercelignore`, no web/build.mjs line needed.
- `bin/ask-serve.mjs`: web/dist plus /api/ask on 127.0.0.1 (`--static` is the control).
- `web/ask.mjs`: a tab answer makes no request; a refused prompt makes one POST to /api/ask and prints
  route, provenance, model or why none, "N us on the server" and the round trip in ms.
- `web/src/index.html`: the box links to /ask. Run `node web/build.mjs` at the checkpoint.

## For the orchestrator

- Model env names on the Vercel project (values never in a file): BRAIN_LLM_BASE, BRAIN_LLM_KEY, BRAIN_LLM_MODEL.
- The live bar after the deploy: `gh workflow run site-ask.yml --ref master -f url=https://dilation.dev/ask`
  (workflow "site ask"; it commits bench/verdicts/site-ask.json as "site-ask: the live bar from a GitHub runner").
- The one-line proof: `curl -sS -X POST -H 'content-type: application/json' -d '{"prompt":"what is 17 times 23"}' https://dilation.dev/api/ask`
  prints JSON with `"exact":{"answer":"391","method":"exact.arith",...}`, `"route":"direct"`,
  `"provenance":{"answer":"exact",...}`, an integer `serverUs` and `host` the Vercel region.

## Measured on this host (2026-09-26, Node v22.22.2, model off)

- Bar, `node bench/site-ask.mjs` (through bin/ask-serve.mjs, bench/verdicts/site-ask-local.json, isTheBar false):
  `BAR MET (local page, not the live site): ... cli parity 7/7; tab requests 0; refused prompts 1 with 1 POSTs; page errors 0; server 391 yes serverUs 585; 413 413; 429 at #17; secrets 0; cold start 27.152 ms warm 0.407 ms; met 13/13`
- Control, `node bench/site-ask.mjs --static` (/api/ask off, site-ask-control.json): `met 6/13`, the novel prompt's POST got 404.
- Cold start one-liner, three runs with the warm-up: coldStartMs 26.391 / 25.951 / 22.265, warmMs 0.376 / 0.294 / 0.275;
  without the warm-up (the control): coldStartMs 9.605 / 9.088 / 8.209, warmMs 2.110 / 2.202 / 1.806.
- Guard: a bare installGuard refuses a fetch to a server in the same process (`CONTROL guard only, own server fetch -> EGRESS_REFUSED`),
  so the handler adds the own-process loopback and Unix socket exception (tested in test/ask-http.test.mjs).
- Function bundle: `closure files 135 + includeFiles 1 = 2651284 bytes (2.53 MB) incl act/word.mjs`.
- Secret grep: web/dist/ask/index.html 0; api/ask.mjs raw "sk-" 2, both the letters of the module name ask-http; key-shaped pattern 0.

## Open

- Rate limits are per instance (no shared store, zero dependencies): several Vercel instances each allow 20 per client.
- The knowledge store is absent on Vercel (bench/fixtures is never committed): the tier answers nothing there; the footer says so.
