# notes/imagine.md

Owner of `mind/imagine.mjs`, `capability/grid-invent.mjs`, `bench/imagine.mjs`,
`test/imagine.test.mjs`, `test/imagine.mutants.mjs`, `bench/verdicts/imagine.json` and this note
(Board 10, item imagine). His P14, verbatim: "Ai is algorithms. What if this had imagination? Could
think outside the box? Could vision? Could create new things that have never been done before".

The bar command is `node --max-old-space-size=4000 bench/imagine.mjs --split training --budget-ms
3000 --workers 2`. The runs so far, one at a time, each the only bench process of this item:

| run | command options | wall | verdict |
| --- | --- | --- | --- |
| run 1 | the bar, round 1 library | 798.35 s | copied aside, then overwritten by run 2 |
| run 2 | the bar, round 2 library | 793.57 s | `bench/verdicts/imagine.json` (isTheBar true) |
| seed s2 | the bar plus `--seed s2` | 794.63 s | `bench/verdicts/imagine-seed-s2.json` |
| evaluation | `--split evaluation --carry` | 1115.49 s | `bench/verdicts/imagine-evaluation-carry-true.json` |
| evaluation s2 | `--split evaluation --carry --seed s2` | 1117.56 s | `bench/verdicts/imagine-evaluation-seed-s2-carry-true.json` |
| evaluation s3 | `--split evaluation --carry --seed s3` | 1112.16 s | `bench/verdicts/imagine-evaluation-seed-s3-carry-true.json` |
| training, doubt | the bar plus `--doubt` | 819.1 s | `bench/verdicts/imagine-doubt-true.json` |
| evaluation, doubt | `--split evaluation --carry --doubt` | 1122.85 s | `bench/verdicts/imagine-evaluation-carry-true-doubt-true.json` |
| shape mult | the bar plus `--shape mult` | 34.04 s | `bench/verdicts/imagine-shape-mult-partial.json` |
| shape mult+other | the bar plus `--shape mult+other` | 8.89 s | `bench/verdicts/imagine-shape-mult-other-partial.json` |
| shape smaller+same | the bar plus `--shape smaller+same` | 5.73 s | `bench/verdicts/imagine-shape-smaller-same-partial.json` |
| shape other+mult | the bar plus `--shape other+mult` | 8.78 s | `bench/verdicts/imagine-shape-other-mult-partial.json` |
| screen | the bar plus `--admit 64` | 799.48 s | `bench/verdicts/imagine-admit-64.json` |
| budget | the bar plus `--budget-ms 6000` in place of 3000 | 1428.52 s | `bench/verdicts/imagine-budgetms-6000.json` |
| budget s2 | the same plus `--seed s2` | 1426.16 s | `bench/verdicts/imagine-budgetms-6000-seed-s2.json` |

Run 2 is the bar's verdict (node v24.15.0, isTheBar true). Every number below was printed by one of
these runs or by a command named with it: `node bench/imagine.mjs --runs`, `node bench/imagine.mjs
--objectives`, `node --test test/imagine.test.mjs`, `node test/imagine.mutants.mjs`, or a one off
`node -e` over a verdict, or an analysis script named where it is used. Those scripts are
`test/imagine-loo-probe.mjs`, `test/imagine-doubt-compare.mjs`, `test/imagine-doubt-changed.mjs`,
`test/imagine-new-at-budget.mjs` and `test/imagine-new-at-budget-2.mjs`: they read and print, write
nothing, and are not tests (the gate runs `test/*.test.mjs` only). They were written in the
session scratchpad, then copied into `test/` with their paths made relative; re-run from there on
the same inputs, every output the note quotes came back identical, and a control against a
different output did not. Two of those inputs are run 1's verdict, whose only copy is outside the
repository: a second bar verdict in `bench/verdicts/` would be published by `tools/findings.mjs`
as a finding of its own. The machine was shared with other builders while the runs ran.

## What was built

**mind/imagine.mjs: imagination as a checked claim, not a word.**

- `propose(context, budget)` returns typed candidates: `primitive`, `wiring`, `objective` or
  `patch`. A candidate survives only when it is:
  - **outside memory**: not an exact stored key, not an exact article title in the knowledge
    store when one is present (`memory/knowledge.mjs` `titleLookup`, opened read only), and at a
    hypervector distance above the floor (0.15) from every stored item. A candidate's vector
    (D 8192, bipolar) bundles its tokens (the same word seeds the ask path uses) and each token
    bound to its position. Distance is (1 minus similarity) over 2.
  - **outside the recombination null**: before imagining, the null draws as many random
    candidates AND as many pairwise recombinations of memory as the imagination draws. Any key
    the null reached is rejected, since a recombination is not imagination.
- Every rejection is counted by cause: invalid, duplicate, inMemory, inKnowledge, inNull and
  nearMemory.
- `keep(candidate, evidence)` submits to the authority gate (`core/gate.mjs`) as the registered
  kind `imagine.keep`. Its policy (`imaginePolicy`):
  - rejects anything whose provenance is not the imagination;
  - approves a primitive or wiring only with a novelty distance above zero and at least one
    solved task that is not among its sources (held out);
  - approves an objective only with a hypothesis and a complete ruler: a suite, a bar (metric,
    comparison, value) and a control;
  - holds a code patch until the autopilot's verification is in the evidence.
- `objectiveSpace(facts)` is the space the vision imagines in. Objectives are made from measured
  facts, and the null recombines stored hypotheses with stored rulers.

**capability/grid-invent.mjs: invention for the ARC grid search.**

- Three sources of words:
  - **(i) collapse**: every contiguous run of 2 or more unlearned words of a solved program in
    `bench/verdicts/grid.json`, as one step, plus sibling variants (the same family and types,
    for example rot90 for rot270).
  - **(ii) timeouts**: each timed out task is searched for 1000 ms. The partial programs with
    the best mapped pixel agreement (one colour map across all train pairs, as the colormap
    learner reads it), above the identity baseline, are recorded and generalised the same way.
  - **(iii) imagination**: `propose()` over the DSL with combinators the chain grammar cannot
    say:
    - per object lift (`each.c8`, `each.m8`)
    - per partition cell (`cells`)
    - per colour layer (`layers`)
    - superpose (`overlay`, `under`) or lay side by side (`hcat`, `vcat`)
    - four quadrants (`quad`)
    - fixed point (`fix`)
    - conjugation (T, inner, inverse of T)
    - analogy (a sibling swap in a memory chain)
    - select then transform (`sel`): one of the 23 base object selectors (for example smallest
      or topmost) picks some objects, the inner word runs on each picked object cut out on
      background, the result is pasted back centred, and every other cell stays as it was.
- **Round 2 of the imagination**: `imagineWords` runs 2 rounds. The second round draws half the
  budget, its memory holds the first round's words, and its inner words are the first round's
  words. So it can only return what nests them, for example a per object lift of a superpose,
  and a nesting that repeats round 1 is rejected as memory.
- **Admission, the same in both arms**: `admitFor` ranks a library for one task. It reads the
  train pairs and the test inputs, never the test outputs:
  - stage 1 runs every word on the first train input;
  - stage 2 runs the best 4k on every train and test input and scores improvement (the cells
    that had to change and now match under one colour map, minus the cells broken);
  - ties break by key, and the top 32 enter the search at cost 1, ahead of the base words.
- `searchWith` is `searchGrid` with those words added. Answers are still run as cells: an
  invented step runs in a `grid.invent` cell, and `grid.dsl.match` cells check every train
  pair.
- `InventedVocabulary` holds the kept words. A word enters only through the gate.
- `patchFor` turns a kept chain into a code patch for `capability/grid-dsl.mjs`, which the gate
  holds for the autopilot. Combinators are not proposed, since they need this file's
  interpreter.

**bench/imagine.mjs: the bar.**

1. **Mine.** Search every timeout for 1000 ms (source ii).
2. **Build the libraries.** The invented library comes from (i), (ii) and (iii). The null
   library holds as many random compositions and pairwise recombinations of the same memory.
3. **Solve.** Each task runs twice, once per arm, with the arms interleaved on 2 workers:
   - one 3000 ms clock per task per arm covers admission and search;
   - a word is never offered to a task it was mined or collapsed from;
   - a solve that uses an added word puts that word in the arm's run time vocabulary: through
     the gate for the invented arm, by the same rule for the null arm, so both arms grow alike.
4. **Propose objectives.** The run proposes objectives from what it measured and writes the
   approved ones to `state/imagine/objectives.jsonl`. It also writes held patches to
   `state/imagine/patches.jsonl`, and a bar run merges its kept words into
   `state/imagine/vocabulary.json` (by key, with the union of the tasks they solved and the runs
   that kept them).
5. **Log the run.** Every complete run, and every run of one whole shape class, appends a record
   to `state/imagine/runs.jsonl`: its start and end, command, split, options, the ids each arm
   solved, the kept words, the per operator and per shape counts, and the carried words' solves.
6. **Grade the objectives.** Every run prints how the objectives in the file stand against the
   runs that tested them (see Vision below).
7. **Keep the summary.** The verdict keeps the summary lines exactly as printed (`printed`), so a
   lost or shared stdout cannot lose them. This was added after run 2, whose stdout file was
   shared by accident with another builder's census.

Options and modes added since run 2:

- `--carry` reads `state/imagine/vocabulary.json` and puts the kept words of earlier bar runs in
  the invented arm, and the null words that solved in the null arm, before the run starts. A
  carried word is not counted again as kept.
- `node bench/imagine.mjs --runs` prints the runs log grouped by setting, with a two sided sign
  test on the runs.
- `node bench/imagine.mjs --objectives` prints every objective with its grade.

Naming of other runs:

- A narrower run (`--limit`, `--ids`, `--shape`) writes `imagine-partial.json` with isTheBar
  false and keeps its state under `state/imagine/partial/`, so a probe never becomes the bar's
  memory.
- A complete run with any bar option changed (split, budget, workers, admit, admit fraction,
  mining clock, mining depth, imagination budget, seed, knowledge or carry) writes
  `imagine-<option>-<value>.json` with isTheBar false, and also keeps its state under
  `state/imagine/partial/`.

## The bar, printed

Run 2, the current verdict:

    tasks 236 (the fixed vocabulary timed out on every one at 3000 ms in bench/verdicts/grid.json)
    solved with invented primitives at the same budget: 4 of 236 (31aa019c, 44f52bb0, 794b24be, d4469b4b)
    solved by the null arm (random compositions and recombinations at the same budget): 3 of 236 (44f52bb0, 6cdd2623, 794b24be)
    solved by the fixed vocabulary: 0 of 236 (by construction: these are its timeouts)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 17, null 17
    primitives invented: 3665 (collapse 24, collapse.generalised 138, timeout 240, timeout.generalised 1442, imagine 1821); null library 3665
    primitives kept: 5 through the gate (5 submitted, 0 refused); null arm words that solved: 4
    mean novelty distance of kept primitives: 0.2385 (hypervector distance from the nearest word of the base vocabulary)
    objectives proposed: 4, written to state/imagine/objectives.jsonl: 4 (15 were already there); patches proposed and held: 4
    ms per task: invented arm 2825.57 (admission 83.69 ms, 32 words admitted), null arm 2820.3 (admission 95.85 ms, 31.98 admitted); killed at the hard deadline 0, errors 0
    phases: mine 120.76 s (0 found a program while mining), invent 5.15 s, solve 667.61 s; wall 793.57 s; peak rss 1549 MB
    wrote bench/verdicts/imagine.json (isTheBar true)

Run 1, the earlier run of the same command with the round 1 library:

    solved with invented primitives at the same budget: 4 of 236 (28e73c20, 44f52bb0, 794b24be, d4469b4b)
    solved by the null arm (random compositions and recombinations at the same budget): 3 of 236 (31aa019c, 44f52bb0, d4469b4b)
    primitives invented: 3232 (collapse 24, collapse.generalised 138, timeout 243, timeout.generalised 1459, imagine 1368); null library 3232
    primitives kept: 4 through the gate (4 submitted, 0 refused); null arm words that solved: 4
    mean novelty distance of kept primitives: 0.2786 (hypervector distance from the nearest word of the base vocabulary)
    objectives proposed: 15, written to state/imagine/objectives.jsonl: 15 (0 were already there); patches proposed and held: 3
    phases: mine 120.19 s (0 found a program while mining), invent 6.3 s, solve 671.78 s; wall 798.35 s; peak rss 1559 MB

Seed s2, the bar's command plus `--seed s2` (another imagination draw and null draw):

    solved with invented primitives at the same budget: 4 of 236 (11852cab, 44f52bb0, 794b24be, d4469b4b)
    solved by the null arm (random compositions and recombinations at the same budget): 4 of 236 (31aa019c, 44f52bb0, 794b24be, d4469b4b)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 17, null 17
    primitives invented: 3697 (collapse 24, collapse.generalised 138, timeout 245, timeout.generalised 1473, imagine 1817); null library 3697
    primitives kept: 5 through the gate (5 submitted, 0 refused); null arm words that solved: 5
    mean novelty distance of kept primitives: 0.2857 (hypervector distance from the nearest word of the base vocabulary)
    phases: mine 119.99 s (0 found a program while mining), invent 4.29 s, solve 670.29 s; wall 794.63 s; peak rss 1594 MB

**The kept words of run 2**, each with its source, operator, novelty and held out solve (from
`bench/verdicts/imagine.json`):

| word | source | operator | novelty | solved |
| --- | --- | --- | --- | --- |
| `chain(antiTranspose,keepRareColor,antiTranspose)` | imagine | conjugate | 0.180054 | 31aa019c |
| `chain(outline8,recolorBorder)` | imagine | analogy | 0.189819 | 31aa019c |
| `chain(recolorSize4,trimBorder)` | collapse | | 0.183594 | 44f52bb0 |
| `fix(chain(rot90,gravityUp,slideLeft))` | imagine | fixpoint | 0.358154 | 794b24be |
| `chain(objectsC4,colorOf,pixel,up3)` | collapse.generalised | | 0.280884 | d4469b4b |

Run 1 kept four words:

- `fix(chain(frame,invert,hollow))` (imagine, fixpoint, 0.355469, 28e73c20);
- `chain(flipH,recolorSize4,trimBorder,flipH)` (imagine, conjugate, 0.231812, 44f52bb0);
- `chain(antiTranspose,gravityUp,recolorSize4)` (timeout.generalised, 0.246094, 794b24be);
- `chain(objectsC4,colorOf,pixel,up3)` (collapse.generalised, 0.280884, d4469b4b).

The training tasks only the invented arm solved, and the program that solved each (from the
verdicts' rows):

- 28e73c20 (run 1): `fix(chain(frame,invert,hollow))`, then localRule;
- 31aa019c (run 2): the conjugation `chain(antiTranspose,keepRareColor,antiTranspose)`, then the
  analogy `chain(outline8,recolorBorder)`, then stamp;
- 11852cab (seed s2): a superpose `both.overlay(id,outline4)`, then a per object lift
  `each.m8(symFillD4)`, then colormap.

**The imagination by round in run 2**: round 1 drew 1600 and kept 1409; round 2 drew 800 and
kept 412, with 189 rejected as memory and 148 as within the floor.

**By operator in run 2** (words in the library, then tasks solved):

| operator | words | solved |
| --- | --- | --- |
| lift.object | 237 | 0 |
| lift.cell | 234 | 0 |
| lift.layer | 239 | 0 |
| superpose | 231 | 0 |
| quarter | 172 | 0 |
| fixpoint | 238 | 1 |
| lift.select | 244 | 0 |
| analogy | 95 | 1 |
| conjugate | 131 | 1 |

## The evaluation split: the first test on tasks nothing here was written against

`node --max-old-space-size=4000 bench/imagine.mjs --split evaluation --budget-ms 3000 --workers 2
--carry` runs the same bench over the 321 evaluation tasks the fixed vocabulary timed out on
(`bench/verdicts/grid-evaluation.json`). The DSL, the combinators, the screen and every option were
written and tuned on the training split only. `--carry` adds the kept words of the training bar
runs to the invented arm (8 words) and the null words that solved to the null arm (8 words).
It printed:

    tasks 321 (the fixed vocabulary timed out on every one at 3000 ms in bench/verdicts/grid-evaluation.json)
    solved with invented primitives at the same budget: 7 of 321 (32e9702f, 45737921, 62ab2642, 9110e3c5, 929ab4e9, 9c1e755f, bf32578f)
    solved by the null arm (random compositions and recombinations at the same budget): 3 of 321 (32e9702f, 62ab2642, 642d658d)
    solved by the fixed vocabulary: 0 of 321 (by construction: these are its timeouts)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 6, null 3
    primitives invented: 4189 (collapse 14, collapse.generalised 72, timeout 330, timeout.generalised 1931, imagine 1842); null library 4189
    primitives kept: 7 through the gate (10 submitted, 0 refused); null arm words that solved: 3
    carried from state/imagine/vocabulary.json (written 2026-09-24T02:49:53.780Z): invented arm 8 words solved 1 tasks (9110e3c5), null arm 8 words solved 1 (32e9702f)
    transfer objectives in state/imagine/objectives.jsonl: 7, their word carried 7, met 1 (chain(objectsC4,colorOf,pixel,up3))
    mean novelty distance of kept primitives: 0.3165 (hypervector distance from the nearest word of the base vocabulary)
    objectives proposed: 7, written to state/imagine/partial/objectives.jsonl: 7 (23 were already there); patches proposed and held: 2
    ms per task: invented arm 2923.08 (admission 111.4 ms, 32 words admitted), null arm 2968.43 (admission 125.06 ms, 32 admitted); killed at the hard deadline 0, errors 0
    phases: mine 163.47 s (0 found a program while mining), invent 5.78 s, solve 946.17 s; wall 1115.49 s; peak rss 1546 MB
    wrote bench/verdicts/imagine-evaluation-carry-true.json (every evaluation timeout, isTheBar false)

The 7 words it kept (from the verdict's `kept`):

| word | source | operator | novelty | solved |
| --- | --- | --- | --- | --- |
| `chain(rot90,shiftUp,rot270)` | imagine | conjugate | 0.24646 | 32e9702f |
| `both.overlay(id,chain(outline8,ray4))` | imagine | superpose | 0.379395 | 32e9702f, 62ab2642 |
| `each.m8(layers(invert))` | imagine | lift.object | 0.348755 | 45737921, bf32578f |
| `fix(chain(outline8,recolorSizeRank))` | imagine | fixpoint | 0.346069 | 62ab2642 |
| `layers(symFillD4)` | imagine | lift.layer | 0.311401 | 929ab4e9 |
| `each.m8(both.overlay(id,periodicUnmask))` | imagine | lift.object | 0.394287 | 9c1e755f |
| `chain(connectHVP,symFillH)` | timeout.generalised | | 0.189209 | bf32578f |

By operator on the evaluation split (words, then solves by a word of that operator, from the
verdict's `operators`): lift.object 230/3, lift.cell 235/0, lift.layer 234/1, superpose 230/2,
quarter 171/0, fixpoint 239/1, lift.select 236/0, conjugate 167/1, analogy 100/0.

What this adds:

- **Out of sample, the invented arm solved 7 and the null 3.** Five tasks were solved by the
  invented arm alone (45737921, 9110e3c5, 929ab4e9, 9c1e755f, bf32578f) and one by the null alone
  (642d658d). On those 6 tasks a two sided sign test gives p 0.21875 (printed by the bench's
  `signTest(5, 1)` in a one off node -e). One run does not decide it; the replicate is below.
- **The combinators that solved nothing on training solve here.** Per object lift, superpose and
  per layer solved 0 training tasks in run 2; on evaluation their words have 6 of the 10 solves
  by kept words. Six of the 7 kept words come from the imagination proper, not from collapsed or
  mined chains. (A later training run, the doubt run below, drew a library whose round 1 words
  helped solve 4 training tasks: which words a draw holds decides which tasks fall.)
- **One carried word transferred.** `chain(objectsC4,colorOf,pixel,up3)`, collapsed and
  generalised from training, solved the evaluation task 9110e3c5, which meets its transfer
  objective. The other 7 carried invented words solved nothing here.
- `each.m8(both.overlay(id,periodicUnmask))` is a per object lift of a superpose. Round 1's inner
  words are base words, so this nesting can only come from round 2. That is read from the code:
  the kept record of this run did not store the round (the vocabulary stores it from round 7 of
  the bench on).

**The plan for the evaluation split, fixed at 2026-09-24T03:49:53Z before the third run started.** Three
evaluation runs with --carry: the default seed, s2 and s3. After s3 the per task sign test from
`node bench/imagine.mjs --runs` is reported as it comes out, whatever it is, and no fourth seed
is added to move it. After two runs it printed: invented ahead on 7 tasks, behind on 1, p 0.0703.

**The replicate with seed s2** (another imagination draw and null draw, the same carried words)
printed:

    solved with invented primitives at the same budget: 4 of 321 (32e9702f, 9110e3c5, a8610ef7, d2acf2cb)
    solved by the null arm (random compositions and recombinations at the same budget): 2 of 321 (32e9702f, 642d658d)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 9, null 4
    primitives invented: 4171 (collapse 14, collapse.generalised 72, timeout 331, timeout.generalised 1937, imagine 1817); null library 4171
    primitives kept: 4 through the gate (5 submitted, 0 refused); null arm words that solved: 1
    carried from state/imagine/vocabulary.json (written 2026-09-24T02:49:53.780Z): invented arm 8 words solved 1 tasks (9110e3c5), null arm 8 words solved 1 (642d658d)
    transfer objectives in state/imagine/objectives.jsonl: 7, their word carried 7, met 1 (chain(objectsC4,colorOf,pixel,up3))
    mean novelty distance of kept primitives: 0.2622 (hypervector distance from the nearest word of the base vocabulary)
    phases: mine 163.41 s (0 found a program while mining), invent 5.75 s, solve 948.34 s; wall 1117.56 s; peak rss 1562 MB
    objectives graded by the runs that tested them after they were written: 19 in state/imagine/objectives.jsonl, met 1, mixed 1, not met 11, untested 6

- The direction held (4 against 2; invented alone 3, null alone 1), but the tasks moved: of the
  first run's 7, only 32e9702f and 9110e3c5 came back. Which combinator words the imagination
  draws decides which tasks fall, so one draw is a small sample of what the space can do.
- The carried collapsed word `chain(objectsC4,colorOf,pixel,up3)` solved 9110e3c5 again: the
  one transfer that repeats.

**The third seed, s3** (run under the plan above) printed:

    solved with invented primitives at the same budget: 4 of 321 (32e9702f, 9110e3c5, 9c1e755f, d2acf2cb)
    solved by the null arm (random compositions and recombinations at the same budget): 1 of 321 (81c0276b)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 9, null 11
    paired by task: invented only 4 (32e9702f, 9110e3c5, 9c1e755f, d2acf2cb), null only 1 (81c0276b), both 0; two sided sign test on the tasks one arm alone solved: p 0.375
    by operator (words in the library / solves by a word of it): lift.object 237/1, lift.cell 234/0, lift.layer 240/0, superpose 236/1, quarter 175/0, fixpoint 245/0, lift.select 237/0, conjugate 166/0, analogy 87/1
    carried from state/imagine/vocabulary.json (written 2026-09-24T02:49:53.780Z): invented arm 8 words solved 1 tasks (9110e3c5), null arm 8 words solved 0
    phases: mine 163.37 s (0 found a program while mining), invent 5.36 s, solve 943.36 s; wall 1112.16 s; peak rss 1635 MB

It also printed `imagination by round (...): none`, which was wrong: the bench copied each word
into its library without the round, so the tally never saw one. Fixed in round 8 (the entry
keeps the round, and the line now says how many imagined words have no round instead of a
silent none); a 4 task partial run then printed `round 1 1417 words, 0 tasks; round 2 368
words, 0 tasks`.

**The pre-registered result.** After the three seeds, `node bench/imagine.mjs --runs` printed for
the evaluation split:

      pooled: invented 15, null 6 over 3 runs; invented ahead in 3, tied 0, behind 0; sign test p 0.25
      paired per run (a task one arm alone solved, once per run): invented only 12, null only 3; sign test p 0.0352 (runs share tasks, so this p is optimistic)
      paired per task (runs solved by invented minus by null, one vote per task): invented ahead 8, behind 2; sign test p 0.1094

So on tasks nothing here was written against, the invented arm solved 15 to the null's 6 over three
draws, led in every run, and is ahead on 8 tasks against 2. The per task test, the one that does
not count a task twice, gives p 0.1094: suggestive, not decided at 0.05. No fourth seed was added.

## Across runs

`node bench/imagine.mjs --runs` printed, after the evaluation replicate (lines per run left out).
It pairs the arms two ways. Per run counts a task once in every run where one arm alone solved
it; runs share tasks, so that p is optimistic. Per task gives each task one vote, the sign of
the runs the invented arm solved it in minus the runs the null did:

    training, 3000 ms, admit 32, admit fraction 0.4, imagination budget 1600: 3 runs
      pooled: invented 12, null 10 over 3 runs; invented ahead in 2, tied 1, behind 0; sign test p 0.5
      paired per run (a task one arm alone solved, once per run): invented only 5, null only 3; sign test p 0.7266 (runs share tasks, so this p is optimistic)
      paired per task (runs solved by invented minus by null, one vote per task): invented ahead 4, behind 2; sign test p 0.6875
    evaluation, 3000 ms, admit 32, admit fraction 0.4, imagination budget 1600, carried vocabulary: 2 runs
      pooled: invented 11, null 5 over 2 runs; invented ahead in 2, tied 0, behind 0; sign test p 0.5
      paired per run (a task one arm alone solved, once per run): invented only 8, null only 2; sign test p 0.1094 (runs share tasks, so this p is optimistic)
      paired per task (runs solved by invented minus by null, one vote per task): invented ahead 7, behind 1; sign test p 0.0703

(Run 1's record was backfilled from its verdict copy, and run 2's and seed s2's from theirs, since
the log was added after they ran.)

## Doubt: a check on memorising learners (round 8)

Most programs that fit every train pair and fail the test end in a learner of the DSL's top cost
(3: localRule, stamp, rayLearned; the DSL itself prices them highest). A probe
(`test/imagine-loo-probe.mjs`) rebuilds every found program in
the verdicts, checks that each rebuild reproduces its recorded right or wrong (a rebuild that
fails or disagrees is counted, not dropped), then refits the last learner on all train pairs but
one and asks it to predict the pair left out. Re-run for this note, it printed over the three
training verdicts (run 1, run 2, seed s2):

       3  right, colormap, leave one out fails every pair
       3  right, colormap, leave one out fails some pairs
       1  right, colormap, leave one out passes
       8  right, localRule, leave one out fails some pairs
       3  right, localRule, leave one out passes
       1  right, no learner
       3  right, stamp, leave one out passes
       2  wrong, colormap, leave one out fails every pair
       8  wrong, colormap, leave one out fails some pairs
       3  wrong, colormap, leave one out passes
      78  wrong, localRule, leave one out fails every pair
       1  wrong, localRule, leave one out fails some pairs
       5  wrong, stamp, leave one out fails every pair
       1  wrong, stamp, leave one out fails some pairs

and over the three evaluation verdicts (the default seed, s2, s3):

       2  right, colormap, leave one out fails every pair
       4  right, colormap, leave one out passes
       2  right, localRule, leave one out fails every pair
       3  right, localRule, leave one out passes
       3  right, no learner
       5  right, stamp, leave one out fails some pairs
       2  right, stamp, leave one out passes
      10  wrong, colormap, leave one out fails every pair
       1  wrong, colormap, leave one out fails some pairs
       6  wrong, colormap, leave one out passes
      17  wrong, localRule, leave one out fails every pair
       2  wrong, localRule, leave one out fails some pairs
       3  wrong, no learner
       2  wrong, objectRecolor, leave one out fails every pair
       1  wrong, stamp, leave one out fails some pairs

No rebuild failed or disagreed with its record (neither line was printed). A colour map does not separate (right ones often need every pair to see every colour), so it is
not asked.

`memorised(L, tr, wanted)` in `capability/grid-invent.mjs` is that check, for top cost learners.
With `--doubt`, `searchWith` keeps a memorised program as a fallback and searches on; it answers
with the fallback only when the search ends without a better one. The same rule runs in both
arms. Test 9 checks, with the search capped at the root, that a memorised fit yields to one that
is not (recolour by size) and still answers when nothing better is found. The same two toys
searched in full printed:

    sized, doubt false: status found, program ["localRule"], doubted 0, from the fallback false
    sized, doubt true: status found, program ["objectRecolor"], doubted 1, from the fallback false
    placed, doubt false: status found, program ["localRule"], doubted 0, from the fallback false
    placed, doubt true: status found, program ["kronInverse","outline8","leftHalf","colormap"], doubted 39, from the fallback false

So doubt can trade one wrong answer for another: the search goes on and may find a longer
spurious fit. It stays off by default until runs say otherwise.

**Caveat on design.** The rule was chosen on the training verdicts, but the evaluation separation
was looked at before the doubt runs, so an evaluation doubt run tests the rule's effect on
solves, not a design that never saw evaluation.

**The decision rule, fixed at 2026-09-24T04:10:37Z before any doubt run.** Two runs: the bar command
plus `--doubt`, and `--split evaluation --carry --doubt`, both on the default seed. Doubt becomes
the default only if, in BOTH runs, the invented arm solves at least as many tasks as it did
without doubt on the same seed (4 on training in run 2, 7 on evaluation) and its found but wrong
count falls. Otherwise it stays off, and the result is reported either way.

**Training, with doubt** (the bar command plus `--doubt`, 2026-09-24) printed:

    solved with invented primitives at the same budget: 7 of 236 (11852cab, 32597951, 44f52bb0, 53b68214, 794b24be, d4469b4b, ef135b50)
    solved by the null arm (random compositions and recombinations at the same budget): 3 of 236 (239be575, 44f52bb0, 4522001f)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 20, null 17
    doubt (a top cost learner that predicts no train pair from the others is kept as a fallback): tasks that doubted a program, invented arm 17, null arm 14; answered from the fallback, invented arm 16, null arm 13
    paired by task: invented only 6 (11852cab, 32597951, 53b68214, 794b24be, d4469b4b, ef135b50), null only 2 (239be575, 4522001f), both 1; two sided sign test on the tasks one arm alone solved: p 0.2891
    primitives invented: 3685 (collapse 24, collapse.generalised 138, timeout 244, timeout.generalised 1465, imagine 1814); null library 3685
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1423 words, 4 tasks (11852cab, 32597951, 53b68214, ef135b50); round 2 391 words, 0 tasks
    by operator (words in the library / solves by a word of it): lift.object 232/1, lift.cell 233/0, lift.layer 234/0, superpose 223/5, quarter 176/0, fixpoint 232/0, lift.select 241/0, analogy 102/0, conjugate 141/0
    phases: mine 120.1 s (0 found a program while mining), invent 4.28 s, solve 694.65 s; wall 819.1 s; peak rss 1491 MB
    wrote bench/verdicts/imagine-doubt-true.json (a variant of the bar, isTheBar false)

Paired against run 2 (the same command and seed without doubt) by a comparison script
(`test/imagine-doubt-compare.mjs`):

    without: node --max-old-space-size=4000 bench/imagine.mjs --split training --budget-ms 3000 --workers 2 at 2026-09-24T02:49:53.780Z (doubt false, seed imagine-bench)
    with:    node --max-old-space-size=4000 bench/imagine.mjs --split training --budget-ms 3000 --workers 2 --doubt at 2026-09-24T04:25:41.854Z (doubt true, seed imagine-bench)
    invented: solved 4 -> 7; found but wrong 17 -> 20; gained 4 (11852cab (was wrong), 32597951 (was timeout), 53b68214 (was timeout), ef135b50 (was timeout)); lost 1 (31aa019c (timeout))
      tasks that doubted a program 17; answered from the fallback 16 (right 0)
      as a flag (with): answers from the fallback 16, right 0; other answers 11, right 7; solved tasks that had doubted a program 0
      changes: solved -> timeout 1, timeout -> solved 3, timeout -> wrong 6, wrong -> solved 1, wrong -> timeout 2
    null: solved 3 -> 3; found but wrong 17 -> 17; gained 2 (239be575 (was wrong), 4522001f (was timeout)); lost 2 (6cdd2623 (timeout), 794b24be (wrong))
      tasks that doubted a program 14; answered from the fallback 13 (right 0)
      as a flag (with): answers from the fallback 13, right 0; other answers 7, right 3; solved tasks that had doubted a program 0
      changes: solved -> timeout 1, solved -> wrong 1, timeout -> solved 1, timeout -> wrong 5, wrong -> solved 1, wrong -> timeout 5

The same script on run 1 against run 2, neither with doubt, is the control for how far two runs
of one configuration move on their own:

    without: node --max-old-space-size=4000 bench/imagine.mjs --split training --budget-ms 3000 --workers 2 at 2026-09-24T02:33:15.606Z (doubt false, seed imagine-bench)
    with:    node --max-old-space-size=4000 bench/imagine.mjs --split training --budget-ms 3000 --workers 2 at 2026-09-24T02:49:53.780Z (doubt false, seed imagine-bench)
    invented: solved 4 -> 4; found but wrong 15 -> 17; gained 1 (31aa019c (was timeout)); lost 1 (28e73c20 (timeout))
      changes: solved -> timeout 1, timeout -> solved 1, timeout -> wrong 4, wrong -> timeout 2
    null: solved 3 -> 3; found but wrong 15 -> 17; gained 2 (6cdd2623 (was timeout), 794b24be (was wrong)); lost 2 (31aa019c (wrong), d4469b4b (wrong))
      changes: solved -> wrong 2, timeout -> solved 1, timeout -> wrong 4, wrong -> solved 1, wrong -> timeout 3

What that says:

- **Doubt stays off.** The invented arm's found but wrong count rose (17 to 20), so the rule fixed
  above fails on the first of its two runs. The evaluation run is still made, to finish the pair
  and to test the flag out of sample.
- **The rise in solves (4 to 7) is not doubt's.** No solved task had doubted a program, in either
  arm. The libraries differ (3665 words in run 2, 3685 here: mining runs against a clock), and
  the control's changes line shows invented arm tasks moving with no doubt at all. The 4 new solves
  are the 4 tasks round 1 imagined words helped solve (the round line above).
- **Doubt barely changes an answer.** Of 17 invented arm tasks that doubted a program, 16 ended on
  the fallback; the search on found nothing better in the budget. Where it did go on (5117e062, in
  both arms) it found another wrong program, as the toy predicted.
- **As a flag it is exact on this run.** Every answer from the fallback was wrong (16 of 16
  invented, 13 of 13 null), and no right answer was flagged. So the solver can say which of its
  answers are guesses: 16 of the invented arm's 20 wrong answers carry the flag. These are the
  training tasks the rule was chosen on, so the evaluation run is the test of it.

**Evaluation, with doubt** (`--split evaluation --carry --doubt`, the default seed) printed:

    carried from state/imagine/vocabulary.json: invented arm 8 words, null arm 8
    solved with invented primitives at the same budget: 4 of 321 (9110e3c5, 929ab4e9, 9c1e755f, f823c43c)
    solved by the null arm (random compositions and recombinations at the same budget): 1 of 321 (62ab2642)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 7, null 9
    doubt (a top cost learner that predicts no train pair from the others is kept as a fallback): tasks that doubted a program, invented arm 5, null arm 4; answered from the fallback, invented arm 4, null arm 4
    paired by task: invented only 4 (9110e3c5, 929ab4e9, 9c1e755f, f823c43c), null only 1 (62ab2642), both 0; two sided sign test on the tasks one arm alone solved: p 0.375
    primitives invented: 4182 (collapse 14, collapse.generalised 72, timeout 331, timeout.generalised 1937, imagine 1828); null library 4182
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1431 words, 0 tasks; round 2 397 words, 3 tasks (929ab4e9, 9c1e755f, f823c43c)
    by operator (words in the library / solves by a word of it): lift.object 233/1, lift.cell 238/0, lift.layer 241/1, superpose 221/0, quarter 173/0, fixpoint 234/1, lift.select 239/0, conjugate 163/0, analogy 86/0
    carried from state/imagine/vocabulary.json (written 2026-09-24T02:49:53.780Z): invented arm 8 words solved 1 tasks (9110e3c5), null arm 8 words solved 0
    phases: mine 163.22 s (0 found a program while mining), invent 5.27 s, solve 954.28 s; wall 1122.85 s; peak rss 1557 MB
    wrote bench/verdicts/imagine-evaluation-carry-true-doubt-true.json (every evaluation timeout, isTheBar false)

Paired against the evaluation run on the same seed without doubt:

    without: node --max-old-space-size=4000 bench/imagine.mjs --split evaluation --budget-ms 3000 --workers 2 --carry at 2026-09-24T03:27:51.315Z (doubt false, seed imagine-bench)
    with:    node --max-old-space-size=4000 bench/imagine.mjs --split evaluation --carry --doubt at 2026-09-24T04:46:25.158Z (doubt true, seed imagine-bench)
    invented: solved 7 -> 4; found but wrong 6 -> 7; gained 1 (f823c43c (was timeout)); lost 4 (32e9702f (wrong), 45737921 (timeout), 62ab2642 (wrong), bf32578f (timeout))
      tasks that doubted a program 5; answered from the fallback 4 (right 0)
      as a flag (with): answers from the fallback 4, right 0; other answers 7, right 4; solved tasks that had doubted a program 1
      changes: solved -> timeout 2, solved -> wrong 2, timeout -> solved 1, wrong -> timeout 1
    null: solved 3 -> 1; found but wrong 3 -> 9; gained 0; lost 2 (32e9702f (wrong), 642d658d (wrong))
      tasks that doubted a program 4; answered from the fallback 4 (right 0)
      as a flag (with): answers from the fallback 4, right 0; other answers 6, right 1; solved tasks that had doubted a program 0
      changes: solved -> wrong 2, timeout -> wrong 4

**The decision: doubt stays off.** The invented arm solved fewer (7 to 4) and its found but wrong
count rose (6 to 7), so the rule fails on this run as well as on training. That is final for
this round; the default is unchanged.

**The rule measured the draw, not doubt.** It compared two runs whose libraries differ (4189
words without doubt here, 4182 with). A fair measure stays inside one run: without doubt,
`searchWith` returns its first fit, and that first fit is exactly what doubt keeps aside as the
fallback (read from the code: `if (!fallback) fallback = r; continue;` where the plain path is
`if (r) return r;`). So doubt changed an answer only where a task doubted and did not end on the
fallback. A listing script (`test/imagine-doubt-changed.mjs`) printed, for training:

    invented: answers doubt changed (doubted, not ended on the fallback): 1 (5117e062 (wrong))
    invented: tasks gained or lost against the run without doubt: 11852cab gained, doubted 0; 31aa019c lost, doubted 0; 32597951 gained, doubted 0; 53b68214 gained, doubted 0; ef135b50 gained, doubted 0
    null: answers doubt changed (doubted, not ended on the fallback): 1 (5117e062 (wrong))
    null: tasks gained or lost against the run without doubt: 239be575 gained, doubted 0; 4522001f gained, doubted 0; 6cdd2623 lost, doubted 0; 794b24be lost, doubted 0

and for evaluation:

    invented: answers doubt changed (doubted, not ended on the fallback): 1 (f823c43c (solved))
    invented: tasks gained or lost against the run without doubt: 32e9702f lost, doubted 0; 45737921 lost, doubted 0; 62ab2642 lost, doubted 0; bf32578f lost, doubted 0; f823c43c gained, doubted 1
    null: answers doubt changed (doubted, not ended on the fallback): 0
    null: tasks gained or lost against the run without doubt: 32e9702f lost, doubted 0; 642d658d lost, doubted 0

- Every task gained or lost between the runs had doubted nothing, except f823c43c: the losses
  (32e9702f among them, solved in all three evaluation runs without doubt) came from the draw.
- Inside the runs, doubt changed one invented arm answer each time: 5117e062 on training (still
  wrong) and f823c43c on evaluation, solved after the search went on past a doubted fit, by a
  round 2 word. The fallback it replaced was not scored; fallbacks were right 0 times in both runs.
- **The flag held out of sample.** On evaluation every answer from the fallback was wrong again
  (4 of 4 in each arm).

So doubt is a sound signal and a weak change to the search: it marks guesses, and at this budget
the search rarely finds anything better once it has doubted. Scoring the fallback inside the run
would measure the change exactly; that is not built.

## The shape suites (round 9)

Four objectives ask for a combinator that solves a timeout of a shape class nothing solved. Each
names its suite: the bar command plus `--shape <class>`, which mines, imagines and solves on
that class's training timeouts only (the mult run mined 22 timeout words, where run 2, over all
236, mined 240). Run one after another, they printed:

**`--shape mult`**

    tasks 10 (the fixed vocabulary timed out on every one at 3000 ms in bench/verdicts/grid.json)
    solved with invented primitives at the same budget: 1 of 10 (4522001f)
    solved by the null arm (random compositions and recombinations at the same budget): 1 of 10 (4522001f)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 0, null 0
    primitives invented: 2164 (collapse 24, collapse.generalised 138, timeout 22, timeout.generalised 137, imagine 1843); null library 2164
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1453 words, 1 tasks (4522001f); round 2 390 words, 0 tasks
    by operator (words in the library / solves by a word of it): lift.object 225/0, lift.cell 227/0, lift.layer 238/0, superpose 233/0, quarter 175/0, fixpoint 226/1, lift.select 241/0, conjugate 167/0, analogy 111/0

**`--shape mult+other`**

    tasks 2 (the fixed vocabulary timed out on every one at 3000 ms in bench/verdicts/grid.json)
    solved with invented primitives at the same budget: 0 of 2
    solved by the null arm (random compositions and recombinations at the same budget): 0 of 2
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 0, null 0
    primitives invented: 1986 (collapse 24, collapse.generalised 138, timeout 3, timeout.generalised 18, imagine 1803); null library 1986
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1442 words, 0 tasks; round 2 361 words, 0 tasks
    by operator (words in the library / solves by a word of it): lift.object 225/0, lift.cell 221/0, lift.layer 223/0, superpose 223/0, quarter 174/0, fixpoint 234/0, lift.select 238/0, conjugate 162/0, analogy 103/0

**`--shape smaller+same`**

    tasks 1 (the fixed vocabulary timed out on every one at 3000 ms in bench/verdicts/grid.json)
    solved with invented primitives at the same budget: 0 of 1
    solved by the null arm (random compositions and recombinations at the same budget): 0 of 1
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 0, null 0
    primitives invented: 1942 (collapse 24, collapse.generalised 138, imagine 1780); null library 1942
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1426 words, 0 tasks; round 2 354 words, 0 tasks
    by operator (words in the library / solves by a word of it): lift.object 230/0, lift.cell 226/0, lift.layer 228/0, superpose 227/0, quarter 176/0, fixpoint 224/0, lift.select 233/0, conjugate 164/0, analogy 72/0

**`--shape other+mult`**

    tasks 2 (the fixed vocabulary timed out on every one at 3000 ms in bench/verdicts/grid.json)
    solved with invented primitives at the same budget: 1 of 2 (53b68214)
    solved by the null arm (random compositions and recombinations at the same budget): 0 of 2
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 0, null 0
    primitives invented: 1954 (collapse 24, collapse.generalised 138, timeout 4, timeout.generalised 24, imagine 1764); null library 1954
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1413 words, 1 tasks (53b68214); round 2 351 words, 0 tasks
    by operator (words in the library / solves by a word of it): lift.object 235/0, lift.cell 228/0, lift.layer 224/0, superpose 218/2, quarter 175/0, fixpoint 232/0, lift.select 234/0, conjugate 152/0, analogy 66/0

and `node bench/imagine.mjs --objectives` graded them:

      met | shape | a combinator built for mult shape tasks solves at least one of the 10 mult timeouts nothing solved | bar >= 1 | measured 1 in 1 run | null arm on the same metric 1
      not met | shape | a combinator built for mult+other shape tasks solves at least one of the 2 mult+other timeouts nothing solved | bar >= 1 | measured 0 in 1 run | null arm on the same metric 0
      not met | shape | a combinator built for smaller+same shape tasks solves at least one of the 1 smaller+same timeouts nothing solved | bar >= 1 | measured 0 in 1 run | null arm on the same metric 0
      met | shape | a combinator built for other+mult shape tasks solves at least one of the 2 other+mult timeouts nothing solved | bar >= 1 | measured 1 in 1 run | null arm on the same metric 0

- **other+mult is met beyond the null**: 53b68214, by a round 1 word, where the null solved nothing.
- **mult is met on its bar, not beyond the null**: the null solved the same task, 4522001f.
- **mult+other and smaller+same are not met**: neither arm solved a task.
- These are 10, 2, 1 and 2 tasks, one run each. They say the classes are not closed to the
  imagination, not that it beats recombination on them.

**The grade now carries its control.** A shape bar (and the screen bar) counts the invented arm
alone, although every objective names the null arm as its control, so the first mult grade
read "met" with nothing said about the null that solved the same task. The grading now reads
the null arm's value on the same metric from the same run (`controlOf` in `bench/imagine.mjs`)
and prints it beside the measure. The status still follows the bar as it was written; no bar
was changed.

**File naming.** A shape suite now writes `imagine-shape-<class>-partial.json`. The mult suite ran
before that fix, wrote the shared `imagine-partial.json`, and was copied to
`bench/verdicts/imagine-shape-mult-partial.json` before the next suite could overwrite it.

## The screen suite: admitting 64 words instead of 32

The screen objective predicted that admitting 64 words per task instead of 32 solves more timeouts
in the invented arm without losing the lead over the null. Its suite (the bar command plus
`--admit 64`) printed:

    solved with invented primitives at the same budget: 5 of 236 (32597951, 44f52bb0, 53b68214, 794b24be, d4469b4b)
    solved by the null arm (random compositions and recombinations at the same budget): 5 of 236 (11852cab, 44f52bb0, 6773b310, 6cdd2623, d4469b4b)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 13, null 15
    paired by task: invented only 3 (32597951, 53b68214, 794b24be), null only 3 (11852cab, 6773b310, 6cdd2623), both 2; two sided sign test on the tasks one arm alone solved: p 1
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1410 words, 3 tasks (32597951, 44f52bb0, 53b68214); round 2 409 words, 0 tasks
    by operator (words in the library / solves by a word of it): lift.object 236/0, lift.cell 238/0, lift.layer 236/0, superpose 229/4, quarter 176/0, fixpoint 231/0, lift.select 242/0, analogy 102/0, conjugate 129/0
    phases: mine 120.18 s (0 found a program while mining), invent 4.71 s, solve 674.51 s; wall 799.48 s; peak rss 1536 MB
    wrote bench/verdicts/imagine-admit-64.json (a variant of the bar, isTheBar false)

- **Met on its bar, failed on its own words.** The bar counts the invented arm alone (more than 4),
  and it solved 5. But the hypothesis also says "without losing the lead over the null", and the
  null solved 5 too: run 2 at 32 led 4 to 3, this run is level. The bar the template wrote encoded
  only the first clause. That is the template's defect, reported here, not a reason to regrade.
- One run, and runs of one configuration move on their own (the control above), so this does not
  show that a wider screen helps either arm.

## The budget suite: twice the clock

The budget objective, written by run 1, predicted that at 6000 ms the invented arm leads the null
by more than the 1 it led by at 3000 ms. Its suite (the bar command with `--budget-ms 6000`)
printed:

    tasks 236 (the fixed vocabulary timed out on every one at 3000 ms in bench/verdicts/grid.json)
    solved with invented primitives at the same budget: 10 of 236 (11852cab, 2dee498d, 32597951, 44f52bb0, 4522001f, 53b68214, 6773b310, 73251a56, 794b24be, d4469b4b)
    solved by the null arm (random compositions and recombinations at the same budget): 6 of 236 (31aa019c, 44f52bb0, 6cdd2623, 794b24be, ae4f1146, d4469b4b)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 18, null 19
    paired by task: invented only 7 (11852cab, 2dee498d, 32597951, 4522001f, 53b68214, 6773b310, 73251a56), null only 3 (31aa019c, 6cdd2623, ae4f1146), both 3; two sided sign test on the tasks one arm alone solved: p 0.3438
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1421 words, 6 tasks (11852cab, 2dee498d, 32597951, 4522001f, 53b68214, 73251a56); round 2 400 words, 1 tasks (53b68214)
    by operator (words in the library / solves by a word of it): lift.object 238/1, lift.cell 236/0, lift.layer 238/0, superpose 230/6, quarter 173/0, fixpoint 235/1, lift.select 240/0, analogy 91/0, conjugate 140/2
    primitives kept: 14 through the gate (17 submitted, 0 refused); null arm words that solved: 7
    phases: mine 119.97 s (0 found a program while mining), invent 4.52 s, solve 1303.94 s; wall 1428.52 s; peak rss 1992 MB
    wrote bench/verdicts/imagine-budgetms-6000.json (a variant of the bar, isTheBar false)

A listing script (`test/imagine-new-at-budget.mjs`) read `state/imagine/runs.jsonl` and printed:

    earlier training runs read: 9 (the bar, the bar, seed-s2, doubt-true, the bar shape mult, the bar shape mult+other, the bar shape smaller+same, the bar shape other+mult, admit-64)
    6000 ms invented arm, solved in no earlier training run by either arm: 2 of 10 (2dee498d, 73251a56)
    6000 ms null arm, solved in no earlier training run by either arm: 1 of 6 (ae4f1146)

- **Met on its bar in this run.** The lead measured 4, above the bar of 1.
- **The doubled clock changed the solve, not the library.** Mining ran 119.97 s here and 120.76 s
  in run 2, on the same mining clock, and the libraries are the same kind of draw (3699 words
  here, 3665 in run 2). Every solve in both arms used an added word (0 without one).
- **Both arms gained.** The invented arm solved 10 where the three 3000 ms runs of the bar solved
  4 each; the null solved 6 where they solved 3, 3 and 4. Most of the gain is tasks some arm had
  already solved in an earlier run; the listing above names the ones no earlier training run had.
- **Not decided.** One run. Per task, invented ahead 7, behind 3, sign test p 0.3438. And a lead of the
  same size has come from a single 3000 ms run: the doubt run printed 7 against 3, where doubt
  changed one invented answer inside the run, so most of that lead was the draw. This meets the
  written bar; it does not show that the lead grows with the clock.

**The replicate with seed s2** (another imagination draw and null draw, the same clock) printed:

    solved with invented primitives at the same budget: 6 of 236 (2dee498d, 32597951, 44f52bb0, 53b68214, 794b24be, d4469b4b)
    solved by the null arm (random compositions and recombinations at the same budget): 8 of 236 (11852cab, 31aa019c, 44f52bb0, 4522001f, 6773b310, 794b24be, cf98881b, f8b3ba0a)
    solved without an added word under the same clock: invented arm 0, null arm 0; found but wrong: invented 22, null 20
    paired by task: invented only 4 (2dee498d, 32597951, 53b68214, d4469b4b), null only 6 (11852cab, 31aa019c, 4522001f, 6773b310, cf98881b, f8b3ba0a), both 2; two sided sign test on the tasks one arm alone solved: p 0.7539
    imagination by round (words in the library, then the tasks a word of that round helped solve): round 1 1413 words, 3 tasks (2dee498d, 32597951, 53b68214); round 2 393 words, 1 tasks (53b68214)
    by operator (words in the library / solves by a word of it): lift.object 237/0, lift.cell 243/0, lift.layer 239/0, superpose 229/4, quarter 175/0, fixpoint 226/0, lift.select 229/0, conjugate 130/0, analogy 98/0
    phases: mine 120.14 s (0 found a program while mining), invent 4.3 s, solve 1301.63 s; wall 1426.16 s; peak rss 2301 MB
    wrote bench/verdicts/imagine-budgetms-6000-seed-s2.json (a variant of the bar, isTheBar false)

and `node bench/imagine.mjs --runs` printed for the two 6000 ms runs:

      pooled: invented 16, null 14 over 2 runs; invented ahead in 1, tied 0, behind 1; sign test p 1
      tasks by runs solved, invented: 2dee498d 2, 32597951 2, 44f52bb0 2, 53b68214 2, 794b24be 2, d4469b4b 2, 11852cab 1, 4522001f 1, 6773b310 1, 73251a56 1
      tasks by runs solved, null: 31aa019c 2, 44f52bb0 2, 794b24be 2, 11852cab 1, 4522001f 1, 6773b310 1, 6cdd2623 1, ae4f1146 1, cf98881b 1, d4469b4b 1, f8b3ba0a 1
      paired per run (a task one arm alone solved, once per run): invented only 11, null only 9; sign test p 0.8238 (runs share tasks, so this p is optimistic)
      paired per task (runs solved by invented minus by null, one vote per task): invented ahead 5, behind 5; sign test p 1

The listing script, rewritten to compare each 6000 ms run with every 3000 ms training run
(`test/imagine-new-at-budget-2.mjs`), printed:

    3000 ms training runs read: 9; 6000 ms training runs: 2
    6000 ms seed imagine-bench, invented arm, solved in no 3000 ms training run by either arm: 2 of 10 (2dee498d, 73251a56)
    6000 ms seed imagine-bench, null arm, solved in no 3000 ms training run by either arm: 1 of 6 (ae4f1146)
    6000 ms seed s2, invented arm, solved in no 3000 ms training run by either arm: 1 of 6 (2dee498d)
    6000 ms seed s2, null arm, solved in no 3000 ms training run by either arm: 2 of 8 (cf98881b, f8b3ba0a)

and `node bench/imagine.mjs --objectives` now grades the budget objective:

      mixed | budget | at 6000 ms the invented arm leads the null by more than the 1 it leads by at 3000 ms | bar > 1 | measured 4, -2 in 2 runs

- **The lead did not replicate.** Invented 6, null 8: the null led this time (by task, invented
  alone 4, null alone 6, p 0.7539). The budget objective is now mixed (measured 4, then -2).
- **Over both runs the arms are level.** Pooled, invented 16 and null 14; per task, invented ahead
  5 and behind 5, sign test p 1. The first run's lead of 4 was the draw, as the bullet above
  warned it might be.
- **The clock helps both arms.** At 6000 ms the invented arm solved 10 and 6 and the null 6 and 8,
  where the three 3000 ms runs of the bar printed 4, 4 and 4 against 3, 3 and 4. What the doubled
  clock opened, it opened to either arm: 2dee498d fell to the invented arm in both 6000 ms runs
  and in no 3000 ms run, and the null took three tasks no 3000 ms run solved, each in one run.

## Round 10: met, read against its control

Round 9 printed the null arm's value beside a shape or screen grade. Round 10 counts it: each such
grade says in how many runs the invented arm went beyond the null on the same metric (a tie is
not beyond), and the summary line counts the met objectives the null matched in a run.
`node bench/imagine.mjs --objectives` printed, after the first budget run:

    objectives in state/imagine/objectives.jsonl: 19; logged runs: 14; met 5, mixed 1, not met 13, untested 0; met, but the null arm matched it on the same metric in a run: 2

and, for the objectives with a lead bar or a same metric control:

      met | budget | at 6000 ms the invented arm leads the null by more than the 1 it leads by at 3000 ms | bar > 1 | measured 4 in 1 run
      met | shape | a combinator built for mult shape tasks solves at least one of the 10 mult timeouts nothing solved | bar >= 1 | measured 1 in 1 run | null arm on the same metric 1 | beyond the null in 0 of 1 run
      met | screen | admitting 64 words per task instead of 32 solves more timeouts in the invented arm without losing the lead over the null | bar > 4 | measured 5 in 1 run | null arm on the same metric 5 | beyond the null in 0 of 1 run
      not met | shape | a combinator built for mult+other shape tasks solves at least one of the 2 mult+other timeouts nothing solved | bar >= 1 | measured 0 in 1 run | null arm on the same metric 0 | beyond the null in 0 of 1 run
      not met | shape | a combinator built for smaller+same shape tasks solves at least one of the 1 smaller+same timeouts nothing solved | bar >= 1 | measured 0 in 1 run | null arm on the same metric 0 | beyond the null in 0 of 1 run
      met | shape | a combinator built for other+mult shape tasks solves at least one of the 2 other+mult timeouts nothing solved | bar >= 1 | measured 1 in 1 run | null arm on the same metric 0 | beyond the null in 1 of 1 run

- **2 of the 5 met objectives were matched by the null**: the mult shape (1 against 1) and the
  screen (5 against 5). Of the other three, the budget bar subtracts the null already, other+mult
  went beyond it in 1 of 1 run, and the transfer has no same metric control.
- **The transfer control is gone.** Round 9 read a transfer's control as the number of null words
  carried. That counts 8 words where the transfer metric counts one, so it was not the same
  metric. A transfer now carries no control, and a test holds it there.
- **The screen template now bars what it says.** Its hypothesis claimed "without losing the lead
  over the null" while its bar counted the invented arm alone. A new screen objective states the
  lead and bars the lead (invented minus null), as the budget template does. The screen objective
  already written keeps the bar it was written with, so it stays met, and the new column shows
  the null matched it. A test grades one level run (5 against 5) both ways: met under the old
  bar, not met under the lead bar.
- No bar was changed and no objective was rewritten; only the template for new ones.

## What it says, and what it does not

- **On training, imagination does not clearly beat recombination.** The invented arm solved 4 in
  each of 3 runs; the null solved 3, 3 and 4. Invented was ahead in 2 runs and tied in 1 (sign
  test p 0.5). The invented arm was steadier: 3 tasks came back in all 3 runs.
- **Out of sample it did better in all three runs: 7 against 3, 4 against 2, 4 against 1.** Per
  task over the three, invented was ahead on 8 tasks and behind on 2 (sign test p 0.1094). That is
  suggestive, not decided, and it was the number fixed in advance.
- **Why the null is strong.** It draws from the same memory: collapsed solved programs and mined
  partials. It also passes through the same task conditioned screen. Much of the lift in both
  arms is depth compression (a 3 or 4 step chain costs 1) chosen per task by the screen.
- **What the null cannot say.** The null composes chains. The imagination's combinators (per
  object, per layer, superpose, fixed point, select) are shapes of program the chain grammar has
  no way to write, and on evaluation they did most of the solving. The combinators themselves
  were written by hand; what the imagination does is find which ones, over which inner words,
  are new and worth trying, and keep only what solves a task it was not built from.
- **At twice the clock both arms solved more, and the lead did not grow.** 10 against 6, then
  6 against 8; per task over the two runs, invented ahead 5, behind 5 (p 1). The
  budget objective is mixed.
- **Found but wrong.** On training both arms found 17 programs that fit every train pair and fail
  the test. Most end in localRule or stamp, fitted on grids an added word produced. This is
  acceptance, not imagination, and changes both arms alike. Round 8 tried a check on it (doubt,
  above): the check marks those answers as guesses but turns none of them into a solve, so it
  stays off.

## Vision: the objectives it wrote, and how they stand

Run 1 proposed 15 objectives from its own measurements and wrote all 15 to
`state/imagine/objectives.jsonl`. Run 2 read those as memory and proposed 4 new ones. The file
holds 19. Variant runs write theirs under `state/imagine/partial/`. The templates:

- **lead**: beat the null by more than now.
- **budget**: at twice the clock, the lead grows.
- **transfer**: a kept word solves an evaluation timeout.
- **shape**: a combinator for a shape class that nothing solved.
- **operator**: an operator nested one level deeper beats its current count.
- **screen**: admitting 64 words instead of 32.

Each objective names a runnable suite (a `node bench/...` command), a bar with a metric,
comparison and value, and the null arm as its control, and passed the gate on that basis.

**Grading closes the loop.** An objective is a prediction, so it is graded only by runs that
started after it was written, whose command runs its suite (the only extra options allowed are a
seed, a carry and quiet), and, for a transfer, only by a run that carried the word. The metric is
read from the run's log record. `node bench/imagine.mjs --objectives` printed, after the budget
replicate, the last suite to run:

    objectives in state/imagine/objectives.jsonl: 19; logged runs: 15; met 4, mixed 2, not met 13, untested 0; met, but the null arm matched it on the same metric in a run: 2

- **met (4)**: the transfer of `chain(objectsC4,colorOf,pixel,up3)` (1 in each of 3 runs); the
  other+mult shape, beyond the null; the mult shape and the screen, both matched by the null on
  the same metric.
- **mixed (2)**: analogy nested deeper (measured 1, then 0; bar above 0), and the budget lead
  (measured 4, then -2; bar above 1).
- **not met (13)**: the lead (measured 1, then 0; bar above 1), the other 6 transfers (0 in each of
  3 runs), the mult+other and smaller+same shapes (neither arm solved a task), and the operator
  objectives for lift.cell, lift.layer, conjugate and fixpoint.
- **untested (0)**: every objective's suite has now run at least once after it was written.

## Tests

`node --test test/imagine.test.mjs`: 9 of 9 pass (duration_ms 1137.8948). The tests check:

- a stored word, an exact knowledge title and a word within the floor are rejected, while a
  control operator in the same call proves the path can return something;
- a candidate equal to what the null's recombination reaches is rejected, and the null library
  is distinct, typed and the size asked for;
- a planted per object mirror task times out on the fixed vocabulary at 400 ms and is solved by
  a word the imagination invented from the base vocabulary alone, admitted by the screen, then
  kept through the gate;
- every objective template yields a suite, a bar and a control that the gate approves (the screen
  template states the lead and bars the lead), one without a control or without a suite is
  rejected, and re-proposing from the same facts yields nothing new;
- the combinators compute what their keys say, on a hand checked grid (flip per object, under,
  overlay, select smallest, select topmost, a tie that selects nothing, a fixed point) and round
  2 nests round 1;
- the vocabulary refuses a word that solved nothing, solved only its own source, or has no
  novelty, and admits it only on a held out solve; a forged provenance is rejected; a patch is
  held;
- an objective is graded only by a later run of its own suite: the run it was read off gives
  untested, a changed option is another suite, a transfer needs a run that carried the word, and a
  shape grade carries the null arm's value beside its own (a lead bar already subtracts it), a
  tie is not beyond the null, a transfer carries no control, and a screen bar written on the lead
  reads a level run as not met while one written on the invented count keeps that bar; the sign
  test, the runs table and the merge of kept words are checked by hand;
- the arms are paired by task: `pairedOf` returns the tasks one arm alone solved, and the runs
  table counts a task once per run in the per run pairing but gives it one vote in the per task
  pairing;
- a memorised program is doubted: `memorised` is true for a localRule that predicts neither pair
  from the other, false for one that does, false for a colour map and for one train pair; with
  doubt, the search prefers a fit that is not memorised and still answers with the fallback when
  it finds nothing better; doubt is off by default.

`node --test test/grid.test.mjs` stays green: 7 of 7 (duration_ms 725.5325).

`node test/imagine.mutants.mjs` breaks one required check at a time and runs the suite. It
printed `mutants killed 21 of 21` and `baseline: 9 tests, all pass`. The mutants:

- the memory, knowledge, null and floor checks turned off;
- the held out rule, novelty rule and control requirement removed;
- the vocabulary skipping the gate;
- the per object lift made the identity;
- select picking every object;
- under behaving as overlay;
- round 2 not nesting;
- grading that ignores time order;
- a transfer graded without a carry;
- pairing that counts shared tasks as one arm's;
- a task that votes once per run instead of once;
- `memorised` never true;
- doubt dropping the fallback;
- an objective's control never read;
- a tie counted as beyond the null;
- a lead bar read as a count.

**A mutant that never ran was counted as killed.** The first version of the last mutant left an
unbalanced parenthesis, so `bench/imagine.mjs` failed to parse, the test file failed to load, and
the harness counted "exit 1, pass 0 fail 1" as a kill. The harness now runs the unmutated suite
first (every test must pass, and its count is recorded), checks that each mutated file parses
(`node --check`), and counts a kill only when every test ran and one failed. A control copy of the
harness holding only the old broken mutant and a no-op edit printed `control: unbalanced paren:
DOES NOT PARSE, mutant never ran`, `control: a no-op edit: SURVIVED, exit 0, pass 7 fail 0` and
`mutants killed 0 of 2, never ran 1`, and exited 1.

## Budgets

- Peak RSS for a whole run: 1559 MB (run 1), 1549 MB (run 2), 1594 MB (seed s2), 1546 MB
  (evaluation), 1562 MB (evaluation s2), 1635 MB (evaluation s3), 1491 MB (training, doubt),
  1557 MB (evaluation, doubt), 1536 MB (screen, admit 64), 1545 MB (shape mult), 1242 MB (shape
  mult+other), 1048 MB (shape smaller+same), 962 MB (shape other+mult), 1992 MB (budget, 6000 ms),
  2301 MB (budget, 6000 ms, seed s2), the largest. The workers are threads of the same process,
  each capped at 1536 MB old generation, and each process declares `--max-old-space-size=4000`.
- Each run used 2 workers and was the only bench process of this item. Free memory was checked
  before each (between 44.78 and 48.41 GB).
- Bench round 7 (after the evaluation replicate) prints, per run, a paired line (the tasks one
  arm alone solved, with a sign test), the imagination by round (words, and the tasks a word of
  each round helped solve) and the per operator counts. The vocabulary keeps each word's round.
- The knowledge store is opened read only for the imagination phase (residentBytes 124529024,
  printed by `KnowledgeStore.residentBytes()` in a one off node -e) and closed before the solve.
- The state files are small. After run 2, objectives.jsonl was 19436 bytes (19 lines),
  patches.jsonl 4696 (7 lines) and vocabulary.json 2771. The verdict was 203100 bytes. No
  rotation is needed.
- No model calls and no network.
