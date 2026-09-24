# runtime: what the parallel runtime needs from core, and where it diverges

`runtime/` shards one brain across `worker_threads`. It never edits `core/`. This file is
the request list and the honest list of what sharding does not reproduce exactly.

## The core change I want

**A structural hook on `Brain`.** Today `Brain.tick()` runs, at the end of every tick, a
block that is not reachable from outside: `coact.observe(fired, connectome, rng)`, the
`edge.grow` proposals it turns into, the `pruneEvery` sweep of `edge.prune` proposals, the
`coact.decay()` at `t % 64 === 0`, `stats.ticks++` and `clock.advance()`.

A cluster must run that block **once for the whole brain**, not once per shard: growth is a
global co-activation question and two cells that fired in the same tick may sit in
different threads. So `runtime/cluster.mjs` keeps a "shadow" Brain that is never ticked,
and `Cluster._structural(t, fired)` duplicates that block against it line for line. That
duplicate is the single most fragile thing in this subsystem: it has already had to absorb
`coact.enabled`, `connectome.arrival(e, t)` and the `gate` constructor option, and it will
break again the next time the block changes.

Exact request:

```js
// core/brain.mjs
class Brain {
  // called by tick() with the fired list, after delivery and before clock.advance().
  // Default body is the existing structural block, moved verbatim.
  _structural(t, fired) { ... }
}
```

That is all. With `_structural` public-ish, the cluster calls
`shadow._structural(t, globalFiredList)` and the duplication disappears. Nothing else in
`core/` needs to change: `_emit`, `_schedule` and `_deliver` are already overridable, and
`runtime/shard.mjs` overrides exactly those three.

Meanwhile the workaround is in place and is tested against the single process Brain
(`test/runtime.test.mjs`, first test: 200 cells, 30 ticks, 2 and 4 shards, per cell run
counts and `grown` identical to the reference).

## Divergences, deliberate and documented

1. **Delivery order inside a tick bucket.** One process drains `inflight[t]` in insertion
   order, which is global emission order. A shard cannot see the global emission order, so
   every cluster sorts a bucket by `(emit tick, global source cell, source port, global
   edge)` (`ordKey` in `protocol.mjs`). That order is a pure function of the wiring, so 2
   shards and 16 shards agree with each other exactly; it is **not** guaranteed to equal
   the single process order. What is exact: which signals arrive, on which tick, with which
   weight, and therefore every run count, fire count, signal count and delivery count. A
   cell whose `compute` depends on the order of its inbox rather than its contents would
   see a difference. `bench.relay` bundles its inbox, so it does not.
   **SUPERSEDED 2026-09-16**: such a cell was found (`predict.next` reads only its first
   input), the order was made exact, and a bucket no other thread wrote is no longer sorted
   at all. See "Divergence 1 is closed" below for the measurement.

2. **Ledger sequence numbers.** Each shard has its own `Ledger` and its own `seq` space.
   Cluster level ledger entries (grow, prune) live on the coordinator's shadow. There is no
   single merged, totally ordered ledger.

3. **`connectome.into(cell)` at a destination shard includes ghost edges.** A cross shard
   edge that lands on shard `d` is materialised there as a DORMANT edge whose source is a
   node index no cell occupies, so that core's hebbian rule can move its weight exactly as
   it would in one process. The moved weight is written back to the owning shard every
   tick. Anything that walks `into()` and does not filter on `ACTIVE` will see these.

4. **Region budgets under a split region.** The unit of partition is a region. When more
   shards are asked for than there are regions the unit drops to `region/circuit`, and a
   region split that way has its per tick `Scheduler` budget enforced once *per shard*, so
   a region with a finite budget can run up to `shards` times its budget. Every region in
   the benched and tested specs has an infinite budget (the default), which is the only
   case the tests cover. Splitting a finite budget region is **not supported**; pass an
   explicit `partition` that keeps such a region whole. A guard that refuses it belongs
   here and is not written yet.

5. **Growth is decided by the coordinator, not the shards.** Shard Brains are constructed
   with `growth: { ..., enabled: false }`. A shard that grew on its own local co-activation
   would invent edges the single process brain never grows.

## Answered in core (2026-09-16, later)

Brain._structural(t, fired) exists: the growth, decay and prune block moved into it verbatim and tick() calls it after the run loop. core 15/15, runtime 5/5 after the change. The cluster can now call shadow._structural(t, globalFired) and delete its copy.

## Speed pass (2026-09-16): what changed, and what core is asked for next

### The `_structural` request is answered and used

`runtime/cluster.mjs` no longer duplicates the block. `Cluster._structural(t, fired)` sets
the shadow's `ctx.t`/`ctx.gen`, records `connectome.size()`, calls `shadow._structural(t,
fired)`, and then routes every edge that appeared after that mark to the one or two shards
that own its endpoints. The shadow is built with `pruneEvery = 0` on purpose: it is never
ticked, so it has no usage counters, and core's prune sweep would read every edge as stale
and prune the whole brain. `spec.pruneEvery` still drives pruning inside the shards and the
coordinator's own cross edge sweep.

### Divergence 1 is closed: a bucket is now drained in the one process order

The note below said the sorted bucket order was "not guaranteed to equal the single process
order". It was not, and on a rewiring brain it was visibly not. Measured on a 320 cell
organism (40 majors, growth on, 50 ticks), against one `Brain`:

* ranking a source by its raw global cell index: 2 shards grew 1765 edges by tick 24 where
  one process grew 1743, and cell `as.0010.1` (a `predict.next`) ran 13 times against 12.
  The cause is not the count of signals but which one arrives first: `predict.next` reads
  `first(ins[0])` and throws when the kind changes under it, so a reordered inbox changes
  the error count, the fired list, the co-activation pairs and therefore the growth.
* the single process order is the order the emitting cells RAN, and that is not the due
  list: `Scheduler.allocate` buckets the due cells by region and emits region by region
  **even when every budget is Infinity**. So the run order is (region first appearance,
  period, index), not (period, index) and certainly not (index).

Two fixes, both in `runtime/`:

1. `runtime/shard.mjs` precomputes `ordRank[globalCell]` from `(region, canonicalKey)` once
   at boot and `ordKey` now takes that rank instead of the raw index.
2. a bucket is sorted **only if something from another thread landed in it**
   (`ShardBrain.mixedTicks`). A bucket filled entirely by this shard is already in core's
   emission order, and sorting it replaced a correct order with a reconstructed one.

Result, all printed by `node --test test/speed.test.mjs` and by the diagnostics behind it:
1, 2 and 4 shards end 50 ticks with identical per cell run and fire counts, identical
`runs`, `signals`, `delivered`, `grown` (3894) and `errors` (189) against one process, with
growth rewiring the brain the whole time; 8 shards stay identical over 120 ticks.

What is still approximate: the region rank is computed once from every cell, while core
recomputes "first appearance" from the cells due on that tick. Those two agree unless a
region's earliest cell is not due on a tick where a later region's is. No case of that has
been observed on the organism or on the test fixture, and if one appears the fix is for the
coordinator to ship the per tick region order with the tick command.

### `FastBrain` had the same bug, and it is the reason the hook matters

`runtime/fast.mjs` skips `scheduler.allocate` when no region has a finite budget. That was
wrong for the same reason: `allocate` is not a no-op when nothing is rationed, it regroups.
Running in raw due order grew 4105 edges where core grew 4096 on the same fixture. It now
reproduces the grouping itself (`FastBrain._byRegion`), and 50 ticks of `FastBrain` end with
the same `stats` object, the same per cell counts and the same edge weights as `Brain`.

### Requests for core

1. **Memoize the seeded hypervectors in `core/signal.mjs`.** `--cpu-prof` on the organism
   says one kind, `encode.time`, was 83.20% of all compute at 1711.8 us per run, and the
   whole of that cost is regenerating deterministic vectors from a seed on every run
   (`hvFromSeed` through `S.bind`/`S.bundle` of `role(label)` and the bucket vectors).
   `runtime/kernels.mjs` works around it by caching the finished per label part in a Map:
   24 entries plus 4 roles is 229376 bytes on the organism, and it took the single process
   from 0.632 to 1.989 ticks/s by itself. A seeded vector is immutable by construction, so
   the cache belongs in `core/signal.mjs` where every caller gets it, with the WeakSet that
   `bipolar()` already keeps as the model.
2. **Let a runtime subclass the tick.** `runtime/fast.mjs` had to copy `runCell` out of
   `core/cell.mjs` to take the kind from a table instead of a Map, and to copy `_tick` to
   reuse mailboxes. If `Brain` exposed the due list and the run of one cell as overridable
   methods (`_due(t)` and `_runCell(cell, ins)`), `FastBrain` would be about 60 lines and
   `ShardBrain` could extend it, which is the only reason the shards are not running the
   fast tick today.
3. **`predict.next` cannot be snapshotted after its input kind changes.** `serialize`
   does `s.history.map(h => S.dataToJSON(s.kind, h))` with the LAST kind seen, so a history
   holding both a `num` and an `hv` throws `The first argument must be of type string or an
   instance of Buffer` out of `dataToJSON`. Hit while snapshotting a shard of the 320 cell
   fixture. The state should carry the kind per history entry.
4. **A signal kind index.** `runtime/protocol.mjs` needs `KINDS.indexOf(kind)` on the hot
   path to put a non typed array payload in the shared arena (`JSON_CODE`); a frozen
   `KIND_INDEX` map in `core/signal.mjs` would save the scan.

## Where the 4.57x to 100x is not, and where it is (measured 2026-09-17)

Three measurements in order, each one deciding what the next one had to be.

### 1. The ceiling says it is not the partition

The 32 shard arm was run again with the cut forced to zero, two ways, because deleting a
cross edge also deletes its deliveries and would have measured a lighter brain: `--cut zero`
deletes them, `--cut rewire` moves each cross edge's destination to a cell of the same kind
inside the source's shard and only deletes the ones whose kind is absent there. Both numbers
and both edge counts are printed by `node bench/speed.mjs` and stored in
`bench/verdicts/speed.json`. The conclusion did not depend on which one you read: the
ceiling is about a third of perfect linear, while 100x of baseline needs three quarters of
it. A better partitioner divides the wrong term, so the multilevel coarsen and uncoarsen
pass was not built.

### 2. The fence split says it is not the fence either

`runtime/shard.mjs` now writes two counters per shard per tick into the control block
(`SH.BUSY_US`, `SH.DRAIN_US`), and `runtime/cluster.mjs` times its own five phases
(`coord.roundTripUs`, `replyUs`, `firedUs`, `structUs`, `pruneUs`). Wall time per tick minus
the LARGEST shard's busy time is what the fence costs; the largest minus the mean is the
straggle. The tick budget printed by the bench splits one tick into shard compute, shard
drain, straggle, coordinator serial work and dispatch, and the largest overhead slice is the
coordinator's own serial work, which is `Brain._structural` on the shadow brain. No shard
count divides it and no K tick window removes it, so fence amortisation was not built
either. The delay ring proof was still computed and is printed: the cut delay histogram at
32 shards gives the largest exact K, and the number of edges that would have to move
in-shard to reach K=2 and K=3.

### 3. The profile says it is the work per cell run, and names one primitive

With the instrument cost subtracted, cell compute is about four fifths of the tick, and
inside it the hypervector kinds are the great majority. Two things came out of taking the
hottest one apart, and both are now in `runtime/kernels.mjs`:

**`hv.bundle` is a weighted sum, and core's 16 lane kernel cannot have it.** The profile arm
counts the organism's own inboxes: of 66422 calls, 8.81% carry the same weight for every
member and 0% carry weight 1, mean 5.12 members, max 18. A weighted majority with unequal
weights is a different answer from an unweighted one, so 91.19% of calls must stay scalar.
What was left to win was the memory access pattern. `node bench/speed.mjs --arm bundlekernel`
times five loops that produce the same lanes in the same order, and blocking the lanes into
1024 lane chunks so the accumulator stays in L1 won at every member count from 2 to 16. On
the organism, three runs each of `--arm profile --ticks 30`, ns per `hv.bundle` call:
interchanged 83272 / 78258 / 86541, blocked 71246 / 65515 / 74555. The two sets do not
overlap. The old loop is still in the file behind `BRAIN_BUNDLE_AB=interchanged` so the
comparison can be re-run rather than believed.

**`encode.vec` was paying for its own input read.** The kind writes `x[j] || 0` inside the
inner loop of a 8192 by nin projection, so every one of the 8192 * nin multiply adds re-read
a `Float32Array` at an index that may be past its end and ran the falsy test that maps NaN
and -0 to +0. Reading the input once into a dense row of doubles, with the same falsy test
per element, took it from 180167 to 42751 ns per call on the organism, a 4.21x, with the
same terms in the same order so every row's sign is the same bit. It is now the fifth entry
in `KERNELS`, and `test/speed.test.mjs` grades it on a full vec, a short vec, an empty vec, a
NaN, a negative zero and an over long vec, lane for lane against the kind it replaced.

### A partition bug the weighted arms exposed

`refine` enforced its cap only on the destination of a move, so a shard the SEED had already
put over the cap stayed over it for ever: the weighted 8 shard run ended at 47.17 units of
weight against a cap of 42. `refine` now sheds first, moving cells out of an over cap shard
to the under cap shard where they have the most neighbours, before the cut passes run. It is
the one step allowed to raise the cut, so it is counted separately (`shed`) and the invariant
that no PASS raises the cut still holds and is still tested. The weighted and unweighted caps
were also unified onto one formula, so a weight vector of all ones is not merely close to the
unweighted run, it is the same arithmetic.

### What the two kernels were worth, and the arithmetic of the 3.99x that is left

Run of 2026-09-17T12:20:33.710Z, organism/gen-0, 50 ticks after 5 warm, 32 threads, node
v24.15.0, with two other agents benching on the same machine (the headline arm was run twice
and spread 1.106x, which is the noise band every claim below has to clear).

```
  baseline single process        18030 runs/s (0.717 ticks/s)
  optimised single process       85306 runs/s (3.394 ticks/s)  = 4.731x
  best shard count               32 shards at 463425 runs/s, over 1 shard = 5.297x
  measured end to end            25.703x
  gap to 100x                    3.99x still missing
  ceiling, 32 shards cut=0       867047 runs/s rewiring 45134 cross edges and deleting 71305
  perfect linear, no barrier     2729792 runs/s (32 x the optimised single process)
  parallel efficiency at 32      needed for 100x=66%  ceiling with zero cut=31.8%  measured=17%
```

The one line that decides the next build is the last one. To reach 100x of baseline from the
optimised single process, 32 threads would have to hold 66% of perfect linear. With NOTHING
crossing a thread they hold 31.8%. No partitioner can close that, so the remaining factor has
to come out of the work per cell run.

The tick budget says where a 32 shard tick goes: shard compute 26.5%, straggle 23.6%,
dispatch and wake up 23.0%, drain of cross messages 13.1%, coordinator serial work 13.8%,
unaccounted 8.5us of 61997.5us. Seven weighted arms were run against the straggle and none of
them cleared the 1.106x noise band; the pure cost weights lost outright because they push the
cell count imbalance to 7.599 (a weight predicts compute, a shard busy tick is compute plus a
drain that scales with the cells and edges the shard holds). Blending the two rulers at
`--blend 0.5` gave the lowest straggle of any arm in two runs in a row (6134.2us against
14613.9us unweighted, and 8469.6us against 13887us in the run before it) without unbalancing
the cell count, so the blend is the shape a work weight has to have. It buys straggle, not
runs per second, on this machine.

The one lever left is priced from two arms:

```
  a weighted lane sum costs      1.007ns per lane multiply add (bundlekernel arm, 5 members)
  the 16 lane wasm kernel        0.08ns per lane (hvbundle arm, 8 members, unweighted) = 12.59x faster
  hypervector kinds hold         85.6% of cell compute, which is 77.1% of the tick
  upper bound, at 12.59x a lane  removes 60.8% of the tick = 2.55x single, 65.54x end to end
  f64x2 bound, at 2x a lane      removes 33% of the tick = 1.49x single, 38.3x end to end
  dense shaped kinds are worth   3.1% of compute
```

So even the upper bound, every hypervector kind running at the rate core's existing 16 lane
kernel already reaches, lands at 65.54x end to end and is 1.53x short of 100x. The dense
shaped kinds (every port in num, event, sym) are 44% of the organism's RUNS but 3.1% of its
compute, so compiling those into `core/substrate.mjs` is worth at most 3.1% of the tick and
is not the lever, which is the opposite of what the run share suggests.

### Requests for core, from this round

5. **Let the hypervector lanes live in the wasm heap.** The measured gap between a scalar
   weighted lane sum and the 16 lane kernel is over 12x, and the weighted bundle cannot use
   the kernel both because it is a weighted sum and because a wasm call would have to copy
   the members into linear memory first. If `hv` signal data were allocated inside
   `core/simd.mjs`'s memory rather than as plain `Int8Array`s, a weighted f64x2 accumulate
   would run with no copy, and every other hv kind would get the same. This is the single
   biggest number on the board and it is a core representation decision, not a runtime one.
6. **A cheap way to say a vector is bipolar by construction.** `bundle()`'s SIMD path is
   guarded by a scan of every lane of every member, cached in a `WeakSet` keyed on the vector
   object, so FRESH members pay it: at 8 members the guard is 97.8% of the call (252.76us
   fresh against 5.47us warm and 5.32us for the kernel itself). Every vector core's own
   `bundle`, `bind`, `permute` and `hvFromSeed` produce is bipolar by construction. Marking
   them at birth would make the guard free for the whole system.
