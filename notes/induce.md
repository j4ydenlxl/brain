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

## Wired (board 26, item wire-induce): the program tier in ask()

- Where: act/prompt.mjs ask(), after the knowledge tier and before the reasoning regions, on either route. An
  answer from it has from 'program', route 'program', native true, provenance.tier 'program', provenance.program
  the program text, and program.ns (performance.now(), in ns); the first line names the program, its level, the
  level's development precision and the floor, and the answer is the last line. The memory-miss end is unchanged.
- Gates (the header comment in act/prompt.mjs numbers them):
  1. the store loads: opts.programs is a path or a store object, false turns the tier off, absent means
     bench/verdicts/induce-programs.json; a missing store skips the tier silently (and is looked for again);
  2. solve() computes nothing on the prompt, and the prompt carries a quantity: QUANTITY_CUE (a digit or a number
     word) before any parse, and the answering pattern's n part after it (n0 is refused);
  3. no math region will be tried: with a model cell the tier defers (bench/verdicts/math.json arm pot5v, 180 of
     200); model off (provider 'null', or regions false) it fires; (board 31 replaced this gate: see the section
     below, the tier now answers only with provider 'null' and only a prompt with mathShape);
  4. THE FLOOR (board 31: now 0.1046 on the re-induced store, the section below): the answering level's
     development leave-one-out precision (the store's devLoo) is at least PROGRAM.floor = 0.1515, the cue level's printed 10/66 (bench/induce.mjs "by level named 19/312, cue 10/66,
     count 6/314, role 5/8"). It admits role (0.625) and cue, refuses named (0.0609) and count (0.0191); chosen on
     development only;
  5. the parse is whole: the program reads every positional quantity (q0 to qn-1) and the leaves fit the search's
     window of 12. Both counts come off the hit's pattern ('n3|qleft|x' is 3 positional, 0 named), so the parse
     answerFromPrograms ran is not repeated; the count level ('n3', no x part) re-parses.

### Measured

- tests: `node --test test/act-prompt.test.mjs test/induce.test.mjs` printed `ℹ tests 39`, `ℹ pass 39`,
  `ℹ fail 0` (seven program tier tests added to act-prompt: planted answer with provenance and ns, fall through
  on no pattern / below the floor / partial parse, missing and unreadable store, never on hey or 2+2 with a
  matched control that fires, deferral to the math region, the shipped store and its floor, the count level)
- mutants (scratch copy of the tree, test/act-prompt.test.mjs): `mutants red 12 of 12` (tier off, no floor, no
  whole-parse gate, no deferral, no solve gate, absent store read with a throw, no quantity gate, no n0 backstop,
  whole gate skips the last quantity, count level trusts the pattern, native false, answer not last line)
- one parse against the two-parse reference on every GSM8K test question, model off: `questions 1319 same 1319
  diff 0 fired 111`; warm, gsm8k.797 `programAnswer warm 1000: median ns 29000, p10 18900, p90 46600` (38600
  median before the second parse was removed, in the same scratch probe)
- gate probe (scratch, development leave-one-out of the 718 records): no gate 700 answered, 40 right; floor 76,
  15; floor and whole parse 64, 15; whole parse alone 345, 35
- the full bench, `node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node
  --max-old-space-size=4000 bench/ns.mjs` (bench/verdicts/ns.json at 2026-09-27T18:42:55.773Z; `BUDGET done exit
  0: wall 1463.27 s, peak ram 1662.5MB, peak dir 53.7MB`):
  - `program arm (reason/induce.mjs kept programs, bench/verdicts/induce-programs.json sha256 71d93fbfa1346d7a):
    200 held-out records, answered 196 (98.0%), right 9 (4.5% of held out, precision 4.6%); held-out ids a kept
    program cites 0; answer median 44500 ns, p99 117100 ns (p90 79100, min 17900, max 203100, mean 49952.6; 196
    timed)` (modelCalls 0; this arm is the whole library with no floor and no gates)
  - held out through ask(): `fell through to the next region: 199/200 (99.5%), provenance there
    {"memory":187,"program":12}`; of the tier's 12, right 1 (gsm8k.1242)
  - development through ask(): `provenance there {"memory":805,"program":77}`, of the 77 right 29 (development
    records the programs were induced from, so in sample)
  - `BAR: ... sub-token share 0.5% (1/200; solved 0, exact.word 1) ... BAR NOT MET`: ns.json's own bar counts
    solved and exact, not program
  - the held-out pool is now 243 records (the journals grew: bench/verdicts/public/gsm8k-public_1.jsonl names 1034
    GSM8K ids), so the 200 differ from induce.json's: 72 shared, 0 in induce.json's development
- the bar ask (scratch, the 200 held-out ids of ns.json through ask() with provider 'null'):
  `ask gsm8k.1242 (held out, provider null): from program, route program, native true, program
  shrink(shrink(q0,f0),f1), level role, answer 20, gold 20, right true, ns 63000`; `from program 12, right 1;
  other provenance {"memory":187,"exact":1}; model calls 0 (provider null)`
- control, the same 200 with programs false: `{"memory:wrong":199,"exact:right":1}`. The tier adds 1 right and
  answers 11 wrong numbers where the memory-miss end was also wrong; the cue level went 0 of 10 on held out and
  role 1 of 2, against a development leave-one-out of 15 of 64 behind both gates.
- read: reason/induce.mjs (parse, patterns, leavesOf, answerFromPrograms and its minPrecision), bench/induce.mjs
  printed lines in bench/verdicts/induce.json, bench/verdicts/induce-programs.json devLoo, bench/ns.mjs (askSet,
  programArm, the quiet options), bench/verdicts/math.json arm pot5v, act/prompt.mjs (the tier order, regionFor,
  answerFromKnowledge), test/prompt-regions.test.mjs (gsm8k.0 model off still answers from memory).
- one smoke ask() early in the build ran without provider 'null' and reached regionCell's probe of the local
  model port; every ask after it, in tests and scratch, passed provider 'null'.

## Verified (board 31, item wire-induce-verify): no right to wrong flip, and the tier no longer answers in front of a model

- Bar: `node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000
  test/wire-induce-verify.mjs` writes bench/verdicts/induce-wire.json (isTheBar true) and adds a wire block, 34
  `wire: ` lines and a statement addition to bench/verdicts/ns.json (its own barMet stays false). The control is
  the same script with `--before`, run on the tier as board 26 wired it: bench/verdicts/induce-wire-before.json
  (isTheBar false). No flag was added to the loop: the tier off is `ask(..., { programs: false })`, which board 26
  already carried.
- Reproduce (the control run, board 26's store sha256 71d93fbfa1346d7a on board 26's draw rebuilt from the journals
  at ns.json's 2026-09-27T18:42:55.773Z, pool 243): `answered 196 (98.0%), right 9 (4.5% of held out, precision
  4.6%)`, `answer median 42200 ns, p99 166000 ns` (board 26 printed 44500 and 117100: timing moves run to run);
  ask() on that draw `right to wrong 0, wrong to right 1`, the tier answered 12, right 1. ns.json at
  2026-09-27T19:10:37.542Z (bench/ns.mjs, the build's bar command) printed `fell through to the next region:
  199/200 (99.5%)`, `the same answer as ask() with solved off 199/199`, `sub-token share 0.5% (1/200 ...) BAR NOT
  MET`; bench/ns.mjs was not re-run: `with every journal row on disk now: pool 0, drawn 0`, so a run today would
  grade no held-out record and overwrite ns.json.
- What the control found (model off flips were already 0, the teeth were elsewhere):
  - `pre-emptions with a model 33`: HumanEval 5 of 161 under every model option (organism arm, the site's env
    provider, no provider named), and with the regions off GSM8K 13 of 199 plus HumanEval 5; the later tiers
    there are the math region (bench/verdicts/math.json pot5v 180/200) and the model's prose (alone 164/200),
    against the tier's best admitted development precision 0.625.
  - `the tier answered a number to 5` of 161 HumanEval code prompts model off (HumanEval_2_truncate_number,
    HumanEval_18_how_many_times, HumanEval_54_same_chars, HumanEval_95_check_dict_case, HumanEval_98_count_upper).
  - ns.json and induce.json held out `shared 78; the same ids: NO`.
- The fix (act/prompt.mjs programAnswer, gate 3): the tier answers only with provider 'null' (any other provider,
  or none named, defers: PROGRAM_TIER.deferred), and only a prompt with mathShape (PROGRAM_TIER.shape; all 1319
  GSM8K test questions and their ALONE_PROMPT forms have it, printed `gsm8k 1319 mathShape question 1319 alone
  prompt 1319`). Tests: the regions-off deferral (env, ollama, none) with the provider 'null' control, and a code
  prompt built from the baker sentence that the kept program matches but the gate refuses, with the word problem
  as the matched control. Mutants: shape gate removed `pass 24, fail 1`; deferral narrowed to regions-on
  `pass 24, fail 1`.
- The pool drift: bench/induce.mjs re-run (`node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts
  -- node --max-old-space-size=4000 bench/induce.mjs`, `BUDGET done exit 0: wall 19.87 s`) reads ns.json's
  rows.development (1090) and split.heldOut.ids. The 200 are bench/public.mjs sampleIds at seed public/1 over the
  229 GSM8K test records no development journal named at ns.json's 2026-09-27T19:10:37.542Z; rebuilt from the
  journals at that instant `equal to ns.json's ids: yes`. It printed `development leave-one-out: 1067 of 1090
  answered, 63 right (precision 5.9%); by level named 29/511, cue 16/153, count 10/379, role 8/24`, `held out:
  ... answered 196 (98.0%), right 11 (5.5% of held out; precision 5.6%)`, `placebo ... right 6 (3.0%)`, store
  405 programs, sha256 9126bf089d312f46.
- The floor, chosen on development only by board 26's rule (the cue level's printed development leave-one-out
  precision): PROGRAM.floor 0.1046 (16/153). It admits role (0.3333) and cue and refuses named (0.0568) and count
  (0.0264). Held out was read after, not to choose it: `by level cue 3/20 = 0.15 clears, role 2/2 = 1 clears`.
- After (bench/verdicts/induce-wire.json), on ns.json's 200 held-out ids:
  - `right to wrong 0, wrong to right 5, both right 1, both wrong 194`, the tier answered 22, right 5 (ns bar
    options; the site options printed the same counts);
  - `pre-emptions with a model 0` (every option set, every population), `HumanEval numbers model off 0`,
    `site: 5 of 5 prompts gave the same route, provenance and first line`, `sockets attempted 0`, `BAR MET`.
- Tests: `node --test test/act-prompt.test.mjs test/induce.test.mjs test/wire-induce-verify.test.mjs` printed
  `ℹ tests 44`, `ℹ pass 44`, `ℹ fail 0` (test/wire-induce-verify.test.mjs re-grades the flips from the verdict's
  rows, rebuilds the draw, and checks every statement number against the printed lines, with a planted number
  as its control).
- Read: bench/ns.mjs (the draw, modelOffJournal, programArm, askSet and the quiet options), bench/induce.mjs,
  bench/public.mjs (askArm, regionsOf, sampleIds, loadHumanEval, ALONE_PROMPT), act/ask-http.mjs (the site's
  provider 'env' or 'null'), reason/induce.mjs answerFromPrograms, bench/verdicts/math.json arms,
  bench/verdicts/public/humaneval-public_1.jsonl (the organism arm answers code with the model), and this file's
  board 26 section (the tree's own prior attempt).
- Open: bench/ns.mjs cannot draw a held-out set any more (pool 0: the GSM8K rung's journal names every test id);
  it needs a pinned id list before it is re-run. ns.json's own program block (its `program arm` lines) was
  printed on the old store; the wire lines carry the new one. A humaneval rung started before this fix loaded the
  old gate.
