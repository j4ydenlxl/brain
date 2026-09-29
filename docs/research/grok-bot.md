# Grok Bot: what it is, what it costs, what it cannot do, and the ratios

VISION order 43 (his words, 2026-09-27: "Look at Grok bot. And make ours 10000x better and cheaper"). Board 29 item grok-bot, rebuilt on board 31 item grok-bot-fix. Assembled by `node bench/grok-bot.mjs` at 2026-09-29T00:55:34.032Z, which also writes bench/verdicts/grok-bot.json; no model call, no network. Every page below carries the instant its read returned. Every number on our side is read at run time from a verdict under bench/verdicts, with the file, path and the file's own stamp in section 6; nothing is from memory.

## 0. Which product "Grok Bot" is

- Grok Bot, the computer-use agent (xAI with Cursor, beta Aug 11 2026): https://x.ai/news/introducing-grok-bot. THIS ONE: a Bot works across apps and websites on its own cloud computer with a browser: the browser agent class Tesseract Browser was in.
- the @grok account on X that replies when tagged: https://www.layer3labs.io/guides/what-is-grok-bot. Not this one: a reply bot on X, the older meaning of "Grok bot"; no browser, no computer.
- Grok Build, the terminal coding agent: https://en.wikipedia.org/wiki/Grok_(chatbot). Not this one: a command-line coding agent, not a browser agent.

## 1. What it does, in its published words

- https://x.ai/news/introducing-grok-bot: "AI teammates you can give real work to"; the launch page (Aug 11 2026): Bots with their own computer that sign into the tools a user already uses and work across apps and websites, with usage separate from Grok and Cursor plans; no price, no speed and no benchmark number on the page.
- https://docs.x.ai/grok-bot/overview: "a persistent cloud computer with a browser, filesystem, and terminal"; Bots run in parallel and message each other; a site can still block automation or require a human step; one computer-use task per Bot screen at a time; usage resets weekly; no latency and no benchmark number.
- https://docs.x.ai/grok-bot/teams-and-enterprises: "Each user's work runs in a dedicated Firecracker microVM"; all of one user's Bots share one computer (they isolate personalities and workspaces, not compute); a Bot uses only the accounts and plugins it is granted; it runs in Cursor's cloud and cannot reach other users' computers or data.
- https://x.ai/news/grok-4-7: Grok 4.7 was "trained to natively understand the Grok Bot harness". No page read names the model a Bot runs today.

## 2. Price

| What | Price | Page | Official |
| --- | --- | --- | --- |
| Cursor Pro (includes Grok Bot access) | $20 per month | https://cursor.com/docs/account/pricing | yes |
| Cursor Pro Plus / Ultra | $60 / $200 per month | https://cursor.com/docs/account/pricing | yes |
| Cursor Teams Standard / Premium | $40 / $120 per user per month | https://cursor.com/docs/account/pricing | yes |
| SuperGrok / Plus / Heavy | $30 / $100 / ~$300 per month | https://cellcog.ai/blog/what-is-grok-bot/ | no (x.ai/grok gave 403; grok.com/plans served no price text) |
| grok-4.7 tokens, prompt under 200k | $2.00 input, $6.00 output per million | https://docs.x.ai/docs/models | yes |
| grok-4.7 tokens, prompt at or above 200k | $4.00 input, $12.00 output per million | https://docs.x.ai/docs/models | yes |
| per task (Artificial Analysis Intelligence Index task, Grok 4.7 xhigh) | $3.74 | https://artificialanalysis.ai/models/grok-4-7 | no |

Usage model, official: weekly usage included, on-demand usage billed from model and token cost (https://docs.x.ai/grok-bot/faq). No page read prints the weekly allowance or a price per Bot task in dollars.

## 3. Published latency or speed

- xAI: none for Grok Bot (launch page, overview, FAQ, computer-and-apps: no timing number). For the model, the Grok 4.7 page names only a fast variant at twice the output speed and twice the price.
- Third party, https://artificialanalysis.ai/models/grok-4-7: output speed 82.1 tokens per second, time to first token 51.22 s (Grok 4.7 xhigh), a live measurement dated by the read.

## 4. Published benchmark numbers

None for Grok Bot itself (no OSWorld, WebArena or task-success number on any xAI page read). For the models:

| Benchmark | Score | Model | Page |
| --- | --- | --- | --- |
| GSM8K, 8-shot | 90 percent | Grok-1.5 | https://x.ai/news/grok-1.5 |
| HumanEval (Python) | 88.4 percent | Grok-2 | https://x.ai/news/grok-2 |
| Terminal-Bench 4.0 | 37.6 percent | Grok 4.7 | https://x.ai/news/grok-4-7 |
| DeepSWE v1.1 | 71 percent | Grok 4.7 | https://x.ai/news/grok-4-7 |
| CursorBench 4.0 | 46.3 percent | Grok 4.7 | https://x.ai/news/grok-4-7 |
| EEBench | 64 percent | Grok 4.7 | https://x.ai/news/grok-4-7 |
| HealthBench Professional | 56.7 percent | Grok 4.7 | https://x.ai/news/grok-4-7 |
| Harvey Legal Agent Benchmark | 19.6 percent | Grok 4.7 | https://x.ai/news/grok-4-7 |
| LatchBio biosafety benchmark | 62.4 percent | Grok 4.7 | https://x.ai/news/grok-4-7 |
| HackerBench v0.3, risky dual-use prompts allowed | 3.3 percent | Grok 4.7 | https://x.ai/news/grok-4-7 |
| GDPval | 1695 Elo | Grok 4.7 | https://x.ai/news/grok-4-7 |
| AA Briefcase v1.1 | 1657 score | Grok 4.7 | https://x.ai/news/grok-4-7 |
| AA Intelligence Index | 61 index | Grok 4.6 | https://x.ai/news/grok-4-6 |
| AA Intelligence Index (Artificial Analysis) | 46 index | Grok 4.7 xhigh | https://artificialanalysis.ai/models/grok-4-7 |
| APEX-Agents | 57.5 percent | Grok 4.6 | https://x.ai/news/grok-4-6 |
| FrontierCode v1.1 Extended | 61.3 percent | Grok 4.6 | https://x.ai/news/grok-4-6 |
| APEX-SWE | 56.4 percent | Grok 4.6 | https://x.ai/news/grok-4-6 |

The two GSM8K and HumanEval numbers are from older Grok models (Grok-1.5, Mar 2024; Grok-2, Aug 2024): no Grok 4.x page read prints either set, and no bench in this tree runs any set the Grok 4.x pages print.

## 5. What it cannot do, by its own docs

- Human steps: "a password or passkey, two-factor authentication, a CAPTCHA, a payment or identity check" are steps it cannot complete (https://docs.x.ai/grok-bot/computer-and-apps).
- One at a time: "One Bot can run one computer-use task on its screen at a time." (https://docs.x.ai/grok-bot/faq).
- Isolation, his "isolated environments": "Each user's work runs in a dedicated Firecracker microVM"; all of one user's Bots share one computer (they isolate personalities and workspaces, not compute); a Bot uses only the accounts and plugins it is granted; it runs in Cursor's cloud and cannot reach other users' computers or data (https://docs.x.ai/grok-bot/teams-and-enterprises).
- Privacy and boundaries: weekly usage is included and on-demand usage is billed from model and token cost; separate Bots are not a security boundary; Legacy Privacy Mode is not supported; no dollar amount, no model named, no latency.

Pages that did not load, so nothing is taken from them: https://x.ai/bot (403), https://cursor.com/help/grok-bot/security (404), https://x.ai/grok (403), https://cybernews.com/ai-news/grok-5-artificial-general-intelligence/ (403). The AGI talk he heard is not quoted here: no loaded page carried it.

## 6. The same measures for this organism, from printed verdicts only

| Measure | Ours | Unit | File (path) | File stamped |
| --- | --- | --- | --- | --- |
| Time to first token (theirs, Grok 4.7 xhigh, third party) against the hosted round trip of one answered prompt (ours) | 0.2157 | seconds | bench/verdicts/site-ask.json (serverRows.exact.rttMs) | 2026-09-28T18:20:15.757Z |
| Server compute per response, one answered prompt | 0.000645 | seconds | bench/verdicts/site-ask.json (serverRows.exact.json.serverUs) | 2026-09-28T18:20:15.757Z |
| Answer computed in the browser tab, "hey" | 1563 | ns per ask | bench/verdicts/site-ask.json (rows[prompt=hey].nsPerAsk) | 2026-09-28T18:20:15.757Z |
| Answer computed in the browser tab, "what is 17 times 23" | 7813 | ns per ask | bench/verdicts/site-ask.json (rows[prompt=what is 17 times 23].nsPerAsk) | 2026-09-28T18:20:15.757Z |
| Direct table lookup, median per hit | 70.92 | ns | bench/verdicts/native.json (timing.hitNsMedian) | 2026-09-27T13:35:25.098Z |
| Whole ask() median, exact route, model off | 7.05 | microseconds | bench/verdicts/speed.json (askLine (regex exact ([0-9.]+))) | 2026-09-26T21:57:47.681Z |
| GSM8K exact accuracy, organism, all 1319 test records | 90.144 | percent | bench/verdicts/public-gsm8k.json (arms.organism.accuracy) | 2026-09-27T21:56:32.679Z |
| GSM8K exact accuracy, organism, 1116 held-out records | 90.233 | percent | bench/verdicts/public-gsm8k.json (arms.organism.splits.heldOut.accuracy) | 2026-09-27T21:56:32.679Z |
| GSM8K control: the same model alone, all 1319 test records | 78.9234 | percent | bench/verdicts/public-gsm8k.json (arms.alone.accuracy) | 2026-09-27T21:56:32.679Z |
| GSM8K control: the same model alone, 1116 held-out records | 78.405 | percent | bench/verdicts/public-gsm8k.json (arms.alone.splits.heldOut.accuracy) | 2026-09-27T21:56:32.679Z |
| GSM8K control: null arm, all 1319 test records | 1.2889 | percent | bench/verdicts/public-gsm8k.json (arms.null.accuracy) | 2026-09-27T21:56:32.679Z |
| GSM8K control: null arm, 1116 held-out records | 0.7168 | percent | bench/verdicts/public-gsm8k.json (arms.null.splits.heldOut.accuracy) | 2026-09-27T21:56:32.679Z |
| GSM8K share answered with no model call (native), organism | 1.0614 | percent | bench/verdicts/public-gsm8k.json (arms.organism.native.share) | 2026-09-27T21:56:32.679Z |
| GSM8K mean time per task, organism | 25818.61 | ms | bench/verdicts/public-gsm8k.json (arms.organism.meanMs) | 2026-09-27T21:56:32.679Z |
| GSM8K mean time per task, the same model alone | 6843.06 | ms | bench/verdicts/public-gsm8k.json (arms.alone.meanMs) | 2026-09-27T21:56:32.679Z |
| Held-out GSM8K answered sub-token (nanosecond classes) | 0.5 | percent | bench/verdicts/ns.json (heldOut.share) | 2026-09-27T19:10:37.542Z |
| HumanEval pass@1, organism, records both arms graded (ours MultiPL-E JavaScript) | 76.397515528 | percent | bench/verdicts/public-humaneval.json (paired(organism,alone).organism.accuracy) | 2026-09-28T01:41:13.471Z |
| HumanEval control: the same model alone, records both arms graded | 50.9316770186 | percent | bench/verdicts/public-humaneval.json (paired(organism,alone).alone.accuracy) | 2026-09-28T01:41:13.471Z |
| HumanEval pass@1, organism, held-out records both arms graded | 69.4214876033 | percent | bench/verdicts/public-humaneval.json (paired(organism,alone,heldOut).organism.accuracy) | 2026-09-28T01:41:13.471Z |
| HumanEval control: the same model alone, held-out records both arms graded | 42.1487603306 | percent | bench/verdicts/public-humaneval.json (paired(organism,alone,heldOut).alone.accuracy) | 2026-09-28T01:41:13.471Z |
| ARC-AGI-1 evaluation, organism, one attempt | 0.25 | percent | bench/verdicts/public-arc.json (arms.organism.accuracy) | 2026-09-18T14:35:37.968Z |
| Own code tasks fully solved, organism (self-code bench) | 40 | percent | bench/verdicts/code.json (arms.organism.accuracy) | 2026-09-18T13:53:11.217Z |
| Knowledge tier, held-out first sentences, recall@1 | 62.5 | percent | bench/verdicts/knowledge.json (grade.recall1) | 2026-09-27T13:42:48.550Z |
| Held-out facts answered by ask() with the model off, recall@1 | 122 | count of 200 | bench/verdicts/native.json (split.heldOut.tableRecallAt1) | 2026-09-27T13:35:25.098Z |
| Conceived prompts, every kind: share answered natively, organism, model off | 12.37 | percent | bench/verdicts/conceive.json (arms.organism.nativeShare) | 2026-09-28T12:18:03.618Z |
| Conceived prompts, every kind: share of the gradeable passing their rubric, organism, model off | 6.08 | percent | bench/verdicts/conceive.json (arms.organism.correctShare) | 2026-09-28T12:18:03.618Z |
| Conceived prompts, every kind: median per ask, organism, model off | 775500 | ns | bench/verdicts/conceive.json (arms.organism.ns.median) | 2026-09-28T12:18:03.618Z |
| Conceived prompts, every kind: median per native answer, organism, model off | 87600 | ns | bench/verdicts/conceive.json (arms.organism.ns.nativeMedian) | 2026-09-28T12:18:03.618Z |
| Conceived prompts, every kind: share answered natively, knowledge tier off as on dilation.dev | 9.28 | percent | bench/verdicts/conceive.json (arms.organism-site.nativeShare) | 2026-09-28T12:18:03.618Z |
| Authored code lines in the tree | 225637 | lines | bench/verdicts/gate.json (lines.code) | 2026-09-29T00:45:55.292Z |
| Generated organism lines | 10986227 | lines | bench/verdicts/gate.json (lines.generated) | 2026-09-29T00:45:55.292Z |

Like with like: each pair below is two arms on the same records, recounted by the assembler.

| Set | Population | Organism | Same model alone | Null | File at |
| --- | --- | --- | --- | --- | --- |
| gsm8k | all | 1189 of 1319 | 1041 of 1319 | 17 of 1319 | bench/verdicts/public-gsm8k.json 2026-09-27T21:56:32.679Z |
| gsm8k | heldOut | 1007 of 1116 | 875 of 1116 | 8 of 1116 | bench/verdicts/public-gsm8k.json 2026-09-27T21:56:32.679Z |
| humaneval | records both arms graded | 123 of 161 | 82 of 161 | not paired | bench/verdicts/public-humaneval.json 2026-09-28T01:41:13.471Z |
| humaneval | heldOut, records both arms graded | 84 of 121 | 51 of 121 | not paired | bench/verdicts/public-humaneval.json 2026-09-28T01:41:13.471Z |

On his question "and what about nanoseconds per response": the tab answers "hey" and "what is 17 times 23" in the ns per ask of section 6, and the direct table in its median ns per hit; these are the prompts it carries, not every prompt. No page read gives Grok a nanosecond, microsecond or millisecond number for a response.

## 7. "10000x better and cheaper" as two ratios per measure

Cheaper and faster (lower is better): the ratio is theirs divided by ours, and 10000x means ours at theirs / 10000. Better on a percent benchmark: 10000x of a percentage passes 100, so the ratio is their error divided by our error, and 10000x means our error at theirs / 10000. An Elo, index or score scale has no ratio, so 10000x names no target there.

| Measure | Theirs | Ours | Ratio now | What 10000x takes |
| --- | --- | --- | --- | --- |
| Agent task success on a published computer-use benchmark (OSWorld or WebArena class) | no number on their side | no number on our side yet | none | no number on their side, so 10000x names no target |
| Entry price per month that includes Grok Bot (Cursor Pro) | 20 USD per month | no number on our side yet | none | 0.002 USD per month (theirs / 10000) |
| SuperGrok (base) price per month | 30 USD per month | no number on our side yet | none | 0.003 USD per month (theirs / 10000) |
| grok-4.7 price per million output tokens (prompt under 200k) | 6 USD per million tokens | no number on our side yet | none | 0.0006 USD per million tokens (theirs / 10000) |
| grok-4.7 price per million input tokens (prompt under 200k) | 2 USD per million tokens | no number on our side yet | none | 0.0002 USD per million tokens (theirs / 10000) |
| Cost per Artificial Analysis Intelligence Index task (Grok 4.7 xhigh) | 3.74 USD per task | no number on our side yet | none | 0.000374 USD per task (theirs / 10000) |
| Time to first token (theirs, Grok 4.7 xhigh, third party) against the hosted round trip of one answered prompt (ours) | 51.22 seconds | 0.2157 seconds | 237.4594344x (theirs divided by ours (lower is better)) | 0.005122 seconds (theirs / 10000) |
| Server compute per response, one answered prompt | no number on their side | 0.000645 seconds | none | no number on their side, so 10000x names no target |
| Output speed | 82.1 tokens per second | no number on our side yet | none | 821000 tokens per second (theirs x 10000) |
| Answer computed in the browser tab, "hey" | no number on their side | 1563 ns per ask | none | no number on their side, so 10000x names no target |
| Answer computed in the browser tab, "what is 17 times 23" | no number on their side | 7813 ns per ask | none | no number on their side, so 10000x names no target |
| Direct table lookup, median per hit | no number on their side | 70.92 ns | none | no number on their side, so 10000x names no target |
| Whole ask() median, exact route, model off | no number on their side | 7.05 microseconds | none | no number on their side, so 10000x names no target |
| GSM8K exact accuracy, organism, all 1319 test records | 90 percent | 90.144 percent | 1.01461039x (their error divided by our error (100 minus each percent)) | error 0.001 percent, a score of 99.999 percent (their error / 10000) |
| GSM8K exact accuracy, organism, 1116 held-out records | no number on their side | 90.233 percent | none | no number on their side, so 10000x names no target |
| GSM8K control: the same model alone, all 1319 test records | no number on their side | 78.9234 percent | none | no number on their side, so 10000x names no target |
| GSM8K control: the same model alone, 1116 held-out records | no number on their side | 78.405 percent | none | no number on their side, so 10000x names no target |
| GSM8K control: null arm, all 1319 test records | no number on their side | 1.2889 percent | none | no number on their side, so 10000x names no target |
| GSM8K control: null arm, 1116 held-out records | no number on their side | 0.7168 percent | none | no number on their side, so 10000x names no target |
| GSM8K share answered with no model call (native), organism | no number on their side | 1.0614 percent | none | no number on their side, so 10000x names no target |
| GSM8K mean time per task, organism | no number on their side | 25818.61 ms | none | no number on their side, so 10000x names no target |
| GSM8K mean time per task, the same model alone | no number on their side | 6843.06 ms | none | no number on their side, so 10000x names no target |
| Held-out GSM8K answered sub-token (nanosecond classes) | no number on their side | 0.5 percent | none | no number on their side, so 10000x names no target |
| HumanEval pass@1, organism, records both arms graded (ours MultiPL-E JavaScript) | 88.4 percent | 76.397515528 percent | 0.4914736842x (their error divided by our error (100 minus each percent)) | error 0.00116 percent, a score of 99.99884 percent (their error / 10000) |
| HumanEval control: the same model alone, records both arms graded | no number on their side | 50.9316770186 percent | none | no number on their side, so 10000x names no target |
| HumanEval pass@1, organism, held-out records both arms graded | no number on their side | 69.4214876033 percent | none | no number on their side, so 10000x names no target |
| HumanEval control: the same model alone, held-out records both arms graded | no number on their side | 42.1487603306 percent | none | no number on their side, so 10000x names no target |
| ARC-AGI-1 evaluation, organism, one attempt | no number on their side | 0.25 percent | none | no number on their side, so 10000x names no target |
| Own code tasks fully solved, organism (self-code bench) | no number on their side | 40 percent | none | no number on their side, so 10000x names no target |
| Knowledge tier, held-out first sentences, recall@1 | no number on their side | 62.5 percent | none | no number on their side, so 10000x names no target |
| Held-out facts answered by ask() with the model off, recall@1 | no number on their side | 122 count of 200 | none | no number on their side, so 10000x names no target |
| Conceived prompts, every kind: share answered natively, organism, model off | no number on their side | 12.37 percent | none | no number on their side, so 10000x names no target |
| Conceived prompts, every kind: share of the gradeable passing their rubric, organism, model off | no number on their side | 6.08 percent | none | no number on their side, so 10000x names no target |
| Conceived prompts, every kind: median per ask, organism, model off | no number on their side | 775500 ns | none | no number on their side, so 10000x names no target |
| Conceived prompts, every kind: median per native answer, organism, model off | no number on their side | 87600 ns | none | no number on their side, so 10000x names no target |
| Conceived prompts, every kind: share answered natively, knowledge tier off as on dilation.dev | no number on their side | 9.28 percent | none | no number on their side, so 10000x names no target |
| Terminal-Bench 4.0 (Grok 4.7) | 37.6 percent | no number on our side yet | none | error 0.00624 percent, a score of 99.99376 percent (their error / 10000) |
| DeepSWE v1.1 (Grok 4.7) | 71 percent | no number on our side yet | none | error 0.0029 percent, a score of 99.9971 percent (their error / 10000) |
| CursorBench 4.0 (Grok 4.7) | 46.3 percent | no number on our side yet | none | error 0.00537 percent, a score of 99.99463 percent (their error / 10000) |
| EEBench (Grok 4.7) | 64 percent | no number on our side yet | none | error 0.0036 percent, a score of 99.9964 percent (their error / 10000) |
| HealthBench Professional (Grok 4.7) | 56.7 percent | no number on our side yet | none | error 0.00433 percent, a score of 99.99567 percent (their error / 10000) |
| Harvey Legal Agent Benchmark (Grok 4.7) | 19.6 percent | no number on our side yet | none | error 0.00804 percent, a score of 99.99196 percent (their error / 10000) |
| LatchBio biosafety benchmark (Grok 4.7) | 62.4 percent | no number on our side yet | none | error 0.00376 percent, a score of 99.99624 percent (their error / 10000) |
| HackerBench v0.3, risky dual-use prompts allowed (Grok 4.7, lower is safer) | 3.3 percent | no number on our side yet | none | 0.00033 percent (theirs / 10000) |
| GDPval (Grok 4.7) | 1695 Elo | no number on our side yet | none | undefined: an Elo, index or score scale has no ratio, so 10000x names no target |
| AA Briefcase v1.1 (Grok 4.7) | 1657 score | no number on our side yet | none | undefined: an Elo, index or score scale has no ratio, so 10000x names no target |
| AA Intelligence Index (Grok 4.6, as xAI prints it) | 61 index | no number on our side yet | none | undefined: an Elo, index or score scale has no ratio, so 10000x names no target |
| AA Intelligence Index (Grok 4.7 xhigh, as Artificial Analysis prints it) | 46 index | no number on our side yet | none | undefined: an Elo, index or score scale has no ratio, so 10000x names no target |
| APEX-Agents (Grok 4.6) | 57.5 percent | no number on our side yet | none | error 0.00425 percent, a score of 99.99575 percent (their error / 10000) |
| FrontierCode v1.1 Extended (Grok 4.6) | 61.3 percent | no number on our side yet | none | error 0.00387 percent, a score of 99.99613 percent (their error / 10000) |
| APEX-SWE (Grok 4.6) | 56.4 percent | no number on our side yet | none | error 0.00436 percent, a score of 99.99564 percent (their error / 10000) |
| Computer-use tasks at once per Bot | 1 tasks | no number on our side yet | none | 10000 tasks (theirs x 10000) |
| Authored code lines in the tree | no number on their side | 225637 lines | none | no number on their side, so 10000x names no target |
| Generated organism lines | no number on their side | 10986227 lines | none | no number on their side, so 10000x names no target |

What "10000x better and cheaper" would take on the 3 measures that have a number on both sides, from the verdicts only. Speed: 10000x under their 51.22 s time to first token is 0.005122 s for the same prompts. Our hosted round trip is 0.2157 s, of which the server's own compute is 645 microseconds (the same site-ask.json row), so the server is already under 0.005122 s and the other 215.1 ms is the trip between the bench host and the hosted server; the tab answers "hey" in 1563 ns with no trip at all. The prompts are not theirs: where our answers are graded, GSM8K, the organism takes a mean 25818.61 ms a task through the model cell, 1.984x under their first token and 5041x slower than the 10000x target. GSM8K accuracy: their error is 10 percent, so 10000x means an error of 0.001 percent; ours is 9.856 percent (130 wrong of 1319). One wrong answer in 1319 is already 0.07582 percent, and even 0 wrong of 1319 bounds the error only below 0.2274 percent at 95 percent (the rule of three, 3 of n), so the test set cannot show 10000x at all: showing 0.001 percent takes about 300000 graded records with none wrong, and the largest ratio 1319 records can certify is 43.97x. HumanEval: their error is 11.6 percent, the 10000x target 0.00116 percent, ours 23.6 percent on the records both arms graded (bench/verdicts/public-humaneval.json); the set has 161 records, whose rule of three bound is 1.863 percent, so the most it can certify is 6.225x, and 0.00116 percent takes about 258621 tasks with none failed. Cheaper: none of the three has a dollar number on our side (no verdict prints dollars), so the ratio is not computable; their entry price of $20 a month puts 10000x at $0.002 a month.

## 8. Where our next number moves the ratio most

1. Dollars per answered prompt on the hosted endpoint (cheaper): their side prints $20 a month, $6 per million output tokens and $3.74 per task; no verdict here prints dollars. The server compute per response (section 6) is the number a dollar figure would be computed from, and a dollar column is the next number.
2. Latency and coverage on the prompts a person asks (faster, and on their population): the only speed row with a number on their side compares different prompts. bench/verdicts/conceive.json (VISION order 42, at 2026-09-28T12:18:03.618Z) asks 291 prompts over 41 kinds: the organism with its model off answered 12.37 percent natively at a median 775500 ns per ask (87600 ns per native answer) and passed 6.08 percent of the gradeable ones; its own bar is met. No Grok page read prints a number on those prompts, so these rows have no ratio; the next number is the organism's native share on them rising, and a Grok time on the same prompts.
3. Agent and coding task success on one of their sets (better): Terminal-Bench 4.0 and DeepSWE v1.1 have no row on our side. bench/code.mjs and bench/public.mjs --set humaneval are the nearest benches, and neither runs a set a Grok 4.x page publishes, so a ratio there needs one of their sets added to bench/public.mjs.

## Sources (24, 20 loaded; read instants are when each fetch returned)

- https://x.ai/news/introducing-grok-bot (HTTP 200, official, read 2026-09-27T19:12:53.541Z): "AI teammates you can give real work to"; the launch page (Aug 11 2026): Bots with their own computer that sign into the tools a user already uses and work across apps and websites, with usage separate from Grok and Cursor plans; no price, no speed and no benchmark number on the page.
- https://x.ai/bot (HTTP 403, official, not loaded, tried 2026-09-27T19:12:50.547Z): did not load (HTTP 403 Forbidden to WebFetch); nothing taken from it.
- https://docs.x.ai/grok-bot/overview (HTTP 200, official, read 2026-09-27T19:12:56.094Z): "a persistent cloud computer with a browser, filesystem, and terminal"; Bots run in parallel and message each other; a site can still block automation or require a human step; one computer-use task per Bot screen at a time; usage resets weekly; no latency and no benchmark number.
- https://docs.x.ai/grok-bot/teams-and-enterprises (HTTP 200, official, read 2026-09-27T19:12:59.646Z): "Each user's work runs in a dedicated Firecracker microVM"; all of one user's Bots share one computer (they isolate personalities and workspaces, not compute); a Bot uses only the accounts and plugins it is granted; it runs in Cursor's cloud and cannot reach other users' computers or data.
- https://docs.x.ai/grok-bot/computer-and-apps (HTTP 200, official, read 2026-09-27T19:13:10.136Z): "a password or passkey, two-factor authentication, a CAPTCHA, a payment or identity check"; the steps above, and a site that requires a human, are ones it cannot complete; the user local machine only when enabled and approved; the Bot screens are work surfaces, not security boundaries; no timing number.
- https://docs.x.ai/grok-bot/faq (HTTP 200, official, read 2026-09-27T19:14:24.925Z): "One Bot can run one computer-use task on its screen at a time."; weekly usage is included and on-demand usage is billed from model and token cost; separate Bots are not a security boundary; Legacy Privacy Mode is not supported; no dollar amount, no model named, no latency.
- https://cursor.com/help/grok-bot/plans (HTTP 200, official, read 2026-09-27T19:13:06.467Z): "Grok Bot usage is metered on your Cursor account"; weekly usage and on-demand usage are named; no dollar number on the page.
- https://cursor.com/help/grok-bot/security (HTTP 404, official, not loaded, tried 2026-09-27T19:13:04.951Z): did not load (HTTP 404 Not Found); nothing taken from it.
- https://cursor.com/pricing (HTTP 200, official, read 2026-09-27T19:13:25.062Z): "$20 / mo."; the Individual plan at $20 a month and Teams at $40 per user a month, each listing Grok Bot access; Enterprise custom.
- https://cursor.com/docs/account/pricing (HTTP 200, official, read 2026-09-27T19:13:31.952Z): "Pro: "$20/mo""; Pro, Pro Plus, Ultra, Teams Standard and Teams Premium prices; no Grok Bot allowance in dollars.
- https://x.ai/grok (HTTP 403, official, not loaded, tried 2026-09-27T19:13:23.539Z): did not load (HTTP 403 Forbidden); SuperGrok prices were not read from an xAI page.
- https://grok.com/plans (HTTP 200, official, read 2026-09-27T19:13:25.761Z): "Plans - Grok"; loaded, but the served page held only its header (a script-rendered page): no plan and no price; nothing taken from it.
- https://grok.com/supergrok (HTTP 200, official, read 2026-09-27T19:14:14.399Z): loaded, but the served page held only a navigation header: no pricing text; nothing taken from it.
- https://docs.x.ai/grok/faq (HTTP 200, official, read 2026-09-27T19:14:24.171Z): names the tiers SuperGrok, SuperGrok Plus, SuperGrok Heavy, Lite and X Premium and prints no price.
- https://docs.x.ai/docs/models (HTTP 200, official, read 2026-09-27T19:13:36.510Z): "grok-4.7 (<200k tokens) | 500k | $2.00 | $6.00"; grok-4.7 at $2.00 input and $6.00 output per million tokens under 200k prompt tokens ($4.00 and $12.00 at or above); no tokens per second, no latency, and no word on which model powers Grok Bot.
- https://x.ai/news/grok-4-7 (HTTP 200, official, read 2026-09-27T19:13:51.846Z): "trained to natively understand the Grok Bot harness"; Grok 4.7, Sep 21 2026: ten benchmark numbers, $2 and $6 per million tokens, and a fast variant at twice the output speed and twice the price, with no tokens per second.
- https://x.ai/news/grok-4-6 (HTTP 200, official, read 2026-09-27T19:14:04.003Z): "Pricing starts at $2 per million input tokens"; Grok 4.6, Aug 12 2026: ten benchmark numbers; no speed claim.
- https://artificialanalysis.ai/models/grok-4-7 (HTTP 200, third party, read 2026-09-27T19:13:52.931Z): "Time to first token: "51.22s""; third party, not xAI, Grok 4.7 (xhigh): a live measurement, so it is dated by this read; a second read at 2026-09-27T19:14:02.487Z printed the same 82.1 and 51.22s.
- https://www.layer3labs.io/guides/what-is-grok-bot (HTTP 200, third party, read 2026-09-27T19:14:08.286Z): "The @grok bot on X answers when you tag it"; third party: "Grok Bot" has two meanings, the xAI computer-use agent and the @grok reply account on X; the agent meaning now dominates.
- https://en.wikipedia.org/wiki/Grok_(chatbot) (HTTP 200, third party, read 2026-09-27T19:14:48.110Z): "Grok Bot was released in beta on August 11, 2026."; third party: Grok Build is a terminal coding agent for SuperGrok subscribers; the @grok account replies to posts on X; the page holds no 2026 AGI claim.
- https://cellcog.ai/blog/what-is-grok-bot/ (HTTP 200, third party, read 2026-09-27T19:14:31.671Z): ""SuperGrok (base)" – "$30/mo""; third party table dated Aug 22 2026 of the plans that include Grok Bot; no weekly allowance and no per-task cost.
- https://cybernews.com/ai-news/grok-5-artificial-general-intelligence/ (HTTP 403, third party, not loaded, tried 2026-09-27T19:14:44.336Z): did not load (HTTP 403 Forbidden); the AGI claim he heard is not quoted from any loaded page.
- https://x.ai/news/grok-1.5 (HTTP 200, official, read 2026-09-27T23:26:54.837Z): "GSM8K: "90% 8-shot""; Grok-1.5, Mar 28 2024: GSM8K 90% 8-shot and HumanEval 74.1% 0-shot; an older Grok model than any Grok Bot runs on.
- https://x.ai/news/grok-2 (HTTP 200, official, read 2026-09-27T23:26:54.613Z): "Grok-2‡ 88.4%"; Grok-2, Aug 13 2024: HumanEval 88.4% (Grok-2 mini 85.7%), the newest xAI page read that prints HumanEval; no GSM8K on the page.
