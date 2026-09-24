# BRAIN Architecture

Audience: an engineer joining the project who has read `brain/MANUAL.md` section A (the
owner's vision) and `brain/DESIGN.md` (the mapping from that vision to a build plan) but
has not yet read the code. This document describes what exists in `brain/core/` as of
this writing, then walks one tick end to end on a real example, then traces one output
back to its sources, then lists what is designed but not yet built.

Zero runtime dependencies. Node 24, ECMAScript modules. Every core file is under 260
lines; the whole of `core/` is about 1,200 lines (`wc -l core/*.mjs`).

## 1. Repository layout

```
brain/
  MANUAL.md          the owner's vision (section A, verbatim) and progress log (section B)
  DESIGN.md           his WHAT mapped to the engineering HOW
  research/            batch-1.md (sourced notes) and SYNTHESIS.md (what we build and why)
  core/                 the organism: signal, cell, connectome, clock, ledger, gate, scheduler, primitives, rng, brain
  cells/basic.mjs       the first library of concrete cell kinds, built from primitives
  seeds/basic.mjs       a small example brain wiring perception -> association -> cognitive -> motor -> memory
  test/core.test.mjs    node:test coverage of core/
  tools/reorient.mjs    a SessionStart/PostCompact hook, unrelated to the runtime
  bench/verdicts/       where bench output lands (empty until a bench script runs)
  docs/                 this document and its siblings
```

There is no `bin/brain.mjs` (CLI), no memory, learning, generations, simulate, or viz
module yet. Section 8 below lists those as planned.

## 2. The quantum: six signal kinds

`core/signal.mjs` defines the single wire format that moves between cells, a `Signal`:
`{ kind, data, t, gen, src, port, seq }`, built by `signal(kind, data, meta)`. `kind` is
one of six values in `KINDS`:

| kind | data shape | what it is for |
|---|---|---|
| `hv` | `Int8Array(8192)`, values +1/-1 | composable concepts and roles (hyperdimensional computing / VSA) |
| `sdr` | `{ n, idx: Uint32Array }` sorted | cheap sparse wire format, overlap-as-similarity |
| `num` | `{ type: 'rat'\|'int'\|'float', n, d }`, BigInt numerator/denominator | exact quantities, never text |
| `sym` | `{ op, args, value?, name? }` expression tree | algebra, evaluated and verified exactly |
| `vec` | `Float32Array` | dense activations for small neural-network cells |
| `event` | plain object | control and external I/O |

The rationale (`DESIGN.md` section 1, "tokens to quanta") is sourced to what large
language models get wrong with numbers: byte-pair encoding fragments digits and loses
place value, and the fixes that work are only available when training from scratch
(source 11 in `research/batch-1.md`, survey by Ni 2026, arXiv 2608.13129). A `num` signal
is a BigInt rational, so `9.11 < 9.9` compares correctly by construction; `test/core.test.mjs`
asserts exactly this.

Three operations give hypervectors their algebra: `bind(a, b)` (elementwise product,
self-inverse), `bundle(list, weights)` (weighted majority superposition, so the result
stays similar to every member), and `permute(a, k)` (cyclic roll, marks sequence
position or role). `hvSequence(items)` chains permute and bundle to encode an ordered
sequence. Random hypervectors are quasi-orthogonal (similarity near 0), which is what
makes superposition useful: bundling several concepts together does not destroy their
individual identities. `ItemMemory` is the codebook, named hypervectors with
nearest-neighbour cleanup. This is sourced to hyperdimensional computing / vector
symbolic architecture surveys (source 13, arXiv 2111.06077) and to sparse distributed
representation research for the `sdr` kind (source 24, Ahmad and Hawkins, arXiv
1503.07469), both in `research/batch-1.md`.

## 3. The cell contract

`core/cell.mjs` is the registry and runtime for cell kinds. A kind is registered once
with `defineKind(name, def)`:

```js
defineKind('num.compare', {
  ports: { in: [{ name: 'a', kinds: ['num'] }, { name: 'b', kinds: ['num'] }],
           out: [{ name: 'out', kinds: ['event'] }] },
  init: () => ({ a: null, b: null }),
  compute: (ins, cell) => { /* ... */ },
});
```

`compute(ins, cell, ctx)` receives `ins[portIndex] = [{ sig, w, edge, from }, ...]`, the
signals delivered to each in-port since the cell last ran, and returns one entry per
out-port: `{ kind, data }` to emit, or `null` to stay silent on that port. `runCell()` in
the same file enforces the contract at every run: an output on a kind the port did not
declare throws, and a thrown `compute` is caught, counted in `cell.stats.errors`, and
logged as a `cell.error` event rather than crashing the tick.

`createCell(spec)` instantiates a cell from its kind: `{ id, idx, kind, region, circuit,
ports, params, policy, state, memory, stats, mailbox }`. `policy` is `{ period, priority,
budget, backend, learn }` (defaults in `DEFAULT_POLICY`); `period` is either a positive
integer number of ticks or the string `'event'` (see section 5). `state` is whatever the
kind's `init(params, cell)` returns and must be serializable; `memory` starts as
`{ working: [], refs: {} }`; `stats` tracks `runs, skips, cost, lastT, surprise, errors,
fired`. A cell's `mailbox` has one array per in-port, filled by the brain as signals
arrive and drained each time the cell runs.

Wiring is checked before it can be wrong: `Brain.connect()` (section 6) compares the
`kinds` declared on the source out-port against the destination in-port and throws if
any produced kind is not accepted, so a type mismatch is a wiring-time error, never a
run-time surprise.

`cells/basic.mjs` is the first concrete library, kinds such as `encode.hv` (text/event to
hypervector), `hv.bundle`/`hv.bind`/`hv.permute`/`hv.cleanup`, `num.arith`/`num.compare`
(exact rational arithmetic and comparison), `sym.solve`/`sym.verify` (linear algebra,
`core/primitives.mjs`'s `solveLinear` and `verify`), `vec.mlp` (one hidden layer with a
local delta rule), `predict.next` (prediction and surprise), `memory.assoc` (associative
recall by hypervector nearest neighbour), `state.machine`, and `route.key`. Every one of
these is composed from the sixteen primitives in `core/primitives.mjs`
(`transform, compare, bind, bundle, permute, aggregate, integrate, count, verify, route,
gate, predict, simulate, remember, retrieve, evaluate`), which hold no state of their
own; state lives only in cells.

## 4. The connectome: typed arrays, not objects

`core/connectome.mjs`'s `Connectome` class stores every edge as a row across ten parallel
typed arrays (`src, dst` as `Uint32Array`; `srcPort, dstPort, flags` as `Uint8Array`; `w,
conf` as `Float32Array`; `delay` as `Uint16Array`; `usage` as `Uint32Array`; `lastT` as
`Float64Array`), indexed by an integer edge number. This is deliberate for the scale the
project targets (`DESIGN.md` section 0, `MANUAL.md` section A's "5,000+ neural nodes
scalable to millions"): a million edges is a few tens of megabytes of packed numbers, not
a million small objects.

`outOf(node)` and `into(node)` return the edge numbers for a node's outgoing and incoming
edges as array-slice views, built from a lazily computed CSR-style index (`_bySrc,
_byDst`, rebuilt only when `_dirty`, i.e. after an edge is added). This keeps
propagation, `Brain._emit()` walking `outOf(cell.idx)` every time a cell fires, a tight
loop over a contiguous slice rather than a scan or a hash lookup per edge.

Every edge carries a learned weight `w`, a delay in ticks, usage and last-touch
statistics, a confidence value, and status flags (`ACTIVE = 1, DORMANT = 2, PRUNED = 4`).
`strengthen(e, pre, post, eta, alpha)` applies Hebbian learning with decay, `dW = eta *
pre * post - alpha * W`, clamped to `±wMax`, the rule measured on the whole fly
connectome (source 03 in `research/batch-1.md`, Rojas Aliaga 2026, FlyWire v783,
138,639 neurons and 15,091,983 synapses at 0.2 ms steps on one consumer GPU). Strengthening
and weakening a weight happen freely during a tick. Growing, pruning, or replacing an
edge do not: those are structural changes and must be approved by the gate (section 7)
before `Brain._tick()` calls `connect()` or `Connectome.prune()`.

`CoActivation` is the growth signal: it counts pairs of cells that fire in the same tick
with no edge between them (`observe(firedIdx, connectome)`), and when a pair's count
reaches a threshold (default 8), it is reported once so the brain can propose growing an
edge between them.

## 5. The two-axis clock

`core/clock.mjs`'s `Clock` carries two counters, both stamped onto every signal:

- `t`, wall ticks, base unit 1 ms logical. `Clock.due(t)` returns exactly the periodic
  cells scheduled for tick `t`, by checking `t % period === 0` only for periods that have
  at least one registered cell (`this.periods`, kept sorted), not by scanning every cell
  every tick. A cell with `policy.period = 'event'` is never in the wheel; it is checked
  separately (section 6) for a non-empty mailbox.
- `gen`, generation ticks, advanced independently of `t` by `advanceGen()`. This is the
  hook for "warped time", the generations engine (section 8) evaluating many episodes per
  wall second without those episodes consuming wall ticks.

`Clock.label(period)` renders a period as `'1ms'`, `'8s'`, `'1min'`, and so on, for
inspection and the planned viz.

## 6. The scheduler: an attention economy

`core/scheduler.mjs`'s `Scheduler.allocate(dueCells, regions)` groups the cells due this
tick by region, and for any region with a finite `budget` (the default is
`Infinity`, meaning unmetered), sorts that region's due cells by bid and funds them in
order until the budget is spent:

```js
static bid(cell) {
  let pending = 0;
  for (const m of cell.mailbox) pending += m.length;
  return cell.policy.priority * (1 + cell.stats.surprise) * (1 + Math.min(pending, 16));
}
```

A cell whose recent predictions were wrong (high `stats.surprise`, set by cells like
`predict.next` and `vec.mlp` in `cells/basic.mjs`) or that has unread mail bids higher and
is more likely to be funded on a constrained region. Unfunded cells are skipped for that
tick (`cell.stats.skips++`) and keep their mailbox for the next time they are due; nothing
is lost, only delayed. This is the design's resource-allocation requirement
(`DESIGN.md` section 10, `MANUAL.md` section A, "cannot afford to operate every component
at maximum intensity"), sourced to Hyperon's ECAN attention economy and the Global
Workspace selection-broadcast cycle (sources 08 and 21 in `research/batch-1.md`).

## 7. The gate: computation is not authority

`core/gate.mjs`'s `Gate` is the one path through which a structural or external change
can happen. `PROPOSAL_KINDS` lists nine kinds: `edge.grow, edge.prune, edge.replace,
cell.add, cell.remove, cell.rule, region.add, external.action, genome.promote`. A caller
(a cell, the co-activation tracker, or eventually the generations engine) calls
`gate.propose({ kind, what, why, evidence, by }, ctx)`. Three kinds
(`external.action, cell.rule, region.add`) always hold for a human, regardless of
policy, via the `humanRequired` set in the constructor. Every other proposal is decided
by the active policy, built by `makePolicy({ growThreshold, pruneStale, pruneFloor })`:

- `edge.grow` approves only when `evidence.coActivations >= growThreshold` (default 8),
  else rejects.
- `edge.prune` approves only when the edge is both stale
  (`evidence.staleTicks >= pruneStale`, default 1000) and weak
  (`|evidence.w| < pruneFloor`, default 0.05), else rejects.
- `edge.replace` approves at the same co-activation bar as growth, else holds.
- `cell.add` / `cell.remove` approve only when `evidence.testsPassed === true`, else hold.
- `genome.promote` approves only when `evidence.gain > 0` and `evidence.beatControl ===
  true`, else rejects.
- everything else holds.

Every proposal is written to the ledger before it is decided (`proposal.seq =
this.ledger?.append(...)`), and every decision is written after
(`type: 'decision'`), so the gate leaves a complete, ordered record of what was asked and
what happened, sourced to the Darwin Godel Machine's empirical-validation gate before a
change is kept (source 04, arXiv 2505.22954, `research/batch-1.md`) and to the manual's
requirement that reasoning about a change never grants permission to make it (`MANUAL.md`
section A).

## 8. The ledger: every event, and how to trace one back

`core/ledger.mjs`'s `Ledger` is an append-only log. `append(ev)` assigns a monotonic
`seq`, stores the event in an in-memory ring buffer (`ringSize`, default 100,000), and,
when a directory is configured, batches it to `ledger.jsonl` (`flushEvery`, default
2000 events). Event types written by `core/brain.mjs` include `region.add, circuit.add,
cell.add, edge.add, signal, cell.run, edge.prune, proposal, decision, snapshot, restore,
cell.error`. `Ledger.recent(n, type)` reads backward from the current sequence;
`Ledger.get(seq)` reads one event, from the ring if still present, else by scanning the
JSONL file.

The field that makes provenance possible is `consumed`: every `cell.run` event lists the
`seq`s of the signals the cell drained from its mailbox before running, and every
`signal` event carries `from`, the `seq` of the `cell.run` (or `null` for an externally
injected signal) that produced it. `Ledger.trace(seq, depth)` walks this chain upstream,
depth-limited and deduplicated, alternating `cell.run -> consumed signals -> the cell.run
that emitted each -> ...`, and returns every node and edge visited. This is the concrete
mechanism behind the manual's requirement that a researcher be able to "trace an
important result backward through the computational graph and determine which cells,
circuits, memories, predictions, and connections contributed to it" (`MANUAL.md`
section A). Section 10 below runs a real trace.

## 9. Brain: one tick, step by step

`core/brain.mjs`'s `Brain` owns a `Connectome`, a `Clock`, a `Ledger`, a `Gate`, a
`Scheduler`, and the cell array. `Brain.tick(n)` calls `_tick()` `n` times. Each `_tick()`
does exactly this, in order, for the current wall tick `t = this.clock.t`:

1. **Deliver.** `_deliver(t)` drains `this.inflight.get(t)`, the map of signals scheduled
   to arrive at tick `t`, and pushes each into its destination cell's mailbox. The map
   entry is deleted once read; nothing revisits tick `t` after this point.
2. **Find who is due.** `Clock.due(t)` returns periodic cells whose period divides `t`;
   separately, every `event`-period cell with a non-empty mailbox is added to the due
   list.
3. **Allocate the budget.** `Scheduler.allocate(due, regions)` decides, per region, which
   due cells are funded this tick (section 6).
4. **Run funded cells.** For each funded cell: its mailbox is swapped out for fresh empty
   arrays (so it only ever sees signals delivered up to this point), `runCell()` (section
   3) calls its `compute`, a `cell.run` ledger event is written recording which signal
   `seq`s were consumed, and every non-null output is handed to `_emit()`.
5. **Emit and route.** `_emit(cell, port, out, runSeq)` builds a `Signal`, logs a `signal`
   event (`from: runSeq`), and, for every active outgoing edge whose `srcPort` matches
   the port that fired, schedules delivery via `_schedule(t + 1 + edge.delay, ...)`. The
   `+ 1` is not the edge's delay, it is the minimum propagation latency: the tick-`t`
   delivery bucket was already drained in step 1 of this same `_tick()` call, so
   scheduling at exactly `t` would silently lose the signal; the code comments this
   explicitly at `core/brain.mjs:115-117`. An edge with `delay: 0` therefore arrives one
   full tick after the cell that emitted it ran; an edge with `delay: k` arrives `k + 1`
   ticks after. A port with no outgoing edges routes its signal to `this.outbox` instead
   (for external consumption).
6. **Local learning.** If a cell's `policy.learn === 'hebbian'`, every edge that delivered
   into it this tick is strengthened or weakened (`Connectome.strengthen`) using the
   delivered signal's `activity()` as the presynaptic term and whether the cell fired as
   the postsynaptic term.
7. **Circuit memory.** Each circuit a fired cell belongs to appends `{ t, cell }` to its
   `working` ring (capped at 32).
8. **Growth.** `CoActivation.observe(fired, connectome)` reports any cell pair that just
   crossed the co-activation threshold with no edge between them; each becomes an
   `edge.grow` proposal through the gate (section 7), and an approved one is wired
   immediately with a small starting weight (`w: 0.1`).
9. **Pruning.** Every `pruneEvery` ticks (default 1000), stale-and-weak edges
   (`Connectome.pruneCandidates`) each become an `edge.prune` proposal.
10. **Advance.** `hooks.afterTick` fire, `stats.ticks` increments, and `Clock.advance()`
    moves `t` to `t + 1`.

`Brain.inject(cellId, port, { kind, data }, { delay, w })` is the one entry point for
signals with no producing cell: it validates the kind against the port, logs a `signal`
event with `from: null`, and schedules delivery the same way `_emit` does.

## 10. A worked example: one injected event through the seed brain

`seeds/basic.mjs`'s `seedBasic()` wires five regions (`perception, association,
cognitive, motor, memory`) with cells built from `cells/basic.mjs`. The following was run
against the current code (not hypothetical output; reproduce with the command shown) by
injecting one `event` signal, `{ text: 'greet' }`, into `p.encode`'s `in` port, then
calling `tick()` eight times:

```js
import { seedBasic } from './seeds/basic.mjs';
const b = seedBasic({ dir: null, ledger: 'full' });
b.inject('p.encode', 'in', { kind: 'event', data: { text: 'greet' } });
for (let i = 0; i < 8; i++) b.tick();
```

What happened, tick by tick (all times below are the wall tick `t` at which the named
`cell.run` event was logged):

- **t = 0.** The injected signal (ledger `seq 45`) is delivered into `p.encode`'s
  mailbox by the very first `_deliver(0)`, making the event-period cell `p.encode` due
  immediately. It runs (`seq 49`, `consumed: [45]`), tokenizing `"greet"` and encoding it
  as a hypervector via `encode.hv`'s `ItemMemory`, and emits on its `hv` out-port
  (`seq 50`). That port fans out over four edges: to `p.log` (delay 0), `a.bundle` (delay
  1), and `m.assoc`'s `key` (delay 0) and `query` (delay 2) ports. Per the `t + 1 + delay`
  rule (section 9, step 5), these arrive at wall ticks 1, 2, 1, and 3 respectively.
- **t = 1.** `p.log` runs (`seq 51`, consuming `seq 50`) and records the hypervector's
  hash in its working memory. `m.assoc` also runs on its `key` port (`seq 52`), storing
  the hypervector as a pending key (no `value` has arrived yet, so it emits nothing).
- **t = 2.** `a.bundle` runs (`seq 54`, consuming `seq 50`), bundling the one hypervector
  it has seen, and emits an (unchanged, single-member bundle) hypervector (`seq 55`),
  which fans out with delay 1 to `a.predict`'s `observe` port and `a.cleanup`'s `hv`
  port, both arriving at t = 4.
- **t = 3.** `m.assoc` runs again, now on its `query` port (`seq 56`), searching its
  (still valueless) store and emitting a `{ hit: false, ... }` event (`seq 57`); this port
  has no outgoing edge in the seed wiring, so it lands in the brain's `outbox`.
- **t = 4.** `a.predict` (`seq 58`) and `a.cleanup` (`seq 60`) both consume `seq 55`.
  `a.cleanup` looks up the nearest named concept in its own `ItemMemory` (empty of
  labels, since nothing has trained it yet) and emits `{ name: null, sim: ... }`
  (`seq 61`), routed with delay 1 to `c.route`'s `in` port.
- **t = 6.** `c.route` runs (`seq 62`, consuming `seq 61`). Its routing table only maps
  the keys `greet, ask, stop` to ports `a, b, c`; since the event's `name` field is
  `null` (no label was ever taught), it falls through to the default port `d`
  (`params.dflt = 3`) and emits there (`seq 63`). Port `d` is not wired to `mo.fsm` in
  `seeds/basic.mjs` (only `a, b, c` are), so this event also lands in the outbox rather
  than reaching the motor region; `mo.log`'s working memory stays empty for this run.

This example is deliberately unglamorous: it shows a real, unlearned brain producing no
interesting action, exactly what "no name has been taught yet" should look like, and it
demonstrates the delivery-timing rule, the fan-out of one signal across multiple edges
with different delays, and a signal falling through to the outbox when routing or wiring
does not carry it further.

## 11. Provenance: tracing one output back to its sources

Continuing the same run, `b.ledger.trace(62)` (the `cell.run` event for `c.route`) walks
upstream through eight ledger events and returns them in visit order:

```
62  cell.run  c.route    t=6  consumed:[61]
61  signal    a.cleanup  t=4  from:60
60  cell.run  a.cleanup  t=4  consumed:[55]
55  signal    a.bundle   t=2  from:54
54  cell.run  a.bundle   t=2  consumed:[50]
50  signal    p.encode   t=0  from:49
49  cell.run  p.encode   t=0  consumed:[45]
45  signal    external   t=0  from:null
```

with edges `[[61,62],[60,61],[55,60],[54,55],[50,54],[49,50],[45,49]]`. Read backward to
forward, this is the exact chain: an external injection (45) was consumed by `p.encode`
(49), which emitted a hypervector (50) consumed by `a.bundle` (54), which emitted a
bundled hypervector (55) consumed by `a.cleanup` (60), which emitted a cleanup result
(61) consumed by `c.route` (62). No step in that chain is inferred or approximate; every
edge in the trace is a `seq` number that some ledger event actually recorded as
consumed or as its `from`. This is what `trace()` gives a researcher for any cell, edge,
proposal, or decision in the system: the exact set of prior cells, signals, and (when the
subsystem exists) memories and predictions that contributed to it, not a summary or a
best guess.

## 12. The subsystems above `core/`, and the command that checks each

Sections 1 to 11 describe `core/`. Everything `DESIGN.md` and `MANUAL.md` section A ask
for above it now has code, a test file under `test/`, and in most cases a bench that writes
a verdict under `bench/verdicts/`. This list is the map. The number behind any claim is in
`docs/NUMBERS.md`, which `node tools/numbers.mjs` regenerates from the verdict files and
from nowhere else.

- **Memory tiers** (`memory/`). `working.mjs`; `episodic.mjs`, a signature-indexed store
  with a bound (past `maxEpisodes` the oldest cold episodes leave first, then the oldest
  warm ones); `semantic.mjs`, the modern Hopfield cleanup with every pattern resident in a
  wasm arena so one update is two kernel scans; `procedural.mjs`; `sequence.mjs`
  (permutation chaining); `self.mjs`; and `index.mjs`, which composes them into the
  `MemorySystem` a cell reaches through `sysOf(cell)`. Consolidation is
  `SemanticMemory.consolidateFromEpisodic`. Check: `node --test test/memory.test.mjs`
  (the index at 100k episodes is a test there); the arena against the JS path, lane for
  lane and timed: `node bench/semantic.mjs`.
- **Learning** (`learning/`). `hebbian.mjs`, `delta.mjs`, `predictive.mjs`,
  `reinforcement.mjs`, `structural.mjs`, `homeostatic.mjs`, registered in `registry.mjs`
  and driven by `engine.mjs`. `node bin/brain.mjs rules` lists them with scope and
  defaults; `node bin/brain.mjs learn <name> --rules a,b --ticks N` attaches them. Check:
  `node --test test/learning.test.mjs`.
- **Generations** (`generations/`). `genome.mjs`, `organism-genome.mjs`, `mutate.mjs`,
  `crossover.mjs`, `species.mjs`, `archive.mjs`, `evaluate.mjs`, `engine.mjs`,
  `epochs.mjs`, `worker.mjs`, and the tasks under `generations/tasks/`.
  `node bin/brain.mjs evolve <name> --task race` runs it; `node bench/evolve.mjs` and
  `node bench/epochs.mjs` write the verdicts. Check: `node --test test/generations.test.mjs
  test/genome.test.mjs test/epochs.test.mjs`.
- **Simulation** (`simulate/`). `clone.mjs` (copy-on-write clones of a subgraph),
  `simulator.mjs`, `planner.mjs`, `attention.mjs`, `workspace.mjs`, `world.mjs`. Check:
  `node --test test/simulate.test.mjs`.
- **Capability** (`capability/`). `induce.mjs` (program search), `skills.mjs`,
  `router.mjs`, `market.mjs` (the synthetic market with its control arm).
  `node bench/capability.mjs` writes the verdict. Check: `node --test
  test/capability.test.mjs test/tasks.test.mjs`.
- **Mind** (`mind/`). The cell-native language model: `tokenizer.mjs`, `model.mjs`,
  `corpus.mjs`, `generate.mjs`, `cli.mjs`. `node bench/mind.mjs` writes the verdict.
  Check: `node --test test/mind.test.mjs test/lang.test.mjs`.
- **Self** (`self/`). `observe.mjs`, `propose.mjs`, `trial.mjs` (a treated clone against a
  matched control clone), `apply.mjs` (through the gate), `daemon.mjs`.
  `node bench/self.mjs` writes the verdict. Check: `node --test test/self.test.mjs`.
- **Lab** (`lab/`). `experiment.mjs`, `isolate.mjs`, `compare.mjs`, `replay.mjs`,
  `cost.mjs`, `integrate.mjs`, and the experiments under `lab/experiments/`.
  `node bin/brain.mjs lab run all` runs them; `node bench/lab.mjs` writes the verdict.
  Check: `node --test test/lab.test.mjs`.
- **World** (`world/`). `policy.mjs` (allowlists, cached per policy object),
  `senses.mjs`, `actuators.mjs` (http, fs, proc, clock), `trace.mjs`. Nothing acts without
  an approved proposal. Check: `node --test test/world.test.mjs`.
- **Runtime** (`runtime/`). `fast.mjs`, `kernels.mjs`, `partition.mjs`, `shard.mjs`,
  `cluster.mjs`, `protocol.mjs`. `node bench/speed.mjs`, `node bench/parallel.mjs` and
  `node bench/throughput.mjs` write the verdicts. Check: `node --test test/runtime.test.mjs
  test/speed.test.mjs`.
- **CLI** (`bin/brain.mjs`, `cli/`). `node bin/brain.mjs help` prints every command;
  `live` is the whole organism as one persistent process. Check:
  `node --test test/cli.test.mjs`.
- **Viz and web** (`viz/`, `web/`). `node bin/brain.mjs viz <name>` serves the brain-shaped
  view; `node web/build.mjs` builds `web/dist`, which `node tools/deploy.mjs` publishes to
  dilation.dev. Check: `node --test test/viz.test.mjs test/web.test.mjs`.
- **The whole organism** (`seeds/whole.mjs`, `organism/`). Nine regions, the reflex arc,
  and the emitted organism source under `organism/`. `node bench/whole.mjs`,
  `node bench/scale.mjs` and `node bench/substrate.mjs` write the verdicts. Check:
  `node --test test/whole.test.mjs test/substrate.test.mjs test/invariants.test.mjs`.

## 13. How to check any claim in this document

One command prints one verdict over every test file: `node bench/gate.mjs`. It also refuses
an em dash in my prose or code (his verbatim text in `MANUAL.md` and `manual/` is exempt)
and an import that points nowhere. Every number in any document comes from a file under
`bench/verdicts/` and is indexed in `docs/NUMBERS.md` by `node tools/numbers.mjs`; a
figure that is not in that table may not appear anywhere. The event traces in sections 10
and 11 reproduce with `node --input-type=module -e "..."` against `seeds/basic.mjs` as
shown there.
