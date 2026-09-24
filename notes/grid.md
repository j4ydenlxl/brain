# grid: the ARC vocabulary (Board 8, item grid)

His P4 and P6: a god at everything natively; ARC is where every model fails. The state this item
started from: `bench/verdicts/public-arc.json` printed 1 of 400 ARC-AGI-1 evaluation tasks solved,
399 "exhausted the vocabulary" at 3000 ms, 0 timed out. The search in `tasks/grid.mjs` had time;
it had no words (seven geometric moves, eight rolls, three tiles, one inferred colour map).

## What landed

- `capability/grid-dsl.mjs`: a typed vocabulary (grid to grid, grid to objects, objects to
  objects, objects to grid, objects to colour, grid to colour, colour to grid) plus learned last
  steps (colormap, constant, tileSym, fixedCrop, localRule). Placeholder colours (10 and up)
  let one "fill enclosed" or "outline" primitive serve every task, whatever colour it paints;
  the colormap learner resolves the placeholder from the train pairs, and a test output still
  holding one is never an answer. Two cell kinds: `grid.dsl` (one step) and `grid.dsl.match`.
- `capability/grid-search.mjs`: uniform cost search to depth 4, memoised states (the tuple of
  values for every train and test input, hashed), pruned exactly by train pair agreement (a
  prefix that maps two train inputs with different outputs to one value is dropped), a wall
  clock budget checked between candidates, and every winning program re-run as `grid.dsl` cells
  and graded by `grid.dsl.match` cells before its test answer is taken.
- `bench/grid.mjs`: the bar. Worker pool, hard kill at budget plus 4 s as a backstop.
- `act/solve.mjs` grid branch: the old depth 3 search first (what was measured), then this search.
- `test/grid.test.mjs`.

## Measured

The numbers live in `bench/verdicts/grid.json`; read them there. Runs of
`node bench/grid.mjs --split training --budget-ms 3000`, each as printed:

| run | solved of 400 | mean ms per task | exhausted | timed out | found but wrong | depth histogram |
|---|---|---|---|---|---|---|
| first | 128 | 1938.93 | 1 | 248 | 23 | {"1":66,"2":48,"3":12,"4":2} |
| rays4pair, mod3 | 140 | 1896.92 | 0 | 243 | 17 | {"1":90,"2":42,"3":7,"4":1} |
| stamp, rayLearned | 144 | 1784.42 | 0 | 226 | 30 | {"1":97,"2":40,"3":7} |
| seen twice | 145 | 1890.89 | 0 | 240 | 15 | {"1":97,"2":41,"3":7} |
| final code (two reverted trials out) | 145 | 1890.2 | 0 | 240 | 15 | {"1":97,"2":41,"3":7} |

Most used in the final run: localRule 26, colormap 23, tileSym 14, cropBBox 13, objectRecolor 9, stamp 7.

The stamp run is the lesson in one row: a learner flexible enough to fit a single source turned
13 timeouts into 13 wrong answers (found but wrong 17 to 30) and preempted a correct depth 1
program. Requiring every painting key to be seen on at least two sources took it to 15 and kept
all six stamp solves. A stamp is also taken only if a window one cell wider answers the test the
same way, and is pruned to the entries the train pairs need; the search rejects any program that
hands a test input back unchanged when every train pair changed its input.

Where the clock goes: a sample of ten timed out tasks (every 25th) expanded about 100 states at
depth 1, 350 to 1,900 at depth 2 and at most 260 at depth 3 inside 3000 ms (`popped` in the
search result). Depth 4 is mostly reached for cheap programs only; a new word pays more at
depth 1 or 2 than a faster depth 4.

Measured and reverted: 31 unsolved training tasks have a non-zero commonest colour on every
input, where the painting words see no background. Swapping each pair's commonest colour with 0
(half the clock plain, half swapped) solved 0 of the 31 (`--ids`, 28 timed out, 3 found but
wrong), so it is not in the code.

Measured and reverted: a learned object selection (cut out the one object a single description
picks, by value or as the odd one out) solved 6 of 32 crop tasks run with `--ids`, and all 6
were already solved by primitive chains such as keepRareColor > cropBBox; the 2 it newly
answered were wrong. Not in the code.

TRAINING IS NOT THE PUBLISHED RULER. The vocabulary was written against the training split; the
published no-model row (Icecuber 17 percent) is on the evaluation split, which is held out here
and is the orchestrator's run: `node bench/grid.mjs --split evaluation --budget-ms 3000` writes
`bench/verdicts/grid-evaluation.json`.

## Open

- Found but wrong is the overfit count: a learned last step that fits every train pair and
  misses the test. Each one also hid whatever correct program lay further out in the search.
- `bench/public.mjs` still runs ARC through `tasks/grid.mjs`; it is not this item's file. Point
  its worker at `capability/grid-search.mjs` `solveArcTask` to carry this vocabulary into the
  public ladder.

# Board 11, item arc: library learning (`capability/grid-library.mjs`)

## What landed

- `capability/grid-library.mjs`: (a) MACROS. Every run of 2 to 4 base primitives inside a program
  that solved a TRAINING task is a candidate, scored by description length saved (shortest
  program per task before and after, summed, minus the macro's own length), taken greedily with
  re-scoring, kept while it shortens at least 2 tasks and saves at least 1 step net, top 24.
  (b) A LEARNED SEARCH ORDER: a Dirichlet posterior over the hand costs, updated with each word's
  count in the solved programs; the learners are ordered by their counts too. `corpusFromVerdict`
  throws on any verdict that is not the training split or is marked heldOut: the evaluation
  split's programs and test outputs cannot reach a library.
- `capability/grid-dsl.mjs`: `defineMacro`, `isMacro`, `expandName`, `macroCount`. A macro is a
  named composition (`keepRareColor+cropBBox`), registered by name and run by `applyStep` and by
  the `grid.dsl` cell, so a program that uses one is wired, graded and counted as `grid.dsl`
  cells. Macros are not pushed onto `PRIMS`: the search without a library is unchanged.
- `capability/grid-search.mjs`: `opts.library` and `opts.attempts`, both off by default.
  (c) With `attempts: 2` (ARC's rule) the search goes on after the first answer for one whose test
  outputs differ; `solveArcTask` scores each test input against either try, and `solvedFirst`
  keeps the one attempt score. With a library whose `share` is between 0 and 1 the clock is a
  PORTFOLIO: the hand ordered search for (1 - share) of it, then a HANDOFF to the learned order.
  The learned phase takes the first phase's seen states and frontier, re-costs every queued
  program under the learned costs, and re-queues each expanded state for its macro children only.
  The first phase stops only between two expansions, so nothing is searched twice.
- `bench/grid.mjs --library`, with `--attempts`, `--arms`, `--corpus`, `--dev-fold`, `--share`,
  `--alpha-frac`, `--top-n`, `--min-net`, `--min-tasks`, `--only-unsolved`, `--tag` and
  `--min-free-mb`. Arms run one at a time, and each checks free RAM before it starts.
- `test/grid-library.test.mjs`, 8 tests: macro extraction on three toy programs; segmentation;
  a macro executes as its composition (pure function and `grid.dsl` cell); the prior orders a
  known frequency; the refusal; the library search reproduces every solved fixture in `test/`;
  the handoff (an identity library expands exactly the states the base search expands, per depth);
  two attempts.

## THE BAR (held out; not a development record)

`node tools/budget.mjs --ram-mb 6000 --wait-free-ram-mb 16384 ... -- node --max-old-space-size=6000
bench/grid.mjs --split evaluation --budget-ms 3000 --workers 2 --library --corpus
bench/verdicts/grid.json,bench/verdicts/grid-library-harvest15-partial.json`
wrote `bench/verdicts/grid-library.json`, isTheBar true. As printed:

| arm | solved of 400 (2 attempts) | at attempt 1 | mean ms per task | timed out |
|---|---|---|---|---|
| no-library run 1 | 71 | 71 | 2778.18 | 321 |
| library run 1 | 73 | 73 | 2781.23 | 319 |
| no-library run 2 | 71 | 71 | 2777.89 | 321 |

Noise 0: 0 tasks flipped between the two no-library runs. Margin over the better no-library run:
2. Newly solved: 2 (642d658d, 81c0276b), lost 0. BAR MET: margin 2 > noise 0. Macros learned 1,
macros used in at least one solution 0; the 2 were both "solved only by the learned phase". Budget
record: peak RAM 1476.1 MB, wall 1671.98 s. Latencies were measured on a shared machine.

Read it for what it is:
- The gain is 2 tasks of 400, and it comes from the learned ORDER through the handoff, not from
  a macro. The one macro (keepRareColor+cropBBox) answered nothing.
- 642d658d got its first answer at 2933.71 ms of the 3000 ms clock (81c0276b at 2419.37 ms).
  A slower machine could lose it. Noise 0 is two runs, not a distribution.
- The library: 156 solved training tasks, 54 candidate chains, 1 macro (shortens 3 tasks, net 1
  step; 239 steps to 236). The corpus is the constraint: 97 of the 148 solved programs in
  `bench/verdicts/grid.json` are one word long (41 are two, 8 three, 2 four). Short programs have
  no recurring sub-chains.

## Development records (TRAINING split only; the second ruler)

Each fold's library was learned from the other fold's training programs, and the arms were graded
on 200 training tasks at 3000 ms with 2 attempts (`bench/verdicts/grid-library-dev-*.json`).

| record | library arm | no-library arm | what it tried |
|---|---|---|---|
| dev-even-v1 | 64 | 69 | the learned order alone, whole clock |
| dev-even-v2-share50 | 69 | 69 | portfolio, share 0.5, learned phase restarts |
| dev-even-v3-af8 | 68 | (69, v2) | the same with alphaFrac 1/8 |
| dev-even-v4-handoff | 68 | (69, v2) | share 0.5 as a handoff |
| dev-even-v5-handoff-share25 | 70 | (69, v2) | share 0.25 as a handoff |
| dev-odd-v6-handoff-share25 | 84 | 84 | the same, reverse fold |

No task flipped in the no-library arm between dev-even-v1 and dev-even-v2. The v1 statement first
said "in two runs" with one no-library arm; the prose is corrected in the file, and the numbers
are unchanged. Share 0.5 lost the two hand solves that came after 1500 ms (3ac3eb23 at 2065.17 ms,
445eab21 at 2184.58 ms). In v4 the learned phase also spent both attempts on wrong answers for
445eab21. Share 0.25 was chosen from these records, before the evaluation run.

The harvest (`grid-library-harvest15-partial.json`, in sample, a corpus and not a measurement):
the 252 training tasks `grid.json` left unsolved, at 15000 ms. It solved 8, found 25 wrong, timed
out 217. Its 8 programs added no recurring chain.

Where a phase's clock goes, from 10 training timeouts at 1500 ms: popped per depth
[10,806,4457,15,0] with the slow learners and [10,855,5269,45,0] without them. The slow learners
are not the bottleneck, and depth 3 is barely reached.

## Open

- Macros need deeper solved programs. The next step is a library-assisted harvest (wake and
  sleep again), or several right programs per training task instead of the first one found.
- A macro would let the slow learners (depth 2 and below) reach 3 and 4 word prefixes. With 0
  macros used, this is untested on evaluation.
- Wrong answers in the learned phase use up attempts (445eab21 in v4).
