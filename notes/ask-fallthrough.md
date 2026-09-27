# ask-fallthrough (board 25)

His words: 2026-09-27 09:28 "it said it couldnt respond". On dilation.dev/ask, "hey, how are you" fell to the
memory tier on the server and printed one line, "nothing in memory matches hey.", which reads as a refusal.

## What changed

- act/prompt.mjs:398-431 (new): `FALLTHROUGH_HEAD`, `FALLTHROUGH_TRY`, the control switch `FALLTHROUGH = { on: true }`
  (the ASK_FAST pattern) and `memoryMissText(fromMemory, r, llm)`.
- act/prompt.mjs:1488 (the one return of ask() touched): the direct route's memory tier, `text:` is now
  `memoryMissText(fromMemory, r, llm)` where it was `fromMemory`. It falls through ONLY when the recall has zero
  hits and zero pages AND `llm.provider === 'null'` with no `fellBack` (the null provider asked for, or standing
  in because no provider was configured). A model that answered, a model that was asked and failed
  (fellBack env or ollama), a hit, a page, the exact path, the native region, a solved template, the knowledge
  tier and a region keep their text byte for byte. from, route, provenance, memory, llm and the ledger event are
  unchanged; act/prompt.mjs:388 (the old line) is unchanged and is line two of the new text.
- Not touched: askByRegion (act/prompt.mjs, an unreached region answers with the old line) and act/region.mjs
  (route region); the server and the tests run route direct.

The text of a miss is now three lines:

1. `I do not carry that yet: I answer greetings and questions about myself natively, arithmetic and equations exactly, word problems with my own programs and facts I ingested from memory; no language model is configured on this host.` (229 chars)
2. `nothing in memory matches <words>.` (unchanged)
3. `Try asking: who are you, what can you do, hello.`

No digit in lines one and three, on purpose: bench/answer.mjs extractAnswer reads the last meaningful line and,
under grade 'number', falls back to the last number anywhere in the text; the task's example prompts
(what is 17 times 23, 15 percent of 200) would have handed every number-graded memory miss of the null arms
(bench/answer.mjs, bench/public.mjs, bench/recall.mjs suite) a candidate such as 200 it never had. The test
asserts the number candidate is identical with the switch on and off. Spoken arithmetic (what is seventeen
times twenty three) is not carried by solve() today (measured: null), so it could not stand in.

## Measured (read before building)

- act/prompt.mjs 370-400 (memoryAnswer), 1379 to the end of ask() (every return), askByRegion, askModel;
  act/llm.mjs nullResult and envComplete (fellBack is set exactly when a real provider was asked and failed).
- act/ask-http.mjs 20-70 and 240-270 (opts provider null when not configured; llm.reason NOT_CONFIGURED is
  added by the handler), createHandler/coldStart (guard, seedBasic, knowledgeReady).
- test/act-prompt.test.mjs (newBrain, remember), test/ask-http.test.mjs (the mock provider), test/recall.test.mjs
  (a planted knowledge store), test/prompt-regions.test.mjs (a dead region cell), bench/site-ask.mjs line 81.
- The readers of the old line: bench/recall.mjs (ABSTAIN_RE, gradeWiki), bench/answer.mjs (extractAnswer,
  gradeAnswer), bench/public.mjs (null arm), bench/spoken.mjs, act/exact-read.mjs (a comment), test/web-ask.test.mjs.
- .vercelignore: /bench/fixtures is not deployed, so the server has no knowledge store; locally
  knowledgeReady() printed ok true (bench/fixtures/wiki/store, 371 MB), which is why the bench has two arms.
- BEFORE the edit (a run of ask() on the test's seeded brain, provider null, knowledge off): each of the twelve
  prompts printed from memory, route direct, provenance memory, memoryHits 0, llm provider null, ok true,
  reason null, fellBack null; the texts are pinned in test/ask-fallthrough.test.mjs (OLD).

## Printed

`node --test test/act-prompt.test.mjs test/prompt-regions.test.mjs test/ask-http.test.mjs test/converse.test.mjs test/ask-fallthrough.test.mjs`:
tests 49, pass 49, fail 0 (test/ask-fallthrough.test.mjs alone: tests 9, pass 9). Neighbours (recall, region, solve, solved, word, web-ask, spawn, act-llm): tests 72, pass 72.

`node bench/ask-fallthrough.mjs` (development only, bench/verdicts/ask-fallthrough-partial.json, isTheBar false):
deploy arm (knowledge store ready false): development uncarried first line for a person 20 of 20, old line
survives 20 of 20, text changed against the control 20 of 20; development carried text changed 0 of 16;
fields other than text changed 0 of 36. Tree arm (knowledge store ready true): 19 of 20 uncarried reached the
miss (one answered by the knowledge tier), first line for a person 19 of 19; carried text changed 0 of 16.
1.18 s, rss 135 MB.

BAR (the verify plane writes the held-out file, then runs):
`node bench/ask-fallthrough.mjs --heldout bench/ask-fallthrough-heldout.jsonl`
barMet needs, on the deploy arm, every held-out uncarried first line for a person and the old line as line two
of every miss, and on both arms 0 held-out carried prompts whose text changed against the control (a labeled
carried prompt that is a bare memory miss on an arm, such as a fact the knowledge tier answers only where its
store exists, is listed apart and printed raw).

## Open

- bench/recall.mjs ABSTAIN_RE is `/^nothing in memory matches/i` without the m flag: it no longer sees the
  old line as line two, so gradeWiki now reads an abstention as a non abstaining wrong answer (measured:
  abstained true before, false after, ok false both). Its owner adds the m flag.
- The tab (web/ask.mjs, item tab-converse) and the deploy decide when dilation.dev prints this.
