# notes/speed.md: the whole ask in microseconds (queue item 3)

Author: board 20 builder. Files: `bench/speed.mjs` (the ask section, its rule, the verdict writer),
`act/prompt.mjs` (ASK_FAST: three constant terms of an ask, and ASK_TERMS for the bench),
`test/speed.test.mjs` (claims 4 to 6), `test/act-prompt.test.mjs` (one added case),
`bench/verdicts/speed.json`. `cli/run.mjs` was not touched: it has no loadBrain, and the brain the
bench times is the one act/ask-http.mjs (board 18) builds in memory for dilation.dev/ask.

## The bar and its rule

`node bench/speed.mjs` now runs THE WHOLE ASK first, in four processes (control, default, control,
default; ASK_FAST off is the control), then the tick arms of the table when `organism/gen-0` is on the
host. The tick arms stated no bar, so the bench states one (ASK_RULE, in the file and the verdict):
every measured route's whole ask() median under 1000 us in every timed pass of the default arm,
model off, with direct and exact both measured. Its one line:
`ask median us: direct N, solved N, exact N, knowledge <N or not measured>`.

## How it is measured

act/prompt.mjs ask(), provider null (the arms count sockets: 0), on seeds/basic.mjs in memory with
the ledger full (ring 4096), warmed as act/ask-http.mjs warms. Prompts: direct is "what is 17 times
23" after one learn into a DirectTable; exact is the same question with no table; solved is the
GSM8K question of the first template reason/solved.mjs fillFromRows keeps from the journals (40 rows
of bench/verdicts/math-journal-test-1.jsonl gave 13 templates; the question is gsm8k.15); knowledge
is "What is photosynthesis?", NOT MEASURED here (bench/fixtures/wiki/store is absent), and the
factual question's fall-through is timed as context, carrying the knowledge probe. bench/ns.mjs's
clock: process.hrtime.bigint around each of 1,000 asks, a fresh copy of the string each, two passes
a process, the empty bracket beside it. The terms are the functions ask() calls with the same
arguments, timed in the order ask() runs them (timed alone in their own loops they summed to 91.8%
of the direct ask in one probe; in order, 91.5% to 100.6% on the three routes and both settings of
the final run), and the sum is set beside the whole less the extra empty brackets.

## Before and after (the run of 2026-09-26T21:54:00.029Z, bench/verdicts/speed.json)

Conditions printed per pass: load 1.9 to 1.92 (board 17's tests were running on the other cores; the
earlier runs of 21:37 and 21:41 read load 0.91 to 2.51), free RAM 14647 to 14733 MB, the empty
bracket 40 to 57 ns. The median of the four pass medians, microseconds, and the noise band (largest
minus smallest pass median, the wider of the two settings):

| route | control (ASK_FAST off) | default (on) | gap | noise | moved |
| --- | --- | --- | --- | --- | --- |
| direct | 6.352 | 4.979 | 1.373 | 1.345 | yes |
| solved | 6.109 | 4.239 | 1.87 | 1.071 | yes |
| exact | 8.535 | 7.156 | 1.379 | 1.517 | no |
| knowledge | not measured: store absent on this host | | | | |
| fall-through (context) | 162.178 | 146.201 | 15.977 | 38.152 | no |

| constant term | before | after | gap / noise |
| --- | --- | --- | --- |
| knowledge probe, store absent (fall-through) | 10.277 | 1.946 | 8.331 / 2.049 |
| solve() again in the knowledge block (fall-through) | 4.996 | not paid | 4.996 / 0.999 |
| ledger write direct / solved / exact | 0.88 / 1.007 / 0.911 | 0.471 / 0.507 / 0.497 | solved 0.5 / 0.506 not moved, the others moved |
| promptHash direct / solved / exact | 0.724 / 1.03 / 0.727 | 0.33 / 0.506 / 0.35 | moved |

The terms, timed in the order ask() runs them, sum to 93.9% (direct), 93.2% (solved) and 99.9%
(exact) of the whole default ask. The bar: worst default pass direct 5.49, solved 5.092, exact 7.265
us against 1000 us: barMet true. 0 sockets.

LARGEST CONSTANT TERM before: the knowledge probe (knowledgeReady() returning false, the store absent)
at 10.277 us, 6.3% of the factual ask. After: the early exact path's miss on that question, solve() at
5.509 us, 3.8% of it. On the three answering routes the largest constant term after is the ledger
write (direct 0.471, exact 0.497 us) and the direct step's miss on the 428 character solved question
(0.672 us). The answer itself dominates each route: the direct key (textKey) 3.544 us of 4.979,
solve() 4.897 of 7.156 on exact, the template match 1.992 of 4.239 on solved.

HE TESTS: `node bench/ns.mjs` (the full form, 679.99 s on this host, run in a trial copy so its
verdicts stayed untouched): held out "pass 1: the solved step (match, a miss) median 1252 ns", pass 2
1310 ns; development "pass 1: the solved step (match, and the answer) median 1311 ns", pass 2 1291 ns.

## The intervention (act/prompt.mjs ASK_FAST, default on, askFast(false) for the control)

1. knowledgeReady(): an absent meta.json answered by fs.existsSync, not by a thrown ENOENT.
2. The knowledge block reuses the early exact path's null instead of running solve() again.
3. promptHash(): crypto.hash one-shot, the same sha256 hex.
4. The ledger write in one copy: the ask routes build the event with t and gen first and, on a core
   Brain, hand it straight to ledger.append (brain.log copied it once more). The same record key for
   key; a brain of another shape gets the event it always got. test/speed.test.mjs claim 6 asks every
   route off and on and compares answers and events deep equal minus the clock fields.

## Next rung

- The fall-through's largest term: solve() missing on a factual question (act/solve.mjs, not this
  item's file): a pre-check that skips the arithmetic readers when no digit or number word is present.
- The last ledger copy is core/ledger.mjs append's { seq, ...ev }; the direct key (memory/direct.mjs
  textKey) is the largest single term of the direct ask; solvedFor reads process.env on every ask.
- The tick arms: organism/gen-0 is absent on this host, so the table's fields are carried from the
  verdict of 2026-09-17T12:20:33.710Z (node v24.15.0, 32 threads) under tickArms.carriedFrom.
  bench/ladder.mjs substrateOf reads the top level `at` for its node row; it should read
  tickArms.carriedFrom.at when present (a file outside this item).
