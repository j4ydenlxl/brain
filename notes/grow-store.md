# notes/grow-store.md: the cell-store writer and the promoter (board 37, item store, 2026-09-30)

His words: "CELL STORE: a separate private repo, j4ydenlxl/brain-cells, holding gzip shards and an index. It lives
in the cloud only and is never cloned on his PC." and "Survivors are copied into the tab layer and the function, so
the site answers natively."

## What was built

- `grow/store.mjs`, a CLI with four verbs, no dependency, no model call, built to grow/CONTRACT.md:
  - `shard <gen> <lane>`: tars the whole lane directory (every candidate, winner or loser, plus any lane-level file)
    with its own ustar writer and node:zlib, PUTs `shards/gen-<gen>-<lane>.tar.gz`, writes
    `generations/gen-<gen>-<lane>.json` from the verdicts, then GET, merge, PUT with sha on `index.json` (created when
    absent). Prints `{shard, bytes, candidates, survivors, indexCells}`.
  - `promote <gen> <lane>`: every candidate whose verdict.json says `survived: true` (the boolean) AND carries the
    whole CONTRACT conjunction (below) is copied to `grown/cells/<id>.mjs`, its `./` siblings (followed transitively)
    to `grown/cells/<id>-<file>` with the import specifiers rewritten; rows appended to `grown/index.json`
    (generation = max); `grown/index.mjs` regenerated with static imports in index order and the generation-0
    `grownAnswer` body verbatim (`GROWN_BODY`; generation 0 renders to the orchestrator's file byte for byte); then
    `node --check`, import, the cell count and order checked against index.json, and every cell must answer its own
    `examples[0].q` through `grownAnswer`. Prints `{promoted, cells, generation}`.
  - `index`: prints `{shards, cells, survivors}` of the store index (zeros when the repo is readable and has none).
  - `verify-local`: imports grown/index.mjs, prints `{cells, answers: [{id, q, ok}]}`; exits 1 when a cell is shadowed.
- Transport: `gh api` when gh is present and `gh auth status` exits 0; else fetch to api.github.com with
  `GITHUB_TOKEN` (by name, never printed); else the line `no gh and no GITHUB_TOKEN: the cell store is unreachable
  from here`. `--api-base URL` points it at another contents API (the test stub); GITHUB_TOKEN is attached only when
  that base is `https:` with host `api.github.com` (never plain http, never another port or host). Never a clone,
  never a working copy of brain-cells.
- The conjunction promote re-reads (`conjunctionFailures(verdict, result, env)`, exported): verdict `survived ===
  true`, `why` an empty list, `lockOk === true`, verdict tests failed 0 with at least one passed, control shadows 0
  over at least one row, every example ok (n at least 1), `heldout.score > baseline.score` (both numbers); result.json
  present with `validate.ok === true`, tests exit code 0 and failed 0, no `error`, `exitCode` 0 or absent, and
  `backend` `vercel`, or `here` only when promote itself runs on a cloud VM (`CLOUD_ENV`: CLAUDE_CODE_REMOTE,
  GITHUB_ACTIONS, VERCEL, CI, the list grow/sandbox.mjs allows the here backend on). A survived:true verdict that
  fails any clause is refused before any write with `<id>: verdict.json says survived true but the conjunction
  fails: <every failing clause>`.
- Refusals, each one line with exit 1: an id already held by another shard (checked before the shard is PUT); an id
  twice in one lane; a candidate directory that is not an id, or whose verdict/result names another id; a promote of
  an id grown/ already holds (`duplicate id <id>: grown/index.json already holds it, a promote never overwrites a
  cell`); a survivor failing `validateCell`, or whose siblings use a FORBIDDEN construct, a non-relative import or an
  import that leaves the cell directory; a meta.class the verdict does not say; a meta.generation that is not the
  promoted generation; a survivor in generation 0; a shard over 100 MB.
- Promote is a transaction: any failure after the first write (contract of the copy, node --check, cell count or
  order, the answer proof) restores index.json and index.mjs and deletes the copied files, and says
  `(rolled back: grown/ is as it was)`.
- Conflicts: a PUT on a stale sha (409) or a create that lost a race (422) re-reads, re-merges and retries, 5 tries.
- Past 1 MB the contents API sends no content; `getFile` then reads the git blob API (up to 100 MB).
- Choices the contract left open: `shards` in the store index is a list of shard paths
  (`shards/gen-<n>-<lane>.tar.gz`), the same string each row's `shard` holds; `file` in grown/index.json is relative to
  grown/ (`cells/<id>.mjs`), the path index.mjs imports; tar entries sit under `gen-<n>-<lane>/`.

## Fixer round 1 (after the skeptic, 2026-09-30)

- wrong, fixed: promote trusted `survived: true` alone. It now re-reads the conjunction above from the verdict and
  result.json; the skeptic's probe (survived true, lockOk false, tests.failed 3, shadows 1, heldout 0 < baseline 1)
  is a test case and is refused.
- weak-test, fixed: the 10 guards with no test (generation max, meta.generation, sibling FORBIDDEN, outside-dir
  import, survived === true, verdict/result id, meta.class, generation 0, GROWN count, node --check) each have a case
  that trips it alone and asserts its exact line; `promote()` takes an optional `render` (default renderIndexMjs) so
  a test can hand it a bad index.mjs.
- weak-test, fixed: the no-authorization assertion could not fail (childEnv deleted GITHUB_TOKEN). The first shard now
  runs with a dummy GITHUB_TOKEN in its environment, and a control request with an authorization header proves the
  stub records one.
- note, fixed: the token no longer goes to `http://api.github.com` (the https check), tested with
  `https://API.GITHUB.COM:443/` (token), `http://api.github.com`, `https://api.github.com:8443` and a lookalike host
  (no token).
- note, fixed: a survivor whose result.json says `backend: here` is refused unless promote runs on a cloud VM; the
  real-run fixture no longer claims it ran: its result.json says `backend: null`, `tests.exitCode: null`, and the
  error "a store fixture for the cell-store writer: never run (no sandbox, no test, no import)"; it was validated from
  its source only (validateCell(source), never imported).
- note, fixed: "git status shows grown/ untouched" cannot be shown by git status (grown/ is untracked, it prints
  `?? grown/` whatever happens inside); untouched is shown by the sha256 values and the 16:43 mtimes below.

## How to run

```
node grow/store.mjs --help
node grow/store.mjs shard <gen> <lane> [--dir state/grow/gen-<gen>/<lane>] [--repo j4ydenlxl/brain-cells]
node grow/store.mjs promote <gen> <lane> [--dir state/grow/gen-<gen>/<lane>] [--grown grown]
node grow/store.mjs index
node grow/store.mjs verify-local
node --test --test-reporter=tap test/grow-store.test.mjs
```

## Tests (test/grow-store.test.mjs, 19 tests, no token)

An http stub on 127.0.0.1 emulates the contents API (GET 404 then PUT 201, GET 200 with sha then PUT 200, 409 on a
stale sha, 422 on a missing sha, base64 wrapped at 60 columns as GitHub sends it, the blob API past a size threshold).
The shard is decoded by a ustar reader written in the test (checksum and magic checked; a flipped header byte fails
it) and listed by the system tar; promote runs on temp grown/ directories. Printed:

```
# tests 19
# pass 19
# fail 0
# cancelled 0
# skipped 0
```

Thirty mutants of grow/store.mjs, each run against a scratch copy of this suite (state/board37/store/mutants.mjs,
deleted after), printed `killed 30 of 30`: the skeptic's ten survivors (generation = gen, not max; meta.generation
check removed; sibling FORBIDDEN check removed; outside-dir import check removed; survived truthy, not === true;
verdict/result id check removed; meta.class check removed; gen<1 guard removed; GROWN count check removed; nodeCheck
removed), ten new ones (conjunction check removed from promote; its lockOk, why, shadows, result.json-absent and
backend-here clauses each removed; heldout > baseline made >=; the sibling bare-specifier check removed; the cell
order check removed; the token sent to plain http api.github.com) and the builder's ten (tar checksum off by one; a
re-run keeping its old rows; no conflict retry; imports not rewritten; no rollback; the grownAnswer body drifted; a
loser promoted; a duplicate not refused; the blob path ignored; the token sent to any base).

## The real run (2026-09-30, 17:17:59 EDT, gh transport, against j4ydenlxl/brain-cells, the update path)

Before: `gh api repos/j4ydenlxl/brain-cells/contents/ --jq ".[].name"` printed `README.md`, `generations`,
`index.json`, `shards` (the builder's run at 16:59 and the skeptic's at 17:04 had written them).
The fixture lane: one candidate `store-fixture` (class fixture, meta.generation 1, validateCell(source) ok, never
run, verdict survived false) at state/board37/store/gen-0/fixture/ (scratch, deleted after the run; the shard holds
it: `gh api "repos/j4ydenlxl/brain-cells/contents/shards/gen-0-fixture.tar.gz?ref=main" --jq .content | base64 -d | tar -tzvf -`).

```
$ node grow/store.mjs shard 0 fixture --dir C:/Users/ybmic/Downloads/claudeskillsvideo-to-website/brain/state/board37/store/gen-0/fixture
{"shard":"shards/gen-0-fixture.tar.gz","bytes":954,"candidates":1,"survivors":0,"indexCells":1}
$ gh api repos/j4ydenlxl/brain-cells/contents/shards --jq ".[].name"
gen-0-fixture.tar.gz
$ node grow/store.mjs index
{"shards":1,"cells":1,"survivors":0}
$ node grow/store.mjs promote 0 fixture --dir .../state/board37/store/gen-0/fixture
{"promoted":[],"cells":0,"generation":0}
$ node grow/store.mjs verify-local
{"cells":0,"answers":[]}
```

Read back: the shard downloaded through the contents API is 954 bytes and `diff -r` against the lane printed
`shard content == lane dir`; index.json holds one row
`{"id":"store-fixture","class":"fixture","generation":0,"lane":"fixture","survived":false,"shard":"shards/gen-0-fixture.tar.gz"}`;
generations/gen-0-fixture.json holds that candidate with heldout `{"n":0,"ok":0,"score":0}`, baseline null, cpuMs 0;
three commits `ae50af3a shard gen-0-fixture: 1 candidates, 0 survivors`, `3199cf23 generation gen-0-fixture`,
`a4b3a4e7 index: gen-0-fixture, 1 cells`.
The real grown/ is unchanged: sha256 of grown/index.mjs
`1078973c313eb051969ac204da86d8cb3d62bb69d548ee9e590d7d7b495e7f0f` and grown/index.json
`bd20c19b1841e0332169a1baa02c58205ac84ed8a32ebf968696dc73e2a4e778` are the same before and after, the mtimes are
16:43:13 and 16:43:14 (the orchestrator's generation 0), grown/cells holds `.keep` only. `git status --short grown/`
prints `?? grown/`: grown/ is untracked, so git status cannot show untouched; the sha256 values do.

## What remains

- The fixture meta.generation is 1 (the contract's floor) while it sits in gen-0; the store row says generation 0,
  the shard argument. A real lane has meta.generation equal to its gen-<n>, and promote enforces that.
- `CLOUD_ENV` is a copy of grow/sandbox.mjs's list (this item may not import that file); a change there must be
  made here too.
- Past about 1 GB the shards move to object storage (his words); the writer stops at 100 MB per shard today.
- Each shard is three commits on main; a batched git-data-API commit would make it one.
- The cloud side (the routine VM without gh) goes through GITHUB_TOKEN with fetch: exercised in the tests only by
  makeTransport's choice, not yet by a real run from a VM.
