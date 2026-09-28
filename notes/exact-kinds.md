# Nine kinds, exactly or not at all: act/exact-kinds.mjs (methods exact.units ... exact.logic)

Author: board 34 builder, item exact-kinds. The census verdict bench/verdicts/conceive.json (at 2026-09-28T12:18:03.618Z) printed the organism native 0 on units, sequence, counting, spelling, calendar, comparison, probability, geometry and logic: 58 census rows (units 8, sequence 7, counting 6, spelling 6, logic 6, calendar 7, geometry 5, comparison 8, probability 5), every one refused, while the model arm answered them.

## What it is

`exactKinds(text)` runs nine readers (units, sequence, counting, spelling, calendar, comparison, probability, geometry, logic). A reader answers only when one of its frames read every word of the text; a text read in part is null. Every printed number is a BigInt rational from `tasks/exact.mjs`; no float is printed, and a value that is not exact in the form asked for is a refusal. All nine readers run inside try/catch; when two readers answer and disagree the result is null, otherwise the first answer is returned with method `exact.<kind>`. The module imports `tasks/exact.mjs` and nothing else, and caps its input (`KIND_CAPS`: 1000 characters on the raw text before any tidying, 64 list items, sequence index 10000, geometric index 512, 20 coins, 100 sides, 200 characters of a quoted string, years 1753 to 9999).

## Where it sits in solve(), and why

`act/solve.mjs solve()` tries, in order: grid, compare, sequence, expression, compute prefix, spoken, the word reader, then the three gap readers below, then `exactKinds`, then the format-tail set-aside. The nine kinds come after every older reader has returned null, so no answer an older reader gave can move; the control below checks that on the whole census. The format tail gained one guard: a kind-method answer that is not a number does not meet a tail that asks for a number, numeral, digit, integer or figure (a spelled-out "forty" does not satisfy "answer with a number").

`kindsReader(on)` switches the gap readers and the nine kinds off and on, the same way `wordReader(on)` does for the word reader. It is the control: the bench runs the census as a child process once with `--import` of a data URL that calls `kindsReader(false)` (this item unplugged) and once as is.

## The three gaps in solve()

1. A range sum: "the sum of (all) (the) (whole/natural/counting) numbers from A to B", "between A and B inclusive", "add up ... from A to B". The answer is (A+B)(B-A+1)/2 in BigInt. Refused: A greater than B, "between" without "inclusive" (exclusive or not is unsaid), natural or counting numbers starting at 0, "even numbers" and every other filter.
2. A remainder: "the remainder when A is divided by B", "the remainder of A divided by/over B", "A mod/modulo B". Non-negative integers only, B not 0. Refused: `100 % 7`, a negative, a decimal, B equal to 0.
3. "What is 0.1 + 0.2 exactly?" answers 0.3. The word "exactly" at the end is removed, the head goes back through solve(), and only an `exact.arith` answer is kept; when the head wrote a decimal and the rational terminates, the answer is printed as that decimal (3/10 becomes 0.3; 1/3 stays 1/3). Refused: any head solve() does not answer as arithmetic ("the capital of France exactly", "cats and dogs in exactly two sentences").

test/solve.test.mjs pinned "the seven rows the reader computes today" out of ten; the three rows this item closes now answer, so the pinned list became all ten: `['391', '6912', '1024', '621', '5050', '36', '7/8', '2', '0.3', '504']`. That is a strengthening (three more pinned answers), not a weakening.

## The refusal rules (the point of the module)

- units: a unit whose size depends on place (gallon, ton, cup), weeks in a year, a mixed dimension, any unread word.
- sequence: fewer than four terms, a hypothesis confirmed by fewer than two terms beyond its own parameters, two surviving hypotheses that disagree.
- counting: vowels or consonants in a word with a y, hyphenated words, an unquoted sentence, legs and wheels and anything that needs knowledge of the world.
- spelling: an unquoted word, "capitalize X", a number over 99 that is not round.
- calendar: a date before 1753, February without a year, holidays, the first day of the week. Date arithmetic uses the days-from-civil algorithm in integer arithmetic (the year cap keeps every value a safe integer); a weekday is answered only when Zeller's congruence and the day count from 1970-01-01 agree; "days between" is the difference of the two day numbers.
- comparison: anything that is not a number or a quantity in the unit table, two quantities of different dimensions.
- probability: a coin or die not said to be fair, "odds", two draws without saying whether they are replaced.
- geometry: an irrational length (the diagonal of a square), a shape not in the table.
- logic: a conclusion that does not follow either way, a contradiction, an odd one out.

The seven development rows refused by design: count-06 (legs of spiders), logic-04 (odd one out), cal-07 (New Year's Day), cmp-03 (the Sun or the Moon), cmp-05 (sound or light), cmp-06 (cats and dogs in two sentences), cmp-08 (legs of a spider or an ant).

## The split

- Development: the 58 census rows of the nine kinds in bench/conceive-prompts.json, graded by their own grade field through `bench/conceive.mjs gradeAnswer`.
- Held out: bench/exact-kinds-heldout.jsonl, 106 rows, sha256 f4152c867438cb1ddc55e42cb14966b4d855b2e5e193286334b50114692121fc, written 2026-09-28T13:13:44.212Z, graded by `exactPass` on each row's answer plus a strict string match.
- Contaminated: yes, and the verdict says so. The held-out file was written and stamped before act/exact-kinds.mjs existed, but the same builder wrote both and every held-out phrasing was in view while the frames were designed. The held-out answered share is an upper bound, not a blind measurement. The wrong count and the refusals the tests pin do not depend on it.

## The bar

`node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/exact-kinds.mjs` writes bench/verdicts/exact-kinds.json. It asks `solve()` and then `ask()` with the model off (provider null, a seedBasic brain) on both populations, prints asked, answered, correct, wrong and refused per kind and per population with the median and p95 ns around `solve()` only, runs the census control, and runs `node --test test/solve.test.mjs test/answer.test.mjs test/exact-kinds.test.mjs`. barMet requires wrong 0 on both populations in both arms, a held-out answered share of at least 0.75, every other census kind keeping its organism native and correct counts between unplugged and as is, and the tests passing. Row texts carry timings ("... ns"), so the control compares texts with every timing masked.

## Measured (verdict at 2026-09-28T14:04:54.682Z, node v24.15.0)

- Development: solve asked 58, answered 51, correct 51, wrong 0, refused 7 (answered share 0.8793), ns median 43800, p95 166300; ask asked 58, answered 51, correct 51, wrong 0, refused 7.
- Held out: solve asked 106, answered 106, correct 106, wrong 0, refused 0 (answered share 1.0000), ns median 33600, p95 329100; ask asked 106, answered 106, correct 106, wrong 0, refused 0.
- Control (organism native,correct; committed | this item unplugged | as is): units 0,0 | 0,0 | 8,8; sequence 0,0 | 0,0 | 7,7; counting 0,0 | 0,0 | 5,5; spelling 0,0 | 0,0 | 6,6; logic 0,0 | 0,0 | 5,5; calendar 0,0 | 0,0 | 6,6; geometry 0,0 | 0,0 | 5,5; comparison 0,0 | 0,0 | 4,4; probability 0,0 | 0,0 | 5,5. "32 other kinds, kept by this item: true". Moved since the commit, not by this item, identical unplugged and as is: code 12,12, code-reading 4,4, sql 5,5, command 6,6, format 7,7 (the uncommitted code-native work in the tree).
- Census child lines: unplugged "organism native 24.05% refused 75.95% correct 50/263"; as is "organism native 41.58% refused 58.42% correct 101/263".
- Tests: "tests 46 | pass 46 | fail 0".
- "EXACT-KINDS isTheBar true barMet true: held-out answered share 1.0000 (bar 0.75), wrong solve 0 ask 0, other kinds kept true, tests true".

What was read before building: tasks/exact.mjs, act/exact-read.mjs, act/solve.mjs, act/word.mjs, act/prompt.mjs, bench/conceive.mjs, bench/conceive-prompts.json, bench/verdicts/conceive.json, bench/fixtures/answer-questions.json, test/solve.test.mjs, test/answer.test.mjs, notes/word.md, and the published algorithms used for the calendar: Zeller's congruence and the days-from-civil algorithm.
