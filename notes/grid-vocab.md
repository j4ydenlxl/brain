# grid-vocab: what the ARC vocabulary cannot say (Board 34, item arc-vocab)

docs/VISION.md order 4, the ARC-AGI-1 row. Board 33 (arc-lock-in) measured the second attempt and
the clock and held the vocabulary at 196 words and learners (capability/grid-dsl.mjs). Its reading:
most unsolved tasks are not a clock problem but a vocabulary problem. This file is the research
that came BEFORE any code of this item, written from the TRAINING split only. The evaluation split
is held out: no evaluation task was opened to write it.

## What was read

- notes/grid.md and capability/grid-dsl.mjs (the vocabulary, its learners, the fallback phase),
  capability/grid-search.mjs (the search that uses them).
- The unsolved training tasks of bench/verdicts/grid-local-training.json (one attempt, 3000 ms),
  grouped by how the output size relates to the input size (a scratch script printed):
  same 133, same:wrong 28, smaller 50, smaller:wrong 7, larger 13, larger:wrong 2, smaller/same 1
  (":wrong" = a program fit every train pair and missed the test).
- About 40 of those tasks, rendered pair by pair (listed per family below, plus the ones skipped).
- The published way:
  - icecuber, the 2020 Kaggle ARC winner (github.com/top-quarks/ARC-solution, src/image_functions.cpp):
    a C++ image DSL searched to a fixed depth. The functions that matter here: cut and splitCols
    (split into pieces), pickMax with a list of criteria (pick the piece that maximises a
    measure), compose/overlay (lay pieces over one another), compress, embed, smear, border,
    interior, Fill, repeat, mirror, wrap, count, getRegular (the periodic tile), heuristicCut,
    majCol, colShape, broadcast.
  - Michael Hodel, arc-dsl (github.com/michaelhodel/arc-dsl): a typed Python DSL. The categories
    used here: objects, partition, fgpartition, colorfilter, sizefilter, argmax/argmin, fill, paint,
    underfill, move, gravitate, upscale, downscale, hsplit, vsplit, box, inbox, corners, backdrop,
    connect, shoot, frontiers, colorcount, hperiod, vperiod, trim, compress.
  - ARC Prize 2024 Technical Report (Chollet, Knoop, Kamradt, Landers, arXiv 2412.04604): discrete
    program search over a DSL stays a strong baseline, and its gains came mostly from better DSLs
    (Hodel's among them), which is the bet of this item.

## The families the vocabulary cannot express

Each family: the training tasks that need it, the published way, and the word(s) this item adds.

1. PICK AN OBJECT BY A MEASURE (icecuber pickMax; Hodel argmax/argmin over objects).
   The vocabulary picks the largest, smallest, topmost, and so on, but not "the piece with the most
   cells of colour 2", "the piece touching the grey marker", "the bounding box of colour 5".
   Tasks: 8efcae92, ae4f1146, e50d258f, 48d8fb45, 3f7978a0, 5117e062.
   Adds: fallback learner pickObject (split x crop kind x criterion x max/min, read off the train
   pairs), primitive monochrome.
2. PARTS: PICK ONE, OR LAY THEM OVER ONE ANOTHER BY A LEARNED PRIORITY (icecuber cut + pickMax,
   compose; Hodel hsplit/vsplit/partition). The vocabulary overlays halves in a fixed order only.
   Tasks: 662c240a (the part that is not symmetric), 75b8110e (quadrants, colour priority),
   cf98881b (three parts, colour priority).
   Adds: fallback learner partsPick, fallback learner partsOverlay (three modes, tried in order: a
   learned order of up to four parts, the first coloured part winning; a learned order of colours;
   a table from which parts are coloured). The parts come from partitionEqual: the separator colour
   whose cells all have one size, the most cells first, because partition() takes the lowest colour
   with full lines and a stray full column of another colour captured it on cf98881b.
3. THE PERIODIC TILE AND THE 1D PERIOD (icecuber getRegular; Hodel hperiod/vperiod).
   The lattice helpers extend only under a lattice cap, and nothing crops to the repeating tile.
   Tasks: 2dee498d, 7b7f7511 (crop to the tile), 017c7c7b (extend a row period, then recolour).
   Adds: primitive cropPeriod, fallback learner extendPeriod (1D period to the learned size, with a
   learned colour map).
4. SYMMETRY COMPLETED AROUND A LOCAL CENTRE (Hodel mirror/rot + paint; icecuber mirror + Fill).
   symFill works about the grid's own middle; these figures are symmetric about their own centre
   or about a marker, and the added cells may take a new colour.
   Tasks: 11852cab, 1b60fb0c, 4c5c2cf0.
   Adds: fallback learner symComplete (groups D4, R4, HV, R2, H, V, T, A, the largest first, since
   11852cab was wrong under HV and right under D4; centre from the content, the grid, the most
   frequent or rarest colour, the one object that is itself symmetric under the group (4c5c2cf0 has
   no other common centre), or the best agreeing centre; source colour or one learned colour).
5. BACKGROUND REGIONS RECOLOURED BY A FEATURE (Hodel objects over background + sizefilter + fill).
   fillEnclosed paints every enclosed region alike; these paint some regions and not others, or in
   two colours by the region's size or shape.
   Tasks: 44d8ac46 (square holes), 868de0fa (holes by side parity), e73095fd (rectangular pockets).
   Adds: fallback learner regionRecolor.
6. FRAMES AND CORNERS (Hodel box/inbox/corners; icecuber cut + compress).
   Tasks: 1c786137 (inside a one colour rectangle frame), 3de23699 (inside four corner marks,
   painted in their colour).
   Adds: primitives cropFrame, cropCorners, cropCornersPaint.
7. KRONECKER OF TWO PARTS (Hodel upscale + cellwise; icecuber broadcast/compose).
   kron multiplies the grid by itself; here one half is the shape and the other the colour layout.
   Tasks: b190f7f5. Adds: primitive kronHalves (the two halves side by side when the grid is wider
   than tall, one above the other when taller; a square grid answers only when one way fits).
8. PULL TOWARD AN ANCHOR (Hodel gravitate).
   slide* moves to the wall; these move to an anchor object.
   Tasks: 05f2a901 (to the rarest colour), 4093f84a (to the band of the top colour, then recolour).
   Adds: primitives pullToRare, pullToTop.
9. LOSSY DOWNSCALE (Hodel downscale): a block becomes its one non background colour.
   Tasks: 46f33fce (down 2 then up 4). Adds: primitives downAny2, downAny3.
10. EDGE PADDING (icecuber embed/extend). Tasks: 49d1d64f. Adds: primitive padEdge.
11. DIAGONAL NEIGHBOURS (Hodel ineighbors). Tasks: 10fcaaa3 (tile 2x2, then diagonals).
    Adds: primitive outlineDiag.
12. EACH COLOUR'S BOX FILLED (Hodel backdrop + fill). Tasks: 56ff96f3. Adds: primitive fillColorBoxes.
13. A COUNT MADE INTO A GRID (icecuber count + broadcast; Hodel size/numcolors + canvas).
    Tasks: 1fad071e (1x5 row of n), d0f5fe59 (n x n diagonal), b0c4d837 (3x3 with n cells).
    Adds: fallback learner countOut.
14. A UNIFORM OUTPUT OF A LEARNED COLOUR (icecuber majCol; Hodel mostcolor/leastcolor + canvas).
    constant needs the same output in every pair; here the colour moves.
    Tasks: 445eab21 (colour of the largest object), 5582e5ca (most frequent colour).
    Adds: fallback learner solidColor.
15. PARTITION CELLS MAPPED BY A FEATURE (icecuber cut + pickMax/majCol per piece).
    cellsDominant takes the dominant colour of every cell; these decide each cell by its count.
    Tasks: 6773b310 (a cell with two pixels becomes 1), 29623171 (the fullest cells filled, the
    others cleared). Adds: fallback learner cellsMap.

Read and skipped as too specific for one word, or needing a program the depth cannot reach:
4522001f 469497ad 539a4f51 53b68214 91413438 bbc9ae5d eb281b96 feca6190 045e512c 0a938d79
0e206a2e 1a07d186 1f0c79e5 1f642eb9 22233c11 228f6490 25d487eb 264363fd 28e73c20 3befdf3e
3e980e27 41e4d17e 444801d8 50846271 5168d44c 54d82841 5521c0d9 234bbc79 4290ef0e 5ad4f10b
5daaa586 681b3aeb 6ecd11f4 77fdfe62 7837ac64 137eaa0f 06df4c85 09629e4f.

## Where the new words go, and why

A "primitive" in the families above is a LATE primitive (capability/grid-dsl.mjs, THE LATE WORDS).

- The 13 new primitives are grid to grid, pure and costed, registered by name (applyStep, byName and
  the grid.dsl cell run them like any word) in LATE_PRIMS, NOT appended to PRIMS. PRIMS is what the
  uniform cost search expands at every state and what capability/grid-invent.mjs mines and seeds its
  imagination with. Appended there, they changed that seeded draw: test/imagine.test.mjs failed on
  plantedV, and every expansion of the search paid for 13 more words. So PRIMS did not move,
  grid-invent.mjs is untouched, and VOCABULARY_SIZE (PRIMS plus LEARNERS, the definition
  test/grid.test.mjs checks) stays 196.
- The search meets the late words through one fallback learner, lateWord: on the task's input, each
  late word in turn, first alone, then followed by a colour map read off the train pairs (a
  placeholder colour a word paints must map to a real one; a real colour the map never saw keeps
  itself), then followed by one base grid word (PRIMS, cheapest first, each tried on the first train
  pair before the others). It refuses a word that changes no train input, a pair set where the input
  already equals the output, and the fallback's repeat pass; the clock (opts.deadline) stops it
  between words.
- The 10 new learners go into FALLBACK_LEARNERS after cellRule, not into LEARNERS: test/grid.test.mjs
  asserts every learner in LEARNERS has a synthetic case in that file, and a learner in LEARNERS runs
  at every popped state of depth 1 and 2, which the clock pays for. A fallback learner runs only in
  the last quarter of the clock and refuses in one pass when its shape of task is absent.
- INPUT ONLY: each added fallback learner runs on the task's own input and on no other prefix, so
  cellRule keeps the clock of every depth 1 prefix it had before. capability/grid-search.mjs (not
  edited by this item) hands the fallback learners the input first, with one array of wanted outputs
  per search and one states array per prefix shared by every learner; grid-dsl.mjs keeps, per wanted
  array, the first states array it met (a WeakMap) and refuses any other. Called directly (a test,
  another caller) the first call for a wanted array is always answered.
- IN THE CLOCK: an answer from an added learner is taken the moment the search takes it, inside the
  task's clock, like every answer. The first build of this item held those answers back until the
  search's resumed clock and graded them after it; the verify plane found every one of its gains
  stamped past the 3000 ms clock. Nothing is held back now, and the verdict counts a task as solved
  only when a right attempt was stamped at or under 3000 ms.

## Measured

Commands (bench/verdicts/grid-vocab.json, field runs; each bench under tools/budget.mjs):
`node bench/grid-curve.mjs --split training --budget-ms 3000 --attempts 2 --workers 12 --limit 100
--seed 33 ...` (the in sample control), `node bench/grid-curve.mjs --out attempts --split evaluation
--budget-ms 3000 --attempts 2 --workers 12 --base bench/verdicts/grid-local-evaluation.json --control
bench/verdicts/grid-split-evaluation-control.json ...` (the held out bar run), then
`node test/grid-vocab-verdict.mjs` (the verdict). What they printed:

- vocabulary (PRIMS plus LEARNERS) 196 -> 196, late primitives 13 (in PRIMS 0), fallback learners
  1 -> 11, families 15.
- Training control (100 tasks, seed 33, in sample): before 41, after 45 in clock, gained 4
  (29623171 48d8fb45 49d1d64f 4c5c2cf0), lost 0; attempts with an added word right 5, wrong 0, past
  the clock 0.
- Evaluation (400, held out, 3000 ms, 2 attempts): before 86, after 94 in clock, gained 8, lost 0;
  timed out 279, found but wrong 26, exhausted 1, mean ms 2786.95. Without 070dd51e (a task pair for
  pair identical to a training task) the bench printed clean 93 of 399.
- Attempts with an added word on evaluation: right 9, wrong 0, past the clock 0, max ms 2279.36; by
  word solidColor 2, partsOverlay 5, pickObject 1, partsPick 1. lateWord is not in that list: the 13
  late words gave no evaluation answer.
- Control arm bench/verdicts/grid-split-evaluation-control.json: solved 71, this run 94, gained 23,
  lost 0.
- The bar (at least 96 of 400 inside the clock, at most 3 lost, the training control losing at most
  2): NOT MET, 94 of 400.

What is left: the families read off the training split carried 8 held out tasks inside the clock, 2
short of the bar; the late words carried none. The next words have to come from families that recur
across tasks, read from the training split again, never from an evaluation task.

## 2026-09-28, after board 34b's second verify (by hand)

The verify re-ran the 3000 ms evaluation point (state/board34/arc-verify): 93 in clock where the bench counted 94, because one
fallback answer (aa4ec2a5, keepRareColor>cellRule) came back stamped 3009.2 ms and the search took it; the training control
had 0 such answers (max attempt 2612.15 ms). capability/grid-search.mjs's take() now refuses an answer after the task's clock
(checked before grading and again after the stamp), and test/grid-vocab.test.mjs asserts that a 0 ms budget takes nothing.
bench/verdicts/grid-vocab.json predates that check: its own run had 0 attempts past the clock, so its 94 stands as printed;
the bar (96) is not met on either count.
