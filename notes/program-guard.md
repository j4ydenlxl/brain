# program-guard (board 35)

A wrong exact answer is worse than a refusal. The program tier (act/prompt.mjs `programAnswer()`) answered by the shape of numbers: card probabilities and ISO weekdays with integers, gsm8k.991 with 42, and the census rows alg-01, alg-02, alg-04 and word-08 before the exact solver. This item gives the tier two more gates and a guarded load of the learned store.

## What was built

- **Gate 6, THE KIND** (act/prompt.mjs `PROGRAM_KIND_CUES`, `otherKind()`): cue words that name a kind no kept program was induced for (weekday, date, card, die, coin, probability or a chance, letter, word count, unit conversion, sequence term, comparison, equation, a fraction asked for as a fraction). Such a prompt is refused before any program is asked. It is counted in `PROGRAM_TIER.kind`, and `PROGRAM_KINDS` records the kind by name. These are the exact path's kinds, and the exact path runs before the tier. So when the exact path read such a prompt and refused it, the refusal stands.
- **Gate 7, THE FORM** (act/prompt.mjs `formGate()`, reason/induce.mjs `questionForm()`): every kept entry now carries `forms.roles`, the role-level patterns of the development records it fit. That pattern covers the quantity count, the question's cue classes, the named quantities, and each quantity's role tag (money, percent, clock or count, plus each / times / more-less / in-question). The tier answers only a prompt whose form is one of them; anything else is counted in `PROGRAM_TIER.form`.
  - A store that declares forms, and the default store, refuse an entry without forms (`PROGRAM_TIER.unformed`).
  - A store with no forms at all, such as a planted test store, skips this gate.
- **The learned store**: `programStore()` loads bench/verdicts/learned-programs.json after induce-programs.json, add-only.
  - A missing file is a no-op that counts nothing. An unreadable file counts `learnedFailures`.
  - Since board 36 (item learn) `learnedInto()` also applies the file's `retract` list, first and exactly as self/learn.mjs `mergeStores` does: each retracted question form leaves the kept entry's `forms.roles` and is recorded in `forms.retracted`, so gate 7 refuses it; the entry is never removed. `PROGRAM_TIER.retracted` counts the forms removed and `PROGRAM_TIER.retractUnapplied` a retraction whose entry is absent or has no forms. A file that holds only `retract` is read, not counted as a failure.
  - An entry is refused (`learnedRefused`) unless it has a non-empty `records` list, `learned.inducedFrom`, and a program the DSL reads.
  - `programStore(path, { learned })` loads a learned file beside any store.
- **The learned load's development check** (the fix after the skeptic): a learned entry loaded into the default store answered two development rows wrong that the tier had refused before (gsm8k.841 and gsm8k.906). So the default store now carries `devRows`, an index of the 533 development records its entries fit, each as [id, role form, leaf table, gold]. Its `devRows.split` (board 36, the rule 7 disclosure) says the store was fit on these 533 records before board 35: 95 are among the 200 development ids of bench/verdicts/math.json and 438 are GSM8K test records outside them (533 in ns.json rows.development, 0 in its heldOut), so every measure on them is development, never held out. `learnedInto()` refuses a learned entry that would answer one of those rows wrong (`PROGRAM_TIER.learnedContradicted`): the row's pattern at the entry's level (reason/induce.mjs `patternAt()`) is the entry's pattern, the row's form is one of the entry's forms, and the program's value passes the invariant and is not the gold.
  - A store that declares forms and carries no `devRows` cannot be checked, so none of its learned entries loads (`PROGRAM_TIER.learnedUnchecked`).
  - `PROGRAM_GUARD.learnedCheck` false turns the check off for the bench's control. It is read at load time, so a caller that flips it calls `resetPrograms()`.
  - `PROGRAM_LEARNED.file` is the overlay the default store loads (bench/verdicts/learned-programs.json). A test plants a file there to run the default load's own code path.
- **Switches**: `PROGRAM_GUARD.on` (or `programGuard(false)`) turns both gates off, which is the control arm. `PROGRAM_GUARD.kind` and `PROGRAM_GUARD.form` each turn one gate off alone.
- **The forms data**: `node bench/program-guard.mjs --forms` wrote forms into bench/verdicts/induce-programs.json, add-only, and then the `devRows` index, also add-only. It read the development records through reason/induce.mjs `makeRecordReader`, using only ids of bench/verdicts/ns.json rows.development. The index is written only if a control passes: every level's pattern derived from the role form must equal the parsed pattern on every row. A later run (board 36, item learn) printed forms had 814 and wrote only `devRows.split` beside the rows (rows unchanged true): rows 533, in math.json development 95, outside 438, in ns development 533, in ns heldOut 0.
- **The misses as the task named them**: bench/verdicts/self-queries-misses.jsonl is rewritten whenever self-queries re-runs. Another item re-ran it and its wrong rows went from 165 to 0, so the bar read (c) as empty and the control (e) failed. The draw and (c) now read the file as it was at 2026-09-28T17:51:40.859Z, from git blob 490740d3 (commit 718e358), and check its object id. Rows that are wrong on disk now are asked as well.

## How to run

```
node bench/program-guard.mjs --forms        # add forms and devRows where absent (re-run after any re-induction)
node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir <scratch> -- node --max-old-space-size=4000 bench/program-guard.mjs
node --test test/act-prompt.test.mjs
```

## What the numbers say

The first `--forms` run printed forms: entries 814 added 814 had 0; development records opened 533 (outside development 0, unreadable 0); role entries whose form is their own pattern 19 of 19, cue entries whose forms carry their cue pattern 48 of 48. The second run printed: development index added: rows 533 (records 533, without a gold 0, patterns derived from the role form 533 of 533); store bytes 223163 -> 266405.

The bar at 2026-09-28T19:07:07.399Z (board 35, before the loader applied `retract`) printed the lines below; the board 36 run that replaced it is the next section. "Unplugged" means act/solve.mjs `kindsReader(false)`: the nine exact-kind readers are off, so the tier meets every prompt they would catch.

- held out: rows 112 (refuse 60, keep 52), same as written first true, draw reproduces true
- (c) rows: as of 2026-09-28T17:51:40.859Z (git blob 490740d3, commit 718e358, object id checked true) wrong 165 (probability 113, arithmetic 36, calendar 16), as named true; on disk now wrong 0
- (a) must refuse, guard: asked 60, answered by the tier 0, wrong 0 (exact kinds unplugged: answered by the tier 0, wrong 0)
- (a) must refuse, control (guard off): answered by the tier 1, wrong 1 (exact kinds unplugged: answered by the tier 51, wrong 51)
- (b) must keep: before 52, control arm now 52, after (guard) 52, drop 0 (exact kinds unplugged: after 52, drop 0; bar: at most 2)
- (c) wrong by the tier: guard 0, guard unplugged 0, control 0, control unplugged 129
- (d) guard: alg-01, alg-02, alg-04, word-08 and gsm8k.991 all memory (the refusal) in both exposures; the control answered alg-01 151, alg-02 20, alg-04 10, word-08 11 and gsm8k.991 42, all WRONG
- (f) the learned overlay on the 533 development rows, guard on: induced only tier 70 right 52 wrong 18; with the overlay and the check on (loaded 13, contradicted 1) tier 72 right 54 wrong 18, added wrong 0, added right 2; the control, check off (loaded 14), tier 73 right 54 wrong 19, added wrong 1 (gsm8k.906=7/10)
- sockets and fetches attempted: 0; tests: tests 32 pass 32 fail 0
- BAR MET, wrong by the tier with the guard (a+c+d, both exposures) 0

bench/verdicts/learned-programs.json is rewritten by the self-learn item while this runs. The skeptic's run loaded 49 entries, and there the unchecked overlay added gsm8k.841=4000/5600 and gsm8k.906=7/10. The run at 19:07 loaded 14 with the check off. The check reads whatever the file holds when the store loads.

Mutants, applied through a loader hook with the source file untouched, each made the tests fail 1 of 32:
- the default learned load removed
- the contradiction check a no-op
- the unchecked refusal removed
- the form filter of the check removed

With the contradiction check a no-op, the bar printed (f) false.

## The board 36 run (item learn: the loader applies `retract`)

`node bench/program-guard.mjs --forms` printed: forms: entries 814 added 0 had 814; development index had: rows 533 (records 533, without a gold 0, patterns derived from the role form 533 of 533, rows unchanged true); split descriptor added: rows 533, in math.json development 95, outside 438, in ns development 533, in ns heldOut 0; store bytes 266405 -> 266909.

The (f) line before the change (`bench/program-guard.mjs --no-write --no-test`, same tree): induced only tier 70 right 52 wrong 18; with the overlay, development check on (loaded 0, contradicted 0, unchecked 0) tier 70 right 52 wrong 18, added wrong 0, added right 0; control, check off (loaded 0) tier 70 right 52 wrong 18, added wrong 0.

The bar at 2026-09-28T23:25:11.438Z (the re-run after the skeptic; the 23:10:02 run printed the same counts without the attribution line) printed:
- store: learned store present, loaded 0, refused 0, contradicted 0, unchecked 0, forms retracted 29, retractions unapplied 0
- development index split: rows 533, in math.json development 95, outside 438, in ns development 533, in ns heldOut 0; must-keep rows (b) outside the 200 math.json development ids 48 of 52
- (f) induced only tier 70 right 52 wrong 18; with the overlay (loaded 0, contradicted 0, unchecked 0, forms retracted 29, unapplied 0) tier 16 right 16 wrong 0, added wrong 0, added right 0; control, check off (loaded 0) tier 16 right 16 wrong 0, added wrong 0
- (a) guard: answered by the tier 0, wrong 0 (unplugged 0, 0)
- (b) must keep: before 52, control arm now 52, after (guard) 16, drop 36 (unplugged: after 16, drop 36; bar: at most 2)
- (b) beside it, the guard on and the induced store alone: right 52 of 52, drop 0; right there and not with the store the tier loads 36
- (b) the 36 rows lost to the overlay, each matched to a retraction of bench/verdicts/learned-programs.json by (level, pattern, program, question form): matched 36 of 36, in 18 retraction entries of 22, which the self-query saw answer 200 development rows wrong and 64 right in their retracted forms; control: rows still answered right as shipped 16, matched to a retraction 0
- (c) wrong by the tier: guard 0, guard unplugged 0, control 0, control unplugged 129
- sockets and fetches attempted: 0; tests: tests 33 pass 33 fail 0
- BAR NOT MET: (a) true, (b) false, (c) true, (d) true, (e) true, (f) true, held out as written true, sockets 0 true, tests true; wrong by the tier with the guard (a+c+d, both exposures) 0

## What remains

A finer retraction key, measured by hand at checkpoint 4 (2026-09-28, a scratch script over the 36 must-keep rows bench/verdicts/program-guard.json lost to the overlay, the 64 development rows the same 18 entries answered right and the 200 they answered wrong; every keep prompt equal to its test.jsonl line by id, 52 of 52): the form alone recovers keep 3 and right 0 (a form holding no wrong row is not retracted; those 3 are a form the guard bench and the learner read differently). Adding a coarse feature of the prompt to the form recovers almost nothing: the sentence count keep 8 of 36 and right 6 of 64 (70 groups, 60 with a wrong row), an if clause 5 and 2 (39 groups, 32 with a wrong row), the word count band 4 and 1 (49 groups, 44), the named-quantity count 3 and 0 (27 groups, 24), a money word 3 and 0 (28 groups, 25). Adding a fine feature recovers by sparsity, not by a rule: the unit words after each quantity recover keep 34 of 36 and right 62 of 64 over 281 groups for 300 rows (190 with a wrong row), and the question sentence's first three words 31 and 46 over 253 groups (178 with a wrong row); a group holding one row separates nothing, it memorises that row. So no cheap feature of the prompt separates the wrong rows from the right ones inside a form; the next key has to read what the program computes (which quantity fills which role of the program), and its measure is the 1119 test records (wrong 0 first, then right), never these groups.

The first key that reads the program, measured the same way on the same 300 rows (2026-09-28, later the same evening): the unit-agreement signature, one state per add or sub node of the entry program (= when both operands carry the same unit word after their quantity, ! when they carry different ones, ? when either is unknown; a product is a new kind, a fraction or multiple of a keeps the unit of a). It does not memorise (46 groups for the 300 rows, 38 with a wrong row) and it recovers little: keep 7 of 36 and right 6 of 64 by the form alone are 3 and 0, so the signature adds keep 4 and right 4. It shifts the odds without deciding: for sub(q0,add(q1,q2)) in the form n3|q|x|rn,n,n the agreeing rows (add=,sub=) hold keep 2, right 7, wrong 5 and the disagreeing ones (add!,sub?) keep 1, right 4, wrong 19, and under rule 6 (wrong 0) both groups stay retracted. The largest groups say nothing: the programs with no add or sub node (shrink(shrink(q0,f0),f1) keep 6 right 10 wrong 25; mul(div(q2,q0),q1) right 2 wrong 25; div(mul(q0,q2),q1) keep 2 right 7 wrong 14) have an empty signature. What separates their rows, read on the rows themselves, is reference, not units: for shrink(shrink) whether the second fraction is of the same whole (a third of its sales, a quarter of its sales: the parallel case, wrong) or of the remainder (of those who went, of the non-white homes: the sequential case, right); for mul(div) with two times cues which entity holds the given quantity in the chain of X has N times as many as Y (the base, the top or a sibling: cirrus 4 times cumulus 12 times cumulonimbus given cumulonimbus is a product, wrong; Xavier 3 times Katie 4 times Cole given Xavier is two divisions, wrong; Tyrah 6 times Sarah and Tim 8 times Sarah given Tyrah is the one the program computes, right). A key that reads reference needs an entity parse the reader does not have, so the retractions stand at the form, the 36 must-keep rows stay lost, and this note records the two measured keys that do not recover them.

- BAR NOT MET since board 36, on (b) alone: with the retractions applied in the production loader, (b) prints after (guard) 16, drop 36 (bar: at most 2); the induced store alone, guard on, prints right 52, drop 0, and the attribution line matches each of the 36 to a retraction entry by the key gate 7 refuses on (36 of 36, 18 entries, 200 development rows wrong and 64 right in those forms; 0 of the 16 rows still right match one). Every retracted form answered at least 1 development row wrong (self/learn.mjs RETRACT.wrong 1), so giving back any of the 36 gives back a wrong answer: no retraction threshold meets (b) under rule 6. Rule 6 (a wrong answer is worse than a refusal) and the (b) bar disagree here; which one gives way is the orchestrator's call, not this item's.
- The must-keep set has 52 rows, not 60: only 52 development fits were answered right by the tier through ask() before the guard.
- The kind cues were written after the held-out file and checked against its must-refuse rows, so (a) and (c) measure the cues on phrasings they were written beside. The form gate alone also refuses all of (a) and (c) unplugged, and it was not tuned on them.
- (f) is development by construction: its rows are the index the check reads. With the check on it shows that the check and the tier agree; the control shows what the check refused.
- With the guard on, the tier still answers 18 of the 533 development rows wrong (70 answered). Those are GSM8K word problems, the kind it was induced for, answered at the floor precision board 26 chose (0.1046). The guard does not change that floor.
- What the form gate costs on unseen GSM8K word problems was not measured here (the ladder was not run).
- bench/induce.mjs does not write forms or devRows. After a re-induction, re-run `--forms`. Otherwise the default store fails closed: `unformed`, the tier answers nothing, and no learned entry loads (`learnedUnchecked`).
- docs/DEVELOPERS.md line 76 lists `solve 2x + 3 = 11` answered `program 31`, a wrong answer the doc keeps "so the bar notices the day it changes". The guard refuses it (kind equation), and ask() now gives the memory miss. test/developers.test.mjs fails 3 (checkClaims, the mutant run, the one bar run) until that row is changed. The guard off makes it pass, so the doc is the file to change, not the guard.
- The 36 arithmetic wrong rows are the exact path's ("product of" read as a sum), not the tier's.
