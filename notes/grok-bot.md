# grok-bot: the product he quit Tesseract Browser over, measured against this organism (board 29, fixed on board 31)

Author: board 29 builder, item grok-bot; board 31 builders, items grok-bot-fix (two passes). His words: 2026-09-27 "I quit Tesseract
Browser because Grok Bot took the whole moat. They are talking about AGI. Isolated environments. Not the whole world ...
Look at Grok bot. And make ours 10000x better and cheaper" and "Annd what about nanoseconds per response?" (VISION order 43).

## What landed (board 31, grok-bot-fix)

- `bench/grok-bot.mjs`: the tracked assembler and the verdict's command (`node bench/grok-bot.mjs`). It holds the 24
  sources (the 22 board 29 read, plus x.ai/news/grok-1.5 and x.ai/news/grok-2), each with its HTTP status, one ISO
  readAt instant (null, with triedAt, for a page that did not load), one quote under 15 words and the strings it
  printed; every Grok number names its source and printed string, and build() throws when a number is not in it.
  Our numbers are read only from verdict files at run time, each with that file's own "at". It writes
  bench/verdicts/grok-bot.json and docs/research/grok-bot.md and prints the lines of report().
- Like with like: GSM8K comes from the finished bench/verdicts/public-gsm8k.json, every arm on the same records.
  HumanEval is recounted from the rows on the records where both arms were graded (the organism has absent records),
  from public-humaneval.json when it exists, else the running partial.
- A live file (complete false) only appends rows, so the verdict pins it: {at, rows, digest}. build(root, at, pins)
  replays the pinned rows and refuses when their sha256 moved.
- The 10000x paragraph (section 7 of the md) on the three both-sided measures, from the verdicts only.

## Second fix pass (verify plane findings)

- Unprinted numbers in the statement (the 95 percent interval bounds and the HumanEval set size, plus the GSM8K
  native count and the development count found on the way): every number the statement and the 10000x paragraph
  derive now goes through d() into verdict.derived and is printed as a `derived ...` line; pair lines print each
  arm as "correct of n = percent" and the organism interval. Both paragraphs are built with a tagged template that
  records every interpolated value; the check everyNumberTheProseQuotesIsPrinted (part of barMet) and test 8 hold
  every numeric token of those values to a token of a printed line. report() never prints the prose whole.
- Section 8 of the md turned on existsSync(bench/conceive.mjs, bench/verdicts/conceive.json), which no stamp held.
  renderMd now reads no file and probes no path; section 8 reads five new measure rows from
  bench/verdicts/conceive.json (native share, gradeable pass share, median ns per ask, median ns per native answer,
  native share with the knowledge tier off), each stamped like every other row. build() returns `inputs` (files read,
  paths probed) and test 9 holds them to the files whose stamps the verdict records (one allowed probe: whether the
  whole HumanEval set exists, which test 4 holds).
- The statement now carries the conceive population sentence: the nanosecond answers are on the prompts the organism
  carries, and it refuses the rest.

## Measured

Read before writing:
- Board 29 transcript (the WebFetch tool results; each source's readAt is the instant its result returned there).
- Board 31: x.ai/news/grok-1.5 (GSM8K 90% 8-shot, Grok-1.5) and x.ai/news/grok-2 (HumanEval 88.4%, Grok-2), the only
  Grok pages found that print a set this tree runs; both are older models and say so in the md.
- Official, failed on board 29: x.ai/bot 403, x.ai/grok 403, cursor.com/help/grok-bot/security 404; cybernews 403.
- Verdicts: public-gsm8k (its statement names the interval "95 percent"), public-humaneval-partial, site-ask, native,
  speed, ns, knowledge, code, public-arc, gate, conceive (prompts.asked, prompts.kinds, arms.organism and
  arms.organism-site, barMet); tools/budget.mjs usage; docs/VISION.md order 43.
- Second pass, the verify plane's three findings, read before the fix; after it, the bar printed
  "everyNumberTheProseQuotesIsPrinted true" and the new test printed "80 distinct tokens quoted, 0 unprinted; control
  without derived lines 23 unprinted, without pair lines 15" and "inputs 11, stamped 11, unstamped 0".
- A patch script's template literal dropped the backslashes of the test's tokenizer regex; the test's own floor
  (at least 100 numeric tokens quoted) went red with "numeric tokens 11" and named it before any row passed on it.

## Open

- Strict stamps: the test goes red whenever a named file is re-stamped: gate.json on every gate run; site-ask,
  native, speed, ns, knowledge, code, public-arc when their benches re-run; conceive.json whenever its bench re-runs
  (it was re-stamped during board 31; this pass read it at 2026-09-27T23:47:08.737Z); the HumanEval partial if an earlier row changes or the file is
  replaced. The fix each time is `node bench/grok-bot.mjs`.
- When public-humaneval.json lands, the test asks for a re-run; the rows then move to the whole set.
- No dollar number on our side: no bench prints dollars per ask or per month, so no "cheaper" ratio exists.
- No bench runs a set Grok publishes for Grok 4.x (Terminal-Bench, DeepSWE, CursorBench, GDPval ...).
- The conceive rows have no Grok number on the same prompts, so no ratio; conceive.json's own bar is not met (its
  model arm was not run, board 31 is model off).
