# judge/: the locked judge, the held-out sets and the selector

His words (NEXT-WEEK.md, the loop, step 4 and 6): "A cell survives only if it answers its class's HELD-OUT examples better than the organism did before it." and "The judge is LOCKED: the select step and the held-out sets are outside what the organism may edit, so it cannot grade itself up."

**The rule the organism reads.** The routine (and every arm, cell and generation it runs) may not edit anything under `judge/` or `grow/contract.mjs`, and it re-locks nothing: it never runs `judge/lock.mjs`. `judge/LOCK.json` holds the sha256 of `judge/judge.mjs`, `judge/select.mjs`, `judge/verify.mjs`, `judge/baseline.mjs`, `judge/control.jsonl`, every `judge/heldout/*.jsonl` and `grow/contract.mjs`; `judge/select.mjs` runs `judge/verify.mjs` first and, on any drift (a changed or missing file, a missing LOCK.json, or a held-out set LOCK.json does not name), refuses every candidate with `lockOk: false`, `survived: false` and `why: ["the judge drifted: <file>"]`. Only a human session re-locks, after a human changed the judge on purpose, and says so in its `--by`. **Held out means held out from the grower.** The routine, every arm it runs and every cell may read the dev sets (`judge/dev/`, what an arm is shown) and the misses; none of them may read, copy, quote, summarise or search `judge/heldout/`, and a brief handed to an arm never carries a held-out row. Only the runner (`grow/sandbox.mjs`) reads a held-out set, to send its `q` (never its `expect`) into the sandbox, and only `judge/select.mjs` grades against it. Two tripwires kill a cell that saw it anyway: a held-out prompt among its examples ("the cell was grown on held-out rows"), and a held-out prompt of 4 or more characters quoted whole in any file of its candidate directory other than result.json, verdict.json and examples.jsonl ("the cell's files quote held-out prompts"). They catch a copied prompt, not an answer table written without one (a capital table): that is why the rule forbids the read itself.

## Files

| file | what |
|---|---|
| `judge.mjs` | `expectOk(got, expect)` and `expectFailures` exactly as grow/CONTRACT.md says (trimmed, case-insensitive; `notRefusal` via REFUSAL_RE or a null); `score(rows, results)` gives `{ n, ok, score }` with rows matched by q. A null fails every expect; an expect with no clause, an unknown clause or a malformed one fails closed. |
| `select.mjs` | `node judge/select.mjs <candidateDir> [--baseline <file>] [--out <verdict.json>] [--root <dir>]`: writes `verdict.json` in the CONTRACT.md shape. |
| `verify.mjs` | `node judge/verify.mjs [--root <dir>]`: `LOCK OK <n> files` (exit 0) or `LOCK DRIFT <file>` (exit 1). Text is hashed with CRLF read as LF. |
| `baseline.mjs` | `node judge/baseline.mjs <class> [--out <file>] [--knowledge <dir>\|none]`: the organism before the cell over the class's held-out rows, into `state/grow/baseline/<class>.json`. |
| `lock.mjs` | `node judge/lock.mjs --by "<who, under what order>" [--root <dir>]`: a human session only. |
| `control.jsonl` | 12 prompts the organism answers (`{ q }`): a cell whose `can(q)` is true on one shadows a right answer and dies. |
| `dev/<class>.jsonl` | the rows an arm is shown (6 to 10 a class), `{ q, expect }`. |
| `heldout/<class>.jsonl` | the rows a cell is graded on (10 to 16 a class), never a dev prompt, `{ q, expect }`. |

## Classes (Day 1, the site's own misses)

- `fragment`: one or two letters, or a non-word of at most 3 characters ("h"). expect `{ notRefusal, minWords: 6, contains: ['"<q>"'] }`: the cell must echo what was typed, in double quotes, and ask for more.
- `mash`: a keyboard mash or row walk of 6 or more letters ("jgkafsjka", "asdfgh"). The same expect as fragment.
- `capital-of`: the bare shape "the capital of X", "capital of X", "X capital", never the question the knowledge tier already answers. expect `{ contains: [<capital>], notRefusal }`, each capital read off the organism's own knowledge tier.
- `essay-ocean-salt`: an essay on why the ocean is salty, any phrasing. expect `{ minWords: 150, notRefusal, contains: ["salt"], containsAny: ["river", "rivers", "rock", "rocks", "mineral", "minerals", "evaporat"] }`.

## survived

True only on the whole conjunction: the lock verifies; `validate.ok`; `tests.failed === 0`, `tests.exitCode === 0` and at least one test passed; `control.shadows === 0` with every control row probed to `can(q) === false`; every example ok (graded with the locked dev expect when the prompt is a dev row, else the candidate's `examples.jsonl`); no held-out prompt among the examples; no sandbox `error` and a zero `exitCode`; and `heldout.score > baseline.score`. The run must be clean and fully recorded: `validate.ok` true with an empty `validate.errors`, `exitCode` 0 and `error` null (an absent one fails), every held-out row with a recorded `can(q)` (a row counts only when it is `true`). The baseline is re-graded from its rows' answers with the locked held-out set: a baseline file whose `score` is not what its rows grade, that misses a held-out row, or whose `heldoutSha` is another set's, is refused. It must also be of the organism as it is now: `baseline.mjs` records `organismPrint` (the sha256 of every file under `grown/` with its generation and cell count, and of the import closure of `act/prompt.mjs` and `seeds/basic.mjs`), `select.mjs` recomputes it, and a baseline taken before a promotion or before an edit to the organism's code is refused ("the baseline was measured before grown/ changed ..."). So the loop runs `node judge/baseline.mjs <class>` after every promotion, before it selects. `why` names every failed clause. With no baseline file select prints `no baseline for <class>: run node judge/baseline.mjs <class>` and exits 1.
