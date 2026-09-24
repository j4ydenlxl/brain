# notes/whole.md: what assembling THE WHOLE BRAIN asked of the core

Everything below was met while writing seeds/whole.mjs, daemon/run.mjs and test/whole.test.mjs.
Each item names the file that owns the fix. Numbers are the ones the commands printed.

## Requests to core/

1. **Mailboxes have no cap** (core/brain.mjs `_deliver` pushes, nothing ever trims). A cell on a
   SEC, MIN or HOUR period fed by a period 1 source hoards every arrival until its period comes
   due, and `snapshot()` serializes every held item. Measured on an 8 major whole with the ledger
   off: 11,534 mailbox items at t=500 growing to 50,894 at t=4000 while the tick rate fell from
   129/s to 86/s; a MIN+1 run of the same brain in test (g) took 13,849,086 ms last night and
   held bench/gate.mjs past its 600 s cap. At 1000 majors a cap of 256 per port still held
   359,356 mailbox items (736 MB of typed array payload) after 100 ticks, next to 214,351 items
   in flight (468 MB) that belong to the organism's own delays. seeds/whole.mjs now trims ports
   on SEC and slower periods to their last 32 items from an afterTick hook (mail holds at 323 to
   352 items over the same 4000 ticks on the 8 major whole); the world clock on period 64 is
   left alone, because a cap of 32 there dropped an armed reflex timer before its due tick and
   test (b) went red. Request: a per-port cap in the core (`policy.mailCap`, drop oldest) so the
   organism itself stays bounded, and a snapshot that stores at most that many items per port.

2. **A Brain restored from a snapshot forgets its kinds.** `Brain.restore` needs every kind
   registered before it runs, and cli/state.mjs `loadBrain` imports only cells/basic.mjs, so
   `brain status whole` against a snapshot that carries substrate, phv.*, memory.*, mind.*,
   world.* and solve cells throws on the first unknown kind unless the daemon is live and the
   command attaches to the control plane. Request: a `kinds` manifest in the snapshot (the module
   that defines each kind) that loadBrain imports before restoring, or a `cells/all.mjs` barrel
   that cli/state.mjs imports.

3. **`growth` accepts no `false`.** `new Brain({ growth: null })` throws inside CoActivation
   (`Cannot read properties of null (reading 'window')`); the only off switch is
   `{ enabled: false }`. Request: treat `growth: false | null` as disabled.

## Requests to other subsystems (their owners' files)

4. **mind/model.mjs: MindModel has no serialize.** The tokenizer does, the model does not, so
   restoreWhole retrains the model from the training text stored in the snapshot extras
   (`whole.mind.text`, 40,000 bytes by default). Measured: training 20,000 bytes took 1,485 ms
   at build. Request: `MindModel.serialize()` / `MindModel.from(j)`.

5. **world/index.mjs: attachWorld's own actuator edges are illegal under the strict rule.**
   `w.http.out` carries [event, sym, vec] and attachWorld connects it to `w.percept.in` [event]
   through Brain.connect (the weaker "some kind can meet" rule), which genome/wire.mjs
   `portPairs` and seeds/organism.mjs `auditWiring` count as a fault. buildWhole therefore calls
   attachWorld with `actuators: false`, adds the four actuators itself, and routes `w.http.out`
   through an ANY port inbox (`w.inbox`, kind memory.working) whose event `top` feeds the border.
   Request: an ANY port on world.relay, or a single kind event `out` on world.http with the
   sym/vec payload inside the event.

6. **simulate/attention.mjs scores every pending signal in scope every tick.** Measured on a
   168 cell whole: 633 ms of a 1,063 ms 100 tick run (6.3 ms per tick) before anything else.
   seeds/whole.mjs runs the hook every 16 ticks (`ATTENTION_EVERY`), which lifted the same brain
   from 43 to 146 ticks/s. Request: an `every` option on attachAttention, and a working memory
   similarity that skips cells whose mailbox is empty.

7. **cells/perception.mjs encode.time costs 2 to 3 ms per run.** Measured per run inside the
   whole: first runs 2.15, 1.98, 1.96 ms, later runs 2.87, 2.93, 3.25 ms, 108 runs in 120 ticks
   for one event period cell (pe.0000.4). It is the single most expensive kind in the organism
   (277 ms of a 446 ms 100 tick run with the attention hook removed). Request: cache the level hypervectors it
   rebuilds, or give it a numeric period.

8. **cells/control.mjs event.filter has no pass-all mode.** With `values: null` it passes only
   when `data[field] === value`, and with both unset every event lacking the field passes, so
   an organism filter is either a wall or a hole. Not needed for the whole; noted because the
   world border relies on event only ports and event.filter is the commonest motor source.

9. **simulate/world.mjs worlds are closures.** defineWorld keeps functions, so the whole's
   `whole.line` world is defined at module load of seeds/whole.mjs and referenced by name from
   the sim.plan cell's params; a snapshot cannot carry a world. Fine for now, recorded.

10. **generations/organism-genome.mjs patches REGIONS in place**, so the daemon runs epochs in
    a worker thread (daemon/generations-worker.mjs) rather than in its own module instance.
    seeds/whole.mjs copies the same try/finally pattern to add the seq.fit and grid.* hosts to
    the rosters for the duration of one build. test/web.test.mjs (roster parity) passed 11/11
    after the change.

11. **Growth alone makes the rate drift.** On the 8 major whole with mail bounded, edges stayed
    at 1,206 from t=500 to t=4000 and the rate still fell 129/s to 97/s with growth enabled;
    with growth disabled the same run held 212/s to 213/s at 548 edges. The co-activation
    tracker (core/connectome.mjs CoActivation) is the remaining cost that rises with time.

## What the whole brain measured about itself

- node bench/whole.mjs (1000 majors, 100,000 units per region, ledger off, the shipped code):
  8,072 cells, 91,159 edges, 0 illegal, 87 kinds; build 3,983 ms; 200 ticks in 54,930 ms,
  3.64 ticks/s, 20,156 runs/s, 13,030 signals/s, 118,823 deliveries/s; rss 471 MB after build
  and 1,295.9 MB after the 200 ticks (arrayBuffers 654.8 MB). The same bench with a mailbox
  cap of 256 ran 200 ticks in 60,650 ms at 3.30 ticks/s with rss 1,615.1 MB after the ticks.
- Build at 16 majors, 256 units per region: 200 cells, 1,296 edges, 0 illegal (strict audit
  over every edge), 9 regions, 86 kinds, 15 skill cells.
- Reflex arc: an event injected at arc.input reached w.clock as a clock.timer proposal at t=64
  (the clock actuator's period) and world.trace walked 94 nodes back to the injected signal.
- `brain live whole --ticks 200 --majors 12 --units 256`: built at t=0, stopped at t=200, 168
  cells, 900 edges at start and 1,565 at the end (growth), 2 checkpoints; the second run with
  `--ticks 100` resumed at t=200 with 168 cells and 1,565 edges and stopped at t=300.
- node --test test/whole.test.mjs: 9 pass, 0 fail, duration_ms 43,890, exit 0 after 44,004 ms wall,
  exits on its own (the earlier green run before the daemon and cap changes: 48,431 ms wall).
- `brain live whole --ticks 400 --majors 12 --units 256 --self-every 150 --gen-every 200`: self
  round 1 done at t=151 (4 candidates, 4 confirmed, 1 applied, 1,052 ms), round 2 at t=301
  (915 ms); generation 1 best og-r1 fitness 0.388331; genome.promote approved for memory, gain
  0.07361033333333333, retimed 24, relearned 8, redelayed 123; t=400, 92 ticks/s, edges 900 to
  1,581, 2 checkpoints, exit 0 in 9,861 ms wall. Before the daemon parked the runner from the
  tick hook, the same run put round 1 at t=300: the runner's setImmediate continuation runs
  in the check phase before the orchestrator's timer, so a wide chunk lands a round one chunk
  late. With a loop on the runner now ticks one tick per chunk.
- The self daemon on the 168 cell whole confirmed conduit.prune candidates with negative gain
  on self.staleRate (treated 0.4715654952076677 vs control 0.47859424920127797, printed as
  -1.4686%) and applied one per round; whether a lower stale rate is the intended direction
  of that metric belongs to self/ (its owner), recorded here as seen.
