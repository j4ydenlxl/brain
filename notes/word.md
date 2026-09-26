# The word problem reader: act/word.mjs (method exact.word)

Author: board 18 builder (queue item 1, "Less than a token, in microseconds: word problems on the sub-token path"; his orders 2026-09-26 10:05 EDT "Every request should be less than a token and it should be done in microseconds" and 10:48 EDT "400 B parameters in microseconds is not optional").

## What it is

`readWord(text)` reads a whole word problem into one exact expression and evaluates it with BigInt rationals through `tasks/exact.mjs`, or returns null. `wordRefusal(text)` returns the first word and the clause the reader stopped at. `act/solve.mjs solve()` tries it after the spoken reading, so `node bin/brain.mjs ask ... --provider null` answers a word problem it reads with route direct, provenance exact, method exact.word and no model. `act/exact-read.mjs readExact()` passes the reader's answer through only with its own method name, so the prompt box and the CLI print the same route. The module imports `tasks/exact.mjs` and `act/exact-read.mjs` and nothing else (test/word.test.mjs checks the source).

How it reads: the text is cut into sentences and clauses; numbers (digits, money, percent, number words, "a dozen", fractions, "three and a half") become tokens; a capitalised word the grammar does not know becomes a NAME; he, she, his, her, they bind to the subject they point back to; every other open word is marked as a noun. Each clause must be matched WHOLE by one rule, and each rule adds linear equations over named quantities (owner, item, verb, time). The question sentence picks the quantity. The equations are solved by exact substitution, and the expression the answer came from is parsed back through the exact reader and must give the same value.

## The refusal rule (the whole point)

A record is null when: a clause no rule reads whole; a question no question rule reads; a quantity the equations leave undetermined; a contradiction; a number of the text the answer does not depend on (the unused number rule: a quantity bound but not understood); a count answer that is not a whole number; a negative answer; an expression that does not parse back to the same value. A partial reading is never an answer.

## The grammar, rule by rule, with the development sentence that motivated it

Development records only (tools/word-dev.mjs, 203 records). Where a rule came from a sentence planted in test/word.test.mjs and not from a record, it says so.

Body clauses:
- `event`: an owner, a verb from the verb table, a list of quantities, a time. gsm8k.83 "Dan plants 3 rose bushes."; gsm8k.1076 (a list of three). A recipient ("gave 12 stickers to his sister") files a receive for the other owner: planted.
- `event.to`: "sold clips to 48 of her friends in April" is 48 clips (his Natalia sentence).
- `event.rel`: "half as many clips in May" (Natalia), "twice as many clay dishes as Rory" (gsm8k.836), "11 more than half as many as Pierson" (shape of gsm8k.800).
- `event.cmp`, `event.cmp2`: "ten more crabs than Monic" (gsm8k.178), "8 paintings more than Kim" (gsm8k.1228).
- `event.num`: "three times that number of cakes", "5 times the number of cakes she did on Tuesday" (gsm8k.208).
- `event.poss`: "twice the number of Sarah's books" (gsm8k.907).
- `event.what`: "only 2/3 of what Harry slept" (gsm8k.96).
- `event.foreach`: "2 pairs of shoes for each of his 3 children" (gsm8k.117).
- `event.ofthem`: "he lost 2 of them" (gsm8k.907).
- `event.share`: "gives 25% of her marbles to Tim": planted.
- `share.equally` with `q.each`: "shared the remaining equally with his four friends" (gsm8k.435).
- `there`, `there.each`, `there.cmp`, `there.total`: "There are 30 more gold coins than silver coins" as the two kinds of Gretchen's 110 coins (gsm8k.33); "30 sheets of paper on a pad of paper" (gsm8k.120); "There is a total of 341 cards" (gsm8k.825).
- `each`, `each.after`, `each.they`: "Each rose bush has 25 roses" (gsm8k.83); "They cost $60 each" (gsm8k.117).
- `rate.freq`, `rate.freq.list`: "He can collect 2 peaches a minute" (gsm8k.190); "5 pails of water every morning and 6 pails of water every afternoon" (gsm8k.200); "2 pads of paper a week" (gsm8k.120).
- `duration`: "John collects peaches for 3 hours" (gsm8k.190).
- `buy.for`: "6 milkshakes for $5.50 each, nine burger platters for $11 each, and 20 sodas for $1.50 each" (gsm8k.1076); "2 kilos of bananas for $2 per kilo" (gsm8k.685).
- `spend.on`: "$15000 on advertising", "a third of that amount on advertising for another year" (gsm8k.223).
- `need.to` with `q.need`: "30 ounces of sugar to make a batch of suckers" (gsm8k.335).
- `makes` with `q.outof`: "If 6 potatoes makes 36 hash browns" (gsm8k.679).
- `named`: "4 kids named Amy, Jackson, Corey, and James", the count checked against the names (gsm8k.92).
- `age.is`, `age.diff`, `age.mult`: gsm8k.312, gsm8k.399, gsm8k.957, gsm8k.1104, gsm8k.92.
- `kind.are`, `kind.rest` with `q.kind`: "5 apples are red. The rest are green.": planted.
- `intro`: a clause with no quantity and no word that could carry one ("Catherine goes to the grocery store", gsm8k.685; "Baldur gets water from a well", gsm8k.200); a verb outside the context verbs only before a bare noun, never a loss verb.

Clause mechanics: the subject (and the verb before a number) carries over a cut at "and" or "but" ("Amy is 5 years older than Jackson and 2 years younger than Corey", gsm8k.92; "and then spends a third of that amount", gsm8k.223); a leading time goes with its clause ("Tuesday she went to a different store", gsm8k.208); a leading circumstance with no quantity is dropped ("After transferring to a new school,", gsm8k.127); ", who" opens a clause about the name before it (gsm8k.178); a list of names is one subject (gsm8k.825); a quantity pointed at before it is stated is the same quantity when it is stated ("If Kora made 20 dishes", gsm8k.836).

Questions: `q.event` (Natalia; "after all three days", gsm8k.208), `q.there` (gsm8k.83), `q.have` with left, now, currently (gsm8k.907), `q.left`, `q.money` (gsm8k.117), `q.money.total` (gsm8k.223), `q.cost.all`, `q.more` (gsm8k.96), `q.total` and `q.they` ("the three have together", gsm8k.178; gsm8k.836), `q.coins` (gsm8k.256), `q.age`, `q.agediff` (gsm8k.399).

## The development rounds

`node tools/word-dev.mjs --round` runs readWord over all 203 development records and prints answered, correct, wrong, refused and the stop words grouped by frequency. The printed rounds, in order (every one printed wrong 0):

| round | answered | correct | wrong | share | what the round added |
|---|---|---|---|---|---|
| 1 | 1 | 1 | 0 | 0.0049 | events, "half as many", the Natalia question |
| 2 | 5 | 5 | 0 | 0.0246 | ages, rates, rate chains |
| 3 | 6 | 6 | 0 | 0.0296 | groups of names, prices, money questions |
| 4 | 14 | 14 | 0 | 0.0690 | subject carry over, leading times, totals, "named", placeholders |
| 5 | 16 | 16 | 0 | 0.0788 | restated quantities, parts of a whole, "of what" |
| 6 | 17 | 17 | 0 | 0.0837 | subject and verb carry over before a number |
| 7 | 21 | 21 | 0 | 0.1034 | "after all three days", the total money question |
| 8 | 20 | 20 | 0 | 0.0985 | a list pattern change lost one record (fixed next round) |
| 9 | 23 | 23 | 0 | 0.1133 | measures ("ounces of sugar" is sugar), coins |
| 10 to 12 | 24 | 24 | 0 | 0.1182 | recipients, hours as a duration, shares, kinds: three rounds with the share unmoved, the building stopped here by the rule |
| last | 26 | 26 | 0 | 0.1281 | two defects the planted tests caught: a second money fact of one event was unified with the first (lists of prices refused), and a clause with a change verb ("threw away the rotten ones") could be read as carrying nothing; both fixed, the wrong-answer trap is in test/word.test.mjs |

The last round, printed: `round: 203 development records; answered 26, correct 26, wrong 0, refused 177; share 0.1281, accuracy 1.0000`.

## The bar and the controls

`node --max-old-space-size=4000 bench/ns.mjs` (through tools/budget.mjs --ram-mb 4000). The builder's run at 2026-09-26T18:04:39.966Z printed 1/200 on a pool of 601; the verify re-run at 18:20:18.498Z printed 0/200 on a pool of 596, because the model-off public run (18:16:53Z) wrote a journal naming 33 GSM8K ids, the ns bench counted every journal id as development, and so the records the word reader answers left held out (108 of the 200 drawn ids changed). THE FIX (bench/ns.mjs `modelOffJournal`, tested in test/word.test.mjs): a journal whose header command carries `--provider null` is a grading run of the sub-token path over the whole set, its rows are the answers themselves and no rule or template was read from it, so its ids stay in the held-out pool; the bench prints the journal it leaves out, and ns.json names it under split.development.notDevelopment and in the statement. The re-measured run, at 2026-09-26T18:40:02.044Z, replaced bench/verdicts/ns.json (isTheBar true, barMet false; wall 728.05 s, peak ram 808.6MB). Its printed lines:

- `held out: 200 records; answered sub-token 1/200 (0.5%), 1 right (100.0%); per class solved 0 (0.0%, 0 right); exact.word 1 (0.5%, 1 right, accuracy 100.0%)`
- held out: `journal bench/verdicts/public/gsm8k-native-public_1.jsonl: 33 GSM8K ids named, NOT development: a model-off grading run ...`; `held out: 200 drawn by sampleIds at seed public/1 from the 601 GSM8K test records no development journal names and not development (of 1319); drawn that are development 0, drawn a template was filled from 0`
- `pass 1: the word step (readWord, every record) median 49361 ns, p99 171259 ns ...; on the records exact.word answered median 66302 ns, p99 303575 ns`; pass 2 median 48063 ns on every record, 70694 ns on the answered one. The solved step beside it (the memoisation control): compiled median 1303 ns. The empty bracket: median 51 ns.
- `control, the word reader UNPLUGGED (act/solve.mjs wordReader(false)): held-out sub-token share pass 1 0.0% (0/200: solved 0, exact.word 0), pass 2 0.0% (0/200); run-to-run noise 0.0%`
- `control, the word reader PLUGGED: pass 1 0.5% (1/200: solved 0, exact.word 1, 1 right), pass 2 0.5% (1/200, 1 right); run-to-run noise 0.0%`
- `control: the gain of the word reader on held out is 0.5% against a run-to-run noise of 0.0%: MOVED`
- development (the memoisation control, per class): `718 records; answered sub-token 190/718 (26.5%), 190 right (100.0%); per class solved 188 (26.2%, 188 right, accuracy 100.0%); exact.word 2 (0.3%, 2 right, accuracy 100.0%)` (the solved region answers first, so the word reader answers development records solved does not carry).
- `wiki direct class: not measured: store absent on this host`
- `BAR: ... held out printed: sub-token share 0.5% (1/200; solved 0, exact.word 1), accuracy 100.0%, against the bar 100.0%: MISSED; ... word control behaves; wiki direct class not measured: store absent on this host; gap opened; BAR NOT MET`

The bar rule is heldOut.share against 1, never widened: 0 before this item, 0.005 now (1/200, reproduced by the re-measured run), the distance 0.995. The honest reading: the grammar reads 26 of 203 development records (12.8%) and 1 of 200 held-out records; the rules are still close to the shapes they were written from.

The second grader, the public bench model-off (bench/public.mjs gained `--provider null`, which needs its own `--tag`; the lines that changed: the FLAGS entry, one USAGE line, five lines in makeCfg (the provider, the organism arm only, the guard that asks for a tag so the model chain's journal is never moved aside), the needsModel line, the absent-arm line, and the provider in askArm): `node bench/public.mjs --set gsm8k --provider null --tag native --limit 0` wrote bench/verdicts/public-gsm8k-native-partial.json (isTheBar false). Printed: `NATIVE organism: native (exact, memory, direct: no model call) 33 of 33 = 100.00%, mean 3851.32 us per ask; direct 0 of 33 (no record was answered from the direct table); through the model 0 of 33`; the other 1286 records were absent (no model). Counted from the verdict rows: 33 native of 1319 records, 33 correct, provenance exact 33; by the public bench's split 26 development and 7 held out (its held out is every record outside the 203, so the 7 include records the ns bench counts as development through the journals; none of them was read to write the rules).

FIX of the native statement (bench/public.mjs, board 18 builder): with `--provider null` the statement named the model cell qwen3:1.7b and ranked the 33 native rows (a selection) above the published rows. Now a model-off run names no model (`model` null, `provider` "null"), states the native share over every record asked, sets no published row beside it (`publishedComparison` null, with the reason in the statement), drops the shared Ollama queue sentence, says in notTheBarBecause that the accuracy row needs the model chain, and prints one more line. Lines changed: barStatus (a modelOff argument and its reason), nativeShareModelOff (new), the organismHow, statement, model, provider, sharedQueue and publishedComparison lines of the verdict, the run header print, and one NATIVE SHARE print. Re-run `node bench/public.mjs --set gsm8k --provider null --tag native --limit 0 --resume` (at 2026-09-26T18:38:22.983Z) printed: `NATIVE SHARE model off: 33 of 1319 records = 2.50%, 33 correct among the native answers, 1286 absent (no native answer, no model)`.

HE TESTS, printed: `answered exactly by exact.word, with no model and no network.` / `- expression 48 + 48 / 2` / `72` / `answered from memory  memory hits 0  web pages 0  llm null/- 0.00ms  exact 44043834 ns` / `route direct  provenance exact`. The 44 ms is one cold process (module load and the first regular expression compiles); the warm word step is the bench's 50 to 75 microseconds.

## The stop table after the last round (the next rungs)

Refusals of the last round by kind: 172 a body clause no rule reads whole, 5 a token the lexer does not read (a slash unit "4 feet/hour", a ratio "7:11", a clock time "2:15"). The first word the reader stopped at, most frequent first: people 4, hours 3, egg 3, piece 2, miles 2, new 2, house 2, friends 2, hour 2, month 2, days 2, shoes 2, child 2, wife 2, teachers 2, children 2, car 2, then 1 each (ducks, robe, repairs, merchant, born, best-selling, stops, rate, ...).

The next rungs, in order: (1) the held-out share is the gap: 26 of 203 development records against 1 of 200 held out says the rules are shapes, not a grammar; the next rung is a verb-argument frame (who does what to how many of what, when, for whom) that every event clause goes through, instead of one pattern per shape; (2) the clauses the stop words point at: people as a count ("5 people got on"), speeds and distances (miles, hours: distance = speed x time), "a 3 egg omelet" (a number inside a noun phrase), percent change ("a 20% increase", "a 25% discount"), "the rest"/"the remainder" of a whole the text names; (3) speed: the word step is a median 50 microseconds on a record it refuses and 73 to 75 on one it answers, against 1.3 microseconds for the solved step; the next rung compiles the rules to one pass over the tokens.

## The split

The rules were written reading ONLY the 203 development records bench/public.mjs `gsm8kDevIds` names (bench/verdicts/math.json records.ids plus gsm8k.0, gsm8k.1, gsm8k.2, imported, never retyped), which tools/word-dev.mjs extracted to state/self/word-dev.jsonl, and sentences planted in test/word.test.mjs. NO HELD-OUT RECORD WAS READ WHILE THE RULES WERE WRITTEN: tools/word-dev.mjs parses only the lines whose index is a development id and skips every other line unparsed; bench/ns.mjs and bench/public.mjs read the fixture only to grade and print aggregates. bench/ns.mjs draws its 200 held-out records from the GSM8K test records no development journal under bench/verdicts names and that are not development (a model-off grading journal, header command with `--provider null`, is not development: it holds the sub-token answers themselves); none of the 203 is among them (split.wordDevelopment.drawnInIt in ns.json).

## Every command run over the fixture (bench/fixtures/public/gsm8k/test.jsonl)

1. `node tools/word-dev.mjs`: extracted the 203 development records to state/self/word-dev.jsonl; printed `word-dev: 203 development records of 203 wanted (bench/verdicts/math.json records.ids (200) plus gsm8k.0, gsm8k.1, gsm8k.2 (...)) written to state/self/word-dev.jsonl`. The first `node tools/word-dev.mjs --round` also ran this extraction once (before the --round guard existed): the same 203 records. Every later `--round`, `--id` and `--shape` run read state/self/word-dev.jsonl only.
2. `node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts --no-record -- node --max-old-space-size=4000 bench/ns.mjs --limit 5 --repeats 10 --ask-repeats 10 --miss-ask-repeats 5` (a smoke of the extended bench; wrote bench/verdicts/ns-partial.json, isTheBar false). The bench reads the fixture to grade and prints only aggregates.
3. `node tools/budget.mjs --ram-mb 4000 --disk-mb 300 --dir bench/verdicts --no-record -- node --max-old-space-size=4000 bench/ns.mjs` (the bar; wrote bench/verdicts/ns.json).
4. `node tools/budget.mjs --ram-mb 4000 --disk-mb 300 --dir bench/verdicts --no-record -- node --max-old-space-size=4000 bench/public.mjs --set gsm8k --provider null --tag native --limit 0 --quiet`, then the same with `--resume` and without `--quiet` to print the NATIVE line (journal bench/verdicts/public/gsm8k-native-public_1.jsonl).

5. The fix stage: a scratch script (the pool check, loading the fixture through bench/public.mjs loadGsm8k) printed the development count and pool size with and without the native journal (`dev 723 pool 596`, `dev 718 pool 601`) and the first three drawn ids of each draw (ids only, no question and no gold); `node bench/public.mjs --set gsm8k --provider null --tag native --limit 0 --resume` three times (with --quiet once); the bar command above once. No rule of act/word.mjs was changed in the fix stage.

No command opened the fixture with cat, head, grep or an editor; no held-out record was printed; the ns bench's held-out draw (split.heldOut.ids and rows.heldOut in ns.json) was not read, apart from the three leading ids per draw the fix-stage pool check printed (ids only).
