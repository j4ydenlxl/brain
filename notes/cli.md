# notes/cli.md: the CLI and the live control plane

No core change was needed. brain/core/*, brain/seeds/* and brain/cells/* were read
only, never edited. Everything below is a behaviour of the existing core that shaped
how bin/brain.mjs and cli/*.mjs were written, plus the numbers those decisions were
measured against.

Files owned: `bin/brain.mjs`, `cli/state.mjs`, `cli/control.mjs`, `cli/ops.mjs`,
`cli/format.mjs`, `cli/run.mjs`, `cli/bench.mjs`, `test/cli.test.mjs`.
`node --test test/cli.test.mjs` from the brain directory: 14 pass, 0 fail.

## Core behaviours the CLI had to work around or work with

- **A signal always costs at least one tick.** `Connectome.arrival(e, t)` is
  `t + 1 + delay[e]`, so an edge declared `{ delay: 0 }` still takes one tick to
  travel. `Brain.inject` is the exception: it schedules at `clock.t + delay`, which
  the next `_tick` picks up. The consequence for a user is that `tick <name> N`
  advances a signal at most N hops down a chain, never N+1, and that a freshly
  injected value needs one tick before the receiving cell sees it at all. The
  `inject` command prints `arrives t=<n>` so this is visible rather than folklore.
  (I first mis-read this as delay-0 edges being stranded in a deleted bucket, wrote a
  throwaway probe, and found the inflight keys were `[1,2,3]`. The probe was right and
  my reading was wrong. Worth stating plainly: the semantics are correct as written.)

- **The ledger buffers, so a short-lived process must flush.** `Ledger` is constructed
  with `flushEvery = 2000` (core/ledger.mjs line 9). A CLI invocation does a handful of
  events and exits, so without an explicit `flush()` every one of them is lost and
  cross-process `trace` sees nothing. `cli/state.mjs` exports `saveBrain(brain, name)`
  which snapshots and flushes together, and every mutating command routes through it.
  Read-only commands load with `ledger: 'off'` instead, so that merely looking at a
  brain never appends to its history.

- **The in-memory ring is empty in a new process.** `Ledger.get(seq)` rescans the file
  per call, which is O(file) per node of a trace tree. `ops.trace` therefore reads
  `ledger/ledger.jsonl` once, builds a `Map` of seq to event, and walks that. This is
  why `trace` works across processes at all.

- **Co-activation cannot be turned off from the outside.** `Brain._tick` always calls
  `this.coact.observe(fired, this.connectome, this.rng)`, which is O(k^2) in the number
  of cells that fired. There is no option for it. `cli/bench.mjs` assigns
  `brain.coact = { observe: () => [], decay: () => {} }` on the arms that are not
  measuring growth, so each arm reports the cost of the thing it names, and makes
  growth an explicit A/B arm instead. Measured on this desk (13th Gen i9-13900KF,
  Node v24.15.0), 120 cells / 112 edges, 250 ticks per side:
  **co-activation costs 28.86x, 25,306 ticks/s down to 877 ticks/s**, growing 5,288
  edges in those 250 ticks. On a brain where most cells fire every tick that quadratic
  scan, not the tick loop, is the wall. Worth a core option one day; the CLI does not
  need one.

- **`source.const` declares ANY on its out port** (cells/basic.mjs line 14), and
  `Brain.connect` refuses when the out kinds are not a subset of the in kinds. ANY is
  not a subset of `['num']`, so a const source can only be wired into an ANY in-port.
  Nothing in the CLI works around this; it is recorded because the error message
  ("does not accept") reads as if the receiver is at fault when the sender is.

- **`Brain.snapshot(dir)` always writes `snapshot.json`** in that directory; there is
  no filename argument. Labelled snapshots are therefore a copy: `saveLabel()` copies
  `snapshot.json` to `snapshots/<label>.json`, and `replay` copies it back into a temp
  directory and calls `Brain.restore` there, so replaying never touches the live state.

- **`Cell` kinds must be registered before `Brain.restore`.** `cli/state.mjs` imports
  `../cells/basic.mjs` for its side effect before importing `core/brain.mjs`, in both
  `loadBrain` and `loadBrainFromFile`. A restore without that import fails on an
  unknown kind.

## Measured: the realtime loop

His manual asks for one tick per millisecond of wall time. The loop never counts its
own ticks as time: it reads the clock, computes `baseTicks + floor(now - baseWall)`,
runs exactly the shortfall, and records that shortfall as drift. Resuming from a pause
rebaselines both, so a pause never registers as drift.

Two ways to park between wakes, both drift-corrected, both reporting what the drift
actually was. 3,000 ticks, `--autosave 0`, on the seed brain:

| mode | wall | rate | max drift | mean drift | samples |
| --- | --- | --- | --- | --- | --- |
| `--realtime` (setTimeout, default) | 3.01s | 996 ticks/s | 17 ticks | 15.306 ticks | 196 |
| `--realtime --spin` (setImmediate) | 3.00s | 1,000 ticks/s | 1 tick | 1 tick | 3,000 |

The default inherits the Windows timer granularity, about 15 ms, which is exactly the
mean drift: the loop wakes about 66 times a second and catches up 15 ticks each time.
`--spin` keeps one core busy and lands within a single tick. Both end at the same `t`;
the difference is the granularity at which the organism experiences time passing,
which matters for anything reacting to real input and not at all for batch work.

## Measured: everything else in `brain bench`

Same machine and Node version, `bench --ticks 5000`:

| arm | shape | rate |
| --- | --- | --- |
| seed | 17 cells, 13 edges, a text event every 64 ticks | 203,551 ticks/s |
| propagate | 120 cells, 112 edges, ledger off, growth off | 22,237 ticks/s, 2,668,446 cell runs/s |
| growth | co-activation on | 877 ticks/s (28.86x slower) |
| ledger-ring | ledger full, memory only, 220.42 events/tick | 5,195 ticks/s |
| ledger-disk | ledger full, JSONL, 55,105 events, 6.96 MB | 2,840 ticks/s |
| persist | snapshot 1.22ms, restore 1.69ms, 86,660 bytes | 722 bytes/cell |

Observability is the second big cost after growth: a full ledger on a brain emitting
220 events per tick costs about 4.3x versus ledger off, and writing it to disk costs
another 1.8x on top.

## Measured: what `brain help` costs to start

cli/ops.mjs pulls in core/cell, core/primitives, core/clock, core/connectome, core/signal,
core/rng and core/simd. cli/control.mjs pulls in node:http and node:crypto. `help`,
`--version` and any argument error need none of that, so ops, control and run are cached
lazy imports rather than static ones. An eager copy of the entrypoint was generated and the
arms interleaved over 15 rounds, best of each:

| arm | best | median |
| --- | --- | --- |
| `node -e 0` (the floor) | 28.3ms | 31.8ms |
| `brain help`, lazy | 35.2ms | 38.2ms |
| `brain help`, eager | 59.2ms | 63.4ms |

The CLI's own load cost is 7ms over a bare node process, down from 31ms. The test does not
assert a timing: it runs the CLI under a `module.registerHooks` load hook and asserts that
`help` loads cli/format.mjs and cli/state.mjs and no core module at all, while `kinds` loads
cli/ops.mjs, core/cell.mjs and strictly more than help. That is the property; the
milliseconds are the reason for wanting it.

## Two subsystems shipped with a different shape than I was given

- **learning.** Specified to me as `learning/registry.mjs` exporting `attach(brain, config)`.
  It shipped with the registry in registry.mjs and `attach` in engine.mjs, both re-exported
  from index.mjs. `loadLearning()` tries the barrel, then each named file, and accepts the
  first module that actually exports `attach`; if none does it names every path it tried.
  Its config keys are `rules`, `order`, `budget`, `printEvery`, `print`, `traceDecay`, `warn`.
  Two adaptations were needed. `attach()` ignores a rule name it does not recognise, so
  `--rules hebian` would have learned nothing and reported success; the CLI checks names
  against `ruleNames()` first and refuses, listing the six that exist. And the engine prints
  its warnings through `config.print`, which defaults to console.log and so would put prose
  on stdout ahead of a `--json` payload; the CLI defaults that to stderr instead.
- **generations.** Specified as `evolve(options)`. The real options are `popSize`,
  `generations`, `untilMs` and `untilFitness`, not the `population`/`seconds` I had been
  given, and the return value carries a live `Engine` object that must not be serialized.
  `evolve` maps `--population` to popSize and `--seconds` to untilMs with a high generation
  cap so the clock is the bound, and reports only `summary` and the history length. Verified:
  `evolve ev --generations 2 --population 20 --episodes 1` ran 2 generations in 145.90ms and
  reported a champion at fitness 0.3658 with the gate holding 2 proposals, 1 approved.
- **viz.** `startViz` returns `{ url, port, close, ready }` where `url` and `port` are live
  getters over `server.address()`. With the default port 0 the kernel has not assigned a port
  until the listen callback fires, so reading `url` immediately gives `http://127.0.0.1:0`
  and a fetch against it fails with EADDRNOTAVAIL. Both call sites await `ready` first, after
  which `GET /` and `GET /api/summary` both answer 200.

## Design decisions worth recording

- **One implementation, two callers.** Every operation is a function
  `(brain, args, env) -> payload` in `cli/ops.mjs`. The control plane calls them
  against the running organism and the offline CLI calls the identical functions
  against a restored snapshot. That is why `status` cannot print different fields
  depending on whether a brain happens to be live, and it is what makes the
  `--json` envelope stable.

- **Liveness is discovered, not declared.** Every command calls
  `connect(state/<name>/)` first. If `control.json` names a port that answers
  `/health`, the command becomes an RPC; otherwise it loads the snapshot. A
  `control.json` left behind by a killed process is deleted on `ECONNREFUSED`, so a
  crash cannot permanently shadow the snapshot path. Tested by writing a
  `control.json` pointing at port 1.

- **The control plane is loopback and token-guarded.** `startControl` binds
  127.0.0.1 on an ephemeral port, writes the port and a random token into
  `control.json`, and requires `x-brain-token` on `POST /rpc`. `close()` removes the
  file. The file is the only discovery mechanism, so anything that can read it can
  drive the brain, which is the same trust boundary as the state directory itself.

- **Autosave means exactly N.** The fast loop originally ticked in 2,000-tick chunks
  and so overshot a 1,000-tick autosave interval, producing 3 saves where 5 were owed.
  The chunk is now clamped to the next autosave boundary. The test asserts exactly 5
  saves and `lastSaveAt === 5000` rather than a lower bound, which is what caught it.

- **Replay determinism is asserted, not assumed.** `replay <name> <label> --ticks N`
  restores the label into a temp directory, re-runs N ticks, and diffs the result
  against the live snapshot. On the seed brain at 3,000 ticks that diff came back
  with `cellChanges: []`, `edgesAdded: []`, `edgesRemoved: []`, `weightChanges: []`.

## Things another subsystem may want

- An option on `Brain` (or a null default) to disable co-activation, so the 28.86x is
  a choice rather than something every caller has to monkey-patch around. Until then
  `bench` is the only place that does it and it says so in a comment.
- `Ledger.get(seq)` is O(file) per call from a cold process. If trace-like tools spread
  beyond the CLI, an index would pay for itself; for now `ops.trace` builds its own.
- Every sibling subsystem is imported lazily inside the command that needs it, wrapped so
  an absent module prints what is missing and which subsystem owns it. Every other command
  works without them, and the suite passes with none of them present: the learning test
  asserts the real behaviour when the module is there and the refusal message when it is not,
  and both outcomes are a pass.

## Answered in core (2026-09-16)

new Brain({ growth: { enabled: false } }) skips the co-activation tracker; core tests 15/15; seedBasic printed 602428 ticks/s on to 980969 ticks/s off over 2000 ticks.

## ask and do (2026-09-17)

Two commands added to `bin/brain.mjs` by the builder of `act/prompt.mjs`. Nothing else in
`bin/brain.mjs` or in `cli/*.mjs` was changed except one word: `approve` was added to
`BOOLEAN_FLAGS`, because without it `brain do <name> --approve <prompt>` would have parsed
the prompt as the flag's value.

```
ask <name> <prompt...> [--provider null|ollama|env] [--model M] [--k N]
do  <name> <prompt...> [--approve] [--provider ...] [--model M] [--cwd D] [--world policy.json]
```

Both follow the `live` pattern: `await lazy('../act/prompt.mjs', 'the prompt surface')`, so
`help`, `--version` and every other command still load none of `act/`, `world/`, `mind/` or
`memory/`. `node --test test/cli.test.mjs` after the change: 14 pass, 0 fail, 13307.9428 ms,
and that suite's own assertion that `help` loads neither the core modules nor the control
plane still passes.

Three things the CLI had to get right, found by running the commands rather than by reading
the code:

- **A held proposal lives in the gate, and the gate is in the snapshot.** The first version
  flushed the ledger and saved nothing when nothing was applied. `brain do` then printed
  `pending 1`, and the very next `brain proposals <name>` printed `(nothing pending)`: the
  proposal was in the ledger and the gate's pending map was gone. Any run that opened a
  proposal now saves. The loop `do` -> `proposals` -> `reject` was then observed end to end:
  `gate proposed=1 approved=0 rejected=0 held=1`, then `proposal #1 world.act rejected`.

- **The ledger's in-memory ring is empty in a fresh CLI process.** `recall` reads the pages
  `act/web.mjs` ingested out of `act.web.ingest` events, so both commands read those rows off
  disk with `readLedgerFile` and hand them in as `opts.events`. Without that a brain that had
  read hundreds of pages would have reported `web pages 0`.

- **An unarmed gate refuses, and says so.** `seedBasic` never calls `armWorld`, so on a fresh
  brain `brain do smoke 'read https://example.com'` prints both proposals as `refused` with
  `this gate was never armed for world.act`, and the footer prints `gate not armed for
  world.act`. `--world <policy.json>` arms it, and the same command then prints `pending 1`.
  That is the correct answer for a brain nobody configured, and it is visible rather than
  silent.

## brain self-code (2026-09-17)

`brain self-code <name> [--approve <id>] [--reject <id>] [--max N] [--timeout MS]` is the
human end of self improvement of the organism's own SOURCE (self/code.mjs, proposal kind
`self.code`). One `describe` entry, one lazy import, nothing else in bin/brain.mjs changed.

With no id it runs the analysis over `bench/verdicts`, puts every candidate to the gate and
prints two tables: what each candidate did at the gate, and what is pending with the
evidence that carried it (the file, the test, the origin, failing assertions before the
patch, passing ones after). With `--approve <id>` it decides the proposal as the human and
applies the patch, printing the file hash before and after and the ledger seq. Nothing
writes a source file on any other path.

Three things the command had to get right, found by running it:

- **`approve` is a boolean flag in this CLI.** `BOOLEAN_FLAGS` already holds `approve` for
  `brain do` and `brain reproduce`, and it is not mine to change, so `--approve 7` parses as
  `opts.approve === true` with `7` left as a positional. The entry reads the id from
  `--approve=<id>` or from the word after it, and refuses with a usage line when neither
  gives an integer.
- **A held proposal lives in the gate, and the gate is in the snapshot**, the same trap
  `brain do` hit above: the listing path calls `saveBrain` even when it applied nothing, or
  the pending proposal would be gone before `--approve` could reach it.
- **`--timeout` re-registers the kind.** The verification timeout belongs to the policy, which
  the gate looks up by kind, so the flag calls `installCodeKind({ timeoutMs })` rather than
  travelling with each candidate.

MEASURED (`node bench/self-code.mjs`, verdict bench/verdicts/self-code.json, 2026-09-18
03:44:35Z, GREEN): `brain init` exit 0, `brain self-code <name> --json` exit 0 reporting
found 0, refused 0, pending 0 on today's verdicts, `brain self-code <name> --approve 999`
exit 1 (`no pending proposal 999`), `brain help self-code` exit 0. `node --test
test/cli.test.mjs` after the change: 14 pass, 0 fail.

## brain do arms its own gate (2026-09-17)

`seeds/basic.mjs` builds a mind, not a reach: it never calls `armWorld`. `core/gate.mjs` does
not know the kind `world.act` until something teaches it, so on a brain straight out of
`brain init` every proposal `brain do` opened came back `refused`, with
`this gate was never armed for world.act: call armWorld(brain.gate, policy) first`. The
surface worked and the human saw nothing to decide. The only way to get a proposal was
`--world policy.json`, which is documented in the help line and in nothing a first run reads.

`brain do` now arms the gate itself when no `--world` is given, with the SHIPPED
`world/policy.json` (`POLICY_FILE`, read through the same `loadPolicy` any policy goes
through). That file's `http.hosts`, `proc.exec` and `fs.roots` are all empty, so arming with
it cannot widen anything: it denies every act. What it changes is that a proposal now EXISTS
and is HELD, listed by `brain proposals <name>` and decided by a human, instead of being
refused before the gate could hold it. `--approve` is untouched and still applies nothing on
its own: with the shipped policy the gate rejects the act even when the human says yes, which
is the correct answer to "may this organism reach a host nobody allowed".

The command says which policy armed it, in the line it prints:

```
pending 1  memory hits 0  web pages 0  llm null 0.00ms  gate armed
world policy: the shipped world/policy.json (no --world was given; it allows no host, no
exec and no root, so every proposal is held for you and none can be applied)
```

and the `--json` payload carries `world: { file, defaulted }` beside `gateArmed`.

MEASURED, `node --test test/act-prompt.test.mjs`, 15 pass 0 fail: the CLI is run as a child
process against a throwaway `BRAIN_STATE_DIR`, `brain init armed --seed basic` then
`brain do armed 'read http://127.0.0.1:1/notes' --provider null --json`, which reports
`gateArmed true`, `world.defaulted true`, one proposal with status `pending`, nothing
applied, and `brain proposals armed --json` then lists it. The matched control is the same
prompt through `doPrompt` with no world policy at all, which is what this command passed
until tonight: `gateArmed false`, status `refused`, reason matching `/never armed/`.

Two things deliberately not done. The `ask` command is not armed, because it proposes
nothing and has nothing to arm. And `live`, which already takes `--world`, is left alone: a
brain that runs for hours is a different question from a brain answering one prompt, and
whoever gives it a reach should have to name it.
