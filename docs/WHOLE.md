# THE WHOLE BRAIN

One persistent organism. Every subsystem that existed as its own module now sits in one
connectome (`seeds/whole.mjs`), runs in one process (`daemon/run.mjs`, started by `brain live`),
and is proved end to end by `test/whole.test.mjs`. Every number below was printed by
`node bench/whole.mjs` (verdict in `bench/verdicts/whole.json`) or by the commands named.

## The map: nine regions, what fills each

| region | filled by | cells at 1000 majors |
| --- | --- | --- |
| perception | organism majors (encode.*, sdr, grid.* hosts), `pe.sub.0` substrate, `arc.input`, `w.percept` border, `w.inbox` | 1,445 |
| association | organism majors (hv.*, seq.fit host), `as.sub.0`, phasor circuit `as.phv.*`, `arc.encoding` | 1,769 |
| cognitive | organism majors, `co.sub.0`, `cap.solve` + 15 `skill.*` cells, `arc.processing/integration/decision`, `ws.hub`, `att.goal`, `sim.model/plan/decide` | 1,626 |
| memory | organism majors, `me.sub.0`, `mem.working/episodic/semantic/sequence/self/consolidate/forget`, phasor memory `me.phv.*` | 1,213 |
| motor | organism majors, `mo.sub.0`, `arc.action`, `w.motor` border | 804 |
| homeostasis | the clock roster (periods 1, SEC, MIN, HOUR), `ho.sub.0`, `lrn.reward/error/mod` | 645 |
| generations | organism majors, `ge.sub.0` | 562 |
| language | `lang.tokenize`, `lang.context`, `lang.assoc`, `lang.decode` (mind/index.mjs, sealed) | 4 |
| world | `w.http`, `w.fs`, `w.proc`, `w.clock` actuators (world/index.mjs policy, gate armed) | 4 |

Every region also carries one `ws.submit.<prefix>` cell feeding the workspace hub. The learning
engine (`learning/`, rule hebbian, brain wide) and the memory system (`memory/`) are attached as
services; the skill registry (`capability/`) is induced at build and carried in the snapshot.

## The information flow, with delays

Sensory input, encoding, processing, integration, decision, action, consequence: one relay per
stage, wired in that order with the delay printed by `node -e` from `ARC`:

`w.percept` (world) -> `arc.input` (perception, +0) -> `arc.encoding` (association, +1) ->
`arc.processing` (cognitive, +2) -> `arc.integration` (cognitive, +1) -> `arc.decision`
(cognitive, +1) -> `arc.action` (motor, +2) -> `w.motor` -> the four actuators -> proposals
through the gate -> outcomes and timer events back into `w.percept`.

Each stage fans out into up to 3 event ports of its region and takes 2 back, so the organism's
own circuits ride the spine. `arc.processing` also feeds `cap.solve` (a verified answer returns
to `arc.decision`), `arc.integration` feeds the planner `sim.plan` whose `decide.argmax` choice
also lands on `arc.decision`, `w.percept` feeds `lang.tokenize`, and `lang.assoc` sends its
prediction error to `lrn.error` and its predictions into episodic memory.

Proof (test b): an event injected at `arc.input` became a `clock.timer` proposal at `w.clock` at
t=64 and `world.trace` walked 94 nodes back to the injected signal. Every edge added by the whole
goes through the strict `Wiring` of genome/wire.mjs; `auditWiring` over all 91,159 edges at 1000
majors found 0 faults.

## Timescales (bench, 200 ticks at 1000 majors)

| period | cells | runs in 200 ticks |
| --- | --- | --- |
| 1 | 1,019 | 203,800 |
| 64 (`w.clock`) | 1 | 4 |
| SEC | 864 | 864 |
| MIN | 554 | 554 |
| HOUR | 318 | 318 |
| event | 5,316 | 901,631 |

The seven substrate majors (100,000 units each) fired 1,057,601 / 1,078,455 / 1,107,408 /
1,047,422 / 1,084,980 / 1,116,419 / 1,090,872 units (perception through generations) over the
200 ticks. Attention scores every 16 ticks; a port on a period of SEC or slower keeps its last
32 items (notes/whole.md, request 1).

## The slow loops (proved with `brain live whole --ticks 400 --majors 12 --units 256 --self-every 150 --gen-every 200`)

Self-improvement (`self/daemon.mjs`, default every 20,000 ticks) runs in process: the tick hook
parks the runner on the due tick, a round trials candidates in isolated clones and applies at
most one through the gate, then the runner resumes. Organism generations (`generations/epochs.mjs`,
default every 100,000 ticks) step in a worker thread (`daemon/generations-worker.mjs`); the
elite's fitness against the last promoted control becomes a `genome.promote` proposal, and an
approved one applies the elite's region genes through `applyRegionGenes`. Printed by that run
(re-run 2026-09-17 on a fresh state, bench/verdicts/whole-live.json): round 1 (4 candidates, 4
confirmed, 1 applied, 655 ms) done at t=151 and round 2 (1,092 ms) at t=301; generation 1 best
og-r5 fitness 0.391589, `genome.promote` approved for region perception, gain 0.00916100000000003,
applied: retimed 15, relearned 7, redelayed 56; stopped at t=400, 129 ticks/s, edges 906
to 1,688, 2 checkpoints, exit 0. A retimed cell keeps the
runs it made on its old period, so the printed runs per period after a promotion read by the
period each cell ends on.

## The bench numbers (`node bench/whole.mjs`, 1000 majors, 100,000 units per region, ledger off)

- build 3,983 ms: organism 634, substrates 183, skills 378, mind 2,764, world 3
- cells 8,072, edges 91,159 (live 91,159), regions 9, kinds 87, illegal edges 0
- memory: rss 83.5 MB before build, 471 MB after build (heap 33.3 MB, arrayBuffers 88.4 MB),
  1,295.9 MB after 200 ticks (heap 157.9 MB, arrayBuffers 654.8 MB)
- 200 ticks in 54,930 ms: 3.64 ticks/s, 20,156 runs/s, 13,030 signals/s, 118,823 deliveries/s,
  0 edges grown
- per-region runs: perception 207,043, association 258,678, cognitive 199,706, memory 168,012,
  motor 118,691, homeostasis 86,378, generations 67,259, language 800, world 604

## Starting it, resuming it, stopping it

```
brain live                      # builds state/whole/ at 200 majors, 10,000 units, ticks forever
brain live --ticks 200          # 200 ticks, checkpoint, exit (the test's path)
brain live big --majors 1000 --units 100000 --checkpoint 500 --realtime --viz
```

`live` builds the whole when `state/<name>/snapshot.json` is absent and resumes it otherwise
(`restoreWhole`: cells, connectome, gate, in flight signals and mailboxes from the snapshot; the
memory system, skill registry, world policy and the language model retrained from the stored
training text from the snapshot's `whole` extras). It checkpoints every N ticks (`--checkpoint`,
default 1,000): `snapshot.json`, the ledger flushed to `ledger/ledger.jsonl`, `meta.json`, plus
`self/checkpoint.json` and `generations/gen-*.json` when those loops ran. SIGINT, SIGTERM and
SIGBREAK stop the runner, take a final checkpoint, close the control plane and the world's
timers, then exit. Proof (test e): `--ticks 200` stopped at t=200 and a second `--ticks 100`
resumed at t=200 with the same 168 cells and 1,565 edges, stopping at t=300; the loops run above
resumed at t=400 in 1,653 ms with its 1,688 edges and stopped at t=500 (70 ticks/s, 1
checkpoint, round 3 in 1,056 ms at t=451, generation 2 best og-g1-3 fitness 0.477565, edges 1,750 at the end).

## Attaching the CLI and the viz

While `brain live` runs it writes `state/<name>/control.json`; every other command attaches to
the live organism through it: `brain status whole`, `brain inspect whole cap.solve`,
`brain inject whole arc.input in event '{"afterMs":0,"key":"reflex"}'`, `brain trace whole <seq>`,
`brain proposals whole`, `brain approve whole <id>`, `brain pause|resume|step|snapshot whole`,
`brain stop whole`. Start the viz in the same process with `brain live --viz [--viz-port P]`; it
reads the live brain, so it shows the whole (an offline `brain viz whole` would restore the
snapshot without the whole's kinds registered, see notes/whole.md request 2).
