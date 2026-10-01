# GROW.md: one generation (his loop, NEXT-WEEK.md steps 1 to 8)

You are the CORTEX. The heartbeat (a Claude Code routine in the cloud, hourly) runs you with one line: "Read
GROW.md and run one generation." You have no other context. This file is the whole procedure. Read
grow/CONTRACT.md next (the cell contract and every file shape), then run the steps below in order. His words
that bind you: the organism is SELF IMPROVING, it generates its own cells, it lives in the cloud with his PC
off, and "you only fail if you dont listen to me".

## What you may and may not do

- You may write: `work/grow/gen-<n>/...` (candidates, runtime, never committed), `grown/` only through
  `grow/store.mjs promote`, `web/dist` only through `node web/build.mjs`, and the commit the SHIP step makes.
  `work/` is the generation's own directory: every brief, candidate and verdict lives there and every arm may
  read its brief there. `state/` is not yours: the settings deny reading it, and you never go around a denied
  path (a step that seems to need one is written in `blocked.txt` instead).
- You may NOT edit `judge/` or `grow/contract.mjs` (the judge is LOCKED; `node judge/verify.mjs` proves it
  every run and a drifted judge stops the generation). You may NOT open `judge/heldout/` or
  `judge/control.jsonl`: the held-out truth is what makes a survivor real. An arm reads `judge/dev/<class>.jsonl`
  only. Self-modification (step 6) proposes changes to THIS file and `grow/`, never to the judge.
- Candidates run in the cloud sandbox only (`grow/sandbox.mjs`): a Vercel Sandbox when `VERCEL_TOKEN` or
  `VERCEL_OIDC_TOKEN` is set, else the routine's own VM (`--backend here`, allowed only when
  `CLAUDE_CODE_REMOTE`, `GITHUB_ACTIONS`, `VERCEL` or `CI` is set). Never on his PC: on a PC the runner
  refuses (exit 4) and the generation stops there.
- Tokens are read by NAME from the environment and never printed, never written to a file, never in a commit.
- Never quote a number a command did not print. No em-dashes. Stamps come from the commands' `at` fields.
- A gap fills itself where it can: no service key means the seed misses; no store token means the shard is
  skipped with a reason and the survivors still promote; no push means the commit waits for the next run.
  What cannot be filled is written as one line in `work/grow/gen-<n>/blocked.txt` and in the final JSON.
- The VM's own node runs every step (node 22 or newer: the test flag is chosen by version): never install another.
- A `finish` that stopped before its commit (a red suite, a failed build) is run AGAIN with the same command, once
  the cause is gone: it reuses the selection it already made (`"selection": "reused: ..."`) instead of grading
  the candidates against an organism that already holds this generation's survivors. Never edit
  `grown/generations.json`, a verdict or `selection.json` by hand, and never pass `--rejudge`.

## The steps

0. ORIENT. `node grow/generation.mjs status` prints one JSON line: the next generation number, the backend it
   will use and why, which tokens are present (by name, true or false), the miss source (supabase or seed),
   the lock (`LOCK OK <n> files` or the drift), the survivor count so far. If the lock is not OK, stop: print
   the line, do nothing else.

1. SENSE. `node grow/generation.mjs prepare` does the mechanical part: verifies the lock, fetches the knowledge
   pack (`node tools/fetch-pack.mjs`, from the public store, no token), reads the open misses
   (`node grow/misses.mjs read --status open`, or the seed file `grow/seed-misses.jsonl` when there is no
   service key) plus, every generation, the CURRICULUM `grow/curriculum.jsonl` (Day 2: one seed set per domain of
   "everything", each row carrying its class; a human session writes it) and the DREAMS `grow/dreams.jsonl` (step 7's
   pairs, `route: dream`, each with the solver's answer and the proposer's expect), both read as open misses until the
   organism answers them (the driver never writes those two files), asks the organism each one and marks the misses it already answers `grown` (a cell grown since,
   or a tier that answers it: never planned again), classes the rest (`node grow/misses.mjs classes`), keeps the classes that have a locked held-out
   set (a class without one is logged "no held-out set: a human session adds truth" and skipped), grades the
   organism before any cell on each class (`node judge/baseline.mjs <class>`), marks those misses `growing`,
   and writes the plan `work/grow/gen-<n>/plan.json` and one BRIEF per class per lane:
   `work/grow/gen-<n>/<lane>/brief-<class>.md`. Each brief holds: the contract, the class, the dev rows with
   their `expect`, the baseline SCORE for the class (never its rows: `state/grow/baseline/<class>.json` holds the
   held-out prompts and no arm may open it), the lane's grow strategy, the directory the arm must write, and
   the files it may not open.

2. GROW (the octopus). One ARM per brief, all in parallel, each a Claude agent (the Agent tool; model
   `claude-opus-5-5`; prefix its prompt with the CONCISE directive from CLAUDE.md). The arm's prompt is the
   brief. The arm writes one candidate: `work/grow/gen-<n>/<lane>/<id>/cell.mjs`, `test.mjs`,
   `examples.jsonl`, `brief.md` (its copy of the brief), and validates it with `node grow/generation.mjs validate <dir>`
   until it prints `{"ok":true}`. The two lanes differ in strategy: lane `direct` writes the cell from the dev rows and
   the arm's own knowledge; lane `baked` first asks the organism's own knowledge tier
   (`node grow/generation.mjs ask "<q>"`: act/prompt.mjs ask() with no model and the knowledge pack open, the
   same organism judge/baseline.mjs grades) and bakes what it returns into the cell as data, so the cell carries what the organism already knew in a shape it can answer
   natively. The parent lane of the last tournament gets one extra arm per class (its second candidate has a
   different id). A brief whose class has dreamed tasks lists them under "Dreamed tasks" with the solver's answer:
   misses the cell grows for, never examples. The eight domains of "everything" (code, math, writing, science, tools,
   planning, data, conversation) each have a curriculum class with a locked held-out set, so every generation has an arm
   per domain while its curriculum rows are open. An arm may never read `judge/heldout/`,
   `judge/control.jsonl` or `state/grow/baseline/`; the selector checks that
   no held-out row appears among the cell's examples and refuses the cell when one does.

2b. THE BUILDER ARM (Day 2). A miss of class `build` ("make me a todo app") is not a cell class: `prepare` writes ONE
   build brief per app, `work/grow/gen-<n>/build/brief-<slug>.md`, and the driver's own
   `work/grow/gen-<n>/build/<slug>/app.json` ({ slug, name, prompt, generation, misses }). One arm per build brief
   (same agent, same CONCISE prefix): it writes `index.html`, `app.mjs`, `test.mjs` and `brief.md` under that
   directory and nothing else (the rules are in the brief and in grow/probe-app.mjs; `node grow/build.mjs validate <dir>`
   must print {"ok":true}). `finish` runs the app in the sandbox (`node grow/sandbox.mjs run <dir> --app`), judges it
   (`node grow/build.mjs judge <dir>`: validate ok, its own tests pass with 0 failures and at least 3 passed, exit 0) and
   promotes a survivor (`node grow/build.mjs promote <n> <slug>`): the app is served at `/apps/<slug>/` of the site,
   listed in `grown/apps.json` and `grown/apps.mjs`, and the site answers the request with that URL (act/ask-http.mjs,
   from `app`). The misses are grown with the cell `app:<slug>`. An app already served grows its misses without an
   arm. The apps and the cell tournament are separate: a failing app is a loser, never a void, and a generation with
   no cell candidate still ships a built app (the final line has `apps: { candidates, built, promoted, slugs }`).

3. SANDBOX. `node grow/generation.mjs finish` runs every candidate directory through
   `node grow/sandbox.mjs run <dir> --heldout judge/heldout/<class>.jsonl --control judge/control.jsonl`
   (the runner sends the held-out prompts only, never their `expect`; network deny-all; result.json in the
   candidate directory). A candidate whose run fails gets a result.json with `error` and is a loser.

4. SELECT. For every candidate, `node judge/select.mjs <dir>` (the lock first, then the whole conjunction in
   grow/CONTRACT.md; `verdict.json` in the candidate directory; `why` names every failed clause). Losers stay
   in the lane directory and go to the store as the archive (recombination later).

5. MULTIPLY AND DUPLICATE. Per lane: `node grow/store.mjs shard <n> <lane>` (the whole lane, winners and
   losers, to j4ydenlxl/brain-cells through the contents API; skipped with a reason without `gh` or
   `GITHUB_TOKEN`), then `node grow/store.mjs promote <n> <lane>` (survivors into `grown/cells/`,
   `grown/index.json`, the regenerated `grown/index.mjs`; proven by import before it counts). ONE cell per
   class in `grown/`, the champion: a survivor is promoted only when its held-out score is above the class's
   current cell (the parent lane promotes first and wins ties), the cell it beats is retired to the archive,
   and every other survivor stays in the archive shard (`archived`, with the id that holds its class); an id
   `grown/` already holds is skipped, never overwritten, so a re-run of a half-landed generation converges. Then
   `node web/build.mjs` so the tab layer carries them. The TOURNAMENT: the lane with more survivors is the
   parent of the next generation; `finish` records it in `grown/generations.json` (`{ generations: [{
   generation, at, lanes: { <lane>: { candidates, survivors } }, parent, misses }] }`), and `prepare` reads it
   to hand the parent lane its extra arms.

6. SELF-MODIFY (Day 3, wired: `grow/self.mjs`). The procedure is a candidate too: ONE edit per generation to this
   file or to one existing `.mjs` or `.md` under `grow/` (never `grow/self.mjs`, never a file `judge/LOCK.json`
   names), kept only when the next generation's survival rate rises, judged by the same locked judge.
   - The verdict is `finish`'s: right after it records the tournament it runs `node grow/self.mjs judge --gen <n>`.
     A pending trial is `kept` when this generation's rate (survivors / candidates over every lane) is ABOVE the
     trial's baseline, else `reverted` (the file is written back and the commit of step 8 carries it); `superseded`
     when someone changed the file meanwhile; `pending` when this generation recorded no tournament. The final line
     has `self`: `"none"`, or `{ verdict, target, baseline, rate, reason }`.
   - The next trial, after step 8 and before step 7: `node grow/self.mjs propose --gen <n>` (n: the generation
     `finish` just printed). `"brief": null` with `blocked` lines means no trial this generation (one is pending, no
     tournament yet, or every candidate survived): go to step 7. Else it wrote the SELF BRIEF,
     `work/grow/gen-<n>/self/brief.md`, with this generation's evidence (the tournaments, every candidate's verdict
     line, the blocked lines, the earlier trials). One arm, as in step 2 (an Opus 5.5 agent, the brief as its whole
     prompt; the CONCISE directive is in it): it writes `work/grow/gen-<n>/self/candidate.json` ({ target, why,
     hypothesis }) and the WHOLE new file under `work/grow/gen-<n>/self/file/<target>`, and runs
     `node grow/self.mjs check --gen <n>` until it prints `"ok":true` (the target rule, `node --check`, the suites on a
     scratch copy of the tree with the file in place). Then `node grow/self.mjs apply --gen <n> --commit`: the file
     enters the tree as a TRIAL, recorded in `grown/self.json` with the baseline, committed and pushed as jayden (a
     cloud checkout dies with its session: an unpushed trial never happened). The next generation runs under it and
     its `finish` judges it. `node grow/self.mjs status` prints the pending trial and the history.

7. DREAM (Day 2, wired: `grow/dream.mjs`). After step 8, `node grow/dream.mjs propose --gen <n>` writes one DREAM
   BRIEF per class that has a locked held-out set: `work/grow/gen-<n>/dream/brief-<class>.md`. One arm per brief, as
   in step 2 (an Opus 5.5 agent, the CONCISE directive first, the brief as its whole prompt): the proposer half writes
   4 tasks in the class's shape just past what the organism answers today, the solver half answers each one, into
   `work/grow/gen-<n>/dream/<class>.jsonl` ({ q, expect, answer } a line), checked with `node grow/dream.mjs check <file>`
   until `"ok":true`. Then `node grow/dream.mjs collect --gen <n> --commit` asks the organism every task, drops the ones it
   answers and the ones dreamed before, appends the rest to `grow/dreams.jsonl` as misses with `route: dream`, and commits
   and pushes that file as jayden (a cloud checkout dies with its session: an unpushed dream is lost). The next
   generation's step 1 reads them, so a heartbeat with no open miss still grows. `finish` reports `dream` from
   `work/grow/gen-<n>/dream/collect.json` when collect of this generation ran before it (a re-run), else `"none"`.

8. SHIP. `finish` ends with: `node --test test/grow-sandbox.test.mjs test/grow-store.test.mjs test/judge.test.mjs
   test/grow-misses.test.mjs test/ask-http.test.mjs`; `git add grown/ web/dist/ grow/dreams.jsonl` (the dreams file
   when it exists); a commit as jayden,
   message `gen <n>: <survivors> of <candidates> survived, parent <lane>` with the trailer
   `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; the push (`git push`, or `git push origin HEAD:master` on a checkout with no upstream, with one rebase when
   the remote moved: `finish` does all three itself; a push deploys dilation.dev when the
   project is connected; `--no-push` keeps the commit local); then the misses of survivors are marked `grown`
   with the cell id and the generation, the others go back to `open`. The site already answers a miss with
   "I am growing a cell for this" and logs it (act/ask-http.mjs), so every miss becomes a cell.

## Done

The generation is done when `finish` printed its one JSON line:
`{ generation, lanes, candidates, survivors, parent, baseline, selection, store, promoted, built, tests, committed,
pushed, apps, misses: { growing, grown, reopened }, self, cortex, dream, blocked, at }`. Paste that line, unchanged, as your whole
final message. A generation with zero survivors is a real result, not a failure: the losers are in the
archive and the misses are open again for the next heartbeat.

## A human session (not the routine)

Only a human session re-locks the judge (`node judge/lock.mjs --by "<who, under what order>"`) after adding a
class's truth (`judge/dev/<class>.jsonl` and `judge/heldout/<class>.jsonl`, held-out rows never equal to dev
rows) or a control row, and only a human session moves the cortex pointer (Day 3).
