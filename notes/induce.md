# induce: program induction over a small DSL for GSM8K (board 23, item induce, route A)

Model OFF throughout: no provider, no socket, no model call. The organism parses a word problem into
quantities, searches the programs of a small DSL that reproduce a development answer, keeps the programs
that recur across development records under one cue pattern, and answers a held-out problem by running a
kept program. Every answer carries its program as provenance.

- Code: `reason/induce.mjs` (DSL, parse, search, chain check, abstraction, `answerFromPrograms`, the record reader with its spy)
- Bar: `node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/induce.mjs`
- Verdict: `bench/verdicts/induce.json` (a run under the whole development set writes `induce-partial.json`)
- Store: `bench/verdicts/induce-programs.json` (the kept programs, per level and pattern, with their development records as provenance)
- Tests: `node --test test/induce.test.mjs`
- The ns arm: `bench/ns.mjs` asks its held-out records through the store (`program` block, `heldOut.programShare` beside `heldOut.share`); `node bench/ns.mjs --program-arm` runs the arm alone and writes nothing

## The DSL (19 primitives, depth 4 = up to four operations, each leaf used at most once)

| primitive | arity | meaning |
|---|---|---|
| q | 0 | the i-th number written in the text (digits, number words, money, percent as a fraction) |
| f | 0 | the i-th fraction word: half, a third, two-thirds, a quarter, 3/4 |
| m | 0 | the i-th multiplier word: twice, double, triple, thrice, quadruple |
| dozen | 0 | 12, when the text says dozen |
| week | 0 | 7 days in a week, when the text names weeks and days |
| hour | 0 | 60 minutes in an hour, when the text names hours and minutes |
| minute | 0 | 60 seconds in a minute, when the text names minutes and seconds |
| day | 0 | 24 hours in a day, when the text names days and hours |
| yearm | 0 | 12 months in a year, when the text names years and months |
| yearw | 0 | 52 weeks in a year, when the text names years and weeks |
| monthw | 0 | 4 weeks in a month, when the text names months and weeks |
| pct100 | 0 | 100, when the text says percent |
| two | 0 | 2, when the text says both, pair, twins, round trip or couple |
| add | 2 | a + b |
| sub | 2 | a - b |
| mul | 2 | a * b |
| div | 2 | a / b |
| grow | 2 | a * (1 + b): b percent more |
| shrink | 2 | a * (1 - b): a discount, what is left after spending a fraction |

## How it works

1. **Parse.** A tokenizer reads digits, money, percent (as p/100), digit fractions, clock times (am/pm to
   24 h), number words, fraction words and multiplier words; unit constants appear only when their cue
   words co-occur. The question sentence is the last one with a question mark; its cue classes (left,
   more, total, each, money, time, pct) and each quantity's neighbouring words make four pattern levels,
   fine to coarse: role > cue > named > count.
2. **Search.** Bottom-up by leaf set with observational equivalence (one class per leaf set and value, a
   few derivations kept per class, values pruned to positive small-denominator fractions); the fourth
   operation by top-down inversion of each operation, looked up in the bank. A class whose value is the
   answer keeps every derivation up to 64.
3. **Chain check.** A found program follows the record's worked chain when every intermediate value it
   computes is a number the GSM8K worked answer writes, or a sub-step of one of its `<<...>>` steps
   (`<<16-3-4=9>>` also computes 13 and 7).
4. **Abstraction.** A program is kept under a pattern when it follows the worked chain on at least 2
   development records of that pattern. Kept programs are ranked by (k + 1) / (n + 2): k the pattern's
   records it reproduces by the worked chain, n those on which its value is a positive whole number.
5. **Answer.** Walk the levels fine to coarse; the first kept program whose value passes the invariant (a
   positive whole number) answers. The development leave-one-out removes a record's own support, chain
   count and try, then re-ranks.

## What was read before building

- docs/RESEARCH-PARADIGM.md (route A: induce programs, model off) and the tree's own prior attempt:
  reason/solved.mjs templates and act/word.mjs, whose row on these 200 held-out records is 1 right
  (bench/verdicts/ns.json heldOut, share 0.005).
- Bottom-up enumerative synthesis with observational equivalence (Udupa et al. 2013, TRANSIT;
  Albarghouthi et al. 2013, Escher): one representative per value, which is what makes depth 4 cheap.
- Duet (Lee, POPL 2021): combine bottom-up enumeration with top-down propagation; here the last
  operation is inverted against the answer instead of enumerated.
- Probe (Barke, Peleg, Polikarpova, OOPSLA 2020): guide the enumeration with what earlier solutions used.
- DreamCoder (Ellis et al., PLDI 2021): wake (search per task), abstraction (keep what recurs); here the
  library is the kept programs per cue pattern, with no neural recognition model.
- GSM8K (Cobbe et al. 2021): the worked answers annotate each step as `<<a op b=c>>`, which is the chain check.

## Records looked at

- Development only, while the parse and the DSL were written: gsm8k.0 to gsm8k.39 and gsm8k.300 to
  gsm8k.329 read in full; every development record (718, from bench/verdicts/ns.json rows.development)
  through aggregate probes.
- Held out: none opened while the DSL, the parse or any program was written; the search's spy printed 0
  held-out ids opened. After the bar ran, the held-out rows of the verdict (ids, programs, right or wrong)
  were read; no held-out question text was read.

## Tuning (development leave-one-out only, 700 answered of 718)

| configuration | right of 700 |
|---|---|
| first version, rank by chain count | 32 |
| first version, rank by support precision | 41 |
| first version, rank by support precision, own support NOT removed before re-ranking (RETRACTED, a leak) | 50 |
| naive Bayes over cue words (probe) | 27 |
| nearest neighbour over patterns (probe) | 32 |
| invariant "new" (answer is not a number the question wrote) | 37 |
| keep any program with support 2 (not by chain) | 31 |
| minimum support 3 | 28 |
| answer class keeps every derivation, chain sub-steps, rank by support precision | 32 |
| same, rank by chain count | 37 |
| answer class fix alone, rank by support precision | 36 |
| chain sub-steps alone, rank by support precision | 38 |
| answer class fix alone, rank by chain precision | 40 |
| both fixes, rank by chain precision (SHIPPED) | 40 |

One record's re-ranking moves these by one or two; the shipped row was chosen on principle (the search
must keep the derivation the worked answer uses, a multi-operand step has sub-steps, and a library kept
by chain is ranked by chain), not as the top of the table, which the first version's 41 is by one record.

Defects found while building, each fixed and covered: the answer class filled with the first splits
enumerated and dropped the worked derivation of gsm8k.0 (test "search to depth 4 finds gsm8k.0");
`<<16-3-4=9>>` hid 13 from the chain check; the leave-one-out needed the caller to pass the record's own
chain programs (now each kept entry carries its chain records); the ns arm's timing sorted a plain array
as text (now a Float64Array).

## Measured (the bar, printed)

- search: 718 development records searched in 9.1 s (median 374100 ns a record); reproduced 650 (90.5%),
  with a program that follows the record's worked chain 508 (70.8%); the reader opened 718 records,
  held-out ids among them 0
- abstract: 219 distinct programs kept under 42 patterns
- development leave-one-out: 700 of 718 answered, 40 right (precision 5.7%); by level named 19/312, cue
  10/66, count 6/314, role 5/8
- held out: 200 records asked through the kept programs only: answered 196 (98.0%), right 9 (4.5% of held
  out; precision 4.6%); right with a program that follows the record's worked chain 7; by level named
  5/83, count 2/99, cue 2/14
- control, placebo (every level's pattern-to-programs map shuffled, seed induce/placebo/1): answered 173,
  right 3 (1.5%)
- control, the template row (bench/verdicts/ns.json heldOut): sub-token answered 1 of 200 (share 0.005), right 1
- timing: answerFromPrograms, 1000 repeats a record, pass 1 median 15000 ns (p99 42600), pass 2 median
  15200 ns; the program run alone 38.6 ns a run in one bracket of 1000; an empty clock bracket median 0 ns
- BAR MET: held-out right 9 of 200 with provenance program, against the bar of 1
- peak rss 719.5 MB; wall 16.2 s (budget: peak ram 716.0MB, peak dir 46.6MB)
- the ns arm (`node bench/ns.mjs --program-arm`, the same 200 ids asked as ALONE_PROMPT(question)):
  answered 196 (98.0%), right 9 (4.5% of held out, precision 4.6%); held-out ids a kept program cites 0

## Fix pass (verify plane: the statement quoted two numbers no line printed)

- Found: the verdict statement said "a 19-primitive DSL" and "up to four operations"; no printed line
  carried the primitive count or the operation limit (the only printed 19 was the LOO "named 19/312").
- Fixed at the source: bench/induce.mjs now prints `dsl: 19 primitives (q, f, m, dozen, week, hour,
  minute, day, yearm, yearw, monthw, pct100, two, add, sub, mul, div, grow, shrink), programs of at most
  4 operations, each leaf used at most once`, and the statement reads both from I.PRIMITIVES.length and
  I.MAX_OPS; the hard-coded "the same 200" now reads heldRecs.length.
- Test added (test/induce.test.mjs): every number the statement of bench/verdicts/induce.json quotes
  (digits and the number words two to twelve) must appear on a printed line; a planted control shows the
  checker names 19 and 4 when they are not printed. On the old verdict it failed with `[ '4' ]` (the
  word "four"), before the re-run; after it, 15 of 15 pass.
- Re-run: search 718 records in 7.4 s (median 335000 ns a record); held out answered 196, right 9 of 200
  (4.5%); placebo right 3; timing pass 1 median 14600 ns, the program run alone 37.6 ns a run in one
  bracket of 1000; peak rss 511.7 MB; BAR MET (budget: wall 14.37 s, peak ram 500.2MB, peak dir 46.7MB).
- Read for the fix: bench/induce.mjs lines 95 to 260 (the say lines and the statement), reason/induce.mjs
  PRIMITIVES and MAX_OPS, the verify plane's finding.

## What it does not do yet

Precision is 4.6%: the organism answers almost everything and is mostly wrong. The coarse count level
answered 99 held-out records and got 2 right, so a floor on a level's development precision
(`answerFromPrograms(..., { minPrecision })`, read from the store's devLoo) is the obvious next cut, and
the residual (the development records no program reproduces, and those reproduced only by
coincidence, not by the worked chain) is where the parse and the DSL grow next.
