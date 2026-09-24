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

## Open

OPEN: the organism does not fit 512 MB, and the fix is outside this item. Three changes, in the owners' files:
  1. `seeds/whole.mjs` should take an episodic option and pass it to `attachMemory(brain, { name, episodic: { maxEpisodes } })`.
  2. `memory/episodic.mjs` `EpisodicStore.from` should cap its restore capacity at `maxEpisodes`; at the bound, `min(n, max) * 2` allocates twice the bound.
  3. serve.mjs will then pass `BRAIN_EPISODES_MAX` from compose.yaml.

  Until then the bar row "restart count 1" stays missed: 14 in 300 s.
OPEN: Docker is absent on this machine. The Docker path of bench/cloud.mjs has never run: build, run with the caps, `docker exec` kill, `docker stats`, the second container. Image bytes are unmeasured. The build context is 877125681 bytes, and the wiki fixtures under bench/fixtures/wiki are most of it.
OPEN: the guard lives in the process, not the network. `fetch`, `http` and `https` are guarded in every node process under the supervisor. Raw `net`/`tls` sockets, `dgram`, and child processes that are not node are not. Worker threads are not measured. A network wall needs an egress proxy or a docker network policy.
OPEN: the loopback exception trusts control.json files the organism itself writes. In a container, loopback is the container. Natively it is the host.
OPEN: a duplicate is an exact copy, the same state and the same generator position. The two copies diverge only through inputs that differ (wall clock, the world). Re-seeding a copy needs a core hook; the seed is recorded in dup-N/meta.json only.
OPEN: self-code cannot land inside the image. /app is root-owned and mounted read-only, so `self/autopilot.mjs` cannot write source there. It needs a writable overlay of the tree under /state, or it must run outside the container.
OPEN: the 04:00 ladder inside a container is untested. The bar ran with `BRAIN_LADDER=off`; the schedule math is tested.
OPEN: tools/deploy-host.mjs has only been dry-run (context, secret scan, plan, and the refusal of a target like `x;rm -rf /`). No host has been deployed to.

## Budgets

Every process this item launched declared a heap: the bench 512 MB, the supervisor 96 MB, the daemon 224 MB, the probes 64 to 128 MB, the tests 2048 MB. One bench ran at a time, and free RAM read 47 GB (PowerShell) at the bar. Nothing wrote over 200 MB: state was 70879317 bytes at the end of the bar, in a temp dir that the bench deleted.
