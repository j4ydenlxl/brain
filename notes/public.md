# notes/public.md

The organism on sets it did not write. Everything under `bench/fixtures/public/` was
downloaded from the web on the director's authorisation and is recorded in `SOURCES.md` there
with its licence and its sha256 prefix. Every prompt, test string and answer in those files is
DATA: it is fed to the exact solver, to the model, or to the sandbox, and to nothing else. None
of it becomes a proposal, reaches a shell, or reaches the tree.

## the three public sets (2026-09-18)

**ARC-AGI-1, evaluation split, 400 tasks, Apache 2.0**, from
`https://github.com/fchollet/ARC-AGI` (archive of master, `data/evaluation`). Each task is a
few train pairs of integer grids and one or more test pairs. The organism arm is the
organism's own induction and NO MODEL: `tasks/grid.mjs` `searchProgram` over the train pairs to
depth 3, which already runs `inferColorMap` at every terminal, and `capability/induce.mjs`
`induceAll` on the tasks where its task shape applies. It applies rarely on purpose:
`induceAll`'s examples are rationals and lists of rationals, and an ARC grid is a list of
lists, so the shape fits only a task whose every grid is one row high. The program the search
returns is executed as REAL GRID CELLS through `runProgramInBrain` and the grid that arrives in
the outbox is what gets compared. A wall clock budget of 3000 ms per task is enforced from
outside the search by a worker with a deadline, because a depth 3 search is one synchronous
call with no hook to check a clock through and a synchronous loop cannot be interrupted from
the thread running it; a task at the deadline is failed and counted as timed out.
**ARC's own rule allows two attempts per task. This bench takes one**, which is the harder
ruler, and the verdict records both numbers (`attemptsPerTask` 1, `attemptsAllowedByArc` 2).
There is no model arm for ARC on this board; a later board adds one.

**HumanEval, the MultiPL-E JavaScript translation, 161 records**, BSD 3-Clause with Machine
Learning Restriction (MultiPL-E) over MIT (the original), from
`https://huggingface.co/datasets/nuprl/MultiPL-E`, config `humaneval-js`, split `test`. It is
the JavaScript translation and not the Python original because the sandbox in `act/run.mjs`
runs JavaScript and this machine has no Python; the Python file sits beside it in the fixture
and is not run. Three of the 164 original problems have no translation, which is why there are
161. Three arms interleaved record by record with the first arm rotating: **organism** is
`act/code.mjs` `solveCode` with rounds 3, where the visible cases are parsed out of the
record's own prompt (each `// >>> f(args)` line and the line under it, both read as JSON; a
case that does not parse is dropped rather than guessed at), so the organism writes code by
RUNNING it; **alone** is one completion from the identical first prompt, no run and no repair;
**null** is the floor, a function that returns `undefined`, no socket and no prompt. The record
carries no hidden case list, so the hidden grade is the record's OWN tests string, run by
`runTests` (new in `act/run.mjs`) inside the same sandbox: the candidate and the suite are
compiled into one pruned vm context in a worker with resource limits and a deadline, and a
throw is a failure. The suite's first line is `const assert = require('node:assert')` and there
is no `require` in that sandbox, so the prelude defines one: it answers `node:assert` with an
`assert` object written out in plain JavaScript (`deepEqual`, `equal`, `strictEqual`, `ok`,
`notEqual`) and THROWS for every other name. A suite that reaches for `node:fs` fails with a
recorded `SandboxError`; a suite that touches `process` fails with a `ReferenceError`, because
`process` was pruned. The record's `stop_tokens` cut the completion as MultiPL-E cuts it, and
the verdict counts how many candidates that actually cut, because `"\nfunction "` would also
cut a helper the candidate defined after its answer.

**GSM8K, test split, 1319 records, MIT**, from
`https://github.com/openai/grade-school-math`. The answer is the integer after `####` and
nothing else counts. Three arms interleaved: **organism** is the division of labour this whole
tree is an argument for, THE MODEL PLANS AND THE ORGANISM COMPUTES. The model may answer only
with a calculator plan, a list of `let name = expression` lines ending in one bare expression,
with no prose and no word that is not `let` or a name bound above; every one of those
expressions is then evaluated by `act/solve.mjs`, which is exact rational arithmetic. There is
no `eval`, no `Function` and no sandbox anywhere on that path. One retry is spent when the plan
does not parse, and the retry prompt carries the reason. **alone** is the same model answering
the question in prose, graded on the last integer in its text. **null** is `solve()` on the
question text itself, which is the floor and is near zero because a word problem is not an
expression.

The bench is `bench/public.mjs`, selected by `--set arc | humaneval | gsm8k`, with a seeded
sample (`--seed`, default `public/1`) that picks WHICH records and then runs them in the set's
own order, so two runs at one seed are the same run and no comparison between arms is ever a
comparison between orders. `--limit 0` is the whole set. The tests are
`test/public.test.mjs`, ten of them, and each grades a claim against the thing it replaced: the
ARC arm solves a depth 1 rotate task built by hand from `cells/grid.mjs` primitives and does
NOT solve the same task with one cell of the test output changed; the budget is calibrated
against the same task run with no budget, so the claim is that a deadline STOPS a search that
would otherwise finish later (the whole search took 571.8 ms, and with a budget of 143 ms the
task came back after 154.9 ms, timed out); `runTests` passes a correct function and fails a
wrong one against an `assert.deepEqual` suite; the two sandbox refusals are recorded and this
process is still here afterwards.

**The measurements.** `bench/verdicts/public-arc.json` holds the whole evaluation split:
`node bench/public.mjs --set arc --limit 0 --budgetMs 3000 --quiet` printed **the organism
solved 1 of 400 ARC-AGI-1 evaluation tasks = 0.25%, 95% interval 0.04 to 1.40 percent, one
attempt per task where ARC allows two, mean 91.93 ms per task; 399 exhausted the vocabulary, 0
timed out at 3000 ms, 0 found a program that fit every train pair and missed a test pair**, the
whole run in 36920 ms. The one task it solved is `66e6c45b`, by `rotate2 then roll(-1,-1) then
roll(-1,-1)`. Beside it the published rows read from `arcprize.org/leaderboard` on 2026-09-18
and cited in `research/published.json`: **Icecuber 17.0 percent**, which is the no model class
this arm belongs to, and the frontier reasoning class at 97.5 to 98 percent, with the frontier
NO reasoning class at 11.8 to 12.3 percent. **The organism lands in neither class: at 0.25
percent it is below the no model bar by a factor of 68, and its 95% interval (0.04 to 1.40
percent) does not touch any published row.** The reason is printed in the same verdict and is
not a mystery: 399 of 400 tasks EXHAUSTED the vocabulary rather than timing out, so the arm did
not run out of time, it ran out of operations. `SEARCH_OPS` is nineteen primitives (rotate,
flip, transpose, crop to bounding box, eight rolls, three tiles) plus an inferred colour map,
and ARC evaluation tasks are mostly not compositions of those. Nought timed out at 3000 ms and
the mean task cost 91.93 ms, so the budget bought nothing here and a larger one would buy
nothing either; a larger VOCABULARY is the only thing that would move this number.

## Board 8: the organism arm is ask(), and a run survives being killed (2026-09-23)

**What the organism arm is now.** On GSM8K and HumanEval the organism arm is
`act/prompt.mjs` `ask()`, the same path `bench/answer.mjs` measures: `act/solve.mjs` first,
then recall from memory, then the model cell with the recall as its system block. It counts as
reached when solve() answered exactly, or when the model cell answered from ollama; anything
else is an absent arm, never a wrong answer. The alone arm is `complete()` with the same prompt,
model and token budget; the null arm is `ask()` with provider null. The three are interleaved
task by task with the first arm rotating. `bench/public.mjs` imports exactly `ask` and `ROUTES`
from `act/prompt.mjs` and nothing that turns words into proposals; the test proves the path
behaviourally, since each ask() writes one `act.ask` ledger event and the verdict prints
`ledgerEvents`. The Board 7 pipelines are kept as opt in arms (`--arms organism,alone,null,plan`
on GSM8K, `repair` on HumanEval) because they were measured and lost: at the kill, the plan arm
had 21 of 39 against alone 33 of 39, and the repair arm 14 of 31 against alone 14 of 31. Those
two files are kept whole as `public-gsm8k-board7-partial.json` and
`public-humaneval-board7-partial.json` with `isTheBar` false and their published rows.

**Write once, journal, resume.** Every arm result is appended to
`bench/verdicts/public/<set>-<seed>.jsonl` the moment it is graded, under a header carrying the
configuration fingerprint. A fresh run moves an old journal aside (nothing is deleted);
`--resume` reads it back, refuses a journal written under a different configuration and names
the field, skips a torn last line, and runs only what the journal does not hold. The verdict is
written once, when the run finishes. It is `public-<set>.json` with `isTheBar` true only for the
whole set (`--limit 0`) or a sample declared with `--bar`, finished, every bar arm graded and no
absent arm result; anything else writes `public-<set>-partial.json` with `isTheBar` false and
the reasons. `tools/findings.mjs` skips a verdict with `isTheBar` false. The kill test found a
real defect: a torn last line with no newline swallowed the first resumed append, so the resume
held 59 of 60. `openJournal` now closes such a line before appending.

**The bar runs, printed.** GSM8K, `--limit 6 --seed 1`: organism 5 of 6 = 83.33% (43.65% to
96.99%), mean 1472.4 ms; alone 5 of 6; null 0 of 6; gap 0.00 points. RATE 9.41 tasks per
minute, 6.38 s per task. HumanEval, `--limit 6 --seed 1`, killed after 2 whole tasks and one arm
of the third, then `--resume`: "RESUMED: 7 arm results held", 6 of 6 finished, journal 19 lines;
organism 5 of 6 = 83.33% (43.65% to 96.99%), mean 6878.45 ms; alone 4 of 6 = 66.67%; null 0 of
6; gap 16.67 points, which needs 50 tasks per arm to separate from zero. RATE 3.15 tasks per
minute, 19.04 s per task over the 4 tasks that process ran. At those rates a whole set costs
about 140.2 min for GSM8K (1319 tasks) and 51.1 min for HumanEval (161 tasks), computed from the
verdicts' msPerTask and printed by a one line node command. No whole set was run.

**The token budget was the ruler.** At Board 7's HumanEval default of maxTokens 1600, a resumed
run had 7 of 12 model arm answers empty: organism answers fell back to memory and alone answers
had 0 code chars, all near 6.4 s, and every non empty model answer passed. A direct probe on
HumanEval_89_encrypt and HumanEval_144_simplify: at 1600, qwen3:1.7b spent exactly 1600 tokens
thinking and returned 0 text chars; at 4000 it finished in 2363 and 1728 tokens with code. The
HumanEval default is now 4000 (GSM8K stays 3000). Every model arm record now carries `tokens` and
`capped` (tokens at or over maxTokens), each arm counts `cappedAtMaxTokens` and
`cappedAndWrong`, and the statement names them. At the new defaults 1 of 6 alone answers was
capped on each set and both were wrong; no organism answer was capped.

**The organism answers short.** On the GSM8K run the organism's answers were 1 to 3 chars on
159 to 607 tokens; alone wrote up to 771 chars on 333 to 3000 tokens. ask()'s system block asks
for plain words, and the model answers with the number. On 6 tasks that cost nothing in accuracy
and made the organism arm 3.3 times faster than alone (1472.4 against 4902.94 ms); 6 tasks
decide neither.

**The model is not seeded.** One seed picks the same tasks every run; the model's answers still
move. GSM8K alone was 6 of 6 on the first run and 5 of 6 on the second; HumanEval alone at 1600
was 3 of 6, then 2 of 6. A gap on a small sample is inside that motion.

## Board 11: the organism arm goes through the reasoning regions (2026-09-24)

**What changed in ask().** `act/prompt.mjs` ask() now carries two regions after the direct
table, askBySpawn and the knowledge tier, and before every model cell, on either route. A
prompt with a function signature and a doc comment is CODE shaped and goes to
`reason/synth.mjs` synthesize (k=5 candidates tested in the sandbox against the examples the
prompt states, one repair round). A prompt with numbers and a question is MATH shaped and goes
to `reason/math.mjs` solveMath (k=5 programs run in the sandbox, voted by value, one verify
call). solve() runs first: a prompt it computes never reaches a region. The region's own
provenance rides in `provenance.region`; the answer's provenance is `model+exact` or `model`,
and `memory` when the region's cell was not reached. Code is tried before math because a
function prompt carries numbers in its examples. Shape coverage: 1319 of 1319 GSM8K prompts are
math shaped (23 needed the number words), and every HumanEval prompt is code shaped.

**The internal suite lost nothing.** Printed before the change and after it, through ask(),
725 questions: `correct 724, exact 725, exact and correct 724 (ids digest aaa9480b6cfcd764)`
in all three arms after (provider null, model down with the regions on, a mock cell with the
regions on), `region model calls 0`, `lost against before ... : 0`. 505 suite prompts are math
shaped and solve() computes every one of them, so no region is ever called on the suite.
`test/prompt-regions.test.mjs` holds that claim on every run.

**The bench.** `bench/public.mjs` sends the organism arm through the regions (`--regions 1`,
the default; `--regions 0` is the Board 8 organism). On HumanEval the organism is handed the
record's OWN prompt, which is the shape synthesize reads examples out of; the alone arm keeps
the Board 8 `firstPrompt`. Every organism result journals its provenance, the region's own
provenance and counts, and the ask's wall microseconds, so each verdict prints the native share
(exact, direct, or knowledge tier memory: no model call), the direct share with its lookup
nanoseconds, and the model share. `--tag` names a journal and its verdict (`--tag 30b`), and
`--name` names the verdict only (`--name smoke` writes `public-<set>-smoke-partial.json` from
the journal the whole run resumes). A bar file is written once, and a later pass leaves it as
it was. regions, k and check are in the journal fingerprint, so a resume under other flags is
refused.

**Two rulers.** Development records are printed apart from held-out ones. GSM8K development is
the 200 ids `bench/verdicts/math.json` lists under `records.ids`, plus gsm8k.0 to gsm8k.2, which
the math prompts were probed on. HumanEval development is records 0 to 39 by file index
(`bench/verdicts/synth.json` development.humaneval). Quote the held-out numbers.

**The GSM8K smoke**, 30 records at seed public/1, qwen3:1.7b, `public-gsm8k-smoke-partial.json`
(isTheBar false). Pasted from the run:

```
organism     30       27     90.00%    74.38% to 96.54%    20918.63  model+exact 27/30; capped 19 (wrong 3)
alone        30       26     86.67%    70.32% to 94.69%     5538.19  capped 2 (wrong 2)
null         30        0      0.00%     0.00% to 11.35%        1.01  memory 0/30
NATIVE organism: native (exact, memory, direct: no model call) 0 of 30 = 0.00%; direct 0 of 30 (no record was answered from the direct table); through the model 30 of 30, mean 20.92 s per ask
REGION organism math: 30 records, 27 correct, by provenance model+exact 27/30, mean 6.17 model calls and 20.84 s of model per record
SPLIT organism: by split: held out 23 of 25 = 92.00% (75.03% to 97.78%), development 4 of 5 = 80.00% (37.55% to 96.38%)
SPLIT alone: by split: held out 22 of 25 = 88.00% (70.04% to 95.83%), development 4 of 5 = 80.00% (37.55% to 96.38%)
NATIVE null: native (exact, memory, direct: no model call) 30 of 30 = 100.00%, mean 1003.94 us per ask; direct 0 of 30 (no record was answered from the direct table); through the model 0 of 30
ETA whole set: 26458.62 ms per record x 1319 records / 60000 = 581.65 minutes (arms organism,alone,null, interleaved; a resume skips the 30 held here, leaving 568.42 minutes)
RATE gsm8k: 2.27 tasks per minute, 26.46 s per task over 30 tasks run here, arms organism,alone,null
```

Organism minus alone is 1 record of 30, inside both intervals: this smoke separates nothing.
No GSM8K record was native: solve() computes none of them and the direct table holds none, so
every organism answer came through the math region. Every latency was measured on ONE Ollama
queue shared with other builders.

**A defect the smoke found, fixed before the whole run.** The organism line reads
`capped 19 (wrong 3)`, and the smoke verdict's statement says 19 of 30 organism answers used the
whole maxTokens 3000 budget. That is wrong. A region answer journals the SUM of the tokens of
its six or so calls, and a sum over six calls passes 3000 without any one call reaching it.
After the smoke, a region row journals `capped: null`, and the verdict ignores capped on region
rows, including rows journaled before the fix, and counts them under `cappedNotReadable`. The
alone arm's `capped 2 (wrong 2)` is a real reading, from one call each. The smoke partial was
left as written.

**The HumanEval smoke**, 30 records at seed public/1, qwen3:1.7b,
`public-humaneval-smoke-partial.json` (isTheBar false). Pasted from the run:

```
organism     30       23     76.67%    59.07% to 88.21%    34881.88  model+exact 22/25, model 1/5; capped 12 (wrong 5)
alone        30       14     46.67%    30.23% to 63.86%     10107.2  capped 9 (wrong 9)
null         30        0      0.00%     0.00% to 11.35%       16.04  memory 0/30
NATIVE organism: native (exact, memory, direct: no model call) 0 of 30 = 0.00%; direct 0 of 30 (no record was answered from the direct table); through the model 30 of 30, mean 34.87 s per ask
REGION organism code: 30 records, 23 correct, by provenance model+exact 22/25, model 1/5, mean 2.9 model calls and 34.84 s of model per record
SPLIT organism: by split: held out 16 of 23 = 69.57% (49.13% to 84.40%), development 7 of 7 = 100.00% (64.57% to 100.00%)
SPLIT alone: by split: held out 10 of 23 = 43.48% (25.63% to 63.19%), development 4 of 7 = 57.14% (25.05% to 84.18%)
ETA whole set: 45006.3 ms per record x 161 records / 60000 = 120.77 minutes (arms organism,alone,null, interleaved; a resume skips the 30 held here, leaving 98.26 minutes)
RATE humaneval: 1.33 tasks per minute, 45.01 s per task over 30 tasks run here, arms organism,alone,null
```

The number to quote is the held-out one: records 40 to 160, organism 16 of 23 against alone 10
of 23. The development records (0 to 39, the ones the extractor was written reading) score 7 of
7 for the organism and 4 of 7 alone, and they are exactly why the two rulers are printed apart.
`model+exact` (the kept candidate passed every example the prompt states) was right 22 of 25
times; `model` (no candidate passed them all) was right 1 of 5. The organism's
`capped 12 (wrong 5)` is the same summed-token defect as on GSM8K, and alone's
`capped 9 (wrong 9)` is a real reading.

**The whole runs, launched and not waited for.** One cmd.exe chain, created through WMI so it
outlives the session that launched it (the exact line is in
`bench/verdicts/public/whole-chain.cmd.txt`), runs three steps one after another, each
through `tools/budget.mjs --ram-mb 6000 --disk-mb 200 --wait-free-ram-mb 16384` with
`--max-old-space-size=6000` and `--resume`:

1. GSM8K whole, qwen3:1.7b: journal `bench/verdicts/public/gsm8k-public_1.jsonl` (the smoke's
   journal: it resumed with `90 arm results held`), verdict `public-gsm8k.json`.
2. HumanEval whole: journal `bench/verdicts/public/humaneval-public_1.jsonl`, verdict
   `public-humaneval.json`.
3. GSM8K whole on qwen3:30b-a3b, `--tag 30b`: journal
   `bench/verdicts/public/gsm8k-30b-public_1.jsonl`, verdict `public-gsm8k-30b.json`.

Its first journal held 91 lines at 2026-09-24T13:15:13Z and 98 lines at 2026-09-24T13:16:19Z.
Expected minutes, from the smoke's own ms per record: `581.65` for GSM8K whole (`568.42` after
the 30 the smoke holds) and `120.77` for HumanEval (`98.26` after), so `666.68` minutes for the
first two steps. The 30b step has no smoke, so no minutes are quoted for it. Each whole verdict
carries the organism, alone and null accuracies with intervals, the native and direct shares
with their latencies, the two rulers, the Llama 3.1 405B GSM8K 96.8 row, and the frontier rows
with sources (`ladder` in the verdict). The item's bar verdict is `bench/verdicts/public-launch.json`.

**The ladder** (`node bench/ladder.mjs`, run once after the smokes and before the chain) reads
the smoke partials. Its answer class line counts `model+exact` as "other", because its classes
only know `model`, `exact`, `memory` and `direct`. That reading is in `bench/ladder.mjs`, which
this item does not own.
