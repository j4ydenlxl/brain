# notes/published.md: the published rows for the two endpoints (board 23, item published-rows)

His orders this item serves: 2026-09-26 11:32, the fourth acceptance test, it "grows ALONE from the
GPT-4o row to the Opus 5.5 row"; 2026-09-26 20:20 "Opus 5.5 level. NEEDS TO BE REACHED"; P15, a
Fable 5.1 row is added only from a published source, never typed from memory.

## Files

`research/published.json` (7 rows appended, none changed), `test/published.test.mjs` (new),
`test/published-rows-bar.mjs` (the bar, not a node:test file), `bench/verdicts/published-rows.json`
(written by the bar), this file. `bench/public.mjs` is NOT edited: `publishedFor` already returns
every field the bench reads (system, score, unit, metric, class, source, readAt), and the rows are
found by their `system` name, so no new field was needed there. MODEL OFF: no model call, no socket
to a model, no set re-run.

## Row format (the rows added on 2026-09-26)

The existing keys, unchanged, so `publishedFor`, `bench/ladder.mjs` and `bench/ns.mjs` read the new
rows the way they read the old ones: `benchmark` (the key `SET_META` uses: `gsm8k`, `humaneval`,
`arc-agi-1`), `system`, `score` (percent), `unit`, `metric`, `class`, `source` (a URL), `readAt`.
Added on each new row: `model` (GPT-4o, Claude Opus 5.5, Claude Fable 5.1), `printed` (the value
exactly as the source prints it: `96.1`, `98.5%`, or `0.045` where the source prints a fraction),
`where` (table, row and column), and `quote` (under 15 words, whitespace collapsed, holding the
printed value). The bar's `rowProblems` checks `printed` IS `score` (as a percent, or a fraction
times 100), so a transcription slip between the two is caught.

Rows are appended at the end: `bench/ns.mjs` reads `publishedFor('gsm8k')[0]`, and that row stays
the Llama 3.1 405B Instruct row (the test asserts it).

## What was found, and where

| model | benchmark | row | source |
|---|---|---|---|
| GPT-4o | gsm8k | 96.1, 8-shot CoT | Llama 3 paper (arXiv 2407.21783v3) Table 2, measured by Meta |
| GPT-4o | humaneval | 90.2, 0-shot | the same Table 2 |
| GPT-4o (gpt-4o-2024-05-13) | humaneval | 91.0 | OpenAI simple-evals README table (the vendor's own repo) |
| GPT-4o (gpt-4o-2024-11-20) | humaneval | 90.2 | already in the file since 2026-09-18, simple-evals |
| GPT-4o (gpt-4o-2024-11-20) | arc-agi-1 | 4.5 (printed 0.045) | arcprize.org leaderboard data file v1.json, semi-private |
| Claude Opus 5.5 (High) | arc-agi-1 | 98.5 | arcprize.org/results/anthropic-claude-opus-5-5 |
| Claude Opus 5.5 (Max) | arc-agi-1 | 97.5 | the same page, Verified scores table |
| Claude Fable 5.1 (Max) | arc-agi-1 | 97.5 | Anthropic system card, section 8.16 (the arcprize row was already in the file) |

The table above repeats the values in `research/published.json`; the bar prints them from the
file through `publishedFor`.

Two caveats a reader must keep. (1) GPT-4o on GSM8K is Meta's measurement of GPT-4o in Meta's
paper, not an OpenAI number: OpenAI's launch page (openai.com/index/hello-gpt-4o) returned HTTP 403
to both WebFetch and curl, and the simple-evals README has MGSM, not GSM8K. (2) Every ARC-AGI-1 row
is the ARC Prize SEMI-PRIVATE set; this tree runs the public evaluation set
(`bench/fixtures/public/arc-agi-1/evaluation`), so the two are one benchmark family on two task
populations, not one ruler. The `ARC Challenge (0-shot)` row of the Llama table is AI2's ARC, a
different benchmark, and was not used.

## Omitted: not found published, so not typed

The bar reads these lines. Format: `OMITTED | model | benchmark | looked: <where>`.

OMITTED | Claude Opus 5.5 | gsm8k | looked: https://www.anthropic.com/claude-opus-5-5 (announcement, Sep 22 2026, curl: 0 matches for gsm8k, control grep finds SWE-bench or Terminal-Bench 2 times) ; https://www-cdn.anthropic.com/fc1b44717c85dc068bc6ba5024219938094694bd/Claude%20Opus%205.5%20System%20Card.pdf (pdftotext, 0 matches for gsm8k, control grep finds SWE-bench 11 times) ; https://www.sonarsource.com/blog/claude-opus-5-5-an-evaluation/ (no GSM8K) ; WebSearch "Opus 5.5" "GSM8K" OR "HumanEval" score
OMITTED | Claude Opus 5.5 | humaneval | looked: https://www.anthropic.com/claude-opus-5-5 (0 matches for humaneval) ; https://www-cdn.anthropic.com/fc1b44717c85dc068bc6ba5024219938094694bd/Claude%20Opus%205.5%20System%20Card.pdf (0 matches for humaneval) ; https://www.sonarsource.com/blog/claude-opus-5-5-an-evaluation/ (its 87.7% pass rate is HumanEval AND MBPP together, 544 tasks, in Java: not a HumanEval number) ; https://pricepertoken.com/leaderboards/benchmark/humaneval (no Opus 5.5 row)
OMITTED | Claude Fable 5.1 | gsm8k | looked: https://www.anthropic.com/claude-fable-and-mythos-5-1 (0 matches) ; https://www-cdn.anthropic.com/0339e6a7c5c7b87f5c07798616dc32c215d14235/Claude%20Fable%205.1%20&%20Claude%20Mythos%205.1%20System%20Card.pdf (0 matches for gsm8k, control grep finds ARC-AGI 10 times and SWE-bench or Terminal-Bench 24 times) ; WebSearch "Fable 5.1" "GSM8K" OR "HumanEval" score
OMITTED | Claude Fable 5.1 | humaneval | looked: https://www.anthropic.com/claude-fable-and-mythos-5-1 (0 matches) ; https://www-cdn.anthropic.com/0339e6a7c5c7b87f5c07798616dc32c215d14235/Claude%20Fable%205.1%20&%20Claude%20Mythos%205.1%20System%20Card.pdf (0 matches for humaneval)

What this means for his fourth acceptance test: the Opus 5.5 end of the ladder is published on
ARC-AGI-1 only. Anthropic's current model pages report agentic and professional benchmarks
(Terminal-Bench, SWE-bench, OSWorld, GDPval, Humanity's Last Exam), not GSM8K or HumanEval, so an
Opus 5.5 row on those two sets will exist only if a third party publishes one or we measure it
ourselves (a measurement, which belongs in bench/verdicts, never in this file). The item's bar as
written (Opus 5.5 rows on GSM8K and HumanEval) is therefore NOT met, and the verdict says so.

## Measured

Read before building: `research/published.json` (row format), `bench/public.mjs` (`SET_META`,
`publishedFor`, `printPublished`, `ladderRows`), `test/public.test.mjs` (the published rows
assertions), `bench/ladder.mjs` (`row405Of`, `frontierRowOf`, `orchestratorRowOf`), `bench/ns.mjs`
(reads `publishedFor('gsm8k')[0]`), `research/benchmarks-web.md` (how a source is cited),
`test/budget-linux-bar.mjs` (the precedent for a bar script under test/).

Read on the web (2026-09-26 20:45 to 20:48 EDT): arXiv 2407.21783v3 HTML (curl, Table 2 text
extracted and read column by column, the GPT-4o column is the tenth of eleven); arcprize.org
leaderboard (its `scripts/leaderboard/data.js` names the data file `media/data/leaderboard/v1.json`,
read with curl); arcprize.org/results/anthropic-claude-opus-5-5; the simple-evals README (raw);
the Opus 5.5 announcement and system card; the Fable 5.1 announcement and system card; the Sonar
Opus 5.5 review; the pricepertoken HumanEval leaderboard. Seven WebSearch queries. The WebFetch
summary of one search result claimed GPT-4o scored 96.8 on GSM8K in the Llama paper; the table text
read directly says 96.1 (96.8 is Llama 3 405B), which is why every value here was read from the
source text and not from a summary.

## Bar, this run (2026-09-27T00:53:27.859Z, the verdict's at)

`node tools/budget.mjs --ram-mb 4000 --disk-mb 64 --dir <scratch> --record <scratch>/budget.json -- node --max-old-space-size=4000 test/published-rows-bar.mjs`
printed: `CONTROL mutants of real rows rejected: 12/12`, `TESTS node --test test/published.test.mjs: tests 11 pass 11 fail 0 skipped 0 (exit 0)`,
`BAR published-rows: barMet false; required pairs with a row 2/4; rows clean 40/40; added 7`. Not met
because Claude Opus 5.5 has no published GSM8K or HumanEval number at the places above. The bar is
re-run as written: a later published row (a third party measuring Opus 5.5 on either set) turns the
pair from OMITTED to a row, and the test then requires its OMITTED line to be deleted.
