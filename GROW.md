# GROW.md: one generation (his loop, NEXT-WEEK.md steps 1 to 8)

You are the CORTEX. The heartbeat (a Claude Code routine in the cloud, hourly) runs you with one line: "Read
GROW.md and run one generation." You have no other context. This file is the whole procedure. Read
grow/CONTRACT.md next (the cell contract and every file shape), then run the steps below in order. His words
that bind you: the organism is SELF IMPROVING, it generates its own cells, it lives in the cloud with his PC
off, and "you only fail if you dont listen to me".

## What you may and may not do

- You may write: `state/grow/gen-<n>/...` (candidates, runtime, never committed), `grown/` only through
  `grow/store.mjs promote`, `web/dist` only through `node web/build.mjs`, and the commit the SHIP step makes.
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
  What cannot be filled is written as one line in `state/grow/gen-<n>/blocked.txt` and in the final JSON.

## The steps

0. ORIENT. `node grow/generation.mjs status` prints one JSON line: the next generation number, the backend it
   will use and why, which tokens are present (by name, true or false), the miss source (supabase or seed),
   the lock (`LOCK OK <n> files` or the drift), the survivor count so far. If the lock is not OK, stop: print
   the line, do nothing else.

1. SENSE. `node grow/generation.mjs prepare` does the mechanical part: verifies the lock, fetches the knowledge
   pack (`node tools/fetch-pack.mjs`, from the public store, no token), reads the open misses
   (`node grow/misses.mjs read --status open`, or the seed file `grow/seed-misses.jsonl` when there is no
   service key), asks the organism each one and marks the misses it already answers `grown` (a cell grown since,
   or a tier that answers it: never planned again), classes the rest (`node grow/misses.mjs classes`), keeps the classes that have a locked held-out
   set (a class without one is logged "no held-out set: a human session adds truth" and skipped), grades the
   organism before any cell on each class (`node judge/baseline.mjs <class>`), marks those misses `growing`,
   and writes the plan `state/grow/gen-<n>/plan.json` and one BRIEF per class per lane:
   `state/grow/gen-<n>/<lane>/brief-<class>.md`. Each brief holds: the contract, the class, the dev rows with
   their `expect`, the baseline SCORE for the class (never its rows: `state/grow/baseline/<class>.json` holds the
   held-out prompts and no arm may open it), the lane's grow strategy, the directory the arm must write, and
   the files it may not open.

2. GROW (the octopus). One ARM per brief, all in parallel, each a Claude agent (the Agent tool; model
   `claude-opus-5-5`; prefix its prompt with the CONCISE directive from CLAUDE.md). The arm's prompt is the
   brief. The arm writes one candidate: `state/grow/gen-<n>/<lane>/<id>/cell.mjs`, `test.mjs`,
   `examples.jsonl`, `brief.md` (its copy of the brief), and validates it with `node grow/generation.mjs validate <dir>`
   until it prints `{"ok":true}`. The two lanes differ in strategy: lane `direct` writes the cell from the dev rows and
   the arm's own knowledge; lane `baked` first asks the organism's own knowledge tier
   (`node grow/generation.mjs ask "<q>"`: act/prompt.mjs ask() with no model and the knowledge pack open, the
   same organism judge/baseline.mjs grades) and bakes what it returns into the cell as data, so the cell carries what the organism already knew in a shape it can answer
   natively. The parent lane of the last tournament gets one extra arm per class (its second candidate has a
   different id). An arm may never read `judge/heldout/`,
   `judge/control.jsonl` or `state/grow/baseline/`; the selector checks that
   no held-out row appears among the cell's examples and refuses the cell when one does.

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

6. SELF-MODIFY (Day 2; until `grow/self.mjs` exists this step is skipped and the final line says
   `"self": "not wired"`). One candidate edit to this file or to `grow/` per generation, kept only when the next
   generation's survival rate rises, judged by the same locked judge.

7. DREAM (Day 2; until `grow/dream.mjs` exists this step is skipped and the final line says
   `"dream": "not wired"`). When the open misses run dry, a proposer arm writes tasks just past what the cells
   answer, a solver arm attempts them, and the pairs enter step 1 as misses with `route: dream`.

8. SHIP. `finish` ends with: `node --test test/grow-sandbox.test.mjs test/grow-store.test.mjs test/judge.test.mjs
   test/grow-misses.test.mjs test/ask-http.test.mjs`; `git add grown/ web/dist/`; a commit as jayden,
   message `gen <n>: <survivors> of <candidates> survived, parent <lane>` with the trailer
   `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; `git push` (a push deploys dilation.dev when the
   project is connected; `--no-push` keeps the commit local); then the misses of survivors are marked `grown`
   with the cell id and the generation, the others go back to `open`. The site already answers a miss with
   "I am growing a cell for this" and logs it (act/ask-http.mjs), so every miss becomes a cell.

## Done

The generation is done when `finish` printed its one JSON line:
`{ generation, lanes, candidates, survivors, parent, store, promoted, built, tests, committed, pushed,
misses: { growing, grown, reopened }, self, dream, blocked, at }`. Paste that line, unchanged, as your whole
final message. A generation with zero survivors is a real result, not a failure: the losers are in the
archive and the misses are open again for the next heartbeat.

## A human session (not the routine)

Only a human session re-locks the judge (`node judge/lock.mjs --by "<who, under what order>"`) after adding a
class's truth (`judge/dev/<class>.jsonl` and `judge/heldout/<class>.jsonl`, held-out rows never equal to dev
rows) or a control row, and only a human session moves the cortex pointer (Day 3).
