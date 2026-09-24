# notes/multiply.md: the multiply item (Board 12)

His P15: "multiplying, duplicating, all within cloud".

This note is the builder's record: what was built, what was measured and by which command, and what is still open.

## Files

Written by this item:
- daemon/multiply.mjs (new)
- bench/multiply.mjs (new)
- test/multiply.test.mjs (new)
- this note
- bench/verdicts/multiply.json, written by the bench

Edited:
- **daemon/run.mjs:** the exchange hook only. `opts.onCheckpoint` is called after every checkpoint with `{kind, t, done, bytes, dir, name}`. A throw is counted in `exchange.errors` and does not stop the run. `opts.instance` and `exchange` ride in the payload.
- **daemon/health.mjs:** the instances fields only. `populationAlive(popDir)` counts `<popDir>/instances/*.json` heartbeats that are fresh (10 s), not ended, and whose pid is alive. `readHealth` reads `<brain>/multiply.json` and adds the `multiply` block: instance, seed, parent, instancesAlive, duplications, elitesImported, elitesExported, storeRows, evals, exchanges, resumed. `startHealth` takes an `onDuplicate` option, which /duplicate calls when it is given.

Not edited: bin/serve.mjs. Its /duplicate route did not have to change.

## Design

**One instance** is one node process. It runs daemon/run.mjs `live()` on its own state dir (`<popDir>/inst-<id>/brain`, via BRAIN_STATE_DIR), serves /health on its own port (port 0 on 127.0.0.1), and runs one worker thread that searches the grid plane.

**The organism** is 12 majors x 256 units. It checkpoints every 250 ticks with ledger summary (16 MB, rotating). It is never run with ledger full. Loop, self, generations and dream are off, because the item is multiplication, not those steps.

**(a) Duplicate.** `duplicateInstance()` copies the latest checkpoint into `<popDir>/inst-<new id>` through a temp dir and one rename. It copies snapshot.json, meta.json and plane.json, and never control.json or the ledger. The copy is re-statted, and retried once if a checkpoint landed mid-copy. The new instance.json carries a DIFFERENT seed. The same seed is refused with 400, an existing id with 409, and no checkpoint with 404. The copy's parent, tick, bytes and sha256 are recorded.

An instance runs its spawn plan after its Nth exchange. In the bar, i0 duplicates into i1 after exchange 2 and into i2 after exchange 3, so "the first instance spawns a third the same way". Each duplicate is written to instance.json, so a restarted parent never makes it twice.

The copy is launched by the population supervisor as its own node process under tools/budget.mjs caps, not as a child of its parent. Two reasons:
- a container is not a child of another container;
- a parent killed at 120 s must not take its duplicates down.

In the bar, the killed parent's duplicates kept running (see the kill below).

**(b) Elite exchange.**
- **The plane.** The velocity grid library search runs on the K = 4 draw suite (`grid/velocity`, the seeds of `bench/velocity.mjs --draws 4`): MatrixElites plane after plane, each run to its PlateauRuler plateau, each carrying every stored elite into generation 0.
- **The store.** An EliteStore keys each elite by a fixed MAP-Elites cell: the four velocity axes, with lmax fixed at 96 so that a cell means the same thing in every instance. It replaces a held elite ONLY with a strictly better one (a tie keeps the incumbent), and every row records `source` (the instance that found it) and `via` (the store file it was read from).
- **At every checkpoint** (the hook above), the worker:
  1. harvests its running plane;
  2. reads every other instance's `<popDir>/store/<id>.json`;
  3. re-scores each genome on its own matrix, rejecting a row whose count or cell disagrees;
  4. keeps the best per cell and drops the accepted rows into its running plane;
  5. writes its own finds to `store/<id>.json`;
  6. saves plane.json.
- **The fresh draws** (`grid/velocity:heldout` and `:fresh1..4`) are scored only in the report, never in selection.

**(c) Health.** Each instance writes `<brain>/multiply.json` and its heartbeat once a second, and /health reports the fields listed above.

**(d) Supervisor.** `Population` follows bin/serve.mjs:
- It restarts an instance that exits without done.json from its own last checkpoint. The organism resumes from snapshot.json; the plane resumes from plane.json.
- Backoff is 1 s, doubled when the instance died within 10 s.
- There is a restart cap of 3.
- An instance is never restarted past its own deadline. Its wall seconds run from its FIRST start, so a restart buys no extra time.

**The worker boundary.** There are three crossings and no others:
- workerData (`planeWorkerOptions`);
- main to worker (`postToPlane`);
- worker to main (`postFromPlane`).

Each passes its message through `runtime/protocol.mjs` `ownBytes` first. Test 5 proves it: a 16-byte view on a 64 KB buffer crosses as its own 16 bytes, and a census of the file finds exactly two `.postMessage(` calls, both on `ownBytes(msg)`, and one `new Worker(`.

**"At most 2 workers."** I read this per process. Each instance process holds ONE worker thread, and the bench process holds none. The population of 3 therefore holds three worker threads, one in each of three processes. If the rule means two worker threads across the whole tree, the population arm breaks it and would have to drop a worker (for example, search on the main thread between ticks).

**Why the plane is the grid library and not the organism archive.** The organism archive's fitness depends on wall clock and novelty, so a store could not say "strictly better" across instances. A grid library's score on a fixed matrix is exact and re-checkable by any instance. That is what lets the store reject a row from another matrix.

## Tests

`node --test --test-timeout=150000 test/multiply.test.mjs`, run last, after the bar: 9 pass, 0 fail, duration_ms 28873.4316.
- duplicate gives a distinct seed and state dir (plus 404, 400 and 409, and control.json not copied);
- a duplicate inherits a plane and a restart resumes it;
- the store keeps the better of two (a tie keeps the incumbent; source and via recorded);
- a cross-instance exchange with a re-score rejection;
- ownBytes on every worker boundary (unit, census, and a real PlaneWorker);
- health fields with stale, ended and dead-pid heartbeats, including a checkPid:false control;
- the live() hook: kinds, t, and a throwing hook;
- a scripted restart;
- a real instance that duplicates, is SIGKILLed and comes back from its checkpoint.

No test calls Ollama.

`node --test --test-timeout=150000 test/multiply.test.mjs test/daemon.test.mjs test/cloud.test.mjs` (run.mjs and health.mjs changed; core/persist.mjs changed under this item during the work, from another item): 22 pass, 0 fail, duration_ms 29183.6283.

## Measured

### The bar (2026-09-24T14:23:05.952Z, node v24.15.0, wall 514.1 s)

Command:

```
node tools/budget.mjs --ram-mb 6000 --disk-mb 2000 --dir state/multiply-bench --wait-free-ram-mb 16000 --record state/multiply-bench-budget.json -- node --max-old-space-size=6000 bench/multiply.mjs
```

Verdict: `bench/verdicts/multiply.json`, `isTheBar: true`, `bar.met: false`.

**MISSED by one fresh task.** The population scored 133/160 on grid/velocity:heldout; the single instance scored 134/160. The killed instance came back.

The printed lines that decide it:

```
[single] best fresh 134/160 (the pick by the searched objective: s0, 598 searched); evals 111167463; elites imported 0 exported 2211; duplications 0; instances alive at the end 1 [s0] at arm 237.8 s (most alive 1); peak tree ram 1595.4 MB working set (1608.2 MB private, 7 processes); per instance peak s0 1205.8 MB
[population] best fresh 133/160 (the pick by the searched objective: i0, 598 searched); evals 297585631; elites imported 2490 exported 3597; duplications 2; instances alive at the end 3 [i0 i1 i2] at arm 234.5 s (most alive 3); peak tree ram 3984.2 MB working set (5485 MB private, 15 processes); per instance peak i0 1133.2 MB, i1 1112.9 MB, i2 1203.3 MB
[kill] i0 pid 1920 SIGKILLed at arm 121 s (tick 1470, checkpoint on disk t=1250, plane.json t=1250)
[kill] supervisor: [population] i0 exited code=1 signal=null after 121.3 s; restart 1 from its checkpoint t=1250 in 1000 ms (at arm 121.3 s)
[kill] i0 log: [live] resumed brain in 2690 ms at t=1250, cells 173, edges 1799, checkpoint every 250 ticks, self every off, generations every off, ticks unbounded, wall 117488 ms, loop off, ledger summary budget 16 MB
[kill] i0 log: [multiply i0] plane resumed from plane.json at plane 1783 with 544 stored elites (saved at t=1250); suite 6175 components x 640 tasks, 9 draws cached, 0 built, 32.46 ms
[kill] i0 ended true after 2 starts at t=2150, resumedAt 1250 against the supervisor's checkpoint t=1250: CAME BACK from its checkpoint
[bar] single: 134/160 fresh (s0, 598 searched)
[bar] population pick by the searched objective: 133/160 fresh (i0, 598 searched, found by i0); i0 at the arm's 240 s mark: 133/160; best fresh over the 3 instances (selects on the held-out draw, not the bar): 133
[bar] population BELOW the single instance on the fresh draw; killed instance came back => bar MISSED
[ram] peak tree working set 3984.2 MB (private 5485 MB, up to 15 processes) over 256 samples; under 6000 MB: true
[disk] state\multiply-bench holds 21.4 MB
BUDGET done exit 0: wall 514.44 s, peak ram 4076.4MB, peak dir 21.4MB, cpu 2024.48 s, 258 samples, record state/multiply-bench-budget.json
```

**Per instance** (the bench's own lines):

| Instance | Seed | Origin | Started | End tick | Checkpoints | Exchanges | Evals | Imported / exported | Peak RSS |
|---|---|---|---|---|---|---|---|---|---|
| s0 | 1 | (single arm) | | t=2450 after 244.413 s | 11 | 12 | 111167463 | 0 / 2211 | 1205.8 MB |
| i0 | 1 | first instance | | t=2150 after 246.824 s, 2 starts | 4 | 11 | 94417864 | 776 / 1732 | 1133.2 MB |
| i1 | 2 | duplicate of i0 from t=250, 346 plane elites | arm 7 s | t=2320 after 244.482 s | 9 | 10 | 102231301 | 910 / 1020 | 1112.9 MB |
| i2 | 3 | duplicate of i0 from t=500, 413 plane elites | arm 20.3 s | t=2410 after 245.633 s | 8 | 9 | 100936466 | 804 / 845 | 1203.3 MB |

i0 made the 2 duplications.

**/health, last read of each instance:**
- s0: instancesAlive 1.
- i0, at arm 241.5 s: instancesAlive 3 [i0 i1 i2], duplications 2, elitesImported 662, elitesExported 1699.
- i1, at arm 251.5 s: instancesAlive 2, after i0 ended.
- i2, at arm 261.9 s: instancesAlive 1.

Some reads failed and are counted, not hidden: s0 43 reads and 2 failed, i0 42 and 3, i1 43 and 1, i2 44 and 0. A read times out at 2 s.

### What the numbers say

- **Every instance of both arms ended on the same searched score:** 598/640 (149.5/160 per draw), length 96, fitness 0.9320403696498054. Board 10's `bench/verdicts/velocity-heldout.json` also reads searchedKMean 149.5. The population made 297585631 evaluations against the single arm's 111167463, imported 2490 elites, and still found no library above 598 inside the length cap of 96.
- **So the fresh score is decided between libraries of identical searched fitness.** The population's pick (found by i0 after the exchange had changed its trajectory) scored 133; the single's scored 134. On the four other fresh draws the means were 133.5 (population) and 137 (single). **The population did no better.** It is printed as such, and the bar is not widened. The 80 s partial run had the same shape: single 134/160, population 133/160, i0 back from t=750 (`bench/verdicts/multiply-partial.json`, isTheBar false).
- **The kill.** i0 died at tick 1470 with its checkpoint at t=1250. The ticks after the checkpoint were lost and replayed from it. On Windows a SIGKILL exits with code 1 and no signal. The supervisor restarted i0 after 1000 ms; its organism resumed at t=1250 in 2690 ms, and its plane resumed from plane.json at plane 1783 with 544 elites. Its deadline ran from its FIRST start: the second start was given 117488 ms, and i0 ended at 246.824 s. i1 and i2 each ran one attempt straight through their parent's death, both ending with code 0.
- **RAM.** The organism was NOT shrunk: 12 majors x 256 units, the size Board 10's cloud ran. The tree (bench, three instances, and every tools/budget.mjs PowerShell sampler) peaked at 3984.2 MB working set in the bench's own meter, and at 4076.4 MB in the outer budget. Private bytes summed to 5485 MB. If the 6000 MB cap is read on private bytes rather than working set, the population arm is close to it. Instances grow with ticks: s0 peaked at 749.2 MB in the 80 s partial run and 1205.8 MB in the 240 s bar.
- **Prebuild.** Inside the bar, the prebuild's budget line reads "peak ram 0.0MB" because a warm load (24 ms) ends before the first sample. The partial run built all 9 matrices cold: 12652 ms, peak 98.6 MB.
- **Tick rate.** Beside its plane worker, s0 reached t=2450 in 244.413 s with 11 checkpoints. Alone, from a fresh build, the organism ticked 29 and 30 t/s in an earlier probe. The DEFAULTS comment now says both.
- **Disk.** The bench wrote 21.4 MB, well under 200 MB, so it needs no rotation beyond the ledger's own (summary, 16 MB per instance).

## Open

- **The tie-break.** Among libraries of identical searched fitness, the pick is the store's lowest cell. A tie-break chosen without the fresh draws (fewest components, the library held by most instances, a vote) is untested. It must be fixed before any fresh draw is looked at again, or it becomes selection on the held-out draw.
- **The plateau.** One instance alone reaches the suite's searched plateau (598 at length 96) inside 240 s, so this suite cannot show a population advantage on the searched score. A suite or a length cap the single instance does not saturate in 240 s is the test that could.
- **Workers.** "At most 2 workers" is read per process; see Design.
- **Docker is absent on this desk.** The population ran as native processes under tools/budget.mjs caps, not as containers.
- **A failed first attempt.** The first partial attempt (10:08 EDT) died at import: core/persist.mjs, changed by another item at 10:05, imported a core/checkpoint-delta.mjs that did not exist yet. It imported cleanly at 10:09:51, and every run quoted here came after that.

## Model calls

None. The bench and the tests make no model call. Every timing is wall clock on a desk shared with Board 11, which owns Ollama.
