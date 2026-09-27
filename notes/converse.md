# converse-cover: the native conversation region carries what people type

His order, 2026-09-26 20:20 EDT: "it cant even respond to 'hi.' what a shame"; 2026-09-27 09:28 EDT: "Yeah but i said hey to it and it said it couldnt respond". Board 25, item converse-cover, docs/VISION.md order 1.

## What was read before building

- act/converse.mjs (the region as committed at HEAD: 8 atoms matched by regex groups, 8 words, 64 chars, a process.hrtime clock)
- test/converse.test.mjs (6 tests)
- act/prompt.mjs lines 750 to 795 and the ask() head near line 1355 (answerFromNative; converse runs before every route)
- web/ask.mjs line 58 (the regex that refuses node:, require(, process., fetch( before copying a module into the visitor tab)
- docs/VISION.md section 1 (the clause the purpose answer quotes)
- bench/spoken.mjs (the seeded generator reused for the arithmetic negative set)
- bench/fixtures/public/gsm8k/test.jsonl and bench/fixtures/answer-questions.json (negative sets; local fixtures)
- test/ask-fallthrough.test.mjs (must keep passing)
- the published way: AIML normalisation, substitution and SRAI reduction, and its divide-and-conquer rule for compound sentences (web search; one Medium page returned 403 and one arXiv PDF came back binary, neither used)

## What changed

- act/converse.mjs: the clock is performance.now (ns = round(ms x 1e6), floor 1); the file has no process., no node:, no require(, no fetch(, no import. normalise() repairs typos and shorthand (letter runs squeezed against a lexicon, a word map: r, u, ur, ya, thx, wassup, hru, gm, gn, cya, ttyl and more), drops leading fillers (um, so, ok so, well so) and collapses a word said twice. MAX_WORDS 10, MAX_CHARS 80. A digit or an operator is never a turn. An unknown word returns null unless a slot takes it (my name is X). Compounds: up to three carried atoms joined by space, comma, and, but, found by a segmentation pass over the canonical form; the kind is joined by "+", the answers print in order, a sentence two parts share prints once, and the offer prints once at the end (never after the ability answer, which is the offer). A question may not be followed by an opener, so "what is good morning" is null. New atoms: origin, presence, self, nature, age (September 2026, the month of the first commit), place, purpose (quotes "self growing and self improving"), uncarried (jokes, songs, poems, essays, code: says no region carries that on this host and offers three carried prompts). "are you there" and "are you awake" moved to presence, "are you alive" to nature. CONVERSE_KINDS lists 22 atoms.
- test/converse.test.mjs: 15 tests. Every example() form; 36 typed forms; 24 compounds plus answer composition; 38 typos and shorthands; every new atom; 58 non-turns null (spoken and symbolic arithmetic, GSM8K-shaped word problems, factual questions, one-word nouns, a URL, a mail address, code, over the caps); the source scanned for process., node:, require(, fetch(, import and em-dash; converse() compiled by the Function constructor with process, require and globalThis shadowed still answers "hey"; ask() answers "hi" and "hey, how are you" natively; a greeting with a sum is never a turn; the first-commit month checked against git when the clone has its history.
- bench/converse.mjs (new): development turns and non-turns, six negative sets, the held-out file when named, an "apples" control, timing; writes bench/verdicts/converse.json with --heldout, bench/verdicts/converse-partial.json without.

## Numbers printed

node --test test/converse.test.mjs (one run; the timing moves run to run, a later run printed a median of 3600 ns and a compound median of 4600 ns):

```
CONVERSE first commit 2026-09-24 -> September 2026
CONVERSE non-turns null 58 of 58
CONVERSE median 1500 ns, p95 3000 ns, max 64900 ns over 1000 matches
CONVERSE compound median 2100 ns, p95 2700 ns over 1000 matches of "hey, how are you"
ℹ tests 15
ℹ pass 15
ℹ fail 0
```

node --test test/ask-fallthrough.test.mjs: tests 9, pass 9, fail 0.

node tools/budget.mjs --ram-mb 4000 -- node bench/converse.mjs (partial, no held-out file):

```
development turns: carried with the expected kind 52 of 52
negative spoken-arithmetic: false positives 0 of 100
negative spoken-arithmetic-words: false positives 0 of 100
negative knowledge-questions: false positives 0 of 600
negative gsm8k-questions: false positives 0 of 100
negative answer-questions: false positives 0 of 40
negative development-non-turns: false positives 0 of 33
control ("apples" after the first word of every carried turn): carried 0 of 52 (a grammar that refuses unknown words carries 0)
timing: turn median 1300 ns, p95 5600 ns over 10400; non-turn median 1500 ns, p95 2300 ns over 660
PARTIAL (no --heldout, isTheBar false): development 52 of 52, false positives 0 across 6 negative sets, 42 ms
```

A bare knowledge title was tried as a negative and dropped: "Pardon" is a title and also a turn a person types, so only the question forms (what is, who is, tell me about) are negatives.

## The bar and the rule for a fix pass

The bar is run by the verify plane: `node bench/converse.mjs --heldout bench/converse-heldout-1.jsonl`. It is met when the held-out turns are carried at 90 percent or more, false positives are 0 on every negative set that ran, and every held-out line is readable. The builder never read the held-out file.

A fix pass may generalise the grammar (a new word class, a new substitution, a new join), but it never adds a held-out prompt form by form. After a fix pass the second verify writes bench/converse-heldout-2.jsonl, and split.heldOut.file in bench/verdicts/converse.json names which file decided.
