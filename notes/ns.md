# ns: the solved-program memory (Board 15)

Author: board 15 builder. Every number below was printed by `node bench/ns.mjs`, run as
`node tools/budget.mjs --ram-mb 6000 --disk-mb 2000 --dir bench/verdicts -- node --max-old-space-size=6000 bench/ns.mjs`,
and is stored in `bench/verdicts/ns.json` (at 2026-09-25T21:29:10.995Z, node v24.15.0, isTheBar
true, barMet true). The code it ran, as it printed it: reason/solved.mjs 6093e1046a6e6679,
act/prompt.mjs 2ece64404706e698, memory/direct.mjs 48fcaa947471affa, bench/ns.mjs be9c3af84ff072da.
MODEL OFF: nothing opened the Ollama socket; the ask path ran with the model cell `null`.

## What was built

1. **reason/solved.mjs**: the solved-program memory.
   - A TEMPLATE is a verified math-region program with its question's numbers abstracted to slots,
     the program's literals bound to the same slots, and the verification it passed.
   - Numbers are digits (thousands commas, decimals, a leading zero's width) and the number words
     zero to ninety-nine. Each slot keeps its spelling style, so a form renders back to the exact
     text (the tests check the round trip).
   - A question is keyed in ONE pass (`scanKey`): whitespace collapsed, lower cased, the
     ALONE_PROMPT instruction dropped, and the numbers found by a hand scanner. That pass writes a
     form stream and a spell stream, which are hashed to a 96 bit text key and a 96 bit form key.
     The scanner is checked against the regex reference on every GSM8K question in three variants.
   - The match looks up the exact text first, then the slot form. A form hit binds the new numbers
     and checks the template before its answer is used:
     - constraints (an unbound number keeps its value; numbers bound together stay equal);
     - a finite result;
     - the shape (integer stays integer, non-negative stays non-negative);
     - agreement between templates.
   - A straight-line program is compiled once into a function of its slots, in a vm context with
     code generation from strings off. It must agree with the sandbox on its own numbers and on
     them doubled. Any other program runs in the reason/math.mjs sandbox.
   - `learnFrom` turns a verified math-region answer into a template. The answer needs
     model+exact, a majority vote and no checker rejection.
2. **memory/direct.mjs**: `SolvedTable`, open addressing over the 96 bit keys, with a chain of
   templates per key.
3. **act/prompt.mjs**: region `solved` right after `direct`, and `'solved'` in ANSWER_PROVENANCE
   after `'direct'`.
   - The region is off by default. `opts.solved` (a memory, or true for
     state/self/ns-templates.jsonl) or `BRAIN_SOLVED=1` turns it on.
   - Learning is opt-in: `opts.learnSolved`, a memory made with `learn: true`, or
     `BRAIN_SOLVED_LEARN=1`.
4. **bench/ns.mjs** (the bar) and **test/solved.test.mjs** (8 tests, no Ollama).

## Which journals carry programs

- Of the 16 journals under bench/verdicts, only `bench/verdicts/math-journal-test-1.jsonl` carries
  programs: 1081 rows, 1080 arm rows, 620 with a program (198 records), 200 GSM8K ids named.
- The public GSM8K journals name GSM8K ids but hold no program:
  - public/gsm8k-public_1.jsonl names 370 GSM8K ids;
  - public/gsm8k-1.jsonl and its two superseded copies name 6 each.
- The development records are the 499 GSM8K records a journal names. bench/public.mjs
  gsm8kDevIds names 203 (the 200 of bench/verdicts/math.json plus the three probed ones), and
  together they are still 499.

## The numbers

**Fill.**
- 620 rows with a program, 620 graded, 572 graded right.
- 226 templates kept: 226 compiled, 0 sandbox.
- 346 were duplicates of a kept program; 48 were refused as graded wrong.
- 188 records are covered. The fill took 26.0 s.
- The table holds 376 keys (188 text, 188 form).
- The templates were written to state/self/ns-templates.jsonl (314431 bytes) and read back as
  226. The covered records got the same answer from the written memory and the read one on
  188/188.

**Held out.**
- 200 records, drawn by sampleIds at seed public/1 from the 820 GSM8K test records that no journal
  names and that are not development (of 1319). 0 of the drawn records are development, and a
  template was filled from 0 of them.
- **Answered by solved: 0/200 (0.0%).** So there is no accuracy to set beside the published Llama
  3.1 405B Instruct 96.8 (em_maj1@1, 8-shot CoT): 0 of 0 is not 0%.
- **Fell through: 200/200 (100.0%)**, all to provenance memory. All 200 got the same answer ask()
  gives with solved off (200/200). Why solved passed: no template (200).
- **ns per response** (the solved step, which here is a miss, over 1000 repeats of the same ask
  per record):
  - pass 1: median 1200 ns, p99 7200 ns;
  - pass 2: median 1000 ns, p99 6200 ns;
  - one bracket around each record's repeats: 1366.1 ns and 1370.6 ns a call.
- A whole ask() here is the next region answering, over 100 repeats a record: median 793500 ns
  (pass 1) and 1013100 ns (pass 2).
- The control: two clock reads with nothing between them read a median 0 ns and a p99 100 ns in
  both passes.

**The memoisation control.** These are the 188 development records a template was filled from.
- Answered by solved 188/188 (100.0%), 188/188 right (Wilson 95% 98.0% to 100.0%), all by the text
  key and the compiled runner.
- The solved step: median 1400 ns, p99 8800 ns (pass 1); median 1300 ns, p99 7100 ns (pass 2).
- The solved step as ask() printed it: median 1600 ns.
- A whole ask(): median 4300 ns, p99 19700 ns (pass 1); median 4200 ns, p99 17900 ns (pass 2).
- Across all 499 development records: 188/499 (37.7%) were answered, 188 right, and the other 311
  fell through to the same answer as with solved off (311/311).

**Re-numbered.** Each covered record's first template, with its bound numbers doubled.
- 5 templates bind no number, so 183 were asked.
- 171/183 were answered through the form key by the compiled runner, all by their own template.
  The sandbox, running the same program on the same numbers, agrees on 171/171.
- 11 were not answered with "every template was skipped" and 1 with "templates disagree". This
  run does not break the 11 down by skip reason.
- The step: median 1300 ns, p99 4300 ns, in both passes.

**The ceiling.**
- The 1319 GSM8K test records have **1319 distinct slot forms, 0 held by more than one record**.
- Of the 200 held out, 0 share a slot form with another record, 0 share one with a template, and 0
  share a template's text.

**Wiki direct class, re-measured.**
- The table was filled from 284749 titles on 2 worker threads in 307.9 s: 281533 entries.
- The direct share was 176/200 (88.0%) with the solved region on, of them 122 right; the same
  176/200 with it off; 0/200 with the control table (the drawn titles left out).
- Solved on and off gave the same provenance and grade on 200/200.
- The table itself, over 1000000 lookups a run in 3 runs:
  - ns per hit 54.46 / 63.03 / 50.49 (median 54.46);
  - ns per miss median 22.81;
  - the loop without the lookup 2.7 / 1.55 / 1.59 ns.
- bench/verdicts/native.json printed 176/200 (88.0%) and a median 42.89 ns a hit.

**Cost.** tools/budget.mjs printed wall 586.88 s, peak ram 1784.0 MB (the wiki fill), and cpu
906.83 s.

## Reading them

- **The 0.0% held out is structural.** GSM8K slot forms do not repeat, so the ceiling is 0 of 200:
  a memory keyed by exact slot form cannot answer a GSM8K question that none of its templates came
  from.
- **What the region does do.** It answers:
  - the same question again: 188/188 right, 1.3 to 1.4 us median at the step, 4.2 to 4.3 us for a
    whole ask();
  - the same question with other numbers: 171/183, sandbox-agreeing 171/171.
- **The share grows only as the loop learns.** A math-region answer that ask() verifies becomes a
  template (act/prompt.mjs learnSolved, then reason/solved.mjs learnFrom). The next ask of that
  class is then answered by solved. That is the gap's trial, and it needs the model.
- **What solved costs when it misses:** about a microsecond (median 1000 to 1200 ns, one-bracket
  mean 1366.1 to 1370.6 ns). The fall-through answer is unchanged (200/200 held out, 311/311
  development).
- **The clock.** On this machine process.hrtime.bigint steps in 100 ns: the empty bracket's median
  is 0 ns and its p99 is 100 ns. The per-call medians are therefore multiples of 100 ns, and the
  one-bracket means are the finer figure.

## Caveats

- **Public runs mark solved answers ABSENT.** bench/public.mjs askArm counts an answer as native
  only for NATIVE (exact, memory, direct). It would mark a `solved` answer ABSENT, because
  llm.ok is false.
  - The region is off by default, so public runs are unchanged.
  - Turning it on for a public run needs `solved` in bench/public.mjs NATIVE, which is not this
    item's file.
- **The ledger cannot see ns-gap.jsonl.** self/gaps.mjs does not read state/self/ns-gap.jsonl
  (KINDS has no "ns class share", and the file is not this item's). The OPEN line below is how
  the ledger sees the gap, as kind open.
- **The wiki direct-hit timings through ask() differ by arm, from order alone.** Direct hits took:
  - solved on: lookup median 1400 ns, whole ask median 65900 ns;
  - solved off: lookup median 400 ns, whole ask median 15800 ns.

  In act/prompt.mjs a direct hit returns before solvedFor() is called, so the solved region never
  runs on a direct hit. The difference is order: the three arms rotate, and two of them share one
  table, so the solved-on arm touched each table slot first on two items in three.
- **A diagnostic measured the order effect** (unrecorded, not the bar):
  `node tools/budget.mjs ... -- node wiki-order.mjs` from the session scratchpad. It used the same
  full fill, the 200 drawn questions, and the solved-on and solved-off arms, each asked first on
  half the items, over two passes.

  | pass | arm | asked | direct hits | lookup median | whole ask() median |
  | --- | --- | --- | --- | --- | --- |
  | 1 (first touch of each slot) | solved on | first | 89 | 1200 ns | 45700 ns |
  | 1 | solved off | first | 87 | 1300 ns | 47900 ns |
  | 1 | solved on | second | 87 | 500 ns | 29700 ns |
  | 1 | solved off | second | 89 | 500 ns | 30600 ns |
  | 2 (slots touched before) | solved on | first | 87 | 900 ns | 31200 ns |
  | 2 | solved off | first | 89 | 900 ns | 32000 ns |
  | 2 | solved on | second | 89 | 400 ns | 25100 ns |
  | 2 | solved off | second | 87 | 400 ns | 24600 ns |

  At each position the two arms read within 100 ns of each other at the lookup. The position
  itself moves the lookup 2 to 3 times. It printed wall 304.01 s and peak ram 1115.7 MB.

## Open

OPEN: the ns class share is 0.0% on 200 held-out GSM8K records (bench/verdicts/ns.json; the gap is in state/self/ns-gap.jsonl, kind "ns class share", distance 1). Its trial is the loop's own fill: with BRAIN_SOLVED=1 and BRAIN_SOLVED_LEARN=1, each verified math-region answer becomes a template through reason/solved.mjs learnFrom. It needs the model, and a re-run of bench/ns.mjs measures it again (test/solved.test.mjs covers the learn path).

OPEN: bench/public.mjs NATIVE does not hold "solved", so a public run with the solved region on would mark its answers ABSENT. Its owner should add it before public runs turn the region on (reason/solved.mjs, test/solved.test.mjs).
