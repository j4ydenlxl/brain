# notes/math.md

`reason/math.mjs` is the program of thought region (P4, toward the 405B row: Llama 3.1 405B,
GSM8K 96.8). Before it, the organism's GSM8K answer was one prose call to qwen3:1.7b.

## what it does

`solveMath({ question, model, k, timeoutMs, verify })` returns
`{ answer, provenance, samples, program, calls, ms }` (plus `modelMs`, `execMs`, `allFailed`,
`vote`, `verify`, `fallback`, `exact`). The paths run in this order:

1. **exact**: `act/solve.mjs` (tasks/exact.mjs rationals, tasks/algebra.mjs linear equations)
   answers a question it parses completely, with no model call. It answers 0 of the 1319
   GSM8K test questions (they are prose); it answers `Compute: 12 * 13` and
   `Solve for x: 2*x + 3 = 11`, which the tests use.
2. **model+exact**: the model cell (act/llm.mjs `complete()`, the interface bench/public.mjs
   uses) is asked for a JavaScript `function solve()` that RETURNS a number. The organism runs
   it in act/run.mjs's sandbox (`runCases`, entry `solve`: a worker with a heap cap, a pruned vm
   context with no IO, a wall clock enforced by `worker.terminate()`). k samples at the model's
   own temperature (0.6 for qwen3:1.7b and qwen3:30b-a3b, read from `/api/show`; complete() has
   no temperature option) with seeds seed+i are voted by value (12 significant digits, so float
   noise votes with the exact value). A throw, a timeout, a missing solve() or anything that is
   not a finite number is discarded. Tie: integer first, then the earliest sample.
   This provenance is NEVER native: the model authored the program.
3. **model**: every sample failed, so one prose answer (bench/public.mjs ALONE_PROMPT) is taken
   and its last number read.
4. **none**: nothing produced a number (the null provider lands here).

**Verify arm** (`verify: true`): one call sees the question, the winning program and its value
and must end with ACCEPT or REJECT (last one wins; neither is not a rejection). On REJECT one
fresh round of k programs, told the rejected value was judged wrong, is voted; its winner
replaces the first (it may be the same value).

## the bench

`node bench/math.mjs --limit 200 --seed 1` (through tools/budget.mjs). Arms pot5v, pot5, pot1,
alone, null on qwen3:1.7b; pot1 and alone on qwen3:30b-a3b for the first 60 records under a
25 minute cap. One memo per record shares nested draws (pot1 is the first sample of pot5, pot5
the first round of pot5v, the fallback and alone one draw); calls and ms are reported as each
arm standalone, `live` is what the queue served.

**Records are DEVELOPMENT records.** The train split was not downloaded (a download needs the
owner's yes in chat, and this builder had no chat), so the bench took a seeded slice of the TEST
split (`sampleIds` at seed 1, nested: the public stage's seed 1 samples up to 200 lie inside it).
The prompts were probed on gsm8k.0 to gsm8k.2, outside the slice.

## measured

`bench/verdicts/math.json` (isTheBar true, written 2026-09-24T12:14:35Z by
`node bench/math.mjs --limit 200 --seed 1`, through tools/budget.mjs: wall 14131.59 s, peak ram
95.5MB). The 200 records are DEVELOPMENT records (test split, seed 1; see above). Latencies were
measured on one Ollama queue shared with other builders (another builder had qwen3:30b-a3b loaded
for part of the run, so records took from 16 s to over 300 s); read them as an upper bound. The verdict prints, on qwen3:1.7b, exact integer accuracy: program of thought k=5 with verify 180 of 200 = 90.00%, k=5 179 of 200 = 89.50% (95 percent interval 84.48% to 93.03%), k=1 177 of 200 = 88.50%, the model alone in prose 164 of 200 = 82.00% (76.09% to 86.71%), null 0 of 200; the bar (the k=5 interval wholly above the alone interval) is MISSED, gap 7.5 points, clearance -0.0222, paired McNemar p 0.0041 (20 records only k=5 got, 5 only alone got); mean seconds per record k=5 verify 52.81, k=5 42.26, k=1 8.73, alone 10.59; model calls per record 6.225, 5.02, 1.06 and 1; the verifier accepted 186, rejected 9, said neither 1, and re-sampling changed 3 answers. On qwen3:30b-a3b, the first 60 of these records under the 25 min wall clock cap (24.61 min spent): PoT k=1 40 of 40 = 100.00%, alone 39 of 40 = 97.50%, mean 22.23 s and 14.68 s per record.

| arm (qwen3:1.7b, n 200) | exact accuracy | 95% interval | s/record | calls/record | all programs failed |
|---|---|---|---|---|---|
| PoT k=5 + verify | 90.00% (180) | 85.06% to 93.43% | 52.81 | 6.225 | 4 |
| PoT k=5 | 89.50% (179) | 84.48% to 93.03% | 42.26 | 5.02 | 4 |
| PoT k=1 | 88.50% (177) | 83.34% to 92.21% | 8.73 | 1.06 | 12 |
| model alone (prose) | 82.00% (164) | 76.09% to 86.71% | 10.59 | 1 | n/a |
| null | 0.00% | 0.00% to 1.88% | (0.08 ms) | (6, none reach a model) | 200 |

**BAR MISSED.** The bar needs the k=5 interval wholly above the alone interval: the k=5 lower
edge 84.48% is not above the alone upper edge 86.71% (clearance -0.0222). The gap is 7.5 points and
it is real on these records: paired, 20 records only k=5 got and 5 only alone got, McNemar p 0.0041.
The intervals overlap because 200 records cannot separate 7.5 points at these rates.

**Where the gain comes from.** Of the 20 records only k=5 got, alone gave NO number on 17 (18
were cut off at the 3000 token budget, the same default bench/public.mjs uses for GSM8K); only 3
were a wrong number that a program fixed. Alone was capped on 28 of 200 records (mean 1563.0
tokens). The PoT samples overrun too: 56 of the 1000 k=5 samples reached 3000 tokens and 52 had
no program to run. So most of this gain is that five programs survive the thinking budget more
often than one prose answer does, not that exact execution fixes arithmetic. The 5 records only
alone got are misreadings a program computed exactly (for example gsm8k.75: gold 60, the programs
voted 7.5).

**Verify arm.** It checked 196 winners, accepted 186, rejected 9, said neither once; the 9
re-samples changed 3 answers, 2 to right and 1 from right to wrong. k=5 with verify vs k=5: 2
records only verify got, 1 only k=5 got, McNemar p 1. On qwen3:1.7b the verifier is close to a
rubber stamp: 52.81 s and 6.225 calls per record against 42.26 s and 5.02 without it, for one
net record.

**qwen3:30b-a3b** (first 60 of the same records, PARTIAL: the 25 min cap stopped it after 40,
24.61 min spent): PoT k=1 40 of 40 = 100.00% (91.24% to 100.00%), alone 39 of 40 = 97.50%
(87.12% to 99.56%), 22.23 s and 14.68 s per record, no PoT sample hit the token cap.

**Dropped.** At 35 records a sixth voter (the prose answer added to the five programs) got 29 of
35, the same as k=5 alone, so it was not built.

## next rung

- The bar is a budget question as much as a method question. Two runs would separate them, each
  as a tagged partial (`--tag`) so the bar file is never rewritten: PoT with thinking off
  (`--potThink false --arms pot5,pot1,alone --tag nothink`), whose programs are short and cannot
  overrun, and the same arms at a larger `--maxTokens`.
- Separation needs more records: at these rates 200 cannot put a 7.5 point gap into disjoint
  intervals. Held-out numbers belong to the public stage on records outside this slice (or on the
  train split, once the owner says yes to downloading it: openai/grade-school-math train.jsonl,
  MIT).
- `bench/verdicts/math-partial.json` is the 35 record interim `--report`; math.json supersedes it.
