# CLOUD: the organism as a sandboxed service

His P13, verbatim: "It should live 24/7 on the cloud remember Its literally a sandboxed ARTIFICIAL SUPERINTELLIGENCE".
His P15, verbatim: "multiplying, duplicating, all within cloud with zero data on my part".

This page is the manual. Every number on it was printed by a command named next to it.

## The pieces

| File | What it is |
|---|---|
| `Dockerfile` | `node:24-slim`, nothing installed, the tree copied minus `.dockerignore`, runs as the `node` user, `/state` the only writable place |
| `compose.yaml` | the caps (512 MB RAM, 1 CPU, read-only root, all capabilities dropped, 256 pids, restart always) and the egress allowlist in its header |
| `.dockerignore` | keeps out `state/`, `organism/scale-*`, `.git`, and every `.env`, key and `.vercel` file |
| `bin/serve.mjs` | the container entry: supervisor, daemon child, and the egress guard |
| `daemon/health.mjs` | `GET /health` and `GET /duplicate?seed=N`, read from disk only |
| `tools/deploy-host.mjs` | `node tools/deploy-host.mjs user@host`: tar over ssh, `docker compose up -d --build`, wait for `/health` |
| `bench/cloud.mjs` | the bar |
| `test/cloud.test.mjs` | the tests |
| `.github/workflows/cloud.yml`, `tools/cloud-github.mjs`, `bench/cloud-host.mjs` | the host: see "The host: GitHub Actions on his account" below |

## Run it

Natively, on this machine (no Docker needed):

```
node bin/serve.mjs                      # brain "cloud" in brain/state/cloud, health on 127.0.0.1:8080
curl -s http://127.0.0.1:8080/health
curl -s "http://127.0.0.1:8080/duplicate?seed=1"
BRAIN_NAME=dup-1 HEALTH_PORT=8081 BRAIN_INSTANCE=dup-1 node bin/serve.mjs     # a second organism from the copy
```

In a container:

```
docker compose up -d --build
curl -s http://127.0.0.1:8080/health
curl -s "http://127.0.0.1:8080/duplicate?seed=1"
DUP_NAME=dup-1 docker compose --profile dup up -d dup     # health on 8081
```

On a host he rents (any machine with Docker and his own ssh login):

```
node tools/deploy-host.mjs --dry user@host     # prints the context, the secret scan, the plan; sends nothing
node tools/deploy-host.mjs user@host           # tar | ssh, docker compose up -d --build, waits for /health
```

The deploy never reads, copies or asks for a key. It runs `ssh` and `tar` as he would, so his agent and his `~/.ssh/config` decide how it logs in. Before anything leaves the machine it scans every text file of the build context for secret patterns, and any hit stops it with exit 2. A hit prints the file, line and kind, never the value.

## What serve.mjs does

- It forks the daemon (`daemon/run.mjs` `live()`) as a child with ledger `summary`, a checkpoint every `BRAIN_CHECKPOINT_EVERY` ticks (1000), and resume from `/state/<name>/snapshot.json`.
- It restarts the child on any exit and prints `restart N from checkpoint t=T`. The backoff is 1 s, doubling while the child keeps dying within 10 s.
- It samples the child's RSS every second (`tools/budget.mjs` is present, but the daemon reports its own RSS over the IPC channel the supervisor needs anyway). Two samples over `BRAIN_RSS_CAP_MB` (448) mean SIGKILL and a restart from the checkpoint, printed as `BUDGET KILLED`.
- The ledger policy goes through `core/ledger.mjs` `setLedgerPolicy` (summary, 64 MB budget). The supervisor also rotates at the full budget as a backstop.
- It writes `/state/<name>/serve.json` every second. That file is what `/health` reads.
- It heartbeats `/state/instances.json` on start and every minute. A row seen in the last 150 s counts as alive; rows older than 10 minutes are collected.
- It runs `bench/ladder.mjs --log` daily at 04:00 container time (`TZ`, UTC by default). The daemon is checkpointed and paused for the ladder, then resumed; a pause is not a restart. In the image, the ladder's series and dated files are links into `/state/verdicts`, seeded from the image on first boot.

## /health

This is JSON read from disk on every request; nothing about the organism is held in the server's memory. `daemon/health.mjs` imports node builtins only, and a test holds that line.

| Field | Meaning |
|---|---|
| `ok` | serve.json is less than 30 s old, and a daemon is running (or the 04:00 ladder holds it) |
| `uptimeS`, `restarts`, `budgetKills` | from serve.json |
| `tick`, `ticksPerSec`, `resumedAt`, `daemonPid`, `rssMb` | from the child's last report |
| `memory` | heap used, array buffers, and the episodic record (n, capacity, key MB, bound) |
| `checkpoint` | `tick` and `savedAt` from meta.json; `ageS` and `bytes` from snapshot.json's mtime and size |
| `ladder` | the last day of `bench/verdicts/ladder.json` |
| `nativeShare` | when ladder.json has one; otherwise `nativeReason` says it has none yet |
| `instancesAlive`, `instances` | from `/state/instances.json` |
| `egressAllow` | the list the guard enforces |

`GET /duplicate?seed=N` copies the last checkpoint to `/state/dup-N` through a temp dir and one rename, so a reader never sees half a copy. It re-stats the source after the copy and retries once if a checkpoint landed mid-copy. It returns the bytes, the sha256 and the source tick; 409 if `dup-N` exists, 400 for a seed that is not 1 to 9 digits, 404 before the first checkpoint, 507 over the disk cap. An organism started with `BRAIN_NAME=dup-N` on the same volume resumes from it.

## The egress allowlist

The organism may reach three things and nothing else:

1. the venue feed hosts `world/policy.json` declares (`http.hosts`, and the url or host on each `venue.venues` and `venue.feeds` entry). The shipped policy declares none, so today there is no venue egress at all.
2. the model endpoint, `BRAIN_MODEL_URL`. The default is `act/llm.mjs` `OLLAMA_BASE`, `http://127.0.0.1:11434`. In the container it is `http://host.docker.internal:11434`, and a request to the built-in address is routed there.
3. the checkpoint store, `BRAIN_CHECKPOINT_URL`, empty by default, so checkpoints stay on the volume.

`BRAIN_EGRESS_ALLOW` can add host:port entries; it is empty by default. The guard replaces `fetch`, `http.request`/`get` and `https.request`/`get` (and syncs the ESM named exports). Every node process under the supervisor gets it through `NODE_OPTIONS=--import=bin/serve.mjs`. A refusal throws code `EGRESS_REFUSED` before a socket opens and appends one JSON line to `/state/egress.log`, which rotates at 1 MB.

## Secrets

- `site/.env.local` and `web/dist/.env.local` hold Vercel tokens, found while building this item. `.dockerignore` keeps them, and every `.env`, key and `.vercel` file, out of the build context.
- The bench's control scan, run without those `.dockerignore` lines, finds hits in exactly those two files. That proves the scan can see what the ignore file hides. Values are never printed.

## The host: GitHub Actions on his account

His words of 2026-09-25, relayed: "set up the p13 idk how idk". The host is an ASSUMPTION of the orchestrator, his to overturn: **GitHub Actions in a PRIVATE repository on his account** (his 2026-09-17: "Make sure nobody can copy our ideas"). A public repository is a flag, `--public --yes`, that prints those words first. The builder's record, the cost arithmetic and the deviations are in `notes/cloud-host.md`.

What runs: `.github/workflows/cloud.yml` ("brain cloud"), once a day at `0 8 * * *` UTC (04:00 in New York under EDT, 03:00 under EST) and on demand. It restores the checkpoint from the Actions cache into `state-cloud/`, builds the image, runs the organism with the caps of compose.yaml for the wall (55 minutes by default), polls `/health` every 60 s into `health.log`, stops it with SIGINT, runs the ladder in its own container on a scheduled run, writes the job summary table, saves the checkpoint back to the cache, and uploads the readings as the artifact `brain-cloud` (kept 90 days). Secrets are only `${{ secrets.NAME }}` references; with none set, the optional store upload prints "no store configured".

His steps:

1. `gh auth login` (once). On 2026-09-25 the bar read gh as logged in on this machine, and `origin` is `j4ydenlxl/brain`, PRIVATE, default branch master.
2. Commit `.github/workflows/cloud.yml` together with `bench/fixtures/answer-questions.json` (`git add -f bench/fixtures/answer-questions.json`: `-f` commits it whatever `.gitignore` says; the daemon opens it at boot, and the committed tree without it does not boot), then:

```
node tools/cloud-github.mjs          # push, enable the workflow, dispatch one 55-minute run, print its URL
node tools/cloud-github.mjs --dry    # the same plan, nothing written
```

The deploy refuses (exit 2, nothing written) when gh is not logged in ("run: gh auth login"), when the workflow is not committed at HEAD, when a secret pattern is in a tracked file or a secret-looking name is in the history, when a blob is over 100 MB, when the root is not the top of its repository, when `--public` or a relay on a private repository comes without `--yes`, when the checkout trial at the same HEAD read built false, and when a file a checkout trial (at any HEAD) saw the daemon open and the commit lack is still not committed (it names `git add -f <file>`). With no origin it runs `gh repo create brain --private --source . --push`.

A run that crash-loops ends early: the poll stops when serve has restarted the daemon 5 times or `/health` has been silent for 10 polls in a row, the readings and the checkpoint are still saved, the run concludes failure, and it is never relayed. The ladder step probes the model endpoint on the runner first and prints what it found in the log, the job summary and `run.json`: a runner has no Ollama, so the ladder's model arm reads absent while its organism and null arms run.

How to check: `gh run watch <id>` (the deploy prints it), the job summary table (`uptime s | restarts | tick | checkpoint age s | checkpoint bytes | ticks per hour`), and `node bench/cloud-host.mjs`, which reads the runs of the last 7 days with `gh run list` and `gh run download`, read only, and writes `bench/verdicts/cloud-host.json`. `--checkout-trial 90` also boots exactly what a push sends (`git archive HEAD`) on this PC for 90 s; `--counterfactual FILE --repeat 3` adds three trials of HEAD plus that working-tree file and prints their band. Each trial runs in its own process inside a copy the ruler owns: a trial process that dies is recorded with its exit code, what it left running is killed, the copy is deleted, and it is tried once more; copies a dead run left behind are swept before the next trial.

How to stop: commit an empty `state-cloud/STOP` (every step after the check is skipped; the run prints "stopped by state-cloud/STOP" and exits 0), or `gh workflow disable cloud.yml`.

Nothing stays on his PC after the push: the organism runs on the runner, its checkpoint lives in the Actions cache, its readings in the artifacts, and the deploy and the ruler write nothing on the PC but the verdict. Nothing reaches the runner from outside: the health port is published on 127.0.0.1 only.

Measured (`node tools/budget.mjs --ram-mb 6000 --disk-mb 500 ... -- node bench/cloud-host.mjs --checkout-trial 90 --counterfactual bench/fixtures/answer-questions.json --repeat 3`, verdict `bench/verdicts/cloud-host.json`, at 2026-09-25T22:33:30.073Z, replacing the file of 2026-09-25T22:10:15.303Z, barMet false):

- From the host: gh logged in; the repository read; every row that needs a run reads "not measured: cloud.yml is not on the default branch (master) of j4ydenlxl/brain yet".
- On this PC: the workflow parses and passes 27 of 27 structural checks; 10 of 10 tree files it names exist.
- The control, the committed tree alone (HEAD bd04dac, 785 files, 100400578 bytes, 90 s): built false, restarts 6, no checkpoint; the daemon opened `bench/fixtures/answer-questions.json`, which the commit lacks.
- The counterfactual, the same HEAD plus that file (6591 bytes), 3 trials: built 3 of 3, restarts 0, first checkpoint at 2 s, 210..213 ticks/s, daemon peak rss 560..563 MB (the container allows 512 MB; serve kills at 448 MB), budget kills 0..1. All three readings are over 512 MB.
- One trial process of the five died with exit 3221226505 (0xC0000409) at 65.7 s, silently; the ruler recorded it, its copy was deleted, and the retry completed.
- The bar function said true on a planted passing reading and false on each of its 8 planted failures.
- `node --test test/cloud-host.test.mjs`: 24 pass, 0 fail.

## Measured

### The bar: `node bench/cloud.mjs` (2026-09-24T02:33:42Z, node v24.15.0, 308 s)

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

## OPEN

- **OPEN: the organism does not fit 512 MB, and the fix is outside this item.** Three changes, in the owners' files:
  1. `seeds/whole.mjs` should take an episodic option and pass it to `attachMemory(brain, { name, episodic: { maxEpisodes } })`.
  2. `memory/episodic.mjs` `EpisodicStore.from` should cap its restore capacity at `maxEpisodes`; at the bound, `min(n, max) * 2` allocates twice the bound.
  3. serve.mjs will then pass `BRAIN_EPISODES_MAX` from compose.yaml.

  Until then the bar row "restart count 1" stays missed: 14 in 300 s.
- **OPEN: Docker is absent on this machine.** The Docker path of bench/cloud.mjs has never run: build, run with the caps, `docker exec` kill, `docker stats`, the second container. Image bytes are unmeasured. The build context is 877125681 bytes, and the wiki fixtures under bench/fixtures/wiki are most of it.
- **OPEN: the guard lives in the process, not the network.** `fetch`, `http` and `https` are guarded in every node process under the supervisor. Raw `net`/`tls` sockets, `dgram`, and child processes that are not node are not. Worker threads are not measured. A network wall needs an egress proxy or a docker network policy.
- **OPEN: the loopback exception trusts control.json files the organism itself writes.** In a container, loopback is the container. Natively it is the host.
- **OPEN: a duplicate is an exact copy,** the same state and the same generator position. The two copies diverge only through inputs that differ (wall clock, the world). Re-seeding a copy needs a core hook; the seed is recorded in dup-N/meta.json only.
- **OPEN: self-code cannot land inside the image.** /app is root-owned and mounted read-only, so `self/autopilot.mjs` cannot write source there. It needs a writable overlay of the tree under /state, or it must run outside the container.
- **OPEN: the 04:00 ladder inside a container is untested.** The bar ran with `BRAIN_LADDER=off`; the schedule math is tested.
- **OPEN: tools/deploy-host.mjs has only been dry-run** (context, secret scan, plan, and the refusal of a target like `x;rm -rf /`). No host has been deployed to.
