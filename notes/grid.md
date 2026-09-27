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

### Board 23, item ladder-arc: the cell rule fallback

The failure cause read first: of the 400 evaluation tasks the existing verdict counted 323 timed
out and 1 exhausted, so the clock, not a wrong answer, is the most frequent cause. Read before
building: the Icecuber write-up (depth limited search over a hand written function set, pieces
stacked greedily); a greedy piece stacker was prototyped in scratch and not kept.

What landed: `cellRule` in `capability/grid-dsl.mjs`, a lookup table from 1 to 3 of the 73
descriptions in CELL_FEATURES (29 colour valued, 44 others: own colour, neighbours, rays,
mirrors, object facts, and colour-abstract relations such as "my right neighbour has another
colour") to an absolute colour or to a described colour, chosen as the cheapest set that is
consistent on every train cell and covers every test key. `capability/grid-search.mjs` runs it
as a FALLBACK phase, not as a vocabulary word: when the search has no answer at 75 percent of
the clock it tries pairs of descriptions on the input and on every depth 1 state of the output
size, then triples, and hands the search back where it stopped when nothing fits. The CONTROL is
`GRID_FIXED_VOCAB=1` (or `fallback: false`), which runs the search as it was.

Development records from the build (TRAINING split, the builder's runs of
`bench/grid.mjs --split training --budget-ms 3000 --workers 4`; the two variants not kept are
not in the code, so these rows cannot be rerun):

| run | solved of 400 | percent | timed out | found but wrong |
|---|---|---|---|---|
| control, GRID_FIXED_VOCAB=1 | 148 | 37 | 235 | 17 |
| cell rule, triples on the input only | 169 | 42.25 | 193 | 38 |
| cell rule, triples on every prefix (kept) | 171 | 42.75 | 190 | 39 |
| cell rule, depth 2 prefixes too (not kept) | 169 | 42.25 | 184 | 47 |

#### Fix pass (Board 23): every number below is a line a command printed

The first landing's verdicts were edited after the bench wrote them (fields added, the command
and the statement rewritten, a Wilson interval and a sign test typed in from a pass no command
recorded). Those seven files were deleted. The runs below were made again, each on a scratch
copy of the tree (`core/`, `capability/`, `tasks/`, `bench/grid.mjs`, the ARC fixtures,
`bench/verdicts/public-arc.json`; `cmp` printed the four code files identical to the tree),
each launched as
`node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir <copy> -- node --max-old-space-size=4000 bench/grid.mjs --split <split> --budget-ms 3000 --workers 4`,
one at a time, the control with `GRID_FIXED_VOCAB=1` in the environment. The bench's plain
path has no `--tag`, so it names its file `grid-evaluation.json` or `grid.json`; the treatment
files were copied BYTE FOR BYTE into this tree under `grid-local-*` (`cmp` printed "byte
identical: 3 of 3"; sha256 printed by `sha256sum`):

| file here | the bench's own name in the copy | sha256 |
|---|---|---|
| `bench/verdicts/grid-local-evaluation.json` (the bar run) | grid-evaluation.json | b2775d7aa8a695f2f1a235331e8b2568a3742e9218353434983f15ed9d2346a9 |
| `bench/verdicts/grid-local-evaluation-repeat.json` | grid-evaluation.json | 9a96c771d62a845ae094ce730ee4a0d345db5045df970336a99f4d3340cee75f |
| `bench/verdicts/grid-local-training.json` | grid.json | 9af1c835de485210c680e195ce4db413cf10694876d726c5f83bf3c240e3c77d |

The two control verdicts were NOT copied in: their `command` field cannot carry the
environment flag, so rerunning it would give the treatment, not the control. Their printed
lines are here instead. The plain path also writes no `barMet` and no control field (the bench
is not this item's file), so the control is named in this note.

| split, arm | solved of 400 | percent | mean ms per task | timed out | found but wrong | exhausted |
|---|---|---|---|---|---|---|
| evaluation, cell rule (bar run) | 85 | 21.25 | 2412.54 | 286 | 28 | 1 |
| evaluation, cell rule, repeat | 86 | 21.5 | 2407.99 | 286 | 27 | 1 |
| evaluation, control GRID_FIXED_VOCAB=1 | 70 | 17.5 | 2498.62 | 323 | 6 | 1 |
| training, cell rule | 168 | 42 | 1792.59 | 193 | 39 | 0 |
| training, control GRID_FIXED_VOCAB=1 | 145 | 36.25 | 1887.49 | 240 | 15 | 0 |

Budget lines (evaluation bar run): `BUDGET done exit 0: wall 242.94 s, peak ram 1722.0MB, peak dir
4.6MB`. Most used in the bar run's solutions: `cellRule 15, localRule 13, colormap 11`.

Paired by task id, printed by a 12 line script (`pair.cjs <treatment> <control>`, in the
scratch copy, since deleted: it reads both verdicts' rows, refuses two verdicts that graded
different tasks, and prints solved, gained, lost and the last step of each gained program):

- evaluation bar run against the control: `treatment 85, control 70, gained 16, lost 1`; last
  step of the gained programs `{"cellRule":15,"dedupeBoth":1}`; lost `ca8f78db`.
- evaluation repeat against the control: `treatment 86, control 70, gained 16, lost 0`.
- evaluation repeat against the bar run: `treatment 86, control 85, gained 1, lost 0`; the one
  task is `ca8f78db`, so run to run noise here is one task.
- training against its control: `treatment 168, control 145, gained 24, lost 1`; last step
  `{"cellRule":22,"cropBBoxMajority":1,"up2":1}`; lost `d8c310e9`.

Why ca8f78db was lost once, read before and after: the control found `periodicFill` at 2418.23
ms under four busy workers; the treatment's search stops at 75 percent of the clock (2250 ms)
and the fallback spent the rest, so it timed out at 3000.29 ms. Alone on the machine the same
task is found at 1127 and 1171 ms with the fallback on (phases printed `{"search":1126.53,
"fallback":0,"resumed":0}`), and the repeat run solved it. A search answer that arrives after 75
percent of the clock under load is the price of the fallback phase.

The bar, Gemini 3.1 Pro (Preview) at 98 percent, is NOT met: 21.25 (bar run) against 98. Found
but wrong rose from 6 to 28: with one attempt a wrong answer costs nothing a timeout did not, but
with two attempts the fallback would spend one on a guess. The ladder reads
`bench/verdicts/grid-evaluation.json` (70 of 400 on disk), which this item does not write; its
row moves only when the orchestrator reruns the ladder's own command.

The comment in `capability/grid-dsl.mjs` above CELL_COLOR_FEATURES said "out of 58"; the arrays
print 29, 44 and 73 (`node -e` over the module). It now names 73, 29 and 44, and
`test/grid.test.mjs` reads the three numbers out of the comment and compares them to the arrays
(a copy of the comment with 58 put back fails it).

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
