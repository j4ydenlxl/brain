# program-guard (board 35)

A wrong exact answer is worse than a refusal. The program tier (act/prompt.mjs `programAnswer()`) answered by the shape of numbers: card probabilities and ISO weekdays with integers, gsm8k.991 with 42, and the census rows alg-01, alg-02, alg-04 and word-08 before the exact solver. This item gives the tier two more gates and a guarded load of the learned store.

## What was built

- **Gate 6, THE KIND** (act/prompt.mjs `PROGRAM_KIND_CUES`, `otherKind()`): cue words that name a kind no kept program was induced for (weekday, date, card, die, coin, probability or a chance, letter, word count, unit conversion, sequence term, comparison, equation, a fraction asked for as a fraction). Such a prompt is refused before any program is asked. It is counted in `PROGRAM_TIER.kind`, and `PROGRAM_KINDS` records the kind by name. These are the exact path's kinds, and the exact path runs before the tier. So when the exact path read such a prompt and refused it, the refusal stands.
- **Gate 7, THE FORM** (act/prompt.mjs `formGate()`, reason/induce.mjs `questionForm()`): every kept entry now carries `forms.roles`, the role-level patterns of the development records it fit. That pattern covers the quantity count, the question's cue classes, the named quantities, and each quantity's role tag (money, percent, clock or count, plus each / times / more-less / in-question). The tier answers only a prompt whose form is one of them; anything else is counted in `PROGRAM_TIER.form`.
  - A store that declares forms, and the default store, refuse an entry without forms (`PROGRAM_TIER.unformed`).
  - A store with no forms at all, such as a planted test store, skips this gate.
- **The learned store**: `programStore()` loads bench/verdicts/learned-programs.json after induce-programs.json, add-only.
  - A missing file is a no-op that counts nothing. An unreadable file counts `learnedFailures`.
  - An entry is refused (`learnedRefused`) unless it has a non-empty `records` list, `learned.inducedFrom`, and a program the DSL reads.
  - `programStore(path, { learned })` loads a learned file beside any store.
- **The learned load's development check** (the fix after the skeptic): a learned entry loaded into the default store answered two development rows wrong that the tier had refused before (gsm8k.841 and gsm8k.906). So the default store now carries `devRows`, an index of the 533 development records its entries fit, each as [id, role form, leaf table, gold]. `learnedInto()` refuses a learned entry that would answer one of those rows wrong (`PROGRAM_TIER.learnedContradicted`): the row's pattern at the entry's level (reason/induce.mjs `patternAt()`) is the entry's pattern, the row's form is one of the entry's forms, and the program's value passes the invariant and is not the gold.
  - A store that declares forms and carries no `devRows` cannot be checked, so none of its learned entries loads (`PROGRAM_TIER.learnedUnchecked`).
  - `PROGRAM_GUARD.learnedCheck` false turns the check off for the bench's control. It is read at load time, so a caller that flips it calls `resetPrograms()`.
  - `PROGRAM_LEARNED.file` is the overlay the default store loads (bench/verdicts/learned-programs.json). A test plants a file there to run the default load's own code path.
- **Switches**: `PROGRAM_GUARD.on` (or `programGuard(false)`) turns both gates off, which is the control arm. `PROGRAM_GUARD.kind` and `PROGRAM_GUARD.form` each turn one gate off alone.
- **The forms data**: `node bench/program-guard.mjs --forms` wrote forms into bench/verdicts/induce-programs.json, add-only, and then the `devRows` index, also add-only. It read the development records through reason/induce.mjs `makeRecordReader`, using only ids of bench/verdicts/ns.json rows.development. The index is written only if a control passes: every level's pattern derived from the role form must equal the parsed pattern on every row.
- **The misses as the task named them**: bench/verdicts/self-queries-misses.jsonl is rewritten whenever self-queries re-runs. Another item re-ran it and its wrong rows went from 165 to 0, so the bar read (c) as empty and the control (e) failed. The draw and (c) now read the file as it was at 2026-09-28T17:51:40.859Z, from git blob 490740d3 (commit 718e358), and check its object id. Rows that are wrong on disk now are asked as well.

## How to run

```
node bench/program-guard.mjs --forms        # add forms and devRows where absent (re-run after any re-induction)
node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir <scratch> -- node --max-old-space-size=4000 bench/program-guard.mjs
node --test test/act-prompt.test.mjs
```

## What the numbers say

The first `--forms` run printed forms: entries 814 added 814 had 0; development records opened 533 (outside development 0, unreadable 0); role entries whose form is their own pattern 19 of 19, cue entries whose forms carry their cue pattern 48 of 48. The second run printed: development index added: rows 533 (records 533, without a gold 0, patterns derived from the role form 533 of 533); store bytes 223163 -> 266405.

The bar (bench/verdicts/program-guard.json, at 2026-09-28T19:07:07.399Z) printed the lines below. "Unplugged" means act/solve.mjs `kindsReader(false)`: the nine exact-kind readers are off, so the tier meets every prompt they would catch.

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

## What remains

- The must-keep set has 52 rows, not 60: only 52 development fits were answered right by the tier through ask() before the guard.
- The kind cues were written after the held-out file and checked against its must-refuse rows, so (a) and (c) measure the cues on phrasings they were written beside. The form gate alone also refuses all of (a) and (c) unplugged, and it was not tuned on them.
- (f) is development by construction: its rows are the index the check reads. With the check on it shows that the check and the tier agree; the control shows what the check refused.
- With the guard on, the tier still answers 18 of the 533 development rows wrong (70 answered). Those are GSM8K word problems, the kind it was induced for, answered at the floor precision board 26 chose (0.1046). The guard does not change that floor.
- What the form gate costs on unseen GSM8K word problems was not measured here (the ladder was not run).
- bench/induce.mjs does not write forms or devRows. After a re-induction, re-run `--forms`. Otherwise the default store fails closed: `unformed`, the tier answers nothing, and no learned entry loads (`learnedUnchecked`).
- docs/DEVELOPERS.md line 76 lists `solve 2x + 3 = 11` answered `program 31`, a wrong answer the doc keeps "so the bar notices the day it changes". The guard refuses it (kind equation), and ask() now gives the memory miss. test/developers.test.mjs fails 3 (checkClaims, the mutant run, the one bar run) until that row is changed. The guard off makes it pass, so the doc is the file to change, not the guard.
- The 36 arithmetic wrong rows are the exact path's ("product of" read as a sum), not the tier's.
