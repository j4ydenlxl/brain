# notes/cloud-host.md: the host item (Board 16, his P13)

His P13, verbatim: "It should live 24/7 on the cloud remember Its literally a sandboxed ARTIFICIAL SUPERINTELLIGENCE".
His words of 2026-09-25, relayed: "set up the p13 idk how idk".
His words of 2026-09-17: "Make sure nobody can copy our ideas".

Author: board 16 builder, host item, model off (no Ollama call); the Measured, OPEN and Files sections were rewritten by the fix stage from its own run. The manual section is "The host: GitHub Actions on his account" in docs/CLOUD.md; this file is the builder's record.

## The assumption (his to overturn)

The host is **GitHub Actions on his account, in a PRIVATE repository**. This is the orchestrator's assumption, not his words. The reasons: gh 2.96.0 is installed here and needs one `gh auth login`; Docker is absent here but present on every ubuntu-latest runner; a private repository follows his 2026-09-17 order; no card, no server, no inbound port. The test of the assumption is his confirmation. A public repository is a flag (`--public --yes`) that prints his 2026-09-17 words before it does anything.

## Files

Written by this item: `.github/workflows/cloud.yml`, `tools/cloud-github.mjs`, `bench/cloud-host.mjs`, `test/cloud-host.test.mjs`, this note, one section of `docs/CLOUD.md` and its table-of-contents line, and one line of `.dockerignore`: `state-cloud` (the pattern `state` does not match `state-cloud/`, so without it the checkpoint the workflow restores into `state-cloud/` would be baked into the image).

`.gitignore` is NOT this item's file. The builder changed it (`bench/fixtures/` became `bench/fixtures/*` plus `!bench/fixtures/answer-questions.json`); the verify plane marked that a blocker; the orchestrator committed those lines in bd04dac. The fix stage did not touch `.gitignore`: nothing of this item depends on those lines any more. The deploy and the ruler name `git add -f bench/fixtures/answer-questions.json`, which commits the file whether or not `.gitignore` lets it in. Keeping or reverting the lines is the orchestrator's call. At bd04dac the file is still untracked, so the committed tree still does not boot (measured below).

## What is measured, and from where

- **From the host** (only after his `gh auth login` and the first run; read with `gh run list` and `gh run download`, read only): runs and conclusions in 7 days, uptime as a fraction of 10,080 minutes, Actions minutes, and from the newest run health ok, restarts inside the job, ticks per hour, checkpoint age and bytes, and the LADDER line. Until then every host row prints `not measured: <cause>` and the verdict's barMet is false. On 2026-09-25 gh read as logged in on this machine and `origin` is `j4ydenlxl/brain` (PRIVATE, default branch master); no run exists, because cloud.yml is not committed.
- **On this PC**: the workflow parses (a zero-dependency YAML reader in tools/cloud-github.mjs, anchors and merge keys included, so compose.yaml parses too) and passes its structural checks; every tree file it names exists; with `--checkout-trial S` the committed tree (`git archive HEAD`: no .git, no state, nothing untracked) boots natively under bin/serve.mjs with compose.yaml's environment, the ladder off and the model endpoint on a closed local port. With `--counterfactual FILE --repeat N` the same HEAD plus that working-tree file boots N more times, each in its own process and copy, and the run-to-run band of the N is printed beside the HEAD trial (the control).
- **Not measured anywhere yet**: the image build on a runner, the container under the caps on a runner, the cache round trip between two runs, the ladder container on a runner, the Supabase upload, the relay, and the real minutes a run bills.

## Deviations from the brief, with the reason

- **The ladder is a second container after the organism stops, not `docker exec` into the live one.** bin/serve.mjs says the ladder cannot share 512 MB with a live daemon, and `bench/ladder.mjs --quick` alone peaked at 502.7 MB on this PC (measured earlier in this item's session). The ladder container gets 1 GB and runs under `tools/budget.mjs --ram-mb 960`, with the egress guard loaded by `--import` of bin/serve.mjs.
- **The cache is saved only when a checkpoint exists** (`state-cloud/cloud/snapshot.json`), so a run that died before its first checkpoint never becomes the newest cache and never erases the one before it.
- **A third dispatch input, `ladder`** (default false), runs the ladder in a dispatched run; a scheduled run always runs it.

## Cost arithmetic (GitHub Free; an assumption until a run prints its minutes)

- A private repository gets 2,000 Actions minutes a month. One daily run of 55 minutes: 2,000 / 55 is about 36 runs, so about 36 days. With about 5 minutes of build and upload per run, `node tools/cloud-github.mjs --dry` prints 1,800 minutes a month: it fits.
- A relay (a run that dispatches the next, 24 hours a day) spends 1,440 minutes a day: 2,000 / 1,440 = 1.39 days on a private repository (the tool prints this and refuses a private relay without `--yes`). A relay fits only a public repository, where Actions minutes are free, which is against his 2026-09-17 words.
- Artifacts: 500 MB of storage on the free plan. Each run's artifact holds health.log, health.json, serve.log, container.json, run.json, the ladder files, and a tail of the ledger capped at 4 MB per file, kept 90 days.

## Facts of the host that bound it

- The cron is UTC: `0 8 * * *` is 04:00 in New York while EDT holds and 03:00 under EST (it drifts one hour twice a year).
- A scheduled workflow is not guaranteed to start on the minute; GitHub delays or drops scheduled runs under load.
- On a public repository GitHub disables scheduled workflows after 60 days with no repository activity.
- A job is killed at 6 hours; the workflow's own timeout is 350 minutes and the wall input is capped at 330.
- Nothing reaches the runner from outside: the health port is published on 127.0.0.1 only and read by the job itself.
- Nothing stays on his PC after the push: the organism runs on the runner, its checkpoint lives in the Actions cache, its readings in the artifacts.

## Measured

### The bar: `node tools/budget.mjs --ram-mb 6000 --disk-mb 500 --dir <scratch>/hostbar --record <scratch>/hostbar/budget-bar.json -- node --max-old-space-size=6000 bench/cloud-host.mjs --checkout-trial 90 --counterfactual bench/fixtures/answer-questions.json --repeat 3` (TEMP and TMP set to `<scratch>/hostbar/tmp`)

Verdict `bench/verdicts/cloud-host.json`, at 2026-09-25T22:33:30.073Z (it replaces the file of 2026-09-25T22:10:15.303Z, a re-measure by the fix stage; `replaces` in the file says so), isTheBar true, barMet false, exit 1. Budget: wall 441.46 s, peak ram 813.8 MB, peak dir 113.8 MB. The verdict was written at 441 s of a 441.46 s wall: no timer outlives the run any more.

- HOST gh: logged in. HOST repository: `https://github.com/j4ydenlxl/brain.git`. Every other host row: "not measured: cloud.yml is not on the default branch (master) of j4ydenlxl/brain yet".
- PC: the workflow exists, parses, 20681 bytes, 27 of 27 structural checks; 10 of 10 files it names exist.
- **The control, the committed tree alone** (HEAD bd04dac, 785 files, 100400578 bytes, 90 s): built false, restarts 6, first checkpoint null, stop code 0, copy deleted true. The daemon opens (its serve log in the verdict: ENOENT on that path) `bench/fixtures/answer-questions.json`, which the commit lacks.
- **The intervention, HEAD plus that one file** (6591 bytes, from the working tree), 3 trials: built 3 of 3, restarts 0, first checkpoint at 2 s, 210..213 ticks/s, daemon peak rss 560..563 MB, budget kills 0..1, copies deleted 3 of 3. The band is the run-to-run noise: the gap between the arms (built false, 6 restarts against built true, 0 restarts) is far outside it.
- **A trial process died** once in the five trial processes of this run: exit 3221226505 (0xC0000409) at 65.7 s of counterfactual 2, with nothing printed (no assertion text, no fatal error line). Under the new supervisor it cost nothing: recorded in `attempts`, nothing was left alive, the copy was deleted, the second attempt completed.
- CONTROL: barOf said true on the planted pass and false on restarts 1, container restart 1, checkpoint age 200 s, no ladder line, conclusion failure, health not ok, a push event, and no run (holds true).
- `node tools/cloud-github.mjs --dry` on the real tree: exit 2, 3 refusals: the workflow is not committed; the checkout trial at bd04dac read built false; `bench/fixtures/answer-questions.json` is not committed at HEAD (`git add -f` named). Secret scan: 779 tracked text files, 0 hits. j4ydenlxl/brain read as PRIVATE. The planned writes (not run): `git push origin HEAD`, `gh workflow enable cloud.yml`, `gh workflow run cloud.yml -f wallMinutes=55 -f relay=false`.

### Fixed by the fix stage (the verify plane's findings)

- A trial process that dies natively skipped every `finally` and left a 97 MB copy. Now each trial runs in its own process (`--trial-worker`) inside a copy the ruler owns (`owner.json`); the ruler kills what it left running (serve from `pids.json`, the daemon from `serve.json`), deletes the copy, verifies the deletion, and tries once more. Copies a dead run left behind are swept before any trial (owner pid gone, or no `owner.json` and older than 15 minutes).
- The 60 s timer of the stop race outlived the verdict; `within()` clears its timer whichever side wins.
- The counterfactual was one run with no band; it is now `--counterfactual FILE --repeat 3` beside the HEAD trial, its control, recorded apart (`pc.counterfactual`) and never read as the tree's own trial.
- The workflow ends a crash loop early (restarts 5, or `/health` silent 10 polls), fails the run and never relays it; the ladder step probes the model endpoint on the runner and prints what it found.
- The deploy refuses while a boot file a checkout trial named is untracked at HEAD, and names `git add -f`.

### Tests: `node --test test/cloud-host.test.mjs`

24 pass, 0 fail. gh is a planted script first on PATH (logged in or not, a run list, artifacts to download); git runs only in temp repositories; no socket. New: `within()` leaves no timer; the sweep deletes a dead run's copies and keeps a live run's; a planted trial process that dies is recorded, its stand-in for serve is killed, its copy deleted, one retry (and its control: a trial process that writes its result is read once); the boot-file refusal and its control; the ruler refuses `--overlay` and a counterfactual without its control trial.

## OPEN

- **OPEN: no run has happened.** Every host row waits on one commit (`.github/workflows/cloud.yml` plus `git add -f bench/fixtures/answer-questions.json`) and `node tools/cloud-github.mjs`. The bar (success, health ok, restarts 0, checkpoint age under 120 s, a LADDER line from the host) is unmeasured.
- **OPEN: 560..563 MB peak against a 512 MB container.** The native daemon of HEAD plus the fixture peaked at 560..563 MB over 3 trials (the maximum working set Windows reports; serve's cap reads the current rss at 448 MB and killed it 0..1 times). Under `--memory 512m --memory-swap 512m` on Linux an OOM kill reads as restarts above 0 (`container.json` records `oomKilled`), and 5 restarts end the run as a crash loop. The fit item's episodic fixes are in the working tree, not in bd04dac: the trial boots only what is committed. Only a host run measures it.
- **OPEN: the silent 0xC0000409.** 1 of 5 trial processes in this bar run died that way (the builder and the verifier each met it before the isolation, the builder's left a copy behind). It is a Windows abort with no text; its cause is not known. Next rung: an interleaved probe of serve's output through pipes against a log file, on the same trial.
- **OPEN: the ladder on the runner is untried.** A runner has no Ollama, so the model arm reads absent; whether the ladder prints its LADDER line there is measured only by the first scheduled run (the ladder step prints the model probe beside it). Fixtures other than answer-questions.json stay ignored; a ladder row that needs one would fail on the runner.
- **OPEN: the assumption.** GitHub Actions, private, is not his word. A daily 55-minute run is not "24/7"; 24/7 on a private repository costs more minutes than the free 2,000 (a relay lasts 1.39 days).

## How to stop it

Commit an empty `state-cloud/STOP` (every step after the check is skipped and the run exits 0), or `gh workflow disable cloud.yml`. A crash loop stops itself: the poll ends early, the run concludes failure and is never relayed.
