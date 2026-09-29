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
- `test/self-learn.test.mjs`: 7 tests on planted trees in a temp dir (no act/prompt.mjs ask(), no socket). The first carries a control since board 36: the same six rows with the sixth gold written right, where the program contradicts none of them and the rule keeps it.
- `bench/verdicts/learned-programs.json`: the learned store (version 2): `levels` (learned entries in the kept store's
  shape, each with `learned` provenance and `forms.roles`), `retract` (the retracted forms, each with its wrong and its
  right development rows), `gate` (every support tried), `minSupport` (null when no support is validated).
- `bench/verdicts/self-learn-heldout.jsonl`: the 60 held-out ids, each with its line and its question's sha256.
- `bench/verdicts/self-learn.json`: the verdict.
- `bench/fixtures/public/gsm8k/train.jsonl`: the GSM8K train split (MIT), its line in `bench/fixtures/public/SOURCES.md`.

The bar:

    node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir state/board36/learn --record state/board36/learn/budget-self-learn.json -- node --max-old-space-size=4000 bench/self-learn.mjs

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
   them against the default store's devRows. Since board 36 (item learn) its `learnedInto()` also applies `retract`,
   first and exactly as `mergeStores` does (the form removed from `forms.roles`, the entry kept; counters
   `PROGRAM_TIER.retracted` and `retractUnapplied`). The bar measures the merge as an object (`mergeStores`, arm (b))
   and the production loader as it is (arm (b2)); they now agree.

## What the numbers say (the bar run of 2026-09-28T23:09:14.930Z, bench/verdicts/self-learn.json)

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
  (gsm8k-train.209, gsm8k-train.5502), both now refused. Gain 0, the bar 8. The production loader: answered 0, correct
  0, wrong 0 (it printed wrong 2 at 19:29, before it applied the retractions); forms retracted 29, retractions
  unapplied 0, learned entries loaded 0.
- Test population, graded once: 1119 GSM8K test records outside the 200: merged correct 22, wrong 0, refused 1097;
  control correct 55, wrong 27, refused 1037; a learned program right 0, wrong 0.
- The rule 7 disclosure (board 36): of those 1119, 890 are in bench/verdicts/ns.json rows.development, 200 in its
  heldOut and 29 in neither; 438 are records the kept store fits (its devRows). The kept store was fit before board 35
  on ns.json rows.development (533 records: 95 among the 200 math.json ids, 438 outside them), not on the 200 only, so
  the control and merged counts on those 890 are development for the kept store, not held out; only a learned program
  is measured there on records it never read. `split.testPopulation` carries the counts.
- Cross-validation (e), development 2-fold, 7613 rows: kept alone right 147, wrong 222; merged right 85, wrong 15;
  learned right 0, wrong 0; withdrawn 207, lost 62; ceiling of any rule over role-pattern programs 769 of 7613.
- Tests: pass 7, fail 0 (the bar's own run). Fifteen mutants of self/learn.mjs (scratch, on a copy) each turned 1 or 2 tests red, among
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

The bar this note is the card of, bench/verdicts/self-learn.json at 2026-09-29T00:17:42.769Z (isTheBar true, barMet false on gain), printed: 7613 development rows asked with the model off, 0 programs learned from 7466 mistakes (the support gate at 2 others right 31 wrong 8, at 3 others right 21 wrong 7, at 4 others right 16 wrong 6, then 1 and 1, 1 and 1, 0 and 0, against 0 wrong and at least 60 right, so no support validated), 29 question forms of 22 kept entries retracted on 222 wrong development answers; on the 60 held-out rows the merged store 0 right 0 wrong against the kept store 0 right 2 wrong (gain 0, bar 8; wrong 0, its bar); two-fold on development the retractions withdrew 207 wrong answers and lost 62 right; the ceiling of any rule over the store shape 837 of 7613 with the chain programs (769 before them), reachable 1095 to 1197, unreachable 6518 to 6416 (causes before: 451, 1245, 1812, 2711, 299; after: 318, 84, 1794, 3922, 298; pattern after: own form 1782, shared form 970, not whole 1170); on the 1119 test records outside the 200 a learned program answered 0 right 0 wrong; tests 13 pass 0 fail; sockets 0.

The store this note is also the card of, bench/verdicts/learned-programs.json at 2026-09-29T00:17:42.769Z (node self/learn.mjs, written by the self-learn item): read over 7613 development rows (727 ledger rows, of which 21 are ledger development rows and 179 math.json development ids, plus 7413 GSM8K train rows; 60 held-out ids kept apart) holding 7466 mistakes. The support gate tried three supports on the two halves (at 2 others: entries 21, asked 88, right 31, wrong 8; then asked 37, right 21; then asked 26, right 16) against its rule of 0 wrong and at least 60 right, so no support was validated and the store holds 0 learned programs and 0 patterns; it holds 22 retraction entries covering 29 question forms of the kept entries of the induced store; the floor is 0.1046, the chain programs allow 8 operations and 12 leaves, the program cap is 64.

## What remains
The six mutants board 36 skeptic ran against test/self-learn.test.mjs that 13 of 13 let live were run again at checkpoint 4 (2026-09-28, a scratch runner that applies each by exact string replacement to self/learn.mjs, runs the file, prints the tally and restores the file from git; base 17 tests, pass 17, fail 0): M4 (a row may reach itself in ceilingByCause) pass 16 fail 1, M6 (the chain program replaces the search programs, in offersOf and again in chainedCandidatesOf) pass 16 fail 1 both times, M12 (a fold of ceilingTwoFold reads its own rows) pass 16 fail 1, M13 (the CHAIN.maxOps guard removed from chainCandidate) pass 16 fail 1, M14 (its whole guard removed) pass 16 fail 1, each with the test written for it the one red. M15 (the gold fit removed from chainCandidate) passes 17 of 17 and is equivalent: chainOf hands chainProgram the gold, and chainProgram walks back to the last step whose value is within 1e-6 of it (the same relative tolerance fitsGold uses) and refuses the chain with the reason no step of the chain computes the gold on the prompt numbers when none is, so the value chainCandidate re-checks is already within the bar; the M13-M14-M15 test pins that first lock (the refusal and its exact reason) and the pair, not the second lock alone.


- The gain bar (8 on 60 held-out rows) is not in reach of this store shape: the development ceiling of any rule over
  role-pattern programs is 769 of 7613, and every support the gate tried answered wrong out of sample before it
  answered 60 right.
- The production loader applies `retract` since board 36, so production now refuses what the merge refuses. Its
  cost there: bench/program-guard.mjs (b), the 52 must-keep development rows, prints after (guard) 16, drop 36 (its bar
  allows 2), all 36 in retracted forms (the induced store alone prints 52); that bar is NOT MET since, and rule 6 and
  it disagree on which gives way.
- The retractions cost right answers: 66 in sample, 62 out of sample (e), 55 to 22 on the test population.
- The gate keeps nothing today; it keeps programs by itself once the development rows give the halves 60 right and 0
  wrong at some support (more development rows per pattern, or a finer store key than the role form).

## 2026-09-28, board 36, item learn-2: the ceiling by cause, and the straight-line programs read from the worked chains

### What was built

- `self/learn.mjs` (add-only): `CAUSES` (five, in order: (1) word quantity, (2) chain too long, (3) number from the
  text, (4) pattern, (5) other), `causeOf(row)` (the first cause that holds), `ceilingByCause(rows, {chain})` (a row
  is reachable when a program another development row of its role pattern offers gives its gold; every other row is
  filed under one cause, so the counts sum to the unreachable count), `ceilingTwoFold` (crossValidate's ruler),
  `chainOf`, `chainCandidate`, `offersOf`, and `CHAIN` (on, at most 8 operations, at most 12 leaves). With `chain` on
  (the default) `induceAndKeep` adds a row's chain program to its search candidates; the same rule judges it (the
  strict contradiction rule, the support, the 2-fold support gate, the retractions); an entry it keeps carries
  `learned.fromChain`. `learn`, `supportGate` and `crossValidate` take `chain`.
- `reason/induce.mjs` (add-only): `chainSteps` (the `<<a op b=c>>` annotations), `chainProgram` (the worked chain as a
  straight-line program over the prompt's positional quantities, its named leaves and earlier steps; a number none of
  them gives is a number from the text), `WORD_QUANTITIES` and `wordQuantities(text)` (a word quantity such as decade
  10 is read only when its word is in the text). Word leaves are used to MEASURE cause (1) only: the parse, the leaf
  table and the patterns are unchanged, so the kept store, its devRows and its forms are unchanged.
- `bench/self-learn.mjs`: (f) prints the ceiling by cause before (search programs only) and after (with the chain
  programs), and the support gate before (chain off) and after (chain on); the verdict carries `ceiling`.
  `--ceiling` prints the two tables only and writes nothing.
- `test/self-learn.test.mjs` (add-only, 4 tests): the classifier on five planted rows, one per cause, with the sum
  check and a control; a planted 3-step record gives `sub(add(mul(q1,q2),q0),q3)`; a word quantity is read only when
  its word is in the prompt; the chain programs leave the board 35 planted store unchanged (same levels, same
  program text) and keep a 5-operation program on six quantities only with them (the control keeps nothing).

### How to run

- The bar: `node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir <scratch> -- node --max-old-space-size=4000 bench/self-learn.mjs`
- The cause tables alone: `node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir state/self-learn -- node --max-old-space-size=4000 bench/self-learn.mjs --ceiling` (rule 4: every process under the budget wrapper; the board 36 second verify measured the run at 42.87 s and a 839.5MB peak)
- The tests: `node --test test/self-learn.test.mjs`

### The numbers (the bar run of 2026-09-28T23:53:23.331Z, bench/verdicts/self-learn.json)

- Ceiling by cause before: development rows 7613, reachable 1095, unreachable 6518: (1) word quantity 451, (2) chain
  too long 1245, (3) number from the text 1812, (4) pattern 2711 (own role form 1136, shared role form 815, the parse
  reads a quantity the chain never uses 760), (5) other 299; sum 6518; two-fold ceiling 769.
- Ceiling by cause after: reachable 1197, unreachable 6416: (1) 438, (2) 1230, (3) 1794, (4) 2656 (own role form 1136,
  shared role form 762, not whole 758), (5) 298; sum 6416; two-fold ceiling 837.
- Support gate before (chain off): at 2 others right 31 wrong 8, at 3 right 21 wrong 7, at 4 right 16 wrong 6, at 5
  right 1 wrong 1, at 6 right 1 wrong 1, at 7 right 0 wrong 0; no support validated. After (chain on, 2026 chain
  candidates added): the same counts (at 2 others 21 entries on the halves instead of 19); no support validated.
- Held-out 60: merged correct 0, wrong 0 vs control correct 0, wrong 2 (gain 0, the bar 8).
- Test population 1119, graded once: merged correct 22, wrong 0, refused 1097; control correct 55, wrong 27, refused
  1037; by a learned program right 0, wrong 0.
- Tests: pass 11, fail 0. BAR NOT MET (gain).

### What remains

- The largest cause left is (4) pattern, 2656 rows. It cannot be raised from the files this item owns: 1136 rows have
  a role form no other development row shares, and the tier answers a learned entry only on a prompt whose role form
  is in its `forms.roles` (gate 7 in act/prompt.mjs) and only when the program reads every positional quantity (gate
  5); a finer or coarser key would change `parse`, `patterns` or `leafTable`, which the kept store's patterns, devRows
  and forms are keyed on.
- The chain programs raised the ceiling (1095 to 1197 leave-one-out, 769 to 837 two-fold) and not the gate: within a
  shared role form the programs that reach more rows also answer other rows wrong, so every support still answers
  wrong out of sample before it answers 60 right.
- Cause (1), 438 rows, is reachable by the search once a word leaf (decade 10, dozen 12, ...) can be read at ask time,
  which needs a word leaf at ask time (reason/induce.mjs is owned here, add-only; the fix section below says why no word leaf was added); cause (3), 1794 rows, takes a number of its chain from
  the text (no quantity, leaf, word or earlier step gives it).

## 2026-09-28, board 36, item learn-2 fix: the cause classifier by each arm's own limit

### What changed

- `self/learn.mjs` `causeOf(row, { groupSize, words, chain })`: cause (2) uses the operation limit of its arm
  (`I.MAX_OPS`, 4, with the search programs only; `CHAIN.maxOps`, 8, with the chain programs on). The earlier after
  table filed a 5 to 8 operation chain under (2) although the chain arm admits it (its (2) read 1230).
- Cause (1) with the chain programs on: a row whose own chain program gives its gold (`chainCandidate`) is not filed
  under word quantity.
- Cause (4) names four parts: the parse reads a quantity the chain never uses (gate 5), more leaves than the window
  (12, gate 5), own role form (gate 7), shared role form. `ceilingByCause` returns `pattern.window`. The `CAUSES` texts
  say which limit each arm uses.
- `bench/self-learn.mjs`: the (b-c) line and `split.heldOut.of` print the train-split count from the counts (train
  plus held out, 7473) in place of a typed number; both cause tables and the statement's largest-cause clause print
  the four parts of (4); `contaminated` discloses this round (it read the printed lines of the build and of the
  skeptic; its edits and scratch runs read development rows only).
- `test/self-learn.test.mjs` (add-only): two tests, 13 in all. Three scratch mutants (the limit fixed at `MAX_OPS`,
  the own-chain rule removed, the window part removed) each failed a new test.
- `reason/induce.mjs`: unchanged in this round.
- The learn-2 section above said the parse is "not owned here": `reason/induce.mjs` is owned here, add-only. Corrected.

### Why no word leaf at ask time

- act/prompt.mjs (read-only here) checks every learned entry against the kept store's devRows (`contradicted`). A
  devRows row carries the leaf table it was fit with, so a word leaf absent there evaluates to NaN, fails
  `programAcceptable`, and the row is skipped, not graded: a word-leaf entry would load checked by no row. This item
  may not change or widen that check, so no word leaf was added.
- The selector binds anyway (below).

### Why the gain stays at 0 (scratch 2-fold runs over development rows only, deleted with the scratch)

- (The numbers in this bullet and the next came from scratch runs the fix round deleted with its scratch directory; no command in the tree re-prints them, so they are a lead for the next board, not a measure: the board 36 second verify named this.) At the role key, programs from one half asked on the other, chain programs on: k 1 right 155 wrong 953, k 2 right
  65 wrong 72, k 3 right 32 wrong 11, k 4 right 19 wrong 7 (chain off: k 3 right 32 wrong 11, k 4 right 19 wrong 7).
  Six other selectors (unanimous, chainK, newv, all, allUnan, chainUnanNew) printed a wrong count above 0 at every k
  where the right count was above 0; none reached 60 right with 0 wrong.
- Finer keys have almost no shared groups: role plus units 175 rows in shared groups, role plus question words 130,
  both 10 (leave-one-out at k 1: right 56 wrong 58, right 10 wrong 47, right 4 wrong 5).

### The numbers (the bar run of 2026-09-29T00:17:42.769Z, bench/verdicts/self-learn.json)

- Ceiling by cause before (search programs only, at most 4 operations): reachable 1095 of 7613, unreachable 6518:
  (1) 451, (2) 1245, (3) 1812, (4) 2711 (not whole 760, window 0, own role form 1136, shared role form 815), (5) 299;
  two-fold 769.
- After (with the chain programs, at most 8 operations): reachable 1197, unreachable 6416: (1) 318, (2) 84,
  (3) 1794, (4) 3922 (not whole 1170, window 0, own role form 1782, shared role form 970), (5) 298; two-fold 837.
  Both sums equal the unreachable count (printed true).
- Support gate before and after: at 2 others right 31 wrong 8, at 3 right 21 wrong 7, at 4 right 16 wrong 6, at 5
  right 1 wrong 1, at 6 right 1 wrong 1, at 7 right 0 wrong 0; no support validated (19 entries at 2 others before,
  21 after; chain candidates added 2026).
- Held-out 60 of the 7473 train-split rows: merged correct 0, wrong 0; control correct 0, wrong 2 (gsm8k-train.209,
  gsm8k-train.5502); gain 0, the bar 8. Production loader 0 right, 0 wrong; forms retracted 29, unapplied 0.
- Test population 1119, graded once: merged correct 22, wrong 0, refused 1097; control correct 55, wrong 27, refused
  1037; by a learned program right 0, wrong 0. Ledger test 109: merged correct 1, wrong 0; control correct 1, wrong 0.
- Development 2-fold (e): kept alone right 147, wrong 222; merged right 85, wrong 15; learned right 0, wrong 0.
- Tests: pass 13, fail 0. BUDGET: wall 74.55 s, peak ram 1887.2MB. BAR NOT MET (gain).

### What remains

- The largest cause left is (4) pattern, 3922 rows: own role form 1782 (gate 7), not whole 1170 (gate 5), shared role
  form 970. Only the shared part is open to a learner without a gate change in act/prompt.mjs, and there the programs
  another row of the form offers answer other rows of it wrong out of sample before they answer 60 right.
- Cause (3), 1794 rows: a number of the chain comes from the text. Cause (1), 318 rows: needs a word leaf the devRows
  check in act/prompt.mjs can grade.
- The merged store answers 15 development rows wrong on the 2-fold (the retractions of one half do not cover the
  other); the held-out and test counts of the merged store are 0 wrong.
- The after table of the run 2026-09-28T23:53:23.331Z above filed rows by the search limit; the table here supersedes it.
