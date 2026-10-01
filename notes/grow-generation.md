# grow-generation: the generation driver (GROW.md steps 0, 1, 3, 4, 5, 8)

Board 38, item driver, 2026-09-30. His words (NEXT-WEEK.md): the organism is SELF IMPROVING, it generates its
own cells, and "A cell survives only if it answers its class's HELD-OUT examples better than the organism did
before it." The cortex types four commands (`status`, `prepare`, the arms, `finish`) and the loop closes.

## What was built

- `grow/generation.mjs` (39982 bytes, no dependency, no model, no socket of its own). Verbs:
  - `status [--gen <n>] [--gh none]`: `{ generation, backend, why, tokens, gh, misses, lock, lockOk, grown, pack, at }`.
    Backend: `VERCEL_TOKEN`, else `VERCEL_OIDC_TOKEN` (its `exp` read off the JWT, so `why` says valid until or
    expired, the token itself never printed), else `here` when `CLAUDE_CODE_REMOTE`, `GITHUB_ACTIONS`, `VERCEL`
    or `CI` is set, else `none`. Tokens are booleans by NAME. `gh` is `gh auth status` exiting 0. `lock` is the
    last line of `node judge/verify.mjs`. `pack` is `node tools/fetch-pack.mjs --check --quiet`.
  - `prepare [--gen <n>] [--misses <jsonl>] [--lanes direct,baked] [--parent <lane>]`: the lock (a drift stops
    it before anything else runs); `node tools/fetch-pack.mjs --quiet`; the open misses (`--misses` file, else
    Supabase with `SUPABASE_SERVICE_KEY`, else `grow/seed-misses.jsonl`; a failed Supabase read falls back to the
    seed and says so in blocked); a copy in `state/grow/gen-<n>/misses.jsonl` (the seed file is never written);
    `node grow/misses.mjs classes --file <copy>`; a class is kept only when `judge/heldout/<class>.jsonl` and
    `judge/dev/<class>.jsonl` EXIST (checked by name, never opened; a missing one is the blocked line
    "no held-out set: <class>: a human session adds truth"); `node judge/baseline.mjs <class>` per kept class,
    of which only `score` and `n` are read; the kept misses marked `growing` in the copy; the parent from the
    last entry of `grown/generations.json`; `plan.json`, `blocked.txt` and one brief per class per lane
    (`<lane>/brief-<class>.md`, the parent lane also `brief-<class>-2.md` for its second arm, id suffix `-2`).
  - The brief: target directory and id, the CONCISE directive verbatim from CLAUDE.md (the driver throws if
    CLAUDE.md lacks it), the contract with the exact `meta` literal, the FORBIDDEN patterns from
    grow/contract.mjs (with the warning that "process" and "globalThis" may not appear even in answer text),
    the class rule, "The organism before any cell scored X on N held-out rows", the dev rows verbatim in a
    jsonl block, the expect clauses the rows use, the lane strategy (baked: `node grow/generation.mjs ask "<q>"`
    first and bake the answers as data), ONE sentence forbidding `judge/heldout/`, `judge/control.jsonl` and
    `state/grow/baseline/`, the four files to write, the validate and test commands, the answer line.
  - `validate <dir>`: grow/contract.mjs validateCell on the SOURCE first (a source that fails is never
    imported), then on the imported module; test.mjs imports `./cell.mjs` and only `node:` modules besides;
    every examples.jsonl row has q and expect, and its q set equals `examples`. Inside
    `state/grow/gen-<n>/<lane>/<id>/` also: meta.id is the directory name, meta.generation is n, meta.lane is
    the lane, test.mjs declares at least 3 tests, every dev row is in examples.jsonl. Prints
    `{ ok, errors, id, class, generation, lane, examples }` (exit 1 when not ok).
  - `ask "<q>" [--knowledge <dir>|none]`: imports `runOrganism` and `PACK` from judge/baseline.mjs and runs that
    same organism on one row, with the baseline's own knowledge rule. Prints `{ q, text, route, via, knowledge }`.
  - `finish [--gen <n>] [--lanes a,b] [--dry] [--no-store|promote|build|tests|commit|push] [--sandbox-args "..."]`:
    the lock; with backend none, or with an expired `VERCEL_OIDC_TOKEN` as the only token, nothing runs (the
    blocked line `sandbox: <why>`); `node judge/baseline.mjs <class>` AGAIN for every candidate class (grown/ is
    untouched until promote, so select grades against the organism as it is now; the score goes to the final
    line under `baseline`; a class whose baseline fails is a blocked line and its candidates are not judged);
    for EVERY candidate (a dir holding cell.mjs; class off the source by `/class\s*:\s*['"]([a-z0-9-]+)['"]/`,
    then brief.md, then plan.json) `grow/sandbox.mjs run <dir> --heldout judge/heldout/<class>.jsonl --control
    judge/control.jsonl --out <dir>/result.json` (`--backend here` added when the backend is here), then
    `judge/select.mjs <dir>` (never after a runner exit that is not 0: exits 2 to 5 are usage, token, refusal
    and sandbox API, a blocked line), all before any promote. When NO candidate got a verdict the generation
    is VOID: no store, no promote, no build, no record in grown/generations.json, no commit, every miss open
    again, and the same generation number runs next time. Else per lane `grow/store.mjs shard` (non-fatal)
    then `promote` (a failure stops the build, the record, the suites and the commit); `web/build.mjs`; the
    tournament (survivors, then candidates, then name) into `grown/generations.json`; the five suites with the
    tap reporter (a failure blocks the commit); `git add -- grown/ web/dist/`, nothing staged gives "nothing to
    commit", else a commit as jayden with the message `gen <n>: <s> of <c> survived, parent <lane>` and the
    trailer, pathspec `grown/ web/dist/`; `git push`; the marks (a class's misses `grown` with the cell id only
    when its survivor was promoted and nothing blocked, every other miss `open` again). Final line:
    `{ generation, lanes, candidates, survivors, parent, baseline, store, promoted, built, tests, committed,
    pushed, misses: { growing, grown, reopened }, self: "not wired", dream: "not wired", blocked, at }`.
    `--dry` prints `{ dry, generation, backend, why, candidates, would, at }` (the baselines first in `would`)
    and spawns nothing.
- `test/grow-generation.test.mjs`: 16 tests on a temporary root (copies of grow/contract.mjs, grow/misses.mjs,
  act/converse.mjs and CLAUDE.md; a fake seed with ids 1, seed-2, 3 and 4; stubs for judge/verify.mjs,
  judge/baseline.mjs, judge/select.mjs, grow/sandbox.mjs, grow/store.mjs, web/build.mjs and tools/fetch-pack.mjs
  that log each call; dev and held-out files with SENTINEL prompts; five trivial suites). No network, no token,
  no real store, no real grown/, no git (finish runs with `--no-commit` or is blocked before git).

## Deviations from the item text, and why

- finish measures every candidate class's baseline again before the sandbox (the skeptic's stale-baseline
  note): judge/select.mjs refuses a baseline whose organismPrint (grown/ plus the import closure of
  act/prompt.mjs and seeds/basic.mjs) changed, and board 37 edits act/prompt.mjs between prepare and finish;
  without the second measure every candidate would lose and a 0-survivor generation would be committed. The
  brief keeps the prepare score; the final line gains one key GROW.md does not name, `baseline`, the score the
  survivors had to beat.
- A generation in which no candidate got a verdict is void, not a 0-survivor tournament (the skeptic's SK7
  note: an expired token made every run exit 3, the name tie-break chose parent baked and the generation
  number moved on). An expired OIDC token is refused by finish before any spawn; `status` still prints
  backend vercel with the expiry in `why`.
- The next generation is one past the MAX of grown/index.json `generation` and grown/generations.json, so a
  zero-survivor generation (which promotes nothing) does not replay its number.
- A generation with no candidate or no backend is not recorded in grown/generations.json and commits nothing.
- A build failure blocks the suites and the commit, like a promote failure.
- `status --gh none` skips `gh auth status` (the tests use it; a real run calls gh).
- The three-test rule and the directory checks in `validate` apply only inside `state/grow/gen-<n>/<lane>/<id>/`:
  the echo fixture declares 2 tests and must stay valid.
- Marks: grow/misses.mjs `mark` takes growing, grown and skipped and file ids matching its FILE_ID_RE; the
  driver sends those through the CLI and applies the same patch itself for `open` (the reopen), since the CLI
  refuses that status. For Supabase rows only integer ids go to the CLI, and a refusal is a blocked line.
- `git status --short grow/seed-misses.jsonl` cannot print nothing on this tree: grow/ is untracked (`??`), so
  git never sees a modification. The seed file's sha256 before and after a prepare run is the proof instead.

## Real runs (2026-09-30, fixer pass; the printed lines unchanged; the OIDC token never printed, piped through sed)

```
$ node --env-file=.env.local grow/generation.mjs status
{"generation":1,"backend":"vercel","why":"VERCEL_OIDC_TOKEN is set (valid until 2026-10-01T08:49:41.000Z): every candidate runs in a Vercel Sandbox (network deny-all)","tokens":{"VERCEL_TOKEN":false,"VERCEL_OIDC_TOKEN":true,"GITHUB_TOKEN":false,"SUPABASE_SERVICE_KEY":false,"SUPABASE_URL":false},"gh":true,"misses":"seed","lock":"LOCK OK 10 files","lockOk":true,"grown":0,"pack":"present","at":"2026-09-30T21:59:44.799Z"}
```

```
$ sha256sum grow/seed-misses.jsonl
fc05f86e4deccde0645f9eb9e149a5132f042161822fda4711f2709cc30d1614 *grow/seed-misses.jsonl
$ node grow/generation.mjs prepare --gen 1 --misses grow/seed-misses.jsonl
{"generation":1,"classes":4,"briefs":8,"misses":{"read":4,"growing":4,"skipped":0,"source":"file"},"baseline":{"fragment":0,"mash":0,"capital-of":0,"essay-ocean-salt":0},"parent":null,"plan":"state/grow/gen-1/plan.json","blocked":[],"at":"2026-09-30T21:59:50.519Z"}
$ sha256sum grow/seed-misses.jsonl
fc05f86e4deccde0645f9eb9e149a5132f042161822fda4711f2709cc30d1614 *grow/seed-misses.jsonl
$ git status --short grow/seed-misses.jsonl
?? grow/seed-misses.jsonl
```

```
$ ls state/grow/gen-1/direct state/grow/gen-1/baked
state/grow/gen-1/baked:
brief-capital-of.md
brief-essay-ocean-salt.md
brief-fragment.md
brief-mash.md
capital-of-baked-g1
essay-ocean-salt-baked-g1
fragment-baked-g1
mash-baked-g1

state/grow/gen-1/direct:
brief-capital-of.md
brief-essay-ocean-salt.md
brief-fragment.md
brief-mash.md
capital-of-direct-g1
essay-ocean-salt-direct-g1
fragment-direct-g1
mash-direct-g1
$ wc -c state/grow/gen-1/*/brief-*.md
 5670 state/grow/gen-1/baked/brief-capital-of.md
 6585 state/grow/gen-1/baked/brief-essay-ocean-salt.md
 5684 state/grow/gen-1/baked/brief-fragment.md
 5955 state/grow/gen-1/baked/brief-mash.md
 5351 state/grow/gen-1/direct/brief-capital-of.md
 6266 state/grow/gen-1/direct/brief-essay-ocean-salt.md
 5365 state/grow/gen-1/direct/brief-fragment.md
 5636 state/grow/gen-1/direct/brief-mash.md
46512 total
```

The four direct briefs, snapshotted before this prepare, were byte-identical after it (`cmp -s` printed
`same` four times): the brief code did not change in this pass. The candidate directories were written by the
arms before this pass; prepare wrote only the briefs, plan.json, misses.jsonl and blocked.txt beside them.

The brief bar (each dev q of judge/dev/<class>.jsonl through `grep -c -F` in its brief, the minimum over the
rows; then the lines naming state/grow/baseline, deduplicated):

```
state/grow/gen-1/direct/brief-fragment.md dev_qs=8 min_grep_c=1 baseline_lines=1
state/grow/gen-1/baked/brief-fragment.md dev_qs=8 min_grep_c=1 baseline_lines=1
state/grow/gen-1/direct/brief-mash.md dev_qs=8 min_grep_c=1 baseline_lines=1
state/grow/gen-1/baked/brief-mash.md dev_qs=8 min_grep_c=1 baseline_lines=1
state/grow/gen-1/direct/brief-capital-of.md dev_qs=8 min_grep_c=1 baseline_lines=1
state/grow/gen-1/baked/brief-capital-of.md dev_qs=8 min_grep_c=1 baseline_lines=1
state/grow/gen-1/direct/brief-essay-ocean-salt.md dev_qs=7 min_grep_c=1 baseline_lines=1
state/grow/gen-1/baked/brief-essay-ocean-salt.md dev_qs=7 min_grep_c=1 baseline_lines=1
Never open, read, list or grep judge/heldout/, judge/control.jsonl or state/grow/baseline/: a survivor is real only because no arm saw the rows it is graded on. Do not open the other arms' directories under state/grow/gen-1/.
```

```
$ node grow/generation.mjs validate grow/fixtures/echo-cell
{"ok":true,"errors":[],"id":"echo-fixture","class":"fixture","generation":1,"lane":"fixture","examples":1}
$ node grow/generation.mjs ask "What is the capital of France?"
{"q":"What is the capital of France?","text":"from memory (knowledge tier, article \"Capital of France\", confidence 1 at floor 0.2), best first:\n- [knowledge \"Capital of France\" categories sim 0.741] Categories: Capital of France; History of France.\n- [knowledge \"Capital of France\" lead sim 0.6292] In the course of history, the national capital has been in many locations other than Paris.\n- [knowledge \"Île-de-France\" lead sim 0.5024] It is also the capital city of France.\nanswer [knowledge \"Capital of France\"]: paris","route":"knowledge","via":"ask","knowledge":"bench/fixtures/wiki/pack-200"}
```

The text names Paris; the route is `knowledge`.

`node grow/generation.mjs finish --gen 1 --dry` exited 0 with one line, summarised by node (the line holds the
8 candidates and 29 `would` commands):

```
{"dry":true,"generation":1,"backend":"none","n":8,"classFrom":["cell.mjs"],"wouldN":29}
node judge/baseline.mjs capital-of
node judge/baseline.mjs essay-ocean-salt
node judge/baseline.mjs fragment
node judge/baseline.mjs mash
node grow/sandbox.mjs run state/grow/gen-1/direct/capital-of-direct-g1 --heldout judge/heldout/capital-of.jsonl --control judge/control.jsonl --out state/grow/gen-1/direct/capital-of-direct-g1/result.json
node judge/select.mjs state/grow/gen-1/direct/capital-of-direct-g1
...
node grow/store.mjs promote 1 direct --dir state/grow/gen-1/direct
node grow/store.mjs shard 1 baked --dir state/grow/gen-1/baked
node grow/store.mjs promote 1 baked --dir state/grow/gen-1/baked
node web/build.mjs
node --test --test-reporter=tap test/grow-sandbox.test.mjs test/grow-store.test.mjs test/judge.test.mjs test/grow-misses.test.mjs test/ask-http.test.mjs
git add -- grown/ web/dist/
git commit -m "gen 1: <survivors> of <candidates> survived, parent <parent>" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -- grown/ web/dist/
git push
```

With .env.local: `{"dry":true,"backend":"vercel","why":"VERCEL_OIDC_TOKEN is set (valid until 2026-10-01T08:49:41.000Z): every candidate runs in a Vercel Sandbox (network deny-all)","n":8,"wouldN":29}`.
`find state/grow/gen-1 -name result.json -o -name verdict.json | wc -l` printed `0`. finish without --dry was
never run. `validate` on each of the 8 arm candidates printed `"ok":true` with `"errors":[]` (examples 8, 7
for essay-ocean-salt).

## Tests

```
$ node --test --test-reporter=tap test/grow-generation.test.mjs
# tests 27
# pass 27
# fail 0
```

31 mutants of grow/generation.mjs (state/board38/driver/mutants.mjs: each replacement matched exactly once in the
source, applied to a scratch copy of the tree layout, the same test file run against it), then the unmutated copy:

```
validate: test.mjs import check removed: # pass 26 # fail 1 KILLED
validate: foreign test import allowed: # pass 26 # fail 1 KILLED
validate: examples.jsonl coverage removed: # pass 26 # fail 1 KILLED
validate: examples coverage removed: # pass 26 # fail 1 KILLED
validate: missing test.mjs ok: # pass 26 # fail 1 KILLED
validate: row without expect ok: # pass 26 # fail 1 KILLED
validate: meta.id check removed: # pass 26 # fail 1 KILLED
validate: dev rows check removed: # pass 26 # fail 1 KILLED
validate: 2 tests enough: # pass 26 # fail 1 KILLED
finish: shard failure fatal: # pass 26 # fail 1 KILLED
finish: sandbox failure ignored (select anyway): # pass 25 # fail 2 KILLED
finish: select before sandbox: # pass 21 # fail 6 KILLED
finish: promote before shard: # pass 23 # fail 4 KILLED
candidates: brief.md fallback removed: # pass 26 # fail 1 KILLED
candidates: plan.json fallback removed: # pass 26 # fail 1 KILLED
finish: class-less candidate still run: # pass 26 # fail 1 KILLED
prepare: class kept without dev set: # pass 26 # fail 1 KILLED
prepare: pack failure fatal: # pass 26 # fail 1 KILLED
finish: --no-build ignored: # pass 26 # fail 1 KILLED
finish: --no-tests ignored: # pass 25 # fail 2 KILLED
finish: build failure does not block: # pass 26 # fail 1 KILLED
finish: generations.json not written: # pass 25 # fail 2 KILLED
finish: dry spawns select: # pass 26 # fail 1 KILLED
finish: promote failure no longer blocks: # pass 26 # fail 1 KILLED
finish: void removed: # pass 26 # fail 1 KILLED
finish: expired token ignored: # pass 26 # fail 1 KILLED
finish: baseline failure ignored: # pass 26 # fail 1 KILLED
finish: baseline not in final line: # pass 25 # fail 2 KILLED
status: grown always 0: # pass 26 # fail 1 KILLED
prepare: parent gets no second arm: # pass 26 # fail 1 KILLED
status: tokens not booleans: # pass 25 # fail 2 KILLED
control (unmutated copy): # pass 27 # fail 0
```

The 20 the skeptic listed are among them (the six it saw killed, and the fourteen it saw survive: the test.mjs
and examples checks of validate, the sandbox and shard failure paths, both call orders, the brief.md fallback,
the class without a dev set, the pack failure, --no-build, --no-tests, the build failure, the grown count);
the rest guard the new paths (void, expired token, the second baseline).

## What remains

- GROW.md (not this item's file) does not yet say that finish measures the baseline again, that a generation
  with no verdict is void, or that the final line carries `baseline`; the orchestrator adds a line to steps 3
  and 5 if it wants the cortex to know.
- A partial infrastructure failure (one runner exit that is not 0 while another candidate is judged) still
  counts that candidate in its lane with no survivor, as GROW.md step 3 says; the tournament can be decided by
  it. Only the all-failed case is void.
- grow/misses.mjs `mark` refuses `--status open`, so a Supabase miss is not reopened after a generation (the
  gen copy is); the refusal lands in blocked.txt. Its owner adds `open` to MARKS.
- The OIDC token in .env.local lives until 2026-10-01T08:49:41.000Z (the status line); after it, finish runs
  nothing and says `blocked: the sandbox token expired`. The cloud heartbeat needs `VERCEL_TOKEN` or a routine
  VM (`--backend here`).
- web/build.mjs does not read grown/, so the tab layer does not yet carry the cells finish promotes.
- The commit and push paths are untested: tests may not touch git.
- `validate` imports cell.mjs once the source passes the contract; run on a PC that is candidate code outside
  the sandbox (the SELECTION run is the sandbox).
- Steps 6 and 7 are "not wired" until grow/self.mjs and grow/dream.mjs exist.
