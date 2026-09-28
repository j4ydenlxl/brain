# notes/self-queries.md: the organism asks itself generated questions whose truth it did not write

Board 34, item self-queries. His words (docs/VISION.md orders 5, 6 and 53): "simulating and stimulating itself by so
many automatic queries and self iteration". Until this item the organism was graded only on hand-written sets, so a
gap between two phrasings of one question, or between two sets of numbers under one phrasing, was never seen.

Files: `self/queries.mjs` (the generator), `bench/self-queries.mjs` (the bar), `test/self-queries.test.mjs`,
`bench/verdicts/self-queries.json`, `bench/verdicts/self-queries-misses.jsonl`. Nothing under act/, reason/ or any
other item's files was edited.

## How to run

```
node --test test/self-queries.test.mjs
node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/self-queries.mjs --n 5000 --seed 34 --seed 35
```

Model OFF: `ask()` from act/prompt.mjs with provider `null`, in process, on the brain bench/conceive.mjs builds
(seeds/basic.mjs `seedBasic`, full ledger, 4096 ring), one fresh brain per seed after the three WARM asks. The bench
replaces `net.Socket.prototype.connect` and `fetch` before ask() loads and counts any attempt (the verdict's
`sockets`). Flags: `--n`, `--seed` (repeatable, default 34 and 35), `--nowrite`, `--json`, `--quiet`,
`--no-selftest`. Only `--n 5000` at two seeds with every check true writes the bar files; anything else writes
`self-queries-partial.json` and `self-queries-misses-partial.jsonl`.

## The generator

mulberry32 over a per row seed (the murmur3 finalizer of seed and index), so row i at seed s is the same row however
many rows are drawn; kind = index mod 8; the template drawn uniformly within the kind. No Math.random, no clock, no
imports at all (the test reads the import lines). Truths by BigInt rationals (`Q`, `qAdd`, ... in the file), Zeller's
congruence for weekdays, the civil day count for days between. 111 templates, printed by the smoke run: arithmetic
35, sequence 12, units 8, calendar 16, counting 10, spelling 10, comparison 8, probability 12. The phrasings come from
the census wording (bench/conceive-prompts.json) and ordinary speech ("what's", "how many", "tell me", "just the
number"). Every row: `{seed, index, id, kind, template, sub, prompt, truth, gradeRule, args}`.

## The grade rules (the answer's last meaningful line)

- `rational`: the last number (after the last colon when that part holds one; "7 3/4" read whole) equals the truth
  exactly as a rational, so 31/4 meets 7.75 and 0.3333 does not meet 1/3; `lowest: true` refuses 2/4 for 1/2.
- `choice`: the one option named; with two options both named, the comparative between them; a restatement ("of
  0.7 and 0.65, the larger is 0.7"); anything else naming two options is wrong.
- `yesno`: the first word; else a yes word without a negation, or a negation without a yes word; else the affirm
  phrase ("leap year", "bigger", "less").
- `oneOf`: the whole line or its last word is an accepted spelling; for weekdays every weekday named must be the one.
- Refused: an empty text or one of the four miss heads (`REFUSAL_HEADS`, equal to bench/conceive.mjs `MISS_HEADS`,
  asserted by the test and by the bench). Wrong is counted apart from refused everywhere: a wrong exact answer is
  worse than a refusal.

## The controls (so a rule that cannot tell right from wrong never grades the organism)

On every row before any ask: the truth stated three ways must grade correct, a perturbed answer (value plus one, the
other option, the other polarity, the next weekday, a changed spelling) must grade wrong, the empty text and each miss
head must grade refused; an independent second computation (floats, JS Date in UTC, brute force over coins, dice and
cards, Array reverse, regex counts; written in the bench, sharing no code with the generator) must agree with every
truth; the ask path is hashed at the start and the end; the self test runs first and its tally is recorded.

## The split

Development: the census wording and dev seeds 7, 8, 9 (smoke runs, the 50 hand-verified truths at seed 7, the test).
Held out: seeds 34 and 35, never generated or read while self/queries.mjs was written; the generator was not edited
after the first bar run (the instrument sha printed the same at both runs). The verdict records each seed's rows
sha256, the generator sha and its write stamp; `contaminated` is false.

## Measured (printed by the bar run of 2026-09-28T13:28:41.580Z)

```
self test: node --test --test-reporter=tap test/self-queries.test.mjs: # tests 17 # pass 17 # fail 0
seed 34 total        asked 5000 answered 577 correct 464 wrong 113 refused 4423 answered share 0.1154 wall 4195 ms
seed 35 total        asked 5000 answered 609 correct 501 wrong 108 refused 4391 answered share 0.1218 wall 3137 ms
paired seeds 34 and 35: 1 of 111 templates moved; answered at one seed and refused at the other: 1; max |d correct share| 0
controls: 90000 checks on 10000 rows, 0 failed; second opinion agree 10000 disagree 0 none 0; sockets 0; instrument ea1dfc4d6e2ab3aa -> ea1dfc4d6e2ab3aa
controls by name: oracle0 10000/10000, oracle1 10000/10000, oracle2 10000/10000, perturbed 10000/10000, empty 10000/10000, head 40000/40000
seeds 34+35 arithmetic   asked 1250 answered 1001 correct 965 wrong 36 refused 249
seeds 34+35 sequence     asked 1250 answered 0 correct 0 wrong 0 refused 1250
seeds 34+35 units        asked 1250 answered 0 correct 0 wrong 0 refused 1250
seeds 34+35 calendar     asked 1250 answered 71 correct 0 wrong 71 refused 1179
seeds 34+35 counting     asked 1250 answered 0 correct 0 wrong 0 refused 1250
seeds 34+35 spelling     asked 1250 answered 1 correct 0 wrong 1 refused 1249
seeds 34+35 comparison   asked 1250 answered 0 correct 0 wrong 0 refused 1250
seeds 34+35 probability  asked 1250 answered 113 correct 0 wrong 113 refused 1137
total asked 10000 answered 1186 (11.86%) correct 965 wrong 221 refused 8814 answered share 0.1186; median 327400 ns p95 3113000 ns; qps 1372.0504 (in ask), 1226.2416 (wall)
verdict bench/verdicts/self-queries.json isTheBar true barMet false; misses bench/verdicts/self-queries-misses.jsonl (84 groups, 9035 rows)
BUDGET done exit 0: wall 8.35 s, peak ram 737.7MB, peak dir 62.3MB, cpu 8.05 s, 5 samples
```

isTheBar true, barMet false: wrong is not 0 on every kind (arithmetic 36, calendar 71, spelling 1, probability 113)
and the answered share 0.1186 is under 0.5. Only arithmetic has a correct row (965); sequence, units, counting and
comparison were refused on all 1250 rows each, spelling on 1249 of 1250.

The 221 wrong rows, grouped by template and route (verdict `wrongRows`, every given text whole up to 1500 characters):

- 113 `probability.cards.multiple-of`, route program: an induced program `mul(div(q2,q0),q1)` answers a probability
  with an integer ("Cards numbered 1 to 77 ... a multiple of 12?" gave 924, truth 6/77).
- 71 `calendar.weekday.iso`, route program: `sub(q0,add(q1,q2))` answers "What weekday is 2069-02-09?" with 2058
  (truth Saturday). Both prompts carry three numbers, the q0, q1, q2 the programs read.
- 36 `arithmetic.mul.whats-product`, route direct, from exact: exact.arith reads "What's the product of 736 and 45?"
  as 736 + 45 and prints 781 (truth 33120), on the exact route that claims no rounding at any step.
- 1 `spelling.nth.first-letter`, route knowledge: "What is the first letter of the word 'letter'?" answered from a
  knowledge page ("Snake case"); this is the one template answered at one seed and refused at the other.

The paired seeds: no template's correct share moved between seeds 34 and 35 (max |d correct share| 0), so at these
two seeds the misses follow the phrasing, not the numbers.

Fix pass (board 34, after the verify plane): (1) the statement quoted two-seed per-kind numbers and "11.86%" that no
line printed; the bench now prints one `seeds 34+35 <kind>` line per kind, the percentage on the `total` line, a
`controls by name` line (the "all 10000 rows in three styles" count) and the statement itself, so every number in it
sits on a printed line above. (2) test/self-queries.test.mjs had a loop over import specifiers that ran on an empty
list; the scanner and the act/ or reason/ filter are now functions, a new test plants 9 import forms (static, star,
dynamic, side effect, require, multi-line; 6 under act/ or reason/, 3 not) and a commented one, and the real-source
test asserts the source was read. A planted `import { ask } from '../act/prompt.mjs';` appended to self/queries.mjs
turned that test red (`fail 1`, `imports found: ../act/prompt.mjs`); the file was restored to the same sha256 prefix
c4523a90dc0168c5. The instrument sha moved from 892a189bee26c3c0 to ea1dfc4d6e2ab3aa between the two bar runs because
other items edited act/ files; it printed the same at the start and end of this run. The misses file is 2759645 bytes
(9035 rows), under 100 MB.

Reads while building: bench/conceive.mjs (MISS_HEADS, isMiss, instrumentOf, WARM, the brain it builds),
bench/conceive-prompts.json (the census wording), notes/conceive.md, act/prompt.mjs `ask()` and its miss heads, a
probe of the census prompts through ask() (arithmetic answered, every other kind refused), GSM-Symbolic (Mirzadeh et
al., arXiv 2410.05229: templates with varied numbers expose a drop the fixed set hides, the reason for two seeds),
Zeller's congruence (the +5J form keeps the sum positive), the Doomsday rule (the hand check of the weekday truths).

## Open (for the owners of act/, never edited here)

1. act/ exact.arith: "the product of A and B" is read as A + B (36 wrong rows at the bar, route direct, from exact).
2. The induced program tier answers probability and ISO date prompts with integer arithmetic over their numbers
   (184 wrong rows); a program with development precision 0.1046 should not answer a prompt whose truth is not a number
   of that shape.
3. sequence, units, counting and comparison have no native route (every row refused); spelling answered 1 of 1250,
   wrong.
