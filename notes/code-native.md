# code-native: code without a model (board 34, item code-native)

His order of 2026-09-28: superior coding, done natively, so nothing is vibe coded. Before this item the census
(`bench/verdicts/conceive.json`) refused every code, code-reading, sql, command and format prompt with the model off:
every line of code the organism had ever written was the model's.

`act/code-native.mjs` is the organism writing those answers itself. `codeNative(text)` returns
`{ text, answer, provenance: 'native', route: 'code-native', method, steps, kind, lang, ns }` or `null`.
`ask()` in `act/prompt.mjs` calls it once, after the early exact path and before the knowledge tier, guarded by
`codeNativeShape(text)`, `opts.codeNative !== false` and `opts.prose !== true`; `CODE_NATIVE` counts asked, answered,
refused and the last answer's nanoseconds. Model off: no socket, no model, no network.

## The four readers

1. **The spec reader (code).** The prompt is parsed into a language (JavaScript, or Python when it says so; any other
   language is refused, no language named means JavaScript and the steps say so), a function name, a signature, the
   stated examples, and an operation from `CATALOGUE` (98 operations: 97 entries plus fizzbuzz, which has a rule
   reader of its own). Each entry carries its JavaScript, its Python and its own examples.
   - **The complete read.** After the operation's phrase, its qualifiers (ignoring case, keeping order, of any depth,
     -1 if absent ...) and the examples are removed, every word left must be in `FILLER` (function words and the words
     every code request carries). "positive", "each", "not", "first", "greater than 10" are not filler, so a prompt
     that uses one the operation did not read is refused. A quantity asked of an operation that returns a list ("the
     number of unique elements") is refused. Two different operations that read equally well is a refusal.
   - **Type evidence.** String words, array words and conventional parameter names (`s`, `nums`, `arr` ...) must agree
     with the operation's types, so `def rev(s)` is the string reverse and never the array one.
   - **Run before answer.** When the prompt states examples (`f(x) returns y`, `f(x) === y`, `f(x) -> y` ...), the
     emitted function is RUN against them in `act/run.mjs` before it is answered; a candidate that fails one is never
     answered (the next reading is tried, and none left is a refusal). A Python answer is verified on its JavaScript
     twin: Python never runs on this machine.
2. **Example synthesis.** When the prompt is only a name and two or more examples, compositions of 75 typed unary
   `PRIMITIVES` up to depth 3 are enumerated bottom up, pruned by observational equivalence (two programs with the same
   outputs on the examples and on fixed probe inputs are one program). The smallest program that fits is taken; two
   different behaviours at that depth is a refusal. With exactly two examples one more depth is searched, and a
   different behaviour there that also fits is a refusal (two positive examples cannot tell `x * 2` from `abs(x) * 2`).
   The survivor is run in `act/run.mjs` before it is answered. Wall clock 500 ms.
3. **The SQL, command and format readers.** SELECT columns FROM one table with one WHERE condition, COUNT, ORDER BY,
   LIMIT (a ranked phrase such as "the 3 most expensive" sets both), UPDATE and DELETE (never without a condition);
   the common shell, git, npm and pip verbs; dates (a date that does not exist is refused), thousands separators,
   number words both ways, markdown lists and tables, JSON objects, case conversion. Each is a complete read too.
4. **Code reading.** "What does this JavaScript print / evaluate to / return": the snippet is RUN in `act/run.mjs`'s
   sandbox and the value read back; the value alone is the last line. Python and every other language are refused, as
   is any snippet reading `Math.random`, `Date`, timers or modules, and any snippet that throws.

A refusal is a gap; a wrong answer is a defect. Every reader refuses what it cannot read to the last word.

## Extending it

Add an entry to `CATALOGUE` with `re` (the operation's phrase over the normalised description, where a parameter
name reads as `param`), `in`, `out`, `params`, `js`, `py` and `ex`. `test/code-native.test.mjs` runs every entry's
`ex` through `act/run.mjs`. Then run the bar and read the control line: the control must stay at 0.

## Measured

Read before building (the published way and the tree's own prior attempt, his 2026-09-26 19:46 order):
`act/run.mjs` (runCases, the sandbox and its globals: no parseInt, console or Date inside), `bench/conceive.mjs` (the
census's own rubric, reused for grading), `bench/conceive-prompts.json` (the 35 development rows of the five kinds),
`act/prompt.mjs` (ask(), answerFromNative, PROGRAM_TIER), `reason/synth.mjs`, `notes/synth.md` and `notes/code.md`
(the prior attempt: model sampling plus doc-example assertions), and the observational-equivalence pruning of
bottom-up enumerative synthesis (Udupa et al. 2013, TRANSIT; Alur et al. 2017, EUSolver).

The bar, `node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/code-native.mjs`,
printed at 2026-09-28T13:44:01.506Z (`bench/verdicts/code-native.json`):

- held-out (`bench/code-native-heldout.jsonl`, 51 rows, sha256 pinned, written 2026-09-28T13:09:10.504Z before any
  reader): asked 51, correct 46, wrong 0, refused 5 (90.2%); code 21 of 24 (87.5%), code-reading 6 of 7, sql 5 of 6,
  command 7 of 7, format 7 of 7; median 225600 ns, p95 16413500 ns per answer.
- development (the census rows): asked 35, correct 34, wrong 0, refused 1 (the Python code-reading row).
- control: codeNative on the 256 census prompts of the 36 other kinds answered 0.
- tests: `node --test test/code-native.test.mjs test/act-prompt.test.mjs` exit 0, 37 pass, 0 fail.
- barMet true.

The held-out refusals, left as gaps rather than tuned away after the first held-out run (2026-09-28T13:42:28.326Z;
the verdict flags any reader change after that run as contamination): h-code-01 (no operation read the prompt
completely), h-code-20 and h-code-21 (two examples, and a second behaviour one depth deeper also fits), h-read-05
(Python code reading), h-sql-02 (the verb "get" is not in the SQL reader's function words).

Disclosed in the verdict's split: the held-out rows and the readers have one author, who knew the rows while writing
the readers. The numbers measure generalisation to prompts that author wrote, not to strangers. The code-reading
median sits near 16 ms because each snippet runs in its own act/run.mjs worker; the spec reader without stated
examples answers in a fraction of a millisecond.
