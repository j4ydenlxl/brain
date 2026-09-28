# The mistake ledger (board 34, item mistakes)

His orders 5 and 6 (docs/VISION.md): learning from mistakes, self iteration. Before this item a mistake was
written down by the bench that graded it and read by nothing. Now every graded row the organism got wrong or
refused is read back into one ledger, grouped into lessons that name the module that would carry them, and asked
again with no model. A GAP (self/gaps.mjs) is a bar not met; a MISTAKE is one graded row, a finer grain.

## Files

- `self/mistakes.mjs`: the readers (one per source), the why classifier, the shape vocabulary, the lessons, the
  prompt and answer lookups, the graders, the re-ask worker (`Asker`) and `reaskAll`, the `--since` diff.
- `bench/mistakes.mjs`: the bar. Writes the ledger every run, and with `--reask` the re-ask rows and the verdict.
- `test/mistakes.test.mjs`: 26 tests (readers, rejections, dedup, lessons, graders, the worker, `--since`, the
  verdict shape, the held-out split check, the bar's parts, the control builders, the controls holding with the real
  grader, and each control failing per row).
- `bench/verdicts/mistakes-ledger.jsonl`: one row per mistake, rebuilt from the sources on every run.
- `bench/verdicts/mistakes-reask.jsonl`: one row per re-asked mistake `{id, source, before, now, given, ...}`.
- `bench/verdicts/mistakes.json`: the verdict.
- `bench/verdicts/mistakes-heldout.json`: the held-out split. Its own text says it was written before any vocabulary
  code; the bar checks only an mtime order (see the split below).

The bar:

    node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts --record state/board34/mistakes/budget.json -- node --max-old-space-size=4000 bench/mistakes.mjs --reask

`--json` prints the verdict. `--since <prev mistakes.json>` prints learned and regressed per source, paired by id.
`--limit N` is a partial re-ask and never writes a verdict. A run without `--reask` writes only the ledger.

## Design

Five sources, five readers. A reader throws a `ShapeError` on a row shape it has not seen (a key outside its set, a
missing key, a row type or an arm it does not know). A source file that is missing is reported `absent`, never
skipped, and then the run is not the bar.

| source | file | a mistake is | its own count |
|---|---|---|---|
| gsm8k | bench/verdicts/public/gsm8k-public_1.jsonl | organism arm, last row per id, ok false | public-gsm8k.json arms.organism n minus correct |
| humaneval | bench/verdicts/public/humaneval-public_1.jsonl | the same | public-humaneval.json, the same |
| conceive | bench/verdicts/conceive.json | organism arm, gradeable, graded not true | conceive.json arms.organism gradeablePresent minus correct |
| answer | bench/verdicts/answer.json | arms organism and null (both the organism), ok false; the alone arm is the model by itself and is not read | answer.json arms.organism plus arms.null, n minus correct |
| arc | bench/verdicts/grid-curve-evaluation-30000ms.jsonl | not solved at 30 s (the 3 s status rides along in `detail`) | grid-curve.json, the point whose journal is that file, of minus solved |

Why: `refused`, `wrong-exact`, `wrong-program`, `wrong-model`, `wrong-memory`, `timeout`, `found-but-wrong`,
`unknown`. `wrong-memory` was added to the task's list: the census has 4 rows and the answer bench 3 where the
knowledge or memory tier retrieved a wrong passage, which is none of the other kinds. `unknown` is a seen shape whose
values no rule maps; the bar needs 0.

Two readings that are not the source's own:

- HumanEval: 11 rows have provenance `model`, 54 code characters, and the error `SyntaxError: Unexpected identifier
  'code'`. That is the code region's miss text ("the code region produced no candidate: ...") handed to the test
  runner as a program. `bench/public.mjs` grades it as a wrong answer; the ledger reads it as `refused`.
- GSM8K: a row with no number whose math region reports every program failed is `refused`.

Contamination: a public test prompt or answer (GSM8K, HumanEval, ARC) is never in the ledger. The row carries a
pointer `{file, key}` in `promptRef` and `wantedRef`. The census prompts and rubrics (a committed file) and the answer
bench's expected values (a committed verdict) are carried as text.

Dedup: the last row per (source, id) in file order is read, and only then is it asked whether it is a mistake. A row
answered right on its last reading is not in the ledger.

Lessons: every row gets a shape. GSM8K, the census and the answer fixture get the operation the prompt asks for, read
from the question text by the ordered vocabulary `OPS` in `self/mistakes.mjs` (first match wins: language and code
tasks first, then arithmetic from the most specific operation to the most general, then a question of fact).
HumanEval gets the failing test's kind (the error class, a timeout, no candidate). ARC gets the transform family: a
found-but-wrong task gets the learner that wrote its last step, and a timed out or exhausted task gets the size
relation of its train pairs. Each lesson is `{shape, count, bySource, whys, examples (3 ids), ownerHint}`, ranked by
count.

The re-ask asks every ledger row whose prompt is on disk through `ask()` with provider `null`, on one
`seedBasic` brain in one worker thread, warmed with `bench/conceive.mjs` WARM (the census's own brain). ARC rows are
skipped, and the output says so: a grid task is not a prompt. A row still running 2000 ms after it was posted is cut:
the worker is terminated, a fresh one is warmed for the next row, and the row counts `refused` with `timedOut`. Each
answer is graded by its source's own rule behind one native gate (`isNative`, so an empty text or a miss text is a
refusal):

- GSM8K: `lastNumber` and `sameInteger` against `finalAnswer` (bench/public.mjs).
- HumanEval: `extractCode`, `cutAtStopTokens`, then the record's own tests in `runTests` with 5000 ms and 128 MB,
  the budget the journal header records.
- The census: `gradeAnswer` (bench/conceive.mjs).
- The answer bench: `gradeAnswer` (bench/answer.mjs).

`now` is one of four values:

- `fixed`: the answer is right. A row that was `refused` before and is `fixed` now is LEARNED.
- `refused`: no answer.
- `still`: wrong now and wrong before.
- `wrong-now`: wrong now and refused before. This is a regression, because a wrong answer is worse than a refusal.

isTheBar: all five sources read, none absent, `unknown` 0. barMet: isTheBar, and the re-ask ran through `ask()` on
every row whose prompt is on disk (never an injected asker), and the lessons carry at least 90% of rows, and every
source's ledger count equals its own count, and the grader controls hold, and the split is not contaminated.

The split (board rule 1): `split.contaminated` is `false` or the reasons. It is false only when the held-out file is
on disk, its ids hash (sha256 of the ids joined by a newline, as the writer hashed them) to the `idsSha256` it
recorded when written, it names as many ids as its `n`, none of its ids is a gsm8k ledger row, and the mtime of
`self/mistakes.mjs` is later than the held-out file's `at` field (`split.code.mtimeLaterThanHeldOutAt`). That last check
is necessary and not sufficient for "the vocabulary was written after the held-out file": any later edit of
`self/mistakes.mjs` passes it, and nothing on disk records the file's first write. The bar prints all of it on its
`SPLIT heldOut` line, the order check in those words, and gates on it.

Controls (named, printed, never fitted, and none can hold for any result):

- gold, per re-askable row: the row's own right answer is graded and must read `fixed`. On disk for GSM8K (the
  integer after ####, as "The answer is N."), the answer bench (the fixture answer) and the census exact rubrics (the
  answer). Built for the rest from the row's own rubric or tests, never checked against the grader first: contains
  (the rubric's terms), regex (a string built from the pattern: first alternative, each quantifier's minimum, a class's
  first representative, an anchor honoured or the row gets no gold), length (a text at the low edge of every band), code
  and HumanEval (a function returning each test's expected value for its arguments, or in call order when two tests
  pass arguments with one JSON key). A HumanEval row whose own tests do not compile (node:vm) cannot pass any reply; it
  is counted apart and must read not fixed. A row with no gold built keeps the controls unmet.
- wrong, per re-askable row: a deliberately wrong reply (GSM8K, the answer bench and exact rubrics: the answer with its
  last integer plus one; contains: the terms less the one the rubric needs; regex: "-"; length: one unit over the first
  band; code: a function returning an object no test expects) must be graded answered and wrong (`still` on a row
  that was wrong before, `wrong-now` on a row that was refused before; both are printed).
- empty: ONE call, the empty reply on the first re-askable row, must read `refused`. It is printed as one call, never
  as a per-row count: the native gate refuses an empty text before any rubric runs, so a count of it says nothing.
- regrade: the source's own wrong answer, graded by this file's grader, is wrong. HumanEval keeps no code in its
  journal, so it has no regrade.
- censusKind: agreement between the shape read from a census prompt and the census's own kind.
- heldOut: the share of held-out GSM8K questions (answered right, so never ledger rows) the vocabulary shapes, measured
  once here, never used to tune.

The controls hold when regrade is wrong on every regraded row (at least one), every re-askable row has a gold and a
wrong reply, gold reads fixed on every row but the ones whose tests do not compile (which read not fixed), wrong is
graded wrong on every row, and the one empty call reads refused.

## Fix pass (2026-09-28, after the verify plane)

Three defects the verify plane found, each fixed at the source:

- The held-out integrity check hashed `JSON.stringify(ids)`; the file stores the hash of `ids.join('\n')`. The verdict
  recorded `idsSha256Holds: false`, nothing printed it and the bar did not gate on it. Now `heldOutIdsHash` hashes
  the way the writer did, the check is printed (`SPLIT heldOut`), and a failed check makes the split contaminated,
  which keeps the bar unmet. A test holds the old encoding failing, a tampered id failing, a short `n`, a ledger
  overlap, an absent file and code older than the held-out file, and the real file holding.
- The split had no `contaminated` field. It has one now (`false` or the reasons), and `barMetOf` requires `false`.
- The statement quoted "2000 ms each", a number the bar never printed. The `REASK all` line now prints the wall per
  row and the timed-out total, and a test asserts every number in the statement is a number the bar prints (a
  mutant that drops the wall from the line fails it on 2000).

Read before the fix: the held-out file's own keys (its `idsSha256` equals sha256 of the ids joined by a newline, not
of their JSON), the verdict's `split`, and the board rule 1 text in the task.

## Second fix pass (2026-09-28, board 34b)

Three defects the verify plane found, each fixed in code:

- `test/mistakes.test.mjs` asserted `shaped === 0 || shaped === 1` on a one-question fixture, which holds for any result. It
  now plants a question the vocabulary reads (a sale price at 25% off: shaped 1, `byOp {percent: 1}`) and one it cannot
  (which element has atomic number 1: shaped 0, the id in `unshapedExamples`), and asserts the lesson each row makes
  (`percent`, 1, the example id, the owner `act/word.mjs`; the unshaped row makes none).
- The statement said the vocabulary was written after the held-out file; the check was the mtime of
  `self/mistakes.mjs` alone. The statement, the `SPLIT` line, the `split.code` object and the contamination reason now
  name the check itself (the mtime is later than the held-out file's `at`) and say it is necessary and not
  sufficient. A sha256 of the code could not be recorded when the held-out file was written, since the code did not
  exist yet.
- The empty control (418 of 418 refused) could not fail: the grader refuses an empty text on its first line. It is
  replaced by gold and wrong replies for every re-askable row, and the empty reply is one call. The tests show each
  control failing on a planted set: a grader that passes everything fails wrong on every row, one that refuses
  everything fails gold, one flipped row gives exactly one disagreement for gold and for wrong, a grader that answers the
  empty text fails the empty control alone, a row whose tests do not compile may never read fixed, and a row with no
  gold built or no regrade row keeps the controls unmet. Six mutants of the bar (dropping each part of `holds`,
  restoring the old claim, counting every held-out question shaped, letting an uncompilable row read fixed) each fail
  the tests.

Two fixture facts the new controls found:

- HumanEval_51_remove_vowels: its tests hold a raw newline inside a double-quoted string, so they do not compile and
  no reply can pass the row. It is the one gold row that reads not fixed.
- HumanEval_92_any_int: two tests pass 3 and 3.0, one number in JavaScript, and expect true and false. A function of
  its arguments cannot pass both; the gold reply for it returns the expected values in call order.

## Measured (the bar run of 2026-09-28, bench/verdicts/mistakes.json)

Printed by the bar:

- The sources. Every count matches the source's own count.
  - gsm8k: 130 mistakes of 1319 graded rows; own count 130.
  - humaneval: 38 of 161; own count 38.
  - conceive: 247 of 263; own count 247.
  - answer: 3 of 140; own count 3.
  - arc: 309 of 400; own count 309 (timedOut 272, foundButWrong 35, exhausted 2).
- The ledger: 727 rows, dedup dropped 0.
- By why: refused 267, wrong-exact 0, wrong-program 4, wrong-model 142, wrong-memory 7, timeout 272,
  found-but-wrong 35, unknown 0.
- Lessons: 60 lessons carry 720 of 727 rows (0.9904); 7 rows are unshaped.
- The largest lessons:
  - grid no program in the clock, same size: 197.
  - grid no program in the clock, smaller output: 61.
  - fraction of: 26.
  - code test, wrong value: 25.
  - grid program fit the train pairs and missed the test, last step cellRule: 22.
- Controls, per re-askable row (418):
  - gold: 417 of 418 fixed (on disk 227, built 191); 1 reads not fixed as required, its own tests do not compile
    (HumanEval_51_remove_vowels). By source: gsm8k 130/130, humaneval 37/38, conceive 247/247, answer 3/3.
  - wrong: 418 of 418 graded wrong (still 153, wrong-now 265).
  - empty: 1 call (gsm8k.51), reads refused.
  - regrade: 126 of 126 wrong.
  - censusKind: 242 of 247.
  - heldOut: 195 of 199 shaped.
  - The controls hold.
- The split: 199 ids (n 199), ids sha256 58e8bc0f0e3f holds, ledger overlap 0; the mtime of self/mistakes.mjs
  (2026-09-28T13:29:52.248Z) is later than the held-out file's at (2026-09-28T13:06:26.008Z), necessary and not
  sufficient; contaminated false.
- The re-ask (418 of 418 re-askable rows; 309 ARC rows skipped):
  - gsm8k: 130 rows. Fixed 1, still 10, refused 118, wrong-now 1, learned 0, median 1.54 ms.
  - humaneval: 38 rows. All refused, median 1.39 ms.
  - conceive: 247 rows. Fixed 85, all of them learned (refused before); still 8, refused 154, median 0.579 ms.
  - answer: 3 rows. Fixed 1, refused 2, median 1.118 ms.
  - All sources: 418 of 418 rows, fixed 87, still 18, refused 312, wrong-now 1, learned 85, timed out 0, median
    1.036 ms, wall 2000 ms per row, one worker start, run 1360 ms.
- isTheBar true, barMet true.

## Open

- LEARNED is 85, all census rows. The first fix pass's run read 0. This pass changed no act/ file; act/ files changed on
  disk between the two runs (other items of board 34), and each re-ask row records the route that answered it. The
  ledger is the queue that says where to build; the re-ask is the check that a build landed.
- gsm8k.991 is `wrong-now`. The model-on arm refused it; model off, the program tier answers 42, which is wrong.
  The program tier answers before the exact solver on the census algebra rows too (`still`). Owner: the tier order
  in act/prompt.mjs.
- HumanEval_51_remove_vowels cannot pass any reply until its fixture's tests compile; the fixture is not this item's
  to change.
- The public GSM8K and HumanEval rows were graded with the model cell on (provenance model or model+exact). The re-ask
  is model off, so for those two sources `still` and `fixed` compare a model-on answer with a model-off answer. The
  census and the answer bench's null arm were model off, like the re-ask.
- bench/public.mjs grades the code region's miss text as code, 11 rows. That file is not this item's to change.
- ARC is not re-asked. Its re-run is the grid search, not a prompt.
- The vocabulary is regular expressions. The census control disagrees on 5 of 247 rows.
- The split's order check is an mtime. A later edit of self/mistakes.mjs passes it; only a record written when the
  held-out file was (a commit, a signed stamp) could make it sufficient.

## 2026-09-28, after board 34b's second verify (by hand)

- The wall test cut a 1 ms wall against an ask the organism answers in 0.578 to 1.546 ms (2 misses in 50 isolated runs): the
  Asker's worker now honours a test-only `holdMs` (200 ms in the test, never set by the bench), so the cut is deterministic.
- The statement said "2000 ms each" where 2000 is the wall per row; it now reads "a wall of 2000 ms per row", and the test
  pins that phrase and the "necessary and not sufficient" qualifier in the statement's own words (a respelled mutant no longer passes).
- Every ledger and re-ask row now carries the run's `at`: test/wire-induce-verify.mjs rebuilds the GSM8K held-out pool at an
  instant from every journal under bench/verdicts and reads a stampless row as older than any instant, so the first ledger
  (no `at`) shrank the pool at ns.json's at from 229 to 209 in the gate; stamped, the rows fall after that instant.
