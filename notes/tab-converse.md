# tab-converse (board 25): the conversation region in the visitor tab

His words, 2026-09-27 09:28 EDT: "Yeah but i said hey to it and it said it couldnt respond". On a phone, /ask printed three refusal lines first, then the server's greeting twice.

## Read before building

- web/ask.mjs (whole), test/web-ask.test.mjs (whole), act/converse.mjs (exports converse, examples, normalise, CONVERSE_KINDS; `grep -c "process\." act/converse.mjs` printed 0, so the copy check stands unweakened), bench/site-ask.mjs (whole), bench/verdicts/site-ask.json and site-ask-local.json (keys, rows, statement), act/prompt.mjs answerFromNative (the server's native text: a head line, a newline, then the answer; the exact shape is the same head plus answer), web/build.mjs (how it calls generateAsk and reads site-ask.json rows for the portfolio live block).
- Published way (one search): Remix "Pending and Optimistic UI" (remix.run/docs/en/main/discussion/pending-ui) and "Optimistic UI for AI Apps" (ai-tldr.dev): show the pending turn at once where the answer will land, say what is happening instead of a bare spinner, replace the placeholder in place, never leave a failed placeholder silent. Applied: the server block renders first with "asking the organism on the server ...", is replaced in place, prints its failure in the same block, and prints "N s, still waiting" after 3 s; the answer comes first, the diagnostics second.

## The order of the tab

1. converse(prompt) (act/converse.mjs, copied byte for byte, sha256 in the manifest): a carried turn answers in the tab, route direct, provenance native, model none, tokens 0, no request, the 7-batch median nanoseconds from the same clock() the exact path uses. The answer prints first, the "answered natively in this tab" line second.
2. readExact (act/exact-read.mjs), 3. the word problem reader inside it (act/word.mjs via opts.word).
4. The server: the SERVER block first ("asking the organism on the server ..."), replaced by the answer; the tab's three refusal lines follow in the dim class, every one printed. A failed request (thrown, non-200, or 25 s with no answer) prints in the same block.

A server answer prints once: when j.text ends, on its own line, with j.exact.answer or j.native.answer, the answer prints once in the answer class and the head line prints dim below it; text equal to the answer prints only the answer (textIsTheAnswer); any other text (memory, model) prints as it came.

The render functions (clock, tabNativeHtml, tabExactHtml, pendingHtml, refusedHtml, modelLine, answerOnce, serverHtml) are exported and written into the page by Function.prototype.toString, so the functions the tests call ARE the page's functions (a test asserts each source string is in the page). generateAsk(dist) takes an output directory (default web/dist; web/build.mjs is unchanged).

Chips: "hey" and "who are you" ahead of the exact ones. Intro names the conversation region. Phone: the input is 16 px (no focus zoom), the prompt label hides under 480 px, chips and port tags wrap.

## Measured

- `node bench/tab-converse.mjs --out <scratch>` (through tools/budget.mjs): BAR MET: manifest true, converse before readExact true, server block before refusal true, once-only true, hey in the tab true, chips true, page 15861 bytes, phone 375 true; control misses 4/4; 1624 ms.
- converse("hey") in node: kind greeting, median of 7 batches 1108 ns per ask over 7168 asks (first cold call 560600 ns); in the node page harness 399 ns per ask.
- Refused prompt, in flight: first line "asking the organism on the server ..."; after: "nothing in memory matches history, rome." (planted reply).
- Once-only: native server answer visible 1 time on this page, 2 times on the control.
- CONTROL: the page at git show HEAD:web/ask.mjs, built from the same organism modules, same harness: refused "hey" with 1 request, first line "no cell in this tab carries this question, so the tab refuses it, not guesses; the organism on the server answers it."; missed all 4 checks.
- Phone, chrome-headless-shell already in the Playwright browser cache (nothing installed), 375 px window, planted server reply: clientWidth 360, scrollWidth 360, 0 elements past the edge for "hey", Natalia and "write a poem about the sea"; server block above the refusal lines; the control (a planted 600 px element) read scrollWidth 600 with 1 element past the edge.
- `node --test test/web-ask.test.mjs`: tests 15, pass 15, fail 0. Five mutants (reader order, refusal before pending, tail treated as text, converse dropped from MODULES, tail boundary removed) each turned at least one test red.
- `node web/build.mjs`: pages built: 6; ask/index.html 15861 bytes, organism modules 4.

## Depends on the deploy

- dilation.dev/ask serves the old page until the orchestrator rebuilds and deploys web/dist (web/dist/organism/act/converse.mjs is a new file there).
- bench/site-ask.mjs (the live bar, GitHub runner): prompts gained "hey" (chip), "hey, how are you" and "tell me a joke"; each is graded against the tab order computed in node (converse() first, then solve()). New rules heyInTheTab and compoundInTheTab (route direct, provenance native, zero requests, parity). "tell me a joke" is a row, not a rule: its first line must not start with "nothing in memory matches", which depends on converse-cover or ask-fallthrough being deployed. Playwright is not installed on this machine, so the local mode of site-ask.mjs was not run here.
