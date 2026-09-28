# conceive (board 29 first draft, board 31 re-run; docs/VISION.md order 42 clause (a))

His words, 2026-09-16, re-sent 2026-09-27 15:05 EDT: "What if everything the human could concieve of in their brain
was native to the brain and completely plausible finding ways to do it straight". At 14:56 EDT the live site answered
2 of his 5 probe prompts ("h", "What is the capital of France?" and an essay prompt printed "I do not carry that yet").
This bench asks the organism the kinds of things a person conceives and prints, per kind, what it answers natively,
what it refuses, and how many answers pass a rubric that needs no model. It measures BREADTH; bench/public.mjs and
bench/essay.mjs measure depth.

Files: bench/conceive.mjs (the graders, the arms, the run), bench/conceive-prompts.json (the prompts),
test/conceive.test.mjs, bench/verdicts/conceive.json (the bar), bench/verdicts/conceive-partial.json (any narrower run).

## How to run

- The bar, model arm included (the model arm opens a socket to ollama ONLY with --model-arm; `ollama list` runs first
  and its row for the model is recorded; qwen3:1.7b or qwen3:0.6b only):
  `node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/conceive.mjs --limit 0 --model-arm --journal <scratch>/model-journal.jsonl --resume`
- Model off (no socket; the model arm prints ABSENT with its reason and barMet is false). Board 31 runs every item
  MODEL OFF, so this is the run its verdict holds:
  `node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/conceive.mjs --limit 0`
- A narrow run (N prompts round robin over the kinds, writes conceive-partial.json): `node bench/conceive.mjs --limit 20`
- Tests: `node --test test/conceive.test.mjs` (model off; the model arm is exercised against a mock ollama on a random
  localhost port, never the real queue)
- `--journal PATH` appends every model row as it lands; `--resume` reuses the journal's rows whose key (prompt id,
  prompt text hash, model, maxTokens, timeout, and the instrument sha below) matches. An absent row (the cell not reached) is asked again, never
  carried forward. The verdict counts appended and reused rows. The journal is scratch, never committed.

## The prompts (bench/conceive-prompts.json)

291 prompts over 41 kinds: arithmetic, algebra, word-problem, units, sequence, counting, spelling, vocabulary, logic,
calendar, geometry, fact, definition, explain, translation, summary, plan, advice, list, brainstorm, comparison,
classification, rewrite, poem, story, joke, recipe, letter, riddle, conversation, self, opinion, essay, code,
code-reading, sql, command, format, quiz, analogy, probability. Each row is {id, kind, prompt, grade}. Grades: exact
106, contains 52, regex 42, length 51, code 12, none 28 (263 gradeable). Written for this file; copyCheck re-reads
bench/site-ask.mjs, web/ask.mjs, bench/essay-prompts.json and the public GSM8K and HumanEval fixtures on every run.

## The rubrics (no model)

- exact: the candidate answer (last meaningful line, a trailing label, markdown, quotes and edge punctuation
  stripped) equals the answer or an alt; a numeric answer compares the last number on that line by value (31/4 meets
  7.75).
- contains: every `all` term and one `any` term on word boundaries (a trailing * is a prefix); case folded unless
  caseSensitive.
- regex: the pattern matches.
- code: the JavaScript in the answer (fenced blocks, else the whole text) defines `entry`; every test's args give
  `want`, run in ONE worker thread at a time with a vm timeout and a wall timeout (a HumanEval shaped prompt also
  tries the prompt plus the completion).
- length: every stated count (words, sentences, paragraphs, lines, items) is inside its band.
- none: no rubric can be stated without a model (a greeting, an opinion, a joke's wit); graded is null.
- STRICT is the rubric on the text as given. LOOSE is IFEval's loose accuracy: the rubric passes on any of eight
  variants (the text, without its first line, without its last line, without both, each with every * removed).
- The native gate: a refusal (empty, or a text that starts with a miss head) is graded false BEFORE any rubric runs.
  Miss heads: "I do not carry that yet", "nothing in memory matches", "the math region produced no number", "the code
  region produced no candidate".

## The arms

- organism: act/prompt.mjs ask() on seeds/basic.mjs seedBasic, provider null, k 5 (the endpoint's options); the
  knowledge tier opens when this host holds a finished ingest (it does here).
- organism-site: the same with knowledge: false, the one difference dilation.dev has (no ingested store).
- model: the same ask() with provider ollama, model qwen3:1.7b, the knowledge tier as the organism arm, maxTokens 4000
  and a 300 s timeout a call (bench/public.mjs's measured budgets for this model: a reasoning model cut off by a small
  num_predict returns an empty answer). A model cell asked and not reached makes the row ABSENT, never a refusal and
  never a zero.
- Interleaved prompt by prompt, the first arm rotating (bench/essay.mjs's plan); every ask is sequential, so the arms
  run one at a time. Each arm prints its wall (the sum of its asks) beside the run's wall.

## The bar, the control, the split

- isTheBar: --limit 0, every arm selected, every structural check true (at least 200 prompts, at least 20 kinds, sound
  shape, the empty answer control, no copied prompt, every prompt got every selected arm, absent rows carry a reason,
  the null arms are never absent).
- The instrument (board 31 fix pass): a sha256 over the path and bytes of every file reachable by relative import from
  act/prompt.mjs, bench/conceive.mjs and seeds/basic.mjs (80 files today), taken before the first ask and after the
  last. The check askPathStableDuringRun is part of isTheBar, the verdict records both shas and act/prompt.mjs's own sha
  and mtime, and the journal key carries the sha, so a row made by other code is never reused.
- barMet: the model arm is present, its refused share is exactly 0, and no gradeable row is ungraded (barMetOf).
- barBlockedBy and nextCommand: when barMet is false the verdict says why; when the model arm is absent it carries the
  one command that completes the bar once the ollama queue is free.
- The control: the rubric on an EMPTY answer grades 0 of the gradeable rows, strict, loose and through the gate
  (asserted and printed). Printed beside it: the prompt echoed back, the organism's own miss text graded by the rubric
  alone (the rows the native gate keeps false), and THE PARROT, a constant "ok" to every prompt: it refuses nothing,
  so it would meet the refusal half of the bar; its rubric passes are the floor any correct count is read against.
- The split: the whole prompt file is the DEVELOPMENT set; heldOut "none", because this is a census of what the
  organism answers and nothing (no tier, threshold or rubric) is fit to a score on these rows. contaminated false: the
  copy check finds 0 of 291 prompts in the sets it must not reuse.

## Measured

The bar, board 31 fix pass, model off (the board rule), printed by
`node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/conceive.mjs --limit 0`
(verdict bench/verdicts/conceive.json, at 2026-09-27T23:45:20.212Z, node v24.15.0, 466705 bytes):

- `CONCEIVE isTheBar true barMet false: asked 291 prompts over 41 kinds; organism native 12.37% refused 87.63% correct 16/263; organism-site native 9.28% refused 90.72% correct 12/263; model absent; wall 2001 ms`
- organism wrong native 8 of 24 (alg-01, alg-02, alg-04, word-08, fact-09, def-02, def-06, def-09); organism-site 4 of 16
  (alg-01, alg-02, alg-04, word-08).
- The organism alone refuses every prompt of 34 of 41 kinds; organism-site 36 of 41.
- Walls: organism 534.03 ms, organism-site 207.91 ms (each the sum of its asks); median 672600 ns per ask, 73600 ns per
  native answer (organism).
- Controls: the empty answer passes 0 of 263 rubrics (strict 0, loose 0, through the gate 0); the echoed prompt 0; the
  miss text 4 by the rubric alone (poem-01, poem-07, story-01, story-02), all false through the native gate; the parrot
  ("ok") refuses 0 of 263 and passes 0 strict, 0 loose. Copy check 0 of 291.
- Instrument: sha 23d7f6068862149c over 80 files, unchanged during the run; act/prompt.mjs sha 2b2365e0692541de,
  modified 2026-09-27T23:39:03.003Z.
- BUDGET done exit 0: wall 2.43 s, peak ram 83.0MB, peak dir 57.0MB.
- Tests: `node --test test/conceive.test.mjs` 25 of 25.

Why barMet is false: the item defines barMet on the model arm (its refused share 0, every gradeable row graded), and the
board header runs every item MODEL OFF (never call port 11434). The two cannot both hold on this board. The verdict
names it in barBlockedBy and carries nextCommand. The first builder's --model-arm run broke the board rule and died with
14 of 291 rows journaled; those rows were made across an edit of act/prompt.mjs (19:39:03 EDT, another item's file), so
they were one measurement of two programs. That is why the builder's wrong native list (alg-01, code-06, fmt-02) did not
reproduce, and why the instrument sha now guards the run and the journal. The 14 rows carry no instrument sha, so no
resume can reuse them; the scratch journal was deleted.

Read before and after the fix: the verify plane's seven problems; docs/boards/board-31.js (the conceive item task and
the COMMON header's MODEL OFF rule); the first builder's bar.log and model journal (14 rows); act/prompt.mjs mtime;
EleutherAI lm-evaluation-harness lm_eval/loggers/utils.py (get_git_commit_hash and add_env_info record the code's git
hash beside every result: a git hash cannot see an uncommitted working tree, which is the state this tree is in, so
conceive hashes the bytes of the ask path instead); IFEval, Zhou et al. 2023, arXiv 2311.07911 (loose accuracy, read by
the first builder).
