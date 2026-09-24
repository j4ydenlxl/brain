# BRAIN Glossary

Vocabulary used across the codebase and the research notes, one paragraph each, tied to
where the term lives in code (`brain/core/*.mjs`) or, for planned subsystems, to
`brain/DESIGN.md`. Where a term names something not yet built, that is stated.

---

**primitive.** A small, pure, stateless operation with a manifest of accepted signal
kinds, produced kind and cost, defined once in `core/primitives.mjs` via the `def(name,
manifest, fn)` helper. The current vocabulary is sixteen primitives: `transform`,
`compare`, `bind`, `bundle`, `permute`, `aggregate`, `integrate`, `count`, `verify`,
`route`, `gate`, `predict`, `simulate`, `remember`, `retrieve`, `evaluate`. Primitives
hold no state of their own; a cell composes one or more primitives and supplies the
state. The design goal (`DESIGN.md` section 3) is a vocabulary small enough to read in
one file and general enough that new cell kinds are built by composition rather than by
adding new primitives.

**cell.** The fundamental execution unit, `{ id, idx, kind, region, circuit, ports,
params, policy, state, memory, stats, mailbox }`, created by `createCell` in
`core/cell.mjs`. A `kind` is a registered type (`defineKind` in the same file) supplying
`compute(ins, cell, ctx)` and optionally `learn`, `predict`, `serialize`, `deserialize`.
A cell declares the signal kinds each port accepts; `runCell` refuses an output on the
wrong kind at run time, and `Brain.connect` refuses a wire between incompatible ports at
wiring time, so a type error cannot enter the connectome silently. `cells/basic.mjs` is
the first library of concrete kinds (`encode.hv`, `num.compare`, `sym.solve`,
`vec.mlp`, `predict.next`, `memory.assoc`, and others), each built from the primitives.

**circuit.** A named set of cells inside a region plus a working-memory ring and a
period, `{ key, name, region, period, doc, cells, working }`, created by
`Brain.addCircuit` in `core/brain.mjs`. `seeds/basic.mjs` groups cells into circuits such
as `perception/text`, `association/integrate`, `cognitive/exact` and `cognitive/algebra`.
When a cell in a circuit fires, the circuit's `working` ring keeps the last 32
`{ t, cell }` records, giving each circuit a short window of its own recent activity
independent of the ledger.

**region.** A set of circuits plus a per-tick attention budget and a broadcast bus,
`{ name, budget, doc, circuits, cells, bus }`, created by `Brain.addRegion`. The seed
brain in `seeds/basic.mjs` instantiates five: `perception`, `association`, `cognitive`,
`motor`, and `memory`, matching the layer names in the owner's reference image
(`MANUAL.md` section A). A region with `budget: Infinity` runs every due cell; a finite
budget makes the region's due cells compete through the scheduler (see budget, below).

**connectome.** The first-class, typed-array edge store implemented by the `Connectome`
class in `core/connectome.mjs`: parallel arrays `src, dst, srcPort, dstPort, w, delay,
usage, lastT, conf, flags` indexed by edge number, with a lazily built CSR-style index
(`_bySrc`, `_byDst`) so `outOf(node)` and `into(node)` are slices, not scans. Edges carry
a learned weight `w`, a delay in ticks, usage and last-touch statistics, a confidence
value and status flags (`ACTIVE`, `DORMANT`, `PRUNED`). Strengthening and weakening a
weight (Hebbian: `dW = eta*pre*post - alpha*W`, the fly's rule, source 03 in
`research/batch-1.md`) happen freely during a tick; growing, pruning or replacing an edge
are structural changes and go through the gate as Proposals (`Brain._tick` in
`core/brain.mjs`), so every topology change is a logged decision, not a silent write.

**signal.** The single wire format that moves between cells, `{ kind, data, t, gen, src,
port, seq }`, constructed by `signal()` in `core/signal.mjs`. `kind` is one of the six
signal kinds (see quantum, below); `t` and `gen` are the two clock stamps; `src` and
`port` name the emitting cell and out-port; `seq` is the ledger sequence number of the
event that produced it, or -1 for an externally injected signal. A signal is the unit
the ledger's `trace()` walks: every `cell.run` event lists the `seq`s of the signals it
consumed, so a signal's `seq` is also a pointer backward through provenance.

**quantum.** The project's name (`DESIGN.md` section 1, "tokens to quanta") for the idea
that information should be typed and exact where exactness matters, rather than
serialized to subword text. Concretely, the quantum is the `kind` field of a signal: `hv`
(hypervector), `sdr` (sparse distributed representation), `num` (an exact BigInt
rational, never text), `sym` (an algebraic expression tree evaluated exactly), `vec`
(a dense Float32Array activation), or `event` (a structured object for control and
external I/O). The choice is sourced to what large language models get wrong with
numbers, byte-pair encoding fragments digits and loses place value (source 11,
arXiv 2608.13129, `research/batch-1.md`); a `num` signal cannot lose place value because
it is never tokenized.

**hypervector (hv).** A bipolar `Int8Array` of length `D = 8192` (`core/signal.mjs`),
one of the six signal kinds. Two random hypervectors are quasi-orthogonal (similarity
near 0). Three operations compose them: `bind` (elementwise product, self-inverse, binds
a role to a filler), `bundle` (weighted majority sum, superposition of several concepts
into one vector that remains similar to each member), and `permute` (cyclic roll, marks
sequence position). `hvSequence` chains permute and bundle to encode an ordered sequence.
`ItemMemory` is the codebook: named hypervectors with nearest-neighbour cleanup. The
design is sourced to hyperdimensional computing / vector symbolic architecture surveys
(source 13, arXiv 2111.06077, `research/batch-1.md`).

**sdr (sparse distributed representation).** The second signal kind: `{ n, idx }`, a
sorted `Uint32Array` of active indices out of `n` possible positions, implemented in
`core/signal.mjs` (`sdr`, `sdrOverlap`, `sdrUnion`, `sdrFromVec`, `sdrFromHv`). It is the
cheap wire format: comparing two SDRs is an intersection of sorted arrays rather than a
dot product over thousands of dimensions. Sourced to sparse distributed representation
and HTM research (source 24, Ahmad and Hawkins, arXiv 1503.07469,
`research/batch-1.md`).

**tick.** One unit of the wall-clock axis of the two-axis `Clock` in `core/clock.mjs`
(`t`, base unit 1 ms logical). Every cell has a `policy.period`, either a positive
integer number of ticks or the string `'event'`; the clock's tick wheel (`due(t)`)
returns exactly the periodic cells scheduled for tick `t` without scanning every cell,
and `Brain._tick` separately checks event cells for a non-empty mailbox. A `Brain.tick(n)`
call advances the wall axis by `n` ticks, delivering in-flight signals, running due
cells, routing their outputs, and running the growth and pruning gate checks on schedule
(`pruneEvery`, default 1000 ticks).

**generation.** The second axis of the two-axis clock, `gen`, advanced independently of
wall ticks by `Clock.advanceGen()`; every signal is stamped with both `t` and `gen`
(`DESIGN.md` section 6, "warped time"). The generations engine that will drive `gen`
forward through populations of genomes, the mechanism the owner calls "millions of years
in five minutes", is a planned subsystem (`DESIGN.md` section 11); as of this writing the
clock's `gen` counter exists and is threaded through every signal and ledger event, but
nothing yet advances it except a direct call to `advanceGen`. Design references: NEAT
speciation and innovation numbers (source 10, Stanley 2002) and the Darwin Godel Machine
archive (source 04, arXiv 2505.22954), both in `research/batch-1.md`.

**proposal.** A request for a structural or authority-gated change, `{ id, kind, what,
why, evidence, by, t, gen, status }`, created by `Gate.propose()` in `core/gate.mjs`. The
nine proposal kinds are `edge.grow`, `edge.prune`, `edge.replace`, `cell.add`,
`cell.remove`, `cell.rule`, `region.add`, `external.action`, `genome.promote`. Every
proposal is appended to the ledger before it is decided, and every decision (`approved`,
`rejected`, or `held` for a human) is appended after, so the gate's own history is fully
in the ledger, not a side channel.

**gate.** The subsystem, implemented by the `Gate` class in `core/gate.mjs`, that
separates computation from authority (`DESIGN.md` section 10, sourced to the Darwin
Godel Machine's empirical validation step, source 04): a cell or the co-activation
tracker can propose a change, but only the gate's policy decides whether it happens. The
`defaultPolicy` function approves `edge.grow` only with at least 8 recorded
co-activations, approves `edge.prune` only when an edge is both stale (unused at least
`pruneEvery` ticks) and weak (`|w| < 0.05`), approves `genome.promote` only when a fitness
gain beat a control, and holds every other kind for a human; three kinds
(`external.action`, `cell.rule`, `region.add`) are always held for a human regardless of
policy (`humanRequired` in the `Gate` constructor). Nothing in `core/brain.mjs` grows or
prunes an edge without going through this gate.

**ledger.** The append-only observability log, implemented by the `Ledger` class in
`core/ledger.mjs`: every event gets a monotonic `seq`, is kept in an in-memory ring
buffer of configurable size, and (when a directory is configured) is flushed to
`ledger.jsonl` in batches. Event types include `cell.run` (with the `seq`s of consumed
signals), `signal`, `edge.add`, `edge.prune`, `proposal`, `decision`, `region.add`,
`circuit.add`, `cell.add`, `snapshot`, and `restore`. `Ledger.recent(n, type)` reads
backward from the current sequence; `Ledger.get(seq)` reads one event from the ring or,
falling back, by scanning the JSONL file.

**trace.** The provenance walk, `Ledger.trace(seq, depth)` in `core/ledger.mjs`. Starting
from one event's `seq`, it follows the `consumed` list on `cell.run` events (or the
single `from` pointer on `signal` events) upstream, depth-limited and deduplicated, and
returns every node and edge visited. Because a `cell.run` event's `consumed` array holds
the exact `seq`s of the signals that fed it, and each `signal` event names the `cell.run`
that emitted it, `trace()` reconstructs the exact chain of cells, edges and prior
predictions behind any one output, an implementation of the manual's requirement that a
researcher "trace an important result backward through the computational graph"
(`MANUAL.md` section A).

**surprise.** A per-cell scalar, `cell.stats.surprise`, set by a cell's own compute logic
(for example `predict.next` in `cells/basic.mjs` sets it to the prediction error, and
`vec.mlp` sets it to the training error) and read by the scheduler's bid function
(`Scheduler.bid` in `core/scheduler.mjs`: `priority * (1 + surprise) * (1 + pending)`).
A cell whose recent predictions were wrong bids higher for its region's budget on the
next due tick, which is the concrete mechanism behind the design's "resources toward
uncertain predictions" (`DESIGN.md` section 10, sourced to predictive-coding style
surprise-driven priority, source 06, Nested Learning / Hope, `research/batch-1.md`).

**budget.** The per-region resource limit checked once per tick by `Scheduler.allocate`
in `core/scheduler.mjs`. Due cells in a region are sorted by bid (see surprise, above)
and funded in order until the region's `budget` (a count against each cell's
`policy.budget` cost) is spent; the rest are skipped for that tick and keep their
mailbox for the next time they are due. A region created with `budget: Infinity` (the
default) never skips a due cell. This is the attention economy of `DESIGN.md` section
10, sourced to Hyperon's ECAN currency-based attention allocation and the Global
Workspace selection-broadcast cycle (sources 08 and 21, `research/batch-1.md`).

**consolidation.** The planned mechanism by which frequently useful information becomes
more persistent or abstract while transient information compresses or decays
(`DESIGN.md` section 8, `MANUAL.md` section A). The seed brain (`seeds/basic.mjs`)
reserves a `memory` region with a slow cell (`m.consolidate`, period `MIN`) as a
placeholder for this; as of this writing that cell only logs, it does not yet bundle or
compress anything. The intended mechanism, slow cells bundling frequent items upward
while decay compresses infrequent items downward, is not yet implemented; it is listed
as a planned subsystem in `ARCHITECTURE.md`.

**species.** A planned grouping mechanism of the generations engine (`DESIGN.md` section
11): genomes in a population are clustered into species so that a structurally new
genome is compared against others of similar topology rather than against the whole
population, protecting new structural innovations from being outcompeted before they are
tuned. Sourced to NEAT (source 10, Stanley 2002, `research/batch-1.md`). Not present in
`core/` as of this writing; no code implements speciation yet.

**archive.** A planned open-ended search structure for the generations engine
(`DESIGN.md` section 11): rather than replacing the whole population every generation, an
archive of past genomes is kept and sampled as parents, so useful structure is not lost
to short-term selection pressure. Sourced to the Darwin Godel Machine's archive-based
search (source 04, arXiv 2505.22954, `research/batch-1.md`) and to AlphaEvolve's
evolutionary database (source 05, arXiv 2506.13131, `research/batch-1.md`). Not present
in `core/` as of this writing.

**island.** A planned partitioning of the archive (`DESIGN.md` section 11, "islands,
MAP-Elites style") into separate sub-populations that evolve mostly independently and
occasionally exchange genomes, a standard technique for keeping an evolutionary search
diverse rather than converging early to one solution. Sourced to AlphaEvolve / OpenEvolve
/ CodeEvolve (source 05, `research/batch-1.md`). Not present in `core/` as of this
writing.
