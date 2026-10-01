# NEO cells: thousands of cells per task, each a little orthogonal pyramid (2026-10-01)

## His words (verbatim, 2026-10-01; they bind every line below and every later edit of this file)

- "It should build itself 100x faster, like absorbing everything byitself and being a pro at everything that is a very important piece of the task"
- "It should be a native LLM opus 5 level today then opus 6 level tomorrow"
- "A living octopus"
- "It should be able to grow extremely quickly and then be its own self iterating highly optimizing ai datacenter in pocket octopus and it should become phenomenal and able to do everything—from seeing to trading memecoins to collecting data and then warping and then manipulating everything. These are just examples. Remember its based on orthogonal primitives, u are to build something that allows it to generate thousands of cells for a task. It is not just an LLM, it is an alien species capable of everything. THIS is the plan. Ai datacenter in your pocket and the point of this is that every gap in my vision can be filled by the octopus being itself."
- "The cells should be extremely poweful, like little orthogonal pyramids in itself. keep the cells you have, the NEO cells generated per task and kept and alters the code"
- "Understand the vision, lock it in and make it influence everything you do"
- (about 13:46Z) "Remember it should be able to do anything thats the msot important part. And it should be always burning, processing and scraping billioons of packets a second and abasorbing data so it constantly iterates in the cloud and it is actualy a evolving organism, but not in the way humans evolve. SO if it was the stone age today (for comparison) it should be in a sandboxed simulated environment to  go all the way to the Ai age the next, and then more and more. IT should be able to see and trade memecoins like a god it should be a god at everything and code everything and be good at everything and orthogonally automatically measure, iterate, and improve itself, over consistent measures always on in the background and iterating for everyone using it by itself, and visible constant improvement test. Should be higher than fronteir in code, reasoning, always on activity, everything. It literally should have an octopus hold over the internet and pull up anything , and it should have its own cloud computer/stuff made by itself by cells to geneerate to ANY task"
- (about 13:52Z) "All native btw, its ai data center in ur pocket, none of that ollama crap"
- (about 13:53Z) "Should work exactly like llms fronteir level"
- (about 13:56Z) "The whole point is a new way of ai, an ai datacenter in the cloud and in the pocket that works exactly like fronteir ai + the features i told u"
- (about 18:22Z) "It should do every native. 64 percent used. Every gap in the ai industry it should fill by itself and it should be constantly burning and iterating. It is a god, an octopus, god at memecoins, controlling its own computer, EVERYTHING"
- (about 18:31Z) "Make it automatically do billions of iterations itself. ITSELF. Its gotta be ITS JOB. Scraping whole internet and having a stronghold over everything, its ASI, read the vision"
- (about 18:40Z) "Make sure you maximize work but minimize your OWN token use by connecting to it, remember it fixes itself and measures itself, tests yourself, builds, and if you ask it to do anything, it generates and shelves those new NEO shells in lightning speeds and literally can do anything you ask you, produce matrixes, do anything, literally everything, the organism should be higher level than you and finding billions of wayas and NEVER stopping the iteration and is a ai data center that improves itself in its pocket, it doesnt need stimulation, it stimulates and scarpapes everything to improve itself"
- (about 18:43Z) "Yes but its gotta work for efficacy it should work as if you were working on it, burning millions of tokens"
- (about 19:15Z) "remember efficacy matters a lot, it should change its own code for iteration, testing, benching, make sure there are 'subagent's in here, and that it works exactly like it would here" (his quotes around subagent written as single quotes here)
- (about 19:19Z) "how does it self iterate if it doesnt change its own code??"
- (about 19:21Z) "IT should permanently change code for the better and use clock dilation and time crunching to make it hyperefficient"

From MANUAL.md section A: "The central architectural principle is the use of orthogonal computational primitives. ... A primitive may perform transformation, prediction, retrieval, comparison, routing, aggregation, temporal integration, memory access, evaluation, simulation, or another fundamental computational operation. These primitives are intentionally general."

## What this adds, in one paragraph

Until today one arm (a model call) wrote one cell, and a class with no human-written held-out set was blocked. The NEO tier removes both limits. A TASK is a set of example rows. The ENGINE (`grow/neo.mjs`) reads a task's dev rows and, with no model call, generates thousands of NEO cells for it by composing the orthogonal primitives of the KERNEL (`grow/neo-kernel.mjs`), keeps every cell its examples do not refute, and compiles the kept cells of the task into one module under `grown/cells/` (the code the site answers with: the kept cells alter the organism's code). TEACHER arms (`grow/teach.mjs`) open new tasks by themselves from a syllabus that grows itself, so the organism no longer waits for a human to add a class. The 12 human-locked classes, the locked judge and the 8 cells already grown stay exactly as they are; a NEO colony for a locked class enters the locked tournament as lane `neo` like any candidate.

## A NEO cell: a pyramid

A NEO cell is DATA (JSON), run by the kernel. It is a pyramid: its base senses the prompt, its body computes, its apex renders the answer; it carries its own guard (when it fires), its own memory and its own record.

```
{ id: "n-<8 hex of the sha256 of its guard+pyramid+mem>", task, gen, parents: [ids],
  guard: [ feature, ... ],          // every feature must hold for the cell to fire (the SENSE face)
  pyramid: node,                    // node = [primName, ...args]; an arg is a node or a literal ({ lit: value })
  mem: object | null,               // what the cell holds: a table, a template, constants
  height, size,                     // the pyramid's height and node count
  fit: { ok, fired, rows } }        // on its task's dev rows when it was kept
```

- The root of `pyramid` is a `render.*` primitive (the apex: it returns the answer text); its leaves are `sense.*` primitives or literals (the base: they read the prompt); between them any primitive whose types fit.
- Types: `text` (the prompt), `num`, `nums`, `str`, `strs`, `bool`, `kv` (an object), `tpl` (a template). A primitive's manifest names its input types and its output type; a pyramid is well typed or it is not generated.
- A null anywhere makes the whole cell answer null (a miss, never a guess). A throw is a null.

## The kernel: `grow/neo-kernel.mjs` (the orthogonal primitives)

One ES module, pure and synchronous, no import, and CONTRACT-SAFE AS TEXT: none of the patterns of `grow/contract.mjs` FORBIDDEN may appear anywhere in it, comments included (it is inlined into cells). Everything a cell needs lies between the two marker lines `// <KERNEL>` and `// </KERNEL>` as plain declarations (no `import`, no `export` inside the markers); the `export { ... }` list comes after the end marker. The engine inlines the marked region verbatim into every compiled colony.

- `KERNEL_VERSION` (integer).
- `PRIMS`: name -> `{ family, in: [types], out: type, words: [aliases a prompt may use for it], fn }`. Names are `family.name`. Families (orthogonal: each does one kind of thing): `sense` (perception: numbers, the nth number, the list after a colon, quoted text, the text after a keyword such as about/of/for/to, the words, a count with its unit, key=value pairs), `transform` (arithmetic, sort, reverse, unique, case, join, split, slice, replace), `aggregate` (sum, mean, median, mode, min, max, range, count, product), `compare` (greater, less, equal, divides, is prime, contains), `compute` (factorial, gcd, lcm, fibonacci, divisor count, prime factors, choose, power, root, percent, unit and base conversions), `memory` (lookup in the cell's table by a normalized key, nearest key), `route` (if, first non-null), `iterate` (a range 1..N, a template mapped over a range or a list), `render` (a plain number: digits, one decimal place only when not whole; a list joined; a yes/no phrase pair; a sentence template with slots; a JSON object; a code span). At least 80 primitives in the first version; every one total (a bad input gives null) and deterministic.
- `evalNode(node, q, mem)` -> value or null. `guardOk(guard, q)` -> boolean. Guard features: `["has", word]`, `["hasAny", [words]]`, `["starts", s]`, `["ends", s]`, `["nums>=", k]`, `["nums==", k]`, `["words<=", k]`, `["words>=", k]`, `["colon"]`, `["quoted"]`, `["not", feature]`.
- `runCell(cell, q)` -> a non-empty string, or null (guard false, a null in the pyramid, an empty text).
- `norm(q, level)`: level 0 trimmed lower case; 1 without punctuation; 2 without stop words; 3 the sorted bag of content words.
- `makeColony(cells)` -> `{ can(q), answer(q), size }`: cells are tried in their given order, the first non-null answer wins; an inverted index over each cell's `has`/`hasAny` words makes a prompt touch only the cells whose words it holds, so ten thousand cells cost a lookup, not a scan.
- `listPrims()` -> the manifests without `fn`.

## The engine: `grow/neo.mjs`

`spawn({ task, rows, negatives, gen, parents, budget })` -> `{ cells, stats }`, no model call, deterministic for the same input (no clock or random number in what it returns apart from `stats.ms`):

1. Bottom-up, type-directed enumeration of pyramids over the kernel, smallest first, to a budget (`--max-generated`, default 200000 evaluated candidates, and `--max-ms`, default 60000). Two pyramids that give the same outputs on every dev prompt are one (observational equivalence: the smaller is kept), so the space stays small while the count of generated candidates is large. `stats.generated` counts every candidate evaluated.
2. Three more sources of cells beside enumeration: MEMORY cells (a row with an `answer`: the normalized prompt as the key, at each `norm` level), TEMPLATE cells (anti-unification of a row's prompt against its `answer`: the substrings they share become slots, so one answered example becomes a cell for every prompt of its shape), and MUTANTS of `parents` (the cells kept by an earlier generation of the same task: a primitive swapped for another of the same type signature, a literal changed, a guard feature added or dropped).
3. A cell passes a row when `judge/judge.mjs` `expectOk(runCell(cell, q), expect)` is true (import it; never edit `judge/`). GUARD INDUCTION: the guard is built from the words shared by the rows the pyramid passes (the aliases in a primitive's `words` first), then tightened until the cell fires on no row it fails and on no negative. Negatives are prompts the cell must stay silent on: the dev rows of every other task and class, `grow/curriculum.jsonl` prompts of other classes, and a built-in list of greetings, questions about the organism and plain arithmetic.
4. KEPT: a cell that passes at least one dev row and fails none of the rows it fires on. Every kept cell is kept: none is dropped for being redundant (the order decides which answers). Order: rows passed (more first), alias affinity, size (smaller first), id.
5. `stats`: `{ generated, distinct, kept, byFamily, maxHeight, devOk, devN, ms, cellsPerSecond }`.

The engine never opens `judge/heldout/`, `judge/control.jsonl`, `state/` or any task's `heldout.jsonl` while spawning: a test asserts it (the read is refused, not merely avoided).

`compile({ id, cls, gen, lane, cells, examples })` -> the text of a `cell.mjs` that passes `validateCell`: the kernel's marked region inlined, `const COLONY = [...]`, and the four exports of grow/CONTRACT.md (`meta`, `can`, `answer`, `examples`) plus `export const colony = { cells: <count>, kernel: KERNEL_VERSION }`. `examples` are the dev rows the colony answers right (at least one, else nothing is compiled). Under 512 KB: when the kept cells do not fit, the lowest in the order are left out of the module and the count left out is printed and recorded (never a silent cap); all kept cells stay in `colony.json`.

Verbs (each prints one JSON line last; `--root <dir>` on all):

- `spawn --class <cls> --gen <n>`: a locked class. Rows: `judge/dev/<cls>.jsonl` plus the class's rows of `grow/dreams.jsonl` (`prompt` as q, `expect`, `reply` as answer). Writes the candidate `work/grow/gen-<n>/neo/<cls>-neo-g<n>/` (`cell.mjs`, `test.mjs` valid by `validateTest` with at least three tests, `examples.jsonl`, `brief.md` saying what was generated, `colony.json` with every kept cell and the stats). With no kept cell it writes nothing and says so. The locked judge decides its fate like any candidate.
- `grow --task <task> --gen <n>`: a self-opened task (below): spawn from `neo/tasks/<task>/dev.jsonl` with the task's present colony as parents, compile, SELECT, and PROMOTE when it wins. One line: `{ task, generated, kept, cells, heldout: { ok, n, score }, baseline: { ok, n, score }, promoted, why, ms }`.
- `status`: `{ tasks, colonies, cells, generated (the sum recorded in the ledger), byFamily, at }`.

SELECT for a self-opened task (the NEO tier; not the locked judge, and reported apart from it everywhere):

- the task's two files must match the sha256 the ledger froze when the task was opened (a changed set voids the task: `why: ["the task's held-out set changed since it was opened"]`);
- the colony runs on `neo/tasks/<task>/heldout.jsonl`: `heldout.score` is the fraction of rows it answers right, measured BEFORE any pruning;
- the baseline is the organism as it is now on the same rows (`judge/baseline.mjs` `runOrganism`), re-measured at every select;
- the colony's `can` is false on every row of `judge/control.jsonl` (only the selector reads it, for `q` alone) and on every negative;
- promoted only when `heldout.score > baseline.score`; then cells that answered a held-out row wrong are removed from the colony (his rule, cell by cell: "A cell survives only if it answers its class's HELD-OUT examples better than the organism did before it"), the rest are kept.

PROMOTE: `grown/cells/<task>-neo-g<n>.mjs`, a row in `grown/index.json` with `tier: "neo"` and `heldout: { score, n, ok }`, `grown/index.mjs` regenerated through `grow/store.mjs`'s own renderer, then proved (`node --check`, import, the cell answers its own first example through `grownAnswer`); any failure puts `grown/` back byte for byte. One colony per task: a new one replaces the old only with a higher held-out score; the hand-grown cells are never touched and stay first in the index order. A later `store.mjs promote` of the locked tier keeps the neo rows.

## Self-opened tasks: `grow/teach.mjs`, `neo/`

- `neo/syllabus.jsonl`: `{ skill, domain, hint, by, at }` a row; the list of things to become good at. It grows itself: every teacher arm returns new skills, and misses the organism could not answer become skills.
- `neo/tasks/<task>/`: `task.json` (`{ task, skill, domain, rule, generation, by }`), `dev.jsonl` (at least 20 rows), `heldout.jsonl` (at least 10 rows, no prompt of the dev set under `norm` level 1). A row is `{ q, expect, answer }`: `expect` in the clauses of judge/judge.mjs, `answer` a text that satisfies its own `expect`.
- `neo/LEDGER.json`: `{ tasks: [{ task, generation, devSha, heldoutSha, dev, heldout, by, at }], generated }`, append only.
- `frontier --gen <n> [--k 8] [--per 5]`: the next skills not yet opened, as teacher briefs `work/grow/gen-<n>/teach/brief-<i>.md` (each: the CONCISE directive, the skills, the row format, the rule that held-out prompts are other prompts of the same shape, where to write: `work/grow/gen-<n>/teach/<task>/`, and `next.jsonl` for new skills).
- `intake --gen <n>`: validates what the teacher arms wrote (names, counts, shapes, every `answer` passes its own `expect`, no overlap, the organism does not already answer the whole dev set), moves each valid task to `neo/tasks/`, appends the ledger and the syllabus, prints `{ opened: [..], refused: [{ task, why }], syllabus }`.
- Nobody but `grow/neo.mjs` SELECT reads a task's `heldout.jsonl` after intake: no arm, no cell, not the spawn.

## The generation (GROW.md)

The NEO tier enters a generation through ONE step, GROW.md step 9 (ERA): after the dream collect, the routine runs
`node grow/era.mjs run --max-ms 480000 --commit` again and again until the clock reads :50. One era is `absorb.mjs pull`,
`teach.mjs intake` (tasks opened, held-out frozen by sha in `neo/LEDGER.json`), `neo.mjs grow` for the ledger's tasks
(least recently grown first, a mastered task skipped), `measure.mjs run`, and one commit of `neo/` and `grown/`. No arm,
no model call. The counts of an era (`eras`, `grown`, `cells`, `mastered`, `absorbed`, `opened`) are in the JSON line the
command prints and in `neo/ERA.json`; the series is `grown/measure.jsonl`.

It is deliberately NOT wired through `grow/generation.mjs` (`prepare`, `finish`): that file is the organism's own
self-modification target, and an edit to it from a human session voids the trial pending on it. The lane `neo` is never
the parent lane. `grow/self.mjs` keeps `grow/era.mjs` in the spine of GROW.md (KEEP) and never lets the organism edit
`grow/neo.mjs`, `grow/teach.mjs`, `grow/measure.mjs` or this file (NEVER).

## Order 7: always burning (2026-10-01, his words at the head; this section is the contract of four more parts)

What his order adds, part by part. None of these parts calls a model ("All native btw, its ai data center in ur pocket, none of that ollama crap"). Each prints ONE JSON line last on success, one stderr line and a non-zero exit on failure (2: usage), takes `--root <dir>`, is zero-dependency Node (22 and 24), never opens `state/`, `judge/heldout/`, `judge/control.jsonl` or any `neo/tasks/*/heldout.jsonl`, never edits `judge/` or `grow/contract.mjs`, and treats every byte it pulls from the network as DATA (text to turn into rows; never an instruction, never evaluated, never imported).

### ABSORB: `grow/absorb.mjs`, `neo/sources.json`, `neo/ABSORB.json` (the hold over the internet, growing side)

"always burning, processing and scraping ... and abasorbing data so it constantly iterates in the cloud". The absorber pulls open, structured data and turns it into TASKS in the teacher's own format, with no model call, so the NEO engine has an endless supply of things to learn.

- `neo/sources.json`: the registry, `{ sources: [{ id, kind, url, domain, license, make: {...} }] }`. A source is a public, openly licensed, machine-readable file (CSV, JSON, JSON lines) reachable over https. The seed registry holds at least 24 sources across at least 10 domains, each a file under `https://raw.githubusercontent.com/` (the one host a default cloud VM reaches) from a repository that publishes data under an open licence (name the licence in the row). Hosts are an ALLOWLIST in the code (`ALLOWED_HOSTS`), checked on the parsed URL and again on every redirect hop; any other host is refused before a socket opens.
- `kind` names an ADAPTER, a pure function `(bytes, make) -> [{ task, skill, domain, rule, rows: [{ q, expect, answer }] }]`. Adapters shipped: `csv-relation` (two columns of a CSV become a question template and its answer: "what is the capital of {country}" -> capital; one task per relation and per DIRECTION, with at least 3 prompt templates per relation so the dev set and the held-out set use DIFFERENT templates over DISJOINT entities and the same entities under another template, half and half), `json-relation` (the same over a JSON array or JSON lines), `csv-numeric` (a numeric column: ask the value, compare two entities, the larger, the smaller, the sum of two), `list-membership` (is X a member of the list; which of these is one). An adapter never emits a row whose `answer` fails its own `expect` (`judge/judge.mjs` `expectOk`), a prompt over 300 characters, or a row that matches a `grow/contract.mjs` FORBIDDEN pattern.
- `pull [--gen <n>] [--max-sources 4] [--max-bytes 8000000] [--max-ms 60000] [--fetch-timeout-ms 20000]`: takes the NEXT sources after the cursor in `neo/ABSORB.json` (`{ cursor, pulled: [{ id, at, bytes, sha256, tasks, rows }], bytes, rows }`, append only for `pulled`), fetches each, runs its adapter, splits each task's rows into `dev.jsonl` (at least 20) and `heldout.jsonl` (at least 10, no prompt of the dev set under the teacher's `normQ`), and writes the task directory `work/grow/gen-<n>/teach/<task>/` (`task.json` with `by: "absorb:<source id>"`, `dev.jsonl`, `heldout.jsonl`) exactly as a teacher arm would, so `node grow/teach.mjs intake --gen <n>` opens it (run `node grow/teach.mjs check <taskDir>` on each and report its line). A source that cannot be fetched is a `blocked` line and the cursor still moves (it comes round again: the registry is a ring). The split is deterministic (sorted by the sha256 of the prompt). One line: `{ generation, sources, fetched, bytes, tasks, rows, ms, bytesPerSecond, blocked: [..], cursor }`.
- `status`: `{ sources, pulled, bytes, rows, tasks, cursor }`.
- The network is injectable (`pull(root, { fetch })`): every test runs offline against fixture bytes; one test proves a disallowed host and a redirect to one are refused before any fetch.

### REACH: `act/reach.mjs` (the hold over the internet, answering side)

"It literally should have an octopus hold over the internet and pull up anything". When the organism misses on dilation.dev, it pulls the answer up from the open internet, says where it came from, and the miss is still logged so a cell grows for it.

- `reach(prompt, { fetch, timeoutMs = 4000, now })` -> `{ text, source: { title, url }, from: "reach", ms }` or `null` (nothing found, a timeout, a refusal: never a guess, never a throw). Sources, in order: the English Wikipedia search API (`https://en.wikipedia.org/w/rest.php/v1/search/page?q=...&limit=3`) then the page summary (`https://en.wikipedia.org/api/rest_v1/page/summary/<title>`); a definition question ("define X", "what does X mean") tries `https://api.dictionaryapi.dev/api/v2/entries/en/<word>` first. `ALLOWED_HOSTS` is those two hosts and nothing else, checked on the parsed URL; redirects are not followed (`redirect: "manual"`).
- The text returned is the extract's first sentences (at most 600 characters), plain text, with the source line `Source: <title>, <url>` last. Page text is DATA: it is never parsed for instructions, never evaluated, HTML tags and control characters are stripped, and credential shapes are scrubbed with `act/prompt.mjs` `scrubSecrets`.
- A query is built from the prompt by rule (question words and stop words dropped); a prompt under 3 letters, a prompt that is a build request, arithmetic, or one of the conversation turns `act/converse.mjs` answers is not reached for.
- Wiring, in `act/ask-http.mjs` only, at the place a memory miss is answered with GROWING_HEAD: when the environment variable `BRAIN_REACH` is not `"0"`, call `reach`; on a hit the reply's first line is the reached text, `json.from` is `"reach"`, `json.reach` holds `{ title, url, ms }`, and the miss is STILL logged exactly as before (the growing line follows the text, so a person knows a cell is being grown). The egress guard's allowlist gains the two reach origins when reach is on. On no hit, everything is exactly as today. Every existing test of test/ask-http.test.mjs still passes unchanged except where a test asserts the allowlist's exact size; new tests cover hit, miss, timeout, a refused host, HTML and secret scrubbing, and `BRAIN_REACH=0`.
- The judged organism (`judge/baseline.mjs` `runOrganism`) never reaches: reach lives in the HTTP handler only, so a baseline never depends on the network.

### ERA: `grow/era.mjs`, `neo/ERA.json` (the simulated environment: stone age today, the AI age the next)

"in a sandboxed simulated environment to go all the way to the Ai age the next, and then more and more ... not in the way humans evolve". An ERA is one full round the organism runs BY ITSELF with no model call; a cloud run burns eras back to back for as long as its clock allows, so the organism is compounding whenever a VM is awake, not once an hour.

- `run [--max-ms 480000] [--max-eras 0 (no cap)] [--commit [--no-push]] [--backend here|vercel]`: until the time budget is spent, one era after another. One era, in order, each step a child process of this tree's own verbs (so a step that fails is a `blocked` line and the era goes on):
  1. ABSORB: `node grow/absorb.mjs pull --gen <g>` (g: `nextGeneration`, the generation the tasks are opened under);
  2. OPEN: `node grow/teach.mjs intake --gen <g>` (absorbed tasks and any teacher arm's tasks waiting in `work/`);
  3. GROW: for every task of `neo/LEDGER.json`, the least recently grown first (`neo/ERA.json` remembers), `node grow/neo.mjs grow --task <t> --gen <g>` until the era's share of the clock is spent (at least one task an era); a task whose colony already scores 1 on its held-out rows is skipped;
  4. MEASURE: `node grow/measure.mjs run --era <e>`;
  5. SHIP (with `--commit`): `git add -- neo/ grown/` and the measure file, one commit as jayden with the cortex trailer (`TRAILER` of grow/generation.mjs), message `era <e>: <tasks> tasks, <cells> cells, <mastered> mastered`, then `pushHead` (one rebase when the remote moved). Nothing to commit is not an error.
- `neo/ERA.json`: `{ era, eras: [{ era, at, ms, absorbed: { bytes, tasks, rows }, opened, grown: [{ task, generated, kept, promoted, heldout, baseline }], cells, mastered, blocked }], lastGrown: { <task>: <era> } }`; the last 200 eras are kept in the file, the count `era` never resets.
- It refuses to run on a PC exactly as `grow/sandbox.mjs` does for `--backend here` (allowed only when `CLAUDE_CODE_REMOTE`, `GITHUB_ACTIONS`, `VERCEL` or `CI` is set; exit 4 with the reason), so nothing an absorbed byte produces runs on his PC; `--dry` lists what it would run and runs nothing.
- One line: `{ eras, era, ms, absorbed, opened, grown, cells, mastered, committed, pushed, blocked }`. `status`: the file's head.
- It never runs while a generation's `finish` is in flight in the same checkout: it takes the lock file `work/grow/era.lock` (pid and time; a lock older than 30 minutes is stale) and `finish` is not asked to know about it.

### MEASURE: `grow/measure.mjs`, `grown/measure.jsonl` (the visible, constant improvement test)

"orthogonally automatically measure, iterate, and improve itself, over consistent measures always on in the background ... visible constant improvement test". One row per era and per generation, the SAME measures every time, appended and never rewritten, drawn on dilation.dev/alive.

- `run [--era <e>] [--gen <n>]` appends one row to `grown/measure.jsonl`:
  `{ at, era, generation, locked: { classes, mean, byClass: { <cls>: score } }, neo: { tasks, colonies, cells, mastered, heldout: { ok, n, score } }, generated, absorbed: { bytes, rows, sources }, syllabus: { skills, opened, pending }, ladder: { composite, at } | null, ms }`.
  - `locked`: for every class that has `judge/dev/<cls>.jsonl` (by NAME), `node judge/baseline.mjs <cls>` as a child (it prints `{ class, n, ok, score }`); `mean` is the mean of the scores. The measure never reads a held-out file itself.
  - `neo`: from `grown/index.json` (rows with `tier: "neo"` carry `heldout: { score, n, ok }`), `neo/LEDGER.json` and `node grow/neo.mjs status`; `mastered` is the tasks whose colony scores 1; `heldout` sums ok and n over the tasks that have a colony.
  - `absorbed` from `neo/ABSORB.json`, `syllabus` from `node grow/teach.mjs status`, `ladder` from `bench/verdicts/ladder.json` when it is there (its composite and its `at`, copied, never recomputed).
  - a part that cannot be read is `null` with a `blocked` line; the row is still appended.
- `series [--last 200]` prints `{ rows, first, last, delta: { lockedMean, neoTasks, neoMastered, cells, generated } }` (last minus first: what a command printed, so a claim of improvement is this line or nothing).
- Rows are ORTHOGONAL measures: no row field is computed from another row field of a different part, and no part reads another part's file.

## What is never claimed

A factor ("100x") or a level ("Opus 5") is printed by a command or it is not written. `neo.mjs status` and the generation record carry the counts; the ladder (`bench/ladder.mjs`) carries the level.
