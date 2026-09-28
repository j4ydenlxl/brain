# Learning from its own mistakes, model off (board 35, item self-learn)

His orders 5 and 6 (docs/VISION.md): learning from mistakes, self iteration. The mistake ledger (board 34,
`self/mistakes.mjs`) wrote every graded miss down and re-asked it, and nothing it held ever changed what the organism
did next. This item is the step that does: the organism asks itself its development rows, retracts the question forms
in which its kept programs answered wrong, induces programs from the rows it got wrong or refused, and keeps a program
only by a rule whose own out-of-sample wrong answers on development are counted first (the support gate).

## Files

- `self/learn.mjs`: `learn({ root, dry, limit, gate })` and its CLI (`node self/learn.mjs [--dry] [--limit N] [--json]`);
  `collect` (the development rows and the refusals, `REASONS`), `selfQuery` (ask() with provider `'null'`, sockets and
  fetch refused and counted), `candidatesOf` (reason/induce.mjs `search`, whole programs only, memoised per row),
  `judge` (THE RULE), `induceAndKeep`, `supportGate` and `keepByGate` (THE SUPPORT GATE, `GATE`), `retractionsOf`
  (`RETRACT`), `mergeStores` (the kept store with its retracted forms removed and the learned entries appended),
  `learnedKeysOf`, `provenanceIds`, `crossValidate`, `foldOf`.
- `bench/self-learn.mjs`: the bar. `--write-heldout` wrote the held-out list once, before the learner existed;
  `--iterate` runs (a), (b), (b2), (c) and (e) only and writes no verdict (the edit loop).
- `test/self-learn.test.mjs`: 7 tests on planted trees in a temp dir (no act/prompt.mjs ask(), no socket).
- `bench/verdicts/learned-programs.json`: the learned store (version 2): `levels` (learned entries in the kept store's
  shape, each with `learned` provenance and `forms.roles`), `retract` (the retracted forms, each with its wrong and its
  right development rows), `gate` (every support tried), `minSupport` (null when no support is validated).
- `bench/verdicts/self-learn-heldout.jsonl`: the 60 held-out ids, each with its line and its question's sha256.
- `bench/verdicts/self-learn.json`: the verdict.
- `bench/fixtures/public/gsm8k/train.jsonl`: the GSM8K train split (MIT), its line in `bench/fixtures/public/SOURCES.md`.

The bar:

    node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir state/board35/self-learn --record state/board35/self-learn/budget-last.json -- node --max-old-space-size=4000 bench/self-learn.mjs

The tests: `node --test test/self-learn.test.mjs`. The learner alone: `node self/learn.mjs` (writes the store),
`node self/learn.mjs --dry` (learns and prints, writes nothing).

## Design

1. THE DEVELOPMENT ROWS. The ledger's GSM8K rows among the 200 `bench/verdicts/math.json` development ids, then the
   other ids of those 200, then every train-split row not held out. Every other ledger row is refused with its reason
   (a GSM8K test record, an ARC row, another source). Records are opened through reason/induce.mjs `makeRecordReader`,
   whose spy lists every id opened; `learn()` throws when a held-out or a test id outside the 200 was opened.
2. THE SELF-QUERY. Every development row is asked of the organism as it is (act/prompt.mjs `ask()`, provider
   `'null'`, the kept store as `opts.programs`). A row answered wrong or refused is a mistake.
3. INDUCTION. For each mistake, reason/induce.mjs `search()`: programs of at most 4 operations that give the gold and
   read every positional quantity (the tier's gate 5).
4. THE RULE. A candidate is filed under the row's pattern at each level the tier answers from (role and cue). Kept
   only when it fits at least the gate's support of other development rows of the same lesson and contradicts NONE of
   the development rows of its pattern, of any lesson and any question form. The revision before this one only counted
   the rows of the forms it kept and relied on the tier's gate 7 for the rest; the skeptic found 35 entries that
   contradicted rows of their own lesson that way. No gate of the tier is relied on now.
5. THE SUPPORT GATE. Before anything is kept, the development rows are split in two by a salted sha256 of the id; the
   rule runs on one half and its programs are asked on the other, both ways. The support rises from 2 others by one
   until those programs answer 0 rows wrong and at least 60 right (0 wrong in 60 bounds the wrong rate below 5 percent
   at 95 percent, the rule of three). If the halves keep nothing first, no support is validated and nothing is kept.
6. THE RETRACTIONS. A kept entry of `bench/verdicts/induce-programs.json` that answered a development row wrong in the
   self-query has that row's question form retracted; the rows it answered right in that form are the cost, listed.
   `mergeStores` removes the form from the entry's `forms.roles` (the tier's gate 7 then refuses it) and never removes
   the entry. A retraction only refuses, so it cannot add a wrong answer.
7. THE MERGE. act/prompt.mjs (the program-guard item) loads the learned entries after the default store's and checks
   them against the default store's devRows; it does not read `retract`. The bar measures the merge as an object
   (`mergeStores`, arm (b)) and the production loader as it is (arm (b2)).

## What the numbers say (the bar run of 2026-09-28T19:29:03.605Z, bench/verdicts/self-learn.json)

- Rows: ledger 727 (development 21, refused 706), the other math.json development ids 179, train 7413 (held out 60
  never opened); opened 7613, held-out ids among them 0, test ids outside the 200 0.
- Before: asked 7613, right 147, wrong 222, refused 7244.
- The support gate: others 2 kept 19 entries on the halves, learned right 31, wrong 8; others 3: 8 entries, right 21,
  wrong 7; others 4: 4 entries, right 16, wrong 6; others 5: 1 entry, right 1, wrong 1; others 6: 1 entry, right 1,
  wrong 1; others 7: 0 entries. No support validated: nothing is kept (15 entries the rule keeps at 2 others refused
  by the gate).
- Retracted: 29 question forms of 22 kept entries on 222 wrong development answers (the cost: 66 right answers).
- After, on the development rows: right 81, wrong 0, refused 7532 (withdrawn 222, lost 66).
- Recount from the file: learned entries 0, contradicted 0.
- Held-out, 60 rows: merged answered 0, correct 0, wrong 0; control (kept alone) answered 2, correct 0, wrong 2
  (gsm8k-train.209, gsm8k-train.5502), both now refused. Gain 0, the bar 8. The production loader: correct 0, wrong 2
  (it does not apply the retractions), learned entries loaded 0.
- Test population, graded once: 1119 GSM8K test records outside the 200: merged correct 22, wrong 0, refused 1097;
  control correct 55, wrong 27, refused 1037; a learned program right 0, wrong 0.
- Cross-validation (e), development 2-fold, 7613 rows: kept alone right 147, wrong 222; merged right 85, wrong 15;
  learned right 0, wrong 0; withdrawn 207, lost 62; ceiling of any rule over role-pattern programs 769 of 7613.
- Tests: pass 7, fail 0. Fifteen mutants of self/learn.mjs (scratch, on a copy) each turned 1 or 2 tests red, among
  them: the contradiction counted on the own lesson only, on the fit forms only, the support rule off, the retraction
  off, the merge ignoring the retractions, the retraction removing the entry, the gate always accepting, the gate
  without its 60-right floor, the gate without its 0-wrong test, the gate keeping when it validated nothing. Sockets 0.

Why the gate asks 60 right: scratch development-only 2-fold runs (the rule on one half, asked on the other) printed a
learned right and wrong of 26 and 10 at a required fit of 3 rows of the lesson, 16 and 6 at 4, 12 and 2 at 5, 4 and 1
at 6 and 7, and 0 and 0 at 8 (nothing kept); requiring the fits per question form printed 23 and 9, requiring fits
that follow the worked chain 20 and 9. A gate that asked 0 wrong only (no floor on right) kept 1 program on the full
rows and its own cross-validation (e) printed learned right 16, wrong 6: a gate that stops where the halves keep
nothing has validated nothing.

BAR NOT MET (gain). Every other check holds: wrong 0 on the held-out rows, the tests, sockets, no leak, no
contradiction, 0 wrong out of sample (e), 0 wrong on the test population (d); the last two hold because nothing was
learned.

## What remains

- The gain bar (8 on 60 held-out rows) is not in reach of this store shape: the development ceiling of any rule over
  role-pattern programs is 769 of 7613, and every support the gate tried answered wrong out of sample before it
  answered 60 right.
- The production loader (act/prompt.mjs, the program-guard item's file) does not apply `retract`: in production the
  kept store still answers the 2 held-out rows and the 27 test rows the merge refuses. Reading `retract` there (remove
  the retracted forms from the kept entries' `forms.roles` before gate 7) is that item's change.
- The retractions cost right answers: 66 in sample, 62 out of sample (e), 55 to 22 on the test population.
- The gate keeps nothing today; it keeps programs by itself once the development rows give the halves 60 right and 0
  wrong at some support (more development rows per pattern, or a finer store key than the role form).
