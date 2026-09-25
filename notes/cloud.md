# notes/cloud.md: the cloud item (Board 10)

His P13: "It should live 24/7 on the cloud remember Its literally a sandboxed ARTIFICIAL SUPERINTELLIGENCE".
His P15: "multiplying, duplicating, all within cloud with zero data on my part".

The manual is docs/CLOUD.md. This file is the builder's record: what was measured, by which command, and what is open.

## Files

Written by this item: Dockerfile, compose.yaml, .dockerignore, bin/serve.mjs, daemon/health.mjs, tools/deploy-host.mjs, bench/cloud.mjs, test/cloud.test.mjs, docs/CLOUD.md, this note, and bench/verdicts/cloud-partial.json.

## Bar

The bar is `node bench/cloud.mjs`. It was run once for 300 s, natively, because Docker is absent. It wrote bench/verdicts/cloud-partial.json with isTheBar false. MISSED: the row "restart count 1" read 14 (1 from the kill, 13 budget kills). The rows that held: the kill resumed from its checkpoint; the duplicate copied and a second instance resumed from the copy; instances alive read 2; example.com was refused and the model endpoint answered; the context had 0 secrets and the control saw the 2 token files; no pid was left behind.

## Tests

`node --test test/cloud.test.mjs`: 7 pass, 0 fail, 9949 ms.

## Measured

### Board 16 fit item: the episodic bound (2026-09-25, board 16 builder)

**What changed.** memory/episodic.mjs never allocates past maxEpisodes: a grow doubles up to the bound and stops, EpisodicStore.from restores at capacity min(bound, 2n), and EpisodicStore.bounded(j, m) evicts a saved record down to a new bound. seeds/whole.mjs passes `{ episodic: { maxEpisodes } }` to attachMemory, from opts.episodic.maxEpisodes or BRAIN_EPISODES_MAX, on a build and on a restore. bin/serve.mjs reads BRAIN_EPISODES_MAX (default 2048) and hands it to the daemon child. compose.yaml and the Dockerfile set BRAIN_EPISODES_MAX 2048. The daemon heap flag is unchanged (224 MB).

**The eviction rule.** At the bound the store compacts in one batch down to three quarters of the bound. Cold episodes leave first, then the oldest by t, then the lowest id. The store has no salience field, so "lowest salience" has nothing to read. Cold is the store's own forgetting mark (an episode that no longer answers retrieval), so it goes first, and age breaks ties. The batch keeps eviction O(1) amortised: one sort and one reindex per maxEpisodes/4 appends (512 at 2048). test/memory.test.mjs pins this rule.

**The arithmetic** (printed by node):

    65536 keys x 8192 lanes = 536870912 bytes = 512 MB   (the old default bound)
    16384 keys x 8192 lanes = 134217728 bytes = 128 MB   (the ceiling: keys stay under it)
    8192 keys x 8192 lanes = 67108864 bytes = 64 MB
    2048 keys x 8192 lanes = 16777216 bytes = 16 MB      (compose.yaml and the Dockerfile)

**The memory probe.** A scratch probe ran bin/serve.mjs natively with compose.yaml's environment. It lifted the RSS cap to 2000 MB, took a census every 5 s from /health, and used a local stub as the model endpoint (0 hits in every probe). Its last line at 180 s:

- before (no bound, 65536): `s=181 tick=21873 rss=668 heapUsed=66 arrayBuffers=407 episodic n=24200 cap=32768 max=65536 keyMb=256 evicted=0 restarts=0 budgetKills=0 peakDaemonRss=814`
- bound 8192: `s=181 tick=31392 rss=520 heapUsed=59 arrayBuffers=214 episodic n=7911 cap=8192 max=8192 keyMb=64 evicted=26624 heapTotal=67 external=281 restarts=0 budgetKills=0 peakDaemonRss=623`
- bound 2048 (after, the value shipped): `s=181 tick=26035 rss=433 heapUsed=59 arrayBuffers=166 episodic n=1914 cap=2048 max=2048 keyMb=16 evicted=26624 heapTotal=66 external=233 restarts=0 budgetKills=0 peakDaemonRss=484`

**Why 2048 and not 8192.** In the 300 s probes before t=20000, the daemon read rss 431 to 450 at 8192 (s=65 to 115) and 361 to 388 at 2048 (s=40 to 140). The peak before t=20000 was 523 at 8192 and 470 at 2048. The rulers read the same at both: k=19 exact 36/36 carried 36/36, and k=39 exact 36/36 carried 34/36.

Caveat: the before probe and the 8192 probes ran without a bench flag. Their daemons started the self-code worker at t=20000 (see Open). The 2048 probe and every bench run below had the flag up. The comparison above uses only samples from before t=20000.

**The bar:** `node tools/budget.mjs --ram-mb 6000 --disk-mb 2000 --dir <scratch> -- node --max-old-space-size=512 bench/cloud.mjs`, native. It wrote bench/verdicts/cloud.json at 2026-09-25T22:03:32.193Z (node v24.15.0, 354 s wall), with isTheBar true and **barMet false**.

- health before (60 s): ok true, restarts 0, budget kills 0, tick 9001, daemon rss 359 MB (peak 461), episodic n=1540 cap=2048 keyMb=16, checkpoint 5.8 s old.
- `kill: daemon pid 36604 killed at t=11041 (checkpoint t=10097); restart count 1 after 3691 ms, new pid 23640, resumed at t=10097 (from checkpoint: true)`
- `restart count 3 (1 from the bench kill, 2 budget kills at the rss cap, 0 other); B: restarts 1, budget kills 1`
- health after (300 s): ok true, restarts 3, budget kills 2, tick 39965, daemon rss 291 MB (peak 525), last exit "BUDGET KILLED rss 456 MB over cap 448 MB" at t=39892, checkpoint 16.4 s old.
- `rss peak: {"daemonA":525,"serveA":71,"daemonB":564,"serveB":67,"instanceA":596,"instanceB":631}`
- `bar {"restartCount1NoBudgetKill":false,"resumedFromCheckpoint":true,"duplicate200Then409SecondFromCopy":true,"egressModelEndpointAllowed":true,"egressExampleRefused":true,"healthOkAfter":true,"daemonPeakRssUnderCap":false,"checkpointAgeUnder60s":true} barMet false`
- Every budget kill came at a self round (selfEvery 20000): A at t=20097 (rss 513), B at t=21384 (rss 475), and A at t=39892 (rss 456).
- In this run the egress row read "not reached: 23 The operation was aborted due to timeout", while the stub counted GET /api/tags 1. The guard let the request through, but the stub could not answer it: it runs in the bench process, and a blocking spawnSync held that process. The probe now spawns asynchronously, and the control run below read 200.

**The control** (the same command with `--episodes-max 65536`, the old bound; bench/verdicts/cloud-control-partial.json, isTheBar false): `restart count 14 (1 from the bench kill, 13 budget kills at the rss cap, 0 other); B: restarts 11, budget kills 11`. rss peak daemonA 602, daemonB 709. At the end the episodic record held n=20270 in a capacity of 40040 (313 MB of keys).

**Run-to-run noise** (the bar command repeated, with its verdict written to a scratch path): `restart count 3 (1 from the bench kill, 2 budget kills at the rss cap, 0 other); B: restarts 0, budget kills 0` (B was budget killed after that reading, at t=40257, rss 537). rss peak daemonA 518, daemonB 554, against 525 and 564 in the bar. The checkpoint was 118 s old at the end, against 16.4 s in the bar: A resumed at t=39249 and then sat in the second self round. Its budget kills were at t=20112 (rss 479) and t=39774 (rss 450). So the bar's restart count 3 and the control's 14 differ by more than the repeat moved (3 to 3). The checkpoint age row is noise-bound at the second self round: 16.4 s in the bar, 118 s in the repeat.

**What is left, and where it lives.** These were measured in the 2048 probe and the bar. None of them is the episodic record, and none of their files belongs to this item:

1. **The knowledge store.** Growth mode opens bench/fixtures/wiki/store (daemon/run.mjs ingestStep calls memory/knowledge.mjs KnowledgeStore.open). Array buffers stepped from 46 to 166 MB, and the peak from 304 to 470, between s=25 and s=30. meta.json gives residentBytes 115742256 (110.4 MB). readTyped reads each file with readFileSync and then copies it into a new ArrayBuffer, so sigs.bin (70294144 bytes, 67.0 MB) is held twice while it loads. .dockerignore does not exclude the store, so the image carries it.
2. **The self rounds** (selfEvery 20000). In the probe, rss went from 387 to 438 at t=20000, as cells grew from 173 to 210 and edges from 913 to 1756. Every budget kill of the bar came at one. At the second round (t=40000), the tick stayed at 39867 or 39872 for 40 s or more in both 300 s probes, and the stop needed SIGKILL after 25 s.
3. **The self-code worker** (selfCodeEvery 20000). With no bench flag up it starts at t=20000 and runs the tree's self/autopilot.mjs. In the 8192 probe, rss went from 450 to 513 when it started and stayed between 507 and 545 to the end. The bench now raises a flag, so the bar did not measure the worker.

**Bench changes** (bench/cloud.mjs, board 16 builder):
- Native mode is the documented fallback, and a completed 300 s native run is the bar (isTheBar true).
- barMet is the conjunction of the 8 bar rows. This is new: there was no barMet before, and a native run was always partial.
- `--episodes-max N` runs the control. A control run is always partial.
- The model endpoint is a local stub (model off).
- A bench flag keeps the daemons from running self-code on the real tree.
- The egress probe no longer blocks the stub.

**Tests.** `node --test test/cloud-fit.test.mjs test/cloud.test.mjs test/memory.test.mjs`: 30 tests, 29 pass, 1 fail. test/cloud-fit.test.mjs passes 4 of 4. The one failure is "no secret pattern appears in the build context". It fails on test/handoff.test.mjs:43, a planted sk_live_ string in a file this item does not own (untracked, written 16:52 on 2026-09-25).

### The bar of 2026-09-24: `node bench/cloud.mjs` (2026-09-24T02:33:42Z, node v24.15.0, 308 s)

Verdict: `bench/verdicts/cloud-partial.json`, `isTheBar: false`, exit 1.

- **Docker is absent here.** The field is `docker`, and the reason printed was "docker is not on PATH (ENOENT); C:\Program Files\Docker absent; wsl: no answer". No image was built, so image bytes are unmeasured, and the container caps (512m, 1 CPU, read-only) were not exercised. bin/serve.mjs ran natively for 300 s with the environment compose.yaml declares: 12 majors, 256 units, checkpoint every 1000 ticks, ledger summary 64 MB, heap 224 MB, RSS cap 448 MB.
- **Build context:** 1548 files, 877125681 bytes. Secret hits 0; 8 planted test fixtures were allowed by exact value. The control scan, without the secret lines of .dockerignore, found 4 hits (jwt, env secret assignment) in 2 files: `site/.env.local` and `web/dist/.env.local`.
- **Start:** the first checkpoint was at t=1014, 6 s after start.
- **Health before** (at 60 s): `ok false`, restarts 2, budget kills 2, tick 13371, 222 ticks/s, daemon RSS 519 MB, heap used 79 MB, array buffers 340 MB. The episodic record held n=14326 in a capacity of 24040 (188 MB of keys); its bound is 65536 x 8192 lanes = 512 MB. The checkpoint was at t=13097, 17605144 bytes, 2.1 s old.
- **The kill:** daemon pid 11696 was SIGKILLed at t=14097, with its checkpoint at t=14097. The supervisor restarted it in 10730 ms, and it resumed at t=14097 (from the checkpoint: true).
- **Duplicate:** `GET /duplicate?seed=1` returned 200 and 21917696 bytes, from the checkpoint at t=17097. The same seed again returned 409. A second serve.mjs (`BRAIN_NAME=dup-1`) resumed at t=17097 after 3570 ms, and instances alive read 2 (`bench-a`, `bench-b`).
- **Egress:** a guarded process got 200 from the model endpoint `http://127.0.0.1:11434/api/tags` (2 models). The guard refused `https://example.com/` via fetch and `http://example.com/` via http.get, both with EGRESS_REFUSED. A closed local port answered ECONNREFUSED guarded and unguarded, so the control shows the guard does not fake connection errors.
- **Health after** (at 300 s): `ok true`, restarts 14, budget kills 13; the daemon was mid-restart, so tick was null. The checkpoint was at t=19097, 23986768 bytes, 2.4 s old. Instances alive: 2.
- **Restart count 14:** 1 from the bench kill and 13 budget kills at the 448 MB RSS cap. B had 7 restarts, all 7 budget kills. **The bar row "restart count 1" is MISSED.**
- **Peak RSS:** daemon A 610 MB, serve A 82 MB, daemon B 591 MB, serve B 66 MB. Neither fits the 512 MB container cap.
- **End:** final ticks were A 19373 and B 20097. State was 70879317 bytes, and the ledger dir 49101 bytes (setLedgerPolicy summary, 64 MB budget). Both instances stopped with code 0, and no pid outlived them.

### Why it missed: the episodic record is the grower (memory probe, cap lifted to 2000 MB, 12 majors)

`scratchpad/cloud/mem-probe.mjs` runs serve.mjs and prints the child's memory census every 5 s:

- Heap used stays between 50 and 134 MB. Array buffers step up exactly when the episodic record doubles its capacity:

  | t | episodic capacity | array buffers |
  |---|---|---|
  | 4489 | 8192 | 214 MB |
  | 8401 | 16384 | 277 MB |
  | 16097 | 32768 | 453 MB |

  At t=16097, n=17340 and the keys take 256 MB; RSS was 639 MB.
- `memory/episodic.mjs` bounds the record at `maxEpisodes: 1 << 16` keys of 8192 Int8 lanes. That is 512 MB of keys, the whole container cap. `EPISODIC_DEFAULTS` is frozen.
- `seeds/whole.mjs` calls `attachMemory(brain, { name })` with no episodic options, so no deployment can size the bound.
- `EpisodicStore.from` restores with capacity `min(n, max) * 2`: the resumed daemon in the bar read a capacity of 24040 with n=14326 at t=13371. Each resume therefore passed the cap within seconds, and the daemon went round the restart loop instead of living.

### Tests: `node --test test/cloud.test.mjs`

7 of 7 pass in 9949 ms:

- restart from the checkpoint
- health from disk only
- the egress guard, in process and through `--import`, with the control-plane arms
- secrets, with a planted control
- duplicate
- the declared caps
- the ladder clock and the instance ruler

### Found and fixed after the bar

- **The guard refused the organism's own control plane.** On each resume, live() asks `cli/control.mjs` connect() whether a daemon already runs (GET /health on the loopback port in control.json). Under the guard that call was refused, so the check always read "not running": two supervisors on one brain name would both have opened it. Now a loopback request is allowed only when a control.json under the state dir, whose pid is alive, names that port. A 100 s restart probe logged 1 refusal (a stale control.json, dead pid) across 5 restarts, where the unfixed guard logged 1 per restart. This came after the bar, so the bar's egress.log (22 lines) includes these refusals.
- **The http path surfaced ENOTFOUND instead of EGRESS_REFUSED.** `agent: false` made node build an Agent that ignored `createConnection`. Named ESM imports of node:http were also unguarded; `syncBuiltinESMExports()` now covers them.

## Open

OPEN: the bar of 2026-09-25 is missed on two rows: restart count 3 (2 budget kills) and daemon peak RSS 525 and 564 MB against 448. The three episodic changes landed (Measured, Board 16 fit item), and restarts fell from 14 to 3. The rest of the RSS sits in files this item does not own:
  1. memory/knowledge.mjs readTyped should read each file straight into its ArrayBuffer (fs.readSync into a Uint8Array view), so no file is held twice. sigs.bin alone is 67.0 MB.
  2. The self rounds of daemon/run.mjs (selfEvery 20000) sit under every budget kill of the bar. The second round held the tick 40 s or more.
  3. Whether a container should load the 110.4 MB knowledge store at all (.dockerignore, daemon/run.mjs ingestStep).
OPEN: in a container no bench flag is up, so the self-code worker runs, and its memory is not in the bar. In the 8192 probe, rss went from 450 to 513 when it started.
OPEN: my probes without a bench flag let their daemons run the real tree's self/autopilot.mjs at t=20000. They appended notes.open rows to bench/verdicts/autopilot/2026-09-25.jsonl: runId 20260925T213200240Z (20 rows), 20260925T213834535Z (31 rows) and 20260925T214255723Z (33 rows). They also left state/self-code/autopilot.lock naming dead pid 40856; autopilot takes over a dead pid's lock. The rows were not removed, because that journal belongs to another item. Natively, any daemon run without a bench flag does the same.
OPEN: test/cloud.test.mjs fails 1 of its tests, and bench/cloud.mjs reads noSecretInContext false, on a planted sk_live_ string at test/handoff.test.mjs:43. That file is not this item's.
OPEN: Docker is absent on this machine. The Docker path of bench/cloud.mjs has never run: build, run with the caps, `docker exec` kill, `docker stats`, the second container. Image bytes are unmeasured. The build context is 877125681 bytes, and the wiki fixtures under bench/fixtures/wiki are most of it.
OPEN: the guard lives in the process, not the network. `fetch`, `http` and `https` are guarded in every node process under the supervisor. Raw `net`/`tls` sockets, `dgram`, and child processes that are not node are not. Worker threads are not measured. A network wall needs an egress proxy or a docker network policy.
OPEN: the loopback exception trusts control.json files the organism itself writes. In a container, loopback is the container. Natively it is the host.
OPEN: a duplicate is an exact copy, the same state and the same generator position. The two copies diverge only through inputs that differ (wall clock, the world). Re-seeding a copy needs a core hook; the seed is recorded in dup-N/meta.json only.
OPEN: self-code cannot land inside the image. /app is root-owned and mounted read-only, so `self/autopilot.mjs` cannot write source there. It needs a writable overlay of the tree under /state, or it must run outside the container.
OPEN: the 04:00 ladder inside a container is untested. The bar ran with `BRAIN_LADDER=off`; the schedule math is tested.
OPEN: tools/deploy-host.mjs has only been dry-run (context, secret scan, plan, and the refusal of a target like `x;rm -rf /`). No host has been deployed to.

## Budgets

Every process this item launched declared a heap: the bench 512 MB, the supervisor 96 MB, the daemon 224 MB, the probes 64 to 128 MB, the tests 2048 MB. One bench ran at a time, and free RAM read 47 GB (PowerShell) at the bar. Nothing wrote over 200 MB: state was 70879317 bytes at the end of the bar, in a temp dir that the bench deleted.
